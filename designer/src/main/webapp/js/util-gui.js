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

var GuiUtils = (function () {
    var my = {};

    var compiledHandlebarTemplates = {};

    var nextGeneratedId = 0;

    my.generateId = function () {
        return "gid_" + (nextGeneratedId++).toString(36);
    };

    my.applyTemplate = function (path, context, callback) {
        function applyTemplateAndCallback(template) {
            var html = template(context);
            if (typeof callback === "function") {
                callback(html);
            } else if (callback instanceof jQuery) {
                callback.append(html);
            }
        }


        if (compiledHandlebarTemplates[path]) {
            var template = compiledHandlebarTemplates[path];
            applyTemplateAndCallback(template);
        } else {
            var pathobj;
            var pipePos = path.indexOf("|");
            if (pipePos >= 0) {
                pathobj = {
                    path: path.substring(0, pipePos),
                    id: path.substring(pipePos + 1)
                }
            } else {
                pathobj = {
                    path: path
                }
            }
            my.loadTemplates(pathobj.path, pipePos >= 0, function () {
                var template = compiledHandlebarTemplates[path];
                if (!template) {
                    console.error("No handlebars template for path " + path);
                    return;
                }
                applyTemplateAndCallback(template)
            })
        }
    };

    my.loadTemplates = function (path, multi, callback) {
        function splitTemplateStringById(string) {
            var hbs_id_re = /^{>.+}\s*$/;

            var linesRe = /\r\n|\n\r|\n|\r/g;
            var lines = string.replace(linesRe, "\n").split("\n");
            var result = {};

            var hbsId;
            for (var i in lines) {
                var line = lines[i];
                if (hbs_id_re.test(line)) {
                    line = line.trim();
                    var idEnd = line.indexOf("}", 2);
                    hbsId = line.substring(2, idEnd).trim();
                    result[hbsId] = [];
                } else if (hbsId) {
                    result[hbsId].push(line);
                }
            }
            for (var id in result) {
                result[id] = result[id].join("\n");
            }
            return result;
        }

        $.ajax({
                   url: "templates/" + path + ".hbs",
                   success: function (data) {
                       if (multi) {
                           var templatesById = splitTemplateStringById(data);
                           for (var id in templatesById) {
                               var template = Handlebars.compile(templatesById[id]);
                               compiledHandlebarTemplates[path + "|" + id] = template;
                           }
                           callback();
                       } else {
                           var template = Handlebars.compile(data);
                           compiledHandlebarTemplates[path] = template;
                           callback();
                       }
                   }
               });
    };


    my.openSimpleDialog = function (options) {
        var defaultOptions = {buttons: {"ok": "Ok"}, title: "Dialog"};
        options = $.extend({}, defaultOptions, options);


        var frameContext = {
            title: options.title
        };
        frameContext.buttons = [];
        for (var key in options.buttons) {
            var buttonContext = {
                name: key,
                label: options.buttons[key],
                class: "btn"
            };
            frameContext.buttons.push(buttonContext);
        }

        frameContext.buttons[frameContext.buttons.length - 1].class = "btn btn-primary";

        var content = options.content;
        if (typeof content === "string") {
            content = $(content);
        }

        GuiUtils.applyTemplate("dialog-common|frame", frameContext, function (html) {
            var dialogElement = $(html);
            var modalBody = dialogElement.find(".modal-body");
            modalBody.append(content);

            var modalFooter = dialogElement.find(".modal-footer");
            modalFooter.find("button[name]").click(function () {
                var buttonName = $(this).attr('name');

                if (options.callback) {
                    var result = options.callback(content, buttonName);
                    if (typeof result === "string") {
                        var alertDiv = modalFooter.find(".alert");
                        alertDiv.text(result).removeClass("hidden");
                        return;
                    }
                }
                dialogElement.modal('hide');
            });

            dialogElement.on('hidden.bs.modal', function (e) {
                dialogElement.remove();
            });
            dialogElement.modal();
        });
    };

    my.openSingleTextInputDialog = function (options) {

        var context = {
            id: my.generateId(),
            label: options.inputLabel || options.title,
            value: options.inputValue
        };
        my.applyTemplate("dialog-common|singleTextInput", context, function (content) {
            options.content = content;
            my.openSimpleDialog(options);
        });
    };

    /**
     * adds or removes .hidden class
     * @param {jQuery} element
     * @param {boolean} visible
     */
    my.setVisible = function (element, visible) {
        if (visible) {
            element.removeClass('hidden')
        } else {
            element.addClass('hidden')
        }
    };


    return my;
}());

