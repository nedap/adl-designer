package org.openehr.designer;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.adl.flattener.ArchetypeFlattener;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.ArchetypeTerm;
import org.openehr.jaxb.am.CodeDefinitionSet;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.openehr.jaxb.rm.StringDictionaryItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Marko Pipan
 */
public class ArchetypeRepositoryImpl implements ArchetypeRepository {
    private static final Logger LOG = LoggerFactory.getLogger(ArchetypeRepositoryImpl.class);

    private final RmModel rmModel = new OpenEhrRmModel();
    private final AdlDeserializer deserializer = new AdlDeserializer(rmModel);
    private final ArchetypeFlattener flattener = new ArchetypeFlattener(rmModel);
    private final Map<String, DifferentialArchetype> sourceArchetypes = new ConcurrentHashMap<>();
    private final List<ArchetypeInfo> archetypeInfos = new ArrayList<>();

    private final Map<String, FlatArchetype> flatArchetypes = new ConcurrentHashMap<>();


    private String repositoryLocation;

    @Required
    public void setRepositoryLocation(String repositoryLocation) {
        this.repositoryLocation = repositoryLocation;
    }

    @Override
    public RmModel getRmModel() {
        return rmModel;
    }

    @PostConstruct
    public void init() throws IOException {
        List<Path> adlFiles = new ArrayList<>();
        final Path repositoryPath = Paths.get(repositoryLocation);
        addAdlFilesRecursively(adlFiles, repositoryPath);
        for (Path adlFile : adlFiles) {
            try {
                LOG.info("Parsing archetype file " + repositoryPath.relativize(adlFile));
                String adlContent = readArchetype(adlFile);
                DifferentialArchetype archetype = deserializer.parse(adlContent);

                ArchetypeInfo info = new ArchetypeInfo();
                info.setArchetypeId(archetype.getArchetypeId().getValue());
                info.setRmType(archetype.getDefinition().getRmTypeName());

                String mainNodeId = archetype.getDefinition().getNodeId();
                if (mainNodeId==null) {
                    mainNodeId=archetype.getConcept();
                }

                String defaultLanguage = archetype.getOriginalLanguage().getCodeString();
                info.setName(findTermText(archetype, mainNodeId, defaultLanguage));

                archetypeInfos.add(info);
                sourceArchetypes.put(info.getArchetypeId(), archetype);
            } catch (Exception e) {
                LOG.error("Error parsing archetype from file " + repositoryPath.relativize(adlFile) + ". Archetype will be ignored", e);
            }
        }
    }

    private String findTermText(DifferentialArchetype archetype, String concept, String defaultLanguage) {
        if (archetype.getOntology() == null || archetype.getOntology().getTermDefinitions() == null) return null;
        CodeDefinitionSet cds = archetype.getOntology()
                .getTermDefinitions()
                .stream()
                .filter((t) -> t.getLanguage().equals(defaultLanguage))
                .findFirst().orElse(null);
        if (cds == null) return null;

        ArchetypeTerm at = cds.getItems().stream().filter((t) -> t.getCode().equals(concept)).findFirst().orElse(null);
        if (at == null) return null;

        return at.getItems().stream().filter((t) -> t.getId().equals("text")).map(StringDictionaryItem::getValue).findFirst().orElse(null);

    }

    private void addAdlFilesRecursively(List<Path> target, Path directory) throws IOException {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {
            for (Path path : stream) {
                if (Files.isDirectory(path)) {
                    if (!path.getFileName().toString().startsWith(".")) {
                        addAdlFilesRecursively(target, path);
                    }
                } else if (path.getFileName().toString().endsWith(".adls")) {
                    target.add(path);
                }
            }
        }
    }

    @Override
    public DifferentialArchetype getDifferentialArchetype(String archetypeId) {
        DifferentialArchetype result = sourceArchetypes.get(archetypeId);
        if (result == null) {
            throw new IllegalArgumentException(archetypeId);
        }
        return result;
    }

    @Override
    public FlatArchetype getFlatArchetype(String archetypeId) {
        FlatArchetype result = flatArchetypes.get(archetypeId);
        if (result == null) {
            DifferentialArchetype source = getDifferentialArchetype(archetypeId);
            FlatArchetype parent = null;
            if (source.getParentArchetypeId() != null && source.getParentArchetypeId().getValue() != null) {
                parent = getFlatArchetype(source.getParentArchetypeId().getValue());
            }
            result = flattener.flatten(parent, source);
            flatArchetypes.put(archetypeId, result);
        }
        return result;
    }

    @Override
    public List<ArchetypeInfo> getArchetypeInfos() {
        return archetypeInfos;
    }

    private String readArchetype(Path adlFile) {
        try {
            return CharStreams.toString(new BomSupportingReader(
                    Files.newInputStream(adlFile),
                    Charsets.UTF_8));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
