import { ComponentHandler } from "./ComponentHandler.js";
import "../js/mdc-bundle.js";

export class Snackbar extends ComponentHandler {
	static alert(message, timeout = 5000) {
		if (!this.instance)
			this.instance = new this();
		this.instance._alert(message, timeout);
	}
	constructor() { super({ elementSelector: ".mdc-snackbar", mdcType: window.mdc.MDCSnackbar }); }
	_alert(message, timeout) { this.mdcObject.show({ message, timeout }); }
}