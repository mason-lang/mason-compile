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
				if ((0, _sourceContext.peek)() === _chars.Chars.Dot && (0, _chars.isDigit)((0, _sourceContext.peekNext)())) {
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
						} else if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) if ((0, _sourceContext.tryEat)(_chars.Chars.Dot)) keyword(_Token.Keywords.Dot3);else keyword(_Token.Keywords.Dot2);else keyword(_Token.Keywords.Dot);
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

				case _chars.Chars.Ampersand:
					keyword(_Token.Keywords.Ampersand);
					break;

				case _chars.Chars.Backslash:case _chars.Chars.Backtick:case _chars.Chars.Caret:
				case _chars.Chars.Comma:case _chars.Chars.Percent:case _chars.Chars.Semicolon:
					(0, _context.fail)(loc(), `Reserved character ${ (0, _chars.showChar)(characterEaten) }`);

				default:
					handleName();
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sZXhQbGFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBcUJ3QixRQUFROzs7Ozs7Ozs7OztBQUFqQixVQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Ozs7QUFJM0MsTUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBOzs7QUFHZCxNQUFJLFdBQVcsQ0FBQTtBQUNmLFdBQVMsUUFBUSxHQUFHO0FBQ25CLFVBQU8sa0JBOUJJLEdBQUcsZ0JBYW9DLElBQUksRUFpQmpDLFdBQVcsQ0FBQyxDQUFBO0dBQ2pDO0FBQ0QsV0FBUyxHQUFHLEdBQUc7QUFDZCxVQUFPLGlCQUFRLFFBQVEsRUFBRSxFQUFFLG1CQW5CNUIsR0FBRyxHQW1COEIsQ0FBQyxDQUFBO0dBQ2pDO0FBQ0QsV0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3RCLHFCQTNCTSxpQkFBaUIsRUEyQkwsV0FoQzBCLE9BQU8sQ0FnQ3JCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7R0FDM0M7QUFDRCxXQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDekIsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUViLHFCQS9Cc0YsS0FBSyxFQStCckYsR0FBRyxFQUFFLENBQUMsQ0FBQTtHQUNaO0FBQ0QsV0FBUyxlQUFlLEdBQUc7QUFDMUIsU0FBTSxVQUFVLEdBQUcsZUEvQmUsS0FBSyxHQStCWixDQUFDLENBQUE7O0FBRTVCLHNCQS9Ca0IsTUFBTSxFQStCakIsT0F2Q0QsS0FBSyxDQXVDRSxNQUFNLENBQUMsQ0FBQTtBQUNwQixPQUFJLG1CQWxDMEQsUUFBUSxHQWtDeEQsS0FBSyxPQXhDYixLQUFLLENBd0NjLEVBQUUsRUFBRTtBQUM1QixVQUFNLENBQUMsR0FBRyxtQkFuQzZDLElBQUksR0FtQzNDLENBQUE7QUFDaEIsWUFBUSxDQUFDO0FBQ1IsVUFBSyxPQTNDRCxLQUFLLENBMkNFLE9BQU8sQ0FBQyxB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dCBMb2MsIHtQb3N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lXG5cdH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge2lmRWxzZSwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7Q2hhcnMsIGlzRGlnaXQsIGlzRGlnaXRCaW5hcnksIGlzRGlnaXRIZXgsIGlzRGlnaXRPY3RhbCwgaXNOYW1lQ2hhcmFjdGVyLCBzaG93Q2hhclxuXHR9IGZyb20gJy4vY2hhcnMnXG5pbXBvcnQge2FkZFRvQ3VycmVudEdyb3VwLCBjbG9zZUdyb3VwLCBjbG9zZUdyb3Vwc0ZvckRlZGVudCwgY2xvc2VMaW5lLFxuXHRjbG9zZVBhcmVudGhlc2lzLCBjbG9zZVNwYWNlT0tJZkVtcHR5LCBjdXJHcm91cCwgb3Blbkdyb3VwLCBvcGVuTGluZSwgb3BlblBhcmVudGhlc2lzLCBzcGFjZVxuXHR9IGZyb20gJy4vZ3JvdXBDb250ZXh0J1xuaW1wb3J0IHtsZXhRdW90ZX0gZnJvbSAnLi9sZXgqJ1xuaW1wb3J0IHtjb2x1bW4sIGVhdCwgZWF0UmVzdE9mTGluZSwgaW5kZXgsIG11c3RFYXQsIGxpbmUsIHBlZWssIHBlZWtQcmV2LCBwZWVrTmV4dCwgcGVlazJCZWZvcmUsXG5cdHBvcywgc291cmNlU3RyaW5nLCBza2lwLCBza2lwTmV3bGluZXMsIHNraXBSZXN0T2ZMaW5lLCBza2lwV2hpbGUsIHNraXBXaGlsZUVxdWFscyxcblx0dGFrZVdoaWxlV2l0aFByZXYsIHRyeUVhdH0gZnJvbSAnLi9zb3VyY2VDb250ZXh0J1xuXG4vKlxuSW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuV2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4UGxhaW4oaXNJblF1b3RlKSB7XG5cdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHQvLyBEb2VzIG5vdGhpbmcgaWYgaXNJblF1b3RlLlxuXHRsZXQgaW5kZW50ID0gMFxuXG5cdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdGxldCBzdGFydENvbHVtblxuXHRmdW5jdGlvbiBzdGFydFBvcygpIHtcblx0XHRyZXR1cm4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbilcblx0fVxuXHRmdW5jdGlvbiBsb2MoKSB7XG5cdFx0cmV0dXJuIG5ldyBMb2Moc3RhcnRQb3MoKSwgcG9zKCkpXG5cdH1cblx0ZnVuY3Rpb24ga2V5d29yZChraW5kKSB7XG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobG9jKCksIGtpbmQpKVxuXHR9XG5cdGZ1bmN0aW9uIGZ1bktleXdvcmQoa2luZCkge1xuXHRcdGtleXdvcmQoa2luZClcblx0XHQvLyBGaXJzdCBhcmcgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXBcblx0XHRzcGFjZShsb2MoKSlcblx0fVxuXHRmdW5jdGlvbiBlYXRBbmRBZGROdW1iZXIoKSB7XG5cdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0dHJ5RWF0KENoYXJzLkh5cGhlbilcblx0XHRpZiAocGVla1ByZXYoKSA9PT0gQ2hhcnMuTjApIHtcblx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdHN3aXRjaCAocCkge1xuXHRcdFx0XHRjYXNlIENoYXJzLkxldHRlckI6IGNhc2UgQ2hhcnMuTGV0dGVyTzogY2FzZSBDaGFycy5MZXR0ZXJYOlxuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGNvbnN0IGlzRGlnaXRTcGVjaWFsID1cblx0XHRcdFx0XHRcdHAgPT09IENoYXJzLkxldHRlckIgP1xuXHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRwID09PSBDaGFycy5MZXR0ZXJPID9cblx0XHRcdFx0XHRcdGlzRGlnaXRPY3RhbCA6XG5cdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXRTcGVjaWFsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2hhcnMuRG90OlxuXHRcdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWtOZXh0KCkpKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdGlmIChwZWVrKCkgPT09IENoYXJzLkRvdCAmJiBpc0RpZ2l0KHBlZWtOZXh0KCkpKSB7XG5cdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdH1cblx0ZnVuY3Rpb24gZWF0SW5kZW50KCkge1xuXHRcdGNvbnN0IG9wdEluZGVudCA9IG9wdGlvbnMuaW5kZW50KClcblx0XHRpZiAob3B0SW5kZW50ID09PSAnXFx0Jykge1xuXHRcdFx0Y29uc3QgaW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKENoYXJzLlRhYilcblx0XHRcdGNoZWNrKHBlZWsoKSAhPT0gQ2hhcnMuU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0cmV0dXJuIGluZGVudFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzcGFjZXMgPSBza2lwV2hpbGVFcXVhbHMoQ2hhcnMuU3BhY2UpXG5cdFx0XHRjaGVjayhzcGFjZXMgJSBvcHRJbmRlbnQgPT09IDAsIHBvcywgKCkgPT5cblx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdHJldHVybiBzcGFjZXMgLyBvcHRJbmRlbnRcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGhhbmRsZU5hbWUoKSB7XG5cdFx0Y2hlY2soaXNOYW1lQ2hhcmFjdGVyKHBlZWtQcmV2KCkpLCBsb2MoKSwgKCkgPT5cblx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihwZWVrUHJldigpKX1gKVxuXG5cdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdGNvbnN0IG5hbWUgPSB0YWtlV2hpbGVXaXRoUHJldihpc05hbWVDaGFyYWN0ZXIpXG5cblx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRpZiAobmFtZS5sZW5ndGggPiAxKVxuXHRcdFx0XHRoYW5kbGVOYW1lVGV4dChuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSkpXG5cdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZvY3VzKVxuXHRcdH0gZWxzZVxuXHRcdFx0aGFuZGxlTmFtZVRleHQobmFtZSlcblx0fVxuXHRmdW5jdGlvbiBoYW5kbGVOYW1lVGV4dChuYW1lKSB7XG5cdFx0aWZFbHNlKG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKSxcblx0XHRcdGtpbmQgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlJlZ2lvbjpcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuUmVnaW9uKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlRvZG86XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiB3YXJuXG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQoKSA9PiB7XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOYW1lKGxvYygpLCBuYW1lKSlcblx0XHRcdH0pXG5cdH1cblxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0Y29uc3QgY2hhcmFjdGVyRWF0ZW4gPSBlYXQoKVxuXHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0Y2FzZSBDaGFycy5OdWxsOlxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdGNhc2UgQ2hhcnMuQ2xvc2VCcmFjZTpcblx0XHRcdFx0Y2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKENoYXJzLkNsb3NlQnJhY2UpfWApXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FzZSBDaGFycy5RdW90ZTpcblx0XHRcdFx0bGV4UXVvdGUoaW5kZW50KVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0Y2FzZSBDaGFycy5PcGVuUGFyZW50aGVzaXM6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ2xvc2VQYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLlBhcmVudGhlc2lzKSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuT3BlbkJyYWNrZXQ6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQ2xvc2VCcmFja2V0KSlcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuQnJhY2tldCkpXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdG9wZW5Hcm91cChzdGFydFBvcygpLCBHcm91cHMuQnJhY2tldClcblx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5DbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdGNsb3NlR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRjbG9zZUdyb3VwKHBvcygpLCBHcm91cHMuQnJhY2tldClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuU3BhY2U6XG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5OZXdsaW5lOiB7XG5cdFx0XHRcdGNoZWNrKCFpc0luUXVvdGUsIGxvYywgJ1F1b3RlIGludGVycG9sYXRpb24gY2Fubm90IGNvbnRhaW4gbmV3bGluZScpXG5cdFx0XHRcdGlmIChwZWVrMkJlZm9yZSgpID09PSBDaGFycy5TcGFjZSlcblx0XHRcdFx0XHR3YXJuKHBvcywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cblx0XHRcdFx0Ly8gU2tpcCBhbnkgYmxhbmsgbGluZXMuXG5cdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRpbmRlbnQgPSBlYXRJbmRlbnQoKVxuXHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0Y2hlY2soaW5kZW50ID09PSBvbGRJbmRlbnQgKyAxLCBsb2MsXG5cdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0Ly8gQmxvY2sgYXQgZW5kIG9mIGxpbmUgZ29lcyBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHQvLyBIb3dldmVyLCBgfmAgcHJlY2VkaW5nIGEgYmxvY2sgZ29lcyBpbiBhIGdyb3VwIHdpdGggaXQuXG5cdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0IWlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCBsYXN0KGN1ckdyb3VwLnN1YlRva2VucykpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b3Blbkdyb3VwKGwuc3RhcnQsIEdyb3Vwcy5CbG9jaylcblx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gaW5kZW50OyBpIDwgb2xkSW5kZW50OyBpID0gaSArIDEpXG5cdFx0XHRcdFx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudChsLnN0YXJ0KVxuXHRcdFx0XHRcdGNsb3NlTGluZShsLnN0YXJ0KVxuXHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIENoYXJzLlRhYjpcblx0XHRcdFx0Ly8gV2UgYWx3YXlzIGVhdCB0YWJzIGluIHRoZSBOZXdsaW5lIGhhbmRsZXIsXG5cdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0ZmFpbChsb2MoKSwgJ1RhYiBtYXkgb25seSBiZSB1c2VkIHRvIGluZGVudCcpXG5cblx0XHRcdC8vIEZVTlxuXG5cdFx0XHRjYXNlIENoYXJzLkJhbmc6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFyKSlcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkRvKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkNhc2g6XG5cdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFuZykpIHtcblx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkJhciwgJyQhJylcblx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jRG8pXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Bc3luYylcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBDaGFycy5UaWxkZTpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5CYW5nKSkge1xuXHRcdFx0XHRcdG11c3RFYXQoQ2hhcnMuQmFyLCAnfiEnKVxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuRG8pXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5HZW4pXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxhenkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIENoYXJzLkJhcjpcblx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5TcGFjZSkgfHwgdHJ5RWF0KENoYXJzLlRhYikpIHtcblx0XHRcdFx0XHRjb25zdCB0ZXh0ID0gZWF0UmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdGlmICghKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5MaW5lICYmIGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApKVxuXHRcdFx0XHRcdFx0ZmFpbChsb2MsXG5cdFx0XHRcdFx0XHRcdGBEb2MgY29tbWVudCBtdXN0IGdvIG9uIGl0cyBvd24gbGluZS4gRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/YClcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgRG9jQ29tbWVudChsb2MoKSwgdGV4dCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkJhcikpXG5cdFx0XHRcdFx0Ly8gbm9uLWRvYyBjb21tZW50XG5cdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW4pXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdC8vIE5VTUJFUlxuXG5cdFx0XHRjYXNlIENoYXJzLkh5cGhlbjpcblx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHQvLyBlYXRBbmRBZGROdW1iZXIoKSBsb29rcyBhdCBwcmV2IGNoYXJhY3Rlciwgc28gaHlwaGVuIGluY2x1ZGVkLlxuXHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgQ2hhcnMuTjA6IGNhc2UgQ2hhcnMuTjE6IGNhc2UgQ2hhcnMuTjI6IGNhc2UgQ2hhcnMuTjM6IGNhc2UgQ2hhcnMuTjQ6XG5cdFx0XHRjYXNlIENoYXJzLk41OiBjYXNlIENoYXJzLk42OiBjYXNlIENoYXJzLk43OiBjYXNlIENoYXJzLk44OiBjYXNlIENoYXJzLk45OlxuXHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRicmVha1xuXG5cblx0XHRcdC8vIE9USEVSXG5cblx0XHRcdGNhc2UgQ2hhcnMuRG90OiB7XG5cdFx0XHRcdGNvbnN0IG5leHQgPSBwZWVrKClcblx0XHRcdFx0aWYgKG5leHQgPT09IENoYXJzLlNwYWNlIHx8IG5leHQgPT09IENoYXJzLk5ld2xpbmUpIHtcblx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdC8vIFdlIGNhbid0IGp1c3QgY3JlYXRlIGEgbmV3IEdyb3VwIGhlcmUgYmVjYXVzZSB3ZSB3YW50IHRvXG5cdFx0XHRcdFx0Ly8gZW5zdXJlIGl0J3Mgbm90IHBhcnQgb2YgdGhlIHByZWNlZGluZyBvciBmb2xsb3dpbmcgc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLk9iakFzc2lnbilcblx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBDaGFycy5CYXIpIHtcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXMpXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQ2hhcnMuQmFuZyAmJiBwZWVrTmV4dCgpID09PSBDaGFycy5CYXIpIHtcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNEbylcblx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBDaGFycy5UaWxkZSkge1xuXHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2hhcnMuQmFuZykpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQ2hhcnMuQmFyLCAnLn4hJylcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KENoYXJzLkJhciwgJy5+Jylcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KENoYXJzLkRvdCkpXG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDaGFycy5Eb3QpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QzKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRG90Milcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRG90KVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlIENoYXJzLkNvbG9uOlxuXHRcdFx0XHRpZiAodHJ5RWF0KENoYXJzLkNvbG9uKSkge1xuXHRcdFx0XHRcdG11c3RFYXQoQ2hhcnMuRXF1YWwsICc6OicpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChDaGFycy5FcXVhbCkpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Mb2NhbE11dGF0ZSlcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuVHlwZSlcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5UaWNrOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlRpY2spXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgQ2hhcnMuQW1wZXJzYW5kOlxuXHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkFtcGVyc2FuZClcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDaGFycy5CYWNrc2xhc2g6IGNhc2UgQ2hhcnMuQmFja3RpY2s6IGNhc2UgQ2hhcnMuQ2FyZXQ6XG5cdFx0XHRjYXNlIENoYXJzLkNvbW1hOiBjYXNlIENoYXJzLlBlcmNlbnQ6IGNhc2UgQ2hhcnMuU2VtaWNvbG9uOlxuXHRcdFx0XHRmYWlsKGxvYygpLCBgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoY2hhcmFjdGVyRWF0ZW4pfWApXG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdH1cblx0fVxufVxuIl19