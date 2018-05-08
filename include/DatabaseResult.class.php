<?php
	namespace Mlp;
	require_once "../manager/secrets.php";

	abstract class DatabaseResult {
		private static $pdo;

		public static function fetch(): DatabaseResult {
			$pdo = null;

			if (is_null(self::$pdo))
				self::$pdo = new \PDO(...PDO_ARGS);
			$pdo = self::$pdo;
			$command = $pdo->prepare(static::SQL);
			$command->execute();
			return new static($command->fetchAll(\PDO::FETCH_CLASS | \PDO::FETCH_PROPS_LATE, static::COLLECTION_OF_CLASS));
		}
	}
?>