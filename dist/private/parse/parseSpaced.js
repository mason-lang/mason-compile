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

					if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVNwYWNlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgR2V0dGVyRnVuLCBMYXp5LCBMb2NhbEFjY2VzcywgTWVtYmVyLCBNZW1iZXJGdW4sIFF1b3RlU2ltcGxlLCBRdW90ZVRhZ2dlZFRlbXBsYXRlLFxuXHRSYW5nZSwgU3ByZWFkLCBTdXBlckNhbGwsIFN1cGVyTWVtYmVyfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXAsIEdyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkcywgc2hvd0tleXdvcmR9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIG9wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VNZW1iZXJOYW1lIGZyb20gJy4vcGFyc2VNZW1iZXJOYW1lJ1xuaW1wb3J0IHBhcnNlTmFtZSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCBwYXJzZVNpbmdsZSBmcm9tICcuL3BhcnNlU2luZ2xlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuUGFyc2UgdG9rZW5zIGluIGEge0BsaW5rIEdyb3Vwcy5TcGFjZX0uXG5AcmV0dXJuIHtWYWx9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTcGFjZWQodG9rZW5zKSB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaCBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0c3dpdGNoIChoLmtpbmQpIHtcblx0XHRcdGNhc2UgS2V5d29yZHMuQW1wZXJzYW5kOiB7XG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIGgyKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhaWwgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IGgzID0gdGFpbC5oZWFkKClcblx0XHRcdFx0XHRjb25zdCBmdW4gPSBuZXcgR2V0dGVyRnVuKGgzLmxvYywgcGFyc2VNZW1iZXJOYW1lKGgzKSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKGZ1biwgdGFpbC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgZnVuID0gbmV3IE1lbWJlckZ1bihoMi5sb2MsIG51bGwsIHBhcnNlTWVtYmVyTmFtZShoMikpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChmdW4sIHJlc3QudGFpbCgpKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLkRvdDoge1xuXHRcdFx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuQW1wZXJzYW5kLCBoMikpIHtcblx0XHRcdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRjb25zdCBoMyA9IHRhaWwuaGVhZCgpXG5cdFx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTWVtYmVyTmFtZShoMylcblx0XHRcdFx0XHRjb25zdCBmdW4gPSBuZXcgTWVtYmVyRnVuKGgyLmxvYywgTG9jYWxBY2Nlc3MudGhpcyhoMi5sb2MpLCBuYW1lKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoZnVuLCB0YWlsLnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdFx0XHRcdGNvbnN0IG1lbWJlciA9IG5ldyBNZW1iZXIoaC5sb2MsIExvY2FsQWNjZXNzLnRoaXMoaC5sb2MpLCBuYW1lKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQobWVtYmVyLCByZXN0LnRhaWwoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwcmVhZCh0b2tlbnMubG9jLCBwYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUocmVzdC5oZWFkKCkpLCByZXN0LnRhaWwpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5MYXp5OlxuXHRcdFx0XHRyZXR1cm4gbmV3IExhenkoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5TdXBlcjoge1xuXHRcdFx0XHQvLyBUT0RPOiBoYW5kbGUgc3ViIGhlcmUgYXMgd2VsbFxuXHRcdFx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCBoMikpIHtcblx0XHRcdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRjb25zdCBzdXAgPSBuZXcgU3VwZXJNZW1iZXIoaDIubG9jLCBwYXJzZU1lbWJlck5hbWUodGFpbC5oZWFkKCkpKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoc3VwLCB0YWlsLnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgaDIpICYmIFNsaWNlLmdyb3VwKGgyKS5pc0VtcHR5KCkpIHtcblx0XHRcdFx0XHRjb25zdCB4ID0gbmV3IFN1cGVyQ2FsbChoMi5sb2MsIFtdLCB0cnVlKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdGZhaWwoYEV4cGVjdGVkICR7c2hvd0tleXdvcmQoS2V5d29yZHMuRG90KX0gb3IgJHtjb2RlKCcoKScpfSBgICtcblx0XHRcdFx0XHRcdGBhZnRlciAke3Nob3dLZXl3b3JkKEtleXdvcmRzLlN1cGVyKX1gKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaWNrOiB7XG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0Y29uc3QgcXVvdGUgPSBuZXcgUXVvdGVTaW1wbGUoaDIubG9jLCBwYXJzZU5hbWUoaDIpKVxuXHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHF1b3RlLCByZXN0LnRhaWwoKSlcblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuVHlwZTpcblx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnMoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpLCBMb2NhbEFjY2Vzcy5mb2N1cyhoLmxvYykpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cdHJldHVybiBwYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUoaCksIHJlc3QpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhY2VkRm9sZChzdGFydCwgcmVzdCkge1xuXHRsZXQgYWNjID0gc3RhcnRcblx0Zm9yIChsZXQgaSA9IHJlc3QuX3N0YXJ0OyBpIDwgcmVzdC5fZW5kOyBpID0gaSArIDEpIHtcblx0XHRmdW5jdGlvbiByZXN0VmFsKCkge1xuXHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHJlc3QuX2Nob3BTdGFydChpICsgMSkpXG5cdFx0fVxuXG5cdFx0Y29uc3QgdG9rZW4gPSByZXN0Ll90b2tlbnNbaV1cblx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuQW1wZXJzYW5kOlxuXHRcdFx0XHRcdGlmIChpID09PSByZXN0Ll9lbmQgLSAxKVxuXHRcdFx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHRcdFx0XHRpID0gaSArIDFcblx0XHRcdFx0XHRhY2MgPSBuZXcgTWVtYmVyRnVuKHRva2VuLmxvYywgYWNjLCBwYXJzZU1lbWJlck5hbWUocmVzdC5fdG9rZW5zW2ldKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkRvdDoge1xuXHRcdFx0XHRcdC8vIElmIHRoaXMgd2VyZSB0aGUgbGFzdCBvbmUsXG5cdFx0XHRcdFx0Ly8gaXQgd291bGQgbm90IGJlIGEgS2V5d29yZHMuRG90IGJ1dCBhIEtleXdvcmRzLk9iakFzc2lnblxuXHRcdFx0XHRcdGFzc2VydChpIDwgcmVzdC5fZW5kIC0gMSlcblx0XHRcdFx0XHRpID0gaSArIDFcblx0XHRcdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCBwYXJzZU1lbWJlck5hbWUocmVzdC5fdG9rZW5zW2ldKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRG90Mjpcblx0XHRcdFx0XHRjaGVjayhpIDwgcmVzdC5fZW5kIC0gMSwgdG9rZW4ubG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YFVzZSAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkRvdDMpfSBmb3IgaW5maW5pdGUgcmFuZ2VzLmApXG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBSYW5nZSh0b2tlbi5sb2MsIGFjYywgcmVzdFZhbCgpLCBmYWxzZSlcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRcdHJldHVybiBuZXcgUmFuZ2UodG9rZW4ubG9jLCBhY2MsIG9wSWYoaSA8IHJlc3QuX2VuZCAtIDEsIHJlc3RWYWwpLCB0cnVlKVxuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkZvY3VzOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKHRva2VuLmxvYywgYWNjLCBbTG9jYWxBY2Nlc3MuZm9jdXMobG9jKV0pXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5UeXBlOlxuXHRcdFx0XHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKHRva2VuLmxvYywgcmVzdFZhbCgpLCBhY2MpXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHRcdH1cblx0XHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgR3JvdXBzLkJyYWNrZXQ6XG5cdFx0XHRcdFx0YWNjID0gQ2FsbC5zdWIobG9jLCBhY2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRjaGVja0VtcHR5KHNsaWNlLCAoKSA9PiBgVXNlICR7Y29kZSgnKGEgYiknKX0sIG5vdCAke2NvZGUoJ2EoYiknKX1gKVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKGxvYywgYWNjLCBbXSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5RdW90ZTpcblx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUYWdnZWRUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdFx0fVxuXHRcdH0gZWxzZVxuXHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0fVxuXHRyZXR1cm4gYWNjXG59XG4iXX0=