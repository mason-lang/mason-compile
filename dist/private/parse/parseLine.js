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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixTQUFTO1NBNkNqQixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUE3Q0YsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTZDakIsVUFBVSIsImZpbGUiOiJwYXJzZUxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtBc3NlcnQsIEFzc2lnblNpbmdsZSwgQXNzaWduRGVzdHJ1Y3R1cmUsIEJhZ0VudHJ5LCBCcmVhaywgQ2FsbCwgSWdub3JlLCBMb2NhbEFjY2Vzcyxcblx0TG9jYWxEZWNsYXJlcywgTG9jYWxNdXRhdGUsIE1hcEVudHJ5LCBNZW1iZXJTZXQsIE9iakVudHJ5QXNzaWduLCBPYmpFbnRyeVBsYWluLCBRdW90ZVNpbXBsZSxcblx0U2V0U3ViLCBTZXR0ZXJzLCBTcGVjaWFsRG8sIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWwsIFNwZWNpYWxWYWxzLCBUaHJvdywgWWllbGQsIFlpZWxkVG9cblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXBzLCBpc0dyb3VwLCBpc0FueUtleXdvcmQsIGlzS2V5d29yZCwgS2V5d29yZCwga2V5d29yZE5hbWUsIEtleXdvcmRzLCBzaG93S2V5d29yZFxuXHR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHtpZkVsc2UsIGlzRW1wdHksIHRhaWx9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIGNoZWNrTm9uRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMsIHBhcnNlTG9jYWxOYW1lfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHtvcFBhcnNlRXhwciwgcGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTcGFjZWR9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSB0aGUgY29udGVudCBvZiBhIGxpbmUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxpbmUodG9rZW5zKSB7XG5cdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0Y29uc3QgcmVzdCA9ICgpID0+IHRva2Vucy50YWlsKClcblxuXHRjb25zdCBub1Jlc3QgPSAoKSA9PiB7XG5cdFx0Y2hlY2tFbXB0eShyZXN0KCksICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9LmApXG5cdH1cblxuXHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdGNhc2UgS2V5d29yZHMuQXNzZXJ0OiBjYXNlIEtleXdvcmRzLkFzc2VydE5vdDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS2V5d29yZHMuQXNzZXJ0Tm90LCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRyZXR1cm4gbmV3IEJyZWFrKGxvYywgb3BQYXJzZUV4cHIocmVzdCgpKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuRGVidWdnZXI6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBuZXcgU3BlY2lhbERvKGxvYywgU3BlY2lhbERvcy5EZWJ1Z2dlcilcblx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpLCB0cnVlKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZ25vcmU6XG5cdFx0XHRcdHJldHVybiBuZXcgSWdub3JlKGxvYywgcmVzdCgpLm1hcChwYXJzZUxvY2FsTmFtZSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcihyZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5QYXNzOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lcyhqdXN0QmxvY2soS2V5d29yZHMuUmVnaW9uLCByZXN0KCkpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaHJvdzpcblx0XHRcdFx0cmV0dXJuIG5ldyBUaHJvdyhsb2MsIG9wUGFyc2VFeHByKHJlc3QoKSkpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQobGluZVNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpLFxuXHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuY29uc3QgbGluZVNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQXNzaWduLCBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlLCBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSwgS2V5d29yZHMuTWFwRW50cnksXG5cdEtleXdvcmRzLk9iakFzc2lnbiwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxpbmVzKGxpbmVUb2tlbnMpIHtcblx0Y29uc3QgbGluZXMgPSBbXVxuXHRmb3IgKGNvbnN0IGxpbmUgb2YgbGluZVRva2Vucy5zbGljZXMoKSkge1xuXHRcdGNvbnN0IF8gPSBwYXJzZUxpbmUobGluZSlcblx0XHRpZiAoXyBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0bGluZXMucHVzaCguLi5fKVxuXHRcdGVsc2Vcblx0XHRcdGxpbmVzLnB1c2goXylcblx0fVxuXHRyZXR1cm4gbGluZXNcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpIHtcblx0Y29uc3Qga2luZCA9IGF0LmtpbmRcblx0aWYgKGtpbmQgPT09IEtleXdvcmRzLk1hcEVudHJ5KVxuXHRcdHJldHVybiBuZXcgTWFwRW50cnkobG9jLCBwYXJzZUV4cHIoYmVmb3JlKSwgcGFyc2VFeHByKGFmdGVyKSlcblx0ZWxzZSBpZiAoa2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdHJldHVybiBwYXJzZU9iakVudHJ5KGJlZm9yZSwgYWZ0ZXIsIGxvYylcblxuXHRpZiAoYmVmb3JlLnNpemUoKSA9PT0gMSkge1xuXHRcdGNvbnN0IHRva2VuID0gYmVmb3JlLmhlYWQoKVxuXHRcdC8vIGBhLmIgPSBjYCwgYC5iID0gY2AsIGBhLlwiYlwiID0gY2AsIGAuXCJiXCIgPSBjYCwgYGFbYl0gPSBjYFxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgdG9rZW4pKSB7XG5cdFx0XHRjb25zdCBzcGFjZWQgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGNvbnN0IFt2YWx1ZSwgb3BUeXBlXSA9IGlmRWxzZShzcGFjZWQub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuVHlwZSwgXykpLFxuXHRcdFx0XHQoe2JlZm9yZSwgYWZ0ZXJ9KSA9PiBbYmVmb3JlLCBwYXJzZUV4cHIoYWZ0ZXIpXSxcblx0XHRcdFx0KCkgPT4gW3NwYWNlZCwgbnVsbF0pXG5cblx0XHRcdGNvbnN0IGxhc3QgPSB2YWx1ZS5sYXN0KClcblx0XHRcdGNvbnN0IG9iamVjdCA9IG9iaiA9PlxuXHRcdFx0XHRvYmouaXNFbXB0eSgpID8gTG9jYWxBY2Nlc3MudGhpcyhvYmoubG9jKSA6IHBhcnNlU3BhY2VkKG9iailcblxuXHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHZhbHVlLm5leHRUb0xhc3QoKSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTWVtYmVyTmFtZShsYXN0KVxuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QodmFsdWUucnRhaWwoKS5ydGFpbCgpKVxuXHRcdFx0XHRyZXR1cm4gbmV3IE1lbWJlclNldChsb2MsIHNldCwgbmFtZSwgb3BUeXBlLCBzZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSlcblx0XHRcdH0gZWxzZSBpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRcdFx0Y29uc3Qgc2V0ID0gb2JqZWN0KHZhbHVlLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBwYXJzZVN1YlNldChzZXQsIFNsaWNlLmdyb3VwKGxhc3QpLCBvcFR5cGUsIGF0LCBhZnRlciwgbG9jKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBraW5kID09PSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSA/XG5cdFx0cGFyc2VMb2NhbE11dGF0ZShiZWZvcmUsIGFmdGVyLCBsb2MpIDpcblx0XHRwYXJzZUFzc2lnbihiZWZvcmUsIGtpbmQsIGFmdGVyLCBsb2MpXG59XG5cbmZ1bmN0aW9uIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKSB7XG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Y29uc3QgaXNOYW1lID0gaXNLZXl3b3JkKEtleXdvcmRzLk5hbWUsIHRva2VuKVxuXHRcdGNvbnN0IHZhbHVlID0gKCkgPT4gcGFyc2VFeHByKGFmdGVyKVxuXG5cdFx0Ly8gSGFuZGxlIGBhLmAgd2hpY2ggbW92ZXMgYW4gb3V0ZXIgbG9jYWwgaW50byBhbiBPYmpFbnRyeS5cblx0XHRpZiAoYWZ0ZXIuaXNFbXB0eSgpKVxuXHRcdFx0aWYgKGlzTmFtZSlcblx0XHRcdFx0cmV0dXJuIE9iakVudHJ5UGxhaW4ubmFtZShsb2MsIG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuTmFtZSkpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiBPYmpFbnRyeVBsYWluLmFjY2Vzcyhsb2MsIHBhcnNlTG9jYWxOYW1lKHRva2VuKSlcblx0XHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRyZXR1cm4gbmV3IE9iakVudHJ5UGxhaW4obG9jLCBrZXl3b3JkTmFtZSh0b2tlbi5raW5kKSwgdmFsdWUoKSlcblx0XHQvLyBgXCIxXCIuIDFgXG5cdFx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUXVvdGUsIHRva2VuKSlcblx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIHBhcnNlUXVvdGUoU2xpY2UuZ3JvdXAodG9rZW4pKSwgdmFsdWUoKSlcblx0XHQvLyAnZm9vLiAxXG5cdFx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdGlmIChzbGljZS5zaXplKCkgPT09IDIgJiYgaXNLZXl3b3JkKEtleXdvcmRzLlRpY2ssIHNsaWNlLmhlYWQoKSkpIHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IG5ldyBRdW90ZVNpbXBsZShsb2MsIHBhcnNlTmFtZShzbGljZS5zZWNvbmQoKSkpXG5cdFx0XHRcdHJldHVybiBuZXcgT2JqRW50cnlQbGFpbihsb2MsIG5hbWUsIHZhbHVlKCkpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYXNzaWduID0gcGFyc2VBc3NpZ24oYmVmb3JlLCBLZXl3b3Jkcy5PYmpBc3NpZ24sIGFmdGVyLCBsb2MpXG5cdHJldHVybiBuZXcgT2JqRW50cnlBc3NpZ24obG9jLCBhc3NpZ24pXG59XG5cbmZ1bmN0aW9uIHNldEtpbmQoa2V5d29yZCkge1xuXHRzd2l0Y2ggKGtleXdvcmQua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuQXNzaWduOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdFxuXHRcdGNhc2UgS2V5d29yZHMuQXNzaWduTXV0YWJsZTpcblx0XHRcdHJldHVybiBTZXR0ZXJzLkluaXRNdXRhYmxlXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Mb2NhbE11dGF0ZTpcblx0XHRcdHJldHVybiBTZXR0ZXJzLk11dGF0ZVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR1bmV4cGVjdGVkKGtleXdvcmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VTdWJTZXQob2JqZWN0LCBzdWJiZWQsIG9wVHlwZSwgYXQsIGFmdGVyLCBsb2MpIHtcblx0Y29uc3Qgc3ViYmVkcyA9IHBhcnNlRXhwclBhcnRzKHN1YmJlZClcblx0cmV0dXJuIG5ldyBTZXRTdWIobG9jLCBvYmplY3QsIHN1YmJlZHMsIG9wVHlwZSwgc2V0S2luZChhdCksIHBhcnNlRXhwcihhZnRlcikpXG59XG5cbmZ1bmN0aW9uIHBhcnNlTG9jYWxNdXRhdGUobG9jYWxzVG9rZW5zLCB2YWx1ZVRva2VucywgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhsb2NhbHNUb2tlbnMpXG5cdGNoZWNrKGxvY2Fscy5sZW5ndGggPT09IDEsIGxvYywgJ1RPRE86IExvY2FsRGVzdHJ1Y3R1cmVNdXRhdGUnKVxuXHRjb25zdCBuYW1lID0gbG9jYWxzWzBdLm5hbWVcblx0Y29uc3QgdmFsdWUgPSBwYXJzZUV4cHIodmFsdWVUb2tlbnMpXG5cdHJldHVybiBuZXcgTG9jYWxNdXRhdGUobG9jLCBuYW1lLCB2YWx1ZSlcbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ24obG9jYWxzVG9rZW5zLCBraW5kLCB2YWx1ZVRva2VucywgbG9jKSB7XG5cdGNvbnN0IGxvY2FscyA9IHBhcnNlTG9jYWxEZWNsYXJlcyhsb2NhbHNUb2tlbnMpXG5cdGNvbnN0IHZhbHVlID0gcGFyc2VBc3NpZ25WYWx1ZShraW5kLCB2YWx1ZVRva2VucylcblxuXHRjb25zdCBpc1lpZWxkID0ga2luZCA9PT0gS2V5d29yZHMuWWllbGQgfHwga2luZCA9PT0gS2V5d29yZHMuWWllbGRUb1xuXHRpZiAoaXNFbXB0eShsb2NhbHMpKSB7XG5cdFx0Y2hlY2soaXNZaWVsZCwgbG9jYWxzVG9rZW5zLmxvYywgJ0Fzc2lnbm1lbnQgdG8gbm90aGluZycpXG5cdFx0cmV0dXJuIHZhbHVlXG5cdH0gZWxzZSB7XG5cdFx0aWYgKGlzWWllbGQpXG5cdFx0XHRmb3IgKGNvbnN0IF8gb2YgbG9jYWxzKVxuXHRcdFx0XHRjaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdDYW4gbm90IHlpZWxkIHRvIGxhenkgdmFyaWFibGUuJylcblxuXHRcdGlmIChraW5kID09PSBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0Zm9yIChsZXQgXyBvZiBsb2NhbHMpIHtcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnTGF6eSBsb2NhbCBjYW4gbm90IGJlIG11dGFibGUuJylcblx0XHRcdFx0Xy5raW5kID0gTG9jYWxEZWNsYXJlcy5NdXRhYmxlXG5cdFx0XHR9XG5cblx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSlcblx0XHRcdHJldHVybiBuZXcgQXNzaWduU2luZ2xlKGxvYywgbG9jYWxzWzBdLCB2YWx1ZSlcblx0XHRlbHNlIHtcblx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRyZXR1cm4gbmV3IEFzc2lnbkRlc3RydWN0dXJlKGxvYywgbG9jYWxzLCB2YWx1ZSwga2luZClcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25WYWx1ZShraW5kLCB2YWx1ZVRva2Vucykge1xuXHRjb25zdCB2YWx1ZSA9ICgpID0+IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0Y29uc3Qgb3BWYWx1ZSA9ICgpID0+IG9wUGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZVRva2Vucy5sb2MsIG9wVmFsdWUoKSlcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWVUb2tlbnMubG9jLCBvcFZhbHVlKCkpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiB2YWx1ZSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NlcnQobmVnYXRlLCB0b2tlbnMpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Bc3NlcnQpfS5gKVxuXG5cdGNvbnN0IFtjb25kVG9rZW5zLCBvcFRocm93bl0gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuVGhyb3csIF8pKSxcblx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0KCkgPT4gW3Rva2VucywgbnVsbF0pXG5cblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhjb25kVG9rZW5zKVxuXHRjb25zdCBjb25kID0gcGFydHMubGVuZ3RoID09PSAxID8gcGFydHNbMF0gOiBuZXcgQ2FsbChjb25kVG9rZW5zLmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRyZXR1cm4gbmV3IEFzc2VydCh0b2tlbnMubG9jLCBuZWdhdGUsIGNvbmQsIG9wVGhyb3duKVxufVxuIl19