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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9TSy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FpQmdCLE9BQU8sR0FBUCxPQUFPO1NBS1AsUUFBUSxHQUFSLFFBQVE7U0FTUixhQUFhLEdBQWIsYUFBYTtTQVNiLEtBQUssR0FBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBMUJOLEVBQUU7O1VBR0QsT0FBTzs7OztVQUtQLFFBQVE7Ozs7VUFTUixhQUFhOzs7O1VBU2IsS0FBSyIsImZpbGUiOiJTSy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtjYXQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BPcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QmxvY2tzfSBmcm9tICcuLi9WZXJpZnlSZXN1bHRzJ1xuaW1wb3J0IGF1dG9CbG9ja0tpbmQgZnJvbSAnLi9hdXRvQmxvY2tLaW5kJ1xuaW1wb3J0IHtyZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5cbmNvbnN0IFNLID0ge1xuXHQvKiogTXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cblx0RG86IDAsXG5cdC8qKiBNdXN0IGJlIGFuIGV4cHJlc3Npb24uICovXG5cdFZhbDogMVxufVxuLyoqIFN0YXRlbWVudCBLaW5kLiAqL1xuZXhwb3J0IGRlZmF1bHQgU0tcblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RvKF8sIHNrKSB7XG5cdGNoZWNrKHNrID09PSBTSy5EbywgXy5sb2MsICdzdGF0ZW1lbnRBc1ZhbHVlJylcbn1cblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVmFsKF8sIHNrKSB7XG5cdGlmIChzayA9PT0gU0suRG8pXG5cdFx0d2FybihfLmxvYywgJ3ZhbHVlQXNTdGF0ZW1lbnQnKVxufVxuXG4vKipcblRoaXMgaXMgYW4gTXNBc3QgdGhhdCBpcyBzb21ldGltZXMgYSBzdGF0ZW1lbnQsIHNvbWV0aW1lcyBhbiBleHByZXNzaW9uLlxuTWFyayBpdCB1c2luZyBgc2tgIHNvIHRoYXQgaXQgY2FuIHRyYW5zcGlsZSBjb3JyZWN0bHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtTdGF0ZW1lbnQoXywgc2spIHtcblx0aWYgKHNrID09PSBTSy5Ebylcblx0XHRyZXN1bHRzLnN0YXRlbWVudHMuYWRkKF8pXG59XG5cbi8qKlxuSW5mZXJzIHdoZXRoZXIgdGhlIGxhc3QgbGluZSBvZiBhIG1vZHVsZSBpcyBhIHN0YXRlbWVudCBvciBhIHZhbHVlLlxuUHJlZmVycyB0byBtYWtlIGl0IGEgdmFsdWUsIHN1Y2ggYXMgaW4gdGhlIGNhc2Ugb2YgYSBDYWxsLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTSyhfKSB7XG5cdHJldHVybiBvcE9yKF8ub3BTSygpLCAoKSA9PiBTSy5WYWwpXG59XG5cbi8vIGBudWxsYCBtZWFucyBjYW4ndCBkZXRlcm1pbmUgd2hldGhlciB0aGlzIG11c3QgYmUgYSBzdGF0ZW1lbnQgb3IgdmFsdWUuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcFNLJywge1xuXHREbygpIHtcblx0XHRyZXR1cm4gU0suRG9cblx0fSxcblx0VmFsKCkge1xuXHRcdHJldHVybiBTSy5WYWxcblx0fSxcblx0Q2FsbCgpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9LFxuXHRZaWVsZCgpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9LFxuXHRZaWVsZFRvKCkge1xuXHRcdHJldHVybiBudWxsXG5cdH0sXG5cdEJsb2NrKCkge1xuXHRcdHJldHVybiBhdXRvQmxvY2tLaW5kKHRoaXMubGluZXMsIHRoaXMubG9jKSA9PT0gQmxvY2tzLlJldHVybiA/XG5cdFx0XHRpc0VtcHR5KHRoaXMubGluZXMpID8gU0suRG8gOiBsYXN0KHRoaXMubGluZXMpLm9wU0soKSA6XG5cdFx0XHRTSy5WYWxcblx0fSxcblx0Q29uZGl0aW9uYWwoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVzdWx0Lm9wU0soKVxuXHR9LFxuXHRFeGNlcHQoKSB7XG5cdFx0Y29uc3QgY2F0Y2hlcyA9IHRoaXMuYWxsQ2F0Y2hlcy5tYXAoXyA9PiBfLmJsb2NrKVxuXHRcdC8vIElmIHRoZXJlJ3Mgb3BFbHNlLCBgdHJ5YCBpcyBhbHdheXMgU0suRG8gYW5kIGBlbHNlYCBtYXkgYmUgU0suVmFsLlxuXHRcdGNvbnN0IHBhcnRzID0gaWZFbHNlKHRoaXMub3BFbHNlLCBfID0+IGNhdChfLCBjYXRjaGVzKSwgKCkgPT4gY2F0KHRoaXMudHJ5LCBjYXRjaGVzKSlcblx0XHQvLyBvcEZpbmFsbHkgaXMgYWx3YXlzIFNLLkRvLlxuXHRcdHJldHVybiBjb21wb3NpdGVTSyh0aGlzLmxvYywgcGFydHMpXG5cdH0sXG5cdEZvcigpIHtcblx0XHQvLyBJZiBvcEZvclNLIGlzIG51bGwsIHRoZXJlIGFyZSBubyBicmVha3MsIHNvIHRoaXMgaXMgYW4gaW5maW5pdGUgbG9vcC5cblx0XHRyZXR1cm4gb3BPcih0aGlzLmJsb2NrLm9wRm9yU0soKSwgKCkgPT4gU0suRG8pXG5cdH0sXG5cdENhc2U6IGNhc2VTd2l0Y2hTSyxcblx0U3dpdGNoOiBjYXNlU3dpdGNoU0tcbn0pXG5cbmZ1bmN0aW9uIGNhc2VTd2l0Y2hTSygpIHtcblx0cmV0dXJuIGNvbXBvc2l0ZVNLKHRoaXMubG9jLCBjYXNlU3dpdGNoUGFydHModGhpcykpXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ29wRm9yU0snLCB7XG5cdGRlZmF1bHQoKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fSxcblx0QnJlYWsoKSB7XG5cdFx0cmV0dXJuIHRoaXMub3BWYWx1ZSA9PT0gbnVsbCA/IFNLLkRvIDogU0suVmFsXG5cdH0sXG5cdEJsb2NrKCkge1xuXHRcdHJldHVybiBpc0VtcHR5KHRoaXMubGluZXMpID8gbnVsbCA6IGNvbXBvc2l0ZUZvclNLKHRoaXMubG9jLCB0aGlzLmxpbmVzKVxuXHR9LFxuXHRDb25kaXRpb25hbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5yZXN1bHQub3BGb3JTSygpXG5cdH0sXG5cdENhc2U6IGNhc2VTd2l0Y2hGb3JTSyxcblx0RXhjZXB0KCkge1xuXHRcdGNvbnN0IGNhdGNoZXMgPSB0aGlzLmFsbENhdGNoZXMubWFwKF8gPT4gXy5ibG9jaylcblx0XHQvLyBEbyBsb29rIGF0IG9wRmluYWxseSBmb3IgYnJlYWsgc3RhdGVtZW50cy5cblx0XHRyZXR1cm4gY29tcG9zaXRlRm9yU0sodGhpcy5sb2MsIGNhdCh0aGlzLnRyeSwgY2F0Y2hlcywgdGhpcy5vcEVsc2UsIHRoaXMub3BGaW5hbGx5KSlcblx0fSxcblx0U3dpdGNoOiBjYXNlU3dpdGNoRm9yU0tcbn0pXG5cbmZ1bmN0aW9uIGNhc2VTd2l0Y2hGb3JTSygpIHtcblx0cmV0dXJuIGNvbXBvc2l0ZUZvclNLKHRoaXMubG9jLCBjYXNlU3dpdGNoUGFydHModGhpcykpXG59XG5cbmZ1bmN0aW9uIGNhc2VTd2l0Y2hQYXJ0cyhfKSB7XG5cdHJldHVybiBjYXQoXy5wYXJ0cy5tYXAoXyA9PiBfLnJlc3VsdCksIF8ub3BFbHNlKVxufVxuXG5mdW5jdGlvbiBjb21wb3NpdGVTSyhsb2MsIHBhcnRzKSB7XG5cdHJldHVybiBjb21wb3NpdGUobG9jLCAnb3BTSycsIHBhcnRzLCAnYW1iaWd1b3VzU0snKVxufVxuXG4vKipcblRoaXMgaGFuZGxlcyB0aGUgcmFyZSBjYXNlIHdoZXJlIGEgJ2ZvcicgbG9vcCBpcyB0aGUgbGFzdCBsaW5lIG9mIGEgbW9kdWxlLlxuVGhlIGVycm9yIG9jY3VycyBpZiBpdCBsb29rcyBsaWtlOlxuXG5cdGZvclxuXHRcdHN3aXRjaCAwXG5cdFx0XHQwXG5cdFx0XHRcdGJyZWFrIDFcblx0XHRcdGVsc2Vcblx0XHRcdFx0YnJlYWtcblxuTWVhbmluZyB0aGF0IGl0IGNhbid0IGJlIGRldGVybWluZWQgd2hldGhlciBpdCdzIGEgc3RhdGVtZW50IG9yIHZhbHVlLlxuKi9cbmZ1bmN0aW9uIGNvbXBvc2l0ZUZvclNLKGxvYywgcGFydHMpIHtcblx0cmV0dXJuIGNvbXBvc2l0ZShsb2MsICdvcEZvclNLJywgcGFydHMsICdhbWJpZ3VvdXNGb3JTSycpXG59XG5cbmZ1bmN0aW9uIGNvbXBvc2l0ZShsb2MsIG1ldGhvZCwgcGFydHMsIGVycm9yQ29kZSkge1xuXHRsZXQgc2sgPSBwYXJ0c1swXVttZXRob2RdKClcblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IG90aGVyU0sgPSBwYXJ0c1tpXVttZXRob2RdKClcblx0XHRpZiAoc2sgPT09IG51bGwpXG5cdFx0XHRzayA9IG90aGVyU0tcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhvdGhlclNLID09PSBudWxsIHx8IG90aGVyU0sgPT09IHNrLCBsb2MsIGVycm9yQ29kZSlcblx0fVxuXHRyZXR1cm4gc2tcbn1cbiJdfQ==