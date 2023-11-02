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
		$customerTable = 'ab_customer';
		$projectTable = 'ab_project';
		
		$dashboardCustCount = $this->CommonModel->getMasterDetails('customer','*',$where = array());
		$customerLength = count($dashboardCustCount);
		$dashboardProjectCount = $this->CommonModel->getMasterDetails('project','*',$where = array());
		$projectLength = count($dashboardProjectCount);
		
		$countArray = array(
			'customerCount' => $customerLength,
			'projectCount' => $projectLength
		);

		$status['data'] =$countArray;
		$status['statusCode'] = 200;
		$status['flag'] = 'S';
		$this->response->output($status,200);
	}
	
}
