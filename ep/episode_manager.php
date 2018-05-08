<?php
	ini_set("zlib.output_compression", 0);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);
	header("Content-Type: text/plain");

	require_once "../manager/secrets.php";
	require_once "../api/vendor/autoload.php";

	session_start();

	var_dump(pathinfo($_SERVER["REQUEST_URI"]));

	class UnexpectedDirectoryException extends \UnexpectedValueException {}

	class EpisodeAccessType extends \SplEnum {
		const __default = self::HTML;
		const UNKNOWN = 0;
		const HTML = 1;
		const MP3 = 2;
		const JSONLD = 4;
		const JSON = 8;
		const XML = 16;

		public static function fromExtension(string $extension): self {
			switch ($extension) {
				case "html": return new self(self::HTML);
				case "mp3": return new self(self::MP3);
				case "jsonld": return new self(self::JSONLD);
				case "json": return new self(self::JSON);
				case "xml": return new self(self::XML);
			}
			throw new \UnexpectedValueException("The requested extension is not supported.  Received: `{$extension}`");
		}
	}

	class Episode {
		private const DEFAULT_EXTENSION = "html";
		private const EXPECTED_DIRECTORY = "/ep";

		public $accessType = null;
		public $number = 0;
		private $pathinfo = null;

		public function __construct(string $requestPath) {
			$this->pathinfo = pathinfo($_SERVER["REQUEST_URI"]);
			$this->accessType = $this->pathinfo["extension"] ?? self::DEFAULT_EXTENSION;
			$this->number = $this->pathinfo["filename"];
		}

		public function checkIntegrity(): self {
			if ($this->pathinfo["dirname"] !== self::EXPECTED_DIRECTORY)
				throw new UnexpectedDirectoryException("Expected directory to be `" . self::EXPECTED_DIRECTORY . "`.  Received: `{$_SERVER["REQUEST_URI"]}`");
			else if (!is_numeric($this->number))
				throw new \UnexpectedValueException("Expected a numeric episode number.  Received: {$this->number}");
			$this->accessType = EpisodeAccessType::fromExtension($this->accessType);
			$this->number = intval($this->number);
			return $this;
		}
	}

	$episode = new Episode($_SERVER["REQUEST_URI"]);
	$episode->checkIntegrity();
	var_dump($episode);
	/*
		/ep/n - returns information page about an ep, with description, embedded video, and embedded audio.  also an "edit" button if permissions allow.  if ep does not exist, then load create new ep screen if permissions allow
		/ep/n.html - same as /ep/n
		/ep/n.mp3 - redirects to mp3 file
		/ep/n.jsonld - structured data schema
		/ep/n.json and /ep/n.xml perhaps implement oembed?  https://oembed.com/ or implement my own
	*/
?>