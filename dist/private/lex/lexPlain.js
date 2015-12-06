'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../context', '../MsAst', '../Token', '../util', './chars', './groupContext', './lex*', './lexName', './sourceContext'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lex*'), require('./lexName'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.context, global.MsAst, global.Token, global.util, global.chars, global.groupContext, global.lex, global.lexName, global.sourceContext);
		global.lexPlain = mod.exports;
	}
})(this, function (exports, _Loc, _context, _MsAst, _Token, _util, _chars, _groupContext, _lex, _lexName, _sourceContext) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = lexPlain;

	var _Loc2 = _interopRequireDefault(_Loc);

	var _lexName2 = _interopRequireDefault(_lexName);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function lexPlain(isInQuote) {
		let indent = 0;
		let startColumn;

		function startPos() {
			return new _Loc.Pos(_sourceContext.line, startColumn);
		}

		function loc() {
			return new _Loc2.default(startPos(), (0, _sourceContext.pos)());
		}

		function keyword(kind) {
			(0, _groupContext.addToCurrentGroup)(new _Token.Keyword(loc(), kind));
		}

		function funKeyword(kind) {
			keyword(kind);
			(0, _groupContext.space)(loc());
		}

		function eatAndAddNumber() {
			const startIndex = _sourceContext.index - 1;
			(0, _sourceContext.tryEat)(_chars.Chars.Hyphen);

			if ((0, _sourceContext.peek)(-1) === _chars.Chars.N0) {
				const p = (0, _sourceContext.peek)();

				switch (p) {
					case _chars.Chars.LetterB:
					case _chars.Chars.LetterO:
					case _chars.Chars.LetterX:
						{
							(0, _sourceContext.skip)();
							const isDigitSpecial = p === _chars.Chars.LetterB ? _chars.isDigitBinary : p === _chars.Chars.LetterO ? _chars.isDigitOctal : _chars.isDigitHex;
							(0, _sourceContext.skipWhile)(isDigitSpecial);
							break;
						}

					case _chars.Chars.Dot:
						if ((0, _chars.isDigit)((0, _sourceContext.peek)(1))) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skipWhile)(_chars.isDigit);
						}

						break;

					default:}
			} else {
				(0, _sourceContext.skipWhile)(_chars.isDigit);

				if ((0, _sourceContext.peek)() === _chars.Chars.Dot && (0, _chars.isDigit)((0, _sourceContext.peek)(1))) {
					(0, _sourceContext.skip)();
					(0, _sourceContext.skipWhile)(_chars.isDigit);
				}
			}

			const str = _sourceContext.sourceString.slice(startIndex, _sourceContext.index);

			(0, _groupContext.addToCurrentGroup)(new _MsAst.NumberLiteral(loc(), str));
		}

		function eatIndent() {
			const optIndent = _context.options.indent();

			if (optIndent === '\t') {
				const indent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
				(0, _context.check)((0, _sourceContext.peek)() !== _chars.Chars.Space, _sourceContext.pos, 'leadingSpace');
				return indent;
			} else {
				const spaces = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Space);
				(0, _context.check)(spaces % optIndent === 0, _sourceContext.pos, 'badSpacedIndent', optIndent);
				return spaces / optIndent;
			}
		}

		function handleName() {
			(0, _lexName2.default)(startPos(), false);
		}

		loop: for (;;) {
			startColumn = _sourceContext.column;
			const characterEaten = (0, _sourceContext.eat)();

			switch (characterEaten) {
				case _chars.Chars.Null:
					break loop;

				case _chars.Chars.Backtick:
				case _chars.Chars.Quote:
					(0, _lex.lexQuote)(indent, characterEaten === _chars.Chars.Backtick);
					break;

				case _chars.Chars.OpenParenthesis:
					if ((0, _sourceContext.tryEat)(_chars.Chars.CloseParenthesis)) (0, _groupContext.addToCurrentGroup)(new _Token.Group(loc(), [], _Token.Groups.Parenthesis));else (0, _groupContext.openParenthesis)(loc());
					break;

				case _chars.Chars.OpenBracket:
					if ((0, _sourceContext.tryEat)(_chars.Chars.CloseBracket)) (0, _groupContext.addToCurrentGroup)(new _Token.Group(loc(), [], _Token.Groups.Bracket));else {
						(0, _groupContext.openGroup)(startPos(), _Token.Groups.Bracket);
						(0, _groupContext.openGroup)((0, _sourceContext.pos)(), _Token.Groups.Space);
					}
					break;

				case _chars.Chars.CloseParenthesis:
					if ((0, _groupContext.closeInterpolationOrParenthesis)(loc())) {
						(0, _util.assert)(isInQuote);
						break loop;
					}

					break;

				case _chars.Chars.CloseBracket:
					(0, _groupContext.closeGroup)(startPos(), _Token.Groups.Space);
					(0, _groupContext.closeGroup)((0, _sourceContext.pos)(), _Token.Groups.Bracket);
					break;

				case _chars.Chars.Space:
					(0, _groupContext.space)(loc());
					break;

				case _chars.Chars.Newline:
					{
						(0, _context.check)(!isInQuote, loc, 'noNewlineInInterpolation');
						if ((0, _sourceContext.peek)(-2) === _chars.Chars.Space) (0, _context.warn)(_sourceContext.pos, 'trailingSpace');
						(0, _sourceContext.skipNewlines)();
						const oldIndent = indent;
						indent = eatIndent();

						if (indent > oldIndent) {
							(0, _context.check)(indent === oldIndent + 1, loc, 'tooMuchIndent');
							const l = loc();

							if ((0, _util.isEmpty)(_groupContext.curGroup.subTokens) || !(0, _Token.isKeyword)(_Token.Keywords.Lazy, (0, _util.last)(_groupContext.curGroup.subTokens))) {
								if (_groupContext.curGroup.kind === _Token.Groups.Space) (0, _groupContext.closeSpaceOKIfEmpty)(l.start);
								(0, _groupContext.openGroup)(l.end, _Token.Groups.Space);
							}

							(0, _groupContext.openGroup)(l.start, _Token.Groups.Block);
							(0, _groupContext.openLine)(l.end);
						} else {
							const l = loc();

							for (let i = indent; i < oldIndent; i = i + 1) (0, _groupContext.closeGroupsForDedent)(l.start);

							(0, _groupContext.closeLine)(l.start);
							(0, _groupContext.openLine)(l.end);
						}

						break;
					}

				case _chars.Chars.Tab:
					(0, _context.fail)(loc(), 'nonLeadingTab');
					break;

				case _chars.Chars.Bang:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunDo);else handleName();
					break;

				case _chars.Chars.Cash:
					if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsyncDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsync);else handleName();
					break;

				case _chars.Chars.Star:
					if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGen);else handleName();
					break;

				case _chars.Chars.Bar:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Space) || (0, _sourceContext.tryEat)(_chars.Chars.Tab)) {
						const text = (0, _sourceContext.eatRestOfLine)();
						(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
						if (!(_groupContext.curGroup.kind === _Token.Groups.Line && _groupContext.curGroup.subTokens.length === 0)) (0, _context.fail)(loc, 'trailingDocComment');
						(0, _groupContext.addToCurrentGroup)(new _Token.DocComment(loc(), text));
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) (0, _sourceContext.skipRestOfLine)();else funKeyword(_Token.Keywords.Fun);

					break;

				case _chars.Chars.Hyphen:
					if ((0, _chars.isDigit)((0, _sourceContext.peek)())) eatAndAddNumber();else handleName();
					break;

				case _chars.Chars.N0:
				case _chars.Chars.N1:
				case _chars.Chars.N2:
				case _chars.Chars.N3:
				case _chars.Chars.N4:
				case _chars.Chars.N5:
				case _chars.Chars.N6:
				case _chars.Chars.N7:
				case _chars.Chars.N8:
				case _chars.Chars.N9:
					eatAndAddNumber();
					break;

				case _chars.Chars.Dot:
					{
						if ((0, _sourceContext.peek)() === _chars.Chars.Space || (0, _sourceContext.peek)() === _chars.Chars.Newline) {
							(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
							keyword(_Token.Keywords.ObjEntry);
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThis);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisDo);else if ((0, _sourceContext.tryEat2)(_chars.Chars.Star, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGen);else if ((0, _sourceContext.tryEat3)(_chars.Chars.Star, _chars.Chars.Bang, _chars.Chars.Bar)) funKeyword(_Token.Keywords.FunThisGenDo);else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) {
							if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);
						} else keyword(_Token.Keywords.Dot);

						break;
					}

				case _chars.Chars.Colon:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Colon);
					break;

				case _chars.Chars.Tick:
					keyword(_Token.Keywords.Tick);
					break;

				case _chars.Chars.Tilde:
					keyword(_Token.Keywords.Lazy);
					break;

				case _chars.Chars.Ampersand:
					keyword(_Token.Keywords.Ampersand);
					break;

				case _chars.Chars.Backslash:
				case _chars.Chars.Caret:
				case _chars.Chars.CloseBrace:
				case _chars.Chars.Comma:
				case _chars.Chars.Hash:
				case _chars.Chars.OpenBrace:
				case _chars.Chars.Percent:
				case _chars.Chars.Semicolon:
					(0, _context.fail)(loc(), 'reservedChar', characterEaten);
					break;

				default:
					handleName();
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBa0J3QixRQUFROzs7Ozs7Ozs7Ozs7VUFBUixRQUFRIiwiZmlsZSI6ImxleFBsYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYywge1Bvc30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Q2hhcnMsIGlzRGlnaXQsIGlzRGlnaXRCaW5hcnksIGlzRGlnaXRIZXgsIGlzRGlnaXRPY3RhbH0gZnJvbSAnLi9jaGFycydcbmltcG9ydCB7YWRkVG9DdXJyZW50R3JvdXAsIGNsb3NlR3JvdXAsIGNsb3NlR3JvdXBzRm9yRGVkZW50LCBjbG9zZUludGVycG9sYXRpb25PclBhcmVudGhlc2lzLFxuXHRjbG9zZUxpbmUsIGNsb3NlU3BhY2VPS0lmRW1wdHksIGN1ckdyb3VwLCBvcGVuR3JvdXAsIG9wZW5MaW5lLCBvcGVuUGFyZW50aGVzaXMsIHNwYWNlXG5cdH0gZnJvbSAnLi9ncm91cENvbnRleHQnXG5pbXBvcnQge2xleFF1b3RlfSBmcm9tICcuL2xleConXG5pbXBvcnQgbGV4TmFtZSBmcm9tICcuL2xleE5hbWUnXG5pbXBvcnQge2NvbHVtbiwgZWF0LCBlYXRSZXN0T2ZMaW5lLCBpbmRleCwgbGluZSwgcGVlaywgcG9zLCBzb3VyY2VTdHJpbmcsIHNraXAsIHNraXBOZXdsaW5lcyxcblx0c2tpcFJlc3RPZkxpbmUsIHNraXBXaGlsZSwgc2tpcFdoaWxlRXF1YWxzLCB0cnlFYXQsIHRyeUVhdDIsIHRyeUVhdDN9IGZyb20gJy4vc291cmNlQ29udGV4dCdcblxuLypcbkluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cbldoZW4gaXNJblF1b3RlIGlzIHRydWUsIHdlIHdpbGwgbm90IGFsbG93IG5ld2xpbmVzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleFBsYWluKGlzSW5RdW90ZSkge1xuXHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHQvLyBJbmNyZW1lbnRpbmcgaXQgbWVhbnMgaXNzdWluZyBhIEdQX09wZW5CbG9jayBhbmQgZGVjcmVtZW50aW5nIGl0IG1lYW5zIGEgR1BfQ2xvc2VCbG9jay5cblx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0bGV0IGluZGVudCA9IDBcblxuXHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRsZXQgc3RhcnRDb2x1bW5cblx0ZnVuY3Rpb24gc3RhcnRQb3MoKSB7XG5cdFx0cmV0dXJuIG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pXG5cdH1cblx0ZnVuY3Rpb24gbG9jKCkge1xuXHRcdHJldHVybiBuZXcgTG9jKHN0YXJ0UG9zKCksIHBvcygpKVxuXHR9XG5cdGZ1bmN0aW9uIGtleXdvcmQoa2luZCkge1xuXHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSlcblx0fVxuXHRmdW5jdGlvbiBmdW5LZXl3b3JkKGtpbmQpIHtcblx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0c3BhY2UobG9jKCkpXG5cdH1cblx0ZnVuY3Rpb24gZWF0QW5kQWRkTnVtYmVyKCkge1xuXHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleCAtIDFcblxuXHRcdHRyeUVhdChDaGFycy5IeXBoZW4pXG5cdFx0aWYgKHBlZWsoLTEpID09PSBDaGFycy5OMCkge1xuXHRcdFx0Y29uc3QgcCA9IHBlZWsoKVxuXHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdGNhc2UgQ2hhcnMuTGV0dGVyQjogY2FzZSBDaGFycy5MZXR0ZXJPOiBjYXNlIENoYXJzLkxldHRlclg6IHtcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRwID09PSBDaGFycy5MZXR0ZXJCID9cblx0XHRcdFx0XHRcdGlzRGlnaXRCaW5hcnkgOlxuXHRcdFx0XHRcdFx0cCA9PT0gQ2hhcnMuTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRpc0RpZ2l0T2N0YWwgOlxuXHRcdFx0XHRcdFx0aXNEaWdpdEhleFxuXHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgQ2hhcnMuRG90OlxuXHRcdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWsoMSkpKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdGlmIChwZWVrKCkgPT09IENoYXJzLkRvdCAmJiBpc0RpZ2l0KHBlZWsoMSkpKSB7XG5cdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdH1cblx0ZnVuY3Rpb24gZWF0SW5kZW50KCkge1xuXHRcdGNvbnN0IG9wdEluZGVudCA9IG9wdGlvbnMuaW5kZW50KClcblx0XHRpZiAob3B0SW5kZW50ID09PSAnXFx0Jykge1xuXHRcdFx0Y29uc3QgaW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdGNoZWNrKHBlZWsoKSAhPT0gQ2hhcnMuU3BhY2UsIHBvcywgJ2xlYWRpbmdTcGFjZScpXG5cdFx0XHRyZXR1cm4gaW5kZW50XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5TcGFjZSlcblx0XHRcdGNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAnYmFkU3BhY2VkSW5kZW50Jywgb3B0SW5kZW50KVxuXHRcdFx0cmV0dXJuIHNwYWNlcyAvIG9wdEluZGVudFxuXHRcdH1cblx0fVxuXHRmdW5jdGlvbiBoYW5kbGVOYW1lKCkge1xuXHRcdGxleE5hbWUoc3RhcnRQb3MoKSwgZmFsc2UpXG5cdH1cblxuXHRsb29wOiBmb3IgKDs7KSB7XG5cdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0Ly8gR2VuZXJhbGx5LCB0aGUgdHlwZSBvZiBhIHRva2VuIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IGNoYXJhY3Rlci5cblx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRjYXNlIENoYXJzLk51bGw6XG5cdFx0XHRcdGJyZWFrIGxvb3Bcblx0XHRcdGNhc2UgQ2hhcnMuQmFja3RpY2s6IGNhc2UgQ2hhcnMuUXVvdGU6XG5cdFx0XHRcdGxleFF1b3RlKGluZGVudCwgY2hhcmFjdGVyRWF0ZW4gPT09IENoYXJzLkJhY2t0aWNrKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0Y2FzZSBDaGFycy5PcGVuUGFyZW50aGVzaXM6XG5cdFx0XHRcdC8vIEhhbmRsZSBgKClgIHNwZWNpYWxseSB0byBhdm9pZCB3YXJuaW5ncyBhYm91dCBhbiBlbXB0eSBzcGFjZWQgZ3JvdXAgaW5zaWRlLlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5QYXJlbnRoZXNpcykpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5CcmFja2V0OlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLkJyYWNrZXQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0b3Blbkdyb3VwKHBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VQYXJlbnRoZXNpczpcblx0XHRcdFx0aWYgKGNsb3NlSW50ZXJwb2xhdGlvbk9yUGFyZW50aGVzaXMobG9jKCkpKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KGlzSW5RdW90ZSlcblx0XHRcdFx0XHRicmVhayBsb29wXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VCcmFja2V0OlxuXHRcdFx0XHRjbG9zZUdyb3VwKHN0YXJ0UG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlNwYWNlOlxuXHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuTmV3bGluZToge1xuXHRcdFx0XHRjaGVjayghaXNJblF1b3RlLCBsb2MsICdub05ld2xpbmVJbkludGVycG9sYXRpb24nKVxuXHRcdFx0XHRpZiAocGVlaygtMikgPT09IENoYXJzLlNwYWNlKVxuXHRcdFx0XHRcdHdhcm4ocG9zLCAndHJhaWxpbmdTcGFjZScpXG5cblx0XHRcdFx0Ly8gU2tpcCBhbnkgYmxhbmsgbGluZXMuXG5cdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRpbmRlbnQgPSBlYXRJbmRlbnQoKVxuXHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0Y2hlY2soaW5kZW50ID09PSBvbGRJbmRlbnQgKyAxLCBsb2MsICd0b29NdWNoSW5kZW50Jylcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtleXdvcmRzLkxhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvcGVuR3JvdXAobC5zdGFydCwgR3JvdXBzLkJsb2NrKVxuXHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50KGwuc3RhcnQpXG5cdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgQ2hhcnMuVGFiOlxuXHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0Ly8gc28gdGhpcyB3aWxsIG9ubHkgaGFwcGVuIGluIHRoZSBtaWRkbGUgb2YgYSBsaW5lLlxuXHRcdFx0XHRmYWlsKGxvYygpLCAnbm9uTGVhZGluZ1RhYicpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIEZVTlxuXG5cdFx0XHRjYXNlIENoYXJzLkJhbmc6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkRvKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNhc2g6XG5cdFx0XHRcdGlmICh0cnlFYXQyKENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Bc3luY0RvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlN0YXI6XG5cdFx0XHRcdGlmICh0cnlFYXQyKENoYXJzLkJhbmcsIENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW5Ebylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW4pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQmFyOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLlNwYWNlKSB8fCB0cnlFYXQoQ2hhcnMuVGFiKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRleHQgPSBlYXRSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0aWYgKCEoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLkxpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCkpXG5cdFx0XHRcdFx0XHRmYWlsKGxvYywgJ3RyYWlsaW5nRG9jQ29tbWVudCcpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IERvY0NvbW1lbnQobG9jKCksIHRleHQpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdC8vIG5vbi1kb2MgY29tbWVudFxuXHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0Y2FzZSBDaGFycy5IeXBoZW46XG5cdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWsoKSkpXG5cdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk4wOiBjYXNlIENoYXJzLk4xOiBjYXNlIENoYXJzLk4yOiBjYXNlIENoYXJzLk4zOiBjYXNlIENoYXJzLk40OlxuXHRcdFx0Y2FzZSBDaGFycy5ONTogY2FzZSBDaGFycy5ONjogY2FzZSBDaGFycy5ONzogY2FzZSBDaGFycy5OODogY2FzZSBDaGFycy5OOTpcblx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0YnJlYWtcblxuXG5cdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRjYXNlIENoYXJzLkRvdDoge1xuXHRcdFx0XHRpZiAocGVlaygpID09PSBDaGFycy5TcGFjZSB8fCBwZWVrKCkgPT09IENoYXJzLk5ld2xpbmUpIHtcblx0XHRcdFx0XHQvLyBLZXl3b3Jkcy5PYmpFbnRyeSBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHQvLyBXZSBjYW4ndCBqdXN0IGNyZWF0ZSBhIG5ldyBHcm91cCBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0b1xuXHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5PYmpFbnRyeSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXMpXG5cdFx0XHRcdGVsc2UgaWYgKHRyeUVhdDIoQ2hhcnMuQmFuZywgQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNEbylcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0MihDaGFycy5TdGFyLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbilcblx0XHRcdFx0ZWxzZSBpZiAodHJ5RWF0MyhDaGFycy5TdGFyLCBDaGFycy5CYW5nLCBDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRlbHNlIGlmICh0cnlFYXQoQ2hhcnMuRG90KSlcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkRvdCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdDMpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QyKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgQ2hhcnMuQ29sb246XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuRXF1YWwpKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTG9jYWxNdXRhdGUpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkNvbG9uKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLlRpY2s6XG5cdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuVGljaylcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5UaWxkZTpcblx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5MYXp5KVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLkFtcGVyc2FuZDpcblx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5BbXBlcnNhbmQpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuQmFja3NsYXNoOiBjYXNlIENoYXJzLkNhcmV0OiBjYXNlIENoYXJzLkNsb3NlQnJhY2U6IGNhc2UgQ2hhcnMuQ29tbWE6XG5cdFx0XHRjYXNlIENoYXJzLkhhc2g6IGNhc2UgQ2hhcnMuT3BlbkJyYWNlOiBjYXNlIENoYXJzLlBlcmNlbnQ6IGNhc2UgQ2hhcnMuU2VtaWNvbG9uOlxuXHRcdFx0XHRmYWlsKGxvYygpLCAncmVzZXJ2ZWRDaGFyJywgY2hhcmFjdGVyRWF0ZW4pXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdH1cblx0fVxufVxuIl19