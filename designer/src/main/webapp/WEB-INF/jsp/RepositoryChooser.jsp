<%--
  Created by IntelliJ IDEA.
  User: Denko
  Date: 11/5/2015
  Time: 1:54 PM
  To change this template use File | Settings | File Templates.
--%>
<%--
  Created by IntelliJ IDEA.
  User: Denko
  Date: 10/27/2015
  Time: 12:28 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>AdminLTE 2 | Log in</title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
    <!-- Bootstrap 3.3.5 -->

    <link href="lib/bootstrap-3.3.2/css/bootstrap.css" rel="stylesheet" type="text/css"/>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    <!-- Ionicons -->
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <!-- Theme style -->
    <link rel="stylesheet" href="dist/css/AdminLTE.min.css">
    <!-- iCheck -->
    <link rel="stylesheet" href="plugins/iCheck/square/blue.css">
    <script>
        function showProgress() {
            $('#fetchProgress').show();
        }

    </script>
    <style>
        .table-hover tbody tr:hover td, .table-hover tbody tr:hover th {
            background-color: #07c;
            cursor: pointer !important;
            color: white;
        }
    </style>
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>

    <![endif]-->
</head>
<body class="hold-transition login-page" style="background: url('images/Blue-Blur-Background1.jpg') repeat">
<div class="login-box">
    <div class="login-logo">
        <a href="../../index2.html"><b>template</b>Designer</a>
    </div>
    <!-- /.login-logo -->
    <div class="login-box-body">
        <p class="login-box-msg">Choose a repository:</p>
        <table class="table table-bordered table-hover">
            <thead>
            <tr>
                <td>Name</td>
                <td>Fork</td>
            </tr>
            </thead>
            <tbody>
            <c:forEach items="${Repositories}" var="repo">
                <tr onclick="ChooseRepo('${repo.full_name}', ${repo.fork})">
                    <td class="nr"><c:out value="${repo.full_name}"/></td>
                    <c:choose>
                        <c:when test="${repo.fork}">
                            <td>Yes</td>
                        </c:when>
                        <c:otherwise>
                            <td>No</td>
                        </c:otherwise>
                    </c:choose>
                </tr>
            </c:forEach>
            </tbody>
        </table>


        <div id="fetchProgress" hidden>
            <p>Fetching metadata from repository.. Please wait</p>

            <div class="progress progress-striped active">
                <div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
                     style="width: 100%">
                </div>
            </div>
        </div>

    </div>
    <!-- /.login-box-body -->
</div>
<!-- /.login-box -->
<script>
    function ChooseRepo(repo, fork) {
        var url = '/designer/RepositoryProvider?repo=' + repo + '&fork=' + fork;
        $('#fetchProgress').show();
        window.location = url;
    }

</script>
<!-- jQuery 2.1.4 -->
<script src="plugins/jQuery/jQuery-2.1.4.min.js"></script>
<!-- Bootstrap 3.3.5 -->

<!-- iCheck -->


