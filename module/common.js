"use strict";
import { Drawer } from "./Drawer.js";
import { TopAppBar } from "./TopAppBar.js";
import { async, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";
import "../js/mdc-ripple.js";

(async function privacy() {
	const ENABLE_SERVICE_WORKER = false;
	const rippleButtonClassNames = [".mdc-button", ".mdc-card__primary-action", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"];

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => new window.mdc.MDCRipple(item)); }

	async function documentOnLoad() {
		const areStylesheetsLoaded = loadDeferredStylesheets();
		await isDocumentLoaded;
		const result = async([
			() => new Drawer({ topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector))
		]);
		await areStylesheetsLoaded;
		result.push(registerServiceWorker());
		return window.Promise.all(result);
	}

	async function registerServiceWorker() {
		if (ENABLE_SERVICE_WORKER && "serviceWorker" in window.navigator) {
			const registration = await window.navigator.serviceWorker.register("/service-worker.mjs");

			function onInstallingStateChange() {
				if (registration.installing && registration.installing.state === "installed")
					if (window.navigator.serviceWorker.controller)
						console.log("New or updated content is available. (should display message to user)");
					else
						console.log("Content is now available offline.  (maybe display message to user)");
			}

			registration.addEventListener("updatefound", () => registration.installing.addEventListener("statechange", onInstallingStateChange));
			return registration;
		}
	}

	return documentOnLoad();
})().catch(console.error);