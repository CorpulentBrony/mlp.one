<?php
	namespace Mlp\Ep;
	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
	header("X-Accel-Charset: binary");
	header("X-Accel-Expires: 60");
	header("X-Accel-Redirect: /podcast-episode/" . basename($this->episode->defaultFile->url) . "?torrent");
?>