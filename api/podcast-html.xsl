<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet exclude-result-prefixes="dcterms itunes media" version="1.0" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- https://www.w3.org/TR/2017/REC-xslt-30-20170608/ -->
	<xsl:output media-type="text/html;charset=UTF-8" method="html" indent="yes" omit-xml-declaration="yes" />
	<xsl:template match="/">
		<ol class="mlp-episode-list mlp-episode-list__featured">
			<xsl:call-template name="create-episodes">
				<xsl:with-param name="begin-at" select="1" />
				<xsl:with-param name="end-at" select="3" />
				<xsl:with-param name="include-background" select="true()" />
			</xsl:call-template>
		</ol>
		<ol class="mlp-episode-list">
			<xsl:call-template name="create-episodes">
				<xsl:with-param name="begin-at" select="4" />
				<xsl:with-param name="end-at" select="count(rss/channel/item)" />
				<xsl:with-param name="include-background" select="false()" />
			</xsl:call-template>
		</ol>
	</xsl:template>
	<xsl:template name="create-episodes">
		<xsl:param name="begin-at" />
		<xsl:param name="end-at" />
		<xsl:param name="include-background" />
		<xsl:variable name="episode-duration" select="(rss/channel/item[$begin-at]/media:group[1]/media:content[@medium='audio'])[1]/@duration" />
		<xsl:variable name="episode-number" select="rss/channel/item[$begin-at]/itunes:episode" />
		<xsl:variable name="episode-pub-date" select="rss/channel/item[$begin-at]/pubDate" />
		<xsl:variable name="episode-title" select="rss/channel/item[$begin-at]/title" />
		<li class="mdc-card mdc-card__primary-action" value="{$episode-number}">
			<a aria-label="{$episode-title} episode page" href="/ep/{$episode-number}" title="{$episode-title}">
				<section>
					<xsl:if test="$include-background = true()">
						<div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(/ep/{$episode-number}.jpg);"></div>
					</xsl:if>
					<header>
						<h6 id="episode-{$episode-number}" name="episode-{$episode-number}">
							#<xsl:value-of select="$episode-number" />:&#xa0;<data value="{$episode-number}"><xsl:value-of select="$episode-title" /></data>
						</h6>
						<time class="mdc-typography--caption">
							<xsl:attribute name="datetime">
								<xsl:call-template name="format-date-iso"><xsl:with-param name="date" select="$episode-pub-date" /></xsl:call-template>
							</xsl:attribute>
							<xsl:call-template name="format-date-human"><xsl:with-param name="date" select="$episode-pub-date" /></xsl:call-template>
						</time>
						<time class="mdc-typography--caption" data-duration-label="🕒" datetime="PT{$episode-duration}S">
							<xsl:call-template name="format-duration"><xsl:with-param name="duration-seconds" select="$episode-duration" /></xsl:call-template>
						</time>
					</header>
				</section>
			</a>
		</li>
		<xsl:if test="$begin-at &lt; $end-at">
			<xsl:call-template name="create-episodes">
				<xsl:with-param name="begin-at" select="$begin-at + 1" />
				<xsl:with-param name="end-at" select="$end-at" />
				<xsl:with-param name="include-background" select="$include-background" />
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
	<xsl:template name="format-duration">
		<xsl:param name="duration-seconds" />
		<xsl:param name="hour-label" select="'hour'" />
		<xsl:param name="minute-label" select="'minute'" />
		<xsl:param name="second-label" select="'second'" />
		<xsl:variable name="duration-minutes" select="floor($duration-seconds div 60)" />
		<xsl:variable name="hours" select="floor($duration-minutes div 60)" />
		<xsl:variable name="minutes" select="$duration-minutes - $hours * 60" />
		<xsl:variable name="seconds" select="$duration-seconds - $duration-minutes * 60" />
		<xsl:if test="$hours &gt; 0"><xsl:value-of select="concat($hours, ':')" /></xsl:if>
		<xsl:variable name="minutes-padding" select="-1 * (string-length(string($minutes)) - 2)" />
		<xsl:value-of select="concat(substring('0', 1, $minutes-padding), $minutes, ':')" />
		<xsl:variable name="seconds-padding" select="-1 * (string-length(string($seconds)) - 2)" />
		<xsl:value-of select="concat(substring('0', 1, $seconds-padding), $seconds)" />

