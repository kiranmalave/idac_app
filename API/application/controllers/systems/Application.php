<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Application extends CI_Controller
{
    function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->helper('form');
		// $this->load->model('SearchAdminModel');
		$this->load->model('CommonModel');
		// $this->load->library("pagination");
		// $this->load->library("ValidateData");
		// if(!$this->config->item('development'))
		// {
		// 	$this->load->library("emails");
		// }
		// $this->load->library("response");

    }
	public function getTables(){
        $sql = "SHOW TABLES";
		$res = $this->CommonModel->getdata($sql,array());
    }

	public function getDefinations(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$table = $this->input->post('table');
		
		if(!isset($table) || empty($table)){
			$menuID = $this->input->post('menuID');
			
			if(!isset($menuID) || empty($menuID)){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			$moduleDetails = $this->CommonModel->getMasterDetails("menu_master","*",array("menuID"=>$menuID));
			$table = $this->db->dbprefix.$moduleDetails[0]->table_name;
		}
		if(!isset($table) || empty($table)){
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		
		$sql = "SHOW COLUMNS FROM ".$table; 
		$res = $this->CommonModel->getdata($sql,array());
		if (isset($res) && !empty($res)) {

			$status['data'] = $res;
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

	public function getList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$tableName = $this->input->post('tableName');
		$where = $this->input->post('wherec');
		$select = $this->input->post('list');
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec[ "$where like  "] = "'%" . $text . "%'";
			$wherec["t.status"] = 'IN ("active")';
			$updateAns = $this->CommonModel->GetMasterListDetails($select, $tableName, $wherec);
			if (isset($updateAns) && !empty($updateAns)) {
				$status['msg'] = "sucess";
				$status['data'] = $updateAns;
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}
	}

	public function dynamicGetList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$pluginID = $this->input->post('pluginID');
		$fieldID = $this->input->post('fieldID');
		
		//$where = $this->input->post('wherec');
		//$select = $this->input->post('list');
		$text = trim($t);

		if(isset($fieldID) && !empty($fieldID)){
			$wheret = array();
			$wheret[ "fieldID"] = " = '".$fieldID."'";
			$wheret[ "linkedWith"] = "='".$pluginID."'";
			$fieldDetails = $this->CommonModel->GetMasterListDetails($selectC='', 'dynamic_fields', $wheret, '', '', '','');
			if(!$fieldDetails){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		if(isset($pluginID) && !empty($pluginID)){
			$wheret = array();
			$wheret[ " menuID"] = "= '" . $pluginID ."'";
			$selectC = "table_name";
			$tableDetails = $this->CommonModel->GetMasterListDetails($selectC, 'menu_master', $wheret, '', '', '','');
			if(!$tableDetails){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		// check is linekd with $fieldDetails
		
		$wherec= $whereOR = array(); 
		//print_r($fieldDetails);
		
		if($fieldDetails[0]->fieldOptions == "categoryName"){
			$wherec["parent_id"] = "=".$fieldDetails[0]->parentCategory;
			
		}else{
			$option = explode(",",$fieldDetails[0]->fieldOptions);
			if (isset($option) && !empty($option)) {
				foreach ($option as $key => $value) {
					$whereOR[ "$value like  "] = "'%" . $text . "%'";
				}
			}
		}
		$other = array("whereOR"=>$whereOR);
		$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$tableDetails[0]->table_name." WHERE Key_name = 'PRIMARY'";
		$res = $this->CommonModel->getdata($sql,array());
		$select=$res[0]->Column_name.",".$fieldDetails[0]->fieldOptions;
		$updateAns = $this->CommonModel->GetMasterListDetails($select,$tableDetails[0]->table_name, $wherec,'','',array(),$other);
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['lookup'] =array("pKey"=>$res[0]->Column_name);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function getCountryList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');

		
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "country_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'%" . $textval . "%'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$countryDetails = $this->CommonModel->GetMasterListDetails($selectC, 'country', $wherec, '', '', $join, $other);
		} else {
			$countryDetails = $this->CommonModel->GetMasterListDetails($selectC, 'country', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $countryDetails;
		
		if ($countryDetails) {
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

	public function getStateList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$countryId = $this->input->post('country');

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "state_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = array();
		if (isset($countryId) && !empty($countryId)) {
			$wherec["country_id ="] = "'". $countryId . "'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$statesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'states', $wherec, '', '', $join, $other);
		} else {
			$statesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'states', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $statesDetails;
		if ($statesDetails) {
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

	public function getCityList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$stateId = $this->input->post('state');

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "city_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = array();

		if (isset($stateId) && !empty($stateId)) {
			$wherec["state_id ="] = "'". $stateId . "'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$cityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'cities', $wherec, '', '', $join, $other);
		} else {
			$cityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'cities', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $cityDetails;
		if ($cityDetails) {
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
