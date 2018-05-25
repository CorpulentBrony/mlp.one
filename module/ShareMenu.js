import { MenuComponentHandler } from "./MenuComponentHandler.js";
import { Snackbar } from "./Snackbar.js";
import { writeTextToClipboard } from "./util.js";

export class ShareMenu extends MenuComponentHandler {
	constructor({ triggerElementId, triggerElementSelector }) {
		super({ elementId: "mlp-menu-share", triggerElementId, triggerElementSelector });
		this.copyBtn = super.element.querySelector("#mlp-menu-share-copy-btn");
		this.copyBtn.addEventListener("click", this.copyBtnOnClick.bind(this), false);
	}
	async copyBtnOnClick() { // returns window.Promise
		await writeTextToClipboard(this.copyBtn.dataset.href);
		Snackbar.alert("A link to this episode page has been copied to the clipboard");
	}
}