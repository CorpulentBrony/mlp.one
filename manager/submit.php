<?php
	require_once "header.php";
	// http://php.net/manual/en/features.file-upload.post-method.php
	header("Content-Type: application/json");

	(function (): void {
		$cookie = Cookie::getSession();

		if ($cookie === false || !$cookie->isValid())
			exit(Errors::single("user", "user is attempting to submit a /mlp/odcast while they are not logged in.  🤔"));
	})();

	const ACL = "public-read";
	const BUCKET = "podcast.mlp.one";
	const KEY = "files/";
	const STORAGE_CLASS = "REDUCED_REDUNDANCY";

	$pdo = new \PDO(...PDO_ARGS);

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

	// check that posted form data is accurate
	$errors = new Errors();
	$errorMessages = [
		"max" => "value must be less than or equal to ",
		"maxlength" => "length must be less than or equal to ",
		"min" => "value must be greater than or equal to ",
		"minlength" => "length must be greater than or equal to ",
		"pattern" => "must match pattern "
	];
	$inputFields = new \Ds\Map();

	function insertDb(\PDO $pdo, string $tableName, \Ds\Map $data): void {
		$statement = $data->keys()->reduce(function ($statement, string $fieldName) { return $statement->set($fieldName); }, new class($tableName) {
			private $insert = "insert into ";
			private $values = "values (";

			public function __construct(string $tableName) { $this->insert .= "{$tableName} ("; }

			public function set(string $fieldName) {
				$this->insert .= ucfirst($fieldName) . ", ";
				$this->values .= ":{$fieldName}, ";
				return $this;
			}

			public function __toString(): string { return substr($this->insert, 0, -2) . ")\n" . substr($this->values, 0, -2) . ");"; }
		});
		$command = $pdo->prepare(strval($statement));

		foreach ($data as $placeholder => $value)
			$command->bindValue(":{$placeholder}", $value);
		$command->execute();
	}

	try {
		foreach ($_SESSION["required_input_fields"] as $fieldType => $fields)
			foreach($fields as $fieldName) {
				$index = $fieldType . ucfirst($fieldName);

				if (empty($_POST[$index]))
					$errors->add($index, "is required");
			}

		foreach ($_SESSION["input_fields"] as $fieldType => $fields) {
			$inputFields->put($fieldType, new \Ds\Map());

			foreach($fields as $fieldName => $properties) {
				$index = $fieldType . ucfirst($fieldName);

				if (!empty($_POST[$index])) {
					$flags = ($properties["filter"] === FILTER_SANITIZE_STRING) ? FILTER_FLAG_NO_ENCODE_QUOTES : (($properties["filter"] === FILTER_SANITIZE_NUMBER_FLOAT) ? FILTER_FLAG_ALLOW_FRACTION : 0);
					$value = filter_var(trim($_POST[$index]), $properties["filter"], $flags);
					$value = ($properties["filter"] === FILTER_SANITIZE_NUMBER_INT) ? intval($value) : (($properties["filter"] === FILTER_SANITIZE_NUMBER_FLOAT) ? floatval($value) : $value);
					$valueIsString = $properties["filter"] === FILTER_SANITIZE_STRING;

					if ($valueIsString) {
						if (array_key_exists("maxlength", $properties) && strlen($value) > $properties["maxlength"])
							$errors->add($index, $errorMessages["maxlength"] . $properties["maxlength"]);

						if (array_key_exists("minlength", $properties) && strlen($value) < $properties["minlength"])
							$errors->add($index, $errorMessages["minlength"] . $properties["minlength"]);

						if (array_key_exists("pattern", $properties) && preg_match("/" . $properties["pattern"] . "/", $value) !== 1)
							$errors->add($index, $errorMessages["pattern"] . $properties["pattern"]);
					}
					list($hasMax, $hasMin) = [array_key_exists("max", $properties), array_key_exists("min", $properties)];

					if ($hasMax || $hasMin) {
						if ($valueIsString)
							$value = strtotime($value);
						$maxComparend = (!$hasMax) ? null : ($valueIsString ? strtotime($properties["max"]) : $properties["max"]);
						$minComparend = (!$hasMin) ? null : ($valueIsString ? strtotime($properties["min"]) : $properties["min"]);

						if ($hasMax && $value > $maxComparend)
							$errors->add($index, $errorMessages["max"] . strval($properties["max"]));

						if ($hasMin && $value < $minComparend)
							$errors->add($index, $errorMessages["min"] . strval($properties["min"]));

						if ($valueIsString)
							$value = date_timestamp_set(new \DateTime(), $value)->format("Y-m-d");
					}
					$inputFields->get($fieldType)->put($fieldName, $value);
				}
			}
		}

		if (!$errors->isEmpty())
			throw new OutputException(strval($errors));
		$tempFile = new \SplFileInfo($_FILES["file"]["tmp_name"]);
		
		// check file is proper mime type
		$inputFieldsEpisode = $inputFields->get("episode");
		$inputFieldsFile = $inputFields->get("file");
		$mimeType = mime_content_type(strval($tempFile));

		// check file with is_uploaded_file first
		if (!is_uploaded_file(strval($tempFile)))
			throw new OutputException(Errors::single("file", "selected file does not appear to have been properly uploaded to server"));

		if (substr($mimeType, 0, 5) !== "audio")
			throw new OutputException(Errors::single("file", "selected file cannot be recognized as an audio file"));
		// check if ep already exists in database
		$command = $pdo->prepare("select count(*) as NumEpisodes from Episodes where Number = ?;");
		$command->execute([$inputFieldsEpisode->get("number")]);

		if ($command->fetchAll(\PDO::FETCH_COLUMN, 0)[0] !== "0")
			throw new OutputException(Errors::single("file", "episode {$inputFieldsEpisode->get("number")} has already been saved to server, please use the edit form to make changes"));
		$fileName = "mlpodcast/" . str_pad(strval($inputFieldsEpisode->get("number")), 4, "0", STR_PAD_LEFT) . "." . pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION);
		// save data about the file before moving and deleting it
		$inputFieldsFile->put("episodeNumber", $inputFieldsEpisode->get("number"));
		$inputFieldsFile->put("name", $_FILES["file"]["name"]);
		$inputFieldsFile->put("url", "http://podcast.mlp.one/files/{$fileName}");
		$inputFieldsFile->put("size", $tempFile->getSize());
		$inputFieldsFile->put("mimeType", $mimeType);
		$inputFieldsFile->put("isDefault", true);
		$inputFieldsFile->put("hash", hash_file("sha256", strval($tempFile), true));
		// move file using S3
		$s3 = new \Aws\S3\S3Client(["region" => "us-east-1", "version" => "latest"]);
		$s3->putObjectAsync(["ACL" => ACL, "Bucket" => BUCKET, "ContentType" => $mimeType, "Key" => KEY . $fileName, "SourceFile" => strval($tempFile), "StorageClass" => STORAGE_CLASS])
			->then(function () use ($tempFile): void { unlink(strval($tempFile)); })
			->otherwise(function ($err): void { throw new OutputException(Errors::single("file", "received following error when attempting to copy file to S3: " . var_export($err, true))); })
			->wait();
		// set metadata in database for episode
		$inputFieldsEpisode->put("length", date_timestamp_set(new \DateTime(), $inputFieldsEpisode->get("length"))->format("H:i:s"));
		insertDb($pdo, "Episodes", $inputFieldsEpisode);
		insertDb($pdo, "Files", $inputFieldsFile);
		// return response
		echo json_encode(["isSuccessful" => true]);
	} catch (OutputException $exception) {
		echo $exception->getMessage();
	}
?>