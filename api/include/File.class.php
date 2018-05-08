<?php
	namespace Mlp\Api;
	require_once "../include/File.class.php";
	require_once "../include/DatabaseObject.class.php";
	require_once "Rss.class.php";
	require_once "RssOutput.interface.php";

	class File extends \Mlp\File implements RssOutput {
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

		public function finalize(): \Mlp\DatabaseObject {
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
				if ($parent->tagName === "item") {
					$rss->createElement("enclosure", ["length" => $this->size, "type" => $this->mimeType, "url" => $this->url], null, $parent);
					$rss->createElement("dcterms:alternative", [], $this->name, $parent);
				} elseif ($parent->tagName === "media:group") {
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
?>