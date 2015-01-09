package org.openehr.designer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openehr.designer.ObjectMapperFactoryBean;
import org.openehr.jaxb.am.CReal;
import org.testng.annotations.Test;

import java.util.Map;

import static org.fest.assertions.Assertions.assertThat;

public class ObjectMapperFactoryBeanTest {

    @Test
    public void testSerialize() throws Exception {
        ObjectMapperFactoryBean factory = new ObjectMapperFactoryBean();
        ObjectMapper mapper = factory.getObject();

        CReal creal = new CReal();
        creal.setAssumedValue((float)12.0);

        String str = mapper.writeValueAsString(creal);
        Map<String, Object> map = mapper.readValue(str, Map.class);
        assertThat(map.get("@type")).isEqualTo("C_REAL");
        assertThat((double)map.get("assumed_value")).isEqualTo(12.0);

    }
}