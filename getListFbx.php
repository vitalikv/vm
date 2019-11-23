<? 




$dir = 'import';
$files = myscandir($dir);



foreach ($files as &$value) 
{
    echo trim($value).'<br>';
}


function myscandir($dir)
{
	$list = scandir($dir);
	
	// если директории не существует
	if (!$list) return false;
	
	// удаляем . и .. (я думаю редко кто использует)
	unset($list[0],$list[1]);
	
	return $list;
}










