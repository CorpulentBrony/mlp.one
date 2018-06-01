<?xml version="1.0" encoding="UTF-8"?>
<!-- this type of sitemap using the identity transform cannot be applied directly using the processor directive -->
<xsl:stylesheet version="1.0" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:media="http://search.yahoo.com/mrss/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output media-type="application/xml;charset=UTF-8" method="xml" indent="yes" omit-xml-declaration="no" />
	<!-- the below is only used for the media:group elements below which google doesn't like -->
<!-- 	<xsl:template match="*" mode="copy">
		<xsl:element name="{name()}" namespace="{namespace-uri()}">
			<xsl:apply-templates select="@*|node()" mode="copy" />
		</xsl:element>
	</xsl:template>
	<xsl:template match="@*|text()|comment()" mode="copy">
		<xsl:copy/>
	</xsl:template> -->
	<xsl:template match="/rss/channel">
		<xsl:variable name="description"><xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="description" /></xsl:call-template></xsl:variable>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:media="http://search.yahoo.com/mrss/">
			<url>
				<changefreq>weekly</changefreq>
				<image:image>
					<image:caption><xsl:value-of select="$description" /></image:caption>
					<image:loc><xsl:value-of select="image/url" /></image:loc>
					<image:title>/mlp/odcast banner</image:title>
				</image:image>
				<lastmod><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="lastBuildDate" /></xsl:call-template></lastmod>
				<loc><xsl:value-of select="link" /></loc> 
				<priority>1.0</priority>
			</url>
			<xsl:for-each select="item">
				<url>
					<changefreq>weekly</changefreq>
					<image:image>
						<image:caption><xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="description" /></xsl:call-template></image:caption>
						<image:loc><xsl:value-of select="link" />.jpg</image:loc>
						<image:title><xsl:call-template name="escape-quotes"><xsl:with-param name="text" select="title" /></xsl:call-template></image:title>
					</image:image>
					<lastmod><xsl:call-template name="FormatDateTime"><xsl:with-param name="DateTime" select="pubDate" /></xsl:call-template></lastmod>
						<!-- google doesn't like using media:group -->
<!-- 					<media:group>
						<xsl:apply-templates mode="copy" select="../media:category" />
						<media:content channels="{media:group[1]/media:content[@medium='audio']/@channels}" duration="{media:group[1]/media:content[@medium='audio']/@duration}" lang="{media:group[1]/media:content[@medium='audio']/@lang}" medium="{media:group[1]/media:content[@medium='audio']/@medium}" type="audio/ogg" url="{link}.ogg" />
						<xsl:apply-templates mode="copy" select="media:group[1]/media:content[@medium='audio']" />
						<xsl:apply-templates mode="copy" select="media:keywords" />
						<xsl:apply-templates mode="copy" select="../media:rating" />
					</media:group> -->
					<loc><xsl:value-of select="link" /></loc>
					<priority>
						<xsl:choose>
							<xsl:when test="position() &lt; 6"><xsl:value-of select="format-number(1.0 - (position() - 1) div 10, '0.0')" /></xsl:when>
							<xsl:otherwise>0.5</xsl:otherwise>
						</xsl:choose>
					</priority>
				</url>
			</xsl:for-each>
		</urlset>
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
		<xsl:value-of select="concat($year, '-', $month, '-', $day, 'T', $time, 'Z')" />
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