'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../Token', '../util', './chars', './groupContext', './lexName', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lexName'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.Token, global.util, global.chars, global.groupContext, global.lexName, global.lexPlain, global.sourceContext);
		global.lexQuote = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _Token, _util, _chars, _groupContext, _lexName, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexQuote;

	var _lexName2 = _interopRequireDefault(_lexName);

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lexQuote(indent, isRegExp) {
		const quoteIndent = indent + 1;
		const isIndented = (0, _sourceContext.tryEatNewline)();

		if (isIndented) {
			const actualIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
			(0, _context.check)(actualIndent === quoteIndent, _sourceContext.pos, 'Indented quote must have exactly one more indent than previous line.');
		}

		let read = '';

		function add(str) {
			read = `${ read }${ str }`;
		}

		function addChar(char) {
			add(String.fromCharCode(char));
		}

		function maybeOutputRead() {
			if (read !== '') {
				(0, _groupContext.addToCurrentGroup)(read);
				read = '';
			}
		}

		function locSingle() {
			return (0, _Loc.singleCharLoc)((0, _sourceContext.pos)());
		}

		const groupKind = isRegExp ? _Token.Groups.RegExp : _Token.Groups.Quote;
		(0, _groupContext.openGroup)(locSingle().start, groupKind);

		eatChars: for (;;) {
			const char = (0, _sourceContext.eat)();

			switch (char) {
				case _chars.Chars.Backslash:
					{
						const next = (0, _sourceContext.eat)();
						if (next === _chars.Chars.Hash || next === (isRegExp ? _chars.Chars.Backtick : _chars.Chars.Quote)) addChar(next);else add(`\\${ String.fromCharCode(next) }`);
						break;
					}

				case _chars.Chars.Hash:
					maybeOutputRead();

					if ((0, _sourceContext.tryEat)(_chars.Chars.OpenParenthesis)) {
						const l = locSingle();
						(0, _groupContext.openInterpolation)(l);
						(0, _lexPlain2.default)(true);
					} else {
						const startPos = (0, _sourceContext.pos)();
						const firstChar = (0, _sourceContext.eat)();
						(0, _context.check)((0, _chars.isNameCharacter)(firstChar), _sourceContext.pos, () => `${ (0, _CompileError.code)('#') } must be followed by ${ (0, _CompileError.code)('(') }, ${ (0, _CompileError.code)('#') }, or a name.`);
						(0, _lexName2.default)(startPos, true);
					}

					break;

				case _chars.Chars.Newline:
					{
						const originalPos = (0, _sourceContext.pos)();
						originalPos.column = originalPos.column - 1;
						(0, _context.check)(isIndented, _sourceContext.pos, 'Unclosed quote.');
						const numNewlines = (0, _sourceContext.skipNewlines)();
						const newIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);

						if (newIndent < quoteIndent) {
							(0, _sourceContext.stepBackMany)(originalPos, numNewlines + newIndent);
							(0, _util.assert)((0, _sourceContext.peek)() === _chars.Chars.Newline);
							break eatChars;
						} else add('\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent));

						break;
					}

				case _chars.Chars.Backtick:
					if (isRegExp) {
						if (isIndented) addChar(char);else break eatChars;
					} else add('\\\`');
					break;

				case _chars.Chars.Quote:
					if (!isRegExp && !isIndented) break eatChars;else addChar(char);
					break;

				default:
					addChar(char);
			}
		}

		maybeOutputRead();
		if (isRegExp) _groupContext.curGroup.flags = lexRegExpFlags();else warnForSimpleQuote(_groupContext.curGroup);
		(0, _groupContext.closeGroup)((0, _sourceContext.pos)(), groupKind);
	}

	function warnForSimpleQuote(quoteGroup) {
		const tokens = quoteGroup.subTokens;

		if (tokens.length === 1) {
			const name = tokens[0];
			if (typeof name === 'string' && isName(name)) (0, _context.warn)((0, _sourceContext.pos)(), `Quoted text could be a simple quote ${ (0, _CompileError.code)(`'${ name }`) }.`);
		}
	}

	function isName(str) {
		const cc0 = str.charCodeAt(0);
		if ((0, _chars.isDigit)(cc0) || cc0 === _chars.Chars.Tilde) return false;

		for (let i = 0; i < str.length; i = i + 1) if (!(0, _chars.isNameCharacter)(str.charCodeAt(i))) return false;

		return true;
	}

	function lexRegExpFlags() {
		let flags = '';

		for (const ch of [_chars.Chars.G, _chars.Chars.I, _chars.Chars.M, _chars.Chars.Y]) if ((0, _sourceContext.tryEat)(ch)) flags = flags + String.fromCharCode(ch);

		return flags;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFFBQVE7Ozs7Ozs7Ozs7OztVQUFSLFFBQVEiLCJmaWxlIjoibGV4UXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3NpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtHcm91cHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0NoYXJzLCBpc0RpZ2l0LCBpc05hbWVDaGFyYWN0ZXJ9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuSW50ZXJwb2xhdGlvbn0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4TmFtZSBmcm9tICcuL2xleE5hbWUnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7ZWF0LCBwZWVrLCBwb3MsIHNraXBOZXdsaW5lcywgc2tpcFdoaWxlRXF1YWxzLCBzdGVwQmFja01hbnksIHRyeUVhdCwgdHJ5RWF0TmV3bGluZVxuXHR9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4UXVvdGUoaW5kZW50LCBpc1JlZ0V4cCkge1xuXHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0Ly8gVGhlIG5leHQgbGluZSAqbXVzdCogaGF2ZSBzb21lIGNvbnRlbnQgYXQgdGhlIG5leHQgaW5kZW50YXRpb24uXG5cdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRjb25zdCBhY3R1YWxJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdGNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdCdJbmRlbnRlZCBxdW90ZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgbW9yZSBpbmRlbnQgdGhhbiBwcmV2aW91cyBsaW5lLicpXG5cdH1cblxuXHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdC8vIFRoaXMgaXMgYSByYXcgdmFsdWUuIElmIHNvdXJjZSBjb2RlIGhhcyAnXFxuJyAoMiBjaGFyYWN0ZXJzKSwgcmVhZCBoYXMgJ1xcbicgKDIgY2hhcmFjdGVycykuXG5cdGxldCByZWFkID0gJydcblx0ZnVuY3Rpb24gYWRkKHN0cikge1xuXHRcdC8vIEkndmUgdHJpZWQgcHVzaGluZyBjaGFyYWN0ZXIgY29kZXMgdG8gYW4gYXJyYXkgYW5kIHN0cmluZ2lmeWluZyB0aGVtIGxhdGVyLFxuXHRcdC8vIGJ1dCB0aGlzIHR1cm5lZCBvdXQgdG8gYmUgYmV0dGVyLlxuXHRcdHJlYWQgPSBgJHtyZWFkfSR7c3RyfWBcblx0fVxuXHRmdW5jdGlvbiBhZGRDaGFyKGNoYXIpIHtcblx0XHRhZGQoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSlcblx0fVxuXG5cdGZ1bmN0aW9uIG1heWJlT3V0cHV0UmVhZCgpIHtcblx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHJlYWQpXG5cdFx0XHRyZWFkID0gJydcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBsb2NTaW5nbGUoKSB7XG5cdFx0cmV0dXJuIHNpbmdsZUNoYXJMb2MocG9zKCkpXG5cdH1cblxuXHRjb25zdCBncm91cEtpbmQgPSBpc1JlZ0V4cCA/IEdyb3Vwcy5SZWdFeHAgOiBHcm91cHMuUXVvdGVcblxuXHRvcGVuR3JvdXAobG9jU2luZ2xlKCkuc3RhcnQsIGdyb3VwS2luZClcblxuXHRlYXRDaGFyczogZm9yICg7Oykge1xuXHRcdGNvbnN0IGNoYXIgPSBlYXQoKVxuXG5cdFx0c3dpdGNoIChjaGFyKSB7XG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDoge1xuXHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0Ly8gXFwjLCBcXGAsIGFuZCBcXFwiIGFyZSBzcGVjaWFsIGJlY2F1c2UgdGhleSBlc2NhcGUgYSBtYXNvbiBzcGVjaWFsIGNoYXJhY3Rlcixcblx0XHRcdFx0Ly8gd2hpbGUgb3RoZXJzIGFyZSBlc2NhcGUgc2VxdWVuY2VzLlxuXHRcdFx0XHRpZiAobmV4dCA9PT0gQ2hhcnMuSGFzaCB8fCBuZXh0ID09PSAoaXNSZWdFeHAgPyBDaGFycy5CYWNrdGljayA6IENoYXJzLlF1b3RlKSlcblx0XHRcdFx0XHRhZGRDaGFyKG5leHQpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRhZGQoYFxcXFwke1N0cmluZy5mcm9tQ2hhckNvZGUobmV4dCl9YClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuSGFzaDpcblx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5PcGVuUGFyZW50aGVzaXMpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvY1NpbmdsZSgpXG5cdFx0XHRcdFx0b3BlbkludGVycG9sYXRpb24obClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdC8vIFJldHVybmluZyBmcm9tIGxleFBsYWluIG1lYW5zIHRoYXQgdGhlIGludGVycG9sYXRpb24gd2FzIGNsb3NlZC5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBzdGFydFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Y29uc3QgZmlyc3RDaGFyID0gZWF0KClcblx0XHRcdFx0XHRjaGVjayhpc05hbWVDaGFyYWN0ZXIoZmlyc3RDaGFyKSwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdFx0YCR7Y29kZSgnIycpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5ICR7Y29kZSgnKCcpfSwgJHtjb2RlKCcjJyl9LCBvciBhIG5hbWUuYClcblx0XHRcdFx0XHRsZXhOYW1lKHN0YXJ0UG9zLCB0cnVlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHQvLyBEb24ndCBuZWVkIGBjYXNlIENoYXJzLk51bGw6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0Y2FzZSBDaGFycy5OZXdsaW5lOiB7XG5cdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRvcmlnaW5hbFBvcy5jb2x1bW4gPSBvcmlnaW5hbFBvcy5jb2x1bW4gLSAxXG5cblx0XHRcdFx0Y2hlY2soaXNJbmRlbnRlZCwgcG9zLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0Ly8gQWxsb3cgZXh0cmEgYmxhbmsgbGluZXMuXG5cdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdFx0aWYgKG5ld0luZGVudCA8IHF1b3RlSW5kZW50KSB7XG5cdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRzdGVwQmFja01hbnkob3JpZ2luYWxQb3MsIG51bU5ld2xpbmVzICsgbmV3SW5kZW50KVxuXHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpXG5cdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0YWRkKCdcXG4nLnJlcGVhdChudW1OZXdsaW5lcykgKyAnXFx0Jy5yZXBlYXQobmV3SW5kZW50IC0gcXVvdGVJbmRlbnQpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrdGljazpcblx0XHRcdFx0aWYgKGlzUmVnRXhwKVxuXHRcdFx0XHRcdGlmIChpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHQvLyBTaW5jZSB0aGVzZSBjb21waWxlIHRvIHRlbXBsYXRlIGxpdGVyYWxzLCBoYXZlIHRvIHJlbWVtYmVyIHRvIGVzY2FwZS5cblx0XHRcdFx0XHRhZGQoJ1xcXFxcXGAnKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5RdW90ZTpcblx0XHRcdFx0aWYgKCFpc1JlZ0V4cCAmJiAhaXNJbmRlbnRlZClcblx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdH1cblx0fVxuXG5cdG1heWJlT3V0cHV0UmVhZCgpXG5cblx0aWYgKGlzUmVnRXhwKVxuXHRcdGN1ckdyb3VwLmZsYWdzID0gbGV4UmVnRXhwRmxhZ3MoKVxuXHRlbHNlXG5cdFx0d2FybkZvclNpbXBsZVF1b3RlKGN1ckdyb3VwKVxuXG5cdGNsb3NlR3JvdXAocG9zKCksIGdyb3VwS2luZClcbn1cblxuZnVuY3Rpb24gd2FybkZvclNpbXBsZVF1b3RlKHF1b3RlR3JvdXApIHtcblx0Y29uc3QgdG9rZW5zID0gcXVvdGVHcm91cC5zdWJUb2tlbnNcblx0aWYgKHRva2Vucy5sZW5ndGggPT09IDEpIHtcblx0XHRjb25zdCBuYW1lID0gdG9rZW5zWzBdXG5cdFx0aWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBpc05hbWUobmFtZSkpXG5cdFx0XHR3YXJuKHBvcygpLCBgUXVvdGVkIHRleHQgY291bGQgYmUgYSBzaW1wbGUgcXVvdGUgJHtjb2RlKGAnJHtuYW1lfWApfS5gKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGlzTmFtZShzdHIpIHtcblx0Y29uc3QgY2MwID0gc3RyLmNoYXJDb2RlQXQoMClcblx0aWYgKGlzRGlnaXQoY2MwKSB8fCBjYzAgPT09IENoYXJzLlRpbGRlKVxuXHRcdHJldHVybiBmYWxzZVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRpZiAoIWlzTmFtZUNoYXJhY3RlcihzdHIuY2hhckNvZGVBdChpKSkpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0cmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gbGV4UmVnRXhwRmxhZ3MoKSB7XG5cdGxldCBmbGFncyA9ICcnXG5cdGZvciAoY29uc3QgY2ggb2YgW0NoYXJzLkcsIENoYXJzLkksIENoYXJzLk0sIENoYXJzLlldKVxuXHRcdGlmICh0cnlFYXQoY2gpKVxuXHRcdFx0ZmxhZ3MgPSBmbGFncyArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpXG5cdHJldHVybiBmbGFnc1xufVxuIl19