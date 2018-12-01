import { URL } from "./util.js";

/* this may be deprecated now and no longer needed */

function cache(name, value) {
	delete Episode[name];
	return window.Object.defineProperty(Episode, name, { value })[name];
}

export class Episode {
	static get audio() { return this.schema.audio; }
	static get duration() { return this.schema.timeRequired; }
	static get image() { return this.schema.thumbnailUrl; }
	static get name() { return this.schema.name; }
	static get number() { return cache("number", window.Number(this.schema.episodeNumber)); }
	static get schema() {
		const schema = window.JSON.parse(window.document.getElementById("mlp-episode-schema").textContent);
		schema.audio.forEach((audio) => audio.url = new URL(audio.url));
		schema.url = new URL(schema.url);
		schema.video.url = new URL(schema.video.url);
		return cache("schema", schema);
	}
	static get url() { return this.schema.url; }
	static get video() { return this.schema.video; }
}