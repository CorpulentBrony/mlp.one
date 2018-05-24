<?php
	namespace Mlp\Ep;
	http_response_code(200);
	header("Content-Disposition: attachment; filename=\"" . pathinfo($this->episode->defaultFile->name, PATHINFO_FILENAME) . ".ogg\"");
	header("Content-Type: {$this->mimeType}");
	header("X-Accel-Charset: binary");
	header("X-Accel-Expires: 60");
	header("X-Accel-Redirect: /podcast-episode/" . pathinfo($this->episode->defaultFile->url, PATHINFO_FILENAME) . ".ogg");
?>