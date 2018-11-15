import { MDCMenu } from "@material/menu";

if (!("mdc" in window))
	window.mdc = { MDCMenu };
else if (!("MDCMenu" in window.mdc))
	window.mdc.MDCMenu = MDCMenu;