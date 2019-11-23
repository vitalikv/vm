

 

// создаем Gizmo360
function createGizmo360()
{
	var count = 68; 
	var circle = [];
	var g = (Math.PI * 2) / count;
	
	for ( var i = 0; i < count; i++ )
	{
		var angle = g * i;
		circle[i] = new THREE.Vector3();
		circle[i].x = Math.sin(angle)*0.5;
		circle[i].z = Math.cos(angle)*0.5;
		//circle[i].y = 0;
	}	

	
	var pipeSpline = new THREE.CatmullRomCurve3(circle);
	pipeSpline.curveType = 'catmullrom';
	pipeSpline.tension = 0;
	
	var geometry_1 = new THREE.TubeBufferGeometry( pipeSpline, circle.length, 0.03, 12, true );	
	var geometry_2 = new THREE.TubeBufferGeometry( pipeSpline, circle.length, 0.01, 12, true );
	
	
	var gizmo = new THREE.Object3D();
	gizmo.userData.gizmo = {};
	gizmo.userData.gizmo.obj = null;
	gizmo.userData.gizmo.active = { axis: '', startPos: new THREE.Vector3(), rotY: 0 };

	
	var param = [];
	param[0] = {axis: 'x', rot: new THREE.Vector3(0, 0, 0), color: 'rgb(17, 255, 0)'};
	param[1] = {axis: 'y', rot: new THREE.Vector3(0, 0, Math.PI/2), color: 'rgb(247, 72, 72)'};
	param[2] = {axis: 'z', rot: new THREE.Vector3(Math.PI/2, 0, 0), color: 'rgb(72, 116, 247)'};	
	
	for ( var i = 0; i < param.length; i++ )
	{
		var material = new THREE.MeshBasicMaterial({ color: param[i].color, depthTest: false, transparent: true, opacity: 1.0 });
		material.visible = false;
		//var material = new THREE.MeshBasicMaterial({ color: param[i].color });
		var obj = new THREE.Mesh( geometry_1, material );
		obj.userData.tag = 'gizmo'; 
		obj.userData.axis = param[i].axis;		
		obj.rotation.set( param[i].rot.x, param[i].rot.y, param[i].rot.z );	
		
	
		var obj2 = new THREE.Mesh( geometry_2, new THREE.MeshPhongMaterial({ color: param[i].color, depthTest: false, transparent: true, clippingPlanes : [ new THREE.Plane() ], lightMap: lightMap_1 }) );
		obj2.renderOrder = 3;
		//obj2.visible = false;
		obj2.material.clippingPlanes[0].copy(new THREE.Plane());
		obj.add( obj2 );
		
		
		gizmo.add( obj );
	}
	
	scene.add( gizmo );

	
	gizmo.visible = false;
	
	// Sphere
	var geometry = new THREE.SphereGeometry( 0.98*0.5, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0x000000, depthTest: false, transparent: true, opacity: 0.1} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.renderOrder = 3;
	gizmo.add( sphere );
	
	return gizmo;
}





// прячем текстуру если она находится за плоскостью 
function clippingGizmo360( objPop ) 
{
	var plane = new THREE.Plane();	
	
	if(camera == cameraTop)
	{
		plane = new THREE.Plane(new THREE.Vector3(0,1,0), 100);
		infProject.tools.gizmo.children[0].children[0].material.clippingPlanes[0].copy(plane);		
	}
	else
	{
		var group = new THREE.Group();

		if(objPop.userData.tag == 'joinPoint')	// разъем
		{
			group.position.copy(objPop.getWorldPosition(new THREE.Vector3()));   
		}
		else if(objPop.userData.obj3D.group && infProject.settings.active.group)	// группа
		{
			group.position.copy(objPop.userData.obj3D.group.userData.groupObj.centerObj.getWorldPosition(new THREE.Vector3()));  
		}		
		else	// объект
		{
			group.position.copy(objPop.position);
		}
		
		group.lookAt(camera.position);
		group.rotateOnAxis(new THREE.Vector3(0,1,0), -Math.PI / 2);
		group.updateMatrixWorld();
		
		
		//var dir = new THREE.Vector3().subVectors( camera.position, objPop.position ).normalize();
		//var qt = quaternionDirection(dir.clone());
		//var mx = new THREE.Matrix4().compose(objPop.position, qt, new THREE.Vector3(1,1,1));
		//plane.applyMatrix4(mx);	
		plane.applyMatrix4(group.matrixWorld);	
		
		infProject.tools.gizmo.children[0].children[0].material.clippingPlanes[0].copy(plane);
		infProject.tools.gizmo.children[1].children[0].material.clippingPlanes[0].copy(plane);
		infProject.tools.gizmo.children[2].children[0].material.clippingPlanes[0].copy(plane);	
		
		//showHelperNormal(objPop)		
	}

}





