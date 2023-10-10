<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CategoryMaster extends CI_Controller
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

	public function getcategoryDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$t = $this->input->post('textSearch');
		$t = $t ?? '';
		$textSearch = trim($t);
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('category_id');
		$is_parent = $this->input->post('is_parent');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy'); //"t.created_date";
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$sub = $this->input->post('isSub');
		$childOf = $this->input->post('childOf');
		$wherec = $join = array();
		if ($childOf == 'yes') {
			$wherecid["t.categoryName"] = ' = "' . $textval . '"';
			$t = $this->CommonModel->GetMasterListDetails($selectC = '*', 'categories', $wherecid, '', '');
			$parentID = $t[0]->category_id;
			if (isset($parentID) && !empty($parentID)) {
				$wherec["t.parent_id"] = ' = "' . $parentID . '"';
				$textval = "";
				$textSearch = "";
				$is_parent = "no";
			}
			//$t["category_id"] = $this->CommonModel->getCountByParameter('category_id','categories',$wherec,$other);
		}



		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "categoryName";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');

		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {

			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		if (isset($is_parent) && !empty($is_parent)) {
			$wherec["t.is_parent"] = ' = "' . $is_parent . '"';
		}


		$adminID = $this->input->post('SadminID');

		// $join[0]['type'] ="LEFT JOIN";
		// $join[0]['table']="categories";
		// $join[0]['alias'] ="c";
		// $join[0]['key1'] ="parent_id";
		// $join[0]['key2'] ="category_id";

		$config["base_url"] = base_url() . "categoryDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('category_id', 'categories', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		//$selectC = "t.*, c.categoryName AS parentCategoryName";
		if ($isAll == "Y") {
			$join = array();
			$categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'categories', $wherec, '', '', $join, $other);
		} else {
			$categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'categories', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		// get sub category
		// $sub ="N";
		if ($sub == "Y") {
			foreach ($categoryDetails as $key => $value) {
				$wherec = array();
				$wherec["t.parent_id"] = ' = "' . $value->category_id . '"';
				$wherec["t.status"] = ' = "active"';
				$SubcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id,categoryName,slug', 'categories', $wherec, '', '', $join, $other);
				$categoryDetails[$key]->SubList = $SubcategoryDetails;
			}
		} else {
			foreach ($categoryDetails as $key => $value) {
				if (isset($value->parent_id) && !empty($value->parent_id)) {
					$wherec = array();
					$wherec["t.category_id"] = ' = "' . $value->parent_id . '"';
					//$wherec["t.status"] = ' = "active"';
					$SubcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'categoryName', 'categories', $wherec, '', '', $join, $other);
					if (isset($SubcategoryDetails) && !empty($SubcategoryDetails)) {
						$categoryDetails[$key]->parentCatName = $SubcategoryDetails[0]->categoryName;
					} else {
						$categoryDetails[$key]->parentCatName = "--";
					}
				}
			}
		}


		$status['data'] = $categoryDetails;
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
		if ($categoryDetails) {
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

	public function categoryMaster($category_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$categoryDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$categoryDetails['category_id'] = $this->validatedata->validate('category_id', 'category ID', false, '', array());

			$categoryDetails['parent_id'] = $this->validatedata->validate('parent_id', 'Parent Menu', false, '', array());

			$categoryDetails['categoryName'] = $this->validatedata->validate('categoryName', 'Category Name', true, '', array());

			$categoryDetails['slug'] = $this->validatedata->validate('slug', 'Category Slug', true, '', array());

			$categoryDetails['is_parent'] = $this->validatedata->validate('is_parent', 'Category Parent', true, '', array());

			$categoryDetails['description'] = $this->validatedata->validate('description', 'description', false, '', array());

			$categoryDetails['cover_image'] = $this->validatedata->validate('cover_image', 'Select Picture', false, '', array());

			// $categoryDetails['profile_pic_view'] = $this->validatedata->validate('profile_pic_view','Profile Picture',true,'',array());



			// print_r($method);exit();
			if ($method == "PUT") {
				$iticode = $categoryDetails['category_id'];
				$categoryDetails['status'] = "active";
				$categoryDetails['created_by'] = $this->input->post('SadminID');
				$categoryDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('categories', $categoryDetails);
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
				$where = array('category_id' => $category_id);
				if (!isset($category_id) || empty($category_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$categoryDetails['modified_by'] = $this->input->post('SadminID');
				$categoryDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryDetails, $where);
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
				$categoryDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('categories', $where);
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

			$where = array("category_id" => $category_id);
			$categoryDetails = $this->CommonModel->getMasterDetails('categories', '', $where);
			if (isset($categoryDetails) && !empty($categoryDetails)) {

				$status['data'] = $categoryDetails;
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

	public function CategoryChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('categories', $statusCode, $ids, 'category_id');

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
	public function getslugList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');

		$slug = $this->input->post('slug');
		$statuscode = $this->input->post('status');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "categoryName";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);


		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {

			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		// print_r($wherec);exit;
		}
		if (isset($is_parent) && !empty($is_parent)) {
			$parentStr = str_replace(",", '","', $is_parent);
			$wherec["t.is_parent"] = ' = "' . $parentStr . '"';
		}

		if (isset($slug) && !empty($slug)) {
			$slugStr = str_replace(",", '","', $slug);
			$wherec["t.slug"] = 'IN ("' . $slugStr . '")';
		}

		$adminID = $this->input->post('SadminID');

		$join = array();
		$categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id,slug,categoryName,parent_id,is_parent', 'categories', $wherec, '', '', $join, $other);
		// print_r($categoryDetails);exit;
		$wherec = array();
		foreach ($categoryDetails as $key => $value) {
			$wherec["t.parent_id"] = ' = "'.$value->category_id.'"';
			$wherec["t.status"] = 'IN ("active")';
			$subcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC='category_id,slug,categoryName,parent_id,is_parent','categories',$wherec,'','',$join,$other);
			$categoryDetails[$key]->sublist = $subcategoryDetails;
		}

		$status['data'] = $categoryDetails;

		$status['paginginfo'] = [];
		$status['loadstate'] = true;

		if ($categoryDetails) {
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
