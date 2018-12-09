export class MlpCustomElement extends window.HTMLElement {
	constructor() {
		super();
		this.createdCallback();
	}
	attachedCallback() { this.connectedCallback(); }
	setAttribute(attribute, value) {
		const isAttributeBoolean = typeof value === "boolean";
		const currentValue = isAttributeBoolean ? super.hasAttribute(attribute) : super.getAttribute(attribute);

		if (value == currentValue)
			return;
		else if (isAttributeBoolean)
			if (value)
				super.setAttribute(attribute, "");
			else
				super.removeAttribute(attribute);
		else
			super.setAttribute(attribute, window.String(value));
	}
}