/*
 * ADL2-core
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-core.
 *
 * ADL2-core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
