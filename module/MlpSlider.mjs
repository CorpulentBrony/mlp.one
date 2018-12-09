import "../js/polyfills.js";
import { Enum } from "./Enum.mjs";
import { MlpCustomElement } from "./MlpCustomElement.mjs";

// https://material-components.github.io/material-components-web-catalog/#/component/slider

// configurable constants
const TAG_NAME = "mlp-slider";
const DEFAULTS = { MAX: 1, MIN: 0, ROLE: "slider", STEP: 0.1, TABINDEX: -1, VALUE: 0 };
const INTERACTION_EVENTS = new Enum({
	MOUSE: new Enum({ BEGIN: "mousedown", MOVE: "mousemove", END: "mouseup" }),
	POINTER: new Enum({ BEGIN: "pointerdown", MOVE: "pointermove", END: "pointerup" }),
	TOUCH: new Enum({ BEGIN: "touchstart", MOVE: "touchmove", END: "touchend" })
});
// const INTERACTION_EVENTS = { mouse: ["down", "move", "up"], pointer: ["down", "move", "up"], touch: ["start", "move", "end"] };
const KEYS = new Enum({ PAGE_UP: "PageUp", PAGE_DOWN: "PageDown", END: "End", HOME: "Home", ARROW_LEFT: "ArrowLeft", ARROW_UP: "ArrowUp", ARROW_RIGHT: "ArrowRight", ARROW_DOWN: "ArrowDown" });
const PAGE_SCROLL_FACTOR = 3;

