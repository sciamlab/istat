/**
 * SciamLab SmartLab Visualization
 * v0.5b
 */

//TRANSLATE_0 z-axis
//TRANSLATE_1 x-axis
//SCALE 1:5000

var mouse = { x: 0, y: 0 }

var appConstants  = {
		TRANSLATE_0 : -1200,
		TRANSLATE_1 : 3700,
		SCALE : 5000
};
var WIDTH = window.innerWidth, HEIGHT = window.innerHeight-150;

var geons = {};
var ISTAT_PARAM = {
		Anno: 2001
};

//this file contains all the geo related objects and functions
geons.geoConfig = function() {
	this.TRANSLATE_0 = appConstants.TRANSLATE_0;
	this.TRANSLATE_1 = appConstants.TRANSLATE_1;
	this.SCALE = appConstants.SCALE;

	this.mercator = d3.geo.mercator();
	this.path = d3.geo.path().projection(this.mercator);

	this.setupGeo = function() {
		var translate = this.mercator.translate();
		translate[0] = this.TRANSLATE_0;
		translate[1] = this.TRANSLATE_1;

		this.mercator.translate(translate);
		this.mercator.scale(this.SCALE);
	}
};

//geoConfig contains the configuration for the geo functions
geo = new geons.geoConfig();



//check if WebGL is not available 
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

//get the correct geo for d3s
geo.setupGeo();
var translate = geo.mercator.translate();
var scene;
var controls;
var renderer;
var camera;
projector = {};
var keyboard = new THREEx.KeyboardState();
var regions = new THREE.Object3D();
regions.name = 'regions';
var rotSpeed = .02;

var urlParams;
(window.onpopstate = function () {
	var match,
	pl     = /\+/g,  // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g,
	decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	query  = window.location.search.substring(1);

	urlParams = {};
	while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);
})();

var geojson;
var dataset;
var dataset_file;
var color_prop;
var height_prop;
var color_scaling_factor;
var height_scaling_factor;
var color_label;
var height_label;
var color_unit;
var height_unit;
var title;
var description;

