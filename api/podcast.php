<?php
	require_once "../manager/header.php";
	require_once "include/Episodes.class.php";
	ini_set("zlib.output_compression", 0);
	ini_set("display_errors", 1);
	// apcu_delete("podcast_hash");
	
	const BUCKET = "podcast.mlp.one";
	const CHANNEL_SUMMARY = "Some anons from /mlp/ get together to discuss the show, fandom, and for general bants.  Please be patient, we have autism.";
	const CHANNEL_SUBTITLE = "Pure Autism";
	const CHANNEL_TITLE = "/mlp/odcast";
	const CONTACT_NAME = "Corpulent Brony";
	const KEYWORDS = [CHANNEL_TITLE, "mlpodcast", "mlp", "4chan", "pony", "horse", "podcast"];
	const LICENSE = ["name" => "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)", "url" => "https://creativecommons.org/licenses/by-nc/4.0/"];
	const YOUTUBE_PLAYLIST_ID = "PLpXLx1a_owv0xfz2JH8TEHcCLGBE2kfaX";
	const WEB_URL = "https://mlp.one";

	const CHANNEL_URL = "https://www.youtube.com/playlist?list=" . YOUTUBE_PLAYLIST_ID;
	const CONTACT_EMAIL = "corpulent@brony.email (" . CONTACT_NAME . ")";
	const URL_PREFIX = "http://" . BUCKET . "/";

	const CHANNEL_IMAGE = URL_PREFIX . "mlpodcast-1c1c5a5209c8d6d0fc7713b0defad44f.png";
	const CHANNEL_IMAGE_LARGE = URL_PREFIX . "mlpodcast-large-d41a4943bf081bcb3968921ddaab59ce.jpg";
	const RSS_ICON_URL = URL_PREFIX . "rss.png";

	header("Content-Type: text/plain");

	function output(string $output): void {
		header("Content-Type: application/rss+xml");
		header("link: <" . URL_PREFIX . ">; rel=preconnect; pr=0.9");
		echo str_replace('&lt;!--# echo var="siteTitle" --&gt;', '<!--# echo var="siteTitle" -->', $output);
	}

	$episodes = \Mlp\Api\Episodes::fetch();
	$rss = new \Mlp\Api\Rss();
	$rss->createElement("title", [], CHANNEL_TITLE);
	$rss->createElement("link", [], WEB_URL);
	$rss->createElement("description", [], CHANNEL_SUMMARY);
	$rss->createElement("language", [], "en");
	$rss->createElement("managingEditor", [], CONTACT_EMAIL);
	$rss->createElement("webMaster", [], CONTACT_EMAIL);
	$rss->createElement("pubDate", [], $episodes->getLastPublishDate()->format(\DateTime::RSS));
	$rss->createElement("lastBuildDate", [], (new \DateTime())->format(\DateTime::RSS));
	$rss->createElement("category", [], "Brony");
	$rss->createElement("category", [], "Podcasts");
	$rss->createElement("docs", [], "http://www.rssboard.org/rss-specification");
	$rss->createElement("generator", [], "RSS generator written by Corpulent Brony");
	$rss->createElement("atom:link", ["href" => \Mlp\Api\Rss::URL, "rel" => "self", "type" => "application/rss+xml"]);
	$rss->createElement("atom:link", ["href" => RSS_ICON_URL, "rel" => "icon", "type" => "image/png"]);
	$rss->createElement("atom:icon", [], RSS_ICON_URL);
	$rss->createElement("atom:logo", [], CHANNEL_IMAGE_LARGE);
	$rss->createElement("itunes:type", [], "episodic");
	$rss->createElement("itunes:subtitle", [], CHANNEL_SUBTITLE);
	$rss->createElement("itunes:author", [], "/mlp/");
	$itunesOwner = $rss->createElement("itunes:owner");
	$rss->createElement("itunes:name", [], CONTACT_NAME, $itunesOwner);
	$rss->createElement("itunes:email", [], CONTACT_EMAIL, $itunesOwner);
	$rss->createElement("itunes:category", ["text" => "TV & Film"]);
	$rss->createElement("itunes:explicit", [], "Yes");
	$rss->createElement("itunes:image", ["href" => CHANNEL_IMAGE_LARGE]);
	$rss->createElement("media:category", ["scheme" => "http://dmoztools.net", "label" => "Podcasts"], "Computers/Internet/On_the_Web/Podcasts");
	$rss->createElement("media:rating", ["scheme" => "urn:simple"], "adult");
	$rss->createElement("media:rights", ["status" => "userCreated"]);
	$rss->createElement("media:thumbnail", ["height" => "1440", "url" => CHANNEL_IMAGE_LARGE, "width" => "1440"]);
	$rss->createElement("media:thumbnail", ["height" => "720", "url" => CHANNEL_IMAGE, "width" => "1280"]);
	$image = $rss->createElement("image");
	$rss->createElement("height", [], "81", $image);
	$rss->createElement("link", [], WEB_URL, $image);
	$rss->createElement("title", [], CHANNEL_TITLE, $image);
	$rss->createElement("url", [], CHANNEL_IMAGE, $image);
	$rss->createElement("width", [], "144", $image);
	$episodes->toRss($rss);
	$rss->createElement("copyright", [], LICENSE["name"] . " " . LICENSE["url"]);
	$rss->createElement("cc:attributionName", [], CHANNEL_TITLE);
	$rss->createElement("cc:attributionURL", [], WEB_URL);
	$rss->createElement("cc:license", [], LICENSE["url"]);
	$rss->createElement("creativeCommons:license", [], LICENSE["url"]);
	$rss->createElement("media:license", ["href" => LICENSE["url"], "type" => "text/html"], LICENSE["name"]);
	output($rss->saveXML());
?>