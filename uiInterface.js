



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
		
		if(tag == 'wf_line')
		{
			var str = 
			'<div class="right_panel_1_1_list_item" uuid="'+obj.uuid+'">\
			<div class="right_panel_1_1_list_item_color"></div>\
			<div class="right_panel_1_1_list_item_text">труба</div>\
			<div class="right_panel_1_1_list_item_text"></div>\
			</div>';			
		}
		else if(tag == 'obj')
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
		
		
		if(tag == 'wf_line') { $(q.children[0]).css('background-color', '#'+obj.userData.wf_line.color.clone().getHexString()); }
		
		infProject.ui.list_wf[infProject.ui.list_wf.length] = q;	
	}
	
	if(cdm.type == 'delete')
	{
		for(var i = 0; i < infProject.ui.list_wf.length; i++)
		{
			if(infProject.ui.list_wf[i].uuid == cdm.uuid) { infProject.ui.list_wf[i].remove(); break; }
		}		
		
	}
	
	if(cdm.type == 'update')
	{
		var q = null;
		var line = cdm.o;
		
		console.log('update', line.userData);
		
		for(var i = 0; i < infProject.ui.list_wf.length; i++)
		{
			if(infProject.ui.list_wf[i].uuid == line.uuid) { q = infProject.ui.list_wf[i]; break; }
		}

		if(q)
		{
			//console.log(cdm, $('[list_ui="wf"]'), $(q.children[0]));
			
			$(q.children[0]).css('background-color', '#'+line.userData.wf_line.color.clone().getHexString());
			$(q.children[1]).text('труба '+line.userData.wf_line.diameter * 1000);
			
			var v = line.geometry.vertices;
			var length = 0;				
			for(var i = 0; i < v.length - 1; i++){ length += v[i].distanceTo(v[i + 1]); }
			
			$(q.children[1]).text('труба '+line.userData.wf_line.diameter * 1000);
			$(q.children[2]).text(Math.round(length * 100)/100+'м');			
		}
	}
}



// при выделении объекта меняем боковое меню
function clickObjUI(cdm)
{
	if(!cdm) { cdm = {}; }	
	if(!cdm.obj) return;
	
	var obj = cdm.obj;
	var inf = null;
	
	
	if(obj.userData.obj3D.group) { inf = obj.userData.obj3D.group.userData.groupObj; }
	else if(obj.userData.obj3D) { inf = obj.userData.obj3D; }
	else { return; }
	
	$('[nameId="rp_obj_name"]').val(inf.nameRus);
	
	
	showGroupObjUI({obj: obj, active: 'first'}); 
	showCenterObjUI({obj: obj, active: 'first'});
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
	
	
	if(nameId == "rp_obj_group")
	{
		var n = infProject.tools.list_group.o1.length;	
		infProject.tools.list_group.o1[n] = obj;
		infProject.tools.list_group.el[n] = el;
		
		el.on('mousedown', function(){ clickItemObjNameUI({el: $(this)}) });
	}
	
	if(nameId == "rp_obj_center")
	{
		var n = infProject.tools.center_obj.o1.length;	
		infProject.tools.center_obj.o1[n] = obj;
		infProject.tools.center_obj.el[n] = el;
		
		el.on('mousedown', function(){ clickItemCenterObjUI_1({el: $(this)}) });
	}	
	
	if(nameId == "rp_add_group")
	{
		var n = infProject.tools.merge_obj.el.length;	
		infProject.tools.merge_obj.el[n] = el;
	}	

	if(nameId == "rp_obj_align")
	{
		var n = infProject.tools.joint.el.length;	
		infProject.tools.joint.el[n] = el;
		infProject.tools.joint.p2[n] = obj;
		
		el.on('mousedown', function(){ clickItemCenterObjUI_2({el: $(this)}) });
	}

	if(nameId == "rp_plane")
	{
		var n = infProject.tools.plane.o1.length;	
		infProject.tools.plane.o1[n] = obj;
		infProject.tools.plane.el[n] = el;
	}	
}



// кликнули объект, показываем центры объекта (правом меню UI)
function showCenterObjUI(cdm)
{
	if(!cdm) { cdm = {}; }	
	if(!cdm.obj) return;
	
	var obj = cdm.obj;		

	clearListUI_2({list: infProject.tools.center_obj.el});	// очищаем список дочерних объектов группы (если он есть)
	

	var arr = getArrayJointPoint(cdm);
	
	if(arr.length == 0) return; 	// у объекта нет разъемов
	
	for(var i = 0; i < arr.length; i++)
	{		
		var child = arr[i];		
		if(!child.userData.centerPoint) continue;
		
		createTextUI_1({obj: child, nameId: "rp_obj_center", nameRus: child.userData.centerPoint.nameRus, uuid: child.uuid});	
	}
	
	// выделяем первый элемент  
	if(cdm.active == 'first') 
	{ 
		var el = $($('[nameId="rp_obj_center"]')[0].children[0]);
		el.css('background-color', '#00ff00');
	}
}



