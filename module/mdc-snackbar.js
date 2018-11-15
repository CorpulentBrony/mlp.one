import { MDCSnackbar } from "@material/snackbar";

if (!("mdc" in window))
	window.mdc = { MDCSnackbar };
else if (!("MDCSnackbar" in window.mdc))
	window.mdc.MDCSnackbar = MDCSnackbar;