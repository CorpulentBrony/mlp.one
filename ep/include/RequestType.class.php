<?php
	namespace Mlp\Ep;
	require_once "../include/Enum.class.php";

	abstract class RequestType extends \Mlp\Enum {
		protected const __EXCLUDE_FROM_ENUM = ["UNKNOWN"];
		public const UNKNOWN = 0;
		public const HTML = 1;
		public const MP3 = 2;
		public const JSONLD = 3;
		public const JSON = 4;
		public const XML = 5;
		public const TXT = 6;
		public const JPG = 7;
		public const TORRENT = 8;
		public const OGG = 9;
		public const VTT = 10;

		public static function fromExtension($extension): int {
			if (is_int($extension))
				return $extension;
			$keys = parent::getKeys();
			$extensionUpper = strtoupper($extension);

			if ($keys->hasKey($extensionUpper))
				return $keys->get($extensionUpper);
			throw new \UnexpectedValueException("The requested extension is not supported.  Received: `{$extension}`");
		}
	}

	function RequestType(int $type) {
		return RequestType::getValues()[$type];
	}
?>