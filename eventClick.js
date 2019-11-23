$(document).ready(function(){

$('[data-action="top_panel_1"]').on('mousedown wheel DOMMouseScroll mousewheel mousemove touchstart touchend touchmove', function (e) { e.stopPropagation(); });
$('[ui_1=""]').on('mousedown wheel DOMMouseScroll mousewheel mousemove touchstart touchend touchmove', function (e) { e.stopPropagation(); });
		
$('[data-action="top_panel_1"]').mousedown(function () { clickInterface(); });
$('[data-action="left_panel_1"]').mousedown(function () { clickInterface(); });


// переключаем разделы
$('[nameId="butt_main_menu"]').mousedown(function () { $('[nameId="background_main_menu"]').css({"display":"block"}); });
$('[nameId="reset_scene_1"]').mousedown(function () { resetScene(); $('[nameId="background_main_menu"]').css({"display":"none"}); });
$('[nameId="button_main_menu_reg_1"]').mousedown(function () { changeMainMenuUI({value: 'button_main_menu_reg_1'}); });
$('[nameId="button_load_1"]').mousedown(function () { changeMainMenuUI({value: 'button_load_1'}); });
$('[nameId="button_save_1"]').mousedown(function () { changeMainMenuUI({value: 'button_save_1'}); });
$('[nameId="button_contact"]').mousedown(function () { changeMainMenuUI({value: 'button_contact'}); });
//$('[nameId="load_pr_1"]').mousedown(function () { loadFile(); $('[nameId="background_main_menu"]').css({"display":"none"}); });
//$('[nameId="save_pr_1"]').mousedown(function () { saveFile(); $('[nameId="background_main_menu"]').css({"display":"none"}); });



getSlotMainMenuUI();	


// собираем в массив элементы из main_menu (UI)
function getSlotMainMenuUI()
{
	var q = $('[list_ui="window_main_menu_content"]');
	
	for ( var i = 0; i < q.length; i++ )
	{
		infProject.ui.main_menu[infProject.ui.main_menu.length] = q[i];
	}
}


// переключаем кнопки в главном меню (сохрание/загрузка)
// прячем все, кроме выбранного раздела
function changeMainMenuUI(cdm)
{
	var q = infProject.ui.main_menu;
	
	for ( var i = 0; i < q.length; i++ )
	{
		if(q[i].attributes.wwm_1.value == cdm.value) { $(q[i]).show(); continue; }  		
	
		$(q[i]).hide();		
	}	
}


$('[nameId="button_wrap_catalog"]').mousedown(function () { changeRightMenuUI_1({el: this}); });
$('[nameId="button_wrap_list_obj"]').mousedown(function () { changeRightMenuUI_1({el: this}); });
$('[nameId="button_wrap_object"]').mousedown(function () { changeRightMenuUI_1({el: this}); });
$('[nameId="button_wrap_plan"]').mousedown(function () { changeRightMenuUI_1({el: this}); });




$('[nameId="button_wrap_obj_center"]').mousedown(function () { changeRightMenuUI_2({el: this}); });
$('[nameId="button_wrap_obj_child"]').mousedown(function () { changeRightMenuUI_2({el: this}); });


// переключаем меню (центр/группа)
function changeRightMenuUI_2(cdm)
{
	$('[nameId="wrap_obj_center"]').hide();
	$('[nameId="wrap_obj_child"]').hide();

	infProject.tools.list_group.active = false;
	infProject.tools.center_obj.active = false;
	
	switchSelectAddObjGroup({active: false});
	switchJoinObj({active: false});	
	
	if(cdm.el.attributes.nameId.value == "button_wrap_obj_center") 
	{
		var obj = getObjFromPivotGizmo();
		infProject.tools.center_obj.active = true;
		
		if(obj) 
		{
			clickItemCenterObjUI_1({item: 0}); 
			$('[nameId="wrap_obj_center"]').show();
		}		
	}
	if(cdm.el.attributes.nameId.value == "button_wrap_obj_child") 
	{
		var obj = getObjFromPivotGizmo();
		infProject.tools.list_group.active = true;
		
		if(obj) 
		{
			hideJoinPoint({visible: 'full'});
			clickItemObjNameUI({item: 0});  
			$('[nameId="wrap_obj_child"]').show();
		}				
	}
		
}







$('[infcam]').on('mousedown', function(e) 
{  
	var value = $(this).attr('infcam');
	var txt = (value == '3D') ? '2D' : '3D';
	$(this).text(txt);
	$(this).attr({"infcam": txt});
	
	if(value == '3D')
	{
		$('[nameId="top_menu_b1"]').hide();
		$('[nameId="top_menu_b2"]').hide();
		$('[inf_type="mode_1"]').hide();
	}
	else
	{
		if($('[nameId="top_menu_b1"]').attr('inf-visible') == 'true') { $('[nameId="top_menu_b1"]').show(); }
		if($('[nameId="top_menu_b2"]').attr('inf-visible') == 'true') { $('[nameId="top_menu_b2"]').show();	}
		$('[inf_type="mode_1"]').show();
	}
	
	clickInterface({button: value});
	return false; 
}); 
 

$('[nameId="color_tube_1_default"]').on('mousedown', function(e) 
{  
	$('[nameId="bb_menu_tube_menu_1"]').hide();
	$('[nameId="bb_menu_tube_menu_2"]').show();
	
	return false; 
});


  
 
	
$('[inf_type="mode_1"]').on('mousedown', function(e) { showHideObjMode_1(); });
$('[nameId="showHideWall_1"]').on('mousedown', function(e) { showHideWallHeight_1(); });




$('[nameId="button_add_plane"]').mousedown(function () { createSubstrate(); }); 



$('[nameId="button_active_join_element"]').mousedown(function () { switchJoinObj(); }); 
$('[nameId="button_active_add_group"]').mousedown(function () { switchSelectAddObjGroup(); });  
$('[nameId="button_add_group"]').mousedown(function () { addGroupObj(); });  
$('[nameId="join_element"]').mousedown(function () { joinElement(); });


$('[nameId="show_hide_join_point"]').mousedown(function () { showHideJP(); }); 	
$('[nameId="select_pivot"]').mousedown(function () { switchPivotGizmo({mode:'pivot'}); });
$('[nameId="select_gizmo"]').mousedown(function () { switchPivotGizmo({mode:'gizmo'}); });

$('[nameId="obj_rotate_reset"]').mousedown(function () { objRotateReset(); });	
$('[nameId="button_copy_obj"]').mousedown(function () { copyObj(); });
$('[nameId="button_delete_obj"]').mousedown(function () { deleteObjectPop(clickO.last_obj); });


$('[data-action="wall"]').mousedown(function () { clickInterface({button:'point_1'}); });
$('[data-action="create_tube_1"]').mousedown(function () { clickInterface({button:'create_tube_1'}); }); 
$('[data-action="create_tube_box_1"]').mousedown(function () { clickInterface({button:'create_tube_box_1'}); }); 
$('[data-action="create_wd_2"]').mousedown(function () { clickInterface({button:'create_wd_2'}); });
$('[data-action="create_wd_3"]').mousedown(function () { clickInterface({button:'create_wd_3'}); });
$('[data-action="grid_show_1"]').mousedown(function () { clickInterface({button:'grid_show_1'}); });
$('[data-action="grid_move_1"]').mousedown(function () { clickInterface({button:'grid_move_1'}); });
$('[data-action="grid_link_1"]').mousedown(function () { clickInterface({button:'grid_link_1'}); });
$('[add_lotid]').mousedown(function () { clickInterface({button: 'add_lotid', value: this.attributes.add_lotid.value}); });
$('[data-action="screenshot"]').mousedown(function () { saveAsImage(); return false; }); 				



$('[link_form]').mousedown(function () 
{ 
	createForm({form : 'shape'+$(this).attr("link_form")}); 
	$('[data-action="modal"]').css({"display":"none"}); 
}); 




$('[data-action="deleteObj"]').mousedown(function () { detectDeleteObj(); return false; });
$('[data-action="addPointCenterWall"]').mousedown(function () { addPointCenterWall(); return false; });



$('input').on('focus keyup change', function () 
{ 
	infProject.activeInput = $(this).data('action');
	if($(this).data('action') == undefined) { infProject.activeInput = $(this).data('input');  }
	if(infProject.activeInput == undefined) { infProject.activeInput = $(this).attr('nameId');  }
	console.log(infProject.activeInput);
});
$('input').blur(function () { infProject.activeInput = ''; });	


$('[data-action="estimate"]').mousedown(function () 
{ 
	createEstimateJson();
	$('.modal').css({"display":"block"});
	$('[modal_body="estimate"]').css({"display":"block"}); 
	$('[modal_body="form"]').css({"display":"none"});
	$('[modal_title="estimate"]').css({"display":"block"});
	$('[modal_title="form"]').css({"display":"none"});			
}); 

$('[data-action="form_1"]').mousedown(function () 
{ 
	console.log('form_1');
	checkClickUINameID('form_1');
	clickInterface();
	$('.modal').css({"display":"block"});
	$('[modal_body="estimate"]').css({"display":"none"});
	$('[modal_body="form"]').css({"display":"block"});
	$('[modal_title="estimate"]').css({"display":"none"});
	$('[modal_title="form"]').css({"display":"block"});
});


$('[data-action="modal_window"]').mousedown(function (e) { e.stopPropagation(); });		


$('[data-action="modal"]').mousedown(function () 
{			
	clickInterface(); 
	$('[data-action="modal"]').css({"display":"none"}); 
});

			
$('[data-action="modal_window_close"]').mousedown(function () 
{  
	$('[data-action="modal"]').css({"display":"none"}); 
});



$('[data-action="modal_1"]').mousedown(function () 
{	 
	$('[data-action="modal_1"]').css({"display":"none"}); 
});

			
$('[data-action="modal_window_close_1"]').mousedown(function () 
{  
	$('[data-action="modal_1"]').css({"display":"none"}); 
});




});





// переключаем вкладки правой панели 
function changeRightMenuUI_1(cdm)
{
	$('[nameId="wrap_catalog"]').hide();
	$('[nameId="wrap_list_obj"]').hide();
	$('[nameId="wrap_object"]').hide();
	$('[nameId="wrap_plan"]').hide();
	
	showHideSubstrate_1({visible: false});
	
	var name = '';
	//var name_2 = infProject.ui.right_menu.active;
	
	if(cdm.el) { name = cdm.el.attributes.nameId.value; }
	else if(cdm.name) { name = cdm.name; }
	else if(cdm.current) { name = infProject.ui.right_menu.active; }
	
	
	if(name == "button_wrap_catalog") 
	{
		$('[nameId="wrap_catalog"]').show();
	}
	if(name == "button_wrap_list_obj") 
	{
		$('[nameId="wrap_list_obj"]').show();
	}
	if(name == "button_wrap_object") 
	{
		$('[nameId="wrap_object"]').show();
	}
	if(name == "button_wrap_plan") 
	{
		$('[nameId="wrap_plan"]').show();
		if(camera == cameraTop) 
		{ 
			deActiveSelected();
			
			showHideSubstrate_1({visible: true}); 
		}
	}

	infProject.ui.right_menu.active = name;
}
















