<?php
	namespace Mlp\Ep;

	// basing this **VERY** loosely on the JSON API, mostly because that API is way too strict to fit this use case

	function filterFile(\Mlp\File $file): array {
		return [
			"bitRate" => $file->bitRate,
			"hash" => base64_encode($file->hash),
			"isDefault" => $file->isDefault,
			"mimeType" => $file->mimeType,
			"name" => $file->name,
			"numberChannels" => $file->numberChannels,
			"samplingRate" => $file->samplingRate,
			"size" => $file->size,
			"url" => $file->url
		];
	}

	$files = $this->episode->files->reduce(function(array $files, \Mlp\File $file): array {
		$files[] = filterFile($file);
		return $files;
	}, []);
	$youTubeThumbnail = $this->episode->getYouTubeThumbnail();
	$response = [
		"links" => $this->getAllRequestUrls(),
		"data" => [
			"type" => "episode",
			"id" => $this->episode->getGuid(),
			"attributes" => [
				"defaultFile" => filterFile($this->episode->defaultFile),
				"description" => $this->episode->description,
				"descriptionHtmlFormatted" => $this->episode->note,
				"duration" => $this->episode->duration->format("PT%hH%iM%sS"),
				"durationInSeconds" => $this->episode->length,
				"files" => $files,
				"keywords" => $this->episode->keywords,
				"number" => $this->episode->number,
				"publishDate" => $this->episode->publishDate->format("Y-m-d"),
				"subtitle" => $this->episode->subtitle,
				"thumbnailUrl" => $youTubeThumbnail,
				"title" => $this->episode->title,
				"youTubeEmbedUrl" => $this->episode->getYouTubeEmbedUrl(),
				"youTubeId" => $this->episode->youTubeId,
				"youTubeThumbnailUrl" => $youTubeThumbnail,
				"youTubeUrl" => $this->episode->getYouTubeUrl()
			],
			"relationships" => ["podcast" => ["data" => ["type" => "podcast", "id" => \Mlp\Episode::GUID_BASE]]]
		],
		"included" => [[
			"type" => "podcast",
			"id" => \Mlp\Episode::GUID_BASE,
			"attributes" => [
				"contentRating" => "Explicit",
				"description" => $_SERVER["SITE_DESCRIPTION"],
				"keywords" => $_SERVER["SITE_KEYWORDS"],
				"language" => "en",
				"numberOfSeasons" => 1,
				"startDate" => "2017-11-10",
				"thumbnailUrl" => "https:{$_SERVER["SITE_IMAGE"]}",
				"title" => $_SERVER["SITE_TITLE"]
			],
			"links" => [
				"self" => "https://{$_SERVER["HTTP_HOST"]}"
			]
		]]
	];
	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
	echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
?>