<?php
	namespace Mlp\Api;
	require_once "../include/Episode.class.php";
	require_once "Rss.class.php";
	require_once "RssOutput.interface.php";

	const MAX_DESCRIPTION_LENGTH = 250;
	const TRIM_MARKER = "… (read more at %s)";
	const TRIM_MARKER_HTML = "… (read more)";

	class Episode extends \Mlp\Episode implements RssOutput {
		private static function trimText(string $text, string $trimMarker, int $maxLength, bool $useWsTrim = true): string {
			$optionalTrim = function(string $string) use ($useWsTrim): string { return $useWsTrim ? trim($string) : $string; };
			$eol = \PHP_EOL;
			$eow = " ";
			$eolLength = mb_strlen($eol);
			$eowLength = mb_strlen($eow);
			$eolRegex = "/(?:\r\n|\r|\n)/";
			$lines = array_map(function(string $line) use ($eow, $text): array { return explode($eow, $line); }, preg_split($eolRegex, $optionalTrim($text)));
			$output = "";

			foreach ($lines as $words) {
				foreach ($words as $word) {
					if (mb_strlen($output) + mb_strlen($word) + $eowLength > $maxLength)
						return $optionalTrim($output) . $trimMarker;
					$output .= $word . $eow;
				}

				if (count($words) > 0 && mb_strlen($optionalTrim($words[0])) > 0)
					$output = $optionalTrim($output);

				if (mb_strlen($output) + $eolLength > $maxLength)
					return $optionalTrim($output) . $trimMarker;
				$output .= $eol;
			}
			return $optionalTrim($output);
		}

		private function getTrimmedDescription(): string {
			if ($this->number > $this->lastEpisodeNumber)
				return $this->description;
			$trimMarker = sprintf(TRIM_MARKER, parent::getEpisodeManagerUrl());
			$maxLength = MAX_DESCRIPTION_LENGTH - mb_strlen($trimMarker);
			return self::trimText($this->description, $trimMarker, $maxLength);
		}

		private function getTrimmedNote(): string {
			$trimMarker = new \DOMElement("a", TRIM_MARKER_HTML);
			$maxLength = MAX_DESCRIPTION_LENGTH - mb_strlen(TRIM_MARKER_HTML);
			$trimElement = function(\DOMNode $element, int $length = 0) use ($maxLength, &$trimElement): int {
				if ($length < $maxLength) {
					if ($element->nodeType === \XML_TEXT_NODE) {
						$utfValue = mb_convert_encoding($element->nodeValue, "UTF-8", "HTML");
						$newLength = mb_strlen($utfValue);

						if ($length + $newLength > $maxLength)
							$element->nodeValue = mb_convert_encoding(self::trimText($utfValue, "", $maxLength - $length, false), "HTML");
						$length += $newLength;
					} else {
						for ($i = 0; $i < $element->childNodes->length; $i++)
							if ($length < $maxLength)
								$length = $trimElement($element->childNodes->item($i), $length);
							else
								$element->removeChild($element->childNodes->item($i--));
					}
				}
				return $length;
			};

			$doc = new \DOMDocument();
			libxml_use_internal_errors(true);
			$doc->loadHTML(mb_convert_encoding("<div>{$this->note}</div>", "HTML"), \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD);
			libxml_use_internal_errors(false);
			$length = $trimElement($doc->documentElement);

			if ($length >= $maxLength) {
				$trimMarker = $doc->importNode($trimMarker, true);
				$trimMarker->setAttribute("href", parent::getEpisodeManagerUrl());
				$doc->documentElement->appendChild($trimMarker);
			}
			return substr($doc->saveHTML($doc->documentElement), 5, -6);
		}

		public function toRss(Rss $rss): void {
			$episodeManagerUrl = parent::getEpisodeManagerUrl();
			[$description, $note] = ($this->number <= $this->lastEpisodeNumber - 5) ? [$this->getTrimmedDescription(), $this->getTrimmedNote()] : [$this->description, $this->note];
			// $description = ($this->number <= $this->lastEpisodeNumber - 5) ? $this->getTrimmedDescription() : $this->description;
			// $note = ($this->number <= $this->lastEpisodeNumber - 5) ? $this->getTrimmedNote() : $this->description;
			$youtubeUrl = parent::getYouTubeUrl();
			$item = $rss->createElement("item");
			$rss->createElement("test", [], mb_strlen($this->description), $item);
			$rss->createElement("title", [], $this->title, $item);
			$rss->createElement("link", [], $episodeManagerUrl, $item);
			$rss->createCDATASection("description", [], $description, $item);
			$this->defaultFile->toRss($rss, $item);
			$rss->createElement("guid", ["isPermaLink" => "false"], parent::getGuid(), $item);
			$rss->createElement("comments", [], $youtubeUrl, $item);
			$rss->createElement("atom:link", ["href" => $youtubeUrl, "rel" => "replies", "type" => "text/html"], null, $item);
			$rss->createElement("pubDate", [], $this->publishDate->format(\DateTime::RSS), $item);
			$rss->createElement("source", ["url" => Rss::URL], $_SERVER["SITE_TITLE"], $item);

			if (!is_null($this->note))
				$rss->createCDATASection("content:encoded", [], $note, $item);
			$rss->createElement("itunes:duration", [], implode(":", array_map(function (int $value): string { return sprintf("%02d", $value); }, [$this->duration->h, $this->duration->i, $this->duration->s])), $item);
			$rss->createElement("itunes:episode", [], strval($this->number), $item);
			$rss->createElement("itunes:explicit", [], "Yes", $item);
			$rss->createElement("itunes:season", [], "1", $item);

			if (!is_null($this->subtitle))
				$rss->createElement("itunes:subtitle", [], $this->subtitle, $item);
			$rss->createElement("itunes:title", [], $this->title, $item);

			if (is_null($this->note))
				$rss->createElement("media:description", ["type" => "plain"], $description, $item);
			else
				$rss->createCDATASection("media:description", ["type" => "html"], $note, $item);
			$mediaGroup = $rss->createElement("media:group", [], null, $item);

			foreach ($this->files as $file)
				$file->toRss($rss, $mediaGroup);
			$rss->createElement("media:content", ["channels" => 2, "duration" => $this->length, "lang" => "en", "medium" => "audio", "type" => "audio/ogg", "url" => "{$this->getEpisodeManagerUrl()}.ogg"], null, $mediaGroup);
			$rss->createElement("media:player", ["url" => $this->getYouTubeEmbedUrl()], null, $rss->createElement("media:content", ["lang" => "en", "medium" => "video"], null, $mediaGroup));
			$rss->createElement("media:keywords", [], implode(", ", $this->keywords), $item);
			$rss->createElement("media:thumbnail", ["url" => parent::getYouTubeThumbnail()], null, $item);
			$rss->createElement("media:title", ["type" => "plain"], $this->title, $item);
		}
	}
?>