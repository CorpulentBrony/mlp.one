import "../js/polyfills.js";
import { Cache } from "./Cache.js";

export const isDocumentLoaded = new window.Promise((resolve) => {
	if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", resolve, false);
	else
		resolve();
});

function arrayify(something) {
	if (typeof something === "object")
		if ("forEach" in something)
			return something;
		else if (typeof something.length === "number") {
			const result = window.Array.prototype.slice.call(something, 0);
			something.forEach = result.forEach;
			return result;
		}
	return [something];
}
export function async(funcOrArray) {
	if (window.Array.isArray(funcOrArray))
		return funcOrArray.map((func) => async(func));
	return new window.Promise((resolve, reject) => {
		try { window.setTimeout(() => resolve(funcOrArray.call(undefined)), 0); }
		catch (err) { reject(err); }
	});
}
export function checkWebpSupport() {
	const cacheKey = "isWebpSupported";
	const cacheValue = Cache.get(cacheKey);
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
			Cache.set(cacheKey, "true");
			setWebpSupportedClass("true");
		}).catch(() => {
			Cache.set(cacheKey, "false");
			setWebpSupportedClass("false");
		});
	}
}
export function createDefinedElement({ TAG, ATTRIBUTES = {}, TEXT = undefined }, parent = undefined) { return createElement(TAG, ATTRIBUTES, parent, TEXT); }
export function createElement(name, attributes = {}, parent = undefined, text = undefined) {
	const element = window.document.createElement(name);
	setAttributes(element, attributes);

	if (text !== undefined)
		element.textContent = window.String(text);

	if (parent instanceof window.Node)
		parent.appendChild(element);
	return element;
}
export function defineCustomElement(ElementClass) {
	const supportsCustomElements = window.customElements && window.customElements.define;
	const supportsRegisterElement = window.Boolean(window.document.registerElement);

	function customElementsNotSupported() { return; }
	function defineCustomElementV0(ElementClass) {
		const testElementConstructor = window.document.createElement(ElementClass.TAG_NAME).constructor;

		if (testElementConstructor === window.HTMLElement || testElementConstructor === window.HTMLUnknownElement)
			return;
		window.document.registerElement(ElementClass.TAG_NAME, { prototype: window.Object.create(ElementClass.prototype) });
	}
	function defineCustomElementV1(ElementClass) {
		if (window.customElements.get(ElementClass.TAG_NAME))
			return;
		window.customElements.define(ElementClass.TAG_NAME, ElementClass);
	}

	if (supportsCustomElements)
		defineCustomElement = defineCustomElementV1;
	else if (supportsRegisterElement)
		defineCustomElement = defineCustomElementV0;
	else
		defineCustomElement = customElementsNotSupported;
	defineCustomElement(ElementClass);
}
export function defineCustomElements(elementClasses) { arrayify(elementClasses).forEach(defineCustomElement); }
// service workers don't support ES6 modules, so this was moved directly into service-worker script
// export function expandFileList(fileList = [], prefix = "") {
// 	return fileList.reduce((result, entry) => {
// 		if (typeof entry === "string")
// 			result.push(prefix + entry);
// 		else if (typeof entry === "object") {
// 			const entryKey = self.Object.keys(entry)[0];
// 			result = result.concat(expandFileList(entry[entryKey], `${prefix}${entryKey}/`));
// 		}
// 		return result;
// 	}, []);
// }
export function getChildrenAsObject(element) {
	if (!element.children || !element.children.length)
		return;
	return getNodesAsObject(element.children);
}
// this is very simplified to allow me to leverage the CSS Typed OM without writing more of a polyfill
// https://developers.google.com/web/updates/2018/03/cssom
// https://www.w3.org/TR/css-typed-om-1/
export function getCssProperty(element, property) {
	if ("computedStyleMap" in element)
		return element.computedStyleMap().get(property);
	const unparsed = window.getComputedStyle(element).getPropertyValue(property).trim();
	const parsed = /^([0-9]+\.?[0-9]*)(%|[a-z]*)$/.exec(unparsed);

	if (parsed == null)
		return window.Object.freeze({ value: unparsed, toString() { return value; } });
	const unit = (parsed[2].length === 0) ? "number" : (parsed[2] === "%") ? "percent" : parsed[2];
	return window.Object.freeze({ unit: "number", value: window.Number(parsed[1]), toString() { return unparsed; } });
}
export function getElement({ elementId, elementSelector }) { return elementId ? window.document.getElementById(elementId) : window.document.querySelector(elementSelector); }
export function getNodesAsObject(nodes) {
	return window.Array.prototype.reduce.call(nodes, (result, node, index) => window.Object.defineProperty(result, node.id || window.String(index), { enumerable: true, value: node, writable: true }), {});
}
export async function loadDeferredStylesheets(containerId = "deferred-stylesheets") {
	const parser = new window.DOMParser();
	const loader = () => parser.parseFromString(document.getElementById(containerId).textContent, "text/html").querySelectorAll("link").forEach((link) => window.document.head.appendChild(link));

	if (window.requestAnimationFrame)
		window.requestAnimationFrame(() => loader.call(undefined));
	else {
		await isDocumentLoaded;
		loader.call(undefined);
	}
	return true;
}
export function preload(files = [], attributes = {}) {
	arrayify(files).forEach((hrefOrAttributes) => createElement("link", window.Object.assign({}, attributes, (typeof hrefOrAttributes === "string") ? { href: hrefOrAttributes } : hrefOrAttributes), window.document.head));
}
export function removeCssProperty(element, property) {
	if ("attributeStyleMap" in element)
		return element.attributeStyleMap.delete(property);
	element.style.removeProperty(property);
}
export function setAttributes(element, attributes = {}) {
	for (const key in attributes)
		element.setAttribute(key, attributes[key]);
}
export function setCssProperty(element, property, value) {
	if ("attributeStyleMap" in element)
		return element.attributeStyleMap.set(property, value);
	element.style.setProperty(property, window.String(value));
}
export function writeTextToClipboard(text) { // returns window.Promise
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



// the below was all used to support the loadSvg function and may be useful code in the future
// function copyAttributes(fromElement, toElement, attributes = []) {
// 	attributes.forEach((attribute) => {
// 		const attributeIsString = typeof attribute === "string";
// 		const fromElementAttribute = attributeIsString ? fromElement.getAttribute(attribute) : fromElement.getAttribute(attribute[0]);

// 		if (fromElementAttribute !== null)
// 			toElement.setAttribute(attributeIsString ? attribute : attribute[1], fromElementAttribute);
// 	});
// }

// function javaStringHash(string) { return window.Array.prototype.reduce.call(window.String(string), (hash, character) => (hash << 5) - hash + character.charCodeAt(0) | 0, 0); }

// export async function loadSvg(replacesElement, src = undefined) { // returns window.Promise
// 	if (replacesElement.parentNode == null)
// 		return;
// 	else if (typeof src === "undefined" && "currentSrc" in replacesElement)
// 		src = replacesElement.currentSrc;
// 	const [width, height] = (replacesElement instanceof window.SVGElement) ? [replacesElement.width.baseVal.value, replacesElement.height.baseVal.value] : [replacesElement.clientWidth, replacesElement.clientHeight];

// 	if (window.Number(width) + window.Number(height) <= 0)
// 		return;
// 	const cacheKey = window.String(javaStringHash(`${src}|${width}|${height}`));
// 	let svgCached = Cache.get(cacheKey);

// 	if (svgCached) {
// 		const svg = parseSvgText(svgCached)
// 		replacesElement.parentNode.replaceChild(svg, replacesElement);
// 		return svg;
// 	} else {
// 		notifyPreload("fetch", src, "image/svg+xml");
// 		return window.fetch(src).then((response) => response.text()).then((svgText) => {
// 			if (replacesElement.parentNode == null)
// 				return;
// 			const serializer = new window.XMLSerializer();
// 			const svg = parseSvgText(svgText);
// 			copyAttributes(replacesElement, svg, ["aria-label", "class", "title"]);
// 			setAttributes(svg, { height, width });

// 			for (const attribute in replacesElement.dataset)
// 				svg.dataset[attribute] = replacesElement.dataset[attribute];
// 			svg.dataset.svgSrc = src;
// 			Cache.set(cacheKey, serializer.serializeToString(svg));
// 			replacesElement.parentNode.replaceChild(svg, replacesElement);
// 			return svg;
// 		});
// 	}
// }

// function notifyPreload(as, href, type) { createElement("link", { as, href, type }, window.document.head); }

// function parseSvgText(svgText) {
// 	const parser = new window.DOMParser();
// 	const svg = parser.parseFromString(svgText, "image/svg+xml").documentElement;

// 	if (svg.tagName != "svg")
// 		throw new window.Error(`Loaded document is not formatted as an SVG.  Received: ${svgText}`);
// 	return svg;
// }