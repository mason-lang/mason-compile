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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJTSy5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=