package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ArchetypeTerm;
import org.openehr.jaxb.am.CodeDefinitionSet;
import org.openehr.jaxb.rm.StringDictionaryItem;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class CodeDefinitionListToMapConverter extends StdConverter<List, Map> {

    @Override
    public Map convert(List value) {
        Map<String, Map<String, Map<String, String>>> result = new LinkedHashMap<>();
        for (CodeDefinitionSet cds : (List<CodeDefinitionSet>)value) {
            result.put(cds.getLanguage(), archetypeTermListToMap(cds.getItems()));
        }
        return result;
    }

    private Map<String, Map<String, String>> archetypeTermListToMap(List<ArchetypeTerm> terms) {
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        for (ArchetypeTerm term : terms) {
            result.put(term.getCode(), stringDictionaryItemListToMap(term.getItems()));
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
