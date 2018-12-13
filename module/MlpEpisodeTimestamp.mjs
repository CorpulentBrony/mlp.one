import { MlpAudioPlayer } from "./MlpAudioPlayer.mjs";

const TAG_NAME = "mlp-episode-timestamp";

// styles
const INLINE_CSS = `
	:host {
		contain: content;
		text-align: right;
	}
	a {
		cursor: pointer;
		text-decoration: underline dotted var(--twi-hair-highlight-purple, purple);
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<a href="#" id="anchor"><time id="time"><slot></slot></time></a>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.anchor = template.getElementById("anchor");
	privates.time = template.getElementById("time");
	this.attachShadow({ mode: "open" }).appendChild(template);
}
function setSeconds(seconds) {
	const privates = _privates.get(this);
	privates.anchor.href = `?t=${seconds}`;
}
function onClick(event) {
	event.preventDefault();
	event.stopPropagation();
	const privates = _privates.get(this);
	privates.audio.currentTime = this.seconds;
	privates.audio.play();
	window.history.pushState({ seconds: this.seconds }, undefined, privates.anchor.href);
	window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
	return false;
}

export class MlpEpisodeTimestamp extends window.HTMLElement {
	static get observedAttributes() { return ["seconds"]; }
	constructor() {
		super();
		this.createdCallback();
	}
	get seconds() { return this.getAttribute("seconds"); }
	set seconds(seconds) { this.setAttribute("seconds", seconds); }
	attachedCallback() { this.connectedCallback(); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue)
			return;
		setSeconds.call(this, newValue);
	}
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected || privates.hasLoaded)
			return;
		setSeconds.call(this, this.seconds);
		privates.anchor.addEventListener("click", onClick.bind(this), false);
		privates.hasLoaded = true;
	}
	createdCallback() {
		_privates.set(this, { anchor: {}, audio: window.document.querySelector(MlpAudioPlayer.TAG_NAME), hasLoaded: false, time: {} });
		createDom.call(this);
	}
}
MlpEpisodeTimestamp.TAG_NAME = TAG_NAME;