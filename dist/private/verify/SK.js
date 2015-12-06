'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../util', '../VerifyResults', './autoBlockKind', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../util'), require('../VerifyResults'), require('./autoBlockKind'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.util, global.VerifyResults, global.autoBlockKind, global.context);
		global.SK = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _util, _VerifyResults, _autoBlockKind, _context2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.checkDo = checkDo;
	exports.checkVal = checkVal;
	exports.markStatement = markStatement;
	exports.getSK = getSK;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _autoBlockKind2 = _interopRequireDefault(_autoBlockKind);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	const SK = {
		Do: 0,
		Val: 1
	};
	exports.default = SK;

	function checkDo(_, sk) {
		(0, _context.check)(sk === SK.Do, _.loc, 'statementAsValue');
	}

	function checkVal(_, sk) {
		if (sk === SK.Do) (0, _context.warn)(_.loc, 'valueAsStatement');
	}

	function markStatement(_, sk) {
		if (sk === SK.Do) _context2.results.statements.add(_);
	}

	function getSK(_) {
		return (0, _util.opOr)(_.opSK(), () => SK.Val);
	}

	(0, _util.implementMany)(MsAstTypes, 'opSK', {
		Do() {
			return SK.Do;
		},

		Val() {
			return SK.Val;
		},

		Call() {
			return null;
		},

		Del() {
			return null;
		},

		Yield() {
			return null;
		},

		YieldTo() {
			return null;
		},

		Block() {
			return (0, _autoBlockKind2.default)(this.lines, this.loc) === _VerifyResults.Blocks.Return ? (0, _util.isEmpty)(this.lines) ? SK.Do : (0, _util.last)(this.lines).opSK() : SK.Val;
		},

		Conditional() {
			return this.result.opSK();
		},

		Except() {
			const catches = this.allCatches.map(_ => _.block);
			const parts = (0, _util.ifElse)(this.opElse, _ => (0, _util.cat)(_, catches), () => (0, _util.cat)(this.try, catches));
			return compositeSK(this.loc, parts);
		},

		For() {
			return (0, _util.opOr)(this.block.opForSK(), () => SK.Do);
		},

		Case: caseSwitchSK,
		Switch: caseSwitchSK
	});

	function caseSwitchSK() {
		return compositeSK(this.loc, caseSwitchParts(this));
	}

	(0, _util.implementMany)(MsAstTypes, 'opForSK', {
		default() {
			return null;
		},

		Break() {
			return this.opValue === null ? SK.Do : SK.Val;
		},

		Block() {
			return (0, _util.isEmpty)(this.lines) ? null : compositeForSK(this.loc, this.lines);
		},

		Conditional() {
			return this.result.opForSK();
		},

		Case: caseSwitchForSK,

		Except() {
			const catches = this.allCatches.map(_ => _.block);
			return compositeForSK(this.loc, (0, _util.cat)(this.try, catches, this.opElse, this.opFinally));
		},

		Switch: caseSwitchForSK
	});

	function caseSwitchForSK() {
		return compositeForSK(this.loc, caseSwitchParts(this));
	}

	function caseSwitchParts(_) {
		return (0, _util.cat)(_.parts.map(_ => _.result), _.opElse);
	}

	function compositeSK(loc, parts) {
		return composite(loc, 'opSK', parts, 'ambiguousSK');
	}

	function compositeForSK(loc, parts) {
		return composite(loc, 'opForSK', parts, 'ambiguousForSK');
	}

	function composite(loc, method, parts, errorCode) {
		let sk = parts[0][method]();

		for (let i = 1; i < parts.length; i = i + 1) {
			const otherSK = parts[i][method]();
			if (sk === null) sk = otherSK;else (0, _context.check)(otherSK === null || otherSK === sk, loc, errorCode);
		}

		return sk;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9TSy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FpQmdCLE9BQU8sR0FBUCxPQUFPO1NBS1AsUUFBUSxHQUFSLFFBQVE7U0FTUixhQUFhLEdBQWIsYUFBYTtTQVNiLEtBQUssR0FBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBMUJOLEVBQUU7O1VBR0QsT0FBTzs7OztVQUtQLFFBQVE7Ozs7VUFTUixhQUFhOzs7O1VBU2IsS0FBSyIsImZpbGUiOiJTSy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtjYXQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BPcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QmxvY2tzfSBmcm9tICcuLi9WZXJpZnlSZXN1bHRzJ1xuaW1wb3J0IGF1dG9CbG9ja0tpbmQgZnJvbSAnLi9hdXRvQmxvY2tLaW5kJ1xuaW1wb3J0IHtyZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5cbmNvbnN0IFNLID0ge1xuXHQvKiogTXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cblx0RG86IDAsXG5cdC8qKiBNdXN0IGJlIGFuIGV4cHJlc3Npb24uICovXG5cdFZhbDogMVxufVxuLyoqIFN0YXRlbWVudCBLaW5kLiAqL1xuZXhwb3J0IGRlZmF1bHQgU0tcblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RvKF8sIHNrKSB7XG5cdGNoZWNrKHNrID09PSBTSy5EbywgXy5sb2MsICdzdGF0ZW1lbnRBc1ZhbHVlJylcbn1cblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVmFsKF8sIHNrKSB7XG5cdGlmIChzayA9PT0gU0suRG8pXG5cdFx0d2FybihfLmxvYywgJ3ZhbHVlQXNTdGF0ZW1lbnQnKVxufVxuXG4vKipcblRoaXMgaXMgYW4gTXNBc3QgdGhhdCBpcyBzb21ldGltZXMgYSBzdGF0ZW1lbnQsIHNvbWV0aW1lcyBhbiBleHByZXNzaW9uLlxuTWFyayBpdCB1c2luZyBgc2tgIHNvIHRoYXQgaXQgY2FuIHRyYW5zcGlsZSBjb3JyZWN0bHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtTdGF0ZW1lbnQoXywgc2spIHtcblx0aWYgKHNrID09PSBTSy5Ebylcblx0XHRyZXN1bHRzLnN0YXRlbWVudHMuYWRkKF8pXG59XG5cbi8qKlxuSW5mZXJzIHdoZXRoZXIgdGhlIGxhc3QgbGluZSBvZiBhIG1vZHVsZSBpcyBhIHN0YXRlbWVudCBvciBhIHZhbHVlLlxuUHJlZmVycyB0byBtYWtlIGl0IGEgdmFsdWUsIHN1Y2ggYXMgaW4gdGhlIGNhc2Ugb2YgYSBDYWxsLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTSyhfKSB7XG5cdHJldHVybiBvcE9yKF8ub3BTSygpLCAoKSA9PiBTSy5WYWwpXG59XG5cbi8vIGBudWxsYCBtZWFucyBjYW4ndCBkZXRlcm1pbmUgd2hldGhlciB0aGlzIG11c3QgYmUgYSBzdGF0ZW1lbnQgb3IgdmFsdWUuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcFNLJywge1xuXHREbygpIHtcblx0XHRyZXR1cm4gU0suRG9cblx0fSxcblx0VmFsKCkge1xuXHRcdHJldHVybiBTSy5WYWxcblx0fSxcblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9LFxuXHREZWwoKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fSxcblx0WWllbGQoKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fSxcblx0WWllbGRUbygpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9LFxuXHRCbG9jaygpIHtcblx0XHRyZXR1cm4gYXV0b0Jsb2NrS2luZCh0aGlzLmxpbmVzLCB0aGlzLmxvYykgPT09IEJsb2Nrcy5SZXR1cm4gP1xuXHRcdFx0aXNFbXB0eSh0aGlzLmxpbmVzKSA/IFNLLkRvIDogbGFzdCh0aGlzLmxpbmVzKS5vcFNLKCkgOlxuXHRcdFx0U0suVmFsXG5cdH0sXG5cdENvbmRpdGlvbmFsKCkge1xuXHRcdHJldHVybiB0aGlzLnJlc3VsdC5vcFNLKClcblx0fSxcblx0RXhjZXB0KCkge1xuXHRcdGNvbnN0IGNhdGNoZXMgPSB0aGlzLmFsbENhdGNoZXMubWFwKF8gPT4gXy5ibG9jaylcblx0XHQvLyBJZiB0aGVyZSdzIG9wRWxzZSwgYHRyeWAgaXMgYWx3YXlzIFNLLkRvIGFuZCBgZWxzZWAgbWF5IGJlIFNLLlZhbC5cblx0XHRjb25zdCBwYXJ0cyA9IGlmRWxzZSh0aGlzLm9wRWxzZSwgXyA9PiBjYXQoXywgY2F0Y2hlcyksICgpID0+IGNhdCh0aGlzLnRyeSwgY2F0Y2hlcykpXG5cdFx0Ly8gb3BGaW5hbGx5IGlzIGFsd2F5cyBTSy5Eby5cblx0XHRyZXR1cm4gY29tcG9zaXRlU0sodGhpcy5sb2MsIHBhcnRzKVxuXHR9LFxuXHRGb3IoKSB7XG5cdFx0Ly8gSWYgb3BGb3JTSyBpcyBudWxsLCB0aGVyZSBhcmUgbm8gYnJlYWtzLCBzbyB0aGlzIGlzIGFuIGluZmluaXRlIGxvb3AuXG5cdFx0cmV0dXJuIG9wT3IodGhpcy5ibG9jay5vcEZvclNLKCksICgpID0+IFNLLkRvKVxuXHR9LFxuXHRDYXNlOiBjYXNlU3dpdGNoU0ssXG5cdFN3aXRjaDogY2FzZVN3aXRjaFNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcEZvclNLJywge1xuXHRkZWZhdWx0KCkge1xuXHRcdHJldHVybiBudWxsXG5cdH0sXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiB0aGlzLm9wVmFsdWUgPT09IG51bGwgPyBTSy5EbyA6IFNLLlZhbFxuXHR9LFxuXHRCbG9jaygpIHtcblx0XHRyZXR1cm4gaXNFbXB0eSh0aGlzLmxpbmVzKSA/IG51bGwgOiBjb21wb3NpdGVGb3JTSyh0aGlzLmxvYywgdGhpcy5saW5lcylcblx0fSxcblx0Q29uZGl0aW9uYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVzdWx0Lm9wRm9yU0soKVxuXHR9LFxuXHRDYXNlOiBjYXNlU3dpdGNoRm9yU0ssXG5cdEV4Y2VwdCgpIHtcblx0XHRjb25zdCBjYXRjaGVzID0gdGhpcy5hbGxDYXRjaGVzLm1hcChfID0+IF8uYmxvY2spXG5cdFx0Ly8gRG8gbG9vayBhdCBvcEZpbmFsbHkgZm9yIGJyZWFrIHN0YXRlbWVudHMuXG5cdFx0cmV0dXJuIGNvbXBvc2l0ZUZvclNLKHRoaXMubG9jLCBjYXQodGhpcy50cnksIGNhdGNoZXMsIHRoaXMub3BFbHNlLCB0aGlzLm9wRmluYWxseSkpXG5cdH0sXG5cdFN3aXRjaDogY2FzZVN3aXRjaEZvclNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoRm9yU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVGb3JTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoUGFydHMoXykge1xuXHRyZXR1cm4gY2F0KF8ucGFydHMubWFwKF8gPT4gXy5yZXN1bHQpLCBfLm9wRWxzZSlcbn1cblxuZnVuY3Rpb24gY29tcG9zaXRlU0sobG9jLCBwYXJ0cykge1xuXHRyZXR1cm4gY29tcG9zaXRlKGxvYywgJ29wU0snLCBwYXJ0cywgJ2FtYmlndW91c1NLJylcbn1cblxuLyoqXG5UaGlzIGhhbmRsZXMgdGhlIHJhcmUgY2FzZSB3aGVyZSBhICdmb3InIGxvb3AgaXMgdGhlIGxhc3QgbGluZSBvZiBhIG1vZHVsZS5cblRoZSBlcnJvciBvY2N1cnMgaWYgaXQgbG9va3MgbGlrZTpcblxuXHRmb3Jcblx0XHRzd2l0Y2ggMFxuXHRcdFx0MFxuXHRcdFx0XHRicmVhayAxXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGJyZWFrXG5cbk1lYW5pbmcgdGhhdCBpdCBjYW4ndCBiZSBkZXRlcm1pbmVkIHdoZXRoZXIgaXQncyBhIHN0YXRlbWVudCBvciB2YWx1ZS5cbiovXG5mdW5jdGlvbiBjb21wb3NpdGVGb3JTSyhsb2MsIHBhcnRzKSB7XG5cdHJldHVybiBjb21wb3NpdGUobG9jLCAnb3BGb3JTSycsIHBhcnRzLCAnYW1iaWd1b3VzRm9yU0snKVxufVxuXG5mdW5jdGlvbiBjb21wb3NpdGUobG9jLCBtZXRob2QsIHBhcnRzLCBlcnJvckNvZGUpIHtcblx0bGV0IHNrID0gcGFydHNbMF1bbWV0aG9kXSgpXG5cdGZvciAobGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCBvdGhlclNLID0gcGFydHNbaV1bbWV0aG9kXSgpXG5cdFx0aWYgKHNrID09PSBudWxsKVxuXHRcdFx0c2sgPSBvdGhlclNLXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2sob3RoZXJTSyA9PT0gbnVsbCB8fCBvdGhlclNLID09PSBzaywgbG9jLCBlcnJvckNvZGUpXG5cdH1cblx0cmV0dXJuIHNrXG59XG4iXX0=