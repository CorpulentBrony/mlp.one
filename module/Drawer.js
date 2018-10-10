import { ToggleableComponentHandler } from "./ToggleableComponentHandler.js";
// import "../js/mdc-bundle.js";
import { MDCTemporaryDrawer } from "../node_modules/@material/drawer";

export class Drawer extends ToggleableComponentHandler {
	constructor({ currentElement, topAppBar, triggerElementId, triggerElementSelector }) {
		super({
			elementSelector: "aside.mdc-drawer", 
			eventListeners: {
				["MDCTemporaryDrawer:open"]: () => this.mdcObject.drawer.setAttribute("aria-hidden", false),
				["MDCTemporaryDrawer:close"]: () => this.mdcObject.drawer.setAttribute("aria-hidden", true)
			}, 
			mdcType: MDCTemporaryDrawer,
			triggerElementId,
			triggerElementSelector
		});
		this._currentElement = currentElement; // window.Element
		this._topAppBar = topAppBar; // MLP.TopAppBar
	}
	toggle() {
		super.toggle();

		if (this._currentElement && super.mdcObject.open)
			super.mdcObject.drawer.querySelector(".mdc-drawer__content").scrollTop = this._currentElement.offsetTop - this._topAppBar.clientHeight;
	}
}