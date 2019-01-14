"use strict";
import { Drawer } from "./Drawer.js";
import { MlpAudioPlayer } from "./MlpAudioPlayer.mjs";
import { MlpEpisodeDescription } from "./MlpEpisodeDescription.mjs";
import { MlpMenu } from "./MlpMenu.mjs";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, defineCustomElements, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";
import "../js/mdc-ripple.js";

(async function output() {
	const CUSTOM_ELEMENTS = [MlpAudioPlayer, MlpEpisodeDescription, MlpMenu];
	const episode = {
		cache(object, name, value) {
			delete object[name];
			return window.Object.defineProperty(object, name, { value })[name];
		},
		get number() { return this.cache(this, "number", episode.schema.episodeNumber); },
		get schema() { return this.cache(this, "schema", window.JSON.parse(window.document.getElementById("mlp-episode-schema").textContent)); }
	};
	const rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => new window.mdc.MDCRipple(item)); }

	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		const episodeNumber = episode.number;
		// window.document.addEventListener("mousedown", console.log);
		// window.addEventListener("mouseup", console.log);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
		return window.Promise.all(async([
			() => new Drawer({ currentElement: findSelectedEpisodeListItem(episodeNumber), topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => new MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => new ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			() => defineCustomElements(CUSTOM_ELEMENTS)
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

	return documentOnLoad();
})().catch(console.error);