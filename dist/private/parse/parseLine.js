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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBZ0J3QixTQUFTO1NBb0RqQixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFwREYsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFvRGpCLFVBQVUiLCJmaWxlIjoicGFyc2VMaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVja30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QXNzZXJ0LCBBc3NpZ25TaW5nbGUsIEFzc2lnbkRlc3RydWN0dXJlLCBCYWdFbnRyeSwgQnJlYWssIENhbGwsIElnbm9yZSwgTG9jYWxBY2Nlc3MsXG5cdExvY2FsTXV0YXRlLCBNYXBFbnRyeSwgTWVtYmVyU2V0LCBPYmpFbnRyeUFzc2lnbiwgT2JqRW50cnlQbGFpbiwgUXVvdGVTaW1wbGUsIFNldFN1YiwgU2V0dGVycyxcblx0U3BlY2lhbERvLCBTcGVjaWFsRG9zLCBTcGVjaWFsVmFsLCBTcGVjaWFsVmFscywgVGhyb3d9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzQW55S2V5d29yZCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBrZXl3b3JkTmFtZSwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMsIHBhcnNlTG9jYWxOYW1lfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSB0aGUgY29udGVudCBvZiBhIGxpbmUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxpbmUodG9rZW5zKSB7XG5cdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0Y29uc3QgcmVzdCA9ICgpID0+IHRva2Vucy50YWlsKClcblxuXHRjb25zdCBub1Jlc3QgPSAoKSA9PiB7XG5cdFx0Y2hlY2tFbXB0eShyZXN0KCksICd1bmV4cGVjdGVkQWZ0ZXInLCBoZWFkKVxuXHR9XG5cblx0Ly8gV2Ugb25seSBkZWFsIHdpdGggbXV0YWJsZSBleHByZXNzaW9ucyBoZXJlLCBvdGhlcndpc2Ugd2UgZmFsbCBiYWNrIHRvIHBhcnNlRXhwci5cblx0aWYgKGhlYWQgaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAoaGVhZC5raW5kKSB7XG5cdFx0XHRjYXNlIEtleXdvcmRzLkFzc2VydDogY2FzZSBLZXl3b3Jkcy5Gb3JiaWQ6XG5cdFx0XHRcdHJldHVybiBwYXJzZUFzc2VydChoZWFkLmtpbmQgPT09IEtleXdvcmRzLkZvcmJpZCwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5CcmVhazpcblx0XHRcdFx0cmV0dXJuIG5ldyBCcmVhayhsb2MsIG9wUGFyc2VFeHByKHJlc3QoKSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRlYnVnZ2VyOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyhsb2MsIFNwZWNpYWxEb3MuRGVidWdnZXIpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkobG9jLCBwYXJzZUV4cHIocmVzdCgpKSwgdHJ1ZSlcblx0XHRcdGNhc2UgS2V5d29yZHMuSWdub3JlOlxuXHRcdFx0XHRyZXR1cm4gbmV3IElnbm9yZShsb2MsIHJlc3QoKS5tYXAocGFyc2VMb2NhbE5hbWUpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5PYmpBc3NpZ246XG5cdFx0XHRcdHJldHVybiBuZXcgQmFnRW50cnkobG9jLCBwYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuUGFzczpcblx0XHRcdFx0bm9SZXN0KClcblx0XHRcdFx0cmV0dXJuIFtdXG5cdFx0XHRjYXNlIEtleXdvcmRzLlJlZ2lvbjpcblx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZXMoanVzdEJsb2NrKEtleXdvcmRzLlJlZ2lvbiwgcmVzdCgpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuVGhyb3c6XG5cdFx0XHRcdHJldHVybiBuZXcgVGhyb3cobG9jLCBvcFBhcnNlRXhwcihyZXN0KCkpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0fVxuXG5cdHJldHVybiBpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGxpbmVTcGxpdEtleXdvcmRzLCBfKSksXG5cdFx0KHtiZWZvcmUsIGF0LCBhZnRlcn0pID0+IHtcblx0XHRcdHN3aXRjaCAoYXQua2luZCkge1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLk1hcEVudHJ5OlxuXHRcdFx0XHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5PYmpBc3NpZ246XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgcGFyc2VFeHByKGFmdGVyKSwgbG9jKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KCkgPT4gcGFyc2VFeHByKHRva2VucykpXG59XG5jb25zdCBsaW5lU3BsaXRLZXl3b3JkcyA9IG5ldyBTZXQoXG5cdFtLZXl3b3Jkcy5Bc3NpZ24sIEtleXdvcmRzLkxvY2FsTXV0YXRlLCBLZXl3b3Jkcy5NYXBFbnRyeSwgS2V5d29yZHMuT2JqQXNzaWduXSlcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGluZXMobGluZVRva2Vucykge1xuXHRjb25zdCBsaW5lcyA9IFtdXG5cdGZvciAoY29uc3QgbGluZSBvZiBsaW5lVG9rZW5zLnNsaWNlcygpKSB7XG5cdFx0Y29uc3QgXyA9IHBhcnNlTGluZShsaW5lKVxuXHRcdGlmIChfIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRsaW5lcy5wdXNoKC4uLl8pXG5cdFx0ZWxzZVxuXHRcdFx0bGluZXMucHVzaChfKVxuXHR9XG5cdHJldHVybiBsaW5lc1xufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgdmFsdWUsIGxvYykge1xuXHRjb25zdCBraW5kID0gYXQua2luZFxuXG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Ly8gYGEuYiA9IGNgLCBgLmIgPSBjYCwgYGEuXCJiXCIgPSBjYCwgYC5cImJcIiA9IGNgLCBgYVtiXSA9IGNgOyBhbmQgdGhlaXIgYDo9YCB2YXJpYW50cy5cblx0XHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc3BhY2VkID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRjb25zdCBbYXNzaWduZWUsIG9wVHlwZV0gPSBpZkVsc2Uoc3BhY2VkLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLkNvbG9uLCBfKSksXG5cdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0XHQoKSA9PiBbc3BhY2VkLCBudWxsXSlcblxuXHRcdFx0Y29uc3QgbGFzdCA9IGFzc2lnbmVlLmxhc3QoKVxuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gb2JqID0+XG5cdFx0XHRcdG9iai5pc0VtcHR5KCkgPyBMb2NhbEFjY2Vzcy50aGlzKG9iai5sb2MpIDogcGFyc2VTcGFjZWQob2JqKVxuXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgYXNzaWduZWUubmV4dFRvTGFzdCgpKSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKGxhc3QpXG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdChhc3NpZ25lZS5ydGFpbCgpLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyU2V0KGxvYywgc2V0LCBuYW1lLCBvcFR5cGUsIHNldEtpbmQoYXQpLCB2YWx1ZSlcblx0XHRcdH0gZWxzZSBpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KGFzc2lnbmVlLnJ0YWlsKCkpXG5cdFx0XHRcdGNvbnN0IHN1YmJlZHMgPSBwYXJzZUV4cHJQYXJ0cyhTbGljZS5ncm91cChsYXN0KSlcblx0XHRcdFx0cmV0dXJuIG5ldyBTZXRTdWIobG9jLCBzZXQsIHN1YmJlZHMsIG9wVHlwZSwgc2V0S2luZChhdCksIHZhbHVlLCBsb2MpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGtpbmQgPT09IEtleXdvcmRzLkxvY2FsTXV0YXRlID9cblx0XHRwYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgdmFsdWUsIGxvYykgOlxuXHRcdHBhcnNlQXNzaWduKGJlZm9yZSwga2luZCwgdmFsdWUsIGxvYylcbn1cblxuZnVuY3Rpb24gcGFyc2VPYmpFbnRyeShiZWZvcmUsIGFmdGVyLCBsb2MpIHtcblx0aWYgKGJlZm9yZS5zaXplKCkgPT09IDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IGJlZm9yZS5oZWFkKClcblx0XHRjb25zdCBpc05hbWUgPSBpc0tleXdvcmQoS2V5d29yZHMuTmFtZSwgdG9rZW4pXG5cdFx0Y29uc3QgdmFsdWUgPSAoKSA9PiBwYXJzZUV4cHIoYWZ0ZXIpXG5cblx0XHQvLyBIYW5kbGUgYGEuYCB3aGljaCBtb3ZlcyBhbiBvdXRlciBsb2NhbCBpbnRvIGFuIE9iakVudHJ5LlxuXHRcdGlmIChhZnRlci5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4gaXNOYW1lID9cblx0XHRcdFx0T2JqRW50cnlQbGFpbi5uYW1lKGxvYywgbmV3IFNwZWNpYWxWYWwobG9jLCBTcGVjaWFsVmFscy5OYW1lKSkgOlxuXHRcdFx0XHRPYmpFbnRyeVBsYWluLmFjY2Vzcyhsb2MsIHBhcnNlTG9jYWxOYW1lKHRva2VuKSlcblx0XHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBrZXl3b3JkTmFtZSh0b2tlbi5raW5kKSwgdmFsdWUoKSlcblx0XHQvLyBgXCIxXCIuIDFgXG5cdFx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUXVvdGUsIHRva2VuKSlcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIHBhcnNlUXVvdGUoU2xpY2UuZ3JvdXAodG9rZW4pKSwgdmFsdWUoKSlcblx0XHQvLyAnZm9vLiAxXG5cdFx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGlmIChzbGljZS5zaXplKCkgPT09IDIgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlRpY2ssIHNsaWNlLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ldyBRdW90ZVNpbXBsZShsb2MsIHBhcnNlTmFtZShzbGljZS5zZWNvbmQoKSkpXG5cdFx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIHZhbHVlKCkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYXNzaWduID0gcGFyc2VBc3NpZ24oYmVmb3JlLCBLZXl3b3Jkcy5PYmpBc3NpZ24sIHBhcnNlRXhwcihhZnRlciksIGxvYylcblx0cmV0dXJuIG5ldyBPYmpFbnRyeUFzc2lnbihsb2MsIGFzc2lnbilcbn1cblxuZnVuY3Rpb24gc2V0S2luZChrZXl3b3JkKSB7XG5cdHN3aXRjaCAoa2V5d29yZC5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ246XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZTpcblx0XHRcdHJldHVybiBTZXR0ZXJzLk11dGF0ZVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR1bmV4cGVjdGVkKGtleXdvcmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VMb2NhbE11dGF0ZShsb2NhbHNUb2tlbnMsIHZhbHVlLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0Y2hlY2sobG9jYWxzLmxlbmd0aCA9PT0gMSwgbG9jLCAndG9kb011dGF0ZURlc3RydWN0dXJlJylcblx0cmV0dXJuIG5ldyBMb2NhbE11dGF0ZShsb2MsIGxvY2Fsc1swXS5uYW1lLCB2YWx1ZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ24obG9jYWxzVG9rZW5zLCBraW5kLCB2YWx1ZSwgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdGlmIChsb2NhbHMubGVuZ3RoID09PSAxKVxuXHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgbG9jYWxzWzBdLCB2YWx1ZSlcblx0ZWxzZSB7XG5cdFx0Y2hlY2sobG9jYWxzLmxlbmd0aCA+IDEsIGxvY2Fsc1Rva2Vucy5sb2MsICdhc3NpZ25Ob3RoaW5nJylcblx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0Y2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYywgJ2Rlc3RydWN0dXJlQWxsTGF6eScpXG5cdFx0cmV0dXJuIG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NlcnQobmVnYXRlLCB0b2tlbnMpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICdleHBlY3RlZEFmdGVyQXNzZXJ0Jylcblx0Y29uc3QgW2NvbmRUb2tlbnMsIG9wVGhyb3duXSA9XG5cdFx0aWZFbHNlKHRva2Vucy5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UaHJvdywgXykpLFxuXHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHQoKSA9PiBbdG9rZW5zLCBudWxsXSlcblxuXHRjb25zdCBwYXJ0cyA9IHBhcnNlRXhwclBhcnRzKGNvbmRUb2tlbnMpXG5cdGNvbnN0IGNvbmQgPSBwYXJ0cy5sZW5ndGggPT09IDEgPyBwYXJ0c1swXSA6IG5ldyBDYWxsKGNvbmRUb2tlbnMubG9jLCBwYXJ0c1swXSwgdGFpbChwYXJ0cykpXG5cdHJldHVybiBuZXcgQXNzZXJ0KHRva2Vucy5sb2MsIG5lZ2F0ZSwgY29uZCwgb3BUaHJvd24pXG59XG4iXX0=