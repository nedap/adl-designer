var AmView = {


    addDefinitionTableRows: function(archetypeModel, targetTBodyElement) {
        var builder = new HtmlStringBuilder();

        function buildModelDefinition() {
            var modelNodeIndex = 0;

            function parseConstraint(c) {
                var result = {
                    type: "constraint",
                    id: "c_" + (modelNodeIndex++),
                    rmName: c.rm_type_name,
                    data: c
                };

                var meaning = archetypeModel.getTermDefinitionText(c.node_id);
                if (meaning) {
                    result.meaning = meaning;
                }

                if (c.attributes) {
                    result.children = [];
                    for (var i in c.attributes) {
                        var resultAttr = parseAttribute(c.attributes[i]);
                        resultAttr.parent = result;
                        result.children.push(resultAttr);
                    }
                }
                return result;
            }

            function parseAttribute(a) {
                var result = {
                    type: "attribute",
                    id: "a_" + (modelNodeIndex++),
                    rmName: a.rm_attribute_name,
                    data: a
                };

                if (a.children) {
                    result.children = [];
                    for (var i in a.children) {
                        var resultChild = parseConstraint(a.children[i]);
                        resultChild.parent = result;
                        result.children.push(resultChild);
                    }
                }
                return result;
            }

            return parseConstraint(archetypeModel.data.definition);

        }

        function buildCardinalityOrOccurrenceString(model) {
            function buildOccurrenceString(occ) {
                if (!occ) return "";
                if (occ.lower_unbounded && occ.upper_unbounded) return "*";
                if (occ.lower!=undefined && occ.lower===occ.upper) {
                    return String(occ.lower);
                }
                return (occ.lower?String(occ.lower):"0") + ".." + (occ.upper?String(occ.upper):"*");
            }

            if (model.type==="attribute") {
                if (model.data.cardinality) {
                    var occ = buildOccurrenceString(model.data.cardinality.interval);
                    if (model.data.cardinality.is_ordered) {
                        occ += "; ordered";
                    } else {
                        occ += "; unordered";
                    }
                    if (model.data.cardinality.is_unique) {
                        occ += "; unique";
                    }
                    return occ;
                } else {
                    return "";
                }
            } else {
                return buildOccurrenceString(model.data.occurrences);
            }
        }

        function buildConstraintString(model) {
            if (model.type==="constraint") {
                if (model.rmName==="C_TERMINOLOGY_CODE" || model.rmName==="CODE_PHRASE") {
                    if (model.data.code_list) {
                        var result="";
                        for (var i in model.data.code_list) {
                            var term = archetypeModel.getTermDefinitionText(model.data.code_list[i]);
                            result += (term?term:"?")+"\n";
                        }
                        return result;
                    }
                } else if (model.rmName==="C_DATE_TIME") {
                    if (model.data.pattern) {
                        return model.data.pattern;
                    }
                }
            }
            return "";
        }

        function addRows(model) {
            builder.open("tr").attr("data-tt-id", model.id);
            if (model.parent) {
                builder.attr("data-tt-parent-id", model.parent.id);
            }
            builder.open("td").text(model.rmName).close("td");
            builder.open("td").text(model.meaning).close("td");
            builder.open("td").text(buildCardinalityOrOccurrenceString(model)).close("td");
            builder.open("td").text(buildConstraintString(model)).close("td");
            builder.close("tr");
            if (model.children) {
                for (var i in model.children) {
                    addRows(model.children[i]);
                }
            }
        }


        addRows(buildModelDefinition());

        targetTBodyElement.html(builder.toString());
    },

    addTermDefinitionTableRows: function(archetypeModel, definitions, targetTBodyElement) {
        if (!definitions) return;
        var builder = new HtmlStringBuilder();

        for (var code in definitions) {
            var definition = definitions[code][archetypeModel.defaultLanguage];
            builder.open("tr");
            builder.open("td").text(code).close("td");
            builder.open("td").text(definition.text).close("td");
            builder.open("td").text(definition.description).close("td");
            builder.close("tr");
        }
        targetTBodyElement.html(builder.toString());
    }


};