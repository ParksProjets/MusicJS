/*

FTT Logo 3D

*/


(function() {



	var canvasFft = $("#fft1 canvas")[0],
		ctxFft = canvasFft.getContext('2d');
		
		h = 0,
		w = 0,

		countFft = 150;


	ctxFft.fillStyle = "#ff0077";



	
	var loaded = false;

	var coeffX = 15;
	var coeffY = 7;

	var scale = 350;
	var active = false;


	var camera, scene, renderer, composer, logo;


	function init() {

		// Camera
		camera = new THREE.PerspectiveCamera( 30, 1, 1, 10000 );
		camera.position.z = 2200;


		// Scene
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );
		scene.add( camera );



		// Light
		var light = new THREE.DirectionalLight( 0xebf3ff, 1.6 );
		light.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );
		scene.add( light );

		var light = new THREE.DirectionalLight( 0x497f13, 1 );
		light.position.set( 0, -1, 0 );
		scene.add( light );



		// Renderer
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.domElement.style.position = "absolute";

		renderer.setClearColor( 0, 1 );

		$("#fft1")[0].appendChild( renderer.domElement );





		// Post Processing

		var hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		hblur.uniforms[ 'h' ].value =  1 / window.innerWidth;


		var vblur = new THREE.ShaderPass( THREE.VerticalBlurShader);
		vblur.uniforms[ 'v' ].value =  1 / window.innerHeight;
		
		

		var blurAmountX = 15 / window.innerWidth,
			shaderBlur = THREE.TriangleBlurShader,
			effectBlurX = new THREE.ShaderPass( shaderBlur, 'texture' );

		effectBlurX.uniforms[ 'delta' ].value = new THREE.Vector2( blurAmountX, 0 );


		var effectFocus = new THREE.ShaderPass( THREE.FocusShader );
		effectFocus.uniforms[ 'sampleDistance' ].value = 0.99; //0.94
		effectFocus.uniforms[ 'waveFactor' ].value = 0.003;  //0.00125



		var renderScene = new THREE.RenderPass( scene, camera );

		composer = new THREE.EffectComposer( renderer );
		composer.addPass( renderScene );
		
		composer.addPass( hblur );
		composer.addPass( vblur );
		composer.addPass( effectBlurX );
		composer.addPass( effectFocus );


		vblur.renderToScreen = true;
		effectFocus.renderToScreen = true;



		// Loader
		var loader = new THREE.JSONLoader();
		loader.load( "asset/model4.js", createGeometry);

	}



	function createGeometry(geometry, materials) {

		var x = 0, y = -250, z = -300;

		geometry.computeBoundingBox();
		var bb = geometry.boundingBox;

		logo = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial( materials ) );
		logo.position.set( x, y - bb.min.y * scale, z );
		logo.rotation.y = Math.PI * 2;
		logo.scale.set( scale, scale, scale );
		scene.add( logo );

		loaded = true;
		animate();
	}



	function animate() {

		if(!loaded)  return;


		logo.scale.set( scale, scale, scale );

		if(scale < 360)
			scale = 350;
		else
			scale -= 10;

		if(Math.abs(camera.position.x) > 600)
			coeffX = -coeffX;

		if(Math.abs(camera.position.y) > 500)
			coeffY = -coeffY;

		camera.position.x += coeffX;
		camera.position.y += coeffY;

		camera.lookAt(scene.position);

		//renderer.render( scene, camera );
		composer.render( 0.1 );


		if(!active) return;

		requestAnimationFrame(animate);
	}


	init();




	var fft = {


		onKick: function() {
			scale = 500;
		},


		offKick: function() {

		},


		update: function() {

			var spectrum = dancer.getSpectrum(),
				width = w * 0.42,
				height = h / countFft;

			ctxFft.clearRect( 0, 0, w, h );
			ctxFft.fillStyle = "#666";
			for ( var i = 0, l = spectrum.length; i < l && i < countFft; i++ ) {
				ctxFft.fillRect( 0, i * height, spectrum[ i ] * width, height);
				ctxFft.fillRect( w, i * height, -spectrum[ i ] * width, height);
			}
		},


		onResize: function(height, width) {
			camera.aspect = width / height;
			camera.updateProjectionMatrix();

			renderer.setSize( width, height );

			canvasFft.height = h = height;
			canvasFft.width = w = width;
			fft.reset();
		},


		reset: function() {
			ctxFft.clearRect( 0, 0, w, h );
		},


		on: function() {
			active = true;
			requestAnimationFrame(animate);
		},


		off: function() {
			active = false;
		}
	}



	fft.onResize(wHeight, wWidth);

	FFTManager[1] = fft;

})();