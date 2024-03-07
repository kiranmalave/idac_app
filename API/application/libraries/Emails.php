<?php
// require 'vendor/autoload.php'; // If you're using Composer (recommended)
// use SendGrid\Mail\To;
// use SendGrid\Mail\Cc;
// use SendGrid\Mail\Bcc;
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Emails
{
	var $live_url = "";
	var $appName = "";
	var $logoPath = "";
	var $appLink = "";

	public function __construct()
	{

		//parent::__construct();
		$this->CI = &get_instance();
		$config['protocol'] = 'mail'; // smtp
        $config['smtp_host'] = 'mail.idacindia.co.in';
        $config['smtp_user'] = 'info@idacindia.co.in';
        $config['smtp_pass'] = 'oN)tE57T7pvx';
        $config['smtp_port'] = 587; // 465
        $config['charset'] = 'UTF-8';
        $config['mailtype'] = 'html';
        $config['wordwrap'] = TRUE;
        $this->CI->load->library('email', $config);
        $this->CI->email->set_newline("\r\n");
        $this->CI->email->set_crlf("\r\n");
        $this->CI->email->set_newline("\r\n");
        $this->CI->load->helper('url');
		$this->live_url = $this->CI->config->item('live_base_url');
		$this->appName = $this->CI->config->item('appName');
		$this->appLink = $this->CI->config->item('app_url');
		$this->logoPath = $this->CI->config->item('app_url') . "images/" ;
		$this->supportEmail = $this->CI->config->item('supportEmail');
		$this->supportEmailName = $this->CI->config->item('supportEmailName');
		$this->mail_server = $this->CI->config->item('mail_server');
	}
	public function sendMailDetails($from = '', $fromName = '', $to = '', $cc = '', $bcc = '', $subject = '', $msg = '', $attachment = "", $attachment2 = "", $attachment3 = "", $attachment4 = "", $dyanamicAttchments = array())
	{
		if($this->CI->config->item('development')){
			// print_r($this->mailFormat($msg));
			return true;	
		}
		
		if(!isset($from) || empty($from)){
			$from = $this->CI->config->item('supportEmail');
			
		}
		if(!isset($fromName) || empty($fromName)){
			$fromName = "[".$this->CI->config->item('supportEmailName')."]";
			
		}
		if($this->mail_server == "sendgrid"){
			return $this->sendMailDetailsSendGrid($from,$fromName,$to,$cc,$bcc,$subject,$msg,$dyanamicAttchments);
		}
		// print $msg;
		// return true;
		$this->CI->email->set_mailtype("html");
		$this->CI->email->from($from, $fromName);
		if(is_array($to)){
			$this->CI->email->to(implode(',',$to));
		}else{
			$this->CI->email->to($to);
		}
		

		if (!empty($cc)){
			if(is_array($to)){
				$this->CI->email->cc(implode(', ', $cc));
			}else{
				$this->CI->email->cc($cc);
			}
		}
		if (!empty($bcc)){
			if(is_array($to)){
				$this->CI->email->bcc(implode(', ', $bcc));
			}else{
				$this->CI->email->bcc($bcc);
			}
		}

		if ($attachment != "") {
			$this->CI->email->attach($attachment);
		}
		if ($attachment2 != "") {
			$this->CI->email->attach($attachment2);
		}
		if ($attachment3 != "") {
			$this->CI->email->attach($attachment3);
		}
		if ($attachment4 != "") {
			$this->CI->email->attach($attachment4);
		}

		if (!empty($dyanamicAttchments)) {
			foreach ($dyanamicAttchments as $attach) {
				$this->CI->email->attach($attach);
			}
		}
		$this->CI->email->subject($subject);
		$this->CI->email->message($this->mailFormat($msg));
		return $this->CI->email->send();
		
	}
	public function mailFormat($message = '')
	{
		$mainTemp = $this->mailFormatHTML();
		$mainTemp = str_replace("{appName}", $this->appName, $mainTemp);
		$mainTemp = str_replace("{appLink}", $this->appLink, $mainTemp);
		
		$wherec = array("infoID"=>1);
	 	$infoSettings = $this->CI->CommonModel->getMasterDetails("info_settings","*",$wherec);
		
		if($infoSettings[0]->website_logo != ''){
			if(file_exists($this->CI->config->item('mediaPATH').$infoSettings[0]->website_logo)){
				$this->logoPath = $this->CI->config->item('app_url').'/website/uploads/'.$infoSettings[0]->website_logo;
			}else
			{
				$this->logoPath = '' ;	
			}
		}else{
			$this->logoPath = '' ;
		}
		
		$mainTemp = str_replace("{logoPath}", $this->logoPath, $mainTemp);
		$mainTemp = str_replace("{{mainMailBody}}", $message, $mainTemp);
		return $mainTemp;
	}
	public function mailFormatHTML()
	{
		return $mailFormat = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
		<title>{appName}</title>
		<style type="text/css">
		body{width:100%;margin:0px;padding:0px;background:##f0f0f0;text-align:center; -webkit-font-smoothing: antialiased;mso-margin-top-alt:0px; mso-margin-bottom-alt:0px; mso-padding-alt: 0px 0px 0px 0px;}
		html{width: 100%; }
		img {border:0px;text-decoration:none;display:block; outline:none;}
		a,a:hover{text-decoration:none;}.ReadMsgBody{width: 100%; background-color: #ffffff;}.ExternalClass{width: 100%; background-color: #ffffff;}
		table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }  
		p,h1,h2,h3,h4{margin-top:0;margin-bottom:0;padding-top:0;padding-bottom:0;}
		.main-bg{ background:#323030;}
		.footer-border{border-top: solid 1px #f5666e; }
		@media only screen and (max-width:640px)
		{
			body{width:auto!important;}
			table[class=main] {width:440px !important;}
			table[class=inner-part]{width:400px !important;}
			table[class=inner-full]{width:100% !important;}
			table[class=inner-center]{width:400px !important; text-align:center;}
			table[class=inner-service]{width:80% !important;}
			.alaine{ text-align:center;}
		
			}
		
		@media only screen and (max-width:479px)
		{
			body{width:auto!important;}
			table[class=main] {width:280px !important;}
			table[class=inner-part]{width:260px !important;}
			table[class=inner-full]{width:100% !important;}
			table[class=inner-center]{width:260px !important; text-align:center;}
			table[class=inner-service]{width:185px !important;}
			.alaine{ text-align:center;}
		}
		</style>
		</head>
		<body>
		<!--Main Table Start-->
		<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#f0f3f7" style="background:#f0f3f7;">
		  <tr>
			<td align="center" valign="top">
			<!--Top space Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
				
				<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  <tr>
					<td height="60" align="left" valign="top">&nbsp;</td>
				  </tr>
				</table>
				
				</td>
			  </tr>
			</table>
			
			<!--Top space End-->
			<!--Logo Part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td align="center" valign="top">
						<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
							<tr>
								<td align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;">
									<table border="0" align="center" cellpadding="0" cellspacing="0">
									<tr>
										<td height="25" align="center" valign="top">&nbsp;</td>
									</tr>
									<tr>
										<td align="center" valign="top"><a href="{appLink}"><img editable="true" mc:edit="logo" src="{logoPath}" width="140" height="70" alt="{appName}" /></a></td>
									</tr>
									<tr>
										<td height="25" align="center" valign="top">&nbsp;</td>
									</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td height="1" align="center" bgcolor="#f0f3f7" style="background:#f0f3f7;" valign="top">&nbsp;</td>
				</tr>
			</table>
			<!--Logo Part End-->
			<!--Welcome Text Part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td align="center" valign="top">
					
						<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
							<tr>
							<td align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;"><table width="525" border="0" align="center" cellpadding="0" cellspacing="0" class="inner-part">
							<tr>
								<td height="10" align="center" valign="top">&nbsp;</td>
							</tr>
							<tr>
								<td valign="top" color="#4d6575" style="color:#4d6575;">
								<multiline>
									{{mainMailBody}}
								</multiline><br>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			</td>
			  </tr>
			</table>
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
					<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  	<tr>
						<td height="10" align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;">&nbsp;</td>
				  	</tr>
					</table>
				</td>
			  </tr>
			</table>
			<!--Space End-->
			<!--Copyright part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
				<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  <tr>
					<td align="left" valign="top" bgcolor="#f0f3f7" style="background:#f0f3f7;"><table width="80%" border="0" align="center" cellpadding="0" cellspacing="0">
					  <tr>
						<td height="25" align="center" valign="top">&nbsp;</td>
					  </tr>
					  <tr>
						<td align="center" valign="top"  color="#4d6575" style="color:#4d6575;font:Bold 12px Arial, Helvetica, sans-serif; padding-bottom:8px;" mc:edit="copyright"><multiline>Copyright &copy; 2023 {appName}. All Rights Reserved.</multiline></td>
					  </tr>
					  <tr>
						<!-- <td align="center" valign="top" style="font:Bold 12px Arial, Helvetica, sans-serif; color:#FFF;" mc:edit="support"> <multiline>Support  /</multiline>  <unsubscribe> unsubscribe </unsubscribe></td> -->
					  </tr>
					  <tr>
						<td height="25" align="center" valign="top">&nbsp;</td>
					  </tr>
					</table>
				  </td>
				  </tr>
				</table>
				</td>
			  </tr>
			</table>
			<!--Copyright part End-->
			</td>
		  </tr>
		</table>
		<!--Main Table End-->
		</body>
		</html>
		';
	}
	function sendMailDetailsSendGrid($from,$fromName,$to,$cc,$bcc,$subject,$msg,$dyanamicAttchments){

		$email = new \SendGrid\Mail\Mail(); 
		// personalization
		$personalization = new \SendGrid\Mail\Personalization();
		//print gettype($to);
		if(gettype($to) =="string"){
			$to =array($to);
		}
		foreach ($to as $To) {
			$personalization->addTo(new To($To, ''));
		}
		if(isset($cc) && !empty($cc)){
			foreach ($cc as $CC) {
				$personalization->addCc(new Cc($CC,""));
			}
			
		}
		if(isset($bcc) && !empty($bcc)){
			foreach ($bcc as $BCC) {
				$personalization->addBcc(new Bcc($BCC,""));
			}
			
		}
		$email->setFrom($from,$fromName);
		$email->setSubject($subject);
		$email->addPersonalization($personalization); // add personalization
		
// add multiple to
		// $newTo = explode(",", $to);
		// foreach ($newTo as $To) {
		// 	$email->addTo($To);
		// }

// add multiple cc
		// $newCc = explode(",", $cc);
		// foreach ($newCc as $cC) {
		// 	$email->addCc($cC);
		// }

		//$email->addContent("text/html", "and easy to do anywhere, even with PHP");
		$email->addContent(
			"text/html",$this->mailFormat($msg)
		);
		//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
		//$sendgrid = new \SendGrid(getenv('SENDGRID_API_KEY'));
		$sendgrid = new \SendGrid("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");
		try {
			$response = $sendgrid->send($email);
			if($response->statusCode() == "202"){
				return true;
			}else{
				return false;
			}
			// print $response->statusCode() . "\n";
			// print_r($response->headers());
			// print $response->body() . "\n";
		} catch (Exception $e) {
			return false;
			//echo 'Caught exception: '. $e->getMessage() ."\n";
		}
	}
	
}