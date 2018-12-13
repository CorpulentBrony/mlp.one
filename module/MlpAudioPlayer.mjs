import "../js/polyfills.js";
import { Cache } from "./Cache.js";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
import { MlpSlider } from "./MlpSlider.mjs";
import { MlpSwitch } from "./MlpSwitch.mjs";
import * as util from "./util.js";

// web audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
// check out MediaSession API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
// also: https://developers.google.com/web/updates/2017/02/media-session
// for custom elements: https://developers.google.com/web/fundamentals/web-components/customelements

// LOOK at this at the bottom for slider tooltip???: https://css-tricks.com/sliding-nightmare-understanding-range-input/
// still need to figure out how to capture escape events when slider stops sliding :/

// configurable constants
const BROADCAST_CHANNEL_NAME = "mlp_audio_player";
const CACHED_TIME_KEY = "episode-%n-current-time";
const CACHED_VOLUME_KEY = "volume";
const MAX_GAIN = 2;
const TAG_NAME = "mlp-audio-player";

// styles
function cssAppearance(value) {
	return `
		-webkit-appearance: ${value};
		-moz-appearance: ${value};
		appearance: ${value};
	`;
}
const CSS_FILES = []; //["/css/audio.css"];
const INLINE_CSS = `
	:host {
		background-color: var(--mdc-theme-on-secondary, #c9aad0);
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
		contain: content;
		display: block;
	}
	*[aria-hidden=true] { visibility: hidden; }
	mlp-slider {
		--mlp-slider-thumb-color: var(--mdc-theme-primary, #263773);
		--mlp-slider-track-left-color: var(--twi-hair-highlight-pink, #ed438a);
		--mlp-slider-track-right-color: var(--twi-hair-highlight-purple, #662d8a);
		flex-basis: auto;
		flex-grow: 1;
		min-width: 5rem;
	}
	mlp-switch {
		--mlp-switch-background-color: var(--twi-hair-highlight-pink, #ed438a);
		/*align-items: center;*/
		${cssAppearance`media-play-button`}
/*		background-color: transparent;
		box-sizing: border-box;
		cursor: pointer;
		display: flex;
		height: 2rem;
		min-width: 2rem;
		justify-content: center;
		text-align: center;*/
	}
	svg[*|visibility=collapse] { display: none; }
	/* container */
	#container { position: relative; }
	/* player */
	#player {
		position: relative;
		z-index: 1;
	}
	/* controls */
	#controls {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
	}
	#controls > * { height: 2rem; }
	/* common time display */
	#controls > span, #current, #duration {
		font-size: 0.75rem;
		line-height: 2rem;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		-o-user-select: none;
		user-select: none;
	}
	/* time display */
	#controls > span { padding: 0 0.25rem; }
	#current { ${cssAppearance`media-current-time-display`} }
	#duration { ${cssAppearance`media-time-remaining-display`} }
	/* display */
	#display {
		cursor: default;
		display: block;
		font-size: large;
		line-height: 2rem;
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		z-index: 100;
	}
	/* sliders */
	#progress { flex-shrink: 1; }
	#volume {
		flex-shrink: 1.9;
		max-width: 6rem;
	}
	/* visualizer */
	#wave {
		filter: blur(1px) opacity(60%);
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		width: 100%;
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<div id="container">
		<canvas id="wave" role="presentation"></canvas>
		<div id="player">
			<output id="display" aria-atomic="true" aria-hidden="true" aria-label="current topic display" aria-live="polite" for="controls" role="status" title="Current Topic">Loading audio...</output>
			<!-- <audio id="audio" aria-controls="display" aria-label="Embedded audio player to listen to the podcast audio stream" controls controlslist="nodownload" preload="metadata"> -->
			<audio id="audio" preload="metadata">
				It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page.
			</audio>
			<div id="controls">
				<mlp-switch id="play" aria-checked="false" aria-label="play" autofocus role="switch" tabindex="0" title="Play">
					<mlp-svg-icon alt="▶" aria-label="play" href="/material-design-icons/av/svg/production/ic_play_arrow_24px.svg" role="img" title="Play" when-checked="false">▶</mlp-svg-icon>
					<mlp-svg-icon hidden alt="⏸" aria-label="pause" href="/material-design-icons/av/svg/production/ic_pause_24px.svg" role="img" title="Pause" when-checked="true">⏸</mlp-svg-icon>
				</mlp-switch>
				<time id="current" aria-atomic="true" aria-label="current time" aria-live="off" title="Current Time">0:00:00</time>
				<span>/</span>
				<time id="duration" aria-label="duration" datetime="PT0S" title="Total Duration">0:00:00</time>
				<mlp-slider id="progress" aria-label="track progress" max="0" min="0" role="slider" step="0.001" title="Track Progress" value="0"></mlp-slider>
				<mlp-switch id="muted" aria-checked="false" aria-label="mute" role="switch" tabindex="0" title="Mute">
					<mlp-svg-icon alt="🔊" aria-label="mute" href="/material-design-icons/av/svg/production/ic_volume_up_24px.svg" role="img" title="Mute" when-checked="false">🔊</mlp-svg-icon>
					<mlp-svg-icon hidden alt="🔇" aria-label="unmute" href="/material-design-icons/av/svg/production/ic_volume_off_24px.svg" role="img" title="Unmute" when-checked="true">🔇</mlp-svg-icon>
				</mlp-switch>
				<mlp-slider id="volume" aria-label="volume" list="list-gain-vals" max="${MAX_GAIN}" min="0" role="slider" step="0.01" title="Volume" value="1"></mlp-slider>
				<datalist id="list-gain-vals">
					<option label="muted" value="0">
					<option label="normal" selected value="1">
					<option label="loudest" value="${MAX_GAIN}">
				</datalist>
			</div>
		</div>
	</div>
`; //

