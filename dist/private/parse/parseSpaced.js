'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseMemberName', './parseName', './parseQuote', './parseSingle', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseMemberName'), require('./parseName'), require('./parseQuote'), require('./parseSingle'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseMemberName, global.parseName, global.parseQuote, global.parseSingle, global.Slice);
		global.parseSpaced = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseMemberName, _parseName, _parseQuote, _parseSingle, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseSpaced;

	var _parseMemberName2 = _interopRequireDefault(_parseMemberName);

	var _parseName2 = _interopRequireDefault(_parseName);

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseSpaced(tokens) {
		const h = tokens.head(),
		      rest = tokens.tail();
		if (h instanceof _Token.Keyword) switch (h.kind) {
			case _Token.Keywords.Ampersand:
				{
					const h2 = rest.head();
					if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, h2)) return new _MsAst.SimpleFun(tokens.loc, (0, _parse.parseExpr)(_Slice2.default.group(h2)));else if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
						const tail = rest.tail();
						const h3 = tail.head();
						const fun = new _MsAst.GetterFun(h3.loc, (0, _parseMemberName2.default)(h3));
						return parseSpacedFold(fun, tail.tail());
					} else {
						const fun = new _MsAst.MemberFun(h2.loc, null, (0, _parseMemberName2.default)(h2));
						return parseSpacedFold(fun, rest.tail());
					}
				}

			case _Token.Keywords.Dot:
				{
					const h2 = rest.head();

					if ((0, _Token.isKeyword)(_Token.Keywords.Ampersand, h2)) {
						const tail = rest.tail();
						const h3 = tail.head();
						const name = (0, _parseMemberName2.default)(h3);
						const fun = new _MsAst.MemberFun(h2.loc, _MsAst.LocalAccess.this(h2.loc), name);
						return parseSpacedFold(fun, tail.tail());
					} else {
						const name = (0, _parseMemberName2.default)(rest.head());
						const member = new _MsAst.Member(h.loc, _MsAst.LocalAccess.this(h.loc), name);
						return parseSpacedFold(member, rest.tail());
					}
				}

			case _Token.Keywords.Dot3:
				return new _MsAst.Spread(tokens.loc, parseSpacedFold((0, _parseSingle2.default)(rest.head()), rest.tail));

			case _Token.Keywords.Lazy:
				return new _MsAst.Lazy(h.loc, parseSpaced(rest));

			case _Token.Keywords.Super:
				{
					const h2 = rest.head();

					if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
						const tail = rest.tail();
						const sup = new _MsAst.SuperMember(h2.loc, (0, _parseMemberName2.default)(tail.head()));
						return parseSpacedFold(sup, tail.tail());
					} else if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, h2) && _Slice2.default.group(h2).isEmpty()) {
						const x = new _MsAst.SuperCall(h2.loc, [], true);
						return parseSpacedFold(x, rest.tail());
					} else (0, _context.fail)(`Expected ${ (0, _Token.showKeyword)(_Token.Keywords.Dot) } or ${ (0, _CompileError.code)('()') } ` + `after ${ (0, _Token.showKeyword)(_Token.Keywords.Super) }`);
				}

			case _Token.Keywords.Tick:
				{
					const h2 = rest.head();
					const quote = new _MsAst.QuoteSimple(h2.loc, (0, _parseName2.default)(h2));
					return parseSpacedFold(quote, rest.tail());
				}

			case _Token.Keywords.Colon:
				return _MsAst.Call.contains(h.loc, parseSpaced(rest), _MsAst.LocalAccess.focus(h.loc));

			default:}
		return parseSpacedFold((0, _parseSingle2.default)(h), rest);
	}

	function parseSpacedFold(start, rest) {
		let acc = start;

		for (let i = rest._start; i < rest._end; i = i + 1) {
			function restVal() {
				return parseSpaced(rest._chopStart(i + 1));
			}

			const token = rest._tokens[i];
			const loc = token.loc;
			if (token instanceof _Token.Keyword) switch (token.kind) {
				case _Token.Keywords.Ampersand:
					if (i === rest._end - 1) (0, _checks.unexpected)(token);
					i = i + 1;
					acc = new _MsAst.MemberFun(token.loc, acc, (0, _parseMemberName2.default)(rest._tokens[i]));
					break;

				case _Token.Keywords.Dot:
					{
						(0, _util.assert)(i < rest._end - 1);
						i = i + 1;
						acc = new _MsAst.Member(token.loc, acc, (0, _parseMemberName2.default)(rest._tokens[i]));
						break;
					}

				case _Token.Keywords.Dot2:
					(0, _context.check)(i < rest._end - 1, token.loc, () => `Use ${ (0, _Token.showKeyword)(_Token.Keywords.Dot3) } for infinite ranges.`);
					return new _MsAst.Range(token.loc, acc, restVal(), false);

				case _Token.Keywords.Dot3:
					return new _MsAst.Range(token.loc, acc, (0, _util.opIf)(i < rest._end - 1, restVal), true);

				case _Token.Keywords.Focus:
					acc = new _MsAst.Call(token.loc, acc, [_MsAst.LocalAccess.focus(loc)]);
					break;

				case _Token.Keywords.Colon:
					return _MsAst.Call.contains(token.loc, restVal(), acc);

				default:
					(0, _checks.unexpected)(token);
			} else if (token instanceof _Token.Group) {
				const slice = _Slice2.default.group(token);

				switch (token.kind) {
					case _Token.Groups.Bracket:
						acc = _MsAst.Call.sub(loc, acc, (0, _parse.parseExprParts)(slice));
						break;

					case _Token.Groups.Parenthesis:
						(0, _checks.checkEmpty)(slice, () => `Use ${ (0, _CompileError.code)('(a b)') }, not ${ (0, _CompileError.code)('a(b)') }`);
						acc = new _MsAst.Call(loc, acc, []);
						break;

					case _Token.Groups.Quote:
						acc = new _MsAst.QuoteTaggedTemplate(loc, acc, (0, _parseQuote2.default)(slice));
						break;

					default:
						(0, _checks.unexpected)(token);
				}
			} else (0, _checks.unexpected)(token);
		}

		return acc;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZVNwYWNlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=