package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.adl.am.AmObjectFactory;
import org.openehr.jaxb.am.TermBindingItem;
import org.openehr.jaxb.am.TermBindingSet;
import org.openehr.jaxb.rm.CodePhrase;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static org.openehr.adl.rm.RmObjectFactory.newTerminologyId;

/**
 * @author Marko Pipan
 */
public class TermBindingMapToListConverter extends StdConverter<Map<String, Map<String, Map<String, Object>>>, List<TermBindingSet>> {

    @Override
    public List<TermBindingSet> convert(Map<String, Map<String, Map<String, Object>>> value) {
        return value.entrySet()
                .stream()
                .map(tbsEntry -> AmObjectFactory.newTermBindingSet(tbsEntry.getKey(), buildTermBindingItem(tbsEntry.getValue())))
                .collect(Collectors.toList());
    }

    private List<TermBindingItem> buildTermBindingItem(Map<String, Map<String, Object>> value) {
        return value.entrySet()
                .stream()
                .map(tbiEntry -> AmObjectFactory.newTermBindingItem(tbiEntry.getKey(), parseCodePhrase(tbiEntry.getValue())))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private CodePhrase parseCodePhrase(Map<String, Object> cp) {
        if (cp == null) return null;
        CodePhrase result = new CodePhrase();
        result.setCodeString(Objects.toString(cp.get("code_string")));
        Map<String, Object> ti = (Map<String, Object>) cp.get("terminology_id");
        if (ti != null) {
            result.setTerminologyId(newTerminologyId(Objects.toString(ti.get("value"))));
        }

        return result;
    }
}
