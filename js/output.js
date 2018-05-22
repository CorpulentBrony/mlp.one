"use strict";
const MLP = (function MLP() {
	class ComponentHandler {
		constructor({ elementId, elementSelector, eventListeners, mdcType }) {
			this.__element = getElement({ elementId, elementSelector }); // window.Element

			if (!this.element)
				return;

			if (mdcType)
				this.__mdcObject = new mdcType(this.element);

			if (eventListeners)
				window.Object.entries(eventListeners).forEach(([eventName, eventCallback]) => this.element.addEventListener(eventName, eventCallback, false));
		}
		get element() { return this.__element; }
		get mdcObject() { return this.__mdcObject; }
	}

	class MenuComponentHandler extends ComponentHandler {
		constructor({ currentElement, elementId, elementSelector, eventListeners, mdcType, topAppBar, triggerElementId, triggerElementSelector }) {
			super({ elementId, elementSelector, eventListeners, mdcType });
			this._triggerElement = getElement({ elementId: triggerElementId, elementSelector: triggerElementSelector }); // window.Element

			if (this._triggerElement)
				this._triggerElement.addEventListener("click", () => this.toggle(), false);
		}
		toggle() { super.mdcObject.open = !super.mdcObject.open; }
	}

	function copyAttributes(fromElement, toElement, attributes = []) {
		attributes.forEach((attribute) => {
			const attributeIsString = typeof attribute === "string";
			const fromElementAttribute = attributeIsString ? fromElement.getAttribute(attribute) : fromElement.getAttribute(attribute[0]);

			if (fromElementAttribute !== null)
				toElement.setAttribute(attributeIsString ? attribute : attribute[1], fromElementAttribute);
		});
	}

	function createElement(name, attributes = {}, parent = undefined, text = undefined) {
		const element = window.document.createElement(name);
		setAttributes(element, attributes);

		if (text !== undefined)
			element.textContent = text;

		if (parent !== undefined)
			parent.appendChild(element);
		return element;
	}

	function getElement({ elementId, elementSelector }) { return elementId ? window.document.getElementById(elementId) : window.document.querySelector(elementSelector); }
	function javaStringHash(string) { return window.Array.prototype.reduce.call(window.String(string), (hash, character) => (hash << 5) - hash + character.charCodeAt(0) | 0, 0); }

	function loadSvg(replacesElement, src = undefined) {
		if (typeof src === "undefined" && replacesElement instanceof window.HTMLImageElement)
			src = replacesElement.currentSrc;
		const [width, height] = (replacesElement instanceof window.SVGElement) ? [replacesElement.width.baseVal.value, replacesElement.height.baseVal.value] : [replacesElement.clientWidth, replacesElement.clientHeight];
		const cacheKey = window.String(javaStringHash(`${src}|${width}|${height}`));
		let svgCached = undefined; // string

		try { svgCached = window.localStorage.getItem(cacheKey); } catch (err) { console.error(err); }

		if (svgCached) {
			const svg = parseSvgText(svgCached)
			replacesElement.parentNode.replaceChild(svg, replacesElement);
			return window.Promise.resolve(svg);
		} else {
			notifyPreload("fetch", src, "image/svg+xml");
			return window.fetch(src).then((response) => response.text()).then((svgText) => {
				const serializer = new window.XMLSerializer();
				const svg = parseSvgText(svgText);
				copyAttributes(replacesElement, svg, ["aria-label", "class", "title"]);
				setAttributes(svg, { height, width });

				for (const attribute in replacesElement.dataset)
					svg.dataset[attribute] = replacesElement.dataset[attribute];
				svg.dataset.svgSrc = src;

				try { window.localStorage.setItem(cacheKey, serializer.serializeToString(svg)); } catch (err) { console.error(err); }
				replacesElement.parentNode.replaceChild(svg, replacesElement);
			}).catch(console.error);
		}
	}

	function notifyPreload(as, href, type) { createElement("link", { as, href, type }, window.document.head); }

	function parseSvgText(svgText) {
		const parser = new window.DOMParser();
		const svg = parser.parseFromString(svgText, "image/svg+xml").documentElement;

		if (svg.tagName != "svg")
			throw new window.Error(`Loaded document is not formatted as an SVG.  Received: ${svgText}`);
		return svg;
	}

	function setAttributes(element, attributes = {}) {
		for (const key in attributes)
			element.setAttribute(key, attributes[key]);
	}

	return {
		AudioPlayer: (function AudioPlayerClosure() {
			const DATE_ZERO = new window.Date(0);
			const MUTE_BUTTON = window.Symbol("muteButton");
			const PLAY_PAUSE_BUTTON = window.Symbol("playPauseButton");
			const TIME_DURATION = window.Symbol("timeDuration");
			const TIME_ELAPSED = window.Symbol("timeElapsed");
			const TRACK_SLIDER = window.Symbol("trackSlider");
			const VOLUME_SLIDER = window.Symbol("volumeSlider");
			const CLASS_TO_COMPONENT = new window.Map([
				[".mlp-audio-player--mute-button", [MUTE_BUTTON, "InteractiveButtonComponent"]], 
				[".mlp-audio-player--play-pause-button", [PLAY_PAUSE_BUTTON, "PlayPauseButton"]],
				[".mlp-audio-player--time-duration", [TIME_DURATION, "Component"]],
				[".mlp-audio-player--time-elapsed", [TIME_ELAPSED, "Component"]],
				[".mlp-audio-player--track-slider", [TRACK_SLIDER, "InteractiveSliderComponent"]],
				[".mlp-audio-player--volume-slider", [VOLUME_SLIDER, "InteractiveSliderComponent"]]
			]);
			const _currentTime = new window.WeakMap(); // window.Date
			const _disabled = new window.WeakMap(); // bool
			const _duration = new window.WeakMap(); // window.Date
			const _element = new window.WeakMap(); // window.Element
			const _loaded = new window.WeakMap(); // bool
			const _muted = new window.WeakMap(); // bool
			const _playing = new window.WeakMap(); // bool
			const _volume = new window.WeakMap(); // double

			class Component extends window.EventTarget {
				constructor(element) {
					super();
					this.element = element;
				}
				get displayValue() { return this.element.textContent; }
				set displayValue(displayValue) { this.element.textContent = window.String(displayValue); }
			}

			class ComponentCollection {
				constructor(audioPlayerElement) {
					_disabled.set(this, true);
					CLASS_TO_COMPONENT.forEach(([propertySymbol, classReference], className) => this[propertySymbol] = new ComponentClasses[classReference](audioPlayerElement.querySelector(className)));
					this.symbols = window.Object.getOwnPropertySymbols(this);
				}
				get isDisabled() { return _disabled.get(this); }
				set isDisabled(isDisabled) {
					_disabled.set(this, window.Boolean(isDisabled));
					this.symbols.forEach((symbol) => {
						if ("isDisabled" in this[symbol])
							this[symbol].isDisabled = this.isDisabled;
					});
				}
			}

			class InteractiveComponent extends Component {
				constructor(element) {
					super(element);
					_disabled.set(this, true);
				}
				get isDisabled() { return _disabled.get(this); }
				set isDisabled(isDisabled) {
					_disabled.set(this, window.Boolean(isDisabled));
					this.element.setAttribute("aria-disabled", this.isDisabled);
				}
			}

			class InteractiveButtonComponent extends InteractiveComponent {
				constructor(element) {
					super(element);
					this.element.addEventListener("click", this.buttonOnClick.bind(this), false);
				}
				get isDisabled() { return super.isDisabled; }
				set isDisabled(isDisabled) {
					super.isDisabled = isDisabled;

					if (super.isDisabled)
						this.element.setAttribute("disabled", true);
					else
						this.element.removeAttribute("disabled");
				}
				buttonOnClick() {
					if (this.dispatchEvent(new window.Event("click")) === true) {
						const child = this.element.firstElementChild;
						const currentStateSrcName = /[^ic\/_][a-z_]+(?=_[0-9]{2}px.svg$)/.exec(child.dataset.svgSrc)[0];
						const otherStateSrcName = child.dataset.otherStateSrcName;
						child.dataset.otherStateSrcName = currentStateSrcName;
						loadSvg(child, child.dataset.svgSrc.replace(currentStateSrcName, otherStateSrcName));
						return true;
					}
					return false;
				}
			}

			class InteractiveSliderComponent extends InteractiveComponent {
				constructor(element) {
					super(element);
					this.mdcSlider = undefined;
					this.element.addEventListener("change", this.sliderOnChange.bind(this), false);
				}
				get isDisabled() { return super.isDisabled; }
				get value() { return this.mdcSlider.value; }
				set isDisabled(isDisabled) {
					super.isDisabled = isDisabled;
					this.mdcSlider.disabled = super.isDisabled;
				}
				set value(value) { this.mdcSlider.value = value; }
				sliderOnChange() { return false; }
			}

			class PlayPauseButton extends InteractiveButtonComponent {
				constructor(element) {
					super(element);
					_playing.set(this, false);
				}
				get isPaused() { return !_playing.get(this); }
				get isPlaying() { return _playing.get(this); }
				set isPlaying(isPlaying) {
					isPlaying = window.Boolean(isPlaying);

					if (this.isPlaying === isPlaying)
						return;
					_playing.set(this, isPlaying);
				}
				set isPaused(isPaused) { this.isPlaying = !window.Boolean(isPaused); }
				buttonOnClick() {
					if (super.buttonOnClick())
						this.isPlaying = !this.isPlaying;
				}
			}

			const ComponentClasses = { Component, InteractiveButtonComponent, InteractiveSliderComponent, PlayPauseButton };

			return class AudioPlayer {
				static formatTime(date) {
					const [hours, minutes, seconds] = [date.getHours() - DATE_ZERO.getHours(), date.getMinutes() - DATE_ZERO.getMinutes(), date.getSeconds() - DATE_ZERO.getSeconds()];
					return (hours > 0) ? `${hours.toString()}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}` : `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
				}
				constructor(element, mdcScriptElement) {
					_currentTime.set(this, new window.Date(0));
					_disabled.set(this, true);
					_duration.set(this, undefined);
					_loaded.set(this, false);
					_muted.set(this, false);
					_playing.set(this, false);
					_volume.set(this, 1);
					this.components = undefined; // ComponentCollection
					this.element = element;
					this.audio = new window.Audio();
					this.audio.setAttribute("preload", "metadata");
					this.audio.setAttribute("type", this.element.dataset.audioType);
					this.audio.addEventListener("canplay", this.audioOnCanPlay.bind(this), false);
					this.audio.addEventListener("durationchange", this.audioOnDurationChange.bind(this), false);
					this.audio.addEventListener("ended", this.audioOnEnded.bind(this), false);
					this.audio.addEventListener("error", this.audioOnError.bind(this), false);
					this.audio.addEventListener("progress", this.audioOnProgress.bind(this), false);
					this.audio.addEventListener("timeupdate", this.audioOnTimeUpdate.bind(this), false);
					this.trackSlider = this.components[TRACK_SLIDER].mdcSlider = new window.mdc.slider.MDCSlider(this.components[TRACK_SLIDER].element);
					this.volumeSlider = this.components[VOLUME_SLIDER].mdcSlider = new window.mdc.slider.MDCSlider(this.components[VOLUME_SLIDER].element);
					this.audio.setAttribute("src", this.element.dataset.audioSrc);
				}
				get currentTime() { return _currentTime.get(this); }
				get duration() { return _duration.get(this); }
				get element() { return _element.get(this); }
				get isDisabled() { return _disabled.get(this); }
				get isLoaded() { return _loaded.get(this); }
				set currentTime(currentTime) {
					_currentTime.set(this, new window.Date(window.Number(currentTime) * 1000));
					this.components[TIME_ELAPSED].displayValue = AudioPlayer.formatTime(this.currentTime);
					this.components[TRACK_SLIDER].value = window.Number(this.currentTime) / 1000;
				}
				set duration(duration) {
					_duration.set(this, new window.Date(window.Number(duration) * 1000));
					this.components[TIME_DURATION].displayValue = AudioPlayer.formatTime(this.duration);
					this.components[TRACK_SLIDER].element.setAttribute("aria-valuemax", duration);
					this.trackSlider.max = window.Number(this.duration) / 1000;
					this.trackSlider.layout();
				}
				set element(element) {
					_element.set(this, element);
					this.components = new ComponentCollection(this.element);
					this.components[PLAY_PAUSE_BUTTON].addEventListener("click", this.playPauseButtonOnClick.bind(this), false);
				}
				set isDisabled(isDisabled) {
					_disabled.set(this, window.Boolean(isDisabled));
					this.components.isDisabled = isDisabled;
				}
				// for audio events, see also https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
				audioOnCanPlay() { // Sent when enough data is available that the media can be played, at least for a couple of frames.
					console.log("audio can play", this);
					_loaded.set(this, true);
					this.isDisabled = false;
				}
				audioOnDurationChange() { // The metadata has loaded or changed, indicating a change in duration of the media. 
					console.log("audio element duration is known!", this);
					this.duration = this.audio.duration;
				}
				audioOnEnded() { // Sent when playback completes.
					console.log("audio ended", this);
				}
				audioOnError() { // Sent when an error occurs.  The element's error attribute contains more information.
					console.log("audio error!", this);
					this.isDisabled = true;
				}
				audioOnProgress(event) { //	Sent periodically to inform interested parties of progress downloading the media. 
					console.log("audio progress", event, this);
				}
				audioOnTimeUpdate() { //The time indicated by the element's currentTime attribute has changed.
					console.log("audio time update", this);
					this.currentTime = this.audio.currentTime;
				}
				playPauseButtonOnClick() {
					if (this.components[PLAY_PAUSE_BUTTON].isPlaying)
						this.audio.pause();
					else
						this.audio.play();
				}
			}
		})(),
		Drawer: class Drawer extends MenuComponentHandler {
			constructor({ currentElement, topAppBar, triggerElementId, triggerElementSelector }) {
				super({
					elementSelector: "aside.mdc-drawer", 
					eventListeners: {
						["MDCTemporaryDrawer:open"]: () => super.mdcObject.drawer.setAttribute("aria-hidden", false),
						["MDCTemporaryDrawer:close"]: () => super.mdcObject.drawer.setAttribute("aria-hidden", true)
					}, 
					mdcType: window.mdc.drawer.MDCTemporaryDrawer,
					triggerElementId,
					triggerElementSelector
				});
				this._currentElement = currentElement; // window.Element
				this._topAppBar = topAppBar; // MLP.TopAppBar
			}
			toggle() {
				super.toggle();

				if (this._currentElement && super.mdcObject.open)
					super.mdcObject.drawer.querySelector(".mdc-drawer__content").scrollTop = this._currentElement.offsetTop - this._topAppBar.clientHeight;
			}
		},
		MoreFormatsMenu: class MoreFormatsMenu extends MenuComponentHandler {
			constructor({ triggerElementId, triggerElementSelector }) {
				super({ elementId: "mlp-menu", eventListeners: { ["MDCMenu:cancel"]: () => super.element.setAttribute("aria-hidden", true) }, mdcType: window.mdc.menu.MDCMenu, triggerElementId, triggerElementSelector });
			}
			close() {
				super.element.setAttribute("aria-hidden", true);
				super.mdcObject.open = false;
			}
			toggle() {
				super.element.setAttribute("aria-hidden", super.mdcObject.open);
				super.toggle();
			}

		},
		TopAppBar: class TopAppBar extends ComponentHandler {
			constructor() { super({ elementSelector: "header.mdc-top-app-bar", mdcType: window.mdc.topAppBar.MDCTopAppBar }); }
			get clientHeight() { return super.mdcObject.root_.clientHeight; }
		},
		loadSvg,
		isDocumentLoaded: new window.Promise((resolve, reject) => {
			if (window.document.readyState === "loading")
				window.document.addEventListener("DOMContentLoaded", resolve, false);
			else
				resolve();
		}),
		isMdcLoaded: new window.Promise(async function(resolve, reject) {
			await MLP.isDocumentLoaded;

			if (typeof window.mdc === "undefined")
				window.document.getElementById("mlp-material-components-web-script").addEventListener("load", resolve, false);
			else
				resolve();
		})
	};
})();
(async function index() {
	const MLPIndex = window.Object.create(window.Object.prototype);
	MLPIndex.audioPlayer = undefined; // MLP.AudioPlayer
	MLPIndex.drawer = undefined; // MLP.Drawer
	MLPIndex.episodeNumber = JSON.parse(document.querySelector("script[type=\"application/ld+json\"]").innerText).episodeNumber;
	MLPIndex.materialComponentsWebScript = undefined; // window.HTMLScriptElement
	MLPIndex.moreFormatsMenu = undefined; // MLP.MoreFormatsMenu
	MLPIndex.rippleButtonClassNames = [".mdc-button", ".mdc-chip", ".mdc-fab", ".mdc-list-item", ".mdc-ripple-surface"]; // removing ".mdc-card__primary-action"
	MLPIndex.ripples = new window.Set();
	MLPIndex.selectedEpisodeListItem = undefined; // window.HTMLLIElement

	function async(funcOrArray) {
		if (window.Array.isArray(funcOrArray))
			return funcOrArray.map((func) => async(func));
		return new window.Promise((resolve, reject) => {
			try { window.setTimeout(() => resolve(funcOrArray.call(undefined))); }
			catch (err) { reject(err); }
		});
	}

	function attachRipple(querySelector) { window.document.querySelectorAll(querySelector).forEach((item) => MLPIndex.ripples.add(new window.mdc.ripple.MDCRipple(item))); }

	function checkWebpSupport() {
		const check = new window.Promise((resolve, reject) => {
			const image = new window.Image();
			image.addEventListener("error", (err) => reject(err), false);
			image.addEventListener("load", () => {
				if (image.width === 1 && image.height === 1)
					resolve();
				else
					reject(new window.Error("Loaded WebP does not have the expected dimensions."));
			}, false);
			image.src = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==";
		});
		check.then(() => window.document.body.classList.add("webp-support")).catch(() => window.document.body.classList.add("webp-no-support"));
	}

	async function documentOnLoad() {
		await MLP.isDocumentLoaded;
		MLPIndex.materialComponentsWebScript = window.document.getElementById("mlp-material-components-web-script");
		checkWebpSupport();
		window.Promise.all(async([
			findSelectedEpisodeListItem,
			() => window.document.querySelectorAll("#mlp-menu li").forEach((item) => item.addEventListener("click", () => MLPIndex.moreFormatsMenu.close(), false))
		])).catch(console.error);
		await MLP.isMdcLoaded;
		materialComponentsWebScriptOnLoad();
		MLPIndex.audioPlayer = new MLP.AudioPlayer(document.querySelector(".mlp-audio-player"), MLPIndex.materialComponentsWebScript);
		window.document.removeEventListener("DOMContentLoaded", documentOnLoad, false)
	}

	function findSelectedEpisodeListItem() {
		MLPIndex.selectedEpisodeListItem = window.document.querySelector(`aside.mdc-drawer ul.mdc-drawer__content.mdc-list li.mdc-list-item[value="${MLPIndex.episodeNumber}"]`);

		if (MLPIndex.selectedEpisodeListItem) {
			MLPIndex.selectedEpisodeListItem.classList.add("mdc-list-item--activated");
			MLPIndex.selectedEpisodeListItem.setAttribute("aria-current", "page");
		}
	}

	// should used IndexedDB instead? https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
	function iconOnLoad({ currentTarget: icon }) {
		if (icon.currentSrc === "https://www.gstatic.com/psa/static/1.gif")
			return;
		MLP.loadSvg(icon);
		icon.removeEventListener("load", iconOnLoad, false);
	}

	function materialComponentsWebScriptOnLoad() {
		window.Promise.all(async([
			() => MLPIndex.drawer = new MLP.Drawer({ currentElement: MLPIndex.selectedEpisodeListItem, topAppBar: new MLP.TopAppBar(), triggerElementSelector: "header.mdc-top-app-bar button.mdc-top-app-bar__navigation-icon" }),
			() => MLPIndex.moreFormatsMenu = new MLP.MoreFormatsMenu({ triggerElementId: "mlp-btn-more-formats" }),
			() => MLPIndex.rippleButtonClassNames.forEach((querySelector) => attachRipple(querySelector)),
			triggerIconLoad,
			() => MLPIndex.materialComponentsWebScript.removeEventListener("load", materialComponentsWebScriptOnLoad, false)
		])).catch(console.error);
	}

	function triggerIconLoad() {
		window.document.querySelectorAll("img[data-is-svg]").forEach((icon) => {
			if (icon.complete)
				async(() => iconOnLoad({ currentTarget: icon })).catch(console.error);
			else
				icon.addEventListener("load", iconOnLoad, false);
		});
	}

	await documentOnLoad();
})().catch(console.error);

// class Cache {
// 	static init(handlerType) {
// 		Cache._cacheHandler = undefined; // Cache
// 		return new Promise();
// 	}
// 	get(key) { return undefined; }
// 	set(key, value) { return undefined; }
// }

// class IndexedDBCache extends Cache {
// 	static init() {
// 		IndexedDBCache._db = undefined; // window.IDBOpenDBRequest
// 		return new window.Promise((resolve, reject) => {
// 			if (!("indexedDB" in window))
// 				reject(new window.Error("IndexedDB not supported."));
// 			const request = window.indexedDB.open("MLP", 0);
// 			request.addEventListener("success", (db) => {
// 				IndexedDBCache._db = db;
// 				resolve(db);
// 			}, false);
// 			request.addEventListener("error", (err) => resolve(err), false);
// 		});
// 	}
// }

// class LocalStorageCache extends Cache {
// 	static init() {
// 		return new window.Promise((resolve, reject) => {
// 			if ("localStorage" in window)
// 				resolve(true);
// 			else
// 				reject(new window.Error("Local Storage not supported."));
// 		});
// 	}
// 	get(key) {
// 		return new window.Promise((resolve, reject) => {
// 			let value = undefined;
// 			try { value = window.localStorage.getItem(key); } catch (err) { reject(err); }
// 			resolve(value);
// 		});
// 	}
// 	set(key, value) {
// 		return new window.Promise((resolve, reject) => {
// 			try { window.localStorage.setItem(key, value); } catch (err) { reject(err); }
// 			resolve();
// 		});
// 	}
// }