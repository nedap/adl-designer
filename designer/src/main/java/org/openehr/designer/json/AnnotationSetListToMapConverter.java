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

package org.openehr.designer.json;

import com.fasterxml.jackson.databind.util.StdConverter;
import org.openehr.jaxb.rm.Annotation;
import org.openehr.jaxb.rm.AnnotationSet;
import org.openehr.jaxb.rm.StringDictionaryItem;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class AnnotationSetListToMapConverter extends StdConverter<List, Map> {

    @Override
    public Map convert(List value) {
        Map<String, Map<String, Map<String, String>>> result = new LinkedHashMap<>();
        for (AnnotationSet cds : (List<AnnotationSet>)value) {
            result.put(cds.getLanguage(), annotationListToMap(cds.getItems()));
        }
        return result;
    }

    private Map<String, Map<String, String>> annotationListToMap(List<Annotation> terms) {
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        for (Annotation term : terms) {
            result.put(term.getPath(), stringDictionaryItemListToMap(term.getItems()));
        }
        return result;
    }

    private Map<String, String> stringDictionaryItemListToMap(List<StringDictionaryItem> items) {
        Map<String, String> result = new LinkedHashMap<>();
        for (StringDictionaryItem item : items) {
            result.put(item.getId(), item.getValue());
        }
        return result;
    }
}
