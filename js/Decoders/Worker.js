/*

Worker

*/


var window = self;


this.onmessage = function(e) {
	
	if (e.data.buffer) {

		Decoder.decode(e.data.buffer, function(buf, format, offset) {

			this.postMessage({
				type: 'end',
				buf: buf,
				format: format,
				offset: offset
			});

		}, function() {

			this.postMessage({ type: 'error', text: '' });

		});

	}

};

