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
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
	}


	public function getcustomerDetails()
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
		$type = $this->input->post('type');
		$stages = $this->input->post('stages');

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
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($company) && !empty($company)) {
			$wherec["company_name like"] = "'" . $company . "%'";
		}

		if (isset($type) && !empty($type)) {
			$wherec["type ="] = "'" . $type . "'";
		}

		if(isset($stages) && !empty($stages)){
			if($stages =="other"){
				$wherec["t.stages ="] = "'0'";	
			}else{
				$wherec["t.stages ="] = "'".$stages."'";
			}
			
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
		// print_r($wherec);exit;
		if ($isAll == "Y") {
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'customer', $wherec, '', '', $join, $other);
		} else {
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="categories";
			$join[0]['alias'] ="c";
			$join[0]['key1'] ="stages";
			$join[0]['key2'] ="category_id";
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*, c.categoryName AS lead_stage', 'customer', $wherec, $config["per_page"], $page, $join, $other);
		}

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
			$customerDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerDetails['salutation'] = $this->validatedata->validate('salutation', 'Salutation', false, '', array());
			$customerDetails['name'] = $this->validatedata->validate('name', 'Name', false, '', array());
			$customerDetails['company_name'] = $this->validatedata->validate('company_name', 'Comapany Name', false, '', array());
			$customerDetails['person_name'] = $this->validatedata->validate('person_name', 'Perso Name', false, '', array());
			$customerDetails['email'] = $this->validatedata->validate('email', 'Email', false, '', array());
			$customerDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile', false, '', array());
			$customerDetails['birth_date'] = $this->validatedata->validate('birth_date', 'Birth Date', false, '', array());
			$customerDetails['record_type'] = $this->validatedata->validate('record_type', 'record Type', true, '', array());
			$customerDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			$customerDetails['address'] = $this->validatedata->validate('address','addresss',false,'',array());
			$customerDetails['customer_image'] = $this->validatedata->validate('customer_image','Customer Image',false,'',array());
			$customerDetails['billing_name'] = $this->validatedata->validate('billing_name', 'Billing Address', false, '', array());
			$customerDetails['billing_address'] = $this->validatedata->validate('billing_address', 'Company Name', false, '', array());
			$customerDetails['branch_id'] = $this->validatedata->validate('branch_id', 'Branch Id	', false, '', array());
			$customerDetails['gst_no'] = $this->validatedata->validate('gst_no', ' Gst No', false, '', array());
			$customerDetails['adhar_number'] = $this->validatedata->validate('adhar_number', ' adhar Number', false, '', array());
			$customerDetails['pan_number'] = $this->validatedata->validate('pan_number', ' Pan Number', false, '', array());
			$customerDetails['website'] = $this->validatedata->validate('website', 'Website', false, '', array());
			$customerDetails['type'] = $this->validatedata->validate('type', 'Type', false, '', array());
			$customerDetails['stages'] = $this->validatedata->validate('stages', 'lead stages', false, '', array());
			$customerDetails['country_id'] = $this->validatedata->validate('country_id', 'Country', false, '', array());
			$customerDetails['state_id'] = $this->validatedata->validate('state_id', 'State', false, '', array());
			$customerDetails['city_id'] = $this->validatedata->validate('city_id', 'City', false, '', array());
			$customerDetails['latitude'] = $this->validatedata->validate('latitude', 'latitude', false, '', array());
			$customerDetails['longitude'] = $this->validatedata->validate('longitude', 'longitude', false, '', array());
			$customerDetails['zipcode'] = $this->validatedata->validate('zipcode', 'zipcode', false, '', array());
			$customerDetails['office_land_line'] = $this->validatedata->validate('office_land_line', 'office_land_line', false, '', array());
			$customerDetails['lead_source'] = $this->validatedata->validate('lead_source', 'lead source', false, '', array());
			
			
			if (isset($customerDetails['birth_date']) && !empty($customerDetails['birth_date']) && $customerDetails['birth_date'] != "0000-00-00") {
				$customerDetails['birth_date'] = str_replace("/", "-", $customerDetails['birth_date']);
				$customerDetails['birth_date'] = date("Y-m-d", strtotime($customerDetails['birth_date']));
			}else{
				$customerDetails['birth_date'] = null;
			}

			if(!isset($customerDetails['pan_number']) && empty($customerDetails['pan_number'])){
				$customerDetails['pan_number'] = null;
			}

			if(!isset($customerDetails['branch_id']) && empty($customerDetails['branch_id'])){
				$customerDetails['branch_id'] = null;	
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
					$custID = $this->db->insert_id();
					$status['lastID'] = $custID;
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
					$status['lastID'] = $customer_id;
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
			$menuHistory = $this->CommonModel->getMasterDetails('customer', '', $where);
			if (isset($menuHistory) && !empty($menuHistory)) {
				$whereAttachment = array(
					"customer_id" => $customer_id
				);

				$custAttachments = $this->CommonModel->getMasterDetails('customer_attachment','',$whereAttachment);
				if(!empty($custAttachments)){
					$attachment = array_column($custAttachments,'attachment_file');
					$attachmentID = array_column($custAttachments,'attachment_id');
					$menuHistory[0]->attachment_file = $attachment;
					$menuHistory[0]->attachment_id = $attachmentID;
				}
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
			// if($customer_id ==""){
			// 	$status['msg'] = $this->systemmsg->getSucessCode(400);
			// 	$status['statusCode'] = 400;
			// 	$status['data'] =array();
			// 	$status['flag'] = 'S';
			// 	$this->response->output($status,200);
			// }

			// $whereAttachment = array(
			// 	"customer_id" => $customer_id
			// );

			// $this->menuID = $this->input->post('menuId');
			// // $this->filters->menuID = $this->menuID;
			// // $this->filters->getMenuData();
			// // $this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			// // $this->menuDetails = $this->filters->menuDetails;
			// $wherec = $join = array();
			// $menuId = $this->input->post('menuId');
			// // $whereData = $this->filters->prepareFilterData($_POST);
			// $wherec = $whereData["wherec"];
			// $other = $whereData["other"];
			// $join = $whereData["join"];
			// $selectC = $whereData["select"];
			
			// $other = array();
			// $wherec["t.customer_id"] = "=".$customer_id;
			// //$customerDetails = $this->CommonModel->GetMasterListDetails('customer', '', $where);
			// if($selectC != ""){
			// 	$selectC="t.*,".$selectC;
			// }
			// $customerDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			// if (isset($customerDetails) && !empty($customerDetails)) {
			// 	$custAttachments = $this->CommonModel->getMasterDetails('customer_attachment','',$whereAttachment);
			// 	if(!empty($custAttachments)){
			// 		$attachment = array_column($custAttachments,'attachment_file');
			// 		$attachmentID = array_column($custAttachments,'attachment_id');
			// 		$customerDetails[0]->attachment_file = $attachment;
			// 		$customerDetails[0]->attachment_id = $attachmentID;
			// 	}
			// 	$status['data'] = $customerDetails;
			// 	$status['statusCode'] = 200;
			// 	$status['flag'] = 'S';
			// 	$this->response->output($status, 200);
			// } else {

			// 	$status['msg'] = $this->systemmsg->getErrorCode(227);
			// 	$status['statusCode'] = 227;
			// 	$status['data'] = array();
			// 	$status['flag'] = 'F';
			// 	$this->response->output($status, 200);
			// }
		}
	}


	public function CustomerChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
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

	public function getcustomerNotesDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$customer = $this->input->post('customer_id');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "note_id";
			$order = "DESC";
		}

		$other = array("orderBy"=>$orderBy,"order"=>$order);

		if(isset($customer) && !empty($customer)){			
			$customer = trim($customer);
			$wherec["record_id ="] = "'".$customer."'";
		}

		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			$join = array();
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC='*','notes',$wherec,'','','', $other);	
		}else{
			$selectC = "*";
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'notes', $wherec, '', '', '', $other);
		}
		$status['data'] = $customerNotesDetails;
		if ($customerNotesDetails) {
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

	public function customerNote($note_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		// print_r($method);exit;
		if ($method == "POST" || $method == "PUT") {
			$customerNote = array();
			$updateDate = date("Y/m/d H:i:s");

			$customerNote['record_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerNote['note_desc'] = $this->validatedata->validate('note_desc', 'Customer Note', false, '', array());
			$customerNote['title'] = $this->validatedata->validate('title', 'Title', false, '', array());
			$customerNote['reminder_date'] = $this->validatedata->validate('reminder_date', 'Reminder Date', false, '', array());
			$reminder_time = $this->validatedata->validate('reminder_date', 'Reminder Date', false, '', array());
			
			if (isset($customerNote['reminder_date']) && !empty($customerNote['reminder_date']) && $customerNote['reminder_date'] != "0000-00-00") {
				$customerNote['reminder_date'] = str_replace("/", "-", $customerNote['reminder_date']);
				$customerNote['reminder_date'] = date("Y-m-d", strtotime($customerNote['reminder_date']));
				
				// Convert time to the desired format
				$reminder_time = date("H:i:s", strtotime($reminder_time));

				// Concatenate date and time
				$customerNote['reminder_date'] .= ' ' . $reminder_time;
			} else {
				$customerNote['reminder_date'] = null;
			}
			if ($method == "PUT") {
				$customerNote['created_by'] = $this->input->post('SadminID');
				$customerNote['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('notes', $customerNote);
				$lastNoteID = $this->db->insert_id();
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
					$status['lastID'] = $lastNoteID;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('note_id' => $note_id);
				if (!isset($note_id) || empty($note_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$customerNote['modified_by'] = $this->input->post('SadminID');
				$customerNote['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('notes', $customerNote, $where);
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
				$customerNote = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('notes', $where);
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

			$where = array("note_id" => $note_id);
			$customerDetails = $this->CommonModel->getMasterDetails('notes', '', $where);

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

	public function noteDelete(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$noteID= $this->input->post("id");
		$wherec["note_id ="] = $noteID;
		$changestatus = $this->CommonModel->deleteMasterDetails('notes',$wherec);
		if($changestatus){
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

	public function customerChangeType()
	{
		$customerID = $this->input->post('customerID');
		$setStatus = $this->input->post('status');
		$where = array('customer_id' => $customerID);
		$customerDetails['type'] = $setStatus;
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
	}

	public function getcustomerActivityDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$customer = $this->input->post('customer_id');
		$customerType = $this->input->post('customerType');
		$historyType = $this->input->post('historyType');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "history_id";
			$order = "DESC";
		}
		if(isset($historyType) && !empty($historyType) && $historyType=="past"){

			$other = array("orderBy"=>$orderBy,"order"=>$order);

			if(isset($customer) && !empty($customer)){			
				$customer = trim($customer);
				$wherec["parent_record_id ="] = "'".$customer."'";
			}
			$adminID = $this->input->post('SadminID');
			if ($isAll == "Y") {
				$join = array();
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC='*','history',$wherec,'','','', $other);	
			}else{
				$selectC = "*";
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'history', $wherec, '', '', '', $other);
			}
			$status['data'] = $customerActivityDetails;
			if ($customerActivityDetails) {
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
		}else if($historyType=="upcoming"){
			$whereTask = array();
			$whereTask["start_date >="] = "'".date('Y-m-d')."'";
			$whereTask["customer_id = "] = $customer;
			$customerTaskUpcoming = $this->CommonModel->GetMasterListDetails("*", 'tasks', $whereTask, '', '', '', '');

			$whereAppoint = array();
			$whereAppoint["start_date >="] = "'".date('Y-m-d')."'";
			$whereAppoint["customer_ID = "] = $customer;
			$customerAppUpcoming = $this->CommonModel->GetMasterListDetails("*", 'appointment', $whereAppoint, '', '', '', '');

			$whereNotes = array();
			$whereNotes["reminder_date >="] = "'".date('Y-m-d')."'";
			$whereNotes["record_id = "] = $customer;
			$customerNoteUpcoming = $this->CommonModel->GetMasterListDetails("*", 'notes', $whereNotes, '', '', '', '');

			// print_r($customerNoteUpcoming);exit;
			$upcomingActivity = array();
			foreach ($customerTaskUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "task";
				$record->description =$value->subject;
				$record->timestamp =$value->created_date;
				$record->start_date =$value->start_date;
				$upcomingActivity[]=$record;
			}
			foreach ($customerAppUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "appointment";
				$record->description =$value->title;
				$record->timestamp =$value->created_date;
				$record->start_date =$value->start_date;
				$upcomingActivity[]=$record;
			}
			foreach ($customerNoteUpcoming as $key => $value){
				$record = new stdClass();
				$record->record_type = "notes";
				$record->description =$value->title;
				$record->timestamp =$value->created_date;
				$record->start_date =$value->reminder_date;
				$upcomingActivity[]=$record;
			}
			array_multisort(array_map('strtotime',array_column($upcomingActivity,'timestamp')),
					SORT_ASC, 
					$upcomingActivity);
			if ($upcomingActivity) {
				$status['data'] = $upcomingActivity;
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

		} else if($historyType=="personal"){
			$adminID = $this->input->post('SadminID');
			$wherec["parent_record_id ="] = "'79'";
			$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC="*", 'history', $wherec, '', '', '', '');
			$status['data'] = $customerActivityDetails;
			if ($customerActivityDetails) {
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
		
	}
	public function getCustomerEmailList()
	{
		// print('here');exit;
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$t = $t ?? '';
		
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec["email like  "] = "'%" . $text . "%'";
		}
		//print_r($wherec);
		$updateAns = $this->CommonModel->GetMasterListDetails("customer_id,email", "customer", $wherec);
		// print_r($updateAns);
		// foreach ($updateAns as $hsl)
		// {
		//     $data1 = new stdClass(); = 
		// 	$data1$hsl->email;
		// 	$datas[] = $hsl->adminID;
		// 	$datas[] = 
		// }
		// print_r($updateAns);
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	public function leadUpdate()
	{
		$customerID = $this->input->post('customerID');
		$lead = $this->input->post('lead');
		$where = array('customer_id' => $customerID);
		$customerDetails['stages'] = $lead;
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
	}

	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$menuIDs = $this->input->post("menuIDs");
			foreach ($menuIDs as $key => $value) {
				$where = array('category_id' => $value);
				$categoryIndex['lead_index'] = $key;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
			}

		}
	}

	public function custUpload($customer_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($customer_id) && !empty($customer_id)){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/".$customer_id ;
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($customer_id) || $customer_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/temp-";
			if (!is_dir($mediapatharr)) {
				if (mkdir($mediapatharr, 0777, true)) {
				} else {
					$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
		
		
		$extraData["customer_id"] = $customer_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'customer_attachment',
			'fileTypeColumn' => 'attachment_file',
			'fileColumn' => 'attachment_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}
}
