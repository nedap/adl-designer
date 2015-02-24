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

    ArchetypeEditor.Modules = {};

    /**
     * Base object for rm handlers.
     * @abstract
     * @constructor
     */
    ArchetypeEditor.Modules.RmHandler = function () {
        var handler = this;

        handler.createCommonContext = function(stage, cons) {
            cons = cons || {};
            var context = {
                "panel_id": GuiUtils.generateId(),
                "type": cons.rm_type_name
            };
            return context;
        };

        /**
         * Creates context (a gui model from existing or new constrains)
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {object} cons Object for which to create the context. undefined if it does not exist yet
         * @param {object?} parentCons Matching constraint in the parent archetype, if available
         * @returns {object} context
         */
        handler.createContext = function (stage, cons, parentCons) {
        };

        /**
         * Displays the gui and populates it with the values of the context
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {object} context contains values to populate the gui
         * @param targetElement jquery element where the gui will be displayed
         */
        handler.show = function (stage, context, targetElement) {
        };

        /**
         * Optional function that can perform cleanup just before the panel is destroyed.
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {object} context contains values to populate the gui
         * @param targetElement jquery element where the gui is displayed
         */
        handler.hide = function (stage, context, targetElement) {
        };

        /** Updates context values from the current gui values
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param context
         * @param targetElement
         */
        handler.updateContext = function (stage, context, targetElement) {
        };

        /**
         * Validates a context
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param {context} context context to validate.
         * @param {AmUtils.Errors} errors Target for any validation errors
         */
        handler.validate = function (stage, context, errors) {
        };

        /**
         * Updates constraint values from the context values. Also performs validation.
         *
         * @param {object} stage contains caller persistent information, such as archetypeModel and archetypeEditor
         * @param context contains values that are to be copied on the context
         * @param cons target constrains where the context values will be written
         */
        handler.updateConstraint = function (stage, context, cons) {
        };

    };



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

        var CommonRmHandler = function() {
            var handler = this;
            ArchetypeEditor.Modules.RmHandler.call(handler);

        };
        AmUtils.extend(CommonRmHandler, ArchetypeEditor.Modules.RmHandler);


        var TopCommonHandler = function () {
            var handler = this;
            CommonRmHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var context = handler.createCommonContext(stage, cons);
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
        };
        AmUtils.extend(TopCommonHandler, CommonRmHandler);

        var MainCommonHandler = function() {
            var handler = this;
            CommonRmHandler.call(handler);

            handler.createContext = function (stage, cons, parentCons) {
                cons = cons || {};
                var context = handler.createCommonContext(stage, cons);
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
            };

            handler.validate = function (stage, context, errors) {
                var topHandler = stage.archetypeEditor.getRmTypeHandler("top", "@common");
                topHandler.validate(stage, context, errors);
                if (context.constraint) {
                    var constraintHandler = stage.archetypeEditor.getRmTypeHandler(context.constraint.type);
                    constraintHandler.validate(stage, context.constraint, errors);
                }
            };

            handler.updateConstraint = function (stage, context, cons) {
                var topHandler = stage.archetypeEditor.getRmTypeHandler("top", "@common");
                topHandler.updateConstraint(stage, context.top, cons);
                if (context.constraint) {
                    var constraintHandler = stage.archetypeEditor.getRmTypeHandler(context.constraint.type);
                    constraintHandler.updateConstraint(stage, context.constraint, cons);
                }
            };
        };
        AmUtils.extend(MainCommonHandler, CommonRmHandler);

        self.handlers = {};
        self.handlers["top"] = new TopCommonHandler();
        self.handlers["main"] = new MainCommonHandler()

    };

    ArchetypeEditor.addRmModule(new CommonModule());
}(ArchetypeEditor));