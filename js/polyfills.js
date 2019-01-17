"use strict";
// self.AudioContext
if (!self.AudioContext)
	self.AudioContext = self.webkitAudioContext;
// self.cancelAnimationFrame
if (!self.cancelAnimationFrame)
	self.cancelAnimationFrame = self.webkitCancelAnimationFrame || self.mozCancelAnimationFrame || self.msCancelAnimationFrame || self.oCancelAnimationFrame || self.webkitCancelRequestAnimationFrame || self.mozCancelRequestAnimationFrame || self.msCancelRequestAnimationFrame || self.oCancelRequestAnimationFrame;
// self.CSS
if (!self.CSS)
	self.CSS = {};

if (!self.CSS.number)
	self.CSS.number = function(number) { return self.Object.freeze({ unit: "number", value: number, toString() { return self.String(number); } }); };

if (!self.CSS.percent)
	self.CSS.percent = function(percent) { return self.Object.freeze({ unit: "percent", value: percent, toString() { return `${self.String(percent)}%`; } }); }
// self.document.hidden
if (typeof self.document.hidden === "undefined")
	if (typeof self.document.webkitHidden !== "undefined")
		self.Object.defineProperty(self.document, "hidden", { get: () => self.document.webkitHidden });
	else if (typeof self.document.mozHidden !== "undefined")
		self.Object.defineProperty(self.document, "hidden", { get: () => self.document.mozHidden });
// self.DOMRect
if (!self.DOMRect) {
	self.DOMRect = class DOMRect { constructor(x = 0, y = 0, width = 0, height = 0) { self.Object.assign(this, { height, width, x, y }); } };
	self.DOMRect.prototype.bottom = self.DOMRect.prototype.height = self.DOMRect.prototype.left = self.DOMRect.prototype.top = self.DOMRect.prototype.width = self.DOMRect.prototype.x = self.DOMRect.prototype.y = 0;
}
// self.Element
[self.Element.prototype, self.Document.prototype, self.DocumentFragment.prototype].forEach((prototype) => {
	// self.Element.prototype.append
	if (!prototype.append)
		prototype.append = function(...nodes) { this.appendChild(nodes.reduce((doc, node) => doc.appendChild((node instanceof self.Node) ? node : self.document.createTextNode(self.String(node))), self.document.createDocumentFragment())); };

	// self.Element.prototype.prepend
	if (!prototype.prepend)
		prototype.prepend = function(...nodes) { this.insertBefore(nodes.reduce((doc, node) => doc.appendChild((node instanceof self.Node) ? node : self.document.createTextNode(self.String(node))), self.document.createDocumentFragment()), this.firstChild); };
});
[self.Element.prototype, self.CharacterData.prototype, self.DocumentType.prototype].forEach((prototype) => {
	// self.Element.prototype.remove
	if (!prototype.remove)
		prototype.remove = function() {
			if (this.parentNode !== null)
				this.parentNode.removeChild(this);
		};

	// self.Element.prototype.replaceWith
	if (!prototype.replaceWith)
		prototype.replaceWith = function(...nodes) {
			if (!this.parentNode)
				return;
			else if (nodes.length === 0)
				this.parentNode.removeChild(this);

			for (let i = nodes.length - 1; i >= 0; i--) {
				const currentNode = (nodes[i] instanceof self.Node) ? nodes[i] : this.ownerDocument.createTextNode(self.String(nodes[i]));

				if (i === 0)
					this.parentNode.replaceChild(currentNode, this);
				else
					this.parentNode.insertBefore(this.previousSibling, currentNode);
			}
		};
});
if (!"attributes" in self.Element.prototype)
	self.Element.prototype.attributes = self.Element.prototype.mozNamedAttrMap;
if (!self.Element.prototype.getAttributeNames)
	self.Element.prototype.getAttributeNames = function() { return self.Array.prototype.map.call(this.attributes, (attribute) => attribute.name); };
// self.indexedDB
if (!self.indexedDB)
	self.indexedDB = self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB;
// self.IDBTransaction
if (!self.IDBTransaction)
	self.IDBTransaction = self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction;
// self.MutationObserver
if (!self.MutationObserver)
	self.MutationObserver = self.WebKitMutationObserver;
// self.requestAnimationFrame
if (!self.requestAnimationFrame)
	self.requestAnimationFrame = self.webkitRequestAnimationFrame || self.mozRequestAnimationFrame || self.msRequestAnimationFrame || self.oRequestAnimationFrame;
// self.String
if (!self.String.prototype.padStart)
	self.String.prototype.padStart = function(targetLength, padString = " ") {
		targetLength = targetLength >>> 0;
		padString = self.String(padString);

		if (this.length >= targetLength || padString.length === 0)
			return self.String(this);
		targetLength -= this.length;
		return padString.repeat(targetLength / padString.length + 1).slice(0, targetLength) + self.String(this);
	};
if (!self.String.prototype.repeat)
	self.String.prototype.repeat = function(count) {
		count = count >>> 0;

		if (this.length === 0 || count === 0)
			return "";
		let result = "";
		let string = self.String(this);

		for (let i = count; i > 0; result += string, i--);
		return result;
	};
if (!self.String.prototype.trimStart)
	self.String.prototype.trimStart = self.String.prototype.trimLeft || function() { return this.replace(/^\s+/, ""); };
// self.URL
if (!self.URL)
	self.URL = self.webkitURL;