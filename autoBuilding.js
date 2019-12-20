

getAutoBuildingJson();

function getAutoBuildingJson()
{
	$.ajax
	({
		url: infProject.path+'auto_building/room.json',
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
	var room = cdm.json.rooms;
	
	console.log('AutoBuildingJson', cdm.json.rooms);
	
	for( var i = 0; i < room.length; i++ )
	{
		var w = room[i].walls;
		
		for( var i2 = 0; i2 < w.length; i2++ )
		{
			var x = w[i2].inner_part.point_1.x/100;
			var y = w[i2].inner_part.point_1.y/100;
			
			console.log('x: '+ x, 'y: '+ y);
		}
	}
}



