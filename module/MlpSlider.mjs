import "../js/polyfills.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
import * as util from "./util.js";

// https://material-components.github.io/material-components-web-catalog/#/component/slider
// https://www.webcomponents.org/element/@polymer/paper-slider
// https://developers.google.com/web/updates/2018/03/cssom

// configurable constants
const TAG_NAME = "mlp-slider";
const DEFAULTS = { MAX: 1, MIN: 0, ROLE: "slider", STEP: 0.1, TABINDEX: -1, VALUE: 0 };
const INTERACTION_EVENTS = {
	MOUSE: { BEGIN: "mousedown", MOVE: "mousemove", END: "mouseup", LEAVE: "mouseleave" },
	POINTER: { BEGIN: "pointerdown", MOVE: "pointermove", END: "pointerup", LEAVE: "pointerleave", CANCEL: "pointercancel" },
	TOUCH: { BEGIN: "touchstart", MOVE: "touchmove", END: "touchend", CANCEL: "touchcancel" }
};
const KEYS = { PAGE_UP: "PageUp", PAGE_DOWN: "PageDown", END: "End", HOME: "Home", ARROW_LEFT: "ArrowLeft", ARROW_UP: "ArrowUp", ARROW_RIGHT: "ArrowRight", ARROW_DOWN: "ArrowDown" };
const PAGE_SCROLL_FACTOR = 3;

// styles
// much of this should may to an external SCSS file eventually
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
		height: 2rem;
		position: relative;
		-ms-touch-action: pan-y pinch-zoom;
		touch-action: pan-y pinch-zoom;
		width: 100%;
	}
	:host(:focus) { outline: none; }
	#track-container {
		background-color: var(--mlp-slider-track-right-color);
		border-radius: 2rem / 2rem;
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
		--thumb-stroke: var(--mlp-slider-thumb-color);
		height: var(--thumb-size);
		left: calc(100% * var(--value-percentage) - var(--value-percentage) * var(--thumb-size));
		position: absolute;
		top: 0;
		transform: translateY(40%);
		-ms-touch-action: pan-y pinch-zoom;
		touch-action: pan-y pinch-zoom;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		-o-user-select: none;
		user-select: none;
		width: var(--thumb-size);
	}
	#thumb-container[is-zero] {
		--thumb-color: #ddd;
		--thumb-stroke: rgba(0, 0, 0, 0.5);
	}
	#thumb {
		fill: var(--thumb-color);
		left: 0;
		position: absolute;
		stroke: var(--thumb-stroke);
		stroke-width: 5;
		top: 0;
		transform: scale(0.75);
	}
	#thumb-focus {
		background-color: var(--thumb-color);
		border-color: var(--thumb-stroke);
		border-radius: 50%;
		border-style: solid;
		border-width: 1px;
		box-sizing: border-box;
		height: var(--thumb-size);
		opacity: 0;
		transform: scale(0.8);
		transition: background-color 0.27s ease-out, filter 0.27s ease-out, opacity 0.27s ease-out, transform 0.27s ease-out;
		width: var(--thumb-size);
	}
	#thumb-container:hover #thumb-focus { opacity: 0.1; }
	:host(:focus) #thumb-focus { opacity: 0.1; }
	:host(:focus) #thumb-container:active #thumb-focus {
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.4));
		opacity: 1;
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<div id="track-container">
		<div id="track-left"></div>
	</div>
	<div id="thumb-container" is-zero>
		<svg id="thumb" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50%" cy="50%" r="37.5%"></circle>
		</svg>
		<div id="thumb-focus"></div>
	</div>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();
const HAS_RESIZE_OBSERVER = "ResizeObserver" in window;
const KEYCODE_MAP = window.Array.from(window.Object.values(KEYS));
KEYCODE_MAP.OFFSET = 33;

