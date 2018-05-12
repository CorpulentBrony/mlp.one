<?php
	namespace Mlp\Api;
	require_once "../include/Episode.class.php";
	require_once "Rss.class.php";
	require_once "RssOutput.interface.php";

	class Episode extends \Mlp\Episode implements RssOutput {
		public function toRss(Rss $rss): void {
			$youtubeUrl = parent::getYouTubeUrl();
			$item = $rss->createElement("item");
			$rss->createElement("title", [], $this->title, $item);
			$rss->createElement("link", [], $youtubeUrl, $item);
			$rss->createElement("description", [], $this->description, $item);
			$this->defaultFile->toRss($rss, $item);
			$rss->createElement("guid", ["isPermaLink" => "false"], parent::getGuid(), $item);
			$rss->createElement("comments", [], $youtubeUrl, $item);
			$rss->createElement("atom:link", ["href" => $youtubeUrl, "rel" => "replies", "type" => "text/html"], null, $item);
			$rss->createElement("pubDate", [], $this->publishDate->format(\DateTime::RSS), $item);
			$rss->createElement("source", ["url" => Rss::URL], $_SERVER["SITE_TITLE"], $item);

			if (!is_null($this->note))
				$rss->createCDATASection("content:encoded", [], $this->note, $item);
			$rss->createElement("itunes:duration", [], implode(":", array_map(function (int $value): string { return sprintf("%02d", $value); }, [$this->duration->h, $this->duration->i, $this->duration->s])), $item);
			$rss->createElement("itunes:episode", [], strval($this->number), $item);
			$rss->createElement("itunes:explicit", [], "Yes", $item);
			$rss->createElement("itunes:season", [], "1", $item);

			if (!is_null($this->subtitle))
				$rss->createElement("itunes:subtitle", [], $this->subtitle, $item);
			$rss->createElement("itunes:title", [], $this->title, $item);

			if (is_null($this->note))
				$rss->createElement("media:description", ["type" => "plain"], $this->description, $item);
			else
				$rss->createCDATASection("media:description", ["type" => "html"], $this->note, $item);
			$mediaGroup = $rss->createElement("media:group", [], null, $item);

			foreach ($this->files as $file)
				$file->toRss($rss, $mediaGroup);
			$rss->createElement("media:player", ["url" => $this->getYouTubeEmbedUrl()], null, $rss->createElement("media:content", ["lang" => "en", "medium" => "video"], null, $mediaGroup));
			$rss->createElement("media:keywords", [], implode(", ", $this->keywords), $item);
			$rss->createElement("media:thumbnail", ["url" => parent::getYouTubeThumbnail()]);
			$rss->createElement("media:title", ["type" => "plain"], $this->title, $item);
		}
	}
?>