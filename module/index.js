"use strict";
import { async, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";

(async function index() {
	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		return window.Promise.all(async([
			// checkWebpSupport,
			setDurationIcons,
			windowOnHashChange,
			() => window.addEventListener("hashchange", windowOnHashChange, false)
		]));
	}

	function setDurationIcons() {
		const codePointStart = 0x1f550;
		const codePointLookup = ["🕛", ...(new Array(12)).fill(0).map((codePoint, index) => String.fromCodePoint(codePointStart + index))];
		const timeItems = window.Array.prototype.map.call(window.document.querySelectorAll("time[data-duration-label]"), (time) => {
			const duration = /^P[0-9YMD]*T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?$/.exec(time.getAttribute("datetime")).splice(1, 3).map((value) => value || 0).reduceRight((result, value, index, source) => {
				if (index > 0) {
					result[index - 1] = source[index - 1] += window.Number.parseInt(value / 60);
					result[index] = value % 60;
				}
				return result;
			}, [0, 0, 0]);
			return { time, duration, durationSeconds: duration[0] * 60 * 60 + duration[1] * 60 + duration[2] };
		});
		const maxDurationSeconds = timeItems.reduce((maxDurationSeconds, timeItem) => window.Math.max(maxDurationSeconds, timeItem.durationSeconds), 0);
		const minDurationSeconds = timeItems.reduce((minDurationSeconds, timeItem) => window.Math.min(minDurationSeconds, timeItem.durationSeconds), maxDurationSeconds);
		const durationSpread = maxDurationSeconds - minDurationSeconds;
		timeItems.forEach((timeItem) => timeItem.time.dataset.durationLabel = codePointLookup[window.Math.round((timeItem.durationSeconds - minDurationSeconds) / durationSpread * 12)]);
	}

	function windowOnHashChange() {
		if (!window.document.URL.includes("#"))
			return;
		const element = window.document.getElementById(window.document.URL.split("#")[1]);

		if (!(element instanceof HTMLDetailsElement))
			return;
	}

	return documentOnLoad();
})().catch(console.error);