// private methods
function calculateValuePercentage() { return window.String(this.value / (this.max - this.min)); }
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.thumbContainer = template.getElementById("thumb-container");
	privates.trackContainer = template.getElementById("track-container");
	this.attachShadow({ mode: "open" }).appendChild(template);
}
function onInteractionBegin(event) {
	if (this.disabled)
		return;
	this.dispatchEvent("seekstart");
	// const interactionEvents = Enum.values(INTERACTION_EVENTS);
	const interactionEvents = window.PointerEvent ? [INTERACTION_EVENTS.POINTER] : [INTERACTION_EVENTS.MOUSE, INTERACTION_EVENTS.TOUCH];
	const { max, min, rect, value: startingValue } = this;
	const calculateValueFromInteractionEvent = (event) => {
		const pageX = (event.targetTouches && event.targetTouches.length > 0) ? event.targetTouches[0].pageX : event.pageX;
		const xPos = pageX - rect.left;
		let percentComplete = xPos / rect.width;

		if (this.isRtl)
			percentComplete = 1 - percentComplete;
		return min + percentComplete * (max - min);
	}
	const onInteractionMove = (event) => {
		// event.preventDefault();
		const calculatedValue = calculateValueFromInteractionEvent(event);

		if (calculatedValue !== this.value) {
			this.value = calculatedValue;
			this.dispatchEvent("change");
		}
	};
	const onInteractionEnd = (event) => {
		// event.preventDefault();
		interactionEvents.forEach((interactionEvent) => {
			window.document.body.removeEventListener(interactionEvent.MOVE, onInteractionMove, { passive: true });
			window.document.body.removeEventListener(interactionEvent.END, onInteractionEnd, { once: true, passive: true });

			if (interactionEvent.CANCEL)
				window.document.body.removeEventListener(interactionEvent.CANCEL, onInteractionEnd, { once: true, passive: true });

			if (interactionEvent.LEAVE)
				window.document.body.removeEventListener(interactionEvent.LEAVE, onInteractionEnd, { once: true, passive: true });
		});

		if (startingValue !== this.value)
			this.dispatchEvent("change");
		this.dispatchEvent("seekend");
	};
	interactionEvents.forEach((interactionEvent) => {
		if (interactionEvent.BEGIN === event.type)
			window.document.body.addEventListener(interactionEvent.MOVE, onInteractionMove, { passive: true });
		window.document.body.addEventListener(interactionEvent.END, onInteractionEnd, { once: true, passive: true });

		if (interactionEvent.CANCEL)
			window.document.body.addEventListener(interactionEvent.CANCEL, onInteractionEnd, { once: true, passive: true });

		if (interactionEvent.LEAVE)
			window.document.body.addEventListener(interactionEvent.LEAVE, onInteractionEnd, { once: true, passive: true });
	});
	const calculatedValue = calculateValueFromInteractionEvent(event);

	if (calculatedValue !== this.value) {
		this.value = calculatedValue;
		this.dispatchEvent("change");
	}
}
function onKeydown(event) {
	if (this.disabled)
		return;
	this.dispatchEvent("seekstart");
	const [key, { max, min, step, value }] = [KEYCODE_MAP.includes(event.key) ? event.key : KEYCODE_MAP[event.keyCode - KEYCODE_MAP.OFFSET], this];
	let [delta, newValue] = [(step === window.Number.MIN_VALUE) ? (max - min) / 100 : step, undefined];

	if ((key === KEYS.ARROW_LEFT || key === KEYS.ARROW_RIGHT) && this.isRtl)
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
		default:
			this.dispatchEvent("seekend");
			return;
	}
	event.preventDefault();
	this.value = newValue;

	if (newValue !== value)
		this.dispatchEvent("change");
	this.dispatchEvent("seekend");
}
function onResize() { this.rect = _privates.get(this).trackContainer.getBoundingClientRect(); }

