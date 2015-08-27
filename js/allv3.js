/**
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function () {}

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function ( object ) {

		object.on = EventDispatcher.prototype.on;
		object.hasEventListener = EventDispatcher.prototype.hasEventListener;
		object.off = EventDispatcher.prototype.off;
		object.emit = EventDispatcher.prototype.emit;

	},

	on: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	off: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	emit: function ( type ) {
			
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var array = [];
			var length = listenerArray.length;
			var args = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];

			for ( var i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( var i = 0; i < length; i ++ ) {

				array[ i ].apply( this, args );

			}

		}

	}

};
// Post-processing for THREE.js
THREE.BloomPass=function(e,t,n,r){e=e!==undefined?e:1;t=t!==undefined?t:25;n=n!==undefined?n:4;r=r!==undefined?r:256;var i={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};this.renderTargetX=new THREE.WebGLRenderTarget(r,r,i);this.renderTargetY=new THREE.WebGLRenderTarget(r,r,i);if(THREE.CopyShader===undefined)console.error("THREE.BloomPass relies on THREE.CopyShader");var s=THREE.CopyShader;this.copyUniforms=THREE.UniformsUtils.clone(s.uniforms);this.copyUniforms["opacity"].value=e;this.materialCopy=new THREE.ShaderMaterial({uniforms:this.copyUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,blending:THREE.AdditiveBlending,transparent:true});if(THREE.ConvolutionShader===undefined)console.error("THREE.BloomPass relies on THREE.ConvolutionShader");var o=THREE.ConvolutionShader;this.convolutionUniforms=THREE.UniformsUtils.clone(o.uniforms);this.convolutionUniforms["uImageIncrement"].value=THREE.BloomPass.blurx;this.convolutionUniforms["cKernel"].value=THREE.ConvolutionShader.buildKernel(n);this.materialConvolution=new THREE.ShaderMaterial({uniforms:this.convolutionUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader,defines:{KERNEL_SIZE_FLOAT:t.toFixed(1),KERNEL_SIZE_INT:t.toFixed(0)}});this.enabled=true;this.needsSwap=false;this.clear=false};THREE.BloomPass.prototype={render:function(e,t,n,r,i){if(i)e.context.disable(e.context.STENCIL_TEST);THREE.EffectComposer.quad.material=this.materialConvolution;this.convolutionUniforms["tDiffuse"].value=n;this.convolutionUniforms["uImageIncrement"].value=THREE.BloomPass.blurX;e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera,this.renderTargetX,true);this.convolutionUniforms["tDiffuse"].value=this.renderTargetX;this.convolutionUniforms["uImageIncrement"].value=THREE.BloomPass.blurY;e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera,this.renderTargetY,true);THREE.EffectComposer.quad.material=this.materialCopy;this.copyUniforms["tDiffuse"].value=this.renderTargetY;if(i)e.context.enable(e.context.STENCIL_TEST);e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera,n,this.clear)}};THREE.BloomPass.blurX=new THREE.Vector2(.001953125,0);THREE.BloomPass.blurY=new THREE.Vector2(0,.001953125);THREE.CopyShader={uniforms:{tDiffuse:{type:"t",value:null},opacity:{type:"f",value:1}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float opacity;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","vec4 texel = texture2D( tDiffuse, vUv );","gl_FragColor = opacity * texel;","}"].join("\n")};THREE.EffectComposer=function(e,t){this.renderer=e;if(t===undefined){var n=window.innerWidth||1;var r=window.innerHeight||1;var i={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,stencilBuffer:false};t=new THREE.WebGLRenderTarget(n,r,i)}this.renderTarget1=t;this.renderTarget2=t.clone();this.writeBuffer=this.renderTarget1;this.readBuffer=this.renderTarget2;this.passes=[];if(THREE.CopyShader===undefined)console.error("THREE.EffectComposer relies on THREE.CopyShader");this.copyPass=new THREE.ShaderPass(THREE.CopyShader)};THREE.EffectComposer.prototype={swapBuffers:function(){var e=this.readBuffer;this.readBuffer=this.writeBuffer;this.writeBuffer=e},addPass:function(e){this.passes.push(e)},insertPass:function(e,t){this.passes.splice(t,0,e)},render:function(e){this.writeBuffer=this.renderTarget1;this.readBuffer=this.renderTarget2;var t=false;var n,r,i=this.passes.length;for(r=0;r<i;r++){n=this.passes[r];if(!n.enabled)continue;n.render(this.renderer,this.writeBuffer,this.readBuffer,e,t);if(n.needsSwap){if(t){var s=this.renderer.context;s.stencilFunc(s.NOTEQUAL,1,4294967295);this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e);s.stencilFunc(s.EQUAL,1,4294967295)}this.swapBuffers()}if(n instanceof THREE.MaskPass){t=true}else if(n instanceof THREE.ClearMaskPass){t=false}}},reset:function(e){if(e===undefined){e=this.renderTarget1.clone();e.width=window.innerWidth;e.height=window.innerHeight}this.renderTarget1=e;this.renderTarget2=e.clone();this.writeBuffer=this.renderTarget1;this.readBuffer=this.renderTarget2},setSize:function(e,t){var n=this.renderTarget1.clone();n.width=e;n.height=t;this.reset(n)}};THREE.EffectComposer.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);THREE.EffectComposer.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);THREE.EffectComposer.scene=new THREE.Scene;THREE.EffectComposer.scene.add(THREE.EffectComposer.quad);THREE.FilmPass=function(e,t,n,r){if(THREE.FilmShader===undefined)console.error("THREE.FilmPass relies on THREE.FilmShader");var i=THREE.FilmShader;this.uniforms=THREE.UniformsUtils.clone(i.uniforms);this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader});if(r!==undefined)this.uniforms.grayscale.value=r;if(e!==undefined)this.uniforms.nIntensity.value=e;if(t!==undefined)this.uniforms.sIntensity.value=t;if(n!==undefined)this.uniforms.sCount.value=n;this.enabled=true;this.renderToScreen=false;this.needsSwap=true};THREE.FilmPass.prototype={render:function(e,t,n,r){this.uniforms["tDiffuse"].value=n;this.uniforms["time"].value+=r;THREE.EffectComposer.quad.material=this.material;if(this.renderToScreen){e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera)}else{e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera,t,false)}}};THREE.FocusShader={uniforms:{tDiffuse:{type:"t",value:null},screenWidth:{type:"f",value:1024},screenHeight:{type:"f",value:1024},sampleDistance:{type:"f",value:.94},waveFactor:{type:"f",value:.00125}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float screenWidth;","uniform float screenHeight;","uniform float sampleDistance;","uniform float waveFactor;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","vec4 color, org, tmp, add;","float sample_dist, f;","vec2 vin;","vec2 uv = vUv;","add = color = org = texture2D( tDiffuse, uv );","vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );","sample_dist = dot( vin, vin ) * 2.0;","f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;","vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );","add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );","if( tmp.b < color.b ) color = tmp;","color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );","color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );","gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );","}"].join("\n")};THREE.MaskPass=function(e,t){this.scene=e;this.camera=t;this.enabled=true;this.clear=true;this.needsSwap=false;this.inverse=false};THREE.MaskPass.prototype={render:function(e,t,n,r){var i=e.context;i.colorMask(false,false,false,false);i.depthMask(false);var s,o;if(this.inverse){s=0;o=1}else{s=1;o=0}i.enable(i.STENCIL_TEST);i.stencilOp(i.REPLACE,i.REPLACE,i.REPLACE);i.stencilFunc(i.ALWAYS,s,4294967295);i.clearStencil(o);e.render(this.scene,this.camera,n,this.clear);e.render(this.scene,this.camera,t,this.clear);i.colorMask(true,true,true,true);i.depthMask(true);i.stencilFunc(i.EQUAL,1,4294967295);i.stencilOp(i.KEEP,i.KEEP,i.KEEP)}};THREE.ClearMaskPass=function(){this.enabled=true};THREE.ClearMaskPass.prototype={render:function(e,t,n,r){var i=e.context;i.disable(i.STENCIL_TEST)}};THREE.FilmShader={uniforms:{tDiffuse:{type:"t",value:null},time:{type:"f",value:0},nIntensity:{type:"f",value:.5},sIntensity:{type:"f",value:.05},sCount:{type:"f",value:4096},grayscale:{type:"i",value:1}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform float time;","uniform bool grayscale;","uniform float nIntensity;","uniform float sIntensity;","uniform float sCount;","uniform sampler2D tDiffuse;","varying vec2 vUv;","void main() {","vec4 cTextureScreen = texture2D( tDiffuse, vUv );","float x = vUv.x * vUv.y * time *  1000.0;","x = mod( x, 13.0 ) * mod( x, 123.0 );","float dx = mod( x, 0.01 );","vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );","vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );","cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;","cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );","if( grayscale ) {","cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );","}","gl_FragColor =  vec4( cResult, cTextureScreen.a );","}"].join("\n")};THREE.HorizontalBlurShader={uniforms:{tDiffuse:{type:"t",value:null},h:{type:"f",value:1/512}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float h;","varying vec2 vUv;","void main() {","vec4 sum = vec4( 0.0 );","sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;","sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;","sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;","sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;","sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;","sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;","sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;","sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;","gl_FragColor = sum;","}"].join("\n")};THREE.ShaderPass=function(e,t){this.textureID=t!==undefined?t:"tDiffuse";this.uniforms=THREE.UniformsUtils.clone(e.uniforms);this.material=new THREE.ShaderMaterial({uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader});this.renderToScreen=false;this.enabled=true;this.needsSwap=true;this.clear=false};THREE.ShaderPass.prototype={render:function(e,t,n,r){if(this.uniforms[this.textureID]){this.uniforms[this.textureID].value=n}THREE.EffectComposer.quad.material=this.material;if(this.renderToScreen){e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera)}else{e.render(THREE.EffectComposer.scene,THREE.EffectComposer.camera,t,this.clear)}}};THREE.RenderPass=function(e,t,n,r,i){this.scene=e;this.camera=t;this.overrideMaterial=n;this.clearColor=r;this.clearAlpha=i!==undefined?i:0;this.oldClearColor=new THREE.Color;this.oldClearAlpha=1;this.enabled=true;this.clear=true;this.needsSwap=false};THREE.RenderPass.prototype={render:function(e,t,n,r){this.scene.overrideMaterial=this.overrideMaterial;if(this.clearColor){this.oldClearColor.copy(e.getClearColor());this.oldClearAlpha=e.getClearAlpha();e.setClearColor(this.clearColor,this.clearAlpha)}e.render(this.scene,this.camera,n,this.clear);if(this.clearColor){e.setClearColor(this.oldClearColor,this.oldClearAlpha)}this.scene.overrideMaterial=null}};THREE.TriangleBlurShader={uniforms:{texture:{type:"t",value:null},delta:{type:"v2",value:new THREE.Vector2(1,1)}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["#define ITERATIONS 10.0","uniform sampler2D texture;","uniform vec2 delta;","varying vec2 vUv;","float random( vec3 scale, float seed ) {","return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed );","}","void main() {","vec4 color = vec4( 0.0 );","float total = 0.0;","float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );","for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {","float percent = ( t + offset - 0.5 ) / ITERATIONS;","float weight = 1.0 - abs( percent );","color += texture2D( texture, vUv + delta * percent ) * weight;","total += weight;","}","gl_FragColor = color / total;","}"].join("\n")};THREE.VerticalBlurShader={uniforms:{tDiffuse:{type:"t",value:null},v:{type:"f",value:1/512}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tDiffuse;","uniform float v;","varying vec2 vUv;","void main() {","vec4 sum = vec4( 0.0 );","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;","sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;","gl_FragColor = sum;","}"].join("\n")}
/*

Knob: control volume for example

© Guillaume Gonnet
License GPLv2

*/



