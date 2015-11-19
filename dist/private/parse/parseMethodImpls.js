'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst', '../Token', './parse*', './parseBlock', './parseFun', './parseMethodSplit'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'), require('../Token'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./parseMethodSplit'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst, global.Token, global.parse, global.parseBlock, global.parseFun, global.parseMethodSplit);
		global.parseMethodImpls = mod.exports;
	}
})(this, function (exports, _MsAst, _Token, _parse, _parseBlock, _parseFun, _parseMethodSplit2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMethodImpls;
	exports.parseStatics = parseStatics;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _parseMethodSplit3 = _interopRequireDefault(_parseMethodSplit2);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseMethodImpls(tokens) {
		return tokens.mapSlices(parseMethodImpl);
	}

	function parseStatics(tokens) {
		return parseMethodImpls((0, _parseBlock.justBlock)(_Token.Keywords.Static, tokens));
	}

	function parseMethodImpl(tokens) {
		let head = tokens.head();
		const isMy = (0, _Token.isKeyword)(_Token.Keywords.My, head);

		if (isMy) {
			tokens = tokens.tail();
			head = tokens.head();
		}

		if ((0, _Token.isKeyword)(_Token.Keywords.Get, head)) {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const block = _beforeAndBlock2[1];
			return new _MsAst.MethodGetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), (0, _parseBlock2.default)(block));
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Set, head)) {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const block = _beforeAndBlock4[1];
			return new _MsAst.MethodSetter(tokens.loc, isMy, parseExprOrQuoteSimple(before), (0, _parseBlock2.default)(block));
		} else {
			var _parseMethodSplit = (0, _parseMethodSplit3.default)(tokens);

			const before = _parseMethodSplit.before;
			const kind = _parseMethodSplit.kind;
			const after = _parseMethodSplit.after;
			const fun = (0, _parseFun2.default)(kind, after);
			return new _MsAst.MethodImpl(tokens.loc, isMy, parseExprOrQuoteSimple(before), fun);
		}
	}

	function parseExprOrQuoteSimple(tokens) {
		const expr = (0, _parse.parseExpr)(tokens);
		return expr instanceof _MsAst.QuoteSimple ? expr.name : expr;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU1ldGhvZEltcGxzLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==