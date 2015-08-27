/*

Decoder

Adapted from: https://github.com/audiocogs/aurora.js by Guillaume Gonnet

*/

(function() {


	function Decoder(demuxer, format) {

		var _this = this;

		this.list = new BufferList();
		this.stream = new Stream(this.list);
		this.bitstream = new Bitstream(this.stream);

		this.receivedFinalBuffer = false;
		this.waiting = false;

		this.format = format;


		demuxer.on('cookie', function(cookie) {
			try {
				_this.setCookie(cookie);
			} catch (error) {
				_this.emit('error', error);
			}
		});


		demuxer.on('data', function(chunk) {
			_this.list.append(chunk);

			if (_this.waiting)
				_this.decode();
		});

				
		demuxer.on('end', function() {
			_this.receivedFinalBuffer = true;
			
			if (_this.waiting)
				_this.decode();
		});


		this.init();

	}




	Decoder.prototype.init = function() {};


	Decoder.prototype.setCookie = function() {};


	Decoder.prototype.readChunk = function() {};




	Decoder.prototype.decode = function() {
		
		this.waiting = false;
		var offset = this.bitstream.offset();

		try {
			var packet = this.readChunk();
		} catch (e) {
			this.emit('error');
			return false;
		}


		// If a packet was successfully read, emit it
		if (packet) {
			this.emit('data', packet);
			return true;
		}

		// If we haven't reached the end, jump back and try again when we have more data
		else if (!this.receivedFinalBuffer) {
			this.bitstream.seek(offset);
			this.waiting = true;
		}

		// Otherwise we've reached the end
		else {
			this.emit('end');
		}

		return false;
	};




	Decoder.prototype.seek = function(timestamp) {

		// Use the demuxer to get a seek point
		var seekPoint = this.demuxer.seek(timestamp);
		this.stream.seek(seekPoint.offset);

		return seekPoint.timestamp;
	};






	// Static

	var codecs = {};

	Decoder.register = function(id, decoder) {
		return codecs[id] = decoder;
	};


	Decoder.find = function(id) {
		return codecs[id] || null;
	};





	// Main Function

	Decoder.decode = function(buffer, callback, error) {

		var chunks = new BufferJS(new Uint8Array(buffer));
		

		// Demuxer

		var demuxerObj = Demuxer.find(chunks);
		if (!demuxerObj)
			return error("Format not compatible !");

		var demuxer = new demuxerObj(chunks);

		demuxer.on('error', function() {
			error("DM: Error in this format");
		});



		demuxer.on('format', function(format) {

			// Decoder

			var decoderObj = Decoder.find(format.formatID);
			if (!decoderObj)
				error("Format known but not compatible !");

			var decoder = new decoderObj(demuxer, format);

			var div = Math.pow(2, format.bitsPerChannel - 1),
				length = 0,
				chunks = [];


			decoder.on('error', function() {
				error("Error in this format");
			});


			decoder.on('data', function(chunk) {
				var buf;

				if (format.floatingPoint) {
					buf = chunk;
				} else {
					buf = new Float32Array(chunk.length)
					for (var i = 0, l = chunk.length; i < l; i++)
						buf[i] = chunk[i] / div;
				}

				length += buf.length;
				chunks.push(buf);

			});



			decoder.on('end', function() {

				var buf = new Float32Array(length),
					offset = 0;
				
				for (var i = 0, l = chunks.length; i < l; i++) {
					buf.set(chunks[i], offset);
					offset += chunks[i].length;
				}

				callback(buf, format, offset);

			});



			function _decode() {
				decoder.off('data', _decode);

				while (decoder.decode())
					continue;

				decoder.on('data', _decode);
			}
			
			_decode();

		});

		
		demuxer.start();

	};




	EventDispatcher.prototype.apply( Decoder.prototype );
	window.Decoder = Decoder;

})();