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
			return (0, _util.isEmpty)(this.lines) ? null : composite(this.loc, 'opForSK', this.lines);
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
		return composite(loc, 'opSK', parts, 'Can\'t tell if this is a statement. Some parts are statements but others are values.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9TSy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FrQmdCLE9BQU8sR0FBUCxPQUFPO1NBTVAsUUFBUSxHQUFSLFFBQVE7U0FTUixhQUFhLEdBQWIsYUFBYTtTQVNiLEtBQUssR0FBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBM0JOLEVBQUU7O1VBR0QsT0FBTzs7OztVQU1QLFFBQVE7Ozs7VUFTUixhQUFhOzs7O1VBU2IsS0FBSyIsImZpbGUiOiJTSy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQgKiBhcyBNc0FzdFR5cGVzIGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGlmRWxzZSwgaW1wbGVtZW50TWFueSwgaXNFbXB0eSwgbGFzdCwgb3BPcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7QmxvY2tzfSBmcm9tICcuLi9WZXJpZnlSZXN1bHRzJ1xuaW1wb3J0IGF1dG9CbG9ja0tpbmQgZnJvbSAnLi9hdXRvQmxvY2tLaW5kJ1xuaW1wb3J0IHtyZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5cbmNvbnN0IFNLID0ge1xuXHQvKiogTXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cblx0RG86IDAsXG5cdC8qKiBNdXN0IGJlIGFuIGV4cHJlc3Npb24uICovXG5cdFZhbDogMVxufVxuLyoqIFN0YXRlbWVudCBLaW5kLiAqL1xuZXhwb3J0IGRlZmF1bHQgU0tcblxuLyoqIFRoaXMgTXNBc3QgbXVzdCBiZSBhIHN0YXRlbWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RvKF8sIHNrKSB7XG5cdGNoZWNrKHNrID09PSBTSy5EbywgXy5sb2MsXG5cdFx0J1RoaXMgY2FuIG9ubHkgYmUgdXNlZCBhcyBhIHN0YXRlbWVudCwgYnV0IGFwcGVhcnMgaW4gZXhwcmVzc2lvbiBjb250ZXh0LicpXG59XG5cbi8qKiBUaGlzIE1zQXN0IG11c3QgYmUgYSB2YWx1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1ZhbChfLCBzaykge1xuXHRpZiAoc2sgPT09IFNLLkRvKVxuXHRcdHdhcm4oXy5sb2MsICdWYWx1ZSBhcHBlYXJzIGluIHN0YXRlbWVudCBjb250ZXh0LCBzbyBpdCBkb2VzIG5vdGhpbmcuJylcbn1cblxuLyoqXG5UaGlzIGlzIGFuIE1zQXN0IHRoYXQgaXMgc29tZXRpbWVzIGEgc3RhdGVtZW50LCBzb21ldGltZXMgYW4gZXhwcmVzc2lvbi5cbk1hcmsgaXQgdXNpbmcgYHNrYCBzbyB0aGF0IGl0IGNhbiB0cmFuc3BpbGUgY29ycmVjdGx5LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXJrU3RhdGVtZW50KF8sIHNrKSB7XG5cdGlmIChzayA9PT0gU0suRG8pXG5cdFx0cmVzdWx0cy5zdGF0ZW1lbnRzLmFkZChfKVxufVxuXG4vKipcbkluZmVycyB3aGV0aGVyIHRoZSBsYXN0IGxpbmUgb2YgYSBtb2R1bGUgaXMgYSBzdGF0ZW1lbnQgb3IgYSB2YWx1ZS5cblByZWZlcnMgdG8gbWFrZSBpdCBhIHZhbHVlLCBzdWNoIGFzIGluIHRoZSBjYXNlIG9mIGEgQ2FsbC5cbiovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U0soXykge1xuXHRyZXR1cm4gb3BPcihfLm9wU0soKSwgKCkgPT4gU0suVmFsKVxufVxuXG4vLyBgbnVsbGAgbWVhbnMgY2FuJ3QgZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBtdXN0IGJlIGEgc3RhdGVtZW50IG9yIHZhbHVlLlxuaW1wbGVtZW50TWFueShNc0FzdFR5cGVzLCAnb3BTSycsIHtcblx0RG8oKSB7IHJldHVybiBTSy5EbyB9LFxuXHRWYWwoKSB7IHJldHVybiBTSy5WYWwgfSxcblx0Q2FsbCgpIHsgcmV0dXJuIG51bGwgfSxcblx0WWllbGQoKSB7IHJldHVybiBudWxsIH0sXG5cdFlpZWxkVG8oKSB7IHJldHVybiBudWxsIH0sXG5cdEJsb2NrKCkge1xuXHRcdHJldHVybiBhdXRvQmxvY2tLaW5kKHRoaXMubGluZXMsIHRoaXMubG9jKSA9PT0gQmxvY2tzLlJldHVybiA/XG5cdFx0XHRpc0VtcHR5KHRoaXMubGluZXMpID8gU0suRG8gOiBsYXN0KHRoaXMubGluZXMpLm9wU0soKSA6XG5cdFx0XHRTSy5WYWxcblx0fSxcblx0Q29uZGl0aW9uYWwoKSB7IHJldHVybiB0aGlzLnJlc3VsdC5vcFNLKCkgfSxcblx0RXhjZXB0KCkge1xuXHRcdGNvbnN0IGNhdGNoZXMgPSB0aGlzLmFsbENhdGNoZXMubWFwKF8gPT4gXy5ibG9jaylcblx0XHQvLyBJZiB0aGVyZSdzIG9wRWxzZSwgYHRyeWAgaXMgYWx3YXlzIFNLLkRvIGFuZCBgZWxzZWAgbWF5IGJlIFNLLlZhbC5cblx0XHRjb25zdCBwYXJ0cyA9IGlmRWxzZSh0aGlzLm9wRWxzZSwgXyA9PiBjYXQoXywgY2F0Y2hlcyksICgpID0+IGNhdCh0aGlzLnRyeSwgY2F0Y2hlcykpXG5cdFx0Ly8gb3BGaW5hbGx5IGlzIGFsd2F5cyBTSy5Eby5cblx0XHRyZXR1cm4gY29tcG9zaXRlU0sodGhpcy5sb2MsIHBhcnRzKVxuXHR9LFxuXHRGb3IoKSB7XG5cdFx0Ly8gSWYgb3BGb3JTSyBpcyBudWxsLCB0aGVyZSBhcmUgbm8gYnJlYWtzLCBzbyB0aGlzIGlzIGFuIGluZmluaXRlIGxvb3AuXG5cdFx0cmV0dXJuIG9wT3IodGhpcy5ibG9jay5vcEZvclNLKCksICgpID0+IFNLLkRvKVxuXHR9LFxuXHRDYXNlOiBjYXNlU3dpdGNoU0ssXG5cdFN3aXRjaDogY2FzZVN3aXRjaFNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5pbXBsZW1lbnRNYW55KE1zQXN0VHlwZXMsICdvcEZvclNLJywge1xuXHRkZWZhdWx0KCkgeyByZXR1cm4gbnVsbCB9LFxuXHRCcmVhaygpIHtcblx0XHRyZXR1cm4gdGhpcy5vcFZhbHVlID09PSBudWxsID8gU0suRG8gOiBTSy5WYWxcblx0fSxcblx0QmxvY2soKSB7IHJldHVybiBpc0VtcHR5KHRoaXMubGluZXMpID8gbnVsbCA6IGNvbXBvc2l0ZSh0aGlzLmxvYywgJ29wRm9yU0snLCB0aGlzLmxpbmVzKSB9LFxuXHRDb25kaXRpb25hbCgpIHsgcmV0dXJuIHRoaXMucmVzdWx0Lm9wRm9yU0soKSB9LFxuXHRDYXNlOiBjYXNlU3dpdGNoRm9yU0ssXG5cdEV4Y2VwdCgpIHtcblx0XHRjb25zdCBjYXRjaGVzID0gdGhpcy5hbGxDYXRjaGVzLm1hcChfID0+IF8uYmxvY2spXG5cdFx0Ly8gRG8gbG9vayBhdCBvcEZpbmFsbHkgZm9yIGJyZWFrIHN0YXRlbWVudHMuXG5cdFx0cmV0dXJuIGNvbXBvc2l0ZUZvclNLKHRoaXMubG9jLCBjYXQodGhpcy50cnksIGNhdGNoZXMsIHRoaXMub3BFbHNlLCB0aGlzLm9wRmluYWxseSkpXG5cdH0sXG5cdFN3aXRjaDogY2FzZVN3aXRjaEZvclNLXG59KVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoRm9yU0soKSB7XG5cdHJldHVybiBjb21wb3NpdGVGb3JTSyh0aGlzLmxvYywgY2FzZVN3aXRjaFBhcnRzKHRoaXMpKVxufVxuXG5mdW5jdGlvbiBjYXNlU3dpdGNoUGFydHMoXykge1xuXHRyZXR1cm4gY2F0KF8ucGFydHMubWFwKF8gPT4gXy5yZXN1bHQpLCBfLm9wRWxzZSlcbn1cblxuZnVuY3Rpb24gY29tcG9zaXRlU0sobG9jLCBwYXJ0cykge1xuXHRyZXR1cm4gY29tcG9zaXRlKGxvYywgJ29wU0snLCBwYXJ0cyxcblx0XHQnQ2FuXFwndCB0ZWxsIGlmIHRoaXMgaXMgYSBzdGF0ZW1lbnQuIFNvbWUgcGFydHMgYXJlIHN0YXRlbWVudHMgYnV0IG90aGVycyBhcmUgdmFsdWVzLicpXG59XG5cbi8qKlxuVGhpcyBoYW5kbGVzIHRoZSByYXJlIGNhc2Ugd2hlcmUgYSAnZm9yJyBsb29wIGlzIHRoZSBsYXN0IGxpbmUgb2YgYSBtb2R1bGUuXG5UaGUgZXJyb3Igb2NjdXJzIGlmIGl0IGxvb2tzIGxpa2U6XG5cblx0Zm9yXG5cdFx0c3dpdGNoIDBcblx0XHRcdDBcblx0XHRcdFx0YnJlYWsgMVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRicmVha1xuXG5NZWFuaW5nIHRoYXQgaXQgY2FuJ3QgYmUgZGV0ZXJtaW5lZCB3aGV0aGVyIGl0J3MgYSBzdGF0ZW1lbnQgb3IgdmFsdWUuXG4qL1xuZnVuY3Rpb24gY29tcG9zaXRlRm9yU0sobG9jLCBwYXJ0cykge1xuXHRyZXR1cm4gY29tcG9zaXRlKGxvYywgJ29wRm9yU0snLCBwYXJ0cywgKCkgPT5cblx0XHRgQ2FuJ3QgdGVsbCBpZiAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvcil9IGlzIGEgc3RhdGVtZW50LiBgICtcblx0XHRgU29tZSAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkJyZWFrKX1zIGhhdmUgYSB2YWx1ZSwgb3RoZXJzIGRvbid0LmApXG59XG5cbmZ1bmN0aW9uIGNvbXBvc2l0ZShsb2MsIG1ldGhvZCwgcGFydHMsIGVycm9yTWVzc2FnZSkge1xuXHRsZXQgc2sgPSBwYXJ0c1swXVttZXRob2RdKClcblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuXHRcdGNvbnN0IG90aGVyU0sgPSBwYXJ0c1tpXVttZXRob2RdKClcblx0XHRpZiAoc2sgPT09IG51bGwpXG5cdFx0XHRzayA9IG90aGVyU0tcblx0XHRlbHNlXG5cdFx0XHRjaGVjayhvdGhlclNLID09PSBudWxsIHx8IG90aGVyU0sgPT09IHNrLCBsb2MsIGVycm9yTWVzc2FnZSlcblx0fVxuXHRyZXR1cm4gc2tcbn1cbiJdfQ==