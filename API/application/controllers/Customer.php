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

		public function getcustomerList()
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
			$company = $this->input->post('company');

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

			if (isset($company) && !empty($company)) {
				$wherec["company_name like"] = "'" . $company . "%'";
			}

			$config["base_url"] = base_url() . "customer	Details";
			$config["total_rows"] = $this->CommonModel->getCountByParameter('customer_id', 'customer', $wherec);
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
				$customerDetails = array();
				$updateDate = date("Y/m/d H:i:s");

				$customerDetails['customer_id'] = $this->validatedata->validate('customer_id', 'customer ID', false, '', array());
				$customerDetails['pan_number'] = $this->validatedata->validate('pan_number', 'Pan Number', false, '', array());
				$customerDetails['company_name'] = $this->validatedata->validate('company_name', 'Company Name', true, '', array());
				$customerDetails['person_name'] = $this->validatedata->validate('person_name', 'person name ', true, '', array());
				$customerDetails['GST_no'] = $this->validatedata->validate('GST_no', 'GST no', true, '', array());
				$customerDetails['email'] = $this->validatedata->validate('email', 'Email', false, '', array());
				$customerDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile no', false, '', array());
				$customerDetails['adhar_number'] = $this->validatedata->validate('adhar_number', 'Adhar Number', false, '', array());
				$customerDetails['website'] = $this->validatedata->validate('website', 'Website', false, '', array());
				$customerDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
				$customerDetails['customer_image'] = $this->validatedata->validate('customer_image', 'customer Picture', false, '', array());
				$customerDetails['billing_name'] = $this->validatedata->validate('billing_name', 'Billing Name', false, '', array());
				$customerDetails['billing_address'] = $this->validatedata->validate('billing_address', 'Billing Address', false, '', array());
				$customerDetails['branch_id'] = $this->validatedata->validate('branch_id', 'branch Id', false, '', array());
				$customerDetails['country_code'] = $this->validatedata->validate('country_code', 'country code', false, '', array());

			}
			switch ($method) {
				case "PUT": {

						$customerDetails['created_by'] = $this->input->post('SadminID');
						$customerDetails['created_date'] = $updateDate;

						$iscreated = $this->CommonModel->saveMasterDetails('customer', $customerDetails);
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
						//$customerDetails = array();
						$updateDate = date("Y/m/d H:i:s");
						$where = array('customer_id' => $id);
						if (!isset($id) || empty($id)) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$customerDetails['modified_by'] = $this->input->post('SadminID');
						$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
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
						$customerDetails = array();

						$where = array('customer_id' => $id);
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
						$where = array("customer_id" => $id);
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
		public function customerChangeStatus()
		{
			$this->access->checkTokenKey();
			$this->response->decodeRequest(); 
			$action = $this->input->post("action");
				if(trim($action) == "changeStatus"){
					$ids = $this->input->post("list");
					$statusCode = $this->input->post("status");	
					$changestatus = $this->CommonModel->changeMasterStatus('customer',$statusCode,$ids,'customer_id');
					
				if($changestatus){
	
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}else{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
		}
	}