function draw3DStat(geoData,statData) {
	var dataset_file = statData;
	var geo_file = geoData;

	if (dataset_file == '') dataset_file='abitanti_assunzioni.json';
	if (geo_file == '') geo_file='italy_regions_lowres.json';

	jQuery.getJSON(dataset_file, function(data, textStatus, jqXHR) {
		dataset = data;
		console.log("dataset: "+dataset);
		title = dataset.title;
		description = dataset.description;
		console.log("title: "+title);
		console.log("description: "+description);
		color_prop = dataset.color_prop;
		height_prop = dataset.height_prop;
		color_scaling_factor = dataset.color_scaling_factor;
		height_scaling_factor = dataset.height_scaling_factor;
		color_label = dataset.color_label;
		height_label = dataset.height_label;
		color_unit = dataset.color_unit;
		height_unit = dataset.height_unit;
		console.log("color_prop: "+color_prop);
		console.log("height_prop: "+height_prop);
		console.log("color_scaling_factor: "+color_scaling_factor);
		console.log("height_scaling_factor: "+height_scaling_factor);
		console.log("color_label: "+color_label);
		console.log("height_label: "+height_label);
		console.log("color_unit: "+color_unit);
		console.log("height_unit: "+height_unit);


		// get the data
		jQuery.getJSON(geo_file, function(data, textStatus, jqXHR) {

			geojson = data;
			console.log("geojson: "+geojson);
			//initScene();
			initGUI();
			addGeoObject();
			renderer.render( scene, camera );
			animate();

			// add the loaded gis object (in geojson format) to the map
			function addGeoObject() {
				// keep track of rendered objects
				var meshes = [];
				var averageValues = [];
				var totalValues = [];


				// keep track of min and max, used to color the objects
				var maxValueAverage = 0;
				var minValueAverage = -1;

				// keep track of max and min of total value
				var maxValueTotal = 0;
				var minValueTotal = -1;

				// loop on GeoJSON available features
				// and convert each into mesh and calculate values
				for (var i = 0 ; i < geojson.features.length ; i++) {
					var geoFeature = geojson.features[i]
					var feature = geo.path(geoFeature);
					// we only need to convert it to a three.js path
					var regione_id = geoFeature.properties.COD_PRO;
					var current_color; // = geoFeature.properties[color_prop];
					var current_height; // = geoFeature.properties[height_prop];
					for (var ii = 0 ; ii < dataset.data.length ; ii++) {
						if(dataset.data[ii].id_regione==regione_id){
							current_color = dataset.data[ii][color_prop];
							current_height = dataset.data[ii][height_prop];
							break;
						}
					}
					//console.log('['+regione_id+'] TERRITORIO: ' + geoFeature.properties.nome_regione + ' color_value: ' + current_color + ' height_value: ' + current_height);
					var mesh = transformSVGPathExposed(feature);
					// add to array
					meshes.push(mesh);

					// we get a property from the json object and use it
					// to determine the color later on
					var color = getRandomInt(22,6046); //parseInt(current_color*color_scaling_factor);// getRandomInt(22,6046);
					if (color > maxValueAverage) maxValueAverage = color;
					if (color < minValueAverage || minValueAverage == -1) minValueAverage = color;
					averageValues.push(color);

					// and we get the max values to determine height later on.
					var height = getRandomInt(5800,15500); //parseInt(current_height*height_scaling_factor); //getRandomInt(5800,15500);
					if (height > maxValueTotal) maxValueTotal = height;
					if (height < minValueTotal || minValueTotal == -1) minValueTotal = height;
					totalValues.push(height);
				}

				//console.log(" averageValues: " + averageValues);
				//console.log(" totalValues: " + totalValues);

				// we've got our paths now extrude them to a height and add a color
				for (var i = 0 ; i < averageValues.length ; i++) {

					// create material color based on average
					var scale = ((averageValues[i] - minValueAverage) / (maxValueAverage - minValueAverage)) * 255;
					//console.log("###SCALE:" + scale);

					var mathColor = gradient(Math.round(scale),50); //gradient5(averageValues[i]); // gradient(Math.round(scale),50);
					var material = new THREE.MeshLambertMaterial({
						color: mathColor,
						//ambient: mathColor,
						//emissive: mathColor
					});

					// create extrude based on total
					var extrude = (((totalValues[i] - minValueTotal) / (maxValueTotal - minValueTotal)) * 100 )+15;
//					OLD ONE		  var shape3d = meshes[i].extrude({amount: Math.round(extrude), bevelEnabled: false});

					var mes = meshes[i];
					//console.log("## MESH: "+mes.toSource());
					//console.log("## MESH: "+typeof mes);
					var vec1 = new THREE.Vector3( 100, extrude,-100);
					var vec2 = new THREE.Vector3( 100, 0,-100);

					var randomPoints = [];
					randomPoints.push(vec1); randomPoints.push(vec2);
					var randomSpline =  new THREE.SplineCurve3( randomPoints );


					var shape3d = mes.extrude({amount: Math.round(extrude), bevelEnabled: true, bevelThickness  : 20, bevelSize: 10, bevelSegments: 10, extrudePath: randomSpline});


					//console.log('['+i+'] - SCALE: '+scale+' MATHCOLOR:'+mathColor+' EXTRUDE: '+Math.round(extrude));

					// create a mesh based on material and extruded shape
					var toAdd = new THREE.Mesh(shape3d, material);
					toAdd.name = geojson.features[i].properties.id_regione;
					// rotate and position the elements nicely in the center
					//toAdd.rotation.x = Math.PI/2;
					//toAdd.translateX(-490);
					//toAdd.translateZ(50);
					//toAdd.translateY(extrude/2);

					//toAdd.rotation.y =0.35
					//toAdd.translateY(700);
					//toAdd.translateX(-690);
					//toAdd.translateZ(50);
					//toAdd.translateY(extrude/2);

					// add to scene
					//scene.add(toAdd);
					//camera.lookAt(shape3d)
					regions.add(toAdd);
				}

				scene.add(regions);
			}


			// simple gradient function
			function gradient(length, maxLength) {

				var i = (length * 255 / maxLength);
				var r = i;
				var g = 255-(i);
				var b = 1;

				var rgb = b | (g << 8) | (r << 16);
				return rgb;
			}

			function gradient5(val) {
				col='';
				if (val == 252) {
					col='#00e3e5'; //'#5dbbea';
				} else if (val == 275) {
					col='#009fd8';//'#1ea9e1';
				} else if (val == 294) {
					col='#005bcb';//'#0893d3';
				} else if (val == 295) {
					col='#0018bf';//'#0077c1';
				} else {
					col='#0018bf';//'#004f98';
				}
				return col;
			}


			function animate() 
			{
				requestAnimationFrame( animate );
				render();		
				update();
			}

			function update()
			{
				// delta = change in time since last call (in seconds)
				//var delta = clock.getDelta(); 

				// functionality provided by THREEx.KeyboardState.js
				if ( keyboard.pressed("p") ) { // print
					Canvas2Image.saveAsPNG(document.getElementById("canvas3d"));
				}		

				if ( keyboard.pressed("1") )
					document.getElementById('message').innerHTML = ' Have a nice day! - 1';	
				if ( keyboard.pressed("2") )
					document.getElementById('message').innerHTML = ' Have a nice day! - 2 ';	
				//document.getElementById('message').innerHTML = 'CAMERA<br>X: '+Math.round(camera.position.x)+"<br>Y: "+Math.round(camera.position.y)+"<br>Z: "+Math.round(camera.position.z);	
				controls.update();

				//stats.update();

			}

			function render() 
			{	
				renderer.render( scene, camera );
			} 

			function buildAxes( length ) {
				var axes = new THREE.Object3D();

				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X red
				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X red
				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y green
				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y gree
				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z blue
				axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z blue

				return axes;

			}

			function buildAxis( src, dst, colorHex, dashed ) {
				var geom = new THREE.Geometry(),
				mat;

				if(dashed) {
					mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
				} else {
					mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
				}

				geom.vertices.push( src.clone() );
				geom.vertices.push( dst.clone() );
				geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

				var axis = new THREE.Line( geom, mat, THREE.LinePieces );

				return axis;

			}


		});
	});
}

