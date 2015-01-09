package org.openehr.designer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import org.openehr.designer.json.AmMixinModule;
import org.springframework.beans.factory.FactoryBean;

/**
 * @author markopi
 */
public class ObjectMapperFactoryBean implements FactoryBean<ObjectMapper> {
    @Override
    public ObjectMapper getObject() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        mapper.registerModule(new AmMixinModule());
        mapper.registerModule(new JaxbAnnotationModule());
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

        return mapper;
    }

    @Override
    public Class<?> getObjectType() {
        return ObjectMapper.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }
}
