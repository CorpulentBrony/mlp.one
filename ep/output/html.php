<?php
	namespace Mlp\Ep;
	require_once "../include/utility.inc.php";

	const DATE_DISPLAY_FORMAT = "l, F j<\s\u\p>S</\s\u\p>, Y";
	$description = str_replace("\n", " ", (strlen($this->episode->description) > 300) ? substr($this->episode->description, 0, 299) . "&hellip;" : $this->episode->description);
	$thisEpisodeNumber = strval($this->episode->number);
	$episodeFullTitle = "{$this->episode->title} - {$_SERVER["SITE_TITLE"]}";
	$filePathInfo = pathinfo($this->episode->defaultFile->name);
	$fileUrl = str_ireplace("http://", "https://", $this->episode->defaultFile->url);
	$guid = $this->episode->getGuid();
	$keywords = implode(",", $this->episode->keywords);
	$nextEpisodeNumber = $this->getNextEpisodeNumber();
	$previousEpisodeNumber = $this->getPreviousEpisodeNumber();
	$publishDateIsoFormat = $this->episode->publishDate->format("Y-m-d");
	$requestUrl = preg_replace("/\.html$/", "", $this->getRequestUrl(RequestType::HTML));
	$requestUrlMp3 = $this->getRequestUrl(RequestType::MP3);
	$requestUrlOgg = $this->getRequestUrl(RequestType::OGG);
	$youTubeThumbnail = $this->episode->getYouTubeThumbnail();
	$youTubeUrl = $this->episode->getYouTubeUrl();
	$skipPreviousSvg = \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_previous_24px.svg", ["aria-label" => "Go to previous episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Previous Episode"]);
	$skipNextSvg = \Mlp\getSvg("../material-design-icons/av/svg/production/ic_skip_next_24px.svg", ["aria-label" => "Go to next episode", "class" => "mdc-button__icon mdc-card__action--icon", "title" => "Next Episode"]);

	function wrapNavSvg(bool $isDisabled, string $svg, string $targetEpisode): string {
		if ($isDisabled)
			return "<button aria-disabled=\"true\" class=\"mdc-button mdc-card__action\" disabled type=\"button\">{$svg}</button>";
		return "<a class=\"mdc-button mdc-card__action\" href=\"{$targetEpisode}\" rel=\"prev\" role=\"button\">{$svg}</a>";
	}

	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
