"use strict";
import { async, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";

(async function index() {
	const elements = window.Object.create(window.Object.prototype);

	function audioOnPlay(event) {
		elements.audio.forEach((element) => {
			if (element !== event.target)
				element.pause();
		});
	}

	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		elements.audio = window.document.querySelectorAll("audio");
		elements.details = window.document.querySelectorAll("ol > li > details");
		elements.audio.forEach((element) => element.addEventListener("play", audioOnPlay, false));
		elements.details.forEach((element) => element.addEventListener("toggle", (event) => element.querySelector("audio").preload = (element.open ? "metadata" : "none"), false));

		if (window.Math.max(window.document.documentElement.clientWidth, window.innerWidth || 0) < 480)
			elements.details[0].open = false;
		windowOnHashChange();
		window.addEventListener("hashchange", windowOnHashChange, false);
	}

	function windowOnHashChange() {
		if (!window.document.URL.includes("#"))
			return;
		const element = window.document.getElementById(window.document.URL.split("#")[1]);

		if (!(element instanceof HTMLDetailsElement))
			return;
		elements.details.forEach((detailElement) => detailElement.open = false);
		window.document.getElementById(window.document.URL.split("#")[1]).open = true;
	}

	documentOnLoad();
})().catch(console.error);