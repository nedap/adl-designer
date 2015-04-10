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

var TemplateBuilder = {

    occurrence_optional: {
        "lower_included": true,
        "upper_included": true,
        "lower_unbounded": false,
        "upper_unbounded": false,
        "lower": 0,
        "upper": 1
    },
    occurrence_mandatory: {
        "lower_included": true,
        "upper_included": true,
        "lower_unbounded": false,
        "upper_unbounded": false,
        "lower": 1,
        "upper": 1
    },
    occurrence_unbounded: {
        "lower_included": true,
        "upper_included": false,
        "lower_unbounded": false,
        "upper_unbounded": true,
        "lower": 0
    },
    occurrence_deleted: {
        "lower_included": true,
        "upper_included": false,
        "lower_unbounded": false,
        "upper_unbounded": false,
        "upper": 0
    }

};

TemplateBuilder.TemplateModel = function (rootArchetypeModel) {
    var self = this;
    var idToNodeMap = {};


    var modelNodeIndex = 0;

    function pushChild2(target, child, archetypeModel) {
        idToNodeMap[child.id] = child;
        child.original = AmUtils.clone(child.current);

        if (!target.children) {
            target.children = [];
        }
        child.parent = target;
        child.archetypeModel = archetypeModel;
        target.children.push(child);
    }

    function buildModelDefinition(archetypeModel) {

        function pushChild(target, child) {
            pushChild2(target, child, archetypeModel)
        }

        function addAttributesFromRm(constraint) {
            var existing = {};
            if (constraint.children) {
                for (var childId in constraint.children) {
                    var child = constraint.children[childId];
                    existing[child.current.name] = true;
                }
            }

            var rmType = TemplateBuilder.referenceModel.model.types[constraint.rmType];
            if (rmType && rmType.attributes) {
                for (var attributeName in rmType.attributes) {
                    var attribute = rmType.attributes[attributeName];
                    if (!existing[attributeName] && TemplateBuilder.rmTypeHoldsArchetype(attribute.type)) {
                        existing[attributeName] = true;
                        var attr = {
                            type: "attribute",
                            id:     "a_" + (modelNodeIndex++),
                            rmName: attributeName,
                            rmType: attribute.type,
                            data: undefined,
                            rmPath: constraint.rmPath + "/" + attributeName,
                            current: {
                                name: attributeName,
                                occurrences: AmUtils.clone(attribute.existence)
                            }
                        };
                        pushChild(constraint, attr);
                    }
                }
            }
        }

        function parseConstraint(parent, c) {

            function findAttributeWithName(data, attributeName) {
                for (var i in data.attributes || []) {
                    if (data.attributes[i].rm_attribute_name === attributeName) {
                        return data.attributes[i];
                    }
                }
                return undefined;
            }

            function buildDataConstraints(constraintsData) {

                function buildAttributeConstraint(data) {
                    if (!data.children || data.children.length != 1) {
                        return undefined;
                    }
                    var child = buildConstraint(data.children[0]);
                    child.attribute = data.rm_attribute_name;
                    return child;
                }

                function buildTupleConstraint(data) {
                    var result = {};
                    result.type = "tuple";
                    result.children = [];
                    result.hasParent = true;
                    result.members = [];

                    for (var i in data.members || []) {
                        result.members.push(data.members[i].rm_attribute_name);
                    }

                    for (var i in data.children || []) {
                        var child = data.children[i];
                        var objectTuple = {
                            present: true,
                            members: []
                        };
                        for (var j in child.members) {
                            var memc = buildConstraint(child.members[j]);
                            memc.attribute = data.members[j].rm_attribute_name;
                            objectTuple.members.push(memc);
                        }

                        result.children.push(objectTuple);
                    }

                    return result;
                }

                function buildStringConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;
                    result.list = AmUtils.clone(data.list);

                    result.original = AmUtils.clone(result);
                    return result;
                }

                function buildComplexObjectConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.children = [];
                    result.rmType = data.rm_type_name;

                    for (var i in data.attributes || []) {
                        var child = buildAttributeConstraint(data.attributes[i]);
                        if (child) {
                            result.children.push(child);
                        }
                    }

                    for (var i in data.attribute_tuples || []) {
                        var child = buildTupleConstraint(data.attribute_tuples[i]);
                        result.children.push(child);
                    }
                    return result;
                }

                function buildPlainConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;
                    return result;
                }

                function buildTerminologyCodeConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;

                    result.code_list = [];
                    if (data.code_list) {
                        var valueSets = archetypeModel.explodeValueSets(data.code_list);
                        for (var code in valueSets) {
                            result.code_list.push(code);
                        }
                    }
                    result.original = AmUtils.clone(result);
                    return result;
                }

                function buildNumberConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;

                    result.list = AmUtils.clone(data.list);
                    result.range = AmUtils.clone(data.range);
                    result.defaultValue = AmUtils.clone(data.default_value);

                    result.original = AmUtils.clone(result);
                    return result;
                }

                function buildDurationConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;

                    result.pattern = data.pattern;
                    result.range = AmUtils.clone(data.range);

                    result.original = AmUtils.clone(result);
                    return result;
                }

                function buildBooleanConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;

                    result.trueValid = data.true_valid;
                    result.falseValid = data.false_valid;

                    result.original = AmUtils.clone(result);
                    return result;
                }

                function buildDateTimeConstraint(data) {
                    var result = {};
                    result.type = data["@type"];
                    result.rmType = data.rm_type_name;
                    result.range = AmUtils.clone(data.range);
                    result.pattern = data.pattern;

                    result.original = AmUtils.clone(result);

                    return result;
                }

                function buildConstraint(data) {
                    switch (data["@type"]) {
                        case "C_ATTRIBUTE":
                            return buildAttributeConstraint(data);
                        case "C_COMPLEX_OBJECT":
                            return buildComplexObjectConstraint(data);
                        case "C_TERMINOLOGY_CODE":
                            return buildTerminologyCodeConstraint(data);
                        case "C_STRING":
                            return buildStringConstraint(data);
                        case "C_REAL":
                        case "C_INTEGER":
                            return buildNumberConstraint(data);
                        case "C_DATE_TIME":
                        case "C_DATE":
                        case "C_TIME":
                            return buildDateTimeConstraint(data);
                        case "C_BOOLEAN":
                            return buildBooleanConstraint(data);
                        case "C_DURATION":
                            return buildDurationConstraint(data);
                        default:
                            return buildPlainConstraint(data);
                    }
                }

                return constraintsData && constraintsData.children &&
                       constraintsData.children.length === 1 ? buildConstraint(constraintsData.children[0]) : undefined;
            } // buildDataConstraints


            var terms = {};
            terms[archetypeModel.defaultLanguage] = archetypeModel.getTermDefinition(c.node_id);
            for (var tr in archetypeModel.translations) {
                var lang = archetypeModel.translations[tr];
                terms[lang] = archetypeModel.getTermDefinition(c.node_id, lang);
            }

            var rmType = TemplateBuilder.referenceModel.model.types[c.rm_type_name];


            var defaultTerm = terms[archetypeModel.defaultLanguage];

            var result = {
                type: "constraint",
                id: "c_" + (modelNodeIndex++),
                rmType: c.rm_type_name,
                data: c,
                rmPath: parent.rmPath ? (parent.rmPath + (c.node_id ? "[" + c.node_id + "]" : "")) : "",
                terms: terms,
                current: {
                    name: defaultTerm ? defaultTerm.text : c.node_id,
                    occurrences: AmUtils.clone(c.occurrences)
                }
            };

            if (rmType && rmType.finalType) {
                var data = rmType.dataAttribute ? findAttributeWithName(c, rmType.dataAttribute) : c;
                if (rmType.dataAttribute) {
                    result.dataAttribute = rmType.dataAttribute;
                }
                result.constraints = buildDataConstraints(data);
            } else {

                var cType = c["@type"];
                if (cType != "ARCHETYPE_SLOT") {
                    if (c.attributes) {
                        for (var i in c.attributes) {
                            parseAttribute(result, c.attributes[i]);
                        }
                    }
                    addAttributesFromRm(result);
                }
            }


            pushChild(parent, result);
        }

        function parseAttribute(parent, a) {
            // assert that parent.type==="constraint"
            var rmModelAttribute = TemplateBuilder.referenceModel.model.types[parent.rmType].attributes[a.rm_attribute_name];

            var result = {
                type: "attribute",
                id:     "a_" + (modelNodeIndex++),
                rmType: rmModelAttribute ? rmModelAttribute.type : "?",
                data: a,
                rmPath: parent.rmPath + "/" + a.rm_attribute_name,
                current: {
                    name: a.rm_attribute_name,
                    occurrences: AmUtils.clone(a.existence || rmModelAttribute.existence)
                }
            };


            if (a.children) {
                for (var i in a.children) {
                    parseConstraint(result, a.children[i]);
                }
            }
            pushChild(parent, result);
        }

        function createNewOverrideArchetypeId(parentArchetypeModel) {
            var pid = parentArchetypeModel.getArchetypeId();
            var start = pid.indexOf('.');
            var end = pid.indexOf('.', start + 1);
            var name = pid.substring(start, end);

            var newId = pid.substring(0, start) + name + "_" + AmUtils.random4() + pid.substring(end);
            return newId;
        }

        var target = {};
        parseConstraint(target, archetypeModel.data.definition);

        delete target.children[0].parent;
        target = target.children[0];
        target.archetypeRoot = true;
        target.modified = true;
        target.archetypeId = createNewOverrideArchetypeId(archetypeModel);
        return target;
    }

    function addTableRows(builder, model) {
        builder.open("tr").attr("data-tt-id", model.id);
        if (model.parent && model.parent.id) {
            builder.attr("data-tt-parent-id", model.parent.id);
        }
        builder.open("td");
        builder.attr("class", "context-menu-template-node");
        builder.open("span").attr("class", "context-menu-template-value");
        self.buildNodeValueString(model, builder);
        builder.close("span");

        builder.close("td");

        builder.close("tr");

        var rmType = TemplateBuilder.referenceModel.model.types[model.rmType];
        if (rmType && rmType.finalType) return;

        if (model.children) {
            for (var i in model.children) {
                addTableRows(builder, model.children[i]);
            }
        }
    }


    function filterArchetypesForArchetypeSlot(modelNode, candidateArchetypes) {
        function buildAssertionPredicate(assertionList) {
            if (!assertionList) {
                return function (archetypeInfo) {
                    return false;
                }
            }
            var regularExpressions = [];
            for (var i in assertionList) {
                var ass = assertionList[i];
                var start = ass.string_expression.indexOf("{");
                var end = ass.string_expression.lastIndexOf("}");
                if (start >= 0 && end >= 0) {
                    var expr = ass.string_expression.substring(start + 1, end);
                    start = expr.indexOf("/");
                    end = expr.lastIndexOf("/");
                    if (start >= 0 && end >= 0) {
                        expr = expr.substring(start + 1, end);
                        regularExpressions.push(new RegExp(expr))
                    }
                }
            }

            return function (archetypeInfo) {
                for (var re in regularExpressions) {
                    if (regularExpressions[re].test(archetypeInfo.archetypeId)) {
                        return true;
                    }
                }
                return false;
            }
        }


        var includesPredicate = buildAssertionPredicate(modelNode.data.includes);
        var excludesPredicate = buildAssertionPredicate(modelNode.data.excludes);

        return candidateArchetypes.filter(function (candidate) {
            if (!TemplateBuilder.referenceModel.isSubclass(modelNode.rmType, candidate.rmType)) return false;
            if (excludesPredicate(candidate)) return false;
            if (!includesPredicate(candidate)) return false;
            return true;
        });
    }


    self.canAddArchetype = function (modelNode) {

        return self.getAddableArchetypes(modelNode).length > 0;
    };


    self.buildTableRows = function (modelNode) {
        var builder = new HtmlStringBuilder();
        addTableRows(builder, modelNode);
        return builder.toString();
        //targetTBodyElement.html(builder.toString());
    };

    self.buildNodeValueString = function (modelNode, builder) {
        var hasBuilder = builder != undefined;
        var builder = builder || new HtmlStringBuilder();

        builder.open("span").class("name");
        if (modelNode.current.occurrences && modelNode.current.occurrences.upper === 0) {
            builder.class("deleted");
        } else if (modelNode.modified) {
            builder.class("modified");
        }
        var name = modelNode.terms && modelNode.terms[modelNode.archetypeModel.defaultLanguage]
          ? modelNode.terms && modelNode.terms[modelNode.archetypeModel.defaultLanguage].text
          : modelNode.current.name;
        builder.text(name).close("span");
        if (!self.occurrenceEquals(modelNode.original.occurrences || TemplateBuilder.occurrence_optional,
                                   modelNode.current.occurrences || TemplateBuilder.occurrence_optional))
        {
            builder.open("span").attr("class", "delta")
              .text(AmUtils.buildIntervalString(modelNode.original.occurrences) + "->" +
                    AmUtils.buildIntervalString(modelNode.current.occurrences))
              .close("span");
        }
        if (modelNode.original.name != modelNode.current.name) {
            builder.open("span").class("delta").text("(NAME from '" + modelNode.original.name + "')").close("span");

        }
        if (!hasBuilder) {
            return builder.toString();
        }
    };

    self.addChild = function modelNode(parentNode, modelNode) {
        pushChild2(parentNode, modelNode, modelNode.archetypeModel || parentNode.archetypeModel);
    };

    self.buildModelDefinition = function (archetypeModel) {
        return buildModelDefinition(archetypeModel);
    };


    self.getNode = function (ttNodeId) {
        return idToNodeMap[ttNodeId];
    };


    self.getAddableArchetypes = function (modelNode) {
        if (!AmInterval.contains(modelNode.original.occurrences, modelNode.children ? modelNode.children.length + 1 : 1))
        {
            return false;
        }

        if (modelNode.type === "constraint") {
            if (modelNode.data["@type"] === "ARCHETYPE_SLOT") {
                return filterArchetypesForArchetypeSlot(modelNode, TemplateBuilder.archetypeRepository.infoList);
            }
            return [];
        }
        if (modelNode.type === "attribute") {

            var result = [];
            for (var i in TemplateBuilder.archetypeRepository.infoList) {
                var candidate = TemplateBuilder.archetypeRepository.infoList[i];
                if (!TemplateBuilder.referenceModel.isSubclass(modelNode.rmType, candidate.rmType))  continue;

                result.push(candidate);
            }
            return result;
        }
    };

    self.renameNode = function (modelNode, newName, newDescription) {
        modelNode.modified = true;
        modelNode.current.name = newName;
        if (!modelNode.terms[modelNode.archetypeModel.defaultLanguage]) {
            modelNode.terms[modelNode.archetypeModel.defaultLanguage] = {};
        }
        modelNode.terms[modelNode.archetypeModel.defaultLanguage].text = newName;
        if (newDescription) {
            modelNode.terms[modelNode.archetypeModel.defaultLanguage].description = newDescription;
        }
    };

    self.occurrenceEquals = function (occ1, occ2) {
        return (occ1.lower === occ2.lower &&
                occ1.upper === occ2.upper &&
                occ1.lower_included === occ2.lower_included &&
                occ1.upper_included === occ2.upper_included);
    };

    self.getOccurrenceType = function (modelNode, occ) {
        var cur = modelNode.current.occurrences;
        var org = modelNode.original.occurrences;

        if (AmInterval.equals(AmInterval.occurrences(cur), AmInterval.occurrences(occ))) return "current";

        //if (AmUtils.intervalContains(org, occ)) return "valid";
        if (AmInterval.contains(AmInterval.occurrences(org), AmInterval.occurrences(occ))) return "valid";
        return "invalid";
    };

    self.setOccurrences = function (modelNode, occ) {
        modelNode.modified = true;
        modelNode.current.occurrences = AmUtils.clone(occ);
    };

    self.buildPropertiesPanelElement = function (modelNode) {

        function makePath(prefix, attribute) {
            if (!prefix) {
                return attribute;
            }
            return prefix + "." + attribute;
        }

        function buildOccurrenceColumn(modelNode) {
            var builder = new HtmlStringBuilder();
            builder.open("td").text(AmUtils.buildIntervalString(modelNode.current.occurrences));
            builder.open("div").class("open-details-panel");
            builder.open("button").class("open-details").text("...").close("button");
            builder.close("div");
            builder.close("td");

            var result = $(builder.toString());


            result.find("button").click(function () {
                var b = new HtmlStringBuilder();
                b.open("table").open("tr");
                b.open("td").text("Original").close("td").
                  open("td").text(AmUtils.buildIntervalString(modelNode.original.occurrences)).close("td");
                b.close("tr").open("tr");
                b.open("td").text("New Value").close("td").open("td");
                b.open("input").attr("type", "text").attr("value",
                                                          AmUtils.buildIntervalString(modelNode.current.occurrences)).close("input");
                b.close("td").close("tr");
                b.close("table");


                TemplateBuilder.openSimpleDialog({
                                                     title: "Occurrences",
                                                     content: b.toString(),
                                                     callback: function (eContent) {
                                                         var eInput = eContent.find("input");
                                                         var val = AmUtils.parseIntervalString(eInput.val());

                                                         if (val === undefined) return "Invalid occurrence string";
                                                         if (AmInterval.equals(AmInterval.occurrences(val),
                                                                               AmInterval.occurrences(modelNode.current.occurrences)))
                                                         {
                                                             return true;
                                                         }
                                                         if (!AmInterval.contains(modelNode.original.occurrences, val)) {
                                                             return "Occurrence out of range";
                                                         }

                                                         modelNode.current.occurrences = val;
                                                         TemplateBuilder.displayPropertiesPanel(modelNode);
                                                         modelNode.modified = true;
                                                         TemplateBuilder.redrawNode(modelNode);
                                                     }
                                                 })
            });

            return result;
        }

        var targetTable = $("<table>");
        var targetTBody = $("<tbody>");

        function appendHeader(header, detailsCallback) {
            var td = $("<td>").attr("colspan", 2);
            td.append($("<span>").attr("class", "header").text(header));
            if (detailsCallback) {
                var openDetails = $("<div>").attr("class", "open-details-panel");
                ;
                var button = $("<button>").attr("class", "open-details").text("...").click(detailsCallback);
                openDetails.append(button);
                td.append(openDetails);
            }
            targetTBody.append($("<tr>").append(td));
        }

        function appendRowString(label, valueString) {
            if (!valueString) return;

            targetTBody.append(
              $("<tr>")
                .append($("<td>").text(label))
                .append($("<td>").text(valueString))
            );
        }

        function appendRowElement(label, valueElement) {
            if (!valueElement) return;

            targetTBody.append(
              $("<tr>")
                .append($("<td>").text(label))
                .append(valueElement)
            );
        }

        function appendTupleConstraints(cons, attrPrefix, parentCons) {
            for (var i in cons.children) {
                var objectTuple = cons.children[i];
                var tr = $("<tr>");
                var td = $("<td>").attr("class", "tupleSeparator").attr("colspan", "2");
                var input = $("<input>").attr("type", "checkbox").prop("checked", objectTuple.present)
                  .attr("data-index", i).text("Tuple present");
                input.click(function (e) {
                    var checked = $(this).is(':checked');
                    var index = $(this).data("index");
                    cons.children[index].present = checked;

                    TemplateBuilder.displayPropertiesPanel(modelNode);
                    modelNode.modified = true;
                    TemplateBuilder.redrawNode(modelNode);
                });
                td.append(input);

                tr.append(td);

                var rmType = TemplateBuilder.referenceModel.model.types[parentCons.rmType];
                var missingAttributes = getMissingAttributes(getConstraintAttributes(parentCons));
                var openDetails = $("<div>").attr("class", "open-details-panel");
                if (!cons.hasParent) {
                    var button = $("<button>");
                    button.attr("class", "open-details").text("+t");
                    button.click(function ()
                                 {
                                     cons.children.push(buildNewTupleObjectConstraint(cons, rmType));

                                     modelNode.modified = true;
                                     TemplateBuilder.redrawNode(modelNode);

                                 });
                    openDetails.append(button);
                }
                if (missingAttributes.length > 0) {
                    var button = $("<button>");
                    button.attr("class", "open-details").text("+a");
                    button.click(function ()
                                 {
                                     var builder = new HtmlStringBuilder();
                                     builder.open("select").attr("name", "attribute");
                                     for (var i in missingAttributes) {
                                         builder.open("option").attr("value",
                                                                     missingAttributes[i]).text(missingAttributes[i]).close("option");
                                     }
                                     builder.close("select");

                                     TemplateBuilder.openSimpleDialog(
                                       {
                                           title: "Add attribute constraint on tuple",
                                           content: builder.toString(),
                                           callback: function (eContent) {
                                               var val = eContent.find('select').val().trim();

                                               cons.members.push(val);
                                               for (var ii in cons.children) {
                                                   var child = cons.children[ii];
                                                   var newConstraint = createNewConstraint(val, rmType.attributes[val]);
                                                   child.members.push(newConstraint);
                                               }

                                               modelNode.modified = true;
                                               TemplateBuilder.redrawNode(modelNode);
                                           }
                                       });

                                 });
                    openDetails.append(button);
                }
                td.append(openDetails);


                targetTBody.append(tr);
                for (var j in objectTuple.members) {
                    appendConstraints(objectTuple.members[j], attrPrefix);
                }
            }
        }

        function createNewConstraint(attributeName, attribute) {
            var result = {};
            result.attribute = attributeName;
            var targetType = TemplateBuilder.referenceModel.model.types[attribute.type];
            if (targetType.attributes) {
                result.rmType = attribute.type.toUpperCase();
                result.type = "C_COMPLEX_OBJECT";
            } else {
                result.rmType = "C_" + attribute.type.toUpperCase();
                result.type = result.rmType;
            }
            return result;
        }

        function pushBeforeTuples(cons, newConstraint) {
            if (!cons.children) {
                cons.children = [];
            }
            var idx = 0;
            for (var i in cons.children) {
                if (cons.children[i].type !== "tuple") {
                    idx = i;
                }
            }
            if (idx < cons.children.length) {
                cons.children.splice(idx, 0, newConstraint);
            } else {
                cons.children.push(newConstraint);
            }
        }

        function getMissingAttributes(constraintAttributes) {
            var result = [];
            for (var constraint in constraintAttributes) {
                if (!constraintAttributes[constraint]) {
                    result.push(constraint);
                }
            }
            return result;
        }

        function buildNewTupleObjectConstraint(tupleConstraint, rmType) {
            var newObjectTuple = {
                present: true,
                members: []
            };
            for (var i in tupleConstraint.members) {
                var attribute = tupleConstraint.members[i];
                var childConstraint = createNewConstraint(attribute, rmType.attributes[attribute]);
                newObjectTuple.members.push(childConstraint);
            }
            return newObjectTuple;

        }

        function appendComplexObjectConstraints(cons, attrPrefix) {


            if (cons.attribute) {
                attrPrefix = makePath(attrPrefix, cons.attribute);
            }

            var td = $('<td>');
            td.append($("<span>").text(cons.rmType));

            var rmType = TemplateBuilder.referenceModel.model.types[cons.rmType];

            var missingAttributes = getMissingAttributes(getConstraintAttributes(cons));

            if (missingAttributes.length > 0) {
                var openDetails = $("<div>").attr("class", "open-details-panel");
                var addAttributeButton = $("<button>").attr("class", "open-details").text("+a");
                addAttributeButton.click(function ()
                                         {
                                             var builder = new HtmlStringBuilder();
                                             builder.open("select").attr("name", "attribute");
                                             for (var i in missingAttributes) {
                                                 builder.open("option").attr("value",
                                                                             missingAttributes[i]).text(missingAttributes[i]).close("option");
                                             }
                                             builder.close("select");

                                             TemplateBuilder.openSimpleDialog(
                                               {
                                                   title: "Add attribute constraint",
                                                   content: builder.toString(),
                                                   callback: function (eContent) {
                                                       var val = eContent.find('select').val().trim();

                                                       var newConstraint = createNewConstraint(val, rmType.attributes[val]);
                                                       pushBeforeTuples(cons, newConstraint);
                                                       modelNode.modified = true;
                                                       TemplateBuilder.redrawNode(modelNode);
                                                   }
                                               });

                                         });
                if (missingAttributes.length > 1) {
                    var addTupleButton = $("<button>").attr("class", "open-details").text("+t");
                    addTupleButton.click(function () {
                        var builder = new HtmlStringBuilder();
                        builder.open("div").text("Choose attributes for tuple").close("div");

                        builder.open("select").attr("name", "attribute").attr("size", 10).attr("multiple");
                        for (var i in missingAttributes) {
                            builder.open("option").attr("value", missingAttributes[i]).text(missingAttributes[i]).close("option");
                        }
                        builder.close("select");

                        TemplateBuilder.openSimpleDialog(
                          {
                              title: "Add tuple constraint",
                              content: builder.toString(),
                              callback: function (eContent) {
                                  var select = eContent.find('select')[0];
                                  var attributes = [];
                                  for (var i in select.options) {
                                      var option = select.options[i];
                                      if (option.selected) {
                                          attributes.push(option.value);
                                      }
                                  }
                                  if (attributes.length === 0) {
                                      throw "At least one attribute must be selected";
                                  }
                                  var newTupleConstraint = {
                                      type: "tuple",
                                      members: attributes,
                                      hasParent: false,
                                      children: []
                                  };
                                  newTupleConstraint.children.push(buildNewTupleObjectConstraint(newTupleConstraint, rmType));
                                  if (!cons.children) cons.children = [];
                                  cons.children.push(newTupleConstraint);

                                  modelNode.modified = true;
                                  TemplateBuilder.redrawNode(modelNode);

                              }
                          });

                    });
                    openDetails.append(addTupleButton);
                }
                openDetails.append(addAttributeButton);
                td.append(openDetails);
            }

            appendRowElement(attrPrefix, td);

            for (var i in cons.children || []) {
                appendConstraints(cons.children[i], attrPrefix, cons);
            }
        }

        function appendStringConstraint(cons, attrPrefix) {
            var td = $('<td>');
            if (cons.list) {
                var values = [];
                for (var val in cons.list) {
                    values.push(cons.list[val]);
                }
                td.append($("<span>").text(values.join(", ")));
            }


            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendDateTimeConstraint(cons, attrPrefix) {
            var td = $('<td>');
            if (cons.range) {
                td.append($("<span>").text(AmInterval.toString(cons.range)));
            }
            td.append(
              $("<div>").attr("class", "open-details-panel").append(
                $("<button>").attr("class", "open-details").text("...")
                  .click(function () {
                             var builder = new HtmlStringBuilder();
                             builder.open("input").attr("name", "range").attr("value", cons.range ? AmInterval.toString(cons.range) : "");

                             TemplateBuilder.openSimpleDialog(
                               {
                                   //width: 800,
                                   title: cons.type === "C_DATE_TIME" ? "Date/Time constraint" :
                                     cons.type === "C_DATE" ? "Date constraint" :
                                       cons.type === "C_TIME" ? "Time constraint" : "?",
                                   content: builder.toString(),
                                   callback: function (eContent) {
                                       var val = eContent.find('input').val().trim();
                                       if (val.length === 0) {
                                           cons.range = cons.original ? cons.original.range : undefined;
                                       } else {
                                           var newRange = AmInterval.parseStringInterval(val);
                                           if (!newRange) throw "Bad interval";
                                           if (cons.original && cons.original.range) {
                                               if (AmInterval.contains(cons.original.range, newRange)) {
                                                   throw "Specialized interval does not match parent";
                                               }
                                           }
                                           cons.range = newRange;
                                       }

                                       if (cons.range && !cons.range["@type"]) {
                                           cons.range["@type"] = (
                                             cons.type === "C_DATE_TIME" ? "INTERVAL_OF_DATE_TIME" :
                                               cons.type === "C_DATE" ? "INTERVAL_OF_DATE" :
                                                 cons.type === "C_TIME" ? "INTERVAL_OF_TIME" : "?");
                                       }

                                       modelNode.modified = true;
                                       TemplateBuilder.redrawNode(modelNode);
                                   }
                               });

                         })));

            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendDurationConstraint(cons, attrPrefix) {
            var td = $('<td>');
            if (cons.range) {
                td.append($("<span>").text(AmInterval.toString(cons.range)));
            }
            td.append(
              $("<div>").attr("class", "open-details-panel").append(
                $("<button>").attr("class", "open-details").text("...")
                  .click(function () {
                             var builder = new HtmlStringBuilder();
                             builder.open("input").attr("name", "range").attr("value", AmInterval.toString(cons.range));

                             TemplateBuilder.openSimpleDialog({
                                                                  //width: 800,
                                                                  title: "Duration constraint",
                                                                  content: builder.toString(),
                                                                  callback: function (eContent) {
                                                                      var val = eContent.find('input').val().trim();
                                                                      if (val.length === 0) {
                                                                          cons.range = cons.original ? cons.original.range : undefined;
                                                                      } else {
                                                                          var newRange = AmInterval.parseStringInterval(val);
                                                                          if (!newRange) throw "Bad interval";
                                                                          if (cons.original && cons.original.range) {
                                                                              if (AmInterval.contains(cons.original.range, newRange)) {
                                                                                  throw "Specialized interval is not a subset of parent interval";
                                                                              }
                                                                          }
                                                                          cons.range = newRange;
                                                                      }

                                                                      if (cons.range && !cons.range["@type"]) {
                                                                          cons.range["@type"] = "INTERVAL_OF_DURATION";
                                                                      }

                                                                      modelNode.modified = true;
                                                                      TemplateBuilder.redrawNode(modelNode);
                                                                  }
                                                              });

                         })));

            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendBooleanConstraint(cons, attrPrefix) {
            var td = $('<td>');
            var validValues = [];
            if (cons.trueValid) validValues.push("true");
            if (cons.falseValid) validValues.push("false");
            td.append($("<span>").text(validValues.join(", ")));
            td.append(
              $("<div>").attr("class", "open-details-panel").append(
                $("<button>").attr("class", "open-details").text("...")
                  .click(function () {
                             var builder = new HtmlStringBuilder();
                             builder.open("input").attr("name", "true_valid").attr("type", "checkbox");
                             if (cons.trueValid) builder.attr("checked");
                             if (cons.original && !cons.original.trueValid) builder.attr("disabled");
                             builder.text("True valid");
                             builder.open("br");
                             builder.open("input").attr("name", "false_valid").attr("type", "checkbox");
                             if (cons.falseValid) builder.attr("checked");
                             if (cons.original && !cons.original.falseValid) builder.attr("disabled");
                             builder.text("False valid");

                             TemplateBuilder.openSimpleDialog({
                                                                  //width: 800,
                                                                  title: "Duration constraint",
                                                                  content: builder.toString(),
                                                                  callback: function (eContent) {
                                                                      var trueValid = eContent.find("input[name='true_valid']").is(':checked');
                                                                      var falseValid = eContent.find("input[name='false_valid']").is(':checked');

                                                                      if (trueValid !== cons.trueValid || falseValid !== cons.falseValid) {
                                                                          cons.trueValid = trueValid;
                                                                          cons.falseValid = falseValid;

                                                                          modelNode.modified = true;
                                                                          TemplateBuilder.redrawNode(modelNode);
                                                                      }

                                                                  }
                                                              });

                         })));

            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendNumberConstraint(cons, attrPrefix, isInteger) {
            function consToValue() {
                if (cons.list && cons.list.length > 0) {
                    return cons.list.join(",");
                } else if (cons.range) {
                    return AmInterval.toString(cons.range);
                } else {
                    return "";
                }
            }

            var td = $('<td>');
            td.append($("<span>").text(consToValue()));

            if (!cons.original || !cons.original.list || cons.original.list.length != 1) {
                var openDetails = $("<div>").attr("class", "open-details-panel");
                var button = $("<button>");
                button.attr("class", "open-details").text("...");
                button.click(function () {

                    function valueToNewCons(value) {
                        var result = {};
                        if (value.indexOf("..") >= 0) {
                            result.range = AmUtils.parseIntervalString(value);
                        } else {
                            result.list = [];
                            var tokens = value.split(",");
                            for (var i in tokens) {
                                var v = Number(tokens[i].trim());
                                if (isNaN(v)) {
                                    throw "not a number: " + v;
                                }
                                result.list.push(v);
                            }
                        }
                        return result;
                    }

                    function validateCons(c, original) {
                        if (!original) return;
                        if (original.list && original.list.length > 0) {
                            if (!c.list || c.list.length == 0) {
                                throw "Must override list of values"
                            }
                            for (var i in c.list) {
                                if (original.list.indexOf(c.list[i]) < 0) {
                                    throw "Value " + c.list[i] + " not in parent list";
                                }
                            }
                        }
                        if (original.range) {
                            if (!c.range) {
                                throw "Must override parent range";
                            }
                            if (!AmInterval.contains(AmInterval.occurrences(original.range),
                                                     AmInterval.occurrences(c.range)))
                            {
                                throw "Parent range [" + AmInterval.toString(original.range) +
                                      "] does not contain child range [" + AmInterval.toString(c.range) + "]";
                            }
                        }
                    }

                    var builder = new HtmlStringBuilder();
                    builder.open("input").attr("name", "rangeOrList").attr("value", consToValue());

                    TemplateBuilder.openSimpleDialog({
                                                         //width: 800,
                                                         title: isInteger ? "Integer constraint" : "Real constraint",
                                                         content: builder.toString(),
                                                         callback: function (eContent) {
                                                             var newCons = valueToNewCons(eContent.find('input').val());
                                                             validateCons(newCons, cons.original);
                                                             if (newCons.range) {
                                                                 newCons.range["@type"] = isInteger ? "INTERVAL_OF_INTEGER" : "INTERVAL_OF_REAL";
                                                             }
                                                             for (var prop in newCons) {
                                                                 cons[prop] = newCons[prop];
                                                             }

                                                             modelNode.modified = true;
                                                             TemplateBuilder.redrawNode(modelNode);
                                                         }
                                                     });

                });
                openDetails.append(button);
                td.append(openDetails);
            }

            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendTerminologyCodeConstraint(cons, attrPrefix) {
            var td = $("<td>");
            var span = $("<span>");
            td.append(span);

            if (cons.code_list) {
                var contained = [];
                for (var i in cons.code_list) {
                    var code = cons.code_list[i];
                    contained.push(modelNode.archetypeModel.getTermDefinitionText(code));
                }
                span.text(contained.join(", "));
                if (cons.original) {
                    var openDetails = $("<div>").attr("class", "open-details-panel");
                    var button = $("<button>").attr("class", "open-details").text("...");
                    openDetails.append(button);
                    td.append(openDetails);


                    button.click(function () {
                        var builder = new HtmlStringBuilder();
                        builder.open("table");
                        for (var i in cons.original.code_list) {
                            var code = cons.original.code_list[i];
                            builder.open("tr");
                            builder.open("td").open("input").attr("type", "checkbox").attr("data-code", code);
                            if (cons.code_list && cons.code_list.indexOf(code) >= 0) {
                                builder.attr("checked", "checked");
                            }
                            builder.close("td");
                            builder.open("td").class("node-id").text(code).close("td");
                            builder.open("td").text(modelNode.archetypeModel.getTermDefinitionText(code)).close("td");
                            builder.close("tr");
                        }
                        builder.close("table");


                        TemplateBuilder.openSimpleDialog(
                          {
                              title: "Terminology",
                              content: builder.toString(),
                              callback: function (eContent) {
                                  modelNode.modified = true;
                                  cons.code_list = [];
                                  eContent.find("input").each(function () {
                                      if (this.checked) {
                                          cons.code_list.push($(this).data("code"));
                                      }
                                  });
                                  TemplateBuilder.redrawNode(modelNode);
                              }
                          })
                    });
                    openDetails.append(button);
                    td.append(openDetails)
                }
            } else {
                span.text("(no codes defined)")
            }

            appendRowElement(makePath(attrPrefix, cons.attribute), td);
        }

        function appendConstraints(cons, attrPrefix, parentCons) {
            switch (cons.type) {
                case "tuple":
                    appendTupleConstraints(cons, attrPrefix, parentCons);
                    break;
                case "C_COMPLEX_OBJECT":
                    appendComplexObjectConstraints(cons, attrPrefix);
                    break;
                case "C_TERMINOLOGY_CODE":
                    appendTerminologyCodeConstraint(cons, attrPrefix);
                    break;
                case "C_STRING":
                    appendStringConstraint(cons, attrPrefix);
                    break;
                case "C_INTEGER":
                    appendNumberConstraint(cons, attrPrefix, true);
                    break;
                case "C_REAL":
                    appendNumberConstraint(cons, attrPrefix, false);
                    break;
                case "C_DATE_TIME":
                case "C_DATE":
                case "C_TIME":
                    appendDateTimeConstraint(cons, attrPrefix);
                    break;
                case "C_BOOLEAN":
                    appendBooleanConstraint(cons, attrPrefix);
                    break;
                case "C_DURATION":
                    appendDurationConstraint(cons, attrPrefix);
                    break;
                default:
                    appendRowString((attrPrefix || "") + cons.attribute, "<" + cons.type + ">");
            }
        }

        function getConstraintAttributes(constraint) {
            var result = {};
            var rmType = TemplateBuilder.referenceModel.model.types[constraint.rmType];
            for (var attributeName in rmType.attributes || []) {
                result[attributeName] = false;
            }

            for (var i in constraint.children || []) {
                var child = constraint.children[i];
                if (child.type === "tuple") {
                    for (var j in child.members) {
                        result[child.members[j]] = true;
                    }
                } else {
                    result[child.attribute] = true;
                }
            }
            return result;
        }

        function fillAllRmProperties(target, rmTypeName, prefix) {
            var rmType = TemplateBuilder.referenceModel.model.types[rmTypeName];

            if (rmType.attributes) {
                for (var i in rmType.attributes) {
                    var attribute = rmType.attributes[i];
                    fillAllRmProperties(target, attribute.type, makePath(prefix, attribute.name));
                }
            } else {
                target[prefix] = true;
            }
        }

        function appendInformationHeader() {
            appendHeader("Information", function () {
                TemplateBuilder.openRenameDialog(modelNode)
            });
            appendRowString("Text", modelNode.terms[modelNode.archetypeModel.defaultLanguage].text);
            appendRowString("Description", modelNode.terms[modelNode.archetypeModel.defaultLanguage].description);
        }


        targetTable.append(targetTBody);

        if (modelNode.type === "constraint") {
            if (modelNode.data && modelNode.data["@type"] === "ARCHETYPE_SLOT") {
                appendHeader("Slot");
                for (var i in modelNode.data.includes || []) {
                    appendRowString("Include", modelNode.data.includes[i].string_expression);
                }
                for (var i in modelNode.data.excludes || []) {
                    appendRowString("Include", modelNode.data.excludes[i].string_expression);
                }
            } else {
                appendHeader("Slot");
                appendRowElement("Occurrences", buildOccurrenceColumn(modelNode));

                if (modelNode.terms && modelNode.terms[modelNode.archetypeModel.defaultLanguage]) {
                    appendInformationHeader();
                }

//                var rmType = TemplateBuilder.referenceModel.model.types[modelNode.rmType];
                if (modelNode.constraints) {
                    appendHeader("Data Value");
                    appendRowString("Data Type", modelNode.constraints.rmType);
                    appendConstraints(modelNode.constraints, "");
                }

            }
        }
        function appendAnnotationsElement() {

            // lang, key, value
            function buildJoinedAnnotations() {
                var result = AmUtils.clone(modelNode.annotations) || {};
                var languages = modelNode.archetypeModel.allLanguages();
                for (var i in languages) {
                    var lang = languages[i];
                    if (!result[lang]) {
                        result[lang] = {};
                    }
                    var parentAnnotations = modelNode.archetypeModel.getAnnotation(modelNode.rmPath, lang) || {};
                    for (var key in parentAnnotations) {
                        if (!result[lang][key]) {
                            result[lang][key] = parentAnnotations[key];
                        }
                    }
                }
                return result;
            }

            function addAnnotationRow(targetTable, lang, key, value, editable) {
                var tr = $("<tr>");
                var td = $("<td>");
                input = $("<input>").data("lang", lang).data("key", key).data("field", "key").attr("name", lang + "-" + key).attr("value",
                                                                                                                                  key);
                if (!editable) {
                    input.prop("disabled", true);
                }
                td.append(input);
                tr.append(td);
                td = $("<td>");
                input = $("<input>").data("lang", lang).data("key", key).data("field", "value").attr("name", lang + "-" + key).attr("value",
                                                                                                                                    value);
                td.append(input);

                tr.append(td);
                targetTable.append(tr);
            }


            var joinedAnnotations = buildJoinedAnnotations();


            appendHeader("Annotations", function () {
                var body = $("<div>");
                var languages = modelNode.archetypeModel.allLanguages();
                for (var i in languages) {
                    var lang = languages[i];

                    var parentAnnotations = modelNode.archetypeModel.getAnnotation(modelNode.rmPath, lang) || {};

                    var langDiv = $("<div>");
                    var langHeader = $("<div>").append($("<span>").text(lang));
                    langHeader.append($("<div>").attr("class", "open-details-panel").append(
                      $("<button>").attr("class", "open-details").text("+").data("lang", lang).click(function (addAnnotationClickEvent) {
                          var lang = $(this).data("lang");
                          var langTable = body.find("table[data-lang='" + lang + "']");
                          addAnnotationRow(langTable, lang, "", "", true);
                      })
                    ));

                    langDiv.append(langHeader);

                    var langBody = $("<div>");
                    var langTable = $("<table>").attr("class", "annotations-edit-table").attr("data-lang", lang);

                    for (var key in joinedAnnotations[lang] || {}) {
                        addAnnotationRow(langTable, lang, key, joinedAnnotations[lang][key], parentAnnotations[key] === undefined);
                    }
                    langBody.append(langTable);
                    langDiv.append(langBody);
                    body.append(langDiv);
                }

                TemplateBuilder.openSimpleDialog({
                                                     title: "Annotations",
                                                     content: body,
                                                     width: 800,
                                                     callback: function (eContent) {
                                                         var tables = eContent.find("table");
                                                         var newAnnotations = {};
                                                         for (var i = 0; i < tables.length; i++) {
                                                             var table = $(tables[i]);
                                                             var lang = table.data("lang");
                                                             var parentAnnotations = modelNode.archetypeModel.getAnnotation(modelNode.rmPath,
                                                                                                                            lang) || {};

                                                             newAnnotations[lang] = {};
                                                             table.find('tr').each(function () {
                                                                 var tr = $(this);
                                                                 var inputs = tr.find('input');
                                                                 var key = $(inputs[0]).val().trim();
                                                                 var value = $(inputs[1]).val().trim();

                                                                 if (key !== "" && parentAnnotations[key] !== value) {
                                                                     newAnnotations[lang][key] = value;
                                                                 }
                                                             });
                                                         }

                                                         modelNode.annotations = newAnnotations;
                                                         modelNode.modified = true;
                                                         TemplateBuilder.redrawNode(modelNode);
                                                     }
                                                 })


            });
            for (var key in joinedAnnotations[modelNode.archetypeModel.defaultLanguage]) {
                appendRowString(key, joinedAnnotations[modelNode.archetypeModel.defaultLanguage][key]);
            }
        }

        if (modelNode.type !== "attribute") {
            appendAnnotationsElement();
        }

        appendHeader("Technical");
        appendRowString("Type", modelNode.rmType);
        appendRowString("Path", modelNode.rmPath);
        return targetTable;
    };


    self.buildTom = function () {
        function buildTemplateOverrideModel() {

            function pushChild(parent, child) {
                if (!parent.items) {
                    parent.items = [];
                }
                parent.items.push(child);
            }

            function rmPathDifferential(parent, path) {
                var patt = /\]$/;
                if (path.search(patt) >= 0) {
                    var i = path.lastIndexOf("[");
                    path = path.substring(0, i);
                }

                if (parent.type === "template" || parent.type === "archetype") {
                    return path;
                }
                return path.substring(parent.path.length);
            }

            function extractNameTerms(model) {
                return model.terms;
            }

            function addModelChildren(target, model) {
                for (var i in model.children || []) {
                    buildTom(target, model.children[i]);
                }

            }

            function buildTemplateTom(model) {
                var result = {};
                result.type = "template";
                result.rmType = model.archetypeModel.data.definition.rm_type_name;
                result.parentArchetypeId = model.archetypeModel.getArchetypeId();
                result.archetypeId = model.archetypeId;
                fillCommonItemFields(result, model);

                addModelChildren(result, model);
                return result;

            }

            function buildArchetypeTom(target, model) {
                var result = {};
                result.type = "archetype";
                result.parentArchetypeId = model.archetypeModel.getArchetypeId();
                result.archetypeId = model.archetypeId;
                result.rmType = model.archetypeModel.data.definition.rm_type_name;
                fillCommonItemFields(result, model);

                addModelChildren(result, model);

                result.path = rmPathDifferential(target, model.parent.rmPath);
                pushChild(target, result);
            }

            function fillCommonItemFields(result, model) {
                result.terms = extractNameTerms(model);
                result.nodeId = model.data.node_id;
                result.annotations = model.annotations;
                if (!AmInterval.equals(AmInterval.occurrences(model.current.occurrences),
                                       AmInterval.occurrences(model.original.occurrences)))
                {
                    result.occurrences = {
                        lower: model.current.occurrences.lower,
                        upper: model.current.occurrences.upper
                    };
                }
            }

            function buildConstraintTom(target, model) {

                if (model.modified) {
                    var result = {};
                    result.type = "item";
                    fillCommonItemFields(result, model);

                    if (model.constraints) {
                        result.constraints = model.constraints;
                    }
                    result.path = model.rmPath;
                    result.rmType = model.rmType;
                    addModelChildren(result, model);
                    result.path = rmPathDifferential(target, model.rmPath);
                    result.dataAttribute = model.dataAttribute;
                    pushChild(target, result);
                } else {
                    addModelChildren(target, model);
                }
            }

            function buildTom(target, model) {
                if (model.archetypeRoot) {
                    return buildArchetypeTom(target, model);
                } else if (model.type === "constraint") {
                    return buildConstraintTom(target, model);
                } else {
                    addModelChildren(target, model);
                }
            }


            return buildTemplateTom(self.model);
        }

        return buildTemplateOverrideModel();


    }; // buildTom

    self.saveTom = function (successCallback) {
        var tom = self.buildTom();
        jQuery.ajax({
                        'type': 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        'url': "rest/repo/tom",
                        'contentType': 'application/json',
                        'data': JSON.stringify(tom)/*,
             'dataType': 'text'*/
                    })
          .success(successCallback);
    };



    if (rootArchetypeModel) {
        self.model = buildModelDefinition(rootArchetypeModel);
    }
}
;


(function () {


    var archetypeAncestors;

    TemplateBuilder.rmTypeHoldsArchetype = function (rmType) {
        function buildArchetypeAncestors() {
            archetypeAncestors = {};
            for (var i in TemplateBuilder.archetypeRepository.infoList) {
                var info = TemplateBuilder.archetypeRepository.infoList[i];
                if (!archetypeAncestors[info.rmType]) {
                    var rmTypeModel = TemplateBuilder.referenceModel.model.types[info.rmType];
                    while (rmTypeModel) {
                        archetypeAncestors[rmTypeModel.name] = true;
                        rmTypeModel = rmTypeModel.parent ? TemplateBuilder.referenceModel.model.types[rmTypeModel.parent] : undefined;
                    }
                }
            }
        }

        if (!archetypeAncestors) {
            buildArchetypeAncestors();
        }
        return archetypeAncestors[rmType];
    };


    TemplateBuilder.openSimpleDialog = function (options) {
        options.okLabel = options.okLabel || "Ok";
        options.closeLabel = options.closeLabel || "Close";

        var builder = new HtmlStringBuilder();
        builder.open("div").attr("title", options.title);
        builder.open("div").class("dialog-content").close("div");
        builder.open("div").class("dialog-button-panel");
//        builder.open("div").class("error").html("&nbsp;").close("div");
        builder.open("button").class("btn-primary").text(options.okLabel).close("button");
        builder.open("button").class("btn-close").text(options.closeLabel).close("button");
        builder.open("span").class("error").html("&nbsp").close("span");
        builder.close("div");
        builder.close("div");
        var dialogContentStr = builder.toString();
        var dialogElement = $(dialogContentStr);
        var dialogContentElement = dialogElement.find(".dialog-content");
        dialogContentElement.append(options.content);

        dialogElement.find(".btn-close").click(function (e) {
            dialogElement.dialog('close');
        });
        dialogElement.find(".btn-primary").click(function (e) {
            try {
                var cb = options.callback(dialogContentElement);
                if (typeof cb === "string") {
                    dialogElement.find(".error").text(cb);
                } else if (cb === true || cb === undefined) {
                    dialogElement.dialog('close');
                } else {
                    dialogElement.find(".error").html("&nbsp;");
                }
            } catch (e) {
                if (typeof e === "string") {
                    dialogElement.find(".error").html(e);
                } else {
                    throw e;
                }
            }
        });

        dialogElement.dialog({
                                 autoResize: true,
                                 width: options.width,
                                 height: options.height,
                                 modal: true,
                                 close: function () {
                                     dialogElement.dialog('destroy');
                                 }
                             });
    };


    TemplateBuilder.displayPropertiesPanel = function (modelNode) {
        var htmlElement = TemplateBuilder.templateModel.buildPropertiesPanelElement(modelNode);
        $('#propertiesPanelContainer').empty().append(htmlElement);
    };

    TemplateBuilder.redrawNode = function (modelNode, ttNode) {
        if (!ttNode) {
            ttNode = $('#templateTreeTable').treetable("node", modelNode.id);
        }
        var htmlValueNode = ttNode.treeCell.find(".context-menu-template-value");
        htmlValueNode.html(TemplateBuilder.templateModel.buildNodeValueString(modelNode));
        if (ttNode.row.hasClass('selected')) {
            TemplateBuilder.displayPropertiesPanel(modelNode);
        }
    };

    TemplateBuilder.openRenameDialog = function (modelNode) {
        var builder = new HtmlStringBuilder();

        var allLanguages = [modelNode.archetypeModel.defaultLanguage];
        var defaultTerm = modelNode.terms[modelNode.archetypeModel.defaultLanguage];
        allLanguages = allLanguages.concat(modelNode.archetypeModel.translations);

        builder.open("table").class("rename-dialog-table");
        builder.open("tr");
        builder.open("th").text("language").close("th");
        builder.open("th").text("text").close("th");
        builder.open("th").text("description").close("th");
        builder.close("tr");

        for (var lindex in allLanguages) {
            var lang = allLanguages[lindex];
            builder.open("tr");
            builder.open("td").text(lang).close("td");
            var t = modelNode.terms[lang];

            var ph = t && t.text ? t.text
              : defaultTerm.text + " (" + modelNode.archetypeModel.defaultLanguage + ")";
            builder.open("td").open("input").class("rename-dialog-input")
              .attr("data-lang", lang).attr("data-field", "text").attr("value", ph).close("td");

            ph = t && t.description ? t.description
              : defaultTerm.description + " (" + modelNode.archetypeModel.defaultLanguage + ")";

            builder.open("td")
              .open("input").class("rename-dialog-input")
              .attr("data-lang", lang).attr("data-field", "description").attr("value", ph)
              .close("td");
            builder.close("tr");
        }
        builder.close("table");

        TemplateBuilder.openSimpleDialog({
                                             width: 800,
                                             title: "Name",
                                             content: builder.toString(),
                                             callback: function (eContent) {
                                                 eContent.find('input').each(function () {
                                                     var input = $(this);
                                                     var lang = input.data("lang");
                                                     var field = input.data("field");
                                                     var value = input.val().trim();

                                                     if (!modelNode.terms[lang]) {
                                                         modelNode.terms[lang] = {};
                                                     }
                                                     modelNode.terms[lang][field] = value;

                                                 });
                                                 modelNode.modified = true;
                                                 TemplateBuilder.redrawNode(modelNode);
                                             }
                                         });
    };

    TemplateBuilder.openLoadTemplateDialog = function () {
        $.getJSON("rest/repo/tom").success(function (templates) {
            var builder = new HtmlStringBuilder();
            builder.open("label").text("Template").close("label");
            builder.open("select").class("input-block-level");
            for (var ti in templates) {
                var templateInfo = templates[ti];
                builder.open("option").attr("value", templateInfo.templateId).text(templateInfo.name).close("option");
            }
            builder.close("select");

            TemplateBuilder.openSimpleDialog({
                                                 title: "Load template",
                                                 content: builder.toString(),
                                                 callback: function (eContent) {
                                                     var templateId = eContent.find("select").val();
                                                     TemplateBuilder.loadTemplate(templateId);
                                                 }
                                             });


        });
    };

    TemplateBuilder.exportOpt14 = function () {
        if (!TemplateBuilder.templateModel) return;

        TemplateBuilder.templateModel.saveTom(function () {
            var templateId = TemplateBuilder.templateModel.model.archetypeId;
            var url = "rest/repo/export/opt/14/" + encodeURIComponent(templateId);

            document.location = url;
        })
    };

    TemplateBuilder.exportAdltSource = function () {
        if (!TemplateBuilder.templateModel) return;

        TemplateBuilder.templateModel.saveTom(function () {
            var templateId = TemplateBuilder.templateModel.model.archetypeId;
            var url = "rest/repo/export/adlt/" + encodeURIComponent(templateId);

            document.location = url;
        })
    };


    TemplateBuilder.loadTemplate = function (templateId) {

        $.getJSON("rest/repo/tom/" + encodeURIComponent(templateId)).success(
          function (templateTom) {
              var presentParentArchetypes = {};

              function addToPresentArchetypes(tom) {
                  if (tom.type === "template" || tom.type === "archetype") {
                      presentParentArchetypes[tom.parentArchetypeId] = true;
                  }
                  for (var i in tom.items || []) {
                      addToPresentArchetypes(tom.items[i]);
                  }
              }

              addToPresentArchetypes(templateTom);

              var latch = new CountdownLatch(Object.keys(presentParentArchetypes).length);
              var parentArchetypes = {};
              for (var parentArchetypeId in presentParentArchetypes) {
                  $.getJSON("rest/repo/archetype/" + encodeURIComponent(parentArchetypeId) + "/flat").success(function (data) {
                      parentArchetypes[data.archetype_id.value] = new AOM.ArchetypeModel(data);
                      latch.countDown();
                  });
              }

              latch.execute(function () {

                  var templateModel = new TemplateBuilder.TemplateModel();

                  function pathToSegments(rmPath) {
                      if (rmPath.charAt(0) === "/") {
                          rmPath = rmPath.substring(1);
                      }
                      var segmentsStrings = rmPath.split("/");
                      var result = [];
                      for (var i in segmentsStrings) {
                          var segmentString = segmentsStrings[i];
                          var braceStart = segmentString.indexOf("[");
                          var braceEnd = segmentString.indexOf("]");
                          if (braceStart >= 0) {
                              result.push({
                                              attribute: segmentString.substring(0, braceStart),
                                              nodeId: segmentString.substring(braceStart + 1, braceEnd)
                                          })
                          } else {
                              result.push({
                                              attribute: segmentString
                                          })
                          }
                      }
                      return result;

                  }

                  function findModelNodeChild(modelNode, rmPath, acceptAttribute) {
                      var segments = pathToSegments(rmPath);

                      segmentLoop:
                        for (var i in segments) {
                            var segment = segments[i];
                            for (var j in modelNode.children) {
                                var candidateAttr = modelNode.children[j];
                                if (segment.attribute === candidateAttr.original.name) {
                                    if (acceptAttribute && i == segments.length - 1 && segment.node_id === undefined) {
                                        return candidateAttr;
                                    }
                                    for (var k in candidateAttr.children) {
                                        var candidate = candidateAttr.children[k];
                                        if (segment.nodeId === undefined || segment.nodeId === candidate.data.node_id) {
                                            modelNode = candidate;
                                            continue segmentLoop;
                                        }
                                    }
                                }
                            }
                            throw "Could not find rm path " + rmPath;
                        }
                      return modelNode;
                  }

                  function applyRestrictions(tom, modelNode) {
                      modelNode.modified = true;
                      if (tom.archetypeId) {
                          modelNode.archetypeId = tom.archetypeId;
                      }
                      modelNode.terms = tom.terms;
                      modelNode.current.name = modelNode.terms[modelNode.archetypeModel.defaultLanguage].text;
                      if (tom.annotations) modelNode.annotations = tom.annotations;

                      for (var i in tom.items || []) {
                          var itemTom = tom.items[i];
                          var rmPath = itemTom.nodeId ? itemTom.path + "[" + itemTom.nodeId + "]" : itemTom.path;
                          var childModelNode = findModelNodeChild(modelNode, rmPath, itemTom.type === "archetype");
                          if (itemTom.type === "archetype") {
                              if (!childModelNode.children) {
                                  childModelNode.children = [];
                              }
                              var newModelNode = buildArchetype(itemTom);
                              childModelNode.children.push(newModelNode);
                              newModelNode.parent = childModelNode;

                          } else {
                              applyRestrictions(itemTom, childModelNode);
                          }
                      }

                      if (tom.constraints) {
                          modelNode.constraints = tom.constraints;
                      }

                      if (tom.occurrences) {
                          modelNode.current.occurrences.lower = tom.occurrences.lower;
                          modelNode.current.occurrences.upper = tom.occurrences.upper;
                      }
                  }

                  function buildArchetype(tom) {
                      var modelNode = templateModel.buildModelDefinition(parentArchetypes[tom.parentArchetypeId]);
                      applyRestrictions(tom, modelNode);
                      return modelNode;
                  }

                  var modelNode = buildArchetype(templateTom);
                  templateModel.model = modelNode;

                  TemplateBuilder.displayTemplate(templateModel);
              });


          });
    };

    TemplateBuilder.displayTemplate = function (templateModel) {
        var rowsString = templateModel.buildTableRows(templateModel.model);
        $("#templateTreeTable").find("tbody").html(rowsString);
        $("#templateTreeTable").treetable({expandable: true}, true);

        $("#templateTreeTable tbody").on("mousedown", "tr", function (e) {
            $(".selected").not(this).removeClass("selected");
            $(this).addClass("selected");

            var nodeTtId = $(this).data("tt-id");
            var node = $('#templateTreeTable').treetable("node", nodeTtId);
            var modelNode = TemplateBuilder.templateModel.getNode(nodeTtId);
            TemplateBuilder.displayPropertiesPanel(modelNode);
        });

        TemplateBuilder.templateModel = templateModel;
    };

    TemplateBuilder.init = function (options) {


        function initializePage() {

            function initializeNewTemplateDialog() {
                $("#newTemplateDialog").dialog({autoOpen: false, width: 600, height: 270});
                var compositionList = TemplateBuilder.archetypeRepository.infoList.filter(function (el) {
                    return el.rmType === "COMPOSITION";
                });

                var builder = new HtmlStringBuilder();
                for (var i in compositionList) {
                    var c = compositionList[i];
                    builder.open("option").attr("value", c.archetypeId).text(c.name).close("option");
                }
                $("#newTemplateDialogSpecializesArchetype").html(builder.toString());
                TemplateBuilder.openNewTemplateDialog = function () {
                    $("#newTemplateDialogOk").unbind("click").click(function () {
                        $("#newTemplateDialog").dialog("close");

                        var parentArchetypeId = $('#newTemplateDialogSpecializesArchetype').val();
                        $.getJSON("rest/repo/archetype/" + encodeURIComponent(parentArchetypeId) + "/flat").success(function (data) {
                            var parentArchetypeModel = new AOM.ArchetypeModel(data);
                            var templateModel = new TemplateBuilder.TemplateModel(parentArchetypeModel);
                            TemplateBuilder.displayTemplate(templateModel);
                        });

                    });

                    $("#newTemplateDialog").dialog("open");
                };
            }

            function initializeIncludeArchetypeDialog() {
                $("#includeArchetypeDialog").dialog({autoOpen: false, width: 600, height: 270});
                TemplateBuilder.openIncludeArchetypeDialog = function (ttNode, modelNode) {
                    var addableArchetypes = TemplateBuilder.templateModel.getAddableArchetypes(modelNode);
                    addableArchetypes.sort(function (a, b) {
                        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                    });
                    var builder = new HtmlStringBuilder();
                    for (var i in addableArchetypes) {
                        var a = addableArchetypes[i];
                        builder.open("option").attr("value", a.archetypeId).text(a.name).close("option");
                    }
                    $("#includeArchetypeId").html(builder.toString());
                    $("#includeArchetypeDialogOk").unbind("click").click(function () {
                        $("#includeArchetypeDialog").dialog("close");
                        var addedArchetypeId = $('#includeArchetypeId').val();

                        $.getJSON("rest/repo/archetype/" + encodeURIComponent(addedArchetypeId) + "/flat").success(function (data) {
                            var archetypeModel = new AOM.ArchetypeModel(data);
                            var childModel = TemplateBuilder.templateModel.buildModelDefinition(archetypeModel);
                            TemplateBuilder.templateModel.addChild(modelNode, childModel);
                            var rowsStr = TemplateBuilder.templateModel.buildTableRows(childModel);
                            $("#templateTreeTable").treetable("loadBranch", ttNode, rowsStr);
                            $("#templateTreeTable").treetable("expandNode", ttNode.id);
                            $("#templateTreeTable").treetable("collapseNode", childModel.id);
                        });

                    });
                    $("#includeArchetypeDialog").dialog("open");
                }
            }

            function initializeContextMenu() {
                $(function () {
                    $.contextMenu({
                                      selector: '.context-menu-template-node',
                                      build: function ($trigger, e) {
                                          var nodeTtId = $(e.currentTarget.parentElement).data("tt-id");
                                          var node = $('#templateTreeTable').treetable("node", nodeTtId);
                                          var modelNode = TemplateBuilder.templateModel.getNode(nodeTtId);

                                          var result = {
                                              callback: function (key, options) {
                                                  switch (key) {
                                                      case "rename":
                                                      {
                                                          TemplateBuilder.openRenameDialog(modelNode);
                                                          break;
                                                      }
                                                      case "add_archetype":
                                                      {
                                                          TemplateBuilder.openIncludeArchetypeDialog(node, modelNode);
                                                          break;
                                                      }
                                                  }
                                              },
                                              items: {}
                                          };

                                          if (modelNode.type === "constraint") {
                                              result.items["rename"] = {"name": "Rename"}
                                          }

                                          if (TemplateBuilder.templateModel.canAddArchetype(modelNode)) {
                                              result.items["add_archetype"] = {"name": "Add archetype"}
                                          }

                                          if (modelNode.type === "constraint") {


                                              function createSetOccurrenceCallback(occurrence) {
                                                  return function (e) {
                                                      $(".context-menu-root").contextMenu("hide");
                                                      if (TemplateBuilder.templateModel.getOccurrenceType(modelNode, occurrence) ===
                                                          "current") return;

                                                      TemplateBuilder.templateModel.setOccurrences(modelNode, occurrence);
                                                      TemplateBuilder.redrawNode(modelNode, node);
                                                  }
                                              }

                                              function addOccurrenceRadio(key, name, occurrence) {
                                                  var type = TemplateBuilder.templateModel.getOccurrenceType(modelNode, occurrence);
                                                  if (type === "current" || type === "valid") {
                                                      result.items[key] = {
                                                          "name": name,
                                                          "type": "radio",
                                                          "value": key,
                                                          selected: type === "current",
                                                          events: {click: createSetOccurrenceCallback(occurrence)}
                                                      }
                                                  }

                                              }

                                              if (Object.keys(result).length > 0) {
                                                  result.items["sep1"] = "---------";

                                              }
                                              addOccurrenceRadio("occurrence_optional", "Optional",
                                                                 TemplateBuilder.occurrence_optional);
                                              addOccurrenceRadio("occurrence_mandatory", "Mandatory",
                                                                 TemplateBuilder.occurrence_mandatory);
                                              addOccurrenceRadio("occurrence_unbounded", "Unbounded",
                                                                 TemplateBuilder.occurrence_unbounded);
                                              addOccurrenceRadio("occurrence_deleted", "Removed",
                                                                 TemplateBuilder.occurrence_deleted);
                                          }
                                          return result;
                                      }
                                  });
                });
            }

            initializeNewTemplateDialog();
            initializeIncludeArchetypeDialog();
            initializeContextMenu();
        }


        var subsystems = 2;
        var callback = function () {
            subsystems--;
            if (subsystems <= 0) {
                initializePage();
            }
        };


        TemplateBuilder.referenceModel = new AOM.ReferenceModel(callback);
        TemplateBuilder.archetypeRepository = new AOM.ArchetypeRepository(callback);
    };

})();