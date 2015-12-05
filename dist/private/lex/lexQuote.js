'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../Token', '../util', './chars', './groupContext', './lexName', './lexPlain', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lexName'), require('./lexPlain'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.Token, global.util, global.chars, global.groupContext, global.lexName, global.lexPlain, global.sourceContext);
		global.lexQuote = mod.exports;
	}
})(this, function (exports, _Loc, _context, _Token, _util, _chars, _groupContext, _lexName, _lexPlain, _sourceContext) {
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
			(0, _context.check)(actualIndent === quoteIndent, _sourceContext.pos, 'tooMuchIndentQuote');
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
						(0, _context.check)((0, _chars.isNameCharacter)(firstChar), _sourceContext.pos, 'badInterpolation');
						(0, _lexName2.default)(startPos, true);
					}

					break;

				case _chars.Chars.Newline:
					{
						const originalPos = (0, _sourceContext.pos)();
						originalPos.column = originalPos.column - 1;
						(0, _context.check)(isIndented, _sourceContext.pos, 'unclosedQuote');
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
			if (typeof name === 'string' && isName(name)) (0, _context.warn)((0, _sourceContext.pos)(), 'suggestSimpleQuote', name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhRdW90ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBV3dCLFFBQVE7Ozs7Ozs7Ozs7OztVQUFSLFFBQVEiLCJmaWxlIjoibGV4UXVvdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3NpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjaGVjaywgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7R3JvdXBzfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtDaGFycywgaXNEaWdpdCwgaXNOYW1lQ2hhcmFjdGVyfSBmcm9tICcuL2NoYXJzJ1xuaW1wb3J0IHthZGRUb0N1cnJlbnRHcm91cCwgY2xvc2VHcm91cCwgY3VyR3JvdXAsIG9wZW5Hcm91cCwgb3BlbkludGVycG9sYXRpb259IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IGxleE5hbWUgZnJvbSAnLi9sZXhOYW1lJ1xuaW1wb3J0IGxleFBsYWluIGZyb20gJy4vbGV4UGxhaW4nXG5pbXBvcnQge2VhdCwgcGVlaywgcG9zLCBza2lwTmV3bGluZXMsIHNraXBXaGlsZUVxdWFscywgc3RlcEJhY2tNYW55LCB0cnlFYXQsIHRyeUVhdE5ld2xpbmVcblx0fSBmcm9tICcuL3NvdXJjZUNvbnRleHQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFF1b3RlKGluZGVudCwgaXNSZWdFeHApIHtcblx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0Ly8gSW5kZW50ZWQgcXVvdGUgaXMgY2hhcmFjdGVyaXplZCBieSBiZWluZyBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBhIG5ld2xpbmUuXG5cdC8vIFRoZSBuZXh0IGxpbmUgKm11c3QqIGhhdmUgc29tZSBjb250ZW50IGF0IHRoZSBuZXh0IGluZGVudGF0aW9uLlxuXHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdGlmIChpc0luZGVudGVkKSB7XG5cdFx0Y29uc3QgYWN0dWFsSW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRjaGVjayhhY3R1YWxJbmRlbnQgPT09IHF1b3RlSW5kZW50LCBwb3MsICd0b29NdWNoSW5kZW50UXVvdGUnKVxuXHR9XG5cblx0Ly8gQ3VycmVudCBzdHJpbmcgbGl0ZXJhbCBwYXJ0IG9mIHF1b3RlIHdlIGFyZSByZWFkaW5nLlxuXHQvLyBUaGlzIGlzIGEgcmF3IHZhbHVlLiBJZiBzb3VyY2UgY29kZSBoYXMgJ1xcbicgKDIgY2hhcmFjdGVycyksIHJlYWQgaGFzICdcXG4nICgyIGNoYXJhY3RlcnMpLlxuXHRsZXQgcmVhZCA9ICcnXG5cdGZ1bmN0aW9uIGFkZChzdHIpIHtcblx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHQvLyBidXQgdGhpcyB0dXJuZWQgb3V0IHRvIGJlIGJldHRlci5cblx0XHRyZWFkID0gYCR7cmVhZH0ke3N0cn1gXG5cdH1cblx0ZnVuY3Rpb24gYWRkQ2hhcihjaGFyKSB7XG5cdFx0YWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcikpXG5cdH1cblxuXHRmdW5jdGlvbiBtYXliZU91dHB1dFJlYWQoKSB7XG5cdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0cmVhZCA9ICcnXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbG9jU2luZ2xlKCkge1xuXHRcdHJldHVybiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXHR9XG5cblx0Y29uc3QgZ3JvdXBLaW5kID0gaXNSZWdFeHAgPyBHcm91cHMuUmVnRXhwIDogR3JvdXBzLlF1b3RlXG5cblx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBncm91cEtpbmQpXG5cblx0ZWF0Q2hhcnM6IGZvciAoOzspIHtcblx0XHRjb25zdCBjaGFyID0gZWF0KClcblxuXHRcdHN3aXRjaCAoY2hhcikge1xuXHRcdFx0Y2FzZSBDaGFycy5CYWNrc2xhc2g6IHtcblx0XHRcdFx0Y29uc3QgbmV4dCA9IGVhdCgpXG5cdFx0XHRcdC8vIFxcIywgXFxgLCBhbmQgXFxcIiBhcmUgc3BlY2lhbCBiZWNhdXNlIHRoZXkgZXNjYXBlIGEgbWFzb24gc3BlY2lhbCBjaGFyYWN0ZXIsXG5cdFx0XHRcdC8vIHdoaWxlIG90aGVycyBhcmUgZXNjYXBlIHNlcXVlbmNlcy5cblx0XHRcdFx0aWYgKG5leHQgPT09IENoYXJzLkhhc2ggfHwgbmV4dCA9PT0gKGlzUmVnRXhwID8gQ2hhcnMuQmFja3RpY2sgOiBDaGFycy5RdW90ZSkpXG5cdFx0XHRcdFx0YWRkQ2hhcihuZXh0KVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0YWRkKGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWApXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIENoYXJzLkhhc2g6XG5cdFx0XHRcdG1heWJlT3V0cHV0UmVhZCgpXG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuT3BlblBhcmVudGhlc2lzKSkge1xuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5JbnRlcnBvbGF0aW9uKGwpXG5cdFx0XHRcdFx0bGV4UGxhaW4odHJ1ZSlcblx0XHRcdFx0XHQvLyBSZXR1cm5pbmcgZnJvbSBsZXhQbGFpbiBtZWFucyB0aGF0IHRoZSBpbnRlcnBvbGF0aW9uIHdhcyBjbG9zZWQuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgc3RhcnRQb3MgPSBwb3MoKVxuXHRcdFx0XHRcdGNvbnN0IGZpcnN0Q2hhciA9IGVhdCgpXG5cdFx0XHRcdFx0Y2hlY2soaXNOYW1lQ2hhcmFjdGVyKGZpcnN0Q2hhciksIHBvcywgJ2JhZEludGVycG9sYXRpb24nKVxuXHRcdFx0XHRcdGxleE5hbWUoc3RhcnRQb3MsIHRydWUpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdC8vIERvbid0IG5lZWQgYGNhc2UgQ2hhcnMuTnVsbDpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRjYXNlIENoYXJzLk5ld2xpbmU6IHtcblx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxQb3MgPSBwb3MoKVxuXHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRjaGVjayhpc0luZGVudGVkLCBwb3MsICd1bmNsb3NlZFF1b3RlJylcblx0XHRcdFx0Ly8gQWxsb3cgZXh0cmEgYmxhbmsgbGluZXMuXG5cdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdFx0aWYgKG5ld0luZGVudCA8IHF1b3RlSW5kZW50KSB7XG5cdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRzdGVwQmFja01hbnkob3JpZ2luYWxQb3MsIG51bU5ld2xpbmVzICsgbmV3SW5kZW50KVxuXHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpXG5cdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0YWRkKCdcXG4nLnJlcGVhdChudW1OZXdsaW5lcykgKyAnXFx0Jy5yZXBlYXQobmV3SW5kZW50IC0gcXVvdGVJbmRlbnQpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrdGljazpcblx0XHRcdFx0aWYgKGlzUmVnRXhwKVxuXHRcdFx0XHRcdGlmIChpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHQvLyBTaW5jZSB0aGVzZSBjb21waWxlIHRvIHRlbXBsYXRlIGxpdGVyYWxzLCBoYXZlIHRvIHJlbWVtYmVyIHRvIGVzY2FwZS5cblx0XHRcdFx0XHRhZGQoJ1xcXFxcXGAnKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5RdW90ZTpcblx0XHRcdFx0aWYgKCFpc1JlZ0V4cCAmJiAhaXNJbmRlbnRlZClcblx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YWRkQ2hhcihjaGFyKVxuXHRcdH1cblx0fVxuXG5cdG1heWJlT3V0cHV0UmVhZCgpXG5cblx0aWYgKGlzUmVnRXhwKVxuXHRcdGN1ckdyb3VwLmZsYWdzID0gbGV4UmVnRXhwRmxhZ3MoKVxuXHRlbHNlXG5cdFx0d2FybkZvclNpbXBsZVF1b3RlKGN1ckdyb3VwKVxuXG5cdGNsb3NlR3JvdXAocG9zKCksIGdyb3VwS2luZClcbn1cblxuZnVuY3Rpb24gd2FybkZvclNpbXBsZVF1b3RlKHF1b3RlR3JvdXApIHtcblx0Y29uc3QgdG9rZW5zID0gcXVvdGVHcm91cC5zdWJUb2tlbnNcblx0aWYgKHRva2Vucy5sZW5ndGggPT09IDEpIHtcblx0XHRjb25zdCBuYW1lID0gdG9rZW5zWzBdXG5cdFx0aWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyAmJiBpc05hbWUobmFtZSkpXG5cdFx0XHR3YXJuKHBvcygpLCAnc3VnZ2VzdFNpbXBsZVF1b3RlJywgbmFtZSlcblx0fVxufVxuXG5mdW5jdGlvbiBpc05hbWUoc3RyKSB7XG5cdGNvbnN0IGNjMCA9IHN0ci5jaGFyQ29kZUF0KDApXG5cdGlmIChpc0RpZ2l0KGNjMCkgfHwgY2MwID09PSBDaGFycy5UaWxkZSlcblx0XHRyZXR1cm4gZmFsc2Vcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIoc3RyLmNoYXJDb2RlQXQoaSkpKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGxleFJlZ0V4cEZsYWdzKCkge1xuXHRsZXQgZmxhZ3MgPSAnJ1xuXHRmb3IgKGNvbnN0IGNoIG9mIFtDaGFycy5HLCBDaGFycy5JLCBDaGFycy5NLCBDaGFycy5ZXSlcblx0XHRpZiAodHJ5RWF0KGNoKSlcblx0XHRcdGZsYWdzID0gZmxhZ3MgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoKVxuXHRyZXR1cm4gZmxhZ3Ncbn1cbiJdfQ==