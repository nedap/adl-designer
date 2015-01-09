package org.openehr.designer.repository;

import org.openehr.jaxb.am.DifferentialArchetype;

import java.util.List;

/**
 * @author Marko Pipan
 */
public interface TemplateRepository {

    List<TemplateInfo> listTemplates();
    void saveTemplate(List<DifferentialArchetype> archetypes);
    List<DifferentialArchetype> loadTemplate(String templateId);
}
