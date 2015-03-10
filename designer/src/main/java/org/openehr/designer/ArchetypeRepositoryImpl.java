/*
 * ADL2-core
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-core.
 *
 * ADL2-core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.openehr.designer;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.adl.am.ArchetypeIdInfo;
import org.openehr.adl.flattener.ArchetypeFlattener;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.adl.rm.RmModel;
import org.openehr.adl.serializer.ArchetypeSerializer;
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

    private Path devInspectPath;


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

                ArchetypeInfo info = createArchetypeInfo(archetype);

                archetypeInfos.add(info);
                sourceArchetypes.put(info.getArchetypeId(), archetype);
                String interfaceArchetypeId = ArchetypeIdInfo.parse(info.getArchetypeId()).toInterfaceString();
                sourceArchetypes.put(interfaceArchetypeId, archetype);
            } catch (Exception e) {
                LOG.error("Error parsing archetype from file " + repositoryPath.relativize(adlFile) + ". Archetype will be ignored", e);
            }
        }

        String devInspectPathStr = System.getProperty("designer.dev.repository.inspect.file");
        if (devInspectPathStr!=null) {
            devInspectPath = Paths.get(devInspectPathStr);
        }
    }

    private ArchetypeInfo createArchetypeInfo(DifferentialArchetype archetype) {
        ArchetypeInfo info = new ArchetypeInfo();
        info.setArchetypeId(archetype.getArchetypeId().getValue());
        info.setRmType(archetype.getDefinition().getRmTypeName());

        String mainNodeId = archetype.getDefinition().getNodeId();
        if (mainNodeId == null) {
            mainNodeId = archetype.getConcept();
        }

        String defaultLanguage = archetype.getOriginalLanguage().getCodeString();
        info.setName(findTermText(archetype, mainNodeId, defaultLanguage));
        return info;
    }

    @Override
    public void saveDifferentialArchetype(DifferentialArchetype archetype) {
        String adl = ArchetypeSerializer.serialize(archetype);

        archetype = deserializer.parse(adl); // checks if the serialization is readable
        ArchetypeIdInfo aidi = ArchetypeIdInfo.parse(archetype.getArchetypeId().getValue());
        final Path repositoryPath = Paths.get(repositoryLocation);
        final Path archetypePath = repositoryPath.resolve(aidi.toInterfaceString() + ".adls");
        LOG.info("Writing to archetype file {}", repositoryPath.relativize(archetypePath));
        try {
            /* if system property "designer.dev.repository.inspect.file" is defined, write archetype there instead of in the repository.
             * used to preserve testing environment on restart
             */
            if (devInspectPath==null)  {
                // production
                Files.write(archetypePath, adl.getBytes(Charsets.UTF_8));
            } else {
                Files.write(devInspectPath, adl.getBytes(Charsets.UTF_8));
            }

            // replace differential archetype in memory, remove flat archetype in cache
            sourceArchetypes.put(aidi.toString(), archetype);
            sourceArchetypes.put(aidi.toInterfaceString(), archetype);
            flatArchetypes.remove(aidi.toString());
            flatArchetypes.remove(aidi.toInterfaceString());

            // add or replace archetype in listing
            ArchetypeInfo info = createArchetypeInfo(archetype);
            int archetypeInfoIndex = WtUtils.indexOf(archetypeInfos, (t)->t.getArchetypeId().equals(info.getArchetypeId()));
            if (archetypeInfoIndex>=0) {
                archetypeInfos.set(archetypeInfoIndex, info);
            } else {
                archetypeInfos.add(info);
            }


        } catch (Exception e) {
            throw new RuntimeException(e);
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
            String interfaceArchetypeId = ArchetypeIdInfo.parse(archetypeId).toInterfaceString();
            result = sourceArchetypes.get(interfaceArchetypeId);
            if (result == null) {
                throw new IllegalArgumentException(archetypeId);
            }
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

    private String readArchetype(Path adlFile) throws IOException {
        return CharStreams.toString(new BomSupportingReader(
                Files.newInputStream(adlFile),
                Charsets.UTF_8));
    }
}
