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

/** HtmlStringBuilder class for fast html string concatenation */
function HtmlStringBuilder() {
    var builder = this;
    var buffer = [];
    var inElement = false;
    var classes = [];

    function finalizeCurrentTag() {
        if (inElement) {
            if (classes.length > 0) {
                builder.attr("class", classes.join(" "));
                classes = [];
            }
            buffer.push(">");
            inElement = false;
        }
    }

    this.html = function (string) {
        finalizeCurrentTag();
        buffer.push(string);
        return builder;
    };

    this.text = function (string) {
        finalizeCurrentTag();
        if (string === undefined) return builder;

        buffer.push(String(string).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'));
        return builder;
    };

    this.open = function (tag) {
        finalizeCurrentTag();
        buffer.push("<");
        buffer.push(tag);
        inElement = true;
        return builder;
    };

    this.close = function (tag) {
        finalizeCurrentTag();
        if (tag) {
            buffer.push("</");
            buffer.push(tag);
            buffer.push(">");
        }
        return builder;
    };

    this.attr = function (name, value) {
        buffer.push(" " + name);
        if (value) {
            buffer.push('="');
            buffer.push(String(value).replace('"', '\\"'));
            buffer.push('"');
        }
        return builder;
    };

    this.class = function (cls) {
        if (cls) {
            classes.push(cls)
        }
        return builder;
    };

    this.toString = function toString() {
        finalizeCurrentTag();
        return buffer.join("");
    };
}


AmUtils = {
    buildIntervalString: function (interval) {
        if (!interval) return "";
        return (interval.lower ? String(interval.lower) : "0") + ".." + (interval.upper != undefined ? String(interval.upper) : "*");
    },

    parseIntervalString: function (text) {
        var occ = {
            "lower_included": true,
            "upper_included": true,
            "lower_unbounded": false,
            "upper_unbounded": false
        };
        var splits = text.split("..");
        if (splits.length != 2) return undefined;
        if (splits[0] === "0") {
            occ.lower_unbounded = true;
            occ.lower_included = true;
        } else {
            occ.lower = parseInt(splits[0]);
            if (occ.lower === undefined) return undefined;
        }
        if (splits[1] === "*") {
            occ.upper_unbounded = true;
            occ.upper_included = false;
        } else {
            occ.upper = parseInt(splits[1]);
            if (occ.upper === undefined) return undefined;
        }

        if (occ.lower != undefined && occ.upper != undefined && occ.lower > occ.upper) return undefined;
        return occ;
    },

    getPathSegments: function (path) {
        if (Array.isArray(path)) {
            return path;
        }

        if (path.length > 0 && path.charAt(0) === "/") {
            path = path.substring(1);
        }
        var result = [];
        for (var pathPart in path.split("/")) {
            var spos = pathPart.indexOf("[");
            if (spos >= 0) {
                var epos = pathPart.lastIndexOf("]", spos + 1);
                var segment = {};
                segment.attribute = pathPart.substr(0, spos);
                segment.nodeId = pathPart.substr(spos + 1, epos).trim();
                result.push(segment);
            } else {
                result.push({attribute: pathPart});
            }
        }
        return result;

    },

    pathMatches: function (path, candidate) {

        function segmentMatches(path, candidate) {
            if (path.attribute !== candidate.attribute) return false;
            if (path.nodeId !== undefined) {
                if (path.nodeId !== candidate.nodeId) return false;
            }
            return true;
        }

        path = AmUtils.getPathSegments(path);
        candidate = AmUtils.getPathSegments(candidate);

        if (path.length != candidate.length) return false;
        for (var i in path) {
            if (!segmentMatches(path[i], candidate[i])) return false;
        }
        return true;
    },

    clone: function (what) {
        if (what === undefined || what === null) return what;
        if (typeof what === "object") {
            if (Array.isArray(what)) {
                var result = [];
                for (var i in what) {
                    result.push(AmUtils.clone(what[i]));
                }
                return result;
            } else {
                return jQuery.extend(true, {}, what);
            }
        }
        return what;
    },

    // string of 4 random characters
    random4: function () {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    },

    random8: function () {
        return AmUtils.random4() + AmUtils.random4();
    }
};


// usage: new AmInterval(intervalObject) or new AmInterval(loNumber, hiNumber)

var AmInterval = {
    of: function (lo, hi) {
        var result = {
            lower: lo,
            upper: hi
        };
        result.lower_included = typeof a != "undefined";
        result.lower_included = typeof b != "undefined";
        return result;
    },

    occurrences: function (self) {
        if (self.lower === undefined) {
            self.lower = 0;
        }
        return self;
    },

    contains: function (self, o) {

        function containsInterval(other) {
            var low1 = self.lower, low2 = other.lower, hi1 = self.upper, hi2 = other.upper;

            if (low1 !== undefined) {
                if (low2 === undefined || low2 < low1) return false;
                if (!self.lower_included && other.lower_included && low2 === low1) return false;
            }
            if (hi1 != undefined) {
                if (hi2 === undefined || hi2 > hi1) return false;
                if (!self.upper_included && other.upper_included && hi2 === hi1) return false;
            }

            return true;
        }

        function containsValue(value) {
            if (typeof self.lower !== "undefined") {
                if (value < self.lower) return false;
                if (value === self.lower && !self.lower_included) return false;
            }

            if (typeof self.upper !== "undefined") {
                if (value > self.upper) return false;
                if (value === self.upper && !self.upper_included) return false;
            }
            return true;
        }

        if (typeof o === "object") {
            return containsInterval(o);
        } else if (typeof o === "number") {
            return containsValue(o);
        } else {
            return false;
        }
    },

    equals: function (self, other) {
        if (typeof other != "object") return false;

        other = AmInterval.of(other);

        if (self.lower !== other.lower ||
            self.upper !== other.upper) return false;

        if (self.lower_included !== other.lower_included ||
            self.upper_included !== other.upper_included) return false;

        return true;
    },

    toString: function (self) {
        if (!self) return "";
        if (self.lower === undefined && self.upper === undefined) return "";
        return (self.lower ? String(self.lower) : "*") + ".." +
               (self.upper != undefined ? String(self.upper) : "*");
    },

    toContainedString: function (self) {
        var result = "";
        result += self.lower_included ? "[" : "(";
        result += self.lower_unbounded ? "*" : self.lower;
        result +="..";
        result += self.upper_unbounded ? "*" : self.upper;
        result += self.upper_included ? "]" : ")";
        return result;
    },


    parseNumberInterval: function (text) {
        var occ = {
            "lower_included": true,
            "upper_included": true,
            "lower_unbounded": false,
            "upper_unbounded": false
        };
        var splits = text.split("..");
        if (splits.length != 2) return undefined;
        if (splits[0] === "*") {
            occ.lower_unbounded = true;
            occ.lower_included = true;
        } else {
            occ.lower = parseInt(splits[0]);
            if (occ.lower === undefined) return undefined;
        }
        if (splits[1] === "*") {
            occ.upper_unbounded = true;
            occ.upper_included = false;
        } else {
            occ.upper = parseInt(splits[1]);
            if (occ.upper === undefined) return undefined;
        }

        if (occ.lower != undefined && occ.upper != undefined && occ.lower > occ.upper) return undefined;
        return occ;
    },

    parseStringInterval: function (text) {
        var occ = {
            "lower_included": true,
            "upper_included": true,
            "lower_unbounded": false,
            "upper_unbounded": false
        };
        var splits = text.split("..");
        if (splits.length != 2) return undefined;
        if (splits[0] === "*") {
            occ.lower_unbounded = true;
            occ.lower_included = true;
        } else {
            occ.lower = splits[0];
        }
        if (splits[1] === "*") {
            occ.upper_unbounded = true;
            occ.upper_included = false;
        } else {
            if (typeof Date.parse(splits[1]) === "undefined") return undefined;

            occ.upper = splits[1];
            if (occ.upper === undefined) return undefined;
        }

        if (occ.lower != undefined && occ.upper != undefined && occ.lower > occ.upper) return undefined;
        return occ;
    }

};


var CountdownLatch = function (count) {
    var currentCount = 0;
    var callbacks = [];

    function executeCallbacks() {
        for (var i in callbacks) {
            callbacks[i]();
        }
        callbacks = [];
    }

    this.countDown = function () {
        currentCount++;
        if (currentCount >= count) {
            executeCallbacks();
        }
    };


    this.execute = function (callback) {
        if (callback) {
            callbacks.push(callback);
        }
        if (currentCount > count) {
            executeCallbacks();
        }
    }

};

