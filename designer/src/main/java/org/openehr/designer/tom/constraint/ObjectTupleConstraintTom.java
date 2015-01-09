package org.openehr.designer.tom.constraint;

import org.openehr.designer.tom.AbstractTom;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class ObjectTupleConstraintTom extends AbstractTom {
    private boolean present;
    private List<ConstraintTom> members;

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public List<ConstraintTom> getMembers() {
        return members;
    }

    public void setMembers(List<ConstraintTom> members) {
        this.members = members;
    }
}