// кликнули на gizmo
function clickGizmo( intersect )
{	
	
	
	var gizmo = infProject.tools.gizmo;
	
	clickO.move = intersect.object; 	// gizmo

	var obj = gizmo.userData.gizmo.obj;			
	var axis = intersect.object.userData.axis;
	gizmo.userData.gizmo.active.axis = axis;
	

	if(obj.userData.tag == 'joinPoint')		// разъем
	{
		gizmo.userData.gizmo.active.startPos = obj.getWorldPosition(new THREE.Vector3());   
	}
	else if(obj.userData.obj3D.group && infProject.settings.active.group)		// группа
	{
		gizmo.userData.gizmo.active.startPos = obj.userData.obj3D.group.userData.groupObj.centerObj.getWorldPosition(new THREE.Vector3());
	}	
	else								// объект
	{
		obj.updateMatrixWorld();
		gizmo.userData.gizmo.active.startPos = obj.localToWorld( obj.geometry.boundingSphere.center.clone() );			
	}	
	
	if(axis == 'y')
	{
		var dr = new THREE.Vector3( 0, 1, 0 );
		var rotY = -Math.PI/2;
	}	
	else if(axis == 'z')
	{	
		var dr = new THREE.Vector3( 0, 1, 0 );
		var rotY = Math.PI;
	}
	else if(axis == 'x')
	{
		var dr = new THREE.Vector3( 1, 0, 0 );
		var rotY = Math.PI/2;
	}

	
	planeMath.position.copy( gizmo.position );		
	
	if(camera == cameraTop)
	{
		planeMath.rotation.set(Math.PI/2, 0, 0);
	}
	else
	{
		if(obj.userData.tag == 'joinPoint')	// разъем
		{
			setPlaneQ(obj, dr, rotY, false);   
		}		
		else if(obj.userData.obj3D.group && infProject.settings.active.group)	// группа
		{			
			setPlaneQ(obj.userData.obj3D.group.userData.groupObj.centerObj, dr, rotY, false);
		}
		else	// объект
		{
			setPlaneQ(obj, dr, rotY, false);
		}
	}
	
	
	function setPlaneQ(obj, dr, rotY, global)
	{
		if(global)	// глобальный gizmo
		{
			planeMath.quaternion.copy( new THREE.Quaternion().setFromAxisAngle( dr, rotY ) );
		}
		else		// локальный gizmo
		{
			var quaternion = new THREE.Quaternion().setFromAxisAngle( dr, rotY );							// создаем Quaternion повернутый на выбранную ось	
			var q2 = obj.getWorldQuaternion(new THREE.Quaternion()).clone().multiply( quaternion );			// умножаем на предведущий Quaternion			
			planeMath.quaternion.copy( q2 );																		
		}
	}

	
	planeMath.updateMatrixWorld();
	var dir = planeMath.worldToLocal( intersect.point.clone() );	
	gizmo.userData.gizmo.active.rotY = Math.atan2(dir.x, dir.y);	
}




