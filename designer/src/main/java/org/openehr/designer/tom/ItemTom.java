package org.openehr.designer.tom;

import org.openehr.designer.tom.constraint.ConstraintTom;

/**
 * @author Marko Pipan
 */
public class ItemTom extends AbstractItemTom {
    private ConstraintTom constraints;
    private String dataAttribute;

    public ConstraintTom getConstraints() {
        return constraints;
    }

    public void setConstraints(ConstraintTom constraints) {
        this.constraints = constraints;
    }

    public String getDataAttribute() {
        return dataAttribute;
    }

    public void setDataAttribute(String dataAttribute) {
        this.dataAttribute = dataAttribute;
    }
}
