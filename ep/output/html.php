<?php
	const DATE_DISPLAY_FORMAT = "l, F j<\s\u\p>S</\s\u\p>, Y";
	$description = str_replace("\n", " ", $this->episode->description);
	$episodeFullTitle = '<!--# echo var="siteTitle" --> #' . strval($this->episode->number) . " - {$this->episode->title}";
	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemid="<?= $this->episode->getGuid() ?>" itemscope itemtype="http://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<meta charset="utf-8">
		<link href="https://<!--# echo var='host' --><?= $this->requestPath ?>" rel="canonical self" type="text/html">
		<link href="/manifest.jsonmanifest" rel="manifest" type="application/manifest+json">
		<link href="/sitemap.xml" rel="sitemap" type="application/xml">
		<link href="http://api.mlp.one/podcast" rel="alternate" title="/mlp/odcast" type="application/rss+xml">
		<meta content="#363b74" name="theme-color">
		<meta content="/browserconfig.xml" name="msapplication-config">
		<meta content="width=device-width, initial-scale=1, maximum-scale=5" name="viewport">
		<meta content="<?= $this->episode->getYouTubeThumbnail() ?>" itemprop="image" name="twitter:image" property="og:image">
		<meta content="1280" property="og:image:width">
		<meta content="720" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="https://<!--# echo var='host' --><?= $this->requestPath ?>" itemprop="url" property="og:url">
		<meta content="otaku12" property="fb:admins">
		<meta content="summary" name="twitter:card">
		<meta content="@CorpulentBrony" name="twitter:site">
		<meta content="<?= $episodeFullTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $description ?>" itemprop="description" name="description" property="og:description">
		<meta content="<?= implode(",", $this->episode->keywords) ?>" itemprop="keywords" name="keywords">
		<meta content="<?= $episodeFullTitle ?>" name="twitter:title">
		<meta content="<?= $description ?>" name="twitter:description">
		<link href="//www.youtube.com/user/4chanmlp" rel="author publisher" type="text/html">
		<link href="//horse.best" rel="bestpony" type="text/html">
		<link href="//creativecommons.org/licenses/by-nc-sa/4.0/" rel="code-license content-license copyright license" type="text/html">
		<link href="//github.com/CorpulentBrony/mlp.one" rel="code-repository content-repository external source" type="text/html">
		<link href="/podcast/%252Fmlp%252F.jpg" rel="icon" sizes="88x88" type="image/jpeg">
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
						<iframe allow="autoplay; encrypted-media" allowfullscreen src="//www.youtube.com/embed/<?= $this->episode->youTubeId ?>"></iframe>
					</div>
				</section>
				<section>
					<?= str_replace("<a href=", "<a rel=\"noopener\" target=\"_blank\" href=", $this->episode->note) ?>
				</section>
				<section>
					Download <a href="<?= basename($this->requestPath, ".html") ?>.mp3">the audio here</a>.
				</section>
			</article>
		</main>
	</body>
</html>