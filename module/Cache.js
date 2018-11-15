export class Cache {
	static get(key) {
		try { return window.localStorage.getItem(key); } catch (err) { return null; }
		return null;
	}
	static remove(key) {
		try { return window.localStorage.removeItem(key); } catch (err) { return; }
	}
	static set(key, value) {
		try { window.localStorage.setItem(key, value); } catch(err) { return; }
	}
}