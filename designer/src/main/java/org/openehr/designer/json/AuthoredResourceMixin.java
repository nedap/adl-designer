package org.openehr.designer.json;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.openehr.jaxb.rm.AnnotationSet;
import org.openehr.jaxb.rm.AuthoredResource;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class AuthoredResourceMixin extends AuthoredResource{
    @JsonDeserialize(converter = AnnotationSetMapToListConverter.class)
    @JsonSerialize(converter = AnnotationSetListToMapConverter.class)
    @Override
    public List<AnnotationSet> getAnnotations() {
        return super.getAnnotations();
    }
}
