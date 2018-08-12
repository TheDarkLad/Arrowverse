<?php
	$q=$_POST["json"];
	$myfile = fopen("arrowverse.json", "w") or die("Unable to open file!");
	fwrite($myfile, $q);
	fclose($myfile);
?>