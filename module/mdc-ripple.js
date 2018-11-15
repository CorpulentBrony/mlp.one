import { MDCRipple } from "@material/ripple";

if (!("mdc" in window))
	window.mdc = { MDCRipple };
else if (!("MDCRipple" in window.mdc))
	window.mdc.MDCRipple = MDCRipple;