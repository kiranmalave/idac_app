<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class TaxInvoice extends CI_Controller {

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
		$this->load->helper('form');
		$this->load->model('TaxInvoiceModel');
		$this->load->model('CreditModel');
		$this->load->model('BillingModel');
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library('ValidateData');
		
	}
	public function index()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$statuscode = $this->input->post('status');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$filterCName = $this->input->post('filterCName');
		$cutomerID = $this->input->post('customer_id');

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "invoiceNumber";
			$order ="DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}
		if(isset($filterCName) && !empty($filterCName)){
			$wherec["i.customer_id"] = ' = "'.$filterCName.'"';
		}
		
		if(isset($cutomerID) && !empty($cutomerID)){
			$wherec["i.customer_id"] = ' = "'.$cutomerID.'"';
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["i.status"] = 'IN ("' . $statusStr . '")';
		}

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		
		$config["base_url"] = base_url() . "members";
        $config["total_rows"] = $this->TaxInvoiceModel->getTotalTaxInvoice($wherec);
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
        $memberDetails = $this->TaxInvoiceModel->getTaxInvoiceDetails($selectC='',$wherec,$config["per_page"],$page,$join,$other);
		// print_r($memberDetails);exit;
		$status['data'] = $memberDetails;
		
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
		if($memberDetails){
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
	
	public function getTaxInvoiceDetails($ID='')
	{
		$this->response->decodeRequest();
		$this->access->checkTokenKey();
		
		$wherec = array("invoiceID"=>$ID);
		$select = "*,DATE_FORMAT(invoiceDate,'%d-%m-%Y') as invoiceDate";
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle($select,$wherec);
	 	$invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$wherec);
	 	
	 	if(isset($taxInvoiceData) && !empty($taxInvoiceData)){
			$taxInvoiceData[0]->invoiceLine = $invoiceLine;
			$status['data'] = $taxInvoiceData;
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
	
	public function taxInvoiceChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->TaxInvoiceModel->changeTaxInvoiceStatus('invoice_header',$statusCode,$ids,'invoiceID');
				
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
	public function invoiceItemList($value='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$invoiceLine = $this->input->post();
		// check is bill created
		$inDate =  dateFormat(($invoiceLine[0]->invoiceDate));
		$today =date("Y-m-d");
		if($today <$inDate){
			// error Back dated invoice can not create
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(275);
			$status['statusCode'] = 275;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}

		$lastIn = $this->TaxInvoiceModel->getLastInvoice();
		$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID);
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
		if(!isset($taxInvoiceData) || empty($taxInvoiceData)){
			$isNew = "yes";
			if(isset($lastIn) && !empty($lastIn)){
				$inDate = dateFormat(($invoiceLine[0]->invoiceDate));
				$oldDate = dateFormat(($lastIn[0]->invoiceDate));
				if($oldDate >$inDate){
					// error Back dated invoice can not create
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(276);
					$status['statusCode'] = 276;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
		}else{
			$isNew = "old";
			$inDate = dateFormat(($invoiceLine[0]->invoiceDate));
			$oldDate = dateFormat(($lastIn[0]->invoiceDate));
			$exDate = dateFormat(($taxInvoiceData[0]->invoiceDate));
			if(($oldDate >$inDate) && ($inDate !=$exDate)){
				// error Back dated invoice can not create
				$status['data'] = array();
				$status['msg'] =  $this->systemmsg->getErrorCode(276);
				$status['statusCode'] = 276;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
		
		if(!isset($invoiceLine[0]->customerID) && !empty($invoiceLine[0]->customerID)){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(236);
			$status['statusCode'] = 236;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		unset($invoiceLine['SadminID']);
		unset($invoiceLine['accessFrom']);
		$subTotal = 0;
		$grossAmount = 0;
		$sGst = $invoiceLine[0]->sgst;
		$cGst = $invoiceLine[0]->cgst;
		$iGst = $invoiceLine[0]->igst;
		$roundOff = 0;
		$inline = array();
		$i=0;
		// Get Last Count for Invoice
		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",array("docTypeID"=>"1"));
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$this->db->trans_begin();
		if($isNew=="yes"){
			$datacc = array(
				"invoiceDate"=>dateFormat($invoiceLine[0]->invoiceDate),
				"customer_id"=>$invoiceLine[0]->customerID,
				"stateGstPercent"=>$invoiceLine[0]->stateGstPercent,
				"centralGstPercent"=>$invoiceLine[0]->centralGstPercent,
				"interGstAmount"=>$invoiceLine[0]->interGstPercent,
				"invoiceNumber"=>$lastInvoiceDetails[0]->docPrefixCD.$lastInvoiceDetails[0]->docCurrNo.$lastInvoiceDetails[0]->docYearCD,
				"status"=>'pending',
				"created_by"=>$this->input->post('SadminID'),"created_date"=>date("Y-m-d H:i:s"));

			$invoiceID = $this->TaxInvoiceModel->createTaxInvoiceInfo($datacc);
			if(!$invoiceID){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
				$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,array("docTypeID"=>"1"));
				if(!$isupdate){
					$this->db->trans_rollback();
				   	$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(277);
					$status['statusCode'] = 277;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
			foreach ($invoiceLine as $key => $value) {
				$invoiceLine[$key]->invoiceID = $invoiceID;
	 		}
	 	}
	 	$error = array();
	 	if(isset($invoiceLine) && !empty($invoiceLine)){

	 		foreach ($invoiceLine as $key => $value) {
				
				if($key !=0)
				{
					if(!isset($value->invoiceLineChrgID ) || empty($value->invoiceLineChrgID )){
						$error[] = "Item type can not blank. Row No.".$value->srno."\n";
					}
					if(!isset($value->quantity) || empty($value->quantity)){
						$error[] = "Item quantity can not blank. Row No.".$value->srno."\n";
					}
					if(!isset($value->rate) || empty($value->rate)){
						$error[] = "Item rate can not blank. Row No.".$value->srno."\n";
					}
				}
			}
		}
		if(isset($error) && !empty($error)){
			
				$strer = implode(' ', $error);
				$status['data'] = array();
				$status['msg'] =$strer;
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
		}
		if(isset($invoiceLine) && !empty($invoiceLine)){

			foreach ($invoiceLine as $key => $value) {
				if($key !=0){
					$inline[$i]["srNo"]=$value->srno;
					$inline[$i]["invoiceID"]=$value->invoiceID;
					$i++;
					$sel = "*";
					$wher = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
					$itemDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
					
					if(isset($itemDetails) && !empty($itemDetails)){
						// update item
						$rate = number_format($value->rate,2, '.', '');
						$amt = number_format(($value->quantity * $rate),2, '.', '');
						if($itemDetails[0]->isEdit == "no"){
							$data = array("invoiceLineNarr"=>$value->description);	

						}else{
							$data = array("invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineNarr"=>$value->description,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit);

						}
						$wherup = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
						$isupdate = $this->TaxInvoiceModel->saveInvoiceLineInfo($data,$wherup);
						
					}else{
						// Insert item
						$rate = number_format($value->rate,2, '.', '');
						$amt = number_format(($value->quantity * $rate),2, '.', '');
						$data = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno,"invoiceLineNarr"=>$value->description,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit,"isEdit"=>"yes");

						$isupdate = $this->TaxInvoiceModel->createInvoiceLineInfo($data);
					}
					if(!$isupdate){

						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(277);
						$status['statusCode'] = 277;
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$subTotal += $amt;
				}
			}
		}
	
		$subTotal = number_format($subTotal,2, '.', ''); 
		if($this->db->trans_status() === FALSE)
		{
			$sqlerror = $this->db->error();
			$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		   	$this->db->trans_rollback();
		   	$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(277);
			$status['statusCode'] = 277;
			$status['flag'] = 'F';
			$this->response->output($status,200);

		}else{

			$this->db->trans_commit();
			$datain = array();
			$datain['invoiceDate'] = dateFormat(($invoiceLine[0]->invoiceDate));
			$datain['invoiceTotal'] = $subTotal;
			
			if($sGst == "yes"){
				
				$datain['stateGstPercent'] =$invoiceLine[0]->stateGstPercent;
				$datain['stateGstAmount'] = number_format(($subTotal*$invoiceLine[0]->stateGstPercent/100),2, '.', ''); 
			}else{
				$datain['stateGstPercent'] =$invoiceLine[0]->stateGstPercent;
				$datain['stateGstAmount'] = 0; 
			}
			if($cGst == "yes"){

				$datain['centralGstPercent'] = $invoiceLine[0]->centralGstPercent;
				$datain['centralGstAmount'] = number_format(($subTotal*$invoiceLine[0]->centralGstPercent/100),2, '.', ''); 
			}else{
				$datain['centralGstPercent'] = $invoiceLine[0]->centralGstPercent;
				$datain['centralGstAmount'] = 0; 
			}
			if($iGst == "yes"){

				$datain['interGstPercent'] = $invoiceLine[0]->interGstPercent;
				$datain['interGstAmount'] = number_format(($subTotal*$invoiceLine[0]->interGstPercent/100),2, '.', ''); 
			}else{
				$datain['interGstPercent'] = $invoiceLine[0]->interGstPercent;
				$datain['interGstAmount'] = 0;
			}
			$gm = number_format(($subTotal + $datain['stateGstAmount'] + $datain['centralGstAmount'] + $datain['interGstAmount']),2, '.', '');
			$datain['grossAmount'] = round($gm);

			$datain['roundOff'] = number_format($datain['grossAmount']-$gm,2,'.', '');
			$datain['modified_by'] = $this->input->post('SadminID');
			$datain['modified_date'] = date("Y-m-d H:i:s");
			$datain['status'] ='active';
			$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID,"customer_id"=>$invoiceLine[0]->customerID);
			$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($datain,$wherec);

			if(!$isup){
				
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);	

			}else{

				$srnoarr = array_column($inline,"srNo");
				$sel = "*";
				$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID);
				$invoiceLineDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
				// delete item which is not in list
				$todel = array();
				foreach ($invoiceLineDetails as $key => $value){
					if(!in_array($value->srNo,$srnoarr)){
						$todel[] = $value->srNo;
					}
				}
				if(isset($todel) && !empty($todel)){
					$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID,"isEdit"=>"yes");
					$this->TaxInvoiceModel->deleteitems($wher,$todel);
					
				}
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);	
			}
		}
	}

	public function getNarration($type="invoice"){

		$type = trim($type);
		
		$where = array("type ="=>"'".$type."'");
		$getNarrList = $this->CommonModel->GetMasterListDetails("invoiceChargeID,invoiceChargeName,invoiceChargeNarr","invoice_charge_master",$where);
		
		if(isset($getNarrList) && !empty($getNarrList)){
				$status['data'] = $getNarrList;
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
	public function cancelInvoice($invoiceID){

		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		if(isset($invoiceID) && !empty($invoiceID)){

			$where = array("invoiceID"=>$invoiceID);
			$dd = array("status"=>"cancel");
			$isUpdate = $this->TaxInvoiceModel->saveTaxInvoiceInfo($dd,$where);
			
			if(isset($isUpdate) && !empty($isUpdate)){

				$where = array("invoiceID"=>$invoiceID);
				$isPresent = $this->CreditModel->getCreditDetailsSingle($where);
				if(isset($isPresent) && !empty($isPresent)){

					$where = array("creditID"=>$isPresent[0]->creditID);
					$dd = array("status"=>"cancel");
					$isUpdate = $this->CreditModel->saveCreditInfo($dd,$where);
					
					if(isset($isUpdate) && !empty($isUpdate)){
						$status['data'] = array();
						$status['statusCode'] = 200;
						$status['flag'] = 'S';
						$this->response->output($status,200);
							
					}else{

						$where = array("invoiceID"=>$invoiceID);
						$dd = array("status"=>"pending");
						$isUpdate = $this->TaxInvoiceModel->saveTaxInvoiceInfo($dd,$where);
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}
				}
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
		}else{

			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}
		
	}

	
	public function printBill($invoiceID)
	{
		// check is bill created
		$data= array();
		$wherec = array("infoID"=>1);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
	 	$data['infoSettings']= $contract;

		$invoiceLine = $this->input->post();
		// check is bill created
		
		$wherec = array("invoiceID"=>$invoiceID);
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
	 	$data['taxInvoiceData']= $taxInvoiceData;
	 	
	 	$sel = "*";
		$wher = array("invoiceID"=>$invoiceID);
		$invoiceLineDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['counDetails']= "-";	
		//this the the PDF filename that user will get to download
	
		$wherec = array("customer_id"=>$taxInvoiceData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","first_name, address",$wherec);
		$data['companyDetails'] = $customerDetails;
		
        $pdfFilePath = $this->load->view("invoicepdf",$data,true);

        //load mPDF library
        $this->load->library('MPDFCI');
        $this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
 	    $this->mpdfci->WriteHTML($pdfFilePath);
       	$this->mpdfci->Output();  
	}
	
}
