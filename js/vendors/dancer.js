/*
 * dancer - v0.8.0 - 2015-07-25
 * https://github.com/jsantell/dancer.js
 * Copyright (c) 2015 Jordan Santell & Guillaume Gonnet
 * Licensed MIT
 */
(function() {

	var context = window.AudioContext ?
		new window.AudioContext() :
		new window.webkitAudioContext();


	var Dancer = function () {

		// Compressor
		this.compressor = context.createDynamicsCompressor();
		this.compressor.connect( context.destination );


		// Equalizer
		this.eq = new Dancer.EQ( context );
		this.eq.connect( this.compressor );


		// First adapter
		this.audioAdapter = Dancer._getAdapter( this );


		this.events = {};
		this.sections = [];

		this.bind( 'update', update );
	};



	Dancer.version = '0.7.0';
	
	Dancer.adapters = {};

	Dancer.context = context;


	Dancer.prototype = {

		load : function ( source ) {
			var path;

			// Loading an Audio element
			if ( source instanceof HTMLElement ) {
				this.source = source;
				if ( Dancer.isSupported() === 'flash' ) {
					this.source = { src: Dancer._getMP3SrcFromAudio( source ) };
				}

			// Loading an object with src, [codecs]
			} else {
				this.source = window.Audio ? new Audio() : {};
				this.source.src = Dancer._makeSupportedPath( source.src, source.codecs );
			}

			this.audio = this.audioAdapter.load( this.source );
			return this;
		},



		/* Controls */

		play : function () {
			this.audioAdapter.play();
			return this;
		},

		pause : function () {
			this.audioAdapter.pause();
			return this;
		},

		setVolume : function ( volume ) {
			this.audioAdapter.setVolume( volume );
			return this;
		},

		setTime : function ( val ) {
			this.audioAdapter.setTime( val );
			return this;
		},



		/* Actions */

		createKick : function (options) {
			return new Dancer.Kick( this, options );
		},


		bind : function (name, callback) {
			
			if (!this.events[ name ])
				this.events[ name ] = [];

			this.events[ name ].push(callback);

			return this;
		},


		unbind : function ( name, callback ) {
			
			if (!this.events[ name ])
				return this;

			if (callback) {

				var i = this.events[ name ].indexOf(callback);
				if (i != -1)
					this.events[ name ].slice(1, i);

			} else {
				delete this.events[ name ];
			}

			return this;
		},


		trigger : function ( name ) {
			var _this = this;
			if ( this.events[ name ] ) {
				this.events[ name ].forEach(function( callback ) {
					callback.call( _this );
				});
			}
			return this;
		},



		/* Getters */

		getVolume : function () {
			return this.audioAdapter.getVolume();
		},

		getProgress : function () {
			return this.audioAdapter.getProgress();
		},

		getTime : function () {
			return this.audioAdapter.getTime();
		},

		getDuration : function () {
			return this.audioAdapter.getDuration();
		},

		// Returns the magnitude of a frequency or average over a range of frequencies
		getFrequency : function ( freq, endFreq ) {
			var sum = 0;
			if ( endFreq !== undefined ) {
				for ( var i = freq; i <= endFreq; i++ ) {
					sum += this.getSpectrum()[ i ];
				}
				return sum / ( endFreq - freq + 1 );
			} else {
				return this.getSpectrum()[ freq ];
			}
		},

		getWaveform : function () {
			return this.audioAdapter.getWaveform();
		},

		getSpectrum : function () {
			return this.audioAdapter.getSpectrum();
		},


		isLoaded : function () {
			return this.audioAdapter.isLoaded;
		},

		isPlaying : function () {
			return this.audioAdapter.isPlaying;
		},



		/* Sections */

		after : function ( time, callback ) {
			var _this = this;
			this.sections.push({
				condition : function () {
					return _this.getTime() > time;
				},
				callback : callback
			});
			return this;
		},

		before : function ( time, callback ) {
			var _this = this;
			this.sections.push({
				condition : function () {
					return _this.getTime() < time;
				},
				callback : callback
			});
			return this;
		},


		between : function ( startTime, endTime, callback ) {
			var _this = this;
			this.sections.push({
				condition : function () {
					return _this.getTime() > startTime && _this.getTime() < endTime;
				},
				callback : callback
			});
			return this;
		},


		onceAt : function ( time, callback ) {
			var
				_this = this,
				thisSection = null;
			this.sections.push({
				condition : function () {
					return _this.getTime() > time && !this.called;
				},
				callback : function () {
					callback.call( this );
					thisSection.called = true;
				},
				called : false
			});
			// Baking the section in the closure due to callback's this being the dancer instance
			thisSection = this.sections[ this.sections.length - 1 ];
			return this;
		}
	};


	function update () {
		
		if (this.sections.length == 0)
			return;

		for ( var i in this.sections ) {
			if ( this.sections[ i ].condition() )
				this.sections[ i ].callback.call( this );
		}
	}


	window.Dancer = Dancer;

})();

