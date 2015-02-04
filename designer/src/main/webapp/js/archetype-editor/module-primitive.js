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

    var PrimitiveModule = function () {
        var self = this;
        self.name = ""; // empty string stands for primitives

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
            };

            handler.updateConstraint = function (archetypeModel, context, cons, errors) {
                if (typeof context.assumed_value==="string" && context.assumed_value.length>0) {
                    cons.assumed_value = parseFloat(context.assumed_value);
                    errors.validate(!isNaN(cons.assumed_value), "Invalid number", "assumed_value" );
                }

                if (context.range === "" || context.range === "(*..*)") {
                    context.range = undefined;
                } else {
                    cons.range = AmInterval.parseContainedString(context.range, "INTERVAL_OF_REAL");
                    errors.validate(cons.range, "Invalid interval", "range");
                    if (cons.range && cons.range.upper === undefined && cons.range.lower === undefined) cons.range = undefined;
                }
                return cons;
            };

            return handler;
        }();
    };

    ArchetypeEditor.addRmModule(new PrimitiveModule());
}());