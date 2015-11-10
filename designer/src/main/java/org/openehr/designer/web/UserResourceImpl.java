package org.openehr.designer.web;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.google.common.io.ByteStreams;
import com.google.gson.Gson;
import com.jcraft.jsch.Session;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.apache.commons.codec.binary.Base64;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.AdlParserException;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.designer.ArchetypeInfo;
import org.openehr.designer.Configuration;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.repository.AbstractArchetypeRepository;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.jaxb.am.Archetype;
import org.openehr.jaxb.am.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;
import sun.misc.BASE64Decoder;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.swing.text.html.parser.Entity;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by Denko on 10/27/2015.
 */
@RequestMapping(value = "")
@Controller
public class UserResourceImpl implements UserResource {
    private static final Logger LOG = LoggerFactory.getLogger(UserResourceImpl.class);

    //Map<String, String> activeUsers = new HashMap<String, String>();

    private ObjectMapper objectMapper = new ObjectMapper();
    private Gson gson = new Gson();
    private RestTemplate restTemplate = new RestTemplate();

    @RequestMapping(method = RequestMethod.GET, value = "/template-editor")

    public ModelAndView displayTemplateEditor(HttpServletRequest req, HttpServletResponse res) {

        HttpSession session = req.getSession();
        if (session.getAttribute("Token") == null || session.getAttribute("Repo") == null) {
            ModelAndView result = new ModelAndView("Login");
            return result;
        }

        ModelAndView result = new ModelAndView("template-editor");
        result.addObject("Repositories", session.getAttribute("FilteredRepos"));
        result.addObject("CurrentRepo", session.getAttribute("Repo"));
        return result;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/RepositoryProvider")
    public ModelAndView displayTest(HttpServletRequest req) throws Exception {
        HttpSession session = req.getSession();

        String username;

        String repo = req.getParameter("repo");

        Boolean fork = Boolean.valueOf(req.getParameter("fork"));

        if (req.getSession().getAttribute("Token") != null) {

            RestTemplate restTemplate = new RestTemplate();

            String token = req.getSession().getAttribute("Token").toString();
            Map res = restTemplate.getForObject("https://api.github.com/user?access_token=" + token, Map.class);

            if (fork)
                username = "master";
            else
                username = (String) res.get("login");

            RepositoryProvider.userToArchetypeRepositoryMap.remove(res.get("login"));
            RepositoryProvider.userToTemplateRepositoryMap.remove(res.get("login"));

            HttpHeaders headers = new HttpHeaders();
            session.setAttribute("Username", username);
            session.setAttribute("Repo", repo);
            headers.set("Authorization", "Bearer " + token);
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
            HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);

            ResponseEntity<Object[]> response = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/archetypes?ref=" + username, HttpMethod.GET, httpEntity, Object[].class);
            ResponseEntity<Map> existing;
            String content = "{}", sha = null;
            try {
                existing = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/ArchetypesMetadata.json?ref=" + username, HttpMethod.GET, httpEntity, Map.class);
                content = decodeContent(existing.getBody().get("content").toString().replace("\n", "").replace("\r", ""));
                sha = existing.getBody().get("sha").toString();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() != 404) {
                    throw e;
                }/**/
                //We need to create it
            }
            //String dec = existing.getBody().get("content").toString().replace("\n","").replace("\r","");

            Set<String> names = new HashSet<>();
            Map<String, Map> metadata = objectMapper.readValue(content, Map.class);

            try {

                names = Sets.newHashSet(metadata.values().stream()
                        .map(m -> (String) m.get("filename"))
                        .collect(Collectors.toSet()));
            } catch (Exception e) {
                //ignore, file does not exist.
            }


            Base64 k = new Base64();
            //String metadata = k.encodeToString(existing.getBody().get("content").toString().getBytes()).replace("\r", "").replace("\n", "");

            Object[] listArchetypes = response.getBody();
            int failed = 0;
            JSONObject arr = new JSONObject();
            AdlDeserializer serializer = new AdlDeserializer();
            int fileIndex = 0;
            while (fileIndex < listArchetypes.length) {
                Object o = listArchetypes[fileIndex];
                String name = null;
                try {

                    JSONObject ob = new JSONObject(gson.toJson(o));
                    String download_url = (String) ob.get("download_url");
                    name = (String) ob.get("name");
                    String path = (String) ob.get("path");

                    if (name.endsWith(".adls")) {
                        if (!names.contains(name)) {
                            Archetype v = serializer.parse(downloadHelper(download_url));
                            ArchetypeInfo i = AbstractArchetypeRepository.createArchetypeInfo(v);

                            String id = v.getArchetypeId().getValue();
                            JSONObject currentArchetype = new JSONObject();
                            currentArchetype.put("id", i.getArchetypeId());
                            currentArchetype.put("languages", new JSONArray(i.getLanguages()));
                            currentArchetype.put("rmType", i.getRmType());
                            currentArchetype.put("name", i.getName());
                            currentArchetype.put("filename", name);
                            currentArchetype.put("path", path);
                            arr.put(id, currentArchetype);
                        } else {
                            String name2 = name;
                            Map.Entry<String, Map> metadataEntry = metadata.entrySet().stream().filter(m -> m.getValue().get("filename").equals(name2)).findFirst().get();
                            Map<String, Object> metadataMap = metadataEntry.getValue();
                            arr.put(metadataEntry.getKey(), metadataMap);

                        }
                    }
                    fileIndex++;

                } catch (AdlParserException e) {
                    //TODO: Clean the ones that failed from the folder
                    failed++;
                    LOG.warn("Error parsing archetype " + name, e);
                    fileIndex++;
                } catch (FileNotFoundException e) {
                    //The token expired and we have to make new request for fresh token
                    response = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/archetypes", HttpMethod.GET, httpEntity, Object[].class);
                    listArchetypes = response.getBody();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }

            }


            String encoded = k.encodeToString(arr.toString().getBytes()).replace("\r", "").replace("\n", "");

            org.json.simple.JSONObject r = new org.json.simple.JSONObject();
            r.put("message", "Created on: " + new Date().toString() + " by " + username);
            r.put("content", encoded);
            r.put("branch", username);
            r.put("sha", "");

            headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);


