/*
 * ADL Designer
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-tools.
 *
 * ADL2-tools is free software: you can redistribute it and/or modify
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

package org.openehr.designer.web;

import org.openehr.designer.ArchetypeInfo;
import org.openehr.designer.ReferenceModelData;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

/**
 * @author Marko Pipan
 */
public interface RepositoryResource {
    DifferentialArchetype getSourceArchetype(String archetypeId);

    FlatArchetype getFlatArchetype(String archetypeId);

    void saveFlatArchetype(String archetypeId, FlatArchetype archetype);

    List<ArchetypeInfo> listArchetypeInfos();

//    ReferenceModelData getRmModel(String modelName, String modelVersion) throws IOException;

    void saveTemplate(List<FlatArchetype> archetypeList);

    List<TemplateInfo> listTemplates();

    List<FlatArchetype> loadTemplate(String templateId);

    ResponseEntity<byte[]> exportSavedOpt14(String templateId);

    ResponseEntity<byte[]> exportProvidedOpt14(List<FlatArchetype> flatArchetypeList);


    ResponseEntity<byte[]> exportAdlt(String templateId);

    String displayArchetypeAdlSource(FlatArchetype archetype);

    String displayArchetypeAdlFlat(FlatArchetype archetype);

    String displayTemplateAdl(List<FlatArchetype> archetypeList);

    void commit(CommitRequest commitRequest);

}
