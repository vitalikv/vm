



// добавляем объекты в каталог UI 
function addObjInCatalogUI_1(cdm)
{
	
	for(var i = 0; i < infProject.catalog.length; i++)
	{
		var o = infProject.catalog[i];
		
		if(o.stopUI) continue;
		
		var str = 
		'<div class="right_panel_1_1_list_item" add_lotid="'+o.lotid+'">\
			<div class="right_panel_1_1_list_item_text">'
			+o.name+
			'</div>\
		</div>';
		
		$('[list_ui="catalog"]').append(str);
	}
	
}


// добавляем/обновляем/удаляем в список материалов новый объект, который добавляем в сцену UI
function updateListTubeUI_1(cdm)
{
	if(cdm.type == 'add')
	{
		var obj = cdm.o;
		
		var tag = obj.userData.tag; 
		
		if(tag == 'obj')
		{   
			var str = 
			'<div class="right_panel_1_1_list_item" uuid="'+obj.uuid+'">\
			<div class="right_panel_1_1_list_item_text">'+obj.userData.obj3D.nameRus+'</div>\
			</div>';			
		}
		else
		{
			return;
		}
		
		$('[list_ui="wf"]').prepend(str);
		
		var q = $('[list_ui="wf"]')[0].children[0];
		q.uuid = obj.uuid;
		
		infProject.ui.list_wf[infProject.ui.list_wf.length] = q;	
	}
	
	if(cdm.type == 'delete')
	{
		for(var i = 0; i < infProject.ui.list_wf.length; i++)
		{
			if(infProject.ui.list_wf[i].uuid == cdm.uuid) { infProject.ui.list_wf[i].remove(); break; }
		}				
	}	
}



// при выделении объекта меняем боковое меню
function clickObjUI(cdm)
{
	if(!cdm) { cdm = {}; }	
	if(!cdm.obj) return;
	
	var obj = cdm.obj;
	
	$('[nameId="rp_obj_name"]').val(obj.userData.obj3D.nameRus);
}



function createTextUI_1(cdm)
{
	var obj = cdm.obj;
	var nameId = cdm.nameId;
	var uuid = cdm.uuid;
	var nameRus = cdm.nameRus;
	
	// добавляем в список группу	
	var str = 
	'<div class="right_panel_1_1_list_item" uuid="'+uuid+'" group_item_obj="">\
	<div class="right_panel_1_1_list_item_text">'+nameRus+'</div>\
	</div>';	
	
	$('[nameId="'+nameId+'"]').append(str); 
	var el = $($('[nameId="'+nameId+'"]')[0].children[$('[nameId="'+nameId+'"]')[0].children.length - 1]);			
}



// input для вкладки план (окно/дверь/толщина стены/высота этажа)
function startRightPlaneInput(cdm)
{
	
	$('[nameId="rp_wall_width_1"]').val(infProject.settings.wall.width);
	
	$('[nameId="rp_door_length_1"]').val(infProject.settings.door.width);
	$('[nameId="rp_door_height_1"]').val(infProject.settings.door.height);
	
	$('[nameId="rp_wind_length_1"]').val(infProject.settings.wind.width);
	$('[nameId="rp_wind_height_1"]').val(infProject.settings.wind.height);
	$('[nameId="rp_wind_above_floor_1"]').val(infProject.settings.wind.h1);
	
	$('[nameId="rp_floor_height"]').val(infProject.settings.height);
}



function upRightPlaneInput_1(cdm) 
{
	var el = cdm.el;
	var value = el.val();
	
	var inf = null;
	if(cdm.el[0] == $('[nameId="rp_wall_width_1"]')[0]) { var inf = infProject.settings.wall.width; }
	else if(cdm.el[0] == $('[nameId="rp_door_length_1"]')[0]) { var inf = infProject.settings.door.width; }
	else if(cdm.el[0] == $('[nameId="rp_door_height_1"]')[0]) { var inf = infProject.settings.door.height; }
	else if(cdm.el[0] == $('[nameId="rp_wind_length_1"]')[0]) { var inf = infProject.settings.wind.width; }
	else if(cdm.el[0] == $('[nameId="rp_wind_height_1"]')[0]) { var inf = infProject.settings.wind.height; }	
	else if(cdm.el[0] == $('[nameId="rp_wind_above_floor_1"]')[0]) { var inf = infProject.settings.wind.h1; }	
	else { return; }	
	
	var res = checkNumberInput({ value: value, unit: 1, limit: {min: 0.01, max: 5} });	
	
	if(!res) 
	{
		el.val(res.num);
		return;
	}
	
	el.val(res.num);
	
	if(cdm.el[0] == $('[nameId="rp_wall_width_1"]')[0]) { infProject.settings.wall.width = res.num; }
	else if(cdm.el[0] == $('[nameId="rp_door_length_1"]')[0]) { infProject.settings.door.width = res.num; }
	else if(cdm.el[0] == $('[nameId="rp_door_height_1"]')[0]) { infProject.settings.door.height = res.num; }
	else if(cdm.el[0] == $('[nameId="rp_wind_length_1"]')[0]) { infProject.settings.wind.width = res.num; }
	else if(cdm.el[0] == $('[nameId="rp_wind_height_1"]')[0]) { infProject.settings.wind.height = res.num; }	
	else if(cdm.el[0] == $('[nameId="rp_wind_above_floor_1"]')[0]) { infProject.settings.wind.h1 = res.num; }	
	
	console.log(3333, cdm.el[0] == $('[nameId="rp_wall_width_1"]')[0], cdm.el[0], $('[nameId="rp_wall_width_1"]')[0] );
}








