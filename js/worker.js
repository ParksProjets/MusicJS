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


/*

Bitstream

https://github.com/audiocogs/aurora.js

*/



function Bitstream(stream) {
	this.stream = stream;
	this.bitPosition = 0;
}


Bitstream.prototype.copy = function() {
	var result;
	result = new Bitstream(this.stream.copy());
	result.bitPosition = this.bitPosition;
	
	return result;
};




Bitstream.prototype.offset = function() {
	return 8 * this.stream.offset + this.bitPosition;
};




Bitstream.prototype.available = function(bits) {
	return this.stream.available((bits + 8 - this.bitPosition) / 8);
};




Bitstream.prototype.advance = function(bits) {
	var pos;
	pos = this.bitPosition + bits;
	this.stream.advance(pos >> 3);
	
	return this.bitPosition = pos & 7;
};




Bitstream.prototype.rewind = function(bits) {
	var pos;
	pos = this.bitPosition - bits;
	this.stream.rewind(Math.abs(pos >> 3));
	
	return this.bitPosition = pos & 7;
};




Bitstream.prototype.seek = function(offset) {
	var curOffset;
	curOffset = this.offset();
	if (offset > curOffset) {
		return this.advance(offset - curOffset);
	} else if (offset < curOffset) {
		return this.rewind(curOffset - offset);
	}
};




Bitstream.prototype.align = function() {
	if (this.bitPosition !== 0) {
		this.bitPosition = 0;
		return this.stream.advance(1);
	}
};




Bitstream.prototype.read = function(bits, signed) {
	var a, a0, a1, a2, a3, a4, mBits;
	if (bits === 0) {
		return 0;
	}
	mBits = bits + this.bitPosition;
	if (mBits <= 8) {
		a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
	} else if (mBits <= 16) {
		a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
	} else if (mBits <= 24) {
		a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
	} else if (mBits <= 32) {
		a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
	} else if (mBits <= 40) {
		a0 = this.stream.peekUInt8(0) * 0x0100000000;
		a1 = this.stream.peekUInt8(1) << 24 >>> 0;
		a2 = this.stream.peekUInt8(2) << 16;
		a3 = this.stream.peekUInt8(3) << 8;
		a4 = this.stream.peekUInt8(4);
		a = a0 + a1 + a2 + a3 + a4;
		a %= Math.pow(2, 40 - this.bitPosition);
		a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
	} else {
		throw new Error("Too many bits!");
	}
	if (signed) {
		if (mBits < 32) {
			if (a >>> (bits - 1)) {
				a = ((1 << bits >>> 0) - a) * -1;
			}
		} else {
			if (a / Math.pow(2, bits - 1) | 0) {
				a = (Math.pow(2, bits) - a) * -1;
			}
		}
	}
	this.advance(bits);
	return a;
};




Bitstream.prototype.peek = function(bits, signed) {
	var a, a0, a1, a2, a3, a4, mBits;
	if (bits === 0) {
		return 0;
	}
	mBits = bits + this.bitPosition;
	if (mBits <= 8) {
		a = ((this.stream.peekUInt8() << this.bitPosition) & 0xff) >>> (8 - bits);
	} else if (mBits <= 16) {
		a = ((this.stream.peekUInt16() << this.bitPosition) & 0xffff) >>> (16 - bits);
	} else if (mBits <= 24) {
		a = ((this.stream.peekUInt24() << this.bitPosition) & 0xffffff) >>> (24 - bits);
	} else if (mBits <= 32) {
		a = (this.stream.peekUInt32() << this.bitPosition) >>> (32 - bits);
	} else if (mBits <= 40) {
		a0 = this.stream.peekUInt8(0) * 0x0100000000;
		a1 = this.stream.peekUInt8(1) << 24 >>> 0;
		a2 = this.stream.peekUInt8(2) << 16;
		a3 = this.stream.peekUInt8(3) << 8;
		a4 = this.stream.peekUInt8(4);
		a = a0 + a1 + a2 + a3 + a4;
		a %= Math.pow(2, 40 - this.bitPosition);
		a = Math.floor(a / Math.pow(2, 40 - this.bitPosition - bits));
	} else {
		throw new Error("Too many bits!");
	}
	if (signed) {
		if (mBits < 32) {
			if (a >>> (bits - 1)) {
				a = ((1 << bits >>> 0) - a) * -1;
			}
		} else {
			if (a / Math.pow(2, bits - 1) | 0) {
				a = (Math.pow(2, bits) - a) * -1;
			}
		}
	}
	return a;
};




Bitstream.prototype.readLSB = function(bits, signed) {
	var a, mBits;
	if (bits === 0) {
		return 0;
	}
	if (bits > 40) {
		throw new Error("Too many bits!");
	}
	mBits = bits + this.bitPosition;
	a = (this.stream.peekUInt8(0)) >>> this.bitPosition;
	if (mBits > 8) {
		a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
	}
	if (mBits > 16) {
		a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
	}
	if (mBits > 24) {
		a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
	}
	if (mBits > 32) {
		a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
	}
	if (mBits >= 32) {
		a %= Math.pow(2, bits);
	} else {
		a &= (1 << bits) - 1;
	}
	if (signed) {
		if (mBits < 32) {
			if (a >>> (bits - 1)) {
				a = ((1 << bits >>> 0) - a) * -1;
			}
		} else {
			if (a / Math.pow(2, bits - 1) | 0) {
				a = (Math.pow(2, bits) - a) * -1;
			}
		}
	}
	this.advance(bits);
	return a;
};