            if (sha != null) {
                //File exists, we need the SHA to update it
                r.put("message", "Updated on: " + new Date().toString() + " by " + username);
                r.put("sha", sha);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<?> entity = new HttpEntity<>(r.toJSONString(), headers);
            restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/ArchetypesMetadata.json", HttpMethod.PUT, entity, String.class);

            /******************************/


            httpEntity = new HttpEntity<>("parameters", headers);
            response = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/templates?ref=" + username, HttpMethod.GET, httpEntity, Object[].class);

            content = "{}";
            sha = null;
            try {
                existing = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/TemplatesMetadata.json?ref=" + username, HttpMethod.GET, httpEntity, Map.class);
                content = decodeContent(existing.getBody().get("content").toString().replace("\n", "").replace("\r", ""));
                sha = existing.getBody().get("sha").toString();
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() != 404) {
                    throw e;
                }/**/
                //We need to create it
            }
            //String dec = existing.getBody().get("content").toString().replace("\n","").replace("\r","");

            names = new HashSet<>();
            metadata = objectMapper.readValue(content, Map.class);

            try {

                names = Sets.newHashSet(metadata.values().stream()
                        .map(m -> (String) m.get("filename"))
                        .collect(Collectors.toSet()));
            } catch (Exception e) {
                //ignore, file does not exist.
            }
            ;

            //JSONObject metadata = new JSONObject();
                /*try{
                    metadata = new JSONObject(gson.toJson(downloadFileRaw("https://api.github.com/repos/"+repo+"/contents/metadata.json",token, username)));
                }
                catch(Exception e){

                }*/


            //String metadata = k.encodeToString(existing.getBody().get("content").toString().getBytes()).replace("\r", "").replace("\n", "");

            Object[] listTemplates = response.getBody();
            failed = 0;
            arr = new JSONObject();
            fileIndex = 0;
            while (fileIndex < listTemplates.length) {
                Object o = listTemplates[fileIndex];
                String name = null;
                try {

                    JSONObject ob = new JSONObject(gson.toJson(o));
                    String download_url = (String) ob.get("download_url");
                    name = (String) ob.get("name");
                    String path = (String) ob.get("path");

                    if (name.endsWith(".adlt")) {
                        if (!names.contains(name)) {
                            List<Archetype> list = TemplateDeserializer.deserialize(downloadHelper(download_url));


                            ArchetypeWrapper wrapper = new ArchetypeWrapper(list.get(0));

                            String templateId = list.get(0).getArchetypeId().getValue().toString();
                            String rmType = list.get(0).getDefinition().getRmTypeName();
                            String namex = wrapper.getTermText(list.get(0).getDefinition().getNodeId());

                            JSONObject currentTemplate = new JSONObject();
                            currentTemplate.put("id", templateId);

                            currentTemplate.put("rmType", rmType);
                            currentTemplate.put("name", namex);
                            currentTemplate.put("filename", name);
                            currentTemplate.put("path", path);
                            arr.put(templateId, currentTemplate);
                        } else {
                            String name2 = name;
                            Map.Entry<String, Map> metadataEntry = metadata.entrySet().stream().filter(m -> m.getValue().get("filename").equals(name2)).findFirst().get();
                            Map<String, Object> metadataMap = metadataEntry.getValue();
                            arr.put(metadataEntry.getKey(), metadataMap);

                        }
                    }
                    fileIndex++;

                } catch (AdlParserException e) {
                    //TODO: Clean the ones that failed from the folder
                    failed++;
                    System.out.println("" + failed + ": " + name + ": " + e.getMessage());
                    LOG.warn("Error parsing template " + name, e);
                    fileIndex++;
                } catch (FileNotFoundException e) {
                    //The token expired and we have to make new request for fresh token
                    response = restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/templates", HttpMethod.GET, httpEntity, Object[].class);
                    listTemplates = response.getBody();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }

            }