?><!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<meta charset="utf-8">
		<!-- preconnects -->
		<link href="//fonts.googleapis.com" importance="high" rel="preconnect">
		<link href="//fonts.gstatic.com" importance="high" rel="preconnect">
		<link href="//stats.g.doubleclick.net" importance="low" rel="preconnect">
		<link href="//www.google-analytics.com" importance="low" rel="preconnect">
		<!-- preloads -->
		<link as="style" importance="high" href="//fonts.googleapis.com/css?family=Roboto:300,400,500" rel="preload" type="text/css">
		<!-- prefetches -->
		<!-- <link as="audio" importance="low" href="/ep/<?= $thisEpisodeNumber ?>.mp3" rel="prefetch" type="audio/mpeg"> -->
		<!-- modules -->
		<link href="/module/output.js" importance="high" rel="modulepreload">
		<link href="/module/ComponentHandler.js" importance="low" rel="modulepreload">
		<link href="/module/Cache.js" importance="low" rel="modulepreload">
		<link href="/module/Drawer.js" importance="low" rel="modulepreload">
		<link href="/module/MenuComponentHandler.js" importance="low" rel="modulepreload">
		<link href="/module/MoreFormatsMenu.js" importance="low" rel="modulepreload">
		<link href="/module/ShareMenu.js" importance="low" rel="modulepreload">
		<link href="/module/Snackbar.js" importance="low" rel="modulepreload">
		<link href="/module/ToggleableComponentHandler.js" importance="low" rel="modulepreload">
		<link href="/module/TopAppBar.js" importance="low" rel="modulepreload">
		<link href="/module/util.js" importance="low" rel="modulepreload">
		<?= file_get_contents("../common/header_base.html") ?>
		<link href="<?= $requestUrl ?>" rel="canonical self" type="text/html">
		<meta content="<?= $youTubeThumbnail ?>" name="twitter:image" property="og:image">
		<meta content="<?= $youTubeThumbnail ?>">
		<meta content="1280" property="og:image:width">
		<meta content="720" property="og:image:height">
		<meta content="image/png" property="og:image:type">
		<meta content="website" property="og:type">
		<meta content="<?= $requestUrl ?>" property="og:url">
		<meta content="<?= $episodeFullTitle ?>" name="title" property="og:title">
		<meta content="<?= $description ?>" name="description" property="og:description">
		<meta content="<?= $keywords ?>" name="keywords">
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
		<script id="mlp-episode-schema" type="application/ld+json"><?= file_get_contents("https://mlp.one/ep/{$thisEpisodeNumber}.jsonld") ?></script>
		<title><?= $episodeFullTitle ?></title>
		<script async defer importance="low" nomodule src="/js/output.js"></script>
		<script async importance="low" src="/module/output.js" type="module"></script>
		<style>
			:root { --title-prefix-text: "<?= $_SERVER["SITE_TITLE"] ?> "; }
			@media only screen and (max-width: 768px) {
				:root { --title-prefix-text: ""; }
			}
		</style>
	</head>
	<body class="mdc-typography">
		<noscript id="deferred-stylesheets">
			<link href="/css/card.css" importance="high" rel="stylesheet">
			<link href="/css/common.css" importance="high" rel="stylesheet">
			<link href="/css/output.css" importance="high" rel="stylesheet">
			<link href="/css/typography.css" importance="high" rel="stylesheet">
		</noscript>
		<?= file_get_contents("../common/background.html") ?>
		<header class="mdc-top-app-bar">
			<div class="mdc-top-app-bar__row">
				<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
					<button aria-haspopup="menu" class="mdc-top-app-bar__navigation-icon" type="button">
						<?= \Mlp\getSvg("../material-design-icons/navigation/svg/production/ic_menu_24px.svg", ["aria-label" => "Show the episode menu", "title" => "Show Menu"]) ?>
					</button>
					<data class="mdc-top-app-bar__title" value="<?= $thisEpisodeNumber ?>">
						<a href="/" rel="home index" title="<?= $_SERVER["SITE_TITLE"] ?>"></a> #
						<?= $thisEpisodeNumber ?> - <?= $this->episode->title ?>
					</data>
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
		<main role="main">
			<article aria-labelledby="mlp-episode-name" class="mdc-card">
				<!-- <section class="mdc-card__media mdc-card__media--16-9"></section> -->
				<header>
					<h6 id="mlp-episode-name"><?= $this->episode->title ?></h6>
					<aside>
						<time aria-label="Date this episode was published" datetime="<?= $publishDateIsoFormat ?>" title="Publish Date"><?= $this->episode->publishDate->format(DATE_DISPLAY_FORMAT) ?></time>
						<span title="Episode Duration">
							<?= \Mlp\getSvg("../material-design-icons/device/svg/production/ic_access_time_24px.svg", ["height" => 12, "role" => "presentation", "width" => 12]) ?>
							<time aria-label="Episode Duration" datetime="<?= $this->episode->duration->format("PT%hH%iM%sS") ?>"><?= $this->episode->getDurationFormatted() ?></time>
						</span>
					</aside>
				</header>
	 			<mlp-audio-player></mlp-audio-player>
				<mlp-episode-description>
					<?= is_null($this->episode->note) ? str_replace("\n", "<br>", $this->episode->description) : str_ireplace("<a href=", "<a rel=\"noopener\" target=\"_blank\" href=", $this->episode->note) ?>
				</mlp-episode-description>
				<footer class="mdc-card__actions">
					<nav class="mdc-card__action-buttons">
						<a class="mdc-button mdc-button--unelevated mdc-card__action mdc-card__action--button" href="<?= $thisEpisodeNumber ?>.mp3" role="button" type="audio/mpeg">Download</a>
						<a class="mdc-button mdc-card__action mdc-card__action--button" href="<?= $youTubeUrl ?>" rel="external noopener" role="button" target="_blank" type="text/html">Watch</a>
					</nav>
					<nav class="mdc-card__action-icons">
						<?= wrapNavSvg(is_null($previousEpisodeNumber), $skipPreviousSvg, strval($previousEpisodeNumber)) ?>
						<?= wrapNavSvg(is_null($nextEpisodeNumber), $skipNextSvg, strval($nextEpisodeNumber)) ?>
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
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=<?= rawurlencode($requestUrl) ?>&display=popup&ref=plugin&src=share_button" rel="noopener" target="_blank" type="text/html">
											Facebook
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="http://www.tumblr.com/share/link?url=<?= rawurlencode($requestUrl) ?>&title=<?= rawurlencode("{$_SERVER["SITE_TITLE"]} #{$thisEpisodeNumber} - {$this->episode->title}") ?>" rel="noopener" target="_blank" type="text/html">
											Tumblr
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="https://twitter.com/intent/tweet?original_referer<?= rawurlencode($requestUrl) ?>&ref_src=twsrc%5Etfw&text=<?= rawurlencode("{$_SERVER["SITE_TITLE"]} #{$thisEpisodeNumber} - {$this->episode->title}") ?>&tw_p=tweetbutton&url=<?= rawurlencode($requestUrl) ?>" rel="noopener" target="_blank" type="text/html">
											Twitter
										</a>
									</li>
									<li class="mdc-list-item" role="menuitem">
										<a class="mdc-list-item__text mdc-typography--subtitle2" href="http://vkontakte.ru/share.php?url=<?= rawurlencode($requestUrl) ?>" rel="noopener" target="_blank" type="text/html">
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
			</article>
		</main>
		<?= file_get_contents("../common/drawer.html") ?>
		<aside aria-hidden="true" class="mdc-snackbar mdc-snackbar--align-start" role="alert">
			<div class="mdc-snackbar__text mdc-typography--subtitle2"></div>
			<div class="mdc-snackbar__action-wrapper"><button class="mdc-snackbar__action-button" type="button"></button></div>
		</aside>
		<?= file_get_contents("../common/footer.html") ?>
	</body>
</html>