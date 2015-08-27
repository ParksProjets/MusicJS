/*

BufferList

https://github.com/audiocogs/aurora.js

*/



function BufferList() {
	this.first = null;
	this.last = null;
	this.numBuffers = 0;
	this.availableBytes = 0;
	this.availableBuffers = 0;
}



BufferList.prototype.copy = function() {
	var result;
	result = new BufferList;
	result.first = this.first;
	result.last = this.last;
	result.numBuffers = this.numBuffers;
	result.availableBytes = this.availableBytes;
	result.availableBuffers = this.availableBuffers;
	return result;
};



BufferList.prototype.append = function(buffer) {
	var _ref;

	buffer.prev = this.last;
	if ((_ref = this.last) != null) {
		_ref.next = buffer;
	}

	this.last = buffer;
	if (this.first == null) {
		this.first = buffer;
	}

	this.availableBytes += buffer.length;
	this.availableBuffers++;
	return this.numBuffers++;
};




BufferList.prototype.advance = function() {
	
	if (this.first) {
		this.availableBytes -= this.first.length;
		this.availableBuffers--;
		this.first = this.first.next;
		return this.first != null;
	}

	return false;
};




BufferList.prototype.rewind = function() {
	var _ref;
	
	if (this.first && !this.first.prev) {
		return false;
	}
	
	this.first = ((_ref = this.first) != null ? _ref.prev : void 0) || this.last;
	if (this.first) {
		this.availableBytes += this.first.length;
		this.availableBuffers++;
	}
	return this.first != null;
};



BufferList.prototype.reset = function() {
	var _results;
	_results = [];
	
	while (this.rewind()) {
		continue;
	}
	return _results;
};