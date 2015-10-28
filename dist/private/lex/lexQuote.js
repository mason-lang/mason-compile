(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', 'esast/dist/Loc', '../../CompileError', '../context', '../Token', '../util', './chars', './groupContext', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Loc, global.CompileError, global.context, global.Token, global.util, global.chars, global.groupContext, global.lexPlain, global.sourceContext);
		global.lexQuote = mod.exports;
	}
})(this, function (exports, module, _esastDistLoc, _CompileError, _context, _Token, _util, _chars, _groupContext, _lexPlain, _sourceContext) {
	'use strict';

	module.exports = lexQuote;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _lexPlain2 = _interopRequireDefault(_lexPlain);

	function lexQuote(indent) {
		const quoteIndent = indent + 1;

		// Indented quote is characterized by being immediately followed by a newline.
		// The next line *must* have some content at the next indentation.
		const isIndented = (0, _sourceContext.tryEatNewline)();
		if (isIndented) {
			const actualIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
			(0, _context.check)(actualIndent === quoteIndent, _sourceContext.pos, 'Indented quote must have exactly one more indent than previous line.');
		}

		// Current string literal part of quote we are reading.
		// This is a raw value.
		let read = '';

		function maybeOutputRead() {
			if (read !== '') {
				(0, _groupContext.addToCurrentGroup)(read);
				read = '';
			}
		}

		function locSingle() {
			return (0, _esastDistLoc.singleCharLoc)((0, _sourceContext.pos)());
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
				// Since these compile to template literals, have to remember to escape.
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
				// Don't need `case Chars.Null:` because that's always preceded by a newline.
				case _chars.Chars.Newline:
					{
						const originalPos = (0, _sourceContext.pos)();
						// Go back to before we ate it.
						originalPos.column = originalPos.column - 1;

						(0, _context.check)(isIndented, locSingle, 'Unclosed quote.');
						// Allow extra blank lines.
						const numNewlines = (0, _sourceContext.skipNewlines)();
						const newIndent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
						if (newIndent < quoteIndent) {
							// Indented quote section is over.
							// Undo reading the tabs and newline.
							(0, _sourceContext.stepBackMany)(originalPos, numNewlines + newIndent);
							(0, _util.assert)((0, _sourceContext.peek)() === _chars.Chars.Newline);
							break eatChars;
						} else read = read + '\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent);
						break;
					}
				case _chars.Chars.Quote:
					if (!isIndented) break eatChars;
				// Else fallthrough
				default:
					// I've tried pushing character codes to an array and stringifying them later,
					// but this turned out to be better.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBWXdCLFFBQVE7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDeEMsUUFBTSxXQUFXLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTs7OztBQUk5QixRQUFNLFVBQVUsR0FBRyxtQkFSaUQsYUFBYSxHQVEvQyxDQUFBO0FBQ2xDLE1BQUksVUFBVSxFQUFFO0FBQ2YsU0FBTSxZQUFZLEdBQUcsbUJBVmUsZUFBZSxFQVVkLE9BZC9CLEtBQUssQ0FjZ0MsR0FBRyxDQUFDLENBQUE7QUFDL0MsZ0JBbEJNLEtBQUssRUFrQkwsWUFBWSxLQUFLLFdBQVcsaUJBWGpCLEdBQUcsRUFZbkIsc0VBQXNFLENBQUMsQ0FBQTtHQUN4RTs7OztBQUlELE1BQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFYixXQUFTLGVBQWUsR0FBRztBQUMxQixPQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDaEIsc0JBeEJLLGlCQUFpQixFQXdCSixJQUFJLENBQUMsQ0FBQTtBQUN2QixRQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ1Q7R0FDRDs7QUFFRCxXQUFTLFNBQVMsR0FBRztBQUNwQixVQUFPLGtCQXBDRCxhQUFhLEVBb0NFLG1CQTNCSixHQUFHLEdBMkJNLENBQUMsQ0FBQTtHQUMzQjs7QUFFRCxvQkFqQ2tFLFNBQVMsRUFpQ2pFLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQXBDdEIsTUFBTSxDQW9DdUIsS0FBSyxDQUFDLENBQUE7O0FBRTFDLFVBQVEsRUFBRSxPQUFPLElBQUksRUFBRTtBQUN0QixTQUFNLElBQUksR0FBRyxtQkFqQ1AsR0FBRyxHQWlDUyxDQUFBO0FBQ2xCLFdBQVEsSUFBSTtBQUNYLFNBQUssT0F2Q0EsS0FBSyxDQXVDQyxTQUFTO0FBQUU7QUFDckIsWUFBTSxJQUFJLEdBQUcsbUJBcENULEdBQUcsR0FvQ1csQ0FBQTtBQUNsQixVQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0FBQzlDLFlBQUs7TUFDTDtBQUFBO0FBRUQsU0FBSyxPQTdDQSxLQUFLLENBNkNDLFFBQVE7QUFDbEIsU0FBSSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUE7QUFDbkIsV0FBSztBQUFBLEFBQ04sU0FBSyxPQWhEQSxLQUFLLENBZ0RDLFNBQVM7QUFBRTtBQUNyQixxQkFBZSxFQUFFLENBQUE7QUFDakIsWUFBTSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUE7QUFDckIsd0JBbEQwRSxlQUFlLEVBa0R6RSxDQUFDLENBQUMsQ0FBQTtBQUNsQiw4QkFBUyxJQUFJLENBQUMsQ0FBQTtBQUNkLHdCQXBEbUMsZ0JBQWdCLEVBb0RsQyxDQUFDLENBQUMsQ0FBQTtBQUNuQixZQUFLO01BQ0w7QUFBQTtBQUVELFNBQUssT0F6REEsS0FBSyxDQXlEQyxPQUFPO0FBQUU7QUFDbkIsWUFBTSxXQUFXLEdBQUcsbUJBdERMLEdBQUcsR0FzRE8sQ0FBQTs7QUFFekIsaUJBQVcsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7O0FBRTNDLG1CQWpFSSxLQUFLLEVBaUVILFVBQVUsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTs7QUFFL0MsWUFBTSxXQUFXLEdBQUcsbUJBNURBLFlBQVksR0E0REUsQ0FBQTtBQUNsQyxZQUFNLFNBQVMsR0FBRyxtQkE3RGdCLGVBQWUsRUE2RGYsT0FqRTlCLEtBQUssQ0FpRStCLEdBQUcsQ0FBQyxDQUFBO0FBQzVDLFVBQUksU0FBUyxHQUFHLFdBQVcsRUFBRTs7O0FBRzVCLDBCQWpFa0QsWUFBWSxFQWlFakQsV0FBVyxFQUFFLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQTtBQUNsRCxpQkF2RUcsTUFBTSxFQXVFRixtQkFsRUMsSUFBSSxHQWtFQyxLQUFLLE9BdEVmLEtBQUssQ0FzRWdCLE9BQU8sQ0FBQyxDQUFBO0FBQ2hDLGFBQU0sUUFBUSxDQUFBO09BQ2QsTUFDQSxJQUFJLEdBQUcsSUFBSSxHQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUE7QUFDakUsWUFBSztNQUNMO0FBQUEsQUFDRCxTQUFLLE9BN0VBLEtBQUssQ0E2RUMsS0FBSztBQUNmLFNBQUksQ0FBQyxVQUFVLEVBQ2QsTUFBTSxRQUFRLENBQUE7QUFBQTtBQUVoQjs7O0FBR0MsU0FBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsSUFDeEM7R0FDRDs7QUFFRCxpQkFBZSxFQUFFLENBQUE7QUFDakIsb0JBQWtCLGVBeEZzQyxRQUFRLENBd0ZwQyxDQUFBO0FBQzVCLG9CQXpGMEIsVUFBVSxFQXlGekIsbUJBdEZPLEdBQUcsR0FzRkwsRUFBRSxPQTVGWCxNQUFNLENBNEZZLEtBQUssQ0FBQyxDQUFBO0VBQy9COztBQUVELFVBQVMsa0JBQWtCLENBQUMsVUFBVSxFQUFFO0FBQ3ZDLFFBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUE7QUFDbkMsTUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN4QixTQUFNLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEIsT0FBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUMzQyxhQXJHWSxJQUFJLEVBcUdYLG1CQTlGVyxHQUFHLEdBOEZULEVBQUUsQ0FBQyxvQ0FBb0MsR0FBRSxrQkF0RzlDLElBQUksRUFzRytDLENBQUMsQ0FBQyxHQUFFLElBQUksRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3hFO0VBQ0Q7O0FBRUQsVUFBUyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQ3BCLFFBQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsTUFBSSxXQXhHVSxPQUFPLEVBd0dULEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxPQXhHckIsS0FBSyxDQXdHc0IsS0FBSyxFQUN0QyxPQUFPLEtBQUssQ0FBQTtBQUNiLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUN4QyxJQUFJLENBQUMsV0EzR2lCLGVBQWUsRUEyR2hCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdEMsT0FBTyxLQUFLLENBQUE7QUFDZCxTQUFPLElBQUksQ0FBQTtFQUNYIiwiZmlsZSI6ImxleFF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzaW5nbGVDaGFyTG9jfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7R3JvdXBzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNOYW1lQ2hhcmFjdGVyfSBmcm9tICcuL2NoYXJzJ1xuaW1wb3J0IHthZGRUb0N1cnJlbnRHcm91cCwgY2xvc2VHcm91cCwgY2xvc2VQYXJlbnRoZXNpcywgY3VyR3JvdXAsIG9wZW5Hcm91cCwgb3BlblBhcmVudGhlc2lzXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQgbGV4UGxhaW4gZnJvbSAnLi9sZXhQbGFpbidcbmltcG9ydCB7ZWF0LCBwZWVrLCBwb3MsIHNraXBOZXdsaW5lcywgc2tpcFdoaWxlRXF1YWxzLCBzdGVwQmFja01hbnksIHRyeUVhdE5ld2xpbmVcblx0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFF1b3RlKGluZGVudCkge1xuXHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0Ly8gVGhlIG5leHQgbGluZSAqbXVzdCogaGF2ZSBzb21lIGNvbnRlbnQgYXQgdGhlIG5leHQgaW5kZW50YXRpb24uXG5cdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRjb25zdCBhY3R1YWxJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdGNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdCdJbmRlbnRlZCBxdW90ZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgbW9yZSBpbmRlbnQgdGhhbiBwcmV2aW91cyBsaW5lLicpXG5cdH1cblxuXHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdC8vIFRoaXMgaXMgYSByYXcgdmFsdWUuXG5cdGxldCByZWFkID0gJydcblxuXHRmdW5jdGlvbiBtYXliZU91dHB1dFJlYWQoKSB7XG5cdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0cmVhZCA9ICcnXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbG9jU2luZ2xlKCkge1xuXHRcdHJldHVybiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXHR9XG5cblx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBHcm91cHMuUXVvdGUpXG5cblx0ZWF0Q2hhcnM6IHdoaWxlICh0cnVlKSB7XG5cdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0c3dpdGNoIChjaGFyKSB7XG5cdFx0XHRjYXNlIENoYXJzLkJhY2tzbGFzaDoge1xuXHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0cmVhZCA9IHJlYWQgKyBgXFxcXCR7U3RyaW5nLmZyb21DaGFyQ29kZShuZXh0KX1gXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBTaW5jZSB0aGVzZSBjb21waWxlIHRvIHRlbXBsYXRlIGxpdGVyYWxzLCBoYXZlIHRvIHJlbWVtYmVyIHRvIGVzY2FwZS5cblx0XHRcdGNhc2UgQ2hhcnMuQmFja3RpY2s6XG5cdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5PcGVuQnJhY2U6IHtcblx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0Y29uc3QgbCA9IGxvY1NpbmdsZSgpXG5cdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGwpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHQvLyBEb24ndCBuZWVkIGBjYXNlIENoYXJzLk51bGw6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0Y2FzZSBDaGFycy5OZXdsaW5lOiB7XG5cdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRvcmlnaW5hbFBvcy5jb2x1bW4gPSBvcmlnaW5hbFBvcy5jb2x1bW4gLSAxXG5cblx0XHRcdFx0Y2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0Ly8gQWxsb3cgZXh0cmEgYmxhbmsgbGluZXMuXG5cdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdFx0aWYgKG5ld0luZGVudCA8IHF1b3RlSW5kZW50KSB7XG5cdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRzdGVwQmFja01hbnkob3JpZ2luYWxQb3MsIG51bU5ld2xpbmVzICsgbmV3SW5kZW50KVxuXHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpXG5cdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgK1xuXHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuUXVvdGU6XG5cdFx0XHRcdGlmICghaXNJbmRlbnRlZClcblx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdHJlYWQgPSByZWFkICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKVxuXHRcdH1cblx0fVxuXG5cdG1heWJlT3V0cHV0UmVhZCgpXG5cdHdhcm5Gb3JTaW1wbGVRdW90ZShjdXJHcm91cClcblx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLlF1b3RlKVxufVxuXG5mdW5jdGlvbiB3YXJuRm9yU2ltcGxlUXVvdGUocXVvdGVHcm91cCkge1xuXHRjb25zdCB0b2tlbnMgPSBxdW90ZUdyb3VwLnN1YlRva2Vuc1xuXHRpZiAodG9rZW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdGNvbnN0IG5hbWUgPSB0b2tlbnNbMF1cblx0XHRpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnICYmIGlzTmFtZShuYW1lKSlcblx0XHRcdHdhcm4ocG9zKCksIGBRdW90ZWQgdGV4dCBjb3VsZCBiZSBhIHNpbXBsZSBxdW90ZSAke2NvZGUoYCcke25hbWV9YCl9LmApXG5cdH1cbn1cblxuZnVuY3Rpb24gaXNOYW1lKHN0cikge1xuXHRjb25zdCBjYzAgPSBzdHIuY2hhckNvZGVBdCgwKVxuXHRpZiAoaXNEaWdpdChjYzApIHx8IGNjMCA9PT0gQ2hhcnMuVGlsZGUpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdGlmICghaXNOYW1lQ2hhcmFjdGVyKHN0ci5jaGFyQ29kZUF0KGkpKSlcblx0XHRcdHJldHVybiBmYWxzZVxuXHRyZXR1cm4gdHJ1ZVxufVxuIl19