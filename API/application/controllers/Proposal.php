<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Proposal extends CI_Controller {

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


	public function getproposalDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = trim($this->input->post('textSearch'));
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('proposal_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('proposal_name');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "proposal_name";
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
		
		$adminID = $this->input->post('SadminID');
	
		$config["base_url"] = base_url() . "proposalDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('proposal_id','proposal',$wherec,$other);
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
			$proposalDetails = $this->CommonModel->GetMasterListDetails($selectC='*','proposal',$wherec,'','',$join,$other);	
		}else{
			
			// $join = array();
			// $join[0]['type'] ="LEFT JOIN";
			// $join[0]['table']="stateMaster";
			// $join[0]['alias'] ="s";
			// $join[0]['key1'] ="state";
			// $join[0]['key2'] ="stateID";

			// $join[1]['type'] ="LEFT JOIN";
			// $join[1]['table']="districtMaster";
			// $join[1]['alias'] ="d";
			// $join[1]['key1'] ="district";
			// $join[1]['key2'] ="districtID";
			
			$selectC = "*";
			$proposalDetails = $this->CommonModel->GetMasterListDetails($selectC='*','proposal',$wherec,$config["per_page"],$page,$join,$other);

		}
		$status['data'] = $proposalDetails;
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
		if($proposalDetails){
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

	public function proposal($proposal_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				$proposalDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $proposalDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

				$proposalDetails['proposal_id'] = $this->validatedata->validate('proposal_id','proposal_id',false,'',array());
				$proposalDetails['proposal_name'] = $this->validatedata->validate('proposal_name','proposal Name',false,'',array());
				// $proposalDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
				// $proposalDetails['company_name'] = $this->validatedata->validate('company_name','Company Name',false,'',array());

				
					  
					if($method=="PUT")
					{
						$lastProposalDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",array("docTypeID"=>"2"));
						if(!$lastProposalDetails){
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getErrorCode(267);
							$status['statusCode'] = 267;
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
						
						// $iticode=$proposalDetails['proposal_id'];
						$proposalDetails['status'] = "active";
						$proposalDetails['created_by'] = $this->input->post('SadminID');
						$projectDetails['proposal_number'] = $lastProposalDetails[0]->docPrefixCD.$lastProposalDetails[0]->docCurrNo."/".$lastProposalDetails[0]->docYearCD;
						$proposalDetails['created_date'] = $updateDate;
						
						$iscreated = $this->CommonModel->saveMasterDetails('proposal',$proposalDetails);
						
						if(!$iscreated){
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);

						}else{
							$inID = array("docCurrNo"=>($lastProposalDetails[0]->docCurrNo+1));
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
						$where=array('proposal_id'=>$proposal_id);
						if(!isset($proposal_id) || empty($proposal_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$proposalDetails['modified_by'] = $this->input->post('SadminID');
					$proposalDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('proposal',$proposalDetails,$where);
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
			$proposalDetails = array();
			$where=array('sID'=>$proposal_id);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('proposal',$where);
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
				
				$where = array("proposal_id"=>$proposal_id);
				$proposalDetails = $this->CommonModel->getMasterDetails('proposal','',$where);
				if(isset($proposalDetails) && !empty($proposalDetails)){

				$status['data'] = $proposalDetails;
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

    public function proposalchangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('proposal',$statusCode,$ids,'proposal_id');
				
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