(function ( Dancer ) {

	var CODECS = {
		'mp3' : 'audio/mpeg;',
		'ogg' : 'audio/ogg; codecs="vorbis"',
		'wav' : 'audio/wav; codecs="1"',
		'aac' : 'audio/mp4; codecs="mp4a.40.2"'
	},
	
	audioEl = document.createElement( 'audio' );


	Dancer.options = {};

	Dancer.setOptions = function ( o ) {
		for ( var option in o ) {
			if ( o.hasOwnProperty( option ) ) {
				Dancer.options[ option ] = o[ option ];
			}
		}
	};




	Dancer.canPlay = function ( type ) {
		var canPlay = audioEl.canPlayType;
		
		return !!(
			audioEl.canPlayType &&
			audioEl.canPlayType( CODECS[ type.toLowerCase() ] ).replace( /no/, '')
		);
	};



	Dancer.addPlugin = function ( name, fn ) {
		if ( Dancer.prototype[ name ] === undefined ) {
			Dancer.prototype[ name ] = fn;
		}
	};


	Dancer._makeSupportedPath = function ( source, codecs ) {
		if ( !codecs ) { return source; }

		for ( var i = 0; i < codecs.length; i++ ) {
			if ( Dancer.canPlay( codecs[ i ] ) ) {
				return source + '.' + codecs[ i ];
			}
		}
		return source;
	};


	Dancer._getAdapter = function ( instance ) {
		
		if (!window.Float32Array || !window.Uint32Array)
			return null;
		
		if ( !isUnsupportedSafari() && ( window.AudioContext || window.webkitAudioContext ))
			return new Dancer.adapters.audiobuffer( instance );

		return null;
	};


	Dancer._getMP3SrcFromAudio = function ( audioEl ) {
		var sources = audioEl.children;
		if ( audioEl.src ) { return audioEl.src; }
		for ( var i = sources.length; i--; ) {
			if (( sources[ i ].type || '' ).match( /audio\/mpeg/ )) return sources[ i ].src;
		}
		return null;
	};


	// Browser detection is lame, but Safari 6 has Web Audio API,
	// but does not support processing audio from a Media Element Source
	// https://gist.github.com/3265344
	function isUnsupportedSafari () {
		var
			isApple = !!( navigator.vendor || '' ).match( /Apple/ ),
			version = navigator.userAgent.match( /Version\/([^ ]*)/ );
		version = version ? parseFloat( version[ 1 ] ) : 0;
		return isApple && version <= 6;
	}


})( window.Dancer );

