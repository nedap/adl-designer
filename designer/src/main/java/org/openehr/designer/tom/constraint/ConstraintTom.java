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
