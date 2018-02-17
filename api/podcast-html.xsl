<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="itunes" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<!-- https://www.w3.org/TR/2017/REC-xslt-30-20170608/ -->
	<xsl:output media-type="text/html" method="html" indent="yes" omit-xml-declaration="yes" />
	<xsl:template match="/">
		<xsl:for-each select="rss/channel/item">
			<xsl:sort select="itunes:episode" data-type="number" order="descending" />
			<xsl:variable name="enclosureUrl">https://<xsl:value-of select="substring-after(enclosure/@url, 'http://')" /></xsl:variable>
			<li>
				<xsl:attribute name="value"><xsl:value-of select="itunes:episode" /></xsl:attribute>
				<h3 role="heading">Episode&#160;<xsl:value-of select="itunes:episode" />:</h3>
				<details>
					<xsl:if test="position()=1">
						<xsl:attribute name="open"><xsl:text>true</xsl:text></xsl:attribute>
					</xsl:if>
					<summary>
						<h3>
							<a itemprop="significantLink" rel="external replies" target="_blank" title="Watch this episode on YouTube">
								<xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
								<data>
									<xsl:attribute name="value"><xsl:value-of select="itunes:episode" /></xsl:attribute>
									<xsl:value-of select="substring-after(title, ' - ')" />
								</data>
							</a>
						</h3>
							<a itemprop="significantLink" rel="enclosure" title="Download this episode" type="audio/mpeg">
								<xsl:attribute name="download"><xsl:value-of select="substring-after(enclosure/@url, 'podcast.mlp.one/files/')" /></xsl:attribute>
								<xsl:attribute name="href"><xsl:value-of select="$enclosureUrl" /></xsl:attribute>
								<img alt="Download this episode" src="/image/download.png" type="image/png" />
							</a>
					</summary>
					<audio controls="true" itemprop="audio" type="audio/mpeg">
						<xsl:attribute name="src"><xsl:value-of select="$enclosureUrl" /></xsl:attribute>
						<xsl:choose>
							<xsl:when test="position()=1">
								<xsl:attribute name="preload"><xsl:text>metadata</xsl:text></xsl:attribute>
							</xsl:when>
							<xsl:otherwise>
								<xsl:attribute name="preload"><xsl:text>none</xsl:text></xsl:attribute>
							</xsl:otherwise>
						</xsl:choose>
					</audio>
					<blockquote><xsl:call-template name="InsertBreaks"><xsl:with-param name="text" select="description" /></xsl:call-template></blockquote>
				</details>
			</li>
		</xsl:for-each>
	</xsl:template>
	<xsl:template name="InsertBreaks">
		<xsl:param name="text" />

		<xsl:choose>
			<xsl:when test="string-length($text) &gt; 0">
				<xsl:choose>
					<xsl:when test="contains($text, '&#13;')">
						<xsl:value-of select="substring-before($text, '&#13;')" /><br /><xsl:call-template name="InsertBreaks"><xsl:with-param name="text" select="substring-after($text, '&#13;')" /></xsl:call-template>
					</xsl:when>
					<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$text" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>