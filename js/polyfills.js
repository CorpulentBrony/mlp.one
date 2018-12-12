"use strict";
// window.AudioContext
if (!window.AudioContext)
	window.AudioContext = window.webkitAudioContext;
// window.cancelAnimationFrame
if (!window.cancelAnimationFrame)
	window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame;
// window.CSS
if (!window.CSS)
	window.CSS = {};

if (!window.CSS.number)
	window.CSS.number = function(number) { return window.Object.freeze({ unit: "number", value: number, toString() { return window.String(number); } }); };
// window.DOMRect
if (!window.DOMRect) {
	window.DOMRect = class DOMRect { constructor(x = 0, y = 0, width = 0, height = 0) { window.Object.assign(this, { height, width, x, y }); } };
	window.DOMRect.prototype.bottom = window.DOMRect.prototype.height = window.DOMRect.prototype.left = window.DOMRect.prototype.top = window.DOMRect.prototype.width = window.DOMRect.prototype.x = window.DOMRect.prototype.y = 0;
}
// window.Element
[window.Element.prototype, window.Document.prototype, window.DocumentFragment.prototype].forEach((prototype) => {
	// window.Element.prototype.append
	if (!prototype.append)
		prototype.append = function(...nodes) { this.appendChild(nodes.reduce((doc, node) => doc.appendChild((node instanceof window.Node) ? node : window.document.createTextNode(window.String(node))), window.document.createDocumentFragment())); };

	// window.Element.prototype.prepend
	if (!prototype.prepend)
		prototype.prepend = function(...nodes) { this.insertBefore(nodes.reduce((doc, node) => doc.appendChild((node instanceof window.Node) ? node : window.document.createTextNode(window.String(node))), window.document.createDocumentFragment()), this.firstChild); };
});
[window.Element.prototype, window.CharacterData.prototype, window.DocumentType.prototype].forEach((prototype) => {
	if (prototype.replaceWith)
		return;
	prototype.replaceWith = function(...nodes) {
		if (!this.parentNode)
			return;
		else if (nodes.length === 0)
			this.parentNode.removeChild(this);

		for (let i = nodes.length - 1; i >= 0; i--) {
			const currentNode = (nodes[i] instanceof window.Node) ? nodes[i] : this.ownerDocument.createTextNode(window.String(nodes[i]));

			if (i === 0)
				this.parentNode.replaceChild(currentNode, this);
			else
				this.parentNode.insertBefore(this.previousSibling, currentNode);
		}
	};
});
// window.indexedDB
if (!window.indexedDB)
	window.indexedDB = window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
// window.IDBTransaction
if (!window.IDBTransaction)
	window.IDBTransaction = window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
// window.MutationObserver
if (!window.MutationObserver)
	window.MutationObserver = window.WebKitMutationObserver;
// window.requestAnimationFrame
if (!window.requestAnimationFrame)
	window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
// window.String
if (!window.String.prototype.padStart)
	window.String.prototype.padStart = function(targetLength, padString = " ") {
		targetLength = targetLength >>> 0;
		padString = window.String(padString);

		if (this.length >= targetLength || padString.length === 0)
			return window.String(this);
		targetLength -= this.length;
		return padString.repeat(targetLength / padString.length + 1).slice(0, targetLength) + window.String(this);
	};
if (!window.String.prototype.repeat)
	window.String.prototype.repeat = function(count) {
		count = count >>> 0;

		if (this.length === 0 || count === 0)
			return "";
		let result = "";
		let string = window.String(this);

		for (let i = count; i > 0; result += string, i--);
		return result;
	};
if (!window.String.prototype.trimStart)
	window.String.prototype.trimStart = window.String.prototype.trimLeft || function() { return this.replace(/^\s+/, ""); };
// window.URL
if (!window.URL)
	window.URL = window.webkitURL;