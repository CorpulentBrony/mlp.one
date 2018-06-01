<?php
	namespace Mlp\Ep;
	require_once "../include/utility.inc.php";

	const DATE_DISPLAY_FORMAT = "l, F j<\s\u\p>S</\s\u\p>, Y";
	$description = str_replace("\n", " ", (strlen($this->episode->description) > 300) ? substr($this->episode->description, 0, 299) . "&hellip;" : $this->episode->description);
	$thisEpisodeNumber = strval($this->episode->number);
	// $episodeFullTitle = "{$_SERVER["SITE_TITLE"]} #" . $thisEpisodeNumber . " - {$this->episode->title}";
	$episodeFullTitle = "{$this->episode->title} - {$_SERVER["SITE_TITLE"]}";
	$filePathInfo = pathinfo($this->episode->defaultFile->name);
	$fileUrl = str_ireplace("http://", "https://", $this->episode->defaultFile->url);
	$guid = $this->episode->getGuid();
	$keywords = implode(",", $this->episode->keywords);
	$nextEpisodeNumber = $this->getNextEpisodeNumber();
	$previousEpisodeNumber = $this->getPreviousEpisodeNumber();
	$publishDateIsoFormat = $this->episode->publishDate->format("Y-m-d");
	$requestUrl = $this->getRequestUrl(RequestType::HTML);
	$requestUrlMp3 = $this->getRequestUrl(RequestType::MP3);
	$requestUrlOgg = $this->getRequestUrl(RequestType::OGG);
	$youTubeThumbnail = $this->episode->getYouTubeThumbnail();
	$youTubeUrl = $this->episode->getYouTubeUrl();
	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
