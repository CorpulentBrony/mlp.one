<?php
	ini_set("zlib.output_compression", 0);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);
	header("Content-Type: text/plain");

	require_once "../api/vendor/autoload.php";
	require_once "include/Request.class.php";

	session_start();

	$episode = new \Mlp\Ep\Request($_SERVER["REQUEST_URI"]);
	$episode->checkIntegrity()->loadEpisode()->output();
?>