/**
 * SciamLab SmartLab Visualization
 * v0.5b
 */

var DEBUG = false;
var mouse = { x: 0, y: 0 }

var appConstants  = {
		TRANSLATE_0 : -1200,
		TRANSLATE_1 : 3700,
		SCALE : 5000
};
var headerH=$('header').height();
/*var WIDTH = window.innerWidth, HEIGHT = window.innerHeight-headerH;*/
var WIDTH, HEIGHT , CANVAS_W, CANVAS_H;
if($('main').width() > 768){
    WIDTH = $('main').width();
    HEIGHT = $('main').height();
}else{
    WIDTH = $('main').width();
    HEIGHT = 200;
}
var offset=$('.container2').offset();
CANVAS_W=offset.left;
CANVAS_H=offset.top;

var geons = {};
var ISTAT_PARAM = {
		Anno: 2001
};

//this file contains all the geo related objects and functions
geons.geoConfig = function() {
	this.TRANSLATE_0 = appConstants.TRANSLATE_0; //z-axis
	this.TRANSLATE_1 = appConstants.TRANSLATE_1; //x-axis
	this.SCALE = appConstants.SCALE; //SCALE 1:5000

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

var cont = document.getElementById("3dcontainer");

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

//set the defaults in case no parameters are found
var	h = (urlParams.h=="" || urlParams.h==null) ? "abitanti" : urlParams.h,
c = (urlParams.c=="" || urlParams.c==null) ? "assunzioni" : urlParams.c,
g = (urlParams.g=="" || urlParams.g==null) ? "regioni" : urlParams.g,
hwc = (urlParams.hwc=="" || urlParams.hwc==null) ? "0.5" : urlParams.hwc;
//console.log("H: "+h);		
//console.log("C: "+c);
//console.log("G: "+g);
//console.log("HWC: "+hwc);

// set the proper value to the inidicatore selects

$("#statchooserH").val( h );
$("#statchooserC").val( c );


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

var color_weight = .5;
var height_weight = .5;
var color_sum=0;
var height_sum=0;


function draw3DStat(geoData,statDataH,statDataC) {
	var dataset_fileH = statDataH;
	var dataset_fileC = statDataC;
	var geo_file = geoData;
	color_sum=0;
	height_sum=0;    


        //console.log("GEO: "+geo_file);
        //console.log("DATAH: "+dataset_fileH);
        //console.log("DATAC: "+dataset_fileC);

	jQuery.getJSON("data/"+dataset_fileH+".json", function(dataH, textStatus, jqXHR) {

		datasetH = dataH;
		//console.log("datasetH: "+datasetH);
		//title = dataset.title;
		//description = dataset.description;
		//console.log("title: "+title);
        //$("#stat-title").html(title);
		//console.log("description: "+description);

		height_prop = datasetH.dim_prop;
		height_scaling_factor = datasetH.dim_scaling_factor;
		height_label = datasetH.dim_label;
        height_polarity = parseInt(datasetH.dim_polarity);
		height_unit = datasetH.dim_unit;
        $("#stat-dimhigh").html(height_label);
        $(".label-dim-high").html(height_label);

		for (var ix = 0 ; ix < datasetH.data.length ; ix++) {
	       height_sum=height_sum+parseFloat(datasetH.data[ix][height_prop]);
		}
		if (DEBUG) {
			console.log("height_prop: "+height_prop);
			console.log("height_scaling_factor: "+height_scaling_factor);
			console.log("height_label: "+height_label);
			console.log("height_unit: "+height_unit);
			console.log("height_polarity: "+height_polarity);
			console.log("height_sum: "+height_sum);
		}
		jQuery.getJSON("data/"+dataset_fileC+".json", function(dataC, textStatus, jqXHR) {

			datasetC = dataC;
			//console.log("datasetC: "+datasetC);

			color_prop = datasetC.dim_prop;
			color_scaling_factor = datasetC.dim_scaling_factor;
			color_label = datasetC.dim_label;
		    color_polarity = parseInt(datasetC.dim_polarity);
			color_unit = datasetC.dim_unit;
		    $("#stat-dimcolor").html(color_label);
		    $(".label-dim-color").html(color_label);


			for (ix = 0 ; ix < datasetC.data.length ; ix++) {
			   color_sum=color_sum+parseFloat(datasetC.data[ix][color_prop]);
			}
			if (DEBUG) {
				console.log("color_prop: "+color_prop);
				console.log("color_scaling_factor: "+color_scaling_factor);
				console.log("color_label: "+color_label);
				console.log("color_unit: "+color_unit);
				console.log("color_polarity: "+color_polarity);
				console.log("color_sum: "+color_sum);
			}
			// get the data
			jQuery.getJSON("geo/"+geo_file+".json", function(data, textStatus, jqXHR) {

				geojson = data;
				//console.log("geojson: "+geojson);
				initScene();
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

					// loop on GeoJSON available feature
					// and convert each into mesh and calculate values
					for (var i = 0 ; i < geojson.features.length ; i++) {
						var geoFeature = geojson.features[i]
						var feature = geo.path(geoFeature);
						// we only need to convert it to a three.js path
						var regione_id = geoFeature.properties.id_regione;
						var current_color; // = geoFeature.properties[color_prop];
						var current_height; // = geoFeature.properties[height_prop];
		                var current_rank=0;
						// both the dataset have the same number of elements
						// calculate the rank of each region based on balanced weigthed average
						for (var ii = 0 ; ii < datasetH.data.length ; ii++) {
							if(datasetH.data[ii].id_regione==regione_id){
								// add the nome_regione to the datasetH statistical data
								// it will be useful later to transfer it to the top/worst three region labels
								datasetH.data[ii].nome_regione=geoFeature.properties.nome_regione;
								current_color = datasetC.data[ii][color_prop];
								current_height = datasetH.data[ii][height_prop];
								normalized_color = (((current_color/color_sum)*100)*color_weight*color_polarity);
						        normalized_height = (((current_height/height_sum)*100)*height_weight*height_polarity);
		        				//console.log("Normalized color indicator: "+normalized_color); 
		        				//console.log("Normalized height indicator: "+normalized_height); 
		        				datasetH.data[ii].rank=parseInt( (normalized_color+normalized_height) *100 );
		        				datasetC.data[ii].rank=parseInt( (normalized_color+normalized_height) *100 );
								current_rank = datasetH.data[ii].rank;
								break;
							}
						}
						//DEBUG// console.log('['+regione_id+'] REGIONE: ' + geoFeature.properties.nome_regione + ' color_value: ' + current_color + ' height_value: ' + current_height +' RANK: '+current_rank);
						//console.log()	
						var mesh = transformSVGPathExposed(feature);
						// add to array
						meshes.push(mesh);

						// we get a property from the json object and use it
						// to determine the color later on
						var color = parseInt(current_color*color_scaling_factor);// getRandomInt(22,6046);
						if (color > maxValueAverage) maxValueAverage = color;
						if (color < minValueAverage || minValueAverage == -1) minValueAverage = color;
						averageValues.push(color);

						// and we get the max values to determine height later on.
						var height = parseInt(current_height*height_scaling_factor); //getRandomInt(5800,15500);
						if (height > maxValueTotal) maxValueTotal = height;
						if (height < minValueTotal || minValueTotal == -1) minValueTotal = height;
						totalValues.push(height);
					}
		            //console.log("NON ORDINATO");
					//console.log(dataset.data);
					//regionsort = dataset.data;

					var neutralDataset = jQuery.extend(true, {}, datasetH);
 
		            regionsort = neutralDataset.data.sort(function(a,b) {
						if (a.rank < b.rank)
							return 1; 
						if (a.rank > b.rank)
							return -1; 
		                return 0;
		            });

		            //console.log("ORDINATO");
		            //console.log(regionsort);
/*
		            $("#region-b1").html(regionsort[0]['nome_regione']);
		            $("#region-b2").html(regionsort[1]['nome_regione']);
		            $("#region-b3").html(regionsort[2]['nome_regione']);
		            $("#region-w3").html(regionsort[17]['nome_regione']);
		            $("#region-w2").html(regionsort[18]['nome_regione']);
		            $("#region-w1").html(regionsort[19]['nome_regione']);
*/
		            //console.log(averageValues);
		            //console.log(minValueAverage);
		            //console.log(maxValueAverage);
					// we've got our paths now extrude them to a height and add a color
					for (var i = 0 ; i < averageValues.length ; i++) {

						// create material color based on average
						var scale = ((averageValues[i] - minValueAverage) / (maxValueAverage - minValueAverage)) * 255;
						//console.log("###SCALE:" + scale);

						var mathColor = jsgradient.generateGradient('#F02B07','#0476F0',averageValues[i],minValueAverage,maxValueAverage); // gradient5(averageValues[i]);gradient5(averageValues[i]); // gradient(Math.round(scale),50);

						var material = new THREE.MeshLambertMaterial({
							color: mathColor,
							//ambient: mathColor,
							//emissive: mathColor
						});

						// create extrude based on total
						var extrude = (((totalValues[i] - minValueTotal) / (maxValueTotal - minValueTotal)) * 100 )+50;

						var mes = meshes[i];
						//console.log("## MESH: "+mes.toSource());
						//console.log("## MESH: "+typeof mes);
						var vec1 = new THREE.Vector3( 100, extrude,-100);
						var vec2 = new THREE.Vector3( 100, 30,-100);

						var randomPoints = [];
						randomPoints.push(vec1); randomPoints.push(vec2);
						var randomSpline =  new THREE.SplineCurve3( randomPoints );

						var shape3d = mes.extrude({amount: Math.round(extrude), bevelEnabled: true, bevelThickness  : 20, bevelSize: 10, bevelSegments: 10, extrudePath: randomSpline});

						shape3d.castShadow = true;
						//console.log('['+i+'] - SCALE: '+scale+' MATHCOLOR:'+mathColor+' EXTRUDE: '+Math.round(extrude));

						// create a mesh based on material and extruded shape
						var toAdd = new THREE.Mesh(shape3d, material);
						toAdd.castShadow = true;
						toAdd.name = geojson.features[i].properties.id_regione;
	 					regions.add(toAdd);
					}
					regions.castShadow = true;
					scene.add(regions);
					updateStats(hwc);
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
						console.log(' Printing... ');
						var cnvs = document.getElementById("canvas3d");
						cnvs.toBlob(function(blob) {
							saveAs(blob, "canvas_datotratto.png");
						});
					}		

					if ( keyboard.pressed("1") )
						console.log(' Have a nice day! - 1');	
					if ( keyboard.pressed("2") )
						console.log(' Have a nice day! - 2');	
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



			}); // end loading/rendering geodata
		}); // end loading color dimension
	}); //end loading high dimension
} // end draw3DStat

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

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( (event.pageX-CANVAS_W)/ WIDTH ) * 2 - 1;
    mouse.y =-(( (event.pageY-CANVAS_H) / HEIGHT ) * 2 - 1);
}

