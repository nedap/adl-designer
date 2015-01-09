package org.openehr.designer.tom.aom.parser;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.designer.ArchetypeRepositoryImpl;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.designer.tom.aom.parser.AomToTomParser;
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

    private final RmModel rmModel = new OpenEhrRmModel();
    private ArchetypeRepositoryImpl archetypeRepository;

    @BeforeClass
    public void init() throws Exception {

        URL myTestURL = ClassLoader.getSystemResource("repository/openEHR-EHR-EVALUATION.alert.v1.adls");
        Path repositoryPath = Paths.get(myTestURL.toURI()).getParent();

        archetypeRepository = new ArchetypeRepositoryImpl();
        archetypeRepository.setRepositoryLocation(repositoryPath.toString());
        archetypeRepository.init();

    }


    @Test
    public void testParseTuple() throws Exception {

        final String templateAdls;
        InputStream is = getClass().getClassLoader().getResourceAsStream("template/encounter_bodyweight_tuple.adlt");
        try (Reader reader = new BomSupportingReader(is, Charsets.UTF_8)) {
            templateAdls = CharStreams.toString(reader);
        }


        List<DifferentialArchetype> templateArchetypes = TemplateDeserializer.deserialize(rmModel, templateAdls);
        TemplateTom templateTom = new AomToTomParser(rmModel, archetypeRepository, templateArchetypes).parse();

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
        TemplateTom templateTom = new AomToTomParser(rmModel, archetypeRepository, templateArchetypes).parse();

        String tomStr = new ObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL).writerWithDefaultPrettyPrinter().writeValueAsString(templateTom);
//        System.out.println(tomStr);



    }
}