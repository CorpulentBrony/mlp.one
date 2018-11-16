"use strict";
import { Drawer } from "./Drawer.js";
import { MlpAudioPlayer } from "./MlpAudioPlayer.mjs";
import { MoreFormatsMenu } from "./MoreFormatsMenu.js";
import { ShareMenu } from "./ShareMenu.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, createElement, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";
import "../js/mdc-ripple.js";

(async function output() {
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

	function defineCustomElements() {
		const customElements = { ["mlp-audio-player"]: MlpAudioPlayer };
		const supportsCustomElements = window.customElements && window.customElements.define;
		const supportsRegisterElement = window.Boolean(window.document.registerElement);

		if (!supportsCustomElements && !supportsRegisterElement)
			return;

		for (const element in customElements)
			if (supportsCustomElements)
				window.customElements.define(element, customElements[element]);
			else if (supportsRegisterElement)
				window.document.registerElement(element, customElements[element]);
	}

	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		const episodeNumber = episode.number;
		// window.document.addEventListener("mousedown", console.log);
		// window.addEventListener("mouseup", console.log);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
		return window.Promise.all(async([
			makeTimestampsClickable,
			() => new Drawer({ currentElement: findSelectedEpisodeListItem(episodeNumber), topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => new MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => new ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			defineCustomElements
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

	function makeTimestampsClickable() {
		const sectionSelector = "main > article > section";
		const timeLinkClass = "mlp-audio-timestamp";
		const trimStart = String.prototype.trimStart || String.prototype.trimLeft;

		function timestampOnClick(event) {
			const seconds = this.dataset.seconds;
			event.preventDefault();
			event.stopPropagation();
			const audioPlayer = window.document.querySelector("mlp-audio-player");
			audioPlayer.currentTime = seconds;
			audioPlayer.play();
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
	}

	return documentOnLoad();
})().catch(console.error);