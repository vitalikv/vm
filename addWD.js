

// создаем форму окна/двери/балкона (free_dw)
function createEmptyFormWD_1(cdm)
{
	if(!cdm) { cdm = {} };
	
	var type = (cdm.type) ? cdm.type : 'door';
	
	var color = infProject.listColor.door2D;
	
	if(type == 'window'){ color = infProject.listColor.window2D; }
	else if(type == 'door'){ color = infProject.listColor.door2D; }
	
	var material = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 1.0, depthTest: false, lightMap : lightMap_1 });
	
	if(1==2)
	{
		material.map = texture_wd_1;
		material.map.offset.set(0.5, 0.5);
		material.map.repeat.set(0.33, 5.0);			
	}	
	
	if(camera == cameraTop)
	{ 
		material.depthTest = false;		
		material.opacity = 1.0; 	
	}
	else if(1 == 2)
	{ 		
		material.depthTest = true;
		material.opacity = 0;					
	}	
	
	var spline = [];
	spline[0] = new THREE.Vector2( -0.5, -1.1 );	
	spline[1] = new THREE.Vector2( 0.5, -1.1 );
	spline[2] = new THREE.Vector2( 0.5, 1.1 );
	spline[3] = new THREE.Vector2( -0.5, 1.1 );		
	
	if(cdm.size)
	{
		var x = cdm.size.x/2;
		var y = cdm.size.y/2;
		
		spline[0] = new THREE.Vector2( -x, -y );	
		spline[1] = new THREE.Vector2( x, -y );
		spline[2] = new THREE.Vector2( x, y );
		spline[3] = new THREE.Vector2( -x, y );			
	}
	else if(type == 'window')
	{
		spline[0] = new THREE.Vector2( -0.5, -0.5 );	
		spline[1] = new THREE.Vector2( 0.5, -0.5 );
		spline[2] = new THREE.Vector2( 0.5, 0.5 );
		spline[3] = new THREE.Vector2( -0.5, 0.5 );		
	}
	
	var shape = new THREE.Shape( spline );
	var obj = new THREE.Mesh( new THREE.ExtrudeGeometry( shape, { bevelEnabled: false, depth: 0.2 } ), material );	
	
	var v = obj.geometry.vertices;
	
	var minX = [], maxX = [], minY = [], maxY = [], minZ = [], maxZ = [];
	
	for ( var i = 0; i < v.length; i++ )
	{
		v[i].z = Math.round(v[i].z * 100) / 100;
		if(v[i].z == 0) { minZ[minZ.length] = i; v[i].z = -0.1; }
		if(v[i].z == 0.2) { maxZ[maxZ.length] = i; v[i].z = 0.1; } 
	}
	
	obj.geometry.computeBoundingBox();	

	for ( var i = 0; i < v.length; i++ )
	{
		if(obj.geometry.boundingBox.min.x + 0.05 > v[i].x) { minX[minX.length] = i; }
		if(obj.geometry.boundingBox.max.x - 0.05 < v[i].x) { maxX[maxX.length] = i; }
		if(obj.geometry.boundingBox.min.y + 0.05 > v[i].y) { minY[minY.length] = i; }
		if(obj.geometry.boundingBox.max.y - 0.05 < v[i].y) { maxY[maxY.length] = i; }
	}
	
	
	var arr = { minX : minX, maxX : maxX, minY : minY, maxY : maxY, minZ : minZ, maxZ : maxZ };
	console.log(554, arr);
	
	var form = { type : '' , v : arr };	
	
	obj.userData.tag = 'free_dw';
	obj.userData.door = {};
	obj.userData.door.type = type;
	obj.userData.door.size = new THREE.Vector3( 1, 1, 0.2 );
	obj.userData.door.form = form;
	obj.userData.door.bound = {}; 
	obj.userData.door.floorCenterY = (cdm.type == 'window') ? 1.5 : 1.1;  // центр wd над полом
	obj.userData.door.width = 0.2;
	obj.userData.door.h1 = 0;
	obj.userData.door.color = obj.material.color; 
	obj.userData.door.wall = null;
	obj.userData.door.controll = {};
	obj.userData.door.ruler = {};
	obj.userData.door.last = { pos : new THREE.Vector3(), rot : new THREE.Vector3(), x : 0, y : 0 };
	obj.userData.door.topMenu = true;
	obj.userData.door.lotid = (cdm.lotid)? cdm.lotid : null;
	//obj.userData.door.active = { click: true, hover: true };
	
	
	//default размеры
	if(1==1)
	{
		obj.geometry.computeBoundingBox();		
		var dX = obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x;
		var dY = obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y;			
		form.size = new THREE.Vector3(dX, dY, 1);				
	}
		
	//default координаты точек
	if(1==1)
	{
		var v2 = [];
		var v = obj.geometry.vertices;
		for ( var i = 0; i < v.length; i++ ) { v2[i] = v[i].clone(); }
		obj.userData.door.form.v2 = v2;		
	}
	
	upUvs_4( obj );
	
	scene.add( obj );
	
	
	if(cdm.status)
	{
		obj.userData.id = cdm.id;
		obj.position.copy(cdm.pos);
		
		obj.position.y += (obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y) / 2; 	
		
		changeWidthWD(obj, cdm.wall);		// выставляем ширину окна/двери равную ширине стены
		addWD({ obj: obj });
	}
	else
	{
		clickO.move = obj; 
		clickO.last_obj = obj;		
	}
}


