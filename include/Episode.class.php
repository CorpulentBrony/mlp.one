<?php
	namespace Mlp;
	require_once "DatabaseObject.class.php";

	class Episode extends DatabaseObject {
		private const EPISODE_GUID_PREFIX = "tag:mlp.one,2018:/mlp/odcast?episode=";

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

		public function getGuid(): string { return is_null($this->guidOverride) ? self::EPISODE_GUID_PREFIX . strval($this->number) : $this->guidOverride; }
		public function getYouTubeThumbnail(): string { return "https://img.youtube.com/vi/" . rawurlencode($this->youTubeId) . "/maxresdefault.jpg"; }
	}
?>