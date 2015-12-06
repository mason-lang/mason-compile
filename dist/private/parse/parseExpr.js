'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseCase', './parseDel', './parseFor', './parseFun', './parseMethod', './parseKind', './parseLocalDeclares', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseFor'), require('./parseFun'), require('./parseMethod'), require('./parseKind'), require('./parseLocalDeclares'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseCase, global.parseDel, global.parseFor, global.parseFun, global.parseMethod, global.parseKind, global.parseLocalDeclares, global.Slice);
		global.parseExpr = mod.exports;
	}
})(this, function (exports, _Loc, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseCase, _parseDel, _parseFor, _parseFun, _parseMethod, _parseKind, _parseLocalDeclares, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExpr;
	exports.opParseExpr = opParseExpr;
	exports.parseExprParts = parseExprParts;

	var _Loc2 = _interopRequireDefault(_Loc);

	var _parseBlock2 = _interopRequireDefault(_parseBlock);

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseFor2 = _interopRequireDefault(_parseFor);

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _parseMethod2 = _interopRequireDefault(_parseMethod);

	var _parseKind2 = _interopRequireDefault(_parseKind);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseExpr(tokens) {
		return (0, _util.ifElse)(tokens.opSplitMany(_ => (0, _Token.isKeyword)(_Token.Keywords.ObjEntry, _)), splits => {
			const first = splits[0].before;
			(0, _checks.checkNonEmpty)(first, 'unexpected', splits[0].at);
			const tokensCaller = first.rtail();
			const pairs = [];

			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last();
				(0, _context.check)(name instanceof _Token.Name, name.loc, 'expectedName', name);
				const tokensValue = i === splits.length - 2 ? splits[i + 1].before : splits[i + 1].before.rtail();
				const value = parseExprPlain(tokensValue);
				const loc = new _Loc2.default(name.loc.start, tokensValue.loc.end);
				pairs.push(new _MsAst.ObjPair(loc, name.name, value));
			}

			const val = new _MsAst.ObjSimple(tokens.loc, pairs);
			if (tokensCaller.isEmpty()) return val;else {
				const parts = parseExprParts(tokensCaller);
				return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.cat)((0, _util.tail)(parts), val));
			}
		}, () => parseExprPlain(tokens));
	}

	function opParseExpr(tokens) {
		return (0, _util.opIf)(!tokens.isEmpty(), () => parseExpr(tokens));
	}

	function parseExprParts(tokens) {
		return (0, _util.ifElse)(tokens.opSplitOnce(isSplitKeyword), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return (0, _util.cat)(before.map(_parse.parseSingle), keywordExpr(at, after));
		}, () => {
			const last = tokens.last();

			if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, last)) {
				const h = _Slice2.default.group(last).head();

				if (isSplitKeyword(h)) (0, _context.warn)(h.loc, 'extraParens');
			}

			return tokens.map(_parse.parseSingle);
		});
	}

	function keywordExpr(at, after) {
		switch (at.kind) {
			case _Token.Keywords.And:
			case _Token.Keywords.Or:
				{
					const kind = at.kind === _Token.Keywords.And ? _MsAst.Logics.And : _MsAst.Logics.Or;
					return new _MsAst.Logic(at.loc, kind, parseExprParts(after));
				}

			case _Token.Keywords.Await:
				return new _MsAst.Await(at.loc, parseExprPlain(after));

			case _Token.Keywords.Case:
				return (0, _parseCase2.default)(false, after);

			case _Token.Keywords.Class:
				return (0, _parse.parseClass)(after);

			case _Token.Keywords.Cond:
				return parseCond(after);

			case _Token.Keywords.Del:
				return (0, _parseDel2.default)(after);

			case _Token.Keywords.Except:
				return (0, _parse.parseExcept)(after);

			case _Token.Keywords.For:
			case _Token.Keywords.ForAsync:
			case _Token.Keywords.ForBag:
				return (0, _parseFor2.default)(at.kind, after);

			case _Token.Keywords.Fun:
			case _Token.Keywords.FunDo:
			case _Token.Keywords.FunThis:
			case _Token.Keywords.FunThisDo:
			case _Token.Keywords.FunAsync:
			case _Token.Keywords.FunAsyncDo:
			case _Token.Keywords.FunThisAsync:
			case _Token.Keywords.FunThisAsyncDo:
			case _Token.Keywords.FunGen:
			case _Token.Keywords.FunGenDo:
			case _Token.Keywords.FunThisGen:
			case _Token.Keywords.FunThisGenDo:
				return (0, _parseFun2.default)(at.kind, after);

			case _Token.Keywords.If:
			case _Token.Keywords.Unless:
				return parseConditional(at.kind, after);

			case _Token.Keywords.Kind:
				return (0, _parseKind2.default)(after);

			case _Token.Keywords.Method:
				return (0, _parseMethod2.default)(after);

			case _Token.Keywords.New:
				{
					const parts = parseExprParts(after);
					return new _MsAst.New(at.loc, (0, _util.head)(parts), (0, _util.tail)(parts));
				}

			case _Token.Keywords.Not:
				return new _MsAst.Not(at.loc, parseExprPlain(after));

			case _Token.Keywords.Pipe:
				return parsePipe(after);

			case _Token.Keywords.Super:
				return new _MsAst.SuperCall(at.loc, parseExprParts(after));

			case _Token.Keywords.Switch:
				return (0, _parse.parseSwitch)(false, after);

			case _Token.Keywords.With:
				return parseWith(after);

			case _Token.Keywords.Yield:
				return new _MsAst.Yield(at.loc, (0, _util.opIf)(!after.isEmpty(), () => parseExprPlain(after)));

			case _Token.Keywords.YieldTo:
				return new _MsAst.YieldTo(at.loc, parseExprPlain(after));

			default:
				throw new Error(at.kind);
		}
	}

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.Await, _Token.Keywords.Case, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.Del, _Token.Keywords.Except, _Token.Keywords.For, _Token.Keywords.ForAsync, _Token.Keywords.ForBag, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.If, _Token.Keywords.Kind, _Token.Keywords.Method, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.Pipe, _Token.Keywords.Super, _Token.Keywords.Switch, _Token.Keywords.Unless, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	function isSplitKeyword(_) {
		return (0, _Token.isAnyKeyword)(exprSplitKeywords, _);
	}

	function parseExprPlain(tokens) {
		(0, _checks.checkNonEmpty)(tokens, 'expectedExpression');
		const parts = parseExprParts(tokens);

		if (parts.length === 1) {
			if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, tokens.head()) && !(0, _util.head)(parts) instanceof _MsAst.ObjSimple) (0, _context.warn)(tokens.loc, 'extraParens');
			return (0, _util.head)(parts);
		} else return new _MsAst.Call(tokens.loc, (0, _util.head)(parts), (0, _util.tail)(parts));
	}

	function parseCond(tokens) {
		const parts = parseExprParts(tokens);
		(0, _context.check)(parts.length === 3, tokens.loc, () => 'condArguments');
		return new _MsAst.Cond(tokens.loc, ...parts);
	}

	function parseConditional(kind, tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _ifElse = (0, _util.ifElse)(opBlock, _ => [parseExprPlain(before), (0, _parseBlock2.default)(_)], () => {
			const parts = parseExprParts(before);
			(0, _context.check)(parts.length === 2, tokens.loc, 'conditionalArguments');
			return parts;
		});

		var _ifElse2 = _slicedToArray(_ifElse, 2);

		const condition = _ifElse2[0];
		const result = _ifElse2[1];
		return new _MsAst.Conditional(tokens.loc, condition, result, kind === _Token.Keywords.Unless);
	}

	function parsePipe(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];
		const val = parseExpr(before);
		const pipes = block.mapSlices(parseExpr);
		return new _MsAst.Pipe(tokens.loc, val, pipes);
	}

	function parseWith(tokens) {
		var _beforeAndBlock3 = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];

		var _ifElse3 = (0, _util.ifElse)(before.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.As, _)), _ref2 => {
			let before = _ref2.before;
			let after = _ref2.after;
			(0, _context.check)(after.size() === 1, 'asToken');
			return [parseExprPlain(before), (0, _parseLocalDeclares.parseLocalDeclare)(after.head())];
		}, () => [parseExprPlain(before), _MsAst.LocalDeclare.focus(tokens.loc)]);

		var _ifElse4 = _slicedToArray(_ifElse3, 2);

		const val = _ifElse4[0];
		const declare = _ifElse4[1];
		return new _MsAst.With(tokens.loc, declare, val, (0, _parseBlock2.default)(block));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBbUJ3QixTQUFTO1NBOEJqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBekNOLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQThCakIsV0FBVzs7OztVQVdYLGNBQWMiLCJmaWxlIjoicGFyc2VFeHByLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0F3YWl0LCBDYWxsLCBDb25kLCBDb25kaXRpb25hbCwgTG9jYWxEZWNsYXJlLCBMb2dpYywgTG9naWNzLCBOZXcsIE5vdCwgT2JqUGFpciwgT2JqU2ltcGxlLFxuXHRQaXBlLCBTdXBlckNhbGwsIFdpdGgsIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHMsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGhlYWQsIGlmRWxzZSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlQ2xhc3MsIHBhcnNlRXhjZXB0LCBwYXJzZVNpbmdsZSwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywgYmVmb3JlQW5kT3BCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZURlbCBmcm9tICcuL3BhcnNlRGVsJ1xuaW1wb3J0IHBhcnNlRm9yIGZyb20gJy4vcGFyc2VGb3InXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZCBmcm9tICcuL3BhcnNlTWV0aG9kJ1xuaW1wb3J0IHBhcnNlS2luZCBmcm9tICcuL3BhcnNlS2luZCdcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5PYmpFbnRyeSwgXykpLFxuXHRcdHNwbGl0cyA9PiB7XG5cdFx0XHQvLyBTaG9ydCBvYmplY3QgZm9ybSwgc3VjaCBhcyAoYS4gMSwgYi4gMilcblx0XHRcdGNvbnN0IGZpcnN0ID0gc3BsaXRzWzBdLmJlZm9yZVxuXHRcdFx0Y2hlY2tOb25FbXB0eShmaXJzdCwgJ3VuZXhwZWN0ZWQnLCBzcGxpdHNbMF0uYXQpXG5cdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0Y2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAnZXhwZWN0ZWROYW1lJywgbmFtZSlcblx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wUGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gb3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5cbi8qKlxuVHJlYXRpbmcgdG9rZW5zIHNlcGFyYXRlbHksIHBhcnNlIHtAbGluayBWYWx9cy5cblRoaXMgaXMgY2FsbGVkIGZvciBlLmcuIHRoZSBjb250ZW50cyBvZiBhbiBhcnJheSAoYFthIGIgY11gKS5cblRoaXMgaXMgZGlmZmVyZW50IGZyb20ge0BsaW5rIHBhcnNlRXhwcn0gYmVjYXVzZSBgYSBiYCB3aWxsIHBhcnNlIGFzIDIgZGlmZmVyZW50IHRoaW5ncywgbm90IGEgY2FsbC5cbkhvd2V2ZXIsIGBjb25kIGEgYiBjYCB3aWxsIHN0aWxsIHBhcnNlIGFzIGEgc2luZ2xlIGV4cHJlc3Npb24uXG5AcmV0dXJuIHtBcnJheTxWYWw+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoaXNTcGxpdEtleXdvcmQpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiBjYXQoYmVmb3JlLm1hcChwYXJzZVNpbmdsZSksIGtleXdvcmRFeHByKGF0LCBhZnRlcikpLFxuXHRcdCgpID0+IHtcblx0XHRcdC8vIElmIHRoZSBsYXN0IHBhcnQgc3RhcnRzIHdpdGggYSBrZXl3b3JkLCBwYXJlbnMgYXJlIHVubmVjZXNzYXJ5LlxuXHRcdFx0Ly8gZS5nLjogYGZvbyAobm90IHRydWUpYCBjYW4ganVzdCBiZSBgZm9vIG5vdCB0cnVlYC5cblx0XHRcdC8vIE5vdGUgdGhhdCBgZm9vIChub3QgdHJ1ZSkgZmFsc2VgIGRvZXMgbmVlZCB0aGUgcGFyZW5zLlxuXHRcdFx0Y29uc3QgbGFzdCA9IHRva2Vucy5sYXN0KClcblx0XHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgbGFzdCkpIHtcblx0XHRcdFx0Y29uc3QgaCA9IFNsaWNlLmdyb3VwKGxhc3QpLmhlYWQoKVxuXHRcdFx0XHRpZiAoaXNTcGxpdEtleXdvcmQoaCkpXG5cdFx0XHRcdFx0d2FybihoLmxvYywgJ2V4dHJhUGFyZW5zJylcblx0XHRcdH1cblx0XHRcdHJldHVybiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKVxuXHRcdH0pXG59XG5cbi8qKiBUaGUga2V5d29yZCBgYXRgIGdyb3VwcyB3aXRoIGV2ZXJ5dGhpbmcgYWZ0ZXIgaXQuICovXG5mdW5jdGlvbiBrZXl3b3JkRXhwcihhdCwgYWZ0ZXIpIHtcblx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5BbmQ6IGNhc2UgS2V5d29yZHMuT3I6IHtcblx0XHRcdGNvbnN0IGtpbmQgPSBhdC5raW5kID09PSBLZXl3b3Jkcy5BbmQgPyBMb2dpY3MuQW5kIDogTG9naWNzLk9yXG5cdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywga2luZCwgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdH1cblx0XHRjYXNlIEtleXdvcmRzLkF3YWl0OlxuXHRcdFx0cmV0dXJuIG5ldyBBd2FpdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRjYXNlIEtleXdvcmRzLkNhc2U6XG5cdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkNsYXNzOlxuXHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Db25kOlxuXHRcdFx0cmV0dXJuIHBhcnNlQ29uZChhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkRlbDpcblx0XHRcdHJldHVybiBwYXJzZURlbChhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdDpcblx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkZvcjogY2FzZSBLZXl3b3Jkcy5Gb3JBc3luYzogY2FzZSBLZXl3b3Jkcy5Gb3JCYWc6XG5cdFx0XHRyZXR1cm4gcGFyc2VGb3IoYXQua2luZCwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46IGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOiBjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46IGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLklmOiBjYXNlIEtleXdvcmRzLlVubGVzczpcblx0XHRcdHJldHVybiBwYXJzZUNvbmRpdGlvbmFsKGF0LmtpbmQsIGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuS2luZDpcblx0XHRcdHJldHVybiBwYXJzZUtpbmQoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5NZXRob2Q6XG5cdFx0XHRyZXR1cm4gcGFyc2VNZXRob2QoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OZXc6IHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0XHR9XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Ob3Q6XG5cdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRjYXNlIEtleXdvcmRzLlBpcGU6XG5cdFx0XHRyZXR1cm4gcGFyc2VQaXBlKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsIG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHR9XG59XG5cbmNvbnN0IGV4cHJTcGxpdEtleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkFuZCwgS2V5d29yZHMuQXdhaXQsIEtleXdvcmRzLkNhc2UsIEtleXdvcmRzLkNsYXNzLCBLZXl3b3Jkcy5Db25kLCBLZXl3b3Jkcy5EZWwsXG5cdEtleXdvcmRzLkV4Y2VwdCwgS2V5d29yZHMuRm9yLCBLZXl3b3Jkcy5Gb3JBc3luYywgS2V5d29yZHMuRm9yQmFnLCBLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzLCBLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG8sIEtleXdvcmRzLklmLCBLZXl3b3Jkcy5LaW5kLCBLZXl3b3Jkcy5NZXRob2QsXG5cdEtleXdvcmRzLk5ldywgS2V5d29yZHMuTm90LCBLZXl3b3Jkcy5PciwgS2V5d29yZHMuUGlwZSwgS2V5d29yZHMuU3VwZXIsIEtleXdvcmRzLlN3aXRjaCxcblx0S2V5d29yZHMuVW5sZXNzLCBLZXl3b3Jkcy5XaXRoLCBLZXl3b3Jkcy5ZaWVsZCwgS2V5d29yZHMuWWllbGRUb1xuXSlcblxuZnVuY3Rpb24gaXNTcGxpdEtleXdvcmQoXykge1xuXHRyZXR1cm4gaXNBbnlLZXl3b3JkKGV4cHJTcGxpdEtleXdvcmRzLCBfKVxufVxuXG5mdW5jdGlvbiBwYXJzZUV4cHJQbGFpbih0b2tlbnMpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdleHBlY3RlZEV4cHJlc3Npb24nKVxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0aWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8qXG5cdFx0V2FybiBpZiBhbiBleHByZXNzaW9uIGNvbnNpc3RzIG9ubHkgb2YgYSBHcm91cHMuUGFyZW50aGVzaXMuXG5cdFx0ZS5nLjogYChub3QgdHJ1ZSlgIG9uIGEgbGluZSBieSBpdHNlbGZcblx0XHRlLmcuOiBgbm90IChub3QgdHJ1ZSlgIGJlY2F1c2UgdGhlIGZpcnN0IGBub3RgIHRha2VzIGFuIGV4cHJlc3Npb24gYWZ0ZXIgaXQuXG5cdFx0Ki9cblx0XHQvLyB0b2RvOiB0aGlzIGlzIGEgZ29vZCByZWFzb24gdG8gY2hhbmdlIHRoZSBPYmpTaW1wbGUgc3ludGF4LlxuXHRcdC8vIGBhLiAxIGIuIDJgIGlzIGludGVycHJldGVkIGFzIHRoZSBPYmpFbnRyeSBgYS4gMSAoYi4gMilgLCBzbyBpdCBuZWVkcyBwYXJlbnRoZXNlcy5cblx0XHRpZiAoaXNHcm91cChHcm91cHMuUGFyZW50aGVzaXMsIHRva2Vucy5oZWFkKCkpICYmICFoZWFkKHBhcnRzKSBpbnN0YW5jZW9mIE9ialNpbXBsZSlcblx0XHRcdHdhcm4odG9rZW5zLmxvYywgJ2V4dHJhUGFyZW5zJylcblx0XHRyZXR1cm4gaGVhZChwYXJ0cylcblx0fSBlbHNlXG5cdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kKHRva2Vucykge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0Y2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PiAnY29uZEFyZ3VtZW50cycpXG5cdHJldHVybiBuZXcgQ29uZCh0b2tlbnMubG9jLCAuLi5wYXJ0cylcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25hbChraW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3QgW2NvbmRpdGlvbiwgcmVzdWx0XSA9IGlmRWxzZShvcEJsb2NrLFxuXHRcdF8gPT4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlQmxvY2soXyldLFxuXHRcdCgpID0+IHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYmVmb3JlKVxuXHRcdFx0Y2hlY2socGFydHMubGVuZ3RoID09PSAyLCB0b2tlbnMubG9jLCAnY29uZGl0aW9uYWxBcmd1bWVudHMnKVxuXHRcdFx0cmV0dXJuIHBhcnRzXG5cdFx0fSlcblx0cmV0dXJuIG5ldyBDb25kaXRpb25hbCh0b2tlbnMubG9jLCBjb25kaXRpb24sIHJlc3VsdCwga2luZCA9PT0gS2V5d29yZHMuVW5sZXNzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVBpcGUodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2Vucylcblx0Y29uc3QgdmFsID0gcGFyc2VFeHByKGJlZm9yZSlcblx0Y29uc3QgcGlwZXMgPSBibG9jay5tYXBTbGljZXMocGFyc2VFeHByKVxuXHRyZXR1cm4gbmV3IFBpcGUodG9rZW5zLmxvYywgdmFsLCBwaXBlcylcbn1cblxuZnVuY3Rpb24gcGFyc2VXaXRoKHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayh0b2tlbnMpXG5cblx0Y29uc3QgW3ZhbCwgZGVjbGFyZV0gPSBpZkVsc2UoYmVmb3JlLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLkFzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y2hlY2soYWZ0ZXIuc2l6ZSgpID09PSAxLCAnYXNUb2tlbicpXG5cdFx0XHRyZXR1cm4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSldXG5cdFx0fSxcblx0XHQoKSA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgTG9jYWxEZWNsYXJlLmZvY3VzKHRva2Vucy5sb2MpXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrKGJsb2NrKSlcbn1cbiJdfQ==