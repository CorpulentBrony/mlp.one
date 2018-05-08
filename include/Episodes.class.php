<?php
	namespace Mlp;
	require_once "DatabaseResult.class.php";
	require_once "Episode.class.php";
	require_once "File.class.php";
	require_once "Files.class.php";

	class Episodes extends DatabaseResult {
		const COLLECTION_OF_CLASS = "\Mlp\Episode";
		const SQL = <<<sql
			select Number as number, Title as title, Subtitle as subtitle, Description as description, Keywords as keywords, Note as note, PublishDate as publishDate, Length as length, YouTubeId as youTubeId, GuidOverride as guidOverride
			from Episodes
			order by Number desc;
sql;
		public $episodes;

		public static function fetch(bool $doAttachFiles = true): DatabaseResult {
			$episodes = parent::fetch();

			if ($doAttachFiles)
				$episodes->attachFiles(Files::fetch());
			return $episodes;
		}

		public function __construct(array $episodes) {
			$this->episodes = array_reduce($episodes, function(\Ds\Map $episodes, Episode $episode): \Ds\Map {
				$episodes->put(intval($episode->number), $episode->finalize());
				return $episodes;
			}, new \Ds\Map());
		}

		public function attachFiles(Files $files): void {
			foreach ($files->files as $file) {
				$file = $file->finalize();
				$episode = $this->episodes->get($file->episodeNumber);
				$file->episode = $episode;
				$episode->files->add($file);

				if ($file->isDefault)
					$episode->defaultFile = $file;
			}

			foreach ($this->episodes as $episode)
				$episode->files->sort(function (File $a, File $b): int { return $a->isDefault ? -1 : strcmp($a->name, $b->name); });
		}

		public function getLastPublishDate(): \DateTime {
			$lastPublishDate = new \DateTime();
			$lastPublishDate->setTimestamp(0);
			return $this->episodes->reduce(function (\DateTime $lastPublishDate, int $episodeNumber, Episode $episode): \DateTime { return max($lastPublishDate, $episode->publishDate); }, $lastPublishDate);
		}
	}
?>