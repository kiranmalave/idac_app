<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Faq extends CI_Controller
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
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Emails");
		$where = array("infoID" => 1);
		$infoData = $this->CommonModel->getMasterDetails('info_settings', '', $where);
		$this->fromEmail = $infoData[0]->fromEmail;
		$this->fromName = $infoData[0]->fromName;
		// print_r($infoData);
	}

	public function getFaqDetailsList()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$t = $this->input->post('textSearch');
		$t = $t ?? '';
		$textSearch = trim($t);
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');

		// echo $statuscode;exit();
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "faq_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}
		// print_r($wherec);exit();
		$config["base_url"] = base_url() . "pagesDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('faq_id', "faq", $wherec);

		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if ($isAll == "Y") {
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'faq', $wherec, '', '', $join, $other);
		} else {
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'faq', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $pagesDetails;
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
		if ($pagesDetails) {
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
	public function faqData($faq_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$faqDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT" || $method == "POST") {
			$faqDetails['faq_id'] = $this->validatedata->validate('faq_id', 'FAQ ID', false, '', array());

			$faqDetails['faq_question'] = $this->validatedata->validate('faq_question', 'FAQ Question', true, '', array());

			$faqDetails['faq_answer'] = $this->validatedata->validate('faq_answer', 'FAQ Answer', true, '', array());

			$faqDetails['asked_by_name'] = $this->validatedata->validate('asked_by_name', 'Asked By Name', false, '', array());

			$faqDetails['asked_by_email'] = $this->validatedata->validate('asked_by_email', 'Asked By Email', false, '', array());

			$faqDetails['is_email_send'] = $this->validatedata->validate('is_email_send', ' Email', true, '', array());

			$faqDetails['is_Publish'] = $this->validatedata->validate('is_Publish', 'isPublish', true, '', array());

			$customerDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());

			if ($method == "PUT") {
				$faqDetails['created_by'] = $this->input->post('SadminID');
				$faqDetails['created_date'] = $updateDate;
				$faqDetails['modified_date'] = '0';

				$iscreated = $this->CommonModel->saveMasterDetails('faq', $faqDetails);
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

			if ($method == "POST") {

				$where = array('faq_id' => $faq_id);
				if (!isset($faq_id) || empty($faq_id)) {

					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$faqDetails['modified_by'] = $this->input->post('SadminID');
				$faqDetails['modified_date'] = $updateDate;

				$iscreated = $this->CommonModel->updateMasterDetails('faq', $faqDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {

					$where = array("faq_id" => $faq_id);
					$userRoleHistory = $this->CommonModel->getMasterDetails('faq', '', $where);
					if ($userRoleHistory[0]->asked_by_email != "" && !$userRoleHistory[0]->is_email_send) {
						$que = $userRoleHistory[0]->faq_question;
						$ans = $userRoleHistory[0]->faq_answer;
						$asked_by_name = $userRoleHistory[0]->asked_by_name;
						$asked_by_email = $userRoleHistory[0]->asked_by_email;
						$isSend = $this->sendEmailWithAnswer($que, $ans, $asked_by_name, $asked_by_email);
						if (!$isSend) {
							$status['msg'] = "Answer Saved But Email can't Send";
							$status['statusCode'] = 278;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						} else {
							$updateisEmailSend = array("isEmailSend" => 1);

							$where = array("faq_id" => $faq_id);
							$iscreated = $this->CommonModel->updateMasterDetails('faq', $updateisEmailSend, $where);

							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						}
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else if ($method == "DELETE") {
			$faqDetails = array();


			$where = array('faq_id' => $id);
			if (!isset($id) || empty($id)) {

				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('faq', $where);
			if (!$iscreated) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
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
		} else {

			$where = array("faq_id" => $faq_id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('faq', '', $where);

			if (isset($userRoleHistory) && !empty($userRoleHistory)) {

				$status['data'] = $userRoleHistory;
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
	public function faqDataChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");

			$changestatus = $this->CommonModel->changeMasterStatus('faq', $statusCode, $ids, 'faq_id');


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
	public function sendEmailWithAnswer($question, $answer, $asked_by_name, $email)
	{


		$where = array("tempName" => "FAQAnswerTemp");
		$emailContent = $this->CommonModel->getMasterDetails('emailMaster', '', $where);
		if (!isset($emailContent) && empty($emailContent)) {
			$status['data'] = "Email Template Not Found Named As 'FAQAnswerTemp'";
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$mailContent = str_replace("{{question}}", $question, $emailContent[0]->emailContent);
		$mailContent = str_replace("{{answer}}", $answer, $mailContent);
		$mailContent = str_replace("{{asked_by_name}}", $asked_by_name, $mailContent);

		$from = $this->fromEmail;
		$to = $email;
		$subject = $emailContent[0]->subject;
		$fromName = $this->fromName;;
		$msg = $mailContent;

		return $isEmailSend = $this->emails->sendMailDetails($from, $fromName, $to, $cc = '', $bcc = '', $subject, $msg);
	}
}
