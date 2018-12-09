export class Enum {
	static hasKey(enumObj, key) { return enumObj._keySet.has(key); }
	static hasValue(enumObj, value) { return enumObj._valueSet.has(value); }
	constructor(enumDescriptor = {}) {
		const enumDescriptorIsArray = window.Array.isArray(enumDescriptor);
		let i = 0;

		function findNextAvailableValue(keys, values) {
			const startingFromString = i.toString();

			if (keys.includes(startingFromString) || values.includes(i) || values.includes(startingFromString))
				return findNextAvailableValue(keys, values, ++i);
			return ++i;
		}

		const keys = enumDescriptorIsArray ? enumDescriptor : window.Object.keys(enumDescriptor);
		const valuesUnmapped = enumDescriptorIsArray ? window.Array.apply(undefined, { length: keys.length }) : window.Object.values(enumDescriptor);
		const values = valuesUnmapped.map((value, i, values) => (value === undefined) ? findNextAvailableValue(keys, values) - 1 : value);
		const valueStrings = values.map(window.String);
		// const checkValueStringIsDupe = () => valueStrings.reduce((isDupe, valueString, i) => isDupe || keys.slice(0, i).concat(keys.slice(0).splice(i + 1)).includes(valueString), false);
		const descriptor = { _keySet: { value: new window.Set(keys) }, _valueSet: { value: new window.Set(values) }, length: { value: keys.length } };

		// if (valueStrings.length !== (new window.Set(valueStrings)).size || checkValueStringIsDupe())
		// 	throw new window.Error("Enum requires all values and keys be unique even amongst each other unless the key and value are the same.");

		for (let i = 0, v = 0; i < keys.length; i++) {
			descriptor[keys[i]] = { enumerable: true, value: values[i] };

			if (keys[i] !== valueStrings[i] && typeof values[i] !== "object")
				descriptor[valueStrings[i]] = { value: keys[i] };
		}
		window.Object.defineProperties(this, descriptor);
		window.Object.freeze(this);
	}
}
window.Object.defineProperties(Enum.prototype, { _keySet: { configurable: true, value: new window.Set() }, _valueSet: { configurable: true, value: new window.Set() }, length: { configurable: true, value: 0 } });
[Enum.keys, Enum.values] = [window.Object.keys, window.Object.values];