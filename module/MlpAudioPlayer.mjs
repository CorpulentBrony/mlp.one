import "../js/polyfills.js";
import { Cache } from "./Cache.js";
import { MlpAudioVisualizer } from "./MlpAudioVisualizer.mjs";
import { MlpCustomElement } from "./MlpCustomElement.mjs";
import { MlpSlider } from "./MlpSlider.mjs";
import { MlpSpinner } from "./MlpSpinner.mjs";
import { MlpSwitch } from "./MlpSwitch.mjs";
import { mixinMlpVisibilityToggleable } from "./MlpVisibilityToggleable.mjs";
import * as util from "./util.js";

// web audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
// check out MediaSession API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
// also: https://developers.google.com/web/updates/2017/02/media-session
// for custom elements: https://developers.google.com/web/fundamentals/web-components/customelements

// LOOK at this at the bottom for slider tooltip???: https://css-tricks.com/sliding-nightmare-understanding-range-input/

// configurable constants
const BROADCAST_CHANNEL_NAME = "mlp_audio_player";
const CACHED_TIME_KEY = "episode-%n-current-time";
const CACHED_VOLUME_KEY = "volume";
const MAX_GAIN = 2;
const TAG_NAME = "mlp-audio-player";

// CSS
const CSS_FILES = ["/css/MlpAudioPlayer.css"];
util.preload(CSS_FILES, { as: "style", importance: "high", type: "text/css" });

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<div id="container">
		<mlp-audio-visualizer id="visualizer" role="presentation"></mlp-audio-visualizer>
		<div id="player">
			<output id="display" aria-atomic="true" aria-hidden="true" aria-label="current topic display" aria-live="polite" for="controls" role="status" title="Current Topic">Loading audio...</output>
			<audio id="audio" preload="metadata">
				It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page.
			</audio>
			<div id="controls">
				<mlp-switch id="play" aria-checked="false" aria-label="play" aria-pressed="false" autofocus role="switch" tabindex="0" title="Play">
					<mlp-svg-icon alt="▶" aria-label="play" href="/material-design-icons/av/svg/production/ic_play_arrow_24px.svg" role="img" title="Play" mlp-switch-when-checked="false">▶</mlp-svg-icon>
					<mlp-svg-icon hidden alt="⏸" aria-label="pause" href="/material-design-icons/av/svg/production/ic_pause_24px.svg" role="img" title="Pause" mlp-switch-when-checked="true">⏸</mlp-svg-icon>
				</mlp-switch>
				<time id="current" aria-atomic="true" aria-label="current time" aria-live="off" title="Current Time">0:00:00</time>
				<span>/</span>
				<time id="duration" aria-label="duration" datetime="PT0S" title="Total Duration">0:00:00</time>
				<mlp-slider id="progress" aria-label="track progress" max="0" min="0" role="slider" step="0.001" tabindex="0" title="Track Progress" value="0"></mlp-slider>
				<mlp-switch id="muted" aria-checked="false" aria-label="mute" aria-pressed="false" role="switch" tabindex="0" title="Mute">
					<mlp-svg-icon alt="🔊" aria-label="mute" href="/material-design-icons/av/svg/production/ic_volume_up_24px.svg" role="img" title="Mute" mlp-switch-when-checked="false">🔊</mlp-svg-icon>
					<mlp-svg-icon hidden alt="🔇" aria-label="unmute" href="/material-design-icons/av/svg/production/ic_volume_off_24px.svg" role="img" title="Unmute" mlp-switch-when-checked="true">🔇</mlp-svg-icon>
				</mlp-switch>
				<mlp-slider id="volume" aria-label="volume" list="list-gain-vals" max="${MAX_GAIN}" min="0" role="slider" step="0.01" tabindex="0" title="Volume" value="1"></mlp-slider>
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
const VISIBILITY_CHANGE_EVENT_NAME = (typeof window.document.webkitHidden !== "undefined") ? "webkitvisibilitychange" : (typeof window.document.mozHidden !== "undefined") ? "mozvisibilitychange" : "visibilitychange";

