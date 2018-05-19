<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="dcterms itunes media" version="1.0" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- https://www.w3.org/TR/2017/REC-xslt-30-20170608/ -->
	<xsl:output media-type="text/html" method="html" indent="yes" omit-xml-declaration="yes" />
	<xsl:template match="/">
		<xsl:for-each select="rss/channel/item">
			<xsl:sort select="itunes:episode" data-type="number" order="ascending" />
			<li class="mdc-list-item" role="menuitem" value="{itunes:episode}">
				<a class="mdc-list-item__text" href="/ep/{itunes:episode}">
					/mlp/odcast #<xsl:value-of select="itunes:episode" />
					<span class="mdc-list-item__secondary-text"><xsl:value-of select="title" /></span>
				</a>
			</li>
		</xsl:for-each>
	</xsl:template>
</xsl:stylesheet>