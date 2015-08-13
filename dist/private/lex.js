if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../CompileError', '../MsAst', './language', './Token', './util'], function (exports, module, _esastDistLoc, _CompileError, _MsAst, _language, _Token, _util) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	/*
 This produces the Token tree (see Token.js).
 */

	module.exports = (context, sourceString) => {
		// Lexing algorithm requires trailing newline to close any blocks.
		// Use a null-terminated string because it's faster than checking whether index === length.
		sourceString = sourceString + '\n\0';

		// --------------------------------------------------------------------------------------------
		// GROUPING
		// --------------------------------------------------------------------------------------------
		// We only ever write to the innermost Group;
		// when we close that Group we add it to the enclosing Group and continue with that one.
		// Note that `curGroup` is conceptually the top of the stack, but is not stored in `stack`.
		const groupStack = [];
		let curGroup;
		const addToCurrentGroup = token => curGroup.subTokens.push(token),
		     

		// Pause writing to curGroup in favor of writing to a sub-group.
		// When the sub-group finishes we will pop the stack and resume writing to its parent.
		openGroup = (openPos, groupKind) => {
			groupStack.push(curGroup);
			// Contents will be added to by `o`.
			// curGroup.loc.end will be written to when closing it.
			curGroup = (0, _Token.Group)((0, _Loc.default)(openPos, null), [], groupKind);
		},
		     

		// A group ending may close mutliple groups.
		// For example, in `log! (+ 1 1`, the G_Line will also close a G_Parenthesis.
		closeGroups = (closePos, closeKind) => {
			// curGroup is different each time we go through the loop
			// because _closeSingleGroup brings us to an enclosing group.
			while (curGroup.kind !== closeKind) {
				const curKind = curGroup.kind;
				// A line can close a parenthesis, but a parenthesis can't close a line!
				context.check(curKind === _Token.G_Parenthesis || curKind === _Token.G_Bracket || curKind === _Token.G_Space, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened was ${ (0, _Token.showGroupKind)(curKind) }`);
				_closeSingleGroup(closePos, curGroup.kind);
			}
			_closeSingleGroup(closePos, closeKind);
		},
		      _closeSingleGroup = (closePos, closeKind) => {
			let justClosed = curGroup;
			curGroup = groupStack.pop();
			justClosed.loc.end = closePos;
			switch (closeKind) {
				case _Token.G_Space:
					{
						const size = justClosed.subTokens.length;
						if (size !== 0)
							// Spaced should always have at least two elements.
							addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);
						break;
					}
				case _Token.G_Line:
					// Line must have content.
					// This can happen if there was just a comment.
					if (!(0, _util.isEmpty)(justClosed.subTokens)) addToCurrentGroup(justClosed);
					break;
				case _Token.G_Block:
					context.check(!(0, _util.isEmpty)(justClosed.subTokens), closePos, 'Empty block.');
					addToCurrentGroup(justClosed);
					break;
				default:
					addToCurrentGroup(justClosed);
			}
		},
		      openParenthesis = loc => {
			openGroup(loc.start, _Token.G_Parenthesis);
			openGroup(loc.end, _Token.G_Space);
		},
		      openBracket = loc => {
			openGroup(loc.start, _Token.G_Bracket);
			openGroup(loc.end, _Token.G_Space);
		},
		     

		// When starting a new line, a spaced group is created implicitly.
		openLine = pos => {
			openGroup(pos, _Token.G_Line);
			openGroup(pos, _Token.G_Space);
		},
		      closeLine = pos => {
			closeGroups(pos, _Token.G_Space);
			closeGroups(pos, _Token.G_Line);
		},
		     

		// When encountering a space, it both closes and opens a spaced group.
		space = loc => {
			closeGroups(loc.start, _Token.G_Space);
			openGroup(loc.end, _Token.G_Space);
		};

		// --------------------------------------------------------------------------------------------
		// ITERATING THROUGH SOURCESTRING
		// --------------------------------------------------------------------------------------------
		/*
  These are kept up-to-date as we iterate through sourceString.
  Every access to index has corresponding changes to line and/or column.
  This also explains why there are different functions for newlines vs other characters.
  */
		let index = 0,
		    line = _esastDistLoc.StartLine,
		    column = _esastDistLoc.StartColumn;

		/*
  NOTE: We use character *codes* for everything.
  Characters are of type Number and not just Strings of length one.
  */
		const pos = () => (0, _esastDistLoc.Pos)(line, column),
		      peek = () => sourceString.charCodeAt(index),
		      peekNext = () => sourceString.charCodeAt(index + 1),
		     

		// May eat a Newline.
		// If that happens, line and column will temporarily be wrong,
		// but we handle it in that special case (rather than checking for Newline every time).
		eat = () => {
			const char = sourceString.charCodeAt(index);
			index = index + 1;
			column = column + 1;
			return char;
		},
		      skip = eat,
		     

		// charToEat must not be Newline.
		tryEat = charToEat => {
			const canEat = peek() === charToEat;
			if (canEat) {
				index = index + 1;
				column = column + 1;
			}
			return canEat;
		},
		      mustEat = (charToEat, precededBy) => {
			const canEat = tryEat(charToEat);
			context.check(canEat, pos, () => `${ (0, _CompileError.code)(precededBy) } must be followed by ${ showChar(charToEat) }`);
		},
		      tryEatNewline = () => {
			const canEat = peek() === Newline;
			if (canEat) {
				index = index + 1;
				line = line + 1;
				column = _esastDistLoc.StartColumn;
			}
			return canEat;
		},
		     

		// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.
		stepBackMany = (oldPos, nCharsToBackUp) => {
			index = index - nCharsToBackUp;
			line = oldPos.line;
			column = oldPos.column;
		},
		     

		// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
		// characterPredicate must *not* accept Newline.
		// Otherwise there may be an infinite loop!
		takeWhile = characterPredicate => {
			const startIndex = index;
			_skipWhile(characterPredicate);
			return sourceString.slice(startIndex, index);
		},
		      takeWhileWithPrev = characterPredicate => {
			const startIndex = index;
			_skipWhile(characterPredicate);
			return sourceString.slice(startIndex - 1, index);
		},
		      skipWhileEquals = char => _skipWhile(_ => _ === char),
		      skipRestOfLine = () => _skipWhile(_ => _ !== Newline),
		      _skipWhile = characterPredicate => {
			const startIndex = index;
			while (characterPredicate(peek())) index = index + 1;
			const diff = index - startIndex;
			column = column + diff;
			return diff;
		},
		     

		// Called after seeing the first newline.
		// Returns # total newlines, including the first.
		skipNewlines = () => {
			const startLine = line;
			line = line + 1;
			while (peek() === Newline) {
				index = index + 1;
				line = line + 1;
			}
			column = _esastDistLoc.StartColumn;
			return line - startLine;
		};

		// Sprinkle checkPos() around to debug line and column tracking errors.
		/*
  const
  	checkPos = () => {
  		const p = _getCorrectPos()
  		if (p.line !== line || p.column !== column)
  			throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
  	},
  	_indexToPos = new Map(),
  	_getCorrectPos = () => {
  		if (index === 0)
  			return Pos(StartLine, StartColumn)
  			let oldPos, oldIndex
  		for (oldIndex = index - 1; ; oldIndex = oldIndex - 1) {
  			oldPos = _indexToPos.get(oldIndex)
  			if (oldPos !== undefined)
  				break
  			assert(oldIndex >= 0)
  		}
  		let newLine = oldPos.line, newColumn = oldPos.column
  		for (; oldIndex < index; oldIndex = oldIndex + 1)
  			if (sourceString.charCodeAt(oldIndex) === Newline) {
  				newLine = newLine + 1
  				newColumn = StartColumn
  			} else
  				newColumn = newColumn + 1
  			const p = Pos(newLine, newColumn)
  		_indexToPos.set(index, p)
  		return p
  	}
  */

		/*
  In the case of quote interpolation ("a{b}c") we'll recurse back into here.
  When isInQuote is true, we will not allow newlines.
  */
		const lexPlain = isInQuote => {
			// This tells us which indented block we're in.
			// Incrementing it means issuing a GP_OpenBlock and decrementing it means a GP_CloseBlock.
			// Does nothing if isInQuote.
			let indent = 0;

			// Make closures now rather than inside the loop.
			// This is significantly faster as of node v0.11.14.

			// This is where we started lexing the current token.
			let startColumn;
			const startPos = () => (0, _esastDistLoc.Pos)(line, startColumn),
			      loc = () => (0, _Loc.default)(startPos(), pos()),
			      keyword = kind => addToCurrentGroup((0, _Token.Keyword)(loc(), kind)),
			      funKeyword = kind => {
				keyword(kind);
				space(loc());
			},
			      eatAndAddNumber = () => {
				// TODO: A real number literal lexer, not just JavaScript's...
				const numberString = takeWhileWithPrev(isNumberCharacter);
				// Don't include `.` at end.
				if ((0, _util.last)(numberString) === '.') {
					index = index - 1;
					column = column - 1;
				}
				const number = Number(numberString);
				context.check(!Number.isNaN(number), pos, () => `Invalid number literal ${ (0, _CompileError.code)(numberString) }`);
				addToCurrentGroup((0, _MsAst.NumberLiteral)(loc(), number));
			};

			const handleName = () => {
				// All other characters should be handled in a case above.
				const name = takeWhileWithPrev(isNameCharacter);
				const keywordKind = (0, _Token.opKeywordKindFromName)(name);
				if (keywordKind !== undefined) {
					context.check(keywordKind !== -1, pos, () => `Reserved name ${ (0, _CompileError.code)(name) }`);
					if (keywordKind === _Token.KW_Region)
						// TODO: Eat and put it in Region expression
						skipRestOfLine();
					keyword(keywordKind);
				} else addToCurrentGroup((0, _Token.Name)(loc(), name));
			};

			while (true) {
				startColumn = column;
				const characterEaten = eat();
				// Generally, the type of a token is determined by the first character.
				switch (characterEaten) {
					case Zero:
						return;
					case CloseBrace:
						context.check(isInQuote, loc, () => `Reserved character ${ showChar(CloseBrace) }`);
						return;
					case Quote:
						lexQuote(indent);
						break;

					// GROUPS

					case OpenParenthesis:
						openParenthesis(loc());
						break;
					case OpenBracket:
						openBracket(loc());
						break;
					case CloseParenthesis:
						closeGroups(pos(), _Token.G_Parenthesis);
						break;
					case CloseBracket:
						closeGroups(pos(), _Token.G_Bracket);
						break;

					case Space:
						{
							const next = peek();
							context.warnIf(next === Space, loc, 'Multiple spaces in a row.');
							context.warnIf(next === Newline, loc, 'Line ends in a space.');
							space(loc());
							break;
						}

					case Newline:
						{
							context.check(!isInQuote, loc, 'Quote interpolation cannot contain newline');

							// Skip any blank lines.
							skipNewlines();
							const oldIndent = indent;
							indent = skipWhileEquals(Tab);
							context.check(peek() !== Space, pos, 'Line begins in a space');
							if (indent <= oldIndent) {
								const l = loc();
								for (let i = indent; i < oldIndent; i = i + 1) {
									closeLine(l.start);
									closeGroups(l.end, _Token.G_Block);
								}
								closeLine(l.start);
								openLine(l.end);
							} else {
								context.check(indent === oldIndent + 1, loc, 'Line is indented more than once');
								// Block at end of line goes in its own spaced group.
								// However, `~` preceding a block goes in a group with it.
								if ((0, _util.isEmpty)(curGroup.subTokens) || !(0, _Token.isKeyword)(_Token.KW_Lazy, (0, _util.last)(curGroup.subTokens))) space(loc());
								openGroup(loc().start, _Token.G_Block);
								openLine(loc().end);
							}
							break;
						}
					case Tab:
						// We always eat tabs in the Newline handler,
						// so this will only happen in the middle of a line.
						context.fail(loc(), 'Tab may only be used to indent');

					// FUN

					case Bang:
						if (tryEat(Bar)) funKeyword(_Token.KW_FunDo);else handleName();
						break;
					case Tilde:
						if (tryEat(Bang)) {
							mustEat(Bar, '~!');
							funKeyword(_Token.KW_FunGenDo);
						} else if (tryEat(Bar)) funKeyword(_Token.KW_FunGen);else keyword(_Token.KW_Lazy);
						break;
					case Bar:
						keyword(_Token.KW_Fun);
						// First arg in its own spaced group
						space(loc());
						break;

					// NUMBER

					case Hyphen:
						if (isDigit(peek()))
							// eatNumber() looks at prev character, so hyphen included.
							eatAndAddNumber();else handleName();
						break;
					case N0:case N1:case N2:case N3:case N4:
					case N5:case N6:case N7:case N8:case N9:
						eatAndAddNumber();
						break;

					// OTHER

					case Hash:
						if (tryEat(Hash)) {
							// Multi-line comment
							mustEat(Hash, '##');
							while (true) if (eat() === Hash && eat() === Hash && eat() === Hash) {
								const nl = tryEat(Newline);
								context.check(nl, loc, () => `#Closing {code('###')} must be followed by newline.`);
								break;
							}
						} else {
							// Single-line comment
							if (!(tryEat(Space) || tryEat(Tab))) context.fail(loc, () => `${ (0, _CompileError.code)('#') } must be followed by space or tab.`);
							skipRestOfLine();
						}
						break;

					case Dot:
						{
							const next = peek();
							if (next === Space || next === Newline) {
								// ObjLit assign in its own spaced group.
								// We can't just create a new Group here because we want to
								// ensure it's not part of the preceding or following spaced group.
								closeGroups(startPos(), _Token.G_Space);
								keyword(_Token.KW_ObjAssign);
								// This exists solely so that the Space or Newline handler can close it...
								openGroup(pos(), _Token.G_Space);
							} else if (next === Bar) {
								skip();
								keyword(_Token.KW_FunThis);
								space(loc());
							} else if (next === Bang && peekNext() === Bar) {
								skip();
								skip();
								keyword(_Token.KW_FunThisDo);
								space(loc());
							} else if (next === Tilde) {
								skip();
								if (tryEat(Bang)) {
									mustEat(Bar, '.~!');
									keyword(_Token.KW_FunThisGenDo);
								} else {
									mustEat(Bar, '.~');
									keyword(_Token.KW_FunThisGen);
								}
								space(loc());
							} else {
								// +1 for the dot we just ate.
								const nDots = skipWhileEquals(Dot) + 1;
								const next = peek();
								if (nDots === 3 && next === Space || next === Newline) keyword(_Token.KW_Ellipsis);else addToCurrentGroup((0, _Token.DotName)(loc(), nDots, takeWhile(isNameCharacter)));
							}
							break;
						}

					case Colon:
						if (tryEat(Colon)) {
							mustEat(Equal, '::');
							keyword(_Token.KW_AssignMutable);
						} else if (tryEat(Equal)) keyword(_Token.KW_LocalMutate);else keyword(_Token.KW_Type);
						break;

					case Underscore:
						keyword(_Token.KW_Focus);
						break;

					case Ampersand:case Backslash:case Backtick:case Caret:
					case Comma:case Percent:case Semicolon:
						context.fail(loc, `Reserved character ${ showChar(characterEaten) }`);
					default:
						handleName();
				}
			}
		};

		const lexQuote = indent => {
			const quoteIndent = indent + 1;

			// Indented quote is characterized by being immediately followed by a newline.
			// The next line *must* have some content at the next indentation.
			const isIndented = tryEatNewline();
			if (isIndented) {
				const actualIndent = skipWhileEquals(Tab);
				context.check(actualIndent === quoteIndent, pos, 'Indented quote must have exactly one more indent than previous line.');
			}

			// Current string literal part of quote we are reading.
			let read = '';

			const maybeOutputRead = () => {
				if (read !== '') {
					addToCurrentGroup(read);
					read = '';
				}
			};

			const locSingle = () => (0, _esastDistLoc.singleCharLoc)(pos());

			openGroup(locSingle().start, _Token.G_Quote);

			eatChars: while (true) {
				const char = eat();
				switch (char) {
					case Backslash:
						{
							read = read + quoteEscape(eat());
							break;
						}
					case OpenBrace:
						{
							maybeOutputRead();
							const l = locSingle();
							openParenthesis(l);
							lexPlain(true);
							closeGroups(l.end, _Token.G_Parenthesis);
							break;
						}
					case Newline:
						{
							const originalPos = pos();
							// Go back to before we ate it.
							originalPos.column = originalPos.column - 1;

							context.check(isIndented, locSingle, 'Unclosed quote.');
							// Allow extra blank lines.
							const numNewlines = skipNewlines();
							const newIndent = skipWhileEquals(Tab);
							if (newIndent < quoteIndent) {
								// Indented quote section is over.
								// Undo reading the tabs and newline.
								stepBackMany(originalPos, numNewlines + newIndent);
								(0, _util.assert)(peek() === Newline);
								break eatChars;
							} else read = read + '\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent);
							break;
						}
					case Quote:
						if (!isIndented) break eatChars;
					// Else fallthrough
					default:
						// I've tried pushing character codes to an array and stringifying them later,
						// but this turned out to be better.
						read = read + String.fromCharCode(char);
				}
			}

			maybeOutputRead();
			closeGroups(pos(), _Token.G_Quote);
		};

		const quoteEscape = ch => {
			switch (ch) {
				case OpenBrace:
					return '{';
				case LetterN:
					return '\n';
				case LetterT:
					return '\t';
				case Quote:
					return '"';
				case Backslash:
					return '\\';
				default:
					context.fail(pos, `No need to escape ${ showChar(ch) }`);
			}
		};

		curGroup = (0, _Token.Group)((0, _Loc.default)(_esastDistLoc.StartPos, null), [], _Token.G_Block);
		openLine(_esastDistLoc.StartPos);

		lexPlain(false);

		const endPos = pos();
		closeLine(endPos);
		(0, _util.assert)((0, _util.isEmpty)(groupStack));
		curGroup.loc.end = endPos;
		return curGroup;
	};

	const cc = _ => _.charCodeAt(0);
	const Ampersand = cc('&'),
	      Backslash = cc('\\'),
	      Backtick = cc('`'),
	      Bang = cc('!'),
	      Bar = cc('|'),
	      Caret = cc('^'),
	      CloseBrace = cc('}'),
	      CloseBracket = cc(']'),
	      CloseParenthesis = cc(')'),
	      Colon = cc(':'),
	      Comma = cc(','),
	      Dot = cc('.'),
	      Equal = cc('='),
	      Hash = cc('#'),
	      Hyphen = cc('-'),
	      LetterN = cc('n'),
	      LetterT = cc('t'),
	      N0 = cc('0'),
	      N1 = cc('1'),
	      N2 = cc('2'),
	      N3 = cc('3'),
	      N4 = cc('4'),
	      N5 = cc('5'),
	      N6 = cc('6'),
	      N7 = cc('7'),
	      N8 = cc('8'),
	      N9 = cc('9'),
	      Newline = cc('\n'),
	      OpenBrace = cc('{'),
	      OpenBracket = cc('['),
	      OpenParenthesis = cc('('),
	      Percent = cc('%'),
	      Quote = cc('"'),
	      Semicolon = cc(';'),
	      Space = cc(' '),
	      Tab = cc('\t'),
	      Tilde = cc('~'),
	      Underscore = cc('_'),
	      Zero = cc('\0');

	const showChar = char => (0, _CompileError.code)(String.fromCharCode(char)),
	      _charPred = (chars, negate) => {
		let src = 'switch(ch) {\n';
		for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;
		src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
		return Function('ch', src);
	},
	      isDigit = _charPred('0123456789'),
	      isNameCharacter = _charPred(_language.NonNameCharacters, true),
	      isNumberCharacter = _charPred('0123456789.e');
});
//# sourceMappingURL=data:application/json;base64,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RSxHQUFHLEVBQUMsS0FBSyxHQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDNUMsS0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsUUFBUSxHQUFFLENBQUMsTUFBTSxFQUFDLGtCQUFrQixHQUFFLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUM5RCxTQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDMUI7T0FDRCxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztPQUNqQyxlQUFlLEdBQUcsU0FBUyxXQXpvQm5CLGlCQUFpQixFQXlvQnNCLElBQUksQ0FBQztPQUNwRCxpQkFBaUIsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9sZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jLCB7IFBvcywgU3RhcnRMaW5lLCBTdGFydFBvcywgU3RhcnRDb2x1bW4sIHNpbmdsZUNoYXJMb2MgfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBOdW1iZXJMaXRlcmFsIH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQgeyBOb25OYW1lQ2hhcmFjdGVycyB9IGZyb20gJy4vbGFuZ3VhZ2UnXG5pbXBvcnQgeyBEb3ROYW1lLCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX0xpbmUsIEdfUGFyZW50aGVzaXMsIEdfU3BhY2UsIEdfUXVvdGUsXG5cdGlzS2V5d29yZCwgS2V5d29yZCwgS1dfQXNzaWduTXV0YWJsZSwgS1dfRWxsaXBzaXMsIEtXX0ZvY3VzLCBLV19GdW4sIEtXX0Z1bkRvLCBLV19GdW5HZW4sXG5cdEtXX0Z1bkdlbkRvLCBLV19GdW5UaGlzLCBLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5EbywgS1dfTGF6eSwgS1dfTG9jYWxNdXRhdGUsXG5cdEtXX09iakFzc2lnbiwgS1dfUmVnaW9uLCBLV19UeXBlLCBOYW1lLCBvcEtleXdvcmRLaW5kRnJvbU5hbWUsIHNob3dHcm91cEtpbmQgfSBmcm9tICcuL1Rva2VuJ1xuaW1wb3J0IHsgYXNzZXJ0LCBpc0VtcHR5LCBsYXN0IH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVGhpcyBwcm9kdWNlcyB0aGUgVG9rZW4gdHJlZSAoc2VlIFRva2VuLmpzKS5cbiovXG5leHBvcnQgZGVmYXVsdCAoY29udGV4dCwgc291cmNlU3RyaW5nKSA9PiB7XG5cdC8vIExleGluZyBhbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHQvLyBVc2UgYSBudWxsLXRlcm1pbmF0ZWQgc3RyaW5nIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdHNvdXJjZVN0cmluZyA9IHNvdXJjZVN0cmluZyArICdcXG5cXDAnXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gR1JPVVBJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG5cdC8vIHdoZW4gd2UgY2xvc2UgdGhhdCBHcm91cCB3ZSBhZGQgaXQgdG8gdGhlIGVuY2xvc2luZyBHcm91cCBhbmQgY29udGludWUgd2l0aCB0aGF0IG9uZS5cblx0Ly8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXHRjb25zdCBncm91cFN0YWNrID0gWyBdXG5cdGxldCBjdXJHcm91cFxuXHRjb25zdFxuXHRcdGFkZFRvQ3VycmVudEdyb3VwID0gdG9rZW4gPT5cblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKSxcblxuXHRcdC8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cblx0XHQvLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuXHRcdG9wZW5Hcm91cCA9IChvcGVuUG9zLCBncm91cEtpbmQpID0+IHtcblx0XHRcdGdyb3VwU3RhY2sucHVzaChjdXJHcm91cClcblx0XHRcdC8vIENvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gYnkgYG9gLlxuXHRcdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0Y3VyR3JvdXAgPSBHcm91cChMb2Mob3BlblBvcywgbnVsbCksIFsgXSwgZ3JvdXBLaW5kKVxuXHRcdH0sXG5cblx0XHQvLyBBIGdyb3VwIGVuZGluZyBtYXkgY2xvc2UgbXV0bGlwbGUgZ3JvdXBzLlxuXHRcdC8vIEZvciBleGFtcGxlLCBpbiBgbG9nISAoKyAxIDFgLCB0aGUgR19MaW5lIHdpbGwgYWxzbyBjbG9zZSBhIEdfUGFyZW50aGVzaXMuXG5cdFx0Y2xvc2VHcm91cHMgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Ly8gY3VyR3JvdXAgaXMgZGlmZmVyZW50IGVhY2ggdGltZSB3ZSBnbyB0aHJvdWdoIHRoZSBsb29wXG5cdFx0XHQvLyBiZWNhdXNlIF9jbG9zZVNpbmdsZUdyb3VwIGJyaW5ncyB1cyB0byBhbiBlbmNsb3NpbmcgZ3JvdXAuXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCAhPT0gY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNvbnN0IGN1cktpbmQgPSBjdXJHcm91cC5raW5kXG5cdFx0XHRcdC8vIEEgbGluZSBjYW4gY2xvc2UgYSBwYXJlbnRoZXNpcywgYnV0IGEgcGFyZW50aGVzaXMgY2FuJ3QgY2xvc2UgYSBsaW5lIVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKFxuXHRcdFx0XHRcdGN1cktpbmQgPT09IEdfUGFyZW50aGVzaXMgfHwgY3VyS2luZCA9PT0gR19CcmFja2V0IHx8IGN1cktpbmQgPT09IEdfU3BhY2UsXG5cdFx0XHRcdFx0Y2xvc2VQb3MsICgpID0+XG5cdFx0XHRcdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoY2xvc2VLaW5kKX0sIGAgK1xuXHRcdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgd2FzICR7c2hvd0dyb3VwS2luZChjdXJLaW5kKX1gKVxuXHRcdFx0XHRfY2xvc2VTaW5nbGVHcm91cChjbG9zZVBvcywgY3VyR3JvdXAua2luZClcblx0XHRcdH1cblx0XHRcdF9jbG9zZVNpbmdsZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdF9jbG9zZVNpbmdsZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0XHRcdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgR19MaW5lOlxuXHRcdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdFx0XHRpZiAoIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlbkJyYWNrZXQgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR19CcmFja2V0KVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfTGluZSlcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBlbmNvdW50ZXJpbmcgYSBzcGFjZSwgaXQgYm90aCBjbG9zZXMgYW5kIG9wZW5zIGEgc3BhY2VkIGdyb3VwLlxuXHRcdHNwYWNlID0gbG9jID0+IHtcblx0XHRcdGNsb3NlR3JvdXBzKGxvYy5zdGFydCwgR19TcGFjZSlcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IFBvcyhsaW5lLCBjb2x1bW4pLFxuXG5cdFx0cGVlayA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSxcblx0XHRwZWVrTmV4dCA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSksXG5cblx0XHQvLyBNYXkgZWF0IGEgTmV3bGluZS5cblx0XHQvLyBJZiB0aGF0IGhhcHBlbnMsIGxpbmUgYW5kIGNvbHVtbiB3aWxsIHRlbXBvcmFyaWx5IGJlIHdyb25nLFxuXHRcdC8vIGJ1dCB3ZSBoYW5kbGUgaXQgaW4gdGhhdCBzcGVjaWFsIGNhc2UgKHJhdGhlciB0aGFuIGNoZWNraW5nIGZvciBOZXdsaW5lIGV2ZXJ5IHRpbWUpLlxuXHRcdGVhdCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoYXIgPSBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcblx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyAxXG5cdFx0XHRyZXR1cm4gY2hhclxuXHRcdH0sXG5cdFx0c2tpcCA9IGVhdCxcblxuXHRcdC8vIGNoYXJUb0VhdCBtdXN0IG5vdCBiZSBOZXdsaW5lLlxuXHRcdHRyeUVhdCA9IGNoYXJUb0VhdCA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IGNoYXJUb0VhdFxuXHRcdFx0aWYgKGNhbkVhdCkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyAxXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdG11c3RFYXQgPSAoY2hhclRvRWF0LCBwcmVjZWRlZEJ5KSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSB0cnlFYXQoY2hhclRvRWF0KVxuXHRcdFx0Y29udGV4dC5jaGVjayhjYW5FYXQsIHBvcywgKCkgPT5cblx0XHRcdFx0YCR7Y29kZShwcmVjZWRlZEJ5KX0gbXVzdCBiZSBmb2xsb3dlZCBieSAke3Nob3dDaGFyKGNoYXJUb0VhdCl9YClcblx0XHR9LFxuXG5cdFx0dHJ5RWF0TmV3bGluZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gTmV3bGluZVxuXHRcdFx0aWYgKGNhbkVhdCkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjYW5FYXRcblx0XHR9LFxuXG5cdFx0Ly8gQ2FsbGVyIG11c3QgZW5zdXJlIHRoYXQgYmFja2luZyB1cCBuQ2hhcnNUb0JhY2tVcCBjaGFyYWN0ZXJzIGJyaW5ncyB1cyB0byBvbGRQb3MuXG5cdFx0c3RlcEJhY2tNYW55ID0gKG9sZFBvcywgbkNoYXJzVG9CYWNrVXApID0+IHtcblx0XHRcdGluZGV4ID0gaW5kZXggLSBuQ2hhcnNUb0JhY2tVcFxuXHRcdFx0bGluZSA9IG9sZFBvcy5saW5lXG5cdFx0XHRjb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdFx0fSxcblxuXHRcdC8vIEZvciB0YWtlV2hpbGUsIHRha2VXaGlsZVdpdGhQcmV2LCBhbmQgc2tpcFdoaWxlRXF1YWxzLFxuXHRcdC8vIGNoYXJhY3RlclByZWRpY2F0ZSBtdXN0ICpub3QqIGFjY2VwdCBOZXdsaW5lLlxuXHRcdC8vIE90aGVyd2lzZSB0aGVyZSBtYXkgYmUgYW4gaW5maW5pdGUgbG9vcCFcblx0XHR0YWtlV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHRfc2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleFxuXHRcdFx0X3NraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdFx0XHRyZXR1cm4gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXggLSAxLCBpbmRleClcblx0XHR9LFxuXG5cdFx0c2tpcFdoaWxlRXF1YWxzID0gY2hhciA9PlxuXHRcdFx0X3NraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0X3NraXBXaGlsZShfID0+IF8gIT09IE5ld2xpbmUpLFxuXG5cdFx0X3NraXBXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0XHRcdHdoaWxlIChjaGFyYWN0ZXJQcmVkaWNhdGUocGVlaygpKSlcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIGRpZmZcblx0XHRcdHJldHVybiBkaWZmXG5cdFx0fSxcblxuXHRcdC8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG5cdFx0Ly8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuXHRcdHNraXBOZXdsaW5lcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0TGluZSA9IGxpbmVcblx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0d2hpbGUgKHBlZWsoKSA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdH1cblx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxuXHRcdH1cblxuXHQvLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuXHQvKlxuXHRjb25zdFxuXHRcdGNoZWNrUG9zID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0XHRcdGlmIChwLmxpbmUgIT09IGxpbmUgfHwgcC5jb2x1bW4gIT09IGNvbHVtbilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxuXHRcdH0sXG5cdFx0X2luZGV4VG9Qb3MgPSBuZXcgTWFwKCksXG5cdFx0X2dldENvcnJlY3RQb3MgPSAoKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXggPT09IDApXG5cdFx0XHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRcdFx0bGV0IG9sZFBvcywgb2xkSW5kZXhcblx0XHRcdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRcdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdFx0XHRpZiAob2xkUG9zICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdFx0XHR9XG5cdFx0XHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdFx0XHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0XHRcdGlmIChzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChvbGRJbmRleCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0XHRcdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRcdFx0X2luZGV4VG9Qb3Muc2V0KGluZGV4LCBwKVxuXHRcdFx0cmV0dXJuIHBcblx0XHR9XG5cdCovXG5cblx0Lypcblx0SW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuXHRXaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cblx0Ki9cblx0Y29uc3QgbGV4UGxhaW4gPSBpc0luUXVvdGUgPT4ge1xuXHRcdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdFx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdFx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0XHRsZXQgaW5kZW50ID0gMFxuXG5cdFx0Ly8gTWFrZSBjbG9zdXJlcyBub3cgcmF0aGVyIHRoYW4gaW5zaWRlIHRoZSBsb29wLlxuXHRcdC8vIFRoaXMgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgYXMgb2Ygbm9kZSB2MC4xMS4xNC5cblxuXHRcdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdFx0bGV0IHN0YXJ0Q29sdW1uXG5cdFx0Y29uc3Rcblx0XHRcdHN0YXJ0UG9zID0gKCkgPT4gUG9zKGxpbmUsIHN0YXJ0Q29sdW1uKSxcblx0XHRcdGxvYyA9ICgpID0+IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChLZXl3b3JkKGxvYygpLCBraW5kKSksXG5cdFx0XHRmdW5LZXl3b3JkID0ga2luZCA9PiB7XG5cdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHR9LFxuXHRcdFx0ZWF0QW5kQWRkTnVtYmVyID0gKCkgPT4ge1xuXHRcdFx0XHQvLyBUT0RPOiBBIHJlYWwgbnVtYmVyIGxpdGVyYWwgbGV4ZXIsIG5vdCBqdXN0IEphdmFTY3JpcHQncy4uLlxuXHRcdFx0XHRjb25zdCBudW1iZXJTdHJpbmcgPSB0YWtlV2hpbGVXaXRoUHJldihpc051bWJlckNoYXJhY3Rlcilcblx0XHRcdFx0Ly8gRG9uJ3QgaW5jbHVkZSBgLmAgYXQgZW5kLlxuXHRcdFx0XHRpZiAobGFzdChudW1iZXJTdHJpbmcpID09PSAnLicpIHtcblx0XHRcdFx0XHRpbmRleCA9IGluZGV4IC0gMVxuXHRcdFx0XHRcdGNvbHVtbiA9IGNvbHVtbiAtIDFcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBudW1iZXIgPSBOdW1iZXIobnVtYmVyU3RyaW5nKVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKCFOdW1iZXIuaXNOYU4obnVtYmVyKSwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdGBJbnZhbGlkIG51bWJlciBsaXRlcmFsICR7Y29kZShudW1iZXJTdHJpbmcpfWApXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKE51bWJlckxpdGVyYWwobG9jKCksIG51bWJlcikpXG5cdFx0XHR9XG5cblx0XHRjb25zdCBoYW5kbGVOYW1lID0gKCkgPT4ge1xuXHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRpZiAoa2V5d29yZEtpbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGtleXdvcmRLaW5kICE9PSAtMSwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdGBSZXNlcnZlZCBuYW1lICR7Y29kZShuYW1lKX1gKVxuXHRcdFx0XHRpZiAoa2V5d29yZEtpbmQgPT09IEtXX1JlZ2lvbilcblx0XHRcdFx0XHQvLyBUT0RPOiBFYXQgYW5kIHB1dCBpdCBpbiBSZWdpb24gZXhwcmVzc2lvblxuXHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0a2V5d29yZChrZXl3b3JkS2luZClcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChOYW1lKGxvYygpLCBuYW1lKSlcblx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgWmVybzpcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNlOlxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0XHRjYXNlIE9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRvcGVuQnJhY2tldChsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgU3BhY2U6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0Y29udGV4dC53YXJuSWYobmV4dCA9PT0gU3BhY2UsIGxvYywgJ011bHRpcGxlIHNwYWNlcyBpbiBhIHJvdy4nKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKG5leHQgPT09IE5ld2xpbmUsIGxvYywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdGlmIChpbmRlbnQgPD0gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdFx0Y2xvc2VHcm91cHMobC5lbmQsIEdfQmxvY2spXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtXX0xhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpXG5cdFx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGxvYygpLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobG9jKCkuZW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgVGFiOlxuXHRcdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0XHRjb250ZXh0LmZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHRcdC8vIEZVTlxuXG5cdFx0XHRcdGNhc2UgQmFuZzpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkRvKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgVGlsZGU6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICd+IScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbkRvKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbilcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0xhenkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBCYXI6XG5cdFx0XHRcdFx0a2V5d29yZChLV19GdW4pXG5cdFx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0TnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgSGFzaDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEhhc2gpKSB7XG5cdFx0XHRcdFx0XHQvLyBNdWx0aS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdG11c3RFYXQoSGFzaCwgJyMjJylcblx0XHRcdFx0XHRcdHdoaWxlICh0cnVlKVxuXHRcdFx0XHRcdFx0XHRpZiAoZWF0KCkgPT09IEhhc2ggJiYgZWF0KCkgPT09IEhhc2ggJiYgZWF0KCkgPT09IEhhc2gpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBubCA9IHRyeUVhdChOZXdsaW5lKVxuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHQuY2hlY2sobmwsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGAjQ2xvc2luZyB7Y29kZSgnIyMjJyl9IG11c3QgYmUgZm9sbG93ZWQgYnkgbmV3bGluZS5gKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gU2luZ2xlLWxpbmUgY29tbWVudFxuXHRcdFx0XHRcdFx0aWYgKCEodHJ5RWF0KFNwYWNlKSB8fCB0cnlFYXQoVGFiKSkpXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0YCR7Y29kZSgnIycpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5IHNwYWNlIG9yIHRhYi5gKVxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzKHN0YXJ0UG9zKCksIEdfU3BhY2UpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX09iakFzc2lnbilcblx0XHRcdFx0XHRcdC8vIFRoaXMgZXhpc3RzIHNvbGVseSBzbyB0aGF0IHRoZSBTcGFjZSBvciBOZXdsaW5lIGhhbmRsZXIgY2FuIGNsb3NlIGl0Li4uXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdfU3BhY2UpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzKVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBCYW5nICYmIHBlZWtOZXh0KCkgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0RvKVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBUaWxkZSkge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhbmcpKSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4hJylcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzR2VuRG8pXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+Jylcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzR2VuKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vICsxIGZvciB0aGUgZG90IHdlIGp1c3QgYXRlLlxuXHRcdFx0XHRcdFx0Y29uc3QgbkRvdHMgPSBza2lwV2hpbGVFcXVhbHMoRG90KSArIDFcblx0XHRcdFx0XHRcdGNvbnN0IG5leHQgPSBwZWVrKClcblx0XHRcdFx0XHRcdGlmIChuRG90cyA9PT0gMyAmJiBuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0VsbGlwc2lzKVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChEb3ROYW1lKGxvYygpLCBuRG90cywgdGFrZVdoaWxlKGlzTmFtZUNoYXJhY3RlcikpKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FzZSBDb2xvbjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENvbG9uKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChFcXVhbCwgJzo6Jylcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChFcXVhbCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0xvY2FsTXV0YXRlKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfVHlwZSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgVW5kZXJzY29yZTpcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBBbXBlcnNhbmQ6IGNhc2UgQmFja3NsYXNoOiBjYXNlIEJhY2t0aWNrOiBjYXNlIENhcmV0OlxuXHRcdFx0XHRjYXNlIENvbW1hOiBjYXNlIFBlcmNlbnQ6IGNhc2UgU2VtaWNvbG9uOlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsZXhRdW90ZSA9IGluZGVudCA9PiB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0bGV0IHJlYWQgPSAnJ1xuXG5cdFx0Y29uc3QgbWF5YmVPdXRwdXRSZWFkID0gKCkgPT4ge1xuXHRcdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHJlYWQpXG5cdFx0XHRcdHJlYWQgPSAnJ1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGxvY1NpbmdsZSA9ICgpID0+IHNpbmdsZUNoYXJMb2MocG9zKCkpXG5cblx0XHRvcGVuR3JvdXAobG9jU2luZ2xlKCkuc3RhcnQsIEdfUXVvdGUpXG5cblx0XHRlYXRDaGFyczogd2hpbGUgKHRydWUpIHtcblx0XHRcdGNvbnN0IGNoYXIgPSBlYXQoKVxuXHRcdFx0c3dpdGNoIChjaGFyKSB7XG5cdFx0XHRcdGNhc2UgQmFja3NsYXNoOiB7XG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBxdW90ZUVzY2FwZShlYXQoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNlOiB7XG5cdFx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXBzKGwuZW5kLCBHX1BhcmVudGhlc2lzKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBOZXdsaW5lOiB7XG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxQb3MgPSBwb3MoKVxuXHRcdFx0XHRcdC8vIEdvIGJhY2sgdG8gYmVmb3JlIHdlIGF0ZSBpdC5cblx0XHRcdFx0XHRvcmlnaW5hbFBvcy5jb2x1bW4gPSBvcmlnaW5hbFBvcy5jb2x1bW4gLSAxXG5cblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzSW5kZW50ZWQsIGxvY1NpbmdsZSwgJ1VuY2xvc2VkIHF1b3RlLicpXG5cdFx0XHRcdFx0Ly8gQWxsb3cgZXh0cmEgYmxhbmsgbGluZXMuXG5cdFx0XHRcdFx0Y29uc3QgbnVtTmV3bGluZXMgPSBza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRcdGNvbnN0IG5ld0luZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRcdFx0aWYgKG5ld0luZGVudCA8IHF1b3RlSW5kZW50KSB7XG5cdFx0XHRcdFx0XHQvLyBJbmRlbnRlZCBxdW90ZSBzZWN0aW9uIGlzIG92ZXIuXG5cdFx0XHRcdFx0XHQvLyBVbmRvIHJlYWRpbmcgdGhlIHRhYnMgYW5kIG5ld2xpbmUuXG5cdFx0XHRcdFx0XHRzdGVwQmFja01hbnkob3JpZ2luYWxQb3MsIG51bU5ld2xpbmVzICsgbmV3SW5kZW50KVxuXHRcdFx0XHRcdFx0YXNzZXJ0KHBlZWsoKSA9PT0gTmV3bGluZSlcblx0XHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRyZWFkID0gcmVhZCArXG5cdFx0XHRcdFx0XHRcdCdcXG4nLnJlcGVhdChudW1OZXdsaW5lcykgKyAnXFx0Jy5yZXBlYXQobmV3SW5kZW50IC0gcXVvdGVJbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFF1b3RlOlxuXHRcdFx0XHRcdGlmICghaXNJbmRlbnRlZClcblx0XHRcdFx0XHRcdGJyZWFrIGVhdENoYXJzXG5cdFx0XHRcdFx0Ly8gRWxzZSBmYWxsdGhyb3VnaFxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIEkndmUgdHJpZWQgcHVzaGluZyBjaGFyYWN0ZXIgY29kZXMgdG8gYW4gYXJyYXkgYW5kIHN0cmluZ2lmeWluZyB0aGVtIGxhdGVyLFxuXHRcdFx0XHRcdC8vIGJ1dCB0aGlzIHR1cm5lZCBvdXQgdG8gYmUgYmV0dGVyLlxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1heWJlT3V0cHV0UmVhZCgpXG5cdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfUXVvdGUpXG5cdH1cblxuXHRjb25zdCBxdW90ZUVzY2FwZSA9IGNoID0+IHtcblx0XHRzd2l0Y2ggKGNoKSB7XG5cdFx0XHRjYXNlIE9wZW5CcmFjZTogcmV0dXJuICd7J1xuXHRcdFx0Y2FzZSBMZXR0ZXJOOiByZXR1cm4gJ1xcbidcblx0XHRcdGNhc2UgTGV0dGVyVDogcmV0dXJuICdcXHQnXG5cdFx0XHRjYXNlIFF1b3RlOiByZXR1cm4gJ1wiJ1xuXHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHJldHVybiAnXFxcXCdcblx0XHRcdGRlZmF1bHQ6IGNvbnRleHQuZmFpbChwb3MsIGBObyBuZWVkIHRvIGVzY2FwZSAke3Nob3dDaGFyKGNoKX1gKVxuXHRcdH1cblx0fVxuXG5cdGN1ckdyb3VwID0gR3JvdXAoTG9jKFN0YXJ0UG9zLCBudWxsKSwgWyBdLCBHX0Jsb2NrKVxuXHRvcGVuTGluZShTdGFydFBvcylcblxuXHRsZXhQbGFpbihmYWxzZSlcblxuXHRjb25zdCBlbmRQb3MgPSBwb3MoKVxuXHRjbG9zZUxpbmUoZW5kUG9zKVxuXHRhc3NlcnQoaXNFbXB0eShncm91cFN0YWNrKSlcblx0Y3VyR3JvdXAubG9jLmVuZCA9IGVuZFBvc1xuXHRyZXR1cm4gY3VyR3JvdXBcbn1cblxuY29uc3QgY2MgPSBfID0+IF8uY2hhckNvZGVBdCgwKVxuY29uc3Rcblx0QW1wZXJzYW5kID0gY2MoJyYnKSxcblx0QmFja3NsYXNoID0gY2MoJ1xcXFwnKSxcblx0QmFja3RpY2sgPSBjYygnYCcpLFxuXHRCYW5nID0gY2MoJyEnKSxcblx0QmFyID0gY2MoJ3wnKSxcblx0Q2FyZXQgPSBjYygnXicpLFxuXHRDbG9zZUJyYWNlID0gY2MoJ30nKSxcblx0Q2xvc2VCcmFja2V0ID0gY2MoJ10nKSxcblx0Q2xvc2VQYXJlbnRoZXNpcyA9IGNjKCcpJyksXG5cdENvbG9uID0gY2MoJzonKSxcblx0Q29tbWEgPSBjYygnLCcpLFxuXHREb3QgPSBjYygnLicpLFxuXHRFcXVhbCA9IGNjKCc9JyksXG5cdEhhc2ggPSBjYygnIycpLFxuXHRIeXBoZW4gPSBjYygnLScpLFxuXHRMZXR0ZXJOID0gY2MoJ24nKSxcblx0TGV0dGVyVCA9IGNjKCd0JyksXG5cdE4wID0gY2MoJzAnKSxcblx0TjEgPSBjYygnMScpLFxuXHROMiA9IGNjKCcyJyksXG5cdE4zID0gY2MoJzMnKSxcblx0TjQgPSBjYygnNCcpLFxuXHRONSA9IGNjKCc1JyksXG5cdE42ID0gY2MoJzYnKSxcblx0TjcgPSBjYygnNycpLFxuXHROOCA9IGNjKCc4JyksXG5cdE45ID0gY2MoJzknKSxcblx0TmV3bGluZSA9IGNjKCdcXG4nKSxcblx0T3BlbkJyYWNlID0gY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQgPSBjYygnWycpLFxuXHRPcGVuUGFyZW50aGVzaXMgPSBjYygnKCcpLFxuXHRQZXJjZW50ID0gY2MoJyUnKSxcblx0UXVvdGUgPSBjYygnXCInKSxcblx0U2VtaWNvbG9uID0gY2MoJzsnKSxcblx0U3BhY2UgPSBjYygnICcpLFxuXHRUYWIgPSBjYygnXFx0JyksXG5cdFRpbGRlID0gY2MoJ34nKSxcblx0VW5kZXJzY29yZSA9IGNjKCdfJyksXG5cdFplcm8gPSBjYygnXFwwJylcblxuY29uc3Rcblx0c2hvd0NoYXIgPSBjaGFyID0+IGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSksXG5cdF9jaGFyUHJlZCA9IChjaGFycywgbmVnYXRlKSA9PiB7XG5cdFx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRcdHNyYyA9IGAke3NyY31jYXNlICR7Y2hhcnMuY2hhckNvZGVBdChpKX06IGBcblx0XHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdFx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcblx0fSxcblx0aXNEaWdpdCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc05hbWVDaGFyYWN0ZXIgPSBfY2hhclByZWQoTm9uTmFtZUNoYXJhY3RlcnMsIHRydWUpLFxuXHRpc051bWJlckNoYXJhY3RlciA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OS5lJylcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9