<?php
	namespace Mlp\Ep;
	require_once "../include/Exceptions.php";
	require_once "include/Episodes.class.php";
	require_once "include/RequestType.class.php";

	class Request {
		private const DEFAULT_EXTENSION = RequestType::HTML;
		private const EXPECTED_DIRECTORY = "/ep";

		public $type = RequestType::UNKNOWN;
		public $episode = null; // \Mlp\Episode
		public $number = 0;
		private $isIntegrityChecked = false;
		private $pathinfo = null;
		private $requestPath = "";
		private $requestPathAgnostic = "";
		private $urlPrefix = "";

		public function __construct(string $requestPath) {
			$this->requestPath = $requestPath;
			$this->pathinfo = pathinfo($this->requestPath);
			$this->type = $this->pathinfo["extension"] ?? self::DEFAULT_EXTENSION;
			$this->number = $this->pathinfo["filename"];
			$this->urlPrefix = "https://{$_SERVER["HTTP_HOST"]}";
		}

		public function checkIntegrity(): self {
			if ($this->isIntegrityChecked)
				return this;
			else if ($this->pathinfo["dirname"] !== self::EXPECTED_DIRECTORY)
				throw new \Mlp\UnexpectedDirectoryException("Expected directory to be `" . self::EXPECTED_DIRECTORY . "`.  Received: `{$this->requestPath}`");
			else if (!is_numeric($this->number))
				throw new \UnexpectedValueException("Expected a numeric episode number.  Received: {$this->number}");
			$this->type = RequestType::fromExtension($this->type);
			$number = intval($this->number);
			$this->requestPathAgnostic = "{$this->pathinfo["dirname"]}/" . strval($number);
			$this->requestPath = "{$this->requestPathAgnostic}." . strtolower(RequestType($this->type));
			$this->number = $number;
			$this->isIntegrityChecked = true;
			return $this;
		}

		private function getCacheKey(): string { return \Mlp\Episode::GUID_PREFIX . strval($this->number); }

		public function getAllRequestUrls(): array {
			return RequestType::getKeys()->reduce(function(array $result, string $key, int $type): array {
				$result[strtolower($key)] = $this->getRequestUrl($type);
				return $result;
			}, []);
		}

		public function getRequestUrl(int $type = RequestType::UNKNOWN): string {
			if ($type === RequestType::UNKNOWN || $type === $this->type)
				return $this->urlPrefix . $this->requestPath;
			return $this->urlPrefix . (RequestType::isValid($type) ? "{$this->requestPathAgnostic}." . strtolower(RequestType($type)) : $this->requestPath);
		}

		public function loadEpisode(): self {
			if (!$this->isIntegrityChecked)
				$this->checkIntegrity();
			$this->episode = apcu_entry($this->getCacheKey(), function(string $key): \Mlp\Episode { return Episodes::fetch([$this->number])->first(); });
			return $this;
		}

		public function output(): void {
			if (is_null($this->episode->number))
				$this->outputError(true);

			switch ($this->type) {
				case RequestType::HTML: 
					require "output/html.php";
					break;
				case RequestType::MP3:
					require "output/mp3.php";
					break;
				case RequestType::JSONLD:
					require "output/jsonld.php";
					break;
				case RequestType::JSON:
					require "output/json.php";
					break;
				case RequestType::XML:
					require "output/xml.php";
					break;
				case RequestType::TXT:
					require "output/txt.php";
					break;
				case RequestType::PNG:
					require "output/png.php";
					break;
				case RequestType::TORRENT:
					require "output/torrent.php";
					break;
				default:
					$this->outputError();
			}
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