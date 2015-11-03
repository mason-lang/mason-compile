'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseBlock', './parseCase', './parseDel', './parseFor', './parseFun', './parseKind', './parseLocalDeclares'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseFor'), require('./parseFun'), require('./parseKind'), require('./parseLocalDeclares'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseBlock, global.parseCase, global.parseDel, global.parseFor, global.parseFun, global.parseKind, global.parseLocalDeclares);
		global.parseExpr = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseBlock, _parseCase, _parseDel, _parseFor, _parseFun, _parseKind, _parseLocalDeclares) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseExpr;
	exports.opParseExpr = opParseExpr;
	exports.parseExprParts = parseExprParts;

	var _Loc2 = _interopRequireDefault(_Loc);

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseFun2 = _interopRequireDefault(_parseFun);

	var _parseKind2 = _interopRequireDefault(_parseKind);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
						return (0, _parseCase2.default)(true, false, after);

					case _Token.Keywords.Class:
						return (0, _parse.parseClass)(after);

					case _Token.Keywords.Cond:
						return parseCond(after);

					case _Token.Keywords.Del:
						return (0, _parseDel2.default)(after);

					case _Token.Keywords.Except:
						return (0, _parse.parseExcept)(true, after);

					case _Token.Keywords.ForBag:
						return (0, _parseFor.parseForBag)(after);

					case _Token.Keywords.For:
						return (0, _parseFor.parseFor)(true, after);

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
						{
							var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(after);

							var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

							const before = _beforeAndBlock2[0];
							const block = _beforeAndBlock2[1];
							return new _MsAst.Conditional(tokens.loc, parseExprPlain(before), (0, _parseBlock.parseBlockVal)(block), at.kind === _Token.Keywords.Unless);
						}

					case _Token.Keywords.Kind:
						return (0, _parseKind2.default)(after);

					case _Token.Keywords.New:
						{
							const parts = parseExprParts(after);
							return new _MsAst.New(at.loc, (0, _util.head)(parts), (0, _util.tail)(parts));
						}

					case _Token.Keywords.Not:
						return new _MsAst.Not(at.loc, parseExprPlain(after));

					case _Token.Keywords.Super:
						return new _MsAst.SuperCall(at.loc, parseExprParts(after), true);

					case _Token.Keywords.Switch:
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

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.Case, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.Del, _Token.Keywords.Except, _Token.Keywords.ForBag, _Token.Keywords.For, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.If, _Token.Keywords.Kind, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.Super, _Token.Keywords.Switch, _Token.Keywords.Unless, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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

		var _beforeAndBlock4 = _slicedToArray(_beforeAndBlock3, 2);

		const before = _beforeAndBlock4[0];
		const block = _beforeAndBlock4[1];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBK0JqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7O1VBMUNOLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQStCakIsV0FBVzs7OztVQVdYLGNBQWMiLCJmaWxlIjoicGFyc2VFeHByLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgQ29uZCwgQ29uZGl0aW9uYWwsIExvY2FsRGVjbGFyZSwgTG9naWMsIExvZ2ljcywgTmV3LCBOb3QsIE9ialBhaXIsIE9ialNpbXBsZSxcblx0U3VwZXJDYWxsLCBXaXRoLCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaGVhZCwgaWZFbHNlLCBvcElmLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VDbGFzcywgcGFyc2VFeGNlcHQsIHBhcnNlU2luZ2xlLCBwYXJzZVN3aXRjaH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCB7cGFyc2VGb3IsIHBhcnNlRm9yQmFnfSBmcm9tICcuL3BhcnNlRm9yJ1xuaW1wb3J0IHBhcnNlRnVuIGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VLaW5kIGZyb20gJy4vcGFyc2VLaW5kJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24sIF8pKSxcblx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0Y2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke25hbWV9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wUGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gb3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5cbi8qKlxuVHJlYXRpbmcgdG9rZW5zIHNlcGFyYXRlbHksIHBhcnNlIHtAbGluayBWYWx9cy5cblRoaXMgaXMgY2FsbGVkIGZvciBlLmcuIHRoZSBjb250ZW50cyBvZiBhbiBhcnJheSAoYFthIGIgY11gKS5cblRoaXMgaXMgZGlmZmVyZW50IGZyb20ge0BsaW5rIHBhcnNlRXhwcn0gYmVjYXVzZSBgYSBiYCB3aWxsIHBhcnNlIGFzIDIgZGlmZmVyZW50IHRoaW5ncywgbm90IGEgY2FsbC5cbkhvd2V2ZXIsIGBjb25kIGEgYiBjYCB3aWxsIHN0aWxsIHBhcnNlIGFzIGEgc2luZ2xlIGV4cHJlc3Npb24uXG5AcmV0dXJuIHtBcnJheTxWYWw+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZXhwclNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y29uc3QgZ2V0TGFzdCA9ICgpID0+IHtcblx0XHRcdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5BbmQ6IGNhc2UgS2V5d29yZHMuT3I6IHtcblx0XHRcdFx0XHRcdGNvbnN0IGtpbmQgPSBhdC5raW5kID09PSBLZXl3b3Jkcy5BbmQgPyBMb2dpY3MuQW5kIDogTG9naWNzLk9yXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywga2luZCwgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNhc2U6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKHRydWUsIGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNsYXNzOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Db25kOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ29uZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkRlbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZURlbChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdCh0cnVlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZvckJhZzpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckJhZyhhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZvcjpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvcih0cnVlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bjogY2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjogY2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuSWY6IGNhc2UgS2V5d29yZHMuVW5sZXNzOiB7XG5cdFx0XHRcdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhhZnRlcilcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWwodG9rZW5zLmxvYyxcblx0XHRcdFx0XHRcdFx0cGFyc2VFeHByUGxhaW4oYmVmb3JlKSxcblx0XHRcdFx0XHRcdFx0cGFyc2VCbG9ja1ZhbChibG9jayksXG5cdFx0XHRcdFx0XHRcdGF0LmtpbmQgPT09IEtleXdvcmRzLlVubGVzcylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5LaW5kOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlS2luZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5ldzoge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhhZnRlcilcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5vdDpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSwgdHJ1ZSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaCh0cnVlLCBmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsXG5cdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGF0LmtpbmQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjYXQoYmVmb3JlLm1hcChwYXJzZVNpbmdsZSksIGdldExhc3QoKSlcblx0XHR9LFxuXHRcdCgpID0+IHRva2Vucy5tYXAocGFyc2VTaW5nbGUpKVxufVxuXG5jb25zdCBleHByU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5BbmQsIEtleXdvcmRzLkNhc2UsIEtleXdvcmRzLkNsYXNzLCBLZXl3b3Jkcy5Db25kLCBLZXl3b3Jkcy5EZWwsIEtleXdvcmRzLkV4Y2VwdCxcblx0S2V5d29yZHMuRm9yQmFnLCBLZXl3b3Jkcy5Gb3IsIEtleXdvcmRzLkZ1biwgS2V5d29yZHMuRnVuRG8sIEtleXdvcmRzLkZ1blRoaXMsXG5cdEtleXdvcmRzLkZ1blRoaXNEbywgS2V5d29yZHMuRnVuQXN5bmMsIEtleXdvcmRzLkZ1bkFzeW5jRG8sIEtleXdvcmRzLkZ1blRoaXNBc3luYyxcblx0S2V5d29yZHMuRnVuVGhpc0FzeW5jRG8sIEtleXdvcmRzLkZ1bkdlbiwgS2V5d29yZHMuRnVuR2VuRG8sIEtleXdvcmRzLkZ1blRoaXNHZW4sXG5cdEtleXdvcmRzLkZ1blRoaXNHZW5EbywgS2V5d29yZHMuSWYsIEtleXdvcmRzLktpbmQsIEtleXdvcmRzLk5ldywgS2V5d29yZHMuTm90LCBLZXl3b3Jkcy5Pcixcblx0S2V5d29yZHMuU3VwZXIsIEtleXdvcmRzLlN3aXRjaCwgS2V5d29yZHMuVW5sZXNzLCBLZXl3b3Jkcy5XaXRoLCBLZXl3b3Jkcy5ZaWVsZCxcblx0S2V5d29yZHMuWWllbGRUb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VFeHByUGxhaW4odG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGZhaWwodG9rZW5zLmxvYywgJ0V4cGVjdGVkIGFuIGV4cHJlc3Npb24sIGdvdCBub3RoaW5nLicpXG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kKHRva2Vucykge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0Y2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PiBgJHtjb2RlKCdjb25kJyl9IHRha2VzIGV4YWN0bHkgMyBhcmd1bWVudHMuYClcblx0cmV0dXJuIG5ldyBDb25kKHRva2Vucy5sb2MsIHBhcnRzWzBdLCBwYXJ0c1sxXSwgcGFydHNbMl0pXG59XG5cbmZ1bmN0aW9uIHBhcnNlV2l0aCh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGNvbnN0IFt2YWwsIGRlY2xhcmVdID0gaWZFbHNlKGJlZm9yZS5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5BcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IHtcblx0XHRcdGNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke2NvZGUoJ2FzJyl9LmApXG5cdFx0XHRyZXR1cm4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlTG9jYWxEZWNsYXJlKGFmdGVyLmhlYWQoKSldXG5cdFx0fSxcblx0XHQoKSA9PiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgTG9jYWxEZWNsYXJlLmZvY3VzKHRva2Vucy5sb2MpXSlcblxuXHRyZXR1cm4gbmV3IFdpdGgodG9rZW5zLmxvYywgZGVjbGFyZSwgdmFsLCBwYXJzZUJsb2NrRG8oYmxvY2spKVxufVxuIl19