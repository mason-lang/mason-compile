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
				if (keywordKind !== undefined) if (keywordKind === _Token.KW_Region) {
					// TODO: Eat and put it in Region expression
					skipRestOfLine();
					keyword(_Token.KW_Region);
				} else if (keywordKind === _Token.KW_Todo) skipRestOfLine();else keyword(keywordKind);else addToCurrentGroup(new _Token.Name(loc(), name));
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
							} else if (peek() === Dot && peekNext() === Dot) {
								eat();
								eat();
								keyword(_Token.KW_Ellipsis);
							} else keyword(_Token.KW_Dot);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxleC5qcyIsInByaXZhdGUvbGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztrQkNhZSxDQUFDLE9BQU8sRUFBRSxZQUFZLEtBQUs7Ozs7OztBQU16QyxjQUFZLEdBQUcsQ0FBQyxHQUFFLFlBQVksRUFBQyxJQUFJLENBQUMsQ0FBQTs7Ozs7Ozs7QUFRcEMsUUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3JCLE1BQUksUUFBUSxDQUFBO0FBQ1osUUFDQyxpQkFBaUIsR0FBRyxLQUFLLElBQUk7QUFDNUIsV0FBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDOUI7UUFFRCxTQUFTLEdBQUcsTUFBTTtBQUNqQixXQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0dBQzNCOzs7OztBQUlELFdBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUs7QUFDbkMsYUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7O0FBR3pCLFdBQVEsR0FBRyxXQXpDTSxLQUFLLENBeUNELGlCQUFRLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDM0Q7UUFFRCxlQUFlLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQzFDLE9BQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQzlCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDakM7UUFFRCxVQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxLQUFLO0FBQ3JDLFVBQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQ3BELENBQUMsZ0JBQWdCLEdBQUUsV0FoRGtELGFBQWEsRUFnRGpELFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLGdCQUFnQixHQUFFLFdBakRrRCxh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QUFTLENBQUMsaUJBQWlCLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9sZXguanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCBMb2MsIHtQb3MsIFN0YXJ0TGluZSwgU3RhcnRQb3MsIFN0YXJ0Q29sdW1uLCBzaW5nbGVDaGFyTG9jfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBHcm91cCwgR19CbG9jaywgR19CcmFja2V0LCBHX0xpbmUsIEdfUGFyZW50aGVzaXMsIEdfU3BhY2UsIEdfUXVvdGUsIGlzS2V5d29yZCxcblx0S2V5d29yZCwgS1dfQXNzaWduTXV0YWJsZSwgS1dfRG90LCBLV19FbGxpcHNpcywgS1dfRm9jdXMsIEtXX0Z1biwgS1dfRnVuRG8sIEtXX0Z1bkdlbixcblx0S1dfRnVuR2VuRG8sIEtXX0Z1blRoaXMsIEtXX0Z1blRoaXNEbywgS1dfRnVuVGhpc0dlbiwgS1dfRnVuVGhpc0dlbkRvLCBLV19MYXp5LCBLV19Mb2NhbE11dGF0ZSxcblx0S1dfT2JqQXNzaWduLCBLV19SZWdpb24sIEtXX1RvZG8sIEtXX1R5cGUsIE5hbWUsIG9wS2V5d29yZEtpbmRGcm9tTmFtZSwgc2hvd0dyb3VwS2luZFxuXHR9IGZyb20gJy4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi91dGlsJ1xuXG4vKlxuVGhpcyBwcm9kdWNlcyB0aGUgVG9rZW4gdHJlZSAoc2VlIFRva2VuLmpzKS5cbiovXG5leHBvcnQgZGVmYXVsdCAoY29udGV4dCwgc291cmNlU3RyaW5nKSA9PiB7XG5cdC8qXG5cdExleGluZyBhbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChXaGVuIHN0cmluZyByZWFjaGVzIGVuZCBgY2hhckNvZGVBdGAgd2lsbCByZXR1cm4gYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcblxcMGBcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBHUk9VUElOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBXZSBvbmx5IGV2ZXIgd3JpdGUgdG8gdGhlIGlubmVybW9zdCBHcm91cDtcblx0Ly8gd2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuXHQvLyBOb3RlIHRoYXQgYGN1ckdyb3VwYCBpcyBjb25jZXB0dWFsbHkgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGJ1dCBpcyBub3Qgc3RvcmVkIGluIGBzdGFja2AuXG5cdGNvbnN0IGdyb3VwU3RhY2sgPSBbXVxuXHRsZXQgY3VyR3JvdXBcblx0Y29uc3Rcblx0XHRhZGRUb0N1cnJlbnRHcm91cCA9IHRva2VuID0+IHtcblx0XHRcdGN1ckdyb3VwLnN1YlRva2Vucy5wdXNoKHRva2VuKVxuXHRcdH0sXG5cblx0XHRkcm9wR3JvdXAgPSAoKSA9PiB7XG5cdFx0XHRjdXJHcm91cCA9IGdyb3VwU3RhY2sucG9wKClcblx0XHR9LFxuXG5cdFx0Ly8gUGF1c2Ugd3JpdGluZyB0byBjdXJHcm91cCBpbiBmYXZvciBvZiB3cml0aW5nIHRvIGEgc3ViLWdyb3VwLlxuXHRcdC8vIFdoZW4gdGhlIHN1Yi1ncm91cCBmaW5pc2hlcyB3ZSB3aWxsIHBvcCB0aGUgc3RhY2sgYW5kIHJlc3VtZSB3cml0aW5nIHRvIGl0cyBwYXJlbnQuXG5cdFx0b3Blbkdyb3VwID0gKG9wZW5Qb3MsIGdyb3VwS2luZCkgPT4ge1xuXHRcdFx0Z3JvdXBTdGFjay5wdXNoKGN1ckdyb3VwKVxuXHRcdFx0Ly8gQ29udGVudHMgd2lsbCBiZSBhZGRlZCB0byBieSBgYWRkVG9DdXJyZW50R3JvdXBgLlxuXHRcdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0Y3VyR3JvdXAgPSBuZXcgR3JvdXAobmV3IExvYyhvcGVuUG9zLCBudWxsKSwgW10sIGdyb3VwS2luZClcblx0XHR9LFxuXG5cdFx0bWF5YmVDbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0XHRcdF9jbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdGNsb3NlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0Y29udGV4dC5jaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdFx0XHRgVHJ5aW5nIHRvIGNsb3NlICR7c2hvd0dyb3VwS2luZChjbG9zZUtpbmQpfSwgYCArXG5cdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRfY2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRsZXQganVzdENsb3NlZCA9IGN1ckdyb3VwXG5cdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR19TcGFjZToge1xuXHRcdFx0XHRcdGNvbnN0IHNpemUgPSBqdXN0Q2xvc2VkLnN1YlRva2Vucy5sZW5ndGhcblx0XHRcdFx0XHRpZiAoc2l6ZSAhPT0gMClcblx0XHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoc2l6ZSA9PT0gMSA/IGp1c3RDbG9zZWQuc3ViVG9rZW5zWzBdIDoganVzdENsb3NlZClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRjb250ZXh0Lndhcm4oanVzdENsb3NlZC5sb2MsICdVbm5lY2Vzc2FyeSBzcGFjZS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBHX0xpbmU6XG5cdFx0XHRcdFx0Ly8gTGluZSBtdXN0IGhhdmUgY29udGVudC5cblx0XHRcdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlcmUgd2FzIGp1c3QgYSBjb21tZW50LlxuXHRcdFx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgR19CbG9jazpcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSwgY2xvc2VQb3MsICdFbXB0eSBibG9jay4nKVxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5ID0gcG9zID0+IHtcblx0XHRcdGFzc2VydChjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0XHRcdGRyb3BHcm91cCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdfUGFyZW50aGVzaXMpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VQYXJlbnRoZXNpcyA9IGxvYyA9PiB7XG5cdFx0XHRfY2xvc2VHcm91cChsb2Muc3RhcnQsIEdfU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3VwKGxvYy5lbmQsIEdfUGFyZW50aGVzaXMpXG5cdFx0fSxcblxuXHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50ID0gcG9zID0+IHtcblx0XHRcdGNsb3NlTGluZShwb3MpXG5cdFx0XHRjbG9zZUdyb3VwKHBvcywgR19CbG9jaylcblx0XHRcdC8vIEl0J3MgT0sgdG8gYmUgbWlzc2luZyBhIGNsb3NpbmcgcGFyZW50aGVzaXMgaWYgdGhlcmUncyBhIGJsb2NrLiBFLmcuOlxuXHRcdFx0Ly8gYSAoYlxuXHRcdFx0Ly9cdGMgfCBubyBjbG9zaW5nIHBhcmVuIGhlcmVcblx0XHRcdHdoaWxlIChjdXJHcm91cC5raW5kID09PSBHX1BhcmVudGhlc2lzIHx8IGN1ckdyb3VwLmtpbmQgPT09IEdfU3BhY2UpXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgY3VyR3JvdXAua2luZClcblx0XHR9LFxuXG5cdFx0Ly8gV2hlbiBzdGFydGluZyBhIG5ldyBsaW5lLCBhIHNwYWNlZCBncm91cCBpcyBjcmVhdGVkIGltcGxpY2l0bHkuXG5cdFx0b3BlbkxpbmUgPSBwb3MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19MaW5lKVxuXHRcdFx0b3Blbkdyb3VwKHBvcywgR19TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VMaW5lID0gcG9zID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHX1NwYWNlKVxuXHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KClcblx0XHRcdGNsb3NlR3JvdXAocG9zLCBHX0xpbmUpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gZW5jb3VudGVyaW5nIGEgc3BhY2UsIGl0IGJvdGggY2xvc2VzIGFuZCBvcGVucyBhIHNwYWNlZCBncm91cC5cblx0XHRzcGFjZSA9IGxvYyA9PiB7XG5cdFx0XHRtYXliZUNsb3NlR3JvdXAobG9jLnN0YXJ0LCBHX1NwYWNlKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdfU3BhY2UpXG5cdFx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIElURVJBVElORyBUSFJPVUdIIFNPVVJDRVNUUklOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvKlxuXHRUaGVzZSBhcmUga2VwdCB1cC10by1kYXRlIGFzIHdlIGl0ZXJhdGUgdGhyb3VnaCBzb3VyY2VTdHJpbmcuXG5cdEV2ZXJ5IGFjY2VzcyB0byBpbmRleCBoYXMgY29ycmVzcG9uZGluZyBjaGFuZ2VzIHRvIGxpbmUgYW5kL29yIGNvbHVtbi5cblx0VGhpcyBhbHNvIGV4cGxhaW5zIHdoeSB0aGVyZSBhcmUgZGlmZmVyZW50IGZ1bmN0aW9ucyBmb3IgbmV3bGluZXMgdnMgb3RoZXIgY2hhcmFjdGVycy5cblx0Ki9cblx0bGV0IGluZGV4ID0gMCwgbGluZSA9IFN0YXJ0TGluZSwgY29sdW1uID0gU3RhcnRDb2x1bW5cblxuXHQvKlxuXHROT1RFOiBXZSB1c2UgY2hhcmFjdGVyICpjb2RlcyogZm9yIGV2ZXJ5dGhpbmcuXG5cdENoYXJhY3RlcnMgYXJlIG9mIHR5cGUgTnVtYmVyIGFuZCBub3QganVzdCBTdHJpbmdzIG9mIGxlbmd0aCBvbmUuXG5cdCovXG5cdGNvbnN0XG5cdFx0cG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBjb2x1bW4pLFxuXG5cdFx0cGVlayA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KSxcblx0XHRwZWVrTmV4dCA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSksXG5cdFx0cGVla1ByZXYgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDEpLFxuXHRcdHBlZWsyQmVmb3JlID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAyKSxcblxuXHRcdC8vIE1heSBlYXQgYSBOZXdsaW5lLlxuXHRcdC8vIENhbGxlciAqbXVzdCogY2hlY2sgZm9yIHRoYXQgY2FzZSBhbmQgaW5jcmVtZW50IGxpbmUhXG5cdFx0ZWF0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2hhciA9IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4KVxuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdHJldHVybiBjaGFyXG5cdFx0fSxcblx0XHRza2lwID0gZWF0LFxuXG5cdFx0Ly8gY2hhclRvRWF0IG11c3Qgbm90IGJlIE5ld2xpbmUuXG5cdFx0dHJ5RWF0ID0gY2hhclRvRWF0ID0+IHtcblx0XHRcdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhclRvRWF0XG5cdFx0XHRpZiAoY2FuRWF0KSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHRcdH1cblx0XHRcdHJldHVybiBjYW5FYXRcblx0XHR9LFxuXG5cdFx0bXVzdEVhdCA9IChjaGFyVG9FYXQsIHByZWNlZGVkQnkpID0+IHtcblx0XHRcdGNvbnN0IGNhbkVhdCA9IHRyeUVhdChjaGFyVG9FYXQpXG5cdFx0XHRjb250ZXh0LmNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRgJHtjb2RlKHByZWNlZGVkQnkpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5ICR7c2hvd0NoYXIoY2hhclRvRWF0KX1gKVxuXHRcdH0sXG5cblx0XHR0cnlFYXROZXdsaW5lID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBOZXdsaW5lXG5cdFx0XHRpZiAoY2FuRWF0KSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZXIgbXVzdCBlbnN1cmUgdGhhdCBiYWNraW5nIHVwIG5DaGFyc1RvQmFja1VwIGNoYXJhY3RlcnMgYnJpbmdzIHVzIHRvIG9sZFBvcy5cblx0XHRzdGVwQmFja01hbnkgPSAob2xkUG9zLCBuQ2hhcnNUb0JhY2tVcCkgPT4ge1xuXHRcdFx0aW5kZXggPSBpbmRleCAtIG5DaGFyc1RvQmFja1VwXG5cdFx0XHRsaW5lID0gb2xkUG9zLmxpbmVcblx0XHRcdGNvbHVtbiA9IG9sZFBvcy5jb2x1bW5cblx0XHR9LFxuXG5cdFx0Ly8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG5cdFx0Ly8gY2hhcmFjdGVyUHJlZGljYXRlIG11c3QgKm5vdCogYWNjZXB0IE5ld2xpbmUuXG5cdFx0Ly8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuXHRcdHRha2VXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHR0YWtlV2hpbGVXaXRoUHJldiA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCAtIDEsIGNoYXJhY3RlclByZWRpY2F0ZSksXG5cdFx0X3Rha2VXaGlsZVdpdGhTdGFydCA9IChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpID0+IHtcblx0XHRcdHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdFx0XHRyZXR1cm4gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdH0sXG5cblx0XHRza2lwV2hpbGVFcXVhbHMgPSBjaGFyID0+XG5cdFx0XHRza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKSxcblxuXHRcdHNraXBSZXN0T2ZMaW5lID0gKCkgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gIT09IE5ld2xpbmUpLFxuXG5cdFx0ZWF0UmVzdE9mTGluZSA9ICgpID0+XG5cdFx0XHR0YWtlV2hpbGUoXyA9PiBfICE9PSBOZXdsaW5lKSxcblxuXHRcdHNraXBXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0XHRcdHdoaWxlIChjaGFyYWN0ZXJQcmVkaWNhdGUocGVlaygpKSlcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIGRpZmZcblx0XHRcdHJldHVybiBkaWZmXG5cdFx0fSxcblxuXHRcdC8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG5cdFx0Ly8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuXHRcdHNraXBOZXdsaW5lcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0TGluZSA9IGxpbmVcblx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0d2hpbGUgKHBlZWsoKSA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdH1cblx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxuXHRcdH1cblxuXHQvLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuXHQvKlxuXHRjb25zdFxuXHRcdGNoZWNrUG9zID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0XHRcdGlmIChwLmxpbmUgIT09IGxpbmUgfHwgcC5jb2x1bW4gIT09IGNvbHVtbilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxuXHRcdH0sXG5cdFx0X2luZGV4VG9Qb3MgPSBuZXcgTWFwKCksXG5cdFx0X2dldENvcnJlY3RQb3MgPSAoKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXggPT09IDApXG5cdFx0XHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRcdFx0bGV0IG9sZFBvcywgb2xkSW5kZXhcblx0XHRcdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRcdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdFx0XHRpZiAob2xkUG9zICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdFx0XHR9XG5cdFx0XHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdFx0XHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0XHRcdGlmIChzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChvbGRJbmRleCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0XHRcdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRcdFx0X2luZGV4VG9Qb3Muc2V0KGluZGV4LCBwKVxuXHRcdFx0cmV0dXJuIHBcblx0XHR9XG5cdCovXG5cblx0Lypcblx0SW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuXHRXaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cblx0Ki9cblx0Y29uc3QgbGV4UGxhaW4gPSBpc0luUXVvdGUgPT4ge1xuXHRcdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdFx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdFx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0XHRsZXQgaW5kZW50ID0gMFxuXG5cdFx0Ly8gTWFrZSBjbG9zdXJlcyBub3cgcmF0aGVyIHRoYW4gaW5zaWRlIHRoZSBsb29wLlxuXHRcdC8vIFRoaXMgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgYXMgb2Ygbm9kZSB2MC4xMS4xNC5cblxuXHRcdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdFx0bGV0IHN0YXJ0Q29sdW1uXG5cdFx0Y29uc3Rcblx0XHRcdHN0YXJ0UG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbiksXG5cdFx0XHRsb2MgPSAoKSA9PiBuZXcgTG9jKHN0YXJ0UG9zKCksIHBvcygpKSxcblx0XHRcdGtleXdvcmQgPSBraW5kID0+XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSksXG5cdFx0XHRmdW5LZXl3b3JkID0ga2luZCA9PiB7XG5cdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9LFxuXHRcdFx0ZWF0SW5kZW50ID0gKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvcHRJbmRlbnQgPSBjb250ZXh0Lm9wdHMuaW5kZW50KClcblx0XHRcdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdFx0XHRjb25zdCBpbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGNvbnRleHQuY2hlY2socGVlaygpICE9PSBTcGFjZSwgcG9zLCAnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScpXG5cdFx0XHRcdFx0cmV0dXJuIGluZGVudFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhTcGFjZSlcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdFx0XHRyZXR1cm4gc3BhY2VzIC8gb3B0SW5kZW50XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdGNvbnN0XG5cdFx0XHRoYW5kbGVOYW1lID0gKCkgPT4ge1xuXHRcdFx0XHRjb250ZXh0LmNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrUHJldigpKSwgbG9jKCksICgpID0+XG5cdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKHBlZWtQcmV2KCkpfWApXG5cblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtXX0ZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleXdvcmRLaW5kID0gb3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpXG5cdFx0XHRcdGlmIChrZXl3b3JkS2luZCAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRcdGlmIChrZXl3b3JkS2luZCA9PT0gS1dfUmVnaW9uKSB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBFYXQgYW5kIHB1dCBpdCBpbiBSZWdpb24gZXhwcmVzc2lvblxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19SZWdpb24pXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChrZXl3b3JkS2luZCA9PT0gS1dfVG9kbylcblx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKGtleXdvcmRLaW5kKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0XHRjYXNlIE51bGxDaGFyOlxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2U6XG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIFF1b3RlOlxuXHRcdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRcdGNhc2UgT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2xvc2VQYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHX1BhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHX0JyYWNrZXQpKVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKHN0YXJ0UG9zKCksIEdfQnJhY2tldClcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0X2Nsb3NlR3JvdXAoc3RhcnRQb3MoKSwgR19TcGFjZSlcblx0XHRcdFx0XHRjbG9zZUdyb3VwKHBvcygpLCBHX0JyYWNrZXQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBTcGFjZTpcblx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjb250ZXh0LmNoZWNrKCFpc0luUXVvdGUsIGxvYywgJ1F1b3RlIGludGVycG9sYXRpb24gY2Fubm90IGNvbnRhaW4gbmV3bGluZScpXG5cdFx0XHRcdFx0Y29udGV4dC53YXJuSWYocGVlazJCZWZvcmUoKSA9PT0gU3BhY2UsIHBvcywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cblx0XHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRcdGluZGVudCA9IGVhdEluZGVudCgpXG5cdFx0XHRcdFx0aWYgKGluZGVudCA+IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpbmRlbnQgPT09IG9sZEluZGVudCArIDEsIGxvYyxcblx0XHRcdFx0XHRcdFx0J0xpbmUgaXMgaW5kZW50ZWQgbW9yZSB0aGFuIG9uY2UnKVxuXHRcdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtXX0xhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdfU3BhY2UpXG5cdFx0XHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5lbmQsIEdfU3BhY2UpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5zdGFydCwgR19CbG9jaylcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdFx0Y2xvc2VHcm91cHNGb3JEZWRlbnQobC5zdGFydClcblx0XHRcdFx0XHRcdGNsb3NlTGluZShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBUYWI6XG5cdFx0XHRcdFx0Ly8gV2UgYWx3YXlzIGVhdCB0YWJzIGluIHRoZSBOZXdsaW5lIGhhbmRsZXIsXG5cdFx0XHRcdFx0Ly8gc28gdGhpcyB3aWxsIG9ubHkgaGFwcGVuIGluIHRoZSBtaWRkbGUgb2YgYSBsaW5lLlxuXHRcdFx0XHRcdGNvbnRleHQuZmFpbChsb2MoKSwgJ1RhYiBtYXkgb25seSBiZSB1c2VkIHRvIGluZGVudCcpXG5cblx0XHRcdFx0Ly8gRlVOXG5cblx0XHRcdFx0Y2FzZSBCYW5nOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuRG8pXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBUaWxkZTpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhbmcpKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJ34hJylcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuR2VuRG8pXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuR2VuKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS1dfTGF6eSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEJhcjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KFNwYWNlKSB8fCB0cnlFYXQoVGFiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdGV4dCA9IGVhdFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdFx0Y29udGV4dC5jaGVjayhcblx0XHRcdFx0XHRcdFx0Y3VyR3JvdXAua2luZCA9PT0gR19MaW5lICYmIGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDAsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdFx0YERvYyBjb21tZW50IG11c3QgZ28gb24gaXRzIG93biBsaW5lLiAoRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/KWApXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgRG9jQ29tbWVudChsb2MoKSwgdGV4dCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdC8vIG5vbi1kb2MgY29tbWVudFxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS1dfRnVuKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdFx0Y2FzZSBIeXBoZW46XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTjA6IGNhc2UgTjE6IGNhc2UgTjI6IGNhc2UgTjM6IGNhc2UgTjQ6XG5cdFx0XHRcdGNhc2UgTjU6IGNhc2UgTjY6IGNhc2UgTjc6IGNhc2UgTjg6IGNhc2UgTjk6XG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0XHRicmVha1xuXG5cblx0XHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0XHRjYXNlIERvdDoge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBwZWVrKClcblx0XHRcdFx0XHRpZiAobmV4dCA9PT0gU3BhY2UgfHwgbmV4dCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRcdFx0Ly8gT2JqTGl0IGFzc2lnbiBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdC8vIFdlIGNhbid0IGp1c3QgY3JlYXRlIGEgbmV3IEdyb3VwIGhlcmUgYmVjYXVzZSB3ZSB3YW50IHRvXG5cdFx0XHRcdFx0XHQvLyBlbnN1cmUgaXQncyBub3QgcGFydCBvZiB0aGUgcHJlY2VkaW5nIG9yIGZvbGxvd2luZyBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX09iakFzc2lnbilcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXMpXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhbmcgJiYgcGVla05leHQoKSA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19GdW5UaGlzRG8pXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IFRpbGRlKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcufiEnKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW5Ebylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4nKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Z1blRoaXNHZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHBlZWsoKSA9PT0gRG90ICYmIHBlZWtOZXh0KCkgPT09IERvdCkge1xuXHRcdFx0XHRcdFx0ZWF0KClcblx0XHRcdFx0XHRcdGVhdCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0VsbGlwc2lzKVxuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Eb3QpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgQ29sb246XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDb2xvbikpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoRXF1YWwsICc6OicpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX0Fzc2lnbk11dGFibGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoRXF1YWwpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLV19Mb2NhbE11dGF0ZSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtXX1R5cGUpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIEFtcGVyc2FuZDogY2FzZSBCYWNrc2xhc2g6IGNhc2UgQmFja3RpY2s6IGNhc2UgQ2FyZXQ6XG5cdFx0XHRcdGNhc2UgQ29tbWE6IGNhc2UgUGVyY2VudDogY2FzZSBTZW1pY29sb246XG5cdFx0XHRcdFx0Y29udGV4dC5mYWlsKGxvYywgYFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKGNoYXJhY3RlckVhdGVuKX1gKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGxleFF1b3RlID0gaW5kZW50ID0+IHtcblx0XHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHRcdC8vIEluZGVudGVkIHF1b3RlIGlzIGNoYXJhY3Rlcml6ZWQgYnkgYmVpbmcgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBuZXdsaW5lLlxuXHRcdC8vIFRoZSBuZXh0IGxpbmUgKm11c3QqIGhhdmUgc29tZSBjb250ZW50IGF0IHRoZSBuZXh0IGluZGVudGF0aW9uLlxuXHRcdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0XHRpZiAoaXNJbmRlbnRlZCkge1xuXHRcdFx0Y29uc3QgYWN0dWFsSW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdGNvbnRleHQuY2hlY2soYWN0dWFsSW5kZW50ID09PSBxdW90ZUluZGVudCwgcG9zLFxuXHRcdFx0XHQnSW5kZW50ZWQgcXVvdGUgbXVzdCBoYXZlIGV4YWN0bHkgb25lIG1vcmUgaW5kZW50IHRoYW4gcHJldmlvdXMgbGluZS4nKVxuXHRcdH1cblxuXHRcdC8vIEN1cnJlbnQgc3RyaW5nIGxpdGVyYWwgcGFydCBvZiBxdW90ZSB3ZSBhcmUgcmVhZGluZy5cblx0XHQvLyBUaGlzIGlzIGEgcmF3IHZhbHVlLlxuXHRcdGxldCByZWFkID0gJydcblxuXHRcdGNvbnN0IG1heWJlT3V0cHV0UmVhZCA9ICgpID0+IHtcblx0XHRcdGlmIChyZWFkICE9PSAnJykge1xuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0XHRyZWFkID0gJydcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBsb2NTaW5nbGUgPSAoKSA9PiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXG5cdFx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBHX1F1b3RlKVxuXG5cdFx0ZWF0Q2hhcnM6IHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBjaGFyID0gZWF0KClcblx0XHRcdHN3aXRjaCAoY2hhcikge1xuXHRcdFx0XHRjYXNlIEJhY2tzbGFzaDoge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBlYXQoKVxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgYFxcXFwke1N0cmluZy5mcm9tQ2hhckNvZGUobmV4dCl9YFxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gU2luY2UgdGhlc2UgY29tcGlsZSB0byB0ZW1wbGF0ZSBsaXRlcmFscywgaGF2ZSB0byByZW1lbWJlciB0byBlc2NhcGUuXG5cdFx0XHRcdGNhc2UgQmFja3RpY2s6XG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyAnXFxcXGAnXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2U6IHtcblx0XHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRG9uJ3QgbmVlZCBgY2FzZSBOdWxsQ2hhcjpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdFx0b3JpZ2luYWxQb3MuY29sdW1uID0gb3JpZ2luYWxQb3MuY29sdW1uIC0gMVxuXG5cdFx0XHRcdFx0Y29udGV4dC5jaGVjayhpc0luZGVudGVkLCBsb2NTaW5nbGUsICdVbmNsb3NlZCBxdW90ZS4nKVxuXHRcdFx0XHRcdC8vIEFsbG93IGV4dHJhIGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0XHRjb25zdCBuZXdJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGlmIChuZXdJbmRlbnQgPCBxdW90ZUluZGVudCkge1xuXHRcdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdFx0Ly8gVW5kbyByZWFkaW5nIHRoZSB0YWJzIGFuZCBuZXdsaW5lLlxuXHRcdFx0XHRcdFx0c3RlcEJhY2tNYW55KG9yaWdpbmFsUG9zLCBudW1OZXdsaW5lcyArIG5ld0luZGVudClcblx0XHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IE5ld2xpbmUpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0cmVhZCA9IHJlYWQgK1xuXHRcdFx0XHRcdFx0XHQnXFxuJy5yZXBlYXQobnVtTmV3bGluZXMpICsgJ1xcdCcucmVwZWF0KG5ld0luZGVudCAtIHF1b3RlSW5kZW50KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRpZiAoIWlzSW5kZW50ZWQpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdC8vIEVsc2UgZmFsbHRocm91Z2hcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHRcdFx0XHQvLyBidXQgdGhpcyB0dXJuZWQgb3V0IHRvIGJlIGJldHRlci5cblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcilcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdGNsb3NlR3JvdXAocG9zKCksIEdfUXVvdGUpXG5cdH1cblxuXHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKFN0YXJ0UG9zLCBudWxsKSwgW10sIEdfQmxvY2spXG5cdG9wZW5MaW5lKFN0YXJ0UG9zKVxuXG5cdGxleFBsYWluKGZhbHNlKVxuXG5cdGNvbnN0IGVuZFBvcyA9IHBvcygpXG5cdGNsb3NlTGluZShlbmRQb3MpXG5cdGFzc2VydChpc0VtcHR5KGdyb3VwU3RhY2spKVxuXHRjdXJHcm91cC5sb2MuZW5kID0gZW5kUG9zXG5cdHJldHVybiBjdXJHcm91cFxufVxuXG5jb25zdCBjYyA9IF8gPT4gXy5jaGFyQ29kZUF0KDApXG5jb25zdFxuXHRBbXBlcnNhbmQgPSBjYygnJicpLFxuXHRCYWNrc2xhc2ggPSBjYygnXFxcXCcpLFxuXHRCYWNrdGljayA9IGNjKCdgJyksXG5cdEJhbmcgPSBjYygnIScpLFxuXHRCYXIgPSBjYygnfCcpLFxuXHRDYXJldCA9IGNjKCdeJyksXG5cdENsb3NlQnJhY2UgPSBjYygnfScpLFxuXHRDbG9zZUJyYWNrZXQgPSBjYygnXScpLFxuXHRDbG9zZVBhcmVudGhlc2lzID0gY2MoJyknKSxcblx0Q29sb24gPSBjYygnOicpLFxuXHRDb21tYSA9IGNjKCcsJyksXG5cdERvdCA9IGNjKCcuJyksXG5cdEVxdWFsID0gY2MoJz0nKSxcblx0SHlwaGVuID0gY2MoJy0nKSxcblx0TGV0dGVyQiA9IGNjKCdiJyksXG5cdExldHRlck8gPSBjYygnbycpLFxuXHRMZXR0ZXJYID0gY2MoJ3gnKSxcblx0TjAgPSBjYygnMCcpLFxuXHROMSA9IGNjKCcxJyksXG5cdE4yID0gY2MoJzInKSxcblx0TjMgPSBjYygnMycpLFxuXHRONCA9IGNjKCc0JyksXG5cdE41ID0gY2MoJzUnKSxcblx0TjYgPSBjYygnNicpLFxuXHRONyA9IGNjKCc3JyksXG5cdE44ID0gY2MoJzgnKSxcblx0TjkgPSBjYygnOScpLFxuXHROZXdsaW5lID0gY2MoJ1xcbicpLFxuXHROdWxsQ2hhciA9IGNjKCdcXDAnKSxcblx0T3BlbkJyYWNlID0gY2MoJ3snKSxcblx0T3BlbkJyYWNrZXQgPSBjYygnWycpLFxuXHRPcGVuUGFyZW50aGVzaXMgPSBjYygnKCcpLFxuXHRQZXJjZW50ID0gY2MoJyUnKSxcblx0UXVvdGUgPSBjYygnXCInKSxcblx0U2VtaWNvbG9uID0gY2MoJzsnKSxcblx0U3BhY2UgPSBjYygnICcpLFxuXHRUYWIgPSBjYygnXFx0JyksXG5cdFRpbGRlID0gY2MoJ34nKVxuXG5jb25zdFxuXHRzaG93Q2hhciA9IGNoYXIgPT4gY29kZShTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpKSxcblx0X2NoYXJQcmVkID0gKGNoYXJzLCBuZWdhdGUpID0+IHtcblx0XHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSA9IGkgKyAxKVxuXHRcdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRcdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0XHRyZXR1cm4gRnVuY3Rpb24oJ2NoJywgc3JjKVxuXHR9LFxuXHRpc0RpZ2l0ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5JyksXG5cdGlzRGlnaXRCaW5hcnkgPSBfY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IF9jaGFyUHJlZCgnMDEyMzQ1NjcnKSxcblx0aXNEaWdpdEhleCA9IF9jaGFyUHJlZCgnMDEyMzQ1Njc4OWFiY2RlZicpLFxuXG5cdC8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG5cdHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgIyVeJlxcXFxcXCc7LCcsXG5cdGlzTmFtZUNoYXJhY3RlciA9IF9jaGFyUHJlZCgnKClbXXt9Ljp8IFxcblxcdFwiJyArIHJlc2VydmVkQ2hhcmFjdGVycywgdHJ1ZSlcbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
