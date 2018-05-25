"use strict";
import { ComponentHandler } from "./ComponentHandler.js";
import { getElement } from "./util.js";

export class ToggleableComponentHandler extends ComponentHandler {
	constructor({ currentElement, elementId, elementSelector, eventListeners, mdcType, topAppBar, triggerElementId, triggerElementSelector }) {
		super({ elementId, elementSelector, eventListeners, mdcType });
		this.__triggerElement = getElement({ elementId: triggerElementId, elementSelector: triggerElementSelector }); // window.Element

		if (this.__triggerElement)
			this.__triggerElement.addEventListener("click", () => this.toggle(), false);
	}
	get triggerElement() { return this.__triggerElement; }
	toggle() { super.mdcObject.open = !super.mdcObject.open; }
}