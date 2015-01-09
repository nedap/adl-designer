package org.openehr.designer.repository;

import com.google.common.base.Charsets;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.io.TemplateSerializer;
import org.apache.commons.lang.ObjectUtils;
import org.openehr.adl.rm.RmModel;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.jaxb.am.Archetype;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import javax.annotation.PostConstruct;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * @author Marko Pipan
 */
public class TemplateRepositoryImpl implements TemplateRepository {
    private static final Logger LOG = LoggerFactory.getLogger(TemplateRepositoryImpl.class);

    private Path repositoryLocation;
    private RmModel rmModel;
    private ConcurrentHashMap<String, List<DifferentialArchetype>> templateMap = new ConcurrentHashMap<>();

    @Required
    public void setRepositoryLocation(String repositoryLocation) {
        this.repositoryLocation = Paths.get(repositoryLocation);
    }

    @Required
    public void setRmModel(RmModel rmModel) {
        this.rmModel = rmModel;
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(repositoryLocation);

        Files.list(repositoryLocation)
                .filter(path -> path.getFileName().toString().endsWith(".adlt") && !Files.isDirectory(path))
                .forEach(path -> {
                    try {
                        List<DifferentialArchetype> archetypes = TemplateDeserializer.deserialize(rmModel, Files.newInputStream(path));
                        templateMap.put(archetypes.get(0).getArchetypeId().getValue(), archetypes);
                    } catch (Exception e) {
                        LOG.error("Error parsing template {}. Will be ignored", path.getFileName(), e);
                    }
                });
    }

    @Override
    public List<TemplateInfo> listTemplates() {
        List<TemplateInfo> result = templateMap.entrySet().stream()
                .map(e -> {
                    Archetype template = e.getValue().get(0);
                    ArchetypeWrapper wrapper = new ArchetypeWrapper(template);

                    String templateId = e.getKey();
                    String rmType = template.getDefinition().getRmTypeName();
                    String name = wrapper.getTermText(template.getDefinition().getNodeId());

                    return new TemplateInfo(templateId, rmType, name);
                })
                .collect(Collectors.toList());
        result.sort((t, o) -> ObjectUtils.compare(t.getName(), o.getName()));
        return result;
    }

    @Override
    public void saveTemplate(List<DifferentialArchetype> archetypes) {
        String templateId = archetypes.get(0).getArchetypeId().getValue();
        String adltContent = TemplateSerializer.serialize(archetypes);
        try {
            try (Writer w = new OutputStreamWriter(new FileOutputStream(repositoryLocation.resolve(templateId + ".adlt").toFile()),
                    Charsets.UTF_8)) {
                w.append(adltContent);
            }
            templateMap.put(templateId, archetypes);
        } catch (IOException e) {
            throw new RuntimeException("Error saving template", e);
        }
    }

    @Override
    public List<DifferentialArchetype> loadTemplate(String templateId) {
        final List<DifferentialArchetype> result = templateMap.get(templateId);
        if (result == null) {
            throw new IllegalArgumentException("No such template: " + templateId);
        }
        return result;
    }
}
