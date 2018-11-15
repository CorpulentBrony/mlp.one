<?php
	namespace Mlp\Ep;

	const CUE_SETTINGS = "";//"align:middle line:100% size:100%";
	const TIME_FORMAT = "%02u:%02u:%06.3f";

	function noTopicList(\DateInterval $episodeDuration) {
		outputCue(1, new \DateInterval("PT0S"), $episodeDuration, "No topic list found for this episode.");
		die;
	}

	function outputCue(int $topicNumber, \DateInterval $startTimeInterval, \DateInterval $endTimeInterval, string $payload, bool $isEndOverlapping = false): void {
		$cueSettings = CUE_SETTINGS;
		$startTime = sprintf(TIME_FORMAT, $startTimeInterval->h, $startTimeInterval->i, $startTimeInterval->s);
		$endTime = sprintf(TIME_FORMAT, $endTimeInterval->h, $endTimeInterval->i, $endTimeInterval->s - ($isEndOverlapping ? 0.001 : 0));
		$payload = htmlspecialchars($payload, \ENT_NOQUOTES | \ENT_HTML5);
		echo <<<EOT
{$topicNumber}
{$startTime} --> {$endTime} {$cueSettings}
{$payload}


EOT;
	}

	http_response_code(200);
	header("Content-Type: {$this->mimeType}");
?>WEBVTT Topic list for episode <?= $this->episode->number ?> of <?= $_SERVER["SITE_TITLE"] ?>: <?= htmlspecialchars($this->episode->title, \ENT_NOQUOTES | \ENT_HTML5) ?>


<?php
	if (is_null($this->episode->note))
		noTopicList($this->episode->duration);
	$doc = new \DOMDocument();
	libxml_use_internal_errors(true);
	$doc->loadHTML(mb_convert_encoding("<div>{$this->episode->note}</div>", "HTML"), \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD);
	libxml_use_internal_errors(false);
	$topicListElement = null;

	foreach ($doc->getElementsByTagName("pre") as $element)
		if ($element->hasAttribute("data-is-topic-list")) {
			$topicListElement = $element;
			break;
		}

	if (is_null($topicListElement))
		noTopicList($this->episode->duration);
	$topics = array_map(function (string $line): array {
		$topic = explode(" ", $line, 2);
		$timeLabels = (strlen($topic[0]) > 5) ? ["H", "M", "S"] : ["M", "S"];
		$time = "PT" . implode("", array_map(function (string $timeComponent, string $timeLabel): string { return $timeComponent . $timeLabel; }, explode(":", $topic[0]), $timeLabels));
		$topic[0] = new \DateInterval($time);

		if ($topic[0]->i >= 60)
			list($topic[0]->h, $topic[0]->i) = [$topic[0]->h + ($topic[0]->i / 60 >> 0), $topic[0]->i % 60];
		return $topic;
	}, explode("\n", $topicListElement->textContent));
	outputCue(1, new \DateInterval("PT0S"), $topics[0][0], "Intro", true);

	foreach ($topics as $topicNumber => $topic) {
		$isLastTopic = $topicNumber + 1 >= count($topics);
		outputCue(++$topicNumber + 1, $topic[0], $isLastTopic ? $this->episode->duration : $topics[$topicNumber][0], $topic[1], !$isLastTopic);
	}
?>