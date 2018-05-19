"use strict";
const MLPClasses = (function classes() {
	class ComponentHandler {
		constructor({ elementId, elementSelector, eventListeners, mdcType }) {
			this.__element = getElement({ elementId, elementSelector }); // window.Element

			if (!this.element)
				return;

			if (mdcType)
				this.__mdcObject = new mdcType(this.element);

			if (eventListeners)
				window.Object.entries(eventListeners).forEach(([eventName, eventCallback]) => this.element.addEventListener(eventName, eventCallback, false));
		}
		get element() { return this.__element; }
		get mdcObject() { return this.__mdcObject; }
	}

	class MenuComponentHandler extends ComponentHandler {
		constructor({ currentElement, elementId, elementSelector, eventListeners, mdcType, topAppBar, triggerElementId, triggerElementSelector }) {
			super({ elementId, elementSelector, eventListeners, mdcType });
			this._triggerElement = getElement({ elementId: triggerElementId, elementSelector: triggerElementSelector }); // window.Element

			if (this._triggerElement)
				this._triggerElement.addEventListener("click", () => this.toggle(), false);
		}
		toggle() { super.mdcObject.open = !super.mdcObject.open; }
	}

	function getElement({ elementId, elementSelector }) { return elementId ? window.document.getElementById(elementId) : window.document.querySelector(elementSelector); }

	return {
		Drawer: class extends MenuComponentHandler {
			constructor({ currentElement, topAppBar, triggerElementId, triggerElementSelector }) {
				super({
					elementSelector: "aside.mdc-drawer", 
					eventListeners: {
						["MDCTemporaryDrawer:open"]: () => super.mdcObject.drawer.setAttribute("aria-hidden", false),
						["MDCTemporaryDrawer:close"]: () => super.mdcObject.drawer.setAttribute("aria-hidden", true)
					}, 
					mdcType: window.mdc.drawer.MDCTemporaryDrawer,
					triggerElementId,
					triggerElementSelector
				});
				this._currentElement = currentElement; // window.Element
				this._topAppBar = topAppBar; // MLPClasses.TopAppBar
			}
			toggle() {
				super.toggle();

				if (this._currentElement && super.mdcObject.open)
					super.mdcObject.drawer.querySelector(".mdc-drawer__content").scrollTop = this._currentElement.offsetTop - this._topAppBar.clientHeight;
			}
		},
		MoreFormatsMenu: class extends MenuComponentHandler {
			constructor({ triggerElementId, triggerElementSelector }) {
				super({ elementId: "mlp-menu", eventListeners: { ["MDCMenu:cancel"]: () => super.element.setAttribute("aria-hidden", true) }, mdcType: window.mdc.menu.MDCMenu, triggerElementId, triggerElementSelector });
			}
			close() {
				super.element.setAttribute("aria-hidden", true);
				super.mdcObject.open = false;
			}
			toggle() {
				super.element.setAttribute("aria-hidden", super.mdcObject.open);
				super.toggle();
			}

		},
		TopAppBar: class extends ComponentHandler {
			constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: window.mdc.topAppBar.MDCTopAppBar }); }
			get clientHeight() { return super.mdcObject.root_.clientHeight; }
		}
	};
})();
(function index() {
	const MLP = window.Object.create(window.Object.prototype);
	MLP.drawer = undefined; // MLPClasses.Drawer
	MLP.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
	MLP.materialComponentsWebScript = undefined; // window.HTMLScriptElement
	MLP.moreFormatsMenu = undefined; // MLPClasses.MoreFormatsMenu
	MLP.rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"
	MLP.ripples = new window.Set();
	MLP.selectedEpisodeListItem = undefined; // window.HTMLLIElement

	function async(funcOrArray) {
		if (window.Array.isArray(funcOrArray))
			return funcOrArray.map((func) => async(func));
		return new window.Promise((resolve, reject) => {
			try { window.setTimeout(() => resolve(funcOrArray.call(undefined))); }
			catch (err) { reject(err); }
		});
	}

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => MLP.ripples.add(new window.mdc.ripple.MDCRipple(item))); }

	function checkWebpSupport() {
		const check = new window.Promise((resolve, reject) => {
			const image = new window.Image();
			image.addEventListener("error", (err) => reject(err), false);
			image.addEventListener("load", () => {
				if (image.width === 1 && image.height === 1)
					resolve();
				else
					reject(new window.Error("Loaded WebP does not have the expected dimensions."));
			}, false);
			image.src = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==";
		});
		check.then(() => window.document.body.classList.add("webp-support")).catch(() => window.document.body.classList.add("webp-no-support"));
	}

	function copyAttributes(fromElement, toElement, attributes = []) {
		attributes.forEach((attribute) => {
			const attributeIsString = typeof attribute === "string";
			const fromElementAttribute = attributeIsString ? fromElement.getAttribute(attribute) : fromElement.getAttribute(attribute[0]);

			if (fromElementAttribute !== null)
				toElement.setAttribute(attributeIsString ? attribute : attribute[1], fromElementAttribute);
		});
	}

	function createElement(name, attributes = {}, parent = undefined, text = undefined) {
		const element = window.document.createElement(name);
		setAttributes(element, attributes);

		if (text !== undefined)
			element.textContent = text;

		if (parent !== undefined)
			parent.appendChild(element);
		return element;
	}

	function documentOnLoad() {
		MLP.materialComponentsWebScript = window.document.getElementById("mlp-material-components-web-script");

		if (typeof window.mdc === "undefined")
			MLP.materialComponentsWebScript.addEventListener("load", materialComponentsWebScriptOnLoad, false);
		else
			async(materialComponentsWebScriptOnLoad).catch(console.error);
		checkWebpSupport();
		window.Promise.all(async([
			findSelectedEpisodeListItem,
			() => window.document.querySelectorAll("#mlp-menu li").forEach((item) => item.addEventListener("click", () => MLP.moreFormatsMenu.close(), false))
		])).catch(console.error);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
	}

	function findSelectedEpisodeListItem() {
		MLP.selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${MLP.episodeNumber}"]`);

		if (MLP.selectedEpisodeListItem) {
			MLP.selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			MLP.selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
	}

	// should used IndexedDB instead? https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
	function iconOnLoad({ currentTarget: icon }) {
		if (icon.currentSrc === "https://www.gstatic.com/psa/static/1.gif")
			return;
		const iconSrcStringHash = window.String(javaStringHash(icon.outerHTML));
		let cachedSvg;

		try { cachedSvg = window.localStorage.getItem(iconSrcStringHash); } catch (err) {}

		if (cachedSvg) {
			const svg = parseSvgText(cachedSvg);
			icon.parentNode.replaceChild(svg, icon);
		} else {
			notifyPreload("fetch", icon.currentSrc, "image/svg+xml");
			window.fetch(icon.currentSrc).then((response) => response.text()).then((svgText) => {
				const serializer = new window.XMLSerializer();
				const svg = parseSvgText(svgText);
				copyAttributes(icon, svg, ["aria-label", "class", "title"]);
				const svgDimensions = { height: icon.dataset.svgHeight || icon.clientHeight, width: icon.dataset.svgWidth || icon.clientWidth };
				setAttributes(svg, svgDimensions); 
				try { window.localStorage.setItem(iconSrcStringHash, serializer.serializeToString(svg)); } catch (err) {}
				icon.parentNode.replaceChild(svg, icon);
			}).catch(console.error);
		}
		icon.removeEventListener("load", iconOnLoad, false);
	}

	function javaStringHash(string) { return window.Array.prototype.reduce.call(window.String(string), (hash, character) => (hash << 5) - hash + character.charCodeAt(0) | 0, 0); }

	function materialComponentsWebScriptOnLoad() {
		window.Promise.all(async([
			() => MLP.drawer = new MLPClasses.Drawer({ currentElement: MLP.selectedEpisodeListItem, topAppBar: new MLPClasses.TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => MLP.moreFormatsMenu = new MLPClasses.MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => MLP.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			triggerIconLoad,
			() => MLP.materialComponentsWebScript.removeEventListener("load", materialComponentsWebScriptOnLoad, false)
		])).catch(console.error);
	}

	function notifyPreload(as, href, type) { createElement("link", { as, href, type }, window.document.head); }

	function parseSvgText(svgText) {
		const parser = new window.DOMParser();
		const svg = parser.parseFromString(svgText, "image/svg+xml").documentElement;

		if (svg.tagName != "svg")
			throw new window.Error(`Loaded document is not formatted as an SVG.  Received: ${svgText}`);
		return svg;
	}

	function setAttributes(element, attributes = {}) {
		for (const key in attributes)
			element.setAttribute(key, attributes[key]);
	}

	function triggerIconLoad() {
		window.document.querySelectorAll("img[data-is-svg]").forEach((icon) => {
			if (icon.complete)
				async(() => iconOnLoad({ currentTarget: icon })).catch(console.error);
			else
				icon.addEventListener("load", iconOnLoad, false);
		});
	}

	// const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	// if (requestAnimationFrame)
	// 	requestAnimationFrame(() => window.setTimeout(documentOnLoad, 0));
	// else 
	if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", documentOnLoad, false);
	else
		documentOnLoad();
})();

// class Cache {
// 	static init(handlerType) {
// 		Cache._cacheHandler = undefined; // Cache
// 		return new Promise();
// 	}
// 	get(key) { return undefined; }
// 	set(key, value) { return undefined; }
// }

// class IndexedDBCache extends Cache {
// 	static init() {
// 		IndexedDBCache._db = undefined; // window.IDBOpenDBRequest
// 		return new window.Promise((resolve, reject) => {
// 			if (!("indexedDB" in window))
// 				reject(new window.Error("IndexedDB not supported."));
// 			const request = window.indexedDB.open("MLP", 0);
// 			request.addEventListener("success", (db) => {
// 				IndexedDBCache._db = db;
// 				resolve(db);
// 			}, false);
// 			request.addEventListener("error", (err) => resolve(err), false);
// 		});
// 	}
// }

// class LocalStorageCache extends Cache {
// 	static init() {
// 		return new window.Promise((resolve, reject) => {
// 			if ("localStorage" in window)
// 				resolve(true);
// 			else
// 				reject(new window.Error("Local Storage not supported."));
// 		});
// 	}
// 	get(key) {
// 		return new window.Promise((resolve, reject) => {
// 			let value = undefined;
// 			try { value = window.localStorage.getItem(key); } catch (err) { reject(err); }
// 			resolve(value);
// 		});
// 	}
// 	set(key, value) {
// 		return new window.Promise((resolve, reject) => {
// 			try { window.localStorage.setItem(key, value); } catch (err) { reject(err); }
// 			resolve();
// 		});
// 	}
// }