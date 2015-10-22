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
			case _Token.Keywords.Ellipsis:
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
		const value = (0, _parse.parseExpr)(valueTokens);
		switch (kind) {
			case _Token.Keywords.Yield:
				return new _MsAst.Yield(value.loc, value);
			case _Token.Keywords.YieldTo:
				return new _MsAst.YieldTo(value.loc, value);
			default:
				return value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBb0J3QixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFsQixVQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDekMsUUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzFCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFFMUIsUUFBTSxNQUFNLEdBQUcsTUFDZCxZQWxCTSxVQUFVLEVBa0JMLElBQUksRUFBRSxNQUFNLENBQUMsOEJBQThCLEdBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7OztBQUdqRSxNQUFJLElBQUksbUJBdkJ5QyxPQUFPLEFBdUI3QixFQUMxQixRQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2hCLFFBQUssT0F6QmdFLFFBQVEsQ0F5Qi9ELE1BQU0sQ0FBQyxBQUFDLEtBQUssT0F6QjBDLFFBQVEsQ0F5QnpDLFNBQVM7QUFDNUMsV0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxPQTFCbUMsUUFBUSxDQTBCbEMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQUEsQUFDM0QsUUFBSyxPQTNCZ0UsUUFBUSxDQTJCL0QsUUFBUTtBQUNyQixXQUFPLDJCQUFZLE9BNUJpRCxRQUFRLENBNEJoRCxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFBQSxBQUM1QyxRQUFLLE9BN0JnRSxRQUFRLENBNkIvRCxLQUFLO0FBQ2xCLFVBQU0sRUFBRSxDQUFBO0FBQ1IsV0FBTyxXQW5DOEQsS0FBSyxDQW1DekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQUEsQUFDN0IsUUFBSyxPQWhDZ0UsUUFBUSxDQWdDL0QsWUFBWTtBQUN6QixXQUFPLFdBckNxRSxZQUFZLENBcUNoRSxNQUFNLENBQUMsR0FBRyxFQUFF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TSxDQUFDLHlCQUF5QixHQUFFLFdBeE5FLFdBQVcsRUF3TkQsT0F4TkcsUUFBUSxDQXdORixNQUFNLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOztpQkFHdkYsVUExTk0sTUFBTSxFQTBOTCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxXQTNOTSxTQUFTLEVBMk5MLE9BM042QixRQUFRLENBMk41QixLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDM0QsQUFBQyxLQUFlO09BQWQsTUFBTSxHQUFQLEtBQWUsQ0FBZCxNQUFNO09BQUUsS0FBSyxHQUFkLEtBQWUsQ0FBTixLQUFLO1VBQU0sQ0FBQyxNQUFNLEVBQUUsV0FqTnpCLFNBQVMsRUFpTjBCLEtBQUssQ0FBQyxDQUFDO0dBQUEsRUFDL0MsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7OztRQUhoQixVQUFVO1FBQUUsUUFBUTs7QUFLM0IsUUFBTSxLQUFLLEdBQUcsV0FwTkksY0FBYyxFQW9OSCxVQUFVLENBQUMsQ0FBQTtBQUN4QyxRQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FwT2dELElBQUksQ0FvTzNDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBL05sRCxJQUFJLEVBK05tRCxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzVGLFNBQU8sV0FyT0EsTUFBTSxDQXFPSyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7RUFDckQiLCJmaWxlIjoicGFyc2VMaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzZXJ0LCBBc3NpZ25TaW5nbGUsIEFzc2lnbkRlc3RydWN0dXJlLCBCYWdFbnRyeSwgQmFnRW50cnlNYW55LCBCcmVhaywgQnJlYWtXaXRoVmFsLCBDYWxsLFxuXHRDb25kaXRpb25hbERvLCBJZ25vcmUsIExvY2FsQWNjZXNzLCBMb2NhbERlY2xhcmVzLCBMb2NhbE11dGF0ZSwgTWFwRW50cnksIE1lbWJlclNldCxcblx0T2JqRW50cnlBc3NpZ24sIE9iakVudHJ5UGxhaW4sIFNldFN1YiwgU2V0dGVycywgU3BlY2lhbERvLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFsLCBTcGVjaWFsVmFscyxcblx0U3VwZXJDYWxsRG8sIFRocm93LCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmQsIGtleXdvcmROYW1lLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgb3BJZiwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlTGluZXNGcm9tQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCBwYXJzZUV4Y2VwdCBmcm9tICcuL3BhcnNlRXhjZXB0J1xuaW1wb3J0IHtwYXJzZUZvckRvfSBmcm9tICcuL3BhcnNlRm9yJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcywgcGFyc2VMb2NhbE5hbWV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTWVtYmVyTmFtZSBmcm9tICcuL3BhcnNlTWVtYmVyTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCB7cGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWQsIHBhcnNlU3dpdGNofSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKiogUGFyc2UgdGhlIGNvbnRlbnQgb2YgYSBsaW5lLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VMaW5lKHRva2Vucykge1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRjb25zdCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXG5cdGNvbnN0IG5vUmVzdCA9ICgpID0+XG5cdFx0Y2hlY2tFbXB0eShyZXN0LCAoKSA9PiBgRGlkIG5vdCBleHBlY3QgYW55dGhpbmcgYWZ0ZXIgJHtoZWFkfS5gKVxuXG5cdC8vIFdlIG9ubHkgZGVhbCB3aXRoIG11dGFibGUgZXhwcmVzc2lvbnMgaGVyZSwgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBwYXJzZUV4cHIuXG5cdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NlcnQ6IGNhc2UgS2V5d29yZHMuQXNzZXJ0Tm90OlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLZXl3b3Jkcy5Bc3NlcnROb3QsIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdERvOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VFeGNlcHQoS2V5d29yZHMuRXhjZXB0RG8sIHJlc3QpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKHRva2Vucy5sb2MpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrV2l0aFZhbDpcblx0XHRcdFx0cmV0dXJuIG5ldyBCcmVha1dpdGhWYWwodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5DYXNlRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWJ1Z2dlcjpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8odG9rZW5zLmxvYywgU3BlY2lhbERvcy5EZWJ1Z2dlcilcblx0XHRcdGNhc2UgS2V5d29yZHMuRGVsRG86XG5cdFx0XHRcdHJldHVybiBwYXJzZURlbChyZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5FbGxpcHNpczpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeU1hbnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3JEbzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRm9yRG8ocmVzdClcblx0XHRcdGNhc2UgS2V5d29yZHMuSWdub3JlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IElnbm9yZSh0b2tlbnMubG9jLCByZXN0Lm1hcChwYXJzZUxvY2FsTmFtZSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLklmRG86IGNhc2UgS2V5d29yZHMuVW5sZXNzRG86IHtcblx0XHRcdFx0Y29uc3QgW2JlZm9yZSwgYmxvY2tdID0gYmVmb3JlQW5kQmxvY2socmVzdClcblx0XHRcdFx0cmV0dXJuIG5ldyBDb25kaXRpb25hbERvKHRva2Vucy5sb2MsXG5cdFx0XHRcdFx0cGFyc2VFeHByKGJlZm9yZSksXG5cdFx0XHRcdFx0cGFyc2VCbG9ja0RvKGJsb2NrKSxcblx0XHRcdFx0XHRoZWFkLmtpbmQgPT09IEtleXdvcmRzLlVubGVzc0RvKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5PYmpBc3NpZ246XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkodG9rZW5zLmxvYywgcGFyc2VFeHByKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5QYXNzOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lc0Zyb21CbG9jayh0b2tlbnMpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN1cGVyRG86XG5cdFx0XHRcdHJldHVybiBuZXcgU3VwZXJDYWxsRG8odG9rZW5zLmxvYywgcGFyc2VFeHByUGFydHMocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaERvOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTd2l0Y2goZmFsc2UsIGZhbHNlLCByZXN0KVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaHJvdzpcblx0XHRcdFx0cmV0dXJuIG5ldyBUaHJvdyh0b2tlbnMubG9jLCBvcElmKCFyZXN0LmlzRW1wdHkoKSwgKCkgPT4gcGFyc2VFeHByKHJlc3QpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuTmFtZTpcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24sIHJlc3QuaGVhZCgpKSkge1xuXHRcdFx0XHRcdGNvbnN0IHIgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHZhbCA9IHIuaXNFbXB0eSgpID9cblx0XHRcdFx0XHRcdG5ldyBTcGVjaWFsVmFsKHRva2Vucy5sb2MsIFNwZWNpYWxWYWxzLk5hbWUpIDpcblx0XHRcdFx0XHRcdHBhcnNlRXhwcihyKVxuXHRcdFx0XHRcdHJldHVybiBPYmpFbnRyeVBsYWluLm5hbWUodG9rZW5zLmxvYywgdmFsKVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGVsc2UgZmFsbCB0aHJvdWdoXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQobGluZVNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCB0b2tlbnMubG9jKSxcblx0XHQoKSA9PiBwYXJzZUV4cHIodG9rZW5zKSlcbn1cblxuZXhwb3J0IGNvbnN0IHBhcnNlTGluZU9yTGluZXMgPSB0b2tlbnMgPT4ge1xuXHRjb25zdCBfID0gcGFyc2VMaW5lKHRva2Vucylcblx0cmV0dXJuIF8gaW5zdGFuY2VvZiBBcnJheSA/IF8gOiBbX11cbn1cblxuY29uc3QgbGluZVNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQXNzaWduLCBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlLCBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSwgS2V5d29yZHMuTWFwRW50cnksXG5cdEtleXdvcmRzLk9iakFzc2lnbiwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduTGlrZShiZWZvcmUsIGF0LCBhZnRlciwgbG9jKSB7XG5cdGNvbnN0IGtpbmQgPSBhdC5raW5kXG5cdGlmIChraW5kID09PSBLZXl3b3Jkcy5NYXBFbnRyeSlcblx0XHRyZXR1cm4gbmV3IE1hcEVudHJ5KGxvYywgcGFyc2VFeHByKGJlZm9yZSksIHBhcnNlRXhwcihhZnRlcikpXG5cblx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IGJlZm9yZS5oZWFkKClcblx0XHQvLyBgYS5iID0gY2AsIGAuYiA9IGNgLCBgYS5cImJcIiA9IGNgLCBgLlwiYlwiID0gY2AsIGBhW2JdID0gY2Bcblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbdmFsdWUsIG9wVHlwZV0gPSBpZkVsc2Uoc3BhY2VkLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIF8pKSxcblx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHRcdCgpID0+IFtzcGFjZWQsIG51bGxdKVxuXG5cdFx0XHRjb25zdCBsYXN0ID0gdmFsdWUubGFzdCgpXG5cdFx0XHRjb25zdCBvYmplY3QgPSBvYmogPT5cblx0XHRcdFx0b2JqLmlzRW1wdHkoKSA/IExvY2FsQWNjZXNzLnRoaXMob2JqLmxvYykgOiBwYXJzZVNwYWNlZChvYmopXG5cblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCB2YWx1ZS5uZXh0VG9MYXN0KCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZU1lbWJlck5hbWUobGFzdClcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KHZhbHVlLnJ0YWlsKCkucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBNZW1iZXJTZXQobG9jLCBzZXQsIG5hbWUsIG9wVHlwZSwgc2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpXG5cdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTdWJTZXQoc2V0LCBTbGljZS5ncm91cChsYXN0KSwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdH1cblx0XHQvLyBgXCIxXCIuIDFgXG5cdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5RdW90ZSwgdG9rZW4pICYmIGtpbmQgPT09IEtleXdvcmRzLk9iakFzc2lnbilcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIHBhcnNlUXVvdGUoU2xpY2UuZ3JvdXAodG9rZW4pKSwgcGFyc2VFeHByKGFmdGVyKSlcblx0fVxuXG5cdHJldHVybiBraW5kID09PSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSA/XG5cdFx0cGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRwYXJzZUFzc2lnbihiZWZvcmUsIGtpbmQsIGFmdGVyLCBsb2MpXG59XG5cbmZ1bmN0aW9uIHNldEtpbmQoa2V5d29yZCkge1xuXHRzd2l0Y2ggKGtleXdvcmQua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuQXNzaWduOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdFxuXHRcdGNhc2UgS2V5d29yZHMuQXNzaWduTXV0YWJsZTpcblx0XHRcdHJldHVybiBTZXR0ZXJzLkluaXRNdXRhYmxlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZTpcblx0XHRcdHJldHVybiBTZXR0ZXJzLk11dGF0ZVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR1bmV4cGVjdGVkKGtleXdvcmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VTdWJTZXQob2JqZWN0LCBzdWJiZWQsIG9wVHlwZSwgYXQsIGFmdGVyLCBsb2MpIHtcblx0Y29uc3Qgc3ViYmVkcyA9IHBhcnNlRXhwclBhcnRzKHN1YmJlZClcblx0cmV0dXJuIG5ldyBTZXRTdWIobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwgc2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpXG59XG5cbmZ1bmN0aW9uIHBhcnNlTG9jYWxNdXRhdGUobG9jYWxzVG9rZW5zLCB2YWx1ZVRva2VucywgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdGNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnKVxuXHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBuYW1lLCB2YWx1ZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ24obG9jYWxzVG9rZW5zLCBraW5kLCB2YWx1ZVRva2VucywgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cblx0Ly8gSGFuZGxlIGBhLmAgd2hpY2ggbW92ZXMgYW4gb3V0ZXIgbG9jYWwgaW50byBhbiBPYmpFbnRyeS5cblx0aWYgKGtpbmQgPT09IEtleXdvcmRzLk9iakFzc2lnbiAmJiB2YWx1ZVRva2Vucy5pc0VtcHR5KCkgJiYgbG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdGNvbnN0IGxvY2FsID0gbG9jYWxzWzBdXG5cdFx0Y2hlY2sobG9jYWwub3BUeXBlID09PSBudWxsLCBsb2NhbC5sb2MsICgpID0+XG5cdFx0XHRgVHlwZSBkZWNsYXJhdGlvbiBzaG91bGQgZ28gd2l0aCBpbml0aWFsIGRlY2xhcmF0aW9uIG9mICR7bG9jYWwubmFtZX0uYClcblx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5hY2Nlc3MobG9jLCBsb2NhbC5uYW1lKVxuXHR9XG5cblx0Y29uc3QgdmFsdWUgPSBwYXJzZUFzc2lnblZhbHVlKGtpbmQsIHZhbHVlVG9rZW5zKVxuXG5cdGNvbnN0IGlzWWllbGQgPSBraW5kID09PSBLZXl3b3Jkcy5ZaWVsZCB8fCBraW5kID09PSBLZXl3b3Jkcy5ZaWVsZFRvXG5cdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRjaGVjayhpc1lpZWxkLCBsb2NhbHNUb2tlbnMubG9jLCAnQXNzaWdubWVudCB0byBub3RoaW5nJylcblx0XHRyZXR1cm4gdmFsdWVcblx0fSBlbHNlIHtcblx0XHRpZiAoaXNZaWVsZClcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdGNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0NhbiBub3QgeWllbGQgdG8gbGF6eSB2YXJpYWJsZS4nKVxuXG5cdFx0Y29uc3QgaXNPYmpBc3NpZ24gPSBraW5kID09PSBLZXl3b3Jkcy5PYmpBc3NpZ25cblxuXHRcdGlmIChraW5kID09PSBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0Zm9yIChsZXQgXyBvZiBsb2NhbHMpIHtcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnTGF6eSBsb2NhbCBjYW4gbm90IGJlIG11dGFibGUuJylcblx0XHRcdFx0Xy5raW5kID0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0XHR9XG5cblx0XHRjb25zdCB3cmFwID0gXyA9PiBpc09iakFzc2lnbiA/IG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIF8pIDogX1xuXG5cdFx0aWYgKGxvY2Fscy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGNvbnN0IGFzc2lnbmVlID0gbG9jYWxzWzBdXG5cdFx0XHRjb25zdCBhc3NpZ24gPSBuZXcgQXNzaWduU2luZ2xlKGxvYywgYXNzaWduZWUsIHZhbHVlKVxuXHRcdFx0cmV0dXJuIHdyYXAoYXNzaWduKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdGNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0J0FsbCBsb2NhbHMgb2YgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IG11c3QgYmUgb2YgdGhlIHNhbWUga2luZC4nKVxuXHRcdFx0cmV0dXJuIHdyYXAobmV3IEFzc2lnbkRlc3RydWN0dXJlKGxvYywgbG9jYWxzLCB2YWx1ZSwga2luZCkpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpIHtcblx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuWWllbGQ6XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKHZhbHVlLmxvYywgdmFsdWUpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiB2YWx1ZVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzZXJ0KG5lZ2F0ZSwgdG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7a2V5d29yZE5hbWUoS2V5d29yZHMuQXNzZXJ0KX0uYClcblxuXHRjb25zdCBbY29uZFRva2Vucywgb3BUaHJvd25dID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlRocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cbiJdfQ==