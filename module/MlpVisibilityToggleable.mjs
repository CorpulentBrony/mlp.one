export function mixinMlpVisibilityToggleable(Base) {
	return class MlpVisibilityToggleable extends Base {
		hide() { this.setVisibility(false); }
		isHidden() { return this.hasAttribute("hidden"); }
		isVisible() { return !this.isHidden; }
		setVisibility(visibility) {
			if (!this.setAttribute)
				return;
			visibility = window.Boolean(visibility);
			this.setAttribute("aria-hidden", window.String(!visibility));

			if (visibility)
				this.removeAttribute("hidden");
			else
				this.setAttribute("hidden", "");
		}
		show() { this.setVisibility(true); }
	};
}

export const MlpVisibilityToggleable = mixinMlpVisibilityToggleable(window.Object);