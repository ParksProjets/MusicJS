/*

Buffer

https://github.com/audiocogs/aurora.js

*/


(function() {


	function BufferJS(input) {
		
		if (input instanceof Uint8Array) {
			this.data = input;
		} else if (input instanceof ArrayBuffer || Array.isArray(input) || typeof input === 'number') {
			this.data = new Uint8Array(input);
		} else if (input.buffer instanceof ArrayBuffer) {
			this.data = new Uint8Array(input.buffer, input.byteOffset, input.length * input.BYTES_PER_ELEMENT);
		} else if (input instanceof BufferJS) {
			this.data = input.data;
		} else {
			throw new Error("Constructing buffer with unknown type.");
		}

		this.length = this.data.length;
		this.next = null;
		this.prev = null;
	}


	BufferJS.allocate = function(size) {
		return new BufferJS(size);
	};

	BufferJS.prototype.copy = function() {
		return new BufferJS(new Uint8Array(this.data));
	};


	BufferJS.prototype.slice = function(position, length) {
		if (length == null) {
			length = this.length;
		}
		if (position === 0 && length >= this.length) {
			return new BufferJS(this.data);
		} else {
			return new BufferJS(this.data.subarray(position, position + length));
		}
	};




	// Static

	var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder;

	var URL = window.URL || window.webkitURL || window.mozURL;

	BufferJS.makeBlob = function(data, type) {
		var bb;
		if (type == null) {
			type = 'application/octet-stream';
		}
		try {
			return new Blob([data], {
				type: type
			});
		} catch (_error) {}
		if (BlobBuilder != null) {
			bb = new BlobBuilder;
			bb.append(data);
			return bb.getBlob(type);
		}
		return null;
	};


	BufferJS.makeBlobURL = function(data, type) {
		return URL != null ? URL.createObjectURL(this.makeBlob(data, type)) : void 0;
	};


	BufferJS.revokeBlobURL = function(url) {
		return URL != null ? URL.revokeObjectURL(url) : void 0;
	};


	BufferJS.prototype.toBlob = function() {
		return BufferJS.makeBlob(this.data.buffer);
	};


	BufferJS.prototype.toBlobURL = function() {
		return BufferJS.makeBlobURL(this.data.buffer);
	};




	window.BufferJS = BufferJS;

})();