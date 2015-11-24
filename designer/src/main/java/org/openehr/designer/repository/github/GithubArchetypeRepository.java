package org.openehr.designer.repository.github;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import org.eclipse.egit.github.core.Repository;
import org.eclipse.egit.github.core.RepositoryContents;
import org.openehr.adl.am.ArchetypeIdInfo;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.AdlParserException;
import org.openehr.adl.serializer.ArchetypeSerializer;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.repository.ArchetypeInfo;
import org.openehr.designer.repository.ArchetypeRepository;
import org.openehr.designer.repository.ArtifactNotFoundException;
import org.openehr.designer.repository.RepositoryException;
import org.openehr.designer.repository.github.egitext.PushContentsData;
import org.openehr.jaxb.am.Archetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Created by Denko on 11/5/2015.
 */
public class GithubArchetypeRepository extends AbstractGithubRepository implements ArchetypeRepository {
    public static final Logger LOG = LoggerFactory.getLogger(GithubArchetypeRepository.class);


    private Map<String, ArchetypeInfo> archetypeMap = new HashMap<>();
    private ObjectMapper objectMapper = new ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL);
    private AdlDeserializer deserializer = new AdlDeserializer();
    private final Cache<String, Archetype> cache = CacheBuilder.newBuilder()
            .expireAfterAccess(1, TimeUnit.HOURS)
            .build();

    public void init(String username, String accessToken, String repo, String branch) {
        super.init(username, accessToken, repo, branch);

        ArchetypesMetadata ams = getMetadataFile();
        if (updateMetadataFile(ams)) {
            if (isWritable()) {
                saveMetadataFile(ams);
            }
        }

        for (ArchetypeMetadata am : ams.archetypes) {
            if (!am.isValid()) continue;

            ArchetypeInfo ai = new ArchetypeInfo(am.id, am.rmType, am.name);
            ai.setLanguages(am.languages);
            archetypeMap.put(am.id, ai);
        }
    }

    private void saveMetadataFile(ArchetypesMetadata ams) {
        try {
            PushContentsData data = new PushContentsData();
            data.setMessage("Update archetypes metadata by adl-designer");
            data.setContent(encodeBase64(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(ams)));
            data.setSha(ams.existingSha);
            data.setBranch(branch);

            githubContentsService.pushContents(githubRepository, "ArchetypesMetadata.json", data);
        } catch (IOException e) {
            throw new RepositoryException(e);
        }

    }

    private boolean updateMetadataFile(ArchetypesMetadata ams) {
        boolean updated = false;
        Map<String, ArchetypeMetadata> pathToMetadata = Maps.newHashMap(Maps.uniqueIndex(ams.archetypes, (v) -> v.path));
        Set<String> existingPaths = new HashSet<>();
        try {
            List<RepositoryContents> templatesContents = githubContentsService.getContents(githubRepository,
                    "archetypes", branch);

            for (RepositoryContents tc : templatesContents) {
                if (!tc.getPath().endsWith(".adls")) continue;

                ArchetypeMetadata am = pathToMetadata.get(tc.getPath());
                if (am == null) {
                    am = new ArchetypeMetadata();
                    am.path = tc.getPath();
                    ams.archetypes.add(am);
                    pathToMetadata.put(am.path, am);
                }
                if (!tc.getSha().equals(am.sha)) {
                    am.sha = tc.getSha();
                    am.path = tc.getPath();

                    LOG.debug("Updating metadata for {}", tc.getPath());
                    RepositoryContents fileTc = Iterables.getOnlyElement(
                            githubContentsService.getContents(githubRepository, tc.getPath(), branch));
                    String adltContent = decodeBase64(fileTc.getContent());
                    try {
                        List<Archetype> archetypes = TemplateDeserializer.deserialize(adltContent);
                        Archetype a = archetypes.get(0);

                        am.id = a.getArchetypeId().getValue();
                        am.name = findTermText(a, a.getDefinition().getNodeId());
                        am.rmType = a.getDefinition().getRmTypeName();
                        am.languages = extractLanguages(a);
                    } catch (AdlParserException e) {
                        am.id = null; // marks invalid archetype
                        LOG.error("Error parsing archetype " + tc.getPath() + ". It will not be present in the list of archetypes", e);
                    }
                    updated = true;
                }
                existingPaths.add(tc.getPath());
            }
            // remove deleted archetypes from metadata
            for (Iterator<ArchetypeMetadata> iterator = ams.archetypes.iterator(); iterator.hasNext(); ) {
                ArchetypeMetadata archetype = iterator.next();
                if (!existingPaths.contains(archetype.path)) {
                    iterator.remove();
                    updated = true;
                }
            }
            return updated;
        } catch (IOException e) {
            throw new RepositoryException(e);
        }
    }


    private ArchetypesMetadata getMetadataFile() {
        try {
            RepositoryContents repositoryContents = getFileContentsOrNull("ArchetypesMetadata.json");
            if (repositoryContents == null) return new ArchetypesMetadata();

            ArchetypesMetadata result = objectMapper.readValue(decodeBase64(repositoryContents.getContent()),
                    ArchetypesMetadata.class);
            result.existingSha = repositoryContents.getSha();
            return result;
        } catch (IOException e) {
            throw new RepositoryException(e);
        }

    }

    @Override
    public Archetype getDifferentialArchetype(String archetypeId) {
        try {
            return cache.get(archetypeId, () -> {
                String path = createPath(archetypeId);
                RepositoryContents rc = getFileContentsOrNull(path);
                if (rc == null) {
                    throw new ArtifactNotFoundException(archetypeId);
                }
                String adlsContent = decodeBase64(rc.getContent());
                return deserializer.parse(adlsContent);
            });
        } catch (ExecutionException e) {
            if (e.getCause() instanceof RuntimeException) {
                throw (RuntimeException) e.getCause();
            } else {
                throw new RuntimeException(e);
            }
        }

    }

    private String createPath(String archetypeId) {
        String interfaceArchetypeId = ArchetypeIdInfo.parse(archetypeId).toInterfaceString();
        return "archetypes/" + interfaceArchetypeId + ".adls";
    }

    @Override
    public void saveDifferentialArchetype(Archetype archetype) {
        String archetypeId = archetype.getArchetypeId().getValue();

        String adlsContent = ArchetypeSerializer.serialize(archetype);
        // Check to see if the archetype can still be deserialized
        deserializer.parse(adlsContent);

        String path = createPath(archetypeId);
        RepositoryContents existing = getFileContentsOrNull(path);
        PushContentsData pushData = new PushContentsData();
        pushData.setMessage("Committed through adl-designer");
        pushData.setContent(encodeBase64(adlsContent));
        pushData.setSha(existing != null ? existing.getSha() : null);
        pushData.setBranch(branch);
        try {
            githubContentsService.pushContents(githubRepository, path, pushData);
        } catch (IOException e) {
            throw new RepositoryException(e);
        }
        cache.put(archetypeId, archetype);

        ArchetypeInfo i = archetypeMap.get(archetypeId);
        if (i == null) {
            String rmType = archetype.getDefinition().getRmTypeName();
            i = new ArchetypeInfo(archetypeId, rmType, findTermText(archetype));
            archetypeMap.put(archetypeId, i);
        }
        i.setName(findTermText(archetype));

    }

    @Override
    public List<ArchetypeInfo> getArchetypeInfos() {
        return new ArrayList<>(archetypeMap.values());
    }


    private static class ArchetypesMetadata {
        @JsonProperty
        List<ArchetypeMetadata> archetypes = new ArrayList<>();
        @JsonIgnore
        String existingSha;
    }

    private static class ArchetypeMetadata {
        @JsonProperty
        String id;
        @JsonProperty
        String rmType;
        @JsonProperty
        String name;
        @JsonProperty
        String path;
        @JsonProperty
        String sha;
        @JsonProperty
        List<String> languages;

        public ArchetypeMetadata() {
        }

        public ArchetypeMetadata(String path) {
            this.path = path;
        }

        private boolean isValid() {
            return id != null;
        }
    }
}