// кликнули объект, показываем список дочерних объектов (правом меню UI)
function showGroupObjUI(cdm)
{
	if(!cdm) { cdm = {}; }	
	if(!cdm.obj) return;
	
	var obj = cdm.obj;			
	
		
	clearListUI_2({list: infProject.tools.list_group.el});	// очищаем список дочерних объектов группы (если он есть)


	if(obj.userData.obj3D.group) 	// группа
	{
		var group = obj.userData.obj3D.group;
		var arr = group.userData.groupObj.child; 

		createTextUI_1({obj: obj, nameId: "rp_obj_group", nameRus: group.userData.groupObj.nameRus, uuid: "group_item"});
		
		// добавляем новый список объектов из группы
		for(var i = 0; i < arr.length; i++)
		{
			var child = arr[i];			
			if(!child.userData.obj3D) continue;			
			createTextUI_1({obj: child, nameId: "rp_obj_group", nameRus: child.userData.obj3D.nameRus, uuid: child.uuid}); 
		} 
	}
	else	// у объекта нет группы
	{
		createTextUI_1({obj: obj, nameId: "rp_obj_group", nameRus: "объект без группы", uuid: obj.uuid});
	}
	
	
	// выделяем первый элемент  
	if(cdm.active == 'first') 
	{
		var el = $($('[nameId="rp_obj_group"]')[0].children[0]);
		el.css('background-color', '#00ff00');
	}			
}



// показываем список объектов которые будут объединены в новую группу
function showListSelectedObjGroupUI(cdm) 
{
	if(infProject.tools.merge_obj.o2.length == 0) return;	
	
	clearListUI_2({list: infProject.tools.merge_obj.el});	
	
	for(var i = 0; i < infProject.tools.merge_obj.o2.length; i++)
	{
		var child = infProject.tools.merge_obj.o2[i];		
		if(!child.userData.obj3D) continue;		
		createTextUI_1({obj: child, nameId: "rp_add_group", nameRus: child.userData.obj3D.nameRus, uuid: child.uuid});  		
	}	
}



// очищаем список UI
function clearListUI_2(cdm)
{
	var list = cdm.list;
	
	for(var i = 0; i < list.length; i++)
	{
		list[i].remove();
	}	
	

	if(infProject.tools.merge_obj.el == list) { infProject.tools.merge_obj.el = []; }
	if(infProject.tools.list_group.el == list) { infProject.tools.list_group.o1 = []; infProject.tools.list_group.el = []; }
	if(infProject.tools.center_obj.el == list) { infProject.tools.center_obj.o1 = []; infProject.tools.center_obj.el = []; }
	if(infProject.tools.joint.el == list) { infProject.tools.joint.p2 = []; infProject.tools.joint.el = []; }
}


// выбираем группу или объект
function clickItemObjNameUI(cdm)
{
	var item = null;
	var obj = null;
	
	
	
	// снимаем старые выдиления  
	for(var i = 0; i < infProject.tools.list_group.el.length; i++)
	{
		infProject.tools.list_group.el[i].css('background-color', '#ffffff');
	}	
	
	
	if(cdm.el)		// кликнули на пункт в меню
	{
		for(var i = 0; i < infProject.tools.list_group.el.length; i++)
		{
			if(infProject.tools.list_group.el[i][0] == cdm.el[0]){ obj = infProject.tools.list_group.o1[i]; break; } 
		}		
		
		item = cdm.el;
	}
	else if(cdm.item !== undefined)	// присылаем номер пункта, который хотим выделить 
	{
		item = infProject.tools.list_group.el[cdm.item];
		obj = infProject.tools.list_group.o1[cdm.item];
	}
	else
	{
		return;
	}
	
	
	
	// выделяем новый пункт на который кликнули 
	item.css('background-color', '#00ff00');
	var value = item.attr('uuid');	
	
	
	if(value == 'group_item')
	{   
		obj = infProject.tools.list_group.o1[0];
		clickObject3D(obj, {group: true, outline: true}); 
		showCenterObjUI({obj: obj, group: true, active: 'first'});
		
		$('[nameId="rp_obj_name"]').val(obj.userData.obj3D.group.userData.groupObj.nameRus);
	}
	else
	{
		clickObject3D(obj, {group: false, outline: true}); 
		showCenterObjUI({obj: obj, group: false, active: 'first'});
		
		$('[nameId="rp_obj_name"]').val(obj.userData.obj3D.nameRus);
	}	
}


