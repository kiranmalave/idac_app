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
		if ($method == "PUT" || $method == "POST") {
			$fieldDetails = array();
			$updateDate = date("Y/m/d H:i:s");
		}
		if ($action != "" && $action == "DELETE")
			$method = "DELETE";
		// echo $method;
		// exit;
		switch ($method) {
			case "PUT": {
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
					$fieldDetails['menuId'] = $this->validatedata->validate('menuId', 'Menu', true, '', array());
					//$fieldDetails['menuId'] = 2;
					if ($fieldDetails['valDefault'] == "USER_DEFINED") {
						$userDef = $this->input->post('userDef');
						$fieldDetails['valDefault'] = $userDef;
					}

					$fieldDetails['modified_by'] = $this->input->post('SadminID');
					$fieldDetails['created_by'] = $this->input->post('SadminID');
					$fieldDetails['created_date'] = $updateDate;

					$iscreated = $this->CommonModel->saveMasterDetails('dynamic_fields', $fieldDetails);
					$menuId = $fieldDetails['menuId'];
					$where = array('menuId' => $menuId);
					$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $where);
					$tabName = $tabNameMenu[0]->table_name; //$fieldDetails['table_name'];
					$vtype = $fieldDetails['fieldType'];
					switch ($vtype) {
						case 'Textarea':
							$fields[$fieldDetails['fieldLabel']]['type'] = 'TEXT';
							//$fields[$fieldDetails['fieldLabel']]['constraint'] = $fieldDetails['maxLength'];
							break;
						case 'Numeric':
							if ($fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 11;
							$fields[$fieldDetails['fieldLabel']]['type'] = $fieldDetails['numType'];
							$fields[$fieldDetails['fieldLabel']]['constraint'] = $fieldDetails['maxLength'];
							break;
						case 'Datepicker':
							$fields[$fieldDetails['fieldLabel']]['type'] = 'DATE';
							break;
						case 'Timepicker':
							$fields[$fieldDetails['fieldLabel']]['type'] = 'TIME';
							break;
							// case 'Textbox':
							// case 'File':
							// case 'Dropdown':
							// case 'Radiobutton':
							// case 'Checkbox':
							// case 'Password':
							// case 'Timepicker':
						default:
							if ($fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 300;
							$fields[$fieldDetails['fieldLabel']]['type'] = 'VARCHAR';
							$fields[$fieldDetails['fieldLabel']]['constraint'] = $fieldDetails['maxLength'];
					}

					$fields[$fieldDetails['fieldLabel']]['default'] = $fieldDetails['valDefault'];
					$fields[$fieldDetails['fieldLabel']]['null'] = $fieldDetails['isNull'];
					// echo "<pre>";
					// print_r($fieldDetails);
					// print_r($fields);
					// exit;
					/*$sExist = $this->datatables->check_table_exist($tabName);
					if ($sExist == 0) {
						$this->datatables->create_table($tabName, $fields);
					} else {*/
					$this->datatables->add_column($tabName, $fields);
					//}
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

					$fieldDetails['fieldLabel'] = $this->input->post('fieldLabel');
					$fieldDetails['fieldType'] = $this->input->post('fieldType');
					$fieldDetails['placeholder'] = $this->input->post('placeholder');
					$fieldDetails['defaultValue'] = $this->input->post('defaultValue');
					$fieldDetails['fieldOptions'] = $this->input->post('fieldOptions');
					$fieldDetails['allowMultiSelect'] = $this->input->post('allowMultiSelect');
					$fieldDetails['minLength'] = $this->validatedata->validate('minLength', 'Min Length', false, '', array());
					$fieldDetails['maxLength'] = $this->validatedata->validate('maxLength', 'Max Length', false, '', array());

					$fieldDetails['status'] = $this->input->post('status');
					$fieldDetails['menuId'] = $this->input->post('menuId');
					//$fieldDetails['table_name'] = $this->validatedata->validate('table_name', 'Table Name', true, '', array());
					$fieldDetails['modified_by'] = $this->input->post('SadminID');
					$oldTabData = $this->CommonModel->getMasterDetails('dynamic_fields', '', $wheredyn);
					//print_r($fieldDetails);
					$fieldlableold = $oldTabData[0]->fieldLabel;
					$iscreated = $this->CommonModel->updateMasterDetails('dynamic_fields', $fieldDetails, $wheredyn);
					//$tabName = "dynamic_" . $fieldDetails['menuId'];
					$menuId = $fieldDetails['menuId'];
					$wheremnu = array('menuId' => $menuId);
					$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $wheremnu);
					$tabName = $tabNameMenu[0]->table_name;
					//$tabName = $fieldDetails['table_name'];
					$vtype = $fieldDetails['fieldType'];
					if ($fieldlableold != $fieldDetails['fieldLabel'])
						$fields[$fieldlableold]['name'] = $fieldDetails['fieldLabel'];
					switch ($vtype) {
						case 'Textarea':
							$fields[$fieldlableold]['type'] = 'TEXT';
							$fields[$fieldlableold]['constraint'] = $fieldDetails['maxLength'];
							break;
						case 'Numeric':
							if ($fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 11;
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
							if ($fieldDetails['maxLength'] == "") $fieldDetails['maxLength'] = 300;
							$fields[$fieldlableold]['type'] = 'VARCHAR';
							$fields[$fieldlableold]['constraint'] = $fieldDetails['maxLength'];
					}

					// $sExist = $this->datatables->check_table_exist($tabName);
					// if ($sExist == 0) {
					// 	$this->datatables->create_table($tabName, $fields);
					// } else {
					//print_r($fields);
					//exit;
					$this->datatables->modify_column($tabName, $fields);
					//}
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
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('dynamic_fields', $statusCode, $ids, 'fieldID');

			if ($changestatus) {
				$idlist = explode(",", $ids);
				for ($i = 0; $i < count($idlist); $i++) {
					$id = $idlist[$i];

					$where = array('fieldID' => $id);
					$menuHistory = $this->CommonModel->getMasterDetails('dynamic_fields', '', $where);
					if (isset($menuHistory) && !empty($menuHistory)) {
						$fieldLabel = $menuHistory[0]->fieldLabel;
						//$table_name = $menuHistory[0]->table_name;
						//$menuId = $menuHistory[0]->menuID;;
						//$tabName = "dynamic_" . $menuId;
						$menuId = $menuHistory[0]->menuID;
						$where = array('menuId' => $menuId);
						$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $where);
						$tabName = $tabNameMenu[0]->table_name;
						//$tabName = $table_name;
						$iscreated = $this->datatables->remove_column($tabName, $fieldLabel);
					}
				}
				if ($iscreated) {
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
		$pluginId = $this->input->post('pluginId'); //bySanjay
		if (!isset($form)) {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 280;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "menu_master";
		$join[0]['alias'] = "m";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";

		$dynamicFieldHtml = "";
		$wherec["m.menuLink="] = "'" . $form . "'";
		//$wherec["m.menuID="] = "'" . $pluginId . "'";
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CommonModel->GetMasterListDetails($selectC = 't.*,m.menuLink', 'dynamic_fields', $wherec, '', '', $join, $other);

		if (isset($dynamicFields) && !empty($dynamicFields)) {
			//$fields = $this->db->list_fields('dynamic_' . $pluginId);
			// $fields = $this->db->field_data('dynamic_' . $pluginId);
			// foreach ($fields as $field) {
			// 	//echo "<br>" . $field;
			// 	print_r($field);
			// }
			$status['data'] = $dynamicFields;
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
		$t = $this->input->post('textSearch');
		$t = $t ?? '';
		$textSearch = trim($t);
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
}
