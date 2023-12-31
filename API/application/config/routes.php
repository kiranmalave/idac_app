<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES 
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'welcome';

$route['login'] = 'Login/verifyUser';
$route['salt'] = 'Login/getsalt';
$route['logout'] = 'Login/logout';
$route['forgotPassword'] = 'Login/resetPassword';

$route['mSalt'] = 'Login/getsaltMobile';
$route['mLogin'] = 'Login/verifyUserMobile';


$route['dashboardDetails'] = 'Dashboard/getDashboardCount';
$route['alerts'] = 'Dashboard/alerts';




$route['menuMasterList'] = 'MenuMaster/getMenuDetails';
$route['menuMaster'] = 'MenuMaster/menuMaster';
$route['menuMaster/(:num)'] = 'MenuMaster/menuMaster/$1';
$route['menuMaster/status'] = 'MenuMaster/menuChangeStatus';
$route['getMenuList'] = 'MenuMaster/getMenuList';
$route['accessMenuList/(:num)'] = 'MenuMaster/accessMenuList/$1';
$route['getUserPermission'] = 'MenuMaster/getUserPermission';
$route['userAccess'] = 'MenuMaster/userAccess';
$route['accessCompanyList/(:num)'] = 'MenuMaster/accessCompanyList/$1';
$route['systemMenuUpdatePositions'] = 'MenuMaster/updatePositions';


$route['themeOptionMasterList'] = 'ThemeOptionMaster/getThemeOptionDetails';
$route['themeOptionMaster'] = 'ThemeOptionMaster/themeOptionMaster';
$route['themeOptionMaster/(:num)'] = 'ThemeOptionMaster/themeOptionMaster/$1';
// $route['themeOptionMaster/status'] = 'ThemeOptionMaster/themeOptionChangeStatus';



$route['admins'] = 'SearchAdmin/index';
$route['admins/status'] = 'SearchAdmin/changeStatus';
$route['addadmin/(:num)'] = 'SearchAdmin/getAdminDetails/$1';
$route['addadmin'] = 'SearchAdmin/getAdminDetails';
$route['adduser'] = 'SearchAdmin/adduser';
$route['resetPasswordRequest'] = 'SearchAdmin/resetPasswordRequest';
$route['validateOtp/(:num)'] = 'SearchAdmin/validateOtp/$1';
$route['updatePassword/(:num)'] = 'SearchAdmin/updatePassword/$1';
$route['getSystemUsers'] = 'SearchAdmin/getSystemUserList';
$route['getSystemUserNameList'] = 'SearchAdmin/getSystemUserNameList';
///added by sanjay to update firebase token
$route['uToken'] = 'SearchAdmin/updateToken';

$route['userRoleMasterList'] = 'Masters/getUserRoleDetails';
$route['userRoleMaster'] = 'Masters/userRoleMaster';
$route['userRoleMaster/(:num)'] = 'Masters/userRoleMaster/$1';
$route['userRoleMaster/status'] = 'Masters/userRoleChangeStatus';

// $route['customerList'] = 'Customer/customerList';
// $route['customer/(:num)'] = 'Customer/customer/$1';

$route['dynamicFormFieldList'] = 'DynamicFormField/formFieldList';
$route['dynamicformfield'] = 'DynamicFormField/dynamicformfield';
$route['dynamicformfield/(:num)'] = 'DynamicFormField/dynamicformfield/$1';
$route['dynamicformfield/status'] = 'DynamicFormField/changeStatus';
$route['dynamicFormDataList'] = 'DynamicFormField/getFormData';
$route['linkedFormData'] = 'DynamicFormField/getLinkedFormData';

$route['infoSettingsList'] = 'InfoSetting/index';
$route['infoSettingsList/(:num)'] = 'InfoSetting/index/$1';

$route['sameDayNotification'] = 'Notifications/sameDayNotification';
$route['sendNotification'] = 'Notifications/sendNotification';
$route['sendEmail'] = 'SendEmail/sendEmail';
$route['autoMailService/document/(:num)'] = 'AutoMailService/documentChangeStatus/$1';

