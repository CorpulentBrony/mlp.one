import { Cache } from "./Cache.js";

export const isDocumentLoaded = new window.Promise((resolve, reject) => {
	if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", resolve, false);
	else
		resolve();
});

export function async(funcOrArray) {
	if (window.Array.isArray(funcOrArray))
		return funcOrArray.map((func) => async(func));
	return new window.Promise((resolve, reject) => {
		try { window.setTimeout(() => resolve(funcOrArray.call(undefined))); }
		catch (err) { reject(err); }
	});
}

export function getElement({ elementId, elementSelector }) { return elementId ? window.document.getElementById(elementId) : window.document.querySelector(elementSelector); }

export function loadDeferredStylesheets(containerId = "deferred-stylesheets") {
	const parser = new window.DOMParser();
	parser.parseFromString(document.getElementById(containerId).textContent, "text/html").querySelectorAll("link").forEach((link) => window.document.head.appendChild(link));
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

// function createElement(name, attributes = {}, parent = undefined, text = undefined) {
// 	const element = window.document.createElement(name);
// 	setAttributes(element, attributes);

// 	if (text !== undefined)
// 		element.textContent = text;

// 	if (parent !== undefined)
// 		parent.appendChild(element);
// 	return element;
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

// function setAttributes(element, attributes = {}) {
// 	for (const key in attributes)
// 		element.setAttribute(key, attributes[key]);
// }