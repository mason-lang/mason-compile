(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', 'esast/dist/Loc', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './chars', './groupContext', './lex*', './sourceContext'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('esast/dist/Loc'), require('../../CompileError'), require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./chars'), require('./groupContext'), require('./lex*'), require('./sourceContext'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Loc, global.CompileError, global.context, global.MsAst, global.Token, global.util, global.chars, global.groupContext, global.lex, global.sourceContext);
		global.lexPlain = mod.exports;
	}
})(this, function (exports, module, _esastDistLoc, _CompileError, _context, _MsAst, _Token, _util, _chars, _groupContext, _lex, _sourceContext) {
	'use strict';

	module.exports = lexPlain;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	/*
 In the case of quote interpolation ("a{b}c") we'll recurse back into here.
 When isInQuote is true, we will not allow newlines.
 */

	function lexPlain(isInQuote) {
		// This tells us which indented block we're in.
		// Incrementing it means issuing a GP_OpenBlock and decrementing it means a GP_CloseBlock.
		// Does nothing if isInQuote.
		let indent = 0;

		// This is where we started lexing the current token.
		let startColumn;
		function startPos() {
			return new _esastDistLoc.Pos(_sourceContext.line, startColumn);
		}
		function loc() {
			return new _Loc.default(startPos(), (0, _sourceContext.pos)());
		}
		function keyword(kind) {
			(0, _groupContext.addToCurrentGroup)(new _Token.Keyword(loc(), kind));
		}
		function funKeyword(kind) {
			keyword(kind);
			// First arg in its own spaced group
			(0, _groupContext.space)(loc());
		}
		function eatAndAddNumber() {
			const startIndex = _sourceContext.index - 1;

			(0, _sourceContext.tryEat)(_chars.Chars.Hyphen);
			if ((0, _sourceContext.peekPrev)() === _chars.Chars.N0) {
				const p = (0, _sourceContext.peek)();
				switch (p) {
					case _chars.Chars.LetterB:case _chars.Chars.LetterO:case _chars.Chars.LetterX:
						(0, _sourceContext.skip)();
						const isDigitSpecial = p === _chars.Chars.LetterB ? _chars.isDigitBinary : p === _chars.Chars.LetterO ? _chars.isDigitOctal : _chars.isDigitHex;
						(0, _sourceContext.skipWhile)(isDigitSpecial);
						break;
					case _chars.Chars.Dot:
						if ((0, _chars.isDigit)((0, _sourceContext.peekNext)())) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skipWhile)(_chars.isDigit);
						}
						break;
					default:
				}
			} else {
				(0, _sourceContext.skipWhile)(_chars.isDigit);
				if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) (0, _sourceContext.skipWhile)(_chars.isDigit);
			}

			const str = _sourceContext.sourceString.slice(startIndex, _sourceContext.index);
			(0, _groupContext.addToCurrentGroup)(new _MsAst.NumberLiteral(loc(), str));
		}
		function eatIndent() {
			const optIndent = _context.options.indent();
			if (optIndent === '\t') {
				const indent = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Tab);
				(0, _context.check)((0, _sourceContext.peek)() !== _chars.Chars.Space, _sourceContext.pos, 'Line begins in a space');
				return indent;
			} else {
				const spaces = (0, _sourceContext.skipWhileEquals)(_chars.Chars.Space);
				(0, _context.check)(spaces % optIndent === 0, _sourceContext.pos, () => `Indentation spaces must be a multiple of ${ optIndent }`);
				return spaces / optIndent;
			}
		}

		function handleName() {
			(0, _context.check)((0, _chars.isNameCharacter)((0, _sourceContext.peekPrev)()), loc(), () => `Reserved character ${ (0, _chars.showChar)((0, _sourceContext.peekPrev)()) }`);

			// All other characters should be handled in a case above.
			const name = (0, _sourceContext.takeWhileWithPrev)(_chars.isNameCharacter);

			if (name.endsWith('_')) {
				if (name.length > 1) handleNameText(name.slice(0, name.length - 1));
				keyword(_Token.Keywords.Focus);
			} else handleNameText(name);
		}
		function handleNameText(name) {
			(0, _util.ifElse)((0, _Token.opKeywordKindFromName)(name), kind => {
				switch (kind) {
					case _Token.Keywords.Region:
						(0, _sourceContext.skipRestOfLine)();
						keyword(_Token.Keywords.Region);
						break;
					case _Token.Keywords.Todo:
						// TODO: warn
						(0, _sourceContext.skipRestOfLine)();
						break;
					default:
						keyword(kind);
				}
			}, () => {
				(0, _groupContext.addToCurrentGroup)(new _Token.Name(loc(), name));
			});
		}

		while (true) {
			startColumn = _sourceContext.column;
			const characterEaten = (0, _sourceContext.eat)();
			// Generally, the type of a token is determined by the first character.
			switch (characterEaten) {
				case _chars.Chars.Null:
					return;
				case _chars.Chars.CloseBrace:
					(0, _context.check)(isInQuote, loc, () => `Reserved character ${ (0, _chars.showChar)(_chars.Chars.CloseBrace) }`);
					return;
				case _chars.Chars.Quote:
					(0, _lex.lexQuote)(indent);
					break;

				// GROUPS

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
					(0, _groupContext.closeParenthesis)(loc());
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
						(0, _context.check)(!isInQuote, loc, 'Quote interpolation cannot contain newline');
						if ((0, _sourceContext.peek2Before)() === _chars.Chars.Space) (0, _context.warn)(_sourceContext.pos, 'Line ends in a space.');

						// Skip any blank lines.
						(0, _sourceContext.skipNewlines)();
						const oldIndent = indent;
						indent = eatIndent();
						if (indent > oldIndent) {
							(0, _context.check)(indent === oldIndent + 1, loc, 'Line is indented more than once');
							const l = loc();
							// Block at end of line goes in its own spaced group.
							// However, `~` preceding a block goes in a group with it.
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
					// We always eat tabs in the Newline handler,
					// so this will only happen in the middle of a line.
					(0, _context.fail)(loc(), 'Tab may only be used to indent');

				// FUN

				case _chars.Chars.Bang:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunDo);else handleName();
					break;
				case _chars.Chars.Cash:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Bar, '$!');
						funKeyword(_Token.Keywords.FunAsyncDo);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunAsync);else handleName();
					break;
				case _chars.Chars.Tilde:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Bar, '~!');
						funKeyword(_Token.Keywords.FunGenDo);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar)) funKeyword(_Token.Keywords.FunGen);else keyword(_Token.Keywords.Lazy);
					break;
				case _chars.Chars.Bar:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Space) || (0, _sourceContext.tryEat)(_chars.Chars.Tab)) {
						const text = (0, _sourceContext.eatRestOfLine)();
						(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
						if (!(_groupContext.curGroup.kind === _Token.Groups.Line && _groupContext.curGroup.subTokens.length === 0)) (0, _context.fail)(loc, `Doc comment must go on its own line. Did you mean ${ (0, _CompileError.code)('||') }?`);
						(0, _groupContext.addToCurrentGroup)(new _Token.DocComment(loc(), text));
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Bar))
						// non-doc comment
						(0, _sourceContext.skipRestOfLine)();else funKeyword(_Token.Keywords.Fun);
					break;

				// NUMBER

				case _chars.Chars.Hyphen:
					if ((0, _chars.isDigit)((0, _sourceContext.peek)()))
						// eatAndAddNumber() looks at prev character, so hyphen included.
						eatAndAddNumber();else handleName();
					break;
				case _chars.Chars.N0:case _chars.Chars.N1:case _chars.Chars.N2:case _chars.Chars.N3:case _chars.Chars.N4:
				case _chars.Chars.N5:case _chars.Chars.N6:case _chars.Chars.N7:case _chars.Chars.N8:case _chars.Chars.N9:
					eatAndAddNumber();
					break;

				// OTHER

				case _chars.Chars.Dot:
					{
						const next = (0, _sourceContext.peek)();
						if (next === _chars.Chars.Space || next === _chars.Chars.Newline) {
							// ObjLit assign in its own spaced group.
							// We can't just create a new Group here because we want to
							// ensure it's not part of the preceding or following spaced group.
							(0, _groupContext.closeSpaceOKIfEmpty)(startPos());
							keyword(_Token.Keywords.ObjAssign);
						} else if (next === _chars.Chars.Bar) {
							(0, _sourceContext.skip)();
							keyword(_Token.Keywords.FunThis);
							(0, _groupContext.space)(loc());
						} else if (next === _chars.Chars.Bang && (0, _sourceContext.peekNext)() === _chars.Chars.Bar) {
							(0, _sourceContext.skip)();
							(0, _sourceContext.skip)();
							keyword(_Token.Keywords.FunThisDo);
							(0, _groupContext.space)(loc());
						} else if (next === _chars.Chars.Tilde) {
							(0, _sourceContext.skip)();
							if ((0, _sourceContext.tryEat)(_chars.Chars.Bang)) {
								(0, _sourceContext.mustEat)(_chars.Chars.Bar, '.~!');
								keyword(_Token.Keywords.FunThisGenDo);
							} else {
								(0, _sourceContext.mustEat)(_chars.Chars.Bar, '.~');
								keyword(_Token.Keywords.FunThisGen);
							}
							(0, _groupContext.space)(loc());
						} else if ((0, _sourceContext.peek)() === _chars.Chars.Dot && (0, _sourceContext.peekNext)() === _chars.Chars.Dot) {
							(0, _sourceContext.eat)();
							(0, _sourceContext.eat)();
							keyword(_Token.Keywords.Ellipsis);
						} else keyword(_Token.Keywords.Dot);
						break;
					}

				case _chars.Chars.Colon:
					if ((0, _sourceContext.tryEat)(_chars.Chars.Colon)) {
						(0, _sourceContext.mustEat)(_chars.Chars.Equal, '::');
						keyword(_Token.Keywords.AssignMutable);
					} else if ((0, _sourceContext.tryEat)(_chars.Chars.Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Type);
					break;

				case _chars.Chars.Tick:
					keyword(_Token.Keywords.Tick);
					break;

				case _chars.Chars.Ampersand:case _chars.Chars.Backslash:case _chars.Chars.Backtick:case _chars.Chars.Caret:
				case _chars.Chars.Comma:case _chars.Chars.Percent:case _chars.Chars.Semicolon:
					(0, _context.fail)(loc(), `Reserved character ${ (0, _chars.showChar)(characterEaten) }`);

				default:
					handleName();
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBcUJ3QixRQUFROzs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Ozs7QUFJM0MsTUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBOzs7QUFHZCxNQUFJLFdBQVcsQ0FBQTtBQUNmLFdBQVMsUUFBUSxHQUFHO0FBQ25CLFVBQU8sa0JBOUJJLEdBQUcsZ0JBYW9DLElBQUksRUFpQmpDLFdBQVcsQ0FBQyxDQUFBO0dBQ2pDO0FBQ0QsV0FBUyxHQUFHLEdBQUc7QUFDZCxVQUFPLGlCQUFRLFFBQVEsRUFBRSxFQUFFLG1CQW5CNUIsR0FBRyxHQW1COEIsQ0FBQyxDQUFBO0dBQ2pDO0FBQ0QsV0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3RCLHFCQTNCTSxpQkFBaUIsRUEyQkwsV0FoQzBCLE9BQU8sQ0FnQ3JCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7R0FDM0M7QUFDRCxXQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDekIsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUViLHFCQS9Cc0YsS0FBSyxFQStCckYsR0FBRyxFQUFFLENBQUMsQ0FBQTtHQUNaO0FBQ0QsV0FBUyxlQUFlLEdBQUc7QUFDMUIsU0FBTSxVQUFVLEdBQUcsZUEvQmUsS0FBSyxHQStCWixDQUFDLENBQUE7O0FBRTVCLHNCQS9Ca0IsTUFBTSxFQStCakIsT0F2Q0QsS0FBSyxDQXVDRSxNQUFNLENBQUMsQ0FBQTtBQUNwQixPQUFJLG1CQWxDMEQsUUFBUSxHQWtDeEQsS0FBSyxPQXhDYixLQUFLLENBd0NjLEVBQUUsRUFBRTtBQUM1QixVQUFNLENBQUMsR0FBRyxtQkFuQzZDLElBQUksR0FtQzNDLENBQUE7QUFDaEIsWUFBUSxDQUFDO0FBQ1IsVUFBSyxPQTNDRCxLQUFLLENBMkNFLE9BQU8sQ0FBQyxB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USxDQTBTekMsYUFBYSxDQUFDLENBQUE7TUFDL0IsTUFBTSxJQUFJLG1CQWhTSyxNQUFNLEVBZ1NKLE9BeFNkLEtBQUssQ0F3U2UsS0FBSyxDQUFDLEVBQzdCLE9BQU8sQ0FBQyxPQTVTMEMsUUFBUSxDQTRTekMsV0FBVyxDQUFDLENBQUEsS0FFN0IsT0FBTyxDQUFDLE9BOVMwQyxRQUFRLENBOFN6QyxJQUFJLENBQUMsQ0FBQTtBQUN2QixXQUFLOztBQUFBLEFBRU4sU0FBSyxPQTlTQSxLQUFLLENBOFNDLElBQUk7QUFDZCxZQUFPLENBQUMsT0FsVDJDLFFBQVEsQ0FrVDFDLElBQUksQ0FBQyxDQUFBO0FBQ3RCLFdBQUs7O0FBQUEsQUFFTixTQUFLLE9BbFRBLEtBQUssQ0FrVEMsU0FBUyxDQUFDLEFBQUMsS0FBSyxPQWxUdEIsS0FBSyxDQWtUdUIsU0FBUyxDQUFDLEFBQUMsS0FBSyxPQWxUNUMsS0FBSyxDQWtUNkMsUUFBUSxDQUFDLEFBQUMsS0FBSyxPQWxUakUsS0FBSyxDQWtUa0UsS0FBSyxDQUFDO0FBQ2xGLFNBQUssT0FuVEEsS0FBSyxDQW1UQyxLQUFLLENBQUMsQUFBQyxLQUFLLE9BblRsQixLQUFLLENBbVRtQixPQUFPLENBQUMsQUFBQyxLQUFLLE9BblR0QyxLQUFLLENBbVR1QyxTQUFTO0FBQ3pELGtCQXpUVyxJQUFJLEVBeVRWLEdBQUcsRUFBRSxFQUFFLENBQUMsbUJBQW1CLEdBQUUsV0FwVDRDLFFBQVEsRUFvVDNDLGNBQWMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBOztBQUFBLEFBRTlEO0FBQ0MsZUFBVSxFQUFFLENBQUE7QUFBQSxJQUNiO0dBQ0Q7RUFDRCIsImZpbGUiOiJsZXhQbGFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Q2hhcnMsIGlzRGlnaXQsIGlzRGlnaXRCaW5hcnksIGlzRGlnaXRIZXgsIGlzRGlnaXRPY3RhbCwgaXNOYW1lQ2hhcmFjdGVyLCBzaG93Q2hhclxuXHR9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjbG9zZUdyb3Vwc0ZvckRlZGVudCwgY2xvc2VMaW5lLFxuXHRjbG9zZVBhcmVudGhlc2lzLCBjbG9zZVNwYWNlT0tJZkVtcHR5LCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuTGluZSwgb3BlblBhcmVudGhlc2lzLCBzcGFjZVxuXHR9IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IHtsZXhRdW90ZX0gZnJvbSAnLi9sZXgqJ1xuaW1wb3J0IHtjb2x1bW4sIGVhdCwgZWF0UmVzdE9mTGluZSwgaW5kZXgsIG11c3RFYXQsIGxpbmUsIHBlZWssIHBlZWtQcmV2LCBwZWVrTmV4dCwgcGVlazJCZWZvcmUsXG5cdHBvcywgc291cmNlU3RyaW5nLCBza2lwLCBza2lwTmV3bGluZXMsIHNraXBSZXN0T2ZMaW5lLCBza2lwV2hpbGUsIHNraXBXaGlsZUVxdWFscyxcblx0dGFrZVdoaWxlV2l0aFByZXYsIHRyeUVhdH0gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKlxuSW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuV2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4UGxhaW4oaXNJblF1b3RlKSB7XG5cdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHQvLyBEb2VzIG5vdGhpbmcgaWYgaXNJblF1b3RlLlxuXHRsZXQgaW5kZW50ID0gMFxuXG5cdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdGxldCBzdGFydENvbHVtblxuXHRmdW5jdGlvbiBzdGFydFBvcygpIHtcblx0XHRyZXR1cm4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbilcblx0fVxuXHRmdW5jdGlvbiBsb2MoKSB7XG5cdFx0cmV0dXJuIG5ldyBMb2Moc3RhcnRQb3MoKSwgcG9zKCkpXG5cdH1cblx0ZnVuY3Rpb24ga2V5d29yZChraW5kKSB7XG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobG9jKCksIGtpbmQpKVxuXHR9XG5cdGZ1bmN0aW9uIGZ1bktleXdvcmQoa2luZCkge1xuXHRcdGtleXdvcmQoa2luZClcblx0XHQvLyBGaXJzdCBhcmcgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXBcblx0XHRzcGFjZShsb2MoKSlcblx0fVxuXHRmdW5jdGlvbiBlYXRBbmRBZGROdW1iZXIoKSB7XG5cdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0dHJ5RWF0KENoYXJzLkh5cGhlbilcblx0XHRpZiAocGVla1ByZXYoKSA9PT0gQ2hhcnMuTjApIHtcblx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdHN3aXRjaCAocCkge1xuXHRcdFx0XHRjYXNlIENoYXJzLkxldHRlckI6IGNhc2UgQ2hhcnMuTGV0dGVyTzogY2FzZSBDaGFycy5MZXR0ZXJYOlxuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGNvbnN0IGlzRGlnaXRTcGVjaWFsID1cblx0XHRcdFx0XHRcdHAgPT09IENoYXJzLkxldHRlckIgP1xuXHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRwID09PSBDaGFycy5MZXR0ZXJPID9cblx0XHRcdFx0XHRcdGlzRGlnaXRPY3RhbCA6XG5cdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXRTcGVjaWFsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2hhcnMuRG90OlxuXHRcdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWtOZXh0KCkpKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuRG90KSlcblx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3RyID0gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOdW1iZXJMaXRlcmFsKGxvYygpLCBzdHIpKVxuXHR9XG5cdGZ1bmN0aW9uIGVhdEluZGVudCgpIHtcblx0XHRjb25zdCBvcHRJbmRlbnQgPSBvcHRpb25zLmluZGVudCgpXG5cdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdGNvbnN0IGluZGVudCA9IHNraXBXaGlsZUVxdWFscyhDaGFycy5UYWIpXG5cdFx0XHRjaGVjayhwZWVrKCkgIT09IENoYXJzLlNwYWNlLCBwb3MsICdMaW5lIGJlZ2lucyBpbiBhIHNwYWNlJylcblx0XHRcdHJldHVybiBpbmRlbnRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc3BhY2VzID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlNwYWNlKVxuXHRcdFx0Y2hlY2soc3BhY2VzICUgb3B0SW5kZW50ID09PSAwLCBwb3MsICgpID0+XG5cdFx0XHRcdGBJbmRlbnRhdGlvbiBzcGFjZXMgbXVzdCBiZSBhIG11bHRpcGxlIG9mICR7b3B0SW5kZW50fWApXG5cdFx0XHRyZXR1cm4gc3BhY2VzIC8gb3B0SW5kZW50XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBoYW5kbGVOYW1lKCkge1xuXHRcdGNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrUHJldigpKSwgbG9jKCksICgpID0+XG5cdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIocGVla1ByZXYoKSl9YClcblxuXHRcdC8vIEFsbCBvdGhlciBjaGFyYWN0ZXJzIHNob3VsZCBiZSBoYW5kbGVkIGluIGEgY2FzZSBhYm92ZS5cblx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXG5cdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0aGFuZGxlTmFtZVRleHQobmFtZS5zbGljZSgwLCBuYW1lLmxlbmd0aCAtIDEpKVxuXHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Gb2N1cylcblx0XHR9IGVsc2Vcblx0XHRcdGhhbmRsZU5hbWVUZXh0KG5hbWUpXG5cdH1cblx0ZnVuY3Rpb24gaGFuZGxlTmFtZVRleHQobmFtZSkge1xuXHRcdGlmRWxzZShvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSksXG5cdFx0XHRraW5kID0+IHtcblx0XHRcdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlJlZ2lvbilcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Ub2RvOlxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogd2FyblxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0a2V5d29yZChraW5kKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9KVxuXHR9XG5cblx0d2hpbGUgKHRydWUpIHtcblx0XHRzdGFydENvbHVtbiA9IGNvbHVtblxuXHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdHN3aXRjaCAoY2hhcmFjdGVyRWF0ZW4pIHtcblx0XHRcdGNhc2UgQ2hhcnMuTnVsbDpcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHRjYXNlIENoYXJzLkNsb3NlQnJhY2U6XG5cdFx0XHRcdGNoZWNrKGlzSW5RdW90ZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDaGFycy5DbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGNhc2UgQ2hhcnMuUXVvdGU6XG5cdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Ly8gR1JPVVBTXG5cblx0XHRcdGNhc2UgQ2hhcnMuT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5QYXJlbnRoZXNpcykpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk9wZW5CcmFja2V0OlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLkJyYWNrZXQpKVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0b3Blbkdyb3VwKHBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VQYXJlbnRoZXNpczpcblx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VCcmFja2V0OlxuXHRcdFx0XHRjbG9zZUdyb3VwKHN0YXJ0UG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLlNwYWNlOlxuXHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuTmV3bGluZToge1xuXHRcdFx0XHRjaGVjayghaXNJblF1b3RlLCBsb2MsICdRdW90ZSBpbnRlcnBvbGF0aW9uIGNhbm5vdCBjb250YWluIG5ld2xpbmUnKVxuXHRcdFx0XHRpZiAocGVlazJCZWZvcmUoKSA9PT0gQ2hhcnMuU3BhY2UpXG5cdFx0XHRcdFx0d2Fybihwb3MsICdMaW5lIGVuZHMgaW4gYSBzcGFjZS4nKVxuXG5cdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRjb25zdCBvbGRJbmRlbnQgPSBpbmRlbnRcblx0XHRcdFx0aW5kZW50ID0gZWF0SW5kZW50KClcblx0XHRcdFx0aWYgKGluZGVudCA+IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdGNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0J0xpbmUgaXMgaW5kZW50ZWQgbW9yZSB0aGFuIG9uY2UnKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdC8vIEJsb2NrIGF0IGVuZCBvZiBsaW5lIGdvZXMgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdGlmIChpc0VtcHR5KGN1ckdyb3VwLnN1YlRva2VucykgfHxcblx0XHRcdFx0XHRcdCFpc0tleXdvcmQoS2V5d29yZHMuTGF6eSwgbGFzdChjdXJHcm91cC5zdWJUb2tlbnMpKSkge1xuXHRcdFx0XHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGwuZW5kLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHcm91cHMuQmxvY2spXG5cdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGluZGVudDsgaSA8IG9sZEluZGVudDsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdFx0Y2xvc2VHcm91cHNGb3JEZWRlbnQobC5zdGFydClcblx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBDaGFycy5UYWI6XG5cdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdGZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHQvLyBGVU5cblxuXHRcdFx0Y2FzZSBDaGFycy5CYW5nOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Ebylcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DYXNoOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkJhbmcpKSB7XG5cdFx0XHRcdFx0bXVzdEVhdChDaGFycy5CYXIsICckIScpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Bc3luY0RvKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmMpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuVGlsZGU6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFuZykpIHtcblx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkJhciwgJ34hJylcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbkRvKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5MYXp5KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5CYXI6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuU3BhY2UpIHx8IHRyeUVhdChDaGFycy5UYWIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgdGV4dCA9IGVhdFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRpZiAoIShjdXJHcm91cC5raW5kID09PSBHcm91cHMuTGluZSAmJiBjdXJHcm91cC5zdWJUb2tlbnMubGVuZ3RoID09PSAwKSlcblx0XHRcdFx0XHRcdGZhaWwobG9jLFxuXHRcdFx0XHRcdFx0XHRgRG9jIGNvbW1lbnQgbXVzdCBnbyBvbiBpdHMgb3duIGxpbmUuIERpZCB5b3UgbWVhbiAke2NvZGUoJ3x8Jyl9P2ApXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IERvY0NvbW1lbnQobG9jKCksIHRleHQpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5CYXIpKVxuXHRcdFx0XHRcdC8vIG5vbi1kb2MgY29tbWVudFxuXHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0Y2FzZSBDaGFycy5IeXBoZW46XG5cdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWsoKSkpXG5cdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLk4wOiBjYXNlIENoYXJzLk4xOiBjYXNlIENoYXJzLk4yOiBjYXNlIENoYXJzLk4zOiBjYXNlIENoYXJzLk40OlxuXHRcdFx0Y2FzZSBDaGFycy5ONTogY2FzZSBDaGFycy5ONjogY2FzZSBDaGFycy5ONzogY2FzZSBDaGFycy5OODogY2FzZSBDaGFycy5OOTpcblx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0YnJlYWtcblxuXG5cdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRjYXNlIENoYXJzLkRvdDoge1xuXHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdGlmIChuZXh0ID09PSBDaGFycy5TcGFjZSB8fCBuZXh0ID09PSBDaGFycy5OZXdsaW5lKSB7XG5cdFx0XHRcdFx0Ly8gT2JqTGl0IGFzc2lnbiBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHQvLyBXZSBjYW4ndCBqdXN0IGNyZWF0ZSBhIG5ldyBHcm91cCBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0b1xuXHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5PYmpBc3NpZ24pXG5cdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQ2hhcnMuQmFyKSB7XG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzKVxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IENoYXJzLkJhbmcgJiYgcGVla05leHQoKSA9PT0gQ2hhcnMuQmFyKSB7XG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzRG8pXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQ2hhcnMuVGlsZGUpIHtcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkJhbmcpKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW5Ebylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChDaGFycy5CYXIsICcuficpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW4pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHBlZWsoKSA9PT0gQ2hhcnMuRG90ICYmIHBlZWtOZXh0KCkgPT09IENoYXJzLkRvdCkge1xuXHRcdFx0XHRcdGVhdCgpXG5cdFx0XHRcdFx0ZWF0KClcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdClcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSBDaGFycy5Db2xvbjpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5Db2xvbikpIHtcblx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQ2hhcnMuRXF1YWwpKVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTG9jYWxNdXRhdGUpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlR5cGUpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuVGljazpcblx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5UaWNrKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIENoYXJzLkFtcGVyc2FuZDogY2FzZSBDaGFycy5CYWNrc2xhc2g6IGNhc2UgQ2hhcnMuQmFja3RpY2s6IGNhc2UgQ2hhcnMuQ2FyZXQ6XG5cdFx0XHRjYXNlIENoYXJzLkNvbW1hOiBjYXNlIENoYXJzLlBlcmNlbnQ6IGNhc2UgQ2hhcnMuU2VtaWNvbG9uOlxuXHRcdFx0XHRmYWlsKGxvYygpLCBgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoY2hhcmFjdGVyRWF0ZW4pfWApXG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdH1cblx0fVxufVxuIl19