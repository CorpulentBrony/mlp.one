// import "../js/polyfills.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
// import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-spinner";

// styles
const INLINE_CSS = `
	:host {
		--mlp-spinner-color: blue;
		align-items: center;
		contain: content;
		display: flex;
		height: 1rem;
		justify-content: space-evenly;
		width: 5rem;
	}
	div, svg {
		animation: mlp-spinner 1.4s infinite ease-in-out both;
		fill: var(--mlp-spinner-color);
		height: 100%;
	}
	#one { animation-delay: -0.32s; }
	#two { animation-delay: -0.16s; }

	@keyframes mlp-spinner {
		0%, 80%, 100% { transform: scale(0); }
		40% { transform: scale(1); }
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<svg id="one" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50%" cy="50%" r="50%"></circle>
	</svg>
	<svg id="two" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50%" cy="50%" r="50%"></circle>
	</svg>
	<svg id="three" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
		<circle cx="50%" cy="50%" r="50%"></circle>
	</svg>
	<!-- div id="one"></div>
	<div id="two"></div>
	<div id="three"></div -->
`;

// other constants (not configurable)
const _privates = new window.WeakMap();

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	this.attachShadow({ mode: "open" }).appendChild(template);
}

export class MlpSpinner extends MlpCustomElement {
	createdCallback() { createDom.call(this); }
}
MlpSpinner.TAG_NAME = TAG_NAME;