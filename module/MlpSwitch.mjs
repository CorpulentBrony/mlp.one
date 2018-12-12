import { MlpCustomElement } from "./MlpCustomElement.mjs";
import { MlpSvgIcon } from "./MlpSvgIcon.mjs";
import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-switch";

// other constants (not configurable)
const _privates = new window.WeakMap();

export class MlpSwitch extends MlpCustomElement {
	static get observedAttributes() { return ["aria-checked"]; }
	get checked() { return this.getAttribute("aria-checked") != "false"; }
	get disabled() { return this.hasAttribute("disabled"); }
	set checked(checked) { this.setAttribute("aria-checked", window.String(window.Boolean(checked))); }
	set disabled(disabled) { this.setAttribute("disabled", window.Boolean(disabled)); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;
		const privates = _privates.get(this);
		const [iconToShow, iconToHide] = this.checked ? [privates.iconChecked, privates.iconUnchecked] : [privates.iconUnchecked, privates.iconChecked];
		[iconToShow.hidden, iconToHide.hidden] = [false, true];
	}
	// called when object is connected to the DOM
	connectedCallback() {
		const privates = _privates.get(this);

		// check if object was disconnected from DOM before connectedCallback() was called or if it was already loaded previously
		if (!this.isConnected || privates.hasLoaded)
			return;
		util.defineCustomElement(MlpSvgIcon);
		privates.hasLoaded = true;
	}
	createdCallback() {
		const privates = _privates.set(this, { hasLoaded: false, iconChecked: {}, iconUnchecked: {} }).get(this);
		privates.iconChecked = this.querySelector("mlp-svg-icon[when-checked=true]");
		privates.iconUnchecked = this.querySelector("mlp-svg-icon[when-checked=false]");
	}
}
MlpSwitch.TAG_NAME = TAG_NAME;