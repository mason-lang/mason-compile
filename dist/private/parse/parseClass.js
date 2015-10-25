(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './tryTakeComment'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./parse*'), require('./parseBlock'), require('./parseFun'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.context, global.MsAst, global.Token, global.util, global.parse, global.parseBlock, global.parseFun, global.tryTakeComment);
		global.parseClass = mod.exports;
	}
})(this, function (exports, module, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _tryTakeComment3) {
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
			case _Token.Keywords.FunAsync:
				return _Token.Keywords.FunThisAsync;
			case _Token.Keywords.FunAsyncDo:
				return _Token.Keywords.FunThisAsyncDo;
			case _Token.Keywords.FunGen:
				return _Token.Keywords.FunThisGen;
			case _Token.Keywords.FunGenDo:
				return _Token.Keywords.FunThisGenDo;
			case _Token.Keywords.FunThis:case _Token.Keywords.FunThisDo:
			case _Token.Keywords.FunThisAsync:case _Token.Keywords.FunThisAsyncDo:
			case _Token.Keywords.FunThisGen:case _Token.Keywords.FunThisGenDo:
				(0, _context.fail)(funKindToken.loc, 'Function `.` is implicit for methods.');
			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }.`);
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBWXdCLFVBQVU7Ozs7Ozs7Ozs7QUFBbkIsVUFBUyxVQUFVLENBQUMsTUFBTSxFQUFFO3dCQUNsQixnQkFQakIsY0FBYyxFQU9rQixNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sVUFBVSxHQUFHLFVBVlosSUFBSSxFQVVhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sV0FUMUMsU0FBUyxFQVMyQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVuRSxNQUFJLElBQUksR0FBRyxJQUFJO01BQUUsT0FBTyxHQUFHLEVBQUU7TUFBRSxhQUFhLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFLENBQUE7O3dCQUV6Qyw4QkFBZSxLQUFLLENBQUM7Ozs7TUFBeEMsU0FBUztNQUFFLElBQUk7O0FBRXBCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM5QixNQUFJLFdBbEJpQixTQUFTLEVBa0JoQixPQWxCa0IsUUFBUSxDQWtCakIsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFNBQU0sSUFBSSxHQUFHLGdCQWhCb0IsZ0JBQWdCLEVBZ0JuQixPQW5CQyxRQUFRLENBbUJBLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4RCxPQUFJLEdBQUcsV0F0Qk0sT0FBTyxDQXNCRCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ25DLE9BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7R0FDbEI7QUFDRCxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3BCLFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUs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d0d6QixVQUFVLENBQUMsQUFBQyxLQUFLLE9BeEdBLFFBQVEsQ0F3R0MsWUFBWTtBQUNuRCxpQkE1R1ksSUFBSSxFQTRHWCxZQUFZLENBQUMsR0FBRyxFQUFFLHVDQUF1QyxDQUFDLENBQUE7QUFBQSxBQUNoRTtBQUNDLGlCQTlHWSxJQUFJLEVBOEdYLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsR0FBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUFBLEdBQ3ZFO0VBQ0QiLCJmaWxlIjoicGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NsYXNzLCBDbGFzc0RvLCBDb25zdHJ1Y3RvciwgRnVuLCBGdW5zLCBNZXRob2RJbXBsLCBNZXRob2RHZXR0ZXIsIE1ldGhvZFNldHRlciwgUXVvdGVcblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIGp1c3RCbG9jaywgcGFyc2VKdXN0QmxvY2tEbywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlRnVuLCB7ZnVuQXJnc0FuZEJsb2NrfSBmcm9tICcuL3BhcnNlRnVuJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDbGFzc30uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNsYXNzKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXG5cdGxldCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KGJsb2NrKVxuXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IHBhcnNlSnVzdEJsb2NrRG8oS2V5d29yZHMuRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlN0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdFx0c3RhdGljcyA9IHBhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkNvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdFx0XHRvcENvbnN0cnVjdG9yID0gcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IHBhcnNlTWV0aG9kcyhyZXN0KVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BFeHRlbmRlZCwgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCB0cnVlLCB0cnVlKVxuXHRjb25zdCBmdW4gPSBuZXcgRnVuKHRva2Vucy5sb2MsIGFyZ3MsIG9wUmVzdEFyZywgYmxvY2ssIEZ1bnMuUGxhaW4sIHRydWUpXG5cdHJldHVybiBuZXcgQ29uc3RydWN0b3IodG9rZW5zLmxvYywgZnVuLCBtZW1iZXJBcmdzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVN0YXRpY3ModG9rZW5zKSB7XG5cdHJldHVybiBwYXJzZU1ldGhvZHMoanVzdEJsb2NrKEtleXdvcmRzLlN0YXRpYywgdG9rZW5zKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2RzKHRva2Vucykge1xuXHRyZXR1cm4gdG9rZW5zLm1hcFNsaWNlcyhwYXJzZU1ldGhvZClcbn1cblxuZnVuY3Rpb24gcGFyc2VNZXRob2QodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cblx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5HZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZEdldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrVmFsKGJsb2NrKSlcblx0fSBlbHNlIGlmIChpc0tleXdvcmQoS2V5d29yZHMuU2V0LCBoZWFkKSkge1xuXHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RTZXR0ZXIodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcblx0fSBlbHNlIHtcblx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZnVuS2V5d29yZHMsIF8pKVxuXHRcdGNoZWNrKGJhYSAhPT0gbnVsbCwgdG9rZW5zLmxvYywgJ0V4cGVjdGVkIGEgZnVuY3Rpb24ga2V5d29yZCBzb21ld2hlcmUuJylcblx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4obWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kSW1wbCh0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBmdW4pXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLCBLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cbl0pXG5cbi8vIElmIHN5bWJvbCBpcyBqdXN0IGEgbGl0ZXJhbCBzdHJpbmcsIHN0b3JlIGl0IGFzIGEgc3RyaW5nLCB3aGljaCBpcyBoYW5kbGVkIHNwZWNpYWxseS5cbmZ1bmN0aW9uIHBhcnNlRXhwck9yU3RyTGl0KHRva2Vucykge1xuXHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0Y29uc3QgaXNTdHJMaXQgPSBleHByIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRleHByLnBhcnRzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdHR5cGVvZiBleHByLnBhcnRzWzBdID09PSAnc3RyaW5nJ1xuXHRyZXR1cm4gaXNTdHJMaXQgPyBleHByLnBhcnRzWzBdIDogZXhwclxufVxuXG5mdW5jdGlvbiBtZXRob2RGdW5LaW5kKGZ1bktpbmRUb2tlbikge1xuXHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0FzeW5jRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRkZWZhdWx0OlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufS5gKVxuXHR9XG59XG4iXX0=