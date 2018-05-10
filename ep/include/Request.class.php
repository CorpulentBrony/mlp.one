<?php
	namespace Mlp\Ep;
	require_once "../include/Exceptions.php";
	require_once "include/Episodes.class.php";
	require_once "include/RequestType.class.php";

	class Request {
		private const DEFAULT_EXTENSION = RequestType::HTML;
		private const EXPECTED_DIRECTORY = "/ep";

		public $type = RequestType::UNKNOWN;
		public $episode = null;
		public $number = 0;
		private $pathinfo = null;
		private $requestPath = "";

		public function __construct(string $requestPath) {
			$this->requestPath = $requestPath;
			$this->pathinfo = pathinfo($this->requestPath);
			$this->type = $this->pathinfo["extension"] ?? self::DEFAULT_EXTENSION;
			$this->number = $this->pathinfo["filename"];
		}

		public function checkIntegrity(): self {
			if ($this->pathinfo["dirname"] !== self::EXPECTED_DIRECTORY)
				throw new \Mlp\UnexpectedDirectoryException("Expected directory to be `" . self::EXPECTED_DIRECTORY . "`.  Received: `{$this->requestPath}`");
			else if (!is_numeric($this->number))
				throw new \UnexpectedValueException("Expected a numeric episode number.  Received: {$this->number}");
			$this->type = RequestType::fromExtension($this->type);
			$number = intval($this->number);
			$this->requestPath = str_replace($this->number, strval($number), $this->requestPath);
			$this->number = $number;
			return $this;
		}

		public function loadEpisode(): self {
			$this->episode = Episodes::fetch([$this->number])->first();
			return $this;
		}

		public function output(): void {
			switch ($this->type) {
				case RequestType::HTML: 
					require "output/html.php";
					break;
				case RequestType::MP3:

					break;
				case RequestType::JSONLD:

					break;

				case RequestType::JSON:

					break;
				case RequestType::XML:

					break;
				case RequestType::TXT:

					break;
				case RequestType::PNG:

					break;
				case RequestType::YOUTUBE:
					require "output/youtube.php";
					break;
				default:
			}
		}
	}
?>