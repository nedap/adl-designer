package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ConstraintBindingItem;
import org.openehr.jaxb.am.ConstraintBindingSet;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class ConstraintBindingListToMapConverter extends StdConverter<List<ConstraintBindingSet>, Map<String, Map<String, String>>> {
    @Override
    public Map<String, Map<String, String>> convert(List<ConstraintBindingSet> value) {
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        for (ConstraintBindingSet cbs : value) {
            result.put(cbs.getTerminology(), convertItemList(cbs.getItems()));
        }
        return result;
    }

    private Map<String, String> convertItemList(List<ConstraintBindingItem> items) {
        Map<String, String> result = new LinkedHashMap<>();
        for (ConstraintBindingItem item : items) {
            result.put(item.getCode(), item.getValue());
        }
        return result;
    }
}
