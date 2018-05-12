<?php
	namespace Mlp\Ep;

	function filterFile(\Mlp\File $file): string {
		$attributes = [
			"bit-rate" => strval($file->bitRate),
			"hash" => ["attributes" => ["algo" => "sha-1", "encoding" => "base64"], "value" => base64_encode($file->hash)],
			"name" => xml($file->name),
			"number-channels" => strval($file->numberChannels),
			"sampling-rate" => strval($file->samplingRate),
			"size" => strval($file->size)
		];
		$isDefault = $file->isDefault ? " is-default=\"true\" " : " ";
		return array_reduce(array_keys($attributes), function(string $encoded, string $tag) use ($attributes): string {
			if (is_array($attributes[$tag])) {
				$encoded .= "<mlp:{$tag} " . implode(" ", array_map(function(string $name, string $value) { return "{$name}=\"{$value}\""; }, array_keys($attributes[$tag]["attributes"]), $attributes[$tag]["attributes"])) . ">";
				$encoded .= $attributes[$tag]["value"];
			} else
				$encoded .= "<mlp:{$tag}>{$attributes[$tag]}";
			return "{$encoded}</mlp:{$tag}>";
		}, "<mlp:file href=\"{$file->url}\"{$isDefault}type=\"{$file->mimeType}\">") . "</mlp:file>";
	}

	function xml($value): string {
		if (is_null($value))
			return "";
		return htmlspecialchars(strval($value), ENT_COMPAT | ENT_XML1, "UTF-8", false);
	}

	$youTubeThumbnail = $this->episode->getYouTubeThumbnail();
	http_response_code(200);
	header("Content-Type: application/xml");
?><?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mlp:podcast [
<!ELEMENT mlp:podcast (mlp:content-rating,mlp:description,mlp:keywords?,mlp:number-of-seasons,mlp:start-date,mlp:thumbnail,mlp:title,mlp:episode)>
<!ELEMENT mlp:content-rating (#PCDATA)>
<!ELEMENT mlp:description (#PCDATA)>
<!ELEMENT mlp:keywords (#PCDATA)>
<!ELEMENT mlp:number-of-seasons (#PCDATA)>
<!ELEMENT mlp:start-date (#PCDATA)>
<!ELEMENT mlp:thumbnail EMPTY>
<!ELEMENT mlp:title (#PCDATA)>
<!ELEMENT mlp:episode (mlp:default-file,mlp:description+,mlp:duration,mlp:duration-seconds,mlp:files,mlp:keywords?,mlp:publish-date,mlp:subtitle?,mlp:thumbnail,mlp:title,mlp:youtube-embed,mlp:youtube)>
<!ELEMENT mlp:default-file (mlp:file)>
<!ELEMENT mlp:file (mlp:bit-rate,mlp:hash,mlp:name,mlp:number-channels,mlp:sampling-rate,mlp:size)>
<!ELEMENT mlp:bit-rate (#PCDATA)>
<!ELEMENT mlp:hash (#PCDATA)>
<!ELEMENT mlp:name (#PCDATA)>
<!ELEMENT mlp:number-channels (#PCDATA)>
<!ELEMENT mlp:sampling-rate (#PCDATA)>
<!ELEMENT mlp:size (#PCDATA)>
<!ELEMENT mlp:duration (#PCDATA)>
<!ELEMENT mlp:duration-seconds (#PCDATA)>
<!ELEMENT mlp:files (mlp:file+)>
<!ELEMENT mlp:publish-date (#PCDATA)>
<!ELEMENT mlp:subtitle (#PCDATA)>
<!ELEMENT mlp:youtube-embed EMPTY>
<!ELEMENT mlp:youtube EMPTY>
<!ATTLIST mlp:podcast href CDATA #REQUIRED>
<!ATTLIST mlp:podcast id CDATA #REQUIRED>
<!ATTLIST mlp:podcast lang NMTOKEN "en">
<!ATTLIST mlp:podcast xmlns:mlp CDATA #FIXED "http://api.mlp.one/namespace-1.0">
<!ATTLIST mlp:episode href CDATA #REQUIRED>
<!ATTLIST mlp:episode id CDATA #REQUIRED>
<!ATTLIST mlp:episode number NMTOKEN #REQUIRED>
<!ATTLIST mlp:file href CDATA #REQUIRED>
<!ATTLIST mlp:file is-default (false|true) "false">
<!ATTLIST mlp:file type CDATA "audio/mpeg">
<!ATTLIST mlp:hash algo NMTOKEN #FIXED "sha-1">
<!ATTLIST mlp:hash encoding (base64|hex) "base64">
<!ATTLIST mlp:description type CDATA "text/plain">
<!ATTLIST mlp:thumbnail href CDATA #REQUIRED>
<!ATTLIST mlp:youtube-embed href CDATA #REQUIRED>
<!ATTLIST mlp:youtube href CDATA #REQUIRED>
<!ATTLIST mlp:youtube id ID #REQUIRED>
]>
<mlp:podcast href="https://<?= $_SERVER["HTTP_HOST"] ?>" id="<?= $this->episode->getGuid() ?>" lang="en" xmlns:mlp="http://api.mlp.one/namespace-1.0">
	<mlp:content-rating>Explicit</mlp:content-rating>
	<mlp:description><?= xml($_SERVER["SITE_DESCRIPTION"]) ?></mlp:description>
	<mlp:keywords><?= xml($_SERVER["SITE_KEYWORDS"]) ?></mlp:keywords>
	<mlp:number-of-seasons>1</mlp:number-of-seasons>
	<mlp:start-date>2017-11-10</mlp:start-date>
	<mlp:thumbnail href="https:<?= $_SERVER["SITE_IMAGE"] ?>" />
	<mlp:title><?= xml($_SERVER["SITE_TITLE"]) ?></mlp:title>
	<mlp:episode href="<?= $this->getRequestUrl(RequestType::HTML) ?>" id="<?= $this->episode->getGuid() ?>" number="<?= $this->episode->number ?>">
		<mlp:default-file><?= filterFile($this->episode->defaultFile) ?></mlp:default-file>
		<mlp:description type="text/plain"><?= xml($this->episode->description) ?></mlp:description>
		<?php if (!is_null($this->episode->note)): ?>
			<mlp:description type="text/html"><![CDATA[<?= $this->episode->note ?>]]></mlp:description>
		<?php endif; ?>
		<mlp:duration><?= $this->episode->duration->format("PT%hH%iM%sS") ?></mlp:duration>
		<mlp:duration-seconds><?= $this->episode->length ?></mlp:duration-seconds>
		<mlp:files><?= $this->episode->files->reduce(function(string $files, \Mlp\File $file): string { return $files . filterFile($file); }, "") ?></mlp:files>
		<mlp:keywords><?= xml(implode(", ", $this->episode->keywords)) ?></mlp:keywords>
		<mlp:publish-date><?= $this->episode->publishDate->format("Y-m-d") ?></mlp:publish-date>
		<mlp:subtitle><?= xml($this->episode->subtitle) ?></mlp:subtitle>
		<mlp:thumbnail href="<?= $youTubeThumbnail?>" />
		<mlp:title><?= xml($this->episode->title) ?></mlp:title>
		<mlp:youtube-embed href="<?= $this->episode->getYouTubeEmbedUrl() ?>" />
		<mlp:youtube href="<?= $this->episode->getYouTubeUrl() ?>" id="<?= $this->episode->youTubeId ?>" />
	</mlp:episode>
</mlp:podcast>