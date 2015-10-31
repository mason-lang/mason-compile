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

			case _Token.Keywords.SuperVal:
				{
					const h2 = rest.head();

					if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
						const tail = rest.tail();
						const sup = new _MsAst.SuperMember(h2.loc, (0, _parseMemberName2.default)(tail.head()));
						return parseSpacedFold(sup, tail.tail());
					} else if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, h2) && _Slice2.default.group(h2).isEmpty()) {
						const x = new _MsAst.SuperCall(h2.loc, []);
						return parseSpacedFold(x, rest.tail());
					} else (0, _context.fail)(`Expected ${ (0, _CompileError.code)('.') } or ${ (0, _CompileError.code)('()') } after ${ (0, _CompileError.code)('super') }`);
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
					(0, _context.check)(i < rest._end - 1, token.loc, () => `Use ${ (0, _CompileError.code)('...') } for infinite ranges.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7O1VBQVgsV0FBVyIsImZpbGUiOiJwYXJzZVNwYWNlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgR2V0dGVyRnVuLCBMYXp5LCBMb2NhbEFjY2VzcywgTWVtYmVyLCBNZW1iZXJGdW4sIFF1b3RlU2ltcGxlLCBRdW90ZVRhZ2dlZFRlbXBsYXRlLFxuXHRSYW5nZSwgU3ByZWFkLCBTdXBlckNhbGwsIFN1cGVyTWVtYmVyfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXAsIEdyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS5cbkByZXR1cm4ge1ZhbH1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVNwYWNlZCh0b2tlbnMpIHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChoIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGgua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5BbXBlcnNhbmQ6IHtcblx0XHRcdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdFx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgaDIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGFpbCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdFx0Y29uc3QgaDMgPSB0YWlsLmhlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGZ1biA9IG5ldyBHZXR0ZXJGdW4oaDMubG9jLCBwYXJzZU1lbWJlck5hbWUoaDMpKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoZnVuLCB0YWlsLnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBmdW4gPSBuZXcgTWVtYmVyRnVuKGgyLmxvYywgbnVsbCwgcGFyc2VNZW1iZXJOYW1lKGgyKSlcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKGZ1biwgcmVzdC50YWlsKCkpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuRG90OiB7XG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5BbXBlcnNhbmQsIGgyKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhaWwgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IGgzID0gdGFpbC5oZWFkKClcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gcGFyc2VNZW1iZXJOYW1lKGgzKVxuXHRcdFx0XHRcdGNvbnN0IGZ1biA9IG5ldyBNZW1iZXJGdW4oaDIubG9jLCBMb2NhbEFjY2Vzcy50aGlzKGgyLmxvYyksIG5hbWUpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChmdW4sIHRhaWwudGFpbCgpKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBwYXJzZU1lbWJlck5hbWUocmVzdC5oZWFkKCkpXG5cdFx0XHRcdFx0Y29uc3QgbWVtYmVyID0gbmV3IE1lbWJlcihoLmxvYywgTG9jYWxBY2Nlc3MudGhpcyhoLmxvYyksIG5hbWUpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChtZW1iZXIsIHJlc3QudGFpbCgpKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdHJldHVybiBuZXcgU3ByZWFkKHRva2Vucy5sb2MsIHBhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShyZXN0LmhlYWQoKSksIHJlc3QudGFpbCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkxhenk6XG5cdFx0XHRcdHJldHVybiBuZXcgTGF6eShoLmxvYywgcGFyc2VTcGFjZWQocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN1cGVyVmFsOiB7XG5cdFx0XHRcdC8vIFRPRE86IGhhbmRsZSBzdWIgaGVyZSBhcyB3ZWxsXG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIGgyKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhaWwgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHN1cCA9IG5ldyBTdXBlck1lbWJlcihoMi5sb2MsIHBhcnNlTWVtYmVyTmFtZSh0YWlsLmhlYWQoKSkpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChzdXAsIHRhaWwudGFpbCgpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlBhcmVudGhlc2lzLCBoMikgJiYgU2xpY2UuZ3JvdXAoaDIpLmlzRW1wdHkoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJDYWxsKGgyLmxvYywgW10pXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZCh4LCByZXN0LnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0ZmFpbChgRXhwZWN0ZWQgJHtjb2RlKCcuJyl9IG9yICR7Y29kZSgnKCknKX0gYWZ0ZXIgJHtjb2RlKCdzdXBlcicpfWApXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLlRpY2s6IHtcblx0XHRcdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdFx0XHRjb25zdCBxdW90ZSA9IG5ldyBRdW90ZVNpbXBsZShoMi5sb2MsIHBhcnNlTmFtZShoMikpXG5cdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQocXVvdGUsIHJlc3QudGFpbCgpKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UeXBlOlxuXHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyhoLmxvYywgcGFyc2VTcGFjZWQocmVzdCksIExvY2FsQWNjZXNzLmZvY3VzKGgubG9jKSlcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIGZhbGwgdGhyb3VnaFxuXHRcdH1cblx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShoKSwgcmVzdClcbn1cblxuZnVuY3Rpb24gcGFyc2VTcGFjZWRGb2xkKHN0YXJ0LCByZXN0KSB7XG5cdGxldCBhY2MgPSBzdGFydFxuXHRmb3IgKGxldCBpID0gcmVzdC5fc3RhcnQ7IGkgPCByZXN0Ll9lbmQ7IGkgPSBpICsgMSkge1xuXHRcdGZ1bmN0aW9uIHJlc3RWYWwoKSB7XG5cdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWQocmVzdC5fY2hvcFN0YXJ0KGkgKyAxKSlcblx0XHR9XG5cblx0XHRjb25zdCB0b2tlbiA9IHJlc3QuX3Rva2Vuc1tpXVxuXHRcdGNvbnN0IGxvYyA9IHRva2VuLmxvY1xuXHRcdGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5BbXBlcnNhbmQ6XG5cdFx0XHRcdFx0aWYgKGkgPT09IHJlc3QuX2VuZCAtIDEpXG5cdFx0XHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdFx0XHRcdGkgPSBpICsgMVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBNZW1iZXJGdW4odG9rZW4ubG9jLCBhY2MsIHBhcnNlTWVtYmVyTmFtZShyZXN0Ll90b2tlbnNbaV0pKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRG90OiB7XG5cdFx0XHRcdFx0Ly8gSWYgdGhpcyB3ZXJlIHRoZSBsYXN0IG9uZSxcblx0XHRcdFx0XHQvLyBpdCB3b3VsZCBub3QgYmUgYSBLZXl3b3Jkcy5Eb3QgYnV0IGEgS2V5d29yZHMuT2JqQXNzaWduXG5cdFx0XHRcdFx0YXNzZXJ0KGkgPCByZXN0Ll9lbmQgLSAxKVxuXHRcdFx0XHRcdGkgPSBpICsgMVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBhY2MsIHBhcnNlTWVtYmVyTmFtZShyZXN0Ll90b2tlbnNbaV0pKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QyOlxuXHRcdFx0XHRcdGNoZWNrKGkgPCByZXN0Ll9lbmQgLSAxLCB0b2tlbi5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgVXNlICR7Y29kZSgnLi4uJyl9IGZvciBpbmZpbml0ZSByYW5nZXMuYClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFJhbmdlKHRva2VuLmxvYywgYWNjLCByZXN0VmFsKCksIGZhbHNlKVxuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBSYW5nZSh0b2tlbi5sb2MsIGFjYywgb3BJZihpIDwgcmVzdC5fZW5kIC0gMSwgcmVzdFZhbCksIHRydWUpXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRm9jdXM6XG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFtMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLlR5cGU6XG5cdFx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnModG9rZW4ubG9jLCByZXN0VmFsKCksIGFjYylcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdFx0fVxuXHRcdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBHcm91cHMuQnJhY2tldDpcblx0XHRcdFx0XHRhY2MgPSBDYWxsLnN1Yihsb2MsIGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR3JvdXBzLlBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNoZWNrRW1wdHkoc2xpY2UsICgpID0+IGBVc2UgJHtjb2RlKCcoYSBiKScpfSwgbm90ICR7Y29kZSgnYShiKScpfWApXG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR3JvdXBzLlF1b3RlOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBRdW90ZVRhZ2dlZFRlbXBsYXRlKGxvYywgYWNjLCBwYXJzZVF1b3RlKHNsaWNlKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0XHR9XG5cdFx0fSBlbHNlXG5cdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHR9XG5cdHJldHVybiBhY2Ncbn1cbiJdfQ==