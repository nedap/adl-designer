package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ValueSetItem;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class ValueSetListToMapConverter extends StdConverter<List, Map> {
    @Override
    public Map convert(List value) {
        List<ValueSetItem> from = value;
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        for (ValueSetItem valueSetItem : from) {
            result.put(valueSetItem.getId(), convertItemToMap(valueSetItem));

        }
        return result;
    }

    private Map<String, Object> convertItemToMap(ValueSetItem valueSetItem) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", valueSetItem.getId());
        result.put("members", valueSetItem.getMembers());
        return result;
    }
}
