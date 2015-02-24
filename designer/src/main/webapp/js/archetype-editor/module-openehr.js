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
    var OpenEhrModule = function () {
        var self = this;

        self.name = "openEHR";

        /**
         * Adds an attribute with a single constraint to a constraint
         * @param cons target constrain
         * @param attributeName attribute name
         * @param childConstraint single constraint under the attribute
         * @return childConstraint
         */
        function addAttributeConstraint(cons, attributeName, childConstraint) {
            var attr = AOM.newCAttribute(attributeName);
            attr.children = [childConstraint];

            cons.attributes = cons.attributes || [];
            cons.attributes.push(attr);
            return childConstraint;
        }


        var CComplexObjectHandler = function () {
            var handler = this;
            ArchetypeEditor.Modules.RmHandler.call(handler);
            
            handler.hide = function (stage, context, targetElement) {
                stage.archetypeEditor.applySubModulesHide(stage, targetElement, context);
            };
        };
        AmUtils.extend(CComplexObjectHandler, ArchetypeEditor.Modules.RmHandler);

        self.handlers = {};
        var DvQuantityHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                var tupleConstraints = stage.archetypeModel.getAttributesTuple(cons, ["units", "magnitude", "precision"]);
                var parentTupleConstraints = parentCons
                    ? stage.archetypeModel.parentArchetypeModel.getAttributesTuple(parentCons, ["units", "magnitude", "precision"])
                    : undefined;

                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_QUANTITY",
                    units_id: GuiUtils.generateId(),
                    unit_panels: []
                };
                for (var i in tupleConstraints) {
                    var tupleConstraint = tupleConstraints[i];
                    var parentTupleConstraint = parentTupleConstraints && parentTupleConstraints[i];
                    var precisionEnabled = !!(tupleConstraint.precision && tupleConstraint.precision.list &&
                    tupleConstraint.precision.list.length > 0);
                    var units = (tupleConstraint.units && tupleConstraint.units.list) ? tupleConstraint.units.list[0] : undefined;
                    if (units === undefined) continue;

                    var panel = {
                        panel_id: GuiUtils.generateId(),
                        magnitude: stage.archetypeEditor.getRmTypeHandler("C_REAL").createContext(stage, tupleConstraint.magnitude,
                            parentTupleConstraint && parentTupleConstraint.magnitude),
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

            handler.validate = function (stage, context, errors) {
                for (var panelIndex in context.unit_panels) {
                    var panel = context.unit_panels[panelIndex];
                    var unitErrors = errors.sub("[" + panel.units + "]");

                    var magnitudeHandler = ArchetypeEditor.getRmTypeHandler("C_REAL");
                    magnitudeHandler.validate(stage, panel.magnitude, unitErrors.sub("magnitude"));

                    if (panel.precision && panel.precision.length > 0) {
                        var val = parseInt(panel.precision);
                        unitErrors.validate(AmUtils.isInt(val), "Not a valid integer", "precision");
                    }
                }
            };
            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, ["units", "magnitude", "precision"]);

                cons.attribute_tuples = cons.attribute_tuples || [];
                if (context.unit_panels.length > 0) {
                    var attributeTuple = AOM.newCAttributeTuple(["units", "magnitude", "precision"]);

                    for (var panelIndex in context.unit_panels) {
                        var panel = context.unit_panels[panelIndex];

                        var unitCons = AOM.newCString();
                        unitCons.list = [panel.units];
                        unitCons.default_value = panel.units;

                        var magnitudeCons = AOM.newCReal();
                        var magnitudeHandler = ArchetypeEditor.getRmTypeHandler("C_REAL");
                        magnitudeHandler.updateConstraint(stage, panel.magnitude, magnitudeCons);

                        var precisionCons = AOM.newCInteger();
                        if (panel.precision === "" || !panel.precision) {
                            precisionCons.range = AmInterval.of(0, undefined, "INTERVAL_OF_INTEGER");
                        } else {
                            precisionCons.list = [parseInt(panel.precision)];
                        }
                        attributeTuple.children.push(AOM.newCObjectTuple([unitCons, magnitudeCons, precisionCons]));
                    }
                    cons.attribute_tuples.push(attributeTuple);
                }
            };


        };
        AmUtils.extend(DvQuantityHandler, CComplexObjectHandler);


        var DvTextHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var definingCodeCons = AOM.AmQuery.get(cons, "defining_code");
                var parentDefiningCodeCons = AOM.AmQuery.get(parentCons, "defining_code");
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: cons && cons.rm_type_name ? cons.rm_type_name : "DV_TEXT",
                    defining_code: stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE")
                        .createContext(stage, definingCodeCons, parentDefiningCodeCons)
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

            handler.validate = function (stage, context, errors) {
                if (context.isCoded) { // context is DV_CODED_TEXT
                    stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE").validate(
                        stage, context.defining_code, errors.sub("defining_code"));
                }
            };

            handler.updateConstraint = function (stage, context, cons) {
                var type = context.isCoded ? "DV_CODED_TEXT" : "DV_TEXT";

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
                        stage, context.defining_code, cDefiningCode);

                } else { // context is DV_TEXT
                    stage.archetypeModel.removeAttribute(cons, ["defining_code"]);
                }
            };
        };
        AmUtils.extend(DvTextHandler, CComplexObjectHandler);

        var DvBooleanHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                var valueCons = AOM.AmQuery.get(cons, "value");
                var parentValueCons = AOM.AmQuery.get(parentCons, "value");

                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_BOOLEAN",
                    value: stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").createContext(stage, valueCons, parentValueCons)
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

            handler.validate = function (stage, context, errors) {
                stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").validate(
                    stage, context.value, errors.sub("value"));
            };

            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, "value");
                var aValue = AOM.newCAttribute("value");
                var cValue = AOM.newCBoolean();
                aValue.children = [cValue];
                cons.attributes = cons.attributes || [];
                cons.attributes.push(aValue);

                stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").updateConstraint(
                    stage, context.value, cValue);
            };
        };
        AmUtils.extend(DvBooleanHandler, CComplexObjectHandler);

        var DvCountHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);
            handler.createContext = function (stage, cons, parentCons) {
                var magnitudeCons = AOM.AmQuery.get(cons, "magnitude");
                var parentMagnitudeCons = AOM.AmQuery.get(parentCons, "magnitude");

                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_COUNT",
                    magnitude: stage.archetypeEditor.getRmTypeHandler("C_INTEGER").createContext(stage, magnitudeCons, parentMagnitudeCons)
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

            handler.validate = function (stage, context, errors) {
                stage.archetypeEditor.getRmTypeHandler("C_INTEGER").validate(
                    stage, context.magnitude, errors.sub("magnitude"));
            };

            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, "magnitude");
                var aValue = AOM.newCAttribute("magnitude");
                var cValue = AOM.newCInteger();
                aValue.children = [cValue];
                cons.attributes = cons.attributes || [];
                cons.attributes.push(aValue);

                stage.archetypeEditor.getRmTypeHandler("C_INTEGER").updateConstraint(
                    stage, context.magnitude, cValue);
            };

        };
        AmUtils.extend(DvCountHandler, CComplexObjectHandler);

        var DvOrdinalHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);
            handler.createContext = function (stage, cons, parentCons) {
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_ORDINAL",
                    values: [],
                    assumed_value: cons.assumed_value
                };

                var tuples = stage.archetypeModel.getAttributesTuple(cons, ["value", "symbol"]);
                //var parentTuples = parentCons ? stage.archetypeModel.parentArchetypeModel.getAttributesTuple(parentCons, ["value", "symbol"]) : undefined;
                for (var i in tuples) {
                    var tuple = tuples[i];
                    //var parentTuple = parentTuples && parentTuples[i];
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

            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, ["value", "symbol"]);

                cons.attribute_tuples = cons.attribute_tuples || [];
                if (context.values.length > 0) {
                    var attributeTuple = AOM.newCAttributeTuple(["value", "symbol"]);

                    for (var i in context.values) {
                        var contextValue = context.values[i];

                        var valueCons = AOM.newCInteger([contextValue.value]);

                        var symbolCons = AOM.newCTerminologyCode();
                        symbolCons.code_list = [contextValue.term_id];

                        attributeTuple.children.push(AOM.newCObjectTuple([valueCons, symbolCons]));
                    }
                    cons.attribute_tuples.push(attributeTuple);
                }

            };

        };
        AmUtils.extend(DvOrdinalHandler, CComplexObjectHandler);

        var DvDurationHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                var valueCons = AOM.AmQuery.get(cons, "value");
                var parentValueCons = AOM.AmQuery.get(parentCons, "value");

                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_DURATION",
                    value: stage.archetypeEditor.getRmTypeHandler("C_DURATION").createContext(stage, valueCons, parentValueCons)
                };

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_DURATION", context, function (generatedDom) {

                        generatedDom = $(generatedDom);
                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.getRmTypeHandler("C_DURATION")
                    .updateContext(stage, context.value, targetElement.find('#' + context.value.panel_id));

            };

            handler.validate = function (stage, context, errors) {
                stage.archetypeEditor.getRmTypeHandler("C_DURATION").validate(
                    stage, context.value, errors.sub("value"));
            };

            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, "value");

                var cValue = AOM.newCDuration();
                var aValue = AOM.newCAttribute("value");
                aValue.children = [cValue];
                cons.attributes = cons.attributes || [];
                cons.attributes.push(aValue);

                stage.archetypeEditor.getRmTypeHandler("C_DURATION").updateConstraint(
                    stage, context.value, cValue);
            };

        };
        AmUtils.extend(DvDurationHandler, CComplexObjectHandler);

        var DvIdentifierHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: "DV_IDENTIFIER"
                };
                var issuerCons = AOM.AmQuery.get(cons, "issuer");
                var typeCons = AOM.AmQuery.get(cons, "type");
                var assignerCons = AOM.AmQuery.get(cons, "assigner");
                if (issuerCons) {
                    context.issuerPattern = issuerCons.pattern;
                }
                if (typeCons) {
                    context.typePattern = typeCons.pattern;
                }
                if (assignerCons) {
                    context.assignerPattern = assignerCons.pattern;
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_IDENTIFIER", context, function (generatedDom) {
                        generatedDom = $(generatedDom);
                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                context.issuerPattern = targetElement.find('#' + context.panel_id + '_issuer').val();
                context.typePattern = targetElement.find('#' + context.panel_id + '_type').val();
                context.assignerPattern = targetElement.find('#' + context.panel_id + '_assigner').val();
            };

            handler.updateConstraint = function (stage, context, cons) {
                function addAttribute(pattern, attributeName) {
                    if (pattern && pattern.length > 0) {
                        var attr = AOM.newCAttribute(attributeName);
                        var cstr = AOM.newCString(undefined, pattern);
                        attr.children = [cstr];
                        cons.attributes = cons.attributes || [];
                        cons.attributes.push(attr);
                    }
                }

                stage.archetypeModel.removeAttribute(["issuer", "type", "assigner"]);

                addAttribute(context.issuerPattern, "issuer");
                addAttribute(context.typePattern, "type");
                addAttribute(context.assignerPattern, "assigner");
            };

        };
        AmUtils.extend(DvIdentifierHandler, CComplexObjectHandler);


        var DvDateTimeHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                var valueCons = AOM.AmQuery.get(cons, "value");
                var parentValueCons = AOM.AmQuery.get(parentCons, "value");

                var type = cons ? cons.rm_type_name : 'DV_DATE_TIME';
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: type,
                    value: stage.archetypeEditor.getRmTypeHandler('C_DATE_TIME').createContext(stage, valueCons, parentValueCons)
                };

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_DATE_TIME", context, function (generatedDom) {
                        generatedDom = $(generatedDom);

                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);
                    });
            };

            handler.hide = function (stage, context, targetElement) {
                var dateTimeHandler = stage.archetypeEditor.getRmTypeHandler('C_DATE_TIME');
                if (dateTimeHandler.hide) {
                    dateTimeHandler.hide(stage, context.value, targetElement.find('#' + context.value.panel_id));
                }
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.getRmTypeHandler("C_DATE_TIME")
                    .updateContext(stage, context.value, targetElement.find('#' + context.value.panel_id));

            };

            handler.validate = function (stage, context, errors) {
                stage.archetypeEditor.getRmTypeHandler("C_DATE_TIME").validate(
                    stage, context.value, errors.sub("value"));
            };

            handler.updateConstraint = function (stage, context, cons) {
                var cValue = AOM.AmQuery.get(cons, "value");
                if (!cValue) {
                    cValue = AOM.newCDateTime();
                    var aValue = AOM.newCAttribute("value");
                    aValue.children = [cValue];
                    cons.attributes = cons.attributes || [];
                    cons.attributes.push(aValue);
                }

                stage.archetypeEditor.getRmTypeHandler("C_DATE_TIME").updateConstraint(
                    stage, context.value, cValue);
            };
        };
        AmUtils.extend(DvDateTimeHandler, CComplexObjectHandler);

        var DvProportionHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            var Kind = {
                ratio: {value: 0, denominator: true},
                unitary: {value: 1, denominator: false},
                percent: {value: 2, denominator: false},
                fraction: {value: 3, denominator: true},
                integer_fraction: {value: 4, denominator: true}
            };

            function hasDenominator(context) {
                for (var k in Kind) {
                    if (context.kinds[k]) {
                        var kind = Kind[k];
                        if (kind.denominator) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function getKindsType(context) {
                var any = false;
                var all = true;
                for (var k in Kind) {
                    if (context.kinds[k]) {
                        any = true;
                    } else {
                        all = false;
                    }
                }
                if (!any) return 'none';
                if (!all) return 'some';
                return 'all';
            }

            function getKindsList(context) {
                var result = [];
                for (var k in Kind) {
                    if (context.kinds[k]) {
                        result.push(Kind[k].value);
                    }
                }
                return result;
            }


            handler.createContext = function (stage, cons, parentCons) {
                var numeratorCons = AOM.AmQuery.get(cons, "numerator");
                var parentNumeratorCons = AOM.AmQuery.get(parentCons, "numerator");
                var denominatorCons = AOM.AmQuery.get(cons, "denominator");
                var parentDenominatorCons = AOM.AmQuery.get(parentCons, "denominator");

                var type = cons ? cons.rm_type_name : 'DV_PROPORTION';
                var context = {
                    panel_id: GuiUtils.generateId(),
                    type: type,
                    numerator: stage.archetypeEditor.getRmTypeHandler('C_REAL').createContext(stage, numeratorCons, parentNumeratorCons),
                    denominator: stage.archetypeEditor.getRmTypeHandler('C_REAL').createContext(stage, denominatorCons, parentDenominatorCons)
                };

                var cIsIntegral = AOM.AmQuery.get(cons, "is_integral");
                context.is_integral = cIsIntegral ? (cIsIntegral.true_valid ? 'true' : 'false') : '';
                var cType = AOM.AmQuery.get(cons, 'type');

                if (cType && cType.list && cType.list.length > 0) {
                    context.kinds = {};
                    for (var k in Kind) {
                        context.kinds[k] = cType.list.indexOf(Kind[k].value) >= 0;
                    }
                } else {
                    context.kinds = {};
                    for (var k in Kind) {
                        context.kinds[k] = true;
                    }
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_PROPORTION", context, function (generatedDom) {
                        function applyContextKindsToCheckboxes(checkboxes) {
                            var prefix = context.panel_id + "_kind_";
                            for (var i = 0; i < checkboxes.length; i++) {
                                var checkbox = $(checkboxes[i]);
                                var kind = checkbox.attr('id').substring(prefix.length);
                                checkbox.prop('checked', context.kinds[kind]);
                            }
                        }

                        function updateVisibilityFromContext() {
                            var tabsElement = generatedDom.find('#' + context.panel_id + "_tabs");
                            var numeratorElement = tabsElement.find('a[href="#' + context.numerator.panel_id + '"]');
                            var denominatorElement = tabsElement.find('a[href="#' + context.denominator.panel_id + '"]');
                            if (hasDenominator(context)) {
                                GuiUtils.setVisible(denominatorElement, true);
                            } else {
                                numeratorElement.tab('show');
                                GuiUtils.setVisible(denominatorElement, false);
                            }
                        }

                        function applyKindsCheckboxesToContext(checkboxes) {
                            var prefix = context.panel_id + "_kind_";
                            for (var i = 0; i < checkboxes.length; i++) {
                                var checkbox = $(checkboxes[i]);
                                var kind = checkbox.attr('id').substring(prefix.length);
                                context.kinds[kind] = checkbox.prop('checked');
                            }
                        }


                        generatedDom = $(generatedDom);

                        stage.archetypeEditor.applySubModules(stage, generatedDom, context);
                        targetElement.append(generatedDom);

                        generatedDom.find('#' + context.panel_id + '_integral').val(context.is_integral);

                        var checkboxes = generatedDom.find('#' + context.panel_id + "_kinds_panel").find('input');
                        applyContextKindsToCheckboxes(checkboxes);
                        updateVisibilityFromContext();

                        checkboxes.change(function () {
                            applyKindsCheckboxesToContext(checkboxes);
                            updateVisibilityFromContext();
                        });

                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                context.is_integral = targetElement.find('#' + context.panel_id + "_integral").val();

                stage.archetypeEditor.applySubModulesUpdateContext(stage, targetElement, context);
            };

            handler.validate = function (stage, context, errors) {
                var kindsType = getKindsType();
                if (kindsType === 'none') {
                    errors.add('At least one proportion kind is required', 'kinds');
                }
                stage.archetypeEditor.getRmTypeHandler("C_REAL").validate(
                    stage, context.numerator, errors.sub("numerator"));

                if (hasDenominator(context)) {
                    stage.archetypeEditor.getRmTypeHandler("C_REAL").validate(
                        stage, context.denominator, errors.sub("denominator"));
                }

            };

            handler.updateConstraint = function (stage, context, cons) {

                stage.archetypeModel.removeAttribute(cons, ['type', 'is_integral', 'numerator', 'denominator']);

                var kindsType = getKindsType();
                if (kindsType === 'some') {
                    addAttributeConstraint(cons, 'type', AOM.newCInteger(getKindsList()));
                }

                var cNumerator = addAttributeConstraint(cons, 'numerator', AOM.newCReal());

                stage.archetypeEditor.getRmTypeHandler("C_REAL").updateConstraint(
                    stage, context.numerator, cNumerator);
                if (hasDenominator(context)) {
                    var cDenominator = addAttributeConstraint(cons, 'denominator', AOM.newCReal());

                    stage.archetypeEditor.getRmTypeHandler("C_REAL").updateConstraint(
                        stage, context.denominator, cDenominator);
                }

                if (context.is_integral && context.is_integral.length > 0) {
                    var cIntegral = AOM.newCBoolean();
                    var isIntegral = context.is_integral === 'true';
                    cIntegral.true_valid = isIntegral;
                    cIntegral.false_valid = !isIntegral;
                    addAttributeConstraint(cons, 'is_integral', cIntegral);
                }
            };
        };
        AmUtils.extend(DvProportionHandler, CComplexObjectHandler);

        self.handlers["DV_QUANTITY"] = new DvQuantityHandler();
        self.handlers["DV_CODED_TEXT"] = new DvTextHandler();
        self.handlers["DV_TEXT"] = self.handlers["DV_CODED_TEXT"];
        self.handlers["DV_BOOLEAN"] = new DvBooleanHandler();
        self.handlers["DV_COUNT"] = new DvCountHandler();
        self.handlers["DV_ORDINAL"] = new DvOrdinalHandler();
        self.handlers["DV_DURATION"] = new DvDurationHandler();
        self.handlers["DV_IDENTIFIER"] = new DvIdentifierHandler();
        self.handlers["DV_DATE_TIME"] = new DvDateTimeHandler();
        self.handlers["DV_DATE"] = self.handlers["DV_DATE_TIME"];
        self.handlers["DV_TIME"] = self.handlers["DV_DATE_TIME"];
        self.handlers["DV_PROPORTION"] = new DvProportionHandler();
    };


    ArchetypeEditor.addRmModule(new OpenEhrModule());
}(ArchetypeEditor) ) ;