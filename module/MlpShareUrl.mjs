import "../js/polyfills.js";

export class MlpShareUrl extends self.URL {
	constructor(url, { hrefName, contentName }) {
		super(url);
		self.Object.defineProperties(this, { contentName: { value: contentName }, hrefName: { value: hrefName } });
	}
	set searchParams({ content, href } = { content: undefined, href: undefined }) {
		this.setSearchParamIfAvailable(this.contentName, content);
		this.setSearchParamIfAvailable(this.hrefName, href);
	}
	setSearchParamIfAvailable(name = undefined, value = undefined) {
		if (name !== undefined && value !== undefined)
			if (self.Array.isArray(name))
				name.forEach((name) => super.searchParams.set(name, value));
			else
				super.searchParams.set(name, value);
	}
}