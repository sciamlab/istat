/**
* SciamLab SmartLab Visualization
* v0.5b
*/

// TRANSLATE_0 z-axis
// TRANSLATE_1 x-axis
// SCALE 1:5000

//anonymous function 
$(function(){ 
}());

	var mouse = { x: 0, y: 0 }

	var appConstants  = {
	    TRANSLATE_0 : -1200,
	    TRANSLATE_1 : 3900,
	    SCALE : 5000
	};
    var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

	var geons = {};

	// this file contains all the geo related objects and functions
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

	// geoConfig contains the configuration for the geo functions
	geo = new geons.geoConfig();



	// check if WebGL is not available 
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    // get the correct geo for d3s
    geo.setupGeo();
    var translate = geo.mercator.translate();
    var scene;
    var controls;
    var renderer;
    var camera;
	projector = {};
    var keyboard = new THREEx.KeyboardState();
    var regions = new THREE.Object3D();
    
    var rotSpeed = .02;

    // get the data
    jQuery.getJSON('italy_regions_lowres.json', function(data, textStatus, jqXHR) {

        initScene();
        addGeoObject();
        renderer.render( scene, camera );
		animate();

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
			axes = buildAxes( 5000 );
			scene.add(axes);

            // add and position the camera at a fixed position
            scene.add(camera);
            camera.position.x = 1000;
            camera.position.y = 1500;
            camera.position.z = 0;
			camera.lookAt(new THREE.Vector3(0,-1000,0));

			// start the renderer, and black background
            renderer.setSize(WIDTH, HEIGHT);
            renderer.setClearColor( 0xb0b0b0); //white: 0xffffff

            // add the render target to the page
			renderer.domElement.id="canvas3d";
            $("#3dcontainer").append(renderer.domElement);


			var strDataURI = renderer.domElement.toDataURL();

            // add a light at a specific position
            var pointLight = new THREE.PointLight(0xFFFFFF);
            scene.add(pointLight);
            pointLight.position.x = 5000;
            pointLight.position.y = 5000;
            pointLight.position.z = -5000;

            // add a base TRANSPARENT plane on which we'll render our map
			/// backgroup grids 
			//var plane = new THREE.Mesh(
			//	new THREE.PlaneGeometry(10000, 10000, 10, 10), 
			//	new THREE.MeshBasicMaterial({ color: 0x7f7f7f, wireframe: true }));
			//plane.rotation.x = -Math.PI/2;
			//scene.add( plane );

            var planeGeo = new THREE.PlaneGeometry(20000, 20000, 10, 10);
            var planeMat = new THREE.MeshLambertMaterial({color: 0xffffff}); //0xffffff
            var plane = new THREE.Mesh(planeGeo, planeMat);

            // rotate it to correct position
            plane.rotation.x = -Math.PI/2;
            scene.add(plane);

			//keyboard = new THREEx.KeyboardState(renderer.domElement);

			// automated mouse OrbitControls
			controls = new THREE.OrbitControls( camera, renderer.domElement );

			// GUI
			initGUI();

			// manage window resize
			window.addEventListener( 'resize', onWindowResize, false );

			
        }


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
          for (var i = 0 ; i < data.features.length ; i++) {
              var geoFeature = data.features[i]
              var feature = geo.path(geoFeature);
              // we only need to convert it to a three.js path
			  console.log('['+i+'] REGIONE: ' + geoFeature.properties.nome_regione);
              var mesh = transformSVGPathExposed(feature);
              // add to array
              meshes.push(mesh);

              // we get a property from the json object and use it
              // to determine the color later on
              var value = getRandomInt(300,960);
              if (value > maxValueAverage) maxValueAverage = value;
              if (value < minValueAverage || minValueAverage == -1) minValueAverage = value;
              averageValues.push(value);

              // and we get the max values to determine height later on.
              value = getRandomInt(-6800,-25500);
              if (value > maxValueTotal) maxValueTotal = value;
              if (value < minValueTotal || minValueTotal == -1) minValueTotal = value;

              totalValues.push(value);
          }

		  console.log(" averageValues: " + averageValues);
		  console.log(" totalValues: " + totalValues);

		  
          // we've got our paths now extrude them to a height and add a color
          for (var i = 0 ; i < averageValues.length ; i++) {

              // create material color based on average
              var scale = ((averageValues[i] - minValueAverage) / (maxValueAverage - minValueAverage)) * 255;
              var mathColor = gradient(Math.round(scale),255);
              var material = new THREE.MeshLambertMaterial({
                  color: mathColor,
				  ambient: mathColor,
                  //emissive: mathColor
              });

              // create extrude based on total
              var extrude = (((totalValues[i] - minValueTotal) / (maxValueTotal - minValueTotal)) * 100 )+10;

			  var mes = meshes[i];
              //console.log("## MESH: "+mes.toSource());
              //console.log("## MESH: "+typeof mes);
              var vec1 = new THREE.Vector3( 100, extrude,-100);
              var vec2 = new THREE.Vector3( 100, 0,-100);

			  var randomPoints = [];
 			  randomPoints.push(vec1); randomPoints.push(vec2);
              var randomSpline =  new THREE.SplineCurve3( randomPoints );

              
              var shape3d = mes.extrude({amount: Math.round(extrude), bevelEnabled: true, bevelThickness  : 20, bevelSize: 10, bevelSegments: 10, extrudePath: randomSpline});
			  

			  console.log('['+i+'] - SCALE: '+scale+' MATHCOLOR:'+mathColor+' EXTRUDE: '+Math.round(extrude));

              // create a mesh based on material and extruded shape
              var toAdd = new THREE.Mesh(shape3d, material);

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
            var b = 0;

            var rgb = b | (g << 8) | (r << 16);
            return rgb;
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

	function initGUI() {
		var gui = new dat.GUI();

		var folder1 = gui.addFolder('Camera Position');
		folder1.add( camera.position ,'x' ).listen();
		folder1.add( camera.position, 'y' ).listen();
		folder1.add( camera.position, 'z' ).listen();
        folder1.open();
		//var folder2 = gui.addFolder('Camera LookAt Position');
		//folder2.add( CLA , 'px', -5000,5000).step(5).onChange( function( value ){ CLA.px = value; } );
		//folder2.add( CLA , 'py', -5000,5000).step(5).onChange( function( value ){ CLA.py = value; } );
		//folder2.add( CLA , 'pz', -5000,5000).step(5).onChange( function( value ){ CLA.pz = value; } );
	}

	function onWindowResize() {
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
