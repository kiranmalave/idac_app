<?php
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Filters
{
	var $module = "";
    var $module_data = "";
    var $menuID="";
    var $dyanamicForm_Fields="";
    var $menuDetails="";
	var $linkedFields=null;
	public function __construct()
	{
		//parent::__construct();
		$this->CI = &get_instance();

	}

    public function prepareFilterData($appFilterData){
		//print_r($appFilterData);
		$patterns = ['-startDate', '-endDate', '-startNo', '-endNo', '-startRange', '-endRange', '-startTime', '-endTime'];
		$defaultStanderdFeild = array("created_date-startDate","created_date-endDate","modified_date-startDate","modified_date-endDate");
		$defaultStanderdNo= array("id-startNo","id-endNo");
        $whereData = $wherec = $other = $join = array();
		$stdCol ="";
        if(isset($appFilterData['orderBy']) && !empty($appFilterData['orderBy'])){
			$orderBy = $appFilterData['orderBy'];
		}else{
			$orderBy ="";
		}
		if(isset($appFilterData['order']) && !empty($appFilterData['order'])){
			$order = $appFilterData['order'];
		}else{
			$order ="";
		}
		
		if(isset($appFilterData['textSearch']) && !empty($appFilterData['textSearch'])){
			$textSearch = $appFilterData['textSearch'];
		}else{
			$textSearch ="";
		}

		if(isset($appFilterData['textval']) && !empty($appFilterData['textval'])){
			$textval = $appFilterData['textval'];
		}else{
			$textval ="";
		}

        // $textSearch = $appFilterData['textSearch'];
        // $textval = $appFilterData['textval'];
		$subSql =array();
        if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "";//"created_date";
			$order = "";//"DESC";
		}
        unset($appFilterData['menuId']);
		unset($appFilterData['curpage']);
		unset($appFilterData['SadminID']);
		unset($appFilterData['accessFrom']);
		unset($appFilterData['orderBy']);
        unset($appFilterData['order']);
        //unset($appFilterData['textSearch']);
        unset($appFilterData['textval']);

		// get all columns metadata
		//$whereField['menuID'] = "= ".$menuID;
		//$metaDetails = $this->CI->CommonModel->GetMasterListDetails("*","dynamic_fields", $whereField, '', '', array(),array());
        //$metaDetails = $this->dyanamicForm_Fields;
        $sql = "SHOW COLUMNS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name;
		$metaDetails = $this->CI->CommonModel->getdata($sql,array());
        //print_r($this->dyanamicForm_Fields);
		$other = array("orderBy" => $orderBy, "order" => $order);
		foreach($appFilterData as $key => $value) {
			$recordKey=null;
         
			// check data type for field
			//$dataType = "default";
			$dataType = $key;
			if( in_array($key,$defaultStanderdFeild)){
				$dataType ="Datepicker";
				$stdCol="t.";
			}
			if( in_array($key,$defaultStanderdNo)){
				$dataType ="Numeric";
				$stdCol="t.";
			}
			
			if(isset($this->dyanamicForm_Fields) && !empty($this->dyanamicForm_Fields)){
				foreach ($this->dyanamicForm_Fields as $key1 => $value1) {
					$NewKey = $key;
					foreach ($patterns as $pattern) {
						$NewKey = str_replace($pattern, '', $NewKey);
					}
					//print "New Key ".$NewKey."  -> ".$value1->column_name." <br>";
					if($NewKey == $value1->column_name){
						
						$dataType = $value1->fieldType;
						$recordKey = $key1;
						if($value1->linkedWith == "" || $value1->linkedWith == null){
							$stdCol = "t.";
						}else{
							$stdCol = "";
						}
						
						break;
					}
					else{
						//$dataType = $key;
						$stdCol="t.";
					}
				}
			}else{
				$stdCol="t.";
			}
			// else{
			// 	$dataType = $key;
			// }
			// print($stdCol);
			//print $dataType."--> ".$NewKey;
            switch ($dataType) {
				
				case 'textSearch':{
					// print("textSearch");
					if (isset($value) && !empty($textSearch) && isset($textval) && !empty($textval)) {
						$wherec["$stdCol$textSearch like  "] = "'%" . $textval . "%'";
					}
					break;
				}
				case 'Dropdown':{
					//print_r($this->dyanamicForm_Fields[$recordKey]);
					// print("Dropdown");
				 	// check if is multiselect
					// if($metaDetails[$recordKey]->allowMultiSelect == "yes"){
						if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
							$checkMul = explode(",",$appFilterData[$key]);
							if($this->dyanamicForm_Fields[$recordKey]->allowMultiSelect == "yes"){
								$other['find_in_set'][] = str_replace(" ","",$checkMul);
								$other['find_in_set_key'][] = $stdCol.$key;
								$other['find_in_set_type'][] = "OR";
							}else{
								$task_statusString = str_replace(",", "','", $appFilterData[$key]);
								$wherec[$stdCol.$key] = " IN('" . $task_statusString. "')";
                                //$wherec[$stdCol.$key] = "='" . $appFilterData[$key]. "'";
							}
						}
					// }else{
					// 	if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
					// 		$checkMul = explode(",",$appFilterData[$key]);
					// 		if(count($checkMul)>1){
					// 			$task_statusString = str_replace(",", "','", $appFilterData[$key]);
					// 			$wherec[$key] = " IN('" . $task_statusString. "')";
					// 		}else{
					// 			$wherec[$key] = "='" . $appFilterData[$key]. "'";
					// 		}
					// 	}
					// }
					break;
				}
				case 'Checkbox':{
					
					// print("Checkbox");
					// check if is multiselect
				   //if($metaDetails[$recordKey]->allowMultiSelect == "yes"){

					if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
						$checkMul = explode(",",$appFilterData[$key]);
						if($this->dyanamicForm_Fields[$recordKey]->allowMultiSelect == "yes"){
							$other['find_in_set'][] = str_replace(" ","",$checkMul);
							$other['find_in_set_key'][] = $stdCol.$key;
							$other['find_in_set_type'][] = "OR";
						}else{
							$task_statusString = str_replace(",", "','", $appFilterData[$key]);
							$wherec[$stdCol.$key] = " IN('" . $task_statusString. "')";
							// $wherec[$stdCol.$key] = "='" . $appFilterData[$key]. "'";
						}
					}

				//    }else{
				// 	   if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
				// 		   $checkMul = explode(",",$appFilterData[$key]);
				// 		   if(count($checkMul)>1){
				// 			   $task_statusString = str_replace(",", "','", $appFilterData[$key]);
				// 			   $wherec[$key] = " IN('" . $task_statusString. "')";
				// 		   }else{
				// 			   $wherec[$key] = "='" . $appFilterData[$key]. "'";
				// 		   }
				// 	   }
				//    }
				   break;
			   	}
				case 'Datepicker':{
					// check if is multiselect
					// print("Datepicker");
					//$col = $metaDetails[$recordKey]->column_name;
					$col = $NewKey;
					
					if(isset($appFilterData[$col."-startDate"]) && !empty($appFilterData[$col."-startDate"])){
						$sDate = date("Y-m-d",strtotime($appFilterData[$col."-startDate"]));
					}
					if(isset($appFilterData[$col."-endDate"]) && !empty($appFilterData[$col."-endDate"])){
						$eDate = date("Y-m-d",strtotime($appFilterData[$col."-endDate"]));
					}
					if ((isset($sDate) && !empty($sDate)) && (isset($eDate) && !empty($eDate))){
						$wherec[$stdCol.$col] = " BETWEEN '" . $sDate. "' AND '".$eDate."'";
					}else if(isset($sDate) && !empty($sDate)){
						$wherec[$stdCol.$col] = " >='" . $sDate."'";
					}else if(isset($eDate) && !empty($eDate)){
						$wherec[$stdCol.$col] = " <='" . $eDate."'";
					}
					
				   break;
			   	}
				case 'Timepicker':{
					// print("Timepicker");
					//$col = $metaDetails[$recordKey]->column_name;
					$col = $NewKey;
					if(isset($appFilterData[$col."-startTime"]) && !empty($appFilterData[$col."-startTime"])){
						$sDate = $appFilterData[$col."-startTime"];
					}
					if(isset($appFilterData[$col."-endTime"]) && !empty($appFilterData[$col."-endTime"])){
						$eDate = $appFilterData[$col."-endTime"];
					}
					if ((isset($sDate) && !empty($sDate)) && (isset($eDate) && !empty($eDate))){
						$wherec[$stdCol.$col] = " BETWEEN STR_TO_DATE('" . $sDate. "','%l:%i %p') AND STR_TO_DATE('".$eDate."','%l:%i %p')";
					}else if(isset($sDate) && !empty($sDate)){
						$wherec[$stdCol.$col] = " >='" . $sDate."'";
					}else if(isset($eDate) && !empty($eDate)){
						$wherec[$stdCol.$col] = " <='" . $eDate."'";
					}
				   break;
			   	}

				case 'Numeric':{
					//print("Numeric");
					// $col = $metaDetails[$recordKey]->column_name;
					$col = $NewKey;
					if ((isset($appFilterData[$col."-startNo"]) && !empty($appFilterData[$col."-startNo"])) && (isset($appFilterData[$col."-endNo"]) && !empty($appFilterData[$col."-endNo"]))){
						$wherec[$stdCol.$col] = " BETWEEN '" . $appFilterData[$col."-startNo"]. "' AND '".$appFilterData[$col."-endNo"]."'";
					}else if(isset($appFilterData[$col."-startNo"]) && !empty($appFilterData[$col."-startNo"])){
						$wherec[$stdCol.$col] = " >='" . $appFilterData[$col."-startNo"]."'";
					}else if(isset($appFilterData[$col."-endNo"]) && !empty($appFilterData[$col."-endNo"])){
						$wherec[$stdCol.$col] = " <='" . $appFilterData[$col."-endNo"]."'";
					}
					break;
			   	}

				case 'Range':{
					// print("Range");
					// $col = $metaDetails[$recordKey]->column_name;
					$col = $NewKey;
                    if ((isset($appFilterData[$col."-startRange"]) && !empty($appFilterData[$col."-startRange"])) && (isset($appFilterData[$col."-endRange"]) && !empty($appFilterData[$col."-endRange"]))){
						$wherec[$stdCol.$col] = " BETWEEN " . $appFilterData[$col."-startRange"]. " AND ".$appFilterData[$col."-endRange"]."";
					}else if(isset($appFilterData[$col."-startRange"]) && !empty($appFilterData[$col."-startRange"])){
                        $wherec[$stdCol.$col] = " >=" . $appFilterData[$col."-startRange"]."";
					}else if(isset($appFilterData[$col."-endRange"]) && !empty($appFilterData[$col."-endRange"])){
						$wherec[$stdCol.$col] = " <=" . $appFilterData[$col."-endRange"]."";
					}
					break;
			   	}
				default:
				{
					// print("default");
					if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
						$checkMul = explode(",",$appFilterData[$key]);
						if(count($checkMul)>1){
							$task_statusString = str_replace(",", "','", $appFilterData[$key]);
							$wherec["t.".$key] = " IN('" . $task_statusString. "')";
						}else{
							$wherec["t.".$key] = "='" . $appFilterData[$key]. "'";
						}
					}
				}
				break;
			}
			
		}
      
		// print_r($wherec);exit;
        $whereR = $otherR = $joinR = array();
		$extraData= array();
		$selectC = "";
		if(isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)){
			$cData = json_decode($this->menuDetails->c_metadata);
			$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name." WHERE Key_name = 'PRIMARY'";
			$primaryData = $this->CI->CommonModel->getdata($sql,array());
			$ccData = array_column($cData,'column_name');
			$fieldIdDetails = array_filter(array_column($cData,'fieldID'),'strlen') ;
			if(isset($ccData) && !empty($ccData)){
				foreach ($ccData as $key => $value) {
					if($value !=""){
						$ccData[$key] = "t.".$value;
					}
				}
			}
			// check islinekd with
			$joinR[0]['type'] ="LEFT JOIN";
			$joinR[0]['table']="menu_master";
			$joinR[0]['alias'] ="mm";
			$joinR[0]['key1'] ="linkedWith";
			$joinR[0]['key2'] ="menuID";
			if(isset($fieldIdDetails) && !empty($fieldIdDetails)){
				$otherR['whereIn'] ="fieldID";
				$otherR['whereData'] = implode(",",$fieldIdDetails);
			}
			$whereR['t.menuID'] = "= ".$this->menuID;
			$whereR['linkedWith'] = "!= ''";
			// get dynamic columns check if it is diaplay in column list or not and then only fetch the data
			$dyCol = array_column($cData,'column_name');
			$this->linkedFields = $this->CI->CommonModel->GetMasterListDetails("t.allowMultiSelect,t.fieldOptions,t.column_name,t.fieldID,t.linkedWith,mm.menuID,mm.table_name","dynamic_fields", $whereR, '', '', $joinR, $otherR);
			foreach ($this->linkedFields as $key => $value) {

				if(!in_array($value->column_name,$dyCol)){
					break;
				}
				$chkcol = "t.".$value->column_name;
				if(in_array($chkcol,$ccData)){
					$ek = array_keys($ccData,"t.".$value->column_name);
					if(!empty($ek)){
						unset($ccData[$ek[0]]);
					}
				}
				$primaryData2 =array();
				if($value->allowMultiSelect == "yes"){
					
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
					$subSql = "( SELECT GROUP_CONCAT(".$value->fieldOptions.") FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE FIND_IN_SET(".$primaryData2[0]->Column_name.",t.".$value->column_name."))";
					$extraData[] = $subSql." AS ".$value->linkedWith."_".trim($value->column_name);
				
				}else{
					
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
				
					$last = count($join);
					$join[$last]['type'] ="LEFT JOIN";
					$join[$last]['table']=$value->table_name;
					$join[$last]['alias'] =uniqid("W")."_".substr($value->table_name,0,2);//"ws_".substr($value->table_name,0,2);
					$join[$last]['key1'] = $value->column_name;
					$join[$last]['key2'] =$primaryData2[0]->Column_name;
					$extraData[] = $join[$last]['alias'].".".$value->fieldOptions." AS ".$value->linkedWith."_".trim($value->column_name);//."_".$value->fieldOptions;//$value->fieldOptions;
				}
			}
			
			// if(isset($primaryData2) && !empty($primaryData2)){
			// 	if(!in_array($primaryData2[0]->Column_name,$ccData)){
					
			// 		$ccData[] =$join[$last]['alias'].".".$primaryData2[0]->Column_name;
			// 	}
			// }
			if(isset($primaryData) && !empty($primaryData)){
				if(!in_array($primaryData[0]->Column_name,$ccData)){
					$ccData[]= "t.".$primaryData[0]->Column_name;
				}
			}
			$selectC =implode(",",array_merge($ccData,$extraData));
		}
		
        if($selectC !=""){
            $whereData["select"] = $selectC;
        }else{
            $whereData["select"] = "";
        }
		// print_r($other);exit;
        $whereData["join"] =$join;
        $whereData["wherec"] = $wherec;
		$whereData["other"] = $other;
		// print_r($whereData);
 
        return $whereData;
    }
	public function getMenuData()
	{
		if (!isset($this->menuID) && !isset($this->menuID)) {
			$status['msg'] = $this->CI->systemmsg->getErrorCode(227);
			$status['statusCode'] = 280;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "menu_master";
		$join[0]['alias'] = "m";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";

		$dynamicFieldHtml = "";
		$wherec["m.menuID="] = "'" . $this->menuID . "'";
	
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CI->CommonModel->GetMasterListDetails($selectC = 't.*,m.menuLink', 'dynamic_fields', $wherec, '', '', $join, $other);
		$wheredata["menuID"] = $this->menuID;
		$dynamicFieldsMeta = $this->CI->CommonModel->getMasterDetails("menu_master","*",$wheredata);
		$this->dyanamicForm_Fields  =  $dynamicFields;
		if(isset($dynamicFieldsMeta) && !empty($dynamicFieldsMeta)){
			$this->menuDetails= $dynamicFieldsMeta[0];
		}else{
			$this->menuDetails=  array();
		}
	}
}
