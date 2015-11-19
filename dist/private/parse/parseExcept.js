'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './checks', './parseBlock', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.checks, global.parseBlock, global.parseLocalDeclares);
		global.parseExcept = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _checks, _parseBlock, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExcept;

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

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

	function parseExcept(tokens) {
		const lines = (0, _parseBlock.justBlock)(_Token.Keywords.Except, tokens);

		var _takeTry = takeTry(lines);

		var _takeTry2 = _slicedToArray(_takeTry, 2);

		const _try = _takeTry2[0];
		const rest = _takeTry2[1];

		var _takeTypedCatches = takeTypedCatches(rest);

		var _takeTypedCatches2 = _slicedToArray(_takeTypedCatches, 3);

		const typedCatches = _takeTypedCatches2[0];
		const opCatchAll = _takeTypedCatches2[1];
		const rest2 = _takeTypedCatches2[2];

		var _opTakeElse = opTakeElse(rest2);

		var _opTakeElse2 = _slicedToArray(_opTakeElse, 2);

		const opElse = _opTakeElse2[0];
		const rest3 = _opTakeElse2[1];
		const opFinally = parseOpFinally(rest3);
		return new _MsAst.Except(tokens.loc, _try, typedCatches, opCatchAll, opElse, opFinally);
	}

	function takeTry(lines) {
		const line = lines.headSlice();
		(0, _checks.checkKeyword)(_Token.Keywords.Try, line.head());
		return [(0, _parseBlock.parseJustBlock)(_Token.Keywords.Try, line.tail()), lines.tail()];
	}

	function takeTypedCatches(lines) {
		const typedCatches = [];
		let opCatchAll = null;

		while (!lines.isEmpty()) {
			const line = lines.headSlice();
			if (!(0, _Token.isKeyword)(_Token.Keywords.Catch, line.head())) break;

			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(line.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const block = _beforeAndBlock2[1];
			const caught = (0, _parseLocalDeclares.parseLocalDeclareOrFocus)(before);

			const _catch = new _MsAst.Catch(line.loc, caught, (0, _parseBlock2.default)(block));

			lines = lines.tail();

			if (caught.opType === null) {
				opCatchAll = _catch;
				break;
			} else typedCatches.push(_catch);
		}

		return [typedCatches, opCatchAll, lines];
	}

	function opTakeElse(lines) {
		if (lines.isEmpty()) return [null, lines];
		const line = lines.headSlice();
		const tokenElse = line.head();
		return (0, _Token.isKeyword)(_Token.Keywords.Else, tokenElse) ? [(0, _parseBlock.parseJustBlock)(_Token.Keywords.Else, line.tail()), lines.tail()] : [null, lines];
	}

	function parseOpFinally(lines) {
		if (lines.isEmpty()) return null;
		const line = lines.headSlice();
		(0, _checks.checkKeyword)(_Token.Keywords.Finally, line.head());
		(0, _context.check)(lines.size() === 1, lines.loc, () => `Nothing may come after ${ (0, _Token.showKeyword)(_Token.Keywords.Finally) }.`);
		return (0, _parseBlock.parseJustBlock)(_Token.Keywords.Finally, line.tail());
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZUV4Y2VwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=