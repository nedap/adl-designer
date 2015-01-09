package org.openehr.designer.tom.constraint;

import com.google.common.collect.Lists;
import org.openehr.adl.util.AdlUtils;
import org.openehr.jaxb.rm.IntervalOfReal;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class CRealTom extends ConstraintTom {
    private Float defaultValue;
    private List<Float> list;
    private IntervalOfReal range;

    private CRealTom original;

    public CRealTom() {
    }

    public CRealTom(CRealTom other) {
        defaultValue=other.defaultValue;
        list= other.list!=null ? Lists.newArrayList(other.list) : null;
        range = other.range!=null ? AdlUtils.makeClone(other.range) : null;
    }


    public Float getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(Float defaultValue) {
        this.defaultValue = defaultValue;
    }

    public List<Float> getList() {
        return list;
    }

    public void setList(List<Float> list) {
        this.list = list;
    }

    public IntervalOfReal getRange() {
        return range;
    }

    public void setRange(IntervalOfReal range) {
        this.range = range;
    }

    public CRealTom getOriginal() {
        return original;
    }

    public void setOriginal(CRealTom original) {
        this.original = original;
    }
}
