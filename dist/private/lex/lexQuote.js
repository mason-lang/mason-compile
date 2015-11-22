'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../../CompileError', '../context', '../Token', '../util', './chars', './groupContext', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.context, global.Token, global.util, global.chars, global.groupContext, global.lexPlain, global.sourceContext);
		global.lexQuote = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _context, _Token, _util, _chars, _groupContext, _lexPlain, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexQuote;

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lexQuote(indent) {
		const quoteIndent = indent + 1;
		const isIndented = (0, _sourceContext.tryEatNewline)();

		if (isIndented) {
			const actualIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
			(0, _context.check)(actualIndent === quoteIndent, _sourceContext.pos, 'Indented quote must have exactly one more indent than previous line.');
		}

		let read = '';

		function maybeOutputRead() {
			if (read !== '') {
				(0, _groupContext.addToCurrentGroup)(read);
				read = '';
			}
		}

		function locSingle() {
			return (0, _Loc.singleCharLoc)((0, _sourceContext.pos)());
		}

		(0, _groupContext.openGroup)(locSingle().start, _Token.Groups.Quote);

		eatChars: while (true) {
			const char = (0, _sourceContext.eat)();

			switch (char) {
				case _chars.Chars.Backslash:
					{
						const next = (0, _sourceContext.eat)();
						read = read + `\\${ String.fromCharCode(next) }`;
						break;
					}

				case _chars.Chars.Backtick:
					read = read + '\\`';
					break;

				case _chars.Chars.OpenBrace:
					{
						maybeOutputRead();
						const l = locSingle();
						(0, _groupContext.openParenthesis)(l);
						(0, _lexPlain2.default)(true);
						(0, _groupContext.closeParenthesis)(l);
						break;
					}

				case _chars.Chars.Newline:
					{
						const originalPos = (0, _sourceContext.pos)();
						originalPos.column = originalPos.column - 1;
						(0, _context.check)(isIndented, locSingle, 'Unclosed quote.');
						const numNewlines = (0, _sourceContext.skipNewlines)();
						const newIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);

						if (newIndent < quoteIndent) {
							(0, _sourceContext.stepBackMany)(originalPos, numNewlines + newIndent);
							(0, _util.assert)((0, _sourceContext.peek)() === _chars.Chars.Newline);
							break eatChars;
						} else read = read + '\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent);

						break;
					}

				case _chars.Chars.Quote:
					if (!isIndented) break eatChars;

				default:
					read = read + String.fromCharCode(char);
			}
		}

		maybeOutputRead();
		warnForSimpleQuote(_groupContext.curGroup);
		(0, _groupContext.closeGroup)((0, _sourceContext.pos)(), _Token.Groups.Quote);
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFFBQVE7Ozs7Ozs7Ozs7VUFBUixRQUFRIiwiZmlsZSI6ImxleFF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzaW5nbGVDaGFyTG9jfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7R3JvdXBzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNOYW1lQ2hhcmFjdGVyfSBmcm9tICcuL2NoYXJzJ1xuaW1wb3J0IHthZGRUb0N1cnJlbnRHcm91cCwgY2xvc2VHcm91cCwgY2xvc2VQYXJlbnRoZXNpcywgY3VyR3JvdXAsIG9wZW5Hcm91cCwgb3BlblBhcmVudGhlc2lzXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7ZWF0LCBwZWVrLCBwb3MsIHNraXBOZXdsaW5lcywgc2tpcFdoaWxlRXF1YWxzLCBzdGVwQmFja01hbnksIHRyeUVhdE5ld2xpbmVcblx0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFF1b3RlKGluZGVudCkge1xuXHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0Ly8gVGhlIG5leHQgbGluZSAqbXVzdCogaGF2ZSBzb21lIGNvbnRlbnQgYXQgdGhlIG5leHQgaW5kZW50YXRpb24uXG5cdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRjb25zdCBhY3R1YWxJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdGNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdCdJbmRlbnRlZCBxdW90ZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgbW9yZSBpbmRlbnQgdGhhbiBwcmV2aW91cyBsaW5lLicpXG5cdH1cblxuXHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdC8vIFRoaXMgaXMgYSByYXcgdmFsdWUuXG5cdGxldCByZWFkID0gJydcblxuXHRmdW5jdGlvbiBtYXliZU91dHB1dFJlYWQoKSB7XG5cdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0cmVhZCA9ICcnXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbG9jU2luZ2xlKCkge1xuXHRcdHJldHVybiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXHR9XG5cblx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBHcm91cHMuUXVvdGUpXG5cblx0ZWF0Q2hhcnM6IHdoaWxlICh0cnVlKSB7XG5cdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0c3dpdGNoIChjaGFyKSB7XG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDoge1xuXHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0cmVhZCA9IHJlYWQgKyBgXFxcXCR7U3RyaW5nLmZyb21DaGFyQ29kZShuZXh0KX1gXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSB0aGVzZSBjb21waWxlIHRvIHRlbXBsYXRlIGxpdGVyYWxzLCBoYXZlIHRvIHJlbWVtYmVyIHRvIGVzY2FwZS5cblx0XHRcdGNhc2UgQ2hhcnMuQmFja3RpY2s6XG5cdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5PcGVuQnJhY2U6IHtcblx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0Y29uc3QgbCA9IGxvY1NpbmdsZSgpXG5cdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGwpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBEb24ndCBuZWVkIGBjYXNlIENoYXJzLk51bGw6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0Y2FzZSBDaGFycy5OZXdsaW5lOiB7XG5cdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRvcmlnaW5hbFBvcy5jb2x1bW4gPSBvcmlnaW5hbFBvcy5jb2x1bW4gLSAxXG5cblx0XHRcdFx0Y2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0Ly8gQWxsb3cgZXh0cmEgYmxhbmsgbGluZXMuXG5cdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdFx0aWYgKG5ld0luZGVudCA8IHF1b3RlSW5kZW50KSB7XG5cdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRzdGVwQmFja01hbnkob3JpZ2luYWxQb3MsIG51bU5ld2xpbmVzICsgbmV3SW5kZW50KVxuXHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpXG5cdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgK1xuXHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuUXVvdGU6XG5cdFx0XHRcdGlmICghaXNJbmRlbnRlZClcblx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdHJlYWQgPSByZWFkICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKVxuXHRcdH1cblx0fVxuXG5cdG1heWJlT3V0cHV0UmVhZCgpXG5cdHdhcm5Gb3JTaW1wbGVRdW90ZShjdXJHcm91cClcblx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLlF1b3RlKVxufVxuXG5mdW5jdGlvbiB3YXJuRm9yU2ltcGxlUXVvdGUocXVvdGVHcm91cCkge1xuXHRjb25zdCB0b2tlbnMgPSBxdW90ZUdyb3VwLnN1YlRva2Vuc1xuXHRpZiAodG9rZW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdGNvbnN0IG5hbWUgPSB0b2tlbnNbMF1cblx0XHRpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIGlzTmFtZShuYW1lKSlcblx0XHRcdHdhcm4ocG9zKCksIGBRdW90ZWQgdGV4dCBjb3VsZCBiZSBhIHNpbXBsZSBxdW90ZSAke2NvZGUoYCcke25hbWV9YCl9LmApXG5cdH1cbn1cblxuZnVuY3Rpb24gaXNOYW1lKHN0cikge1xuXHRjb25zdCBjYzAgPSBzdHIuY2hhckNvZGVBdCgwKVxuXHRpZiAoaXNEaWdpdChjYzApIHx8IGNjMCA9PT0gQ2hhcnMuVGlsZGUpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdGlmICghaXNOYW1lQ2hhcmFjdGVyKHN0ci5jaGFyQ29kZUF0KGkpKSlcblx0XHRcdHJldHVybiBmYWxzZVxuXHRyZXR1cm4gdHJ1ZVxufVxuIl19