(function ( undefined ) {
	var Kick = function ( dancer, o ) {
		o = o || {};
		this.dancer    = dancer;
		this.frequency = o.frequency !== undefined ? o.frequency : [ 0, 10 ];
		this.threshold = o.threshold !== undefined ? o.threshold :  0.3;
		this.decay     = o.decay     !== undefined ? o.decay     :  0.02;
		this.onKick    = o.onKick;
		this.offKick   = o.offKick;
		this.isOn      = false;
		this.currentThreshold = this.threshold;

		var _this = this;
		this.dancer.bind( 'update', function () {
			_this.onUpdate();
		});
	};

	Kick.prototype = {
		on  : function () { 
			this.isOn = true;
			return this;
		},
		off : function () {
			this.isOn = false;
			return this;
		},

		set : function ( o ) {
			o = o || {};
			this.frequency = o.frequency !== undefined ? o.frequency : this.frequency;
			this.threshold = o.threshold !== undefined ? o.threshold : this.threshold;
			this.decay     = o.decay     !== undefined ? o.decay : this.decay;
			this.onKick    = o.onKick    || this.onKick;
			this.offKick   = o.offKick   || this.offKick;
		},

		onUpdate : function () {
			if ( !this.isOn ) { return; }
			var magnitude = this.maxAmplitude( this.frequency );
			if ( magnitude >= this.currentThreshold &&
					magnitude >= this.threshold ) {
				this.currentThreshold = magnitude;
				this.onKick && this.onKick.call( this.dancer, magnitude );
			} else {
				this.offKick && this.offKick.call( this.dancer, magnitude );
				this.currentThreshold -= this.decay;
			}
		},
		maxAmplitude : function ( frequency ) {
			var
				max = 0,
				fft = this.dancer.getSpectrum();

			// Sloppy array check
			if ( !frequency.length ) {
				return frequency < fft.length ?
					fft[ ~~frequency ] :
					null;
			}

			for ( var i = frequency[ 0 ], l = frequency[ 1 ]; i <= l; i++ ) {
				if ( fft[ i ] > max ) { max = fft[ i ]; }
			}
			return max;
		}
	};

	window.Dancer.Kick = Kick;
})();

/*

Equalizer


© Guillaume Gonnet
License MIT

*/



(function() {


	var EQ = function(context, source) {

		this.gain = context.createGain();
		this.gain.gain.value = 1;
		

		this.lowpass = context.createBiquadFilter();
		this.lowpass.type = "lowshelf";
		this.lowpass.frequency.value = 100;
		this.lowpass.Q.value = 1;
		this.lowpass.gain.value = 0;
		

		this.highpass = context.createBiquadFilter();
		this.highpass.type = "highshelf";
		this.highpass.frequency.value = 4000;
		this.highpass.Q.value = 0;
		this.highpass.gain.value = 0;
		

		this.mid = context.createBiquadFilter();
		this.mid.type = "peaking";
		this.mid.frequency.value = 2000;
		this.mid.Q.value = 2;
		this.mid.gain.value = 0;
		

		this.lowpass.connect(this.mid);
		this.mid.connect(this.highpass);
		this.highpass.connect(this.gain);

		if (source)
			source.connect(this.lowpass);
	}



	EQ.prototype = {

		connect: function(output) {
			this.gain.connect(output);
		},

		plug: function(source) {
			source.connect(this.lowpass);
		},


		setGain: function (val) {
			this.gain.gain.value = (val / 100) * 2;
		},

		setHighGain: function (val) {
			this.highpass.gain.value = this.linear_to_db(val);
		},

		setMidGain: function (val) {
			this.mid.gain.value = this.linear_to_db(val);
		},

		setLowGain: function (val) {
			this.lowpass.gain.value = this.linear_to_db(val);
		},



		linear_to_db: function (linear) {
			
			if (linear < 50)
				return -(this.db_to_linear(50.0 - linear));
			else if (linear == 50)
				return 0
			else
				return this.db_to_linear(linear - 50.0);
		},



		db_to_linear: function (db) {
			return Math.pow(10, (db / 30.0)) - 1.0;
		}

	};




	Dancer.EQ = EQ;

})();
(function() {
	
	var
		SAMPLE_SIZE = 2048,
		SAMPLE_RATE = 44100;


	var adapter = function ( dancer ) {
		var _this = this;
		
		this.dancer = dancer;

		this.audio = new Audio();
		this.context = Dancer.context;


		// Processor
		if (!this.context.createScriptProcessor)
			this.context.createScriptProcessor = this.context.createJavascriptNode;
		
		this.proc = this.context.createScriptProcessor( SAMPLE_SIZE, 1, 1 );
		this.proc.onaudioprocess = function(e) {
			_this.update(e);
		};

		this.proc.connect( this.context.destination );


		// FFT
		this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
		this.signal = new Float32Array( SAMPLE_SIZE );

		// Analyser
		this.analyser = this.context.createAnalyser();
		this.analyser.smoothingTimeConstant = 0.1;
		this.analyser.fftSize = 1024;


/*
		// Compressor
		this.compressor = this.context.createDynamicsCompressor();
		this.compressor.connect( this.context.destination );


		// Equalizer
		this.eq = new Dancer.EQ( this.context );
		this.eq.connect( this.compressor );
*/

		this.lastPlaybackRate = 1;
		this.isPlaying = false;

	};


	adapter.prototype = {

		load : function ( obj ) {
			var _this = this;

			if (this.audioNode) {
				this.audio.pause();
				this.audioNode.disconnect(0);
				this.audio = null;
			}



			this.audio = obj.audio;

			if (obj.audio.readyState < 3)
				return false;


			if (obj.node)
				this.audioNode = obj.node;
			else
				this.audioNode = obj.node = this.context.createMediaElementSource(obj.audio);

			this.audioNode.disconnect(0);


			this.dancer.eq.plug(this.audioNode);
			this.audioNode.connect(this.proc);
			this.audioNode.connect(this.analyser);

			this.audioNode.onended = function() {
				_this.pause();
				_this.setTime(0);
				_this.dancer.trigger('end');
			};

		},


		play : function () {
			this.audio.playbackRate = this.lastPlaybackRate;
			this.audio.play();

			if (!this.isPlaying)
				this.dancer.trigger('play');

			this.isPlaying = true;
		},


		pause : function () {
			this.audio.pause();
			this.isPlaying = false;

			this.dancer.trigger('pause');
		},


		setVolume : function ( volume ) {
			this.eq.setGain(volume);
		},


		getVolume : function () {
			return this.eq.gain.gain.value;
		},


		getWaveform : function () {
			return this.signal;
		},


		getSpectrum : function () {
			return this.fft.spectrum;
		},


		getTime : function () {
			return this.audio.currentTime;
		},


		setTime : function (val) {
			this.audio.currentTime = val;
		},


		getDuration : function () {
			return this.audio.duration;
		},


		update : function ( e ) {
			
			if ( !this.isPlaying ) return;

			this.signal = e.inputBuffer.getChannelData(0);
			this.fft.forward( this.signal );

			this.dancer.trigger('update');
		}
	};



	Dancer.adapters.http = adapter;

})();

