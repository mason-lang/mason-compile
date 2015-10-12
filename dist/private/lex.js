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
		sourceString = `${ sourceString }\n\0`;

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
			//	c | no closing paren here
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
		      peek2Before = () => sourceString.charCodeAt(index - 2),
		     

		// May eat a Newline.
		// Caller *must* check for that case and increment line!
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
		takeWhile = characterPredicate => _takeWhileWithStart(index, characterPredicate),
		      takeWhileWithPrev = characterPredicate => _takeWhileWithStart(index - 1, characterPredicate),
		      _takeWhileWithStart = (startIndex, characterPredicate) => {
			skipWhile(characterPredicate);
			return sourceString.slice(startIndex, index);
		},
		      skipWhileEquals = char => skipWhile(_ => _ === char),
		      skipRestOfLine = () => skipWhile(_ => _ !== Newline),
		      eatRestOfLine = () => takeWhile(_ => _ !== Newline),
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
			},
			      eatIndent = () => {
				const optIndent = context.opts.indent();
				if (optIndent === '\t') {
					const indent = skipWhileEquals(Tab);
					context.check(peek() !== Space, pos, 'Line begins in a space');
					return indent;
				} else {
					const spaces = skipWhileEquals(Space);
					context.check(spaces % optIndent === 0, pos, () => `Indentation spaces must be a multiple of ${ optIndent }`);
					return spaces / optIndent;
				}
			};

			const handleName = () => {
				context.check(isNameCharacter(peekPrev()), loc(), () => `Reserved character ${ showChar(peekPrev()) }`);

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
					if (keywordKind === _Token.KW_Region) {
						// TODO: Eat and put it in Region expression
						skipRestOfLine();
						keyword(_Token.KW_Region);
					} else if (keywordKind === _Token.KW_Todo) skipRestOfLine();else keyword(keywordKind);
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
							context.warnIf(peek2Before() === Space, pos, 'Line ends in a space.');

							// Skip any blank lines.
							skipNewlines();
							const oldIndent = indent;
							indent = eatIndent();
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
						if (tryEat(Space) || tryEat(Tab)) {
							const text = eatRestOfLine();
							closeSpaceOKIfEmpty(startPos());
							context.check(curGroup.kind === _Token.G_Line && curGroup.subTokens.length === 0, loc, () => `Doc comment must go on its own line. (Did you mean ${ (0, _CompileError.code)('||') }?)`);
							addToCurrentGroup(new _Token.DocComment(loc(), text));
						} else if (tryEat(Bar))
							// non-doc comment
							skipRestOfLine();else funKeyword(_Token.KW_Fun);
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
	reservedCharacters = '`#%^&\\\';,',
	      isNameCharacter = _charPred('()[]{}.:| \n\t"' + reservedCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNhZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsQ0FBQyxHQUFFLFlBQVksRUFBQyxJQUFJLENBQUMsQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3JCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQUk7QUFDNUIsV0FBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDOUI7UUFFRCxTQUFTLEdBQUcsTUFBTTtBQUNqQixXQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0dBQzNCOzs7OztBQUlELFdBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFDbkMsYUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7O0FBR3pCLFdBQVEsR0FBRyxXQXpDZSxLQUFLLENBeUNWLGlCQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDM0Q7UUFFRCxlQUFlLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQzFDLE9BQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQzlCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDakM7UUFFRCxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3JDLFVBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQ3BELENBQUMsZ0JBQWdCLEdBQUUsV0FoRGtELGFBQWEsRUFnRGpELFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLGdCQUFnQixHQUFFLFdBakRrRCxh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LE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDbEQsU0FBUyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sS0FBSztBQUM5QixNQUFJLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQTtBQUMxQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDMUMsR0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsS0FBSyxHQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDNUMsS0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsUUFBUSxHQUFFLENBQUMsTUFBTSxFQUFDLGtCQUFrQixHQUFFLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUM5RCxTQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDMUI7T0FDRCxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztPQUNqQyxhQUFhLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMvQixZQUFZLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztPQUNwQyxVQUFVLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDOzs7O0FBRzFDLG1CQUFrQixHQUFHLGFBQWE7T0FDbEMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL2xleC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IExvYywge1BvcywgU3RhcnRMaW5lLCBTdGFydFBvcywgU3RhcnRDb2x1bW4sIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge051bWJlckxpdGVyYWx9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQge0RvY0NvbW1lbnQsIERvdE5hbWUsIEdyb3VwLCBHX0Jsb2NrLCBHX0JyYWNrZXQsIEdfTGluZSwgR19QYXJlbnRoZXNpcywgR19TcGFjZSwgR19RdW90ZSxcblx0aXNLZXl3b3JkLCBLZXl3b3JkLCBLV19Bc3NpZ25NdXRhYmxlLCBLV19FbGxpcHNpcywgS1dfRm9jdXMsIEtXX0Z1biwgS1dfRnVuRG8sIEtXX0Z1bkdlbixcblx0S1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLCBLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSxcblx0S1dfT2JqQXNzaWduLCBLV19SZWdpb24sIEtXX1RvZG8sIEtXX1R5cGUsIE5hbWUsIG9wS2V5d29yZEtpbmRGcm9tTmFtZSwgc2hvd0dyb3VwS2luZFxuXHR9IGZyb20gJy4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVGhpcyBwcm9kdWNlcyB0aGUgVG9rZW4gdHJlZSAoc2VlIFRva2VuLmpzKS5cbiovXG5leHBvcnQgZGVmYXVsdCAoY29udGV4dCwgc291cmNlU3RyaW5nKSA9PiB7XG5cdC8qXG5cdExleGluZyBhbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChXaGVuIHN0cmluZyByZWFjaGVzIGVuZCBgY2hhckNvZGVBdGAgd2lsbCByZXR1cm4gYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcblxcMGBcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBHUk9VUElOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBXZSBvbmx5IGV2ZXIgd3JpdGUgdG8gdGhlIGlubmVybW9zdCBHcm91cDtcblx0Ly8gd2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuXHQvLyBOb3RlIHRoYXQgYGN1ckdyb3VwYCBpcyBjb25jZXB0dWFsbHkgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGJ1dCBpcyBub3Qgc3RvcmVkIGluIGBzdGFja2AuXG5cdGNvbnN0IGdyb3VwU3RhY2sgPSBbXVxuXHRsZXQgY3VyR3JvdXBcblx0Y29uc3Rcblx0XHRhZGRUb0N1cnJlbnRHcm91cCA9IHRva2VuID0+IHtcblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKVxuXHRcdH0sXG5cblx0XHRkcm9wR3JvdXAgPSAoKSA9PiB7XG5cdFx0XHRjdXJHcm91cCA9IGdyb3VwU3RhY2sucG9wKClcblx0XHR9LFxuXG5cdFx0Ly8gUGF1c2Ugd3JpdGluZyB0byBjdXJHcm91cCBpbiBmYXZvciBvZiB3cml0aW5nIHRvIGEgc3ViLWdyb3VwLlxuXHRcdC8vIFdoZW4gdGhlIHN1Yi1ncm91cCBmaW5pc2hlcyB3ZSB3aWxsIHBvcCB0aGUgc3RhY2sgYW5kIHJlc3VtZSB3cml0aW5nIHRvIGl0cyBwYXJlbnQuXG5cdFx0b3Blbkdyb3VwID0gKG9wZW5Qb3MsIGdyb3VwS2luZCkgPT4ge1xuXHRcdFx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHRcdFx0Ly8gQ29udGVudHMgd2lsbCBiZSBhZGRlZCB0byBieSBgYWRkVG9DdXJyZW50R3JvdXBgLlxuXHRcdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgW10sIGdyb3VwS2luZClcblx0XHR9LFxuXG5cdFx0bWF5YmVDbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0XHRcdF9jbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdGNsb3NlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdFx0XHRgVHJ5aW5nIHRvIGNsb3NlICR7c2hvd0dyb3VwS2luZChjbG9zZUtpbmQpfSwgYCArXG5cdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRfY2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRsZXQganVzdENsb3NlZCA9IGN1ckdyb3VwXG5cdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRjb250ZXh0Lndhcm4oanVzdENsb3NlZC5sb2MsICdVbm5lY2Vzc2FyeSBzcGFjZS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBHX0xpbmU6XG5cdFx0XHRcdFx0Ly8gTGluZSBtdXN0IGhhdmUgY29udGVudC5cblx0XHRcdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSwgY2xvc2VQb3MsICdFbXB0eSBibG9jay4nKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5ID0gcG9zID0+IHtcblx0XHRcdGFzc2VydChjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0XHRcdGRyb3BHcm91cCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VQYXJlbnRoZXNpcyA9IGxvYyA9PiB7XG5cdFx0XHRfY2xvc2VHcm91cChsb2Muc3RhcnQsIEdfU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3VwKGxvYy5lbmQsIEdfUGFyZW50aGVzaXMpXG5cdFx0fSxcblxuXHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50ID0gcG9zID0+IHtcblx0XHRcdGNsb3NlTGluZShwb3MpXG5cdFx0XHRjbG9zZUdyb3VwKHBvcywgR19CbG9jaylcblx0XHRcdC8vIEl0J3MgT0sgdG8gYmUgbWlzc2luZyBhIGNsb3NpbmcgcGFyZW50aGVzaXMgaWYgdGhlcmUncyBhIGJsb2NrLiBFLmcuOlxuXHRcdFx0Ly8gYSAoYlxuXHRcdFx0Ly9cdGMgfCBubyBjbG9zaW5nIHBhcmVuIGhlcmVcblx0XHRcdHdoaWxlIChjdXJHcm91cC5raW5kID09PSBHX1BhcmVudGhlc2lzIHx8IGN1ckdyb3VwLmtpbmQgPT09IEdfU3BhY2UpXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgY3VyR3JvdXAua2luZClcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBzdGFydGluZyBhIG5ldyBsaW5lLCBhIHNwYWNlZCBncm91cCBpcyBjcmVhdGVkIGltcGxpY2l0bHkuXG5cdFx0b3BlbkxpbmUgPSBwb3MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19MaW5lKVxuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VMaW5lID0gcG9zID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KClcblx0XHRcdGNsb3NlR3JvdXAocG9zLCBHX0xpbmUpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gZW5jb3VudGVyaW5nIGEgc3BhY2UsIGl0IGJvdGggY2xvc2VzIGFuZCBvcGVucyBhIHNwYWNlZCBncm91cC5cblx0XHRzcGFjZSA9IGxvYyA9PiB7XG5cdFx0XHRtYXliZUNsb3NlR3JvdXAobG9jLnN0YXJ0LCBHX1NwYWNlKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIElURVJBVElORyBUSFJPVUdIIFNPVVJDRVNUUklOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvKlxuXHRUaGVzZSBhcmUga2VwdCB1cC10by1kYXRlIGFzIHdlIGl0ZXJhdGUgdGhyb3VnaCBzb3VyY2VTdHJpbmcuXG5cdEV2ZXJ5IGFjY2VzcyB0byBpbmRleCBoYXMgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIGxpbmUgYW5kL29yIGNvbHVtbi5cblx0VGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cblx0Ki9cblx0bGV0IGluZGV4ID0gMCwgbGluZSA9IFN0YXJ0TGluZSwgY29sdW1uID0gU3RhcnRDb2x1bW5cblxuXHQvKlxuXHROT1RFOiBXZSB1c2UgY2hhcmFjdGVyICpjb2RlcyogZm9yIGV2ZXJ5dGhpbmcuXG5cdENoYXJhY3RlcnMgYXJlIG9mIHR5cGUgTnVtYmVyIGFuZCBub3QganVzdCBTdHJpbmdzIG9mIGxlbmd0aCBvbmUuXG5cdCovXG5cdGNvbnN0XG5cdFx0cG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBjb2x1bW4pLFxuXG5cdFx0cGVlayA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSxcblx0XHRwZWVrTmV4dCA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSksXG5cdFx0cGVla1ByZXYgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDEpLFxuXHRcdHBlZWsyQmVmb3JlID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAyKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0Ly8gY2hhclRvRWF0IG11c3Qgbm90IGJlIE5ld2xpbmUuXG5cdFx0dHJ5RWF0ID0gY2hhclRvRWF0ID0+IHtcblx0XHRcdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhclRvRWF0XG5cdFx0XHRpZiAoY2FuRWF0KSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdH1cblx0XHRcdHJldHVybiBjYW5FYXRcblx0XHR9LFxuXG5cdFx0bXVzdEVhdCA9IChjaGFyVG9FYXQsIHByZWNlZGVkQnkpID0+IHtcblx0XHRcdGNvbnN0IGNhbkVhdCA9IHRyeUVhdChjaGFyVG9FYXQpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRgJHtjb2RlKHByZWNlZGVkQnkpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5ICR7c2hvd0NoYXIoY2hhclRvRWF0KX1gKVxuXHRcdH0sXG5cblx0XHR0cnlFYXROZXdsaW5lID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBOZXdsaW5lXG5cdFx0XHRpZiAoY2FuRWF0KSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZXIgbXVzdCBlbnN1cmUgdGhhdCBiYWNraW5nIHVwIG5DaGFyc1RvQmFja1VwIGNoYXJhY3RlcnMgYnJpbmdzIHVzIHRvIG9sZFBvcy5cblx0XHRzdGVwQmFja01hbnkgPSAob2xkUG9zLCBuQ2hhcnNUb0JhY2tVcCkgPT4ge1xuXHRcdFx0aW5kZXggPSBpbmRleCAtIG5DaGFyc1RvQmFja1VwXG5cdFx0XHRsaW5lID0gb2xkUG9zLmxpbmVcblx0XHRcdGNvbHVtbiA9IG9sZFBvcy5jb2x1bW5cblx0XHR9LFxuXG5cdFx0Ly8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG5cdFx0Ly8gY2hhcmFjdGVyUHJlZGljYXRlIG11c3QgKm5vdCogYWNjZXB0IE5ld2xpbmUuXG5cdFx0Ly8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuXHRcdHRha2VXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHR0YWtlV2hpbGVXaXRoUHJldiA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCAtIDEsIGNoYXJhY3RlclByZWRpY2F0ZSksXG5cdFx0X3Rha2VXaGlsZVdpdGhTdGFydCA9IChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpID0+IHtcblx0XHRcdHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdFx0XHRyZXR1cm4gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdH0sXG5cblx0XHRza2lwV2hpbGVFcXVhbHMgPSBjaGFyID0+XG5cdFx0XHRza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKSxcblxuXHRcdHNraXBSZXN0T2ZMaW5lID0gKCkgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gIT09IE5ld2xpbmUpLFxuXG5cdFx0ZWF0UmVzdE9mTGluZSA9ICgpID0+XG5cdFx0XHR0YWtlV2hpbGUoXyA9PiBfICE9PSBOZXdsaW5lKSxcblxuXHRcdHNraXBXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0XHRcdHdoaWxlIChjaGFyYWN0ZXJQcmVkaWNhdGUocGVlaygpKSlcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIGRpZmZcblx0XHRcdHJldHVybiBkaWZmXG5cdFx0fSxcblxuXHRcdC8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG5cdFx0Ly8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuXHRcdHNraXBOZXdsaW5lcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0TGluZSA9IGxpbmVcblx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0d2hpbGUgKHBlZWsoKSA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdH1cblx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxuXHRcdH1cblxuXHQvLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuXHQvKlxuXHRjb25zdFxuXHRcdGNoZWNrUG9zID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0XHRcdGlmIChwLmxpbmUgIT09IGxpbmUgfHwgcC5jb2x1bW4gIT09IGNvbHVtbilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxuXHRcdH0sXG5cdFx0X2luZGV4VG9Qb3MgPSBuZXcgTWFwKCksXG5cdFx0X2dldENvcnJlY3RQb3MgPSAoKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXggPT09IDApXG5cdFx0XHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRcdFx0bGV0IG9sZFBvcywgb2xkSW5kZXhcblx0XHRcdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRcdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdFx0XHRpZiAob2xkUG9zICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdFx0XHR9XG5cdFx0XHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdFx0XHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0XHRcdGlmIChzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChvbGRJbmRleCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0XHRcdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRcdFx0X2luZGV4VG9Qb3Muc2V0KGluZGV4LCBwKVxuXHRcdFx0cmV0dXJuIHBcblx0XHR9XG5cdCovXG5cblx0Lypcblx0SW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuXHRXaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cblx0Ki9cblx0Y29uc3QgbGV4UGxhaW4gPSBpc0luUXVvdGUgPT4ge1xuXHRcdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdFx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdFx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0XHRsZXQgaW5kZW50ID0gMFxuXG5cdFx0Ly8gTWFrZSBjbG9zdXJlcyBub3cgcmF0aGVyIHRoYW4gaW5zaWRlIHRoZSBsb29wLlxuXHRcdC8vIFRoaXMgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgYXMgb2Ygbm9kZSB2MC4xMS4xNC5cblxuXHRcdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdFx0bGV0IHN0YXJ0Q29sdW1uXG5cdFx0Y29uc3Rcblx0XHRcdHN0YXJ0UG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbiksXG5cdFx0XHRsb2MgPSAoKSA9PiBuZXcgTG9jKHN0YXJ0UG9zKCksIHBvcygpKSxcblx0XHRcdGtleXdvcmQgPSBraW5kID0+XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSksXG5cdFx0XHRmdW5LZXl3b3JkID0ga2luZCA9PiB7XG5cdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9LFxuXHRcdFx0ZWF0SW5kZW50ID0gKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvcHRJbmRlbnQgPSBjb250ZXh0Lm9wdHMuaW5kZW50KClcblx0XHRcdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdFx0XHRjb25zdCBpbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2socGVlaygpICE9PSBTcGFjZSwgcG9zLCAnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScpXG5cdFx0XHRcdFx0cmV0dXJuIGluZGVudFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhTcGFjZSlcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdFx0XHRyZXR1cm4gc3BhY2VzIC8gb3B0SW5kZW50XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdGNvbnN0XG5cdFx0XHRoYW5kbGVOYW1lID0gKCkgPT4ge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrUHJldigpKSwgbG9jKCksICgpID0+XG5cdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKHBlZWtQcmV2KCkpfWApXG5cblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRcdGlmIChrZXl3b3JkS2luZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhrZXl3b3JkS2luZCAhPT0gLTEsIHBvcywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBuYW1lICR7Y29kZShuYW1lKX1gKVxuXHRcdFx0XHRcdGlmIChrZXl3b3JkS2luZCA9PT0gS1dfUmVnaW9uKSB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBFYXQgYW5kIHB1dCBpdCBpbiBSZWdpb24gZXhwcmVzc2lvblxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19SZWdpb24pXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChrZXl3b3JkS2luZCA9PT0gS1dfVG9kbylcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKGtleXdvcmRLaW5kKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgTnVsbENoYXI6XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGNhc2UgQ2xvc2VCcmFjZTpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzSW5RdW90ZSwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKENsb3NlQnJhY2UpfWApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0bGV4UXVvdGUoaW5kZW50KVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gR1JPVVBTXG5cblx0XHRcdFx0Y2FzZSBPcGVuUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDbG9zZVBhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdfUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE9wZW5CcmFja2V0OlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2xvc2VCcmFja2V0KSlcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdfQnJhY2tldCkpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR19CcmFja2V0KVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKHBvcygpLCBHX1NwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2tldDpcblx0XHRcdFx0XHRfY2xvc2VHcm91cChzdGFydFBvcygpLCBHX1NwYWNlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFNwYWNlOlxuXHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblx0XHRcdFx0XHRjb250ZXh0Lndhcm5JZihwZWVrMkJlZm9yZSgpID09PSBTcGFjZSwgcG9zLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gZWF0SW5kZW50KClcblx0XHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKGluZGVudCA9PT0gb2xkSW5kZW50ICsgMSwgbG9jLFxuXHRcdFx0XHRcdFx0XHQnTGluZSBpcyBpbmRlbnRlZCBtb3JlIHRoYW4gb25jZScpXG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdC8vIEJsb2NrIGF0IGVuZCBvZiBsaW5lIGdvZXMgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHQvLyBIb3dldmVyLCBgfmAgcHJlY2VkaW5nIGEgYmxvY2sgZ29lcyBpbiBhIGdyb3VwIHdpdGggaXQuXG5cdFx0XHRcdFx0XHRpZiAoaXNFbXB0eShjdXJHcm91cC5zdWJUb2tlbnMpIHx8XG5cdFx0XHRcdFx0XHRcdCFpc0tleXdvcmQoS1dfTGF6eSwgbGFzdChjdXJHcm91cC5zdWJUb2tlbnMpKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gR19TcGFjZSlcblx0XHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR19TcGFjZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHX0Jsb2NrKVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGluZGVudDsgaSA8IG9sZEluZGVudDsgaSA9IGkgKyAxKVxuXHRcdFx0XHRcdFx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudChsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0Y2xvc2VMaW5lKGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIFRhYjpcblx0XHRcdFx0XHQvLyBXZSBhbHdheXMgZWF0IHRhYnMgaW4gdGhlIE5ld2xpbmUgaGFuZGxlcixcblx0XHRcdFx0XHQvLyBzbyB0aGlzIHdpbGwgb25seSBoYXBwZW4gaW4gdGhlIG1pZGRsZSBvZiBhIGxpbmUuXG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFRpbGRlOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnfiEnKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW5Ebylcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW5HZW4pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19MYXp5KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgQmFyOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoU3BhY2UpIHx8IHRyeUVhdChUYWIpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0ZXh0ID0gZWF0UmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKFxuXHRcdFx0XHRcdFx0XHRjdXJHcm91cC5raW5kID09PSBHX0xpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCwgbG9jLCAoKSA9PlxuXHRcdFx0XHRcdFx0XHRgRG9jIGNvbW1lbnQgbXVzdCBnbyBvbiBpdHMgb3duIGxpbmUuIChEaWQgeW91IG1lYW4gJHtjb2RlKCd8fCcpfT8pYClcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBEb2NDb21tZW50KGxvYygpLCB0ZXh0KSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0Ly8gbm9uLWRvYyBjb21tZW50XG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLV19GdW4pXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfT2JqQXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpcylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFuZyAmJiBwZWVrTmV4dCgpID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNEbylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gVGlsZGUpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcuficpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRnVuVGhpc0dlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyArMSBmb3IgdGhlIGRvdCB3ZSBqdXN0IGF0ZS5cblx0XHRcdFx0XHRcdGNvbnN0IG5Eb3RzID0gc2tpcFdoaWxlRXF1YWxzKERvdCkgKyAxXG5cdFx0XHRcdFx0XHRjb25zdCBuZXh0ID0gcGVlaygpXG5cdFx0XHRcdFx0XHRpZiAobkRvdHMgPT09IDMgJiYgbmV4dCA9PT0gU3BhY2UgfHwgbmV4dCA9PT0gTmV3bGluZSlcblx0XHRcdFx0XHRcdFx0a2V5d29yZChLV19FbGxpcHNpcylcblx0XHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0RpZ2l0KG5leHQpLCBsb2MoKSwgJ0NhbiBub3QgaGF2ZSBkaWdpdCBoZXJlLicpXG5cdFx0XHRcdFx0XHRcdGxldCBuYW1lID0gdGFrZVdoaWxlKGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0XHRcdFx0Y29uc3QgYWRkID0gKCkgPT4gYWRkVG9DdXJyZW50R3JvdXAobmV3IERvdE5hbWUobG9jKCksIG5Eb3RzLCBuYW1lKSlcblx0XHRcdFx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSlcblx0XHRcdFx0XHRcdFx0XHRhZGQoKVxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoS1dfRm9jdXMpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0XHRcdGFkZCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjYXNlIENvbG9uOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ29sb24pKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEVxdWFsLCAnOjonKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Bc3NpZ25NdXRhYmxlKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEVxdWFsKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfTG9jYWxNdXRhdGUpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19UeXBlKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBBbXBlcnNhbmQ6IGNhc2UgQmFja3NsYXNoOiBjYXNlIEJhY2t0aWNrOiBjYXNlIENhcmV0OlxuXHRcdFx0XHRjYXNlIENvbW1hOiBjYXNlIFBlcmNlbnQ6IGNhc2UgU2VtaWNvbG9uOlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MsIGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihjaGFyYWN0ZXJFYXRlbil9YClcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsZXhRdW90ZSA9IGluZGVudCA9PiB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR19RdW90ZSlcblxuXHRcdGVhdENoYXJzOiB3aGlsZSAodHJ1ZSkge1xuXHRcdFx0Y29uc3QgY2hhciA9IGVhdCgpXG5cdFx0XHRzd2l0Y2ggKGNoYXIpIHtcblx0XHRcdFx0Y2FzZSBCYWNrc2xhc2g6IHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gZWF0KClcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIGBcXFxcJHtTdHJpbmcuZnJvbUNoYXJDb2RlKG5leHQpfWBcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFNpbmNlIHRoZXNlIGNvbXBpbGUgdG8gdGVtcGxhdGUgbGl0ZXJhbHMsIGhhdmUgdG8gcmVtZW1iZXIgdG8gZXNjYXBlLlxuXHRcdFx0XHRjYXNlIEJhY2t0aWNrOlxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgJ1xcXFxgJ1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgT3BlbkJyYWNlOiB7XG5cdFx0XHRcdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRcdFx0XHRjb25zdCBsID0gbG9jU2luZ2xlKClcblx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRsZXhQbGFpbih0cnVlKVxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIERvbid0IG5lZWQgYGNhc2UgTnVsbENoYXI6YCBiZWNhdXNlIHRoYXQncyBhbHdheXMgcHJlY2VkZWQgYnkgYSBuZXdsaW5lLlxuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbFBvcyA9IHBvcygpXG5cdFx0XHRcdFx0Ly8gR28gYmFjayB0byBiZWZvcmUgd2UgYXRlIGl0LlxuXHRcdFx0XHRcdG9yaWdpbmFsUG9zLmNvbHVtbiA9IG9yaWdpbmFsUG9zLmNvbHVtbiAtIDFcblxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3VwKHBvcygpLCBHX1F1b3RlKVxuXHR9XG5cblx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhTdGFydFBvcywgbnVsbCksIFtdLCBHX0Jsb2NrKVxuXHRvcGVuTGluZShTdGFydFBvcylcblxuXHRsZXhQbGFpbihmYWxzZSlcblxuXHRjb25zdCBlbmRQb3MgPSBwb3MoKVxuXHRjbG9zZUxpbmUoZW5kUG9zKVxuXHRhc3NlcnQoaXNFbXB0eShncm91cFN0YWNrKSlcblx0Y3VyR3JvdXAubG9jLmVuZCA9IGVuZFBvc1xuXHRyZXR1cm4gY3VyR3JvdXBcbn1cblxuY29uc3QgY2MgPSBfID0+IF8uY2hhckNvZGVBdCgwKVxuY29uc3Rcblx0QW1wZXJzYW5kID0gY2MoJyYnKSxcblx0QmFja3NsYXNoID0gY2MoJ1xcXFwnKSxcblx0QmFja3RpY2sgPSBjYygnYCcpLFxuXHRCYW5nID0gY2MoJyEnKSxcblx0QmFyID0gY2MoJ3wnKSxcblx0Q2FyZXQgPSBjYygnXicpLFxuXHRDbG9zZUJyYWNlID0gY2MoJ30nKSxcblx0Q2xvc2VCcmFja2V0ID0gY2MoJ10nKSxcblx0Q2xvc2VQYXJlbnRoZXNpcyA9IGNjKCcpJyksXG5cdENvbG9uID0gY2MoJzonKSxcblx0Q29tbWEgPSBjYygnLCcpLFxuXHREb3QgPSBjYygnLicpLFxuXHRFcXVhbCA9IGNjKCc9JyksXG5cdEh5cGhlbiA9IGNjKCctJyksXG5cdExldHRlckIgPSBjYygnYicpLFxuXHRMZXR0ZXJPID0gY2MoJ28nKSxcblx0TGV0dGVyWCA9IGNjKCd4JyksXG5cdE4wID0gY2MoJzAnKSxcblx0TjEgPSBjYygnMScpLFxuXHROMiA9IGNjKCcyJyksXG5cdE4zID0gY2MoJzMnKSxcblx0TjQgPSBjYygnNCcpLFxuXHRONSA9IGNjKCc1JyksXG5cdE42ID0gY2MoJzYnKSxcblx0TjcgPSBjYygnNycpLFxuXHROOCA9IGNjKCc4JyksXG5cdE45ID0gY2MoJzknKSxcblx0TmV3bGluZSA9IGNjKCdcXG4nKSxcblx0TnVsbENoYXIgPSBjYygnXFwwJyksXG5cdE9wZW5CcmFjZSA9IGNjKCd7JyksXG5cdE9wZW5CcmFja2V0ID0gY2MoJ1snKSxcblx0T3BlblBhcmVudGhlc2lzID0gY2MoJygnKSxcblx0UGVyY2VudCA9IGNjKCclJyksXG5cdFF1b3RlID0gY2MoJ1wiJyksXG5cdFNlbWljb2xvbiA9IGNjKCc7JyksXG5cdFNwYWNlID0gY2MoJyAnKSxcblx0VGFiID0gY2MoJ1xcdCcpLFxuXHRUaWxkZSA9IGNjKCd+JylcblxuY29uc3Rcblx0c2hvd0NoYXIgPSBjaGFyID0+IGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSksXG5cdF9jaGFyUHJlZCA9IChjaGFycywgbmVnYXRlKSA9PiB7XG5cdFx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRcdHNyYyA9IGAke3NyY31jYXNlICR7Y2hhcnMuY2hhckNvZGVBdChpKX06IGBcblx0XHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdFx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcblx0fSxcblx0aXNEaWdpdCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc0RpZ2l0QmluYXJ5ID0gX2NoYXJQcmVkKCcwMScpLFxuXHRpc0RpZ2l0T2N0YWwgPSBfY2hhclByZWQoJzAxMjM0NTY3JyksXG5cdGlzRGlnaXRIZXggPSBfY2hhclByZWQoJzAxMjM0NTY3ODlhYmNkZWYnKSxcblxuXHQvLyBBbnl0aGluZyBub3QgZXhwbGljaXRseSByZXNlcnZlZCBpcyBhIHZhbGlkIG5hbWUgY2hhcmFjdGVyLlxuXHRyZXNlcnZlZENoYXJhY3RlcnMgPSAnYCMlXiZcXFxcXFwnOywnLFxuXHRpc05hbWVDaGFyYWN0ZXIgPSBfY2hhclByZWQoJygpW117fS46fCBcXG5cXHRcIicgKyByZXNlcnZlZENoYXJhY3RlcnMsIHRydWUpXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
