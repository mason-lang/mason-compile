'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', './parse*', './parseBlock', './parseFun'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('./parse*'), require('./parseBlock'), require('./parseFun'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.parse, global.parseBlock, global.parseFun);
		global.parseMethods = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _parse, _parseBlock, _parseFun) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMethods;
	exports.parseStatics = parseStatics;

	var _parseFun2 = _interopRequireDefault(_parseFun);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseMethods(tokens) {
		return tokens.mapSlices(parseMethod);
	}

	function parseStatics(tokens) {
		return parseMethods((0, _parseBlock.justBlock)(_Token.Keywords.Static, tokens));
	}

	function parseMethod(tokens) {
		const head = tokens.head();

		if ((0, _Token.isKeyword)(_Token.Keywords.Get, head)) {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const block = _beforeAndBlock2[1];
			return new _MsAst.MethodGetter(tokens.loc, parseExprOrQuoteSimple(before), (0, _parseBlock.parseBlockVal)(block));
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Set, head)) {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const block = _beforeAndBlock4[1];
			return new _MsAst.MethodSetter(tokens.loc, parseExprOrQuoteSimple(before), (0, _parseBlock.parseBlockDo)(block));
		} else {
			const baa = tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(funKeywords, _));
			(0, _context.check)(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
			const before = baa.before;
			const at = baa.at;
			const after = baa.after;
			const fun = (0, _parseFun2.default)(methodFunKind(at), after);
			return new _MsAst.MethodImpl(tokens.loc, parseExprOrQuoteSimple(before), fun);
		}
	}

	function parseExprOrQuoteSimple(tokens) {
		const expr = (0, _parse.parseExpr)(tokens);
		return expr instanceof _MsAst.QuoteSimple ? expr.name : expr;
	}

	function methodFunKind(funKindToken) {
		switch (funKindToken.kind) {
			case _Token.Keywords.Fun:
				return _Token.Keywords.FunThis;

			case _Token.Keywords.FunDo:
				return _Token.Keywords.FunThisDo;

			case _Token.Keywords.FunAsync:
				return _Token.Keywords.FunThisAsync;

			case _Token.Keywords.FunAsyncDo:
				return _Token.Keywords.FunThisAsyncDo;

			case _Token.Keywords.FunGen:
				return _Token.Keywords.FunThisGen;

			case _Token.Keywords.FunGenDo:
				return _Token.Keywords.FunThisGenDo;

			case _Token.Keywords.FunThis:
			case _Token.Keywords.FunThisDo:
			case _Token.Keywords.FunThisAsync:
			case _Token.Keywords.FunThisAsyncDo:
			case _Token.Keywords.FunThisGen:
			case _Token.Keywords.FunThisGenDo:
				(0, _context.fail)(funKindToken.loc, 'Function `.` is implicit for methods.');

			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }.`);
		}
	}

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBT3dCLFlBQVk7U0FJcEIsWUFBWSxHQUFaLFlBQVk7Ozs7Ozs7O1VBSkosWUFBWTs7OztVQUlwQixZQUFZIiwiZmlsZSI6InBhcnNlTWV0aG9kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge01ldGhvZEltcGwsIE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZVNpbXBsZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBqdXN0QmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlRnVuIGZyb20gJy4vcGFyc2VGdW4nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTWV0aG9kcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXBTbGljZXMocGFyc2VNZXRob2QpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN0YXRpY3ModG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZU1ldGhvZHMoanVzdEJsb2NrKEtleXdvcmRzLlN0YXRpYywgdG9rZW5zKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2QodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5HZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHR9IGVsc2UgaWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGZ1bktleXdvcmRzLCBfKSlcblx0XHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKG1ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywgcGFyc2VFeHByT3JRdW90ZVNpbXBsZShiZWZvcmUpLCBmdW4pXG5cdH1cbn1cblxuLy8gSWYgc3ltYm9sIGlzIGp1c3QgYSBxdW90ZWQgbmFtZSwgc3RvcmUgaXQgYXMgYSBzdHJpbmcsIHdoaWNoIGlzIGhhbmRsZWQgc3BlY2lhbGx5LlxuZnVuY3Rpb24gcGFyc2VFeHByT3JRdW90ZVNpbXBsZSh0b2tlbnMpIHtcblx0Y29uc3QgZXhwciA9IHBhcnNlRXhwcih0b2tlbnMpXG5cdHJldHVybiBleHByIGluc3RhbmNlb2YgUXVvdGVTaW1wbGUgPyBleHByLm5hbWUgOiBleHByXG59XG5cbmZ1bmN0aW9uIG1ldGhvZEZ1bktpbmQoZnVuS2luZFRva2VuKSB7XG5cdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNBc3luY1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5Eb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59LmApXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLFxuXHRLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbywgS2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5EbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuIl19