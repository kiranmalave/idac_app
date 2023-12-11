<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class InfoSetting extends CI_Controller {

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

	public function index($id='')
	{

		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		
		if($method === "PUT" || $method === "POST"){
			$infoDetails = array();
			
			$updateDate = date("Y/m/d H:i:s");
			$id = $this->input->post('infoID');
			
			$infoDetails['companyName'] = $this->validatedata->validate('companyName');
			$infoDetails['fromEmail'] = $this->validatedata->validate('fromEmail');
			$infoDetails['ccEmail'] = $this->validatedata->validate('ccEmail');
			$infoDetails['fromName'] = $this->validatedata->validate('fromName');
			$infoDetails['facebook'] = $this->validatedata->validate('facebook');
			$infoDetails['twitter'] = $this->validatedata->validate('twitter');
			$infoDetails['instagram'] = $this->validatedata->validate('instagram');
			$infoDetails['youtube'] = $this->validatedata->validate('youtube');
			$infoDetails['linkedIn'] = $this->validatedata->validate('linkedIn');
			$infoDetails['website'] = $this->validatedata->validate('website');
			$infoDetails['whatsapp'] = $this->validatedata->validate('whatsapp');
			$infoDetails['ourTarget'] = $this->validatedata->validate('ourTarget');
			$infoDetails['termsConditions'] = $this->validatedata->validate('termsConditions');
			$infoDetails['invoice_logo'] = $this->validatedata->validate('client_logo');
			$infoDetails['created_by'] = $this->validatedata->validate('SadminID');
			$infoDetails['created_date'] = $updateDate;	
			
			$wherec  = array('infoID' =>$id);

			// $fieldData = $this->datatables->mapDynamicFeilds("info_settings",$this->input->post());
			// $infoDetails = array_merge($fieldData, $infoDetails);

			$infoData = $this->CommonModel->getMasterDetails('info_settings','',$wherec);

			if(isset($infoData) && !empty($infoData)){
				$infoDetails['modified_date'] = $updateDate;
				$infoDetails['modified_by'] = $this->input->post('SadminID');

				$isinsert = $this->CommonModel->updateMasterDetails('info_settings',$infoDetails,$wherec);
				if(!$isinsert){
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
			else{
				$count = $this->CommonModel->countFiltered('info_settings');
				if($count == 0){
					$isinsert = $this->CommonModel->saveMasterDetails('info_settings',$infoDetails);

						if(!$isinsert){

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
		
			
		else
		{
			$id = $this->input->post('infoID');
			$where = $id;
			$infoHistory = $this->CommonModel->getMasterDetails('info_settings','',$where);
			if(isset($infoHistory) && !empty($infoHistory)){

			$status['data'] = $infoHistory;
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
}
?>