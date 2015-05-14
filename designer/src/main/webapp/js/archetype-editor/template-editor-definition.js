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
                                var archetypeModel = new AOM.ArchetypeModel(data);
                                var templateLanguages = templateModel.getArchetypeLanguageIntersection();
                                var archetypeLanguages = archetypeModel.allLanguages();
                                var joinedLanguages = AmUtils.intersectSet(AmUtils.listToSet(templateLanguages), AmUtils.listToSet(archetypeLanguages));
                                if (AmUtils.keys(joinedLanguages).length == 0) {
                                    alert('Archetype does not have any common languages with current template. Template languages: ' + templateLanguages + ", archetype languages: " + archetypeLanguages);
                                    return;
                                }

                                var generatedCons = templateModel.addArchetype(targetCons, data);
                                callback(generatedCons);
                            });
                        }
                    });
            });
        }


        function populateLanguageSelect(languageSelect, templateModel) {
            var lastVal = languageSelect.val();
            var lastValPresent = false;
            languageSelect.empty();
            var langs = templateModel.getArchetypeLanguageIntersection();
            for (var i in langs) {
                var lang = langs[i];
                languageSelect.append($('<option>').attr('value', lang).text(lang));
                if (lang == lastVal) {
                    lastValPresent = true;
                }
            }
            if (lastValPresent) {
                languageSelect.val(lastVal);
            } else {
                languageSelect.val(langs[0]);
            }

        }


        /**
         * @param targetElement
         * @constructor
         */
        my.DefinitionPropertiesPanel = function (targetElement) {
            targetElement.empty();
            var self = this;

            var stage, templateHandler, context, constraintHandler;

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
                if (templateHandler && templateHandler.hide) {
                    templateHandler.hide(stage, context, targetElement);
                    templateHandler = undefined;
                    constraintHandler = undefined;
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
                        dataElements.prop("disabled", !specialized);
                        saveButton.prop('disabled', !specialized);
                    }
                    var archetypeOnlyElements = targetElement.find(".archetype-only");
                    archetypeOnlyElements.prop("disabled", true);
                }

                clearConstraints(targetElement);
                var cons = constraintData.cons;
                if (!cons) return;
                var archetypeModel = AOM.ArchetypeModel.from(cons);

                var parentCons = archetypeModel.getParentConstraint(cons);
                var specialized = archetypeModel.isSpecialized(cons);

                var topDiv = $('<div class="container-fluid">');
                targetElement.append(topDiv);

                constraintHandler = ArchetypeEditor.getRmTypeHandler('main', '@common');
                templateHandler = constraintHandler;

                var customDiv = $('<div class="container-fluid">');
                targetElement.append(customDiv);

                stage = createEmptyStage();
                stage.archetypeModel = archetypeModel;
                stage.readOnly = !specialized;
                stage.constraintHandler = constraintHandler;
                stage.templateModel = AOM.TemplateModel.from(cons);

                context = templateHandler.createContext(stage, cons, parentCons);
                addPropertiesPanelToStage(stage, context, templateHandler, customDiv);
                templateHandler.show(stage, context, customDiv);

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

                    templateHandler.updateContext(stage, context, targetElement);
                    templateHandler.validate(stage, context, errors);
                    errorsDiv.empty();
                    if (errors.getErrors().length > 0) {
                        var errorsContext = {errors: errors.getErrors()};
                        GuiUtils.applyTemplate("properties/constraint-common|errors", errorsContext, errorsDiv);
                        console.error("There were validation errors:", errors.getErrors());
                        return;
                    }

                    console.debug("save changes from: ", cons);
                    templateHandler.updateConstraint(stage, context, cons, errors);
                    console.debug("save changes to:   ", cons);

                    archetypeModel.enrichReplacementConstraint(cons);
                    constraintData.info.tree.styleNodes(constraintData.treeNode.id, 1);

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
            var currentLanguage;

            var treeData = {};

            function nextTreeId() {
                return treeIdPrefix + (nextTreeIdIndex++).toString();
            }

            self.extractConstraintName = function (cons, language) {
                var label = templateModel.getConstraintLabel(cons, language);
                var deltas = [];

                if (!AOM.mixin(cons).isConstraint()) {
                    return label;
                }

                var archetypeModel = AOM.ArchetypeModel.from(cons);
                if (!archetypeModel.isSpecialized(cons)) return label;

                if (cons.occurrences && cons.occurrences.upper === 0) {
                    return label;
                }

                var parentCons = archetypeModel.getParentConstraint(cons);
                if (!parentCons) {
                    return label;
                }


                var term = archetypeModel.getTermDefinitionText(cons.node_id);
                var parentTerm = archetypeModel.parentArchetypeModel.getTermDefinitionText(parentCons.node_id);
                if (term !== parentTerm) {
                    deltas.push("NAME: from '" + parentTerm + '"');
                }
                if (AmInterval.toString(cons.occurrences) !== AmInterval.toString(parentCons.occurrences)) {
                    deltas.push("occ: " + AmInterval.toString(parentCons.occurrences) + " to " + AmInterval.toString(cons.occurrences))
                }
                if (deltas.length > 0) {
                    label = label + " <-- " + deltas.join(", ");
                }

                return label;
            };


            self.setLanguage = function (language) {

                function renameSubtree(node) {
                    var nodeData = treeData[node.id];
                    var cons = nodeData.cons || nodeData.attr;
                    var newName = self.extractConstraintName(cons, language);
                    info.tree.targetElement.jstree('rename_node', node, newName);
                    if (node.children) {
                        for (var i in node.children) {
                            var child = info.tree.targetElement.jstree('get_node', node.children[i]);
                            renameSubtree(child)
                        }
                    }
                }

                var treeRoot = info.tree.targetElement.jstree('get_node', '#');
                var node = info.tree.targetElement.jstree('get_node', treeRoot.children[0]);
                renameSubtree(node);

                info.tree.targetElement.jstree('redraw', true);

                currentLanguage = language;
            };


            function buildTreeJson(cons, showStructure) {

                function createJson(target, cons) {
                    if (cons["@type"] === "C_ATTRIBUTE") {
                        createAttrJson(target, cons);
                    } else {
                        createConsJson(target, cons);
                    }
                }

                function createConsJson(target, cons) {
                    var rmType = info.referenceModel.getType(cons.rm_type_name);
                    if (!showStructure && rmType && rmType.display.transparent) {
                        createChildrenJson(target, cons);
                        return;
                    }
                    var consJson = {
                        id: nextTreeId()
                    };
                    treeData[consJson.id] = {
                        cons: cons
                    };
                    if (!consJson.text) {
                        consJson.text = self.extractConstraintName(cons);
                    }
                    if (cons["@type"] === "ARCHETYPE_SLOT" || !ArchetypeEditor.getRmTypeHandler(cons)) {
                        consJson.children = [];
                        createChildrenJson(consJson.children, cons);
                    }
                    target.push(consJson);
                }

                function createAttrJson(target, cons) {
                    var rmType = info.referenceModel.getType(cons[".parent"].rm_type_name);
                    if (!showStructure && rmType) {
                        var rmAttribute = rmType.attributes[cons.rm_attribute_name];
                        if (rmAttribute && rmAttribute.display.transparent) {
                            createChildrenJson(target, cons);
                            return;
                        }
                    }

                    var attrJson = {
                        id: nextTreeId()
                    };
                    treeData[attrJson.id] = {
                        attr: cons
                    };
                    attrJson.text = cons.rm_attribute_name;
                    attrJson.children = [];
                    createChildrenJson(attrJson.children, cons);
                    target.push(attrJson);
                }

                function createChildrenJson(target, cons) {
                    var children = templateModel.getConstraintChildren(cons);
                    for (var i in children) {
                        var child = children[i];
                        createJson(target, child);
                    }
                }


                var resultTarget = [];
                createJson(resultTarget, cons);
                return resultTarget[0];

            }

            function styleNodeJson(treeNodeJson) {
                var cons = treeData[treeNodeJson.id].cons || treeData[treeNodeJson.id].attr;
                var isAttr = !treeData[treeNodeJson.id].cons;
                var archetypeModel = AOM.ArchetypeModel.from(cons);
                var isSpecialized = archetypeModel.isSpecialized(cons);

                if (cons && cons.rm_type_name) {
                    var rmType;
                    if (cons.rm_type_name === "ELEMENT") {
                        if (!cons.attributes || cons.attributes.length == 0) {
                            rmType = ""
                        }
                        else {
                            var attr = cons.attributes[0];
                            if (!attr.children || attr.children.length == 0) {
                                rmType = ""
                            } else if (attr.children.length == 1) {
                                rmType = attr.children[0].rm_type_name;
                            } else {
                                rmType = "ELEMENT"; // no specific icon for choice
                            }
                        }
                    }
                    if (!rmType) rmType = cons.rm_type_name;
                    treeNodeJson.icon = "openehr-rm-icon " + rmType.toLowerCase();
                }

                treeNodeJson.a_attr = treeNodeJson.a_attr || {};
                treeNodeJson.a_attr.class = 'definition-tree-node ' + (isAttr ? 'attribute' : 'constraint');
                if (isSpecialized) {
                    treeNodeJson.a_attr.class += ' specialized';
                    if (cons.occurrences && cons.occurrences.upper === 0) {
                        treeNodeJson.a_attr.class += ' specialized prohibited';
                    }
                }
                if (cons) {
                    treeNodeJson.text = self.extractConstraintName(cons);
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

            self.renameConstraint = function () {
                var targetCons = self.current.data.cons;
                if (!targetCons || !targetCons.node_id) {
                    return;
                }
                var archetypeModel = AOM.ArchetypeModel.from(targetCons);
                if (!archetypeModel.isSpecialized(targetCons)) {
                    return;
                }

                var term = archetypeModel.getTermDefinition(targetCons.node_id, currentLanguage);
                var context = {
                    panel_id: GuiUtils.generateId(),
                    language: currentLanguage

                };
                GuiUtils.applyTemplate("template-editor|renameConstraintDialog", context, function (htmlString) {

                    var content = $(htmlString);

                    var textInput = content.find('#' + context.panel_id + '_text');
                    textInput.val(term.text);
                    var descriptionInput = content.find('#' + context.panel_id + '_description');
                    descriptionInput.val(term.description);
                    var commentInput = content.find('#' + context.panel_id + '_comment');
                    commentInput.val(term.comment);


                    GuiUtils.openSimpleDialog(
                        {
                            title: "Rename constraint",
                            buttons: {"rename": "Rename"},
                            content: content,
                            callback: function (content) {
                                var text = textInput.val();
                                var description = descriptionInput.val();
                                var comment = commentInput.val();
                                if (comment.length === 0) {
                                    comment = undefined;
                                }
                                if (text.length == 0) {
                                    return "text is required"
                                }
                                if (description.length == 0) {
                                    return "description is required"
                                }

                                archetypeModel.setTermDefinition(targetCons.node_id, currentLanguage, text, description, comment);
                                info.tree.styleNodes(self.current.treeNode.id, 1);

                            }
                        });
                });

            };


            self.addArchetype = function () {
                var targetCons = self.current.data.cons || self.current.data.attr;
                var templateModel = AOM.TemplateModel.from(targetCons);
                if (!templateModel.canAddArchetype(targetCons)) {
                    return;
                }
                openAddArchetypeDialog(targetCons, function (newCons) {
                    addConstraintTreeNode(self.current.treeNode, newCons);
                    populateLanguageSelect(info.toolbar.languageSelect, templateModel);
                });
            };


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
                    populateLanguageSelect(info.toolbar.languageSelect, templateModel);
                }
            };


            function addConstraintTreeNode(parentNode, childCons, pos) {
                var childJson = buildTreeJson(childCons);
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

            self.createTree = function (showStructure, callback) {
                treeData = {};

                var jsonTreeRoot = buildTreeJson(templateModel.getRootArchetypeModel().data.definition, showStructure);
                var jsonTreeTarget = [jsonTreeRoot];
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
                    })
                    .on('loaded.jstree', function () {
                        targetElement.jstree('open_all');
                        if (callback) {
                            callback();
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

            self.changeShowStructure = function (showStructure) {

                function findTreeNode(cons) {
                    function findInSubtree(treeNodeId) {
                        var actualCons = treeData[treeNodeId].cons || treeData[treeNodeId].attr;
                        if (actualCons === cons) return treeNodeId;
                        var treeNode = self.targetElement.jstree('get_node', treeNodeId);
                        for (var i in treeNode.children) {
                            var d = findInSubtree(treeNode.children[i]);
                            if (d) return d;
                        }
                        return null;
                    }

                    var treeRoot = info.tree.targetElement.jstree('get_node', '#');
//                    var node = info.tree.targetElement.jstree('get_node', treeRoot.children[0]);
                    return findInSubtree(treeRoot.children[0]);
                }

                var oldCurrentCons = self.current && (self.current.data.cons || self.current.data.attr);
                self.createTree(showStructure, function () {
                    while (oldCurrentCons) {
                        var newTreeNodeId = findTreeNode(oldCurrentCons);
                        if (newTreeNodeId) {
                            info.tree.targetElement.jstree('select_node', newTreeNodeId);
                            break;
                        }
                        oldCurrentCons = oldCurrentCons[".parent"];
                    }
                });
            };

            self.createTree();

            currentLanguage = templateModel.getRootArchetypeModel().defaultLanguage;
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
                        languageSelect: html.find('#' + context.panel_id + '_language'),
                        renameConstraint: html.find('#' + context.panel_id + '_renameConstraint'),
                        addArchetype: html.find('#' + context.panel_id + '_addArchetype'),
                        removeConstraint: html.find('#' + context.panel_id + '_removeConstraint'),
                        showStructure: html.find('#' + context.panel_id + '_structure')
                    }
                };
                var definitionPropertiesElement = html.find('#' + context.panel_id + '_constraints_panel');
                info.propertiesPanel = new my.DefinitionPropertiesPanel(definitionPropertiesElement);

                var definitionTreeElement = html.find('#' + context.panel_id + '_tree');
                info.tree = new my.DefinitionTree(templateModel, definitionTreeElement, info);


                info.toolbar.languageSelect.change(function () {
                    info.tree.setLanguage(info.toolbar.languageSelect.val())
                });
                populateLanguageSelect(info.toolbar.languageSelect, templateModel);

                info.toolbar.renameConstraint.click(info.tree.renameConstraint);
                info.toolbar.addArchetype.click(info.tree.addArchetype);
                info.toolbar.removeConstraint.click(info.tree.removeConstraint);
                info.toolbar.showStructure.on('change', function () {
                    info.tree.changeShowStructure(info.toolbar.showStructure.prop('checked'));
                });


                targetElement.append(html);
            });
        };

        return my;
    }();

}(TemplateEditor) );