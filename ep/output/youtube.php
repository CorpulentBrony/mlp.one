<?php
	// this is broken and not even sure it should be kept around tbh
	header("Content-Type: text/html");
	readfile("https://www.youtube.com/embed/{$this->episode->youTubeId}");
?>