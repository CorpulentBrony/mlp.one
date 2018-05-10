<?php
	namespace Mlp\Api;
	
	class Rss extends \DOMDocument {
		public const URL = "http://api.mlp.one/podcast";
		private $channel;

		public function __construct() {
			parent::__construct("1.0", "UTF-8");
			$this->formatOutput = true;
			$this->preserveWhiteSpace = false;
			$rss = $this->createElement("rss", ["version" => "2.0"], null, $this);
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:atom", "http://www.w3.org/2005/Atom");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:cc", "http://creativecommons.org/ns#");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:content", "http://purl.org/rss/1.0/modules/content/");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:creativeCommons", "http://blogs.law.harvard.edu/tech/creativeCommonsRssModule");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:dcterms", "http://purl.org/dc/terms/");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:itunes", "http://www.itunes.com/dtds/podcast-1.0.dtd");
			$rss->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:media", "http://search.yahoo.com/mrss/");
			$this->channel = $this->createElement("channel", [], null, $rss);
		}

		public function createElement($name, $attributes = [], string $text = null, \DOMNode $parent = null): \DOMElement {
			$name = strval($name);
			$attributes = is_array($attributes) ? $attributes : [$attributes];
			$element = is_null($text) ? parent::createElement($name) : parent::createElement($name, $text);

			foreach ($attributes as $attribute => $value)
				$element->setAttribute($attribute, $value);

			if (is_null($parent))
				$parent = $this->channel;
			$parent->appendChild($element);
			return $element;
		}

		public function createCDATASection($name, array $attributes = [], string $text = null, \DOMNode $parent = null) {
			$element = $this->createElement(strval($name), $attributes, null, $parent);
			$element->appendChild(parent::createCDATASection($text));
			return $element;
		}
	}
?>