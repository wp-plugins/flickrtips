<?php

function flickrRequest($method,$params)
{
	static $apikey = "ddba2415a69be40c65f15fffc5cbbfab";
	static $secret = "6a223007822ca801";

	$req = "http://api.flickr.com/services/rest/?format=php_serial&api_key=$apikey&method=" . urlencode($method);

	if (!$params['per_page'])
		$params['per_page'] = $GLOBALS['max'];

	if (is_array($params)) foreach ($params as $k => $v)
		$req .= "&" . urlencode($k) . "=" . urlencode($v);

	if (ini_get('allow_url_fopen') > 0)
		$result = file_get_contents($req);
	else
	{
		$bits = parse_url($req);

		$fh = fsockopen($bits['host'],80,$errno,$errmsg,10);

		if (!$fh) die("Unable to connect to Flickr API. Error $errno: $errmsg");

		$put = array(
			"GET {$bits['path']}?{$bits['query']} HTTP/1.1",
			"Host: {$bits['host']}",
			"Connection: Close"
		);

		fwrite($fh,implode("\r\n",$put) . "\r\n\r\n");

		$result = "";
		$recording = false;
		while (!feof($fh))
		{
			$line = fgets($fh);

			if ($recording) $result .= $line;
			else {

				// in headers
				if (!strlen(trim($line)))
					$recording = true;

			}
		}

		fclose($fh);
	}

	return @unserialize($result);
}

function flickrURL($p,$size='m')
{
	return "http://farm{$p['farm']}.static.flickr.com/{$p['server']}/{$p['id']}_{$p['secret']}_{$size}.jpg";
}

$id = urldecode($_REQUEST['id']); // this takes care of high-byte chars
$max = (int)$_REQUEST['max'];  
if (!$max) $max = 6;

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

	case "pool":

		#cache Flickr group IDs to avoid slow lookup
		$u = $_REQUEST['user'];

		$c = @unserialize($_COOKIE['flickrTips_grouphash']);
		if (!is_array($c)) $c = array();

		if (!empty($c[$u])) $u = $c[$u];
		else
		{
			$temp = flickrRequest('flickr.urls.lookupGroup',array('url' => "http://www.flickr.com/groups/{$_REQUEST['user']}/"));

			if (empty($temp['group']['id']))
				die("Error looking up Flickr group ID.");

			$u = $c[$_REQUEST['user']] = $temp['group']['id'];

			setcookie('flickrTips_grouphash',serialize($c),null,'/');
		}

		$req = array('group_id'=>$u);

		if ($id === 'tags' and isset($_REQUEST['tag']))
			$req['tags'] = $_REQUEST['tag'];
		
		$result = flickrRequest('flickr.groups.pools.getPhotos',$req);

		if (!is_array($result['photos']['photo'])) 
		{
			var_dump($result);
//			die('bad result');
		}

		shuffle($result['photos']['photo']);

		$i = 0;
		foreach ($result['photos']['photo'] as $p)
		{
			if (++$i > $max) break;
			print flickrURL($p,"s") . "\n";
		}

		break;	

	case "tag": case "tags":

		#cache Flickr user IDs to avoid slow lookup
		$u = $_REQUEST['user'];

		$c = @unserialize($_COOKIE['flickrTips_userhash']);
		if (!is_array($c)) $c = array();

		if (!empty($c[$u])) $u = $c[$u];
		else
		{
			$temp = flickrRequest('flickr.urls.lookupUser',array('url' => "http://flickr.com/photos/$u"));

			if (empty($temp['user']['id']))
				die("Error looking up Flickr user ID.");

			$u = $c[$_REQUEST['user']] = $temp['user']['id'];

			setcookie('flickrTips_userhash',serialize($c),null,'/');
		}

		$result = flickrRequest('flickr.photos.search',array('user_id' => $u, 'tags' => $id));

		if (!is_array($result['photos']['photo'])) die('bad result');

		shuffle($result['photos']['photo']);

		$i = 0;
		foreach ($result['photos']['photo'] as $p)
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
