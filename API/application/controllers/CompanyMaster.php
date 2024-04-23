<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CompanyMaster extends CI_Controller
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
	 * So any other public methods not categoryed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	var $menuID="";
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}

	public function getCompanyDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$wherec = $join = array();
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			// create join for created by and modified data details
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="ad";
			$join[$jkey]['key1'] ="created_by";
			$join[$jkey]['key2'] ="adminID";
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="am";
			$join[$jkey]['key1'] ="modified_by";
			$join[$jkey]['key2'] ="adminID";

			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			
				$columnNames = [
					"country_id" => ["table" => "country", "alias" => "cn", "column" => "country_name", "key2" => "country_id"],
					"state_id" => ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"],
					"city_id" => ["table" => "cities", "alias" => "ci", "column" => "city_name", "key2" => "city_id"],
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					if (in_array($columnName, $colData)) {
						$jkey = count($join) + 1;
						$join[$jkey]['type'] = "LEFT JOIN";
						$join[$jkey]['table'] = $columnData["table"];
						$join[$jkey]['alias'] = $columnData["alias"];
						$join[$jkey]['key1'] = $columnName;
						$join[$jkey]['key2'] = $columnData["key2"];
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}

			if($selectC !=""){
				$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			}else{
				$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			}
		}

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "companyName";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$config["base_url"] = base_url() . "companyDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.infoID', 'info_settings', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		// print_r($wherec);
		if ($isAll == "Y") {
			$companyDetails = $this->CommonModel->GetMasterListDetails($selectC ="infoID,companyName",'info_settings', $wherec, '', '', $join, $other);
		} else {
			$selectC = "t.infoID,t.companyName,".$selectC;
			$companyDetails = $this->CommonModel->GetMasterListDetails($selectC, 'info_settings', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $companyDetails;
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
		if ($companyDetails) {
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

	public function companyMaster($infoID = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
	
		if ($method == "POST" || $method == "PUT") {
			$infoDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$infoDetails['companyName'] = $this->validatedata->validate('companyName');
			$infoDetails['company_address'] = $this->validatedata->validate('company_address');
			$infoDetails['fromEmail'] = $this->validatedata->validate('fromEmail');
			$infoDetails['ccEmail'] = $this->validatedata->validate('ccEmail');
			$infoDetails['fromName'] = $this->validatedata->validate('fromName');
			$infoDetails['ourTarget'] = $this->validatedata->validate('ourTarget');
			$infoDetails['bank_acc_no'] = $this->validatedata->validate('bank_acc_no');
			$infoDetails['ifsc_code'] = $this->validatedata->validate('ifsc_code');
			$infoDetails['pan'] = $this->validatedata->validate('pan');
			$infoDetails['gst_no'] = $this->validatedata->validate('gst_no');
			$infoDetails['msme_no'] = $this->validatedata->validate('msme_no');
			$infoDetails['lut_no'] = $this->validatedata->validate('lut_no');
			$infoDetails['mcir_code'] = $this->validatedata->validate('mcir_code');
			$infoDetails['bank_details'] = $this->validatedata->validate('bank_details');
			$infoDetails['state_id'] = $this->validatedata->validate('state_id');
			$infoDetails['country_id'] = $this->validatedata->validate('country_id');
			$infoDetails['zip'] = $this->validatedata->validate('zip');
			$infoDetails['city_id'] = $this->validatedata->validate('city_id');
			$infoDetails['stateGst'] = $this->validatedata->validate('stateGst');
			$infoDetails['centralGst'] = $this->validatedata->validate('centralGst');
			$infoDetails['interGst'] = $this->validatedata->validate('interGst');
			$infoDetails['created_by'] = $this->validatedata->validate('SadminID');
			$infoDetails['mobile_number'] = $this->validatedata->validate('mobile_number');
			$infoDetails['invoice_logo'] = $this->validatedata->validate('invoice_logo','Invoice Logo',false,'',array());
			$infoDetails['quotation_terms_conditions'] = $this->validatedata->validate('quotation_terms_conditions');
			$infoDetails['invoice_terms_condotions'] = $this->validatedata->validate('invoice_terms_condotions');
			$infoDetails['receipt_terms_condotions'] = $this->validatedata->validate('receipt_terms_condotions');
			$infoDetails['created_date'] = $updateDate;	

			// add dynamic feild data
			$fieldData = $this->datatables->mapDynamicFeilds("companyMaster",$this->input->post());
			$infoDetails = array_merge($fieldData, $infoDetails);

			if ($method == "PUT") {
				$infoDetails['status'] = "active";
				$infoDetails['created_by'] = $this->input->post('SadminID');
				$infoDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('info_settings', $infoDetails);
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
				$where = array('infoID' => $infoID);
				if (!isset($infoID) || empty($infoID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$infoDetails['modified_by'] = $this->input->post('SadminID');
				$infoDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('info_settings', $infoDetails, $where);
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
				$infoDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('info_settings', $where);
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

			if($infoID == ""){
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
			
			$other = array();
			$wherec["t.infoID"] = "=".$infoID;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$infoDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());

			if (isset($infoDetails) && !empty($infoDetails)) {

				$status['data'] = $infoDetails;
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

	// public function companyMaster($id='')
	// {

	// 	$this->response->decodeRequest();
	// 	$method = $this->input->method(TRUE);
		
	// 	if($method === "PUT" || $method === "POST"){
	// 		$infoDetails = array();
			
	// 		$updateDate = date("Y/m/d H:i:s");
	// 		$id = $this->input->post('infoID');
			
	// 		$infoDetails['companyName'] = $this->validatedata->validate('companyName');
	// 		$infoDetails['company_address'] = $this->validatedata->validate('company_address');
	// 		$infoDetails['fromEmail'] = $this->validatedata->validate('fromEmail');
	// 		$infoDetails['ccEmail'] = $this->validatedata->validate('ccEmail');
	// 		$infoDetails['fromName'] = $this->validatedata->validate('fromName');
	// 		$infoDetails['ourTarget'] = $this->validatedata->validate('ourTarget');
	// 		$infoDetails['bank_acc_no'] = $this->validatedata->validate('bank_acc_no');
	// 		$infoDetails['pan'] = $this->validatedata->validate('pan');
	// 		$infoDetails['gst_no'] = $this->validatedata->validate('gst_no');
	// 		$infoDetails['msme_no'] = $this->validatedata->validate('msme_no');
	// 		$infoDetails['lut_no'] = $this->validatedata->validate('lut_no');
	// 		$infoDetails['mcir_code'] = $this->validatedata->validate('mcir_code');
	// 		$infoDetails['bank_details'] = $this->validatedata->validate('bank_details');
	// 		$infoDetails['state_id'] = $this->validatedata->validate('state_id');
	// 		$infoDetails['zip'] = $this->validatedata->validate('zip');
	// 		$infoDetails['city_id'] = $this->validatedata->validate('city_id');
	// 		$infoDetails['stateGst'] = $this->validatedata->validate('stateGst');
	// 		$infoDetails['centralGst'] = $this->validatedata->validate('centralGst');
	// 		$infoDetails['interGst'] = $this->validatedata->validate('interGst');
	// 		$infoDetails['created_by'] = $this->validatedata->validate('SadminID');
	// 		$infoDetails['created_date'] = $updateDate;	
			
	// 		$wherec  = array('infoID' =>$id);

	// 		$fieldData = $this->datatables->mapDynamicFeilds("info_settings",$this->input->post());
	// 		$infoDetails = array_merge($fieldData, $infoDetails);

	// 		$infoData = $this->CommonModel->getMasterDetails('info_settings','',$wherec);

	// 		if(isset($infoData) && !empty($infoData)){
	// 			$infoDetails['modified_date'] = $updateDate;
	// 			$infoDetails['modified_by'] = $this->input->post('SadminID');

	// 			$isinsert = $this->CommonModel->updateMasterDetails('info_settings',$infoDetails,$wherec);
	// 			if(!$isinsert){
	// 				$status['msg'] = $this->systemmsg->getErrorCode(998);
	// 				$status['statusCode'] = 998;
	// 				$status['data'] = array();
	// 				$status['flag'] = 'F';
	// 				$this->response->output($status,200);

	// 			}else{
	// 				$status['msg'] = $this->systemmsg->getSucessCode(400);
	// 				$status['statusCode'] = 400;
	// 				$status['data'] =array();
	// 				$status['flag'] = 'S';
	// 				$this->response->output($status,200);
	// 			}
	// 		}
	// 		else{
	// 			$count = $this->CommonModel->countFiltered('info_settings');
	// 			if($count == 0){
	// 				$isinsert = $this->CommonModel->saveMasterDetails('info_settings',$infoDetails);

	// 					if(!$isinsert){

	// 						$status['msg'] = $this->systemmsg->getErrorCode(998);
	// 						$status['statusCode'] = 998;
	// 						$status['data'] = array();
	// 						$status['flag'] = 'F';
	// 						$this->response->output($status,200);
	// 					}else{

	// 						$status['msg'] = $this->systemmsg->getSucessCode(400);
	// 						$status['statusCode'] = 400;
	// 						$status['data'] =array();
	// 						$status['flag'] = 'S';
	// 						$this->response->output($status,200);
	// 					}
	// 				}
	// 			}
	// 		}	
		
			
	// 	else
	// 	{
	// 		$id = $this->input->post('infoID');
	// 		$where = $id;
	// 		$infoHistory = $this->CommonModel->getMasterDetails('info_settings','',$where);
	// 		if(isset($infoHistory) && !empty($infoHistory)){

	// 		$status['data'] = $infoHistory;
	// 		$status['statusCode'] = 200;
	// 		$status['flag'] = 'S';
	// 		$this->response->output($status,200);
	// 		}else{

	// 		$status['msg'] = $this->systemmsg->getErrorCode(227);
	// 		$status['statusCode'] = 227;
	// 		$status['data'] =array();
	// 		$status['flag'] = 'F';
	// 		$this->response->output($status,200);
	// 		}
			
	// 	}
	// }

	public function companyChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('info_settings', $statusCode, $ids, 'infoID');
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

	public function setDefualtCompany()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$user_id = $this->input->post("user_id");
		$company_id = $this->input->post("company_id");
		$where = array("adminID"=> $user_id);
		$adminDetails['default_company'] = $company_id;
		
		$updated = $this->CommonModel->updateMasterDetails('admin', $adminDetails, $where);
		if ($updated) {
		
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
	public function getCompanyList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		
		$wherec = $join = $other =  array();
		$adminID = $this->input->post('SadminID');
		$companyList =  $this->CommonModel->getMasterDetails('admin','',array('adminID'=>$adminID));
		$company_ids = array();
		
		if (isset($companyList[0]->company_id) && !empty($companyList[0]->company_id)) {
			$company_id = $companyList[0]->company_id;
			$company_ids = explode(',',$company_id);
		} 
		
		$wherec["status = "] = "'Active'";
		// $selectC = "t.infoID,t.companyName";
		$selectC = "t.*";
		$companyDetails = $this->CommonModel->GetMasterListDetails($selectC, 'info_settings', $wherec,'', '', $join, $other);
		
		$companyDetails1 = $companyDetails;
		$companyDetails = array();
		if (isset($company_ids) && !empty($company_ids)) {
			foreach ($company_ids as $C_key => $C_value) {
				foreach ($companyDetails1 as $key => $value) {
					if ($C_value == $value->infoID) {
						$companyDetails[] = $value;
					}
				}
			}
		}
		if ($companyDetails) {
			$status['data'] = $companyDetails;
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