?><!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head id="microdata-head">
		<!-- preconnects -->
		<link href="//fonts.googleapis.com" rel="preconnect">
		<link href="//fonts.gstatic.com" rel="preconnect">
		<link href="//www.google-analytics.com" rel="preconnect">
		<!-- preloads -->
		<link as="image" href="//www.gstatic.com/psa/static/1.gif" rel="preload" type="image/gif">
		<link as="script" href="//www.google-analytics.com/analytics.js" rel="preload" type="application/javascript">
		<link as="style" href="//fonts.googleapis.com/css?family=Roboto:300,400,500" rel="preload" type="text/css">
		<!-- prefetches -->
		<!-- <link as="audio" href="/ep/<?= $thisEpisodeNumber ?>.mp3" rel="prefetch" type="audio/mpeg"> -->
		<!--# include file="/common/header_base.html" -->
		<link href="<?= $requestUrl ?>" rel="canonical self" type="text/html">
		<meta content="<?= $youTubeThumbnail ?>" id="microdata-thumbnail" itemprop="image thumbnailUrl" name="twitter:image" property="og:image">
		<meta content="1280" property="og:image:width">
		<meta content="720" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="<?= $requestUrl ?>" itemprop="url" property="og:url">
		<meta content="<?= $episodeFullTitle ?>" name="title" property="og:title">
		<meta content="<?= $description ?>" id="microdata-description" itemprop="description" name="description" property="og:description">
		<meta content="<?= $keywords ?>" itemprop="keywords" name="keywords">
		<meta content="<?= $episodeFullTitle ?>" name="twitter:title">
		<meta content="<?= $description ?>" name="twitter:description">
		<script type="application/ld+json">
			{
				"@context": "http://schema.org",
				"@type": "BreadcrumbList",
				"itemListElement": [{
					"@type": "ListItem",
					"position": 1,
					"item": {
						"@id": "<?= $_SERVER["REQUEST_SCHEME"] ?>://<?= $_SERVER["HTTP_HOST"] ?>/",
						"image": "https:<?= $_SERVER["SITE_IMAGE"] ?>",
						"name": "<?= $_SERVER["SITE_TITLE"] ?>"
					}
				}, {
					"@type": "ListItem",
					"position": 2,
					"item": {
						"@id": "<?= $requestUrl ?>",
						"image": "<?= $this->getRequestUrl(RequestType::JPG) ?>",
						"name": "<?= $episodeFullTitle ?>"
					}
				}]
			}
		</script>
		<script src="<?= $thisEpisodeNumber ?>.jsonld" type="application/ld+json"></script>
		<title><?= $episodeFullTitle ?></title>
		<script async defer nomodule src="/js/output.js"></script>
		<script async src="/module/output.js" type="module"></script>
		<style type="text/css">
			:root {
				--title-prefix-text: "<?= $_SERVER["SITE_TITLE"] ?> ";
			}
			@media only screen and (max-width: 768px) {
				:root { --title-prefix-text: ""; }
			}

			html::selection { background: var(--mdc-theme-secondary); }
			html::-moz-selection { background: var(--mdc-theme-secondary); }
			.mdc-drawer { left: -10000px; }
		</style>
	</head>
	<body class="mdc-typography">
		<noscript id="deferred-stylesheets">
			<link href="/css/output.css" rel="stylesheet" type="text/css">
		</noscript>
		<picture>
			<source data-pagespeed-no-transform sizes="(min-width: 1024px) 70vw, 100vw" srcset="/image/mlpodcast_couch/3840w.webp 3840w, /image/mlpodcast_couch/2880w.webp 2880w, /image/mlpodcast_couch/1920w.webp 1920w, /image/mlpodcast_couch/1280w.webp 1280w, /image/mlpodcast_couch/960w.webp 960w" type="image/webp">
			<img alt="" data-pagespeed-no-transform id="mlp-img-bg" role="presentation" sizes="(min-width: 1024px) 70vw, 100vw" src="/image/mlpodcast_couch/960w.png" srcset="/image/mlpodcast_couch/3840w.png 3840w, /image/mlpodcast_couch/2880w.png 2880w, /image/mlpodcast_couch/1920w.png 1920w, /image/mlpodcast_couch/1280w.png 1280w" type="image/png">
		</picture>
		<header class="mdc-top-app-bar">
			<div class="mdc-top-app-bar__row">
				<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
					<button aria-haspopup="menu" class="mdc-top-app-bar__navigation-icon" type="button">
						<?= \Mlp\getSvg("../material-design-icons/navigation/svg/production/ic_menu_24px.svg", ["aria-label" => "Show the episode menu", "title" => "Show Menu"]) ?>
					</button>
					<data class="mdc-top-app-bar__title" value="<?= $thisEpisodeNumber ?>"><a href="/" rel="home index" title="<?= $_SERVER["SITE_TITLE"] ?>"></a> #<span id="microdata-episode-number" itemprop="episodeNumber position"><?= $thisEpisodeNumber ?></span> - <?= $this->episode->title ?></data>
				</section>
				<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
					<a class="mdc-top-app-bar__action-item" href="<?= $youTubeUrl ?>" rel="external noopener" target="_blank" type="text/html">
						<?= \Mlp\getSvg("../fontawesome-free-5.0.13/advanced-options/raw-svg/brands/youtube.svg", ["aria-label" => "Watch this episode on YouTube", "height" => 24, "title" => "Watch on YouTube", "width" => 24]) ?>
					</a>
					<a class="mdc-top-app-bar__action-item" href="<?= $thisEpisodeNumber ?>.mp3" type="audio/mpeg">
						<?= \Mlp\getSvg("../material-design-icons/file/svg/production/ic_file_download_24px.svg", ["aria-label" => "Download this episode in MP3 format", "title" => "Download MP3"]) ?>
					</a>
				</section>
			</div>
		</header>
		<main>
			<article itemid="<?= $guid ?>" itemref="microdata-episode-number microdata-head" itemscope itemtype="http://schema.org/RadioEpisode" class="mdc-card">
				<data itemprop="isAccessibleForFree" value="true"></data>
				<link href="https://donutsteel.pl" itemprop="license">
				<span itemid="tag:mlp.one,2018:/mlp/odcast?season=1" itemprop="partOfSeason" itemscope itemtype="http://schema.org/RadioSeason"></span>
				<span itemid="tag:mlp.one,2018:/mlp/odcast" itemprop="partOfSeries" itemscope itemtype="http://schema.org/RadioSeries"></span>
				<!-- <section class="mdc-card__media mdc-card__media--16-9"></section> -->
 				<audio aria-label="Embedded audio player to listen to a stream of this episode" controls controlslist="nodownload" id="mlp-audio-element" preload="metadata">
 					<source src="<?= $thisEpisodeNumber ?>.ogg" type="audio/ogg">
 					<source src="<?= $thisEpisodeNumber ?>.mp3" type="audio/mpeg">
 					It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page.
 					<span itemprop="audio" itemref="microdata-access-mode microdata-media-common microdata-thumbnail" itemscope itemtype="http://schema.org/AudioObject">
 						<link href="<?= $requestUrlOgg ?>" itemprop="contentUrl url">
 						<span content="ogg" itemprop="encodingFormat"></span>
 						<span content="<?= Request::TYPES[RequestType::OGG]["mimeType"] ?>" itemprop="fileFormat"></span>
 						<span content="<?= $filePathInfo["filename"] ?>.ogg" itemprop="name"></span>
 					</span>
 					<span itemprop="audio" itemref="microdata-access-mode microdata-media-common microdata-thumbnail" itemscope itemtype="http://schema.org/AudioObject">
 						<data itemprop="bitrate" value="<?= strval($this->episode->defaultFile->bitRate) ?>"></data>
 						<data itemprop="contentSize" value="<?= strval($this->episode->defaultFile->size) ?>"></data>
 						<link href="<?= $requestUrlMp3 ?>" itemprop="contentUrl url">
 						<span content="<?= $filePathInfo["extension"] ?>" itemprop="encodingFormat"></span>
 						<span content="<?= Request::TYPES[RequestType::MP3]["mimeType"] ?>" itemprop="fileFormat"></span>
 						<span content="<?= $this->episode->defaultFile->name ?>" itemprop="name"></span>
 					</span>
 				</audio>
				<header>
					<h1 class="mdc-typography--headline6" id="microdata-name" itemprop="headline name"><?= $this->episode->title ?></h1>
					<aside class="mdc-typography--caption">
						<time aria-label="Date this episode was published" datetime="<?= $publishDateIsoFormat ?>" itemprop="datePublished" title="Publish Date"><?= $this->episode->publishDate->format(DATE_DISPLAY_FORMAT) ?></time>
						<span title="Episode Duration">
							<?= \Mlp\getSvg("../material-design-icons/device/svg/production/ic_access_time_24px.svg", ["height" => 12, "role" => "presentation", "width" => 12]) ?>
							<time datetime="<?= $this->episode->duration->format("PT%hH%iM%sS") ?>" itemprop="timeRequired"><?= $this->episode->getDurationFormatted() ?></time>
						</span>
					</aside>
				</header>
				<section class="mdc-typography--body2">
					<?= is_null($this->episode->note) ? str_replace("\n", "<br>", $this->episode->description) : str_ireplace("<a href=", "<a rel=\"noopener\" target=\"_blank\" href=", $this->episode->note) ?>
				</section>
				<footer class="mdc-card__actions">
					<nav class="mdc-card__action-buttons">
						<a class="mdc-button mdc-button--unelevated mdc-card__action mdc-card__action--button" href="<?= $thisEpisodeNumber ?>.mp3" role="button" type="audio/mpeg">Download</a>
						<a class="mdc-button mdc-card__action mdc-card__action--button" href="<?= $youTubeUrl ?>" id="microdata-youtube-url" itemprop="discussionUrl" rel="external noopener" role="button" target="_blank" type="text/html">Watch</a>
					</nav>
					<nav class="mdc-card__action-icons">
						<?php if (is_null($previousEpisodeNumber)): ?>
							<button aria-disabled="true" class="mdc-button mdc-card__action" disabled type="button">
								<?= \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_previous_24px.svg", ["aria-label" => "Go to previous episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Previous Episode"]) ?>
							</button>
						<?php else: ?>
							<a class="mdc-button mdc-card__action" href="<?= strval($previousEpisodeNumber) ?>" rel="prev" role="button">
								<?= \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_previous_24px.svg", ["aria-label" => "Go to previous episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Previous Episode"]) ?>
							</a>
						<?php endif; ?>

						<?php if (is_null($nextEpisodeNumber)): ?>
							<button aria-disabled="true" class="mdc-button mdc-card__action" disabled type="button">
								<?= \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_next_24px.svg", ["aria-label" => "Go to next episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Next Episode"]) ?>
							</button>
						<?php else: ?>
							<a class="mdc-button mdc-card__action" href="<?= strval($nextEpisodeNumber) ?>" rel="next">
								<?= \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_next_24px.svg", ["aria-label" => "Go to next episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Next Episode"]) ?>
							</a>
						<?php endif; ?>
						<aside class="mdc-menu-anchor">
							<button aria-controls="mlp-menu-share" aria-haspopup="menu" class="mdc-button mdc-card__action" id="mlp-btn-share" role="button" tabindex="0" type="button">
								<?= \Mlp\getSvg("../material-design-icons/social/svg/production/ic_share_24px.svg", ["aria-label" => "Share this episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Share"]) ?>
							</button>
							<section aria-hidden="true" class="mdc-menu" id="mlp-menu-share" role="menu">
								<ul class="mdc-menu__items mdc-list">
									<li class="mdc-list-item" role="menuitem">
										<button class="mdc-button mdc-list-item__text mdc-typography--subtitle2" data-href="<?= $requestUrl ?>" id="mlp-menu-share-copy-btn" role="button" tabindex="0" type="button">Clipboard</button>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=<?= rawurlencode($requestUrl) ?>&display=popup&ref=plugin&src=share_button" target="_blank" type="text/html">
											Facebook
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="http://www.tumblr.com/share/link?url=<?= rawurlencode($requestUrl) ?>&title=<?= rawurlencode("{$_SERVER["SITE_TITLE"]} #{$thisEpisodeNumber} - {$this->episode->title}") ?>" target="_blank" type="text/html">
											Tumblr
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="https://twitter.com/intent/tweet?original_referer<?= rawurlencode($requestUrl) ?>&ref_src=twsrc%5Etfw&text=<?= rawurlencode("{$_SERVER["SITE_TITLE"]} #{$thisEpisodeNumber} - {$this->episode->title}") ?>&tw_p=tweetbutton&url=<?= rawurlencode($requestUrl) ?>" target="_blank" type="text/html">
											Twitter
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="http://vkontakte.ru/share.php?url=<?= rawurlencode($requestUrl) ?>" target="_blank" type="text/html">
											Vk
										</a>
									</li>
								</ul>
							</section>
						</aside>
						<aside class="mdc-menu-anchor">
							<button aria-controls="mlp-menu-more-formats" aria-haspopup="menu" class="mdc-button mdc-card__action " id="mlp-btn-more-formats" role="button" tabindex="0" type="button">
								<?= \Mlp\getSvg("../material-design-icons/navigation/svg/production/ic_more_vert_24px.svg", ["aria-label" => "View episode in more formats", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "More Formats"]) ?>
							</button>
							<section aria-hidden="true" class="mdc-menu" id="mlp-menu-more-formats" role="menu">
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
				<span itemprop="potentialAction" itemref="microdata-potential-action-common" itemscope itemtype="http://schema.org/ListenAction">
					<span content="Listen to <?= $_SERVER["SITE_TITLE"] ?>: <?= $this->episode->title ?>" itemprop="name"></span>
					<span itemprop="target" itemref="microdata-target-common" itemscope itemtype="http://schema.org/EntryPoint">
						<link href="<?= $requestUrlMp3 ?>" itemprop="urlTemplate">
					</span>
					<link href="<?= $requestUrlMp3 ?>" itemprop="url">
				</span>
				<span itemprop="potentialAction" itemref="microdata-potential-action-common" itemscope itemtype="http://schema.org/WatchAction">
					<span content="Watch <?= $_SERVER["SITE_TITLE"] ?>: <?= $this->episode->title ?>" itemprop="name"></span>
					<span itemprop="target" itemref="microdata-target-common" itemscope itemtype="http://schema.org/EntryPoint">
						<link href="<?= $youTubeUrl ?>" itemprop="urlTemplate">
					</span>
					<link href="<?= $youTubeUrl ?>" itemprop="url">
				</span>
				<span itemprop="video" itemref="microdata-description microdata-media-common microdata-name microdata-thumbnail" itemscope itemtype="http://schema.org/VideoObject">
					<link href="<?= $this->episode->getYouTubeEmbedUrl() ?>" itemprop="embedUrl">
					<link href="<?= $youTubeUrl ?>" itemprop="url">
				</span>
			</article>
			<span content="auditory" id="microdata-access-mode" itemprop="accessMode accessModeSufficient"></span>
			<span id="microdata-media-common">
				<time datetime="<?= $this->episode->duration->format("PT%hH%iM%sS") ?>" itemprop="duration"></time>
				<time datetime="<?= $publishDateIsoFormat ?>" itemprop="uploadDate"></time>
			</span>
			<span id="microdata-potential-action-common">
				<span content="PotentialStatusAction" itemprop="actionStatus"></span>
				<span itemprop="expectsAcceptanceOf" itemscope itemtype="http://schema.org/Offer">
					<time datetime="<?= $publishDateIsoFormat ?>" itemprop="availabilityStarts"></time>
					<span content="free" itemprop="category"></span>
				</span>
			</span>
			<span id="microdata-target-common">
				<link href="http://schema.googleapis.com/GoogleVideoCast" itemprop="actionPlatform">
				<link href="http://schema.org/DesktopWebPlatform" itemprop="actionPlatform">
				<link href="http://schema.org/MobileWebPlatform" itemprop="actionPlatform">
				<span content="en" itemprop="inLanguage"></span>
			</span>
		</main>
		<!--# include file="/common/drawer.html" -->
		<aside aria-hidden="true" class="mdc-snackbar mdc-snackbar--align-start" role="alert">
			<div class="mdc-snackbar__text mdc-typography--subtitle2"></div>
			<div class="mdc-snackbar__action-wrapper"><button class="mdc-snackbar__action-button" type="button"></button></div>
		</aside>
		<!--# include file="/common/footer.html" -->
	</body>
</html>