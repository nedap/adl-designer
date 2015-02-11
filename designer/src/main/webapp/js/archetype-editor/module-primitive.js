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

(function () {

    /**
     * Example for handler api. Is not actually used, serves just as documentation
     * @returns {HandlerTemplate}
     * @constructor
     */
    var HandlerTemplate = function () {
        var handler = this;
        /**
         * Creates context (a gui model from existing or new constrains)
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {object} cons Object for which to create the context. undefined if it does not exist yet
         * @returns {object} context
         */
        handler.createContext = function (stage, cons) {
        };

        /**
         * Displays the gui and populates it with the values of the context
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {object} context contains values to populate the gui
         * @param targetElement jquery element where the gui will be displayed
         */
        handler.show = function (stage, context, targetElement) {
        };

        /** Updates context values from the current gui values
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param context
         * @param targetElement
         */
        handler.updateContext = function (stage, context, targetElement) {
        };

        /**
         * Updates constraint values from the context values. Also performs validation.
         * This function is called twice: first with an empty context object, and if validation succeeds,
         * again with the actual archetype object
         *
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param context contains values that are to be copied on the context
         * @param cons target constrains where the context values will be copied to
         * @param {Errors} errors errors for the validation
         * @returns {*}
         */
        handler.updateConstraint = function (stage, context, cons, errors) {
        };

        return handler;
    };

    var PrimitiveModule = function () {
        var self = this;
        self.name = ""; // empty string stands for primitives

        self.handlers = {};
        self.handlers["C_REAL"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                cons = cons || {};
                var context = {
                    "panel_id": GuiUtils.generateId(), "type": "C_REAL"
                };
                context.range_id = GuiUtils.generateId();
                context.range = (cons.range) ? AmInterval.toContainedString(cons.range) : "(*..*)";
                context.assumed_value_id = GuiUtils.generateId();
                context.assumed_value = cons.assumed_value != undefined ? String(cons.assumed_value) : "";

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate("properties/constraint-primitive|C_REAL", context, targetElement);
            };

            handler.updateContext = function (stage, context, targetElement) {
                context.range = targetElement.find('#' + context.range_id).val();
                context.assumed_value = targetElement.find('#' + context.assumed_value_id).val().trim();
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                if (typeof context.assumed_value === "string" && context.assumed_value.length > 0) {
                    cons.assumed_value = parseFloat(context.assumed_value);
                    errors.validate(!isNaN(cons.assumed_value), "Invalid number", "assumed_value");
                }

                if (context.range === "" || context.range === "(*..*)") {
                    context.range = undefined;
                } else {
                    cons.range = AmInterval.parseContainedString(context.range, "INTERVAL_OF_REAL");
                    errors.validate(cons.range, "Invalid interval", "range");
                    if (cons.range && cons.range.upper === undefined && cons.range.lower === undefined) cons.range = undefined;
                }
                return cons;
            };

            return handler;
        }(); // handler C_REAL

        self.handlers["C_INTEGER"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                cons = cons || {};
                var context = {
                    "panel_id": GuiUtils.generateId(), "type": "C_INTEGER"
                };
                context.range_id = GuiUtils.generateId();
                context.range = (cons.range) ? AmInterval.toContainedString(cons.range) : "(*..*)";
                context.assumed_value_id = GuiUtils.generateId();
                context.assumed_value = cons.assumed_value != undefined ? String(cons.assumed_value) : "";

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate("properties/constraint-primitive|C_INTEGER", context, targetElement);
            };

            handler.updateContext = function (stage, context, targetElement) {
                context.range = targetElement.find('#' + context.range_id).val();
                context.assumed_value = targetElement.find('#' + context.assumed_value_id).val().trim();
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                if (typeof context.assumed_value === "string" && context.assumed_value.length > 0) {
                    cons.assumed_value = parseInt(context.assumed_value);
                    errors.validate(AmUtils.isInt(cons.assumed_value), "Invalid integer", "assumed_value");
                }

                if (context.range === "" || context.range === "(*..*)") {
                    context.range = undefined;
                } else {
                    cons.range = AmInterval.parseContainedString(context.range, "INTERVAL_OF_INTEGER");
                    errors.validate(cons.range, "Invalid interval", "range");
                    errors.validate(cons.range.lower === undefined || AmUtils.isInt(cons.range.lower), "Invalid integer", "range.lower");
                    errors.validate(cons.range.upper === undefined || AmUtils.isInt(cons.range.upper), "Invalid integer", "range.upper");
                    if (cons.range && cons.range.upper === undefined && cons.range.lower === undefined) {
                        cons.range = undefined;
                    }
                }
                return cons;
            };

            return handler;
        }(); // handler C_INTEGER

        self.handlers["C_TERMINOLOGY_CODE"] = new function () {
            var handler = this;


            handler.createContext = function (stage, cons) {


                cons = cons || {};
                var context = {
                    "panel_id": GuiUtils.generateId(), "type": "C_TERMINOLOGY_CODE", assumed_value: cons.assumed_value
                };
                context.type_internal = cons.code_list && cons.code_list.length > 0;

                var allTerminologyCodes = stage.archetypeModel.getAllTerminologyDefinitionsWithPrefix("at")

                // todo external data
                if (context.type_internal) {
                    var presentTerminologyCodes = stage.archetypeModel.explodeValueSets(cons.code_list);
                    var availableTerminologyCodes = {};
                    for (var code in allTerminologyCodes) {
                        if (!presentTerminologyCodes[code]) {
                            availableTerminologyCodes[code] = allTerminologyCodes[code];
                        }
                    }
                    context.internal_defined_codes = presentTerminologyCodes;
                    //context.internal_available_codes = availableTerminologyCodes;
                } else {
                    context.internal_defined_codes = {};
                }


                return context;
            };

            handler.show = function (stage, context, targetElement) {
                function addDefinedTerm(nodeId) {
                    var term = stage.archetypeModel.getTermDefinition(nodeId);
                    var select = targetElement.find("#" + context.panel_id + "_internal_defined_codes");
                    var option = $("<option>").attr("value", nodeId).attr('title', nodeId + ": " + term.description).text(term.text);
                    select.append(option);
                    context.internal_defined_codes[nodeId] = term;
                }


                function updatePanelVisibility(radios, panels) {
                    for (var i in radios) {
                        GuiUtils.setVisible(panels[i], radios[i].prop('checked'));
                    }
                }

                function getAvailableInternalTerms(present_codes) {
                    var allTerminologyCodes = stage.archetypeModel.getAllTerminologyDefinitionsWithPrefix("at");
                    var result = {};
                    for (var code in allTerminologyCodes) {
                        if (!present_codes[code]) {
                            result[code] = allTerminologyCodes[code];
                        }
                    }
                    return result;
                }

                function updateInternalAssumedValue(select) {
                    select.empty();
                    var noAssumedValueOption = $("<option>").attr("value", "");
                    select.append(noAssumedValueOption);
                    var found = false;
                    for (var code in context.internal_defined_codes) {
                        var option = $("<option>").attr("value", code).text(context.internal_defined_codes[code].text);
                        if (code === context.assumed_value) {
                            option.prop("selected", true);
                            found = true;
                        }
                        select.append(option);
                    }
                    if (!found) {
                        noAssumedValueOption.prop('selected', true);
                        context.assumed_value = undefined;
                    }
                }


                GuiUtils.applyTemplate("properties/constraint-primitive|C_TERMINOLOGY_CODE", context, function (html) {
                    targetElement.append(html);


                    var panelInternal = targetElement.find("#" + context.panel_id + "_internal_panel");
                    var panelExternal = targetElement.find("#" + context.panel_id + "_external_panel");

                    var radioInternal = targetElement.find("#" + context.panel_id + "_internal");
                    var radioExternal = targetElement.find("#" + context.panel_id + "_external");
                    var assumedValueSelect = targetElement.find('#' + context.panel_id + "_assumed_value");

                    updateInternalAssumedValue(assumedValueSelect);

                    assumedValueSelect.change(function () {
                        context.assumed_value = assumedValueSelect.val();
                    });

                    radioInternal.change(function () {
                        updatePanelVisibility([radioInternal, radioExternal], [panelInternal, panelExternal]);
                        context.type_internal = radioInternal.prop('checked');
                    });
                    radioExternal.change(function () {
                        updatePanelVisibility([radioInternal, radioExternal], [panelInternal, panelExternal]);
                        context.type_internal = !radioExternal.prop('checked');
                    });

                    radioInternal.prop("checked", context.type_internal);
                    radioExternal.prop("checked", !context.type_internal);

                    updatePanelVisibility([radioInternal, radioExternal], [panelInternal, panelExternal]);

                    targetElement.find('#' + context.panel_id + "_add_new_term").click(function () {
                        stage.archetypeEditor.openAddNewTermDefinitionDialog(stage.archetypeModel, function (nodeId) {
                            addDefinedTerm(nodeId);
                            updateInternalAssumedValue(assumedValueSelect);
                        })
                    });

                    targetElement.find('#' + context.panel_id + "_remove_term").click(function () {
                        var select = targetElement.find("#" + context.panel_id + "_internal_defined_codes");
                        var option = select.find(":selected");
                        if (option.length > 0) {
                            var nodeId = option.val();
                            delete context.internal_defined_codes[nodeId];
                            option.remove();
                            if (context.assumed_value === nodeId) {
                                updateInternalAssumedValue(assumedValueSelect);
                            }
                        }
                    });

                    targetElement.find('#' + context.panel_id + "_add_existing_term").click(function () {
                        var dialogContext = {
                            terms: getAvailableInternalTerms(context.internal_defined_codes)
                        };
                        if ($.isEmptyObject(dialogContext.terms)) return;

                        stage.archetypeEditor.openAddExistingTermsDialog(stage.archetypeModel, dialogContext, function (selectedTerms) {
                            for (var i in selectedTerms) {
                                var nodeId = selectedTerms[i];
                                addDefinedTerm(nodeId);
                                updateInternalAssumedValue(assumedValueSelect);
                            }
                        });
                    });


                });

            };

            handler.updateContext = function (stage, context, targetElement) {
                // currently all context update (for now internal only) is done in show handlers
                if (context.assumed_value && context.assumed_value.length === 0) {
                    context.assumed_value = undefined;
                }
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                function findNearestTerm(language) {
                    var c = cons;
                    while (c) {
                        var text = stage.archetypeModel.getTermDefinition(c.node_id, language);
                        if (text) {
                            return text;
                        }
                        c = c[".parent"];
                    }
                    return undefined;
                }


//                var isRealCons = cons[".parent"] !== undefined; // is this true constraint update or just errors

                cons.assumed_value = context.assumed_value;

                if (context.type_internal) {
                    // internal terminology
                    if ($.isEmptyObject(context.internal_defined_codes)) {
                        cons.code_list = [];
                    } else if (stage.realConstraint) {
                        // on real constraint populate code_list with reference to value_set, and create/update the value set
                        var valueSetCode, valueSet;
                        if (cons.code_list && cons.code_list.length > 0) {
                            // use existing value set
                            valueSetCode = cons.code_list[0];
                            valueSet = stage.archetypeModel.data.ontology.value_sets[valueSetCode];
                        } else {
                            // create new value set
                            valueSetCode = stage.archetypeModel.generateSpecializedTermId("ac");
                            valueSet = {
                                "id": valueSetCode, members: []
                            };
                            // give term_definition to the new value set, for each language
                            var term_definitions = stage.archetypeModel.data.ontology.term_definitions;
                            for (var language in term_definitions) {
                                var nearestTerm = findNearestTerm(language);
                                if (nearestTerm) {
                                    var term = term_definitions[language][valueSetCode] = {};
                                    term.text = nearestTerm.text + " (synthesised)";
                                    if (nearestTerm.description) {
                                        term.description = nearestTerm.description + " (synthesised)";
                                    }
                                }
                            }

                            // add value set to ontology value_sets
                            if (!stage.archetypeModel.data.ontology.value_sets) {
                                stage.archetypeModel.data.ontology.value_sets = {};
                            }
                            stage.archetypeModel.data.ontology.value_sets[valueSetCode] = valueSet;
                            cons.code_list = [valueSetCode];

                        }

                        valueSet.members = [];
                        for (var code in context.internal_defined_codes) {
                            valueSet.members.push(code);
                        }
                    } else {
                        // on not real constraint (just a dummy for validation) populate code_list directly with codes
                        cons.code_list = [];
                        for (var code in context.internal_defined_codes) {
                            cons.code_list.push(code);
                        }
                    }

                } else {
                    // external terminology
                }


                return cons;
            };

            return handler;
        }(); // handler C_TERMINOLOGY_CODE

        self.handlers["C_BOOLEAN"] = new function () {
            var handler = this;


            handler.createContext = function (stage, cons) {
                cons = cons || {};
                var context = {
                    "panel_id": GuiUtils.generateId(), "type": "C_BOOLEAN", true_valid: cons.true_valid !== false, // undefined defaults to true
                    false_valid: cons.false_valid !== false, // undefined defaults to true
                    assumed_value: cons.assumed_value === undefined ? "" : (cons.assumed_value ? "true" : "false")
                };

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                function populateAssumedValueSelect(trueValid, falseValid, assumedValue) {
                    assumedValue.empty();
                    var noAssumedValue = $("<option>").attr("value", "").text("");
                    assumedValue.append(noAssumedValue);
                    assumedValue.val('');
                    if (trueValid.prop("checked")) {
                        assumedValue.append($("<option>").attr("value", "true").text("True"));
                        if (context.assumed_value === 'true') assumedValue.val('true');
                    }
                    if (falseValid.prop("checked")) {
                        assumedValue.append($("<option>").attr("value", "false").text("False"));
                        if (context.assumed_value === 'false') assumedValue.val('false');
                    }
                    context.assumed_value = assumedValue.val();
                }


                GuiUtils.applyTemplate("properties/constraint-primitive|C_BOOLEAN", context, function (html) {
                    targetElement.append(html);

                    var trueValid = targetElement.find("#" + context.panel_id + "_true_valid");
                    var falseValid = targetElement.find("#" + context.panel_id + "_false_valid");
                    var assumedValue = targetElement.find("#" + context.panel_id + "_assumed_value");

                    trueValid.prop('checked', context.true_valid);
                    falseValid.prop('checked', context.false_valid);
                    populateAssumedValueSelect(trueValid, falseValid, assumedValue);

                    trueValid.change(function () {
                        populateAssumedValueSelect(trueValid, falseValid, assumedValue);
                    });
                    falseValid.change(function () {
                        populateAssumedValueSelect(trueValid, falseValid, assumedValue);
                    });

                    assumedValue.change(function () {
                        context.assumed_value = assumedValue.val();
                    });
                });
            };

            handler.updateContext = function (stage, context, targetElement) {
                var trueValid = targetElement.find("#" + context.panel_id + "_true_valid");
                var falseValid = targetElement.find("#" + context.panel_id + "_false_valid");
                var assumedValue = targetElement.find("#" + context.panel_id + "_assumed_value");

                context.true_valid = trueValid.prop('checked');
                context.false_valid = falseValid.prop('checked');
                context.assumed_value = assumedValue.val();

            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                cons.true_valid = context.true_valid;
                cons.false_valid = context.false_valid;
                cons.assumed_value = context.assumed_value === 'true' ? true : (context.assumed_value === 'false' ? false : undefined);
            };

            return handler;
        }(); // handler C_BOOLEAN


        self.handlers["C_DURATION"] = new function () {
            var handler = this;

            function maxPeriodUnit(period) {
                return period.years ? "years" : period.months ? "months" : period.weeks ? "weeks" : period.days ? "days" : period.minutes ? "minutes" : period.seconds ? "seconds" : "years";
            }

            function getInt(str) {
                if (str === undefined) return undefined;
                var num = parseInt(str);
                if (isNaN(num)) return undefined;
                return num;
            }

            function parsePattern(str) {
                var result = {};
                if (str === undefined || str.length === 0) {
                    result.all = true;
                    return result;
                }
                var i = 1; // skip first 'P'
                var timePart = false;
                while (i < str.length) {
                    var c = str.charAt(i++);
                    switch (c) {
                        case 'Y':
                            result.years = true;
                            break;
                        case 'M':
                            if (timePart) result.months = true; else result.minutes = true;
                            break;
                        case 'W':
                            result.weeks = true;
                            break;
                        case 'D':
                            res.days = true;
                            break;
                        case 'T':
                            timePart = true;
                            break;
                        case 'H':
                            result.hours = true;
                            break;
                        case 'S':
                            result.seconds = true;
                            break;
                    }
                }
                return result;
            }

            function patternToString(pattern) {
                if (pattern.all) return undefined;
                var result = 'P';
                if (pattern.years) result += 'Y';
                if (pattern.months) result += 'M';
                if (pattern.weeks) result += 'W';
                if (pattern.days) result += 'D';
                var time = '';
                if (pattern.hours) time += 'H';
                if (pattern.minutes) time += 'M';
                if (pattern.seconds) time += 'S';
                if (time.length > 0) {
                    result += 'T' + time;
                }
                return result;
            }

            handler.createContext = function (stage, cons) {
                cons = cons || {};

                var context = {
                    "panel_id": GuiUtils.generateId(), "type": "C_DURATION"
                };
                if (cons.range) {
                    var anyPeriod = cons.range.lower || cons.range.upper;
                    if (anyPeriod) {
                        context.range = {
                            lower_included: cons.range.lower_included, upper_included: cons.range.upper_included
                        };

                        anyPeriod = Iso8601Period.of(anyPeriod);
                        context.units = maxPeriodUnit(anyPeriod.period);

                        context.range.lower = cons.range.lower ? Iso8601Period.of(cons.range.lower).period[context.units] : undefined;
                        context.range.upper = cons.range.upper ? Iso8601Period.of(cons.range.upper).period[context.units] : undefined;
                    }
                }
                if (cons.assumed_value) {
                    if (!context.units) {
                        context.units = maxPeriodUnit(Iso8601Period.of(cons.assumed_value));
                    }
                    context.assumed_value = Iso8601Period.of(cons.assumed_value).period[context.units];
                }
                context.units = context.units || "years";
                if (!context.range) {
                    context.range = {
                        lower_included: true, lower: '', upper_included: true, upper: ''
                    };
                }
                context.pattern = parsePattern(cons.pattern);
                return context;
            };

            handler.show = function (stage, context, targetElement) {


                GuiUtils.applyTemplate("properties/constraint-primitive|C_DURATION", context, function (html) {
                    targetElement.append(html);

                    var units = targetElement.find('#' + context.panel_id + '_units');

                    var lowerIncluded = targetElement.find('#' + context.panel_id + '_lower_included');
                    var upperIncluded = targetElement.find('#' + context.panel_id + '_upper_included');

                    var patternAll = targetElement.find('#' + context.panel_id + '_pattern_all');

                    var patternCustomPanel = targetElement.find('#' + context.panel_id + '_pattern_custom');

                    GuiUtils.setVisible(patternCustomPanel, !patternAll.prop('checked'));

                    patternAll.change(function() {
                        GuiUtils.setVisible(patternCustomPanel, !patternAll.prop('checked'));
                    });


                    units.val(context.units);

                    lowerIncluded.val(String(context.range.lower_included));
                    upperIncluded.val(String(context.range.upper_included));
                });
            };

            handler.updateContext = function (stage, context, targetElement) {
                var units = targetElement.find('#' + context.panel_id + '_units');

                var lowerIncluded = targetElement.find('#' + context.panel_id + '_lower_included');
                var upperIncluded = targetElement.find('#' + context.panel_id + '_upper_included');

                var lower = targetElement.find('#' + context.panel_id + '_lower');
                var upper = targetElement.find('#' + context.panel_id + '_upper');
                var assumedValue = targetElement.find('#' + context.panel_id + '_assumed_value');

                context.units = units.val();
                context.range.lower_included = Boolean(lowerIncluded.val());
                context.range.upper_included = Boolean(upperIncluded.val());
                context.range.lower = getInt(lower.val());
                context.range.upper = getInt(upper.val());
                context.assumed_value = getInt(assumedValue.val());

                context.pattern={};
                var unitStrings = ['all', 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];
                for (var i in unitStrings) {
                    var unit=unitStrings[i];
                    var element = targetElement.find('#' + context.panel_id + '_pattern_'+unit);
                    context.pattern[unit]=element.prop('checked');
                }
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                if (context.range && (context.range.lower !== undefined || context.range.upper != undefined)) {
                    if (context.range.lower !== undefined && context.range.upper !== undefined && context.range.lower > context.range.upper) {
                        errors.add("lower bound is greater than upper bound", "range")
                    }
                    var upper, lower;
                    if (context.range.lower !== undefined) {
                        lower = Iso8601Period.ofUnits(context.units, context.range.lower).toString();
                    }
                    if (context.range.upper !== undefined) {
                        upper = Iso8601Period.ofUnits(context.units, context.range.upper).toString();
                    }
                    cons.range = AmInterval.of(lower, upper, "INTERVAL_OF_DURATION");
                    cons.range.lower_included = Boolean(context.range.lower_included);
                    cons.range.upper_included = Boolean(context.range.upper_included);
                } else {
                    cons.range = undefined;
                }
                if (context.assumed_value !== undefined) {
                    cons.assumed_value = Iso8601Period.ofUnits(context.units, context.assumed_value).toString();
                } else {
                    cons.assumed_value = undefined;
                }
                cons.pattern = patternToString(context.pattern);
            };

            return handler;
        }(); // C_DURATION

    };

    ArchetypeEditor.addRmModule(new PrimitiveModule());
}() );