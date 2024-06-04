<?php
defined('BASEPATH') or exit('No direct script access allowed');

class SearchAdmin extends CI_Controller
{

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */

	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->helper('form');
		$this->load->model('SearchAdminModel');
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("ValidateData");
		if(!$this->config->item('development')){
			$this->load->library("Emails");
		}
		$this->load->library("Datatables");
		$this->load->library("Filters");

		//"paginginfo":{"curPage":1,"prevPage":0,"pageLimit":"20","nextpage":2,"lastpage":123,"totalRecords":"3696","start":1,"end":30}
		$where = array("infoID" => 1);

		$infoData = $this->CommonModel->getMasterDetails('info_settings', '', $where);
		$this->fromEmail = $infoData[0]->fromEmail;
		$this->ccEmail = $infoData[0]->ccEmail;
		$this->fromName = $infoData[0]->fromName;
	}
	public function index()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$t = $this->input->post('textSearch');
		$t = $t ?? '';
		$textSearch = trim($t);
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$isAll = $this->input->post('getAll');
		$statuscode = $this->input->post('status');
		$t = $this->input->post('adminID');
		$t = $t ?? '';
		$memberID = trim($t);
		$t = $this->input->post('SmemberID');
		$t = $t ?? '';
		$SmemberID = trim($t);
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$startDate2 = $this->input->post('fromDate2');
		$endDate2 = $this->input->post('toDate2');
		$config = array();
		$other = array("orderBy" => $orderBy, "order" => $order);
		$other['lat'] = "";
		$other['long'] = "";


		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}

		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$wherec["$textSearch like  "] = "'%" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["t.created_date >="] = "'".$sDate."'";
		}
		if(isset($endDate) && !empty($endDate)){
			$eDate = date("Y-m-d",strtotime($endDate));
			$wherec["t.created_date <="] = "'".$eDate."'";
		}
	
		if(isset($startDate2) && !empty($startDate2)){
			$sDate = date("Y-m-d",strtotime($startDate2));
			$wherec["lastLogin >="] = "'".$sDate."'";
		}
		if(isset($endDate2) && !empty($endDate2)){
			$eDate = date("Y-m-d",strtotime($endDate2));
			$wherec["lastLogin <="] = "'".$eDate."'";
		}
		// exit();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "user_extra_details";
		$join[0]['alias'] = "u";
		$join[0]['key1'] = "adminID";
		$join[0]['key2'] = "adminID";
		// print_r($isAll);exit();
		$config["base_url"] = base_url() . "members";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.adminID', "admin", $wherec, "", $join);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		$selectC = "t.*,u.address,u.contactNo,u.whatsappNo,u.dateOfBirth,u.roleOfUser";
		
		if ($isAll == "Y") {
			$adminDetails = $this->CommonModel->GetMasterListDetails($selectC, 'admin', $wherec, '', '', $join, $other);
		} else {
			$adminDetails = $this->SearchAdminModel->GetMembersDetails($selectC, $wherec, $config["per_page"], $page, $join, $other);
		}

		// print_r($adminDetails);exit();
		$status['data'] = $adminDetails;

		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}
		if ($adminDetails) {
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function changeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "delete") {
			$ids = $this->input->post("list");
			$deleteMember = $this->SearchAdminModel->changeMemberStatus('delete', $ids);

			if ($deleteMember) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}

		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->SearchAdminModel->changeMemberStatus($statusCode, $ids);

			if ($changestatus) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function getAdminDetails($adminID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();

		$method = $this->input->method(TRUE);
		$today =date("Y-m-d");
		if($method == "POST" || $method == "PUT"){
			$adminDetails = $adminEextraDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$adminDetails['password'] = '';
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			$wherec = array("roleID" => $adminDetails['roleID']);
			$roleDetails = $this->CommonModel->getMasterDetails("user_role_master", $select = "role", $wherec);
			$adminDetails['roleOfUser'] = $roleDetails[0]->role;
			$adminDetails['created_date'] = $updateDate;
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			$adminDetails['otp'] = rand(100000, 999999); 
			$adminDetails['otp_exp_time'] = date('Y-m-d H:i:s', strtotime('+30 minutes'));
			$adminDetails['isVerified'] = 'N'; 
			$adminDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
			$adminDetails['contactNo'] = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
			$adminDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo', 'Whatsapp No', false, '', array());
			$adminDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth', 'Date Of Birth', false, '', array());
			if(isset($adminDetails['dateOfBirth']) && !empty($adminDetails['dateOfBirth']) && $adminDetails['dateOfBirth'] !="0000-00-00"){
				$adminDetails['dateOfBirth'] = str_replace("-","-",$adminDetails['dateOfBirth']);
				$adminDetails['dateOfBirth'] = date("Y-m-d",strtotime($adminDetails['dateOfBirth']));
			}
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$adminDetails['password'] = $this->validatedata->validate('password', 'Password', false, '', array());
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			// $adminDetails['company_id'] = $this->validatedata->validate('company_id', 'company_id', true, '', array());
			// $adminDetails['time_zone'] = $this->validatedata->validate('time_zone', 'time zone', false, '', array());
			if (isset($adminDetails['company_id']) && !empty($adminDetails['company_id'])) {
				$cmpArr = explode(',',$adminDetails['company_id']);
				$adminDetails['default_company'] = $cmpArr[0];
			}
			switch ($method) {
				case "PUT": {			
					
						$this->db->trans_start();
						
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						$where1 = array("contactNo" => $adminDetails['contactNo']);
						$userMobile = $this->CommonModel->getMasterDetails('admin', '', $where1);
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);

						// add dynamic feild data
						$fieldData = $this->datatables->mapDynamicFeilds("usersList",$this->input->post());
						$adminDetails = array_merge($fieldData, $adminDetails);
						if (!empty($db_userName)) {
							$status['msg'] = $this->systemmsg->getErrorCode(297);
							$status['statusCode'] = 297;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userEmail)) {
							$status['msg'] = $this->systemmsg->getErrorCode(278);
							$status['statusCode'] = 278;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userMobile)) {
							$status['msg'] = $this->systemmsg->getErrorCode(279);
							$status['statusCode'] = 279;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$iscreated = $this->SearchAdminModel->saveAdminDetails($adminDetails);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$verificationCode = md5($adminDetails['otp']);
							$verificationCode = substr($verificationCode,0,10);
							$adminID = $this->SearchAdminModel->getInsertedID();
							$baseURL = $this->config->item("app_url")."#userVerification?&vfcode=".$verificationCode."&auth-id=".$adminID;
							// print_r($baseURL);
								if ($adminDetails['status'] == "Active") {
									$sendEmail = $this->sendAccountVerification($adminDetails['email'], $adminDetails['userName'], $verificationCode, $baseURL, $adminDetails['name']);
									if ($sendEmail) {
										$updateStatus = $this->SearchAdminModel->updateAdminDetails($array = array("isEmailSend" => "Y"), $adminID);
										$this->db->trans_commit();
										$status['msg'] = $this->systemmsg->getSucessCode(400);
										$status['statusCode'] = 400;
										$status['data'] = array();
										$status['flag'] = 'S';
										$this->response->output($status, 200);
									}else{
										$this->db->trans_rollback();
										$status['msg'] = $this->systemmsg->getErrorCode(296);
										$status['statusCode'] = 296;
										$status['data'] = array();
										$status['flag'] = 'F';
										$this->response->output($status, 200);
									}
								}
						}
						break;
					}
				case "POST": {
						$updateDate = date("Y/m/d H:i:s");
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);
						
						// add dynamic feild data
						$fieldData = $this->datatables->mapDynamicFeilds("usersList",$this->input->post());
						$adminDetails = array_merge($fieldData, $adminDetails);
						
						if (!empty($db_userName) ){
							if($db_userName[0]->adminID != $adminID) {
				
								$status['msg'] = "User Name Already Exists!";
								$status['statusCode'] = 278;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
						}
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						
						if (!empty($userEmail)) {
							
							$isEqual = $userEmail[0]->adminID != $adminID ? true : false;	
							if ($isEqual) {
								$status['msg'] = $this->systemmsg->getErrorCode(278);
								$status['statusCode'] = 278;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
						}
						$iscreated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						}
						break;
					}
				default: {
					
						break;
					}
			}
		}else{
			if($adminID ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			
			$this->menuID = $this->input->post('menuId');
			$this->filters->menuID = $this->menuID;
			
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="u";
			$join[$jkey]['key1'] ="adminID";
			$join[$jkey]['key2'] ="adminID";

			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="user_role_master";
			$join[$jkey]['alias'] ="r";
			$join[$jkey]['key1'] ="roleID";
			$join[$jkey]['key2'] ="roleID";

			$other = array();
			$wherec["t.adminID"] = "=".$adminID;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}else{
				$selectC = "t.*,".$selectC;	
			}
			
			$adminHistory = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				// $adminHistory = $this->SearchAdminModel->getAdminDetails($adminID);
				if (isset($adminHistory) && !empty($adminHistory)) {

					$status['data'] = $adminHistory;
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				} else {

					$status['msg'] = $this->systemmsg->getErrorCode(227);
					$status['statusCode'] = 227;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
		}
	}


	public function sendUpdatedUserNameAndPassword($email = '', $userName = '', $password = '', $appLink = '', $name = '')
	{

		$where = array("tempName" => "updatePassword");
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
		if(isset($tempData) && !empty($tempData)){
			$mailContent = $tempData[0]->emailContent;

			if (strpos($mailContent, "{{userName}}") !== false) {
				$mailContent = str_replace("{{userName}}", $userName, $mailContent);
			}

			if (strpos($mailContent, "{{password}}") !== false) {
				$mailContent = str_replace("{{password}}", $password, $mailContent);
			}

			if (strpos($mailContent, "{{appLink}}") !== false) {
				$mailContent = str_replace("{{appLink}}", $appLink, $mailContent);
			}

			if (strpos($mailContent, "{{name}}") !== false) {
				$mailContent = str_replace("{{name}}", $name, $mailContent);
			}

			$from = $this->fromEmail;
			$to = $email;
			$subject = $tempData[0]->subjectOfEmail;
			$msg = $mailContent;
			$fromName = $this->fromName;
			if(!$this->config->item('development'))
			{
				$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
			}// $isEmailSend=true;

			return $isEmailSend;
		}else{
			return false;
		}
	}

	public function resetPasswordRequest()
	{	
		$this->response->decodeRequest(); 
		$adminDetails['email'] =$this->validatedata->validate('email','Email-Id',false,'',array());
		
		$email = array('email'=>$adminDetails['email']);
		
		$checkEmail = $this->CommonModel->getMasterDetails("admin", $select = "*", $email);
		if (empty($checkEmail)) {
			$status['msg'] = $this->systemmsg->getErrorCode(298);
			$status['statusCode'] = 298;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$otp = rand(100000, 999999); 
			$adminID = $checkEmail[0]->adminID;
			$adminEextraDetails = array("otp" => $otp);
			$adminEextraDetails['otp_exp_time'] = date('Y-m-d H:i:s', strtotime('+30 minutes'));
			$verificationCode = md5($otp);
			$verificationCode = substr($verificationCode,0,10);

			$baseURL = $this->config->item("app_url")."#userVerification?&vfcode=".$verificationCode."&auth-id=".$adminID;
		
			$isupdated = $this->SearchAdminModel->forgotPassword($adminEextraDetails, $adminID);
			if (!$isupdated) {
				$status['msg'] = $this->systemmsg->getErrorCode(296);
				$status['statusCode'] = 296;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} else {
				$where = array("tempName" => "forgotPasswordOTPSendTemp"  , "status"=>'active');
				

				$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
				if(isset($tempData) && !empty($tempData)){

					$mailContent = $tempData[0]->emailContent;

					if (strpos($mailContent, "{{userName}}") !== false) {
						$mailContent = str_replace("{{userName}}", $checkEmail[0]->name, $mailContent);
					}

					if (strpos($mailContent, "{{email}}") !== false) {
						$mailContent = str_replace("{{email}}", $checkEmail[0]->email, $mailContent);
					}
					
					if (strpos($mailContent, "{{appLink}}") !== false) {
						$mailContent = str_replace("{{appLink}}", $baseURL, $mailContent);
					}
					$from = $this->fromEmail;
					$subject = $tempData[0]->subjectOfEmail;
					$msg = $mailContent;
					$fromName = $this->fromName;
					$to = $checkEmail[0]->email;
					
					$isEmailSend = false;
					if(!$this->config->item('development'))
					{
						$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
					}
					if ($isEmailSend) {
						$status['data'] = array("userID" => $adminID);
						$status['msg'] = $this->systemmsg->getSucessCode(298);
						$status['statusCode'] = 400;
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$status['msg'] = $this->systemmsg->getErrorCode(296);
						$status['statusCode'] = 296;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}					
					
				}else{
					$status['msg'] = $this->systemmsg->getErrorCode(298);
					$status['statusCode'] = 298;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
	}

	public function sendUpdatePassordByAdmin($email = '', $userName = '', $password = '', $appLink = '', $name = '')
	{
		$where = array("tempName" => "updatePasswordByAdminTemp"  , "status"=>'active');
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
		
		if(isset($tempData) && !empty($tempData)){

			$mailContent = $tempData[0]->emailContent;

			if (strpos($mailContent, "{{userName}}") !== false) {
				$mailContent = str_replace("{{userName}}", $userName, $mailContent);
			}

			if (strpos($mailContent, "{{password}}") !== false) {
				$mailContent = str_replace("{{password}}", $password, $mailContent);
			}

			if (strpos($mailContent, "{{appLink}}") !== false) {
				$mailContent = str_replace("{{appLink}}", $appLink, $mailContent);
			}

			if (strpos($mailContent, "{{name}}") !== false) {
				$mailContent = str_replace("{{name}}", $name, $mailContent);
			}

			$from = $this->fromEmail;
			$to = $email;
			$subject = $tempData[0]->subjectOfEmail;
			$msg = $mailContent;
			$fromName = $this->fromName;
			$isEmailSend = false;
			if(!$this->config->item('development'))
			{
				$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
			}
			return $isEmailSend;
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(299);
			$status['statusCode'] = 299;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function sendUserNameAndPassword($email = '', $userName = '', $password = '', $appLink = '', $name = '')
	{
		$where = array("tempName" => "accountVerificationTemplate" , "status"=>'active');
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
		if(isset($tempData) && !empty($tempData)){
			$mailContent = $tempData[0]->emailContent;
			if (strpos($mailContent, "{{userName}}") !== false) {
				$mailContent = str_replace("{{userName}}", $userName, $mailContent);
			}

			if (strpos($mailContent, "{{password}}") !== false) {
				$mailContent = str_replace("{{password}}", $password, $mailContent);
			}

			if (strpos($mailContent, "{{appLink}}") !== false) {
				$mailContent = str_replace("{{appLink}}", $appLink, $mailContent);
			}

			if (strpos($mailContent, "{{name}}") !== false) {
				$mailContent = str_replace("{{name}}", $name, $mailContent);
			}
			$from = $this->fromEmail;
			$to = $email;
			$subject = $tempData[0]->subjectOfEmail;
			$msg = $mailContent;
			$fromName = $this->fromName;
			$isEmailSend = false;
			if(!$this->config->item('development'))
			{
				$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
			}
			return $isEmailSend;
		}else
		{
			$status['msg'] = $this->systemmsg->getErrorCode(300);
			$status['statusCode'] = 300;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	
	// SEND ACCOUNTVERIFICATION EMAIL 
	public function sendAccountVerification($email = '', $userName = '', $verification_code='',$appLink = '', $name = '')
	{
		$where = array("tempName" => "accountVerificationTemplate" , "status"=>'active');
		$appLink = '<a href="'.$appLink.'"> Verify Account Here </a>';
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
		
		if(isset($tempData) && !empty($tempData)){
		
			$mailContent = $tempData[0]->emailContent;
			if (strpos($mailContent, "{{userName}}") !== false) {
				$mailContent = str_replace("{{userName}}", $userName, $mailContent);
			}

			if (strpos($mailContent, "{{appLink}}") !== false) {
				$mailContent = str_replace("{{appLink}}", $appLink, $mailContent);
			}

			if (strpos($mailContent, "{{name}}") !== false) {
				$mailContent = str_replace("{{name}}", $name, $mailContent);
			}
			$from = $this->fromEmail;
			$to = $email;
			$subject = $tempData[0]->subjectOfEmail;
			$msg = $mailContent;
			$fromName = $this->fromName;
			$sendMailDetails =false;
			if(!$this->config->item('development'))
			{
				$sendMailDetails = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
			}	
			return $sendMailDetails;
		}else
		{
			$status['msg'] = $this->systemmsg->getErrorCode(300);
			$status['statusCode'] = 300;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	// VALIDATE OTP
	public function validateOtp($adminID = '')
	{
		$adminDetails = $adminEextraDetails = array();
		$where = array();
		$where['adminID'] = $adminID;
		$this->response->decodeRequest();
		$otp = $this->validatedata->validate('otp', 'otp', true, '', array());
		$password = $this->validatedata->validate('password', 'password', true, '', array());
		$confirmPassword = $this->validatedata->validate('confirmPassword', 'confirmPassword', true, '', array());
		$getOtp = $this->CommonModel->getMasterDetails("admin", $select = "otp", $where);
		if (($otp == $getOtp[0]->otp && $otp != 0)) {
			if ($password == $confirmPassword) {
				$adminEextraDetails['otp'] = 0;
				$isupdated = $this->SearchAdminModel->updateAdminDetails($adminEextraDetails, $adminID);
				$this->updatePassword($adminID, $password);
			} else {
				$status['msg'] = $this->systemmsg->getErrorCode(301); ;
				$status['statusCode'] = 301;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(302);
			$status['statusCode'] = 302;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function getSystemUserList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$t = $t ?? '';
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec["email like  "] = "'%" . $text . "%'";
		}
		$updateAns = $this->CommonModel->GetMasterListDetails("adminID,email", "admin", $wherec);
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}
	public function getSystemUserNameList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$t = $t ?? '';
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec["name like  "] = "'%" . $text . "%'";
		}
		$updateAns = $this->CommonModel->GetMasterListDetails("adminID,name,photo", "admin", $wherec);
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}
	public function updateToken()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = trim($this->input->post("adminID"));
		$fToken = trim($this->input->post("fToken"));
		$adminDetails = array();
		$where = array();
		$where['adminID'] = $adminID;
		$adminDetails['fToken'] = $fToken;
		$isupdated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
		if (!$isupdated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {

			$status['msg'] = "Token Updated Successfully";
			$status['statusCode'] = 400;
			$status['data'] = array();
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}
	
	public function setprofilePic($memberID='') {  
        $this->load->library('slim');
		$images = $this->slim->getImages();

		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'profile_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
		// No image found under the supplied input name
        if ($images === false) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }

        // Should always be one image (when posting async), so we'll use the first on in the array (if available)
        $image = array_shift($images);

        if (!isset($image)) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));

            return;
        }

        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));

            return;
        }

        // if we've received output data save as file
        if (isset($image['output']['data'])) {

            // get the name of the file
            $name = $image['output']['name'];

            // get the crop data for the output image
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/profilePic/');
        }

        if (isset($image['input']['data'])) {

            // get the name of the file
            $name = $image['input']['name'];

            // get the crop data for the output image
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$_SERVER['DOCUMENT_ROOT'].'/LMS/website/uploads/profilephoto/'.$memberID.'/profilePic/');

        }

        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );

        if (isset($output) && isset($input)) {

            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );

            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
				
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }

        $updateDate = date("Y/m/d H:i:s");
        $data = array("photo"=>$imagename);
       
       $isrename = rename($this->config->item("mediaPATH").'profilephoto/'.$memberID.'/profilePic/'.$response['file'],$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/profilePic/' . $imagename);
	   $where = array("adminID" => $memberID);
       $isupdate = $this->CommonModel->updateMasterDetails('admin',$data,$where);
        /*if (isset($_SESSION['USER']['profile_pic']) && !empty($_SESSION['USER']['profile_pic'])) {
            if ($_SESSION['USER']['profile_pic'] != 'default') {
                
                if(file_exists($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic'])){
                    unlink($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic']);
                }
               
            }
        }*/
       $this->slim->outputJSON($response);
    }
	public function setLogo($memberID='') {  
    //    print_r($memberID);exit;
        $this->load->library('slim');
		$images = $this->slim->getImages();

		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'logo_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
		// No image found under the supplied input name
        if ($images === false) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }

        // Should always be one image (when posting async), so we'll use the first on in the array (if available)
        $image = array_shift($images);

        if (!isset($image)) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));

            return;
        }

        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));

            return;
        }

        // if we've received output data save as file
        if (isset($image['output']['data'])) {

            // get the name of the file
            $name = $image['output']['name'];

            // get the crop data for the output image
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/logo/');
        }

        if (isset($image['input']['data'])) {

            // get the name of the file
            $name = $image['input']['name'];

            // get the crop data for the output image
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/logo/');

        }

        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );

        if (isset($output) && isset($input)) {

            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );

            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
				
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }

        $updateDate = date("Y/m/d H:i:s");
        $data = array("logo"=>$imagename);
       
       $isrename = rename($this->config->item("mediaPATH").'profilephoto/'.$memberID.'/logo/'.$response['file'],$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/logo/' . $imagename);
	   $where = array("adminID" => $memberID);
       $isupdate = $this->CommonModel->updateMasterDetails('admin',$data,$where);
        /*if (isset($_SESSION['USER']['profile_pic']) && !empty($_SESSION['USER']['profile_pic'])) {
            if ($_SESSION['USER']['profile_pic'] != 'default') {
                
                if(file_exists($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic'])){
                    unlink($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic']);
                }
               
            }
        }*/
       $this->slim->outputJSON($response);
    }
	public function setCoverImage($memberID='') {  
    //    print_r($memberID);exit;
        $this->load->library('slim');
		$images = $this->slim->getImages();

		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'cover_image_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
		// No image found under the supplied input name
        if ($images === false) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }

        // Should always be one image (when posting async), so we'll use the first on in the array (if available)
        $image = array_shift($images);

        if (!isset($image)) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));

            return;
        }

        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));

            return;
        }

        // if we've received output data save as file
        if (isset($image['output']['data'])) {

            // get the name of the file
            $name = $image['output']['name'];

            // get the crop data for the output image
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/coverImage/');
        }

        if (isset($image['input']['data'])) {

            // get the name of the file
            $name = $image['input']['name'];

            // get the crop data for the output image
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/coverImage/');

        }

        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );

        if (isset($output) && isset($input)) {

            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );

            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
				
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }

        $updateDate = date("Y/m/d H:i:s");
        $data = array("profile_cover_img"=>$imagename);
       
       $isrename = rename($this->config->item("mediaPATH").'profilephoto/'.$memberID.'/coverImage/'.$response['file'],$this->config->item("mediaPATH").'profilephoto/'.$memberID.'/coverImage/' . $imagename);
	   $where = array("adminID" => $memberID);
       $isupdate = $this->CommonModel->updateMasterDetails('admin',$data,$where);
        /*if (isset($_SESSION['USER']['profile_pic']) && !empty($_SESSION['USER']['profile_pic'])) {
            if ($_SESSION['USER']['profile_pic'] != 'default') {
                
                if(file_exists($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic'])){
                    unlink($_SERVER["DOCUMENT_ROOT"].'/uploads/profilePic/' . $_SESSION['USER']['profile_pic']);
                }
               
            }
        }*/
       $this->slim->outputJSON($response);
    }
	public function removeProfilePicFile($userID='') 
	{
		$where = array("adminID" => $userID);
		$path = $this->config->item("mediaPATH").'profilephoto/'.$userID;
		$pic_type = $this->input->post("pic_type");
		$formData = array();
		if ($pic_type == 'coverImage') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/coverImage/';
			$images = $this->CommonModel->getMasterDetails('admin','profile_cover_img',$where);
			$image = $images[0]->profile_cover_img;
			$formData['profile_cover_img'] = '';
		}
		if ($pic_type == 'profilePic') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/profilePic/';
			$images = $this->CommonModel->getMasterDetails('admin','photo',$where);
			$image = $images[0]->photo;
			$formData['photo'] = '';
		}
		if ($pic_type == 'logo') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/logo/';
			$images = $this->CommonModel->getMasterDetails('admin','logo',$where);
			$image = $images[0]->logo;
			$formData['logo'] = '';
		}

		if (isset($image) && !empty($image)) {
			if (file_exists($path . $image)) {
				$formData['adminID'] = $userID;
				$iscreated = $this->CommonModel->updateMasterDetails("admin",$formData,array('adminID'=>$userID));
				unlink($path . $image);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			} else {
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			}
		}
	}
	public function userGallery($memberID='') {  
    //    print_r($memberID);exit;
        $this->load->library('slim');
		$images = $this->slim->getImages();

		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'gallery_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
		// No image found under the supplied input name
        if ($images === false) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }

        // Should always be one image (when posting async), so we'll use the first on in the array (if available)
        $image = array_shift($images);

        if (!isset($image)) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));

            return;
        }

        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {

            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));

            return;
        }

        // if we've received output data save as file
        if (isset($image['output']['data'])) {

            // get the name of the file
            $name = $image['output']['name'];

            // get the crop data for the output image
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'userGallery/'.$memberID.'/');
        }

        if (isset($image['input']['data'])) {

            // get the name of the file
            $name = $image['input']['name'];

            // get the crop data for the output image
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'userGallery/'.$memberID.'/');

        }

        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );

        if (isset($output) && isset($input)) {

            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );

            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
				
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }

        $updateDate = date("Y/m/d H:i:s");


        $data = array();
		$data["user_id"] = $memberID;
		$data["file_name"] = $imagename;
		$data["file_type"] = '';
		$data["created_by"] = $memberID;
		$data["created_date"] = $updateDate;
		$data["record_type"] = 'gallery';

		$f = $this->config->item("mediaPATH").'userGallery/'.$memberID.'/' . $imagename;
		$nf = $this->config->item("mediaPATH").'userGallery/'.$memberID.'/'.$response['file'];
		// print_r($nf.'  =  '.$f);
		if (file_exists($nf)) {
		
			$isrename = rename($this->config->item("mediaPATH").'userGallery/'.$memberID.'/'.$response['file'],$this->config->item("mediaPATH").'userGallery/'.$memberID.'/' . $imagename);
		}else
		{
			print_r('not found');
		}
       
       $isupdate = $this->CommonModel->saveMasterDetails('user_gallery',$data);
       $this->slim->outputJSON($response);
    }
	public function deleteUploadedPic($userID='') 
	{
		$where = array("adminID" => $userID);
		$path = $this->config->item("mediaPATH").'profilephoto/'.$userID;
		$pic_type = $this->input->post("pic_type");
		$formData = array();
		if ($pic_type == 'coverImage') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/coverImage/';
			$images = $this->CommonModel->getMasterDetails('admin','profile_cover_img',$where);
			$image = $images[0]->profile_cover_img;
			$formData['profile_cover_img'] = '';
		}
		if ($pic_type == 'profilePic') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/profilePic/';
			$images = $this->CommonModel->getMasterDetails('admin','photo',$where);
			$image = $images[0]->photo;
			$formData['photo'] = '';
		}
		if ($pic_type == 'logo') {
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/logo/';
			$images = $this->CommonModel->getMasterDetails('admin','logo',$where);
			$image = $images[0]->logo;
			$formData['logo'] = '';
		}

		if (isset($image) && !empty($image)) {
			if (file_exists($path . $image)) {
				$formData['adminID'] = $userID;
				$iscreated = $this->CommonModel->updateMasterDetails("admin",$formData,array('adminID'=>$userID));
				unlink($path . $image);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			} else {
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			}
		}
	}
	public function verifyUser()
	{
		$adminDetails = $adminEextraDetails = array();
		$where = array();
		$this->response->decodeRequest();
		$adminID = $this->validatedata->validate('userID', 'userID', true, '', array());
		$password = $this->validatedata->validate('password', 'password', true, '', array());
		
		$confirmPassword = $this->validatedata->validate('confirmPassword', 'confirmPassword', true, '', array());
		$md_vfCode =  $this->validatedata->validate('vfcode', 'vfcode', true, '', array());
		$where['adminID'] = $adminID;

		if(!isset($adminID) && empty($adminID)){
			$status['msg'] = $this->systemmsg->getErrorCode(304) ;
			$status['statusCode'] = 304;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}else{
			$getOtp = $this->CommonModel->getMasterDetails("admin", $select = "otp", $where);
			if(isset($getOtp) && !empty($getOtp))
			{
				$dbotp = md5($getOtp[0]->otp);	
				$dbotp = substr($dbotp,0,10);
				
				if (($md_vfCode == $dbotp && $dbotp != 0)) {

					if ($password == $confirmPassword) {
						$adminEextraDetails['otp'] = 0;
						$adminEextraDetails['isverified'] = 'Y';
						$isupdated = $this->SearchAdminModel->updateAdminDetails($adminEextraDetails, $adminID);
						$this->updatePassword($adminID, $confirmPassword);
					} else {
						$status['msg'] = $this->systemmsg->getErrorCode(301) ;
						$status['statusCode'] = 301;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
				} else {
					$status['msg'] = $this->systemmsg->getErrorCode(304) ;
					$status['statusCode'] = 304;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}else{	
				$status['msg'] = $this->systemmsg->getErrorCode(305);
				$status['statusCode'] = 305;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);								
			}
		}
	}

	public function updatePassword($adminID = '', $password = '')
	{
		$adminDetails = array();
		$where = array();
		$where['adminID'] = $adminID;
		$adminDetails['password'] = md5($password);
		$adminDetails['password'] = substr($adminDetails['password'] ,0,30);
		$isupdated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
		if (!$isupdated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$where = array("adminID" => $adminID);
			$infoData = $this->CommonModel->getMasterDetails('admin', '', $where);
			if(!$this->config->item('development')){
				if(isset($infoData) && !empty($infoData))
				{
					$this->sendUpdatedUserNameAndPassword($infoData[0]->email,$infoData[0]->userName,$password, $this->config->item("app_url"),$infoData[0]->name);
				}
			}
			// public function sendUpdatedUserNameAndPassword($email = '', $userName = '', $password = '', $appLink = '', $name = '')
			$status['msg'] =  $this->systemmsg->getSucessCode(425);
			$status['statusCode'] = 425;
			$status['data'] = array();
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	public function getAdminDetail($adminID = '')
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$today =date("Y-m-d");

		if($method == "POST" || $method == "PUT"){
			$adminDetails = $adminEextraDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$adminDetails['password'] = '';
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			$wherec = array("roleID" => $adminDetails['roleID']);
			$roleDetails = $this->CommonModel->getMasterDetails("user_role_master", $select = "role", $wherec);
			$adminDetails['roleOfUser'] = $roleDetails[0]->role;
			$adminDetails['created_date'] = $updateDate;
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			$adminDetails['otp'] = rand(100000, 999999); 
			$adminDetails['otp_exp_time'] = date('Y-m-d H:i:s', strtotime('+30 minutes'));
			$adminDetails['isVerified'] = 'N'; 
			$adminDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
			$adminDetails['contactNo'] = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
			$adminDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo', 'Whatsapp No', false, '', array());
			$adminDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth', 'Date Of Birth', false, '', array());
			
			if(isset($adminDetails['dateOfBirth']) && !empty($adminDetails['dateOfBirth']) && $adminDetails['dateOfBirth'] !="0000-00-00"){
				$adminDetails['dateOfBirth'] = str_replace("-","-",$adminDetails['dateOfBirth']);
				$adminDetails['dateOfBirth'] = date("Y-m-d",strtotime($adminDetails['dateOfBirth']));
			}
			
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$password = $this->validatedata->validate('password', 'Password', false, '', array());
			$adminDetails['password'] = md5($password);
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			// $adminDetails['company_id'] = $this->validatedata->validate('company_id', 'company_id', true, '', array());
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			
			switch ($method) {
				case "PUT": {			
						$this->db->trans_start();
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						$where1 = array("contactNo" => $adminDetails['contactNo']);
						$userMobile = $this->CommonModel->getMasterDetails('admin', '', $where1);
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);
						
						if (!empty($db_userName)) {
							$status['msg'] =  $this->systemmsg->getErrorCode(297);
							$status['statusCode'] = 297;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userEmail)) {
							$status['msg'] = $this->systemmsg->getErrorCode(278);
							$status['statusCode'] = 278;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userMobile)) {
							$status['msg'] = $this->systemmsg->getErrorCode(279);
							$status['statusCode'] = 279;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$iscreated = $this->SearchAdminModel->saveAdminDetails($adminDetails);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$verificationCode = md5($adminDetails['otp']);
							$verificationCode = substr($verificationCode,0,10);
							$adminID = $this->SearchAdminModel->getInsertedID();
							$baseURL = $this->config->item("app_url")."#userVerification?&vfcode=".$verificationCode."&auth-id=".$adminID;
								if ($adminDetails['status'] == "Active") {
									$sendEmail = $this->sendAccountVerification($adminDetails['email'], $adminDetails['userName'], $verificationCode, $baseURL, $adminDetails['name']);
									if ($sendEmail) {
										$updateStatus = $this->SearchAdminModel->updateAdminDetails($array = array("isEmailSend" => "Y"), $adminID);
										$this->db->trans_commit();
										$status['msg'] = $this->systemmsg->getSucessCode(400);
										$status['statusCode'] = 400;
										$status['data'] = array();
										$status['flag'] = 'S';
										$this->response->output($status, 200);
									}else{
										$this->db->trans_rollback();
										$status['msg'] = $this->systemmsg->getErrorCode(296);
										$status['statusCode'] = 296;
										$status['data'] = array();
										$status['flag'] = 'F';
										$this->response->output($status, 200);
									}
								}
						}
						break;
					}
				case "POST": {
						
						$updateDate = date("Y/m/d H:i:s");
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);
						// print_r($adminID);exit;
						// add dynamic feild data
						$fieldData = $this->datatables->mapDynamicFeilds("usersList",$this->input->post());
						$adminDetails = array_merge($fieldData, $adminDetails);
						if (!empty($db_userName) && $db_userName[0]->adminID != $adminID) {
							$status['msg'] =  $this->systemmsg->getErrorCode(297);
							$status['statusCode'] = 297;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						
						if (!empty($userEmail)) {
							$isEqual = $userEmail[0]->adminID != $adminID ? true : false;	
							if ($isEqual) {
								$status['msg'] = $this->systemmsg->getErrorCode(278);
								$status['statusCode'] = 278;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
						}
						// print_r($adminDetails);exit;
						$iscreated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						}
						break;
					}
				default: {
					
						break;
					}
			}
		}else{
			if($adminID ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$join = array();
			// $jkey = count($join)+1;
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="user_extra_details";
			// $join[$jkey]['alias'] ="u";
			// $join[$jkey]['key1'] ="adminID";
			// $join[$jkey]['key2'] ="adminID";

			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="user_role_master";
			$join[$jkey]['alias'] ="r";
			$join[$jkey]['key1'] ="roleID";
			$join[$jkey]['key2'] ="roleID";

			$where = array("adminID" => $adminID);
			$adminHistory = $this->CommonModel->getMasterDetails('admin', '', $where);
				if (isset($adminHistory) && !empty($adminHistory)) {

					$status['data'] = $adminHistory;
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				} else {

					$status['msg'] = $this->systemmsg->getErrorCode(227);
					$status['statusCode'] = 227;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
		}
	}

	public function setModuleDefaultView()
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();

		$json = $this->input->post('jsonForm');
		$adminID = $this->input->post('SadminID');
		$adminDetails['user_setting'] = $json;

		// print_r($json);exit;
		// print_r($adminDetails);exit;
		$iscreated = $this->CommonModel->updateMasterDetails('admin',$adminDetails,array('adminID'=>$adminID));
		if (!$iscreated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] = array();
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	public function getAdmiDetails($adminID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();

		$method = $this->input->method(TRUE);
		$today =date("Y-m-d");

		if($method == "POST" || $method == "PUT"){
			$adminDetails = $adminEextraDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$adminDetails['password'] = '';
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			$wherec = array("roleID" => $adminDetails['roleID']);
			$roleDetails = $this->CommonModel->getMasterDetails("user_role_master", $select = "role", $wherec);
			$adminDetails['roleOfUser'] = $roleDetails[0]->role;
			$adminDetails['created_date'] = $updateDate;
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			$adminDetails['otp'] = rand(100000, 999999); 
			$adminDetails['otp_exp_time'] = date('Y-m-d H:i:s', strtotime('+30 minutes'));
			$adminDetails['isVerified'] = 'N'; 
			$adminDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
			$adminDetails['contactNo'] = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
			$adminDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo', 'Whatsapp No', false, '', array());
			$adminDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth', 'Date Of Birth', false, '', array());
			if(isset($adminDetails['dateOfBirth']) && !empty($adminDetails['dateOfBirth']) && $adminDetails['dateOfBirth'] !="0000-00-00"){
				$adminDetails['dateOfBirth'] = str_replace("-","-",$adminDetails['dateOfBirth']);
				$adminDetails['dateOfBirth'] = date("Y-m-d",strtotime($adminDetails['dateOfBirth']));
			}
			$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
			$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
			$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
			$adminDetails['password'] = $this->validatedata->validate('password', 'Password', false, '', array());
			$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$adminDetails['is_approver'] = $this->validatedata->validate('is_approver', 'is_approver', true, '', array());
			$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
			$adminDetails['company_id'] = $this->validatedata->validate('company_id', 'company_id', true, '', array());
			
			switch ($method) {
				case "PUT": {			
						$this->db->trans_start();
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						$where1 = array("contactNo" => $adminDetails['contactNo']);
						$userMobile = $this->CommonModel->getMasterDetails('admin', '', $where1);
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);

						// add dynamic feild data
						$fieldData = $this->datatables->mapDynamicFeilds("usersList",$this->input->post());
						$adminDetails = array_merge($fieldData, $adminDetails);
						
						if (!empty($db_userName)) {
							$status['msg'] = $this->systemmsg->getErrorCode(297);
							$status['statusCode'] = 297;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userEmail)) {
							$status['msg'] = $this->systemmsg->getErrorCode(278);
							$status['statusCode'] = 278;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						if (!empty($userMobile)) {
							$status['msg'] = $this->systemmsg->getErrorCode(279);
							$status['statusCode'] = 279;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$iscreated = $this->SearchAdminModel->saveAdminDetails($adminDetails);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$verificationCode = md5($adminDetails['otp']);
							$verificationCode = substr($verificationCode,0,10);
							$adminID = $this->SearchAdminModel->getInsertedID();
							$baseURL = $this->config->item("app_url")."#userVerification?&vfcode=".$verificationCode."&auth-id=".$adminID;
							print_r($baseURL);
							if ($adminDetails['status'] == "Active") {
								$sendEmail = $this->sendAccountVerification($adminDetails['email'], $adminDetails['userName'], $verificationCode, $baseURL, $adminDetails['name']);
								print_r($sendEmail);
								if ($sendEmail) {
									$updateStatus = $this->SearchAdminModel->updateAdminDetails($array = array("isEmailSend" => "Y"), $adminID);
									$this->db->trans_commit();
									$status['msg'] = $this->systemmsg->getSucessCode(400);
									$status['statusCode'] = 400;
									$status['data'] = array();
									$status['flag'] = 'S';
									$this->response->output($status, 200);
								}else{
									$this->db->trans_rollback();
									$status['msg'] = $this->systemmsg->getErrorCode(296);
									$status['statusCode'] = 296;
									$status['data'] = array();
									$status['flag'] = 'F';
									$this->response->output($status, 200);
								}
							}
						}
						break;
					}
				case "POST": {
						$updateDate = date("Y/m/d H:i:s");
						$where2 = array("userName" => $adminDetails['userName']);
						$db_userName = $this->CommonModel->getMasterDetails('admin', '', $where2);
						
						// add dynamic feild data
						$fieldData = $this->datatables->mapDynamicFeilds("usersList",$this->input->post());
						$adminDetails = array_merge($fieldData, $adminDetails);
						
						if (!empty($db_userName) ){
							if($db_userName[0]->adminID != $adminID) {
				
								$status['msg'] = $this->systemmsg->getErrorCode(297);
								$status['statusCode'] = 297;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
						}
						$where = array("email" => $adminDetails['email']);
						$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
						if (!empty($userEmail)) {
							$isEqual = $userEmail[0]->adminID != $adminID ? true : false;	
							if ($isEqual) {
								$status['msg'] = $this->systemmsg->getErrorCode(278);
								$status['statusCode'] = 278;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
						}
						// print_r($adminDetails);exit;
						$iscreated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						}
						break;
					}
				default: {
					
						break;
					}
			}
		}else{
			if($adminID ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			
			$this->menuID = $this->input->post('menuId');
			$this->filters->menuID = $this->menuID;
			
			$this->filters->getMenuData();
			// print_r($adminID);exit;
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="u";
			$join[$jkey]['key1'] ="adminID";
			$join[$jkey]['key2'] ="adminID";

			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="user_role_master";
			$join[$jkey]['alias'] ="r";
			$join[$jkey]['key1'] ="roleID";
			$join[$jkey]['key2'] ="roleID";

			$other = array();
			$wherec["t.adminID"] = "=".$adminID;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}else{
				$selectC = "t.*,".$selectC;	
			}
		
			$adminHistory = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());	
			if (isset($adminHistory) && !empty($adminHistory)) {

				$status['data'] = $adminHistory;
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {

				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
}