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
         * @param {AOM.ArchetypeModel} archetypeModel
         * @param {string?} language to use
         * @return {object} mindmap
         */
        self.convertToMindmap = function (archetypeModel, language) {
            var itemStructSet = AmUtils.listToSet(['ITEM_TREE', 'ITEM_SINGLE', 'ITEM_LIST', 'ITEM_TABLE']);

            function createProperty(obj) {
                return {
                    type: 'property',
                    property: obj.property,
                    label: obj.label || obj.property,
                    value: obj.value
                };
            }

            function createConstraint(cons) {
                var rmType = cons.rm_type_name;
                if (rmType==='ELEMENT') {
                    var dvCons = AOM.AmQuery.get(cons, 'value');
                    rmType=dvCons?dvCons.rm_type_name:'DATA_VALUE';
                }
                return {
                    type: 'constraint',
                    rmType: rmType,
                    rmPath: archetypeModel.getRmPath(cons).toString(),
                    label: archetypeModel.getTermDefinitionText(cons.node_id, language) || cons.rm_type_name
                }
            }


            function createConstraints(rootConsAttr) {
                var result = [];
                if (!rootConsAttr) return result;

                for (var i in rootConsAttr.children) {
                    var cons = rootConsAttr.children[i];
                    if (itemStructSet[cons.rm_type_name]) {
                        var structItemsAttr = archetypeModel.getAttribute(cons, 'items');
                        var structs = createConstraints(structItemsAttr);
                        for (var j in structs) {
                            result.push(structs[j]);
                        }

                    } else {
                        var modelConstraint = createConstraint(cons);
                        if (cons.rm_type_name == 'CLUSTER') {
                            var clusterItemsAttr = archetypeModel.getAttribute(cons, 'items');
                            modelConstraint.children = createConstraints(clusterItemsAttr);
                        }
                        result.push(modelConstraint);
                    }
                }
                return result;
            }

            function createDescriptionSection() {

                var section = {
                    type: 'section',
                    section: 'description',
                    label: 'Description',
                    children: []
                };
                var rdi = Stream(archetypeModel.data.description.details).filter(function (d) {
                    return d.language.code_string == language
                }).findFirst().get();

                section.children.push(createProperty({property: 'purpose', value: rdi.purpose}));
                section.children.push(createProperty({property: 'use', value: rdi.use}));
                section.children.push(createProperty({property: 'misuse', value: rdi.misuse}));
                section.children.push(createProperty({property: 'keywords', value: AmUtils.clone(rdi.keywords || [])}));
                return section;
            }

            function createAttributionSection() {

                function createTranslatorsValue(translations) {
                    var result = {};
                    Stream(translations).forEach(function (t) {
                        result[t.language.code_string] = AmUtils.clone(t.author);
                    });
                    return result;
                }

                var section = {
                    type: 'section',
                    section: 'attribution',
                    label: 'Attribution',
                    children: []
                };

                var description = archetypeModel.data.description;
                section.children.push(createProperty({
                    property: 'original_author',
                    value: AmUtils.clone(description.original_author),
                    label: 'Original Author'
                }));
                section.children.push(createProperty({
                    property: 'other_contributors',
                    value: AmUtils.clone(description.other_contributors),
                    label: 'Other Contributors'
                }));

                section.children.push(createProperty({
                    property: 'translators',
                    value: createTranslatorsValue(archetypeModel.data.translations),
                    label: 'Translators'
                }));


                return section;

            }

            function createEventsSection() {
                var events = {
                    type: 'section',
                    section: 'events',
                    label: 'Events'
                };

                var dataCons = AOM.AmQuery.get(archetypeModel.data.definition, 'data');
                var eventAttr = archetypeModel.getAttribute(dataCons, 'events');
                events.children = createConstraints(eventAttr);
                return events;

            }

            function createProtocolSection() {
                var protocol = {
                    type: 'section',
                    section: 'protocol',
                    label: 'Protocol'
                };

                var protocolAttr = archetypeModel.getAttribute(archetypeModel.data.definition, 'protocol');
                protocol.children = createConstraints(protocolAttr);
                return protocol;

            }

            function createDataSection() {
                var data = {
                    type: 'section',
                    section: 'data',
                    label: 'Data'
                };

                var dataConses = AOM.AmQuery.findAll(archetypeModel.data.definition, "/data/events/data");
                var dataCons = Stream(dataConses).filter(function (d) {
                    return d["@type"] !== "ARCHETYPE_INTERNAL_REF";
                }).findFirst().get();
                data.children = createConstraints(dataCons[".parent"]);
                return data;

            }

            function createStateSection() {
                var state = {
                    type: 'section',
                    section: 'state',
                    label: 'State'
                };

                var stateConses = AOM.AmQuery.findAll(archetypeModel.data.definition, "/data/events/state");
                var stateCons = Stream(stateConses).filter(function (d) {
                    return d["@type"] !== "ARCHETYPE_INTERNAL_REF";
                }).findFirst().get();
                state.children = createConstraints(stateCons[".parent"]);
                return state;

            }

            language = language || archetypeModel.defaultLanguage;
            var mindmap = {};
            mindmap.archetypeId = archetypeModel.getArchetypeId();
            mindmap.label = archetypeModel.getArchetypeLabel(language);
            mindmap.children = [];
            mindmap.children.push(createDescriptionSection());
            mindmap.children.push(createAttributionSection());
            mindmap.children.push(createEventsSection());
            mindmap.children.push(createProtocolSection());
            mindmap.children.push(createDataSection());
            mindmap.children.push(createStateSection());

            return mindmap;
        };

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

                function createPanel(tupleConstraint, parentTupleConstraint) {
                    var magnitudeHandler = stage.archetypeEditor.getRmTypeHandler("C_REAL");
                    var units = tupleConstraint.units.list[0];

                    var precisionEnabled = !!(tupleConstraint.precision && tupleConstraint.precision.list &&
                    tupleConstraint.precision.list.length > 0);

                    var panel = {
                        panel_id: GuiUtils.generateId(),
                        magnitude: magnitudeHandler.createContext(stage, tupleConstraint.magnitude,
                            parentTupleConstraint && parentTupleConstraint.magnitude),
                        units: units,
                        precision: precisionEnabled ? tupleConstraint.precision.list[0] : ""
                    };
                    return panel;

                }

                var tupleConstraints = stage.archetypeModel.getAttributesTuple(cons, ["units", "magnitude", "precision"]);
                var parentTupleConstraints = parentCons
                    ? stage.archetypeModel.parentArchetypeModel.getAttributesTuple(parentCons, ["units", "magnitude", "precision"])
                    : undefined;

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_QUANTITY';
                context.units_id = GuiUtils.generateId();
                context.unit_panels = [];


                if (context.isTemplate) {
                    for (var i in parentTupleConstraints) {
                        var parentTupleConstraint = parentTupleConstraints[i];

                        var units = (parentTupleConstraint.units && parentTupleConstraint.units.list) ? parentTupleConstraint.units.list[0] : undefined;
                        if (units === undefined) continue;

                        var tupleConstraint = Stream(tupleConstraints).filter(function (d) {
                            return d.units.list && d.units.list.length === 1 && d.units.list[0] === units;
                        }).findFirst().orElse();

                        var panel = createPanel(tupleConstraint || parentTupleConstraint, parentTupleConstraint);
                        panel.active = !!tupleConstraint;

                        context.unit_panels.push(panel);
                    }
                } else {
                    for (var i in tupleConstraints) {
                        var tupleConstraint = tupleConstraints[i];
                        var units = (tupleConstraint.units && tupleConstraint.units.list) ? tupleConstraint.units.list[0] : undefined;
                        if (units === undefined) continue;

                        var parentTupleConstraint = undefined;
                        if (parentTupleConstraints) {
                            parentTupleConstraint = Stream(parentTupleConstraints).filter({units: units}).findFirst().orElse();
                        }
                        var panel = createPanel(tupleConstraint, parentTupleConstraint);
                        panel.active = true;

                        context.unit_panels.push(panel);
                    }
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

                        function fillActiveUnitsSelect(unitsSelect) {
                            var oldValue = unitsSelect.val(), hasOldValue;
                            var first;
                            unitsSelect.empty();

                            for (var i in context.unit_panels) {
                                var panel = context.unit_panels[i];
                                if (panel.active) {
                                    var option = $("<option>").attr("value", panel.panel_id).text(panel.units);
                                    unitsSelect.append(option);
                                    if (panel.panel_id === oldValue) hasOldValue = true;
                                    if (!first) first = panel.panel_id;
                                }
                            }
                            unitsSelect.val(hasOldValue ? oldValue : first);
                            showUnitPanel(unitsSelect.val());
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

                        if (context.isTemplate) {
                            var activeUnitsOptions = {
                                title: "Active units",
                                items: [],
                                targetElement: generatedDom.find("#" + context.panel_id + "_active_units_container")
                            };
                            for (var i in context.unit_panels) {
                                var panel = context.unit_panels[i];
                                activeUnitsOptions.items.push({
                                    label: panel.units,
                                    checked: panel.active,
                                    code: panel.units
                                });
                            }
                            var activeUnitsCheckboxList = new GuiUtils.DropDownCheckboxList(activeUnitsOptions);

                            activeUnitsCheckboxList.onChange(function () {
                                var items = activeUnitsCheckboxList.getItemSelectionList();
                                for (var i in items) {
                                    context.unit_panels[i].active = items[i];
                                }
                                fillActiveUnitsSelect(unitsSelect);
                            });
                        }


                        fillActiveUnitsSelect(unitsSelect);
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
                var activeCount = 0;
                for (var panelIndex in context.unit_panels) {
                    var panel = context.unit_panels[panelIndex];
                    var unitErrors = errors.sub("[" + panel.units + "]");

                    var magnitudeHandler = ArchetypeEditor.getRmTypeHandler("C_REAL");
                    magnitudeHandler.validate(stage, panel.magnitude, unitErrors.sub("magnitude"));

                    if (panel.precision && panel.precision.length > 0) {
                        var val = parseInt(panel.precision);
                        unitErrors.validate(AmUtils.isInt(val), "Not a valid integer", "precision");
                    }
                    if (panel.active) activeCount++;
                }
                if (context.isTemplate && context.parent && context.parent.unit_panels.length > 0) {
                    errors.validate(activeCount, "At least one unit must be selected");
                }
            };
            handler.updateConstraint = function (stage, context, cons) {
                stage.archetypeModel.removeAttribute(cons, ["units", "magnitude", "precision"]);

                cons.attribute_tuples = cons.attribute_tuples || [];
                var panels = Stream(context.unit_panels).filter({active: true}).toArray();
                if (panels.length > 0) {
                    var attributeTuple = AOM.newCAttributeTuple(["units", "magnitude", "precision"]);

                    for (var panelIndex in panels) {
                        var panel = panels[panelIndex];

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


            function isParentConstrained(context) {
                return !!(context.parent && context.parent.type === 'DV_CODED_TEXT');
            }

            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var definingCodeCons = AOM.AmQuery.get(cons, "defining_code");
                var parentDefiningCodeCons = AOM.AmQuery.get(parentCons, "defining_code");

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = cons && cons.rm_type_name ? cons.rm_type_name : "DV_TEXT";
                context.defining_code = stage.archetypeEditor.getRmTypeHandler("C_TERMINOLOGY_CODE")
                    .createContext(stage, definingCodeCons, parentDefiningCodeCons);

                context.isCoded = context.type === "DV_CODED_TEXT";

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_CODED_TEXT", context, function (generatedDom) {

                        generatedDom = $(generatedDom);
                        var codedTextCheckbox = generatedDom.find("#" + context.panel_id + "_coded_text");
                        var definingCodeDiv = generatedDom.find("#" + context.defining_code.panel_id);

                        codedTextCheckbox.prop('disabled', isParentConstrained(context));
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
                cons.rm_type_name = context.isCoded ? "DV_CODED_TEXT" : "DV_TEXT";

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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_BOOLEAN';
                context.value = stage.archetypeEditor.getRmTypeHandler("C_BOOLEAN").createContext(
                    stage, valueCons, parentValueCons);


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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_COUNT';
                context.magnitude = stage.archetypeEditor.getRmTypeHandler("C_INTEGER").createContext(stage, magnitudeCons, parentMagnitudeCons);

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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_ORDINAL';
                context.values = [];
                context.assumed_value = cons.assumed_value;

                var tuples = stage.archetypeModel.getAttributesTuple(cons, ["value", "symbol"]);
                var parentTuples = parentCons ? stage.archetypeModel.parentArchetypeModel.getAttributesTuple(parentCons, ["value", "symbol"]) : undefined;
                if (context.isParentConstrained) {
                    for (var i in parentTuples) {
                        var parentTuple = parentTuples[i];
                        var specializedTuple = Stream(tuples).filter(function (d) {
                            return d["value"].list[0] === parentTuple["value"].list[0];
                        }).findFirst().orElse();
                        var tuple = specializedTuple || parentTuple;
                        //var parentTuple = parentTuples && parentTuples[i];
                        var term = stage.archetypeModel.getTermDefinition(tuple["symbol"].code_list[0]);
                        var value = {
                            active: !!specializedTuple,
                            value: tuple ["value"].list[0],
                            term_id: tuple["symbol"].code_list[0],
                            term: term
                        };
                        context.values.push(value);
                    }
                } else {
                    for (var i in tuples) {
                        var tuple = tuples[i];
                        //var parentTuple = parentTuples && parentTuples[i];
                        var term = stage.archetypeModel.getTermDefinition(tuple["symbol"].code_list[0]);
                        var value = {
                            active: true,
                            value: tuple["value"].list[0],
                            term_id: tuple["symbol"].code_list[0],
                            term: term
                        };
                        context.values.push(value);
                    }
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
                        html = $(html);
                        targetElement.append(html);


                        if (context.isParentConstrained) {
                            var activeValuesOptions = {
                                title: "Active Values",
                                items: [],
                                targetElement: html.find("#" + context.panel_id + "_ordinal_checkbox_container")
                            };
                            for (var i in context.values) {
                                var contextValue = context.values[i];
                                activeValuesOptions.items.push({
                                    label: contextValue.value + ": " + stage.archetypeModel.getTermDefinitionText(contextValue.term_id, stage.language),
                                    checked: contextValue.active,
                                    code: contextValue.term_id
                                });
                            }
                            var activeValuesCheckboxList = new GuiUtils.DropDownCheckboxList(activeValuesOptions);
                            activeValuesCheckboxList.onChange(function () {
                                var checks = activeValuesCheckboxList.getItemSelectionList();
                                for (var i in context.values) {
                                    context.values[i].active = checks[i];
                                }
                            });
                        }
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
                        if (!contextValue.active) continue;

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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_DURATION';
                context.value = stage.archetypeEditor.getRmTypeHandler("C_DURATION").createContext(stage, valueCons, parentValueCons);

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
                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'DV_IDENTIFIER';

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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = type;
                context.value = stage.archetypeEditor.getRmTypeHandler('C_DATE_TIME').createContext(stage, valueCons, parentValueCons);

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
                var primitiveToDvMap = {
                    "C_DATE": "DV_DATE",
                    "C_DATE_TIME": "DV_DATE_TIME",
                    "C_TIME": "DV_TIME"
                };

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
                cons.rm_type_name = primitiveToDvMap[cValue.rm_type_name];
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

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = type;
                context.numerator = stage.archetypeEditor.getRmTypeHandler('C_REAL').createContext(stage, numeratorCons, parentNumeratorCons);
                context.denominator = stage.archetypeEditor.getRmTypeHandler('C_REAL').createContext(stage, denominatorCons, parentDenominatorCons);

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
                var kindsType = getKindsType(context);
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

                var kindsType = getKindsType(context);
                if (kindsType === 'some') {
                    addAttributeConstraint(cons, 'type', AOM.newCInteger(getKindsList(context)));
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

        var DvIntervalHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);

            function parseGenericRmTypeName(rm_type) {
                var ltPos = rm_type.indexOf('<');
                var gtPos = rm_type.lastIndexOf('>');
                var result = {};
                result.main = rm_type.substring(0, ltPos);
                result.param = rm_type.substring(ltPos + 1, gtPos);
                return result;
            }


            handler.createContext = function (stage, cons, parentCons) {

                var context = handler.createCommonContext(stage, cons, parentCons);
                var genericRmType = parseGenericRmTypeName(cons.rm_type_name);

                var lowerCons = AOM.AmQuery.get(cons, "lower");
                var parentLowerCons = AOM.AmQuery.get(parentCons, "lower");
                var upperCons = AOM.AmQuery.get(cons, "upper");
                var parentUpperCons = AOM.AmQuery.get(parentCons, "upper");

                if (!lowerCons) lowerCons = AOM.newCComplexObject(genericRmType.param);
                if (!upperCons) upperCons = AOM.newCComplexObject(genericRmType.param);

                context.lower = stage.archetypeEditor.getRmTypeHandler(lowerCons.rm_type_name)
                    .createContext(stage, lowerCons, parentLowerCons);
                context.upper = stage.archetypeEditor.getRmTypeHandler(upperCons.rm_type_name)
                    .createContext(stage, upperCons, parentUpperCons);

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|DV_INTERVAL", context, function (generatedDom) {
                        generatedDom = $(generatedDom);
                        targetElement.append(generatedDom);
                        stage.archetypeEditor.applySubModules(stage, targetElement, context);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.applySubModulesUpdateContext(stage, targetElement, context);
            };

            handler.validate = function (stage, context, errors) {
                stage.archetypeEditor.getRmTypeHandler(context.lower.type).validate(stage, context.lower, errors.sub('lower'));
                stage.archetypeEditor.getRmTypeHandler(context.upper.type).validate(stage, context.upper, errors.sub('upper'));
            };

            handler.updateConstraint = function (stage, context, cons) {
                var boundHandler = stage.archetypeEditor.getRmTypeHandler(context.lower.type);

                stage.archetypeModel.removeAttribute(cons, ['lower', 'upper']);
                cons.attributes = cons.attributes || [];
                var lowerAttr = AOM.newCAttribute('lower');
                lowerAttr.children = [AOM.newCComplexObject(context.lower.type)];
                var upperAttr = AOM.newCAttribute('upper');
                upperAttr.children = [AOM.newCComplexObject(context.upper.type)];

                cons.attributes.push(lowerAttr);
                cons.attributes.push(upperAttr);

                boundHandler.updateConstraint(stage, context.lower, lowerAttr.children[0]);
                boundHandler.updateConstraint(stage, context.upper, upperAttr.children[0]);
            };
        };
        AmUtils.extend(DvIntervalHandler, CComplexObjectHandler);

        var ElementHandler = function () {
            var handler = this;
            CComplexObjectHandler.call(handler);


            var dataValues = {
                data: {
                    "DV_TEXT": "Text",
                    "DV_BOOLEAN": "Boolean",
                    "DV_ORDINAL": "Ordinal",
                    "DV_COUNT": "Count",
                    "DV_QUANTITY": "Quantity",
                    "DV_DATE_TIME": "DateTime",
                    "DV_DURATION": "Duration",
                    "DV_MULTIMEDIA": "Multimedia",
                    "DV_URI": "Uri",
                    "DV_PROPORTION": "Proportion",
                    "DV_IDENTIFIER": "Identifier",
                    "DV_PARSABLE": "Parsable",

                    "DV_INTERVAL<DV_COUNT>": "Interval: Count",
                    "DV_INTERVAL<DV_QUANTITY>": "Interval: Quantity",
                    "DV_INTERVAL<DV_DATE_TIME>": "Interval: DateTime"
                },

                aliases: {
                    "DV_CODED_TEXT": "DV_TEXT",
                    "DV_DATE": "DV_DATE_TIME",
                    "DV_TIME": "DV_DATE_TIME",
                    "DV_INTERVAL<DV_DATE>": "DV_INTERVAL<DV_DATE_TIME>",
                    "DV_INTERVAL<DV_TIME>": "DV_INTERVAL<DV_DATE_TIME>"
                },

                getText: function (rmType) {
                    var text = this.data[rmType];
                    if (text) return text;
                    var dataType = this.aliases[rmType];
                    if (!dataType) return rmType;
                    text = this.data[dataType];
                    if (text) return text;
                    return rmType;
                }
            };


            handler.createContext = function (stage, cons, parentCons) {
                var valueConses = AOM.AmQuery.findAll(cons, "value");

                var context = handler.createCommonContext(stage, cons, parentCons);
                context.type = 'ELEMENT';
                context.values = [];
                context.isTemplateChoice = context.isParentConstrained && context.parent.values.length !== 1;
                if (context.isTemplateChoice) {
                    var parentValueConses = AOM.AmQuery.findAll(parentCons, "value");
                    if (parentValueConses.length > 0) {
                        for (var i in parentValueConses) {
                            var parentValueCons = parentValueConses[i];
                            var specializedValueCons = AOM.AmQuery.get(cons, "value[" + parentValueCons.node_id + "]", {matchSpecialized: true});
                            var valueCons = specializedValueCons || AOM.impoverishedClone(parentValueCons);

                            var valueHandler = stage.archetypeEditor.getRmTypeHandler(valueCons.rm_type_name);
                            context.values.push({
                                active: !!specializedValueCons,
                                rmType: valueCons.rm_type_name,
                                cons: specializedValueCons,
                                parentCons: parentValueCons,
                                context: valueHandler ? valueHandler.createContext(stage, valueCons, specializedValueCons ? parentValueCons : undefined) : undefined
                            });
                        }
                    } else {
                        var types = AmUtils.keys(dataValues.data).concat(AmUtils.keys(dataValues.aliases)).sort();
                        var noConstraints = AOM.AmQuery.findAll(cons, "value").length === 0;
                        for (var i in types) {
                            var rmType = types[i];

                            var specializedValueCons = Stream(valueConses).filter(function (d) {
                                return d.rm_type_name === rmType;
                            }).findFirst().orElse();

                            context.values.push({
                                active: noConstraints || !!specializedValueCons,
                                rmType: rmType,
                                cons: specializedValueCons
                            });
                        }
                    }
                }
                else {
                    for (var i in valueConses) {
                        var valueCons = valueConses[i];
                        var valueHandler = stage.archetypeEditor.getRmTypeHandler(valueCons.rm_type_name);
                        var parentValueCons = AOM.AmQuery.get(parentCons, "value[" + valueCons.node_id + "]", {matchParent: true});
                        context.values.push({
                            active: true,
                            rmType: valueCons.rm_type_name,
                            cons: valueCons,
                            parentCons: parentValueCons,
                            context: valueHandler ? valueHandler.createContext(stage, valueCons, parentValueCons) : undefined
                        });
                    }
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate(
                    "properties/constraint-openehr|ELEMENT", context, function (generatedDom) {
                        generatedDom = $(generatedDom);

                        function createValueDiv(val) {
                            var valueHandler = stage.archetypeEditor.getRmTypeHandler(val.rmType);
                            var div = $("<div class='horizontal-stretch'>");
                            if (valueHandler) {
                                valueHandler.show(stage, val.context, div);
                            }
                            return div;
                        }

                        function showSelectedDiv() {
                            var selectedIndex = Number(typeSelect.val());
                            for (var i in context.values) {
//                                var val = context.values[i];
                                GuiUtils.setVisible(valueDivs[i], Number(i) === selectedIndex);
                            }
                        }

                        function populateTypeSelect() {
                            var oldVal = typeSelect.val();
                            var hasOldVal = false, first = undefined;
                            typeSelect.empty();
                            for (var i in context.values) {
                                var val = context.values[i];
                                typeSelect.append($("<option>").attr("value", i).text(dataValues.getText(val.rmType)));
                                if (oldVal === i) hasOldVal = true;
                                if (first === undefined) first = val.rmType;
                            }
                            typeSelect.val(hasOldVal ? oldVal : first);
                        }

                        function addDataValue(rmType) {
                            var valueHandler = stage.archetypeEditor.getRmTypeHandler(rmType);

                            var val = {};
                            val.rmType = rmType;
                            val.cons = {rm_type_name: rmType};
                            val.context = valueHandler.createContext(stage, val.cons, undefined);
                            context.values.push(val);
                            var valueDiv = createValueDiv(val);
                            valueDivs.push(valueDiv);
                            valueContainer.append(valueDiv);

                            populateTypeSelect();
                            typeSelect.val(context.values.length - 1);
                            showSelectedDiv();
                        }

                        function openAddDataValueDialog() {
                            var dialogContext = {
                                panel_id: GuiUtils.generateId()
                            };
                            GuiUtils.applyTemplate("properties/constraint-openehr|ELEMENT/addDataValue", dialogContext, function (dialogContent) {

                                function populateDataValuesSelect() {
                                    dataValuesSelect.empty();
                                    var first;
                                    for (var rmType in dataValues.data) {
                                        if (!first) first = rmType;
                                        dataValuesSelect.append($("<option>").attr("value", rmType).text(dataValues.getText(rmType)));
                                    }
                                    dataValuesSelect.val(first);
                                }

                                dialogContent = $(dialogContent);
                                var dataValuesSelect = dialogContent.find('#' + dialogContext.panel_id + '_dataValues');
                                populateDataValuesSelect();

                                GuiUtils.openSimpleDialog(
                                    {
                                        title: "Add Data Value",
                                        buttons: {"add": "Add"},
                                        content: dialogContent,
                                        callback: function () {
                                            var rmType = dataValuesSelect.val();
                                            addDataValue(rmType);
                                        }
                                    });

                            });
                        }

                        function removeSelectedDataType() {
                            var selected = typeSelect.val();
                            if (selected === null) return;
                            selected = Number(selected);
                            context.values.splice(selected, 1);
                            var valueDiv = valueDivs[selected];
                            valueDiv.remove();
                            valueDivs.splice(selected, 1);

                            populateTypeSelect();
                            showSelectedDiv();
                        }

                        if (context.isTemplateChoice) {
                            var activeDvsOptions = {
                                title: "Active DVs",
                                items: [],
                                targetElement: generatedDom.find("#" + context.panel_id + "_active_dv_container")
                            };
                            for (var i in context.values) {
                                var contextValue = context.values[i];
                                activeDvsOptions.items.push({
                                    label: contextValue.rmType,
                                    checked: contextValue.active,
                                    code: contextValue.cons ? contextValue.cons.node_id : undefined
                                });
                            }
                            var activeDvsCheckboxList = new GuiUtils.DropDownCheckboxList(activeDvsOptions);
                            activeDvsCheckboxList.onChange(function () {
                                var checks = activeDvsCheckboxList.getItemSelectionList();
                                for (var i in context.values) {
                                    context.values[i].active = checks[i];
                                }
                            });
                            targetElement.append(generatedDom);
                            return;
                        }


                        var typeSelect = generatedDom.find('#' + context.panel_id + '_type');
                        var addTypeButton = generatedDom.find('#' + context.panel_id + '_addType');
                        var removeTypeButton = generatedDom.find('#' + context.panel_id + '_removeType');

                        var valueContainer = generatedDom.find('#' + context.panel_id + '_valueContainer');
                        var valueDivs = [];


                        for (var i in context.values) {
                            var val = context.values[i];
                            var valueDiv = createValueDiv(val);
                            valueDivs.push(valueDiv);
                            valueContainer.append(valueDiv);
                        }
                        populateTypeSelect();
                        showSelectedDiv();
                        typeSelect.on('change', showSelectedDiv);

                        addTypeButton.on('click', openAddDataValueDialog);
                        removeTypeButton.on('click', removeSelectedDataType);

                        targetElement.append(generatedDom);
                    });
            };

            handler.updateContext = function (stage, context, targetElement) {
                if (context.isTemplateChoice) return;

                var valueContainer = targetElement.find('#' + context.panel_id + '_valueContainer');

                for (var i in context.values) {
                    var val = context.values[i];
                    var typeHandler = stage.archetypeEditor.getRmTypeHandler(val.rmType);
                    if (typeHandler) {
                        typeHandler.updateContext(stage, val.context, valueContainer);
                    }
                }

            };

            handler.validate = function (stage, context, errors) {
                if (context.isTemplateChoice) return;

                for (var i in context.values) {
                    var val = context.values[i];
                    var typeHandler = stage.archetypeEditor.getRmTypeHandler(val.rmType);
                    if (typeHandler) {
                        typeHandler.validate(stage, val.context, errors.sub(val.rmType + "[" + i + "]"));
                    }
                }
            };

            handler.updateConstraint = function (stage, context, cons) {
                if (context.isTemplateChoice) {
                    var allMatch = Stream(context.values).allMatch({active: true});

                    var valueAttr = stage.archetypeModel.getAttribute(cons, "value")
                        || stage.archetypeModel.addAttribute(cons, "value");

                    for (var i in context.values) {
                        var value = context.values[i];
                        if (!allMatch && value.active) {
                            if (!value.cons) {
                                if (value.parentCons) {
                                    value.cons = AOM.impoverishedClone(value.parentCons);
                                    value.cons.node_id = stage.archetypeModel.generateSpecializedTermId(value.parentCons.node_id);
                                    stage.archetypeModel.addConstraint(valueAttr, value.cons);
                                } else {
                                    value.cons = AOM.newConstraint(value.rmType, stage.archetypeModel.generateSpecializedTermId("id"));
                                    stage.archetypeModel.addConstraint(valueAttr, value.cons);
                                }
                            }
                        } else {
                            if (value.cons) {
                                stage.archetypeModel.removeConstraint(value.cons, true);
                                value.cons = undefined;
                            }
                        }
                    }
                    return;
                }
                // remove value constraints that have been removed from value
                var retainedNodeIds = AmUtils.listToSet(Stream(context.values)
                    .filter(function (v) {
                        return v.cons && v.cons.node_id
                    })
                    .map("cons.node_id").toArray());

                var valueAttr = stage.archetypeModel.getAttribute(cons, "value");
                if (valueAttr) {
                    var toRemove = Stream(valueAttr.children).filter(function (c) {
                        return !retainedNodeIds[c.node_id]
                    }).toArray();
                    for (var i in toRemove) {
                        stage.archetypeModel.removeConstraint(toRemove[i], true);
                    }
                }


                // add/update constraints
                for (var i in context.values) {
                    var val = context.values[i];
                    var typeHandler = stage.archetypeEditor.getRmTypeHandler(val.rmType);
                    if (typeHandler) {
                        if (!val.cons.node_id) {
                            // create new constraint if added on context
                            val.cons = AOM.newCComplexObject(val.rmType, stage.archetypeModel.generateSpecializedTermId("id"));
                            var valueAttr = stage.archetypeModel.getAttribute(cons, "value");
                            if (!valueAttr) {
                                valueAttr = stage.archetypeModel.addAttribute(cons, "value");
                            }
                            stage.archetypeModel.addConstraint(valueAttr, val.cons);
                        }
                        typeHandler.updateConstraint(stage, val.context, val.cons);
                    }
                }

            };
        };


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
        self.handlers["DV_INTERVAL"] = new DvIntervalHandler();
        self.handlers["ELEMENT"] = new ElementHandler();
    };


    ArchetypeEditor.addRmModule(new OpenEhrModule());
}(ArchetypeEditor || {}) );