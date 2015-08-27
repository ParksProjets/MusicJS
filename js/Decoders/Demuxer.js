/*

Demuxer

Adapted from: https://github.com/audiocogs/aurora.js by Guillaume Gonnet

*/



(function() {

	// chuck -> ex: Buffer from FileReader
	function Demuxer(chunk) {
		var _this = this;

		this.list = new BufferList();
		this.list.append(chunk);

		this.stream = new Stream(this.list);


		this.start = function() {
			_this.readChunk(chunk);
			_this.emit('end');
		}


		this.seekPoints = [];
		this.init();
	}


	Demuxer.prototype.init = function() {};


	Demuxer.prototype.readChunk = function(chunk) {};


	Demuxer.prototype.addNewChunk = function(chunk) {
		this.list.append(chunk);
		return this.readChunk(chunk);
	}


	Demuxer.prototype.addSeekPoint = function(offset, timestamp) {
		var index;
		index = this.searchTimestamp(timestamp);
		return this.seekPoints.splice(index, 0, {
			offset: offset,
			timestamp: timestamp
		});
	};


	Demuxer.prototype.searchTimestamp = function(timestamp, backward) {
		var high, low, mid, time;
		low = 0;
		high = this.seekPoints.length;
		if (high > 0 && this.seekPoints[high - 1].timestamp < timestamp) {
			return high;
		}
		while (low < high) {
			mid = (low + high) >> 1;
			time = this.seekPoints[mid].timestamp;
			if (time < timestamp) {
				low = mid + 1;
			} else if (time >= timestamp) {
				high = mid;
			}
		}
		if (high > this.seekPoints.length) {
			high = this.seekPoints.length;
		}
		return high;
	};


	Demuxer.prototype.seek = function(timestamp) {
		var index, seekPoint;
		if (this.format && this.format.framesPerPacket > 0 && this.format.bytesPerPacket > 0) {
			seekPoint = {
				timestamp: timestamp,
				offset: this.format.bytesPerPacket * timestamp / this.format.framesPerPacket
			};
			return seekPoint;
		} else {
			index = this.searchTimestamp(timestamp);
			return this.seekPoints[index];
		}
	};





	// Static

	var formats = [];


	Demuxer.register = function(demuxer) {
		return formats.push(demuxer);
	};


	Demuxer.find = function(buffer) {
		var stream = Stream.fromBuffer(buffer),
			format;

		for (var _i = 0, _len = formats.length; _i < _len; _i++) {
			format = formats[_i];
			if (format.probe(stream)) {
				return format;
			}
		}

		return null;
	};



	Demuxer.probe = function(buffer) {
		return false;
	};



	EventDispatcher.prototype.apply( Demuxer.prototype );
	window.Demuxer = Demuxer;
	
})();