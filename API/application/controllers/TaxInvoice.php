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
		$this->load->library("Datatables");
		$this->load->library("Filters");
		
	}
	public function index()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$statuscode = $this->input->post('status');
		$record_type = $this->input->post('record_type');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$company_id = $this->input->post('company_id');
		$filterCName = $this->input->post('filterCName');
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$join = array();
		
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];

			// create join for created by and modified data details
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="ad";
			$join[$jkey]['key1'] ="created_by";
			$join[$jkey]['key2'] ="adminID";
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="am";
			$join[$jkey]['key1'] ="modified_by";
			$join[$jkey]['key2'] ="adminID";
			if($selectC !=""){
				$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			}else{
				$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			}
		}
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "invoiceNumber";
			$order ="DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		// $wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}
		if(isset($filterCName) && !empty($filterCName)){
			$wherec["t.customer_id"] = ' = "'.$filterCName.'"';
		}
		if(isset($record_type) && !empty($record_type)){
			$wherec["t.record_type"] = ' = "'.$record_type.'"';
		}
		if(isset($statuscode) && !empty($statuscode)){
			$wherec["t.status"] = ' = "'.$statuscode.'"';
		}
		if(isset($company_id) && !empty($company_id)){
			$wherec["t.company_id"] = ' = "'.$company_id.'"';
		}
		// get comapny access list
		$adminID = $this->input->post('SadminID');
		
		// if ($isAll == "Y") {
		// 	$join = $wherec = array();
		// 	if (isset($statuscode) && !empty($statuscode)) {
		// 		$statusStr = str_replace(",", '","', $statuscode);
		// 		$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// 	}
		// }
		
		$config["base_url"] = base_url() . "members";
		$config["total_rows"] = $this->TaxInvoiceModel->getTotalTaxInvoice('invoiceID','invoice_header',$wherec,$other);
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
		// print_r($wherec);exit;
        $memberDetails = $this->TaxInvoiceModel->getTaxInvoiceDetails($selectC='',$wherec,$config["per_page"],$page,$join,$other);
		
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
		$select = "*,DATE_FORMAT(invoiceDate,'%d-%m-%Y') as invoiceDate,DATE_FORMAT(payment_date,'%d-%m-%Y') as payment_date,DATE_FORMAT(valid_until_date,'%d-%m-%Y') as valid_until_date";
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle($select,$wherec);
	 	$invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$wherec);
	 	$wherelogs = array("invoice_id = "=>$ID);
		$inDetails = $this->CommonModel->GetMasterListDetails($selectC="t.receipt_number,t.amount",'receipts',$wherelogs,'','',array(),$other=array());
	 	if(isset($taxInvoiceData) && !empty($taxInvoiceData)){
			$taxInvoiceData[0]->invoiceLine = $invoiceLine;
			$taxInvoiceData[0]->paymentLogs = $inDetails;
			// print_r($taxInvoiceData);
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
			$record_type = $this->input->post("record_type");
				// print_r($record_type);exit;
			if ($statusCode == 'approved')
			{
				$wheredoct = array();
				if($record_type == "invoice")
					$wheredoct["docTypeID"] = "1";
				else if($record_type == "quotation")
					$wheredoct["docTypeID"] = "3";	
				else if($record_type == "delivery")
					$wheredoct["docTypeID"] = "4";
				else if($record_type == "receipt")
					$wheredoct["docTypeID"] = "2";
				else if($record_type == "proforma")
					$wheredoct["docTypeID"] = "6";	
				
				// LAST COUNT INVOICE					
				$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
				if(!$lastInvoiceDetails){
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(267);
					$status['statusCode'] = 267;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				// UPDATE INVOICE NUMBER
				$deliveryDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.$lastInvoiceDetails[0]->docYearCD.'/'.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo);
				$deliveryDetails['status'] = 'approved';
				$isupdate = $this->CommonModel->updateMasterDetails("invoice_header",$deliveryDetails, array('invoiceID'=>$ids));
				if($isupdate){
					$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
					$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
					if(!$isupdate){
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(277);
						$status['statusCode'] = 277;
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}else
					{
						$oldqty = 0 ;
						$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$ids));
						if(isset($inLineData) && !empty($inLineData)){
							foreach ($inLineData as $key => $value) {
								$whereP = array('productID' => $value->invoiceLineChrgID);
								$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
									
								if(isset($getStock) && !empty($getStock)){

									$orderIn = $getStock[0]->orderIn;
									$orderSettle = $getStock[0]->orderSettle;
									$orderOpen = $getStock[0]->orderOpen;
									$orderCancel = $getStock[0]->orderCancel;
									$orderBalance = $getStock[0]->orderBalance;
									// $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
									// $avblStock['orderIn'] = $getOrderIn; 
									// $avblStock['orderBalance'] = $getOrderBlce;
									$orderSettle = $orderSettle + $value->invoiceLineQty;
									$getOrderBlce = number_format(floatval($orderOpen) + floatval($orderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26
									$avblStock['orderSettle'] = $orderSettle;
									$avblStock['orderBalance'] = $getOrderBlce;
									$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);	
								}
							}
						}else{
							// if($invoiceLine[0]->record_type == "delivery"){
							$oldqty = 0 ;
							$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$ids));
							if(isset($inLineData) && !empty($inLineData)){
								foreach ($inLineData as $key => $value) {
									$whereP = array('productID' => $value->invoiceLineChrgID);
									$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
										
									if(isset($getStock) && !empty($getStock)){
										$orderIn = $getStock[0]->orderIn;
										$orderSettle = $getStock[0]->orderSettle;
										$orderOpen = $getStock[0]->orderOpen;
										$orderCancel = $getStock[0]->orderCancel;
										$orderBalance = $getStock[0]->orderBalance;
										// $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
										// $avblStock['orderIn'] = $getOrderIn; 
										// $avblStock['orderBalance'] = $getOrderBlce;
										$orderSettle = $orderSettle + $value->invoiceLineQty;
										$getOrderBlce = number_format(floatval($orderOpen) + floatval($orderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26
										$orderCancel =	$orderCancel + $value->invoiceLineQty;
										$avblStock['orderCancel'] = $orderCancel;
										$avblStock['orderBalance'] = $getOrderBlce;
										$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
									}
								}						
							}
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
		}else
			{
				$deliveryDetails['status'] = 'cancel';
				$isupdate = $this->CommonModel->updateMasterDetails("invoice_header",$deliveryDetails, array('invoiceID'=>$ids));
				if ($isUpdate) {
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}else
				{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
		}
	}

	public function deleteTaxInvoices()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "delete"){
				$ids = $this->input->post("list");
				$where['invoiceID'] = $ids;
				$changestatus = $this->TaxInvoiceModel->deleteInvoices('',$where);
				
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

		// print_r($invoiceLine);exit;
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
		$roundOff = 0;
		$inline = array();
		$i=0;

		$wheredoct = array();
		if($invoiceLine[0]->record_type == "invoice")
			$wheredoct["docTypeID"] = "1";
		else if($invoiceLine[0]->record_type == "quotation")
			$wheredoct["docTypeID"] = "3";	
		else if($invoiceLine[0]->record_type == "delivery")
			$wheredoct["docTypeID"] = "4";
		else if($invoiceLine[0]->record_type == "receipt")
			$wheredoct["docTypeID"] = "2";
			
		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);

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
				"valid_until_date"=>dateFormat($invoiceLine[0]->valid_until_date),
				"customer_id"=>$invoiceLine[0]->customerID,
				"record_type"=>$invoiceLine[0]->record_type,
				"ship_to"=>$invoiceLine[0]->ship_to,
				"invoiceNumber"=>'',
				"status"=>'draft',
				"payment_date"=>$invoiceLine[0]->payment_date,
				"created_by"=>$this->input->post('SadminID'),"created_date"=>date("Y-m-d H:i:s")
			);

			if ($invoiceLine[0]->record_type == 'quotation') {
				if (!isset($invoiceLine[0]->isconvert)) {
					$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type);
					$datacc["status"]='approved';
				}
			}
			if ($invoiceLine[0]->record_type == 'receipt') {
				$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type);
				$datacc["status"]='approved';	
			}
			if (isset($invoiceLine[0]->isconvert) && $invoiceLine[0]->isconvert == 'yes') {
				$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type);
				$datacc["status"]='approved';
				$datacc["ref_quot_no"] = $invoiceLine[0]->quotationNumber;
				$invoiceLine[0]->invoiceNumberConvert = $datacc["invoiceNumber"] ;
			}
			// print_r($datacc);exit;
			$cDetails = $this->getCustomerDetails($invoiceLine[0]->customerID,$invoiceLine[0]->company_id,$invoiceLine[0]->record_type);
		
			if (isset($cDetails[0]->name)) {
				$datacc['customer_name'] = $cDetails[0]->name;
			}	
			if (isset($cDetails[0]->mobile_no)) {
				$datacc['customer_mobile']= $cDetails[0]->mobile_no;
			}
			if (isset($cDetails[0]->address)) {
				$datacc['customer_address']= $cDetails[0]->address;
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(291);
				$status['statusCode'] = 291;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
			if (isset($cDetails[0]->gst_no)) {
				$datacc['customer_gst']= $cDetails[0]->gst_no;
			}
			if (isset($cDetails[0]->mobile_no)) {
				$datacc['customer_s_mobile']= $cDetails[0]->mobile_no;
			}
			if (isset($cDetails[0]->address)) {
				$datacc['customer_address']= $cDetails[0]->address;
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(291);
				$status['statusCode'] = 291;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
			if (isset($cDetails[0]->customer_state)) {
				$datacc['customer_state'] = $cDetails[0]->customer_state;
			}		
			$datacc['terms']=$cDetails[0]->terms;
			
			$headerDetails = (array) $invoiceLine[0];
			$fieldData = $this->datatables->mapDynamicFeilds($invoiceLine[0]->record_type,$headerDetails);
			$datacc = array_merge($fieldData, $datacc);
			$invoiceID = $this->TaxInvoiceModel->createTaxInvoiceInfo($datacc);

			if(!$invoiceID){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				
				// $inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
				// $isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
				// print_r($isupdate);
				// exit;
				// if(!$isupdate){
				// 	$this->db->trans_rollback();
				//    	$status['data'] = array();
				// 	$status['msg'] = $this->systemmsg->getErrorCode(277);
				// 	$status['statusCode'] = 277;
				// 	$status['flag'] = 'F';
				// 	$this->response->output($status,200);
				// }
				
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
					if($invoiceLine[0]->record_type != "delivery"){
						if(!isset($value->rate) || empty($value->rate)){
							$error[] = "Item rate can not blank. Row No.".$value->srno."\n";
						}
					}else
					{
						if($value->rate== '' ){
							$value->rate == 0 ;
						}
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
					// $this->validateLine($value);
					$inline[$i]["srNo"]=$value->srno;
					$inline[$i]["invoiceID"]=$value->invoiceID;
					$i++;
					$sel = "*";
					$wher = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
					$itemDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
					$rate = 0 ;
					$amt = 0 ;

                    if($invoiceLine[0]->record_type == "delivery"){
                     $oldQuantity = 0 ;
                     $inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$invoiceLine[0]->invoiceID));
                     if (isset($inLineData) && !empty($inLineData)) {
                         if($value->invoiceLineChrgID == $inLineData[0]->invoiceLineChrgID)
                         	$oldQuantity = $inLineData[0]->invoiceLineQty;
                     }
                     $whereP = array('productID' => $value->invoiceLineChrgID);
                     $getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
                        
                     if(isset($getStock) && !empty($getStock)){
                         $orderIn = $getStock[0]->orderIn;
                         $orderSettle = $getStock[0]->orderSettle;
                         $orderOpen = $getStock[0]->orderOpen;
                         $orderCancel = $getStock[0]->orderCancel;
                         $orderBalance = $getStock[0]->orderBalance;
						 
                         $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
                         $getOrderBlce = number_format(floatval($orderOpen) + floatval($getOrderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26

                         $avblStock['orderIn'] = $getOrderIn; 
                         $avblStock['orderBalance'] = $getOrderBlce;
                            
                         $isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);

                     }else{
                         $orderIn = 0;
                         $orderSettle = 0;
                         $orderOpen = 0;
                         $orderCancel = 0;
                         $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');

                         $getOrderBlce = number_format(floatval($orderOpen) + floatval($getOrderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); 

                         $avblStock['orderIn'] = $getOrderIn; 
                         $avblStock['orderBalance'] = $getOrderBlce;
                         $avblStock['productID'] = $value->productID;

                         $isinsert1 = $this->CommonModel->saveMasterDetails('stocks',$avblStock);
                     }
                    }    

					if(isset($itemDetails) && !empty($itemDetails)){
						// update item
						if($value->rate!= '' ){
							$rate = number_format($value->rate,2, '.', '');
							$amt = number_format(($value->quantity * $rate),2, '.', '');
							$rate1 = number_format($value->rate,2, '.', '');
							$dis = 0 ;

							if (!isset($value->itemDiscount)) {
								$value->itemDiscount = 0 ;
							}
							if (isset($value->itemDiscountType)) {
								if ($value->itemDiscountType == 'amt') {
									$amt = $amt - ( $value->itemDiscount * $value->quantity) ;
									$rate1 = $rate1 - $value->itemDiscount;
								}else
								{
									print_r(' amt : '.$amt.'<br>');
									$dis = $rate1 * ($value->itemDiscount / 100) ;
									$rate1 = $rate1 - $dis ;
									$amt = $amt - ( $dis * $value->quantity) ;	
								}
							}
							$gs = 0 ;
							if ($value->interGstPercent != '') {
								
								if($value->withGst == 'y'){
									$gstAmt =  ($rate1 * 100) / ($value->interGstPercent + 100) ; 
									$gs = $rate1 - $gstAmt;
									$gs = $gs * ( $value->quantity );
								}else{
									$gstAmt =  $rate1 * ($value->interGstPercent / 100) ; 
									$gs = $gstAmt * ( $value->quantity ) ;
									$amt = $amt + $gs;
								}
							}
						}
						if($itemDetails[0]->isEdit == "yes"){
							$data = array('discount_type'=>$value->itemDiscountType ,'is_gst'=>$value->withGst,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"discount"=>$value->itemDiscount,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit,"igst"=>$value->interGstPercent,"igst_amt"=>$gs);//,"invoiceLineNarr"=>$value->description,
						}
						// print_r($data);
						$wherup = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
						$isupdate = $this->TaxInvoiceModel->saveInvoiceLineInfo($data,$wherup);
					}else{
						// Insert item
						if($value->rate!= '' ){
							$rate = number_format($value->rate,2, '.', '');
							$amt = number_format(($value->quantity * $rate),2, '.', '');
							$rate1 = number_format($value->rate,2, '.', '');
							$dis = 0 ;

							if (!isset($value->itemDiscount)) {
								$value->itemDiscount = 0 ;
							}
							if (isset($value->itemDiscountType)) {
								if ($value->itemDiscountType == 'amt') {
									$amt = $amt - ( $value->itemDiscount * $value->quantity) ;
									$rate1 = $rate1 - $value->itemDiscount;
								}else
								{
									$dis = $rate1 * ($value->itemDiscount / 100) ;
									$rate1 = $rate1 - $dis ;
									$amt = $amt - ( $dis * $value->quantity) ;	
								}
							}
							$gs = 0 ;
							if ($value->interGstPercent != '') {
								
								if($value->withGst == 'y'){
									$gstAmt =  ($rate1 * 100) / ($value->interGstPercent + 100) ; 
									$gs = $rate1 - $gstAmt;
									$gs = $gs * ( $value->quantity );
								}else{
									$gstAmt =  $rate1 * ($value->interGstPercent / 100) ; 
									$gs = $gstAmt * ( $value->quantity ) ;
									$amt = $amt + $gs;
								}
							}
						}
						$data = array("invoiceID"=>$value->invoiceID,'discount_type'=>$value->itemDiscountType,'is_gst'=>$value->withGst ,"srNo"=>$value->srno,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"discount"=>$value->itemDiscount,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit,"isEdit"=>"yes","igst"=>$value->interGstPercent,"igst_amt"=>$gs);//,"invoiceLineNarr"=>$value->description
						// print_r('<pre>');print_r($data);exit;
						$isupdate = $this->TaxInvoiceModel->createInvoiceLineInfo($data);
						if($isupdate){
							// if($invoiceLine[0]->record_type == "delivery")
							// {
							// 	$whereP = array('productID' => $value->invoiceLineChrgID);
							// 	$pdet = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
								
							// 	if (isset($pdet) && !empty($pdet))
							// 	{
							// 		if($isNew == "yes")
							// 		{
							// 			$bal = $pdet[0]->qtyBalance ;
							// 			if($bal > 0 && $bal >= $value->quantity )
							// 			{
							// 				$bal = $bal -  $value->quantity;
							// 			}else{
							// 				$status['data'] = array();
							// 				$status['msg'] = "Insufficient Stock Row No ".$value->srno ;
							// 				$status['statusCode'] = 277;
							// 				$status['flag'] = 'F';
							// 				$this->response->output($status,200);
							// 			}
							// 			$qtout = $value->quantity;
							// 			$pd = array("qtyBalance"=>$bal,"qtyOut"=>$qtout);
							// 			$iscreated = $this->CommonModel->updateMasterDetails('stocks', $pd,$whereP);
							// 		}
							// 	}		
							// }
						}
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
		$subTotal = $subTotal + intval($invoiceLine[0]->additionalCharges);
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
			$datain = array();
			$datain['invoiceDate'] = dateFormat(($invoiceLine[0]->invoiceDate));
			$datain['valid_until_date'] = dateFormat(($invoiceLine[0]->valid_until_date));
			$datain['ship_to'] = $invoiceLine[0]->ship_to;
			$datain['shipping_address'] = $invoiceLine[0]->shipping_address;
			$datain['invoiceTotal'] = $subTotal;
			if (isset($invoiceLine[0]->logsAmt) && $invoiceLine[0]->isnewInvoice == 'no') {
				if ($invoiceLine[0]->logsAmt <= $subTotal) {
					$datain['pending_amount']= $subTotal - $invoiceLine[0]->logsAmt;
				}else
				{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(293);
					$status['statusCode'] = 293;
					$status['flag'] = 'F';
					$this->response->output($status,200);	
				}
			}else{
				if ($invoiceLine[0]->isnewInvoice == 'yes') {
					if (isset($invoiceLine[0]->payment_status) && !empty($invoiceLine[0]->payment_status)) {
						if ($invoiceLine[0]->payment_date != '') {
							$datain['payment_date'] = dateFormat(($invoiceLine[0]->payment_date)) ;
						}
						if( $invoiceLine[0]->payment_status =="partially"){
							if ( isset($invoiceLine[0]->payment_date) && $invoiceLine[0]->payment_date != '') {
								$datain['payment_date'] = dateFormat(($invoiceLine[0]->payment_date)) ;
							}
							if($subTotal == $invoiceLine[0]->payment_amount)
							{
								$datain['pending_amount'] = '0';
								$datain['payment_status'] = 'fully';
							}else
							{
								if ($invoiceLine[0]->payment_amount > 0) {
									$totalAmt1 = $subTotal - $invoiceLine[0]->payment_amount;
									if($totalAmt1 == $subTotal){
										$datain['pending_amount'] = '0';
										$datain['payment_status'] = 'fully';
									}	else{
										$datain['pending_amount'] = $totalAmt1;
										$datain['payment_status'] = 'partially';
									}
								}else
								{
									$datain['pending_amount'] = $subTotal;
									$datain['payment_status'] = 'partially';
								}	
							}
						}else{
							$datain['pending_amount']= 0;
							$datain['payment_status'] = 'fully';
						}
					}else
					{
						$datain['pending_amount'] = $subTotal;
						$datain['payment_status'] = 'partially';
					}
				}	
			}
			
			$gm = number_format($subTotal,2, '.', '');
			$datain['grossAmount'] = round($gm);
			$datain['roundOff'] = number_format($datain['grossAmount'] - $gm,2,'.', '');
			$datain['modified_by'] = $this->input->post('SadminID');
			$datain['company_id'] = $invoiceLine[0]->company_id;
			$datain['show_on_pdf'] = $invoiceLine[0]->show_on_pdf;
			$datain['modified_date'] = date("Y-m-d H:i:s");
			$datain['additional_char'] = $invoiceLine[0]->additional_char;
			$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID,"customer_id"=>$invoiceLine[0]->customerID);
			
			$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($datain,$wherec);
			if(!$isup){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);	
			}else{
				if (isset($invoiceLine[0]->isconvert) && $invoiceLine[0]->isconvert == 'yes') {
					$d1['ref_quot_no'] = $invoiceLine[0]->invoiceNumberConvert ; 			
					$wherec = array("invoiceNumber"=>$invoiceLine[0]->quotationNumber);
					$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($d1,$wherec);
				}
				$lastlogID = '' ;
				if ($invoiceLine[0]->isnewInvoice == 'yes' && !isset($invoiceLine[0]->isconvert)) {
					if(isset($invoiceLine[0]->payment_status) && !empty($invoiceLine[0]->payment_status))
					{
						if (!isset($invoiceLine[0]->payment_note) && empty($invoiceLine[0]->payment_note)) {
							$invoiceLine[0]->payment_note = ' ';
						}
						$receiptNumber = $this->generateReceiptNumber('receipt');
						if ($invoiceLine[0]->payment_status == 'fully') {
							$data = array('notes'=>$invoiceLine[0]->payment_note,'receipt_number'=>$receiptNumber,'payment_log_date'=>$inDate,"amount" =>$datain['grossAmount'],"transaction_id"=>$invoiceLine[0]->transaction_id,"mode_of_payment"=>$invoiceLine[0]->payment_mode,'invoice_id'=>$invoiceLine[0]->invoiceID);	
							$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
							if($isinsert2)
							{
								$lastlogID = $this->CommonModel->getLastInsertedID();
								$this->db->trans_commit();	
								$status['lastInvoiceID'] = $invoiceLine[0]->invoiceID;
								$status['lastlogID'] = $lastlogID;
							}
						}else{
							if ($invoiceLine[0]->payment_amount > 0) {
								$data = array('notes'=>$invoiceLine[0]->payment_note,'receipt_number'=>$receiptNumber,'payment_log_date'=>dateFormat($invoiceLine[0]->payment_date),"amount" =>$invoiceLine[0]->payment_amount,"transaction_id"=>$invoiceLine[0]->transaction_id,"mode_of_payment"=>$invoiceLine[0]->payment_mode,'invoice_id'=>$invoiceLine[0]->invoiceID);
								$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
								if($isinsert2)
								{
									$lastlogID = $this->CommonModel->getLastInsertedID();
									$this->db->trans_commit();	
									$status['lastInvoiceID'] = $invoiceLine[0]->invoiceID;
									$status['lastlogID'] = $lastlogID;
								}
							}else
							{
								$this->db->trans_commit();	
							}	
						}
					}else
					{
						$this->db->trans_commit();	
					}
					
				}else
				{
					$this->db->trans_commit();	
				}
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
	public function CalculateRowTotal($value)
	{
		$returnedTotal = array();

		$rate = number_format($value->rate,2, '.', '');
		$amt = number_format(($value->quantity * $rate),2, '.', '');
		$rate1 = number_format($value->rate,2, '.', '');
		$dis = 0 ;

		if (!isset($value->itemDiscount)) {
			$value->itemDiscount = 0 ;
		}
		if (isset($value->itemDiscountType)) {
			if ($value->itemDiscountType == 'amt') {
				$amt = $amt - ( $value->itemDiscount * $value->quantity) ;
				$rate1 = $rate1 - $value->itemDiscount;
			}else
			{
				$dis = $rate1 * ($value->itemDiscount / 100) ;
				$rate1 = $rate1 - $dis ;
				$amt = $amt - ( $dis * $value->quantity) ;	
			}
		}
		$gs = 0 ;
		if ($value->interGstPercent != '') {
			if($value->withGst == 'y'){
				$gstAmt =  ($rate1 * 100) / ($value->interGstPercent + 100) ; 
				$gs = $rate1 - $gstAmt;
				$gs = $gs * ( $value->quantity );
			}else{
				$gstAmt =  $rate1 * ($value->interGstPercent / 100) ; 
				$gs = $gstAmt * ( $value->quantity ) ;
				$amt = $amt + $gs;
			}
		}
		
		return returnedTotal;
	}

	public function generateReceiptNumber($record_type='')
	{
		$wheredoct = array();
		
		if($record_type == "invoice")
			$wheredoct["docTypeID"] = "1";
		else if($record_type == "quotation")
			$wheredoct["docTypeID"] = "3";	
		else if($record_type == "delivery")
			$wheredoct["docTypeID"] = "4";
		else if($record_type == "receipt")
			$wheredoct["docTypeID"] = "2";

		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		// UPDATE INVOICE NUMBER
		$receiptDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.$lastInvoiceDetails[0]->docYearCD.'/'.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo);
		
		$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
		$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
		if(!$isupdate){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(277);
			$status['statusCode'] = 277;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}else
		{
			return $receiptDetails['invoiceNumber'];
		}
	}
	public function getNextDocNumber($record_type='')
	{
		$wheredoct = array();
		
		if($record_type == "invoice")
			$wheredoct["docTypeID"] = "1";
		else if($record_type == "quotation")
			$wheredoct["docTypeID"] = "3";	
		else if($record_type == "delivery")
			$wheredoct["docTypeID"] = "4";
		else if($record_type == "receipt")
			$wheredoct["docTypeID"] = "2";

		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		
		$invoiceNumber = $lastInvoiceDetails[0]->docPrefixCD.$lastInvoiceDetails[0]->docYearCD.'/'.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo);
		if (isset($invoiceNumber) && !empty($invoiceNumber)) {
			$status['data'] = $invoiceNumber;
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);

		}
	}

	public function partialPayment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		
		$record_type =$this->input->post('record_type');
		$receiptNumber = $this->generateReceiptNumber('receipt');
		$invoiceID = $this->input->post('invoiceID');
		$action = $this->input->post('action');
		$this->validatedata->validate('paymentAmt', 'Payment Amount', true, '', array());
		$this->validatedata->validate('paymentDate', 'Payment Date', true, '', array());
		$this->validatedata->validate('mode_of_payment', 'Payment Mode', true, '', array());
		$p_date = dateFormat($this->input->post('paymentDate'));
		$amt =	intval($this->input->post('paymentAmt'));
		$mode_of_payment = $this->input->post('mode_of_payment');
		$payment_note = $this->input->post('payment_note');
		$transaction_id = $this->input->post('transaction_id');
		if($action == "savePayment"){
			if(isset($invoiceID) && !empty($invoiceID))
			{
				
				$where = array("invoiceID"=>$invoiceID);
				$inDetails = $this->CommonModel->getMasterDetails("invoice_header","pending_amount",$where);

				if(isset($inDetails) && !empty($inDetails)){
					$totalAmt = intval($inDetails[0]->pending_amount );
					if($totalAmt < $amt ){
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(290);
						$status['statusCode'] = 290;
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}else
					{
						if($totalAmt == $amt)
						{
							$data = array('payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
						}else
						{
							$totalAmt1 = $totalAmt - $amt;	
							if($totalAmt1 == $totalAmt)
								$data = array('payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
							else
								$data = array('payment_date'=>$p_date,"pending_amount" =>$totalAmt1,"payment_status"=>"partially");
						}	
						$isinsert1 = $this->CommonModel->updateMasterDetails('invoice_header',$data,$where);
						if(!$isinsert1)
						{
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['flag'] = 'F';
							$this->response->output($status,200);	
						}
					}				
				}else{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);	
				}
				// print_r($receiptNumber);exit;
				$data = array('notes'=>$payment_note,'receipt_number'=>$receiptNumber,'payment_log_date'=>$p_date,"amount" =>$amt,"transaction_id"=>$transaction_id,"mode_of_payment"=>$mode_of_payment,'invoice_id'=>$invoiceID);
				$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
				if($isinsert2)
				{
					$lastlogID = $this->db->insert_id();
					$status['lastlogID'] = $lastlogID;

					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['flag'] = 'S';
					$this->response->output($status,200);	
				}
			}
		}else{
			// $data = array('receipt_number'=>$receiptNumber,'payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
			// $isinsert1 = $this->CommonModel->updateMasterDetails('invoice_header',$data,array("invoiceID",$invoiceID));
			// if($isinsert1)
			// {
			// 	$status['data'] = array();
			// 	$status['msg'] = $this->systemmsg->getSucessCode(400);
			// 	$status['statusCode'] = 400;
			// 	$status['flag'] = 'S';
			// 	$this->response->output($status,200);	
			// }
		}
	}

	public function paymentLogsList($invoiceID='')
	{
		$where = array("invoice_id = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		
		$inDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$where,'','',$join,$other=array());
		if(isset($inDetails) && !empty($inDetails)){
			$status['data'] = $inDetails;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
				
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}
	}

	public function getNarration($type="invoice"){
		
		$type = trim($type);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="product_type";
		$join[0]['key2'] ="category_id";

		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="categories";
		$join[1]['alias'] ="c1";
		$join[1]['key1'] ="generation";
		$join[1]['key2'] ="category_id";
		
		$join[2]['type'] ="LEFT JOIN";
		$join[2]['table']="categories";
		$join[2]['alias'] ="c2";
		$join[2]['key1'] ="processor";
		$join[2]['key2'] ="category_id";

		$join[3]['type'] ="LEFT JOIN";
		$join[3]['table']="categories";
		$join[3]['alias'] ="c4";
		$join[3]['key1'] ="memory";
		$join[3]['key2'] ="category_id";

		$join[4]['type'] ="LEFT JOIN";
		$join[4]['table']="categories";
		$join[4]['alias'] ="c5";
		$join[4]['key1'] ="operating_system";
		$join[4]['key2'] ="category_id";

		$join[5]['type'] ="LEFT JOIN";
		$join[5]['table']="stocks";
		$join[5]['alias'] ="c6";
		$join[5]['key1'] ="product_id";
		$join[5]['key2'] ="productID";

		
		// $where = array("type ="=>"'".$type."'");
		
		$getNarrList = $this->CommonModel->GetMasterListDetails($selectC="product_id,model_name,model_number,product_name,quantity,product_serial_no,product_type,product_description,c.categoryName As product_type,c1.categoryName AS generation,c2.categoryName AS processor,c4.categoryName AS memory,c5.categoryName AS os,c6.qtyBalance AS balance",'products',$where = array(),'','',$join,$other=array());	
		// $getNarrList = $this->CommonModel->GetMasterListDetails(,"",);

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
		$pdfFilePath = '';
		// INFOSETTINGS 
		$wherec = array("infoID"=>1);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
		// TAXINVOICE DATA 
		$wherec = array("invoiceID"=>$invoiceID);
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
	 	// INVOICELINE DETAILS
	 	$sel = "t.*,c.categoryName";
		$wher = array("invoiceID = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="invoiceLineUnit";
		$join[0]['key2'] ="category_id";
		$invoiceLineDetails = $this->CommonModel->getMasterListDetails($sel,'invoice_line',$wher,'','',$join,'');
		// IF PRODUCT IS NUMERRIC OR NOT NUMERIC
		foreach ($invoiceLineDetails as $key => $inv) {
			if(is_numeric($inv->invoiceLineChrgID))
			{
				$wherec = array("product_id"=>$inv->invoiceLineChrgID);
	 			$product = $this->CommonModel->getMasterDetails("products","product_name",$wherec);
				$inv->product_name = $product[0]->product_name;
			}else
			{
				$inv->product_name = $inv->invoiceLineChrgID;
			}	
		}
		// DEATAILS
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr",'invoice_line',$wher,'','');
		// CUSTOMER DETAILS
		$wherec = array("customer_id"=>$taxInvoiceData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","name,address,gst_no,state_id,mobile_no",$wherec);
		if ( $customerDetails[0]->state_id != 0) {
			$wherec = array("state_id"=> $customerDetails[0]->state_id);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD))
			{
				$customerDetails[0]->customer_state = $stateD[0]->state_name;
			}
		}	
		// DATA ABSTRACTED
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		$data['infoSettings']= $contract;
		$data['companyDetails'] = $customerDetails;
		$data['taxInvoiceData']= $taxInvoiceData;
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['counDetails']= "-";	

		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'quotation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'proforma')
			$pdfFilePath = $this->load->view("proformapdf",$data,true);
		
		if(!$this->config->item('development')){
			//load mPDF library
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			// Add the watermark
			// $this->mpdfci->SetWatermarkText($taxInvoiceData[0]->status);
			// $this->mpdfci->showWatermarkText = true;
			// $this->mpdfci->watermark_font = 'Arial';
			// $this->mpdfci->watermarkTextAlpha = 0.3;
			// $this->mpdfci->watermark_font_size = 36;
			// $this->mpdfci->watermarkTextColor = array(192, 192, 192);
			$this->mpdfci->Output();  
		}else
		{
			print_r($pdfFilePath);
		}  

	}
	public function printReceipt($log_id)
	{
		
		$data= array();
		$pdfFilePath = '';
		// print '<pre>';
		// RECEIPT DETAILS
		$wherer['receipt_id = '] = $log_id;
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		$receiptDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$wherer,'','',$join,$other=array());
		// INVOICE DETAILS
		$invoiceIDS = explode(',',$receiptDetails[0]->invoice_id);
		$taxInvoices = array();
		foreach ($invoiceIDS as $key => $ids) {
			$wheret = array("invoiceID"=>$ids);
	 		$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wheret);
			$taxInvoices[] = $taxInvoiceData[0];
		}
		
		// INFO DETAILS
		$wherec = array("infoID"=> $taxInvoiceData[0]->company_id);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
		
		// CUSTOMER DETAILS
		$wherec = array("customer_id"=>$taxInvoiceData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","name,address,gst_no,state_id,mobile_no",$wherec);
		if ( $customerDetails[0]->state_id != 0) {
			$wherec = array("state_id"=> $customerDetails[0]->state_id);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD))
			{
				$customerDetails[0]->customer_state = $stateD[0]->state_name;
			}
		}	

		$data['receiptDetails']= $receiptDetails;
	 	$data['taxInvoiceData']= $taxInvoices;
		$data['infoSettings']= $contract;	
		$data['companyDetails'] = $customerDetails;
		
	
		// print_r($data);exit;
		$pdfFilePath = $this->load->view("receiptPdf",$data,true);
		
		if(!$this->config->item('development')){
			// LOAD PDF LIB
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			// ADD WATERMARK
			$this->mpdfci->SetWatermarkText($taxInvoiceData[0]->status);
			$this->mpdfci->showWatermarkText = true;
			$this->mpdfci->watermark_font = 'Arial';
			$this->mpdfci->watermarkTextAlpha = 0.3;
			$this->mpdfci->watermark_font_size = 36;
			$this->mpdfci->watermarkTextColor = array(192, 192, 192);
			$this->mpdfci->Output();  
		}else
		{
			print_r($pdfFilePath);
		}  
	}
	public function attachmentUpload($log_id = '',$invoiceID='')
	{	
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($log_id) && !empty($log_id)){
			if ($invoiceID == 0) {
				$mediapatharr = $this->config->item("mediaPATH") ."receipts/".$log_id ;
			}else{
				$mediapatharr = $this->config->item("mediaPATH") ."invoiceLog/".$invoiceID."/".$log_id ;
			}
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($log_id) || $log_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."invoiceLog/temp-";
			if (!is_dir($mediapatharr)) {
				if (mkdir($mediapatharr, 0777, true)) {
				} else {
					$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
		// print_r($this->realtimeupload->name());exit;
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'receipts',
			'fileTypeColumn' => '',
			'fileColumn' => 'attachement',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'primaryKey'=>'receipt_id',
			'primaryValue' => $log_id,
			'docTypeValue' => '',
			'isUpdate' => 'Y',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}
	public function getCustomerDetails($cust_id ='',$defComp='', $record_type = '')
	{
		$wherec = array("customer_id"=>$cust_id);
	 	$cDetails = $this->CommonModel->getMasterDetails("customer","*",$wherec);
		if(isset($cDetails) && !empty($cDetails))
		{	
			$wherec = array("infoID"=>$defComp);
	 		$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
			if(isset($contract) && !empty($contract))
			{
				if ($record_type == 'quotation') {
					$cDetails[0]->terms = $contract[0]->quotation_terms_conditions;
				}elseif ($record_type == 'invoice') {
					$cDetails[0]->terms = $contract[0]->invoice_terms_condotions;
				}else{
					$cDetails[0]->terms = $contract[0]->receipt_terms_condotions;
				}
			}
			if ( $cDetails[0]->state_id != '0') {
				$wherec = array("state_id"=> $cDetails[0]->state_id);
				$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
				if(isset($stateD) && !empty($stateD))
				{
					$cDetails[0]->customer_state = $stateD[0]->state_name;
				}
			}else{
				$cDetails[0]->customer_state ='0';
			}
			return $cDetails;
		}		
	}

	public function getLastLogId()
	{
		$orderBy = "receipt_id";
		$order ="DESC";
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		$lastID= $this->CommonModel->GetMasterListDetails($selectC="receipt_id",'receipts',$where=array(),'1','','',$other);
		
		if(isset($lastID) && !empty($lastID))	
		{
			$status['data'] = $lastID[0]->receipt_id;
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);	
		}
	}
	public function validateLine($value)
	{
		$this->validate($value->srno,'Serial no', false);
		$this->validate($value->rate,'rate', true);
		$this->validate($value->itemDiscountType,'item Discount Type', true);
		$this->validate($value->itemDiscount,'item Discount', true);
		$this->validate($value->quantity,'quantity', true);
		$this->validate($value->invoiceLineChrgID ,'Product', false);
		$this->validate($value->interGstPercent,'interGstPercent', false);
		$this->validate($value->interGstAmount,'interGstAmount', false);
		$this->validate($value->withGst,'withGst', true);
	}

	public function validate($fieldName = '', $lable = null, $isRequired = false)
	{
		$fieldName = $fieldName ?? '';
		$textCheck = trim($fieldName);
		
		if ($isRequired == true) {
			
			if (!isset($textCheck) && empty($textCheck)) {
				$status['msg'] = str_replace("{fieldName}", $lable, $this->systemmsg->getErrorCode(218));
				$status['statusCode'] = 218;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function getPdf($invoiceID)
	{
		// check is bill created
		$data= array();
		$pdfFilePath = '';
		// INFOSETTINGS 
		$wherec = array("infoID"=>1);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
		// TAXINVOICE DATA 
		$wherec = array("invoiceID"=>$invoiceID);
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
	 	// INVOICELINE DETAILS
	 	$sel = "t.*,c.categoryName";
		$wher = array("invoiceID = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="invoiceLineUnit";
		$join[0]['key2'] ="category_id";
		$invoiceLineDetails = $this->CommonModel->getMasterListDetails($sel,'invoice_line',$wher,'','',$join,'');
		// IF PRODUCT IS NUMERRIC OR NOT NUMERIC
		foreach ($invoiceLineDetails as $key => $inv) {
			if(is_numeric($inv->invoiceLineChrgID))
			{
				$wherec = array("product_id"=>$inv->invoiceLineChrgID);
	 			$product = $this->CommonModel->getMasterDetails("products","product_name",$wherec);
				$inv->product_name = $product[0]->product_name;
			}else
			{
				$inv->product_name = $inv->invoiceLineChrgID;
			}	
		}
		// DEATAILS
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr",'invoice_line',$wher,'','');
		// CUSTOMER DETAILS
		$wherec = array("customer_id"=>$taxInvoiceData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","name,address,gst_no,state_id,mobile_no",$wherec);
		if ( $customerDetails[0]->state_id != 0) {
			$wherec = array("state_id"=> $customerDetails[0]->state_id);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD))
			{
				$customerDetails[0]->customer_state = $stateD[0]->state_name;
			}
		}	
		// DATA ABSTRACTED
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		$data['infoSettings']= $contract;
		$data['companyDetails'] = $customerDetails;
		$data['taxInvoiceData']= $taxInvoiceData;
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['counDetails']= "-";	
		
		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'quotation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'proforma')
			$pdfFilePath = $this->load->view("proformapdf",$data,true);
		
		$fileName = $taxInvoiceData[0]->customer_name.'.pdf';
		$fileName = str_replace(' ','_',$fileName);
		$filePath = $this->config->item("mediaPATH").'temp-invoice/';

		if (!is_dir($filePath)) {
			mkdir($filePath, 0777);
			chmod($filePath, 0777);
		} else {
			if (!is_writable($filePath)) {
				chmod($filePath, 0777);
			}
		}
		
		
		if(!$this->config->item('development')){
			//load mPDF library
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			$this->mpdfci->Output($filePath.'/'.$filePath, 'D');  
			$status['data'] = $fileName;
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);

		}else
		{
			$status['data'] = $fileName;
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);
			// print_r($pdfFilePath);
		}  

	}
}