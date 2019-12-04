<? 




$list = 'meshBSP.js 	
calculationArea.js
createGrid.js
crossWall.js
addPoint.js
addWD.js
mouseClick.js
changeCamera.js
moveCamera.js
clickChangeWD.js
clickMovePoint.js
clickMoveWall.js
clickMoveWD.js
deleteObj.js
floor.js
detectZone.js
inputWall.js
label.js  	
clickActiveObj.js    
saveLoad.js
script.js
eventClick.js
clickMovePivot.js
clickObj.js
clickMoveGizmo.js
loadObj.js
uiInterface.js
hideWall.js
';


$arr = explode(".js", $list);


for ($i = 0; $i < count($arr); $i++)
{
	$arr[$i] = trim($arr[$i]).'.js';
}


// Открываем файл, флаг W означает - файл открыт на запись
$newFile = fopen('t/test.js', 'w');


// Записываем в файл $text
for ($i = 0; $i < count($arr)-1; $i++)
{
	echo $arr[$i].'<br>';
	$file = file_get_contents($arr[$i]);
	
	$file = preg_replace("|console.log\((.*)\);|i","",$file);
	
	fwrite($newFile, $file);	
}

// Закрывает открытый файл
fclose($newFile);


echo 11;


