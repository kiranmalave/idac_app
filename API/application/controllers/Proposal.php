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
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('proposal_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$project_id = $this->input->post('project_id');
		$company = $this->input->post('company');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "t.name";
			$order ="ASC";
		}else{
			$orderBy = "t.created_date";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}

		if(isset($project_id) && !empty($project_id)){
			$wherec["t.project_id = "] = $project_id;
		}

		if (isset($company) && !empty($company)) {
			$wherec["t.client_id like"] = "'" . $company . "%'";
		}

		
		$wherer["adminID = "] = $this->input->post('SadminID');
		$roleID = $this->CommonModel->getMasterDetails('admin','roleID',$wherer);
		if($roleID[0]->roleID != 1){
			$wherec["t.confirm"] = 'IN("yes")';
		}

		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="project";
		$join[0]['alias'] ="p";
		$join[0]['key1'] ="project_id";
		$join[0]['key2'] ="project_id";

		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="customer";
		$join[1]['alias'] ="c";
		$join[1]['key1'] ="client_id";
		$join[1]['key2'] ="customer_id";

		$wherec["c.status"] = 'IN ("active")';
		$adminID = $this->input->post('SadminID');
	
		$config["base_url"] = base_url() . "proposalDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('proposal_id','proposal',$wherec,$other,$join);
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
			if($roleID[0]->roleID != 1){
				$selectC = "proposal_id,proposal_number,t.name,t.project_id,t.client_id,t.description,confirm,t.created_by,t.created_date,t.modified_by,t.modified_date,t.status";
			}else{
				$selectC='*';
			}
			$proposalDetails = $this->CommonModel->GetMasterListDetails($selectC,'proposal',$wherec,'','',$join,$other);	
		}else{
			if($roleID[0]->roleID != 1){
				$selectC = "proposal_id, proposal_number, t.name, t.project_id, t.client_id, t.description, confirm, t.created_by, t.created_date, t.modified_by, t.modified_date, t.status, c.name AS custName , p.confirm_proposal, p.project_name";
			}else{
				$selectC = "t.*, c.name AS custName ,p.confirm_proposal, p.project_name";
			}
			$proposalDetails = $this->CommonModel->GetMasterListDetails($selectC,'proposal',$wherec,$config["per_page"],$page,$join,$other);
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
		if($method=="POST"||$method=="PUT")
		{
				$proposalDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$proposalDetails['proposal_id'] = $this->validatedata->validate('proposal_id','proposal_id',false,'',array());
				$proposalDetails['name'] = $this->validatedata->validate('name','Proposal Name',false,'',array());
				$proposalDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
				$proposalDetails['client_id'] = $this->validatedata->validate('client_id','Client Name',false,'',array());
				$proposalDetails['temp_id'] = $this->validatedata->validate('temp_id','Template',false,'',array());
				$proposalDetails['cost'] = $this->validatedata->validate('cost','Cost',false,'',array());
				$proposalDetails['project_id'] = $this->validatedata->validate('project_id','Project Name',false,'',array());
				$proposalDetails['status'] = $this->validatedata->validate('status','Status',false,'',array());
				$isCopy = $this->validatedata->validate('copy','copy',false,'',array());

					if($method=="PUT")
					{
						$lastProposalDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",array("docTypeID"=>"3"));
						
						if(!$lastProposalDetails){
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getErrorCode(267);
							$status['statusCode'] = 267;
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
							$wherePro=array('project_id'=>$proposalDetails['project_id']);
							$projectNumber = $this->CommonModel->getMasterDetails('project','project_number',$wherePro);
							$where=array('project_id'=>$proposalDetails['project_id'],'client_id'=>$proposalDetails['client_id']);
							$oldProposalDetail = $this->CommonModel->getMasterDetails('proposal','proposal_id',$where);
							if(isset($oldProposalDetail) && !empty($oldProposalDetail)){
							$proposalCount = count($oldProposalDetail)+1;
								$proposalDetails['proposal_number'] = $projectNumber[0]->project_number."/".$lastProposalDetails[0]->docPrefixCD.$proposalCount;
							} else {
								$proposalDetails['proposal_number'] = $projectNumber[0]->project_number."/".$lastProposalDetails[0]->docPrefixCD."1";
							}

						$proposalDetails['status'] = "active";
						$proposalDetails['created_by'] = $this->input->post('SadminID');
						//$proposalDetails['proposal_number'] = $lastProposalDetails[0]->docPrefixCD.$lastProposalDetails[0]->docCurrNo."/".$lastProposalDetails[0]->docYearCD."/1";
						$proposalDetails['created_date'] = $updateDate;
						// print_r("<pre>");
						// print_r($proposalDetails);exit;
						$iscreated = $this->CommonModel->saveMasterDetails('proposal',$proposalDetails);
						
						if(!$iscreated){
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);

						}else{
							$inID = array("docCurrNo"=>($lastProposalDetails[0]->docCurrNo+1));
							$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,array("docTypeID"=>"3"));
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
						if($isCopy == "yes"){
							$where=array('proposal_id'=>$proposal_id);
							$proposalDetail = $this->CommonModel->getMasterDetails('proposal','',$where);
							if(isset($proposalDetail)&&!empty($proposalDetail)){
							$proposalDetail = json_decode(json_encode($proposalDetail[0]), true);
							$currentProposalNumber = $proposalDetail['proposal_number'];
							// print_r($currentProposalNumber);exit;
							$matches = array();	
							$currentProposalNumber = $proposalDetail['proposal_number'];
							if (preg_match('/_(\d+)$/', $currentProposalNumber, $matches)) {
								$proposalDetail['proposal_number'] = preg_replace('/_(\d+)$/', '_' . ($matches[1] + 1), $currentProposalNumber);
							} else {
								$proposalDetail['proposal_number'] .= '_1';
							}
							$proposalDetail['name'] = $this->validatedata->validate('name','Proposal Name',false,'',array());
							$proposalDetail['description'] = $this->validatedata->validate('description','Description',false,'',array());
							$proposalDetail['cost'] = $this->validatedata->validate('cost','cost',false,'',array());
							unset($proposalDetail['proposal_id']);
							$iscreated = $this->CommonModel->saveMasterDetails('proposal',$proposalDetail);
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

						}else{
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
							$wherer["adminID = "] = $this->input->post('SadminID');
							$roleID = $this->CommonModel->getMasterDetails('admin','roleID',$wherer);
							if($roleID[0]->roleID != 1){
								$selectC = "proposal_id,proposal_number,name,project_id,client_id,description,confirm,created_by,created_date,modified_by,modified_date,status";
							}else{
								$selectC = "*";
							}
							$proposalDetails = $this->CommonModel->getMasterDetails('proposal',$selectC,$where);
							if(isset($proposalDetails) && !empty($proposalDetails)){
								$wherec["project_id"] = "".$proposalDetails[0]->project_id."";
								$selectC = "confirm_proposal";
								$confirmation = $this->CommonModel->getMasterDetails('project',$selectC, $wherec);
							if(!empty($confirmation)){
								$created = array_column($confirmation,'confirm_proposal');
								$proposalDetails[0]->confirmProposal = $created;
							}
							
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

	public function confirmProposal()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$proposal_id = $this->input->post("proposal_id");
		$project_id = $this->input->post("project_id");	
		$statuscode = $this->input->post("status");
		$updateDate = date("Y/m/d H:i:s");

		if(trim($statuscode) == "yes"){
			$where=array('proposal_id'=>$proposal_id);
			$proposalDetails['confirm'] = "yes";
			$proposalDetails['modified_by'] = $this->input->post('SadminID');
			$proposalDetails['modified_date'] = $updateDate;
			$confirmProposal = $this->CommonModel->updateMasterDetails('proposal',$proposalDetails,$where);

			$wherec=array('project_id'=>$project_id);
			$projectDetails['confirm_proposal'] = "yes";
			$projectDetails['modified_by'] = $this->input->post('SadminID');
			$projectDetails['modified_date'] = $updateDate;
			$confirmProject = $this->CommonModel->updateMasterDetails('project',$projectDetails,$wherec);
			
			if(!$confirmProposal || !$confirmProject){
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

	public function printProposal($proposal_id,$adminID)
	{
		$where["proposal_id = "] = $proposal_id;
		$selectC = "proposal_id,proposal_number,t.name,p.project_name,c.name AS company_name,t.description,confirm,cost, t.modified_date, t.created_date";
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="project";
		$join[0]['alias'] ="p";
		$join[0]['key1'] ="project_id";
		$join[0]['key2'] ="project_id";

		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="customer";
		$join[1]['alias'] ="c";
		$join[1]['key1'] ="client_id";
		$join[1]['key2'] ="customer_id";

		$proposalDetails = $this->CommonModel->GetMasterListDetails($selectC,'proposal',$where,'','',$join,'');
		// print_r($proposalDetails);exit;
		$description = $proposalDetails[0]->description;
		$details = array() ;
		if($proposalDetails[0]->modified_date == "0000-00-00 00:00:00"){
			$date = $proposalDetails[0]->created_date;
		}else{
			$date = $proposalDetails[0]->modified_date;
		}
		
		$where = array("adminID"=> $adminID);	
		$roleID = $this->CommonModel->getMasterDetails('admin','roleID',$where);
		$proposalDetails[0]->roleID = $roleID[0]->roleID;
		$proposalDetails[0]->date = $date;
		if (isset($description) && !empty($description) && isset($proposalDetails[0])) {
			$keys = ["{{name}}", "{{project_name}}", "{{company_name}}", "{{proposal_number}}", "{{modified_date}}"];
			
			foreach ($keys as $key) {
				$property = trim(str_replace(array('{{', '}}'), '', $key), '{}'); // Extract property name from key
				$C_value = isset($proposalDetails[0]->$property) ? $proposalDetails[0]->$property : '';
				// print_r($property);exit;
				// Check if property is modified_date and not equal to "0000-00-00"
				if ($property == 'modified_date' && $C_value == "0000-00-00 00:00:00") {
					$C_value = $proposalDetails[0]->created_date;
					$description = str_replace($key, $C_value, $description);
					$proposalDetails[0]->description = $description;
				} elseif (strpos($description, $key) !== false) {
					$description = str_replace($key, $C_value, $description);
					$proposalDetails[0]->description = $description;
				}
			}
		}
		if($proposalDetails[0]->modified_date == "0000-00-00 00:00:00"){
			$proposalDetails[0]->modified_date = $proposalDetails[0]->created_date;
		}
		$data= array();
	 	$data['proposalData']= $proposalDetails;
	 	$logo = $this->config->item('imagesPATH').'idac_logo.png';
	 	$smallLogo = $this->config->item('imagesPATH').'idacSmallLogo.png';
        $pdfFilePath = $this->load->view("proposalpdf",$data,true);
        $header = '<table width="100%"><tr><td width="25%" style="text-align:left"><img style="" width="50px" src="'.$smallLogo.'"></td><td width="50%" style="text-align:center">'.$proposalDetails[0]->company_name . ' - ' . $proposalDetails[0]->project_name.'</td><td width="25%" style="text-align:right">KB</td></tr></table>';

        $footer ='<hr><table width="100%">
			<tr>
				<td width="25%" style="text-align:left">'.$proposalDetails[0]->proposal_number.'</td>
				<td width="50%" style="text-align:center">{PAGENO} of {nbpg}</td>
				<td width="25%" style="text-align:right">'.$proposalDetails[0]->modified_date.'</td>
			</tr>
		</table>';

        //load mPDF library
        $this->load->library('MPDFCI');
		$this->mpdfci->SetWatermarkImage($this->config->item( 'app_url' )."/images/idac_logo.png",0.3,'F',array(17,50));
		$this->mpdfci->SetHeader($header);
        
        $this->mpdfci->WriteHTML('<table width="100%">
			<tr>
				<td style="height: '.($h-40).'pt; text-align: center; vertical-align: middle; padding: 0px 5px; margin: 0;"></td>
			</tr>
			<tr>
				<td style="height:152pt;text-align: center;vertical-align: middle;"><img style="" width="180px" src="'.$logo.'"></td>
			</tr>
			<tr><td style="text-align: center;vertical-align: middle;">
				<h3>Proposal</h3>
				<h2></h2>
			</td>
			</tr>
			<tr>
				<td style="height: 80pt;text-align: center;vertical-align: middle;">
				<h3>'.$proposalDetails[0]->project_name.'</h3>
			</tr>
			<tr>
				<td style="text-align: center;vertical-align: middle;">
				<p>for</p>
			</tr>
			<tr>
				<td style="height: 80pt;text-align: center;vertical-align: middle;">
				<h3>'.$proposalDetails[0]->company_name.'</h3>
			</tr>
			<tr>
				<td style="text-align: center;vertical-align: middle;">
				<p>by</p>
			</tr>
			<tr>
				<td style="height: 80pt;text-align: center;vertical-align: middle;">
				<b>Dr Kiran Bhagate</b> BE, MTech, PhD, MIMechE, CEng(UK)
				<h3>IDAC India Pvt Ltd</h3>
			</tr>

		</table>');

		$this->mpdfci->AddPage('','NEXT-ODD','','','','','','','','','',$this->mpdfci->SetHeader($header),$this->mpdfci->SetHTMLFooter($footer), '', '',1, 1, 0, 0);
		$this->mpdfci->SetHTMLFooter($footer);
 	    $this->mpdfci->WriteHTML($pdfFilePath);
 	    $this->mpdfci->AddPage('','NEXT-ODD','','','','','','','','','',$this->mpdfci->SetHeader($header),$this->mpdfci->SetHTMLFooter($footer), '', '',1, 1, 0, 0);
 	    $this->mpdfci->WriteHTML('<div>'.$proposalDetails[0]->cost.'</div>');
       	$this->mpdfci->Output();  
	}
 }