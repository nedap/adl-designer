package org.openehr.designer.json;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.openehr.jaxb.am.*;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class ArchetypeOntologyMixin extends ArchetypeOntology {

    @JsonDeserialize(converter = CodeDefinitionMapToListConverter.class)
    @JsonSerialize(converter = CodeDefinitionListToMapConverter.class)
    @Override
    public List<CodeDefinitionSet> getTermDefinitions() {
        return super.getTermDefinitions();
    }

    @JsonDeserialize(converter = CodeDefinitionMapToListConverter.class)
    @JsonSerialize(converter = CodeDefinitionListToMapConverter.class)
    @Override
    public List<CodeDefinitionSet> getConstraintDefinitions() {
        return super.getConstraintDefinitions();
    }

    @JsonDeserialize(converter = CodeDefinitionMapToListConverter.class)
    @JsonSerialize(converter = CodeDefinitionListToMapConverter.class)
    @Override
    public List<CodeDefinitionSet> getTerminologyExtracts() {
        return super.getTerminologyExtracts();
    }

    @JsonDeserialize(converter = TermBindingMapToListConverter.class)
    @JsonSerialize(converter = TermBindingListToMapConverter.class)
    @Override
    public List<TermBindingSet> getTermBindings() {
        return super.getTermBindings();
    }

    @JsonDeserialize(converter = ConstraintBindingMapToListConverter.class)
    @JsonSerialize(converter = ConstraintBindingListToMapConverter.class)
    @Override
    public List<ConstraintBindingSet> getConstraintBindings() {
        return super.getConstraintBindings();
    }

    @JsonDeserialize(converter = ValueSetMapToListConverter.class)
    @JsonSerialize(converter = ValueSetListToMapConverter.class)
    @Override
    public List<ValueSetItem> getValueSets() {
        return super.getValueSets();
    }
}
