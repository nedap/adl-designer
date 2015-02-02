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

              var handler = my.getRmTypeHandler(cons.rm_type_name);
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
                  if (!my.getRmTypeHandler(cons.rm_type_name)) {

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


      my.getRmTypeHandler = function (rm_type) {
          var rmModule = rmModules[my.referenceModel.name()];
          if (rmModule && rmModule.handlers[rm_type]) {
              return rmModule.handlers[rm_type];
          }
          return rmModules[""].handlers[rm_type];
      };

      my.applySubModules = function (generatedDom, context) {
          for (var key in context) {
              var prop = context[key];
              if (typeof prop === "object") {
                  if (prop.type && prop.panel_id) {
                      var handler = my.getRmTypeHandler(prop.type);
                      if (handler) {
                          var targetElement = generatedDom.find("#" + prop.panel_id);
                          if (targetElement.length > 0) {
                              handler.show(prop, targetElement);
                          }
                      }
                  }
                  my.applySubModules(generatedDom, prop);
              }
          }
      };


      my.useArchetype = function (archetypeModel) {
          my.archetypeModel = archetypeModel;

          var definitionPropertiesElement = $('#archetype-editor-definition-node-properties');
          var definitionPropertiesPanel = new DefinitionPropertiesPanel(archetypeModel, definitionPropertiesElement);

          var definitionTreeElement = $('#archetype-editor-definition-tree');
          var definitionTree = new DefinitionTree(archetypeModel, definitionTreeElement, definitionPropertiesPanel);
      };


      my.addRmModule = function (module) {
          rmModules[module.name] = module;
      };


      my.initialize = function (callback) {
          var latch = new CountdownLatch(2);
          latch.execute(callback);
          my.referenceModel = new AOM.ReferenceModel(latch.countDown);
          my.archetypeRepository = new AOM.ArchetypeRepository(latch.countDown);
      };

      return my;
  }()
  )
  ;