<?php
	namespace Mlp\Ep;
	require_once "../include/Exceptions.php";
	require_once "include/Episodes.class.php";
	require_once "include/RequestType.class.php";

	class Request {
		private const DEFAULT_EXTENSION = RequestType::HTML;
		private const EXPECTED_DIRECTORY = "/ep";
		public const TYPES = [
			RequestType::HTML => ["extension" => "html", "mimeType" => "text/html", "outputHandler" => "output/html.php"],
			RequestType::MP3 => ["extension" => "mp3", "mimeType" => "audio/mpeg", "outputHandler" => "output/mp3.php"],
			RequestType::JSONLD => ["extension" => "jsonld", "mimeType" => "application/ld+json", "outputHandler" => "output/jsonld.php"],
			RequestType::JSON => ["extension" => "json", "mimeType" => "application/json", "outputHandler" => "output/json.php"],
			RequestType::XML => ["extension" => "xml", "mimeType" => "application/xml", "outputHandler" => "output/xml.php"],
			RequestType::TXT => ["extension" => "txt", "mimeType" => "text/plain", "outputHandler" => "output/txt.php"],
			RequestType::JPG => ["extension" => "jpg", "mimeType" => "image/jpeg", "outputHandler" => "output/jpg.php"],
			RequestType::TORRENT => ["extension" => "torrent", "mimeType" => "application/x-bittorrent", "outputHandler" => "output/torrent.php"],
			RequestType::OGG => ["extension" => "ogg", "mimeType" => "audio/ogg", "outputHandler" => "output/ogg.php"],
			RequestType::VTT => ["extension" => "vtt", "mimeType" => "text/vtt", "outputHandler" => "output/vtt.php"]
		];

		public static $types = self::TYPES; // array

		public $type = RequestType::UNKNOWN;
		public $episode = null; // \Mlp\Episode
		public $mimeType = "";
		public $number = 0;
		private $isIntegrityChecked = false;
		private $outputHandler = "";
		private $pathinfo = null;
		private $requestPath = "";
		private $requestPathAgnostic = "";
		private $urlPrefix = "";

		public function __construct(string $requestPath) {
			$this->requestPath = parse_url($requestPath)["path"];
			$this->pathinfo = pathinfo($this->requestPath);
			$this->type = $this->pathinfo["extension"] ?? self::DEFAULT_EXTENSION;
			$this->number = $this->pathinfo["filename"];
			$this->urlPrefix = "https://{$_SERVER["HTTP_HOST"]}";
		}

		public function checkIntegrity(): self {
			if ($this->isIntegrityChecked)
				return $this;
			else if ($this->pathinfo["dirname"] !== self::EXPECTED_DIRECTORY)
				$this->outputError();
			// else if ($this->pathinfo["dirname"] !== self::EXPECTED_DIRECTORY)
			// 	throw new \Mlp\UnexpectedDirectoryException("Expected directory to be `" . self::EXPECTED_DIRECTORY . "`.  Received: `{$this->requestPath}`");
			else if (!is_numeric($this->number))
				throw new \UnexpectedValueException("Expected a numeric episode number.  Received: {$this->number}");
			$this->type = RequestType::fromExtension($this->type);
			$this->mimeType = self::TYPES[$this->type]["mimeType"];
			$this->outputHandler = self::TYPES[$this->type]["outputHandler"];
			$number = intval($this->number);
			$this->requestPathAgnostic = "{$this->pathinfo["dirname"]}/" . strval($number);
			$this->requestPath = "{$this->requestPathAgnostic}." . strtolower(RequestType($this->type));
			$this->number = $number;
			$this->isIntegrityChecked = true;
			return $this;
		}

		private function getCacheKey(): string { return \Mlp\Episode::GUID_PREFIX . strval($this->number); }

		public function getAllRequestTypes(array $excludedTypes = null): array {
			array_walk(self::$types, function(array $typeDescriptor, int $type): void { $this->getRequestUrl($type); });
			return (is_null($excludedTypes)) ? self::$types : array_diff_key(self::$types, array_flip($excludedTypes));
		}

		public function getAllRequestUrls(): array {
			return array_column($this->getAllRequestTypes(), "url", "extension");
		}

		public function getNextEpisodeNumber() { return ($this->number >= $this->episode->lastEpisodeNumber) ? null : $this->number + 1; }
		public function getPreviousEpisodeNumber() { return ($this->number <= 1) ? null : $this->number - 1; }

		public function getRequestUrl(int $type = RequestType::UNKNOWN): string {
			if ($type === RequestType::UNKNOWN)
				$type = $this->type;

			if (array_key_exists("url", self::$types[$type]))
				return self::$types[$type]["url"];
			elseif ($type === $this->type)
				return self::$types[$type]["url"] = $this->urlPrefix . $this->requestPath;
			return self::$types[$type]["url"] = $this->urlPrefix . (RequestType::isValid($type) ? "{$this->requestPathAgnostic}." . strtolower(RequestType($type)) : $this->requestPath);
		}

		public function loadEpisode(): self {
			if (!$this->isIntegrityChecked)
				$this->checkIntegrity();
			$this->episode = apcu_entry($this->getCacheKey(), function(string $key): \Mlp\Episode { return Episodes::fetch([$this->number])->first(); }, 60);
			return $this;
		}

		public function output(): void {
			if (is_null($this->episode->number))
				$this->outputError(true);
			else if (!array_key_exists($this->type, self::TYPES))
				$this->outputError();
			require $this->outputHandler;
		}

		private function outputError(bool $deleteFromCache = false): void {
			if ($deleteFromCache)
				apcu_delete($this->getCacheKey());
			http_response_code(404);
			require "output/error.php";
			die;
		}
	}
?>