// перетаскиваем free_dw
function dragWD_2( event, obj ) 
{ 
	var arrDp = [];
	
	var wall = infProject.scene.array.wall;
	var window = infProject.scene.array.window;
	var door = infProject.scene.array.door;
	
	for ( var i = 0; i < wall.length; i++ ){ arrDp[arrDp.length] = wall[i]; } 
	for ( var i = 0; i < window.length; i++ ){ arrDp[arrDp.length] = window[i]; } 
	for ( var i = 0; i < door.length; i++ ){ arrDp[arrDp.length] = door[i]; } 
	arrDp[arrDp.length] = planeMath; 

	var intersects = rayIntersect( event, arrDp, 'arr' );
	
	var wall = null;
	
	var pos = new THREE.Vector3();
	obj.material.color = obj.userData.door.color;
	
	for ( var i = 0; i < intersects.length; i++ )
	{
		if (intersects[ i ].face != null) 
		{
			var object = intersects[ i ].object;
			
			if(object.userData.tag == 'planeMath'){ obj.position.copy( intersects[i].point ); } 			
			else if(object.userData.tag == 'wall')
			{ 
				wall = object; 
				obj.rotation.copy( wall.rotation ); 
				pos = intersects[i].point; 
			}
			else if(object.userData.tag == 'window' || object.userData.tag == 'door'){ obj.material.color = new THREE.Color(infProject.listColor.active2D); } 
		}
	}

	if(obj.material.color == new THREE.Color(infProject.listColor.active2D)) { obj.userData.door.wall = null; return; }
	if(!wall) { obj.userData.door.wall = null; return; }

	

	wall.updateMatrixWorld();			
	var pos = wall.worldToLocal( pos.clone() );	
	var pos = wall.localToWorld( new THREE.Vector3(pos.x, pos.y, 0 ) ); 	
	
	  
	if(camera == camera3D || camera == cameraWall) 
	{ 
		obj.position.set( pos.x, pos.y, pos.z ); 
	}
	else 
	{ 
		var h = wall.userData.wall.p[0].position.y; 
		obj.position.set( pos.x, obj.userData.door.floorCenterY + h, pos.z ); 
	}		

	changeWidthWD(obj, wall);	
}


// кликнули на стену или окно/дверь, когда к мышки привязана вставляемая дверь 
function clickToolWD(obj)
{ 
	  
	if(obj)
	{    
		// кликнули на стену, когда добавляем окно
		if(obj.userData.tag == 'free_dw') 
		{ 
			clickO.obj = obj;
			if(!obj.userData.door.wall) { return true; }
			
			clickO.last_obj = null;
			addWD({ obj : obj });  
			return true; 
		}
	}

	return false;
}



