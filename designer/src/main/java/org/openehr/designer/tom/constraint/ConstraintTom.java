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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import org.openehr.designer.tom.AbstractTom;

/**
 * @author Marko Pipan
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type")
@JsonSubTypes(value = {
        @JsonSubTypes.Type(value = CComplexObjectTom.class, name = "C_COMPLEX_OBJECT"),
        @JsonSubTypes.Type(value = CIntegerTom.class, name = "C_INTEGER"),
        @JsonSubTypes.Type(value = CRealTom.class, name = "C_REAL"),
        @JsonSubTypes.Type(value = CStringTom.class, name = "C_STRING"),
        @JsonSubTypes.Type(value = CTerminologyCodeTom.class, name = "C_TERMINOLOGY_CODE"),
        @JsonSubTypes.Type(value = CDateTimeTom.class, name = "C_DATE_TIME"),
        @JsonSubTypes.Type(value = CDateTom.class, name = "C_DATE"),
        @JsonSubTypes.Type(value = CTimeTom.class, name = "C_TIME"),
        @JsonSubTypes.Type(value = CBooleanTom.class, name = "C_BOOLEAN"),
        @JsonSubTypes.Type(value = CDurationTom.class, name = "C_DURATION"),
        @JsonSubTypes.Type(value = TupleConstraintTom.class, name = "tuple")
})
abstract public class ConstraintTom extends AbstractTom {
    private String attribute;
    private String rmType;

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public String getRmType() {
        return rmType;
    }

    public void setRmType(String rmType) {
        this.rmType = rmType;
    }
}
