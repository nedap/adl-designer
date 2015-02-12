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

AOM = (function (AOM) {

    function extend(childClass, parentClass) {
        childClass.prototype = Object.create(parentClass.prototype);
        childClass.prototype.constructor = childClass;
    }

    var CObjectMixin = function (cons) {
        var self = this;
        self.cons = cons;
    };

    var CDefinedObjectMixin = function (cons) {
        var self = this;
        CObjectMixin.call(self, cons);

    };
    extend(CDefinedObjectMixin, CObjectMixin);

    var CPrimitiveObjectMixin = function (cons) {
        var self = this;
        CDefinedObjectMixin.call(self, cons);
    };
    extend(CPrimitiveObjectMixin, CDefinedObjectMixin);

    var COrderedMixin = function (cons) {
        var self = this;
        CPrimitiveObjectMixin.call(self, cons);

    };
    extend(COrderedMixin, CPrimitiveObjectMixin);

    var CStringMixin = function (cons) {
        var self = this;
        COrderedMixin.call(self, cons);


    };
    extend(CStringMixin, COrderedMixin);

    var CTerminologyCodeMixin = function (cons) {
        var self = this;
        CPrimitiveObjectMixin.call(self, cons);


    };
    extend(CTerminologyCodeMixin, CPrimitiveObjectMixin);

    var mixinClasses = {
        "C_STRING": CStringMixin,
        "C_TERMINOLOGY_CODE": CTerminologyCodeMixin
    }


}(AOM));