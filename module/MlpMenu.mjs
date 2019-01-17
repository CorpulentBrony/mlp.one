import "../js/polyfills.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-menu";

// styles
const CSS_FILES = ["/css/MlpMenu.css"];
util.preload(CSS_FILES, { as: "style", importance: "high", type: "text/css" });

// HTML
const TEMPLATE = self.document.createElement("template");
TEMPLATE.innerHTML = `
	<button aria-controls="menu" aria-expanded="false" aria-haspopup="menu" id="button">
		<slot name="label">Menu Name</slot>
	</button>
	<ul aria-hidden="true" aria-labelledby="button" id="menu" role="menu">
		<li aria-disabled="true" disabled role="menuitem">Empty Menu</li>
	</ul>
`;

// other constants (not configurable)
const _privates = new self.WeakMap();

// private methods
function buttonOnClick(event) {
	this.open = !this.open;
	event.stopPropagation();
}
function onFocusOut(event) {
	if (util.getCssProperty(_privates.get(this).menu, "opacity").value === 1)
		this.open = false;
}

export class MlpMenu extends MlpCustomElement {
	static get observedAttributes() { return []; }
	get label() { return this.getAttribute("label"); }
	get menu() { return _privates.get(this).menu; }
	get menuItems() { return _privates.get(this).menuItems; }
	get open() { return this.hasAttribute("open"); }
	set label(label) {
		this.setAttribute("label", self.String(label));
		_privates.get(this).button.textContent = this.label;
	}
	set open(open) {
		const privates = _privates.get(this);
		open = self.Boolean(open);
		this.setAttribute("open", open);
		privates.button.setAttribute("aria-expanded", self.String(open));
		privates.menu.setAttribute("aria-hidden", self.String(!open));
	}
	connectedCallback() {
		if (!this.isConnected)
			return;
		const privates = _privates.get(this);
		this.addEventListener("focusout", privates.onFocusOut, { passive: true });
		privates.button.addEventListener("click", privates.buttonOnClick, { passive: true });
		this.open = this.open;
		privates.hasLoaded = true;
		super.connectedCallback();
	}
	createdCallback() {
		const privates = _privates.set(this, { button: {}, buttonOnClick: buttonOnClick.bind(this), hasLoaded: false, menu: {}, menuItems: [], onFocusOut: onFocusOut.bind(this) }).get(this);
		const template = TEMPLATE.content.cloneNode(true);
		privates.button = template.getElementById("button");
		privates.menu = template.getElementById("menu");
		privates.menuItems = self.Array.prototype.map.call(this.querySelectorAll("mlp-menu-item"), (menuItem) => {
			const li = self.document.createElement("li");

			if (menuItem.hasAttribute("href")) {
				const a = util.createElement("a", {}, li);
				a.addEventListener("click", (event) => event.stopPropagation(), { passive: true });
				li.addEventListener("click", () => a.click(), { passive: true });
				util.copyAttributes(menuItem, a);
				a.setAttribute("role", "menuitem");
				li.setAttribute("role", "none")
				a.append(...menuItem.childNodes.values());
			} else {
				util.copyAttributes(menuItem, li);
				util.setAttributes(li, { role: "menuitem", tabindex: "0" });
				li.append(...menuItem.childNodes.values());
			}
			return li;
		});

		if (privates.menuItems.length > 0) {
			privates.menu.querySelector("li").remove();
			privates.menu.append(...privates.menuItems);
		}

		if (this.hasAttribute("label"))
			this.label = this.label;
		this.attachShadow({ mode: "open" }).appendChild(template);
		window.requestAnimationFrame(() => CSS_FILES.forEach((href) => util.createElement("link", { href, importance: "high", rel: "stylesheet" }, this.shadowRoot)));
	}
	disconnectedCallback() {
		this.removeEventListener("focusout", privates.onFocusOut, { passive: true });
		privates.button.removeEventListener("click", privates.buttonOnClick, { passive: true });
	}
}
MlpMenu.TAG_NAME = TAG_NAME;