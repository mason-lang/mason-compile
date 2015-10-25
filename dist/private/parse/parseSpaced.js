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
		if (h instanceof _Token.Keyword) switch (h.kind) {
			case _Token.Keywords.Dot:
				{
					const name = (0, _parseName2.default)(rest.head());
					const rest2 = rest.tail();
					const member = new _MsAst.Member(h.loc, _MsAst.LocalAccess.this(h.loc), name);
					return rest2.isEmpty() ? member : parseSpacedFold(member, rest.tail());
				}
			case _Token.Keywords.Ellipsis:
				return new _MsAst.Splat(tokens.loc, parseSpacedFold((0, _parseSingle2.default)(rest.head()), rest.tail));
			case _Token.Keywords.Lazy:
				return new _MsAst.Lazy(h.loc, parseSpaced(rest));
			case _Token.Keywords.SuperVal:
				{
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
				}
			case _Token.Keywords.Tick:
				{
					const h2 = rest.head();
					const tail = rest.tail();
					if ((0, _Token.isKeyword)(_Token.Keywords.Dot, h2)) {
						(0, _checks.checkNonEmpty)(tail, () => `Expected something after ${ (0, _CompileError.code)('\'.') }.`);
						const h3 = tail.head();
						return parseSpacedFold(new _MsAst.ThisFun(h3.loc, (0, _parseName2.default)(h3)), tail.tail());
					} else return parseSpacedFold(new _MsAst.QuoteSimple(h2.loc, (0, _parseName2.default)(h2)), tail);
				}
			case _Token.Keywords.Type:
				return _MsAst.Call.contains(h.loc, parseSpaced(rest), _MsAst.LocalAccess.focus(h.loc));
			default:
			// fall through
		}
		return parseSpacedFold((0, _parseSingle2.default)(h), rest);
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
						acc = new _MsAst.QuoteTaggedTemplate(loc, acc, (0, _parseQuote2.default)(slice));
						break;
					default:
						(0, _checks.unexpected)(token);
				}
			}
		}
		return acc;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBcEIsVUFBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNDLFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzdDLE1BQUksQ0FBQyxtQkFoQnFDLE9BQU8sQUFnQnpCLEVBQ3ZCLFFBQVEsQ0FBQyxDQUFDLElBQUk7QUFDYixRQUFLLE9BbEI0QyxRQUFRLENBa0IzQyxHQUFHO0FBQUU7QUFDbEIsV0FBTSxJQUFJLEdBQUcseUJBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDbkMsV0FBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3pCLFdBQU0sTUFBTSxHQUFHLFdBdkJjLE1BQU0sQ0F1QlQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQXZCakIsV0FBVyxDQXVCa0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUMvRCxZQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUN0RTtBQUFBLEFBQ0QsUUFBSyxPQXhCNEMsUUFBUSxDQXdCM0MsUUFBUTtBQUNyQixXQUFPLFdBM0JnRSxLQUFLLENBMkIzRCxNQUFNLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQywyQkFBWSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ25GLFFBQUssT0ExQjRDLFFBQVEsQ0EwQjNDLElBQUk7QUFDakIsV0FBTyxX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O0VBQ1YiLCJmaWxlIjoicGFyc2VTcGFjZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7ZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7Q2FsbCwgTGF6eSwgTG9jYWxBY2Nlc3MsIE1lbWJlciwgUXVvdGVTaW1wbGUsIFF1b3RlVGFnZ2VkVGVtcGxhdGUsIFNwbGF0LCBTdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyLCBUaGlzRnVufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXAsIEdyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS5cbkByZXR1cm4ge1ZhbH1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVNwYWNlZCh0b2tlbnMpIHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChoIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGgua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3Q6IHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdFx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRjb25zdCBtZW1iZXIgPSBuZXcgTWVtYmVyKGgubG9jLCBMb2NhbEFjY2Vzcy50aGlzKGgubG9jKSwgbmFtZSlcblx0XHRcdFx0cmV0dXJuIHJlc3QyLmlzRW1wdHkoKSA/IG1lbWJlciA6IHBhcnNlU3BhY2VkRm9sZChtZW1iZXIsIHJlc3QudGFpbCgpKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5FbGxpcHNpczpcblx0XHRcdFx0cmV0dXJuIG5ldyBTcGxhdCh0b2tlbnMubG9jLCBwYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUocmVzdC5oZWFkKCkpLCByZXN0LnRhaWwpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5MYXp5OlxuXHRcdFx0XHRyZXR1cm4gbmV3IExhenkoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpKVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5TdXBlclZhbDoge1xuXHRcdFx0XHQvLyBUT0RPOiBoYW5kbGUgc3ViIGhlcmUgYXMgd2VsbFxuXHRcdFx0XHRjb25zdCBoMiA9IHJlc3QuaGVhZCgpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCBoMikpIHtcblx0XHRcdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdFx0XHRjb25zdCBzdXAgPSBuZXcgU3VwZXJNZW1iZXIoaDIubG9jLCBwYXJzZU1lbWJlck5hbWUodGFpbC5oZWFkKCkpKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoc3VwLCB0YWlsLnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlIGlmIChpc0dyb3VwKEdyb3Vwcy5QYXJlbnRoZXNpcywgaDIpICYmIFNsaWNlLmdyb3VwKGgyKS5pc0VtcHR5KCkpIHtcblx0XHRcdFx0XHRjb25zdCB4ID0gbmV3IFN1cGVyQ2FsbChoMi5sb2MsIFtdKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQoeCwgcmVzdC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdGZhaWwoYEV4cGVjdGVkICR7Y29kZSgnLicpfSBvciAke2NvZGUoJygpJyl9IGFmdGVyICR7Y29kZSgnc3VwZXInKX1gKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5UaWNrOiB7XG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0Y29uc3QgdGFpbCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRG90LCBoMikpIHtcblx0XHRcdFx0XHRjaGVja05vbkVtcHR5KHRhaWwsICgpID0+IGBFeHBlY3RlZCBzb21ldGhpbmcgYWZ0ZXIgJHtjb2RlKCdcXCcuJyl9LmApXG5cdFx0XHRcdFx0Y29uc3QgaDMgPSB0YWlsLmhlYWQoKVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQobmV3IFRoaXNGdW4oaDMubG9jLCBwYXJzZU5hbWUoaDMpKSwgdGFpbC50YWlsKCkpXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZVNwYWNlZEZvbGQobmV3IFF1b3RlU2ltcGxlKGgyLmxvYywgcGFyc2VOYW1lKGgyKSksIHRhaWwpXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLlR5cGU6XG5cdFx0XHRcdHJldHVybiBDYWxsLmNvbnRhaW5zKGgubG9jLCBwYXJzZVNwYWNlZChyZXN0KSwgTG9jYWxBY2Nlc3MuZm9jdXMoaC5sb2MpKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gZmFsbCB0aHJvdWdoXG5cdFx0fVxuXHRyZXR1cm4gcGFyc2VTcGFjZWRGb2xkKHBhcnNlU2luZ2xlKGgpLCByZXN0KVxufVxuXG5mdW5jdGlvbiBwYXJzZVNwYWNlZEZvbGQoc3RhcnQsIHJlc3QpIHtcblx0bGV0IGFjYyA9IHN0YXJ0XG5cdGZvciAobGV0IGkgPSByZXN0Ll9zdGFydDsgaSA8IHJlc3QuX2VuZDsgaSA9IGkgKyAxKSB7XG5cdFx0Y29uc3QgdG9rZW4gPSByZXN0Ll90b2tlbnNbaV1cblx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRpZiAoaXNLZXl3b3JkKEtleXdvcmRzLkRvdCwgdG9rZW4pKSB7XG5cdFx0XHQvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBvbmUsIGl0IHdvdWxkIG5vdCBiZSBhIEtleXdvcmRzLkRvdCBidXQgYSBLZXl3b3Jkcy5PYmpBc3NpZ25cblx0XHRcdGFzc2VydChpIDwgcmVzdC5fZW5kIC0gMSlcblx0XHRcdGkgPSBpICsgMVxuXHRcdFx0Y29uc3QgbmV4dCA9IHJlc3QuX3Rva2Vuc1tpXVxuXHRcdFx0YWNjID0gbmV3IE1lbWJlcih0b2tlbi5sb2MsIGFjYywgcGFyc2VNZW1iZXJOYW1lKG5leHQpKVxuXHRcdH0gZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRm9jdXM6XG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFtMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLlR5cGU6IHtcblx0XHRcdFx0XHRjb25zdCB0eXBlID0gcGFyc2VTcGFjZWQocmVzdC5fY2hvcFN0YXJ0KGkgKyAxKSlcblx0XHRcdFx0XHRyZXR1cm4gQ2FsbC5jb250YWlucyh0b2tlbi5sb2MsIHR5cGUsIGFjYylcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0XHR9XG5cdFx0ZWxzZSBpZiAodG9rZW4gaW5zdGFuY2VvZiBHcm91cCkge1xuXHRcdFx0Y29uc3Qgc2xpY2UgPSBTbGljZS5ncm91cCh0b2tlbilcblx0XHRcdHN3aXRjaCAodG9rZW4ua2luZCkge1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5CcmFja2V0OlxuXHRcdFx0XHRcdGFjYyA9IENhbGwuc3ViKGxvYywgYWNjLCBwYXJzZUV4cHJQYXJ0cyhzbGljZSkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBHcm91cHMuUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2hlY2tFbXB0eShzbGljZSwgKCkgPT4gYFVzZSAke2NvZGUoJyhhIGIpJyl9LCBub3QgJHtjb2RlKCdhKGIpJyl9YClcblx0XHRcdFx0XHRhY2MgPSBuZXcgQ2FsbChsb2MsIGFjYywgW10pXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBHcm91cHMuUXVvdGU6XG5cdFx0XHRcdFx0YWNjID0gbmV3IFF1b3RlVGFnZ2VkVGVtcGxhdGUobG9jLCBhY2MsIHBhcnNlUXVvdGUoc2xpY2UpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dW5leHBlY3RlZCh0b2tlbilcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGFjY1xufVxuIl19