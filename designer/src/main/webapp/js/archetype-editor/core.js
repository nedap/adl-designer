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

var ArchetypeEditor = (function () {
        var my = {};

        var rmModules = {};


        my.openLoadArchetypeDialog = function () {
            var loadArchetypeContext = {
                archetypes: my.archetypeRepository.infoList
            };
            GuiUtils.applyTemplate("dialog-load-archetype", loadArchetypeContext, function (htmlString) {
                var content = $(htmlString);


                GuiUtils.openSimpleDialog(
                    {
                        title: "Load archetype",
                        buttons: {"load": "Load"},
                        content: content,
                        callback: function (content) {
                            var archetypeId = content.find('#selectArchetypeId').val();

                            my.loadArchetype(archetypeId, my.useArchetype);
                        }
                    });
            });
        };

        my.loadArchetype = function(archetypeId, callback) {
            $.getJSON("rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat").success(
                function (data) {
                    if (data.parent_archetype_id) {
                        $.getJSON("rest/repo/archetype/" + encodeURIComponent(data.parent_archetype_id.value) + "/flat").success(
                            function(parentData) {
                                var parentArchetypeModel = new AOM.ArchetypeModel(parentData);
                                var archetypeModel = new AOM.EditableArchetypeModel(data, parentArchetypeModel);
                                if (callback) {
                                    callback(archetypeModel);
                                }
                            }
                        );
                    } else {
                        var archetypeModel = new AOM.EditableArchetypeModel(data);
                        if (callback) {
                            callback(archetypeModel);
                        }
                    }
                });

        };

        my.saveCurrentArchetype = function() {
            if (!my.archetypeModel) return;
            var archetypeId = my.archetypeModel.data.archetype_id.value;
            var archetypeJson = AOM.impoverishedClone(my.archetypeModel.data);

            $.ajax({
                type: "PUT",
                url: "rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat",
                data: JSON.stringify(archetypeJson),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data){alert(data);},
                failure: function(errMsg) {
                    alert(errMsg);
                }
            });
        };

        /**
         *
         * @param {AOM.EditableArchetypeModel} archetypeModel
         * @param  targetElement
         * @constructor
         */
        var DefinitionPropertiesPanel = function (archetypeModel, targetElement) {
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
                stage.archetypeEditor = my;
                return stage;
            }

            self.clear = function () {
                if (handler && handler.hide) {
                    handler.hide(stage, context, targetElement);
                    handler=undefined;
                    stage=undefined;
                    context=undefined;
                }
                targetElement.empty();
            };


            self.showConstraintProperties = function (cons) {
                self.clear();
                if (!cons) return;
                var isEditable = archetypeModel.isNodeTopLevel(cons);

                var topDiv = $("<div>");
                targetElement.append(topDiv);

                var topHandler = my.getRmTypeHandler("top", "@common");
                var topStage = createEmptyStage();
                var topContext = topHandler.createContext(topStage, cons);
                addPropertiesPanelToStage(topStage, topContext, topHandler, topDiv);
                topHandler.show(topStage, topContext, topDiv);


                handler = my.getRmTypeHandler(cons.rm_type_name);
                if (handler) {
                    var customDiv = $("<div>");
                    targetElement.append(customDiv);

                    stage = createEmptyStage();
                    context = handler.createContext(stage, cons);
                    addPropertiesPanelToStage(stage, context, handler, customDiv);
                    handler.show(stage, context, customDiv);
                }

                var errorsDiv = $('<div class="errors">');
                targetElement.append(errorsDiv);


                var footerDiv = $('<div class="footer">');
                targetElement.append(footerDiv);

                var footerContext = {
                    footer_id: GuiUtils.generateId()
                };

                GuiUtils.applyTemplate("properties/constraint-common|footer", footerContext, footerDiv);

                // add global handlers
                var dataElements = targetElement.find(".data");
                var saveButton = footerDiv.find('#' + footerContext.footer_id + '_save');

                if (!isEditable) {
                    dataElements.prop("disabled", true);
                    dataElements.prop("disabled", true);
                    saveButton.prop('disabled', false);
                }

                saveButton.click(function () {
                    var errors = new AmUtils.Errors();

                    var consClone = AOM.makeEmptyConstrainsClone(cons);

                    stage.realConstraint = false;
                    topHandler.updateContext(topStage, topContext, topDiv);
                    topHandler.updateConstraint(topStage, topContext, consClone, errors);

                    if (handler) {
                        handler.updateContext(stage, context, customDiv);
                        handler.updateConstraint(stage, context, consClone, errors);
                    }
                    errorsDiv.empty();
                    if (errors.getErrors().length > 0) {
                        var errorsContext = {errors: errors.getErrors()};
                        GuiUtils.applyTemplate("properties/constraint-common|errors", errorsContext, errorsDiv);
                        console.error("There were validation errors:", errors.getErrors());
                        return;
                    }

                    // validate required if it has a parent
                    // todo archetypeModel.validateReplacementConstraint(cons, consClone);

                    console.debug("save changes:\nfrom: ", cons, "\n  to: ", consClone);

                    stage.realConstraint = true;
                    topHandler.updateConstraint(topStage, topContext, cons, errors);
                    if (handler) {
                        handler.updateConstraint(stage, context, cons, errors);
                    }
                    archetypeModel.enrichReplacementConstraint(cons);
                });

            }
        };

        var DefinitionTree = function (archetypeModel, targetElement, definitionPropertiesPanel) {
            var self = this;
            var treeIdPrefix = AmUtils.random4() + "_";
            var nextTreeIdIndex = 0;

            var treeData = {};

            function nextTreeId() {
                return treeIdPrefix + (nextTreeIdIndex++).toString();
            }

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
                            attrJson.a_attr.class = "definition-tree-node";

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
                    consJson.text = archetypeModel.getTermDefinitionText(cons.node_id);

                    consJson.a_attr = consJson.a_attr || {};
                    consJson.a_attr.class = "definition-tree-node";
                    if (archetypeModel.isNodeTopLevel(cons)) {
                        consJson.a_attr.class += " specialized";
                    }

                    if (!consJson.text) {
                        consJson.text = ((cons.rm_type_name || "") + " " + (cons.node_id || "")).trim();
                    }

                    // only add attributes if no custom handler for this type
                    if (!my.getRmTypeHandler(cons.rm_type_name)) {

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

            var jsonTreeTarget = [];
            buildTreeJson(jsonTreeTarget, archetypeModel.data.definition);

            targetElement.html("");
            targetElement.jstree("destroy");
            targetElement.jstree(
                {
                    'core': {
                        'data': jsonTreeTarget,
                        'multiple': false
                    }
                });

            targetElement.on('select_node.jstree', function (event, treeEvent) {
                var data = treeData[treeEvent.node.id];
                definitionPropertiesPanel.showConstraintProperties(data.cons);
            });
        };


        my.getRmTypeHandler = function (rm_type, referenceModel) {
            referenceModel = referenceModel || my.referenceModel.name();
            var rmModule = rmModules[referenceModel];
            if (rmModule && rmModule.handlers[rm_type]) {
                return rmModule.handlers[rm_type];
            }
            return rmModules[""].handlers[rm_type];
        };

        my.applySubModules = function (stage, generatedDom, context) {
            for (var key in context) {
                var prop = context[key];
                if (typeof prop === "object") {
                    if (prop.type && prop.panel_id) {
                        var handler = my.getRmTypeHandler(prop.type);
                        if (handler) {
                            var targetElement = generatedDom.find("#" + prop.panel_id);
                            if (targetElement.length > 0) {
                                handler.show(stage, prop, targetElement);
                            }
                        }
                    }
                    my.applySubModules(stage, generatedDom, prop);
                }
            }
        };

        my.applySubModulesHide = function (stage, generatedDom, context) {
            for (var key in context) {
                var prop = context[key];
                if (typeof prop === "object") {
                    if (prop.type && prop.panel_id) {
                        var handler = my.getRmTypeHandler(prop.type);
                        if (handler && handler.hide) {
                            var targetElement = generatedDom.find("#" + prop.panel_id);
                            if (targetElement.length > 0) {
                                handler.hide(stage, prop, targetElement);
                            }
                        }
                    }
                    my.applySubModules(stage, generatedDom, prop);
                }
            }
        };

        my.applySubModulesUpdateContext = function (stage, generatedDom, context) {
            for (var key in context) {
                var prop = context[key];
                if (typeof prop === "object") {
                    if (prop.type && prop.panel_id) {
                        var handler = my.getRmTypeHandler(prop.type);
                        if (handler) {
                            var targetElement = generatedDom.find("#" + prop.panel_id);
                            if (targetElement.length > 0) {
                                handler.updateContext(stage, prop, targetElement);
                            }
                        }
                    }
                    my.applySubModules(stage, generatedDom, prop);
                }
            }
        };


        my.useArchetype = function (archetypeModel) {
            my.archetypeModel = archetypeModel;

            var definitionPropertiesElement = $('#archetype-editor-definition-node-properties');
            var definitionPropertiesPanel = new DefinitionPropertiesPanel(archetypeModel, definitionPropertiesElement);

            var definitionTreeElement = $('#archetype-editor-definition-tree');
            var definitionTree = new DefinitionTree(archetypeModel, definitionTreeElement, definitionPropertiesPanel);

            ArchetypeEditorTerminology.useArchetype(archetypeModel);
        };


        my.addRmModule = function (module) {
            rmModules[module.name] = module;
        };

        /**
         * Opens a dialog that enables creation of new terms
         * @param {EditableArchetypeModel} archetypeModel
         * @param {function?} callback calback to call once the term is created. First callback parameter is the generated term_id
         */
        my.openAddNewTermDefinitionDialog = function (archetypeModel, callback) {
            var addNewTermContext = {
                id: GuiUtils.generateId()
            };

            GuiUtils.applyTemplate("dialog-terms|addNew", addNewTermContext, function (htmlString) {
                var content = $(htmlString);

                GuiUtils.openSimpleDialog(
                    {
                        title: "Load archetype",
                        buttons: {"add": "Add term"},
                        content: content,
                        callback: function (content) {
                            var text = content.find('#' + addNewTermContext.id + "_text").val().trim();
                            var description = content.find('#' + addNewTermContext.id + "_description").val().trim();

                            if (text.length == 0) {
                                return; // do nothing
                            }

                            var newTerminologyCode = archetypeModel.addNewTermDefinition("at", text, description);
                            if (callback) {
                                callback(newTerminologyCode);
                            }
                        }
                    });
            });

        };

        my.openAddExistingTermsDialog = function (archetypeModel, context, callback) {
            GuiUtils.applyTemplate(
                "dialog-terms|addExistingTermsDialog",
                context, function (content) {
                    content = $(content);
                    GuiUtils.openSimpleDialog(
                        {
                            title: "Add existing terms from archetype",
                            buttons: {"add": "Add"},
                            content: content,
                            callback: function () {
                                var select = content.find('#selectExistingTerms');
                                var options = select.find(':selected');
                                if (options.length === 0) return;
                                var terms = [];
                                for (var i = 0; i < options.length; i++) {
                                    var nodeId = $(options[i]).val();
                                    terms.push(nodeId);
                                }
                                if (callback && terms.length) {
                                    callback(terms);
                                }
                            }
                        });
                });
        };

        my.initialize = function (callback) {
            var latch = new CountdownLatch(3);
            latch.execute(callback);
            my.referenceModel = new AOM.ReferenceModel(latch.countDown);
            my.archetypeRepository = new AOM.ArchetypeRepository(latch.countDown);
            // these templates must be loaded at initialization, to avoid asynchronous callback
            GuiUtils.loadTemplates("properties/constraint-common", true, latch.countDown);
        };

        return my;
    }()
    )
    ;