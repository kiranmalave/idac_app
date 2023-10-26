<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Project extends CI_Controller {

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


	public function getprojectDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = trim($this->input->post('textSearch'));
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('project_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$company_name = $this->input->post('company_name');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "project_id";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){

		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if (isset($company) && !empty($company)) {
			$wherec["client_id like"] = "'" . $company . "%'";
		}
		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}
		
		$adminID = $this->input->post('SadminID');
	
		$config["base_url"] = base_url() . "projectDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('project_id','project',$wherec,$other);
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
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="customer";
			$join[0]['alias'] ="c";
			$join[0]['key1'] ="client_id";
			$join[0]['key2'] ="customer_id";

			$selectC = "t.*, c.company_name as client_id";

			if(isset($statuscode) && !empty($statuscode)){
				$statusStr = str_replace(",",'","',$statuscode);
				$wherec["c.status"] = 'IN ("'.$statusStr.'")';
				}
			$projectDetails = $this->CommonModel->GetMasterListDetails($selectC='*','project',$wherec,'','',$join,$other);	
		}else{
			
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="customer";
			$join[0]['alias'] ="c";
			$join[0]['key1'] ="client_id";
			$join[0]['key2'] ="customer_id";

			$selectC = "t.*, c.company_name as client_id";

			if(isset($statuscode) && !empty($statuscode)){
				$statusStr = str_replace(",",'","',$statuscode);
				$wherec["c.status"] = 'IN ("'.$statusStr.'")';
				}
				
			$projectDetails = $this->CommonModel->GetMasterListDetails($selectC,'project',$wherec,$config["per_page"],$page,$join,$other);

		}
		//print_r($companyDetails);exit;
		$status['data'] = $projectDetails;
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
		if($projectDetails){
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

	public function project($project_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		// print_r($method);exit;
		if($method=="POST"||$method=="PUT")
		{
				$projectDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $projectDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

			//	$projectDetails['project_id'] = $this->validatedata->validate('project_id','project_id',false,'',array());
				$projectDetails['project_name'] = $this->validatedata->validate('project_name','project Name',false,'',array());
				$projectDetails['client_id'] = $this->validatedata->validate('client_id','client ID',false,'',array());
                $projectDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
				//$lastProjectDetails = $this->CommonModel->getMasterDetails("docPrefix","docPrefixCD,docYearCD,docCurrNo",array("docTypeID"=>"2"));
					  
					if($method=="PUT")
					{
						$lastProjectDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",array("docTypeID"=>"2"));
						if(!$lastProjectDetails){
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getErrorCode(267);
							$status['statusCode'] = 267;
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
						
						$projectDetails['status'] = "active";
						$projectDetails['created_by'] = $this->input->post('SadminID');
						$projectDetails['project_number'] = $lastProjectDetails[0]->docPrefixCD.$lastProjectDetails[0]->docCurrNo."/".$lastProjectDetails[0]->docYearCD;
						$projectDetails['created_date'] = $updateDate;
						
						// print_r($lastInvoiceDetails);exit;

						$iscreated = $this->CommonModel->saveMasterDetails('project',$projectDetails);
						
						if(!$iscreated){
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array(0);
							$status['flag'] = 'F';
							$this->response->output($status,200);

						}else{
							$inID = array("docCurrNo"=>($lastProjectDetails[0]->docCurrNo+1));
							$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,array("docTypeID"=>"2"));
							if(!$isupdate){
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

					}elseif($method=="POST")
					{
						$where=array('project_id'=>$project_id);
						if(!isset($project_id) || empty($project_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$projectDetails['modified_by'] = $this->input->post('SadminID');
					$projectDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('project',$projectDetails,$where);
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
			
	
		}elseif($method=="dele")
		{
			$projectDetails = array();
			$where=array();
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('project',$where);
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
	
		}else
		{ 
				
				$where = array("project_id"=>$project_id);
				$projectDetails = $this->CommonModel->getMasterDetails('project','',$where);
				if(isset($projectDetails) && !empty($projectDetails)){

				$status['data'] = $projectDetails;
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

    public function projectchangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('project',$statusCode,$ids,'project_id');
				
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