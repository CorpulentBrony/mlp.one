<?php
	namespace Mlp;

	/*
		Use public const for all enum members
		Add names of consts to be excluded from showing up in getKeys or getValues to __EXCLUDE_FROM_ENUM
		Constant values must be integers
		Hint: Add a function leveraging getValues with the same name as the class to do reverse lookups
	*/
	abstract class Enum {
		protected const __EXCLUDE_FROM_ENUM = [];
		protected static $keys = null; // \Ds\Map
		protected static $values = null; // \Ds\Map
		// protected static $reflection = null; // \ReflectionClass

		public static function getKeys(): \Ds\Map {
			if (!is_null(self::$keys))
				return self::$keys;
			if (!is_null(self::$values))
				return self::$values->reduce(function(\Ds\Map $keys, int $value, string $key): \Ds\Map {
					$keys->put($key, $value);
					return $keys;
				}, new \Ds\Map());
			$reflection = new \ReflectionClass(get_called_class());
			return self::$keys = array_reduce($reflection->getReflectionConstants(), function(\Ds\Map $keys, \ReflectionClassConstant $constant): \Ds\Map {
				if ($constant->isPublic() && !in_array($constant->getName(), static::__EXCLUDE_FROM_ENUM, true))
					$keys->put($constant->getName(), $constant->getValue());
				return $keys;
			}, new \Ds\Map());
		}

		public static function getValues(): \Ds\Map {
			if (!is_null(self::$values))
				return self::$values;
			if (!is_null(self::$keys))
				return self::$keys->reduce(function(\Ds\Map $values, string $key, int $value): \Ds\Map {
					$values->put($value, $key);
					return $values;
				}, new \Ds\Map());
			$reflection = new \ReflectionClass(get_called_class());
			return self::$values = array_reduce($reflection->getReflectionConstants(), function(\Ds\Map $values, \ReflectionClassConstant $constant): \Ds\Map {
				if ($constant->isPublic() && !in_array($constant->getName(), static::__EXCLUDE_FROM_ENUM, true))
					$values->put($constant->getValue(), $constant->getName());
				return $values;
			}, new \Ds\Map());
		}

		public static function isValid(int $needle): bool {
			if (is_null(self::$values) && !is_null(self::$keys))
				return self::$keys->hasValue($needle);
			return self::$values->hasKey($needle);
		}
	}
?>