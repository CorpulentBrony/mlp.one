import { ComponentHandler } from "./ComponentHandler.js";
// import { MDCTopAppBar } from "../node_modules/@material/top-app-bar";
import "../js/mdc-top-app-bar.js";

export class TopAppBar extends ComponentHandler {
	constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: window.mdc.MDCTopAppBar }); }
	get clientHeight() { return super.mdcObject.root_.clientHeight; }
}