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

(function (TemplateEditor) {
    TemplateEditor.Definition = function () {
        var my = {};


        /**
         * Specializes a given constraint, and updates the
         * @param {object} cons
         * @param {object} info
         * @param {object} definitionTreeNode treeNode of the definition tree
         */
        function specializeConstraint(cons, info, definitionTreeNode) {
            var archetypeModel = AOM.ArchetypeModel.from(cons);
            var rmTypeHandler = ArchetypeEditor.getRmTypeHandler(cons.rm_type_name);
            if (rmTypeHandler) {
                // specialize whole tree when using a custom rm type handler
                archetypeModel.specializeConstraintSubTree(cons);
            } else {
                archetypeModel.specializeConstraint(cons);
            }
            // did not work, so remove node_id from name
//            definitionTree.jstree.rename_node(definitionTreeNode, definitionTree.extractConstraintName(cons));
            info.tree.styleNodes(definitionTreeNode.id, 1);
            var isSelected = info.tree.targetElement.jstree('is_selected', definitionTreeNode);
            if (isSelected) {
                var constraintData = {
                    info: info,
                    treeNode: definitionTreeNode,
                    cons: cons
                };
                info.propertiesPanel.show(constraintData);
            }
        }


        function getCandidateArchetypesToAdd(cons) {

            function getCandidateArchetypesMatchingRmType(rmType) {
                var result = [];
                for (var i in TemplateEditor.archetypeRepository.infoList) {
                    var info = TemplateEditor.archetypeRepository.infoList[i];

                    if (TemplateEditor.referenceModel.isSubclass(rmType, info.rmType)) {
                        result.push(info);
                    }
                }
                return result;
            }

            function filterCandidateArchetypesForSlot(candidateArchetypes, slot) {
                var predicate = AOM.mixin(slot).buildArchetypeMatcher(slot);
                var result = [];
                for (var i in candidateArchetypes) {
                    var candidate = candidateArchetypes[i];
                    if (predicate(candidate.archetypeId)) {
                        result.push(candidate);
                    }
                }
                return result;
            }

            var candidateArchetypes;
            if (AOM.mixin(cons).isAttribute()) {
                var attributeParentRmType = cons[".parent"].rm_type_name;
                var referenceType = TemplateEditor.referenceModel.getType(attributeParentRmType);
                var attributeRmType = referenceType.attributes[cons.rm_attribute_name].type;
                candidateArchetypes = getCandidateArchetypesMatchingRmType(attributeRmType);
            } else if (AOM.mixin(cons).isSlot()) {
                candidateArchetypes = getCandidateArchetypesMatchingRmType(cons.rm_type_name);
                candidateArchetypes = filterCandidateArchetypesForSlot(candidateArchetypes, cons);
            } else {
                // archetypes can only be added on attributes or slots
                return [];
            }

            return candidateArchetypes;
        }

        function openAddArchetypeDialog(targetCons, callback) {
            var templateModel = AOM.TemplateModel.from(targetCons);


            var candidateArchetypes = getCandidateArchetypesToAdd(targetCons);

            // no matching archetypes found
            if (candidateArchetypes.length === 0) {
                return;
            }

            var context = {
                panel_id: GuiUtils.generateId()
            };
            GuiUtils.applyTemplate("template-editor|addArchetypeDialog", context, function (htmlString) {
                function populateArchetypeIdSelect() {
                    archetypeIdSelect.empty();
                    var ids = [];
                    for (var i in candidateArchetypes) {
                        var info = candidateArchetypes[i];
                        ids.push(info.archetypeId);
                    }
                    ids.sort();
                    for (var j in ids) {
                        archetypeIdSelect.append($("<option>").attr("value", ids[j]).text(ids[j]));
                    }
                }


                var content = $(htmlString);

                var archetypeIdSelect = content.find('#' + context.panel_id + '_archetype_id');

                populateArchetypeIdSelect();

                GuiUtils.openSimpleDialog(
                    {
                        title: "Add Archetype",
                        buttons: {"create": "Add"},
                        content: content,
                        callback: function (content) {
                            var archetypeId = archetypeIdSelect.val();

                            TemplateEditor.archetypeRepository.loadArchetype(archetypeId, function (data) {
                                var generatedCons = templateModel.addArchetype(targetCons, data);
                                callback(generatedCons);
                            });
                        }
                    });
            });


        }


        /**
         * @param targetElement
         * @constructor
         */
        my.DefinitionPropertiesPanel = function (targetElement) {
            targetElement.empty();
            var self = this;

            var stage, handler, context;

            function addPropertiesPanelToStage(stage, context, handler, targetElement) {
                stage.propertiesPanel = {
                    redraw: function () {
                        handler.updateContext(stage, context, targetElement);
                        targetElement.empty();
                        handler.show(stage, context, targetElement);
                    }
                };
                return stage;
            }

            function createEmptyStage() {
                var stage = {};
                stage.archetypeEditor = ArchetypeEditor;
                return stage;
            }

            function clearConstraints(targetElement) {
                if (handler && handler.hide) {
                    handler.hide(stage, context, targetElement);
                    handler = undefined;
                    stage = undefined;
                    context = undefined;
                }
            }

            self.clear = function () {
                clearConstraints(targetElement);
                targetElement.empty();
            };


            function showConstraintProperties(constraintData, targetElement) {

                function disableIfSpecialized() {
                    // add global handlers
                    if (!specialized) {
                        var dataElements = targetElement.find(".data");
                        dataElements.prop("disabled", true);
                        saveButton.prop('disabled', true);
                    }
                }

                clearConstraints(targetElement);
                var cons = constraintData.cons;
                if (!cons) return;
                var archetypeModel = AOM.ArchetypeModel.from(cons);

                var parentCons = archetypeModel.getParentConstraint(cons);
                var specialized = archetypeModel.isSpecialized(cons);

                var topDiv = $('<div class="container-fluid">');
                targetElement.append(topDiv);

                handler = ArchetypeEditor.getRmTypeHandler('main', '@common');
                var customDiv = $('<div class="container-fluid">');
                targetElement.append(customDiv);

                stage = createEmptyStage();
                stage.archetypeModel = archetypeModel;
                stage.readOnly = !specialized;
                context = handler.createContext(stage, cons, parentCons);
                addPropertiesPanelToStage(stage, context, handler, customDiv);
                handler.show(stage, context, customDiv);

                var errorsDiv = $('<div class="errors">');
                targetElement.append(errorsDiv);


                var footerDiv = $('<div class="footer">');
                targetElement.append(footerDiv);

                var footerContext = {
                    footer_id: GuiUtils.generateId(),
                    specialized: specialized
                };

                GuiUtils.applyTemplate("properties/constraint-common|footer", footerContext, footerDiv);

                if (!specialized) {
                    var specializeButton = footerDiv.find('#' + footerContext.footer_id + '_specialize');
                    specializeButton.click(function () {
                        specializeConstraint(cons, constraintData.info, constraintData.treeNode);
                    });
                }

                var saveButton = footerDiv.find('#' + footerContext.footer_id + '_save');

                disableIfSpecialized();
                setTimeout(disableIfSpecialized, 100);


                saveButton.click(function () {
                    var errors = new AmUtils.Errors();

                    handler.updateContext(stage, context, targetElement);
                    handler.validate(stage, context, errors);
                    errorsDiv.empty();
                    if (errors.getErrors().length > 0) {
                        var errorsContext = {errors: errors.getErrors()};
                        GuiUtils.applyTemplate("properties/constraint-common|errors", errorsContext, errorsDiv);
                        console.error("There were validation errors:", errors.getErrors());
                        return;
                    }

                    console.debug("save changes from: ", cons);
                    handler.updateConstraint(stage, context, cons, errors);
                    console.debug("save changes to:   ", cons);

                    archetypeModel.enrichReplacementConstraint(cons);
                });
            } // showConstraintProperties

            function showAnnotations(constraintData, targetElement) {
                var archetypeModel = AOM.ArchetypeModel.from(constraintData.cons);
                var context = {
                    panel_id: GuiUtils.generateId(),
                    lang: archetypeModel.defaultLanguage
                };
                GuiUtils.applyTemplate("definition|annotations", context, function (html) {

                    function populateLanguageSelect() {
                        languageSelect.empty();
                        var allLanguages = archetypeModel.allLanguages();
                        for (var i in allLanguages) {
                            var option = $("<option>").attr('value', allLanguages[i]).text(allLanguages[i]);
                            languageSelect.append(option);
                        }
                    }

                    function showLanguageAnnotations() {
                        var lang = languageSelect.val();
                        var allAnnotations = archetypeModel.getAnnotationsForNode(constraintData.cons);
                        annotationsDiv.empty();
                        var annotationsMap = new GuiUtils.TableMap(allAnnotations[lang], annotationsDiv);

                        annotationsMap.onBlur(function () {
                            allAnnotations[lang] = annotationsMap.getAsMap();
                            archetypeModel.updateAnnotationsForNode(constraintData.cons, allAnnotations);
                        });
                    }

                    html = $(html);

                    var languageSelect = html.find('#' + context.panel_id + '_language');
                    var annotationsDiv = html.find('#' + context.panel_id + '_annotations');


                    populateLanguageSelect();
                    showLanguageAnnotations();
                    languageSelect.on('change', showLanguageAnnotations);

                    targetElement.append(html);
                })
            }

            self.show = function (constraintData) {
                self.clear();

                if (!constraintData.cons) {
                    return;
                }

                var context = {
                    panel_id: GuiUtils.generateId()
                };
                GuiUtils.applyTemplate('definition|constraintsPanel', context, function (html) {
                    html = $(html);
                    var constraintsTab = html.find('#' + context.panel_id + '_constraints');
                    var annotationsTab = html.find('#' + context.panel_id + '_annotations');
                    showConstraintProperties(constraintData, constraintsTab);
                    showAnnotations(constraintData, annotationsTab);

                    targetElement.append(html);
                });
            }

        };

        my.DefinitionTree = function (templateModel, targetElement, info) {
            var self = this;
            var treeIdPrefix = "dt_" + GuiUtils.generateId() + "_";
            var nextTreeIdIndex = 0;

            var treeData = {};

            function nextTreeId() {
                return treeIdPrefix + (nextTreeIdIndex++).toString();
            }

            self.extractConstraintName = function (cons) {
                return templateModel.getConstraintLabel(cons);
                //var archetypeModel = AOM.ArchetypeModel.from(cons);
                //var result = archetypeModel.getTermDefinitionText(cons.node_id);
                //if (!result) {
                //    result = cons.rm_type_name;
                //}
                //return result;
            };

            function createAttrJson(attribute) {
                var attrJson = {
                    id: nextTreeId()
                };
                treeData[attrJson.id] = {
                    attr: attribute
                };
                attrJson.text = attribute.rm_attribute_name;
                if (attribute.children && attribute.children.length > 0) {
                    attrJson.children = [];

                    for (var j in attribute.children) {
                        buildTreeJson(attrJson.children, attribute.children[j]);
                    }
                }
                return attrJson;
            }

            function buildTreeJson(target, cons) {


                function addFullAttributesAndConstrains() {
                    var children = templateModel.getConstraintChildren(cons);
                    for (var i in children) {
                        var child = children[i];
                        if (AOM.mixin(child).isAttribute()) {
                            var attrJson = createAttrJson(child);
                            consJson.children.push(attrJson);
                        } else {
                            buildTreeJson(consJson.children, child);
                        }
                    }
                }


                // leave tree compactness for later
                var rmType = undefined;
                //var rmType = my.referenceModel.getType(cons.rm_type_name);

                if (rmType && rmType.display === 'none') return;

                var consJson = {
                    id: nextTreeId()
                };
                treeData[consJson.id] = {
                    cons: cons
                };

                if (!consJson.text) {
                    consJson.text = self.extractConstraintName(cons);
                }

                // only add attributes if no custom handler for this type
                if (!ArchetypeEditor.getRmTypeHandler(cons)) {

                    if (cons.attributes && cons.attributes.length > 0) {
                        consJson.children = [];
                    }
                    addFullAttributesAndConstrains();
                }

                target.push(consJson);
            }

            function styleNodeJson(treeNodeJson) {
                var cons = treeData[treeNodeJson.id].cons || treeData[treeNodeJson.id].attr;
                var isAttr = !treeData[treeNodeJson.id].cons;
                var archetypeModel = AOM.ArchetypeModel.from(cons);
                var isSpecialized = archetypeModel.isSpecialized(cons);

                treeNodeJson.a_attr = treeNodeJson.a_attr || {};
                treeNodeJson.a_attr.class = 'definition-tree-node ' + (isAttr ? 'attribute' : 'constraint');
                if (isSpecialized) {
                    treeNodeJson.a_attr.class += ' specialized';
                }
            }

            /**
             * Restyles definition nodes to give them proper style.
             *
             * @param {string} rootTreeNodeId Id of the node from which to style.
             * @param {number?} depth Limit styling to a number of levels below the node:
             *      0=this node only, 1=immediate children...
             *      If not defined, style the entire subtree
             */
            self.styleNodes = function (rootTreeNodeId, depth) {

                function styleNodes(treeNodeId, depth) {
                    var treeNode = self.targetElement.jstree('get_node', treeNodeId);
                    styleNodeJson(treeNode);

                    if (depth === undefined || depth > 0) {
                        var childDepth = depth === undefined ? undefined : depth - 1;
                        for (var i in treeNode.children) {
                            styleNodes(treeNode.children[i], childDepth);
                        }
                    }

                }

                styleNodes(rootTreeNodeId, depth);
                self.targetElement.jstree('redraw', true);
            };

            self.addArchetype = function () {
                var targetCons = self.current.data.cons || self.current.data.attr;
                var templateModel = AOM.TemplateModel.from(targetCons);
                if (!templateModel.canAddArchetype(targetCons)) {
                    return;
                }
                openAddArchetypeDialog(targetCons, function (newCons) {
                    addConstraintTreeNode(self.current.treeNode, newCons);
                });
            };


            //self.getAttributeChildOccurrences = function (attrCons) {
            //    if (attrCons.cardinality && attrCons.cardinality.interval) {
            //        return attrCons.cardinality.interval;
            //    }
            //    var rmTypeName = attrCons[".parent"].rm_type_name;
            //    var rmAttribute = TemplateEditor.referenceModel.getType(rmTypeName).attributes[attrCons.rm_attribute_name];
            //    return AmInterval.of(rmAttribute.existence.lower, rmAttribute.existence.upper);
            //};
            //
            //self.canAddArchetype = function () {
            //    var targetCons = self.current.data.cons || self.current.data.attr;
            //    var targetConsMixin = AOM.mixin(targetCons);
            //    var children;
            //
            //    if (targetConsMixin.isAttribute()) {
            //        // is there place for one more child ?
            //        var childOccurrences = self.getAttributeChildOccurrences(targetCons);
            //        children = AOM.TemplateModel.from(targetCons).getConstraintChildren(targetCons);
            //        return typeof childOccurrences.upper !== "number" || childOccurrences.upper > children.length;
            //    } else if (targetConsMixin.isSlot()) {
            //        children = AOM.TemplateModel.from(targetCons).getConstraintChildren(targetCons);
            //        if (targetCons.occurrences) {
            //            return typeof targetCons.occurrences.upper !== "number" || targetCons.occurrences.upper > children.length;
            //        } else {
            //            return true;
            //        }
            //    } else {
            //        return false;
            //    }
            //};

            self.removeConstraint = function () {

                function getJsTreeNodeSiblingIndex(treeNode) {
                    var parentNode = info.tree.targetElement.jstree('get_node', treeNode.parent);
                    for (var i in parentNode.children) {
                        var nodeId = parentNode.children[i];
                        if (nodeId === treeNode.id) {
                            return i;
                        }
                    }
                    return -1;
                }


                if (!self.current) return;
                var cons = self.current.data.cons || self.current.data.attr;

                var archetypeModel = AOM.ArchetypeModel.from(cons);
                if (!archetypeModel.isSpecialized(cons)) return;
                // do not remove top level node
                if (!templateModel.getConstraintParent(cons)) return;
                var newCons = templateModel.removeConstraint(cons);

                if (newCons) {
                    if (newCons == cons) return; // no change
                    var nodeIndex = getJsTreeNodeSiblingIndex(self.current.treeNode);
                    var parentNode = info.tree.targetElement.jstree('get_node', self.current.treeNode.parent);

                    info.tree.targetElement.jstree('delete_node', self.current.treeNode);
                    var newNodeId = addConstraintTreeNode(parentNode, newCons, nodeIndex);
                    info.tree.targetElement.jstree('select_node', newNodeId);
                } else {
                    info.tree.targetElement.jstree('delete_node', self.current.treeNode);
                }
            };


            function addAttributeTreeNode(parentNode, childCons, pos) {
                var attrJson = createAttrJson(childCons);
                self.targetElement.jstree('create_node', parentNode, attrJson, pos);
                self.styleNodes(parentNode.id);
            }

            function addConstraintTreeNode(parentNode, childCons, pos) {
                var target = [];
                buildTreeJson(target, childCons);
                var childJson = target[0];
                var newTreeNodeId = self.targetElement.jstree('create_node', parentNode, childJson, pos);
                self.styleNodes(parentNode.id);
                return newTreeNodeId;
            }


            function styleJson(list) {
                for (var i in list) {
                    styleNodeJson(list[i]);
                    if (list[i].children) {
                        styleJson(list[i].children);
                    }
                }
            }

            self.info = info;

            var jsonTreeTarget = [];
            buildTreeJson(jsonTreeTarget, templateModel.getRootArchetypeModel().data.definition);
            styleJson(jsonTreeTarget);

            targetElement.empty();
            targetElement.jstree("destroy");
            targetElement.jstree(
                {
                    'core': {
                        'data': jsonTreeTarget,
                        'multiple': false,
                        'check_callback': true

                    }
                });

            self.jstree = targetElement.jstree(true);
            self.targetElement = targetElement;


            targetElement.on('select_node.jstree', function (event, treeEvent) {
                var data = treeData[treeEvent.node.id];
                self.current = {
                    treeNode: treeEvent.node,
                    data: data
                };

                var constraintData = {
                    info: info,
                    treeNode: treeEvent.node,
                    cons: data.cons
                };
                info.propertiesPanel.show(constraintData);
            });
        };

        my.show = function (templateModel, referenceModel, targetElement) {
            targetElement.empty();
            var context = {
                panel_id: GuiUtils.generateId()
            };


            GuiUtils.applyTemplate("template-editor|definition", context, function (html) {
                html = $(html);

                var info = {
                    referenceModel: referenceModel,
                    toolbar: {
                        addArchetype: html.find('#' + context.panel_id + '_addArchetype'),
                        removeConstraint: html.find('#' + context.panel_id + '_removeConstraint')
                    }
                };
                var definitionPropertiesElement = html.find('#' + context.panel_id + '_constraints_panel');
                info.propertiesPanel = new my.DefinitionPropertiesPanel(definitionPropertiesElement);

                var definitionTreeElement = html.find('#' + context.panel_id + '_tree');
                info.tree = new my.DefinitionTree(templateModel, definitionTreeElement, info);


                info.toolbar.addArchetype.click(info.tree.addArchetype);
                info.toolbar.removeConstraint.click(info.tree.removeConstraint);

                targetElement.append(html);
            });
        };

        return my;
    }();

}(TemplateEditor) );