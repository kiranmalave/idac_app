<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	class TaxInvoiceModel extends CI_Model{
	
	function __construct()
	{
		parent::__construct();
	}
	public function getTotalTaxInvoice($where=array())
	{
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if($whereStr == "")
				$whereStr .= $key." ".$value." ";
			else
				$whereStr .= " AND ".$key." ".$value." ";
 
		}
		if(trim($whereStr) != '' ){
			$whereStr = " WHERE ".$whereStr;
		}
		else{
			$whereStr="";
		}

		$sql = "SELECT i.*,invoiceID  FROM ".$this->db->dbprefix."invoice_header as i LEFT JOIN ".$this->db->dbprefix."admin as cm ON invoiceID  = invoiceID".$whereStr."";
		//$sql = "SELECT commercialsID FROM ".$this->db->dbprefix."companyCommercials ".$whereStr."";
		$query = $this->db->query($sql);
		$rowcount = $query->num_rows();
		return $rowcount;
		
	}
	
	function getTaxInvoiceDetails($select = '',$where= array(),$limit='',$start='',$join='',$other=array())
	{
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if($whereStr == "")
				$whereStr .= $key." ".$value." ";
			else
				$whereStr .= " AND ".$key." ".$value." ";
 
		}
		if($start !='' && $limit!='')
		{
				$limitstr = "LIMIT ".$start.",".$limit;
		}
		else{
			$limitstr = "LIMIT 0,".$limit;
		}

		if(trim($whereStr) != '' ){
			$whereStr = " WHERE ".$whereStr;
		}
		else{
			$whereStr="";
		}
		if(isset($other['orderBy']) && !empty($other['orderBy']))
		{
			$orderBy = "ORDER BY ".$other['orderBy']." ".$other['order'];
		}else{
			$orderBy = "ORDER BY created_date DESC";
		}

		$sql = "SELECT i.*, cm.name as customerName  FROM ".$this->db->dbprefix."invoice_header as i LEFT JOIN ".$this->db->dbprefix."customer as cm ON i.customer_id  = cm.customer_id".$whereStr." ".$orderBy." ".$limitstr;
		//$sql = "SELECT * FROM ".$this->db->dbprefix."invoice_header ".$whereStr." ".$orderBy." ".$limitstr;
		
		$query = $this->db->query($sql);

		$result = $query->result();
		// print $this->db->last_query();
		return $result;
	}

	public function getTaxInvoiceDetailsSingle($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		
		$this->db->select($select);
		$this->db->from('invoice_header');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}
	public function getTaxInvoiceLineDetails($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		
		$this->db->select($select);
		$this->db->from('invoice_line');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}

	public function saveTaxInvoiceInfo($data,$where=array()){

		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update("invoice_header",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function createTaxInvoiceInfo($data){

		$res = $this->db->insert("invoice_header",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		// print $this->db->last_query();
		return $this->db->insert_id();
	}
	
	public function changeTaxInvoiceStatus($tableadminID,$statusCode,$ids,$primaryID){

		if(!isset($tableadminID) || empty($tableadminID)){
			return false;
		}
		if(!isset($ids) || empty($ids)){
			return false;
		}	

		if(!isset($primaryID) || empty($primaryID)){
			return false;
		}	

        $idlist = explode(",",$ids);
        $data = array("status"=>$statusCode);
        $modified_by = $this->input->post("SadminID");
        $data = array("status"=>$statusCode,"modified_date"=>date("Y/m/d H:i:s"),"modified_by"=>$modified_by);
        $this->db->where_in($primaryID,$idlist);
        $res = $this->db->update($tableadminID,$data);
		// print $this->db->last_query();
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
        return $res;
    }

    public function saveInvoiceLineInfo($data,$where){

    	if(!isset($where) || empty($where)){
    		return false;
    	}
		$this->db->where($where);
		$res = $this->db->update("invoice_line",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function createInvoiceLineInfo($data){

		$res = $this->db->insert("invoice_line",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		//print $this->db->last_query();
		return $this->db->insert_id();
	}

	public function deleteitems($where=array(),$whereIn=array()){
		if(!isset($where) || empty($where)){
			return false;
		}		
		if(isset($whereIn) && !empty($whereIn)){
			$this->db->where_in("srNo",$whereIn);
		}
		$this->db->where($where);
		$res = $this->db->delete("invoice_line");
			   
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function getLastInvoice(){

		$sql ="select * from ".$this->db->dbprefix."invoice_header where invoiceID IN ( select MAX(invoiceID) from ".$this->db->dbprefix."invoice_header)";
		$query = $this->db->query($sql);
		$result = $query->result();
		return $result;

	}

}

	