$.fn.knob = function(options, val) {


	if (typeof options == 'string' && val === undefined) {

		if (!$.data(this[0], 'knob'))
			return null;

		return $.data(this[0], 'knob').options[options];
	}



	if (typeof options == 'string' && val !== undefined) {

		return this.each(function (i, el) {

			var obj = $.data(this, 'knob');

			if (!obj)  return;

			obj.changeOptions(options, val);
		});

	}



	var opts = $.extend({}, $.fn.knob.defaults, options);

	return this.each(function (i, el) {
		var $elem = $(this);


		if ($.data(this, 'knob')) {
			var obj = $.data(this, 'knob');

			if (options !== undefined)
				obj.set(options);

			return;
		}


		var obj = new Knob($elem, opts);
		$.data(this, 'knob', obj);
	});

}




$.fn.knob.defaults = {
	radius: 50,
	min: 0,
	max: 100,
	def: 50,
	name: ""
};






function Knob($elem, options) {

	var _this = this;

	this.options = options;


	var $wheelContainer = $('<div class="wheelContainer"></div>'),
		$wheel = $('<div class="wheel"></div>');

	$wheelContainer.append($wheel).css("width", options.radius*2 + "px");
	$wheel.css({
		"width": options.radius*2 + "px",
		"height": options.radius*2 + "px",
		"border-radius": options.radius + "px"
	});



	var $tige = $("<div></div>");
	$tige.css({
		"height": options.radius/2 + "px"
	});

	$wheel.append($tige);


	var $rt = $('<div class="tige rt"></div>'),
		$lt = $('<div class="tige lt"></div>'),
		$0t = $('<div class="tige"></div>');

	$rt.css("top", options.radius*2 - 14 + "px");
	$lt.css("top", options.radius*2 - 14 + "px");

	$wheelContainer.append([ $rt, $lt, $0t ]);

	$0t.css({
		left: options.radius - 1.5 + "px",
		top: "-12px"
	});




	// Set up the main element
	this.$elem = $elem;

	$elem
		.addClass('knob')
		.append($wheelContainer);



	// Set up the wheel
	this.$wheel = $wheel;
	$wheel.append('<p>'+options.name+'</p>');

	


	function calcAngle(e) {
		var posX = e.pageX - $wheelContainer.offset().left,
			posY = e.pageY - $wheelContainer.offset().top;

		var angle = Math.atan2(posX - options.radius, options.radius - posY) * 180 / Math.PI;
		
		if (angle > 135)
			angle = 135;
		else if (angle < -135)
			angle = -135;

		TweenMax.to($wheel, .4, { rotation: angle });
		$elem.trigger("change", [ options.min + (angle+135) / 270 * (options.max -  options.min) ]);
	}




	function mousedown(e) {

		calcAngle(e);
		
		$(window)
			.bind("mousemove", calcAngle)
			.bind("mouseup", mouseup);

	}



	function mouseup() {
		$(window)
			.unbind("mousemove", calcAngle)
			.unbind("mouseup", mouseup);
	}


	$wheel.bind("mousedown", mousedown);

}




Knob.prototype.set = function(value) {

	value = Math.max(Math.min(this.options.max, value), this.options.min);

	var angle = (value - this.options.min) / (this.options.max - this.options.min) * 270 - 135;

	TweenMax.to(this.$wheel, .4, { rotation: angle });
	this.$elem.trigger("change", [ value ]);
};



Knob.prototype.get = function() {

	TweenMax.to($wheel, .4, { rotation: angle });
	$elem.trigger("change", [ options.min + (angle+135) / 270 * (options.max -  options.min) ]);
}
/*

Utils


© Guillaume Gonnet
License GPLv2

*/




