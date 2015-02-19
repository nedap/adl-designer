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

    my.useArchetype = function(archetypeModel) {
        createTerminologyTerms(archetypeModel, $('#archetype-editor-terminology-tabs-nodes'), "id");
        createTerminologyTerms(archetypeModel, $('#archetype-editor-terminology-tabs-terms'), "at");
    };


    return my;
}() );