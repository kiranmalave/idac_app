<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class DashboardModel extends CI_Model{
	
	function __construct()
	{
		parent::__construct();
		$this->load->database();
	}
    public function getAllPOCArchivedTarget($where='')
    {
        $this->db->select_sum('amountInFigure');
        $this->db->select('a.name,u.myTarget');
        $this->db->from('donorRecipts as t');
        
        $this->db->where($where);
        $this->db->join('user_extra_details as u', 'u.adminID = t.pointOfContactName','LEFT');
        $this->db->join('admin as a', 'a.adminID = t.pointOfContactName','LEFT');
        $this->db->group_by("t.pointOfContactName");
        $query = $this->db->get();
        $sqlerror = $this->db->error();
		$result = $query->result();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
        // print_r($result);exit;
		return $result;
        // SELECT player, SUM(score) as sum_score FROM game GROUP BY player;
    }
    public function getAllPOCArchivedTargetOther($where='')
    {
        $this->db->select_sum('amountInFigure');
        $this->db->select('pointOfContactName');
        $this->db->from('donorRecipts');
        
        $this->db->where($where);
        $this->db->group_by("pointOfContactName");
        $query = $this->db->get();
        $sqlerror = $this->db->error();
		$result = $query->result();
		$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
        // print_r($result);exit;
		return $result;
        // SELECT player, SUM(score) as sum_score FROM game GROUP BY player;
    }
}