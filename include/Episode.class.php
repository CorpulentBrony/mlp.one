<?php
	namespace Mlp;
	require_once "DatabaseObject.class.php";

	class Episode extends DatabaseObject {
		public const GUID_BASE = "tag:mlp.one,2018:/mlp/odcast";
		public const GUID_PREFIX = self::GUID_BASE . "?episode=";
		private const MANAGER_URL_PREFIX = "https://mlp.one/ep/";

		// public $defaultFile; // File // i don't think this is used
		public $description;
		public $duration; // \DateInterval
		public $keywords; // array<File>
		public $files; // \Ds\Set
		public $guidOverride;
		public $length;
		public $note;
		public $number;
		public $publishDate; // \DateTime
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

		public function getDurationFormatted(): string {
			require_once "../include/utility.inc.php";
			return implode(", ", array_diff([\Mlp\pluralize($this->duration->h, "hour"), \Mlp\pluralize($this->duration->i, "minute"), \Mlp\pluralize($this->duration->s, "second")], [""]));
		}

		public function getEpisodeManagerUrl(): string { return self::MANAGER_URL_PREFIX . strval($this->number); }
		public function getGuid(): string { return is_null($this->guidOverride) ? self::GUID_PREFIX . strval($this->number) : $this->guidOverride; }
		public function getYouTubeEmbedUrl(): string { return "https://www.youtube.com/embed/" . rawurlencode($this->youTubeId); }
		public function getYouTubeThumbnail(): string { return "https://img.youtube.com/vi/" . rawurlencode($this->youTubeId) . "/maxresdefault.jpg"; }
		public function getYouTubeUrl(): string { return "https://www.youtube.com/watch?v=" . rawurlencode($this->youTubeId); }
		// public function serialize(): string {
		// 	// [];
		// }
		// public function unserialize($serialized) {

		// }
	}
?>