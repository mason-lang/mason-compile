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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseMethodImpls(tokens) {
		return tokens.mapSlices(parseMethodImpl);
	}

	function parseStatics(tokens) {
		return parseMethodImpls((0, _parseBlock.justBlock)(_Token.Keywords.Static, tokens));
	}

	function parseMethodImpl(tokens) {
		const head = tokens.head();

		if ((0, _Token.isKeyword)(_Token.Keywords.Get, head)) {
			var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

			const before = _beforeAndBlock2[0];
			const block = _beforeAndBlock2[1];
			return new _MsAst.MethodGetter(tokens.loc, parseExprOrQuoteSimple(before), (0, _parseBlock2.default)(block));
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Set, head)) {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const block = _beforeAndBlock4[1];
			return new _MsAst.MethodSetter(tokens.loc, parseExprOrQuoteSimple(before), (0, _parseBlock2.default)(block));
		} else {
			var _parseMethodSplit = (0, _parseMethodSplit3.default)(tokens);

			const before = _parseMethodSplit.before;
			const kind = _parseMethodSplit.kind;
			const after = _parseMethodSplit.after;
			const fun = (0, _parseFun2.default)(kind, after);
			return new _MsAst.MethodImpl(tokens.loc, parseExprOrQuoteSimple(before), fun);
		}
	}

	function parseExprOrQuoteSimple(tokens) {
		const expr = (0, _parse.parseExpr)(tokens);
		return expr instanceof _MsAst.QuoteSimple ? expr.name : expr;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kSW1wbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU93QixnQkFBZ0I7U0FJeEIsWUFBWSxHQUFaLFlBQVk7Ozs7Ozs7Ozs7OztVQUpKLGdCQUFnQjs7OztVQUl4QixZQUFZIiwiZmlsZSI6InBhcnNlTWV0aG9kSW1wbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01ldGhvZEltcGwsIE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZVNpbXBsZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywganVzdEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZFNwbGl0IGZyb20gJy4vcGFyc2VNZXRob2RTcGxpdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNZXRob2RJbXBscyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXBTbGljZXMocGFyc2VNZXRob2RJbXBsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTdGF0aWNzKHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VNZXRob2RJbXBscyhqdXN0QmxvY2soS2V5d29yZHMuU3RhdGljLCB0b2tlbnMpKVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZEltcGwodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5HZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2soYmxvY2spKVxuXHR9IGVsc2UgaWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2soYmxvY2spKVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHtiZWZvcmUsIGtpbmQsIGFmdGVyfSA9IHBhcnNlTWV0aG9kU3BsaXQodG9rZW5zKVxuXHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKGtpbmQsIGFmdGVyKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIGZ1bilcblx0fVxufVxuXG4vLyBJZiBzeW1ib2wgaXMganVzdCBhIHF1b3RlZCBuYW1lLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKHRva2Vucykge1xuXHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0cmV0dXJuIGV4cHIgaW5zdGFuY2VvZiBRdW90ZVNpbXBsZSA/IGV4cHIubmFtZSA6IGV4cHJcbn1cbiJdfQ==