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
		elements.audio = window.document.querySelectorAll("audio");
		elements.details = window.document.querySelectorAll("ol > li > details");
		elements.audio.forEach((element) => element.addEventListener("play", audioOnPlay, false));
		elements.details.forEach((element) => element.addEventListener("toggle", (event) => element.querySelector("audio").preload = (element.open ? "metadata" : "none"), false));

		if (window.Math.max(window.document.documentElement.clientWidth, window.innerWidth || 0) < 480)
			elements.details[0].open = false;
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false);
	}

	if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", documentOnLoad, false);
	else
		documentOnLoad();
})();