(function() {
	
	var
		SAMPLE_SIZE = 2048,
		SAMPLE_RATE = 44100;

	var zero_array = new Float32Array(SAMPLE_SIZE);
	var position = 0, rate = 1, beeping = false;

	var levelsCount = 512;


	var adapter = function ( dancer ) {
		var _this = this;

		this.dancer = dancer;
		this.context = Dancer.context;


		// Processor
		if (!this.context.createScriptProcessor)
			this.context.createScriptProcessor = this.context.createJavascriptNode;
		
		this.proc = this.context.createScriptProcessor( SAMPLE_SIZE, 1, 1 );
		this.proc.onaudioprocess = function(e) {
			_this.update(e);
		};

		this.proc.connect( this.context.destination );


		// FFT
		this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
		this.signal = new Float32Array( SAMPLE_SIZE );

		// Analyser
		this.analyser = this.context.createAnalyser();
		this.analyser.smoothingTimeConstant = 0.1;
		this.analyser.fftSize = 1024;


/*
		// Compressor
		this.compressor = this.context.createDynamicsCompressor();
		this.compressor.connect( this.context.destination );


		// Equalizer
		this.eq = new Dancer.EQ( this.context );
		this.eq.connect( this.compressor );
*/
		this.buffer = null;


		this.lastPlaybackRate = 1;
		this.isPlaying = false;

		this._playbackStartTime = 0;
		this._offset = 0;

	};


	adapter.prototype = {

		load : function ( audio ) {
			
			this.dancer.audioAdapter = Dancer._getAdapter(this.dancer);
			return this.dancer.load(audio);
		},


		play : function () {
			
			this._cleanUpAudioNode();
			this._createAndPlayAudioNode(this.context.currentTime - this.buffer.duration, this._offset);

			this._playbackStartTime = this.audioNode.startTime - this._offset;

			if (!this.isPlaying)
				this.dancer.trigger('play');

			this.isPlaying = true;
		},


		pause : function () {
			this.isPlaying = false;

			this._offset = this.context.currentTime - this._playbackStartTime;
			this._cleanUpAudioNode();

			this.dancer.trigger('pause');
		},


		setVolume : function ( volume ) {
			this.eq.setGain(volume);
		},


		getVolume : function () {
			return this.eq.gain.gain.value;
		},

		
		getWaveform : function () {
			return this.signal;
		},


		getSpectrum : function () {
			return this.fft.spectrum;
		},


		getTime : function () {
			if (this.isPlaying)
				return this.context.currentTime - this._playbackStartTime;
			else
				return this._offset;
		},


		setTime : function (val) {
			this._offset = val;

			if (this.isPlaying)
				this.play();
		},


		getDuration : function () {
			return  this.buffer ? this.buffer.duration : 0;
		},


		update : function (e) {

			if (!this.isPlaying) return;

			this.signal = e.inputBuffer.getChannelData(0);
			this.fft.forward( this.signal );

			this.dancer.trigger('update');
		},



		playEmptySound: function() {
			var source = this.context.createBufferSource();
			source.buffer = this.context.createBuffer(1, 1, 22050);
			source.connect(this.context.destination);
			source.start(0, 0, 0);
		},


		_cleanUpAudioNode: function () {
			
			if (!this.audioNode)
				return;

			this.audioNode.stop(0);
			this.audioNode.disconnect(0);
			this.audioNode = null;
		},


		_createAndPlayAudioNode: function (startTime, offset) {
			var _this = this;

			this.audioNode = this.context.createBufferSource();
			this.audioNode.buffer = this.buffer;

			this.dancer.eq.plug(this.audioNode);
			this.audioNode.connect(this.proc);
			this.audioNode.connect(this.analyser);

			this.audioNode.onended = function() {
				_this.pause();
				_this.setTime(0);
				_this.dancer.trigger('end');
			}

			this.audioNode.playbackRate.value = this.lastPlaybackRate;

			this.audioNode.startTime = startTime + this.buffer.duration;
			this.audioNode.start(this.audioNode.startTime, offset, this.buffer.duration - offset);
		}

	};



	Dancer.adapters.audiobuffer = adapter;

})();

