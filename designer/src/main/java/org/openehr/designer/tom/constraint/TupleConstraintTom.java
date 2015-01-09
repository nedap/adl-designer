package org.openehr.designer.tom.constraint;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class TupleConstraintTom extends ConstraintTom {
    private boolean hasParent;
    private List<String> members;
    private List<ObjectTupleConstraintTom> children;

    public List<String> getMembers() {
        return members;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }

    public boolean isHasParent() {
        return hasParent;
    }

    public void setHasParent(boolean hasParent) {
        this.hasParent = hasParent;
    }

    public List<ObjectTupleConstraintTom> getChildren() {
        return children;
    }

    public void setChildren(List<ObjectTupleConstraintTom> children) {
        this.children = children;
    }
}
