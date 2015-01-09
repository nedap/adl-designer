package org.openehr.designer.tom;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openehr.designer.ObjectMapperFactoryBean;
import org.openehr.designer.tom.AbstractTom;
import org.openehr.designer.tom.TemplateTom;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author Marko Pipan
 */
public class TomDeserializerTest {
    ObjectMapper objectMapper;
    @BeforeClass
    public void setUp() throws Exception {
        ObjectMapperFactoryBean factory = new ObjectMapperFactoryBean();
        objectMapper = factory.getObject();
    }
    @Test
    public void testTerminologyCodeConstraint() throws IOException {
        final InputStream is = getClass().getClassLoader().getResourceAsStream("tom/terminology-code-constraint.json");
        AbstractTom tom = objectMapper.readValue(is, TemplateTom.class);
    }
}
