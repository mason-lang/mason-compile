'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseLocalDeclares', './parseMemberName', './parseName', './parseQuote', './parse*', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseLocalDeclares'), require('./parseMemberName'), require('./parseName'), require('./parseQuote'), require('./parse*'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseLocalDeclares, global.parseMemberName, global.parseName, global.parseQuote, global.parse, global.Slice);
		global.parseLine = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseLocalDeclares, _parseMemberName, _parseName, _parseQuote, _parse, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseLine;
	exports.parseLines = parseLines;

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

			case _Token.Keywords.Break:
				return new _MsAst.Break(loc, (0, _parse.opParseExpr)(rest()));

			case _Token.Keywords.Debugger:
				noRest();
				return new _MsAst.SpecialDo(loc, _MsAst.SpecialDos.Debugger);

			case _Token.Keywords.Dot3:
				return new _MsAst.BagEntry(loc, (0, _parse.parseExpr)(rest()), true);

			case _Token.Keywords.Ignore:
				return new _MsAst.Ignore(loc, rest().map(_parseLocalDeclares.parseLocalName));

			case _Token.Keywords.ObjAssign:
				return new _MsAst.BagEntry(loc, (0, _parse.parseExpr)(rest()));

			case _Token.Keywords.Pass:
				noRest();
				return [];

			case _Token.Keywords.Region:
				return parseLines((0, _parseBlock.justBlock)(_Token.Keywords.Region, rest()));

			case _Token.Keywords.Throw:
				return new _MsAst.Throw(loc, (0, _parse.opParseExpr)(rest()));

			default:}
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(lineSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;
			return parseAssignLike(before, at, after, loc);
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const lineSplitKeywords = new Set([_Token.Keywords.Assign, _Token.Keywords.AssignMutable, _Token.Keywords.LocalMutate, _Token.Keywords.MapEntry, _Token.Keywords.ObjAssign, _Token.Keywords.Yield, _Token.Keywords.YieldTo]);

	function parseLines(lineTokens) {
		const lines = [];

		for (const line of lineTokens.slices()) {
			const _ = parseLine(line);

			if (_ instanceof Array) lines.push(..._);else lines.push(_);
		}

		return lines;
	}

	function parseAssignLike(before, at, after, loc) {
		const kind = at.kind;
		if (kind === _Token.Keywords.MapEntry) return new _MsAst.MapEntry(loc, (0, _parse.parseExpr)(before), (0, _parse.parseExpr)(after));else if (kind === _Token.Keywords.ObjAssign) return parseObjEntry(before, after, loc);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBNkNqQixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7Ozs7OztVQTdDRixTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBNkNqQixVQUFVIiwiZmlsZSI6InBhcnNlTGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2VydCwgQXNzaWduU2luZ2xlLCBBc3NpZ25EZXN0cnVjdHVyZSwgQmFnRW50cnksIEJyZWFrLCBDYWxsLCBJZ25vcmUsIExvY2FsQWNjZXNzLFxuXHRMb2NhbERlY2xhcmVzLCBMb2NhbE11dGF0ZSwgTWFwRW50cnksIE1lbWJlclNldCwgT2JqRW50cnlBc3NpZ24sIE9iakVudHJ5UGxhaW4sIFF1b3RlU2ltcGxlLFxuXHRTZXRTdWIsIFNldHRlcnMsIFNwZWNpYWxEbywgU3BlY2lhbERvcywgU3BlY2lhbFZhbCwgU3BlY2lhbFZhbHMsIFRocm93LCBZaWVsZCwgWWllbGRUb1xuXHR9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBrZXl3b3JkTmFtZSwgS2V5d29yZHMsIHNob3dLZXl3b3JkXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcywgcGFyc2VMb2NhbE5hbWV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTWVtYmVyTmFtZSBmcm9tICcuL3BhcnNlTWVtYmVyTmFtZSdcbmltcG9ydCBwYXJzZU5hbWUgZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgcGFyc2VRdW90ZSBmcm9tICcuL3BhcnNlUXVvdGUnXG5pbXBvcnQge29wUGFyc2VFeHByLCBwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqIFBhcnNlIHRoZSBjb250ZW50IG9mIGEgbGluZS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTGluZSh0b2tlbnMpIHtcblx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRjb25zdCByZXN0ID0gKCkgPT4gdG9rZW5zLnRhaWwoKVxuXG5cdGNvbnN0IG5vUmVzdCA9ICgpID0+IHtcblx0XHRjaGVja0VtcHR5KHJlc3QoKSwgKCkgPT4gYERpZCBub3QgZXhwZWN0IGFueXRoaW5nIGFmdGVyICR7aGVhZH0uYClcblx0fVxuXG5cdC8vIFdlIG9ubHkgZGVhbCB3aXRoIG11dGFibGUgZXhwcmVzc2lvbnMgaGVyZSwgb3RoZXJ3aXNlIHdlIGZhbGwgYmFjayB0byBwYXJzZUV4cHIuXG5cdGlmIChoZWFkIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGhlYWQua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NlcnQ6IGNhc2UgS2V5d29yZHMuQXNzZXJ0Tm90OlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NlcnQoaGVhZC5raW5kID09PSBLZXl3b3Jkcy5Bc3NlcnROb3QsIHJlc3QoKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuQnJlYWs6XG5cdFx0XHRcdHJldHVybiBuZXcgQnJlYWsobG9jLCBvcFBhcnNlRXhwcihyZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5EZWJ1Z2dlcjpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGVjaWFsRG8obG9jLCBTcGVjaWFsRG9zLkRlYnVnZ2VyKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5KGxvYywgcGFyc2VFeHByKHJlc3QoKSksIHRydWUpXG5cdFx0XHRjYXNlIEtleXdvcmRzLklnbm9yZTpcblx0XHRcdFx0cmV0dXJuIG5ldyBJZ25vcmUobG9jLCByZXN0KCkubWFwKHBhcnNlTG9jYWxOYW1lKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuT2JqQXNzaWduOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJhZ0VudHJ5KGxvYywgcGFyc2VFeHByKHJlc3QoKSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlBhc3M6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzKGp1c3RCbG9jayhLZXl3b3Jkcy5SZWdpb24sIHJlc3QoKSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlRocm93OlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRocm93KGxvYywgb3BQYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdH1cblxuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChsaW5lU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYyksXG5cdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5jb25zdCBsaW5lU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoW1xuXHRLZXl3b3Jkcy5Bc3NpZ24sIEtleXdvcmRzLkFzc2lnbk11dGFibGUsIEtleXdvcmRzLkxvY2FsTXV0YXRlLCBLZXl3b3Jkcy5NYXBFbnRyeSxcblx0S2V5d29yZHMuT2JqQXNzaWduLCBLZXl3b3Jkcy5ZaWVsZCwgS2V5d29yZHMuWWllbGRUb1xuXSlcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGluZXMobGluZVRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IFtdXG5cdGZvciAoY29uc3QgbGluZSBvZiBsaW5lVG9rZW5zLnNsaWNlcygpKSB7XG5cdFx0Y29uc3QgXyA9IHBhcnNlTGluZShsaW5lKVxuXHRcdGlmIChfIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRsaW5lcy5wdXNoKC4uLl8pXG5cdFx0ZWxzZVxuXHRcdFx0bGluZXMucHVzaChfKVxuXHR9XG5cdHJldHVybiBsaW5lc1xufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBraW5kID0gYXQua2luZFxuXHRpZiAoa2luZCA9PT0gS2V5d29yZHMuTWFwRW50cnkpXG5cdFx0cmV0dXJuIG5ldyBNYXBFbnRyeShsb2MsIHBhcnNlRXhwcihiZWZvcmUpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXHRlbHNlIGlmIChraW5kID09PSBLZXl3b3Jkcy5PYmpBc3NpZ24pXG5cdFx0cmV0dXJuIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKVxuXG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Ly8gYGEuYiA9IGNgLCBgLmIgPSBjYCwgYGEuXCJiXCIgPSBjYCwgYC5cImJcIiA9IGNgLCBgYVtiXSA9IGNgXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNwYWNlZCA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgW3ZhbHVlLCBvcFR5cGVdID0gaWZFbHNlKHNwYWNlZC5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBfKSksXG5cdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0XHQoKSA9PiBbc3BhY2VkLCBudWxsXSlcblxuXHRcdFx0Y29uc3QgbGFzdCA9IHZhbHVlLmxhc3QoKVxuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gb2JqID0+XG5cdFx0XHRcdG9iai5pc0VtcHR5KCkgPyBMb2NhbEFjY2Vzcy50aGlzKG9iai5sb2MpIDogcGFyc2VTcGFjZWQob2JqKVxuXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdmFsdWUubmV4dFRvTGFzdCgpKSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKGxhc3QpXG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyU2V0KGxvYywgc2V0LCBuYW1lLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXHRcdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5CcmFja2V0LCBsYXN0KSkge1xuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QodmFsdWUucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3ViU2V0KHNldCwgU2xpY2UuZ3JvdXAobGFzdCksIG9wVHlwZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGtpbmQgPT09IEtleXdvcmRzLkxvY2FsTXV0YXRlID9cblx0XHRwYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdHBhcnNlQXNzaWduKGJlZm9yZSwga2luZCwgYWZ0ZXIsIGxvYylcbn1cblxuZnVuY3Rpb24gcGFyc2VPYmpFbnRyeShiZWZvcmUsIGFmdGVyLCBsb2MpIHtcblx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IGJlZm9yZS5oZWFkKClcblx0XHRjb25zdCBpc05hbWUgPSBpc0tleXdvcmQoS2V5d29yZHMuTmFtZSwgdG9rZW4pXG5cdFx0Y29uc3QgdmFsdWUgPSAoKSA9PiBwYXJzZUV4cHIoYWZ0ZXIpXG5cblx0XHQvLyBIYW5kbGUgYGEuYCB3aGljaCBtb3ZlcyBhbiBvdXRlciBsb2NhbCBpbnRvIGFuIE9iakVudHJ5LlxuXHRcdGlmIChhZnRlci5pc0VtcHR5KCkpXG5cdFx0XHRpZiAoaXNOYW1lKVxuXHRcdFx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5uYW1lKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5OYW1lKSlcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmV0dXJuIE9iakVudHJ5UGxhaW4uYWNjZXNzKGxvYywgcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXHRcdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIGtleXdvcmROYW1lKHRva2VuLmtpbmQpLCB2YWx1ZSgpKVxuXHRcdC8vIGBcIjFcIi4gMWBcblx0XHRlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5RdW90ZSwgdG9rZW4pKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgcGFyc2VRdW90ZShTbGljZS5ncm91cCh0b2tlbikpLCB2YWx1ZSgpKVxuXHRcdC8vICdmb28uIDFcblx0XHRlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0aWYgKHNsaWNlLnNpemUoKSA9PT0gMiAmJiBpc0tleXdvcmQoS2V5d29yZHMuVGljaywgc2xpY2UuaGVhZCgpKSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gbmV3IFF1b3RlU2ltcGxlKGxvYywgcGFyc2VOYW1lKHNsaWNlLnNlY29uZCgpKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgbmFtZSwgdmFsdWUoKSlcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBhc3NpZ24gPSBwYXJzZUFzc2lnbihiZWZvcmUsIEtleXdvcmRzLk9iakFzc2lnbiwgYWZ0ZXIsIGxvYylcblx0cmV0dXJuIG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIGFzc2lnbilcbn1cblxuZnVuY3Rpb24gc2V0S2luZChrZXl3b3JkKSB7XG5cdHN3aXRjaCAoa2V5d29yZC5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ246XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdE11dGFibGVcblx0XHRjYXNlIEtleXdvcmRzLkxvY2FsTXV0YXRlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuTXV0YXRlXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHVuZXhwZWN0ZWQoa2V5d29yZClcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVN1YlNldChvYmplY3QsIHN1YmJlZCwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBzdWJiZWRzID0gcGFyc2VFeHByUGFydHMoc3ViYmVkKVxuXHRyZXR1cm4gbmV3IFNldFN1Yihsb2MsIG9iamVjdCwgc3ViYmVkcywgb3BUeXBlLCBzZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VMb2NhbE11dGF0ZShsb2NhbHNUb2tlbnMsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0Y2hlY2sobG9jYWxzLmxlbmd0aCA9PT0gMSwgbG9jLCAnVE9ETzogTG9jYWxEZXN0cnVjdHVyZU11dGF0ZScpXG5cdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0cmV0dXJuIG5ldyBMb2NhbE11dGF0ZShsb2MsIG5hbWUsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbihsb2NhbHNUb2tlbnMsIGtpbmQsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2Vucylcblx0Y29uc3QgdmFsdWUgPSBwYXJzZUFzc2lnblZhbHVlKGtpbmQsIHZhbHVlVG9rZW5zKVxuXG5cdGNvbnN0IGlzWWllbGQgPSBraW5kID09PSBLZXl3b3Jkcy5ZaWVsZCB8fCBraW5kID09PSBLZXl3b3Jkcy5ZaWVsZFRvXG5cdGlmIChpc0VtcHR5KGxvY2FscykpIHtcblx0XHRjaGVjayhpc1lpZWxkLCBsb2NhbHNUb2tlbnMubG9jLCAnQXNzaWdubWVudCB0byBub3RoaW5nJylcblx0XHRyZXR1cm4gdmFsdWVcblx0fSBlbHNlIHtcblx0XHRpZiAoaXNZaWVsZClcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdGNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0NhbiBub3QgeWllbGQgdG8gbGF6eSB2YXJpYWJsZS4nKVxuXG5cdFx0aWYgKGtpbmQgPT09IEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRmb3IgKGxldCBfIG9mIGxvY2Fscykge1xuXHRcdFx0XHRjaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRfLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHRcdH1cblxuXHRcdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKVxuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25TaW5nbGUobG9jLCBsb2NhbHNbMF0sIHZhbHVlKVxuXHRcdGVsc2Uge1xuXHRcdFx0Y29uc3Qga2luZCA9IGxvY2Fsc1swXS5raW5kXG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRjaGVjayhfLmtpbmQgPT09IGtpbmQsIF8ubG9jLFxuXHRcdFx0XHRcdCdBbGwgbG9jYWxzIG9mIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBtdXN0IGJlIG9mIHRoZSBzYW1lIGtpbmQuJylcblx0XHRcdHJldHVybiBuZXcgQXNzaWduRGVzdHJ1Y3R1cmUobG9jLCBsb2NhbHMsIHZhbHVlLCBraW5kKVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnblZhbHVlKGtpbmQsIHZhbHVlVG9rZW5zKSB7XG5cdGNvbnN0IHZhbHVlID0gKCkgPT4gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRjb25zdCBvcFZhbHVlID0gKCkgPT4gb3BQYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuWWllbGQ6XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkKHZhbHVlVG9rZW5zLmxvYywgb3BWYWx1ZSgpKVxuXHRcdGNhc2UgS2V5d29yZHMuWWllbGRUbzpcblx0XHRcdHJldHVybiBuZXcgWWllbGRUbyh2YWx1ZVRva2Vucy5sb2MsIG9wVmFsdWUoKSlcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHZhbHVlKClcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2VydChuZWdhdGUsIHRva2Vucykge1xuXHRjaGVja05vbkVtcHR5KHRva2VucywgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkFzc2VydCl9LmApXG5cblx0Y29uc3QgW2NvbmRUb2tlbnMsIG9wVGhyb3duXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UaHJvdywgXykpLFxuXHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHQoKSA9PiBbdG9rZW5zLCBudWxsXSlcblxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGNvbmRUb2tlbnMpXG5cdGNvbnN0IGNvbmQgPSBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IG5ldyBDYWxsKGNvbmRUb2tlbnMubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdHJldHVybiBuZXcgQXNzZXJ0KHRva2Vucy5sb2MsIG5lZ2F0ZSwgY29uZCwgb3BUaHJvd24pXG59XG4iXX0=