<?php
	namespace Mlp\Ep;
	require_once "../include/DatabaseResult.class.php";
	require_once "../include/Episodes.class.php";
	require_once "Files.class.php";

	class Episodes extends \Mlp\Episodes {
		const SQL = <<<sql
			select Number as number, Title as title, Subtitle as subtitle, Description as description, Keywords as keywords, Note as note, PublishDate as publishDate, Length as length, YouTubeId as youTubeId, 
				GuidOverride as guidOverride, (select max(Number) from Episodes) as lastEpisodeNumber
			from Episodes
			where Number = ?;
sql;

		public static function fetch(array $searchParameters = [], bool $doAttachFiles = true): \Mlp\DatabaseResult {
			$episodes = parent::fetch($searchParameters, false);
			$episodes->attachFiles(Files::fetch($searchParameters));
			return $episodes;
		}
	}
?>