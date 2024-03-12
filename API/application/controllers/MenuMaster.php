<?php
defined('BASEPATH') or exit('No direct script access allowed');

class MenuMaster extends CI_Controller
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
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
	}
	public function getMenuDetails()
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

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "menuIndex";
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


		$config["base_url"] = base_url() . "menuDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('menuID', 'menu_master', $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		// if($isAll=="Y"){
		// 	$menuDetails = $this->CommonModel->GetMasterListDetails($selectC='','menu_master',$wherec,'','',$join,$other);	
		// }else{
		// 	$menuDetails = $this->CommonModel->GetMasterListDetails($selectC='','menu_master',$wherec,$config["per_page"],$page,$join,$other);	
		// }
		$wherec["isParent"] = '= "yes"';
		$menuList = $this->CommonModel->GetMasterListDetails($selectC = '', 'menu_master', $wherec, '', '', $join, $other);
		//print count($menuList);

		$menuDetails = [];
		foreach ($menuList  as $key => $menu) {
			if (!empty($menu))
				$wherec = array();
			$wherec["parentID"] = '= ' . $menu->menuID;
			$subMenuList = $this->CommonModel->GetMasterListDetails($selectC, 'menu_master', $wherec, '', '', $join, $other);
			$menu->subMenu = $subMenuList;
			$menuDetails[] = $menu;
		}
		//$status['data'] = $pagesDetails;

		$status['data'] = $menuDetails;

		if ($menuDetails) {
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
	public function menuMaster($id = '')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "PUT" || $method == "POST") {

			$menuDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			
			$menuDetails['isParent'] = $this->validatedata->validate('isParent','Is Parent Status',true,'',array());
			$menuDetails['menuIndex'] = $this->validatedata->validate('menuIndex','Menu Index',true,'',array());
			$menuDetails['isClick'] = $this->validatedata->validate('isClick','is clickable',true,'',array());
			$menuDetails['iconName'] = $this->validatedata->validate('iconName','Icon Name',false,'',array());
			$menuDetails['mobile_screen'] = $this->validatedata->validate('mobile_screen','Mobile Screen',false,'',array());
			$menuDetails['linked'] = $this->validatedata->validate('linked','Is Linked',true,'',array());
			$menuDetails['is_custom'] = $this->validatedata->validate('is_custom','Is Custom',true,'',array());
			$menuDetails['custom_module'] = $this->validatedata->validate('custom_module','Custom Module',true,'',array());
			$menuDetails['plural_label'] = $this->validatedata->validate('plural_label','Plural Label',false,'',array());
			$menuDetails['label'] = $this->validatedata->validate('label','Label',false,'',array());
			$menuDetails['module_desc'] = $this->validatedata->validate('module_desc','Description',false,'',array());
			$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
			$menuDetails['menu_custom_link'] = $this->validatedata->validate('menu_custom_link','Custom Link',false,'',array());
			$menuDetails['table_name'] = $this->validatedata->validate('table_name', 'Table Name', false, '', array());
			//print $menuDetails['custom_module']; exit;
			if ($menuDetails['isParent'] == "no") {
				$menuDetails['parentID'] = $this->validatedata->validate('parentID', 'Parent ID', true, '', array());
			} else {
				$menuDetails['parentID'] = $this->validatedata->validate('parentID', 'Parent ID', false, '', array());
			}
			$menuDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			if ($menuDetails['custom_module'] == "yes") {
				$menuDetails['menuLink'] = $this->validatedata->validate('menuLink', 'Menu Link', true, '', array());
			}
		}
		$this->db->trans_start();
		switch ($method) {
			case "PUT": {
					if ($menuDetails['custom_module'] == "yes") {
						$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
						$menuDetails['module_name'] = strtolower(str_replace(" ", "_", $this->validatedata->validate('module_name', 'Module Name', false, '', array())));
					} else {
						$menuDetails['module_name'] = strtolower(str_replace(" ", "_", $this->validatedata->validate('module_name', 'Module Name', true, '', array())));
						$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
					}

					$menuDetails['created_by'] = $this->input->post('SadminID');
					$menuDetails['created_date'] = $updateDate;

					$iscreated = $this->CommonModel->saveMasterDetails('menu_master', $menuDetails);
					if (!$iscreated) {
						// if menu create and it`s not link with cutom module then create table
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						if ($menuDetails['custom_module'] != "yes") {
							$this->datatables->createTable($menuDetails['module_name']);
						}
						if ($this->db->trans_status() === FALSE) {
							$this->db->trans_rollback();
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$this->db->trans_commit();
						}

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
					$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuDetails, $where);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
					}
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

					$iscreated = $this->CommonModel->deleteMasterDetails('menu_master', $where);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
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
					$where = array("menuID" => $id);

					$menuHistory = $this->CommonModel->getMasterDetails('menu_master', '', $where);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
					} else {
						$this->db->trans_commit();
					}

					if (isset($menuHistory) && !empty($menuHistory)) {
						$dynamicFieldHtml = "";
						$wherec["menuID="] = $id;
						$other = array("orderBy" => "fieldIndex", "order" => "ASC");
						$dynamicFields = $this->CommonModel->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, '', '', '', $other);
						$menuHistory["dynamicFields"] = $dynamicFields;
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
	public function menuChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('menu_master', $statusCode, $ids, 'menuID');

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
	public function getMenuList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$order = array("orderBy" => "menuIndex", "order" => "ASC");
		$where = array("status =" => "'active'", "isParent =" => "'yes'");
		$menuHistory = $this->CommonModel->GetMasterListDetails('*', 'menu_master', $where, '', '', array(), $order);
		foreach ($menuHistory as $key => $value) {

			$whereSub = array("status" => "active", "isParent" => "no", "parentID" => $value->menuID);
			$subMenuHistory = $this->CommonModel->getMasterDetails('menu_master', '', $whereSub);
			$menuHistory[$key]->subMenu = $subMenuHistory;
		}
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
	}
	public function accessMenuList($roleID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = $this->input->post('SadminID');
		$method = $this->input->method(TRUE);

		$order = array();
		$where = array("roleID =" => "'" . $roleID . "'");
		$modelAccess = $this->CommonModel->GetMasterListDetails('*', 'model_access', $where, '', '', array(), array());
		if (isset($modelAccess) && !empty($modelAccess)) {
			$preMenuList = json_decode($modelAccess[0]->accessList);
		} else {
			$preMenuList = array();
		}

		if ($method == "PUT" || $method == "POST") {

			$updateDate = date("Y/m/d H:i:s");
			$saveAccess =  array();

			foreach ($_POST as $key => $value) {
				if (is_object($value) && !empty($value->menuID)) {
					$saveAccess[] = $value;
				}
			}
			$data['roleID'] = $roleID;
			$data['accessList'] = json_encode($saveAccess);
			//print_r($saveAccess);exit;
			if (isset($modelAccess) && !empty($modelAccess)) {
				// update
				$data['modified_by'] = $adminID;
				$data['modified_date'] = $updateDate;
				$where = array('roleID' => $roleID);
				$issave = $this->CommonModel->updateMasterDetails("model_access", $data, $where);
			} else {
				// add 
				$data['created_by'] = $adminID;
				$data['created_date'] = $updateDate;
				$issave = $this->CommonModel->saveMasterDetails("model_access", $data);
			}

			if ($issave) {

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

		$where = array("status =" => "'active'");
		$order = array("orderBy" => "menuName", "order" => "ASC");
		$menuHistory = $this->CommonModel->GetMasterListDetails('menuID,menuName,parentID,menuLink', 'menu_master', $where, '', '', array(), $order);
		foreach ($menuHistory as $key => $value) {

			$menuHistory[$key]->add = "no";
			$menuHistory[$key]->edit = "no";
			$menuHistory[$key]->delete = "no";
			$menuHistory[$key]->view = "no";

			foreach ($preMenuList as $key2 => $value2) {
				if (isset($preMenuList) && !empty($preMenuList)) {
					if ($value2->menuID == $value->menuID) {
						$menuHistory[$key]->add = $value2->add;
						$menuHistory[$key]->edit = $value2->edit;
						$menuHistory[$key]->delete = $value2->delete;
						$menuHistory[$key]->view = $value2->view;
					}
				}
			}
		}
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
	}
	public function getUserPermission()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = $this->input->post('SadminID');
		$where = array("adminID" => $adminID);
		$userDetails = $this->CommonModel->getMasterDetails("admin", "roleID", $where);
		if (!isset($userDetails) || empty($userDetails)) {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$order = array();
		$where = array("roleID =" => "'" . $userDetails[0]->roleID . "'");
		$modelAccess = $this->CommonModel->GetMasterListDetails('roleID,accessList', 'model_access', $where, '', '', array(), array());
		$roleArr = array();
		if (isset($modelAccess) && !empty($modelAccess)) {
			$preMenuList = json_decode($modelAccess[0]->accessList);
			foreach ($preMenuList as $key => $value) {
				$where  = array("menuID = "=>$value->menuID);
				$getMobileName = $this->CommonModel->GetMasterListDetails('mobile_screen','menu_master',$where,'','',array(),array());
				if(isset($getMobileName) && !empty($getMobileName)){
					$value->mobile_screen =  $getMobileName[0]->mobile_screen;
				}else{
					$value->mobile_screen =  "";
				}
				$roleArr[$value->menuLink] = $value;
			}
			$status['data'] = $roleArr;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(274);
			$status['statusCode'] = 274;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function userAccess()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$updateDate = date("Y/m/d H:i:s");
		$list = $this->input->post('list');
		$userID = $this->input->post('adminID');
		$adminID = $this->input->post('SadminID');

		$where = array("adminID =" => "'" . $userID . "'");
		$companyAccess = $this->CommonModel->GetMasterListDetails('*', 'companyAccess', $where, '', '', array(), array());

		$data['adminID'] = $userID;
		$data['companyList'] = $list;

		if (isset($companyAccess) && !empty($companyAccess)) {
			// update
			$data['modified_by'] = $adminID;
			$data['modified_date'] = $updateDate;
			$where = array('adminID' => $userID);
			$issave = $this->CommonModel->updateMasterDetails("companyAccess", $data, $where);
		} else {
			// add 
			$data['created_by'] = $adminID;
			$data['created_date'] = $updateDate;
			$issave = $this->CommonModel->saveMasterDetails("companyAccess", $data);
		}

		if ($issave) {

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

	public function accessCompanyList($userID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->model('SearchAdminModel');
		$where = array("status =" => "'active'");
		$companyList = $this->CommonModel->GetMasterListDetails('*', 'companyMaster', $where, '', '', array(), array());

		$where = array("adminID =" => "'" . $userID . "'");
		$companyAccess = $this->CommonModel->GetMasterListDetails('*', 'companyAccess', $where, '', '', array(), array());


		if (isset($companyAccess) && !empty($companyAccess)) {
			$list = explode(",", $companyAccess[0]->companyList);
			$accList = $this->SearchAdminModel->getAccessCompanyList($list);
			$data['companyAccess'] = $accList;
		} else {
			$data['companyAccess'] = array();
		}
		$data['companyList'] =  $companyList;
		$status['data'] = $data;
		$status['statusCode'] = 200;
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}
	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changePositions") {
			$menuIDs = json_decode($this->input->post("menuIDs"), true);
			foreach ($menuIDs as $pos => $menuData) {
				if (isset($menuData['children'])) {
					$childrens = [];
					foreach ($menuData['children'] as $cpos => $children) {
						$subMenuPagesDetails['menuIndex'] = $cpos + 1;
						$subMenuPagesDetails['parentID'] = $menuData['id'];
						$where = array("menuID" => $children['id']);
						$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $subMenuPagesDetails, $where);
					}
				}
				$menuPagesDetails['menuIndex'] = $pos + 1;
				$where = array('menuID' => $menuData['id']);
				$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuPagesDetails, $where);
			}

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

	public function saveMetaData(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$menuId = $this->input->post("menuId");
		$metadata = $this->input->post("htmlContent");
		$arr = array("metadata" => $metadata);
		$where = array("menuID" => $menuId);
		$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $arr, $where);
		
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