// styles
const INLINE_CSS = `
	:host {
		--mlp-slider-thumb-color: green;
		--mlp-slider-track-left-color: blue;
		--mlp-slider-track-right-color: rgba(0, 0, 0, 0.5);
		--thumb-size: 1.3125rem;
		--value-percentage: 0;
		contain: content;
		cursor: pointer;
		display: block;
		height: 3rem;
		position: relative;
		-ms-touch-action: pan-x;
		touch-action: pan-x;
		width: 100%;
	}
	:host(:focus) { outline: none; }
	#track-container {
		background-color: var(--mlp-slider-track-right-color);
		height: 0.25rem;
		left: calc(var(--thumb-size) / 2);
		overflow: hidden;
		position: absolute;
		top: 50%;
		width: calc(100% - var(--thumb-size));
	}
	#track-left {
		background-color: var(--mlp-slider-track-left-color);
		height: 100%;
		left: 0;
		position: absolute;
		width: calc(100% * var(--value-percentage));
	}
	#thumb-container {
		--thumb-color: var(--mlp-slider-thumb-color);
		height: var(--thumb-size);
		left: calc(100% * var(--value-percentage) - var(--value-percentage) * var(--thumb-size));
		position: absolute;
		top: 0;
		transform: translateY(75%);
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		width: var(--thumb-size);
		will-change: left;
	}
	#thumb {
		fill: var(--thumb-color);
		left: 0;
		position: absolute;
		stroke: var(--thumb-color);
		stroke-width: 3.5;
		top: 0;
		transform: scale(0.75);
		will-change: transform;
	}
	#thumb-focus {
		background-color: var(--thumb-color);
		border-radius: 50%;
		height: var(--thumb-size);
		opacity: 0;
		width: var(--thumb-size);
	}
	:host(:focus) #thumb-focus { opacity: 0.25; }
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<div id="track-container">
		<div id="track-left"></div>
	</div>
	<div id="thumb-container">
		<svg id="thumb" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50%" cy="50%" r="37.5%"></circle>
		</svg>
		<div id="thumb-focus"></div>
	</div>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();
const KEYCODE_MAP = window.Array.from(Enum.values(KEYS));
KEYCODE_MAP.OFFSET = 33;

// private methods
function calculateValuePercentage() { return (this.value / (this.max - this.min)).toString(); }
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	this.attachShadow({ mode: "open" }).appendChild(template);
}
function onInteractionBegin(event) {
	if (this.disabled)
		return;
	const interactionEvents = Enum.values(INTERACTION_EVENTS);
	const calculateValueFromInteractionEvent = (event) => {
		const [boundingRect, {max, min}, pageX] = [this.getBoundingClientRect(), this, (event.targetTouches && event.targetTouches.length > 0) ? event.targetTouches[0].pageX : event.pageX];
		const xPos = pageX - boundingRect.left;
		let percentComplete = xPos / boundingRect.width;

		if (window.getComputedStyle(this).direction === "rtl")
			percentComplete = 1 - percentComplete;
		return min + percentComplete * (max - min);
	}
	const onInteractionMove = (event) => {
		event.preventDefault();
		this.value = calculateValueFromInteractionEvent(event);
	};
	const onInteractionEnd = () => {
		interactionEvents.forEach((interactionEvent) => {
			window.document.body.removeEventListener(interactionEvent.MOVE, onInteractionMove, false);
			window.document.body.removeEventListener(interactionEvent.END, onInteractionEnd, false);
		});
	};
	interactionEvents.forEach((interactionEvent) => {
		if (interactionEvent.BEGIN === event.type)
			window.document.body.addEventListener(interactionEvent.MOVE, onInteractionMove, false);
		window.document.body.addEventListener(interactionEvent.END, onInteractionEnd, false);
	});
	this.value = calculateValueFromInteractionEvent(event);
}
function onKeydown(event) {
	if (this.disabled)
		return;
	const [key, { max, min, step, value }] = [KEYCODE_MAP.includes(event.key) ? event.key : KEYCODE_MAP[event.keyCode - KEYCODE_MAP.OFFSET], this];
	let [delta, newValue] = [(step === window.Number.MIN_VALUE) ? (max - min) / 100 : step, undefined];

	if ((key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT) && window.getComputedStyle(this).direction === "rtl")
		delta = -delta;

	switch (key) {
		case KEYS.ARROW_DOWN:
		case KEYS.ARROW_LEFT: newValue = value - delta; break;
		case KEYS.ARROW_RIGHT:
		case KEYS.ARROW_UP: newValue = value + delta; break;
		case KEYS.HOME: newValue = min; break;
		case KEYS.END: newValue = max; break;
		case KEYS.PAGE_UP: newValue = value + delta * PAGE_SCROLL_FACTOR; break;
		case KEYS.PAGE_DOWN: newValue = value - delta * PAGE_SCROLL_FACTOR; break;
		default: return;
	}
	event.preventDefault();
	this.value = newValue;
}

export class MlpSlider extends MlpCustomElement {
	// events: seeking, seeked
	// called when object is connected to the DOM

	// *** for events, check @material/slider/foundation.js and look for handlekeydown and handledown, pay attention to init() and the DOWN_EVENTS/UP_EVENTS constants
	static get observedAttributes() { return ["max", "min", "step", "value"]; }
	get disabled() { return this.hasAttribute("disabled"); }
	get max() { return window.Number(this.getAttribute("max")); }
	get min() { return window.Number(this.getAttribute("min")); }
	get step() {
		const step = this.getAttribute("step");
		return (step == "any") ? window.Number.MIN_VALUE : window.Number(step);
	}
	get value() { return window.Number(this.getAttribute("value")); }
	get valuePercentage() { return window.getComputedStyle(this).getPropertyValue("--value-percentage"); }
	get valueText() { return super.getAttribute("aria-valuetext"); }
	set disabled(disabled) {
		this.setAttribute("disabled", window.Boolean(disabled));
		this.setAttribute("aria-disabled", window.Boolean(disabled));
	}
	set max(max) {
		const maxString = window.Math.max(window.Number(max), this.min).toString();
		this.setAttribute("aria-valuemax", maxString);
		this.setAttribute("max", maxString);
		this.valuePercentage = calculateValuePercentage.call(this);
	}
	set min(min) {
		const minString = window.Math.min(window.Number(min), this.max).toString();
		this.setAttribute("aria-valuemin", minString);
		this.setAttribute("min", minString);
		this.valuePercentage = calculateValuePercentage.call(this);
	}
	set step(step) {
		step = window.Math.max(window.Math.min(window.Number(step), this.max - this.min), window.Number.MIN_VALUE);
		this.setAttribute("step", (step === window.Number.MIN_VALUE) ? "any" : window.String(step));
		this.value = this.value;
	}
	set value(value) {
		const [step, valueTextTransform] = [this.step, _privates.get(this).valueTextTransform];
		value = window.Number(value);
		value = window.Math.max(window.Math.min((step > window.Number.MIN_VALUE) ? window.Math.round(value / step) * step : value, this.max), this.min);
		const valueString = value.toString();
		this.setAttribute("aria-valuenow", valueString);
		this.setAttribute("value", valueString);
		this.valuePercentage = calculateValuePercentage.call(this);
		this.valueText = (valueTextTransform !== undefined) ? valueTextTransform.call(undefined, value) : false;
	}
	set valuePercentage(valuePercentage) { window.requestAnimationFrame(() => this.style.setProperty("--value-percentage", window.String(valuePercentage))); }
	set valueText(valueText) { this.setAttribute("aria-valuetext", valueText); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;
		this[name] = newValue;
	}
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected)
			return;

		for (const attribute in DEFAULTS)
			this.setAttribute(attribute.toLowerCase(), DEFAULTS[attribute], true);
		this.addEventListener("keydown", privates.onKeydown, false);
		Enum.values(INTERACTION_EVENTS).forEach((interactionEvent) => this.addEventListener(interactionEvent.BEGIN, privates.onInteractionBegin, false));

		if (privates.hasLoaded)
			return;
		privates.hasLoaded = true;
	}
	createdCallback() {
		_privates.set(this, { hasLoaded: false, onInteractionBegin: onInteractionBegin.bind(this), onKeydown: onKeydown.bind(this), valueTextTransform: undefined });
		createDom.call(this);
	}
	disconnectedCallback() {
		const privates = _privates.get(this);
		this.removeEventListener("keydown", privates.onKeydown, false);
	}
	getAttribute(attribute) {
		const result = super.getAttribute(attribute);

		if (result != null)
			return result;
		attribute = attribute.toUpperCase();
		return (attribute in DEFAULTS) ? DEFAULTS[attribute] : result;
	}
	setAttribute(attribute, value, ifNotSet = false) {
		if (ifNotSet && super.hasAttribute(attribute))
			return;
		super.setAttribute(attribute, value);
	}
	setValueTextTransform(valueTextTransform) { _privates.get(this).valueTextTransform = valueTextTransform; }
}
MlpSlider.TAG_NAME = TAG_NAME;