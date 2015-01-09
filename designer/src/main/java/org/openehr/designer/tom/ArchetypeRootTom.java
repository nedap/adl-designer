package org.openehr.designer.tom;

/**
 * @author Marko Pipan
 */
abstract public class ArchetypeRootTom extends AbstractItemTom {
    private String parentArchetypeId;
    private String archetypeId;

    public String getArchetypeId() {
        return archetypeId;
    }

    public void setArchetypeId(String archetypeId) {
        this.archetypeId = archetypeId;
    }

    public String getParentArchetypeId() {
        return parentArchetypeId;
    }

    public void setParentArchetypeId(String parentArchetypeId) {
        this.parentArchetypeId = parentArchetypeId;
    }
}
