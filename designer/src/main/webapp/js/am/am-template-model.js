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

AOM = (function (AOM) {
    var my = AOM;

    // todo use for loading templates
    /**
     *
     * @param {object[]} archetypeDataList
     * @param {AOM.ArchetypeRepository} archetypeRepository repository of the archetypes
     * @param {function(AOM.ArchetypeModel[])} callback function with a list of archetype models to call when all archetype models are constructed
     */
    function buildArchetypeModels(archetypeDataList, archetypeRepository, callback) {
        function buildArchetypeModel(index) {
            var archetypeData = archetypeDataList[index];
            archetypeRepository.loadArchetype(archetypeData.parent_archetype_id, function (parentArchetypeData) {
                var parentArchetypeModel = new AOM.ArchetypeModel(parentArchetypeData);
                result[index] = new AOM.ArchetypeModel(archetypeDataList[index], parentArchetypeModel);
                latch.countDown();
            });
        }

        var result = [];
        var latch = new CountdownLatch(archetypeDataList.length);
        for (var i in archetypeDataList) {
            var archetypeData = archetypeDataList[i];
            if (archetypeData.parent_archetype_id) {
                buildArchetypeModel(i);
            } else {
                result[i] = new AOM.ArchetypeModel(archetypeData);
                latch.countDown();
            }
        }
        latch.execute(callback(result));

    }

    /**
     * @constructor

     * @param {AOM.ArchetypeModel[]} archetypeModels list of archetype models present in the archetype.
     *                                               First item is the root archetype, the rest are template overlays
     * @param {AOM.ArchetypeRepository} archetypeRepository
     * @param {AOM.ReferenceModel} referenceModel
     */
    my.TemplateModel = function (archetypeModels, archetypeRepository, referenceModel) {
        var self = this;

        function getArchetypeModel(archetypeId) {
            return Stream(archetypeModels)
                .filter(function (model) {
                    return model.data.archetype_id.value === archetypeId
                })
                .findFirst().orElse(undefined);
        }

        function enrichAttributeData(cons) {
            for (var i in cons.children || []) {
                enrichConstraintData(cons.children[i])
            }
        }

        function enrichConstraintData(cons) {
            if (cons["@type"] === "C_ARCHETYPE_ROOT") {
                var refArchetypeModel = getArchetypeModel(cons.archetype_ref);
                refArchetypeModel.data.definition[".templateArchetypeRoot"] = cons;
            }
            if (cons["@type"] === "ARCHETYPE_SLOT") {
                return; // do not add any attributes on slots
            }
            var existingAttributes = {};
            for (var i in cons.attributes || []) {
                existingAttributes[cons.attributes[i].rm_attribute_name] = true;
            }

            // add attributes that can be filled by archetypes
            if (cons["@type"]==="C_COMPLEX_OBJECT" || cons["@type"]==="C_ARCHETYPE_ROOT") {
                var rmType = cons.rm_type_name;
                var referenceType = referenceModel.getType(rmType);
                if (referenceType) {
                    for (var attrName in referenceType.attributes) {
                        if (!existingAttributes[attrName]) {
                            var attr = referenceType.attributes[attrName];
                            if (rmTypesForArchetypesSet[attr.type]) {
                                var attrCons = AOM.ArchetypeModel.from(cons).addAttribute(cons, attrName);
                                existingAttributes[attrName] = true;
                            }
                        }
                    }
                }
            }

            // enrich attributes of the constraint
            for (var i in cons.attributes || []) {
                enrichAttributeData(cons.attributes[i])
            }

        }

        function enrichArchetypeModelData(archetypeModel) {
            archetypeModel.data.definition[".templateModel"] = self;
            enrichConstraintData(archetypeModel.data.definition)
        }

        function enrichArchetypeModelsData() {
            for (var i in archetypeModels) {
                enrichArchetypeModelData(archetypeModels[i]);
            }
        }


        self.getRootArchetypeModel = function () {
            return archetypeModels[0];
        };

        self.getConstraintParent = function (cons) {
            function findArchetypeSlot(archetypeRoot) {
                if (!archetypeRoot.slot_node_id) return null;

                var parentAttr = archetypeRoot[".parent"];
                for (var i in parentAttr.children) {
                    var consChild = parentAttr.children[i];
                    if (consChild["@type"] === "ARCHETYPE_SLOT") {
                        if (my.nodeIdMatches(archetypeRoot.slot_node_id, consChild.node_id, {matchParent: true})) {
                            return consChild;
                        }
                    }
                }
                return null;
            }

            if (cons[".templateArchetypeRoot"]) {
                var archetypeRoot = cons[".templateArchetypeRoot"];
                var parentSlot = findArchetypeSlot(archetypeRoot);
                return parentSlot || archetypeRoot[".parent"];
            } else {
                return cons[".parent"];
            }
        };

        self.getConstraintChildren = function (cons) {
            function constraintChildren(children) {
                var result = [];
                for (var i in children) {
                    var consChild = children[i];
                    var amType = consChild["@type"];
                    if (amType === "C_ARCHETYPE_ROOT") {
                        if (consChild.slot_node_id === undefined) {
                            // only show the archetype_root if it is directly under attribute, instead of under slot
                            result.push(getArchetypeModel(consChild.archetype_ref).data.definition);
                        }
                    } else {
                        result.push(consChild);
                    }
                }
                return result;
            }

            function slotChildren(cons) {

                var result = [];
                var parentAttrCons = cons[".parent"];
                for (var i in parentAttrCons.children) {
                    var consChild = parentAttrCons.children[i];
                    if (consChild["@type"] === "C_ARCHETYPE_ROOT") {
                        if (my.nodeIdMatches(consChild.slot_node_id, cons.node_id, {matchSpecialized: true})) {
                            result.push(getArchetypeModel(consChild.archetype_ref).data.definition);
                        }
                    }
                }
                return result;
            }


            var consMixin = AOM.mixin(cons);
            if (consMixin.isAttribute()) {
                return constraintChildren(cons.children || []);
            } else if (consMixin.isSlot()) {
                return slotChildren(cons);
            } else {
                return cons.attributes || [];
            }
        };

        /**
         *  Adds a new archetype to the target constraint (slot or attribute)
         * @param targetCons
         * @param flatParentArchetypeData
         * @return {object} generated cons object
         */
        self.addArchetype = function (targetCons, flatParentArchetypeData) {
            function createNewOverlayArchetypeId(parentArchetypeModel) {
                var pid = parentArchetypeModel.getArchetypeId();
                var start = pid.indexOf('.');
                var end = pid.indexOf('.', start + 1);
                var name = pid.substring(start, end);

                var newId = pid.substring(0, start) + name + "_" + AmUtils.random4() + pid.substring(end);
                return newId;
            }

            function createNewOverlayArchetypeModel(flatParentArchetypeData) {
                var parentArchetypeModel = new AOM.ArchetypeModel(flatParentArchetypeData);

                var archetypeModel = AOM.createSpecializedArchetype({
                    archetypeId: createNewOverlayArchetypeId(parentArchetypeModel),
                    parent: parentArchetypeModel
                });
                archetypeModel.data.is_overlay = true;
                return archetypeModel;
            }

            var mixin = AOM.mixin(targetCons);
            var targetAttribute = targetCons;
            if (mixin.isSlot()) {
                targetAttribute = targetCons[".parent"];
            }

            var newArchetypeModel = createNewOverlayArchetypeModel(flatParentArchetypeData);
            enrichArchetypeModelData(newArchetypeModel);

            var newConstraint = AOM.newCArchetypeRoot(
                newArchetypeModel.data.definition.rm_type_name,
                newArchetypeModel.getArchetypeId(),
                mixin.isSlot() ? targetCons.node_id : undefined);

            newArchetypeModel.data.definition[".templateArchetypeRoot"] = newConstraint;

            var targetArchetypeModel = AOM.ArchetypeModel.from(targetAttribute);

            // add constraint to the target attribute and model to the models list
            targetArchetypeModel.addConstraint(targetAttribute, newConstraint);
            archetypeModels.push(newArchetypeModel);
            return newArchetypeModel.data.definition;
        };

        self.getAttributeChildOccurrences = function (attrCons) {
            if (attrCons.cardinality && attrCons.cardinality.interval) {
                return attrCons.cardinality.interval;
            }
            var rmTypeName = attrCons[".parent"].rm_type_name;
            var rmAttribute = referenceModel.getType(rmTypeName).attributes[attrCons.rm_attribute_name];
            return AmInterval.of(rmAttribute.existence.lower, rmAttribute.existence.upper);
        };

        self.canAddArchetype = function (cons) {
            var targetConsMixin = AOM.mixin(cons);
            var children;

            if (targetConsMixin.isAttribute()) {
                // is there place for one more child ?
                var childOccurrences = self.getAttributeChildOccurrences(cons);
                children = self.getConstraintChildren(cons);
                return typeof childOccurrences.upper !== "number" || childOccurrences.upper > children.length;
            } else if (targetConsMixin.isSlot()) {
                children = self.getConstraintChildren(cons);
                if (cons.occurrences) {
                    return typeof cons.occurrences.upper !== "number" || cons.occurrences.upper > children.length;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        };

        self.removeConstraint = function (cons) {
            function removeArchetypeModel(archetypeModel) {
                for (var i in archetypeModels) {
                    var candidate = archetypeModels[i];
                    if (candidate.getArchetypeId() === archetypeModel.getArchetypeId()) {
                        archetypeModels.splice(Number(i), 1);
                    }
                }
            }

            if (AOM.mixin(cons).isAttribute()) return;
            var consArchetypeModel = AOM.ArchetypeModel.from(cons);
            if (cons[".parent"]) {
                return consArchetypeModel.removeConstraint(cons);
            } else if (cons[".templateArchetypeRoot"]) {
                var parentArchetypeRoot = cons[".templateArchetypeRoot"];
                var parentArchetypeModel = AOM.ArchetypeModel.from(parentArchetypeRoot);
                removeArchetypeModel(consArchetypeModel);
                return parentArchetypeModel.removeConstraint(parentArchetypeRoot);
            }
        };

        self.getConstraintLabel = function (cons, language) {
            if (cons["@type"] === "C_ATTRIBUTE") return cons.rm_attribute_name;
            if (cons["@type"] === "C_ARCHETYPE_ROOT") {
                var refArchetypeModel = getArchetypeModel(cons.archetype_ref);
                return refArchetypeModel.getTermDefinitionText(refArchetypeModel.data.definition.node_id, language);
            } else {
                var label = AOM.ArchetypeModel.from(cons).getTermDefinitionText(cons.node_id, language);
                if (!label) {
                    label = cons.rm_type_name;
                }
                return label;
            }
        };

        self.renameConstraint = function (cons, text, language) {
            var archetypeModel = AOM.ArchetypeModel.from(cons);

            if (cons["@type"] === "C_ARCHETYPE_ROOT") {
                var refArchetypeModel = getArchetypeModel(cons.archetype_ref);
                refArchetypeModel.setTermDefinition(refArchetypeModel.data.definition.node_id, language, text);
            } else if (cons.node_id !== undefined) {
                if (!archetypeModel.isSpecialized(cons)) return;
                archetypeModel.setTermDefinition(cons.node_id, language, text);
            }
        };


        /**
         * Creates a json representation of the template than can be stored via rest call to /rest/repo/template
         * @return {object[]} list of archetype data, in serializable form.
         */
        self.toSerializableForm = function() {
            var result = [];
            for (var i in archetypeModels) {
                var archetypeModel = archetypeModels[i];
                result.push(AOM.impoverishedClone(archetypeModel.data));
            }
            return result;
        };

        function createRmTypesForArchetypesSet() {
            var archetypeTypes = {};
            for (var i in archetypeRepository.infoList) {
                archetypeTypes[archetypeRepository.infoList[i].rmType] = true;
            }
            var result = {};
            for (var rmType in referenceModel.model.types) {
                for (var archetypeRmType in archetypeTypes) {
                    if (referenceModel.isSubclass(rmType, archetypeRmType, true)) {
                        result[rmType] = true;
                        break;
                    }
                }
            }
            return result;
        }


        // init TemplateModel
        // a set of all rmTypes that can be filled with an existing archetype
        var rmTypesForArchetypesSet = createRmTypesForArchetypesSet();

        enrichArchetypeModelsData();
    };

    /**
     * @param {object} cons Constraint object
     * @return {AOM.TemplateModel} template model for the given constraint, or undefined
     */
    my.TemplateModel.from = function (cons) {
        while (cons[".parent"]) cons = cons[".parent"];
        return cons[".templateModel"];
    };


    /**
     * @param {object} params New template params
     * @param {AOM.ArchetypeRepository} params.archetypeRepository Archetype repository to use
     * @param {AOM.ReferenceModel} params.referenceModel Reference model to use
     * @param {string} params.templateId Template id of the new template
     * @param {string} params.parentArchetypeId Archetype id of the top level COMPOSITION archetype
     * @param {function(AOM.TemplateModel)} params.callback callback called when the TemplateModel is created
     */
    my.TemplateModel.createNew = function (params) {
        params.archetypeRepository.loadArchetype(params.parentArchetypeId, function (parentData) {
            var parentArchetypeModel = new AOM.ArchetypeModel(parentData);

            var archetypeModel = AOM.createSpecializedArchetype({
                archetypeId: params.templateId,
                parent: parentArchetypeModel
            });
            archetypeModel.data.is_template = true;

            var templateModel = new AOM.TemplateModel([archetypeModel], params.archetypeRepository, params.referenceModel);
            params.callback(templateModel);
        });
    };


    return my;
}(AOM)
)
;