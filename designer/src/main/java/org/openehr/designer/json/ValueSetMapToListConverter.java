package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ValueSetItem;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class ValueSetMapToListConverter extends StdConverter<Map, List> {
    @SuppressWarnings("unchecked")
    @Override
    public List convert(Map value) {
        Map<String, Map<String, Object>> from = value;
        List<ValueSetItem> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> vsEntry : from.entrySet()) {
            ValueSetItem vs = new ValueSetItem();
            vs.setId(vsEntry.getKey());
            if (vsEntry.getValue() != null) {
                if (vsEntry.getValue().get("members") != null) {
                    vs.getMembers().addAll((Collection<String>) vsEntry.getValue().get("members"));
                }
            }
        }
        return result;
    }

}
