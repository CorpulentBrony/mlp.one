<?php
	require_once "header.php";

	(function (): void {
		$cookie = Cookie::getSession();

		if ($cookie === false || !$cookie->isValid()) {
			header("Location: login.php");
			die;
		}
	})();

	$currentDate = date("Y-m-d");
	$emptyFileMessage = "No file selected";
	$pageDescription = "Allows managers to upload and edit podcasts";
	$pageTitle = "/mlp/odcast manager";
	$priorYearTime = time() - 365 * 24 * 60 * 60;
	$commonBitRateValues = [32, 96, 128, 160, 192, 256, 320];
	$commonSampleRateValues = [32, 44.1, 48, 96, 192];
	$inputFields = [
		"episode" => [
			"number" => ["filter" => FILTER_SANITIZE_NUMBER_INT, "max" => 9999, "min" => 1, "name" => "Episode Number", "pattern" => "[0-9]+"],
			"title" => ["filter" => FILTER_SANITIZE_STRING, "maxlength" => 255, "minlength" => 1, "name" => "Episode Title"],
			"subtitle" => ["filter" => FILTER_SANITIZE_STRING, "maxlength" => 255, "name" => "Episode Subtitle"],
			"description" => ["filter" => FILTER_SANITIZE_STRING, "maxlength" => 4000, "minlength" => 1, "name" => "Episode Description"],
			"keywords" => ["filter" => FILTER_SANITIZE_STRING, "name" => "Episode Keywords"],
			"note" => ["filter" => FILTER_UNSAFE_RAW, "maxlength" => 4000, "name" => "Episode Note"],
			"publishDate" => [
				"filter" => FILTER_SANITIZE_STRING, 
				"max" => $currentDate, 
				"min" => date("Y-m-d", $priorYearTime), 
				"name" => "Episode Publish Date", 
				"pattern" => "(?:" . date("Y") . "|" . date("Y", $priorYearTime) . ")-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])"
			],
			"length" => ["filter" => FILTER_SANITIZE_NUMBER_INT, "max" => 24 * 60 * 60, "min" => 1, "name" => "Episode Length", "pattern" => "[0-9]+"],
			"youTubeId" => ["filter" => FILTER_SANITIZE_STRING, "maxlength" => 11, "minlength" => 11, "name" => "Episode YouTube ID", "pattern" => "[A-za-z0-9-_]+"]
		],
		"file" => [
			"bitRate" => ["filter" => FILTER_SANITIZE_NUMBER_INT, "max" => 18000, "min" => 1, "name" => "File Bit Rate", "pattern" => "[0-9]+"],
			"samplingRate" => ["filter" => FILTER_SANITIZE_NUMBER_FLOAT, "max" => 192, "min" => 32, "name" => "File Sampling Rate", "pattern" => "(?:[3-9][0-9]|1[0-9]{2})(?:\.[0-9]){0,1}"],
			"numberChannels" => ["filter" => FILTER_SANITIZE_NUMBER_INT, "max" => 10, "min" => 1, "name" => "File Number of Channels"]
		]
	];
	$requiredInputFields = ["episode" => ["number", "title", "description", "publishDate", "length", "youTubeId"], "file" => ["numberChannels"]];
	$uploadProgressTitlePrefix = "File upload progress: ";
	$_SESSION["input_fields"] = $inputFields;
	$_SESSION["required_input_fields"] = $requiredInputFields;

	function arrayToOptions(array $array): string {
		return array_reduce($array, function (string $carry, $item): string { return $carry . "<option value=\"" . strval($item) . "\">"; }, "");
	}

	header("Content-Type: text/html");