// Noise

var ImprovedNoise = function () {

	var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
		 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
		 174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
		 133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
		 89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
		 202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
		 248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
		 178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
		 14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,
		 93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

	for (var i=0; i < 256 ; i++) {

		p[256+i] = p[i];

	}

	function fade(t) {

		return t * t * t * (t * (t * 6 - 15) + 10);

	}

	function lerp(t, a, b) {

		return a + t * (b - a);

	}

	function grad(hash, x, y, z) {

		var h = hash & 15;
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);

	}

	return {

		noise: function (x, y, z) {

			var floorX = ~~x, floorY = ~~y, floorZ = ~~z;

			var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;

			x -= floorX;
			y -= floorY;
			z -= floorZ;

			var xMinus1 = x -1, yMinus1 = y - 1, zMinus1 = z - 1;

			var u = fade(x), v = fade(y), w = fade(z);

			var A = p[X]+Y, AA = p[A]+Z, AB = p[A+1]+Z, B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;

			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), 
							grad(p[BA], xMinus1, y, z)),
						lerp(u, grad(p[AB], x, yMinus1, z),
							grad(p[BB], xMinus1, yMinus1, z))),
					lerp(v, lerp(u, grad(p[AA+1], x, y, zMinus1),
							grad(p[BA+1], xMinus1, y, z-1)),
						lerp(u, grad(p[AB+1], x, yMinus1, zMinus1),
							grad(p[BB+1], xMinus1, yMinus1, zMinus1))));

		}
	}
}







// Animation Frame

var vendors = ['ms', 'moz', 'webkit', 'o'];

for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}







// Parse Time

function parseTime(time) {
	
	var min = Math.floor(time / 60),
		sec = Math.floor(time - min * 60);

	return ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);
}







// Math

Math.randIn = function(min, max) {
	return Math.floor( Math.random() * (max-min+1) + min);
}
/*

Sortable list


© Guillaume Gonnet
License GPLv2

*/




// Namespace
var Sortable = {};




Sortable.create = function(obj, container) {

	var $currentItem = null;
	var currentItem = null;

	var $clone = null;

	var $holder = null;
	var holder = null;
	var lastElementHover = null;


	var start = { x: 0, y: 0 };

	var offset = { x: 0, y: 0 };

	var h = 0, w = 0;

	var $container = $(container);






	// Mouse move

	function mousemove(e) {

		TweenMax.set($clone, { x: e.clientX - offset.x, y: e.clientY - offset.y });


		var holderVisible = false;


		$container.children().each(function(index, el) {
			
			var $this = $(this),
				o = $this.offset();

			if (e.clientX > o.left && e.clientX <= o.left + w &&
				e.clientY > o.top && e.clientY <= o.top + h) {

				//console.log($this.text());


				if (this == currentItem)
					return false;


				if (this == holder) {
					holderVisible = true;
					return false;
				}



				var next = $this.next()[0],
					prev = $this.prev()[0];

				if (e.clientY >= o.top + (h / 2)) {
					holderVisible = (next != currentItem);

					if (next == currentItem || next == holder)
						return false;

					$this.after($holder.remove());
					//TweenMax.from($holder, .6, { height: 0 });
				}



				else if (e.clientY < o.top + (h / 2)) {
					holderVisible = (prev != currentItem);

					if (prev == currentItem || prev == holder)
						return false;

					$this.before($holder.remove());
					//TweenMax.from(holder, .6, { height: 0 });
				}



				lastElementHover = this;
				holderVisible = true;

				return false;
			}
		});




		if (!holderVisible)
			$holder.remove();

	}








	// Mouse Up

	function mouseup() {

		$(window).unbind('mousemove', mousemove);
		$(window).unbind('mouseup', mouseup);


		if (jQuery.contains(document, holder)) {

			var li = $songsContainer.children('.song:not(.holder)').index($currentItem);

			$currentItem.detach();
			$holder.replaceWith($currentItem);

			$holder.remove();

			if (obj.onSortableChange)
				obj.onSortableChange(li, $songsContainer.children('.song').index($currentItem));
		}


		$currentItem = null;
		$clone.remove();
	}









	// Mouse a child of the container

	obj.move = function(item, e) {

		if ($currentItem)
			return;


		$currentItem = $(item);
		currentItem = $currentItem[0];

		$clone = $currentItem.clone();

		$clone.addClass('clone');
		$clone.width($currentItem.width());
		$clone.height($currentItem.height());


		$holder = $currentItem.clone().empty().addClass('holder');
		holder = $holder[0];


		start.x = e.clientX;
		start.y = e.clientY;

		offset.x = e.clientX - $currentItem.offset().left;
		offset.y = e.clientY - $currentItem.offset().top;

		w = $currentItem.outerWidth();
		h = $currentItem.outerHeight();


		$(window).bind('mousemove', mousemove);
		$(window).bind('mouseup', mouseup);

		$('body').append($clone);
		TweenMax.set($clone, { x: e.clientX - offset.x, y: e.clientY - offset.y });
	};



};
/*

Translation French/English


© Guillaume Gonnet
License GPLv2

*/


var language = navigator.browserLanguage || navigator.language;



// Namespace
var Translation = {};


if (language.indexOf('fr') > -1)
	Translation.lang = 'fr';
else
	Translation.lang = 'en';



var t = Translation.get = function(name) {
	return Translation[Translation.lang][name] || '';
};




Translation['en'] = {

	'incompatible file': 'Sorry, this file is incompatible',
	
	'cant read file': 'Sorry, impossible to read this file',

	'drop music here': 'Drop your music files here',

	'general options': 'General options',

	'manage playlist': 'Manage the playlist',

	'end editing': 'End editing',

	'show title': 'Show title',

	'help songs': 'Drop a music file in the page or open the Source Menu (move your mouse on the left).',

	'none': 'None',

	'help': 'Help and Infos',

	'shortcuts': 'Shortcuts',

	'space': 'Space',

	'author': 'Author',

	'enabled': 'Enabled',

	'disenabled': 'Disenabled'

};



Translation['fr'] = {

	'incompatible file': 'Désolé, ce fichier est imcompatible',
	
	'cant read file': 'Désolé, impossible de lire ce fichier',

	'drop music here': 'Déposez vos musiques ici',

	'general options': 'Options générales',

	'manage playlist': 'Modifier la playlist',

	'end editing': 'Fin de la modification',

	'show title': 'Afficher le titre',

	'help songs': 'Déposez une musique dans cette page ou ouvrez le "Source Menu" (déplacez votre souris sur la gauche).',

	'none': 'Aucune',

	'help': 'Aide et Infos',

	'shortcuts': 'Raccourcis',

	'space': 'Espace',

	'author': 'Auteur',

	'enabled': 'Activé',

	'disenabled': 'Désactivé'

};





// Replace in HTML
$('.tr').each(function() {
	$(this).text(Translation.get($(this).text()));
});
/*

Beat Detector
http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/


© Guillaume Gonnet
License GPLv2

*/



