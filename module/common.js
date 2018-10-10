"use strict";
import { Drawer } from "./Drawer.js";
import { MDCRipple } from "../node_modules/@material/ripple";
import { TopAppBar } from "./TopAppBar.js";
import { async, isDocumentLoaded, loadDeferredStylesheets } from "./util.js";

(async function privacy() {
	const rippleButtonClassNames = [".mdc-button", ".mdc-card__primary-action", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"];

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => new MDCRipple(item)); }

	async function documentOnLoad() {
		loadDeferredStylesheets();
		await isDocumentLoaded;
		return window.Promise.all(async([
			() => new Drawer({ topAppBar: new TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector))
		]));
	}

	return documentOnLoad();
})().catch(console.error);