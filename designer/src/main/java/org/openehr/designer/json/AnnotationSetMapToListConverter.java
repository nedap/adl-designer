package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.rm.Annotation;
import org.openehr.jaxb.rm.AnnotationSet;
import org.openehr.jaxb.rm.StringDictionaryItem;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class AnnotationSetMapToListConverter extends StdConverter<Map, List> {
    @Override
    public List convert(Map value) {
        Map<String, Map<String, Map<String, String>>> from = value;
        List<AnnotationSet> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, Map<String, String>>> cdsEntry : from.entrySet()) {
            AnnotationSet cds = new AnnotationSet();
            cds.setLanguage(cdsEntry.getKey());
            addAnnotations(cds.getItems(), cdsEntry.getValue());
            result.add(cds);
        }

        return result;
    }

    private void addAnnotations(List<Annotation> target, Map<String, Map<String, String>> from) {
        for (Map.Entry<String, Map<String, String>> atEntry : from.entrySet()) {
            Annotation at = new Annotation();
            at.setPath(atEntry.getKey());
            addStringDictionaryItems(at.getItems(), atEntry.getValue());
            target.add(at);
        }
    }

    private void addStringDictionaryItems(List<StringDictionaryItem> target, Map<String, String> value) {
        for (Map.Entry<String, String> sdiEntry : value.entrySet()) {
            StringDictionaryItem sdi = new StringDictionaryItem();
            sdi.setId(sdiEntry.getKey());
            sdi.setValue(sdiEntry.getValue());
            target.add(sdi);
        }
    }
}
