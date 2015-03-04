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
    ArchetypeEditor.Description = function () {
        var my = {};

        function showAuthoring(archetypeModel, targetElement) {
            targetElement.empty();
            var context = {
                panel_id: GuiUtils.generateId()
            };

            GuiUtils.applyTemplate('description|authoring', context, function (html) {
                html = $(html);

                var originalAuthorMapElement = new GuiUtils.TableMap(
                    archetypeModel.data.description.original_author,
                    html.find('#' + context.panel_id + '_original_author')
                );

                originalAuthorMapElement.onBlur(function () {
                    archetypeModel.data.description.original_author = originalAuthorMapElement.getAsMap();
                });

                var contributionsListElement = new GuiUtils.StringList(
                    archetypeModel.data.description.other_contributors,
                    html.find('#' + context.panel_id + '_contributors'),
                    {item: "contributor"}
                );

                contributionsListElement.onChange(function (list) {
                    archetypeModel.data.description.other_contributors = list
                });

                targetElement.append(html);
            });
        }

        function showLanguage(archetypeModel, targetElement) {
            targetElement.empty();
            var context = {
                panel_id: GuiUtils.generateId(),
                original_language: archetypeModel.data.original_language.code_string
            };

            GuiUtils.applyTemplate('description|language', context, function (html) {
                html = $(html);

                function populateTranslations() {
                    translationsSelect.empty();
                    for (var i in archetypeModel.data.translations) {
                        var translation = archetypeModel.data.translations[i];
                        var option = $("<option>").attr("value", translation.language.code_string)
                            .text(translation.language.code_string);
                        translationsSelect.append(option);
                    }
                }

                function populateTranslationDetails() {
                    var translationLanguage = translationsSelect.val();
                    var translation = Stream(archetypeModel.data.translations)
                        .filter(function (t) {
                            return t.language.code_string === translationLanguage
                        })
                        .findFirst()
                        .orElse(undefined);

                    html.find('.data').prop('disabled', translation === undefined);
                    translatorDiv.empty();
                    translatorOtherDetailsDiv.empty();
                    translatorAccreditation.off('blur');
                    if (!translation) {
                        translatorAccreditation.val("");
                    } else {
                        var translator = new GuiUtils.TableMap(translation.author, translatorDiv);
                        translatorAccreditation.val(translation.accreditation);
                        var translatorOtherDetails = new GuiUtils.TableMap(translation.other_details, translatorOtherDetailsDiv);

                        translator.onBlur(function () {
                            translation.author = translator.getAsMap();
                        });
                        translatorOtherDetails.onBlur(function () {
                            translation.other_details = translatorOtherDetails.getAsMap();
                        });
                        translatorAccreditation.blur(function () {
                            translation.accreditation = translatorAccreditation.val();
                        });
                    }
                }

                var translationsSelect = html.find('#' + context.panel_id + '_translations');
                var translatorDiv = html.find('#' + context.panel_id + '_translator');
                var translatorAccreditation = html.find('#' + context.panel_id + '_accreditation');
                var translatorOtherDetailsDiv = html.find('#' + context.panel_id + '_other_details');

                html.find('#' + context.panel_id + '_add_translation').click(function () {
                    GuiUtils.openSingleTextInputDialog({
                        title: "Add Translation",
                        inputLabel: "Language Code",
                        callback: function (content) {
                            var lang = content.find("input").val().trim();
                            if (lang.length === 0) {
                                return "Language code is required";
                            }
                            if (Stream(archetypeModel.data.translations)
                                    .anyMatch(function (t) {
                                        return t.language.code_string === lang
                                    })) {
                                return "Translation already exists";
                            }

                            archetypeModel.addTranslation(lang);
                            showLanguage(archetypeModel, targetElement);
                        }
                    })

                });

                populateTranslations();
                populateTranslationDetails();
                translationsSelect.change(populateTranslationDetails);


                targetElement.append(html);
            });
        }

        my.show = function (archetypeModel, targetElement) {
            targetElement.empty();
            var context = {
                panel_id: GuiUtils.generateId()
            };

            GuiUtils.applyTemplate('description|main', context, function (html) {
                html = $(html);

                html.find('a[href="#' + context.panel_id + '_authoring"]').on('show.bs.tab', function (e) {
                    showAuthoring(archetypeModel, html.find('#' + context.panel_id + '_authoring'));
                });
                html.find('a[href="#' + context.panel_id + '_language"]').on('show.bs.tab', function (e) {
                    showLanguage(archetypeModel, html.find('#' + context.panel_id + '_language'));
                });

                showAuthoring(archetypeModel, html.find('#' + context.panel_id + '_authoring'));

                targetElement.append(html);
            });
        };
        return my;
    }();

}(ArchetypeEditor));