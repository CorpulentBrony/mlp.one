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
		<!--# include file="/common_header.html" -->
		<meta content="<?= $pageTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $pageDescription ?>" itemprop="description" name="description" property="og:description">
		<meta content="<?= $pageTitle ?>" name="twitter:title">
		<meta content="<?= $pageDescription ?>" name="twitter:description">
		<title><?= $pageTitle ?></title>
		<link href="/index.css" rel="stylesheet" type="text/css">
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