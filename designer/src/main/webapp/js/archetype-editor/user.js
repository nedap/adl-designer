/*
 * ADL Designer
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-tools.
 *
 * ADL2-tools is free software: you can redistribute it and/or modify
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
var UserModule = (function () {
    var my = {};

    function showRepositories() {
        $.getJSON("rest/user/repository/info").done(function (repos) {
            Stream(repos.repositories).forEach(function (r) {
                r.current = r.name === repos.lastRepository;
            });

            GuiUtils.applyTemplate("user|repositories", repos, function (html) {
                var dialogElement = $(html);
                var modalBody = dialogElement.find(".modal-body");

                modalBody.find("button[data-action='add']").click(function () {
                    GuiUtils.openSingleTextInputDialog({
                        title: "Add repository",
                        inputLabel: "Repository name",
                        inputValue: "",
                        callback: function (content) {
                            var repoName = content.find("input").val().trim();
                            $.post('rest/user/repository/add', {name: repoName}).done(function () {
                                dialogElement.modal('hide');
                                showRepositories();
                            });
                        }
                    });
                });

                modalBody.find("button[data-action='remove']").click(function () {
                    var repoName = $(this).data('name');
                    $.post('rest/user/repository/delete', {name: repoName}).done(function () {
                        dialogElement.modal('hide');
                        showRepositories();
                    });
                });

                modalBody.find("button[data-action='choose']").click(function () {
                    var repoName = $(this).data('name');
                    showBlockingMask("Synchronizing with repository...");
                    $.post('rest/user/repository/choose', {name: repoName})
                        .then(function (data) {
                            dialogElement.modal('hide');
                            //showRepositories();
                            UserModule.updateConnectedTo(data.name);
                            return TemplateEditor.initialize();
                        }).always($.unblockUI)
                });

                dialogElement.on('hidden.bs.modal', function () {
                    dialogElement.remove();
                });

                dialogElement.modal({backdrop: 'static'});
            });
        });
    }

    my.updateConnectedTo = function (repoName) {
        $('#archetype-editor-footer').html("<i class='fa fa-github'></i> <a target='_blank' href='https://github.com/" + repoName + "'>" + repoName + "</a>");
    }

    my.showProfile = function () {
        $.getJSON("rest/user/profile").done(function (profile) {

            GuiUtils.applyTemplate("user|profile", profile, function (html) {
                var dialogElement = $(html);

                //var modalFooter = dialogElement.find(".modal-footer");
                dialogElement.find("button[name]").click(function () {
                    var buttonName = $(this).attr('name');
                    switch (buttonName) {
                        case 'repositories':
                            showRepositories();
                            break;
                    }
                    //dialogElement.modal('hide');
                });

                dialogElement.on('hidden.bs.modal', function () {
                    dialogElement.remove();
                });
                dialogElement.modal({backdrop: 'static'});
            });
        });
    };
    return my;
}());