Bitstream.prototype.peekLSB = function(bits, signed) {
	var a, mBits;
	
	if (bits === 0) {
		return 0;
	}

	if (bits > 40) {
		throw new Error("Too many bits!");
	}

	mBits = bits + this.bitPosition;
	a = (this.stream.peekUInt8(0)) >>> this.bitPosition;

	if (mBits > 8) {
		a |= (this.stream.peekUInt8(1)) << (8 - this.bitPosition);
	}
	if (mBits > 16) {
		a |= (this.stream.peekUInt8(2)) << (16 - this.bitPosition);
	}
	if (mBits > 24) {
		a += (this.stream.peekUInt8(3)) << (24 - this.bitPosition) >>> 0;
	}
	if (mBits > 32) {
		a += (this.stream.peekUInt8(4)) * Math.pow(2, 32 - this.bitPosition);
	}

	if (mBits >= 32) {
		a %= Math.pow(2, bits);
	} else {
		a &= (1 << bits) - 1;
	}

	if (signed) {
		if (mBits < 32) {
			if (a >>> (bits - 1)) {
				a = ((1 << bits >>> 0) - a) * -1;
			}
		} else {
			if (a / Math.pow(2, bits - 1) | 0) {
				a = (Math.pow(2, bits) - a) * -1;
			}
		}
	}

	return a;
};
/*



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
/*

Stream

https://github.com/audiocogs/aurora.js

*/