(function() {

	var
		SAMPLE_SIZE = 2048,
		SAMPLE_RATE = 44100;


	var signal = new Float32Array( SAMPLE_SIZE );

	var fft = new Float32Array( SAMPLE_SIZE / 2 );

	var returnArray = function() { return []; };
	var vide = function() {};
	

	var adapter = function ( dancer ) {
		var _this = this;
		
		this.dancer = dancer;

		this.audio = new Audio();


		this.analyser = {
			frequencyBinCount: 1,
			getByteFrequencyData: returnArray,
			getByteTimeDomainData: returnArray
		};

		this.eq = {
			setGain: function(g) { _this.setVolume(g / 100); },
			setHighGain: vide,
			setMidGain: vide,
			setLowGain: vide
		};
		

		this.lastPlaybackRate = 1;
		this.isPlaying = false;

	};


	adapter.prototype = {

		load : function ( source ) {
			var _this = this;

			if (this.audio) {
				this.audio.pause();
				this.audio = null;
			}


			this.audio = source;

			if (source.readyState < 3)
				return false;


			source.onended = function() {
				_this.pause();
				_this.setTime(0);
				_this.dancer.trigger('end');
			}

		},


		play : function () {
			this.audio.playbackRate = this.lastPlaybackRate;
			this.audio.play();

			if (!this.isPlaying)
				this.dancer.trigger('play');

			this.isPlaying = true;
		},


		pause : function () {
			this.audio.pause();
			this.isPlaying = false;

			this.dancer.trigger('pause');
		},


		setVolume : function ( volume ) {
			this.audio.volume = volume;
		},


		getVolume : function () {
			return this.audio.volume;
		},


		getWaveform : function () {
			return signal;
		},


		getSpectrum : function () {
			return fft;
		},


		getTime : function () {
			return this.audio.currentTime;
		},


		setTime : function (val) {
			this.audio.currentTime = val;
		},


		getDuration : function () {
			return this.audio.duration;
		},


		update : function ( e ) {
			
			if ( !this.isPlaying ) return;


			this.dancer.trigger('update');
		}
	};



	Dancer.adapters.crossDomain = adapter;

})();