            encoded = k.encodeToString(arr.toString().getBytes()).replace("\r", "").replace("\n", "");

            r = new org.json.simple.JSONObject();
            r.put("message", "Created on: " + new Date().toString() + " by " + username);
            r.put("content", encoded);
            r.put("branch", username);
            r.put("sha", "");

            headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);


            if (sha != null) {
                //File exists, we need the SHA to update it
                r.put("message", "Updated on: " + new Date().toString() + " by " + username);
                r.put("sha", sha);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);
            entity = new HttpEntity<>(r.toJSONString(), headers);
            restTemplate.exchange("https://api.github.com/repos/" + repo + "/contents/TemplatesMetadata.json", HttpMethod.PUT, entity, String.class);

            if (session.getAttribute("Token") != null) {
                //user was already logged
            } else {
                session.setAttribute("Token", token);
                session.setAttribute("Username", username);
            }

        }


        return new ModelAndView("redirect:/template-editor");

    }

    @RequestMapping(method = RequestMethod.GET, value = "/AddRepository")
    public ResponseEntity<String> RepoAdder(HttpServletRequest req) throws Exception {
        //if(true)return new ResponseEntity<>("Repository added successfully!",HttpStatus.OK);
        HttpSession session = req.getSession();
        HttpHeaders headers = new HttpHeaders();
        String token = session.getAttribute("Token").toString();
        headers.set("Authorization", "Bearer " + token);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);
        ResponseEntity<Object[]> repos = null;
        Object[] directories;
        try {
            repos = restTemplate.exchange("https://api.github.com/repos/" + req.getParameter("value") + "/contents", HttpMethod.GET, httpEntity, Object[].class);
            directories = repos.getBody();
        } catch (Exception e) {
            //not found
            return new ResponseEntity<>("The repository doesnt exist or You dont have access to it.", HttpStatus.NOT_ACCEPTABLE);
        }

        boolean isFork = false;
        String k;
        JSONObject g;
        int validCheck = 0;
        List arr = new ArrayList<>();
        Map obj = null;
        for (Object dir : directories) {
            g = new JSONObject(gson.toJson(dir));
            k = g.get("name").toString();
            if (k.equals("archetypes")) validCheck++;
            if (k.equals("templates")) validCheck++;

            if (validCheck == 2) {

                try (FileReader in = new FileReader(Configuration.get("repositories.configuration"));
                ) {
                    obj = (Map) objectMapper.readValue(in, Map.class);
                }

                JSONObject jsonObject = new JSONObject(gson.toJson(obj));
                JSONArray existingRepos = (JSONArray) jsonObject.get("Repositories");
                for (int i = 0; i < existingRepos.length(); i++) {
                    if (existingRepos.getJSONObject(i).get("name").toString().equals(req.getParameter("value"))) {
                        return new ResponseEntity<>("Repository already exists!", HttpStatus.NOT_ACCEPTABLE);
                    }
                }
                arr = (List) obj.get("Repositories");
                //arr.put()
                arr.add(ImmutableMap.of("name", req.getParameter("value")));

                isFork = Boolean.valueOf(req.getParameter("value").contains(session.getAttribute("Username").toString()));
                existingRepos.put(new JSONObject(gson.toJson(dir)));
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(
                        new File(Configuration.get("repositories.configuration")), obj);
            }
        }
        if (validCheck < 2)
            return new ResponseEntity<>("The repository is not an openEHR repository.", HttpStatus.NOT_ACCEPTABLE);

        Map resp = new HashMap<>();
        resp.put("full_name",req.getParameter("value"));
        resp.put("fork",isFork);
        List<Object> filtered = (List)session.getAttribute("FilteredRepos");
        filtered.add(resp);
        session.setAttribute("FilteredRepos", filtered);
        return new ResponseEntity<>(new JSONObject(resp).toString(), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/RepositoryChooser")
    public ModelAndView repoChooser(HttpServletRequest req) throws Exception {
        HttpSession session = req.getSession();
        String githubCode = req.getParameter("code");
        String tokenResult;
        String token = "";
        List<String> repoNames = new ArrayList<>();
        JSONParser parser = new JSONParser();

        if (!Files.exists(Paths.get(Configuration.get("repositories.configuration")))) {
            Files.write(Paths.get(Configuration.get("repositories.configuration")), "{\"Repositories\":[]}".getBytes(Charsets.UTF_8));
        }
        try (FileReader reader = new FileReader(
                Configuration.get("repositories.configuration"));
        ) {
            Object obj = parser.parse(reader);

            JSONObject jsonObject = new JSONObject(gson.toJson(obj));


            JSONArray existingRepos = (JSONArray) jsonObject.get("Repositories");

            for (int i = 0; i < existingRepos.length(); i++) {
                repoNames.add(existingRepos.getJSONObject(i).get("name").toString());
            }
        }


        ResponseEntity<Object[]> repos = null;
        if (req.getSession().getAttribute("Token") == null) {
            if (githubCode != null) {
                RestTemplate restTemplate = new RestTemplate();
                MultiValueMap<String, String> map = new LinkedMultiValueMap<String, String>();
                map.add("client_id", "d0b3c06d13fdfabf0c88");
                map.add("client_secret", "3d9bece886ab0dc46202260248596421c1ce6712");
                map.add("code", githubCode);
                tokenResult = restTemplate.postForObject("https://github.com/login/oauth/access_token/", map, String.class);
                int a = tokenResult.indexOf("=");
                int b = tokenResult.indexOf("&scope");
                token = tokenResult.substring(a + 1, b);
               /* Map res = restTemplate.getForObject("https://api.github.com/user?access_token=" + token, Map.class);
                username = (String) res.get("login");*/
                HttpHeaders headers = new HttpHeaders();

                headers.set("Authorization", "Bearer " + token);
                headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
                HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);
                repos = restTemplate.exchange("https://api.github.com/user/repos", HttpMethod.GET, httpEntity, Object[].class);
            }
        }

        session.setAttribute("Token", token);

        ModelAndView view = new ModelAndView("RepositoryChooser");

        // parsing JSON
        Object[] repositories = repos.getBody();
        List<Object> filtered = new ArrayList<>();

        String k;
        JSONObject g;

        for (Object repo : repositories) {
            g = new JSONObject(gson.toJson(repo));
            k = g.get("full_name").toString();

            if (repoNames.contains(k)) {
                filtered.add(repo);
            }
        }
        session.setAttribute("FilteredRepos", filtered);
        view.addObject("Repositories", filtered.toArray());
        return view;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/Logout")
    public ModelAndView Logout(HttpServletRequest req) {
        ModelAndView view = new ModelAndView("Login");
        HttpSession session = req.getSession();
        session.invalidate();
        return view;
    }

    public String downloadFileRaw(String download_url, String oAuth2, String username) throws FileNotFoundException {
        //This is used for GitHub /contents
        Gson gson = new Gson();

        HttpHeaders headers = new HttpHeaders();
        String auth = oAuth2;
        headers.set("Authorization", "Bearer " + oAuth2);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        org.springframework.http.HttpEntity<String> httpEntity = new org.springframework.http.HttpEntity<>("parameters", headers);
        ResponseEntity<Map> existing = restTemplate.exchange(download_url + "?ref=" + username, HttpMethod.GET, httpEntity, Map.class);
        try {
            return downloadHelper(existing.getBody().get("download_url").toString());
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    public String downloadHelper(String download_url) throws Exception {
        HttpURLConnection connection;
        URL url = new URL(download_url);
        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("HOST", "raw.githubusercontent.com");
        connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:16.0) Gecko/20100101 Firefox/16.0");
        connection.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        connection.setRequestProperty("Accept-Language", "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3");
        connection.setDoInput(true);
        connection.setDoOutput(true);
        return new String(ByteStreams.toByteArray(connection.getInputStream()), StandardCharsets.UTF_8);
    }

    public String decodeContent(String content) {
        BASE64Decoder decoder = new BASE64Decoder();
        byte[] decodedBytes;
        try {
            decodedBytes = decoder.decodeBuffer(content);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new String(decodedBytes);
    }

}
