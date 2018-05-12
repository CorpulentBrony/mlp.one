<?php
	namespace Mlp\Ep;
	// the S3 way is probably not the best, the X-Accel way goes directly to podcast.mlp.one via a proxy

	// $s3 = new \Aws\S3\S3Client(["region" => "us-east-1", "version" => "latest"]);
	// \GuzzleHttp\Promise\coroutine(function () use ($s3): \Generator {
	// 	$mp3Url = parse_url($this->episode->defaultFile->url);
	// 	$episodeObject = yield $s3->getObjectAsync(["Bucket" => $mp3Url["host"], "Key" => ltrim($mp3Url["path"], "/")]);
	// 	http_response_code(200);
	// 	header("Content-Disposition: attachment; filename='{$this->episode->defaultFile->name}'");
	// 	header("Content-Type: audio/mpeg");

	// 	while (!$episodeObject["Body"]->eof()) {
	// 		echo \GuzzleHttp\Psr7\readline($episodeObject["Body"]);
	// 		ob_flush();
	// 		flush();
	// 	}
	// })->otherwise(function ($err): void {
	// 	if (method_exists($err, "getStatusCode")) {
	// 		$code = $err->getStatusCode();

	// 		if ($code === 404)
	// 			require "error.php";
	// 		http_response_code($code);
	// 		die("Unable to retrieve file from AWS: {$err->getAwsErrorMessage()}");
	// 	}
	// 	var_dump($err);
	// 	die;
	// })
	// ->wait();
	http_response_code(200);
	header("Content-Disposition: attachment; filename=\"{$this->episode->defaultFile->name}\"");
	header("Content-Type: audio/mpeg");
	header("X-Accel-Charset: binary");
	header("X-Accel-Expires: 60");
	header("X-Accel-Redirect: /podcast-episode/" . basename($this->episode->defaultFile->url));
?>