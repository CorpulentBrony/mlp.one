"use strict";
import { Cache } from "./Cache.js";
import { Drawer } from "./Drawer.js";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, isDocumentLoaded } from "./util.js";

(async function output() {
	const MLPIndex = window.Object.create(window.Object.prototype);
	MLPIndex.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
	MLPIndex.rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => new window.mdc.MDCRipple(item)); }

	function checkWebpSupport() {
		const cacheKey = "isWebpSupported";
		const cacheValue = Cache.get(cacheKey);
		const setWebpSupportedClass = (isWebpSupported) => window.document.body.classList.add(({ true: "webp-support", false: "webp-no-support" })[isWebpSupported]);

		if (cacheValue != null)
			setWebpSupportedClass(cacheValue);
		else {
			const check = new window.Promise((resolve, reject) => {
				const image = new window.Image();
				image.addEventListener("error", (err) => reject(err), false);
				image.addEventListener("load", () => {
					if (image.width === 1 && image.height === 1)
						resolve();
					else
						reject(new window.Error("Loaded WebP does not have the expected dimensions."));
				}, false);
				image.src = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==";
			});
			check.then(() => {
				Cache.set(cacheKey, "true");
				setWebpSupportedClass("true");
			}).catch(() => {
				Cache.set(cacheKey, "false");
				setWebpSupportedClass("false");
			});
		}
	}

	async function documentOnLoad() {
		await isDocumentLoaded;
		window.Promise.all(async([
			checkWebpSupport,
			setupAudioControls,
			() => new Drawer({ currentElement: findSelectedEpisodeListItem(), topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => new MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => new ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => MLPIndex.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector))
		])).catch(console.error);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
	}

	function findSelectedEpisodeListItem() {
		const selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${MLPIndex.episodeNumber}"]`);

		if (selectedEpisodeListItem) {
			selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
		return selectedEpisodeListItem;
	}

	function setupAudioControls() {
		const audioElement = window.document.querySelector("audio");
		const cachedCurrentTimeKey = `episode-${MLPIndex.episodeNumber}-current-time`;
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

	await documentOnLoad();
})().catch(console.error);