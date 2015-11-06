package org.openehr.designer.repository.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import org.apache.commons.codec.binary.*;
import org.apache.commons.codec.binary.Base64;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.jaxb.am.Archetype;
import org.openehr.jaxb.am.Template;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import sun.misc.BASE64Decoder;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.*;

/**
 * Created by Denko on 11/4/2015.
 */
public class GithubTemplateRepository implements TemplateRepository {

    private Map<String, TemplateInfo> templateMap = new HashMap<>();
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();
    private String username;
    private String token;
    private String repo;
    public void init(String username, String accessToken, String repo) throws Exception{
        this.username = username;
        this.token = accessToken;
        this.repo = repo;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+accessToken);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);

        ResponseEntity<Map> existing;
        String content="{}", sha=null;
        try {
            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/TemplatesMetadata.json?ref="+username, HttpMethod.GET, httpEntity, Map.class);
            content = decodeContent(existing.getBody().get("content").toString().replace("\n", "").replace("\r", ""));
            //sha = existing.getBody().get("sha").toString();
        }catch (HttpClientErrorException e){
            if (e.getStatusCode().value() != 404) {
                throw e;
            }/**/
            //We need to create it
        }


        Map<String, Map> metadata = objectMapper.readValue(content, Map.class);
        Iterator it = metadata.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry)it.next();
            Map from = (Map) pair.getValue();
            System.out.println(pair.getKey() + " = " + from);
            TemplateInfo ti = new TemplateInfo();
            ti.setName((String) from.get("name"));
            ti.setRmType((String) from.get("rmType"));
            ti.setTemplateId((String) from.get("id"));
            templateMap.put(pair.getKey().toString(), ti);
        }

    }
    @Override
    public List<TemplateInfo> listTemplates() {


        List<TemplateInfo> listTemplates = new ArrayList<>(templateMap.values());
        return listTemplates;
    }

    @Override
    public void saveTemplate(List<Archetype> archetypes) {
        String templateId = archetypes.get(0).getArchetypeId().getValue();
        String rmType = archetypes.get(0).getDefinition().getRmTypeName();
        ArchetypeWrapper wrapper = new ArchetypeWrapper(archetypes.get(0));
        String namex = wrapper.getTermText(archetypes.get(0).getDefinition().getNodeId());
        String adltContent = TemplateSerializer.serialize(archetypes);
        TemplateInfo templateInfo = new TemplateInfo();
        if(!templateMap.containsValue(templateInfo)) {
            templateInfo.setTemplateId(templateId);
            templateInfo.setName(namex);
            templateInfo.setRmType(rmType);
            templateMap.put(templateId,templateInfo);
        }


        ResponseEntity<Map> existing;
        Base64 k = new Base64();
        String encoded = k.encodeToString(adltContent.toString().getBytes()).replace("\r", "").replace("\n", "");
        String content="{}", sha=null;
        org.json.simple.JSONObject r = new org.json.simple.JSONObject();
        r.put("message", "Created on: " + new Date().toString() + " by "+username);
        r.put("content", encoded);
        r.put("branch", username);
        r.put("sha", "");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<?> httpEntity = new HttpEntity<>(r.toJSONString(), headers);

        try {

            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/templates/"+templateId+".adlt?ref="+username, HttpMethod.PUT, httpEntity, Map.class);

        }catch (HttpClientErrorException e){

            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/templates/"+templateId+".adlt?ref="+username, HttpMethod.GET, httpEntity, Map.class);
            r.put("message", "Updated on: " + new Date().toString() + " by "+username);
            r.put("sha", existing.getBody().get("sha").toString());
            httpEntity = new HttpEntity<>(r.toJSONString(), headers);
           existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/templates/"+templateId+".adlt?ref="+username, HttpMethod.PUT, httpEntity, Map.class);
            //We need to create it
        }



        // Check to see if the template can still be deserialized
        TemplateDeserializer.deserialize(adltContent);


    }

    @Override
    public List<Archetype> loadTemplate(String templateId) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+token);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);
        ResponseEntity<Map> existing;
        //String path = templateMap.get(templateId);
        String content="{}", sha=null;
        try {
            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/templates/"+templateId+".adlt?ref="+username, HttpMethod.GET, httpEntity, Map.class);
            content = decodeContent(existing.getBody().get("content").toString().replace("\n", "").replace("\r", ""));
            //sha = existing.getBody().get("sha").toString();
        }catch (HttpClientErrorException e){
            //Template does not exist
        }
        return TemplateDeserializer.deserialize(content);
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
