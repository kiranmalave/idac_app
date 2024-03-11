<?php

use Mpdf\Tag\Pre;
use PSpell\Config;

defined('BASEPATH') or exit('No direct script access allowed');

class CommonModel extends CI_Model
{

	function __construct()
	{
		parent::__construct();
		$this->load->database();
	}

	public function getLastInsertedID()
	{
		return $this->db->insert_id();
	}
	public function getCountByParameter($select = '', $table = '', $where = array(), $other = array(), $join = array())
	{
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if ($whereStr == "")
				$whereStr .= $key . " " . $value . " ";
			else
				$whereStr .= " AND " . $key . " " . $value . " ";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {
				$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
			}
		} else {
			$joinsql = "";
		}
		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}
		if (isset($other['whereIn']) && !empty($other['whereIn'])) {

			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}

		$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . $table . " as t " . $joinsql . $whereStr . "";

		//$sql = "SELECT ".$select." FROM ".$this->db->dbprefix."{$table} as t ".$joinsql.$whereStr." ".$orderBy." ".$limitstr;
		$query = $this->db->query($sql);
		$rowcount = $query->num_rows();
		return $rowcount;
	}
	public function GetMasterListDetails($select = '', $table = '', $where = array(), $limit = '', $start = '', $join = array(), $other = array())
	{
		if ($select == '') {
			$select = "*";
		}
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if ($whereStr == "")
				$whereStr .= $key . " " . $value . " ";
			else
				$whereStr .= " AND " . $key . " " . $value . " ";
		}
		// change for all record. For linking to other form need all records. so skip pagination.
		if ($start != '' && $limit != '') {
			$limitstr = "LIMIT " . $start . "," . $limit;
		} else {
			if (isset($limit) && !empty($limit)) {
				$limitstr = "LIMIT 0," . $limit;
			} else {
				$limitstr = "";
			}
		}

		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}

		if (isset($other['whereIn']) && !empty($other['whereIn'])) {

			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}

		if (isset($other['orderBy']) && !empty($other['orderBy'])) {
			$orderBy = "ORDER BY " . $other['orderBy'] . " " . $other['order'];
		} else {
			$orderBy = "";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {

				if (isset($value['key1Alias']) && !empty($value['key1Alias'])) {

					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON " . $value['key1Alias'] . "." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				} else {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				}
			}
		} else {
			$joinsql = "";
		}

		$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . "{$table} as t " . $joinsql . $whereStr . " " . $orderBy . " " . $limitstr;
		//print($sql);exit;

		$query = $this->db->query($sql);


		if (isset($other["resultType"]) && !empty($other["resultType"])) {
			$result = $query->result_array();
		} else {
			$result = $query->result();
		}
		// print $this->db->last_query();
		return $result;
	}
	public function saveContactDetails($data = '')
	{

		$res = $this->db->insert("contactus", $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	public function isSubscribed($email = '')
	{
		$this->db->select("*");
		$this->db->from("subscribe");
		$this->db->where('email', $email);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$result = $query->result();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $result;
	}

	public function countFiltered($table = '')
	{
		$this->db->select("*");
		$this->db->from($table);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$result = $query->num_rows();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $result;
	}

	public function getUniqueCode($length = 6)
	{
		$token = "";
		$codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		$codeAlphabet .= "abcdefghijklmnopqrstuvwxyz";
		$codeAlphabet .= "0123456789";
		$max = strlen($codeAlphabet); // edited

		for ($i = 0; $i < $length; $i++) {
			$randomNumber = rand(0, $max - 1);
			$token .= substr($codeAlphabet, $randomNumber, 1);
		}
		return $token;
	}
	public function getMasterDetails($master = '', $select = "*", $where = array())
	{

		if (!isset($select) || empty($select)) {
			$select = "*";
		}
		if (!isset($master) || empty($master)) {
			return false;
		}

		$this->db->select($select);
		$this->db->from($master);
		if (isset($where) && !empty($where)) {
			$this->db->where($where);
		}

		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		//print $this->db->last_query();
		return $result;
	}
	public function getMobileDetails($where = '')
	{
		$this->db->select('*');
		$this->db->from('traineeMaster');
		if (isset($where) && !empty($where)) {
			$this->db->where('mobile', $where);
		}
		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		return $result;
	}
	public function getAadhaarDetails($where = '')
	{
		$this->db->select('*');
		$this->db->from('traineeMaster');
		if (isset($where) && !empty($where)) {
			$this->db->where('aadhaarNo', $where);
		}
		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		return $result;
	}

	public function saveMasterDetails($tableName = '', $data = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}

		if (!isset($data) || empty($data)) {
			return false;
		}
		$res = $this->db->insert($tableName, $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function updateMasterDetails($tableName = '', $data = '', $where = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($data) || empty($data)) {
			return false;
		}
		if (!isset($where) || empty($where)) {
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update($tableName, $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function deleteMasterDetails($tableName = '', $where = '', $whereIn = array())
	{
		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($where) || empty($where)) {
			return false;
		}
		$this->db->where($where);
		if (isset($whereIn) && !empty($whereIn)) {

			foreach ($whereIn as $key => $value) {
				$idlist = explode(",", $value);
				$this->db->where_in($key, $idlist);
			}
		}
		$res = $this->db->delete($tableName);
		//print $this->db->last_query();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function changeMasterStatus($tableName = '', $statusCode = '', $ids = '', $primaryID = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($ids) || empty($ids)) {
			return false;
		}

		if (!isset($primaryID) || empty($primaryID)) {
			return false;
		}

		$idlist = explode(",", $ids);
		$modifyBy = $this->input->post("SadminID");
		$data = array("status" => $statusCode, "modified_date" => date("Y/m/d H:i:s"), "modified_by" => $modifyBy);
		$this->db->where_in($primaryID, $idlist);
		$res = $this->db->update($tableName, $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	public function getMonthByID($id = '')
	{
		$months = array("1" => "january", "2" => "february", "3" => "march", "4" => "april", "5" => "may", "6" => "june", "7" => "july", "8" => "august", "9" => "september", "10" => "october", "11" => "november", "12" => "december");
		return $months[$id];
	}
	public function num2words($num = '', $currency = '')
	{

		$ZERO = "zero";
		$MINUS = "minus";
		/* zero is shown as "" since it is never used in combined forms */ 		 /* 0 .. 19 */
		$lowName = array("", "One", "Two", "Three", "Four", "Five", 		 "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", 		 "Sixteen", "Seventeen", "Eighteen", "Nineteen");
		$tys = array("", "", "Twenty", "Thirty", "Forty", "Fifty", 		 "Sixty", "Seventy", "Eighty", "Ninety");
		/* 0, 10, 20, 30 ... 90 */

		switch ($currency) {

			case 'INR': 	//$groupName = array( "", "Hundred", "Thousand", "Lakh", "Crore","Arab", "Kharab"); 
				$groupName = array("", "Hundred", "Thousand", "Lakh", "Crore", "Hundred", "Thousand", "Lakh", "");

				// How many of this group is needed to form one of the succeeding group. 					
				// Indian: unit, hundred, thousand, lakh, crore 				

				//	$divisor = array( 100, 10, 100, 100,100000,100000000000) ;

				$divisor = array(100, 10, 100, 100, 100, 10, 100, 100, 10);
				break;
			case 'USD': 	//$groupName = array( "", "Hundred", "Thousand", "Lakh", "Crore","Arab", "Kharab"); 
				$groupName = array("", "Hundred", "Thousand", "Million", "Billion", "Trillion", "");

				// How many of this group is needed to form one of the succeeding group. 					
				// Indian: unit, hundred, thousand, lakh, crore 				

				//	$divisor = array( 100, 10, 100, 100,100000,100000000000) ;

				$divisor = array(100, 10, 1000, 100000, 1000000000);
				break;

			case 'Paise':
				$groupName = array();
				$divisor = array(100);
				break;
		}
		$num = str_replace(",", "", $num);
		$num = number_format($num, 2, '.', '');
		$cents = substr($num, strlen($num) - 2, strlen($num) - 1);
		$num = (int)$num;

		$s = "";

		if ($num == 0) $s = $ZERO;
		$negative = ($num < 0);
		if ($negative) $num = -$num;

		// Work least significant digit to most, right to left.
		// until high order part is all 0s.
		for ($i = 0; $num > 0; $i++) {
			$remdr = (int)($num % $divisor[$i]);
			$num = $num / $divisor[$i];
			if ($remdr == 0)
				continue;

			$t = "";
			if ($remdr < 20)
				$t = $lowName[$remdr];
			else if ($remdr < 100) {
				$units = (int)$remdr % 10;
				$tens = (int)$remdr / 10;
				$t = $tys[$tens];

				if ($units != 0)
					$t .= " " . $lowName[$units];
			} else

				$t = $inWords[$remdr];
			//echo $t; exit;

			$s = $t . " " . $groupName[$i] . " "  . $s;
			$num = (int)$num;
		}

		$s = trim($s);
		if ($negative)
			$s = $MINUS . " " . $s;


		if (($cents != '00') && ($s == 'zero')) {
			$s = $cents . " Paise only";
			return $s;
		}


		switch ($currency) {

			case 'INR':
				$s .= " Rupees";
				if ($cents != '00')
					$s .= " and " . $this->num2words($cents, 'Paise');

				$s .= " Only";
				break;
			case 'USD':
				$s .= " Dollar";
				if ($cents != '00')
					$s .= " and " . $this->num2words($cents, 'Cents');

				$s .= " Only";
				break;
			case 'Paise':
				$s .= " Paise";
		}
		return $s;
	}
	public function saveFile($table = '', $fileColumn = '', $filename = '', $forignValue = '', $fileTypeColumn = '', $fileType = '', $forignKey = '', $extraData = array(), $opFile = '')
	{
		$adminID = $this->input->post("SadminID");
		$data = array();
		$data["created_by"] = $adminID;

		if (!empty($fileTypeColumn))
			$data["" . $fileTypeColumn] = $fileType;

		if (!empty($forignKey))
			$data["" . $forignKey] = $forignValue;

		if (!empty($fileColumn))
			$data["" . $fileColumn] = $filename;

		if (isset($extraData) && !empty($extraData)) {
			foreach ($extraData as $key => $value) {
				$data[$key] = $value;
			}
		}
		//below call by Sanjay
		if (!extension_loaded('imagick')) {
			$this->createThumbnail($opFile);
		}

		$res = $this->db->insert($table, $data);
		$sqlerror = $this->db->error();
		//print $this->db->last_query();exit;
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	// //Function added by Sanjay
	// public function createThumbnail($imgUrl)
	// {
	// 	$arrayimg = array('jpg', 'jpeg', 'png', 'gif');
	// 	$arrayVideo = array('mp4', 'mov', 'avi', '3gp');
	// 	$arraytxt = array('docx', 'doc', 'ppt', 'txt', 'pdf');

	// 	//resize original image 
	// 	// $img = new Image($file);
	// 	// $size = $img->getSize();
	// 	// Image::resize() takes care to maintain the proper aspect ratio, so this is easy
	// 	// (default quality is 100% for JPEG so we get the cleanest resized images here)
	// 	// $img->resize($this->options['maxImageDimension']['width'], $this->options['maxImageDimension']['height'])->save();
	// 	// unset($img);

	// 	// source image has changed: nuke the cached metadata and then refetch the metadata = forced refetch
	// 	//$meta = $this->getFileInfo($file, $legal_url, true); 

	// 	// Original image file path
	// 	$originalImagePath = "";
	// 	$originalImagePatht = $imgUrl; //'path/to/original/image.jpg';
	// 	$t = explode('/', $originalImagePatht);

	// 	if ($t[0] == 2)
	// 		$originalImagePath = $this->config->item("coursemediaPATH") . $t[1];
	// 	else
	// 		$originalImagePath = $imgUrl;
	// 	// echo $originalImagePath;
	// 	// exit;
	// 	$tnsize1 = 150;
	// 	$image = new Imagick($originalImagePath);
	// 	$imagick_type_format = $image->getFormat();
	// 	//echo $type=$image->getImageMimeType();
	// 	if ($image->getImageHeight() <= $image->getImageWidth()) {
	// 		// Resize image using the lanczos resampling algorithm based on width
	// 		$image->resizeImage($tnsize1, 0, Imagick::FILTER_LANCZOS, 1);
	// 	} else {
	// 		// Resize image using the lanczos resampling algorithm based on height
	// 		$image->resizeImage(0, $tnsize1, Imagick::FILTER_LANCZOS, 1);
	// 	}
	// 	// Set to use jpeg compression
	// 	$image->setImageCompression(Imagick::COMPRESSION_JPEG);
	// 	// Set compression level (1 lowest quality, 100 highest quality)
	// 	$image->setImageCompressionQuality(75);
	// 	// Strip out unneeded meta data
	// 	$image->stripImage();
	// 	$imagefilename = pathinfo($image->getImageFilename());
	// 	//print_r($imagefilename); exit;
	// 	// echo "DEBUUUG Filename" . $imagefilename['filename'] ."";
	// 	// echo "DEBUUUG Basename " . $imagefilename['basename'] ."";
	// 	// echo "DEBUUUG Extension " . $imagefilename['extension'] ."";
	// 	if (in_array($imagefilename['extension'], $arrayimg)) {
	// 		$image->writeImage($imagefilename['dirname'] . "/" . $imagefilename['filename'] . "_tn." . $imagefilename['extension']);
	// 		$image->destroy();
	// 	}
	// 	if (in_array($imagefilename['extension'], $arrayVideo)) {
	// 		// Imagemagicks Convert can do video tumbnails.
	// 		//echo $exec = "convert -quiet ".$image->getImageFilename()."[10] ".$imagefilename['filename']."_tn.gif";
	// 		$exec = 'ffmpeg -ss 1.0 -t 2.5 -i ' . $image->getImageFilename() . ' -filter_complex "[0:v] fps=12,scale=w=320:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1" ' . $imagefilename['dirname'] . "/" . $imagefilename['filename'] . '_tn.gif';
	// 		echo exec($exec);
	// 		// convert -quiet moviefile.mov[10] movieframe.gif
	// 	}
	// 	//ffmpeg -i 1692702012.7795.mp4 -ss 00:00:00.000 -pix_fmt rgb24 -r 10 -s 320x240 -t 00:00:10.000 output.gif
	// 	//perfect ffmpeg -ss 1.0 -t 2.5 -i 1692702012.7795.mp4 -filter_complex "[0:v] fps=12,scale=w=320:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1" StickAroundPerFrame.gif
	// 	//convert -quiet C:\xampp\htdocs\LMS\website\uploads\1692702012.7795.mp4[10] 1692702012.7795_tn.gif
	// }
	public function createThumbnail($imgUrl)
	{
		// $arrayimg = array('jpg', 'jpeg', 'png', 'gif');
		// $arrayVideo = array('mp4', 'mov', 'avi', '3gp');
		// $arraytxt = array('docx', 'doc', 'ppt', 'txt', 'pdf');
		$this->compress_image($imgUrl, $imgUrl, 90);
		//resize original image 
		// $img = new Image($file);
		// $size = $img->getSize();
		// Image::resize() takes care to maintain the proper aspect ratio, so this is easy
		// (default quality is 100% for JPEG so we get the cleanest resized images here)
		// $img->resize($this->options['maxImageDimension']['width'], $this->options['maxImageDimension']['height'])->save();
		// unset($img);

		//ffmpeg -i 1692702012.7795.mp4 -ss 00:00:00.000 -pix_fmt rgb24 -r 10 -s 320x240 -t 00:00:10.000 output.gif
		//perfect ffmpeg -ss 1.0 -t 2.5 -i 1692702012.7795.mp4 -filter_complex "[0:v] fps=12,scale=w=320:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1" StickAroundPerFrame.gif
		//convert -quiet C:\xampp\htdocs\LMS\website\uploads\1692702012.7795.mp4[10] 1692702012.7795_tn.gif
	}

	function compress_image($src, $dest , $quality) 
	{
		$info = getimagesize($src);
	
		if ($info['mime'] == 'image/jpeg') 
		{
			$image = imagecreatefromjpeg($src);
		}
		elseif ($info['mime'] == 'image/gif') 
		{
			$image = imagecreatefromgif($src);
		}
		elseif ($info['mime'] == 'image/png') 
		{
			$image = imagecreatefrompng($src);
		}
		else
		{
			die('Unknown image file format');
		}
	
		//compress and save file to jpg
		imagejpeg($image, $dest, $quality);
	
		//return destination file
		return $dest;
	}

	public function getMonth($key = '', $type = 'string')
	{

		if ($type == "string" && is_string($key)) {
			$d = date_parse($key);
			return $d['month'];
		}
		if ($type == "number" && is_numeric($key)) {
			$dateObj   = DateTime::createFromFormat('!m', $key);
			return $dateObj->format('F');
		}
		return false;
	}

	public function unlinkFile($filePath = '')
	{
		// echo  $filePath;exit;
		if (file_exists($filePath)) {
			// echo $filePath;exit;
			return unlink($filePath);
		} else {
			return false;
		}
	}

	public function getDynamicFieldHtml($menuId = '')
	{
		$dynamicFieldHtml = "";
		$wherec["menuID="] = $menuId;
		$other = array("orderBy" => "fieldIndex");
		$dynamicFields = $this->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, '', '', '', $other);

		if (!empty($dynamicFields)) {
			return $dynamicFields;
			/*foreach($dynamicFields as $dynamicField){
				print_r($dynamicField->fieldType);
			}*/
		}
		return '';
	}
	public function updateAllRows($tableName, $data)
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($data) || empty($data)) {
			return false;
		}

		$res = $this->db->update($tableName, $data);
		//print $this->db->last_query();exit;
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	public function getdata($sql,$other){
		$query = $this->db->query($sql);
		if (isset($other["resultType"]) && !empty($other["resultType"])) {
			$result = $query->result_array();
		} else {
			$result = $query->result();
		}
		return $result;
	}
}
