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
			if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return new _MsAst.ObjEntryPlain(loc, (0, _parseQuote2.default)(_Slice2.default.group(token)), (0, _parse.parseExpr)(after));

			if ((0, _Token.isKeyword)(_Token.Keywords.Name, token)) {
				const val = after.isEmpty() ? new _MsAst.SpecialVal(loc, _MsAst.SpecialVals.Name) : (0, _parse.parseExpr)(after);
				return _MsAst.ObjEntryPlain.name(loc, val);
			}
		}

		return parseAssign(before, _Token.Keywords.ObjAssign, after, loc);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW9Cd0IsU0FBUztTQXdFakIsYUFBYSxHQUFiLGFBQWE7U0FHYixpQkFBaUIsR0FBakIsaUJBQWlCO1NBR2pCLGFBQWEsR0FBYixhQUFhO1NBR2IsYUFBYSxHQUFiLGFBQWE7U0FpQmIsVUFBVSxHQUFWLFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBbEdGLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrRXBCLGdCQUFnQixXQUFoQixnQkFBZ0IsR0FBRyxNQUFNLElBQUk7QUFDekMsUUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNCLFNBQU8sQ0FBQyxZQUFZLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUNuQzs7VUFHZSxhQUFhOzs7O1VBR2IsaUJBQWlCOzs7O1VBR2pCLGFBQWE7Ozs7VUFHYixhQUFhOzs7Ozs7Ozs7Ozs7OztVQWlCYixVQUFVIiwiZmlsZSI6InBhcnNlTGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0Fzc2VydCwgQXNzaWduU2luZ2xlLCBBc3NpZ25EZXN0cnVjdHVyZSwgQmFnRW50cnksIEJhZ0VudHJ5TWFueSwgQnJlYWssIEJyZWFrV2l0aFZhbCwgQ2FsbCxcblx0Q29uZGl0aW9uYWwsIElnbm9yZSwgTG9jYWxBY2Nlc3MsIExvY2FsRGVjbGFyZXMsIExvY2FsTXV0YXRlLCBNYXBFbnRyeSwgTWVtYmVyU2V0LFxuXHRPYmpFbnRyeUFzc2lnbiwgT2JqRW50cnlQbGFpbiwgU2V0U3ViLCBTZXR0ZXJzLCBTcGVjaWFsRG8sIFNwZWNpYWxEb3MsIFNwZWNpYWxWYWwsIFNwZWNpYWxWYWxzLFxuXHRTdXBlckNhbGwsIFRocm93LCBZaWVsZCwgWWllbGRUb30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNBbnlLZXl3b3JkLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgdGFpbH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge2JlZm9yZUFuZEJsb2NrLCBwYXJzZUJsb2NrRG8sIHBhcnNlTGluZXNGcm9tQmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCBwYXJzZUNhc2UgZnJvbSAnLi9wYXJzZUNhc2UnXG5pbXBvcnQgcGFyc2VEZWwgZnJvbSAnLi9wYXJzZURlbCdcbmltcG9ydCBwYXJzZUV4Y2VwdCBmcm9tICcuL3BhcnNlRXhjZXB0J1xuaW1wb3J0IHtwYXJzZUZvcn0gZnJvbSAnLi9wYXJzZUZvcidcbmltcG9ydCBwYXJzZUxvY2FsRGVjbGFyZXMsIHtwYXJzZUxvY2FsRGVjbGFyZXNKdXN0TmFtZXMsIHBhcnNlTG9jYWxOYW1lfSBmcm9tICcuL3BhcnNlTG9jYWxEZWNsYXJlcydcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VRdW90ZSBmcm9tICcuL3BhcnNlUXVvdGUnXG5pbXBvcnQge29wUGFyc2VFeHByLCBwYXJzZUV4cHIsIHBhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZCwgcGFyc2VTd2l0Y2h9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKiBQYXJzZSB0aGUgY29udGVudCBvZiBhIGxpbmUuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZUxpbmUodG9rZW5zKSB7XG5cdGNvbnN0IGxvYyA9IHRva2Vucy5sb2Ncblx0Y29uc3QgaGVhZCA9IHRva2Vucy5oZWFkKClcblx0Y29uc3QgcmVzdCA9ICgpID0+IHRva2Vucy50YWlsKClcblxuXHRjb25zdCBub1Jlc3QgPSAoKSA9PiB7XG5cdFx0Y2hlY2tFbXB0eShyZXN0KCksICgpID0+IGBEaWQgbm90IGV4cGVjdCBhbnl0aGluZyBhZnRlciAke2hlYWR9LmApXG5cdH1cblxuXHQvLyBXZSBvbmx5IGRlYWwgd2l0aCBtdXRhYmxlIGV4cHJlc3Npb25zIGhlcmUsIG90aGVyd2lzZSB3ZSBmYWxsIGJhY2sgdG8gcGFyc2VFeHByLlxuXHRpZiAoaGVhZCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoIChoZWFkLmtpbmQpIHtcblx0XHRcdGNhc2UgS2V5d29yZHMuQXNzZXJ0OiBjYXNlIEtleXdvcmRzLkFzc2VydE5vdDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQXNzZXJ0KGhlYWQua2luZCA9PT0gS2V5d29yZHMuQXNzZXJ0Tm90LCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkV4Y2VwdDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRXhjZXB0KGZhbHNlLCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkJyZWFrOlxuXHRcdFx0XHRyZXR1cm4gaWZFbHNlKG9wUGFyc2VFeHByKHJlc3QoKSksXG5cdFx0XHRcdFx0XyA9PiBuZXcgQnJlYWtXaXRoVmFsKGxvYywgXyksXG5cdFx0XHRcdFx0KCkgPT4gbmV3IEJyZWFrKGxvYykpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkNhc2U6XG5cdFx0XHRcdHJldHVybiBwYXJzZUNhc2UoZmFsc2UsIGZhbHNlLCByZXN0KCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRlYnVnZ2VyOlxuXHRcdFx0XHRub1Jlc3QoKVxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwZWNpYWxEbyhsb2MsIFNwZWNpYWxEb3MuRGVidWdnZXIpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkRlbDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlRGVsKHJlc3QoKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQmFnRW50cnlNYW55KHJlc3QoKSwgbG9jKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb3I6XG5cdFx0XHRcdHJldHVybiBwYXJzZUZvcihmYWxzZSwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5JZ25vcmU6XG5cdFx0XHRcdHJldHVybiBuZXcgSWdub3JlKGxvYywgcmVzdCgpLm1hcChwYXJzZUxvY2FsTmFtZSkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLklmOiBjYXNlIEtleXdvcmRzLlVubGVzczoge1xuXHRcdFx0XHRjb25zdCBbYmVmb3JlLCBibG9ja10gPSBiZWZvcmVBbmRCbG9jayhyZXN0KCkpXG5cdFx0XHRcdHJldHVybiBuZXcgQ29uZGl0aW9uYWwobG9jLFxuXHRcdFx0XHRcdHBhcnNlRXhwcihiZWZvcmUpLFxuXHRcdFx0XHRcdHBhcnNlQmxvY2tEbyhibG9jayksXG5cdFx0XHRcdFx0aGVhZC5raW5kID09PSBLZXl3b3Jkcy5Vbmxlc3MpXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLk9iakFzc2lnbjpcblx0XHRcdFx0cmV0dXJuIHBhcnNlQmFnRW50cnkocmVzdCgpLCBsb2MpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlBhc3M6XG5cdFx0XHRcdG5vUmVzdCgpXG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdHJldHVybiBwYXJzZUxpbmVzRnJvbUJsb2NrKHRva2Vucylcblx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6XG5cdFx0XHRcdHJldHVybiBuZXcgU3VwZXJDYWxsKGxvYywgcGFyc2VFeHByUGFydHMocmVzdCgpKSwgZmFsc2UpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN3aXRjaDpcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3dpdGNoKGZhbHNlLCBmYWxzZSwgcmVzdCgpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaHJvdzpcblx0XHRcdFx0cmV0dXJuIHBhcnNlVGhyb3cocmVzdCgpLCBsb2MpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cblx0cmV0dXJuIGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQobGluZVNwbGl0S2V5d29yZHMsIF8pKSxcblx0XHQoe2JlZm9yZSwgYXQsIGFmdGVyfSkgPT4gcGFyc2VBc3NpZ25MaWtlKGJlZm9yZSwgYXQsIGFmdGVyLCBsb2MpLFxuXHRcdCgpID0+IHBhcnNlRXhwcih0b2tlbnMpKVxufVxuY29uc3QgbGluZVNwbGl0S2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuQXNzaWduLCBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlLCBLZXl3b3Jkcy5Mb2NhbE11dGF0ZSwgS2V5d29yZHMuTWFwRW50cnksXG5cdEtleXdvcmRzLk9iakFzc2lnbiwgS2V5d29yZHMuWWllbGQsIEtleXdvcmRzLllpZWxkVG9cbl0pXG5cbmV4cG9ydCBjb25zdCBwYXJzZUxpbmVPckxpbmVzID0gdG9rZW5zID0+IHtcblx0Y29uc3QgXyA9IHBhcnNlTGluZSh0b2tlbnMpXG5cdHJldHVybiBfIGluc3RhbmNlb2YgQXJyYXkgPyBfIDogW19dXG59XG5cbi8vIEV4cG9ydGVkIHNvIHBhcnNpbmcgdGhlIGxhc3QgbGluZSBvZiBhIHZhbHVlIGJsb2NrIGNhbiBoYW5kbGUgdGhlc2UgY2FzZXMgc3BlY2lhbGx5LlxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmFnRW50cnkodG9rZW5zLCBsb2MpIHtcblx0cmV0dXJuIG5ldyBCYWdFbnRyeShsb2MsIHBhcnNlRXhwcih0b2tlbnMpKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQmFnRW50cnlNYW55KHRva2VucywgbG9jKSB7XG5cdHJldHVybiBuZXcgQmFnRW50cnlNYW55KGxvYywgcGFyc2VFeHByKHRva2VucykpXG59XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNYXBFbnRyeShiZWZvcmUsIGFmdGVyLCBsb2MpIHtcblx0cmV0dXJuIG5ldyBNYXBFbnRyeShsb2MsIHBhcnNlRXhwcihiZWZvcmUpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKSB7XG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Ly8gYFwiMVwiLiAxYFxuXHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5RdW90ZSwgdG9rZW4pKVxuXHRcdFx0cmV0dXJuIG5ldyBPYmpFbnRyeVBsYWluKGxvYywgcGFyc2VRdW90ZShTbGljZS5ncm91cCh0b2tlbikpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXG5cdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5OYW1lLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHZhbCA9IGFmdGVyLmlzRW1wdHkoKSA/XG5cdFx0XHRcdG5ldyBTcGVjaWFsVmFsKGxvYywgU3BlY2lhbFZhbHMuTmFtZSkgOlxuXHRcdFx0XHRwYXJzZUV4cHIoYWZ0ZXIpXG5cdFx0XHRyZXR1cm4gT2JqRW50cnlQbGFpbi5uYW1lKGxvYywgdmFsKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBwYXJzZUFzc2lnbihiZWZvcmUsIEtleXdvcmRzLk9iakFzc2lnbiwgYWZ0ZXIsIGxvYylcbn1cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRocm93KHRva2VucywgbG9jKSB7XG5cdHJldHVybiBuZXcgVGhyb3cobG9jLCBvcFBhcnNlRXhwcih0b2tlbnMpKVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbkxpa2UoYmVmb3JlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBraW5kID0gYXQua2luZFxuXHRpZiAoa2luZCA9PT0gS2V5d29yZHMuTWFwRW50cnkpXG5cdFx0cmV0dXJuIHBhcnNlTWFwRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKVxuXHRlbHNlIGlmIChraW5kID09PSBLZXl3b3Jkcy5PYmpBc3NpZ24pXG5cdFx0cmV0dXJuIHBhcnNlT2JqRW50cnkoYmVmb3JlLCBhZnRlciwgbG9jKVxuXG5cdGlmIChiZWZvcmUuc2l6ZSgpID09PSAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSBiZWZvcmUuaGVhZCgpXG5cdFx0Ly8gYGEuYiA9IGNgLCBgLmIgPSBjYCwgYGEuXCJiXCIgPSBjYCwgYC5cImJcIiA9IGNgLCBgYVtiXSA9IGNgXG5cdFx0aWYgKGlzR3JvdXAoR3JvdXBzLlNwYWNlLCB0b2tlbikpIHtcblx0XHRcdGNvbnN0IHNwYWNlZCA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0Y29uc3QgW3ZhbHVlLCBvcFR5cGVdID0gaWZFbHNlKHNwYWNlZC5vcFNwbGl0T25jZShfID0+IGlzS2V5d29yZChLZXl3b3Jkcy5UeXBlLCBfKSksXG5cdFx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0XHQoKSA9PiBbc3BhY2VkLCBudWxsXSlcblxuXHRcdFx0Y29uc3QgbGFzdCA9IHZhbHVlLmxhc3QoKVxuXHRcdFx0Y29uc3Qgb2JqZWN0ID0gb2JqID0+XG5cdFx0XHRcdG9iai5pc0VtcHR5KCkgPyBMb2NhbEFjY2Vzcy50aGlzKG9iai5sb2MpIDogcGFyc2VTcGFjZWQob2JqKVxuXG5cdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdmFsdWUubmV4dFRvTGFzdCgpKSkge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKGxhc3QpXG5cdFx0XHRcdGNvbnN0IHNldCA9IG9iamVjdCh2YWx1ZS5ydGFpbCgpLnJ0YWlsKCkpXG5cdFx0XHRcdHJldHVybiBuZXcgTWVtYmVyU2V0KGxvYywgc2V0LCBuYW1lLCBvcFR5cGUsIHNldEtpbmQoYXQpLCBwYXJzZUV4cHIoYWZ0ZXIpKVxuXHRcdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5CcmFja2V0LCBsYXN0KSkge1xuXHRcdFx0XHRjb25zdCBzZXQgPSBvYmplY3QodmFsdWUucnRhaWwoKSlcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3ViU2V0KHNldCwgU2xpY2UuZ3JvdXAobGFzdCksIG9wVHlwZSwgYXQsIGFmdGVyLCBsb2MpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGtpbmQgPT09IEtleXdvcmRzLkxvY2FsTXV0YXRlID9cblx0XHRwYXJzZUxvY2FsTXV0YXRlKGJlZm9yZSwgYWZ0ZXIsIGxvYykgOlxuXHRcdHBhcnNlQXNzaWduKGJlZm9yZSwga2luZCwgYWZ0ZXIsIGxvYylcbn1cblxuZnVuY3Rpb24gc2V0S2luZChrZXl3b3JkKSB7XG5cdHN3aXRjaCAoa2V5d29yZC5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ246XG5cdFx0XHRyZXR1cm4gU2V0dGVycy5Jbml0XG5cdFx0Y2FzZSBLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuSW5pdE11dGFibGVcblx0XHRjYXNlIEtleXdvcmRzLkxvY2FsTXV0YXRlOlxuXHRcdFx0cmV0dXJuIFNldHRlcnMuTXV0YXRlXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHVuZXhwZWN0ZWQoa2V5d29yZClcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVN1YlNldChvYmplY3QsIHN1YmJlZCwgb3BUeXBlLCBhdCwgYWZ0ZXIsIGxvYykge1xuXHRjb25zdCBzdWJiZWRzID0gcGFyc2VFeHByUGFydHMoc3ViYmVkKVxuXHRyZXR1cm4gbmV3IFNldFN1Yihsb2MsIG9iamVjdCwgc3ViYmVkcywgb3BUeXBlLCBzZXRLaW5kKGF0KSwgcGFyc2VFeHByKGFmdGVyKSlcbn1cblxuZnVuY3Rpb24gcGFyc2VMb2NhbE11dGF0ZShsb2NhbHNUb2tlbnMsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzSnVzdE5hbWVzKGxvY2Fsc1Rva2Vucylcblx0Y2hlY2sobG9jYWxzLmxlbmd0aCA9PT0gMSwgbG9jLCAnVE9ETzogTG9jYWxEZXN0cnVjdHVyZU11dGF0ZScpXG5cdGNvbnN0IG5hbWUgPSBsb2NhbHNbMF0ubmFtZVxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0cmV0dXJuIG5ldyBMb2NhbE11dGF0ZShsb2MsIG5hbWUsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBwYXJzZUFzc2lnbihsb2NhbHNUb2tlbnMsIGtpbmQsIHZhbHVlVG9rZW5zLCBsb2MpIHtcblx0Y29uc3QgbG9jYWxzID0gcGFyc2VMb2NhbERlY2xhcmVzKGxvY2Fsc1Rva2VucylcblxuXHQvLyBIYW5kbGUgYGEuYCB3aGljaCBtb3ZlcyBhbiBvdXRlciBsb2NhbCBpbnRvIGFuIE9iakVudHJ5LlxuXHRpZiAoa2luZCA9PT0gS2V5d29yZHMuT2JqQXNzaWduICYmIHZhbHVlVG9rZW5zLmlzRW1wdHkoKSAmJiBsb2NhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0Y29uc3QgbG9jYWwgPSBsb2NhbHNbMF1cblx0XHRjaGVjayhsb2NhbC5vcFR5cGUgPT09IG51bGwsIGxvY2FsLmxvYywgKCkgPT5cblx0XHRcdGBUeXBlIGRlY2xhcmF0aW9uIHNob3VsZCBnbyB3aXRoIGluaXRpYWwgZGVjbGFyYXRpb24gb2YgJHtsb2NhbC5uYW1lfS5gKVxuXHRcdHJldHVybiBPYmpFbnRyeVBsYWluLmFjY2Vzcyhsb2MsIGxvY2FsLm5hbWUpXG5cdH1cblxuXHRjb25zdCB2YWx1ZSA9IHBhcnNlQXNzaWduVmFsdWUoa2luZCwgdmFsdWVUb2tlbnMpXG5cblx0Y29uc3QgaXNZaWVsZCA9IGtpbmQgPT09IEtleXdvcmRzLllpZWxkIHx8IGtpbmQgPT09IEtleXdvcmRzLllpZWxkVG9cblx0aWYgKGlzRW1wdHkobG9jYWxzKSkge1xuXHRcdGNoZWNrKGlzWWllbGQsIGxvY2Fsc1Rva2Vucy5sb2MsICdBc3NpZ25tZW50IHRvIG5vdGhpbmcnKVxuXHRcdHJldHVybiB2YWx1ZVxuXHR9IGVsc2Uge1xuXHRcdGlmIChpc1lpZWxkKVxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soIV8uaXNMYXp5KCksIF8ubG9jLCAnQ2FuIG5vdCB5aWVsZCB0byBsYXp5IHZhcmlhYmxlLicpXG5cblx0XHRjb25zdCBpc09iakFzc2lnbiA9IGtpbmQgPT09IEtleXdvcmRzLk9iakFzc2lnblxuXG5cdFx0aWYgKGtpbmQgPT09IEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRmb3IgKGxldCBfIG9mIGxvY2Fscykge1xuXHRcdFx0XHRjaGVjayghXy5pc0xhenkoKSwgXy5sb2MsICdMYXp5IGxvY2FsIGNhbiBub3QgYmUgbXV0YWJsZS4nKVxuXHRcdFx0XHRfLmtpbmQgPSBMb2NhbERlY2xhcmVzLk11dGFibGVcblx0XHRcdH1cblxuXHRcdGNvbnN0IHdyYXAgPSBfID0+IGlzT2JqQXNzaWduID8gbmV3IE9iakVudHJ5QXNzaWduKGxvYywgXykgOiBfXG5cblx0XHRpZiAobG9jYWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Y29uc3QgYXNzaWduZWUgPSBsb2NhbHNbMF1cblx0XHRcdGNvbnN0IGFzc2lnbiA9IG5ldyBBc3NpZ25TaW5nbGUobG9jLCBhc3NpZ25lZSwgdmFsdWUpXG5cdFx0XHRyZXR1cm4gd3JhcChhc3NpZ24pXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGtpbmQgPSBsb2NhbHNbMF0ua2luZFxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGxvY2Fscylcblx0XHRcdFx0Y2hlY2soXy5raW5kID09PSBraW5kLCBfLmxvYyxcblx0XHRcdFx0XHQnQWxsIGxvY2FscyBvZiBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgbXVzdCBiZSBvZiB0aGUgc2FtZSBraW5kLicpXG5cdFx0XHRyZXR1cm4gd3JhcChuZXcgQXNzaWduRGVzdHJ1Y3R1cmUobG9jLCBsb2NhbHMsIHZhbHVlLCBraW5kKSlcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NpZ25WYWx1ZShraW5kLCB2YWx1ZVRva2Vucykge1xuXHRjb25zdCB2YWx1ZSA9ICgpID0+IHBhcnNlRXhwcih2YWx1ZVRva2Vucylcblx0Y29uc3Qgb3BWYWx1ZSA9ICgpID0+IG9wUGFyc2VFeHByKHZhbHVlVG9rZW5zKVxuXHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkOlxuXHRcdFx0cmV0dXJuIG5ldyBZaWVsZCh2YWx1ZVRva2Vucy5sb2MsIG9wVmFsdWUoKSlcblx0XHRjYXNlIEtleXdvcmRzLllpZWxkVG86XG5cdFx0XHRyZXR1cm4gbmV3IFlpZWxkVG8odmFsdWVUb2tlbnMubG9jLCBvcFZhbHVlKCkpXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiB2YWx1ZSgpXG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VBc3NlcnQobmVnYXRlLCB0b2tlbnMpIHtcblx0Y2hlY2tOb25FbXB0eSh0b2tlbnMsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Bc3NlcnQpfS5gKVxuXG5cdGNvbnN0IFtjb25kVG9rZW5zLCBvcFRocm93bl0gPVxuXHRcdGlmRWxzZSh0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0tleXdvcmQoS2V5d29yZHMuVGhyb3csIF8pKSxcblx0XHRcdCh7YmVmb3JlLCBhZnRlcn0pID0+IFtiZWZvcmUsIHBhcnNlRXhwcihhZnRlcildLFxuXHRcdFx0KCkgPT4gW3Rva2VucywgbnVsbF0pXG5cblx0Y29uc3QgcGFydHMgPSBwYXJzZUV4cHJQYXJ0cyhjb25kVG9rZW5zKVxuXHRjb25zdCBjb25kID0gcGFydHMubGVuZ3RoID09PSAxID8gcGFydHNbMF0gOiBuZXcgQ2FsbChjb25kVG9rZW5zLmxvYywgcGFydHNbMF0sIHRhaWwocGFydHMpKVxuXHRyZXR1cm4gbmV3IEFzc2VydCh0b2tlbnMubG9jLCBuZWdhdGUsIGNvbmQsIG9wVGhyb3duKVxufVxuIl19