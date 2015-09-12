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
			_closeGroup(loc.start, _Token.G_Space);
			closeGroup(loc.end, _Token.G_Parenthesis);
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
						if (tryEat(CloseParenthesis)) addToCurrentGroup(new _Token.Group(loc(), [], _Token.G_Parenthesis));else openParenthesis(loc());
						break;
					case OpenBracket:
						if (tryEat(CloseBracket)) addToCurrentGroup(new _Token.Group(loc(), [], _Token.G_Bracket));else {
							openGroup(startPos(), _Token.G_Bracket);
							openGroup(pos(), _Token.G_Space);
						}
						break;
					case CloseParenthesis:
						closeParenthesis(loc());
						break;
					case CloseBracket:
						_closeGroup(startPos(), _Token.G_Space);
						closeGroup(pos(), _Token.G_Bracket);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNZZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRyxDQUFBO0FBQ3RCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQUk7QUFDNUIsV0FBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDOUI7UUFFRCxTQUFTLEdBQUcsTUFBTTtBQUNqQixXQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0dBQzNCOzs7OztBQUlELFdBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFDbkMsYUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7O0FBR3pCLFdBQVEsR0FBRyxXQXhDSSxLQUFLLENBd0NDLGlCQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDNUQ7UUFFRCxlQUFlLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQzFDLE9BQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQzlCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDakM7UUFFRCxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3JDLFVBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQ3BELENBQUMsZ0JBQWdCLEdBQUUsV0EvQ3lDLGFBQWEsRUErQ3hDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLGdCQUFnQixHQUFFLFdBaER5QyxhQUFhLEVBZ0R4QyxRQUFR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LGlCQUFpQixHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvbGV4LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgTG9jLCB7IFBvcywgU3RhcnRMaW5lLCBTdGFydFBvcywgU3RhcnRDb2x1bW4sIHNpbmdsZUNoYXJMb2MgfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7IGNvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBOdW1iZXJMaXRlcmFsIH0gZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7IERvdE5hbWUsIEdyb3VwLCBHX0Jsb2NrLCBHX0JyYWNrZXQsIEdfTGluZSwgR19QYXJlbnRoZXNpcywgR19TcGFjZSwgR19RdW90ZSxcblx0aXNLZXl3b3JkLCBLZXl3b3JkLCBLV19Bc3NpZ25NdXRhYmxlLCBLV19FbGxpcHNpcywgS1dfRm9jdXMsIEtXX0Z1biwgS1dfRnVuRG8sIEtXX0Z1bkdlbixcblx0S1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLCBLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSxcblx0S1dfT2JqQXNzaWduLCBLV19SZWdpb24sIEtXX1R5cGUsIE5hbWUsIG9wS2V5d29yZEtpbmRGcm9tTmFtZSwgc2hvd0dyb3VwS2luZCB9IGZyb20gJy4vVG9rZW4nXG5pbXBvcnQgeyBhc3NlcnQsIGlzRW1wdHksIGxhc3QgfSBmcm9tICcuL3V0aWwnXG5cbi8qXG5UaGlzIHByb2R1Y2VzIHRoZSBUb2tlbiB0cmVlIChzZWUgVG9rZW4uanMpLlxuKi9cbmV4cG9ydCBkZWZhdWx0IChjb250ZXh0LCBzb3VyY2VTdHJpbmcpID0+IHtcblx0Lypcblx0TGV4aW5nIGFsZ29yaXRobSByZXF1aXJlcyB0cmFpbGluZyBuZXdsaW5lIHRvIGNsb3NlIGFueSBibG9ja3MuXG5cdFVzZSBhIDAtdGVybWluYXRlZCBzdHJpbmcgYmVjYXVzZSBpdCdzIGZhc3RlciB0aGFuIGNoZWNraW5nIHdoZXRoZXIgaW5kZXggPT09IGxlbmd0aC5cblx0KFdoZW4gc3RyaW5nIHJlYWNoZXMgZW5kIGBjaGFyQ29kZUF0YCB3aWxsIHJldHVybiBgTmFOYCwgd2hpY2ggY2FuJ3QgYmUgc3dpdGNoZWQgb24uKVxuXHQqL1xuXHRzb3VyY2VTdHJpbmcgPSBzb3VyY2VTdHJpbmcgKyAnXFxuXFwwJ1xuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIEdST1VQSU5HXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFdlIG9ubHkgZXZlciB3cml0ZSB0byB0aGUgaW5uZXJtb3N0IEdyb3VwO1xuXHQvLyB3aGVuIHdlIGNsb3NlIHRoYXQgR3JvdXAgd2UgYWRkIGl0IHRvIHRoZSBlbmNsb3NpbmcgR3JvdXAgYW5kIGNvbnRpbnVlIHdpdGggdGhhdCBvbmUuXG5cdC8vIE5vdGUgdGhhdCBgY3VyR3JvdXBgIGlzIGNvbmNlcHR1YWxseSB0aGUgdG9wIG9mIHRoZSBzdGFjaywgYnV0IGlzIG5vdCBzdG9yZWQgaW4gYHN0YWNrYC5cblx0Y29uc3QgZ3JvdXBTdGFjayA9IFsgXVxuXHRsZXQgY3VyR3JvdXBcblx0Y29uc3Rcblx0XHRhZGRUb0N1cnJlbnRHcm91cCA9IHRva2VuID0+IHtcblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKVxuXHRcdH0sXG5cblx0XHRkcm9wR3JvdXAgPSAoKSA9PiB7XG5cdFx0XHRjdXJHcm91cCA9IGdyb3VwU3RhY2sucG9wKClcblx0XHR9LFxuXG5cdFx0Ly8gUGF1c2Ugd3JpdGluZyB0byBjdXJHcm91cCBpbiBmYXZvciBvZiB3cml0aW5nIHRvIGEgc3ViLWdyb3VwLlxuXHRcdC8vIFdoZW4gdGhlIHN1Yi1ncm91cCBmaW5pc2hlcyB3ZSB3aWxsIHBvcCB0aGUgc3RhY2sgYW5kIHJlc3VtZSB3cml0aW5nIHRvIGl0cyBwYXJlbnQuXG5cdFx0b3Blbkdyb3VwID0gKG9wZW5Qb3MsIGdyb3VwS2luZCkgPT4ge1xuXHRcdFx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHRcdFx0Ly8gQ29udGVudHMgd2lsbCBiZSBhZGRlZCB0byBieSBgYWRkVG9DdXJyZW50R3JvdXBgLlxuXHRcdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgWyBdLCBncm91cEtpbmQpXG5cdFx0fSxcblxuXHRcdG1heWJlQ2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gY2xvc2VLaW5kKVxuXHRcdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRjbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGNvbnRleHQuY2hlY2soY2xvc2VLaW5kID09PSBjdXJHcm91cC5raW5kLCBjbG9zZVBvcywgKCkgPT5cblx0XHRcdFx0YFRyeWluZyB0byBjbG9zZSAke3Nob3dHcm91cEtpbmQoY2xvc2VLaW5kKX0sIGAgK1xuXHRcdFx0XHRgYnV0IGxhc3Qgb3BlbmVkICR7c2hvd0dyb3VwS2luZChjdXJHcm91cC5raW5kKX1gKVxuXHRcdFx0X2Nsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZClcblx0XHR9LFxuXG5cdFx0X2Nsb3NlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0bGV0IGp1c3RDbG9zZWQgPSBjdXJHcm91cFxuXHRcdFx0ZHJvcEdyb3VwKClcblx0XHRcdGp1c3RDbG9zZWQubG9jLmVuZCA9IGNsb3NlUG9zXG5cdFx0XHRzd2l0Y2ggKGNsb3NlS2luZCkge1xuXHRcdFx0XHRjYXNlIEdfU3BhY2U6IHtcblx0XHRcdFx0XHRjb25zdCBzaXplID0ganVzdENsb3NlZC5zdWJUb2tlbnMubGVuZ3RoXG5cdFx0XHRcdFx0aWYgKHNpemUgIT09IDApXG5cdFx0XHRcdFx0XHQvLyBTcGFjZWQgc2hvdWxkIGFsd2F5cyBoYXZlIGF0IGxlYXN0IHR3byBlbGVtZW50cy5cblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHNpemUgPT09IDEgPyBqdXN0Q2xvc2VkLnN1YlRva2Vuc1swXSA6IGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0Y29udGV4dC53YXJuKGp1c3RDbG9zZWQubG9jLCAnVW5uZWNlc3Nhcnkgc3BhY2UuJylcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgR19MaW5lOlxuXHRcdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdFx0XHRpZiAoIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdfQmxvY2s6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eSA9IHBvcyA9PiB7XG5cdFx0XHRhc3NlcnQoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdGlmIChjdXJHcm91cC5zdWJUb2tlbnMubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfY2xvc2VHcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdG9wZW5QYXJlbnRoZXNpcyA9IGxvYyA9PiB7XG5cdFx0XHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHX1BhcmVudGhlc2lzKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlUGFyZW50aGVzaXMgPSBsb2MgPT4ge1xuXHRcdFx0X2Nsb3NlR3JvdXAobG9jLnN0YXJ0LCBHX1NwYWNlKVxuXHRcdFx0Y2xvc2VHcm91cChsb2MuZW5kLCBHX1BhcmVudGhlc2lzKVxuXHRcdH0sXG5cblx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudCA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUxpbmUocG9zKVxuXHRcdFx0Y2xvc2VHcm91cChwb3MsIEdfQmxvY2spXG5cdFx0XHQvLyBJdCdzIE9LIHRvIGJlIG1pc3NpbmcgYSBjbG9zaW5nIHBhcmVudGhlc2lzIGlmIHRoZXJlJ3MgYSBibG9jay4gRS5nLjpcblx0XHRcdC8vIGEgKGJcblx0XHRcdC8vXHRjICMgbm8gY2xvc2luZyBwYXJlbiBoZXJlXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCA9PT0gR19QYXJlbnRoZXNpcyB8fCBjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0XHRfY2xvc2VHcm91cChwb3MsIGN1ckdyb3VwLmtpbmQpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdfU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eSgpXG5cdFx0XHRjbG9zZUdyb3VwKHBvcywgR19MaW5lKVxuXHRcdH0sXG5cblx0XHQvLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5cdFx0c3BhY2UgPSBsb2MgPT4ge1xuXHRcdFx0bWF5YmVDbG9zZUdyb3VwKGxvYy5zdGFydCwgR19TcGFjZSlcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHX1NwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgY29sdW1uKSxcblxuXHRcdHBlZWsgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCksXG5cdFx0cGVla05leHQgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpLFxuXHRcdHBlZWtQcmV2ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0ZWF0U2FmZSA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoID0gZWF0KClcblx0XHRcdGlmIChjaCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdH1cblx0XHRcdHJldHVybiBjaFxuXHRcdH0sXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNvbnRleHQuY2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpLFxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRza2lwV2hpbGUgPSBjaGFyYWN0ZXJQcmVkaWNhdGUgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4XG5cdFx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb25zdCBkaWZmID0gaW5kZXggLSBzdGFydEluZGV4XG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0XHRyZXR1cm4gZGlmZlxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZWQgYWZ0ZXIgc2VlaW5nIHRoZSBmaXJzdCBuZXdsaW5lLlxuXHRcdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0XHRza2lwTmV3bGluZXMgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydExpbmUgPSBsaW5lXG5cdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdHdoaWxlIChwZWVrKCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR9XG5cdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0XHR9XG5cblx0Ly8gU3ByaW5rbGUgY2hlY2tQb3MoKSBhcm91bmQgdG8gZGVidWcgbGluZSBhbmQgY29sdW1uIHRyYWNraW5nIGVycm9ycy5cblx0Lypcblx0Y29uc3Rcblx0XHRjaGVja1BvcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0XHRpZiAocC5saW5lICE9PSBsaW5lIHx8IHAuY29sdW1uICE9PSBjb2x1bW4pXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW5kZXg6ICR7aW5kZXh9LCB3cm9uZzogJHtQb3MobGluZSwgY29sdW1uKX0sIHJpZ2h0OiAke3B9YClcblx0XHR9LFxuXHRcdF9pbmRleFRvUG9zID0gbmV3IE1hcCgpLFxuXHRcdF9nZXRDb3JyZWN0UG9zID0gKCkgPT4ge1xuXHRcdFx0aWYgKGluZGV4ID09PSAwKVxuXHRcdFx0XHRyZXR1cm4gUG9zKFN0YXJ0TGluZSwgU3RhcnRDb2x1bW4pXG5cblx0XHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0XHRmb3IgKG9sZEluZGV4ID0gaW5kZXggLSAxOyA7IG9sZEluZGV4ID0gb2xkSW5kZXggLSAxKSB7XG5cdFx0XHRcdG9sZFBvcyA9IF9pbmRleFRvUG9zLmdldChvbGRJbmRleClcblx0XHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGFzc2VydChvbGRJbmRleCA+PSAwKVxuXHRcdFx0fVxuXHRcdFx0bGV0IG5ld0xpbmUgPSBvbGRQb3MubGluZSwgbmV3Q29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdFx0Zm9yICg7IG9sZEluZGV4IDwgaW5kZXg7IG9sZEluZGV4ID0gb2xkSW5kZXggKyAxKVxuXHRcdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0bmV3TGluZSA9IG5ld0xpbmUgKyAxXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0bmV3Q29sdW1uID0gbmV3Q29sdW1uICsgMVxuXG5cdFx0XHRjb25zdCBwID0gUG9zKG5ld0xpbmUsIG5ld0NvbHVtbilcblx0XHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRcdHJldHVybiBwXG5cdFx0fVxuXHQqL1xuXG5cdC8qXG5cdEluIHRoZSBjYXNlIG9mIHF1b3RlIGludGVycG9sYXRpb24gKFwiYXtifWNcIikgd2UnbGwgcmVjdXJzZSBiYWNrIGludG8gaGVyZS5cblx0V2hlbiBpc0luUXVvdGUgaXMgdHJ1ZSwgd2Ugd2lsbCBub3QgYWxsb3cgbmV3bGluZXMuXG5cdCovXG5cdGNvbnN0IGxleFBsYWluID0gaXNJblF1b3RlID0+IHtcblx0XHQvLyBUaGlzIHRlbGxzIHVzIHdoaWNoIGluZGVudGVkIGJsb2NrIHdlJ3JlIGluLlxuXHRcdC8vIEluY3JlbWVudGluZyBpdCBtZWFucyBpc3N1aW5nIGEgR1BfT3BlbkJsb2NrIGFuZCBkZWNyZW1lbnRpbmcgaXQgbWVhbnMgYSBHUF9DbG9zZUJsb2NrLlxuXHRcdC8vIERvZXMgbm90aGluZyBpZiBpc0luUXVvdGUuXG5cdFx0bGV0IGluZGVudCA9IDBcblxuXHRcdC8vIE1ha2UgY2xvc3VyZXMgbm93IHJhdGhlciB0aGFuIGluc2lkZSB0aGUgbG9vcC5cblx0XHQvLyBUaGlzIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyIGFzIG9mIG5vZGUgdjAuMTEuMTQuXG5cblx0XHQvLyBUaGlzIGlzIHdoZXJlIHdlIHN0YXJ0ZWQgbGV4aW5nIHRoZSBjdXJyZW50IHRva2VuLlxuXHRcdGxldCBzdGFydENvbHVtblxuXHRcdGNvbnN0XG5cdFx0XHRzdGFydFBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgc3RhcnRDb2x1bW4pLFxuXHRcdFx0bG9jID0gKCkgPT4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSksXG5cdFx0XHRrZXl3b3JkID0ga2luZCA9PlxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpLFxuXHRcdFx0ZnVuS2V5d29yZCA9IGtpbmQgPT4ge1xuXHRcdFx0XHRrZXl3b3JkKGtpbmQpXG5cdFx0XHRcdC8vIEZpcnN0IGFyZyBpbiBpdHMgb3duIHNwYWNlZCBncm91cFxuXHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdH0sXG5cdFx0XHRlYXRBbmRBZGROdW1iZXIgPSAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleCAtIDFcblxuXHRcdFx0XHR0cnlFYXQoSHlwaGVuKVxuXHRcdFx0XHRpZiAocGVla1ByZXYoKSA9PT0gTjApIHtcblx0XHRcdFx0XHRjb25zdCBwID0gcGVlaygpXG5cdFx0XHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdFx0XHRjYXNlIExldHRlckI6IGNhc2UgTGV0dGVyTzogY2FzZSBMZXR0ZXJYOlxuXHRcdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXNEaWdpdFNwZWNpYWwgPVxuXHRcdFx0XHRcdFx0XHRcdHAgPT09IExldHRlckIgP1xuXHRcdFx0XHRcdFx0XHRcdGlzRGlnaXRCaW5hcnkgOlxuXHRcdFx0XHRcdFx0XHRcdHAgPT09IExldHRlck8gP1xuXHRcdFx0XHRcdFx0XHRcdGlzRGlnaXRPY3RhbCA6XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEhleFxuXHRcdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdFNwZWNpYWwpXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRjYXNlIERvdDpcblx0XHRcdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVla05leHQoKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdFx0aWYgKHRyeUVhdChEb3QpKVxuXHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOdW1iZXJMaXRlcmFsKGxvYygpLCBzdHIpKVxuXHRcdFx0fVxuXG5cdFx0Y29uc3Rcblx0XHRcdGhhbmRsZU5hbWUgPSAoKSA9PiB7XG5cdFx0XHRcdC8vIEFsbCBvdGhlciBjaGFyYWN0ZXJzIHNob3VsZCBiZSBoYW5kbGVkIGluIGEgY2FzZSBhYm92ZS5cblx0XHRcdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSkpXG5cdFx0XHRcdFx0a2V5d29yZChLV19Gb2N1cylcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0X2hhbmRsZU5hbWUobmFtZSlcblx0XHRcdH0sXG5cdFx0XHRfaGFuZGxlTmFtZSA9IG5hbWUgPT4ge1xuXHRcdFx0XHRjb25zdCBrZXl3b3JkS2luZCA9IG9wS2V5d29yZEtpbmRGcm9tTmFtZShuYW1lKVxuXHRcdFx0XHRpZiAoa2V5d29yZEtpbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soa2V5d29yZEtpbmQgIT09IC0xLCBwb3MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgbmFtZSAke2NvZGUobmFtZSl9YClcblx0XHRcdFx0XHRpZiAoa2V5d29yZEtpbmQgPT09IEtXX1JlZ2lvbilcblx0XHRcdFx0XHRcdC8vIFRPRE86IEVhdCBhbmQgcHV0IGl0IGluIFJlZ2lvbiBleHByZXNzaW9uXG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0a2V5d29yZChrZXl3b3JkS2luZClcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0XHRjYXNlIE51bGxDaGFyOlxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2U6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIFF1b3RlOlxuXHRcdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRcdGNhc2UgT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2xvc2VQYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFsgXSwgR19QYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNrZXQ6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDbG9zZUJyYWNrZXQpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbIF0sIEdfQnJhY2tldCkpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR19CcmFja2V0KVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKHBvcygpLCBHX1NwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2tldDpcblx0XHRcdFx0XHRfY2xvc2VHcm91cChzdGFydFBvcygpLCBHX1NwYWNlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFNwYWNlOlxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdGNvbnRleHQud2FybklmKHBlZWtQcmV2KCkgPT09IFNwYWNlLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblx0XHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdC8vIEJsb2NrIGF0IGVuZCBvZiBsaW5lIGdvZXMgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHQvLyBIb3dldmVyLCBgfmAgcHJlY2VkaW5nIGEgYmxvY2sgZ29lcyBpbiBhIGdyb3VwIHdpdGggaXQuXG5cdFx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHRcdCFpc0tleXdvcmQoS1dfTGF6eSwgbGFzdChjdXJHcm91cC5zdWJUb2tlbnMpKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR19TcGFjZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGluZGVudDsgaSA8IG9sZEluZGVudDsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdFx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudChsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFRhYjpcblx0XHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFRpbGRlOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnfiEnKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW5Ebylcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW4pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19MYXp5KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQmFyOlxuXHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdFx0Y2FzZSBIeXBoZW46XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTjA6IGNhc2UgTjE6IGNhc2UgTjI6IGNhc2UgTjM6IGNhc2UgTjQ6XG5cdFx0XHRcdGNhc2UgTjU6IGNhc2UgTjY6IGNhc2UgTjc6IGNhc2UgTjg6IGNhc2UgTjk6XG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0XHRicmVha1xuXG5cblx0XHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0XHRjYXNlIEhhc2g6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChIYXNoKSkge1xuXHRcdFx0XHRcdFx0Ly8gTXVsdGktbGluZSBjb21tZW50XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEhhc2gsICcjIycpXG5cdFx0XHRcdFx0XHRjb25zdCBlYXRIYXNoID0gKCkgPT4gZWF0U2FmZSgpID09PSBIYXNoXG5cdFx0XHRcdFx0XHR3aGlsZSAodHJ1ZSlcblx0XHRcdFx0XHRcdFx0aWYgKGVhdEhhc2goKSAmJiBlYXRIYXNoKCkgJiYgZWF0SGFzaCgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhwZWVrKCkgPT09IE5ld2xpbmUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdGAjQ2xvc2luZyB7Y29kZSgnIyMjJyl9IG11c3QgYmUgZm9sbG93ZWQgYnkgbmV3bGluZS5gKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdC8vIFNpbmdsZS1saW5lIGNvbW1lbnRcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfT2JqQXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpcylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFuZyAmJiBwZWVrTmV4dCgpID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNEbylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gVGlsZGUpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcuficpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyArMSBmb3IgdGhlIGRvdCB3ZSBqdXN0IGF0ZS5cblx0XHRcdFx0XHRcdGNvbnN0IG5Eb3RzID0gc2tpcFdoaWxlRXF1YWxzKERvdCkgKyAxXG5cdFx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0XHRpZiAobkRvdHMgPT09IDMgJiYgbmV4dCA9PT0gU3BhY2UgfHwgbmV4dCA9PT0gTmV3bGluZSlcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19FbGxpcHNpcylcblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0RpZ2l0KG5leHQpLCBsb2MoKSwgJ0NhbiBub3QgaGF2ZSBkaWdpdCBoZXJlLicpXG5cdFx0XHRcdFx0XHRcdGxldCBuYW1lID0gdGFrZVdoaWxlKGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0XHRcdFx0Y29uc3QgYWRkID0gKCkgPT4gYWRkVG9DdXJyZW50R3JvdXAobmV3IERvdE5hbWUobG9jKCksIG5Eb3RzLCBuYW1lKSlcblx0XHRcdFx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSlcblx0XHRcdFx0XHRcdFx0XHRhZGQoKVxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRm9jdXMpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYXNlIENvbG9uOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ29sb24pKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEVxdWFsKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfTG9jYWxNdXRhdGUpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19UeXBlKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBBbXBlcnNhbmQ6IGNhc2UgQmFja3NsYXNoOiBjYXNlIEJhY2t0aWNrOiBjYXNlIENhcmV0OlxuXHRcdFx0XHRjYXNlIENvbW1hOiBjYXNlIFBlcmNlbnQ6IGNhc2UgU2VtaWNvbG9uOlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsZXhRdW90ZSA9IGluZGVudCA9PiB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0XHRjYXNlIEJhY2t0aWNrOlxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNlOiB7XG5cdFx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIERvbid0IG5lZWQgYGNhc2UgTnVsbENoYXI6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3VwKHBvcygpLCBHX1F1b3RlKVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFsgXSwgR19CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIYXNoID0gY2MoJyMnKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck8gPSBjYygnbycpLFxuXHRMZXR0ZXJYID0gY2MoJ3gnKSxcblx0TjAgPSBjYygnMCcpLFxuXHROMSA9IGNjKCcxJyksXG5cdE4yID0gY2MoJzInKSxcblx0TjMgPSBjYygnMycpLFxuXHRONCA9IGNjKCc0JyksXG5cdE41ID0gY2MoJzUnKSxcblx0TjYgPSBjYygnNicpLFxuXHRONyA9IGNjKCc3JyksXG5cdE44ID0gY2MoJzgnKSxcblx0TjkgPSBjYygnOScpLFxuXHROZXdsaW5lID0gY2MoJ1xcbicpLFxuXHROdWxsQ2hhciA9IGNjKCdcXDAnKSxcblx0T3BlbkJyYWNlID0gY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQgPSBjYygnWycpLFxuXHRPcGVuUGFyZW50aGVzaXMgPSBjYygnKCcpLFxuXHRQZXJjZW50ID0gY2MoJyUnKSxcblx0UXVvdGUgPSBjYygnXCInKSxcblx0U2VtaWNvbG9uID0gY2MoJzsnKSxcblx0U3BhY2UgPSBjYygnICcpLFxuXHRUYWIgPSBjYygnXFx0JyksXG5cdFRpbGRlID0gY2MoJ34nKVxuXG5jb25zdFxuXHRzaG93Q2hhciA9IGNoYXIgPT4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKSxcblx0X2NoYXJQcmVkID0gKGNoYXJzLCBuZWdhdGUpID0+IHtcblx0XHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRcdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0XHRyZXR1cm4gRnVuY3Rpb24oJ2NoJywgc3JjKVxuXHR9LFxuXHRpc0RpZ2l0ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5JyksXG5cdGlzRGlnaXRCaW5hcnkgPSBfY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IF9jaGFyUHJlZCgnMDEyMzQ1NjcnKSxcblx0aXNEaWdpdEhleCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OWFiY2RlZicpLFxuXG5cdC8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG5cdHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgJV4mXFxcXFxcJzssJyxcblx0aXNOYW1lQ2hhcmFjdGVyID0gX2NoYXJQcmVkKCcoKVtde30uOnwgXFxuXFx0XCInICsgcmVzZXJ2ZWRDaGFyYWN0ZXJzLCB0cnVlKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=