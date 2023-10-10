<?php
defined('BASEPATH') or exit('No direct script access allowed');
require APPPATH . '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;

class ExcelExport extends CI_Controller
{
	function __construct()
	{
		parent::__construct();
		//$this->load->library("Excel");
		$this->load->model("ExcelExportModel");
		$this->load->model("CommonModel");
	}
	public function index()
	{
		$data["traineeData"] = $this->ExcelExportModel->fetch_data();
	}

	public function donorReportDetails()
	{

		// print_r($this->input->post());exit;
		$wherec = $join = $sortedArr = array();
		$reportType = $this->input->post('reportType');
		$txtVal = $this->input->post('txtVal');
		$pocType = $this->input->post('pocType');
		$pocName = $this->input->post('pocName');
		$otherPocName = $this->input->post('otherPocName');
		$birMonth = $this->input->post('birMonth');
		$categoryList = $this->input->post('categoryList');
		$otherCategory = $this->input->post('otherCategory');
		$fromAmount = $this->input->post('fromAmount');
		$toAmount = $this->input->post('toAmount');
		$fromDate = $this->input->post('fromDate');
		$toDate = $this->input->post('toDate');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$status = $this->input->post('status');
		$excel = $this->input->post('excel');
		$pdf = $this->input->post('pdf');
		// print_r($this->input->post());exit;
		$filterData = $_POST;
		$filterLable = array();
		$filterLable['reportType'] = $reportType;
		$filterLable['txtVal'] = "Search By";
		$filterLable['pocType'] = "Poc Type";
		$filterLable['pocName'] = "Poc Name";
		$filterLable['otherPocName'] = "Other Poc Name";
		$filterLable['fromAmount'] = "fromAomhutnt";
		$filterLable['txtVal'] = "SearchBy";
		// 	echo "in excel";
		// }
		// exit;
		// echo "<pre>";
		// print_r($this->input->post());exit;
		// echo $pocName;exit;
		$confirmationStatus = $this->input->post('confirmationStatus');
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "donatedByName";
			$order = "DESC";
		}
		$sortedArr["Order By"] = $orderBy;
		$sortedArr["Order"] = $order;
		$other = array("d.orderBy" => $orderBy, "d.order" => $order);
		if (isset($reportType) && !empty($reportType)) {
			$wherec["d." . $reportType . ""] = "='" . $txtVal . "'";
			$sortedArr["Search By"] = $txtVal;
		}
		$wherec["t.status"] = "='active'";
		// $wherec["d.status"] = "='active'";
		/// check confirmation status
		if (isset($confirmationStatus) && !empty($confirmationStatus)) {
			$wherec["t.confirmationStatus"] = "='" . $confirmationStatus . "'";
			$sortedArr["Confirmation Status"] = $confirmationStatus;
		}
		//check POC
		if (isset($pocType) && !empty($pocType) && $pocType != "Other") {
			if ($pocName != "") {
				$sortedArr["POC Type"] = $pocType;
				$wherec["t.pointOfContactName"] = "='" . $pocName . "'";
				////this qury for get poc for "sortedArr"
				$pocWhere = array("adminID" => "$pocName");
				$pocName = $this->CommonModel->getMasterDetails('admin', 'name', $pocWhere);
				$sortedArr["POC Name"] = $pocName[0]->name;
			} else {
				$status = array();
				$status['msg'] = "POC Name Required";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		} else if (isset($pocType) && !empty($pocType) && $pocType == "Other") {
			if ($otherPocName != "") {
				$sortedArr["POC Type"] = $pocType;
				$wherec["t.pointOfContactName"] = "='" . $otherPocName . "'";
				$sortedArr["POC Name"] = $otherPocName;
			} else {
				$status = array();
				$status['msg'] = "POC Name Required";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		}

		//check birthday month
		if (isset($birMonth) && !empty($birMonth)) {
			$sortedArr["Birth Day Month"] = $birMonth;
			$wherec["monthname(d.dateOfBirth)"] = "='" . $birMonth . "'";
		}
		///checking category here
		if (isset($categoryList) && !empty($categoryList) && $categoryList == "Other") {
			if ($otherCategory != "") {
				$sortedArr["Category"] = $categoryList;
				$sortedArr["otherCategory"] = $otherCategory;
				$wherec["d.otherCategory"] = "='" . $otherCategory . "'";
			} else {
				$status = array();
				$status['msg'] = "Other category required.";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		}

		if (isset($fromAmount) && !empty($fromAmount) && isset($toAmount) && !empty($toAmount)) {
			if ($fromAmount <= $toAmount && $fromAmount >= 1) {
				$sortedArr["From Amount"] = $fromAmount;
				$sortedArr["toAmount"] = $toAmount;
				$wherec["t.amountInFigure >= "] = "'" . $fromAmount . "'";
				$wherec["t.amountInFigure <= "] = "'" . $toAmount . "'";
			} else {
				$status = array();
				$status['msg'] = "Enter Valid Amount Range";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		} elseif ($fromAmount != "" && $fromAmount == 0) {
			$status = array();
			$status['msg'] = "Enter Valid Amount Range";
			$status['statusCode'] = 273;
			$status['flag'] = 'F';
			$this->load->view("error_message", $status);
			exit();
		}
		if (isset($fromDate) && !empty($fromDate)) {
			if (!isset($fromDate) || empty($fromDate)) {
				$toDate = date("Y-m-d");
			}
			$sortedArr["From Date"] = dateFormat($fromDate, "d-M-Y");
			$sortedArr["To Date"] = dateFormat($toDate, "d-M-Y");
			$wherec["date(t.createdDate) >= "] = "'" . dateFormat($fromDate, "Y-m-d") . "'";
			$wherec["date(t.createdDate) <= "] = "'" . dateFormat($toDate, "Y-m-d") . "'";
		}
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "donorRegistration";
		$join[0]['alias'] = "d";
		$join[0]['key1'] = "donorName";
		$join[0]['key2'] = "donorID";
		$adminName = "";
		if ($pocType == "POC") {
			$join[1]['type'] = "LEFT JOIN";
			$join[1]['table'] = "admin";
			$join[1]['alias'] = "a";
			$join[1]['key1'] = "pointOfContactName";
			$join[1]['key2'] = "adminID";
			$adminName = ",a.name";
		}
		$categoryName = "";
		if (isset($categoryList) && !empty($categoryList) && $categoryList != "Other") {
			$cWhere = array("categoryID" => $categoryList);
			$cName = $this->CommonModel->getMasterDetails('categoryMaster', 'categoryName', $cWhere);
			$sortedArr["Category"] = $cName[0]->categoryName;
			$wherec["d.category"] = "='" . $categoryList . "'";
		}
		$categoryName = ",c.categoryName";
		$join[2]['type'] = "LEFT JOIN";
		$join[2]['table'] = "categoryMaster";
		$join[2]['alias'] = "c";
		$join[2]['key1Alias'] = "d";
		$join[2]['key1'] = "category";
		$join[2]['key2'] = "categoryID";


		$join[3]['type'] = "LEFT JOIN";
		$join[3]['table'] = "admin";
		$join[3]['alias'] = "ap";
		$join[3]['key1'] = "approveOrDeclinedBy";
		$join[3]['key2'] = "adminID";

		$join[4]['type'] = "LEFT JOIN";
		$join[4]['table'] = "admin";
		$join[4]['alias'] = "poc";
		$join[4]['key1'] = "pointOfContactName";
		$join[4]['key2'] = "adminID";

		$join[5]['type'] = "LEFT JOIN";
		$join[5]['table'] = "regionMaster";
		$join[5]['alias'] = "re";
		$join[5]['key1Alias'] = "d";
		$join[5]['key1'] = "region";
		$join[5]['key2'] = "regionID";

		// $join[6]['type'] ="LEFT JOIN";
		// $join[6]['table']="admin";
		// $join[6]['alias'] ="cat";
		// $join[5]['key1Alias'] ="d";
		// $join[6]['key1'] ="category";
		// $join[6]['key2'] ="categoryID";




		$selectC = "t.*,c.categoryName,re.regionName,poc.name as POCName,ap.name as appOrDecByName,d.prefix,d.donatedByName,d.donatedBySurName,d.residentialAddress,d.contactNo,d.WhatsappNo,d.emailID,d.dateOfBirth,d.region,d.otherRegion,d.category,d.otherCategory,d.status as status1" . $adminName . $categoryName;
		// $selectC="d.donatedByName";
		$processDetails = $this->CommonModel->GetMasterListDetails($selectC, 'donorRecipts', $wherec, '', '', $join, $other);
		// echo "<pre>";
		// 	print_r($wherec);
		// 	print_r($sortedArr);
		// echo count($processDetails);
		// 	print_r($processDetails[0]);
		// exit;
		if (!isset($processDetails) || empty($processDetails)) {

			$status['msg'] = $this->systemmsg->getErrorCode(273);
			$status['statusCode'] = 273;
			$status['flag'] = 'F';
			$this->load->view("error_message", $status);
			exit();
		}
		//  print_r($wherec);exit;
		if (isset($excel)) {
			$printDetails = array();
			$i = 0;
			foreach ($processDetails as $key => $value) {
				if ($adminName != "") {
					$pocName = 	$value->name;
				} else {
					$pocName = $value->POCName;
				}
				$printDetails[$i]["reciptNo"] = 	$value->reciptNo;
				$printDetails[$i]["donorName"] = 	$value->prefix . " " . $value->donatedByName . " " . $value->donatedBySurName;
				$printDetails[$i]["confirmationStatus"] = 	$value->confirmationStatus;
				$printDetails[$i]["confirmationDate"] = 	dateFormat($value->confirmationDate, 'd-m-Y');
				$printDetails[$i]["dateOfDonation"] = 	dateFormat($value->dateOfDonation, 'd-m-Y');
				$printDetails[$i]["approveOrDeclinedBy"] = 	$value->appOrDecByName;
				$printDetails[$i]["declinedReason"] = 	$value->declinedReason;
				$printDetails[$i]["inTheNameOfName"] = 	$value->inTheNameOfName;
				$printDetails[$i]["pointOfContactName"] = 	$pocName;
				$printDetails[$i]["amountInFigure"] = 	$value->amountInFigure;
				$printDetails[$i]["donationToword"] = 	$value->donationToword;
				$printDetails[$i]["modeOfDonation"] = 	$value->modeOfDonation;
				$printDetails[$i]["transactionDetails"] = 	$value->transactionDetails;
				$printDetails[$i]["residentialAddress"] = 	$value->residentialAddress;
				$printDetails[$i]["contactNo"] = 	$value->contactNo;
				$printDetails[$i]["WhatsappNo"] = 	$value->WhatsappNo;
				$printDetails[$i]["emailID"] = 	$value->emailID;
				$printDetails[$i]["dateOfBirth"] = 	$value->dateOfBirth;
				$printDetails[$i]["region"] = 	$value->regionName;
				$printDetails[$i]["category"] = 	$value->categoryName;
				$printDetails[$i]["otherCategory"] = 	$value->otherCategory;
				$printDetails[$i]["panNumber"] = 	$value->panNumber;
				$printDetails[$i]["createdDate"] = 	$value->createdDate;
				$i++;
			}
			$rowArray = array("Recipt No", "Donor Name", "Confirmation Status", "Confirmation Date", "Date Of Donation", "Approve Or Declined By", "Declined Reason", "In The Name Of Name", "Point Of Contact Name", "Amount In Figure", "Donation Toword", "Mode Of Donation", "Transaction Details", "Residential Address", "Contact No", "Whatsapp No", "Email ID", "Date Of Birth", "Region", "Category", "Other Category", "Pan Number", "Created Date");

			// print_r($printDetails); exit;
			//echo  phpinfo();exit;
			$spreadsheet = new Spreadsheet();
			$Excel_writer = new Xls($spreadsheet);
			$spreadsheet->setActiveSheetIndex(0);
			$spreadsheet->getActiveSheet()->setTitle("Sheet1");
			$styleArray = array(
				'borders' => array(
					'outline' => array(
						'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
						'color' => array('argb' => '00999999'),
					),
				),
			);
			$spreadsheet->getActiveSheet()
				->fromArray(
					$rowArray,   // The data to set
					NULL,        // Array values with this value will not be set
					'A1'         // Top left coordinate of the worksheet range where
					//    we want to set these values (default is A1)
				);
			$spreadsheet->getActiveSheet()
				->fromArray(
					$printDetails,  // The data to set
					NULL,        // Array values with this value will not be set
					'A2'         // Top left coordinate of the worksheet range where
					//    we want to set these values (default is A1)
				);
			for ($i = 0; $i <= count($printDetails); $i++) {
				for ($j = 0; $j < count($rowArray); $j++) {
					$spreadsheet->getActiveSheet()->getCellByColumnAndRow($j + 1, $i + 2)->getStyle()->applyFromArray($styleArray)->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)->setWrapText(true);
				}
			}
			header('Content-Type: application/vnd.ms-excel');
			//header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			$filename = "DonorReport" . ".xls";
			header('Content-Disposition: attachment;filename="' . $filename . '"');

			// do not remove below two line.it`s clean the unwanted data and make clean Xls
			ob_end_clean();
			ob_start();
			$Excel_writer->save('php://output');
		}

		if (isset($pdf)) {

			// $processDetails;
			$data = array();
			$data['processDetails'] = $processDetails;
			if (!isset($processDetails) || empty($processDetails)) {
				echo "No data found for this selection.";
				exit();
			}

			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			//$this->mpdfci->setFooter('{PAGENO}');
			//generate the PDF from the given html
			// foreach($processDetails as $key => $value) {
			// echo "sdfsdfsdf";
			// print(asort($sortedArr));exit;
			$data['processDetails'] = $processDetails;
			$data['sortedArr'] = $sortedArr;
			$data['filterData'] = $filterData;
			$data['filterLable'] = $filterLable;
			$pdfFilePath = $this->load->view('donorReportView', $data, true);
			$this->mpdfci->AddPage();
			$this->mpdfci->SetWatermarkImage($this->config->item('app_url') . "/images/PNG_LOGO.png", 0.3, 'F', array(17, 50));
			$this->mpdfci->showWatermarkImage = true;
			$this->mpdfci->WriteHTML($pdfFilePath);

			// }
			//download it.
			// $filePath=$this->config->item("receiptPATH").$reciptID.".pdf";
			//print $filePath; exit();

			$this->mpdfci->Output();
		}
	}

	public function celebrateWithUsReport()
	{
		$postData = json_decode($_POST['formData']);
		$t = $postData->textSearch;
		$t = $t ?? '';
		$textSearch = trim($t);
		$textval = $postData->textval;
		$orderBy = $postData->orderBy;
		$order = $postData->order;
		$statuscode = $postData->status;
		$reportType = $postData->reportType;
		$confirmationStatus = $postData->confirmationStatus;

		$config = $sortedArr = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "celWithUsID";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
			$sortedArr['Search By'] = $textSearch;
			$sortedArr['Search Text'] = $textval;
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			$sortedArr['Status '] = $statusStr;
		}

		if (isset($confirmationStatus) && !empty($confirmationStatus)) {
			$wherec["confirmationStatus ="] = '"' . $confirmationStatus . '"';
			$sortedArr['Confirmation Status '] = $confirmationStatus;
		}

		$sortedArr['Order By'] = $orderBy;
		$sortedArr['Order'] = $order;

		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "pocName";
		$join[0]['key2'] = "adminID";


		$join[1]['type'] = "LEFT JOIN";
		$join[1]['table'] = "regionmaster";
		$join[1]['alias'] = "r";
		$join[1]['key1'] = "area";
		$join[1]['key2'] = "regionID";


		$join[2]['type'] = "LEFT JOIN";
		$join[2]['table'] = "admin";
		$join[2]['alias'] = "aa";
		$join[2]['key1'] = "approveOrDeclinedBy";
		$join[2]['key2'] = "adminID";

		$selectC = "t.*,a.name as myPocName,r.regionName,aa.name as approveOrDeclinedBy";
		$processDetails = $this->CommonModel->GetMasterListDetails($selectC, 'celebrateWithUs', $wherec, '', '', $join, $other);
		// print_r($processDetails);exit;
		if (!isset($processDetails) || empty($processDetails)) {

			$status['msg'] = $this->systemmsg->getErrorCode(273);
			$status['statusCode'] = 273;
			$status['flag'] = 'F';
			$this->load->view("error_message", $status);
			exit();
		}
		if ($reportType == "Excel") {
			$printDetails = array();
			$i = 0;
			foreach ($processDetails as $key => $value) {

				if ($value->poc == "Other") {
					$pocName = $value->pocName;
				} else {
					$pocName = $value->myPocName;
				}
				if ($value->area == "Other") {
					$area = $value->area;
				} else {
					$area = $value->regionName;
				}





				$printDetails[$i]["reqName"] = 	$value->prefix . " " . $value->reqByName . " " . $value->reqBySurName;
				$printDetails[$i]["poc"] = 	$value->poc;
				// $printDetails[$i]["confirmationDate"] = 	dateFormat($value->confirmationDate,'d-m-Y');
				// $printDetails[$i]["dateOfDonation"] = 	dateFormat($value->dateOfDonation,'d-m-Y');
				$printDetails[$i]["pocName"] = 	$pocName;
				$printDetails[$i]["address"] = 	$value->address;
				$printDetails[$i]["contactNo"] = 	$value->contactNo;
				$printDetails[$i]["whatsappNo"] = 	$value->whatsappNo;
				$printDetails[$i]["emailID"] = 	$value->emailID;
				$printDetails[$i]["area"] = 	$value->area;
				$printDetails[$i]["otherArea"] = 	$value->otherArea;
				$printDetails[$i]["occasion"] = 	$value->occasion;
				$printDetails[$i]["otherOccasion"] = 	$value->otherOccasion;
				$printDetails[$i]["expDateOfEvent"] = 	dateFormat($value->expDateOfEvent, 'd-m-Y');
				$printDetails[$i]["confirmationStatus"] = 	$value->confirmationStatus;
				$printDetails[$i]["confirmationDate"] = 	dateFormat($value->confirmationDate, 'd-m-Y');
				$printDetails[$i]["approveOrDeclinedBy"] = 	$value->approveOrDeclinedBy;
				$printDetails[$i]["appEventDate"] = 	dateFormat($value->appEventDate, 'd-m-Y');
				$printDetails[$i]["appEventTime"] = 	$value->appEventTime;
				$printDetails[$i]["cciName"] = 	$value->cciName;
				$printDetails[$i]["cciContactNo"] = 	$value->cciContactNo;
				$printDetails[$i]["eventAddress"] = 	$value->eventAddress;
				$printDetails[$i]["ankurContactNo"] = 	$value->ankurContactNo;
				$printDetails[$i]["noOfChildern"] = 	$value->noOfChildern;
				$printDetails[$i]["reason"] = 	$value->reason;
				$printDetails[$i]["createdDate"] = 	$value->createdDate;
				$i++;
			}
			$rowArray = array("Rquested By", "POC Type", "POC Name", "Address", "Contact No", "Whatsapp No", "Email ID", "Area", "Other Area", "Occasion", "Other Occasion", "Expected Date Of Event", "Confirmation Status", "Confirmation Date", "Approve Or Declined By", "Approved Event Date", "Approved Event Time", "CCI Name", "CCI Contact No", "Event Address", "Ankur Contact No", "Number Of Childern", "Reason", "Created Date");

			// print_r($printDetails); exit;
			// echo  phpinfo();exit;
			$spreadsheet = new Spreadsheet();
			$Excel_writer = new Xls($spreadsheet);
			$spreadsheet->setActiveSheetIndex(0);
			$spreadsheet->getActiveSheet()->setTitle("Sheet1");
			$styleArray = array(
				'borders' => array(
					'outline' => array(
						'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
						'color' => array('argb' => '00999999'),
					),
				),
			);
			$spreadsheet->getActiveSheet()
				->fromArray(
					$rowArray,   // The data to set
					NULL,        // Array values with this value will not be set
					'A1'         // Top left coordinate of the worksheet range where
					//    we want to set these values (default is A1)
				);
			$spreadsheet->getActiveSheet()
				->fromArray(
					$printDetails,  // The data to set
					NULL,        // Array values with this value will not be set
					'A2'         // Top left coordinate of the worksheet range where
					//    we want to set these values (default is A1)
				);
			for ($i = 0; $i <= count($printDetails); $i++) {
				for ($j = 0; $j < count($rowArray); $j++) {
					$spreadsheet->getActiveSheet()->getCellByColumnAndRow($j + 1, $i + 2)->getStyle()->applyFromArray($styleArray)->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER)->setWrapText(true);
				}
			}
			header('Content-Type: application/vnd.ms-excel');
			// header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			$filename = "CelebrateWithUsReport" . ".xls";
			header('Content-Disposition: attachment;filename="' . $filename . '"');

			// do not remove below two line.it`s clean the unwanted data and make clean Xls
			ob_end_clean();
			ob_start();
			$Excel_writer->save('php://output');
		}
		if ($reportType == "PDF") {
			// $processDetails;
			$data = array();
			$data['processDetails'] = $processDetails;
			if (!isset($processDetails) || empty($processDetails)) {
				echo "No data found for this selection.";
				exit();
			}

			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			//$this->mpdfci->setFooter('{PAGENO}');
			//generate the PDF from the given html
			// foreach($processDetails as $key => $value) {
			// echo "sdfsdfsdf";
			// print(asort($sortedArr));exit;
			$data['processDetails'] = $processDetails;
			$data['sortedArr'] = $sortedArr;
			$pdfFilePath = $this->load->view('celebrateWithUSReportView', $data, true);
			$this->mpdfci->AddPage();
			$this->mpdfci->SetWatermarkImage($this->config->item('app_url') . "/images/PNG_LOGO.png", 0.3, 'F', array(17, 50));
			$this->mpdfci->showWatermarkImage = true;
			$this->mpdfci->WriteHTML($pdfFilePath);

			// }
			//download it.
			// $filePath=$this->config->item("receiptPATH").$reciptID.".pdf";
			//print $filePath; exit();

			$this->mpdfci->Output();
		}
	}


