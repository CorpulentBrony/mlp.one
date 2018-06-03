<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="dcterms itunes media" version="1.0" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- https://www.w3.org/TR/2017/REC-xslt-30-20170608/ -->
	<xsl:output media-type="text/html;charset=UTF-8" method="html" indent="yes" omit-xml-declaration="yes" />
	<xsl:template match="/">
		<xsl:for-each select="rss/channel/item">
			<xsl:sort select="itunes:episode" data-type="number" order="descending" />
			<xsl:variable name="enclosureUrl">https://<xsl:value-of select="substring-after(enclosure/@url, 'http://')" /></xsl:variable>
			<li value="{itunes:episode}">
				<h6 role="heading"><a href="/ep/{itunes:episode}">Episode&#160;<xsl:value-of select="itunes:episode" /></a>:</h6>
				<details id="episode-{itunes:episode}" name="episode-{itunes:episode}">
					<xsl:if test="position()=1">
						<xsl:attribute name="open"><xsl:text>true</xsl:text></xsl:attribute>
					</xsl:if>
					<summary>
						<h6>
							<data value="{itunes:episode}"><xsl:value-of select="title" /></data>
						</h6>
					</summary>
					<a href="{link}" itemprop="significantLink" rel="external noopener replies" target="_blank" title="Watch this episode on YouTube">
						<img alt="Watch this episode on YouTube" src="/image/youtube.svg" type="image/svg+xml" />
					</a>
					<a download="{dcterms:alternative}" href="/podcast{substring-after($enclosureUrl, 'podcast.mlp.one')}" itemprop="significantLink" rel="enclosure" title="Download this episode" type="audio/mpeg">
						<img alt="Download this episode" src="/image/download.svg" type="image/svg+xml" />
					</a>
					<audio controls="true" itemid="{$enclosureUrl}" itemprop="audio" itemscope="true" itemtype="http://schema.org/AudioObject" src="{$enclosureUrl}" type="audio/mpeg">
						<xsl:choose>
							<xsl:when test="position()=1">
								<xsl:attribute name="preload"><xsl:text>metadata</xsl:text></xsl:attribute>
							</xsl:when>
							<xsl:otherwise>
								<xsl:attribute name="preload"><xsl:text>none</xsl:text></xsl:attribute>
							</xsl:otherwise>
						</xsl:choose>
					</audio>
					<blockquote>
						<xsl:choose>
							<xsl:when test="media:description/@type='html'">
								<xsl:variable name="mediaDescription">
									<xsl:call-template name="replace">
										<xsl:with-param name="haystack" select="media:description" />
										<xsl:with-param name="needle">&lt;a href=</xsl:with-param>
										<xsl:with-param name="replacement">&lt;a rel="noopener" target="_blank" href=</xsl:with-param>
									</xsl:call-template>
								</xsl:variable>
								<xsl:value-of disable-output-escaping="yes" select="$mediaDescription" />
							</xsl:when>
							<xsl:otherwise>
								<xsl:call-template name="insert-breaks"><xsl:with-param name="text" select="media:description" /></xsl:call-template>
							</xsl:otherwise>
						</xsl:choose>
					</blockquote>
				</details>
			</li>
		</xsl:for-each>
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
	<xsl:template name="insert-breaks">
		<xsl:param name="text" />

		<xsl:call-template name="replace">
			<xsl:with-param name="haystack" select="$text" />
			<xsl:with-param name="needle">&#13;</xsl:with-param>
			<xsl:with-param name="replacement"><br /></xsl:with-param>
		</xsl:call-template>
	</xsl:template>
</xsl:stylesheet>