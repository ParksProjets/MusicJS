/*

Space


Taken form:
http://airtightinteractive.com/demos/js/reactive/

*/


(function() {


	var active = true;

	var analyser = null;


	var RINGCOUNT = 160;
	var SEPARATION = 30;
	var INIT_RADIUS = 50;
	var SEGMENTS = 512;
	var BIN_COUNT = 512;

	var rings = [];
	var levels = [];
	var colors = [];
	var loopHolder = new THREE.Object3D();
	var loopGeom; // One geom for all rings
	var freqByteData;
	var timeByteData;

	var perlin = new ImprovedNoise();
	var noisePos = Math.random()*100;

	// Vizualizer Params
	var vizParams = {
		gain:1,
		separation: 0.05,
		scale: 1,
		zbounce: 1
	};


	var camera, scene, renderer;



	// Mouse

	var mouseX = mouseY = 0;

	function onDocumentMouseMove(event) {
		mouseX = (event.clientX - wWidth / 2);
		mouseY = (event.clientY - wHeight / 2);
	}

	$(document).mousemove(onDocumentMouseMove);




	function init() {

		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
		camera.position.z = 2000;
		

		scene = new THREE.Scene();
		scene.add(camera);
		

		renderer = new THREE.WebGLRenderer({
			antialias : false,
			sortObjects : false
		});

		renderer.setClearColor(0x000000, 1);

		$("#fft3")[0].appendChild( renderer.domElement );


		

		// Create ring geometry
		var loopShape = new THREE.Shape();
		loopShape.absarc( 0, 0, INIT_RADIUS, 0, Math.PI*2, false );
		loopGeom = loopShape.createPointsGeometry(SEGMENTS/2);
		loopGeom.dynamic = true;


		// Create Rings
		scene.add(loopHolder);
		var scale = 1;
		
		for (var i = 0; i < RINGCOUNT; i++) {

			var m = new THREE.LineBasicMaterial({ color: 0xffffff,
				linewidth: 1 ,
				opacity : 0.7,
				blending : THREE.AdditiveBlending,
				depthTest : false,
				transparent : true
			});
			
			var line = new THREE.Line( loopGeom, m);

			rings.push(line);
			scale *= 1.05;
			line.scale.x = scale;
			line.scale.y = scale;
			loopHolder.add(line);

			levels.push(0);
			colors.push(0);
		}


		onParamsChange();
	}



	function onParamsChange() {

		loopHolder.scale.x = loopHolder.scale.y = vizParams.scale;

		var scale = 1;
		for (var i = 0; i < RINGCOUNT; i++) {
			var line = rings[i];
			line.scale.x = scale;
			line.scale.y = scale;
			scale *= 1 + vizParams.separation;
		}
	}


	init();



	function animate() {

		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		//add a new average volume onto the list
		var sum = 0;
		for(var i = 0; i < BIN_COUNT; i++) {
			sum += freqByteData[i];
		}
		var aveLevel = sum / BIN_COUNT;
		var scaled_average = (aveLevel / 256) * vizParams.gain*2; //256 is the highest a level can be
		levels.push(scaled_average);
		levels.shift(1);

		//add a new color onto the list
		
		var n = Math.abs(perlin.noise(noisePos, 0, 0));
		colors.push(n);
		colors.shift(1);

		//write current waveform into all rings
		for(var j = 0; j < SEGMENTS; j++) {
			loopGeom.vertices[j].z = timeByteData[j]*2;//stretch by 2
		}
		// link up last segment
		loopGeom.vertices[SEGMENTS].z = loopGeom.vertices[0].z;
		loopGeom.verticesNeedUpdate = true;

		for( i = 0; i < RINGCOUNT ; i++) {
			var ringId = RINGCOUNT - i - 1;
			var normLevel = levels[ringId] + 0.01; //avoid scaling by 0
			var hue = colors[i];
			rings[i].material.color.setHSL(hue, 1, normLevel*.8);
			rings[i].material.linewidth = normLevel*3;
			rings[i].material.opacity = normLevel;
			rings[i].scale.z = normLevel * vizParams.zbounce;
		}



		noisePos += 0.005;

		// Mouse
		var xrot = mouseX / wWidth * Math.PI*0.3 + Math.PI;
		var yrot = mouseY / wHeight* Math.PI*0.4 + Math.PI*1.3;
		loopHolder.rotation.x += (-yrot - loopHolder.rotation.x) * 0.3;
		loopHolder.rotation.y += (xrot - loopHolder.rotation.y) * 0.3;


		renderer.render(scene, camera);


		if (active)
			requestAnimationFrame(animate);
	}





	function onPlayOrShow() {

		analyser = dancer.audioAdapter.analyser;

		// Init audio IN
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);
	}




	var fft = {

		onPlay: onPlayOrShow,


		update: function() {
		},


		onResize: function(height, width) {
			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

			fft.reset();
		},


		reset: function() {
		},


		on: function() {
			onPlayOrShow();
			active = true;
			requestAnimationFrame(animate);
		},


		off: function() {
			active = false;
		}
	}



	fft.onResize(wHeight, wWidth);

	FFTManager[3] = fft;

})();