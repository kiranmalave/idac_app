	<?php
	defined('BASEPATH') or exit('No direct script access allowed');

	class Customer extends CI_Controller
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
			// $this->load->model('TraineeModel');
			$this->load->library("pagination");
			$this->load->library("response");
			$this->load->library("ValidateData");
		}

		public function customerList()
		{
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$method = $this->input->method(TRUE);
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


			$config = array();
			if (!isset($orderBy) || empty($orderBy)) {
				$orderBy = "created_date";
				$order = "DESC";
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

			$config["base_url"] = base_url() . "customer	Details";
			$config["total_rows"] = $this->CommonModel->getCountByParameter('customerID', 'customer', $wherec);
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
				$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'customer', $wherec, '', '', $join, $other);
			} else {
				$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'customer', $wherec, $config["per_page"], $page, $join, $other);
			}

			$status['data'] = $userRoleDetails;
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
			if ($userRoleDetails) {
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

		public function customer($id = '')
		{
			$this->response->decodeRequest();
			$method = $this->input->method(TRUE);
			if ($method == "PUT" || $method == "POST") {
				$menuDetails = array();
				$updateDate = date("Y/m/d H:i:s");
			}
			switch ($method) {
				case "PUT": {

						$menuDetails['created_by'] = $this->input->post('SadminID');
						$menuDetails['created_date'] = $updateDate;

						$iscreated = $this->CommonModel->saveMasterDetails('customer', $menuDetails);
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

				case "POST": {
						//$menuDetails = array();
						$updateDate = date("Y/m/d H:i:s");
						$where = array('menuID' => $id);
						if (!isset($id) || empty($id)) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$menuDetails['modified_by'] = $this->input->post('SadminID');
						$iscreated = $this->CommonModel->updateMasterDetails('customer', $menuDetails, $where);
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
				case "DELETE": {
						$menuDetails = array();

						$where = array('menuID' => $id);
						if (!isset($id) || empty($id)) {
							$status['msg'] = $this->systemmsg->getErrorCode(996);
							$status['statusCode'] = 996;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}

						$iscreated = $this->CommonModel->deleteMasterDetails('customer', $where);
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
						break;
					}
				default: {
						$where = array("menuID" => $id);
						$menuHistory = $this->CommonModel->getMasterDetails('customer', '', $where);
						if (isset($menuHistory) && !empty($menuHistory)) {

							$status['data'] = $menuHistory;
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
	}
