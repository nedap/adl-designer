<%--
  Created by IntelliJ IDEA.
  User: Denko
  Date: 10/27/2015
  Time: 12:28 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

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
        function showProgress(){
            $('#fetchProgress').show();
        }

    </script>
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>

    <![endif]-->
</head>
<body class="hold-transition login-page" style="background: url('images/Blue-Blur-Background1.jpg') repeat">
<div class="login-box">
    <div class="login-logo">
        <a href="../../index2.html"><b>template</b>Designer</a>
    </div><!-- /.login-logo -->
    <div class="login-box-body">
        <p class="login-box-msg">Sign in to start your session</p>
     <%--   <form action="../../index2.html" method="post">
            <div class="form-group has-feedback">
                <input type="email" class="form-control" placeholder="Email">
                <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
            </div>
            <div class="form-group has-feedback">
                <input type="password" class="form-control" placeholder="Password">
                <span class="glyphicon glyphicon-lock form-control-feedback"></span>
            </div>
            <div class="row">
                <div class="col-xs-8">

                </div><!-- /.col -->
                <div class="col-xs-4">
                    <button type="submit" class="btn btn-primary btn-block btn-flat">Sign In</button>
                </div><!-- /.col -->
            </div>
        </form>--%>

        <div class="social-auth-links text-center">
           <%-- <p>- OR -</p>--%>
            <a onclick="showProgress()" href="https://github.com/login/oauth/authorize?client_id=d0b3c06d13fdfabf0c88&scope=user,repo" class="btn btn-lg btn-block btn-social btn-github btn-flat"><i class="fa fa-github"></i> Sign in using Github</a>
        </div><!-- /.social-auth-links -->
        <div id="fetchProgress" hidden>
            <p>Connecting.. Please wait</p>
            <div class="progress progress-striped active">
                <div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">
                </div>
            </div>
        </div>

    </div><!-- /.login-box-body -->
</div><!-- /.login-box -->

<!-- jQuery 2.1.4 -->
<script src="plugins/jQuery/jQuery-2.1.4.min.js"></script>
<!-- Bootstrap 3.3.5 -->

<!-- iCheck -->


</body>
</html>
