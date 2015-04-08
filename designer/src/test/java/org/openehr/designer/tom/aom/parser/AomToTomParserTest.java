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

package org.openehr.designer.tom.aom.parser;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.designer.repository.FlatArchetypeRepository;
import org.openehr.designer.repository.file.FileArchetypeRepository;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.InputStream;
import java.io.Reader;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class AomToTomParserTest {

    private final RmModel rmModel = OpenEhrRmModel.getInstance();
    private FileArchetypeRepository archetypeRepository;
    private FlatArchetypeRepository flatArchetypeRepository;

    @BeforeClass
    public void init() throws Exception {

        URL myTestURL = ClassLoader.getSystemResource("repository/openEHR-EHR-EVALUATION.alert.v1.adls");
        Path repositoryPath = Paths.get(myTestURL.toURI()).getParent();

        archetypeRepository = new FileArchetypeRepository();
        archetypeRepository.setRepositoryLocation(repositoryPath.toString());
        archetypeRepository.init();
        flatArchetypeRepository = new FlatArchetypeRepository(archetypeRepository, rmModel);

    }


    @Test
    public void testParseTuple() throws Exception {

        final String templateAdls;
        InputStream is = getClass().getClassLoader().getResourceAsStream("template/encounter_bodyweight_tuple.adlt");
        try (Reader reader = new BomSupportingReader(is, Charsets.UTF_8)) {
            templateAdls = CharStreams.toString(reader);
        }


        List<DifferentialArchetype> templateArchetypes = TemplateDeserializer.deserialize(rmModel, templateAdls);
        TemplateTom templateTom = new AomToTomParser(rmModel, flatArchetypeRepository, templateArchetypes).parse();

        String tomStr = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(templateTom);
//        System.out.println(tomStr);
    }


    @Test
    public void testParseQuantity() throws Exception {

        final String templateAdls;
        InputStream is = getClass().getClassLoader().getResourceAsStream("template/encounter_bodyweight_quantity.adlt");
        try (Reader reader = new BomSupportingReader(is, Charsets.UTF_8)) {
            templateAdls = CharStreams.toString(reader);
        }


        List<DifferentialArchetype> templateArchetypes = TemplateDeserializer.deserialize(rmModel, templateAdls);
        TemplateTom templateTom = new AomToTomParser(rmModel, flatArchetypeRepository, templateArchetypes).parse();

        String tomStr = new ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL).writerWithDefaultPrettyPrinter().writeValueAsString(templateTom);
//        System.out.println(tomStr);



    }
}