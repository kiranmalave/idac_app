# Customer :

ALTER TABLE `ab_customer` CHANGE `first_name` `company_name` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `middle_name` `person_name` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `last_name` `GST_no` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `birth_date` `adhar_number` INT(15) NULL DEFAULT NULL;
ALTER TABLE `ab_customer` CHANGE `salutation` `pan_number` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `ab_customer` CHANGE `type` `website` VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
UPDATE `ab_menu_master` SET `menuName` = 'Company/Clients' WHERE `ab_menu_master`.`menuID` = 67;




ALTER TABLE `ab_project` CHANGE `client_name` `client_id` INT(10) NOT NULL;
ALTER TABLE `ab_customer` ADD `billing_name` VARCHAR(500) NOT NULL AFTER `person_name`, ADD `billing_address` VARCHAR(500) NOT NULL AFTER `billing_name`, ADD `branch_id` VARCHAR(200) NOT NULL AFTER `billing_address`;
ALTER TABLE `ab_customer` ADD `country_code` VARCHAR(50) NOT NULL AFTER `address`;
ALTER TABLE `ab_customer` CHANGE `adhar_number` `adhar_number` VARCHAR(15) NULL DEFAULT NULL;




ALTER TABLE `ab_project` CHANGE `desicription` `description` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;



## Branches ###

ALTER TABLE `ab_branches` CHANGE `createdBy` `created_by` INT(11) NOT NULL;
ALTER TABLE `ab_branches` CHANGE `modifiedBy` `modified_by` INT(11) NOT NULL;
ALTER TABLE `ab_branches` CHANGE `createdDate` `created_date` DATETIME NOT NULL;
ALTER TABLE `ab_branches` CHANGE `modifiedDate` `modified_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;



ALTER TABLE `ab_project` ADD `project_number` VARCHAR(20) NOT NULL AFTER `project_id`;
