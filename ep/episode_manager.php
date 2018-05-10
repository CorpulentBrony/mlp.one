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
	// var_dump($episode);
	/*
		/ep/n - returns information page about an ep, with description, embedded video, and embedded audio.  also an "edit" button if permissions allow.  if ep does not exist, then load create new ep screen if permissions allow
		/ep/n.html - same as /ep/n
		/ep/n.mp3 - redirects to mp3 file
		/ep/n.jsonld - structured data schema
		/ep/n.json and /ep/n.xml perhaps implement oembed?  https://oembed.com/ or implement my own
	*/
?>