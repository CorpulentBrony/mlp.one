import { MlpEpisodeTimestamp } from "./MlpEpisodeTimestamp.mjs";
import { MlpEpisodeTopicList } from "./MlpEpisodeTopicList.mjs";
import { createElement, defineCustomElement, trimStart } from "./util.js";

const TAG_NAME = "mlp-episode-description";

// styles
const INLINE_CSS = `
	:host { margin-top: 0.5rem; }
	::slotted(pre[data-is-topic-list]) { line-height: 36px; }
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<slot>The podcast description</slot>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function createDom() { this.attachShadow({ mode: "open" }).appendChild(TEMPLATE.content.cloneNode(true)); }
function formatTopicList() {
	const sourceTopicList = this.querySelector("*[data-is-topic-list]");

	if (sourceTopicList == null)
		return;
	sourceTopicList.parentNode.replaceChild(createElement(MlpEpisodeTopicList.TAG_NAME, {}, undefined, sourceTopicList.textContent), sourceTopicList);
}

export class MlpEpisodeDescription extends window.HTMLElement {
	constructor() {
		super();
		this.createdCallback();
	}
	attachedCallback() { this.connectedCallback(); }
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected || privates.hasLoaded)
			return;
		formatTopicList.call(this);
		defineCustomElement(MlpEpisodeTopicList);
		privates.hasLoaded = true;
	}
	createdCallback() {
		_privates.set(this, { hasLoaded: false });
		createDom.call(this);
	}
}
MlpEpisodeDescription.TAG_NAME = TAG_NAME;