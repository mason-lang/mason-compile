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
	exports.parseNExprParts = parseNExprParts;

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

	function parseNExprParts(tokens, n, errorCode) {
		const parts = parseExprParts(tokens);
		(0, _context.check)(parts.length === n, tokens.loc, errorCode);
		return parts;
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
		return new _MsAst.Cond(tokens.loc, ...parseNExprParts(tokens, 3, 'argsCond'));
	}

	function parseConditional(kind, tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _ifElse = (0, _util.ifElse)(opBlock, _ => [parseExprPlain(before), (0, _parseBlock2.default)(_)], () => parseNExprParts(before, 2, 'argsConditional'));

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
		return new _MsAst.Pipe(tokens.loc, parseExpr(before), block.mapSlices(parseExpr));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBbUJ3QixTQUFTO1NBOEJqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjO1NBa0JkLGVBQWUsR0FBZixlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBM0RQLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQThCakIsV0FBVzs7OztVQVdYLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFrQmQsZUFBZSIsImZpbGUiOiJwYXJzZUV4cHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXdhaXQsIENhbGwsIENvbmQsIENvbmRpdGlvbmFsLCBMb2NhbERlY2xhcmUsIExvZ2ljLCBMb2dpY3MsIE5ldywgTm90LCBPYmpQYWlyLCBPYmpTaW1wbGUsXG5cdFBpcGUsIFN1cGVyQ2FsbCwgV2l0aCwgWWllbGQsIFlpZWxkVG99IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzQW55S2V5d29yZCwgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaGVhZCwgaWZFbHNlLCBvcElmLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VDbGFzcywgcGFyc2VFeGNlcHQsIHBhcnNlU2luZ2xlLCBwYXJzZVN3aXRjaH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrLCBiZWZvcmVBbmRPcEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlRGVsIGZyb20gJy4vcGFyc2VEZWwnXG5pbXBvcnQgcGFyc2VGb3IgZnJvbSAnLi9wYXJzZUZvcidcbmltcG9ydCBwYXJzZUZ1biBmcm9tICcuL3BhcnNlRnVuJ1xuaW1wb3J0IHBhcnNlTWV0aG9kIGZyb20gJy4vcGFyc2VNZXRob2QnXG5pbXBvcnQgcGFyc2VUcmFpdCBmcm9tICcuL3BhcnNlVHJhaXQnXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgVmFsfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRXhwcih0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnkoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuT2JqRW50cnksIF8pKSxcblx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICd1bmV4cGVjdGVkJywgc3BsaXRzWzBdLmF0KVxuXHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRjb25zdCBwYWlycyA9IFtdXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGggLSAxOyBpID0gaSArIDEpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdGNoZWNrKG5hbWUgaW5zdGFuY2VvZiBOYW1lLCBuYW1lLmxvYywgJ2V4cGVjdGVkTmFtZScsIG5hbWUpXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlIDpcblx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdGNvbnN0IGxvYyA9IG5ldyBMb2MobmFtZS5sb2Muc3RhcnQsIHRva2Vuc1ZhbHVlLmxvYy5lbmQpXG5cdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdH1cblx0XHRcdGNvbnN0IHZhbCA9IG5ldyBPYmpTaW1wbGUodG9rZW5zLmxvYywgcGFpcnMpXG5cdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIGNhdCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdH1cblx0XHR9LFxuXHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2VucykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcFBhcnNlRXhwcih0b2tlbnMpIHtcblx0cmV0dXJuIG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuXG4vKipcblRyZWF0aW5nIHRva2VucyBzZXBhcmF0ZWx5LCBwYXJzZSB7QGxpbmsgVmFsfXMuXG5UaGlzIGlzIGNhbGxlZCBmb3IgZS5nLiB0aGUgY29udGVudHMgb2YgYW4gYXJyYXkgKGBbYSBiIGNdYCkuXG5UaGlzIGlzIGRpZmZlcmVudCBmcm9tIHtAbGluayBwYXJzZUV4cHJ9IGJlY2F1c2UgYGEgYmAgd2lsbCBwYXJzZSBhcyAyIGRpZmZlcmVudCB0aGluZ3MsIG5vdCBhIGNhbGwuXG5Ib3dldmVyLCBgY29uZCBhIGIgY2Agd2lsbCBzdGlsbCBwYXJzZSBhcyBhIHNpbmdsZSBleHByZXNzaW9uLlxuQHJldHVybiB7QXJyYXk8VmFsPn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeHByUGFydHModG9rZW5zKSB7XG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKGlzU3BsaXRLZXl3b3JkKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gY2F0KGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBrZXl3b3JkRXhwcihhdCwgYWZ0ZXIpKSxcblx0XHQoKSA9PiB7XG5cdFx0XHQvLyBJZiB0aGUgbGFzdCBwYXJ0IHN0YXJ0cyB3aXRoIGEga2V5d29yZCwgcGFyZW5zIGFyZSB1bm5lY2Vzc2FyeS5cblx0XHRcdC8vIGUuZy46IGBmb28gKG5vdCB0cnVlKWAgY2FuIGp1c3QgYmUgYGZvbyBub3QgdHJ1ZWAuXG5cdFx0XHQvLyBOb3RlIHRoYXQgYGZvbyAobm90IHRydWUpIGZhbHNlYCBkb2VzIG5lZWQgdGhlIHBhcmVucy5cblx0XHRcdGNvbnN0IGxhc3QgPSB0b2tlbnMubGFzdCgpXG5cdFx0XHRpZiAoaXNHcm91cChHcm91cHMuUGFyZW50aGVzaXMsIGxhc3QpKSB7XG5cdFx0XHRcdGNvbnN0IGggPSBTbGljZS5ncm91cChsYXN0KS5oZWFkKClcblx0XHRcdFx0aWYgKGlzU3BsaXRLZXl3b3JkKGgpKVxuXHRcdFx0XHRcdHdhcm4oaC5sb2MsICdleHRyYVBhcmVucycpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdG9rZW5zLm1hcChwYXJzZVNpbmdsZSlcblx0XHR9KVxufVxuXG4vKiogUGFyc2UgZXhhY3RseSBgbmAgVmFscywgb3IgZmFpbCB3aXRoIGBlcnJvckNvZGVgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTkV4cHJQYXJ0cyh0b2tlbnMsIG4sIGVycm9yQ29kZSkge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0Y2hlY2socGFydHMubGVuZ3RoID09PSBuLCB0b2tlbnMubG9jLCBlcnJvckNvZGUpXG5cdHJldHVybiBwYXJ0c1xufVxuXG4vKiogVGhlIGtleXdvcmQgYGF0YCBncm91cHMgd2l0aCBldmVyeXRoaW5nIGFmdGVyIGl0LiAqL1xuZnVuY3Rpb24ga2V5d29yZEV4cHIoYXQsIGFmdGVyKSB7XG5cdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuQW5kOiBjYXNlIEtleXdvcmRzLk9yOiB7XG5cdFx0XHRjb25zdCBraW5kID0gYXQua2luZCA9PT0gS2V5d29yZHMuQW5kID8gTG9naWNzLkFuZCA6IExvZ2ljcy5PclxuXHRcdFx0cmV0dXJuIG5ldyBMb2dpYyhhdC5sb2MsIGtpbmQsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHR9XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bd2FpdDpcblx0XHRcdHJldHVybiBuZXcgQXdhaXQoYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5DYXNlOlxuXHRcdFx0cmV0dXJuIHBhcnNlQ2FzZShmYWxzZSwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5DbGFzczpcblx0XHRcdHJldHVybiBwYXJzZUNsYXNzKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuQ29uZDpcblx0XHRcdHJldHVybiBwYXJzZUNvbmQoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5EZWw6XG5cdFx0XHRyZXR1cm4gcGFyc2VEZWwoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5FeGNlcHQ6XG5cdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Gb3I6IGNhc2UgS2V5d29yZHMuRm9yQXN5bmM6IGNhc2UgS2V5d29yZHMuRm9yQmFnOlxuXHRcdFx0cmV0dXJuIHBhcnNlRm9yKGF0LmtpbmQsIGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuRnVuOiBjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5Bc3luY0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOiBjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRyZXR1cm4gcGFyc2VGdW4oYXQua2luZCwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5JZjogY2FzZSBLZXl3b3Jkcy5Vbmxlc3M6XG5cdFx0XHRyZXR1cm4gcGFyc2VDb25kaXRpb25hbChhdC5raW5kLCBhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLlRyYWl0OlxuXHRcdFx0cmV0dXJuIHBhcnNlVHJhaXQoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5NZXRob2Q6XG5cdFx0XHRyZXR1cm4gcGFyc2VNZXRob2QoYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5OZXc6IHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0XHR9XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Ob3Q6XG5cdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRjYXNlIEtleXdvcmRzLlBpcGU6XG5cdFx0XHRyZXR1cm4gcGFyc2VQaXBlKGFmdGVyKVxuXHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgYWZ0ZXIpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsIG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHR9XG59XG5cbmNvbnN0IGV4cHJTcGxpdEtleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkFuZCwgS2V5d29yZHMuQXdhaXQsIEtleXdvcmRzLkNhc2UsIEtleXdvcmRzLkNsYXNzLCBLZXl3b3Jkcy5Db25kLCBLZXl3b3Jkcy5EZWwsXG5cdEtleXdvcmRzLkV4Y2VwdCwgS2V5d29yZHMuRm9yLCBLZXl3b3Jkcy5Gb3JBc3luYywgS2V5d29yZHMuRm9yQmFnLCBLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzLCBLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG8sIEtleXdvcmRzLklmLCBLZXl3b3Jkcy5NZXRob2QsIEtleXdvcmRzLk5ldyxcblx0S2V5d29yZHMuTm90LCBLZXl3b3Jkcy5PciwgS2V5d29yZHMuUGlwZSwgS2V5d29yZHMuU3VwZXIsIEtleXdvcmRzLlN3aXRjaCwgS2V5d29yZHMuVHJhaXQsXG5cdEtleXdvcmRzLlVubGVzcywgS2V5d29yZHMuV2l0aCwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmZ1bmN0aW9uIGlzU3BsaXRLZXl3b3JkKF8pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChleHByU3BsaXRLZXl3b3JkcywgXylcbn1cblxuZnVuY3Rpb24gcGFyc2VFeHByUGxhaW4odG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnZXhwZWN0ZWRFeHByZXNzaW9uJylcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcblx0XHQvKlxuXHRcdFdhcm4gaWYgYW4gZXhwcmVzc2lvbiBjb25zaXN0cyBvbmx5IG9mIGEgR3JvdXBzLlBhcmVudGhlc2lzLlxuXHRcdGUuZy46IGAobm90IHRydWUpYCBvbiBhIGxpbmUgYnkgaXRzZWxmXG5cdFx0ZS5nLjogYG5vdCAobm90IHRydWUpYCBiZWNhdXNlIHRoZSBmaXJzdCBgbm90YCB0YWtlcyBhbiBleHByZXNzaW9uIGFmdGVyIGl0LlxuXHRcdCovXG5cdFx0Ly8gdG9kbzogdGhpcyBpcyBhIGdvb2QgcmVhc29uIHRvIGNoYW5nZSB0aGUgT2JqU2ltcGxlIHN5bnRheC5cblx0XHQvLyBgYS4gMSBiLiAyYCBpcyBpbnRlcnByZXRlZCBhcyB0aGUgT2JqRW50cnkgYGEuIDEgKGIuIDIpYCwgc28gaXQgbmVlZHMgcGFyZW50aGVzZXMuXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlBhcmVudGhlc2lzLCB0b2tlbnMuaGVhZCgpKSAmJiAhaGVhZChwYXJ0cykgaW5zdGFuY2VvZiBPYmpTaW1wbGUpXG5cdFx0XHR3YXJuKHRva2Vucy5sb2MsICdleHRyYVBhcmVucycpXG5cdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdH0gZWxzZVxuXHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uZCh0b2tlbnMpIHtcblx0cmV0dXJuIG5ldyBDb25kKHRva2Vucy5sb2MsIC4uLnBhcnNlTkV4cHJQYXJ0cyh0b2tlbnMsIDMsICdhcmdzQ29uZCcpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmRpdGlvbmFsKGtpbmQsIHRva2Vucykge1xuXHRjb25zdCBbYmVmb3JlLCBvcEJsb2NrXSA9IGJlZm9yZUFuZE9wQmxvY2sodG9rZW5zKVxuXHRjb25zdCBbY29uZGl0aW9uLCByZXN1bHRdID0gaWZFbHNlKG9wQmxvY2ssXG5cdFx0XyA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VCbG9jayhfKV0sXG5cdFx0KCkgPT4gcGFyc2VORXhwclBhcnRzKGJlZm9yZSwgMiwgJ2FyZ3NDb25kaXRpb25hbCcpKVxuXHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsKHRva2Vucy5sb2MsIGNvbmRpdGlvbiwgcmVzdWx0LCBraW5kID09PSBLZXl3b3Jkcy5Vbmxlc3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlUGlwZSh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRyZXR1cm4gbmV3IFBpcGUodG9rZW5zLmxvYywgcGFyc2VFeHByKGJlZm9yZSksIGJsb2NrLm1hcFNsaWNlcyhwYXJzZUV4cHIpKVxufVxuXG5mdW5jdGlvbiBwYXJzZVdpdGgodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbdmFsLCBkZWNsYXJlXSA9IGlmRWxzZShiZWZvcmUub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjaGVjayhhZnRlci5zaXplKCkgPT09IDEsICdhc1Rva2VuJylcblx0XHRcdHJldHVybiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKV1cblx0XHR9LFxuXHRcdCgpID0+IFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyldKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2soYmxvY2spKVxufVxuIl19