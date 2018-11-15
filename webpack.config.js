"use strict";
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const common = {
	devtool: "source-map",
	module: {
		loaders: [{
			test: /\.js$/,
			loader: "babel-loader",
			options: {
				minified: true,
				presets: [[
					"env",
					{
						targets: { browsers: ["last 1 Chrome version"] }
					}
				]],
				sourceMap: true
			}
		}]
	},
	plugins: [
		new UglifyJSPlugin({ sourceMap: true, uglifyOptions: { output: { comments: false } } })
	]
};
module.exports = [
	Object.assign({ entry: "./module/mdc-drawer.js", output: { filename: "js/mdc-drawer.js" } }, common),
	Object.assign({ entry: "./module/mdc-menu.js", output: { filename: "js/mdc-menu.js" } }, common),
	Object.assign({ entry: "./module/mdc-ripple.js", output: { filename: "js/mdc-ripple.js" } }, common),
	Object.assign({ entry: "./module/mdc-snackbar.js", output: { filename: "js/mdc-snackbar.js" } }, common),
	Object.assign({ entry: "./module/mdc-top-app-bar.js", output: { filename: "js/mdc-top-app-bar.js" } }, common),
	Object.assign({ entry: "./module/common.js", output: { filename: "js/common.js" } }, common),
	Object.assign({ entry: "./module/index.js", output: { filename: "js/index.js" } }, common),
	Object.assign({ entry: "./module/output.js", output: { filename: "js/output.js" } }, common)
];