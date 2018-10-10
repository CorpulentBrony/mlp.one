import { ComponentHandler } from "./ComponentHandler.js";
import { MDCTopAppBar } from "../node_modules/@material/top-app-bar";

export class TopAppBar extends ComponentHandler {
	constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: MDCTopAppBar }); }
	get clientHeight() { return super.mdcObject.root_.clientHeight; }
}