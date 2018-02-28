<?php
	require_once "../manager/header.php";
	ini_set("zlib.output_compression", 0);
	// ini_set("display_errors", 0);
	// apcu_delete("podcast_hash");

	require "vendor/autoload.php";
	
	const BUCKET = "podcast.mlp.one";
	const CHANNEL_SUMMARY = "Some anons from /mlp/ get together to discuss the show, fandom, and for general bants.  Please be patient, we have autism.";
	const CHANNEL_SUBTITLE = "Pure Autism";
	const CHANNEL_TITLE = "/mlp/odcast";
	const CONTACT_NAME = "Corpulent Brony";
	const EPISODE_GUID_PREFIX = "tag:mlp.one,2018:/mlp/odcast?episode=";
	const KEY = "files/";
	const LICENSE = ["name" => "Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)", "url" => "https://creativecommons.org/licenses/by-nc/4.0/"];
	const RSS_URL = "http://api.mlp.one/podcast";
	const URL_PREFIX = "http://podcast.mlp.one/";
	const YOUTUBE_PLAYLIST_ID = "PLpXLx1a_owv0xfz2JH8TEHcCLGBE2kfaX";
	const WEB_URL = "https://mlp.one";

	const CHANNEL_IMAGE = URL_PREFIX . "mlpodcast.png";
	const CHANNEL_IMAGE_LARGE = URL_PREFIX . "mlpodcast-large.jpg";
	const CHANNEL_URL = "https://www.youtube.com/playlist?list=" . YOUTUBE_PLAYLIST_ID;
	const CONTACT_EMAIL = "corpulent@brony.email (" . CONTACT_NAME . ")";
	const RSS_ICON_URL = URL_PREFIX . "rss.png";

	header("Content-Type: text/plain");

	function output(string $output): void {
		header("Content-Type: application/rss+xml");
		header("link: <http://podcast.mlp.one>; rel=preconnect; pr=0.75");
		echo $output;
	}

	interface RssOutput {
		public function toRss(Rss $rss): void;
	}

	abstract class DatabaseObject implements RssOutput {
		public abstract function finalize(): DatabaseObject;
	}

	abstract class DatabaseResult {
		private static $pdo;

		public static function fetch(): DatabaseResult {
			$pdo = null;

			if (is_null(self::$pdo))
				self::$pdo = new \PDO(...PDO_ARGS);
			$pdo = self::$pdo;
			$command = $pdo->prepare(static::SQL);
			$command->execute();
			return new static($command->fetchAll(\PDO::FETCH_CLASS | \PDO::FETCH_PROPS_LATE, static::COLLECTION_OF_CLASS));
		}
	}

	class Episodes extends DatabaseResult implements RssOutput {
		const COLLECTION_OF_CLASS = "Episode";
		const SQL = <<<sql
			select Number as number, Title as title, Subtitle as subtitle, Description as description, Keywords as keywords, Note as note, PublishDate as publishDate, Length as length, YouTubeId as youTubeId, GuidOverride as guidOverride
			from Episodes
			order by Number desc;
sql;
		public $episodes;

		public static function fetch(): DatabaseResult {
			$episodes = parent::fetch();
			$episodes->attachFiles(Files::fetch());
			return $episodes;
		}

		public function __construct(array $episodes) {
			$this->episodes = array_reduce($episodes, function(\Ds\Map $episodes, Episode $episode): \Ds\Map {
				$episodes->put(intval($episode->number), $episode->finalize());
				return $episodes;
			}, new \Ds\Map());
		}

		public function attachFiles(Files $files): void {
			foreach ($files->files as $file) {
				$file = $file->finalize();
				$episode = $this->episodes->get($file->episodeNumber);
				$file->episode = $episode;
				$episode->files->add($file);

				if ($file->isDefault)
					$episode->defaultFile = $file;
			}

			foreach ($this->episodes as $episode)
				$episode->files->sort(function (File $a, File $b): int { return $a->isDefault ? -1 : strcmp($a->name, $b->name); });
		}

		public function getLastPublishDate(): \DateTime {
			$lastPublishDate = new \DateTime();
			$lastPublishDate->setTimestamp(0);
			return $this->episodes->reduce(function (\DateTime $lastPublishDate, int $episodeNumber, Episode $episode): \DateTime { return max($lastPublishDate, $episode->publishDate); }, $lastPublishDate);
		}

		public function toRss(Rss $rss): void {
			foreach ($this->episodes as $episode)
				$episode->toRss($rss);
		}
	}

	class Files extends DatabaseResult {
		const COLLECTION_OF_CLASS = "File";
		const SQL = <<<sql
			select EpisodeNumber as episodeNumber, Name as name, Url as url, Size as size, MimeType as mimeType, IsDefault as isDefault, BitRate as bitRate, SamplingRate as samplingRate, NumberChannels as numberChannels, Hash as hash
			from Files;
sql;
		public $files = null;

		public function __construct(array $files) {
			$this->files = $files;
		}
	}

	class Episode extends DatabaseObject implements RssOutput {
		public $defaultFile;
		public $description;
		public $duration;
		public $keywords;
		public $files;
		public $guidOverride;
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

		public function finalize(): DatabaseObject {
			$this->duration = new \DateInterval("PT" . substr_replace(substr_replace($this->length, "H", 2, 1), "M", 5, 1) . "S");
			$this->keywords = json_decode($this->keywords);
			$now = new \DateTimeImmutable("now");
			$then = $now->add($this->duration);
			$this->length = $then->getTimestamp() - $now->getTimestamp();
			$this->number = intval($this->number);
			$this->publishDate = new \DateTime($this->publishDate);
			return $this;
		}

		public function toRss(Rss $rss): void {
			$episodeNumber = strval($this->number);
			$episodeTitle = "Episode {$episodeNumber} - {$this->title}";
			$youtubeUrl = "https://www.youtube.com/watch?v=" . rawurlencode($this->youTubeId);
			$item = $rss->createElement("item");
			$rss->createElement("title", [], $episodeTitle, $item);
			$rss->createElement("link", [], $youtubeUrl, $item);
			$rss->createElement("description", [], $this->description, $item);
			$this->defaultFile->toRss($rss, $item);
			$rss->createElement("guid", ["isPermaLink" => "false"], is_null($this->guidOverride) ? EPISODE_GUID_PREFIX . $episodeNumber : $this->guidOverride, $item);
			$rss->createElement("comments", [], $youtubeUrl, $item);
			$rss->createElement("atom:link", ["href" => $youtubeUrl, "rel" => "replies", "type" => "text/html"], null, $item);
			$rss->createElement("pubDate", [], $this->publishDate->format(\DateTime::RSS), $item);
			$rss->createElement("source", ["url" => RSS_URL], CHANNEL_TITLE, $item);

			if (!is_null($this->note)) {
				$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:content", "http://purl.org/rss/1.0/modules/content/");
				$rss->createElement("content:encoded", [], $this->note, $item);
			}
			$rss->createElement("itunes:duration", [], implode(":", array_map(function (int $value): string { return sprintf("%02d", $value); }, [$this->duration->h, $this->duration->i, $this->duration->s])), $item);
			$rss->createElement("itunes:episode", [], $episodeNumber, $item);
			$rss->createElement("itunes:explicit", [], "Yes", $item);
			$rss->createElement("itunes:season", [], "1", $item);

			if (!is_null($this->subtitle))
				$rss->createElement("itunes:subtitle", [], $this->subtitle, $item);
			$rss->createElement("itunes:title", [], $this->title, $item);
			$rss->createElement("media:description", ["type" => "plain"], $this->description, $item);
			$mediaGroup = $rss->createElement("media:group", [], null, $item);

			foreach ($this->files as $file)
				$file->toRss($rss, $mediaGroup);
			$rss->createElement("media:keywords", [], implode(", ", array_merge(["/mlp/odcast", "mlpodcast", "mlp", "4chan", "pony", "horse", "podcast"], $this->keywords)), $item);
			$rss->createElement("media:title", ["type" => "plain"], $episodeTitle, $item);
		}
	}

	class File extends DatabaseObject implements RssOutput {
		public $bitRate;
		public $episode;
		public $episodeNumber;
		public $hash;
		public $isDefault;
		public $mimeType;
		public $name;
		public $numberChannels;
		public $samplingRate;
		public $size;
		public $url;

		public function finalize(): DatabaseObject {
			$this->bitRate = intval($this->bitRate);
			$this->episodeNumber = intval($this->episodeNumber);
			$this->isDefault = $this->isDefault === "1";
			$this->numberChannels = intval($this->numberChannels);
			$this->samplingRate = floatval($this->samplingRate);
			$this->size = intval($this->size);
			return $this;
		}

		public function toRss(Rss $rss, \DOMElement $parent = null): void {
			if ($parent instanceof \DOMElement) {
				if ($parent->tagName === "item")
					$rss->createElement("enclosure", ["length" => $this->size, "type" => $this->mimeType, "url" => $this->url], null, $parent);
				elseif ($parent->tagName === "media:group") {
					$attributes = [
						"bitrate" => strval($this->bitRate), 
						"channels" => strval($this->numberChannels), 
						"duration" => strval($this->episode->length), 
						"fileSize" => $this->size, 
						"lang" => "en", 
						"medium" => "audio", 
						"samplingrate" => strval($this->samplingRate), 
						"type" => $this->mimeType, 
						"url" => $this->url
					];

					if ($this->isDefault)
						$attributes["isDefault"] = "true";
					$mediaContent = $rss->createElement("media:content", $attributes, null, $parent);
					$rss->createElement("media:hash", ["algo" => "sha-1"], bin2hex($this->hash), $mediaContent);
					$mediaEmbed = $rss->createElement("media:embed", ["height" => "35", "url" => $this->url, "width" => "300"], null, $mediaContent);
					$rss->createElement("media:param", ["name" => "height"], "35", $mediaEmbed);
					$rss->createElement("media:param", ["name" => "type"], $this->mimeType, $mediaEmbed);
					$rss->createElement("media:param", ["name" => "width"], "300", $mediaEmbed);
				}
			}
		}
	}

	class Rss extends \DOMDocument {
		private $channel;

		public function __construct() {
			parent::__construct("1.0", "UTF-8");
			$this->formatOutput = true;
			$this->preserveWhiteSpace = false;
			$rss = $this->createElement("rss", ["version" => "2.0"], null, $this);
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:atom", "http://www.w3.org/2005/Atom");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:cc", "http://creativecommons.org/ns#");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:creativeCommons", "http://blogs.law.harvard.edu/tech/creativeCommonsRssModule");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:media", "http://search.yahoo.com/mrss/");
			$this->channel = $this->createElement("channel", [], null, $rss);
		}

		public function createElement(string $name, array $attributes = [], string $text = null, \DOMNode $parent = null): \DOMElement {
			$element = is_null($text) ? parent::createElement($name) : parent::createElement($name, $text);

			foreach ($attributes as $attribute => $value)
				$element->setAttribute($attribute, $value);

			if (is_null($parent))
				$parent = $this->channel;
			$parent->appendChild($element);
			return $element;
		}
	}

	$episodes = Episodes::fetch();
	$rss = new Rss();
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
	$rss->createElement("atom:link", ["href" => RSS_URL, "rel" => "self", "type" => "application/rss+xml"]);
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
	$rss->createElement("media:category", ["scheme" => "http://http://dmoztools.net", "label" => "Podcasts"], "Computers/Internet/On_the_Web/Podcasts");
	$rss->createElement("media:rating", ["scheme" => "urn:simple"], "adult");
	$rss->createElement("media:rights", ["status" => "userCreated"]);
	$rss->createElement("media:thumbnail", ["height" => "720", "url" => CHANNEL_IMAGE, "width" => "1280"]);
	$rss->createElement("media:thumbnail", ["height" => "1440", "url" => CHANNEL_IMAGE_LARGE, "width" => "1440"]);
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