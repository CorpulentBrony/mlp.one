<?xml version="1.0" encoding="UTF-8"?>
<!-- this type of sitemap using the identity transform cannot be applied directly using the processor directive -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output media-type="application/xml" method="xml" indent="yes" omit-xml-declaration="no" />
	<xsl:template match="node()|@*">
		<xsl:copy>
			<xsl:apply-templates select="node()|@*" />
		</xsl:copy>
	</xsl:template>
	<xsl:template match="/rss/channel/item/link" />
</xsl:stylesheet>