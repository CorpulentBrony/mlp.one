import "../js/polyfills.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
import * as util from "./util.js";

// configurable constants
const TAG_NAME = "mlp-audio-visualizer";

// styles
const INLINE_CSS = `
	:host {
		--mlp-audio-visualizer-background-color: blue;
		contain: content;
	}
	#canvas {
		filter: blur(1px) opacity(60%);
		height: 100%;
		width: 100%;
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<canvas id="canvas" role="presentation"></canvas>
`;

// other constants (not configurable)
const _privates = new window.WeakMap();
const HAS_RESIZE_OBSERVER = "ResizeObserver" in window;

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.canvas = template.getElementById("canvas");
	this.attachShadow({ mode: "open" }).appendChild(template);
}

export class MlpAudioVisualizer extends MlpCustomElement {
	get analyserNode() { return _privates.get(this).analyserNode; }
	get backgroundColor() { return window.String(util.getCssProperty(this, "--mlp-audio-visualizer-background-color")).trim(); }
	get bufferLength() { return _privates.get(this).bufferLength; }
	get isPlaying() { return _privates.get(this).isPlaying; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;
	}
	connect(node) { return node.connect(_privates.get(this).analyserNode); }
	createAnalyser(audioContext, fftSize = 2048) {
		const privates = _privates.get(this);
		privates.analyserNode = audioContext.createAnalyser();
		privates.bufferLength = privates.analyserNode.fftSize = fftSize;
		privates.canvasContext = privates.canvas.getContext("2d");
		privates.dataArray = new window.Float32Array(privates.bufferLength);
		return this;
	}
	createdCallback() {
		_privates.set(this, { analyserNode: {}, bufferLength: 0, canvas: {}, canvasContext: {}, dataArray: [], /*hasLoaded: false,*/ isPlaying: false });
		createDom.call(this);
	}
	pause() {
		_privates.get(this).isPlaying = false;
		this.removeAttribute("playing");
	}
	play() {
		const privates = _privates.get(this);
		let fillStyle = this.backgroundColor;
		privates.isPlaying = true;
		this.setAttribute("playing", true);
		privates.canvasContext.clearRect(0, 0, privates.canvas.width, privates.canvas.height);
		const play = () => {
			privates.analyserNode.getFloatTimeDomainData(privates.dataArray);
			privates.canvasContext.fillStyle = fillStyle ? fillStyle : fillStyle = this.backgroundColor;
			privates.canvasContext.fillRect(0, 0, privates.canvas.width, privates.canvas.height);
			[privates.canvasContext.lineCap, privates.canvasContext.lineWidth] = ["round", 2];
			const gradient = privates.canvasContext.createLinearGradient(0, 0, privates.canvas.width, 0);
			gradient.addColorStop(0, "rgb(247, 186, 223)");
			gradient.addColorStop(0.2, "rgb(249, 201, 117)");
			gradient.addColorStop(0.4, "rgb(253, 255, 186)");
			gradient.addColorStop(0.6, "rgb(251, 255, 254)");
			gradient.addColorStop(0.8, "rgb(201, 218, 253)");
			gradient.addColorStop(1, "rgb(222, 177, 242)");
			privates.canvasContext.strokeStyle = gradient;
			privates.canvasContext.beginPath();
			const sliceWidth = privates.canvas.width / privates.bufferLength;
			let x = 0;

			for (let i = 0; i < privates.bufferLength; i++) {
				if (privates.dataArray[i] === 0)
					privates.canvasContext.strokeStyle = "rgba(0, 0, 0, 0)";
				const y = privates.canvas.height / 2 + privates.dataArray[i] * 200;

				if (i === 0)
					privates.canvasContext.moveTo(x, y);
				else
					privates.canvasContext.lineTo(x, y);
				x += sliceWidth;
			}
			privates.canvasContext.lineTo(privates.canvas.width, privates.canvas.height / 2);
			privates.canvasContext.stroke();

			if (this.isPlaying)
				window.requestAnimationFrame(play);
		};
		play();
	}
}
MlpAudioVisualizer.TAG_NAME = TAG_NAME;