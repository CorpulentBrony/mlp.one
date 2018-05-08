<?php
	namespace Mlp\Api;
	require_once "../include/DatabaseResult.class.php";
	require_once "../include/Episodes.class.php";
	require_once "Episode.class.php";
	require_once "Files.class.php";
	require_once "Rss.class.php";
	require_once "RssOutput.interface.php";

	class Episodes extends \Mlp\Episodes implements RssOutput {
		const COLLECTION_OF_CLASS = "\Mlp\Api\Episode";

		public static function fetch(array $searchParameters = [], bool $doAttachFiles = true): \Mlp\DatabaseResult {
			$episodes = parent::fetch([], false);
			$episodes->attachFiles(Files::fetch());
			return $episodes;
		}
		
		public function toRss(Rss $rss): void {
			foreach ($this->episodes as $episode)
				$episode->toRss($rss);
		}
	}
?>