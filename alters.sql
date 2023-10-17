# Customer :

ALTER TABLE `ab_customer` CHANGE `first_name` `company_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `middle_name` `person_name` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `last_name` `GST_no` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `birth_date` `adhar_number` INT(15) NULL DEFAULT NULL;
ALTER TABLE `ab_customer` CHANGE `salutation` `pan_number` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `type` `website` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
UPDATE `ab_menu_master` SET `menuName` = 'Company/Clients' WHERE `ab_menu_master`.`menuID` = 67;
ALTER TABLE `ab_project` CHANGE `client_name` `client_id` INT(10) NOT NULL;
