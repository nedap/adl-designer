package org.openehr.designer.json;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.designer.json.AmMixinModule;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.jaxb.am.Archetype;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.Map;

import static org.fest.assertions.Assertions.assertThat;

/**
 * @author Marko Pipan
 */
public class JsonSerializerTest {
    ObjectMapper objectMapper;
    AdlDeserializer deserializer;
    DifferentialArchetype differentialAlert;
    DifferentialArchetype differentialAlertZn;

    @BeforeClass
    public void init() throws IOException {
        objectMapper = new ObjectMapper();

        JaxbAnnotationModule jaxbModule = new JaxbAnnotationModule();
        objectMapper.registerModule(jaxbModule);
        objectMapper.registerModule(new AmMixinModule());

        final OpenEhrRmModel rmModel = new OpenEhrRmModel();
        deserializer = new AdlDeserializer(rmModel);

        differentialAlert = deserializer.parse(readArchetype("repository/openEHR-EHR-EVALUATION.alert.v1.adls"));
        differentialAlertZn = deserializer.parse(readArchetype("repository/openEHR-EHR-EVALUATION.alert-zn.v1.adls"));
    }

    private String readArchetype(String file) throws IOException {
        return CharStreams.toString(new BomSupportingReader(
                getClass().getClassLoader().getResourceAsStream(file),
                Charsets.UTF_8));
    }


    @Test
    public void serializeDifferentialAsJson() throws IOException {
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(differentialAlert);
        Map<String, Object> archetypeMap = objectMapper.readValue(jsonString, Map.class);
        Map<String, Object> descriptionMap = (Map<String, Object>) archetypeMap.get("description");
        assertThat(descriptionMap.get("lifecycle_state")).isEqualTo("AuthorDraft");

        jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(differentialAlertZn);
        //System.out.println(jsonString);

        Object object = objectMapper.readValue(jsonString, Archetype.class);


    }

    @Test
    public void testConstraintBindings() throws IOException {
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(differentialAlert);
        Map<String, Object> archetypeMap = objectMapper.readValue(jsonString, Map.class);
        Map<String, Object> descriptionMap = (Map<String, Object>) archetypeMap.get("description");
        assertThat(descriptionMap.get("lifecycle_state")).isEqualTo("AuthorDraft");
        //System.out.println(jsonString);

        jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(differentialAlertZn);

        Archetype a = objectMapper.readValue(jsonString, Archetype.class);
    }

    @Test
    public void flattenAndSerializeAsJson() throws IOException {
        DifferentialArchetype bp = deserializer.parse(readArchetype("repository/openEHR-EHR-EVALUATION.alert.v1.adls"));

        String jsonString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(bp);
        //System.out.println(jsonString);

        Archetype a = objectMapper.readValue(jsonString, Archetype.class);
    }
}
