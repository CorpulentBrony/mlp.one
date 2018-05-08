<?php
	namespace Mlp;
	require_once "DatabaseResult.class.php";

	class Files extends DatabaseResult {
		const COLLECTION_OF_CLASS = "\Mlp\File";
		const SQL = <<<sql
			select EpisodeNumber as episodeNumber, Name as name, Url as url, Size as size, MimeType as mimeType, IsDefault as isDefault, BitRate as bitRate, SamplingRate as samplingRate, NumberChannels as numberChannels, Hash as hash
			from Files;
sql;
		public $files = null;

		public function __construct(array $files) {
			$this->files = $files;
		}
	}
?>