(function() {


	window.BeatDetector = {};



	BeatDetector.run = function(obj) {

		if (typeof OfflineAudioContext == "undefined" || !obj.buffer)
			return false;
		

		// Create offline context
		var offlineContext = new OfflineAudioContext(1, obj.buffer.length, obj.buffer.sampleRate);

		// Create buffer source & filter
		var source = offlineContext.createBufferSource();
		source.buffer = obj.buffer;

		var filter = offlineContext.createBiquadFilter();
		filter.type = "lowpass";

		source.connect(filter);
		filter.connect(offlineContext.destination);


		// Start & render
		source.start(0);
		offlineContext.startRendering();


		// Act on the result
		offlineContext.oncomplete = function(e) {

			var filteredBuffer = e.renderedBuffer;

			var peaks,
				initialThresold = 0.9,
				thresold = initialThresold,
				minThresold = 0.3,
				minPeaks = 30;

			do {
				peaks = getPeaksAtThreshold(e.renderedBuffer.getChannelData(0), thresold);
				thresold -= 0.05;
			} while (peaks.length < minPeaks && thresold >= minThresold);


			var intervals = countIntervalsBetweenNearbyPeaks(peaks);
			var groups = groupNeighborsByTempo(intervals, filteredBuffer.sampleRate);

			if (groups.length == 0)
				return;
			

			var top = groups.sort(function(intA, intB) {
				return intB.count - intA.count;
			}).splice(0, 5);


			var dt = 60 / top[0].tempo;

			obj.bpm = {
				tempo: top[0].tempo,
				dt: dt,
				start: (top[0].start / filteredBuffer.sampleRate) % dt
			};
			
		};

	}




	
	// Function to identify peaks

	function getPeaksAtThreshold(data, threshold) {
		var peaksArray = [];
		var length = data.length;
		
		for(var i = 0; i < length;) {
			if (data[i] > threshold) {
				peaksArray.push(i);
				// Skip forward ~ 1/4s to get past this peak.
				i += 10000;
			}
			i++;
		}

		return peaksArray;
	}





	// Function used to return a histogram of peak intervals

	function countIntervalsBetweenNearbyPeaks(peaks) {
		var intervalCounts = [];
		
		peaks.forEach(function(peak, index) {
			
			for (var i = 0; i < 10; i++) {
				var interval = peaks[index + i] - peak;
				var foundInterval = intervalCounts.some(function(intervalCount) {
					if (intervalCount.interval === interval)
						return intervalCount.count++;
				});

				if (!foundInterval) {
					intervalCounts.push({
						interval: interval,
						count: 1,
						start: peak
					});
				}
			}
		});

		return intervalCounts;
	}





	// Function used to return a histogram of tempo candidates

	function groupNeighborsByTempo(intervalCounts, sampleRate) {
		var tempoCounts = [];
		
		intervalCounts.forEach(function(intervalCount, i) {
			
			if (intervalCount.interval !== 0) {
				// Convert an interval to tempo
				var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );

				// Adjust the tempo to fit within the 90-180 BPM range
				while (theoreticalTempo < 90) theoreticalTempo *= 2;
				while (theoreticalTempo > 180) theoreticalTempo /= 2;

				theoreticalTempo = Math.round(theoreticalTempo);
				var foundTempo = tempoCounts.some(function(tempoCount) {
					if (tempoCount.tempo === theoreticalTempo)
						return tempoCount.count += intervalCount.count;
				});

				if (!foundTempo) {
					tempoCounts.push({
						tempo: theoreticalTempo,
						count: intervalCount.count,
						start: intervalCount.start
					});
				}
			}
		});

		return tempoCounts;
	}



})();
/*

Main File

© Guillaume Gonnet
License GPLv2

*/




// Window size

var wHeight = 0, wWidth = 0;

function resize(e) {

	wHeight = $(window).height();
	wWidth = $(window).width();
}


$(window).resize(resize);
resize();




// Dancer

var dancer = new Dancer(),
	adapter = dancer.audioAdapter;
		




// Event keydown

$(window).keydown(onKeyDown);

function onKeyDown(e) {

	if ($("input:focus").length)
		return;

	if (e.keyCode == 38) {
		FFTManager.prev();
	}

	else if (e.keyCode == 40) {
		FFTManager.next();
	}

	else if (e.keyCode == 32) { // Space
		$("#switch").trigger("click");
	}

	else if (e.keyCode == 69) { // E
		EQMenu.switch();
	}

	else if (e.keyCode == 79) { // O
		FFTMenu.switch();
	}

	else if (e.keyCode == 77) { // O
		MusicMenu.switch();
	}
}






// Events Window

function onMouseMove(e) {
	
	// Control Menu

	if (ControlsMenu.opened && e.pageX < wWidth - 255)
		ControlsMenu.close();

	else if (!ControlsMenu.opened && e.pageX > wWidth - 100)
		ControlsMenu.open();



	// Menus on the left

	else if (!Menus.isOneVisible && e.pageX < 100)
		ListMenu.open();

	else if (Menus.isOneVisible && e.pageX > 250)
		Menus.hideAll();
}


$(window).mousemove(onMouseMove);
/*

Player


© Guillaume Gonnet
License GPLv2

*/



// Namespace
var Player = {};

Player.current = 0;

Player.mode = 'next';






// Commands

Player.play = function(index) {

	if (typeof index == 'undefined' && Player.current)
		return dancer.play();


	if (!Playlist.songs.length)
		return;


	if (typeof index == 'object')
		index = Playlist.songs.indexOf(index) + 1;

	if (index <= 0 || typeof index == 'string' || (!Player.current && !index))
		index = 1;


	Player.current = index;


	dancer.pause();
	dancer.setTime(0);
	dancer.audioAdapter = adapter = Playlist.getAdapter(Player.current);
	dancer.play();

}



Player.pause = function() {

	dancer.pause();
}



Player.stop = function() {

	dancer.pause();
	FFTManager.resetAll();

	dancer.setTime(0);
	dancer.trigger('pause');
}




Player.next = function() {

	if (Player.current < Playlist.songs.length)
		Player.play(Player.current + 1);
};


Player.last = function() {

	if (Player.current > 1)
		Player.play(Player.current - 1);
};







// Crossfade

(function() {

	var CF = window.Player.Crossfade = {};

	var active = false;

	CF.time = 5;


	var prevAdapter = null;
	var fakeEvents = {};

	var fakeDancer = { trigger: function(n) {
		fakeEvents[n] && fakeEvents[n]();
	} };


	function run() {

		if (prevAdapter)
			return;

		var i = Playlist.getNextIndex();
		if (!i) return;

		Player.current = i;


		var adpt = Playlist.getAdapter(i, true);

		adpt.eq.gain.gain.linearRampToValueAtTime(0, 0);
		adpt.eq.gain.gain.linearRampToValueAtTime(1, CF.time * 1.5);

		adapter.eq.gain.gain.linearRampToValueAtTime(1, adapter.context.currentTime);
		adapter.eq.gain.gain.linearRampToValueAtTime(0, adapter.context.currentTime + CF.time);


		adpt.play();

		adapter.dancer = fakeDancer;
		prevAdapter = adapter;

		adapter = adpt;
		dancer.audioAdapter = adapter;

		dancer.trigger('play');
	}


	fakeEvents.end = function() {
		prevAdapter = null;
	};


	function update() {

		if (!active) return;

		if (dancer.getDuration() - dancer.getTime() <= CF.time)
			run();
	}



	CF.on = function() {
		active = true;
	};


	CF.off = function() {
		active = false;
	};


	//CF.on();
	dancer.bind("update", update);

})();






// Events

dancer.bind("end", function() {

	if (Player.mode == 'next')
		Player.next();
});
/*

Playlist


© Guillaume Gonnet
License GPLv2

*/






// jQuery

var $songsContainer = $('#songs'),
	$helpSongs = $('#helpSongs');




// Namespace
var Playlist = {};

Playlist.songs = [];







// Get obj by index
Playlist.get = function(index) {

	index = index || Player.current;

	if (typeof index == "number")
		return Playlist.songs[ (index || Player.current) - 1];
	else
		return index;
}


Playlist.getNextIndex = function() {

	if (typeof Player.current != "number")
		return 0;

	if (Player.current < Playlist.songs.length)
		return Player.current + 1;
	else
		return 0;
}









// Get the adapter

