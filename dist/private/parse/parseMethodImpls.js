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
	exports.takeStatics = takeStatics;
	exports.parseStaticsAndMethods = parseStaticsAndMethods;
	exports.opTakeDo = opTakeDo;

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

	function takeStatics(tokens) {
		const line = tokens.headSlice();
		return (0, _Token.isKeyword)(_Token.Keywords.Static, line.head()) ? [parseMethodImpls((0, _parseBlock.justBlock)(_Token.Keywords.Static, line.tail())), tokens.tail()] : [[], tokens];
	}

	function parseStaticsAndMethods(tokens) {
		var _takeStatics = takeStatics(tokens);

		var _takeStatics2 = _slicedToArray(_takeStatics, 2);

		const statics = _takeStatics2[0];
		const rest = _takeStatics2[1];
		return [statics, parseMethodImpls(rest)];
	}

	function opTakeDo(tokens) {
		const line = tokens.headSlice();
		return (0, _Token.isKeyword)(_Token.Keywords.Do, line.head()) ? [new _MsAst.ClassTraitDo(line.loc, (0, _parseBlock.parseJustBlock)(_Token.Keywords.Do, line.tail())), tokens.tail()] : [null, tokens];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kSW1wbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU93QixnQkFBZ0I7U0FJeEIsV0FBVyxHQUFYLFdBQVc7U0FPWCxzQkFBc0IsR0FBdEIsc0JBQXNCO1NBTXRCLFFBQVEsR0FBUixRQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBakJBLGdCQUFnQjs7OztVQUl4QixXQUFXOzs7OztVQU9YLHNCQUFzQjs7Ozs7Ozs7OztVQU10QixRQUFRIiwiZmlsZSI6InBhcnNlTWV0aG9kSW1wbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NsYXNzVHJhaXREbywgTWV0aG9kSW1wbCwgTWV0aG9kR2V0dGVyLCBNZXRob2RTZXR0ZXIsIFF1b3RlU2ltcGxlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrLCBqdXN0QmxvY2ssIHBhcnNlSnVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZFNwbGl0IGZyb20gJy4vcGFyc2VNZXRob2RTcGxpdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNZXRob2RJbXBscyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXBTbGljZXMocGFyc2VNZXRob2RJbXBsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFrZVN0YXRpY3ModG9rZW5zKSB7XG5cdGNvbnN0IGxpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0cmV0dXJuIGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUuaGVhZCgpKSA/XG5cdFx0W3BhcnNlTWV0aG9kSW1wbHMoanVzdEJsb2NrKEtleXdvcmRzLlN0YXRpYywgbGluZS50YWlsKCkpKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFtbXSwgdG9rZW5zXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdGF0aWNzQW5kTWV0aG9kcyh0b2tlbnMpIHtcblx0Y29uc3QgW3N0YXRpY3MsIHJlc3RdID0gdGFrZVN0YXRpY3ModG9rZW5zKVxuXHRyZXR1cm4gW3N0YXRpY3MsIHBhcnNlTWV0aG9kSW1wbHMocmVzdCldXG59XG5cbi8qKiBUYWtlIGEge0BsaW5rIENsYXNzVHJhaXREb30uICovXG5leHBvcnQgZnVuY3Rpb24gb3BUYWtlRG8odG9rZW5zKSB7XG5cdGNvbnN0IGxpbmUgPSB0b2tlbnMuaGVhZFNsaWNlKClcblx0cmV0dXJuIGlzS2V5d29yZChLZXl3b3Jkcy5EbywgbGluZS5oZWFkKCkpID9cblx0XHRbbmV3IENsYXNzVHJhaXREbyhsaW5lLmxvYywgcGFyc2VKdXN0QmxvY2soS2V5d29yZHMuRG8sIGxpbmUudGFpbCgpKSksIHRva2Vucy50YWlsKCldIDpcblx0XHRbbnVsbCwgdG9rZW5zXVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZEltcGwodG9rZW5zKSB7XG5cdGxldCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXG5cdGNvbnN0IGlzTXkgPSBpc0tleXdvcmQoS2V5d29yZHMuTXksIGhlYWQpXG5cdGlmIChpc015KSB7XG5cdFx0dG9rZW5zID0gdG9rZW5zLnRhaWwoKVxuXHRcdGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cdH1cblxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkdldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kR2V0dGVyKHRva2Vucy5sb2MsIGlzTXksIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUoYmVmb3JlKSwgcGFyc2VCbG9jayhibG9jaykpXG5cdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlNldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIGlzTXksIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUoYmVmb3JlKSwgcGFyc2VCbG9jayhibG9jaykpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3Qge2JlZm9yZSwga2luZCwgYWZ0ZXJ9ID0gcGFyc2VNZXRob2RTcGxpdCh0b2tlbnMpXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4oa2luZCwgYWZ0ZXIpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIGlzTXksIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUoYmVmb3JlKSwgZnVuKVxuXHR9XG59XG5cbi8vIElmIHN5bWJvbCBpcyBqdXN0IGEgcXVvdGVkIG5hbWUsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUodG9rZW5zKSB7XG5cdGNvbnN0IGV4cHIgPSBwYXJzZUV4cHIodG9rZW5zKVxuXHRyZXR1cm4gZXhwciBpbnN0YW5jZW9mIFF1b3RlU2ltcGxlID8gZXhwci5uYW1lIDogZXhwclxufVxuIl19