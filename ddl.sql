-- MySQL dump 10.13  Distrib 5.7.33, for Linux (x86_64)
--
-- Host: localhost    Database: exp11
-- ------------------------------------------------------
-- Server version	5.7.33-0ubuntu0.18.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accs`
--

DROP TABLE IF EXISTS `accs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accs` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(48) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'SGD',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bals`
--

DROP TABLE IF EXISTS `bals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bals` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `acc` tinyint(3) unsigned NOT NULL,
  `amt` double(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`,`acc`),
  KEY `acc` (`acc`),
  CONSTRAINT `bals_ibfk_1` FOREIGN KEY (`acc`) REFERENCES `accs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=959 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `buys`
--

DROP TABLE IF EXISTS `buys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `buys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `itm` int(10) unsigned NOT NULL,
  `ent` int(10) unsigned DEFAULT NULL,
  `cur` char(3) NOT NULL DEFAULT 'SGD',
  `amt` double(10,2) NOT NULL,
  `remarks` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `itm` (`itm`),
  KEY `ent` (`ent`),
  CONSTRAINT `buys_ibfk_1` FOREIGN KEY (`itm`) REFERENCES `itms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `buys_ibfk_2` FOREIGN KEY (`ent`) REFERENCES `ents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1792 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ents`
--

DROP TABLE IF EXISTS `ents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(36) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=259 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ents_syns`
--

DROP TABLE IF EXISTS `ents_syns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ents_syns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `of` int(10) unsigned NOT NULL,
  `name` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ent` (`of`),
  CONSTRAINT `ents_syns_ibfk_1` FOREIGN KEY (`of`) REFERENCES `ents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exts`
--

DROP TABLE IF EXISTS `exts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exts` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `tft` int(10) unsigned DEFAULT NULL,
  `acc` tinyint(3) unsigned NOT NULL,
  `amt` double(10,2) NOT NULL DEFAULT '0.00',
  `remarks` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `acc` (`acc`),
  KEY `tft` (`tft`),
  CONSTRAINT `exts_ibfk_1` FOREIGN KEY (`acc`) REFERENCES `accs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exts_ibfk_2` FOREIGN KEY (`tft`) REFERENCES `tfts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ints`
--

DROP TABLE IF EXISTS `ints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ints` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `sr_acc` tinyint(3) unsigned NOT NULL,
  `de_acc` tinyint(3) unsigned NOT NULL,
  `sr_amt` double(10,2) NOT NULL DEFAULT '0.00',
  `de_amt` double(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `sr` (`sr_acc`),
  KEY `de` (`de_acc`),
  CONSTRAINT `ints_ibfk_1` FOREIGN KEY (`sr_acc`) REFERENCES `accs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ints_ibfk_2` FOREIGN KEY (`de_acc`) REFERENCES `accs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `itms`
--

DROP TABLE IF EXISTS `itms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cat` int(10) unsigned DEFAULT NULL,
  `name` varchar(36) CHARACTER SET utf8 NOT NULL,
  `subname` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `itms_ibfk_1` (`cat`),
  CONSTRAINT `itms_ibfk_1` FOREIGN KEY (`cat`) REFERENCES `itms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `itms_syns`
--

DROP TABLE IF EXISTS `itms_syns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itms_syns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `of` int(10) unsigned NOT NULL,
  `name` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `itm` (`of`),
  CONSTRAINT `itms_syns_ibfk_1` FOREIGN KEY (`of`) REFERENCES `itms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pays`
--

DROP TABLE IF EXISTS `pays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pays` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `buy` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `acc` tinyint(3) unsigned NOT NULL,
  `amt` double(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `buy` (`buy`),
  KEY `acc` (`acc`),
  CONSTRAINT `pays_ibfk_1` FOREIGN KEY (`buy`) REFERENCES `buys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pays_ibfk_2` FOREIGN KEY (`acc`) REFERENCES `accs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1952 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tfts`
--

DROP TABLE IF EXISTS `tfts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tfts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tfts_syns`
--

DROP TABLE IF EXISTS `tfts_syns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tfts_syns` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `of` int(10) unsigned NOT NULL,
  `name` varchar(48) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tft` (`of`),
  CONSTRAINT `tfts_syns_ibfk_1` FOREIGN KEY (`of`) REFERENCES `tfts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-09 15:00:16
