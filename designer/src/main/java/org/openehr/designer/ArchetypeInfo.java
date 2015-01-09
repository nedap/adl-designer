package org.openehr.designer;

/**
 * @author Marko Pipan
 */
public class ArchetypeInfo {
    private String archetypeId;
    private String rmType;
    private String name;


    public ArchetypeInfo(String archetypeId, String rmType, String name) {
        this.archetypeId = archetypeId;
        this.rmType = rmType;
        this.name = name;
    }

    public ArchetypeInfo() {
    }

    public String getArchetypeId() {
        return archetypeId;
    }

    public void setArchetypeId(String archetypeId) {
        this.archetypeId = archetypeId;
    }

    public String getRmType() {
        return rmType;
    }

    public void setRmType(String rmType) {
        this.rmType = rmType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
