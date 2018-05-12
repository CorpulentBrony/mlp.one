<?php
	require_once "header.php";
	// based on https://github.com/google/google-api-php-client/blob/master/examples/idtoken.php
	// https://developers.google.com/api-client-library/php/auth/web-app#example is a bit helpful
	(function (): void {
		$cookie = Cookie::getSession();
		if ($cookie === false)
			return;
		elseif ($cookie->isValid()) {
			header("Location: index.php");
			die;
		}
	})();
	$pageDescription = "Login page for the /mlp/odcast manager";
	$pageTitle = "/mlp/odcast manager login";
	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemid="https://<!--# echo var='host' --><!--# echo var='request_uri' -->" itemscope itemtype="https://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<meta charset="utf-8">
		<link href="https://<!--# echo var='host' --><!--# echo var='request_uri' -->" itemprop="url" rel="canonical self" type="text/html">
		<link href="/manifest.jsonmanifest" rel="manifest" type="application/manifest+json">
		<link href="/sitemap.xml" rel="sitemap" type="application/xml">
		<meta content="/browserconfig.xml" name="msapplication-config">
		<meta content="width=device-width, initial-scale=1, maximum-scale=1" name="viewport">
		<meta content="<?= $pageTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $pageDescription ?>" itemprop="description" name="description" property="og:description">
		<meta content="<!--# echo var='siteImage' -->" itemprop="image" name="twitter:image" property="og:image">
		<meta content="1280" property="og:image:width">
		<meta content="720" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="https://<!--# echo var='host' --><!--# echo var='request_uri' -->" itemprop="url" property="og:url">
		<meta content="otaku12" property="fb:admins">
		<meta content="summary" name="twitter:card">
		<meta content="@CorpulentBrony" name="twitter:site">
		<meta content="<?= $pageTitle ?>" name="twitter:title">
		<meta content="<?= $pageDescription ?>" name="twitter:description">
		<link href="//www.youtube.com/user/4chanmlp" rel="author publisher" type="text/html">
		<link href="//horse.best" rel="bestpony" type="text/html">
		<link href="//creativecommons.org/licenses/by-nc-sa/4.0/" itemprop="license" rel="code-license content-license copyright license" type="text/html">
		<link href="https://github.com/CorpulentBrony/mlp.one" rel="code-repository content-repository external source" type="text/html">
		<link async href="/index.css" rel="stylesheet" type="text/css">
		<link async href="/podcast/%252Fmlp%252F.jpg" itemprop="thumbnailUrl" rel="icon" sizes="88x88" type="image/jpeg">
		<title><?= $pageTitle ?></title>
	</head>
	<body>
		<main itemprop="mainContentOfPage">
			<header role="heading">
				<h1><?= $pageTitle ?></h1>
			</header>
			<section role="main">
				<output class="bold" role="alert">Please log in with the Google widget, once your access is verified you will be redirected to the /mlp/odcast manager application.</output>
			</section>
		</main>
		<script type="application/javascript">
			"use strict";
			(function() {
				const elements = window.Object.create(window.Object.prototype);
				function documentOnLoad() {
					elements.output = document.querySelector("output");
					document.removeEventListener("DOMContentLoaded", documentOnLoad, false);
				}
				// googleyolo: https://developers.google.com/identity/one-tap/web/overview
				function googleOnLoad(googleyolo) {
					const yoloParams = { 
						supportedAuthMethods: ["https://accounts.google.com"], 
						supportedIdTokenProviders: [{ uri: "https://accounts.google.com", clientId: "12143257959-uqutti8pigo4pf5cuqe6vtn1ddtv8860.apps.googleusercontent.com" }]
					};
					googleyolo.hint(yoloParams).then((credential) => {
						showMessage("Response received from Google, verifying credentials with server");
						const form = new window.FormData();
						form.set("credential", JSON.stringify(credential));
						return window.fetch("access.php", { credentials: "include", method: "POST", body: form });
					}).then((result) => result.json())
					.then((response) => {
						if (!response || response.isValid !== true)
							showMessage(response.error ? response.error : "Server says you are not a valid user.  Please contact the administrator for more help.", true);
						else {
							showMessage("User validated, redirecting to index.php");
							window.location = "index.php";
						}
					})
					.catch((err) => {
						if (err.type === "noCredentialsAvailable")
							showMessage("It appears you may have been signed out of Google.  Please sign into Google again and then try reloading this page.", true)
						else
							showMessage(err.message, true)
					});
				}
				function showMessage(message, isError = false) {
					elements.output.textContent = message;
					elements.output.style.color = isError ? "red" : "inherit";
				}
				if (document.readyState === "loading")
					document.addEventListener("DOMContentLoaded", documentOnLoad, false);
				else
					documentOnLoad();
				window.onGoogleYoloLoad = googleOnLoad;
			})();
		</script>
		<script async defer src="https://smartlock.google.com/client" type="application/javascript"></script>
	</body>
</html>