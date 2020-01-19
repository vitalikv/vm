


function infoListObj()
{
	var arr = [];		
	
	arr[0] =
	{
		lotid : 1,
		url : infProject.path+'import/wm_wind_1.fbx', 
		name : 'окно',
		planeMath : 1.5,
		material : true,
		stopUI: true,
	}
	
	arr[1] =
	{	
		lotid : 2,
		url : infProject.path+'import/furn_1.fbx', 
		name : 'диван',
		planeMath : 0.1,
	}	
	
	arr[2] =
	{
		lotid : 3,
		url : infProject.path+'import/wm_wind_2.fbx', 
		name : 'окно',
		planeMath : 1.5,
		material : true,
		stopUI: true,
	}
	
	arr[3] =
	{
		lotid : 4,
		url : infProject.path+'import/vm_door_1.fbx', 
		name : 'дверь',
		planeMath : 1.0,
		material : true,
		stopUI: true,
	}

	arr[4] =
	{
		lotid : 5,
		url : infProject.path+'import/vm_furn_2.fbx', 
		name : 'кухня',
		planeMath : 0.1,
	}	
	
	arr[5] =
	{
		lotid : 6,
		url : infProject.path+'import/vm_furn_3.fbx', 
		name : 'шкаф',
		planeMath : 0.1,
	}	

	arr[6] =
	{
		lotid : 7,
		url : infProject.path+'import/vm_furn_4.fbx', 
		name : 'кухня +',
		planeMath : 0.0,
	}

	arr[7] =
	{
		lotid : 8,
		url : infProject.path+'import/vm_light_point_1.fbx', 
		name : 'светильник',
		type: 'light point',
		planeMath : infProject.settings.height - 0.05,
	}	
	
	for(var i = 0; i < arr.length; i++)
	{
		//arr[i].lotid = i+1;
	}
	
	
	return arr;
}



function infoListTexture()
{
	var arr = [];	 	
	
	arr[0] =
	{
		url : infProject.path+'img/load/floor_1.jpg', 
	}
	
	arr[1] =
	{
		url : infProject.path+'img/load/w1.jpg', 
	}

	arr[2] =
	{
		url : infProject.path+'img/load/kirpich.jpg', 
	}

	arr[3] =
	{
		url : infProject.path+'img/load/beton.jpg', 
	}	

	arr[4] =
	{
		url : infProject.path+'img/load/w2.jpg', 
	}

	arr[5] =
	{
		url : infProject.path+'img/load/f1.jpg', 
	}

	arr[6] =
	{
		url : infProject.path+'img/load/f2.jpeg', 
	}

	arr[7] =
	{
		url : infProject.path+'img/load/f3.jpg', 
	}	
	
	return arr;
}


// получаем параметры объекта из базы
function getInfoObj(cdm)
{
	var lotid = cdm.lotid;
	
	
	for(var i = 0; i < infProject.catalog.obj.length; i++)
	{
		if(lotid == infProject.catalog.obj[i].lotid)
		{  
			return infProject.catalog.obj[i];
		}
	}
	
	return null;
}



function loadObjServer(cdm)
{ 
	// cdm - информация, которая пришла из вне
	// inf - статическая инфа из базы
	console.log(cdm);
	
	if(!cdm.lotid) return;
	
	var lotid = cdm.lotid;
	
	var inf = getInfoObj({lotid: lotid});

	if(!inf) return;	// объект не существует в API
	
	var obj = getObjFromBase({lotid: lotid});
	
	if(cdm.loadFromFile){ obj = null; }
	
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
			
			var obj = addObjInBase({lotid: lotid, obj: obj});
			
			if(cdm.loadFromFile)	// загрузка из сохраненного файла json 
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
			return obj;
		}
	}

	// накладываем на материал объекта lightMap
	obj.traverse(function(child) 
	{
		if(child.isMesh) 
		{ 
			if(child.material)
			{
				if(!Array.isArray(child.material)) { var arrM = [child.material]; }
				else { var arrM = child.material; }				
				
				for(var i = 0; i < arrM.length; i++)
				{
					arrM[i].lightMap = lightMap_1;
					arrM[i].precision = 'highp';				
					arrM[i] = new THREE.MeshPhongMaterial(arrM[i]);

					arrM[i].needsUpdate = true;
					//arrM[i].transparent = true;
					//arrM[i].userData.opacity = arrM[i].opacity; 				
				}					
			}

			child.castShadow = true;	
			child.receiveShadow = true;				
		}
	});	
	
	base[base.length] = {lotid: lotid, obj: obj.clone()};

	return obj;
}




