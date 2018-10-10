<?php
	namespace Mlp\Ep;
	$errorImage = "https://mlp.one/404.png";
	$errorMessage = "Sorry pardner, I may be a silly pony but even I reckons when I's lost.  Yee haw.";
	$errorTitle = "Silly Pony is Lost";
	http_response_code(404);
	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemscope itemtype="http://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<meta charset="utf-8">
		<!--# include file="/common/header_base.html" -->
		<meta content="noindex" name="robots">
		<meta content="<?= $errorImage ?>" name="twitter:image" property="og:image">
		<meta content="<?= $errorImage ?>" itemprop="image">
		<meta content="441" property="og:image:width">
		<meta content="307" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="https://<?= $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]?>" itemprop="url" property="og:url">
		<meta content="<?= $errorTitle ?>" name="title" property="og:title">
		<meta content="<?= $errorTitle ?>" itemprop="headline name">
		<meta content="<?= $errorMessage ?>" name="description" property="og:description">
		<meta content="<?= $errorMessage ?>" itemprop="description">
		<meta content="<?= $errorTitle ?>" name="twitter:title">
		<meta content="<?= $errorMessage ?>" name="twitter:description">
		<title><?= $errorTitle ?></title>
		<link href="/css/typography.css" rel="stylesheet">
		<style>
			html {
				background-attachment: fixed;
				background-color: rgb(36, 178, 202);
				background-image: url(/404bg.png);
				background-position: 50% 50%;
				background-size: cover;
				text-align: center;
			}
			h1, h2 { margin: 0; }
			h1 { font-size: 5rem; }
			h2 {
				font-size: 3rem;
				margin-bottom: 3rem;
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
				<?= str_replace("silly pony", "<a href=\"https://www.youtube.com/watch?v=3NUgUu2_gBc\" rel=\"external noopener\" target=\"_blank\">silly pony</a>", $errorMessage) ?>
			</section>
			<nav>
				<h2>Go on, git on back <a href="/">home</a> now.</h2>
			</nav>
		</main>
		<!--# include file="/common/footer.html" -->
	</body>
</html>