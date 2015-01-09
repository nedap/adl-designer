package org.openehr.designer.tom.constraint;

import org.openehr.jaxb.rm.IntervalOfDuration;

/**
 * @author Marko Pipan
 */
public class CDurationTom extends ConstraintTom {
    private String pattern;
    private IntervalOfDuration range;
    private CDurationTom original;

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public IntervalOfDuration getRange() {
        return range;
    }

    public void setRange(IntervalOfDuration range) {
        this.range = range;
    }

    public CDurationTom getOriginal() {
        return original;
    }

    public void setOriginal(CDurationTom original) {
        this.original = original;
    }
}
