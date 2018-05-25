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
	Object.assign({ entry: "./js/mdc.js", output: { filename: "js/mdc-bundle.js" } }, common),
	Object.assign({ entry: "./module/output.js", output: { filename: "js/output.js" } }, common)
];