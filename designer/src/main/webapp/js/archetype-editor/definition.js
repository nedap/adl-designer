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

(function (ArchetypeEditor) {
    ArchetypeEditor.Definition = function () {
        var my = {};


        /**
         * Specializes a given constraint, and updates the
         * @param {AOM.EditableArchetypeModel} archetypeModel
         * @param {object} cons
         * @param {ArchetypeEditor.Definition.DefinitionTree} definitionTree
         * @param {object} definitionTreeNode treeNode of the definition tree
         */
        function specializeConstraint(archetypeModel, cons, definitionTree, definitionTreeNode) {
            archetypeModel.specializeConstraint(cons);
            // did not work, so remove node_id from name
//            definitionTree.jstree.rename_node(definitionTreeNode, definitionTree.extractConstraintName(cons));
            definitionTree.styleNodes(definitionTreeNode);
            var isSelected = definitionTree.targetElement.jstree('is_selected', definitionTreeNode);
            //var isSelected = definitionTree.jstree.is_selected(definitionTreeNode)
            if (isSelected) {
                var constraintData = {
                    definitionTree: definitionTree,
                    treeNode: definitionTreeNode,
                    cons: cons
                };
                definitionTree.propertiesPanel.showConstraintProperties(constraintData);
            }
        }


        /**
         * @param {AOM.EditableArchetypeModel} archetypeModel
         * @param  targetElement
         * @constructor
         */
        my.DefinitionPropertiesPanel = function (archetypeModel, targetElement) {
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
                stage.archetypeModel = archetypeModel;
                stage.archetypeEditor = ArchetypeEditor;
                return stage;
            }

            self.clear = function () {
                if (handler && handler.hide) {
                    handler.hide(stage, context, targetElement);
                    handler = undefined;
                    stage = undefined;
                    context = undefined;
                }
                targetElement.empty();
            };


            self.showConstraintProperties = function (constraintData) {
                function disableIfSpecialized() {
                    // add global handlers
                    if (!specialized) {
                        var dataElements = targetElement.find(".data");
                        dataElements.prop("disabled", true);
                        saveButton.prop('disabled', true);
                    }
                }

                self.clear();
                var cons = constraintData.cons;
                if (!cons) return;
                var parentCons = archetypeModel.getParentConstraint(cons);
                var specialized = archetypeModel.isSpecialized(cons);

                var topDiv = $('<div class="container-fluid">');
                targetElement.append(topDiv);

                handler = ArchetypeEditor.getRmTypeHandler('main', '@common');
                var customDiv = $('<div class="container-fluid">');
                targetElement.append(customDiv);

                stage = createEmptyStage();
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
                        specializeConstraint(archetypeModel, cons, constraintData.definitionTree, constraintData.treeNode);
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

            }
        };

        my.DefinitionTree = function (archetypeModel, targetElement, definitionPropertiesPanel) {
            var self = this;
            var treeIdPrefix = AmUtils.random4() + "_";
            var nextTreeIdIndex = 0;

            var treeData = {};

            function nextTreeId() {
                return treeIdPrefix + (nextTreeIdIndex++).toString();
            }

            self.extractConstraintName = function (cons) {
                var result = archetypeModel.getTermDefinitionText(cons.node_id);
                if (!result) {
                    result = cons.rm_type_name;
                }
                return result;
            };

            function buildTreeJson(target, cons) {

                function addTransparentAttributeConstraints() {
                    for (var i in cons.attributes || []) {
                        var attribute = cons.attributes[i];
                        for (var j in attribute.children || []) {
                            buildTreeJson(target, attribute.children[j]);
                        }
                    }
                }

                function addFullAttributesAndConstrains() {
                    for (var i in cons.attributes) {
                        var attribute = cons.attributes[i];
                        var attrJson = {
                            id: nextTreeId()
                        };
                        treeData[attrJson.id] = {
                            attr: attribute
                        };
                        attrJson.text = attribute.rm_attribute_name;
                        if (attribute.children && attribute.children.length > 0) {
                            attrJson.children = [];
                            attrJson.a_attr = attrJson.a_attr || {};
                            attrJson.a_attr.class = "definition-tree-node attribute";
                            if (archetypeModel.isSpecialized(cons)) {
                                attrJson.a_attr.class += " specialized";
                            }


                            for (var j in attribute.children) {
                                buildTreeJson(attrJson.children, attribute.children[j]);
                            }
                        }
                        consJson.children.push(attrJson);
                    }
                }

                function addDataAttribute(consJson, attrName) {
                    for (var i in cons.attributes) {
                        var attribute = cons.attributes[i];
                        if (attribute.rm_attribute_name !== attrName) continue;

                        for (var j in cons.children) {
                            consJson.children = consJson.children || [];
                            buildTreeJson(consJson.children, attribute.children[j]);
                        }
                        return true;
                    }
                    return false;
                }

                // leave tree compactness for later
                var rmType = undefined;
                //var rmType = my.referenceModel.getType(cons.rm_type_name);

                if (rmType && rmType.display === 'none') return;

                if (rmType && rmType.display === 'transparent') {
                    addTransparentAttributeConstraints();
                } else {
                    var consJson = {
                        id: nextTreeId()
                    };
                    treeData[consJson.id] = {
                        cons: cons
                    };

                    consJson.a_attr = consJson.a_attr || {};
                    consJson.a_attr.class = "definition-tree-node constraint";
                    if (archetypeModel.isSpecialized(cons)) {
                        consJson.a_attr.class += " specialized";
                    }

                    if (!consJson.text) {
                        consJson.text = self.extractConstraintName(cons);
                    }

                    // only add attributes if no custom handler for this type
                    if (!ArchetypeEditor.getRmTypeHandler(cons.rm_type_name)) {

                        if (cons.attributes && cons.attributes.length > 0) {
                            consJson.children = [];
                        }
                        if (cons.attributes && cons.attributes.length > 0) {
                            if (rmType && rmType.dataAttribute) {
                                if (!addDataAttribute(consJson, rmType.dataAttribute)) {
                                    addFullAttributesAndConstrains();
                                }
                            } else {
                                addFullAttributesAndConstrains();
                            }
                        }
                    }

                }
                target.push(consJson);
            }

            self.styleNodes = function (rootTreeNode) {

                function styleNode(liElement) {
                    var treeNodeId = liElement.attr('id');
                    var cons = treeData[treeNodeId].cons || treeData[treeNodeId].attr;
//                    var isAttr = cons["@type"]==="C_ATTRIBUTE";
                    var aElement = liElement.find('>a');
                    var isSpecialized = archetypeModel.isSpecialized(cons);
                    aElement.removeClass('specialized');
                    if (isSpecialized) {
                        aElement.addClass('specialized');
                    }
                }

                var parentLi = targetElement.find('#' + rootTreeNode.id);
                styleNode(parentLi);
                parentLi.find('li').each(function () {
                    var liElement = $(this);
                    styleNode(liElement);
                });

            };


            self.propertiesPanel = definitionPropertiesPanel;

            var jsonTreeTarget = [];
            buildTreeJson(jsonTreeTarget, archetypeModel.data.definition);

            targetElement.jstree("destroy");
            targetElement.empty();
            targetElement.jstree(
                {
                    'core': {
                        'data': jsonTreeTarget,
                        'multiple': false
                    }
                });

            //self.jstree = targetElement.jstree(true);
            self.targetElement = targetElement;

            targetElement.on('select_node.jstree', function (event, treeEvent) {
                var data = treeData[treeEvent.node.id];
                var constraintData = {
                    definitionTree: self,
                    treeNode: treeEvent.node,
                    cons: data.cons
                };
                definitionPropertiesPanel.showConstraintProperties(constraintData);
            });


        };

        my.show=function(archetypeModel, targetElement) {
            targetElement.empty();
            var context = {
                panel_id: GuiUtils.generateId()
            };

            GuiUtils.applyTemplate("definition|main", context, function (html) {
                html = $(html);

                var definitionPropertiesElement = html.find('#' + context.panel_id + '_constraint_properties');
                var definitionPropertiesPanel = new my.DefinitionPropertiesPanel(archetypeModel, definitionPropertiesElement);

                var definitionTreeElement = html.find('#'+context.panel_id+'_tree');
                var definitionTree = new my.DefinitionTree(archetypeModel, definitionTreeElement, definitionPropertiesPanel);

                targetElement.append(html);
            });
        };


        return my;
    }();

}(ArchetypeEditor));