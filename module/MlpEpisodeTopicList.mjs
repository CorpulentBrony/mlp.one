import { MlpEpisodeTimestamp } from "./MlpEpisodeTimestamp.mjs";
import { defineCustomElement } from "./util.js";

const TAG_NAME = "mlp-episode-topic-list";

// styles
const INLINE_CSS = `
	:host {
		contain: content;
		display: block;
		margin-left: 1rem;
	}
	*[aria-hidden=true] { display: none; }
	dd {
		grid-column-start: 2;
		margin-left: 0;
	}
	dl {
		-webkit-column-gap: 2rem;
		-moz-column-gap: 2rem;
		grid-column-gap: 2rem;
		column-gap: 2rem;
		display: grid;
		grid-template-columns: max-content auto;
	}
	dt { grid-column-start: 1; }
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<slot aria-hidden="true" role="presentation"></slot>
	<dl aria-label="Episode topic list" role="navigation"></dl>
	<template>
		<dt><${MlpEpisodeTimestamp.TAG_NAME} seconds="0"></${MlpEpisodeTimestamp.TAG_NAME}></dt>
		<dd></dd>
	</template>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.dl = template.querySelector("dl");
	privates.template = template.querySelector("template");
	this.attachShadow({ mode: "open" }).appendChild(template);
}
function formatTopicList() {
	const privates = _privates.get(this);
	const lines = this.textContent.split("\n");
	privates.length = lines.length;

	if (privates.length > 0)
		lines.forEach((line) => {
			const timestamp = line.slice(0, line.indexOf(" "));
			const topic = line.slice(timestamp.length + 1);
			const template = privates.template.content.cloneNode(true);
			const mlpEpisodeTimestamp = template.querySelector(MlpEpisodeTimestamp.TAG_NAME);
			const dd = template.querySelector("dd");
			mlpEpisodeTimestamp.textContent = timestamp;
			mlpEpisodeTimestamp.setAttribute("seconds", window.String(timestamp.split(":").reduceRight((seconds, timeValue, index, timeArray) => window.Math.pow(60, timeArray.length - 1 - index) * window.Number(timeValue) + seconds, 0)));
			dd.textContent = topic;
			privates.dl.appendChild(template);
		});
}

export class MlpEpisodeTopicList extends window.HTMLElement {
	constructor() {
		super();
		this.createdCallback();
	}
	get length() { return _privates.get(this).length; }
	attachedCallback() { this.connectedCallback(); }
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected || privates.hasLoaded)
			return;
		formatTopicList.call(this);
		defineCustomElement(MlpEpisodeTimestamp);
		privates.hasLoaded = true;
	}
	createdCallback() {
		_privates.set(this, { hasLoaded: false, length: 0, template: {} });
		createDom.call(this);
	}
}
MlpEpisodeTopicList.TAG_NAME = TAG_NAME;