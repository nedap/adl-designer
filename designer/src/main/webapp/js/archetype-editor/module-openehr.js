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

            handler.createContext = function (archetypeModel, cons) {
                var tupleConstraints = archetypeModel.getAttributesTuple(cons, ["units", "magnitude", "precision"]);

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
                        magnitude: ArchetypeEditor.getRmTypeHandler("C_REAL").createContext(archetypeModel, tupleConstraint.magnitude),
                        units: units,
                        precision: precisionEnabled ? tupleConstraint.precision.list[0] : ""
                    };

                    context.unit_panels.push(panel);
                }
                return context;
            };

            handler.show = function (context, targetElement, guiContext) {
                GuiUtils.applyTemplate("properties/constraint-openehr|DV_QUANTITY", context, function (generatedDom) {

                    function showUnitPanel(panel_id) {
                        Stream(context.unit_panels).forEach(function (panel) {
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
                    generatedDom.find("#" + context.units_id + "_remove").click(function () {
                        if (context.unit_panels.length === 0) return;
                        var panel_id = targetElement.find("#" + context.units_id).val();
                        removeUnitPanel(panel_id);
                        guiContext.redraw();
                    });
                    generatedDom.find("#" + context.units_id + "_add").click(function () {
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
                                      magnitude: ArchetypeEditor.getRmTypeHandler("C_REAL").createContext(guiContext.archetypeModel),
                                      units: newUnit,
                                      precision: ""
                                  };
                                  context.unit_panels.push(panel);
                                  guiContext.redraw();

                              }
                          })
                    });


                    ArchetypeEditor.applySubModules(generatedDom, context);
                    targetElement.append(generatedDom);

                    var unitsSelect = generatedDom.find("#" + context.units_id);
                    unitsSelect.change(function () {
                        showUnitPanel(unitsSelect.find("option:selected").val());
                    });

                    //setTimeout(function () { // should work directly, but only does for the first time !?
                    //    Stream(context.unit_panels).forEach(function (u) {
                    //        var checkbox = targetElement.find("#" + u.precision.id + "_enabled");
                    //        enablePrecisionInput(u.precision.enabled, u.precision.id);
                    //        checkbox.change(function (e) {
                    //            enablePrecisionInput($(this).prop('checked'), u.precision.id)
                    //        })
                    //    });
                    //}, 10);


                    Stream(context.unit_panels).findFirst().ifPresent(function (u) {
                        showUnitPanel(u.panel_id);
                    });
                });
            };

            handler.updateContext = function (context, targetElement) {
                Stream(context.unit_panels).forEach(function (up) {
                    var targetPanel = targetElement.find('#' + up.panel_id);
                    if (targetPanel.length > 0) {
                        ArchetypeEditor.getRmTypeHandler("C_REAL").updateContext(up.magnitude, targetPanel);
                        up.precision = targetPanel.find('#' + up.panel_id + '_precision').val();
                    }
                });
            };

            handler.updateConstraint = function (archetypeModel, context, cons, errors) {
                archetypeModel.removeAttribute("units");
                archetypeModel.removeAttribute("magnitude");
                archetypeModel.removeAttribute("precision");

                cons.attribute_tuples = [];
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
                        magnitudeHandler.updateConstraint(archetypeModel, panel.magnitude, magnitudeCons, unitErrors.sub("magnitude"));

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

    };

    ArchetypeEditor.addRmModule(new OpenEhrModule());
}());