(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseCase', './parseDel', './parseFor', './parseFun', './parseLocalDeclares'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseFor'), require('./parseFun'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseCase, global.parseDel, global.parseFor, global.parseFun, global.parseLocalDeclares);
		global.parseExpr = mod.exports;
	}
})(this, function (exports, _esastDistLoc, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseCase, _parseDel, _parseFor, _parseFun, _parseLocalDeclares) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.default = parseExpr;
	exports.parseExprParts = parseExprParts;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseFun2 = _interopRequireDefault(_parseFun);

	/** Parse a {@link Val}. */

	function parseExpr(tokens) {
		return (0, _util.ifElse)(tokens.opSplitMany(_ => (0, _Token.isKeyword)(_Token.Keywords.ObjAssign, _)), splits => {
			// Short object form, such as (a. 1, b. 2)
			const first = splits[0].before;
			(0, _checks.checkNonEmpty)(first, () => `Unexpected ${ splits[0].at }`);
			const tokensCaller = first.rtail();

			const pairs = [];
			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last();
				(0, _context.check)(name instanceof _Token.Name, name.loc, () => `Expected a name, not ${ name }`);
				const tokensValue = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail();
				const value = parseExprPlain(tokensValue);
				const loc = new _Loc.default(name.loc.start, tokensValue.loc.end);
				pairs.push(new _MsAst.ObjPair(loc, name.name, value));
			}
			const val = new _MsAst.ObjSimple(tokens.loc, pairs);
			if (tokensCaller.isEmpty()) return val;else {
				const parts = parseExprParts(tokensCaller);
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.cat)((0, _util.tail)(parts), val));
			}
		}, () => parseExprPlain(tokens));
	}

	/**
 Treating tokens separately, parse {@link Val}s.
 This is called for e.g. the contents of an array (`[a b c]`).
 This is different from {@link parseExpr} because `a b` will parse as 2 different things, not a call.
 However, `cond a b c` will still parse as a single expression.
 @return {Array<Val>}
 */

	function parseExprParts(tokens) {
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(exprSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;

			const getLast = () => {
				switch (at.kind) {
					case _Token.Keywords.And:case _Token.Keywords.Or:
						{
							const kind = at.kind === _Token.Keywords.And ? _MsAst.Logics.And : _MsAst.Logics.Or;
							return new _MsAst.Logic(at.loc, kind, parseExprParts(after));
						}
					case _Token.Keywords.CaseVal:
						return (0, _parseCase2.default)(true, false, after);
					case _Token.Keywords.Class:
						return (0, _parse.parseClass)(after);
					case _Token.Keywords.Cond:
						return parseCond(after);
					case _Token.Keywords.DelVal:
						return (0, _parseDel2.default)(after);
					case _Token.Keywords.ExceptVal:
						return (0, _parse.parseExcept)(_Token.Keywords.ExceptVal, after);
					case _Token.Keywords.ForBag:
						return (0, _parseFor.parseForBag)(after);
					case _Token.Keywords.ForVal:
						return (0, _parseFor.parseForVal)(after);
					case _Token.Keywords.Fun:case _Token.Keywords.FunDo:
					case _Token.Keywords.FunThis:case _Token.Keywords.FunThisDo:
					case _Token.Keywords.FunAsync:case _Token.Keywords.FunAsyncDo:
					case _Token.Keywords.FunThisAsync:case _Token.Keywords.FunThisAsyncDo:
					case _Token.Keywords.FunGen:case _Token.Keywords.FunGenDo:
					case _Token.Keywords.FunThisGen:case _Token.Keywords.FunThisGenDo:
						return (0, _parseFun2.default)(at.kind, after);
					case _Token.Keywords.IfVal:case _Token.Keywords.UnlessVal:
						{
							var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(after);

							var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

							const before = _beforeAndBlock2[0];
							const block = _beforeAndBlock2[1];

							return new _MsAst.ConditionalVal(tokens.loc, parseExprPlain(before), (0, _parseBlock.parseBlockVal)(block), at.kind === _Token.Keywords.UnlessVal);
						}
					case _Token.Keywords.New:
						{
							const parts = parseExprParts(after);
							return new _MsAst.New(at.loc, parts[0], (0, _util.tail)(parts));
						}
					case _Token.Keywords.Not:
						return new _MsAst.Not(at.loc, parseExprPlain(after));
					case _Token.Keywords.SuperVal:
						return new _MsAst.SuperCall(at.loc, parseExprParts(after));
					case _Token.Keywords.SwitchVal:
						return (0, _parse.parseSwitch)(true, false, after);
					case _Token.Keywords.With:
						return parseWith(after);
					case _Token.Keywords.Yield:
						return new _MsAst.Yield(at.loc, (0, _util.opIf)(!after.isEmpty(), () => parseExprPlain(after)));
					case _Token.Keywords.YieldTo:
						return new _MsAst.YieldTo(at.loc, parseExprPlain(after));
					default:
						throw new Error(at.kind);
				}
			};
			return (0, _util.cat)(before.map(_parse.parseSingle), getLast());
		}, () => tokens.map(_parse.parseSingle));
	}

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.CaseVal, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.DelVal, _Token.Keywords.ExceptVal, _Token.Keywords.ForBag, _Token.Keywords.ForVal, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.IfVal, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.SuperVal, _Token.Keywords.SwitchVal, _Token.Keywords.UnlessVal, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	function parseExprPlain(tokens) {
		const parts = parseExprParts(tokens);
		switch (parts.length) {
			case 0:
				(0, _context.fail)(tokens.loc, 'Expected an expression, got nothing.');
			case 1:
				return (0, _util.head)(parts);
			default:
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.tail)(parts));
		}
	}

	function parseCond(tokens) {
		const parts = parseExprParts(tokens);
		(0, _context.check)(parts.length === 3, tokens.loc, () => `${ (0, _CompileError.code)('cond') } takes exactly 3 arguments.`);
		return new _MsAst.Cond(tokens.loc, parts[0], parts[1], parts[2]);
	}

	function parseWith(tokens) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock32 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock32[0];
		const block = _beforeAndBlock32[1];

		var _ifElse = (0, _util.ifElse)(before.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.As, _)), _ref2 => {
			let before = _ref2.before;
			let after = _ref2.after;

			(0, _context.check)(after.size() === 1, () => `Expected only 1 token after ${ (0, _CompileError.code)('as') }.`);
			return [parseExprPlain(before), (0, _parseLocalDeclares.parseLocalDeclare)(after.head())];
		}, () => [parseExprPlain(before), _MsAst.LocalDeclare.focus(tokens.loc)]);

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const val = _ifElse2[0];
		const declare = _ifElse2[1];

		return new _MsAst.With(tokens.loc, declare, val, (0, _parseBlock.parseBlockDo)(block));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBaUJ3QixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7QUFBbEIsVUFBUyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3pDLFNBQU8sVUFaVyxNQUFNLEVBWVYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksV0FiakIsU0FBUyxFQWFrQixPQWJoQixRQUFRLENBYWlCLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN0RSxNQUFNLElBQUk7O0FBRVQsU0FBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtBQUM5QixlQWZLLGFBQWEsRUFlSixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hELFNBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7QUFFbEMsU0FBTSxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqRCxVQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLGlCQTFCSSxLQUFLLEVBMEJILElBQUksbUJBdkI2QixJQUFJLEFBdUJqQixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFDckMsQ0FBQyxxQkFBcUIsR0FBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsVUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUMxQyxNQUFN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QUFZLEVBbUpvQixLQUFLLENBQUMsQ0FBQyxDQUFBO0VBQzlEIiwiZmlsZSI6InBhcnNlRXhwci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhbGwsIENvbmQsIENvbmRpdGlvbmFsVmFsLCBMb2NhbERlY2xhcmUsIExvZ2ljLCBMb2dpY3MsIE5ldywgTm90LCBPYmpQYWlyLCBPYmpTaW1wbGUsXG5cdFN1cGVyQ2FsbCwgV2l0aCwgWWllbGQsIFlpZWxkVG99IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZHMsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGhlYWQsIGlmRWxzZSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlQ2xhc3MsIHBhcnNlRXhjZXB0LCBwYXJzZVNpbmdsZSwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHtiZWZvcmVBbmRCbG9jaywgcGFyc2VCbG9ja0RvLCBwYXJzZUJsb2NrVmFsfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlRGVsIGZyb20gJy4vcGFyc2VEZWwnXG5pbXBvcnQge3BhcnNlRm9yQmFnLCBwYXJzZUZvclZhbH0gZnJvbSAnLi9wYXJzZUZvcidcbmltcG9ydCBwYXJzZUZ1biBmcm9tICcuL3BhcnNlRnVuJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24sIF8pKSxcblx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0Y2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke25hbWV9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKSlcbn1cblxuLyoqXG5UcmVhdGluZyB0b2tlbnMgc2VwYXJhdGVseSwgcGFyc2Uge0BsaW5rIFZhbH1zLlxuVGhpcyBpcyBjYWxsZWQgZm9yIGUuZy4gdGhlIGNvbnRlbnRzIG9mIGFuIGFycmF5IChgW2EgYiBjXWApLlxuVGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB7QGxpbmsgcGFyc2VFeHByfSBiZWNhdXNlIGBhIGJgIHdpbGwgcGFyc2UgYXMgMiBkaWZmZXJlbnQgdGhpbmdzLCBub3QgYSBjYWxsLlxuSG93ZXZlciwgYGNvbmQgYSBiIGNgIHdpbGwgc3RpbGwgcGFyc2UgYXMgYSBzaW5nbGUgZXhwcmVzc2lvbi5cbkByZXR1cm4ge0FycmF5PFZhbD59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXhwclBhcnRzKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChleHByU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjb25zdCBnZXRMYXN0ID0gKCkgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkFuZDogY2FzZSBLZXl3b3Jkcy5Pcjoge1xuXHRcdFx0XHRcdFx0Y29uc3Qga2luZCA9IGF0LmtpbmQgPT09IEtleXdvcmRzLkFuZCA/IExvZ2ljcy5BbmQgOiBMb2dpY3MuT3Jcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBraW5kLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQ2FzZVZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UodHJ1ZSwgZmFsc2UsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQ2xhc3M6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNvbmQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRGVsVmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRGVsKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRXhjZXB0VmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtleXdvcmRzLkV4Y2VwdFZhbCwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JCYWc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JWYWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JWYWwoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW46IGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOiBjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46IGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLklmVmFsOiBjYXNlIEtleXdvcmRzLlVubGVzc1ZhbDoge1xuXHRcdFx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsVmFsKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBsYWluKGJlZm9yZSksXG5cdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRhdC5raW5kID09PSBLZXl3b3Jkcy5Vbmxlc3NWYWwpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuTmV3OiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGFmdGVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBOZXcoYXQubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuTm90OlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBOb3QoYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5TdXBlclZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgU3VwZXJDYWxsKGF0LmxvYywgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuU3dpdGNoVmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLldpdGg6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VXaXRoKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuWWllbGQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkKGF0LmxvYyxcblx0XHRcdFx0XHRcdFx0b3BJZighYWZ0ZXIuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHJQbGFpbihhZnRlcikpKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuWWllbGRUbzpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGRUbyhhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYXQua2luZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhdChiZWZvcmUubWFwKHBhcnNlU2luZ2xlKSwgZ2V0TGFzdCgpKVxuXHRcdH0sXG5cdFx0KCkgPT4gdG9rZW5zLm1hcChwYXJzZVNpbmdsZSkpXG59XG5cbmNvbnN0IGV4cHJTcGxpdEtleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkFuZCwgS2V5d29yZHMuQ2FzZVZhbCwgS2V5d29yZHMuQ2xhc3MsIEtleXdvcmRzLkNvbmQsIEtleXdvcmRzLkRlbFZhbCxcblx0S2V5d29yZHMuRXhjZXB0VmFsLCBLZXl3b3Jkcy5Gb3JCYWcsIEtleXdvcmRzLkZvclZhbCwgS2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLCBLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbywgS2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvLCBLZXl3b3Jkcy5JZlZhbCwgS2V5d29yZHMuTmV3LCBLZXl3b3Jkcy5Ob3QsXG5cdEtleXdvcmRzLk9yLCBLZXl3b3Jkcy5TdXBlclZhbCwgS2V5d29yZHMuU3dpdGNoVmFsLCBLZXl3b3Jkcy5Vbmxlc3NWYWwsIEtleXdvcmRzLldpdGgsXG5cdEtleXdvcmRzLllpZWxkLCBLZXl3b3Jkcy5ZaWVsZFRvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUV4cHJQbGFpbih0b2tlbnMpIHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0ZmFpbCh0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJylcblx0XHRjYXNlIDE6XG5cdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmQodG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPT09IDMsIHRva2Vucy5sb2MsICgpID0+IGAke2NvZGUoJ2NvbmQnKX0gdGFrZXMgZXhhY3RseSAzIGFyZ3VtZW50cy5gKVxuXHRyZXR1cm4gbmV3IENvbmQodG9rZW5zLmxvYywgcGFydHNbMF0sIHBhcnRzWzFdLCBwYXJ0c1syXSlcbn1cblxuZnVuY3Rpb24gcGFyc2VXaXRoKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgW3ZhbCwgZGVjbGFyZV0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLkFzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y2hlY2soYWZ0ZXIuc2l6ZSgpID09PSAxLCAoKSA9PlxuXHRcdFx0XHRgRXhwZWN0ZWQgb25seSAxIHRva2VuIGFmdGVyICR7Y29kZSgnYXMnKX0uYClcblx0XHRcdHJldHVybiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKV1cblx0XHR9LFxuXHRcdCgpID0+IFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyldKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2tEbyhibG9jaykpXG59XG4iXX0=