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

    ArchetypeEditor.CommonModule = {
        createCommonContext: function (stage, cons) {
            cons = cons || {};
            var context = {
                "panel_id": GuiUtils.generateId(),
                "type": cons.rm_type_name
            };
            return context;
        }
    };

    var CommonModule = function () {
        var self = this;
        self.name = "@common"; // stands for common module


        self.handlers = {};
        self.handlers["top"] = new function () {
            var handler = this;
            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var context = ArchetypeEditor.CommonModule.createCommonContext(stage, cons);
                context.node_id = cons.node_id;
                context.type = "top";
                context.occurrences = (cons.occurrences) ? AmInterval.toContainedString(cons.occurrences) : "(*..*)";
                if (parentCons) {
                    context.parent = handler.createContext(stage, parentCons);
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate("properties/constraint-common|top", context, targetElement);
            };

            handler.updateContext = function (stage, context, targetElement) {
                var occStr = targetElement.find('#' + context.panel_id + "_occurrences").val();
                context.occurrences = occStr;
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                cons.occurrences = errors.validate(
                    AmInterval.parseContainedString(context.occurrences, "MULTIPLICITY_INTERVAL"),
                    "Invalid occurrences format", "occurrences");
            };

            return handler;
        }();

        self.handlers["main"] = new function () {
            var handler = this;
            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var context = ArchetypeEditor.CommonModule.createCommonContext(stage, cons);
                var topHandler = stage.archetypeEditor.getRmTypeHandler("top", "@common");
                var constraintHandler = stage.archetypeEditor.getRmTypeHandler(cons.rm_type_name);
                context.type = "main";
                context.top = topHandler.createContext(stage, cons, parentCons);
                if (constraintHandler) {
                    context.constraint = constraintHandler.createContext(stage, cons, parentCons);
                }

                return context;
            };

            handler.show = function (stage, context, targetElement) {
                GuiUtils.applyTemplate("properties/constraint-common|main", context, function (html) {
                    html = $(html);
                    targetElement.append(html);

                    stage.archetypeEditor.applySubModules(stage, html, context);

                });
            };

            handler.updateContext = function (stage, context, targetElement) {
                stage.archetypeEditor.applySubModulesUpdateContext(stage, targetElement, context);
                //var topHandler = stage.archetypeEditor.getRmTypeHandler("top", "@common");
                //topHandler.updateContext(stage, context, targetElement);
                //if (context.constraint) {
                //    var constraintHandler = stage.archetypeEditor.getRmTypeHandler(context.constraint.type);
                //    constraintHandler.updateContext(stage, context, targetElement);
                //}
            };

            handler.updateConstraint = function (stage, context, cons, errors) {
                var topHandler = stage.archetypeEditor.getRmTypeHandler("top", "@common");
                topHandler.updateConstraint(stage, context.top, cons, errors);
                if (context.constraint) {
                    var constraintHandler = stage.archetypeEditor.getRmTypeHandler(context.constraint.type);
                    constraintHandler.updateConstraint(stage, context.constraint, cons, errors);
                }
            };

            return handler;
        }();

    };

    ArchetypeEditor.addRmModule(new CommonModule());
}(ArchetypeEditor));