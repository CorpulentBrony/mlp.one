<?php
	namespace Mlp\Ep;
	$duration = $this->episode->duration->format("PT%hH%iM%sS");
	$fileUrl = $this->getRequestUrl(RequestType::MP3);
	$htmlUrl = preg_replace("/\.html$/", "", $this->getRequestUrl(RequestType::HTML));
	$jpgUrl = $this->getRequestUrl(RequestType::JPG);
	$oggUrl = "${htmlUrl}.ogg";
	$publishDate = $this->episode->publishDate->format("Y-m-d");
	$youTubeUrl = $this->episode->getYouTubeUrl();
	$youTubeUrlIosTemplate = preg_replace("/^https:\/\//", "", $youTubeUrl);
	$youTubeUrlAndroidTemplate = "https/${youTubeUrlIosTemplate}";
	$response = [
		"@context" => "http://schema.org",
		"@id" => $htmlUrl,
		"@type" => "RadioEpisode",
		"episodeNumber" => $this->episode->number,
		"audio" => [[
			"@type" => "AudioObject",
			"@id" => $oggUrl,
			"accessMode" => "auditory",
			"accessModeSufficient" => "auditory",
			"bitrate" => strval($this->episode->defaultFile->bitRate * 1000),
			"contentSize" => strval($this->episode->defaultFile->size),
			"contentUrl" => $oggUrl,
			"duration" => $duration,
			"encodingFormat" => "ogg",
			"fileFormat" => "audio/ogg",
			"name" => preg_replace("/mp3$/", "ogg", $this->episode->defaultFile->name),
			"thumbnailUrl" => $jpgUrl,
			"uploadDate" => $publishDate,
			"url" => $oggUrl
		], [
			"@type" => "AudioObject",
			"@id" => $fileUrl,
			"accessMode" => "auditory",
			"accessModeSufficient" => "auditory",
			"bitrate" => strval($this->episode->defaultFile->bitRate * 1000),
			"contentSize" => strval($this->episode->defaultFile->size),
			"contentUrl" => $fileUrl,
			"duration" => $duration,
			"encodingFormat" => pathinfo($this->episode->defaultFile->name, PATHINFO_EXTENSION),
			"fileFormat" => $this->episode->defaultFile->mimeType,
			"name" => $this->episode->defaultFile->name,
			"thumbnailUrl" => $jpgUrl,
			"uploadDate" => $publishDate,
			"url" => $fileUrl
		]],
		"datePublished" => $publishDate,
		"description" => $this->episode->description,
		"discussionUrl" => $youTubeUrl,
		"headline" => $this->episode->title,
		"image" => $jpgUrl,
		"isAccessibleForFree" => "http://schema.org/True",
		"keywords" => implode(", ", $this->episode->keywords),
		"license" => "https://donutsteel.pl",
		"name" => $this->episode->title,
		"partOfSeason" => ["@id" => "{$_SERVER["PODCAST_TAG"]}?season=1", "@type" => "RadioSeason"],
		"partOfSeries" => ["@id" => "{$_SERVER["PODCAST_TAG"]}", "@type" => "RadioSeries"],
		"position" => $this->episode->number,
		"potentialAction" => [[
			"@type" => "ListenAction",
			"actionStatus" => "http://schema.org/PotentialStatusAction",
			"expectsAcceptanceOf" => [
				"@type" => "Offer",
				"availabilityStarts" => $publishDate,
				"category" => "free"
			],
			"name" => "Listen to {$_SERVER["SITE_TITLE"]}: {$this->episode->title}",
			"target" => [
				"@type" => "EntryPoint",
				"actionPlatform" => ["http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
				"inLanguage" => "en",
				"urlTemplate" => $fileUrl
			],
			"url" => $fileUrl
		],[
			"@type" => "ViewAction",
			"actionStatus" => "http://schema.org/PotentialStatusAction",
			"expectsAcceptanceOf" => [
				"@type" => "Offer",
				"availabilityStarts" => $publishDate,
				"category" => "free"
			],
			"name" => "Watch {$_SERVER["SITE_TITLE"]}: {$this->episode->title}",
			"target" => [
				"@type" => "EntryPoint",
				"actionPlatform" => ["http://schema.org/AndroidPlatform"],
				"inLanguage" => "en",
				"urlTemplate" => "android-app://com.google.android.youtube/{$youTubeUrlAndroidTemplate}"
			],
			"url" => $youTubeUrl
		],[
			"@type" => "ViewAction",
			"actionStatus" => "http://schema.org/PotentialStatusAction",
			"expectsAcceptanceOf" => [
				"@type" => "Offer",
				"availabilityStarts" => $publishDate,
				"category" => "free"
			],
			"name" => "Watch {$_SERVER["SITE_TITLE"]}: {$this->episode->title}",
			"target" => [
				"@type" => "EntryPoint",
				"actionPlatform" => ["http://schema.org/IOSPlatform"],
				"inLanguage" => "en",
				"urlTemplate" => "ios-app://544007664/vnd.youtube/{$youTubeUrlIosTemplate}"
			],
			"url" => $youTubeUrl
		],[
			"@type" => "ViewAction",
			"actionStatus" => "http://schema.org/PotentialStatusAction",
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
		"thumbnailUrl" => $jpgUrl,
		"timeRequired" => $duration,
		"url" => $htmlUrl,
		"video" => [
			"@type" => "VideoObject",
			"@id" => $youTubeUrl,
			"description" => $this->episode->description,
			"duration" => $duration,
			"embedUrl" => $this->episode->getYouTubeEmbedUrl(),
			"headline" => $this->episode->title,
			"name" => $this->episode->title,
			"thumbnailUrl" => $jpgUrl,
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