// выбираем центр для основного объекта
function clickItemCenterObjUI_1(cdm)
{
	var item = null;
	var obj = null;
	
	if(infProject.tools.center_obj.el.length == 0) return;	// у объекта нет разъемов
	
	
	// снимаем старые выдиления в UI 
	for(var i = 0; i < infProject.tools.center_obj.el.length; i++)
	{
		infProject.tools.center_obj.el[i].css('background-color', '#ffffff');
	}
	
	
	if(cdm.el)	// кликнули на пункт в меню
	{
		for(var i = 0; i < infProject.tools.center_obj.el.length; i++)
		{
			if(infProject.tools.center_obj.el[i][0] == cdm.el[0]){ obj = infProject.tools.center_obj.o1[i]; break; } 
		}

		item = cdm.el;
	}
	else if(cdm.obj)	// кликнули на объект в сцене
	{
		for(var i = 0; i < infProject.tools.center_obj.el.length; i++)
		{
			if(infProject.tools.center_obj.o1[i] == cdm.obj){ item = infProject.tools.center_obj.el[i]; break; } 
		}

		obj = cdm.obj;
	}
	else if(cdm.item !== undefined)	// присылаем номер пункта, который хотим выделить 
	{
		item = infProject.tools.center_obj.el[cdm.item];
		obj = infProject.tools.center_obj.o1[cdm.item];
	}
	else
	{
		return;
	}
	
	
	// выделяем новый пункт на который кликнули UI
	item.css('background-color', '#00ff00');
	var value = item.attr('uuid');	 
	
	// выделяем объект в сцене
	clickObject3D(obj);		 
}



// выбираем центр для объекта к которому хотим присоединиться 
function clickItemCenterObjUI_2(cdm)
{
	var item = null;
	var obj = null;
	
	var joint = infProject.tools.joint;
	
	if(joint.el.length == 0) return;	// у объекта нет разъемов
	
	
	// снимаем старые выдиления в UI 
	for(var i = 0; i < joint.el.length; i++)
	{
		joint.el[i].css('background-color', '#ffffff');
	}
	
	
	if(cdm.el)	// кликнули на пункт в меню
	{
		for(var i = 0; i < joint.el.length; i++)
		{
			if(joint.el[i][0] == cdm.el[0]){ obj = joint.p2[i]; break; } 
		}

		item = cdm.el;
	}
	else if(cdm.obj)	// кликнули на объект в сцене
	{
		for(var i = 0; i < joint.el.length; i++)
		{
			if(joint.p2[i] == cdm.obj){ item = joint.el[i]; break; } 
		}

		obj = cdm.obj;
	}
	else if(cdm.item !== undefined)	// присылаем номер пункта, который хотим выделить 
	{
		item = joint.el[cdm.item];
		obj = joint.p2[cdm.item];
	}
	else
	{
		return;
	}
	
	
	// выделяем новый пункт на который кликнули UI
	item.css('background-color', '#00ff00');
	var value = item.attr('uuid');


	
	if(joint.active_2)	// снимаем старое выделение объекта в сцене 
	{
		joint.active_2.material = joint.material.default;
		joint.active_2 = null;		
	}
	
	//if(!joint.visible) { joint.p1 = [obj]; }
	
	obj.material = joint.material.active;
	obj.visible = true;
	joint.active_2 = obj;
}





// добавляем этаж в список правой панели UI
function addPlaneListUI(cdm)
{
	if(!cdm) return;				
	if(!cdm.plane) return;	
	
	var plane = cdm.plane;
	var n = infProject.scene.substrate.floor.length - 1;

	createTextUI_1({obj: plane, nameId: "rp_plane", nameRus: "этаж"+(n+1), uuid: plane.uuid});
	
	
	// снимаем старые выдиления в UI 
	for(var i = 0; i < infProject.tools.plane.el.length; i++)
	{
		infProject.tools.plane.el[i].css('background-color', '#ffffff');
		infProject.tools.plane.o1[i].userData.substrate.active = false;
	}	
	
	
	var el = $($('[nameId="rp_plane"]')[0].children[$('[nameId="rp_plane"]')[0].children.length-1]);
	el.css('background-color', '#00ff00');

	plane.userData.substrate.active = true;
	
	renderCamera();
}



