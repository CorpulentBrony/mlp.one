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
	header("Content-Type: {$this->mimeType}");
?><?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mlp:podcast SYSTEM "http://api.mlp.one/namespace-1.0/mlp.dtd">
<mlp:podcast href="https://<?= $_SERVER["HTTP_HOST"] ?>" id="<?= $this->episode->getGuid() ?>" lang="en" xmlns:mlp="http://api.mlp.one/namespace-1.0">
	<mlp:content-rating>Explicit</mlp:content-rating>
	<mlp:description><?= xml($_SERVER["SITE_DESCRIPTION"]) ?></mlp:description>
	<mlp:keywords><?= xml($_SERVER["SITE_KEYWORDS"]) ?></mlp:keywords>
	<mlp:number-of-seasons>1</mlp:number-of-seasons>
	<mlp:start-date>2017-11-10</mlp:start-date>
	<mlp:thumbnail href="https:<?= $_SERVER["SITE_IMAGE"] ?>" />
	<mlp:title><?= xml($_SERVER["SITE_TITLE"]) ?></mlp:title>
	<mlp:episode href="<?= preg_replace("/\.html$/", "", $this->getRequestUrl(RequestType::HTML)) ?>" id="<?= $this->episode->getGuid() ?>" number="<?= $this->episode->number ?>">
		<mlp:default-file><?= filterFile($this->episode->defaultFile) ?></mlp:default-file>
		<mlp:description type="text/plain"><![CDATA[<?= xml($this->episode->description) ?>]]></mlp:description>
		<?php if (!is_null($this->episode->note)): ?>
			<mlp:description type="text/html"><![CDATA[<?= $this->episode->note ?>]]></mlp:description>
		<?php endif; ?>
		<mlp:duration><?= $this->episode->duration->format("PT%hH%iM%sS") ?></mlp:duration>
		<mlp:duration-seconds><?= $this->episode->length ?></mlp:duration-seconds>
		<mlp:files><?= $this->episode->files->reduce(function(string $files, \Mlp\File $file): string { return $files . filterFile($file); }, "") ?></mlp:files>
		<mlp:keywords><?= xml(implode(", ", $this->episode->keywords)) ?></mlp:keywords>
		<mlp:links>
			<?= array_reduce($this->getAllRequestTypes(), function(string $links, array $typeDescriptor): string { return "{$links}<mlp:link href=\"{$typeDescriptor["url"]}\" type=\"{$typeDescriptor["mimeType"]}\" />"; }, "") ?>
		</mlp:links>
		<mlp:publish-date><?= $this->episode->publishDate->format("Y-m-d") ?></mlp:publish-date>
		<?php if (!is_null($this->episode->subtitle)): ?>
			<mlp:subtitle><?= xml($this->episode->subtitle) ?></mlp:subtitle>
		<?php endif; ?>
		<mlp:thumbnail href="<?= $youTubeThumbnail?>" />
		<mlp:title><?= xml($this->episode->title) ?></mlp:title>
		<mlp:youtube-embed href="<?= $this->episode->getYouTubeEmbedUrl() ?>" />
		<mlp:youtube href="<?= $this->episode->getYouTubeUrl() ?>" id="<?= $this->episode->youTubeId ?>" />
	</mlp:episode>
</mlp:podcast>