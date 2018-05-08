<?php
	require_once "header.php";
	// http://php.net/manual/en/features.file-upload.post-method.php
	header("Content-Type: application/json");

	(function (): void {
		$cookie = Cookie::getSession();

		if ($cookie === false || !$cookie->isValid())
			exit(Errors::single("user", "user is attempting to submit a /mlp/odcast file while they are not logged in.  🤔"));
	})();

	const ACL = "public-read";
	const BUCKET = "podcast.mlp.one";
	const KEY = "files/";
	const STORAGE_CLASS = "REDUCED_REDUNDANCY";

	const STREAM_RESULT_MAP = ["duration" => "episodeLength", "bit_rate" => "fileBitRate", "sample_rate" => "fileSamplingRate", "channels" => "fileNumberChannels"];
	const TAGS_RESULT_MAP = [
		"track" => "episodeNumber", "title" => "episodeTitle", "Summary" => "episodeDescription", "Keywords" => "episodeKeywords", "Note" => "episodeNote", "date" => "episodePublishDate", "YouTube ID" => "youTubeId", "TOFN" => "fileName"
	];

	function mapToResult(array $values, array $map, array &$result = []) {
		array_walk($map, function (string $resultKey, string $valueKey) use ($values, &$result): void { $result[$resultKey] = $values[$valueKey]; });
		return $result;
	}

	class Errors implements \JsonSerializable {
		private $errors = null; // \Ds\Map

		public static function single(string $field, string $error): string { return json_encode(["errors" => [$field => $error], "isSuccessful" => false]); }

		public function __construct() {
			$this->errors = new \Ds\Map();
		}

		public function add(string $field, string $error): void {
			if ($this->errors->hasKey($field))
				$this->errors->get($field)->add($error);
			else
				$this->errors->put($field, new \Ds\Set([$error]));
		}

		public function hasKey(string $field): bool { return $this->errors->hasKey($field); }
		public function isEmpty(): bool { return $this->errors->isEmpty(); }
		public function jsonSerialize() { return ["errors" => $this->errors, "isSuccessful" => false]; }
		public function __toString(): string { return json_encode($this); }
	}

	class OutputException extends \Exception {}

	class Result implements \JsonSerializable {
		private const STREAM_RESULT_MAP = ["duration" => "episodeLength", "bit_rate" => "fileBitRate", "sample_rate" => "fileSamplingRate", "channels" => "fileNumberChannels"];
		private const TAGS_RESULT_MAP = [
			"track" => "episodeNumber", "title" => "episodeTitle", "Summary" => "episodeDescription", "Keywords" => "episodeKeywords", "Note" => "episodeNote", "date" => "episodePublishDate", "YouTube ID" => "youTubeId", "TOFN" => "fileName"
		];
		private const TRANSFORM_MAP = [
			"episodeNumber" => "intval", "episodeLength" => "Result::convertDuration", "fileBitRate" => "Result::convertBitRate", "fileSamplingRate" => "Result::convertSamplingRate"
		];

		private $result = [];

		public static function convertBitRate(string $value): int { return round(floatval($value) / 1000); }
		public static function convertDuration(string $value): int { return round(floatval($value)); }
		public static function convertSamplingRate(string $value): float { return floatval($value) / 1000; }

		public function __construct(string $tempFilePath, string $mimeType, array $tags, array $stream) {
			$this->map($tags, Result::TAGS_RESULT_MAP);
			$this->map($stream, Result::STREAM_RESULT_MAP);
			$this->result["isSuccessful"] = true;
			$this->result["tempFilePath"] = $tempFilePath;
			$this->result["mimeType"] = $mimeType;
		}

		public function jsonSerialize(): array { return $this->result; }

		private function map(array $values, array $map): void {
			array_walk($map, function (string $resultKey, string $valueKey) use ($values): void {
				$this->result[$resultKey] = array_key_exists($resultKey, Result::TRANSFORM_MAP) ? call_user_func(Result::TRANSFORM_MAP[$resultKey], $values[$valueKey]) : $values[$valueKey];
			});
		}
	}

	try {
		$tempFile = new \SplFileInfo($_FILES["fileUploadInput"]["tmp_name"]);
		$tempFilePath = strval($tempFile);
		
		// check file is proper mime type
		$mimeType = mime_content_type($tempFilePath);

		// check file with is_uploaded_file first
		if (!is_uploaded_file($tempFilePath))
			throw new OutputException(Errors::single("file", "selected file does not appear to have been properly uploaded to server"));

		if (substr($mimeType, 0, 5) !== "audio" && (pathinfo($_FILES["fileUploadInput"]["name"], PATHINFO_EXTENSION) != "mp3" || $mimeType !== "application/octet-stream"))
			throw new OutputException(Errors::single("file", "selected file cannot be recognized as an audio file, mime type is {$mimeType}"));
		// get file details
		$ffprobe = \FFMpeg\FFProbe::create();

		if (!$ffprobe->isValid($tempFilePath))
			throw new OutputException(Errors::single("file", "selected file is not a valid media file according to ffprobe"));
		$tags = $ffprobe->format($tempFilePath)->get("tags");
		$stream = $ffprobe->streams($tempFilePath)->audios()->first();

		if (is_null($stream))
			throw new OutputException(Errors::single("file", "file does not contain a valid audio stream according to ffprobe"));
		$streamData = $stream->all();
		// return response
		echo json_encode(new Result($tempFilePath, $mimeType, $tags, $streamData));
	} catch (OutputException $exception) {
		echo $exception->getMessage();
	}
?>