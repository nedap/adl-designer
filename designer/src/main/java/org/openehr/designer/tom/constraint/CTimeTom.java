package org.openehr.designer.tom.constraint;

import org.openehr.jaxb.rm.IntervalOfTime;

/**
 * @author Marko Pipan
 */
public class CTimeTom extends ConstraintTom {
    private String pattern;
    private IntervalOfTime range;
    private CTimeTom original;

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public IntervalOfTime getRange() {
        return range;
    }

    public void setRange(IntervalOfTime range) {
        this.range = range;
    }

    public CTimeTom getOriginal() {
        return original;
    }

    public void setOriginal(CTimeTom original) {
        this.original = original;
    }
}
