// styles
const INLINE_CSS = `a { cursor: pointer; text-decoration: underline dotted var(--twi-hair-highlight-purple, purple); }`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `<style>${INLINE_CSS}</style><a href="#" id="anchor"><time datetime="PT0S" id="time"><slot></slot></time></a>`;

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.anchor = template.getElementById("anchor");
	privates.time = template.getElementById("time");
	const shadow = this.attachShadow({ mode: "open" });
	shadow.appendChild(template);
}
function setSeconds(seconds) {
	const privates = _privates.get(this);
	privates.anchor.href = `?t=${seconds}`;
	privates.time.setAttribute("datetime", `PT${seconds}S`);
}
function onClick(event) {
	event.preventDefault();
	event.stopPropagation();
	const privates = _privates.get(this);
	privates.audio.currentTime = this.seconds;
	privates.audio.play();
	window.history.pushState({ seconds: this.seconds }, undefined, privates.anchor.href);
	return false;
}

export class MlpEpisodeTimestamp extends window.HTMLElement {
	static get observedAttributes() { return ["seconds"]; }
	constructor() {
		super();
		_privates.set(this, { anchor: {}, audio: window.document.querySelector("mlp-audio-player"), hasLoaded: false, time: {} });
		createDom.call(this);
	}
	get seconds() { return this.getAttribute("seconds"); }
	set seconds(seconds) { this.setAttribute("seconds", seconds); }
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
}