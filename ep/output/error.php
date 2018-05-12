<?php
	namespace Mlp\Ep;
	$errorImage = "https://mlp.one/404.png";
	$errorMessage = "Sorry pardner, I may be a silly pony but even I reckon when I's lost.  Yee haw.";
	$errorTitle = "Silly Pony is Lost";
	http_response_code(404);
	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemscope itemtype="http://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<!--# include file="/common_header_base.html" -->
		<meta content="noindex" name="robots">
		<meta content="<?= $errorImage ?>" itemprop="image" name="twitter:image" property="og:image">
		<meta content="441" property="og:image:width">
		<meta content="307" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="https://<?= $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]?>" itemprop="url" property="og:url">
		<meta content="<?= $errorTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $errorMessage ?>" itemprop="description" name="description" property="og:description">
		<meta content="<?= $errorTitle ?>" name="twitter:title">
		<meta content="<?= $errorMessage ?>" name="twitter:description">
		<title><?= $errorTitle ?></title>
		<link href="/index.css" rel="stylesheet" type="text/css">
		<style type="text/css">
			html {
				background-color: rgb(36, 178, 202);
				background-image: url(/404bg.png);
				background-position: 50% 50%;
				background-size: cover;
				text-align: center;
			}
		</style>
	</head>
	<body>
		<main>
			<header>
				<img alt="Image of the numerals 404 with Applejack looking disheartened" src="<?= $errorImage ?>" type="image/png">
				<h1><?= $errorTitle ?></h1>
			</header>
			<section>
				<?= str_replace("silly pony", "<a href=\"https://www.youtube.com/watch?v=3NUgUu2_gBc\" itemprop=\"url\" rel=\"external noopener\" target=\"_blank\">silly pony</a>", $errorMessage) ?>
			</section>
			<nav>
				<h2><a href="/">Go on, git on back home now.</a></h2>
			</nav>
		</main>
	</body>
</html>