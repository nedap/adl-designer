<%@ page import="org.springframework.web.servlet.ModelAndView" %>
<!--
  ~ ADL Designer
  ~ Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
  ~
  ~ This file is part of ADL2-tools.
  ~
  ~ ADL2-tools is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as
  ~ published by the Free Software Foundation, either version 3 of the
  ~ License, or (at your option) any later version.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<html>
<head>
    <title>Template Editor</title>

    <link rel="icon" href="favicon-96x96.png">
    <!-- jquery -->
    <script src="lib/jquery/jquery-1.11.1.js"></script>

    <!-- streamjs -->
    <script src="lib/streamjs-1.3.0/stream.js"></script>

    <!-- jquery jstree -->
    <link href="lib/jquery/jstree-3.2.1/themes/default/style.css" rel="stylesheet" type="text/css"/>
    <script src="lib/jquery/jstree-3.2.1/jstree.js"></script>

    <!-- toastr -->
    <link href="lib/jquery/toastr/bower_components/toastr/toastr.min.css" rel="stylesheet" type="text/css"/>
    <script src="lib/jquery/toastr/bower_components/toastr/toastr.min.js"></script>



    <!-- Bootstrap -->
    <link href="lib/bootstrap-3.3.2/css/bootstrap.css" rel="stylesheet" type="text/css"/>
    <script src="lib/bootstrap-3.3.2/js/bootstrap.js"></script>

    <link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet"/>
    <script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
    <!-- Bootstrap Table -->
    <link href="lib/bootstrap-table-1.6.0/bootstrap-table.min.css" rel="stylesheet" type="text/css"/>
    <script src="lib/bootstrap-table-1.6.0/bootstrap-table.min.js"></script>

    <!-- Handlebars -->
    <script src="lib/handlebars-v2.0.0.js"></script>

    <!-- CodeMirror -->
    <!-- does not use full editor for adl syntax highlight, uses runmode-standalone instead -->
    <!--<link href="lib/codemirror-5.1/lib/codemirror.css" rel="stylesheet" type="text/css"/>-->
    <!--<script src="lib/codemirror-5.1/lib/codemirror.js"></script>-->
    <!--<script src="lib/codemirror-5.1/addon/runmode/runmode.js"></script>-->
    <script src="lib/codemirror-5.1/addon/runmode/runmode-standalone.js"></script>
    <!-- CodeMirror ADL mode -->
    <link href="lib/codemirror-5.1/theme/adl.css" rel="stylesheet" type="text/css"/>
    <script src="lib/codemirror-5.1/mode/adl/adl.js"></script>


    <!-- Bootstrap Select -->
    <link href="lib/bootstrap-select-v1.7.2.0/css/bootstrap-select.min.css" rel="stylesheet" type="text/css"/>
    <script src="lib/bootstrap-select-v1.7.2.0/js/bootstrap-select.min.js"></script>

    <!-- Handle bounce scroll on touch devices -->
    <script src="lib/overscroll.js"></script>

    <!-- Archetype editor -->
    <script src="js/util.js"></script>
    <script src="js/archetype-editor/util-gui.js"></script>
    <script src="js/am/am-model.js"></script>
    <script src="js/am/am-factory.js"></script>
    <script src="js/am/am-mixin.js"></script>
    <script src="js/am/am-template-model.js"></script>
    <script src="js/archetype-editor/core.js"></script>
    <!--<script src="js/archetype-editor/definition.js"></script>-->
    <script src="js/archetype-editor/description.js"></script>
    <script src="js/archetype-editor/terminology.js"></script>
    <!--<script src="js/archetype-editor/display.js"></script>-->

    <script src="js/archetype-editor/module-common.js"></script>
    <script src="js/archetype-editor/module-primitive.js"></script>
    <script src="js/archetype-editor/module-openehr.js"></script>


    <script src="js/archetype-editor/template-editor.js"></script>
    <script src="js/archetype-editor/template-editor-definition.js"></script>
    <script src="js/archetype-editor/template-editor-constraints.js"></script>
    <script src="js/archetype-editor/template-editor-display.js"></script>

    <link href="archetype-editor.css" rel="stylesheet" type="text/css"/>


    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <!-- Ionicons -->
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <!-- jvectormap -->
    <link rel="stylesheet" href="plugins/jvectormap/jquery-jvectormap-1.2.2.css">
    <!-- Theme style -->
    <link rel="stylesheet" href="dist/css/AdminLTE.min.css">
    <!-- AdminLTE Skins. Choose a skin from the css/skins
         folder instead of downloading all of them to reduce the load. -->
    <link rel="stylesheet" href="dist/css/skins/_all-skins.min.css">
    <script>
        $().ready(function () {
            $.fn.editable.defaults.mode = 'inline';
            toastr.options.preventDuplicates = true;

            var mytab = $('#archetype-editor-archetype-tabs');
            var ul = mytab.find('ul');

            var el = ul.find('a[href="#archetype-editor-main-tabs-header"]');
            el.tab('show');
            ul.find('a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });

            TemplateEditor.initialize(function () {
            });
            window.addEventListener("beforeunload", function(event) {
                event.returnValue = "Please save your work. Any unsaved changes will be deleted.";
            });

        });
    </script>
  <%--  <script>
        var token;
        function LoginGitHub(){
            var code = window.location.search.substring(window.location.search.indexOf("code=")+5);
            $.post("https://github.com/login/oauth/access_token", { client_id : 'd0b3c06d13fdfabf0c88', client_secret:'3d9bece886ab0dc46202260248596421c1ce6712', code:code}, function(data){
               token = data.substring(data.indexOf("access_token")+13, data.indexOf("&scope"));
                $.get('https://api.github.com/user/emails?access_token='+token, function(data){ console.log(data)});
            });

        }
        function CreateFork(){
            $.post("https://api.github.com/repos/ehrscape/adl-models/forks?access_token="+token, function(data){ console.log(data)})
        }
        function GetArchetypeFromFork(){
            $.get("https://api.github.com/repos/denkomanceski/adl-models/contents/archetypes/openEHR-DEMOGRAPHIC-ADDRESS.address-provider.v1.adls?access_token="+token, function(data){
                $.get(data["download_url"], function success(data){ console.log (data)})
                return data
            })
        }
        function GetArchetypeNamesFromFork(){
            $.get("https://api.github.com/repos/denkomanceski/adl-models/contents/archetypes?access_token="+token, function(data){
                console.log(data);
            });
        }
    </script>--%>
</head>
<body class="hold-transition skin-blue sidebar-mini" style="overflow:auto;">
<div class="wrapper">

    <header class="main-header">

        <!-- Logo -->
        <a href="index2.html" class="logo">
            <!-- mini logo for sidebar mini 50x50 pixels -->
            <span class="logo-mini"><b>EHR</b></span>
            <!-- logo for regular state and mobile devices -->
            <span class="logo-lg"><b>open</b>EHR</span>
        </a>

        <!-- Header Navbar: style can be found in header.less -->
        <nav class="navbar navbar-static-top" role="navigation">
            <!-- Sidebar toggle button-->
            <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
                <span class="sr-only">Toggle navigation</span>
            </a>
            <!-- Navbar Right Menu -->
            <div class="navbar-custom-menu">
                <ul class="nav navbar-nav">
                    <!-- Messages: style can be found in dropdown.less-->
                    <!--<li class="dropdown messages-menu">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <i class="fa fa-envelope-o"></i>
                            <span class="label label-success">4</span>
                        </a>-->

                    <!-- Notifications: style can be found in dropdown.less -->
                    <li class="dropdown notifications-menu">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <i class="fa fa-bell-o"></i>
                            <span class="label label-danger">10</span>
                        </a>
                        <ul class="dropdown-menu">
                            <li class="header">You have 10 notifications</li>
                            <li>
                                <!-- inner menu: contains the actual data -->
                                <ul class="menu">
                                    <li>
                                        <a href="#">
                                            <i class="fa fa-users text-aqua"></i> Last template update was done by Someone
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i class="fa fa-warning text-yellow"></i> Very long description here that may not fit into the page and may cause design problems
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i class="fa fa-users text-red"></i> Template XYZ deleted successfully
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i class="fa fa-user text-red"></i> Maybe something else
                                        </a>
                                    </li>
                                </ul>
                            </li>
                            <li class="footer"><a href="#">View all</a></li>
                        </ul>
                    </li>
                    <!-- Tasks: style can be found in dropdown.less -->

                    <!-- User Account: style can be found in dropdown.less -->
                    <li class="dropdown user user-menu">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <img src="http://i.imgur.com/1U2MVuG.png" class="user-image" alt="User Image">
                            <span class="hidden-xs">Denko Mancheski</span>
                        </a>
                        <ul class="dropdown-menu">
                            <!-- User image -->
                            <li class="user-header">
                                <img src="http://i.imgur.com/1U2MVuG.png" class="img-circle" alt="User Image">
                                <p>
                                    Denko Mancheski - Web Developer
                                    <small>Member since Oct. 2015</small>
                                </p>
                            </li>
                            <!-- Menu Body -->
                            <li class="user-body">
                                <div class="col-xs-4 text-center">
                                    <a href="#">Followers</a>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <a href="#">Sales</a>
                                </div>
                                <div class="col-xs-4 text-center">
                                    <a href="#">Friends</a>
                                </div>
                            </li>
                            <!-- Menu Footer-->
                            <li class="user-footer">
                                <div class="pull-left">
                                    <a href="#" class="btn btn-default btn-flat">Profile</a>
                                </div>
                                <div class="pull-right">
                                    <a href="/designer/Logout" class="btn btn-default btn-flat">Sign out</a>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <!-- Control Sidebar Toggle Button -->
                    <li>
                        <a href="#" data-toggle="control-sidebar"><i class="fa fa-gears"></i></a>
                    </li>
                </ul>
            </div>

        </nav>
    </header>
    <!-- Left side column. contains the logo and sidebar -->
    <aside class="main-sidebar">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">
            <!-- Sidebar user panel -->
            <div class="user-panel">
                <div class="pull-left image">
                    <img src="http://i.imgur.com/1U2MVuG.png" class="img-circle" alt="User Image">
                </div>
                <div class="pull-left info">
                    <p>Denko Mancheski</p>
                    <a href="#"><i class="fa fa-circle text-success"></i> Online</a>
                </div>
            </div>
            <!-- search form -->
             <!--   <form action="#" method="get" class="sidebar-form">
                    <div class="input-group">
                        <input type="text" name="q" class="form-control" placeholder="Search...">
                  <span class="input-group-btn">
                    <button type="submit" name="search" id="search-btn" class="btn btn-flat"><i class="fa fa-search"></i></button>
                  </span>
                    </div>
                </form>-->
            <!-- /.search form -->
            <!-- sidebar menu: : style can be found in sidebar.less -->
            <ul class="sidebar-menu">
                <li class="header">MAIN ACTIONS</li>



                <li>
                    <a href="#"onclick="TemplateEditor.openCreateNewTemplateDialog()">
                        <i class="fa fa-file-text-o"></i> <span>New template</span>

                    </a>
                </li>
                <li>
                    <a href="#" onclick="TemplateEditor.openLoadTemplateDialog()">
                        <i class="fa fa-folder-open-o"></i> <span>Load template</span>

                    </a>
                </li>
                <li>
                    <a href="#" onclick="TemplateEditor.saveCurrentTemplateWithNotification()">
                        <i class="fa fa-floppy-o"></i> <span>Save template</span>

                    </a>
                </li>

                <li class="header">OPT 1.4</li>
                <li>
                    <a href="#"  onclick="TemplateEditor.exportToOpt14()">
                        <i class="fa fa-upload"></i> <span>Export to Opt 1.4</span>

                    </a>
                </li>
                <li><a href="documentation/index.html"><i class="fa fa-book"></i> <span>Documentation</span></a></li>
                <li class="treeview">
                    <a href="#">
                        <i class="fa fa-pie-chart"></i>
                        <span>Recent Projects</span>
                        <i class="fa fa-angle-left pull-right"></i>
                    </a>
                    <ul class="treeview-menu">
                        <li><a href="pages/charts/chartjs.html"><i class="fa fa-circle-o"></i> t1</a></li>
                        <li><a href="pages/charts/morris.html"><i class="fa fa-circle-o"></i> t2</a></li>
                        <li><a href="pages/charts/flot.html"><i class="fa fa-circle-o"></i> t3</a></li>
                        <li><a href="pages/charts/inline.html"><i class="fa fa-circle-o"></i> t4</a></li>
                    </ul>
                </li>

                <li class="header">LABELS</li>
                <li><a href="#"><i class="fa fa-circle-o text-red"></i> <span>Important</span></a></li>
                <li><a href="#"><i class="fa fa-circle-o text-yellow"></i> <span>Warning</span></a></li>
                <li><a href="#"><i class="fa fa-circle-o text-aqua"></i> <span>Information</span></a></li>
            </ul>
        </section>
        <!-- /.sidebar -->
    </aside>

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <!-- Content Header (Page header) -->


        <!-- Main content -->
        <section class="content">
            <!-- Info boxes -->
            <div class="container-fluid" >
            <div class="row">
                <div id="archetype-editor-main">

                    <div id="archetype-editor-archetype-id-main"></div>
                    <div id="archetype-editor-archetype-tabs" class="tab-pane">

                        <ul class="nav nav-tabs nav-justified">
                            <li role="presentation" class="active"><a href="#archetype-editor-main-tabs-description">Description</a></li>
                            <li role="presentation"><a href="#archetype-editor-main-tabs-definition">Definition</a></li>
                            <li role="presentation"><a href="#archetype-editor-main-tabs-display">Display</a></li>
                        </ul>
                        <div class="tab-content" style="border: 1px solid #ddd; box-shadow: 10px 10px 5px #888888;">

                            <div role="tabpanel" class="tab-pane active container-fluid" id="archetype-editor-main-tabs-description">
                            </div>
                            <div role="tabpanel" class="tab-pane fade container-fluid" id="archetype-editor-main-tabs-definition">
                            </div>
                            <div role="tabpanel" class="tab-pane fade container-fluid" id="archetype-editor-main-tabs-display">
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            </div>
        </section><!-- /.content -->
    </div><!-- /.content-wrapper -->

    <footer class="main-footer">
        <div class="pull-right hidden-xs">
            <b>Version</b> 2.0.0
        </div>
        <strong>Copyright &copy; 2014-2015 <a href="http://www.marand.si">Marand</a>.</strong> All rights reserved.
    </footer>

    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
        <!-- Create the tabs -->
        <ul class="nav nav-tabs nav-justified control-sidebar-tabs">
            <li><a href="#control-sidebar-home-tab" data-toggle="tab"><i class="fa fa-home"></i></a></li>
            <li><a href="#control-sidebar-settings-tab" data-toggle="tab"><i class="fa fa-gears"></i></a></li>
        </ul>
        <!-- Tab panes -->
        <div class="tab-content">
            <!-- Home tab content -->
            <div class="tab-pane" id="control-sidebar-home-tab">
                <h3 class="control-sidebar-heading">Recent Activity</h3>
                <ul class="control-sidebar-menu">
                    <li>
                        <a href="javascript::;">
                            <i class="menu-icon fa fa-birthday-cake bg-red"></i>
                            <div class="menu-info">
                                <h4 class="control-sidebar-subheading">Langdon's Birthday</h4>
                                <p>Will be 23 on April 24th</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <i class="menu-icon fa fa-user bg-yellow"></i>
                            <div class="menu-info">
                                <h4 class="control-sidebar-subheading">Frodo Updated His Profile</h4>
                                <p>New phone +1(800)555-1234</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <i class="menu-icon fa fa-envelope-o bg-light-blue"></i>
                            <div class="menu-info">
                                <h4 class="control-sidebar-subheading">Nora Joined Mailing List</h4>
                                <p>nora@example.com</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <i class="menu-icon fa fa-file-code-o bg-green"></i>
                            <div class="menu-info">
                                <h4 class="control-sidebar-subheading">Cron Job 254 Executed</h4>
                                <p>Execution time 5 seconds</p>
                            </div>
                        </a>
                    </li>
                </ul><!-- /.control-sidebar-menu -->

                <h3 class="control-sidebar-heading">Tasks Progress</h3>
                <ul class="control-sidebar-menu">
                    <li>
                        <a href="javascript::;">
                            <h4 class="control-sidebar-subheading">
                                Custom Template Design
                                <span class="label label-danger pull-right">70%</span>
                            </h4>
                            <div class="progress progress-xxs">
                                <div class="progress-bar progress-bar-danger" style="width: 70%"></div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <h4 class="control-sidebar-subheading">
                                Update Resume
                                <span class="label label-success pull-right">95%</span>
                            </h4>
                            <div class="progress progress-xxs">
                                <div class="progress-bar progress-bar-success" style="width: 95%"></div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <h4 class="control-sidebar-subheading">
                                Laravel Integration
                                <span class="label label-warning pull-right">50%</span>
                            </h4>
                            <div class="progress progress-xxs">
                                <div class="progress-bar progress-bar-warning" style="width: 50%"></div>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="javascript::;">
                            <h4 class="control-sidebar-subheading">
                                Back End Framework
                                <span class="label label-primary pull-right">68%</span>
                            </h4>
                            <div class="progress progress-xxs">
                                <div class="progress-bar progress-bar-primary" style="width: 68%"></div>
                            </div>
                        </a>
                    </li>
                </ul><!-- /.control-sidebar-menu -->

            </div><!-- /.tab-pane -->

            <!-- Settings tab content -->
            <div class="tab-pane" id="control-sidebar-settings-tab">
                <form method="post">
                    <h3 class="control-sidebar-heading">General Settings</h3>
                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Report panel usage
                            <input type="checkbox" class="pull-right" checked>
                        </label>
                        <p>
                            Some information about this general settings option
                        </p>
                    </div><!-- /.form-group -->

                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Allow mail redirect
                            <input type="checkbox" class="pull-right" checked>
                        </label>
                        <p>
                            Other sets of options are available
                        </p>
                    </div><!-- /.form-group -->

                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Expose author name in posts
                            <input type="checkbox" class="pull-right" checked>
                        </label>
                        <p>
                            Allow the user to show his name in blog posts
                        </p>
                    </div><!-- /.form-group -->

                    <h3 class="control-sidebar-heading">Chat Settings</h3>

                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Show me as online
                            <input type="checkbox" class="pull-right" checked>
                        </label>
                    </div><!-- /.form-group -->

                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Turn off notifications
                            <input type="checkbox" class="pull-right">
                        </label>
                    </div><!-- /.form-group -->

                    <div class="form-group">
                        <label class="control-sidebar-subheading">
                            Delete chat history
                            <a href="javascript::;" class="text-red pull-right"><i class="fa fa-trash-o"></i></a>
                        </label>
                    </div><!-- /.form-group -->
                </form>
            </div><!-- /.tab-pane -->
        </div>
    </aside><!-- /.control-sidebar -->
    <!-- Add the sidebar's background. This div must be placed
         immediately after the control sidebar -->
    <div class="control-sidebar-bg"></div>

</div><!-- ./wrapper -->

<!-- jQuery 2.1.4 -->

<!-- AdminLTE App -->
<script src="dist/js/app.min.js"></script>
<!-- Sparkline -->

<!-- jvectormap -->

<!-- SlimScroll 1.3.0 -->
<script src="plugins/slimScroll/jquery.slimscroll.min.js"></script>

<!-- AdminLTE dashboard demo (This is only for demo purposes) -->
<script src="dist/js/pages/dashboard2.js"></script>
<!-- AdminLTE for demo purposes -->
<script src="dist/js/demo.js"></script>
</body>
<body style="overflow:hidden">


</body>

</html>