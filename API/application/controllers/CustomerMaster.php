<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CustomerMaster extends CI_Controller
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
	 * So any other public methods not contacted with an underscore will
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


	public function getcustomerDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$t = $this->input->post('textSearch');
		$t = $t ?? '';
		$textSearch = trim($t);
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('customer_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');

		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$type = $this->input->post('type');
		
		// print_r($textSearch);exit;
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "first_name";
			$order = "ASC";
		}

		
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();

		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){			
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($type) || !empty($type)){
			$wherec["type ="] = "'".$type."'";

		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["birth_date >="] = "'".$sDate."'";
		}
		if(isset($endDate) && !empty($endDate)){
			$eDate = date("Y-m-d",strtotime($endDate));
			$wherec["birth_date <="] = "'".$eDate."'";
		}

		// if(isset($filterSName) && !empty($filterSName)){
		// 	$wherec["t.companyStateid"] = ' = "'.$filterSName.'"';
		// }

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		// echo  $adminID;exit();
		// $where = array("adminID ="=>"'".$adminID."'");
		// $iti_registration = $this->CommonModel->GetMasterListDetails('*','iti_registration',$where,'','',array(),array());
		// if(isset($iti_registration) && !empty($iti_registration)){
		// 		//$wherec["cm.ITIID IN "] = "(".$iti_registration[0]->companyList.")";
		// }else{
		// 	$status['msg'] = $this->systemmsg->getErrorCode(263);
		// 	$status['statusCode'] = 263;
		// 	$status['flag'] = 'F';
		// 	$this->response->output($status,200);
		// }

		// Check is data process already
		// $other['whereIn'] = "ITIID";

		// $other["whereData"]=$iti_registration[0]->companyList;

		$config["base_url"] = base_url() . "customerDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('customer_id', 'customer', $wherec, $other);
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
			$join = array();
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC='*','customer',$wherec,'','',$join,$other);	
		}else{
			$selectC = "*";
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'customer', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		$status['data'] = $customerDetails;
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
		if ($customerDetails) {
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

	public function customerMaster($customer_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$customerDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $customerDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$customerDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());

			$customerDetails['salutation'] = $this->validatedata->validate('salutation', 'Salutation', true, '', array());

			$customerDetails['first_name'] = $this->validatedata->validate('first_name', 'First Name', true, '', array());

			$customerDetails['middle_name'] = $this->validatedata->validate('middle_name', 'Middle Name', true, '', array());

			$customerDetails['last_name'] = $this->validatedata->validate('last_name', 'Last Name', true, '', array());

			$customerDetails['email'] = $this->validatedata->validate('email', 'Email', true, '', array());

			$customerDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile', true, '', array());

			$customerDetails['birth_date'] = $this->validatedata->validate('birth_date', 'Birth Date', true, '', array());

			$customerDetails['type'] = $this->validatedata->validate('type', 'Type', true, '', array());

			$customerDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());

				$customerDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				
				$customerDetails['address'] = $this->validatedata->validate('address','addresss',true,'',array());
				
				$customerDetails['customer_image'] = $this->validatedata->validate('customer_image','Customer Image',false,'',array());

			$customerDetails['customer_image'] = $this->validatedata->validate('customer_image', 'Customer Image', true, '', array());

			if (isset($customerDetails['birth_date']) && !empty($customerDetails['birth_date']) && $customerDetails['birth_date'] != "0000-00-00") {
				$customerDetails['birth_date'] = str_replace("/", "-", $customerDetails['birth_date']);
				$customerDetails['birth_date'] = date("Y-m-d", strtotime($customerDetails['birth_date']));
			}
			//   print_r($customerDetails);exit();
			if ($method == "PUT") {
				$iticode = $customerDetails['customer_id'];
				$customerDetails['status'] = "active";
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
			} elseif ($method == "POST") {
				$where = array('customer_id' => $customer_id);
				if (!isset($customer_id) || empty($customer_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}


				$customerDetails['modified_by'] = $this->input->post('SadminID');
				$customerDetails['modified_date'] = $updateDate;
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
			} elseif ($method == "dele") {
				$customerDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
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
			}
		} else {

			$where = array("customer_id" => $customer_id);
			$customerDetails = $this->CommonModel->getMasterDetails('customer', '', $where);
			if (isset($customerDetails) && !empty($customerDetails)) {

				$status['data'] = $customerDetails;
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


	public function CustomerChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('customer', $statusCode, $ids, 'customer_id');

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
