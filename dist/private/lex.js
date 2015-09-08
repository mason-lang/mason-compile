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
		const addToCurrentGroup = token => {
			curGroup.subTokens.push(token);
		},
		      dropGroup = () => {
			curGroup = groupStack.pop();
		},
		     

		// Pause writing to curGroup in favor of writing to a sub-group.
		// When the sub-group finishes we will pop the stack and resume writing to its parent.
		openGroup = (openPos, groupKind) => {
			groupStack.push(curGroup);
			// Contents will be added to by `addToCurrentGroup`.
			// curGroup.loc.end will be written to when closing it.
			curGroup = new _Token.Group(new _Loc.default(openPos, null), [], groupKind);
		},
		      maybeCloseGroup = (closePos, closeKind) => {
			if (curGroup.kind === closeKind) _closeGroup(closePos, closeKind);
		},
		      closeGroup = (closePos, closeKind) => {
			context.check(closeKind === curGroup.kind, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened ${ (0, _Token.showGroupKind)(curGroup.kind) }`);
			_closeGroup(closePos, closeKind);
		},
		      _closeGroup = (closePos, closeKind) => {
			let justClosed = curGroup;
			dropGroup();
			justClosed.loc.end = closePos;
			switch (closeKind) {
				case _Token.G_Space:
					{
						const size = justClosed.subTokens.length;
						if (size !== 0)
							// Spaced should always have at least two elements.
							addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);else context.warn(justClosed.loc, 'Unnecessary space.');
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
		      closeSpaceOKIfEmpty = pos => {
			(0, _util.assert)(curGroup.kind === _Token.G_Space);
			if (curGroup.subTokens.length === 0) dropGroup();else _closeGroup(pos, _Token.G_Space);
		},
		      openParenthesis = loc => {
			openGroup(loc.start, _Token.G_Parenthesis);
			openGroup(loc.end, _Token.G_Space);
		},
		      closeParenthesis = loc => {
			closeSpaceOKIfEmpty(loc.start);
			closeGroup(loc.end, _Token.G_Parenthesis);
		},
		      openBracket = loc => {
			openGroup(loc.start, _Token.G_Bracket);
			openGroup(loc.end, _Token.G_Space);
		},
		      closeBracket = loc => {
			closeSpaceOKIfEmpty(loc.start);
			closeGroup(loc.end, _Token.G_Bracket);
		},
		      closeGroupsForDedent = pos => {
			closeLine(pos);
			closeGroup(pos, _Token.G_Block);
			// It's OK to be missing a closing parenthesis if there's a block. E.g.:
			// a (b
			//	c # no closing paren here
			while (curGroup.kind === _Token.G_Parenthesis || curGroup.kind === _Token.G_Space) _closeGroup(pos, curGroup.kind);
		},
		     

		// When starting a new line, a spaced group is created implicitly.
		openLine = pos => {
			openGroup(pos, _Token.G_Line);
			openGroup(pos, _Token.G_Space);
		},
		      closeLine = pos => {
			if (curGroup.kind === _Token.G_Space) closeSpaceOKIfEmpty();
			closeGroup(pos, _Token.G_Line);
		},
		     

		// When encountering a space, it both closes and opens a spaced group.
		space = loc => {
			maybeCloseGroup(loc.start, _Token.G_Space);
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
				// First arg in its own spaced group
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
						closeParenthesis(loc());
						break;
					case CloseBracket:
						closeBracket(loc());
						break;
					case Space:
						space(loc());
						break;
					case Newline:
						{
							context.check(!isInQuote, loc, 'Quote interpolation cannot contain newline');

							// Skip any blank lines.
							skipNewlines();
							const oldIndent = indent;
							indent = skipWhileEquals(Tab);
							context.check(peek() !== Space, pos, 'Line begins in a space');
							context.warnIf(peekPrev() === Space, 'Line ends in a space.');
							if (indent > oldIndent) {
								context.check(indent === oldIndent + 1, loc, 'Line is indented more than once');
								const l = loc();
								// Block at end of line goes in its own spaced group.
								// However, `~` preceding a block goes in a group with it.
								if ((0, _util.isEmpty)(curGroup.subTokens) || !(0, _Token.isKeyword)(_Token.KW_Lazy, (0, _util.last)(curGroup.subTokens))) {
									if (curGroup.kind === _Token.G_Space) closeSpaceOKIfEmpty(l.start);
									openGroup(l.end, _Token.G_Space);
								}
								openGroup(l.start, _Token.G_Block);
								openLine(l.end);
							} else {
								const l = loc();
								for (let i = indent; i < oldIndent; i = i + 1) closeGroupsForDedent(l.start);
								closeLine(l.start);
								openLine(l.end);
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
						funKeyword(_Token.KW_Fun);
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
								closeSpaceOKIfEmpty(startPos());
								keyword(_Token.KW_ObjAssign);
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
									context.check(!isDigit(next), loc(), 'Can not have digit here.');
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
							closeParenthesis(l);
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
			closeGroup(pos(), _Token.G_Quote);
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
	reservedCharacters = '`%^&\\\';,',
	      isNameCharacter = _charPred('()[]{}.:| \n\t"' + reservedCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNZZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRyxDQUFBO0FBQ3RCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQUk7QUFDNUIsV0FBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDOUI7UUFFRCxTQUFTLEdBQUcsTUFBTTtBQUNqQixXQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0dBQzNCOzs7OztBQUlELFdBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFDbkMsYUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7O0FBR3pCLFdBQVEsR0FBRyxXQXhDSSxLQUFLLENBd0NDLGlCQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDNUQ7UUFFRCxlQUFlLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQzFDLE9BQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQzlCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDakM7UUFFRCxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3JDLFVBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQ3BELENBQUMsZ0JBQWdCLEdBQUUsV0EvQ3lDLGFBQWEsRUErQ3hDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLGdCQUFnQixHQUFFLFdBaER5QyxhQUFhLEVBZ0R4QyxRQUFR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dGFydExpbmUsIFN0YXJ0UG9zLCBTdGFydENvbHVtbiwgc2luZ2xlQ2hhckxvYyB9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHsgY29kZSB9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7IE51bWJlckxpdGVyYWwgfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHsgRG90TmFtZSwgR3JvdXAsIEdfQmxvY2ssIEdfQnJhY2tldCwgR19MaW5lLCBHX1BhcmVudGhlc2lzLCBHX1NwYWNlLCBHX1F1b3RlLFxuXHRpc0tleXdvcmQsIEtleXdvcmQsIEtXX0Fzc2lnbk11dGFibGUsIEtXX0VsbGlwc2lzLCBLV19Gb2N1cywgS1dfRnVuLCBLV19GdW5EbywgS1dfRnVuR2VuLFxuXHRLV19GdW5HZW5EbywgS1dfRnVuVGhpcywgS1dfRnVuVGhpc0RvLCBLV19GdW5UaGlzR2VuLCBLV19GdW5UaGlzR2VuRG8sIEtXX0xhenksIEtXX0xvY2FsTXV0YXRlLFxuXHRLV19PYmpBc3NpZ24sIEtXX1JlZ2lvbiwgS1dfVHlwZSwgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lLCBzaG93R3JvdXBLaW5kIH0gZnJvbSAnLi9Ub2tlbidcbmltcG9ydCB7IGFzc2VydCwgaXNFbXB0eSwgbGFzdCB9IGZyb20gJy4vdXRpbCdcblxuLypcblRoaXMgcHJvZHVjZXMgdGhlIFRva2VuIHRyZWUgKHNlZSBUb2tlbi5qcykuXG4qL1xuZXhwb3J0IGRlZmF1bHQgKGNvbnRleHQsIHNvdXJjZVN0cmluZykgPT4ge1xuXHQvKlxuXHRMZXhpbmcgYWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBiZWNhdXNlIGl0J3MgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoV2hlbiBzdHJpbmcgcmVhY2hlcyBlbmQgYGNoYXJDb2RlQXRgIHdpbGwgcmV0dXJuIGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IHNvdXJjZVN0cmluZyArICdcXG5cXDAnXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gR1JPVVBJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG5cdC8vIHdoZW4gd2UgY2xvc2UgdGhhdCBHcm91cCB3ZSBhZGQgaXQgdG8gdGhlIGVuY2xvc2luZyBHcm91cCBhbmQgY29udGludWUgd2l0aCB0aGF0IG9uZS5cblx0Ly8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXHRjb25zdCBncm91cFN0YWNrID0gWyBdXG5cdGxldCBjdXJHcm91cFxuXHRjb25zdFxuXHRcdGFkZFRvQ3VycmVudEdyb3VwID0gdG9rZW4gPT4ge1xuXHRcdFx0Y3VyR3JvdXAuc3ViVG9rZW5zLnB1c2godG9rZW4pXG5cdFx0fSxcblxuXHRcdGRyb3BHcm91cCA9ICgpID0+IHtcblx0XHRcdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxuXHRcdH0sXG5cblx0XHQvLyBQYXVzZSB3cml0aW5nIHRvIGN1ckdyb3VwIGluIGZhdm9yIG9mIHdyaXRpbmcgdG8gYSBzdWItZ3JvdXAuXG5cdFx0Ly8gV2hlbiB0aGUgc3ViLWdyb3VwIGZpbmlzaGVzIHdlIHdpbGwgcG9wIHRoZSBzdGFjayBhbmQgcmVzdW1lIHdyaXRpbmcgdG8gaXRzIHBhcmVudC5cblx0XHRvcGVuR3JvdXAgPSAob3BlblBvcywgZ3JvdXBLaW5kKSA9PiB7XG5cdFx0XHRncm91cFN0YWNrLnB1c2goY3VyR3JvdXApXG5cdFx0XHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdFx0XHQvLyBjdXJHcm91cC5sb2MuZW5kIHdpbGwgYmUgd3JpdHRlbiB0byB3aGVuIGNsb3NpbmcgaXQuXG5cdFx0XHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKG9wZW5Qb3MsIG51bGwpLCBbIF0sIGdyb3VwS2luZClcblx0XHR9LFxuXG5cdFx0bWF5YmVDbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0XHRcdF9jbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdGNsb3NlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdFx0XHRgVHJ5aW5nIHRvIGNsb3NlICR7c2hvd0dyb3VwS2luZChjbG9zZUtpbmQpfSwgYCArXG5cdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRfY2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRsZXQganVzdENsb3NlZCA9IGN1ckdyb3VwXG5cdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRjb250ZXh0Lndhcm4oanVzdENsb3NlZC5sb2MsICdVbm5lY2Vzc2FyeSBzcGFjZS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBHX0xpbmU6XG5cdFx0XHRcdFx0Ly8gTGluZSBtdXN0IGhhdmUgY29udGVudC5cblx0XHRcdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSwgY2xvc2VQb3MsICdFbXB0eSBibG9jay4nKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5ID0gcG9zID0+IHtcblx0XHRcdGFzc2VydChjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0XHRcdGRyb3BHcm91cCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VQYXJlbnRoZXNpcyA9IGxvYyA9PiB7XG5cdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGxvYy5zdGFydClcblx0XHRcdGNsb3NlR3JvdXAobG9jLmVuZCwgR19QYXJlbnRoZXNpcylcblx0XHR9LFxuXG5cdFx0b3BlbkJyYWNrZXQgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR19CcmFja2V0KVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlQnJhY2tldCA9IGxvYyA9PiB7XG5cdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGxvYy5zdGFydClcblx0XHRcdGNsb3NlR3JvdXAobG9jLmVuZCwgR19CcmFja2V0KVxuXHRcdH0sXG5cblx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudCA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUxpbmUocG9zKVxuXHRcdFx0Y2xvc2VHcm91cChwb3MsIEdfQmxvY2spXG5cdFx0XHQvLyBJdCdzIE9LIHRvIGJlIG1pc3NpbmcgYSBjbG9zaW5nIHBhcmVudGhlc2lzIGlmIHRoZXJlJ3MgYSBibG9jay4gRS5nLjpcblx0XHRcdC8vIGEgKGJcblx0XHRcdC8vXHRjICMgbm8gY2xvc2luZyBwYXJlbiBoZXJlXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCA9PT0gR19QYXJlbnRoZXNpcyB8fCBjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0XHRfY2xvc2VHcm91cChwb3MsIGN1ckdyb3VwLmtpbmQpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eSgpXG5cdFx0XHRjbG9zZUdyb3VwKHBvcywgR19MaW5lKVxuXHRcdH0sXG5cblx0XHQvLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5cdFx0c3BhY2UgPSBsb2MgPT4ge1xuXHRcdFx0bWF5YmVDbG9zZUdyb3VwKGxvYy5zdGFydCwgR19TcGFjZSlcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgY29sdW1uKSxcblxuXHRcdHBlZWsgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCksXG5cdFx0cGVla05leHQgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpLFxuXHRcdHBlZWtQcmV2ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0ZWF0U2FmZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoID0gZWF0KClcblx0XHRcdGlmIChjaCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaFxuXHRcdH0sXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNvbnRleHQuY2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpLFxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRza2lwV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb25zdCBkaWZmID0gaW5kZXggLSBzdGFydEluZGV4XG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0XHRyZXR1cm4gZGlmZlxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuXHRcdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0XHRza2lwTmV3bGluZXMgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdHdoaWxlIChwZWVrKCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR9XG5cdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0XHR9XG5cblx0Ly8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cblx0Lypcblx0Y29uc3Rcblx0XHRjaGVja1BvcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0XHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcblx0XHR9LFxuXHRcdF9pbmRleFRvUG9zID0gbmV3IE1hcCgpLFxuXHRcdF9nZXRDb3JyZWN0UG9zID0gKCkgPT4ge1xuXHRcdFx0aWYgKGluZGV4ID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gUG9zKFN0YXJ0TGluZSwgU3RhcnRDb2x1bW4pXG5cblx0XHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0XHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0XHRcdG9sZFBvcyA9IF9pbmRleFRvUG9zLmdldChvbGRJbmRleClcblx0XHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGFzc2VydChvbGRJbmRleCA+PSAwKVxuXHRcdFx0fVxuXHRcdFx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdFx0Zm9yICg7IG9sZEluZGV4IDwgaW5kZXg7IG9sZEluZGV4ID0gb2xkSW5kZXggKyAxKVxuXHRcdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdFx0XHRjb25zdCBwID0gUG9zKG5ld0xpbmUsIG5ld0NvbHVtbilcblx0XHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRcdHJldHVybiBwXG5cdFx0fVxuXHQqL1xuXG5cdC8qXG5cdEluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cblx0V2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG5cdCovXG5cdGNvbnN0IGxleFBsYWluID0gaXNJblF1b3RlID0+IHtcblx0XHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHRcdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHRcdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdFx0bGV0IGluZGVudCA9IDBcblxuXHRcdC8vIE1ha2UgY2xvc3VyZXMgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgbG9vcC5cblx0XHQvLyBUaGlzIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIGFzIG9mIG5vZGUgdjAuMTEuMTQuXG5cblx0XHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRcdGxldCBzdGFydENvbHVtblxuXHRcdGNvbnN0XG5cdFx0XHRzdGFydFBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pLFxuXHRcdFx0bG9jID0gKCkgPT4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpLFxuXHRcdFx0ZnVuS2V5d29yZCA9IGtpbmQgPT4ge1xuXHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdC8vIEZpcnN0IGFyZyBpbiBpdHMgb3duIHNwYWNlZCBncm91cFxuXHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdH0sXG5cdFx0XHRlYXRBbmRBZGROdW1iZXIgPSAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleCAtIDFcblxuXHRcdFx0XHR0cnlFYXQoSHlwaGVuKVxuXHRcdFx0XHRpZiAocGVla1ByZXYoKSA9PT0gTjApIHtcblx0XHRcdFx0XHRjb25zdCBwID0gcGVlaygpXG5cdFx0XHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdFx0XHRjYXNlIExldHRlckI6IGNhc2UgTGV0dGVyTzogY2FzZSBMZXR0ZXJYOlxuXHRcdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXNEaWdpdFNwZWNpYWwgPVxuXHRcdFx0XHRcdFx0XHRcdHAgPT09IExldHRlckIgP1xuXHRcdFx0XHRcdFx0XHRcdGlzRGlnaXRCaW5hcnkgOlxuXHRcdFx0XHRcdFx0XHRcdHAgPT09IExldHRlck8gP1xuXHRcdFx0XHRcdFx0XHRcdGlzRGlnaXRPY3RhbCA6XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEhleFxuXHRcdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdFNwZWNpYWwpXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRjYXNlIERvdDpcblx0XHRcdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVla05leHQoKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdFx0aWYgKHRyeUVhdChEb3QpKVxuXHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOdW1iZXJMaXRlcmFsKGxvYygpLCBzdHIpKVxuXHRcdFx0fVxuXG5cdFx0Y29uc3Rcblx0XHRcdGhhbmRsZU5hbWUgPSAoKSA9PiB7XG5cdFx0XHRcdC8vIEFsbCBvdGhlciBjaGFyYWN0ZXJzIHNob3VsZCBiZSBoYW5kbGVkIGluIGEgY2FzZSBhYm92ZS5cblx0XHRcdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSkpXG5cdFx0XHRcdFx0a2V5d29yZChLV19Gb2N1cylcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0X2hhbmRsZU5hbWUobmFtZSlcblx0XHRcdH0sXG5cdFx0XHRfaGFuZGxlTmFtZSA9IG5hbWUgPT4ge1xuXHRcdFx0XHRjb25zdCBrZXl3b3JkS2luZCA9IG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKVxuXHRcdFx0XHRpZiAoa2V5d29yZEtpbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soa2V5d29yZEtpbmQgIT09IC0xLCBwb3MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgbmFtZSAke2NvZGUobmFtZSl9YClcblx0XHRcdFx0XHRpZiAoa2V5d29yZEtpbmQgPT09IEtXX1JlZ2lvbilcblx0XHRcdFx0XHRcdC8vIFRPRE86IEVhdCBhbmQgcHV0IGl0IGluIFJlZ2lvbiBleHByZXNzaW9uXG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0a2V5d29yZChrZXl3b3JkS2luZClcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0XHRjYXNlIE51bGxDaGFyOlxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2U6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIFF1b3RlOlxuXHRcdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRcdGNhc2UgT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE9wZW5CcmFja2V0OlxuXHRcdFx0XHRcdG9wZW5CcmFja2V0KGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2xvc2VQYXJlbnRoZXNpczpcblx0XHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQ2xvc2VCcmFja2V0OlxuXHRcdFx0XHRcdGNsb3NlQnJhY2tldChsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFNwYWNlOlxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKHBlZWtQcmV2KCkgPT09IFNwYWNlLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblx0XHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdC8vIEJsb2NrIGF0IGVuZCBvZiBsaW5lIGdvZXMgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHQvLyBIb3dldmVyLCBgfmAgcHJlY2VkaW5nIGEgYmxvY2sgZ29lcyBpbiBhIGdyb3VwIHdpdGggaXQuXG5cdFx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHRcdCFpc0tleXdvcmQoS1dfTGF6eSwgbGFzdChjdXJHcm91cC5zdWJUb2tlbnMpKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR19TcGFjZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGluZGVudDsgaSA8IG9sZEluZGVudDsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdFx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudChsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFRhYjpcblx0XHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFRpbGRlOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnfiEnKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW5Ebylcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW4pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19MYXp5KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQmFyOlxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdFx0Y2FzZSBIeXBoZW46XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTjA6IGNhc2UgTjE6IGNhc2UgTjI6IGNhc2UgTjM6IGNhc2UgTjQ6XG5cdFx0XHRcdGNhc2UgTjU6IGNhc2UgTjY6IGNhc2UgTjc6IGNhc2UgTjg6IGNhc2UgTjk6XG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0XHRicmVha1xuXG5cblx0XHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0XHRjYXNlIEhhc2g6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChIYXNoKSkge1xuXHRcdFx0XHRcdFx0Ly8gTXVsdGktbGluZSBjb21tZW50XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEhhc2gsICcjIycpXG5cdFx0XHRcdFx0XHRjb25zdCBlYXRIYXNoID0gKCkgPT4gZWF0U2FmZSgpID09PSBIYXNoXG5cdFx0XHRcdFx0XHR3aGlsZSAodHJ1ZSlcblx0XHRcdFx0XHRcdFx0aWYgKGVhdEhhc2goKSAmJiBlYXRIYXNoKCkgJiYgZWF0SGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhwZWVrKCkgPT09IE5ld2xpbmUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGAjQ2xvc2luZyB7Y29kZSgnIyMjJyl9IG11c3QgYmUgZm9sbG93ZWQgYnkgbmV3bGluZS5gKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdC8vIFNpbmdsZS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfT2JqQXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpcylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFuZyAmJiBwZWVrTmV4dCgpID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNEbylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gVGlsZGUpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcuficpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyArMSBmb3IgdGhlIGRvdCB3ZSBqdXN0IGF0ZS5cblx0XHRcdFx0XHRcdGNvbnN0IG5Eb3RzID0gc2tpcFdoaWxlRXF1YWxzKERvdCkgKyAxXG5cdFx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0XHRpZiAobkRvdHMgPT09IDMgJiYgbmV4dCA9PT0gU3BhY2UgfHwgbmV4dCA9PT0gTmV3bGluZSlcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19FbGxpcHNpcylcblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0RpZ2l0KG5leHQpLCBsb2MoKSwgJ0NhbiBub3QgaGF2ZSBkaWdpdCBoZXJlLicpXG5cdFx0XHRcdFx0XHRcdGxldCBuYW1lID0gdGFrZVdoaWxlKGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0XHRcdFx0Y29uc3QgYWRkID0gKCkgPT4gYWRkVG9DdXJyZW50R3JvdXAobmV3IERvdE5hbWUobG9jKCksIG5Eb3RzLCBuYW1lKSlcblx0XHRcdFx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSlcblx0XHRcdFx0XHRcdFx0XHRhZGQoKVxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRm9jdXMpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYXNlIENvbG9uOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ29sb24pKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEVxdWFsKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfTG9jYWxNdXRhdGUpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19UeXBlKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBBbXBlcnNhbmQ6IGNhc2UgQmFja3NsYXNoOiBjYXNlIEJhY2t0aWNrOiBjYXNlIENhcmV0OlxuXHRcdFx0XHRjYXNlIENvbW1hOiBjYXNlIFBlcmNlbnQ6IGNhc2UgU2VtaWNvbG9uOlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsZXhRdW90ZSA9IGluZGVudCA9PiB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0XHRjYXNlIEJhY2t0aWNrOlxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNlOiB7XG5cdFx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIERvbid0IG5lZWQgYGNhc2UgTnVsbENoYXI6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3VwKHBvcygpLCBHX1F1b3RlKVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFsgXSwgR19CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIYXNoID0gY2MoJyMnKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck8gPSBjYygnbycpLFxuXHRMZXR0ZXJYID0gY2MoJ3gnKSxcblx0TjAgPSBjYygnMCcpLFxuXHROMSA9IGNjKCcxJyksXG5cdE4yID0gY2MoJzInKSxcblx0TjMgPSBjYygnMycpLFxuXHRONCA9IGNjKCc0JyksXG5cdE41ID0gY2MoJzUnKSxcblx0TjYgPSBjYygnNicpLFxuXHRONyA9IGNjKCc3JyksXG5cdE44ID0gY2MoJzgnKSxcblx0TjkgPSBjYygnOScpLFxuXHROZXdsaW5lID0gY2MoJ1xcbicpLFxuXHROdWxsQ2hhciA9IGNjKCdcXDAnKSxcblx0T3BlbkJyYWNlID0gY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQgPSBjYygnWycpLFxuXHRPcGVuUGFyZW50aGVzaXMgPSBjYygnKCcpLFxuXHRQZXJjZW50ID0gY2MoJyUnKSxcblx0UXVvdGUgPSBjYygnXCInKSxcblx0U2VtaWNvbG9uID0gY2MoJzsnKSxcblx0U3BhY2UgPSBjYygnICcpLFxuXHRUYWIgPSBjYygnXFx0JyksXG5cdFRpbGRlID0gY2MoJ34nKVxuXG5jb25zdFxuXHRzaG93Q2hhciA9IGNoYXIgPT4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKSxcblx0X2NoYXJQcmVkID0gKGNoYXJzLCBuZWdhdGUpID0+IHtcblx0XHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRcdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0XHRyZXR1cm4gRnVuY3Rpb24oJ2NoJywgc3JjKVxuXHR9LFxuXHRpc0RpZ2l0ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5JyksXG5cdGlzRGlnaXRCaW5hcnkgPSBfY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IF9jaGFyUHJlZCgnMDEyMzQ1NjcnKSxcblx0aXNEaWdpdEhleCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OWFiY2RlZicpLFxuXG5cdC8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG5cdHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgJV4mXFxcXFxcJzssJyxcblx0aXNOYW1lQ2hhcmFjdGVyID0gX2NoYXJQcmVkKCcoKVtde30uOnwgXFxuXFx0XCInICsgcmVzZXJ2ZWRDaGFyYWN0ZXJzLCB0cnVlKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=