?><!DOCTYPE html>
<html itemid="https://<!--# echo var='host' --><!--# echo var='request_uri' -->" itemscope itemtype="https://schema.org/WebPage" lang="en" prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" 🦄 🐎🐱>
	<head>
		<!--# include file="/common/header.html" -->
		<meta content="<?= $pageTitle ?>" itemprop="headline name" name="title" property="og:title">
		<meta content="<?= $pageDescription ?>" itemprop="description" name="description" property="og:description">
		<meta content="<?= $pageTitle ?>" name="twitter:title">
		<meta content="<?= $pageDescription ?>" name="twitter:description">
		<link href="/index.css" rel="stylesheet" type="text/css">
		<style type="text/css">
			@charset "utf-8";
			<!--# include file="/css/vars.css" -->
			output dl {
				display: grid;
				grid-template-columns: max-content auto;
			}
			output dt { grid-column-start: 1; }
			output dt::after { content: ":\00a0"; }
			output dd {
				grid-column-start: 2;
				margin-left: 0;
			}
			fieldset {
				border: 1px solid var(--fg-color);
				border-radius: 5px;
			}
			input, textarea { transition: all 0.5s; }
			input:invalid, textarea:invalid { box-shadow: 0 0 2px 1px var(--twi-hair-highlight-pink); }
			input:focus, textarea:focus {
				box-shadow: 0 0 2px 3px var(--bg-secondary-color);
				outline: none;
			}
			input:focus:invalid, textarea:focus:invalid { box-shadow: 0 0 2px 3px var(--twi-hair-highlight-pink); }
			form > div { padding: 5px 0 5px 5px; }
			form > fieldset { width: 30em; }
			fieldset > div {
				display: grid;
				grid-gap: 5px;
				grid-template-columns: [labels] 9fr [inputs] 11fr;
				width: 100%;
			}
			fieldset > div > label {
				grid-column: 1;
				justify-self: end;
			}
			fieldset > div > input, fieldset > div > output, fieldset > div > textarea { grid-column: 2; }
			input[type=file] {
				opacity: 0;
				width: 5px;
			}
			output[for=file] { overflow-x: hidden; }
			.button {
				background: var(--twi-hair-highlight-pink);
				border: 1px ridge black;
				border-radius: 5px;
				color: inherit;
				display: block;
				font: inherit;
				font-size: inherit;
				padding: 5px 10px;
				position: relative;
				-webkit-touch-callout: none;
				transition: all 0.5s;
				-webkit-user-select: none;
				-moz-user-select: none;
				user-select: none;
			}
			.button:before {
				background: #000;
				bottom: 0;
				content: "";
				left: 0;
				opacity: 0;
				position: absolute;
				right: 0;
				top: 0;
				transition: all 0.5s;
			}
			.button:active, .button:hover { color: var(--fg-color-invert); }
			.button:hover:before { opacity: 0.2; }
			.button:active:before { opacity: 0.6; }
			.col-span-2 { grid-column: 1 / span 2; }
			.justify-start { justify-self: start; }
			section { padding-top: 10px; }
		</style>
