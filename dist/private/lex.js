if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../CompileError', './MsAst', './language', './Token', './util'], function (exports, module, _esastDistLoc, _CompileError, _MsAst, _language, _Token, _util) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	/*
 This produces the Token tree (see Token.js).
 */

	module.exports = (context, sourceString) => {
		/*
  Lexing algorithm requires trailing newline to close any blocks.
  Use a 0-terminated string because it's faster than checking whether index === length.
  (When string reaches end `charCodeAt` will return `NaN`, which can't be switched on.)
  */
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
			// Contents will be added to by `addToCurrentGroup`.
			// curGroup.loc.end will be written to when closing it.
			curGroup = new _Token.Group(new _Loc.default(openPos, null), [], groupKind);
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
		const pos = () => new _esastDistLoc.Pos(line, column),
		      peek = () => sourceString.charCodeAt(index),
		      peekNext = () => sourceString.charCodeAt(index + 1),
		      peekPrev = () => sourceString.charCodeAt(index - 1),
		     

		// May eat a Newline.
		// Caller *must* check for that case and increment line!
		eat = () => {
			const char = sourceString.charCodeAt(index);
			index = index + 1;
			column = column + 1;
			return char;
		},
		      skip = eat,
		      eatSafe = () => {
			const ch = eat();
			if (ch === Newline) {
				line = line + 1;
				column = _esastDistLoc.StartColumn;
			}
			return ch;
		},
		     

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
		takeWhile = characterPredicate => _takeWhileWithStart(index, characterPredicate),
		      takeWhileWithPrev = characterPredicate => _takeWhileWithStart(index - 1, characterPredicate),
		      _takeWhileWithStart = (startIndex, characterPredicate) => {
			skipWhile(characterPredicate);
			return sourceString.slice(startIndex, index);
		},
		      skipWhileEquals = char => skipWhile(_ => _ === char),
		      skipRestOfLine = () => skipWhile(_ => _ !== Newline),
		      skipWhile = characterPredicate => {
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
			const startPos = () => new _esastDistLoc.Pos(line, startColumn),
			      loc = () => new _Loc.default(startPos(), pos()),
			      keyword = kind => addToCurrentGroup(new _Token.Keyword(loc(), kind)),
			      funKeyword = kind => {
				keyword(kind);
				space(loc());
			},
			      eatAndAddNumber = () => {
				const startIndex = index - 1;

				tryEat(Hyphen);
				if (peekPrev() === N0) {
					const p = peek();
					switch (p) {
						case LetterB:case LetterO:case LetterX:
							skip();
							const isDigitSpecial = p === LetterB ? isDigitBinary : p === LetterO ? isDigitOctal : isDigitHex;
							skipWhile(isDigitSpecial);
							break;
						case Dot:
							if (isDigit(peekNext())) {
								skip();
								skipWhile(isDigit);
							}
							break;
						default:
					}
				} else {
					skipWhile(isDigit);
					if (tryEat(Dot)) skipWhile(isDigit);
				}

				const str = sourceString.slice(startIndex, index);
				addToCurrentGroup(new _MsAst.NumberLiteral(loc(), str));
			};

			const handleName = () => {
				// All other characters should be handled in a case above.
				const name = takeWhileWithPrev(isNameCharacter);
				if (name.endsWith('_')) {
					if (name.length > 1) _handleName(name.slice(0, name.length - 1));
					keyword(_Token.KW_Focus);
				} else _handleName(name);
			},
			      _handleName = name => {
				const keywordKind = (0, _Token.opKeywordKindFromName)(name);
				if (keywordKind !== undefined) {
					context.check(keywordKind !== -1, pos, () => `Reserved name ${ (0, _CompileError.code)(name) }`);
					if (keywordKind === _Token.KW_Region)
						// TODO: Eat and put it in Region expression
						skipRestOfLine();
					keyword(keywordKind);
				} else addToCurrentGroup(new _Token.Name(loc(), name));
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
							// eatAndAddNumber() looks at prev character, so hyphen included.
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
							const eatHash = () => eatSafe() === Hash;
							while (true) if (eatHash() && eatHash() && eatHash()) {
								context.check(peek() === Newline, loc, () => `#Closing {code('###')} must be followed by newline.`);
								break;
							}
						} else
							// Single-line comment
							skipRestOfLine();
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
								if (nDots === 3 && next === Space || next === Newline) keyword(_Token.KW_Ellipsis);else {
									let name = takeWhile(isNameCharacter);
									const add = () => addToCurrentGroup(new _Token.DotName(loc(), nDots, name));
									if (name.endsWith('_')) {
										name = name.slice(0, name.length - 1);
										add();
										keyword(_Token.KW_Focus);
									} else add();
								}
							}
							break;
						}

					case Colon:
						if (tryEat(Colon)) {
							mustEat(Equal, '::');
							keyword(_Token.KW_AssignMutable);
						} else if (tryEat(Equal)) keyword(_Token.KW_LocalMutate);else keyword(_Token.KW_Type);
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

		curGroup = new _Token.Group(new _Loc.default(_esastDistLoc.StartPos, null), [], _Token.G_Block);
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
	      LetterB = cc('b'),
	      LetterN = cc('n'),
	      LetterO = cc('o'),
	      LetterT = cc('t'),
	      LetterX = cc('x'),
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
	      Zero = cc('\0');

	const showChar = char => (0, _CompileError.code)(String.fromCharCode(char)),
	      _charPred = (chars, negate) => {
		let src = 'switch(ch) {\n';
		for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;
		src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
		return Function('ch', src);
	},
	      isDigit = _charPred('0123456789'),
	      isDigitBinary = _charPred('01'),
	      isDigitOctal = _charPred('01234567'),
	      isDigitHex = _charPred('0123456789abcdef'),
	      isNameCharacter = _charPred(_language.NonNameCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNhZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRyxDQUFBO0FBQ3RCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQ3hCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7QUFJL0IsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUNuQyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBbkNJLEtBQUssQ0FtQ0MsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUM1RDs7Ozs7QUFJRCxhQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLOzs7QUFHdEMsVUFBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxVQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBOztBQUU3QixXQUFPLENBQUMsS0FBSyxDQUNaLE9BQU8sWUEvQ3lDLGFBQWEsQUErQ3BDLElBQUksT0FBTyxZQS9DUCxTQUFTLEFBK0NZLElBQUksT0FBTyxZQS9DRSxPQUFPLEFBK0NHLEVBQ3pFLFFBQVEsRUFBRSxNQUNWLENBQUMsZ0JBQWdCLEdBQUUsV0E5Q3dDLGFBQWEsRUE4Q3ZDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLG9CQUFvQixHQUFFLFdBL0NvQyxhQUFhLEVBK0NuQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFD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S0FBSyxHQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDNUMsS0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsUUFBUSxHQUFFLENBQUMsTUFBTSxFQUFDLGtCQUFrQixHQUFFLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUM5RCxTQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDMUI7T0FDRCxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztPQUNqQyxhQUFhLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMvQixZQUFZLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztPQUNwQyxVQUFVLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDO09BQzFDLGVBQWUsR0FBRyxTQUFTLFdBcnJCbkIsaUJBQWlCLEVBcXJCc0IsSUFBSSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9sZXguanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCBMb2MsIHsgUG9zLCBTdGFydExpbmUsIFN0YXJ0UG9zLCBTdGFydENvbHVtbiwgc2luZ2xlQ2hhckxvYyB9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7IE51bWJlckxpdGVyYWwgfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHsgTm9uTmFtZUNoYXJhY3RlcnMgfSBmcm9tICcuL2xhbmd1YWdlJ1xuaW1wb3J0IHsgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19MaW5lLCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLFxuXHRpc0tleXdvcmQsIEtleXdvcmQsIEtXX0Fzc2lnbk11dGFibGUsIEtXX0VsbGlwc2lzLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLFxuXHRLV19GdW5HZW5EbywgS1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLFxuXHRLV19PYmpBc3NpZ24sIEtXX1JlZ2lvbiwgS1dfVHlwZSwgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lLCBzaG93R3JvdXBLaW5kIH0gZnJvbSAnLi9Ub2tlbidcbmltcG9ydCB7IGFzc2VydCwgaXNFbXB0eSwgbGFzdCB9IGZyb20gJy4vdXRpbCdcblxuLypcblRoaXMgcHJvZHVjZXMgdGhlIFRva2VuIHRyZWUgKHNlZSBUb2tlbi5qcykuXG4qL1xuZXhwb3J0IGRlZmF1bHQgKGNvbnRleHQsIHNvdXJjZVN0cmluZykgPT4ge1xuXHQvKlxuXHRMZXhpbmcgYWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBiZWNhdXNlIGl0J3MgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoV2hlbiBzdHJpbmcgcmVhY2hlcyBlbmQgYGNoYXJDb2RlQXRgIHdpbGwgcmV0dXJuIGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IHNvdXJjZVN0cmluZyArICdcXG5cXDAnXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gR1JPVVBJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG5cdC8vIHdoZW4gd2UgY2xvc2UgdGhhdCBHcm91cCB3ZSBhZGQgaXQgdG8gdGhlIGVuY2xvc2luZyBHcm91cCBhbmQgY29udGludWUgd2l0aCB0aGF0IG9uZS5cblx0Ly8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXHRjb25zdCBncm91cFN0YWNrID0gWyBdXG5cdGxldCBjdXJHcm91cFxuXHRjb25zdFxuXHRcdGFkZFRvQ3VycmVudEdyb3VwID0gdG9rZW4gPT5cblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKSxcblxuXHRcdC8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cblx0XHQvLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuXHRcdG9wZW5Hcm91cCA9IChvcGVuUG9zLCBncm91cEtpbmQpID0+IHtcblx0XHRcdGdyb3VwU3RhY2sucHVzaChjdXJHcm91cClcblx0XHRcdC8vIENvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gYnkgYGFkZFRvQ3VycmVudEdyb3VwYC5cblx0XHRcdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0XHRcdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2Mob3BlblBvcywgbnVsbCksIFsgXSwgZ3JvdXBLaW5kKVxuXHRcdH0sXG5cblx0XHQvLyBBIGdyb3VwIGVuZGluZyBtYXkgY2xvc2UgbXV0bGlwbGUgZ3JvdXBzLlxuXHRcdC8vIEZvciBleGFtcGxlLCBpbiBgbG9nISAoKyAxIDFgLCB0aGUgR19MaW5lIHdpbGwgYWxzbyBjbG9zZSBhIEdfUGFyZW50aGVzaXMuXG5cdFx0Y2xvc2VHcm91cHMgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Ly8gY3VyR3JvdXAgaXMgZGlmZmVyZW50IGVhY2ggdGltZSB3ZSBnbyB0aHJvdWdoIHRoZSBsb29wXG5cdFx0XHQvLyBiZWNhdXNlIF9jbG9zZVNpbmdsZUdyb3VwIGJyaW5ncyB1cyB0byBhbiBlbmNsb3NpbmcgZ3JvdXAuXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCAhPT0gY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNvbnN0IGN1cktpbmQgPSBjdXJHcm91cC5raW5kXG5cdFx0XHRcdC8vIEEgbGluZSBjYW4gY2xvc2UgYSBwYXJlbnRoZXNpcywgYnV0IGEgcGFyZW50aGVzaXMgY2FuJ3QgY2xvc2UgYSBsaW5lIVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKFxuXHRcdFx0XHRcdGN1cktpbmQgPT09IEdfUGFyZW50aGVzaXMgfHwgY3VyS2luZCA9PT0gR19CcmFja2V0IHx8IGN1cktpbmQgPT09IEdfU3BhY2UsXG5cdFx0XHRcdFx0Y2xvc2VQb3MsICgpID0+XG5cdFx0XHRcdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoY2xvc2VLaW5kKX0sIGAgK1xuXHRcdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgd2FzICR7c2hvd0dyb3VwS2luZChjdXJLaW5kKX1gKVxuXHRcdFx0XHRfY2xvc2VTaW5nbGVHcm91cChjbG9zZVBvcywgY3VyR3JvdXAua2luZClcblx0XHRcdH1cblx0XHRcdF9jbG9zZVNpbmdsZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdF9jbG9zZVNpbmdsZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0XHRcdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgR19MaW5lOlxuXHRcdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdFx0XHRpZiAoIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlbkJyYWNrZXQgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR19CcmFja2V0KVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfTGluZSlcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBlbmNvdW50ZXJpbmcgYSBzcGFjZSwgaXQgYm90aCBjbG9zZXMgYW5kIG9wZW5zIGEgc3BhY2VkIGdyb3VwLlxuXHRcdHNwYWNlID0gbG9jID0+IHtcblx0XHRcdGNsb3NlR3JvdXBzKGxvYy5zdGFydCwgR19TcGFjZSlcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgY29sdW1uKSxcblxuXHRcdHBlZWsgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCksXG5cdFx0cGVla05leHQgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpLFxuXHRcdHBlZWtQcmV2ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0ZWF0U2FmZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoID0gZWF0KClcblx0XHRcdGlmIChjaCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaFxuXHRcdH0sXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNvbnRleHQuY2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpLFxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRza2lwV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb25zdCBkaWZmID0gaW5kZXggLSBzdGFydEluZGV4XG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0XHRyZXR1cm4gZGlmZlxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuXHRcdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0XHRza2lwTmV3bGluZXMgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdHdoaWxlIChwZWVrKCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR9XG5cdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0XHR9XG5cblx0Ly8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cblx0Lypcblx0Y29uc3Rcblx0XHRjaGVja1BvcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0XHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcblx0XHR9LFxuXHRcdF9pbmRleFRvUG9zID0gbmV3IE1hcCgpLFxuXHRcdF9nZXRDb3JyZWN0UG9zID0gKCkgPT4ge1xuXHRcdFx0aWYgKGluZGV4ID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gUG9zKFN0YXJ0TGluZSwgU3RhcnRDb2x1bW4pXG5cblx0XHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0XHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0XHRcdG9sZFBvcyA9IF9pbmRleFRvUG9zLmdldChvbGRJbmRleClcblx0XHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGFzc2VydChvbGRJbmRleCA+PSAwKVxuXHRcdFx0fVxuXHRcdFx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdFx0Zm9yICg7IG9sZEluZGV4IDwgaW5kZXg7IG9sZEluZGV4ID0gb2xkSW5kZXggKyAxKVxuXHRcdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdFx0XHRjb25zdCBwID0gUG9zKG5ld0xpbmUsIG5ld0NvbHVtbilcblx0XHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRcdHJldHVybiBwXG5cdFx0fVxuXHQqL1xuXG5cdC8qXG5cdEluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cblx0V2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG5cdCovXG5cdGNvbnN0IGxleFBsYWluID0gaXNJblF1b3RlID0+IHtcblx0XHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHRcdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHRcdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdFx0bGV0IGluZGVudCA9IDBcblxuXHRcdC8vIE1ha2UgY2xvc3VyZXMgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgbG9vcC5cblx0XHQvLyBUaGlzIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIGFzIG9mIG5vZGUgdjAuMTEuMTQuXG5cblx0XHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRcdGxldCBzdGFydENvbHVtblxuXHRcdGNvbnN0XG5cdFx0XHRzdGFydFBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pLFxuXHRcdFx0bG9jID0gKCkgPT4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpLFxuXHRcdFx0ZnVuS2V5d29yZCA9IGtpbmQgPT4ge1xuXHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9XG5cblx0XHRjb25zdFxuXHRcdFx0aGFuZGxlTmFtZSA9ICgpID0+IHtcblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRcdGlmIChrZXl3b3JkS2luZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhrZXl3b3JkS2luZCAhPT0gLTEsIHBvcywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBuYW1lICR7Y29kZShuYW1lKX1gKVxuXHRcdFx0XHRcdGlmIChrZXl3b3JkS2luZCA9PT0gS1dfUmVnaW9uKVxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogRWF0IGFuZCBwdXQgaXQgaW4gUmVnaW9uIGV4cHJlc3Npb25cblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRrZXl3b3JkKGtleXdvcmRLaW5kKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgWmVybzpcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNlOlxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0XHRjYXNlIE9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRvcGVuQnJhY2tldChsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgU3BhY2U6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0Y29udGV4dC53YXJuSWYobmV4dCA9PT0gU3BhY2UsIGxvYywgJ011bHRpcGxlIHNwYWNlcyBpbiBhIHJvdy4nKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKG5leHQgPT09IE5ld2xpbmUsIGxvYywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdGlmIChpbmRlbnQgPD0gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdFx0Y2xvc2VHcm91cHMobC5lbmQsIEdfQmxvY2spXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtXX0xhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpXG5cdFx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGxvYygpLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobG9jKCkuZW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgVGFiOlxuXHRcdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0XHRjb250ZXh0LmZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHRcdC8vIEZVTlxuXG5cdFx0XHRcdGNhc2UgQmFuZzpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkRvKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgVGlsZGU6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICd+IScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbkRvKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbilcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0xhenkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBCYXI6XG5cdFx0XHRcdFx0a2V5d29yZChLV19GdW4pXG5cdFx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgSGFzaDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEhhc2gpKSB7XG5cdFx0XHRcdFx0XHQvLyBNdWx0aS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdG11c3RFYXQoSGFzaCwgJyMjJylcblx0XHRcdFx0XHRcdGNvbnN0IGVhdEhhc2ggPSAoKSA9PiBlYXRTYWZlKCkgPT09IEhhc2hcblx0XHRcdFx0XHRcdHdoaWxlICh0cnVlKVxuXHRcdFx0XHRcdFx0XHRpZiAoZWF0SGFzaCgpICYmIGVhdEhhc2goKSAmJiBlYXRIYXNoKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSA9PT0gTmV3bGluZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0YCNDbG9zaW5nIHtjb2RlKCcjIyMnKX0gbXVzdCBiZSBmb2xsb3dlZCBieSBuZXdsaW5lLmApXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0Ly8gU2luZ2xlLWxpbmUgY29tbWVudFxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBEb3Q6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0aWYgKG5leHQgPT09IFNwYWNlIHx8IG5leHQgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRcdC8vIE9iakxpdCBhc3NpZ24gaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHQvLyBXZSBjYW4ndCBqdXN0IGNyZWF0ZSBhIG5ldyBHcm91cCBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0b1xuXHRcdFx0XHRcdFx0Ly8gZW5zdXJlIGl0J3Mgbm90IHBhcnQgb2YgdGhlIHByZWNlZGluZyBvciBmb2xsb3dpbmcgc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Y2xvc2VHcm91cHMoc3RhcnRQb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfT2JqQXNzaWduKVxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBleGlzdHMgc29sZWx5IHNvIHRoYXQgdGhlIFNwYWNlIG9yIE5ld2xpbmUgaGFuZGxlciBjYW4gY2xvc2UgaXQuLi5cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXMpXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhbmcgJiYgcGVla05leHQoKSA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzRG8pXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IFRpbGRlKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcufiEnKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW5Ebylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4nKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gKzEgZm9yIHRoZSBkb3Qgd2UganVzdCBhdGUuXG5cdFx0XHRcdFx0XHRjb25zdCBuRG90cyA9IHNraXBXaGlsZUVxdWFscyhEb3QpICsgMVxuXHRcdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdFx0aWYgKG5Eb3RzID09PSAzICYmIG5leHQgPT09IFNwYWNlIHx8IG5leHQgPT09IE5ld2xpbmUpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRWxsaXBzaXMpXG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0bGV0IG5hbWUgPSB0YWtlV2hpbGUoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBhZGQgPSAoKSA9PiBhZGRUb0N1cnJlbnRHcm91cChuZXcgRG90TmFtZShsb2MoKSwgbkRvdHMsIG5hbWUpKVxuXHRcdFx0XHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZSA9IG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19Gb2N1cylcblx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRcdFx0YWRkKClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgQ29sb246XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDb2xvbikpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoRXF1YWwsICc6OicpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoRXF1YWwpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Mb2NhbE11dGF0ZSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX1R5cGUpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIEFtcGVyc2FuZDogY2FzZSBCYWNrc2xhc2g6IGNhc2UgQmFja3RpY2s6IGNhc2UgQ2FyZXQ6XG5cdFx0XHRcdGNhc2UgQ29tbWE6IGNhc2UgUGVyY2VudDogY2FzZSBTZW1pY29sb246XG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYywgYFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKGNoYXJhY3RlckVhdGVuKX1gKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGxleFF1b3RlID0gaW5kZW50ID0+IHtcblx0XHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHRcdC8vIEluZGVudGVkIHF1b3RlIGlzIGNoYXJhY3Rlcml6ZWQgYnkgYmVpbmcgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBuZXdsaW5lLlxuXHRcdC8vIFRoZSBuZXh0IGxpbmUgKm11c3QqIGhhdmUgc29tZSBjb250ZW50IGF0IHRoZSBuZXh0IGluZGVudGF0aW9uLlxuXHRcdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0XHRpZiAoaXNJbmRlbnRlZCkge1xuXHRcdFx0Y29uc3QgYWN0dWFsSW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdGNvbnRleHQuY2hlY2soYWN0dWFsSW5kZW50ID09PSBxdW90ZUluZGVudCwgcG9zLFxuXHRcdFx0XHQnSW5kZW50ZWQgcXVvdGUgbXVzdCBoYXZlIGV4YWN0bHkgb25lIG1vcmUgaW5kZW50IHRoYW4gcHJldmlvdXMgbGluZS4nKVxuXHRcdH1cblxuXHRcdC8vIEN1cnJlbnQgc3RyaW5nIGxpdGVyYWwgcGFydCBvZiBxdW90ZSB3ZSBhcmUgcmVhZGluZy5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIHF1b3RlRXNjYXBlKGVhdCgpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2U6IHtcblx0XHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMobC5lbmQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3Vwcyhwb3MoKSwgR19RdW90ZSlcblx0fVxuXG5cdGNvbnN0IHF1b3RlRXNjYXBlID0gY2ggPT4ge1xuXHRcdHN3aXRjaCAoY2gpIHtcblx0XHRcdGNhc2UgT3BlbkJyYWNlOiByZXR1cm4gJ3snXG5cdFx0XHRjYXNlIExldHRlck46IHJldHVybiAnXFxuJ1xuXHRcdFx0Y2FzZSBMZXR0ZXJUOiByZXR1cm4gJ1xcdCdcblx0XHRcdGNhc2UgUXVvdGU6IHJldHVybiAnXCInXG5cdFx0XHRjYXNlIEJhY2tzbGFzaDogcmV0dXJuICdcXFxcJ1xuXHRcdFx0ZGVmYXVsdDogY29udGV4dC5mYWlsKHBvcywgYE5vIG5lZWQgdG8gZXNjYXBlICR7c2hvd0NoYXIoY2gpfWApXG5cdFx0fVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFsgXSwgR19CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIYXNoID0gY2MoJyMnKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck4gPSBjYygnbicpLFxuXHRMZXR0ZXJPID0gY2MoJ28nKSxcblx0TGV0dGVyVCA9IGNjKCd0JyksXG5cdExldHRlclggPSBjYygneCcpLFxuXHROMCA9IGNjKCcwJyksXG5cdE4xID0gY2MoJzEnKSxcblx0TjIgPSBjYygnMicpLFxuXHROMyA9IGNjKCczJyksXG5cdE40ID0gY2MoJzQnKSxcblx0TjUgPSBjYygnNScpLFxuXHRONiA9IGNjKCc2JyksXG5cdE43ID0gY2MoJzcnKSxcblx0TjggPSBjYygnOCcpLFxuXHROOSA9IGNjKCc5JyksXG5cdE5ld2xpbmUgPSBjYygnXFxuJyksXG5cdE9wZW5CcmFjZSA9IGNjKCd7JyksXG5cdE9wZW5CcmFja2V0ID0gY2MoJ1snKSxcblx0T3BlblBhcmVudGhlc2lzID0gY2MoJygnKSxcblx0UGVyY2VudCA9IGNjKCclJyksXG5cdFF1b3RlID0gY2MoJ1wiJyksXG5cdFNlbWljb2xvbiA9IGNjKCc7JyksXG5cdFNwYWNlID0gY2MoJyAnKSxcblx0VGFiID0gY2MoJ1xcdCcpLFxuXHRUaWxkZSA9IGNjKCd+JyksXG5cdFplcm8gPSBjYygnXFwwJylcblxuY29uc3Rcblx0c2hvd0NoYXIgPSBjaGFyID0+IGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSksXG5cdF9jaGFyUHJlZCA9IChjaGFycywgbmVnYXRlKSA9PiB7XG5cdFx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRcdHNyYyA9IGAke3NyY31jYXNlICR7Y2hhcnMuY2hhckNvZGVBdChpKX06IGBcblx0XHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdFx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcblx0fSxcblx0aXNEaWdpdCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc0RpZ2l0QmluYXJ5ID0gX2NoYXJQcmVkKCcwMScpLFxuXHRpc0RpZ2l0T2N0YWwgPSBfY2hhclByZWQoJzAxMjM0NTY3JyksXG5cdGlzRGlnaXRIZXggPSBfY2hhclByZWQoJzAxMjM0NTY3ODlhYmNkZWYnKSxcblx0aXNOYW1lQ2hhcmFjdGVyID0gX2NoYXJQcmVkKE5vbk5hbWVDaGFyYWN0ZXJzLCB0cnVlKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=