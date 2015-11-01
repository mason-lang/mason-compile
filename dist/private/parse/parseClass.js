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
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _parseClassHeader = parseClassHeader(before);

		const opSuperClass = _parseClassHeader.opSuperClass;
		const kinds = _parseClassHeader.kinds;
		if (opBlock === null) return new _MsAst.Class(tokens.loc, opSuperClass, kinds);else {
			var _tryTakeComment = (0, _tryTakeComment4.default)(opBlock);

			var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

			let opComment = _tryTakeComment2[0];
			let rest = _tryTakeComment2[1];
			if (rest.isEmpty()) return new _MsAst.Class(tokens.loc, opSuperClass, kinds, opComment);else {
				let opDo = null,
				    statics = [],
				    opConstructor = null,
				    methods = [];
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

				return new _MsAst.Class(tokens.loc, opSuperClass, kinds, opComment, opDo, statics, opConstructor, methods);
			}
		}
	}

	function parseClassHeader(tokens) {
		var _ifElse = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Kind, _)), _ref => {
			let before = _ref.before;
			let after = _ref.after;
			return [before, (0, _parse.parseExprParts)(after)];
		}, () => [tokens, []]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const extendedTokens = _ifElse2[0];
		const kinds = _ifElse2[1];
		const opSuperClass = (0, _util.opIf)(!extendedTokens.isEmpty(), () => (0, _parse.parseExpr)(extendedTokens));
		return {
			opSuperClass,
			kinds
		};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQVl3QixVQUFVOzs7Ozs7Ozs7O1VBQVYsVUFBVSIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2xhc3MsIENsYXNzRG8sIENvbnN0cnVjdG9yLCBGdW4sIEZ1bnMsIE1ldGhvZEltcGwsIE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZVNpbXBsZVxuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIG9wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3BhcnNlRXhwciwgcGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgYmVmb3JlQW5kT3BCbG9jaywganVzdEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWxcblx0fSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VGdW4sIHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENsYXNzfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2xhc3ModG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIG9wQmxvY2tdID0gYmVmb3JlQW5kT3BCbG9jayh0b2tlbnMpXG5cdGNvbnN0IHtvcFN1cGVyQ2xhc3MsIGtpbmRzfSA9IHBhcnNlQ2xhc3NIZWFkZXIoYmVmb3JlKVxuXG5cdGlmIChvcEJsb2NrID09PSBudWxsKVxuXHRcdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BTdXBlckNsYXNzLCBraW5kcylcblx0ZWxzZSB7XG5cdFx0bGV0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQob3BCbG9jaylcblxuXHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BTdXBlckNsYXNzLCBraW5kcywgb3BDb21tZW50KVxuXHRcdGVsc2Uge1xuXHRcdFx0bGV0IG9wRG8gPSBudWxsLCBzdGF0aWNzID0gW10sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gW11cblxuXHRcdFx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGRvbmUgPSBwYXJzZUp1c3RCbG9ja0RvKEtleXdvcmRzLkRvLCBsaW5lMS50YWlsKCkpXG5cdFx0XHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIGRvbmUpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0XHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdFx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Db25zdHJ1Y3QsIGxpbmUzLmhlYWQoKSkpIHtcblx0XHRcdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBwYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRcdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRtZXRob2RzID0gcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLFxuXHRcdFx0XHRvcFN1cGVyQ2xhc3MsIGtpbmRzLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ2xhc3NIZWFkZXIodG9rZW5zKSB7XG5cdGNvbnN0IFtleHRlbmRlZFRva2Vucywga2luZHNdID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLktpbmQsIF8pKSxcblx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwclBhcnRzKGFmdGVyKV0sXG5cdFx0XHQoKSA9PiBbdG9rZW5zLCBbXV0pXG5cdGNvbnN0IG9wU3VwZXJDbGFzcyA9IG9wSWYoIWV4dGVuZGVkVG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKGV4dGVuZGVkVG9rZW5zKSlcblx0cmV0dXJuIHtvcFN1cGVyQ2xhc3MsIGtpbmRzfVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCB0cnVlLCB0cnVlKVxuXHRjb25zdCBmdW4gPSBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIEZ1bnMuUGxhaW4sIHRydWUpXG5cdHJldHVybiBuZXcgQ29uc3RydWN0b3IodG9rZW5zLmxvYywgZnVuLCBtZW1iZXJBcmdzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVN0YXRpY3ModG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZU1ldGhvZHMoanVzdEJsb2NrKEtleXdvcmRzLlN0YXRpYywgdG9rZW5zKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2RzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcFNsaWNlcyhwYXJzZU1ldGhvZClcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2QodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5HZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHR9IGVsc2UgaWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGZ1bktleXdvcmRzLCBfKSlcblx0XHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKG1ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywgcGFyc2VFeHByT3JRdW90ZVNpbXBsZShiZWZvcmUpLCBmdW4pXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLFxuXHRLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbywgS2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5EbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuXG4vLyBJZiBzeW1ib2wgaXMganVzdCBhIHF1b3RlZCBuYW1lLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBwYXJzZUV4cHJPclF1b3RlU2ltcGxlKHRva2Vucykge1xuXHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0cmV0dXJuIGV4cHIgaW5zdGFuY2VvZiBRdW90ZVNpbXBsZSA/IGV4cHIubmFtZSA6IGV4cHJcbn1cblxuZnVuY3Rpb24gbWV0aG9kRnVuS2luZChmdW5LaW5kVG9rZW4pIHtcblx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNEb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0FzeW5jXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luY0RvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlblxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgYEV4cGVjdGVkIGZ1bmN0aW9uIGtpbmQsIGdvdCAke2Z1bktpbmRUb2tlbn0uYClcblx0fVxufVxuIl19