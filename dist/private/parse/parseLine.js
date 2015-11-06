'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseDel', './parseExcept', './parseFor', './parseLocalDeclares', './parseMemberName', './parseName', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseExcept'), require('./parseFor'), require('./parseLocalDeclares'), require('./parseMemberName'), require('./parseName'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseDel, global.parseExcept, global.parseFor, global.parseLocalDeclares, global.parseMemberName, global.parseName, global.parseQuote, global.parse, global.Slice);
		global.parseLine = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseDel, _parseExcept, _parseFor, _parseLocalDeclares, _parseMemberName, _parseName, _parseQuote, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.parseLineOrLines = undefined;
	exports.default = parseLine;
	exports.parseBagEntry = parseBagEntry;
	exports.parseBagEntryMany = parseBagEntryMany;
	exports.parseMapEntry = parseMapEntry;
	exports.parseObjEntry = parseObjEntry;
	exports.parseThrow = parseThrow;

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseExcept2 = _interopRequireDefault(_parseExcept);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseMemberName2 = _interopRequireDefault(_parseMemberName);

	var _parseName2 = _interopRequireDefault(_parseName);

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseLine(tokens) {
		const loc = tokens.loc;
		const head = tokens.head();

		const rest = () => tokens.tail();

		const noRest = () => {
			(0, _checks.checkEmpty)(rest(), () => `Did not expect anything after ${ head }.`);
		};

		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.Keywords.Assert:
			case _Token.Keywords.AssertNot:
				return parseAssert(head.kind === _Token.Keywords.AssertNot, rest());

			case _Token.Keywords.Except:
				return (0, _parseExcept2.default)(false, rest());

			case _Token.Keywords.Break:
				return (0, _util.ifElse)((0, _parse.opParseExpr)(rest()), _ => new _MsAst.BreakWithVal(loc, _), () => new _MsAst.Break(loc));

			case _Token.Keywords.Case:
				return (0, _parseCase2.default)(false, false, rest());

			case _Token.Keywords.Debugger:
				noRest();
				return new _MsAst.SpecialDo(loc, _MsAst.SpecialDos.Debugger);

			case _Token.Keywords.Del:
				return (0, _parseDel2.default)(rest());

			case _Token.Keywords.Dot3:
				return parseBagEntryMany(rest(), loc);

			case _Token.Keywords.For:
				return (0, _parseFor.parseFor)(false, rest());

			case _Token.Keywords.Ignore:
				return new _MsAst.Ignore(loc, rest().map(_parseLocalDeclares.parseLocalName));

			case _Token.Keywords.If:
			case _Token.Keywords.Unless:
				{
					var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(rest());

					var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

					const before = _beforeAndBlock2[0];
					const block = _beforeAndBlock2[1];
					return new _MsAst.Conditional(loc, (0, _parse.parseExpr)(before), (0, _parseBlock.parseBlockDo)(block), head.kind === _Token.Keywords.Unless);
				}

			case _Token.Keywords.ObjAssign:
				return parseBagEntry(rest(), loc);

			case _Token.Keywords.Pass:
				noRest();
				return [];

			case _Token.Keywords.Region:
				return (0, _parseBlock.parseLinesFromBlock)(tokens);

			case _Token.Keywords.Super:
				return new _MsAst.SuperCall(loc, (0, _parse.parseExprParts)(rest()), false);

			case _Token.Keywords.Switch:
				return (0, _parse.parseSwitch)(false, false, rest());

			case _Token.Keywords.Throw:
				return parseThrow(rest(), loc);

			default:}
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(lineSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return parseAssignLike(before, at, after, loc);
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const lineSplitKeywords = new Set([_Token.Keywords.Assign, _Token.Keywords.AssignMutable, _Token.Keywords.LocalMutate, _Token.Keywords.MapEntry, _Token.Keywords.ObjAssign, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	const parseLineOrLines = exports.parseLineOrLines = tokens => {
		const _ = parseLine(tokens);
		return _ instanceof Array ? _ : [_];
	};

	function parseBagEntry(tokens, loc) {
		return new _MsAst.BagEntry(loc, (0, _parse.parseExpr)(tokens));
	}

	function parseBagEntryMany(tokens, loc) {
		return new _MsAst.BagEntryMany(loc, (0, _parse.parseExpr)(tokens));
	}

	function parseMapEntry(before, after, loc) {
		return new _MsAst.MapEntry(loc, (0, _parse.parseExpr)(before), (0, _parse.parseExpr)(after));
	}

	function parseObjEntry(before, after, loc) {
		if (before.size() === 1) {
			const token = before.head();
			const isName = (0, _Token.isKeyword)(_Token.Keywords.Name, token);

			const value = () => (0, _parse.parseExpr)(after);

			if (after.isEmpty()) if (isName) return _MsAst.ObjEntryPlain.name(loc, new _MsAst.SpecialVal(loc, _MsAst.SpecialVals.Name));else return _MsAst.ObjEntryPlain.access(loc, (0, _parseLocalDeclares.parseLocalName)(token));else if (token instanceof _Token.Keyword) return new _MsAst.ObjEntryPlain(loc, (0, _Token.keywordName)(token.kind), value());else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return new _MsAst.ObjEntryPlain(loc, (0, _parseQuote2.default)(_Slice2.default.group(token)), value());else if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const slice = _Slice2.default.group(token);

				if (slice.size() === 2 && (0, _Token.isKeyword)(_Token.Keywords.Tick, slice.head())) {
					const name = new _MsAst.QuoteSimple(loc, (0, _parseName2.default)(slice.second()));
					return new _MsAst.ObjEntryPlain(loc, name, value());
				}
			}
		}

		const assign = parseAssign(before, _Token.Keywords.ObjAssign, after, loc);
		return new _MsAst.ObjEntryAssign(loc, assign);
	}

	function parseThrow(tokens, loc) {
		return new _MsAst.Throw(loc, (0, _parse.opParseExpr)(tokens));
	}

	function parseAssignLike(before, at, after, loc) {
		const kind = at.kind;
		if (kind === _Token.Keywords.MapEntry) return parseMapEntry(before, after, loc);else if (kind === _Token.Keywords.ObjAssign) return parseObjEntry(before, after, loc);

		if (before.size() === 1) {
			const token = before.head();

			if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const spaced = _Slice2.default.group(token);

				var _ifElse = (0, _util.ifElse)(spaced.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Type, _)), _ref2 => {
					let before = _ref2.before;
					let after = _ref2.after;
					return [before, (0, _parse.parseExpr)(after)];
				}, () => [spaced, null]);

				var _ifElse2 = _slicedToArray(_ifElse, 2);

				const value = _ifElse2[0];
				const opType = _ifElse2[1];
				const last = value.last();

				const object = obj => obj.isEmpty() ? _MsAst.LocalAccess.this(obj.loc) : (0, _parse.parseSpaced)(obj);

				if ((0, _Token.isKeyword)(_Token.Keywords.Dot, value.nextToLast())) {
					const name = (0, _parseMemberName2.default)(last);
					const set = object(value.rtail().rtail());
					return new _MsAst.MemberSet(loc, set, name, opType, setKind(at), (0, _parse.parseExpr)(after));
				} else if ((0, _Token.isGroup)(_Token.Groups.Bracket, last)) {
					const set = object(value.rtail());
					return parseSubSet(set, _Slice2.default.group(last), opType, at, after, loc);
				}
			}
		}

		return kind === _Token.Keywords.LocalMutate ? parseLocalMutate(before, after, loc) : parseAssign(before, kind, after, loc);
	}

	function setKind(keyword) {
		switch (keyword.kind) {
			case _Token.Keywords.Assign:
				return _MsAst.Setters.Init;

			case _Token.Keywords.AssignMutable:
				return _MsAst.Setters.InitMutable;

			case _Token.Keywords.LocalMutate:
				return _MsAst.Setters.Mutate;

			default:
				(0, _checks.unexpected)(keyword);
		}
	}

	function parseSubSet(object, subbed, opType, at, after, loc) {
		const subbeds = (0, _parse.parseExprParts)(subbed);
		return new _MsAst.SetSub(loc, object, subbeds, opType, setKind(at), (0, _parse.parseExpr)(after));
	}

	function parseLocalMutate(localsTokens, valueTokens, loc) {
		const locals = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(localsTokens);
		(0, _context.check)(locals.length === 1, loc, 'TODO: LocalDestructureMutate');
		const name = locals[0].name;
		const value = (0, _parse.parseExpr)(valueTokens);
		return new _MsAst.LocalMutate(loc, name, value);
	}

	function parseAssign(localsTokens, kind, valueTokens, loc) {
		const locals = (0, _parseLocalDeclares2.default)(localsTokens);
		const value = parseAssignValue(kind, valueTokens);
		const isYield = kind === _Token.Keywords.Yield || kind === _Token.Keywords.YieldTo;

		if ((0, _util.isEmpty)(locals)) {
			(0, _context.check)(isYield, localsTokens.loc, 'Assignment to nothing');
			return value;
		} else {
			if (isYield) for (const _ of locals) (0, _context.check)(!_.isLazy(), _.loc, 'Can not yield to lazy variable.');
			if (kind === _Token.Keywords.AssignMutable) for (let _ of locals) {
				(0, _context.check)(!_.isLazy(), _.loc, 'Lazy local can not be mutable.');
				_.kind = _MsAst.LocalDeclares.Mutable;
			}
			if (locals.length === 1) return new _MsAst.AssignSingle(loc, locals[0], value);else {
				const kind = locals[0].kind;

				for (const _ of locals) (0, _context.check)(_.kind === kind, _.loc, 'All locals of destructuring assignment must be of the same kind.');

				return new _MsAst.AssignDestructure(loc, locals, value, kind);
			}
		}
	}

	function parseAssignValue(kind, valueTokens) {
		const value = () => (0, _parse.parseExpr)(valueTokens);

		const opValue = () => (0, _parse.opParseExpr)(valueTokens);

		switch (kind) {
			case _Token.Keywords.Yield:
				return new _MsAst.Yield(valueTokens.loc, opValue());

			case _Token.Keywords.YieldTo:
				return new _MsAst.YieldTo(valueTokens.loc, opValue());

			default:
				return value();
		}
	}

	function parseAssert(negate, tokens) {
		(0, _checks.checkNonEmpty)(tokens, () => `Expected something after ${ (0, _Token.showKeyword)(_Token.Keywords.Assert) }.`);

		var _ifElse3 = (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Throw, _)), _ref3 => {
			let before = _ref3.before;
			let after = _ref3.after;
			return [before, (0, _parse.parseExpr)(after)];
		}, () => [tokens, null]);

		var _ifElse4 = _slicedToArray(_ifElse3, 2);

		const condTokens = _ifElse4[0];
		const opThrown = _ifElse4[1];
		const parts = (0, _parse.parseExprParts)(condTokens);
		const cond = parts.length === 1 ? parts[0] : new _MsAst.Call(condTokens.loc, parts[0], (0, _util.tail)(parts));
		return new _MsAst.Assert(tokens.loc, negate, cond, opThrown);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQXNCd0IsU0FBUztTQXdFakIsYUFBYSxHQUFiLGFBQWE7U0FHYixpQkFBaUIsR0FBakIsaUJBQWlCO1NBR2pCLGFBQWEsR0FBYixhQUFhO1NBR2IsYUFBYSxHQUFiLGFBQWE7U0E4QmIsVUFBVSxHQUFWLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUEvR0YsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQWtFcEIsZ0JBQWdCLFdBQWhCLGdCQUFnQixHQUFHLE1BQU0sSUFBSTtBQUN6QyxRQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDM0IsU0FBTyxDQUFDLFlBQVksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0VBQ25DOztVQUdlLGFBQWE7Ozs7VUFHYixpQkFBaUI7Ozs7VUFHakIsYUFBYTs7OztVQUdiLGFBQWE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQThCYixVQUFVIiwiZmlsZSI6InBhcnNlTGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2VydCwgQXNzaWduU2luZ2xlLCBBc3NpZ25EZXN0cnVjdHVyZSwgQmFnRW50cnksIEJhZ0VudHJ5TWFueSwgQnJlYWssIEJyZWFrV2l0aFZhbCwgQ2FsbCxcblx0Q29uZGl0aW9uYWwsIElnbm9yZSwgTG9jYWxBY2Nlc3MsIExvY2FsRGVjbGFyZXMsIExvY2FsTXV0YXRlLCBNYXBFbnRyeSwgTWVtYmVyU2V0LFxuXHRPYmpFbnRyeUFzc2lnbiwgT2JqRW50cnlQbGFpbiwgUXVvdGVTaW1wbGUsIFNldFN1YiwgU2V0dGVycywgU3BlY2lhbERvLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFsLFxuXHRTcGVjaWFsVmFscywgU3VwZXJDYWxsLCBUaHJvdywgWWllbGQsIFlpZWxkVG99IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBrZXl3b3JkTmFtZSwgS2V5d29yZHMsIHNob3dLZXl3b3JkXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlTGluZXNGcm9tQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCBwYXJzZUV4Y2VwdCBmcm9tICcuL3BhcnNlRXhjZXB0J1xuaW1wb3J0IHtwYXJzZUZvcn0gZnJvbSAnLi9wYXJzZUZvcidcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMsIHBhcnNlTG9jYWxOYW1lfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWQsIHBhcnNlU3dpdGNofSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgdGhlIGNvbnRlbnQgb2YgYSBsaW5lLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMaW5lKHRva2Vucykge1xuXHRjb25zdCBsb2MgPSB0b2tlbnMubG9jXG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cdGNvbnN0IHJlc3QgPSAoKSA9PiB0b2tlbnMudGFpbCgpXG5cblx0Y29uc3Qgbm9SZXN0ID0gKCkgPT4ge1xuXHRcdGNoZWNrRW1wdHkocmVzdCgpLCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfS5gKVxuXHR9XG5cblx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0aWYgKGhlYWQgaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRjYXNlIEtleXdvcmRzLkFzc2VydDogY2FzZSBLZXl3b3Jkcy5Bc3NlcnROb3Q6XG5cdFx0XHRcdHJldHVybiBwYXJzZUFzc2VydChoZWFkLmtpbmQgPT09IEtleXdvcmRzLkFzc2VydE5vdCwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5FeGNlcHQ6XG5cdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChmYWxzZSwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5CcmVhazpcblx0XHRcdFx0cmV0dXJuIGlmRWxzZShvcFBhcnNlRXhwcihyZXN0KCkpLFxuXHRcdFx0XHRcdF8gPT4gbmV3IEJyZWFrV2l0aFZhbChsb2MsIF8pLFxuXHRcdFx0XHRcdCgpID0+IG5ldyBCcmVhayhsb2MpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5DYXNlOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VDYXNlKGZhbHNlLCBmYWxzZSwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWJ1Z2dlcjpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8obG9jLCBTcGVjaWFsRG9zLkRlYnVnZ2VyKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWw6XG5cdFx0XHRcdHJldHVybiBwYXJzZURlbChyZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdHJldHVybiBwYXJzZUJhZ0VudHJ5TWFueShyZXN0KCksIGxvYylcblx0XHRcdGNhc2UgS2V5d29yZHMuRm9yOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VGb3IoZmFsc2UsIHJlc3QoKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuSWdub3JlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IElnbm9yZShsb2MsIHJlc3QoKS5tYXAocGFyc2VMb2NhbE5hbWUpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZjogY2FzZSBLZXl3b3Jkcy5Vbmxlc3M6IHtcblx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2socmVzdCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsKGxvYyxcblx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRwYXJzZUJsb2NrRG8oYmxvY2spLFxuXHRcdFx0XHRcdGhlYWQua2luZCA9PT0gS2V5d29yZHMuVW5sZXNzKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5PYmpBc3NpZ246XG5cdFx0XHRcdHJldHVybiBwYXJzZUJhZ0VudHJ5KHJlc3QoKSwgbG9jKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5QYXNzOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN1cGVyOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbChsb2MsIHBhcnNlRXhwclBhcnRzKHJlc3QoKSksIGZhbHNlKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Td2l0Y2g6XG5cdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgZmFsc2UsIHJlc3QoKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBwYXJzZVRocm93KHJlc3QoKSwgbG9jKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0fVxuXG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGxpbmVTcGxpdEtleXdvcmRzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IHBhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgbG9jKSxcblx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcbn1cbmNvbnN0IGxpbmVTcGxpdEtleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkFzc2lnbiwgS2V5d29yZHMuQXNzaWduTXV0YWJsZSwgS2V5d29yZHMuTG9jYWxNdXRhdGUsIEtleXdvcmRzLk1hcEVudHJ5LFxuXHRLZXl3b3Jkcy5PYmpBc3NpZ24sIEtleXdvcmRzLllpZWxkLCBLZXl3b3Jkcy5ZaWVsZFRvXG5dKVxuXG5leHBvcnQgY29uc3QgcGFyc2VMaW5lT3JMaW5lcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IF8gPSBwYXJzZUxpbmUodG9rZW5zKVxuXHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFtfXVxufVxuXG4vLyBFeHBvcnRlZCBzbyBwYXJzaW5nIHRoZSBsYXN0IGxpbmUgb2YgYSB2YWx1ZSBibG9jayBjYW4gaGFuZGxlIHRoZXNlIGNhc2VzIHNwZWNpYWxseS5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJhZ0VudHJ5KHRva2VucywgbG9jKSB7XG5cdHJldHVybiBuZXcgQmFnRW50cnkobG9jLCBwYXJzZUV4cHIodG9rZW5zKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJhZ0VudHJ5TWFueSh0b2tlbnMsIGxvYykge1xuXHRyZXR1cm4gbmV3IEJhZ0VudHJ5TWFueShsb2MsIHBhcnNlRXhwcih0b2tlbnMpKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWFwRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKSB7XG5cdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU9iakVudHJ5KGJlZm9yZSwgYWZ0ZXIsIGxvYykge1xuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdGNvbnN0IGlzTmFtZSA9IGlzS2V5d29yZChLZXl3b3Jkcy5OYW1lLCB0b2tlbilcblx0XHRjb25zdCB2YWx1ZSA9ICgpID0+IHBhcnNlRXhwcihhZnRlcilcblxuXHRcdC8vIEhhbmRsZSBgYS5gIHdoaWNoIG1vdmVzIGFuIG91dGVyIGxvY2FsIGludG8gYW4gT2JqRW50cnkuXG5cdFx0aWYgKGFmdGVyLmlzRW1wdHkoKSlcblx0XHRcdGlmIChpc05hbWUpXG5cdFx0XHRcdHJldHVybiBPYmpFbnRyeVBsYWluLm5hbWUobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLk5hbWUpKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5hY2Nlc3MobG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywga2V5d29yZE5hbWUodG9rZW4ua2luZCksIHZhbHVlKCkpXG5cdFx0Ly8gYFwiMVwiLiAxYFxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlF1b3RlLCB0b2tlbikpXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSksIHZhbHVlKCkpXG5cdFx0Ly8gJ2Zvby4gMVxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRpZiAoc2xpY2Uuc2l6ZSgpID09PSAyICYmIGlzS2V5d29yZChLZXl3b3Jkcy5UaWNrLCBzbGljZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgUXVvdGVTaW1wbGUobG9jLCBwYXJzZU5hbWUoc2xpY2Uuc2Vjb25kKCkpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCB2YWx1ZSgpKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFzc2lnbiA9IHBhcnNlQXNzaWduKGJlZm9yZSwgS2V5d29yZHMuT2JqQXNzaWduLCBhZnRlciwgbG9jKVxuXHRyZXR1cm4gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgYXNzaWduKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGhyb3codG9rZW5zLCBsb2MpIHtcblx0cmV0dXJuIG5ldyBUaHJvdyhsb2MsIG9wUGFyc2VFeHByKHRva2VucykpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgbG9jKSB7XG5cdGNvbnN0IGtpbmQgPSBhdC5raW5kXG5cdGlmIChraW5kID09PSBLZXl3b3Jkcy5NYXBFbnRyeSlcblx0XHRyZXR1cm4gcGFyc2VNYXBFbnRyeShiZWZvcmUsIGFmdGVyLCBsb2MpXG5cdGVsc2UgaWYgKGtpbmQgPT09IEtleXdvcmRzLk9iakFzc2lnbilcblx0XHRyZXR1cm4gcGFyc2VPYmpFbnRyeShiZWZvcmUsIGFmdGVyLCBsb2MpXG5cblx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IGJlZm9yZS5oZWFkKClcblx0XHQvLyBgYS5iID0gY2AsIGAuYiA9IGNgLCBgYS5cImJcIiA9IGNgLCBgLlwiYlwiID0gY2AsIGBhW2JdID0gY2Bcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbdmFsdWUsIG9wVHlwZV0gPSBpZkVsc2Uoc3BhY2VkLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIF8pKSxcblx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHRcdCgpID0+IFtzcGFjZWQsIG51bGxdKVxuXG5cdFx0XHRjb25zdCBsYXN0ID0gdmFsdWUubGFzdCgpXG5cdFx0XHRjb25zdCBvYmplY3QgPSBvYmogPT5cblx0XHRcdFx0b2JqLmlzRW1wdHkoKSA/IExvY2FsQWNjZXNzLnRoaXMob2JqLmxvYykgOiBwYXJzZVNwYWNlZChvYmopXG5cblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCB2YWx1ZS5uZXh0VG9MYXN0KCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZU1lbWJlck5hbWUobGFzdClcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KHZhbHVlLnJ0YWlsKCkucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBNZW1iZXJTZXQobG9jLCBzZXQsIG5hbWUsIG9wVHlwZSwgc2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpXG5cdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTdWJTZXQoc2V0LCBTbGljZS5ncm91cChsYXN0KSwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ga2luZCA9PT0gS2V5d29yZHMuTG9jYWxNdXRhdGUgP1xuXHRcdHBhcnNlTG9jYWxNdXRhdGUoYmVmb3JlLCBhZnRlciwgbG9jKSA6XG5cdFx0cGFyc2VBc3NpZ24oYmVmb3JlLCBraW5kLCBhZnRlciwgbG9jKVxufVxuXG5mdW5jdGlvbiBzZXRLaW5kKGtleXdvcmQpIHtcblx0c3dpdGNoIChrZXl3b3JkLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbjpcblx0XHRcdHJldHVybiBTZXR0ZXJzLkluaXRcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbk11dGFibGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0TXV0YWJsZVxuXHRcdGNhc2UgS2V5d29yZHMuTG9jYWxNdXRhdGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5NdXRhdGVcblx0XHRkZWZhdWx0OlxuXHRcdFx0dW5leHBlY3RlZChrZXl3b3JkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3ViU2V0KG9iamVjdCwgc3ViYmVkLCBvcFR5cGUsIGF0LCBhZnRlciwgbG9jKSB7XG5cdGNvbnN0IHN1YmJlZHMgPSBwYXJzZUV4cHJQYXJ0cyhzdWJiZWQpXG5cdHJldHVybiBuZXcgU2V0U3ViKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUxvY2FsTXV0YXRlKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMobG9jYWxzVG9rZW5zKVxuXHRjaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0Y29uc3QgbmFtZSA9IGxvY2Fsc1swXS5uYW1lXG5cdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduKGxvY2Fsc1Rva2Vucywga2luZCwgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXMobG9jYWxzVG9rZW5zKVxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpXG5cblx0Y29uc3QgaXNZaWVsZCA9IGtpbmQgPT09IEtleXdvcmRzLllpZWxkIHx8IGtpbmQgPT09IEtleXdvcmRzLllpZWxkVG9cblx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdGNoZWNrKGlzWWllbGQsIGxvY2Fsc1Rva2Vucy5sb2MsICdBc3NpZ25tZW50IHRvIG5vdGhpbmcnKVxuXHRcdHJldHVybiB2YWx1ZVxuXHR9IGVsc2Uge1xuXHRcdGlmIChpc1lpZWxkKVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnQ2FuIG5vdCB5aWVsZCB0byBsYXp5IHZhcmlhYmxlLicpXG5cblx0XHRpZiAoa2luZCA9PT0gS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdGNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdF8ua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdFx0fVxuXG5cdFx0aWYgKGxvY2Fscy5sZW5ndGggPT09IDEpXG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIGxvY2Fsc1swXSwgdmFsdWUpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdGNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0J0FsbCBsb2NhbHMgb2YgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IG11c3QgYmUgb2YgdGhlIHNhbWUga2luZC4nKVxuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpIHtcblx0Y29uc3QgdmFsdWUgPSAoKSA9PiBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdGNvbnN0IG9wVmFsdWUgPSAoKSA9PiBvcFBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZDpcblx0XHRcdHJldHVybiBuZXcgWWllbGQodmFsdWVUb2tlbnMubG9jLCBvcFZhbHVlKCkpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKHZhbHVlVG9rZW5zLmxvYywgb3BWYWx1ZSgpKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gdmFsdWUoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzZXJ0KG5lZ2F0ZSwgdG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7c2hvd0tleXdvcmQoS2V5d29yZHMuQXNzZXJ0KX0uYClcblxuXHRjb25zdCBbY29uZFRva2Vucywgb3BUaHJvd25dID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlRocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cbiJdfQ==