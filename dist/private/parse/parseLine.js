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
			(0, _checks.checkEmpty)(rest(), () => `Did not expect anything after ${ head }.`);
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

				var _ifElse = (0, _util.ifElse)(spaced.opSplitOnce(_ => (0, _Token.isKeyword)(_Token.Keywords.Colon, _)), _ref2 => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBNkNqQixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUE3Q0YsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTZDakIsVUFBVSIsImZpbGUiOiJwYXJzZUxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnblNpbmdsZSwgQXNzaWduRGVzdHJ1Y3R1cmUsIEJhZ0VudHJ5LCBCcmVhaywgQ2FsbCwgSWdub3JlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxEZWNsYXJlcywgTG9jYWxNdXRhdGUsIE1hcEVudHJ5LCBNZW1iZXJTZXQsIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeVBsYWluLCBRdW90ZVNpbXBsZSxcblx0U2V0U3ViLCBTZXR0ZXJzLCBTcGVjaWFsRG8sIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWwsIFNwZWNpYWxWYWxzLCBUaHJvdywgWWllbGQsIFlpZWxkVG9cblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZCwga2V5d29yZE5hbWUsIEtleXdvcmRzLCBzaG93S2V5d29yZFxuXHR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIGlzRW1wdHksIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMsIHBhcnNlTG9jYWxOYW1lfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSB0aGUgY29udGVudCBvZiBhIGxpbmUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxpbmUodG9rZW5zKSB7XG5cdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0Y29uc3QgcmVzdCA9ICgpID0+IHRva2Vucy50YWlsKClcblxuXHRjb25zdCBub1Jlc3QgPSAoKSA9PiB7XG5cdFx0Y2hlY2tFbXB0eShyZXN0KCksICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9LmApXG5cdH1cblxuXHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdGNhc2UgS2V5d29yZHMuQXNzZXJ0OiBjYXNlIEtleXdvcmRzLkZvcmJpZDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS2V5d29yZHMuRm9yYmlkLCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKGxvYywgb3BQYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuRGVidWdnZXI6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKGxvYywgU3BlY2lhbERvcy5EZWJ1Z2dlcilcblx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpLCB0cnVlKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZ25vcmU6XG5cdFx0XHRcdHJldHVybiBuZXcgSWdub3JlKGxvYywgcmVzdCgpLm1hcChwYXJzZUxvY2FsTmFtZSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5QYXNzOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lcyhqdXN0QmxvY2soS2V5d29yZHMuUmVnaW9uLCByZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaHJvdzpcblx0XHRcdFx0cmV0dXJuIG5ldyBUaHJvdyhsb2MsIG9wUGFyc2VFeHByKHJlc3QoKSkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQobGluZVNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpLFxuXHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuY29uc3QgbGluZVNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQXNzaWduLCBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlLCBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSwgS2V5d29yZHMuTWFwRW50cnksXG5cdEtleXdvcmRzLk9iakFzc2lnbiwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxpbmVzKGxpbmVUb2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBbXVxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZVRva2Vucy5zbGljZXMoKSkge1xuXHRcdGNvbnN0IF8gPSBwYXJzZUxpbmUobGluZSlcblx0XHRpZiAoXyBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0bGluZXMucHVzaCguLi5fKVxuXHRcdGVsc2Vcblx0XHRcdGxpbmVzLnB1c2goXylcblx0fVxuXHRyZXR1cm4gbGluZXNcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpIHtcblx0Y29uc3Qga2luZCA9IGF0LmtpbmRcblx0aWYgKGtpbmQgPT09IEtleXdvcmRzLk1hcEVudHJ5KVxuXHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblx0ZWxzZSBpZiAoa2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdHJldHVybiBwYXJzZU9iakVudHJ5KGJlZm9yZSwgYWZ0ZXIsIGxvYylcblxuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdC8vIGBhLmIgPSBjYCwgYC5iID0gY2AsIGBhLlwiYlwiID0gY2AsIGAuXCJiXCIgPSBjYCwgYGFbYl0gPSBjYFxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFt2YWx1ZSwgb3BUeXBlXSA9IGlmRWxzZShzcGFjZWQub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuQ29sb24sIF8pKSxcblx0XHRcdFx0KHtiZWZvcmUsIGFmdGVyfSkgPT4gW2JlZm9yZSwgcGFyc2VFeHByKGFmdGVyKV0sXG5cdFx0XHRcdCgpID0+IFtzcGFjZWQsIG51bGxdKVxuXG5cdFx0XHRjb25zdCBsYXN0ID0gdmFsdWUubGFzdCgpXG5cdFx0XHRjb25zdCBvYmplY3QgPSBvYmogPT5cblx0XHRcdFx0b2JqLmlzRW1wdHkoKSA/IExvY2FsQWNjZXNzLnRoaXMob2JqLmxvYykgOiBwYXJzZVNwYWNlZChvYmopXG5cblx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCB2YWx1ZS5uZXh0VG9MYXN0KCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZU1lbWJlck5hbWUobGFzdClcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KHZhbHVlLnJ0YWlsKCkucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIG5ldyBNZW1iZXJTZXQobG9jLCBzZXQsIG5hbWUsIG9wVHlwZSwgc2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpXG5cdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLkJyYWNrZXQsIGxhc3QpKSB7XG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTdWJTZXQoc2V0LCBTbGljZS5ncm91cChsYXN0KSwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYylcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ga2luZCA9PT0gS2V5d29yZHMuTG9jYWxNdXRhdGUgP1xuXHRcdHBhcnNlTG9jYWxNdXRhdGUoYmVmb3JlLCBhZnRlciwgbG9jKSA6XG5cdFx0cGFyc2VBc3NpZ24oYmVmb3JlLCBraW5kLCBhZnRlciwgbG9jKVxufVxuXG5mdW5jdGlvbiBwYXJzZU9iakVudHJ5KGJlZm9yZSwgYWZ0ZXIsIGxvYykge1xuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdGNvbnN0IGlzTmFtZSA9IGlzS2V5d29yZChLZXl3b3Jkcy5OYW1lLCB0b2tlbilcblx0XHRjb25zdCB2YWx1ZSA9ICgpID0+IHBhcnNlRXhwcihhZnRlcilcblxuXHRcdC8vIEhhbmRsZSBgYS5gIHdoaWNoIG1vdmVzIGFuIG91dGVyIGxvY2FsIGludG8gYW4gT2JqRW50cnkuXG5cdFx0aWYgKGFmdGVyLmlzRW1wdHkoKSlcblx0XHRcdGlmIChpc05hbWUpXG5cdFx0XHRcdHJldHVybiBPYmpFbnRyeVBsYWluLm5hbWUobG9jLCBuZXcgU3BlY2lhbFZhbChsb2MsIFNwZWNpYWxWYWxzLk5hbWUpKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5hY2Nlc3MobG9jLCBwYXJzZUxvY2FsTmFtZSh0b2tlbikpXG5cdFx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywga2V5d29yZE5hbWUodG9rZW4ua2luZCksIHZhbHVlKCkpXG5cdFx0Ly8gYFwiMVwiLiAxYFxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlF1b3RlLCB0b2tlbikpXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSksIHZhbHVlKCkpXG5cdFx0Ly8gJ2Zvby4gMVxuXHRcdGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRpZiAoc2xpY2Uuc2l6ZSgpID09PSAyICYmIGlzS2V5d29yZChLZXl3b3Jkcy5UaWNrLCBzbGljZS5oZWFkKCkpKSB7XG5cdFx0XHRcdGNvbnN0IG5hbWUgPSBuZXcgUXVvdGVTaW1wbGUobG9jLCBwYXJzZU5hbWUoc2xpY2Uuc2Vjb25kKCkpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBuYW1lLCB2YWx1ZSgpKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFzc2lnbiA9IHBhcnNlQXNzaWduKGJlZm9yZSwgS2V5d29yZHMuT2JqQXNzaWduLCBhZnRlciwgbG9jKVxuXHRyZXR1cm4gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgYXNzaWduKVxufVxuXG5mdW5jdGlvbiBzZXRLaW5kKGtleXdvcmQpIHtcblx0c3dpdGNoIChrZXl3b3JkLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbjpcblx0XHRcdHJldHVybiBTZXR0ZXJzLkluaXRcblx0XHRjYXNlIEtleXdvcmRzLkFzc2lnbk11dGFibGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0TXV0YWJsZVxuXHRcdGNhc2UgS2V5d29yZHMuTG9jYWxNdXRhdGU6XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5NdXRhdGVcblx0XHRkZWZhdWx0OlxuXHRcdFx0dW5leHBlY3RlZChrZXl3b3JkKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3ViU2V0KG9iamVjdCwgc3ViYmVkLCBvcFR5cGUsIGF0LCBhZnRlciwgbG9jKSB7XG5cdGNvbnN0IHN1YmJlZHMgPSBwYXJzZUV4cHJQYXJ0cyhzdWJiZWQpXG5cdHJldHVybiBuZXcgU2V0U3ViKGxvYywgb2JqZWN0LCBzdWJiZWRzLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUxvY2FsTXV0YXRlKGxvY2Fsc1Rva2VucywgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMobG9jYWxzVG9rZW5zKVxuXHRjaGVjayhsb2NhbHMubGVuZ3RoID09PSAxLCBsb2MsICdUT0RPOiBMb2NhbERlc3RydWN0dXJlTXV0YXRlJylcblx0Y29uc3QgbmFtZSA9IGxvY2Fsc1swXS5uYW1lXG5cdGNvbnN0IHZhbHVlID0gcGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRyZXR1cm4gbmV3IExvY2FsTXV0YXRlKGxvYywgbmFtZSwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduKGxvY2Fsc1Rva2Vucywga2luZCwgdmFsdWVUb2tlbnMsIGxvYykge1xuXHRjb25zdCBsb2NhbHMgPSBwYXJzZUxvY2FsRGVjbGFyZXMobG9jYWxzVG9rZW5zKVxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpXG5cblx0Y29uc3QgaXNZaWVsZCA9IGtpbmQgPT09IEtleXdvcmRzLllpZWxkIHx8IGtpbmQgPT09IEtleXdvcmRzLllpZWxkVG9cblx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdGNoZWNrKGlzWWllbGQsIGxvY2Fsc1Rva2Vucy5sb2MsICdBc3NpZ25tZW50IHRvIG5vdGhpbmcnKVxuXHRcdHJldHVybiB2YWx1ZVxuXHR9IGVsc2Uge1xuXHRcdGlmIChpc1lpZWxkKVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnQ2FuIG5vdCB5aWVsZCB0byBsYXp5IHZhcmlhYmxlLicpXG5cblx0XHRpZiAoa2luZCA9PT0gS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdGZvciAobGV0IF8gb2YgbG9jYWxzKSB7XG5cdFx0XHRcdGNoZWNrKCFfLmlzTGF6eSgpLCBfLmxvYywgJ0xhenkgbG9jYWwgY2FuIG5vdCBiZSBtdXRhYmxlLicpXG5cdFx0XHRcdF8ua2luZCA9IExvY2FsRGVjbGFyZXMuTXV0YWJsZVxuXHRcdFx0fVxuXG5cdFx0aWYgKGxvY2Fscy5sZW5ndGggPT09IDEpXG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnblNpbmdsZShsb2MsIGxvY2Fsc1swXSwgdmFsdWUpXG5cdFx0ZWxzZSB7XG5cdFx0XHRjb25zdCBraW5kID0gbG9jYWxzWzBdLmtpbmRcblx0XHRcdGZvciAoY29uc3QgXyBvZiBsb2NhbHMpXG5cdFx0XHRcdGNoZWNrKF8ua2luZCA9PT0ga2luZCwgXy5sb2MsXG5cdFx0XHRcdFx0J0FsbCBsb2NhbHMgb2YgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IG11c3QgYmUgb2YgdGhlIHNhbWUga2luZC4nKVxuXHRcdFx0cmV0dXJuIG5ldyBBc3NpZ25EZXN0cnVjdHVyZShsb2MsIGxvY2FscywgdmFsdWUsIGtpbmQpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpIHtcblx0Y29uc3QgdmFsdWUgPSAoKSA9PiBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdGNvbnN0IG9wVmFsdWUgPSAoKSA9PiBvcFBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0c3dpdGNoIChraW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZDpcblx0XHRcdHJldHVybiBuZXcgWWllbGQodmFsdWVUb2tlbnMubG9jLCBvcFZhbHVlKCkpXG5cdFx0Y2FzZSBLZXl3b3Jkcy5ZaWVsZFRvOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZFRvKHZhbHVlVG9rZW5zLmxvYywgb3BWYWx1ZSgpKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gdmFsdWUoKVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlQXNzZXJ0KG5lZ2F0ZSwgdG9rZW5zKSB7XG5cdGNoZWNrTm9uRW1wdHkodG9rZW5zLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7c2hvd0tleXdvcmQoS2V5d29yZHMuQXNzZXJ0KX0uYClcblxuXHRjb25zdCBbY29uZFRva2Vucywgb3BUaHJvd25dID1cblx0XHRpZkVsc2UodG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNLZXl3b3JkKEtleXdvcmRzLlRocm93LCBfKSksXG5cdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdCgpID0+IFt0b2tlbnMsIG51bGxdKVxuXG5cdGNvbnN0IHBhcnRzID0gcGFyc2VFeHByUGFydHMoY29uZFRva2Vucylcblx0Y29uc3QgY29uZCA9IHBhcnRzLmxlbmd0aCA9PT0gMSA/IHBhcnRzWzBdIDogbmV3IENhbGwoY29uZFRva2Vucy5sb2MsIHBhcnRzWzBdLCB0YWlsKHBhcnRzKSlcblx0cmV0dXJuIG5ldyBBc3NlcnQodG9rZW5zLmxvYywgbmVnYXRlLCBjb25kLCBvcFRocm93bilcbn1cbiJdfQ==