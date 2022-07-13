CREATE TABLE `accounts` (
  `account_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `account_name` varchar(48) NOT NULL,
  `account_currency` char(3) NOT NULL
);

CREATE TABLE `account_balances` (
  `balance_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `balance_date` date NOT NULL,
  `account_id` int unsigned NOT NULL,
  `balance_amount` double NOT NULL,
  UNIQUE KEY (`balance_date`,`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `purchase_categories` (
  `purchase_category_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `parent_category_id` int unsigned DEFAULT NULL,
  `purchase_category_name` varchar(36) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  UNIQUE KEY (`purchase_category_name`),
  FOREIGN KEY (`parent_category_id`) REFERENCES `purchase_categories` (`purchase_category_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `business_entities` (
  `business_entity_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `business_entity_name` varchar(72) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  UNIQUE KEY (`business_entity_name`)
);

CREATE TABLE `purchases` (
  `purchase_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `purchase_date` date NOT NULL,
  `purchase_category_id` int unsigned NOT NULL,
  `business_entity_id` int unsigned DEFAULT NULL,
  `purchase_currency` char(3) NOT NULL DEFAULT 'SGD',
  `purchase_amount` double NOT NULL,
  `remarks` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  FOREIGN KEY (`purchase_category_id`) REFERENCES `purchase_categories` (`purchase_category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`business_entity_id`) REFERENCES `business_entities` (`business_entity_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `payments` (
  `payment_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `purchase_id` int unsigned NOT NULL,
  `payment_date` date NOT NULL,
  `account_id` int unsigned NOT NULL,
  `payment_amount` double NOT NULL,
  FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `transfer_types` (
  `transfer_type_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `transfer_type_name` varchar(48) NOT NULL,
  UNIQUE KEY (`transfer_type_name`)
);

CREATE TABLE `external_transfers` (
  `external_transfer_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `external_transfer_date` date NOT NULL,
  `transfer_type_id` int unsigned DEFAULT NULL,
  `account_id` int unsigned NOT NULL,
  `external_transfer_amount` double NOT NULL DEFAULT '0.00',
  `remarks` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`transfer_type_id`) REFERENCES `transfer_types` (`transfer_type_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `internal_transfers` (
  `internal_transfer_id` int unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `internal_transfer_date` date NOT NULL,
  `source_account_id` int unsigned NOT NULL,
  `destination_account_id` int unsigned NOT NULL,
  `source_amount` double NOT NULL DEFAULT '0.00',
  `destination_amount` double NOT NULL DEFAULT '0.00',
  FOREIGN KEY (`source_account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`destination_account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE
);