var CAMERA_X;
var CAMERA_Y;
var CAMERA_Z;
var INTERSECTED;
var mouse = { x: 0, y: 0 }
var hover_name;
var hover_color;
var hover_height;


function initDATGUI() {
	var gui = new dat.GUI();

	var folder2 = gui.addFolder('DATI');
	folder2.add( ISTAT_PARAM , 'Anno', 2001,2011).step(1).onChange( function( value ){ ISTAT_PARAM.anno = value; } );
	//folder2.add( CLA , 'py', -5000,5000).step(5).onChange( function( value ){ CLA.py = value; } );
	//folder2.add( CLA , 'pz', -5000,5000).step(5).onChange( function( value ){ CLA.pz = value; } );
	folder2.open();

	var folder1 = gui.addFolder('Camera Position');
	folder1.add( camera.position ,'x' ).listen();
	folder1.add( camera.position, 'y' ).listen();
	folder1.add( camera.position, 'z' ).listen();
}

function initGUI() {

	var onFrame = window.requestAnimationFrame;
	this.projector = new THREE.Projector();
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( (event.clientY-130) / (window.innerHeight-150) ) * 2 + 1;
		// console.log('X:'+mouse.x+' Y:'+mouse.y);
	}

	/*
	 * the tick() function is called for every frame
	 */
	function tick(){

		// find intersections
		var objects = this.scene.getObjectByName( "regions" ).children;
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		//console.log('X:'+mouse.x+' Y:'+mouse.y);
		this.projector.unprojectVector( vector, this.camera );
		var raycaster = new THREE.Raycaster( this.camera.position, vector.sub( this.camera.position ).normalize() );
		var intersects = raycaster.intersectObjects( objects );	
		//console.log(intersects.length);
		if ( intersects.length > 0 ) {						
			/*if(this.INTERSECTED != intersects[ 0 ].object) {
					if (this.INTERSECTED) {
						for(i = 0; i < objects.length; i++) {
							if (objects[i].name == this.INTERSECTED.name) {

							}
						}
						this.INTERSECTED = null;
					}
				}*/

			this.INTERSECTED = intersects[ 0 ].object;
			for (var i = 0 ; i < dataset.data.length ; i++) {
				var region = dataset.data[i];
				if(region.id_regione == this.INTERSECTED.name){
					this.hover_name = region.NAME_PRO;
					this.hover_color = region[color_prop];
					this.hover_height = region[height_prop];
					break;
				}
			}

			/*for(i = 0; i < objects.length; i++) {
					if (objects[i].name == this.INTERSECTED.name) {

					}
				}*/

		} else if (this.INTERSECTED) {
			/*for(i = 0; i < objects.length; i++) {
					if (objects[i].name == this.INTERSECTED.name) {

					}
				}*/
			this.INTERSECTED = null;
			this.hover_name = null;
			this.hover_color = null;
			this.hover_height = null;

		} 
		if(this.INTERSECTED) {
			//$('#dhtmltooltip').html('<b>'+this.hover_name+'</b> - '+this.height_label+': '+this.hover_height+this.height_unit+'<br />'+this.color_label+': '+this.hover_color+this.color_unit);
                        ddrivetip('<p><b>'+this.hover_name+'</b><br />'+this.height_label+': '+this.hover_height+this.height_unit+'<br />'+this.color_label+': '+this.hover_color+this.color_unit+'</p>','rgba(220,228,92,0.6)', 300);
		} else {
			hideddrivetip();
                        //$('#dhtmltooltip').html("");
		}
		onFrame(tick);
	}
	onFrame(tick);
} // end initGUI()

