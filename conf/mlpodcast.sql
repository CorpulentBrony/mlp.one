-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 27, 2017 at 04:01 AM
-- Server version: 5.7.15-9
-- PHP Version: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `mlpodcast`
--
CREATE DATABASE IF NOT EXISTS `mlpodcast` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `mlpodcast`;

-- --------------------------------------------------------

--
-- Table structure for table `Activities`
--

DROP TABLE IF EXISTS `Activities`;
CREATE TABLE IF NOT EXISTS `Activities` (
  `ActivityId` int(11) NOT NULL AUTO_INCREMENT,
  `UserGoogleId` char(21) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `EpisodeNumber` int(11) UNSIGNED DEFAULT NULL,
  `FileId` int(11) DEFAULT NULL,
  `ActivityType` enum('INSERT','UPDATE') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'INSERT',
  `ActivityDateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ActivityId`),
  KEY `EpisodeNumber` (`EpisodeNumber`),
  KEY `FileId` (`FileId`),
  KEY `UserGoogleId` (`UserGoogleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `Activities`:
--   `EpisodeNumber`
--       `Episodes` -> `EpisodeNumber`
--   `FileId`
--       `Files` -> `FileId`
--   `UserGoogleId`
--       `Users` -> `GoogleId`
--

-- --------------------------------------------------------

--
-- Table structure for table `Episodes`
--

DROP TABLE IF EXISTS `Episodes`;
CREATE TABLE IF NOT EXISTS `Episodes` (
  `EpisodeNumber` int(11) UNSIGNED NOT NULL COMMENT 'itunes:episode',
  `Title` varchar(255) COLLATE utf8_unicode_ci NOT NULL COMMENT 'title',
  `Subtitle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'itunes:subtitle',
  `Description` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'description',
  `Keywords` json DEFAULT NULL COMMENT 'media:keyword',
  `Note` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'content:encoded',
  `PublishDate` datetime NOT NULL COMMENT 'pubDate',
  `Length` time NOT NULL COMMENT 'itunes:duration',
  `FileId` int(11) DEFAULT NULL,
  `YouTubeId` char(11) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`EpisodeNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- MIME TYPES FOR TABLE `Episodes`:
--   `Description`
--       `Text_Plain`
--   `Length`
--       `Text_Plain`
--   `PublishDate`
--       `Text_Plain`
--   `Subtitle`
--       `Text_Plain`
--   `Title`
--       `Text_Plain`
--   `YouTubeId`
--       `Text_Plain`
--

--
-- RELATIONSHIPS FOR TABLE `Episodes`:
--

-- --------------------------------------------------------

--
-- Table structure for table `Files`
--

DROP TABLE IF EXISTS `Files`;
CREATE TABLE IF NOT EXISTS `Files` (
  `FileId` int(11) NOT NULL AUTO_INCREMENT,
  `EpisodeNumber` int(11) UNSIGNED NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `Url` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT 'enclosure/@url',
  `Size` int(11) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'enclosure/@length',
  `MimeType` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'application/octetstream' COMMENT 'enclosure/@type',
  `IsDefault` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'media:content/@isDefault',
  `BitRate` int(11) UNSIGNED DEFAULT NULL COMMENT 'in kbps; media:content/@bitrate',
  `SamplingRate` decimal(3,1) UNSIGNED DEFAULT NULL COMMENT 'in kHz; media:content/@samplingrate',
  `NumberChannels` tinyint(3) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'media:contents/@channels',
  `Hash` binary(16) DEFAULT NULL COMMENT 'media:hash',
  PRIMARY KEY (`FileId`),
  KEY `EpisodeNumber` (`EpisodeNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `Files`:
--   `EpisodeNumber`
--       `Episodes` -> `EpisodeNumber`
--

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE IF NOT EXISTS `Users` (
  `GoogleId` char(21) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `UserName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `Salt` binary(16) DEFAULT NULL,
  PRIMARY KEY (`GoogleId`),
  UNIQUE KEY `UserName` (`UserName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- MIME TYPES FOR TABLE `Users`:
--   `Salt`
--       `Application_Octetstream`
--

--
-- RELATIONSHIPS FOR TABLE `Users`:
--

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Activities`
--
ALTER TABLE `Activities`
  ADD CONSTRAINT `Activities_ibfk_1` FOREIGN KEY (`EpisodeNumber`) REFERENCES `Episodes` (`EpisodeNumber`),
  ADD CONSTRAINT `Activities_ibfk_2` FOREIGN KEY (`FileId`) REFERENCES `Files` (`FileId`),
  ADD CONSTRAINT `Activities_ibfk_3` FOREIGN KEY (`UserGoogleId`) REFERENCES `Users` (`GoogleId`);

--
-- Constraints for table `Files`
--
ALTER TABLE `Files`
  ADD CONSTRAINT `Files_ibfk_1` FOREIGN KEY (`EpisodeNumber`) REFERENCES `Episodes` (`EpisodeNumber`);


--
-- Metadata
--
USE `phpmyadmin`;

--
-- Metadata for table Activities
--

--
-- Metadata for table Episodes
--

--
-- Dumping data for table `pma__column_info`
--

INSERT INTO `pma__column_info` (`db_name`, `table_name`, `column_name`, `comment`, `mimetype`, `transformation`, `transformation_options`, `input_transformation`, `input_transformation_options`) VALUES
('mlpodcast', 'Episodes', 'Description', '', 'text_plain', '', '', '', ''),
('mlpodcast', 'Episodes', 'Length', '', 'text_plain', '', '', '', ''),
('mlpodcast', 'Episodes', 'PublishDate', '', 'text_plain', '', '', '', ''),
('mlpodcast', 'Episodes', 'Subtitle', '', 'text_plain', '', '', '', ''),
('mlpodcast', 'Episodes', 'Title', '', 'text_plain', '', '', '', ''),
('mlpodcast', 'Episodes', 'YouTubeId', '', 'text_plain', '', '', '', '');

--
-- Metadata for table Files
--

--
-- Metadata for table Users
--

--
-- Dumping data for table `pma__column_info`
--

INSERT INTO `pma__column_info` (`db_name`, `table_name`, `column_name`, `comment`, `mimetype`, `transformation`, `transformation_options`, `input_transformation`, `input_transformation_options`) VALUES
('mlpodcast', 'Users', 'Salt', '', 'application_octetstream', '', '', '', '');

--
-- Metadata for database mlpodcast
--

--
-- Dumping data for table `pma__central_columns`
--

INSERT INTO `pma__central_columns` (`db_name`, `col_name`, `col_type`, `col_length`, `col_collation`, `col_isNull`, `col_extra`, `col_default`) VALUES
('mlpodcast', 'GoogleId', 'char', '21', 'utf8_bin', 0, ',', '');
COMMIT;