function initGUI() {

	var onFrame = window.requestAnimationFrame;
	this.projector = new THREE.Projector();
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

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
			for (var i = 0 ; i < datasetH.data.length ; i++) {
				var regionH = datasetH.data[i];
				var regionC = datasetC.data[i];
				if(regionH.id_regione == this.INTERSECTED.name){
					this.hover_name = regionH.nome_regione;
					this.hover_color = regionC[color_prop];
					this.hover_height = regionH[height_prop];
                    this.hover_rank = regionH.rank;
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
						
                        ddrivetip('<p><h4 style="font-family:Nilland,sans-serif;font-weight:900;">'+this.hover_name+'</h4>'+this.height_label+': '+this.hover_height+this.height_unit+'<br />'+this.color_label+': '+this.hover_color+this.color_unit+'<br />RANK:'+this.hover_rank+'</p>','rgba(231,231,231,0.8)', 300);
		} else {
			hideddrivetip();
		}
		onFrame(tick);
	}
	onFrame(tick);
} // end initGUI()

function onWindowResize() {
    // added header and footer calculation for best responsive effect
    if($('main').width() > 768){
        WIDTH = $('main').width();
        HEIGHT = $('main').height();
    }else{
        WIDTH = $('main').width();
        HEIGHT = 200;
    }
    var offset=$('.container2').offset();
    CANVAS_W=offset.left;
    CANVAS_H=offset.top;

    /*camera.aspect = (window.innerWidth) / (window.innerHeight-headerH);
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, (window.innerHeight-headerH) );*/
    camera.aspect = (WIDTH) / (HEIGHT);
    camera.updateProjectionMatrix();
    renderer.setSize( WIDTH, HEIGHT);
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
        scene.name = "scene_main";
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
	// create axis
	//axes = buildAxes( 5000 );
	//scene.add(axes);

	// add and position the camera at a fixed position
	camera.name = "camera_main";
        scene.add(camera);
	camera.position.x = 950;
	camera.position.y = 1100;
	camera.position.z = 0;
	camera.lookAt(new THREE.Vector3(0,-100,0));

	// start the renderer, and black background
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor( 0xffffff); //white: 0xffffff


	// add the render target to the page
	renderer.domElement.id="canvas3d";
	$("#3dcontainer").html(renderer.domElement);


	var strDataURI = renderer.domElement.toDataURL();

	// add a light at a specific position
	/*var pointLight = new THREE.PointLight(0xFFFFFF ,0);
    pointLight.castShadow = true;
    pointLight.shadowDarkness = 0.5;
    pointLight.shadowCameraVisible = true; // only for debugging
	scene.add(pointLight);
	pointLight.position.x = 800;
	pointLight.position.y = 1700;
	pointLight.position.z = 800;*/

    
	var pointLight = new THREE.PointLight(0xFFFFFF ,0.9);
    //pointLight.castShadow = true;
    pointLight.shadowDarkness = 0.6;
    pointLight.name="point_lateral_light";
    scene.add(pointLight);
	pointLight.position.x = 200;
	pointLight.position.y = 200;
	pointLight.position.z = 500;


    // add a base TRANSPARENT plane on which we'll render our map for shadow
	/// backgroup grids 
	var plane = new THREE.Mesh(
		new THREE.PlaneGeometry(10000, 10000, 10, 10),
		new THREE.MeshBasicMaterial({ color: 0xffffff }));
	plane.rotation.x = -Math.PI/2;
        plane.receiveShadow = true;
        plane.name="plane_shadow";
	scene.add( plane );


    // LIGHTS


    var light;

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-200, 1000, -300);

    light.castShadow = true;
   /* light.shadowCameraVisible = true;*/

    light.shadowMapWidth = 2000;
    light.shadowMapHeight =2000;

    var d = 1000;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 2000;
    light.shadowDarkness = 0.4;
    light.name = "light_shadow";
    scene.add(light);

	//var planeGeo = new THREE.PlaneGeometry(20000, 20000, 10, 10);
	//var planeMat = new THREE.MeshLambertMaterial({color: 0xffffff}); //0xffffff
	//var plane = new THREE.Mesh(planeGeo, planeMat);

	// rotate it to correct position
	//plane.rotation.x = -Math.PI/2;
	//scene.add(plane);

	//keyboard = new THREEx.KeyboardState(renderer.domElement);

	// automated mouse OrbitControls
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle=(Math.PI/2)-0.09;

	// GUI
	//initGUI();

	// DAT.GUI
	//initDATGUI();

	// manage window resize
	window.addEventListener( 'resize', onWindowResize, false );
}


