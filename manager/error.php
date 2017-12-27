<?php
	// not sure this is actually currentl being used
	// put error message in $errorMessage
	$pageDescription = "An error page for when you fuck up.";
	$pageTitle = "/mlp/odcast manager error";

	if (empty($errorMessage))
		$errorMessage = "Uhhh, this page is for displaying real error messages, fam";
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
		<title><?= $pageTitle ?></title>
		<link async href="/index.css" rel="stylesheet" type="text/css">
		<link async href="/podcast/%252Fmlp%252F.jpg" itemprop="thumbnailUrl" rel="icon" sizes="88x88" type="image/jpeg">
		<title><?= $pageTitle ?></title>
	</head>
	<body>
		<main itemprop="mainContentOfPage">
			<header>
				<h1><?= $pageTitle ?></h1>
				<div><?= $errorMessage ?></div>
				<div>To log in again, return to the <a href="index.php">form manager</a></div>
			</header>
			<section>
				<ul>
					<a href="index.php">Return to form manager</a>
					<a href="/">Return to /mlp/odcast</a>
				</ul>
			</section>
		</main>
	</body>
</html>
<?php die; ?>