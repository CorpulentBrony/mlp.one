<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="atom creativeCommons dcterms itunes media" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://blogs.law.harvard.edu/tech/creativeCommonsRssModule" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:strip-space elements="*" />
	<xsl:output media-type="text/html" method="html" indent="yes" omit-xml-declaration="yes" />
	<xsl:template match="/rss/channel">
		<xsl:variable name="createdDate">2017-11-10T00:00:00+0000</xsl:variable>
		<xsl:variable name="description"><xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="description" /></xsl:call-template></xsl:variable>
		<xsl:variable name="mlpOrganization">{ "@type": "Organization", "@id": "https://4chan.org/mlp/#" }</xsl:variable>
		<xsl:variable name="seriesTag">tag:mlp.one,2018:<xsl:value-of select="title" /></xsl:variable>
		<xsl:variable name="seasonTag"><xsl:value-of select="$seriesTag" />?season=<xsl:value-of select="item[1]/itunes:season" /></xsl:variable>
		<script type="application/ld+json">
			{
				"@context": "http://schema.org",
				"@id": "<xsl:value-of select="$seriesTag" />",
				"@type": "RadioSeries",
				"alternativeHeadline": "<xsl:value-of select="itunes:subtitle" />",
				"author": <xsl:value-of select="$mlpOrganization" />,
				"contentRating": "Explicit",
				"dateCreated": "<xsl:value-of select="$createdDate" />",
				"dateModified": "<xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="lastBuildDate" /></xsl:call-template>",
				"datePublished": "<xsl:value-of select="$createdDate" />",
				"description": "<xsl:value-of select="$description" />",
				"genre": "podcast",
				"headline": "<xsl:value-of select="title" />",
				"image": "<xsl:value-of select="itunes:image/@href" />",
				"inLanguage": "<xsl:value-of select="language" />",
				"isFamilyFriendly": false,
				"mainEntityOfPage": { "@type": "WebPage", "@id": "<xsl:value-of select="link" />" },
				"name": "<xsl:value-of select="title" />",
				"numberOfEpisodes": <xsl:value-of select="count(item)" />,
				"numberOfSeasons": 1,
				"potentialAction": {
					"@type": "SubscribeAction",
					"actionStatus": "PotentialActionStatus",
					"target": "<xsl:value-of select="atom:link[@rel='self']/@href" />"
				},
				"producer": <xsl:value-of select="$mlpOrganization" />,
				"productionCompany": <xsl:value-of select="$mlpOrganization" />,
				"startDate": "<xsl:value-of select="$createdDate" />",
				"thumbnailUrl": "<xsl:value-of select="itunes:image/@href" />",
				"typicalAgeRange": "16-",
				"url": "<xsl:value-of select="link" />"
			}
		</script>
		<script type="application/ld+json">
			{
				"@context": "http://schema.org",
				"@id": "<xsl:value-of select="$seasonTag" />", 
				"@type": "RadioSeason", 
				"name": "<xsl:value-of select="title" /> Season <xsl:value-of select="item[1]/itunes:season" />",
				"numberOfEpisodes": <xsl:value-of select="count(item)" />,
				"partOfSeries": { "@id": "<xsl:value-of select="$seriesTag" />", "@type": "RadioSeries" },
				"seasonNumber": <xsl:value-of select="item[1]/itunes:season" />,
				"startDate": "<xsl:value-of select="$createdDate" />",
				"url": "<xsl:value-of select="link" />/#season-<xsl:value-of select="item[1]/itunes:season" />"
			}
		</script>
		<script type="application/ld+json">
			{
				"@context": "http://schema.org",
				"@type": "ItemList",
				"itemListElement": [<xsl:for-each select="item">
						<xsl:sort select="itunes:episode" data-type="number" order="descending" />
						<xsl:variable name="enclosureUrl">https://<xsl:value-of select="substring-after(enclosure/@url, 'http://')" /></xsl:variable>
						<xsl:variable name="episodeDescription">
							<xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="description" /></xsl:call-template>
						</xsl:variable>
						<xsl:variable name="episodeName"><xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="title" /></xsl:call-template></xsl:variable>
						<xsl:variable name="filePublishedDate"><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="pubDate" /></xsl:call-template></xsl:variable>
						<xsl:variable name="thumbnailUrl">https://img.youtube.com/vi/<xsl:value-of select="substring-after(link, 'watch?v=')" />/maxresdefault.jpg</xsl:variable>
						<xsl:if test="position() != 1">,</xsl:if>
						{
							"@type": "ListItem",
							"position": <xsl:value-of select="position()" />,
							"item": {
								"@type": "RadioEpisode",
								"@id": "<xsl:value-of select="guid" />",
								"episodeNumber": <xsl:value-of select="itunes:episode" />,
								"audio": {
									"@type": "AudioObject",
									"@id": "<xsl:value-of select="$enclosureUrl" />",
									"accessMode": "auditory",
									"accessModeSufficient": "auditory",
									"bitrate": "<xsl:value-of select="(media:group[1]/media:content[@medium='audio'])[1]/@bitrate" />",
									"contentSize": "<xsl:value-of select="enclosure/@length" />",
									"contentUrl": "<xsl:value-of select="$enclosureUrl" />",
									"duration": "PT<xsl:value-of select="(media:group[1]/media:content[@medium='audio'])[1]/@duration" />S", 
									"encodingFormat": "<xsl:value-of select="substring-after(dcterms:alternative, '.')" />",
									"fileFormat": "<xsl:value-of select="enclosure/@type" />",
									"name": "<xsl:value-of select="dcterms:alternative" />",
									"thumbnailUrl": "<xsl:value-of select="$thumbnailUrl" />",
									"uploadDate": "<xsl:value-of select="$filePublishedDate" />",
									"url": "<xsl:value-of select="$enclosureUrl" />"
								},
								"datePublished": "<xsl:value-of select="$filePublishedDate" />",
								"description": "<xsl:value-of select="$episodeDescription" />",
								"discussionUrl": "<xsl:value-of select="comments" />",
								"isAccessibleForFree": true,
								"keywords": "<xsl:value-of select="media:keywords" />",
								"license": "<xsl:value-of select="../creativeCommons:license" />",
								"name": "<xsl:value-of select="$episodeName" />",
								"partOfSeason": { "@id": "<xsl:value-of select="$seasonTag" />", "@type": "RadioSeason" },
								"partOfSeries": { "@id": "<xsl:value-of select="$seriesTag" />", "@type": "RadioSeries" },
								"position": <xsl:value-of select="position()" />,
								"potentialAction": [{
									"@type": "ConsumeAction",
									"actionStatus": "PotentialActionStatus",
									"additionalType": "http://schema.org/ListenAction",
									"expectsAcceptanceOf": {
										"@type": "Offer",
										"availabilityStarts": "<xsl:value-of select="$filePublishedDate" />",
										"category": "free"
									},
									"name": "Listen to <xsl:value-of select="title" />: <xsl:value-of select="$episodeName" />",
									"target": {
										"@type": "EntryPoint",
										"actionPlatform": [
											"http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/AndroidPlatform", "http://schema.org/DesktopWebPlatform", "http://schema.org/IOSPlatform", "http://schema.org/MobileWebPlatform"
										],
										"inLanguage": "<xsl:value-of select="substring(../language, 1, 2)" />",
										"urlTemplate": "<xsl:value-of select="$enclosureUrl" />"
									},
									"url": "<xsl:value-of select="$enclosureUrl" />"
								}, {
									"@type": "WatchAction",
									"actionStatus": "PotentialActionStatus",
									"expectsAcceptanceOf": {
										"@type": "Offer",
										"availabilityStarts": "<xsl:value-of select="$filePublishedDate" />",
										"category": "free"
									},
									"name": "Watch <xsl:value-of select="title" />: <xsl:value-of select="$episodeName" />",
									"target": {
										"@type": "EntryPoint",
										"actionPlatform": [
											"http://schema.googleapis.com/GoogleVideoCast", "http://schema.org/AndroidPlatform", "http://schema.org/DesktopWebPlatform", "http://schema.org/IOSPlatform", "http://schema.org/MobileWebPlatform"
										],
										"inLanguage": "<xsl:value-of select="substring(../language, 1, 2)" />",
										"urlTemplate": "<xsl:value-of select="link" />"
									},
									"url": "<xsl:value-of select="link" />"
								}],
								"thumbnailUrl": "<xsl:value-of select="$thumbnailUrl" />",
								"timeRequired": "PT<xsl:value-of select="(media:group[1]/media:content[@medium='audio'])[1]/@duration" />S",
								"url": "<xsl:value-of select="../link" />/#episode-<xsl:value-of select="itunes:episode" />",
								"video": {
									"@type": "VideoObject",
									"@id": "<xsl:value-of select="link" />",
									"description": "<xsl:value-of select="$episodeDescription" />",
									"embedUrl": "<xsl:value-of select="(media:group[1]/media:content[@medium='video'])[1]/media:player/@url" />",
									"name": "<xsl:value-of select="$episodeName" />",
									"thumbnailUrl": "<xsl:value-of select="$thumbnailUrl" />",
									"uploadDate": "<xsl:value-of select="$filePublishedDate" />",
									"url": "<xsl:value-of select="link" />"
								}
							}
						}</xsl:for-each>
				]
			}
		</script>
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
	<xsl:template name="replace">
		<xsl:param name="haystack" />
		<xsl:param name="needle" />
		<xsl:param name="replacement" />

		<xsl:choose>
			<xsl:when test="((string-length($haystack) &gt; 0) and (string-length($needle) &gt; 0))">
				<xsl:choose>
					<xsl:when test="contains($haystack, $needle)">
						<xsl:value-of select="substring-before($haystack, $needle)" />
						<xsl:value-of select="$replacement" />
						<xsl:call-template name="replace">
							<xsl:with-param name="haystack" select="substring-after($haystack, $needle)" />
							<xsl:with-param name="needle" select="$needle" />
							<xsl:with-param name="replacement" select="$replacement" />
						</xsl:call-template>
					</xsl:when>
					<xsl:otherwise><xsl:value-of select="$haystack" /></xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$haystack" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template name="escape-quotes">
		<xsl:param name="text" />

		<xsl:call-template name="replace">
			<xsl:with-param name="haystack" select="$text" />
			<xsl:with-param name="needle">&quot;</xsl:with-param>
			<xsl:with-param name="replacement">\&quot;</xsl:with-param>
		</xsl:call-template>
	</xsl:template>
</xsl:stylesheet>