(function() {
	
	var
		SAMPLE_SIZE = 1024,
		SAMPLE_RATE = 44100;


	navigator.getUserMedia =
		( navigator.getUserMedia ||
		  navigator.webkitGetUserMedia ||
		  navigator.mozGetUserMedia ||
		  navigator.msGetUserMedia );



	var adapter = function ( dancer ) {
		var _this = this;
		
		this.dancer = dancer;

		this.audio = new Audio();
		this.context = Dancer.context;


		// Processor
		if (!this.context.createScriptProcessor)
			this.context.createScriptProcessor = this.context.createJavascriptNode;
		
		this.proc = this.context.createScriptProcessor( SAMPLE_SIZE, 2, 2 );
		this.proc.onaudioprocess = function(e) {
			_this.update(e);
		};

		this.proc.connect( this.context.destination );


		// FFT
		this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
		this.signal = new Float32Array( SAMPLE_SIZE );

		// Analyser
		this.analyser = this.context.createAnalyser();
		this.analyser.smoothingTimeConstant = 0.1;
		this.analyser.fftSize = 1024;


/*
		// Compressor
		this.compressor = this.context.createDynamicsCompressor();
		this.compressor.connect( this.context.destination );


		// Equalizer
		this.eq = new Dancer.EQ( this.context );
		this.eq.connect( this.compressor );
*/

		this.lastPlaybackRate = 1;
		this.isPlaying = false;

	};



	adapter.prototype = {

		play : function () {
			var _this = this;

			if (this.isPlaying)
				return;


			if (this.audioNode) {
				this.audioNode.disconnect(0);
				this.audioNode = null;
			}
			

			navigator.getUserMedia({ audio: true }, function(stream) {
				
				_this._setUp(stream);

				_this.dancer.trigger('play');
				_this.isPlaying = true;

			}, function() {
				console.log('Error microphone');

				_this.isPlaying = false;
				_this.dancer.trigger('pause');
			});
		},


		pause : function () {

			if (this.audioNode)
				this.stream.stop();

			this.isPlaying = false;
			this.dancer.trigger('pause');
		},



		setVolume : function ( volume ) {
			this.eq.setGain(volume);
		},


		getVolume : function () {
			return this.eq.gain.gain.value;
		},


		getWaveform : function () {
			return this.signal;
		},


		getSpectrum : function () {
			return this.fft.spectrum;
		},


		getTime : function () {
			return 0;
		},


		setTime : function (val) {
			//this.audio.currentTime = val;
		},


		getDuration : function () {
			return 0;
		},


		update : function ( e ) {
			
			if ( !this.isPlaying ) return;

			
			this.signal = e.inputBuffer.getChannelData(0);
			this.fft.forward( this.signal );

			this.dancer.trigger('update');
		},



		_setUp : function(stream) {

			this.stream = stream;

			this.audioNode = this.context.createMediaStreamSource(stream);

			this.dancer.eq.plug(this.audioNode);
			this.audioNode.connect(this.proc);
			this.audioNode.connect(this.analyser);
		}
	};



	Dancer.adapters.microphone = adapter;

})();

/* 
 *  DSP.js - a comprehensive digital signal processing  library for javascript
 * 
 *  Created by Corban Brook <corbanbrook@gmail.com> on 2010-01-01.
 *  Copyright 2010 Corban Brook. All rights reserved.
 *
 */

