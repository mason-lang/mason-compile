if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './tryTakeComment'], function (exports, module, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _tryTakeComment3) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	module.exports = parseClass;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	/** Parse a {@link Class}. */

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

		const _this = _MsAst.LocalDeclare.this(tokens.loc);
		const isGenerator = false,
		      opDeclareRes = null;
		const fun = new _MsAst.Fun(tokens.loc, args, opRestArg, block, isGenerator, _this, opDeclareRes);
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

			var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock32[0];
			const block = _beforeAndBlock32[1];

			return new _MsAst.MethodGetter(tokens.loc, parseExprOrStrLit(before), (0, _parseBlock.parseBlockVal)(block));
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Set, head)) {
			var _beforeAndBlock4 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock42 = _slicedToArray(_beforeAndBlock4, 2);

			const before = _beforeAndBlock42[0];
			const block = _beforeAndBlock42[1];

			return new _MsAst.MethodSetter(tokens.loc, parseExprOrStrLit(before), (0, _parseBlock.parseBlockDo)(block));
		} else {
			const baa = tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(funKeywords, _));
			(0, _context.check)(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
			const before = baa.before;
			const at = baa.at;
			const after = baa.after;

			const fun = (0, _parseFun2.default)(methodFunKind(at), after);
			return new _MsAst.MethodImpl(tokens.loc, parseExprOrStrLit(before), fun);
		}
	}

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);

	// If symbol is just a literal string, store it as a string, which is handled specially.
	function parseExprOrStrLit(tokens) {
		const expr = (0, _parse.parseExpr)(tokens);
		const isStrLit = expr instanceof _MsAst.Quote && expr.parts.length === 1 && typeof expr.parts[0] === 'string';
		return isStrLit ? expr.parts[0] : expr;
	}

	function methodFunKind(funKindToken) {
		switch (funKindToken.kind) {
			case _Token.Keywords.Fun:
				return _Token.Keywords.FunThis;
			case _Token.Keywords.FunDo:
				return _Token.Keywords.FunThisDo;
			case _Token.Keywords.FunGen:
				return _Token.Keywords.FunThisGen;
			case _Token.Keywords.FunGenDo:
				return _Token.Keywords.FunThisGenDo;
			case _Token.Keywords.FunThis:case _Token.Keywords.FunThisDo:
			case _Token.Keywords.FunThisGen:case _Token.Keywords.FunThisGenDo:
				(0, _context.fail)(funKindToken.loc, 'Function `.` is implicit for methods.');
			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }`);
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2xhc3MuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O2tCQ1l3QixVQUFVOzs7Ozs7Ozs7O0FBQW5CLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDbEIsZ0JBUGpCLGNBQWMsRUFPa0IsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLFVBQVUsR0FBRyxVQVZaLElBQUksRUFVYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLFdBVDFDLFNBQVMsRUFTMkMsTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFbkUsTUFBSSxJQUFJLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFO01BQUUsYUFBYSxHQUFHLElBQUk7TUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFBOzt3QkFFekMsOEJBQWUsS0FBSyxDQUFDOzs7O01BQXhDLFNBQVM7TUFBRSxJQUFJOztBQUVwQixRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsTUFBSSxXQWxCaUIsU0FBUyxFQWtCaEIsT0FsQmtCLFFBQVEsQ0FrQmpCLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN6QyxTQUFNLElBQUksR0FBRyxnQkFoQm9CLGdCQUFnQixFQWdCbkIsT0FuQkMsUUFBUSxDQW1CQSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEQsT0FBSSxHQUFHLFdBdEJNLE9BQU8sQ0FzQkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNuQyxPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCO0FBQ0QsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7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aUJBM0dZLElBQUksRUEyR1gsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLDRCQUE0QixHQUFFLFlBQVksRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUFBLEdBQ3RFO0VBQ0QiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDbGFzcywgQ2xhc3NEbywgQ29uc3RydWN0b3IsIEZ1biwgTG9jYWxEZWNsYXJlLCBNZXRob2RJbXBsLCBNZXRob2RHZXR0ZXIsIE1ldGhvZFNldHRlcixcblx0UXVvdGV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywganVzdEJsb2NrLCBwYXJzZUp1c3RCbG9ja0RvLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWxcblx0fSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VGdW4sIHtmdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuLyoqIFBhcnNlIGEge0BsaW5rIENsYXNzfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlQ2xhc3ModG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3Qgb3BFeHRlbmRlZCA9IG9wSWYoIWJlZm9yZS5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihiZWZvcmUpKVxuXG5cdGxldCBvcERvID0gbnVsbCwgc3RhdGljcyA9IFtdLCBvcENvbnN0cnVjdG9yID0gbnVsbCwgbWV0aG9kcyA9IFtdXG5cblx0bGV0IFtvcENvbW1lbnQsIHJlc3RdID0gdHJ5VGFrZUNvbW1lbnQoYmxvY2spXG5cblx0Y29uc3QgbGluZTEgPSByZXN0LmhlYWRTbGljZSgpXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG8sIGxpbmUxLmhlYWQoKSkpIHtcblx0XHRjb25zdCBkb25lID0gcGFyc2VKdXN0QmxvY2tEbyhLZXl3b3Jkcy5EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBwYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0XHRtZXRob2RzID0gcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLCBvcEV4dGVuZGVkLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uc3RydWN0b3IodG9rZW5zKSB7XG5cdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrfSA9IGZ1bkFyZ3NBbmRCbG9jayh0b2tlbnMsIHRydWUsIHRydWUpXG5cdGNvbnN0IF90aGlzID0gTG9jYWxEZWNsYXJlLnRoaXModG9rZW5zLmxvYylcblx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRjb25zdCBmdW4gPSBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIGlzR2VuZXJhdG9yLCBfdGhpcywgb3BEZWNsYXJlUmVzKVxuXHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcbn1cblxuZnVuY3Rpb24gcGFyc2VTdGF0aWNzKHRva2Vucykge1xuXHRyZXR1cm4gcGFyc2VNZXRob2RzKGp1c3RCbG9jayhLZXl3b3Jkcy5TdGF0aWMsIHRva2VucykpXG59XG5cbmZ1bmN0aW9uIHBhcnNlTWV0aG9kcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXBTbGljZXMocGFyc2VNZXRob2QpXG59XG5cbmZ1bmN0aW9uIHBhcnNlTWV0aG9kKHRva2Vucykge1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuR2V0LCBoZWFkKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RHZXR0ZXIodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja1ZhbChibG9jaykpXG5cdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlNldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGZ1bktleXdvcmRzLCBfKSlcblx0XHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRcdGNvbnN0IGZ1biA9IHBhcnNlRnVuKG1ldGhvZEZ1bktpbmQoYXQpLCBhZnRlcilcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgZnVuKVxuXHR9XG59XG5cbmNvbnN0IGZ1bktleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkZ1biwgS2V5d29yZHMuRnVuRG8sIEtleXdvcmRzLkZ1bkdlbiwgS2V5d29yZHMuRnVuR2VuRG8sXG5cdEtleXdvcmRzLkZ1blRoaXMsIEtleXdvcmRzLkZ1blRoaXNEbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuXG4vLyBJZiBzeW1ib2wgaXMganVzdCBhIGxpdGVyYWwgc3RyaW5nLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5mdW5jdGlvbiBwYXJzZUV4cHJPclN0ckxpdCh0b2tlbnMpIHtcblx0Y29uc3QgZXhwciA9IHBhcnNlRXhwcih0b2tlbnMpXG5cdGNvbnN0IGlzU3RyTGl0ID0gZXhwciBpbnN0YW5jZW9mIFF1b3RlICYmXG5cdFx0ZXhwci5wYXJ0cy5sZW5ndGggPT09IDEgJiZcblx0XHR0eXBlb2YgZXhwci5wYXJ0c1swXSA9PT0gJ3N0cmluZydcblx0cmV0dXJuIGlzU3RyTGl0ID8gZXhwci5wYXJ0c1swXSA6IGV4cHJcbn1cblxuZnVuY3Rpb24gbWV0aG9kRnVuS2luZChmdW5LaW5kVG9rZW4pIHtcblx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNEb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5Eb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59YClcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
