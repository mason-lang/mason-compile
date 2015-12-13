'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseCase', './parseDel', './parseFor', './parseFun', './parseMethod', './parseTrait', './parseLocalDeclares', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseFor'), require('./parseFun'), require('./parseMethod'), require('./parseTrait'), require('./parseLocalDeclares'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseCase, global.parseDel, global.parseFor, global.parseFun, global.parseMethod, global.parseTrait, global.parseLocalDeclares, global.Slice);
		global.parseExpr = mod.exports;
	}
})(this, function (exports, _Loc, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseCase, _parseDel, _parseFor, _parseFun, _parseMethod, _parseTrait, _parseLocalDeclares, _Slice) {
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

	var _parseTrait2 = _interopRequireDefault(_parseTrait);

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

			case _Token.Keywords.Trait:
				return (0, _parseTrait2.default)(after);

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

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.Await, _Token.Keywords.Case, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.Del, _Token.Keywords.Except, _Token.Keywords.For, _Token.Keywords.ForAsync, _Token.Keywords.ForBag, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.If, _Token.Keywords.Method, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.Pipe, _Token.Keywords.Super, _Token.Keywords.Switch, _Token.Keywords.Trait, _Token.Keywords.Unless, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBbUJ3QixTQUFTO1NBOEJqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBekNOLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQThCakIsV0FBVzs7OztVQVdYLGNBQWMiLCJmaWxlIjoicGFyc2VFeHByLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y2hlY2ssIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0F3YWl0LCBDYWxsLCBDb25kLCBDb25kaXRpb25hbCwgTG9jYWxEZWNsYXJlLCBMb2dpYywgTG9naWNzLCBOZXcsIE5vdCwgT2JqUGFpciwgT2JqU2ltcGxlLFxuXHRQaXBlLCBTdXBlckNhbGwsIFdpdGgsIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0FueUtleXdvcmQsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZHMsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGhlYWQsIGlmRWxzZSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlQ2xhc3MsIHBhcnNlRXhjZXB0LCBwYXJzZVNpbmdsZSwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywgYmVmb3JlQW5kT3BCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZURlbCBmcm9tICcuL3BhcnNlRGVsJ1xuaW1wb3J0IHBhcnNlRm9yIGZyb20gJy4vcGFyc2VGb3InXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZCBmcm9tICcuL3BhcnNlTWV0aG9kJ1xuaW1wb3J0IHBhcnNlVHJhaXQgZnJvbSAnLi9wYXJzZVRyYWl0J1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqIFBhcnNlIGEge0BsaW5rIFZhbH0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUV4cHIodG9rZW5zKSB7XG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRNYW55KF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLk9iakVudHJ5LCBfKSksXG5cdFx0c3BsaXRzID0+IHtcblx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0Y29uc3QgZmlyc3QgPSBzcGxpdHNbMF0uYmVmb3JlXG5cdFx0XHRjaGVja05vbkVtcHR5KGZpcnN0LCAndW5leHBlY3RlZCcsIHNwbGl0c1swXS5hdClcblx0XHRcdGNvbnN0IHRva2Vuc0NhbGxlciA9IGZpcnN0LnJ0YWlsKClcblxuXHRcdFx0Y29uc3QgcGFpcnMgPSBbXVxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBzcGxpdHNbaV0uYmVmb3JlLmxhc3QoKVxuXHRcdFx0XHRjaGVjayhuYW1lIGluc3RhbmNlb2YgTmFtZSwgbmFtZS5sb2MsICdleHBlY3RlZE5hbWUnLCBuYW1lKVxuXHRcdFx0XHRjb25zdCB0b2tlbnNWYWx1ZSA9IGkgPT09IHNwbGl0cy5sZW5ndGggLSAyID9cblx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZSA6XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUucnRhaWwoKVxuXHRcdFx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwclBsYWluKHRva2Vuc1ZhbHVlKVxuXHRcdFx0XHRjb25zdCBsb2MgPSBuZXcgTG9jKG5hbWUubG9jLnN0YXJ0LCB0b2tlbnNWYWx1ZS5sb2MuZW5kKVxuXHRcdFx0XHRwYWlycy5wdXNoKG5ldyBPYmpQYWlyKGxvYywgbmFtZS5uYW1lLCB2YWx1ZSkpXG5cdFx0XHR9XG5cdFx0XHRjb25zdCB2YWwgPSBuZXcgT2JqU2ltcGxlKHRva2Vucy5sb2MsIHBhaXJzKVxuXHRcdFx0aWYgKHRva2Vuc0NhbGxlci5pc0VtcHR5KCkpXG5cdFx0XHRcdHJldHVybiB2YWxcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vuc0NhbGxlcilcblx0XHRcdFx0cmV0dXJuIG5ldyBDYWxsKHRva2Vucy5sb2MsIGhlYWQocGFydHMpLCBjYXQodGFpbChwYXJ0cyksIHZhbCkpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiBwYXJzZUV4cHJQbGFpbih0b2tlbnMpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BQYXJzZUV4cHIodG9rZW5zKSB7XG5cdHJldHVybiBvcElmKCF0b2tlbnMuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcbn1cblxuLyoqXG5UcmVhdGluZyB0b2tlbnMgc2VwYXJhdGVseSwgcGFyc2Uge0BsaW5rIFZhbH1zLlxuVGhpcyBpcyBjYWxsZWQgZm9yIGUuZy4gdGhlIGNvbnRlbnRzIG9mIGFuIGFycmF5IChgW2EgYiBjXWApLlxuVGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB7QGxpbmsgcGFyc2VFeHByfSBiZWNhdXNlIGBhIGJgIHdpbGwgcGFyc2UgYXMgMiBkaWZmZXJlbnQgdGhpbmdzLCBub3QgYSBjYWxsLlxuSG93ZXZlciwgYGNvbmQgYSBiIGNgIHdpbGwgc3RpbGwgcGFyc2UgYXMgYSBzaW5nbGUgZXhwcmVzc2lvbi5cbkByZXR1cm4ge0FycmF5PFZhbD59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXhwclBhcnRzKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShpc1NwbGl0S2V5d29yZCksXG5cdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IGNhdChiZWZvcmUubWFwKHBhcnNlU2luZ2xlKSwga2V5d29yZEV4cHIoYXQsIGFmdGVyKSksXG5cdFx0KCkgPT4ge1xuXHRcdFx0Ly8gSWYgdGhlIGxhc3QgcGFydCBzdGFydHMgd2l0aCBhIGtleXdvcmQsIHBhcmVucyBhcmUgdW5uZWNlc3NhcnkuXG5cdFx0XHQvLyBlLmcuOiBgZm9vIChub3QgdHJ1ZSlgIGNhbiBqdXN0IGJlIGBmb28gbm90IHRydWVgLlxuXHRcdFx0Ly8gTm90ZSB0aGF0IGBmb28gKG5vdCB0cnVlKSBmYWxzZWAgZG9lcyBuZWVkIHRoZSBwYXJlbnMuXG5cdFx0XHRjb25zdCBsYXN0ID0gdG9rZW5zLmxhc3QoKVxuXHRcdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlBhcmVudGhlc2lzLCBsYXN0KSkge1xuXHRcdFx0XHRjb25zdCBoID0gU2xpY2UuZ3JvdXAobGFzdCkuaGVhZCgpXG5cdFx0XHRcdGlmIChpc1NwbGl0S2V5d29yZChoKSlcblx0XHRcdFx0XHR3YXJuKGgubG9jLCAnZXh0cmFQYXJlbnMnKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRva2Vucy5tYXAocGFyc2VTaW5nbGUpXG5cdFx0fSlcbn1cblxuLyoqIFRoZSBrZXl3b3JkIGBhdGAgZ3JvdXBzIHdpdGggZXZlcnl0aGluZyBhZnRlciBpdC4gKi9cbmZ1bmN0aW9uIGtleXdvcmRFeHByKGF0LCBhZnRlcikge1xuXHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkFuZDogY2FzZSBLZXl3b3Jkcy5Pcjoge1xuXHRcdFx0Y29uc3Qga2luZCA9IGF0LmtpbmQgPT09IEtleXdvcmRzLkFuZCA/IExvZ2ljcy5BbmQgOiBMb2dpY3MuT3Jcblx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBraW5kLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0fVxuXHRcdGNhc2UgS2V5d29yZHMuQXdhaXQ6XG5cdFx0XHRyZXR1cm4gbmV3IEF3YWl0KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdGNhc2UgS2V5d29yZHMuQ2FzZTpcblx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuQ2xhc3M6XG5cdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkNvbmQ6XG5cdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuRGVsOlxuXHRcdFx0cmV0dXJuIHBhcnNlRGVsKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuRXhjZXB0OlxuXHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuRm9yOiBjYXNlIEtleXdvcmRzLkZvckFzeW5jOiBjYXNlIEtleXdvcmRzLkZvckJhZzpcblx0XHRcdHJldHVybiBwYXJzZUZvcihhdC5raW5kLCBhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjogY2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjogY2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuSWY6IGNhc2UgS2V5d29yZHMuVW5sZXNzOlxuXHRcdFx0cmV0dXJuIHBhcnNlQ29uZGl0aW9uYWwoYXQua2luZCwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcmFpdDpcblx0XHRcdHJldHVybiBwYXJzZVRyYWl0KGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuTWV0aG9kOlxuXHRcdFx0cmV0dXJuIHBhcnNlTWV0aG9kKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuTmV3OiB7XG5cdFx0XHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGFmdGVyKVxuXHRcdFx0cmV0dXJuIG5ldyBOZXcoYXQubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdFx0fVxuXHRcdGNhc2UgS2V5d29yZHMuTm90OlxuXHRcdFx0cmV0dXJuIG5ldyBOb3QoYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5QaXBlOlxuXHRcdFx0cmV0dXJuIHBhcnNlUGlwZShhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLlN1cGVyOlxuXHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGwoYXQubG9jLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Td2l0Y2g6XG5cdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2goZmFsc2UsIGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuV2l0aDpcblx0XHRcdHJldHVybiBwYXJzZVdpdGgoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZDpcblx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLCBvcElmKCFhZnRlci5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwclBsYWluKGFmdGVyKSkpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYXQua2luZClcblx0fVxufVxuXG5jb25zdCBleHByU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5BbmQsIEtleXdvcmRzLkF3YWl0LCBLZXl3b3Jkcy5DYXNlLCBLZXl3b3Jkcy5DbGFzcywgS2V5d29yZHMuQ29uZCwgS2V5d29yZHMuRGVsLFxuXHRLZXl3b3Jkcy5FeGNlcHQsIEtleXdvcmRzLkZvciwgS2V5d29yZHMuRm9yQXN5bmMsIEtleXdvcmRzLkZvckJhZywgS2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLCBLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbywgS2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5Ebyxcblx0S2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvLCBLZXl3b3Jkcy5JZiwgS2V5d29yZHMuTWV0aG9kLCBLZXl3b3Jkcy5OZXcsXG5cdEtleXdvcmRzLk5vdCwgS2V5d29yZHMuT3IsIEtleXdvcmRzLlBpcGUsIEtleXdvcmRzLlN1cGVyLCBLZXl3b3Jkcy5Td2l0Y2gsIEtleXdvcmRzLlRyYWl0LFxuXHRLZXl3b3Jkcy5Vbmxlc3MsIEtleXdvcmRzLldpdGgsIEtleXdvcmRzLllpZWxkLCBLZXl3b3Jkcy5ZaWVsZFRvXG5dKVxuXG5mdW5jdGlvbiBpc1NwbGl0S2V5d29yZChfKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQoZXhwclNwbGl0S2V5d29yZHMsIF8pXG59XG5cbmZ1bmN0aW9uIHBhcnNlRXhwclBsYWluKHRva2Vucykge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgJ2V4cGVjdGVkRXhwcmVzc2lvbicpXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG5cdFx0Lypcblx0XHRXYXJuIGlmIGFuIGV4cHJlc3Npb24gY29uc2lzdHMgb25seSBvZiBhIEdyb3Vwcy5QYXJlbnRoZXNpcy5cblx0XHRlLmcuOiBgKG5vdCB0cnVlKWAgb24gYSBsaW5lIGJ5IGl0c2VsZlxuXHRcdGUuZy46IGBub3QgKG5vdCB0cnVlKWAgYmVjYXVzZSB0aGUgZmlyc3QgYG5vdGAgdGFrZXMgYW4gZXhwcmVzc2lvbiBhZnRlciBpdC5cblx0XHQqL1xuXHRcdC8vIHRvZG86IHRoaXMgaXMgYSBnb29kIHJlYXNvbiB0byBjaGFuZ2UgdGhlIE9ialNpbXBsZSBzeW50YXguXG5cdFx0Ly8gYGEuIDEgYi4gMmAgaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIE9iakVudHJ5IGBhLiAxIChiLiAyKWAsIHNvIGl0IG5lZWRzIHBhcmVudGhlc2VzLlxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgdG9rZW5zLmhlYWQoKSkgJiYgIWhlYWQocGFydHMpIGluc3RhbmNlb2YgT2JqU2ltcGxlKVxuXHRcdFx0d2Fybih0b2tlbnMubG9jLCAnZXh0cmFQYXJlbnMnKVxuXHRcdHJldHVybiBoZWFkKHBhcnRzKVxuXHR9IGVsc2Vcblx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmQodG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRjaGVjayhwYXJ0cy5sZW5ndGggPT09IDMsIHRva2Vucy5sb2MsICgpID0+ICdjb25kQXJndW1lbnRzJylcblx0cmV0dXJuIG5ldyBDb25kKHRva2Vucy5sb2MsIC4uLnBhcnRzKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmRpdGlvbmFsKGtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCBbY29uZGl0aW9uLCByZXN1bHRdID0gaWZFbHNlKG9wQmxvY2ssXG5cdFx0XyA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VCbG9jayhfKV0sXG5cdFx0KCkgPT4ge1xuXHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhiZWZvcmUpXG5cdFx0XHRjaGVjayhwYXJ0cy5sZW5ndGggPT09IDIsIHRva2Vucy5sb2MsICdjb25kaXRpb25hbEFyZ3VtZW50cycpXG5cdFx0XHRyZXR1cm4gcGFydHNcblx0XHR9KVxuXHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsKHRva2Vucy5sb2MsIGNvbmRpdGlvbiwgcmVzdWx0LCBraW5kID09PSBLZXl3b3Jkcy5Vbmxlc3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlUGlwZSh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCB2YWwgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRjb25zdCBwaXBlcyA9IGJsb2NrLm1hcFNsaWNlcyhwYXJzZUV4cHIpXG5cdHJldHVybiBuZXcgUGlwZSh0b2tlbnMubG9jLCB2YWwsIHBpcGVzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVdpdGgodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbdmFsLCBkZWNsYXJlXSA9IGlmRWxzZShiZWZvcmUub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjaGVjayhhZnRlci5zaXplKCkgPT09IDEsICdhc1Rva2VuJylcblx0XHRcdHJldHVybiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKV1cblx0XHR9LFxuXHRcdCgpID0+IFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyldKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2soYmxvY2spKVxufVxuIl19