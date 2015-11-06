package org.openehr.designer.repository.github;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.binary.*;
import org.openehr.adl.am.ArchetypeIdInfo;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.serializer.AdlStringBuilder;
import org.openehr.adl.serializer.ArchetypeSerializer;
import org.openehr.adl.serializer.DAdlSerializer;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.designer.ArchetypeInfo;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.repository.AbstractArchetypeRepository;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.jaxb.am.Archetype;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import sun.misc.BASE64Decoder;

import java.util.*;
import java.util.Base64;

/**
 * Created by Denko on 11/5/2015.
 */
public class GithubArchetypeRepository extends AbstractArchetypeRepository implements ArchetypeRepository  {

    private Map<String, ArchetypeInfo> archetypeMap = new HashMap<>();
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();
    AdlDeserializer serializer = new AdlDeserializer();
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
            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/ArchetypesMetadata.json?ref="+username, HttpMethod.GET, httpEntity, Map.class);
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
            ArchetypeInfo ti = new ArchetypeInfo();
            ti.setName((String) from.get("filename"));
            ti.setRmType((String) from.get("rmType"));
            ti.setArchetypeId((String) pair.getKey());
            archetypeMap.put(pair.getKey().toString(), ti);
        }
    }
    @Override
    public Archetype getDifferentialArchetype(String archetypeId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer "+token);
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        HttpEntity<String> httpEntity = new HttpEntity<>("parameters", headers);
        ResponseEntity<Map> existing;
        //String path = templateMap.get(templateId);
        String content="{}", sha=null;
        String fileName = archetypeMap.get(archetypeId).getName();
        try {
            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/archetypes/"+fileName+"?ref="+username, HttpMethod.GET, httpEntity, Map.class);
            content = decodeContent(existing.getBody().get("content").toString().replace("\n", "").replace("\r", ""));
            //sha = existing.getBody().get("sha").toString();
        }catch (HttpClientErrorException e){
            //Template does not exist
        }

        return serializer.parse(content);

    }

    @Override
    public void saveDifferentialArchetype(Archetype archetype) {
        archetype.isIsDifferential(); // ?
        ArchetypeIdInfo q = ArchetypeIdInfo.parse(archetype.getArchetypeId().getValue().toString());
        q.setVersionMinor(null);
        q.setVersionPatch(null);
        String archetypeId = archetype.getArchetypeId().getValue();
        String rmType = archetype.getDefinition().getRmTypeName();
        String name = archetype.getConcept();
        String adltContent = ArchetypeSerializer.serialize(archetype);
        ArchetypeInfo archetypeInfo = new ArchetypeInfo();
        if(!archetypeMap.containsValue(archetypeInfo)) {
            archetypeInfo.setArchetypeId(archetypeId);
            archetypeInfo.setName(q.toString()+".adls");
            archetypeInfo.setRmType(rmType);
            archetypeInfo.setLanguages(archetypeInfo.getLanguages());
            archetypeMap.put(archetypeId,archetypeInfo);
        }


        ResponseEntity<Map> existing;
        org.apache.commons.codec.binary.Base64 k = new org.apache.commons.codec.binary.Base64();
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

            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/archetypes/"+q.toString()+".adls?ref="+username, HttpMethod.PUT, httpEntity, Map.class);

        }catch (HttpClientErrorException e){

            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/archetypes/"+q.toString()+".adls?ref="+username, HttpMethod.GET, httpEntity, Map.class);
            r.put("message", "Updated on: " + new Date().toString() + " by "+username);
            r.put("sha", existing.getBody().get("sha").toString());
            httpEntity = new HttpEntity<>(r.toJSONString(), headers);
            existing = restTemplate.exchange("https://api.github.com/repos/"+repo+"/contents/archetypes/"+q.toString()+".adlt?ref="+username, HttpMethod.PUT, httpEntity, Map.class);
            //We need to create it
        }

    }

    @Override
    public List<ArchetypeInfo> getArchetypeInfos() {
        List<ArchetypeInfo> listArchetypes = new ArrayList<>(archetypeMap.values());
        return listArchetypes;
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
