<?php
defined('BASEPATH') or exit('No direct script access allowed');
class OneDrive extends CI_Controller
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
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library('MicrosoftGraphAPI');
	}

	public function onedriveSync(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$details = array();
		$accessToken = $this->input->post('token');

		$parts = explode("&", $accessToken);
		$main_access_token = "";

		foreach ($parts as $part) {
			if (strpos($part, "access_token=") === 0) {
				$main_access_token = substr($part, strlen("access_token="));
				break;
			}
		}
		$details['one_drive_access_token'] = $main_access_token;
		$where = array('adminID' => $this->input->post('SadminID'));
		$iscreated = $this->CommonModel->updateMasterDetails('admin', $details, $where);
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
	public function onedriveCallBack(){
		$adminID = $this->input->post('SadminID');
		if(!isset($_COOKIE['_bb_key']) || empty($_COOKIE['_bb_key'])){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		if(!isset($adminID) || empty($adminID)){
			$adminID = $_COOKIE['authid'];
		}
		$this->microsoftgraphapi->adminID = $adminID;
		$res = $this->microsoftgraphapi->authenticate();
		if(!$res){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function onedriveAccess(){
		
	}
	public function getList(){
		$adminID = $this->input->post('SadminID');
		if(!isset($_COOKIE['_bb_key']) || empty($_COOKIE['_bb_key'])){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		if(!isset($adminID) || empty($adminID)){
			$adminID = $_COOKIE['authid'];
		}
		$this->microsoftgraphapi->adminID = $adminID;
		$this->microsoftgraphapi->getFileList();
	}
	public function getFolderByName(){
		
		$this->microsoftgraphapi->getFolderIDByName('test');
	}
	public function createFolder(){
		$adminID = $this->input->post('SadminID');
		if(!isset($_COOKIE['_bb_key']) || empty($_COOKIE['_bb_key'])){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		if(!isset($adminID) || empty($adminID)){
			$adminID = $_COOKIE['authid'];
		}
		$this->microsoftgraphapi->adminID = $adminID;
		$this->microsoftgraphapi->createFolder('Project_1002');
	}
	public function deleteFiles(){
		$this->microsoftgraphapi->deleteFiles('B5C78AF7D85EDA15!1128');
	}
	public function token(){
		$res = $this->microsoftgraphapi->getToken();
		$status['msg'] = $this->systemmsg->getSucessCode(400);
		$status['statusCode'] = 400;
		$status['token'] = $res; 
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}
	//create folder in spacific folder.
	//http://localhost/idac_app/API/createFolder
	// search folder id by name
	//http://localhost/idac_app/API/getFolderByName
	// for get the drive list
	//http://localhost/idac_app/API/getOneDriveList
	// for token
	//http://localhost/idac_app/API/onedriveCallBack?
	
	
    
}