<?php
	namespace Mlp\Ep;
	require_once "../include/Files.class.php";

	class Files extends \Mlp\Files {
		const SQL = <<<sql
			select EpisodeNumber as episodeNumber, Name as name, Url as url, Size as size, MimeType as mimeType, IsDefault as isDefault, BitRate as bitRate, SamplingRate as samplingRate, NumberChannels as numberChannels, Hash as hash
			from Files
			where EpisodeNumber = ?;
sql;
	}
?>