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
		$wherec["status"] = 'active';
		$wherec["type"] = 'customer';

		$wherep["status"] = 'active';

		$dashboardCustCount = $this->CommonModel->getMasterDetails('customer','count(customer_id) as totalcut',$wherec);
		$customerLength = $dashboardCustCount[0]->totalcut;
		$dashboardProjectCount = $this->CommonModel->getMasterDetails('project','count(project_id) as totalcut',$wherep);
		$projectLength = $dashboardProjectCount[0]->totalcut;
		
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
