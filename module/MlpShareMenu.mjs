import { MlpCustomElement } from "./MlpCustomElement.mjs";
import { MlpMenu } from "./MlpMenu.mjs";
import { MlpShareUrl } from "./MlpShareUrl.mjs";
import { Snackbar } from "./Snackbar.js";
import * as util from "./util.js";

// configurable constants
const SHARE_URLS = {
	facebook: new MlpShareUrl("https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&display=popup&ref=plugin&src=share_button", { hrefName: "u" }),
	tumblr: new MlpShareUrl("http://www.tumblr.com/share/link", { contentName: "title", hrefName: "url" }),
	twitter: new MlpShareUrl("https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw&tw_p=tweetbutton", { contentName: "text", hrefName: ["original_referer", "url"] }),
	vk: new MlpShareUrl("http://vkontakte.ru/share.php", { hrefName: "url" })
};
const TAG_NAME = "mlp-share-menu";

// HTML
const TEMPLATE = self.document.createElement("template");
TEMPLATE.innerHTML = `
	<mlp-menu id="menu" opens-up>
		<mlp-svg-icon alt="🔗" aria-label="share" href="/material-design-icons/social/svg/production/ic_share_24px.svg" role="img" slot="label" title="Share">🔗</mlp-svg-icon>
		<mlp-menu-item id="clipboard">Clipboard</mlp-menu-item>
		<mlp-menu-item id="facebook" href="#" rel="noopener" target="_blank" type="text/html">Facebook</mlp-menu-item>
		<mlp-menu-item id="twitter" href="#" rel="noopener" target="_blank" type="text/html">Twitter</mlp-menu-item>
		<mlp-menu-item id="vk" href="#" rel="noopener" target="_blank" type="text/html">Vk</mlp-menu-item>
		<mlp-menu-item id="tumblr" href="#" rel="noopener" target="_blank" type="text/html">Tumblr</mlp-menu-item>
	</mlp-menu>
`;

// other constants (not configurable)
const _privates = new self.WeakMap();

async function clipboardOnClick() { // returns window.Promise
	try {
		await util.writeTextToClipboard(this.href);
		Snackbar.alert("A link to this page has been copied to the clipboard.");
	}
	catch (error) { console.error(error); }
}

export class MlpShareMenu extends MlpCustomElement {
	static get observedAttributes() { return []; }
	get content() { return this.getAttribute("content"); }
	get href() { return this.getAttribute("href"); }
	connectedCallback() {
		if (!this.isConnected)
			return;
		const privates = _privates.get(this);
		privates.menu.menuItems[0].addEventListener("click", privates.clipboardOnClick, { passive: true });
		privates.hasLoaded = true;
		super.connectedCallback();
	}
	createdCallback() {
		const privates = _privates.set(this, { clipboardOnClick: () => clipboardOnClick.bind(this)().catch(console.error), hasLoaded: false, menu: {} }).get(this);
		const template = TEMPLATE.content.cloneNode(true);
		util.defineCustomElement(MlpMenu);
		privates.menu = template.getElementById("menu");
		self.Object.entries(SHARE_URLS).forEach(([siteName, url]) => {
			url.searchParams = { content: this.content, href: this.href };
			template.getElementById(siteName).setAttribute("href", url.toString());
		});
		this.attachShadow({ mode: "open" }).appendChild(template);
	}
	disconnectedCallback() {
		privates.menu.menuItems[0].removeEventListener("click", privates.clipboardOnClick, { passive: true });
	}
}
MlpShareMenu.TAG_NAME = TAG_NAME;