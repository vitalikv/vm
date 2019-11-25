


function infoListObj()
{
	var arr = [];
	
	
	arr[0] =
	{	
		lotid : 1,
		url : infProject.path+'import/nasos_z.fbx', 
		name : 'насос',
		planeMath : 0.5,
	}
	
	arr[1] =
	{
		lotid : 2,
		url : infProject.path+'import/kotel_1.fbx', 
		name : 'котел',
		planeMath : 1.5,
	}
	
	arr[2] =
	{
		lotid : 3,
		url : infProject.path+'import/budres_900.fbx', 
		name : 'радиатор',
		planeMath : 0.8,
	}
	
	arr[3] =
	{
		lotid : 4,
		url : infProject.path+'import/bak_1.fbx', 
		name : 'расширительный бак',
		planeMath : 0.5,
	}	
	
	arr[4] =
	{
		lotid : 5,
		url : infProject.path+'import/kollector_1.fbx', 
		name : 'коллектор',
		planeMath : 0.5,
	}
	
	arr[5] =
	{
		lotid : 6,
		url : infProject.path+'import/rad_al_secziy_500_.fbx', 
		name : 'радиатор алюминиевый',
		planeMath : 0.5,
	}
	
	arr[6] =
	{
		lotid : 7,
		url : infProject.path+'export/soedin_al_rad_1.fbx', 
		name : 'соединение алюминиевого радиатора',
		planeMath : 0.5,
		stopUI: true,
	}
	
	arr[7] =
	{
		lotid : 8,
		url : infProject.path+'import/kran_sgon_3s4.fbx',
		name : 'шаровой кран',
		planeMath : 0.5,		
	}
	
	arr[8] =
	{
		lotid : 9,
		url : infProject.path+'import/rad1_zagl_1_.fbx', 
		name : 'заглушка радиаторная',
		planeMath : 0.5,		
	}
	
	arr[9] =
	{
		lotid : 10,
		url : infProject.path+'import/rad1_zagl_3s4.fbx', 
		name :'заглушка радиаторная 3/4',
		planeMath : 0.5,		
	}	
	
	arr[10] =
	{
		lotid : 10,
		url : infProject.path+'import/rad1_zagl_1s2.fbx', 
		name :'заглушка радиаторная 1/2',
		planeMath : 0.5,		
	}

	arr[11] =
	{
		lotid : 10,
		url : infProject.path+'import/rad1_zagl_vozd.fbx', 
		name :'радиаторный воздухоотводчик',
		planeMath : 0.5,		
	}
	
	arr[12] =
	{
		lotid : 10,
		url : infProject.path+'import/nasos_1.fbx', 
		name :'насос',
		planeMath : 0.5,		
	}	
	
	arr[13] =
	{
		lotid : 10,
		url : infProject.path+'import/termo_kran_1s2.fbx', 
		name :'регулеровачный кран 1/2',
		planeMath : 0.5,		
	}	

	arr[14] =
	{
		lotid : 10,
		url : infProject.path+'import/termo_regul_1s2.fbx', 
		name :'терморегулятор',
		planeMath : 0.5,		
	}
	
	arr[15] =
	{
		lotid : 10,
		url : infProject.path+'import/mp_tronik_32х20х32.fbx', 
		name :'тройник 32х20х32 (мп)',
		planeMath : 0.5,		
	}

	arr[16] =
	{
		lotid : 10,
		url : infProject.path+'import/mp_tronik_26х16х20.fbx', 
		name :'тройник 26х16х20 (мп)',
		planeMath : 0.5,		
	}	
	
	arr[17] =
	{
		lotid : 10,
		url : infProject.path+'import/mp_ugol_nar_16x1s2.fbx', 
		name :'угол 16х1/2(нр) (мп)',
		planeMath : 0.5,		
	}	
	
	for(var i = 0; i < arr.length; i++)
	{
		arr[i].lotid = i+1;
	}
	
	
	return arr;
}



