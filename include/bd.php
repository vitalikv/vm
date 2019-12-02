<? 
require_once ($_SERVER['DOCUMENT_ROOT']."/include/bd_1.php");




$url = $_SERVER['REQUEST_URI'];

$path = "";

$title = '';
$h1 = '';
$description = '';
$interface['wall_1'] = 0;
$interface['wall_2'] = ['top'=>[], 'left'=>[], 'right'=>[], 'bottom'=>[]];
$interface['tube_1'] = 0;
$interface['mode_1'] = 0;
$interface['estimate'] = 0;
$interface['click_wall_2D'] = 0;
$interface['wd_1'] = 0;
$interface['wd_2'] = 0;
$interface['wd_3'] = 0;
$interface['form_1'] = 0;
$interface['wall_plaster_width_1'] = 0;
$interface['monolit_fundament'] = 0;
$interface['lentochnii_fundament'] = 0;
$interface['svaynyy_fundament'] = 0;
$interface['ploshchad_uchastka'] = 0;
$interface['obyem_pomeshcheniya'] = 0;
$interface['raschet_kirpicha'] = 0;
$interface['raschet_blokov'] = 0;
$interface['wall_b1'] = 0;
$interface['grid_tube_1'] = 0;
$interface['tube_b1'] = 0;
$interface['box_wf_b1'] = 0;
$interface['obj_b1'] = 0;
	



$title = 'Test';
$h1 = '----';
$description = '';
$nameId = '';
$interface['mode_1'] = 1;
$interface['wall_1'] = 1;
$interface['tube_1'] = 1;
$interface['wd_1'] = 1;	
$interface['wd_2'] = 1;
$interface['wd_3'] = 1;
$interface['grid_tube_1'] = 1;	
$interface['tube_b1'] = 1;
$interface['box_wf_b1'] = 1;
$interface['wall_2']['bottom'] = ['width_1' => 1];
$interface['wall_2']['top'] = ['showHideWall_1' => 1];
$interface['obj_b1'] = 1;



$infProject = array('url' => $url, 'title' => $title, 'nameId' => $nameId, 'path' => $path, 'load' => [ img => [] ]);

$infProject['activeInput'] = '';
$infProject['activeDiv'] = null;

$infProject['user'] = [];
$infProject['user']['id'] = null;
$infProject['user']['mail'] = null;
$infProject['user']['pass'] = null;

$infProject['settings']['project'] = '';
$infProject['settings']['height'] = 2.5;
$infProject['settings']['floor'] = [ 'o' => false, 'posY' => 0.0, 'height' => 0.01, 'changeY' => false, 'areaPoint' => 'center', 'material' => null, 'label'=> true ];
$infProject['settings']['wall'] = [ 'width' => 0.3, 'label' => '', 'dist' => 'center', 'material' => null, 'block' => null ];
$infProject['settings']['calc'] = [ 'fundament' => '' ];
$infProject['settings']['land'] = [ 'o' => false ];
$infProject['settings']['unit'] = [ 'wall' => 1, 'floor' => 1 ];
$infProject['settings']['camera'] = [ 'type' => '2d', 'zoom' => 1, 'limitZoom' => 1 ];
$infProject['settings']['grid'] = [ 'count' => 30, 'size' => 0.5, 'pos' => [ 'y' => -0.1 ] ];
$infProject['settings']['interface']['button'] = [ 'cam2d' => '2d' ];

$infProject['scene'] = [ 'tool' => [] ];
$infProject['scene']['load'] = '';




//$infProject['scene']['load'] = 'shape3';	
$infProject['settings']['project'] = 'warm_floor';
$infProject['settings']['floor']['o'] = true;
$infProject['settings']['floor']['areaPoint'] = 'inside';
$infProject['settings']['floor']['label'] = false;
$infProject['settings']['floor']['color'] = 0xf7f2d5;
$infProject['settings']['wall']['label'] = 'double';
$infProject['settings']['wall']['color']['top'] = 0x444444;
$infProject['settings']['wall']['color']['front'] = 0xada186;
$infProject['settings']['grid']['size'] = 1.0;
$infProject['settings']['grid']['count'] = null;
$infProject['settings']['grid']['pos'] = [ 'y' => -0.01 ];
$infProject['settings']['grid']['color'] = 0xcccccc;
$infProject['settings']['interface']['button']['showHideWall_1'] = ['active' => 'Спрятать стены'];




$jsonPhp = json_encode($infProject);



?>