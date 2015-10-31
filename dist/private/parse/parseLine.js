'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseDel', './parseExcept', './parseFor', './parseLocalDeclares', './parseMemberName', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseExcept'), require('./parseFor'), require('./parseLocalDeclares'), require('./parseMemberName'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseDel, global.parseExcept, global.parseFor, global.parseLocalDeclares, global.parseMemberName, global.parseQuote, global.parse, global.Slice);
		global.parseLine = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseDel, _parseExcept, _parseFor, _parseLocalDeclares, _parseMemberName, _parseQuote, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.parseLineOrLines = undefined;
	exports.default = parseLine;

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseExcept2 = _interopRequireDefault(_parseExcept);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseMemberName2 = _interopRequireDefault(_parseMemberName);

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function parseLine(tokens) {
		const head = tokens.head();
		const rest = tokens.tail();

		const noRest = () => (0, _checks.checkEmpty)(rest, () => `Did not expect anything after ${ head }.`);

		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.Keywords.Assert:
			case _Token.Keywords.AssertNot:
				return parseAssert(head.kind === _Token.Keywords.AssertNot, rest);

			case _Token.Keywords.ExceptDo:
				return (0, _parseExcept2.default)(_Token.Keywords.ExceptDo, rest);

			case _Token.Keywords.Break:
				noRest();
				return new _MsAst.Break(tokens.loc);

			case _Token.Keywords.BreakWithVal:
				return new _MsAst.BreakWithVal(tokens.loc, (0, _parse.parseExpr)(rest));

			case _Token.Keywords.CaseDo:
				return (0, _parseCase2.default)(false, false, rest);

			case _Token.Keywords.Debugger:
				noRest();
				return new _MsAst.SpecialDo(tokens.loc, _MsAst.SpecialDos.Debugger);

			case _Token.Keywords.DelDo:
				return (0, _parseDel2.default)(rest);

			case _Token.Keywords.Dot3:
				return new _MsAst.BagEntryMany(tokens.loc, (0, _parse.parseExpr)(rest));

			case _Token.Keywords.ForDo:
				return (0, _parseFor.parseForDo)(rest);

			case _Token.Keywords.Ignore:
				return new _MsAst.Ignore(tokens.loc, rest.map(_parseLocalDeclares.parseLocalName));

			case _Token.Keywords.IfDo:
			case _Token.Keywords.UnlessDo:
				{
					var _beforeAndBlock = (0, _parseBlock.beforeAndBlock)(rest);

					var _beforeAndBlock2 = _slicedToArray(_beforeAndBlock, 2);

					const before = _beforeAndBlock2[0];
					const block = _beforeAndBlock2[1];
					return new _MsAst.ConditionalDo(tokens.loc, (0, _parse.parseExpr)(before), (0, _parseBlock.parseBlockDo)(block), head.kind === _Token.Keywords.UnlessDo);
				}

			case _Token.Keywords.ObjAssign:
				return new _MsAst.BagEntry(tokens.loc, (0, _parse.parseExpr)(rest));

			case _Token.Keywords.Pass:
				noRest();
				return [];

			case _Token.Keywords.Region:
				return (0, _parseBlock.parseLinesFromBlock)(tokens);

			case _Token.Keywords.SuperDo:
				return new _MsAst.SuperCallDo(tokens.loc, (0, _parse.parseExprParts)(rest));

			case _Token.Keywords.SwitchDo:
				return (0, _parse.parseSwitch)(false, false, rest);

			case _Token.Keywords.Throw:
				return new _MsAst.Throw(tokens.loc, (0, _util.opIf)(!rest.isEmpty(), () => (0, _parse.parseExpr)(rest)));

			case _Token.Keywords.Name:
				if ((0, _Token.isKeyword)(_Token.Keywords.ObjAssign, rest.head())) {
					const r = rest.tail();
					const val = r.isEmpty() ? new _MsAst.SpecialVal(tokens.loc, _MsAst.SpecialVals.Name) : (0, _parse.parseExpr)(r);
					return _MsAst.ObjEntryPlain.name(tokens.loc, val);
				}

			default:}
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(lineSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return parseAssignLike(before, at, after, tokens.loc);
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const parseLineOrLines = exports.parseLineOrLines = tokens => {
		const _ = parseLine(tokens);
		return _ instanceof Array ? _ : [_];
	};

	const lineSplitKeywords = new Set([_Token.Keywords.Assign, _Token.Keywords.AssignMutable, _Token.Keywords.LocalMutate, _Token.Keywords.MapEntry, _Token.Keywords.ObjAssign, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	function parseAssignLike(before, at, after, loc) {
		const kind = at.kind;
		if (kind === _Token.Keywords.MapEntry) return new _MsAst.MapEntry(loc, (0, _parse.parseExpr)(before), (0, _parse.parseExpr)(after));

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
			} else if ((0, _Token.isGroup)(_Token.Groups.Quote, token) && kind === _Token.Keywords.ObjAssign) return new _MsAst.ObjEntryPlain(loc, (0, _parseQuote2.default)(_Slice2.default.group(token)), (0, _parse.parseExpr)(after));
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

		if (kind === _Token.Keywords.ObjAssign && valueTokens.isEmpty() && locals.length === 1) {
			const local = locals[0];
			(0, _context.check)(local.opType === null, local.loc, () => `Type declaration should go with initial declaration of ${ local.name }.`);
			return _MsAst.ObjEntryPlain.access(loc, local.name);
		}

		const value = parseAssignValue(kind, valueTokens);
		const isYield = kind === _Token.Keywords.Yield || kind === _Token.Keywords.YieldTo;

		if ((0, _util.isEmpty)(locals)) {
			(0, _context.check)(isYield, localsTokens.loc, 'Assignment to nothing');
			return value;
		} else {
			if (isYield) for (const _ of locals) (0, _context.check)(!_.isLazy(), _.loc, 'Can not yield to lazy variable.');
			const isObjAssign = kind === _Token.Keywords.ObjAssign;
			if (kind === _Token.Keywords.AssignMutable) for (let _ of locals) {
				(0, _context.check)(!_.isLazy(), _.loc, 'Lazy local can not be mutable.');
				_.kind = _MsAst.LocalDeclares.Mutable;
			}

			const wrap = _ => isObjAssign ? new _MsAst.ObjEntryAssign(loc, _) : _;

			if (locals.length === 1) {
				const assignee = locals[0];
				const assign = new _MsAst.AssignSingle(loc, assignee, value);
				return wrap(assign);
			} else {
				const kind = locals[0].kind;

				for (const _ of locals) (0, _context.check)(_.kind === kind, _.loc, 'All locals of destructuring assignment must be of the same kind.');

				return wrap(new _MsAst.AssignDestructure(loc, locals, value, kind));
			}
		}
	}

	function parseAssignValue(kind, valueTokens) {
		const value = () => (0, _parse.parseExpr)(valueTokens);

		const opValue = () => (0, _util.opIf)(!valueTokens.isEmpty(), value);

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
		(0, _checks.checkNonEmpty)(tokens, () => `Expected something after ${ (0, _Token.keywordName)(_Token.Keywords.Assert) }.`);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBVCxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FzRXBCLGdCQUFnQixXQUFoQixnQkFBZ0IsR0FBRyxNQUFNLElBQUk7QUFDekMsUUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNCLFNBQU8sQ0FBQyxZQUFZLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUNuQyIsImZpbGUiOiJwYXJzZUxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnblNpbmdsZSwgQXNzaWduRGVzdHJ1Y3R1cmUsIEJhZ0VudHJ5LCBCYWdFbnRyeU1hbnksIEJyZWFrLCBCcmVha1dpdGhWYWwsIENhbGwsXG5cdENvbmRpdGlvbmFsRG8sIElnbm9yZSwgTG9jYWxBY2Nlc3MsIExvY2FsRGVjbGFyZXMsIExvY2FsTXV0YXRlLCBNYXBFbnRyeSwgTWVtYmVyU2V0LFxuXHRPYmpFbnRyeUFzc2lnbiwgT2JqRW50cnlQbGFpbiwgU2V0U3ViLCBTZXR0ZXJzLCBTcGVjaWFsRG8sIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWwsIFNwZWNpYWxWYWxzLFxuXHRTdXBlckNhbGxEbywgVGhyb3csIFlpZWxkLCBZaWVsZFRvfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZCwga2V5d29yZE5hbWUsIEtleXdvcmRzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlLCBpc0VtcHR5LCBvcElmLCB0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5LCB1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7YmVmb3JlQW5kQmxvY2ssIHBhcnNlQmxvY2tEbywgcGFyc2VMaW5lc0Zyb21CbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlQ2FzZSBmcm9tICcuL3BhcnNlQ2FzZSdcbmltcG9ydCBwYXJzZURlbCBmcm9tICcuL3BhcnNlRGVsJ1xuaW1wb3J0IHBhcnNlRXhjZXB0IGZyb20gJy4vcGFyc2VFeGNlcHQnXG5pbXBvcnQge3BhcnNlRm9yRG99IGZyb20gJy4vcGFyc2VGb3InXG5pbXBvcnQgcGFyc2VMb2NhbERlY2xhcmVzLCB7cGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzLCBwYXJzZUxvY2FsTmFtZX0gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VNZW1iZXJOYW1lIGZyb20gJy4vcGFyc2VNZW1iZXJOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZCwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSB0aGUgY29udGVudCBvZiBhIGxpbmUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxpbmUodG9rZW5zKSB7XG5cdGNvbnN0IGhlYWQgPSB0b2tlbnMuaGVhZCgpXG5cdGNvbnN0IHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cblx0Y29uc3Qgbm9SZXN0ID0gKCkgPT5cblx0XHRjaGVja0VtcHR5KHJlc3QsICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9LmApXG5cblx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0aWYgKGhlYWQgaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRjYXNlIEtleXdvcmRzLkFzc2VydDogY2FzZSBLZXl3b3Jkcy5Bc3NlcnROb3Q6XG5cdFx0XHRcdHJldHVybiBwYXJzZUFzc2VydChoZWFkLmtpbmQgPT09IEtleXdvcmRzLkFzc2VydE5vdCwgcmVzdClcblx0XHRcdGNhc2UgS2V5d29yZHMuRXhjZXB0RG86XG5cdFx0XHRcdHJldHVybiBwYXJzZUV4Y2VwdChLZXl3b3Jkcy5FeGNlcHREbywgcmVzdClcblx0XHRcdGNhc2UgS2V5d29yZHMuQnJlYWs6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBuZXcgQnJlYWsodG9rZW5zLmxvYylcblx0XHRcdGNhc2UgS2V5d29yZHMuQnJlYWtXaXRoVmFsOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrV2l0aFZhbCh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkNhc2VEbzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQ2FzZShmYWxzZSwgZmFsc2UsIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRlYnVnZ2VyOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyh0b2tlbnMubG9jLCBTcGVjaWFsRG9zLkRlYnVnZ2VyKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWxEbzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRGVsKHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnlNYW55KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdGNhc2UgS2V5d29yZHMuRm9yRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZUZvckRvKHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLklnbm9yZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBJZ25vcmUodG9rZW5zLmxvYywgcmVzdC5tYXAocGFyc2VMb2NhbE5hbWUpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZkRvOiBjYXNlIEtleXdvcmRzLlVubGVzc0RvOiB7XG5cdFx0XHRcdGNvbnN0IFtiZWZvcmUsIGJsb2NrXSA9IGJlZm9yZUFuZEJsb2NrKHJlc3QpXG5cdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWxEbyh0b2tlbnMubG9jLFxuXHRcdFx0XHRcdHBhcnNlRXhwcihiZWZvcmUpLFxuXHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0aGVhZC5raW5kID09PSBLZXl3b3Jkcy5Vbmxlc3NEbylcblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuT2JqQXNzaWduOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5KHRva2Vucy5sb2MsIHBhcnNlRXhwcihyZXN0KSlcblx0XHRcdGNhc2UgS2V5d29yZHMuUGFzczpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIFtdXG5cdFx0XHRjYXNlIEtleXdvcmRzLlJlZ2lvbjpcblx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZXNGcm9tQmxvY2sodG9rZW5zKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5TdXBlckRvOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFN1cGVyQ2FsbERvKHRva2Vucy5sb2MsIHBhcnNlRXhwclBhcnRzKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Td2l0Y2hEbzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKGZhbHNlLCBmYWxzZSwgcmVzdClcblx0XHRcdGNhc2UgS2V5d29yZHMuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBuZXcgVGhyb3codG9rZW5zLmxvYywgb3BJZighcmVzdC5pc0VtcHR5KCksICgpID0+IHBhcnNlRXhwcihyZXN0KSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduLCByZXN0LmhlYWQoKSkpIHtcblx0XHRcdFx0XHRjb25zdCByID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRjb25zdCB2YWwgPSByLmlzRW1wdHkoKSA/XG5cdFx0XHRcdFx0XHRuZXcgU3BlY2lhbFZhbCh0b2tlbnMubG9jLCBTcGVjaWFsVmFscy5OYW1lKSA6XG5cdFx0XHRcdFx0XHRwYXJzZUV4cHIocilcblx0XHRcdFx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5uYW1lKHRva2Vucy5sb2MsIHZhbClcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBlbHNlIGZhbGwgdGhyb3VnaFxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0fVxuXG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGxpbmVTcGxpdEtleXdvcmRzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IHBhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgdG9rZW5zLmxvYyksXG5cdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0Y29uc3QgXyA9IHBhcnNlTGluZSh0b2tlbnMpXG5cdHJldHVybiBfIGluc3RhbmNlb2YgQXJyYXkgPyBfIDogW19dXG59XG5cbmNvbnN0IGxpbmVTcGxpdEtleXdvcmRzID0gbmV3IFNldChbXG5cdEtleXdvcmRzLkFzc2lnbiwgS2V5d29yZHMuQXNzaWduTXV0YWJsZSwgS2V5d29yZHMuTG9jYWxNdXRhdGUsIEtleXdvcmRzLk1hcEVudHJ5LFxuXHRLZXl3b3Jkcy5PYmpBc3NpZ24sIEtleXdvcmRzLllpZWxkLCBLZXl3b3Jkcy5ZaWVsZFRvXG5dKVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBraW5kID0gYXQua2luZFxuXHRpZiAoa2luZCA9PT0gS2V5d29yZHMuTWFwRW50cnkpXG5cdFx0cmV0dXJuIG5ldyBNYXBFbnRyeShsb2MsIHBhcnNlRXhwcihiZWZvcmUpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Ly8gYGEuYiA9IGNgLCBgLmIgPSBjYCwgYGEuXCJiXCIgPSBjYCwgYC5cImJcIiA9IGNgLCBgYVtiXSA9IGNgXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNwYWNlZCA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgW3ZhbHVlLCBvcFR5cGVdID0gaWZFbHNlKHNwYWNlZC5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBfKSksXG5cdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0XHQoKSA9PiBbc3BhY2VkLCBudWxsXSlcblxuXHRcdFx0Y29uc3QgbGFzdCA9IHZhbHVlLmxhc3QoKVxuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gb2JqID0+XG5cdFx0XHRcdG9iai5pc0VtcHR5KCkgPyBMb2NhbEFjY2Vzcy50aGlzKG9iai5sb2MpIDogcGFyc2VTcGFjZWQob2JqKVxuXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdmFsdWUubmV4dFRvTGFzdCgpKSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKGxhc3QpXG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyU2V0KGxvYywgc2V0LCBuYW1lLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXHRcdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5CcmFja2V0LCBsYXN0KSkge1xuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QodmFsdWUucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3ViU2V0KHNldCwgU2xpY2UuZ3JvdXAobGFzdCksIG9wVHlwZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHR9XG5cdFx0Ly8gYFwiMVwiLiAxYFxuXHRcdH0gZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUXVvdGUsIHRva2VuKSAmJiBraW5kID09PSBLZXl3b3Jkcy5PYmpBc3NpZ24pXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSksIHBhcnNlRXhwcihhZnRlcikpXG5cdH1cblxuXHRyZXR1cm4ga2luZCA9PT0gS2V5d29yZHMuTG9jYWxNdXRhdGUgP1xuXHRcdHBhcnNlTG9jYWxNdXRhdGUoYmVmb3JlLCBhZnRlciwgbG9jKSA6XG5cdFx0cGFyc2VBc3NpZ24oYmVmb3JlLCBraW5kLCBhZnRlciwgbG9jKVxufVxuXG5mdW5jdGlvbiBzZXRLaW5kKGtleXdvcmQpIHtcblx0c3dpdGNoIChrZXl3b3JkLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbjpcblx0XHRcdHJldHVybiBTZXR0ZXJzLkluaXRcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbk11dGFibGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0TXV0YWJsZVxuXHRcdGNhc2UgS2V5d29yZHMuTG9jYWxNdXRhdGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5NdXRhdGVcblx0XHRkZWZhdWx0OlxuXHRcdFx0dW5leHBlY3RlZChrZXl3b3JkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3ViU2V0KG9iamVjdCwgc3ViYmVkLCBvcFR5cGUsIGF0LCBhZnRlciwgbG9jKSB7XG5cdGNvbnN0IHN1YmJlZHMgPSBwYXJzZUV4cHJQYXJ0cyhzdWJiZWQpXG5cdHJldHVybiBuZXcgU2V0U3ViKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUxvY2FsTXV0YXRlKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMobG9jYWxzVG9rZW5zKVxuXHRjaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0Y29uc3QgbmFtZSA9IGxvY2Fsc1swXS5uYW1lXG5cdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduKGxvY2Fsc1Rva2Vucywga2luZCwgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXMobG9jYWxzVG9rZW5zKVxuXG5cdC8vIEhhbmRsZSBgYS5gIHdoaWNoIG1vdmVzIGFuIG91dGVyIGxvY2FsIGludG8gYW4gT2JqRW50cnkuXG5cdGlmIChraW5kID09PSBLZXl3b3Jkcy5PYmpBc3NpZ24gJiYgdmFsdWVUb2tlbnMuaXNFbXB0eSgpICYmIGxvY2Fscy5sZW5ndGggPT09IDEpIHtcblx0XHRjb25zdCBsb2NhbCA9IGxvY2Fsc1swXVxuXHRcdGNoZWNrKGxvY2FsLm9wVHlwZSA9PT0gbnVsbCwgbG9jYWwubG9jLCAoKSA9PlxuXHRcdFx0YFR5cGUgZGVjbGFyYXRpb24gc2hvdWxkIGdvIHdpdGggaW5pdGlhbCBkZWNsYXJhdGlvbiBvZiAke2xvY2FsLm5hbWV9LmApXG5cdFx0cmV0dXJuIE9iakVudHJ5UGxhaW4uYWNjZXNzKGxvYywgbG9jYWwubmFtZSlcblx0fVxuXG5cdGNvbnN0IHZhbHVlID0gcGFyc2VBc3NpZ25WYWx1ZShraW5kLCB2YWx1ZVRva2VucylcblxuXHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS2V5d29yZHMuWWllbGQgfHwga2luZCA9PT0gS2V5d29yZHMuWWllbGRUb1xuXHRpZiAoaXNFbXB0eShsb2NhbHMpKSB7XG5cdFx0Y2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0cmV0dXJuIHZhbHVlXG5cdH0gZWxzZSB7XG5cdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRjaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdGNvbnN0IGlzT2JqQXNzaWduID0ga2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduXG5cblx0XHRpZiAoa2luZCA9PT0gS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdGNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdF8ua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdFx0fVxuXG5cdFx0Y29uc3Qgd3JhcCA9IF8gPT4gaXNPYmpBc3NpZ24gPyBuZXcgT2JqRW50cnlBc3NpZ24obG9jLCBfKSA6IF9cblxuXHRcdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRjb25zdCBhc3NpZ25lZSA9IGxvY2Fsc1swXVxuXHRcdFx0Y29uc3QgYXNzaWduID0gbmV3IEFzc2lnblNpbmdsZShsb2MsIGFzc2lnbmVlLCB2YWx1ZSlcblx0XHRcdHJldHVybiB3cmFwKGFzc2lnbilcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qga2luZCA9IGxvY2Fsc1swXS5raW5kXG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRjaGVjayhfLmtpbmQgPT09IGtpbmQsIF8ubG9jLFxuXHRcdFx0XHRcdCdBbGwgbG9jYWxzIG9mIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBtdXN0IGJlIG9mIHRoZSBzYW1lIGtpbmQuJylcblx0XHRcdHJldHVybiB3cmFwKG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpKVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnblZhbHVlKGtpbmQsIHZhbHVlVG9rZW5zKSB7XG5cdGNvbnN0IHZhbHVlID0gKCkgPT4gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRjb25zdCBvcFZhbHVlID0gKCkgPT4gb3BJZighdmFsdWVUb2tlbnMuaXNFbXB0eSgpLCB2YWx1ZSlcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZDpcblx0XHRcdHJldHVybiBuZXcgWWllbGQodmFsdWVUb2tlbnMubG9jLCBvcFZhbHVlKCkpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKHZhbHVlVG9rZW5zLmxvYywgb3BWYWx1ZSgpKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gdmFsdWUoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzZXJ0KG5lZ2F0ZSwgdG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7a2V5d29yZE5hbWUoS2V5d29yZHMuQXNzZXJ0KX0uYClcblxuXHRjb25zdCBbY29uZFRva2Vucywgb3BUaHJvd25dID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlRocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cbiJdfQ==