// добавляем на выбранную стену окно/дверь
// obj 		готовая дверь/окно
// wall		стену на которую кликнули
function addWD( cdm )
{	
	var obj = cdm.obj;
	var wall = obj.userData.door.wall;
	var pos = obj.position;
	obj.userData.tag = obj.userData.door.type;
	
	//pos.y -= 0.001;		// делаем чуть ниже уровня пола
	obj.position.copy( pos );
	obj.rotation.copy( wall.rotation ); 
	obj.material.transparent = false;
	
	
	if(camera == cameraTop)
	{ 
		obj.material.depthTest = false;
		obj.material.transparent = true;
		obj.material.opacity = 1.0; 		 	
	}
	else
	{ 		
		obj.material.depthTest = true;
		obj.material.transparent = true;
		obj.material.opacity = 0;					
	}	
	
	//changeWidthWD(obj, wall);		// выставляем ширину окна/двери равную ширине стены
	
	// обновляем(пересчитываем) размеры двери/окна/двери (если измениалась ширина)
	obj.geometry.computeBoundingBox(); 	
	obj.geometry.computeBoundingSphere();
  
	
	if(!obj.userData.id) { obj.userData.id = countId; countId++; }  
	
	if(obj.userData.tag == 'window') { infProject.scene.array.window[infProject.scene.array.window.length] = obj; }
	else if(obj.userData.tag == 'door') { infProject.scene.array.door[infProject.scene.array.door.length] = obj; }

	
	//--------
	
	obj.updateMatrixWorld();
	
	
	// создаем клон двери/окна, чтобы вырезать в стене нужную форму
	if(1==1)
	{  
		objsBSP = { wall : wall, wd : createCloneWD_BSP( obj ) };				
		MeshBSP( obj, objsBSP ); 
	}	


	wall.userData.wall.arrO[wall.userData.wall.arrO.length] = obj;
	
	obj.geometry.computeBoundingBox();
	obj.geometry.computeBoundingSphere();
	
	
	if(obj.userData.door.lotid)
	{
		loadObjServer({type: 'wd', wd: obj, lotid: obj.userData.door.lotid});
	}

 	
	clickO.obj = null;
	clickO.last_obj = null;
	clickO.move = null;
	
	renderCamera();
}



// вставляем в wd 3D объект окна/двери
function setObjInWD(inf, cdm)
{
	var wd = cdm.wd;
	var objPop = inf.obj;
	
	wd.add( objPop );
	
	wd.updateMatrixWorld();
	var centerWD = wd.geometry.boundingSphere.center.clone();	

	objPop.updateMatrixWorld();
	objPop.geometry.computeBoundingBox();
	objPop.geometry.computeBoundingSphere();
	
	var center = objPop.geometry.boundingSphere.center;
	
	console.log(center.clone());
	console.log(objPop.geometry.boundingBox);
	console.log(objPop.scale);
	
	objPop.position.set(center.x/10, center.y/10, center.z/10);
	//objPop.position.copy(centerWD);
	objPop.rotation.set(0,Math.PI,0);
}



// изменение ширины формы окна/двери
function changeWidthWD(obj, wall)
{
	if(obj.userData.door.wall == wall) return;
	//if(obj.userData.door.width == wall.userData.wall.width) return;
	
	var v = obj.geometry.vertices;
	var minZ = obj.userData.door.form.v.minZ; 
	var maxZ = obj.userData.door.form.v.maxZ;
	
	var width = wall.userData.wall.width; 
	wall.geometry.computeBoundingBox();
	console.log(width);
	
	for ( var i = 0; i < minZ.length; i++ ) { v[minZ[i]].z = wall.geometry.boundingBox.min.z; }
	for ( var i = 0; i < maxZ.length; i++ ) { v[maxZ[i]].z = wall.geometry.boundingBox.max.z; }
	
	obj.geometry.verticesNeedUpdate = true; 
	obj.geometry.elementsNeedUpdate = true;
	obj.geometry.computeBoundingSphere();
	obj.geometry.computeBoundingBox();	
	obj.geometry.computeFaceNormals();		
	
	obj.userData.door.width = width;
	obj.userData.door.wall = wall;
} 
 
 
 