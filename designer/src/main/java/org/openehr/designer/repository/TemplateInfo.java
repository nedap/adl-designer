package org.openehr.designer.repository;

import org.apache.commons.lang.ObjectUtils;

public class TemplateInfo implements Comparable<TemplateInfo> {
    private String templateId;
    private String rmType;
    private String name;


    public TemplateInfo(String templateId, String rmType, String name) {
        this.templateId = templateId;
        this.rmType = rmType;
        this.name = name;
    }

    public TemplateInfo() {
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getRmType() {
        return rmType;
    }

    public void setRmType(String rmType) {
        this.rmType = rmType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(TemplateInfo o) {
        return ObjectUtils.compare(getName(), o.getName());
    }
}