<!-- 		<xsl:variable name="hours-labelled">
			<xsl:call-template name="pluralize">
				<xsl:with-param name="number" select="$hours" />
				<xsl:with-param name="label" select="$hour-label" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="minutes-labelled">
			<xsl:call-template name="pluralize">
				<xsl:with-param name="number" select="$minutes" />
				<xsl:with-param name="label" select="$minute-label" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="seconds-labelled">
			<xsl:call-template name="pluralize">
				<xsl:with-param name="number" select="$seconds" />
				<xsl:with-param name="label" select="$second-label" />
			</xsl:call-template>
		</xsl:variable>
		<xsl:value-of select="$hours-labelled" />
		<xsl:if test="(string-length($hours-labelled) &gt; 0) and (string-length($minutes-labelled) &gt; 0)">, </xsl:if>
		<xsl:value-of select="$minutes-labelled" />
		<xsl:if test="(string-length($hours-labelled) + string-length($minutes-labelled) &gt; 0) and (string-length($seconds-labelled) &gt; 0)">, </xsl:if>
		<xsl:value-of select="$seconds-labelled" /> -->
	</xsl:template>
	<!-- not currently used, but this is the only place this template is and i want to keep it for possible future use -->
<!-- 	<xsl:template name="pluralize">
		<xsl:param name="number" />
		<xsl:param name="label" />
		<xsl:param name="extra-plural-letters" select="'s'" />
		<xsl:choose>
			<xsl:when test="$number = 0"></xsl:when>
			<xsl:when test="$number = 1"><xsl:value-of select="concat($number, ' ', $label)" /></xsl:when>
			<xsl:otherwise><xsl:value-of select="concat($number, ' ', $label, $extra-plural-letters)" /></xsl:otherwise>
		</xsl:choose>
	</xsl:template> -->
	<xsl:template name="format-date-human">
		<!-- input format: Tue, 28 Nov 2017 22:54:35 +0000 -->
		<xsl:param name="date" />
		<xsl:variable name="month-name" select="substring($date, 9, 3)" />
		<xsl:variable name="month">
			<xsl:choose>
				<xsl:when test="$month-name = 'Jan'">January</xsl:when>
				<xsl:when test="$month-name = 'Feb'">February</xsl:when>
				<xsl:when test="$month-name = 'Mar'">March</xsl:when>
				<xsl:when test="$month-name = 'Apr'">April</xsl:when>
				<xsl:when test="$month-name = 'May'">May</xsl:when>
				<xsl:when test="$month-name = 'Jun'">June</xsl:when>
				<xsl:when test="$month-name = 'Jul'">July</xsl:when>
				<xsl:when test="$month-name = 'Aug'">August</xsl:when>
				<xsl:when test="$month-name = 'Sep'">September</xsl:when>
				<xsl:when test="$month-name = 'Oct'">October</xsl:when>
				<xsl:when test="$month-name = 'Nov'">November</xsl:when>
				<xsl:when test="$month-name = 'Dec'">December</xsl:when>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="day" select="substring($date, 6, 2)" />
		<xsl:variable name="year" select="substring($date, 13, 4)" />
		<xsl:value-of select="concat($month, ' ', $day, ', ', $year)" />
	</xsl:template>
	<xsl:template name="format-date-iso">
		<!-- input format: Tue, 28 Nov 2017 22:54:35 +0000 -->
		<xsl:param name="date" />
		<xsl:variable name="year" select="substring($date, 13, 4)" />
		<xsl:variable name="month-name" select="substring($date, 9, 3)" />
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
		<xsl:variable name="day" select="substring($date, 6, 2)" />
		<xsl:value-of select="concat($year, '-', $month, '-', $day)" />
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