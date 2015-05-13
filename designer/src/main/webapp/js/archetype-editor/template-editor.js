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

var TemplateEditor = (function () {
    var my = {};

    my.openLoadTemplateDialog = function() {
        $.getJSON("rest/repo/template").success(function (templateInfoList) {

            var context = {
                panel_id: GuiUtils.generateId()
            };
            GuiUtils.applyTemplate("template-editor|loadTemplateDialog", context, function (htmlString) {

                function populateTemplateIdSelect() {
                    templateIdSelect.empty();
                    for (var i in templateInfoList) {
                        var templateInfo = templateInfoList[i];
                        var option = $("<option>").attr("value", templateInfo.templateId).text(templateInfo.templateId + " (" + templateInfo.name +")");
                        templateIdSelect.append(option);
                    }
                }

                var content = $(htmlString);

                var templateIdSelect = content.find('#'+context.panel_id+"_template_id");

                populateTemplateIdSelect();


                GuiUtils.openSimpleDialog(
                    {
                        title: "Create new template",
                        buttons: {"load": "Load"},
                        content: content,
                        callback: function (content) {
                            var templateId = templateIdSelect.val();
                            $.getJSON("rest/repo/template/"+encodeURIComponent(templateId)).success(function(templateData) {
                                //alert ("Loaded template: " + templateId);
                                AOM.TemplateModel.createFromSerialized({
                                    archetypeRepository: my.archetypeRepository,
                                    referenceModel: my.referenceModel,
                                    data: templateData,
                                    callback: my.useTemplate
                                });
                            });
                        }
                    });
            });

        });
    };

    my.openCreateNewTemplateDialog = function () {
        var context = {
            panel_id: GuiUtils.generateId()
        };
        GuiUtils.applyTemplate("template-editor|createNewTemplateDialog", context, function (htmlString) {
            function populateParentArchetypeIdSelect() {
                parentArchetypeIdSelect.empty();
                var ids = [];
                for (var i in my.archetypeRepository.infoList) {
                    var info = my.archetypeRepository.infoList[i];
                    if (info.rmType === "COMPOSITION") {
                        ids.push(info.archetypeId);

                    }
                }
                ids.sort();
                for (var j in ids) {
                    parentArchetypeIdSelect.append($("<option>").attr("value", ids[j]).text(ids[j]));
                }
            }

            function createTemplateId() {
                return "openEHR-EHR-" + "COMPOSITION" + "."
                    + sanitizeConcept(conceptInput.val().trim()) + ".v"
                    + versionInput.val().trim();
            }

            function isValidConcept(str) {
                // invalid ascii characters
                if (/[\u0000-\u002f\u003a-\u0040\u005b-\u005e\u0060\u007b-\u007f]/.test(str)) return false;
                return true;
            }

            function sanitizeConcept(str) {
                str = str.toLowerCase();
                str = str.replace(/[\s\.]/g, "_");
                return str;
            }

            function changeValue() {
                templateIdText.text(createTemplateId());
            }

            var content = $(htmlString);

            var parentArchetypeIdSelect = content.find('#' + context.panel_id + '_archetype_id');
            var conceptInput = content.find('#' + context.panel_id + '_concept');
            var versionInput = content.find('#' + context.panel_id + '_version');
            var templateIdText = content.find('#' + context.panel_id + '_template_id');

            parentArchetypeIdSelect.on('change', changeValue);
            conceptInput.on('change', changeValue);
            versionInput.on('change', changeValue);

            populateParentArchetypeIdSelect();
            changeValue();

            GuiUtils.openSimpleDialog(
                {
                    title: "Create new template",
                    buttons: {"create": "Create"},
                    content: content,
                    callback: function (content) {
                        var rawConcept = conceptInput.val().trim();
                        var sanitizedConcept = sanitizeConcept(rawConcept);
                        if (rawConcept.length === 0) {
                            return "Concept is required";
                        }
                        if (!isValidConcept(sanitizedConcept)) {
                            return "Invalid concept";
                        }
                        var version = versionInput.val().trim();
                        if (version.length === 0) {
                            return "Version is invalid";
                        }

                        var templateId = createTemplateId();

                        AOM.TemplateModel.createNew({
                            archetypeRepository: my.archetypeRepository,
                            referenceModel: my.referenceModel,
                            templateId: templateId,
                            parentArchetypeId: parentArchetypeIdSelect.val(),
                            callback: function (templateModel) {
                                my.useTemplate(templateModel);
                            }

                        });
                    }
                });
        });

    };

    my.saveCurrentTemplate = function () {
        if (!my.templateModel) return;

        jQuery.ajax({
            'type': 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            'url': "rest/repo/template",
            'contentType': 'application/json',
            'data': JSON.stringify(my.templateModel.toSerializableForm())/*,
             'dataType': 'text'*/
        }).success(function () {
            alert('Template saved');
        });

    };

    my.useTemplate = function (templateModel) {

        function loadDescription() {
            var targetElement = $('#archetype-editor-main-tabs-description');
            ArchetypeEditor.Description.show(templateModel.getRootArchetypeModel(), targetElement);
        }

        function loadDisplay() {
            var targetElement = $('#archetype-editor-main-tabs-display');
            my.Display.show(templateModel, targetElement);
        }


        my.templateModel=templateModel;

        var targetElement = $('#archetype-editor-main-tabs-definition');
        my.Definition.show(templateModel, my.referenceModel, targetElement);

        loadDescription();
        $('a[href="#archetype-editor-main-tabs-description"]').on('show.bs.tab', loadDescription);
        loadDisplay();
        $('a[href="#archetype-editor-main-tabs-display"]').on('show.bs.tab', loadDisplay);

    };

    my.initialize = function (callback) {
        var latch = new CountdownLatch(4);
        my.referenceModel = new AOM.ReferenceModel(latch.countDown);
        my.archetypeRepository = new AOM.ArchetypeRepository(latch.countDown);

        // these templates are loaded at initialization, to avoid asynchronous callback and multiple retrieves
        GuiUtils.preloadTemplates([
                "util",
                "properties/constraint-common",
                "terminology/terms"
            ],
            latch.countDown);


        ArchetypeEditor.initialize(latch.countDown);

        latch.execute(callback);
    };

    return my;


}() );