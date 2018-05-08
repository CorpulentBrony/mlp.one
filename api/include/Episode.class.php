<?php
	namespace Mlp\Api;
	require_once "../include/Episode.class.php";
	require_once "../include/DatabaseObject.class.php";
	require_once "Rss.class.php";
	require_once "RssOutput.interface.php";

	class Episode extends \Mlp\Episode implements RssOutput {
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

		public function finalize(): \Mlp\DatabaseObject {
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
			$youtubeUrl = "https://www.youtube.com/watch?v=" . rawurlencode($this->youTubeId);
			$item = $rss->createElement("item");
			$rss->createElement("title", [], $this->title, $item);
			$rss->createElement("link", [], $youtubeUrl, $item);
			$rss->createElement("description", [], $this->description, $item);
			$this->defaultFile->toRss($rss, $item);
			$rss->createElement("guid", ["isPermaLink" => "false"], is_null($this->guidOverride) ? EPISODE_GUID_PREFIX . $episodeNumber : $this->guidOverride, $item);
			$rss->createElement("comments", [], $youtubeUrl, $item);
			$rss->createElement("atom:link", ["href" => $youtubeUrl, "rel" => "replies", "type" => "text/html"], null, $item);
			$rss->createElement("pubDate", [], $this->publishDate->format(\DateTime::RSS), $item);
			$rss->createElement("source", ["url" => RSS_URL], CHANNEL_TITLE, $item);

			if (!is_null($this->note))
				$rss->createCDATASection("content:encoded", [], $this->note, $item);
			$rss->createElement("itunes:duration", [], implode(":", array_map(function (int $value): string { return sprintf("%02d", $value); }, [$this->duration->h, $this->duration->i, $this->duration->s])), $item);
			$rss->createElement("itunes:episode", [], $episodeNumber, $item);
			$rss->createElement("itunes:explicit", [], "Yes", $item);
			$rss->createElement("itunes:season", [], "1", $item);

			if (!is_null($this->subtitle))
				$rss->createElement("itunes:subtitle", [], $this->subtitle, $item);
			$rss->createElement("itunes:title", [], $this->title, $item);

			if (is_null($this->note))
				$rss->createElement("media:description", ["type" => "plain"], $this->description, $item);
			else
				$rss->createCDATASection("media:description", ["type" => "html"], $this->note, $item);
			$mediaGroup = $rss->createElement("media:group", [], null, $item);

			foreach ($this->files as $file)
				$file->toRss($rss, $mediaGroup);
			$rss->createElement("media:player", ["url" => "https://www.youtube.com/embed/" . rawurlencode($this->youTubeId)], null, $rss->createElement("media:content", ["lang" => "en", "medium" => "video"], null, $mediaGroup));
			$rss->createElement("media:keywords", [], implode(", ", array_merge(KEYWORDS, $this->keywords)), $item);
			$rss->createElement("media:title", ["type" => "plain"], $this->title, $item);
		}
	}
?>