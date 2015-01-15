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

var ArchetypeModel = function (data) {


    var defaultLanguage = data.original_language.code_string;
    var self = this;

    function getTermDefinition(node_id, language) {

        function getTermDefinitionFrom(definitions) {
            var def = definitions;
            if (def) def = def[language];
            if (def) def = def[node_id];
            return def;
        }

        language = language || defaultLanguage;

        if (!node_id) return undefined;
        var term = getTermDefinitionFrom(data.ontology.term_definitions);
        if (term) return term;
        term = getTermDefinitionFrom(data.ontology.constraint_definitions);
        if (term) return term;

        return undefined;
    }

    function extractTranslations() {
        var result = [];
        for (var i in data.translations || []) {
            var tr = data.translations[i];
            result.push(tr.language.code_string);
        }
        return result;
    }

    self.getTermDefinition = function (node_id, language) {
        return getTermDefinition(node_id, language || defaultLanguage);
    };


    self.getTermDefinitionText = function (node_id, language) {
        var td = getTermDefinition(node_id, language || defaultLanguage);
        return td && td.text;
    };

    self.explodeValueSets = function (code, language) {
        var result = {};

        function explode(code) {
            if (data.ontology.value_sets) {
                var valueSet = data.ontology.value_sets[code];
                if (valueSet) {
                    for (var i in valueSet.members || []) {
                        explode(valueSet.members[i])
                    }
                } else {
                    var term = self.getTermDefinition(code, language);
                    if (term) {
                        result[code] = term;
                    }
                }
            }
        }
        if (typeof code ==="string") {
            explode(code);
        } else if (Array.isArray(code)) {
            for (var ci in code) {
                explode(code[ci]);
            }
        }

        return result;
    };

    self.getAnnotation = function(path, language) {
        if (!language) language=self.defaultLanguage;
        if (!data.annotations) return undefined;
        if (!data.annotations.items) return undefined;
        var langAnnotations = data.annotations.items[language];
        if (!langAnnotations) return undefined;

        path = AmUtils.getPathSegments(path);
        for (var aPath in langAnnotations) {
            if (AmUtils.pathMatches(aPath, path)) return langAnnotations[aPath];
        }
        return undefined;
    };

    self.allLanguages = function() {
        var result = [];
        result.push(defaultLanguage);
        for(var i in self.translations) {
            result.push(self.translations[i]);
        }
        return result;
    };


    self.data = data;
    self.archetypeId = data.archetype_id.value;
    self.defaultLanguage = defaultLanguage;
    self.translations = extractTranslations();
};

