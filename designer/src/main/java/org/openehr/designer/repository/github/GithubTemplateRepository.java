package org.openehr.designer.repository.github;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import org.apache.commons.codec.binary.Base64;
import org.eclipse.egit.github.core.RepositoryContents;
import org.openehr.adl.AdlException;
import org.openehr.adl.am.ArchetypeIdInfo;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.repository.ArtifactNotFoundException;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.repository.github.egitext.PushContentsData;
import org.openehr.jaxb.am.Archetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

/**
 * Created by Denko on 11/4/2015.
 */
// todo templates under subfolders
public class GithubTemplateRepository extends AbstractGithubRepository implements TemplateRepository {
    public static final Logger LOG = LoggerFactory.getLogger(GithubTemplateRepository.class);


    private Map<String, TemplateInfo> templateMap = new HashMap<>();
    private ObjectMapper objectMapper = new ObjectMapper();


    public void init(String branch, String accessToken, String repo) {
        super.init(branch, accessToken, repo);

        createBranchIfNeeded(branch);

        TemplatesMetadata tms = getMetadataFile();
        if (updateMetadataFile(tms)) {
            saveMetadataFile(tms);
        }

        for (TemplateMetadata tm : tms.templates) {
            templateMap.put(tm.id, new TemplateInfo(tm.id, tm.rmType, tm.name));
        }
    }


    private void saveMetadataFile(TemplatesMetadata tms) {
        try {
            PushContentsData data = new PushContentsData();
            data.setMessage("Update templates metadata by adl-designer");
            data.setContent(encodeBase64(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(tms)));
            data.setSha(tms.existingSha);
            data.setBranch(branch);

            githubContentsService.pushContents(githubRepository, "TemplatesMetadata.json", data);
            // todo tms.existingSha=
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    private boolean updateMetadataFile(TemplatesMetadata tms) {
        boolean updated = false;
        Map<String, TemplateMetadata> pathToMetadata = Maps.newHashMap(Maps.uniqueIndex(tms.templates, (v) -> v.path));
        Set<String> existingPaths = new HashSet<>();
        try {
            List<RepositoryContents> templatesContents = githubContentsService.getContents(githubRepository, "templates", branch);
            for (RepositoryContents tc : templatesContents) {
                if (!tc.getPath().endsWith(".adlt")) continue;

                TemplateMetadata tm = pathToMetadata.get(tc.getPath());
                if (tm == null) {
                    tm = new TemplateMetadata();
                    tm.path = tc.getPath();
                    tms.templates.add(tm);
                    pathToMetadata.put(tm.path, tm);
                }
                if (!tc.getSha().equals(tm.sha)) {
                    LOG.debug("Updating metadata for {}", tc.getPath());
                    RepositoryContents fileTc = Iterables.getOnlyElement(
                            githubContentsService.getContents(githubRepository, tc.getPath(), branch));
                    String adltContent = new String(Base64.decodeBase64(fileTc.getContent()), Charsets.UTF_8);
                    try {
                        List<Archetype> archetypes = TemplateDeserializer.deserialize(adltContent);
                        Archetype a = archetypes.get(0);

                        tm.sha = tc.getSha();
                        tm.path = tc.getPath();
                        tm.id = a.getArchetypeId().getValue();
                        tm.name = findTermText(a, a.getDefinition().getNodeId());
                        tm.rmType = a.getDefinition().getRmTypeName();
                        updated = true;
                    } catch (AdlException e) {
                        LOG.error("Error parsing template " + tc.getPath()+". It will not be present in the list of templates", e);
                    }
                }
                existingPaths.add(tc.getPath());
            }
            for (Iterator<TemplateMetadata> iterator = tms.templates.iterator(); iterator.hasNext(); ) {
                TemplateMetadata template = iterator.next();
                if (!existingPaths.contains(template.path)) {
                    iterator.remove();
                    updated = true;
                }
            }
            return updated;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private TemplatesMetadata getMetadataFile() {
        try {
            RepositoryContents repositoryContents = getFileContentsOrNull("TemplatesMetadata.json");
            if (repositoryContents == null) return new TemplatesMetadata();

            TemplatesMetadata result = objectMapper.readValue(Base64.decodeBase64(repositoryContents.getContent()),
                    TemplatesMetadata.class);
            result.existingSha = repositoryContents.getSha();
            return result;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public List<TemplateInfo> listTemplates() {


        List<TemplateInfo> listTemplates = new ArrayList<>(templateMap.values());
        return listTemplates;
    }

    @Override
    public void saveTemplate(List<Archetype> archetypes) {
        Archetype a = archetypes.get(0);
        String templateId = a.getArchetypeId().getValue();

        String adltContent = TemplateSerializer.serialize(archetypes);
        // Check to see if the template can still be deserialized
        TemplateDeserializer.deserialize(adltContent);


        String path = createPath(templateId);
        RepositoryContents existing = getFileContentsOrNull(path);
        PushContentsData pushData = new PushContentsData();
        pushData.setMessage("Committed through adl-designer");
        pushData.setContent(encodeBase64(adltContent));
        pushData.setSha(existing != null ? existing.getSha() : null);
        pushData.setBranch(branch);
        try {
            githubContentsService.pushContents(githubRepository, path, pushData);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        TemplateInfo i = templateMap.get(templateId);
        if (i == null) {
            String rmType = a.getDefinition().getRmTypeName();
            i = new TemplateInfo();
            i.setTemplateId(templateId);
            i.setRmType(rmType);
            templateMap.put(templateId, i);
        }
        i.setName(findTermText(a, a.getDefinition().getNodeId()));

    }


    @Override
    public List<Archetype> loadTemplate(String templateId) {

        String path = createPath(templateId);
        RepositoryContents rc = getFileContentsOrNull(path);
        if (rc == null) {
            throw new ArtifactNotFoundException(templateId);
        }
        String adltContent = decodeBase64(rc.getContent());
        return TemplateDeserializer.deserialize(adltContent);
    }

    private String createPath(String templateId) {
        String interfaceTemplateId = ArchetypeIdInfo.parse(templateId).toInterfaceString();
        return "templates/" + interfaceTemplateId + ".adlt";
    }


    private static class TemplatesMetadata {
        @JsonProperty
        List<TemplateMetadata> templates = new ArrayList<>();
        @JsonIgnore
        String existingSha;
    }

    private static class TemplateMetadata {
        @JsonProperty
        private String id;
        @JsonProperty
        private String rmType;
        @JsonProperty
        private String name;
        @JsonProperty
        private String path;
        @JsonProperty
        private String sha;
    }
}
