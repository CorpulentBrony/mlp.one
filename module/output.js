"use strict";
import { Cache } from "./Cache.js";
import { Drawer } from "./Drawer.js";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, checkWebpSupport, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";

(async function output() {
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

	function setupAudioControls(episodeNumber) {
		const audioElement = window.document.querySelector("audio");
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
	}

	return documentOnLoad();
})().catch(console.error);