<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	if(!function_exists('dateFormat')){

		function dateFormat($date,$format='Y-m-d')
		{
			if($date != "0000-00-00 00:00:00" && $date != "0000-00-00" && $date != null && $date != "") {
	      		return date("{$format}",strtotime($date));
	        }else
	        {
	            return null;
	        }
		}
	}

?>