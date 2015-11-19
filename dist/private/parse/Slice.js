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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJTbGljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=