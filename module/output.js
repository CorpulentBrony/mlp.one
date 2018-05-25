"use strict";
import { Cache } from "./Cache.js";
import { Drawer } from "./Drawer.js";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { isDocumentLoaded, loadSvg } from "./util.js";

(async function output() {
	const MLPIndex = window.Object.create(window.Object.prototype);
	MLPIndex.drawer = undefined; // Drawer
	MLPIndex.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
	MLPIndex.materialComponentsWebScript = undefined; // window.HTMLScriptElement
	MLPIndex.moreFormatsMenu = undefined; // MoreFormatsMenu
	MLPIndex.rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"
	MLPIndex.ripples = new window.Set();
	MLPIndex.selectedEpisodeListItem = undefined; // window.HTMLLIElement
	MLPIndex.shareMenu = undefined; // ShareMenu

	function async(funcOrArray) {
		if (window.Array.isArray(funcOrArray))
			return funcOrArray.map((func) => async(func));
		return new window.Promise((resolve, reject) => {
			try { window.setTimeout(() => resolve(funcOrArray.call(undefined))); }
			catch (err) { reject(err); }
		});
	}

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => MLPIndex.ripples.add(new window.mdc.MDCRipple(item))); }

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
		MLPIndex.materialComponentsWebScript = window.document.getElementById("mlp-material-components-web-script");
		checkWebpSupport();
		window.Promise.all(async([
			findSelectedEpisodeListItem,
			setupAudioControls
		])).catch(console.error);
		materialComponentsWebScriptOnLoad();
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
	}

	function findSelectedEpisodeListItem() {
		MLPIndex.selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${MLPIndex.episodeNumber}"]`);

		if (MLPIndex.selectedEpisodeListItem) {
			MLPIndex.selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			MLPIndex.selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
	}

	// should used IndexedDB instead? https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
	function iconOnLoad({ currentTarget: icon }) {
		if (icon.currentSrc === "" || icon.currentSrc === "https://www.gstatic.com/psa/static/1.gif")
			return;
		loadSvg(icon).catch(console.error);
		icon.removeEventListener("load", iconOnLoad, false);
	}

	function materialComponentsWebScriptOnLoad() {
		window.Promise.all(async([
			() => MLPIndex.drawer = new Drawer({ currentElement: MLPIndex.selectedEpisodeListItem, topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => MLPIndex.moreFormatsMenu = new MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => MLPIndex.shareMenu = new ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => MLPIndex.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			triggerIconLoad
		])).catch(console.error);
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

	function triggerIconLoad() {
		window.document.querySelectorAll("img[data-is-svg]").forEach((icon) => {
			if (icon.complete && icon.currentSrc !== "" && icon.currentSrc !== "https://www.gstatic.com/psa/static/1.gif")
				iconOnLoad({ currentTarget: icon });
			icon.addEventListener("load", iconOnLoad, false);
		});
	}

	await documentOnLoad();
})().catch(console.error);