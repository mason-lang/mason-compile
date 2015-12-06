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

	function parseLine(tokens) {
		const loc = tokens.loc;
		const head = tokens.head();

		const rest = () => tokens.tail();

		const noRest = () => {
			(0, _checks.checkEmpty)(rest(), 'unexpectedAfter', head);
		};

		if (head instanceof _Token.Keyword) switch (head.kind) {
			case _Token.Keywords.Assert:
			case _Token.Keywords.Forbid:
				return parseAssert(head.kind === _Token.Keywords.Forbid, rest());

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
				return (0, _util.ifElse)((0, _parse.opParseExpr)(rest()), _ => new _MsAst.Pass(tokens.loc, _), () => []);

			case _Token.Keywords.Region:
				return parseLines((0, _parseBlock.justBlock)(_Token.Keywords.Region, rest()));

			case _Token.Keywords.Throw:
				return new _MsAst.Throw(loc, (0, _parse.opParseExpr)(rest()));

			default:}
		return (0, _util.ifElse)(tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(lineSplitKeywords, _)), _ref => {
			let before = _ref.before;
			let at = _ref.at;
			let after = _ref.after;

			switch (at.kind) {
				case _Token.Keywords.MapEntry:
					return new _MsAst.MapEntry(loc, (0, _parse.parseExpr)(before), (0, _parse.parseExpr)(after));

				case _Token.Keywords.ObjAssign:
					return parseObjEntry(before, after, loc);

				default:
					return parseAssignLike(before, at, (0, _parse.parseExpr)(after), loc);
			}
		}, () => (0, _parse.parseExpr)(tokens));
	}

	const lineSplitKeywords = new Set([_Token.Keywords.Assign, _Token.Keywords.LocalMutate, _Token.Keywords.MapEntry, _Token.Keywords.ObjAssign]);

	function parseLines(lineTokens) {
		const lines = [];

		for (const line of lineTokens.slices()) {
			const _ = parseLine(line);

			if (_ instanceof Array) lines.push(..._);else lines.push(_);
		}

		return lines;
	}

	function parseAssignLike(before, at, value, loc) {
		const kind = at.kind;

		if (before.size() === 1) {
			const token = before.head();

			if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const spaced = _Slice2.default.group(token);

				var _ifElse = (0, _util.ifElse)(spaced.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Colon, _)), _ref2 => {
					let before = _ref2.before;
					let after = _ref2.after;
					return [before, (0, _parse.parseExpr)(after)];
				}, () => [spaced, null]);

				var _ifElse2 = _slicedToArray(_ifElse, 2);

				const assignee = _ifElse2[0];
				const opType = _ifElse2[1];
				const last = assignee.last();

				const object = obj => obj.isEmpty() ? _MsAst.LocalAccess.this(obj.loc) : (0, _parse.parseSpaced)(obj);

				if ((0, _Token.isKeyword)(_Token.Keywords.Dot, assignee.nextToLast())) {
					const name = (0, _parseMemberName2.default)(last);
					const set = object(assignee.rtail().rtail());
					return new _MsAst.MemberSet(loc, set, name, opType, setKind(at), value);
				} else if ((0, _Token.isGroup)(_Token.Groups.Bracket, last)) {
					const set = object(assignee.rtail());
					const subbeds = (0, _parse.parseExprParts)(_Slice2.default.group(last));
					return new _MsAst.SetSub(loc, set, subbeds, opType, setKind(at), value, loc);
				}
			}
		}

		return kind === _Token.Keywords.LocalMutate ? parseLocalMutate(before, value, loc) : parseAssign(before, kind, value, loc);
	}

	function parseObjEntry(before, after, loc) {
		if (before.size() === 1) {
			const token = before.head();
			const isName = (0, _Token.isKeyword)(_Token.Keywords.Name, token);

			const value = () => (0, _parse.parseExpr)(after);

			if (after.isEmpty()) return isName ? _MsAst.ObjEntryPlain.name(loc, new _MsAst.SpecialVal(loc, _MsAst.SpecialVals.Name)) : _MsAst.ObjEntryPlain.access(loc, (0, _parseLocalDeclares.parseLocalName)(token));else if (token instanceof _Token.Keyword) return new _MsAst.ObjEntryPlain(loc, (0, _Token.keywordName)(token.kind), value());else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return new _MsAst.ObjEntryPlain(loc, (0, _parseQuote2.default)(_Slice2.default.group(token)), value());else if ((0, _Token.isGroup)(_Token.Groups.Space, token)) {
				const slice = _Slice2.default.group(token);

				if (slice.size() === 2 && (0, _Token.isKeyword)(_Token.Keywords.Tick, slice.head())) {
					const name = new _MsAst.QuoteSimple(loc, (0, _parseName2.default)(slice.second()));
					return new _MsAst.ObjEntryPlain(loc, name, value());
				}
			}
		}

		const assign = parseAssign(before, _Token.Keywords.ObjAssign, (0, _parse.parseExpr)(after), loc);
		return new _MsAst.ObjEntryAssign(loc, assign);
	}

	function setKind(keyword) {
		switch (keyword.kind) {
			case _Token.Keywords.Assign:
				return _MsAst.Setters.Init;

			case _Token.Keywords.LocalMutate:
				return _MsAst.Setters.Mutate;

			default:
				(0, _checks.unexpected)(keyword);
		}
	}

	function parseLocalMutate(localsTokens, value, loc) {
		const locals = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(localsTokens);
		(0, _context.check)(locals.length === 1, loc, 'todoMutateDestructure');
		return new _MsAst.LocalMutate(loc, locals[0].name, value);
	}

	function parseAssign(localsTokens, kind, value, loc) {
		const locals = (0, _parseLocalDeclares2.default)(localsTokens);
		if (locals.length === 1) return new _MsAst.AssignSingle(loc, locals[0], value);else {
			(0, _context.check)(locals.length > 1, localsTokens.loc, 'assignNothing');
			const kind = locals[0].kind;

			for (const _ of locals) (0, _context.check)(_.kind === kind, _.loc, 'destructureAllLazy');

			return new _MsAst.AssignDestructure(loc, locals, value, kind);
		}
	}

	function parseAssert(negate, tokens) {
		(0, _checks.checkNonEmpty)(tokens, 'expectedAfterAssert');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBZ0J3QixTQUFTO1NBbURqQixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFuREYsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQW1EakIsVUFBVSIsImZpbGUiOiJwYXJzZUxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnblNpbmdsZSwgQXNzaWduRGVzdHJ1Y3R1cmUsIEJhZ0VudHJ5LCBCcmVhaywgQ2FsbCwgSWdub3JlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxNdXRhdGUsIE1hcEVudHJ5LCBNZW1iZXJTZXQsIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeVBsYWluLCBQYXNzLCBRdW90ZVNpbXBsZSwgU2V0U3ViLFxuXHRTZXR0ZXJzLCBTcGVjaWFsRG8sIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWwsIFNwZWNpYWxWYWxzLCBUaHJvd30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmQsIGtleXdvcmROYW1lLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2p1c3RCbG9ja30gZnJvbSAnLi9wYXJzZUJsb2NrJ1xuaW1wb3J0IHBhcnNlTG9jYWxEZWNsYXJlcywge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcywgcGFyc2VMb2NhbE5hbWV9IGZyb20gJy4vcGFyc2VMb2NhbERlY2xhcmVzJ1xuaW1wb3J0IHBhcnNlTWVtYmVyTmFtZSBmcm9tICcuL3BhcnNlTWVtYmVyTmFtZSdcbmltcG9ydCBwYXJzZU5hbWUgZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgcGFyc2VRdW90ZSBmcm9tICcuL3BhcnNlUXVvdGUnXG5pbXBvcnQge29wUGFyc2VFeHByLCBwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqIFBhcnNlIHRoZSBjb250ZW50IG9mIGEgbGluZS4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTGluZSh0b2tlbnMpIHtcblx0Y29uc3QgbG9jID0gdG9rZW5zLmxvY1xuXHRjb25zdCBoZWFkID0gdG9rZW5zLmhlYWQoKVxuXHRjb25zdCByZXN0ID0gKCkgPT4gdG9rZW5zLnRhaWwoKVxuXG5cdGNvbnN0IG5vUmVzdCA9ICgpID0+IHtcblx0XHRjaGVja0VtcHR5KHJlc3QoKSwgJ3VuZXhwZWN0ZWRBZnRlcicsIGhlYWQpXG5cdH1cblxuXHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdGNhc2UgS2V5d29yZHMuQXNzZXJ0OiBjYXNlIEtleXdvcmRzLkZvcmJpZDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS2V5d29yZHMuRm9yYmlkLCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKGxvYywgb3BQYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuRGVidWdnZXI6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKGxvYywgU3BlY2lhbERvcy5EZWJ1Z2dlcilcblx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpLCB0cnVlKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZ25vcmU6XG5cdFx0XHRcdHJldHVybiBuZXcgSWdub3JlKGxvYywgcmVzdCgpLm1hcChwYXJzZUxvY2FsTmFtZSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5QYXNzOlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wUGFyc2VFeHByKHJlc3QoKSksIF8gPT4gbmV3IFBhc3ModG9rZW5zLmxvYywgXyksICgpID0+IFtdKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzKGp1c3RCbG9jayhLZXl3b3Jkcy5SZWdpb24sIHJlc3QoKSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlRocm93OlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRocm93KGxvYywgb3BQYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdH1cblxuXHRyZXR1cm4gaWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzQW55S2V5d29yZChsaW5lU3BsaXRLZXl3b3JkcywgXykpLFxuXHRcdCh7YmVmb3JlLCBhdCwgYWZ0ZXJ9KSA9PiB7XG5cdFx0XHRzd2l0Y2ggKGF0LmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5NYXBFbnRyeTpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IE1hcEVudHJ5KGxvYywgcGFyc2VFeHByKGJlZm9yZSksIHBhcnNlRXhwcihhZnRlcikpXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuT2JqQXNzaWduOlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZU9iakVudHJ5KGJlZm9yZSwgYWZ0ZXIsIGxvYylcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIHBhcnNlRXhwcihhZnRlciksIGxvYylcblx0XHRcdH1cblx0XHR9LFxuXHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuY29uc3QgbGluZVNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFxuXHRbS2V5d29yZHMuQXNzaWduLCBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSwgS2V5d29yZHMuTWFwRW50cnksIEtleXdvcmRzLk9iakFzc2lnbl0pXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxpbmVzKGxpbmVUb2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBbXVxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZVRva2Vucy5zbGljZXMoKSkge1xuXHRcdGNvbnN0IF8gPSBwYXJzZUxpbmUobGluZSlcblx0XHRpZiAoXyBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0bGluZXMucHVzaCguLi5fKVxuXHRcdGVsc2Vcblx0XHRcdGxpbmVzLnB1c2goXylcblx0fVxuXHRyZXR1cm4gbGluZXNcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIHZhbHVlLCBsb2MpIHtcblx0Y29uc3Qga2luZCA9IGF0LmtpbmRcblxuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdC8vIGBhLmIgPSBjYCwgYC5iID0gY2AsIGBhLlwiYlwiID0gY2AsIGAuXCJiXCIgPSBjYCwgYGFbYl0gPSBjYDsgYW5kIHRoZWlyIGA6PWAgdmFyaWFudHMuXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNwYWNlZCA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgW2Fzc2lnbmVlLCBvcFR5cGVdID0gaWZFbHNlKHNwYWNlZC5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5Db2xvbiwgXykpLFxuXHRcdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdFx0KCkgPT4gW3NwYWNlZCwgbnVsbF0pXG5cblx0XHRcdGNvbnN0IGxhc3QgPSBhc3NpZ25lZS5sYXN0KClcblx0XHRcdGNvbnN0IG9iamVjdCA9IG9iaiA9PlxuXHRcdFx0XHRvYmouaXNFbXB0eSgpID8gTG9jYWxBY2Nlc3MudGhpcyhvYmoubG9jKSA6IHBhcnNlU3BhY2VkKG9iailcblxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIGFzc2lnbmVlLm5leHRUb0xhc3QoKSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTWVtYmVyTmFtZShsYXN0KVxuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QoYXNzaWduZWUucnRhaWwoKS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlclNldChsb2MsIHNldCwgbmFtZSwgb3BUeXBlLCBzZXRLaW5kKGF0KSwgdmFsdWUpXG5cdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdChhc3NpZ25lZS5ydGFpbCgpKVxuXHRcdFx0XHRjb25zdCBzdWJiZWRzID0gcGFyc2VFeHByUGFydHMoU2xpY2UuZ3JvdXAobGFzdCkpXG5cdFx0XHRcdHJldHVybiBuZXcgU2V0U3ViKGxvYywgc2V0LCBzdWJiZWRzLCBvcFR5cGUsIHNldEtpbmQoYXQpLCB2YWx1ZSwgbG9jKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBraW5kID09PSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSA/XG5cdFx0cGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIHZhbHVlLCBsb2MpIDpcblx0XHRwYXJzZUFzc2lnbihiZWZvcmUsIGtpbmQsIHZhbHVlLCBsb2MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKSB7XG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Y29uc3QgaXNOYW1lID0gaXNLZXl3b3JkKEtleXdvcmRzLk5hbWUsIHRva2VuKVxuXHRcdGNvbnN0IHZhbHVlID0gKCkgPT4gcGFyc2VFeHByKGFmdGVyKVxuXG5cdFx0Ly8gSGFuZGxlIGBhLmAgd2hpY2ggbW92ZXMgYW4gb3V0ZXIgbG9jYWwgaW50byBhbiBPYmpFbnRyeS5cblx0XHRpZiAoYWZ0ZXIuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIGlzTmFtZSA/XG5cdFx0XHRcdE9iakVudHJ5UGxhaW4ubmFtZShsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuTmFtZSkpIDpcblx0XHRcdFx0T2JqRW50cnlQbGFpbi5hY2Nlc3MobG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywga2V5d29yZE5hbWUodG9rZW4ua2luZCksIHZhbHVlKCkpXG5cdFx0Ly8gYFwiMVwiLiAxYFxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlF1b3RlLCB0b2tlbikpXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSksIHZhbHVlKCkpXG5cdFx0Ly8gJ2Zvby4gMVxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRpZiAoc2xpY2Uuc2l6ZSgpID09PSAyICYmIGlzS2V5d29yZChLZXl3b3Jkcy5UaWNrLCBzbGljZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgUXVvdGVTaW1wbGUobG9jLCBwYXJzZU5hbWUoc2xpY2Uuc2Vjb25kKCkpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCB2YWx1ZSgpKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFzc2lnbiA9IHBhcnNlQXNzaWduKGJlZm9yZSwgS2V5d29yZHMuT2JqQXNzaWduLCBwYXJzZUV4cHIoYWZ0ZXIpLCBsb2MpXG5cdHJldHVybiBuZXcgT2JqRW50cnlBc3NpZ24obG9jLCBhc3NpZ24pXG59XG5cbmZ1bmN0aW9uIHNldEtpbmQoa2V5d29yZCkge1xuXHRzd2l0Y2ggKGtleXdvcmQua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuQXNzaWduOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdFxuXHRcdGNhc2UgS2V5d29yZHMuTG9jYWxNdXRhdGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5NdXRhdGVcblx0XHRkZWZhdWx0OlxuXHRcdFx0dW5leHBlY3RlZChrZXl3b3JkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlTG9jYWxNdXRhdGUobG9jYWxzVG9rZW5zLCB2YWx1ZSwgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdGNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ3RvZG9NdXRhdGVEZXN0cnVjdHVyZScpXG5cdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBsb2NhbHNbMF0ubmFtZSwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduKGxvY2Fsc1Rva2Vucywga2luZCwgdmFsdWUsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXMobG9jYWxzVG9rZW5zKVxuXHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSlcblx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIGxvY2Fsc1swXSwgdmFsdWUpXG5cdGVsc2Uge1xuXHRcdGNoZWNrKGxvY2Fscy5sZW5ndGggPiAxLCBsb2NhbHNUb2tlbnMubG9jLCAnYXNzaWduTm90aGluZycpXG5cdFx0Y29uc3Qga2luZCA9IGxvY2Fsc1swXS5raW5kXG5cdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdGNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsICdkZXN0cnVjdHVyZUFsbExhenknKVxuXHRcdHJldHVybiBuZXcgQXNzaWduRGVzdHJ1Y3R1cmUobG9jLCBsb2NhbHMsIHZhbHVlLCBraW5kKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzZXJ0KG5lZ2F0ZSwgdG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAnZXhwZWN0ZWRBZnRlckFzc2VydCcpXG5cdGNvbnN0IFtjb25kVG9rZW5zLCBvcFRocm93bl0gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuVGhyb3csIF8pKSxcblx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0KCkgPT4gW3Rva2VucywgbnVsbF0pXG5cblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhjb25kVG9rZW5zKVxuXHRjb25zdCBjb25kID0gcGFydHMubGVuZ3RoID09PSAxID8gcGFydHNbMF0gOiBuZXcgQ2FsbChjb25kVG9rZW5zLmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRyZXR1cm4gbmV3IEFzc2VydCh0b2tlbnMubG9jLCBuZWdhdGUsIGNvbmQsIG9wVGhyb3duKVxufVxuIl19