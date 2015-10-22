(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', 'esast/dist/Loc', '../util'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('esast/dist/Loc'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Loc, global.util);
		global.Slice = mod.exports;
	}
})(this, function (exports, module, _esastDistLoc, _util) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	/**
 Represents a slice of the `subTokens` of some {@link Group}.
 This is just a view of it, so taking e.g. {@link tail} is O(1).
 Most parser functions act on a Slice and call other functions on sub-slices.
 */

	class Slice {
		/**
  Slice representing all subTokens of a {@link Group}.
  @type {Group} group
  */
		static group(group) {
			return new Slice(group.subTokens, 0, group.subTokens.length, group.loc);
		}

		/** @private */
		constructor(tokens, start, end, loc) {
			/**
   Array of tokens in use.
   The slice will only use the ones from `start` to `end`.
   (This is more efficient than calling {@link Array#slice} many times.)
   @type {Array<Token>}
   */
			this._tokens = tokens;
			/**
   Inclusive; index of first token in the slice.
   @type {number}
   */
			this._start = start;
			/**
   Exclusive; index of first token *not* in the slice.
   @type {number}
   */
			this._end = end;
			/**
   Slice keeps track of changes to `loc` as sub-slices are made,
   so most parser functions will call `tokens.loc` when constructing the {@link MsAst}.
   @type {Loc}
   */
			this.loc = loc;
		}

		/** Number of tokens. */
		size() {
			return this._end - this._start;
		}

		/** True iff there are no tokens left. */
		isEmpty() {
			return this._start === this._end;
		}

		// For these methods, caller must ensure non-empty.

		/** First token. */
		head() {
			return this._tokens[this._start];
		}

		/** Slice of first token. */
		headSlice() {
			return Slice.group(this.head());
		}

		/** Second token. */
		second() {
			return this._tokens[this._start + 1];
		}

		/** Last token. */
		last() {
			return this._tokens[this._end - 1];
		}

		/** Second-to-last token. */
		nextToLast() {
			return this._tokens[this._end - 2];
		}

		/** Slice of all but the first token. */
		tail() {
			return this._chopStart(this._start + 1);
		}

		/** Slice of all but the last token. */
		rtail() {
			return this._chopEnd(this._end - 1);
		}

		/**
  Splits on the first token satisfying `splitOn`.
  @splitOn {function(token:Token): boolean}
  @return {?{before: Slice, at: Token, after: Slice}}
  */
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

		/**
  Splits on *every* token satisfying `splitOn`.
  @splitOn {function(token:Token): boolean}
  @return {?{Array<{before: Slice, at: Token>}}
  	Last output will not have `at`.
  */
		opSplitMany(splitOn) {
			let iLast = this._start;
			const out = [];
			for (let i = this._start; i < this._end; i = i + 1) {
				const token = this._tokens[i];
				if (splitOn(token)) {
					out.push({ before: this._chop(iLast, i), at: token });
					iLast = i + 1;
				}
			}

			return (0, _util.opIf)(!(0, _util.isEmpty)(out), () => {
				out.push({ before: this._chopStart(iLast) });
				return out;
			});
		}

		/** Iterate over every Token. */
		*[Symbol.iterator]() {
			for (let i = this._start; i < this._end; i = i + 1) yield this._tokens[i];
		}

		/**
  Iterator over a Slice for every Token.
  Assumes every sub-token is a Slice too; meaning this is a {@link Group.Block} slice.
  */
		*slices() {
			for (const _ of this) yield Slice.group(_);
		}

		/**
  Maps over every Token.
  @param {function(token:Token)} mapper
  */
		map(mapper) {
			const out = [];
			for (const _ of this) out.push(mapper(_));
			return out;
		}

		/** Maps over a Slice for every Token, as in {@link slices}.	*/
		mapSlices(f) {
			const out = [];
			for (const _ of this.slices()) out.push(f(_));
			return out;
		}

		_chop(newStart, newEnd) {
			const loc = new _Loc.default(this._tokens[newStart].loc.start, this._tokens[newEnd - 1].loc.end);
			return new Slice(this._tokens, newStart, newEnd, loc);
		}

		_chopStart(newStart) {
			const loc = newStart === this._end ? this.loc : new _Loc.default(this._tokens[newStart].loc.start, this.loc.end);
			return new Slice(this._tokens, newStart, this._end, loc);
		}

		_chopEnd(newEnd) {
			const loc = newEnd === this._start ? this.loc : new _Loc.default(this.loc.start, this._tokens[newEnd - 1].loc.end);
			return new Slice(this._tokens, this._start, newEnd, loc);
		}
	}

	module.exports = Slice;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL1NsaWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRZSxPQUFNLEtBQUssQ0FBQzs7Ozs7QUFLMUIsU0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ25CLFVBQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQ3ZFOzs7QUFHRCxhQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFOzs7Ozs7O0FBT3BDLE9BQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBOzs7OztBQUtyQixPQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTs7Ozs7QUFLbkIsT0FBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUE7Ozs7OztBQU1mLE9BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO0dBQ2Q7OztBQUdELE1BQUksR0FBRztBQUNOLFVBQU8sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO0dBQzlCOzs7QUFHRCxTQUFPLEdBQUc7QUFDVCxVQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQTtHQUNoQzs7Ozs7QUFLRCxNQUFJLEdBQUc7QUFDTixVQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBQ2hDOzs7QUFHRCxXQUFTLEdBQUc7QUFDWCxVQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7R0FDL0I7OztBQUdELFFBQU0sR0FBRztBQUNSLFVBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0dB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Q2pDLElBQUksQ0FBQyxHQUFHLEdBQ1IsaUJBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzFELFVBQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtHQUN4RDtFQUNEOztrQkFoTG9CLEtBQUsiLCJmaWxlIjoiU2xpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtpc0VtcHR5LCBvcElmfSBmcm9tICcuLi91dGlsJ1xuXG4vKipcblJlcHJlc2VudHMgYSBzbGljZSBvZiB0aGUgYHN1YlRva2Vuc2Agb2Ygc29tZSB7QGxpbmsgR3JvdXB9LlxuVGhpcyBpcyBqdXN0IGEgdmlldyBvZiBpdCwgc28gdGFraW5nIGUuZy4ge0BsaW5rIHRhaWx9IGlzIE8oMSkuXG5Nb3N0IHBhcnNlciBmdW5jdGlvbnMgYWN0IG9uIGEgU2xpY2UgYW5kIGNhbGwgb3RoZXIgZnVuY3Rpb25zIG9uIHN1Yi1zbGljZXMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2xpY2Uge1xuXHQvKipcblx0U2xpY2UgcmVwcmVzZW50aW5nIGFsbCBzdWJUb2tlbnMgb2YgYSB7QGxpbmsgR3JvdXB9LlxuXHRAdHlwZSB7R3JvdXB9IGdyb3VwXG5cdCovXG5cdHN0YXRpYyBncm91cChncm91cCkge1xuXHRcdHJldHVybiBuZXcgU2xpY2UoZ3JvdXAuc3ViVG9rZW5zLCAwLCBncm91cC5zdWJUb2tlbnMubGVuZ3RoLCBncm91cC5sb2MpXG5cdH1cblxuXHQvKiogQHByaXZhdGUgKi9cblx0Y29uc3RydWN0b3IodG9rZW5zLCBzdGFydCwgZW5kLCBsb2MpIHtcblx0XHQvKipcblx0XHRBcnJheSBvZiB0b2tlbnMgaW4gdXNlLlxuXHRcdFRoZSBzbGljZSB3aWxsIG9ubHkgdXNlIHRoZSBvbmVzIGZyb20gYHN0YXJ0YCB0byBgZW5kYC5cblx0XHQoVGhpcyBpcyBtb3JlIGVmZmljaWVudCB0aGFuIGNhbGxpbmcge0BsaW5rIEFycmF5I3NsaWNlfSBtYW55IHRpbWVzLilcblx0XHRAdHlwZSB7QXJyYXk8VG9rZW4+fVxuXHRcdCovXG5cdFx0dGhpcy5fdG9rZW5zID0gdG9rZW5zXG5cdFx0LyoqXG5cdFx0SW5jbHVzaXZlOyBpbmRleCBvZiBmaXJzdCB0b2tlbiBpbiB0aGUgc2xpY2UuXG5cdFx0QHR5cGUge251bWJlcn1cblx0XHQqL1xuXHRcdHRoaXMuX3N0YXJ0ID0gc3RhcnRcblx0XHQvKipcblx0XHRFeGNsdXNpdmU7IGluZGV4IG9mIGZpcnN0IHRva2VuICpub3QqIGluIHRoZSBzbGljZS5cblx0XHRAdHlwZSB7bnVtYmVyfVxuXHRcdCovXG5cdFx0dGhpcy5fZW5kID0gZW5kXG5cdFx0LyoqXG5cdFx0U2xpY2Uga2VlcHMgdHJhY2sgb2YgY2hhbmdlcyB0byBgbG9jYCBhcyBzdWItc2xpY2VzIGFyZSBtYWRlLFxuXHRcdHNvIG1vc3QgcGFyc2VyIGZ1bmN0aW9ucyB3aWxsIGNhbGwgYHRva2Vucy5sb2NgIHdoZW4gY29uc3RydWN0aW5nIHRoZSB7QGxpbmsgTXNBc3R9LlxuXHRcdEB0eXBlIHtMb2N9XG5cdFx0Ki9cblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG5cblx0LyoqIE51bWJlciBvZiB0b2tlbnMuICovXG5cdHNpemUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2VuZCAtIHRoaXMuX3N0YXJ0XG5cdH1cblxuXHQvKiogVHJ1ZSBpZmYgdGhlcmUgYXJlIG5vIHRva2VucyBsZWZ0LiAqL1xuXHRpc0VtcHR5KCkge1xuXHRcdHJldHVybiB0aGlzLl9zdGFydCA9PT0gdGhpcy5fZW5kXG5cdH1cblxuXHQvLyBGb3IgdGhlc2UgbWV0aG9kcywgY2FsbGVyIG11c3QgZW5zdXJlIG5vbi1lbXB0eS5cblxuXHQvKiogRmlyc3QgdG9rZW4uICovXG5cdGhlYWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3Rva2Vuc1t0aGlzLl9zdGFydF1cblx0fVxuXG5cdC8qKiBTbGljZSBvZiBmaXJzdCB0b2tlbi4gKi9cblx0aGVhZFNsaWNlKCkge1xuXHRcdHJldHVybiBTbGljZS5ncm91cCh0aGlzLmhlYWQoKSlcblx0fVxuXG5cdC8qKiBTZWNvbmQgdG9rZW4uICovXG5cdHNlY29uZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3RoaXMuX3N0YXJ0ICsgMV1cblx0fVxuXG5cdC8qKiBMYXN0IHRva2VuLiAqL1xuXHRsYXN0KCkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdGhpcy5fZW5kIC0gMV1cblx0fVxuXG5cdC8qKiBTZWNvbmQtdG8tbGFzdCB0b2tlbi4gKi9cblx0bmV4dFRvTGFzdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3RoaXMuX2VuZCAtIDJdXG5cdH1cblxuXHQvKiogU2xpY2Ugb2YgYWxsIGJ1dCB0aGUgZmlyc3QgdG9rZW4uICovXG5cdHRhaWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2Nob3BTdGFydCh0aGlzLl9zdGFydCArIDEpXG5cdH1cblxuXHQvKiogU2xpY2Ugb2YgYWxsIGJ1dCB0aGUgbGFzdCB0b2tlbi4gKi9cblx0cnRhaWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2Nob3BFbmQodGhpcy5fZW5kIC0gMSlcblx0fVxuXG5cdC8qKlxuXHRTcGxpdHMgb24gdGhlIGZpcnN0IHRva2VuIHNhdGlzZnlpbmcgYHNwbGl0T25gLlxuXHRAc3BsaXRPbiB7ZnVuY3Rpb24odG9rZW46VG9rZW4pOiBib29sZWFufVxuXHRAcmV0dXJuIHs/e2JlZm9yZTogU2xpY2UsIGF0OiBUb2tlbiwgYWZ0ZXI6IFNsaWNlfX1cblx0Ki9cblx0b3BTcGxpdE9uY2Uoc3BsaXRPbikge1xuXHRcdGZvciAobGV0IGkgPSB0aGlzLl9zdGFydDsgaSA8IHRoaXMuX2VuZDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRjb25zdCB0b2tlbiA9IHRoaXMuX3Rva2Vuc1tpXVxuXHRcdFx0aWYgKHNwbGl0T24odG9rZW4pKVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGJlZm9yZTogdGhpcy5fY2hvcEVuZChpKSxcblx0XHRcdFx0XHRhdDogdG9rZW4sXG5cdFx0XHRcdFx0YWZ0ZXI6IHRoaXMuX2Nob3BTdGFydChpICsgMSlcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0LyoqXG5cdFNwbGl0cyBvbiAqZXZlcnkqIHRva2VuIHNhdGlzZnlpbmcgYHNwbGl0T25gLlxuXHRAc3BsaXRPbiB7ZnVuY3Rpb24odG9rZW46VG9rZW4pOiBib29sZWFufVxuXHRAcmV0dXJuIHs/e0FycmF5PHtiZWZvcmU6IFNsaWNlLCBhdDogVG9rZW4+fX1cblx0XHRMYXN0IG91dHB1dCB3aWxsIG5vdCBoYXZlIGBhdGAuXG5cdCovXG5cdG9wU3BsaXRNYW55KHNwbGl0T24pIHtcblx0XHRsZXQgaUxhc3QgPSB0aGlzLl9zdGFydFxuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IHRoaXMuX3N0YXJ0OyBpIDwgdGhpcy5fZW5kOyBpID0gaSArIDEpIHtcblx0XHRcdGNvbnN0IHRva2VuID0gdGhpcy5fdG9rZW5zW2ldXG5cdFx0XHRpZiAoc3BsaXRPbih0b2tlbikpIHtcblx0XHRcdFx0b3V0LnB1c2goe2JlZm9yZTogdGhpcy5fY2hvcChpTGFzdCwgaSksIGF0OiB0b2tlbn0pXG5cdFx0XHRcdGlMYXN0ID0gaSArIDFcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb3BJZighaXNFbXB0eShvdXQpLCAoKSA9PiB7XG5cdFx0XHRvdXQucHVzaCh7YmVmb3JlOiB0aGlzLl9jaG9wU3RhcnQoaUxhc3QpfSlcblx0XHRcdHJldHVybiBvdXRcblx0XHR9KVxuXHR9XG5cblx0LyoqIEl0ZXJhdGUgb3ZlciBldmVyeSBUb2tlbi4gKi9cblx0KiBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcblx0XHRmb3IgKGxldCBpID0gdGhpcy5fc3RhcnQ7IGkgPCB0aGlzLl9lbmQ7IGkgPSBpICsgMSlcblx0XHRcdHlpZWxkIHRoaXMuX3Rva2Vuc1tpXVxuXHR9XG5cblx0LyoqXG5cdEl0ZXJhdG9yIG92ZXIgYSBTbGljZSBmb3IgZXZlcnkgVG9rZW4uXG5cdEFzc3VtZXMgZXZlcnkgc3ViLXRva2VuIGlzIGEgU2xpY2UgdG9vOyBtZWFuaW5nIHRoaXMgaXMgYSB7QGxpbmsgR3JvdXAuQmxvY2t9IHNsaWNlLlxuXHQqL1xuXHQqIHNsaWNlcygpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcylcblx0XHRcdHlpZWxkIFNsaWNlLmdyb3VwKF8pXG5cdH1cblxuXHQvKipcblx0TWFwcyBvdmVyIGV2ZXJ5IFRva2VuLlxuXHRAcGFyYW0ge2Z1bmN0aW9uKHRva2VuOlRva2VuKX0gbWFwcGVyXG5cdCovXG5cdG1hcChtYXBwZXIpIHtcblx0XHRjb25zdCBvdXQgPSBbXVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzKVxuXHRcdFx0b3V0LnB1c2gobWFwcGVyKF8pKVxuXHRcdHJldHVybiBvdXRcblx0fVxuXG5cdC8qKiBNYXBzIG92ZXIgYSBTbGljZSBmb3IgZXZlcnkgVG9rZW4sIGFzIGluIHtAbGluayBzbGljZXN9Llx0Ki9cblx0bWFwU2xpY2VzKGYpIHtcblx0XHRjb25zdCBvdXQgPSBbXVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnNsaWNlcygpKVxuXHRcdFx0b3V0LnB1c2goZihfKSlcblx0XHRyZXR1cm4gb3V0XG5cdH1cblxuXHRfY2hvcChuZXdTdGFydCwgbmV3RW5kKSB7XG5cdFx0Y29uc3QgbG9jID0gbmV3IExvYyh0aGlzLl90b2tlbnNbbmV3U3RhcnRdLmxvYy5zdGFydCwgdGhpcy5fdG9rZW5zW25ld0VuZCAtIDFdLmxvYy5lbmQpXG5cdFx0cmV0dXJuIG5ldyBTbGljZSh0aGlzLl90b2tlbnMsIG5ld1N0YXJ0LCBuZXdFbmQsIGxvYylcblx0fVxuXG5cdF9jaG9wU3RhcnQobmV3U3RhcnQpIHtcblx0XHRjb25zdCBsb2MgPSBuZXdTdGFydCA9PT0gdGhpcy5fZW5kID9cblx0XHRcdHRoaXMubG9jIDpcblx0XHRcdG5ldyBMb2ModGhpcy5fdG9rZW5zW25ld1N0YXJ0XS5sb2Muc3RhcnQsIHRoaXMubG9jLmVuZClcblx0XHRyZXR1cm4gbmV3IFNsaWNlKHRoaXMuX3Rva2VucywgbmV3U3RhcnQsIHRoaXMuX2VuZCwgbG9jKVxuXHR9XG5cblx0X2Nob3BFbmQobmV3RW5kKSB7XG5cdFx0Y29uc3QgbG9jID0gbmV3RW5kID09PSB0aGlzLl9zdGFydCA/XG5cdFx0XHR0aGlzLmxvYyA6XG5cdFx0XHRuZXcgTG9jKHRoaXMubG9jLnN0YXJ0LCB0aGlzLl90b2tlbnNbbmV3RW5kIC0gMV0ubG9jLmVuZClcblx0XHRyZXR1cm4gbmV3IFNsaWNlKHRoaXMuX3Rva2VucywgdGhpcy5fc3RhcnQsIG5ld0VuZCwgbG9jKVxuXHR9XG59XG4iXX0=