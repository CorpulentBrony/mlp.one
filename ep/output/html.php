<?php
	namespace Mlp\Ep;
	const DATE_DISPLAY_FORMAT = "l, F j<\s\u\p>S</\s\u\p>, Y";
	$description = str_replace("\n", " ", $this->episode->description);
	$episodeFullTitle = "{$_SERVER["SITE_TITLE"]} #" . strval($this->episode->number) . " - {$this->episode->title}";
	http_response_code(200);
	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemid="<?= $this->episode->getGuid() ?>" itemscope itemtype="http://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<!--# include file="/common_header_base.html" -->
		<link href="<?= $this->getRequestUrl() ?>" rel="canonical self" type="text/html">
		<meta content="<?= $this->episode->getYouTubeThumbnail() ?>" itemprop="image" name="twitter:image" property="og:image">
		<meta content="1280" property="og:image:width">
		<meta content="720" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="https://<?= $this->getRequestUrl() ?>" itemprop="url" property="og:url">
		<meta content="<?= $episodeFullTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $description ?>" itemprop="description" name="description" property="og:description">
		<meta content="<?= implode(",", $this->episode->keywords) ?>" itemprop="keywords" name="keywords">
		<meta content="<?= $episodeFullTitle ?>" name="twitter:title">
		<meta content="<?= $description ?>" name="twitter:description">
		<script type="application/ld+json"><?php require "jsonld.php"; ?></script>
		<title><?= $episodeFullTitle ?></title>
		<link href="/index.css" rel="stylesheet" type="text/css">
		<style type="text/css">
			h1 {
				font-size: 2rem;
				margin: 0;
			}
			section {
				margin: 1em 0;
			}

			.yt-container {
				max-width: 50vw;
			}
			.yt-video-container {
				height: 0;
				overflow: hidden;
				padding-bottom: 56.25%;
				position: relative;
			}
			.yt-video-container iframe {
				height: 100%;
				left: 0;
				position: absolute;
				top: 0;
				width: 100%;
			}
		</style>
	</head>
	<body>
		<main>
			<article>
				<header>
					<h1><?= $episodeFullTitle ?></h1>
					<div>Uploaded <time datetime="<?= $this->episode->publishDate->format("Y-m-d") ?>"><?= $this->episode->publishDate->format(DATE_DISPLAY_FORMAT) ?></time>
				</header>
				<section class="yt-container">
					<div class="yt-video-container">
						<iframe allow="encrypted-media" allowfullscreen src="<?= $this->episode->getYouTubeEmbedUrl() ?>"></iframe>
					</div>
				</section>
				<section>
					<?= is_null($this->episode->note) ? $this->episode->description : str_ireplace("<a href=", "<a rel=\"noopener\" target=\"_blank\" href=", $this->episode->note) ?>
				</section>
				<section>
					Download <a href="<?= $this->getRequestUrl(RequestType::MP3) ?>">the audio here</a>.
				</section>
			</article>
		</main>
	</body>
</html>