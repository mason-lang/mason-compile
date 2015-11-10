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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

			case _Token.Keywords.Type:
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

				case _Token.Keywords.Type:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVNwYWNlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgR2V0dGVyRnVuLCBMYXp5LCBMb2NhbEFjY2VzcywgTWVtYmVyLCBNZW1iZXJGdW4sIFF1b3RlU2ltcGxlLCBRdW90ZVRhZ2dlZFRlbXBsYXRlLFxuXHRSYW5nZSwgU2ltcGxlRnVuLCBTcHJlYWQsIFN1cGVyQ2FsbCwgU3VwZXJNZW1iZXJ9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cCwgR3JvdXBzLCBpc0dyb3VwLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBzaG93S2V5d29yZH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwciwgcGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2UqJ1xuaW1wb3J0IHBhcnNlTWVtYmVyTmFtZSBmcm9tICcuL3BhcnNlTWVtYmVyTmFtZSdcbmltcG9ydCBwYXJzZU5hbWUgZnJvbSAnLi9wYXJzZU5hbWUnXG5pbXBvcnQgcGFyc2VRdW90ZSBmcm9tICcuL3BhcnNlUXVvdGUnXG5pbXBvcnQgcGFyc2VTaW5nbGUgZnJvbSAnLi9wYXJzZVNpbmdsZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIHRva2VucyBpbiBhIHtAbGluayBHcm91cHMuU3BhY2V9LlxuQHJldHVybiB7VmFsfVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlU3BhY2VkKHRva2Vucykge1xuXHRjb25zdCBoID0gdG9rZW5zLmhlYWQoKSwgcmVzdCA9IHRva2Vucy50YWlsKClcblx0aWYgKGggaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdHN3aXRjaCAoaC5raW5kKSB7XG5cdFx0XHRjYXNlIEtleXdvcmRzLkFtcGVyc2FuZDoge1xuXHRcdFx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0XHRcdGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgaDIpKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgU2ltcGxlRnVuKHRva2Vucy5sb2MsIHBhcnNlRXhwcihTbGljZS5ncm91cChoMikpKVxuXHRcdFx0XHRlbHNlIGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCBoMikpIHtcblx0XHRcdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRjb25zdCBoMyA9IHRhaWwuaGVhZCgpXG5cdFx0XHRcdFx0Y29uc3QgZnVuID0gbmV3IEdldHRlckZ1bihoMy5sb2MsIHBhcnNlTWVtYmVyTmFtZShoMykpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChmdW4sIHRhaWwudGFpbCgpKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGZ1biA9IG5ldyBNZW1iZXJGdW4oaDIubG9jLCBudWxsLCBwYXJzZU1lbWJlck5hbWUoaDIpKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoZnVuLCByZXN0LnRhaWwoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3Q6IHtcblx0XHRcdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkFtcGVyc2FuZCwgaDIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGFpbCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgaDMgPSB0YWlsLmhlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZU1lbWJlck5hbWUoaDMpXG5cdFx0XHRcdFx0Y29uc3QgZnVuID0gbmV3IE1lbWJlckZ1bihoMi5sb2MsIExvY2FsQWNjZXNzLnRoaXMoaDIubG9jKSwgbmFtZSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKGZ1biwgdGFpbC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTWVtYmVyTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdFx0XHRjb25zdCBtZW1iZXIgPSBuZXcgTWVtYmVyKGgubG9jLCBMb2NhbEFjY2Vzcy50aGlzKGgubG9jKSwgbmFtZSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKG1lbWJlciwgcmVzdC50YWlsKCkpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0cmV0dXJuIG5ldyBTcHJlYWQodG9rZW5zLmxvYywgcGFyc2VTcGFjZWRGb2xkKHBhcnNlU2luZ2xlKHJlc3QuaGVhZCgpKSwgcmVzdC50YWlsKSlcblx0XHRcdGNhc2UgS2V5d29yZHMuTGF6eTpcblx0XHRcdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0XHRcdGNhc2UgS2V5d29yZHMuU3VwZXI6IHtcblx0XHRcdFx0Ly8gVE9ETzogaGFuZGxlIHN1YiBoZXJlIGFzIHdlbGxcblx0XHRcdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgaDIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGFpbCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdFx0Y29uc3Qgc3VwID0gbmV3IFN1cGVyTWVtYmVyKGgyLmxvYywgcGFyc2VNZW1iZXJOYW1lKHRhaWwuaGVhZCgpKSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHN1cCwgdGFpbC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUGFyZW50aGVzaXMsIGgyKSAmJiBTbGljZS5ncm91cChoMikuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdFx0Y29uc3QgeCA9IG5ldyBTdXBlckNhbGwoaDIubG9jLCBbXSwgdHJ1ZSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHgsIHJlc3QudGFpbCgpKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRmYWlsKGBFeHBlY3RlZCAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkRvdCl9IG9yICR7Y29kZSgnKCknKX0gYCArXG5cdFx0XHRcdFx0XHRgYWZ0ZXIgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5TdXBlcil9YClcblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuVGljazoge1xuXHRcdFx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0XHRcdGNvbnN0IHF1b3RlID0gbmV3IFF1b3RlU2ltcGxlKGgyLmxvYywgcGFyc2VOYW1lKGgyKSlcblx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChxdW90ZSwgcmVzdC50YWlsKCkpXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLlR5cGU6XG5cdFx0XHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0fVxuXHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHBhcnNlU2luZ2xlKGgpLCByZXN0KVxufVxuXG5mdW5jdGlvbiBwYXJzZVNwYWNlZEZvbGQoc3RhcnQsIHJlc3QpIHtcblx0bGV0IGFjYyA9IHN0YXJ0XG5cdGZvciAobGV0IGkgPSByZXN0Ll9zdGFydDsgaSA8IHJlc3QuX2VuZDsgaSA9IGkgKyAxKSB7XG5cdFx0ZnVuY3Rpb24gcmVzdFZhbCgpIHtcblx0XHRcdHJldHVybiBwYXJzZVNwYWNlZChyZXN0Ll9jaG9wU3RhcnQoaSArIDEpKVxuXHRcdH1cblxuXHRcdGNvbnN0IHRva2VuID0gcmVzdC5fdG9rZW5zW2ldXG5cdFx0Y29uc3QgbG9jID0gdG9rZW4ubG9jXG5cdFx0aWYgKHRva2VuIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkFtcGVyc2FuZDpcblx0XHRcdFx0XHRpZiAoaSA9PT0gcmVzdC5fZW5kIC0gMSlcblx0XHRcdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0XHRcdFx0aSA9IGkgKyAxXG5cdFx0XHRcdFx0YWNjID0gbmV3IE1lbWJlckZ1bih0b2tlbi5sb2MsIGFjYywgcGFyc2VNZW1iZXJOYW1lKHJlc3QuX3Rva2Vuc1tpXSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3Q6IHtcblx0XHRcdFx0XHQvLyBJZiB0aGlzIHdlcmUgdGhlIGxhc3Qgb25lLFxuXHRcdFx0XHRcdC8vIGl0IHdvdWxkIG5vdCBiZSBhIEtleXdvcmRzLkRvdCBidXQgYSBLZXl3b3Jkcy5PYmpBc3NpZ25cblx0XHRcdFx0XHRhc3NlcnQoaSA8IHJlc3QuX2VuZCAtIDEpXG5cdFx0XHRcdFx0aSA9IGkgKyAxXG5cdFx0XHRcdFx0YWNjID0gbmV3IE1lbWJlcih0b2tlbi5sb2MsIGFjYywgcGFyc2VNZW1iZXJOYW1lKHJlc3QuX3Rva2Vuc1tpXSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkRvdDI6XG5cdFx0XHRcdFx0Y2hlY2soaSA8IHJlc3QuX2VuZCAtIDEsIHRva2VuLmxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBVc2UgJHtzaG93S2V5d29yZChLZXl3b3Jkcy5Eb3QzKX0gZm9yIGluZmluaXRlIHJhbmdlcy5gKVxuXHRcdFx0XHRcdHJldHVybiBuZXcgUmFuZ2UodG9rZW4ubG9jLCBhY2MsIHJlc3RWYWwoKSwgZmFsc2UpXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mzpcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFJhbmdlKHRva2VuLmxvYywgYWNjLCBvcElmKGkgPCByZXN0Ll9lbmQgLSAxLCByZXN0VmFsKSwgdHJ1ZSlcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb2N1czpcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbCh0b2tlbi5sb2MsIGFjYywgW0xvY2FsQWNjZXNzLmZvY3VzKGxvYyldKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuVHlwZTpcblx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHJlc3RWYWwoKSwgYWNjKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0XHR9XG5cdFx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBHcm91cCkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5CcmFja2V0OlxuXHRcdFx0XHRcdGFjYyA9IENhbGwuc3ViKGxvYywgYWNjLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBHcm91cHMuUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT4gYFVzZSAke2NvZGUoJyhhIGIpJyl9LCBub3QgJHtjb2RlKCdhKGIpJyl9YClcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbChsb2MsIGFjYywgW10pXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBHcm91cHMuUXVvdGU6XG5cdFx0XHRcdFx0YWNjID0gbmV3IFF1b3RlVGFnZ2VkVGVtcGxhdGUobG9jLCBhY2MsIHBhcnNlUXVvdGUoc2xpY2UpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHRcdH1cblx0XHR9IGVsc2Vcblx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdH1cblx0cmV0dXJuIGFjY1xufVxuIl19