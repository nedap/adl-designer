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

var AOM = (function () {
    var my = {};

    my.NodeId = function (node_id_str) {
        var self = this;

        function decode(str) {
            var result = {};
            var firstIdPos = str.search(/\d/);
            result.prefix = str.substring(0, firstIdPos);
            result.ids = [];
            var tokens = str.substring(firstIdPos).split(".");
            for (var i in tokens) {
                result.ids.push(Number(tokens[i]));
            }
            return result;
        }

        var decoded = decode(node_id_str);
        self.prefix = decoded.prefix;
        self.ids = decoded.ids;

        self.toString = function () {
            return self.prefix + self.ids.join(".");
        };
        self.getSpecializationDepth = function () {
            return self.ids.length;
        }
    };

    my.ArchetypeModel = function (data) {

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

            if (typeof code === "string") {
                explode(code);
            } else if (Array.isArray(code)) {
                for (var ci in code) {
                    explode(code[ci]);
                }
            }

            return result;
        };

        self.getAnnotation = function (path, language) {
            if (!language) language = self.defaultLanguage;
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

        self.allLanguages = function () {
            var result = [];
            result.push(defaultLanguage);
            for (var i in self.translations) {
                result.push(self.translations[i]);
            }
            return result;
        };

        self.getAttribute = function (cons, attributeName) {
            if (!cons.attribute) return undefined;
            return Stream(cons.attributes).filter({rm_attribute_name: attributeName}).findFirst().orElse(undefined);
        };


        self.data = data;
        self.archetypeId = data.archetype_id.value;
        self.defaultLanguage = defaultLanguage;
        self.translations = extractTranslations();
        self.specializationDepth = new my.NodeId(data.definition.node_id).getSpecializationDepth();
    };

    my.EditableArchetypeModel = function (flatArchetypeData) {
        var self = this;
        my.ArchetypeModel.call(self, flatArchetypeData);

        function enrichArchetypeData() {
            function enrichAttributeData(data, parent) {
                data[".parent"] = parent;
                for (var i in data.children || []) {
                    enrichConstraintData(data.children[i], data);
                }
            }

            function enrichConstraintData(data, parent) {
                data[".parent"] = parent;
                for (var i in data.attributes || []) {
                    enrichAttributeData(data.attributes[i], data);
                }
                for (var i in data.attribute_tuples || []) {
                    var attribute_tuple = data.attribute_tuples[i];
                    for (var j in attribute_tuple.members || []) {
                        enrichConstraintData(attribute_tuple.members[j], data);
                    }
                    for (var j in attribute_tuple.children || []) {
                        var object_tuple = attribute_tuple.children[j];
                        for (var k in object_tuple.members || []) {
                            enrichConstraintData(object_tuple.members[k], attribute_tuple.members[k]);
                        }
                    }
                }
            }

            enrichConstraintData(self.data.definition, undefined);
        }


        self.isNodeSpecialized = function (cons) {
            while (cons && !cons.node_id) { // find nearest parent with node_id
                cons = cons[".parent"];
            }
            if (!cons) return false;
            var specializationDepth = new my.NodeId(cons.node_id).getSpecializationDepth();
            return specializationDepth === self.specializationDepth;
        };


        self.getAttributesTuple = function (cons, attributeNames) {
            var commonAttributes = {};
            var result = [];

            for (var i in attributeNames) {
                var attributeName = attributeNames[i];
                var attribute = self.getAttribute(cons, attributeName);
                if (attribute) {
                    commonAttributes[attributeName] = attribute;
                }
            }

            for (var i in cons.attribute_tuples || []) {
                var attribute_tuple = cons.attribute_tuples[i];
                var tupleMembers = Stream(attribute_tuple.members).flatMap("rm_attribute_name").toArray();
                var containedCount = 0;
                for (var j in tupleMembers) {
                    if (attributeNames.indexOf(tupleMembers[j]) > 0) {
                        containedCount++;
                    }
                }
                if (containedCount > 0) {
                    var indices = {};
                    for (var j in attributeNames) {
                        indices[attributeNames[j]] = tupleMembers.indexOf(attributeNames[j]);
                    }

                    for (var j in attribute_tuple.children || []) {
                        var resultItem = {};
                        var object_tuple = attribute_tuple.children[j];
                        for (var k in attributeNames) {
                            var index = indices[attributeNames[k]];
                            var attributeName = attributeNames[k];
                            resultItem[attributeName] = index >= 0 ? object_tuple.members[index] : commonAttributes[attributeName];
                        }
                        result.push(resultItem);
                    }
                    break; // only allow one tuple
                }
            }
            if (result.length == 0) {
                result.push(commonAttributes); // just use common attributes, if no tuples are defined
            }
            return result;
        };

        enrichArchetypeData();
    };

    my.EditableArchetypeModel.prototype = Object.create(my.ArchetypeModel.prototype);
    my.EditableArchetypeModel.prototype.constructor = my.EditableArchetypeModel;


    my.ArchetypeRepository = function (callback) {
        var self = this;

        $.getJSON("rest/repo/list").success(function (data) {
            self.infoList = data;
            if (callback) callback(self);
        }).error(function () {
            self.state = "error";
        });
    };

    my.ReferenceModel = function (callback) {
        var self = this;
        self.state = undefined;


        $.getJSON("rest/repo/rm/openEHR/1.0.2").success(function (data) {
            self.state = "ok";
            self.model = data;
            callback(self);
        }).error(function () {
            self.state = "error";
        });


        self.name = function () {
            return self.model.name;
        };

        self.isDescendantOf = function (rmType, parentRmType) {
            while (true) {
                if (rmType === parentRmType) return true;

                var type = self.model.types[rmType];
                if (!type || !type.parent) return false;
                rmType = type.parent;
            }
        };

        self.getType = function (name) {
            return self.model.types[name];
        };
    };

    my.ArchetypeRepository = function (callback) {
        var self = this;
        self.state = undefined;


        $.getJSON("rest/repo/list").success(function (data) {
            self.state = "ok";
            self.infoList = data;
            callback(self);
        }).error(function () {
            self.state = "error";
        });

    };

    return my;
}());