if($('.best-worst').length > 0){
    var w;
    $(window).on('load', function () {
		$('.selectpicker').selectpicker();
		//$('#statchooserH').selectpicker('val', h);//.refresh;
		//$('#statchooserC').selectpicker('val', c);//.refresh;

        $('#slider-high').slider('setValue',hwc)
            .on('slide', function(ev) {
				//console.log("slider event:"+ev.toSource());
				updateStats(Number( ev.value.toFixed(1) ));
			});
    });
}

function updateStats(newVal){
	hwc = newVal; 
	color_weight = hwc; 
    height_weight = Number((1-hwc).toFixed(1));
    document.getElementById('val-dim-high').innerHTML = height_weight;
    document.getElementById('val-dim-color').innerHTML = color_weight;

    for (var x = 0 ; x < regionsort.length ; x++) {
        current_color = datasetC.data[x][color_prop];
        current_height = datasetH.data[x][height_prop];
	    normalized_color = (((current_color/color_sum)*100)*color_weight*color_polarity);
        normalized_height = (((current_height/height_sum)*100)*height_weight*height_polarity);
        //console.log("Normalized color indicator: "+normalized_color); 
        //console.log("Normalized height indicator: "+normalized_height); 
        datasetH.data[x].rank=parseInt( (normalized_color+normalized_height) *100 );
        //rank_regioni[regione_id] = parseInt((((current_color/color_sum)*100)*color_weight)+(((current_height/height_sum)*100)*height_weight)*100);
		current_rank = datasetH.data[x].rank;
        //console.log("REG/HEIGH/COLOR/RANK: "+ dataset.data[x].nome_regione+"/"+current_height+"/"+current_color+"/"+current_rank); 
    }

	var neutralDataset = jQuery.extend(true, {}, datasetH);
    regionsort = neutralDataset.data.sort(function(a,b) {
        if (a.rank > b.rank)
            return -1;
        if (a.rank < b.rank)
            return 1;
        return 0;
    });

    $("#region-b1").html(regionsort[0]['nome_regione']);
    $("#region-b2").html(regionsort[1]['nome_regione']);
    $("#region-b3").html(regionsort[2]['nome_regione']);
    $("#region-w3").html(regionsort[17]['nome_regione']);
    $("#region-w2").html(regionsort[18]['nome_regione']);
    $("#region-w1").html(regionsort[19]['nome_regione']);

	updateShareText();
}