(function() {


	var decodeString, float64, float64Fallback, float80, nativeEndian;

	var buf = new ArrayBuffer(16),
		uint8 = new Uint8Array(buf),
		int8 = new Int8Array(buf),
		uint16 = new Uint16Array(buf),
		int16 = new Int16Array(buf),
		uint32 = new Uint32Array(buf),
		int32 = new Int32Array(buf),
		float32 = new Float32Array(buf);

	if (typeof Float64Array !== "undefined" && Float64Array !== null) {
		float64 = new Float64Array(buf);
	}

	nativeEndian = new Uint16Array(new Uint8Array([0x12, 0x34]).buffer)[0] === 0x3412;


	function UnderflowError() {
		this.name = 'UnderflowError';
	}



	function Stream(list) {
		this.list = list;
		this.localOffset = 0;
		this.offset = 0;
	}


	Stream.fromBuffer = function(buffer) {
		var list;
		list = new BufferList;
		list.append(buffer);
		return new Stream(list);
	};


	Stream.prototype.copy = function() {
		var result;
		result = new Stream(this.list.copy());
		result.localOffset = this.localOffset;
		result.offset = this.offset;
		return result;
	};

	Stream.prototype.available = function(bytes) {
		return bytes <= this.list.availableBytes - this.localOffset;
	};

	Stream.prototype.remainingBytes = function() {
		return this.list.availableBytes - this.localOffset;
	};

	Stream.prototype.advance = function(bytes) {
		if (!this.available(bytes)) {
			throw new UnderflowError();
		}
		this.localOffset += bytes;
		this.offset += bytes;
		while (this.list.first && this.localOffset >= this.list.first.length) {
			this.localOffset -= this.list.first.length;
			this.list.advance();
		}
		return this;
	};

	Stream.prototype.rewind = function(bytes) {
		if (bytes > this.offset) {
			throw new UnderflowError();
		}
		if (!this.list.first) {
			this.list.rewind();
			this.localOffset = this.list.first.length;
		}
		this.localOffset -= bytes;
		this.offset -= bytes;
		while (this.list.first.prev && this.localOffset < 0) {
			this.list.rewind();
			this.localOffset += this.list.first.length;
		}
		return this;
	};

	Stream.prototype.seek = function(position) {
		if (position > this.offset) {
			return this.advance(position - this.offset);
		} else if (position < this.offset) {
			return this.rewind(this.offset - position);
		}
	};

	Stream.prototype.readUInt8 = function() {
		var a;
		if (!this.available(1)) {
			throw new UnderflowError();
		}
		a = this.list.first.data[this.localOffset];
		this.localOffset += 1;
		this.offset += 1;
		if (this.localOffset === this.list.first.length) {
			this.localOffset = 0;
			this.list.advance();
		}
		return a;
	};

	Stream.prototype.peekUInt8 = function(offset) {
		var buffer;
		if (offset == null) {
			offset = 0;
		}
		if (!this.available(offset + 1)) {
			throw new UnderflowError();
		}
		offset = this.localOffset + offset;
		buffer = this.list.first;
		while (buffer) {
			if (buffer.length > offset) {
				return buffer.data[offset];
			}
			offset -= buffer.length;
			buffer = buffer.next;
		}
		return 0;
	};

	Stream.prototype.read = function(bytes, littleEndian) {
		var i, _i, _j, _ref;
		if (littleEndian == null) {
			littleEndian = false;
		}
		if (littleEndian === nativeEndian) {
			for (i = _i = 0; _i < bytes; i = _i += 1) {
				uint8[i] = this.readUInt8();
			}
		} else {
			for (i = _j = _ref = bytes - 1; _j >= 0; i = _j += -1) {
				uint8[i] = this.readUInt8();
			}
		}
	};

	Stream.prototype.peek = function(bytes, offset, littleEndian) {
		var i, _i, _j;
		if (littleEndian == null) {
			littleEndian = false;
		}
		if (littleEndian === nativeEndian) {
			for (i = _i = 0; _i < bytes; i = _i += 1) {
				uint8[i] = this.peekUInt8(offset + i);
			}
		} else {
			for (i = _j = 0; _j < bytes; i = _j += 1) {
				uint8[bytes - i - 1] = this.peekUInt8(offset + i);
			}
		}
	};

	Stream.prototype.readInt8 = function() {
		this.read(1);
		return int8[0];
	};

	Stream.prototype.peekInt8 = function(offset) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(1, offset);
		return int8[0];
	};

	Stream.prototype.readUInt16 = function(littleEndian) {
		this.read(2, littleEndian);
		return uint16[0];
	};

	Stream.prototype.peekUInt16 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(2, offset, littleEndian);
		return uint16[0];
	};

	Stream.prototype.readInt16 = function(littleEndian) {
		this.read(2, littleEndian);
		return int16[0];
	};

	Stream.prototype.peekInt16 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(2, offset, littleEndian);
		return int16[0];
	};

	Stream.prototype.readUInt24 = function(littleEndian) {
		if (littleEndian) {
			return this.readUInt16(true) + (this.readUInt8() << 16);
		} else {
			return (this.readUInt16() << 8) + this.readUInt8();
		}
	};

	Stream.prototype.peekUInt24 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		if (littleEndian) {
			return this.peekUInt16(offset, true) + (this.peekUInt8(offset + 2) << 16);
		} else {
			return (this.peekUInt16(offset) << 8) + this.peekUInt8(offset + 2);
		}
	};

	Stream.prototype.readInt24 = function(littleEndian) {
		if (littleEndian) {
			return this.readUInt16(true) + (this.readInt8() << 16);
		} else {
			return (this.readInt16() << 8) + this.readUInt8();
		}
	};

	Stream.prototype.peekInt24 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		if (littleEndian) {
			return this.peekUInt16(offset, true) + (this.peekInt8(offset + 2) << 16);
		} else {
			return (this.peekInt16(offset) << 8) + this.peekUInt8(offset + 2);
		}
	};

	Stream.prototype.readUInt32 = function(littleEndian) {
		this.read(4, littleEndian);
		return uint32[0];
	};

	Stream.prototype.peekUInt32 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(4, offset, littleEndian);
		return uint32[0];
	};

	Stream.prototype.readInt32 = function(littleEndian) {
		this.read(4, littleEndian);
		return int32[0];
	};

	Stream.prototype.peekInt32 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(4, offset, littleEndian);
		return int32[0];
	};

	Stream.prototype.readFloat32 = function(littleEndian) {
		this.read(4, littleEndian);
		return float32[0];
	};

	Stream.prototype.peekFloat32 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(4, offset, littleEndian);
		return float32[0];
	};

	Stream.prototype.readFloat64 = function(littleEndian) {
		this.read(8, littleEndian);
		if (float64) {
			return float64[0];
		} else {
			return float64Fallback();
		}
	};

	float64Fallback = function() {
		var exp, frac, high, low, out, sign;
		low = uint32[0], high = uint32[1];
		if (!high || high === 0x80000000) {
			return 0.0;
		}
		sign = 1 - (high >>> 31) * 2;
		exp = (high >>> 20) & 0x7ff;
		frac = high & 0xfffff;
		if (exp === 0x7ff) {
			if (frac) {
				return NaN;
			}
			return sign * Infinity;
		}
		exp -= 1023;
		out = (frac | 0x100000) * Math.pow(2, exp - 20);
		out += low * Math.pow(2, exp - 52);
		return sign * out;
	};

	Stream.prototype.peekFloat64 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(8, offset, littleEndian);
		if (float64) {
			return float64[0];
		} else {
			return float64Fallback();
		}
	};

	Stream.prototype.readFloat80 = function(littleEndian) {
		this.read(10, littleEndian);
		return float80();
	};

	float80 = function() {
		var a0, a1, exp, high, low, out, sign;
		high = uint32[0], low = uint32[1];
		a0 = uint8[9];
		a1 = uint8[8];
		sign = 1 - (a0 >>> 7) * 2;
		exp = ((a0 & 0x7F) << 8) | a1;
		if (exp === 0 && low === 0 && high === 0) {
			return 0;
		}
		if (exp === 0x7fff) {
			if (low === 0 && high === 0) {
				return sign * Infinity;
			}
			return NaN;
		}
		exp -= 16383;
		out = low * Math.pow(2, exp - 31);
		out += high * Math.pow(2, exp - 63);
		return sign * out;
	};

	Stream.prototype.peekFloat80 = function(offset, littleEndian) {
		if (offset == null) {
			offset = 0;
		}
		this.peek(10, offset, littleEndian);
		return float80();
	};

	Stream.prototype.readBuffer = function(length) {
		var i, result, to, _i;
		result = Buffer.allocate(length);
		to = result.data;
		for (i = _i = 0; _i < length; i = _i += 1) {
			to[i] = this.readUInt8();
		}
		return result;
	};

	Stream.prototype.peekBuffer = function(offset, length) {
		var i, result, to, _i;
		if (offset == null) {
			offset = 0;
		}
		result = BufferJS.allocate(length);
		to = result.data;
		for (i = _i = 0; _i < length; i = _i += 1) {
			to[i] = this.peekUInt8(offset + i);
		}
		return result;
	};


	Stream.prototype.readSingleBuffer = function(length) {
		var result;
		result = this.list.first.slice(this.localOffset, length);
		this.advance(result.length);
		return result;
	};


	Stream.prototype.peekSingleBuffer = function(offset, length) {
		var result;
		result = this.list.first.slice(this.localOffset + offset, length);
		return result;
	};


	Stream.prototype.readString = function(length, encoding) {
		if (encoding == null) {
			encoding = 'ascii';
		}
		return decodeString.call(this, 0, length, encoding, true);
	};


	Stream.prototype.peekString = function(offset, length, encoding) {
		if (offset == null) {
			offset = 0;
		}
		if (encoding == null) {
			encoding = 'ascii';
		}
		return decodeString.call(this, offset, length, encoding, false);
	};



	decodeString = function(offset, length, encoding, advance) {
		var b1, b2, b3, b4, bom, c, end, littleEndian, nullEnd, pt, result, w1, w2;
		encoding = encoding.toLowerCase();
		nullEnd = length === null ? 0 : -1;
		if (length == null) {
			length = Infinity;
		}
		end = offset + length;
		result = '';
		switch (encoding) {
			case 'ascii':
			case 'latin1':
				while (offset < end && (c = this.peekUInt8(offset++)) !== nullEnd) {
					result += String.fromCharCode(c);
				}
				break;
			case 'utf8':
			case 'utf-8':
				while (offset < end && (b1 = this.peekUInt8(offset++)) !== nullEnd) {
					if ((b1 & 0x80) === 0) {
						result += String.fromCharCode(b1);
					} else if ((b1 & 0xe0) === 0xc0) {
						b2 = this.peekUInt8(offset++) & 0x3f;
						result += String.fromCharCode(((b1 & 0x1f) << 6) | b2);
					} else if ((b1 & 0xf0) === 0xe0) {
						b2 = this.peekUInt8(offset++) & 0x3f;
						b3 = this.peekUInt8(offset++) & 0x3f;
						result += String.fromCharCode(((b1 & 0x0f) << 12) | (b2 << 6) | b3);
					} else if ((b1 & 0xf8) === 0xf0) {
						b2 = this.peekUInt8(offset++) & 0x3f;
						b3 = this.peekUInt8(offset++) & 0x3f;
						b4 = this.peekUInt8(offset++) & 0x3f;
						pt = (((b1 & 0x0f) << 18) | (b2 << 12) | (b3 << 6) | b4) - 0x10000;
						result += String.fromCharCode(0xd800 + (pt >> 10), 0xdc00 + (pt & 0x3ff));
					}
				}
				break;
			case 'utf16-be':
			case 'utf16be':
			case 'utf16le':
			case 'utf16-le':
			case 'utf16bom':
			case 'utf16-bom':
				switch (encoding) {
					case 'utf16be':
					case 'utf16-be':
						littleEndian = false;
						break;
					case 'utf16le':
					case 'utf16-le':
						littleEndian = true;
						break;
					case 'utf16bom':
					case 'utf16-bom':
						if (length < 2 || (bom = this.peekUInt16(offset)) === nullEnd) {
							if (advance) {
								this.advance(offset += 2);
							}
							return result;
						}
						littleEndian = bom === 0xfffe;
						offset += 2;
				}
				while (offset < end && (w1 = this.peekUInt16(offset, littleEndian)) !== nullEnd) {
					offset += 2;
					if (w1 < 0xd800 || w1 > 0xdfff) {
						result += String.fromCharCode(w1);
					} else {
						if (w1 > 0xdbff) {
							throw new Error("Invalid utf16 sequence.");
						}
						w2 = this.peekUInt16(offset, littleEndian);
						if (w2 < 0xdc00 || w2 > 0xdfff) {
							throw new Error("Invalid utf16 sequence.");
						}
						result += String.fromCharCode(w1, w2);
						offset += 2;
					}
				}
				if (w1 === nullEnd) {
					offset += 2;
				}
				break;
			default:
				throw new Error("Unknown encoding: " + encoding);
		}
		if (advance) {
			this.advance(offset);
		}

		return result;
	};




	window.Stream = Stream;

})();
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
/*
 * FLAC.js - Free Lossless Audio Codec decoder in JavaScript
 * By Devon Govett and Jens Nockert of Official.fm Labs
 *
 * FLAC.js is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * FLAC.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 */



