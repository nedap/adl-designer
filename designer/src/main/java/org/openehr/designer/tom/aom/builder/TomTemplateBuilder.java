package org.openehr.designer.tom.aom.builder;

import org.openehr.designer.ArchetypeRepository;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.jaxb.am.DifferentialArchetype;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Marko Pipan
 */
public class TomTemplateBuilder {
    private final ArchetypeRepository archetypeRepository;

    public TomTemplateBuilder(ArchetypeRepository archetypeRepository) {
        this.archetypeRepository = archetypeRepository;
    }


    public List<DifferentialArchetype> build(TemplateTom templateTom) {
        List<DifferentialArchetype> result = new ArrayList<>();
        new TomArchetypesBuilder(archetypeRepository, result).build(templateTom);
        return result;

    }


}
