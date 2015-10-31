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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBWXdCLFFBQVE7Ozs7OztVQUFSLFFBQVEiLCJmaWxlIjoibGV4UXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3NpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtHcm91cHN9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnR9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0NoYXJzLCBpc0RpZ2l0LCBpc05hbWVDaGFyYWN0ZXJ9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjbG9zZVBhcmVudGhlc2lzLCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuUGFyZW50aGVzaXNcblx0fSBmcm9tICcuL2dyb3VwQ29udGV4dCdcbmltcG9ydCBsZXhQbGFpbiBmcm9tICcuL2xleFBsYWluJ1xuaW1wb3J0IHtlYXQsIHBlZWssIHBvcywgc2tpcE5ld2xpbmVzLCBza2lwV2hpbGVFcXVhbHMsIHN0ZXBCYWNrTWFueSwgdHJ5RWF0TmV3bGluZVxuXHR9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4UXVvdGUoaW5kZW50KSB7XG5cdGNvbnN0IHF1b3RlSW5kZW50ID0gaW5kZW50ICsgMVxuXG5cdC8vIEluZGVudGVkIHF1b3RlIGlzIGNoYXJhY3Rlcml6ZWQgYnkgYmVpbmcgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBuZXdsaW5lLlxuXHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0Y29uc3QgaXNJbmRlbnRlZCA9IHRyeUVhdE5ld2xpbmUoKVxuXHRpZiAoaXNJbmRlbnRlZCkge1xuXHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5UYWIpXG5cdFx0Y2hlY2soYWN0dWFsSW5kZW50ID09PSBxdW90ZUluZGVudCwgcG9zLFxuXHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0fVxuXG5cdC8vIEN1cnJlbnQgc3RyaW5nIGxpdGVyYWwgcGFydCBvZiBxdW90ZSB3ZSBhcmUgcmVhZGluZy5cblx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0bGV0IHJlYWQgPSAnJ1xuXG5cdGZ1bmN0aW9uIG1heWJlT3V0cHV0UmVhZCgpIHtcblx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHJlYWQpXG5cdFx0XHRyZWFkID0gJydcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBsb2NTaW5nbGUoKSB7XG5cdFx0cmV0dXJuIHNpbmdsZUNoYXJMb2MocG9zKCkpXG5cdH1cblxuXHRvcGVuR3JvdXAobG9jU2luZ2xlKCkuc3RhcnQsIEdyb3Vwcy5RdW90ZSlcblxuXHRlYXRDaGFyczogd2hpbGUgKHRydWUpIHtcblx0XHRjb25zdCBjaGFyID0gZWF0KClcblx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdGNhc2UgQ2hhcnMuQmFja3NsYXNoOiB7XG5cdFx0XHRcdGNvbnN0IG5leHQgPSBlYXQoKVxuXHRcdFx0XHRyZWFkID0gcmVhZCArIGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrdGljazpcblx0XHRcdFx0cmVhZCA9IHJlYWQgKyAnXFxcXGAnXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5CcmFjZToge1xuXHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGwpXG5cdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdC8vIERvbid0IG5lZWQgYGNhc2UgQ2hhcnMuTnVsbDpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRjYXNlIENoYXJzLk5ld2xpbmU6IHtcblx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxQb3MgPSBwb3MoKVxuXHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRjaGVjayhpc0luZGVudGVkLCBsb2NTaW5nbGUsICdVbmNsb3NlZCBxdW90ZS4nKVxuXHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0Y29uc3QgbnVtTmV3bGluZXMgPSBza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRjb25zdCBuZXdJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuVGFiKVxuXHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHQvLyBJbmRlbnRlZCBxdW90ZSBzZWN0aW9uIGlzIG92ZXIuXG5cdFx0XHRcdFx0Ly8gVW5kbyByZWFkaW5nIHRoZSB0YWJzIGFuZCBuZXdsaW5lLlxuXHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0YXNzZXJ0KHBlZWsoKSA9PT0gQ2hhcnMuTmV3bGluZSlcblx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArXG5cdFx0XHRcdFx0XHQnXFxuJy5yZXBlYXQobnVtTmV3bGluZXMpICsgJ1xcdCcucmVwZWF0KG5ld0luZGVudCAtIHF1b3RlSW5kZW50KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBDaGFycy5RdW90ZTpcblx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdC8vIEVsc2UgZmFsbHRocm91Z2hcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIEkndmUgdHJpZWQgcHVzaGluZyBjaGFyYWN0ZXIgY29kZXMgdG8gYW4gYXJyYXkgYW5kIHN0cmluZ2lmeWluZyB0aGVtIGxhdGVyLFxuXHRcdFx0XHQvLyBidXQgdGhpcyB0dXJuZWQgb3V0IHRvIGJlIGJldHRlci5cblx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0fVxuXHR9XG5cblx0bWF5YmVPdXRwdXRSZWFkKClcblx0d2FybkZvclNpbXBsZVF1b3RlKGN1ckdyb3VwKVxuXHRjbG9zZUdyb3VwKHBvcygpLCBHcm91cHMuUXVvdGUpXG59XG5cbmZ1bmN0aW9uIHdhcm5Gb3JTaW1wbGVRdW90ZShxdW90ZUdyb3VwKSB7XG5cdGNvbnN0IHRva2VucyA9IHF1b3RlR3JvdXAuc3ViVG9rZW5zXG5cdGlmICh0b2tlbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0Y29uc3QgbmFtZSA9IHRva2Vuc1swXVxuXHRcdGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgaXNOYW1lKG5hbWUpKVxuXHRcdFx0d2Fybihwb3MoKSwgYFF1b3RlZCB0ZXh0IGNvdWxkIGJlIGEgc2ltcGxlIHF1b3RlICR7Y29kZShgJyR7bmFtZX1gKX0uYClcblx0fVxufVxuXG5mdW5jdGlvbiBpc05hbWUoc3RyKSB7XG5cdGNvbnN0IGNjMCA9IHN0ci5jaGFyQ29kZUF0KDApXG5cdGlmIChpc0RpZ2l0KGNjMCkgfHwgY2MwID09PSBDaGFycy5UaWxkZSlcblx0XHRyZXR1cm4gZmFsc2Vcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIoc3RyLmNoYXJDb2RlQXQoaSkpKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdHJldHVybiB0cnVlXG59XG4iXX0=