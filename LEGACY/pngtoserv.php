<?php
	$data = $_POST['base64data'];
	$lettre = $_POST['lettre'];

	$type = 'base64data';

	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data = base64_decode($data);

	$timestamp = date("YmdGis");

	$file = $lettre.$timestamp.'.png';

	$dir = __DIR__ . "/exports/";

	$file = $dir . $file;

	// Write the contents back to the file
	file_put_contents($file, $data);
?>