<?php
	namespace Mlp;

	function array_all(array $array, callable $test): bool {
		foreach ($array as $key => $value)
			if ($test($value, $key) === false)
				return false;
		return true;
	}

	function array_some(array $array, callable $test): bool {
		foreach ($array as $key => $value)
			if ($test($value, $key) === true)
				return true;
		return false;
	}

	function pluralize(int $number, string $noun, string $extraPluralLetters = ""): string {
		if ($number === 0)
			return "";
		$ending = ($number === 1) ? "" : "{$extraPluralLetters}s";
		return strval($number) . " {$noun}{$ending}";
	}

	function getSvg(string $svgFile, array $attributes = []) {
		$svg = new \DOMDocument();
		$svg->load($svgFile);

		foreach ($attributes as $attribute => $value)
			$svg->documentElement->setAttribute($attribute, $value);
		return $svg->saveXML($svg->documentElement);
	}
?>