	public function reportDataPreview()
	{
		// print_r($this->input->get());
		$wherec = $join = $sortedArr = array();
		$reportType = $this->input->get('reportType');
		$txtVal = $this->input->get('txtVal');
		$pocType = $this->input->get('pocType');
		$pocName = $this->input->get('pocName');
		$otherPocName = $this->input->get('otherPocName');
		$birMonth = $this->input->get('birMonth');
		$categoryList = $this->input->get('categoryList');
		$otherCategory = $this->input->get('otherCategory');
		$fromAmount = $this->input->get('fromAmount');
		$toAmount = $this->input->get('toAmount');
		$fromDate = $this->input->get('fromDate');
		$toDate = $this->input->get('toDate');
		$orderBy = $this->input->get('orderBy');
		$order = $this->input->get('order');
		$status = $this->input->get('status');
		$excel = $this->input->get('excel');
		$pdf = $this->input->get('pdf');
		$confirmationStatus = $this->input->get('confirmationStatus');
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "donatedByName";
			$order = "DESC";
		}
		$sortedArr["Order By"] = $orderBy;
		$sortedArr["Order"] = $order;
		$other = array("d.orderBy" => $orderBy, "d.order" => $order);
		if (isset($reportType) && !empty($reportType)) {
			$wherec["d." . $reportType . ""] = "='" . $txtVal . "'";
			$sortedArr["Search By"] = $txtVal;
		}
		$wherec["t.status"] = "='active'";
		// $wherec["d.status"] = "='active'";
		/// check confirmation status
		if (isset($confirmationStatus) && !empty($confirmationStatus)) {
			$wherec["t.confirmationStatus"] = "='" . $confirmationStatus . "'";
			$sortedArr["Confirmation Status"] = $confirmationStatus;
		}
		// print_r($wherec);exit;
		//check POC
		if (isset($pocType) && !empty($pocType) && $pocType != "Other") {
			if ($pocName != "") {
				$sortedArr["POC Type"] = $pocType;
				$wherec["t.pointOfContactName"] = "='" . $pocName . "'";
				////this qury for get poc for "sortedArr"
				$pocWhere = array("adminID" => "$pocName");
				$pocName = $this->CommonModel->getMasterDetails('admin', 'name', $pocWhere);
				$sortedArr["POC Name"] = $pocName[0]->name;
			} else {
				$status = array();
				$status['msg'] = "POC Name Required";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		} else if (isset($pocType) && !empty($pocType) && $pocType == "Other") {
			if ($otherPocName != "") {
				$sortedArr["POC Type"] = $pocType;
				$wherec["t.pointOfContactName"] = "='" . $otherPocName . "'";
				$sortedArr["POC Name"] = $otherPocName;
			} else {
				$status = array();
				$status['msg'] = "POC Name Required";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		}

		//check birthday month
		if (isset($birMonth) && !empty($birMonth)) {
			$sortedArr["Birth Day Month"] = $birMonth;
			$wherec["monthname(d.dateOfBirth)"] = "='" . $birMonth . "'";
		}
		///checking category here
		if (isset($categoryList) && !empty($categoryList) && $categoryList == "Other") {
			if ($otherCategory != "") {
				$sortedArr["Category"] = $categoryList;
				$sortedArr["otherCategory"] = $otherCategory;
				$wherec["d.otherCategory"] = "='" . $otherCategory . "'";
			} else {
				$status = array();
				$status['msg'] = "Other category required.";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		}

		if (isset($fromAmount) && !empty($fromAmount) && isset($toAmount) && !empty($toAmount)) {
			if ($fromAmount <= $toAmount && $fromAmount >= 1) {
				$sortedArr["From Amount"] = $fromAmount;
				$sortedArr["toAmount"] = $toAmount;
				$wherec["t.amountInFigure >= "] = "'" . $fromAmount . "'";
				$wherec["t.amountInFigure <= "] = "'" . $toAmount . "'";
			} else {
				$status = array();
				$status['msg'] = "Enter Valid Amount Range";
				$status['statusCode'] = 273;
				$status['flag'] = 'F';
				$this->load->view("error_message", $status);
				exit();
			}
		} elseif ($fromAmount != "" && $fromAmount == 0) {
			$status = array();
			$status['msg'] = "Enter Valid Amount Range";
			$status['statusCode'] = 273;
			$status['flag'] = 'F';
			$this->load->view("error_message", $status);
			exit();
		}
		if (isset($fromDate) && !empty($fromDate)) {
			if (!isset($fromDate) || empty($fromDate)) {
				$toDate = date("Y-m-d");
			}
			$sortedArr["From Date"] = dateFormat($fromDate, "d-M-Y");
			$sortedArr["To Date"] = dateFormat($toDate, "d-M-Y");
			$wherec["date(t.createdDate) >= "] = "'" . dateFormat($fromDate, "Y-m-d") . "'";
			$wherec["date(t.createdDate) <= "] = "'" . dateFormat($toDate, "Y-m-d") . "'";
		}
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "donorRegistration";
		$join[0]['alias'] = "d";
		$join[0]['key1'] = "donorName";
		$join[0]['key2'] = "donorID";
		$adminName = "";
		if ($pocType == "POC") {
			$join[1]['type'] = "LEFT JOIN";
			$join[1]['table'] = "admin";
			$join[1]['alias'] = "a";
			$join[1]['key1'] = "pointOfContactName";
			$join[1]['key2'] = "adminID";
			$adminName = ",a.name";
		}
		$categoryName = "";
		if (isset($categoryList) && !empty($categoryList) && $categoryList != "Other") {
			$cWhere = array("categoryID" => $categoryList);
			$cName = $this->CommonModel->getMasterDetails('categoryMaster', 'categoryName', $cWhere);
			$sortedArr["Category"] = $cName[0]->categoryName;
			$wherec["d.category"] = "='" . $categoryList . "'";
		}
		$categoryName = ",c.categoryName";
		$join[2]['type'] = "LEFT JOIN";
		$join[2]['table'] = "categoryMaster";
		$join[2]['alias'] = "c";
		$join[2]['key1Alias'] = "d";
		$join[2]['key1'] = "category";
		$join[2]['key2'] = "categoryID";


		$join[3]['type'] = "LEFT JOIN";
		$join[3]['table'] = "admin";
		$join[3]['alias'] = "ap";
		$join[3]['key1'] = "approveOrDeclinedBy";
		$join[3]['key2'] = "adminID";

		$join[4]['type'] = "LEFT JOIN";
		$join[4]['table'] = "admin";
		$join[4]['alias'] = "poc";
		$join[4]['key1'] = "pointOfContactName";
		$join[4]['key2'] = "adminID";

		$join[5]['type'] = "LEFT JOIN";
		$join[5]['table'] = "regionMaster";
		$join[5]['alias'] = "re";
		$join[5]['key1Alias'] = "d";
		$join[5]['key1'] = "region";
		$join[5]['key2'] = "regionID";

		// $join[6]['type'] ="LEFT JOIN";
		// $join[6]['table']="admin";
		// $join[6]['alias'] ="cat";
		// $join[5]['key1Alias'] ="d";
		// $join[6]['key1'] ="category";
		// $join[6]['key2'] ="categoryID";




		$selectC = "t.*,c.categoryName,re.regionName,poc.name as POCName,ap.name as appOrDecByName,d.prefix,d.donatedByName,d.donatedBySurName,d.residentialAddress,d.contactNo,d.WhatsappNo,d.emailID,d.dateOfBirth,d.region,d.otherRegion,d.category,d.otherCategory,d.status as status1" . $adminName . $categoryName;
		// $selectC="d.donatedByName";
		$processDetails = $this->CommonModel->GetMasterListDetails($selectC, 'donorRecipts', $wherec, '', '', $join, $other);
		// echo "<pre>";
		// 	print_r($wherec);
		// 	print_r($sortedArr);
		// echo count($processDetails);
		// 	print_r($processDetails[0]);
		// exit;
		$status = array();
		if (!isset($processDetails) || empty($processDetails)) {

			$status['msg'] = "No Data Found";
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$status['data'] = $processDetails;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}
}
