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
            panel_id: GuiUtils.generateId(),
            archetypes: my.archetypeRepository.infoList
        };
        GuiUtils.applyTemplate("dialog-archetype|load", loadArchetypeContext, function (htmlString) {
            var content = $(htmlString);


            GuiUtils.openSimpleDialog(
                {
                    title: "Load archetype",
                    buttons: {"load": "Load"},
                    content: content,
                    callback: function (content) {
                        var archetypeId = content.find('#' + loadArchetypeContext.panel_id + '_archetype').val();

                        my.loadArchetype(archetypeId, my.useArchetype);
                    }
                });
        });
    };

    my.openSpecializeArchetypeDialog = function () {
        var loadArchetypeContext = {
            panel_id: GuiUtils.generateId(),
            archetypes: my.archetypeRepository.infoList
        };
        GuiUtils.applyTemplate("dialog-archetype|specialize", loadArchetypeContext, function (htmlString) {
            var content = $(htmlString);

            var parentSelect = content.find('#' + loadArchetypeContext.panel_id + '_parent');
            var specializedInput = content.find('#' + loadArchetypeContext.panel_id + '_specialized');

            specializedInput.val(parentSelect.val());
            parentSelect.change(function () {
                specializedInput.val(parentSelect.val());
            });


            GuiUtils.openSimpleDialog(
                {
                    title: "Specialize archetype",
                    buttons: {"specialize": "Specialize"},
                    content: content,
                    callback: function (content) {
                        var parentArchetypeId = parentSelect.val();
                        var specializedArchetypeId = specializedInput.val().trim();
                        if (specializedArchetypeId.length === 0) {
                            return "Missing specialized archetype id"
                        }

                        var existing = Stream(my.archetypeRepository.infoList)
                            .anyMatch({archetypeId: specializedArchetypeId});
                        if (existing) {
                            return "Specialized archetype id already exists";
                        }

                        my.createSpecializedArchetypeModel(parentArchetypeId, specializedArchetypeId, my.useArchetype);
                    }
                });
        });
    };

    my.createSpecializedArchetypeModel = function (parentArchetypeId, newArchetypeId, callback) {
        $.getJSON("rest/repo/archetype/" + encodeURIComponent(parentArchetypeId) + "/flat")
            .done(function (data) {
                var parentData = AmUtils.clone(data);
                var parentArchetypeModel = new AOM.ArchetypeModel(parentData);
                data.archetype_id.value = newArchetypeId;
                data.parent_archetype_id = {
                    "@type": "ARCHETYPE_ID",
                    value: parentArchetypeId
                };

                var originalNodeId = data.definition.node_id;
                var specializedNodeId = data.definition.node_id + ".1";
                data.definition.node_id = specializedNodeId;
                var td = data.ontology.term_definitions;
                for (var lang in td) {
                    td[lang][specializedNodeId] = AmUtils.clone(td[lang][originalNodeId]);
                }
                var archetypeModel = new AOM.EditableArchetypeModel(data, parentArchetypeModel);
                callback(archetypeModel);
            });
    };


    my.loadArchetype = function (archetypeId, callback) {
        $.getJSON("rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat").success(
            function (data) {
                if (data.parent_archetype_id) {
                    $.getJSON("rest/repo/archetype/" + encodeURIComponent(data.parent_archetype_id.value) + "/flat").success(
                        function (parentData) {
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

    my.saveCurrentArchetype = function () {
        if (!my.archetypeModel) return;
        var archetypeId = my.archetypeModel.data.archetype_id.value;
        var archetypeJson = AOM.impoverishedClone(my.archetypeModel.data);

        $.ajax({
            type: "PUT",
            url: "rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat",
            data: JSON.stringify(archetypeJson),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done(function (data) {
            alert("Archetype saved");
        }).fail(function (errMsg) {
            alert(errMsg);
        });
    };



    my.getRmTypeHandler = function (rm_type, referenceModel) {
        referenceModel = referenceModel || my.referenceModel.name();
        var rmModule = rmModules[referenceModel];
        if (rmModule && rmModule.handlers[rm_type]) {
            return rmModule.handlers[rm_type];
        }
        var result = rmModules["@common"].handlers[rm_type] || rmModules[""].handlers[rm_type];
        if (result) return result;
        var ltPos = rm_type.indexOf('<');
        if (ltPos >= 0) {
            //var gtPos = rm_type.indexOf('>', ltPos);
            var mainRmType = rm_type.substring(0, ltPos);
            return my.getRmTypeHandler(mainRmType, referenceModel);
        }
        return result;

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
                            continue;
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
                    if (handler) {
                        var targetElement = generatedDom.find("#" + prop.panel_id);
                        if (targetElement.length > 0) {
                            if (handler.hide) {
                                handler.hide(stage, prop, targetElement);
                                continue;
                            }
                        }
                    }
                }
                my.applySubModulesHide(stage, generatedDom, prop)
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
                            continue;
                        }
                    }
                }
                my.applySubModulesUpdateContext(stage, generatedDom, prop);
            }
        }
    };


    my.useArchetype = function (archetypeModel) {

        function loadTerminology() {
            var targetElement = $('#archetype-editor-main-tabs-terminology');
            ArchetypeEditorTerminology.showTerminology(archetypeModel, targetElement);
        }

        function loadDescription() {
            var targetElement = $('#archetype-editor-main-tabs-description');
            my.Description.show(archetypeModel, targetElement);
        }


        my.archetypeModel = archetypeModel;

        var targetElement = $('#archetype-editor-main-tabs-definition');
        my.Definition.show(archetypeModel, targetElement);

        loadTerminology();
        $('a[href="#archetype-editor-main-tabs-terminology"]').on('show.bs.tab', loadTerminology);
        loadDescription();
        $('a[href="#archetype-editor-main-tabs-description"]').on('show.bs.tab', loadDescription);
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
        // these templates are loaded at initialization, to avoid asynchronous callback and multiple retrieves
        GuiUtils.preloadTemplates([
                "util",
                "properties/constraint-common",
                "terminology/terms"
            ],
            latch.countDown);
    };

    return my;
}() );