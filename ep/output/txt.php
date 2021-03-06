<?php
	namespace Mlp\Ep;

	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
?>Episode <?= $this->episode->number ?> of <?= $_SERVER["SITE_TITLE"] ?>

Title: <?= $this->episode->title ?><?php if (!is_null($this->episode->subtitle)): ?>

Subtitle: <?= $this->episode->subtitle ?><?php endif; ?>

Published: <?= $this->episode->publishDate->format("l, F j") . str_replace(["d", "h", "n", "r", "s", "t"], ["ᵈ", "ʰ", "ⁿ", "ʳ", "ˢ", "ᵗ"], $this->episode->publishDate->format("S")) . $this->episode->publishDate->format(", Y") ?>

Length: <?= $this->episode->getDurationFormatted() ?>


Description
-----------
<?= $this->episode->description ?>


Keywords: <?= implode(", ", $this->episode->keywords) ?>


Web page: <?= preg_replace("/\.html$/", "", $this->getRequestUrl(RequestType::HTML)) ?>

MP3 file: <?= $this->getRequestUrl(RequestType::MP3) ?> (file size: <?= $this->episode->defaultFile->size ?> bytes)
YouTube: <?= $this->episode->getYouTubeUrl() ?>