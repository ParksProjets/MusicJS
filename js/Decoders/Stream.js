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