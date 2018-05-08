<?php
	namespace Mlp\Api;
	require_once "Rss.class.php";

	interface RssOutput {
		public function toRss(Rss $rss): void;
	}
?>