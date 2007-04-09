<?php

$apikey = "ddba2415a69be40c65f15fffc5cbbfab";
$secret = "6a223007822ca801";

$fotoid = $_REQUEST['id'];

if (!$fotoid) exit;

$result = unserialize(file_get_contents("http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=$apikey&photo_id=$fotoid&format=php_serial"));

if (!is_array($result['photo'])) exit;

$p = $result['photo'];

die("http://static.flickr.com/{$p['server']}/{$p['id']}_{$p['secret']}_m.jpg");

?>
