import { MlpCustomElement } from "./MlpCustomElement.mjs";
// import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-menu";

// styles
const CSS_FILES = []; //["/css/audio.css"];
const CSS_MENU_ITEM_HEIGHT = "2rem";
const CSS_TRANSITION_DURATION = "0.2s";
const INLINE_CSS = `
	li, #button, #menu {
		box-sizing: border-box;
		cursor: pointer;
	}
	li, #button {
		align-items: center;
		overflow: hidden;
		padding: 0 1rem;
		-webkit-touch-callout: none;
		touch-callout: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
	}
	li, #menu { display: flex; }
	li {
		min-height: ${CSS_MENU_ITEM_HEIGHT};
		transition-duration: ${CSS_TRANSITION_DURATION};
	}
	li:hover, #button:hover, li:focus { background-color: rgba(0, 0, 0, 0.16); }
	li:active, #button:focus { background-color: rgba(0, 0, 0, 0.32); }

	#button, #menu {
		border-radius: 0.25rem;
		transition: all ${CSS_TRANSITION_DURATION} ease;
	}
	#button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-color: transparent;
		border: none;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		height: 2.25rem;
		justify-content: center;
		letter-spacing: 0.09rem;
		outline: none;
		text-decoration: none;
		text-transform: uppercase;
		vertical-align: middle;
	}
	#button:active { background-color: rgba(0, 0, 0, 0.4); }
	#menu {
		background-color: var(--mdc-theme-on-secondary, #c9aad0);
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
		flex-direction: column;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0.01rem;
		list-style: none;
		margin: 0;
		max-height: calc(100vh - ${CSS_MENU_ITEM_HEIGHT});
		max-width: calc(100vw - ${CSS_MENU_ITEM_HEIGHT});
		min-width: 1.5rem;
		opacity: 0;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0.5rem 0;
		position: absolute;
		text-transform: none;
		transform: rotate3d(1, 0, 0, -90deg);
		transform-origin: top;
		white-space: nowrap;
		z-index: 1000;
	}
	#button:focus + #menu, #menu:focus, #menu:focus-within {
		opacity: 1;
		transform: rotate3d(1, 0, 0, 0);
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<button aria-controls="menu" aria-expanded="false" aria-haspopup="menu" id="button">
		<slot name="menu-button-contents">Menu Name</slot>
	</button>
	<ul id="menu">
		<li disabled>Empty Menu</li>
	</ul>
`; //

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
//none

export class MlpMenu extends MlpCustomElement {
	static get observedAttributes() { return []; }
	attributeChangedCallback(name, oldValue, newValue) {
	}
	connectedCallback() {
		if (!this.isConnected)
			return;
		const privates = _privates.get(this);
		privates.hasLoaded = true;
		super.connectedCallback();
	}
	createdCallback() {
		const privates = _privates.set(this, { hasLoaded: false, menu: {} }).get(this);
		const template = TEMPLATE.content.cloneNode(true);
		privates.menu = template.getElementById("menu");
		const menuItems = this.querySelectorAll("li");

		if (menuItems.length > 0) {
			privates.menu.querySelector("li").remove();
			privates.menu.append(...menuItems.values());
		}
		this.attachShadow({ mode: "open" }).appendChild(template);
	}
	disconnectedCallback() {
	}
}
MlpMenu.TAG_NAME = TAG_NAME;



