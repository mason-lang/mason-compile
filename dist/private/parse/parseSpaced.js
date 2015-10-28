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
			case _Token.Keywords.Dot3:
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
			function restVal() {
				return parseSpaced(rest._chopStart(i + 1));
			}

			const token = rest._tokens[i];
			const loc = token.loc;
			if (token instanceof _Token.Keyword) switch (token.kind) {
				case _Token.Keywords.Dot:
					{
						// If this were the last one,
						// it would not be a Keywords.Dot but a Keywords.ObjAssign
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlU3BhY2VkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztrQkFrQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBcEIsVUFBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNDLFFBQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzdDLE1BQUksQ0FBQyxtQkFoQnFDLE9BQU8sQUFnQnpCLEVBQ3ZCLFFBQVEsQ0FBQyxDQUFDLElBQUk7QUFDYixRQUFLLE9BbEI0QyxRQUFRLENBa0IzQyxHQUFHO0FBQUU7QUFDbEIsV0FBTSxJQUFJLEdBQUcseUJBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7QUFDbkMsV0FBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3pCLFdBQU0sTUFBTSxHQUFHLFdBdkJjLE1BQU0sQ0F1QlQsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQXZCakIsV0FBVyxDQXVCa0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUMvRCxZQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUN0RTtBQUFBLEFBQ0QsUUFBSyxPQXhCNEMsUUFBUSxDQXdCM0MsSUFBSTtBQUNqQixXQUFPLFdBM0J1RSxLQUFLLENBMkJsRSxNQUFNLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQywyQkFBWSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ25GLFFBQUssT0ExQjRDLFFBQVEsQ0EwQjNDLElBQUk7QUFDakIsV0FBTyxX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LGtCQWpHRyxVQUFVLEVBaUdGLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFFLGtCQXZHNUIsSUFBSSxFQXVHNkIsT0FBTyxDQUFDLEVBQUMsTUFBTSxHQUFFLGtCQXZHbEQsSUFBSSxFQXVHbUQsTUFBTSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEUsU0FBRyxHQUFHLFdBdEdILElBQUksQ0FzR1EsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM1QixZQUFLO0FBQUEsQUFDTixVQUFLLE9BdEdNLE1BQU0sQ0FzR0wsS0FBSztBQUNoQixTQUFHLEdBQUcsV0F6RzJDLG1CQUFtQixDQXlHdEMsR0FBRyxFQUFFLEdBQUcsRUFBRSwwQkFBVyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzFELFlBQUs7QUFBQSxBQUNOO0FBQ0Msa0JBeEc4QixVQUFVLEVBd0c3QixLQUFLLENBQUMsQ0FBQTtBQUFBLEtBQ2xCO0lBQ0QsTUFDQSxZQTNHZ0MsVUFBVSxFQTJHL0IsS0FBSyxDQUFDLENBQUE7R0FDbEI7QUFDRCxTQUFPLEdBQUcsQ0FBQTtFQUNWIiwiZmlsZSI6InBhcnNlU3BhY2VkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsLCBMYXp5LCBMb2NhbEFjY2VzcywgTWVtYmVyLCBRdW90ZVNpbXBsZSwgUXVvdGVUYWdnZWRUZW1wbGF0ZSwgUmFuZ2UsIFNwbGF0LCBTdXBlckNhbGwsXG5cdFN1cGVyTWVtYmVyLCBUaGlzRnVufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7R3JvdXAsIEdyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgb3BJZn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Y2hlY2tFbXB0eSwgY2hlY2tOb25FbXB0eSwgdW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzfSBmcm9tICcuL3BhcnNlKidcbmltcG9ydCBwYXJzZU1lbWJlck5hbWUgZnJvbSAnLi9wYXJzZU1lbWJlck5hbWUnXG5pbXBvcnQgcGFyc2VOYW1lIGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSB0b2tlbnMgaW4gYSB7QGxpbmsgR3JvdXBzLlNwYWNlfS5cbkByZXR1cm4ge1ZhbH1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVNwYWNlZCh0b2tlbnMpIHtcblx0Y29uc3QgaCA9IHRva2Vucy5oZWFkKCksIHJlc3QgPSB0b2tlbnMudGFpbCgpXG5cdGlmIChoIGluc3RhbmNlb2YgS2V5d29yZClcblx0XHRzd2l0Y2ggKGgua2luZCkge1xuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3Q6IHtcblx0XHRcdFx0Y29uc3QgbmFtZSA9IHBhcnNlTmFtZShyZXN0LmhlYWQoKSlcblx0XHRcdFx0Y29uc3QgcmVzdDIgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRjb25zdCBtZW1iZXIgPSBuZXcgTWVtYmVyKGgubG9jLCBMb2NhbEFjY2Vzcy50aGlzKGgubG9jKSwgbmFtZSlcblx0XHRcdFx0cmV0dXJuIHJlc3QyLmlzRW1wdHkoKSA/IG1lbWJlciA6IHBhcnNlU3BhY2VkRm9sZChtZW1iZXIsIHJlc3QudGFpbCgpKVxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QzOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFNwbGF0KHRva2Vucy5sb2MsIHBhcnNlU3BhY2VkRm9sZChwYXJzZVNpbmdsZShyZXN0LmhlYWQoKSksIHJlc3QudGFpbCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLkxhenk6XG5cdFx0XHRcdHJldHVybiBuZXcgTGF6eShoLmxvYywgcGFyc2VTcGFjZWQocmVzdCkpXG5cdFx0XHRjYXNlIEtleXdvcmRzLlN1cGVyVmFsOiB7XG5cdFx0XHRcdC8vIFRPRE86IGhhbmRsZSBzdWIgaGVyZSBhcyB3ZWxsXG5cdFx0XHRcdGNvbnN0IGgyID0gcmVzdC5oZWFkKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIGgyKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhaWwgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHRcdGNvbnN0IHN1cCA9IG5ldyBTdXBlck1lbWJlcihoMi5sb2MsIHBhcnNlTWVtYmVyTmFtZSh0YWlsLmhlYWQoKSkpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChzdXAsIHRhaWwudGFpbCgpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKGlzR3JvdXAoR3JvdXBzLlBhcmVudGhlc2lzLCBoMikgJiYgU2xpY2UuZ3JvdXAoaDIpLmlzRW1wdHkoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHggPSBuZXcgU3VwZXJDYWxsKGgyLmxvYywgW10pXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZCh4LCByZXN0LnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0ZmFpbChgRXhwZWN0ZWQgJHtjb2RlKCcuJyl9IG9yICR7Y29kZSgnKCknKX0gYWZ0ZXIgJHtjb2RlKCdzdXBlcicpfWApXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtleXdvcmRzLlRpY2s6IHtcblx0XHRcdFx0Y29uc3QgaDIgPSByZXN0LmhlYWQoKVxuXHRcdFx0XHRjb25zdCB0YWlsID0gcmVzdC50YWlsKClcblx0XHRcdFx0aWYgKGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIGgyKSkge1xuXHRcdFx0XHRcdGNoZWNrTm9uRW1wdHkodGFpbCwgKCkgPT4gYEV4cGVjdGVkIHNvbWV0aGluZyBhZnRlciAke2NvZGUoJ1xcJy4nKX0uYClcblx0XHRcdFx0XHRjb25zdCBoMyA9IHRhaWwuaGVhZCgpXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChuZXcgVGhpc0Z1bihoMy5sb2MsIHBhcnNlTmFtZShoMykpLCB0YWlsLnRhaWwoKSlcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkRm9sZChuZXcgUXVvdGVTaW1wbGUoaDIubG9jLCBwYXJzZU5hbWUoaDIpKSwgdGFpbClcblx0XHRcdH1cblx0XHRcdGNhc2UgS2V5d29yZHMuVHlwZTpcblx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnMoaC5sb2MsIHBhcnNlU3BhY2VkKHJlc3QpLCBMb2NhbEFjY2Vzcy5mb2N1cyhoLmxvYykpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBmYWxsIHRocm91Z2hcblx0XHR9XG5cdHJldHVybiBwYXJzZVNwYWNlZEZvbGQocGFyc2VTaW5nbGUoaCksIHJlc3QpXG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhY2VkRm9sZChzdGFydCwgcmVzdCkge1xuXHRsZXQgYWNjID0gc3RhcnRcblx0Zm9yIChsZXQgaSA9IHJlc3QuX3N0YXJ0OyBpIDwgcmVzdC5fZW5kOyBpID0gaSArIDEpIHtcblx0XHRmdW5jdGlvbiByZXN0VmFsKCkge1xuXHRcdFx0cmV0dXJuIHBhcnNlU3BhY2VkKHJlc3QuX2Nob3BTdGFydChpICsgMSkpXG5cdFx0fVxuXG5cdFx0Y29uc3QgdG9rZW4gPSByZXN0Ll90b2tlbnNbaV1cblx0XHRjb25zdCBsb2MgPSB0b2tlbi5sb2Ncblx0XHRpZiAodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKVxuXHRcdFx0c3dpdGNoICh0b2tlbi5raW5kKSB7XG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRG90OiB7XG5cdFx0XHRcdFx0Ly8gSWYgdGhpcyB3ZXJlIHRoZSBsYXN0IG9uZSxcblx0XHRcdFx0XHQvLyBpdCB3b3VsZCBub3QgYmUgYSBLZXl3b3Jkcy5Eb3QgYnV0IGEgS2V5d29yZHMuT2JqQXNzaWduXG5cdFx0XHRcdFx0YXNzZXJ0KGkgPCByZXN0Ll9lbmQgLSAxKVxuXHRcdFx0XHRcdGkgPSBpICsgMVxuXHRcdFx0XHRcdGFjYyA9IG5ldyBNZW1iZXIodG9rZW4ubG9jLCBhY2MsIHBhcnNlTWVtYmVyTmFtZShyZXN0Ll90b2tlbnNbaV0pKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QyOlxuXHRcdFx0XHRcdGNoZWNrKGkgPCByZXN0Ll9lbmQgLSAxLCB0b2tlbi5sb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgVXNlICR7Y29kZSgnLi4uJyl9IGZvciBpbmZpbml0ZSByYW5nZXMuYClcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFJhbmdlKHRva2VuLmxvYywgYWNjLCByZXN0VmFsKCksIGZhbHNlKVxuXHRcdFx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBSYW5nZSh0b2tlbi5sb2MsIGFjYywgb3BJZihpIDwgcmVzdC5fZW5kIC0gMSwgcmVzdFZhbCksIHRydWUpXG5cdFx0XHRcdGNhc2UgS2V5d29yZHMuRm9jdXM6XG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwodG9rZW4ubG9jLCBhY2MsIFtMb2NhbEFjY2Vzcy5mb2N1cyhsb2MpXSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEtleXdvcmRzLlR5cGU6XG5cdFx0XHRcdFx0cmV0dXJuIENhbGwuY29udGFpbnModG9rZW4ubG9jLCByZXN0VmFsKCksIGFjYylcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRcdFx0fVxuXHRcdGVsc2UgaWYgKHRva2VuIGluc3RhbmNlb2YgR3JvdXApIHtcblx0XHRcdGNvbnN0IHNsaWNlID0gU2xpY2UuZ3JvdXAodG9rZW4pXG5cdFx0XHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRcdFx0Y2FzZSBHcm91cHMuQnJhY2tldDpcblx0XHRcdFx0XHRhY2MgPSBDYWxsLnN1Yihsb2MsIGFjYywgcGFyc2VFeHByUGFydHMoc2xpY2UpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR3JvdXBzLlBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNoZWNrRW1wdHkoc2xpY2UsICgpID0+IGBVc2UgJHtjb2RlKCcoYSBiKScpfSwgbm90ICR7Y29kZSgnYShiKScpfWApXG5cdFx0XHRcdFx0YWNjID0gbmV3IENhbGwobG9jLCBhY2MsIFtdKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR3JvdXBzLlF1b3RlOlxuXHRcdFx0XHRcdGFjYyA9IG5ldyBRdW90ZVRhZ2dlZFRlbXBsYXRlKGxvYywgYWNjLCBwYXJzZVF1b3RlKHNsaWNlKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHVuZXhwZWN0ZWQodG9rZW4pXG5cdFx0XHR9XG5cdFx0fSBlbHNlXG5cdFx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHR9XG5cdHJldHVybiBhY2Ncbn1cbiJdfQ==