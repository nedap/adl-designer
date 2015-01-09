package org.openehr.designer.tom.constraint;


import com.google.common.collect.Lists;
import org.openehr.adl.util.AdlUtils;
import org.openehr.jaxb.rm.IntervalOfInteger;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class CIntegerTom extends ConstraintTom {
    private Integer defaultValue;
    private List<Integer> list;
    private IntervalOfInteger range;
    private CIntegerTom original;

    public CIntegerTom() {
    }

    public CIntegerTom(CIntegerTom other) {
        defaultValue=other.defaultValue;
        list= other.list!=null ? Lists.newArrayList(other.list) : null;
        range = other.range!=null ? AdlUtils.makeClone(other.range) : null;
    }

    public Integer getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(Integer defaultValue) {
        this.defaultValue = defaultValue;
    }

    public List<Integer> getList() {
        return list;
    }

    public void setList(List<Integer> list) {
        this.list = list;
    }

    public IntervalOfInteger getRange() {
        return range;
    }

    public void setRange(IntervalOfInteger range) {
        this.range = range;
    }

    public CIntegerTom getOriginal() {
        return original;
    }

    public void setOriginal(CIntegerTom original) {
        this.original = original;
    }
}
