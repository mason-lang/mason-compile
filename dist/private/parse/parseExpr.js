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

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.Case, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.Del, _Token.Keywords.Except, _Token.Keywords.ForBag, _Token.Keywords.For, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.If, _Token.Keywords.Kind, _Token.Keywords.Method, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.Super, _Token.Keywords.Switch, _Token.Keywords.Unless, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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

	function parseWith(tokens) {
		var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(tokens);

		var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

		const before = _beforeAndBlock2[0];
		const block = _beforeAndBlock2[1];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBK0JqQixXQUFXLEdBQVgsV0FBVztTQVdYLGNBQWMsR0FBZCxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTFDTixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUErQmpCLFdBQVc7Ozs7VUFXWCxjQUFjIiwiZmlsZSI6InBhcnNlRXhwci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MgZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsLCBDb25kLCBDb25kaXRpb25hbCwgTG9jYWxEZWNsYXJlLCBMb2dpYywgTG9naWNzLCBOZXcsIE5vdCwgT2JqUGFpciwgT2JqU2ltcGxlLFxuXHRTdXBlckNhbGwsIFdpdGgsIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmRzLCBOYW1lLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaGVhZCwgaWZFbHNlLCBvcElmLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VDbGFzcywgcGFyc2VFeGNlcHQsIHBhcnNlU2luZ2xlLCBwYXJzZVN3aXRjaH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VCbG9jaywge2JlZm9yZUFuZEJsb2NrLCBiZWZvcmVBbmRPcEJsb2NrfSBmcm9tICcuL3BhcnNlQmxvY2snXG5pbXBvcnQgcGFyc2VDYXNlIGZyb20gJy4vcGFyc2VDYXNlJ1xuaW1wb3J0IHBhcnNlRGVsIGZyb20gJy4vcGFyc2VEZWwnXG5pbXBvcnQge3BhcnNlRm9yLCBwYXJzZUZvckJhZ30gZnJvbSAnLi9wYXJzZUZvcidcbmltcG9ydCBwYXJzZUZ1biBmcm9tICcuL3BhcnNlRnVuJ1xuaW1wb3J0IHBhcnNlTWV0aG9kIGZyb20gJy4vcGFyc2VNZXRob2QnXG5pbXBvcnQgcGFyc2VLaW5kIGZyb20gJy4vcGFyc2VLaW5kJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24sIF8pKSxcblx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0Y2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke25hbWV9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wUGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gb3BJZighdG9rZW5zLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5cbi8qKlxuVHJlYXRpbmcgdG9rZW5zIHNlcGFyYXRlbHksIHBhcnNlIHtAbGluayBWYWx9cy5cblRoaXMgaXMgY2FsbGVkIGZvciBlLmcuIHRoZSBjb250ZW50cyBvZiBhbiBhcnJheSAoYFthIGIgY11gKS5cblRoaXMgaXMgZGlmZmVyZW50IGZyb20ge0BsaW5rIHBhcnNlRXhwcn0gYmVjYXVzZSBgYSBiYCB3aWxsIHBhcnNlIGFzIDIgZGlmZmVyZW50IHRoaW5ncywgbm90IGEgY2FsbC5cbkhvd2V2ZXIsIGBjb25kIGEgYiBjYCB3aWxsIHN0aWxsIHBhcnNlIGFzIGEgc2luZ2xlIGV4cHJlc3Npb24uXG5AcmV0dXJuIHtBcnJheTxWYWw+fVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpIHtcblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZXhwclNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4ge1xuXHRcdFx0Y29uc3QgZ2V0TGFzdCA9ICgpID0+IHtcblx0XHRcdFx0c3dpdGNoIChhdC5raW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5BbmQ6IGNhc2UgS2V5d29yZHMuT3I6IHtcblx0XHRcdFx0XHRcdGNvbnN0IGtpbmQgPSBhdC5raW5kID09PSBLZXl3b3Jkcy5BbmQgPyBMb2dpY3MuQW5kIDogTG9naWNzLk9yXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IExvZ2ljKGF0LmxvYywga2luZCwgcGFyc2VFeHByUGFydHMoYWZ0ZXIpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNhc2U6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNsYXNzOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ2xhc3MoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Db25kOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ29uZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkRlbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZURlbChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZvckJhZzpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvckJhZyhhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZvcjpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZvcihhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bjogY2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjogY2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRnVuKGF0LmtpbmQsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuSWY6IGNhc2UgS2V5d29yZHMuVW5sZXNzOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlQ29uZGl0aW9uYWwoYXQua2luZCwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5LaW5kOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlS2luZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk1ldGhvZDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZU1ldGhvZChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5ldzoge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhhZnRlcilcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTmV3KGF0LmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLk5vdDpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTm90KGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChhdC5sb2MsIHBhcnNlRXhwclBhcnRzKGFmdGVyKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5XaXRoOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlV2l0aChhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZChhdC5sb2MsXG5cdFx0XHRcdFx0XHRcdG9wSWYoIWFmdGVyLmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8oYXQubG9jLCBwYXJzZUV4cHJQbGFpbihhZnRlcikpXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2F0KGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBnZXRMYXN0KCkpXG5cdFx0fSxcblx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcbn1cblxuY29uc3QgZXhwclNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQW5kLCBLZXl3b3Jkcy5DYXNlLCBLZXl3b3Jkcy5DbGFzcywgS2V5d29yZHMuQ29uZCwgS2V5d29yZHMuRGVsLCBLZXl3b3Jkcy5FeGNlcHQsXG5cdEtleXdvcmRzLkZvckJhZywgS2V5d29yZHMuRm9yLCBLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLCBLZXl3b3Jkcy5GdW5UaGlzLFxuXHRLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsXG5cdEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLCBLZXl3b3Jkcy5GdW5UaGlzR2VuLFxuXHRLZXl3b3Jkcy5GdW5UaGlzR2VuRG8sIEtleXdvcmRzLklmLCBLZXl3b3Jkcy5LaW5kLCBLZXl3b3Jkcy5NZXRob2QsIEtleXdvcmRzLk5ldywgS2V5d29yZHMuTm90LFxuXHRLZXl3b3Jkcy5PciwgS2V5d29yZHMuU3VwZXIsIEtleXdvcmRzLlN3aXRjaCwgS2V5d29yZHMuVW5sZXNzLCBLZXl3b3Jkcy5XaXRoLCBLZXl3b3Jkcy5ZaWVsZCxcblx0S2V5d29yZHMuWWllbGRUb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VFeHByUGxhaW4odG9rZW5zKSB7XG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHModG9rZW5zKVxuXHRzd2l0Y2ggKHBhcnRzLmxlbmd0aCkge1xuXHRcdGNhc2UgMDpcblx0XHRcdGZhaWwodG9rZW5zLmxvYywgJ0V4cGVjdGVkIGFuIGV4cHJlc3Npb24sIGdvdCBub3RoaW5nLicpXG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIGhlYWQocGFydHMpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgdGFpbChwYXJ0cykpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kKHRva2Vucykge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0Y2hlY2socGFydHMubGVuZ3RoID09PSAzLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkNvbmQpfSB0YWtlcyBleGFjdGx5IDMgYXJndW1lbnRzLmApXG5cdHJldHVybiBuZXcgQ29uZCh0b2tlbnMubG9jLCAuLi5wYXJ0cylcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25hbChraW5kLCB0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgb3BCbG9ja10gPSBiZWZvcmVBbmRPcEJsb2NrKHRva2Vucylcblx0Y29uc3QgW2NvbmRpdGlvbiwgcmVzdWx0XSA9IGlmRWxzZShvcEJsb2NrLFxuXHRcdF8gPT4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIHBhcnNlQmxvY2soXyldLFxuXHRcdCgpID0+IHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYmVmb3JlKVxuXHRcdFx0Y2hlY2socGFydHMubGVuZ3RoID09PSAyLCB0b2tlbnMubG9jLCAoKSA9PlxuXHRcdFx0XHRgJHtzaG93S2V5d29yZChraW5kKX0gd2l0aCBubyBibG9jayB0YWtlcyBleGFjdGx5IDIgYXJndW1lbnRzLmApXG5cdFx0XHRyZXR1cm4gcGFydHNcblx0XHR9KVxuXHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsKHRva2Vucy5sb2MsIGNvbmRpdGlvbiwgcmVzdWx0LCBraW5kID09PSBLZXl3b3Jkcy5Vbmxlc3MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlV2l0aCh0b2tlbnMpIHtcblx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2sodG9rZW5zKVxuXG5cdGNvbnN0IFt2YWwsIGRlY2xhcmVdID0gaWZFbHNlKGJlZm9yZS5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5BcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IHtcblx0XHRcdGNoZWNrKGFmdGVyLnNpemUoKSA9PT0gMSwgKCkgPT5cblx0XHRcdFx0YEV4cGVjdGVkIG9ubHkgMSB0b2tlbiBhZnRlciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkFzKX0uYClcblx0XHRcdHJldHVybiBbcGFyc2VFeHByUGxhaW4oYmVmb3JlKSwgcGFyc2VMb2NhbERlY2xhcmUoYWZ0ZXIuaGVhZCgpKV1cblx0XHR9LFxuXHRcdCgpID0+IFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBMb2NhbERlY2xhcmUuZm9jdXModG9rZW5zLmxvYyldKVxuXG5cdHJldHVybiBuZXcgV2l0aCh0b2tlbnMubG9jLCBkZWNsYXJlLCB2YWwsIHBhcnNlQmxvY2soYmxvY2spKVxufVxuIl19