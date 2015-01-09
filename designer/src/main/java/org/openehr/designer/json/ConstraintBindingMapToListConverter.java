package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.am.ConstraintBindingItem;
import org.openehr.jaxb.am.ConstraintBindingSet;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.openehr.adl.am.AmObjectFactory.newConstraintBindingItem;

/**
 * @author Marko Pipan
 */
public class ConstraintBindingMapToListConverter extends StdConverter<Map, List> {
    @Override
    public List convert(Map value) {
        Map<String, Map<String, String>> from = value;
        List<ConstraintBindingSet> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> cbsEntry : from.entrySet()) {
            ConstraintBindingSet cbs = new ConstraintBindingSet();
            cbs.setTerminology(cbsEntry.getKey());
            addCbsItems(cbs.getItems(), cbsEntry.getValue());
        }
        return result;
    }

    private void addCbsItems(List<ConstraintBindingItem> target, Map<String, String> cbiMap) {
        for (Map.Entry<String, String> cbiEntry : cbiMap.entrySet()) {
            target.add(newConstraintBindingItem(cbiEntry.getKey(), cbiEntry.getValue()));
        }
    }
}
