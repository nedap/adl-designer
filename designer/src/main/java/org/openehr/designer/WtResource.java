package org.openehr.designer;

import org.openehr.designer.repository.TemplateInfo;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Marko Pipan
 */
public interface WtResource {
    DifferentialArchetype getSourceArchetype(String archetypeId);

    FlatArchetype getFlatArchetype(String archetypeId);

    List<ArchetypeInfo> listArchetypeInfos();

    ReferenceModelData getRmModel(String modelName, String modelVersion);

    void saveTom(TemplateTom templateTom);

    TemplateTom loadTom(String templateId);

    List<TemplateInfo> listToms();

    ResponseEntity<byte[]> exportOpt14(String templateId);

}
