<?php
	$q=$_POST["json"];
	$p=$_POST["path"];
	$myfile = fopen($p, "w") or die("Unable to open file!");
	fwrite($myfile, $q);
	fclose($myfile);
?>