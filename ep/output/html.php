<?php
	namespace Mlp\Ep;

	const DATE_DISPLAY_FORMAT = "l, F j<\s\u\p>S</\s\u\p>, Y";
	$description = str_replace("\n", " ", $this->episode->description);
	$thisEpisodeNumber = strval($this->episode->number);
	// $episodeFullTitle = "{$_SERVER["SITE_TITLE"]} #" . $thisEpisodeNumber . " - {$this->episode->title}";
	$episodeFullTitle = "{$this->episode->title} - {$_SERVER["SITE_TITLE"]}";
	$fileUrl = str_ireplace("http://", "https://", $this->episode->defaultFile->url);
	$nextEpisodeNumber = $this->getNextEpisodeNumber();
	$previousEpisodeNumber = $this->getPreviousEpisodeNumber();
	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
?><!DOCTYPE html>
<html itemid="<?= $this->episode->getGuid() ?>" itemscope itemtype="http://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<!-- preconnects -->
		<link href="//fonts.googleapis.com" rel="preconnect">
		<link href="//fonts.gstatic.com" rel="preconnect">
		<!-- preloads -->
		<link as="image" href="//www.gstatic.com/psa/static/1.gif" rel="preload" type="image/gif">
		<link as="script" href="//unpkg.com/material-components-web@latest/dist/material-components-web.min.js" rel="preload" type="application/javascript">
		<link as="script" href="//www.google-analytics.com/analytics.js" rel="preload" type="application/javascript">
		<link as="style" href="//fonts.googleapis.com/css?family=Roboto:300,400,500" rel="preload" type="text/css">
		<!-- prefetches -->
		<!-- <link as="audio" href="/ep/<?= $thisEpisodeNumber ?>.mp3" rel="prefetch" type="audio/mpeg"> -->
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
		<link href="/css/output.css" rel="stylesheet" type="text/css">
		<script async defer id="mlp-material-components-web-script" src="https://unpkg.com/material-components-web@latest/dist/material-components-web.min.js"></script>
		<script async defer src="/js/output.js"></script>
		<style type="text/css">
			:root {
				--image-url: url(/ep/<?= $thisEpisodeNumber ?>.jpg);
				--title-prefix-text: "<?= $_SERVER["SITE_TITLE"] ?> #";
			}
			@media only screen and (max-width: 768px) {
				:root { --title-prefix-text: "#"; }
			}

			html::selection { background: var(--mdc-theme-secondary); }
			html::-moz-selection { background: var(--mdc-theme-secondary); }
		</style>
	</head>
	<body class="mdc-typography">
		<picture>
			<source data-pagespeed-no-transform sizes="(min-width: 1024px) 70vw, 100vw" srcset="/image/mlpodcast_couch/3840w.webp 3840w, /image/mlpodcast_couch/2880w.webp 2880w, /image/mlpodcast_couch/1920w.webp 1920w, /image/mlpodcast_couch/1280w.webp 1280w, /image/mlpodcast_couch/960w.webp 960w" type="image/webp">
			<img alt="" data-pagespeed-no-transform id="mlp-img-bg" role="presentation" sizes="(min-width: 1024px) 70vw, 100vw" src="/image/mlpodcast_couch/960w.png" srcset="/image/mlpodcast_couch/3840w.png 3840w, /image/mlpodcast_couch/2880w.png 2880w, /image/mlpodcast_couch/1920w.png 1920w, /image/mlpodcast_couch/1280w.png 1280w" type="image/png">
		</picture>
		<header class="mdc-top-app-bar">
			<div class="mdc-top-app-bar__row">
				<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
					<button aria-haspopup="menu" class="mdc-top-app-bar__navigation-icon">
						<img alt="Show menu" aria-label="Show the episode menu" data-is-svg data-pagespeed-no-transform src="/material-design-icons/navigation/svg/production/ic_menu_24px.svg" srcset="/material-design-icons/navigation/svg/production/ic_menu_48px.svg 2x, /material-design-icons/navigation/svg/production/ic_menu_36px.svg 1.5x" title="Show menu" type="image/svg+xml">
					</button>
					<data class="mdc-top-app-bar__title" value="<?= $thisEpisodeNumber ?>"><?= $thisEpisodeNumber ?> - <?= $this->episode->title ?></data>
				</section>
				<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
					<a class="mdc-top-app-bar__action-item" href="<?= $this->episode->getYouTubeUrl() ?>" rel="external noopener" target="_blank" type="text/html">
						<img alt="Watch on YouTube" aria-label="Watch this episode on YouTube" data-is-svg data-pagespeed-no-transform height="24" src="/fontawesome-free-5.0.13/advanced-options/raw-svg/brands/youtube.svg" title="Watch on YouTube" type="image/svg+xml" width="24">
					</a>
					<a class="mdc-top-app-bar__action-item" href="<?= $thisEpisodeNumber ?>.mp3" type="audio/mpeg">
						<img alt="Download MP3" aria-label="Download this episode in MP3 format" data-is-svg data-pagespeed-no-transform src="/material-design-icons/file/svg/production/ic_file_download_24px.svg" srcset="/material-design-icons/file/svg/production/ic_file_download_48px.svg 2x" title="Download MP3" type="image/svg+xml">
					</a>
				</section>
			</div>
		</header>
		<aside class="mdc-drawer mdc-drawer--temporary">
			<div class="mdc-drawer__toolbar-spacer" role="separator"></div>
			<nav aria-hidden="true" class="mdc-drawer__drawer" role="menu">
				<h3 class="mdc-list-group__subheader"><a class="mdc-list-item" href="/" rel="index" role="menuitem" title="List of episodes">/mlp/odcast</a></h3>
				<ul class="mdc-drawer__content mdc-list">
					<!--# include virtual="/api/podcast-html-list.php" -->
				</ul>
			</nav>
		</aside>
		<main>
			<article class="mdc-card">
				<!-- <section class="mdc-card__media mdc-card__media--16-9"></section> -->
 				<audio aria-label="Embedded audio player to listen to a stream of this episode" controls id="mlp-audio-element" itemprop="audio" itemscope="true" itemtype="http://schema.org/AudioObject" src="<?= $thisEpisodeNumber ?>.mp3" type="audio/mpeg" preload="metadata"></audio>
				<header>
					<h1 class="mdc-typography--headline6"><?= $this->episode->title ?></h1>
					<aside class="mdc-typography--caption">
						<time aria-label="Date this episode was published" datetime="<?= $this->episode->publishDate->format("Y-m-d") ?>" title="Publish Date"><?= $this->episode->publishDate->format(DATE_DISPLAY_FORMAT) ?></time>
						<span title="Episode Duration">
							<img alt="Duration" data-is-svg data-pagespeed-no-transform height="12" role="presentation" src="/material-design-icons/device/svg/production/ic_access_time_24px.svg" srcset="/material-design-icons/device/svg/production/ic_access_time_48px.svg 2x" type="image/svg+xml" width="12">
							<time datetime="<?= $this->episode->duration->format("PT%hH%iM%sS") ?>"><?= $this->episode->getDurationFormatted() ?></time>
						</span>
					</aside>
				</header>
				<section class="mdc-typography--body2">
					<?= is_null($this->episode->note) ? str_replace("\n", "<br>", $this->episode->description) : str_ireplace("<a href=", "<a rel=\"noopener\" target=\"_blank\" href=", $this->episode->note) ?>
				</section>
				<footer class="mdc-card__actions">
					<nav class="mdc-card__action-buttons">
						<a class="mdc-button mdc-card__action mdc-card__action--button" href="<?= $this->episode->getYouTubeUrl() ?>" rel="external noopener" target="_blank" type="text/html">Watch</a>
						<a class="mdc-button mdc-card__action mdc-card__action--button" href="<?= $thisEpisodeNumber ?>.mp3" type="audio/mpeg">Download</a>
					</nav>
					<nav class="mdc-card__action-icons">
						<?php if (is_null($previousEpisodeNumber)): ?>
							<button class="mdc-button mdc-button--dense mdc-button__icon mdc-card__action mdc-card__action--icon" disabled>
								<img alt="&lt;" aria-label="Go to previous episode" data-is-svg data-pagespeed-no-transform src="/material-design-icons/av/svg/production/ic_skip_previous_24px.svg" srcset="/material-design-icons/av/svg/production/ic_skip_previous_48px.svg 2x" title="Previous episode" type="image/svg+xml">
							</button>
						<?php else: ?>
							<a class="mdc-button mdc-button--dense mdc-button__icon mdc-card__action mdc-card__action--icon" href="<?= strval($previousEpisodeNumber) ?>" rel="prev">
								<img alt="&lt;" aria-label="Go to previous episode" data-is-svg data-pagespeed-no-transform src="/material-design-icons/av/svg/production/ic_skip_previous_24px.svg" srcset="/material-design-icons/av/svg/production/ic_skip_previous_48px.svg 2x" title="Previous episode" type="image/svg+xml">
							</a>
						<?php endif; ?>

						<?php if (is_null($nextEpisodeNumber)): ?>
							<button class="mdc-button mdc-button--dense mdc-button__icon mdc-card__action mdc-card__action--icon" disabled>
								<img alt="&lt;" aria-label="Go to previous episode" data-is-svg data-pagespeed-no-transform src="/material-design-icons/av/svg/production/ic_skip_next_24px.svg" srcset="/material-design-icons/av/svg/production/ic_skip_next_48px.svg 2x" title="Previous episode" type="image/svg+xml">
							</button>
						<?php else: ?>
							<a class="mdc-button mdc-button--dense mdc-button__icon mdc-card__action mdc-card__action--icon" href="<?= strval($nextEpisodeNumber) ?>" rel="next">
								<img alt="&lt;" aria-label="Go to previous episode" data-is-svg data-pagespeed-no-transform src="/material-design-icons/av/svg/production/ic_skip_next_24px.svg" srcset="/material-design-icons/av/svg/production/ic_skip_next_48px.svg 2x" title="Previous episode" type="image/svg+xml">
							</a>
						<?php endif; ?>
						<aside class="mdc-menu-anchor">
							<span aria-controls="mlp-menu" aria-haspopup="menu" class="mdc-button mdc-button--dense mdc-button__icon mdc-card__action mdc-card__action--icon" id="mlp-btn-more-formats" role="button" tabindex="0">
								<img alt="More Formats" aria-label="View episode in more formats" data-is-svg data-pagespeed-no-transform src="/material-design-icons/navigation/svg/production/ic_more_vert_24px.svg" srcset="/material-design-icons/navigation/svg/production/ic_more_vert_48px.svg 2x, /material-design-icons/navigation/svg/production/ic_more_vert_36px.svg 1.5x" title="More formats" type="image/svg+xml">
							</span>
							<section aria-hidden="true" class="mdc-menu" id="mlp-menu" role="menu">
								<ul class="mdc-menu__items mdc-list">
									<?=
										array_reduce($this->getAllRequestTypes([RequestType::HTML, RequestType::MP3]), function(string $links, array $typeDescriptor): string {
											return "{$links}<li class=\"mdc-list-item\" role=\"menuitem\"><a class=\"mdc-list-item__text mdc-typography--subtitle2\" href=\"{$typeDescriptor["url"]}\" target=\"_blank\" type=\"{$typeDescriptor["mimeType"]}\">{$typeDescriptor["extension"]}</a></li>";
										}, "")
									?>
								</ul>
							</section>
						</aside>
					</nav>
				</footer>
			</article>
		</main>
	</body>
</html>