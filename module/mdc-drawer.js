import { MDCTemporaryDrawer } from "@material/drawer";

if (!("mdc" in window))
	window.mdc = { MDCTemporaryDrawer };
else if (!("MDCTemporaryDrawer" in window.mdc))
	window.mdc.MDCTemporaryDrawer = MDCTemporaryDrawer;