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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBWXdCLFVBQVU7Ozs7Ozs7Ozs7QUFBbkIsVUFBUyxVQUFVLENBQUMsTUFBTSxFQUFFO3dCQUNsQixnQkFQakIsY0FBYyxFQU9rQixNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sVUFBVSxHQUFHLFVBVlosSUFBSSxFQVVhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sV0FUMUMsU0FBUyxFQVMyQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVuRSxNQUFJLElBQUksR0FBRyxJQUFJO01BQUUsT0FBTyxHQUFHLEVBQUU7TUFBRSxhQUFhLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFLENBQUE7O3dCQUV6Qyw4QkFBZSxLQUFLLENBQUM7Ozs7TUFBeEMsU0FBUztNQUFFLElBQUk7O0FBRXBCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM5QixNQUFJLFdBbEJpQixTQUFTLEVBa0JoQixPQWxCa0IsUUFBUSxDQWtCakIsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFNBQU0sSUFBSSxHQUFHLGdCQWhCb0IsZ0JBQWdCLEVBZ0JuQixPQW5CQyxRQUFRLENBbUJBLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4RCxPQUFJLEdBQUcsV0F0Qk0sT0FBTyxDQXNCRCxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ25DLE9BQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7R0FDbEI7QUFDRCxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3BCLFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUs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QUFDQyxpQkEzR1ksSUFBSSxFQTJHWCxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsNEJBQTRCLEdBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQUEsR0FDdEU7RUFDRCIsImZpbGUiOiJwYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2xhc3MsIENsYXNzRG8sIENvbnN0cnVjdG9yLCBGdW4sIExvY2FsRGVjbGFyZSwgTWV0aG9kSW1wbCwgTWV0aG9kR2V0dGVyLCBNZXRob2RTZXR0ZXIsXG5cdFF1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIGp1c3RCbG9jaywgcGFyc2VKdXN0QmxvY2tEbywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsXG5cdH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlRnVuLCB7ZnVuQXJnc0FuZEJsb2NrfSBmcm9tICcuL3BhcnNlRnVuJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBDbGFzc30uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUNsYXNzKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXG5cdGxldCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KGJsb2NrKVxuXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IHBhcnNlSnVzdEJsb2NrRG8oS2V5d29yZHMuRG8sIGxpbmUxLnRhaWwoKSlcblx0XHRvcERvID0gbmV3IENsYXNzRG8obGluZTEubG9jLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlN0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdFx0c3RhdGljcyA9IHBhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkNvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdFx0XHRvcENvbnN0cnVjdG9yID0gcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IHBhcnNlTWV0aG9kcyhyZXN0KVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BFeHRlbmRlZCwgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbnN0cnVjdG9yKHRva2Vucykge1xuXHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBmdW5BcmdzQW5kQmxvY2sodG9rZW5zLCB0cnVlLCB0cnVlKVxuXHRjb25zdCBfdGhpcyA9IExvY2FsRGVjbGFyZS50aGlzKHRva2Vucy5sb2MpXG5cdGNvbnN0IGlzR2VuZXJhdG9yID0gZmFsc2UsIG9wRGVjbGFyZVJlcyA9IG51bGxcblx0Y29uc3QgZnVuID0gbmV3IEZ1bih0b2tlbnMubG9jLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBpc0dlbmVyYXRvciwgX3RoaXMsIG9wRGVjbGFyZVJlcylcblx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3RhdGljcyh0b2tlbnMpIHtcblx0cmV0dXJuIHBhcnNlTWV0aG9kcyhqdXN0QmxvY2soS2V5d29yZHMuU3RhdGljLCB0b2tlbnMpKVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZHModG9rZW5zKSB7XG5cdHJldHVybiB0b2tlbnMubWFwU2xpY2VzKHBhcnNlTWV0aG9kKVxufVxuXG5mdW5jdGlvbiBwYXJzZU1ldGhvZCh0b2tlbnMpIHtcblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkdldCwgaGVhZCkpIHtcblx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdHJldHVybiBuZXcgTWV0aG9kR2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHR9IGVsc2UgaWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TZXQsIGhlYWQpKSB7XG5cdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGJhYSA9IHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChmdW5LZXl3b3JkcywgXykpXG5cdFx0Y2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRcdGNvbnN0IHtiZWZvcmUsIGF0LCBhZnRlcn0gPSBiYWFcblx0XHRjb25zdCBmdW4gPSBwYXJzZUZ1bihtZXRob2RGdW5LaW5kKGF0KSwgYWZ0ZXIpXG5cdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIGZ1bilcblx0fVxufVxuXG5jb25zdCBmdW5LZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzLCBLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1blRoaXNHZW4sIEtleXdvcmRzLkZ1blRoaXNHZW5Eb1xuXSlcblxuLy8gSWYgc3ltYm9sIGlzIGp1c3QgYSBsaXRlcmFsIHN0cmluZywgc3RvcmUgaXQgYXMgYSBzdHJpbmcsIHdoaWNoIGlzIGhhbmRsZWQgc3BlY2lhbGx5LlxuZnVuY3Rpb24gcGFyc2VFeHByT3JTdHJMaXQodG9rZW5zKSB7XG5cdGNvbnN0IGV4cHIgPSBwYXJzZUV4cHIodG9rZW5zKVxuXHRjb25zdCBpc1N0ckxpdCA9IGV4cHIgaW5zdGFuY2VvZiBRdW90ZSAmJlxuXHRcdGV4cHIucGFydHMubGVuZ3RoID09PSAxICYmXG5cdFx0dHlwZW9mIGV4cHIucGFydHNbMF0gPT09ICdzdHJpbmcnXG5cdHJldHVybiBpc1N0ckxpdCA/IGV4cHIucGFydHNbMF0gOiBleHByXG59XG5cbmZ1bmN0aW9uIG1ldGhvZEZ1bktpbmQoZnVuS2luZFRva2VuKSB7XG5cdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdGdW5jdGlvbiBgLmAgaXMgaW1wbGljaXQgZm9yIG1ldGhvZHMuJylcblx0XHRkZWZhdWx0OlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufWApXG5cdH1cbn1cbiJdfQ==