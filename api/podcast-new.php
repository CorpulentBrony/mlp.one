<?php
	require_once "../manager/header.php";
	ini_set("zlib.output_compression", 0);
	// ini_set("display_errors", 0);
	// apcu_delete("podcast_hash");

	require "vendor/autoload.php";
	
	const BUCKET = "podcast.mlp.one";
	const CHANNEL_SUMMARY = "Some anons from /mlp/ get together to discuss the show, fandom, and for general bants.  Please be patient, we have autism.";
	const CHANNEL_TITLE = "/mlp/odcast";
	const CONTACT_EMAIL = "corpulent@brony.email (Corpulent Brony)";
	const KEY = "files/";
	const RSS_URL = "http://api.mlp.one/podcast";
	const YOUTUBE_PLAYLIST_ID = "PLpXLx1a_owv0xfz2JH8TEHcCLGBE2kfaX";
	const WEB_URL = "https://mlp.one";

	const CHANNEL_URL = "https://www.youtube.com/playlist?list=" . YOUTUBE_PLAYLIST_ID;
	const URL_PREFIX = "http://" . BUCKET . "/";

	const CHANNEL_IMAGE = URL_PREFIX . "mlpodcast.png";
	const CHANNEL_IMAGE_LARGE = URL_PREFIX . "mlpodcast-large.jpg";
	const RSS_ICON_URL = URL_PREFIX . "rss.png";

	header("Content-Type: text/plain");

	function generateItems(\XMLWriter $xml, array $objectList, array $tagsMap): \XMLWriter {
		foreach ($objectList as $index => $object) {
			if ($tagsMap[$index]->count() === 0)
				continue;
			$description = getDescription($tagsMap[$index]);
			$filePathInfo = pathinfo($object["Key"]);
			$fileUrl = URL_PREFIX . $filePathInfo["dirname"] . "/" . rawurlencode($filePathInfo["basename"]);
			$title = rawurldecode(pathinfo($object["Key"], PATHINFO_FILENAME));
			$youtubeUrl = "https://www.youtube.com/watch?v=" . rawurlencode($tagsMap[$index]->get("youtube-id"));
			$xml->startElement("item");
			xmlAddElementInline($xml, "title", [], $title);
			xmlAddElementInline($xml, "link", [], $youtubeUrl);
			xmlAddElementInline($xml, "description", [], $description);
			xmlAddElementInline($xml, "enclosure", ["length" => $object["Size"], "type" => "audio/mpeg", "url" => $fileUrl]);
			xmlAddElementInline($xml, "author", [], CONTACT_EMAIL);
			xmlAddElementInline($xml, "category", [], CHANNEL_TITLE);
			xmlAddElementInline($xml, "guid", ["isPermaLink" => "true"], $fileUrl);
			xmlAddElementInline($xml, "comments", [], $youtubeUrl);
			xmlAddElementInline($xml, "atom:link", ["href" => $youtubeUrl, "rel" => "replies", "type" => "text/html"]);
			xmlAddElementInline($xml, "pubDate", [], $object["LastModified"]->format(\DateTime::RSS));
			xmlAddElementInline($xml, "source", ["url" => RSS_URL], CHANNEL_TITLE);
			xmlAddElementInline($xml, "itunes:episode", [], $tagsMap[$index]->get("episode"));
			xmlAddElementInline($xml, "itunes:episodeType", [], "full");
			xmlAddElementInline($xml, "itunes:explicit", [], "Yes");
			xmlAddElementInline($xml, "itunes:season", [], "1");
			xmlAddElementInline($xml, "media:category", ["scheme" => "http://http://dmoztools.net", "label" => "Podcasts"], "Computers/Internet/On_the_Web/Podcasts");
			xmlAddElementInline($xml, "media:content", ["fileSize" => $object["Size"], "lang" => "en", "medium" => "audio", "type" => "audio/mpeg", "url" => $fileUrl]);
			xmlAddElementInline($xml, "media:description", ["type" => "plain"], $description);
			xmlAddElement($xml, "media:embed", ["height" => "35", "url" => $fileUrl, "width" => "300"]);
			xmlAddElementInline($xml, "media:param", ["name" => "height"], "35");
			xmlAddElementInline($xml, "media:param", ["name" => "type"], "audio/mpeg");
			xmlAddElementInline($xml, "media:param", ["name" => "width"], "300");
			$xml->endElement();
			xmlAddElementInline($xml, "media:keywords", [], "/mlp/odcast, mlpodcast, mlp, 4chan, pony, horse, podcast");
			xmlAddElementInline($xml, "media:license", ["href" => "https://creativecommons.org/licenses/by-nc/4.0/", "type" => "text/html"], "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)");
			xmlAddElementInline($xml, "media:rating", ["scheme" => "urn:simple"], "adult");
			xmlAddElementInline($xml, "media:rights", ["status" => "userCreated"]);
			xmlAddElementInline($xml, "media:thumbnail", ["height" => "720", "url" => CHANNEL_IMAGE, "width" => "1280"]);
			xmlAddElementInline($xml, "media:thumbnail", ["height" => "1440", "url" => CHANNEL_IMAGE_LARGE, "width" => "1440"]);
			xmlAddElementInline($xml, "media:title", ["type" => "plain"], $title);
			$xml->endElement();
		}
		return $xml;
	}

	function output(string $output): void {
		header("Content-Type: application/rss+xml");
		header("link: <http://podcast.mlp.one>; rel=preconnect; pr=0.75");
		echo $output;
	}

	function xmlAddElement(\XMLWriter $xml, string $name, array $attributes = [], string $text = ""): \XMLWriter {
		$xml->startElement($name);

		foreach ($attributes as $attribute => $value) {
			$xml->startAttribute($attribute);
			$xml->text($value);
			$xml->endAttribute();
		}

		if ($text !== "")
			$xml->text($text);
		return $xml;
	}

	function xmlAddElementInline(\XMLWriter $xml, string $name, array $attributes = [], string $text = ""): \XMLWriter {
		xmlAddElement($xml, $name, $attributes, $text);
		$xml->endElement();
		return $xml;
	}

	class Episodes {
		public $episodes;

		public function __construct(array $episodes) {
			$this->episodes = array_reduce($episodes, function(\Ds\Map $episodes, Episode $episode): \Ds\Map {
				$episodes->put($episode["number"], $episode);
				return $episodes;
			}, new \Ds\Map());
		}

		public function attachFiles(array $files): void {
			foreach ($files as $file)
				$this->episodes->get($file["episodeNumber"])->add($file);
		}
	}

	class DatabaseResult {
		public static $pdo = null;

		public static function fetch(): void {
			echo "in fetch!";
			if (is_null(self::$pdo))
				$pdo = get_called_class();
			echo self::$pdo;
		}
	}

	class Episode extends DatabaseResult {
		const SQL = "select Number as number, Title as title, Subtitle as subtitle, Description as description, Keywords as keywords, Note as note, PublishDate as publishDate, Length as length, YouTubeId as youTubeId from Episodes;";
		public $description;
		public $keywords;
		public $files;
		public $length;
		public $note;
		public $number;
		public $publishDate;
		public $subtitle;
		public $title;
		public $youTubeId;

		public function __construct() {
			$this->files = new \Ds\Set();
		}
	}

	class File extends DatabaseResult {
		const SQL = "select EpisodeNumber as episodeNumber, Name as name, Url as url, Size as size, MimeType as mimeType, IsDefault as isDefault, BitRate as bitRate, SamplingRate as samplingRate, NumberChannels as numberChannels, Hash as hash from Files;";
		public $bitRate;
		public $episodeNumber;
		public $hash;
		public $isDefault;
		public $mimeType;
		public $name;
		public $numberChannels;
		public $samplingRate;
		public $size;
		public $url;
	}

	Episode::fetch();
	File::fetch();

	$pdo = new \PDO(...PDO_ARGS);

	$command = $pdo->prepare(Episode::SQL);
	$command->execute();
	$episodes = new Episodes($command->fetchAll(\PDO::FETCH_CLASS | \PDO::FETCH_PROPS_LATE, "Episode"));

	var_dump($episodes);

	$command = $pdo->prepare(File::SQL);
	$command->execute();
	$files = $command->fetchAll(\PDO::FETCH_CLASS | \PDO::FETCH_PROPS_LATE, "File");

	var_dump($files);

	$episodes->attachFiles($files);

	var_dump($episodes);

	// $s3 = new \Aws\S3\S3Client(["region" => "us-east-1", "version" => "latest"]);
	// \GuzzleHttp\Promise\coroutine(function () use ($s3): \Generator {
	// 	$objectList = (yield $s3->listObjectsV2Async(["Bucket" => BUCKET, "MaxKeys" => 1000, "Prefix" => "files/", "StartAfter" => "files/"]))["Contents"];
	// 	$objectListHash = hash("md5", serialize($objectList));

	// 	if (apcu_fetch("podcast_hash") === $objectListHash) {
	// 		output(apcu_fetch("podcast_body"));
	// 		return;
	// 	}
	// 	$lastModifiedDate = getLastModifiedDate($objectList)->format(\DateTime::RSS);
	// 	$tags = (yield \GuzzleHttp\Promise\all(array_map(function (array $object) use ($s3): \GuzzleHttp\Promise\Promise { return $s3->getObjectTaggingAsync(["Bucket" => BUCKET, "Key" => $object["Key"]]); }, $objectList)));
	// 	$tagsMap = array_map(function (\Aws\Result $tagResultItem): \Ds\Map {
	// 		return array_reduce($tagResultItem["TagSet"], function (\Ds\Map $tagMap, array $tagObject): \Ds\Map {
	// 			$tagMap->put($tagObject["Key"], $tagObject["Value"]);
	// 			return $tagMap;
	// 		}, new \Ds\Map());
	// 	}, $tags);
	// 	$xml = new \XMLWriter();
	// 	$xml->openMemory();
	// 	$xml->setIndent(true);
	// 	$xml->setIndentString("\t");
	// 	$xml->startDocument("1.0", "UTF-8");
	// 	// $xml->writePI("xml-stylesheet", "type=\"text/xsl\" href=\"https://mlp.one/api/podcast.xsl\"");
	// 	xmlAddElement($xml, "rss", ["version" => "2.0", "xmlns:atom" => "http://www.w3.org/2005/Atom", "xmlns:media" => "http://search.yahoo.com/mrss/", "xmlns:itunes" => "http://www.itunes.com/dtds/podcast-1.0.dtd"]);
	// 	$xml->startElement("channel");
	// 	xmlAddElementInline($xml, "title", [], CHANNEL_TITLE);
	// 	xmlAddElementInline($xml, "link", [], WEB_URL);
	// 	xmlAddElementInline($xml, "description", [], CHANNEL_SUMMARY);
	// 	xmlAddElementInline($xml, "language", [], "en");
	// 	xmlAddElementInline($xml, "copyright", [], "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) https://creativecommons.org/licenses/by-nc/4.0/");
	// 	xmlAddElementInline($xml, "managingEditor", [], CONTACT_EMAIL);
	// 	xmlAddElementInline($xml, "webMaster", [], CONTACT_EMAIL);
	// 	xmlAddElementInline($xml, "pubDate", [], $lastModifiedDate);
	// 	xmlAddElementInline($xml, "lastBuildDate", [], (new \DateTime())->format(\DateTime::RSS));
	// 	xmlAddElementInline($xml, "docs", [], "https://validator.w3.org/feed/docs/rss2.html");
	// 	xmlAddElementInline($xml, "generator", [], "mlp.one");
	// 	xmlAddElementInline($xml, "atom:link", ["href" => RSS_URL, "rel" => "self", "type" => "application/rss+xml"]);
	// 	xmlAddElementInline($xml, "atom:link", ["href" => RSS_ICON_URL, "rel" => "icon", "type" => "image/png"]);
	// 	xmlAddElementInline($xml, "atom:icon", [], RSS_ICON_URL);
	// 	xmlAddElementInline($xml, "atom:logo", [], CHANNEL_IMAGE_LARGE);
	// 	xmlAddElementInline($xml, "itunes:type", [], "episodic");
	// 	xmlAddElementInline($xml, "itunes:subtitle", [], "Pure Autism");
	// 	xmlAddElementInline($xml, "itunes:author", [], "/mlp/");
	// 	$xml->startElement("itunes:owner");
	// 	xmlAddElementInline($xml, "itunes:name", [], "Corpulent Brony");
	// 	xmlAddElementInline($xml, "itunes:email", [], CONTACT_EMAIL);
	// 	$xml->endElement();
	// 	xmlAddElementInline($xml, "itunes:category", ["text" => "TV & Film"]);
	// 	xmlAddElementInline($xml, "itunes:explicit", [], "Yes");
	// 	xmlAddElementInline($xml, "itunes:image", ["href" => CHANNEL_IMAGE_LARGE]);
	// 	$xml->startElement("image");
	// 	xmlAddElementInline($xml, "height", [], "81");
	// 	xmlAddElementInline($xml, "link", [], WEB_URL);
	// 	xmlAddElementInline($xml, "title", [], CHANNEL_TITLE);
	// 	xmlAddElementInline($xml, "url", [], CHANNEL_IMAGE);
	// 	xmlAddElementInline($xml, "width", [], "144");
	// 	$xml->endElement();
	// 	generateItems($xml, $objectList, $tagsMap);
	// 	$xml->endElement();
	// 	$xml->endElement();
	// 	$xml->endDocument();
	// 	$output = $xml->outputMemory();
	// 	unset($xml);
	// 	output($output);
	// 	apcu_store("podcast_hash", $objectListHash);
	// 	apcu_store("podcast_body", $output);
	// })->otherwise(function ($err): void { var_dump($err); })
	// ->wait();
?>