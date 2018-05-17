<?php
	namespace Mlp\Ep;
	
	//https://img.youtube.com/vi/pBdMN-eeYlc/maxresdefault.jpg
	$url = parse_url($this->episode->getYouTubeThumbnail());
	$fp = fsockopen(dns_get_record($url["host"], DNS_A)[0]["ip"], 80, $errno, $errstr, 30);
	fputs($fp, "GET {$url["path"]} HTTP/1.1\n");
	fputs($fp, "Host: {$url["host"]}\n");
	fputs($fp, "Connection: close\n\n");

	while ($line = fgets($fp)) {
		$line = trim($line);

		if ($line === "")
			break;
	}
	$output = "";

	while ($line = fgets($fp))
		$output .= $line;
	fclose($fp);
	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
	echo $output;
?>