export class MlpSlider extends MlpCustomElement {
	// events: seeking, seeked
	static get observedAttributes() { return ["max", "min", "step", "value"]; }
	get disabled() { return this.hasAttribute("disabled"); }
	get isRtl() { return _privates.get(this).isRtl; }
	get max() { return window.Number(this.getAttribute("max")); }
	get min() { return window.Number(this.getAttribute("min")); }
	get rect() { return _privates.get(this).trackContainer.getBoundingClientRect(); }
	get seeking() { return _privates.get(this).seeking; }
	get step() {
		const step = this.getAttribute("step");
		return (step == "any") ? window.Number.MIN_VALUE : window.Number(step);
	}
	get value() { return window.Number(this.getAttribute("value")); }
	get valuePercentage() { return util.getCssProperty(this, "--value-percentage").value; }
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
	set rect(rect) { _privates.get(this).rect = rect; }
	set step(step) {
		step = window.Math.max(window.Math.min(window.Number(step), this.max - this.min), window.Number.MIN_VALUE);
		this.setAttribute("step", (step === window.Number.MIN_VALUE || window.Number.isNaN(step)) ? "any" : window.String(step));
		this.value = this.value;
	}
	set value(value) {
		const [privates, step] = [_privates.get(this), this.step];
		value = window.Number(value);
		value = window.Math.max(window.Math.min((step > window.Number.MIN_VALUE) ? window.Math.round(value / step) * step : value, this.max), this.min);
		const valueString = value.toString();
		this.setAttribute("aria-valuenow", valueString);
		this.setAttribute("value", valueString);
		this.valuePercentage = calculateValuePercentage.call(this);
		this.valueText = (privates.valueTextTransform !== undefined) ? privates.valueTextTransform.call(undefined, value) : false;

		if (value === 0)
			privates.thumbContainer.setAttribute("is-zero", "");
		else
			privates.thumbContainer.removeAttribute("is-zero");
	}
	set valuePercentage(valuePercentage) { window.requestAnimationFrame(() => util.setCssProperty(this, "--value-percentage", valuePercentage)); }
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
		window.Object.values(INTERACTION_EVENTS).forEach((interactionEvent) => this.addEventListener(interactionEvent.BEGIN, privates.onInteractionBegin, { passive: true }));
		privates.isRtl = util.getCssProperty(this, "direction").value === "rtl";
		privates.resizeObserver.observe(HAS_RESIZE_OBSERVER ? privates.trackContainer : window.document, { attributes: true, childList: true, subtree: true });
		privates.onResize();

		if (privates.hasLoaded)
			return;
		privates.hasLoaded = true;
	}
	createdCallback() {
		_privates.set(this, {
			hasLoaded: false,
			isRtl: false,
			onInteractionBegin: onInteractionBegin.bind(this),
			onKeydown: onKeydown.bind(this),
			onResize: onResize.bind(this),
			resizeObserver: undefined,
			seeking: false,
			thumbContainer: undefined,
			trackContainer: undefined,
			valueTextTransform: undefined
		});
		const privates = _privates.get(this);
		privates.resizeObserver = HAS_RESIZE_OBSERVER ? new window.ResizeObserver(privates.onResize) : new window.MutationObserver(privates.onResize);
		createDom.call(this);
	}
	disconnectedCallback() {
		const privates = _privates.get(this);
		this.removeEventListener("keydown", privates.onKeydown, false);
		window.Object.values(INTERACTION_EVENTS).forEach((interactionEvent) => this.removeEventListener(interactionEvent.BEGIN, privates.onInteractionBegin, { passive: true }));

		if (HAS_RESIZE_OBSERVER)
			privates.resizeObserver.disconnect();
		else
			window.removeEventListener("resize", privates.onResize, false);
	}
	dispatchEvent(eventName) {
		if (eventName == "seekstart")
			_privates.get(this).seeking = true;
		else if (eventName == "seekend")
			_privates.get(this).seeking = false;
		window.requestAnimationFrame(() => super.dispatchEvent(new window.Event(eventName)));
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
	setValueTextTransform(valueTextTransform) {
		_privates.get(this).valueTextTransform = valueTextTransform;
		this.value = this.value;
	}
}
MlpSlider.TAG_NAME = TAG_NAME;