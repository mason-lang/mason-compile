(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseCase', './parseDel', './parseExcept', './parseFor', './parseLocalDeclares', './parseMemberName', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseCase'), require('./parseDel'), require('./parseExcept'), require('./parseFor'), require('./parseLocalDeclares'), require('./parseMemberName'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseCase, global.parseDel, global.parseExcept, global.parseFor, global.parseLocalDeclares, global.parseMemberName, global.parseQuote, global.parse, global.Slice);
		global.parseLine = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseCase, _parseDel, _parseExcept, _parseFor, _parseLocalDeclares, _parseMemberName, _parseQuote, _parse, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.default = parseLine;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseCase2 = _interopRequireDefault(_parseCase);

	var _parseDel2 = _interopRequireDefault(_parseDel);

	var _parseExcept2 = _interopRequireDefault(_parseExcept);

	var _parseLocalDeclares2 = _interopRequireDefault(_parseLocalDeclares);

	var _parseMemberName2 = _interopRequireDefault(_parseMemberName);

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	/** Parse the content of a line. */

	function parseLine(tokens) {
		const head = tokens.head();
		const rest = tokens.tail();

		const noRest = () => (0, _checks.checkEmpty)(rest, () => `Did not expect anything after ${ head }.`);

		// We only deal with mutable expressions here, otherwise we fall back to parseExpr.
		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.Keywords.Assert:case _Token.Keywords.AssertNot:
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
			case _Token.Keywords.IfDo:case _Token.Keywords.UnlessDo:
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
			// else fall through
			default:
			// fall through
		}

		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(lineSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return parseAssignLike(before, at, after, tokens.loc);
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const parseLineOrLines = tokens => {
		const _ = parseLine(tokens);
		return _ instanceof Array ? _ : [_];
	};

	exports.parseLineOrLines = parseLineOrLines;
	const lineSplitKeywords = new Set([_Token.Keywords.Assign, _Token.Keywords.AssignMutable, _Token.Keywords.LocalMutate, _Token.Keywords.MapEntry, _Token.Keywords.ObjAssign, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	function parseAssignLike(before, at, after, loc) {
		const kind = at.kind;
		if (kind === _Token.Keywords.MapEntry) return new _MsAst.MapEntry(loc, (0, _parse.parseExpr)(before), (0, _parse.parseExpr)(after));

		if (before.size() === 1) {
			const token = before.head();
			// `a.b = c`, `.b = c`, `a."b" = c`, `."b" = c`, `a[b] = c`
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
				// `"1". 1`
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

		// Handle `a.` which moves an outer local into an ObjEntry.
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

		var _ifElse32 = _slicedToArray(_ifElse3, 2);

		const condTokens = _ifElse32[0];
		const opThrown = _ifElse32[1];

		const parts = (0, _parse.parseExprParts)(condTokens);
		const cond = parts.length === 1 ? parts[0] : new _MsAst.Call(condTokens.loc, parts[0], (0, _util.tail)(parts));
		return new _MsAst.Assert(tokens.loc, negate, cond, opThrown);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBb0J3QixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFsQixVQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDekMsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzFCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFMUIsUUFBTSxNQUFNLEdBQUcsTUFDZCxZQWxCTSxVQUFVLEVBa0JMLElBQUksRUFBRSxNQUFNLENBQUMsOEJBQThCLEdBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7OztBQUdqRSxNQUFJLElBQUksbUJBdkJ5QyxPQUFPLEFBdUI3QixFQUMxQixRQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLFFBQUssT0F6QmdFLFFBQVEsQ0F5Qi9ELE1BQU0sQ0FBQyxBQUFDLEtBQUssT0F6QjBDLFFBQVEsQ0F5QnpDLFNBQVM7QUFDNUMsV0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxPQTFCbUMsUUFBUSxDQTBCbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDM0QsUUFBSyxPQTNCZ0UsUUFBUSxDQTJCL0QsUUFBUTtBQUNyQixXQUFPLDJCQUFZLE9BNUJpRCxRQUFRLENBNEJoRCxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUM1QyxRQUFLLE9BN0JnRSxRQUFRLENBNkIvRCxLQUFLO0FBQ2xCLFVBQU0sRUFBRSxDQUFBO0FBQ1IsV0FBTyxXQW5DOEQsS0FBSyxDQW1DekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQUEsQUFDN0IsUUFBSyxPQWhDZ0UsUUFBUSxDQWdDL0QsWUFBWTtBQUN6QixXQUFPLFdBckNxRSxZQUFZLENBcUNoRSxNQUFNLENBQUMsR0FBRyxFQUFF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Y29udGV4dCdcbmltcG9ydCB7QXNzZXJ0LCBBc3NpZ25TaW5nbGUsIEFzc2lnbkRlc3RydWN0dXJlLCBCYWdFbnRyeSwgQmFnRW50cnlNYW55LCBCcmVhaywgQnJlYWtXaXRoVmFsLCBDYWxsLFxuXHRDb25kaXRpb25hbERvLCBJZ25vcmUsIExvY2FsQWNjZXNzLCBMb2NhbERlY2xhcmVzLCBMb2NhbE11dGF0ZSwgTWFwRW50cnksIE1lbWJlclNldCxcblx0T2JqRW50cnlBc3NpZ24sIE9iakVudHJ5UGxhaW4sIFNldFN1YiwgU2V0dGVycywgU3BlY2lhbERvLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFsLCBTcGVjaWFsVmFscyxcblx0U3VwZXJDYWxsRG8sIFRocm93LCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmQsIGtleXdvcmROYW1lLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlTGluZXNGcm9tQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCBwYXJzZUV4Y2VwdCBmcm9tICcuL3BhcnNlRXhjZXB0J1xuaW1wb3J0IHtwYXJzZUZvckRvfSBmcm9tICcuL3BhcnNlRm9yJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcywgcGFyc2VMb2NhbE5hbWV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTWVtYmVyTmFtZSBmcm9tICcuL3BhcnNlTWVtYmVyTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCB7cGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWQsIHBhcnNlU3dpdGNofSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgdGhlIGNvbnRlbnQgb2YgYSBsaW5lLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMaW5lKHRva2Vucykge1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRjb25zdCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXG5cdGNvbnN0IG5vUmVzdCA9ICgpID0+XG5cdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfS5gKVxuXG5cdC8vIFdlIG9ubHkgZGVhbCB3aXRoIG11dGFibGUgZXhwcmVzc2lvbnMgaGVyZSwgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBwYXJzZUV4cHIuXG5cdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NlcnQ6IGNhc2UgS2V5d29yZHMuQXNzZXJ0Tm90OlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLZXl3b3Jkcy5Bc3NlcnROb3QsIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdERvOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS2V5d29yZHMuRXhjZXB0RG8sIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKHRva2Vucy5sb2MpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrV2l0aFZhbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCcmVha1dpdGhWYWwodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5DYXNlRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWJ1Z2dlcjpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8odG9rZW5zLmxvYywgU3BlY2lhbERvcy5EZWJ1Z2dlcilcblx0XHRcdGNhc2UgS2V5d29yZHMuRGVsRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZURlbChyZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5TWFueSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkZvckRvOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VGb3JEbyhyZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZ25vcmU6XG5cdFx0XHRcdHJldHVybiBuZXcgSWdub3JlKHRva2Vucy5sb2MsIHJlc3QubWFwKHBhcnNlTG9jYWxOYW1lKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuSWZEbzogY2FzZSBLZXl3b3Jkcy5Vbmxlc3NEbzoge1xuXHRcdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhyZXN0KVxuXHRcdFx0XHRyZXR1cm4gbmV3IENvbmRpdGlvbmFsRG8odG9rZW5zLmxvYyxcblx0XHRcdFx0XHRwYXJzZUV4cHIoYmVmb3JlKSxcblx0XHRcdFx0XHRwYXJzZUJsb2NrRG8oYmxvY2spLFxuXHRcdFx0XHRcdGhlYWQua2luZCA9PT0gS2V5d29yZHMuVW5sZXNzRG8pXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeSh0b2tlbnMubG9jLCBwYXJzZUV4cHIocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlBhc3M6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzRnJvbUJsb2NrKHRva2Vucylcblx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXJEbzpcblx0XHRcdFx0cmV0dXJuIG5ldyBTdXBlckNhbGxEbyh0b2tlbnMubG9jLCBwYXJzZUV4cHJQYXJ0cyhyZXN0KSlcblx0XHRcdGNhc2UgS2V5d29yZHMuU3dpdGNoRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZVN3aXRjaChmYWxzZSwgZmFsc2UsIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlRocm93OlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRocm93KHRva2Vucy5sb2MsIG9wSWYoIXJlc3QuaXNFbXB0eSgpLCAoKSA9PiBwYXJzZUV4cHIocmVzdCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5OYW1lOlxuXHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLk9iakFzc2lnbiwgcmVzdC5oZWFkKCkpKSB7XG5cdFx0XHRcdFx0Y29uc3QgciA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgdmFsID0gci5pc0VtcHR5KCkgP1xuXHRcdFx0XHRcdFx0bmV3IFNwZWNpYWxWYWwodG9rZW5zLmxvYywgU3BlY2lhbFZhbHMuTmFtZSkgOlxuXHRcdFx0XHRcdFx0cGFyc2VFeHByKHIpXG5cdFx0XHRcdFx0cmV0dXJuIE9iakVudHJ5UGxhaW4ubmFtZSh0b2tlbnMubG9jLCB2YWwpXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gZWxzZSBmYWxsIHRocm91Z2hcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdH1cblxuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChsaW5lU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIHRva2Vucy5sb2MpLFxuXHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuXG5leHBvcnQgY29uc3QgcGFyc2VMaW5lT3JMaW5lcyA9IHRva2VucyA9PiB7XG5cdGNvbnN0IF8gPSBwYXJzZUxpbmUodG9rZW5zKVxuXHRyZXR1cm4gXyBpbnN0YW5jZW9mIEFycmF5ID8gXyA6IFtfXVxufVxuXG5jb25zdCBsaW5lU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5Bc3NpZ24sIEtleXdvcmRzLkFzc2lnbk11dGFibGUsIEtleXdvcmRzLkxvY2FsTXV0YXRlLCBLZXl3b3Jkcy5NYXBFbnRyeSxcblx0S2V5d29yZHMuT2JqQXNzaWduLCBLZXl3b3Jkcy5ZaWVsZCwgS2V5d29yZHMuWWllbGRUb1xuXSlcblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpIHtcblx0Y29uc3Qga2luZCA9IGF0LmtpbmRcblx0aWYgKGtpbmQgPT09IEtleXdvcmRzLk1hcEVudHJ5KVxuXHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblxuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdC8vIGBhLmIgPSBjYCwgYC5iID0gY2AsIGBhLlwiYlwiID0gY2AsIGAuXCJiXCIgPSBjYCwgYGFbYl0gPSBjYFxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFt2YWx1ZSwgb3BUeXBlXSA9IGlmRWxzZShzcGFjZWQub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgXykpLFxuXHRcdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdFx0KCkgPT4gW3NwYWNlZCwgbnVsbF0pXG5cblx0XHRcdGNvbnN0IGxhc3QgPSB2YWx1ZS5sYXN0KClcblx0XHRcdGNvbnN0IG9iamVjdCA9IG9iaiA9PlxuXHRcdFx0XHRvYmouaXNFbXB0eSgpID8gTG9jYWxBY2Nlc3MudGhpcyhvYmoubG9jKSA6IHBhcnNlU3BhY2VkKG9iailcblxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHZhbHVlLm5leHRUb0xhc3QoKSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTWVtYmVyTmFtZShsYXN0KVxuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QodmFsdWUucnRhaWwoKS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlclNldChsb2MsIHNldCwgbmFtZSwgb3BUeXBlLCBzZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSlcblx0XHRcdH0gZWxzZSBpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KHZhbHVlLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBwYXJzZVN1YlNldChzZXQsIFNsaWNlLmdyb3VwKGxhc3QpLCBvcFR5cGUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0fVxuXHRcdC8vIGBcIjFcIi4gMWBcblx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlF1b3RlLCB0b2tlbikgJiYga2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgcGFyc2VRdW90ZShTbGljZS5ncm91cCh0b2tlbikpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXHR9XG5cblx0cmV0dXJuIGtpbmQgPT09IEtleXdvcmRzLkxvY2FsTXV0YXRlID9cblx0XHRwYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdHBhcnNlQXNzaWduKGJlZm9yZSwga2luZCwgYWZ0ZXIsIGxvYylcbn1cblxuZnVuY3Rpb24gc2V0S2luZChrZXl3b3JkKSB7XG5cdHN3aXRjaCAoa2V5d29yZC5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ246XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdE11dGFibGVcblx0XHRjYXNlIEtleXdvcmRzLkxvY2FsTXV0YXRlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuTXV0YXRlXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHVuZXhwZWN0ZWQoa2V5d29yZClcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVN1YlNldChvYmplY3QsIHN1YmJlZCwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBzdWJiZWRzID0gcGFyc2VFeHByUGFydHMoc3ViYmVkKVxuXHRyZXR1cm4gbmV3IFNldFN1Yihsb2MsIG9iamVjdCwgc3ViYmVkcywgb3BUeXBlLCBzZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VMb2NhbE11dGF0ZShsb2NhbHNUb2tlbnMsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0Y2hlY2sobG9jYWxzLmxlbmd0aCA9PT0gMSwgbG9jLCAnVE9ETzogTG9jYWxEZXN0cnVjdHVyZU11dGF0ZScpXG5cdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0cmV0dXJuIG5ldyBMb2NhbE11dGF0ZShsb2MsIG5hbWUsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbihsb2NhbHNUb2tlbnMsIGtpbmQsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2VucylcblxuXHQvLyBIYW5kbGUgYGEuYCB3aGljaCBtb3ZlcyBhbiBvdXRlciBsb2NhbCBpbnRvIGFuIE9iakVudHJ5LlxuXHRpZiAoa2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduICYmIHZhbHVlVG9rZW5zLmlzRW1wdHkoKSAmJiBsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0Y29uc3QgbG9jYWwgPSBsb2NhbHNbMF1cblx0XHRjaGVjayhsb2NhbC5vcFR5cGUgPT09IG51bGwsIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdGBUeXBlIGRlY2xhcmF0aW9uIHNob3VsZCBnbyB3aXRoIGluaXRpYWwgZGVjbGFyYXRpb24gb2YgJHtsb2NhbC5uYW1lfS5gKVxuXHRcdHJldHVybiBPYmpFbnRyeVBsYWluLmFjY2Vzcyhsb2MsIGxvY2FsLm5hbWUpXG5cdH1cblxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpXG5cblx0Y29uc3QgaXNZaWVsZCA9IGtpbmQgPT09IEtleXdvcmRzLllpZWxkIHx8IGtpbmQgPT09IEtleXdvcmRzLllpZWxkVG9cblx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdGNoZWNrKGlzWWllbGQsIGxvY2Fsc1Rva2Vucy5sb2MsICdBc3NpZ25tZW50IHRvIG5vdGhpbmcnKVxuXHRcdHJldHVybiB2YWx1ZVxuXHR9IGVsc2Uge1xuXHRcdGlmIChpc1lpZWxkKVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnQ2FuIG5vdCB5aWVsZCB0byBsYXp5IHZhcmlhYmxlLicpXG5cblx0XHRjb25zdCBpc09iakFzc2lnbiA9IGtpbmQgPT09IEtleXdvcmRzLk9iakFzc2lnblxuXG5cdFx0aWYgKGtpbmQgPT09IEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRmb3IgKGxldCBfIG9mIGxvY2Fscykge1xuXHRcdFx0XHRjaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRfLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHRcdH1cblxuXHRcdGNvbnN0IHdyYXAgPSBfID0+IGlzT2JqQXNzaWduID8gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgXykgOiBfXG5cblx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Y29uc3QgYXNzaWduZWUgPSBsb2NhbHNbMF1cblx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRyZXR1cm4gd3JhcChhc3NpZ24pXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRyZXR1cm4gd3JhcChuZXcgQXNzaWduRGVzdHJ1Y3R1cmUobG9jLCBsb2NhbHMsIHZhbHVlLCBraW5kKSlcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25WYWx1ZShraW5kLCB2YWx1ZVRva2Vucykge1xuXHRjb25zdCB2YWx1ZSA9ICgpID0+IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0Y29uc3Qgb3BWYWx1ZSA9ICgpID0+IG9wSWYoIXZhbHVlVG9rZW5zLmlzRW1wdHkoKSwgdmFsdWUpXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuWWllbGQ6XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlVG9rZW5zLmxvYywgb3BWYWx1ZSgpKVxuXHRcdGNhc2UgS2V5d29yZHMuWWllbGRUbzpcblx0XHRcdHJldHVybiBuZXcgWWllbGRUbyh2YWx1ZVRva2Vucy5sb2MsIG9wVmFsdWUoKSlcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHZhbHVlKClcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2VydChuZWdhdGUsIHRva2Vucykge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2tleXdvcmROYW1lKEtleXdvcmRzLkFzc2VydCl9LmApXG5cblx0Y29uc3QgW2NvbmRUb2tlbnMsIG9wVGhyb3duXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UaHJvdywgXykpLFxuXHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHQoKSA9PiBbdG9rZW5zLCBudWxsXSlcblxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGNvbmRUb2tlbnMpXG5cdGNvbnN0IGNvbmQgPSBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IG5ldyBDYWxsKGNvbmRUb2tlbnMubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdHJldHVybiBuZXcgQXNzZXJ0KHRva2Vucy5sb2MsIG5lZ2F0ZSwgY29uZCwgb3BUaHJvd24pXG59XG4iXX0=