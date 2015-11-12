package org.openehr.designer.web;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import org.eclipse.egit.github.core.User;
import org.eclipse.egit.github.core.client.GitHubClient;
import org.eclipse.egit.github.core.service.UserService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.simple.parser.JSONParser;
import org.openehr.designer.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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
    @Resource
    private RepositoryProvider repositoryProvider;

    @RequestMapping(method = RequestMethod.GET, value = "/template-editor")
    public ModelAndView displayTemplateEditor(HttpSession session) {
//        SessionConfiguration conf = WebAttributes.getSessionConfiguration(session);

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
    public ModelAndView displayTest(HttpServletRequest req, @RequestParam String repo) throws Exception {
        HttpSession session = req.getSession();
//        String repo = req.getParameter("repo");

        String token = req.getSession().getAttribute("Token").toString();

        session.setAttribute("Repo", repo);


        // trigger repository init if needed
        repositoryProvider.getArchetypeRepositoryForUser(session);
        repositoryProvider.getTemplateRepositoryForUser(session);

//            if (session.getAttribute("Token") != null) {
//                //user was already logged
//            } else {
//                session.setAttribute("Token", token);
//                session.setAttribute("Username", username);
//            }

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
        ResponseEntity<Object[]> repos;
        Object[] directories;
        try {
            repos = restTemplate.exchange("https://api.github.com/repos/" + req.getParameter("value") + "/contents", HttpMethod.GET, httpEntity, Object[].class);
            directories = repos.getBody();
        } catch (Exception e) {
            //not found
            return new ResponseEntity<>("The repository doesnt exist or You dont have access to it.", HttpStatus.NOT_ACCEPTABLE);
        }


        String k;
        JSONObject g;
        JSONParser parser = new JSONParser();
        int validCheck = 0;
        for (Object dir : directories) {
            g = new JSONObject(gson.toJson(dir));
            k = g.get("name").toString();
            if (k.equals("archetypes")) validCheck++;
            if (k.equals("templates")) validCheck++;

            if (validCheck == 2) {
                Map obj;
                try (FileReader in = new FileReader(Configuration.get("repositories.configuration"));
                ) {
                    obj = (Map) objectMapper.readValue(in, Map.class);
                }

                JSONObject jsonObject = new JSONObject(gson.toJson(obj));
                JSONArray existingRepos = (JSONArray) jsonObject.get("Repositories");
                for (int i = 0; i < existingRepos.length(); i++) {
                    if (existingRepos.getJSONObject(i).get("name").toString().equals(req.getParameter("value"))) {
                        return new ResponseEntity<>("Repository already exists in the database", HttpStatus.NOT_ACCEPTABLE);
                    }
                }
                List arr = (List) obj.get("Repositories");
                //arr.put()
                arr.add(ImmutableMap.of("name", req.getParameter("value")));


                existingRepos.put(new JSONObject(gson.toJson(dir)));
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(
                        new File(Configuration.get("repositories.configuration")), obj);
            }
        }
        if (validCheck < 2)
            return new ResponseEntity<>("The repository is not an openEHR repository.", HttpStatus.NOT_ACCEPTABLE);

        return new ResponseEntity<>("Repository added successfully!", HttpStatus.OK);
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
                MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
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

        // setting session attributes
        session.setAttribute("Token", token);

        GitHubClient github = new GitHubClient();
        github.setOAuth2Token(token);
        UserService userService = new UserService(github);
        User user = userService.getUser();
        session.setAttribute("Username", user.getLogin());


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


}
