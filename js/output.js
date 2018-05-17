"use strict";
(function index() {
	const MLP = window.Object.create(window.Object.prototype);
	MLP.appBar = undefined; // window.mdc.topAppBar.MDCTopAppBar
	MLP.drawer = undefined; // window.mdc.drawer.MDCTemporaryDrawer
	MLP.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
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
		if (typeof window.mdc === "undefined")
			window.document.getElementById("material-components-web-script").addEventListener("load", materialComponentsWebScriptOnLoad, false);
		else
			async(materialComponentsWebScriptOnLoad).catch(console.error);
		async(() => Array.prototype.some.call(window.document.querySelector(".mdc-drawer__content.mdc-list").children, (item) => {
			if (item.value === MLP.episodeNumber) {
				MLP.selectedEpisodeListItem = item;
				MLP.selectedEpisodeListItem.classList.add("mdc-list-item--activated");
				return true;
			}
			return false;
		}));
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false);
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
	}

	function javaStringHash(string) { return window.Array.prototype.reduce.call(window.String(string), (hash, character) => (hash << 5) - hash + character.charCodeAt(0) | 0, 0); }

	function materialComponentsWebScriptOnLoad() {
		window.Promise.all(async([
			() => MLP.drawer = new window.mdc.drawer.MDCTemporaryDrawer(window.document.querySelector(".mdc-drawer--temporary")),
			() => window.document.querySelector(".mdc-top-app-bar__navigation-icon").addEventListener("click", navigationIconOnClick),
			() => MLP.appBar = new window.mdc.topAppBar.MDCTopAppBar(window.document.querySelector(".mdc-top-app-bar")),
			() => MLP.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			triggerIconLoad,
			() => window.document.getElementById("material-components-web-script").removeEventListener("load", materialComponentsWebScriptOnLoad, false)
		])).catch(console.error);
	}

	function navigationIconOnClick() {
		if (!MLP.drawer) 
			return;
		MLP.drawer.open = true;

		if (MLP.selectedEpisodeListItem)
			MLP.drawer.drawer.querySelector(".mdc-drawer__content").scrollTop = MLP.selectedEpisodeListItem.offsetTop - MLP.appBar.root_.clientHeight;
	}

	function notifyPreload(as, href, type) {
		createElement("link", { as, href, type }, window.document.head);
	}

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
				iconOnLoad({ currentTarget: icon });
			else
				icon.addEventListener("load", iconOnLoad, false);
		});
	}

	const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	if (requestAnimationFrame)
		requestAnimationFrame(() => window.setTimeout(documentOnLoad, 0));
	else if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", documentOnLoad, false);
	else
		documentOnLoad();
})();