/*
				<mlp-menu menu-button-text="hello">
					<mlp-menu-item>Item 1</mlp-menu-item>
					<mlp-menu-item>Item 2</mlp-menu-item>
				</mlp-menu>
				<mlp-menu>
					<mlp-svg-icon alt="🔗" aria-label="share" href="/material-design-icons/social/svg/production/ic_share_24px.svg" role="img" slot="menu-button-contents" title="Share">🔗</mlp-svg-icon>
					<mlp-menu-item>Item 3</mlp-menu-item>
					<mlp-menu-item>Item 4</mlp-menu-item>
				</mlp-menu>

// styles
const CSS_FILES = []; //["/css/audio.css"];
const CSS_MENU_ITEM_HEIGHT = "2rem";
const INLINE_CSS = `
	::slotted(mlp-menu-item), #wrapper {
		display: flex;
	}
	::slotted(mlp-menu-item), #toggle, #wrapper {
		box-sizing: border-box;
	}
	#toggle, #wrapper {
		border-radius: 0.125rem;
	}
	::slotted(mlp-menu-item), #toggle {
		cursor: pointer;
		overflow: hidden;
		padding: 0 1rem;
		-webkit-touch-callout: none;
		touch-callout: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
	}
	:host {
		contain: layout style;
		display: inline;
		width: -webkit-fill-available;
		width: -webkit-fit-content;
		width: -moz-fit-content;
		width: fit-content;
	}
	::slotted(mlp-menu-item) {
		align-items: center;
		min-height: ${CSS_MENU_ITEM_HEIGHT};
	}
	::slotted(mlp-menu-item:hover) {
		background-color: rgba(0, 0, 0, 0.16);
	}
	#toggle {
		align-items: center;
		-webkit-appearance: none;
		appearance: none;
		background-color: transparent;
		border: none;
		display: inline-flex;
		font-size: 0.875rem;
		font-weight: 500;
		height: 2.25rem;
		justify-content: center;
		letter-spacing: 0.09rem;
		outline: none;
		text-transform: uppercase;
		vertical-align: middle;
	}
	#wrapper {
		background-color: var(--mdc-theme-on-secondary, #c9aad0);
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
		flex-direction: column;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0.01rem;
		margin: 0;
		max-height: calc(100vh - ${CSS_MENU_ITEM_HEIGHT});
		max-width: calc(100vw - ${CSS_MENU_ITEM_HEIGHT});
		min-width: 10.5rem;
		overflow-x: hidden;
		overflow-y: auto;
		padding: 0.5rem 0;
		position: absolute;
		white-space: nowrap;
		z-index: 1000;
	}
	#wrapper[aria-hidden=true] { display: none; }
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<button aria-controls="wrapper" aria-expanded="false" aria-haspopup="menu" id="toggle">
		<slot name="menu-button-contents">Menu Name</slot>
	</button>
	<slot aria-hidden="true" aria-labelledby="toggle" hidden id="wrapper" role="menu">
		<!-- should consist of one or more mlp-menu-item elements -->
	</slot>
`; //

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function menuOnOpen(event) {
	if (event.target !== this)
		this.close();
}
function setMenuButtonText(menuButtonText, ignoreNull = false) {
	if (menuButtonText == null)
		if (ignoreNull)
			return;
		else
			menuButtonText = "";
	_privates.get(this).toggle.textContent = menuButtonText;
}
function setMenuVisibility(isVisible) {
	const privates = _privates.get(this);
	privates.toggle.setAttribute("aria-expanded", window.String(isVisible));
	privates.wrapper.setAttribute("aria-hidden", window.String(!isVisible));

	if (isVisible) {
		privates.wrapper.removeAttribute("hidden");
		window.document.body.addEventListener("click", privates.bodyOnClick, { once: true, passive: true });
		this.dispatchEvent("MlpMenu:open", { bubbles: true });
	} else {
		privates.wrapper.setAttribute("hidden", "");
		window.document.body.removeEventListener("click", privates.bodyOnClick, { once: true, passive: true });
		this.dispatchEvent("MlpMenu:close", { bubbles: true });
	}
}
function toggleOnClick(event) {
	this.toggle();
	event.stopPropagation();
}

export class MlpMenu extends MlpCustomElement {
	static get observedAttributes() { return ["menu-button-text", "open"]; }
	get menuButtonText() { return this.getAttribute("menu-button-text"); }
	get menuItems() {
		const menuItems = this.querySelectorAll("mlp-menu-item");
		menuItems.forEach = (callback) => window.Array.prototype.forEach.call(menuItems, callback);
		return menuItems;
	}
	get open() { return this.hasAttribute("open"); }
	set menuButtonText(menuButtonText) { this.setAttribute("menu-button-text", window.String(menuButtonText)); }
	set open(open) { this.setAttribute("open", window.Boolean(open)); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;

		switch (name) {
			case "menu-button-text": setMenuButtonText.call(this, newValue); break;
			case "open": setMenuVisibility.call(this, newValue != null); break;
		}
	}
	close() { this.open = false; }
	connectedCallback() {
		if (!this.isConnected)
			return;
		const privates = _privates.get(this);
		privates.toggle.addEventListener("click", privates.toggleOnClick, { passive: true });
		window.document.body.addEventListener("MlpMenu:open", privates.menuOnOpen, { passive: true });
		setMenuVisibility.call(this, this.open);
		setMenuButtonText.call(this, this.menuButtonText, true);
		privates.hasLoaded = true;
		super.connectedCallback();
	}
	createdCallback() {
		const privates = _privates.set(this, { bodyOnClick: this.close.bind(this), hasLoaded: false, menuOnOpen: menuOnOpen.bind(this), toggle: {}, toggleOnClick: toggleOnClick.bind(this), wrapper: {} }).get(this);
		const template = TEMPLATE.content.cloneNode(true);
		privates.toggle = template.getElementById("toggle");
		privates.wrapper = template.getElementById("wrapper");
		this.menuItems.forEach((menuItem) => {
			menuItem.setAttribute("role", "menuitem");
			menuItem.setAttribute("tabindex", "-1");
		});
		this.attachShadow({ mode: "open" }).appendChild(template);

		if (!this.hasAttribute("tabindex"))
			this.setAttribute("tabindex", "0");
	}
	disconnectedCallback() {
		const privates = _privates.get(this);
		privates.toggle.removeEventListener("click", privates.toggleOnClick, { passive: true });
		window.document.body.removeEventListener("MlpMenu:open", privates.menuOnOpen, { passive: true });
	}
	toggle() { this.open = !this.open; }
}
MlpMenu.TAG_NAME = TAG_NAME;
*/