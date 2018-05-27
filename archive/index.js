"use strict";
(function index() {
	const elements = window.Object.create(window.Object.prototype);

	function audioOnPlay(event) {
		elements.audio.forEach((element) => {
			if (element !== event.target)
				element.pause();
		});
	}

	function documentOnLoad() {
		const style = window.document.createElement("link");
		style.setAttribute("href", "/index.css");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/css");
		window.document.head.appendChild(style);
		elements.audio = window.document.querySelectorAll("audio");
		elements.details = window.document.querySelectorAll("ol > li > details");
		elements.audio.forEach((element) => element.addEventListener("play", audioOnPlay, false));
		elements.details.forEach((element) => element.addEventListener("toggle", (event) => element.querySelector("audio").preload = (element.open ? "metadata" : "none"), false));

		if (window.Math.max(window.document.documentElement.clientWidth, window.innerWidth || 0) < 480)
			elements.details[0].open = false;
		windowOnHashChange();
		window.addEventListener("hashchange", windowOnHashChange, false);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false);
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

	const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	if (requestAnimationFrame)
		requestAnimationFrame(() => window.setTimeout(documentOnLoad, 0));
	else if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", documentOnLoad, false);
	else
		documentOnLoad();
})();