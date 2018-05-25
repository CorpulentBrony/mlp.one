import { ComponentHandler } from "./ComponentHandler.js";
import "../js/mdc-bundle.js";

export class TopAppBar extends ComponentHandler {
	constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: window.mdc.MDCTopAppBar }); }
	get clientHeight() { return super.mdcObject.root_.clientHeight; }
}