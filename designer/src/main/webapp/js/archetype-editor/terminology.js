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

var ArchetypeEditorTerminology = (function () {
    var my = {};


    var createTerminologyTerms = function (archetypeModel, targetElement, prefix) {
        var context = {
            table_id: GuiUtils.generateId()
        };
        GuiUtils.applyTemplate("terminology/terms|terms", context, function (html) {
            html = $(html);

            archetypeModel.data.ontology.term_definitions = archetypeModel.data.ontology.term_definitions || {};
            var language = archetypeModel.defaultLanguage;

            var defaultTermDefinitions = archetypeModel.getAllTerminologyDefinitionsWithPrefix(prefix);
            var data = [];
            for (var code in defaultTermDefinitions) {
                var term = defaultTermDefinitions[code];
                data.push({
                    code: code,
                    text: term.text,
                    description: term.description
                });
            }

            var tableElement = html.find('#' + context.table_id);
            tableElement.bootstrapTable({
                data: data
            });

            tableElement.on('click-row.bs.table', function (e, row, $element) {
                row.text = row.text + 'ABC';
                my.openUpdateTermDefinitionDialog(archetypeModel, row.code, function () {
                    var term = archetypeModel.getTermDefinition(row.code, language);
                    row.text = term.text;
                    row.description = term.description;

                    tableElement.bootstrapTable('updateRow', {index: $element.data('index'), row: row});
                });
            });


            targetElement.empty();
            targetElement.append(html);

        });
    };

    var createValueSetsTable = function (archetypeModel, targetElement) {
        var context = {
            panel_id: GuiUtils.generateId()
        };
        GuiUtils.applyTemplate("terminology/terms|valueSets", context, function (html) {

            function loadData() {
                var language = archetypeModel.defaultLanguage;
                var value_sets = archetypeModel.data.ontology.value_sets;
                var data = [];
                for (var nodeId in value_sets) {
                    var term = archetypeModel.getTermDefinition(nodeId, language);
                    data.push({
                        code: nodeId,
                        text: term.text,
                        description: term.description
                    });
                }
                return data;
            }

            html = $(html);
            var data = loadData();

            var tableElement = html.find('#' + context.panel_id + "_table");
            tableElement.bootstrapTable({
                data: data
            });

            tableElement.on('click-row.bs.table', function (e, row, $element) {
                my.openUpdateValueSetDialog(archetypeModel, row.code,
                    {canSpecialize: true},
                    function (newCode) {
                        var term = archetypeModel.getTermDefinition(row.code, language);

                        var thisRow = Stream(data).filter({code: newCode}).findFirst().orElse(null);
                        if (thisRow) {
                            thisRow.text = term.text;
                            thisRow.description = term.description;
                            tableElement.bootstrapTable('load', data);
                        } else {
                            var newTerm = archetypeModel.getTermDefinition(newCode, language);
                            row = {
                                code: newCode,
                                text: newTerm.text,
                                description: newTerm.description
                            };
                            data.push(row);
                        }
                        tableElement.bootstrapTable('load', data);
                    });
            });

            html.find('#' + context.panel_id + '_new').click(function () {
                my.openUpdateValueSetDialog(archetypeModel, undefined, {}, function() {
                    data=loadData();
                    tableElement.bootstrapTable('load', data);
                });
            });


            targetElement.empty();
            targetElement.append(html);

        });
    };

    my.openUpdateTermDefinitionDialog = function (archetypeModel, term_id, updateCallback) {
        var contentContext = {
            id: GuiUtils.generateId(),
            term_id: term_id,
            terms: archetypeModel.exportTermDefinitions(term_id)
        };

        GuiUtils.applyTemplate("terminology/terms|updateTermDefinitionDialog", contentContext, function (content) {
            content = $(content);


            GuiUtils.openSimpleDialog({
                title: "Update term definition",
                buttons: {"update": "Update"},
                content: content,
                callback: function () {

                    content.find('input').each(function () {
                        var input = $(this);
                        contentContext.terms[input.data('lang')][input.data('field')] = input.val().trim();
                    });
                    archetypeModel.importTermDefinitions(term_id, contentContext.terms);
                    if (updateCallback) {
                        updateCallback();
                    }
                }
            });
        });
    };

    /**
     * Opens an Update/Create/Specialize valueSet dialog.
     *
     * @param {AOM.EditableArchetypeModel} archetypeModel
     * @param {string|undefined} valueSetId Id of the valueSet to be updated. If undefined, allows creation of new value set
     * @param options Dialog options.
     * @param {function(string, boolean)} updateCallback Called when the action is confirmed.
     */
    my.openUpdateValueSetDialog = function (archetypeModel, valueSetId, options, updateCallback) {
        var defaultOptions = {canSpecialize: true};
        options = $.extend({}, defaultOptions, options);

        var context = {
            panel_id: GuiUtils.generateId(),
            term: archetypeModel.getTermDefinition(valueSetId)
        };
        context.members = {};
        if (valueSetId) {
            Stream(archetypeModel.data.ontology.value_sets[valueSetId].members).forEach(function (member_id) {
                context.members[member_id] = archetypeModel.getTermDefinition(member_id);
            });
        }


        GuiUtils.applyTemplate("terminology/terms|updateValueSetDialog", context, function (content) {


            function setReadOnly(readOnly) {
                addNewMember.prop('disabled', readOnly);
                removeMember.prop('disabled', readOnly);
                addExistingMember.prop('disabled', readOnly);
                textElement.prop('disabled', readOnly);
                descriptionElement.prop('disabled', readOnly);
                select.prop('disabled', readOnly);
            }

            function addDefinedTerm(nodeId) {
                var term = archetypeModel.getTermDefinition(nodeId);
                var select = content.find("#" + context.panel_id + "_members");
                var option = $("<option>").attr("value", nodeId).attr('title', nodeId + ": " + term.description).text(term.text);
                select.append(option);
                context.members[nodeId] = term;
            }

            function getAvailableInternalTerms(context) {

                var availableTerminologyCodes;
                /*
                 if (isParentConstrained(context)) {
                 availableTerminologyCodes = context.parent.members;
                 } else*/
                {
                    availableTerminologyCodes = archetypeModel.getAllTerminologyDefinitionsWithPrefix("at");
                }
                var result = {};
                for (var code in availableTerminologyCodes) {
                    if (!context.members[code]) {
                        result[code] = availableTerminologyCodes[code];
                    }
                }
                return result;
            }


            content = $(content);


            var select = content.find("#" + context.panel_id + "_members");

            var addNewMember = content.find('#' + context.panel_id + "_add_new_member");
            addNewMember.click(function () {
                ArchetypeEditor.openAddNewTermDefinitionDialog(archetypeModel, function (nodeId) {
                    addDefinedTerm(nodeId);
                })
            })/*.prop('disabled', parentConstrained)*/;

            var removeMember = content.find('#' + context.panel_id + "_remove_member");
            removeMember.click(function () {
                var option = select.find(":selected");
                if (option.length > 0) {
                    var nodeId = option.val();
                    delete context.members[nodeId];
                    option.remove();
                }
            });

            var addExistingMember = content.find('#' + context.panel_id + "_add_existing_member");
            addExistingMember.click(function () {
                var dialogContext = {
                    terms: getAvailableInternalTerms(context)
                };
                if ($.isEmptyObject(dialogContext.terms)) return;

                ArchetypeEditor.openAddExistingTermsDialog(archetypeModel, dialogContext, function (selectedTerms) {
                    for (var i in selectedTerms) {
                        var nodeId = selectedTerms[i];
                        addDefinedTerm(nodeId);
                    }
                });
            });

            var textElement = content.find('#' + context.panel_id + '_text');
            var descriptionElement = content.find('#' + context.panel_id + '_description');

            var opts = {buttons: {}};
            if (!valueSetId) {
                setReadOnly(false);
                opts.title = "Create Value Set";
                opts.buttons['create'] = "Create";
            } else {
                var specialized = archetypeModel.isSpecialized(valueSetId);
                setReadOnly(!specialized);
                if (specialized) {
                    opts.title = "Update Value Set";
                    opts.buttons['update'] = "Update";
                } else if (options.canSpecialize) {
                    opts.title = "View/Specialize Value Set";
                    opts.buttons['specialize'] = "Specialize";
                }

            }
            GuiUtils.openSimpleDialog({
                title: opts.title,
                buttons: opts.buttons,
                content: content,
                callback: function (content, button) {


                    if (button === 'create' || button === 'update') {

                        var text = textElement.val().trim();
                        var description = descriptionElement.val().trim();

                        if (text.length === 0) {
                            return "text is required";
                        }
                        if (AmUtils.keys(context.members).length === 0) {
                            return "At least one code is required"
                        }

                        if (button === 'create') {
                            valueSetId = archetypeModel.generateSpecializedTermId("ac");
                        }

                        archetypeModel.setTermDefinition(valueSetId, undefined, text, description);
                        archetypeModel.data.ontology.value_sets[valueSetId] = {
                            id: valueSetId,
                            members: AmUtils.keys(context.members)
                        };

                        if (updateCallback) updateCallback(valueSetId, false);
                    } else if (button === "specialize") {
                        var newValueSetId = archetypeModel.specializeValueSet(valueSetId);
                        my.openUpdateValueSetDialog(archetypeModel, newValueSetId, options, updateCallback);
                        if (updateCallback) updateCallback(newValueSetId, true);
                    }
                }
            });


        });
    }
    ;

    my.showTerminology = function (archetypeModel, mainTargetElement) {
        mainTargetElement.empty();

        var mainContext = {
            panel_id: GuiUtils.generateId()
        };

        GuiUtils.applyTemplate('terminology/main|mainTabs', mainContext, function (html) {
            html = $(html);

            createTerminologyTerms(archetypeModel, html.find('#' + mainContext.panel_id + '_nodes'), "id");
            createTerminologyTerms(archetypeModel, html.find('#' + mainContext.panel_id + '_terms'), "at");
            createValueSetsTable(archetypeModel, html.find('#' + mainContext.panel_id + '_value_sets'));

            mainTargetElement.append(html);
        });
    };

    return my;
}() );