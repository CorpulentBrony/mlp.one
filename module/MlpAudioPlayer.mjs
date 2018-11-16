import { Cache } from "./Cache.js";
import { Episode } from "./Episode.mjs";
import { createDefinedElement, createElement, preload, URL } from "./util.js";

// check out MediaSession API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
// also: https://developers.google.com/web/updates/2017/02/media-session
// for custom elements: https://developers.google.com/web/fundamentals/web-components/customelements

// constants
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

// shadow DOM definitions
const SHADOW_DOM = {
	CONTAINER: { TAG: "div", ATTRIBUTES: { id: "container" } },
	DISPLAY: { TAG: "div", ATTRIBUTES: { ["aria-atomic"]: true, ["aria-hidden"]: true, ["aria-label"]: "Current topic display", ["aria-live"]: "polite", id: "display", title: "Current topic" }, TEXT: "Currently playing display" },
	AUDIO: {
		TAG: "audio",
		ATTRIBUTES: { ["aria-controls"]: "display", ["aria-label"]: "Embedded audio player to listen to an audio stream", controls: true, controlslist: "nodownload", id: "audio", preload: "metadata" },
		TEXT: "It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page."
	}
};
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

function createDom() {
	preload(CSS_FILES);
	const privates = _privates.get(this);
	const player = new window.DocumentFragment();
	CSS_FILES.forEach((href) => createElement("link", { href, importance: "high", rel: "stylesheet" }, player));
	const container = createDefinedElement(SHADOW_DOM.CONTAINER, player);
	privates.display = createDefinedElement(SHADOW_DOM.DISPLAY, container);
	privates.audio = createDefinedElement(SHADOW_DOM.AUDIO, container);
	Episode.audio.forEach((audio) => createElement("source", { src: audio.url.pathname, type: audio.fileFormat }, privates.audio));
	createElement("track", window.Object.assign({ src: `${window.String(Episode.number)}.vtt` }, TRACK_ATTRIBUTES), privates.audio);
	createElement("style", {}, player, INLINE_CSS);
	const shadow = this.attachShadow({ mode: "open" });
	shadow.appendChild(player);
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
}
function setupAudio() {
	const privates = _privates.get(this);

	if (this.cache.volume != null)
		this.volume = this.cache.volume;

	if (this.cache.currentTime != null)
		this.currentTime = this.cache.currentTime;
	privates.audio.addEventListener("ended", onEnded.bind(this), false);
	privates.audio.addEventListener("play", onPlay.bind(this), false);
	privates.audio.addEventListener("timeupdate", () => this.cache.currentTime = this.currentTime, false);
	privates.audio.addEventListener("volumechange", () => this.cache.volume = this.volume, false);

	if (documentUrl.searchParams.has("t"))
		this.currentTime = window.Number(documentUrl.searchParams.get("t"));
	window.addEventListener("popstate", (event) => {
		if (event.state && "seconds" in event.state)
			this.currentTime = event.state.seconds;
	}, false);
	privates.audio.textTracks[0].addEventListener("cuechange", onCueChange.bind(this), false);
}
function setupCache() {
	const cache = window.Object.defineProperties({}, { currentTime: Cache.getAccessor(CACHED_TIME_KEY.replace("%n", window.String(Episode.number))), volume: Cache.getAccessor(CACHED_VOLUME_KEY) });
	window.Object.defineProperty(this, "cache", { get() { return cache; } });
}

export class MlpAudioPlayer extends window.HTMLElement {
	constructor() {
		super();
		 _privates.set(this, { audio: {}, display: {} });
		createDom.call(this);
		setupCache.call(this);
		setupAudio.call(this);
	}
	get currentTime() { return _privates.get(this).audio.currentTime; }
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
	set volume(volume) { _privates.get(this).audio.volume = volume; }
	play() { return _privates.get(this).audio.play(); }
}
MlpAudioPlayer.prototype.cache = { currentTime: 0, volume: 1 };