package org.openehr.designer.tom.constraint;

import org.openehr.jaxb.rm.IntervalOfDate;

/**
 * @author Marko Pipan
 */
public class CDateTom extends ConstraintTom {
    private String pattern;

    private IntervalOfDate range;
    private CDateTom original;

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public IntervalOfDate getRange() {
        return range;
    }

    public void setRange(IntervalOfDate range) {
        this.range = range;
    }

    public CDateTom getOriginal() {
        return original;
    }

    public void setOriginal(CDateTom original) {
        this.original = original;
    }
}
