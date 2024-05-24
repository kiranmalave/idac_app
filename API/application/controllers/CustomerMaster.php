<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CustomerMaster extends CI_Controller
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
	 * So any other public methods not contacted with an underscore will
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
		$this->load->library("Datatables");
		$this->load->library("Filters");
		$this->load->library("MicrosoftGraphAPI");
		if(!$this->config->item('development'))
		{
			$this->load->library("emails");
			// $this->load->library("EmailsNotifications");
			// $this->load->library("NotificationTrigger");
		}
	}


	public function getcustomerDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('customer_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$startDate = $this->input->post('birthDateStart');
		$endDate = $this->input->post('birthDateEnd');
		$createdStartDate = $this->input->post('createdDateStart');
		$createdEndDate = $this->input->post('createdDateEnd');
		$record_type = $this->input->post('record_type');
		$custType = $this->input->post('type'); 
		$stages = $this->input->post('stages');
		
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
		
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			unset($postData['birthDateStart']);
			unset($postData['birthDateEnd']);
			unset($postData['createdDateStart']);
			unset($postData['createdDateEnd']);
			$whereData = $this->filters->prepareFilterData($postData);
			// print_r($whereData);exit;
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

			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			
				$columnNames = [
					"country_id" => ["table" => "country", "alias" => "cn", "column" => "country_name", "key2" => "country_id"],
					"state_id" => ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"],
					"city_id" => ["table" => "cities", "alias" => "ci", "column" => "city_name", "key2" => "city_id"],
					"lead_source" => ["table" => "categories", "alias" => "cl", "column" => "categoryName", "key2" => "category_id"],
					"stages" => ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"],
					"assignee" => ["table" => "admin", "alias" => "aa", "column" => "name", "key2" => "adminID"],
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					if (in_array($columnName, $colData)) {
						$jkey = count($join) + 1;
						$join[$jkey]['type'] = "LEFT JOIN";
						$join[$jkey]['table'] = $columnData["table"];
						$join[$jkey]['alias'] = $columnData["alias"];
						$join[$jkey]['key1'] = $columnName;
						$join[$jkey]['key2'] = $columnData["key2"];
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}
			
			if($selectC != ""){
				$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			}else{
				$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			}
			
		}
		
		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}

		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		
		// $config = $this->config->item('pagination');
		// $wherec = $join = array();

		// if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){			
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'".$textval."%'";
		// }

		// if(isset($record_type) || !empty($record_type)){
		// 	$wherec["record_type ="] = "'".$record_type."'";
		// }

		// if(isset($custType) && !empty ($custType)){
		// 	$TypeStr = str_replace(",",'","',$custType);
		// 	$wherec["t.type"] = 'IN ("'.$TypeStr.'")';
		// }

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// }
		
		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["birth_date >="] = "'".$sDate."'";
		}

		if(isset($endDate) && !empty($endDate)){
			$eDate = date("Y-m-d",strtotime($endDate));
			$wherec["birth_date <="] = "'".$eDate."'";
		}

		if(isset($createdStartDate) && !empty($createdStartDate)){
			$sDate = date("Y-m-d",strtotime($createdStartDate));
			$wherec["t.created_date >="] = "'".$sDate."'";
		}

		if(isset($createdEndDate) && !empty($createdEndDate)){
			$eDate = date("Y-m-d",strtotime($createdEndDate));
			$wherec["t.created_date <="] = "'".$eDate."'";
		}

		if(isset($stages) && !empty($stages)){
			if($stages =="other"){
				$wherec["t.stages ="] = "'0'";	
			}else{
				$wherec["t.stages ="] = "'".$stages."'";
			}
			
		}
		$adminID = $this->input->post('SadminID');
		if ($isAll == "Y") {
			
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}

			if (isset($custType) && !empty($custType)) {
				$statusStr = str_replace(",", '","', $custType);
				$wherec["t.type"] = 'IN ("' . $statusStr . '")';
			}
		}
		$config["base_url"] = base_url() . "customerDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.customer_id', 'customer', $wherec, $other);
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
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC="customer_id,name,state_id,pan_number,address,email,mobile_no",'customer',$wherec,'','',$join,$other);	
		}else{
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="categories";
			$join[$jkey]['alias'] ="css";
			$join[$jkey]['key1'] ="stages";
			$join[$jkey]['key2'] ="category_id";
			// $selectC = "t.customer_id,t.name,t.email,t.mobile_no,t.record_type,t.type,t.stages,t.state_id,c.categoryName AS stageName, t.customer_image, t.last_activity_date, t.last_activity_type, ".$selectC;
			// print_r($selectC);exit;
			$selectC = "css.category_id AS stageID,t.customer_image,t.type,t.salutation,t.created_date,t.last_activity_date, t.last_activity_type, ".$selectC;
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC, 'customer', $wherec, $config["per_page"], $page, $join, $other);
			// print $this->db->last_query();	
		}
		foreach ($customerDetails as $key => $value) {
			$wherec = array();
			$wherec["t.record_id"] = ' = "' . $value->customer_id . '"';
			$customerNoteCount = $this->CommonModel->getCountByParameter('note_id', 'notes', $wherec, '');
			$customerDetails[$key]->noteCount = $customerNoteCount;
			
			$whereTask = array();
			$whereTask["start_date >="] = "'".date('Y-m-d')."'";
			$whereTask["customer_id = "] = $value->customer_id;
			$customerTaskUpcoming = $this->CommonModel->getCountByParameter('task_id', 'tasks', $whereTask, '');

			$whereAppoint = array();
			$whereAppoint["start_date >="] = "'".date('Y-m-d')."'";
			$whereAppoint["customer_ID = "] = $value->customer_id;
			$customerAppUpcoming = $this->CommonModel->getCountByParameter('appointmentID', 'appointment', $whereAppoint, '');

			$whereNotes = array();
			$whereNotes["reminder_date >="] = "'".date('Y-m-d')."'";
			$whereNotes["record_id = "] = $value->customer_id;
			$customerNoteUpcoming = $this->CommonModel->getCountByParameter('note_id', 'notes', $whereNotes, '');
			
			$result = $customerTaskUpcoming + $customerAppUpcoming + $customerNoteUpcoming;
			$customerDetails[$key]->upcomingCount = $result;

			$mobNo = json_decode($value->mobile_no);
			// print_r($value->mobile_no);
			if(isset($mobNo) && !empty($mobNo)){
				if(is_array($mobNo)){
					$customerDetails[$key]->mobile_no = $mobNo[0].' '.$mobNo[1];
				}
			}

		}

		$status['data'] = $customerDetails;
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
		if ($customerDetails) {
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

	public function customerMaster($customer_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$customerDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $customerDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$customerDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerDetails['salutation'] = $this->validatedata->validate('salutation', 'Salutation', false, '', array());
			$customerDetails['name'] = $this->validatedata->validate('name', 'Name', false, '', array());
			$customerDetails['email'] = $this->validatedata->validate('email', 'Email', false, '', array());
			$customerDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile', false, '', array());
			$customerDetails['birth_date'] = $this->validatedata->validate('birth_date', 'Birth Date', false, '', array());
			$customerDetails['record_type'] = $this->validatedata->validate('record_type', 'record Type', true, '', array());
			$customerDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			$customerDetails['address'] = $this->validatedata->validate('address','addresss',false,'',array());
			$customerDetails['customer_image'] = $this->validatedata->validate('customer_image','Customer Image',false,'',array());
			$customerDetails['billing_name'] = $this->validatedata->validate('billing_name', 'Billing Address', false, '', array());
			$customerDetails['billing_address'] = $this->validatedata->validate('billing_address', 'Company Name', false, '', array());
			$customerDetails['branch_id	'] = $this->validatedata->validate('branch_id	', 'Branch Id	', false, '', array());
			$customerDetails['gst_no'] = $this->validatedata->validate('gst_no', ' Gst No', false, '', array());
			$customerDetails['adhar_number'] = $this->validatedata->validate('adhar_number', ' adhar Number', false, '', array());
			$customerDetails['pan_number'] = $this->validatedata->validate('pan_number', ' Pan Number', false, '', array());
			$customerDetails['website'] = $this->validatedata->validate('website', 'Website', false, '', array());
			$customerDetails['type'] = $this->validatedata->validate('type', 'Type', false, '', array());
			$customerDetails['stages'] = $this->validatedata->validate('stages', 'lead stages', false, '', array());
			$customerDetails['country_id'] = $this->validatedata->validate('country_id', 'Country', false, '', array());
			$customerDetails['state_id'] = $this->validatedata->validate('state_id', 'State', false, '', array());
			$customerDetails['city_id'] = $this->validatedata->validate('city_id', 'City', false, '', array());
			$customerDetails['latitude'] = $this->validatedata->validate('latitude', 'latitude', false, '', array());
			$customerDetails['longitude'] = $this->validatedata->validate('longitude', 'longitude', false, '', array());
			$customerDetails['zipcode'] = $this->validatedata->validate('zipcode', 'zipcode', false, '', array());
			$customerDetails['office_land_line'] = $this->validatedata->validate('office_land_line', 'office_land_line', false, '', array());
			$customerDetails['lead_source'] = $this->validatedata->validate('lead_source', 'lead source', false, '', array());
			$customerDetails['mailing_address'] = $this->validatedata->validate('mailing_address', 'Mailing Address', false, '', array());
			$customerDetails['assignee'] = $this->validatedata->validate('assignee', 'Assignee', false, '', array());
			$customerDetails['assignee'] = $this->validatedata->validate('assignee', 'Assignee', false, '', array());
			$countryCodeNumber = $this->validatedata->validate('countryCodeNumber', 'Country Code', false, '', array());
			if(isset($countryCodeNumber) && !empty($countryCodeNumber)){
				$countryarray = explode(" ", $countryCodeNumber);
				$customerDetails['mobile_no'] = $countryCodeNumber.$customerDetails['mobile_no'];
			}
			if($customerDetails['type'] =="lead"){
				$fieldData = $this->datatables->mapDynamicFeilds("leads",$this->input->post());
				$customerDetails = array_merge($fieldData, $customerDetails);
			}else{
				$fieldData = $this->datatables->mapDynamicFeilds("customer",$this->input->post());
				$customerDetails = array_merge($fieldData, $customerDetails);	
			}
			
			if (isset($customerDetails['birth_date']) && !empty($customerDetails['birth_date']) && $customerDetails['birth_date'] != "0000-00-00") {
				$customerDetails['birth_date'] = str_replace("/", "-", $customerDetails['birth_date']);
				$customerDetails['birth_date'] = date("Y-m-d", strtotime($customerDetails['birth_date']));
			}else{
				$customerDetails['birth_date'] = null;
			}

			if(!isset($customerDetails['pan_number']) && empty($customerDetails['pan_number'])){
				$customerDetails['pan_number'] = null;
			}

			if(!isset($customerDetails['branch_id']) && empty($customerDetails['branch_id'])){
				$customerDetails['branch_id'] = null;	
			}

			//   print_r($customerDetails);exit();
			if ($method == "PUT") {
				$iticode = $customerDetails['customer_id'];
				$customerDetails['status'] = "active";
				$customerDetails['created_by'] = $this->input->post('SadminID');
				$customerDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('customer', $customerDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					// $notificationlist = $this->CommonModel->getNotificationList('customer','add');
					$custID = $this->db->insert_id();
					$cName = preg_replace('/[^a-zA-Z0-9 ]/', '_',$customerDetails['name']);
    				$cName = str_replace(' ', '_', $cName);
					// If one drive is activated created customer folder on one drive
					if($this->microsoftgraphapi->isSetup){
						$id = $this->microsoftgraphapi->createFolder($cName."_".$custID);
						$customerDetailsUp = array();
						$customerDetailsUp['one_drive_folder'] = $id;
						$where=array("customer_id"=>$custID);
						$updateID = $this->CommonModel->updateMasterDetails('customer',$customerDetailsUp,$where);
					}
					if(isset($notificationlist) && !empty($notificationlist)){
						foreach ($notificationlist as $key => $value) 
						{
							$datatosend= array();
							$datatosend['details']= $customerDetails;
							$datatosend['user_type'] = $value->user_type;
							$datatosend['email_customer'] = $customerDetails['email'];
							$datatosend['notificationID'] = $value->notification_id;
							$datatosend['sys_user_id'] = $value->sys_user_id;
							$datatosend['template_id'] = $value->template_id;
							// if(!$this->config->item('development')){
							// 	$this->notificationtrigger->sendEmailNotification('customer','add',$datatosend);
							// }
						}
					}
					$status['lastID'] = $custID;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('customer_id' => $customer_id);
				if (!isset($customer_id) || empty($customer_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$customerDetails['modified_by'] = $this->input->post('SadminID');
				$customerDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					// if(!$this->config->item('development'))
					// {
					// 	$this->notificationtrigger->prepareNotification('update','customer','customer_id',$customer_id);
					// }
					$status['lastID'] = $customer_id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$customerDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('customer', $where);
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
			if($customer_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$wherec["customer_id ="] = "'".$customer_id."'";

			$whereAttachment = array(
				"customer_id" => $customer_id
			);

			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="ad";
			$join[0]['key1'] ="assignee";
			$join[0]['key2'] ="adminID";

			$selectC = "ad.name";

			$assignee = $this->CommonModel->GetMasterListDetails($selectC, 'customer', $wherec, '', '', $join, '');

			$this->menuID = $this->input->post('menuId');
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
			
			$other = array();
			$wherec["t.customer_id"] = "=".$customer_id;
			//$customerDetails = $this->CommonModel->GetMasterListDetails('customer', '', $where);
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			if (isset($customerDetails) && !empty($customerDetails)) {
				$custAttachments = $this->CommonModel->getMasterDetails('customer_attachment','',$whereAttachment);
				if(!empty($custAttachments)){
					$attachment = array_column($custAttachments,'attachment_file');
					$attachmentID = array_column($custAttachments,'attachment_id');
					$customerDetails[0]->attachment_file = $attachment;
					$customerDetails[0]->attachment_id = $attachmentID;
				}
				if(!empty($assignee)){
					$assigneeName = array_column($assignee,'name');
					$customerDetails[0]->assigneeName = $assigneeName;
				}
				if(isset($customerDetails[0]->mobile_no) && !empty($customerDetails[0]->mobile_no)) {
					// $mobileNumberObject = $customerDetails[0]->mobile_no;
					$mobileNumberString = $customerDetails[0]->mobile_no;

					// Decoding the JSON-like string to get the actual array
					$mobileNumberArray = json_decode($mobileNumberString);
					if(is_array($mobileNumberArray)){
					// Extracting country code and number from the array
						$countryCode = $mobileNumberArray[0];
						$number = $mobileNumberArray[1];
						$customerDetails[0]->mobile_no = $number;
						$customerDetails[0]->countryCode = $countryCode;
					}
				}
				$status['data'] = $customerDetails;
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


	public function CustomerChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('customer', $statusCode, $ids, 'customer_id');

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

	public function getcustomerNotesDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$customer = $this->input->post('customer_id');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "note_id";
			$order = "DESC";
		}

		$other = array("orderBy"=>$orderBy,"order"=>$order);

		if(isset($customer) && !empty($customer)){			
			$customer = trim($customer);
			$wherec["record_id ="] = "'".$customer."'";
		}

		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			$join = array();
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC='*','notes',$wherec,'','','', $other);	
		}else{
			$selectC = "*";
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'notes', $wherec, '', '', '', $other);
		}
		$status['data'] = $customerNotesDetails;
		if ($customerNotesDetails) {
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

	public function customerNote($note_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		// print_r($method);exit;
		if ($method == "POST" || $method == "PUT") {
			$customerNote = array();
			$updateDate = date("Y/m/d H:i:s");

			$customerNote['record_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerNote['note_desc'] = $this->validatedata->validate('note_desc', 'Customer Note', false, '', array());
			$customerNote['title'] = $this->validatedata->validate('title', 'Title', false, '', array());
			$customerNote['reminder_date'] = $this->validatedata->validate('reminder_date', 'Reminder Date', false, '', array());
			$reminder_time = $this->validatedata->validate('reminder_time', 'Reminder Time', false, '', array());
			
			if (isset($customerNote['reminder_date']) && !empty($customerNote['reminder_date']) && $customerNote['reminder_date'] != "0000-00-00") {
				$customerNote['reminder_date'] = str_replace("/", "-", $customerNote['reminder_date']);
				$customerNote['reminder_date'] = date("Y-m-d", strtotime($customerNote['reminder_date']));
				
				// Convert time to the desired format
				$reminder_time = date("H:i:s", strtotime($reminder_time));

				// Concatenate date and time
				$customerNote['reminder_date'] .= ' ' . $reminder_time;
			} else {
				$customerNote['reminder_date'] = null;
			}
			if ($method == "PUT") {
				$customerNote['created_by'] = $this->input->post('SadminID');
				$customerNote['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('notes', $customerNote);
				$lastNoteID = $this->db->insert_id();
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
					$status['lastID'] = $lastNoteID;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('note_id' => $note_id);
				if (!isset($note_id) || empty($note_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$customerNote['modified_by'] = $this->input->post('SadminID');
				$customerNote['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('notes', $customerNote, $where);
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
				$customerNote = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('notes', $where);
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

			$where = array("note_id" => $note_id);
			$customerDetails = $this->CommonModel->getMasterDetails('notes', '', $where);

			if (isset($customerDetails) && !empty($customerDetails)) {

				$status['data'] = $customerDetails;
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

	public function noteDelete(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$noteID= $this->input->post("id");
		$wherec["note_id ="] = $noteID;
		$changestatus = $this->CommonModel->deleteMasterDetails('notes',$wherec);
		if($changestatus){
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

	public function customerChangeType()
	{
		$customerID = $this->input->post('customerID');
		$setStatus = $this->input->post('status');
		$where = array('customer_id' => $customerID);
		$customerDetails['type'] = $setStatus;
		$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
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

	public function getcustomerActivityDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$customer = $this->input->post('customer_id');
		$customerType = $this->input->post('customerType');
		$historyType = $this->input->post('historyType');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "history_id";
			$order = "DESC";
		}
		if(isset($historyType) && !empty($historyType) && $historyType=="past"){

			$other = array("orderBy"=>$orderBy,"order"=>$order);

			if(isset($customer) && !empty($customer)){			
				$customer = trim($customer);
				$wherec["parent_record_id ="] = "'".$customer."'";
			}
			$adminID = $this->input->post('SadminID');
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="am";
			$join[0]['key1'] ="user_id";
			$join[0]['key2'] ="adminID";


			if ($isAll == "Y") {
				$join = array();
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*, am.name As createdName','history',$wherec,'','',$join, $other);	
			}else{
				$selectC = "t.*, am.name As createdName";
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'history', $wherec, '', '', $join, $other);
			}
			// print_r($customerActivityDetails);exit;
			$status['data'] = $customerActivityDetails;
			if ($customerActivityDetails) {
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
		}else if($historyType=="upcoming"){
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="am";
			$join[0]['key1'] ="created_by";
			$join[0]['key2'] ="adminID";

			$whereTask = array();
			$whereTask["start_date >="] = "'".date('Y-m-d')."'";
			$whereTask["customer_id = "] = $customer;
			$customerTaskUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'tasks', $whereTask, '', '', $join, '');

			$whereAppoint = array();
			$whereAppoint["start_date >="] = "'".date('Y-m-d')."'";
			$whereAppoint["customer_ID = "] = $customer;
			$customerAppUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'appointment', $whereAppoint, '', '', $join, '');

			$whereNotes = array();
			$whereNotes["reminder_date >="] = "'".date('Y-m-d')."'";
			$whereNotes["record_id = "] = $customer;
			$customerNoteUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'notes', $whereNotes, '', '', $join, '');
			$upcomingActivity = array();
			foreach ($customerTaskUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "task";
				$record->description =$value->subject;
				$record->task_id =$value->task_id;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->start_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			foreach ($customerAppUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "appointment";
				$record->description =$value->title;
				$record->appointmentID = $value->appointmentID;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->start_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			foreach ($customerNoteUpcoming as $key => $value){
				$record = new stdClass();
				$record->record_type = "notes";
				$record->description =$value->title;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->reminder_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			array_multisort(array_map('strtotime',array_column($upcomingActivity,'activity_date')),
					SORT_ASC, 
					$upcomingActivity);
			if ($upcomingActivity) {
				$status['data'] = $upcomingActivity;
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

		} else if($historyType=="personal"){
			$adminID = $this->input->post('SadminID');
			$wherec["parent_record_id ="] = "'79'";
			$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC="*", 'history', $wherec, '', '', '', '');
			$status['data'] = $customerActivityDetails;
			if ($customerActivityDetails) {
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
	public function getCustomerEmailList()
	{
		// print('here');exit;
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$t = $t ?? '';
		
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec["email like  "] = "'%" . $text . "%'";
			$wherec["status ="] = "'active'";
		}
		// print_r($wherec);
		$updateAns = $this->CommonModel->GetMasterListDetails("customer_id,email,status", "customer", $wherec);
		// print_r($updateAns);
		// foreach ($updateAns as $hsl)
		// {
		//     $data1 = new stdClass(); = 
		// 	$data1$hsl->email;
		// 	$datas[] = $hsl->adminID;
		// 	$datas[] = 
		// }
		// print_r($updateAns);
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	public function leadUpdate()
	{
		$customerID = $this->input->post('customerID');
		$lead = $this->input->post('lead');
		$where = array('customer_id' => $customerID);
		$customerDetails['stages'] = $lead;
		$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
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

	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$menuIDs = $this->input->post("menuIDs");
			foreach ($menuIDs as $key => $value) {
				$where = array('category_id' => $value);
				$categoryIndex['lead_index'] = $key;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
			}

		}
	}

	public function custUpload($customer_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($customer_id) && !empty($customer_id)){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/".$customer_id ;
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($customer_id) || $customer_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/temp-";
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
		
		
		$extraData["customer_id"] = $customer_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'customer_attachment',
			'fileTypeColumn' => 'attachment_file',
			'fileColumn' => 'attachment_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}

	public function notesEmailReminder()
	{
		$where = array();
		$where["reminder_date ="] = "'".date('Y-m-d')."'";
		$reminderNotes = $this->CommonModel->GetMasterListDetails("*", 'notes', $where, '', '', '', '');
		foreach ($reminderNotes as $key => $value) {
			$whereCust["customer_id ="] = "'".$value->record_id."'";
			$customer_email = $this->CommonModel->GetMasterListDetails("email", 'customer', $whereCust, '', '', '', '');
			$this->emails->sendMailDetails('','',$customer_email[0]->email,'','','Note Reminder: '.$value->title, $value->note_desc);
		}
		// print_r($customer_email);
		
	}
}
