

var wallVisible = [];


// собираем инфу, какие стены будем скрывать в 3D режиме
// опрееляем стена относится ко скольки зонам (0, 1, 2) 
// если 1 зона, то стена внешняя
function getInfoRenderWall()
{
	wallVisible = [];
	for ( var i = 0; i < obj_line.length; i++ )
	{	
		var room = detectCommonZone_1( obj_line[i] );
		if(room.length == 1) 
		{ 	
			var side = 0;
			for ( var i2 = 0; i2 < room[0].w.length; i2++ ) { if(room[0].w[i2] == obj_line[i]) { side = room[0].s[i2]; break; } }
			//var pos = new THREE.Vector3().subVectors( obj_line[i].p[1].position, obj_line[i].p[0].position ).divideScalar( 2 ).add(obj_line[i].p[0].position);

			if(side == 0) { var n1 = 0; var n2 = 1; }
			else { var n1 = 1; var n2 = 0; }
			
			var x1 = obj_line[i].userData.wall.p[n2].position.z - obj_line[i].userData.wall.p[n1].position.z;
			var z1 = obj_line[i].userData.wall.p[n1].position.x - obj_line[i].userData.wall.p[n2].position.x;	
			var dir = new THREE.Vector3(x1, 0, z1).normalize();						// перпендикуляр стены	
			
			wallVisible[wallVisible.length] = { wall : obj_line[i], normal : dir };  
		}
	}	
}



// скрываем внешние стены, когда она перекрывает обзор
function wallAfterRender_2()
{ //return; 

	for ( var i = 0; i < wallVisible.length; i++ )
	{
		var wall = wallVisible[ i ].wall;
		//var pos = new THREE.Vector3().subVectors( wall.p[1].position, wall.p[0].position ).divideScalar( 2 ).add(wall.p[0].position);
		
		var res = camera.getWorldDirection(new THREE.Vector3()).dot( wallVisible[ i ].normal.clone() );
		
		if ( res > 0.5 )  
		{ 	
			wall.renderOrder = Math.abs(res);
			setTransparentMat({obj: wall, value: 1 - Math.abs(res)});
			
			for ( var i2 = 0; i2 < wall.userData.wall.arrO.length; i2++ ) 
			{
				wall.userData.wall.arrO[i2].visible = false;				
			}
		}
		else
		{
			wall.renderOrder = 0;
			setTransparentMat({obj: wall, value: 1});
			
			for ( var i2 = 0; i2 < wall.userData.wall.arrO.length; i2++ ) 
			{
				wall.userData.wall.arrO[i2].visible = true;
			}
		}
	}
}


// показываем стены, которые были спрятаны
function showAllWallRender()
{		
	for ( var i = 0; i < wallVisible.length; i++ ) 
	{ 
		var wall = wallVisible[i].wall;

		wall.renderOrder = 0;
		setTransparentMat({obj: wall, value: 1});
		
		for ( var i2 = 0; i2 < wall.userData.wall.arrO.length; i2++ ) 
		{
			wall.userData.wall.arrO[i2].visible = true;
		}		
	}
}


function setTransparentMat(cdm)
{
	var obj = cdm.obj;
	
	if(!Array.isArray(obj.material)) { var arrM = [obj.material]; }
	else { var arrM = obj.material; }
	
	for( var i = 0; i < arrM.length; i++ ) 
	{
		// устанавливаем заданное значение
		if(cdm.value)
		{
			var value = (arrM[i].userData.opacity < cdm.value) ? arrM[i].userData.opacity : cdm.value;
			
			arrM[i].opacity = value;
		}
		
		// восстанавливаем значение
		if(cdm.default)
		{
			arrM[i].opacity = arrM[i].userData.opacity;
		}		
	}
	
}






