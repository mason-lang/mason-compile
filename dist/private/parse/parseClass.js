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

		const _this = new _MsAst.LocalDeclareThis(tokens.loc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2xhc3MuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O2tCQ1l3QixVQUFVOzs7Ozs7Ozs7O0FBQW5CLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDbEIsZ0JBUGpCLGNBQWMsRUFPa0IsTUFBTSxDQUFDOzs7O1FBQXZDLE1BQU07UUFBRSxLQUFLOztBQUNwQixRQUFNLFVBQVUsR0FBRyxVQVZaLElBQUksRUFVYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLFdBVDFDLFNBQVMsRUFTMkMsTUFBTSxDQUFDLENBQUMsQ0FBQTs7QUFFbkUsTUFBSSxJQUFJLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFO01BQUUsYUFBYSxHQUFHLElBQUk7TUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFBOzt3QkFFekMsOEJBQWUsS0FBSyxDQUFDOzs7O01BQXhDLFNBQVM7TUFBRSxJQUFJOztBQUVwQixRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsTUFBSSxXQWxCaUIsU0FBUyxFQWtCaEIsT0FsQmtCLFFBQVEsQ0FrQmpCLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtBQUN6QyxTQUFNLElBQUksR0FBRyxnQkFoQm9CLGdCQUFnQixFQWdCbkIsT0FuQkMsUUFBUSxDQW1CQSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEQsT0FBSSxHQUFHLFdBdEJNLE9BQU8sQ0FzQkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNuQyxPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCO0FBQ0QsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7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QUFJLEVBMkdYLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsR0FBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxHQUN0RTtFQUNEIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2xhc3MsIENsYXNzRG8sIENvbnN0cnVjdG9yLCBGdW4sIExvY2FsRGVjbGFyZVRoaXMsIE1ldGhvZEltcGwsIE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLFxuXHRRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge3BhcnNlRXhwcn0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBqdXN0QmxvY2ssIHBhcnNlSnVzdEJsb2NrRG8sIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbFxuXHR9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUZ1biwge2Z1bkFyZ3NBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgQ2xhc3N9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VDbGFzcyh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBvcEV4dGVuZGVkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKGJlZm9yZSkpXG5cblx0bGV0IG9wRG8gPSBudWxsLCBzdGF0aWNzID0gW10sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gW11cblxuXHRsZXQgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudChibG9jaylcblxuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBwYXJzZUp1c3RCbG9ja0RvKEtleXdvcmRzLkRvLCBsaW5lMS50YWlsKCkpXG5cdFx0b3BEbyA9IG5ldyBDbGFzc0RvKGxpbmUxLmxvYywgZG9uZSlcblx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0fVxuXHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0Y29uc3QgbGluZTIgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdGF0aWMsIGxpbmUyLmhlYWQoKSkpIHtcblx0XHRcdHN0YXRpY3MgPSBwYXJzZVN0YXRpY3MobGluZTIudGFpbCgpKVxuXHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0fVxuXHRcdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IGxpbmUzID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Db25zdHJ1Y3QsIGxpbmUzLmhlYWQoKSkpIHtcblx0XHRcdFx0b3BDb25zdHJ1Y3RvciA9IHBhcnNlQ29uc3RydWN0b3IobGluZTMudGFpbCgpKVxuXHRcdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHRcdH1cblx0XHRcdG1ldGhvZHMgPSBwYXJzZU1ldGhvZHMocmVzdClcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbmV3IENsYXNzKHRva2Vucy5sb2MsIG9wRXh0ZW5kZWQsIG9wQ29tbWVudCwgb3BEbywgc3RhdGljcywgb3BDb25zdHJ1Y3RvciwgbWV0aG9kcylcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25zdHJ1Y3Rvcih0b2tlbnMpIHtcblx0Y29uc3Qge2FyZ3MsIG1lbWJlckFyZ3MsIG9wUmVzdEFyZywgYmxvY2t9ID0gZnVuQXJnc0FuZEJsb2NrKHRva2VucywgdHJ1ZSwgdHJ1ZSlcblx0Y29uc3QgX3RoaXMgPSBuZXcgTG9jYWxEZWNsYXJlVGhpcyh0b2tlbnMubG9jKVxuXHRjb25zdCBpc0dlbmVyYXRvciA9IGZhbHNlLCBvcERlY2xhcmVSZXMgPSBudWxsXG5cdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYywgYXJncywgb3BSZXN0QXJnLCBibG9jaywgaXNHZW5lcmF0b3IsIF90aGlzLCBvcERlY2xhcmVSZXMpXG5cdHJldHVybiBuZXcgQ29uc3RydWN0b3IodG9rZW5zLmxvYywgZnVuLCBtZW1iZXJBcmdzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVN0YXRpY3ModG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZU1ldGhvZHMoanVzdEJsb2NrKEtleXdvcmRzLlN0YXRpYywgdG9rZW5zKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2RzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcFNsaWNlcyhwYXJzZU1ldGhvZClcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2QodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5HZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrVmFsKGJsb2NrKSlcblx0fSBlbHNlIGlmIChpc0tleXdvcmQoS2V5d29yZHMuU2V0LCBoZWFkKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RTZXR0ZXIodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0fSBlbHNlIHtcblx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZnVuS2V5d29yZHMsIF8pKVxuXHRcdGNoZWNrKGJhYSAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIGEgZnVuY3Rpb24ga2V5d29yZCBzb21ld2hlcmUuJylcblx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4obWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBmdW4pXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLCBLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cbl0pXG5cbi8vIElmIHN5bWJvbCBpcyBqdXN0IGEgbGl0ZXJhbCBzdHJpbmcsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIHBhcnNlRXhwck9yU3RyTGl0KHRva2Vucykge1xuXHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0Y29uc3QgaXNTdHJMaXQgPSBleHByIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRleHByLnBhcnRzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdHR5cGVvZiBleHByLnBhcnRzWzBdID09PSAnc3RyaW5nJ1xuXHRyZXR1cm4gaXNTdHJMaXQgPyBleHByLnBhcnRzWzBdIDogZXhwclxufVxuXG5mdW5jdGlvbiBtZXRob2RGdW5LaW5kKGZ1bktpbmRUb2tlbikge1xuXHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlblxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgYEV4cGVjdGVkIGZ1bmN0aW9uIGtpbmQsIGdvdCAke2Z1bktpbmRUb2tlbn1gKVxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
