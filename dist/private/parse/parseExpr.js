'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseCase', './parseDel', './parseFor', './parseFun', './parseMethod', './parseKind', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseFor'), require('./parseFun'), require('./parseMethod'), require('./parseKind'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseCase, global.parseDel, global.parseFor, global.parseFun, global.parseMethod, global.parseKind, global.parseLocalDeclares);
		global.parseExpr = mod.exports;
	}
})(this, function (exports, _Loc, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseCase, _parseDel, _parseFor, _parseFun, _parseMethod, _parseKind, _parseLocalDeclares) {
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

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _parseMethod2 = _interopRequireDefault(_parseMethod);

	var _parseKind2 = _interopRequireDefault(_parseKind);

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
		return (0, _util.ifElse)(tokens.opSplitMany(_ => (0, _Token.isKeyword)(_Token.Keywords.ObjAssign, _)), splits => {
			const first = splits[0].before;
			(0, _checks.checkNonEmpty)(first, () => `Unexpected ${ splits[0].at }`);
			const tokensCaller = first.rtail();
			const pairs = [];

			for (let i = 0; i < splits.length - 1; i = i + 1) {
				const name = splits[i].before.last();
				(0, _context.check)(name instanceof _Token.Name, name.loc, () => `Expected a name, not ${ name }`);
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
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(exprSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;

			const getLast = () => {
				switch (at.kind) {
					case _Token.Keywords.And:
					case _Token.Keywords.Or:
						{
							const kind = at.kind === _Token.Keywords.And ? _MsAst.Logics.And : _MsAst.Logics.Or;
							return new _MsAst.Logic(at.loc, kind, parseExprParts(after));
						}

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

					case _Token.Keywords.ForBag:
						return (0, _parseFor.parseForBag)(after);

					case _Token.Keywords.For:
						return (0, _parseFor.parseFor)(after);

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
			};

			return (0, _util.cat)(before.map(_parse.parseSingle), getLast());
		}, () => tokens.map(_parse.parseSingle));
	}

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.Case, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.Del, _Token.Keywords.Except, _Token.Keywords.ForBag, _Token.Keywords.For, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.If, _Token.Keywords.Kind, _Token.Keywords.Method, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.Pipe, _Token.Keywords.Super, _Token.Keywords.Switch, _Token.Keywords.Unless, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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
		(0, _context.check)(parts.length === 3, tokens.loc, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Cond) } takes exactly 3 arguments.`);
		return new _MsAst.Cond(tokens.loc, ...parts);
	}

	function parseConditional(kind, tokens) {
		var _beforeAndOpBlock = (0, _parseBlock.beforeAndOpBlock)(tokens);

		var _beforeAndOpBlock2 = _slicedToArray(_beforeAndOpBlock, 2);

		const before = _beforeAndOpBlock2[0];
		const opBlock = _beforeAndOpBlock2[1];

		var _ifElse = (0, _util.ifElse)(opBlock, _ => [parseExprPlain(before), (0, _parseBlock2.default)(_)], () => {
			const parts = parseExprParts(before);
			(0, _context.check)(parts.length === 2, tokens.loc, () => `${ (0, _Token.showKeyword)(kind) } with no block takes exactly 2 arguments.`);
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
			(0, _context.check)(after.size() === 1, () => `Expected only 1 token after ${ (0, _Token.showKeyword)(_Token.Keywords.As) }.`);
			return [parseExprPlain(before), (0, _parseLocalDeclares.parseLocalDeclare)(after.head())];
		}, () => [parseExprPlain(before), _MsAst.LocalDeclare.focus(tokens.loc)]);

		var _ifElse4 = _slicedToArray(_ifElse3, 2);

		const val = _ifElse4[0];
		const declare = _ifElse4[1];
		return new _MsAst.With(tokens.loc, declare, val, (0, _parseBlock2.default)(block));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBK0JqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUExQ04sU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBK0JqQixXQUFXOzs7O1VBV1gsY0FBYyIsImZpbGUiOiJwYXJzZUV4cHIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jIGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgQ29uZCwgQ29uZGl0aW9uYWwsIExvY2FsRGVjbGFyZSwgTG9naWMsIExvZ2ljcywgTmV3LCBOb3QsIE9ialBhaXIsIE9ialNpbXBsZSwgUGlwZSxcblx0U3VwZXJDYWxsLCBXaXRoLCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtjYXQsIGhlYWQsIGlmRWxzZSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tOb25FbXB0eX0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlQ2xhc3MsIHBhcnNlRXhjZXB0LCBwYXJzZVNpbmdsZSwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlQmxvY2ssIHtiZWZvcmVBbmRCbG9jaywgYmVmb3JlQW5kT3BCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZURlbCBmcm9tICcuL3BhcnNlRGVsJ1xuaW1wb3J0IHtwYXJzZUZvciwgcGFyc2VGb3JCYWd9IGZyb20gJy4vcGFyc2VGb3InXG5pbXBvcnQgcGFyc2VGdW4gZnJvbSAnLi9wYXJzZUZ1bidcbmltcG9ydCBwYXJzZU1ldGhvZCBmcm9tICcuL3BhcnNlTWV0aG9kJ1xuaW1wb3J0IHBhcnNlS2luZCBmcm9tICcuL3BhcnNlS2luZCdcbmltcG9ydCB7cGFyc2VMb2NhbERlY2xhcmV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuXG4vKiogUGFyc2UgYSB7QGxpbmsgVmFsfS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlRXhwcih0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE1hbnkoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduLCBfKSksXG5cdFx0c3BsaXRzID0+IHtcblx0XHRcdC8vIFNob3J0IG9iamVjdCBmb3JtLCBzdWNoIGFzIChhLiAxLCBiLiAyKVxuXHRcdFx0Y29uc3QgZmlyc3QgPSBzcGxpdHNbMF0uYmVmb3JlXG5cdFx0XHRjaGVja05vbkVtcHR5KGZpcnN0LCAoKSA9PiBgVW5leHBlY3RlZCAke3NwbGl0c1swXS5hdH1gKVxuXHRcdFx0Y29uc3QgdG9rZW5zQ2FsbGVyID0gZmlyc3QucnRhaWwoKVxuXG5cdFx0XHRjb25zdCBwYWlycyA9IFtdXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGggLSAxOyBpID0gaSArIDEpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHNwbGl0c1tpXS5iZWZvcmUubGFzdCgpXG5cdFx0XHRcdGNoZWNrKG5hbWUgaW5zdGFuY2VvZiBOYW1lLCBuYW1lLmxvYywgKCkgPT5cblx0XHRcdFx0XHRgRXhwZWN0ZWQgYSBuYW1lLCBub3QgJHtuYW1lfWApXG5cdFx0XHRcdGNvbnN0IHRva2Vuc1ZhbHVlID0gaSA9PT0gc3BsaXRzLmxlbmd0aCAtIDIgP1xuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlIDpcblx0XHRcdFx0XHRzcGxpdHNbaSArIDFdLmJlZm9yZS5ydGFpbCgpXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByUGxhaW4odG9rZW5zVmFsdWUpXG5cdFx0XHRcdGNvbnN0IGxvYyA9IG5ldyBMb2MobmFtZS5sb2Muc3RhcnQsIHRva2Vuc1ZhbHVlLmxvYy5lbmQpXG5cdFx0XHRcdHBhaXJzLnB1c2gobmV3IE9ialBhaXIobG9jLCBuYW1lLm5hbWUsIHZhbHVlKSlcblx0XHRcdH1cblx0XHRcdGNvbnN0IHZhbCA9IG5ldyBPYmpTaW1wbGUodG9rZW5zLmxvYywgcGFpcnMpXG5cdFx0XHRpZiAodG9rZW5zQ2FsbGVyLmlzRW1wdHkoKSlcblx0XHRcdFx0cmV0dXJuIHZhbFxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zQ2FsbGVyKVxuXHRcdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIGNhdCh0YWlsKHBhcnRzKSwgdmFsKSlcblx0XHRcdH1cblx0XHR9LFxuXHRcdCgpID0+IHBhcnNlRXhwclBsYWluKHRva2VucykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcFBhcnNlRXhwcih0b2tlbnMpIHtcblx0cmV0dXJuIG9wSWYoIXRva2Vucy5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuXG4vKipcblRyZWF0aW5nIHRva2VucyBzZXBhcmF0ZWx5LCBwYXJzZSB7QGxpbmsgVmFsfXMuXG5UaGlzIGlzIGNhbGxlZCBmb3IgZS5nLiB0aGUgY29udGVudHMgb2YgYW4gYXJyYXkgKGBbYSBiIGNdYCkuXG5UaGlzIGlzIGRpZmZlcmVudCBmcm9tIHtAbGluayBwYXJzZUV4cHJ9IGJlY2F1c2UgYGEgYmAgd2lsbCBwYXJzZSBhcyAyIGRpZmZlcmVudCB0aGluZ3MsIG5vdCBhIGNhbGwuXG5Ib3dldmVyLCBgY29uZCBhIGIgY2Agd2lsbCBzdGlsbCBwYXJzZSBhcyBhIHNpbmdsZSBleHByZXNzaW9uLlxuQHJldHVybiB7QXJyYXk8VmFsPn1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFeHByUGFydHModG9rZW5zKSB7XG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGV4cHJTcGxpdEtleXdvcmRzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IHtcblx0XHRcdGNvbnN0IGdldExhc3QgPSAoKSA9PiB7XG5cdFx0XHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQW5kOiBjYXNlIEtleXdvcmRzLk9yOiB7XG5cdFx0XHRcdFx0XHRjb25zdCBraW5kID0gYXQua2luZCA9PT0gS2V5d29yZHMuQW5kID8gTG9naWNzLkFuZCA6IExvZ2ljcy5PclxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBMb2dpYyhhdC5sb2MsIGtpbmQsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5DYXNlOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZShmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5DbGFzczpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNsYXNzKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQ29uZDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNvbmQoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VEZWwoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5FeGNlcHQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JCYWc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3I6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3IoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW46IGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOiBjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46IGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLklmOiBjYXNlIEtleXdvcmRzLlVubGVzczpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNvbmRpdGlvbmFsKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuS2luZDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUtpbmQoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5NZXRob2Q6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VNZXRob2QoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5OZXc6IHtcblx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIGhlYWQocGFydHMpLCB0YWlsKHBhcnRzKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Ob3Q6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlBpcGU6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VQaXBlKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsXG5cdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2F0KGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBnZXRMYXN0KCkpXG5cdFx0fSxcblx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcbn1cblxuY29uc3QgZXhwclNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQW5kLCBLZXl3b3Jkcy5DYXNlLCBLZXl3b3Jkcy5DbGFzcywgS2V5d29yZHMuQ29uZCwgS2V5d29yZHMuRGVsLCBLZXl3b3Jkcy5FeGNlcHQsXG5cdEtleXdvcmRzLkZvckJhZywgS2V5d29yZHMuRm9yLCBLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLCBLZXl3b3Jkcy5GdW5UaGlzLFxuXHRLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsXG5cdEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLCBLZXl3b3Jkcy5GdW5UaGlzR2VuLFxuXHRLZXl3b3Jkcy5GdW5UaGlzR2VuRG8sIEtleXdvcmRzLklmLCBLZXl3b3Jkcy5LaW5kLCBLZXl3b3Jkcy5NZXRob2QsIEtleXdvcmRzLk5ldywgS2V5d29yZHMuTm90LFxuXHRLZXl3b3Jkcy5PciwgS2V5d29yZHMuUGlwZSwgS2V5d29yZHMuU3VwZXIsIEtleXdvcmRzLlN3aXRjaCwgS2V5d29yZHMuVW5sZXNzLCBLZXl3b3Jkcy5XaXRoLFxuXHRLZXl3b3Jkcy5ZaWVsZCwgS2V5d29yZHMuWWllbGRUb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VFeHByUGxhaW4odG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGZhaWwodG9rZW5zLmxvYywgJ0V4cGVjdGVkIGFuIGV4cHJlc3Npb24sIGdvdCBub3RoaW5nLicpXG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kKHRva2Vucykge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0Y2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkNvbmQpfSB0YWtlcyBleGFjdGx5IDMgYXJndW1lbnRzLmApXG5cdHJldHVybiBuZXcgQ29uZCh0b2tlbnMubG9jLCAuLi5wYXJ0cylcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25hbChraW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3QgW2NvbmRpdGlvbiwgcmVzdWx0XSA9IGlmRWxzZShvcEJsb2NrLFxuXHRcdF8gPT4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlQmxvY2soXyldLFxuXHRcdCgpID0+IHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYmVmb3JlKVxuXHRcdFx0Y2hlY2socGFydHMubGVuZ3RoID09PSAyLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChraW5kKX0gd2l0aCBubyBibG9jayB0YWtlcyBleGFjdGx5IDIgYXJndW1lbnRzLmApXG5cdFx0XHRyZXR1cm4gcGFydHNcblx0XHR9KVxuXHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsKHRva2Vucy5sb2MsIGNvbmRpdGlvbiwgcmVzdWx0LCBraW5kID09PSBLZXl3b3Jkcy5Vbmxlc3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlUGlwZSh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXHRjb25zdCB2YWwgPSBwYXJzZUV4cHIoYmVmb3JlKVxuXHRjb25zdCBwaXBlcyA9IGJsb2NrLm1hcFNsaWNlcyhwYXJzZUV4cHIpXG5cdHJldHVybiBuZXcgUGlwZSh0b2tlbnMubG9jLCB2YWwsIHBpcGVzKVxufVxuXG5mdW5jdGlvbiBwYXJzZVdpdGgodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbdmFsLCBkZWNsYXJlXSA9IGlmRWxzZShiZWZvcmUub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjaGVjayhhZnRlci5zaXplKCkgPT09IDEsICgpID0+XG5cdFx0XHRcdGBFeHBlY3RlZCBvbmx5IDEgdG9rZW4gYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Bcyl9LmApXG5cdFx0XHRyZXR1cm4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSldXG5cdFx0fSxcblx0XHQoKSA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgTG9jYWxEZWNsYXJlLmZvY3VzKHRva2Vucy5sb2MpXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrKGJsb2NrKSlcbn1cbiJdfQ==