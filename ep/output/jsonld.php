<?php
	namespace Mlp\Ep;
	$duration = $this->episode->duration->format("PT%hH%iM%sS");
	$fileUrl = $this->getRequestUrl(RequestType::MP3); //substr_replace($this->episode->defaultFile->url, "s", 4, 0);
	$publishDate = $this->episode->publishDate->format("Y-m-d");
	$youTubeThumbnail = $this->episode->getYouTubeThumbnail();
	$youTubeUrl = $this->episode->getYouTubeUrl();
	$response = [
		"@context" => "http://schema.org",
		"@id" => $this->episode->getGuid(),
		"@type" => "RadioEpisode",
		"episodeNumber" => $this->episode->number,
		"audio" => [
			"@type" => "AudioObject",
			"@id" => $fileUrl,
			"accessMode" => "auditory",
			"accessModeSufficient" => "auditory",
			"bitrate" => strval($this->episode->defaultFile->bitRate),
			"contentSize" => strval($this->episode->defaultFile->size),
			"contentUrl" => $fileUrl,
			"duration" => $duration,
			"encodingFormat" => pathinfo($this->episode->defaultFile->name, PATHINFO_EXTENSION),
			"fileFormat" => $this->episode->defaultFile->mimeType,
			"name" => $this->episode->defaultFile->name,
			"thumbnailUrl" => $youTubeThumbnail,
			"uploadDate" => $publishDate,
			"url" => $fileUrl
		],
		"datePublished" => $publishDate,
		"description" => $this->episode->description,
		"discussionUrl" => $youTubeUrl,
		"isAccessibleForFree" => true,
		"keywords" => implode(", ", $this->episode->keywords),
		"license" => "https://donutsteel.pl",
		"name" => $this->episode->title,
		"partOfSeason" => ["@id" => "tag:mlp.one,2018:/mlp/odcast?season=1", "@type" => "RadioSeason"],
		"partOfSeries" => ["@id" => "tag:mlp.one,2018:/mlp/odcast", "@type" => "RadioSeries"],
		"position" => $this->episode->number,
		"potentialAction" => [[
			"@type" => "ListenAction",
			"actionStatus" => "PotentialStatusAction",
			"expectsAcceptanceOf" => [
				"@type" => "Offer",
				"availabilityStarts" => $publishDate,
				"category" => "free"
			],
			"name" => "Listen to {$_SERVER["SITE_TITLE"]}: {$this->episode->title}",
			"target" => [
				"@type" => "EntryPoint",
				"actionPlatform" => ["http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/AndroidPlatform", "http://schema.org/DesktopWebPlatform", "http://schema.org/IOSPlatform", "http://schema.org/MobileWebPlatform"],
				"inLanguage" => "en",
				"urlTemplate" => $fileUrl
			],
			"url" => $fileUrl
		],[
			"@type" => "WatchAction",
			"actionStatus" => "PotentialStatusAction",
			"expectsAcceptanceOf" => [
				"@type" => "Offer",
				"availabilityStarts" => $publishDate,
				"category" => "free"
			],
			"name" => "Watch {$_SERVER["SITE_TITLE"]}: {$this->episode->title}",
			"target" => [
				"@type" => "EntryPoint",
				"actionPlatform" => ["http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/AndroidPlatform", "http://schema.org/DesktopWebPlatform", "http://schema.org/IOSPlatform", "http://schema.org/MobileWebPlatform"],
				"inLanguage" => "en",
				"urlTemplate" => $youTubeUrl
			],
			"url" => $youTubeUrl
		]],
		"thumbnailUrl" => $youTubeThumbnail,
		"timeRequired" => $duration,
		"url" => $this->getRequestUrl(RequestType::HTML),
		"video" => [
			"@type" => "VideoObject",
			"@id" => $youTubeUrl,
			"description" => $this->episode->description,
			"embedUrl" => $this->episode->getYouTubeEmbedUrl(),
			"name" => $this->episode->title,
			"thumbnailUrl" => $youTubeThumbnail,
			"uploadDate" => $publishDate,
			"url" => $youTubeUrl
		]
	];

	if (!in_array("Content-type: text/html;charset=UTF-8", headers_list())) {
		http_response_code(200);
		header("Content-Type: {$this->mimeType}");
	}
	echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
?>