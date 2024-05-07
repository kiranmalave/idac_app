<style type="text/css">
	body { 
	    font-family: serif; 
	    font-size: 6pt; 
	}
	table tr td {margin:0px;}
	.half{
		width: 50%;
	}
    .full{
        width: 100%;
    }
	.border-top{
		border-top-style:solid;border-top-width:1px;
	}
	.border-right{
		border-right-style:solid;border-right-width:1px;
	}
	.border-bottom{
		border-bottom-style:solid;border-bottom-width:1px;
	}
	.border-left{
		border-left-style:solid;border-left-width:1px;
	}
	.borderAll td,.borderAll th{
		border-style:solid;border-width:1px;
	}
	.borderBottom td,.borderBottom th{
		border-bottom-style:solid;border-bottom-width:1px;
		padding:4px;
	}
	.srNo{
		width: 10%;
		text-align:center;
		
	}
	.desc{
			width: 40%;
  	}
  	.qut{
			width: 20%;
  	}
  	.unit{
			width: 10%;
  	}
  	.rate{
			width: 15%;
  	}
  	.amt{
			width: 15%;
  	}
  	.text-center{
  		text-align: center;
  	}
	.text-left{
  		text-align: left;
  	}
  	.text-right{
  		text-align: right;
  	}
  	.items tr {

  	}
</style>
<div style="">
	<div style="float: left; width:50%;">
		<h1 align="left"><strong>Proposal</strong></h1>
	</div>
</div>
<br>
<div>
    <div>
        <h2>Proposal No: <?php echo $proposalData[0]->proposal_number; ?></h2>
	</div>
    <div>
        <h2>Client: <?php echo ($proposalData[0]->company_name); ?></h2>
	</div>
    <div>
        <h2>Project: <?php echo ($proposalData[0]->project_name); ?></h2>
	</div>
</div>
<div>
     <div><?php echo ($proposalData[0]->description); ?></div>
	 <?php if($proposalData[0]->roleID == 1){?>
		<div><?php echo ($proposalData[0]->cost); ?></div>
	<?php }?>
</div>
<div><?php echo ($proposalData[0]->date); ?></div>