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
    var my=AOM;

    my.newCAttribute = function(name) {
        return {
            "@type": "C_ATTRIBUTE",
            rm_attribute_name: name,
            multiplicity: AmInterval.of(1,1, "MULTIPLICITY_INTERVAL")
        };
    };

    my.newCAttributeTuple = function(attributeNames) {
        var result = {
            "@type": "C_ATTRIBUTE_TUPLE",
            members: [],
            children: []
        };

        for (var i in attributeNames) {
            var attribute = my.newCAttribute(attributeNames[i]);
            result.members.push(attribute);
        }
        return result;
    };

    my.newCObjectTuple = function(memberConstrains) {
        var result = {
            "@type": "C_OBJECT_TUPLE",
            members: []
        };

        for (var i in memberConstrains) {
            result.members.push(memberConstrains[i]);
        }
        return result;
    };

    /**
     * Creates new C_COMPLEX_OBJECT
     * @param {string} rmType rm type
     * @param {string?} node_id
     * @param {object?} occurrences - rm occurrences
     * @returns {object} C_COMPLEX_OBJECT
     */
    my.newCComplexObject = function(rmType, node_id, occurrences) {
        var result = {
            "@type": "C_COMPLEX_OBJECT",
            rm_type_name: rmType,
            attributes: [],
            attribute_tuples: [],
            node_id: node_id,
            occurrences: occurrences
        };
        return result;
    };

    /**
     * Creates new C_STRING constraint
     * @param {string[]?} list valid values list
     * @returns {object} C_STRING constraint
     */
    my.newCString = function(list) {
        var result = {
            "@type": "C_STRING",
            rm_type_name: "C_STRING",
            list: list||[],
            occurrences: AmInterval.of(1,1, "MULTIPLICITY_INTERVAL")
        };
        return result;
    };

    /**
     * Creates new C_INTEGER constraint
     * @param {number[]?} list valid values list
     * @returns {object} C_INTEGER constraint
     */
    my.newCInteger = function(list) {
        var result = {
            "@type": "C_INTEGER",
            rm_type_name: "C_INTEGER",
            list: list||[],
            occurrences: AmInterval.of(1,1, "MULTIPLICITY_INTERVAL")
        };
        return result;
    };

    /**
     * Creates new C_TERMINOLOGY_CODE constraint
     * @returns {object} C_TERMINOLOGY_CODE constraint
     */
    my.newCTerminologyCode = function() {
        var result = {
            "@type": "C_TERMINOLOGY_CODE",
            rm_type_name: "C_TERMINOLOGY_CODE",
            occurrences: AmInterval.of(1,1, "MULTIPLICITY_INTERVAL")
        };
        return result;
    };
    /**
     * Creates new C_BOOLEAN constraint
     * @returns {object} C_BOOLEAN constraint
     */
    my.newCBoolean = function() {
        var result = {
            "@type": "C_BOOLEAN",
            rm_type_name: "C_BOOLEAN",
            occurrences: AmInterval.of(1,1, "MULTIPLICITY_INTERVAL")
        };
        return result;
    };


    return my;
}(AOM));