Playlist.getAdapter = function(index, other) {

	other = other || false;

	var obj = typeof index == 'number' ? Playlist.get(index) : index,
		adpt = null;


	if (obj.crossDomain) {

		if (!(adapter instanceof Dancer.adapters.crossDomain) || other)
			adpt = new Dancer.adapters.crossDomain(dancer);
		else
			adpt = adapter;

		adpt.load(obj.audio);
	}


	else if (obj.type == 'buffered') {

		if (!(adapter instanceof Dancer.adapters.audiobuffer) || other)
			adpt = new Dancer.adapters.audiobuffer(dancer);
		else
			adpt = adapter;

		adpt.buffer = obj.buffer;

	}


	else if (obj.type == 'url' || obj.audio) {

		if (!(adapter instanceof Dancer.adapters.http) || other)
			adpt = new Dancer.adapters.http(dancer);
		else
			adpt = adapter;

		adpt.load(obj);
	}


	return adpt;
}











// Add a music to the playlist

Playlist.add = function(obj) {

	$helpSongs.hide();


	// Create the elements in the menu
	var $elem = $('<div class="song"></div>'),
		$name = $('<p class="name">' + obj.name + '</p>'),
		$duration = $('<p class="duration"></p>'),
		$del = $('<p class="del">x</p>');


	// Loader
	var $loader = $('<div class="loader1"></div>');
	for (var i = 1; i < 9; i++)
		$loader.append('<div class="rotateG_0'+i+'"></div>');


	$songsContainer.append($elem.append([ $name, $loader, $duration, $del ]));





	// Create the song object

	var song = {
		type: 'none',
		duration: 0,
		name: obj.name,
		elem: $elem,
		loaded: false,
		bpm: null,
		crossDomain: !!obj.crossDomain
	};


	


	// If the song if buffered
	if (obj.type == 'buffered' || obj.buffer) {
		
		song.type = 'buffered';
	}


	// If the song is an Audio object
	else if (obj.type == 'url' || obj.audio) {
		
		song.type = obj.type || 'url';
		song.audio = obj.audio;
	}


	Playlist.update(song);
	Playlist.songs.push(song);


	// Delete
	var down = false;

	$del.mousedown(function(e) {
		e.stopPropagation();
		down = true;
	});

	$del.mouseup(function(e) {
		e.stopPropagation();

		if (down)
			Playlist.remove(song);

		down = false;
	});


	return song;
}












// Update the song object

Playlist.update = function(song) {


	// Remove the loader and make the song clickable
	function loadComplete() {
		
		var $elem = song.elem;

		$elem.find('.loader1').remove();
		$elem.find('.duration').text(parseTime(song.duration));

		song.loaded = true;


		$elem.click(function() {
			
			if (ControlsMenu.mode == 'normal')
				Player.play(song);
		});
		//event.stopImmediatePropagation(

		$elem.mousedown(function(e) {
			
			if (ControlsMenu.mode == 'edit')
				ControlsMenu.move(this, e);
		});

	}



	// Music not load yet but can be played
	var loadPartial = loadComplete;


	// Music loaded
	function partialEnd() {
		if (!song.loaded) loadComplete();
	}




	// The song is buffered
	if (song.type == 'buffered') {

		if (!song.buffer)
			return;

		song.duration = song.buffer.duration;
		BeatDetector.run(song);
		loadComplete();
	}


	// The song is an Audio object
	else if (song.type == 'url' || song.audio) {

		var audio = song.audio,
			callback = function() { Playlist.update(song); };

		song.duration = song.audio.duration;

		if (audio.readyState < 3 && !audio.oncanplay) {
			audio.oncanplay = callback;
		}

		else if (audio.readyState == 3 && !audio.onloadeddata) {
			audio.oncanplay = null;
			audio.onloadeddata = callback;
			loadPartial();
		}

		else {
			audio.onloadeddata = audio.oncanplay = null;
			partialEnd();
		}
	}

}











// Remove from the playlist
Playlist.remove = function(i) {

	if (typeof i == 'object')
		i = Playlist.songs.indexOf(i);

	if (i == -1)
		return;


	if (i + 1 == Player.current) {
		Player.stop();
		Player.current = 0;
	}



	var obj = Playlist.songs[i];


	delete obj.buffer;

	obj.elem.remove();

	if (obj.type == 'blob')
		URL.revokeObjectURL(obj.audio.src);


	Playlist.songs.splice(i, 1);
}

/*

Manager of FFTs

© Guillaume Gonnet
License GPLv2

*/



var FFTManager = [];

FFTManager.current = 0;



// Get the current visualisation
FFTManager.get = function() {
	return FFTManager[FFTManager.current];
}



FFTManager.set = function(index) {

	if (index < 0 || index >= FFTManager.length)
		return;

	$("#fft" + FFTManager.current).hide();
	$("#fft" + index).show();

	if (FFTManager[FFTManager.current].off)
		FFTManager[FFTManager.current].off();

	if (FFTManager[index].on)
		FFTManager[index].on();

	FFTManager.current = index;
}



FFTManager.prev = function() {

	FFTManager.set(FFTManager.current <= 0 ? FFTManager.length - 1 : FFTManager.current - 1);
}



FFTManager.next = function() {
	
	FFTManager.set(FFTManager.current >= FFTManager.length - 1 ? 0 : FFTManager.current + 1);
}




FFTManager.resetAll = function() {
	
	for (var i = 0; i < FFTManager.length; i++) {
		
		if (FFTManager[i].reset)
			FFTManager[i].reset();
	}
}




FFTManager.update = function() {
	FFTManager[FFTManager.current].update();
}



FFTManager.onPlay = function() {
	
	if (FFTManager[FFTManager.current].onPlay)
		FFTManager[FFTManager.current].onPlay();
}

FFTManager.onPause = function() {
	
	if (FFTManager[FFTManager.current].onPause)
		FFTManager[FFTManager.current].onPause();
}





FFTManager.onKick = function() {
	
	if (FFTManager[FFTManager.current].onKick)
		FFTManager[FFTManager.current].onKick();
}

FFTManager.offKick = function() {
	
	if (FFTManager[FFTManager.current].offKick)
		FFTManager[FFTManager.current].offKick();
}



FFTManager.onResize = function() {
	
	for (var i = 0; i < FFTManager.length; i++) {
		
		if (FFTManager[i].onResize)
			FFTManager[i].onResize(wHeight, wWidth);
	}
}




// Events

dancer.bind("update", FFTManager.update);
dancer.bind("play", FFTManager.onPlay);
dancer.bind("pause", FFTManager.onPause);

$(window).resize(FFTManager.onResize);




// Kick
/*
kick = dancer.createKick({

	onKick: FFTManager.onKick,

	offKick: FFTManager.offKick,
	
	decay: 0.02,
	threshold: 0.25,
	frequency: [0,10]

}).on();
*/
/*

Beat


© Guillaume Gonnet
License GPLv2

*/



// BPM

(function() {

	window.BPM = {};

	var active = false,
		index = 0,
		dt, start;


	BPM.on = function() {
		active = true;
		dancer.bind("update", update);
	}

	BPM.off = function() {
		active = false;
		dancer.unbind("update", update);
	}



	function onPlay() {
		var song = Playlist.get();
		dt = 0;

		if (!song.bpm)
			return;
		
		dt = song.bpm.dt;
		start = song.bpm.start;
		index = 0;
	}


	function update() {
		if (!active || !dt)
			return;

		var time = dancer.getTime() + start;

		var ni = Math.floor(time / dt);
		if (ni != index) {
			FFTManager.onKick();
			index = ni;
		}
		else {
			FFTManager.offKick();
		}
	}


	dancer.bind("play", onPlay);

})();





// Kick

var Kick = dancer.createKick({

	onKick: FFTManager.onKick,

	offKick: FFTManager.offKick,
	
	decay: 0.02,
	threshold: 0.25,
	frequency: [0,10]

}).on();




