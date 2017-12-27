"use strict";

// (function() {
// 	function createEpisodeTable() {
// 		const TABLE_ELEMENT = document.getElementById("table-episodes");
// 		const TBODY_ELEMENT = document.getElementById("tbody-episodes");
// 		const XML_FILE = "/api/podcast.php";
// 		const XSL_ELEMENT = document.getElementById("podcast-xsl");

// 		const PARSER = new window.DOMParser();
// 		const processor = new window.XSLTProcessor();

// 		function parseXml(string) { return PARSER.parseFromString(string, "application/xml"); }

// 		const xsl = processor.importStylesheet(parseXml(XSL_ELEMENT.textContent));
// 		const xml = window.fetch(XML_FILE)
// 			.then((response) => response.text())
// 			.then((xml) => {
// 				const fragment = processor.transformToFragment(parseXml(xml), document);
// 				TBODY_ELEMENT.replaceChild(fragment, TBODY_ELEMENT.firstChild);
// 				TABLE_ELEMENT.removeAttribute("aria-hidden");
// 			})
// 			.catch(console.error);
// 		document.removeEventListener("DOMContentLoaded", createEpisodeTable, false);
// 	}

// 	if (document.readyState === "loading")
// 		document.addEventListener("DOMContentLoaded", createEpisodeTable, false);
// 	else
// 		createEpisodeTable();
// })();