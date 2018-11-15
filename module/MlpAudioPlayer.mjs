import { Cache } from "./Cache.js";
import { createElement } from "./util.js";

// check out MediaSession API: https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API
// also: https://developers.google.com/web/updates/2017/02/media-session

const CACHED_TIME_KEY = "episode-%n-current-time";
const CACHED_VOLUME_KEY = "volume";
const MEDIA_SESSION_SKIP_TIME_SECONDS = 10;

const _privates = new window.WeakMap();
const URL = window.URL || window.webkitURL;
const documentUrl = new URL(window.location.href);

function createDom() {
	createElement("link", { as: "style", importance: "high", href: "/css/audio.css", rel: "preload", type: "text/css" }, window.document.head);
	const privates = _privates.get(this);
	const episodeNumber = window.String(this.episodeNumber);
	const player = new window.DocumentFragment();
	createElement("link", { href: "/css/audio.css", importance: "high", rel: "stylesheet" }, player);
	const container = createElement("div", { id: "container" }, player);
	privates.display = createElement("div", {
		["aria-atomic"]: true,
		["aria-hidden"]: true,
		["aria-label"]: "Current topic display",
		["aria-live"]: "polite",
		id: "display",
		title: "Current topic"
	}, container, "Currently playing display");
	privates.audio = createElement("audio", {
		["aria-controls"]: "display", ["aria-label"]: "Embedded audio player to listen to an audio stream", controls: true, controlslist: "nodownload", id: "audio", preload: "metadata"
	}, container, "It appears your browser doesn't support embedded audio.  No worries, you can download the audio from one of the links on this page.");
	createElement("source", { src: `${episodeNumber}.ogg`, type: "audio/ogg" }, privates.audio);
	createElement("source", { src: `${episodeNumber}.mp3`, type: "audio/mpeg" }, privates.audio);
	createElement("track", { default: true, kind: "chapters", label: "Topic List", src: `${episodeNumber}.vtt`, srclang: "end" }, privates.audio);
	createElement("style", {}, player, `
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
	`);
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
	Cache.remove(privates.cachedTimeKey);
}
function onPlay() {
	const privates = _privates.get(this);

	if ("mediaSession" in window.navigator) {
		window.navigator.mediaSession.metadata = new window.MediaMetadata({
			album: "/mlp/odcast",
			artist: "/mlp/",
			artwork: [
				{ sizes: "192x192", type: "image/webp", src: "https://mlp.one/image/mlpodcast_couch/square-192w.webp" },
				{ sizes: "192x192", type: "image/png", src: "https://mlp.one/image/mlpodcast_couch/square-192w.png" },
				{ sizes: "512x512", type: "image/webp", src: "https://mlp.one/image/mlpodcast_couch/square-512w.webp" },
				{ sizes: "512x512", type: "image/png", src: "https://mlp.one/image/mlpodcast_couch/square-512w.png" }
			],
			title: `#${this.episodeNumber.toString()} - ${this.episodeName}`
		});
		window.navigator.mediaSession.setActionHandler("seekbackward", () => this.currentTime = window.Math.max(privates.audio.currentTime - MEDIA_SESSION_SKIP_TIME_SECONDS, 0));
		window.navigator.mediaSession.setActionHandler("seekforward", () => this.currentTime = window.Math.min(privates.audio.currentTime + MEDIA_SESSION_SKIP_TIME_SECONDS, privates.audio.duration));
	}
	onCueChange.bind(this)();
	privates.display.removeAttribute("aria-hidden");
}
function setupAudio() {
	const cachedVolume = Cache.get(CACHED_VOLUME_KEY);
	const privates = _privates.get(this);
	privates.cachedTimeKey = CACHED_TIME_KEY.replace("%n", window.String(this.episodeNumber));
	const cachedTime = Cache.get(privates.cachedTimeKey);

	if (cachedVolume != null)
		privates.audio.volume = window.Number(cachedVolume);

	if (cachedTime != null)
		this.currentTime = window.Number(cachedTime);
	privates.audio.addEventListener("ended", onEnded.bind(this), false);
	privates.audio.addEventListener("play", onPlay.bind(this), false);
	privates.audio.addEventListener("timeupdate", () => Cache.set(privates.cachedTimeKey, this.currentTime), false);
	privates.audio.addEventListener("volumechange", () => Cache.set(CACHED_VOLUME_KEY, this.volume), false);

	if (documentUrl.searchParams.has("t"))
		this.currentTime = window.Number(documentUrl.searchParams.get("t"));
	window.addEventListener("popstate", (event) => {
		if (event.state && "seconds" in event.state)
			this.currentTime = event.state.seconds;
	}, false);
	privates.audio.textTracks[0].addEventListener("cuechange", onCueChange.bind(this), false);
}

export class MlpAudioPlayer extends window.HTMLElement {
	constructor() {
		super();
		_privates.set(this, {});
		createDom.bind(this)();
		setupAudio.bind(this)();
	}
	get currentTime() { return _privates.get(this).audio.currentTime; }
	get episodeName() { return this.getAttribute("episode-name"); }
	get episodeNumber() { return window.Number(this.getAttribute("episode-number")); }
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