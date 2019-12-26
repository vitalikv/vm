<?
try
{
	$db = new PDO('mysql:host=localhost;dbname=eng_2', 'root', '');
	$db->exec("set names utf8");
}
catch(PDOException $e)
{
    echo 'Ошибка 1';
}