/*

Menus

*/




// Class menu

function Menu(elem) {

	this.elem = elem;
	this.isVisible = false;

	TweenMax.set(elem, { x: -260, display: "block" });

	Menus.push(this);
}



// Open the menu
Menu.prototype.show = function() {
	Menus.hideAll();
	TweenMax.to(this.elem, .7, { x: 0, onComplete: this.onShowEnd  });
	
	this.isVisible = true;

	this.onShow && this.onShow();
}



// Close the menu
Menu.prototype.hide = function() {
	TweenMax.to(this.elem, .7, { x: -260, onComplete: this.onHideEnd });

	this.isVisible = false;

	this.onHide && this.onHide();
}



// Show/hide
Menu.prototype.switch = function() {
	
	if (this.isVisible)
		this.hide();
	else
		this.show();
}







// Array of all menus

var Menus = [];


Menus.hideAll = function() {

	for (var i = 0; i < Menus.length; i++)
		Menus[i].hide();

	Menus.isOneVisible = false;
};


Menus.isOneVisible = false;







// List of menus on the left

var $listMenu = $('#listMenu');

var ListMenu = new Menu($listMenu);


ListMenu.open = function() {

	for (var i = 0; i < Menus.length; i++) {
		
		if (Menus[i].isVisible)
			break;
	}

	if (i == Menus.length)
		ListMenu.show();

	Menus.isOneVisible = true;
}




$listMenu.find('.a-btn').click(function() {

	var menu = $(this).attr('data-menu');

	if (!(window[menu] instanceof Menu))
		return;

	window[menu].show();
	ListMenu.hide();

});
/*

Source Menu

*/



(function() {

	var $menu = $("#sourceMenu"),

		$choices = $("#sourceChoices"),
		$SC = $("#sourceSoundcloud");




	// Soundcloud

	$("#btnSrcSC").click(function() {

		$choices.hide();
		$SC.show();

	});



	$SC.find("input[type=text]").keyup(function(e) {

		if (e.keyCode != 13)
			return;

		$SC.find('div').remove();


		Soundcloud.search($(this).val(), function(tracks) {

			tracks.splice(6, 50);

			tracks.forEach(function(e) {

				if (!e.stream_url)
					return;

				var $div = $(document.createElement('div')),
					$h6 = $('<h6>' + e.title + '</h6>'),
					$small = $('<small>Time: ' + e.duration + '</small>');

				$div.append([ $h6, $small ]);

				$div.click(function() {
					Soundcloud.stream(e.stream_url, e.title);
				});

				$SC.append($div);

			});

		});
	});




	// Micro

	$('#btnSrcMicro').click(function() {

		setTimeout(function() {
			$("#volume").knob(0);
		}, 1300);
	
		EQMenu.show();

		Microphone.play();
	});



	// Menu

	var menu = new Menu($menu);

	menu.onHideEnd = function() {

		$SC.hide();

		$choices.show();
	}


	window.SourceMenu = menu;

})();

/*

OptionsFFT

© Guillaume Gonnet
License GPLv2

*/


(function() {


	// Beat

	$('input[type=radio][name=beat]').change(function() {
		
		Kick.off();
		BPM.off();

		if (this.value == "kick")
			Kick.on();

		else if (this.value == "beatdetector")
			BPM.on();

	});







	// FFT Options

	var $container = $('#fftOptions');
	
	function setFFTOption() {

		$container.children().remove();

		var fft = FFTManager.get();

		if (!fft.options) {
			$container.append($('<p class="info">' + t('none') + '</p>'));
			return;
		}



		for (var i = 0, l = fft.options.length; i < l; i++) {
			var o = fft.options[i];

			switch (o.type) {

				case "checkbox":
					var $elem = $('<input type="checkbox">');

					if (o.checked)
						$elem.attr('checked', 'true');

					$elem.change(function() {
						o.checked = $(this).is(":checked");
						o.onChange(o.checked);
					});

					$container.append([ $elem, $('<label>' + o.text + '</label>') ]);
					break;


			}
		}

	}




	// Menu

	var $menu = $("#optionsFFT"),
		$btn = $("#btnFFT");

	
	var menu = new Menu($menu);
	menu.onShow = setFFTOption;


	$btn.click(function() {
		menu.switch();
	});



	window.FFTMenu = menu;

})();
/*

Menu de l'equalizer

*/



(function() {


	$("#volume").knob({ name: "Volume" }).change(function(e, value) {
		dancer.eq.setGain(value);
	});


	$("#highGain").knob({ name: "High" }).change(function(e, value) {
		dancer.eq.setHighGain(value);
	});


	$("#midGain").knob({ name: "Mid" }).change(function(e, value) {
		dancer.eq.setMidGain(value);
	});


	$("#lowGain").knob({ name: "Low" }).change(function(e, value) {
		dancer.eq.setLowGain(value);
	});





	// Menu

	var $menu = $("#eq"),
		$btn = $("#btnEQ");


	var menu = new Menu($menu);

	$btn.click(function() {
		menu.switch();
	});


	window.EQMenu = menu;

})();

/*

Menu de l'equalizer

*/



(function() {

	var $menu = $("#musicMenu"),
		$btn = $("#btnMusic");

	var $selectTempo = $("#musicTempo"),
		$radioCF = $('input[type=radio][name=crossfade]'),
		$radioStorage = $('input[type=radio][name=storage]');


	var menu = new Menu($menu);





	// Tempo

	menu.currentTempo = 1;

	function apllyTempo() {

		if (adapter.audioNode && adapter.audioNode.playbackRate !== undefined)
			adapter.audioNode.playbackRate.value = menu.currentTempo;

		else if (adapter.audio && adapter.audio.playbackRate !== undefined)
			adapter.audio.playbackRate = menu.currentTempo;

		adapter.lastPlaybackRate = menu.currentTempo;;
	}

	dancer.bind('play', apllyTempo);


	$selectTempo.change(function() {
		menu.currentTempo = parseFloat($(this).val());
		apllyTempo();
	});





	// Crossfade

	$radioCF.change(function() {
		
		if (this.value == "true")
			Player.Crossfade.on();
		else
			Player.Crossfade.off();
	});




	// Storage

	menu.storage = "auto";

	$radioStorage.change(function() {
		
		menu.storage = this.value;
	});




	$btn.click(function() {
		menu.switch();
	});


	menu.onHide = function() {
		$selectTempo.blur();
	};


	window.MusicMenu = menu;

})();
/*

Help Menu

*/



(function() {

	var $menu = $("#help"),
		$btn = $("#helpBtn");


	var menu = new Menu($menu);


	$btn.click(function() {
		menu.switch();
	});


	window.HelpMenu = menu;

})();

/*

Menus


© Guillaume Gonnet
License GPLv2

*/



// JQuery

var $controlMenu = $('#menu');





// Namespace
var ControlsMenu = {};

ControlsMenu.opened = false;




// Open the menu
ControlsMenu.open = function() {

	TweenMax.to($controlMenu, 1, { x: 0 });
	ControlsMenu.opened = true;
};




// Close the menu
ControlsMenu.close = function() {
	
	TweenMax.to($controlMenu, 1, { x: 260 });
	ControlsMenu.opened = false;
};











// HTML Controls

var $progress = $("#progress div"), 
	$temps1 = $("#temps span:eq(0)"), 
	$temps2 = $("#temps span:eq(1)");

var timer = null;


$("#switch").click(function() {

	if (dancer.isPlaying())
		Player.pause();
	else
		Player.play();
});


$("#progress").click(function(e) {
	dancer.setTime((e.pageX - $(this).offset().left) * dancer.getDuration() / 200);
	dancerUpdate();
});


$("#stop").click(Player.stop);




$("#next").click(Player.next);

