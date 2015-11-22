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

		eatChars: for (;;) {
			const char = (0, _sourceContext.eat)();

			switch (char) {
				case _chars.Chars.Backslash:
					{
						const next = (0, _sourceContext.eat)();
						read = `${ read }\\${ String.fromCharCode(next) }`;
						break;
					}

				case _chars.Chars.Backtick:
					read = `${ read }\\\``;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFFBQVE7Ozs7Ozs7Ozs7VUFBUixRQUFRIiwiZmlsZSI6ImxleFF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzaW5nbGVDaGFyTG9jfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7R3JvdXBzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNOYW1lQ2hhcmFjdGVyfSBmcm9tICcuL2NoYXJzJ1xuaW1wb3J0IHthZGRUb0N1cnJlbnRHcm91cCwgY2xvc2VHcm91cCwgY2xvc2VQYXJlbnRoZXNpcywgY3VyR3JvdXAsIG9wZW5Hcm91cCwgb3BlblBhcmVudGhlc2lzXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7ZWF0LCBwZWVrLCBwb3MsIHNraXBOZXdsaW5lcywgc2tpcFdoaWxlRXF1YWxzLCBzdGVwQmFja01hbnksIHRyeUVhdE5ld2xpbmVcblx0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFF1b3RlKGluZGVudCkge1xuXHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0Ly8gVGhlIG5leHQgbGluZSAqbXVzdCogaGF2ZSBzb21lIGNvbnRlbnQgYXQgdGhlIG5leHQgaW5kZW50YXRpb24uXG5cdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRjb25zdCBhY3R1YWxJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdGNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdCdJbmRlbnRlZCBxdW90ZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgbW9yZSBpbmRlbnQgdGhhbiBwcmV2aW91cyBsaW5lLicpXG5cdH1cblxuXHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdC8vIFRoaXMgaXMgYSByYXcgdmFsdWUuXG5cdGxldCByZWFkID0gJydcblxuXHRmdW5jdGlvbiBtYXliZU91dHB1dFJlYWQoKSB7XG5cdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0cmVhZCA9ICcnXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbG9jU2luZ2xlKCkge1xuXHRcdHJldHVybiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXHR9XG5cblx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBHcm91cHMuUXVvdGUpXG5cblx0ZWF0Q2hhcnM6IGZvciAoOzspIHtcblx0XHRjb25zdCBjaGFyID0gZWF0KClcblx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdGNhc2UgQ2hhcnMuQmFja3NsYXNoOiB7XG5cdFx0XHRcdGNvbnN0IG5leHQgPSBlYXQoKVxuXHRcdFx0XHRyZWFkID0gYCR7cmVhZH1cXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrdGljazpcblx0XHRcdFx0cmVhZCA9IGAke3JlYWR9XFxcXFxcYGBcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuT3BlbkJyYWNlOiB7XG5cdFx0XHRcdG1heWJlT3V0cHV0UmVhZCgpXG5cdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0bGV4UGxhaW4odHJ1ZSlcblx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Ly8gRG9uJ3QgbmVlZCBgY2FzZSBDaGFycy5OdWxsOmAgYmVjYXVzZSB0aGF0J3MgYWx3YXlzIHByZWNlZGVkIGJ5IGEgbmV3bGluZS5cblx0XHRcdGNhc2UgQ2hhcnMuTmV3bGluZToge1xuXHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdC8vIEdvIGJhY2sgdG8gYmVmb3JlIHdlIGF0ZSBpdC5cblx0XHRcdFx0b3JpZ2luYWxQb3MuY29sdW1uID0gb3JpZ2luYWxQb3MuY29sdW1uIC0gMVxuXG5cdFx0XHRcdGNoZWNrKGlzSW5kZW50ZWQsIGxvY1NpbmdsZSwgJ1VuY2xvc2VkIHF1b3RlLicpXG5cdFx0XHRcdC8vIEFsbG93IGV4dHJhIGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdGNvbnN0IG5ld0luZGVudCA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5UYWIpXG5cdFx0XHRcdGlmIChuZXdJbmRlbnQgPCBxdW90ZUluZGVudCkge1xuXHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHQvLyBVbmRvIHJlYWRpbmcgdGhlIHRhYnMgYW5kIG5ld2xpbmUuXG5cdFx0XHRcdFx0c3RlcEJhY2tNYW55KG9yaWdpbmFsUG9zLCBudW1OZXdsaW5lcyArIG5ld0luZGVudClcblx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBDaGFycy5OZXdsaW5lKVxuXHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdCdcXG4nLnJlcGVhdChudW1OZXdsaW5lcykgKyAnXFx0Jy5yZXBlYXQobmV3SW5kZW50IC0gcXVvdGVJbmRlbnQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIENoYXJzLlF1b3RlOlxuXHRcdFx0XHRpZiAoIWlzSW5kZW50ZWQpXG5cdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0Ly8gRWxzZSBmYWxsdGhyb3VnaFxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdC8vIGJ1dCB0aGlzIHR1cm5lZCBvdXQgdG8gYmUgYmV0dGVyLlxuXHRcdFx0XHRyZWFkID0gcmVhZCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcilcblx0XHR9XG5cdH1cblxuXHRtYXliZU91dHB1dFJlYWQoKVxuXHR3YXJuRm9yU2ltcGxlUXVvdGUoY3VyR3JvdXApXG5cdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5RdW90ZSlcbn1cblxuZnVuY3Rpb24gd2FybkZvclNpbXBsZVF1b3RlKHF1b3RlR3JvdXApIHtcblx0Y29uc3QgdG9rZW5zID0gcXVvdGVHcm91cC5zdWJUb2tlbnNcblx0aWYgKHRva2Vucy5sZW5ndGggPT09IDEpIHtcblx0XHRjb25zdCBuYW1lID0gdG9rZW5zWzBdXG5cdFx0aWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBpc05hbWUobmFtZSkpXG5cdFx0XHR3YXJuKHBvcygpLCBgUXVvdGVkIHRleHQgY291bGQgYmUgYSBzaW1wbGUgcXVvdGUgJHtjb2RlKGAnJHtuYW1lfWApfS5gKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGlzTmFtZShzdHIpIHtcblx0Y29uc3QgY2MwID0gc3RyLmNoYXJDb2RlQXQoMClcblx0aWYgKGlzRGlnaXQoY2MwKSB8fCBjYzAgPT09IENoYXJzLlRpbGRlKVxuXHRcdHJldHVybiBmYWxzZVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRpZiAoIWlzTmFtZUNoYXJhY3RlcihzdHIuY2hhckNvZGVBdChpKSkpXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0cmV0dXJuIHRydWVcbn1cbiJdfQ==