// private methods
function createDom() {
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.audio = template.getElementById("audio");
	privates.controls = util.getChildrenAsObject(template.getElementById("controls"));
	privates.display = template.getElementById("display");
	window.Object.setPrototypeOf(privates.display, mixinMlpVisibilityToggleable(privates.display.constructor).prototype);
	privates.visualizer = template.getElementById("visualizer");
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
	privates.display.hide();
	this.cache.currentTime = undefined;
	this.playing = false;
}
function onPause() {
	if (!this.seeking)
		this.playing = false;
	const privates = _privates.get(this);
	privates.controls.play.checked = false;
	this.paused = true;
	privates.visualizer.pause();

	if (HAS_MEDIA_SESSION)
		window.navigator.mediaSession.playbackState = "paused";
}
function onPlay() {
	const privates = _privates.get(this);

	if (HAS_MEDIA_SESSION) {
		window.navigator.mediaSession.metadata = new window.MediaMetadata(window.Object.assign({ title: `#${this.number} - ${this.name}` }, MEDIA_SESSION_ATTRIBUTES));
		window.navigator.mediaSession.playbackState = "playing";
		window.navigator.mediaSession.setActionHandler("pause", () => this.pause());
		window.navigator.mediaSession.setActionHandler("play", () => this.play());
		window.navigator.mediaSession.setActionHandler("seekbackward", () => this.currentTime = window.Math.max(privates.audio.currentTime - MEDIA_SESSION_SKIP_TIME_SECONDS, 0));
		window.navigator.mediaSession.setActionHandler("seekforward", () => this.currentTime = window.Math.min(privates.audio.currentTime + MEDIA_SESSION_SKIP_TIME_SECONDS, privates.audio.duration));
	}
	onCueChange.call(this);
	privates.display.show();
	privates.visualizer.play();
	this.paused = this.seeking = false;
	privates.controls.play.checked = this.playing = true;
	sendBroadcast.call(this, { isPlaying: true });
}
function onPopState(event) {
	if (event.state && "seconds" in event.state) {
		this.currentTime = event.state.seconds;
		window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
	}
}
function onTimeUpdate() {
	window.requestAnimationFrame(() => {
		updateCurrentTimeDisplay.call(this, formatTime(this.cache.currentTime = this.currentTime));

		if (!this.seeking)
			_privates.get(this).controls.progress.value = this.currentTime;
	});
}
function onVisibilityChange() {
	if (this.playing)
		if (window.document.hidden)
			_privates.get(this).visualizer.pause();
		else
			_privates.get(this).visualizer.play();
}
function progressOnSeekEnd() {
	if (this.seeking) {
		this.seeking = false;

		if (this.playing)
			_privates.get(this).audio.play();
	}
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
			if (privates.audio.currentTime !== currentTime && !this.seeking)
				privates.audio.currentTime = currentTime;
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
	connectedCallback() {
		if (!this.isConnected)
			return;
		const privates = _privates.get(this);

		// setup broadcast channel so more than one podcast cannot play simultaneously
		if (isBroadcastChannelSupported) {
			privates.broadcastChannel = new window.BroadcastChannel(BROADCAST_CHANNEL_NAME);
			privates.broadcastChannel.addEventListener("message", privates.onBroadcastChannelMessage, { passive: true });
		}
		// add event listeners to audio object
		privates.audio.addEventListener("durationchange", privates.onDurationChange, { passive: true });
		privates.audio.addEventListener("ended", privates.onEnded, { passive: true });
		// privates.audio.addEventListener("offline", onOffline.bind(this), { passive: true });
		privates.audio.addEventListener("pause", privates.onPause, { passive: true });
		privates.audio.addEventListener("play", privates.onPlay, { passive: true });
		// privates.audio.addEventListener("seeked", onTimeUpdate.bind(this), { passive: true });
		privates.audio.addEventListener("timeupdate", privates.onTimeUpdate, { passive: true });
		// privates.audio.addEventListener("volumechange", onVolumeChange.bind(this), { passive: true });
		// add event listeners to control objects
		privates.controls.muted.addEventListener("click", privates.mutedOnClick, { passive: true });
		privates.controls.play.addEventListener("click", privates.playOnClick, { passive: true });
		privates.controls.progress.addEventListener("seekstart", privates.progressOnSeekStart, { passive: true });
		privates.controls.progress.addEventListener("change", privates.progressOnChange, { passive: true });
		privates.controls.progress.addEventListener("seekend", privates.progressOnSeekEnd, { passive: true });
		privates.controls.volume.addEventListener("change", privates.volumeOnChange, { passive: true });
		window.addEventListener("popstate", privates.onPopState, { passive: true });
		window.document.addEventListener(VISIBILITY_CHANGE_EVENT_NAME, privates.onVisibilityChange, { passive: true });
		this.addEventListener("elementconnected", () => {
			privates.audio.textTracks[0].addEventListener("cuechange", privates.onCueChange, { passive: true });

			if (documentUrl.searchParams.has("t"))
				this.currentTime = window.Number(documentUrl.searchParams.get("t"));
		}, { once: true, passive: true });

		if (privates.hasLoaded)
			return super.connectedCallback();
		util.defineCustomElements([MlpSlider, MlpSpinner, MlpSwitch]);
		privates.controls.progress.setValueTextTransform((value) => formatTime(value).short);
		// load sources into audio object
		this.srcset.trim().replace(/\s{2,}/g, "").split(",").forEach((srcset) => {
			const [src, type] = srcset.trim().split(" ");
			util.createElement("source", { src, type }, privates.audio);
		});
		util.createElement("track", window.Object.assign({ src: `${this.number}.vtt` }, TRACK_ATTRIBUTES), privates.audio);
		privates.audio.load();
		// load external CSS
		window.requestAnimationFrame(() => CSS_FILES.forEach((href) => util.createElement("link", { href, importance: "high", rel: "stylesheet" }, this.shadowRoot)));
		// set up AudioContext
		if (window.AudioContext) {
			util.defineCustomElement(MlpAudioVisualizer);
			[privates.audio.volume, privates.context, privates.hasContext] = [1, new window.AudioContext({ latencyHint: "playback" }), true];
			const gainNode = privates.context.createGain();
			privates.gain = gainNode.gain;
			privates.visualizer.createAnalyser(privates.context).connect(privates.context.createMediaElementSource(privates.audio)).connect(gainNode).connect(privates.context.destination);
		}

		// set values from cache
		if (this.cache.volume != null)
			this.volume = this.cache.volume;

		if (this.cache.currentTime != null)
			this.currentTime = this.cache.currentTime;
		privates.hasLoaded = true;
		super.connectedCallback();
	}
	createdCallback() {
		const privates = _privates.set(this, {
			audio: {},
			broadcastChannel: {},
			context: {},
			display: {},
			gain: {},
			hasContext: false,
			hasLoaded: false,
			mutedOnClick: () => this.muted = !privates.controls.muted.checked,
			onBroadcastChannelMessage: onBroadcastChannelMessage.bind(this),
			onCueChange: onCueChange.bind(this),
			onDurationChange: onDurationChange.bind(this),
			onEnded: onEnded.bind(this),
			onPause: onPause.bind(this),
			onPlay: onPlay.bind(this),
			onPopState: onPopState.bind(this),
			onTimeUpdate: onTimeUpdate.bind(this),
			onVisibilityChange: onVisibilityChange.bind(this),
			playOnClick: () => this.playing = !(this.paused = privates.controls.play.checked),
			progressOnChange: () => this.currentTime = privates.controls.progress.value,
			progressOnSeekEnd: progressOnSeekEnd.bind(this),
			progressOnSeekStart: () => this.paused = this.seeking = true,
			volumeOnChange: () => this.volume = privates.controls.volume.value
		}).get(this);
		window.Object.defineProperty(privates.gain, "value", { get: () => this.volume, set(volume) { privates.audio.volume = volume / MAX_GAIN; } });
		// set up cache for volume and locations within episodes
		const cache = window.Object.defineProperties({}, { currentTime: Cache.getAccessor(CACHED_TIME_KEY.replace("%n", this.number)), volume: Cache.getAccessor(CACHED_VOLUME_KEY) });
		window.Object.defineProperty(this, "cache", { get() { return cache; } });
		createDom.call(this);
	}
	disconnectedCallback() {
		const privates = _privates.get(this);
		this.pause();

		if (isBroadcastChannelSupported) {
			privates.broadcastChannel = {};
			privates.broadcastChannel.removeEventListener("message", privates.onBroadcastChannelMessage, { passive: true });
		}
		privates.audio.removeEventListener("durationchange", privates.onDurationChange, { passive: true });
		privates.audio.removeEventListener("ended", privates.onEnded, { passive: true });
		privates.audio.removeEventListener("pause", privates.onPause, { passive: true });
		privates.audio.removeEventListener("play", privates.onPlay, { passive: true });
		privates.audio.removeEventListener("timeupdate", privates.onTimeUpdate, { passive: true });
		privates.controls.muted.removeEventListener("click", privates.mutedOnClick, { passive: true });
		privates.controls.play.removeEventListener("click", privates.playOnClick, { passive: true });
		privates.controls.progress.removeEventListener("seekstart", privates.progressOnSeekStart, { passive: true });
		privates.controls.progress.removeEventListener("change", privates.progressOnChange, { passive: true });
		privates.controls.progress.removeEventListener("seekend", privates.progressOnSeekEnd, { passive: true });
		privates.controls.volume.removeEventListener("change", privates.volumeOnChange, { passive: true });
		privates.audio.textTracks[0].removeEventListener("cuechange", privates.onCueChange, { passive: true });
		window.removeEventListener("popstate", privates.onPopState, { passive: true });
		window.document.removeEventListener(VISIBILITY_CHANGE_EVENT_NAME, privates.onVisibilityChange, { passive: true });
	}
	pause() { this.paused = true; }
	play() { this.playing = true; }
}
MlpAudioPlayer.TAG_NAME = TAG_NAME;
MlpAudioPlayer.prototype.cache = { currentTime: 0, volume: 1 };