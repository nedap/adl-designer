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

      var primitiveModule;
      var rmModules = {};


      my.loadArchetype = function () {
          var loadArchetypeContext = {
              archetypes: ArchetypeEditor.archetypeRepository.infoList
          };
          GuiUtils.applyTemplate("dialog-load-archetype", loadArchetypeContext, function (htmlString) {
              var content = $(htmlString);


              GuiUtils.openSimpleDialog(
                {
                    title: "Load archetype",
                    buttons: {"load": "Load"},
                    content: content,
                    callback: function (content) {
                        var archetypeId = content.find('#selectArchetypeId').val();

                        $.getJSON("rest/repo/archetype/" + encodeURIComponent(archetypeId) + "/flat").success(
                          function (data) {
                              var archetypeModel = new AOM.EditableArchetypeModel(data);
                              my.useArchetype(archetypeModel);
                          });
                    }
                });
          });
      };


      var DefinitionPropertiesPanel = function (archetypeModel, targetElement) {
          var self = this;

          self.clear = function () {
              targetElement.html("");
          };

          self.showConstraintProperties = function (cons) {

              self.clear();
              if (!cons) return;
              var isEditable = archetypeModel.isNodeSpecialized(cons);

              var commonContext = {
                  node_id: cons.node_id,
                  occurrences: AmInterval.toString(cons.occurrences)
              };
              GuiUtils.applyTemplate("properties/constraint-common", commonContext, targetElement);

              var handler = getRmTypeHandler(cons.rm_type_name);
              if (!handler) return;

              var customDiv = $("<div>");
              targetElement.append(customDiv);

              var context = handler.createContext(archetypeModel, cons);

              var guiContext = {
                  redraw: function () {
                      handler.updateContext(context, customDiv);
                      customDiv.empty();
                      handler.show(context, customDiv, guiContext);
                  },
                  archetypeModel: archetypeModel
              };

              handler.show(context, customDiv, guiContext);

              targetElement.find("input").prop("disabled", !isEditable);
              targetElement.find("select").prop("disabled", !isEditable);
          }
      };

      var DefinitionTree = function (archetypeModel, targetElement, definitionPropertiesPanel) {
          var self = this;
          var treeIdPrefix = AmUtils.random4() + "_";
          var nextTreeIdIndex = 0;

          var treeData = {};

          function nextTreeId() {
              return treeIdPrefix + (nextTreeIdIndex++).toString();
          }

          function buildTreeJson(target, cons) {

              function addTransparentAttributeConstraints() {
                  for (var i in cons.attributes || []) {
                      var attribute = cons.attributes[i];
                      for (var j in attribute.children || []) {
                          buildTreeJson(target, attribute.children[j]);
                      }
                  }
              }

              function addFullAttributesAndConstrains() {
                  for (var i in cons.attributes) {
                      var attribute = cons.attributes[i];
                      var attrJson = {
                          id: nextTreeId()
                      };
                      treeData[attrJson.id] = {
                          attr: attribute
                      };
                      attrJson.text = attribute.rm_attribute_name;
                      if (attribute.children && attribute.children.length > 0) {
                          attrJson.children = [];
                          for (var j in attribute.children) {
                              buildTreeJson(attrJson.children, attribute.children[j]);
                          }
                      }
                      consJson.children.push(attrJson);
                  }
              }

              function addDataAttribute(consJson, attrName) {
                  for (var i in cons.attributes) {
                      var attribute = cons.attributes[i];
                      if (attribute.rm_attribute_name !== attrName) continue;

                      for (var j in cons.children) {
                          consJson.children = consJson.children || [];
                          buildTreeJson(consJson.children, attribute.children[j]);
                      }
                      return true;
                  }
                  return false;
              }

              // leave tree compactness for later
              var rmType = undefined;
              // var rmType = my.referenceModel.getType(cons.rm_type_name);

              if (rmType && rmType.display === 'none') return;

              if (rmType && rmType.display === 'transparent') {
                  addTransparentAttributeConstraints();
              } else {
                  var consJson = {
                      id: nextTreeId()
                  };
                  treeData[consJson.id] = {
                      cons: cons
                  };
                  consJson.text = archetypeModel.getTermDefinitionText(cons.node_id);
                  if (archetypeModel.isNodeSpecialized(cons)) {
                      consJson.a_attr = consJson.a_attr || {};
                      consJson.a_attr.class = "specialized";
                  }

                  if (!consJson.text) {
                      consJson.text = ((cons.rm_type_name || "") + " " + (cons.node_id || "")).trim();
                  }

                  // only add attributes if no custom handler for this type
                  if (!getRmTypeHandler(cons.rm_type_name)) {

                      if (cons.attributes && cons.attributes.length > 0) {
                          consJson.children = [];
                      }
                      if (cons.attributes && cons.attributes.length > 0) {
                          if (rmType && rmType.dataAttribute) {
                              if (!addDataAttribute(consJson, rmType.dataAttribute)) {
                                  addFullAttributesAndConstrains();
                              }
                          } else {
                              addFullAttributesAndConstrains();
                          }
                      }
                  }

              }
              target.push(consJson);
          }

          var jsonTreeTarget = [];
          buildTreeJson(jsonTreeTarget, archetypeModel.data.definition);

          targetElement.html("");
          targetElement.jstree("destroy");
          targetElement.jstree(
            {
                'core': {
                    'data': jsonTreeTarget,
                    'multiple': false
                }
            });

          targetElement.on('select_node.jstree', function (event, treeEvent) {
              var data = treeData[treeEvent.node.id];
              definitionPropertiesPanel.showConstraintProperties(data.cons);
          });
      };


      my.useArchetype = function (archetypeModel) {
          my.archetypeModel = archetypeModel;

          var definitionPropertiesElement = $('#archetype-editor-definition-node-properties');
          var definitionPropertiesPanel = new DefinitionPropertiesPanel(archetypeModel, definitionPropertiesElement);

          var definitionTreeElement = $('#archetype-editor-definition-tree');
          var definitionTree = new DefinitionTree(archetypeModel, definitionTreeElement, definitionPropertiesPanel);


      };

      function getRmTypeHandler(rm_type) {
          var rmModule = rmModules[my.referenceModel.name()];
          if (rmModule && rmModule.handlers[rm_type]) {
              return rmModule.handlers[rm_type];
          }
          return primitiveModule.handlers[rm_type];
      }

      function applySubModules(generatedDom, context) {
          for (var key in context) {
              var prop = context[key];
              if (typeof prop === "object") {
                  if (prop.type && prop.panel_id) {
                      var handler = getRmTypeHandler(prop.type);
                      if (handler) {
                          var targetElement = generatedDom.find("#" + prop.panel_id);
                          if (targetElement.length > 0) {
                              handler.show(prop, targetElement);
                          }
                      }
                  }
                  applySubModules(generatedDom, prop);
              }
          }
      }


      my.addRmModule = function (module) {
          rmModules[module.name] = module;
      };

      my.OpenEhrModule = function () {
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
                          magnitude: getRmTypeHandler("C_REAL").createContext(archetypeModel, tupleConstraint.magnitude),
                          units: units,
                          precision: {
                              id: GuiUtils.generateId(),
                              enabled: precisionEnabled,
                              value: precisionEnabled ? tupleConstraint.precision.list[0] : 0
                          }

                      };
                      context.unit_panels.push(panel);
                  }
                  return context;
              };

              handler.show = function (context, targetElement, guiContext) {
                  GuiUtils.applyTemplate("properties/constraint-openehr|DV_QUANTITY", context, function (generatedDom) {

                      function enablePrecisionInput(enable, precision_id) {
                          targetElement.find("#" + precision_id + "_enabled").prop('checked', enable);
                          targetElement.find("#" + precision_id + "_value").prop('disabled', !enable);
                      }

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
                                        magnitude: getRmTypeHandler("C_REAL").createContext(guiContext.archetypeModel),
                                        units: newUnit,
                                        precision: {
                                            id: GuiUtils.generateId(),
                                            enabled: false,
                                            value: 0
                                        }
                                    };
                                    context.unit_panels.push(panel);
                                    guiContext.redraw();

                                }
                            })
                      });


                      applySubModules(generatedDom, context);
                      targetElement.append(generatedDom);

                      var unitsSelect = generatedDom.find("#" + context.units_id);
                      unitsSelect.change(function () {
                          showUnitPanel(unitsSelect.find("option:selected").val());
                      });

                      setTimeout(function () { // should work directly, but only does for the first time !?
                          Stream(context.unit_panels).forEach(function (u) {
                              var checkbox = targetElement.find("#" + u.precision.id + "_enabled");
                              enablePrecisionInput(u.precision.enabled, u.precision.id);
                              checkbox.change(function (e) {
                                  enablePrecisionInput($(this).prop('checked'), u.precision.id)
                              })
                          });
                      }, 10);


                      Stream(context.unit_panels).findFirst().ifPresent(function (u) {
                          showUnitPanel(u.panel_id);
                      });
                  });
              };

              handler.updateContext = function (context, targetElement) {
                  Stream(context.unit_panels).forEach(function (up) {
                      var targetPanel = targetElement.find('#' + up.panel_id);
                      if (targetPanel.length > 0) {
                          getRmTypeHandler("C_REAL").updateContext(up.magnitude, targetPanel);
                          up.precision.enabled = targetPanel.find('#' + up.precision.id + '_enabled').prop('checked');
                          up.precision.value = targetPanel.find('#' + up.precision.id + '_value').val();
                      }
                  });
              };

              handler.updateConstraint = function (archetypeModel, context, cons) {
                  cons = cons || {
                      "@type": "C_COMPLEX_OBJECT",
                      rm_type_name: "DV_QUANTITY"
                  };

                  archetypeModel.removeAttribute(cons, "units");
                  archetypeModel.removeAttribute(cons, "magnitude");
                  archetypeModel.removeAttribute(cons, "precision");

                  // todo create tuple of units, magnitude, precision


                return cons;
              };


              return handler;

          }();

      };

      my.PrimitiveModule = function () {
          var self = this;
          self.name = "primitives";

          self.handlers = {};
          self.handlers["C_REAL"] = new function () {
              var handler = this;
              handler.createContext = function (archetypeModel, cons) {
                  cons = cons || {};
                  var context = {
                      "panel_id": GuiUtils.generateId(),
                      "type": "C_REAL"
                  };
                  context.range_id = GuiUtils.generateId();
                  context.range = (cons.range) ? AmInterval.toContainedString(cons.range) : "(*..*)";
                  context.assumed_value_id = GuiUtils.generateId();
                  context.assumed_value = cons.assumed_value != undefined ? String(cons.assumed_value) : "";

                  return context;
              };

              handler.show = function (context, targetElement) {
                  GuiUtils.applyTemplate("properties/constraint-primitive|C_REAL", context, targetElement);
              };

              handler.updateContext = function (context, targetElement) {
                  context.range = targetElement.find('#' + context.range_id).val();
                  context.assumed_value = targetElement.find('#' + context.assumed_value_id).val().trim();
                  if (context.assumed_value.length > 0) {
                      context.assumed_value = Number(context.assumed_value);
                  } else {
                      context.assumed_value = undefined;
                  }
              };

              handler.updateConstraint = function (archetypeModel, context, cons) {
                  cons = cons || {
                      "@type": "C_REAL",
                      "rm_type_name": "C_REAL"
                  };

                  cons.assumed_value = context.assumed_value;
                  cons.range = AmInterval.parseContainedString(context.range);
                  if (cons.range) {
                      cons.range["@type"] = "INTERVAL_OF_REAL";
                  }
                  if (cons.range.upper === undefined && cons.range.lower === undefined) cons.range = undefined;
                  return cons;
              };

              return handler;
          }();
      };


      my.initialize = function (callback) {
          var latch = new CountdownLatch(2);
          latch.execute(callback);
          my.referenceModel = new AOM.ReferenceModel(latch.countDown);
          my.archetypeRepository = new AOM.ArchetypeRepository(latch.countDown);

          // add rm module handlers
          my.addRmModule(new my.OpenEhrModule());
          primitiveModule = new my.PrimitiveModule();
      };

      return my;
  }()
  )
  ;