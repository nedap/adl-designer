package org.openehr.designer.tom.constraint;

/**
 * @author Marko Pipan
 */
public class CBooleanTom extends ConstraintTom {
    private boolean trueValid;
    private boolean falseValid;

    private CBooleanTom original;

    public boolean isTrueValid() {
        return trueValid;
    }

    public void setTrueValid(boolean trueValid) {
        this.trueValid = trueValid;
    }

    public boolean isFalseValid() {
        return falseValid;
    }

    public void setFalseValid(boolean falseValid) {
        this.falseValid = falseValid;
    }

    public CBooleanTom getOriginal() {
        return original;
    }

    public void setOriginal(CBooleanTom original) {
        this.original = original;
    }
}