$("#last").click(Player.last);











// Dancer events


function dancerUpdate() {

	if (dancer.getDuration())
		$progress.css("left", (dancer.getTime() * 200 / dancer.getDuration()) + "px");
	else
		$progress.css("left", 0);

	$temps1.text(parseTime(dancer.getTime()));
}


dancer.bind("play", function() {

	$("#play").hide();
	$("#pause").show();

	timer = setInterval(dancerUpdate, 1000 / 30);
	$temps2.text(parseTime(dancer.getDuration()));
});



dancer.bind("pause", function() {

	$("#pause").hide();
	$("#play").show();
	
	clearInterval(timer);
	dancerUpdate();
});


dancer.bind("end", function() {
	FFTManager.resetAll();
	dancerUpdate();
});











// Playlist manager


ControlsMenu.mode = 'normal';


// Mode: edit the playlist
ControlsMenu.editMode = function() {

	$songsContainer.addClass('edit');
	ControlsMenu.mode = 'edit';

	$('#managePlayBtn').text(t('end editing'));
};




// Mode: normal (play songs)
ControlsMenu.normalMode = function() {

	$songsContainer.removeClass('edit');
	ControlsMenu.mode = 'normal';

	$('#managePlayBtn').text(t('manage playlist'));
};





// Button
$('#managePlayBtn').click(function() {

	if ($songsContainer.hasClass('edit'))
		ControlsMenu.normalMode();
	else
		ControlsMenu.editMode();

});






// Create a sortable list
Sortable.create(ControlsMenu, $songsContainer);



// When the playlist change
ControlsMenu.onSortableChange = function(li, ni) {

	var s = Playlist.songs[li];

	Playlist.songs.splice(li, 1);
	Playlist.songs.splice(ni, 0, s);


	console.log(Player.current, li + 1, ni + 1);

	if (Player.current == li + 1)
		Player.current = ni + 1;
};
/*

Decoder Access

*/



if (!window.Decoder)
	var Decoder = {};




// Decode an audio file

Decoder.decodeAudioData = function(buffer, callback, error) {

	if (!!window.Worker) {

		var worker = new Worker("js/worker.js");

		worker.onmessage = function(e) {

			worker.terminate();
			worker = null;

			var d = e.data;

			if (d.type == 'error')
				return error(d.text);

			callback(Decoder.convertToAudioBuffer(d.buf, d.format, d.offset));
		}


		worker.postMessage({
			buffer: buffer
		});


	} else {

		if (!Decoder.decode)
			return error();

		// If Decoder exist without worker, run it
		Decoder.decode(buffer, function(buf, format, offset) {
			callback(Decoder.convertToAudioBuffer(buf, format, offset));
		}, error);

	}

}






// Create Audio Buffer
Decoder.convertToAudioBuffer = function(buf, format, offset) {
	

	var count = format.channelsPerFrame;

	var audioBuffer = adapter.context.createBuffer(format.channelsPerFrame, offset / count, format.sampleRate);

	
	for (var channel = 0; channel < count; channel++) {
		var nowBuffering = audioBuffer.getChannelData(channel);
		
		for (var i = 0; i < audioBuffer.length; i++)
			nowBuffering[i] = buf[i * count + channel];
	}

	return audioBuffer;
}
/*

Manage drops of music file


© Guillaume Gonnet
License GPLv2

*/




// Namespace
var DropMusic = {};



// JQuery
var $dropHelp = $("#dropMusic");
var $songsContainer = $("#songs");




// Drop Events

var dragging = 0;


$(window).bind("dragenter", function(e) {
	e.preventDefault();
	e.stopPropagation();

	dragging++;
	if (dragging == 1)
		$dropHelp.fadeIn();
});



$(window).bind("dragleave", function(e) {
	e.preventDefault();
	e.stopPropagation();

	dragging--;
	if (dragging == 0)
		$dropHelp.fadeOut();
});



$(window).bind("dragover", function (e) {
	e.preventDefault();
	e.stopPropagation();
});



window.addEventListener("drop", function (e) {
	e.preventDefault();
	e.stopPropagation();

	for (var i = 0; i < e.dataTransfer.files.length; i++)
		DropMusic.load(e.dataTransfer.files[i]);

	$dropHelp.fadeOut();

	dragging = 0;
}, false);













// Load a music file

DropMusic.load = function(file) {

	if (MusicMenu.storage == "buffered")
		return DropMusic.loadBufferd(file);

	else if (MusicMenu.storage == "blob")
		return DropMusic.loadBlob(file);


	var ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLocaleLowerCase();

	if (ext == 'flac')
		DropMusic.loadBufferd(file);
	else
		DropMusic.loadBlob(file);
};







// Create a blob with the file

DropMusic.loadBlob = function(file) {

	var audio = new Audio();
	audio.src = window.URL.createObjectURL(file);


	var song = Playlist.add({
		type: 'blob',
		name: file.name.substr(0, file.name.lastIndexOf('.')) || file.name,
		audio: audio
	});
};







// Read the file and store it in a buffer

DropMusic.loadBufferd = function(file) {


	var fr = new FileReader();


	var song = Playlist.add({
		type: 'buffered',
		name: file.name.substr(0, file.name.lastIndexOf('.')) || file.name
	});



	fr.onload = function(e) {
		
		var fileResult = e.target.result,
			fileResult2 = fileResult.slice(0);


		// Callback: add song to playlist
		function success(buffer) {

			fileResult = fileResult2 = null;

			song.buffer = buffer;

			Playlist.update(song);
		}
		

		// Use AudioContext.decodeAudioData to decode the file
		Dancer.context.decodeAudioData(fileResult, success, function() {

			// If AudioContext.decodeAudioData can't, try with js (for FLAC...)
			Decoder.decodeAudioData(fileResult2, success, function(e) {
				
				fileResult = fileResult2 = null;

				// Error
				Playlist.remove(song);
				alert(t('incompatible file'));
			});

		});


	};


	fr.onerror = function(e) {
		Playlist.remove(song);
		alert(t('cant read file'));
	};

	
	fr.readAsArrayBuffer(file);

};
/*

Get the microphone

*/



// Namespace
var Microphone = {};




// Play with the microphone

Microphone.play = function() {

	Player.current = {
		type: 'microphone',
		duration: 0,
		name: "Microphone",
		//elem: $elem,
		loaded: true
	};


	dancer.pause();
	dancer.setTime(0);

	dancer.audioAdapter = adapter = new Dancer.adapters.microphone(dancer);

	dancer.play();
};






// Stop the micropnone

Microphone.stop = function() {

	if (adapter instanceof Dancer.adapters.microphone)
		adapter.pause();
}
/*

Youtube Music
Work In Progress


© Guillaume Gonnet
License GPLv2

*/



// Namespace
var Youtube = {};


Youtube.ready = false;




// Youtube API


function showResponse(response) {
	console.log(response);

	Youtube.loadVideoId(response.items[0].id.videoId);
}





// Load API
function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}


// Connect to Google (key: http://goo.gl/PdPA1)
function onYouTubeApiLoad() {

	gapi.client.setApiKey('AIzaSyDspQ63svClEUotoAfyhAxqOOUVa5ejODQ');

	Youtube.ready = true;
}



Youtube.search = function(query) {

	var request = gapi.client.youtube.search.list({
		part: 'snippet',
		q: query
	});
	

	request.execute(onSearchResponse);

}

// Called automatically with the response of the YouTube API request.
function onSearchResponse(response) {
	showResponse(response);
}



function getYqlUrl(url) {
	return 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"') + '&format=json&callback=';
}



var audio;

// Youtube In MP3

