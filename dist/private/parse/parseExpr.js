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

					case _Token.Keywords.IfVal:
					case _Token.Keywords.UnlessVal:
						{
							var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(after);

							var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

							const before = _beforeAndBlock2[0];
							const block = _beforeAndBlock2[1];
							return new _MsAst.ConditionalVal(tokens.loc, parseExprPlain(before), (0, _parseBlock.parseBlockVal)(block), at.kind === _Token.Keywords.UnlessVal);
						}

					case _Token.Keywords.Kind:
						return (0, _parseKind2.default)(after);

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

	const exprSplitKeywords = new Set([_Token.Keywords.And, _Token.Keywords.CaseVal, _Token.Keywords.Class, _Token.Keywords.Cond, _Token.Keywords.DelVal, _Token.Keywords.ExceptVal, _Token.Keywords.ForBag, _Token.Keywords.ForVal, _Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo, _Token.Keywords.IfVal, _Token.Keywords.Kind, _Token.Keywords.New, _Token.Keywords.Not, _Token.Keywords.Or, _Token.Keywords.SuperVal, _Token.Keywords.SwitchVal, _Token.Keywords.UnlessVal, _Token.Keywords.With, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlRXhwci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBc0NqQixjQUFjLEdBQWQsY0FBYzs7Ozs7Ozs7Ozs7Ozs7OztVQXRDTixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFzQ2pCLGNBQWMiLCJmaWxlIjoicGFyc2VFeHByLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYyBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgQ29uZCwgQ29uZGl0aW9uYWxWYWwsIExvY2FsRGVjbGFyZSwgTG9naWMsIExvZ2ljcywgTmV3LCBOb3QsIE9ialBhaXIsIE9ialNpbXBsZSxcblx0U3VwZXJDYWxsLCBXaXRoLCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2NhdCwgaGVhZCwgaWZFbHNlLCBvcElmLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja05vbkVtcHR5fSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7cGFyc2VDbGFzcywgcGFyc2VFeGNlcHQsIHBhcnNlU2luZ2xlLCBwYXJzZVN3aXRjaH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlQmxvY2tWYWx9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCB7cGFyc2VGb3JCYWcsIHBhcnNlRm9yVmFsfSBmcm9tICcuL3BhcnNlRm9yJ1xuaW1wb3J0IHBhcnNlRnVuIGZyb20gJy4vcGFyc2VGdW4nXG5pbXBvcnQgcGFyc2VLaW5kIGZyb20gJy4vcGFyc2VLaW5kJ1xuaW1wb3J0IHtwYXJzZUxvY2FsRGVjbGFyZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5cbi8qKiBQYXJzZSBhIHtAbGluayBWYWx9LiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VFeHByKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0TWFueShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24sIF8pKSxcblx0XHRzcGxpdHMgPT4ge1xuXHRcdFx0Ly8gU2hvcnQgb2JqZWN0IGZvcm0sIHN1Y2ggYXMgKGEuIDEsIGIuIDIpXG5cdFx0XHRjb25zdCBmaXJzdCA9IHNwbGl0c1swXS5iZWZvcmVcblx0XHRcdGNoZWNrTm9uRW1wdHkoZmlyc3QsICgpID0+IGBVbmV4cGVjdGVkICR7c3BsaXRzWzBdLmF0fWApXG5cdFx0XHRjb25zdCB0b2tlbnNDYWxsZXIgPSBmaXJzdC5ydGFpbCgpXG5cblx0XHRcdGNvbnN0IHBhaXJzID0gW11cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aCAtIDE7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gc3BsaXRzW2ldLmJlZm9yZS5sYXN0KClcblx0XHRcdFx0Y2hlY2sobmFtZSBpbnN0YW5jZW9mIE5hbWUsIG5hbWUubG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBFeHBlY3RlZCBhIG5hbWUsIG5vdCAke25hbWV9YClcblx0XHRcdFx0Y29uc3QgdG9rZW5zVmFsdWUgPSBpID09PSBzcGxpdHMubGVuZ3RoIC0gMiA/XG5cdFx0XHRcdFx0c3BsaXRzW2kgKyAxXS5iZWZvcmUgOlxuXHRcdFx0XHRcdHNwbGl0c1tpICsgMV0uYmVmb3JlLnJ0YWlsKClcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHJQbGFpbih0b2tlbnNWYWx1ZSlcblx0XHRcdFx0Y29uc3QgbG9jID0gbmV3IExvYyhuYW1lLmxvYy5zdGFydCwgdG9rZW5zVmFsdWUubG9jLmVuZClcblx0XHRcdFx0cGFpcnMucHVzaChuZXcgT2JqUGFpcihsb2MsIG5hbWUubmFtZSwgdmFsdWUpKVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdmFsID0gbmV3IE9ialNpbXBsZSh0b2tlbnMubG9jLCBwYWlycylcblx0XHRcdGlmICh0b2tlbnNDYWxsZXIuaXNFbXB0eSgpKVxuXHRcdFx0XHRyZXR1cm4gdmFsXG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnNDYWxsZXIpXG5cdFx0XHRcdHJldHVybiBuZXcgQ2FsbCh0b2tlbnMubG9jLCBoZWFkKHBhcnRzKSwgY2F0KHRhaWwocGFydHMpLCB2YWwpKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByUGxhaW4odG9rZW5zKSlcbn1cblxuLyoqXG5UcmVhdGluZyB0b2tlbnMgc2VwYXJhdGVseSwgcGFyc2Uge0BsaW5rIFZhbH1zLlxuVGhpcyBpcyBjYWxsZWQgZm9yIGUuZy4gdGhlIGNvbnRlbnRzIG9mIGFuIGFycmF5IChgW2EgYiBjXWApLlxuVGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB7QGxpbmsgcGFyc2VFeHByfSBiZWNhdXNlIGBhIGJgIHdpbGwgcGFyc2UgYXMgMiBkaWZmZXJlbnQgdGhpbmdzLCBub3QgYSBjYWxsLlxuSG93ZXZlciwgYGNvbmQgYSBiIGNgIHdpbGwgc3RpbGwgcGFyc2UgYXMgYSBzaW5nbGUgZXhwcmVzc2lvbi5cbkByZXR1cm4ge0FycmF5PFZhbD59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXhwclBhcnRzKHRva2Vucykge1xuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChleHByU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjb25zdCBnZXRMYXN0ID0gKCkgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkFuZDogY2FzZSBLZXl3b3Jkcy5Pcjoge1xuXHRcdFx0XHRcdFx0Y29uc3Qga2luZCA9IGF0LmtpbmQgPT09IEtleXdvcmRzLkFuZCA/IExvZ2ljcy5BbmQgOiBMb2dpY3MuT3Jcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgTG9naWMoYXQubG9jLCBraW5kLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQ2FzZVZhbDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUNhc2UodHJ1ZSwgZmFsc2UsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuQ2xhc3M6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDbGFzcyhhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkNvbmQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VDb25kKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRGVsVmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRGVsKGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuRXhjZXB0VmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KEtleXdvcmRzLkV4Y2VwdFZhbCwgYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JCYWc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JCYWcoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JWYWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JWYWwoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW46IGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOiBjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46IGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUZ1bihhdC5raW5kLCBhZnRlcilcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLklmVmFsOiBjYXNlIEtleXdvcmRzLlVubGVzc1ZhbDoge1xuXHRcdFx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2soYWZ0ZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsVmFsKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0XHRcdHBhcnNlRXhwclBsYWluKGJlZm9yZSksXG5cdFx0XHRcdFx0XHRcdHBhcnNlQmxvY2tWYWwoYmxvY2spLFxuXHRcdFx0XHRcdFx0XHRhdC5raW5kID09PSBLZXl3b3Jkcy5Vbmxlc3NWYWwpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuS2luZDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZUtpbmQoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5OZXc6IHtcblx0XHRcdFx0XHRcdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoYWZ0ZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5ldyhhdC5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Ob3Q6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV3IE5vdChhdC5sb2MsIHBhcnNlRXhwclBsYWluKGFmdGVyKSlcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlN1cGVyVmFsOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGwoYXQubG9jLCBwYXJzZUV4cHJQYXJ0cyhhZnRlcikpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Td2l0Y2hWYWw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2godHJ1ZSwgZmFsc2UsIGFmdGVyKVxuXHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuV2l0aDpcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZVdpdGgoYWZ0ZXIpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZDpcblx0XHRcdFx0XHRcdHJldHVybiBuZXcgWWllbGQoYXQubG9jLFxuXHRcdFx0XHRcdFx0XHRvcElmKCFhZnRlci5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwclBsYWluKGFmdGVyKSkpXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKGF0LmxvYywgcGFyc2VFeHByUGxhaW4oYWZ0ZXIpKVxuXHRcdFx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihhdC5raW5kKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2F0KGJlZm9yZS5tYXAocGFyc2VTaW5nbGUpLCBnZXRMYXN0KCkpXG5cdFx0fSxcblx0XHQoKSA9PiB0b2tlbnMubWFwKHBhcnNlU2luZ2xlKSlcbn1cblxuY29uc3QgZXhwclNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQW5kLCBLZXl3b3Jkcy5DYXNlVmFsLCBLZXl3b3Jkcy5DbGFzcywgS2V5d29yZHMuQ29uZCwgS2V5d29yZHMuRGVsVmFsLFxuXHRLZXl3b3Jkcy5FeGNlcHRWYWwsIEtleXdvcmRzLkZvckJhZywgS2V5d29yZHMuRm9yVmFsLCBLZXl3b3Jkcy5GdW4sIEtleXdvcmRzLkZ1bkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzLCBLZXl3b3Jkcy5GdW5UaGlzRG8sIEtleXdvcmRzLkZ1bkFzeW5jLCBLZXl3b3Jkcy5GdW5Bc3luY0RvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzQXN5bmMsIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvLCBLZXl3b3Jkcy5GdW5HZW4sIEtleXdvcmRzLkZ1bkdlbkRvLFxuXHRLZXl3b3Jkcy5GdW5UaGlzR2VuLCBLZXl3b3Jkcy5GdW5UaGlzR2VuRG8sIEtleXdvcmRzLklmVmFsLCBLZXl3b3Jkcy5LaW5kLCBLZXl3b3Jkcy5OZXcsXG5cdEtleXdvcmRzLk5vdCwgS2V5d29yZHMuT3IsIEtleXdvcmRzLlN1cGVyVmFsLCBLZXl3b3Jkcy5Td2l0Y2hWYWwsIEtleXdvcmRzLlVubGVzc1ZhbCxcblx0S2V5d29yZHMuV2l0aCwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmZ1bmN0aW9uIHBhcnNlRXhwclBsYWluKHRva2Vucykge1xuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKHRva2Vucylcblx0c3dpdGNoIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRjYXNlIDA6XG5cdFx0XHRmYWlsKHRva2Vucy5sb2MsICdFeHBlY3RlZCBhbiBleHByZXNzaW9uLCBnb3Qgbm90aGluZy4nKVxuXHRcdGNhc2UgMTpcblx0XHRcdHJldHVybiBoZWFkKHBhcnRzKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbmV3IENhbGwodG9rZW5zLmxvYywgaGVhZChwYXJ0cyksIHRhaWwocGFydHMpKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uZCh0b2tlbnMpIHtcblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyh0b2tlbnMpXG5cdGNoZWNrKHBhcnRzLmxlbmd0aCA9PT0gMywgdG9rZW5zLmxvYywgKCkgPT4gYCR7Y29kZSgnY29uZCcpfSB0YWtlcyBleGFjdGx5IDMgYXJndW1lbnRzLmApXG5cdHJldHVybiBuZXcgQ29uZCh0b2tlbnMubG9jLCBwYXJ0c1swXSwgcGFydHNbMV0sIHBhcnRzWzJdKVxufVxuXG5mdW5jdGlvbiBwYXJzZVdpdGgodG9rZW5zKSB7XG5cdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHRva2VucylcblxuXHRjb25zdCBbdmFsLCBkZWNsYXJlXSA9IGlmRWxzZShiZWZvcmUub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuQXMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRjaGVjayhhZnRlci5zaXplKCkgPT09IDEsICgpID0+XG5cdFx0XHRcdGBFeHBlY3RlZCBvbmx5IDEgdG9rZW4gYWZ0ZXIgJHtjb2RlKCdhcycpfS5gKVxuXHRcdFx0cmV0dXJuIFtwYXJzZUV4cHJQbGFpbihiZWZvcmUpLCBwYXJzZUxvY2FsRGVjbGFyZShhZnRlci5oZWFkKCkpXVxuXHRcdH0sXG5cdFx0KCkgPT4gW3BhcnNlRXhwclBsYWluKGJlZm9yZSksIExvY2FsRGVjbGFyZS5mb2N1cyh0b2tlbnMubG9jKV0pXG5cblx0cmV0dXJuIG5ldyBXaXRoKHRva2Vucy5sb2MsIGRlY2xhcmUsIHZhbCwgcGFyc2VCbG9ja0RvKGJsb2NrKSlcbn1cbiJdfQ==