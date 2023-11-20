INSERT INTO `account_balances` VALUES
(10,'2018-11-10',1,100,'2023-11-19 15:51:46','2023-11-19 23:37:40')
(11,'2018-11-10',2,70,'2023-11-19 15:51:46','2023-11-19 23:37:40')
(12,'2018-11-10',3,100,'2023-11-19 15:51:46','2023-11-19 23:37:40')
(13,'2018-11-10',4,100,'2023-11-19 15:51:46','2023-11-19 23:37:40')
(14,'2018-11-17',2,50,'2023-11-19 15:51:46','2023-11-19 15:51:46')
(15,'2018-11-17',4,50,'2023-11-19 15:51:46','2023-11-19 15:51:46')
(16,'2018-11-24',2,170,'2023-11-19 15:51:46','2023-11-19 15:51:46')
(17,'2018-11-24',3,0,'2023-11-19 15:51:46','2023-11-19 15:51:46')
(18,'2018-12-01',1,10,'2023-11-19 15:51:46','2023-11-19 15:51:46')
(19,'2018-12-01',2,140,'2023-11-20 00:10:58','2023-11-20 00:10:58');

INSERT INTO `accounts` VALUES
(1,'Healthcare Fund','AUD','2023-11-19 15:51:46','2023-11-19 15:51:46')
(2,'Operational Fund (AUD)','AUD','2023-11-19 15:51:46','2023-11-19 15:51:46')
(3,'Operational Fund (USD)','USD','2023-11-19 15:51:46','2023-11-19 15:51:46')
(4,'Welfare Fund','AUD','2023-11-19 15:51:46','2023-11-19 15:51:46');

INSERT INTO `business_entities` VALUES
(1,'OakTree Furnitures','2023-11-19 23:09:21','2023-11-19 23:09:21')
(2,'Best Pizza Restaurant','2023-11-19 23:34:46','2023-11-19 23:34:46')
(3,'Harrydale Clinic','2023-11-19 23:35:28','2023-11-19 23:35:28');

INSERT INTO `external_transfers` VALUES
(1,'2018-11-05',1,1,100,'Initial funding','2023-11-20 00:05:28','2023-11-20 00:05:28')
(2,'2018-11-05',1,2,100,'Initial funding','2023-11-20 00:05:40','2023-11-20 00:05:40')
(3,'2018-11-05',1,3,100,'Initial funding','2023-11-20 00:05:55','2023-11-20 00:05:55')
(4,'2018-11-05',1,4,100,'Initial funding','2023-11-20 00:06:08','2023-11-20 00:06:08');

INSERT INTO `internal_transfers` VALUES
(1,'2018-11-19',3,2,100,150,'2023-11-20 00:09:16','2023-11-20 00:09:16');

INSERT INTO `payments` VALUES
(1,4,'2018-11-05',2,-30,'2023-11-19 23:09:21','2023-11-19 23:09:21')
(2,4,'2018-11-12',2,-30,'2023-11-19 23:09:21','2023-11-19 23:09:21')
(3,4,'2018-11-19',2,-30,'2023-11-19 23:09:21','2023-11-19 23:09:21')
(4,4,'2018-11-26',2,-30,'2023-11-19 23:09:21','2023-11-19 23:09:21')
(5,5,'2018-11-12',4,-50,'2023-11-19 23:34:46','2023-11-19 23:34:46')
(6,6,'2018-11-26',1,-90,'2023-11-19 23:35:28','2023-11-19 23:35:28');

INSERT INTO `purchase_categories` VALUES
(1,NULL,'Furnitures','2023-11-19 23:07:05','2023-11-19 23:07:05')
(2,NULL,'Food & Beverages','2023-11-19 23:07:05','2023-11-19 23:07:05')
(3,NULL,'Healthcare','2023-11-19 23:07:05','2023-11-19 23:07:05');

INSERT INTO `purchases` VALUES
(4,'2018-11-05',1,1,'AUD',150,'Coffee table, 5 payments of $30','2023-11-19 23:07:09','2023-11-19 23:09:54')
(5,'2018-11-12',2,2,'AUD',50,'Pizza party for 4 staff members','2023-11-19 23:07:09','2023-11-19 23:34:46')
(6,'2018-11-26',3,3,'AUD',90,'Vaccination for 6 employees','2023-11-19 23:07:09','2023-11-19 23:35:28');

INSERT INTO `transfer_types` VALUES
(1,'Funds Transfer','2023-11-20 00:05:27','2023-11-20 00:05:27');
