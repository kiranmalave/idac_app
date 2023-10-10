<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->helper('form');
		$this->load->model('CommonModel');
		$this->load->model('DashboardModel');
		$this->load->library('emails');
		$this->load->library('ValidateData');
	}

	public function index(){
		$this->load->view('welcome_message');
		
	}

	public function getDashboardCount(){
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID=$this->input->post('SadminID');
		$statusInfo = new stdClass();
		$statusInfo->ourTarget = 0;
		$statusInfo->OurAchived = 0;
		$statusInfo->myaTarget = 0;
		$statusInfo->achived = 0;
		// $statusInfo->totalItem = $totalItem;
		
		$where=array("infoID"=>2);
		$ourTarget=$this->CommonModel->getMasterDetails("info_settings","ourTarget",$where);
		
		$where=array("adminID"=>$adminID);
		$myTarget=$this->CommonModel->getMasterDetails("user_extra_details","myTarget",$where);

		$where=array("status"=>"Active","pointOfContactName"=>$adminID,"confirmationStatus"=>"Approved");
		$achivedData=$this->CommonModel->getMasterDetails("donorRecipts","amountInFigure",$where);

		$where=array("status"=>"Active","confirmationStatus"=>"Approved");
		$OurAchivedData=$this->CommonModel->getMasterDetails("donorRecipts","amountInFigure",$where);

		
		$pocwisedata=$this->DashboardModel->getAllPOCArchivedTarget($where=array("t.status"=>"Active","confirmationStatus"=>"Approved"));
		$pocwisedataOther=$this->DashboardModel->getAllPOCArchivedTargetOther($where=array("status"=>"Active","confirmationStatus"=>"Approved","pointOfContact"=>"Other"));


		$ourAchivedAmt=0;
		if(isset($OurAchivedData)&&!empty($OurAchivedData))
		{
			foreach ($OurAchivedData as $key => $value) {
				$ourAchivedAmt+=$value->amountInFigure;
			}

		}

		$achivedAmt=0;
		if(isset($achivedData)&&!empty($achivedData))
		{
			foreach ($achivedData as $key => $value) {
				$achivedAmt+=$value->amountInFigure;
			}

		}
		$statusInfo->ourTarget = $ourTarget[0]->ourTarget;
		$statusInfo->myTarget = $myTarget[0]->myTarget;
		$statusInfo->achived = $achivedAmt;
		$statusInfo->ourAchivedAmt = $ourAchivedAmt;
		$statusInfo->pocwisedata = $pocwisedata;
		$statusInfo->pocwisedataOther = $pocwisedataOther;
		$status['data'] =$statusInfo;
		$status['statusCode'] = 200;
		$status['flag'] = 'S';
		$this->response->output($status,200);
	}
	
}
