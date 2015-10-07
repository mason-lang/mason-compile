if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../MsAst', '../Token', '../util', './context', './parse*', './parseBlock', './parseFun', './tryTakeComment'], function (exports, module, _MsAst, _Token, _util, _context, _parse, _parseBlock, _parseFun, _tryTakeComment3) {
	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	module.exports = tokens => {
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
		if ((0, _Token.isKeyword)(_Token.KW_Do, line1.head())) {
			const done = (0, _parseBlock.justBlockDo)(_Token.KW_Do, line1.tail());
			opDo = new _MsAst.ClassDo(line1.loc, new _MsAst.LocalDeclareFocus(line1.loc), done);
			rest = rest.tail();
		}
		if (!rest.isEmpty()) {
			const line2 = rest.headSlice();
			if ((0, _Token.isKeyword)(_Token.KW_Static, line2.head())) {
				statics = parseStatics(line2.tail());
				rest = rest.tail();
			}
			if (!rest.isEmpty()) {
				const line3 = rest.headSlice();
				if ((0, _Token.isKeyword)(_Token.KW_Construct, line3.head())) {
					opConstructor = parseConstructor(line3.tail());
					rest = rest.tail();
				}
				methods = parseMethods(rest);
			}
		}

		return new _MsAst.Class(tokens.loc, opExtended, opComment, opDo, statics, opConstructor, methods);
	};

	const parseConstructor = tokens => {
		var _funArgsAndBlock2 = (0, _parseFun._funArgsAndBlock)(true, tokens, true);

		const args = _funArgsAndBlock2.args;
		const memberArgs = _funArgsAndBlock2.memberArgs;
		const opRestArg = _funArgsAndBlock2.opRestArg;
		const block = _funArgsAndBlock2.block;
		const opIn = _funArgsAndBlock2.opIn;
		const opOut = _funArgsAndBlock2.opOut;

		const isGenerator = false,
		      opDeclareRes = null;
		const fun = new _MsAst.Fun(tokens.loc, new _MsAst.LocalDeclareThis(tokens.loc), isGenerator, args, opRestArg, block, opIn, opDeclareRes, opOut);
		return new _MsAst.Constructor(tokens.loc, fun, memberArgs);
	},
	      parseStatics = tokens => {
		const block = (0, _parseBlock.justBlock)(_Token.KW_Static, tokens);
		return parseMethods(block);
	},
	      parseMethods = tokens => tokens.mapSlices(parseMethod),
	      parseMethod = tokens => {
		const head = tokens.head();

		if ((0, _Token.isKeyword)(_Token.KW_Get, head)) {
			var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

			const before = _beforeAndBlock32[0];
			const block = _beforeAndBlock32[1];

			return new _MsAst.MethodGetter(tokens.loc, parseExprOrStrLit(before), (0, _parseBlock.parseBlockVal)(block));
		} else if ((0, _Token.isKeyword)(_Token.KW_Set, head)) {
			var _beforeAndBlock4 = (0, _parseBlock.beforeAndBlock)(tokens.tail());

			var _beforeAndBlock42 = _slicedToArray(_beforeAndBlock4, 2);

			const before = _beforeAndBlock42[0];
			const block = _beforeAndBlock42[1];

			return new _MsAst.MethodSetter(tokens.loc, parseExprOrStrLit(before), (0, _parseBlock.parseBlockDo)(block));
		} else {
			const baa = tokens.opSplitOnceWhere(isFunKeyword);
			_context.context.check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
			const before = baa.before;
			const at = baa.at;
			const after = baa.after;

			const fun = (0, _parseFun2.default)(methodFunKind(at), after);
			return new _MsAst.MethodImpl(tokens.loc, parseExprOrStrLit(before), fun);
		}
	},
	     

	// If symbol is just a literal string, store it as a string, which is handled specially.
	parseExprOrStrLit = tokens => {
		const expr = (0, _parse.parseExpr)(tokens);
		const isStrLit = expr instanceof _MsAst.Quote && expr.parts.length === 1 && typeof expr.parts[0] === 'string';
		return isStrLit ? expr.parts[0] : expr;
	},
	      methodFunKind = funKindToken => {
		switch (funKindToken.kind) {
			case _Token.KW_Fun:
				return _Token.KW_FunThis;
			case _Token.KW_FunDo:
				return _Token.KW_FunThisDo;
			case _Token.KW_FunGen:
				return _Token.KW_FunThisGen;
			case _Token.KW_FunGenDo:
				return _Token.KW_FunThisGenDo;
			case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:case _Token.KW_FunThisGenDo:
				_context.context.fail(funKindToken.loc, 'Function `.` is implicit for methods.');
			default:
				_context.context.fail(funKindToken.loc, `Expected function kind, got ${ funKindToken }`);
		}
	},
	      isFunKeyword = funKindToken => {
		if (funKindToken instanceof _Token.Keyword) switch (funKindToken.kind) {
			case _Token.KW_Fun:case _Token.KW_FunDo:case _Token.KW_FunGen:case _Token.KW_FunGenDo:
			case _Token.KW_FunThis:case _Token.KW_FunThisDo:case _Token.KW_FunThisGen:
			case _Token.KW_FunThisGenDo:
				return true;
			default:
				return false;
		} else return false;
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2xhc3MuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O2tCQ1llLE1BQU0sSUFBSTt3QkFDQSxnQkFMakIsY0FBYyxFQUtrQixNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sVUFBVSxHQUFHLFVBVFosSUFBSSxFQVNhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sV0FQMUMsU0FBUyxFQU8yQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVuRSxNQUFJLElBQUksR0FBRyxJQUFJO01BQUUsT0FBTyxHQUFHLEVBQUU7TUFBRSxhQUFhLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFLENBQUE7O3dCQUV6Qyw4QkFBZSxLQUFLLENBQUM7Ozs7TUFBeEMsU0FBUztNQUFFLElBQUk7O0FBRXBCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM5QixNQUFJLFdBbkJHLFNBQVMsU0FBeUIsS0FBSyxFQW1CekIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDbkMsU0FBTSxJQUFJLEdBQUcsZ0JBZG9CLFdBQVcsU0FOSixLQUFLLEVBb0JiLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzdDLE9BQUksR0FBRyxXQXZCTSxPQUFPLENBdUJELEtBQUssQ0FBQyxHQUFHLEVBQUUsV0F2QlUsaUJBQWlCLENBdUJMLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNyRSxPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCO0FBQ0QsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsT0FBSSxXQTFCRSxTQUFTLFNBQzBE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QTZGL0Msa0JBNUZMLFlBQVksQ0E0Rlk7QUFBQSxBQUNsQyxlQTlGZ0UsU0FBUztBQThGekQsa0JBN0ZRLGFBQWEsQ0E2RkQ7QUFBQSxBQUNwQyxlQS9GMkUsV0FBVztBQStGcEUsa0JBOUZxQixlQUFlLENBOEZkO0FBQUEsQUFDeEMsZUEvRkYsVUFBVSxDQStGUSxBQUFDLFlBL0ZQLFlBQVksQ0ErRmEsQUFBQyxZQS9GWixhQUFhLENBK0ZrQixBQUFDLFlBL0ZqQixlQUFlO0FBZ0dyRCxhQTdGSSxPQUFPLENBNkZILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLHVDQUF1QyxDQUFDLENBQUE7QUFBQSxBQUN4RTtBQUNDLGFBL0ZJLE9BQU8sQ0ErRkgsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsR0FBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxHQUM5RTtFQUNEO09BRUQsWUFBWSxHQUFHLFlBQVksSUFBSTtBQUM5QixNQUFJLFlBQVksbUJBeEdDLE9BQU8sQUF3R1csRUFDbEMsUUFBUSxZQUFZLENBQUMsSUFBSTtBQUN4QixlQTFHNkMsTUFBTSxDQTBHdkMsQUFBQyxZQTFHd0MsUUFBUSxDQTBHbEMsQUFBQyxZQTFHbUMsU0FBUyxDQTBHN0IsQUFBQyxZQTFHOEIsV0FBVyxDQTBHeEI7QUFDN0QsZUExR0gsVUFBVSxDQTBHUyxBQUFDLFlBMUdSLFlBQVksQ0EwR2MsQUFBQyxZQTFHYixhQUFhLENBMEdtQjtBQUN2RCxlQTNHc0MsZUFBZTtBQTRHcEQsV0FBTyxJQUFJLENBQUE7QUFBQSxBQUNaO0FBQ0MsV0FBTyxLQUFLLENBQUE7QUFBQSxHQUNiLE1BRUQsT0FBTyxLQUFLLENBQUE7RUFDYixDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VDbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtDbGFzcywgQ2xhc3NEbywgQ29uc3RydWN0b3IsIEZ1biwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVRoaXMsIE1ldGhvZEltcGwsXG5cdE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZCwgS1dfQ29uc3RydWN0LCBLV19EbywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLCBLV19GdW5HZW5Ebyxcblx0S1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0dldCwgS1dfU2V0LCBLV19TdGF0aWNcblx0fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtwYXJzZUV4cHJ9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywganVzdEJsb2NrLCBqdXN0QmxvY2tEbywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsLH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlRnVuLCB7X2Z1bkFyZ3NBbmRCbG9ja30gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCB0cnlUYWtlQ29tbWVudCBmcm9tICcuL3RyeVRha2VDb21tZW50J1xuXG5leHBvcnQgZGVmYXVsdCB0b2tlbnMgPT4ge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cdGNvbnN0IG9wRXh0ZW5kZWQgPSBvcElmKCFiZWZvcmUuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIoYmVmb3JlKSlcblxuXHRsZXQgb3BEbyA9IG51bGwsIHN0YXRpY3MgPSBbXSwgb3BDb25zdHJ1Y3RvciA9IG51bGwsIG1ldGhvZHMgPSBbXVxuXG5cdGxldCBbb3BDb21tZW50LCByZXN0XSA9IHRyeVRha2VDb21tZW50KGJsb2NrKVxuXG5cdGNvbnN0IGxpbmUxID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRpZiAoaXNLZXl3b3JkKEtXX0RvLCBsaW5lMS5oZWFkKCkpKSB7XG5cdFx0Y29uc3QgZG9uZSA9IGp1c3RCbG9ja0RvKEtXX0RvLCBsaW5lMS50YWlsKCkpXG5cdFx0b3BEbyA9IG5ldyBDbGFzc0RvKGxpbmUxLmxvYywgbmV3IExvY2FsRGVjbGFyZUZvY3VzKGxpbmUxLmxvYyksIGRvbmUpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGxpbmUyID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGlmIChpc0tleXdvcmQoS1dfU3RhdGljLCBsaW5lMi5oZWFkKCkpKSB7XG5cdFx0XHRzdGF0aWNzID0gcGFyc2VTdGF0aWNzKGxpbmUyLnRhaWwoKSlcblx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdH1cblx0XHRpZiAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRjb25zdCBsaW5lMyA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRcdGlmIChpc0tleXdvcmQoS1dfQ29uc3RydWN0LCBsaW5lMy5oZWFkKCkpKSB7XG5cdFx0XHRcdG9wQ29uc3RydWN0b3IgPSBwYXJzZUNvbnN0cnVjdG9yKGxpbmUzLnRhaWwoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cdFx0XHRtZXRob2RzID0gcGFyc2VNZXRob2RzKHJlc3QpXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBDbGFzcyh0b2tlbnMubG9jLCBvcEV4dGVuZGVkLCBvcENvbW1lbnQsIG9wRG8sIHN0YXRpY3MsIG9wQ29uc3RydWN0b3IsIG1ldGhvZHMpXG59XG5cbmNvbnN0XG5cdHBhcnNlQ29uc3RydWN0b3IgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IHthcmdzLCBtZW1iZXJBcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcEluLCBvcE91dH0gPVxuXHRcdFx0X2Z1bkFyZ3NBbmRCbG9jayh0cnVlLCB0b2tlbnMsIHRydWUpXG5cdFx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYyxcblx0XHRcdG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpLFxuXHRcdFx0aXNHZW5lcmF0b3IsXG5cdFx0XHRhcmdzLCBvcFJlc3RBcmcsXG5cdFx0XHRibG9jaywgb3BJbiwgb3BEZWNsYXJlUmVzLCBvcE91dClcblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRva2Vucy5sb2MsIGZ1biwgbWVtYmVyQXJncylcblx0fSxcblxuXHRwYXJzZVN0YXRpY3MgPSB0b2tlbnMgPT4ge1xuXHRcdGNvbnN0IGJsb2NrID0ganVzdEJsb2NrKEtXX1N0YXRpYywgdG9rZW5zKVxuXHRcdHJldHVybiBwYXJzZU1ldGhvZHMoYmxvY2spXG5cdH0sXG5cblx0cGFyc2VNZXRob2RzID0gdG9rZW5zID0+IHRva2Vucy5tYXBTbGljZXMocGFyc2VNZXRob2QpLFxuXG5cdHBhcnNlTWV0aG9kID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXG5cdFx0aWYgKGlzS2V5d29yZChLV19HZXQsIGhlYWQpKSB7XG5cdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMudGFpbCgpKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RHZXR0ZXIodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgcGFyc2VCbG9ja1ZhbChibG9jaykpXG5cdFx0fSBlbHNlIGlmIChpc0tleXdvcmQoS1dfU2V0LCBoZWFkKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kU2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tEbyhibG9jaykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGJhYSA9IHRva2Vucy5vcFNwbGl0T25jZVdoZXJlKGlzRnVuS2V5d29yZClcblx0XHRcdGNvbnRleHQuY2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRcdFx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRcdFx0Y29uc3QgZnVuID0gcGFyc2VGdW4obWV0aG9kRnVuS2luZChhdCksIGFmdGVyKVxuXHRcdFx0cmV0dXJuIG5ldyBNZXRob2RJbXBsKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIGZ1bilcblx0XHR9XG5cdH0sXG5cblx0Ly8gSWYgc3ltYm9sIGlzIGp1c3QgYSBsaXRlcmFsIHN0cmluZywgc3RvcmUgaXQgYXMgYSBzdHJpbmcsIHdoaWNoIGlzIGhhbmRsZWQgc3BlY2lhbGx5LlxuXHRwYXJzZUV4cHJPclN0ckxpdCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgZXhwciA9IHBhcnNlRXhwcih0b2tlbnMpXG5cdFx0Y29uc3QgaXNTdHJMaXQgPSBleHByIGluc3RhbmNlb2YgUXVvdGUgJiZcblx0XHRcdGV4cHIucGFydHMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0eXBlb2YgZXhwci5wYXJ0c1swXSA9PT0gJ3N0cmluZydcblx0XHRyZXR1cm4gaXNTdHJMaXQgPyBleHByLnBhcnRzWzBdIDogZXhwclxuXHR9LFxuXG5cdG1ldGhvZEZ1bktpbmQgPSBmdW5LaW5kVG9rZW4gPT4ge1xuXHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdGNhc2UgS1dfRnVuOiByZXR1cm4gS1dfRnVuVGhpc1xuXHRcdFx0Y2FzZSBLV19GdW5EbzogcmV0dXJuIEtXX0Z1blRoaXNEb1xuXHRcdFx0Y2FzZSBLV19GdW5HZW46IHJldHVybiBLV19GdW5UaGlzR2VuXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbkRvOiByZXR1cm4gS1dfRnVuVGhpc0dlbkRvXG5cdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46IGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRjb250ZXh0LmZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29udGV4dC5mYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59YClcblx0XHR9XG5cdH0sXG5cblx0aXNGdW5LZXl3b3JkID0gZnVuS2luZFRva2VuID0+IHtcblx0XHRpZiAoZnVuS2luZFRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLV19GdW46IGNhc2UgS1dfRnVuRG86IGNhc2UgS1dfRnVuR2VuOiBjYXNlIEtXX0Z1bkdlbkRvOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXM6IGNhc2UgS1dfRnVuVGhpc0RvOiBjYXNlIEtXX0Z1blRoaXNHZW46XG5cdFx0XHRcdGNhc2UgS1dfRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
