'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', '../VerifyResults', './autoBlockKind', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('../VerifyResults'), require('./autoBlockKind'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.VerifyResults, global.autoBlockKind, global.context);
		global.SK = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _VerifyResults, _autoBlockKind, _context2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.checkDo = checkDo;
	exports.checkVal = checkVal;
	exports.markStatement = markStatement;
	exports.getSK = getSK;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _autoBlockKind2 = _interopRequireDefault(_autoBlockKind);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	const SK = {
		Do: 0,
		Val: 1
	};
	exports.default = SK;

	function checkDo(_, sk) {
		(0, _context.check)(sk === SK.Do, _.loc, 'This can only be used as a statement, but appears in expression context.');
	}

	function checkVal(_, sk) {
		if (sk === SK.Do) (0, _context.warn)(_.loc, 'Value appears in statement context, so it does nothing.');
	}

	function markStatement(_, sk) {
		if (sk === SK.Do) _context2.results.statements.add(_);
	}

	function getSK(_) {
		return (0, _util.opOr)(_.opGetSK(), () => SK.Val);
	}

	(0, _util.implementMany)(MsAstTypes, 'opGetSK', {
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
			return (0, _autoBlockKind2.default)(this.lines, this.loc) === _VerifyResults.Blocks.Return ? (0, _util.isEmpty)(this.lines) ? SK.Do : (0, _util.last)(this.lines).opGetSK() : SK.Val;
		},

		Conditional() {
			return this.result.opGetSK();
		},

		Except() {
			return compositeSK(this.loc, exceptParts(this));
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
			return (0, _util.isEmpty)(this.lines) ? null : composite(this.loc, 'opForSK', this.lines);
		},

		Conditional() {
			return this.result.opForSK();
		},

		Case: caseSwitchForSK,

		Except() {
			return compositeForSK(this.loc, exceptParts(this));
		},

		Switch: caseSwitchForSK
	});

	function caseSwitchForSK() {
		return compositeForSK(this.loc, caseSwitchParts(this));
	}

	function caseSwitchParts(_) {
		return (0, _util.cat)(_.parts.map(_ => _.result), _.opElse);
	}

	function exceptParts(_) {
		return (0, _util.cat)(_.try, (0, _util.opMap)(_.opCatch, _ => _.block), _.opFinally);
	}

	function compositeSK(loc, parts) {
		return composite(loc, 'opGetSK', parts, 'Can\'t tell if this is a statement. Some parts are statements but others are values.');
	}

	function compositeForSK(loc, parts) {
		return composite(loc, 'opForSK', parts, () => `Can't tell if ${ (0, _Token.showKeyword)(_Token.Keywords.For) } is a statement. ` + `Some ${ (0, _Token.showKeyword)(_Token.Keywords.Break) }s have a value, others don't.`);
	}

	function composite(loc, method, parts, errorMessage) {
		let sk = parts[0][method]();

		for (let i = 1; i < parts.length; i = i + 1) {
			const otherSK = parts[i][method]();
			if (sk === null) sk = otherSK;else (0, _context.check)(otherSK === null || otherSK === sk, loc, errorMessage);
		}

		return sk;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9TSy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FrQmdCLE9BQU8sR0FBUCxPQUFPO1NBTVAsUUFBUSxHQUFSLFFBQVE7U0FTUixhQUFhLEdBQWIsYUFBYTtTQVNiLEtBQUssR0FBTCxLQUFLOzs7Ozs7Ozs7Ozs7OzttQkEzQk4sRUFBRTs7VUFHRCxPQUFPOzs7O1VBTVAsUUFBUTs7OztVQVNSLGFBQWE7Ozs7VUFTYixLQUFLIiwiZmlsZSI6IlNLLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCAqIGFzIE1zQXN0VHlwZXMgZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0tleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BNYXAsIG9wT3J9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0Jsb2Nrc30gZnJvbSAnLi4vVmVyaWZ5UmVzdWx0cydcbmltcG9ydCBhdXRvQmxvY2tLaW5kIGZyb20gJy4vYXV0b0Jsb2NrS2luZCdcbmltcG9ydCB7cmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuXG5jb25zdCBTSyA9IHtcblx0LyoqIE11c3QgYmUgYSBzdGF0ZW1lbnQuICovXG5cdERvOiAwLFxuXHQvKiogTXVzdCBiZSBhbiBleHByZXNzaW9uLiAqL1xuXHRWYWw6IDFcbn1cbi8qKiBTdGF0ZW1lbnQgS2luZC4gKi9cbmV4cG9ydCBkZWZhdWx0IFNLXG5cbi8qKiBUaGlzIE1zQXN0IG11c3QgYmUgYSBzdGF0ZW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEbyhfLCBzaykge1xuXHRjaGVjayhzayA9PT0gU0suRG8sIF8ubG9jLFxuXHRcdCdUaGlzIGNhbiBvbmx5IGJlIHVzZWQgYXMgYSBzdGF0ZW1lbnQsIGJ1dCBhcHBlYXJzIGluIGV4cHJlc3Npb24gY29udGV4dC4nKVxufVxuXG4vKiogVGhpcyBNc0FzdCBtdXN0IGJlIGEgdmFsdWUuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tWYWwoXywgc2spIHtcblx0aWYgKHNrID09PSBTSy5Ebylcblx0XHR3YXJuKF8ubG9jLCAnVmFsdWUgYXBwZWFycyBpbiBzdGF0ZW1lbnQgY29udGV4dCwgc28gaXQgZG9lcyBub3RoaW5nLicpXG59XG5cbi8qKlxuVGhpcyBpcyBhbiBNc0FzdCB0aGF0IGlzIHNvbWV0aW1lcyBhIHN0YXRlbWVudCwgc29tZXRpbWVzIGFuIGV4cHJlc3Npb24uXG5NYXJrIGl0IHVzaW5nIGBza2Agc28gdGhhdCBpdCBjYW4gdHJhbnNwaWxlIGNvcnJlY3RseS5cbiovXG5leHBvcnQgZnVuY3Rpb24gbWFya1N0YXRlbWVudChfLCBzaykge1xuXHRpZiAoc2sgPT09IFNLLkRvKVxuXHRcdHJlc3VsdHMuc3RhdGVtZW50cy5hZGQoXylcbn1cblxuLyoqXG5JbmZlcnMgd2hldGhlciB0aGUgbGFzdCBsaW5lIG9mIGEgbW9kdWxlIGlzIGEgc3RhdGVtZW50IG9yIGEgdmFsdWUuXG5QcmVmZXJzIHRvIG1ha2UgaXQgYSB2YWx1ZSwgc3VjaCBhcyBpbiB0aGUgY2FzZSBvZiBhIENhbGwuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNLKF8pIHtcblx0cmV0dXJuIG9wT3IoXy5vcEdldFNLKCksICgpID0+IFNLLlZhbClcbn1cblxuLy8gYG51bGxgIG1lYW5zIGNhbid0IGRldGVybWluZSB3aGV0aGVyIHRoaXMgbXVzdCBiZSBhIHN0YXRlbWVudCBvciB2YWx1ZS5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ29wR2V0U0snLCB7XG5cdERvKCkgeyByZXR1cm4gU0suRG8gfSxcblx0VmFsKCkgeyByZXR1cm4gU0suVmFsIH0sXG5cdENhbGwoKSB7IHJldHVybiBudWxsIH0sXG5cdFlpZWxkKCkgeyByZXR1cm4gbnVsbCB9LFxuXHRZaWVsZFRvKCkgeyByZXR1cm4gbnVsbCB9LFxuXHRCbG9jaygpIHtcblx0XHRyZXR1cm4gYXV0b0Jsb2NrS2luZCh0aGlzLmxpbmVzLCB0aGlzLmxvYykgPT09IEJsb2Nrcy5SZXR1cm4gP1xuXHRcdFx0aXNFbXB0eSh0aGlzLmxpbmVzKSA/IFNLLkRvIDogbGFzdCh0aGlzLmxpbmVzKS5vcEdldFNLKCkgOlxuXHRcdFx0U0suVmFsXG5cdH0sXG5cdENvbmRpdGlvbmFsKCkgeyByZXR1cm4gdGhpcy5yZXN1bHQub3BHZXRTSygpIH0sXG5cdEV4Y2VwdCgpIHtcblx0XHRyZXR1cm4gY29tcG9zaXRlU0sodGhpcy5sb2MsIGV4Y2VwdFBhcnRzKHRoaXMpKVxuXHR9LFxuXHRGb3IoKSB7XG5cdFx0Ly8gSWYgb3BGb3JTSyBpcyBudWxsLCB0aGVyZSBhcmUgbm8gYnJlYWtzLCBzbyB0aGlzIGlzIGFuIGluZmluaXRlIGxvb3AuXG5cdFx0cmV0dXJuIG9wT3IodGhpcy5ibG9jay5vcEZvclNLKCksICgpID0+IFNLLkRvKVxuXHR9LFxuXHRDYXNlOiBjYXNlU3dpdGNoU0ssXG5cdFN3aXRjaDogY2FzZVN3aXRjaFNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcEZvclNLJyx7XG5cdGRlZmF1bHQoKSB7IHJldHVybiBudWxsIH0sXG5cdEJyZWFrKCkge1xuXHRcdHJldHVybiB0aGlzLm9wVmFsdWUgPT09IG51bGwgPyBTSy5EbyA6IFNLLlZhbFxuXHR9LFxuXHRCbG9jaygpIHsgcmV0dXJuIGlzRW1wdHkodGhpcy5saW5lcykgPyBudWxsIDogY29tcG9zaXRlKHRoaXMubG9jLCAnb3BGb3JTSycsIHRoaXMubGluZXMpIH0sXG5cdENvbmRpdGlvbmFsKCkgeyByZXR1cm4gdGhpcy5yZXN1bHQub3BGb3JTSygpIH0sXG5cdENhc2U6IGNhc2VTd2l0Y2hGb3JTSyxcblx0RXhjZXB0KCkge1xuXHRcdHJldHVybiBjb21wb3NpdGVGb3JTSyh0aGlzLmxvYywgZXhjZXB0UGFydHModGhpcykpXG5cdH0sXG5cdFN3aXRjaDogY2FzZVN3aXRjaEZvclNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoRm9yU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVGb3JTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoUGFydHMoXykge1xuXHRyZXR1cm4gY2F0KF8ucGFydHMubWFwKF8gPT4gXy5yZXN1bHQpLCBfLm9wRWxzZSlcbn1cblxuZnVuY3Rpb24gZXhjZXB0UGFydHMoXykge1xuXHRyZXR1cm4gY2F0KF8udHJ5LCBvcE1hcChfLm9wQ2F0Y2gsIF8gPT4gXy5ibG9jayksIF8ub3BGaW5hbGx5KVxufVxuXG5mdW5jdGlvbiBjb21wb3NpdGVTSyhsb2MsIHBhcnRzKSB7XG5cdHJldHVybiBjb21wb3NpdGUobG9jLCAnb3BHZXRTSycsIHBhcnRzLFxuXHRcdCdDYW5cXCd0IHRlbGwgaWYgdGhpcyBpcyBhIHN0YXRlbWVudC4gU29tZSBwYXJ0cyBhcmUgc3RhdGVtZW50cyBidXQgb3RoZXJzIGFyZSB2YWx1ZXMuJylcbn1cblxuLyoqXG5UaGlzIGhhbmRsZXMgdGhlIHJhcmUgY2FzZSB3aGVyZSBhICdmb3InIGxvb3AgaXMgdGhlIGxhc3QgbGluZSBvZiBhIG1vZHVsZS5cblRoZSBlcnJvciBvY2N1cnMgaWYgaXQgbG9va3MgbGlrZTpcblxuXHRmb3Jcblx0XHRzd2l0Y2ggMFxuXHRcdFx0MFxuXHRcdFx0XHRicmVhayAxXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGJyZWFrXG5cbk1lYW5pbmcgdGhhdCBpdCBjYW4ndCBiZSBkZXRlcm1pbmVkIHdoZXRoZXIgaXQncyBhIHN0YXRlbWVudCBvciB2YWx1ZS5cbiovXG5mdW5jdGlvbiBjb21wb3NpdGVGb3JTSyhsb2MsIHBhcnRzKSB7XG5cdHJldHVybiBjb21wb3NpdGUobG9jLCAnb3BGb3JTSycsIHBhcnRzLCAoKSA9PlxuXHRcdGBDYW4ndCB0ZWxsIGlmICR7c2hvd0tleXdvcmQoS2V5d29yZHMuRm9yKX0gaXMgYSBzdGF0ZW1lbnQuIGAgK1xuXHRcdGBTb21lICR7c2hvd0tleXdvcmQoS2V5d29yZHMuQnJlYWspfXMgaGF2ZSBhIHZhbHVlLCBvdGhlcnMgZG9uJ3QuYClcbn1cblxuZnVuY3Rpb24gY29tcG9zaXRlKGxvYywgbWV0aG9kLCBwYXJ0cywgZXJyb3JNZXNzYWdlKSB7XG5cdGxldCBzayA9IHBhcnRzWzBdW21ldGhvZF0oKVxuXHRmb3IgKGxldCBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG5cdFx0Y29uc3Qgb3RoZXJTSyA9IHBhcnRzW2ldW21ldGhvZF0oKVxuXHRcdGlmIChzayA9PT0gbnVsbClcblx0XHRcdHNrID0gb3RoZXJTS1xuXHRcdGVsc2Vcblx0XHRcdGNoZWNrKG90aGVyU0sgPT09IG51bGwgfHwgb3RoZXJTSyA9PT0gc2ssIGxvYywgZXJyb3JNZXNzYWdlKVxuXHR9XG5cdHJldHVybiBza1xufVxuIl19