// shadow DOM definitions
const TRACK_ATTRIBUTES = { default: true, kind: "chapters", label: "Topic List" };

// media session constants (used for Android now-playing)
const HAS_MEDIA_SESSION = "mediaSession" in window.navigator;
const MEDIA_SESSION_ATTRIBUTES = {
	album: "/mlp/odcast",
	artist: "/mlp/",
	artwork: [
		{ sizes: "192x192", type: "image/webp", src: "https://mlp.one/image/mlpodcast_couch/square-192w.webp" },
		{ sizes: "192x192", type: "image/png", src: "https://mlp.one/image/mlpodcast_couch/square-192w.png" },
		{ sizes: "512x512", type: "image/webp", src: "https://mlp.one/image/mlpodcast_couch/square-512w.webp" },
		{ sizes: "512x512", type: "image/png", src: "https://mlp.one/image/mlpodcast_couch/square-512w.png" }
	]
};
const MEDIA_SESSION_SKIP_TIME_SECONDS = 10;

// other constants (not configurable)
const _privates = new window.WeakMap();
const documentUrl = new window.URL(window.location.href);
const isBroadcastChannelSupported = "BroadcastChannel" in window;
const DEFAULT_AUDIO_CONTEXT = { context: {}, gain: {}, track: {} };

// private methods
function createDom() {
	util.preload(CSS_FILES, { as: "style", importance: "high", type: "text/css" });
	util.preload(`${this.number}.vtt`, { as: "track", type: "text/vtt" });
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.audio = template.getElementById("audio");
	privates.controls = util.getChildrenAsObject(template.getElementById("controls"));
	privates.display = template.getElementById("display");
	privates.wave = template.getElementById("wave");
	this.attachShadow({ mode: "open" }).appendChild(template);
}
function formatTime(seconds, includeDuration = false) {
	const date = new window.Date(seconds * 1000);
	const time = { hours: date.getUTCHours(), minutes: date.getUTCMinutes(), seconds: date.getUTCSeconds(), milliseconds: date.getUTCMilliseconds() };
	const timeStrings = { hours: time.hours.toString(), minutes: time.minutes.toString(), seconds: time.seconds.toString(), milliseconds: time.milliseconds.toString() };
	const hoursMinutes = `${timeStrings.hours}:${timeStrings.minutes.padStart(2, "0")}`;
	const short = `${hoursMinutes}:${window.Math.round(time.seconds + time.milliseconds / 1000).toString().padStart(2, "0")}`;

	if (!includeDuration)
		return { long: `${hoursMinutes}:${timeStrings.seconds.padStart(2, "0")}.${timeStrings.milliseconds.padStart(3, "0")}`, short };
	let duration = `PT${time.hours > 0 ? `${timeStrings.hours}H` : ""}`;
	duration += `${time.minutes > 0 ? `${timeStrings.minutes}M` : ""}`;
	duration += `${timeStrings.seconds}.${timeStrings.milliseconds}S`;
	return { duration, short };
}
function onBroadcastChannelMessage(event) {
	if (event.data.isPlaying)
		this.pause();
}
function onCueChange() {
	const privates = _privates.get(this);

	if (privates.audio.textTracks[0].activeCues.length > 0)
		privates.display.title = privates.display.textContent = privates.audio.textTracks[0].activeCues[0].text;
}
function onDurationChange() {
	window.requestAnimationFrame(() => {
		const privates = _privates.get(this);
		const formattedDuration = formatTime(this.duration, true);
		privates.controls.duration.textContent = formattedDuration.short;
		privates.controls.duration.setAttribute("datetime", formattedDuration.duration);
		privates.controls.progress.max = this.duration;
	});
}
function onEnded() {
	const privates = _privates.get(this);
	privates.display.setAttribute("aria-hidden", true);
	this.cache.currentTime = undefined;
	this.playing = false;
}
function onPause() {
	if (!this.seeking)
		this.playing = false;
	_privates.get(this).controls.play.checked = false;
	this.paused = true;

	if (HAS_MEDIA_SESSION)
		window.navigator.mediaSession.playbackState = "paused";
}
function onPlay() {
	const privates = _privates.get(this);

	if (HAS_MEDIA_SESSION) {
		window.navigator.mediaSession.metadata = new window.MediaMetadata(window.Object.assign({ title: `#${this.number} - ${this.name}` }, MEDIA_SESSION_ATTRIBUTES));
		window.navigator.mediaSession.playbackState = "playing";
		window.navigator.mediaSession.setActionHandler("pause", this.pause);
		window.navigator.mediaSession.setActionHandler("play", this.play);
		window.navigator.mediaSession.setActionHandler("seekbackward", () => this.currentTime = window.Math.max(privates.audio.currentTime - MEDIA_SESSION_SKIP_TIME_SECONDS, 0));
		window.navigator.mediaSession.setActionHandler("seekforward", () => this.currentTime = window.Math.min(privates.audio.currentTime + MEDIA_SESSION_SKIP_TIME_SECONDS, privates.audio.duration));
	}
	onCueChange.call(this);
	privates.display.removeAttribute("aria-hidden");
	this.paused = this.seeking = false;
	privates.controls.play.checked = this.playing = true;
	sendBroadcast.call(this, { isPlaying: true });
}
function onTimeUpdate() {
	window.requestAnimationFrame(() => {
		updateCurrentTimeDisplay.call(this, formatTime(this.cache.currentTime = this.currentTime));

		if (!this.seeking)
			_privates.get(this).controls.progress.value = this.currentTime;
	});
}
function sendBroadcast(message) {
	if (isBroadcastChannelSupported)
		_privates.get(this).broadcastChannel.postMessage(message);
}
function updateCurrentTimeDisplay(formattedTime) {
	const current = _privates.get(this).controls.current;
	current.textContent = formattedTime.short;
	current.setAttribute("datetime", formattedTime.long);
}

