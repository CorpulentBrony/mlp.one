"use strict";
import { Cache } from "./Cache.js";
import { Drawer } from "./Drawer.js";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, checkWebpSupport, createElement, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";

(async function output() {
	const URL = window.URL || window.webkitURL;
	const documentUrl = new URL(window.location.href);
	const rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => new window.mdc.MDCRipple(item)); }

	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		const episodeNumber = window.Number(window.document.getElementById("microdata-episode-number").textContent);
		// window.document.addEventListener("mousedown", console.log);
		// window.addEventListener("mouseup", console.log);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
		return window.Promise.all(async([
			// checkWebpSupport,
			setupAudioControls.bind(undefined, episodeNumber),
			() => new Drawer({ currentElement: findSelectedEpisodeListItem(episodeNumber), topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => new MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => new ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector))
		]));
	}

	function findSelectedEpisodeListItem(episodeNumber) {
		const selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${window.String(episodeNumber)}"]`);

		if (selectedEpisodeListItem) {
			selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
		return selectedEpisodeListItem;
	}

	function gotoTimestamp(audioElement, seconds) {
		audioElement.currentTime = seconds;
		audioElement.play();
		window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
	}

	function makeTimestampsClickable(audioElement, episodeNumber) {
		const sectionSelector = "main > article > section";
		const timeLinkClass = "mlp-audio-timestamp";
		const trimStart = String.prototype.trimStart || String.prototype.trimLeft;

		function timestampOnClick(event) {
			const seconds = this.dataset.seconds;
			event.preventDefault();
			event.stopPropagation();
			gotoTimestamp(audioElement, seconds);
			window.history.pushState({ seconds }, undefined, `?t=${this.dataset.seconds}`);
			return false;
		}

		function updateTimestamps(node) {
			if (!(node instanceof window.Node))
				return;
			else if (node.nodeType === window.Node.TEXT_NODE) {
				node.data.replace(/(?:^|\s)([0-9]+:[0-5][0-9]|[0-9]+:[0-5][0-9]:[0-5][0-9])(?:\s|$)/, (entireMatchedString, timeString, offset, nodeData) => {
					offset += entireMatchedString.length - trimStart.call(entireMatchedString).length;
					const newTextNode = node.splitText(offset);
					const seconds = window.String(timeString.split(":").reduceRight((seconds, timeValue, index, timeArray) => window.Math.pow(60, timeArray.length - 1 - index) * window.Number(timeValue) + seconds, 0));
					newTextNode.data = newTextNode.data.substr(timeString.length);
					const timeLink = createElement("a", { href: `?t=${seconds}` });
					const time = createElement("time", { datetime: `PT${seconds}S` }, timeLink, timeString);
					timeLink.classList.add(timeLinkClass);
					timeLink.dataset.seconds = seconds;
					timeLink.addEventListener("click", timestampOnClick, false);
					node.parentNode.insertBefore(timeLink, newTextNode);
					updateTimestamps(newTextNode);
				});
			} else
					window.Array.prototype.forEach.call(node.childNodes, (child) => updateTimestamps(child));
		}

		updateTimestamps(window.document.querySelector(sectionSelector));
		// window.Array.prototype.forEach.call(window.document.getElementsByClassName(timeLinkClass), (timeLink) => timeLink.addEventListener("click", timestampOnClick, false));
	}

	function setupAudioControls(episodeNumber) {
		const audioElement = window.document.querySelector("video");
		const cachedCurrentTimeKey = `episode-${window.String(episodeNumber)}-current-time`;
		const cachedCurrentTimeValue = Cache.get(cachedCurrentTimeKey);
		const cachedVolumeKey = "volume";
		const cachedVolumeValue = Cache.get(cachedVolumeKey);

		if (cachedVolumeValue != null)
			audioElement.volume = window.Number(cachedVolumeValue);

		if (cachedCurrentTimeValue != null)
			audioElement.currentTime = window.Number(cachedCurrentTimeValue);
		audioElement.addEventListener("timeupdate", () => Cache.set(cachedCurrentTimeKey, audioElement.currentTime), false);
		audioElement.addEventListener("volumechange", () => Cache.set(cachedVolumeKey, audioElement.volume), false);

		if (documentUrl.searchParams.has("t"))
			gotoTimestamp(audioElement, window.Number(documentUrl.searchParams.get("t")));
		makeTimestampsClickable(audioElement, episodeNumber);
		window.addEventListener("popstate", (event) => {
			if (event.state && "seconds" in event.state)
				gotoTimestamp(audioElement, event.state.seconds);
		}, false);
	}

	return documentOnLoad();
})().catch(console.error);