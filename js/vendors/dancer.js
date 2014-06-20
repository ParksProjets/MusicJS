/*
 * dancer - v0.4.0 - 2014-06-20
 * https://github.com/jsantell/dancer.js
 * Copyright (c) 2014 Jordan Santell
 * Licensed MIT
 */
(function() {

	var Dancer = function () {
		this.audioAdapter = Dancer._getAdapter( this );
		this.events = {};
		this.sections = [];
		this.bind( 'update', update );
	};

	Dancer.version = '0.3.2';
	Dancer.adapters = {};

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

		createKick : function ( options ) {
			return new Dancer.Kick( this, options );
		},

		bind : function ( name, callback ) {
			if ( !this.events[ name ] ) {
				this.events[ name ] = [];
			}
			this.events[ name ].push( callback );
			return this;
		},

		unbind : function ( name ) {
			if ( this.events[ name ] ) {
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

	Dancer.isSupported = function () {
		if ( !window.Float32Array || !window.Uint32Array ) {
			return null;
		} else if ( !isUnsupportedSafari() && ( window.AudioContext || window.webkitAudioContext )) {
			return 'webaudio';
		} else if ( audioEl && audioEl.mozSetup ) {
			return 'audiodata';
		} else if ( FlashDetect.versionAtLeast( 9 ) ) {
			return 'flash';
		} else {
			return '';
		}
	};

	Dancer.canPlay = function ( type ) {
		var canPlay = audioEl.canPlayType;
		return !!(
			Dancer.isSupported() === 'flash' ?
				type.toLowerCase() === 'mp3' :
				audioEl.canPlayType &&
				audioEl.canPlayType( CODECS[ type.toLowerCase() ] ).replace( /no/, ''));
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
		switch ( Dancer.isSupported() ) {
			case 'webaudio':
				return new Dancer.adapters.webaudio( instance );
			case 'audiodata':
				return new Dancer.adapters.moz( instance );
			case 'flash':
				return new Dancer.adapters.flash( instance );
			default:
				return null;
		}
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
		this.dancer = dancer;
		this.audio = new Audio();
		this.context = window.AudioContext ?
			new window.AudioContext() :
			new window.webkitAudioContext();
	};

	adapter.prototype = {

		load : function ( _source ) {
			var _this = this;
			this.audio = _source;

			this.isLoaded = false;
			this.progress = 0;

			if (!this.context.createScriptProcessor) {
				this.context.createScriptProcessor = this.context.createJavascriptNode;
			}
			this.proc = this.context.createScriptProcessor( SAMPLE_SIZE / 2, 1, 1 );

			this.proc.onaudioprocess = function ( e ) {
				_this.update.call( _this, e );
			};
			if (!this.context.createGain) {
				this.context.createGain = this.context.createGainNode;
			}

			this.gain = this.context.createGain();

			this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
			this.signal = new Float32Array( SAMPLE_SIZE / 2 );

			if ( this.audio.readyState < 3 ) {
				this.audio.addEventListener( 'canplay', function () {
					connectContext.call( _this );
				});
			} else {
				connectContext.call( _this );
			}

			this.audio.addEventListener( 'progress', function ( e ) {
				if ( e.currentTarget.duration ) {
					_this.progress = e.currentTarget.seekable.end( 0 ) / e.currentTarget.duration;
				}
			});

			return this.audio;
		},

		play : function () {
			this.audio.play();
			this.isPlaying = true;
		},

		pause : function () {
			this.audio.pause();
			this.isPlaying = false;
		},

		setVolume : function ( volume ) {
			this.gain.gain.value = volume;
		},

		getVolume : function () {
			return this.gain.gain.value;
		},

		getProgress : function() {
			return this.progress;
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

		getDuration : function () {
			return this.audio.duration;
		},

		update : function ( e ) {
			if ( !this.isPlaying || !this.isLoaded ) return;

			var
				buffers = [],
				channels = e.inputBuffer.numberOfChannels,
				resolution = SAMPLE_SIZE / channels,
				sum = function ( prev, curr ) {
					return prev[ i ] + curr[ i ];
				}, i;

			for ( i = channels; i--; ) {
				buffers.push( e.inputBuffer.getChannelData( i ) );
			}

			for ( i = 0; i < resolution; i++ ) {
				this.signal[ i ] = channels > 1 ?
					buffers.reduce( sum ) / channels :
					buffers[ 0 ][ i ];
			}

			this.fft.forward( this.signal );
			this.dancer.trigger( 'update' );
		}
	};

	function connectContext () {
		this.source = this.context.createMediaElementSource( this.audio );
		this.source.connect( this.proc );
		this.source.connect( this.gain );
		this.gain.connect( this.context.destination );
		this.proc.connect( this.context.destination );

		this.isLoaded = true;
		this.progress = 1;
		this.dancer.trigger( 'loaded' );
	}

	Dancer.adapters.webaudio = adapter;

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
		this.context = window.AudioContext ?
			new window.AudioContext() :
			new window.webkitAudioContext();


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



		// Compressor
		this.compressor = this.context.createDynamicsCompressor();
		this.compressor.connect( this.context.destination );


		// Equalizer
		this.eq = new Dancer.EQ( this.context );
		this.eq.connect( this.compressor );

		this.buffer = null;



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
			this.audioNode = this.context.createBufferSource();
			this.audioNode.buffer = this.buffer;
			this.eq.plug(this.audioNode);
			this.audioNode.connect(this.proc);

			this.audioNode.startTime = startTime + this.buffer.duration;
			this.audioNode.start(this.audioNode.startTime, offset, this.buffer.duration - offset);
		}

	};




	Dancer.adapters.webaudiobuffer = adapter;

})();

(function() {

	var adapter = function ( dancer ) {
		this.dancer = dancer;
		this.audio = new Audio();
	};

	adapter.prototype = {

		load : function ( _source ) {
			var _this = this;
			this.audio = _source;

			this.isLoaded = false;
			this.progress = 0;

			if ( this.audio.readyState < 3 ) {
				this.audio.addEventListener( 'loadedmetadata', function () {
					getMetadata.call( _this );
				}, false);
			} else {
				getMetadata.call( _this );
			}

			this.audio.addEventListener( 'MozAudioAvailable', function ( e ) {
				_this.update( e );
			}, false);

			this.audio.addEventListener( 'progress', function ( e ) {
				if ( e.currentTarget.duration ) {
					_this.progress = e.currentTarget.seekable.end( 0 ) / e.currentTarget.duration;
				}
			}, false);

			return this.audio;
		},

		play : function () {
			this.audio.play();
			this.isPlaying = true;
		},

		pause : function () {
			this.audio.pause();
			this.isPlaying = false;
		},

		setVolume : function ( volume ) {
			this.audio.volume = volume;
		},

		getVolume : function () {
			return this.audio.volume;
		},

		getProgress : function () {
			return this.progress;
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

		getDuration : function () {
			return this.audio.duration;
		},

		update : function ( e ) {
			if ( !this.isPlaying || !this.isLoaded ) return;

			for ( var i = 0, j = this.fbLength / 2; i < j; i++ ) {
				this.signal[ i ] = ( e.frameBuffer[ 2 * i ] + e.frameBuffer[ 2 * i + 1 ] ) / 2;
			}

			this.fft.forward( this.signal );
			this.dancer.trigger( 'update' );
		}
	};

	function getMetadata () {
		this.fbLength = this.audio.mozFrameBufferLength;
		this.channels = this.audio.mozChannels;
		this.rate     = this.audio.mozSampleRate;
		this.fft      = new FFT( this.fbLength / this.channels, this.rate );
		this.signal   = new Float32Array( this.fbLength / this.channels );
		this.isLoaded = true;
		this.progress = 1;
		this.dancer.trigger( 'loaded' );
	}

	Dancer.adapters.moz = adapter;

})();

(function() {
	var
		SAMPLE_SIZE  = 1024,
		SAMPLE_RATE  = 44100,
		smLoaded     = false,
		smLoading    = false,
		CONVERSION_COEFFICIENT = 0.93;

	var adapter = function ( dancer ) {
		this.dancer = dancer;
		this.wave_L = [];
		this.wave_R = [];
		this.spectrum = [];
		window.SM2_DEFER = true;
	};

	adapter.prototype = {
		// `source` can be either an Audio element, if supported, or an object
		// either way, the path is stored in the `src` property
		load : function ( source ) {
			var _this = this;
			this.path = source ? source.src : this.path;

			this.isLoaded = false;
			this.progress = 0;

			!window.soundManager && !smLoading && loadSM.call( this );

			if ( window.soundManager ) {
				this.audio = soundManager.createSound({
					id       : 'dancer' + Math.random() + '',
					url      : this.path,
					stream   : true,
					autoPlay : false,
					autoLoad : true,
					whileplaying : function () {
						_this.update();
					},
					whileloading : function () {
						_this.progress = this.bytesLoaded / this.bytesTotal;
					},
					onload   : function () {
						_this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
						_this.signal = new Float32Array( SAMPLE_SIZE );
						_this.waveform = new Float32Array( SAMPLE_SIZE );
						_this.isLoaded = true;
						_this.progress = 1;
						_this.dancer.trigger( 'loaded' );
					}
				});
				this.dancer.audio = this.audio;
			}

			// Returns audio if SM already loaded -- otherwise,
			// sets dancer instance's audio property after load
			return this.audio;
		},

		play : function () {
			this.audio.play();
			this.isPlaying = true;
		},

		pause : function () {
			this.audio.pause();
			this.isPlaying = false;
		},

		setVolume : function ( volume ) {
			this.audio.setVolume( volume * 100 );
		},

		getVolume : function () {
			return this.audio.volume / 100;
		},

		getProgress : function () {
			return this.progress;
		},

		getWaveform : function () {
			return this.waveform;
		},

		getSpectrum : function () {
			return this.fft.spectrum;
		},

		getTime : function () {
			return this.audio.position / 1000;
		},

		getDuration : function () {
			return this.audio.duration;
		},

		update : function () {
			if ( !this.isPlaying && !this.isLoaded ) return;
			this.wave_L = this.audio.waveformData.left;
			this.wave_R = this.audio.waveformData.right;
			var avg;
			for ( var i = 0, j = this.wave_L.length; i < j; i++ ) {
				avg = parseFloat(this.wave_L[ i ]) + parseFloat(this.wave_R[ i ]);
				this.waveform[ 2 * i ]     = avg / 2;
				this.waveform[ i * 2 + 1 ] = avg / 2;
				this.signal[ 2 * i ]       = avg * CONVERSION_COEFFICIENT;
				this.signal[ i * 2 + 1 ]   = avg * CONVERSION_COEFFICIENT;
			}

			this.fft.forward( this.signal );
			this.dancer.trigger( 'update' );
		}
	};

	function loadSM () {
		var adapter = this;
		smLoading = true;
		loadScript( Dancer.options.flashJS, function () {
			soundManager = new SoundManager();
			soundManager.flashVersion = 9;
			soundManager.flash9Options.useWaveformData = true;
			soundManager.useWaveformData = true;
			soundManager.useHighPerformance = true;
			soundManager.useFastPolling = true;
			soundManager.multiShot = false;
			soundManager.debugMode = false;
			soundManager.debugFlash = false;
			soundManager.url = Dancer.options.flashSWF;
			soundManager.onready(function () {
				smLoaded = true;
				adapter.load();
			});
			soundManager.ontimeout(function(){
				console.error( 'Error loading SoundManager2.swf' );
			});
			soundManager.beginDelayedInit();
		});
	}

	function loadScript ( url, callback ) {
		var
			script   = document.createElement( 'script' ),
			appender = document.getElementsByTagName( 'script' )[0];
		script.type = 'text/javascript';
		script.src = url;
		script.onload = callback;
		appender.parentNode.insertBefore( script, appender );
	}

	Dancer.adapters.flash = adapter;

})();

(function() {
	var
		SAMPLE_SIZE = 2048,
		SAMPLE_RATE = 44100;

	var zero_array = new Float32Array(SAMPLE_SIZE);
	var position = 0, rate = 1, beeping = false;


	var adapter = function ( dancer ) {
		var _this = this;

		this.dancer = dancer;
		this.context = window.AudioContext ?
			new window.AudioContext() :
			new window.webkitAudioContext();


		if (!this.context.createScriptProcessor)
			this.context.createScriptProcessor = this.context.createJavascriptNode;
		
		this.proc = this.context.createScriptProcessor( SAMPLE_SIZE, 0, 2 );

		this.proc.onaudioprocess = function ( e ) {
			_this.update.call( _this, e );
		};


		// FFT
		this.fft = new FFT( SAMPLE_SIZE, 1 );
		this.signal = new Float32Array( SAMPLE_SIZE );

		// Equalizer
		this.eq = new Dancer.EQ( this.context, this.proc );
		this.eq.connect( this.context.destination );

		this.buffer = null;



		this.position = 0;
		this.rate = 1;
		this.isPlaying = false;

	};


	adapter.prototype = {

		load : function ( audio ) {
			
			this.dancer.audioAdapter = Dancer._getAdapter(this.dancer);
			return this.dancer.load(audio);
		},


		play : function () {
			this.isPlaying = true;
			this.dancer.trigger('play');
		},

		pause : function () {
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
			return this.buffer ? this.position / this.buffer.sampleRate : 0;
		},

		setTime : function (val) {
			this.position = this.buffer ? this.buffer.sampleRate * val : 0;
		},

		getDuration : function () {
			return  this.buffer ? this.buffer.duration : null;
		},


		update : function ( e ) {

			get_samples.call( this, e );


			if (!this.isPlaying) return;


			var channels = 2,
				resolution = SAMPLE_SIZE,

				sum = function ( prev, curr ) {
					return prev[ i ] + curr[ i ];
				}, i;

			var input_channels = new Array(2)
			input_channels[0] = e.outputBuffer.getChannelData(0);
			input_channels[1] = e.outputBuffer.getChannelData(1);

			for ( i = 0; i < resolution; i++ ) {
				this.signal[ i ] = channels > 1 ?
					input_channels.reduce( sum ) / channels :
					input_channels[ 0 ][ i ];
			}

			this.fft.forward( this.signal );
			


			this.dancer.trigger('update');
		}
	};





	function process_samples (input_start, run_down_size, input_channels, output_start, output_channels)  {

		while (--run_down_size >= 0) {

			var source_offset_float = input_start + (run_down_size * this.rate),
				source_offset = Math.round(source_offset_float);

			var destination_offset = output_start + run_down_size;

			var sample_l = input_channels[0][source_offset],
				sample_r = input_channels[1][source_offset];


			output_channels[0][destination_offset] = sample_l;
			output_channels[1][destination_offset] = sample_r;

		}
	}









	function get_samples (e) {

		var output_channels = new Array(2);
		output_channels[0] = e.outputBuffer.getChannelData(0);
		output_channels[1] = e.outputBuffer.getChannelData(1);

		if (this.isPlaying && this.buffer) {

			input_channels = new Array(2)
			input_channels[0] = this.buffer.getChannelData(0);
			input_channels[1] = this.buffer.getChannelData(1);

			// Dont sample beyond the end of input
			end_position = (SAMPLE_SIZE * this.rate) + this.position;
			edge_distance = this.buffer.length - (end_position + 4);

			if (this.position < 0) {
				// If we are below 0 position, play nothing and increase the position like normal
				output_channels[0].set(zero_array);
				output_channels[1].set(zero_array);
				this.position = end_position;
			}

			else if (edge_distance <= 0) {
				// Stop playback if the end is reached
				this.isPlaying = false;
				output_channels[0].set(zero_array);
				output_channels[1].set(zero_array);
			}

			else {
				process_samples.call(this, this.position, SAMPLE_SIZE, input_channels, 0, output_channels);
				this.position = ((SAMPLE_SIZE * this.rate) + this.position);
			}

		}

		else {
			output_channels[0].set(zero_array);
			output_channels[1].set(zero_array);
		}
	}





	Dancer.adapters.drop = adapter;

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

/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/
var FlashDetect = new function(){
    var self = this;
    self.installed = false;
    self.raw = "";
    self.major = -1;
    self.minor = -1;
    self.revision = -1;
    self.revisionStr = "";
    var activeXDetectRules = [
        {
            "name":"ShockwaveFlash.ShockwaveFlash.7",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash.6",
            "version":function(obj){
                var version = "6,0,21";
                try{
                    obj.AllowScriptAccess = "always";
                    version = getActiveXVersion(obj);
                }catch(err){}
                return version;
            }
        },
        {
            "name":"ShockwaveFlash.ShockwaveFlash",
            "version":function(obj){
                return getActiveXVersion(obj);
            }
        }
    ];
    /**
     * Extract the ActiveX version of the plugin.
     * 
     * @param {Object} The flash ActiveX object.
     * @type String
     */
    var getActiveXVersion = function(activeXObj){
        var version = -1;
        try{
            version = activeXObj.GetVariable("$version");
        }catch(err){}
        return version;
    };
    /**
     * Try and retrieve an ActiveX object having a specified name.
     * 
     * @param {String} name The ActiveX object name lookup.
     * @return One of ActiveX object or a simple object having an attribute of activeXError with a value of true.
     * @type Object
     */
    var getActiveXObject = function(name){
        var obj = -1;
        try{
            obj = new ActiveXObject(name);
        }catch(err){
            obj = {activeXError:true};
        }
        return obj;
    };
    /**
     * Parse an ActiveX $version string into an object.
     * 
     * @param {String} str The ActiveX Object GetVariable($version) return value. 
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseActiveXVersion = function(str){
        var versionArray = str.split(",");//replace with regex
        return {
            "raw":str,
            "major":parseInt(versionArray[0].split(" ")[1], 10),
            "minor":parseInt(versionArray[1], 10),
            "revision":parseInt(versionArray[2], 10),
            "revisionStr":versionArray[2]
        };
    };
    /**
     * Parse a standard enabledPlugin.description into an object.
     * 
     * @param {String} str The enabledPlugin.description value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
    var parseStandardVersion = function(str){
        var descParts = str.split(/ +/);
        var majorMinor = descParts[2].split(/\./);
        var revisionStr = descParts[3];
        return {
            "raw":str,
            "major":parseInt(majorMinor[0], 10),
            "minor":parseInt(majorMinor[1], 10), 
            "revisionStr":revisionStr,
            "revision":parseRevisionStrToInt(revisionStr)
        };
    };
    /**
     * Parse the plugin revision string into an integer.
     * 
     * @param {String} The revision in string format.
     * @type Number
     */
    var parseRevisionStrToInt = function(str){
        return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
    };
    /**
     * Is the major version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required major version.
     * @type Boolean
     */
    self.majorAtLeast = function(version){
        return self.major >= version;
    };
    /**
     * Is the minor version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required minor version.
     * @type Boolean
     */
    self.minorAtLeast = function(version){
        return self.minor >= version;
    };
    /**
     * Is the revision version greater than or equal to a specified version.
     * 
     * @param {Number} version The minimum required revision version.
     * @type Boolean
     */
    self.revisionAtLeast = function(version){
        return self.revision >= version;
    };
    /**
     * Is the version greater than or equal to a specified major, minor and revision.
     * 
     * @param {Number} major The minimum required major version.
     * @param {Number} (Optional) minor The minimum required minor version.
     * @param {Number} (Optional) revision The minimum required revision version.
     * @type Boolean
     */
    self.versionAtLeast = function(major){
        var properties = [self.major, self.minor, self.revision];
        var len = Math.min(properties.length, arguments.length);
        for(i=0; i<len; i++){
            if(properties[i]>=arguments[i]){
                if(i+1<len && properties[i]==arguments[i]){
                    continue;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }
    };
    /**
     * Constructor, sets raw, major, minor, revisionStr, revision and installed public properties.
     */
    self.FlashDetect = function(){
        if(navigator.plugins && navigator.plugins.length>0){
            var type = 'application/x-shockwave-flash';
            var mimeTypes = navigator.mimeTypes;
            if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
                var version = mimeTypes[type].enabledPlugin.description;
                var versionObj = parseStandardVersion(version);
                self.raw = versionObj.raw;
                self.major = versionObj.major;
                self.minor = versionObj.minor; 
                self.revisionStr = versionObj.revisionStr;
                self.revision = versionObj.revision;
                self.installed = true;
            }
        }else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
            var version = -1;
            for(var i=0; i<activeXDetectRules.length && version==-1; i++){
                var obj = getActiveXObject(activeXDetectRules[i].name);
                if(!obj.activeXError){
                    self.installed = true;
                    version = activeXDetectRules[i].version(obj);
                    if(version!=-1){
                        var versionObj = parseActiveXVersion(version);
                        self.raw = versionObj.raw;
                        self.major = versionObj.major;
                        self.minor = versionObj.minor; 
                        self.revision = versionObj.revision;
                        self.revisionStr = versionObj.revisionStr;
                    }
                }
            }
        }
    }();
};
FlashDetect.JS_RELEASE = "1.0.4";