var FLACDemuxer = function(chunck) {
	

	const STREAMINFO = 0,
		  PADDING = 1,
		  APPLICATION = 2,
		  SEEKTABLE = 3,
		  VORBIS_COMMENT = 4,
		  CUESHEET = 5,
		  PICTURE = 6,
		  INVALID = 127,
		  STREAMINFO_SIZE = 34;
	

	this.readChunk = function() {
		var stream = this.stream;
		
		if (!this.readHeader && stream.available(4)) {
			if (stream.readString(4) !== 'fLaC')
				return this.emit('error', 'Invalid FLAC file.');
				
			this.readHeader = true;
		}
		
		while (stream.available(1) && !this.last) {                     
			if (!this.readBlockHeaders) {
				var tmp = stream.readUInt8();
				this.last = (tmp & 0x80) === 0x80,
				this.type = tmp & 0x7F,
				this.size = stream.readUInt24();
			}
			
			if (!this.foundStreamInfo && this.type !== STREAMINFO)
				return this.emit('error', 'STREAMINFO must be the first block');
				
			if (!stream.available(this.size))
				return;
			
			switch (this.type) {
				case STREAMINFO:
					if (this.foundStreamInfo)
						return this.emit('error', 'STREAMINFO can only occur once.');
					
					if (this.size !== STREAMINFO_SIZE)
						return this.emit('error', 'STREAMINFO size is wrong.');
					
					this.foundStreamInfo = true;
					var bitstream = new Bitstream(stream);
				
					var cookie = {
						minBlockSize: bitstream.read(16),
						maxBlockSize: bitstream.read(16),
						minFrameSize: bitstream.read(24),
						maxFrameSize: bitstream.read(24)
					};
				
					this.format = {
						formatID: 'flac',
						sampleRate: bitstream.read(20),
						channelsPerFrame: bitstream.read(3) + 1,
						bitsPerChannel: bitstream.read(5) + 1
					};
				
					
					var sampleCount = bitstream.read(36);
					this.format.sampleCount = sampleCount;

					this.emit('format', this.format);
					this.emit('cookie', cookie);

					this.emit('duration', sampleCount / this.format.sampleRate * 1000 | 0);
				
					stream.advance(16); // skip MD5 hashes
					this.readBlockHeaders = false;
					break;

					/*
					I am only looking at the least significant 32 bits of sample number and offset data
					This is more than sufficient for the longest flac file I have (~50 mins 2-channel 16-bit 44.1k which uses about 7.5% of the UInt32 space for the largest offset)
					Can certainly be improved by storing sample numbers and offests as doubles, but would require additional overriding of the searchTimestamp and seek functions (possibly more?)
					Also the flac faq suggests it would be possible to find frame lengths and thus create seek points on the fly via decoding but I assume this would be slow
					I may look into these thigns though as my project progresses
					*/
					case SEEKTABLE:
						for(var s=0; s<this.size/18; s++)
						{
							if(stream.peekUInt32(0) == 0xFFFFFFFF && stream.peekUInt32(1) == 0xFFFFFFFF)
							{
								//placeholder, ignore
								stream.advance(18);
							} else {
								if(stream.readUInt32() > 0)
								{
									this.emit('error', 'Seek points with sample number >UInt32 not supported');
								}
								var samplenum = stream.readUInt32();
								if(stream.readUInt32() > 0)
								{
									this.emit('error', 'Seek points with stream offset >UInt32 not supported');
								}
								var offset = stream.readUInt32();

								stream.advance(2);

								this.addSeekPoint(offset, samplenum);
							}
						}
						break;

				case VORBIS_COMMENT:
					// see http://www.xiph.org/vorbis/doc/v-comment.html
					this.metadata || (this.metadata = {});
					var len = stream.readUInt32(true);
					
					this.metadata.vendor = stream.readString(len);
					var length = stream.readUInt32(true);
					
					for (var i = 0; i < length; i++) {
						len = stream.readUInt32(true);
						var str = stream.readString(len, 'utf8'),
							idx = str.indexOf('=');
							
						this.metadata[str.slice(0, idx).toLowerCase()] = str.slice(idx + 1);
					}
					
					// TODO: standardize field names across formats
					break;
					
				case PICTURE:
					var type = stream.readUInt32();
					if (type !== 3) { // make sure this is album art (type 3)
						stream.advance(this.size - 4);
					} else {
						var mimeLen = stream.readUInt32(),
							mime = stream.readString(mimeLen),
							descLen = stream.readUInt32(),
							description = stream.readString(descLen),
							width = stream.readUInt32(),
							height = stream.readUInt32(),
							depth = stream.readUInt32(),
							colors = stream.readUInt32(),
							length = stream.readUInt32(),
							picture = stream.readBuffer(length);
					
						this.metadata || (this.metadata = {});
						this.metadata.coverArt = picture;
					}
					
					// does anyone want the rest of the info?
					break;
				
				default:
					stream.advance(this.size);
					this.readBlockHeaders = false;
			}
			
			if (this.last && this.metadata)
				this.emit('metadata', this.metadata);
		}
		
		while (stream.available(1) && this.last) {
			var buffer = stream.readSingleBuffer(stream.remainingBytes());
			this.emit('data', buffer);
		}
	}



	Demuxer.call(this, chunck);
	
};



