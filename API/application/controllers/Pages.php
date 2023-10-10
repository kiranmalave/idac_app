<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pages extends CI_Controller {

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
	}

	public function getPagesDetailsList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "pageTitle";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="created_by";
		$join[0]['key2'] ="adminID";

		$config["base_url"] = base_url() . "pagesDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('pageID',"pages_master",$wherec,'',$join);
	    $config["uri_segment"] = 2;
	    $this->pagination->initialize($config);
	    if(isset($curPage) && !empty($curPage)){
		$curPage = $curPage;
		$page = $curPage * $config["per_page"];
		}
		else{
		$curPage = 0;
		$page = 0;
		}
		

		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','pages_master',$wherec,'','',$join,$other);	
		}else{
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','pages_master',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
		$status['data'] = $pagesDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if($curPage <=1)
		$status['paginginfo']["prevPage"] = 0;
		else
		$status['paginginfo']["prevPage"] = $curPage - 1 ;

		$status['paginginfo']["pageLimit"] = $config["per_page"] ;
		$status['paginginfo']["nextpage"] =  $curPage+1 ;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
		$status['loadstate'] = true;
		if($config["total_rows"] <= $status['paginginfo']["end"])
		{
		$status['msg'] = $this->systemmsg->getErrorCode(232);
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$status['loadstate'] = false;
		$this->response->output($status,200);
		}
		if($pagesDetails){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}				
	}
	public function pageMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$pagesMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			$pagesMasterDetails['pageTitle'] = $this->validatedata->validate('pageTitle','page title',false,'',array());

			$pagesMasterDetails['pageSubTitle'] = $this->validatedata->validate('pageSubTitle','page Sub Link',false,'',array());

			$pagesMasterDetails['pageLink'] = $this->validatedata->validate('pageLink','page Link',false,'',array());

			$pagesMasterDetails['keywords'] = $this->validatedata->validate('keywords','Keywords',false,'',array());

			$pagesMasterDetails['metaDesc'] = $this->validatedata->validate('metaDesc','metaDesc',false,'',array());

			$pagesMasterDetails['description'] = $this->validatedata->validate('description','description',false,'',array());

			$pagesMasterDetails['isParent'] = $this->validatedata->validate('isParent','isParent',false,'',array()); 

			$pagesMasterDetails['PageCode'] = htmlspecialchars($this->validatedata->validate('pageCode','Page Code',false,'',array()));
			$pagesMasterDetails['pageCss'] = $this->validatedata->validate('pageCss','Page Css',false,'',array());
			$pagesMasterDetails['PageContent'] = htmlspecialchars($this->validatedata->validate('pageContent','Page Content',false,'',array()));
			
			$pagesMasterDetails['isHome'] = $this->validatedata->validate('isHome','isHome',false,'',array());

			$pagesMasterDetails['scriptForPage'] = $this->validatedata->validate('scriptForPage','scriptForPage',false,'',array());
			
			$pagesMasterDetails['cssForPage'] = $this->validatedata->validate('cssForPage','cssForPage',false,'',array());

			$pagesMasterDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
			$pagesMasterDetails['tempType'] = $this->validatedata->validate('tempType','Template Type',true,'',array());
			
			if($pagesMasterDetails['isHome']=="yes")
			{

				$iscreated = $this->CommonModel->updateAllRows('pages_master',$isHomeUpdate=array("isHome"=>"no"));
			}

			if($method=="PUT")
			{
				
				$pagesMasterDetails['created_by'] = $this->input->post('SadminID');
				$pagesMasterDetails['created_date'] = $updateDate;
				$pagesMasterDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('pages_master',$pagesMasterDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
				
			if($method=="POST")
			{
				$where=array('pageID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				$pagesMasterDetails['modified_by'] = $this->input->post('SadminID');
				$pagesMasterDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('pages_master',$pagesMasterDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
		}else if($method=="DELETE")
		{	
			$pagesMasterDetails = array();

			$where=array('pageID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('pages_master',$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}	
		else
		{
			$where = array("pageID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('pages_master','',$where);
			if(isset($userRoleHistory) && !empty($userRoleHistory)){

			if(isset($userRoleHistory[0]->pageCode) && !empty($userRoleHistory[0]->pageCode)){
				$userRoleHistory[0]->pageCode = htmlspecialchars_decode($userRoleHistory[0]->pageCode);
			}	
			if(isset($userRoleHistory[0]->pageContent) && !empty($userRoleHistory[0]->pageContent)){
				$userRoleHistory[0]->pageContent = htmlspecialchars_decode($userRoleHistory[0]->pageContent);
			}	
				
			$status['data'] = $userRoleHistory;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
			}else{

			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
			}
		}
		
	}
	public function pageChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('pages_master',$statusCode,$ids,'pageID');
				
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

	public function getPagesMenuMasterList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "menuName";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}

		
		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','pages_menu',$wherec,'','',$join,$other);	
		}
		
		$status['data'] = $pagesDetails;
		if($pagesDetails){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}				
	}

	
		public function pagesMenuMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$pagesMenuDetails=array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			$pagesMenuDetails['menuName'] = $this->validatedata->validate('menuName','menu Name',true,'',array());

			$pagesMenuDetails['isPrimary'] = $this->input->post('isPrimary');
			$pagesMenuDetails['isSecondary'] = $this->input->post('isSecondary');
			$pagesMenuDetails['isFooter'] = $this->input->post('isFooter');


			if($method=="PUT")
			{
				if($pagesMenuDetails['isPrimary'])
				{
					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isPrimary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isSecondary'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isSecondary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isFooter'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isFooter']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				
				$pagesMenuDetails['created_by'] = $this->input->post('SadminID');
				$pagesMenuDetails['created_date'] = $updateDate;
				$pagesMenuDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('pages_menu',$pagesMenuDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
				 
			if($method=="POST")
			{
				$where=array('menuID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
					// echo "jiiii";exit();
				}
				if($pagesMenuDetails['isPrimary'])
				{
					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isPrimary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isSecondary'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isSecondary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isFooter'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isFooter']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				
				$pagesMenuDetails['status'] = $this->input->post('status');
				$pagesMenuDetails['modified_by'] = $this->input->post('SadminID');
				$pagesMenuDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('pages_menu',$pagesMenuDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
		}else if($method=="DELETE")
		{	
			$pagesMenuDetails = array();

			$where=array('menuID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('pages_menu',$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}	
		else
		{
			$where = array("menuID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('pages_menu','',$where);
			if(isset($userRoleHistory) && !empty($userRoleHistory)){

			$status['data'] = $userRoleHistory;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
			}else{

			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
			}
		}
		
	}
	public function updatemenuPagesList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$menuID = $this->input->post("menuID");
		$updatedList = $this->input->post("updatedList");
		$pageIDs = $this->input->post("pageIDs");
		//print_r($pageIDs);
		if(isset($menuID)&&!empty($menuID))
		{
			$where=array('menuID'=>$menuID);
		$isDeleted = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
			$idlist = explode(",",$updatedList);
			$created_by = $this->input->post("SadminID");
			$updateDate = date("Y/m/d H:i:s");
			$position=1;
			foreach ($idlist as $key => $value) {
				$menuPagesList=array('menuID'=>$menuID,'pageID'=>$value,"created_by"=>$created_by,"created_date"=>$updateDate,"position"=>$position++);
			$iscreated = $this->CommonModel->saveMasterDetails('menu_pages_master',$menuPagesList);
			}
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);



		}else
		{
			$status['msg'] = "Please Select Menu";
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);

		}
	}

	public function menuPagesList()	
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$menuID = $this->input->post('menuID');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "position";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}
		if(isset($menuID) && !empty($menuID)){
			$wherec["menuID"] = '= ("'.$menuID.'")';
		}
		$wherec["parentPageID"] = '= 0';
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="pages_master";
		$join[0]['alias'] ="p";
		$join[0]['key1'] ="pageID";
		$join[0]['key2'] ="pageID";
		$selectC="t.*,p.pageTitle";
		if($isAll=="Y"){
			$pageList = $this->CommonModel->GetMasterListDetails($selectC,'menu_pages_master',$wherec,'','',$join,$other);
		}
		
		$status['data'] = '';
		if($pageList){
			//print_r($pageList);exit;
			$pagesDetails = [];
			foreach($pageList as $page){
				if(!empty($menuID))
					$wherec["menuID"] = '= '.$menuID;
				$wherec["parentPageID"] = '= '.$page->pageID;
				//print_r($wherec);
				$subPageList = $this->CommonModel->GetMasterListDetails($selectC,'menu_pages_master',$wherec,'','',$join,$other);
				$page->subMenu = $subPageList;
				$pagesDetails[] = $page;
			}
			$status['data'] = $pagesDetails;
			
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}

	}
	
	public function deletePageFromSelectedMenu()
	{		
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$pageID = $this->input->post('pageID');
			$menuID = $this->input->post('menuID');
			$where=array("pageID"=>$pageID,"menuID"=>$menuID);

			

			$iscreated = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
			if(!$iscreated){
				// Delete child
				$where=array("parentPageID"=>$pageID,"menuID"=>$menuID);
				$iscreated = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
	}

	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		$menuID = $this->input->post("menuID");

		if(trim($action) == "changePositions"){
			$pageIDs = json_decode($this->input->post("pageIDs"), true);
			foreach($pageIDs as $pos=>$pageData){
				if(isset($pageData['children'])){
					$childrens = [];
					foreach($pageData['children'] as $cpos=>$children){
						
						$subMenuPagesDetails['position']=$cpos+1;
						$subMenuPagesDetails['parentPageID']=$pageData['pageid'];
						$where=array('pageID'=>$children['pageid'],"menuID"=>$menuID);

						$this->CommonModel->updateMasterDetails('menu_pages_master',$subMenuPagesDetails,$where);
					}
				}
				$menuPagesDetails['position']=$pos+1;
				$where=array('pageID'=>$pageData['pageid'],"menuID"=>$menuID);

				$iscreated = $this->CommonModel->updateMasterDetails('menu_pages_master',$menuPagesDetails,$where);
			}
		
		//  print_r($positions);exit();
		 	/*
			$positions = $this->input->post("positions");
			foreach ($positions as $positions) {
		 	$index=$positions[0];
		 	$newPosition=$positions[1];
		 	$menuPagesDetails['position']=$newPosition;
		 	$where=array('menuPageID'=>$index);
		 	$iscreated = $this->CommonModel->updateMasterDetails('menu_pages_master',$menuPagesDetails,$where);
			 }*/
					 if(!$iscreated){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);

					}else{
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] =array();
						$status['flag'] = 'S';
						$this->response->output($status,200);
					}
		}
	}

}