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
		$this->load->library("Emails");

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
		

		switch ($method) {
			case "PUT": {
					$adminDetails = $adminEextraDetails = array();
					$updateDate = date("Y/m/d H:i:s");
					$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
					$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
					$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
					$adminDetails['photo'] = $this->validatedata->validate('photo', 'Photo', false, '', array());
					$adminDetails['password'] = rand(100000, 999999);
					// $adminDetails['password'] = $this->validatedata->validate('password','Password',true,'',array());
					$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
					$wherec = array("roleID" => $adminDetails['roleID']);
					$roleDetails = $this->CommonModel->getMasterDetails("user_role_master", $select = "role", $wherec);
					$adminEextraDetails['roleOfUser'] = $roleDetails[0]->role;
					$adminDetails['created_date'] = $updateDate;
					$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
					$contactNo = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
						
					// $where = array("email" => $adminDetails['email']);
					// $userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
					// $where1 = array("contactNo" => $contactNo);
					// $userMobile = $this->CommonModel->getMasterDetails('user_extra_details', '', $where1);
					// if (!empty($userEmail)) {
					// 	$status['msg'] = $this->systemmsg->getErrorCode(278);
					// 	$status['statusCode'] = 278;
					// 	$status['data'] = array();
					// 	$status['flag'] = 'F';
					// 	$this->response->output($status, 200);
					// }
					// if (!empty($userMobile)) {
					// 	$status['msg'] = $this->systemmsg->getErrorCode(279);
					// 	$status['statusCode'] = 279;
					// 	$status['data'] = array();
					// 	$status['flag'] = 'F';
					// 	$this->response->output($status, 200);
					// }
					$iscreated = $this->SearchAdminModel->saveAdminDetails($adminDetails);
					if (!$iscreated) {

						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {

						$adminEextraDetails['adminID'] = $this->SearchAdminModel->getInsertedID();
						$adminEextraDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
						$adminEextraDetails['contactNo'] = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
						$adminEextraDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo', 'Whatsapp No', false, '', array());
						$adminEextraDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth', 'Date Of Birth', false, '', array());
						// $adminEextraDetails['myTarget'] = $this->validatedata->validate('myTarget', 'my Target', true, '', array());
						$adminEextraDetails['created_date'] = $updateDate;

						if(isset($adminEextraDetails['dateOfBirth']) && !empty($adminEextraDetails['dateOfBirth']) && $adminEextraDetails['dateOfBirth'] !="0000-00-00"){
							$adminEextraDetails['dateOfBirth'] = str_replace("-","-",$adminEextraDetails['dateOfBirth']);
							$adminEextraDetails['dateOfBirth'] = date("Y-m-d",strtotime($adminEextraDetails['dateOfBirth']));
						}
						// print_r($adminEextraDetails);exit;
						$iscreated = $this->SearchAdminModel->saveAdminExtraDetails($adminEextraDetails);
						$baseURL = $this->config->item("app_url");
						$sendEmail = false;
						// if ($adminDetails['status'] == "Active") {
						// 	$sendEmail = $this->sendUserNameAndPassword($adminDetails['email'], $adminDetails['userName'], $adminDetails['password'], $baseURL, $adminDetails['name']);
						// 	if ($sendEmail) {
						// 		$updateStatus = $this->SearchAdminModel->updateAdminExtraDetails($array = array("isEmailSend" => "Y"), $adminEextraDetails['adminID']);
						// 	}
						// }
						if ($iscreated) {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
					break;
				}
			case "POST": {
					$adminDetails = array();
					$updateDate = date("Y/m/d H:i:s");
					$adminDetails['name'] = $this->validatedata->validate('name', 'Admin Name', true, '', array());
					$adminDetails['userName'] = $this->validatedata->validate('userName', 'User Name', true, '', array());
					$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
					$adminDetails['password'] = $this->validatedata->validate('password', 'Password', true, '', array());
					$adminDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
					$adminDetails['roleID'] = $this->validatedata->validate('roleID', 'User Role', true, '', array());
					$adminDetails['photo'] = $this->validatedata->validate('photo', 'Photo', false, '', array());
					$contactNo = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());
					$where = array("email" => $adminDetails['email']);
					$userEmail = $this->CommonModel->getMasterDetails('admin', '', $where);
					$where1 = array("contactNo" => $contactNo);
					$userMobile = $this->CommonModel->getMasterDetails('user_extra_details', '', $where1);
					// print_r($userMobile);	
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
					if (!empty($userMobile)) {
						$isEqual = $userMobile[0]->adminID != $adminID ? true : false;
						if ($isEqual) {
							$status['msg'] = $this->systemmsg->getErrorCode(279);
							$status['statusCode'] = 279;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
					$where2 = array("adminID" => $adminID);
					$userData = $this->CommonModel->getMasterDetails('admin', '', $where2);
					$isEqual = $userData[0]->password != $adminDetails['password'] ? true : false;
					// if ($isEqual) {

					// 	$isSend = $this->sendUpdatedUserNameAndPassword($adminDetails['email'], $adminDetails['userName'], $adminDetails['password'], $this->config->item("app_url"), $adminDetails['name']);
					// }

					$iscreated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);

					if (!$iscreated) {
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$adminEextraDetails = array();
						$adminEextraDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
						// print_r($adminEextraDetails['address']);exit();

						$adminEextraDetails['contactNo'] = $this->validatedata->validate('contactNo', 'Contact No', true, '', array());

						$adminEextraDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo', 'Whatsapp No', false, '', array());

						$adminEextraDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth', 'Date Of Birth', false, '', array());
						if(isset($adminEextraDetails['dateOfBirth']) && !empty($adminEextraDetails['dateOfBirth']) && $adminEextraDetails['dateOfBirth'] !="0000-00-00"){
							$adminEextraDetails['dateOfBirth'] = str_replace("-","-",$adminEextraDetails['dateOfBirth']);
							$adminEextraDetails['dateOfBirth'] = date("Y-m-d",strtotime($adminEextraDetails['dateOfBirth']));
						}
						// $adminEextraDetails['myTarget'] = $this->validatedata->validate('myTarget', 'my Target', true, '', array());
						$adminEextraDetails['created_date'] = $updateDate;

						$wherec = array("roleID" => $adminDetails['roleID']);

						$roleDetails = $this->CommonModel->getMasterDetails("user_role_master", $select = "role", $wherec);

						$adminEextraDetails['roleOfUser'] = $roleDetails[0]->role;

						$iscreated = $this->SearchAdminModel->updateAdminExtraDetails($adminEextraDetails, $adminID);
						$adminDetails1 = $this->SearchAdminModel->getAdminDetails($adminID);


						// if ($adminDetails1[0]->status == "Active" && $adminDetails1[0]->isEmailSend == "N") {
						// 	$baseURL = $this->config->item("app_url");
						// 	$sendEmail = false;

						// 	$sendEmail = $this->sendUserNameAndPassword($adminDetails['email'], $adminDetails['userName'], $adminDetails['password'], $baseURL, $adminDetails['name']);

						// 	if ($sendEmail) {
						// 		$updateStatus = $this->SearchAdminModel->updateAdminExtraDetails($array = array("isEmailSend" => "Y"), $adminID);
						// 	}
						// }

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


					break;
				}
			default: {
					// echo $adminID;exit();
					$adminHistory = $this->SearchAdminModel->getAdminDetails($adminID);
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
					break;
				}
		}
	}


	public function sendUpdatedUserNameAndPassword($email = '', $userName = '', $password = '', $appLink = '', $name = '')
	{

		$where = array("tempName" => "sendUpdatedUserNameAndPasswordTemp");
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
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
		$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
		// $isEmailSend=true;

		return $isEmailSend;
	}

	public function sendUserNameAndPassword($email = '', $userName = '', $password = '', $appLink = '', $name = '')
	{

		$where = array("tempName" => "sendUserNamePasswordToNewUserTemp");
		$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
		$mailContent = $tempData[0]->emailContent;
		// print_r($tempData[0]->subjectOfEmail);exit;

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
		$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
		// $isEmailSend=true;

		return $isEmailSend;
	}


	public function resetPasswordRequest()
	{


		$this->response->decodeRequest();
		$adminDetails['email'] = $this->validatedata->validate('email', 'Email-Id', true, '', array());
		$email = array("email" => $adminDetails['email']);
		$checkEmail = $this->CommonModel->getMasterDetails("admin", $select = "*", $email);
		if (empty($checkEmail)) {
			$status['msg'] = "There is no user with such email";
			$status['statusCode'] = 997;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$otp = rand(1000, 9999);
			$adminID = $checkEmail[0]->adminID;
			$adminEextraDetails = array("otp" => $otp);
			$isupdated = $this->SearchAdminModel->updateAdminDetails($adminEextraDetails, $adminID);
			// print_r($adminID); exit;
			if (!$isupdated) {
				$status['msg'] = "email can not be sent";
				$status['statusCode'] = 997;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} else {
				$where = array("tempName" => "forgotPasswordOTPSendTemp");
				$tempData = $this->CommonModel->getMasterDetails('email_master', '', $where);
				$mailContent = $tempData[0]->emailContent;

				if (strpos($mailContent, "{{userName}}") !== false) {
					$mailContent = str_replace("{{userName}}", $checkEmail[0]->name, $mailContent);
				}

				if (strpos($mailContent, "{{otp}}") !== false) {
					$mailContent = str_replace("{{otp}}", $otp, $mailContent);
				}

				if (strpos($mailContent, "{{email}}") !== false) {
					$mailContent = str_replace("{{email}}", $checkEmail[0]->email, $mailContent);
				}

				$from = $this->fromEmail;
				$subject = $tempData[0]->subjectOfEmail;
				$msg = $mailContent;
				$fromName = $this->fromName;
				$to = $checkEmail[0]->email;
				$isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
				if ($isEmailSend) {
					$status['data'] = array("userID" => $adminID);
					$status['msg'] = "OTP Has been sent on your registered Email";
					$status['statusCode'] = 400;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = "email can not be sent";
					$status['statusCode'] = 997;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
	}

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
				$isupdated = $this->SearchAdminModel->updateAdminExtraDetails($adminEextraDetails, $adminID);
				$this->updatePassword($adminID, $password);
			} else {
				$status['msg'] = "Confirm password not same as password";
				$status['statusCode'] = 997;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} else {
			$status['msg'] = "InValid OTP";
			$status['statusCode'] = 997;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function updatePassword($adminID = '', $password = '')
	{
		$adminDetails = array();
		$where = array();
		$where['adminID'] = $adminID;
		$adminDetails['password'] = $password;
		$isupdated = $this->SearchAdminModel->updateAdminDetails($adminDetails, $adminID);
		if (!$isupdated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {

			$status['msg'] = "Password Updated Successfully";
			$status['statusCode'] = 400;
			$status['data'] = array();
			$status['flag'] = 'S';
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
		//print_r($wherec);
		$updateAns = $this->CommonModel->GetMasterListDetails("adminID,email", "admin", $wherec);
		// print_r($updateAns);
		// foreach ($updateAns as $hsl)
		// {
		//     $data1 = new stdClass(); = 
		// 	$data1$hsl->email;
		// 	$datas[] = $hsl->adminID;
		// 	$datas[] = 
		// }
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
		// print_r($wherec);exit;
		$updateAns = $this->CommonModel->GetMasterListDetails("adminID,name", "admin", $wherec);
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
		$isupdated = $this->SearchAdminModel->updateAdminExtraDetails($adminDetails, $adminID);
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
		//    print_r($memberID);exit;
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
		public function removeProfilePicFile($userID='') 
		{
			$where = array("adminID" => $userID);
			$images = $this->CommonModel->getMasterDetails('admin','photo',$where);
			$image = $images[0]->photo;
	
			$path = $this->config->item("mediaPATH").'profilephoto/'.$userID.'/profilePic/';
			if (isset($image) && !empty($image)) {
				if (file_exists($path . $image)) {
					$formData = array();
					$formData['adminID'] = $userID;
					$formData['photo'] = '';
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
}
