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
    var OpenEhrModule = function () {
        var self = this;

        self.name = "openEHR";

        self.handlers = {};
        self.handlers["DV_QUANTITY"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                var tupleConstraints = stage.archetypeModel.getAttributesTuple(cons, ["units", "magnitude", "precision"]);

                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_QUANTITY",
                    units_id: GuiUtils.generateId(),
                    unit_panels: []
                };
                for (var i in tupleConstraints) {
                    var tupleConstraint = tupleConstraints[i];
                    var precisionEnabled = !!(tupleConstraint.precision && tupleConstraint.precision.list &&
                                              tupleConstraint.precision.list.length > 0);
                    var units = (tupleConstraint.units && tupleConstraint.units.list) ? tupleConstraint.units.list[0] : undefined;
                    if (units === undefined) continue;

                    var panel = {
                        panel_id: GuiUtils.generateId(),
                        magnitude: stage.archetypeEditor.getRmTypeHandler("C_REAL").createContext(stage, tupleConstraint.magnitude),
                        units: units,
                        precision: precisionEnabled ? tupleConstraint.precision.list[0] : ""
                    };

                    context.unit_panels.push(panel);
                }
                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_QUANTITY", context, function (generatedDom) {

                        function showUnitPanel(panel_id) {
                            Stream(context.unit_panels).forEach(
                                function (panel) {
                                    var panelElement = targetElement.find("#" + panel.panel_id);
                                    if (panel.panel_id === panel_id) {
                                        panelElement.show();
                                    } else {
                                        panelElement.hide();
                                    }
                                });
                        }

                        function removeUnitPanel(panel_id) {
                            for (var i in context.unit_panels) {
                                var panel = context.unit_panels[i];
                                if (panel.panel_id === panel_id) {
                                    context.unit_panels.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        generatedDom = $(generatedDom);
                        generatedDom.find("#" + context.units_id + "_remove").click(
                            function () {
                                if (context.unit_panels.length === 0) return;
                                var panel_id = targetElement.find("#" + context.units_id).val();
                                removeUnitPanel(panel_id);
                                stage.propertiesPanel.redraw();
                            });

                        generatedDom.find("#" + context.units_id + "_add").click(
                            function () {
                                GuiUtils.openSingleTextInputDialog(
                                    {
                                        title: "Add unit constraint",
                                        inputLabel: "Enter unit",
                                        callback: function (content) {
                                            var newUnit = content.find("input").val().trim();
                                            if (newUnit.length === 0) return;
                                            var existingUnitPanel = Stream(context.unit_panels)
                                                .filter({units: newUnit})
                                                .findFirst().orElse();
                                            if (existingUnitPanel) {
                                                return "Unit " + newUnit + " already exists";
                                            }
                                            var panel = {
                                                panel_id: GuiUtils.generateId(),
                                                magnitude: stage.archetypeEditor.getRmTypeHandler("C_REAL").createContext(stage),
                                                units: newUnit,
                                                precision: ""
                                            };
                                            context.unit_panels.push(panel);
                                            stage.propertiesPanel.redraw();

                                        }
                                    })
                            });


                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);

                        var unitsSelect = generatedDom.find("#" + context.units_id);
                        unitsSelect.change(
                            function () {
                                showUnitPanel(unitsSelect.find("option:selected").val());
                            });

                        Stream(context.unit_panels).findFirst().ifPresent(
                            function (u) {
                                showUnitPanel(u.panel_id);
                            });
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                Stream(context.unit_panels).forEach(
                    function (up) {
                        var targetPanel = targetElement.find('#' + up.panel_id);
                        if (targetPanel.length > 0) {
                            stage.archetypeEditor.getRmTypeHandler("C_REAL").updateContext(stage, up.magnitude, targetPanel);
                            up.precision = targetPanel.find('#' + up.panel_id + '_precision').val();
                        }
                    });
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                stage.archetypeModel.removeAttribute(["units", "magnitude", "precision"]);

                cons.attribute_tuples = cons.attribute_tuples ||[];
                if (context.unit_panels.length > 0) {
                    var attributeTuple = AOM.newCAttributeTuple(["units", "magnitude", "precision"]);

                    for (var panelIndex in context.unit_panels) {
                        var panel = context.unit_panels[panelIndex];
                        var unitErrors = errors.sub("[" + panel.units + "]");

                        var unitCons = AOM.newCString();
                        unitCons.list = [panel.units];
                        unitCons.default_value = panel.units;


                        var magnitudeCons = AOM.makeEmptyConstrainsClone("C_REAL");
                        var magnitudeHandler = ArchetypeEditor.getRmTypeHandler("C_REAL");
                        magnitudeHandler.updateConstraint(stage, panel.magnitude, magnitudeCons, unitErrors.sub("magnitude"));

                        var precisionCons = AOM.makeEmptyConstrainsClone("C_INTEGER");
                        if (panel.precision !== "") {
                            var val = parseInt(panel.precision);
                            unitErrors.validate(!isNaN(val), "Not a valid integer", "precision");
                            precisionCons.list = [val];
                        }
                        attributeTuple.children.push(AOM.newCObjectTuple([unitCons, magnitudeCons, precisionCons]));
                    }
                    cons.attribute_tuples.push(attributeTuple);
                }
            };


            return handler;

        }();

        self.handlers["DV_CODED_TEXT"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                cons = cons || {};
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: cons && cons.rm_type_name ? cons.rm_type_name : "DV_TEXT",
                    defining_code: stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE")
                        .createContext(stage, AOM.AmQuery.get(cons, "defining_code"))
                };
                context.isCoded = context.type === "DV_CODED_TEXT";

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_CODED_TEXT", context, function (generatedDom) {

                        generatedDom = $(generatedDom);
                        var codedTextCheckbox = generatedDom.find("#" + context.panel_id + "_coded_text");
                        var definingCodeDiv = generatedDom.find("#" + context.defining_code.panel_id);

                        codedTextCheckbox.prop('checked', context.isCoded);
                        GuiUtils.setVisible(definingCodeDiv, codedTextCheckbox.prop('checked'));
                        codedTextCheckbox.click(
                            function () {
                                context.isCoded = codedTextCheckbox.prop('checked');
                                GuiUtils.setVisible(definingCodeDiv, context.isCoded);
                            });

                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE")
                    .updateContext(stage, context.defining_code, targetElement.find('#' + context.defining_code.panel_id));

            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                var type = context.isCoded ? "DV_CODED_TEXT" : "DV_TEXT";

                cons["@type"] = type;
                cons.rm_type_name = type;

                if (context.isCoded) { // context is DV_CODED_TEXT
                    var cDefiningCode = AOM.AmQuery.get(cons, "defining_code");
                    if (!cDefiningCode) {
                        var aDefiningCode = AOM.newCAttribute("defining_code");
                        cDefiningCode = AOM.newCTerminologyCode();
                        aDefiningCode.children = [cDefiningCode];
                        cons.attributes = cons.attributes || [];
                        cons.attributes.push(aDefiningCode);
                    }
                    stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE").updateConstraint(
                        stage, context.defining_code, cDefiningCode, errors.sub("defining_code"));

                } else { // context is DV_TEXT
                    stage.archetypeModel.removeAttribute(cons, ["defining_code"]);
                }
            };


            return handler;
        }(); // DV_CODED_TEXT
        self.handlers["DV_TEXT"] = self.handlers["DV_CODED_TEXT"];

        self.handlers["DV_BOOLEAN"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_BOOLEAN",
                    value: stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").createContext(stage, AOM.AmQuery.get(cons, "value"))
                };

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_BOOLEAN", context, function (generatedDom) {

                        generatedDom = $(generatedDom);
                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN")
                    .updateContext(stage, context.value, targetElement.find('#' + context.value.panel_id));

            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                stage.archetypeModel.removeAttribute(cons, "value");
                var aValue = AOM.newCAttribute("value");
                var cValue = AOM.newCBoolean();
                aValue.children = [cValue];
                cons.attributes = cons.attributes || [];
                cons.attributes.push(aValue);

                stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").updateConstraint(
                    stage, context.value, cValue, errors.sub("value"));
            };

            return handler;
        }(); // DV_BOOLEAN

        self.handlers["DV_COUNT"] = new function () {
            var handler = this;

            handler.createContext = function (stage, cons) {
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_COUNT",
                    magnitude: stage.archetypeEditor.getRmTypeHandler("C_INTEGER").createContext(stage, AOM.AmQuery.get(cons, "magnitude"))
                };

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_COUNT", context, function (generatedDom) {

                        generatedDom = $(generatedDom);
                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.getRmTypeHandler("C_INTEGER")
                    .updateContext(stage, context.magnitude, targetElement.find('#' + context.magnitude.panel_id));

            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                stage.archetypeModel.removeAttribute(cons, "magnitude");
                var aValue = AOM.newCAttribute("magnitude");
                var cValue = AOM.newCInteger();
                aValue.children = [cValue];
                cons.attributes = cons.attributes || [];
                cons.attributes.push(aValue);

                stage.archetypeEditor.getRmTypeHandler("C_INTEGER").updateConstraint(
                    stage, context.magnitude, cValue, errors.sub("magnitude"));
            };

            return handler;
        }(); // DV_COUNT

        self.handlers["DV_ORDINAL"] = new function () {
            var handler = this;


            handler.createContext = function (stage, cons) {
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_ORDINAL",
                    values: [],
                    assumed_value: cons.assumed_value
                };

                var tuples = stage.archetypeModel.getAttributesTuple(cons, ["value", "symbol"]);
                for (var i in tuples) {
                    var tuple = tuples[i];
                    var term = stage.archetypeModel.getTermDefinition(tuple["symbol"].code_list[0]);
                    var value = {
                        value: tuple["value"].list[0],
                        term_id: tuple["symbol"].code_list[0],
                        term: term
                    };
                    context.values.push(value);
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                function getAvailableInternalTerms() {
                    var allTerminologyCodes = stage.archetypeModel.getAllTerminologyDefinitionsWithPrefix("at");
                    var result = {};
                    var presentCodes = AmUtils.listToSet(Stream(context.values).map("term_id").toArray());

                    for (var code in allTerminologyCodes) {
                        if (!presentCodes[code]) {
                            result[code] = allTerminologyCodes[code];
                        }
                    }
                    return result;
                }


                function populateValuesSelect(valuesSelect, hasEmptyOption) {
                    context.values = Stream(context.values).sorted("value").toArray();

                    var oldval = valuesSelect.val();
                    valuesSelect.empty();
                    if (hasEmptyOption) {
                        valuesSelect.append($("<option>").attr("value", ""));
                    }
                    for (var i in context.values) {
                        var value = context.values[i];
                        var option = $("<option>")
                            .attr("value", value.term_id)
                            .attr("title", value.term_id + ": " + value.term.description)
                            .text(value.value + ": " + value.term.text);
                        valuesSelect.append(option);
                    }
                    valuesSelect.val(oldval);
                }



                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_ORDINAL", context, function (html) {
                        targetElement.append(html);

                        var valuesSelect = targetElement.find("#" + context.panel_id + "_values");
                        populateValuesSelect(valuesSelect);

                        targetElement.find('#' + context.panel_id + "_add_new_value").click(function () {
                            stage.archetypeEditor.openAddNewTermDefinitionDialog(
                                stage.archetypeModel, function (nodeId) {
                                    var term = stage.archetypeModel.getTermDefinition(nodeId);
                                    var nextValue = Stream(context.values).map("value").max().orElse(0) + 1;
                                    context.values.push(
                                        {
                                            value: nextValue,
                                            term_id: nodeId,
                                            term: term
                                        });
                                    populateValuesSelect(valuesSelect);
                                })

                        });

                        targetElement.find('#' + context.panel_id + "_remove_value").click(function () {
                            var option = valuesSelect.find(":selected");
                            if (option.length > 0) {
                                var nodeId = option.val();
                                option.remove();
                                context.values = Stream(context.values).filter(function (value) {
                                    return value.term_id !== nodeId
                                }).toArray(); // remove value with deleted nodeId
                                populateValuesSelect(valuesSelect);
                            }
                        });
                        targetElement.find('#' + context.panel_id + "_add_existing_value").click(function () {
                            var dialogContext = {
                                terms: getAvailableInternalTerms()
                            };
                            if ($.isEmptyObject(dialogContext.terms)) return;

                            stage.archetypeEditor.openAddExistingTermsDialog(stage.archetypeModel, dialogContext, function (selectedTerms) {
                                var nextValue = Stream(context.values).map("value").max().orElse(0) + 1;

                                for (var i in selectedTerms) {
                                    var nodeId = selectedTerms[i];
                                    var term = stage.archetypeModel.getTermDefinition(nodeId);
                                    context.values.push(
                                        {
                                            value: nextValue++,
                                            term_id: nodeId,
                                            term: term
                                        }
                                    );
                                }
                                populateValuesSelect(valuesSelect);
                            });
                        });

                        targetElement.find('#' + context.panel_id + "_edit_value").click(function () {
                            var option = valuesSelect.find(":selected");
                            if (option.length === 0) return;

                            var dialogContext = {
                                id: GuiUtils.generateId()
                            };
                            dialogContext.value = Stream(context.values).filter(function (value) {
                                return value.term_id === valuesSelect.val();
                            }).findFirst().orElse(undefined);

                            GuiUtils.applyTemplate(
                                "properties/constraint-openehr|DV_ORDINAL/editValue",
                                dialogContext, function (content) {
                                    content = $(content);
                                    GuiUtils.openSimpleDialog(
                                        {
                                            title: "Edit ordinal value",
                                            buttons: {"update": "Update"},
                                            content: content,
                                            callback: function () {
                                                var valueInput = content.find('#' + dialogContext.id + "_value");
                                                var newValue = parseInt(valueInput.val());
                                                if (isNaN(newValue) || valueInput.val().indexOf(".") >= 0) {
                                                    return "ordinal value must be an integer";
                                                }
                                                var existingValue = Stream(context.values).filter(function (value) {
                                                    return value.value === newValue;
                                                }).findFirst().orElse(undefined);

                                                if (existingValue && dialogContext.value.term_id !== existingValue.term_id) {
                                                    return "value is already used by another term '" + existingValue.term.text + "'";
                                                }

                                                dialogContext.value.value = newValue;
                                                populateValuesSelect(valuesSelect);
                                            }
                                        });
                                });

                        });
               });
            };

            handler.updateContext = function (stage, context, targetElement) {
                // context is updated on the fly in show
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                stage.archetypeModel.removeAttribute(cons, ["value", "symbol"]);

                cons.attribute_tuples = cons.attribute_tuples || [];
                if (context.values.length > 0) {
                    var attributeTuple = AOM.newCAttributeTuple(["value", "symbol"]);

                    for (var i in context.values) {
                        var contextValue = context.values[i];

                        var valueCons = AOM.newCInteger([contextValue.value]);

                        var symbolCons = AOM.newCTerminologyCode();
                        symbolCons.code_list=[contextValue.term_id];

                        attributeTuple.children.push(AOM.newCObjectTuple([valueCons, symbolCons]));
                    }
                    cons.attribute_tuples.push(attributeTuple);
                }

            };
            return handler;
        }(); // DV_ORDINAL

    };

    ArchetypeEditor.addRmModule(new OpenEhrModule());
}());