FLACDemuxer.probe = function(buffer) {
	return buffer.peekString(0, 4) === 'fLaC';
};




Demuxer.register(FLACDemuxer);

FLACDemuxer.prototype = Object.create( Demuxer.prototype );
/*
 * 
 *
 *
 * FLAC.js - Free Lossless Audio Codec decoder in JavaScript
 * Original C version from FFmpeg (c) 2003 Alex Beregszaszi
 * JavaScript port by Devon Govett and Jens Nockert of Official.fm Labs
 * 
 * Licensed under the same terms as the original.  The original
 * license follows.
 *
 * FLAC.js is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * FLAC.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 */




var FLACDecoder = function(demuxer, format) {

	
	this.setCookie = function(cookie) {
		
		this.cookie = cookie;
		
		// initialize arrays
		this.decoded = [];
		for (var i = 0; i < this.format.channelsPerFrame; i++) {
			this.decoded[i] = new Int32Array(cookie.maxBlockSize);
		}
		
		// for 24 bit lpc frames, this is used to simulate a 64 bit int
		this.lpc_total = new Int32Array(2);
	};


	
	const BLOCK_SIZES = new Int16Array([
			   0,      192, 576 << 0, 576 << 1, 576 << 2, 576 << 3,        0,        0,
		256 << 0, 256 << 1, 256 << 2, 256 << 3, 256 << 4, 256 << 5, 256 << 6, 256 << 7
	]);
	
	const SAMPLE_RATES = new Int32Array([
		0, 88200, 176400, 192000,
		8000, 16000, 22050, 24000, 32000, 44100, 48000, 96000,
		0, 0, 0, 0
	]);
	
	const SAMPLE_SIZES = new Int8Array([
		0, 8, 12, 0, 16, 20, 24, 0
	]);
	
	const MAX_CHANNELS = 8,
		  CHMODE_INDEPENDENT = 0,
		  CHMODE_LEFT_SIDE = 8,
		  CHMODE_RIGHT_SIDE = 9,
		  CHMODE_MID_SIDE = 10;
	
	this.readChunk = function() {
		var stream = this.bitstream;
		if (!stream.available(32))
			return;
							
		// frame sync code
		if ((stream.read(15) & 0x7FFF) !== 0x7FFC)
			throw new Error('Invalid sync code');
			
		var isVarSize = stream.read(1),  // variable block size stream code
			bsCode = stream.read(4),  // block size
			srCode = stream.read(4),  // sample rate code
			chMode = stream.read(4),  // channel mode
			bpsCode = stream.read(3); // bits per sample
			
		stream.advance(1); // reserved bit
		
		// channels
		this.chMode = chMode;
		var channels;
		
		if (chMode < MAX_CHANNELS) {
			channels = chMode + 1;
			this.chMode = CHMODE_INDEPENDENT;
		} else if (chMode <= CHMODE_MID_SIDE) {
			channels = 2;
		} else {
			throw new Error('Invalid channel mode');
		}
		
		if (channels !== this.format.channelsPerFrame)
			throw new Error('Switching channel layout mid-stream not supported.');
		
		// bits per sample    
		if (bpsCode === 3 || bpsCode === 7)
			throw new Error('Invalid sample size code');
			
		this.bps = SAMPLE_SIZES[bpsCode];
		if (this.bps !== this.format.bitsPerChannel)
			throw new Error('Switching bits per sample mid-stream not supported.');
		
		// sample number or frame number
		// see http://www.hydrogenaudio.org/forums/index.php?s=ea7085ffe6d57132c36e6105c0d434c9&showtopic=88390&pid=754269&st=0&#entry754269
		var ones = 0;
		while (stream.read(1) === 1)
			ones++;
		
		var frame_or_sample_num = stream.read(7 - ones);
		for (; ones > 1; ones--) {
			stream.advance(2); // == 2
			frame_or_sample_num = (frame_or_sample_num << 6) | stream.read(6);
		}
				
		// block size
		if (bsCode === 0)
			throw new Error('Reserved blocksize code');
		else if (bsCode === 6)
			this.blockSize = stream.read(8) + 1;
		else if (bsCode === 7)
			this.blockSize = stream.read(16) + 1;
		else
			this.blockSize = BLOCK_SIZES[bsCode];
			
		// sample rate
		var sampleRate;
		if (srCode < 12)
			sampleRate = SAMPLE_RATES[srCode];
		else if (srCode === 12)
			sampleRate = stream.read(8) * 1000;
		else if (srCode === 13)
			sampleRate = stream.read(16);
		else if (srCode === 14)
			sampleRate = stream.read(16) * 10;
		else
			throw new Error('Invalid sample rate code');
			
		stream.advance(8); // skip CRC check
		
		// subframes
		for (var i = 0; i < channels; i++)
			this.decodeSubframe(i);
		
		stream.align();
		stream.advance(16); // skip CRC frame footer
		
		var is32 = this.bps > 16,
			output = new ArrayBuffer(this.blockSize * channels * (is32 ? 4 : 2)),
			buf = is32 ? new Int32Array(output) : new Int16Array(output),
			blockSize = this.blockSize,
			decoded = this.decoded,
			j = 0;
			
		switch (this.chMode) {
			case CHMODE_INDEPENDENT:
				for (var k = 0; k < blockSize; k++) {
					for (var i = 0; i < channels; i++) {
						buf[j++] = decoded[i][k];
					}
				}
				break;
				
			case CHMODE_LEFT_SIDE:
				for (var i = 0; i < blockSize; i++) {
					var left = decoded[0][i],
						right = decoded[1][i];

					buf[j++] = left;
					buf[j++] = (left - right);
				}
				break;
				
			case CHMODE_RIGHT_SIDE:
				for (var i = 0; i < blockSize; i++) {
					var left = decoded[0][i],
						right = decoded[1][i];

					buf[j++] = (left + right);
					buf[j++] = right;
				}
				break;
				
			case CHMODE_MID_SIDE:
				for (var i = 0; i < blockSize; i++) {
					var left = decoded[0][i],
						right = decoded[1][i];
					
					left -= right >> 1;
					buf[j++] = (left + right);
					buf[j++] = left;
				}
				break;
		}
		
		return buf;
	};
	
	this.decodeSubframe = function(channel) {
		var wasted = 0,
			stream = this.bitstream,
			blockSize = this.blockSize,
			decoded = this.decoded;
		
		this.curr_bps = this.bps;
		if (channel === 0) {
			if (this.chMode === CHMODE_RIGHT_SIDE)
				this.curr_bps++;
		} else {
			if (this.chMode === CHMODE_LEFT_SIDE || this.chMode === CHMODE_MID_SIDE)
				this.curr_bps++;
		}
		
		if (stream.read(1))
			throw new Error("Invalid subframe padding");
		
		var type = stream.read(6);
		
		if (stream.read(1)) {
			wasted = 1;
			while (!stream.read(1))
				wasted++;

			this.curr_bps -= wasted;
		}
		
		if (this.curr_bps > 32)
			throw new Error("decorrelated bit depth > 32 (" + this.curr_bps + ")");
		
		if (type === 0) {
			var tmp = stream.read(this.curr_bps, true);
			for (var i = 0; i < blockSize; i++)
				decoded[channel][i] = tmp;
				
		} else if (type === 1) {
			var bps = this.curr_bps;
			for (var i = 0; i < blockSize; i++)
				decoded[channel][i] = stream.read(bps, true);
				
		} else if ((type >= 8) && (type <= 12)) {
			this.decode_subframe_fixed(channel, type & ~0x8);
				
		} else if (type >= 32) {
			this.decode_subframe_lpc(channel, (type & ~0x20) + 1);

		} else {
			throw new Error("Invalid coding type");
		}
		
		if (wasted) {
			for (var i = 0; i < blockSize; i++)
				decoded[channel][i] <<= wasted;
		}
	};
	
	this.decode_subframe_fixed = function(channel, predictor_order) {
		var decoded = this.decoded[channel],
			stream = this.bitstream,
			bps = this.curr_bps;
	
		// warm up samples
		for (var i = 0; i < predictor_order; i++)
			decoded[i] = stream.read(bps, true);
	
		this.decode_residuals(channel, predictor_order);
		
		var a = 0, b = 0, c = 0, d = 0;
		
		if (predictor_order > 0) 
			a = decoded[predictor_order - 1];
		
		if (predictor_order > 1)
			b = a - decoded[predictor_order - 2];
		
		if (predictor_order > 2) 
			c = b - decoded[predictor_order - 2] + decoded[predictor_order - 3];
		
		if (predictor_order > 3)
			d = c - decoded[predictor_order - 2] + 2 * decoded[predictor_order - 3] - decoded[predictor_order - 4];
			
		switch (predictor_order) {
			case 0:
				break;
				
			case 1:
			case 2:
			case 3:
			case 4:
				var abcd = new Int32Array([a, b, c, d]),
					blockSize = this.blockSize;
					
				for (var i = predictor_order; i < blockSize; i++) {
					abcd[predictor_order - 1] += decoded[i];
					
					for (var j = predictor_order - 2; j >= 0; j--) {
						abcd[j] += abcd[j + 1];
					}
					
					decoded[i] = abcd[0];
				}
				
				break;
				
			default:
				throw new Error("Invalid Predictor Order " + predictor_order);
		}
	};
	
	this.decode_subframe_lpc = function(channel, predictor_order) {
		var stream = this.bitstream,
			decoded = this.decoded[channel],
			bps = this.curr_bps,
			blockSize = this.blockSize;
			
		// warm up samples
		for (var i = 0; i < predictor_order; i++) {
			decoded[i] = stream.read(bps, true);
		}

		var coeff_prec = stream.read(4) + 1;
		if (coeff_prec === 16)
			throw new Error("Invalid coefficient precision");
		
		var qlevel = stream.read(5, true);
		if (qlevel < 0)
			throw new Error("Negative qlevel, maybe buggy stream");
		
		var coeffs = new Int32Array(32);
		for (var i = 0; i < predictor_order; i++) {
			coeffs[i] = stream.read(coeff_prec, true);
		}
		
		this.decode_residuals(channel, predictor_order);
		
		if (this.bps <= 16) {
			for (var i = predictor_order; i < blockSize - 1; i += 2) {
				var d = decoded[i - predictor_order],
					s0 = 0, s1 = 0, c = 0;
			
				for (var j = predictor_order - 1; j > 0; j--) {
					c = coeffs[j];
					s0 += c * d;
					d = decoded[i - j];
					s1 += c * d;
				}
			
				c = coeffs[0];
				s0 += c * d;
				d = decoded[i] += (s0 >> qlevel);
				s1 += c * d;
				decoded[i + 1] += (s1 >> qlevel);
			}
			
			if (i < blockSize) {
				var sum = 0;
				for (var j = 0; j < predictor_order; j++)
					sum += coeffs[j] * decoded[i - j - 1];
			
				decoded[i] += (sum >> qlevel);
			}
		} else {
			// simulate 64 bit integer using an array of two 32 bit ints
			var total = this.lpc_total;
			for (var i = predictor_order; i < blockSize; i++) {
				// reset total to 0
				total[0] = 0;
				total[1] = 0;

				for (j = 0; j < predictor_order; j++) {
					// simulate `total += coeffs[j] * decoded[i - j - 1]`
					multiply_add(total, coeffs[j], decoded[i - j - 1]);                    
				}

				// simulate `decoded[i] += total >> qlevel`
				// we know that qlevel < 32 since it is a 5 bit field (see above)
				decoded[i] += (total[0] >>> qlevel) | (total[1] << (32 - qlevel));
			}
		}
	};
	
	const TWO_PWR_32_DBL = Math.pow(2, 32);
		
	// performs `total += a * b` on a simulated 64 bit int
	// total is an Int32Array(2)
	// a and b are JS numbers (32 bit ints)
	function multiply_add(total, a, b) {
		// multiply a * b (we can use normal JS multiplication for this)
		var r = a * b;
		var n = r < 0;
		if (n)
			r = -r;
			
		var r_low = (r % TWO_PWR_32_DBL) | 0;
		var r_high = (r / TWO_PWR_32_DBL) | 0;
		if (n) {
			r_low = ~r_low + 1;
			r_high = ~r_high;
		}
		
		// add result to total
		var a48 = total[1] >>> 16;
		var a32 = total[1] & 0xFFFF;
		var a16 = total[0] >>> 16;
		var a00 = total[0] & 0xFFFF;

		var b48 = r_high >>> 16;
		var b32 = r_high & 0xFFFF;
		var b16 = r_low >>> 16;
		var b00 = r_low & 0xFFFF;

		var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
		c00 += a00 + b00;
		c16 += c00 >>> 16;
		c00 &= 0xFFFF;
		c16 += a16 + b16;
		c32 += c16 >>> 16;
		c16 &= 0xFFFF;
		c32 += a32 + b32;
		c48 += c32 >>> 16;
		c32 &= 0xFFFF;
		c48 += a48 + b48;
		c48 &= 0xFFFF;
		
		// store result back in total
		total[0] = (c16 << 16) | c00;
		total[1] = (c48 << 16) | c32;
	}
	 
	const INT_MAX = 32767;
	
	this.decode_residuals = function(channel, predictor_order) {
		var stream = this.bitstream,
			method_type = stream.read(2);
			
		if (method_type > 1)
			throw new Error('Illegal residual coding method ' + method_type);
		
		var rice_order = stream.read(4),
			samples = (this.blockSize >>> rice_order);
			
		if (predictor_order > samples)
			throw new Error('Invalid predictor order ' + predictor_order + ' > ' + samples);
		
		var decoded = this.decoded[channel],
			sample = predictor_order, 
			i = predictor_order;
		
		for (var partition = 0; partition < (1 << rice_order); partition++) {
			var tmp = stream.read(method_type === 0 ? 4 : 5);

			if (tmp === (method_type === 0 ? 15 : 31)) {
				tmp = stream.read(5);
				for (; i < samples; i++)
					decoded[sample++] = stream.read(tmp, true);
					
			} else {
				for (; i < samples; i++)
					decoded[sample++] = this.golomb(tmp, INT_MAX, 0);
			}
			
			i = 0;
		}
	};
	
	const MIN_CACHE_BITS = 25;
	
	this.golomb = function(k, limit, esc_len) {
		var data = this.bitstream,
			offset = data.bitPosition,
			buf = data.peek(32 - offset) << offset,
			v = 0;
		
		var log = 31 - clz(buf | 1); // log2(buf)

		if (log - k >= 32 - MIN_CACHE_BITS && 32 - log < limit) {
			buf >>>= log - k;
			buf += (30 - log) << k;

			data.advance(32 + k - log);
			v = buf;
			
		} else {
			for (var i = 0; data.read(1) === 0; i++)
				buf = data.peek(32 - offset) << offset;

			if (i < limit - 1) {
				if (k)
					buf = data.read(k);
				else
					buf = 0;

				v = buf + (i << k);
				
			} else if (i === limit - 1) {
				buf = data.read(esc_len);
				v = buf + 1;
				
			} else {
				v = -1;
			}
		}
		
		return (v >> 1) ^ -(v & 1);
	};
	
	// Should be in the damned standard library...
	function clz(input) {
		var output = 0,
			curbyte = 0;

		while(true) { // emulate goto in JS using the break statement :D
			curbyte = input >>> 24;
			if (curbyte) break;
			output += 8;

			curbyte = input >>> 16;
			if (curbyte & 0xff) break;
			output += 8;

			curbyte = input >>> 8;
			if (curbyte & 0xff) break;
			output += 8;

			curbyte = input;
			if (curbyte & 0xff) break;
			output += 8;

			return output;
		}

		if (!(curbyte & 0xf0))
			output += 4;
		else
			curbyte >>>= 4;

		if (curbyte & 0x8)
			return output;
			
		if (curbyte & 0x4)
			return output + 1;
			
		if (curbyte & 0x2)
			return output + 2;
			
		if (curbyte & 0x1)
			return output + 3;

		// shouldn't get here
		return output + 4;
	}



	Decoder.call( this, demuxer, format );

};



Decoder.register('flac', FLACDecoder);

FLACDecoder.prototype = Object.create( Decoder.prototype );