<?php
	namespace Mlp\Ep;

	http_response_code(200);
	header("Content-Type: text/plain");
?>Episode <?= $this->episode->number ?> of <?= $_SERVER["SITE_TITLE"] ?>

Title: <?= $this->episode->title ?><?php if (!is_null($this->episode->subtitle)): ?>

Subtitle: <?= $this->episode->subtitle ?><?php endif; ?>

Published: <?= $this->episode->publishDate->format("l, F j") . str_replace(["d", "h", "n", "r", "s", "t"], ["ᵈ", "ʰ", "ⁿ", "ʳ", "ˢ", "ᵗ"], $this->episode->publishDate->format("S")) . $this->episode->publishDate->format(", Y") ?>

Length: <?= $this->episode->length ?> seconds (<?= $this->episode->duration->format("%h hour(s), %i minute(s), %s second(s)") ?>)

Description
-----------
<?= $this->episode->description ?>


Keywords: <?= implode(", ", $this->episode->keywords) ?>


Web page: <?= $this->getRequestUrl(RequestType::HTML) ?>

MP3 file: <?= $this->getRequestUrl(RequestType::MP3) ?> (file size: <?= $this->episode->defaultFile->size ?> bytes)
YouTube: <?= $this->episode->getYouTubeUrl() ?>