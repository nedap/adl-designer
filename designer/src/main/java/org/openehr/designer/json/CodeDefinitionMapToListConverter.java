package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ArchetypeTerm;
import org.openehr.jaxb.am.CodeDefinitionSet;
import org.openehr.jaxb.rm.StringDictionaryItem;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class CodeDefinitionMapToListConverter extends StdConverter<Map, List> {
    @Override
    public List convert(Map value) {
        Map<String, Map<String, Map<String, String>>> from = value;
        List<CodeDefinitionSet> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, Map<String, String>>> cdsEntry : from.entrySet()) {
            CodeDefinitionSet cds = new CodeDefinitionSet();
            cds.setLanguage(cdsEntry.getKey());
            addArchetypeTerms(cds.getItems(), cdsEntry.getValue());
            result.add(cds);
        }

        return result;
    }

    private void addArchetypeTerms(List<ArchetypeTerm> target, Map<String, Map<String, String>> from) {
        for (Map.Entry<String, Map<String, String>> atEntry : from.entrySet()) {
            ArchetypeTerm at = new ArchetypeTerm();
            at.setCode(atEntry.getKey());
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
