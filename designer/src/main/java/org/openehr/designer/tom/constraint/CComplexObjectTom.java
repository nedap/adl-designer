package org.openehr.designer.tom.constraint;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class CComplexObjectTom extends ConstraintTom {
    private List<ConstraintTom> children;

    public List<ConstraintTom> getChildren() {
        return children;
    }

    public void setChildren(List<ConstraintTom> children) {
        this.children = children;
    }
}
