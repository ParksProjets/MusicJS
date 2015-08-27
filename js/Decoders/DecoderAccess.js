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