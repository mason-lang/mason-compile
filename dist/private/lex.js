if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', 'esast/dist/Loc', '../CompileError', './MsAst', './Token', './util'], function (exports, module, _esastDistLoc, _CompileError, _MsAst, _Token, _util) {
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
					case NullChar:
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
			// This is a raw value.
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
							const next = eat();
							read = read + `\\${ String.fromCharCode(next) }`;
							break;
						}
					// Since these compile to template literals, have to remember to escape.
					case Backtick:
						read = read + '\\`';
						break;
					case OpenBrace:
						{
							maybeOutputRead();
							const l = locSingle();
							openParenthesis(l);
							lexPlain(true);
							closeGroups(l.end, _Token.G_Parenthesis);
							break;
						}
					// Don't need `case NullChar:` because that's always preceded by a newline.
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
	      LetterO = cc('o'),
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
	      NullChar = cc('\0'),
	      OpenBrace = cc('{'),
	      OpenBracket = cc('['),
	      OpenParenthesis = cc('('),
	      Percent = cc('%'),
	      Quote = cc('"'),
	      Semicolon = cc(';'),
	      Space = cc(' '),
	      Tab = cc('\t'),
	      Tilde = cc('~');

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
	     

	// Anything not explicitly reserved is a valid name character.
	reservedCharacters = '`#%^&\\;,',
	      isNameCharacter = _charPred('()[]{}.:| \n\t"' + reservedCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNZZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRyxDQUFBO0FBQ3RCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQ3hCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs7Ozs7QUFJL0IsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUNuQyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBbkNJLEtBQUssQ0FtQ0MsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUM1RDs7Ozs7QUFJRCxhQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLOzs7QUFHdEMsVUFBTyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxVQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBOztBQUU3QixXQUFPLENBQUMsS0FBSyxDQUNaLE9BQU8sWUEvQ3lDLGFBQWEsQUErQ3BDLElBQUksT0FBTyxZQS9DUCxTQUFTLEFBK0NZLElBQUksT0FBTyxZQS9DRSxPQUFPLEFBK0NHLEVBQ3pFLFFBQVEsRUFBRSxNQUNWLENBQUMsZ0JBQWdCLEdBQUUsV0E5Q3dDLGFBQWEsRUE4Q3ZDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLG9CQUFvQixHQUFFLFdBL0NvQyxhQUFhLEVBK0NuQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFD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QUFVLENBQUM7T0FDcEMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQzs7OztBQUcxQyxtQkFBa0IsR0FBRyxXQUFXO09BQ2hDLGVBQWUsR0FBRyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9sZXguanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCBMb2MsIHsgUG9zLCBTdGFydExpbmUsIFN0YXJ0UG9zLCBTdGFydENvbHVtbiwgc2luZ2xlQ2hhckxvYyB9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7IE51bWJlckxpdGVyYWwgfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHsgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19MaW5lLCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLFxuXHRpc0tleXdvcmQsIEtleXdvcmQsIEtXX0Fzc2lnbk11dGFibGUsIEtXX0VsbGlwc2lzLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLFxuXHRLV19GdW5HZW5EbywgS1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLFxuXHRLV19PYmpBc3NpZ24sIEtXX1JlZ2lvbiwgS1dfVHlwZSwgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lLCBzaG93R3JvdXBLaW5kIH0gZnJvbSAnLi9Ub2tlbidcbmltcG9ydCB7IGFzc2VydCwgaXNFbXB0eSwgbGFzdCB9IGZyb20gJy4vdXRpbCdcblxuLypcblRoaXMgcHJvZHVjZXMgdGhlIFRva2VuIHRyZWUgKHNlZSBUb2tlbi5qcykuXG4qL1xuZXhwb3J0IGRlZmF1bHQgKGNvbnRleHQsIHNvdXJjZVN0cmluZykgPT4ge1xuXHQvKlxuXHRMZXhpbmcgYWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBiZWNhdXNlIGl0J3MgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoV2hlbiBzdHJpbmcgcmVhY2hlcyBlbmQgYGNoYXJDb2RlQXRgIHdpbGwgcmV0dXJuIGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IHNvdXJjZVN0cmluZyArICdcXG5cXDAnXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gR1JPVVBJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG5cdC8vIHdoZW4gd2UgY2xvc2UgdGhhdCBHcm91cCB3ZSBhZGQgaXQgdG8gdGhlIGVuY2xvc2luZyBHcm91cCBhbmQgY29udGludWUgd2l0aCB0aGF0IG9uZS5cblx0Ly8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXHRjb25zdCBncm91cFN0YWNrID0gWyBdXG5cdGxldCBjdXJHcm91cFxuXHRjb25zdFxuXHRcdGFkZFRvQ3VycmVudEdyb3VwID0gdG9rZW4gPT5cblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKSxcblxuXHRcdC8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cblx0XHQvLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuXHRcdG9wZW5Hcm91cCA9IChvcGVuUG9zLCBncm91cEtpbmQpID0+IHtcblx0XHRcdGdyb3VwU3RhY2sucHVzaChjdXJHcm91cClcblx0XHRcdC8vIENvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gYnkgYGFkZFRvQ3VycmVudEdyb3VwYC5cblx0XHRcdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0XHRcdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2Mob3BlblBvcywgbnVsbCksIFsgXSwgZ3JvdXBLaW5kKVxuXHRcdH0sXG5cblx0XHQvLyBBIGdyb3VwIGVuZGluZyBtYXkgY2xvc2UgbXV0bGlwbGUgZ3JvdXBzLlxuXHRcdC8vIEZvciBleGFtcGxlLCBpbiBgbG9nISAoKyAxIDFgLCB0aGUgR19MaW5lIHdpbGwgYWxzbyBjbG9zZSBhIEdfUGFyZW50aGVzaXMuXG5cdFx0Y2xvc2VHcm91cHMgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Ly8gY3VyR3JvdXAgaXMgZGlmZmVyZW50IGVhY2ggdGltZSB3ZSBnbyB0aHJvdWdoIHRoZSBsb29wXG5cdFx0XHQvLyBiZWNhdXNlIF9jbG9zZVNpbmdsZUdyb3VwIGJyaW5ncyB1cyB0byBhbiBlbmNsb3NpbmcgZ3JvdXAuXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCAhPT0gY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNvbnN0IGN1cktpbmQgPSBjdXJHcm91cC5raW5kXG5cdFx0XHRcdC8vIEEgbGluZSBjYW4gY2xvc2UgYSBwYXJlbnRoZXNpcywgYnV0IGEgcGFyZW50aGVzaXMgY2FuJ3QgY2xvc2UgYSBsaW5lIVxuXHRcdFx0XHRjb250ZXh0LmNoZWNrKFxuXHRcdFx0XHRcdGN1cktpbmQgPT09IEdfUGFyZW50aGVzaXMgfHwgY3VyS2luZCA9PT0gR19CcmFja2V0IHx8IGN1cktpbmQgPT09IEdfU3BhY2UsXG5cdFx0XHRcdFx0Y2xvc2VQb3MsICgpID0+XG5cdFx0XHRcdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoY2xvc2VLaW5kKX0sIGAgK1xuXHRcdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgd2FzICR7c2hvd0dyb3VwS2luZChjdXJLaW5kKX1gKVxuXHRcdFx0XHRfY2xvc2VTaW5nbGVHcm91cChjbG9zZVBvcywgY3VyR3JvdXAua2luZClcblx0XHRcdH1cblx0XHRcdF9jbG9zZVNpbmdsZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdF9jbG9zZVNpbmdsZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0XHRcdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgR19MaW5lOlxuXHRcdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdFx0XHRpZiAoIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlbkJyYWNrZXQgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR19CcmFja2V0KVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3Vwcyhwb3MsIEdfTGluZSlcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBlbmNvdW50ZXJpbmcgYSBzcGFjZSwgaXQgYm90aCBjbG9zZXMgYW5kIG9wZW5zIGEgc3BhY2VkIGdyb3VwLlxuXHRcdHNwYWNlID0gbG9jID0+IHtcblx0XHRcdGNsb3NlR3JvdXBzKGxvYy5zdGFydCwgR19TcGFjZSlcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgY29sdW1uKSxcblxuXHRcdHBlZWsgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCksXG5cdFx0cGVla05leHQgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpLFxuXHRcdHBlZWtQcmV2ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0ZWF0U2FmZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoID0gZWF0KClcblx0XHRcdGlmIChjaCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaFxuXHRcdH0sXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNvbnRleHQuY2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpLFxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRza2lwV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb25zdCBkaWZmID0gaW5kZXggLSBzdGFydEluZGV4XG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0XHRyZXR1cm4gZGlmZlxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuXHRcdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0XHRza2lwTmV3bGluZXMgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdHdoaWxlIChwZWVrKCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR9XG5cdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0XHR9XG5cblx0Ly8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cblx0Lypcblx0Y29uc3Rcblx0XHRjaGVja1BvcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0XHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcblx0XHR9LFxuXHRcdF9pbmRleFRvUG9zID0gbmV3IE1hcCgpLFxuXHRcdF9nZXRDb3JyZWN0UG9zID0gKCkgPT4ge1xuXHRcdFx0aWYgKGluZGV4ID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gUG9zKFN0YXJ0TGluZSwgU3RhcnRDb2x1bW4pXG5cblx0XHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0XHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0XHRcdG9sZFBvcyA9IF9pbmRleFRvUG9zLmdldChvbGRJbmRleClcblx0XHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGFzc2VydChvbGRJbmRleCA+PSAwKVxuXHRcdFx0fVxuXHRcdFx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdFx0Zm9yICg7IG9sZEluZGV4IDwgaW5kZXg7IG9sZEluZGV4ID0gb2xkSW5kZXggKyAxKVxuXHRcdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdFx0XHRjb25zdCBwID0gUG9zKG5ld0xpbmUsIG5ld0NvbHVtbilcblx0XHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRcdHJldHVybiBwXG5cdFx0fVxuXHQqL1xuXG5cdC8qXG5cdEluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cblx0V2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG5cdCovXG5cdGNvbnN0IGxleFBsYWluID0gaXNJblF1b3RlID0+IHtcblx0XHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHRcdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHRcdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdFx0bGV0IGluZGVudCA9IDBcblxuXHRcdC8vIE1ha2UgY2xvc3VyZXMgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgbG9vcC5cblx0XHQvLyBUaGlzIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIGFzIG9mIG5vZGUgdjAuMTEuMTQuXG5cblx0XHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRcdGxldCBzdGFydENvbHVtblxuXHRcdGNvbnN0XG5cdFx0XHRzdGFydFBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pLFxuXHRcdFx0bG9jID0gKCkgPT4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpLFxuXHRcdFx0ZnVuS2V5d29yZCA9IGtpbmQgPT4ge1xuXHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9XG5cblx0XHRjb25zdFxuXHRcdFx0aGFuZGxlTmFtZSA9ICgpID0+IHtcblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRcdGlmIChrZXl3b3JkS2luZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhrZXl3b3JkS2luZCAhPT0gLTEsIHBvcywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBuYW1lICR7Y29kZShuYW1lKX1gKVxuXHRcdFx0XHRcdGlmIChrZXl3b3JkS2luZCA9PT0gS1dfUmVnaW9uKVxuXHRcdFx0XHRcdFx0Ly8gVE9ETzogRWF0IGFuZCBwdXQgaXQgaW4gUmVnaW9uIGV4cHJlc3Npb25cblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRrZXl3b3JkKGtleXdvcmRLaW5kKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgTnVsbENoYXI6XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGNhc2UgQ2xvc2VCcmFjZTpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzSW5RdW90ZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKENsb3NlQnJhY2UpfWApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0bGV4UXVvdGUoaW5kZW50KVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gR1JPVVBTXG5cblx0XHRcdFx0Y2FzZSBPcGVuUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNrZXQ6XG5cdFx0XHRcdFx0b3BlbkJyYWNrZXQobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNsb3NlR3JvdXBzKHBvcygpLCBHX1BhcmVudGhlc2lzKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2xvc2VCcmFja2V0OlxuXHRcdFx0XHRcdGNsb3NlR3JvdXBzKHBvcygpLCBHX0JyYWNrZXQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIFNwYWNlOiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKG5leHQgPT09IFNwYWNlLCBsb2MsICdNdWx0aXBsZSBzcGFjZXMgaW4gYSByb3cuJylcblx0XHRcdFx0XHRjb250ZXh0Lndhcm5JZihuZXh0ID09PSBOZXdsaW5lLCBsb2MsICdMaW5lIGVuZHMgaW4gYSBzcGFjZS4nKVxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0luUXVvdGUsIGxvYywgJ1F1b3RlIGludGVycG9sYXRpb24gY2Fubm90IGNvbnRhaW4gbmV3bGluZScpXG5cblx0XHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRcdGluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhwZWVrKCkgIT09IFNwYWNlLCBwb3MsICdMaW5lIGJlZ2lucyBpbiBhIHNwYWNlJylcblx0XHRcdFx0XHRpZiAoaW5kZW50IDw9IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gaW5kZW50OyBpIDwgb2xkSW5kZW50OyBpID0gaSArIDEpIHtcblx0XHRcdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzKGwuZW5kLCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpbmRlbnQgPT09IG9sZEluZGVudCArIDEsIGxvYyxcblx0XHRcdFx0XHRcdFx0J0xpbmUgaXMgaW5kZW50ZWQgbW9yZSB0aGFuIG9uY2UnKVxuXHRcdFx0XHRcdFx0Ly8gQmxvY2sgYXQgZW5kIG9mIGxpbmUgZ29lcyBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRcdGlmIChpc0VtcHR5KGN1ckdyb3VwLnN1YlRva2VucykgfHxcblx0XHRcdFx0XHRcdFx0IWlzS2V5d29yZChLV19MYXp5LCBsYXN0KGN1ckdyb3VwLnN1YlRva2VucykpKVxuXHRcdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsb2MoKS5zdGFydCwgR19CbG9jaylcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGxvYygpLmVuZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFRhYjpcblx0XHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFRpbGRlOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnfiEnKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW5Ebylcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW4pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19MYXp5KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQmFyOlxuXHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuKVxuXHRcdFx0XHRcdC8vIEZpcnN0IGFyZyBpbiBpdHMgb3duIHNwYWNlZCBncm91cFxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdFx0Y2FzZSBIeXBoZW46XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTjA6IGNhc2UgTjE6IGNhc2UgTjI6IGNhc2UgTjM6IGNhc2UgTjQ6XG5cdFx0XHRcdGNhc2UgTjU6IGNhc2UgTjY6IGNhc2UgTjc6IGNhc2UgTjg6IGNhc2UgTjk6XG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0XHRicmVha1xuXG5cblx0XHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0XHRjYXNlIEhhc2g6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChIYXNoKSkge1xuXHRcdFx0XHRcdFx0Ly8gTXVsdGktbGluZSBjb21tZW50XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEhhc2gsICcjIycpXG5cdFx0XHRcdFx0XHRjb25zdCBlYXRIYXNoID0gKCkgPT4gZWF0U2FmZSgpID09PSBIYXNoXG5cdFx0XHRcdFx0XHR3aGlsZSAodHJ1ZSlcblx0XHRcdFx0XHRcdFx0aWYgKGVhdEhhc2goKSAmJiBlYXRIYXNoKCkgJiYgZWF0SGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhwZWVrKCkgPT09IE5ld2xpbmUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGAjQ2xvc2luZyB7Y29kZSgnIyMjJyl9IG11c3QgYmUgZm9sbG93ZWQgYnkgbmV3bGluZS5gKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdC8vIFNpbmdsZS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzKHN0YXJ0UG9zKCksIEdfU3BhY2UpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX09iakFzc2lnbilcblx0XHRcdFx0XHRcdC8vIFRoaXMgZXhpc3RzIHNvbGVseSBzbyB0aGF0IHRoZSBTcGFjZSBvciBOZXdsaW5lIGhhbmRsZXIgY2FuIGNsb3NlIGl0Li4uXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdfU3BhY2UpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzKVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBCYW5nICYmIHBlZWtOZXh0KCkgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0RvKVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChuZXh0ID09PSBUaWxkZSkge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhbmcpKSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4hJylcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzR2VuRG8pXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+Jylcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzR2VuKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vICsxIGZvciB0aGUgZG90IHdlIGp1c3QgYXRlLlxuXHRcdFx0XHRcdFx0Y29uc3QgbkRvdHMgPSBza2lwV2hpbGVFcXVhbHMoRG90KSArIDFcblx0XHRcdFx0XHRcdGNvbnN0IG5leHQgPSBwZWVrKClcblx0XHRcdFx0XHRcdGlmIChuRG90cyA9PT0gMyAmJiBuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0VsbGlwc2lzKVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGxldCBuYW1lID0gdGFrZVdoaWxlKGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0XHRcdFx0Y29uc3QgYWRkID0gKCkgPT4gYWRkVG9DdXJyZW50R3JvdXAobmV3IERvdE5hbWUobG9jKCksIG5Eb3RzLCBuYW1lKSlcblx0XHRcdFx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSlcblx0XHRcdFx0XHRcdFx0XHRhZGQoKVxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRm9jdXMpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYXNlIENvbG9uOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ29sb24pKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEVxdWFsKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfTG9jYWxNdXRhdGUpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19UeXBlKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBBbXBlcnNhbmQ6IGNhc2UgQmFja3NsYXNoOiBjYXNlIEJhY2t0aWNrOiBjYXNlIENhcmV0OlxuXHRcdFx0XHRjYXNlIENvbW1hOiBjYXNlIFBlcmNlbnQ6IGNhc2UgU2VtaWNvbG9uOlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsZXhRdW90ZSA9IGluZGVudCA9PiB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0XHRjYXNlIEJhY2t0aWNrOlxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNlOiB7XG5cdFx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXBzKGwuZW5kLCBHX1BhcmVudGhlc2lzKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRG9uJ3QgbmVlZCBgY2FzZSBOdWxsQ2hhcjpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdFx0b3JpZ2luYWxQb3MuY29sdW1uID0gb3JpZ2luYWxQb3MuY29sdW1uIC0gMVxuXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0luZGVudGVkLCBsb2NTaW5nbGUsICdVbmNsb3NlZCBxdW90ZS4nKVxuXHRcdFx0XHRcdC8vIEFsbG93IGV4dHJhIGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0XHRjb25zdCBuZXdJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGlmIChuZXdJbmRlbnQgPCBxdW90ZUluZGVudCkge1xuXHRcdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdFx0Ly8gVW5kbyByZWFkaW5nIHRoZSB0YWJzIGFuZCBuZXdsaW5lLlxuXHRcdFx0XHRcdFx0c3RlcEJhY2tNYW55KG9yaWdpbmFsUG9zLCBudW1OZXdsaW5lcyArIG5ld0luZGVudClcblx0XHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IE5ld2xpbmUpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0cmVhZCA9IHJlYWQgK1xuXHRcdFx0XHRcdFx0XHQnXFxuJy5yZXBlYXQobnVtTmV3bGluZXMpICsgJ1xcdCcucmVwZWF0KG5ld0luZGVudCAtIHF1b3RlSW5kZW50KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRpZiAoIWlzSW5kZW50ZWQpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdC8vIEVsc2UgZmFsbHRocm91Z2hcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHRcdFx0XHQvLyBidXQgdGhpcyB0dXJuZWQgb3V0IHRvIGJlIGJldHRlci5cblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcilcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdGNsb3NlR3JvdXBzKHBvcygpLCBHX1F1b3RlKVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFsgXSwgR19CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIYXNoID0gY2MoJyMnKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck8gPSBjYygnbycpLFxuXHRMZXR0ZXJYID0gY2MoJ3gnKSxcblx0TjAgPSBjYygnMCcpLFxuXHROMSA9IGNjKCcxJyksXG5cdE4yID0gY2MoJzInKSxcblx0TjMgPSBjYygnMycpLFxuXHRONCA9IGNjKCc0JyksXG5cdE41ID0gY2MoJzUnKSxcblx0TjYgPSBjYygnNicpLFxuXHRONyA9IGNjKCc3JyksXG5cdE44ID0gY2MoJzgnKSxcblx0TjkgPSBjYygnOScpLFxuXHROZXdsaW5lID0gY2MoJ1xcbicpLFxuXHROdWxsQ2hhciA9IGNjKCdcXDAnKSxcblx0T3BlbkJyYWNlID0gY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQgPSBjYygnWycpLFxuXHRPcGVuUGFyZW50aGVzaXMgPSBjYygnKCcpLFxuXHRQZXJjZW50ID0gY2MoJyUnKSxcblx0UXVvdGUgPSBjYygnXCInKSxcblx0U2VtaWNvbG9uID0gY2MoJzsnKSxcblx0U3BhY2UgPSBjYygnICcpLFxuXHRUYWIgPSBjYygnXFx0JyksXG5cdFRpbGRlID0gY2MoJ34nKVxuXG5jb25zdFxuXHRzaG93Q2hhciA9IGNoYXIgPT4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKSxcblx0X2NoYXJQcmVkID0gKGNoYXJzLCBuZWdhdGUpID0+IHtcblx0XHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRcdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0XHRyZXR1cm4gRnVuY3Rpb24oJ2NoJywgc3JjKVxuXHR9LFxuXHRpc0RpZ2l0ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5JyksXG5cdGlzRGlnaXRCaW5hcnkgPSBfY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IF9jaGFyUHJlZCgnMDEyMzQ1NjcnKSxcblx0aXNEaWdpdEhleCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OWFiY2RlZicpLFxuXG5cdC8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG5cdHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgIyVeJlxcXFw7LCcsXG5cdGlzTmFtZUNoYXJhY3RlciA9IF9jaGFyUHJlZCgnKClbXXt9Ljp8IFxcblxcdFwiJyArIHJlc2VydmVkQ2hhcmFjdGVycywgdHJ1ZSlcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9