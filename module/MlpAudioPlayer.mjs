import { Cache } from "./Cache.js";
import { Episode } from "./Episode.mjs";
import { createElement, preload, URL } from "./util.js";

// check out MediaSession API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
// also: https://developers.google.com/web/updates/2017/02/media-session
// for custom elements: https://developers.google.com/web/fundamentals/web-components/customelements

// constants
const BROADCAST_CHANNEL_NAME = "mlp_audio_player";
const CACHED_TIME_KEY = "episode-%n-current-time";
const CACHED_VOLUME_KEY = "volume";

// styles
const CSS_FILES = ["/css/audio.css"];
const INLINE_CSS = `
	*[aria-hidden=true] { visibility: hidden; }
	#container {
		background-color: #c9aad0; /* --mdc-theme-on-secondary */
		box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
	}
	#display {
		cursor: default;
		font-size: large;
		line-height: 25px;
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		z-index: 100;
	}
`;

// HTML
const TEMPLATE = window.document.createElement("template");
TEMPLATE.innerHTML = `
	<style>${INLINE_CSS}</style>
	<div id="container">
		<div aria-atomic="true" aria-hidden="true" aria-label="Current topic display" aria-live="polite" id="display" title="Current topic">Currently playing display</div>
		<audio aria-controls="display" aria-label="Embedded audio player to listen to the podcast audio stream" controls controlslist="nodownload" id="audio" preload="metadata">
			It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page.
		</audio>
	</div>
`;

// shadow DOM definitions
const TRACK_ATTRIBUTES = { default: true, kind: "chapters", label: "Topic List" };

// media session constants (used for Android now-playing)
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
const documentUrl = new URL(window.location.href);
const isBroadcastChannelSupported = "BroadcastChannel" in window;

// private methods
function createDom() {
	preload(CSS_FILES, { as: "style", importance: "high", type: "text/css" });
	preload([`${window.String(Episode.number)}.vtt`], { as: "track", type: "text/vtt" });
	const privates = _privates.get(this);
	const template = TEMPLATE.content.cloneNode(true);
	privates.audio = template.getElementById("audio");
	privates.display = template.getElementById("display");
	const shadow = this.attachShadow({ mode: "open" });
	shadow.appendChild(template);
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
function onEnded() {
	const privates = _privates.get(this);
	privates.display.setAttribute("aria-hidden", true);
	this.cache.currentTime = undefined;
	this.playing = false;
}
function onPlay() {
	const privates = _privates.get(this);

	if ("mediaSession" in window.navigator) {
		window.navigator.mediaSession.metadata = new window.MediaMetadata(window.Object.assign({ title: `#${Episode.number.toString()} - ${Episode.name}` }, MEDIA_SESSION_ATTRIBUTES));
		window.navigator.mediaSession.setActionHandler("seekbackward", () => this.currentTime = window.Math.max(privates.audio.currentTime - MEDIA_SESSION_SKIP_TIME_SECONDS, 0));
		window.navigator.mediaSession.setActionHandler("seekforward", () => this.currentTime = window.Math.min(privates.audio.currentTime + MEDIA_SESSION_SKIP_TIME_SECONDS, privates.audio.duration));
	}
	onCueChange.call(this);
	privates.display.removeAttribute("aria-hidden");
	this.playing = true;
	sendBroadcast.call(this, { isPlaying: true });
}
function sendBroadcast(message) {
	if (isBroadcastChannelSupported)
		_privates.get(this).broadcastChannel.postMessage(message);
}
function setupAudio() {
	const privates = _privates.get(this);

	if (this.cache.volume != null)
		this.volume = this.cache.volume;

	if (this.cache.currentTime != null)
		this.currentTime = this.cache.currentTime;
	privates.audio.addEventListener("ended", onEnded.bind(this), false);
	// privates.audio.addEventListener("offline", onOffline.bind(this), false);
	privates.audio.addEventListener("pause", () => this.playing = false, false);
	privates.audio.addEventListener("play", onPlay.bind(this), false);
	privates.audio.addEventListener("timeupdate", () => this.cache.currentTime = this.currentTime, false);
	privates.audio.addEventListener("volumechange", () => this.cache.volume = this.volume, false);

	if (documentUrl.searchParams.has("t"))
		this.currentTime = window.Number(documentUrl.searchParams.get("t"));
	window.addEventListener("popstate", (event) => {
		if (event.state && "seconds" in event.state)
			this.currentTime = event.state.seconds;
	}, false);
}
function setupCache() {
	const cache = window.Object.defineProperties({}, { currentTime: Cache.getAccessor(CACHED_TIME_KEY.replace("%n", window.String(Episode.number))), volume: Cache.getAccessor(CACHED_VOLUME_KEY) });
	window.Object.defineProperty(this, "cache", { get() { return cache; } });
}

export class MlpAudioPlayer extends window.HTMLElement {
	constructor() {
		super();
		const privates = _privates.set(this, { audio: {}, display: {}, hasLoaded: false }).get(this);

		if (isBroadcastChannelSupported) {
			privates.broadcastChannel = new window.BroadcastChannel(BROADCAST_CHANNEL_NAME);
			privates.broadcastChannel.addEventListener("message", onBroadcastChannelMessage.bind(this), false);
		}
		createDom.call(this);
		setupCache.call(this);
		setupAudio.call(this);
	}
	get currentTime() { return _privates.get(this).audio.currentTime; }
	get playing() { return this.hasAttribute("playing"); }
	get readyState() { return _privates.get(this).audio.readyState; }
	get volume() { return _privates.get(this).audio.volume; }
	set currentTime(currentTime) {
		if (this.readyState >= window.HTMLMediaElement.HAVE_METADATA) {
			_privates.get(this).audio.currentTime = currentTime;
			window.scrollTo({ behavior: "smooth", left: 0, top: 0 });
		} else {
			const privates = _privates.get(this);
			const retrySetCurrentTime = () => {
				this.currentTime = currentTime;
				privates.audio.removeEventListener("loadedmetadata", retrySetCurrentTime, false);
			};
			privates.audio.addEventListener("loadedmetadata", retrySetCurrentTime, false);
		}
	}
	set playing(playing) {
		if (playing)
			this.setAttribute("playing", window.Boolean(playing));
		else
			this.removeAttribute("playing");
	}
	set volume(volume) { _privates.get(this).audio.volume = volume; }
	connectedCallback() {
		const privates = _privates.get(this);

		if (!this.isConnected || privates.hasLoaded)
			return;
		Episode.audio.forEach((audio) => createElement("source", { src: audio.url.pathname, type: audio.fileFormat }, privates.audio));
		createElement("track", window.Object.assign({ src: `${window.String(Episode.number)}.vtt` }, TRACK_ATTRIBUTES), privates.audio);
		CSS_FILES.forEach((href) => createElement("link", { href, importance: "high", rel: "stylesheet" }, this.shadowRoot));
		privates.audio.textTracks[0].addEventListener("cuechange", onCueChange.bind(this), false);
		privates.hasLoaded = true;
	}
	pause() { _privates.get(this).audio.pause(); }
	play() { return _privates.get(this).audio.play(); }
}
MlpAudioPlayer.prototype.cache = { currentTime: 0, volume: 1 };