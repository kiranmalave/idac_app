<?php
defined('BASEPATH') or exit('No direct script access allowed');

class EmailSender extends CI_Controller
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
		$this->load->library("response");
		$this->load->library("ValidateData");
        if(!$this->config->item('development'))
		{
            $this->load->library("emails");	
        }
    }

    public function sendEmail()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        
        $updateDate = date("Y/m/d H:i:s");

        $emailDetails = array();
        $emailDetails['fromField'] = $this->input->post('fromField');
        $emailDetails['toFeild'] = $this->input->post('toField');
        if (!isset($emailDetails['toFeild'] ) || empty($emailDetails['toFeild'] )) {
            $status['msg'] = 'Recipient Required';
            $status['statusCode'] = 218;
            $status['data'] = array();
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }
        $emailDetails['cc'] = $this->input->post('cc');
        $emailDetails['bcc'] = $this->input->post('bcc');
        $emailDetails['subject'] = $this->validatedata->validate('subject', 'subject', true, '', array());
        $emailDetails['mail_description'] = $this->validatedata->validate('mail_body', 'mail_description', true, '', array());
        
        // print_r($emailDetails);exit;
       
        $logDetails = array();

        $logDetails['to_email'] = $emailDetails['toFeild'];
        $logDetails['subject'] = $emailDetails['subject'] ;
        $logDetails['body'] = $emailDetails['mail_description'] ;
        $logDetails['cc'] = $emailDetails['cc'];
        $logDetails['bcc'] = $emailDetails['bcc'] ;
        $logDetails['created_date'] = $updateDate;
        $logDetails['sender_id'] = $this->input->post('SadminID');
        $logDetails['type'] = 'email';
        $logDetails['for_event'] = 'general';
        $logDetails['created_date'] = $updateDate;
        
     
        $mail = $this->emails->sendMailDetails($emailDetails['fromField'],"",$emailDetails['toFeild'],$emailDetails['cc'],$emailDetails['bcc'],$emailDetails['subject'],$emailDetails['mail_description'],'','','','','','');
        if($mail){
            $logDetails['status'] = "delivered";
        }else{
            $logDetails['status'] = "not_delivered";
        }
        foreach ($emailDetails['toFeild'] as $key => $value) {
            $logDetails['to_email'] = $value;
            $iscreated = $this->CommonModel->saveMasterDetails('email_logs', $logDetails);
        }
       
        if ($mail) {
            $status['msg'] = $this->systemmsg->getSucessCode(400);
            $status['statusCode'] = 400;
            $status['data'] = array();
            $status['flag'] = 'S';
            $this->response->output($status, 200);
        } else {
            $status['msg'] = $this->systemmsg->getErrorCode(998);
            $status['statusCode'] = 998;
            $status['data'] = array();
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }

    }       
}
	


	 

