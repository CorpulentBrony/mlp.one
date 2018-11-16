export class Cache {
	static get(key) {
		try { return window.localStorage.getItem(key); } catch (err) { return null; }
		return null;
	}
	static getAccessor(key) {
		return {
			get() { return Cache.get(key); },
			set(value) { Cache.set(key, value); }
		};
	}
	static remove(key) {
		try { return window.localStorage.removeItem(key); } catch (err) { return; }
	}
	static set(key, value) {
		if (value === undefined)
			this.remove(key);
		else
			try { window.localStorage.setItem(key, value); } catch(err) { return; }
	}
}