"use strict";

const CACHE_NAME = "mlp-one-cache-v1";
const FILES_TO_CACHE = [];

// https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading
// https://developers.google.com/web/fundamentals/app-install-banners/
// maybe use this?  https://developers.google.com/web/tools/workbox/

self.addEventListener("activate", (event) => event.waitUntil(onActivate()));
self.addEventListener("fetch", (event) => event.respondWith(onFetch(event)));
self.addEventListener("install", (event) => event.waitUntil(onInstall()));

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

async function onFetch(event) {
	const request = event.request;

	if (request.headers.has("range")) {
		const pos = self.Number(/^bytes\=(\d+)\-$/g.exec(request.headers.get("range"))[1]);
		const cache = await self.caches.open(CACHE_NAME);
		const cachedResponse = await cache.match(request.url);
		const preloadResponse = cachedResponse || await self.Promise.resolve(event.preloadResponse);
		let buffer;

		if (!preloadResponse) {
			const response = await self.fetch(request);
			buffer = await response.arrayBuffer();
		} else
			buffer = await preloadResponse.arrayBuffer();
		return new self.Response(buffer.slice(pos), { headers: [["Content-Range", `bytes ${pos}-${buffer.byteLength - 1}/${buffer.byteLength}`]], status: 206, statusText: "Partial Content" });
	}
	const response = self.fetch(request);
	event.waitUntil(async () => {
		const cache = await self.caches.open(CACHE_NAME);
		const responseCompleted = await response;
		return cache.put(request, responseCompleted.clone());
	});
	return (await self.caches.match(request, { ignoreSearch: true })) || (await self.Promise.resolve(event.preloadResponse)) || response;
}

async function onInstall() {
	const cache = await self.caches.open(CACHE_NAME);
	return cache;//.addAll(FILES_TO_CACHE);
}