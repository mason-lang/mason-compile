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
			return compositeSK(this.loc, (0, _util.cat)(this.try, (0, _util.opMap)(this.opCatch, _ => _.block)));
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
			return compositeForSK(this.loc, (0, _util.cat)(this.try, (0, _util.opMap)(this.opCatch, _ => _.block), this.opFinally));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9TSy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FrQmdCLE9BQU8sR0FBUCxPQUFPO1NBTVAsUUFBUSxHQUFSLFFBQVE7U0FTUixhQUFhLEdBQWIsYUFBYTtTQVNiLEtBQUssR0FBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBM0JOLEVBQUU7O1VBR0QsT0FBTzs7OztVQU1QLFFBQVE7Ozs7VUFTUixhQUFhOzs7O1VBU2IsS0FBSyIsImZpbGUiOiJTSy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGltcGxlbWVudE1hbnksIGlzRW1wdHksIGxhc3QsIG9wTWFwLCBvcE9yfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtCbG9ja3N9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQgYXV0b0Jsb2NrS2luZCBmcm9tICcuL2F1dG9CbG9ja0tpbmQnXG5pbXBvcnQge3Jlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcblxuY29uc3QgU0sgPSB7XG5cdC8qKiBNdXN0IGJlIGEgc3RhdGVtZW50LiAqL1xuXHREbzogMCxcblx0LyoqIE11c3QgYmUgYW4gZXhwcmVzc2lvbi4gKi9cblx0VmFsOiAxXG59XG4vKiogU3RhdGVtZW50IEtpbmQuICovXG5leHBvcnQgZGVmYXVsdCBTS1xuXG4vKiogVGhpcyBNc0FzdCBtdXN0IGJlIGEgc3RhdGVtZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRG8oXywgc2spIHtcblx0Y2hlY2soc2sgPT09IFNLLkRvLCBfLmxvYyxcblx0XHQnVGhpcyBjYW4gb25seSBiZSB1c2VkIGFzIGEgc3RhdGVtZW50LCBidXQgYXBwZWFycyBpbiBleHByZXNzaW9uIGNvbnRleHQuJylcbn1cblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrVmFsKF8sIHNrKSB7XG5cdGlmIChzayA9PT0gU0suRG8pXG5cdFx0d2FybihfLmxvYywgJ1ZhbHVlIGFwcGVhcnMgaW4gc3RhdGVtZW50IGNvbnRleHQsIHNvIGl0IGRvZXMgbm90aGluZy4nKVxufVxuXG4vKipcblRoaXMgaXMgYW4gTXNBc3QgdGhhdCBpcyBzb21ldGltZXMgYSBzdGF0ZW1lbnQsIHNvbWV0aW1lcyBhbiBleHByZXNzaW9uLlxuTWFyayBpdCB1c2luZyBgc2tgIHNvIHRoYXQgaXQgY2FuIHRyYW5zcGlsZSBjb3JyZWN0bHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtTdGF0ZW1lbnQoXywgc2spIHtcblx0aWYgKHNrID09PSBTSy5Ebylcblx0XHRyZXN1bHRzLnN0YXRlbWVudHMuYWRkKF8pXG59XG5cbi8qKlxuSW5mZXJzIHdoZXRoZXIgdGhlIGxhc3QgbGluZSBvZiBhIG1vZHVsZSBpcyBhIHN0YXRlbWVudCBvciBhIHZhbHVlLlxuUHJlZmVycyB0byBtYWtlIGl0IGEgdmFsdWUsIHN1Y2ggYXMgaW4gdGhlIGNhc2Ugb2YgYSBDYWxsLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTSyhfKSB7XG5cdHJldHVybiBvcE9yKF8ub3BHZXRTSygpLCAoKSA9PiBTSy5WYWwpXG59XG5cbi8vIGBudWxsYCBtZWFucyBjYW4ndCBkZXRlcm1pbmUgd2hldGhlciB0aGlzIG11c3QgYmUgYSBzdGF0ZW1lbnQgb3IgdmFsdWUuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcEdldFNLJywge1xuXHREbygpIHsgcmV0dXJuIFNLLkRvIH0sXG5cdFZhbCgpIHsgcmV0dXJuIFNLLlZhbCB9LFxuXHRDYWxsKCkgeyByZXR1cm4gbnVsbCB9LFxuXHRZaWVsZCgpIHsgcmV0dXJuIG51bGwgfSxcblx0WWllbGRUbygpIHsgcmV0dXJuIG51bGwgfSxcblx0QmxvY2soKSB7XG5cdFx0cmV0dXJuIGF1dG9CbG9ja0tpbmQodGhpcy5saW5lcywgdGhpcy5sb2MpID09PSBCbG9ja3MuUmV0dXJuID9cblx0XHRcdGlzRW1wdHkodGhpcy5saW5lcykgPyBTSy5EbyA6IGxhc3QodGhpcy5saW5lcykub3BHZXRTSygpIDpcblx0XHRcdFNLLlZhbFxuXHR9LFxuXHRDb25kaXRpb25hbCgpIHsgcmV0dXJuIHRoaXMucmVzdWx0Lm9wR2V0U0soKSB9LFxuXHRFeGNlcHQoKSB7XG5cdFx0Ly8gRG9uJ3QgbG9vayBhdCBvcEZpbmFsbHkgYmVjYXVzZSB0aGF0J3MgYWx3YXlzIGEgRG9cblx0XHRyZXR1cm4gY29tcG9zaXRlU0sodGhpcy5sb2MsIGNhdCh0aGlzLnRyeSwgb3BNYXAodGhpcy5vcENhdGNoLCBfID0+IF8uYmxvY2spKSlcblx0fSxcblx0Rm9yKCkge1xuXHRcdC8vIElmIG9wRm9yU0sgaXMgbnVsbCwgdGhlcmUgYXJlIG5vIGJyZWFrcywgc28gdGhpcyBpcyBhbiBpbmZpbml0ZSBsb29wLlxuXHRcdHJldHVybiBvcE9yKHRoaXMuYmxvY2sub3BGb3JTSygpLCAoKSA9PiBTSy5Ebylcblx0fSxcblx0Q2FzZTogY2FzZVN3aXRjaFNLLFxuXHRTd2l0Y2g6IGNhc2VTd2l0Y2hTS1xufSlcblxuZnVuY3Rpb24gY2FzZVN3aXRjaFNLKCkge1xuXHRyZXR1cm4gY29tcG9zaXRlU0sodGhpcy5sb2MsIGNhc2VTd2l0Y2hQYXJ0cyh0aGlzKSlcbn1cblxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAnb3BGb3JTSycse1xuXHRkZWZhdWx0KCkgeyByZXR1cm4gbnVsbCB9LFxuXHRCcmVhaygpIHtcblx0XHRyZXR1cm4gdGhpcy5vcFZhbHVlID09PSBudWxsID8gU0suRG8gOiBTSy5WYWxcblx0fSxcblx0QmxvY2soKSB7IHJldHVybiBpc0VtcHR5KHRoaXMubGluZXMpID8gbnVsbCA6IGNvbXBvc2l0ZSh0aGlzLmxvYywgJ29wRm9yU0snLCB0aGlzLmxpbmVzKSB9LFxuXHRDb25kaXRpb25hbCgpIHsgcmV0dXJuIHRoaXMucmVzdWx0Lm9wRm9yU0soKSB9LFxuXHRDYXNlOiBjYXNlU3dpdGNoRm9yU0ssXG5cdEV4Y2VwdCgpIHtcblx0XHQvLyBEbyBsb29rIGF0IG9wRmluYWxseSBmb3IgYnJlYWsgc3RhdGVtZW50cy5cblx0XHRyZXR1cm4gY29tcG9zaXRlRm9yU0sodGhpcy5sb2MsXG5cdFx0XHRjYXQodGhpcy50cnksIG9wTWFwKHRoaXMub3BDYXRjaCwgXyA9PiBfLmJsb2NrKSwgdGhpcy5vcEZpbmFsbHkpKVxuXHR9LFxuXHRTd2l0Y2g6IGNhc2VTd2l0Y2hGb3JTS1xufSlcblxuZnVuY3Rpb24gY2FzZVN3aXRjaEZvclNLKCkge1xuXHRyZXR1cm4gY29tcG9zaXRlRm9yU0sodGhpcy5sb2MsIGNhc2VTd2l0Y2hQYXJ0cyh0aGlzKSlcbn1cblxuZnVuY3Rpb24gY2FzZVN3aXRjaFBhcnRzKF8pIHtcblx0cmV0dXJuIGNhdChfLnBhcnRzLm1hcChfID0+IF8ucmVzdWx0KSwgXy5vcEVsc2UpXG59XG5cbmZ1bmN0aW9uIGNvbXBvc2l0ZVNLKGxvYywgcGFydHMpIHtcblx0cmV0dXJuIGNvbXBvc2l0ZShsb2MsICdvcEdldFNLJywgcGFydHMsXG5cdFx0J0NhblxcJ3QgdGVsbCBpZiB0aGlzIGlzIGEgc3RhdGVtZW50LiBTb21lIHBhcnRzIGFyZSBzdGF0ZW1lbnRzIGJ1dCBvdGhlcnMgYXJlIHZhbHVlcy4nKVxufVxuXG4vKipcblRoaXMgaGFuZGxlcyB0aGUgcmFyZSBjYXNlIHdoZXJlIGEgJ2ZvcicgbG9vcCBpcyB0aGUgbGFzdCBsaW5lIG9mIGEgbW9kdWxlLlxuVGhlIGVycm9yIG9jY3VycyBpZiBpdCBsb29rcyBsaWtlOlxuXG5cdGZvclxuXHRcdHN3aXRjaCAwXG5cdFx0XHQwXG5cdFx0XHRcdGJyZWFrIDFcblx0XHRcdGVsc2Vcblx0XHRcdFx0YnJlYWtcblxuTWVhbmluZyB0aGF0IGl0IGNhbid0IGJlIGRldGVybWluZWQgd2hldGhlciBpdCdzIGEgc3RhdGVtZW50IG9yIHZhbHVlLlxuKi9cbmZ1bmN0aW9uIGNvbXBvc2l0ZUZvclNLKGxvYywgcGFydHMpIHtcblx0cmV0dXJuIGNvbXBvc2l0ZShsb2MsICdvcEZvclNLJywgcGFydHMsICgpID0+XG5cdFx0YENhbid0IHRlbGwgaWYgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Gb3IpfSBpcyBhIHN0YXRlbWVudC4gYCArXG5cdFx0YFNvbWUgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5CcmVhayl9cyBoYXZlIGEgdmFsdWUsIG90aGVycyBkb24ndC5gKVxufVxuXG5mdW5jdGlvbiBjb21wb3NpdGUobG9jLCBtZXRob2QsIHBhcnRzLCBlcnJvck1lc3NhZ2UpIHtcblx0bGV0IHNrID0gcGFydHNbMF1bbWV0aG9kXSgpXG5cdGZvciAobGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCBvdGhlclNLID0gcGFydHNbaV1bbWV0aG9kXSgpXG5cdFx0aWYgKHNrID09PSBudWxsKVxuXHRcdFx0c2sgPSBvdGhlclNLXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2sob3RoZXJTSyA9PT0gbnVsbCB8fCBvdGhlclNLID09PSBzaywgbG9jLCBlcnJvck1lc3NhZ2UpXG5cdH1cblx0cmV0dXJuIHNrXG59XG4iXX0=