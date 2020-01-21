

//getAutoBuildingJson();

function getAutoBuildingJson()
{
	$.ajax
	({
		url: infProject.path+'auto_building/room2.json',
		type: 'POST',
		dataType: 'json',
		success: function(json)
		{ 
			readAutoBuildingJson({json: json});
		},
	});	
}



function readAutoBuildingJson(cdm)
{
	var rooms = cdm.json.rooms;
	
	
	var arr = [];
	var point = [];
	
	var id = 1;
	
	for( var i = 0; i < rooms.length; i++ )
	{
		var w = rooms[i].walls;
		arr[i] = {w: []};
		var p = [];
		
		for( var i2 = 0; i2 < w.length; i2++ )
		{
			var x = w[i2].inner_part.point_1.x/100 * 3;
			var z = w[i2].inner_part.point_1.y/100 * 3;
			var pos = new THREE.Vector3(x, 0, z);
			
			var copy = null;
			
			for( var i3 = 0; i3 < point.length; i3++ )
			{
				if(comparePos(pos, point[i3].pos, {kof: 0.1}))
				{
					copy = point[i3];
					break;
				}						
			}
			
			if(copy)
			{
				p[i2] = copy;
			}
			else
			{
				var n = point.length;
				point[n] = {id: id, pos: pos}; id++;
				
				p[i2] = point[n];
			}
			
		}
		
		for( var i2 = 1; i2 < p.length; i2++ )
		{
			arr[i].w[i2 - 1] = null;
			
			if(p[i2 - 1] != p[i2])
			{
				arr[i].w[i2 - 1] = {};
				arr[i].w[i2 - 1].p = [p[i2 - 1], p[i2]];
			}						
		}
	}
	
	
	console.log('AutoBuildingJson');
	console.log(arr.length, arr[0].w.length, arr);
	
	
	for( var i = 0; i < arr.length; i++ )
	{
		for( var i2 = 0; i2 < arr[i].w.length; i2++ )
		{
			if(!arr[i].w[i2]) continue;
			
			var point1 = findObjFromId( 'point', arr[i].w[i2].p[0].id );
			var point2 = findObjFromId( 'point', arr[i].w[i2].p[1].id );	
			
			if(point1 == null) { point1 = createPoint( arr[i].w[i2].p[0].pos, arr[i].w[i2].p[0].id ); }
			if(point2 == null) { point2 = createPoint( arr[i].w[i2].p[1].pos, arr[i].w[i2].p[1].id ); }	

			var obj = crtW({p: [point1, point2], width: 0.01}); 
		}
	}
	
	for ( var i = 0; i < obj_point.length; i++ ) { upLineYY_2(obj_point[i]); }
	
	upLabelPlan_1(infProject.scene.array.wall);	// размеры стен
	detectRoomZone();	// пол		
	
	centerCamera2D();
	
	renderCamera();
}



