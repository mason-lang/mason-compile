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
		      backUp = () => {
			index = index - 1;
			column = column - 1;
		},
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
		takeWhile = characterPredicate => takeWhileWithStart(index, characterPredicate),
		      takeWhileWithPrev = characterPredicate => takeWhileWithStart(index - 1, characterPredicate),
		     

		//TODO:KILL
		takeWhileWithStart = (startIndex, characterPredicate) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNhZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRyxDQUFBO0FBQ3RCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQ3hCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7QUFJL0IsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUNuQyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBbkNJLEtBQUssQ0FtQ0MsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUM1RDs7Ozs7QUFJRCxhQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLOzs7QUFHdEMsVUFBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxVQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBOztBQUU3QixXQUFPLENBQUMsS0FBSyxDQUNaLE9BQU8sWUEvQ3lDLGFBQWEsQUErQ3BDLElBQUksT0FBTyxZQS9DUCxTQUFTLEFBK0NZLElBQUksT0FBTyxZQS9DRSxPQUFPLEFBK0NHLEVBQ3pFLFFBQVEsRUFBRSxNQUNWLENBQUMsZ0JBQWdCLEdBQUUsV0E5Q3dDLGFBQWEsRUE4Q3ZDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLG9CQUFvQixHQUFFLFdBL0NvQyxhQUFhLEVBK0NuQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFD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QUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUMxQyxHQUFHLEdBQUcsQ0FBQyxHQUFFLEdBQUcsRUFBQyxLQUFLLEdBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQTtBQUM1QyxLQUFHLEdBQUcsQ0FBQyxHQUFFLEdBQUcsRUFBQyxRQUFRLEdBQUUsQ0FBQyxNQUFNLEVBQUMsa0JBQWtCLEdBQUUsTUFBTSxFQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzlELFNBQU8sUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtFQUMxQjtPQUNELE9BQU8sR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO09BQ2pDLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQy9CLFlBQVksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO09BQ3BDLFVBQVUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUM7T0FDMUMsZUFBZSxHQUFHLFNBQVMsV0E1ckJuQixpQkFBaUIsRUE0ckJzQixJQUFJLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL2xleC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IExvYywgeyBQb3MsIFN0YXJ0TGluZSwgU3RhcnRQb3MsIFN0YXJ0Q29sdW1uLCBzaW5nbGVDaGFyTG9jIH0gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgeyBjb2RlIH0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHsgTnVtYmVyTGl0ZXJhbCB9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQgeyBOb25OYW1lQ2hhcmFjdGVycyB9IGZyb20gJy4vbGFuZ3VhZ2UnXG5pbXBvcnQgeyBEb3ROYW1lLCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX0xpbmUsIEdfUGFyZW50aGVzaXMsIEdfU3BhY2UsIEdfUXVvdGUsXG5cdGlzS2V5d29yZCwgS2V5d29yZCwgS1dfQXNzaWduTXV0YWJsZSwgS1dfRWxsaXBzaXMsIEtXX0ZvY3VzLCBLV19GdW4sIEtXX0Z1bkRvLCBLV19GdW5HZW4sXG5cdEtXX0Z1bkdlbkRvLCBLV19GdW5UaGlzLCBLV19GdW5UaGlzRG8sIEtXX0Z1blRoaXNHZW4sIEtXX0Z1blRoaXNHZW5EbywgS1dfTGF6eSwgS1dfTG9jYWxNdXRhdGUsXG5cdEtXX09iakFzc2lnbiwgS1dfUmVnaW9uLCBLV19UeXBlLCBOYW1lLCBvcEtleXdvcmRLaW5kRnJvbU5hbWUsIHNob3dHcm91cEtpbmQgfSBmcm9tICcuL1Rva2VuJ1xuaW1wb3J0IHsgYXNzZXJ0LCBpc0VtcHR5LCBsYXN0IH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVGhpcyBwcm9kdWNlcyB0aGUgVG9rZW4gdHJlZSAoc2VlIFRva2VuLmpzKS5cbiovXG5leHBvcnQgZGVmYXVsdCAoY29udGV4dCwgc291cmNlU3RyaW5nKSA9PiB7XG5cdC8qXG5cdExleGluZyBhbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChXaGVuIHN0cmluZyByZWFjaGVzIGVuZCBgY2hhckNvZGVBdGAgd2lsbCByZXR1cm4gYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gc291cmNlU3RyaW5nICsgJ1xcblxcMCdcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBHUk9VUElOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBXZSBvbmx5IGV2ZXIgd3JpdGUgdG8gdGhlIGlubmVybW9zdCBHcm91cDtcblx0Ly8gd2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuXHQvLyBOb3RlIHRoYXQgYGN1ckdyb3VwYCBpcyBjb25jZXB0dWFsbHkgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGJ1dCBpcyBub3Qgc3RvcmVkIGluIGBzdGFja2AuXG5cdGNvbnN0IGdyb3VwU3RhY2sgPSBbIF1cblx0bGV0IGN1ckdyb3VwXG5cdGNvbnN0XG5cdFx0YWRkVG9DdXJyZW50R3JvdXAgPSB0b2tlbiA9PlxuXHRcdFx0Y3VyR3JvdXAuc3ViVG9rZW5zLnB1c2godG9rZW4pLFxuXG5cdFx0Ly8gUGF1c2Ugd3JpdGluZyB0byBjdXJHcm91cCBpbiBmYXZvciBvZiB3cml0aW5nIHRvIGEgc3ViLWdyb3VwLlxuXHRcdC8vIFdoZW4gdGhlIHN1Yi1ncm91cCBmaW5pc2hlcyB3ZSB3aWxsIHBvcCB0aGUgc3RhY2sgYW5kIHJlc3VtZSB3cml0aW5nIHRvIGl0cyBwYXJlbnQuXG5cdFx0b3Blbkdyb3VwID0gKG9wZW5Qb3MsIGdyb3VwS2luZCkgPT4ge1xuXHRcdFx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHRcdFx0Ly8gQ29udGVudHMgd2lsbCBiZSBhZGRlZCB0byBieSBgYWRkVG9DdXJyZW50R3JvdXBgLlxuXHRcdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgWyBdLCBncm91cEtpbmQpXG5cdFx0fSxcblxuXHRcdC8vIEEgZ3JvdXAgZW5kaW5nIG1heSBjbG9zZSBtdXRsaXBsZSBncm91cHMuXG5cdFx0Ly8gRm9yIGV4YW1wbGUsIGluIGBsb2chICgrIDEgMWAsIHRoZSBHX0xpbmUgd2lsbCBhbHNvIGNsb3NlIGEgR19QYXJlbnRoZXNpcy5cblx0XHRjbG9zZUdyb3VwcyA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHQvLyBjdXJHcm91cCBpcyBkaWZmZXJlbnQgZWFjaCB0aW1lIHdlIGdvIHRocm91Z2ggdGhlIGxvb3Bcblx0XHRcdC8vIGJlY2F1c2UgX2Nsb3NlU2luZ2xlR3JvdXAgYnJpbmdzIHVzIHRvIGFuIGVuY2xvc2luZyBncm91cC5cblx0XHRcdHdoaWxlIChjdXJHcm91cC5raW5kICE9PSBjbG9zZUtpbmQpIHtcblx0XHRcdFx0Y29uc3QgY3VyS2luZCA9IGN1ckdyb3VwLmtpbmRcblx0XHRcdFx0Ly8gQSBsaW5lIGNhbiBjbG9zZSBhIHBhcmVudGhlc2lzLCBidXQgYSBwYXJlbnRoZXNpcyBjYW4ndCBjbG9zZSBhIGxpbmUhXG5cdFx0XHRcdGNvbnRleHQuY2hlY2soXG5cdFx0XHRcdFx0Y3VyS2luZCA9PT0gR19QYXJlbnRoZXNpcyB8fCBjdXJLaW5kID09PSBHX0JyYWNrZXQgfHwgY3VyS2luZCA9PT0gR19TcGFjZSxcblx0XHRcdFx0XHRjbG9zZVBvcywgKCkgPT5cblx0XHRcdFx0XHRgVHJ5aW5nIHRvIGNsb3NlICR7c2hvd0dyb3VwS2luZChjbG9zZUtpbmQpfSwgYCArXG5cdFx0XHRcdFx0YGJ1dCBsYXN0IG9wZW5lZCB3YXMgJHtzaG93R3JvdXBLaW5kKGN1cktpbmQpfWApXG5cdFx0XHRcdF9jbG9zZVNpbmdsZUdyb3VwKGNsb3NlUG9zLCBjdXJHcm91cC5raW5kKVxuXHRcdFx0fVxuXHRcdFx0X2Nsb3NlU2luZ2xlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZClcblx0XHR9LFxuXG5cdFx0X2Nsb3NlU2luZ2xlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0bGV0IGp1c3RDbG9zZWQgPSBjdXJHcm91cFxuXHRcdFx0Y3VyR3JvdXAgPSBncm91cFN0YWNrLnBvcCgpXG5cdFx0XHRqdXN0Q2xvc2VkLmxvYy5lbmQgPSBjbG9zZVBvc1xuXHRcdFx0c3dpdGNoIChjbG9zZUtpbmQpIHtcblx0XHRcdFx0Y2FzZSBHX1NwYWNlOiB7XG5cdFx0XHRcdFx0Y29uc3Qgc2l6ZSA9IGp1c3RDbG9zZWQuc3ViVG9rZW5zLmxlbmd0aFxuXHRcdFx0XHRcdGlmIChzaXplICE9PSAwKVxuXHRcdFx0XHRcdFx0Ly8gU3BhY2VkIHNob3VsZCBhbHdheXMgaGF2ZSBhdCBsZWFzdCB0d28gZWxlbWVudHMuXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChzaXplID09PSAxID8ganVzdENsb3NlZC5zdWJUb2tlbnNbMF0gOiBqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBHX0xpbmU6XG5cdFx0XHRcdFx0Ly8gTGluZSBtdXN0IGhhdmUgY29udGVudC5cblx0XHRcdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSwgY2xvc2VQb3MsICdFbXB0eSBibG9jay4nKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRvcGVuUGFyZW50aGVzaXMgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR19QYXJlbnRoZXNpcylcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH0sXG5cblx0XHRvcGVuQnJhY2tldCA9IGxvYyA9PiB7XG5cdFx0XHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHX0JyYWNrZXQpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBzdGFydGluZyBhIG5ldyBsaW5lLCBhIHNwYWNlZCBncm91cCBpcyBjcmVhdGVkIGltcGxpY2l0bHkuXG5cdFx0b3BlbkxpbmUgPSBwb3MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19MaW5lKVxuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VMaW5lID0gcG9zID0+IHtcblx0XHRcdGNsb3NlR3JvdXBzKHBvcywgR19TcGFjZSlcblx0XHRcdGNsb3NlR3JvdXBzKHBvcywgR19MaW5lKVxuXHRcdH0sXG5cblx0XHQvLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5cdFx0c3BhY2UgPSBsb2MgPT4ge1xuXHRcdFx0Y2xvc2VHcm91cHMobG9jLnN0YXJ0LCBHX1NwYWNlKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIElURVJBVElORyBUSFJPVUdIIFNPVVJDRVNUUklOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvKlxuXHRUaGVzZSBhcmUga2VwdCB1cC10by1kYXRlIGFzIHdlIGl0ZXJhdGUgdGhyb3VnaCBzb3VyY2VTdHJpbmcuXG5cdEV2ZXJ5IGFjY2VzcyB0byBpbmRleCBoYXMgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIGxpbmUgYW5kL29yIGNvbHVtbi5cblx0VGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cblx0Ki9cblx0bGV0IGluZGV4ID0gMCwgbGluZSA9IFN0YXJ0TGluZSwgY29sdW1uID0gU3RhcnRDb2x1bW5cblxuXHQvKlxuXHROT1RFOiBXZSB1c2UgY2hhcmFjdGVyICpjb2RlcyogZm9yIGV2ZXJ5dGhpbmcuXG5cdENoYXJhY3RlcnMgYXJlIG9mIHR5cGUgTnVtYmVyIGFuZCBub3QganVzdCBTdHJpbmdzIG9mIGxlbmd0aCBvbmUuXG5cdCovXG5cdGNvbnN0XG5cdFx0cG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBjb2x1bW4pLFxuXG5cdFx0cGVlayA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSxcblx0XHRwZWVrTmV4dCA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSksXG5cdFx0cGVla1ByZXYgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDEpLFxuXG5cdFx0Ly8gTWF5IGVhdCBhIE5ld2xpbmUuXG5cdFx0Ly8gQ2FsbGVyICptdXN0KiBjaGVjayBmb3IgdGhhdCBjYXNlIGFuZCBpbmNyZW1lbnQgbGluZSFcblx0XHRlYXQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjaGFyID0gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpXG5cdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0cmV0dXJuIGNoYXJcblx0XHR9LFxuXHRcdHNraXAgPSBlYXQsXG5cdFx0YmFja1VwID0gKCkgPT4ge1xuXHRcdFx0aW5kZXggPSBpbmRleCAtIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiAtIDFcblx0XHR9LFxuXG5cdFx0ZWF0U2FmZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoID0gZWF0KClcblx0XHRcdGlmIChjaCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaFxuXHRcdH0sXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNvbnRleHQuY2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHR0YWtlV2hpbGVXaXRoU3RhcnQoaW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSksXG5cblx0XHR0YWtlV2hpbGVXaXRoUHJldiA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0dGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblxuXHRcdC8vVE9ETzpLSUxMXG5cdFx0dGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRza2lwV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb25zdCBkaWZmID0gaW5kZXggLSBzdGFydEluZGV4XG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0XHRyZXR1cm4gZGlmZlxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuXHRcdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0XHRza2lwTmV3bGluZXMgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdHdoaWxlIChwZWVrKCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR9XG5cdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0XHR9XG5cblx0Ly8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cblx0Lypcblx0Y29uc3Rcblx0XHRjaGVja1BvcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0XHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcblx0XHR9LFxuXHRcdF9pbmRleFRvUG9zID0gbmV3IE1hcCgpLFxuXHRcdF9nZXRDb3JyZWN0UG9zID0gKCkgPT4ge1xuXHRcdFx0aWYgKGluZGV4ID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gUG9zKFN0YXJ0TGluZSwgU3RhcnRDb2x1bW4pXG5cblx0XHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0XHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0XHRcdG9sZFBvcyA9IF9pbmRleFRvUG9zLmdldChvbGRJbmRleClcblx0XHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGFzc2VydChvbGRJbmRleCA+PSAwKVxuXHRcdFx0fVxuXHRcdFx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdFx0Zm9yICg7IG9sZEluZGV4IDwgaW5kZXg7IG9sZEluZGV4ID0gb2xkSW5kZXggKyAxKVxuXHRcdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdFx0XHRjb25zdCBwID0gUG9zKG5ld0xpbmUsIG5ld0NvbHVtbilcblx0XHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRcdHJldHVybiBwXG5cdFx0fVxuXHQqL1xuXG5cdC8qXG5cdEluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cblx0V2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG5cdCovXG5cdGNvbnN0IGxleFBsYWluID0gaXNJblF1b3RlID0+IHtcblx0XHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHRcdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHRcdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdFx0bGV0IGluZGVudCA9IDBcblxuXHRcdC8vIE1ha2UgY2xvc3VyZXMgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgbG9vcC5cblx0XHQvLyBUaGlzIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIGFzIG9mIG5vZGUgdjAuMTEuMTQuXG5cblx0XHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRcdGxldCBzdGFydENvbHVtblxuXHRcdGNvbnN0XG5cdFx0XHRzdGFydFBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pLFxuXHRcdFx0bG9jID0gKCkgPT4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpLFxuXHRcdFx0ZnVuS2V5d29yZCA9IGtpbmQgPT4ge1xuXHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9XG5cblx0XHRjb25zdFxuXHRcdFx0aGFuZGxlTmFtZSA9ICgpID0+IHtcblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRcdGlmIChrZXl3b3JkS2luZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhrZXl3b3JkS2luZCAhPT0gLTEsIHBvcywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBuYW1lICR7Y29kZShuYW1lKX1gKVxuXHRcdFx0XHRcdGlmIChrZXl3b3JkS2luZCA9PT0gS1dfUmVnaW9uKVxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogRWF0IGFuZCBwdXQgaXQgaW4gUmVnaW9uIGV4cHJlc3Npb25cblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRrZXl3b3JkKGtleXdvcmRLaW5kKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgWmVybzpcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNlOlxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0XHRjYXNlIE9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRvcGVuQnJhY2tldChsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMocG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgU3BhY2U6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0Y29udGV4dC53YXJuSWYobmV4dCA9PT0gU3BhY2UsIGxvYywgJ011bHRpcGxlIHNwYWNlcyBpbiBhIHJvdy4nKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKG5leHQgPT09IE5ld2xpbmUsIGxvYywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdGlmIChpbmRlbnQgPD0gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSkge1xuXHRcdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdFx0Y2xvc2VHcm91cHMobC5lbmQsIEdfQmxvY2spXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtXX0xhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpXG5cdFx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGxvYygpLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobG9jKCkuZW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgVGFiOlxuXHRcdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0XHRjb250ZXh0LmZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHRcdC8vIEZVTlxuXG5cdFx0XHRcdGNhc2UgQmFuZzpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkRvKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgVGlsZGU6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICd+IScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbkRvKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtXX0Z1bkdlbilcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0xhenkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBCYXI6XG5cdFx0XHRcdFx0a2V5d29yZChLV19GdW4pXG5cdFx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgSGFzaDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEhhc2gpKSB7XG5cdFx0XHRcdFx0XHQvLyBNdWx0aS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdG11c3RFYXQoSGFzaCwgJyMjJylcblx0XHRcdFx0XHRcdGNvbnN0IGVhdEhhc2ggPSAoKSA9PiBlYXRTYWZlKCkgPT09IEhhc2hcblx0XHRcdFx0XHRcdHdoaWxlICh0cnVlKVxuXHRcdFx0XHRcdFx0XHRpZiAoZWF0SGFzaCgpICYmIGVhdEhhc2goKSAmJiBlYXRIYXNoKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSA9PT0gTmV3bGluZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0YCNDbG9zaW5nIHtjb2RlKCcjIyMnKX0gbXVzdCBiZSBmb2xsb3dlZCBieSBuZXdsaW5lLmApXG5cdFx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0Ly8gU2luZ2xlLWxpbmUgY29tbWVudFxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBEb3Q6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0aWYgKG5leHQgPT09IFNwYWNlIHx8IG5leHQgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRcdC8vIE9iakxpdCBhc3NpZ24gaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHQvLyBXZSBjYW4ndCBqdXN0IGNyZWF0ZSBhIG5ldyBHcm91cCBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0b1xuXHRcdFx0XHRcdFx0Ly8gZW5zdXJlIGl0J3Mgbm90IHBhcnQgb2YgdGhlIHByZWNlZGluZyBvciBmb2xsb3dpbmcgc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Y2xvc2VHcm91cHMoc3RhcnRQb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfT2JqQXNzaWduKVxuXHRcdFx0XHRcdFx0Ly8gVGhpcyBleGlzdHMgc29sZWx5IHNvIHRoYXQgdGhlIFNwYWNlIG9yIE5ld2xpbmUgaGFuZGxlciBjYW4gY2xvc2UgaXQuLi5cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXMpXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhbmcgJiYgcGVla05leHQoKSA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzRG8pXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IFRpbGRlKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcufiEnKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW5Ebylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4nKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gKzEgZm9yIHRoZSBkb3Qgd2UganVzdCBhdGUuXG5cdFx0XHRcdFx0XHRjb25zdCBuRG90cyA9IHNraXBXaGlsZUVxdWFscyhEb3QpICsgMVxuXHRcdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdFx0aWYgKG5Eb3RzID09PSAzICYmIG5leHQgPT09IFNwYWNlIHx8IG5leHQgPT09IE5ld2xpbmUpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRWxsaXBzaXMpXG5cdFx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdFx0bGV0IG5hbWUgPSB0YWtlV2hpbGUoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBhZGQgPSAoKSA9PiBhZGRUb0N1cnJlbnRHcm91cChuZXcgRG90TmFtZShsb2MoKSwgbkRvdHMsIG5hbWUpKVxuXHRcdFx0XHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0bmFtZSA9IG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19Gb2N1cylcblx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRcdFx0YWRkKClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgQ29sb246XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDb2xvbikpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoRXF1YWwsICc6OicpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoRXF1YWwpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Mb2NhbE11dGF0ZSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX1R5cGUpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIEFtcGVyc2FuZDogY2FzZSBCYWNrc2xhc2g6IGNhc2UgQmFja3RpY2s6IGNhc2UgQ2FyZXQ6XG5cdFx0XHRcdGNhc2UgQ29tbWE6IGNhc2UgUGVyY2VudDogY2FzZSBTZW1pY29sb246XG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYywgYFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKGNoYXJhY3RlckVhdGVuKX1gKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGxleFF1b3RlID0gaW5kZW50ID0+IHtcblx0XHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHRcdC8vIEluZGVudGVkIHF1b3RlIGlzIGNoYXJhY3Rlcml6ZWQgYnkgYmVpbmcgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBuZXdsaW5lLlxuXHRcdC8vIFRoZSBuZXh0IGxpbmUgKm11c3QqIGhhdmUgc29tZSBjb250ZW50IGF0IHRoZSBuZXh0IGluZGVudGF0aW9uLlxuXHRcdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0XHRpZiAoaXNJbmRlbnRlZCkge1xuXHRcdFx0Y29uc3QgYWN0dWFsSW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdGNvbnRleHQuY2hlY2soYWN0dWFsSW5kZW50ID09PSBxdW90ZUluZGVudCwgcG9zLFxuXHRcdFx0XHQnSW5kZW50ZWQgcXVvdGUgbXVzdCBoYXZlIGV4YWN0bHkgb25lIG1vcmUgaW5kZW50IHRoYW4gcHJldmlvdXMgbGluZS4nKVxuXHRcdH1cblxuXHRcdC8vIEN1cnJlbnQgc3RyaW5nIGxpdGVyYWwgcGFydCBvZiBxdW90ZSB3ZSBhcmUgcmVhZGluZy5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIHF1b3RlRXNjYXBlKGVhdCgpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2U6IHtcblx0XHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdFx0Y2xvc2VHcm91cHMobC5lbmQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3Vwcyhwb3MoKSwgR19RdW90ZSlcblx0fVxuXG5cdGNvbnN0IHF1b3RlRXNjYXBlID0gY2ggPT4ge1xuXHRcdHN3aXRjaCAoY2gpIHtcblx0XHRcdGNhc2UgT3BlbkJyYWNlOiByZXR1cm4gJ3snXG5cdFx0XHRjYXNlIExldHRlck46IHJldHVybiAnXFxuJ1xuXHRcdFx0Y2FzZSBMZXR0ZXJUOiByZXR1cm4gJ1xcdCdcblx0XHRcdGNhc2UgUXVvdGU6IHJldHVybiAnXCInXG5cdFx0XHRjYXNlIEJhY2tzbGFzaDogcmV0dXJuICdcXFxcJ1xuXHRcdFx0ZGVmYXVsdDogY29udGV4dC5mYWlsKHBvcywgYE5vIG5lZWQgdG8gZXNjYXBlICR7c2hvd0NoYXIoY2gpfWApXG5cdFx0fVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFsgXSwgR19CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIYXNoID0gY2MoJyMnKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck4gPSBjYygnbicpLFxuXHRMZXR0ZXJPID0gY2MoJ28nKSxcblx0TGV0dGVyVCA9IGNjKCd0JyksXG5cdExldHRlclggPSBjYygneCcpLFxuXHROMCA9IGNjKCcwJyksXG5cdE4xID0gY2MoJzEnKSxcblx0TjIgPSBjYygnMicpLFxuXHROMyA9IGNjKCczJyksXG5cdE40ID0gY2MoJzQnKSxcblx0TjUgPSBjYygnNScpLFxuXHRONiA9IGNjKCc2JyksXG5cdE43ID0gY2MoJzcnKSxcblx0TjggPSBjYygnOCcpLFxuXHROOSA9IGNjKCc5JyksXG5cdE5ld2xpbmUgPSBjYygnXFxuJyksXG5cdE9wZW5CcmFjZSA9IGNjKCd7JyksXG5cdE9wZW5CcmFja2V0ID0gY2MoJ1snKSxcblx0T3BlblBhcmVudGhlc2lzID0gY2MoJygnKSxcblx0UGVyY2VudCA9IGNjKCclJyksXG5cdFF1b3RlID0gY2MoJ1wiJyksXG5cdFNlbWljb2xvbiA9IGNjKCc7JyksXG5cdFNwYWNlID0gY2MoJyAnKSxcblx0VGFiID0gY2MoJ1xcdCcpLFxuXHRUaWxkZSA9IGNjKCd+JyksXG5cdFplcm8gPSBjYygnXFwwJylcblxuY29uc3Rcblx0c2hvd0NoYXIgPSBjaGFyID0+IGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSksXG5cdF9jaGFyUHJlZCA9IChjaGFycywgbmVnYXRlKSA9PiB7XG5cdFx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRcdHNyYyA9IGAke3NyY31jYXNlICR7Y2hhcnMuY2hhckNvZGVBdChpKX06IGBcblx0XHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdFx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcblx0fSxcblx0aXNEaWdpdCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc0RpZ2l0QmluYXJ5ID0gX2NoYXJQcmVkKCcwMScpLFxuXHRpc0RpZ2l0T2N0YWwgPSBfY2hhclByZWQoJzAxMjM0NTY3JyksXG5cdGlzRGlnaXRIZXggPSBfY2hhclByZWQoJzAxMjM0NTY3ODlhYmNkZWYnKSxcblx0aXNOYW1lQ2hhcmFjdGVyID0gX2NoYXJQcmVkKE5vbk5hbWVDaGFyYWN0ZXJzLCB0cnVlKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=