Youtube.loadVideoId = function(id) {

	console.log('Load: '+ id);


	// YQL for cross domain

	var yimUrl = 'http://YoutubeInMP3.com/fetch/?api=advanced&format=JSON&video=http://www.youtube.com/watch?v=' + id,
		yql = getYqlUrl(yimUrl);

	$.get(yql, function(d) {

		var txt = d.query.results.body.p;

		if (txt) {

			try {
				var obj = JSON.parse(txt)
			} catch(e) {
				console.log('Erreur JSON :(');
				return;
			}

			var url = obj.link;

		}
		else {

			try {
				var url = d.query.results.body.div[1].div[1].a[0].href;
			} catch(e) {
				console.log('Erreur HTML :(');
				return;
			}

			$.get(getYqlUrl(url), function(d2) {
				console.log(d2);
			});

			console.log(url);
		}


		
		console.log(url);
	

		audio = new Audio(url);

		audio.oncanplay = function() {
			
			var i = Player.playlist.add({
				name: "Yolo",
				elem: $(''),
				audio: audio
			});

			Player.play(i);

		};
	});

};


/*

Use of the SoundCloud API


© Guillaume Gonnet
License GPLv2

*/


(function() {


	// The SoundCloud API is not loaded
	if (typeof SC == "undefined")
		return;


	// Namespace
	var Soundcloud = {};


	var id = "5e551e70a6f4fabda790ae5a43c10865";


	SC.initialize({
		client_id: id
	});



	Soundcloud.search = function(req, callback) {

		SC.get('/tracks', { q: req }, function(tracks) {
			
			console.log(tracks);

			callback(tracks);

			/*
			if (tracks.length && tracks[0].stream_url)
				Soundcloud.stream(tracks[0].stream_url, tracks[0].title);
			else
				console.log('Erreur: sound.stream_url');
			*/

		});

	};





	Soundcloud.load = function(url) {


		SC.get('/resolve', { url: url }, function(sound) {
			
			if (sound.errors) {
				console.log(sound.errors);
				return;
			}

			if (sound.kind == "playlist") {
				console.log('Erreur: playlist');
				self.sound = sound;
				self.streamPlaylistIndex = 0;
				self.streamUrl = function(){
					return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
				}
				return;
			}


			console.log(sound);

		
			if (sound.stream_url)
				Soundcloud.stream(sound.stream_url, sound.title);
			else
				console.log('Erreur: sound.stream_url');
			
		});
	};






	Soundcloud.stream = function(url, name) {

		var audio = new Audio();

		//audio.autoplay = true;
		//audio.preload = true;
		//audio.crossOrigin = "anonymous";

		audio.src = url + '?client_id=' + id;

		Playlist.add({
			name: name,
			audio: audio,
			crossDomain: true
		});

	};




	window.Soundcloud = Soundcloud;

})();
/*

FFT Visualisation barres

*/


(function() {


	var canvas = $("#fft0 canvas")[0],
		ctx = canvas.getContext('2d');

	ctx.fillStyle = "#666666";

	var h = 0, w = 0;
	var min = 0, max = 400;


	var $title = $("#fft0Title"),
		$bpm = $("#fft0BPM"),
		titleVisible = true;

	function showTitle(value) {
		titleVisible = value;

		if (value)
			$title.add($bpm).fadeIn();
		else
			$title.add($bpm).fadeOut();
	}


	function setTitle() {
		var song = Playlist.get();

		$title.text(song.name);

		if (song.bpm)
			$bpm.text(song.bpm.tempo + ' BPM');
		else
			$bpm.empty();
	}




	var fft = {

		onPlay: function() {
			setTitle();

			if (titleVisible)
				$title.add($bpm).fadeIn();
		},

		on: function() {
			setTitle();

			if (dancer.isPlaying() && titleVisible)
				$title.add($bpm).show();
		},


		onKick: function() {
			ctx.fillStyle = "#ff0077";
		},


		offKick: function() {
			ctx.fillStyle = "#666666";
		},


		update: function() {
			var spectrum = dancer.getSpectrum(),
				width = w * 0.9 / (max - min),
				height = h * 0.95 * 1.5,
				offsetX = w * 0.05,
				offsetY = h * 0.95;

			ctx.clearRect( 0, 0, w, h );
			for ( var i = min, l = spectrum.length; i < l && i < max; i++ ) {
				ctx.fillRect( offsetX + (i - min) * width, offsetY, width, -spectrum[ i ] * height);
			}
		},


		onResize: function(height , width) {
			canvas.height = h = height;
			canvas.width = w = width;
			fft.reset();
		},


		reset: function() {
			ctx.fillStyle = "#666666";
			ctx.clearRect( 0, 0, w, h );

			if (!dancer.isPlaying())
				$title.add($bpm).fadeOut();
		}
	};




	fft.options = [
		{
			type: "checkbox",
			text: t('show title'),
			onChange: showTitle,
			checked: true
		}
	];




	fft.onResize(wHeight, wWidth);

	FFTManager[0] = fft;

})();
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
/*

FFT 2

*/


(function() {

	var canvas = $("#fft2 canvas")[0],
		ctx = canvas.getContext('2d');


	var $img = $("#fft2 img"),
		$progress = $("#fft2Progress"),
		$point = $("#fft2Point"),
		$timeElapsed = $("#fft2TimeElapsed"),
		$timeLeft = $("#fft2TimeLeft");


	var angle = 0,
		imagesCount = 2,
		imageIndex = Math.randIn(0, imagesCount-1),
		isPlaying = false;



	$progress.click(function(e) {
		dancer.setTime((e.pageX - $(this).offset().left) * dancer.getDuration() / 700);
	});


	$img.load(function() {
		
		if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
			
			console.log('Invalid image: img' + index + '.jpg');
			nextImg();

		} else {

			$img.fadeIn();
		}
	});



	function nextImg() {

		imageIndex++;

		if (imageIndex > imagesCount)
			imageIndex = 1;

		$img.fadeOut();
		$img.attr('src', 'asset/img' + imageIndex + '.jpg');
	}


	function onKeyDown(e) {

		if (e.keyCode == 39 || e.keyCode == 37)
			nextImg();

	}



	function animate() {

		// Canvas

		angle = angle >= 2 ? 0 : angle + 1 / 60;

		ctx.clearRect(0, 0, 40, 40);

		ctx.fillStyle = "#E67D7D";
		ctx.beginPath();
		ctx.arc(20 ,20 ,10 ,0, 2*Math.PI);
		ctx.fill();

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#E67D7D';

		ctx.beginPath();
		ctx.arc(20 ,20 ,13 , angle * Math.PI, angle * Math.PI + 3 * Math.PI / 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(20 ,20 ,13 , angle * Math.PI +  Math.PI, angle * Math.PI + 7 * Math.PI / 4);
		ctx.stroke();



		// HTML

		$point.css("left", (dancer.getTime() * 700 / dancer.getDuration()) + "px");
		$timeElapsed.text(parseTime(dancer.getTime()));
		$timeLeft.text(parseTime(dancer.getDuration() - dancer.getTime()));



		if (isPlaying)
			requestAnimationFrame(animate);

	}


	nextImg();
	animate();




	var fft = {

		onPlay: function() {
			
			if (!isPlaying)
				requestAnimationFrame(animate);

			isPlaying = true;
		},


		onPause: function() {
			isPlaying = false;
			cancelAnimationFrame(animate);
		},


		on: function() {
			$(window).bind('keydown', onKeyDown);
			isPlaying = dancer.isPlaying();
			requestAnimationFrame(animate);
		},

		off: function() {
			$(window).unbind('keydown', onKeyDown);
			isPlaying = false;
		},


		update: function() {
			
		},


		onResize: function(height , width) {
			fft.reset();
		},


		reset: function() {
			
		}
	};



	fft.onResize(wHeight, wWidth);

	FFTManager[2] = fft;

})();
/*

FFT 3
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