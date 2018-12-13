import { MlpCustomElement } from "./MlpCustomElement.mjs";
import { MlpSvgIcon } from "./MlpSvgIcon.mjs";
import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-switch";

// styles
const INLINE_CSS = `
	:host {
		--mlp-switch-background-color: pink;
		--mlp-switch-size: 2rem;
		align-items: center;
		box-sizing: border-box;
		contain: content;
		cursor: pointer;
		display: flex;
		height: var(--mlp-switch-size);
		min-width: var(--mlp-switch-size);
		position: relative;
		justify-content: center;
		outline: none;
		text-align: center;
	}
	::slotted(mlp-svg-icon) {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		position: absolute;
		top: 0;
		width: 100%;
	}
	#background {
		background-color: transparent;
		border-radius: 50%;
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		transition: background 0.27s ease-out;
		width: 100%;
	}
	:host(:hover) #background { background-image: radial-gradient(var(--mlp-switch-background-color), rgba(0, 0, 0, 0) 75%); }
	:host(:focus) #background { background-image: radial-gradient(var(--mlp-switch-background-color), var(--mlp-switch-background-color) 50%, rgba(0, 0, 0, 0) 75%); }
	:host(:active) #background { background-color: var(--mlp-switch-background-color); }
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<div id="background"></div>
	<slot></slot>
`;

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
	connectedCallback() {
		const privates = _privates.get(this);
		this.addEventListener("click", privates.onClick, { passive: true });

		if (!this.isConnected || privates.hasLoaded)
			return;
		util.defineCustomElement(MlpSvgIcon);
		privates.hasLoaded = true;
	}
	createdCallback() {
		const privates = _privates.set(this, { hasLoaded: false, iconChecked: {}, iconUnchecked: {}, onClick: () => this.blur() }).get(this);
		const template = TEMPLATE.content.cloneNode(true);
		privates.iconChecked = this.querySelector("mlp-svg-icon[when-checked=true]");
		privates.iconUnchecked = this.querySelector("mlp-svg-icon[when-checked=false]");
		this.attachShadow({ mode: "open" }).appendChild(template);
	}
	disconnectedCallback() { this.removeEventListener("click", privates.onClick, { passive: true }); }
}
MlpSwitch.TAG_NAME = TAG_NAME;