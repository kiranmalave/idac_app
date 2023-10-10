<?php
class ExcelExportModel extends CI_Model
{
 	public function fetch_data()
 	{
	   $this->db->order_by("traineeID","ASC");
	   $query = $this->db->get("traineeMaster");
	  return $query->result();
 	}
}