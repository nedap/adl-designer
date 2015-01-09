package org.openehr.designer.json;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.annotation.JsonTypeIdResolver;

/**
 * @author Marko Pipan
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.CUSTOM,
              include = JsonTypeInfo.As.PROPERTY,
              property = "@type")
@JsonTypeIdResolver(AmTypeIdResolver.class)
public class AmObjectMixin {
}
