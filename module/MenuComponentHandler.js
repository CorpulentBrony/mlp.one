"use strict";
import { ToggleableComponentHandler } from "./ToggleableComponentHandler.js";
import "../js/mdc-bundle.js";

export class MenuComponentHandler extends ToggleableComponentHandler {
	constructor({ elementId, triggerElementId, triggerElementSelector }) {
		super({ elementId, eventListeners: { ["MDCMenu:cancel"]: () => this.element.setAttribute("aria-hidden", true) }, mdcType: window.mdc.MDCMenu, triggerElementId, triggerElementSelector });
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