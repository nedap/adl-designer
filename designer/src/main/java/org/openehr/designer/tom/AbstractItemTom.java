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

package org.openehr.designer.tom;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type")
@JsonSubTypes(value = {
        @JsonSubTypes.Type(value = ItemTom.class, name = "item"),
        @JsonSubTypes.Type(value = ArchetypeTom.class, name = "archetype"),
        @JsonSubTypes.Type(value = TemplateTom.class, name = "template")
})

abstract public class AbstractItemTom extends AbstractTom {
    private Map<String, LocalizedNameTom> terms;
    private String path;
    private String nodeId;
    private OccurrencesTom occurrences;
    private List<AbstractItemTom> items;
    private String rmType;
    // language, key, value
    private Map<String, Map<String, String>> annotations;

    public OccurrencesTom getOccurrences() {
        return occurrences;
    }

    public void setOccurrences(OccurrencesTom occurrences) {
        this.occurrences = occurrences;
    }

    public Map<String, LocalizedNameTom> getTerms() {
        return terms;
    }

    public void setTerms(Map<String, LocalizedNameTom> terms) {
        this.terms = terms;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<AbstractItemTom> getItems() {
        return items;
    }

    public void setItems(List<AbstractItemTom> items) {
        this.items = items;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getRmType() {
        return rmType;
    }

    public void setRmType(String rmType) {
        this.rmType = rmType;
    }

    public Map<String, Map<String, String>> getAnnotations() {
        return annotations;
    }

    public void setAnnotations(Map<String, Map<String, String>> annotations) {
        this.annotations = annotations;
    }
}
