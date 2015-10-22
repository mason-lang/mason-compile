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
					case _Token.Keywords.Fun:case _Token.Keywords.FunDo:case _Token.Keywords.FunGen:
					case _Token.Keywords.FunGenDo:case _Token.Keywords.FunThis:case _Token.Keywords.FunThisDo:
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

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.CaseVal, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.DelVal, _Token.Keywords.ExceptVal, _Token.Keywords.ForBag, _Token.Keywords.ForVal, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.IfVal, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.SuperVal, _Token.Keywords.SwitchVal, _Token.Keywords.UnlessVal, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBaUJ3QixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7QUFBbEIsVUFBUyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3pDLFNBQU8sVUFaVyxNQUFNLEVBWVYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksV0FiakIsU0FBUyxFQWFrQixPQWJoQixRQUFRLENBYWlCLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN0RSxNQUFNLElBQUk7O0FBRVQsU0FBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtBQUM5QixlQWZLLGFBQWEsRUFlSixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hELFNBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7QUFFbEMsU0FBTSxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqRCxVQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLGlCQTFCSSxLQUFLLEVBMEJILElBQUksbUJBdkI2QixJQUFJLEFBdUJqQixFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFDckMsQ0FBQyxxQkFBcUIsR0FBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsVUFBTSxXQUFXLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUMxQyxNQUFN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QTFJTCxNQUFNLEVBMElNLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLFdBM0lqQyxTQUFTLEVBMklrQyxPQTNJaEMsUUFBUSxDQTJJaUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQy9FLEFBQUMsS0FBZSxJQUFLO09BQW5CLE1BQU0sR0FBUCxLQUFlLENBQWQsTUFBTTtPQUFFLEtBQUssR0FBZCxLQUFlLENBQU4sS0FBSzs7QUFDZCxnQkFoSkssS0FBSyxFQWdKSixLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQ3pCLENBQUMsNEJBQTRCLEdBQUUsa0JBbEozQixJQUFJLEVBa0o0QixJQUFJLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLFVBQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsd0JBdEkzQixpQkFBaUIsRUFzSTRCLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7R0FDaEUsRUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BbkpHLFlBQVksQ0FtSkYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzs7O1FBTnpELEdBQUc7UUFBRSxPQUFPOztBQVFuQixTQUFPLFdBcEpJLElBQUksQ0FvSkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLGdCQS9JbkIsWUFBWSxFQStJb0IsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUM5RCIsImZpbGUiOiJwYXJzZUV4cHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsLCBDb25kLCBDb25kaXRpb25hbFZhbCwgTG9jYWxEZWNsYXJlLCBMb2dpYywgTG9naWNzLCBOZXcsIE5vdCwgT2JqUGFpciwgT2JqU2ltcGxlLFxuXHRTdXBlckNhbGwsIFdpdGgsIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmRzLCBOYW1lfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7Y2F0LCBoZWFkLCBpZkVsc2UsIG9wSWYsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUNsYXNzLCBwYXJzZUV4Y2VwdCwgcGFyc2VTaW5nbGUsIHBhcnNlU3dpdGNofSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VCbG9ja1ZhbH0gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZURlbCBmcm9tICcuL3BhcnNlRGVsJ1xuaW1wb3J0IHtwYXJzZUZvckJhZywgcGFyc2VGb3JWYWx9IGZyb20gJy4vcGFyc2VGb3InXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgVmFsfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRXhwcih0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnkoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduLCBfKSksXG5cdFx0c3BsaXRzID0+IHtcblx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0Y29uc3QgZmlyc3QgPSBzcGxpdHNbMF0uYmVmb3JlXG5cdFx0XHRjaGVja05vbkVtcHR5KGZpcnN0LCAoKSA9PiBgVW5leHBlY3RlZCAke3NwbGl0c1swXS5hdH1gKVxuXHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRjb25zdCBwYWlycyA9IFtdXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGggLSAxOyBpID0gaSArIDEpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdGNoZWNrKG5hbWUgaW5zdGFuY2VvZiBOYW1lLCBuYW1lLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlIDpcblx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdGNvbnN0IGxvYyA9IG5ldyBMb2MobmFtZS5sb2Muc3RhcnQsIHRva2Vuc1ZhbHVlLmxvYy5lbmQpXG5cdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdH1cblx0XHRcdGNvbnN0IHZhbCA9IG5ldyBPYmpTaW1wbGUodG9rZW5zLmxvYywgcGFpcnMpXG5cdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIGNhdCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdH1cblx0XHR9LFxuXHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2VucykpXG59XG5cbi8qKlxuVHJlYXRpbmcgdG9rZW5zIHNlcGFyYXRlbHksIHBhcnNlIHtAbGluayBWYWx9cy5cblRoaXMgaXMgY2FsbGVkIGZvciBlLmcuIHRoZSBjb250ZW50cyBvZiBhbiBhcnJheSAoYFthIGIgY11gKS5cblRoaXMgaXMgZGlmZmVyZW50IGZyb20ge0BsaW5rIHBhcnNlRXhwcn0gYmVjYXVzZSBgYSBiYCB3aWxsIHBhcnNlIGFzIDIgZGlmZmVyZW50IHRoaW5ncywgbm90IGEgY2FsbC5cbkhvd2V2ZXIsIGBjb25kIGEgYiBjYCB3aWxsIHN0aWxsIHBhcnNlIGFzIGEgc2luZ2xlIGV4cHJlc3Npb24uXG5AcmV0dXJuIHtBcnJheTxWYWw+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZXhwclNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y29uc3QgZ2V0TGFzdCA9ICgpID0+IHtcblx0XHRcdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5BbmQ6IGNhc2UgS2V5d29yZHMuT3I6IHtcblx0XHRcdFx0XHRcdGNvbnN0IGtpbmQgPSBhdC5raW5kID09PSBLZXl3b3Jkcy5BbmQgPyBMb2dpY3MuQW5kIDogTG9naWNzLk9yXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywga2luZCwgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNhc2VWYWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNsYXNzOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Db25kOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ29uZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkRlbFZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZURlbChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdFZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLZXl3b3Jkcy5FeGNlcHRWYWwsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRm9yQmFnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yQmFnKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRm9yVmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yVmFsKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRnVuOiBjYXNlIEtleXdvcmRzLkZ1bkRvOiBjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOiBjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGdW4oYXQua2luZCwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZlZhbDogY2FzZSBLZXl3b3Jkcy5Vbmxlc3NWYWw6IHtcblx0XHRcdFx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKGFmdGVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbFZhbCh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdFx0XHRwYXJzZUV4cHJQbGFpbihiZWZvcmUpLFxuXHRcdFx0XHRcdFx0XHRwYXJzZUJsb2NrVmFsKGJsb2NrKSxcblx0XHRcdFx0XHRcdFx0YXQua2luZCA9PT0gS2V5d29yZHMuVW5sZXNzVmFsKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5ldzoge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhhZnRlcilcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5vdDpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXJWYWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaFZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaCh0cnVlLCBmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsXG5cdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjYXQoYmVmb3JlLm1hcChwYXJzZVNpbmdsZSksIGdldExhc3QoKSlcblx0XHR9LFxuXHRcdCgpID0+IHRva2Vucy5tYXAocGFyc2VTaW5nbGUpKVxufVxuXG5jb25zdCBleHByU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5BbmQsIEtleXdvcmRzLkNhc2VWYWwsIEtleXdvcmRzLkNsYXNzLCBLZXl3b3Jkcy5Db25kLCBLZXl3b3Jkcy5EZWxWYWwsXG5cdEtleXdvcmRzLkV4Y2VwdFZhbCwgS2V5d29yZHMuRm9yQmFnLCBLZXl3b3Jkcy5Gb3JWYWwsIEtleXdvcmRzLkZ1biwgS2V5d29yZHMuRnVuRG8sXG5cdEtleXdvcmRzLkZ1bkdlbiwgS2V5d29yZHMuRnVuR2VuRG8sIEtleXdvcmRzLkZ1blRoaXMsIEtleXdvcmRzLkZ1blRoaXNEbywgS2V5d29yZHMuRnVuVGhpc0dlbixcblx0S2V5d29yZHMuRnVuVGhpc0dlbkRvLCBLZXl3b3Jkcy5JZlZhbCwgS2V5d29yZHMuTmV3LCBLZXl3b3Jkcy5Ob3QsIEtleXdvcmRzLk9yLFxuXHRLZXl3b3Jkcy5TdXBlclZhbCwgS2V5d29yZHMuU3dpdGNoVmFsLCBLZXl3b3Jkcy5Vbmxlc3NWYWwsIEtleXdvcmRzLldpdGgsIEtleXdvcmRzLllpZWxkLFxuXHRLZXl3b3Jkcy5ZaWVsZFRvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUV4cHJQbGFpbih0b2tlbnMpIHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdHN3aXRjaCAocGFydHMubGVuZ3RoKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0ZmFpbCh0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgZ290IG5vdGhpbmcuJylcblx0XHRjYXNlIDE6XG5cdFx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmQodG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPT09IDMsIHRva2Vucy5sb2MsICgpID0+IGAke2NvZGUoJ2NvbmQnKX0gdGFrZXMgZXhhY3RseSAzIGFyZ3VtZW50cy5gKVxuXHRyZXR1cm4gbmV3IENvbmQodG9rZW5zLmxvYywgcGFydHNbMF0sIHBhcnRzWzFdLCBwYXJ0c1syXSlcbn1cblxuZnVuY3Rpb24gcGFyc2VXaXRoKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgW3ZhbCwgZGVjbGFyZV0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLkFzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y2hlY2soYWZ0ZXIuc2l6ZSgpID09PSAxLCAoKSA9PlxuXHRcdFx0XHRgRXhwZWN0ZWQgb25seSAxIHRva2VuIGFmdGVyICR7Y29kZSgnYXMnKX0uYClcblx0XHRcdHJldHVybiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKV1cblx0XHR9LFxuXHRcdCgpID0+IFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyldKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2tEbyhibG9jaykpXG59XG4iXX0=