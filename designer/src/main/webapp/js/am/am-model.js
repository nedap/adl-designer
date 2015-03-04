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

        /**
         * @param {AOM.NodeId|string} node_id
         * @returns {AOM.NodeId}
         */
        my.NodeId.of = function (node_id) {
            if (node_id instanceof my.NodeId) {
                return node_id;
            }
            return new my.NodeId(node_id)
        };

        my.RmPath = function (path) {
            var self = this;

            function parsePathSegments(path) {
                if (Array.isArray(path)) {
                    return path;
                }

                if (path.length > 0 && path.charAt(0) === "/") {
                    path = path.substring(1);
                }
                var result = [];
                var strSegments = path.split("/");
                for (var pathPartIndex in strSegments) {
                    var pathPart = strSegments[pathPartIndex];
                    var spos = pathPart.indexOf("[");
                    if (spos >= 0) {
                        var epos = pathPart.lastIndexOf("]");
                        var segment = {};
                        segment.attribute = pathPart.substring(0, spos);
                        segment.node_id = pathPart.substring(spos + 1, epos).trim();
                        result.push(segment);
                    } else {
                        result.push({attribute: pathPart});
                    }
                }
                return result;
            }


            self.getParentPath = function () {
                if (self.segments.length < 1) return undefined;

                var newSegments = AmUtils.clone(self.segments);
                newSegments.splice(newSegments.length - 1, 1);

                return new my.RmPath(newSegments);
            };

            self.getChildPath = function () {
                if (self.segments.length < 1) return undefined;
                var newSegments = AmUtils.clone(self.segments);
                newSegments.splice(0, 1);

                return new my.RmPath(newSegments);
            };

            self.toString = function () {
                function segmentToString(segment) {
                    var result = "/" + segment.attribute;
                    if (segment.node_id) {
                        result += "[" + segment.node_id + "]";
                    }
                    return result;
                }

                var result = "";
                for (var i in self.segments) {
                    result += segmentToString(self.segments[i]);
                }
                return result;
            };

            self.segments = parsePathSegments(path);
        };

        /**
         *
         * @param {AOM.RmPath|string}from
         * @returns {AOM.RmPath}
         */
        my.RmPath.of = function (from) {
            if (from instanceof my.RmPath) return from;
            return new my.RmPath(from);
        };


        my.AmQuery = function () {
            var self = this;

            //  depending on context:
            //  candidate       match       context.matchParent     context.matchSpecialized    result
            //  id1             undefined   any                     any                         true
            //  id1             id1         any                     any                         true
            //  id1.1           id1         any                     any                         context.matchSpecialized
            //  id1             id1.1       any                     any                         context.matchParent
            //  id2             id1         any                     any                         false
            function noteIdMatches(candidate, match, context) {
                if (match === undefined) return true;
                if (candidate === undefined) return false;
                if (candidate === match) return true;
                if (context.matchSpecialized) {
                    if (candidate.length > match.length && candidate.substring(0, match.length + 1) === match + ".") return true;
                }
                if (context.matchParent) {
                    if (candidate.length < match.length && match.substring(0, candidate.length + 1) === candidate + ".") return true;
                }
                return false;
            }

            function attributeMatches(attribute, segment) {
                return attribute.rm_attribute_name === segment.attribute;
            }

            function constraintMatches(cons, segment, context) {
                return noteIdMatches(cons.node_id, segment.node_id, context);
            }

            function findChildConstrains(cons, segment, context) {
                var result = [];

                for (var i in cons.attributes || []) {
                    var attribute = cons.attributes[i];
                    if (attributeMatches(attribute, segment)) {
                        for (var j in attribute.children || []) {
                            var childCons = attribute.children[j];
                            if (constraintMatches(childCons, segment, context)) {
                                result.push(childCons);
                            }
                        }
                    }
                }

                for (var i in cons.attribute_tuples || []) {
                    var attribute_tuple = cons.attribute_tuples[i];
                    for (var j in attribute_tuple.members) {
                        var attribute = attribute_tuple.members[j];
                        if (attributeMatches(attribute, segment)) {
                            for (var k in attribute_tuple.children) {
                                var object_tuple = attribute_tuple.children[k];
                                var childCons = object_tuple.members[j];
                                if (constraintMatches(childCons, segment)) {
                                    result.push(childCons);
                                }
                            }
                        }
                    }
                }
                return result;
            }

            /**
             *
             * @param cons constraints archetype node that is the root for search
             * @param {RmPath|string} rmPath  path relative to the constraint
             * @param {{matchParent: false, matchSpecialized: false}?} context Details about what to match
             * @returns {{}[]} [] list of all nodes that match the path, empty list if none
             */
            self.findAll = function (cons, rmPath, context) {
                if (!cons) return [];
                context = context || {};
                rmPath = my.RmPath.of(rmPath);
                var matches = [cons];
                for (var segment_index in rmPath.segments) {
                    var segment = rmPath.segments[segment_index];
                    var roots = matches;
                    matches = [];
                    for (var i in roots) {
                        matches.push.apply(matches, findChildConstrains(roots[i], segment, context));
                    }
                }
                return matches;
            };

            /**
             *
             * @param rootCons constraints archetype node that is the root for search
             * @param {RmPath|string} rmPath  path relative to the constraint
             * @param {{matchParent: false, matchSpecialized: false}?} context Details about what to match
             * @returns {{}} first node that matched, undefined if none
             */
            self.get = function (rootCons, rmPath, context) {
                var matches = self.findAll(rootCons, rmPath, context);
                if (matches.length === 0) return undefined;
                return matches[0];
            };


            return self;
        }();

        my.ArchetypeModel = function (data, parentArchetypeModel) {

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

            /**
             * Exports all term definitions for a single node_id. Target term nodes are in format
             * result[language] = {text:..., description=...}. Changes to the result do not result in changes to the
             * archetype. For this, EditableArchetypeModel.importTermDefinitions(node_id, result) must be called
             *
             * @param node_id
             * @returns {{}} term definitions for node_id, for each language
             */
            self.exportTermDefinitions = function (node_id) {
                var result = {};
                var allLanguages = self.allLanguages();
                var term_definitions = self.data.ontology && self.data.ontology.term_definitions || {};
                for (var i in allLanguages) {
                    var lang = allLanguages[i];
                    var langTerms = term_definitions[lang];
                    if (langTerms) {
                        var term = langTerms && langTerms[node_id];
                        if (term) {
                            result[lang] = {
                                text: term.text,
                                description: term.description
                            };
                        }
                    }
                }
                return result;
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

            /**
             * Gets all external terminologies that are currently present in the archetype
             * @returns {string[]}
             */
            self.getAvailableTerminologies = function () {
                return AmUtils.keys(self.data.ontology.term_bindings);
            };

            /**
             * Gets all terminology definitions with codes that have a given prefix. Returns definitions in archetype0s
             * original language.
             *
             * @param {string} prefix Prefix of the codes, for example "at"
             * @returns {{}} map of "termId: term".
             */
            self.getAllTerminologyDefinitionsWithPrefix = function (prefix) {
                var result = {};
                var defaultTermDefinitions = self.data.ontology.term_definitions[self.defaultLanguage];
                for (var code in defaultTermDefinitions) {
                    if (AOM.NodeId.of(code).prefix === prefix) {
                        result[code] = defaultTermDefinitions[code]
                    }
                }
                return result;
            };


            /**
             * @returns {Array} all languages present in the archetype. First language is always the main language
             */
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

            /**
             *
             * @param {object} cons constraint object
             * @param {string[]} attributeNames list of attribute names
             * @returns {Array} array of name->constraint objects for each tuple
             */
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


            /**
             * Gets a rm path to a constraint, optionally from a given origin
             * @param {{}} cons - constraint for which to get rm path. Must be part of the archetype model
             * @param {{}?} originCons - from what constraint should path be build. If undefined, assumes root. If defined, must be a parent of cons
             * @return {RmPath} rmPath
             */
            self.getRmPath = function (cons, originCons) {

                function fillSegments(segments, cons) {
                    if (cons === undefined || cons === originCons) return;

                    var parentAttr = cons[".parent"];
                    if (parentAttr) {
                        var parentCons = parentAttr[".parent"];
                        if (parentCons["@type"] === "C_ATTRIBUTE_TUPLE") { // if tuple, take actual constraint instead
                            parentCons = parentCons[".parent"];
                        }

                        fillSegments(segments, parentCons);

                        var segment = {
                            attribute: parentAttr.rm_attribute_name
                        };
                        if (cons.node_id) {
                            segment.node_id = cons.node_id;
                        }
                        segments.push(segment);
                    }
                }

                var segments = [];
                if (cons["@type"] === "C_ATTRIBUTE") {
                    fillSegments(segments, cons);
                    segments.push({attribute: cons.rm_attribute_name});
                } else {
                    fillSegments(segments, cons);
                }
                return my.RmPath.of(segments);
            };

            /**
             * Finds the constraint of the parent archetype that corresponds to this node.
             * If no parent archetype, or no constraint was found, returns undefined
             * @param {{}} cons specialized constraint for which the parent should be returned. must be a member of this archetypeModel
             * @returns {{}} matching constraint of the parent archetype (member of the parentArchetypeModel), or undefined.
             */
            self.getParentConstraint = function (cons) {
                if (!cons || !self.parentArchetypeModel) return undefined;
                var rmPath = self.getRmPath(cons);
                return my.AmQuery.get(self.parentArchetypeModel.data.definition, rmPath, {matchParent: true});
            };


            self.parentArchetypeModel = parentArchetypeModel;
            self.data = data;
            self.archetypeId = data.archetype_id.value;
            self.defaultLanguage = defaultLanguage;
            self.translations = extractTranslations();
            self.specializationDepth = new my.NodeId(data.definition.node_id).getSpecializationDepth();
        };

        /**
         * Creates a new EditableArchetypeModel
         * @param {{}} flatArchetypeData json form of the AOM Archetype object
         * @param {AOM.ArchetypeModel?} parentArchetypeModel archetypeModel of the parent archetype
         * @constructor
         * @extends AOM.ArchetypeModel
         */
        my.EditableArchetypeModel = function (flatArchetypeData, parentArchetypeModel) {
            var self = this;
            my.ArchetypeModel.call(self, flatArchetypeData, parentArchetypeModel);


            var maxTermIdsByPrefix = {};
            var existingTerms = {};

            /**
             * Used in preprocessor for each existing nodeId, to know what node ids already exist in the archetype. Used
             * for generating new ids
             * @param {string} termId termId string to acknowledge, i.e. id2.1
             */
            function acknowledgeTermId(termId) {
                if (!termId) return;
                existingTerms[termId] = true;
                termId = my.NodeId.of(termId);
                if (termId.getSpecializationDepth() === self.specializationDepth) {
                    var lastTermIdSegment = termId.ids[termId.ids.length - 1];
                    var maxTermId = maxTermIdsByPrefix[termId.prefix];
                    if (maxTermId === undefined || maxTermId < lastTermIdSegment) {
                        maxTermIdsByPrefix[termId.prefix] = lastTermIdSegment;
                    }
                }
            }


            function enrichAttributeData(data, parent) {
                if (!data) return;
                data[".parent"] = parent;
                for (var i in data.children || []) {
                    enrichConstraintData(data.children[i], data);
                }
            }

            function enrichConstraintData(data, parent) {
                if (!data) return;
                data[".parent"] = parent;

                acknowledgeTermId(data.node_id);
                for (var i in data.attributes || []) {
                    enrichAttributeData(data.attributes[i], data);
                }
                for (var i in data.attribute_tuples || []) {
                    var attribute_tuple = data.attribute_tuples[i];
                    //attribute_tuple[".parent"]=data;
                    for (var j in attribute_tuple.members || []) {
                        enrichAttributeData(attribute_tuple.members[j], data);
                    }
                    for (var j in attribute_tuple.children || []) {
                        var object_tuple = attribute_tuple.children[j];
                        for (var k in object_tuple.members || []) {
                            enrichConstraintData(object_tuple.members[k], attribute_tuple.members[k]);
                        }
                    }
                }
            }

            function processOntology(ontology) {
                if (!ontology) return;
                for (var lang in ontology.term_definitions || {}) {
                    var langDefinitions = ontology.term_definitions[lang];
                    for (var termId in langDefinitions || {}) {
                        acknowledgeTermId(termId);
                    }
                }
                for (var codeSystem in ontology.term_bindings || {}) {
                    var codeSystemBindings = ontology.term_bindings[codeSystem];
                    for (var termId in codeSystemBindings || {}) {
                        acknowledgeTermId(termId);
                    }
                }

                for (var valueSetId in ontology.value_sets || {}) {
                    acknowledgeTermId(valueSetId);
                    var valueSet = ontology.value_sets[valueSetId];
                    for (var i in valueSet.members || []) {
                        acknowledgeTermId(valueSet.members[i]);
                    }
                }
            }


            //function isTuplePart(cons) {
            //    var parentAttr = cons[".parent"];
            //    if (!parentAttr) return false;
            //    var parentAttrParent = parentAttr[".parent"];
            //    return parentAttrParent["@type"] === "C_ATTRIBUTE_TUPLE";
            //}


            /**
             * Generates a new term id for a given prefix or parent term id with the same specialization level as the archetype
             * @param {string} parentTermOrPrefix prefix or parent term. Examples: 'id', 'id2', 'at2.2', 'ac'
             * @returns {string} a new, unique term id
             */
            self.generateSpecializedTermId = function (parentTermOrPrefix) {

                var term;
                if (parentTermOrPrefix.match(/^[a-zA-Z]+$/)) {
                    var prefix = parentTermOrPrefix;
                    var maxTermId = maxTermIdsByPrefix[prefix] || 0;
                    if (self.specializationDepth === 1) {
                        term = my.NodeId.of(prefix + String(++maxTermId));
                    } else {
                        term = my.NodeId.of(prefix + "0");
                        while (term.ids.length < self.specializationDepth - 1) {
                            term.ids.push(0);
                        }
                        term.ids.push(++maxTermId);
                    }
                    maxTermIdsByPrefix[prefix] = maxTermId;
                    existingTerms[term.toString()] = true;
                    return term.toString();
                } else {
                    // todo do not assume 1 for nodes parents
                    term = my.NodeId.of(parentTermOrPrefix);
                    while (term.ids.length < self.specializationDepth - 1) {
                        term.ids.push(0);
                    }
                    if (term.ids.length < self.specializationDepth) {
                        term.ids.push(1);
                    }
                    while (existingTerms[term.toString()]) { // find first unique id
                        term.ids[term.ids.length - 1]++;
                    }
                    existingTerms[term.toString()] = true;
                    return term.toString();
                }
            };


            /**
             * Checks if node is defined directly in this archetype
             *
             * @param {object|string} cons constraint data node, or node_id
             * @returns {boolean} true if the node is defined in current archetype, false if defined only in parent
             */
            self.isSpecialized = function (cons) {
                if (typeof cons === "object") {
                    while (cons && !cons.node_id) { // find nearest parent with node_id
                        cons = cons[".parent"];
                    }
                    if (!cons) return false;
                    return self.isSpecialized(cons.node_id);
                } else {
                    var specializationDepth = my.NodeId.of(cons).getSpecializationDepth();
                    return specializationDepth === self.specializationDepth;
                }
            };


            self.specializeTermDefinition = function (termId) {
                var newTermId = self.generateSpecializedTermId(termId);
                Stream(self.allLanguages()).forEach(function (lang) {
                    var term = self.getTermDefinition(termId, lang);
                    if (term) {
                        self.setTermDefinition(newTermId, lang, term.text, term.description);
                    }
                });
                return newTermId;
            };

            self.specializeValueSet = function (valueSetId) {
                var value_set = self.data.ontology.value_sets[valueSetId];
                if (!value_set) return undefined;

                var newValueSetId = self.specializeTermDefinition(valueSetId);

                value_set = AmUtils.clone(value_set);
                value_set.id = newValueSetId;
                self.data.ontology.value_sets[newValueSetId] = value_set;
                return newValueSetId;
            };


            /**
             * Remove attribute from constraint
             * @param {object} cons constraint object
             * @param {string|string[]} attributeName name of the attribute to remove, or list of attribute names to remove
             */
            self.removeAttribute = function (cons, attributeName) {
                if (Array.isArray(attributeName)) {
                    for (var i in attributeName) {
                        self.removeAttribute(cons, attributeName[i]);
                    }

                }
                for (var i in cons.attributes || []) {
                    var attribute = cons.attributes[i];
                    if (attribute.rm_attribute_name === attributeName) {
                        cons.attributes.splice(i, 1);
                        break;
                    }
                }

                for (var i in cons.attribute_tuples || []) {
                    var attribute_tuple = cons.attribute_tuples[i];
                    for (var j in attribute_tuple.members) {
                        if (attribute_tuple.members[j].rm_attribute_name === attributeName) {
                            attribute_tuple.members.splice(j, 1);
                            for (var k in attribute_tuple.children) {
                                attribute_tuple.children[k].members.splice(j, 1);
                            }
                            break;
                        }
                    }
                    if (attribute_tuple.members.length == 0) {
                        cons.attribute_tuples.splice(i, 1);
                    }
                }
            };


            /**
             * Copies properties that are defined on cons but not on targetCons to targetCons. Not recursive
             * @param {object} cons source constraint. Must be part of archetype and be of @type C_COMPLEX_OBJECT
             * @param {object} targetCons target constraint. Must NOT be part of archetype and be of @type C_COMPLEX_OBJECT
             */
            self.addUnconstrainedAttributes = function (cons, targetCons) {

                function getTupleAttributeNames(attribute_tuple) {
                    var result = [];
                    for (var j in attribute_tuple.members) {
                        result.push(attribute_tuple.members[j].rm_attribute_name);
                    }
                    return result;
                }

                function addAttributeTuple(attribute_tuple) {
                    var attributeNames = getTupleAttributeNames(attribute_tuple);

                    for (var j in targetCons.attribute_tuples || []) {
                        var targetAttributeNames = getTupleAttributeNames(targetCons.attribute_tuples[j]);
                        var matches = 0;
                        for (var k in attributeNames) {
                            if (targetAttributeNames.indexOf(attributeNames[k]) >= 0) {
                                matches++;
                            }
                        }
                        if (matches === 0) {
                            continue; // tuples completely different, check next target tuple
                        } else if (matches < attributeNames) {
                            console.warn("Partial tuple match, attributes will not be added:\ttuple:", attributeNames,
                                "\ttargetTuple:", targetAttributeNames);
                            return; // partial match, merging is not possible. (should throw an error?)
                        } else {
                            return; // full match, skip this source tuple
                        }
                    }
                    // no match in target tuples, proceed to check target attributes
                    for (var j in attributeNames) {
                        var targetChildCons = my.AmQuery.get(targetCons, "/" + attributeNames[j]);
                        if (targetChildCons) {
                            console.warn("Cannot merge tuple with existing attribute constraint:\ntuple:", attributeNames,
                                "\ntargetAttribute:", attributeNames[j]);
                            return; // attribute part of tuple in source, but standalone in target (should throw an error?)
                        }
                    }
                    // all checks passed add tuple to targetCons
                    targetCons.attribute_tuples = targetCons.attribute_tuples || [];
                    targetCons.attribute_tuples.push(my.impoverishedClone(attribute_tuple));
                }

                // add regular attributes
                for (var i in cons.attributes || []) {
                    var attribute = cons.attributes[i];
                    var targetAttribute = my.AmQuery.get(targetCons, "/" + attribute.rm_attribute_name);
                    if (!targetAttribute) {
                        targetAttribute = my.impoverishedClone(attribute);

                        targetCons.attributes = targetCons.attributes || [];
                        targetCons.attributes.push(targetAttribute);
                    }
                }

                // add tuples, if possible
                for (var i in cons.attribute_tuples || []) {
                    addAttributeTuple(cons.attribute_tuples[i])
                }
            };

            /**
             * Adds a translation to the archetype. The language must not already exist. Also adds quick translations
             * of details and term definitions
             *
             * @param {string} langCode Code of the language to add
             */
            self.addTranslation = function (langCode) {
                function quickTranslate(value) {
                    if (!value) return undefined;
                    value = "*" + value + " (" + self.data.original_language.code_string + ")";
                    return value;
                }

                function addDescriptionDetails() {
                    var orig = self.data.description.details[0];
                    self.data.description.details.push({
                        "@type": "RESOURCE_DESCRIPTION_ITEM",
                        "language": {
                            "@type": "CODE_PHRASE",
                            "terminology_id": {
                                "@type": "TERMINOLOGY_ID",
                                "value": "ISO_639-1"
                            },
                            "code_string": "en"
                        },
                        "purpose": quickTranslate(orig.purpose),
                        "keywords": [],
                        "use": quickTranslate(orig.use),
                        "misuse": quickTranslate(orig.misuse),
                        "copyright": orig.copyright,
                        "original_resource_uri": {},
                        "other_details": {}
                    });

                }

                function addTermDefinitions() {
                    var orig = self.data.ontology.term_definitions[self.data.original_language.code_string];
                    var tds = {};
                    self.data.ontology.term_definitions[langCode] = tds;
                    for (var nodeId in orig) {
                        var term = orig[nodeId];
                        tds[nodeId] = {
                            text: quickTranslate(term.text),
                            description: quickTranslate(term.description)
                        }
                    }
                }

                var translation = {
                    "@type": "TRANSLATION_DETAILS",
                    "language": {
                        "@type": "CODE_PHRASE",
                        "terminology_id": {
                            "@type": "TERMINOLOGY_ID",
                            "value": "ISO_639-1"
                        },
                        "code_string": langCode
                    },
                    "author": {},
                    "accreditation": "",
                    "other_details": {}
                };


                self.data.translations.push(translation);
                addDescriptionDetails();
                addTermDefinitions();
            };

            /**
             * Saves external term bindings on the archetype
             * @param {string} termId constraint node id
             * @param {{terminology:url}} bindings of terminology to query url
             */
            self.setExternalTerminologyBinding = function (termId, bindings) {
                var tds = self.data.ontology.term_bindings;

                for (var bt in bindings) {
                    if (!tds[bt]) {
                        tds[bt] = {};
                    }
                }

                for (var terminology in tds) {
                    if (bindings[terminology]) {
                        tds[terminology][termId] = bindings[terminology];
                    } else {
                        delete tds[terminology][termId];
                    }
                }
            };


            self.validateReplacementConstraint = function (cons, replacementCons) {
                // todo check with parent, rm_model?, use AmUtils.Errors
                return true;
            };


            /**
             * Sets a term definition to ontology term_definitions. Will override existing definition or add a new one
             * <p>When adding you must always make sure that you add terms to all languages
             *
             * @param {string} code node_id of the term definition
             * @param {string|undefined} language language of the definition. If undefined, sets terms for all definitions
             * @param {string} text term definition text
             * @param {string?}description term definition description
             */
            self.setTermDefinition = function (code, language, text, description) {
                function quickTranslate(value, sourceLanguage, targetLanguage) {
                    if (!value) return undefined;
                    value = value + " (" + sourceLanguage + ")";
                    return value;
                }


                if (!language) {
                    self.setTermDefinition(code, self.defaultLanguage, text, description);
                    for (var i in self.translations) {
                        var lang = self.translations[i];
                        self.setTermDefinition(code, lang,
                            quickTranslate(text, self.defaultLanguage, lang),
                            quickTranslate(description, self.defaultLanguage, lang));
                    }
                    return;
                }

                var term_definitions = self.data.ontology.term_definitions;

                if (!term_definitions[language]) {
                    term_definitions[language] = {};
                }
                term_definitions[language][code] = {
                    text: text,
                    description: description
                };
                AmUtils.cleanObjectProperties(term_definitions[language][code]);
            };

            /**
             * Adds a new term definition to ontology. Text and description are given to the original language, while other languages
             * have suffix " (original_language)"
             * @param {string}prefixOrCode prefix (or code) under which to generate new termId. If it refers to
             * a parent code, a specialized code will be generated
             * @param {string} text text of the terminology definition
             * @param {string?}description description of the terminology definition
             * @returns {string} code of the generated terminology definition
             */
            self.addNewTermDefinition = function (prefixOrCode, text, description) {


                var newCode = self.generateSpecializedTermId(prefixOrCode);
                //if (!self.data.ontology.term_definitions) {
                //    self.data.ontology.term_definitions = {};
                //}

                self.setTermDefinition(newCode, undefined, text, description);

                return newCode;
            };

            /**
             * Imports term definitions for a single node_id, for all languages
             *
             * @param node_id
             * @param {{}} termsPerLanguage terms per language, in format {language: {text:..., description:...}}
             */
            self.importTermDefinitions = function (node_id, termsPerLanguage) {
                var ontology = self.data.ontology;
                var term_definitions = (ontology.term_definitions = ontology.term_definitions || {});
                for (var language in termsPerLanguage) {
                    var term = termsPerLanguage[language];
                    var langTerms = (term_definitions[language] = term_definitions[language] || {});
                    langTerms[node_id] = {
                        text: term.text,
                        description: term.description
                    };
                }
            };


            self.specializeConstraint = function (cons) {
                if (self.isSpecialized(cons)) return;
                var originalNodeId = cons.node_id;
                var specializedNodeId = self.generateSpecializedTermId(cons.node_id || "id");
                cons.node_id = specializedNodeId;

                // add specialized term to term definitions if present in parent
                var allLanguages = self.allLanguages();
                for (var langIndex in allLanguages) {
                    var lang = allLanguages[langIndex];
                    var term = self.getTermDefinition(originalNodeId, lang);
                    if (term) {
                        self.setTermDefinition(specializedNodeId, lang, term.text, term.description);
                    }
                }
            };


            /**
             * Enriches constraint with additional attributes form the EditableArchetypeModel. Intended to allow adding attributes on a
             * C_COMPLEX_OBJECT
             *
             * @param {object} cons Constraint to enrich. If parent===undefined, must already have [".parent"] attribute
             * @param {object?} parent parent of this constraint
             Ł           */
            self.enrichReplacementConstraint = function (cons, parent) {
                enrichConstraintData(cons, parent || cons[".parent"]);
            };


            enrichConstraintData(flatArchetypeData.definition, undefined);
            processOntology(flatArchetypeData.ontology);

        }; // EditableArchetypeModel
        my.EditableArchetypeModel.prototype = Object.create(my.ArchetypeModel.prototype);
        my.EditableArchetypeModel.prototype.constructor = my.EditableArchetypeModel;


        my.ArchetypeRepository = function (callback) {
            var self = this;


            self.reload = function (successCallback) {
                $.getJSON("rest/repo/list").success(function (data) {
                    self.infoList = data;
                    if (successCallback) successCallback(self);
                });
            };

            self.reload(callback);
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

        my.makeEmptyConstrainsClone = function (cons) {
            if (typeof cons === "string") {
                cons = {
                    "@type": cons,
                    rm_type_name: cons,
                    occurrences: AmInterval.of(1, 1, "MULTIPLICITY_INTERVAL")
                }
            }

            var result = {
                "@type": cons["@type"],
                node_id: cons.node_id,
                rm_type_name: cons.rm_type_name
            };
            if (cons.occurrences) {
                result.occurrences = AmInterval.of(cons.occurrences.lower, cons.occurrences.upper, "MULTIPLICITY_INTERVAL");
            }
            result["@type"] = cons["@type"];
            AmUtils.cleanObjectProperties(result);
            return result;
        };

        /**
         * Makes a clone of constrains, but removes all enriched properties (those that start with .);
         * @param cons constraint
         * @returns {*} clone of cons, but without enriched properties
         */
        my.impoverishedClone = function (cons) {
            var result;
            if (cons === null || cons === undefined) return cons;
            if (typeof cons === "object") {
                if (Array.isArray(cons)) {
                    result = [];
                    for (var i in cons) {
                        result.push(my.impoverishedClone(cons[i]));
                    }
                    return result;
                } else {
                    result = {};
                    for (var key in cons) {
                        if (cons.hasOwnProperty(key)) {
                            if (key.substring(0, 1) !== ".") {
                                result[key] = my.impoverishedClone(cons[key]);
                            }
                        }
                    }
                    return result;
                }
            } else {
                return cons;
            }
        };


        return my;
    }() )
    ;
