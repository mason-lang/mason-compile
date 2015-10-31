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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL1NsaWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BUXFCLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFBTCxLQUFLIiwiZmlsZSI6IlNsaWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7aXNFbXB0eSwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcblxuLyoqXG5SZXByZXNlbnRzIGEgc2xpY2Ugb2YgdGhlIGBzdWJUb2tlbnNgIG9mIHNvbWUge0BsaW5rIEdyb3VwfS5cblRoaXMgaXMganVzdCBhIHZpZXcgb2YgaXQsIHNvIHRha2luZyBlLmcuIHtAbGluayB0YWlsfSBpcyBPKDEpLlxuTW9zdCBwYXJzZXIgZnVuY3Rpb25zIGFjdCBvbiBhIFNsaWNlIGFuZCBjYWxsIG90aGVyIGZ1bmN0aW9ucyBvbiBzdWItc2xpY2VzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWNlIHtcblx0LyoqXG5cdFNsaWNlIHJlcHJlc2VudGluZyBhbGwgc3ViVG9rZW5zIG9mIGEge0BsaW5rIEdyb3VwfS5cblx0QHR5cGUge0dyb3VwfSBncm91cFxuXHQqL1xuXHRzdGF0aWMgZ3JvdXAoZ3JvdXApIHtcblx0XHRyZXR1cm4gbmV3IFNsaWNlKGdyb3VwLnN1YlRva2VucywgMCwgZ3JvdXAuc3ViVG9rZW5zLmxlbmd0aCwgZ3JvdXAubG9jKVxuXHR9XG5cblx0LyoqIEBwcml2YXRlICovXG5cdGNvbnN0cnVjdG9yKHRva2Vucywgc3RhcnQsIGVuZCwgbG9jKSB7XG5cdFx0LyoqXG5cdFx0QXJyYXkgb2YgdG9rZW5zIGluIHVzZS5cblx0XHRUaGUgc2xpY2Ugd2lsbCBvbmx5IHVzZSB0aGUgb25lcyBmcm9tIGBzdGFydGAgdG8gYGVuZGAuXG5cdFx0KFRoaXMgaXMgbW9yZSBlZmZpY2llbnQgdGhhbiBjYWxsaW5nIHtAbGluayBBcnJheSNzbGljZX0gbWFueSB0aW1lcy4pXG5cdFx0QHR5cGUge0FycmF5PFRva2VuPn1cblx0XHQqL1xuXHRcdHRoaXMuX3Rva2VucyA9IHRva2Vuc1xuXHRcdC8qKlxuXHRcdEluY2x1c2l2ZTsgaW5kZXggb2YgZmlyc3QgdG9rZW4gaW4gdGhlIHNsaWNlLlxuXHRcdEB0eXBlIHtudW1iZXJ9XG5cdFx0Ki9cblx0XHR0aGlzLl9zdGFydCA9IHN0YXJ0XG5cdFx0LyoqXG5cdFx0RXhjbHVzaXZlOyBpbmRleCBvZiBmaXJzdCB0b2tlbiAqbm90KiBpbiB0aGUgc2xpY2UuXG5cdFx0QHR5cGUge251bWJlcn1cblx0XHQqL1xuXHRcdHRoaXMuX2VuZCA9IGVuZFxuXHRcdC8qKlxuXHRcdFNsaWNlIGtlZXBzIHRyYWNrIG9mIGNoYW5nZXMgdG8gYGxvY2AgYXMgc3ViLXNsaWNlcyBhcmUgbWFkZSxcblx0XHRzbyBtb3N0IHBhcnNlciBmdW5jdGlvbnMgd2lsbCBjYWxsIGB0b2tlbnMubG9jYCB3aGVuIGNvbnN0cnVjdGluZyB0aGUge0BsaW5rIE1zQXN0fS5cblx0XHRAdHlwZSB7TG9jfVxuXHRcdCovXG5cdFx0dGhpcy5sb2MgPSBsb2Ncblx0fVxuXG5cdC8qKiBOdW1iZXIgb2YgdG9rZW5zLiAqL1xuXHRzaXplKCkge1xuXHRcdHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9zdGFydFxuXHR9XG5cblx0LyoqIFRydWUgaWZmIHRoZXJlIGFyZSBubyB0b2tlbnMgbGVmdC4gKi9cblx0aXNFbXB0eSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhcnQgPT09IHRoaXMuX2VuZFxuXHR9XG5cblx0Ly8gRm9yIHRoZXNlIG1ldGhvZHMsIGNhbGxlciBtdXN0IGVuc3VyZSBub24tZW1wdHkuXG5cblx0LyoqIEZpcnN0IHRva2VuLiAqL1xuXHRoZWFkKCkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdGhpcy5fc3RhcnRdXG5cdH1cblxuXHQvKiogU2xpY2Ugb2YgZmlyc3QgdG9rZW4uICovXG5cdGhlYWRTbGljZSgpIHtcblx0XHRyZXR1cm4gU2xpY2UuZ3JvdXAodGhpcy5oZWFkKCkpXG5cdH1cblxuXHQvKiogU2Vjb25kIHRva2VuLiAqL1xuXHRzZWNvbmQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3Rva2Vuc1t0aGlzLl9zdGFydCArIDFdXG5cdH1cblxuXHQvKiogTGFzdCB0b2tlbi4gKi9cblx0bGFzdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3RoaXMuX2VuZCAtIDFdXG5cdH1cblxuXHQvKiogU2Vjb25kLXRvLWxhc3QgdG9rZW4uICovXG5cdG5leHRUb0xhc3QoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3Rva2Vuc1t0aGlzLl9lbmQgLSAyXVxuXHR9XG5cblx0LyoqIFNsaWNlIG9mIGFsbCBidXQgdGhlIGZpcnN0IHRva2VuLiAqL1xuXHR0YWlsKCkge1xuXHRcdHJldHVybiB0aGlzLl9jaG9wU3RhcnQodGhpcy5fc3RhcnQgKyAxKVxuXHR9XG5cblx0LyoqIFNsaWNlIG9mIGFsbCBidXQgdGhlIGxhc3QgdG9rZW4uICovXG5cdHJ0YWlsKCkge1xuXHRcdHJldHVybiB0aGlzLl9jaG9wRW5kKHRoaXMuX2VuZCAtIDEpXG5cdH1cblxuXHQvKipcblx0U3BsaXRzIG9uIHRoZSBmaXJzdCB0b2tlbiBzYXRpc2Z5aW5nIGBzcGxpdE9uYC5cblx0QHNwbGl0T24ge2Z1bmN0aW9uKHRva2VuOlRva2VuKTogYm9vbGVhbn1cblx0QHJldHVybiB7P3tiZWZvcmU6IFNsaWNlLCBhdDogVG9rZW4sIGFmdGVyOiBTbGljZX19XG5cdCovXG5cdG9wU3BsaXRPbmNlKHNwbGl0T24pIHtcblx0XHRmb3IgKGxldCBpID0gdGhpcy5fc3RhcnQ7IGkgPCB0aGlzLl9lbmQ7IGkgPSBpICsgMSkge1xuXHRcdFx0Y29uc3QgdG9rZW4gPSB0aGlzLl90b2tlbnNbaV1cblx0XHRcdGlmIChzcGxpdE9uKHRva2VuKSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRiZWZvcmU6IHRoaXMuX2Nob3BFbmQoaSksXG5cdFx0XHRcdFx0YXQ6IHRva2VuLFxuXHRcdFx0XHRcdGFmdGVyOiB0aGlzLl9jaG9wU3RhcnQoaSArIDEpXG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXG5cdC8qKlxuXHRTcGxpdHMgb24gKmV2ZXJ5KiB0b2tlbiBzYXRpc2Z5aW5nIGBzcGxpdE9uYC5cblx0QHNwbGl0T24ge2Z1bmN0aW9uKHRva2VuOlRva2VuKTogYm9vbGVhbn1cblx0QHJldHVybiB7P3tBcnJheTx7YmVmb3JlOiBTbGljZSwgYXQ6IFRva2VuPn19XG5cdFx0TGFzdCBvdXRwdXQgd2lsbCBub3QgaGF2ZSBgYXRgLlxuXHQqL1xuXHRvcFNwbGl0TWFueShzcGxpdE9uKSB7XG5cdFx0bGV0IGlMYXN0ID0gdGhpcy5fc3RhcnRcblx0XHRjb25zdCBvdXQgPSBbXVxuXHRcdGZvciAobGV0IGkgPSB0aGlzLl9zdGFydDsgaSA8IHRoaXMuX2VuZDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRjb25zdCB0b2tlbiA9IHRoaXMuX3Rva2Vuc1tpXVxuXHRcdFx0aWYgKHNwbGl0T24odG9rZW4pKSB7XG5cdFx0XHRcdG91dC5wdXNoKHtiZWZvcmU6IHRoaXMuX2Nob3AoaUxhc3QsIGkpLCBhdDogdG9rZW59KVxuXHRcdFx0XHRpTGFzdCA9IGkgKyAxXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9wSWYoIWlzRW1wdHkob3V0KSwgKCkgPT4ge1xuXHRcdFx0b3V0LnB1c2goe2JlZm9yZTogdGhpcy5fY2hvcFN0YXJ0KGlMYXN0KX0pXG5cdFx0XHRyZXR1cm4gb3V0XG5cdFx0fSlcblx0fVxuXG5cdC8qKiBJdGVyYXRlIG92ZXIgZXZlcnkgVG9rZW4uICovXG5cdCogW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG5cdFx0Zm9yIChsZXQgaSA9IHRoaXMuX3N0YXJ0OyBpIDwgdGhpcy5fZW5kOyBpID0gaSArIDEpXG5cdFx0XHR5aWVsZCB0aGlzLl90b2tlbnNbaV1cblx0fVxuXG5cdC8qKlxuXHRJdGVyYXRvciBvdmVyIGEgU2xpY2UgZm9yIGV2ZXJ5IFRva2VuLlxuXHRBc3N1bWVzIGV2ZXJ5IHN1Yi10b2tlbiBpcyBhIFNsaWNlIHRvbzsgbWVhbmluZyB0aGlzIGlzIGEge0BsaW5rIEdyb3VwLkJsb2NrfSBzbGljZS5cblx0Ki9cblx0KiBzbGljZXMoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMpXG5cdFx0XHR5aWVsZCBTbGljZS5ncm91cChfKVxuXHR9XG5cblx0LyoqXG5cdE1hcHMgb3ZlciBldmVyeSBUb2tlbi5cblx0QHBhcmFtIHtmdW5jdGlvbih0b2tlbjpUb2tlbil9IG1hcHBlclxuXHQqL1xuXHRtYXAobWFwcGVyKSB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcylcblx0XHRcdG91dC5wdXNoKG1hcHBlcihfKSlcblx0XHRyZXR1cm4gb3V0XG5cdH1cblxuXHQvKiogTWFwcyBvdmVyIGEgU2xpY2UgZm9yIGV2ZXJ5IFRva2VuLCBhcyBpbiB7QGxpbmsgc2xpY2VzfS5cdCovXG5cdG1hcFNsaWNlcyhmKSB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zbGljZXMoKSlcblx0XHRcdG91dC5wdXNoKGYoXykpXG5cdFx0cmV0dXJuIG91dFxuXHR9XG5cblx0X2Nob3AobmV3U3RhcnQsIG5ld0VuZCkge1xuXHRcdGNvbnN0IGxvYyA9IG5ldyBMb2ModGhpcy5fdG9rZW5zW25ld1N0YXJ0XS5sb2Muc3RhcnQsIHRoaXMuX3Rva2Vuc1tuZXdFbmQgLSAxXS5sb2MuZW5kKVxuXHRcdHJldHVybiBuZXcgU2xpY2UodGhpcy5fdG9rZW5zLCBuZXdTdGFydCwgbmV3RW5kLCBsb2MpXG5cdH1cblxuXHRfY2hvcFN0YXJ0KG5ld1N0YXJ0KSB7XG5cdFx0Y29uc3QgbG9jID0gbmV3U3RhcnQgPT09IHRoaXMuX2VuZCA/XG5cdFx0XHR0aGlzLmxvYyA6XG5cdFx0XHRuZXcgTG9jKHRoaXMuX3Rva2Vuc1tuZXdTdGFydF0ubG9jLnN0YXJ0LCB0aGlzLmxvYy5lbmQpXG5cdFx0cmV0dXJuIG5ldyBTbGljZSh0aGlzLl90b2tlbnMsIG5ld1N0YXJ0LCB0aGlzLl9lbmQsIGxvYylcblx0fVxuXG5cdF9jaG9wRW5kKG5ld0VuZCkge1xuXHRcdGNvbnN0IGxvYyA9IG5ld0VuZCA9PT0gdGhpcy5fc3RhcnQgP1xuXHRcdFx0dGhpcy5sb2MgOlxuXHRcdFx0bmV3IExvYyh0aGlzLmxvYy5zdGFydCwgdGhpcy5fdG9rZW5zW25ld0VuZCAtIDFdLmxvYy5lbmQpXG5cdFx0cmV0dXJuIG5ldyBTbGljZSh0aGlzLl90b2tlbnMsIHRoaXMuX3N0YXJ0LCBuZXdFbmQsIGxvYylcblx0fVxufVxuIl19