function chooseStat(actionFrom) {
    // check in the same value is selected on both the combos
    var selStatH = document.getElementById("statchooserH");
    var selStatC = document.getElementById("statchooserC");
    var statFileH = selStatH.options[selStatH.selectedIndex].value;
    var statFileC = selStatC.options[selStatC.selectedIndex].value;

	if (statFileH==statFileC) {
		console.log("turn error on: "+actionFrom.id);
		$("button[data-id="+actionFrom.id+"]")
            .addClass("btn-danger");
		return false;			
	} else {
		$(".btn-danger")
            .removeClass("btn-danger");
		h=statFileH;
		c=statFileC;
        draw3DStat("regioni",h,c);
		updateShareText();
		return true;
	}	
} //end chooseStat(actionFrom)

function updateShareText() {

    var selStatH = document.getElementById("statchooserH");
    var selStatC = document.getElementById("statchooserC");
	
	refURL = encodeURIComponent(location.protocol + '//' + location.host + location.pathname +"?h="+h+"&c="+c+"&hwc="+hwc+"&g="+g);
	//console.log("refURL: "+refURL);
	refText = encodeURIComponent( "#ildatotratto "+selStatH.options[selStatH.selectedIndex].text+" e "+selStatC.options[selStatC.selectedIndex].text+" #istat #datachallenge");

	//update twitter
	twurl = "https://twitter.com/intent/tweet?tw_p=tweetbutton&url="+refURL+"&text=" + refText;
	$("#twbutton").attr("href",twurl);

	//update google+
 
	//update facebook

}
