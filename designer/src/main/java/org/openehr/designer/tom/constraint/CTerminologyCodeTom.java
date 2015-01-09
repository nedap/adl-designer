package org.openehr.designer.tom.constraint;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Marko Pipan
 */
public class CTerminologyCodeTom extends ConstraintTom {
    private List<String> codeList;
    private CTerminologyCodeTom original;

    @JsonProperty(value = "code_list")
    public List<String> getCodeList() {
        if (codeList == null) {
            codeList = new ArrayList<>();
        }
        return codeList;
    }

    public void setCodeList(List<String> codeList) {
        this.codeList = codeList;
    }


    public CTerminologyCodeTom getOriginal() {
        return original;
    }

    public void setOriginal(CTerminologyCodeTom original) {
        this.original = original;
    }

}