<!-- 		<style media="(max-width: 500px)" type="text/css">
		/* stuff in here to re-layout the page maybe? */
		</style> -->
		<title><?= $pageTitle ?></title>
	</head>
	<body>
		<main itemprop="mainContentOfPage">
			<header role="heading">
				<h1><?= $pageTitle ?></h1>
				<div id="welcomeMessage">Welcome to the manager where you can upload and edit podcasts.  Required fields are marked by <dfn><abbr title="required">*</abbr></dfn>.</div>
			</header>
			<section role="main">
				<output aria-live="polite" form="uploadForm" id="formSubmissionResult" role="status"></output>
				<!-- for grid layout: https://css-tricks.com/snippets/css/complete-guide-grid/ -->
 				<form action="submit" aria-labelledby="welcomeMessage" autocomplete="on" enctype="multipart/form-data" id="fileUploadForm" method="post" name="fileUploadForm" role="form">
 					<input name="MAX_FILE_SIZE" type="hidden" value="200000000">
					<input aria-errormessage="errorMessageDiv" aria-required accept="audio/*" id="fileUploadInput" name="fileUploadInput" placeholder="Choose podcast file" required type="file">
					<fieldset>
						<legend>Upload Episode</legend>
						<div>
							<label class="button col-span-2 justify-start" for="fileUploadInput" role="button" title="Choose podcast file">Choose podcast file</label>
							<label for="fileUploadOutput">Selected file: </label>
							<output aria-live="polite" for="fileUploadInput" id="fileUploadOutput" role="status"><?= $emptyFileMessage ?></output>
						</div>
					</fieldset>
					<div>
						<button class="button" role="button" title="Submit" type="submit">Submit</button>
					</div>
				</form>
				<form action="submit" aria-labelledby="welcomeMessage" autocomplete="on" enctype="multipart/form-data" id="uploadForm" method="post" name="episodeUpload" role="form">
					<div aria-live="polite" id="errorMessageDiv"></div>
					<fieldset>
						<legend>Episode</legend>
						<div>
							<label for="episodeNumber">Number: <abbr title="required">*</abbr></label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-required="true"
								id="episodeNumber"
								max="<?= $inputFields["episode"]["number"]["max"] ?>" 
								min="<?= $inputFields["episode"]["number"]["min"] ?>" 
								name="episodeNumber" 
								pattern="<?= $inputFields["episode"]["number"]["pattern"] ?>" 
								required 
								title="Episode Number" 
								type="number">
							<label for="episodeTitle">Title: <abbr title="required">*</abbr></label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-required="true"
								autocapitalize="words" 
								id="episodeTitle"
								inputmode="latin-prose" 
								maxlength="<?= $inputFields["episode"]["title"]["maxlength"] ?>" 
								minlength="<?= $inputFields["episode"]["title"]["minlength"] ?>" 
								name="episodeTitle" 
								required 
								spellcheck 
								title="Episode Title" 
								type="text">
							<label for="episodeSubtitle">Subtitle: </label>
							<input 
								aria-errormessage="errorMessageDiv"
								autocapitalize="words" 
								id="episodeSubtitle"
								inputmode="latin-prose" 
								maxlength="<?= $inputFields["episode"]["subtitle"]["maxlength"] ?>" 
								name="episodeSubtitle" 
								spellcheck 
								title="Episode Subtitle" 
								type="text">
							<label for="episodeDescription">Description: <abbr title="required">*</abbr></label>
							<textarea 
								aria-errormessage="errorMessageDiv"
								aria-multiline="true" 
								aria-required="true"
								autocapitalize="sentences" 
								id="episodeDescription"
								maxlength="<?= $inputFields["episode"]["description"]["maxlength"] ?>" 
								minlength="<?= $inputFields["episode"]["description"]["minlength"] ?>" 
								name="episodeDescription" 
								required 
								role="textbox"
								spellcheck 
								title="Episode Description"></textarea>
							<label for="episodeKeywords">Keywords: </label>
							<input aria-placeholder="comma separated list" id="episodeKeywords" inputmode="latin-prose" name="episodeKeywords" placeholder="comma separated list" spellcheck title="Episode Keywords" type="text">
							<label for="episodeNote">Note: </label>
							<textarea 
								aria-errormessage="errorMessageDiv"
								aria-multiline="true"
								autocapitalize="sentences" 
								id="episodeNote" 
								maxlength="<?= $inputFields["episode"]["note"]["maxlength"] ?>" 
								name="episodeNote" 
								role="textbox"
								spellcheck 
								title="Episode Note"></textarea>
							<label for="episodePublishDate">Publish Date: <abbr title="required">*</abbr></label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-required="true"
								id="episodePublishDate"
								max="<?= $inputFields["episode"]["publishDate"]["max"] ?>" 
								min="<?= $inputFields["episode"]["publishDate"]["min"] ?>" 
								name="episodePublishDate" 
								pattern="<?= $inputFields["episode"]["publishDate"]["pattern"] ?>"
								required 
								title="Episode Publish Date" 
								type="date" 
								value="<?= $currentDate ?>">
							<label for="episodeLength">Duration (in seconds): <abbr title="required">*</abbr></label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-placeholder="in seconds"
								aria-required="true"
								id="episodeLength"
								max="<?= $inputFields["episode"]["length"]["max"] ?>" 
								min="<?= $inputFields["episode"]["length"]["min"] ?>" 
								name="episodeLength" 
								pattern="<?= $inputFields["episode"]["length"]["pattern"] ?>" 
								placeholder="in seconds" 
								required 
								role="textbox"
								title="Episode Duration (in seconds)" 
								type="number">
							<label for="episodeYouTubeId">YouTube ID: <abbr title="required">*</abbr></label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-required="true"
								id="episodeYouTubeId"
								inputmode="verbatim" 
								maxlength="<?= $inputFields["episode"]["youTubeId"]["maxlength"] ?>" 
								minlength="<?= $inputFields["episode"]["youTubeId"]["minlength"] ?>" 
								name="episodeYouTubeId" 
								pattern="<?= $inputFields["episode"]["youTubeId"]["pattern"] ?>" 
								required 
								title="YouTube ID" 
								type="text">
						</div>
					</fieldset>
					<input name="MAX_FILE_SIZE" type="hidden" value="100000000">
					<input aria-errormessage="errorMessageDiv" aria-required accept="audio/*" id="file" name="file" placeholder="Choose podcast file" required type="file">
					<datalist id="commonBitRateValues"><?= arrayToOptions($commonBitRateValues) ?></datalist>
					<datalist id="commonSampleRateValues"><?= arrayToOptions($commonSampleRateValues) ?></datalist>
					<fieldset>
						<legend>File</legend>
						<div>
							<label class="button col-span-2 justify-start" for="file" role="button" title="Choose podcast file">Choose podcast file</label>
							<label for="fileOutput">Selected file: </label>
							<output aria-live="polite" for="file" id="fileOutput" role="status"><?= $emptyFileMessage ?></output>
							<label for="fileBitRate">Bit Rate (in <abbr title="kilobits per second">kbps</abbr>): </label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-placeholder="in kilobits per second"
								id="fileBitRate"
								list="commonBitRateValues" 
								max="<?= $inputFields["file"]["bitRate"]["max"] ?>" 
								min="<?= $inputFields["file"]["bitRate"]["min"] ?>" 
								name="fileBitRate" 
								pattern="<?= $inputFields["file"]["bitRate"]["pattern"] ?>" 
								placeholder="in kilobits per second" 
								role="textbox"
								title="File Bit Rate (in kbps)" 
								type="number">
							<label for="fileSamplingRate">Sample Rate (in <abbr title="kiloherz">kHz</abbr>): </label>
							<input 
								aria-errormessage="errorMessageDiv"
								aria-placeholder="in kiloherz"
								id="fileSamplingRate"
								list="commonSampleRateValues" 
								max="<?= $inputFields["file"]["samplingRate"]["max"] ?>" 
								min="<?= $inputFields["file"]["samplingRate"]["min"] ?>" 
								name="fileSamplingRate" 
								pattern="<?= $inputFields["file"]["samplingRate"]["pattern"] ?>" 
								placeholder="in kiloherz" 
								role="textbox"
								step="0.1" 
								title="File Sample Rate (in kHz)" 
								type="number">
							<fieldset aria-required="true" class="col-span-2" role="radiogroup">
								<legend>Number of Channels</legend>
								<label><input name="fileNumberChannels" role="radio" type="radio" value="1"> Mono</label>
								<label><input checked name="fileNumberChannels" role="radio" type="radio" value="2"> Stereo</label>
							</fieldset>
						</div>
					</fieldset>
					<div>
						<button class="button" role="button" title="Submit" type="submit">Submit</button>
						<progress aria-hidden="true" aria-valuemax="1" aria-valuemin="0" aria-valuenow="0" id="fileUploadProgress" role="progressbar" title="<?= $uploadProgressTitlePrefix ?>0%" value="0">0%</progress>
					</div>
				</form>
			</section>
		</main>
		<script>
			// for uploading files, look here: https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
			// fetch api: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
			// using fetch api (search for POST): https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
			// drag and drop: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
			/*
			if form values are wrong, use :invalid css selector (check mdn page for form) and also mark them as aria-invalid (https://www.w3.org/TR/wai-aria-1.1/#aria-invalid) and aria-errormessage
			https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
			*/
			"use strict";
			(function manager() {
				const elements = window.Object.create(window.Object.prototype);

				function createElement(name, attributes = {}, parent = undefined, text = undefined) {
					const element = window.document.createElement(name);

					for (const key in attributes)
						element.setAttribute(key, attributes[key]);

					if (text !== undefined)
						element.textContent = text;

					if (parent !== undefined)
						parent.appendChild(element);
					return element;
				}

				function documentOnLoad() {
					elements.file = window.document.getElementById("file");
					elements.fileOutput = window.document.getElementById("fileOutput");
					elements.fileUploadProgress = window.document.getElementById("fileUploadProgress");
					elements.fileUploadForm = window.document.getElementById("fileUploadForm");
					elements.fileUploadInput = window.document.getElementById("fileUploadInput");
					elements.fileUploadOutput = window.document.getElementById("fileUploadOutput");
					elements.form = window.document.getElementById("uploadForm");
					elements.submissionResult = window.document.getElementById("formSubmissionResult");
					elements.file.addEventListener("change", fileOnChange, false);
					elements.form.addEventListener("submit", formOnSubmit, false);
					elements.fileUploadForm.addEventListener("submit", fileUploadFormOnSubmit, false);
					elements.fileUploadInput.addEventListener("change", fileUploadInputOnChange, false);
					window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false);
				}

				function fileOnChange(event) {
					if (event.target.files.length === 0) {
						elements.fileOutput.textContent = "<?= $emptyFileMessage ?>";
						window.URL.revokeObjectURL(elements.currentFileUrl);
						return;
					}
					elements.fileOutput.textContent = event.target.files[0].name;
					elements.currentFileUrl = window.URL.createObjectURL(event.target.files[0]);
					elements.fileOutputAudio = createElement("audio", { controls: true, preload: "metadata", src: elements.currentFileUrl }, elements.fileOutput);
				}

				function fileUploadFormOnSubmit(event) {
					const fetch = new window.Promise((resolve, reject) => {
						const xhr = new window.XMLHttpRequest();
						xhr.open("POST", "submit_file.php", true);
						xhr.responseType = "json";
						xhr.withCredentials = true;
						xhr.addEventListener("load", () => resolve(xhr.response), false);
						xhr.addEventListener("error", reject, false);
						xhr.upload.addEventListener("progress", uploadOnProgress, false);
						xhr.send(new window.FormData(elements.fileUploadForm));
						showElement(elements.fileUploadProgress);
						elements.fileUploadForm.setAttribute("aria-busy", true);
						console.log(xhr);
					});
					elements.submissionResult.textContent = "";
					elements.submissionResult.classList.remove("warning");
					fetch.then((result) => {
						if (result && result.isSuccessful) {
							setProgress(elements.fileUploadProgress, 0);
							elements.submissionResult.textContent = "File uploaded successfully.";
							console.log(result);
						}
					}).catch(console.error);

					if (event.preventDefault)
						event.preventDefault();
					return false;
				}

				function fileUploadInputOnChange(event) {
					if (event.target.files.length === 0) {
						elements.fileUploadOutput.textContent = "<?= $emptyFileMessage ?>";
						window.URL.revokeObjectURL(elements.currentFileUrl);
						return;
					}
					elements.fileUploadOutput.textContent = event.target.files[0].name;
					elements.currentFileUrl = window.URL.createObjectURL(event.target.files[0]);
					elements.fileOutputAudio = createElement("audio", { controls: true, preload: "metadata", src: elements.currentFileUrl }, elements.fileUploadOutput);
				}

				function formOnSubmit(event) {
					const fetch = new window.Promise((resolve, reject) => {
						const xhr = new window.XMLHttpRequest();
						xhr.open("POST", "submit.php", true);
						xhr.responseType = "json";
						xhr.withCredentials = true;
						xhr.addEventListener("load", () => resolve(xhr.response), false);
						xhr.addEventListener("error", reject, false);
						xhr.upload.addEventListener("progress", uploadOnProgress, false);
						xhr.send(new window.FormData(elements.form));
						showElement(elements.fileUploadProgress);
						elements.form.setAttribute("aria-busy", true);
					});
					elements.submissionResult.textContent = "";
					elements.submissionResult.classList.remove("warning");
					fetch.then((result) => {
						if (result && result.isSuccessful) {
							hideElement(elements.form);
							setProgress(elements.fileUploadProgress, 0);
							elements.submissionResult.textContent = "Episode submitted successfully.";
							elements.submitAnother = createElement("button", { class: "button", role: "button", title: "Submit Another Episode", type: "button" }, elements.submissionResult, "Submit Another Episode");
							elements.submitAnother.addEventListener("click", submitAnotherOnClick, false);
						} else {
							elements.submissionResult.classList.add("warning");

							if (result && result.isSuccessful === false) {
								const errorList = createElement("dl", {}, window.document.createDocumentFragment());

								for (const errorField of window.Object.getOwnPropertyNames(result.errors)) {
									createElement("dt", {}, errorList, errorField);
									createElement("dd", {}, errorList, result.errors[errorField]);
								}
								elements.submissionResult.appendChild(errorList);
							}
							else
								elements.submissionResult.textContent = "Submission was unsuccessful, cannot interpret response from server or server sent empty response.";
						}
						window.scrollTo(0, 0);
						elements.form.removeAttribute("aria-busy");
						hideElement(elements.fileUploadProgress);
						uploadOnProgress({ loaded: 0, total: 1 });
					}).catch(console.error);

					if (event.preventDefault)
						event.preventDefault();
					return false;
				}

				function hideElement(element) { element.setAttribute("aria-hidden", true); }
				function showElement(element) { element.removeAttribute("aria-hidden"); }

				function setProgress(progressElement, progress) {
					progressElement.setAttribute("aria-valuenow", progress);
					progressElement.setAttribute("value", progress);
					const progressText = (progress * 100).toPrecision(3) + "%";
					progressElement.setAttribute("title", `<?= $uploadProgressTitlePrefix ?>${progressText}`);
					progressElement.textContent = progressText;
				}

				function submitAnotherOnClick(event) {
					elements.submissionResult.textContent = "";
					elements.form.reset();
					showElement(elements.form);
					elements.submitAnother.removeEventListener("click", submitAnotherOnClick, false);
				}

				function uploadOnProgress(event) {
					const loaded = window.Number.parseFloat(event.loaded);
					const total = window.Number.parseFloat(event.total);
					setProgress(elements.fileUploadProgress, (total === 0) ? 0 : loaded / total);
					// const progress = (total === 0) ? 0 : loaded / total;
					// elements.fileUploadProgress.setAttribute("aria-valuenow", progress);
					// elements.fileUploadProgress.setAttribute("value", progress);
					// const progressText = (progress * 100).toPrecision(3) + "%";
					// elements.fileUploadProgress.setAttribute("title", `File upload progress: ${progressText}`);
					// elements.fileUploadProgress.textContent = progressText;
				}

				if (window.document.readyState === "loading")
					window.document.addEventListener("DOMContentLoaded", documentOnLoad, false);
				else
					documentOnLoad();
			})();
		</script>
	</body>
</html>