export class MlpAudioPlayer extends MlpCustomElement {
	static get observedAttributes() { return ["muted", "paused", "playing", "volume"]; }
	get currentTime() { return _privates.get(this).audio.currentTime; }
	get duration() { return _privates.get(this).audio.duration; }
	get muted() { return this.hasAttribute("muted"); }
	get name() { return this.getAttribute("name"); }
	get number() { return this.getAttribute("number"); }
	get paused() { return this.hasAttribute("paused"); }
	get playing() { return this.hasAttribute("playing"); }
	get readyState() { return _privates.get(this).audio.readyState; }
	get seeking() { return this.hasAttribute("seeking"); }
	get srcset() { return this.getAttribute("srcset"); }
	get volume() { return this.hasAttribute("volume") ? this.getAttribute("volume") : 1; }
	set currentTime(currentTime) {
		const privates = _privates.get(this);

		if (this.readyState >= window.HTMLMediaElement.HAVE_METADATA) {
			if (privates.audio.currentTime !== currentTime && !this.seeking) {
				privates.audio.currentTime = currentTime;
				window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
			}
		} else {
			const retrySetCurrentTime = () => {
				if (this.currentTime !== currentTime)
					this.currentTime = currentTime;
				privates.audio.removeEventListener("loadedmetadata", retrySetCurrentTime, { once: true, passive: true });
			};
			privates.audio.addEventListener("loadedmetadata", retrySetCurrentTime, { once: true, passive: true });
		}
	}
	set muted(muted) { this.setAttribute("muted", window.Boolean(muted)); }
	set paused(paused) { this.setAttribute("paused", window.Boolean(paused)); }
	set playing(playing) { this.setAttribute("playing", window.Boolean(playing)); }
	set seeking(seeking) { this.setAttribute("seeking", window.Boolean(seeking)); }
	set volume(volume) { super.setAttribute("volume", volume); }
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue == newValue)
			return;
		const privates = _privates.get(this);

		if ((name === "paused" || name === "playing") && privates.hasContext && privates.context.state !== "running")
			privates.context.resume().catch(console.error);

		switch (name) {
			case "muted": privates.controls.volume.value = (privates.audio.muted = privates.controls.muted.checked = newValue != null) ? 0 : this.volume; break;
			case "paused":
				if (newValue != null)
					privates.audio.pause();
				break;
			case "playing":
				if (newValue != null)
					privates.audio.play();
				break;
			case "volume":
				newValue = window.Number(newValue);
				const volume = window.Math.max(0, window.Math.min(MAX_GAIN, newValue));

				if (volume !== newValue)
					this.volume = volume;
				else if (!window.Number.isFinite(volume))
					this.volume = 0;
				else if (volume === 0)
					this.muted = true;
				else
					[privates.gain.value, this.muted] = [privates.controls.volume.value = this.cache.volume = volume, false];
				break;
		}
	}
	// called when object is connected to the DOM
	connectedCallback() {
		const privates = _privates.get(this);

		// check if object was disconnected from DOM before connectedCallback() was called or if it was already loaded previously
		if (!this.isConnected || privates.hasLoaded)
			return;
		// setup broadcast channel so more than one podcast cannot play simultaneously
		else if (isBroadcastChannelSupported) {
			privates.broadcastChannel = new window.BroadcastChannel(BROADCAST_CHANNEL_NAME);
			privates.broadcastChannel.addEventListener("message", onBroadcastChannelMessage.bind(this), { passive: true });
		}
		// set up cache for volume and locations within episodes
		const cache = window.Object.defineProperties({}, { currentTime: Cache.getAccessor(CACHED_TIME_KEY.replace("%n", this.number)), volume: Cache.getAccessor(CACHED_VOLUME_KEY) });
		window.Object.defineProperty(this, "cache", { get() { return cache; } });
		// add event listeners to audio object
		privates.audio.addEventListener("durationchange", onDurationChange.bind(this), { passive: true });
		privates.audio.addEventListener("ended", onEnded.bind(this), { passive: true });
		// privates.audio.addEventListener("offline", onOffline.bind(this), { passive: true });
		privates.audio.addEventListener("pause", onPause.bind(this), { passive: true });
		privates.audio.addEventListener("play", onPlay.bind(this), { passive: true });
		privates.audio.addEventListener("seeked", onTimeUpdate.bind(this), { passive: true });
		privates.audio.addEventListener("timeupdate", onTimeUpdate.bind(this), { passive: true });
		// privates.audio.addEventListener("volumechange", onVolumeChange.bind(this), { passive: true });
		// add event listeners to control objects
		privates.controls.muted.addEventListener("click", () => this.muted = !privates.controls.muted.checked, { passive: true });
		privates.controls.play.addEventListener("click", () => this.playing = !(this.paused = privates.controls.play.checked), { passive: true });
		// load custom buttons and sliders
		util.defineCustomElements([MlpSlider, MlpSwitch]);
		privates.controls.progress.setValueTextTransform((value) => formatTime(value).short);
		const progressOnSeekEnd = () => {
			if (this.seeking) {
				this.seeking = false;

				if (this.playing)
					privates.audio.play();
			}
		};
		privates.controls.progress.addEventListener("seekstart", () => this.paused = this.seeking = true, { passive: true });
		privates.controls.progress.addEventListener("change", () => this.currentTime = privates.controls.progress.value, { passive: true });
		privates.controls.progress.addEventListener("seekend", progressOnSeekEnd, { passive: true });
		privates.controls.volume.addEventListener("change", () => this.volume = privates.controls.volume.value, { passive: true });
		// load sources into audio object
		this.srcset.trim().replace(/\s{2,}/g, "").split(",").forEach((srcset) => {
			const [src, type] = srcset.trim().split(" ");
			util.createElement("source", { src, type }, privates.audio);
		});
		util.createElement("track", window.Object.assign({ src: `${this.number}.vtt` }, TRACK_ATTRIBUTES), privates.audio);
		// add event listeners for text tracks
		privates.audio.textTracks[0].addEventListener("cuechange", onCueChange.bind(this), { passive: true });
		privates.audio.load();

		// check for and handle where page is seeking to particular timestamp in audio
		if (documentUrl.searchParams.has("t"))
			this.currentTime = window.Number(documentUrl.searchParams.get("t"));
		window.addEventListener("popstate", (event) => {
			if (event.state && "seconds" in event.state)
				this.currentTime = event.state.seconds;
		}, { passive: true });
		// load external CSS
		window.requestAnimationFrame(() => CSS_FILES.forEach((href) => util.createElement("link", { href, importance: "high", rel: "stylesheet" }, this.shadowRoot)));
		// set up AudioContext
		if (window.AudioContext) {
			privates.hasContext = true;
			privates.context = new window.AudioContext();
			const analyserNode = privates.context.createAnalyser();
			const gainNode = privates.context.createGain();
			privates.gain = gainNode.gain;
			privates.context.createMediaElementSource(privates.audio).connect(analyserNode).connect(gainNode).connect(privates.context.destination);
			privates.audio.volume = 1;
			// visualizer test
			const bufferLength = analyserNode.fftSize = 2048;
			const canvasContext = privates.wave.getContext("2d");
			const dataArray = new window.Float32Array(bufferLength);
			canvasContext.clearRect(0, 0, privates.wave.width, privates.wave.height);
			const draw = () => {
				window.requestAnimationFrame(draw);
				analyserNode.getFloatTimeDomainData(dataArray);
				canvasContext.fillStyle = window.String(util.getCssProperty(this, "--mdc-theme-on-secondary")).trim();
				canvasContext.fillRect(0, 0, privates.wave.width, privates.wave.height);
				canvasContext.lineCap = "round";
				canvasContext.lineWidth = 2;
				const gradient = canvasContext.createLinearGradient(0, 0, privates.wave.width, 0);
				gradient.addColorStop(0, "rgb(247, 186, 223)"); // applejack
				gradient.addColorStop(0.2, "rgb(249, 201, 117)"); // fluttershy
				gradient.addColorStop(0.4, "rgb(253, 255, 186)"); // rainbow dash
				gradient.addColorStop(0.6, "rgb(251, 255, 254)");
				gradient.addColorStop(0.8, "rgb(201, 218, 253)");
				gradient.addColorStop(1, "rgb(222, 177, 242)");
				canvasContext.strokeStyle = gradient; //computedStyle.getPropertyValue("--mdc-theme-primary").trim();
				// canvasContext.strokeStyle = (themePrimary.length > 0) ? `rgba(${/^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(themePrimary).slice(1).map((hex) => window.Number.parseInt(hex, 16)).join(",")}, 0.2)` : themePrimary;
				canvasContext.beginPath();
				const sliceWidth = privates.wave.width / bufferLength;
				let x = 0;

				for (let i = 0; i < bufferLength; i++) {
					if (dataArray[i] === 0)
						canvasContext.strokeStyle = "rgba(0, 0, 0, 0)";
					const y = privates.wave.height / 2 + dataArray[i] * 200;

					if (i === 0)
						canvasContext.moveTo(x, y);
					else
						canvasContext.lineTo(x, y);
					x += sliceWidth;
				}
				canvasContext.lineTo(privates.wave.width, privates.wave.height / 2);
				canvasContext.stroke();
			};
			draw();
		}

		// set values from cache
		if (this.cache.volume != null)
			this.volume = this.cache.volume;

		if (this.cache.currentTime != null)
			this.currentTime = this.cache.currentTime;
		privates.hasLoaded = true;
	}
	createdCallback() {
		const privates = _privates.set(this, { audio: {}, context: {}, display: {}, gain: {}, hasContext: false, hasLoaded: false }).get(this);
		window.Object.defineProperty(privates.gain, "value", { get: () => this.volume, set(volume) { privates.audio.volume = volume / MAX_GAIN; } });
		createDom.call(this);
	}
	pause() { this.paused = true; }
	play() { this.playing = true; }
}
MlpAudioPlayer.TAG_NAME = TAG_NAME;
MlpAudioPlayer.prototype.cache = { currentTime: 0, volume: 1 };