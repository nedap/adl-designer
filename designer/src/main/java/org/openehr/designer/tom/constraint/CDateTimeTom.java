package org.openehr.designer.tom.constraint;

import org.openehr.jaxb.rm.IntervalOfDateTime;

/**
 * @author Marko Pipan
 */
public class CDateTimeTom extends ConstraintTom {
    private String pattern;
    private IntervalOfDateTime range;

    private CDateTimeTom original;

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public IntervalOfDateTime getRange() {
        return range;
    }

    public void setRange(IntervalOfDateTime range) {
        this.range = range;
    }

    public CDateTimeTom getOriginal() {
        return original;
    }

    public void setOriginal(CDateTimeTom original) {
        this.original = original;
    }
}
