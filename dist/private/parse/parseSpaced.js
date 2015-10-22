(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './parseMemberName', './parseName', './parseQuote', './parseSingle', './Slice'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parse*'), require('./parseMemberName'), require('./parseName'), require('./parseQuote'), require('./parseSingle'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.checks, global.parse, global.parseMemberName, global.parseName, global.parseQuote, global.parseSingle, global.Slice);
		global.parseSpaced = mod.exports;
	}
})(this, function (exports, module, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _parseMemberName, _parseName, _parseQuote, _parseSingle, _Slice) {
	'use strict';

	module.exports = parseSpaced;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseMemberName2 = _interopRequireDefault(_parseMemberName);

	var _parseName2 = _interopRequireDefault(_parseName);

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _parseSingle2 = _interopRequireDefault(_parseSingle);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse tokens in a {@link Groups.Space}.
 @return {Val}
 */

	function parseSpaced(tokens) {
		const h = tokens.head(),
		      rest = tokens.tail();
		if ((0, _Token.isKeyword)(_Token.Keywords.Type, h)) return _MsAst.Call.contains(h.loc, parseSpaced(rest), _MsAst.LocalAccess.focus(h.loc));else if ((0, _Token.isKeyword)(_Token.Keywords.Lazy, h)) return new _MsAst.Lazy(h.loc, parseSpaced(rest));else if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h)) {
			const name = (0, _parseName2.default)(rest.head());
			const rest2 = rest.tail();
			const member = new _MsAst.Member(h.loc, _MsAst.LocalAccess.this(h.loc), name);
			return rest2.isEmpty() ? member : parseSpacedFold(member, rest.tail());
		} else if ((0, _Token.isKeyword)(_Token.Keywords.Ellipsis, h)) return new _MsAst.Splat(tokens.loc, parseSpacedFold((0, _parseSingle2.default)(rest.head()), rest.tail));else if ((0, _Token.isKeyword)(_Token.Keywords.SuperVal, h)) {
			// TODO: handle sub here as well
			const h2 = rest.head();
			if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
				const tail = rest.tail();
				const sup = new _MsAst.SuperMember(h2.loc, (0, _parseMemberName2.default)(tail.head()));
				return parseSpacedFold(sup, tail.tail());
			} else if ((0, _Token.isGroup)(_Token.Groups.Parenthesis, h2) && _Slice2.default.group(h2).isEmpty()) {
				const x = new _MsAst.SuperCall(h2.loc, []);
				return parseSpacedFold(x, rest.tail());
			} else (0, _context.fail)(`Expected ${ (0, _CompileError.code)('.') } or ${ (0, _CompileError.code)('()') } after ${ (0, _CompileError.code)('super') }`);
		} else return parseSpacedFold((0, _parseSingle2.default)(h), rest);
	}

	function parseSpacedFold(start, rest) {
		let acc = start;
		for (let i = rest._start; i < rest._end; i = i + 1) {
			const token = rest._tokens[i];
			const loc = token.loc;
			if ((0, _Token.isKeyword)(_Token.Keywords.Dot, token)) {
				// If this was the last one, it would not be a Keywords.Dot but a Keywords.ObjAssign
				(0, _util.assert)(i < rest._end - 1);
				i = i + 1;
				const next = rest._tokens[i];
				acc = new _MsAst.Member(token.loc, acc, (0, _parseMemberName2.default)(next));
			} else if (token instanceof _Token.Keyword) switch (token.kind) {
				case _Token.Keywords.Focus:
					acc = new _MsAst.Call(token.loc, acc, [_MsAst.LocalAccess.focus(loc)]);
					break;
				case _Token.Keywords.Type:
					{
						const type = parseSpaced(rest._chopStart(i + 1));
						return _MsAst.Call.contains(token.loc, type, acc);
					}
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
						acc = new _MsAst.QuoteTemplate(loc, acc, (0, _parseQuote2.default)(slice));
						break;
					default:
						(0, _checks.unexpected)(token);
				}
			}
		}
		return acc;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBcEIsVUFBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNDLFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzdDLE1BQUksV0FoQjJCLFNBQVMsRUFnQjFCLE9BaEJxQyxRQUFRLENBZ0JwQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQzlCLE9BQU8sT0FuQkQsSUFBSSxDQW1CRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FuQjdCLFdBQVcsQ0FtQjhCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQSxLQUNwRSxJQUFJLFdBbEJzQixTQUFTLEVBa0JyQixPQWxCZ0MsUUFBUSxDQWtCL0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNuQyxPQUFPLFdBckJLLElBQUksQ0FxQkEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxLQUNyQyxJQUFJLFdBcEJzQixTQUFTLEVBb0JyQixPQXBCZ0MsUUFBUSxDQW9CL0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ3BDLFNBQU0sSUFBSSxHQUFHLHlCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ25DLFNBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUN6QixTQUFNLE1BQU0sR0FBRyxXQXpCZ0IsTUFBTSxDQXlCWCxDQUFDLENBQUMsR0FBRyxFQUFFLE9BekJmLFdBQVcsQ0F5QmdCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFB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QUFPLENBQUMsRUFBQyxNQUFNLEdBQUUsa0JBN0VsRCxJQUFJLEVBNkVtRCxNQUFNLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNwRSxTQUFHLEdBQUcsV0E1RUgsSUFBSSxDQTRFUSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzVCLFlBQUs7QUFBQSxBQUNOLFVBQUssT0E1RU0sTUFBTSxDQTRFTCxLQUFLO0FBQ2hCLFNBQUcsR0FBRyxXQS9FOEIsYUFBYSxDQStFekIsR0FBRyxFQUFFLEdBQUcsRUFBRSwwQkFBVyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3BELFlBQUs7QUFBQSxBQUNOO0FBQ0Msa0JBOUVlLFVBQVUsRUE4RWQsS0FBSyxDQUFDLENBQUE7QUFBQSxLQUNsQjtJQUNEO0dBQ0Q7QUFDRCxTQUFPLEdBQUcsQ0FBQTtFQUNWIiwiZmlsZSI6InBhcnNlU3BhY2VkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2ZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0NhbGwsIExhenksIExvY2FsQWNjZXNzLCBNZW1iZXIsIFF1b3RlVGVtcGxhdGUsIFNwbGF0LCBTdXBlckNhbGwsIFN1cGVyTWVtYmVyXG5cdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwLCBHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrRW1wdHksIHVuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgcGFyc2VNZW1iZXJOYW1lIGZyb20gJy4vcGFyc2VNZW1iZXJOYW1lJ1xuaW1wb3J0IHBhcnNlTmFtZSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCBwYXJzZVNpbmdsZSBmcm9tICcuL3BhcnNlU2luZ2xlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuUGFyc2UgdG9rZW5zIGluIGEge0BsaW5rIEdyb3Vwcy5TcGFjZX0uXG5AcmV0dXJuIHtWYWx9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTcGFjZWQodG9rZW5zKSB7XG5cdGNvbnN0IGggPSB0b2tlbnMuaGVhZCgpLCByZXN0ID0gdG9rZW5zLnRhaWwoKVxuXHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGgpKVxuXHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRlbHNlIGlmIChpc0tleXdvcmQoS2V5d29yZHMuTGF6eSwgaCkpXG5cdFx0cmV0dXJuIG5ldyBMYXp5KGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSlcblx0ZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgaCkpIHtcblx0XHRjb25zdCBuYW1lID0gcGFyc2VOYW1lKHJlc3QuaGVhZCgpKVxuXHRcdGNvbnN0IHJlc3QyID0gcmVzdC50YWlsKClcblx0XHRjb25zdCBtZW1iZXIgPSBuZXcgTWVtYmVyKGgubG9jLCBMb2NhbEFjY2Vzcy50aGlzKGgubG9jKSwgbmFtZSlcblx0XHRyZXR1cm4gcmVzdDIuaXNFbXB0eSgpID8gbWVtYmVyIDogcGFyc2VTcGFjZWRGb2xkKG1lbWJlciwgcmVzdC50YWlsKCkpXG5cdH0gZWxzZSBpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzLCBoKSlcblx0XHRyZXR1cm4gbmV3IFNwbGF0KHRva2Vucy5sb2MsIHBhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShyZXN0LmhlYWQoKSksIHJlc3QudGFpbCkpXG5cdGVsc2UgaWYgKGlzS2V5d29yZChLZXl3b3Jkcy5TdXBlclZhbCwgaCkpIHtcblx0XHQvLyBUT0RPOiBoYW5kbGUgc3ViIGhlcmUgYXMgd2VsbFxuXHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgaDIpKSB7XG5cdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdGNvbnN0IHN1cCA9IG5ldyBTdXBlck1lbWJlcihoMi5sb2MsIHBhcnNlTWVtYmVyTmFtZSh0YWlsLmhlYWQoKSkpXG5cdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHN1cCwgdGFpbC50YWlsKCkpXG5cdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgaDIpICYmIFNsaWNlLmdyb3VwKGgyKS5pc0VtcHR5KCkpIHtcblx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJDYWxsKGgyLmxvYywgW10pXG5cdFx0XHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHgsIHJlc3QudGFpbCgpKVxuXHRcdH0gZWxzZVxuXHRcdFx0ZmFpbChgRXhwZWN0ZWQgJHtjb2RlKCcuJyl9IG9yICR7Y29kZSgnKCknKX0gYWZ0ZXIgJHtjb2RlKCdzdXBlcicpfWApXG5cdH0gZWxzZVxuXHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUoaCksIHJlc3QpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhY2VkRm9sZChzdGFydCwgcmVzdCkge1xuXHRsZXQgYWNjID0gc3RhcnRcblx0Zm9yIChsZXQgaSA9IHJlc3QuX3N0YXJ0OyBpIDwgcmVzdC5fZW5kOyBpID0gaSArIDEpIHtcblx0XHRjb25zdCB0b2tlbiA9IHJlc3QuX3Rva2Vuc1tpXVxuXHRcdGNvbnN0IGxvYyA9IHRva2VuLmxvY1xuXHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCB0b2tlbikpIHtcblx0XHRcdC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IG9uZSwgaXQgd291bGQgbm90IGJlIGEgS2V5d29yZHMuRG90IGJ1dCBhIEtleXdvcmRzLk9iakFzc2lnblxuXHRcdFx0YXNzZXJ0KGkgPCByZXN0Ll9lbmQgLSAxKVxuXHRcdFx0aSA9IGkgKyAxXG5cdFx0XHRjb25zdCBuZXh0ID0gcmVzdC5fdG9rZW5zW2ldXG5cdFx0XHRhY2MgPSBuZXcgTWVtYmVyKHRva2VuLmxvYywgYWNjLCBwYXJzZU1lbWJlck5hbWUobmV4dCkpXG5cdFx0fSBlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEtleXdvcmQpXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Gb2N1czpcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbCh0b2tlbi5sb2MsIGFjYywgW0xvY2FsQWNjZXNzLmZvY3VzKGxvYyldKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuVHlwZToge1xuXHRcdFx0XHRcdGNvbnN0IHR5cGUgPSBwYXJzZVNwYWNlZChyZXN0Ll9jaG9wU3RhcnQoaSArIDEpKVxuXHRcdFx0XHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKHRva2VuLmxvYywgdHlwZSwgYWNjKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHRcdH1cblx0XHRlbHNlIGlmICh0b2tlbiBpbnN0YW5jZW9mIEdyb3VwKSB7XG5cdFx0XHRjb25zdCBzbGljZSA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgR3JvdXBzLkJyYWNrZXQ6XG5cdFx0XHRcdFx0YWNjID0gQ2FsbC5zdWIobG9jLCBhY2MsIHBhcnNlRXhwclBhcnRzKHNsaWNlKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRjaGVja0VtcHR5KHNsaWNlLCAoKSA9PiBgVXNlICR7Y29kZSgnKGEgYiknKX0sIG5vdCAke2NvZGUoJ2EoYiknKX1gKVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBDYWxsKGxvYywgYWNjLCBbXSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5RdW90ZTpcblx0XHRcdFx0XHRhY2MgPSBuZXcgUXVvdGVUZW1wbGF0ZShsb2MsIGFjYywgcGFyc2VRdW90ZShzbGljZSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYWNjXG59XG4iXX0=