///// page Route
$route['pagesMasterList'] = 'Pages/getPagesDetailsList';
$route['pagesMaster'] = 'Pages/pageMaster';
$route['pagesMaster/(:num)'] = 'Pages/pageMaster/$1';
$route['pagesMaster/status'] = 'Pages/pageChangeStatus';
///page Routes


//////////////////////read server files from server
$route['readSeverFiles'] = 'ReadFoldersAndFiles/readFoldersAndFiles';
$route['adminMediaCollection'] = 'ReadFoldersAndFiles/adminMFiles';
$route['addFilesInFolder'] = 'ReadFoldersAndFiles/addFilesInFolder';
$route['mediaUpload/(:num)'] = 'ReadFoldersAndFiles/mediaUpload/$1';
$route['otherUpload/(:any)/(:num)'] = 'ReadFoldersAndFiles/otherMediaUpload/$1/$2';
$route['mediaUpload'] = 'ReadFoldersAndFiles/mediaUpload';
$route['addDIR'] = 'ReadFoldersAndFiles/addDIR';
$route['deleteFolder'] = 'ReadFoldersAndFiles/deleteFolder';
$route['deleteFile'] = 'ReadFoldersAndFiles/deleteFile';


######category
$route['categoryMasterList'] = 'categoryMaster/getcategoryDetails';
$route['categorySlugList'] = 'categoryMaster/getslugList';
$route['categoryMaster'] = 'categoryMaster/categoryMaster';
$route['categoryMaster/(:num)'] = 'categoryMaster/categoryMaster/$1';
$route['categoryMaster/status'] = 'categoryMaster/CategoryChangeStatus';

######customer
$route['customerMasterList'] = 'Customer/getcustomerList';
$route['customerMaster'] = 'Customer/customer';
$route['customerMaster/(:num)'] = 'Customer/customer/$1';
$route['customerMaster/status'] = 'Customer/customerChangeStatus';

######branch
$route['branchList'] = 'Branch/getbranchList';
$route['branch'] = 'Branch/branch';
$route['branch/(:num)'] = 'Branch/branch/$1';
$route['branch/status'] = 'Branch/branchChangeStatus';

######proposaltemplate
$route['proposalTemplateList'] = 'ProposalTemplateMaster/getproposalMasterList';
$route['proposalTemplateSingle'] = 'ProposalTemplateMaster/proposalTemplateMasterData';
$route['proposalTemplateSingle/(:num)'] = 'ProposalTemplateMaster/proposalTemplateMasterData/$1';
$route['proposalTemplate/status'] = 'ProposalTemplateMaster/proposalTemplateDataChangeStatus';

######proposal
$route['proposalMasterList'] = 'proposal/getproposalDetails';
$route['proposalMaster'] = 'proposal/proposal';
$route['proposalMaster/(:num)'] = 'proposal/proposal/$1';
$route['proposalMaster/status'] = 'proposal/proposalchangeStatus';
$route['proposalMaster/confirmProposal'] = 'proposal/confirmProposal';
$route['printProposal/(:num)'] = 'proposal/printProposal/$1';


######project
$route['projectList'] = 'project/getprojectDetails';
$route['project'] = 'project/project';
$route['project/(:num)'] = 'project/project/$1';
$route['project/status'] = 'project/projectchangeStatus';


######task
$route['taskMasterList'] = 'taskMaster/gettaskDetails';
$route['taskMaster'] = 'taskMaster/taskMaster';
$route['taskMaster/(:num)'] = 'taskMaster/taskMaster/$1';
$route['taskMaster/status'] = 'taskMaster/taskChangeStatus';
$route['taskDashboard/status'] = 'taskMaster/dashboardStatus';
$route['taskMaster/saveWatchersDetails'] = 'taskMaster/saveWatchersDetails';
$route['taskMaster/removeWatchers'] = 'taskMaster/removeWatchers';
$route['taskMaster/removeAttachment'] = 'taskMaster/removeAttachment';
$route['taskComment'] = 'taskMaster/taskCommentMaster';
// $route['taskComment/(:num)'] = 'taskMaster/taskCommentMaster/$1';
$route['commentsList'] = 'taskMaster/gettaskCommentDetails';
$route['getHistory'] = 'taskMaster/getTaskHistory';

