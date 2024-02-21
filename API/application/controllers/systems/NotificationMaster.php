<?php
defined('BASEPATH') or exit('No direct script access allowed');

class NotificationMaster extends CI_Controller
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
	}

	public function getNotificationList()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$module_name = $this->input->post('module_name');		// print_r($category);exit;

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($module_name) && !empty($module_name)) {
			
			$wherec["t.module_name"] = 'IN ("' . $module_name . '")';
		}

		// $join[0]['type'] = "LEFT JOIN";
		// $join[0]['table'] = "categories";
		// $join[0]['alias'] = "c";
		// $join[0]['key1'] = "category";
		// $join[0]['key2'] = "categoryID";
		
	
		$config["base_url"] = base_url() . "notificationDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('notification_id', "notification_schema", $wherec);
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
			$notificationDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*', 'notification_schema', $wherec, '', '', $join, $other);
		} else {
			$notificationDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*', 'notification_schema', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $notificationDetails;
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
		if ($notificationDetails) {
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

	public function notificationMaster($id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$notificationMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");

		if ($method == "PUT" || $method == "POST") {
			$notificationMasterDetails['name'] = $this->validatedata->validate('name', 'name', true, '', array());
			$notificationMasterDetails['user_type'] = $this->validatedata->validate('user_type', 'user_type', true, '', array());
			// $notificationMasterDetails['module_name'] = $this->validatedata->validate('module_name', 'module_name', true, '', array());
			$notificationMasterDetails['notification_type'] = $this->validatedata->validate('notification_type', 'notification_type', true, '', array());
			$notificationMasterDetails['action_on'] = $this->validatedata->validate('action_on', 'action_on', true, '', array());
			$notificationMasterDetails['template_id'] = $this->validatedata->validate('template_id', 'template_id', true, '', array());
			$notificationMasterDetails['field_name'] = $this->validatedata->validate('field_name', 'field_name', false, '', array());
			$notificationMasterDetails['field_value'] = $this->validatedata->validate('field_value', 'field_value', false, '', array());
			$notificationMasterDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			$notificationMasterDetails['sys_user_id'] = $this->validatedata->validate('sys_user_id', 'sys_user_id', false, '', array());
			
			if ($method == "PUT") {
				$notificationMasterDetails['module_name'] = $this->input->post('module_name');
				$notificationMasterDetails['created_by'] = $this->input->post('SadminID');
				$notificationMasterDetails['created_date'] = $updateDate;
				$notificationMasterDetails['modified_date'] = '0';

				$iscreated = $this->CommonModel->saveMasterDetails('notification_schema', $notificationMasterDetails);
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
				$where = array('notification_id' => $id);
				if (!isset($id) || empty($id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$notificationMasterDetails['modified_by'] = $this->input->post('SadminID');
				$notificationMasterDetails['modified_date'] = $updateDate;

				$iscreated = $this->CommonModel->updateMasterDetails('notification_schema', $notificationMasterDetails, $where);
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
		} else if ($method == "DELETE") {
			$notificationMasterDetails = array();

			$where = array('notification_id' => $id);
			if (!isset($id) || empty($id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('notification_schema', $where);
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
			$where = array("notification_id" => $id);
			$notificationDetails = $this->CommonModel->getMasterDetails('notification_schema', '', $where);
			if(isset($notificationDetails)){	
			$status['data'] = $notificationDetails;
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
	public function notificationChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$where = array("notification_id" => $ids);
			// $statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->deleteMasterDetails('notification_schema', $where);
			// $changestatus = $this->CommonModel->changeMasterStatus('notification_schema', $statusCode, $ids, 'notification_id');

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
		

	}
	


	