function getInfoObj(cdm)
{
	var lotid = cdm.lotid;
	
	
	for(var i = 0; i < infProject.catalog.length; i++)
	{
		if(lotid == infProject.catalog[i].lotid)
		{  
			return infProject.catalog[i];
		}
	}
}



function loadObjServer(cdm)
{ 
	// cdm - информация, которая пришла из вне
	// inf - статическая инфа из базы
	console.log(cdm);
	
	if(!cdm.lotid) return;
	
	var lotid = cdm.lotid;
	
	var inf = getInfoObj({lotid: lotid});	
	
	var obj = getObjFromBase({lotid: lotid});
	
	if(obj)
	{ 
		inf.obj = obj.clone();
		console.log('---------');
		if(obj) { addObjInScene(inf, cdm); }
	}
	else
	{
	
		var loader = new THREE.FBXLoader();
		loader.load( inf.url, function ( object ) 						
		{ 
			//object.scale.set(0.1, 0.1, 0.1);
			
			var obj = object.children[0];
			
			addObjInBase({lotid: lotid, obj: obj});
			
			if(cdm.loadFromFile)	// загрузка из сохраненного файла 
			{
				loadObjFromBase({lotid: lotid, furn: cdm.furn});
			}
			else					// добавляем объект в сцену 
			{
				inf.obj = obj;
				
				addObjInScene(inf, cdm);							
			}
		});
	
	}
	
	
}





// ищем был ли до этого объект добавлен в сцену (если был, то береме сохраненную копию)
function getObjFromBase(cdm)
{
	var lotid = cdm.lotid;								// объекты в сцене 
	var arrObj = infProject.scene.array.base;		// объекты в памяти	
	
	for(var i = 0; i < arrObj.length; i++)
	{
		if(arrObj[i].lotid == lotid)
		{
			return arrObj[i].obj;
		}

	}
	
	return null;
}



// добавляем новый объект в базу объектов (добавляются только уникальные объекты, кторых нет в базе)
function addObjInBase(cdm)
{
	var lotid = cdm.lotid;								// объекты в сцене
	var obj = cdm.obj;
	var base = infProject.scene.array.base;			// объекты в памяти	
	
	for(var i = 0; i < base.length; i++)
	{
		if(base[i].lotid == lotid)
		{  
			return null;
		}
	}	
	
	base[base.length] = {lotid: lotid, obj: obj.clone()}; 
}




// добавляем объект в сцену
function addObjInScene(inf, cdm)
{
	var obj = inf.obj;
	
	if(cdm.pos){ obj.position.copy(cdm.pos); }
	else if(inf.planeMath)
	{ 
		obj.position.y = inf.planeMath;
		planeMath.position.y = inf.planeMath; 
		planeMath.rotation.set(-Math.PI/2, 0, 0);
		planeMath.updateMatrixWorld(); 
	}
	
	if(cdm.rot){ obj.rotation.set(cdm.rot.x, cdm.rot.y, cdm.rot.z); }					
	
	
	if(cdm.id){ obj.userData.id = cdm.id; }
	else { obj.userData.id = countId; countId++; }
	
	obj.userData.tag = 'obj';
	obj.userData.obj3D = {};
	obj.userData.obj3D.lotid = cdm.lotid;
	obj.userData.obj3D.nameRus = inf.name;  
	obj.material = new THREE.MeshLambertMaterial( {color: 0xffff00, transparent: true, opacity: 0.5 } );
	obj.material.visible = false;
	//obj.rotation.y += 1;
	// накладываем на материал объекта lightMap
	obj.traverse(function(child) 
	{
		if(child.isMesh) 
		{ 
			if(child.material)
			{
				if(Array.isArray(child.material))
				{
					for(var i = 0; i < child.material.length; i++)
					{
						child.material[i].lightMap = lightMap_1;
					}
				}
				else
				{
					child.material.lightMap = lightMap_1;
				}					
			}				
		}
	});		
	
	infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;

	scene.add( obj );
	 
	updateListTubeUI_1({o: obj, type: 'add'});	// добавляем объект в UI список материалов 
	
	if(cdm.cursor) { clickO.move = obj; } 
	
	renderCamera();

}





