package org.openehr.designer.tom;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type")
@JsonSubTypes(value = {
        @JsonSubTypes.Type(value = ItemTom.class, name = "item"),
        @JsonSubTypes.Type(value = ArchetypeTom.class, name = "archetype"),
        @JsonSubTypes.Type(value = TemplateTom.class, name = "template")
})

abstract public class AbstractItemTom extends AbstractTom {
    private Map<String, LocalizedNameTom> terms;
    private String path;
    private String nodeId;
    private OccurrencesTom occurrences;
    private List<AbstractItemTom> items;
    private String rmType;
    private Map<String, Map<String, String>> annotations;

    public OccurrencesTom getOccurrences() {
        return occurrences;
    }

    public void setOccurrences(OccurrencesTom occurrences) {
        this.occurrences = occurrences;
    }

    public Map<String, LocalizedNameTom> getTerms() {
        return terms;
    }

    public void setTerms(Map<String, LocalizedNameTom> terms) {
        this.terms = terms;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<AbstractItemTom> getItems() {
        return items;
    }

    public void setItems(List<AbstractItemTom> items) {
        this.items = items;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getRmType() {
        return rmType;
    }

    public void setRmType(String rmType) {
        this.rmType = rmType;
    }

    public Map<String, Map<String, String>> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(Map<String, Map<String, String>> annotations) {
        this.annotations = annotations;
    }
}
