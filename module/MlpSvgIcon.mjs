import "../js/polyfills.js";
import { Cache } from "./Cache.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";

// configurable constants
const SVG_NS = "http://www.w3.org/2000/svg";
const TAG_NAME = "mlp-svg-icon";

// other constants (not configurable)
const _privates = new window.WeakMap();
const parser = new window.DOMParser();
const serializer = new window.XMLSerializer();

// private methods
async function loadIcon() {
	if (!this.isConnected)
		return;
	const href = this.href;
	const privates = _privates.get(this);
	let svgText = Cache.get(href);
	const isCached = svgText != null;

	if (href == null || href === "")
		return this.textContent = this.alt;
	else if (!isCached) {
		const response = await window.fetch(href);
		svgText = await response.text();
	}
	const doc = parser.parseFromString(svgText, "image/svg+xml");
	const svg = doc.documentElement;

	if (!isCached)
		Cache.set(href, serializer.serializeToString(svg));
	[["desc", "alt"], ["title", "title"]].forEach(([elementName, sourceAttributeName]) => {
		if (!this.hasAttribute(sourceAttributeName))
			return;
		const element = doc.createElementNS(SVG_NS, elementName);
		element.appendChild(doc.createTextNode(this.getAttribute(sourceAttributeName)));
		svg.insertBefore(element, svg.firstChild);
	});

	if (this.textContent === "" && this.childElementCount === 0)
		this.appendChild(svg);
	else
		this.firstChild.replaceWith(svg);
	[privates.icon, privates.hasIconChanged] = [svg, false];
}

export class MlpSvgIcon extends MlpCustomElement {
	static get observedAttributes() { return ["hidden", "href"]; }
	get alt() { return this.getAttribute("alt"); }
	get hidden() { return this.hasAttribute("hidden"); }
	get href() { return this.getAttribute("href"); }
	set hidden(hidden) { return this.setAttribute("hidden", window.Boolean(hidden)); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;

		if (name === "hidden")
			window.requestAnimationFrame(() => this.setAttribute("aria-hidden", window.String(newValue != null)));
		else {
			_privates.get(this).hasIconChanged = true;
			loadIcon.call(this).catch(console.error);
		}
	}
	connectedCallback() {
		const privates = _privates.get(this);

		// check if object was disconnected from DOM before connectedCallback() was called or if it was already loaded previously
		if (privates.hasLoaded && !privates.hasIconChanged)
			return;
		loadIcon.call(this).catch(console.error);
		privates.hasLoaded = true;
	}
	createdCallback() { _privates.set(this, { hasIconChanged: false, hasLoaded: false, icon: {} }); }
}
MlpSvgIcon.TAG_NAME = TAG_NAME;