"use strict";
const MLP = (function MLP() {
	const isDocumentLoaded = new window.Promise((resolve, reject) => {
		if (window.document.readyState === "loading")
			window.document.addEventListener("DOMContentLoaded", resolve, false);
		else
			resolve();
	});
	const isMdcLoaded = new window.Promise(async function(resolve, reject) {
		await isDocumentLoaded;

		if (typeof window.mdc === "undefined")
			window.document.getElementById("mlp-material-components-web-script").addEventListener("load", resolve, false);
		else
			resolve();
	});
	const _snackbar = new window.Promise(async function(resolve, reject) {
		await isMdcLoaded;
		resolve(new ComponentHandler({ elementSelector: ".mdc-snackbar", mdcType: window.mdc.snackbar.MDCSnackbar }));
	});

	class Cache {
		static get(key) {
			try { return window.localStorage.getItem(key); } catch (err) { return null; }
			return null;
		}
		static set(key, value) {
			try { window.localStorage.setItem(key, value); } catch(err) { return; }
		}
	}

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

	class ToggleableComponentHandler extends ComponentHandler {
		constructor({ currentElement, elementId, elementSelector, eventListeners, mdcType, topAppBar, triggerElementId, triggerElementSelector }) {
			super({ elementId, elementSelector, eventListeners, mdcType });
			this.__triggerElement = getElement({ elementId: triggerElementId, elementSelector: triggerElementSelector }); // window.Element

			if (this.__triggerElement)
				this.__triggerElement.addEventListener("click", () => this.toggle(), false);
		}
		get triggerElement() { return this.__triggerElement; }
		toggle() { super.mdcObject.open = !super.mdcObject.open; }
	}

	class MenuComponentHandler extends ToggleableComponentHandler {
		constructor({ elementId, triggerElementId, triggerElementSelector }) {
			super({ elementId, eventListeners: { ["MDCMenu:cancel"]: () => super.element.setAttribute("aria-hidden", true) }, mdcType: window.mdc.menu.MDCMenu, triggerElementId, triggerElementSelector });
			super.element.querySelectorAll("li").forEach((item) => item.addEventListener("click", this.close.bind(this), false));
			super.mdcObject.listen("MDCMenu:cancel", this.close.bind(this));
		}
		close() {
			super.element.setAttribute("aria-hidden", true);
			super.triggerElement.removeAttribute("aria-expanded");
			super.mdcObject.open = false;
		}
		toggle() {
			super.element.setAttribute("aria-hidden", super.mdcObject.open);

			if (super.mdcObject.open)
				super.triggerElement.removeAttribute("aria-expanded");
			else
				super.triggerElement.setAttribute("aria-expanded", true);
			super.toggle();
		}
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

	function getElement({ elementId, elementSelector }) { return elementId ? window.document.getElementById(elementId) : window.document.querySelector(elementSelector); }
	function javaStringHash(string) { return window.Array.prototype.reduce.call(window.String(string), (hash, character) => (hash << 5) - hash + character.charCodeAt(0) | 0, 0); }

	function loadSvg(replacesElement, src = undefined) {
		if (replacesElement.parentNode == null)
			return;
		else if (typeof src === "undefined" && "currentSrc" in replacesElement)
			src = replacesElement.currentSrc;
		const [width, height] = (replacesElement instanceof window.SVGElement) ? [replacesElement.width.baseVal.value, replacesElement.height.baseVal.value] : [replacesElement.clientWidth, replacesElement.clientHeight];

		if (window.Number(width) + window.Number(height) <= 0)
			return;
		const cacheKey = window.String(javaStringHash(`${src}|${width}|${height}`));
		let svgCached = Cache.get(cacheKey);

		if (svgCached) {
			const svg = parseSvgText(svgCached)
			replacesElement.parentNode.replaceChild(svg, replacesElement);
			return window.Promise.resolve(svg);
		} else {
			notifyPreload("fetch", src, "image/svg+xml");
			return window.fetch(src).then((response) => response.text()).then((svgText) => {
				if (replacesElement.parentNode == null)
					return;
				const serializer = new window.XMLSerializer();
				const svg = parseSvgText(svgText);
				copyAttributes(replacesElement, svg, ["aria-label", "class", "title"]);
				setAttributes(svg, { height, width });

				for (const attribute in replacesElement.dataset)
					svg.dataset[attribute] = replacesElement.dataset[attribute];
				svg.dataset.svgSrc = src;
				Cache.set(cacheKey, serializer.serializeToString(svg));
				replacesElement.parentNode.replaceChild(svg, replacesElement);
				return svg;
			}).catch(console.error);
		}
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

	async function showAlert(message) { // returns window.Promise
		const snackbar = await _snackbar;
		snackbar.mdcObject.show({ message, timeout: 5000 });
	}

	function writeTextToClipboard(text) { // returns window.Promise
		if ("navigator" in window && "clipboard" in window.navigator && "writeText" in window.navigator.clipboard) {
			return window.navigator.clipboard.writeText(window.String(text));
		} else {
			const textArea = window.document.createElement("textarea");
			textArea.value = window.String(text);
			window.document.body.appendChild(textArea);
			textArea.select();
			window.document.execCommand("copy");
			textArea.remove();
			return window.Promise.resolve(undefined);
		}
	}

	return {
		Cache,
		Drawer: class Drawer extends ToggleableComponentHandler {
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
				this._topAppBar = topAppBar; // MLP.TopAppBar
			}
			toggle() {
				super.toggle();

				if (this._currentElement && super.mdcObject.open)
					super.mdcObject.drawer.querySelector(".mdc-drawer__content").scrollTop = this._currentElement.offsetTop - this._topAppBar.clientHeight;
			}
		},
		MoreFormatsMenu: class MoreFormatsMenu extends MenuComponentHandler {
			constructor({ triggerElementId, triggerElementSelector }) { super({ elementId: "mlp-menu-more-formats", triggerElementId, triggerElementSelector }); }
		},
		ShareMenu: class ShareMenu extends MenuComponentHandler {
			constructor({ triggerElementId, triggerElementSelector }) {
				super({ elementId: "mlp-menu-share", triggerElementId, triggerElementSelector });
				this.copyBtn = super.element.querySelector("#mlp-menu-share-copy-btn");
				this.copyBtn.addEventListener("click", this.copyBtnOnClick.bind(this), false);
			}
			async copyBtnOnClick() { // returns window.Promise
				await writeTextToClipboard(this.copyBtn.dataset.href);
				showAlert("A link to this episode page has been copied to the clipboard");
			}
		},
		TopAppBar: class TopAppBar extends ComponentHandler {
			constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: window.mdc.topAppBar.MDCTopAppBar }); }
			get clientHeight() { return super.mdcObject.root_.clientHeight; }
		},
		loadSvg,
		isDocumentLoaded,
		isMdcLoaded
	};
})();
(async function index() {
	const MLPIndex = window.Object.create(window.Object.prototype);
	MLPIndex.drawer = undefined; // MLP.Drawer
	MLPIndex.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
	MLPIndex.materialComponentsWebScript = undefined; // window.HTMLScriptElement
	MLPIndex.moreFormatsMenu = undefined; // MLP.MoreFormatsMenu
	MLPIndex.rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"
	MLPIndex.ripples = new window.Set();
	MLPIndex.selectedEpisodeListItem = undefined; // window.HTMLLIElement
	MLPIndex.shareMenu = undefined; // MLP.ShareMenu

	function async(funcOrArray) {
		if (window.Array.isArray(funcOrArray))
			return funcOrArray.map((func) => async(func));
		return new window.Promise((resolve, reject) => {
			try { window.setTimeout(() => resolve(funcOrArray.call(undefined))); }
			catch (err) { reject(err); }
		});
	}

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => MLPIndex.ripples.add(new window.mdc.ripple.MDCRipple(item))); }

	function checkWebpSupport() {
		const cacheKey = "isWebpSupported";
		const cacheValue = MLP.Cache.get(cacheKey);
		const setWebpSupportedClass = (isWebpSupported) => window.document.body.classList.add(({ true: "webp-support", false: "webp-no-support" })[isWebpSupported]);

		if (cacheValue != null)
			setWebpSupportedClass(cacheValue);
		else {
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
			check.then(() => {
				MLP.Cache.set(cacheKey, "true");
				setWebpSupportedClass("true");
			}).catch(() => {
				MLP.Cache.set(cacheKey, "false");
				setWebpSupportedClass("false");
			});
		}
	}

	async function documentOnLoad() {
		await MLP.isDocumentLoaded;
		MLPIndex.materialComponentsWebScript = window.document.getElementById("mlp-material-components-web-script");
		checkWebpSupport();
		window.Promise.all(async([
			findSelectedEpisodeListItem,
			setupAudioControls
		])).catch(console.error);
		await MLP.isMdcLoaded;
		materialComponentsWebScriptOnLoad();
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
	}

	function findSelectedEpisodeListItem() {
		MLPIndex.selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${MLPIndex.episodeNumber}"]`);

		if (MLPIndex.selectedEpisodeListItem) {
			MLPIndex.selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			MLPIndex.selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
	}

	// should used IndexedDB instead? https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
	function iconOnLoad({ currentTarget: icon }) {
		if (icon.currentSrc === "" || icon.currentSrc === "https://www.gstatic.com/psa/static/1.gif")
			return;
		MLP.loadSvg(icon);
		icon.removeEventListener("load", iconOnLoad, false);
	}

	function materialComponentsWebScriptOnLoad() {
		window.Promise.all(async([
			() => MLPIndex.drawer = new MLP.Drawer({ currentElement: MLPIndex.selectedEpisodeListItem, topAppBar: new MLP.TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => MLPIndex.moreFormatsMenu = new MLP.MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => MLPIndex.shareMenu = new MLP.ShareMenu({ triggerElementId: "mlp-btn-share" }),
			() => MLPIndex.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			triggerIconLoad,
			() => MLPIndex.materialComponentsWebScript.removeEventListener("load", materialComponentsWebScriptOnLoad, false)
		])).catch(console.error);
	}

	function setupAudioControls() {
		const audioElement = window.document.querySelector("audio");
		const cachedCurrentTimeKey = `episode-${MLPIndex.episodeNumber}-current-time`;
		const cachedCurrentTimeValue = MLP.Cache.get(cachedCurrentTimeKey);
		const cachedVolumeKey = "volume";
		const cachedVolumeValue = MLP.Cache.get(cachedVolumeKey);

		if (cachedVolumeValue != null)
			audioElement.volume = window.Number(cachedVolumeValue);

		if (cachedCurrentTimeValue != null)
			audioElement.currentTime = window.Number(cachedCurrentTimeValue);
		audioElement.addEventListener("timeupdate", () => MLP.Cache.set(cachedCurrentTimeKey, audioElement.currentTime), false);
		audioElement.addEventListener("volumechange", () => MLP.Cache.set(cachedVolumeKey, audioElement.volume), false);
	}

	function triggerIconLoad() {
		window.document.querySelectorAll("img[data-is-svg]").forEach((icon) => {
			if (icon.complete && icon.currentSrc !== "" && icon.currentSrc !== "https://www.gstatic.com/psa/static/1.gif")
				iconOnLoad({ currentTarget: icon });
			icon.addEventListener("load", iconOnLoad, false);
		});
	}

	await documentOnLoad();
})().catch(console.error);

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