function moveGizmo( event )
{	
	var intersects = rayIntersect( event, planeMath, 'one' );	 	 
	if(intersects.length == 0) return;
	
	
	var gizmo = infProject.tools.gizmo;
	
	var obj = gizmo.userData.gizmo.obj;  
	var axis = gizmo.userData.gizmo.active.axis;
	
	if(axis == 'x'){ var dr = new THREE.Vector3( 0, 1, 0 ); }
	else if(axis == 'y'){ var dr = new THREE.Vector3( 1, 0, 0 ); }
	else if(axis == 'z'){ var dr = new THREE.Vector3( 0, 0, 1 ); }
	
	
	
	var dir = planeMath.worldToLocal( intersects[ 0 ].point.clone() );	
	var rotY = Math.atan2(dir.x, dir.y);
	
	
	
	if(camera == cameraTop) 
	{ 
		if(obj.userData.obj3D.group && infProject.settings.active.group)	// группа объектов
		{
			var arr = obj.userData.obj3D.group.userData.groupObj.child;
			
			// глобальный gizmo
			for(var i = 0; i < arr.length; i++)
			{
				arr[i].position.sub(gizmo.userData.gizmo.active.startPos);
				arr[i].position.applyAxisAngle(dr, rotY - gizmo.userData.gizmo.active.rotY); // rotate the POSITION
				arr[i].position.add(gizmo.userData.gizmo.active.startPos);				
				
				arr[i].rotateOnWorldAxis(dr, rotY - gizmo.userData.gizmo.active.rotY);				
			}
		}
		else
		{
			obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), rotY - gizmo.userData.gizmo.active.rotY);
		}		 
	}
	else 
	{ 
		
		if(obj.userData.tag == 'joinPoint')		// разъем
		{ 
			if(obj.parent.userData.obj3D.group && infProject.settings.active.group)
			{
				var arr = obj.parent.userData.obj3D.group.userData.groupObj.child; 
				
				rotateO({obj: arr, dr: dr, rotY: rotY, centerO: obj});
			}
			else
			{
				rotateO({obj: [obj.parent], dr: dr, rotY: rotY, centerO: obj});
			}
			
		}			
		else if(obj.userData.obj3D.group && infProject.settings.active.group)	// группа 
		{
			var arr = obj.userData.obj3D.group.userData.groupObj.child;
			var centerObj = obj.userData.obj3D.group.userData.groupObj.centerObj;
			
			rotateO({obj: arr, dr: dr, rotY: rotY, centerO: centerObj});
		}
		else	// объект 
		{
			rotateO({obj: [obj], dr: dr, rotY: rotY, centerO: obj});
		}		 
	}		
	
	// вращение объекта или объектов 
	function rotateO(cdm)
	{
		var centerO = cdm.centerO;
		var arr = cdm.obj;
		var dr = cdm.dr;
		var rotY = cdm.rotY;		
		
		centerO.updateMatrixWorld();		
		var v1 = centerO.localToWorld( dr.clone() );
		var v2 = centerO.getWorldPosition(new THREE.Vector3());
		var dir = new THREE.Vector3().subVectors(v1, v2).normalize();	// локальный dir , глобальный -> dr new THREE.Vector3( 0, 1, 0 )								

		for(var i = 0; i < arr.length; i++)
		{
			arr[i].position.sub(gizmo.userData.gizmo.active.startPos);
			arr[i].position.applyAxisAngle(dir, rotY - gizmo.userData.gizmo.active.rotY); // rotate the POSITION
			arr[i].position.add(gizmo.userData.gizmo.active.startPos);				
			
			arr[i].rotateOnWorldAxis(dir, rotY - gizmo.userData.gizmo.active.rotY);								
		}		
	}
	
			
	
	gizmo.userData.gizmo.active.rotY = rotY; 
	
	// поворот самого gizmo
	if(camera != cameraTop) 
	{ 
		if(obj.userData.tag == 'joinPoint')
		{
			gizmo.quaternion.copy( obj.getWorldQuaternion(new THREE.Quaternion()) );
		}
		else if(obj.userData.obj3D.group && infProject.settings.active.group)	// группа объектов
		{
			var centerObj = obj.userData.obj3D.group.userData.groupObj.centerObj;
			gizmo.quaternion.copy( centerObj.getWorldQuaternion(new THREE.Quaternion()) );
		}
		else
		{
			gizmo.rotation.copy( obj.rotation );
		}		 
	}
	
	
	upMenuRotateObjPop(obj);
}




// обновляем в меню rotate
function upMenuRotateObjPop(obj) 
{	
	if(obj.userData.tag == 'joinPoint')		// разъем
	{ 
		if(obj.parent.userData.obj3D.group && infProject.settings.active.group)		// группа
		{
			obj = obj.parent.userData.obj3D.group.userData.groupObj.centerObj; 
		}
		else		// объект 
		{
			obj = obj.parent;
		}
		
	}			
	else if(obj.userData.obj3D.group && infProject.settings.active.group)	// группа 
	{
		obj = obj.userData.obj3D.group.userData.groupObj.centerObj;
	}
	else	// объект 
	{
		
	}
	
	$('[nameId="object_rotate_X"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.x) ) );
	$('[nameId="object_rotate_Y"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.y) ) );
	$('[nameId="object_rotate_Z"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.z) ) );	
}