######Invoice
$route['taxInvoiceList'] = 'TaxInvoice/index';
$route['taxInvoice'] = 'TaxInvoice/getTaxInvoiceDetails';
$route['taxInvoice/(:num)'] = 'TaxInvoice/getTaxInvoiceDetails/$1';
$route['taxInvoiceMaster/status'] = 'TaxInvoice/taxInvoiceChangeStatus';
$route['invoiceItemList'] = 'TaxInvoice/invoiceItemList';
$route['getNarration/(:any)'] = 'TaxInvoice/getNarration/$1';
$route['getNarration'] = 'TaxInvoice/getNarration';
$route['cancelInvoice/(:num)'] = 'TaxInvoice/cancelInvoice/$1';
$route['printBill/(:num)'] = 'TaxInvoice/printBill/$1';


######ourclients
$route['ourClientsList'] = 'OurClients/getclientDetails';
$route['ourClient'] = 'OurClients/OurClients';
$route['ourClient/(:num)'] = 'OurClients/OurClients/$1';
$route['ourClient/status'] = 'OurClients/OurClientsChangeStatus';

######contactUs
$route['contactUsList'] = 'ContactUs/getcontactUsDetails';
$route['contactUs'] = 'ContactUs/ContactUs';
$route['contactUs/status'] = 'ContactUs/ContactUsChangeStatus';

######ourteams
$route['ourTeamList'] = 'OurTeam/getteamDetails';
$route['ourTeam'] = 'OurTeam/OurTeam';
$route['ourTeam/(:num)'] = 'OurTeam/OurTeam/$1';
$route['ourTeam/status'] = 'OurTeam/OurTeamChangeStatus';

######testimonials
$route['testimonialsList'] = 'Testimonials/gettestimonialsDetails';
$route['testimonials'] = 'Testimonials/testimonials';
$route['testimonials/(:num)'] = 'Testimonials/testimonials/$1';
$route['testimonials/status'] = 'Testimonials/testimonialsChangeStatus';

######DynamicField
$route['dynamicFormsList'] = 'DynamicForms/getFieldDetails';
$route['dynamicForms'] = 'DynamicForms/DynamicForm';
$route['dynamicForms/(:num)'] = 'DynamicForms/DynamicForm/$1';
$route['dynamicForms/status'] = 'DynamicForms/DynamicFieldChangeStatus';


////////////////// server files reading end  //////////////////

///FAQ Route

$route['faqList'] = 'Faq/getFaqDetailsList';
$route['faq'] = 'Faq/faqData';
$route['faq/(:num)'] = 'Faq/faqData/$1';
$route['faq/status'] = 'Faq/faqDataChangeStatus';

///pages Menu Master Route

$route['pagesMenuMasterList'] = 'Pages/getPagesMenuMasterList';
$route['pagesMenuMaster'] = 'Pages/pagesMenuMaster';
$route['pagesMenuMaster/(:num)'] = 'Pages/pagesMenuMaster/$1';
$route['pagesMenuMaster/status'] = 'Pages/pagesMenuMasterChangeStatus';
$route['updatemenuPagesList'] = 'Pages/updatemenuPagesList';
$route['menuPagesList'] = 'Pages/menuPagesList';
$route['deletePageFromSelectedMenu'] = 'Pages/deletePageFromSelectedMenu';
$route['menuPagesMaster/updatePositions'] = 'Pages/updatePositions';

$route['translate_uri_dashes'] = FALSE;
$route['404_override'] = '';
