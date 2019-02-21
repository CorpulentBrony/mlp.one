"use strict";

// https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading
// https://developers.google.com/web/fundamentals/app-install-banners/
// maybe use this?  https://developers.google.com/web/tools/workbox/

const CACHE_VERSION = "5";
const CACHE_NAME = `mlp-one-cache-v${self.String(CACHE_VERSION)}`;
const FILES_TO_CACHE = [
	{ [""]: [
		/* { css: ["card.css", common.css"] }, */
		{ image: ["apple.svg", "google.svg", "pvl.svg", "rss.svg", "stitcher.svg", "tunein.svg", "twi_qt.svg", "youtube.svg"] },
		{ js: ["mdc-drawer.js", "mdc-ripple.js", "mdc-top-app-bar.js"] },
		{ module: ["Cache.js", "ComponentHandler.js", "Drawer.js", "ToggleableComponentHandler.js", "TopAppBar.js", "util.js" /*, "common.js" */] },
		"manifest.jsonmanifest"
	] },
	"https://fonts.googleapis.com/css?family=Roboto:300,400,500"
];
const CACHE_OPTIONS = { ignoreSearch: true };

self.addEventListener("activate", (event) => event.waitUntil(onActivate()));
self.addEventListener("fetch", onFetch);
self.addEventListener("install", (event) => event.waitUntil(onInstall()));

function expandFileList(fileList = [], prefix = "") {
	return fileList.reduce((result, entry) => {
		if (typeof entry === "string")
			result.push(prefix + entry);
		else if (typeof entry === "object") {
			const entryKey = self.Object.keys(entry)[0];
			result = result.concat(expandFileList(entry[entryKey], `${prefix}${entryKey}/`));
		}
		return result;
	}, []);
}
async function onActivate() {
	const keys = await self.caches.keys();
	const response = keys.map((key) => {
		if (key !== CACHE_NAME)
			return self.caches.delete(key);
	});

	if (self.registration.navigationPreload)
		response.push(self.registration.navigationPreload.enable());
	return self.Promise.all(response);
}
function onFetch(event) {
	if (event.request.headers.has("range"))
		event.respondWith(onFetchRanged(event).catch(console.error));
	else
		event.respondWith(onFetchUnranged(event).catch(console.error));
}
async function onFetchCommon(event) {
	const cache = await self.caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(event.request, CACHE_OPTIONS);
	const response = cachedResponse || await self.fetch(event.request.clone());

	if (!cachedResponse && response.status < 400)
		cache.put(event.request, response.clone());
	return response;
}
async function onFetchRanged(event) {
	const pos = self.Number(/^bytes\=(\d+)\-$/gi.exec(event.request.headers.get("range"))[1]);
	const response = await onFetchCommon(event);
	const buffer = await response.arrayBuffer();
	return new self.Response(buffer.slice(pos), {
		headers: [
			["content-length", buffer.byteLength - pos],
			["content-range", `bytes ${pos}-${buffer.byteLength - 1}/${buffer.byteLength}`],
			["content-type", response.headers.get("content-type")]
		],
		status: 206,
		statusText: "Partial Content"
	});
}
function onFetchUnranged(event) { return onFetchCommon(event); }
async function onInstall() {
	const cache = await self.caches.open(CACHE_NAME);
	return cache.addAll(expandFileList(FILES_TO_CACHE));
}