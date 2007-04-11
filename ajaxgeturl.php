<?php

function flickrRequest($method,$params)
{
	static $apikey = "ddba2415a69be40c65f15fffc5cbbfab";
	static $secret = "6a223007822ca801";

	$req = "http://api.flickr.com/services/rest/?format=php_serial&api_key=$apikey&method=" . urlencode($method);

	if (is_array($params)) foreach ($params as $k => $v)
		$req .= "&" . urlencode($k) . "=" . urlencode($v);

	return @unserialize(file_get_contents($req));
}

function flickrURL($p,$size='m')
{
	return "http://farm{$p['farm']}.static.flickr.com/{$p['server']}/{$p['id']}_{$p['secret']}_{$size}.jpg";
}

$id = $_REQUEST['id'];
$max = (int)$_REQUEST['max'];  if (!$max) $max = 6;

if (!$id) die('no id');

switch ($_REQUEST['type'])
{
	case "collection": case "collections":
		echo "collection\n";
		break;
	
	case "set": case "sets":
		$result = flickrRequest('flickr.photosets.getPhotos',array('photoset_id'=>$id));

		if (!is_array($result['photoset']['photo'])) die('bad result');

		shuffle($result['photoset']['photo']);

		$i = 0;
		foreach ($result['photoset']['photo'] as $p)
		{
			if (++$i > $max) break;
			print flickrURL($p,"s") . "\n";
		}

		break;
	
	case "photo": case "photos": default:
	
		$result = flickrRequest("flickr.photos.getInfo",array('photo_id'=>$id));
	
		if (!is_array($result)) die('bad result');
		if (!is_array($result['photo'])) die('no photo result');
	
		$p = $result['photo'];
	
		print flickrURL($p,'m') . "\n";
		break;
}

exit;

?>
