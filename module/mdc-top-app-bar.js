import { MDCTopAppBar } from "@material/top-app-bar";

if (!("mdc" in window))
	window.mdc = { MDCTopAppBar };
else if (!("MDCTopAppBar" in window.mdc))
	window.mdc.MDCTopAppBar = MDCTopAppBar;