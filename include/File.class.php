<?php
	namespace Mlp;
	require_once "DatabaseObject.class.php";

	class File extends DatabaseObject {
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
		// public function serialize(): string {

		// }
		// public function unserialize($serialized) {

		// }
	}
?>