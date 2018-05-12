<?php
	namespace Mlp\Ep;

	http_response_code(200);
	// header("Content-Type: image/jpeg");
	echo file_get_contents("http://api.mlp.one/podcast");
?>