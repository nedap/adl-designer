/*
 * ADL2-tools
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

package org.openehr.designer.repository;

import org.openehr.designer.ArchetypeInfo;
import org.openehr.jaxb.am.ArchetypeTerm;
import org.openehr.jaxb.am.CodeDefinitionSet;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.rm.StringDictionaryItem;
import org.openehr.jaxb.rm.TranslationDetails;

import java.util.ArrayList;

/**
 * @author markopi
 */
abstract public class AbstractArchetypeRepository implements ArchetypeRepository {
    protected ArchetypeInfo createArchetypeInfo(DifferentialArchetype archetype) {
        ArchetypeInfo info = new ArchetypeInfo();
        info.setArchetypeId(archetype.getArchetypeId().getValue());
        info.setRmType(archetype.getDefinition().getRmTypeName());

        String mainNodeId = archetype.getDefinition().getNodeId();
        if (mainNodeId == null) {
            mainNodeId = archetype.getConcept();
        }

        String defaultLanguage = archetype.getOriginalLanguage().getCodeString();
        info.setName(findTermText(archetype, mainNodeId, defaultLanguage));
        info.setLanguages(new ArrayList<>());
        info.getLanguages().add(defaultLanguage);
        for (TranslationDetails details : archetype.getTranslations()) {
            info.getLanguages().add(details.getLanguage().getCodeString());
        }
        return info;
    }

    private String findTermText(DifferentialArchetype archetype, String concept, String defaultLanguage) {
        if (archetype.getOntology() == null || archetype.getOntology().getTermDefinitions() == null) return null;
        CodeDefinitionSet cds = archetype.getOntology()
                .getTermDefinitions()
                .stream()
                .filter((t) -> t.getLanguage().equals(defaultLanguage))
                .findFirst().orElse(null);
        if (cds == null) return null;

        ArchetypeTerm at = cds.getItems().stream().filter((t) -> t.getCode().equals(concept)).findFirst().orElse(null);
        if (at == null) return null;

        return at.getItems().stream().filter((t) -> t.getId().equals("text")).map(StringDictionaryItem::getValue).findFirst().orElse(null);

    }


}
