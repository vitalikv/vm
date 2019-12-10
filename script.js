


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
var obj_point = [];
var obj_line = [];
var room = [];
var ceiling = [];
var arrWallFront = [];
var lightMap_1 = new THREE.TextureLoader().load(infProject.path+'/img/lightMap_1.png');
var texture_wd_1 = new THREE.TextureLoader().load(infProject.path+'/img/wd_1.png');

var clickO = resetPop.clickO();
infProject.project = null;
infProject.settings.active = { pg: 'pivot' };
infProject.settings.door = { width: 1, height: 2.2 };
infProject.settings.wind = { width: 1, height: 1, h1: 1.5 };
infProject.camera = { d3: { theta: 0, phi: 75, targetPos: new THREE.Vector3() } }; 
infProject.scene.array = resetPop.infProjectSceneArray(); 
infProject.scene.grid = { obj: createGrid(infProject.settings.grid), active: false, link: false, show: true };
infProject.scene.block = { key : { scroll : false } };		// блокировка действий/клавишь
infProject.scene.block.click = {wall: false, point: false, door: false, window: false, room: false, tube: false, controll_wd: false, obj: false};
infProject.scene.block.hover = {wall: false, point: false, door: false, window: false, room: false, tube: false, controll_wd: false, obj: false};
infProject.geometry = { circle : createCircleSpline() }
infProject.geometry.labelWall = createGeometryPlan(0.25 * 2, 0.125 * 2);
infProject.geometry.labelFloor = createGeometryPlan(1.0 * kof_rd, 0.25 * kof_rd);
infProject.tools = { pivot: createPivot(), gizmo: createGizmo360(), cutWall: [], point: createToolPoint(), axis: createLineAxis() } 

infProject.catalog = infoListObj();  
infProject.listColor = resetPop.listColor(); 
infProject.start = true; 

infProject.ui = {}
infProject.ui.list_wf = [];
infProject.ui.main_menu = [];
infProject.ui.right_menu = {active: ''};

console.log(infProject);



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


startPosCamera3D({radious: 15, theta: 90, phi: 35});		// стартовое положение 3D камеры
addObjInCatalogUI_1();	// каталог UI
changeRightMenuUI_1({name: 'button_wrap_plan'});	// назначаем первоначальную вкладку , которая будет включена
startRightPlaneInput({});	

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
	var axis = [];
	
	var geometry = createGeometryCube(0.5, 0.02, 0.02);		
	var v = geometry.vertices;	
	v[3].x = v[2].x = v[5].x = v[4].x = 500;
	v[0].x = v[1].x = v[6].x = v[7].x = -500;	
	
	var material = new THREE.MeshLambertMaterial( { color : 0xcccccc, transparent: true, depthTest: false, lightMap : lightMap_1 } );
	
	for(var i = 0; i < 2; i++)
	{
		axis[i] = new THREE.Mesh( geometry, material );
		axis[i].renderOrder = 2;
		axis[i].visible = false;
		scene.add( axis[i] );				
	}		
	
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
	
	
	if(infProject.settings.wall.color) 
	{  
		if(infProject.settings.wall.color.front) color[0] = infProject.settings.wall.color.front; 
		if(infProject.settings.wall.color.top) color[1] = infProject.settings.wall.color.top; 
	}	
	
	var material = new THREE.MeshPhongMaterial({ color : color[0], transparent: true, opacity: 1, lightMap : lightMap_1 });
	var materialTop = new THREE.MeshPhongMaterial( { color: color[1], transparent: true, opacity: 1, lightMap : lightMap_1 } );
	
	var materials = [ material.clone(), material.clone(), material.clone(), materialTop ];
	
	if(cdm.color)
	{
		for( var i = 0; i < cdm.color.length; i++ )
		{
			console.log(cdm.color[i]);
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
	
	//console.log(wall);
	
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

	console.log(cdm);
	if(cdm)
	{		
		deActiveSelected();	
		
		if(cdm.button == '2D')
		{  			
			changeCamera(cameraTop);
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
		console.log(e);
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
		console.log(e);
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
			console.log(infProject.activeInput);
			
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
	
	if(clickO.keys[18] && e.keyCode == 90) {  }		// alt + z
	if(clickO.keys[18] && e.keyCode == 72) { getConsoleRendererInfo(); }		// alt + h
	if(clickO.keys[18] && e.keyCode == 77) { inputLoadProject(); }				// alt + m
	if(clickO.keys[18] && e.keyCode == 84) { saveFile({json: true}); }			// alt + t
	if(clickO.keys[18] && e.keyCode == 86) { console.log(infProject); }
	if(clickO.keys[18] && e.keyCode == 86) { console.log(clickO); }  		// alt + v
} );

document.body.addEventListener("keydown", function (e) { clickO.keys[e.keyCode] = true; });
document.body.addEventListener("keyup", function (e) { clickO.keys[e.keyCode] = false; });




// загрзука проекта из базы через input
function inputLoadProject()
{
	var visible = $('[nameid="dp_inf_1"]').is(":visible");
	
	$('[nameid="dp_inf_1"]').toggle();
	
	if(visible)
	{
		var num = Number($('[nameid="dp_inf_1_proj"]').val());
		
		loadFile({id: num});
		
		console.log(num);
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
		 
	 
	loadFile({json: true});  
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(1, 1, 0)});
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(0, 1, 0)});
	//loadObjServer({lotid: 6, pos: new THREE.Vector3(1, 1, 1), rot: new THREE.Vector3(0, 1, 0)});
	
});






















