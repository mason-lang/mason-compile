'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.util);
		global.Slice = mod.exports;
	}
})(this, function (exports, _Loc, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _Loc2 = _interopRequireDefault(_Loc);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class Slice {
		static group(group) {
			return new Slice(group.subTokens, 0, group.subTokens.length, group.loc);
		}

		constructor(tokens, start, end, loc) {
			this._tokens = tokens;
			this._start = start;
			this._end = end;
			this.loc = loc;
		}

		size() {
			return this._end - this._start;
		}

		isEmpty() {
			return this._start === this._end;
		}

		head() {
			return this._tokens[this._start];
		}

		headSlice() {
			return Slice.group(this.head());
		}

		second() {
			return this._tokens[this._start + 1];
		}

		last() {
			return this._tokens[this._end - 1];
		}

		nextToLast() {
			return this._tokens[this._end - 2];
		}

		tail() {
			return this._chopStart(this._start + 1);
		}

		rtail() {
			return this._chopEnd(this._end - 1);
		}

		opSplitOnce(splitOn) {
			for (let i = this._start; i < this._end; i = i + 1) {
				const token = this._tokens[i];
				if (splitOn(token)) return {
					before: this._chopEnd(i),
					at: token,
					after: this._chopStart(i + 1)
				};
			}

			return null;
		}

		opSplitMany(splitOn) {
			let iLast = this._start;
			const out = [];

			for (let i = this._start; i < this._end; i = i + 1) {
				const token = this._tokens[i];

				if (splitOn(token)) {
					out.push({
						before: this._chop(iLast, i),
						at: token
					});
					iLast = i + 1;
				}
			}

			return (0, _util.opIf)(!(0, _util.isEmpty)(out), () => {
				out.push({
					before: this._chopStart(iLast)
				});
				return out;
			});
		}

		*[Symbol.iterator]() {
			for (let i = this._start; i < this._end; i = i + 1) yield this._tokens[i];
		}

		*slices() {
			for (const _ of this) yield Slice.group(_);
		}

		map(mapper) {
			const out = [];

			for (const _ of this) out.push(mapper(_));

			return out;
		}

		mapSlices(f) {
			const out = [];

			for (const _ of this.slices()) out.push(f(_));

			return out;
		}

		_chop(newStart, newEnd) {
			const loc = new _Loc2.default(this._tokens[newStart].loc.start, this._tokens[newEnd - 1].loc.end);
			return new Slice(this._tokens, newStart, newEnd, loc);
		}

		_chopStart(newStart) {
			const loc = newStart === this._end ? this.loc : new _Loc2.default(this._tokens[newStart].loc.start, this.loc.end);
			return new Slice(this._tokens, newStart, this._end, loc);
		}

		_chopEnd(newEnd) {
			const loc = newEnd === this._start ? this.loc : new _Loc2.default(this.loc.start, this._tokens[newEnd - 1].loc.end);
			return new Slice(this._tokens, this._start, newEnd, loc);
		}

	}

	exports.default = Slice;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL1NsaWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQVFxQixLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQUwsS0FBSyIsImZpbGUiOiJTbGljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2lzRW1wdHksIG9wSWZ9IGZyb20gJy4uL3V0aWwnXG5cbi8qKlxuUmVwcmVzZW50cyBhIHNsaWNlIG9mIHRoZSBgc3ViVG9rZW5zYCBvZiBzb21lIHtAbGluayBHcm91cH0uXG5UaGlzIGlzIGp1c3QgYSB2aWV3IG9mIGl0LCBzbyB0YWtpbmcgZS5nLiB7QGxpbmsgdGFpbH0gaXMgTygxKS5cbk1vc3QgcGFyc2VyIGZ1bmN0aW9ucyBhY3Qgb24gYSBTbGljZSBhbmQgY2FsbCBvdGhlciBmdW5jdGlvbnMgb24gc3ViLXNsaWNlcy5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbGljZSB7XG5cdC8qKlxuXHRTbGljZSByZXByZXNlbnRpbmcgYWxsIHN1YlRva2VucyBvZiBhIHtAbGluayBHcm91cH0uXG5cdEB0eXBlIHtHcm91cH0gZ3JvdXBcblx0Ki9cblx0c3RhdGljIGdyb3VwKGdyb3VwKSB7XG5cdFx0cmV0dXJuIG5ldyBTbGljZShncm91cC5zdWJUb2tlbnMsIDAsIGdyb3VwLnN1YlRva2Vucy5sZW5ndGgsIGdyb3VwLmxvYylcblx0fVxuXG5cdC8qKiBAcHJpdmF0ZSAqL1xuXHRjb25zdHJ1Y3Rvcih0b2tlbnMsIHN0YXJ0LCBlbmQsIGxvYykge1xuXHRcdC8qKlxuXHRcdEFycmF5IG9mIHRva2VucyBpbiB1c2UuXG5cdFx0VGhlIHNsaWNlIHdpbGwgb25seSB1c2UgdGhlIG9uZXMgZnJvbSBgc3RhcnRgIHRvIGBlbmRgLlxuXHRcdChUaGlzIGlzIG1vcmUgZWZmaWNpZW50IHRoYW4gY2FsbGluZyB7QGxpbmsgQXJyYXkjc2xpY2V9IG1hbnkgdGltZXMuKVxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLl90b2tlbnMgPSB0b2tlbnNcblx0XHQvKipcblx0XHRJbmNsdXNpdmU7IGluZGV4IG9mIGZpcnN0IHRva2VuIGluIHRoZSBzbGljZS5cblx0XHRAdHlwZSB7bnVtYmVyfVxuXHRcdCovXG5cdFx0dGhpcy5fc3RhcnQgPSBzdGFydFxuXHRcdC8qKlxuXHRcdEV4Y2x1c2l2ZTsgaW5kZXggb2YgZmlyc3QgdG9rZW4gKm5vdCogaW4gdGhlIHNsaWNlLlxuXHRcdEB0eXBlIHtudW1iZXJ9XG5cdFx0Ki9cblx0XHR0aGlzLl9lbmQgPSBlbmRcblx0XHQvKipcblx0XHRTbGljZSBrZWVwcyB0cmFjayBvZiBjaGFuZ2VzIHRvIGBsb2NgIGFzIHN1Yi1zbGljZXMgYXJlIG1hZGUsXG5cdFx0c28gbW9zdCBwYXJzZXIgZnVuY3Rpb25zIHdpbGwgY2FsbCBgdG9rZW5zLmxvY2Agd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIHtAbGluayBNc0FzdH0uXG5cdFx0QHR5cGUge0xvY31cblx0XHQqL1xuXHRcdHRoaXMubG9jID0gbG9jXG5cdH1cblxuXHQvKiogTnVtYmVyIG9mIHRva2Vucy4gKi9cblx0c2l6ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZW5kIC0gdGhpcy5fc3RhcnRcblx0fVxuXG5cdC8qKiBUcnVlIGlmZiB0aGVyZSBhcmUgbm8gdG9rZW5zIGxlZnQuICovXG5cdGlzRW1wdHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXJ0ID09PSB0aGlzLl9lbmRcblx0fVxuXG5cdC8vIEZvciB0aGVzZSBtZXRob2RzLCBjYWxsZXIgbXVzdCBlbnN1cmUgbm9uLWVtcHR5LlxuXG5cdC8qKiBGaXJzdCB0b2tlbi4gKi9cblx0aGVhZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3RoaXMuX3N0YXJ0XVxuXHR9XG5cblx0LyoqIFNsaWNlIG9mIGZpcnN0IHRva2VuLiAqL1xuXHRoZWFkU2xpY2UoKSB7XG5cdFx0cmV0dXJuIFNsaWNlLmdyb3VwKHRoaXMuaGVhZCgpKVxuXHR9XG5cblx0LyoqIFNlY29uZCB0b2tlbi4gKi9cblx0c2Vjb25kKCkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdGhpcy5fc3RhcnQgKyAxXVxuXHR9XG5cblx0LyoqIExhc3QgdG9rZW4uICovXG5cdGxhc3QoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3Rva2Vuc1t0aGlzLl9lbmQgLSAxXVxuXHR9XG5cblx0LyoqIFNlY29uZC10by1sYXN0IHRva2VuLiAqL1xuXHRuZXh0VG9MYXN0KCkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdGhpcy5fZW5kIC0gMl1cblx0fVxuXG5cdC8qKiBTbGljZSBvZiBhbGwgYnV0IHRoZSBmaXJzdCB0b2tlbi4gKi9cblx0dGFpbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hvcFN0YXJ0KHRoaXMuX3N0YXJ0ICsgMSlcblx0fVxuXG5cdC8qKiBTbGljZSBvZiBhbGwgYnV0IHRoZSBsYXN0IHRva2VuLiAqL1xuXHRydGFpbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hvcEVuZCh0aGlzLl9lbmQgLSAxKVxuXHR9XG5cblx0LyoqXG5cdFNwbGl0cyBvbiB0aGUgZmlyc3QgdG9rZW4gc2F0aXNmeWluZyBgc3BsaXRPbmAuXG5cdEBzcGxpdE9uIHtmdW5jdGlvbih0b2tlbjpUb2tlbik6IGJvb2xlYW59XG5cdEByZXR1cm4gez97YmVmb3JlOiBTbGljZSwgYXQ6IFRva2VuLCBhZnRlcjogU2xpY2V9fVxuXHQqL1xuXHRvcFNwbGl0T25jZShzcGxpdE9uKSB7XG5cdFx0Zm9yIChsZXQgaSA9IHRoaXMuX3N0YXJ0OyBpIDwgdGhpcy5fZW5kOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gdGhpcy5fdG9rZW5zW2ldXG5cdFx0XHRpZiAoc3BsaXRPbih0b2tlbikpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0YmVmb3JlOiB0aGlzLl9jaG9wRW5kKGkpLFxuXHRcdFx0XHRcdGF0OiB0b2tlbixcblx0XHRcdFx0XHRhZnRlcjogdGhpcy5fY2hvcFN0YXJ0KGkgKyAxKVxuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBudWxsXG5cdH1cblxuXHQvKipcblx0U3BsaXRzIG9uICpldmVyeSogdG9rZW4gc2F0aXNmeWluZyBgc3BsaXRPbmAuXG5cdEBzcGxpdE9uIHtmdW5jdGlvbih0b2tlbjpUb2tlbik6IGJvb2xlYW59XG5cdEByZXR1cm4gez97QXJyYXk8e2JlZm9yZTogU2xpY2UsIGF0OiBUb2tlbj59fVxuXHRcdExhc3Qgb3V0cHV0IHdpbGwgbm90IGhhdmUgYGF0YC5cblx0Ki9cblx0b3BTcGxpdE1hbnkoc3BsaXRPbikge1xuXHRcdGxldCBpTGFzdCA9IHRoaXMuX3N0YXJ0XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGxldCBpID0gdGhpcy5fc3RhcnQ7IGkgPCB0aGlzLl9lbmQ7IGkgPSBpICsgMSkge1xuXHRcdFx0Y29uc3QgdG9rZW4gPSB0aGlzLl90b2tlbnNbaV1cblx0XHRcdGlmIChzcGxpdE9uKHRva2VuKSkge1xuXHRcdFx0XHRvdXQucHVzaCh7YmVmb3JlOiB0aGlzLl9jaG9wKGlMYXN0LCBpKSwgYXQ6IHRva2VufSlcblx0XHRcdFx0aUxhc3QgPSBpICsgMVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvcElmKCFpc0VtcHR5KG91dCksICgpID0+IHtcblx0XHRcdG91dC5wdXNoKHtiZWZvcmU6IHRoaXMuX2Nob3BTdGFydChpTGFzdCl9KVxuXHRcdFx0cmV0dXJuIG91dFxuXHRcdH0pXG5cdH1cblxuXHQvKiogSXRlcmF0ZSBvdmVyIGV2ZXJ5IFRva2VuLiAqL1xuXHQqIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuXHRcdGZvciAobGV0IGkgPSB0aGlzLl9zdGFydDsgaSA8IHRoaXMuX2VuZDsgaSA9IGkgKyAxKVxuXHRcdFx0eWllbGQgdGhpcy5fdG9rZW5zW2ldXG5cdH1cblxuXHQvKipcblx0SXRlcmF0b3Igb3ZlciBhIFNsaWNlIGZvciBldmVyeSBUb2tlbi5cblx0QXNzdW1lcyBldmVyeSBzdWItdG9rZW4gaXMgYSBTbGljZSB0b287IG1lYW5pbmcgdGhpcyBpcyBhIHtAbGluayBHcm91cC5CbG9ja30gc2xpY2UuXG5cdCovXG5cdCogc2xpY2VzKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzKVxuXHRcdFx0eWllbGQgU2xpY2UuZ3JvdXAoXylcblx0fVxuXG5cdC8qKlxuXHRNYXBzIG92ZXIgZXZlcnkgVG9rZW4uXG5cdEBwYXJhbSB7ZnVuY3Rpb24odG9rZW46VG9rZW4pfSBtYXBwZXJcblx0Ki9cblx0bWFwKG1hcHBlcikge1xuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMpXG5cdFx0XHRvdXQucHVzaChtYXBwZXIoXykpXG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cblx0LyoqIE1hcHMgb3ZlciBhIFNsaWNlIGZvciBldmVyeSBUb2tlbiwgYXMgaW4ge0BsaW5rIHNsaWNlc30uXHQqL1xuXHRtYXBTbGljZXMoZikge1xuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc2xpY2VzKCkpXG5cdFx0XHRvdXQucHVzaChmKF8pKVxuXHRcdHJldHVybiBvdXRcblx0fVxuXG5cdF9jaG9wKG5ld1N0YXJ0LCBuZXdFbmQpIHtcblx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKHRoaXMuX3Rva2Vuc1tuZXdTdGFydF0ubG9jLnN0YXJ0LCB0aGlzLl90b2tlbnNbbmV3RW5kIC0gMV0ubG9jLmVuZClcblx0XHRyZXR1cm4gbmV3IFNsaWNlKHRoaXMuX3Rva2VucywgbmV3U3RhcnQsIG5ld0VuZCwgbG9jKVxuXHR9XG5cblx0X2Nob3BTdGFydChuZXdTdGFydCkge1xuXHRcdGNvbnN0IGxvYyA9IG5ld1N0YXJ0ID09PSB0aGlzLl9lbmQgP1xuXHRcdFx0dGhpcy5sb2MgOlxuXHRcdFx0bmV3IExvYyh0aGlzLl90b2tlbnNbbmV3U3RhcnRdLmxvYy5zdGFydCwgdGhpcy5sb2MuZW5kKVxuXHRcdHJldHVybiBuZXcgU2xpY2UodGhpcy5fdG9rZW5zLCBuZXdTdGFydCwgdGhpcy5fZW5kLCBsb2MpXG5cdH1cblxuXHRfY2hvcEVuZChuZXdFbmQpIHtcblx0XHRjb25zdCBsb2MgPSBuZXdFbmQgPT09IHRoaXMuX3N0YXJ0ID9cblx0XHRcdHRoaXMubG9jIDpcblx0XHRcdG5ldyBMb2ModGhpcy5sb2Muc3RhcnQsIHRoaXMuX3Rva2Vuc1tuZXdFbmQgLSAxXS5sb2MuZW5kKVxuXHRcdHJldHVybiBuZXcgU2xpY2UodGhpcy5fdG9rZW5zLCB0aGlzLl9zdGFydCwgbmV3RW5kLCBsb2MpXG5cdH1cbn1cbiJdfQ==