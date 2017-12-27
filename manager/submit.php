<?php
	require_once "header.php";
	// http://php.net/manual/en/features.file-upload.post-method.php
	header("Content-Type: application/json");

	(function (): void {
		$cookie = Cookie::getSession();

		if ($cookie === false || !$cookie->isValid()) {
			echo json_encode(["error" => "User is attempting to submit a /mlp/odcast while they are not logged in.  🤔"], JSON_FORCE_OBJECT);
			die;
		}
	})();


	// check that posted form data is accurate
	$episode = new \stdClass();
	$file = new \stdClass();
	$errors = new \Ds\Set();

	// if (preg_match("/^" . $_SESSION["input_fields"]["episodeNumber"]["pattern"] . "$/", $_POST["episodeNumber"]) !== 1)
	// 	$errors->add("episodeNumber");
	// else {
	// 	$episode->number = intval($_POST["episodeNumber"]);

	// 	if ($episode->number < $_SESSION["input_fields"]["episodeNumber"]["min"] || $episode->number > $_SESSION["input_fields"]["episodeNumber"]["max"])
	// 		$errors->add("episodeNumber");
	// }
	// $episode->title = $_POST["episodeTitle"];

	// if (strlen($episode->title) < $_SESSION["input_fields"]["episodeTitle"]["minlength"] || strlen($episode->title) > $_SESSION["input_fields"]["episodeTitle"]["maxlength"])
	// 	$errors->add("episodeTitle");
	// $episode->subtitle = $_POST["episodeSubtitle"];

	// if (strlen($episode->subtitle) > $_SESSION["input_fields"]["episodeSubtitle"]["maxlength"])
	// 	$errors->add("episodeSubtitle");
	// check file with is_uploaded_file first
	// check file is proper mime type
	// move file using S3
	// remove file from temp files
	// set metadata in database
	// return response
	var_dump($_POST);
	var_dump($_FILES);
?>