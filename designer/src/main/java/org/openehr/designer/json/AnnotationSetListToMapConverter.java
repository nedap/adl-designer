package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.rm.Annotation;
import org.openehr.jaxb.rm.AnnotationSet;
import org.openehr.jaxb.rm.StringDictionaryItem;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class AnnotationSetListToMapConverter extends StdConverter<List, Map> {

    @Override
    public Map convert(List value) {
        Map<String, Map<String, Map<String, String>>> result = new LinkedHashMap<>();
        for (AnnotationSet cds : (List<AnnotationSet>)value) {
            result.put(cds.getLanguage(), annotationListToMap(cds.getItems()));
        }
        return result;
    }

    private Map<String, Map<String, String>> annotationListToMap(List<Annotation> terms) {
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        for (Annotation term : terms) {
            result.put(term.getPath(), stringDictionaryItemListToMap(term.getItems()));
        }
        return result;
    }

    private Map<String, String> stringDictionaryItemListToMap(List<StringDictionaryItem> items) {
        Map<String, String> result = new LinkedHashMap<>();
        for (StringDictionaryItem item : items) {
            result.put(item.getId(), item.getValue());
        }
        return result;
    }
}
