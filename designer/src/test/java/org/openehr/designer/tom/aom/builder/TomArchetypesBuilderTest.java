package org.openehr.designer.tom.aom.builder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import org.openehr.designer.ObjectMapperFactoryBean;
import org.openehr.designer.TestArchetypeRespository;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

public class TomArchetypesBuilderTest {
    ObjectMapper objectMapper;
    @BeforeClass
    public void setUp() throws Exception {
        ObjectMapperFactoryBean factory = new ObjectMapperFactoryBean();
        objectMapper = factory.getObject();
    }

    @Test
    public void testTerminologyCodeConstraints() throws Exception {
        final InputStream is = getClass().getClassLoader().getResourceAsStream("tom/terminology-code-constraint.json");

        TemplateTom tom = objectMapper.readValue(new InputStreamReader(is, Charsets.UTF_8), TemplateTom.class);

        final ArrayList<DifferentialArchetype> createdArchetypes = new ArrayList<>();
        new TomArchetypesBuilder(TestArchetypeRespository.getInstance(), createdArchetypes).build(tom);

        String templateAdls = TemplateSerializer.serialize(createdArchetypes);
//        Files.write(Paths.get("c:/temp/template.adlt"), templateAdls.getBytes(Charsets.UTF_8));
    }

    @Test
    public void testTupleConstraint() throws Exception {
        final InputStream is = getClass().getClassLoader().getResourceAsStream("tom/tuple-constraint.json");

        TemplateTom tom = objectMapper.readValue(new InputStreamReader(is, Charsets.UTF_8), TemplateTom.class);
        final ArrayList<DifferentialArchetype> createdArchetypes = new ArrayList<>();
        new TomArchetypesBuilder(TestArchetypeRespository.getInstance(), createdArchetypes).build(tom);


        String templateAdls = TemplateSerializer.serialize(createdArchetypes);
//        Files.write(Paths.get("c:/temp/template.adlt"), templateAdls.getBytes(Charsets.UTF_8));

    }
}