function onWindowResize() {

	camera.aspect = (window.innerWidth) / (window.innerHeight-150);
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight-150 );
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Set up the three.js scene. This is the most basic setup without
// any special stuff
function initScene() {
	// set the scene size (full screen)

	// set natural camera attributes
	var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.01, FAR = 100000;

	// create a WebGL renderer, camera, and a scene
	renderer = new THREE.WebGLRenderer({antialias:true, logarithmicDepthBuffer: 0.0006});   
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT,NEAR, FAR);
	scene = new THREE.Scene();

	// create axis
	//axes = buildAxes( 5000 );
	//scene.add(axes);

	// add and position the camera at a fixed position
	scene.add(camera);
	camera.position.x = 800;
	camera.position.y = 1700;
	camera.position.z = 0;
	camera.lookAt(new THREE.Vector3(0,-1000,0));

	// start the renderer, and black background
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0xffffff); //white: 0xffffff

	// add the render target to the page
	renderer.domElement.id="canvas3d";
	$("#3dcontainer").append(renderer.domElement);


	var strDataURI = renderer.domElement.toDataURL();

	// add a light at a specific position
	var pointLight = new THREE.PointLight(0xFFFFFF);
	scene.add(pointLight);
	pointLight.position.x = 5000;
	pointLight.position.y = 5000;
	pointLight.position.z = 5000;

	// add a base TRANSPARENT plane on which we'll render our map
	/// backgroup grids 
	//var plane = new THREE.Mesh(
	//	new THREE.PlaneGeometry(10000, 10000, 10, 10), 
	//	new THREE.MeshBasicMaterial({ color: 0x7f7f7f, wireframe: true }));
	//plane.rotation.x = -Math.PI/2;
	//scene.add( plane );

	//var planeGeo = new THREE.PlaneGeometry(20000, 20000, 10, 10);
	//var planeMat = new THREE.MeshLambertMaterial({color: 0xffffff}); //0xffffff
	//var plane = new THREE.Mesh(planeGeo, planeMat);

	// rotate it to correct position
	//plane.rotation.x = -Math.PI/2;
	//scene.add(plane);

	//keyboard = new THREEx.KeyboardState(renderer.domElement);

	// automated mouse OrbitControls
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	// GUI
	//initGUI();

	// DAT.GUI
	//initDATGUI();

	// manage window resize
	window.addEventListener( 'resize', onWindowResize, false );
}
