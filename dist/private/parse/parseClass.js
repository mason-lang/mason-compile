if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../context', '../MsAst', '../Token', '../util', './parse*', './parseBlock', './parseFun', './tryTakeComment'], function (exports, module, _context, _MsAst, _Token, _util, _parse, _parseBlock, _parseFun, _tryTakeComment3) {
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

		const _this = new _MsAst.LocalDeclareThis(tokens.loc);
		const isGenerator = false,
		      opDeclareRes = null;
		const fun = new _MsAst.Fun(tokens.loc, _this, isGenerator, args, opRestArg, block, opDeclareRes);
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
			(0, _context.check)(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
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
				(0, _context.fail)(funKindToken.loc, 'Function `.` is implicit for methods.');
			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlQ2xhc3MuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlQ2xhc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O2tCQ1llLE1BQU0sSUFBSTt3QkFDQSxnQkFMakIsY0FBYyxFQUtrQixNQUFNLENBQUM7Ozs7UUFBdkMsTUFBTTtRQUFFLEtBQUs7O0FBQ3BCLFFBQU0sVUFBVSxHQUFHLFVBUlosSUFBSSxFQVFhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sV0FQMUMsU0FBUyxFQU8yQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztBQUVuRSxNQUFJLElBQUksR0FBRyxJQUFJO01BQUUsT0FBTyxHQUFHLEVBQUU7TUFBRSxhQUFhLEdBQUcsSUFBSTtNQUFFLE9BQU8sR0FBRyxFQUFFLENBQUE7O3dCQUV6Qyw4QkFBZSxLQUFLLENBQUM7Ozs7TUFBeEMsU0FBUztNQUFFLElBQUk7O0FBRXBCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUM5QixNQUFJLFdBbEJHLFNBQVMsU0FBeUIsS0FBSyxFQWtCekIsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDbkMsU0FBTSxJQUFJLEdBQUcsZ0JBZG9CLFdBQVcsU0FMSixLQUFLLEVBbUJiLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQzdDLE9BQUksR0FBRyxXQXRCTSxPQUFPLENBc0JELEtBQUssQ0FBQyxHQUFHLEVBQUUsV0F0QlUsaUJBQWlCLENBc0JMLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNyRSxPQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0dBQ2xCO0FBQ0QsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNwQixTQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDOUIsT0FBSSxXQXpCRSxTQUFTLFNBQzBE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RSxTQUFTO0FBeUZ6RCxrQkF4RlEsYUFBYSxDQXdGRDtBQUFBLEFBQ3BDLGVBMUYyRSxXQUFXO0FBMEZwRSxrQkF6RnFCLGVBQWUsQ0F5RmQ7QUFBQSxBQUN4QyxlQTFGRixVQUFVLENBMEZRLEFBQUMsWUExRlAsWUFBWSxDQTBGYSxBQUFDLFlBMUZaLGFBQWEsQ0EwRmtCLEFBQUMsWUExRmpCLGVBQWU7QUEyRnJELGlCQS9GVyxJQUFJLEVBK0ZWLFlBQVksQ0FBQyxHQUFHLEVBQUUsdUNBQXVDLENBQUMsQ0FBQTtBQUFBLEFBQ2hFO0FBQ0MsaUJBakdXLElBQUksRUFpR1YsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLDRCQUE0QixHQUFFLFlBQVksRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUFBLEdBQ3RFO0VBQ0Q7T0FFRCxZQUFZLEdBQUcsWUFBWSxJQUFJO0FBQzlCLE1BQUksWUFBWSxtQkFuR0MsT0FBTyxBQW1HVyxFQUNsQyxRQUFRLFlBQVksQ0FBQyxJQUFJO0FBQ3hCLGVBckc2QyxNQUFNLENBcUd2QyxBQUFDLFlBckd3QyxRQUFRLENBcUdsQyxBQUFDLFlBckdtQyxTQUFTLENBcUc3QixBQUFDLFlBckc4QixXQUFXLENBcUd4QjtBQUM3RCxlQXJHSCxVQUFVLENBcUdTLEFBQUMsWUFyR1IsWUFBWSxDQXFHYyxBQUFDLFlBckdiLGFBQWEsQ0FxR21CO0FBQ3ZELGVBdEdzQyxlQUFlO0FBdUdwRCxXQUFPLElBQUksQ0FBQTtBQUFBLEFBQ1o7QUFDQyxXQUFPLEtBQUssQ0FBQTtBQUFBLEdBQ2IsTUFFRCxPQUFPLEtBQUssQ0FBQTtFQUNiLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZUNsYXNzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDbGFzcywgQ2xhc3NEbywgQ29uc3RydWN0b3IsIEZ1biwgTG9jYWxEZWNsYXJlRm9jdXMsIExvY2FsRGVjbGFyZVRoaXMsIE1ldGhvZEltcGwsXG5cdE1ldGhvZEdldHRlciwgTWV0aG9kU2V0dGVyLCBRdW90ZX0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzS2V5d29yZCwgS2V5d29yZCwgS1dfQ29uc3RydWN0LCBLV19EbywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLCBLV19GdW5HZW5Ebyxcblx0S1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0dldCwgS1dfU2V0LCBLV19TdGF0aWNcblx0fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7b3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7cGFyc2VFeHByfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIGp1c3RCbG9jaywganVzdEJsb2NrRG8sIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbCx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUZ1biwge19mdW5BcmdzQW5kQmxvY2t9IGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgdHJ5VGFrZUNvbW1lbnQgZnJvbSAnLi90cnlUYWtlQ29tbWVudCdcblxuZXhwb3J0IGRlZmF1bHQgdG9rZW5zID0+IHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCBvcEV4dGVuZGVkID0gb3BJZighYmVmb3JlLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKGJlZm9yZSkpXG5cblx0bGV0IG9wRG8gPSBudWxsLCBzdGF0aWNzID0gW10sIG9wQ29uc3RydWN0b3IgPSBudWxsLCBtZXRob2RzID0gW11cblxuXHRsZXQgW29wQ29tbWVudCwgcmVzdF0gPSB0cnlUYWtlQ29tbWVudChibG9jaylcblxuXHRjb25zdCBsaW5lMSA9IHJlc3QuaGVhZFNsaWNlKClcblx0aWYgKGlzS2V5d29yZChLV19EbywgbGluZTEuaGVhZCgpKSkge1xuXHRcdGNvbnN0IGRvbmUgPSBqdXN0QmxvY2tEbyhLV19EbywgbGluZTEudGFpbCgpKVxuXHRcdG9wRG8gPSBuZXcgQ2xhc3NEbyhsaW5lMS5sb2MsIG5ldyBMb2NhbERlY2xhcmVGb2N1cyhsaW5lMS5sb2MpLCBkb25lKVxuXHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHR9XG5cdGlmICghcmVzdC5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lMiA9IHJlc3QuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKEtXX1N0YXRpYywgbGluZTIuaGVhZCgpKSkge1xuXHRcdFx0c3RhdGljcyA9IHBhcnNlU3RhdGljcyhsaW5lMi50YWlsKCkpXG5cdFx0XHRyZXN0ID0gcmVzdC50YWlsKClcblx0XHR9XG5cdFx0aWYgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3QgbGluZTMgPSByZXN0LmhlYWRTbGljZSgpXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtXX0NvbnN0cnVjdCwgbGluZTMuaGVhZCgpKSkge1xuXHRcdFx0XHRvcENvbnN0cnVjdG9yID0gcGFyc2VDb25zdHJ1Y3RvcihsaW5lMy50YWlsKCkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0fVxuXHRcdFx0bWV0aG9kcyA9IHBhcnNlTWV0aG9kcyhyZXN0KVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXcgQ2xhc3ModG9rZW5zLmxvYywgb3BFeHRlbmRlZCwgb3BDb21tZW50LCBvcERvLCBzdGF0aWNzLCBvcENvbnN0cnVjdG9yLCBtZXRob2RzKVxufVxuXG5jb25zdFxuXHRwYXJzZUNvbnN0cnVjdG9yID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCB7YXJncywgbWVtYmVyQXJncywgb3BSZXN0QXJnLCBibG9ja30gPSBfZnVuQXJnc0FuZEJsb2NrKHRydWUsIHRva2VucywgdHJ1ZSlcblx0XHRjb25zdCBfdGhpcyA9IG5ldyBMb2NhbERlY2xhcmVUaGlzKHRva2Vucy5sb2MpXG5cdFx0Y29uc3QgaXNHZW5lcmF0b3IgPSBmYWxzZSwgb3BEZWNsYXJlUmVzID0gbnVsbFxuXHRcdGNvbnN0IGZ1biA9IG5ldyBGdW4odG9rZW5zLmxvYywgX3RoaXMsIGlzR2VuZXJhdG9yLCBhcmdzLCBvcFJlc3RBcmcsIGJsb2NrLCBvcERlY2xhcmVSZXMpXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0b2tlbnMubG9jLCBmdW4sIG1lbWJlckFyZ3MpXG5cdH0sXG5cblx0cGFyc2VTdGF0aWNzID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBibG9jayA9IGp1c3RCbG9jayhLV19TdGF0aWMsIHRva2Vucylcblx0XHRyZXR1cm4gcGFyc2VNZXRob2RzKGJsb2NrKVxuXHR9LFxuXG5cdHBhcnNlTWV0aG9kcyA9IHRva2VucyA9PiB0b2tlbnMubWFwU2xpY2VzKHBhcnNlTWV0aG9kKSxcblxuXHRwYXJzZU1ldGhvZCA9IHRva2VucyA9PiB7XG5cdFx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblxuXHRcdGlmIChpc0tleXdvcmQoS1dfR2V0LCBoZWFkKSkge1xuXHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zLnRhaWwoKSlcblx0XHRcdHJldHVybiBuZXcgTWV0aG9kR2V0dGVyKHRva2Vucy5sb2MsIHBhcnNlRXhwck9yU3RyTGl0KGJlZm9yZSksIHBhcnNlQmxvY2tWYWwoYmxvY2spKVxuXHRcdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtXX1NldCwgaGVhZCkpIHtcblx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucy50YWlsKCkpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZFNldHRlcih0b2tlbnMubG9jLCBwYXJzZUV4cHJPclN0ckxpdChiZWZvcmUpLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2VXaGVyZShpc0Z1bktleXdvcmQpXG5cdFx0XHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdFx0XHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdFx0XHRjb25zdCBmdW4gPSBwYXJzZUZ1bihtZXRob2RGdW5LaW5kKGF0KSwgYWZ0ZXIpXG5cdFx0XHRyZXR1cm4gbmV3IE1ldGhvZEltcGwodG9rZW5zLmxvYywgcGFyc2VFeHByT3JTdHJMaXQoYmVmb3JlKSwgZnVuKVxuXHRcdH1cblx0fSxcblxuXHQvLyBJZiBzeW1ib2wgaXMganVzdCBhIGxpdGVyYWwgc3RyaW5nLCBzdG9yZSBpdCBhcyBhIHN0cmluZywgd2hpY2ggaXMgaGFuZGxlZCBzcGVjaWFsbHkuXG5cdHBhcnNlRXhwck9yU3RyTGl0ID0gdG9rZW5zID0+IHtcblx0XHRjb25zdCBleHByID0gcGFyc2VFeHByKHRva2Vucylcblx0XHRjb25zdCBpc1N0ckxpdCA9IGV4cHIgaW5zdGFuY2VvZiBRdW90ZSAmJlxuXHRcdFx0ZXhwci5wYXJ0cy5sZW5ndGggPT09IDEgJiZcblx0XHRcdHR5cGVvZiBleHByLnBhcnRzWzBdID09PSAnc3RyaW5nJ1xuXHRcdHJldHVybiBpc1N0ckxpdCA/IGV4cHIucGFydHNbMF0gOiBleHByXG5cdH0sXG5cblx0bWV0aG9kRnVuS2luZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdFx0Y2FzZSBLV19GdW46IHJldHVybiBLV19GdW5UaGlzXG5cdFx0XHRjYXNlIEtXX0Z1bkRvOiByZXR1cm4gS1dfRnVuVGhpc0RvXG5cdFx0XHRjYXNlIEtXX0Z1bkdlbjogcmV0dXJuIEtXX0Z1blRoaXNHZW5cblx0XHRcdGNhc2UgS1dfRnVuR2VuRG86IHJldHVybiBLV19GdW5UaGlzR2VuRG9cblx0XHRcdGNhc2UgS1dfRnVuVGhpczogY2FzZSBLV19GdW5UaGlzRG86IGNhc2UgS1dfRnVuVGhpc0dlbjogY2FzZSBLV19GdW5UaGlzR2VuRG86XG5cdFx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCBgRXhwZWN0ZWQgZnVuY3Rpb24ga2luZCwgZ290ICR7ZnVuS2luZFRva2VufWApXG5cdFx0fVxuXHR9LFxuXG5cdGlzRnVuS2V5d29yZCA9IGZ1bktpbmRUb2tlbiA9PiB7XG5cdFx0aWYgKGZ1bktpbmRUb2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS1dfRnVuOiBjYXNlIEtXX0Z1bkRvOiBjYXNlIEtXX0Z1bkdlbjogY2FzZSBLV19GdW5HZW5Ebzpcblx0XHRcdFx0Y2FzZSBLV19GdW5UaGlzOiBjYXNlIEtXX0Z1blRoaXNEbzogY2FzZSBLV19GdW5UaGlzR2VuOlxuXHRcdFx0XHRjYXNlIEtXX0Z1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fVxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
