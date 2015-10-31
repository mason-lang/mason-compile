'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseFun, global.tryTakeComment);
		global.parseClass = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseClass;

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseClass(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		const opExtended = (0, _util.opIf)(!before.isEmpty(), () => (0, _parse.parseExpr)(before));
		let opDo = null,
		    statics = [],
		    opConstructor = null,
		    methods = [];

		var _tryTakeComment = (0, _tryTakeComment4.default)(block);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		let opComment = _tryTakeComment2[0];
		let rest = _tryTakeComment2[1];
		const line1 = rest.headSlice();

		if ((0, _Token.isKeyword)(_Token.Keywords.Do, line1.head())) {
			const done = (0, _parseBlock.parseJustBlockDo)(_Token.Keywords.Do, line1.tail());
			opDo = new _MsAst.ClassDo(line1.loc, done);
			rest = rest.tail();
		}

		if (!rest.isEmpty()) {
			const line2 = rest.headSlice();

			if ((0, _Token.isKeyword)(_Token.Keywords.Static, line2.head())) {
				statics = parseStatics(line2.tail());
				rest = rest.tail();
			}

			if (!rest.isEmpty()) {
				const line3 = rest.headSlice();

				if ((0, _Token.isKeyword)(_Token.Keywords.Construct, line3.head())) {
					opConstructor = parseConstructor(line3.tail());
					rest = rest.tail();
				}

				methods = parseMethods(rest);
			}
		}

		return new _MsAst.Class(tokens.loc, opExtended, opComment, opDo, statics, opConstructor, methods);
	}

	function parseConstructor(tokens) {
		var _funArgsAndBlock = (0, _parseFun.funArgsAndBlock)(tokens, true, true);

		const args = _funArgsAndBlock.args;
		const memberArgs = _funArgsAndBlock.memberArgs;
		const opRestArg = _funArgsAndBlock.opRestArg;
		const block = _funArgsAndBlock.block;
		const fun = new _MsAst.Fun(tokens.loc, args, opRestArg, block, _MsAst.Funs.Plain, true);
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	}

	function parseStatics(tokens) {
		return parseMethods((0, _parseBlock.justBlock)(_Token.Keywords.Static, tokens));
	}

	function parseMethods(tokens) {
		return tokens.mapSlices(parseMethod);
	}

	function parseMethod(tokens) {
		const head = tokens.head();

		if ((0, _Token.isKeyword)(_Token.Keywords.Get, head)) {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock4[0];
			const block = _beforeAndBlock4[1];
			return new _MsAst.MethodGetter(tokens.loc, parseExprOrQuoteSimple(before), (0, _parseBlock.parseBlockVal)(block));
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Set, head)) {
			var _beforeAndBlock5 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock6 = _slicedToArray(_beforeAndBlock5, 2);

			const before = _beforeAndBlock6[0];
			const block = _beforeAndBlock6[1];
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

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);

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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVl3QixVQUFVOzs7Ozs7Ozs7O1VBQVYsVUFBVSIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2xhc3MsIENsYXNzRG8sIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnMsIE1ldGhvZEltcGwsIE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZVNpbXBsZVxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywganVzdEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWxcblx0fSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VGdW4sIHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENsYXNzfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2xhc3ModG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgb3BFeHRlbmRlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihiZWZvcmUpKVxuXG5cdGxldCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cblx0bGV0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2spXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2tEbyhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBwYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0XHRtZXRob2RzID0gcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLCBvcEV4dGVuZGVkLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uc3RydWN0b3IodG9rZW5zKSB7XG5cdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIHRydWUsIHRydWUpXG5cdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgRnVucy5QbGFpbiwgdHJ1ZSlcblx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3RhdGljcyh0b2tlbnMpIHtcblx0cmV0dXJuIHBhcnNlTWV0aG9kcyhqdXN0QmxvY2soS2V5d29yZHMuU3RhdGljLCB0b2tlbnMpKVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZHModG9rZW5zKSB7XG5cdHJldHVybiB0b2tlbnMubWFwU2xpY2VzKHBhcnNlTWV0aG9kKVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZCh0b2tlbnMpIHtcblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkdldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kR2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUoYmVmb3JlKSwgcGFyc2VCbG9ja1ZhbChibG9jaykpXG5cdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlNldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0fSBlbHNlIHtcblx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZnVuS2V5d29yZHMsIF8pKVxuXHRcdGNoZWNrKGJhYSAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIGEgZnVuY3Rpb24ga2V5d29yZCBzb21ld2hlcmUuJylcblx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4obWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIGZ1bilcblx0fVxufVxuXG5jb25zdCBmdW5LZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLCBLZXl3b3Jkcy5GdW5UaGlzLCBLZXl3b3Jkcy5GdW5UaGlzRG8sXG5cdEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLFxuXHRLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLCBLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cbl0pXG5cbi8vIElmIHN5bWJvbCBpcyBqdXN0IGEgcXVvdGVkIG5hbWUsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIHBhcnNlRXhwck9yUXVvdGVTaW1wbGUodG9rZW5zKSB7XG5cdGNvbnN0IGV4cHIgPSBwYXJzZUV4cHIodG9rZW5zKVxuXHRyZXR1cm4gZXhwciBpbnN0YW5jZW9mIFF1b3RlU2ltcGxlID8gZXhwci5uYW1lIDogZXhwclxufVxuXG5mdW5jdGlvbiBtZXRob2RGdW5LaW5kKGZ1bktpbmRUb2tlbikge1xuXHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0FzeW5jRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRkZWZhdWx0OlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufS5gKVxuXHR9XG59XG4iXX0=