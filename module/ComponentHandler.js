"use strict";
import { getElement } from "./util.js";

export class ComponentHandler {
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