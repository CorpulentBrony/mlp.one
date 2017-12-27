<?php
	ini_set("zlib.output_compression", 0);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);
	header("Content-Type: text/plain");

	// secrets.php defines some constants that contain password information; see secrets_example.php for a complete list
	require_once "secrets.php";
	require_once "../api/vendor/autoload.php";
	require_once "Cookie.class.php";

	session_start();

	if (isset($_REQUEST["logout"])) {
		Cookie::invalidate();
		header("Location: login.php");
		die;
	}
?>