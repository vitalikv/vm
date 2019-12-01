


// создаем копию стены (для ThreeBSP), но без перемещаемого окна/двери (запускается один раз в момент, когда начали перемещать окно/дверь)
// 1. обновляем стену до простой стены без окон/дверей
// 2. добавляем откосы
// 3. вырезаем отверстия для окон/дверей , кроме перемещаемого окна/двери
function clickMoveWD_BSP( wd, wall )  
{
	
	
	if(!wall) { wall = wd.userData.door.wall; }	// делаем отверстия для всех wd, кроме выделенного 
	else {  }	// делаем отверстия для всех wd
	
	var p1 = wall.userData.wall.p[0].position;
	var p2 = wall.userData.wall.p[1].position;	
	var d = p1.distanceTo( p2 );		
	
	wall.geometry = createGeometryWall(d, wall.userData.wall.height_1, wall.userData.wall.width, wall.userData.wall.offsetZ);	// обновляем стену до простой стены
	
	// добавляем откосы
	var v = wall.geometry.vertices;
	
	for ( var i = 0; i < v.length; i++ ) { v[i] = wall.userData.wall.v[i].clone(); }
	
	//wall.updateMatrixWorld();

	upUvs_1( wall ); 
	
	// вырезаем отверстия для окон/дверей
	var arrO = wall.userData.wall.arrO;
	
	for ( var n = 0; n < arrO.length; n++ )
	{
		if(arrO[n] == wd) continue;
		
		var objClone = createCloneWD_BSP( arrO[n] ); 

		var wdBSP = new ThreeBSP( objClone );    
		var wallBSP = new ThreeBSP( wall ); 			// копируем выбранную стену	
		var newBSP = wallBSP.subtract( wdBSP );		// вычитаем из стены объект нужной формы		
		wall.geometry = newBSP.toGeometry();	
	}
	
	if(arrO.length > 1 || wd == null)
	{
		wall.geometry.computeFaceNormals();

		for ( var i = 0; i < wall.geometry.faces.length; i++ )
		{
			wall.geometry.faces[i].normal.normalize();
			if(wall.geometry.faces[i].normal.z == 1) { wall.geometry.faces[i].materialIndex = 1; }
			else if(wall.geometry.faces[i].normal.z == -1) { wall.geometry.faces[i].materialIndex = 2; }
			else if(wall.geometry.faces[i].normal.y == 1) { wall.geometry.faces[i].materialIndex = 3; }
			else if(wall.geometry.faces[i].normal.y == -1) { wall.geometry.faces[i].materialIndex = 3; }
		}		
	}			
	
	return wall; 
}




// создаем форму окна/двери (для boolean), чуть шире стены
function createCloneWD_BSP( wd )
{
	//
	var obj = new THREE.Mesh();
	obj.geometry = wd.geometry.clone(); 
	obj.position.copy( wd.position );
	obj.rotation.copy( wd.rotation );
	
	//var width = wd.userData.door.width / 2 + 0.3;
	var minZ = wd.userData.door.form.v.minZ;
	var maxZ = wd.userData.door.form.v.maxZ;
	
	var v = obj.geometry.vertices;
	
	for ( var i = 0; i < minZ.length; i++ ) { v[minZ[i]].z -= 3.2; }
	for ( var i = 0; i < maxZ.length; i++ ) { v[maxZ[i]].z += 3.2; }

	return obj;		
}



// вырезаем отверстие под окно/дверь 
function MeshBSP( wd, objsBSP, wall )
{  
	if(!wall) wall = wd.userData.door.wall;
	
	var wallClone = objsBSP.wall;
	var wdClone = objsBSP.wd;
	
	wdClone.position.copy( wd.position );

	var wdBSP = new ThreeBSP( wdClone );    
	var wallBSP = new ThreeBSP( wallClone ); 			// копируем выбранную стену	
	var newBSP = wallBSP.subtract( wdBSP );				// вычитаем из стены объект нужной формы
	
	wall.geometry.dispose();	
	
	wall.geometry = newBSP.toGeometry();	
	
	wall.geometry.computeFaceNormals();
 
	for ( var i = 0; i < wall.geometry.faces.length; i++ )
	{
		wall.geometry.faces[i].normal.normalize();
		if(wall.geometry.faces[i].normal.z == 1) { wall.geometry.faces[i].materialIndex = 1; }
		else if(wall.geometry.faces[i].normal.z == -1) { wall.geometry.faces[i].materialIndex = 2; }
		else if(wall.geometry.faces[i].normal.y == 1) { wall.geometry.faces[i].materialIndex = 3; }
		else if(wall.geometry.faces[i].normal.y == -1) { wall.geometry.faces[i].materialIndex = 3; }
	}
	
}

 
 
 
 // создаем копии стен (для ThreeBSP) без окон/дверей (запускается один раз, когда начали перемещать точку)
function clickMovePoint_BSP( arrW ) 
{
	
	
	for ( var i = 0; i < arrW.length; i++ )
	{
		var wall = arrW[i]; 
		
		if(wall.userData.wall.arrO.length == 0) continue;
		
		var p1 = wall.userData.wall.p[0].position;
		var p2 = wall.userData.wall.p[1].position;	
		var d = p1.distanceTo( p2 );		
		
		wall.geometry = createGeometryWall(d, wall.userData.wall.height_1, wall.userData.wall.width, wall.userData.wall.offsetZ);	// обновляем стену до простой стены		
		 
		// добавляем откосы
		var v = wall.geometry.vertices;
		for ( var i2 = 0; i2 < v.length; i2++ ) { v[i2] = wall.userData.wall.v[i2].clone(); }	
		wall.geometry.verticesNeedUpdate = true;
		wall.geometry.elementsNeedUpdate = true;	
		wall.geometry.computeBoundingSphere();
	}
}
 
 
// сняли клик, после перемещения точки (вставляем wd)
function clickPointUP_BSP( arrW )   
{
	
	
	for ( var i = 0; i < arrW.length; i++ )
	{
		var wall = arrW[i];
		
		for ( var i2 = 0; i2 < wall.userData.wall.arrO.length; i2++ )
		{
			var wd = wall.userData.wall.arrO[i2];
			
			var wdClone = createCloneWD_BSP( wd );
			
			objsBSP = { wall : wall, wd : wdClone };		
			
			MeshBSP( wd, objsBSP );			
		}
		
		upUvs_1( wall ); 
	}
} 





 
 

// подсчитываем площадь стены
function calculationSpaceWall( wall, index )
{
	wall.updateMatrixWorld();
	
	var v = wall.userData.wall.v;		
	
	var h = v[1].y;	
	
	if(index == 1)
	{
		var x = v[v.length - 6].x - v[0].x;
	}
	else if(index == 2)
	{
		var x = v[v.length - 2].x - v[4].x;
	}	
	
	var space = Math.round((x * h) * 100) / 100;
	
	var length = x;
	var spaceArrO = 0;
	
	for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
	{
		var v = wall.userData.wall.arrO[i].geometry.vertices;
		var h = v[1].y;
		var x = Math.abs(v[0].x * 2);
		spaceArrO += Math.round((x * h) * 100) / 100;
	}
	
	space = space - spaceArrO;	
	
	return { area : space, length : length }; 
}
 

 



// считаем и показываем длину стены
function upLabelPlan_1(arrWall, Zoom)
{
	
	if(Zoom){}
	else if(typeof Zoom !== "undefined") { Zoom = false; }
	
	for ( var i = 0; i < arrWall.length; i ++ )
	{
		var wall = arrWall[i];
		
		if(infProject.settings.wall.label == 'outside' || infProject.settings.wall.label == 'inside')
		{
			var label_1 = wall.label[0]; 
		}
		else
		{
			var label_2 = wall.label[0];
			var label_1 = wall.label[1];			
		}
		
		
		if(Zoom) { var v = wall.userData.wall.v; }		// если это zoom, то берем старые значения	
		else { var v = wall.geometry.vertices; }
		
		
		var p1 = wall.userData.wall.p[0].position;
		var p2 = wall.userData.wall.p[1].position;

		
		if(!Zoom)
		{
			if(infProject.settings.wall.label == 'outside' || infProject.settings.wall.label == 'inside')
			{
				if(infProject.settings.wall.dist == 'inside')
				{
					var dist = Math.abs( v[10].x - v[4].x );
				}
				else if(infProject.settings.wall.dist == 'outside')
				{
					var dist = Math.abs( v[6].x - v[0].x );
				}				
				else
				{
					var dist = p1.distanceTo( p2 );
				}							
				
				upLabelCameraWall({label : label_1, text : Math.round(dist * 100) / 100, sizeText : 85, color : 'rgba(0,0,0,1)'});
			}
			else
			{
				var v = wall.geometry.vertices;
				var d1 = Math.abs( v[6].x - v[0].x );		
				var d2 = Math.abs( v[10].x - v[4].x );

				upLabelCameraWall({label : label_1, text : Math.round(d1 * 100) / 100, sizeText : 85, color : 'rgba(0,0,0,1)'});
				upLabelCameraWall({label : label_2, text : Math.round(d2 * 100) / 100, sizeText : 85, color : 'rgba(0,0,0,1)'});				
			}			
		}		
		
		var dir = new THREE.Vector3().subVectors( p2, p1 );
		var rotY = Math.atan2(dir.x, dir.z);
		var pos = dir.divideScalar ( 2 ).add( p1 );
		
		if(rotY <= 0.001){ rotY += Math.PI / 2;  }
		else { rotY -= Math.PI / 2; }
		
		 
		var v1 = wall.label[0].geometry.vertices;
		
		var x1 = p2.z - p1.z;
		var z1 = p1.x - p2.x;		 
		 
		 
		if(infProject.settings.wall.label == 'outside' || infProject.settings.wall.label == 'inside')
		{
			label_1.rotation.set( 0, rotY, 0 );
			
			var side = (infProject.settings.wall.label == 'outside') ? 1 : 2;
			
			if(wall.userData.wall.room.side2[side])
			{ 
				var dir = new THREE.Vector3().addScaledVector( new THREE.Vector3(x1, 0, z1).normalize(), -v[4].z + (v1[1].z - v1[0].z) / 2 );
			}
			else
			{
				var dir = new THREE.Vector3().addScaledVector( new THREE.Vector3(x1, 0, z1).normalize(), -v[0].z - (v1[1].z - v1[0].z) / 2 );
			}
			
			dir.y = 0.05;
			label_1.position.copy( new THREE.Vector3().addVectors( pos, dir ) );				
		}
		else
		{
			label_1.rotation.set( 0, rotY, 0 );
			label_2.rotation.set( 0, rotY, 0 );

			var dir = new THREE.Vector3().addScaledVector( new THREE.Vector3(x1, 0, z1).normalize(), -v[0].z - (v1[1].z - v1[0].z) / 2 );
			dir.y = 0.05;
			label_1.position.copy( new THREE.Vector3().addVectors( pos, dir ) );

			var dir = new THREE.Vector3().addScaledVector( new THREE.Vector3(x1, 0, z1).normalize(), -v[4].z + (v1[1].z - v1[0].z) / 2 );
			dir.y = 0.05;
			label_2.position.copy( new THREE.Vector3().addVectors( pos, dir ) );			
		}		 


		if(!Zoom)	// если это не zoom, то обновляем значения
		{
			var v = wall.geometry.vertices; wall.geometry.verticesNeedUpdate = true;
			for ( var i2 = 0; i2 < v.length; i2++ ) { wall.userData.wall.v[i2] = v[i2].clone(); }	// обновляем vertices		
		}
		
		getWallAreaTop( wall );
	}
	
	

}



// подсчитваем объем у ленточного фундамента
function calculationAreaFundament_2(wall)
{
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai'){}
	else { return; }
	
	var fundament = [];
	for ( var i = 0; i < obj_line.length; i++ )
	{
		var zone = obj_line[i].userData.wall.zone;
		
		var exist = false;
		
		for ( var i2 = 0; i2 < fundament.length; i2++ )
		{
			if(fundament[i2] == zone) { exist = true; break; }
		}
		
		if(!exist) { fundament[fundament.length] = zone; }
	}
	
	infProject.scene.array.fundament = fundament;
	
	for ( var i = 0; i < fundament.length; i++ )
	{
		
		var points = fundament[i].points;
		var walls = fundament[i].walls;
		var label = fundament[i].label;
		
		var sum = 0;
		for ( var i2 = 0; i2 < walls.length; i2++ )
		{
			sum += walls[i2].userData.wall.area.top;
		}
		
		sum = Math.round(sum * 100)/100;

		var pos = new THREE.Vector3();
		
		for (i2 = 0; i2 < points.length; i2++) { pos.x += points[i2].position.x; pos.z += points[i2].position.z; }				
		
		label.position.set(pos.x / points.length, 0.2, pos.z / points.length);		
		
		upLabelArea2(label, sum, '80', 'rgba(255,255,255,1)', true);			
	}			
	
}



//площадь стены сверху
function getWallAreaTop( wall ) 
{	
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai'){}
	else { return; }
	
	var res = 0;
	var v = wall.userData.wall.v; 
	
	var v = [v[0], v[6], v[8], v[10], v[4], v[2]];
	
	for (var i = 0; i < v.length - 1; i++)
	{
		var n1 = i - 1;
		var n2 = i + 1;
		
		if(i == 0) { n1 = v.length - 1; n2 = i + 1; }
		else if(i == v.length - 1) { n1 = i - 1; n2 = 0; }
		
		
		var sum = v[i].x*(v[n1].z - v[n2].z); 
		sum = Math.round(sum * 100) / 100;
		res += sum;			
	}
	
	res = Math.abs( res ) / 2;
	//res = Math.round(res * 100) / 100;			
	
	wall.userData.wall.area.top = res;
}



//площадь помещения ( номер зон получаем из массива )
function getYardageSpace( room ) 
{	 
	if(!infProject.settings.floor.o) { return; }	
	
	for (var u = 0; u < room.length; u++)
	{  
		var arrW = room[u].w; 
		var arrP = room[u].p;  
		var arrS = room[u].s;
		var n = arrW.length;
		var res = 0;
		
		if(infProject.settings.floor.areaPoint == 'inside')
		{
			for (i = 0; i < n; i++) { arrW[i].updateMatrixWorld(); }
			
			for (i = 0; i < n; i++) 
			{
				var ch = (arrS[i] == 0) ? 4 : 6;
				
				var p1 = arrW[i].localToWorld( arrW[i].userData.wall.v[ ch ].clone() );		
				
				if (i == 0) 
				{
					var ch1 = (arrS[ n-1 ] == 0) ? 4 : 6; 
					var ch2 = (arrS[ i+1 ] == 0) ? 4 : 6;
					
					var p2 = arrW[n-1].localToWorld( arrW[n-1].userData.wall.v[ ch1 ].clone() );
					var p3 = arrW[i+1].localToWorld( arrW[i+1].userData.wall.v[ ch2 ].clone() );						
				}
				else if (i == n-1) 
				{
					var ch1 = (arrS[ i-1 ] == 0) ? 4 : 6;
					var ch2 = (arrS[ 0 ] == 0) ? 4 : 6;
					
					var p2 = arrW[i-1].localToWorld( arrW[i-1].userData.wall.v[ ch1 ].clone() );
					var p3 = arrW[0].localToWorld( arrW[0].userData.wall.v[ ch2 ].clone() );									
				}
				else 
				{
					var ch1 = (arrS[ i-1 ] == 0) ? 4 : 6;
					var ch2 = (arrS[ i+1 ] == 0) ? 4 : 6;
					
					var p2 = arrW[i-1].localToWorld( arrW[i-1].userData.wall.v[ ch1 ].clone() );
					var p3 = arrW[i+1].localToWorld( arrW[i+1].userData.wall.v[ ch2 ].clone() );							
				}
				
				var sum = p1.x*(p2.z - p3.z); 
				sum = Math.round(sum * 100) * 10;
				res += sum;				
			}			
		}
		else
		{
			for (i = 0; i < arrW.length; i++)
			{
				var p1 = (arrS[i] == 0) ? arrW[i].userData.wall.p[0].position : arrW[i].userData.wall.p[1].position;	
				
				if (i == 0) 
				{
					var p2 = (arrS[ n-1 ] == 0) ? arrW[n-1].userData.wall.p[0].position : arrW[n-1].userData.wall.p[1].position; 
					var p3 = (arrS[ i+1 ] == 0) ? arrW[i+1].userData.wall.p[0].position : arrW[i+1].userData.wall.p[1].position;						
				}
				else if (i == n-1) 
				{
					var p2 = (arrS[ i-1 ] == 0) ? arrW[i-1].userData.wall.p[0].position : arrW[i-1].userData.wall.p[1].position;
					var p3 = (arrS[ 0 ] == 0) ? arrW[0].userData.wall.p[0].position : arrW[0].userData.wall.p[1].position;								
				}
				else 
				{
					var p2 = (arrS[ i-1 ] == 0) ? arrW[i-1].userData.wall.p[0].position : arrW[i-1].userData.wall.p[1].position; 
					var p3 = (arrS[ i+1 ] == 0) ? arrW[i+1].userData.wall.p[0].position : arrW[i+1].userData.wall.p[1].position; 						
				}
				
				var sum = p1.x*(p2.z - p3.z); 
				sum = Math.round(sum * 100) * 10;
				res += sum;				
			}			
		}

		
		res = Math.abs( res ) / 2;
		res = Math.round(res / 10) / 100;
		
		var sumX = 0;
		var sumZ = 0;
		for (i = 0; i < n; i++) { sumX += arrP[i].position.x; }
		for (i = 0; i < n; i++) { sumZ += arrP[i].position.z; }		
		
		
		room[u].label.position.set(sumX / n, 0.2, sumZ / n);
		
		room[u].userData.room.areaTxt = res;
		
		if(res < 0.5) { res = ''; }
		
		upLabelArea2(room[u].label, res, '80', 'rgba(255,255,255,1)', true);
		
		if(infProject.settings.floor.label) room[u].label.visible = true;
	}	
}



//площадь многоугольника (нужно чтобы понять положительное значение или отрецательное, для того чтобы понять напрвление по часовой или проитв часовой)
function checkClockWise( arrP )
{  
	var res = 0;
	var n = arrP.length;
	
	for (i = 0; i < n; i++) 
	{
		var p1 = arrP[i].position;
		
		if (i == 0)
		{
			var p2 = arrP[n-1].position;
			var p3 = arrP[i+1].position;					
		}
		else if (i == n-1)
		{
			var p2 = arrP[i-1].position;
			var p3 = arrP[0].position;			
		}
		else
		{
			var p2 = arrP[i-1].position;
			var p3 = arrP[i+1].position;			
		}
		
		res += p1.x*(p2.z - p3.z);
	}
	
	
	res = res / 2;
	res = Math.round(res * 10) / 10;
	
	return res;
}





 







function createGrid(cdm)
{
	var lineGrid = new THREE.Group();
	
	var size = (cdm.size) ? cdm.size : 1.0;
	size = Math.round(size * 100)/100; 
	var count = (cdm.count) ? cdm.count : (15/size);
	
	var color = 0xd6d6d6;
	var color = 0xcccccc;	
	if(cdm.color) { color = cdm.color; }	
	
	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { color: color, opacity: 1 } );
	
	var ofsset = (count * size) / 2;
	
	// длина линии, центр по середине
	geometry.vertices.push(new THREE.Vector3( -ofsset, 0, 0 ) );	
	geometry.vertices.push(new THREE.Vector3( ofsset, 0, 0 ) );


	for ( var i = 0; i <= count; i ++ ) 
	{
		var line = new THREE.Line( geometry, material );
		line.position.z = ( i * size ) - ofsset;
		lineGrid.add( line );

		var line = new THREE.Line( geometry, material );
		line.position.x = ( i * size ) - ofsset;
		line.rotation.y = 90 * Math.PI / 180;
		lineGrid.add( line );
		
		//
	}
	
	scene.add( lineGrid );	

	
	lineGrid.userData.mouse = { down: false, move: false, up: false, startPos: new THREE.Vector3() };
	lineGrid.userData.size = size;
	lineGrid.userData.count = count;
	lineGrid.userData.color = (cdm.uColor) ? cdm.uColor : lineGrid.children[0].material.color.clone();

	
	$('[nameid="size-grid-tube-xy-1"]').val(Math.round(size * 100));	// перводим в см	
	
	
	if(cdm.pos)
	{
		if(cdm.pos.x) lineGrid.position.x = cdm.pos.x;
		if(cdm.pos.y) lineGrid.position.y = cdm.pos.y;
		if(cdm.pos.z) lineGrid.position.z = cdm.pos.z;
	}
	
	return lineGrid;
}


// обновляем размер ячейки
function updateGrid(cdm)
{
	var grid = infProject.scene.grid.obj;
	
	var size = checkNumberInput({ value: cdm.size, unit: 0.01, limit: {min: 0.05, max: 5} });
	
	if(!size) 
	{
		var size = grid.userData.size * 100; // перводим в см
		$('[nameid="size-grid-tube-xy-1"]').val(size);
		
		return;
	}
	
	var size = size.num;
	
	var pos = grid.position.clone();
	var color = grid.children[0].material.color.clone();
	var uColor = grid.userData.color.clone();
	var count = grid.userData.count;
	
	scene.remove( grid );
	
	infProject.scene.grid.obj = createGrid({pos: pos, color: color, size: size, uColor : uColor});
	
	renderCamera();
}


// показываем скрываем сетку
function showHideGrid()
{
	var grid = infProject.scene.grid.obj;
	
	if(grid.visible)
	{
		grid.visible = false;
		
		if(infProject.scene.grid.active) { startEndMoveGrid(); }
		
		infProject.scene.grid.show = false;
	}
	else
	{
		grid.visible = true;
		infProject.scene.grid.show = true;
	}
}



// вкл/выкл режим перемещения grid
function startEndMoveGrid()
{
	var grid = infProject.scene.grid.obj;
	
	if(!infProject.scene.grid.active)
	{
		for(var i = 0; i < grid.children.length; i++)
		{
			grid.children[i].material.color = new THREE.Color(infProject.listColor.active2D);
		}
		
		infProject.scene.grid.active = true;		
	}
	else
	{
		for(var i = 0; i < grid.children.length; i++)
		{
			grid.children[i].material.color = grid.userData.color.clone();
		}

		infProject.scene.grid.active = false;
	}
}



function clickDownGrid(event)
{
	var grid = infProject.scene.grid.obj;
	
	var intersects = rayIntersect( event, planeMath, 'one' );
	
	if(intersects.length == 0) return;

	//grid.userData.mouse.startPos = intersects[0].point.clone();
	grid.userData.mouse.offset = new THREE.Vector3().subVectors( intersects[0].point, grid.position );
	grid.userData.mouse.down = true;
}


function moveGrid(event)
{
	var grid = infProject.scene.grid.obj;
	
	if(!grid.userData.mouse.down) return;
	
	var intersects = rayIntersect( event, planeMath, 'one' );
	
	if(intersects.length == 0) return;

	grid.position.x = intersects[0].point.x - grid.userData.mouse.offset.x;
	grid.position.z = intersects[0].point.z - grid.userData.mouse.offset.z;

	return true;
}



// сняли клик после перемещения grid
function clickUpGrid()
{
	var grid = infProject.scene.grid.obj;
	
	grid.userData.mouse.down = false;
}



// вкл/выкл привязке к сетки
function linkGrid()
{
	var flag = !infProject.scene.grid.link;
	
	infProject.scene.grid.link = flag;
}








// определяем число ли это или нет
function isNumeric(n) 
{   
   return !isNaN(parseFloat(n)) && isFinite(n);   
   // Метод isNaN пытается преобразовать переданный параметр в число. 
   // Если параметр не может быть преобразован, возвращает true, иначе возвращает false.
   // isNaN("12") // false 
}



// проверка пересеклась ли стена с другой стеной (когда тащим точку)
function crossLineOnLine_1(point)
{
	for ( var i = 0; i < point.w.length; i++ )
	{
		for ( var i2 = 0; i2 < obj_line.length; i2++ )
		{
			if(point.w[i] == obj_line[i2]) { continue; }
			
			if(Math.abs(point.position.y - obj_line[i2].userData.wall.p[0].position.y) > 0.3) continue;		// проверка высоты этажа
			
			var p0 = point.w[i].userData.wall.p[0].position;
			var p1 = point.w[i].userData.wall.p[1].position;
			var p2 = obj_line[i2].userData.wall.p[0].position;
			var p3 = obj_line[i2].userData.wall.p[1].position;
			
			if(intersectWall_3(p0, p1, p2, p3)) { return true; }	// стены пересеклись
		}
	}
	
	return false;  // стены не пересеклись
}



// точка пересечения двух прямых 2D
function crossPointTwoLine(a1, a2, b1, b2)
{
	var t1 = DirectEquation(a1.x, a1.z, a2.x, a2.z);
	var t2 = DirectEquation(b1.x, b1.z, b2.x, b2.z);

	var point = new THREE.Vector3();
	var f1 = DetMatrix2x2(t1[0], t1[1], t2[0], t2[1]);
	
	if(Math.abs(f1) < 0.0001){ return new THREE.Vector3(a2.x, 0, a2.z); } 
	
	point.x = DetMatrix2x2(-t1[2], t1[1], -t2[2], t2[1]) / f1;
	point.z = DetMatrix2x2(t1[0], -t1[2], t2[0], -t2[2]) / f1;	
	
	//if(Math.abs(f1) < 0.0001){ point = new THREE.Vector3(a1.x, 0, a1.z);  }	 
	
	return point;
}



// точка пересечения двух прямых 2D с доп.параметром = паралельны ли линии или нет
function crossPointTwoLine_2(a1, a2, b1, b2)
{
	var t1 = DirectEquation(a1.x, a1.z, a2.x, a2.z);
	var t2 = DirectEquation(b1.x, b1.z, b2.x, b2.z);
	var f1 = DetMatrix2x2(t1[0], t1[1], t2[0], t2[1]);
	
	if(Math.abs(f1) < 0.0001)
	{ 
		var s1 = new THREE.Vector3().subVectors( a1, b1 );
		var s2 = new THREE.Vector3().addVectors( s1.divideScalar( 2 ), b1 );
		
		return [new THREE.Vector3(s2.x, 0, s2.z), true]; // паралельны
	} 
	
	var point = new THREE.Vector3();
	point.x = DetMatrix2x2(-t1[2], t1[1], -t2[2], t2[1]) / f1;
	point.z = DetMatrix2x2(t1[0], -t1[2], t2[0], -t2[2]) / f1;	
	
	//if(Math.abs(f1) < 0.0001){ point = new THREE.Vector3(a1.x, 0, a1.z);  }	 
	
	return [point, false];
}



// точка пересечения двух прямых 2D
function crossPointTwoLine_3(a1, a2, b1, b2)
{
	var t1 = DirectEquation(a1.x, a1.z, a2.x, a2.z);
	var t2 = DirectEquation(b1.x, b1.z, b2.x, b2.z);

	var point = new THREE.Vector3();
	var f1 = DetMatrix2x2(t1[0], t1[1], t2[0], t2[1]);
	
	if(Math.abs(f1) < 0.0001){ return [new THREE.Vector3(a2.x, 0, a2.z), true]; } // параллельны 
	
	point.x = DetMatrix2x2(-t1[2], t1[1], -t2[2], t2[1]) / f1;
	point.z = DetMatrix2x2(t1[0], -t1[2], t2[0], -t2[2]) / f1;			 
	
	return [point, false];
}



function DirectEquation(x1, y1, x2, y2)
{
	var a = y1 - y2;
	var b = x2 - x1;
	var c = x1 * y2 - x2 * y1;

	return [ a, b, c ];
}

	
function DetMatrix2x2(x1, y1, x2, y2)
{
	return x1 * y2 - x2 * y1;
}


// Проверка двух отрезков на пересечение (ориентированная площадь треугольника)
function CrossLine(a, b, c, d)
{
	return intersect_1(a.x, b.x, c.x, d.x) && intersect_1(a.z, b.z, c.z, d.z) && area_1(a, b, c) * area_1(a, b, d) <= 0 && area_1(c, d, a) * area_1(c, d, b) <= 0;
}

function intersect_1(a, b, c, d)
{
	if (a > b) { var res = swap(a, b); a = res[0]; b = res[1]; }
	if (c > d) { var res = swap(c, d); c = res[0]; d = res[1]; }
	return Math.max(a, c) <= Math.min(b, d);
}

function area_1(a, b, c) { return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x); }

// меняем местами 2 значения
function swap(a, b) { var c; c = a; a = b; b = c; return [a, b]; }






 
// проекция точки(С) на прямую (A,B)
function spPoint(A,B,C){
    var x1=A.x, y1=A.z, x2=B.x, y2=B.z, x3=C.x, y3=C.z;
    var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
    var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
    var x = x1 + u * px, z = y1 + u * py;
    return {x:x, y:0, z:z}; 
} 


// опредяляем, надодится точка D за пределами прямой или нет (точка D пересекает прямую АВ, идущая перпендикулярна от точки С)  
function calScal(A,B,C)
{	
	var AB = { x : B.x - A.x, y : B.z - A.z }
	var CD = { x : C.x - A.x, y : C.z - A.z }
	var r1 = AB.x * CD.x + AB.y * CD.y;				// скалярное произведение векторов

	var AB = { x : A.x - B.x, y : A.z - B.z }
	var CD = { x : C.x - B.x, y : C.z - B.z }
	var r2 = AB.x * CD.x + AB.y * CD.y;

	var cross = (r1 < 0 | r2 < 0) ? false : true;	// если true , то точка D находится на отрезке AB	
	
	return cross;
}

 
// расстояние от точки до прямой
function lengthPointOnLine(p1, p2, M)
{	
	var urv = DirectEquation(p1.x, p1.z, p2.x, p2.z);
	
	var A = urv[0];
	var B = urv[1];
	var C = urv[2];
	
	return Math.abs( (A * M.x + B * M.z + C) / Math.sqrt( (A * A) + (B * B) ) );
}



//https://ru.stackoverflow.com/questions/464787/%D0%A2%D0%BE%D1%87%D0%BA%D0%B0-%D0%B2%D0%BD%D1%83%D1%82%D1%80%D0%B8-%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE%D1%83%D0%B3%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%B0


//Точка внутри многоугольника
function checkPointInsideForm(point, arrP)
{
	var p = arrP;
	var result = false;
	var j = p.length - 1;
	for (var i = 0; i < p.length; i++) 
	{
		if ( (p[i].position.z < point.position.z && p[j].position.z >= point.position.z || p[j].position.z < point.position.z && p[i].position.z >= point.position.z) &&
			 (p[i].position.x + (point.position.z - p[i].position.z) / (p[j].position.z - p[i].position.z) * (p[j].position.x - p[i].position.x) < point.position.x) )
			result = !result;
		j = i;
	}
	
	return result;
}


// сравнить позиционирование
function comparePos(pos1, pos2)
{
	var x = pos1.x - pos2.x;
	var y = pos1.y - pos2.y;
	var z = pos1.z - pos2.z;
	
	var equals = true;
	if(Math.abs(x) > 0.01){ equals = false; }
	if(Math.abs(y) > 0.01){ equals = false; }
	if(Math.abs(z) > 0.01){ equals = false; }

	return equals;
}






// пускаем луч и определяем к какой комнате принадлежит объект
function rayFurniture( obj ) 
{
	obj.updateMatrixWorld();
	obj.geometry.computeBoundingSphere();
	
	//var pos = obj.position.clone();
	var pos = obj.localToWorld( obj.geometry.boundingSphere.center.clone() );
	pos.y = 1;
	
	var ray = new THREE.Raycaster();
	ray.set( pos, new THREE.Vector3(0, -1, 0) );
	
	var intersects = ray.intersectObjects( room, true );	
	
	var floor = (intersects.length == 0) ? null : intersects[0].object				
	
	return { id : (floor) ? floor.userData.id : 0, obj : floor };
}



 


// если point.userData.point.type != null , то добавляем точку/создаем стену
function clickCreateWall(point) 
{
	var obj = point.userData.point.cross;
	
	if(!obj) return;
	
	if(point.userData.point.type == 'create_wall')
	{ 
		if(obj.userData.tag == 'planeMath') { addPoint_6( point ); } 
		else if(obj.userData.tag == 'point') { addPoint_4( point ); }
		else if(obj.userData.tag == 'wall') { addPoint_5( obj, point ); } 
	}
	else if(point.userData.point.type == 'continue_create_wall') 
	{ 
		if(obj.userData.tag == 'planeMath') { addPoint_4( point ); }
		else if(obj.userData.tag == 'wall') { addPoint_5( obj, point ); }
		else if(obj.userData.tag == 'point') { addPoint_4( point ); }
	}	
	else if(point.userData.point.type == 'add_point')
	{  
		if(obj.userData.tag == 'wall') { addPoint_5( obj, point ); } 
	}
	else
	{   
		if(!turnBackPosPoint(point))
		{ 
			if(obj.userData.tag == 'planeMath') { movePointWallPlaneMath(point); }
			else if(obj.userData.tag == 'point') { addPoint_4( point ); }
			else if(obj.userData.tag == 'wall') { addPoint_5( obj, point ); }	 		
		}
	}
	
	point.userData.point.cross = null;
}


// отпускаем перетаскиваемую точку на planeMath
function movePointWallPlaneMath(point) 
{
	updateShapeFloor(point.zone); 
	
	clickPointUP_BSP(param_wall.wallR);
}


// возращаем перетаскиваемую точку на прежнее место
function turnBackPosPoint(point)
{
	var flag = false;
	var crossObj = point.userData.point.cross;
	
	if(crossObj.userData.tag == 'point' || crossObj.userData.tag == 'wall')
	{  
		if(point.w.length > 1)
		{
			if(Math.abs(point.position.y - crossObj.position.y) < 0.3) { flag = true; }			// у перетаскиваемой точки больше одной стены
		}		
	}
		
	
	if(crossLineOnLine_1(point)) { flag = true; }	// стена пересекласть с другой стеной
	
	
	if(flag)
	{
		undoRedoChangeMovePoint( point, param_wall.wallR ); 			
		
				
	}
	
	return flag;
}




// находим общую стену у двух точек
function findCommmonWallPoint(point1, point2)
{
	var wall = null;
	
	for ( var i = 0; i < point1.p.length; i++ )
	{
		if(point1.p[i] == point2) { wall = point1.w[i]; break; }
	}

	return wall;
}



// разделение стены на две половины по центру 
function addPointCenterWall()
{
	var wall = clickO.obj;
	clickO.obj = null;
	objDeActiveColor_2D();
	
	var pos1 = wall.userData.wall.p[0].position;
	var pos2 = wall.userData.wall.p[1].position;
	
	var pos = new THREE.Vector3().subVectors( pos2, pos1 ).divideScalar( 2 ).add(pos1); 
	var point = createPoint( pos, 0 );
	
	addPoint_1( wall, point );
}


// добавляем точку на стену (разбиваем стену)
function addPoint_1( wall, point )
{	 
	clickO.move = null;					
	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false;																
	  
	point.userData.point.last.cdm = 'add_point';
	
	var walls = splitWalls( wall, point )	

	point.userData.point.type = null; 

	return point;
}



// определяем с какой стороны окна/двери на стене (в момент, когда мы разделяем стену точкой)
function wallLeftRightWD(wall, posx)
{
	var arrL = [], arrR = [];
	
	for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
	{		
		var v = wall.worldToLocal( wall.userData.wall.arrO[i].position.clone() );
		
		if (v.x <= posx){ arrL[arrL.length] = wall.userData.wall.arrO[i]; }
		else { arrR[arrR.length] = wall.userData.wall.arrO[i]; }
	}	

	return { wall_1 : arrL, wall_2 : arrR };
}



// разбиваем стену точкой, на 2 стены
// разбиваему стену удаляем, на её месте создаем 2 новых стены
function splitWalls( wall, point )
{
	// собираем данные о стене
	var width = wall.userData.wall.width;
	var height = wall.userData.wall.height_1;
	var offsetZ = wall.userData.wall.offsetZ;
	var material = wall.material;   
	var p1 = { id : wall.userData.wall.p[0].userData.id, pos : wall.userData.wall.p[0].position.clone() };
	var p2 = { id : wall.userData.wall.p[1].userData.id, pos : wall.userData.wall.p[1].position.clone() };
	
	 
	var arrW_2 = [];
	var point1 = wall.userData.wall.p[0];
	var point2 = wall.userData.wall.p[1];
	for ( var i = 0; i < point1.w.length; i++ ) { if(point1.w[i] == wall) { continue; } arrW_2[arrW_2.length] = point1.w[i]; }
	for ( var i = 0; i < point2.w.length; i++ ) { if(point2.w[i] == wall) { continue; } arrW_2[arrW_2.length] = point2.w[i]; }
	
	if(point.p.length > 0)
	{ 
		for ( var i = 0; i < point.p[0].w.length; i++ )
		{
			for ( var i2 = 0; i2 < arrW_2.length; i2++ )
			{
				if(point.p[0].w[i] == arrW_2[i2]) continue;
				
				arrW_2[arrW_2.length] = point.p[0].w[i]; break;
			}
		}		
	}
	var wallC = point.w[0];
	var point_0 = point.p[0];
	
	var arrW = (point.userData.point.last.cdm == 'add_point') ? [wall] : detectChangeArrWall_3(wallC);
	clickMovePoint_BSP( arrW );	
	
	// определяем с какой стороны (справа/слева) окна/двери (если есть) относительно точки
	wall.updateMatrixWorld();
	var ps = wall.worldToLocal( point.position.clone() );	
	var wd = wallLeftRightWD(wall, ps.x);	// собираем данные об окнах/дверях, принадлежащие разделяемой стене 

	// замыкаем стену (а не просто создаем точку на стене)  
	if(point.userData.point.last.cdm == 'new_point_2' || point.userData.point.last.cdm == 'new_point')
	{	
		var zone = rayFurniture( point.w[0] ).obj;
		var oldZ_1 = findNumberInArrRoom(zone);
	}

	var v2 = wall.userData.wall.v;
	for ( var i2 = 0; i2 < wall.userData.wall.v.length; i2++ ) { v2[i2] = wall.userData.wall.v[i2].clone(); }

	var oldZones = detectCommonZone_1( wall );   	// определяем с какими зонами соприкасается стена
	var oldZ = findNumberInArrRoom( oldZones );
	deleteArrZone( oldZones );						// удаляем зоны  с которыми соприкасается стена					
	
	deleteWall_3( wall, {dw : 'no delete'} );  							// удаляем разделяемую стену (без удаления зон)(без удаления окон/дверей)	
	
	// находим точки (если стена была отдельна, то эти точки удалены и их нужно заново создать)
	var point1 = findObjFromId( 'point', p1.id );
	var point2 = findObjFromId( 'point', p2.id );	
	
	if(point1 == null) { point1 = createPoint( p1.pos, p1.id ); }
	if(point2 == null) { point2 = createPoint( p2.pos, p2.id ); }		
	
	// создаем 2 новых стены
	var wall_1 = createOneWall3( point1, point, width, { offsetZ : offsetZ, height : height } );	 			
	var wall_2 = createOneWall3( point, point2, width, { offsetZ : offsetZ, height : height } );

	// накладываем материал
	wall_1.material = [ material[0].clone(), material[1].clone(), material[2].clone(), material[3].clone() ];  
	wall_2.material = [ material[0].clone(), material[1].clone(), material[2].clone(), material[3].clone() ];
	wall_1.userData.material = [ material[0].clone(), material[1].clone(), material[2].clone(), material[3].clone() ]; 
	wall_2.userData.material = [ material[0].clone(), material[1].clone(), material[2].clone(), material[3].clone() ]; 
	
	for ( var i = 0; i < v2.length/2; i++ ) { wall_1.userData.wall.v[i] = v2[i].clone(); wall_1.geometry.vertices[i] = v2[i].clone(); }
	
	var sub = v2[8].x - wall_2.userData.wall.v[8].x;
	for ( var i = v2.length/2; i < v2.length; i++ ) { v2[i].x -= sub; } 
	for ( var i = v2.length/2; i < v2.length; i++ ) { wall_2.userData.wall.v[i] = v2[i].clone(); wall_2.geometry.vertices[i] = v2[i].clone(); }
	
	var arrW = (point.userData.point.last.cdm == 'add_point') ? [wall_1, wall_2] : detectChangeArrWall_3(wallC);
	
	if(point.userData.point.last.cdm == 'add_point')
	{
		upLineYY_2(point, point.p, point.w, point.start);
	}
	else
	{
		upLineYY_2(point, point.p, point.w, point.start);
		upLineYY_2(point_0, point_0.p, point_0.w, point_0.start);
	}
	
	upLabelPlan_1(arrW); 	
	clickPointUP_BSP( arrW );
	
	var newZones = detectRoomZone();		// создаем пол, для новых помещений	
	
	// передаем параметры старых зон новым	(название зоны)	
	var flag = false;
	if(point.userData.point.last.cdm == 'new_point_2' || point.userData.point.last.cdm == 'new_point') { if(zone) { flag = true; } }	// если замыкаем стену, то проверяем, есть ли пересечение с помещением
	
	if(flag) { assignOldToNewZones_2(newZones, oldZ_1[0], true); } 
	else { assignOldToNewZones_1(oldZ, newZones, 'add'); }		
	
	
	// вставляем окна/двери
	for ( var i = 0; i < wd.wall_1.length; i++ ) 
	{ 
		var obj = wd.wall_1[i];
		
		obj.userData.door.wall = wall_1;
		wall_1.userData.wall.arrO[wall_1.userData.wall.arrO.length] = obj; 
		
		objsBSP = { wall : wall_1, wd : createCloneWD_BSP( obj ) };				
		MeshBSP( obj, objsBSP ); 		
	} 
	
	for ( var i = 0; i < wd.wall_2.length; i++ ) 
	{ 
		var obj = wd.wall_2[i];
		
		obj.userData.door.wall = wall_2;
		wall_2.userData.wall.arrO[wall_2.userData.wall.arrO.length] = obj; 
		
		objsBSP = { wall : wall_2, wd : createCloneWD_BSP( obj ) };				
		MeshBSP( obj, objsBSP ); 	
	} 	
	
	
	return [wall_1, wall_2];
}





// 1. кликнули на точку, создаем новую стену из этой точки (создаем стену: от точки)
// 2. продолжаем создавать новую стену
// 3. заканчиваем создание новой стены на точке 
// 4. замыкание старой точки с другой точкой
function addPoint_4( point )
{ 	
	if(Math.abs(point.position.y - point.userData.point.cross.position.y) > 0.3) { movePointWallPlaneMath(point); return; }
	
	if(point.userData.point.type == 'create_wall')			// 1
	{		 	
		var wall = createOneWall3( point, point.userData.point.cross, width_wall, {} ); 		 
		point.userData.point.type = 'continue_create_wall';
		point.userData.point.cross.userData.point.last.cdm = 'new_wall_from_point';
		clickO.move = point;
		clickMovePoint_BSP( point.userData.point.cross.w );	
		
	}
	else if(point.userData.point.type == 'continue_create_wall') 
	{ 
		if(point.userData.point.cross == planeMath)		// 2
		{	
			if(crossLineOnLine_1(point)) return; 	// произошло пересечение с другой стеной
			
			var inf = infProject.settings.calc.fundament;
			if(inf == 'lent' || inf == 'svai')  
			{				
				if(!point.w[0].userData.wall.zone) { createWallZone(point.w[0]); }
			}
			
			
			point.userData.point.type = null; 			
			var point2 = createPoint( point.position, 0 );			
			var wall = createOneWall3( point, point2, width_wall, {} ); 			
			clickO.move = point2;
			upLabelPlan_1( point.p[0].w );			
			point2.userData.point.type = 'continue_create_wall'; 

			if(point.p[0].userData.point.last.cdm == 'new_point_1' || point.p[0].userData.point.last.cdm == 'new_wall_from_point')
			{
				clickPointUP_BSP( point.p[0].w );				
			}			
			
			
		} 
		else if(point.userData.point.cross.userData.tag == 'point')		// 3
		{			
			if(point.userData.point.cross.userData.point.last.cdm == 'new_point_1' && clickO.move.userData.point.cross == point || point.userData.point.cross == point.p[0])
			{ 
				deleteWall_2(point.w[0]);
				clickO.move = null;
				clickO = resetPop.clickO();
			}						
			else
			{
				addPointOption_4(point);
			}			
		}
	} 
	else if(!point.userData.point.type) 	// 4
	{ 	
		addPointOption_4(point);		
	}

	param_wall.wallR = point.w;
}


function addPointOption_4(point)
{	
	if(turnBackPosPoint(point)) { return; }		// стена пересекласть с другой стеной				

	clickMovePoint_BSP( point.userData.point.cross.w );
	
	var wall = point.w[0];
	var point1 = point.userData.point.cross;
	var point2 = point.p[0];								

	var m = point1.p.length; 
	point1.p[m] = point2;
	point1.w[m] = wall;
	point1.start[m] = point.start[0];
	
	var m = point2.p.length; 
	point2.p[m] = point1;
	point2.w[m] = wall;
	point2.start[m] = (point.start[0] == 0) ? 1 : 0;
			
	var m = (wall.userData.wall.p[0] == point) ? 0 : 1;	
	wall.userData.wall.p[m] = point1;
	
	deleteOneOnPointValue(point2, wall);			
	deletePointFromArr(point);
	scene.remove(point);

	upLineYY_2(point1, point1.p, point1.w, point1.start);
	upLabelPlan_1( point1.w ); 

	splitZone(wall);   
	
	if(!point.userData.point.type) 
	{ 
		 		
		
		if(wall.userData.wall.p[0] == point1) { var p1 = [point1, point2]; var p2 = [point, point2]; }
		else { var p1 = [point2, point1]; var p2 = [point2, point]; }							 
	} 
	else if(point.userData.point.cross.userData.tag == 'point') 
	{ 
		 
	}	
	
	var arrW = [];
	for ( var i = 0; i < point1.w.length; i++ ) { arrW[arrW.length] = point1.w[i]; }
	
	//if(!point.userData.point.type)
	if(1==1)	
	{
		for ( var i = 0; i < point2.w.length; i++ ) 
		{ 
			var flag = true;
			
			for ( var i2 = 0; i2 < arrW.length; i2++ ) 
			{
				if(point2.w[i] == arrW[i2]) { flag = false; break; }
			}
			
			if(flag) arrW[arrW.length] = point2.w[i];
		}		
	}
	
	clickPointUP_BSP( arrW );
	
	if(point.w.length > 0) { createWallZone(point.w[0]); }
	
	clickO.move = null;
}


 


// 1. разбиваем стену (вкл режим резбить стену)
// 2. заканчиваем создание стены пересекаясь с другой стеной, отключаем режим создания стены 
// 3. создаем новую стену: от стены
// 4. перетаскиваем старую стену и соединяем с другой стеной
function addPoint_5( wall, point )
{ 
	if(Math.abs(point.position.y - point.userData.point.cross.position.y) > 0.3) { movePointWallPlaneMath(point); return; }
	
	if(point.userData.point.type == 'add_point')			// 1 
	{    
		addPoint_1( wall, point ); 
		
	}
	else if(point.userData.point.type == 'continue_create_wall')			// 2
	{
						 

		point.userData.point.last.cdm = 'new_point_2'; 
		
		var arrW = splitWalls( wall, point );
		
		// для undo/redo и для отмены правой кнопкой 
		point.userData.point.last.cross = 
		{ 
			walls : 
			{ 
				old : wall.userData.id,  
				new : 
				[ 
					{ id : arrW[0].userData.id, p2 : { id : arrW[0].userData.wall.p[0].userData.id } }, 
					{ id : arrW[1].userData.id, p2 : { id : arrW[1].userData.wall.p[1].userData.id }  } 
				] 
			} 
		};			
		
		point.userData.point.type = null; 		
		
		clickO.move = null; 		
	}
	else if(point.userData.point.type == 'create_wall')		// 3
	{	
		
		point.userData.point.type = null;
		point.userData.point.last.cdm = 'new_point_1'; 
		var point1 = point;		
		var point2 = createPoint( point.position.clone(), 0 );			 							
		
		point2.userData.point.cross = point1;
		
		var newWall = createOneWall3( point1, point2, width_wall, {} ); 
		var arrW = splitWalls( wall, point1 );
		
		// для undo/redo и для отмены правой кнопкой 
		point.userData.point.last.cross = 
		{ 
			walls : 
			{ 
				old : wall.userData.id,  
				new : 
				[ 
					{ id : arrW[0].userData.id, p2 : { id : arrW[0].userData.wall.p[0].userData.id } }, 
					{ id : arrW[1].userData.id, p2 : { id : arrW[1].userData.wall.p[1].userData.id }  } 
				] 
			} 
		};			
		
		clickMovePoint_BSP( point1.w );

		clickO.move = point2;
		point2.userData.point.type = 'continue_create_wall'; 				 
	}
	else if(!point.userData.point.type)		// 4
	{		
		 			
		
		var p1 = point.p[0];
		var selectWall = point.w[0];
		
		point.userData.point.last.cdm = 'new_point';
		
		var arrW = splitWalls( wall, point );		 
		
		var arrW2 = p1.w;
		
		for ( var i = 0; i < p1.w.length; i++ ) 
		{ 
			var flag = true;
			
			for ( var i2 = 0; i2 < arrW2.length; i2++ ) 
			{
				if(p1.w[i] == arrW2[i2]) { flag = false; break; }
			}
			
			if(flag) arrW2[arrW2.length] = p1.w[i];
		}
		
		clickPointUP_BSP( arrW2 );	

		// для undo/redo и для отмены правой кнопкой 
		point.userData.point.last.cross = 
		{ 
			walls : 
			{ 
				old : wall.userData.id,  
				new : 
				[ 
					{ id : arrW[0].userData.id, p2 : { id : arrW[0].userData.wall.p[0].userData.id } }, 
					{ id : arrW[1].userData.id, p2 : { id : arrW[1].userData.wall.p[1].userData.id }  } 
				] 
			} 
		};		  	  
		
		clickO.move = null;
	}

	param_wall.wallR = point.w;
	
	if(point.w.length > 0) { createWallZone(point.w[0]); } 
}





//создаем стену: в любом месте (не на стене и не на точке)
function addPoint_6( point1 )
{  		
	point1.userData.point.type = null;		
	var point2 = createPoint( point1.position.clone(), 0 );			
	point2.userData.point.type = 'continue_create_wall';
	
	var wall = createOneWall3( point1, point2, width_wall, {} );		
	
	clickO.move = point2; 
	
	param_wall.wallR = [wall];
}





 





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
		
	//default vertices
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
	
	if(obj.userData.tag == 'window') { obj.userData.door.lotid = 1; }
		
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
	
	
	
	
	
	objPop.position.set(0,0,0);
	objPop.rotation.set(0,0,0);
	//objPop.position.set(center.x/objPop.scale.x, center.y/objPop.scale.y, center.z/objPop.scale.z);
	//objPop.position.copy(centerWD);

	// изменяем у ПОП объекта ширину/высоту/центрируем 
	if(1==1)
	{
		wd.updateMatrixWorld();
		wd.geometry.computeBoundingBox();
		wd.geometry.computeBoundingSphere();
		var x = wd.geometry.boundingBox.max.x - wd.geometry.boundingBox.min.x;
		var y = wd.geometry.boundingBox.max.y - wd.geometry.boundingBox.min.y;		
		
		objPop.geometry.computeBoundingBox();		
		var dX = objPop.geometry.boundingBox.max.x - objPop.geometry.boundingBox.min.x;
		var dY = objPop.geometry.boundingBox.max.y - objPop.geometry.boundingBox.min.y;				
		
		objPop.scale.set(x/dX, y/dY, 1);			
	}
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
 


 

var isMouseDown1 = false;
var isMouseRight1 = false;
var isMouseDown2 = false;
var isMouseDown3 = false;
var onMouseDownPosition = new THREE.Vector2();
var long_click = false;
var lastClickTime = 0;
var catchTime = 0.30;
var vk_click = '';





function mouseDownRight()
{
	
	clickO.buttonAct = null;
	clickO.button = null; 
	
	var obj = clickO.move;
	
	if(obj)
	{
		if(obj.userData.tag == 'free_dw') { scene.remove(obj); }
		
		if(obj.userData.tag == 'point') 
		{ 	
			if(obj.w.length == 0){ deleteOnePoint(obj); }  
			else 
			{ 
				if(obj.userData.point.type == 'continue_create_wall')
				{
					var point = obj.p[0]; 
					deleteWall_2(obj.w[0]); 
					//upLabelPlan_1([point.w[0]]);					
				}
				
				if(point.userData.point.last.cdm == 'new_point_1') { deletePoint( point ).wall.userData.id = point.userData.point.last.cross.walls.old; }
			}
		}
		else if(obj.userData.tag == 'obj')
		{
			deleteObjectPop(obj); 
		}		

		clickO = resetPop.clickO();
	}	
	
	clickO.move = null;	
}



function onDocumentMouseDown( event ) 
{
	//event.preventDefault();

	if (window.location.hostname == 'vm'){} 
	else if (window.location.hostname == 'remstok'){} 
	else if (window.location.hostname == 'remstok.ru'){} 
	else { return; }
 
	long_click = false;
	lastClickTime = new Date().getTime();

	
	if(event.changedTouches)
	{
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		vk_click = 'left';
	}	

	switch ( event.button ) 
	{
		case 0: vk_click = 'left'; break;
		case 1: vk_click = 'right'; /*middle*/ break;
		case 2: vk_click = 'right'; break;
	}


	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false;

	clickSetCamera2D( event, vk_click );
	clickSetCamera3D( event, vk_click );


	if ( vk_click == 'right' ) { mouseDownRight( event ); return; } 

	// вкл режим перемещения grid
	if(infProject.scene.grid.active) { clickDownGrid(event); return; }


	if(clickO.move)
	{
		if(clickO.move.userData.tag == 'point') 
		{			
			if(clickO.move.userData.point.type) { clickCreateWall( clickO.move ); return; }  
		}
	}
	 
	clickO.obj = null; 	
	clickO.actMove = false;	
	clickO.rayhit = clickRayHit(event); 

	if ( camera == cameraTop ) { hideMenuObjUI_2D( clickO.last_obj ); }
	else if ( camera == camera3D ) {  }
	else if ( camera == cameraWall ) { hideMenuObjUI_Wall(clickO.last_obj); }
	
	clickMouseActive({type: 'down'});
	
	renderCamera();
}





function clickRayHit(event)
{ 
	var rayhit = null;	
			
	
	if(infProject.tools.pivot.visible)
	{
		var ray = rayIntersect( event, infProject.tools.pivot.children, 'arr' );
		if(ray.length > 0) { rayhit = ray[0]; return rayhit; }		
	}
	
	if(infProject.tools.gizmo.visible)
	{
		var arr = [];
		for ( var i = 0; i < 3; i++ ){ arr[i] = infProject.tools.gizmo.children[i]; }
		
		var ray = rayIntersect( event, arr, 'arr' );
		if(ray.length > 0) { rayhit = ray[0]; return rayhit; }		
	}

	if(!infProject.scene.block.click.controll_wd)
	{
		var ray = rayIntersect( event, arrSize.cube, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}
	
	if(!infProject.scene.block.click.door)
	{
		var ray = rayIntersect( event, infProject.scene.array.door, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}
	
	if(!infProject.scene.block.click.window)
	{
		var ray = rayIntersect( event, infProject.scene.array.window, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}
	
	if(!infProject.scene.block.click.point)
	{
		var ray = rayIntersect( event, infProject.scene.array.point, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}

	if(!infProject.scene.block.click.wall)
	{
		var ray = rayIntersect( event, infProject.scene.array.wall, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}

	
	if(!infProject.scene.block.click.obj)
	{
		var ray = rayIntersect( event, infProject.scene.array.obj, 'arr' );
		
		if(ray.length > 0)
		{   
			if(rayhit)
			{  
				if(rayhit.distance > ray[0].distance) { rayhit = ray[0]; }				
			}
			else 
			{
				rayhit = ray[0];
			}
		}			
	}
	
	
	return rayhit;
}


function clickMouseActive(cdm)
{
	if(!clickO.rayhit) return;

	var obj = clickO.obj = clickO.rayhit.object;
	
	var tag = obj.userData.tag;
	var rayhit = clickO.rayhit;
	var flag = true;
	
	if(cdm.type == 'down')
	{  
		if(clickToolWD(clickO.move)) { flag = false; }
		else if( tag == 'pivot' ) { clickPivot( rayhit ); }
		else if( tag == 'gizmo' ) { clickGizmo( rayhit ); } 
		else if( tag == 'wall' && camera == cameraTop ) { clickWall_2D( rayhit ); }
		else if( tag == 'wall' && camera == cameraWall ) { clickWall_3D( rayhit ); }
		else if( tag == 'point' ) { clickPoint( rayhit ); }
		else if( tag == 'window' ) { clickWD( rayhit ); }
		else if( tag == 'door' ) { clickWD( rayhit ); }
		else if( tag == 'controll_wd' ) { clickToggleChangeWin( rayhit ); }
		else if( tag == 'obj' && camera == cameraTop ) { clickObject3D( obj, {click_obj: true, menu_1: true, group: true, outline: true} ); }
		else { flag = false; }
	}
	else if(cdm.type == 'up')
	{		
		if( tag == 'wall' && camera == camera3D ) {  }
		else if( tag == 'obj' && camera == camera3D ) { clickObject3D( obj, {click_obj: true, menu_1: true, group: true, outline: true} ); }
		else { flag = false; }
	}	
	else 
	{ 
		flag = false; 
	}
	
	if(flag) 
	{
		if(camera == cameraTop)
		{
			objActiveColor_2D(obj);
			
			if(tag == 'wall') { showLengthWallUI( obj ); }
			else if(tag == 'point') { $('[nameId="point_menu_1"]').show(); }
			else if(tag == 'door') { showRulerWD( obj ); showTableWD( obj ); }
			else if(tag == 'window') { showRulerWD( obj ); showTableWD( obj ); }
			else if(tag == 'obj') { showObjUI( obj ); }
			else if(tag == 'pivot') { obj = infProject.tools.pivot.userData.pivot.obj; }
			else if(tag == 'gizmo') { obj = infProject.tools.gizmo.userData.gizmo.obj; }
		}		
		else if(camera == camera3D)
		{
			if(tag == 'wall') {  }
			else if(tag == 'obj') { showObjUI( obj ); }	
			else if(tag == 'pivot') { obj = infProject.tools.pivot.userData.pivot.obj; }
			else if(tag == 'gizmo') { obj = infProject.tools.gizmo.userData.gizmo.obj; }
		}
		else if(camera == cameraWall)
		{
			if(tag == 'wall') { showLengthWallUI( obj ); }
			else if(tag == 'controll_wd') { obj = obj.userData.controll_wd.obj; }
			else if(tag == 'window') { showRulerWD( obj ); showTableWD( obj ); }
			else if(tag == 'door') { showRulerWD( obj ); showTableWD( obj ); }						
		}
		
		
		clickO.last_obj = obj;
		
		consoleInfo( obj );
	}
}


function onDocumentMouseMove( event ) 
{ 
	if(event.changedTouches)
	{
		event.clientX = event.changedTouches[0].clientX;
		event.clientY = event.changedTouches[0].clientY;
		isMouseDown2 = true;
	}

	clickButton( event );
	
	if(infProject.scene.grid.active)	// вкл режим перемещения grid
	{
		if(moveGrid(event)) renderCamera();
		
		return;
	}	

	if ( !long_click ) { long_click = ( lastClickTime - new Date().getTime() < catchTime ) ? true : false; }

	var obj = clickO.move;
	
	if ( obj ) 
	{
		var tag = obj.userData.tag;
			
		if ( tag == 'pivot' ) { movePivot( event ); }
		else if ( tag == 'gizmo' ) { moveGizmo( event ); }
		else if ( tag == 'wall' ) { moveWall( event, obj ); }
		else if ( tag == 'window' ) { moveWD( event, obj ); }
		else if ( tag == 'door' ) { moveWD( event, obj ); }
		else if ( tag == 'controll_wd' ) { moveToggleChangeWin( event, obj ); }
		else if ( tag == 'point' ) { movePoint( event, obj ); }
		else if ( tag == 'room' ) { cameraMove3D( event ); }		
		else if ( tag == 'free_dw' ) { dragWD_2( event, obj ); }
		else if ( tag == 'obj' ) { moveObjectPop( event ); }
	}
	else 
	{
		if ( camera == camera3D ) { cameraMove3D( event ); }
		else if ( camera == cameraTop ) { moveCameraTop( event ); }
		else if ( camera == cameraWall ) { moveCameraWall2D( event ); }
	}
	

	activeHover2D( event );

	renderCamera();
}


function onDocumentMouseUp( event )  
{

	if(!long_click && camera == camera3D) 
	{ 
		hideMenuObjUI_3D( clickO.last_obj ); 
		clickMouseActive({type: 'up'}); 
	}
	
	
	var obj = clickO.move;	
	
	if(obj)  
	{
		var tag = obj.userData.tag;
		
		if(tag == 'point') 
		{  		
			var point = clickO.move;
			if(!clickO.move.userData.point.type) { clickCreateWall(clickO.move); }			
			clickPointMouseUp(point);
		}
		else if(tag == 'wall') { clickWallMouseUp(obj); }
		else if(tag == 'window' || obj.userData.tag == 'door') { clickWDMouseUp(obj); }	
		else if(tag == 'controll_wd') { clickMouseUpToggleWD(obj); } 
		else if(tag == 'obj') { clickMouseUpObject(obj); }
		
		if(tag == 'free_dw') {  }
		else if (tag == 'point') 
		{
			if(obj.userData.point.type) {  } 
			else { clickO.move = null; }
		}		
		else { clickO.move = null; }		
	}

	if(infProject.scene.grid.active) { clickUpGrid(); }		// вкл режим перемещения grid
	
	param_win.click = false;
	isMouseDown1 = false;
	isMouseRight1 = false;
	isMouseDown2 = false;
	isMouseDown3 = false;
	
	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false;	
	
	clickO.offset = new THREE.Vector3();
	
	renderCamera();
}





function hideMenuObjUI_2D( o )
{
	if(o)
	{ 
		objDeActiveColor_2D(); 
		
		switch ( o.userData.tag ) 
		{  
			case 'wall': hideMenuUI(o);  break;
			case 'point': hideMenuUI(o);  break;
			case 'door': hideSizeWD(o); hideMenuUI(o); break;
			case 'window': hideSizeWD(o); hideMenuUI(o); break;
			case 'obj': hidePivotGizmo(o); break;
		}
	}
	
	clickO.last_obj = null;
}



function hideMenuObjUI_3D( o )
{
	if ( o )
	{  		
		switch ( o.userData.tag ) 
		{
			case 'obj': hidePivotGizmo(o); break;
		}
	}
}




// скрываем меню (cameraWall)
function hideMenuObjUI_Wall(o)
{  
	if(!o) return;
	if(clickO.last_obj == clickO.obj) return;
	
	
	if(clickO.obj)
	{
		if(clickO.obj.userData.tag == 'controll_wd')
		{ 			
			if(clickO.obj.userData.controll_wd.obj == clickO.last_obj) { return; } 
		} 
	}	
	
	if(o.userData.tag)
	{
		var tag = o.userData.tag;
		
		if(tag == 'wall') { hideMenuUI(o); }
		else if(tag == 'window') { hideSizeWD(o); hideMenuUI(o); }
		else if(tag == 'door') { hideSizeWD(o); hideMenuUI(o); }	
	}
	
	clickO.last_obj = null;
}





function hideMenuUI(obj) 
{
	if(!obj) return;  
	if(!obj.userData) return;
	if(!obj.userData.tag) return;
	
	var tag = obj.userData.tag;
	
	if(tag == 'wall') { $('[nameId="wall_menu_1"]').hide(); }
	else if(tag == 'point') { $('[nameId="point_menu_1"]').hide(); }
	else if(tag == 'window') { $('[nameId="wd_menu_1"]').hide(); }
	else if(tag == 'door') { $('[nameId="wd_menu_1"]').hide(); }	
}




// по клику получаем инфу об объекте
function consoleInfo( obj )
{
	
	if(!obj) return;
	if(!obj.userData.tag) return;
	
	var tag = obj.userData.tag;
	
	if ( tag == 'room' ) 
	{
		var txt = '';
		//for ( var i = 0; i < obj.w.length; i++ ) { txt += '| ' + obj.w[i].userData.id; }
		for ( var i = 0; i < obj.p.length - 1; i++ ) { txt += '| ' + obj.p[i].userData.id; }
		
		
	}
	else if( tag == 'wall' )
	{ 
		
		 
	}
	else if( tag == 'point' )
	{ 
		 
	}
	else if( tag == 'window' || tag == 'door' )
	{ 
		var txt = {};		
		 
	}
	else if ( tag == 'controll_wd' ) 
	{
		
	}
	else if ( tag == 'obj' ) 
	{
		
	}		
	else 
	{
		
	}	
}



    


// переключение камеры
function changeCamera(cam)
{  
	deActiveSelected();
	
	camera = cam;
	renderPass.camera = cam;
	outlinePass.renderCamera = cam;

	
	if(camera == cameraTop)
	{				
		blockActiveObj({visible_1: false, visible_2: false});
		
		changeDepthColor();			
		cameraZoomTop( camera.zoom );
		if(infProject.scene.grid.show) infProject.scene.grid.obj.visible = true;		
		
		changeRightMenuUI_1({current: true});
	}
	else if(camera == camera3D)
	{	
		blockActiveObj({visible_1: true, visible_2: true});
		
		activeHover2D_2(); 
		cameraZoomTop( cameraTop.zoom );
		changeDepthColor();
		if(infProject.scene.grid.show) infProject.scene.grid.obj.visible = true;
		
		changeRightMenuUI_1({current: true});
	}
	else if(camera == cameraWall)
	{  
		if(infProject.scene.array.wall.length > 0)
		{  
			showRuleCameraWall();		// показываем линейки/размеры высоты/ширины стены 

			
			var wall = infProject.scene.array.wall[0]; 
			var index = 1;
			
			var x1 = wall.userData.wall.p[1].position.z - wall.userData.wall.p[0].position.z;
			var z1 = wall.userData.wall.p[0].position.x - wall.userData.wall.p[1].position.x;	
			var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены			
			var c = (index == 1) ? -100 : 100;	
			var pc = new THREE.Vector3().subVectors( arrWallFront.bounds.max.x, arrWallFront.bounds.min.x ).divideScalar( 2 ).add( arrWallFront.bounds.min.x );
			
			cameraWall.position.copy( pc );
			cameraWall.position.add(new THREE.Vector3().addScaledVector( dir, c )); 
			cameraWall.position.y = (arrWallFront.bounds.max.y.y - arrWallFront.bounds.min.y.y)/2 + arrWallFront.bounds.min.y.y;
			
			
			var rotY = Math.atan2(dir.x, dir.z);
			rotY = (index == 1) ? rotY + Math.PI : rotY;
			cameraWall.rotation.set(0, rotY, 0); 

			detectZoomScreenWall();		// выставляем cameraWall, так чтобы обхватывала всю стену			
		}
		else
		{
			cameraWall.position.set(0, 1, 15);
			cameraWall.rotation.set(0, 0, 0);
			cameraWall.zoom = 1.5;
		}
		

		cameraZoomWall();
		infProject.scene.grid.obj.visible = false;
		changeDepthColor();
	}
	
	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false;	

	clickO = resetPop.clickO();
	
	renderCamera();
}






// меняем уровень отрисовки объектов 
function changeDepthColor()
{
	if(camera == cameraTop)
	{
		var depthTest = false;
		var w2 = 1;
		var visible = true;
		var pillar = false;
		var visible_2 = true;
	}
	else if(camera == camera3D || camera == cameraWall)
	{
		var depthTest = true;
		var w2 = 0.0;
		var visible = false;
		var pillar = true;
		var visible_2 = false;
	}
	else { return; } 
	
	var point = infProject.scene.array.point;
	var wall = infProject.scene.array.wall;
	var window = infProject.scene.array.window;
	var door = infProject.scene.array.door;	
	
	for ( var i = 0; i < wall.length; i++ )
	{
		if(wall[i].children[0]) wall[i].children[0].visible = visible_2;	// скрываем штукатурку 
				
		for ( var i2 = 0; i2 < wall[i].label.length; i2++ )
		{
			wall[i].label[i2].visible = visible;
		}
	}
	
	for ( var i = 0; i < point.length; i++ )
	{ 
		point[i].visible = visible; 
		if(point[i].userData.point.pillar) 
		{
			point[i].userData.point.pillar.position.copy(point[i].position);
			point[i].userData.point.pillar.visible = pillar;
		}
	}		

	showHideArrObj(window, visible_2);
	showHideArrObj(door, visible_2);
	
}


// скрываем/показываем объекты
function showHideArrObj(arr, visible)
{	
	if(arr.length == 0) return;
	
	for ( var i = 0; i < arr.length; i++ ) { arr[i].material.visible = visible; }				
}





// выставляем zoom cameraWall, так чтобы обхватывала всю стену
function detectZoomScreenWall()  
{ 	
	cameraWall.zoom = 2;
	camera.updateMatrixWorld();
	camera.updateProjectionMatrix();
	
	var posX = { min : arrWallFront.bounds.min.x.clone(), max : arrWallFront.bounds.max.x.clone() };
	var posY = { min : arrWallFront.bounds.min.y.clone(), max : arrWallFront.bounds.max.y.clone() };
	
	posX.min.project(camera);
	posY.min.project(camera);	
	
	
	
	var x = 0.6/posX.min.x;
	var y = 0.6/posY.min.y;
	
	camera.zoom = (posX.min.x < posY.min.y) ? Math.abs(x) * 2 : Math.abs(y) * 2;    
	
	camera.updateMatrixWorld();
	camera.updateProjectionMatrix();
}

 





// блокируем/разблокируем объекты
function blockActiveObj(cdm)
{
	var visible_1 = cdm.visible_1;
	var visible_2 = cdm.visible_2;
	
	infProject.scene.block.click.wall = visible_1;
	infProject.scene.block.hover.wall = visible_1;

	infProject.scene.block.click.point = visible_1;
	infProject.scene.block.hover.point = visible_1;

	infProject.scene.block.click.window = visible_1;
	infProject.scene.block.hover.window = visible_1;

	infProject.scene.block.click.door = visible_1;
	infProject.scene.block.hover.door = visible_1;

	infProject.scene.block.click.room = visible_1;
	infProject.scene.block.hover.room = visible_1;

	infProject.scene.block.click.controll_wd = visible_1;
	infProject.scene.block.hover.controll_wd = visible_1;	
}



// прячем(уменьшаем)/показываем стены 
function showHideWallHeight_1(cdm)
{ 
	if(!cdm) cdm = {};
	
	if(cdm.active)
	{
		var txtButton = (infProject.settings.interface.button.showHideWall_1.active == 'Спрятать стены')?'Показать стены':'Спрятать стены';
	}
	else
	{
		var txtButton = infProject.settings.interface.button.showHideWall_1.active;	
		infProject.settings.interface.button.showHideWall_1.active = (txtButton == 'Спрятать стены')?'Показать стены':'Спрятать стены';
		
		$('[nameId="showHideWall_1"]').text(infProject.settings.interface.button.showHideWall_1.active);
	}
	
	
	if(txtButton == 'Спрятать стены') { changeAllHeightWall_1({height: 0.3}); }
	else { changeAllHeightWall_1({height: infProject.settings.height}); }
}



var type_browser = detectBrowser();
var newCameraPosition = null;


function updateKeyDown() 
{
	//if(docReady) if(infProject.activeInput) return;
	
	var flag = false;
	
	var keys = clickO.keys;  
	if(keys.length == 0) return;
	
	if ( camera == cameraTop )
	{
		if ( keys[ 87 ] || keys[ 38 ] ) 
		{
			camera.position.z -= 0.1;
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 83 ] || keys[ 40 ] ) 
		{
			camera.position.z += 0.1;
			newCameraPosition = null;
			flag = true;
		}
		if ( keys[ 65 ] || keys[ 37 ] ) 
		{
			camera.position.x -= 0.1;
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 68 ] || keys[ 39 ] ) 
		{
			camera.position.x += 0.1;
			newCameraPosition = null;
			flag = true;
		}
	}
	else if ( camera == camera3D ) 
	{
		if ( keys[ 87 ] || keys[ 38 ] ) 
		{
			var x = Math.sin( camera.rotation.y );
			var z = Math.cos( camera.rotation.y );
			var dir = new THREE.Vector3( -x, 0, -z );
			dir = new THREE.Vector3().addScaledVector( dir, 0.1 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 83 ] || keys[ 40 ] ) 
		{
			var x = Math.sin( camera.rotation.y );
			var z = Math.cos( camera.rotation.y );
			var dir = new THREE.Vector3( x, 0, z );
			dir = new THREE.Vector3().addScaledVector( dir, 0.1 );
			dir.addScalar( 0.0001 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
		if ( keys[ 65 ] || keys[ 37 ] ) 
		{
			var x = Math.sin( camera.rotation.y - 1.5707963267948966 );
			var z = Math.cos( camera.rotation.y - 1.5707963267948966 );
			var dir = new THREE.Vector3( x, 0, z );
			dir = new THREE.Vector3().addScaledVector( dir, 0.1 );
			dir.addScalar( 0.0001 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 68 ] || keys[ 39 ] ) 
		{
			var x = Math.sin( camera.rotation.y + 1.5707963267948966 );
			var z = Math.cos( camera.rotation.y + 1.5707963267948966 );
			var dir = new THREE.Vector3( x, 0, z );
			dir = new THREE.Vector3().addScaledVector( dir, 0.1 );
			dir.addScalar( 0.0001 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
		if ( keys[ 88 ] ) 
		{
			var dir = new THREE.Vector3( 0, 1, 0 );
			dir = new THREE.Vector3().addScaledVector( dir, -0.1 );
			dir.addScalar( 0.0001 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 67 ] ) 
		{
			var dir = new THREE.Vector3( 0, 1, 0 );
			dir = new THREE.Vector3().addScaledVector( dir, 0.1 );
			dir.addScalar( 0.0001 );
			camera.position.add( dir );
			centerCam.add( dir );
			newCameraPosition = null;
			flag = true;
		}
	}
	else if ( camera == cameraWall )
	{
		if ( keys[ 87 ] || keys[ 38 ] ) 
		{
			camera.position.y += 0.1;
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 83 ] || keys[ 40 ] ) 
		{
			camera.position.y -= 0.1;
			newCameraPosition = null;
			flag = true;
		}
		if ( keys[ 65 ] || keys[ 37 ] ) 
		{
			camera.position.x -= 0.1;
			newCameraPosition = null;
			flag = true;
		}
		else if ( keys[ 68 ] || keys[ 39 ] ) 
		{
			camera.position.x += 0.1;
			newCameraPosition = null;
			flag = true;
		}
	}

	if(flag) { renderCamera(); }
}

var radious = 10, theta = 90, onMouseDownTheta = 0, phi = 75, onMouseDownPhi = 75;
var centerCam = new THREE.Vector3( 0, 0, 0 );


function cameraMove3D( event )
{
	if ( camera3D.userData.camera.type == 'fly' )
	{
		if ( isMouseDown2 ) 
		{  
			newCameraPosition = null;
			radious = centerCam.distanceTo( camera.position );
			theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
			phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;
			phi = Math.min( 180, Math.max( -80, phi ) );

			camera.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
			camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
			camera.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );

			camera.position.add( centerCam );  
			camera.lookAt( centerCam );
			
			var gizmo = infProject.tools.gizmo;
			
			if(gizmo.visible) clippingGizmo360(gizmo.userData.gizmo.obj);
			
		}
		if ( isMouseDown3 )    
		{
			newCameraPosition = null;
			
			var intersects = rayIntersect( event, planeMath, 'one' );
			var offset = new THREE.Vector3().subVectors( camera3D.userData.camera.click.pos, intersects[0].point );
			camera.position.add( offset );
			centerCam.add( offset );
		}
	}
	else if ( camera3D.userData.camera.type == 'first' )
	{
		if ( isMouseDown2 )
		{
			newCameraPosition = null;
			var y = ( ( event.clientX - onMouseDownPosition.x ) * 0.006 );
			var x = ( ( event.clientY - onMouseDownPosition.y ) * 0.006 );

			camera.rotation.x -= x;
			camera.rotation.y -= y;
			onMouseDownPosition.x = event.clientX;
			onMouseDownPosition.y = event.clientY;

			var dir = camera.getWorldDirection();			
			//dir.y = 0;
			dir.normalize();
			dir.x *= camera3D.userData.camera.dist;
			dir.z *= camera3D.userData.camera.dist;
			dir.add( camera.position );
			dir.y = 0;
			
			centerCam.copy( dir ); 		
		}
	} 		
	
}



// кликаем левой кнопокой мыши (собираем инфу для перемещения камеры в 2D режиме)
function clickSetCamera2D( event, click )
{
	if ( camera == cameraTop || camera == cameraWall) { }
	else { return; }

	isMouseDown1 = true;
	isMouseRight1 = true;
	onMouseDownPosition.x = event.clientX;
	onMouseDownPosition.y = event.clientY;
	newCameraPosition = null;
	

	if(camera == cameraTop) 
	{
		planeMath.position.set(camera.position.x,0,camera.position.z);
		planeMath.rotation.set(-Math.PI/2,0,0);  
		planeMath.updateMatrixWorld();
		
		var intersects = rayIntersect( event, planeMath, 'one' );
		
		onMouseDownPosition.x = intersects[0].point.x;
		onMouseDownPosition.z = intersects[0].point.z;	 		
	}
	if(camera == cameraWall) 
	{
		var dir = camera.getWorldDirection();
		dir = new THREE.Vector3().addScaledVector(dir, 10);
		planeMath.position.copy(camera.position);  
		planeMath.position.add(dir);  
		planeMath.rotation.copy( camera.rotation ); 
		planeMath.updateMatrixWorld();

		var intersects = rayIntersect( event, planeMath, 'one' );	
		onMouseDownPosition.x = intersects[0].point.x;
		onMouseDownPosition.y = intersects[0].point.y;
		onMouseDownPosition.z = intersects[0].point.z;		 		
	}	
}


// 1. кликаем левой кнопокой мыши (собираем инфу для вращения камеры в 3D режиме)
// 2. кликаем правой кнопокой мыши (собираем инфу для перемещения камеры в 3D режиме и устанавливаем мат.плоскость)
function clickSetCamera3D( event, click )
{
	if ( camera != camera3D ) { return; }

	onMouseDownPosition.x = event.clientX;
	onMouseDownPosition.y = event.clientY;

	if ( click == 'left' )				// 1
	{
		//var dir = camera.getWorldDirection();
		var dir = new THREE.Vector3().subVectors( centerCam, camera.position ).normalize();
		
		// получаем угол наклона камеры к target (к точке куда она смотрит)
		var dergree = THREE.Math.radToDeg( dir.angleTo(new THREE.Vector3(dir.x, 0, dir.z)) ) * 2;	
		if(dir.y > 0) { dergree *= -1; }
		phi = dergree;  	
		
		
		// получаем угол направления (на плоскости) камеры к target 
		dir.y = 0; 
		dir.normalize();    
		theta = THREE.Math.radToDeg( Math.atan2(dir.x, dir.z) - Math.PI ) * 2;	
		
		
		isMouseDown2 = true;
		onMouseDownTheta = theta;
		onMouseDownPhi = phi;
	}
	else if ( click == 'right' )		// 2
	{
		isMouseDown3 = true;
		planeMath.position.copy( centerCam );
		planeMath.rotation.copy( camera.rotation );
		planeMath.updateMatrixWorld();

		var intersects = rayIntersect( event, planeMath, 'one' );	
		camera3D.userData.camera.click.pos = intersects[0].point;  
	}
}





function moveCameraTop( event ) 
{
	if(isMouseRight1 || isMouseDown1) {}
	else { return; }


	newCameraPosition = null;	
	
	var intersects = rayIntersect( event, planeMath, 'one' );
	
	camera.position.x += onMouseDownPosition.x - intersects[0].point.x;
	camera.position.z += onMouseDownPosition.z - intersects[0].point.z;	
}


// перемещение cameraWall
function moveCameraWall2D( event )
{
	if ( !isMouseRight1 ) { return; }

	var intersects = rayIntersect( event, planeMath, 'one' );
	
	camera.position.x += onMouseDownPosition.x - intersects[0].point.x;
	camera.position.y += onMouseDownPosition.y - intersects[0].point.y;	
	camera.position.z += onMouseDownPosition.z - intersects[0].point.z;
	
	newCameraPosition = null;	
}


// cameraZoom
function mousewheel( e )
{
	
	var delta = e.wheelDelta ? e.wheelDelta / 120 : e.detail ? e.detail / 3 : 0;

	if ( type_browser == 'Chrome' || type_browser == 'Opera' ) { delta = -delta; }

	if(camera == cameraTop) 
	{ 
		cameraZoomTop( camera.zoom - ( delta * 0.1 * ( camera.zoom / 2 ) ) ); 
	}
	else if(camera == camera3D) 
	{ 
		cameraZoom3D( delta, 1 ); 
	}
	else if(camera == cameraWall)
	{
		camera.zoom = camera.zoom - ( delta * 0.1 * ( camera.zoom / 2 ) );
		camera.updateProjectionMatrix();
		
		var k = 1 / camera.zoom;
		if ( k < 1 ) cameraZoomWall();				
	}
	
	setScalePivotGizmo();
	
	renderCamera();
}



// label zoom
function cameraZoomWall()
{				 
	var k = 1 / camera.zoom;
	if ( k > 1 ) k = 1;

	k *= kof_rd;		

	var n1 = 0.25 * k *2;
	var n2 = 0.125 * k *2;	
	var v1 = labelGeometry_1.vertices;
	v1[ 0 ].x = v1[ 1 ].x = -n1;
	v1[ 2 ].x = v1[ 3 ].x = n1;
	v1[ 1 ].y = v1[ 2 ].y = n2;
	v1[ 0 ].y = v1[ 3 ].y = -n2;
	labelGeometry_1.verticesNeedUpdate = true;
	labelGeometry_1.elementsNeedUpdate = true;
}



var zoomLoop = '';
function cameraZoomTopLoop() 
{
	var flag = false;
	
	if ( camera == cameraTop )
	{
		if ( zoomLoop == 'zoomOut' ) { cameraZoomTop( camera.zoom - ( 0.05 * ( camera.zoom / 2 ) ) ); flag = true; }
		if ( zoomLoop == 'zoomIn' ) { cameraZoomTop( camera.zoom - ( -0.05 * ( camera.zoom / 2 ) ) ); flag = true; }
	}
	else if ( camera == camera3D )
	{
		if ( zoomLoop == 'zoomOut' ) { cameraZoom3D( 0.3, 0.3 ); flag = true; }
		if ( zoomLoop == 'zoomIn' ) { cameraZoom3D( -0.3, 0.3 ); flag = true; }
	}
	else if ( camera == cameraWall )
	{
		if ( zoomLoop == 'zoomOut' ) { camera.zoom = camera.zoom - ( 0.4 * 0.1 * ( camera.zoom / 2 ) ); flag = true; }
		if ( zoomLoop == 'zoomIn' ) { camera.zoom = camera.zoom - ( -0.4 * 0.1 * ( camera.zoom / 2 ) ); flag = true; }
		camera.updateProjectionMatrix();
	}
	
	if(flag) { renderCamera(); }
}






function cameraZoomTop( delta )
{
	if(camera == cameraTop)
	{
		camera.zoom = delta;
		camera.updateProjectionMatrix();		
	}

	var k = 0.085 / delta;

	var n = 0;
	var circle = infProject.geometry.circle;
	var point = infProject.tools.point;
	
	var v = point.geometry.vertices;
	var v2 = point.userData.tool_point.v2;
	
	
	for ( var i = 0; i < v2.length; i++ )
	{
		v[i].x = v2[i].x * 1/delta;
		v[i].z = v2[i].z * 1/delta;
		//v[i].z *= objPop.scale.z;
	}	
	
	if(1==2)
	{
		for ( var i = 0; i < circle.length; i++ )
		{
			v[ n ] = new THREE.Vector3().addScaledVector( circle[ i ].clone().normalize(), 0.1 / delta );
			v[ n ].y = 0;
			n++;

			v[ n ] = new THREE.Vector3();
			v[ n ].y = 0;
			n++;

			v[ n ] = v[ n - 2 ].clone();
			v[ n ].y = height_wall + 0.01;
			n++;

			v[ n ] = new THREE.Vector3();
			v[ n ].y = height_wall + 0.01;
			n++;
		}
		
	}
	
	infProject.tools.point.geometry.verticesNeedUpdate = true;
	infProject.tools.point.geometry.elementsNeedUpdate = true;
	
	
	var value = 0.05 / camera.zoom; 
	var v = infProject.geometry.wf_point.vertices;
	v[0].x = v[1].x = v[6].x = v[7].x = -value;
	v[2].x = v[3].x = v[4].x = v[5].x = value;
	v[0].z = v[1].z = v[2].z = v[3].z = value;	
	v[4].z = v[5].z = v[6].z = v[7].z = -value;
	infProject.geometry.wf_point.verticesNeedUpdate = true;
	infProject.geometry.wf_point.elementsNeedUpdate = true;

	// zoom label
	var k = 1 / delta;
	if(k <= infProject.settings.camera.limitZoom) 
	{
		k *= kof_rd;

		var n1 = 0.25 * k *2;
		var n2 = 0.125 * k *2;		
		var v1 = infProject.geometry.labelWall.vertices;
		v1[ 0 ].x = v1[ 1 ].x = -n1;
		v1[ 2 ].x = v1[ 3 ].x = n1;
		v1[ 1 ].z = v1[ 2 ].z = n2;
		v1[ 0 ].z = v1[ 3 ].z = -n2;
		infProject.geometry.labelWall.verticesNeedUpdate = true;
		infProject.geometry.labelWall.elementsNeedUpdate = true;
		upLabelPlan_1( obj_line, true );


		var n1 = 1 * k;
		var n2 = 0.25 * k;
		var v = infProject.geometry.labelFloor.vertices;
		v[ 0 ].x = v[ 1 ].x = -n1;
		v[ 2 ].x = v[ 3 ].x = n1;
		v[ 1 ].z = v[ 2 ].z = n2;
		v[ 0 ].z = v[ 3 ].z = -n2;
		infProject.geometry.labelFloor.verticesNeedUpdate = true;
		infProject.geometry.labelFloor.elementsNeedUpdate = true;
	}
}



function cameraZoom3D( delta, z )
{
	if ( camera != camera3D ) return;

	var vect = ( delta < 0 ) ? z : -z;

	var pos2 = camera.position.clone();

	var dir = new THREE.Vector3().subVectors( centerCam, camera.position ).normalize();
	dir = new THREE.Vector3().addScaledVector( dir, vect );
	dir.addScalar( 0.001 );
	var pos3 = new THREE.Vector3().addVectors( camera.position, dir );	


	var qt = quaternionDirection( new THREE.Vector3().subVectors( centerCam, camera.position ).normalize() );
	var v1 = localTransformPoint( new THREE.Vector3().subVectors( centerCam, pos3 ), qt );


	var offset = new THREE.Vector3().subVectors( pos3, pos2 );
	var pos2 = new THREE.Vector3().addVectors( centerCam, offset );

	var centerCam_2 = centerCam.clone();
	
	if ( delta < 0 ) { if ( pos2.y >= 0 ) { centerCam_2.copy( pos2 ); } }
	
	if ( v1.z >= 0.5) 
	{ 
		centerCam.copy(centerCam_2);
		camera.position.copy( pos3 ); 	
	}	
}




// центрируем камеру cameraTop
function centerCamera2D()
{
	if ( camera != cameraTop ) return;

	var pos = new THREE.Vector3();

	if ( obj_point.length > 0 )
	{
		for ( var i = 0; i < obj_point.length; i++ ) { pos.add( obj_point[ i ].position ); }
		pos.divideScalar( obj_point.length );
	}

	newCameraPosition = {position2D: new THREE.Vector3(pos.x, cameraTop.position.y, pos.z)};
}


function centerCamera3D()
{
	if ( camera != camera3D ) return;

	var pos = new THREE.Vector3();

	if ( obj_point.length > 0 )
	{
		for ( var i = 0; i < obj_point.length; i++ ) { pos.add( obj_point[ i ].position ); }
		pos.divideScalar( obj_point.length );
	}

	newCameraPosition = { position3D: new THREE.Vector3( pos.x, 0, pos.z )};

}


function moveCameraToNewPosition()
{

	if ( !newCameraPosition ) return;

	if (camera === cameraTop && newCameraPosition.position2D) 
	{ 
		var pos = camera.position.clone();
		
		camera.position.lerp(newCameraPosition.position2D, 0.1);
		
		if(camera3D.userData.camera.startProject)
		{
			var pos2 = new THREE.Vector3( camera.position.x - pos.x, 0, camera.position.z - pos.z );
			centerCam.add( pos2 );
			camera3D.position.add( pos2 );			
		}
		
		if(comparePos(camera.position, newCameraPosition.position2D)) { newCameraPosition = null; if(camera3D.userData.camera.startProject) { camera3D.userData.camera.startProject = false; }; };		
	}
	
	else if ( camera === camera3D && newCameraPosition.position3D )
	{
		centerCam.lerp( newCameraPosition.position3D, 0.1 );

		var oldDistance = centerCam.distanceTo( camera.position );

		camera.position.x = oldDistance * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
		camera.position.y = oldDistance * Math.sin( phi * Math.PI / 360 );
		camera.position.z = oldDistance * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );

		camera.position.add( centerCam );
		camera.lookAt( centerCam );
		
		if(comparePos(centerCam, newCameraPosition.position3D)) { newCameraPosition = null; };		
	}

	else if ( camera === camera3D && newCameraPosition.positionFirst || camera === camera3D && newCameraPosition.positionFly )
	{
		var pos = (newCameraPosition.positionFirst) ? newCameraPosition.positionFirst : newCameraPosition.positionFly;
		
		camera.position.lerp( pos, 0.1 );
		
		camera.lookAt( centerCam ); 
		
		if(comparePos(camera.position, pos)) { newCameraPosition = null; };		
	}
	else
	{
		newCameraPosition = null;
	}
	
	renderCamera();
}


// изменение высоты (через ползунок) камеры в режиме от первого лица 
function changeHeightCameraFirst(value)
{
	if(camera3D.userData.camera.type != 'first') return;
	
	$('.range-slider2').attr("value", value);
	
	camera3D.position.y = (value / 100) * 2 + 0.2;  
}


function detectBrowser()
{
	var ua = navigator.userAgent;

	if ( ua.search( /MSIE/ ) > 0 ) return 'Explorer';
	if ( ua.search( /Firefox/ ) > 0 ) return 'Firefox';
	if ( ua.search( /Opera/ ) > 0 ) return 'Opera';
	if ( ua.search( /Chrome/ ) > 0 ) return 'Chrome';
	if ( ua.search( /Safari/ ) > 0 ) return 'Safari';
	if ( ua.search( /Konqueror/ ) > 0 ) return 'Konqueror';
	if ( ua.search( /Iceweasel/ ) > 0 ) return 'Debian';
	if ( ua.search( /SeaMonkey/ ) > 0 ) return 'SeaMonkey';

	// Браузеров очень много, все вписывать смысле нет, Gecko почти везде встречается
	if ( ua.search( /Gecko/ ) > 0 ) return 'Gecko';

	// а может это вообще поисковый робот
	return 'Search Bot';
}





// создаем контроллеры для изменения ширины/высоты окна (при клике на оконо они появляются)
function createControllWD() 
{
	var arr = []; 
	
	var geometry1 = new THREE.SphereGeometry( 0.07, 16, 16 );
	var geometry2 = new THREE.SphereGeometry( 0.05, 16, 16 );
	
	for ( var i = 0; i < 4; i++ )
	{
		var obj = new THREE.Mesh( geometry1, new THREE.MeshLambertMaterial( { transparent: true, opacity: 0 } ) );
		
		obj.userData.tag = 'controll_wd';
		obj.userData.controll_wd = { id : i, obj : null };		
		obj.visible = false;
		
		
		var child = new THREE.Mesh( geometry2, new THREE.MeshLambertMaterial( { color : 0xcccccc, transparent: true, opacity: 1, depthTest: false, lightMap : lightMap_1 } ) );
		child.renderOrder = 2;
		obj.add( child );
		 
		arr[i] = obj;
		scene.add( arr[i] );
	}		
	
	return arr;
}





// показываем контроллеры
function showControllWD( wall, obj )
{	
	var p = [];	
	
	obj.geometry.computeBoundingBox(); 
	obj.geometry.computeBoundingSphere(); 	
	
	var bound = obj.geometry.boundingBox;
	var center = obj.geometry.boundingSphere.center; 


	var arrVisible = [true, true, true, true];
	
	if(camera == cameraTop) { arrVisible = [true, true, false, false]; }
	else if(camera == camera3D) { arrVisible = [false, false, false, false]; }
	
	if(obj.userData.tag == 'door' || obj.userData.tag == 'window')
	{
		if(!obj.userData.door.topMenu) { arrVisible = [false, false, false, false]; }
		
		// позиция котроллеров 
		p[0] = obj.localToWorld( new THREE.Vector3(bound.min.x, center.y, center.z) );
		p[1] = obj.localToWorld( new THREE.Vector3(bound.max.x, center.y, center.z) );
		p[2] = obj.localToWorld( new THREE.Vector3(center.x, bound.min.y, center.z) );
		p[3] = obj.localToWorld( new THREE.Vector3(center.x, bound.max.y, center.z) );		
	}
	else
	{
		arrVisible = [false, false, false, false];
		
		// позиция котроллеров
		var p3 = [];
		p3[0] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, center.y, bound.min.z)) );	
		p3[1] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, center.y, bound.max.z)) );		
		p3[2] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, center.y, bound.min.z)) );
		p3[3] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, center.y, bound.max.z)) );

		var min = { vx: p3[0].x, vz: p3[0].z };
		var max = { vx: p3[0].x, vz: p3[0].z };
		
		for ( var i = 0; i < p3.length; i++ )
		{
			if(min.vx > p3[i].x) { min.vx = p3[i].x; }
			if(max.vx < p3[i].x) { max.vx = p3[i].x; }
			if(min.vz > p3[i].z) { min.vz = p3[i].z; }
			if(max.vz < p3[i].z) { max.vz = p3[i].z; }			
		}
		
		p[0] = wall.localToWorld( new THREE.Vector3(min.vx, p3[0].y, (min.vz - max.vz)/2 + max.vz) );
		p[1] = wall.localToWorld( new THREE.Vector3(max.vx, p3[0].y, (min.vz - max.vz)/2 + max.vz) );
		
		p[2] = obj.localToWorld( new THREE.Vector3(center.x, bound.min.y, center.z) );
		p[3] = obj.localToWorld( new THREE.Vector3(center.x, bound.max.y, center.z) );		
	}

	var arr = arrSize.cube;
	for ( var i = 0; i < arr.length; i++ )
	{		
		arr[i].position.copy( p[i] );	
		arr[i].rotation.copy( wall.rotation );
		arr[i].visible = arrVisible[i];
		arr[i].obj = obj; 
		arr[i].userData.controll_wd.obj = obj;
	}
}


		
		

// показываем линейки и контроллеры для окна/двери (собираем инфу, для перемещения линеек) 
function showRulerWD(obj)
{
	var wall = obj.userData.door.wall;   

	showControllWD( wall, obj );		// показываем контроллеры 
	
	
	var boundPos = [];
	
	if(camera == cameraWall)
	{
		var arr = detectDirectionWall_1(wall, arrWallFront.wall[0].index, detectRoomWallSide(wall, (arrWallFront.wall[0].index == 1) ? 1 : 0));
		boundPos[0] = arr[0].clone();
		boundPos[1] = arr[2].clone();		
	}
	else	
	{
		// находим (границы) позиции от выбранного окна/двери до ближайших окон/дверей/края стены
		var arr = detectDirectionWall_1(wall, 1, detectRoomWallSide(wall, 1));	
		boundPos[0] = arr[0].clone();
		boundPos[1] = arr[2].clone();
		
		var arr = detectDirectionWall_1(wall, 2, detectRoomWallSide(wall, 0));
		boundPos[2] = arr[0].clone();
		boundPos[3] = arr[2].clone();  		
	}	
	
	
	for ( var i = 0; i < arrWallFront.wall.length; i++ )
	{
		arrWallFront.wall[i].obj.label[0].visible = false;
		arrWallFront.wall[i].obj.label[1].visible = false;		
	}
	
	var v = wall.userData.wall.v;
	var vZ = v[0].z + (v[4].z - v[0].z) / 2; 
	
	for ( var i = 0; i < boundPos.length; i++ ){ boundPos[i].z = vZ; boundPos[i].y = 0; wall.localToWorld( boundPos[i] ); } 

	// инфа для перемещения линеек	
	obj.userData.door.ruler.boundPos = boundPos;	
	
	// может быть clickO.rayhit.object.userData.tag == 'controll_wd' ( когда кликнули на контроллер, а потом ввели значение в input и нажали enter )
	if(clickO.rayhit.object.userData.tag == 'window' || clickO.rayhit.object.userData.tag == 'door') 
	{ 
		//obj.userData.door.ruler.faceIndex = clickO.rayhit.faceIndex; 		
		obj.userData.door.ruler.faceIndex = clickO.rayhit.face.normal.z;
	}	 
	
	showRulerWD_2D(obj);  
	showRulerWD_3D(obj);
}



// перемещаем линейки и лайблы 2D
function showRulerWD_2D(wd)
{
	if(camera != cameraTop) return;
	
	var wall = wd.userData.door.wall;
	var boundPos = wd.userData.door.ruler.boundPos;
	var p = [];
	for ( var i = 0; i < arrSize.cube.length; i++ ) { p[i] = arrSize.cube[i].position; }
	
	var x1 = wall.userData.wall.p[1].position.z - wall.userData.wall.p[0].position.z;
	var z1 = wall.userData.wall.p[0].position.x - wall.userData.wall.p[1].position.x;	
	var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены
	
	var width = Number(wall.userData.wall.width) / 2 + 0.05;	

	var dz_1 = dir.clone().multiplyScalar( -width );
	var dz_2 = dir.clone().multiplyScalar( width );
	var dz_3 = dir.clone().multiplyScalar( -0.1 );
	var dz_4 = dir.clone().multiplyScalar( 0.1 );	
	
	var dirZ = [];
	dirZ[0] = dz_3;
	dirZ[1] = dz_4;
	dirZ[2] = dz_3;	
	dirZ[3] = dz_4;
	dirZ[4] = dz_3;
	dirZ[5] = dz_4;
		
	
	var p2 = [];	
	p2[0] = new THREE.Vector3().addVectors(boundPos[0], dz_1);	
	p2[1] = new THREE.Vector3().addVectors(boundPos[2], dz_2);
	p2[2] = new THREE.Vector3().addVectors(p[1], dz_1);
	p2[3] = new THREE.Vector3().addVectors(p[1], dz_2);
	p2[4] = new THREE.Vector3().addVectors(p[0], dz_1);
	p2[5] = new THREE.Vector3().addVectors(p[0], dz_2);

	var w2 = [];	
	w2[0] = p2[4];
	w2[1] = p2[5];
	w2[2] = new THREE.Vector3().addVectors(boundPos[1], dz_1);	
	w2[3] = new THREE.Vector3().addVectors(boundPos[3], dz_2);
	w2[4] = p2[2];
	w2[5] = p2[3];	


	var wp = [];
	wp[0] = p2[0];
	wp[1] = p2[1];
	wp[2] = p2[2];
	wp[3] = p2[3];
	wp[4] = w2[0];
	wp[5] = w2[1];
	wp[6] = w2[2];
	wp[7] = w2[3];
	
	for ( var i = 0; i < wp.length; i++ ) { wp[i].y = 0; }
	for ( var i = 0; i < p2.length; i++ ) { p2[i].y = 0; }

	var dir = new THREE.Vector3().subVectors( wall.userData.wall.p[1].position, wall.userData.wall.p[0].position );  		
	var rotation = new THREE.Euler().setFromQuaternion( quaternionDirection(dir.clone().normalize()) );  // из кватерниона в rotation

	var rotY2 = Math.atan2(dir.x, dir.z); 
	if(rotY2 <= 0.001){ rotY2 -= Math.PI / 2; }
	else { rotY2 += Math.PI / 2; }	
	
	var line = arrSize.format_2.line;
	var label = arrSize.format_2.label;	
	
	// линейки показывающие длину
	for ( var i = 0; i < 6; i++ )
	{ 
		var d = w2[i].distanceTo(p2[i]); 
		var v = line[i].geometry.vertices; 	
		v[3].x = v[2].x = v[5].x = v[4].x = d;
		line[i].geometry.verticesNeedUpdate = true;
				
		line[i].position.copy( p2[i] );
		line[i].rotation.set(rotation.x, rotation.y - Math.PI / 2, 0);
		line[i].visible = true;
				
		var dir = new THREE.Vector3().subVectors( w2[i], p2[i] );
		label[i].position.copy( p2[i] );	
		label[i].position.add( dirZ[i] );
		label[i].position.add( dir.divideScalar( 2 ) ); 
		label[i].rotation.set( -Math.PI / 2, 0, rotY2 - Math.PI );
		label[i].visible = true;
		
		upLabelCameraWall({label : label[i], text : Math.round(d * 100) * 10, color : 'rgba(0,0,0,1)', border : 'border line'});
	}	

	// линейки отсечки
	var arr = arrSize.cutoff;	
	for ( var i = 0; i < arr.length; i++ )
	{
		arr[i].position.copy( wp[i] );
		arr[i].rotation.set(rotation.x, rotation.y, 0);
		arr[i].material.color.set(0x222222);
		arr[i].visible = true;
	}	
}


// перемещаем линейки и лайблы в режиме cameraWall 
function showRulerWD_3D(wd)
{
	if(camera != cameraWall) return;
	
	var wall = wd.userData.door.wall;
	var boundPos = wd.userData.door.ruler.boundPos;
	var index = wd.userData.door.ruler.faceIndex;
	var rt = 0;
	
	var p = [];
	for ( var i = 0; i < arrSize.cube.length; i++ ) { p[i] = arrSize.cube[i].position; }
	
	//for ( var i = 0; i < arrSize.cube.length; i++ ) { arrSize.cube[i].visible = true; }
	
	if(wd.userData.door.topMenu)
	{
		for ( var i = 0; i < arrSize.cube.length; i++ ) { arrSize.cube[i].visible = true; }
	}	
	
	var w2 = [];
	if(index > 0.98) 
	{
		w2[0] = new THREE.Vector3(boundPos[0].x, p[0].y, boundPos[0].z); 
		w2[1] = new THREE.Vector3(boundPos[1].x, p[1].y, boundPos[1].z);		
	}
	else if(index < -0.98) 	
	{
		w2[0] = new THREE.Vector3(boundPos[0].x, p[0].y, boundPos[0].z); 
		w2[1] = new THREE.Vector3(boundPos[1].x, p[1].y, boundPos[1].z);
		rt = Math.PI;
	}
	
	w2[2] = new THREE.Vector3(p[2].x, arrWallFront.bounds.min.y.y, p[2].z);
	w2[3] = new THREE.Vector3(p[3].x, arrWallFront.bounds.max.y.y, p[3].z);

	
	var line = arrSize.format_2.line;
	var label = arrSize.format_2.label;	
	
	// линейки показывающие длину
	for ( var i = 0; i < p.length; i++ )
	{
		var d = w2[i].distanceTo(p[i]); 
		var v = line[i].geometry.vertices; 	
		v[3].x = v[2].x = v[5].x = v[4].x = d;
		line[i].geometry.verticesNeedUpdate = true;		
		
		line[i].position.copy( p[i] );
		line[i].visible = true;
				
		var dir = new THREE.Vector3().subVectors( w2[i], p[i] );  		
		var rotation = new THREE.Euler().setFromQuaternion( quaternionDirection(dir.clone().normalize()) );  // из кватерниона в rotation
		line[i].rotation.set(rotation.x, rotation.y - Math.PI / 2, 0);
		
		
		label[i].position.copy( p[i] );
		label[i].position.add( dir.divideScalar( 2 ) );	
		
		label[i].rotation.set( 0, wall.rotation.y + rt, 0 );    
		label[i].visible = true;			
		upLabelCameraWall({label : label[i], text : Math.round(d * 100) / 100, color : 'rgba(0,0,0,1)', border : 'border line'});
	}
	
	// боковые отсечки для линейки
	var arr = [];
	for ( var i = 0; i < p.length; i++ ) { arr[i] = { p1 : p[i], p2 : w2[i] }; }		
	showSizeCutoff(arr);	
}
 






// кликнули на контроллер
function clickToggleChangeWin( intersect, cdm )
{
	clickO.move = intersect.object; 
	var controll = intersect.object;	
	var wd = controll.userData.controll_wd.obj;
	var wall = wd.userData.door.wall;
	var pos2 = new THREE.Vector3();
	
	
	var m = controll.userData.controll_wd.id;
	
	if(camera == cameraTop)
	{
		planeMath.position.set( 0, intersect.point.y, 0 );
		planeMath.rotation.set(-Math.PI/2, 0, 0);
		
		var v = wall.userData.wall.v;
		var z = v[0].z + (v[4].z - v[0].z) / 2;
	
		if(m == 0) { pos2 = wall.localToWorld( new THREE.Vector3(wd.userData.door.bound.min.x, controll.position.y, z) ); }
		else if(m == 1) { pos2 = wall.localToWorld( new THREE.Vector3(wd.userData.door.bound.max.x, controll.position.y, z) ); }				
	}
	else if(camera == cameraWall)
	{
		//clickO.obj = null;
		planeMath.position.copy( intersect.point );
		planeMath.rotation.set( 0, controll.rotation.y, 0 );
		
		var dir = new THREE.Vector3().subVectors( wall.userData.wall.p[1].position, wall.userData.wall.p[0].position ).normalize();
		
		if(m == 0) { pos2 = new THREE.Vector3().addVectors( controll.position, dir ); }
		else if(m == 1) { pos2 = new THREE.Vector3().subVectors( controll.position, dir ); }	
		else if(m == 2) { pos2 = controll.position.clone(); pos2.y = -9999; }
		else if(m == 3) { pos2 = controll.position.clone(); pos2.y = 9999; }
	}

	
	var offset = new THREE.Vector3().subVectors( intersect.object.position, intersect.point ); 
	var dir = new THREE.Vector3().subVectors( controll.position, pos2 ).normalize();  
	var qt = quaternionDirection( dir );

	
	wd.userData.door.wall.controll = {  }; 
	wd.userData.door.wall.controll.obj = controll;
	wd.userData.door.wall.controll.pos = controll.position.clone();
	wd.userData.door.wall.controll.dir = dir;
	wd.userData.door.wall.controll.qt = qt;
	wd.userData.door.wall.controll.offset = offset;
	
	var ps = [];
	var arr = arrSize.cube;
	ps[ps.length] = wall.worldToLocal( arr[0].position.clone() );
	ps[ps.length] = wall.worldToLocal( arr[1].position.clone() );
	ps[ps.length] = wall.worldToLocal( arr[2].position.clone() );
	ps[ps.length] = wall.worldToLocal( arr[3].position.clone() );
	
	wd.userData.door.wall.controll.arrPos = ps;
	
	wd.updateMatrixWorld();	// окно/дверь
	wall.updateMatrixWorld();
	
	param_win.click = true;
}

 

 
// перемещаем контроллер
function moveToggleChangeWin( event, controll )
{	
	var intersects = rayIntersect( event, planeMath, 'one' ); 	
	if ( intersects.length < 1 ) return; 
	
	var wd = controll.userData.controll_wd.obj;
	var wall = wd.userData.door.wall;

	
	if(param_win.click) 
	{ 
		param_win.click = false; 

		wallClone.geometry = clickMoveWD_BSP( wd ).geometry.clone(); 
		wallClone.position.copy( wd.userData.door.wall.position ); 
		wallClone.rotation.copy( wd.userData.door.wall.rotation );
		
		objsBSP = { wall : wallClone, wd : createCloneWD_BSP( wd ) };
		
		// меняем цвет у wd
		wd.material.depthTest = false;  
		wd.material.opacity = 1.0; 		
	}	
	
	var pos = new THREE.Vector3().addVectors( wd.userData.door.wall.controll.offset, intersects[ 0 ].point );	
	var v1 = localTransformPoint( new THREE.Vector3().subVectors( pos, wd.userData.door.wall.controll.pos ), wd.userData.door.wall.controll.qt );
	v1 = new THREE.Vector3().addScaledVector( wd.userData.door.wall.controll.dir, v1.z );  
	v1 = new THREE.Vector3().addVectors( wd.userData.door.wall.controll.pos, v1 );	


	// ограничитель до ближайших окон/дверей/края стены
	if(1==2)
	{		
		var pos2 = wall.worldToLocal( v1.clone() );	

		function discreteShift(pos, pos2)
		{
			var res = Math.floor((pos2 - pos) * 10)/10;
			
			return pos2 - res;
		}		
 
		if(controll.userData.controll_wd.id == 0)
		{  
			pos2.x = discreteShift(pos2.x, wd.userData.door.wall.controll.arrPos[1].x);
			
			var x_min = wd.userData.door.bound.min.x;  
			if(pos2.x < x_min){ pos2.x = x_min; } 	
			else if(pos2.x > wd.userData.door.wall.controll.arrPos[1].x - 0.2){ pos2.x = wd.userData.door.wall.controll.arrPos[1].x - 0.2; }		
		}		
		else if(controll.userData.controll_wd.id == 1)
		{
			pos2.x = discreteShift(pos2.x, wd.userData.door.wall.controll.arrPos[0].x);
			
			var x_max = wd.userData.door.bound.max.x;
			if(pos2.x > x_max){ pos2.x = x_max; }
			else if(pos2.x < wd.userData.door.wall.controll.arrPos[0].x + 0.2){ pos2.x = wd.userData.door.wall.controll.arrPos[0].x + 0.2; }							
		}
		else if(controll.userData.controll_wd.id == 2)
		{
			pos2.y = discreteShift(pos2.y, wd.userData.door.wall.controll.arrPos[3].y);
			
			var y_min = wd.userData.door.bound.min.y + 0.1;
			if(pos2.y < y_min){ pos2.y = y_min; }
			else if(pos2.y > wd.userData.door.wall.controll.arrPos[3].y - 0.2){ pos2.y = wd.userData.door.wall.controll.arrPos[3].y - 0.2; }		
		}		
		else if(controll.userData.controll_wd.id == 3)
		{
			pos2.y = discreteShift(pos2.y, wd.userData.door.wall.controll.arrPos[2].y);
			
			var y_max = wd.userData.door.bound.max.y;
			if(pos2.y > y_max){ pos2.y = y_max; }
			else if(pos2.y < wd.userData.door.wall.controll.arrPos[2].y + 0.2){ pos2.y = wd.userData.door.wall.controll.arrPos[2].y + 0.2; }					
		}		
		
		v1 = wall.localToWorld( pos2 );			
	}
	
	var pos2 = new THREE.Vector3().subVectors( v1, controll.position );  
	controll.position.copy( v1 ); 	

	// обновляем форму окна/двери и с новыми размерами вырезаем отверстие в стене
	if(1==1)
	{
		var arr = arrSize.cube;
		
		var x = arr[0].position.distanceTo(arr[1].position);
		var y = arr[2].position.distanceTo(arr[3].position);
		
		var pos = pos2.clone().divideScalar( 2 ).add( wd.position.clone() );
		
		сhangeSizePosWD( wd, pos, x, y );
	}
	
	// устанавливаем второстепенные контроллеры, в правильное положение
	var arr = arrSize.cube;	
	if(controll.userData.controll_wd.id == 0 || controll.userData.controll_wd.id == 1)
	{ 
		arr[2].position.add( pos2.clone().divideScalar( 2 ) );
		arr[3].position.add( pos2.clone().divideScalar( 2 ) );
	}
	else if(controll.userData.controll_wd.id == 2 || controll.userData.controll_wd.id == 3)
	{ 
		arr[0].position.add( pos2.clone().divideScalar( 2 ) );
		arr[1].position.add( pos2.clone().divideScalar( 2 ) );
	}	
	
	 // изменяем знаечние ширину/высоту окна в input (при перемещении контроллера)
	showTableWD(wd);
	
	showRulerWD_2D(wd);
	showRulerWD_3D(wd);
}




function clickMouseUpToggleWD( controll )
{
	if(param_win.click) { param_win.click = false; return; }
	
	var wd = controll.userData.controll_wd.obj;
	
	objsBSP.wd = createCloneWD_BSP( wd );
	
	MeshBSP( wd, objsBSP );
	
	if(camera == cameraTop)
	{ 
		wd.material.depthTest = false;  
		wd.material.opacity = 1.0; 		 	
	}
	else
	{ 		
		wd.material.depthTest = true;
		wd.material.transparent = true;
		wd.material.opacity = 0;					
	}
	
	clickO.last_obj = wd;
}





function clickPoint( intersect )
{
	if(clickO.move)
	{
		if(clickO.move.userData.tag == 'free_dw') { return; }	// кликнули на точку, когда добавляем окно
	}	 
	
	var obj = intersect.object;	
	clickO.move = obj;
	

	offset = new THREE.Vector3().subVectors( intersect.object.position, intersect.point );
	planeMath.position.set( 0, intersect.point.y, 0 );
	planeMath.rotation.set(-Math.PI/2, 0, 0);	

	param_win.click = true;	
	param_wall.wallR = detectChangeArrWall([], clickO.move);

	// запоминаем последнее положение точки и дверей/окон
	if(1==1)
	{  
		obj.userData.point.last.pos = obj.position.clone(); 		
		
		for ( var i = 0; i < param_wall.wallR.length; i++ )
		{						
			for ( var i2 = 0; i2 < param_wall.wallR[i].userData.wall.arrO.length; i2++ )
			{
				var wd = param_wall.wallR[i].userData.wall.arrO[i2];
				 
				wd.userData.door.last.pos = wd.position.clone();
				wd.userData.door.last.rot = wd.rotation.clone(); 
			}
		}		 			
	}	
}



function getWallArrOUR()
{
	var arr = [];
	
	for ( var i = 0; i < clickO.move.w.length; i++ )
	{
		arr[i] = { id : clickO.move.w[i].userData.id, arrO : [] };
		
		for ( var i2 = 0; i2 < clickO.move.w[i].userData.wall.arrO.length; i2++ )
		{
			arr[i].arrO[i2] = { pos : '', rot : '' };
			arr[i].arrO[i2].pos = clickO.move.w[i].userData.wall.arrO[i2].position.clone();
			arr[i].arrO[i2].rot = clickO.move.w[i].userData.wall.arrO[i2].rotation.clone();			 
		}
	}

	return arr;
}





function movePoint( event, obj )
{
	if(obj.userData.point.type) 
	{ 
		if(obj.userData.point.type == 'continue_create_wall') {  } 
		else { dragToolPoint( event, obj ); return; } 
	}	
	
	if(param_win.click) 
	{
		clickMovePoint_BSP(param_wall.wallR);
		param_win.click = false;
	}	
	
	var intersects = rayIntersect( event, planeMath, 'one' ); 
	
	if ( intersects.length > 0 ) 
	{
		var pos = new THREE.Vector3().addVectors( intersects[ 0 ].point, offset );				
		pos.y = obj.position.y; 
		
		var pos2 = new THREE.Vector3().subVectors( pos, obj.position );
		
		obj.position.copy( pos );				
		dragToolPoint( event, obj );	// направляющие
				
		 
		for ( var i = 0; i < obj.w.length; i++ )
		{			
			updateWall(obj.w[i]);	
		}		
	
		upLineYY(obj);			
		
		upLabelPlan_1(param_wall.wallR); 
	}
	
}


function limitMovePoint(point, point2, wall, side, pos2)
{
	var v = wall.userData.wall.v;
	
	var offX = 0; 
	
	if(side == 0)
	{
		var x1 = v[6].x - (v[0].x + offX);
		var x2 = v[10].x - (v[4].x + offX);	
		var xmin = (x1 < x2) ? x1 : x2;		
	}
	if(side == 1)
	{
		var n = v.length;
		var x1 = (v[n - 6].x - offX) - v[n - 12].x;
		var x2 = (v[n - 2].x - offX) - v[n - 8].x;	
		var xmin = (x1 < x2) ? x1 : x2;			
	}

	
	
	if(xmin <= 0.1)
	{		
		var dir = new THREE.Vector3().subVectors( point.position, point2.position ).normalize();
		var v1 = new THREE.Vector3().addScaledVector( dir, Math.abs(xmin - 0.1) + 0.1 );		
		point.position.add( v1 );
	}
	
	return point.position;
}



// перетаскиваем точку (определяем с чем пересекается)
function dragToolPoint( event, obj )
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
	
	var plane = null;
	var point = null;
	var wall = null;	
	var dw = null;
	var pos = new THREE.Vector3();	
	
	for ( var i = 0; i < intersects.length; i++ ) 
	{
		var object = intersects[ i ].object;
		
		if(object.userData.tag == 'planeMath')
		{ 
			pos = intersects[i].point; 
			obj.position.set( pos.x, obj.position.y, pos.z ); 
			plane = object; 
		} 			
		else if(object.userData.tag == 'wall')
		{ 			
			var flag = true;
			for ( var i2 = 0; i2 < object.userData.wall.p.length; i2++ ) 
			{				
				if(object.userData.wall.p[i2].userData.id == obj.userData.id) { flag = false; break; }									
			}
			if(flag) { wall = object; }			
		}
		else if(object.userData.tag == 'window' || object.userData.tag == 'door'){ dw = object; } 
	}
	
	
	for ( var i = 0; i < obj_point.length; i++ )
	{
		if(obj_point[i] == obj) { continue; }		

		var p1 = new THREE.Vector3( obj.position.x, 0, obj.position.z ); 
		var p2 = new THREE.Vector3( obj_point[i].position.x, 0, obj_point[i].position.z ); 
		
		if(p1.distanceTo( p2 ) < 0.2 / camera.zoom)
		{ 
			obj.position.set( obj_point[i].position.x, obj.position.y, obj_point[i].position.z );
			obj.userData.point.cross = point = obj_point[i];
			break;
		}	
	}	
 
	  
	if(point) 
	{
		
	} 
	else if(dw)
	{
		obj.userData.point.cross = null; 
	}
	else if(!wall) 
	{ 
		obj.userData.point.cross = plane;
		
		showLineAxis( obj );		
	}
	else
	{ 
		wall.updateMatrixWorld();			
		var pos = wall.worldToLocal( pos.clone() );	
		var pos = wall.localToWorld( new THREE.Vector3(pos.x, 0, 0 ) ); 		
		obj.position.set( pos.x, obj.position.y, pos.z ); 
		obj.userData.point.cross = wall; 
		
		infProject.tools.axis[0].visible = false;
		infProject.tools.axis[1].visible = false; 
	}
}

  



// направляющие X/Z к точекам
function showLineAxis( point )
{ 
	var pX = [];
	var pZ = [];
	
	for ( var i = 0; i < obj_point.length; i++ )
	{
		if(obj_point[i] == point) { continue; }		

		var p1 = spPoint(obj_point[i].position, new THREE.Vector3().addVectors(obj_point[i].position, new THREE.Vector3(10,0,0)), point.position);	
		var p2 = spPoint(obj_point[i].position, new THREE.Vector3().addVectors(obj_point[i].position, new THREE.Vector3(0,0,10)), point.position);
		
		var x = Math.abs( obj_point[i].position.x - p1.x );
		var z = Math.abs( obj_point[i].position.z - p2.z );
		
		if(x < 0.06 / camera.zoom){ pX[pX.length] = i; }
		if(z < 0.06 / camera.zoom){ pZ[pZ.length] = i; }			
	}
	
	
	if(pX.length > 0)
	{
		var v = [];
		for ( var i = 0; i < pX.length; i++ ){ v[i] = obj_point[pX[i]].position; }
		var n1 = pX[getMinDistanceVertex(v, point.position)];		 
	} 
	
	if(pZ.length > 0)
	{
		var v = [];
		for ( var i = 0; i < pZ.length; i++ ){ v[i] = obj_point[pZ[i]].position; }
		var n2 = pZ[getMinDistanceVertex(v, point.position)]; 		
	}	
	
	
	if(pX.length > 0 && pZ.length > 0) 
	{ 
		point.position.x = obj_point[n1].position.x; 
		point.position.z = obj_point[n2].position.z; 		
		dopFunct1(point, obj_point[n1].position, infProject.tools.axis[0], 'xz'); 
		dopFunct1(point, obj_point[n2].position, infProject.tools.axis[1], 'xz'); 
	}
	else
	{
		(pX.length > 0) ? dopFunct1(point, obj_point[n1].position, infProject.tools.axis[0], 'x') : infProject.tools.axis[0].visible = false;
		(pZ.length > 0) ? dopFunct1(point, obj_point[n2].position, infProject.tools.axis[1], 'z') : infProject.tools.axis[1].visible = false;
	}
}

 


// устанвливаем и показываем красные линии
function dopFunct1(point, pos2, lineAxis, axis)
{
	//point.position.y = 0;
	if(axis == 'x') { point.position.x = pos2.x; }
	if(axis == 'z') { point.position.z = pos2.z; } 
	
	var pos2 = new THREE.Vector3(pos2.x, point.position.y, pos2.z);
	var d = point.position.distanceTo( pos2 );	
	
	var v = lineAxis.geometry.vertices;		
	v[3].x = v[2].x = v[5].x = v[4].x = d;		
	lineAxis.geometry.verticesNeedUpdate = true;

	var dir = new THREE.Vector3().subVectors( point.position, pos2 ).normalize();
	var angleDeg = Math.atan2(dir.x, dir.z);
	lineAxis.rotation.set(0, angleDeg + Math.PI / 2, 0);		
	lineAxis.position.copy( point.position );
	lineAxis.visible = true;	
}


 


// определяем ближайшие стены, которые будут менять длину 
function detectChangeArrWall(arr, point) 
{	
	for ( var i = 0; i < point.p.length; i++ )
	{				
		for ( var j = 0; j < point.p[i].w.length; j++ )
		{
			var flag = false;
			for ( var i2 = 0; i2 < arr.length; i2++ )
			{
				if(point.p[i].w[j] == arr[i2]){ flag = true; break; }
			}
			
			if(flag){ continue; }				

			arr[arr.length] = point.p[i].w[j];
		}		
	}
	
	return arr;	
}


// определяем ближайшие стены, которые будут менять длину (входное значение стена) 
function detectChangeArrWall_2(wall) 
{	
	var arr = [];

	for ( var j = 0; j < wall.userData.wall.p.length; j++ )
	{
		for ( var i = 0; i < wall.userData.wall.p[j].p.length; i++ )
		{ 
			for ( var i2 = 0; i2 < wall.userData.wall.p[j].p[i].w.length; i2++ ) 
			{ 	
				var flag = true;
				for ( var i3 = 0; i3 < arr.length; i3++ )
				{
					if(arr[i3] == wall.userData.wall.p[j].p[i].w[i2]) { flag = false; }
				}

				if(flag) { arr[arr.length] = wall.userData.wall.p[j].p[i].w[i2]; }
			} 
		}		
	}
	
	return arr;	
}



// определяем соседние стены
function detectChangeArrWall_3(wall) 
{	
	var arr = [];

	for ( var i = 0; i < wall.userData.wall.p.length; i++ )
	{
		for ( var i2 = 0; i2 < wall.userData.wall.p[i].w.length; i2++ )
		{ 
			var flag = true;
			for ( var i3 = 0; i3 < arr.length; i3++ )
			{
				if(arr[i3] == wall.userData.wall.p[i].w[i2]) { flag = false; }
			}

			if(flag) { arr[arr.length] = wall.userData.wall.p[i].w[i2]; } 
		}		
	}
	
	return arr;	
}



// пересечение углов (часть 1)
function upLineYY(point)
{		
	// пересечение цетрального угла (который перетаскиваем)
	upLineYY_2(point, point.p, point.w, point.start);	

	
	// пересечение боковых углов (соседи цетральной точки)
	var arrP = point.p;
	for ( var j = 0; j < arrP.length; j++ )
	{
		//if(!arrP[j]) { continue; }		
		if(arrP[j].p.length > 1) { upLineYY_2(arrP[j], arrP[j].p, arrP[j].w, arrP[j].start); }		
	}
	
}


function upLineYY_2(point, arrP, arrW, arrS)
{
	var arrD = [];
	
	var n = 0;
	for ( var i = 0; i < arrP.length; i++ )
	{
		if(point.position.distanceTo(arrP[i].position) < 0.1)
		{ 
			arrW[i].geometry.vertices[0].x = 0;
			arrW[i].geometry.vertices[1].x = 0;	
			arrW[i].geometry.vertices[2].x = 0;	
			arrW[i].geometry.vertices[3].x = 0;	
			arrW[i].geometry.vertices[4].x = 0;	
			arrW[i].geometry.vertices[5].x = 0;			
			arrW[i].geometry.vertices[6].x = 0;
			arrW[i].geometry.vertices[7].x = 0;	
			arrW[i].geometry.vertices[8].x = 0;	
			arrW[i].geometry.vertices[9].x = 0;	
			arrW[i].geometry.vertices[10].x = 0;	
			arrW[i].geometry.vertices[11].x = 0;	
			continue; 
		}
		
		arrD[n] = [];
		arrD[n][1] = i;
		arrD[n][0] = new THREE.Vector3().subVectors( point.position, arrP[i].position ).normalize();
		arrD[n][0] = Math.atan2(arrD[n][0].x, arrD[n][0].z);
		
		if(arrD[n][0] < 0){ arrD[n][0] += Math.PI * 2; }		
		n++;
	}
	
	arrD.sort(function (a, b) { return a[0] - b[0]; });
	
	for ( var i = 0; i < arrD.length - 1; i++ )
	{ 
		upLineUU(arrW[arrD[i][1]], arrW[arrD[i + 1][1]], arrS[arrD[i][1]], arrS[arrD[i + 1][1]], point.position); 
	}	
	var i2 = arrD.length - 1; 
	if(arrD[i2]) 
	{
		upLineUU(arrW[arrD[i2][1]], arrW[arrD[0][1]], arrS[arrD[i2][1]], arrS[arrD[0][1]], point.position);		
	}
}


// пересечение углов (часть 2)
function upLineUU(line1, line2, s1, s2, pointC)
{
	var v1 = line1.geometry.vertices;
	var v2 = line2.geometry.vertices;
	
	if(s1 == 1){ var n1 = 0; var n2 = 6; var n3 = 7; var n4 = 8; var n5 = 9; }
	else { var n1 = 10; var n2 = 4; var n3 = 5; var n4 = 2; var n5 = 3; }
	
	if(s2 == 1){ var f1 = 4; var f2 = 10; var f3 = 11; var f4 = 8; var f5 = 9; }
	else { var f1 = 6; var f2 = 0; var f3 = 1; var f4 = 2; var f5 = 3; }


	//
	
	line1.updateMatrixWorld();
	var m1a = line1.localToWorld( v1[n1].clone() );
	var m1b = line1.localToWorld( v1[n2].clone() );

	line2.updateMatrixWorld();
	var m2a = line2.localToWorld( v2[f1].clone() );
	var m2b = line2.localToWorld( v2[f2].clone() );

	
	var crossP = crossPointTwoLine_2(m1a, m1b, m2a, m2b);

	var cross = false;
	
	if(!crossP[1]) { if(intersectWall_2(m1a, m1b, m2a, m2b)) { cross = true; } }	// стенки стен пересекаются	 
	
	if(cross)
	{		
		var per1 = line1.worldToLocal( crossP[0].clone() ).x;
		var per2 = line2.worldToLocal( crossP[0].clone() ).x;
		var per3 = line1.worldToLocal( pointC.clone() ).x;
		var per4 = line2.worldToLocal( pointC.clone() ).x;
	}
	else
	{
		var vpc = line1.worldToLocal( pointC.clone() );
		vpc.z = m1a.z;
		
		crossP[0] = vpc;
		crossP[0] = line1.localToWorld( crossP[0].clone() );
		 
		var rs = line1.userData.wall.width - line2.userData.wall.width;
		
		if(rs < -0.1) 
		{
			var per1 = line1.worldToLocal( crossPointTwoLine_2(m1a, m1b, pointC, m2b)[0] ).x;
			var per2 = line2.worldToLocal( pointC.clone() ).x;
		}
		else if(rs > 0.1)
		{
			var per1 = line1.worldToLocal( pointC.clone() ).x;
			var per2 = line2.worldToLocal( crossPointTwoLine_2(pointC, m1b, m2a, m2b)[0] ).x;
		}
		else 
		{ 
			var per1 = line1.worldToLocal( crossP[0].clone() ).x; 
			var per2 = line2.worldToLocal( crossP[0].clone() ).x;			
		}		
		
		var per3 = line1.worldToLocal( pointC.clone() ).x;
		var per4 = line2.worldToLocal( pointC.clone() ).x;	
	}


	v1[n2].x = v1[n3].x = per1;
	v2[f2].x = v2[f3].x = per2;
	
	v1[n4].x = v1[n5].x = per3;
	v2[f4].x = v2[f5].x = per4;	

	line1.geometry.verticesNeedUpdate = true;	
	line2.geometry.verticesNeedUpdate = true;
	
	line1.geometry.computeBoundingBox(); 	
	line1.geometry.computeBoundingSphere();	
	
	line2.geometry.computeBoundingBox(); 	
	line2.geometry.computeBoundingSphere();	
}






 
 // проверка пересечения отрезков (углов стен), если один из отрезков выходит за длину другого отрезка, то пересечения не будет 
function intersectWall_2(p0, p1, p2, p3)
{			
	var dir = new THREE.Vector3().subVectors( p1, p0 ).normalize();
	var v1 = new THREE.Vector3().addScaledVector( dir, 10.2 );
	var p1 = new THREE.Vector3().addVectors( p1, v1 );		
		
	var dir = new THREE.Vector3().subVectors( p3, p2 ).normalize();
	var v1 = new THREE.Vector3().addScaledVector( dir, 10.2 );
	var p3 = new THREE.Vector3().addVectors( p3, v1 );	
	
	if( !CrossLine(p0, p1, p2, p3) ) { /**/ return false; }		
	
	return true;
}



 // проверка пересечения 2-х отрезков
function intersectWall_3(p0, p1, p2, p3) 
{			
	var dir = new THREE.Vector3().subVectors( p1, p0 ).normalize();
	var v1 = new THREE.Vector3().addScaledVector( dir, 0.01 );
	var p0 = new THREE.Vector3().addVectors( p0, v1 );		
	var p1 = new THREE.Vector3().subVectors( p1, v1 );
	
	if( !CrossLine(p0, p1, p2, p3) ) { /**/ return false; }		
	
	return true;
}




// undo/redo при перемещении точки 
function undoRedoChangeMovePoint( point, walls )
{
	point.position.copy( point.userData.point.last.pos );
	
	for ( var i = 0; i < point.p.length; i++ )
	{
		updateWall(point.w[i], {point:point});		
	}		
	
	upLineYY(point);  
	upLabelPlan_1(walls);
	updateShapeFloor(point.zone); 
	
	clickPointUP_BSP(walls);
	
	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false;		
}


function clickPointMouseUp(obj)
{  
	if(obj.w.length > 0) createWallZone(obj.w[0]);
	
	obj.userData.point.last.pos = obj.position.clone();
}







var param_wall = { click : false, wallR : [], posS : 0, qt_1 : [], qt_2 : [], arrZone : [] };


function clickWall_2D( intersect )
{
	var obj = intersect.object;
	
	clickO.move = obj;
	
	offset = new THREE.Vector3().subVectors( obj.position, intersect.point );
	planeMath.position.set( 0, intersect.point.y, 0 );	
	planeMath.rotation.set(-Math.PI/2, 0, 0);	

	param_win.click = true;	
	param_wall.posS = new THREE.Vector3().addVectors( intersect.point, offset );	// стартовое положение
	  
	param_wall.wallR = detectChangeArrWall_2(obj);

	var p = obj.userData.wall.p;
	
	for ( var i = 0; i < p[0].w.length; i++ )
	{  
		var dir = new THREE.Vector3().subVectors( p[0].position, p[0].p[i].position ).normalize();	
		param_wall.qt_1[i] = quaternionDirection(dir);
	}
	
	for ( var i = 0; i < p[1].w.length; i++ )
	{ 
		var dir = new THREE.Vector3().subVectors( p[1].position, p[1].p[i].position ).normalize();
		param_wall.qt_2[i] = quaternionDirection(dir);
	}
	
	param_wall.arrZone = compileArrPickZone(obj);

	clickO.click.wall = [...new Set([...p[0].w, ...p[1].w])];  
	
	getInfoUndoWall(obj);
}


// собираем инфу для undo/redo
function getInfoUndoWall(wall)
{
	wall.userData.wall.p[0].userData.point.last.pos = wall.userData.wall.p[0].position.clone();
	wall.userData.wall.p[1].userData.point.last.pos = wall.userData.wall.p[1].position.clone();
	
	var walls = detectChangeArrWall_2(wall);
	
	for ( var i = 0; i < walls.length; i++ )
	{		
		walls[i].userData.wall.last.pos = walls[i].position.clone();
		walls[i].userData.wall.last.rot = walls[i].rotation.clone();
		
		for ( var i2 = 0; i2 < walls[i].userData.wall.arrO.length; i2++ )
		{
			var wd = walls[i].userData.wall.arrO[i2];
			 
			wd.userData.door.last.pos = wd.position.clone();
			wd.userData.door.last.rot = wd.rotation.clone(); 
		}
	}		 				
}
	



// собираем в массив id зон, которые будем менять (исключаем повторяющиеся)
function compileArrPickZone( wall )
{
	var m = 0;
	arr = [];
	
	for ( var i = 0; i < wall.userData.wall.p[0].zone.length; i++ ) { arr[m] = wall.userData.wall.p[0].zone[i]; m++; } 
	for ( var i = 0; i < wall.userData.wall.p[1].zone.length; i++ )
	{
		var flag = true;
		for ( var i2 = 0; i2 < arr.length; i2++ )
		{
			if(wall.userData.wall.p[1].zone[i] == arr[i2]) { flag = false; break; }
		}
		
		if(flag) { arr[m] = wall.userData.wall.p[1].zone[i]; m++; }
	}

	return arr;	
}







function moveWall( event, obj ) 
{		
	
	if(camera == camera3D) { cameraMove3D( event ); return; }
	
	if(param_win.click) 
	{
		clickMovePoint_BSP(param_wall.wallR);
		param_win.click = false;
	}	
	
	var intersects = rayIntersect( event, planeMath, 'one' );
	
	if ( intersects.length > 0 ) 
	{
		var pos = new THREE.Vector3().addVectors( intersects[ 0 ].point, offset );	
		
		
		// перемещение стены вдоль своей оси
		var x1 = obj.userData.wall.p[1].position.z - obj.userData.wall.p[0].position.z;
		var z1 = obj.userData.wall.p[0].position.x - obj.userData.wall.p[1].position.x;	
		var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены	
		
		var qt1 = quaternionDirection(dir);
		var v1 = localTransformPoint( new THREE.Vector3().subVectors( pos, param_wall.posS ), qt1 );	
		v1 = new THREE.Vector3().addScaledVector( dir, v1.z );
		pos = new THREE.Vector3().addVectors( param_wall.posS, v1 );

		var pos3 = obj.position.clone();
		var pos2 = new THREE.Vector3().subVectors( pos, obj.position );			
		// ------------
		
		
		pos2 = new THREE.Vector3().subVectors ( changeWallLimit(obj.userData.wall.p[0], pos2, param_wall.qt_1, dir), obj.userData.wall.p[0].position ); 
		pos2 = new THREE.Vector3().subVectors ( changeWallLimit(obj.userData.wall.p[1], pos2, param_wall.qt_2, dir), obj.userData.wall.p[1].position );
		
		
		pos2 = new THREE.Vector3(pos2.x, 0, pos2.z);
						
		obj.userData.wall.p[0].position.add( pos2 );
		obj.userData.wall.p[1].position.add( pos2 );		
		
		
		for ( var i = 0; i < clickO.click.wall.length; i++ )
		{ 
			updateWall(clickO.click.wall[i]);		
		}
		
		upLineYY(obj.userData.wall.p[0]);
		upLineYY(obj.userData.wall.p[1]);
		
		upLabelPlan_1(param_wall.wallR); 
	}	
}






// ограничение длины стены (точка не может быть перемещена за пределы длины стены или при встречи с окном/дверью)
function changeWallLimit(point, pos2, qt, dir2)
{
	var pos = new THREE.Vector3().addVectors ( point.position, pos2 );	// получаем новое положение точки 
	
	for ( var i = 0; i < point.p.length; i++ )
	{
		if(point.w[i] == clickO.move){ continue; }
		
		var v = point.w[i].userData.wall.v;
		
		
		if(point.start[i] == 0)
		{
			var x1_a = v[0].x;
			var x1_b = v[4].x;				
			var x2_a = v[6].x;
			var x2_b = v[10].x;
			

			var v2 = localTransformPoint( new THREE.Vector3().subVectors( new THREE.Vector3(0,0,0), pos2 ), qt[i] );
			
			var fg1 = false;
			var fg2 = false;
			if(x2_a - (x1_a + v2.z) <= 0.05){ fg1 = true; }
			if(x2_b - (x1_b + v2.z) <= 0.05){ fg2 = true; } 
			if(fg1 & fg2)
			{ 
				if(x2_a - (x1_a + v2.z) < x2_b - (x1_b + v2.z) ){ fg2 = false; } 
				else{ fg1 = false; }
			}
			
						
			if(fg1)
			{				
				var zx1 = v[6].clone();	
				zx1.x -= 0.05;						
				
				var zx2 = new THREE.Vector3().subVectors( v[4], v[0] );	
				zx2.add( zx1 );		
				
				var ps3 = new THREE.Vector3().subVectors( zx2, zx1 ).divideScalar ( 2 );
				ps3.add( zx1 );				
				pos = point.w[i].localToWorld( ps3.clone() );
			}			
			else if(fg2)
			{	
				var zx1 = v[10].clone();	
				zx1.x -= 0.05;						
				
				var zx2 = new THREE.Vector3().subVectors( v[0], v[4] );	
				zx2.add( zx1 );		
				
				var ps3 = new THREE.Vector3().subVectors( zx2, zx1 ).divideScalar ( 2 );
				ps3.add( zx1 );			
				pos = point.w[i].localToWorld( ps3.clone() );	
			}
			
			
			if(fg1 | fg2)
			{
				var x1 = point.p[i].position.z - pos.z;
				var z1 = pos.x - point.p[i].position.x;			
				var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены					
				var ps = new THREE.Vector3().addVectors( pos, dir );
				pos = crossPointTwoLine(ps, pos, point.position, new THREE.Vector3().addVectors( point.position, pos2 ));
			}
		}
		else if(point.start[i] == 1)
		{
			var v2 = localTransformPoint( new THREE.Vector3().subVectors( pos2, new THREE.Vector3(0,0,0) ), qt[i] );
			
			var n = v.length;				
			var x1_a = v[n - 12].x;
			var x1_b = v[n - 8].x;				
			var x2_a = v[n - 6].x;
			var x2_b = v[n - 2].x;	

			
			var fg1 = false;
			var fg2 = false;
			if((x2_a + v2.z) - x1_a < 0.05){ fg1 = true; }
			if((x2_b + v2.z) - x1_b < 0.05){ fg2 = true; }
			if(fg1 & fg2)
			{ 
				if((x2_a + v2.z) - x1_a < (x2_b + v2.z) - x1_b){ fg2 = false; } 
				else{ fg1 = false; }
			}			

			
			if(fg1)
			{
				var zx1 = v[v.length - 12].clone();	
				zx1.x += 0.05;						
				
				var zx2 = new THREE.Vector3().subVectors( v[v.length - 2], v[v.length - 6] );	
				zx2.add( zx1 );		
				
				var ps3 = new THREE.Vector3().subVectors( zx2, zx1 ).divideScalar ( 2 );
				ps3.add( zx1 );				
				pos = point.w[i].localToWorld( ps3.clone() );
			}			
			else if(fg2)
			{			
				var zx1 = v[v.length - 8].clone();	// создаем точку, берем точка которая начинается у окна
				zx1.x += 0.05;						// прибавляем ей смещение (аналог v[v.length - 4] + смещение)
				
				var zx2 = new THREE.Vector3().subVectors( v[v.length - 6], v[v.length - 2] );	// находим разницу по длине между двумя точками
				zx2.add( zx1 );		// прибавляем эту разницу к созданой точки (аналог v[v.length - 5] + смещение)
				
				var ps3 = new THREE.Vector3().subVectors( zx2, zx1 ).divideScalar ( 2 );
				ps3.add( zx1 );		// находим центр у двух точек		
				pos = point.w[i].localToWorld( ps3.clone() );	// перводим в глобальные координаты								
			}
			
			
			if(fg1 | fg2)
			{
				var x1 = point.p[i].position.z - pos.z;
				var z1 = pos.x - point.p[i].position.x;			
				var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены					
				var ps = new THREE.Vector3().addVectors( pos, dir );
				pos = crossPointTwoLine(ps, pos, point.position, new THREE.Vector3().addVectors( point.position, pos2 ));
			}			
		}	

				
	}
	
	return pos;
}








// находим все соседние стены с которые находятся на одном уровне и напрвлении 
function detectDirectionWall_1(wall, index, room) 
{
	var p = wall.userData.wall.p;
	var dir1 = new THREE.Vector3().subVectors( p[1].position, p[0].position ).normalize();						
	var unique = detectDirectionWall_2([{ obj : wall, dir : 'forward' }], p, dir1);	
	
	var arrW = [];
	var arrS = [];
	for (i = 0; i < unique.length; i++) 
	{  
		arrW[i] = unique[i].obj; 
		arrS[i] = (unique[i].dir == 'forward') ? index : (index == 1) ? 2 : 1; 	// находим какой стороной стены повернуты к выбранной комнате
	}
	
		
	arrWallFront.index = index;  
	arrWallFront.room = room;
	arrWallFront.wall = [];	  
	arrWallFront.wall_2 = [];	// боковые стены (если это комната)  
	//arrWallFront.objPop = { obj_1 : [], obj_2 : [] };
	
	// убираем из массива все стены, которые не принадлежат к выбранной комнате
	if(room)
	{
		for (var i = arrW.length - 1; i >= 0; i--) 
		{ 
			var flag = true;
			
			for (var i2 = 0; i2 < room.w.length; i2++)  
			{
				if(arrW[i] == room.w[i2]) { flag = false; break; }
			}	

			if(flag) { arrW.splice(i, 1); arrS.splice(i, 1); }
		}

		// находим соседние стены и добавляем в массив 
		var arrW2 = [];
		for (var i = 0; i < arrW.length; i++)
		{
			var p = arrW[i].userData.wall.p;
			
			for (var i2 = 0; i2 < p.length; i2++)
			{
				for (var i3 = 0; i3 < p[i2].w.length; i3++)
				{
					if(p[i2].w[i3] == arrW[i]) continue;		// если стена уже есть в arrW, то пропускаем эту стену 
					
					var flag = false;					
					for (var i4 = 0; i4 < arrW.length; i4++)  
					{
						if(p[i2].w[i3] == arrW[i4]) { flag = true; break; }		// если стена уже есть в arrW, то пропускаем эту стену 
					}										
					if(flag) { continue; }
				
					
					for (var i4 = 0; i4 < room.w.length; i4++)  
					{
						// если стена относится к выбранной room, то добавляем в массив
						if(p[i2].w[i3] == room.w[i4]) 
						{ 
							var dir2 = new THREE.Vector3().subVectors( p[i2].w[i3].userData.wall.p[1].position, p[i2].w[i3].userData.wall.p[0].position ).normalize();
							var rad = new THREE.Vector3(dir1.z, 0, dir1.x).angleTo(new THREE.Vector3(dir2.z, 0, dir2.x));
							
							if(index == 2) if(Math.round(THREE.Math.radToDeg(rad)) > 90) continue;		// если стена перекрывает вид на фтронтальные стены, то не отображаем эту стену
							if(index == 1) if(Math.round(THREE.Math.radToDeg(rad)) < 90) continue; 
							//
							
							arrW2.push(p[i2].w[i3]); 
							break; 
						}	
					}					
				}
			}			
		}
		
		arrWallFront.wall_2 = arrW2; 	
	}
	

	// добавляем стены которые находятся на одном уровне и напрвлении
	for (i = 0; i < arrW.length; i++) 
	{ 
		arrWallFront.wall[i] = { obj : arrW[i], index : arrS[i] };  
	}


	// переводим вершины (у всех стен) в локальные значения для выбранной стены   
	var arrV2 = [];
	for (i = 0; i < arrW.length; i++)
	{
		arrW[i].updateMatrixWorld();
		var v = arrW[i].userData.wall.v;			
		
		var arrN = (arrS[i] == 2) ? [4,5,11,10] : [0,1,7,6];

		for (i2 = 0; i2 < arrN.length; i2++)
		{ 
			if(i == 0) { arrV2[arrV2.length] = v[arrN[i2]].clone(); }
			else 
			{ 
				var worldV = arrW[i].localToWorld( v[arrN[i2]].clone() ); 
				arrV2[arrV2.length] = arrW[0].worldToLocal( worldV );  
			}
		}
		
	}
	
	// находим из значений вершин всех стен min/max значения ширины и высоты
	var box = { min : { x : arrV2[0].x, y : arrV2[0].y }, max : { x : arrV2[0].x, y : arrV2[0].y } };
	
	for (i = 0; i < arrV2.length; i++)
	{
		if(arrV2[i].x < box.min.x) { box.min.x = arrV2[i].x; }
		else if(arrV2[i].x > box.max.x) { box.max.x = arrV2[i].x; }
		
		if(arrV2[i].y < box.min.y) { box.min.y = arrV2[i].y; }
		else if(arrV2[i].y > box.max.y) { box.max.y = arrV2[i].y; }			
	}
	
	
	var arrV3 = 
	[
		new THREE.Vector3(box.min.x, box.min.y, 0), 
		new THREE.Vector3(box.min.x, box.max.y, 0),
		new THREE.Vector3(box.max.x, box.max.y, 0),
		new THREE.Vector3(box.max.x, box.min.y, 0), 
	];
	
	
	// зная min/max ширины/высоты, находим крайние точки 
	var arrV = [];
	
	for (i = 0; i < arrV3.length; i++)
	{
		var min = 99999;
		var n = 0;
		
		for (i2 = 0; i2 < arrV2.length; i2++)
		{
			var d = arrV3[i].distanceTo(arrV2[i2]); 
			
			if(min > d) { n = i2; min = d; }
		}
		
		arrV[i] = arrV2[n];
	}	
	
	arrV[arrV.length] = arrV[0].clone();
	
	var vZ = (index == 2) ? v[4].z : v[0].z;
	for (i = 0; i < arrV.length; i++) { arrV[i].z = vZ; }


	
	// нужно для cameraWall, чтобы подсчитать zoom 		
	arrWallFront.bounds = { min : { x : 0, y : 0 }, max : { x : 0, y : 0 } };
	
	var xC = (box.max.x - box.min.x)/2 + box.min.x;
	var yC = (box.max.y - box.min.y)/2 + box.min.y;
	
	arrWallFront.bounds.min.x = wall.localToWorld( new THREE.Vector3(box.min.x, yC, vZ) );	 
	arrWallFront.bounds.max.x = wall.localToWorld( new THREE.Vector3(box.max.x, yC, vZ) );
	arrWallFront.bounds.min.y = wall.localToWorld( new THREE.Vector3(xC, box.min.y, vZ) );
	arrWallFront.bounds.max.y = wall.localToWorld( new THREE.Vector3(xC, box.max.y, vZ) );	
	
	return arrV;
}



// находим все соседние стены с которые находятся на одном уровне и напрвлении 
// из-за того что забыл поставить var i, она была глобальной и всё ломалось ( рекурсия )
function detectDirectionWall_2(arr, p, dir1)
{
	// находим у стены все соседние стены с которыми она соединяется 
	var arrW = [...new Set([...p[0].w, ...p[1].w])];		// объединяем массивы, в результате в новом массиве будет только неповторяющиеся объекты (стены) ES6	
	
	// находим стены, которые параллельны главной стене
	for (var i = 0; i < arrW.length; i++)
	{ 	
		var flag = false;
		for (i2 = 0; i2 < arr.length; i2++) { if(arrW[i] == arr[i2].obj) { flag = true; break; } }
		if(flag) continue;
		
		var dir2 = new THREE.Vector3().subVectors( arrW[i].userData.wall.p[1].position, arrW[i].userData.wall.p[0].position ).normalize();
		
		var str = null;
		
		if(comparePos(dir1, dir2)) { str = 'forward'; }
		else if(comparePos(dir1, new THREE.Vector3(-dir2.x,-dir2.y,-dir2.z))) { str = 'back'; }
		
		if(str) 
		{ 	
			arr[arr.length] = { obj : arrW[i], dir : str }; 
			arr = detectDirectionWall_2(arr, arrW[i].userData.wall.p, dir1); 
		}
	}		

	
	return arr;
}


// определяем к какому помещению принадлежит выделенная сторона стены 
function detectRoomWallSide(wall, index)
{
	var num = -1;
	
	for ( var i = 0; i < room.length; i++ ) 
	{  
		for ( var i2 = 0; i2 < room[i].w.length; i2++ )
		{
			if(wall == room[i].w[i2])
			{
				var side = (index == 1) ? 1 : 0;
				
				if(side == room[i].s[i2]) { num = i; }
				
				break;
			} 
		}	
	}

	if(num == -1) { return null; /* стена не принадлежит ни одному помещению */ };

	return room[num];
}



// сняли клик с мышки после токо как кликнули на стену
function clickWallMouseUp(wall)
{
	if(comparePos(wall.userData.wall.last.pos, wall.position)) { return; }		// не двигали
	
	upLineYY( wall.userData.wall.p[ 0 ] );
	upLineYY( wall.userData.wall.p[ 1 ] );
	upLabelPlan_1( param_wall.wallR ); 
	updateShapeFloor( param_wall.arrZone ); 
		
	
	clickPointUP_BSP(param_wall.wallR);
	
	calculationAreaFundament_2(wall);
}




var param_win = { click : false };


function clickWD( intersect )
{	
	var obj = intersect.object;

	clickO.move = obj;
	
	var pos = intersect.point;
	
	if(camera != cameraWall) { pos.y = obj.position.y; }
	
	if(camera == cameraTop) 
	{
		planeMath.position.set( 0, pos.y, 0 );
		planeMath.rotation.set(-Math.PI/2, 0, 0);			
	}
	else
	{
		planeMath.position.copy( pos );
		planeMath.rotation.set( 0, obj.rotation.y, 0 );					
	}	
	
	planeMath.updateMatrixWorld();  //  (для того, что бы при первом клике, окно не улетало на старое место, где до этого стояла мат.плоскость)	

	param_win.click = true;

	obj.userData.door.offset = new THREE.Vector3().subVectors( obj.position, pos );	
	
	findOnWallWD(obj);	
}




// находим у окна/двери ближайшие объекты (ограничевающие перемещение)
// если их нету, то находим концы стены
function findOnWallWD(wd)
{
	wd.geometry.computeBoundingBox();
	
	var wall = wd.userData.door.wall;
	wall.geometry.computeBoundingBox();	
	
	var off = 0.0;	// отступы от краев
	var off_2 = 0.0;
	
	wd.userData.door.bound = { min : { x : wall.geometry.boundingBox.min.x + off, y : wall.geometry.boundingBox.min.y + off_2 }, max : { x : wall.geometry.boundingBox.max.x - off, y : wall.geometry.boundingBox.max.y - off } };
	
	//var arrWD = wallLeftRightWD_2(wd);
	var arrWD = {};
	if(arrWD.left && 1==2)
	{
		arrWD.left.updateMatrixWorld();
		var pos = arrWD.left.worldToLocal( wd.position.clone() );	 	
		var n = getMinDistanceVertex(arrWD.left.geometry.vertices, pos);
		
		var pos = arrWD.left.localToWorld( arrWD.left.geometry.vertices[n].clone() );		
		
		wd.userData.door.bound.min.x = wall.worldToLocal( pos.clone() ).x + off;
	}
	

	if(arrWD.right && 1==2)
	{
		arrWD.right.updateMatrixWorld();
		var pos = arrWD.right.worldToLocal( wd.position.clone() );	 	
		var n = getMinDistanceVertex(arrWD.right.geometry.vertices, pos);
		
		var pos = arrWD.right.localToWorld( arrWD.right.geometry.vertices[n].clone() );
		
		wd.userData.door.bound.max.x = wall.worldToLocal( pos.clone() ).x - off;
	}		
	
	wd.userData.door.last.pos = wd.position.clone();	
}




// определяем есть ли между окном другие окна/двери и находим ближайшие
function wallLeftRightWD_2(wd)
{	
	var wall = wd.userData.door.wall;

	wall.updateMatrixWorld();
	
	var posC = wall.worldToLocal( wd.position.clone() );	// позиция главного окна относительно стены
	
	var arrL = { x : 99999, o : null }, arrR = { x : 99999, o : null };
	
	for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
	{		
		if(wall.userData.wall.arrO[i] == wd) continue;
		
		var v = wall.worldToLocal( wall.userData.wall.arrO[i].position.clone() );
		
		var x = Math.abs(v.x - posC.x); 
		
		if (v.x <= posC.x) { if(x < arrL.x) { arrL.x = x; arrL.o = wall.userData.wall.arrO[i]; } }
		else { if(x < arrR.x) { arrR.x = x; arrR.o = wall.userData.wall.arrO[i]; } }		
	}	
	
	return { left : arrL.o, right : arrR.o };
}




// находим ближайшую точку к выброанной позиции
function getMinDistanceVertex(v, pos)
{
	var minDist = 99999;
	var hit = 0;

	for ( var i = 0; i < v.length; i++ )
	{
		var dist = pos.distanceTo(v[i]);
		if (dist <= minDist)
		{
			minDist = dist;
			hit = i;
		}
	}	

	return hit;
}


 

function moveWD( event, wd ) 
{
	if(camera == camera3D) { return; }
	
	var intersects = rayIntersect( event, planeMath, 'one' ); 	
	if ( intersects.length > 0 ) { moveWD_2( wd, intersects[ 0 ].point ); }	
}


var objsBSP = null;
var objClone = new THREE.Mesh();
var wallClone = new THREE.Mesh();

function moveWD_2( wd, pos )
{
	var wall = wd.userData.door.wall;
	
	if(param_win.click)  
	{ 
		param_win.click = false; 

		wallClone.geometry = clickMoveWD_BSP( wd ).geometry.clone(); 
		wallClone.position.copy( wd.userData.door.wall.position ); 
		wallClone.rotation.copy( wd.userData.door.wall.rotation );
		
		objsBSP = { wall : wallClone, wd : createCloneWD_BSP( wd ) };
		
		// меняем цвет у wd
		wd.material.depthTest = false;  
		wd.material.opacity = 1.0; 		 			
	}
	
	pos = new THREE.Vector3().addVectors( wd.userData.door.offset, pos );			
	pos = wall.worldToLocal( pos.clone() );
	
	var x_min = wd.geometry.boundingBox.min.x;
	var x_max = wd.geometry.boundingBox.max.x;
	var y_min = wd.geometry.boundingBox.min.y;
	var y_max = wd.geometry.boundingBox.max.y;
	
	var bound = wd.userData.door.bound;
	
	if(pos.x + x_min < bound.min.x){ pos.x = bound.min.x - x_min; }
	else if(pos.x + x_max > bound.max.x){ pos.x = bound.max.x - x_max; }	
	
	// ограничение по высоте при перемещении wd
	if(camera != cameraTop)
	{
		if(pos.y + y_min < bound.min.y){ pos.y = bound.min.y - y_min; }
		else if(pos.y + y_max > bound.max.y){ pos.y = bound.max.y - y_max; }
	}	
	
	if(camera == cameraTop){ pos.z = 0; }	
	
	var pos = wall.localToWorld( pos.clone() );
	
	var pos2 = new THREE.Vector3().subVectors( pos, wd.position );
	
	wd.position.copy( pos );	

	wd.userData.door.h1 += pos2.y;
	//UI('window_above_floor_1').val(Math.round(wd.userData.door.h1 * 100) * 10);
	
	for ( var i = 0; i < arrSize.cube.length; i++ ) { arrSize.cube[i].position.add( pos2 ); } 	// меняем расположение контроллеров
	
	showRulerWD_2D(wd); 	// перемещаем линейки и лайблы
	showRulerWD_3D(wd);
}




// скрываем размеры и котнроллеры у окна/двери
function hideSizeWD( obj )
{	
	if(clickO.rayhit) 
	{
		if(clickO.rayhit.object == obj) return;	// кликнули на один и тот же активный объект
		
		if(clickO.rayhit.object.userData.tag == 'controll_wd')
		{
			if(clickO.rayhit.object.userData.controll_wd.obj == obj) { return; }
		}		
	}		
		
	if(camera == cameraTop || camera == camera3D) 
	{ 		
		if(obj)
		{
			if(obj.userData.tag == 'door' || obj.userData.tag == 'window')
			{
				if(camera == camera3D)
				{
					obj.userData.door.wall.label[0].visible = true; 
					obj.userData.door.wall.label[1].visible = true;	 
				}
				else
				{
					for ( var i = 0; i < arrWallFront.wall.length; i++ )
					{
						arrWallFront.wall[i].obj.label[0].visible = true;
						arrWallFront.wall[i].obj.label[1].visible = true;		
					}					
				}
			}			
		}
	}
	
	for ( var i = 0; i < arrSize.cube.length; i++ ) { arrSize.cube[i].visible = false; }
	for ( var i = 0; i < arrSize.format_2.line.length; i++ ) { arrSize.format_2.line[i].visible = false; }
	for ( var i = 0; i < arrSize.format_2.label.length; i++ ){ arrSize.format_2.label[i].visible = false; }
	//for ( var i = 0; i < arrSize.cutoff.length; i++ ) { arrSize.cutoff[i].visible = false; }	
  	for ( var i = 0; i < arrSize.cutoff.length; i++ ){ arrSize.cutoff[i].visible = false; }
}


// кликнули на окно/дверь (показываем/скрываем таблицу, длина/ширина/высота )
function showTableWD(wd)
{			
	wd.geometry.computeBoundingBox();
	
	var minX = wd.geometry.boundingBox.min.x;
	var maxX = wd.geometry.boundingBox.max.x;
	var minY = wd.geometry.boundingBox.min.y;
	var maxY = wd.geometry.boundingBox.max.y;

	var d1 = Math.abs( maxX - minX );		
	var d2 = Math.abs( maxY - minY );			

	var wall = wd.userData.door.wall;
	var pos = wd.localToWorld( new THREE.Vector3(0,minY,0) );
	var h = wall.worldToLocal( pos.clone() ).y;	
	
	wd.userData.door.h1 = h; 

	$('[nameId="wd_menu_1"]').show();
	
	$('[nameId="size-wd-length"]').val(Math.round(d1 * 100) / 100);
	$('[nameId="size-wd-height"]').val(Math.round(d2 * 100) / 100);

}



// измененяем ширину и высоту окна/двери, высоту над полом
function inputWidthHeightWD(wd)
{  
	if(!wd) return;
	if(wd.userData.tag == 'window' || wd.userData.tag == 'door'){}
	else { return; }
	
	var wall = wd.userData.door.wall;
	
	var x = $('[nameId="size-wd-length"]').val();		// ширина окна	
	var y = $('[nameId="size-wd-height"]').val();		// высота окна
	var h = 0;					// высота над полом	
	
	
	// если знаначения ввели с ошибкой, то исправляем
	if(1==1)
	{
		x = x.replace(",", ".");
		y = y.replace(",", ".");
		
		wd.geometry.computeBoundingBox();
		var x2 = (Math.abs(wd.geometry.boundingBox.max.x) + Math.abs(wd.geometry.boundingBox.min.x));
		var y2 = (Math.abs(wd.geometry.boundingBox.max.y) + Math.abs(wd.geometry.boundingBox.min.y));		
		
		x = (isNumeric(x)) ? x : x2;
		y = (isNumeric(y)) ? y : y2;		
	}
	
	
	// ограничение размеров
	if(1==1)
	{
		if(x > 10) { x = 10; }
		else if(x < 0.1) { x = 0.1; }

		if(y > 5) { y = 5; }
		else if(y < 0.1) { y = 0.1; }	
	}
	
	
	//var h = Number(UI('window_above_floor_1').val()) / 1000 - wd.userData.door.h1;		// высота над полом	
	
	h += (y - Math.abs( wd.geometry.boundingBox.max.y - wd.geometry.boundingBox.min.y )) / 2;    // вычитаем изменение высоты окна/двери  
	
	var pos = wd.position.clone();
	pos.y += h;		// вычитаем изменение высоты окна/двери
	wd.userData.door.h1 += h;
	
	сhangeSizePosWD( wd, pos, x, y );	// изменяем размер окна/двери, а также перемещаем
	
	wallClone.geometry = clickMoveWD_BSP( wd ).geometry.clone(); 
	wallClone.position.copy( wd.userData.door.wall.position ); 
	wallClone.rotation.copy( wd.userData.door.wall.rotation );		

	MeshBSP( wd, { wall : wallClone, wd : createCloneWD_BSP( wd ) } ); 	
	
	wd.updateMatrixWorld();
	
	showRulerWD(wd);	// показываем линейки и контроллеры для окна/двери
	
	showTableWD(wd);		// обновляем меню
	
	renderCamera();
}




// изменяем размер окна/двери, а также перемещаем
function сhangeSizePosWD( wd, pos, x, y )
{	
	var v = wd.geometry.vertices;
	var v2 = wd.userData.door.form.v2;
	var size = wd.userData.door.form.size;
	
	var scale = new THREE.Vector3(x/size.x, y/size.y, 1);	
	
	for ( var i = 0; i < v2.length; i++ )
	{
		v[i].x = v2[i].x * scale.x;
		v[i].y = v2[i].y * scale.y;
		//v[i].z *= objPop.scale.z;
	}		

	wd.geometry.verticesNeedUpdate = true;
	wd.geometry.elementsNeedUpdate = true;	
	wd.geometry.computeBoundingSphere();

	wd.position.copy( pos );
}




// сняли клик с мышки после токо как кликнули на WD
function clickWDMouseUp(wd)
{
	if(param_win.click) { param_win.click = false; return; }
	
	MeshBSP( wd, objsBSP );
	 
	if(camera == cameraTop)
	{ 
		wd.material.depthTest = false;  
		wd.material.opacity = 1.0; 		 	
	}
	else
	{ 		
		wd.material.depthTest = true;
		wd.material.transparent = true;
		wd.material.opacity = 0;					
	}	

	//if(comparePos(wd.userData.door.last.pos, wd.position)) { return; }		// не двигали	
}




function detectDeleteObj()
{
	var obj = clickO.last_obj;
	
	if(!obj) return;
	if(!obj.userData.tag) return;
	
	var tag = obj.userData.tag;
	
	if(camera == camera3D)
	{
		if ( tag == 'wall' ) return;
	}
	else if(camera == cameraWall)
	{
		if ( tag == 'wall' ) return;
	}	
		
	if ( tag == 'wall' ) { deleteWall_1( obj ).room; }
	else if ( tag == 'point' ) { if(obj.p.length == 2) { deletePoint( obj ); } }
	else if ( tag == 'window' || tag == 'door' ) { deleteWinDoor( obj ); }
	else if ( tag == 'obj' ) { deleteObjectPop(obj); }
	
	 renderCamera();
}


function deleteWall_1( wall )
{	
	//hideMenuObjUI_2D(wall);
//calculationZoneFundament_1(wall)
	hideMenuUI(wall);
	
	var points = wall.userData.wall.p;

	var arrZone = detectCommonZone_1( wall );
	var oldZ = findNumberInArrRoom(arrZone);
	deleteArrZone(arrZone); 
	
	var zone = (arrZone.length == 0) ? rayFurniture( wall ).obj : null; 
	
	deleteWall_2(wall);
	
	var newZones = [];
	
	// новые зоны, после удаления стены 
	if(oldZ.length > 0) 
	{ 
		var area = oldZ[0].floor.userData.room.areaTxt;
		var n = 0;
		for ( var i = 0; i < oldZ.length; i++ ) { if(oldZ[i].floor.userData.room.areaTxt > area) { n = i; } }
		
		newZones = detectRoomZone();

		if(newZones.length > 0) { assignOldToNewZones_2([newZones[0]], oldZ[n], false); } // если есть новая зона после удаления стены		
	}
	else
	{	
		if(zone) { getYardageSpace([zone]); }				
	}
	
	
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai')	
	{
		if(points[0].w.length > 0)
		{
			createWallZone(points[0].w[0]); 
		}
		
		if(points[1].w.length > 0)
		{
			createWallZone(points[1].w[0]);
		}

		if(points[0].w.length == 0 && points[1].w.length == 0) { scene.remove(wall.userData.wall.zone.label); }
	}

	return { room : newZones }; 
}


// здесь только удаление стены, без обновления зон/площади/пола
function deleteWall_2(wall)
{
	objDeActiveColor_2D();
	
	var arr = wall.userData.wall.arrO;

	for(var i = 0; i < arr.length; i++)
	{
		if(arr[i].userData.tag == 'window') { deleteValueFromArrya({arr : infProject.scene.array.window, o : arr[i]}); }
		if(arr[i].userData.tag == 'door') { deleteValueFromArrya({arr : infProject.scene.array.door, o : arr[i]}); }
		scene.remove( arr[i] );
	}

	var p0 = wall.userData.wall.p[0];
	var p1 = wall.userData.wall.p[1]; 
	deleteOneOnPointValue(p0, wall);
	deleteOneOnPointValue(p1, wall);
	deleteValueFromArrya({arr : infProject.scene.array.wall, o : wall});;
	
	for ( var i = 0; i < wall.label.length; i ++ ){ scene.remove(wall.label[i]); } 
	scene.remove( wall );
	
	if(p0.w.length == 0){ deletePointFromArr( p0 ); scene.remove( p0 ); }
	if(p1.w.length == 0){ deletePointFromArr( p1 ); scene.remove( p1 ); }


	var arrW = [];
	for ( var i = 0; i < p0.w.length; i++ ) { arrW[arrW.length] = p0.w[i]; }
	for ( var i = 0; i < p1.w.length; i++ ) { arrW[arrW.length] = p1.w[i]; }  
	clickMovePoint_BSP( arrW );	
	
	if(p0.w.length > 0){ upLineYY_2(p0, p0.p, p0.w, p0.start); }
	if(p1.w.length > 0){ upLineYY_2(p1, p1.p, p1.w, p1.start); }

	upLabelPlan_1(arrW);
	
	clickPointUP_BSP( arrW );
}


// удаляем разделяемую стену и окна/двери, которые принадлежат ей (без удаления зон)
function deleteWall_3(wall, cdm)
{
	if(!cdm) { cdm = {}; }
	if(!cdm.dw) { cdm.dw = ''; }
	
	objDeActiveColor_2D();
	
	if(cdm.dw == 'no delete') {}
	else
	{
		var arr = wall.userData.wall.arrO;
		
		for(var i = 0; i < arr.length; i++)
		{
			if(arr[i].userData.tag == 'window') { deleteValueFromArrya({arr : infProject.scene.array.window, o : arr[i]}); }
			if(arr[i].userData.tag == 'door') { deleteValueFromArrya({arr : infProject.scene.array.door, o : arr[i]}); }
			scene.remove( arr[i] );
		}		
	}

	var p0 = wall.userData.wall.p[0];
	var p1 = wall.userData.wall.p[1]; 
	deleteOneOnPointValue(p0, wall);
	deleteOneOnPointValue(p1, wall);
	deleteValueFromArrya({arr : infProject.scene.array.wall, o : wall});;
	
	for ( var i = 0; i < wall.label.length; i ++ ){ scene.remove(wall.label[i]); }	
	scene.remove( wall );
	
	if(p0.w.length == 0){ deletePointFromArr( p0 ); scene.remove( p0 ); }
	if(p1.w.length == 0){ deletePointFromArr( p1 ); scene.remove( p1 ); }

}


// удаляем одну единственную точку (без стен), которая привязанна к мыши
function deleteOnePoint( point )
{
	deletePointFromArr(point); 
	scene.remove(point);
}

// удаление точки
function deletePoint( point )
{
	if(!point){ return [ null, null ]; }
	if(point.p.length != 2){ return [ null, null ]; }
	
	hideMenuUI(point);
	
	var wall_1 = point.w[0];
	var wall_2 = point.w[1];
		
	var arrW_2 = detectChangeArrWall([], point);
	
	clickMovePoint_BSP( arrW_2 );
	 
	var point1 = point.p[0];
	var point2 = point.p[1];
	
	var p1 = { id : point1.userData.id, pos : point1.position.clone() };
	var p2 = { id : point2.userData.id, pos : point2.position.clone() };	

	var dir1 = new THREE.Vector3().subVectors( point.position, point1.position ).normalize();
	var dir2 = new THREE.Vector3().subVectors( point2.position, point.position ).normalize();
	
	var d1 = wall_1.userData.wall.p[0].position.distanceTo( wall_1.userData.wall.p[1].position );
	var d2 = wall_2.userData.wall.p[0].position.distanceTo( wall_2.userData.wall.p[1].position );
	
	var wall = (d1 > d2) ? wall_1 : wall_2;	
	var res = (d1 > d2) ? 1 : 2;
	
	
	// собираем данные о стене
	var width = wall.userData.wall.width;
	var height = wall.userData.wall.height_1;
	var offsetZ = wall.userData.wall.offsetZ;
	var material = wall.material;
	var userData_material = wall.userData.material;
	
	// переварачиваем текстуру, если текструа была на одной стороне, то переносим ее на другую сторону стены
	if(res == 1)
	{
		if(point.start[0] != 1)		
		{
			material = [wall.material[0], wall.material[2], wall.material[1], wall.material[3]];
			userData_material = [wall.userData.material[0], wall.userData.material[2], wall.userData.material[1], wall.userData.material[3]];			
		}
	}
	if(res == 2)
	{
		if(point.start[1] != 0)
		{
			material = [wall.material[0], wall.material[2], wall.material[1], wall.material[3]];
			userData_material = [wall.userData.material[0], wall.userData.material[2], wall.userData.material[1], wall.userData.material[3]];			
		}
	}	
	
	// собираем данные об окнах/дверях, принадлежащие разделяемой стене 
	var arrO = [];
	for ( var i = 0; i < wall_1.userData.wall.arrO.length; i++ )
	{
		var n = arrO.length;
		var wd = wall_1.userData.wall.arrO[i];
		arrO[n] = { id : wd.userData.id, lotid: wd.userData.door.lotid, pos : wd.position.clone(), wall : null };
		arrO[n].size = wd.userData.door.size;
		if(wd.userData.door.open_type) { arrO[n].open_type = wd.userData.door.open_type; }
	}

	for ( var i = 0; i < wall_2.userData.wall.arrO.length; i++ )
	{
		var n = arrO.length;
		var wd = wall_2.userData.wall.arrO[i];
		arrO[n] = { id : wd.userData.id, lotid: wd.userData.door.lotid, pos : wd.position.clone(), wall : null };
		arrO[n].size = wd.userData.door.size;
		if(wd.userData.door.open_type) { arrO[n].open_type = wd.userData.door.open_type; }
	}
	
	var oldZones = detectCommonZone_1( wall_1 );   	// определяем с какиеми зонами соприкасается стена
	var oldZ = findNumberInArrRoom( oldZones );
	deleteArrZone( oldZones );						// удаляем зоны  с которыми соприкасается стена									

	
	deleteWall_3( wall_1 );		// удаляем разделяемую стену и окна/двери, которые принадлежат ей (без удаления зон)		
	deleteWall_3( wall_2 );		// удаляем разделяемую стену и окна/двери, которые принадлежат ей (без удаления зон)	
	 

	// находим точки (если стена была отдельна, то эти точки удалены и их нужно заново создать)
	var point1 = findObjFromId( 'point', p1.id );
	var point2 = findObjFromId( 'point', p2.id );	
	
	if(point1 == null) { point1 = createPoint( p1.pos, p1.id ); }
	if(point2 == null) { point2 = createPoint( p2.pos, p2.id ); }	
	
	var wall = createOneWall3( point1, point2, width, { offsetZ : offsetZ, height : height } ); 

	upLineYY_2(point1, point1.p, point1.w, point1.start);
	upLineYY_2(point2, point2.p, point2.w, point2.start);
	
	var arrW = [];
	for ( var i = 0; i < arrW_2.length; i++ ) { arrW[arrW.length] = arrW_2[i]; }
	arrW[arrW.length] = wall;
	
	upLabelPlan_1( arrW );	
	
	var newZones = detectRoomZone();		// создаем пол, для новых помещений	
	assignOldToNewZones_1(oldZ, newZones, 'delete');		// передаем параметры старых зон новым	(название зоны)			
	
	
	// вставляем окна/двери (если стены параллельны)
	if(comparePos(dir1, dir2)) 
	{
		for ( var i = 0; i < arrO.length; i++ ) { arrO[i].wall = wall; } 
	}
	
	// накладываем материал
	wall.material = [ material[0].clone(), material[1].clone(), material[2].clone(), material[3].clone() ]; 
	wall.userData.material = userData_material; 
	
	clickPointUP_BSP( arrW );
	
	infProject.tools.axis[0].visible = false;
	infProject.tools.axis[1].visible = false; 

	createWallZone(wall);
	calculationAreaFundament_2();
	
	return { point : { id : point.userData.id }, wall : wall }; 
} 



// удаление объекта (окно/дверь) из сцены
function deleteWinDoor( obj )
{	
	var wall = obj.userData.door.wall; 		
	
	clickMoveWD_BSP( obj );		
		
	deleteValueFromArrya({arr : wall.userData.wall.arrO, o : obj});	
	
	if(obj.userData.tag == 'window') { hideMenuUI(obj); }
	if(obj.userData.tag == 'door') { hideMenuUI(obj); }
	
	clickO = resetPop.clickO();
	hideSizeWD( obj ); 

	if(camera == camera3D)
	{
		wall.label[0].visible = false; 
		//wall.label[1].visible = false;	 			
	}
	
	
	if(obj.userData.tag == 'window') { deleteValueFromArrya({arr : infProject.scene.array.window, o : obj}); }
	if(obj.userData.tag == 'door') { deleteValueFromArrya({arr : infProject.scene.array.door, o : obj}); }
	
	scene.remove( obj );	
}






// удаление значения из массива 
function deleteValueFromArrya(cdm)
{
	var arr = cdm.arr;
	var o = cdm.o;
	
	for(var i = arr.length - 1; i > -1; i--) { if(arr[i] == o) { arr.splice(i, 1); break; } }
}


// удаление у точки 3 параметров
function deleteOneOnPointValue(point, wall)
{
	var n = -1;
	for ( var i = 0; i < point.w.length; i++ ){ if(point.w[i].userData.id == wall.userData.id) { n = i; break; } }
	
	point.p.splice(n, 1);
	point.w.splice(n, 1);
	point.start.splice(n, 1);	
}




// удаление точки из массива точек
function deletePointFromArr(point)
{
	var n = -1;
	for ( var i = 0; i < obj_point.length; i++ ){ if(obj_point[i].userData.id == point.userData.id) { n = i; break; } }
	
	if(obj_point[n].userData.point.pillar) { scene.remove( obj_point[n].userData.point.pillar ); }
		
	obj_point.splice(n, 1);	
}







function createFloor(cdm)
{	
	var arrP = cdm.point;
	var arrW = cdm.wall;
	var arrS = cdm.side;
	var id = (cdm.id) ? cdm.id : null;
	var material = (cdm.material) ? cdm.material : null;
	
	var point_room = [];
	for ( var i = 0; i < arrP.length - 1; i++ ) 
	{  
		point_room[i] = new THREE.Vector2 ( arrP[i].position.x, arrP[i].position.z );		
	}
	
	//var str = ''; for ( var i = 0; i < arrP.length; i++ ) { str += ' | ' + arrP[i].userData.id; } 
		 
	
	var shape = new THREE.Shape( point_room );
	var geometry = new THREE.ShapeGeometry( shape );
	
	var n = room.length;	
	
	var color = 0xe3e3e5;
	
	if(infProject.settings.floor.color){ color = infProject.settings.floor.color; }
	
	var material =new THREE.MeshLambertMaterial( { color : color, lightMap : lightMap_1 } );
	
	room[n] = new THREE.Mesh( new THREE.ExtrudeGeometry( shape, { bevelEnabled: false, depth: infProject.settings.floor.height } ), material ); 
	
	room[n].position.set( 0, infProject.settings.floor.posY, 0 );
	room[n].rotation.set( Math.PI / 2, 0, 0 );	
	room[n].p = arrP;
	room[n].w = arrW; 
	room[n].s = arrS;	
	
	
	if(!id) { id = countId; countId++; }  

	room[n].userData.tag = 'room';
	room[n].userData.id = id;
	room[n].userData.room = { areaTxt : 0, p : arrP, w : arrW, s : arrS, outline : null };
	room[n].userData.room.height = infProject.settings.floor.height;
	room[n].userData.material = room[n].material.clone();		
	
	ceiling[n] = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color : 0xffffff, lightMap : lightMap_1 } ) );			
	ceiling[n].position.set( 0, arrP[0].position.y + infProject.settings.floor.height, 0 );
	ceiling[n].rotation.set( Math.PI / 2, 0, 0 );		
	ceiling[n].userData.tag = 'ceiling';
	ceiling[n].userData.id = id;
	ceiling[n].userData.material = ceiling[n].material.clone();
	ceiling[n].visible = false;

	
	if(infProject.settings.floor.material)
	{	
		var m = infProject.settings.floor.material;
		
		for ( var i = 0; i < m.length; i++ )
		{
			setTexture({obj:room[n], material:m[i]});
		}	
	}
	
	if(infProject.settings.floor.o)
	{ 	
		room[n].label = createLabelCameraWall({ count : 1, text : 0, size : 65, ratio : {x:256*4, y:256}, geometry : infProject.geometry.labelFloor, opacity : 0.5 })[0];
		
		if(!infProject.settings.floor.label) room[n].label.visible = false;
			
		getYardageSpace( [room[n]] ); 
		scene.add( room[n] ); 
		scene.add( ceiling[n] );		
	}
	else
	{
		upLabelPlan_1(arrW); // если нет пола (фундамент, то считаем длину стен)
	}

	// определяем к какой стороне стены принадлежит зона и записываем зону к этой стене 
	for ( var i = 0; i < arrW.length; i++ ) 
	{ 
		var ind = (arrS[i] == 0) ? 2 : 1; 
		arrW[i].userData.wall.room.side2[ind] = room[n]; 
	}	
	
	addParamPointOnZone(arrP, room[n]);
	
	
	
	return room[n];
}





// добавляем к точкам параметр зона и предыдущая точка
function addParamPointOnZone(arrP, zone)
{
	for ( var i = 0; i < arrP.length - 1; i++ ) 
	{  
		var k1 = (i == 0) ? arrP.length - 2 : i - 1;				
		var f = arrP[i].zone.length;
		arrP[i].zone[f] = zone; 
		arrP[i].zoneP[f] = arrP[k1]; 		
	}		
}



// добавляем к точкам параметр зона и предыдущая точка
function replaceParamPointOnZone(zone, newPoint, replacePoint)
{
	for ( var i = 0; i < zone.length; i++ )  
	{  		
		for ( var i2 = 0; i2 < zone[i].p.length; i2++ )
		{
			if(zone[i].p[i2] == replacePoint) { zone[i].p[i2] = newPoint; }
		}			
	}			
}




// при изменении формы пола обновляем geometry.faces
function updateShapeFloor(arrRoom)
{  
	if(!infProject.settings.floor.o) { return; }
	
	for ( var i = 0; i < arrRoom.length; i++ ) 
	{	 
		var point = [];
		for ( var i2 = 0; i2 < arrRoom[i].p.length - 1; i2++ ) { point[i2] = new THREE.Vector2 ( arrRoom[i].p[i2].position.x, arrRoom[i].p[i2].position.z ); }				
		
		var shape = new THREE.Shape( point );				

		var geometry = new THREE.ExtrudeGeometry( shape, { bevelEnabled: false, depth: infProject.settings.floor.height } ); 
		
		arrRoom[i].geometry.vertices = geometry.vertices;
		arrRoom[i].geometry.faces = geometry.faces;		
		arrRoom[i].geometry.verticesNeedUpdate = true;
		arrRoom[i].geometry.elementsNeedUpdate = true;
		
		arrRoom[i].geometry.computeBoundingSphere();
		arrRoom[i].geometry.computeBoundingBox();
		arrRoom[i].geometry.computeFaceNormals();
		
		arrRoom[i].position.y = infProject.settings.floor.posY;
		upUvs_1( arrRoom[i] );
		getYardageSpace([arrRoom[i]]); 

		// потолок	
		var num = 0;		
		for ( var i2 = 0; i2 < room.length; i2++ ) { if(room[i2].userData.id == arrRoom[i].userData.id) { num = i2; break; } }	// находим потолок	
		
		var geometry = new THREE.ShapeGeometry( shape );
		ceiling[num].geometry.vertices = geometry.vertices;
		ceiling[num].geometry.faces = geometry.faces;			
		ceiling[num].geometry.verticesNeedUpdate = true;
		ceiling[num].geometry.elementsNeedUpdate = true;
		
		ceiling[num].geometry.computeBoundingSphere();
		ceiling[num].geometry.computeBoundingBox();
		ceiling[num].geometry.computeFaceNormals();		
	}
	
	//getSkeleton_1(arrRoom);
}



// находим потолок, который соответсвует полу
function findNumberInArrRoom(arr) 
{
	var arrN = [];
	if(!Array.isArray(arr)) { var res = arr; var arr = [res]; }
	
	for ( var i = 0; i < arr.length; i++ )
	{
		for ( var i2 = 0; i2 < room.length; i2++ )
		{
			if(room[i2] == arr[i]) { arrN[i] = { floor : room[i2], ceiling : ceiling[i2] }; break; }
		}		
	}	
	
	return arrN;
}








// создаем пол 
function detectRoomZone()
{		
	var arrRoom = [];
	
	for ( var i = 0; i < obj_point.length; i++ )
	{			
		if(obj_point[i].p.length < 2){ continue; }

		for ( var i2 = 0; i2 < obj_point[i].p.length; i2++ )
		{
			if(obj_point[i].p[i2].p.length < 2){ continue; }									
			//if(checkeQuallyPointsZone(obj_point[i], obj_point[i].p[i2])){ continue; }
			

			var p = getContour_2([obj_point[i]], obj_point[i].p[i2]); 		
			 
			
			if(p[0] != p[p.length - 1]){ continue; }	
			if(p.length > 5){ if(p[1] == p[p.length - 2]) continue; }
			if(checkClockWise(p) <= 0){ continue; }		//var txt = ''; for ( var i3 = 0; i3 < p.length; i3++ ) { txt += ' | ' + p[i3].userData.id; } 						
			if(detectSameZone( obj_point[i].zone, p )){ continue; }
								
			 
			var arr = compileArrPointRoom_1(p);						
			
			arrRoom[arrRoom.length] = createFloor({point : p, wall : arr[0], side : arr[1]});			
			break; 
		}
	}

	return arrRoom;
}






// проверяем если зона с такими же точками
function detectSameZone( arrRoom, arrP )
{
	var flag = false;
	
	for ( var i = 0; i < arrRoom.length; i++ )
	{
		var ln = 0;
		
		if(arrRoom[i].p.length != arrP.length) { continue; }
			
		for ( var i2 = 0; i2 < arrRoom[i].p.length - 1; i2++ )
		{
			for ( var i3 = 0; i3 < arrP.length - 1; i3++ )
			{
				if(arrRoom[i].p[i2] == arrP[i3]) { ln++; }
			}
		}
		
		if(ln == arrP.length - 1) 
		{ 
			//
			//var txt = '---p---'; for ( var i3 = 0; i3 < arrP.length; i3++ ) { txt += ' | ' + arrP[i3].userData.id; } 	
			//var txt = '---zone---'; for ( var i3 = 0; i3 < arrRoom[i].p.length; i3++ ) { txt += ' | ' + arrRoom[i].p[i3].userData.id; }  
			flag = true; 
			break; 
		}
	}
	
	return flag;
}




// проверяем если зона с такими же точками (нужно saveLoad.js , загрузка файла)
function detectSameZone_2( arrRoom, arrP )
{
	var flag = false;
	var ln = 0;
	
	if(arrRoom.p.length - 1 != arrP.length) { return flag; }
		
	for ( var i2 = 0; i2 < arrRoom.p.length - 1; i2++ )
	{
		for ( var i3 = 0; i3 < arrP.length; i3++ )
		{
			if(arrRoom.p[i2].userData.id == arrP[i3]) { ln++; }
		}
	}
	
	if(arrRoom.p.length - 1 == ln) 
	{ 
		//
		//var txt = '---p---'; for ( var i3 = 0; i3 < arrP.length; i3++ ) { txt += ' | ' + arrP[i3]; } 	
		//var txt = '---zone---'; for ( var i3 = 0; i3 < arrRoom.p.length - 1; i3++ ) { txt += ' | ' + arrRoom.p[i3].userData.id; }  
		flag = true; 
	}
	
	return flag;
}
 

// проверяем, 2 точки принадлежат ли одной зоне или нет
function checkeQuallyPointsZone(p1, p2)
{
	for ( var i = 0; i < p1.zone.length; i++ )
	{
		for ( var i2 = 0; i2 < p2.zone.length; i2++ )
		{
			if(p1.zone[i] == p2.zone[i2]) 
			{ 
				if(p1 == p2.zoneP[i2]){ return true; } // принадлежат к этой же зоне
				if(p1.zoneP[i] == p2){ return true; }
			}
		}
	}
	
	return false;	// не принадлежат одной зоне
}





// ищем замкнутый контур
function getContour_2(arr, point)
{
	var p2 = arr[arr.length - 1];
	arr[arr.length] = point;
	
	
	var dir1 = new THREE.Vector3().subVectors( point.position, p2.position ).normalize();	
	
	var arrD = [];
	var n = 0;
	for ( var i = 0; i < point.p.length; i++ )
	{
		if(point.p[i] == p2){ continue; }		
		if(point.p[i].p.length < 2){ continue; }
		
		var dir2 = new THREE.Vector3().subVectors( point.p[i].position, point.position ).normalize();
		
		arrD[n] = [];
		arrD[n][1] = point.p[i];
		
		var d = (point.p[i].position.x - p2.position.x) * (point.position.z - p2.position.z) - (point.p[i].position.z - p2.position.z) * (point.position.x - p2.position.x);
		
		var angle = dir1.angleTo( dir2 );
		
		if(d > 0){ angle *= -1; }
		
		arrD[n][0] = angle;
		if(!isNumeric(angle)) { return arr; }
		//
		
		n++;
	}	
	
	
	if(arrD.length > 0)
	{ 
		arrD.sort(function (a, b) { return a[0] - b[0]; });
		
		for ( var i = 0; i < arrD.length; i++ )
		{			
			if(arr[0] != arrD[i][1]) { return getContour_2(arr, arrD[i][1]); }
			else { arr[arr.length] = arrD[i][1]; break; }						
		}
	}
	
	return arr;
}




 
// получаем стены принадлежащие контуру и как они расположены
function compileArrPointRoom_1(p)
{
	var w = [];  
	var s = [];
	
	for ( var i = 0; i < p.length - 1; i++ )
	{ 		
		for ( var y1 = 0; y1 < p[i].w.length; y1++ )
		{
			for ( var y2 = 0; y2 < p[i + 1].w.length; y2++ )
			{
				if(p[i].w[y1] == p[i + 1].w[y2])
				{
					w[i] = p[i].w[y1];
					s[i] = p[i].start[y1];
					continue;
				}
			}
		}
	}	
	
	return [w, s];			
}





// 1. удаляем у точек параметр зоны, к которым они принадлежали
// 2. обновляем точки (контур) существующей зоны
// 3. обновляем размеры стен
// 4. обновляем форму существующей зоны и обновляем площадь существующей зоны
function updateZone( point, obj, arrRoom, num, cdm )
{
	deletePointZone(arrRoom);		// 1 	
	updateZonePoints(cdm, arrRoom, num, point); 				// 2
	
	for ( var i = 0; i < arrRoom.length; i++ ) { calculateOneArea2(arrRoom[i], num[i], point, cdm); }	// 2
	
	if(obj.userData.tag == 'wall'){ var arr = detectChangeArrWall_2(obj); }
	else if(obj.userData.tag == 'point'){ var arr = detectChangeArrWall([], obj); }

	upLabelPlan_1(arr);				// 3
	updateShapeFloor(arrRoom);		// 4 	 
}

 
// обновляем кол-во точек для существующего контура 
// 1.1 добавили точку на стену
// 1.2 удалили точку на контуре
function updateZonePoints(cdm, arrRoom, numS, point)
{
	var zone = arrRoom;
	var num = numS;
	
	if(cdm.name == 'join')
	{
		zone = cdm.zone;
		num = cdm.num; 
		cdm = 'del';
	}
	
	for ( var i = 0; i < zone.length; i++ )
	{
		if(cdm == 'add') 			// 1.1
		{ 
			zone[i].p.splice(num[i], 0, point); 
		}		
		else if(cdm == 'del') 		// 1.2
		{ 				
			if(num[i] == 0 || num[i] == zone[i].p.length - 1)	// удалили точку которая в массиве контура стояла в начале или конце
			{
				zone[i].p.splice(0, 1);	
				zone[i].p.splice(zone[i].p.length - 1, 1);			
				zone[i].p[zone[i].p.length] = zone[i].p[0];
			}
			else { zone[i].p.splice(num[i], 1); }		// удалили точку которая была где-то в центре массива
		}		
	}
}



// 2. получаем стены принадлежащие контуру и как они расположены
// 3. добавляем к точкам параметр зона и предидущая точка 
// 4. обновляем принадлежащие стены и их расположение для контура
function calculateOneArea2(zoneIndex, num, point, cdm)
{		
	var arr = compileArrPointRoom_1(zoneIndex.p);	// 2			
	
	addParamPointOnZone(zoneIndex.p, zoneIndex);	// 3
				
	zoneIndex.w = arr[0]; 		// 4
	zoneIndex.s = arr[1];	
}




// проверяем если у point2 зона, которой нету у point1 (если есть то true) 
function checkCommonZonePoints(point1, point2)
{
	for ( var i = 0; i < point2.zone.length; i++ )
	{ 
		var flag = false;
		for ( var i2 = 0; i2 < point1.zone.length; i2++ )
		{			
			if(point2.zone[i] == point1.zone[i2]) { flag = true; break; }
		}
		if(!flag) { return true; }
	}
	
	return false;
}


function checkCommonZonePoints_2(point1, point2) 
{
	var arr = [];
	
	for ( var i = 0; i < point2.zone.length; i++ )
	{ 
		var flag = false;
		for ( var i2 = 0; i2 < point1.zone.length; i2++ )
		{			
			if(point2.zone[i] == point1.zone[i2]) { flag = true; break; }
		}
		if(!flag) { arr[arr.length] = point2.zone[i]; }
	}
	
	return arr;
}

 
// удаляем выбранные зоны 
function deleteArrZone(arrRoom)
{
	var roomType = [];
	var arrN = [];
	
	
	// обновляем у сторон стен зоны, к которым они принадлежат
	for(var i = 0; i < arrRoom.length; i++)
	{
		for(var i2 = 0; i2 < arrRoom[i].userData.room.w.length; i2++)
		{
			var wall = arrRoom[i].userData.room.w[i2];
			
			if(wall.userData.wall.room.side2[1] == arrRoom[i]){ wall.userData.wall.room.side2[1] = null; }
			else if(wall.userData.wall.room.side2[2] == arrRoom[i]){ wall.userData.wall.room.side2[2] = null; }
		}
	}
	
	
	// удаляем из массива room удаляемые зоны
	for ( var i = 0; i < room.length; i++ ) 
	{
		for ( var i2 = 0; i2 < arrRoom.length; i2++ ) 
		{ 
			if(room[i] == arrRoom[i2])
			{  				 
				arrN[arrN.length] = i; break;
			}
		}
	}

	deletePointZone(arrRoom);
	
	for ( var i = arrN.length - 1; i >= 0; i-- )
	{
		roomType[roomType.length] = 
		{ 
			nameTxt : room[arrN[i]].userData.room.roomType,  
			material : room[arrN[i]].material, 
			userData : room[arrN[i]].userData, 
			area : Number(room[arrN[i]].userData.room.areaTxt), 
		}; 
		
		var floor = room[arrN[i]];    			
		room.splice(arrN[i], 1); 
		
		var ceil = ceiling[arrN[i]];
		ceiling.splice(arrN[i], 1);	
		
		scene.remove( floor.label );
		scene.remove( floor );
		scene.remove( ceil );		
	}
	
	return roomType;
}



// удаляем из точек зоны, к которым они принадлежали 
function deletePointZone(arrRoom)
{
	for ( var i = 0; i < arrRoom.length; i++ )
	{
		for ( var i2 = 0; i2 < arrRoom[i].p.length; i2++ )
		{
			for ( var i3 = 0; i3 < arrRoom[i].p[i2].zone.length; i3++ )
			{
				if(arrRoom[i].p[i2].zone[i3] == arrRoom[i])
				{ 
					arrRoom[i].p[i2].zone.splice(i3, 1);
					arrRoom[i].p[i2].zoneP.splice(i3, 1); 
					break;
				}							
			}
		}
	}
}



// при добавлении или удалении точки, передаем параметры страх зон новым 
// находим одинаковые зоны (старые(которые были удалены) и новые (которые были созданны)), сравниванием кол-во совпавших точек
function assignOldToNewZones_1( oldZ, newZones, cdm ) 
{
	// у новой зоны должно быть на 1 точку (на 2, если считать p.length) меньше одинаковых точек
	for ( var i = 0; i < newZones.length; i++ ) 
	{
		for ( var i2 = 0; i2 < oldZ.length; i2++ ) 
		{ 			
			var oldZones = oldZ[i2].floor; 
			var count = 0;
			
			for ( var i3 = 0; i3 < newZones[i].p.length - 1; i3++ )
			{
				for ( var i4 = 0; i4 < oldZones.p.length - 1; i4++ )
				{
					if(newZones[i].p[i3].userData.id == oldZones.p[i4].userData.id) { count++; break; };
				}				
			}

			
			if(cdm == 'add') { var countNew = newZones[i].p.length - 2; }
			else if(cdm == 'delete') { var countNew = newZones[i].p.length - 1; }
			else if(cdm == 'copy') { var countNew = newZones[i].p.length - 1; }
			
			if(countNew == count)
			{
				assignOldToNewZones_2([newZones[i]], oldZ[i2], false);				
				break;
			}			
		}
	}

}



// замыкаем точку (создание новой комнаты/зоны) 
// берем у замыкающей точки стену и у этой стены находим центр, а затем бросаем луч и определяем какую зону он делит
// у этой зоны берем параметры и переносим на 2 новые зоны
function splitZone(wall) 
{
	var oldZone = rayFurniture( wall ).obj;
	var oldZ = findNumberInArrRoom(oldZone);
	
	if(oldZone) { deleteArrZone( [oldZone] ); }			// удаляем старый пол
		
	var newZones = detectRoomZone();			// создаем пол, для новых помещений	
	 
	if(oldZone) { assignOldToNewZones_2(newZones, oldZ[0], true); } 
}


// переносим параметры от стрых зон к новым 
function assignOldToNewZones_2(newZones, oldZ, addId)
{
	var newZ = findNumberInArrRoom(newZones);
	
	for ( var i = 0; i < newZ.length; i++ )
	{	 
		var floor = newZ[i].floor;		
		var ceiling = newZ[i].ceiling;
		
		floor.userData.id = oldZ.floor.userData.id;	
		floor.userData.material = Object.assign({}, oldZ.floor.userData.material);		
		floor.material = oldZ.floor.material.clone();
		

		ceiling.userData.id = oldZ.ceiling.userData.id;	
		ceiling.userData.material = Object.assign({}, oldZ.ceiling.userData.material);
		ceiling.material = oldZ.ceiling.material.clone();
		
		if(addId) 
		{ 
			floor.userData.id = countId; countId++; 
			ceiling.userData.id = countId; countId++;
		}  
		getYardageSpace( [floor] );
	}
}




function detectParamZone_1( wall )
{	
	var arrRoom = detectCommonZone_1( wall );

	// добавляемая точка будет лежать на стене, между двумя точками
	// нужно найти первую точку в массиве и полчуить номер, следующей на за ней точку
	// чтобы потом добавить в массив между этими двумя точками, нашу новую точку
	// получаем индекс первой точки в массиве, между точками должны будем добавить новую точку
	var num = [];
	for ( var i = 0; i < arrRoom.length; i++ ) 
	{
		for ( var i2 = 0; i2 < arrRoom[i].p.length; i2++ ) 
		{ 			
			if(arrRoom[i].p[i2] == wall.userData.wall.p[0])  
			{ 
				if(arrRoom[i].p[i2 + 1] == wall.userData.wall.p[1]) { num[i] = i2 + 1; break; } 		
			}
			if(arrRoom[i].p[i2] == wall.userData.wall.p[1]) 
			{ 
				if(arrRoom[i].p[i2 + 1] == wall.userData.wall.p[0]) { num[i] = i2 + 1; break; }					
			}			
		}
	}

	return [arrRoom, num];
} 


// находим у стены две общие зоны (если есть, а то может быть только одна зона)
// получаем зоны, к которой примыкает стена (0, 1, 2 - зоны)
function detectCommonZone_1( wall )
{
	var arrRoom = [];	
	for ( var i = 0; i < wall.userData.wall.p[0].zone.length; i++ ) 
	{
		for ( var i2 = 0; i2 < wall.userData.wall.p[1].zone.length; i2++ )
		{
			if(wall.userData.wall.p[0].zone[i] == wall.userData.wall.p[1].zone[i2])
			{
				arrRoom[arrRoom.length] = wall.userData.wall.p[0].zone[i]; 
			}
		}
	}

	return arrRoom;
}


// 1. создаем 2 массива в которые заносим точки, которые не повторяются в 2-х зонах, 
// 1.1 в 1-й массив все уникальные точки из 1 зоны 
// 1.2 во 2-й массив все уникальные точки из 2 зоны
// 2. находим 2 точки, которые разделяют 2 зоны
// 3. добавляем в 1-й массив 2 точки (которые разделяют 2 зоны) и добавляем в 1-й массив все точки из 2-ого массива
function detectSamePointInTwoZone( arrRoom )
{	
	if(arrRoom.length != 2) { return []; } 
	
	//for ( var i = 0; i < arrRoom[0].p.length; i++ ) { 
	//for ( var i = 0; i < arrRoom[1].p.length; i++ ) {  } 
	
	// 1
	var arr_1 = [];
	
	for ( var i = 0; i < arrRoom[0].p.length - 1; i++ )	// 1.1
	{
		var flag = true;
		
		for ( var i2 = 0; i2 < arrRoom[1].p.length - 1; i2++ )
		{
			if(arrRoom[0].p[i] == arrRoom[1].p[i2]) { flag = false; break; }
		}
		
		if(flag)
		{
			arr_1[arr_1.length] = arrRoom[0].p[i];
		}
	}
	
	// } 
	
	var arr_2 = [];
	
	for ( var i = 0; i < arrRoom[1].p.length - 1; i++ )	// 1.2
	{
		var flag = true;
		
		for ( var i2 = 0; i2 < arrRoom[0].p.length - 1; i2++ )
		{
			if(arrRoom[1].p[i] == arrRoom[0].p[i2]) { flag = false; break; }
		}
		
		if(flag)
		{
			arr_2[arr_2.length] = arrRoom[1].p[i];
		}
	}	
	
	// } 
	
	// 2	
	var arr_3 = [];
	
	if(arr_1.length > 0)
	{
		var n1 = -1;
		var n2 = -1;
		for ( var i = 0; i < arrRoom[0].p.length; i++ ) { if(arrRoom[0].p[i] == arr_1[0]) { n1 = i; break; } }
		for ( var i = 0; i < arrRoom[0].p.length; i++ ) { if(arrRoom[0].p[i] == arr_1[arr_1.length - 1]) { n2 = i; break; } }
		
		if(n1 != -1) arr_3[0] = arrRoom[0].p[n1 - 1];
		if(n2 != -1) arr_3[1] = arrRoom[0].p[n2 + 1];		
	}
	else if(arr_2.length > 0)
	{
		var n1 = -1;
		var n2 = -1;
		for ( var i = 0; i < arrRoom[1].p.length; i++ ) { if(arrRoom[1].p[i] == arr_2[0]) { n1 = i; break; } }
		for ( var i = 0; i < arrRoom[1].p.length; i++ ) { if(arrRoom[1].p[i] == arr_2[arr_2.length - 1]) { n2 = i; break; } }
		
		if(n1 != -1) arr_3[0] = arrRoom[1].p[n1 - 1];
		if(n2 != -1) arr_3[1] = arrRoom[1].p[n2 + 1];		
	}
	
	// 3
	arr_1[arr_1.length] = arr_3[0];
	arr_1[arr_1.length] = arr_3[1];
	
	// }  
	
	for ( var i = 0; i < arr_2.length; i++ ) { arr_1[arr_1.length] = arr_2[i]; }
	
	//
	
	return arr_1;
}



// находим в массиве arrRoom зону, у которой совпадают все точки с arrP, если да, то удаляем эту зону
// отличается от detectSameZone ( var i3 = 0; i3 < arrP.length; i3++ )  ( var i3 = 0; i3 < arrP.length - 1; i3++ )
function deleteOneSameZone( arrRoom, arrP, arrRoom_2 )
{
	
	for ( var i = 0; i < arrRoom.length; i++ )
	{
		if(arrRoom[i].p.length - 1 != arrP.length) { continue; }
		
		var ln = 0;
		
		for ( var i2 = 0; i2 < arrRoom[i].p.length - 1; i2++ )
		{
			for ( var i3 = 0; i3 < arrP.length; i3++ )
			{
				if(arrRoom[i].p[i2] == arrP[i3]) { ln++; }
			}
		}
		
		if(ln == arrRoom[i].p.length - 1) 
		{ 
			arrRoom_2[0].userData.room.roomType = arrRoom[i].userData.room.roomType; 
			arrRoom_2[1].userData.room.roomType = arrRoom[i].userData.room.roomType;
			
			upLabelArea2(arrRoom_2[0].label, arrRoom_2[0].userData.room.areaTxt + ' м2', '85', 'rgba(255,255,255,1)', false);
			upLabelArea2(arrRoom_2[1].label, arrRoom_2[1].userData.room.areaTxt + ' м2', '85', 'rgba(255,255,255,1)', false);
			
			deleteArrZone([arrRoom[i]]);  
			break; 
		}
	}
}


// создаем и обновляем зоны
function createWallZone(wall)
{
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai') {}
	else { return; }
	
	var zone = calculationZoneFundament_1(wall);	
	zone.label = createLabelCameraWall({ count : 1, text : 0, size : 65, ratio : {x:256*4, y:256}, geometry : infProject.geometry.labelFloor, opacity : 0.5 })[0];
	
	
	for(var i = 0; i < zone.walls.length; i++)
	{
		if(zone.walls[i].userData.wall.zone)
		{
			scene.remove( zone.walls[i].userData.wall.zone.label );
		}
		
		zone.walls[i].userData.wall.zone = zone;
	}
	
	calculationAreaFundament_2(wall); 
	wall.userData.wall.zone.label.visible = true; 
}


// подсчитваем точки у ленточного фундамента 
function calculationZoneFundament_1(wall)
{
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai') 
	{
		var arr = [];
		var arrW = [];
		
		function getPoint(wall)
		{
			// добавляем в массив неповторяющиеся стены
			var flag = true;			
			for(var i = 0; i < arrW.length; i++)
			{
				if(arrW[i] == wall){ flag = false; break; }
			}

			if(flag) { arrW[arrW.length] = wall; }
			
			// добавляем в массив неповторяющиеся точки
			var p = wall.userData.wall.p; 
			var flag = [true, true];
			
			for(var i = 0; i < arr.length; i++)
			{
				if(arr[i] == p[0]){ flag[0] = false; }
				if(arr[i] == p[1]){ flag[1] = false; }
			}					
			
			if(flag[0]) { arr[arr.length] = p[0]; }
			if(flag[1]) { arr[arr.length] = p[1]; }
			
			for(var i = 0; i < p.length; i++)
			{
				for(var i2 = 0; i2 < p[i].w.length; i2++)
				{
					if(flag[i]) { getPoint(p[i].w[i2]); }
				}
			}			
			
			return { points : arr, walls : arrW };
		}
		
		return getPoint(wall, []);
	}	
}









// кликнули на стену (в таблице показываем длину стены)
function showLengthWallUI( wall ) 
{
	$('[nameId="wall_menu_1"]').show();
		
	var v = wall.userData.wall.v; 		
	var x = Math.abs( v[6].x - v[0].x );		
	var y = Math.abs( v[1].y - v[0].y );	
	var z = Math.abs( v[4].z - v[0].z );
	
	//$('[nameId="size-wall-length"]').val(Math.round(x * 100)/100);
	//$('[nameId="size-wall-height"]').val(Math.round(y * 100)/100);
	//$('[nameId="size-wall-width"]').val(Math.round(z * 100)/100);

	$('[nameId="size_wall_width_1"]').val(wall.userData.wall.width);
	
	//toggleButtonMenuWidthWall(wall);
}




// после изменения на панели длины стены, нажали enter и миняем длину стены
function inputChangeWall_1(cdm)
{
	var wall = infProject.scene.array.wall[0];
	//if(!clickO.obj){ return; } 
	//if(clickO.obj.userData.tag != 'wall'){ return; } 	
	//var wall = clickO.obj; 
	 
	cdm.wall = wall;
	cdm.type = 'wallRedBlue';
	cdm.side = 'wall_length_1';
	
	var x = $('[nameId="size-wall-length"]').val();
	var y = $('[nameId="size-wall-height"]').val();
	var z = $('[nameId="size-wall-width"]').val();
	
	// если знаначения ввели с ошибкой, то исправляем
	if(1==1)
	{
		var v = wall.userData.wall.v;
		
		if(x == undefined) { x = '' + (v[6].x - v[0].x); }
		if(y == undefined) { y = '' + (v[1].y - v[0].y); }		
		if(z == undefined) { z = '' + (Math.abs(v[4].z) + Math.abs(v[0].z)); }		
		
		x = x.replace(",", ".");
		y = y.replace(",", ".");
		z = z.replace(",", ".");
		
		var x2 = v[6].x - v[0].x;
		var y2 = v[1].y - v[0].y;		
		var z2 = Math.abs(v[4].z) + Math.abs(v[0].z);
		
		x = (isNumeric(x)) ? x : x2;
		y = (isNumeric(y)) ? y : y2;
		z = (isNumeric(z)) ? z : z2;  
	}
	
	
	// ограничение размеров
	if(1==1)
	{
		if(x > 30) { x = 30; }
		else if(x < 0.5) { x = 0.5; }

		if(y > 10) { y = 10; }
		else if(y < 0.1) { y = 0.1; }	
		
		if(z > 10) { z = 10; }
		else if(z < 0.02) { z = 0.02; }		
	}	
	
	cdm.length = x;
	cdm.height = y;
	cdm.width = z;	
	
	
	inputLengthWall_1(cdm);	// меняем только длину стены 
	
	showRuleCameraWall();	// обновляем размеры стены
	
	renderCamera();
}


// миняем через input длину/высоту/ширину стены 
function inputLengthWall_1(cdm)
{
	var wall = cdm.wall;
	var value = cdm.length;
	
	var wallR = detectChangeArrWall_2(wall);
	clickMovePoint_BSP(wallR);

	var p1 = wall.userData.wall.p[1];
	var p0 = wall.userData.wall.p[0];

	var walls = [...new Set([...p0.w, ...p1.w])];	// получаем основную и соседние стены
	
	
	// высота стены
	if(cdm.height)
	{
		var h2 = Number(cdm.height);
		
		var v = wall.geometry.vertices;	
		v[1].y = h2;
		v[3].y = h2;
		v[5].y = h2;
		v[7].y = h2;
		v[9].y = h2;
		v[11].y = h2;
		wall.geometry.verticesNeedUpdate = true; 
		wall.geometry.elementsNeedUpdate = true;

		wall.userData.wall.height_1 = Math.round(h2 * 100) / 100;
	}
 
	// ширина стены
	if(cdm.width)
	{
		var z = cdm.width/2;
		
		var v = wall.geometry.vertices;	
		v[0].z = v[1].z = v[6].z = v[7].z = z;
		v[4].z = v[5].z = v[10].z = v[11].z = -z;	
		wall.geometry.verticesNeedUpdate = true;
		wall.geometry.elementsNeedUpdate = true;
		
		
		// меняем ширину wd
		for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
		{ 
			var wd = wall.userData.wall.arrO[i];	
			var v = wd.geometry.vertices;
			var f = wd.userData.door.form.v;
			var v2 = wall.geometry.vertices;
			
			for ( var i2 = 0; i2 < f.minZ.length; i2++ ) { v[f.minZ[i2]].z = v2[4].z; }
			for ( var i2 = 0; i2 < f.maxZ.length; i2++ ) { v[f.maxZ[i2]].z = v2[0].z; }	

			wd.geometry.verticesNeedUpdate = true; 
			wd.geometry.elementsNeedUpdate = true;
			wd.geometry.computeBoundingSphere();
			wd.geometry.computeBoundingBox();
			wd.geometry.computeFaceNormals();		
		}

		wall.userData.wall.width = Math.round(cdm.width * 100) / 100;;
	}
 
	
	var ns = 0;
	var flag = true;
	while ( flag )
	{	 
		var v = wall.userData.wall.v;

		var d = 0;
		
		if(cdm.side == 'wall_length_1'){ d = Math.abs( v[6].x - v[0].x );  } 
		else if(cdm.side == 'wall_length_2'){ d = Math.abs( v[10].x - v[4].x );  }
		//d = Math.round(d * 1000);
		
		var sub = (value - d) / 1;
		if(cdm.type == 'wallRedBlue') { sub /= 2; }	
		
		var dir = new THREE.Vector3().subVectors(p1.position, p0.position).normalize();
		var dir = new THREE.Vector3().addScaledVector( dir, sub );	

		if(cdm.type == 'wallBlueDot')
		{ 
			var offset = new THREE.Vector3().addVectors( p1.position, dir ); 
			p1.position.copy( offset ); 
		}
		else if(cdm.type == 'wallRedDot')
		{ 
			var offset = new THREE.Vector3().subVectors( p0.position, dir ); 
			p0.position.copy( offset ); 
			wall.position.copy( offset );
		}
		else if(cdm.type == 'wallRedBlue')
		{ 			
			var offset = new THREE.Vector3().subVectors( p0.position, dir ); 
			p0.position.copy( offset );
			wall.position.copy( offset );
			
			p1.position.copy( new THREE.Vector3().addVectors( p1.position, dir ) );				
		}

		
		for ( var i = 0; i < walls.length; i++ )
		{
			updateWall(walls[i]);
		}			 		 
		
		upLineYY(p0);
		upLineYY(p1);
		upLabelPlan_1( [wall] );
		if(cdm.side == 'wall_length_1'){ d = Math.abs( v[6].x - v[0].x ); }
		else if(cdm.side == 'wall_length_2'){ d = Math.abs( v[10].x - v[4].x ); }
		

		if(value - d == 0){ flag = false; }
		
		if(ns > 5){ flag = false; }
		ns++;
	} 	
	 
	upLabelPlan_1( wallR );		
	updateShapeFloor( compileArrPickZone(wall) );  				 			
	
	showLengthWallUI(wall);

	clickPointUP_BSP(wallR);
}



// изменяем ширину у всех стену
function changeWidthWall( value )
{
	if(!isNumeric(value)) return;
	value = Number(value);
	value /= 100;

	if(value < 0.005) { value = 0.005; }
	if(value > 1) { value = 1; }	
	
	
	//clickMovePoint_BSP( obj_line );
	value /= 2;
	
	for(var i = 0; i < obj_line.length; i++)
	{
		var wall = obj_line[i];
		 
		var v = wall.geometry.vertices;
						
		var z = [value, -value];

		v[0].z = v[1].z = v[6].z = v[7].z = z[0];
		v[4].z = v[5].z = v[10].z = v[11].z = z[1];	

		wall.geometry.verticesNeedUpdate = true; 
		wall.geometry.elementsNeedUpdate = true;
		
		wall.geometry.computeBoundingSphere();
		wall.geometry.computeBoundingBox();
		wall.geometry.computeFaceNormals();	
	}
	
	for ( var i = 0; i < obj_point.length; i++ ) { upLineYY(obj_point[i]); }	
	upLabelPlan_1(obj_line);
	calculationAreaFundament_2();
	//clickPointUP_BSP(obj_line);
	
	renderCamera();
}	



// изменение длины стены
function updateWall(wall, cdm) 
{
	//wall.updateMatrixWorld(); перенес на момент клика
	var v = wall.geometry.vertices;
	var p = wall.userData.wall.p;
	
	
	var f1 = false;	// точку p0 не двигали
	var f2 = false;	// точку p1 не двигали
	
	f1 = !comparePos(p[0].userData.point.last.pos, p[0].position); 	// true - точку p0 двигали
	f2 = !comparePos(p[1].userData.point.last.pos, p[1].position); 	// true - точку p1 двигали	
	
	// перемещаются сразу 2 точки
	if(f1 && f2)
	{
		var offset_1 = new THREE.Vector3().subVectors(p[0].position, p[0].userData.point.last.pos);
		var offset_2 = new THREE.Vector3().subVectors(p[1].position, p[1].userData.point.last.pos);
		
		var equal = comparePos(offset_1, offset_2);
		
		// стену просто переместили, без изменении длины
		if(equal)
		{
			var offset = new THREE.Vector3().subVectors(p[0].position, wall.position);
			
			wall.position.copy(p[0].position);
						
			for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
			{
				wall.userData.wall.arrO[i].position.add(offset);
			}
			
			return;
		}
	}	
	
	
	var dist = p[0].position.distanceTo(p[1].position);
	
	v[0].x = v[1].x = v[2].x = v[3].x = v[4].x = v[5].x = 0;
	v[6].x = v[7].x = v[8].x = v[9].x = v[10].x = v[11].x = dist;
 
	wall.geometry.verticesNeedUpdate = true; 
	wall.geometry.elementsNeedUpdate = true;
	wall.geometry.computeBoundingBox();	
	wall.geometry.computeBoundingSphere();	
	wall.geometry.computeFaceNormals();	

	var dir = new THREE.Vector3().subVectors(p[0].position, p[1].position).normalize();
	var angleDeg = Math.atan2(dir.x, dir.z);
	wall.rotation.set(0, angleDeg + Math.PI / 2, 0);

	wall.position.copy( p[0].position );


	// ------- 
	// устанавливаем wd	
	if(cdm)
	{
		if(cdm.point)	// точка которая двигалась
		{
			if(cdm.point == p[0]) { f1 = true; }
			if(cdm.point == p[1]) { f2 = true; }
		}
	}
	
	
	if(f2){ var dir = new THREE.Vector3().subVectors( p[0].position, p[1].position ).normalize(); }
	else { var dir = new THREE.Vector3().subVectors( p[1].position, p[0].position ).normalize(); }
	
	for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
	{
		var wd = wall.userData.wall.arrO[i];	

		if(f2)
		{
			var startPos = new THREE.Vector3(p[0].position.x, 0, p[0].position.z);
			var p1 = p[0].position;			
		}
		else
		{
			var startPos = new THREE.Vector3(p[1].position.x, 0, p[1].position.z);
			var p1 = p[1].position;
		}
		
		var dist = startPos.distanceTo(new THREE.Vector3(wd.position.x, 0, wd.position.z));
		
		
		var pos = new THREE.Vector3().addScaledVector( dir, -dist );
		pos = new THREE.Vector3().addVectors( p1, pos );
		
		wd.position.x = pos.x;
		wd.position.z = pos.z;
		wd.rotation.copy( wall.rotation );
	}			
}





// изменение ширины выбранной стены
function inputWidthOneWall(cdm) 
{
	var wall = cdm.wall;
	//var unit = cdm.width.unit;
	var width = cdm.width.value;
	var offset = cdm.offset;
	
	if(!wall){ return; } 
	if(wall.userData.tag != 'wall'){ return; } 
	
	var width = checkNumberInput({ value: width, unit: 1, limit: {min: 0.01, max: 1} });
	
	if(!width) 
	{
		$('[nameid="size_wall_width_1"]').val(wall.userData.wall.width);
		
		return;
	}		

	var width = width.num; 
	
	var wallR = detectChangeArrWall_2(wall);
	
	clickMovePoint_BSP(wallR);
			
	var v = wall.geometry.vertices;
	
	var z = [0,0];
	
	if(offset == 'wallRedBlueArrow')
	{ 	
		width = (width < 0.01) ? 0.01 : width;
		width /= 2;		
		z = [width, -width];		
		var value = Math.round(width * 2 * 1000);
	}
	else if(offset == 'wallBlueArrow')
	{ 
		width = (Math.abs(Math.abs(v[4].z) + Math.abs(width)) < 0.01) ? 0.01 - Math.abs(v[4].z) : width;   		
		z = [width, v[4].z];
		var value = width * 1000;
	}
	else if(offset == 'wallRedArrow')
	{		 
		width = (Math.abs(Math.abs(v[0].z) + Math.abs(width)) < 0.01) ? 0.01 - Math.abs(v[0].z) : width;    		
		z = [v[0].z, -width];
		var value = width * 1000;
	}

	v[0].z = v[1].z = v[6].z = v[7].z = z[0];
	v[4].z = v[5].z = v[10].z = v[11].z = z[1];	

	wall.geometry.verticesNeedUpdate = true; 
	wall.geometry.elementsNeedUpdate = true;
	
	wall.geometry.computeBoundingSphere();
	wall.geometry.computeBoundingBox();
	wall.geometry.computeFaceNormals();	
	
	var width = Math.abs(v[0].z) + Math.abs(v[4].z);	
	wall.userData.wall.width = Math.round(width * 100) / 100;
	wall.userData.wall.offsetZ = (v[0].z + v[4].z)/2;	 

	
	var p0 = wall.userData.wall.p[0];
	var p1 = wall.userData.wall.p[1];
	upLineYY_2(p0, p0.p, p0.w, p0.start);	
    upLineYY_2(p1, p1.p, p1.w, p1.start);	
	
	// меняем ширину wd
	for ( var i = 0; i < wall.userData.wall.arrO.length; i++ )
	{ 
		var wd = wall.userData.wall.arrO[i];	
		var v = wd.geometry.vertices;
		var f = wd.userData.door.form.v;
		var v2 = wall.geometry.vertices;
		
		for ( var i2 = 0; i2 < f.minZ.length; i2++ ) { v[f.minZ[i2]].z = v2[4].z; }
		for ( var i2 = 0; i2 < f.maxZ.length; i2++ ) { v[f.maxZ[i2]].z = v2[0].z; }	

		wd.geometry.verticesNeedUpdate = true; 
		wd.geometry.elementsNeedUpdate = true;
		wd.geometry.computeBoundingSphere();
		wd.geometry.computeBoundingBox();
		wd.geometry.computeFaceNormals();		
	}	
	
	upLabelPlan_1( wallR );	 				
	getYardageSpace( compileArrPickZone(wall) );
	
	clickPointUP_BSP(wallR);
	
	$('[nameId="size_wall_width_1"]').val(wall.userData.wall.width);
	
	renderCamera();
}






// изменение высоты всех стен при переключении камеры cameraTop/camera3D 
function changeAllHeightWall_1(cdm)
{  
	if(infProject.scene.array.wall.length == 0) return;
	
	var wall = infProject.scene.array.wall[0];
	
	var height = cdm.height;
	
	var height = checkNumberInput({ value: height, unit: 1, limit: {min: 0.1, max: 5} });
	
	if(!height) 
	{
		return;
	}		
	
	clickMovePoint_BSP( infProject.scene.array.wall );
	
	for ( var i = 0; i < infProject.scene.array.wall.length; i++ )
	{
		var v = infProject.scene.array.wall[i].geometry.vertices;
		
		v[1].y = height.num;
		v[3].y = height.num;
		v[5].y = height.num;
		v[7].y = height.num;
		v[9].y = height.num;
		v[11].y = height.num;
		infProject.scene.array.wall[i].geometry.verticesNeedUpdate = true;
		infProject.scene.array.wall[i].geometry.elementsNeedUpdate = true;
		
		infProject.scene.array.wall[i].userData.wall.height_1 = Math.round(height.num * 100) / 100;
	}
	
	upLabelPlan_1( infProject.scene.array.wall );
	clickPointUP_BSP( infProject.scene.array.wall );
	
	renderCamera();
}
	
	






// линейки для окон/мебели (создается при старте)
// линейки для отображения длины/высоты стены в режиме cameraWall
function createRulerWin(cdm)
{
	var arr = [];
	
	if(cdm.material == 'standart') { var mat = { color: cdm.color }; }
	else { var mat = { color: cdm.color, transparent: true, depthTest : false }; }
	
	for ( var i = 0; i < cdm.count; i++ )
	{
		arr[i] = new THREE.Mesh( createGeometryCube(1, 0.025, 0.025), new THREE.LineBasicMaterial( mat ) );
		var v = arr[i].geometry.vertices; 
		v[0].x = v[1].x = v[6].x = v[7].x = 0;
		
		v[0].y = v[3].y = v[4].y = v[7].y = -0.025/2;
		v[1].y = v[2].y = v[5].y = v[6].y = 0.025/2;
		
		arr[i].geometry.verticesNeedUpdate = true;			
		arr[i].visible = false;	 
		arr[i].renderOrder = 1;
		scene.add( arr[i] );
	}
	
	return arr;
}




// label размера длины/высоты стены в режиме cameraWall
// label размера окна/двери/объекты
function createLabelCameraWall(cdm) 
{	
	var arr = [];

	if(!Array.isArray(cdm.text)) 
	{
		var text = [];
		
		for ( var i = 0; i < cdm.count; i++ )
		{
			text[i] = cdm.text;
		}
		
		cdm.text = text;
	}
	

	
	for ( var i = 0; i < cdm.count; i++ )
	{
		var canvs = document.createElement("canvas");
		var ctx = canvs.getContext("2d");
		
		canvs.width = 256;
		canvs.height = 256/2;
		
		if(cdm.ratio) { canvs.width = cdm.ratio.x; canvs.height = cdm.ratio.y; }
		
		ctx.font = cdm.size + 'pt Courier New';
		if(cdm.border == 'border line')
		{
			ctx.fillStyle = 'rgba(0,0,0,1)';
			ctx.fillRect(0, 0, canvs.width, canvs.height);
			ctx.fillStyle = 'rgba(255,255,255,1)';
			ctx.fillRect(1, 1, canvs.width - 2, canvs.height - 2);	 	
		}
		else if(cdm.border == 'white')
		{
			ctx.fillStyle = 'rgba(255,255,255,1)';
			ctx.fillRect(0, 0, canvs.width, canvs.height);	 			
		}

		ctx.fillStyle = 'rgba(82,82,82,1)';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(cdm.text[i], canvs.width / 2, canvs.height / 2 );	
		
		var texture = new THREE.Texture(canvs);
		texture.needsUpdate = true;	
		
		if(cdm.materialTop == 'no') { var material = { transparent: true }; }
		else { var material = { transparent: true, depthTest: false }; }

		if(cdm.opacity) { material.opacity = cdm.opacity; }
		
		material.map = texture;
		var material = new THREE.MeshBasicMaterial(material);
		
		
		var label = new THREE.Mesh(cdm.geometry, material);	
		label.visible = false;
		label.renderOrder = 1.1;
		arr[i] = label;
		scene.add( label );			
	}
	
	return arr;
}




// создаем вертикальные линии для линейки
function createRulerCutoff() 
{
	var arr = [];
	
	for ( var i = 0; i < 8; i++ )
	{
		arr[i] = new THREE.Mesh( createGeometryCube(0.05, 0.005, 0.005), new THREE.MeshLambertMaterial( { color : 0xff0000, transparent: true, depthTest : false } ) );
		
		var v = arr[i].geometry.vertices; 
		v[0].y = v[3].y = v[4].y = v[7].y = -0.0025;
		v[1].y = v[2].y = v[5].y = v[6].y = 0.0025;
		
		v[0].z = v[1].z = v[2].z = v[3].z = -0.0025;
		v[4].z = v[5].z = v[6].z = v[7].z = 0.0025;		
		arr[i].geometry.verticesNeedUpdate = true;			
		
		arr[i].renderOrder = 1;
		arr[i].visible = false;
		
		scene.add( arr[i] );
	}		
	
	return arr;	
}




// обновляем label 
function upLabelCameraWall(cdm)  
{		
	//if(!label){ return; }
	var canvs = cdm.label.material.map.image; 
	var ctx = canvs.getContext("2d");
	
	ctx.clearRect(0, 0, canvs.width, canvs.height);
	ctx.font = (cdm.sizeText) ? cdm.sizeText+'pt Courier New' : '50pt Courier New';
	
	if(cdm.border == 'border line')
	{
		ctx.fillStyle = 'rgba(0,0,0,1)';
		ctx.fillRect(0, 0, canvs.width, canvs.height);
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.fillRect(1, 1, canvs.width - 2, canvs.height - 2);		
	}
	else if(cdm.border == 'white')
	{
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.fillRect(0, 0, canvs.width, canvs.height);		
	}
	
	var str = '';
	var value = cdm.text * infProject.settings.unit.wall;
	if(infProject.settings.unit.wall == 1) { str = ' м'; } 
	
	ctx.fillStyle = cdm.color;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(value + str, canvs.width / 2, canvs.height / 2 );
	
	cdm.label.material.map.needsUpdate = true;
}






// room
function upLabelArea2(label, area, text2, size, color, border) 
{		
	if(!label){ return; }
	var canvs = label.material.map.image; 
	var ctx = canvs.getContext("2d");
	
	ctx.clearRect(0, 0, canvs.width, canvs.height);
	ctx.font = size + 'pt Arial';
	
		ctx.fillStyle = 'rgba(0,0,0,1)';
		ctx.fillRect(0, 0, canvs.width, canvs.height);
		ctx.fillStyle = 'rgba(255,255,255,1)';
		ctx.fillRect(1, 1, canvs.width - 2, canvs.height - 2);	
	
	ctx.fillStyle = 'rgba(0,0,0,1)';
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	
	if(infProject.settings.unit.floor == 1) 
	{
		ctx.fillText('площадь : '+area+ ' м2', canvs.width / 2, canvs.height / 2 - 10 );
		ctx.fillText('объем : '+Math.round((area * height_wall) * 100) / 100 +' м3', canvs.width / 2, canvs.height / 2 + 110 );			
	}
	else if(infProject.settings.unit.floor == 0.01)
	{
		var value = Math.round(area*infProject.settings.unit.floor * 100) / 100;
		ctx.fillText('площадь участка', canvs.width / 2, canvs.height / 2 - 10 );
		ctx.fillText(value+' (сотка)', canvs.width / 2, canvs.height / 2 + 110 );			
	}
	
	label.material.map.needsUpdate = true;
}






// показываем (линейки) нижние размеры между мебелью в режиме cameraWall 
function showSizeFormat_3() 
{
	if(camera != cameraWall) return;
	
	deleteSizeFormat_3(); 
	
	var arr = [];
	
	// находим объекты, которые находятся на полу
	for ( var i = 0; i < arrWallFront.objPop.obj_1.length; i++ ) 
	{
		var obj = arrWallFront.objPop.obj_1[i];
		
		if ( !obj.geometry.boundingBox ) obj.geometry.computeBoundingBox(); 
		//if ( !obj.geometry.boundingSphere ) obj.geometry.computeBoundingSphere(); 
		
		var y = obj.localToWorld( new THREE.Vector3(0, obj.geometry.boundingBox.min.y, 0) ).y;
		
		if(y < 0.1) arr[arr.length] = { obj : obj };
	}
	
	// находим крайние точки POP объектов относительно стены 
	var wall = arrWallFront.wall[0].obj; 
	var index = arrWallFront.wall[0].index;
	var rt = (index == 1) ? 0 : Math.PI;
	
	for ( var i = 0; i < arr.length; i++ ) 
	{
		var obj = arr[i].obj;
		var bound = obj.geometry.boundingBox;
		
		var p = [];
		p[0] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, 0, bound.min.z)) );	
		p[1] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, 0, bound.max.z)) );		
		p[2] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, 0, bound.min.z)) );
		p[3] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, 0, bound.max.z)) );

		var min = p[0].x;
		var max = p[0].x;
		
		for ( var i2 = 0; i2 < p.length; i2++ )
		{
			if(min > p[i2].x) { min = p[i2].x; }
			if(max < p[i2].x) { max = p[i2].x; }		
		}
		
		arr[i].center = (max - min)/2 + min;
		
		arr[i].pos = [wall.localToWorld( new THREE.Vector3(min, 0, 0)), wall.localToWorld( new THREE.Vector3(max, 0, 0))];		
	}
	
	arr.sort(function (a, b) { return a.center - b.center; });		// сортируем по возрастанию (по параметру center)	
	
		
	
	// утсанавливаем линейки
	if(arr.length > 0)
	{
		var startPos = wall.worldToLocal( arrWallFront.bounds.min.x.clone() );
		startPos = wall.localToWorld(new THREE.Vector3(startPos.x, 0, 0));
		

		
		var dir = new THREE.Vector3().subVectors( arrWallFront.bounds.max.y, arrWallFront.bounds.min.y ).normalize();
		var rot_2 = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation
		
		for ( var i = 0; i < arr.length + 1; i++ )
		{		
			if(i == arr.length)
			{
				var endPos = wall.worldToLocal( arrWallFront.bounds.max.x.clone() );
				endPos = wall.localToWorld(new THREE.Vector3(endPos.x, 0, 0));					
			}
			else 
			{
				var endPos = arr[i].pos[0];
			}
			
			startPos.y = 0;
			endPos.y = 0;
			
			var d = startPos.distanceTo(endPos);
			
			var dir = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
			var rot_1 = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation			
			
			var line = createRulerWin({count : 1, color : 0xcccccc})[0];
			arrSize.format_3.line[arrSize.format_3.line.length] = line;			
			var v = line.geometry.vertices; 	
			v[3].x = v[2].x = v[5].x = v[4].x = d;
			line.geometry.verticesNeedUpdate = true;					
			line.position.copy( startPos );
			line.position.y -= 0.2;
			line.rotation.set(rot_1.x, rot_1.y - Math.PI / 2, 0);					
			line.visible = true;
			
			var label = createLabelCameraWall({ count : 1, text : Math.round(d * 100) * 10, size : 50, border : 'white', geometry : labelGeometry_1 })[0];
			arrSize.format_3.label[arrSize.format_3.label.length] = label;	
			label.position.copy( new THREE.Vector3().subVectors( endPos, startPos ).divideScalar( 2 ).add( startPos ) );
			label.position.y = line.position.y;			
			label.rotation.set( 0, wall.rotation.y + rt, 0 );    
			label.visible = true;


			// боковые черточки 
			var pos = [startPos, endPos];
			var y = line.position.y;
			for ( var i2 = 0; i2 < pos.length; i2++ )
			{
				var line = createRulerWin({count : 1, color : 0xcccccc})[0];
				arrSize.format_3.line[arrSize.format_3.line.length] = line;			
				var v = line.geometry.vertices; 	
				v[0].x = v[1].x = v[6].x = v[7].x = -0.05;
				v[3].x = v[2].x = v[5].x = v[4].x = 0.05;
				line.geometry.verticesNeedUpdate = true;					
				line.position.copy( pos[i2] );
				line.position.y = y;
				line.rotation.set(rot_2.x, rot_2.y - Math.PI / 2, 0);					
				line.visible = true;				
			}
			
			
			if(i < arr.length) { startPos = arr[i].pos[1] };
		}
		
	}	
}





// удаляем нижние размеры между мебелью в режиме cameraWall 
function deleteSizeFormat_3() 
{	
	for ( var i = 0; i < arrSize.format_3.line.length; i++ ) { scene.remove(arrSize.format_3.line[i]); }
	for ( var i = 0; i < arrSize.format_3.label.length; i++ ) { scene.remove(arrSize.format_3.label[i]); }
	
	arrSize.format_3 = { line : [], label : [] };
}





// из массива объектов, находим ближайший левый и правый объект от выбранного объекта
// 1. находим ближайший левый и правый объект
// 2. находим ближайшую точку к выбранному объекту
function getNearlyWinV(arr, obj, wall, z)
{
	var hitL = null;
	var hitR = null;
	
	var xL = -999999;
	var xR = 999999;
	
	var posL = false;
	var posR = false;
	
	// 1
	wall.updateMatrixWorld();
	var pos = wall.worldToLocal( obj.position.clone() );
	
	for ( var i = 0; i < arr.length; i++ )
	{ 
		var v = wall.worldToLocal( arr[i].position.clone() );

		if (v.x < pos.x){ if(xL <= v.x) { hitL = arr[i]; xL = v.x; } } 
		else { if(xR >= v.x) { hitR = arr[i]; xR = v.x; } }	
	}

	// 2	
	if(hitL != null)
	{
		hitL.updateMatrixWorld();
		var pos = hitL.worldToLocal( obj.position.clone() );
		var v = hitL.geometry.vertices;
			
		var dist = pos.x;
		for ( var i = 0; i < v.length; i++ )
		{
			if (dist >= pos.x - v[i].x){ dist = pos.x - v[i].x; posL = v[i].clone(); }
		}
		
		posL.z = z;
		posL = hitL.localToWorld( posL.clone() );
	}
	if(hitR != null)
	{
		hitR.updateMatrixWorld();
		var pos = hitR.worldToLocal( obj.position.clone() );
		var v = hitR.geometry.vertices;

		var dist = pos.x;
		for ( var i = 0; i < v.length; i++ )
		{
			if (dist <= pos.x - v[i].x){ dist = pos.x - v[i].x; posR = v[i].clone(); }
		}
		posR.z = z;
		posR = hitR.localToWorld( posR.clone() );
	}	

	return [posR, posL];
}










// показываем длину/высоту между 2 объектами, когда наводим курсор на объект (cameraWall) 
function showSizeFormat_4(obj)  
{ 
	if ( camera != cameraWall ) { return; }
	
	var last_obj = clickO.last_obj;
	
	var wall = arrWallFront.wall[0].obj; 
	var index = arrWallFront.wall[0].index; 
	var rt = (index == 1) ? 0 : Math.PI;	 
	
	var activeO = { pos : [] };
	var hoverO = { pos : [], dir : [] };	 

	
	//if ( !last_obj.geometry.boundingBox ) last_obj.geometry.computeBoundingBox();
	if ( !obj.geometry.boundingBox ) obj.geometry.computeBoundingBox();  
	if ( !obj.geometry.boundingSphere ) obj.geometry.computeBoundingSphere(); 
	
	
	var p = [];
	var bound = obj.geometry.boundingBox;
	var center = obj.geometry.boundingSphere.center; 
	
	// находим крайние точки у POP объекта (над которым находится мышь) относительно стены 
	p[0] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, 0, bound.min.z)) );	
	p[1] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.min.x, 0, bound.max.z)) );		
	p[2] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, 0, bound.min.z)) );
	p[3] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(bound.max.x, 0, bound.max.z)) );

	var min = p[0].x;
	var max = p[0].x;
	
	for ( var i2 = 0; i2 < p.length; i2++ )
	{
		if(min > p[i2].x) { min = p[i2].x; }
		if(max < p[i2].x) { max = p[i2].x; }		
	}
	
	p[0] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(center.x, bound.min.y, center.z)) );	
	p[1] = wall.worldToLocal( obj.localToWorld(new THREE.Vector3(center.x, bound.max.y, center.z)) );	
  
	hoverO.pos[0] = wall.localToWorld( new THREE.Vector3(min, 0, 0));
	hoverO.pos[1] = wall.localToWorld( new THREE.Vector3(max, 0, 0));
	hoverO.pos[2] = wall.localToWorld( new THREE.Vector3(p[0].x, p[0].y, 0));
	hoverO.pos[3] = wall.localToWorld( new THREE.Vector3(p[1].x, p[1].y, 0));
	
	
	// находим крайние точки у POP объекта (который выделен) относительно стены 
	p[0] = wall.worldToLocal( arrSize.cube[0].position.clone() );
	p[1] = wall.worldToLocal( arrSize.cube[1].position.clone() );
	p[2] = wall.worldToLocal( arrSize.cube[2].position.clone() );
	p[3] = wall.worldToLocal( arrSize.cube[3].position.clone() );
	
	activeO.pos[0] = wall.localToWorld(new THREE.Vector3(p[0].x, p[0].y, 0));
	activeO.pos[1] = wall.localToWorld(new THREE.Vector3(p[1].x, p[1].y, 0));
	activeO.pos[2] = wall.localToWorld(new THREE.Vector3(p[2].x, p[2].y, 0));
	activeO.pos[3] = wall.localToWorld(new THREE.Vector3(p[3].x, p[3].y, 0));
	
	var active_2 = [activeO.pos[0].clone(), activeO.pos[1].clone(), activeO.pos[2].clone(), activeO.pos[3].clone()]; // для расчета длины отсечек 
	
	// устанавливаем activeO под один уровень с hoverO (чтобы правильно расчитать длину)
	activeO.pos[0].y = wall.position.y;
	activeO.pos[1].y = wall.position.y;
	
	activeO.pos[2].x = hoverO.pos[2].x;
	activeO.pos[2].z = hoverO.pos[2].z;
	activeO.pos[3].x = hoverO.pos[3].x;
	activeO.pos[3].z = hoverO.pos[3].z;
	
	
	// dir
	hoverO.dir[0] = new THREE.Vector3().subVectors( hoverO.pos[1], hoverO.pos[0] ).normalize();
	hoverO.dir[1] = new THREE.Vector3().subVectors( hoverO.pos[0], hoverO.pos[1] ).normalize();
	hoverO.dir[2] = new THREE.Vector3().subVectors( hoverO.pos[3], hoverO.pos[2] ).normalize();
	hoverO.dir[3] = new THREE.Vector3().subVectors( hoverO.pos[2], hoverO.pos[3] ).normalize(); 
	
	
	// определяем сколько будет линеек по горизонтали
	var arrLine = [];	
	for ( var i = 0; i < 2; i++ ) 
	{
		var inf = [];
		
		for ( var i2 = 0; i2 < 2; i2++ )
		{
			var dir = new THREE.Vector3().subVectors( activeO.pos[i2], hoverO.pos[i] ).normalize();
			
			if(comparePos(dir, hoverO.dir[i])) continue;
			
			var d = hoverO.pos[i].distanceTo( activeO.pos[i2] );
			
			inf[inf.length] = {dist : d, pos : activeO.pos[i2], active_2 : active_2[i2]};
		}
		
		if(inf.length == 1) { arrLine[arrLine.length] = { dist : inf[0].dist, pos : [hoverO.pos[i], inf[0].pos], active_2 : inf[0].active_2 } } 
		else if(inf.length == 2) 
		{
			var n = (inf[0].dist < inf[1].dist) ? 0 : 1;
			arrLine[arrLine.length] = { dist : inf[n].dist, pos : [hoverO.pos[i], inf[n].pos], active_2 : inf[n].active_2 }
		}
	}
	
	// выставляем горизонтальные линейки на высоту центра hover объекта
	if(!obj.geometry.boundingSphere) obj.geometry.computeBoundingSphere();
	var center = obj.geometry.boundingSphere.center;
	var height = obj.localToWorld( new THREE.Vector3(0, center.y, 0) ).y;		
	for ( var i = 0; i < arrLine.length; i++ ) { arrLine[i].pos[0].y = arrLine[i].pos[1].y = height; }	
	
	// определяем сколько будет линеек по вертикали
	for ( var i = 2; i < 4; i++ ) 
	{
		var inf = [];
		
		for ( var i2 = 2; i2 < 4; i2++ )
		{
			var dir = new THREE.Vector3().subVectors( activeO.pos[i2], hoverO.pos[i] ).normalize();
			
			if(comparePos(dir, hoverO.dir[i])) continue;
			
			var d = hoverO.pos[i].distanceTo( activeO.pos[i2] );
			
			inf[inf.length] = {dist : d, pos : activeO.pos[i2], active_2 : active_2[i2]};
		}
		
		if(inf.length == 1) { arrLine[arrLine.length] = { dist : inf[0].dist, pos : [hoverO.pos[i], inf[0].pos], active_2 : inf[0].active_2 } } 
		else if(inf.length == 2) 
		{
			var n = (inf[0].dist < inf[1].dist) ? 0 : 1;
			arrLine[arrLine.length] = { dist : inf[n].dist, pos : [hoverO.pos[i], inf[n].pos], active_2 : inf[n].active_2 }
		}
	}	
	

	
	var dir = new THREE.Vector3().subVectors( arrWallFront.bounds.max.y, arrWallFront.bounds.min.y ).normalize();
	var rot_2 = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation
		
	var rot = [];

	
	for ( var i = 0; i < arrLine.length; i++ )
	{
		var startPos = arrLine[i].pos[0];
		var endPos = arrLine[i].pos[1];
		var d = arrLine[i].dist;
		
		var dir = new THREE.Vector3().subVectors( endPos, startPos ).normalize();
		rot[i] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation

		var line = arrSize.format_2.line[i];
		var label = arrSize.format_2.label[i];
		
		 
		var v = line.geometry.vertices; 	
		v[3].x = v[2].x = v[5].x = v[4].x = d;
		line.geometry.verticesNeedUpdate = true;					
		line.position.copy( startPos );
		//line.position.y = height; 
		line.rotation.set(rot[i].x, rot[i].y - Math.PI / 2, 0);					
		line.visible = true; 

		
		label.position.copy( new THREE.Vector3().subVectors( endPos, startPos ).divideScalar( 2 ).add( startPos ) );
		//label.position.y = line.position.y;			
		label.rotation.set( 0, wall.rotation.y + rt, 0 );
		upLabelCameraWall({label : label, text : Math.round(d * 100) * 10, color : 'rgba(0,0,0,1)', border : 'border line'});
		label.visible = true;
	}
	
	var arr = [];
	for ( var i = 0; i < arrLine.length; i++ )
	{
		arr[i] = { p1 : arrLine[i].pos[0], p2 : arrLine[i].pos[1], active_2 : arrLine[i].active_2 };
	}
	
	showSizeCutoff(arr); 	
}



// боковые отсечки для линейки (cameraWall)
function showSizeCutoff(arrP)
{
	// получаем rotation как у стены
	var rot = [];
	var dir = new THREE.Vector3().subVectors( arrWallFront.bounds.max.x, arrWallFront.bounds.min.x ).normalize();
	rot[0] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation	

	var dir = new THREE.Vector3().subVectors( arrWallFront.bounds.max.y, arrWallFront.bounds.min.y ).normalize();
	rot[1] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation		
	
	var n = 0;
	var arr = arrSize.cutoff;	
	for ( var i = 0; i < arrP.length; i++ )
	{
		var startPos = arrP[i].p1;
		var endPos = arrP[i].p2;		 
		
		var rotation = new THREE.Vector3();						
		var dir = new THREE.Vector3().subVectors( endPos, startPos ).normalize();			
		
		var rotation = (dir.y > 0.98 || dir.y < -0.98) ? rot[0] : rot[1];
		
		arr[n].position.copy( startPos );
		arr[n].rotation.set(rotation.x, rotation.y - Math.PI / 2, 0);  
		arr[n].material.color.set(0x222222);
		arr[n].visible = true; 

		n++;
		
		arr[n].position.copy( endPos );
		arr[n].rotation.set(rotation.x, rotation.y - Math.PI / 2, 0);		
		arr[n].visible = true;
		
		if(arrP[i].active_2)
		{		
			var dir = new THREE.Vector3().subVectors( arrP[i].active_2, endPos ).normalize();
			var r = new THREE.Euler().setFromQuaternion( quaternionDirection(dir) );  // из кватерниона в rotation							
			arr[n].rotation.set(r.x, r.y - Math.PI / 2, 0);		
			
			var d = endPos.distanceTo(arrP[i].active_2);
			
			var v = arr[n].geometry.vertices; 
			v[0].x = v[1].x = v[6].x = v[7].x = 0;
			v[2].x = v[3].x = v[4].x = v[5].x = d;
			arr[n].geometry.verticesNeedUpdate = true;
			arr[n].material.color.set('rgb(17, 255, 0)');  
			
			//			
		}
		else
		{
			var v = arr[n].geometry.vertices; 
			v[0].x = v[1].x = v[6].x = v[7].x = -0.025;
			v[2].x = v[3].x = v[4].x = v[5].x = 0.025;
			arr[n].geometry.verticesNeedUpdate = true;
			arr[n].material.color.set(0x222222);
		}

		n++;
	}		
}



// получаем rotation стены по горизонтали и вертикали (cameraWall)
function getRotationHorVertCamWall()
{
	var dir = [];
	dir[0] = new THREE.Vector3().subVectors( arrWallFront.bounds.max.x, arrWallFront.bounds.min.x ).normalize();
	dir[1] = new THREE.Vector3().subVectors( arrWallFront.bounds.min.x, arrWallFront.bounds.max.x ).normalize();
	dir[2] = new THREE.Vector3().subVectors( arrWallFront.bounds.max.y, arrWallFront.bounds.min.y ).normalize();
	dir[3] = new THREE.Vector3().subVectors( arrWallFront.bounds.min.y, arrWallFront.bounds.max.y ).normalize();
	
	var rot = [];
	rot[0] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir[0]) ); 
	rot[1] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir[1]) );
	rot[2] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir[2]) );
	rot[3] = new THREE.Euler().setFromQuaternion( quaternionDirection(dir[3]) ); 
	
	arrWallFront.vector = {horiz: [{dir: dir[0], rot: rot[0]}, {dir: dir[1], rot: rot[1]}], vert: [{dir: dir[2], rot: rot[2]}, {dir: dir[3], rot: rot[3]}]};
}


// показываем линейки длины/высоты стены в режиме cameraWall
function showRuleCameraWall()
{
	if(camera != cameraWall) return;
	
	arrWallFront.wall = [];
	arrWallFront.wall = [{ obj : infProject.scene.array.wall[0], index : 1 }];
	detectDirectionWall_1(infProject.scene.array.wall[0], 1, detectRoomWallSide(wall, 1));			
	
	var wall = arrWallFront.wall[0].obj;
	var index = arrWallFront.wall[0].index;
	var rt = (index == 1) ? 0 : Math.PI;
	
	
	var room = detectRoomWallSide(wall, index);
	var offset = (room) ? 0.1 : 0;
	
	var d = [arrWallFront.bounds.max.x.distanceTo(arrWallFront.bounds.min.x), (arrWallFront.bounds.max.y.y - arrWallFront.bounds.min.y.y - offset)];

	var dir = [];
	dir[0] = new THREE.Vector3().subVectors( arrWallFront.bounds.max.x, arrWallFront.bounds.min.x ).normalize();
	dir[1] = new THREE.Vector3().subVectors( arrWallFront.bounds.max.y, arrWallFront.bounds.min.y ).normalize(); 
	
	
	var pos = [];
	pos[0] = new THREE.Vector3(arrWallFront.bounds.min.x.x, arrWallFront.bounds.min.y.y - 0.5, arrWallFront.bounds.min.x.z);
	
	if(index == 1)
	{
		pos[1] = new THREE.Vector3(arrWallFront.bounds.min.x.x, arrWallFront.bounds.min.y.y + offset, arrWallFront.bounds.min.x.z);	
		pos[1].add( dir[0].clone().multiplyScalar( -0.8 ) );		
	}
	else
	{
		pos[1] = new THREE.Vector3(arrWallFront.bounds.max.x.x, arrWallFront.bounds.min.y.y + offset, arrWallFront.bounds.max.x.z);	
		pos[1].add( dir[0].clone().multiplyScalar( 0.8 ) );			
	}
	
	
	var pos2 = [];
	pos2[0] = new THREE.Vector3().subVectors( arrWallFront.bounds.max.x, arrWallFront.bounds.min.x ).divideScalar( 2 ).add( arrWallFront.bounds.min.x );	
	pos2[0].y = pos[0].y;
	pos2[1] = pos[1].clone();
	pos2[1].y = (( arrWallFront.bounds.max.y.y - arrWallFront.bounds.min.y.y ) / 2 + arrWallFront.bounds.min.y.y) + offset;
		
	
	var line = arrSize.format_1.line;
	var label = arrSize.format_1.label;
	for ( var i = 0; i < 2; i++ ) 
	{
		var v = line[i].geometry.vertices; 	
		v[3].x = v[2].x = v[5].x = v[4].x = d[i];
		line[i].geometry.verticesNeedUpdate = true;		
		
		line[i].position.copy( pos[i] );

		var rotation = new THREE.Euler().setFromQuaternion( quaternionDirection(dir[i]) );  // из кватерниона в rotation
		line[i].rotation.set(rotation.x, rotation.y - Math.PI / 2, 0);		
		
		line[i].visible = true;
		
		
		label[i].position.copy( pos2[i] );		
		label[i].rotation.set( 0, wall.rotation.y + rt, 0 );    
		label[i].visible = true;		
		upLabelCameraWall({label : label[i], text : Math.round(d[i] * 100) / 100, sizeText : 85, color : 'rgba(82,82,82,1)', border : 'white'}); 			
	}
	
	// устанавливаем боковые черточки для линеек 
	if(index == 1)
	{
		pos[2] = new THREE.Vector3(arrWallFront.bounds.min.x.x, pos[0].y, arrWallFront.bounds.min.x.z);
		pos[3] = new THREE.Vector3(arrWallFront.bounds.max.x.x, pos[0].y, arrWallFront.bounds.max.x.z);
	}
	else
	{
		pos[2] = new THREE.Vector3(arrWallFront.bounds.max.x.x, pos[0].y, arrWallFront.bounds.max.x.z);
		pos[3] = new THREE.Vector3(arrWallFront.bounds.min.x.x, pos[0].y, arrWallFront.bounds.min.x.z);
	}	
	
	
	pos[4] = pos[1].clone();
	pos[5] = pos[1].clone();
	pos[5].y = arrWallFront.bounds.max.y.y;
	
	var rot = [];
	rot[2] = line[1].rotation.clone();
	rot[3] = rot[2];
	rot[4] = line[0].rotation.clone();
	rot[5] = rot[4];
	
	// боковые черточки
	for ( var i = 2; i < 6; i++ )
	{
		var v = line[i].geometry.vertices; 	
		v[0].x = v[1].x = v[6].x = v[7].x = -0.05;
		v[3].x = v[2].x = v[5].x = v[4].x = 0.05;
		line[i].geometry.verticesNeedUpdate = true;
		line[i].position.copy( pos[i] );
		line[i].rotation.copy( rot[i] );
		line[i].visible = true;
	}
}


// скрываем линейки длины/высоты стены в режиме cameraWall
function hideRuleCameraWall()
{
	var line = arrSize.format_1.line;
	var label = arrSize.format_1.label;
	 
	for ( var i = 0; i < line.length; i++ ) { line[i].visible = false; }
	for ( var i = 0; i < label.length; i++ ) { label[i].visible = false; }
	
	deleteSizeFormat_3();
}



// устанвливаем и показываем красные линии
function showNavigateLineCameraWall( cdm )
{
	var pos1 = cdm.pos.start;
	var pos2 = cdm.pos.end;
	
	var dir = new THREE.Vector3().subVectors( pos2, pos1 ).normalize();
	
	if(Math.abs(dir.y) > 0.98) 
	{ 
		var line = infProject.tools.axis[0];
		var vert = arrWallFront.vector.vert;
		if(comparePos(dir, vert[0].dir)) { var rot = vert[0].rot; }
		else { var rot = vert[1].rot; }		
	}  
	else 
	{ 
		var line = infProject.tools.axis[1];
		var horiz = arrWallFront.vector.horiz;
		if(comparePos(dir, horiz[0].dir)) { var rot = horiz[0].rot; }
		else { var rot = horiz[1].rot; }
	}
	 
	
	var d = pos1.distanceTo( pos2 );	 
	
	var v = line.geometry.vertices;		
	v[3].x = v[2].x = v[5].x = v[4].x = d;		
	line.geometry.verticesNeedUpdate = true;
 
	line.rotation.set(rot.x, rot.y - Math.PI / 2, 0);		
	line.position.copy( pos1 );
	line.visible = true;	
}





// при наведение мыши над объектом (без клика) меняем цвет
function activeHover2D( event )
{
	if (camera != cameraTop) { return; }
	if (isMouseDown1) { return; }

	if ( clickO.move ) 
	{
		var tag = clickO.move.userData.tag;
		
		if (tag == 'free_dw') { return; }
		if (tag == 'point') { if (clickO.move.userData.point.type) return; }	
	}
	
	var rayhit = null;
		
	var ray = rayIntersect( event, arrSize.cube, 'arr' );
	if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }			

	if(!infProject.scene.block.hover.door)
	{
		var ray = rayIntersect( event, infProject.scene.array.door, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}
	
	if(!infProject.scene.block.hover.window)
	{
		var ray = rayIntersect( event, infProject.scene.array.window, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}
	
	if(!infProject.scene.block.hover.point)
	{
		var ray = rayIntersect( event, infProject.scene.array.point, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}

	if(!infProject.scene.block.hover.wall)
	{
		var ray = rayIntersect( event, infProject.scene.array.wall, 'arr' );
		if(!rayhit) { if(ray.length > 0) { rayhit = ray[0]; } }		
	}	
	

	if ( rayhit ) 
	{
		// выделяем объект
		var object = rayhit.object;
		var tag = object.userData.tag; 				

		if ( clickO.last_obj == object ) { activeHover2D_2(); return; }	// объект активирован (крансый цвет), поэтому не подсвечиваем
		if ( clickO.hover == object ) { return; }				// объект уже подсвечен

		if ( tag == 'window' ) { object.material.color = new THREE.Color(infProject.listColor.hover2D); }
		else if ( tag == 'door' ) { object.material.color = new THREE.Color(infProject.listColor.hover2D); }
		else if ( tag == 'point' ) { object.material.color = new THREE.Color(infProject.listColor.hover2D); }
		else if ( tag == 'wall' ) { object.material[ 3 ].color = new THREE.Color(infProject.listColor.hover2D); }		
		else if ( tag == 'controll_wd' ) { if(clickO.last_obj == object.obj) { activeHover2D_2(); return; } }
		
		activeHover2D_2();

		clickO.hover = object;
	}
	else
	{
		activeHover2D_2();
	}
}



// возращаем стандартный цвет
function activeHover2D_2()
{
	if ( !clickO.hover ) { return; }

	var object = clickO.hover;
	var tag = object.userData.tag;  	
	
	if ( tag == 'window' ) { object.material.color = object.userData.door.color; } 
	else if ( tag == 'door' ) { object.material.color = object.userData.door.color; }	
	else if ( tag == 'wall' ) { object.material[ 3 ].color = object.userData.material[ 3 ].color; }
	else if ( tag == 'point' ) { object.material.color = object.userData.point.color; }
	
	clickO.hover = null;
}



// выделяем/активируем объект
// кликнули на объект (выделение) (cameraTop)
function objActiveColor_2D(obj)
{ 
	if(!obj) { return; }   
	if(clickO.last_obj == obj) { return; }
			
	var tag = obj.userData.tag;
	
	if(tag == 'window'){ obj.material.color = new THREE.Color(infProject.listColor.active2D); }
	else if(tag == 'point'){ obj.material.color = new THREE.Color(infProject.listColor.active2D); }	 
	else if(tag == 'wall'){ obj.material[3].color = new THREE.Color(infProject.listColor.active2D); } 	
	else if(tag == 'door'){ obj.material.color = new THREE.Color(infProject.listColor.active2D); }	
	
	if(clickO.hover == obj) { clickO.hover = null; }
}
 

	
 
// возращаем стандартный цвет объекта
function objDeActiveColor_2D() 
{			
	if(!clickO.last_obj){ return; }
	if(clickO.last_obj == clickO.obj){ return; }
	
	var o = clickO.last_obj;	

	if(clickO.rayhit)
	{    
		if(clickO.rayhit.object.userData.tag == 'controll_wd'){ if(clickO.rayhit.object.userData.controll_wd.obj == o) { return; } }      		
	}
	 
	if(o.userData.tag == 'wall'){ o.material[3].color = o.userData.material[3].color; }	
	else if(o.userData.tag == 'point'){ o.material.color = o.userData.point.color; }	
	else if(o.userData.tag == 'window'){ o.material.color = new THREE.Color(infProject.listColor.window2D); }
	else if(o.userData.tag == 'door'){ o.material.color = new THREE.Color(infProject.listColor.door2D); }	
	else if(o.userData.tag == 'room'){ scene.remove(o.userData.room.outline); o.userData.room.outline = null; } 
	
	if(clickO.hover == clickO.last_obj) { clickO.hover = null; }
} 





// кликнули на стену в 3D режиме
function clickWall_3D( intersect )
{
	//if(camera != cameraWall) return;
	if(!intersect) return;
	if(!intersect.face) return;
	var index = intersect.face.materialIndex;	
	
	if(index == 1 || index == 2) { } 
	else { return; }
	
	var object = intersect.object;	
	
	clickO.obj = object;
	clickO.index = index;  	
}









function loadUrl(href) 
{
	var url = new URL(href); 
	var url = url.searchParams.get('file');  
	if(url) { loadFile(url); }
}



var resetPop =
{
	camera3D : 
	{
		userData : function()
		{
			var camera = { type : 'fly', height : camera3D.position.y, startProject : true, rot360 : { start : false, angle : 0, qEnd : null } };
			camera.click = { pos : new THREE.Vector3() };
			
			return camera;			
		}
	},

	fileInfo : function()
	{
		return { last : {cam : { obj : camera, type : '', pos : new THREE.Vector3(), rot : new THREE.Vector3() }} };
	},
	
	infProjectSceneArray : function()
	{
		var array = { point : obj_point, wall : obj_line, window : [], door : [], room : room, ceiling : ceiling, obj : [] };
		array.fundament = [];
		array.lineGrid = { limit : false };
		array.base = (infProject.start)? infProject.scene.array.base : [];	// массив клонируемых объектов
		
		return array;
	},

	listColor : function()
	{	
		var array = {};
		
		array.door2D = 'rgb(166, 151, 99)';
		array.window2D = 'rgb(122, 160, 195)';
		array.active2D = 'rgb(255, 55, 0)';
		array.hover2D = 'rgb(69, 165, 58)';

		return array;
	},
	
	clickO : function()
	{
		var inf = { obj: null, last_obj: null, hover: null, rayhit : null, button : null, buttonAct : null };
		inf.down = null;
		inf.move = null;
		inf.up = null;
		inf.offset = new THREE.Vector3();
		inf.actMove = false;
		inf.pos = { clickDown : new THREE.Vector3() };
		inf.click = { wall : [], point : [] };  
		inf.selectBox = { arr : [], drag : false, move : false, walls : [], walls_2 : [], point : [] };
		inf.keys = [];
		inf.options = null;
		
		return inf;
	},
	
	active : function()
	{
		return { create : true, delete : true, click2D : true, click3D : true, move : true, replace : true, unlock : true };
	},	
}



function resetScene() 
{	
	hideMenuUI(clickO.last_obj);
	
	
	var wall = infProject.scene.array.wall;
	var point = infProject.scene.array.point;
	var window = infProject.scene.array.window;
	var door = infProject.scene.array.door;
	var obj = infProject.scene.array.obj;
	
	for ( var i = 0; i < wall.length; i++ )
	{ 
		disposeNode(wall[i]);
		disposeNode(wall[i].label[0]);
		disposeNode(wall[i].label[1]);
		
		scene.remove(wall[i].label[0]); 
		scene.remove(wall[i].label[1]);
		if(wall[i].userData.wall.outline) { scene.remove(wall[i].userData.wall.outline); }
		if(wall[i].userData.wall.zone) { disposeNode(wall[i].userData.wall.zone.label); scene.remove(wall[i].userData.wall.zone.label); }			
		
		wall[i].label = [];
		wall[i].userData.wall.p = [];
		wall[i].userData.wall.outline = null;
		wall[i].userData.wall.zone = null;
		
		scene.remove(wall[i]); 
	}
	
	for ( var i = 0; i < point.length; i++ )
	{ 
		if(point[i].userData.point.pillar) { scene.remove( point[i].userData.point.pillar ); }
		disposeNode(point[i]);
		scene.remove(point[i]); 
	}	
	
	for ( var i = 0; i < window.length; i++ )
	{ 
		disposeNode(window[i]); 
		scene.remove(window[i]); 
	}
	
	for ( var i = 0; i < door.length; i++ )
	{ 
		disposeNode(door[i]); 
		scene.remove(door[i]); 
	}	
	
	
	for ( var i = 0; i < room.length; i++ )
	{		
		disposeNode(room[i]);
		disposeNode(room[i].label);
		disposeNode(ceiling[i]);
		
		scene.remove(room[i].label); 
		if(room[i].userData.room.outline) { scene.remove(room[i].userData.room.outline); }
		scene.remove(room[i]); 
		scene.remove(ceiling[i]);	
	}
	
	for ( var i = 0; i < obj.length; i++ )
	{ 
		disposeNode(obj[i]);
		scene.remove(obj[i]);
	}	
	
	
	// удаляем список материалов UI
	for(var i = 0; i < infProject.ui.list_wf.length; i++)
	{
		infProject.ui.list_wf[i].remove();
	}		
	
	infProject.ui.list_wf = [];
	
	
	
	//disposeHierchy(scene, disposeNode);
	
	
	obj_point = [];
	obj_line = [];
	room = [];
	ceiling = [];
	arrWallFront = [];
	

	countId = 2;
	
	// прячем размеры и линейки
	var line = arrSize.format_1.line;
	var label = arrSize.format_1.label;
	var cube = arrSize.cube;
	var cutoff = arrSize.cutoff;
	for ( var i = 0; i < line.length; i++ ) { line[i].visible = false; }
	for ( var i = 0; i < label.length; i++ ) { label[i].visible = false; }
	for ( var i = 0; i < cube.length; i++ ) { cube[i].visible = false; }
	for ( var i = 0; i < cutoff.length; i++ ) { cutoff[i].visible = false; }
	
	var line = arrSize.format_2.line;
	var label = arrSize.format_2.label;
	for ( var i = 0; i < line.length; i++ ) { line[i].visible = false; }
	for ( var i = 0; i < label.length; i++ ) { label[i].visible = false; }
	
	
	camera3D.userData.camera = { type : 'fly', height : camera3D.position.y, startProject : true };
	camera3D.userData.camera.click = { pos : new THREE.Vector3() }; 
	
	clickO = resetPop.clickO();
	infProject.project = null;
	infProject.scene.array = resetPop.infProjectSceneArray();

	getConsoleRendererInfo();
}



function getConsoleRendererInfo()
{	
	
	
		
}






// удалем из GPU объекты
function disposeHierchy(node, callback) 
{
	for (var i = node.children.length - 1; i >= 0; i--) 
	{
		if(node.children[i].userData.tag)
		{
			var tag = node.children[i].userData.tag;
			
			if(tag == 'point' || tag == 'wall' || tag == 'window' || tag == 'door' || tag == 'room' || tag == 'ceiling' || tag == 'obj')
			{
				var child = node.children[i];

				disposeHierchy(child, callback);
				callback(child);			
			}			
		}			
	}
}


function disposeNode(node) 
{
        if (node instanceof THREE.Mesh || node instanceof THREE.Line) 
		{
            if (node.geometry) { node.geometry.dispose(); }
			
            if (node.material) 
			{
                var materialArray;
                if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) 
				{
                    materialArray = node.material.materials;
                }
                else if(node.material instanceof Array) 
				{
                    materialArray = node.material;
                }
                
				if(materialArray) 
				{
                    materialArray.forEach(function (mtrl, idx) 
					{
                        if (mtrl.map) mtrl.map.dispose();
                        if (mtrl.lightMap) mtrl.lightMap.dispose();
                        if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                        if (mtrl.normalMap) mtrl.normalMap.dispose();
                        if (mtrl.specularMap) mtrl.specularMap.dispose();
                        if (mtrl.envMap) mtrl.envMap.dispose();
                        mtrl.dispose();
                    });
                }
                else 
				{
                    if (node.material.map) node.material.map.dispose();
                    if (node.material.lightMap) node.material.lightMap.dispose();
                    if (node.material.bumpMap) node.material.bumpMap.dispose();
                    if (node.material.normalMap) node.material.normalMap.dispose();
                    if (node.material.specularMap) node.material.specularMap.dispose();
                    if (node.material.envMap) node.material.envMap.dispose();
                    node.material.dispose();
                }
            }
        }
}



// сохраняем окна/двери
function saveWindows(wall)
{
	var windows = [], doors = [];
	
	var arrO = wall.userData.wall.arrO;

	var o = [[], []];

	for ( var i2 = 0; i2 < arrO.length; i2++ ) 
	{
		if(arrO[i2].userData.tag == 'window') { o[0][o[0].length] = arrO[i2]; }
		else if(arrO[i2].userData.tag == 'door') { o[1][o[1].length] = arrO[i2]; }		
	}

	var p = wall.userData.wall.p;

	for ( var i = 0; i < o.length; i++ )
	{
		for ( var i2 = 0; i2 < o[i].length; i2++ )
		{ 
			var wd = o[i][i2];
			var v = wd.geometry.vertices; 

			wd.updateMatrixWorld();
			wd.geometry.computeBoundingBox();
			wd.geometry.computeBoundingSphere();
			var dX = wd.geometry.boundingBox.max.x - wd.geometry.boundingBox.min.x;
			var dY = wd.geometry.boundingBox.max.y - wd.geometry.boundingBox.min.y;
			var center = wd.geometry.boundingSphere.center;
		
		
			var v7 = wd.localToWorld( center.clone() );			
			var qt1 = quaternionDirection( new THREE.Vector3().subVectors( p[1].position, p[0].position ).normalize() );
			var x = localTransformPoint(new THREE.Vector3().subVectors( v7, p[0].position ), qt1).z; 
			
			x = x / p[1].position.distanceTo( p[0].position );		// процентное соотношение от начала стены
			
			var y = wall.worldToLocal( wd.localToWorld(new THREE.Vector3(0, wd.geometry.boundingBox.min.y, 0)) ).y;
			
			
			var arr = {};
			
			arr.id = wd.userData.id;						// id
			arr.lotid  = wd.userData.door.lotid;					// lotid  
			arr.width = dX;									// width
			arr.height = dY;								// height		
			arr.startPointDist = x;							// pos_start
			arr.over_floor = y;								// over_floor		
			//arr.options = '';
			
			if(wd.userData.tag == 'window') { windows[windows.length] = arr; }
			else if(wd.userData.tag == 'door') { doors[doors.length] = arr; }			
		}		
	}

	return { windows : windows, doors : doors };
}


function saveFile(cdm) 
{ 
	
	var json = JSON.stringify( getJsonGeometry() );
	
	if(cdm.json)
	{
		// сохраняем в папку
		$.ajax
		({
			url: infProject.path+'saveJson.php',
			type: 'POST',
			data: {myarray: json},
			dataType: 'json',
			success: function(json)
			{ 			
				 
			},
			error: function(json){   }
		});			
	}
	
	
	if(cdm.id)
	{
		//var preview = saveAsImagePreview();
		var preview = null;
		
		// сохраняем в бд
		$.ajax
		({
			url: infProject.path+'components/saveSql.php',
			type: 'POST',
			data: {json: json, id: cdm.id, user_id: infProject.user.id, preview: preview},
			dataType: 'json',
			success: function(json)
			{ 			
				
				
				if(cdm.upUI) { getListProject({id: infProject.user.id}); }		// обновляем меню сохрание проектов
			},
			error: function(json){  }
		});			
	}
	
	
	if(1==2)
	{
		var csv = JSON.stringify( txt );	
		var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);	
		
		var link = document.createElement('a');
		document.body.appendChild(link);
		link.href = csvData;
		link.target = '_blank';
		link.download = 'filename.json';
		link.click();			
	}
}




function getJsonGeometry()
{
	var json = 
	{
		floors : 
		[
			{ 
				points : [],
				walls : [],	
				rooms : [],
				height : height_wall,
				version : '1'
			}			
		]
	};	
	
	var points = [];
	var walls = [];
	var rooms = [];
	var furn = [];
	
	
	var wall = infProject.scene.array.wall;
	//var point = infProject.scene.array.point;
	
	for ( var i = 0; i < wall.length; i++ )
	{			
		var p = wall[i].userData.wall.p;
		
		for ( var i2 = 0; i2 < p.length; i2++ )  
		{
			var flag = true;
			for ( var i3 = 0; i3 < points.length; i3++ ) { if(p[i2].userData.id == points[i3].id){ flag = false; break; } }
			
			if(flag) 
			{  
				var m = points.length;
				points[m] = {};
				points[m].id = p[i2].userData.id;
				points[m].pos = new THREE.Vector3(p[i2].position.x, p[i2].position.y, -p[i2].position.z); 
			}
		}
	}	
	
	
	
	for ( var i = 0; i < wall.length; i++ )
	{ 
		var p = wall[i].userData.wall.p;
		
		walls[i] = { }; 
		
		walls[i].id = wall[i].userData.id;
		walls[i].pointStart = p[0].userData.id;
		walls[i].pointEnd = p[1].userData.id;
		walls[i].width = wall[i].userData.wall.width; 
		walls[i].height = wall[i].userData.wall.height_1; 


		var x1 = p[1].position.z - p[0].position.z;
		var z1 = p[0].position.x - p[1].position.x;	
		var dir = new THREE.Vector3(z1, 0, -x1).normalize();						// перпендикуляр стены  (перевернуты x и y)
		dir.multiplyScalar( wall[i].userData.wall.offsetZ );
		walls[i].startShift = new THREE.Vector3(dir.z, 0, dir.x);
				
		var wd = saveWindows(wall[i]);		
		walls[i].windows = wd.windows;
		walls[i].doors = wd.doors;
		

		walls[i].colors = [];
		var mat = wall[i].userData.material;
		var arr = [{containerID : 'wall3d_'+wall[i].userData.id+'_p2', num : 1}, {containerID : 'wall3d_'+wall[i].userData.id+'_p1', num : 2}];				
		
		for ( var i2 = 0; i2 < arr.length; i2++ )
		{
			walls[i].colors[i2] = {  };		
			walls[i].colors[i2].containerID = arr[i2].containerID;
			walls[i].colors[i2].lot = { id : mat[arr[i2].num].lotid };

			var color = { r : Number(mat[arr[i2].num].color.r), g : Number(mat[arr[i2].num].color.g), b : Number(mat[arr[i2].num].color.b), a : 1 };
			
			walls[i].colors[i2].matMod = { colorsets : [{ color : color }] };

			walls[i].colors[i2].matMod.texScal = mat[arr[i2].num].scale;
			
			walls[i].colors[i2].matMod.mapingRotate = 0; 
			
			var map = wall[i].material[arr[i2].num].map;
			if(map) 
			{
				walls[i].colors[i2].matMod.texOffset = map.offset;
				walls[i].colors[i2].matMod.mapingRotate = THREE.Math.radToDeg( map.rotation ); 				 
			}
		}		
	}	


	for ( var i = 0; i < room.length; i++ )
	{
		rooms[i] = { pointid : [] };
		
		rooms[i].id = room[i].userData.id;  
		rooms[i].name = 'Room';	
		
		rooms[i].pointid = [];
		var s = 0; for ( var i2 = room[i].p.length - 1; i2 >= 1; i2-- ) { rooms[i].pointid[s] = room[i].p[i2].userData.id; s++; }  
		
		
		rooms[i].colors = [];
		var arr = [{containerID : 'floor', obj : room[i]}, {containerID : 'ceil', obj : ceiling[i]}];				
		
		for ( var i2 = 0; i2 < arr.length; i2++ )
		{
			rooms[i].colors[i2] = {  };		
			rooms[i].colors[i2].containerID = arr[i2].containerID;
			rooms[i].colors[i2].lot = { id : arr[i2].obj.userData.material.lotid };

			var color = { r : Number(arr[i2].obj.material.color.r), g : Number(arr[i2].obj.material.color.g), b : Number(arr[i2].obj.material.color.b), a : 1 };
			
			rooms[i].colors[i2].matMod = { colorsets : [{ color : color }] };

			rooms[i].colors[i2].matMod.texScal = arr[i2].obj.userData.material.scale;

			rooms[i].colors[i2].matMod.mapingRotate = 0; 
			
			var map = arr[i2].obj.material.map;
			if(map) 
			{
				rooms[i].colors[i2].matMod.texOffset = map.offset;
				rooms[i].colors[i2].matMod.mapingRotate = THREE.Math.radToDeg( map.rotation ); 
			}			
		}	
	}
	

	
	for ( var i = 0; i < infProject.scene.array.obj.length; i++ )
	{
		var obj = infProject.scene.array.obj[i];
		
		var pos = new THREE.Vector3(obj.position.x, obj.position.y, -obj.position.z);
		var rot = new THREE.Vector3( THREE.Math.radToDeg(obj.rotation.x), THREE.Math.radToDeg(obj.rotation.y), THREE.Math.radToDeg(obj.rotation.z) );
		
			
		var m = furn.length;
		furn[m] = {};
		furn[m].id = Number(obj.userData.id);
		furn[m].lotid = Number(obj.userData.obj3D.lotid);
		furn[m].pos = pos;
		furn[m].rot = rot;
	}	
	
	
	json.floors[0].points = points;
	json.floors[0].walls = walls;
	json.floors[0].rooms = rooms;
	json.furn = furn;
	
	return json;
}






function loadFile(cdm) 
{
	if(cdm.id == 0) { resetScene(); return; }	 
	
	
	if(cdm.json)	// загрузка json из папки
	{
		$.ajax
		({
			url: infProject.path+'t/fileJson.json',
			type: 'POST',
			dataType: 'json',
			success: function(json)
			{ 
				resetScene();
				loadFilePL(json); 	// загрузка json
			},
		});			
	}
	else	// загрузка json из бд
	{
		$.ajax
		({
			url: infProject.path+'components/loadSql.php',
			type: 'POST',
			data: {id: cdm.id},
			dataType: 'json',
			success: function(json)
			{ 
				resetScene();
				loadFilePL(json); 	// загрузка json
			},
		});		
		
	}
	
}






function loadFilePL(arr) 
{                 		
	if(!arr) return;
	
	//
	
	infProject.project = { file: arr, load: { furn: [] } };
		
	var point = arr.floors[0].points;
	var walls = arr.floors[0].walls;
	var rooms = arr.floors[0].rooms;
	var furn = (arr.furn) ? arr.furn : [];
			
	var wall = [];
	
	for ( var i = 0; i < walls.length; i++ )
	{
		wall[i] = { };
		
		
		wall[i].id = walls[i].id;		
		wall[i].width = walls[i].width;
		wall[i].offsetV = new THREE.Vector3(walls[i].startShift.z, 0, walls[i].startShift.x);   		
		wall[i].height = walls[i].height;			
		
		wall[i].points = [];
		wall[i].points[0] = { id : walls[i].pointStart, pos : new THREE.Vector3() };
		wall[i].points[1] = { id : walls[i].pointEnd, pos : new THREE.Vector3() };
								
		for ( var i2 = 0; i2 < point.length; i2++ ) 			 
		{  	
			if(wall[i].points[0].id == point[i2].id) { wall[i].points[0].pos = new THREE.Vector3(point[i2].pos.x, 0, -point[i2].pos.z); }
			if(wall[i].points[1].id == point[i2].id) { wall[i].points[1].pos = new THREE.Vector3(point[i2].pos.x, 0, -point[i2].pos.z); }
		}
		

		var arrO = [];
		
		if(walls[i].doors) for ( var i2 = 0; i2 < walls[i].doors.length; i2++ ) { arrO[arrO.length] = walls[i].doors[i2]; arrO[arrO.length - 1].type = 'door'; }
		if(walls[i].windows) for ( var i2 = 0; i2 < walls[i].windows.length; i2++ ) { arrO[arrO.length] = walls[i].windows[i2]; arrO[arrO.length - 1].type = 'window'; }
		
		wall[i].arrO = [];
		
		
		for ( var i2 = 0; i2 < arrO.length; i2++ )
		{					
			wall[i].arrO[i2] = {  }
			
			wall[i].arrO[i2].id = arrO[i2].id;
			wall[i].arrO[i2].pos = new THREE.Vector3(arrO[i2].startPointDist, arrO[i2].over_floor, 0);
			wall[i].arrO[i2].size = new THREE.Vector2(arrO[i2].width, arrO[i2].height);
			wall[i].arrO[i2].type = arrO[i2].type;
		} 	
	}
	


	//-------------
	 
	// удаляем стены, которые пересекаются с друг другом (стена в стене)
	for ( var i = wall.length - 1; i >= 0; i-- )
	{
		for ( var i2 = 0; i2 < wall.length; i2++ )
		{
			if(wall[i] == wall[i2]) continue;			
			
			var count = 0;
			var pos1 = [];
			var pos2 = [];
			if(wall[i].points[0].id == wall[i2].points[0].id) { count++; pos1 = [wall[i].points[0].pos, wall[i].points[1].pos]; pos2 = [wall[i2].points[0].pos, wall[i2].points[1].pos]; }
			if(wall[i].points[0].id == wall[i2].points[1].id) { count++; pos1 = [wall[i].points[0].pos, wall[i].points[1].pos]; pos2 = [wall[i2].points[1].pos, wall[i2].points[0].pos]; }
			if(wall[i].points[1].id == wall[i2].points[0].id) { count++; pos1 = [wall[i].points[1].pos, wall[i].points[0].pos]; pos2 = [wall[i2].points[0].pos, wall[i2].points[1].pos]; }
			if(wall[i].points[1].id == wall[i2].points[1].id) { count++; pos1 = [wall[i].points[1].pos, wall[i].points[0].pos]; pos2 = [wall[i2].points[1].pos, wall[i2].points[0].pos]; }
			
			if(count == 2) { wall.splice(i, 1); }
			else if(count == 1)
			{
				var dir1 = new THREE.Vector3().subVectors( pos1[0], pos1[1] ).normalize();
				var dir2 = new THREE.Vector3().subVectors( pos2[0], pos2[1] ).normalize();
				
				if(!comparePos(dir1, dir2)) { continue; }
				
				var d1 = pos1[0].distanceTo( pos1[1] );
				var d2 = pos2[0].distanceTo( pos2[1] );
				
				if(d1 > d2) { wall.splice(i, 1); } 
			}
		}
	}
	
	// создаем и устанавливаем все стены (без окон/дверей)
	var arrW = [];
	
	for ( var i = 0; i < wall.length; i++ )
	{ 
		var point1 = findObjFromId( 'point', wall[i].points[0].id );
		var point2 = findObjFromId( 'point', wall[i].points[1].id );	
		
		if(point1 == null) { point1 = createPoint( wall[i].points[0].pos, wall[i].points[0].id ); }
		if(point2 == null) { point2 = createPoint( wall[i].points[1].pos, wall[i].points[1].id ); }
	

		var dir = new THREE.Vector3().subVectors( point2.position, point1.position ).normalize();
		var offsetZ = localTransformPoint(wall[i].offsetV, quaternionDirection(dir)).z;
		var inf = { id : wall[i].id, offsetZ : -offsetZ, height : wall[i].height, load : true };
		
		var obj = createOneWall3( point1, point2, wall[i].width, inf ); 		
		
		obj.updateMatrixWorld();
		arrW[arrW.length] = obj;
	}	
	 
	
	for ( var i = 0; i < obj_point.length; i++ ) { upLineYY_2(obj_point[i], obj_point[i].p, obj_point[i].w, obj_point[i].start); }
	
	upLabelPlan_1(infProject.scene.array.wall);	// размеры стен

	detectRoomZone();
	

	
	// устанавливаем окна/двери
	for ( var i = 0; i < wall.length; i++ )
	{ 
		var obj = arrW[i];
		
		var point1 = obj.userData.wall.p[0];
		var point2 = obj.userData.wall.p[1];		
		
		for ( var i2 = 0; i2 < wall[i].arrO.length; i2++ )
		{			
			wall[i].arrO[i2].pos.x = point1.position.distanceTo( point2.position ) * wall[i].arrO[i2].pos.x;
			
			var intP = obj.localToWorld( wall[i].arrO[i2].pos.clone() );  						

			var inf = { status : 'load', id : wall[i].arrO[i2].id, pos : intP, wall : obj, type : wall[i].arrO[i2].type };	 		
			if(wall[i].arrO[i2].size) { inf.size = wall[i].arrO[i2].size; }				
						
			createEmptyFormWD_1(inf);
		}		
	}
	// устанавливаем окна/двери
	
			



	loadObjInBase({furn: furn});

	
	readyProject();
	calculationAreaFundament_2();
	cameraZoomTop( camera.zoom );
	

	renderCamera();
	
	//getSkeleton_1(room); 
}


// сохранение объектов в базу (создаем уникальную копию)
function loadObjInBase(cdm)
{
	var furn = cdm.furn;
	var lotid = [];
	
	for ( var i = 0; i < furn.length; i++ )
	{
		lotid[lotid.length] = Number(furn[i].lotid); 
	}
	
	lotid = [...new Set(lotid)];  
	
	for ( var i = 0; i < lotid.length; i++ )
	{
		loadObjServer({lotid: lotid[i], loadFromFile: true, furn: furn});
	}	
}


// получаем объект из базы (копируем копию объекта и добавляем в сцену)
function loadObjFromBase(cdm)
{ 
	var furn = cdm.furn;
	
	for ( var i = 0; i < furn.length; i++ )
	{
		if(Number(cdm.lotid) == Number(furn[i].lotid))
		{
			furn[i].pos.z *= -1;
			
			if(furn[i].rot)			
			{
				furn[i].rot = new THREE.Vector3( THREE.Math.degToRad(furn[i].rot.x), THREE.Math.degToRad(furn[i].rot.y), THREE.Math.degToRad(furn[i].rot.z) );
			}
			
			loadObjServer(furn[i]);

			infProject.project.load.furn[infProject.project.load.furn.length] = furn[i].id;
			
			if(infProject.project.load.furn.length == infProject.project.file.furn.length)
			{
				readyProject();
			}
		}
	}	
}



function readyProject(cdm)
{
	
	// восстанавливаем countId
	for ( var i = 0; i < scene.children.length; i++ ) 
	{ 
		if(scene.children[i].userData.id) 
		{ 
			var index = parseInt(scene.children[i].userData.id);
			if(index > countId) { countId = index; }
		} 
	}	
	countId++; 
	// восстанавливаем countId	
	
	
	
	changeCamera(cameraTop);
	centerCamera2D();	
}


function loadStartForm(cdm) 
{
	var form = cdm.form;
	
	var arrP = [];
	resetScene();
	
	
	if(form == 'plan_area') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,2), new THREE.Vector3(0,0,2), new THREE.Vector3(0,0,0), new THREE.Vector3(3,0,0), new THREE.Vector3(3,0,-2)]; }	
	else if(form == 'shape1') { var arrP = [new THREE.Vector3(-3,0,-3), new THREE.Vector3(-3,0,3), new THREE.Vector3(3,0,3), new THREE.Vector3(3,0,-3)]; }
	else if(form == 'shape2') { var arrP = [new THREE.Vector3(0,0,-2), new THREE.Vector3(-3,0,2), new THREE.Vector3(3,0,2)]; }
	else if(form == 'shape3') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,2), new THREE.Vector3(0,0,2), new THREE.Vector3(0,0,0), new THREE.Vector3(3,0,0), new THREE.Vector3(3,0,-2)]; }
	else if(form == 'shape4') { var arrP = [new THREE.Vector3(-3,0,0), new THREE.Vector3(-3,0,3), new THREE.Vector3(3,0,3), new THREE.Vector3(3,0,-3), new THREE.Vector3(0,0,-3), new THREE.Vector3(0,0,0)]; }	
	else if(form == 'shape5') { var arrP = [new THREE.Vector3(-4,0,-1.5), new THREE.Vector3(-4,0,3), new THREE.Vector3(0,0,3), new THREE.Vector3(4,0,3), new THREE.Vector3(4,0,-1.5), new THREE.Vector3(2,0,-1.5), new THREE.Vector3(1,0,-3), new THREE.Vector3(-1,0,-3), new THREE.Vector3(-2,0,-1.5)]; }
	else if(form == 'shape6') { var arrP = [new THREE.Vector3(-3,0,-3), new THREE.Vector3(-3,0,0), new THREE.Vector3(0,0,3), new THREE.Vector3(3,0,3), new THREE.Vector3(3,0,-3)]; }
	else if(form == 'shape7') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,2), new THREE.Vector3(0,0,2), new THREE.Vector3(3,0,2), new THREE.Vector3(3,0,-2), new THREE.Vector3(0,0,-2)]; }		
	else if(form == 'shape8') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,2), new THREE.Vector3(-1,0,2), new THREE.Vector3(1,0,2), new THREE.Vector3(3,0,2), new THREE.Vector3(3,0,-2), new THREE.Vector3(1,0,-2), new THREE.Vector3(-1,0,-2)]; }	
	else if(form == 'shape9') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,0), new THREE.Vector3(-3,0,2), new THREE.Vector3(-1,0,2), new THREE.Vector3(1,0,2), new THREE.Vector3(3,0,2), new THREE.Vector3(3,0,0), new THREE.Vector3(3,0,-2), new THREE.Vector3(1,0,-2), new THREE.Vector3(-1,0,-2)]; }
	else if(form == 'shape10') { var arrP = [new THREE.Vector3(-3,0,-2), new THREE.Vector3(-3,0,0), new THREE.Vector3(-3,0,2), new THREE.Vector3(0,0,2), new THREE.Vector3(0,0,0), new THREE.Vector3(3,0,0), new THREE.Vector3(3,0,-2), new THREE.Vector3(0,0,-2)]; }
	else if(form == 'shape11') { var arrP = [new THREE.Vector3(-2,0,-1), new THREE.Vector3(-2,0,1), new THREE.Vector3(0,0,2), new THREE.Vector3(2,0,1), new THREE.Vector3(2,0,-1), new THREE.Vector3(0,0,-2)]; }
	else if(form == 'shape12') { var arrP = [new THREE.Vector3(-1,0,-2), new THREE.Vector3(-1,0,-1), new THREE.Vector3(-3,0,-1), new THREE.Vector3(-3,0,1), new THREE.Vector3(-1,0,1), new THREE.Vector3(-1,0,2), new THREE.Vector3(1,0,2), new THREE.Vector3(1,0,1), new THREE.Vector3(3,0,1), new THREE.Vector3(3,0,-1), new THREE.Vector3(1,0,-1), new THREE.Vector3(1,0,-2)]; }
	else if(form == 'shape13') { var arrP = [new THREE.Vector3(-1,0,-2), new THREE.Vector3(-1,0,-1), new THREE.Vector3(-3,0,-1), new THREE.Vector3(-3,0,1), new THREE.Vector3(-1,0,1), new THREE.Vector3(-1,0,2), new THREE.Vector3(1,0,2), new THREE.Vector3(1,0,1), new THREE.Vector3(3,0,1), new THREE.Vector3(3,0,-1), new THREE.Vector3(1,0,-1), new THREE.Vector3(1,0,-2)]; }
	else if(form == 'shape14') { var arrP = [new THREE.Vector3(-2,0,-1), new THREE.Vector3(-2,0,0), new THREE.Vector3(-2,0,1), new THREE.Vector3(0,0,1.5), new THREE.Vector3(2,0,1), new THREE.Vector3(2,0,0), new THREE.Vector3(2,0,-1), new THREE.Vector3(0,0,-1.5)]; }	
	else if(form == 'shape15') { var arrP = [new THREE.Vector3(-2,0,-1), new THREE.Vector3(-2,0,1), new THREE.Vector3(0,0,2), new THREE.Vector3(2,0,1), new THREE.Vector3(2,0,-1), new THREE.Vector3(0,0,-2)]; }
	
	if(form == 'land') 
	{ 
		var arrP = [];
		arrP[0] = new THREE.Vector3(-15.3,0,-6.7);
		arrP[1] = new THREE.Vector3(-15.3,0,8.95);
		arrP[2] = new THREE.Vector3(-0.73,0,10.79);
		arrP[3] = new THREE.Vector3(19.51,0,9.63);
		arrP[4] = new THREE.Vector3(19.51,0,-7.35);
		arrP[5] = new THREE.Vector3(0,0,-7.95);
	}
	
	
	for ( var i = 0; i < arrP.length; i++ ) { createPoint( arrP[i], 0 ); }
	
	
	var inf = {};
	
	if(form == 'plan_area' || form == 'wall_kirpich')
	{
		inf = { texture : infProject.settings.wall.material };
	}
	
	if(infProject.settings.wall.color)
	{
		inf.color = infProject.settings.wall.color;
	}	
	
	if(form == 'shape1' || form == 'shape2' || form == 'shape3' || form == 'shape4' || form == 'shape5' || form == 'shape6' || form == 'shape7' || form == 'shape8' || form == 'shape9' || form == 'shape10' || form == 'shape11' || form == 'shape12' || form == 'shape13' || form == 'shape14' || form == 'shape15' || form == 'land' || form == 'plan_area')
	{
		for ( var i = 0; i < obj_point.length; i++ )
		{
			var i2 = (i == obj_point.length - 1) ? 0 : i + 1;		
			createOneWall3( obj_point[i], obj_point[i2], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		}		
	}
	
	if(form == 'shape7')
	{
		createOneWall3( obj_point[2], obj_point[5], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	else if(form == 'shape8')
	{
		createOneWall3( obj_point[3], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[2], obj_point[7], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	else if(form == 'shape9')
	{
		createPoint( new THREE.Vector3(-1,0,0), 0 );
		createPoint( new THREE.Vector3(1,0,0), 0 );
		createOneWall3( obj_point[1], obj_point[10], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[3], obj_point[10], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[10], obj_point[9], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[4], obj_point[11], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[11], obj_point[8], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[10], obj_point[11], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[11], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}
	else if(form == 'shape10')
	{
		createOneWall3( obj_point[1], obj_point[4], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[4], obj_point[7], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	else if(form == 'shape13')
	{
		createOneWall3( obj_point[4], obj_point[7], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[4], obj_point[1], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[7], obj_point[10], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[1], obj_point[10], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	else if(form == 'shape14')
	{
		createPoint( new THREE.Vector3(0,0,0), 0 );
		createOneWall3( obj_point[1], obj_point[8], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[3], obj_point[8], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[5], obj_point[8], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[7], obj_point[8], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	else if(form == 'shape15')
	{
		createPoint( new THREE.Vector3(0,0,0), 0 );
		createOneWall3( obj_point[0], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[1], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[2], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[3], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[4], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		createOneWall3( obj_point[5], obj_point[6], width_wall, JSON.parse( JSON.stringify( inf ) ) );
	}	
	
	
	if(form == 'level_2')
	{
		var arrP1 = [new THREE.Vector3(-3,0,-3), new THREE.Vector3(-3,0,0), new THREE.Vector3(0,0,3), new THREE.Vector3(3,0,3), new THREE.Vector3(3,0,-3),];
		
		var h2 = height_wall + 0.1;
		var arrP2 = [new THREE.Vector3(0,h2,0), new THREE.Vector3(0,h2,3), new THREE.Vector3(3,h2,6), new THREE.Vector3(6,h2,6), new THREE.Vector3(6,h2,0)]; 

		var arrPo1 = [];
		var arrPo2 = [];
		for ( var i = 0; i < arrP1.length; i++ ) { arrPo1[arrPo1.length] = createPoint( arrP1[i], 0 ); }
		for ( var i = 0; i < arrP2.length; i++ ) { arrPo2[arrPo2.length] = createPoint( arrP2[i], 0 ); }
		
		for ( var i = 0; i < arrPo1.length; i++ )
		{
			var i2 = (i == arrPo1.length - 1) ? 0 : i + 1;		
			createOneWall3( arrPo1[i], arrPo1[i2], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		}	

		for ( var i = 0; i < arrPo2.length; i++ )
		{
			var i2 = (i == arrPo2.length - 1) ? 0 : i + 1;		
			createOneWall3( arrPo2[i], arrPo2[i2], width_wall, JSON.parse( JSON.stringify( inf ) ) );
		}			
	}
	
	
	var wall = infProject.scene.array.wall;
	var point = infProject.scene.array.point;
	
	for ( var i = 0; i < point.length; i++ ) { upLineYY(point[i]); }	
	if(wall.length > 0) detectRoomZone();
	if(wall.length > 0) upLabelPlan_1(wall);
	if(wall.length > 0) createWallZone(wall[0])

	
	if(infProject.settings.camera.zoom != 1) { cameraZoomTop( infProject.settings.camera.zoom ); }
	
	centerCamera2D();
	renderCamera();
}








var w_w = window.innerWidth;
var w_h = window.innerHeight;
var aspect = w_w/w_h;
var d = 5;

var canvas = document.createElement( 'canvas' );
var context = canvas.getContext( 'webgl2', { antialias: false } );
var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: context, preserveDrawingBuffer: true, } );


//renderer.gammaInput = true;
//renderer.gammaOutput = true;
renderer.localClippingEnabled = true;
//renderer.autoClear = false;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( w_w, w_h );
//renderer.setClearColor (0xffffff, 1);
//renderer.setClearColor (0x9c9c9c, 1);
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

//----------- cameraTop
var cameraTop = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
cameraTop.position.set(0, 10, 0);
cameraTop.lookAt(scene.position);
cameraTop.zoom = infProject.settings.camera.zoom;
cameraTop.updateMatrixWorld();
cameraTop.updateProjectionMatrix();
//----------- cameraTop


//----------- camera3D
var camera3D = new THREE.PerspectiveCamera( 65, w_w / w_h, 0.2, 1000 );  
camera3D.rotation.order = 'YZX';		//'ZYX'
camera3D.position.set(5, 7, 5);
camera3D.lookAt(scene.position);
camera3D.rotation.z = 0;
camera3D.userData.camera = { type : 'fly', height : camera3D.position.y, startProject : true };
camera3D.userData.camera.click = { pos : new THREE.Vector3() }; 
//----------- camera3D




//----------- cameraWall
var cameraWall = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
cameraWall.zoom = 2
//----------- cameraWall


//----------- Light 
scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) ); 

var lights = [];
lights[ 0 ] = new THREE.PointLight( 0x222222, 0.7, 0 );
lights[ 1 ] = new THREE.PointLight( 0x222222, 0.5, 0 );
lights[ 2 ] = new THREE.PointLight( 0x222222, 0.8, 0 );
lights[ 3 ] = new THREE.PointLight( 0x222222, 0.2, 0 );

lights[ 0 ].position.set( -1000, 200, 1000 );
lights[ 1 ].position.set( -1000, 200, -1000 );
lights[ 2 ].position.set( 1000, 200, -1000 );
lights[ 3 ].position.set( 1000, 200, 1000 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );
scene.add( lights[ 3 ] );


var light = new THREE.DirectionalLight( 0xffffff, 0.3 );
light.position.set( 10, 10, 10 );
scene.add( light );
//----------- Light



var cube = new THREE.Mesh( createGeometryCube(0.07, 0.07, 0.07), new THREE.MeshLambertMaterial( { color : 0x030202, transparent: true, opacity: 1, depthTest: false } ) );
//scene.add( cube ); 




//----------- render
function animate() 
{
	requestAnimationFrame( animate );	

	cameraZoomTopLoop();	
	moveCameraToNewPosition();
	
	updateKeyDown();
}




function renderCamera()
{
	camera.updateMatrixWorld();			
	
	//renderer.autoClear = true;
	//renderer.clear();
	composer.render();
}


//----------- render


//----------- onWindowResize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() 
{ 
	var aspect = window.innerWidth / window.innerHeight;
	var d = 5;
	
	cameraTop.left = -d * aspect;
	cameraTop.right = d * aspect;
	cameraTop.top = d;
	cameraTop.bottom = -d;
	cameraTop.updateProjectionMatrix();

	 
	camera3D.aspect = aspect;
	camera3D.updateProjectionMatrix();
	
	cameraWall.left = -d * aspect;
	cameraWall.right = d * aspect;
	cameraWall.top = d;
	cameraWall.bottom = -d;
	cameraWall.updateProjectionMatrix();
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	renderCamera();
}
//----------- onWindowResize





//----------- start


var resolutionD_w = window.screen.availWidth;
var resolutionD_h = window.screen.availHeight;

var kof_rd = 1;

var countId = 2;
var camera = cameraTop;
var height_wall = infProject.settings.height;
var width_wall = infProject.settings.wall.width;
var obj_point = [];
var obj_line = [];
var room = [];
var ceiling = [];
var arrWallFront = [];
var lightMap_1 = new THREE.TextureLoader().load(infProject.path+'/img/lightMap_1.png');
var texture_point_1 = new THREE.TextureLoader().load(infProject.path+'/img/point1.png');
var texture_wd_1 = new THREE.TextureLoader().load(infProject.path+'/img/wd_1.png');

var clickO = resetPop.clickO();
infProject.project = null;
infProject.settings.active = { pg: 'pivot' };
infProject.scene.array = resetPop.infProjectSceneArray(); 
infProject.scene.grid = { obj: createGrid(infProject.settings.grid), active: false, link: false, show: true };
infProject.scene.block = { key : { scroll : false } };		// блокировка действий/клавишь
infProject.scene.block.click = {wall: false, point: false, door: false, window: false, room: false, tube: false, controll_wd: false, obj: false};
infProject.scene.block.hover = {wall: false, point: false, door: false, window: false, room: false, tube: false, controll_wd: false, obj: false};
infProject.geometry = { circle : createCircleSpline() }
infProject.geometry.labelWall = createGeometryPlan(0.25 * 2, 0.125 * 2);
infProject.geometry.labelFloor = createGeometryPlan(1.0 * kof_rd, 0.25 * kof_rd);
infProject.geometry.wf_point = createGeometryCube(0.1, 0.1, 0.1, {});
infProject.tools = { pivot: createPivot(), gizmo: createGizmo360(), cutWall: [], point: createToolPoint(), axis: [createLineAxis(), createLineAxis()] } 

infProject.catalog = infoListObj();  
infProject.listColor = resetPop.listColor(); 
infProject.start = true; 

infProject.ui = {}
infProject.ui.list_wf = [];
infProject.ui.main_menu = [];
infProject.ui.right_menu = {active: ''};





// cutoff боковые отсечки для линеек
// format_1 линейки для отображения длины/высоты стены в режиме cameraWall
// format_2 линейки для окон/мебели
// format_3 нижние размеры между мебелью в режиме cameraWall 
// cube контроллеры для изменения ширины/длины wd
var arrSize = { cutoff : createRulerCutoff(), format_1 : {}, format_2 : {}, format_3 : {line : [], label : []}, cube : createControllWD() };
var labelGeometry_1 = createGeometryPlan2(0.25 * kof_rd, 0.125 * kof_rd); 
arrSize.format_1 = { line : createRulerWin({count : 6, color : 0xcccccc, material : 'standart'}), label : createLabelCameraWall({ count : 2, text : 0, size : 50, ratio : {x:256*2, y:256}, border : 'white', geometry : labelGeometry_1 }) };
arrSize.format_2 = { line : createRulerWin({count : 6, color : 0x000000}), label : createLabelCameraWall({ count : 6, text : 0, size : 50, ratio : {x:256*2, y:256}, border : 'border line', geometry : labelGeometry_1 }) };
arrSize.numberTexture = { line : createRulerWin({count : 6, color : 0x000000, material : 'standart'}), label : createLabelCameraWall({ count : 6, text : [1,2,3,4,5,6], materialTop : 'no', size : 85, ratio : {x:256, y:256}, geometry : createGeometryPlan(0.25, 0.25) }) };



var planeMath = createPlaneMath();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
  
  
 
 
if(infProject.settings.calc.fundament == 'svai') 
{
	infProject.scene.tool.pillar = createPillar();
}


camera3D.position.x = radious * Math.sin( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
camera3D.position.y = radious * Math.sin( phi * Math.PI / 360 );
camera3D.position.z = radious * Math.cos( theta * Math.PI / 360 ) * Math.cos( phi * Math.PI / 360 );
	
camera3D.position.add(centerCam);	
camera3D.lookAt(centerCam);




// outline render
if(1==1)
{
	var composer = new THREE.EffectComposer( renderer );
	var renderPass = new THREE.RenderPass( scene, cameraTop );
	var outlinePass = new THREE.OutlinePass( new THREE.Vector2( w_w, w_h ), scene, cameraTop );
	composer.setSize( w_w, w_h );
	composer.addPass( renderPass );
	composer.addPass( outlinePass );


	outlinePass.visibleEdgeColor.set( '#25db00' );
	outlinePass.hiddenEdgeColor.set( '#25db00' );
	outlinePass.edgeStrength = Number( 5 );		// сила/прочность
	outlinePass.edgeThickness = Number( 0.01 );	// толщина

	outlinePass.selectedObjects = [];


	function outlineAddObj( obj, cdm )
	{	
		if(!cdm) cdm = {};
		
		var arr = [obj];
		if(cdm.arrO) { var arr = cdm.arrO; }	
		
		outlinePass.selectedObjects = arr;  
	}

	function outlineRemoveObj()
	{
		outlinePass.selectedObjects = [];
	}	
}



addObjInCatalogUI_1();	// каталог UI
changeRightMenuUI_1({name: 'button_wrap_plan'});	// назначаем первоначальную вкладку , которая будет включена


//----------- start




function createPillar()
{	
	var n = 0;
	var v = [];
	for ( var i = 0; i < circle.length; i++ )
	{
		v[n] = new THREE.Vector3().addScaledVector( circle[i].clone().normalize(), 0.1 );
		v[n].y = 0;		
		n++;		
		
		v[n] = new THREE.Vector3();
		v[n].y = 0;
		n++;
		
		v[n] = v[n - 2].clone();
		v[n].y = -1;
		n++;	
		
		v[n] = new THREE.Vector3();
		v[n].y = -1;
		n++;		
	}	

	
	var obj = new THREE.Mesh( createGeometryCircle(v), new THREE.MeshLambertMaterial( { color : 0x333333, wireframe:false } ) ); 
	obj.userData.tag = 'pillar';
	obj.renderOrder = 1;
	obj.position.set(0,0,0);
	
	return obj;
}



function createPlaneMath()
{
	var geometry = new THREE.PlaneGeometry( 10000, 10000 );
	//var geometry = new THREE.PlaneGeometry( 10, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, transparent: true, opacity: 0.5, side: THREE.DoubleSide } );
	material.visible = false; 
	var planeMath = new THREE.Mesh( geometry, material );
	planeMath.rotation.set(-Math.PI/2, 0, 0);
	planeMath.userData.tag = 'planeMath';	
	scene.add( planeMath );	
	
	return planeMath;
}



function createGeometryPlan(x, y)
{
	var geometry = new THREE.Geometry();
	var vertices = [
				new THREE.Vector3(-x,0,-y),
				new THREE.Vector3(-x,0,y),
				new THREE.Vector3(x,0,y),
				new THREE.Vector3(x,0,-y),
			];

	var faces = [
				new THREE.Face3(0,1,2),
				new THREE.Face3(2,3,0),
			];
	var uvs1 = [
				new THREE.Vector2(0,1),
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
			];
	var uvs2 = [
				new THREE.Vector2(1,0),
				new THREE.Vector2(1,1),
				new THREE.Vector2(0,1),
			];			
	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.faceVertexUvs[0] = [uvs1, uvs2];
	geometry.computeFaceNormals();
	
	geometry.uvsNeedUpdate = true;
	
	return geometry;
}



function createGeometryPlan2(x, y)
{
	var geometry = new THREE.Geometry();
	var vertices = [
				new THREE.Vector3(-x,-y,0),
				new THREE.Vector3(-x,y,0),
				new THREE.Vector3(x,y,0),
				new THREE.Vector3(x,-y,0),
			];

	var faces = [
				new THREE.Face3(0,3,2),
				new THREE.Face3(2,1,0),
			];
	var uvs1 = [
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
				new THREE.Vector2(1,1),
			];
	var uvs2 = [
				new THREE.Vector2(1,1),
				new THREE.Vector2(0,1),
				new THREE.Vector2(0,0),
			];			
	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.faceVertexUvs[0] = [uvs1, uvs2];
	geometry.computeFaceNormals();
	
	geometry.uvsNeedUpdate = true;
	
	return geometry;
}



function createGeometryCube(x, y, z, cdm)
{
	var geometry = new THREE.Geometry();
	x /= 2;
	z /= 2;
	var vertices = [
				new THREE.Vector3(-x,0,z),
				new THREE.Vector3(-x,y,z),
				new THREE.Vector3(x,y,z),
				new THREE.Vector3(x,0,z),
				new THREE.Vector3(x,0,-z),
				new THREE.Vector3(x,y,-z),
				new THREE.Vector3(-x,y,-z),
				new THREE.Vector3(-x,0,-z),
			];	
			
	var faces = [
				new THREE.Face3(0,3,2),
				new THREE.Face3(2,1,0),
				new THREE.Face3(4,7,6),
				new THREE.Face3(6,5,4),				
				new THREE.Face3(0,1,6),
				new THREE.Face3(6,7,0),					
				new THREE.Face3(1,2,5),
				new THREE.Face3(5,6,1),				
				new THREE.Face3(2,3,4),
				new THREE.Face3(4,5,2),				
				new THREE.Face3(3,0,7),
				new THREE.Face3(7,4,3),
			];
	
	var uvs3 = [
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
				new THREE.Vector2(1,1),
			];
	var uvs4 = [
				new THREE.Vector2(1,1),
				new THREE.Vector2(0,1),
				new THREE.Vector2(0,0),
			];	

	var uvs1 = [
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
				new THREE.Vector2(0.95,1),
			];
	var uvs2 = [
				new THREE.Vector2(0.95,1),
				new THREE.Vector2(1-0.95,1),
				new THREE.Vector2(0,0),
			];				


			
	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.faceVertexUvs[0] = [uvs3, uvs4, uvs3, uvs4, uvs3, uvs4, uvs1, uvs2, uvs3, uvs4, uvs3, uvs4];
	geometry.computeFaceNormals();	
	geometry.uvsNeedUpdate = true;	

	if(cdm)
	{
		if(cdm.material)
		{
			geometry.faces[0].materialIndex = 1;
			geometry.faces[1].materialIndex = 1;	
			geometry.faces[2].materialIndex = 2;
			geometry.faces[3].materialIndex = 2;	
			geometry.faces[6].materialIndex = 3;
			geometry.faces[7].materialIndex = 3;				
		}
	}
	
	return geometry;
}




function createGeometryWall(x, y, z, pr_offsetZ)
{
	var geometry = new THREE.Geometry();
	
	var h1 = 0;
	
	if(1==1)
	{
		var z1 = z / 2 + pr_offsetZ / 2;
		var z2 = -z / 2 + pr_offsetZ / 2;  		
	}
	else
	{
		var z1 = z / 2 + pr_offsetZ;
		var z2 = -z / 2 + pr_offsetZ;  		
	}
		
	var vertices = [
				new THREE.Vector3(0,h1,z1),
				new THREE.Vector3(0,y,z1),
				new THREE.Vector3(0,h1,0),
				new THREE.Vector3(0,y,0),
				new THREE.Vector3(0,h1,z2),
				new THREE.Vector3(0,y,z2),								
								
				new THREE.Vector3(x,h1,z1),
				new THREE.Vector3(x,y,z1),
				new THREE.Vector3(x,h1,0),
				new THREE.Vector3(x,y,0),
				new THREE.Vector3(x,h1,z2),
				new THREE.Vector3(x,y,z2),						
			];	
			
	var faces = [
				new THREE.Face3(0,6,7),
				new THREE.Face3(7,1,0),
				new THREE.Face3(4,5,11),
				new THREE.Face3(11,10,4),				
				new THREE.Face3(1,7,9),
				new THREE.Face3(9,3,1),					
				new THREE.Face3(9,11,5),
				new THREE.Face3(5,3,9),				
				new THREE.Face3(6,8,9),
				new THREE.Face3(9,7,6),				
				new THREE.Face3(8,10,11),
				new THREE.Face3(11,9,8),
				
				new THREE.Face3(0,1,3),
				new THREE.Face3(3,2,0),	

				new THREE.Face3(2,3,5),
				new THREE.Face3(5,4,2),	

				new THREE.Face3(0,2,8),
				new THREE.Face3(8,6,0),

				new THREE.Face3(2,4,10),
				new THREE.Face3(10,8,2),					
			];
	
	var uvs1 = [
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
				new THREE.Vector2(1,1),
			];
	var uvs2 = [
				new THREE.Vector2(1,1),
				new THREE.Vector2(0,1),
				new THREE.Vector2(0,0),
			];					


			
	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.faceVertexUvs[0] = [uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2];
	geometry.computeFaceNormals();	
	geometry.uvsNeedUpdate = true;	
	
	geometry.faces[0].materialIndex = 1;
	geometry.faces[1].materialIndex = 1;	
	geometry.faces[2].materialIndex = 2;
	geometry.faces[3].materialIndex = 2;	
	geometry.faces[4].materialIndex = 3;
	geometry.faces[5].materialIndex = 3;
	geometry.faces[6].materialIndex = 3;
	geometry.faces[7].materialIndex = 3;
	
	return geometry;
}



function createLineAxis() 
{
	var geometry = createGeometryCube(0.5, 0.01, 0.01);
	
	var p1 = new THREE.Vector3(0,0,0);
	var p2 = new THREE.Vector3(1,0,0);
	
	var d = p1.distanceTo( p2 );	
	var v = geometry.vertices;
	
	v[3].x = v[2].x = v[5].x = v[4].x = d;
	v[0].x = v[1].x = v[6].x = v[7].x = 0;
	
	
	var axis = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color : 0xff0000, transparent: true, depthTest: false } ) );
	axis.position.copy( p1 );
	axis.renderOrder = 2;
	scene.add( axis );		
	
	axis.visible = false;
	
	return axis;
}

// vertex для Gizmo
function createGeometryCircle( vertices )
{
	var geometry = new THREE.Geometry();

	var faces = [];

	var n = 0;
	for ( var i = 0; i < vertices.length - 4; i += 4 )
	{
		faces[ n ] = new THREE.Face3( i + 0, i + 4, i + 6 ); n++;
		faces[ n ] = new THREE.Face3( i + 6, i + 2, i + 0 ); n++;

		faces[ n ] = new THREE.Face3( i + 2, i + 6, i + 7 ); n++;
		faces[ n ] = new THREE.Face3( i + 7, i + 3, i + 2 ); n++;

		faces[ n ] = new THREE.Face3( i + 3, i + 7, i + 5 ); n++;
		faces[ n ] = new THREE.Face3( i + 5, i + 1, i + 3 ); n++;

		faces[ n ] = new THREE.Face3( i + 0, i + 1, i + 5 ); n++;
		faces[ n ] = new THREE.Face3( i + 5, i + 4, i + 0 ); n++;
	}


	faces[ n ] = new THREE.Face3( i + 0, 0, 2 ); n++;
	faces[ n ] = new THREE.Face3( 2, i + 2, i + 0 ); n++;

	faces[ n ] = new THREE.Face3( i + 2, 2, 3 ); n++;
	faces[ n ] = new THREE.Face3( 3, i + 3, i + 2 ); n++;

	faces[ n ] = new THREE.Face3( i + 3, 3, 1 ); n++;
	faces[ n ] = new THREE.Face3( 1, i + 1, i + 3 ); n++;

	faces[ n ] = new THREE.Face3( i + 0, i + 1, 1 ); n++;
	faces[ n ] = new THREE.Face3( 1, 0, i + 0 ); n++;



	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.computeFaceNormals();
	geometry.uvsNeedUpdate = true;

	return geometry;
}




function createCircleSpline()
{
	var count = 48;
	var circle = [];
	var g = (Math.PI * 2) / count;
	
	for ( var i = 0; i < count; i++ )
	{
		var angle = g * i;
		circle[i] = new THREE.Vector3();
		circle[i].x = Math.sin(angle);
		circle[i].z = Math.cos(angle);
		//circle[i].y = 0;
	}

	return circle;
}


function createToolPoint()
{	
	var n = 0;
	var v = [];
	
	var geometry = new THREE.SphereGeometry( 0.1, 16, 16 );
	
	var obj = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color : 0xcccccc, transparent: true, opacity: 1.0, depthTest: false, lightMap : lightMap_1 } ) );
	//obj.material.map = texture_point_1;
	//obj.material.map.offset.x = 0.5;
	//obj.material.map.offset.y = 0.5;
	//obj.material.map.repeat.set(4.9, 4.9); 
	//obj.material.visible = false;
	obj.userData.tag = 'tool_point';
	obj.userData.tool_point = {};
	obj.renderOrder = 1;
	obj.position.set(0,0,0);
	obj.visible = false;	
	scene.add( obj );
	
	//default vertices
	if(1==1)
	{
		var v2 = [];
		var v = obj.geometry.vertices;
		for ( var i = 0; i < v.length; i++ ) { v2[i] = v[i].clone(); }
		obj.userData.tool_point.v2 = v2;		
	}	
	
	//upUvs_4( obj )
	return obj;
}




function upUvs_4( obj )
{
	obj.updateMatrixWorld();
	var geometry = obj.geometry;
	
    geometry.faceVertexUvs[0] = [];
	var faces = geometry.faces;
	
    for (var i = 0; i < faces.length; i++) 
	{		
		var components = ['x', 'y', 'z'].sort(function(a, b) {			
			return Math.abs(faces[i].normal[a]) - Math.abs(faces[i].normal[b]);
		});	


        var v1 = geometry.vertices[faces[i].a];
        var v2 = geometry.vertices[faces[i].b];
        var v3 = geometry.vertices[faces[i].c];				

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);
    }

    geometry.uvsNeedUpdate = true;
	geometry.elementsNeedUpdate = true; 
}




function createPoint( pos, id )
{
	var point = obj_point[obj_point.length] = new THREE.Mesh( infProject.tools.point.geometry, infProject.tools.point.material.clone() );
	point.position.copy( pos );		

	point.renderOrder = 1;
	
	point.w = [];
	point.p = [];
	point.start = [];		
	point.zone = [];
	point.zoneP = [];
	
	
	if(id == 0) { id = countId; countId++; }	
	point.userData.id = id;	
	point.userData.tag = 'point';
	point.userData.point = {};
	point.userData.point.color = point.material.color.clone();
	point.userData.point.cross = null;
	point.userData.point.type = null;
	point.userData.point.last = { pos : pos.clone(), cdm : '', cross : null };
	
	point.visible = (camera == cameraTop) ? true : false;
	
	if(infProject.scene.tool.pillar)
	{
		var pillar = infProject.scene.tool.pillar.clone();
		pillar.position.copy(point.position);
		point.userData.point.pillar = pillar;
		pillar.visible = (camera == camera3D) ? true : false;
		scene.add( pillar );
	}
	
	scene.add( point );	
	
	return point;
}


  



function createOneWall3( point1, point2, width, cdm ) 
{
	var offsetZ = (cdm.offsetZ) ? cdm.offsetZ : 0;  
	var height = (cdm.height) ? cdm.height : height_wall; 
	
	var p1 = point1.position;
	var p2 = point2.position;	
	var d = p1.distanceTo( p2 );
	
	var color = [0x7d7d7d, 0x696969]; 
	
	
	if(infProject.settings.project == 'warm_floor' && infProject.settings.wall.color) 
	{  
		if(infProject.settings.wall.color.front) color[0] = infProject.settings.wall.color.front; 
		if(infProject.settings.wall.color.top) color[1] = infProject.settings.wall.color.top; 
	}	
	
	var material = new THREE.MeshLambertMaterial({ color : color[0], lightMap : lightMap_1 });
	
	var materials = [ material.clone(), material.clone(), material.clone(), new THREE.MeshLambertMaterial( { color: color[1], lightMap : lightMap_1 } ) ];
	
	if(cdm.color)
	{
		for( var i = 0; i < cdm.color.length; i++ )
		{
			
			for( var i2 = 0; i2 < materials.length; i2++ )
			{
				if(cdm.color[i].index == i2) { materials[i2].color = new THREE.Color( cdm.color[i].o ); break; }
			}
		}
	}

	
	var geometry = createGeometryWall(d, height, width, offsetZ);	
	var wall = obj_line[obj_line.length] = new THREE.Mesh( geometry, materials ); 
 	
	
	wall.label = [];
	wall.label[0] = createLabelCameraWall({ count : 1, text : 0, size : 85, ratio : {x:256*2, y:256}, geometry : infProject.geometry.labelWall, opacity : 0.5 })[0];	
	wall.label[0].visible = false;
	
	wall.label[1] = createLabelCameraWall({ count : 1, text : 0, size : 85, ratio : {x:256*2, y:256}, geometry : infProject.geometry.labelWall, opacity : 0.5 })[0]; 
	wall.label[1].visible = false;
	
	if(infProject.settings.wall.label == 'outside' || infProject.settings.wall.label == 'inside') 
	{
		wall.label[0].visible = true;
	}
	else if(infProject.settings.wall.label == 'double') 
	{
		wall.label[0].visible = true;
		wall.label[1].visible = true;
	}
	
	
	wall.position.copy( p1 );
	
	// --------------
	if(!cdm.id) { cdm.id = countId; countId++; }
	
	wall.userData.tag = 'wall';
	wall.userData.id = cdm.id;
	
	wall.userData.wall = {};				
	wall.userData.wall.p = [];
	wall.userData.wall.p[0] = point1;
	wall.userData.wall.p[1] = point2;	
	wall.userData.wall.width = Math.round(width * 100) / 100;
	wall.userData.wall.height_0 = -0.1;
	wall.userData.wall.height_1 = Math.round(height * 100) / 100;		
	wall.userData.wall.offsetZ = Math.round(offsetZ * 100) / 100;
	wall.userData.wall.outline = null;
	wall.userData.wall.zone = null; 
	wall.userData.wall.arrO = [];
	wall.userData.wall.last = { pos : new THREE.Vector3(), rot : new THREE.Vector3() }; 
	wall.userData.wall.area = { top : 0 }; 
	//wall.userData.wall.active = { click: true, hover: true };
	
	wall.userData.wall.room = { side : 0, side2 : [null,null,null] };
	
	var v = wall.geometry.vertices;
	wall.userData.wall.v = [];
	
	for ( var i = 0; i < v.length; i++ ) { wall.userData.wall.v[i] = v[i].clone(); }
	
	wall.userData.material = [];
	wall.userData.material[0] = { color : wall.material[0].color, scale : new THREE.Vector2(1,1), };	// top
	wall.userData.material[1] = { color : wall.material[1].color, scale : new THREE.Vector2(1,1), };	// left
	wall.userData.material[2] = { color : wall.material[2].color, scale : new THREE.Vector2(1,1), };	// right
	wall.userData.material[3] = { color : wall.material[3].color, scale : new THREE.Vector2(1,1), };
	// --------------

	
	upUvs_1( wall );
	
	if(cdm.texture)
	{ 
		var m = cdm.texture;
		
		for ( var i = 0; i < m.length; i++ )
		{
			setTexture({obj:wall, material:m[i]});
		}	
	}
	
	//
	
	var dir = new THREE.Vector3().subVectors( p1, p2 ).normalize();
	var angleDeg = Math.atan2(dir.x, dir.z);
	wall.rotation.set(0, angleDeg + Math.PI / 2, 0);
	
	
	var n = point1.w.length;		
	point1.w[n] = wall;
	point1.p[n] = point2;
	point1.start[n] = 0;	
	
	var n = point2.w.length;		
	point2.w[n] = wall;
	point2.p[n] = point1;
	point2.start[n] = 1;		
	
	scene.add( wall );
		
	return wall;
}


 

function rayIntersect( event, obj, t ) 
{
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	raycaster.setFromCamera( mouse, camera );
	
	var intersects = null;
	if(t == 'one'){ intersects = raycaster.intersectObject( obj ); } 
	else if(t == 'arr'){ intersects = raycaster.intersectObjects( obj ); }
	
	return intersects;
}




// устанавливаем текстуру
function setTexture(cdm)
{
	//if(!cdm.img) return;
	
	var img = infProject.path+cdm.material.img;
	var material = (cdm.material.index) ? cdm.obj.material[cdm.material.index] : cdm.obj.material;
	
	new THREE.TextureLoader().load(img, function ( image )  
	{
		material.color = new THREE.Color( 0xffffff );
		var texture = image;			
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		
		if(cdm.repeat)
		{
			texture.repeat.x = cdm.repeat.x;
			texture.repeat.y = cdm.repeat.y;			
		}
		else
		{
			texture.repeat.x = 1;
			texture.repeat.y = 1;			
		}
		
		texture.needsUpdate = true;
		
		material.map = texture; 
		material.lightMap = lightMap_1;
		material.needsUpdate = true; 					
		
		renderCamera();
	});			
}




// изменение высоты стен
function changeHeightWall()
{  
	if(infProject.activeInput == 'input-height')
	{
		var h2 = $('input[data-action="input-height"]').val();
		h2 /= 100;   
	}	
	else if(infProject.activeInput == 'size-wall-height')
	{
		var h2 = $('input[data-action="size-wall-height"]').val();
	}	
	
	if(!isNumeric(h2)) return;	
	h2 = Number(h2);
	
	
	if(h2 < 0.01) { h2 = 0.01; }
	if(h2 > 3) { h2 = 3; }
		
	height_wall = h2;	
	if(infProject.settings.floor.changeY) { infProject.settings.floor.height = infProject.settings.floor.posY = h2; }		
	
	clickMovePoint_BSP( obj_line );
	
	for ( var i = 0; i < obj_line.length; i++ )
	{
		var v = obj_line[i].geometry.vertices;
		
		v[1].y = h2;
		v[3].y = h2;
		v[5].y = h2;
		v[7].y = h2;
		v[9].y = h2;
		v[11].y = h2;
		obj_line[i].geometry.verticesNeedUpdate = true;
		obj_line[i].geometry.elementsNeedUpdate = true;
		
		obj_line[i].userData.wall.height_1 = Math.round(h2 * 100) / 100;
	}
	
	upLabelPlan_1( obj_line );
	clickPointUP_BSP( obj_line );
	
	var n = 0;
	var circle = infProject.geometry.circle;
	var v = infProject.tools.point.geometry.vertices;	
	
	for ( var i = 0; i < circle.length; i++ )
	{		
		v[ n ] = new THREE.Vector3().addScaledVector( circle[ i ].clone().normalize(), 0.1 / camera.zoom );
		v[ n ].y = 0;
		n++;

		v[ n ] = new THREE.Vector3();
		v[ n ].y = 0;
		n++;
		
		v[ n ] = v[ n - 2 ].clone();
		v[ n ].y = h2 + 0.01;
		n++;

		v[ n ] = new THREE.Vector3();
		v[ n ].y = h2 + 0.01;
		n++; 		
	}	
	infProject.tools.point.geometry.verticesNeedUpdate = true;
	infProject.tools.point.geometry.elementsNeedUpdate = true;
	
	
	
	//h2 = Math.round(h2 * 10) / 100;
	
	
	if(infProject.activeInput == 'input-height')
	{
		$('input[data-action="input-height"]').val(h2*100);
	}	
	else if(infProject.activeInput == 'size-wall-height')
	{
		$('input[data-action="size-wall-height"]').val(h2);
	}	
	
	updateShapeFloor(room);
	calculationAreaFundament_2();
	
	if(infProject.scene.array.wall.length > 0) { showRuleCameraWall(); }	// обновляем размеры стены
	
	renderCamera();
}
	
	

	




// нажали на кнопку интерфейса, загружаем объект	
function clickButton( event )
{
	if(!clickO.button) return;	
	
	if(camera == cameraTop)
	{
		planeMath.position.set(0, 0, 0);
		planeMath.rotation.set(-Math.PI/2, 0, 0);
	}
	if(camera == cameraWall)
	{
		var dir = camera.getWorldDirection();
		dir.addScalar(-10);
		planeMath.position.copy(camera.position);
		planeMath.position.add(dir);  
		planeMath.rotation.copy( camera.rotation ); 				
	}
	
	planeMath.updateMatrixWorld();

	var intersects = rayIntersect( event, planeMath, 'one' );
	
	if(intersects.length == 0) return;	
	
	if(camera == cameraTop)
	{ 
		if(clickO.button == 'create_wall')
		{
			clickO.obj = null; 
			clickO.last_obj = null;
			
			var point = createPoint( intersects[0].point, 0 );
			point.position.y = 0;
			point.userData.point.type = clickO.button; 
			clickO.move = point;

			if(point.userData.point.type == 'create_zone') { point.userData.point.type = 'create_wall'; }				
		}
		else if(clickO.button == 'create_wd_2')
		{
			createEmptyFormWD_1({type:'door', lotid: 4});
		}
		else if(clickO.button == 'create_wd_3')
		{
			createEmptyFormWD_1({type:'window', lotid: 1});
		}			
		else if(clickO.button == 'add_lotid')
		{
			loadObjServer({lotid: clickO.options, cursor: true});
		}		
	}
	else if(camera == camera3D)
	{
		if(clickO.button == 'add_lotid')
		{
			loadObjServer({lotid: clickO.options, cursor: true});
		}		
	}
	else if(camera == cameraWall)
	{
		if(clickO.button == 'create_wd_3')
		{
			createEmptyFormWD_1({type:'window'});
		}
	}
	
	clickO.buttonAct = clickO.button;
	clickO.button = null;

	
}	
	

function clickInterface(cdm)
{
	if(clickO.move)
	{
		deActiveSelected();
		mouseDownRight();
	}

	
	if(cdm)
	{		
		deActiveSelected();	
		
		if(cdm.button == '2D')
		{  			
			if(infProject.settings.interface.button.cam2d == 'front') { changeCamera(cameraWall); }
			else { changeCamera(cameraTop); } 
		}
		else if(cdm.button == '3D')
		{
			changeCamera(camera3D);
		}	
		else if(cdm.button == 'point_1')
		{
			clickO.button = 'create_wall';
		}
		else if(cdm.button == 'create_wd_2')
		{
			clickO.button = 'create_wd_2';
		}
		else if(cdm.button == 'create_wd_3')
		{
			clickO.button = 'create_wd_3';
		}		
		else if(cdm.button == 'add_lotid')
		{
			clickO.button = 'add_lotid';
			clickO.options = cdm.value;
		}			
		else if(cdm.button == 'grid_show_1')
		{
			showHideGrid(); 
		}
		else if(cdm.button == 'grid_move_1')
		{
			startEndMoveGrid(); 
		}
		else if(cdm.button == 'grid_link_1')
		{
			linkGrid(); 
		}		
	}

}	



// декативируем старое выделение (объект и меню)
function deActiveSelected()
{
	clickO.obj = null;
	clickO.rayhit = null;
	
	if ( camera == cameraTop ) { hideMenuObjUI_2D( clickO.last_obj ); }
	else if ( camera == camera3D ) { hideMenuObjUI_3D( clickO.last_obj ); }
	else if ( camera == cameraWall ) { hideMenuObjUI_Wall(clickO.last_obj); }		
}




function upUvs_1( obj )
{ return;
	obj.updateMatrixWorld();
	var geometry = obj.geometry;
	
    geometry.faceVertexUvs[0] = [];
	var faces = geometry.faces;
	var n = 1;
	
	
    for (var i = 0; i < faces.length; i++) 
	{		
		var components = ['x', 'y', 'z'].sort(function(a, b) {
			return Math.abs(faces[i].normal[a]) > Math.abs(faces[i].normal[b]);
		});	


        var v1 = geometry.vertices[faces[i].a];
        var v2 = geometry.vertices[faces[i].b];
        var v3 = geometry.vertices[faces[i].c];				

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);
    }

    geometry.uvsNeedUpdate = true;
	geometry.elementsNeedUpdate = true;	
}





//----------- Math			
function localTransformPoint(dir1, qt)
{	
	return dir1.clone().applyQuaternion( qt.clone().inverse() );
}


function worldTransformPoint(dir1, dir_local)
{	
	var qt = quaternionDirection(dir1);			
	return dir_local.applyQuaternion( qt );
}


function quaternionDirection(dir1)
{
	var mx = new THREE.Matrix4().lookAt( dir1, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0) );
	return new THREE.Quaternion().setFromRotationMatrix(mx);	
}
//----------- Math
 

 
 

// screenshot
function saveAsImage() 
{ 
	try 
	{		
		renderer.antialias = true;
		renderer.render( scene, camera );
		
		var strMime = "image/png";
		var imgData = renderer.domElement.toDataURL(strMime);	

		renderer.antialias = false;
		renderer.render( scene, camera );
 
		openFileImage(imgData.replace(strMime, "image/octet-stream"), "screenshot.png");
	} 
	catch (e) 
	{
		
		return;
	}
}


// screenshot сохраняем в bd
function saveAsImagePreview() 
{ 
	try 
	{		
		var rd = 400/w_w;
		var flag = infProject.scene.grid.obj.visible;
		
		if(flag) { infProject.scene.grid.obj.visible = false; }
		renderer.setSize( 400, w_h*rd );
		renderer.antialias = true;
		renderer.render( scene, camera );
		
		var imgData = renderer.domElement.toDataURL("image/jpeg", 0.7);	

		if(flag) { infProject.scene.grid.obj.visible = true; }
		renderer.setSize( w_w, w_h );
		renderer.antialias = false;
		renderer.render( scene, camera );
		
		return imgData;
	} 
	catch (e) 
	{
		
		return null;
	}
}


// открыть или сохранить screenshot
var openFileImage = function (strData, filename) 
{
	var link = document.createElement('a');
	
	if(typeof link.download === 'string') 
	{		
		document.body.appendChild(link); //Firefox requires the link to be in the body
		link.download = filename;
		link.href = strData;
		link.click();
		document.body.removeChild(link); //remove the link when done
	} 
	else 
	{
		location.replace(uri);
	}
} 
  
 


function createEstimateJson()
{
	var arr = [];
	
	var inf = infProject.settings.calc.fundament;
	if(inf == 'lent' || inf == 'svai') 
	{
		var fundament = infProject.scene.array.fundament;		
		
		for ( var i = 0; i < fundament.length; i++ )
		{
			
			var points = fundament[i].points;
			var walls = fundament[i].walls;
			
			var sum = 0;
			for ( var i2 = 0; i2 < walls.length; i2++ )
			{
				sum += walls[i2].userData.wall.area.top;
			}
			
			sum = Math.round(sum * 100)/100;
			
			
			
			
				

			var cdm = {};
			cdm.name = infProject.nameId;	// название
			cdm.area = sum;		// площадь
			cdm.height = height_wall * 100;		// высота
			cdm.space = Math.round((sum * height_wall) * 100) / 100;	// объем
			
			arr[arr.length] = cdm;
		}		
	}	
	else
	{
		
		for (var u = 0; u < room.length; u++)
		{
			var cdm = {};
			cdm.name = infProject.nameId;	// название
			cdm.area = room[u].userData.room.areaTxt;		// площадь
			cdm.height = height_wall * 100;		// высота
			cdm.space = Math.round((room[u].userData.room.areaTxt * height_wall) * 100) / 100;	// объем
			
			arr[arr.length] = cdm;			
		}
	}

	if(arr.length > 0)
	{
		var html = '';
		
		for (var i = 0; i < arr.length; i++)
		{
			html += '<div class="modal_body_content_estimate">';
			
			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Площадь</div>';
			html += '<div class="block_form_1_desc" area_1="">'+arr[i].area+' м2</div>';
			html += '</div>';

			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Высота</div>';
			html += '<div class="block_form_1_desc" area_1="">'+arr[i].height+' cм</div>';
			html += '</div>';	

			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Объем бетона</div>';
			html += '<div class="block_form_1_desc" area_1="">'+arr[i].space+' м3</div>';
			html += '</div>';	
			
			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Вес бетона</div>';
			html += '<div class="block_form_1_desc" area_1="">'+Math.round(arr[i].space * 2350/10)/100+' т</div>';
			html += '</div>';

			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Опалубка</div>';
			html += '<div class="block_form_1_desc" area_1="">24 м</div>';
			html += '</div>';
			
			html += '<div class="block_form_1">';
			html += '<div class="block_form_1_h1">Периметр плиты</div>';
			html += '<div class="block_form_1_desc" area_1="">24 м</div>';
			html += '</div>';		
			
			html += '</div>';

			if(i < arr.length - 1)
			{
				html += '<div style="background: #444; height: 1px; width: 90%; margin: auto; box-shadow:0px 0px 2px #bababa;"></div>';
			}				
		}
		
		
		$('[modal_body="estimate"]').html(html);
	}
	else
	{
		var html = '<div class="modal_body_content_estimate_error">';
		html += '<br><br>нет данных<br><br>';
		html += 'постройте фундамент';
		html += '</div>';
		
		$('[modal_body="estimate"]').html(html);
	}
}

		
	
 
function setUnits()
{
	 
}



// находим стены/точки/объекты по id
function findObjFromId( cdm, id )
{
	var point = infProject.scene.array.point;
	var wall = infProject.scene.array.wall;
	var window = infProject.scene.array.window;
	var door = infProject.scene.array.door;	
	var room = infProject.scene.array.room;
	var obj = infProject.scene.array.obj; 
	
	
	if(cdm == 'wall')
	{
		for ( var i = 0; i < wall.length; i++ ){ if(wall[i].userData.id == id){ return wall[i]; } }			
	}
	else if(cdm == 'point')
	{
		for ( var i = 0; i < point.length; i++ ){ if(point[i].userData.id == id){ return point[i]; } }
	}
	else if(cdm == 'wd')
	{
		for ( var i = 0; i < window.length; i++ ){ if(window[i].userData.id == id){ return window[i]; } }
		for ( var i = 0; i < door.length; i++ ){ if(door[i].userData.id == id){ return door[i]; } }
	}
	else if(cdm == 'window')
	{
		for ( var i = 0; i < window.length; i++ ){ if(window[i].userData.id == id){ return window[i]; } }
	}
	else if(cdm == 'door')
	{
		for ( var i = 0; i < door.length; i++ ){ if(door[i].userData.id == id){ return door[i]; } }
	}
	else if(cdm == 'room')
	{
		for ( var i = 0; i < room.length; i++ ){ if(room[i].userData.id == id){ return room[i]; } }
	}
	else if(cdm == 'obj')
	{
		for ( var i = 0; i < obj.length; i++ ){ if(obj[i].userData.id == id){ return obj[i]; } }
	}
	
	return null;
}



animate();
renderCamera();



document.body.addEventListener('contextmenu', function(event) { event.preventDefault() });
document.body.addEventListener( 'mousedown', onDocumentMouseDown, false );
document.body.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.body.addEventListener( 'mouseup', onDocumentMouseUp, false );


document.body.addEventListener( 'touchstart', onDocumentMouseDown, false );
document.body.addEventListener( 'touchmove', onDocumentMouseMove, false );
document.body.addEventListener( 'touchend', onDocumentMouseUp, false );

document.addEventListener('DOMMouseScroll', mousewheel, false);
document.addEventListener('mousewheel', mousewheel, false);	


document.body.addEventListener("keydown", function (e) 
{ 
	if(clickO.keys[e.keyCode]) return;
	
	if(infProject.activeInput) 
	{ 
		if(e.keyCode == 13)
		{ 
			
			
			if(infProject.activeInput == 'input-height') { changeHeightWall(); }
			//if(infProject.activeInput == 'input-width') { inputWidthOneWall({wall:obj_line[0], width:{value:7, unit:'cm'}, offset:'wallRedBlueArrow'}) } 
			if(infProject.activeInput == 'input-width') { changeWidthWall( $('[data-action="input-width"]').val() ); }
			if(infProject.activeInput == 'wall_1') { inputChangeWall_1({}); }	 		
			if(infProject.activeInput == 'wd_1') { inputWidthHeightWD(clickO.last_obj); }
			if(infProject.activeInput == 'size-grid-tube-xy-1')
			{
				updateGrid({size : $('[nameid="size-grid-tube-xy-1"]').val()});
			}
			if(infProject.activeInput == 'size_wall_width_1') 
			{ 
				var width = $('[nameid="size_wall_width_1"]').val();
				
				inputWidthOneWall({wall:clickO.last_obj, width:{value: width}, offset:'wallRedBlueArrow'}); 
			}
			else if(infProject.activeInput == 'dp_inf_1_proj')
			{
				inputLoadProject();
			}				
		}		
		 
		return; 
	}


	if(e.keyCode == 46) { detectDeleteObj(); }
	
	if(clickO.keys[18] && e.keyCode == 90) { sneneExporter() }		// alt + z
	if(clickO.keys[18] && e.keyCode == 72) { getConsoleRendererInfo(); }		// alt + h
	if(clickO.keys[18] && e.keyCode == 77) { inputLoadProject(); }				// alt + m
	if(clickO.keys[18] && e.keyCode == 84) { saveFile({json: true}); }			// alt + t
	if(clickO.keys[18] && e.keyCode == 86) {  }
	if(clickO.keys[18] && e.keyCode == 86) {  }  		// alt + v
} );

document.body.addEventListener("keydown", function (e) { clickO.keys[e.keyCode] = true; });
document.body.addEventListener("keyup", function (e) { clickO.keys[e.keyCode] = false; });


function sneneExporter()
{ 

			var exporter = new THREE.STLExporter();
			
				var result = exporter.parse( scene, { binary: true } );
				saveArrayBuffer( result, 'box.stl' );
				
			function saveArrayBuffer( buffer, filename ) {
				save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
			}

			function save( blob, filename ) {
			var link = document.createElement( 'a' );
			link.style.display = 'none';
			document.body.appendChild( link );				
				
				link.href = URL.createObjectURL( blob );
				link.download = filename;
				link.click();
			}			
	
}


// загрзука проекта из базы через input
function inputLoadProject()
{
	var visible = $('[nameid="dp_inf_1"]').is(":visible");
	
	$('[nameid="dp_inf_1"]').toggle();
	
	if(visible)
	{
		var num = Number($('[nameid="dp_inf_1_proj"]').val());
		
		loadFile({id: num});
		
		
	}
}



// проверяем правильность ввода числа (вводим число в своих единицах, отдаем в метрах)
function checkNumberInput(cdm)
{
	var value = cdm.value;
	
	if((/,/i).test( value )) { value = value.replace(",", "."); }
	
	if(!isNumeric(value)) return null; 
	
	value = Number(value);
	
	if(cdm.abs)
	{
		value = Math.abs(value);
	}
	
	if(cdm.int)
	{ 
		value = Math.round(value);  
	}	
	
	if(cdm.unit)
	{
		if(cdm.unit == 0.01) { value /= 100; } // см
		else if(cdm.unit == 0.001) { value /= 1000; } // мм
	}		

	if(cdm.limit)
	{
		if(cdm.limit.max < value) { value = cdm.limit.max; }
		if(cdm.limit.min > value) { value = cdm.limit.min; }
	}

	return {num: value};	
}






var docReady = false;

$(document).ready(function () 
{ 
	docReady = true; 
	
	if(infProject.scene.load != '') { loadStartForm({form: infProject.scene.load}); }

	if(infProject.settings.camera.type == '3d') { changeCamera(camera3D); }
	if(infProject.settings.camera.type == 'front') { changeCamera(cameraWall); }
		 
	 
	loadFile({json: true}); 
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(1, 1, 0)});
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(0, 1, 0)});
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(1, 1, 1), rot: new THREE.Vector3(0, 1, 0)});
	
	//loadObjServer({lotid: 8, pos: new THREE.Vector3(1, 1, 0), rot: new THREE.Vector3(0, 0, 0)}); 
	
	if(1==2)
	{
		var loader = new THREE.FBXLoader();
		loader.load( infProject.path+'export/rad_al_secziy_500_.fbx', function ( objects ) 
		{ 
			
			for ( var i = 0; i < objects.children.length; i++ )
			{
				var obj = objects.children[i];
				obj.position.set(i*0.3,0,0);

				obj.userData.tag = 'obj';
				obj.userData.id = countId; countId++;
				obj.userData.obj3D = {};
				obj.userData.obj3D.lotid = 1; 
				infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;
								
			
				obj.traverse( function ( child ) {
					if ( child.isMesh ) 
					{ 
						child.castShadow = true;
						child.receiveShadow = true;
					}
				} );
				scene.add( obj );
				
				if(i==0 && 1==2)
				{
					var txt = obj.toJSON();
					//
					var csv = JSON.stringify( txt );	
					var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);	
					
					var link = document.createElement('a');
					document.body.appendChild(link);
					link.href = csvData;
					link.target = '_blank';
					link.download = 'filename.json';
					link.click();			
				}				
				
			}
		});
		
	}
		
		
	if(1==2)
	{
		new THREE.ObjectLoader().load
		(
			infProject.path+'export/filename.json',
			
			function ( obj )
			{
				infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;
				
				//obj.rotation.set(0,0,0);

				scene.add( obj );		
			}
		);	
		
	}
	
	
	if(1==2)	
	{
		
		var loader = new THREE.FBXLoader();
		loader.load( infProject.path+'export/kran3.bin', function ( objects ) 
		{ 
			
			var obj = objects.children[0];
			obj.position.set(3,0,0);

			obj.userData.tag = 'obj';
			obj.userData.id = countId; countId++;
			obj.userData.obj3D = {};
			obj.userData.obj3D.lotid = 1; 
			infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;

			scene.add( obj );
		});		
		
		
		var oReq = new XMLHttpRequest();
		oReq.open("POST", infProject.path+'export/kran3.bin', true);
		oReq.onload = function (oEvent) 
		{
			

			var obj = new THREE.FBXLoader().parse(oReq.response)
			scene.add( obj ); 
		};
		oReq.send();						
		
	}	



	
});






















$(document).ready(function(){

$('[data-action="top_panel_1"]').on('mousedown wheel DOMMouseScroll mousewheel mousemove touchstart touchend touchmove', function (e) { e.stopPropagation(); });
$('[ui_1=""]').on('mousedown wheel DOMMouseScroll mousewheel mousemove touchstart touchend touchmove', function (e) { e.stopPropagation(); });
		
$('[data-action="top_panel_1"]').mousedown(function () { clickInterface(); });
$('[data-action="left_panel_1"]').mousedown(function () { clickInterface(); });


// переключаем разделы
//$('[nameId="butt_main_menu"]').mousedown(function () { $('[nameId="background_main_menu"]').css({"display":"block"}); });
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





$('[infcam]').on('mousedown', function(e) 
{  
	var value = $(this).attr('infcam');
	var txt = (value == '3D') ? '2D' : '3D';
	$(this).text(txt);
	$(this).attr({"infcam": txt});	
	
	clickInterface({button: value});
}); 
 

$('[nameId="color_tube_1_default"]').on('mousedown', function(e) 
{  
	$('[nameId="bb_menu_tube_menu_1"]').hide();
	$('[nameId="bb_menu_tube_menu_2"]').show();
	
	return false; 
});


  
 
	

$('[nameId="showHideWall_1"]').on('mousedown', function(e) { showHideWallHeight_1(); });

	
$('[nameId="select_pivot"]').mousedown(function () { switchPivotGizmo({mode:'pivot'}); });
$('[nameId="select_gizmo"]').mousedown(function () { switchPivotGizmo({mode:'gizmo'}); });

$('[nameId="obj_rotate_reset"]').mousedown(function () { objRotateReset(); });	
$('[nameId="button_copy_obj"]').mousedown(function () { copyObj(); });
$('[nameId="button_delete_obj"]').mousedown(function () { deleteObjectPop(clickO.last_obj); });


$('[data-action="wall"]').mousedown(function () { clickInterface({button:'point_1'}); });
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
	}

	infProject.ui.right_menu.active = name;
}




















// создаем Pivot
function createPivot()
{
	var pivot = new THREE.Object3D();
	pivot.userData.pivot = {};
	pivot.userData.pivot.active = { axis: '', startPos: new THREE.Vector3(), dir: new THREE.Vector3(), qt: new THREE.Quaternion() };
	pivot.userData.pivot.obj = null;
	
	var param = [];
	param[0] = {axis: 'x', size_1: new THREE.Vector3(0.6, 0.1, 0.1), size_2: new THREE.Vector3(0.6, 0.2, 0.2), rot: new THREE.Vector3(0, 0, 0), color: 'rgb(247, 72, 72)', opacity: 0};
	param[1] = {axis: 'y', size_1: new THREE.Vector3(0.6, 0.1, 0.1), size_2: new THREE.Vector3(0.6, 0.2, 0.2), rot: new THREE.Vector3(0, 0, Math.PI/2), color: 'rgb(17, 255, 0)', opacity: 0};
	param[2] = {axis: 'z', size_1: new THREE.Vector3(0.6, 0.1, 0.1), size_2: new THREE.Vector3(0.6, 0.2, 0.2), rot: new THREE.Vector3(0, Math.PI/2, 0), color: 'rgb(72, 116, 247)', opacity: 0};
	param[3] = {axis: 'xz', size_1: new THREE.Vector3(0.3, 0.001, 0.3), pos: new THREE.Vector3(0.01, 0.0, -0.16), color: 'rgb(194, 194, 194)', opacity: 0.4};
	param[4] = {axis: 'center', size_1: new THREE.Vector3(0.03, 0.03, 0.03), pos: new THREE.Vector3(-0.015, 0.0, 0.0), color: 'rgb(102, 102, 102)', opacity: 1};
	
	
	for ( var i = 0; i < param.length; i++ )
	{
		var geometry = createGeometryPivot(param[i].size_1.x, param[i].size_1.y, param[i].size_1.z);
		
		var obj = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({ color: param[i].color, transparent: true, opacity: param[i].opacity, depthTest: false }) );
		obj.userData.tag = 'pivot';
		obj.userData.axis = param[i].axis;	
		obj.renderOrder = 2;
		
		if(param[i].pos) obj.position.set( param[i].pos.x, param[i].pos.y, param[i].pos.z );
		if(param[i].rot) obj.rotation.set( param[i].rot.x, param[i].rot.y, param[i].rot.z );
		
		pivot.add( obj );
		
		if(param[i].size_2)
		{
			var axis = new THREE.Mesh( createGeometryPivot(0.6, 0.02, 0.02), new THREE.MeshPhongMaterial({ color: param[i].color, depthTest: false, transparent: true, lightMap: lightMap_1 }) );	
			axis.renderOrder = 2;
			//axis.rotation.set( arr[i][1].x, arr[i][1].y, arr[i][1].z );		
			obj.add( axis );					
		}
	}	
		
	pivot.add( createCone({axis: 'z', pos: new THREE.Vector3(0,0,-0.6), rot: new THREE.Vector3(-Math.PI/2,0,0), color: 0x0000ff}) );
	pivot.add( createCone({axis: 'x', pos: new THREE.Vector3(0.6,0,0), rot: new THREE.Vector3(0,0,-Math.PI/2), color: 0xff0000}) );
	pivot.add( createCone({axis: 'y', pos: new THREE.Vector3(0,0.6,0), rot: new THREE.Vector3(0,0,0), color: 0x00ff00}) );
	
	scene.add( pivot );

	//pivot.rotation.set(0.2, 0.5, 0);
	pivot.visible = false;
	
	return pivot;
}



function createGeometryPivot(x, y, z)
{
	var geometry = new THREE.Geometry();
	y /= 2;
	z /= 2;
	var vertices = [
				new THREE.Vector3(0,-y,z),
				new THREE.Vector3(0,y,z),
				new THREE.Vector3(x,y,z),
				new THREE.Vector3(x,-y,z),
				new THREE.Vector3(x,-y,-z),
				new THREE.Vector3(x,y,-z),
				new THREE.Vector3(0,y,-z),
				new THREE.Vector3(0,-y,-z),
			];	
			
	var faces = [
				new THREE.Face3(0,3,2),
				new THREE.Face3(2,1,0),
				new THREE.Face3(4,7,6),
				new THREE.Face3(6,5,4),				
				new THREE.Face3(0,1,6),
				new THREE.Face3(6,7,0),					
				new THREE.Face3(1,2,5),
				new THREE.Face3(5,6,1),				
				new THREE.Face3(2,3,4),
				new THREE.Face3(4,5,2),				
				new THREE.Face3(3,0,7),
				new THREE.Face3(7,4,3),
			];
	
	var uvs1 = [
				new THREE.Vector2(0,0),
				new THREE.Vector2(1,0),
				new THREE.Vector2(1,1),
			];
	var uvs2 = [
				new THREE.Vector2(1,1),
				new THREE.Vector2(0,1),
				new THREE.Vector2(0,0),
			];	

			
	geometry.vertices = vertices;
	geometry.faces = faces;
	geometry.faceVertexUvs[0] = [uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2, uvs1, uvs2];
	geometry.computeFaceNormals();	
	geometry.uvsNeedUpdate = true;		
	
	return geometry;
}


// создаем конусы для Pivot
function createCone(cdm)
{	
	var n = 0;
	var v = [];
	var circle = infProject.geometry.circle;
	
	for ( var i = 0; i < circle.length; i++ )
	{
		v[n] = new THREE.Vector3().addScaledVector( circle[i].clone().normalize(), 0.06 );
		v[n].y = 0;		
		n++;		
		
		v[n] = new THREE.Vector3();
		v[n].y = 0;
		n++;
		
		v[n] = new THREE.Vector3().addScaledVector( circle[i].clone().normalize(), 0.003 );
		v[n].y = 0.25;
		n++;	
		
		v[n] = new THREE.Vector3();
		v[n].y = 0.25;
		n++;		
	}	

	
	var obj = new THREE.Mesh( createGeometryCircle(v), new THREE.MeshPhongMaterial( { color : cdm.color, depthTest: false, transparent: true, lightMap: lightMap_1 } ) ); 
	obj.userData.tag = 'pivot';
	obj.userData.axis = cdm.axis;
	obj.renderOrder = 2;
	obj.position.copy(cdm.pos);
	obj.rotation.set(cdm.rot.x, cdm.rot.y, cdm.rot.z);
	//obj.visible = false;	
	scene.add( obj );
	
	return obj;
}


// кликнули на pivot
function clickPivot( intersect )
{
	var obj = clickO.move = intersect.object;  
	
	var pivot = infProject.tools.pivot;
	
	var pos = pivot.position.clone();
	
	pivot.userData.pivot.active.startPos = pos;
	
	clickO.offset = new THREE.Vector3().subVectors( pos, intersect.point );
	
	var axis = obj.userData.axis;
	pivot.userData.pivot.active.axis = axis;	
		
	
	if(axis == 'x')
	{ 
		var dir = new THREE.Vector3();
		var dir = pivot.getWorldDirection(dir); 		
		pivot.userData.pivot.active.dir = new THREE.Vector3(-dir.z, 0, dir.x).normalize();	
		pivot.userData.pivot.active.qt = quaternionDirection( pivot.userData.pivot.active.dir ); 	
	}
	else if(axis == 'z')
	{ 
		var dir = new THREE.Vector3();
		pivot.userData.pivot.active.dir = pivot.getWorldDirection(dir); 
		pivot.userData.pivot.active.qt = quaternionDirection( pivot.userData.pivot.active.dir ); 	
	}
	else if(axis == 'y')
	{ 
		//planeMath.rotation.set( 0, 0, 0 ); 
		
		pivot.updateMatrixWorld();
		var dir = pivot.getWorldDirection(new THREE.Vector3());	   		
		var dir = new THREE.Vector3(-dir.z, 0, dir.x).normalize().cross( dir )
		
		pivot.userData.pivot.active.dir = dir;  
		pivot.userData.pivot.active.qt = quaternionDirection( pivot.userData.pivot.active.dir );	
	}	
	
	
	if(axis == 'xz' || axis == 'center')
	{ 
		planeMath.rotation.set( Math.PI/2, 0, 0 ); 
	}		 
	else
	{
		planeMath.quaternion.copy( pivot.userData.pivot.active.qt ); 
		planeMath.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0)));			
	}
	
	planeMath.position.copy( intersect.point );
} 





function movePivot( event )
{	
	var intersects = rayIntersect( event, planeMath, 'one' ); 
	
	if(intersects.length == 0) return;
	
	var pivot = infProject.tools.pivot;
	var obj = pivot.userData.pivot.obj;
	var pos = new THREE.Vector3().addVectors( intersects[ 0 ].point, clickO.offset );

	if(pivot.userData.pivot.active.axis == 'xz')
	{
		
	}		
	else
	{
		var subV = new THREE.Vector3().subVectors( pos, pivot.userData.pivot.active.startPos );
		var locD = localTransformPoint(subV, pivot.userData.pivot.active.qt);						
		
		var v1 = new THREE.Vector3().addScaledVector( pivot.userData.pivot.active.dir, locD.z );
		pos = new THREE.Vector3().addVectors( pivot.userData.pivot.active.startPos, v1 );			
	}
	
	 
	
	
	var pos2 = new THREE.Vector3().subVectors( pos, pivot.position );
	pivot.position.add( pos2 );
	
	
	obj.position.add( pos2 ); 
}



// масштаб Pivot/Gizmo
function setScalePivotGizmo()
{
	var pivot = infProject.tools.pivot;
	var gizmo = infProject.tools.gizmo;
	
	var pVis = false;
	var gVis = false;

	
	if(pivot.visible) { pVis = true; }
	if(gizmo.visible) { gVis = true; }	
	if(!pVis && !gVis) { return; }
	
	var obj = null;
	
	if(pVis) obj = pivot.userData.pivot.obj;
	if(gVis) obj = gizmo.userData.gizmo.obj;
	if(!obj) return;
	
	if(camera == cameraTop)
	{		
		var scale = 1/camera.zoom+0.5;	
		
		if(pVis) pivot.scale.set( scale,scale,scale );
		if(gVis) gizmo.scale.set( scale,scale,scale );
	}
	else
	{
		var dist = camera.position.distanceTo(obj.position); 					
		var scale = dist/6;	
		
		if(pVis) pivot.scale.set( scale,scale,scale );
		if(gVis) gizmo.scale.set( scale,scale,scale );		
	}
}





// кликнули на 3D объект в 2D режиме, подготавляем к перемещению
function clickObject2D( obj, intersect )
{	
	var obj = clickO.move = intersect.object;  
	
	clickO.offset = new THREE.Vector3().subVectors( obj.position, intersect.point );	
	
	planeMath.position.copy( intersect.point );
	planeMath.rotation.set( Math.PI/2, 0, 0 );
}



// перемещение по 2D плоскости 
function moveObjectPop( event )
{	
	var intersects = rayIntersect( event, planeMath, 'one' ); 
	
	if(intersects.length == 0) return;
	
	var obj = clickO.move;
	
	if(!clickO.actMove)
	{
		clickO.actMove = true;
	}		
	
	var pos = new THREE.Vector3().addVectors( intersects[ 0 ].point, clickO.offset );	
	
	var pos2 = new THREE.Vector3().subVectors( pos, obj.position );
	obj.position.add( pos2 );	
}




function clickMouseUpObject(obj)
{
	if(clickO.actMove)
	{		
		
	}	
}





// активируем 3D объект или разъем, ставим pivot/gizmo
function clickObject3D( obj, cdm )
{
	if(!cdm) { cdm = {}; }		
	
	obj.updateMatrixWorld();
	var pos = obj.localToWorld( obj.geometry.boundingSphere.center.clone() );			 
	
	
	// Quaternion
	if(1==2)	// глобальный gizmo
	{
		var qt = new THREE.Quaternion();
	}
	else		// локальный gizmo, относительно centerObj
	{					
		var qt = obj.quaternion.clone();	 		
	}		
	
	
	
	if(infProject.settings.active.pg == 'pivot')
	{
		var pivot = infProject.tools.pivot;	
		pivot.visible = true;	
		pivot.userData.pivot.obj = obj;
		pivot.position.copy(pos);
		pivot.quaternion.copy(qt);
		
		if(camera == cameraTop)
		{
			pivot.children[1].visible = false;
			pivot.children[7].visible = false;
		}
		else
		{
			pivot.children[1].visible = true;
			pivot.children[7].visible = true;
		}
	}
	
	if(infProject.settings.active.pg == 'gizmo')
	{
		var gizmo = infProject.tools.gizmo;
					
		gizmo.position.copy( pos );
		
		gizmo.visible = true;
		gizmo.userData.gizmo.obj = obj;
		
		if(camera == cameraTop)
		{
			gizmo.children[1].visible = false;
			gizmo.children[2].visible = false;
			
			//gizmo.rotation.set(0,0,0);
		}
		else
		{
			gizmo.children[1].visible = true;
			gizmo.children[2].visible = true;			
		}

		gizmo.quaternion.copy( qt );
		
		upMenuRotateObjPop(obj);
		
		clippingGizmo360(obj); 		
	}		
	
	setScalePivotGizmo();
}





	

// удаление объекта
function deleteObjectPop(obj)
{ 
	if(obj.userData.tag != 'obj') return;
	
	clickO = resetPop.clickO(); 
	
	hidePivotGizmo(obj);
	
	var arr = [];
	
	arr[0] = obj;
	
	for(var i = 0; i < arr.length; i++)
	{	
		deleteValueFromArrya({arr : infProject.scene.array.obj, o : arr[i]});
		updateListTubeUI_1({uuid: arr[i].uuid, type: 'delete'});
		disposeNode(arr[i]);
		scene.remove(arr[i]); 
	}
	
	outlineRemoveObj();
}



// скрываем Pivot/Gizmo
function hidePivotGizmo(obj)
{
	if(!obj) return;
	if(!obj.userData.tag) return;	
	//if(obj.userData.tag != 'obj') return;
	
	var pivot = infProject.tools.pivot;
	var gizmo = infProject.tools.gizmo;
				
	
	if(clickO.rayhit)
	{
		if(pivot.userData.pivot.obj == clickO.rayhit.object) return;		
		if(clickO.rayhit.object.userData.tag == 'pivot') return;
		
		if(gizmo.userData.gizmo.obj == clickO.rayhit.object) return;		
		if(clickO.rayhit.object.userData.tag == 'gizmo') return;
	}	
	
	
	
	pivot.visible = false;
	gizmo.visible = false;
	
	pivot.userData.pivot.obj = null;
	gizmo.userData.gizmo.obj = null;

	
	//clickO.obj = null;  
	clickO.last_obj = null;
	
	$('[nameId="wrap_object_1"]').hide();
	
	
	outlineRemoveObj();
}



// при выделении объекта, показываем меню 
function showObjUI()
{	
	$('[nameId="wrap_object_1"]').show();
}



// переключаем Pivot/Gizmo/joint
function switchPivotGizmo(cdm)
{
	var obj = getObjFromPivotGizmo();
	
	if(!obj) return;			
	
	infProject.settings.active.pg = cdm.mode;
	
	infProject.tools.pivot.visible = false;
	infProject.tools.gizmo.visible = false;
	
	if(infProject.settings.active.pg == 'pivot'){ infProject.tools.pivot.visible = true; }	
	if(infProject.settings.active.pg == 'gizmo'){ infProject.tools.gizmo.visible = true; }		

	infProject.tools.pivot.userData.pivot.obj = null;
	infProject.tools.gizmo.userData.gizmo.obj = null;

	clickObject3D( obj ); 
}


// получаем активный объект
function getObjFromPivotGizmo(cdm)
{
	var obj = null;
	var pivot = infProject.tools.pivot;
	var gizmo = infProject.tools.gizmo;	
	
	if(infProject.settings.active.pg == 'pivot'){ obj = pivot.userData.pivot.obj; }	
	if(infProject.settings.active.pg == 'gizmo'){ obj = gizmo.userData.gizmo.obj; }
	
	return obj;	
}





// копируем объект или группу
function copyObj(cdm) 
{
	var obj = getObjFromPivotGizmo();
	
	if(!obj) return;	
		
	var arr = [obj];		
	var arr2 = [];
	
	for(var i = 0; i < arr.length; i++)
	{ 
		var clone = arr2[arr2.length] = arr[i].clone();

		clone.userData.id = countId; countId++;
		//clone.position.add(pos);		// смещение к нулю
		infProject.scene.array.obj[infProject.scene.array.obj.length] = clone; 
		scene.add( clone );	

		updateListTubeUI_1({o: clone, type: 'add'});	// добавляем объект в UI список материалов 		
	}	
	 
	
	hidePivotGizmo(obj);
	
	clickObject3D( arr2[0], {click_obj: true, menu_1: true, group: true, outline: true} );
}



// сбрасываем rotation 
function objRotateReset(cdm)
{
	var obj = getObjFromPivotGizmo();
	
	if(!obj) return;


	var obj_1 = obj;		
	var diff_2 = obj_1.quaternion.clone().inverse();					// разница между Quaternions
	var arr_2 = [obj_1];
	
	
	// поворачиваем объекты в нужном направлении 
	for(var i = 0; i < arr_2.length; i++)
	{
		arr_2[i].quaternion.premultiply(diff_2);		// diff разницу умнажаем, чтобы получить то же угол	
		arr_2[i].updateMatrixWorld();		
	}
	
	
	var centerObj = obj_1.position.clone();
	

	// вращаем position объектов, относительно точки-соединителя
	for(var i = 0; i < arr_2.length; i++)
	{
		arr_2[i].position.sub(centerObj);
		arr_2[i].position.applyQuaternion(diff_2); 	
		arr_2[i].position.add(centerObj);
	}
	

	
	if(infProject.settings.active.pg == 'pivot'){ var tools = infProject.tools.pivot; }	
	if(infProject.settings.active.pg == 'gizmo'){ var tools = infProject.tools.gizmo; }	
}






 

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
		group.position.copy(objPop.position);		
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
	
	
	// объект
	obj.updateMatrixWorld();
	gizmo.userData.gizmo.active.startPos = obj.localToWorld( obj.geometry.boundingSphere.center.clone() );			

	
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
		setPlaneQ(obj, dr, rotY, false);
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
		obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), rotY - gizmo.userData.gizmo.active.rotY);		 
	}
	else 
	{ 		
		rotateO({obj: [obj], dr: dr, rotY: rotY, centerO: obj});		 
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
		gizmo.rotation.copy( obj.rotation );		 
	}
	
	
	upMenuRotateObjPop(obj);
}




// обновляем в меню rotate
function upMenuRotateObjPop(obj) 
{				
	$('[nameId="object_rotate_X"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.x) ) );
	$('[nameId="object_rotate_Y"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.y) ) );
	$('[nameId="object_rotate_Z"]').val( Math.round( THREE.Math.radToDeg(obj.rotation.z) ) );	
}





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
	}
	
	arr[3] =
	{
		lotid : 4,
		url : infProject.path+'import/vm_door_1.fbx', 
		name : 'дверь',
		planeMath : 1.0,
		material : true,
	}	
	
	
	
	for(var i = 0; i < arr.length; i++)
	{
		//arr[i].lotid = i+1;
	}
	
	
	return arr;
}


// получаем параметры объекта из базы
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
	
	return null;
}



function loadObjServer(cdm)
{ 
	// cdm - информация, которая пришла из вне
	// inf - статическая инфа из базы
	
	
	if(!cdm.lotid) return;
	
	var lotid = cdm.lotid;
	
	var inf = getInfoObj({lotid: lotid});

	if(!inf) return;	// объект не существует в API
	
	var obj = getObjFromBase({lotid: lotid});
	
	if(obj)
	{ 
		inf.obj = obj.clone();
		
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
			return null;
		}
	}

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
	
	base[base.length] = {lotid: lotid, obj: obj.clone()}; 
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
	
	if(cdm.rot){ obj.rotation.set(cdm.rot.x, cdm.rot.y, cdm.rot.z); }					
	
	
	if(cdm.id){ obj.userData.id = cdm.id; }
	else { obj.userData.id = countId; countId++; }
	
	obj.userData.tag = 'obj';
	obj.userData.obj3D = {};
	obj.userData.obj3D.lotid = cdm.lotid;
	obj.userData.obj3D.nameRus = inf.name;

	if(!inf.material)
	{
		obj.material = new THREE.MeshLambertMaterial( {color: 0xffff00, transparent: true, opacity: 0.5 } );
		obj.material.visible = false;		
	}			
	
	infProject.scene.array.obj[infProject.scene.array.obj.length] = obj;

	scene.add( obj );
	 
	updateListTubeUI_1({o: obj, type: 'add'});	// добавляем объект в UI список материалов 
	
	if(cdm.cursor) { clickO.move = obj; } 
	
	renderCamera();

}









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








