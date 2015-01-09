package org.openehr.designer.tom.constraint;

import java.util.List;

/**
 * @author Marko Pipan
 */
public class CStringTom extends ConstraintTom {
    private List<String> list;
    private CStringTom original;

    public List<String> getList() {
        return list;
    }

    public void setList(List<String> list) {
        this.list = list;
    }

    public CStringTom getOriginal() {
        return original;
    }

    public void setOriginal(CStringTom original) {
        this.original = original;
    }
}