// Fourier Transform Module used by DFT, FFT, RFFT
function FourierTransform(bufferSize, sampleRate) {
	this.bufferSize = bufferSize;
	this.sampleRate = sampleRate;
	this.bandwidth  = 2 / bufferSize * sampleRate / 2;

	this.spectrum   = new Float32Array(bufferSize/2);
	this.real       = new Float32Array(bufferSize);
	this.imag       = new Float32Array(bufferSize);

	this.peakBand   = 0;
	this.peak       = 0;

	/**
	 * Calculates the *middle* frequency of an FFT band.
	 *
	 * @param {Number} index The index of the FFT band.
	 *
	 * @returns The middle frequency in Hz.
	 */
	this.getBandFrequency = function(index) {
		return this.bandwidth * index + this.bandwidth / 2;
	};

	this.calculateSpectrum = function() {
		var spectrum  = this.spectrum,
				real      = this.real,
				imag      = this.imag,
				bSi       = 2 / this.bufferSize,
				sqrt      = Math.sqrt,
				rval, 
				ival,
				mag;

		for (var i = 0, N = bufferSize/2; i < N; i++) {
			rval = real[i];
			ival = imag[i];
			mag = bSi * sqrt(rval * rval + ival * ival);

			if (mag > this.peak) {
				this.peakBand = i;
				this.peak = mag;
			}

			spectrum[i] = mag;
		}
	};
}

/**
 * FFT is a class for calculating the Discrete Fourier Transform of a signal
 * with the Fast Fourier Transform algorithm.
 *
 * @param {Number} bufferSize The size of the sample buffer to be computed. Must be power of 2
 * @param {Number} sampleRate The sampleRate of the buffer (eg. 44100)
 *
 * @constructor
 */
function FFT(bufferSize, sampleRate) {
	FourierTransform.call(this, bufferSize, sampleRate);
	 
	this.reverseTable = new Uint32Array(bufferSize);

	var limit = 1;
	var bit = bufferSize >> 1;

	var i;

	while (limit < bufferSize) {
		for (i = 0; i < limit; i++) {
			this.reverseTable[i + limit] = this.reverseTable[i] + bit;
		}

		limit = limit << 1;
		bit = bit >> 1;
	}

	this.sinTable = new Float32Array(bufferSize);
	this.cosTable = new Float32Array(bufferSize);

	for (i = 0; i < bufferSize; i++) {
		this.sinTable[i] = Math.sin(-Math.PI/i);
		this.cosTable[i] = Math.cos(-Math.PI/i);
	}
}

/**
 * Performs a forward transform on the sample buffer.
 * Converts a time domain signal to frequency domain spectra.
 *
 * @param {Array} buffer The sample buffer. Buffer Length must be power of 2
 *
 * @returns The frequency spectrum array
 */
FFT.prototype.forward = function(buffer) {
	// Locally scope variables for speed up
	var bufferSize      = this.bufferSize,
			cosTable        = this.cosTable,
			sinTable        = this.sinTable,
			reverseTable    = this.reverseTable,
			real            = this.real,
			imag            = this.imag,
			spectrum        = this.spectrum;

	var k = Math.floor(Math.log(bufferSize) / Math.LN2);

	if (Math.pow(2, k) !== bufferSize) { throw "Invalid buffer size, must be a power of 2."; }
	if (bufferSize !== buffer.length)  { throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length; }

	var halfSize = 1,
			phaseShiftStepReal,
			phaseShiftStepImag,
			currentPhaseShiftReal,
			currentPhaseShiftImag,
			off,
			tr,
			ti,
			tmpReal,
			i;

	for (i = 0; i < bufferSize; i++) {
		real[i] = buffer[reverseTable[i]];
		imag[i] = 0;
	}

	while (halfSize < bufferSize) {
		//phaseShiftStepReal = Math.cos(-Math.PI/halfSize);
		//phaseShiftStepImag = Math.sin(-Math.PI/halfSize);
		phaseShiftStepReal = cosTable[halfSize];
		phaseShiftStepImag = sinTable[halfSize];
		
		currentPhaseShiftReal = 1;
		currentPhaseShiftImag = 0;

		for (var fftStep = 0; fftStep < halfSize; fftStep++) {
			i = fftStep;

			while (i < bufferSize) {
				off = i + halfSize;
				tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
				ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

				real[off] = real[i] - tr;
				imag[off] = imag[i] - ti;
				real[i] += tr;
				imag[i] += ti;

				i += halfSize << 1;
			}

			tmpReal = currentPhaseShiftReal;
			currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
			currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
		}

		halfSize = halfSize << 1;
	}

	return this.calculateSpectrum();
};
