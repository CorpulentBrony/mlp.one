import { createElement, trimStart } from "./util.js";

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
function createDom() {
	const template = TEMPLATE.content.cloneNode(true);
	const shadow = this.attachShadow({ mode: "open" });
	shadow.appendChild(template);
}
function makeTimestampsClickable() {
	function updateTimestamps(node) {
		if (!(node instanceof window.Node))
			return;
		else if (node.nodeType === window.Node.TEXT_NODE) {
			node.data.replace(/(?:^|\s)([0-9]+:[0-5][0-9]|[0-9]+:[0-5][0-9]:[0-5][0-9])(?:\s|$)/, (entireMatchedString, timeString, offset, nodeData) => {
				offset += entireMatchedString.length - trimStart.call(entireMatchedString).length;
				const newTextNode = node.splitText(offset);
				const seconds = window.String(timeString.split(":").reduceRight((seconds, timeValue, index, timeArray) => window.Math.pow(60, timeArray.length - 1 - index) * window.Number(timeValue) + seconds, 0));
				newTextNode.data = newTextNode.data.substr(timeString.length);
				node.parentNode.insertBefore(createElement("mlp-episode-timestamp", { seconds }, undefined, timeString), newTextNode);
				updateTimestamps(newTextNode);
			});
		} else
			window.Array.prototype.forEach.call(node.childNodes, (child) => updateTimestamps(child));
	}

	updateTimestamps(this);
}

export class MlpEpisodeDescription extends window.HTMLElement {
	constructor() {
		super();
		_privates.set(this, { hasLoaded: false });
		createDom.call(this);
	}
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected || privates.hasLoaded)
			return;
		makeTimestampsClickable.call(this);
		privates.hasLoaded = true;
	}
}