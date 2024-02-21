<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DynamicFormField extends CI_Controller
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
		$this->load->library("Datatables");
	}

	public function formFieldList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		// $this->access->checkTokenKey();
		// $this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$menuId = $this->input->post('menuId');
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
		if (isset($menuId) && !empty($menuId)) {
			$wherec["menuId"] = "='" . $menuId . "'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}

		$config["base_url"] = base_url() . "dynamicFormFieldDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('fieldID', 'dynamic_fields', $wherec);
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
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, '', '', $join, $other);
		} else {
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, $config["per_page"], $page, $join, $other);
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

	public function dynamicformfield($id = '')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$action = $this->input->post('action');
		
		$this->db->trans_start();
		if ($action != "" && $action == "DELETE")
			$method = "DELETE";
		
			if ($method == "PUT" || $method == "POST") {
				$fieldDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				
				$fieldDetails['fieldLabel'] = $this->validatedata->validate('fieldLabel', 'Field Label', true, '', array());
				$fieldDetails['fieldType'] = $this->validatedata->validate('fieldType', 'Field Type', true, '', array());
				$fieldDetails['placeholder'] = $this->validatedata->validate('placeholder', 'Placeholder', false, '', array());
				$fieldDetails['defaultValue'] = $this->validatedata->validate('defaultValue', 'Default Value', false, '', array());
				$fieldDetails['fieldOptions'] = $this->validatedata->validate('fieldOptions', 'Field Options', false, '', array());
				$fieldDetails['tooltip'] = $this->validatedata->validate('tooltip', 'Tooltip', false, '', array());
				$fieldDetails['isRequired'] = $this->validatedata->validate('isRequired', 'Is Required', false, '', array());
				$fieldDetails['allowMultiSelect'] = $this->validatedata->validate('allowMultiSelect', 'Allow Multi Select', false, '', array());
				$fieldDetails['minLength'] = $this->validatedata->validate('minLength', 'Min Length', false, '', array());
				$fieldDetails['maxLength'] = $this->validatedata->validate('maxLength', 'Max Length', false, '', array());
				$fieldDetails['startDate'] = $this->validatedata->validate('startDate', 'Start Date', false, '', array());
				$fieldDetails['parentCategory'] = $this->validatedata->validate('parentCategory', 'Parent Category', false, '', array());
				if (!empty($fieldDetails['startDate'])) {
					$fieldDetails['startDate'] = date("Y-m-d", strtotime($fieldDetails['startDate']));
				}
				$fieldDetails['endDate'] = $this->validatedata->validate('endDate', 'End Date', false, '', array());
				if (!empty($fieldDetails['endDate'])) {
					$fieldDetails['endDate'] = date("Y-m-d", strtotime($fieldDetails['endDate']));
				}

				$fieldDetails['dateFormat'] = $this->validatedata->validate('dateFormat', 'Date Format', false, '', array());
				$fieldDetails['supportedFileTypes'] = $this->validatedata->validate('supportedFileTypes', 'Supported File Types', false, '', array());
				$fieldDetails['numberOfFileToUpload'] = $this->validatedata->validate('numberOfFileToUpload', 'Number Of File To Upload', false, '', array());
				$fieldDetails['validationRules'] = $this->validatedata->validate('validationRules', 'Validation Rules', false, '', array());
				$fieldDetails['startTime'] = $this->validatedata->validate('startTime', 'Start Time', false, '', array());
				$fieldDetails['endTime'] = $this->validatedata->validate('endTime', 'End Time', false, '', array());
				$fieldDetails['displayFormat'] = $this->validatedata->validate('displayFormat', 'Display Format', false, '', array());
				$fieldDetails['minRangeValue'] = $this->validatedata->validate('minRangeValue', 'Min Range', false, '', array());
				$fieldDetails['maxRangeValue'] = $this->validatedata->validate('maxRangeValue', 'Max Range', false, '', array());
				$fieldDetails['stepSize'] = $this->validatedata->validate('stepSize', 'Step Size', false, '', array());
				$fieldDetails['fieldIndex'] = $this->validatedata->validate('fieldIndex', 'Field Index', false, '', array());
				$fieldDetails['status'] = $this->validatedata->validate('status', 'Status', true, '', array());
				$fieldDetails['valDefault'] = $this->validatedata->validate('valDefault', 'Default Value', false, '', array());
				$fieldDetails['isNull'] = $this->validatedata->validate('isNull', 'Null', false, '', array());
				$fieldDetails['menuId'] = $this->validatedata->validate('menuId', 'Module', true, '', array());
				$fieldDetails['itemAlign'] = $this->validatedata->validate('itemAlign', 'Display Items', false, '', array());
				$fieldDetails['textareaType'] = $this->validatedata->validate('textareaType', 'Display Textarea', false, '', array());
				$fieldDetails['linkedWith'] = $this->validatedata->validate('linkedWith', 'Linked With', false, '', array());
				$fieldDetails['date_selection_criteria'] = $this->validatedata->validate('date_selection_criteria', 'Select Date Criteria', false, '', array());
			}
		switch ($method) {
			case "PUT": {
					
				if ($fieldDetails['valDefault'] == "USER_DEFINED") {
					$userDef = $this->input->post('userDef');
					$fieldDetails['valDefault'] = $userDef;
				}elseif($fieldDetails['valDefault'] == "NONE"){
					$fieldDetails['valDefault'] = "";
				}

				$fieldDetails['modified_by'] = $this->input->post('SadminID');
				$fieldDetails['created_by'] = $this->input->post('SadminID');
				$fieldDetails['created_date'] = $updateDate;
				$fieldDetails['column_name']  = str_replace(" ","_",strtolower($fieldDetails['fieldLabel']));
				$iscreated = $this->CommonModel->saveMasterDetails('dynamic_fields', $fieldDetails);
				$menuId = $fieldDetails['menuId'];
				$where = array('menuId' => $menuId);
				$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $where);
				$tabName = $tabNameMenu[0]->table_name; //$fieldDetails['table_name'];
				$vtype = $fieldDetails['fieldType'];
				//$fieldDetails['fieldLabel']  = str_replace(" ","_",strtolower($fieldDetails['fieldLabel']));
				
				switch ($vtype) {
					case 'Textarea':
						$fields[$fieldDetails['column_name']]['type'] = 'TEXT';
						//$fields[$fieldDetails['fieldLabel']]['constraint'] = $fieldDetails['maxLength'];
						break;
					case 'Numeric':
						if ($fieldDetails['maxLength'] == 0 || $fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 11;
						$fieldDetails['numType'] = $this->validatedata->validate('numType', 'Number Type', true, '', array());
						$fields[$fieldDetails['column_name']]['type'] = $fieldDetails['numType'];
						$fields[$fieldDetails['column_name']]['constraint'] = $fieldDetails['maxLength'];
						break;
					case 'Datepicker':
						$fields[$fieldDetails['column_name']]['type'] = 'DATE';
						break;
					case 'Timepicker':
						$fields[$fieldDetails['column_name']]['type'] = 'TIME';
						break;
						// case 'Textbox':
						// case 'File':
						// case 'Dropdown':
						// case 'Radiobutton':
						// case 'Checkbox':
						// case 'Password':
						// case 'Timepicker':
					default:
						if ($fieldDetails['maxLength'] == 0 || $fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 300;
						$fields[$fieldDetails['column_name']]['type'] = 'VARCHAR';
						$fields[$fieldDetails['column_name']]['constraint'] = $fieldDetails['maxLength'];
				}
				if(isset($fieldDetails['valDefault']) && !empty($fieldDetails['valDefault'])){
					$fields[$fieldDetails['column_name']]['default'] = $fieldDetails['valDefault'];
				}
				$fields[$fieldDetails['column_name']]['null'] = $fieldDetails['isNull'];
					
					// check if created feild is exiting in current table
				
					$this->datatables->add_column($tabName, $fields);
					
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					}
					break;
				}

			case "POST": {
					//$fieldDetails = array();
					$updateDate = date("Y/m/d H:i:s");
					$wheredyn = array('fieldID' => $id);
					if (!isset($id) || empty($id)) {
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
					//$fieldDetails['table_name'] = $this->validatedata->validate('table_name', 'Table Name', true, '', array());
					$fieldDetails['modified_by'] = $this->input->post('SadminID');
					$oldTabData = $this->CommonModel->getMasterDetails('dynamic_fields', '', $wheredyn);
					//print_r($fieldDetails);
					$fieldlableold = $oldTabData[0]->column_name;
					$fieldDetails['column_name']  = str_replace(" ","_",strtolower($fieldDetails['fieldLabel']));
					$iscreated = $this->CommonModel->updateMasterDetails('dynamic_fields', $fieldDetails, $wheredyn);
					//$tabName = "dynamic_" . $fieldDetails['menuId'];
					$menuId = $fieldDetails['menuId'];
					$wheremnu = array('menuId' => $menuId);
					$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $wheremnu);
					$tabName = $tabNameMenu[0]->table_name;
					//$tabName = $fieldDetails['table_name'];
					//$fieldDetails['fieldLabel']  = str_replace(" ","_",strtolower($fieldDetails['fieldLabel']));
					
					$vtype = $fieldDetails['fieldType'];
					if ($fieldlableold != $fieldDetails['column_name'])
						$fields[$fieldlableold]['name'] = $fieldDetails['column_name'];

					switch ($vtype) {
						case 'Textarea':
							$fields[$fieldlableold]['type'] = 'TEXT';
							$fields[$fieldlableold]['constraint'] = $fieldDetails['maxLength'];
							break;
						case 'Numeric':
							if ($fieldDetails['maxLength'] == 0 || $fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 11;
							$fields[$fieldlableold]['type'] = 'INT';
							$fields[$fieldlableold]['constraint'] = $fieldDetails['maxLength'];
							break;
						case 'Datepicker':
							$fields[$fieldlableold]['type'] = 'DATE';
							break;
						case 'Timepicker':
							$fields[$fieldlableold]['type'] = 'TIME';
							break;
						default:
							if ($fieldDetails['maxLength'] == 0 || $fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 300;
							$fields[$fieldlableold]['type'] = 'VARCHAR';
							$fields[$fieldlableold]['constraint'] = $fieldDetails['maxLength'];
					}

					$this->datatables->modify_column($tabName, $fields);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					}
					break;
				}
			case "DELETE": {
					$fieldDetails = array();
					$fieldDetails['idsToRemove'] = $this->input->post('list');
					$fieldDetails['menuId'] = $this->input->post('menuId');
					$iscreated = "";
					if ($id != "") {
						$where = array('fieldID' => $id);
						if (!isset($id) || empty($id)) {
							$status['msg'] = $this->systemmsg->getErrorCode(996);
							$status['statusCode'] = 996;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$iscreated = $this->CommonModel->deleteMasterDetails('dynamic_fields', $where);
					}

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
					$where = array("fieldID" => $id);
					$menuHistory = $this->CommonModel->getMasterDetails('dynamic_fields', '', $where);
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
	public function changeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('dynamic_fields', $statusCode, $ids, 'fieldID');
			$this->db->trans_start();
			if ($changestatus) {
				$idlist = explode(",", $ids);
				for ($i = 0; $i < count($idlist); $i++) {
					$id = $idlist[$i];
					$where = array('fieldID' => $id);
					$menuHistory = $this->CommonModel->getMasterDetails('dynamic_fields','', $where);
					if(isset($menuHistory) && !empty($menuHistory)){
						$fieldLabel = $menuHistory[0]->column_name;
						$menuId = $menuHistory[0]->menuID;
						$whereMenu = array('menuId' => $menuId);
						$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master','', $whereMenu);
						$tabName = $tabNameMenu[0]->table_name;
						if($this->datatables->check_field_exists($tabName,$menuHistory[0]->column_name)){
							$iscreated = $this->datatables->remove_column($tabName, $fieldLabel);
						}
						$this->CommonModel->deleteMasterDetails("dynamic_fields",$where);
					}
				}
				if ($this->db->trans_status() === FALSE) {
					$this->db->trans_rollback();
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status, 200);

				} else {
					$this->db->trans_commit();
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
	public function getFormData()
	{
		//$form,$dataID=''
		$this->response->decodeRequest();
		$form = $this->input->post('pluginName');
		$pluginId = $this->input->post('pluginId');
		if (!isset($form) && !isset($pluginId)) {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 280;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "dynamic_fields";
		$join[0]['alias'] = "d";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";

		$dynamicFieldHtml = "";
		if(isset($pluginId) && !empty($pluginId)){
			$wherec["t.menuID="] = "'" . $pluginId . "'";
		}else{
			$wherec["t.menuLink="] = "'" . $form . "'";
		}
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CommonModel->GetMasterListDetails($selectC = 't.menuLink,t.menuID,d.*', 'menu_master', $wherec, '', '', $join, $other);
		//if(isset($dynamicFields) && !empty($dynamicFields)){
			$wheredata["menuID"] = $pluginId;
			$dynamicFieldsMeta = $this->CommonModel->getMasterDetails("menu_master","metadata,c_metadata",$wheredata);
		//}
		
		if (isset($dynamicFields) && !empty($dynamicFields)) {
			$status['data'] = $dynamicFields;
			$status['metadata'] = $dynamicFieldsMeta[0]->metadata;
			$status['c_metadata'] = $dynamicFieldsMeta[0]->c_metadata;
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

	public function getLinkedFormData()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "menuName";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		$wherec["status"] = " = 'active'";
		$wherec["isClick"] = "= 'yes'";
		// get comapny access list
		$adminID = $this->input->post('SadminID');

		$join = array();
		$masterDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'menu_master', $wherec, '', '', $join, $other);
		$status['data'] = $masterDetails;

		if ($masterDetails) {

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

	public function updateColumnMetaDate()
	{
		$method = $this->input->post('method');
		$menuID = $this->input->post('menuId');
		if ($method == "POST") {

			$menuDetails['c_metadata'] = $this->validatedata->validate('htmlContent', 'Meta Data', false, '', array());
			
			if ($method == "POST") {
				$where = array('menuID' => $menuID);
				//print_r($menuDetails);
				$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuDetails, $where);
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
		}
	}

}