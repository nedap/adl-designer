package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.TermBindingItem;
import org.openehr.jaxb.am.TermBindingSet;
import org.openehr.jaxb.rm.CodePhrase;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class TermBindingListToMapConverter extends StdConverter<List, Map> {
    @Override
    public Map convert(List value) {
        Map<String, Map<String, CodePhrase>> result = new LinkedHashMap<>();
        for (TermBindingSet tbsEntry : (List<TermBindingSet>)value) {
            result.put(tbsEntry.getTerminology(), buildTermBindingItems(tbsEntry.getItems()));
        }
        return result;
    }

    private Map<String, CodePhrase> buildTermBindingItems(List<TermBindingItem> items) {
        Map<String, CodePhrase> result = new LinkedHashMap<>();
        for (TermBindingItem item : items) {
            result.put(item.getCode(), item.getValue());
        }

        return result;
    }

}
