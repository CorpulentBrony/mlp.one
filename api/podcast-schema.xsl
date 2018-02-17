<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="atom itunes" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<!-- https://www.w3.org/TR/2017/REC-xslt-30-20170608/ -->
	<xsl:strip-space elements="*" />
	<xsl:output media-type="application/ld+json" method="text" indent="no" omit-xml-declaration="yes" />
	<xsl:template match="/rss/channel">
		<xsl:variable name="createdDate"><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="item[1]/pubDate" /></xsl:call-template></xsl:variable>
		<xsl:variable name="description"><xsl:call-template name="EscapeQuotes"><xsl:with-param name="text" select="description" /></xsl:call-template></xsl:variable>
		<xsl:variable name="publishedDate"><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="pubDate" /></xsl:call-template></xsl:variable>
		{
			"@context": "https://schema.org",
			"@id": "https://mlp.one/#/mlp/odcast",
			"@type": "RadioSeries",
			"alternativeHeadline": "<xsl:value-of select="itunes:subtitle" />",
			"author": { "@type": "Organization", "@id": "https://4chan.org/mlp/#" },
			"contentRating": "Explicit",
			"dateCreated": "<xsl:value-of select="$createdDate" />",
			"dateModified": "<xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="lastBuildDate" /></xsl:call-template>",
			"datePublished": "<xsl:value-of select="$createdDate" />",
			"description": "<xsl:value-of select="$description" />",
			"discussionUrl": "<xsl:value-of select="link" />",
			"genre": "podcast",
			"headline": "<xsl:value-of select="title" />",
			"image": "<xsl:value-of select="itunes:image/@href" />",
			"inLanguage": "<xsl:value-of select="language" />",
			"isFamilyFriendly": false,
			"mainEntityOfPage": { "@type": "WebPage", "@id": "https://mlp.one" },
			"name": "<xsl:value-of select="title" />",
			"numberOfEpisodes": <xsl:value-of select="count(item)" />,
			"numberOfSeasons": 1,
			"potentialAction": {
				"@type": "SubscribeAction",
				"actionStatus": "PotentialActionStatus",
				"target": "<xsl:value-of select="atom:link[@rel='self']/@href" />"
			},
			"productionCompany": { "@type": "Organization", "@id": "https://4chan.org/mlp/#" },
			"sameAs": "<xsl:value-of select="link" />",
			"startDate": "<xsl:value-of select="$createdDate" />",
			"thumbnailUrl": "<xsl:value-of select="itunes:image/@href" />",
			"typicalAgeRange": "16-",
			"url": "<xsl:value-of select="link" />",
			"episode": [<xsl:for-each select="item">
					<xsl:sort select="itunes:episode" data-type="number" order="descending" />
					<xsl:variable name="enclosureUrl">https://<xsl:value-of select="substring-after(enclosure/@url, 'http://')" /></xsl:variable>
					<xsl:variable name="episodeDescription">
						<xsl:call-template name="InsertBreaks">
							<xsl:with-param name="text">
								<xsl:call-template name="EscapeQuotes"><xsl:with-param name="text" select="description" /></xsl:call-template>
							</xsl:with-param>
						</xsl:call-template>
					</xsl:variable>
					<xsl:variable name="fileName" select="substring-after(enclosure/@url, '://podcast.mlp.one/files/')" />
					<xsl:variable name="filePublishedDate"><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="pubDate" /></xsl:call-template></xsl:variable>
					<xsl:if test="position() != 1">,</xsl:if>
					{
						"@type": "RadioEpisode",
						"@id": "https://mlp.one/#/mlp/odcast/episode/<xsl:value-of select="itunes:episode" />",
						"episodeNumber": <xsl:value-of select="itunes:episode" />,
						"audio": {
							"@type": "AudioObject",
							"@id": "<xsl:value-of select="$enclosureUrl" />",
							"accessMode": "auditory",
							"accessModeSufficient": "auditory",
							"author": { "@type": "Organization", "@id": "https://4chan.org/mlp/#" },
							"contentRating": "Explicit",
							"contentSize": "<xsl:value-of select="enclosure/@length" />",
							"contentUrl": "<xsl:value-of select="$enclosureUrl" />",
							"encodingFormat": "<xsl:value-of select="substring-after($fileName, '.')" />",
							"fileFormat": "<xsl:value-of select="enclosure/@type" />",
							"license": "https://creativecommons.org/licenses/by-nc/4.0/",
							"name": "<xsl:value-of select="$fileName" />",
							"uploadDate": "<xsl:value-of select="$filePublishedDate" />"
						},
						"contentRating": "Explicit",
						"datePublished": "<xsl:value-of select="$filePublishedDate" />",
						"description": "<xsl:value-of select="$episodeDescription" />",
						"discussionUrl": "<xsl:value-of select="link" />",
						"genre": "podcast",
						"inLanguage": "en",
						"isAccessibleForFree": true,
						"isFamilyFriendly": false,
						"license": "https://creativecommons.org/licenses/by-nc/4.0/",
						"name": "<xsl:call-template name="EscapeQuotes"><xsl:with-param name="text" select="title" /></xsl:call-template>",
						"partOfSeason": { "@type": "RadioSeason", "seasonNumber": <xsl:value-of select="itunes:season" />, "partOfSeries": { "@type": "RadioSeries", "@id": "https://mlp.one/#/mlp/odcast" } },
						"partOfSeries": { "@type": "RadioSeries", "@id": "https://mlp.one/#/mlp/odcast" },
						"position": <xsl:value-of select="position()" />,
						"potentialAction": {
							"@type": "ConsumeAction",
							"actionStatus": "PotentialActionStatus",
							"additionalType": "https://schema.org/ListenAction",
							"expectsAcceptanceOf": {
								"@type": "Offer",
								"availabilityStarts": "<xsl:value-of select="$filePublishedDate" />",
								"category": "free"
							},
							"target": {
								"@type": "EntryPoint",
								"actionPlatform": [
									"http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/AndroidPlatform", "http://schema.org/DesktopWebPlatform", "http://schema.org/IOSPlatform", "http://schema.org/MobileWebPlatform"
								],
								"inLanguage": "<xsl:value-of select="../language" />",
								"urlTemplate": "<xsl:value-of select="$enclosureUrl" />"
							}
						},
						"producer": { "@type": "Organization", "@id": "https://4chan.org/mlp/#" },
						"thumbnailUrl": "<xsl:value-of select="../itunes:image/@href" />",
						"url": "<xsl:value-of select="link" />"
					}</xsl:for-each>
				]
		}
	</xsl:template>
	<xsl:template name="FormatDateTime">
		<!-- input format: Tue, 28 Nov 2017 22:54:35 +0000 -->
		<xsl:param name="DateTime" />
		<xsl:variable name="date-step-1"><xsl:value-of select="substring-after(normalize-space($DateTime), ' ')" /></xsl:variable>
		<xsl:variable name="day-unformatted"><xsl:value-of select="normalize-space(substring($date-step-1, 1, 2))" /></xsl:variable>
		<xsl:variable name="day">
			<xsl:choose>
				<xsl:when test="(string-length($day-unformatted) &lt; 2)"><xsl:value-of select="concat('0', $day-unformatted)" /></xsl:when>
				<xsl:otherwise><xsl:value-of select="$day-unformatted" /></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="date-step-2"><xsl:value-of select="substring-after($date-step-1, ' ')" /></xsl:variable>
		<xsl:variable name="month-name"><xsl:value-of select="substring($date-step-2, 1, 3)" /></xsl:variable>
		<xsl:variable name="month">
			<xsl:choose>
				<xsl:when test="$month-name = 'Jan'">01</xsl:when>
				<xsl:when test="$month-name = 'Feb'">02</xsl:when>
				<xsl:when test="$month-name = 'Mar'">03</xsl:when>
				<xsl:when test="$month-name = 'Apr'">04</xsl:when>
				<xsl:when test="$month-name = 'May'">05</xsl:when>
				<xsl:when test="$month-name = 'Jun'">06</xsl:when>
				<xsl:when test="$month-name = 'Jul'">07</xsl:when>
				<xsl:when test="$month-name = 'Aug'">08</xsl:when>
				<xsl:when test="$month-name = 'Sep'">09</xsl:when>
				<xsl:when test="$month-name = 'Oct'">10</xsl:when>
				<xsl:when test="$month-name = 'Nov'">11</xsl:when>
				<xsl:when test="$month-name = 'Dec'">12</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="date-step-3"><xsl:value-of select="substring-after($date-step-2, ' ')" /></xsl:variable>
		<xsl:variable name="year"><xsl:value-of select="substring($date-step-3, 1, 4)" /></xsl:variable>
		<xsl:variable name="date-step-4"><xsl:value-of select="substring-after($date-step-3, ' ')" /></xsl:variable>
		<xsl:variable name="time"><xsl:value-of select="substring($date-step-4, 1, 8)" /></xsl:variable>
		<xsl:variable name="offset"><xsl:value-of select="substring-after($date-step-4, ' ')" /></xsl:variable>
		<xsl:value-of select="concat($year, '-', $month, '-', $day, 'T', $time, $offset)" />
	</xsl:template>
	<xsl:template name="EscapeQuotes">
		<xsl:param name="text" />

		<xsl:choose>
			<xsl:when test="string-length($text) &gt; 0">
				<xsl:choose>
					<xsl:when test="contains($text, '&quot;')">
						<xsl:value-of select="substring-before($text, '&quot;')" />\&quot;<xsl:call-template name="EscapeQuotes"><xsl:with-param name="text" select="substring-after($text, '&quot;')" /></xsl:call-template>
					</xsl:when>
					<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="InsertBreaks">
		<xsl:param name="text" />

		<xsl:choose>
			<xsl:when test="string-length($text) &gt; 0">
				<xsl:choose>
					<xsl:when test="contains($text, '&#13;')">
						<xsl:value-of select="substring-before($text, '&#13;')" />\n<xsl:call-template name="InsertBreaks"><xsl:with-param name="text" select="substring-after($text, '&#13;')" /></xsl:call-template>
					</xsl:when>
					<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>