// добавляем объект в сцену
function addObjInScene(inf, cdm)
{
	// загрузка wd
	if(cdm.wd)
	{  
		setObjInWD(inf, cdm);
		return;
	}
	
	var obj = inf.obj;
	
	if(cdm.pos){ obj.position.copy(cdm.pos); }
	else if(inf.planeMath)
	{ 
		obj.position.y = inf.planeMath;
		planeMath.position.y = inf.planeMath; 
		planeMath.rotation.set(-Math.PI/2, 0, 0);
		planeMath.updateMatrixWorld(); 
	}
	
	//if(cdm.rot){ obj.rotation.set(cdm.rot.x, cdm.rot.y, cdm.rot.z); }					
	if(cdm.q){ obj.quaternion.set(cdm.q.x, cdm.q.y, cdm.q.z, cdm.q.w); }
	
	if(cdm.id){ obj.userData.id = cdm.id; }
	else { obj.userData.id = countId; countId++; }
	
	obj.userData.tag = 'obj';
	obj.userData.obj3D = {};
	obj.userData.obj3D.lotid = cdm.lotid;
	obj.userData.obj3D.nameRus = inf.name;
	obj.userData.obj3D.type = '';
	obj.userData.obj3D.helper = null;
	
	if(!inf.material)
	{
		obj.material = new THREE.MeshLambertMaterial( {color: 0xffff00, transparent: true, opacity: 0.5 } );
		obj.material.visible = false;		
	}

	if(inf.type)
	{
		if(inf.type == 'light point')
		{
			var intensity = 1;
			if(cdm.light)
			{
				if(cdm.light.intensity) { intensity = cdm.light.intensity; }
			}
			setLightInobj({obj: obj, intensity: intensity}); 
		}
	}		
	
	infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;

	scene.add( obj );
	 
	updateListTubeUI_1({o: obj, type: 'add'});	// добавляем объект в UI список материалов 
	
	if(cdm.cursor) { clickO.move = obj; } 
	
	renderCamera();

}



function setLightInobj(cdm)
{
	var obj = cdm.obj;
	obj.userData.obj3D.type = 'light point';
	
	
	var light = new THREE.PointLight( 0xffffff, cdm.intensity, 10 );
	
	light.castShadow = true;            // default false
	scene.add( light );
	
	light.decay = 2;

	//Set up shadow properties for the light
	light.shadow.mapSize.width = 1048;  // default
	light.shadow.mapSize.height = 1048; // default
	light.shadow.camera.near = 0.01;       // default
	light.shadow.camera.far = 10;      // default
	
	light.position.set(0, -0.01, 0);		
	
	obj.add( light );	
	
	
	if(1==2)
	{
		var spotLight = new THREE.SpotLight( 0xffffff );	

		spotLight.castShadow = true;

		spotLight.angle = Math.PI / 2 - 0.1;
		spotLight.penumbra = 0.05;
		spotLight.decay = 2;
		spotLight.distance = 10;	

		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 4048;
		spotLight.shadow.mapSize.height = 4048;
		spotLight.shadow.camera.near = 0.01;
		spotLight.shadow.camera.far = 10;


		
		if(1==2)
		{
			scene.add( spotLight );
			scene.add( spotLight.target );
			
			spotLight.position.copy(obj.position);
			spotLight.target.position.set(obj.position.x, -1, obj.position.z);		
		}
		else
		{
			spotLight.position.set(0, -0.05, 0);
			spotLight.target.position.set(0, -1, 0);		
			
			obj.add( spotLight );
			obj.add( spotLight.target );	
		}
		
		console.log('spotLight', spotLight);
		//--------

		if(1==1)
		{
			spotLightCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
			scene.add( spotLightCameraHelper );	

			spotLightHelper = new THREE.SpotLightHelper( spotLight );
			scene.add( spotLightHelper );		

			obj.userData.obj3D.helper = [spotLightCameraHelper];
		}
		
	}

}






