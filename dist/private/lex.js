(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', 'esast/dist/Loc', '../CompileError', './context', './MsAst', './Token', './util'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('esast/dist/Loc'), require('../CompileError'), require('./context'), require('./MsAst'), require('./Token'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.Loc, global.CompileError, global.context, global.MsAst, global.Token, global.util);
		global.lex = mod.exports;
	}
})(this, function (exports, module, _esastDistLoc, _CompileError, _context, _MsAst, _Token, _util) {
	'use strict';

	module.exports = lex;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Loc = _interopRequireDefault(_esastDistLoc);

	/**
 Lexes the source code into {@link Token}s.
 The Mason lexer also groups tokens as part of lexing.
 This makes writing a recursive-descent parser easy.
 See {@link Group}.
 
 @param {string} sourceString
 @return {Group<Groups.Block>}
 	Block token representing the whole module.
 */

	function lex(sourceString) {
		// Algorithm requires trailing newline to close any blocks.
		(0, _context.check)(sourceString.endsWith('\n'), _esastDistLoc.StartLoc, 'Source code must end in newline.');

		/*
  Use a 0-terminated string so that we can use `0` as a switch case.
  This is faster than checking whether index === length.
  (If we check past the end of the string we get `NaN`, which can't be switched on.)
  */
		sourceString = `${ sourceString }\0`;

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
			(0, _context.check)(closeKind === curGroup.kind, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened ${ (0, _Token.showGroupKind)(curGroup.kind) }`);
			_closeGroup(closePos, closeKind);
		},
		      _closeGroup = (closePos, closeKind) => {
			let justClosed = curGroup;
			dropGroup();
			justClosed.loc.end = closePos;
			switch (closeKind) {
				case _Token.Groups.Space:
					{
						const size = justClosed.subTokens.length;
						if (size !== 0)
							// Spaced should always have at least two elements.
							addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);else (0, _context.warn)(justClosed.loc, 'Unnecessary space.');
						break;
					}
				case _Token.Groups.Line:
					// Line must have content.
					// This can happen if there was just a comment.
					if (!(0, _util.isEmpty)(justClosed.subTokens)) addToCurrentGroup(justClosed);
					break;
				case _Token.Groups.Block:
					(0, _context.check)(!(0, _util.isEmpty)(justClosed.subTokens), closePos, 'Empty block.');
					addToCurrentGroup(justClosed);
					break;
				default:
					addToCurrentGroup(justClosed);
			}
		},
		      closeSpaceOKIfEmpty = pos => {
			(0, _util.assert)(curGroup.kind === _Token.Groups.Space);
			if (curGroup.subTokens.length === 0) dropGroup();else _closeGroup(pos, _Token.Groups.Space);
		},
		      openParenthesis = loc => {
			openGroup(loc.start, _Token.Groups.Parenthesis);
			openGroup(loc.end, _Token.Groups.Space);
		},
		      closeParenthesis = loc => {
			_closeGroup(loc.start, _Token.Groups.Space);
			closeGroup(loc.end, _Token.Groups.Parenthesis);
		},
		      closeGroupsForDedent = pos => {
			closeLine(pos);
			closeGroup(pos, _Token.Groups.Block);
			// It's OK to be missing a closing parenthesis if there's a block. E.g.:
			// a (b
			//	c | no closing paren here
			while (curGroup.kind === _Token.Groups.Parenthesis || curGroup.kind === _Token.Groups.Space) _closeGroup(pos, curGroup.kind);
		},
		     

		// When starting a new line, a spaced group is created implicitly.
		openLine = pos => {
			openGroup(pos, _Token.Groups.Line);
			openGroup(pos, _Token.Groups.Space);
		},
		      closeLine = pos => {
			if (curGroup.kind === _Token.Groups.Space) closeSpaceOKIfEmpty();
			closeGroup(pos, _Token.Groups.Line);
		},
		     

		// When encountering a space, it both closes and opens a spaced group.
		space = loc => {
			maybeCloseGroup(loc.start, _Token.Groups.Space);
			openGroup(loc.end, _Token.Groups.Space);
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
			(0, _context.check)(canEat, pos, () => `${ (0, _CompileError.code)(precededBy) } must be followed by ${ showChar(charToEat) }`);
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
				const optIndent = _context.options.indent();
				if (optIndent === '\t') {
					const indent = skipWhileEquals(Tab);
					(0, _context.check)(peek() !== Space, pos, 'Line begins in a space');
					return indent;
				} else {
					const spaces = skipWhileEquals(Space);
					(0, _context.check)(spaces % optIndent === 0, pos, () => `Indentation spaces must be a multiple of ${ optIndent }`);
					return spaces / optIndent;
				}
			};

			const handleName = () => {
				(0, _context.check)(isNameCharacter(peekPrev()), loc(), () => `Reserved character ${ showChar(peekPrev()) }`);

				// All other characters should be handled in a case above.
				const name = takeWhileWithPrev(isNameCharacter);
				if (name.endsWith('_')) {
					if (name.length > 1) _handleName(name.slice(0, name.length - 1));
					keyword(_Token.Keywords.Focus);
				} else _handleName(name);
			},
			      _handleName = name => {
				(0, _util.ifElse)((0, _Token.opKeywordKindFromName)(name), kind => {
					switch (kind) {
						case _Token.Keywords.Region:
							skipRestOfLine();
							keyword(_Token.Keywords.Region);
							break;
						case _Token.Keywords.Todo:
							// TODO: warn
							skipRestOfLine();
							break;
						default:
							keyword(kind);
					}
				}, () => {
					addToCurrentGroup(new _Token.Name(loc(), name));
				});
			};

			while (true) {
				startColumn = column;
				const characterEaten = eat();
				// Generally, the type of a token is determined by the first character.
				switch (characterEaten) {
					case NullChar:
						return;
					case CloseBrace:
						(0, _context.check)(isInQuote, loc, () => `Reserved character ${ showChar(CloseBrace) }`);
						return;
					case Quote:
						lexQuote(indent);
						break;

					// GROUPS

					case OpenParenthesis:
						if (tryEat(CloseParenthesis)) addToCurrentGroup(new _Token.Group(loc(), [], _Token.Groups.Parenthesis));else openParenthesis(loc());
						break;
					case OpenBracket:
						if (tryEat(CloseBracket)) addToCurrentGroup(new _Token.Group(loc(), [], _Token.Groups.Bracket));else {
							openGroup(startPos(), _Token.Groups.Bracket);
							openGroup(pos(), _Token.Groups.Space);
						}
						break;
					case CloseParenthesis:
						closeParenthesis(loc());
						break;
					case CloseBracket:
						_closeGroup(startPos(), _Token.Groups.Space);
						closeGroup(pos(), _Token.Groups.Bracket);
						break;
					case Space:
						space(loc());
						break;
					case Newline:
						{
							(0, _context.check)(!isInQuote, loc, 'Quote interpolation cannot contain newline');
							if (peek2Before() === Space) (0, _context.warn)(pos, 'Line ends in a space.');

							// Skip any blank lines.
							skipNewlines();
							const oldIndent = indent;
							indent = eatIndent();
							if (indent > oldIndent) {
								(0, _context.check)(indent === oldIndent + 1, loc, 'Line is indented more than once');
								const l = loc();
								// Block at end of line goes in its own spaced group.
								// However, `~` preceding a block goes in a group with it.
								if ((0, _util.isEmpty)(curGroup.subTokens) || !(0, _Token.isKeyword)(_Token.Keywords.Lazy, (0, _util.last)(curGroup.subTokens))) {
									if (curGroup.kind === _Token.Groups.Space) closeSpaceOKIfEmpty(l.start);
									openGroup(l.end, _Token.Groups.Space);
								}
								openGroup(l.start, _Token.Groups.Block);
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
						(0, _context.fail)(loc(), 'Tab may only be used to indent');

					// FUN

					case Bang:
						if (tryEat(Bar)) funKeyword(_Token.Keywords.FunDo);else handleName();
						break;
					case Tilde:
						if (tryEat(Bang)) {
							mustEat(Bar, '~!');
							funKeyword(_Token.Keywords.FunGenDo);
						} else if (tryEat(Bar)) funKeyword(_Token.Keywords.FunGen);else keyword(_Token.Keywords.Lazy);
						break;
					case Bar:
						if (tryEat(Space) || tryEat(Tab)) {
							const text = eatRestOfLine();
							closeSpaceOKIfEmpty(startPos());
							if (!(curGroup.kind === _Token.Groups.Line && curGroup.subTokens.length === 0)) (0, _context.fail)(loc, `Doc comment must go on its own line. Did you mean ${ (0, _CompileError.code)('||') }?`);
							addToCurrentGroup(new _Token.DocComment(loc(), text));
						} else if (tryEat(Bar))
							// non-doc comment
							skipRestOfLine();else funKeyword(_Token.Keywords.Fun);
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
								keyword(_Token.Keywords.ObjAssign);
							} else if (next === Bar) {
								skip();
								keyword(_Token.Keywords.FunThis);
								space(loc());
							} else if (next === Bang && peekNext() === Bar) {
								skip();
								skip();
								keyword(_Token.Keywords.FunThisDo);
								space(loc());
							} else if (next === Tilde) {
								skip();
								if (tryEat(Bang)) {
									mustEat(Bar, '.~!');
									keyword(_Token.Keywords.FunThisGenDo);
								} else {
									mustEat(Bar, '.~');
									keyword(_Token.Keywords.FunThisGen);
								}
								space(loc());
							} else if (peek() === Dot && peekNext() === Dot) {
								eat();
								eat();
								keyword(_Token.Keywords.Ellipsis);
							} else keyword(_Token.Keywords.Dot);
							break;
						}

					case Colon:
						if (tryEat(Colon)) {
							mustEat(Equal, '::');
							keyword(_Token.Keywords.AssignMutable);
						} else if (tryEat(Equal)) keyword(_Token.Keywords.LocalMutate);else keyword(_Token.Keywords.Type);
						break;

					case Ampersand:case Backslash:case Backtick:case Caret:
					case Comma:case Percent:case Semicolon:
						(0, _context.fail)(loc(), `Reserved character ${ showChar(characterEaten) }`);
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
				(0, _context.check)(actualIndent === quoteIndent, pos, 'Indented quote must have exactly one more indent than previous line.');
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

			openGroup(locSingle().start, _Token.Groups.Quote);

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

							(0, _context.check)(isIndented, locSingle, 'Unclosed quote.');
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
			closeGroup(pos(), _Token.Groups.Quote);
		};

		curGroup = new _Token.Group(new _Loc.default(_esastDistLoc.StartPos, null), [], _Token.Groups.Block);
		openLine(_esastDistLoc.StartPos);

		lexPlain(false);

		const endPos = pos();
		closeLine(endPos);
		(0, _util.assert)((0, _util.isEmpty)(groupStack));
		curGroup.loc.end = endPos;
		return curGroup;
	}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2xleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBa0J3QixHQUFHOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFaLFVBQVMsR0FBRyxDQUFDLFlBQVksRUFBRTs7QUFFekMsZUFsQk8sS0FBSyxFQWtCTixZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFwQkwsUUFBUSxFQW9CUyxrQ0FBa0MsQ0FBQyxDQUFBOzs7Ozs7O0FBT2hGLGNBQVksR0FBRyxDQUFDLEdBQUUsWUFBWSxFQUFDLEVBQUUsQ0FBQyxDQUFBOzs7Ozs7OztBQVFsQyxRQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDckIsTUFBSSxRQUFRLENBQUE7QUFDWixRQUNDLGlCQUFpQixHQUFHLEtBQUssSUFBSTtBQUM1QixXQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUM5QjtRQUVELFNBQVMsR0FBRyxNQUFNO0FBQ2pCLFdBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUE7R0FDM0I7Ozs7O0FBSUQsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUNuQyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBaERNLEtBQUssQ0FnREQsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUMzRDtRQUVELGVBQWUsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDMUMsT0FBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFDOUIsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUNqQztRQUVELFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDckMsZ0JBM0RLLEtBQUssRUEyREosU0FBUyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQzVDLENBQUMsZ0JBQWdCLEdBQUUsV0F6RHRCLGFBQWEsRUF5RHVCLFNBQVMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUMvQyxDQUFDLGdCQUFnQixHQUFFLFdBMUR0QixhQUFhLEVBMER1QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkQsY0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUNoQztRQUVELFdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDdEMsT0FBSSxVQUFVLEdBQUcsUUFBUSxDQUFBO0FBQ3pCLFlBQVMsRUFBRSxDQUFBO0FBQ1gsYUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFBO0FBQzdCLFdBQVEsU0FBUztBQUNoQixTQUFLLE9BcEVrQixNQUFNLENBb0VqQixLQUFLO0FBQUU7QUFDbEIsWUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUE7QUFDeEMsVUFBSSxJQUFJLEtBQUssQ0FBQzs7QUFFYix3QkFBaUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUEsS0FFcEUsYUE1RXdCLElBQUksRUE0RXZCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtBQUMzQyxZQUFLO01BQ0w7QUFBQSxBQUNELFNBQUssT0E3RWtCLE1BQU0sQ0E2RWpCLElBQUk7OztBQUdmLFNBQUksQ0FBQyxVQTlFYyxPQUFPLEVBOEViLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFDakMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDOUIsV0FBSztBQUFBLEFBQ04sU0FBSyxPQW5Ga0IsTUFBTSxDQW1GakIsS0FBSztBQUNoQixrQkF0RkcsS0FBSyxFQXNGRixDQUFDLFVBbEZZLE9BQU8sRUFrRlgsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQTtBQUMvRCxzQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM3QixXQUFLO0FBQUEsQUFDTjtBQUNDLHNCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQUEsSUFDOUI7R0FDRDtRQUVELG1CQUFtQixHQUFHLEdBQUcsSUFBSTtBQUM1QixhQTNGSyxNQUFNLEVBMkZKLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0E3RkQsTUFBTSxDQTZGRSxLQUFLLENBQUMsQ0FBQTtBQUN0QyxPQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDbEMsU0FBUyxFQUFFLENBQUEsS0FFWCxXQUFXLENBQUMsR0FBRyxFQUFFLE9BakdNLE1BQU0sQ0FpR0wsS0FBSyxDQUFDLENBQUE7R0FDL0I7UUFFRCxlQUFlLEdBQUcsR0FBRyxJQUFJO0FBQ3hCLFlBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BckdHLE1BQU0sQ0FxR0YsV0FBVyxDQUFDLENBQUE7QUFDeEMsWUFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0F0R0ssTUFBTSxDQXNHSixLQUFLLENBQUMsQ0FBQTtHQUNoQztRQUVELGdCQUFnQixHQUFHLEdBQUcsSUFBSTtBQUN6QixjQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQTFHQyxNQUFNLENBMEdBLEtBQUssQ0FBQyxDQUFBO0FBQ3BDLGFBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BM0dJLE1BQU0sQ0EyR0gsV0FBVyxDQUFDLENBQUE7R0FDdkM7UUFFRCxvQkFBb0IsR0FBRyxHQUFHLElBQUk7QUFDN0IsWUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2QsYUFBVSxDQUFDLEdBQUcsRUFBRSxPQWhIUSxNQUFNLENBZ0hQLEtBQUssQ0FBQyxDQUFBOzs7O0FBSTdCLFVBQU8sUUFBUSxDQUFDLElBQUksS0FBSyxPQXBIRCxNQUFNLENBb0hFLFdBQVcsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLE9BcEh6QyxNQUFNLENBb0gwQyxLQUFLLEVBQzVFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ2hDOzs7O0FBR0QsVUFBUSxHQUFHLEdBQUcsSUFBSTtBQUNqQixZQUFTLENBQUMsR0FBRyxFQUFFLE9BMUhTLE1BQU0sQ0EwSFIsSUFBSSxDQUFDLENBQUE7QUFDM0IsWUFBUyxDQUFDLEdBQUcsRUFBRSxPQTNIUyxNQUFNLENBMkhSLEtBQUssQ0FBQyxDQUFBO0dBQzVCO1FBRUQsU0FBUyxHQUFHLEdBQUcsSUFBSTtBQUNsQixPQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0EvSEUsTUFBTSxDQStIRCxLQUFLLEVBQ2pDLG1CQUFtQixFQUFFLENBQUE7QUFDdEIsYUFBVSxDQUFDLEdBQUcsRUFBRSxPQWpJUSxNQUFNLENBaUlQLElBQUksQ0FBQyxDQUFBO0dBQzVCOzs7O0FBR0QsT0FBSyxHQUFHLEdBQUcsSUFBSTtBQUNkLGtCQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQXRJSCxNQUFNLENBc0lJLEtBQUssQ0FBQyxDQUFBO0FBQ3hDLFlBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BdklLLE1BQU0sQ0F1SUosS0FBSyxDQUFDLENBQUE7R0FDaEMsQ0FBQTs7Ozs7Ozs7OztBQVVGLE1BQUksS0FBSyxHQUFHLENBQUM7TUFBRSxJQUFJLGlCQXRKRixTQUFTLEFBc0pLO01BQUUsTUFBTSxpQkF0SlMsV0FBVyxBQXNKTixDQUFBOzs7Ozs7QUFNckQsUUFDQyxHQUFHLEdBQUcsTUFBTSxrQkE3SkQsR0FBRyxDQTZKTSxJQUFJLEVBQUUsTUFBTSxDQUFDO1FBRWpDLElBQUksR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBQzNDLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNuRCxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDbkQsV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzs7OztBQUl0RCxLQUFHLEdBQUcsTUFBTTtBQUNYLFNBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDM0MsUUFBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDakIsU0FBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDbkIsVUFBTyxJQUFJLENBQUE7R0FDWDtRQUNELElBQUksR0FBRyxHQUFHOzs7O0FBR1YsUUFBTSxHQUFHLFNBQVMsSUFBSTtBQUNyQixTQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsS0FBSyxTQUFTLENBQUE7QUFDbkMsT0FBSSxNQUFNLEVBQUU7QUFDWCxTQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNqQixVQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNuQjtBQUNELFVBQU8sTUFBTSxDQUFBO0dBQ2I7UUFFRCxPQUFPLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxLQUFLO0FBQ3BDLFNBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNoQyxnQkF4TEssS0FBSyxFQXdMSixNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQ2xCLENBQUMsR0FBRSxrQkExTEMsSUFBSSxFQTBMQSxVQUFVLENBQUMsRUFBQyxxQkFBcUIsR0FBRSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FDbEU7UUFFRCxhQUFhLEdBQUcsTUFBTTtBQUNyQixTQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsS0FBSyxPQUFPLENBQUE7QUFDakMsT0FBSSxNQUFNLEVBQUU7QUFDWCxTQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNqQixRQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtBQUNmLFVBQU0saUJBbk11QyxXQUFXLEFBbU1wQyxDQUFBO0lBQ3BCO0FBQ0QsVUFBTyxNQUFNLENBQUE7R0FDYjs7OztBQUdELGNBQVksR0FBRyxDQUFDLE1BQU0sRUFBRSxjQUFjLEtBQUs7QUFDMUMsUUFBSyxHQUFHLEtBQUssR0FBRyxjQUFjLENBQUE7QUFDOUIsT0FBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDbEIsU0FBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUE7R0FDdEI7Ozs7OztBQUtELFdBQVMsR0FBRyxrQkFBa0IsSUFDN0IsbUJBQW1CLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDO1FBQy9DLGlCQUFpQixHQUFHLGtCQUFrQixJQUNyQyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLGtCQUFrQixDQUFDO1FBQ25ELG1CQUFtQixHQUFHLENBQUMsVUFBVSxFQUFFLGtCQUFrQixLQUFLO0FBQ3pELFlBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQzdCLFVBQU8sWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUE7R0FDNUM7UUFFRCxlQUFlLEdBQUcsSUFBSSxJQUNyQixTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7UUFFM0IsY0FBYyxHQUFHLE1BQ2hCLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQztRQUU5QixhQUFhLEdBQUcsTUFDZixTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUM7UUFFOUIsU0FBUyxHQUFHLGtCQUFrQixJQUFJO0FBQ2pDLFNBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQTtBQUN4QixVQUFPLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQ2hDLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBQ2xCLFNBQU0sSUFBSSxHQUFHLEtBQUssR0FBRyxVQUFVLENBQUE7QUFDL0IsU0FBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDdEIsVUFBTyxJQUFJLENBQUE7R0FDWDs7Ozs7QUFJRCxjQUFZLEdBQUcsTUFBTTtBQUNwQixTQUFNLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDdEIsT0FBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7QUFDZixVQUFPLElBQUksRUFBRSxLQUFLLE9BQU8sRUFBRTtBQUMxQixTQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNqQixRQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUNmO0FBQ0QsU0FBTSxpQkF0UHdDLFdBQVcsQUFzUHJDLENBQUE7QUFDcEIsVUFBTyxJQUFJLEdBQUcsU0FBUyxDQUFBO0dBQ3ZCLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NGLFFBQU0sUUFBUSxHQUFHLFNBQVMsSUFBSTs7OztBQUk3QixPQUFJLE1BQU0sR0FBRyxDQUFDLENBQUE7Ozs7OztBQU1kLE9BQUksV0FBVyxDQUFBO0FBQ2YsU0FDQyxRQUFRLEdBQUcsTUFBTSxrQkE1U1AsR0FBRyxDQTRTWSxJQUFJLEVBQUUsV0FBVyxDQUFDO1NBQzNDLEdBQUcsR0FBRyxNQUFNLGlCQUFRLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO1NBQ3RDLE9BQU8sR0FBRyxJQUFJLElBQ2IsaUJBQWlCLENBQUMsV0EzU3dCLE9BQU8sQ0EyU25CLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVDLFVBQVUsR0FBRyxJQUFJLElBQUk7QUFDcEIsV0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUViLFNBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0lBQ1o7U0FDRCxlQUFlLEdBQUcsTUFBTTtBQUN2QixVQUFNLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBOztBQUU1QixVQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDZCxRQUFJLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QixXQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQTtBQUNoQixhQUFRLENBQUM7QUFDUixXQUFLLE9BQU8sQ0FBQyxBQUFDLEtBQUssT0FBTyxDQUFDLEFBQUMsS0FBSyxPQUFPO0FBQ3ZDLFdBQUksRUFBRSxDQUFBO0FBQ04sYUFBTSxjQUFjLEdBQ25CLENBQUMsS0FBSyxPQUFPLEdBQ2IsYUFBYSxHQUNiLENBQUMsS0FBSyxPQUFPLEdBQ2IsWUFBWSxHQUNaLFVBQVUsQ0FBQTtBQUNYLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDekIsYUFBSztBQUFBLEFBQ04sV0FBSyxHQUFHO0FBQ1AsV0FBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtBQUN4QixZQUFJLEVBQUUsQ0FBQTtBQUNOLGlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbEI7QUFDRCxhQUFLO0FBQUEsQUFDTixjQUFRO01BQ1I7S0FDRCxNQUFNO0FBQ04sY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLFNBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNkLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNuQjs7QUFFRCxVQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUIsQ0FBQyxXQWxWZCxhQUFhLENBa1ZtQixHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2hEO1NBQ0QsU0FBUyxHQUFHLE1BQU07QUFDakIsVUFBTSxTQUFTLEdBQUcsU0F0VkQsT0FBTyxDQXNWRSxNQUFNLEVBQUUsQ0FBQTtBQUNsQyxRQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFDdkIsV0FBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ25DLGtCQXpWRyxLQUFLLEVBeVZGLElBQUksRUFBRSxLQUFLLEtBQUssRUFBRSxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtBQUN0RCxZQUFPLE1BQU0sQ0FBQTtLQUNiLE1BQU07QUFDTixXQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsa0JBN1ZHLEtBQUssRUE2VkYsTUFBTSxHQUFHLFNBQVMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQ3BDLENBQUMseUNBQXlDLEdBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQTtLQUN6QjtJQUNELENBQUE7O0FBRUYsU0FDQyxVQUFVLEdBQUcsTUFBTTtBQUNsQixpQkFyV0ksS0FBSyxFQXFXSCxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUN6QyxDQUFDLG1CQUFtQixHQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBOzs7QUFHOUMsVUFBTSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDL0MsUUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLFNBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2xCLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUMsWUFBTyxDQUFDLE9BM1cwQyxRQUFRLENBMld6QyxLQUFLLENBQUMsQ0FBQTtLQUN2QixNQUNBLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNsQjtTQUNELFdBQVcsR0FBRyxJQUFJLElBQUk7QUFDckIsY0E5V1ksTUFBTSxFQThXWCxXQWhYNEQscUJBQXFCLEVBZ1gzRCxJQUFJLENBQUMsRUFDakMsSUFBSSxJQUFJO0FBQ1AsYUFBUSxJQUFJO0FBQ1gsV0FBSyxPQW5YMkMsUUFBUSxDQW1YMUMsTUFBTTtBQUNuQixxQkFBYyxFQUFFLENBQUE7QUFDaEIsY0FBTyxDQUFDLE9Bclh1QyxRQUFRLENBcVh0QyxNQUFNLENBQUMsQ0FBQTtBQUN4QixhQUFLO0FBQUEsQUFDTixXQUFLLE9BdlgyQyxRQUFRLENBdVgxQyxJQUFJOztBQUVqQixxQkFBYyxFQUFFLENBQUE7QUFDaEIsYUFBSztBQUFBLEFBQ047QUFDQyxjQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFBQSxNQUNkO0tBQ0QsRUFDRCxNQUFNO0FBQ0wsc0JBQWlCLENBQUMsV0FoWXlDLElBQUksQ0FnWXBDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDeEMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQTs7QUFFRixVQUFPLElBQUksRUFBRTtBQUNaLGVBQVcsR0FBRyxNQUFNLENBQUE7QUFDcEIsVUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQUE7O0FBRTVCLFlBQVEsY0FBYztBQUNyQixVQUFLLFFBQVE7QUFDWixhQUFNO0FBQUEsQUFDUCxVQUFLLFVBQVU7QUFDZCxtQkE5WUcsS0FBSyxFQThZRixTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQ3JCLENBQUMsbUJBQW1CLEdBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLGFBQU07QUFBQSxBQUNQLFVBQUssS0FBSztBQUNULGNBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQixZQUFLOztBQUFBOztBQUlOLFVBQUssZUFBZTtBQUNuQixVQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUMzQixpQkFBaUIsQ0FBQyxXQXZaSixLQUFLLENBdVpTLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQXZabEIsTUFBTSxDQXVabUIsV0FBVyxDQUFDLENBQUMsQ0FBQSxLQUUzRCxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUN2QixZQUFLO0FBQUEsQUFDTixVQUFLLFdBQVc7QUFDZixVQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFDdkIsaUJBQWlCLENBQUMsV0E3WkosS0FBSyxDQTZaUyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0E3WmxCLE1BQU0sQ0E2Wm1CLE9BQU8sQ0FBQyxDQUFDLENBQUEsS0FDbkQ7QUFDSixnQkFBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BL1pELE1BQU0sQ0ErWkUsT0FBTyxDQUFDLENBQUE7QUFDckMsZ0JBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQWhhSSxNQUFNLENBZ2FILEtBQUssQ0FBQyxDQUFBO09BQzlCO0FBQ0QsWUFBSztBQUFBLEFBQ04sVUFBSyxnQkFBZ0I7QUFDcEIsc0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUN2QixZQUFLO0FBQUEsQUFDTixVQUFLLFlBQVk7QUFDaEIsaUJBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQXZhRixNQUFNLENBdWFHLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLGdCQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsT0F4YUksTUFBTSxDQXdhSCxPQUFPLENBQUMsQ0FBQTtBQUNqQyxZQUFLO0FBQUEsQUFDTixVQUFLLEtBQUs7QUFDVCxXQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUNaLFlBQUs7QUFBQSxBQUNOLFVBQUssT0FBTztBQUFFO0FBQ2Isb0JBaGJHLEtBQUssRUFnYkYsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLDRDQUE0QyxDQUFDLENBQUE7QUFDcEUsV0FBSSxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQzFCLGFBbGJ3QixJQUFJLEVBa2J2QixHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTs7O0FBR25DLG1CQUFZLEVBQUUsQ0FBQTtBQUNkLGFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQTtBQUN4QixhQUFNLEdBQUcsU0FBUyxFQUFFLENBQUE7QUFDcEIsV0FBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO0FBQ3ZCLHFCQXpiRSxLQUFLLEVBeWJELE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFDbEMsaUNBQWlDLENBQUMsQ0FBQTtBQUNuQyxjQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQTs7O0FBR2YsWUFBSSxVQTFiYyxPQUFPLEVBMGJiLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFDOUIsQ0FBQyxXQTdiMkIsU0FBUyxFQTZiMUIsT0E3YnFDLFFBQVEsQ0E2YnBDLElBQUksRUFBRSxVQTNiQSxJQUFJLEVBMmJDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3JELGFBQUksUUFBUSxDQUFDLElBQUksS0FBSyxPQTliRixNQUFNLENBOGJHLEtBQUssRUFDakMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdCLGtCQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQWhjRyxNQUFNLENBZ2NGLEtBQUssQ0FBQyxDQUFBO1NBQzlCO0FBQ0QsaUJBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BbGNFLE1BQU0sQ0FrY0QsS0FBSyxDQUFDLENBQUE7QUFDaEMsZ0JBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZixNQUFNO0FBQ04sY0FBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDZixhQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUM1QyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDOUIsaUJBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDbEIsZ0JBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZjtBQUNELGFBQUs7T0FDTDtBQUFBLEFBQ0QsVUFBSyxHQUFHOzs7QUFHUCxtQkFsZFUsSUFBSSxFQWtkVCxHQUFHLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFBOztBQUFBOztBQUk5QyxVQUFLLElBQUk7QUFDUixVQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFDZCxVQUFVLENBQUMsT0F0ZHNDLFFBQVEsQ0FzZHJDLEtBQUssQ0FBQyxDQUFBLEtBRTFCLFVBQVUsRUFBRSxDQUFBO0FBQ2IsWUFBSztBQUFBLEFBQ04sVUFBSyxLQUFLO0FBQ1QsVUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDakIsY0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNsQixpQkFBVSxDQUFDLE9BN2RzQyxRQUFRLENBNmRyQyxRQUFRLENBQUMsQ0FBQTtPQUM3QixNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNyQixVQUFVLENBQUMsT0EvZHNDLFFBQVEsQ0ErZHJDLE1BQU0sQ0FBQyxDQUFBLEtBRTNCLE9BQU8sQ0FBQyxPQWpleUMsUUFBUSxDQWlleEMsSUFBSSxDQUFDLENBQUE7QUFDdkIsWUFBSztBQUFBLEFBQ04sVUFBSyxHQUFHO0FBQ1AsVUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pDLGFBQU0sSUFBSSxHQUFHLGFBQWEsRUFBRSxDQUFBO0FBQzVCLDBCQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDL0IsV0FBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0F2ZUgsTUFBTSxDQXVlSSxJQUFJLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBLEFBQUMsRUFDdEUsYUExZVEsSUFBSSxFQTBlUCxHQUFHLEVBQ1AsQ0FBQyxrREFBa0QsR0FBRSxrQkE1ZXJELElBQUksRUE0ZXNELElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDckUsd0JBQWlCLENBQUMsV0ExZWhCLFVBQVUsQ0EwZXFCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7T0FDOUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUM7O0FBRXJCLHFCQUFjLEVBQUUsQ0FBQSxLQUVoQixVQUFVLENBQUMsT0EvZXNDLFFBQVEsQ0ErZXJDLEdBQUcsQ0FBQyxDQUFBO0FBQ3pCLFlBQUs7O0FBQUE7O0FBSU4sVUFBSyxNQUFNO0FBQ1YsVUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWxCLHNCQUFlLEVBQUUsQ0FBQSxLQUVqQixVQUFVLEVBQUUsQ0FBQTtBQUNiLFlBQUs7QUFBQSxBQUNOLFVBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFLENBQUMsQUFBQyxLQUFLLEVBQUUsQ0FBQyxBQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUMsVUFBSyxFQUFFLENBQUMsQUFBQyxLQUFLLEVBQUUsQ0FBQyxBQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFLENBQUMsQUFBQyxLQUFLLEVBQUU7QUFDMUMscUJBQWUsRUFBRSxDQUFBO0FBQ2pCLFlBQUs7O0FBQUE7O0FBS04sVUFBSyxHQUFHO0FBQUU7QUFDVCxhQUFNLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQTtBQUNuQixXQUFJLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRTs7OztBQUl2QywyQkFBbUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQy9CLGVBQU8sQ0FBQyxPQTFnQnlDLFFBQVEsQ0EwZ0J4QyxTQUFTLENBQUMsQ0FBQTtRQUMzQixNQUFNLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUN4QixZQUFJLEVBQUUsQ0FBQTtBQUNOLGVBQU8sQ0FBQyxPQTdnQnlDLFFBQVEsQ0E2Z0J4QyxPQUFPLENBQUMsQ0FBQTtBQUN6QixhQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUNaLE1BQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLFFBQVEsRUFBRSxLQUFLLEdBQUcsRUFBRTtBQUMvQyxZQUFJLEVBQUUsQ0FBQTtBQUNOLFlBQUksRUFBRSxDQUFBO0FBQ04sZUFBTyxDQUFDLE9BbGhCeUMsUUFBUSxDQWtoQnhDLFNBQVMsQ0FBQyxDQUFBO0FBQzNCLGFBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ1osTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDMUIsWUFBSSxFQUFFLENBQUE7QUFDTixZQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNqQixnQkFBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNuQixnQkFBTyxDQUFDLE9BeGhCd0MsUUFBUSxDQXdoQnZDLFlBQVksQ0FBQyxDQUFBO1NBQzlCLE1BQU07QUFDTixnQkFBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNsQixnQkFBTyxDQUFDLE9BM2hCd0MsUUFBUSxDQTJoQnZDLFVBQVUsQ0FBQyxDQUFBO1NBQzVCO0FBQ0QsYUFBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDWixNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssR0FBRyxJQUFJLFFBQVEsRUFBRSxLQUFLLEdBQUcsRUFBRTtBQUNoRCxXQUFHLEVBQUUsQ0FBQTtBQUNMLFdBQUcsRUFBRSxDQUFBO0FBQ0wsZUFBTyxDQUFDLE9BamlCeUMsUUFBUSxDQWlpQnhDLFFBQVEsQ0FBQyxDQUFBO1FBQzFCLE1BQ0EsT0FBTyxDQUFDLE9BbmlCeUMsUUFBUSxDQW1pQnhDLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLGFBQUs7T0FDTDs7QUFBQSxBQUVELFVBQUssS0FBSztBQUNULFVBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2xCLGNBQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDcEIsY0FBTyxDQUFDLE9BMWlCeUMsUUFBUSxDQTBpQnhDLGFBQWEsQ0FBQyxDQUFBO09BQy9CLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQ3ZCLE9BQU8sQ0FBQyxPQTVpQnlDLFFBQVEsQ0E0aUJ4QyxXQUFXLENBQUMsQ0FBQSxLQUU3QixPQUFPLENBQUMsT0E5aUJ5QyxRQUFRLENBOGlCeEMsSUFBSSxDQUFDLENBQUE7QUFDdkIsWUFBSzs7QUFBQSxBQUVOLFVBQUssU0FBUyxDQUFDLEFBQUMsS0FBSyxTQUFTLENBQUMsQUFBQyxLQUFLLFFBQVEsQ0FBQyxBQUFDLEtBQUssS0FBSyxDQUFDO0FBQzFELFVBQUssS0FBSyxDQUFDLEFBQUMsS0FBSyxPQUFPLENBQUMsQUFBQyxLQUFLLFNBQVM7QUFDdkMsbUJBcmpCVSxJQUFJLEVBcWpCVCxHQUFHLEVBQUUsRUFBRSxDQUFDLG1CQUFtQixHQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQzlEO0FBQ0MsZ0JBQVUsRUFBRSxDQUFBO0FBQUEsS0FDYjtJQUNEO0dBQ0QsQ0FBQTs7QUFFRCxRQUFNLFFBQVEsR0FBRyxNQUFNLElBQUk7QUFDMUIsU0FBTSxXQUFXLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTs7OztBQUk5QixTQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQTtBQUNsQyxPQUFJLFVBQVUsRUFBRTtBQUNmLFVBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN6QyxpQkFwa0JLLEtBQUssRUFva0JKLFlBQVksS0FBSyxXQUFXLEVBQUUsR0FBRyxFQUN0QyxzRUFBc0UsQ0FBQyxDQUFBO0lBQ3hFOzs7O0FBSUQsT0FBSSxJQUFJLEdBQUcsRUFBRSxDQUFBOztBQUViLFNBQU0sZUFBZSxHQUFHLE1BQU07QUFDN0IsUUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ2hCLHNCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZCLFNBQUksR0FBRyxFQUFFLENBQUE7S0FDVDtJQUNELENBQUE7O0FBRUQsU0FBTSxTQUFTLEdBQUcsTUFBTSxrQkFybEJvQyxhQUFhLEVBcWxCbkMsR0FBRyxFQUFFLENBQUMsQ0FBQTs7QUFFNUMsWUFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQW5sQkosTUFBTSxDQW1sQkssS0FBSyxDQUFDLENBQUE7O0FBRTFDLFdBQVEsRUFBRSxPQUFPLElBQUksRUFBRTtBQUN0QixVQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNsQixZQUFRLElBQUk7QUFDWCxVQUFLLFNBQVM7QUFBRTtBQUNmLGFBQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFdBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7QUFDOUMsYUFBSztPQUNMO0FBQUE7QUFFRCxVQUFLLFFBQVE7QUFDWixVQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQTtBQUNuQixZQUFLO0FBQUEsQUFDTixVQUFLLFNBQVM7QUFBRTtBQUNmLHNCQUFlLEVBQUUsQ0FBQTtBQUNqQixhQUFNLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQTtBQUNyQixzQkFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2xCLGVBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNkLHVCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25CLGFBQUs7T0FDTDtBQUFBO0FBRUQsVUFBSyxPQUFPO0FBQUU7QUFDYixhQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQTs7QUFFekIsa0JBQVcsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7O0FBRTNDLG9CQWpuQkcsS0FBSyxFQWluQkYsVUFBVSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBOztBQUUvQyxhQUFNLFdBQVcsR0FBRyxZQUFZLEVBQUUsQ0FBQTtBQUNsQyxhQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEMsV0FBSSxTQUFTLEdBQUcsV0FBVyxFQUFFOzs7QUFHNUIsb0JBQVksQ0FBQyxXQUFXLEVBQUUsV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFBO0FBQ2xELGtCQXJuQkUsTUFBTSxFQXFuQkQsSUFBSSxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUE7QUFDMUIsY0FBTSxRQUFRLENBQUE7UUFDZCxNQUNBLElBQUksR0FBRyxJQUFJLEdBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQTtBQUNqRSxhQUFLO09BQ0w7QUFBQSxBQUNELFVBQUssS0FBSztBQUNULFVBQUksQ0FBQyxVQUFVLEVBQ2QsTUFBTSxRQUFRLENBQUE7QUFBQTtBQUVoQjs7O0FBR0MsVUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsS0FDeEM7SUFDRDs7QUFFRCxrQkFBZSxFQUFFLENBQUE7QUFDakIsYUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BMW9CTyxNQUFNLENBMG9CTixLQUFLLENBQUMsQ0FBQTtHQUMvQixDQUFBOztBQUVELFVBQVEsR0FBRyxXQTdvQlEsS0FBSyxDQTZvQkgsK0JBanBCaUIsUUFBUSxFQWlwQlAsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BN29CeEIsTUFBTSxDQTZvQnlCLEtBQUssQ0FBQyxDQUFBO0FBQy9ELFVBQVEsZUFscEI4QixRQUFRLENBa3BCNUIsQ0FBQTs7QUFFbEIsVUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVmLFFBQU0sTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ3BCLFdBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQixZQWxwQk8sTUFBTSxFQWtwQk4sVUFscEJnQixPQUFPLEVBa3BCZixVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQzNCLFVBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQTtBQUN6QixTQUFPLFFBQVEsQ0FBQTtFQUNmOztBQUVELE9BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE9BQ0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDcEIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDbEIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDZCxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNiLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2YsVUFBVSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDcEIsWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDdEIsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUMxQixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2YsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDYixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2hCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDbEIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDbkIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDckIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDekIsT0FBTyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDakIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDZixTQUFTLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNuQixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFaEIsT0FDQyxRQUFRLEdBQUcsSUFBSSxJQUFJLGtCQXRzQlosSUFBSSxFQXNzQmEsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNsRCxTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxLQUFLO0FBQzlCLE1BQUksR0FBRyxHQUFHLGdCQUFnQixDQUFBO0FBQzFCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUMxQyxHQUFHLEdBQUcsQ0FBQyxHQUFFLEdBQUcsRUFBQyxLQUFLLEdBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQTtBQUM1QyxLQUFHLEdBQUcsQ0FBQyxHQUFFLEdBQUcsRUFBQyxRQUFRLEdBQUUsQ0FBQyxNQUFNLEVBQUMsa0JBQWtCLEdBQUUsTUFBTSxFQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzlELFNBQU8sUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtFQUMxQjtPQUNELE9BQU8sR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO09BQ2pDLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQy9CLFlBQVksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO09BQ3BDLFVBQVUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUM7Ozs7QUFHMUMsbUJBQWtCLEdBQUcsYUFBYTtPQUNsQyxlQUFlLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFBIiwiZmlsZSI6ImxleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2MsIHtQb3MsIFN0YXJ0TGluZSwgU3RhcnRMb2MsIFN0YXJ0UG9zLCBTdGFydENvbHVtbiwgc2luZ2xlQ2hhckxvY30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWwsIG9wdGlvbnMsIHdhcm59IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7TnVtYmVyTGl0ZXJhbH0gZnJvbSAnLi9Nc0FzdCdcbmltcG9ydCB7RG9jQ29tbWVudCwgR3JvdXAsIEdyb3VwcywgaXNLZXl3b3JkLCBLZXl3b3JkLCBLZXl3b3JkcywgTmFtZSwgb3BLZXl3b3JkS2luZEZyb21OYW1lLFxuXHRzaG93R3JvdXBLaW5kfSBmcm9tICcuL1Rva2VuJ1xuaW1wb3J0IHthc3NlcnQsIGlmRWxzZSwgaXNFbXB0eSwgbGFzdH0gZnJvbSAnLi91dGlsJ1xuXG4vKipcbkxleGVzIHRoZSBzb3VyY2UgY29kZSBpbnRvIHtAbGluayBUb2tlbn1zLlxuVGhlIE1hc29uIGxleGVyIGFsc28gZ3JvdXBzIHRva2VucyBhcyBwYXJ0IG9mIGxleGluZy5cblRoaXMgbWFrZXMgd3JpdGluZyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciBlYXN5LlxuU2VlIHtAbGluayBHcm91cH0uXG5cbkBwYXJhbSB7c3RyaW5nfSBzb3VyY2VTdHJpbmdcbkByZXR1cm4ge0dyb3VwPEdyb3Vwcy5CbG9jaz59XG5cdEJsb2NrIHRva2VuIHJlcHJlc2VudGluZyB0aGUgd2hvbGUgbW9kdWxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxleChzb3VyY2VTdHJpbmcpIHtcblx0Ly8gQWxnb3JpdGhtIHJlcXVpcmVzIHRyYWlsaW5nIG5ld2xpbmUgdG8gY2xvc2UgYW55IGJsb2Nrcy5cblx0Y2hlY2soc291cmNlU3RyaW5nLmVuZHNXaXRoKCdcXG4nKSwgU3RhcnRMb2MsICdTb3VyY2UgY29kZSBtdXN0IGVuZCBpbiBuZXdsaW5lLicpXG5cblx0Lypcblx0VXNlIGEgMC10ZXJtaW5hdGVkIHN0cmluZyBzbyB0aGF0IHdlIGNhbiB1c2UgYDBgIGFzIGEgc3dpdGNoIGNhc2UuXG5cdFRoaXMgaXMgZmFzdGVyIHRoYW4gY2hlY2tpbmcgd2hldGhlciBpbmRleCA9PT0gbGVuZ3RoLlxuXHQoSWYgd2UgY2hlY2sgcGFzdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgd2UgZ2V0IGBOYU5gLCB3aGljaCBjYW4ndCBiZSBzd2l0Y2hlZCBvbi4pXG5cdCovXG5cdHNvdXJjZVN0cmluZyA9IGAke3NvdXJjZVN0cmluZ31cXDBgXG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gR1JPVVBJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gV2Ugb25seSBldmVyIHdyaXRlIHRvIHRoZSBpbm5lcm1vc3QgR3JvdXA7XG5cdC8vIHdoZW4gd2UgY2xvc2UgdGhhdCBHcm91cCB3ZSBhZGQgaXQgdG8gdGhlIGVuY2xvc2luZyBHcm91cCBhbmQgY29udGludWUgd2l0aCB0aGF0IG9uZS5cblx0Ly8gTm90ZSB0aGF0IGBjdXJHcm91cGAgaXMgY29uY2VwdHVhbGx5IHRoZSB0b3Agb2YgdGhlIHN0YWNrLCBidXQgaXMgbm90IHN0b3JlZCBpbiBgc3RhY2tgLlxuXHRjb25zdCBncm91cFN0YWNrID0gW11cblx0bGV0IGN1ckdyb3VwXG5cdGNvbnN0XG5cdFx0YWRkVG9DdXJyZW50R3JvdXAgPSB0b2tlbiA9PiB7XG5cdFx0XHRjdXJHcm91cC5zdWJUb2tlbnMucHVzaCh0b2tlbilcblx0XHR9LFxuXG5cdFx0ZHJvcEdyb3VwID0gKCkgPT4ge1xuXHRcdFx0Y3VyR3JvdXAgPSBncm91cFN0YWNrLnBvcCgpXG5cdFx0fSxcblxuXHRcdC8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cblx0XHQvLyBXaGVuIHRoZSBzdWItZ3JvdXAgZmluaXNoZXMgd2Ugd2lsbCBwb3AgdGhlIHN0YWNrIGFuZCByZXN1bWUgd3JpdGluZyB0byBpdHMgcGFyZW50LlxuXHRcdG9wZW5Hcm91cCA9IChvcGVuUG9zLCBncm91cEtpbmQpID0+IHtcblx0XHRcdGdyb3VwU3RhY2sucHVzaChjdXJHcm91cClcblx0XHRcdC8vIENvbnRlbnRzIHdpbGwgYmUgYWRkZWQgdG8gYnkgYGFkZFRvQ3VycmVudEdyb3VwYC5cblx0XHRcdC8vIGN1ckdyb3VwLmxvYy5lbmQgd2lsbCBiZSB3cml0dGVuIHRvIHdoZW4gY2xvc2luZyBpdC5cblx0XHRcdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2Mob3BlblBvcywgbnVsbCksIFtdLCBncm91cEtpbmQpXG5cdFx0fSxcblxuXHRcdG1heWJlQ2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRpZiAoY3VyR3JvdXAua2luZCA9PT0gY2xvc2VLaW5kKVxuXHRcdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRjbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGNoZWNrKGNsb3NlS2luZCA9PT0gY3VyR3JvdXAua2luZCwgY2xvc2VQb3MsICgpID0+XG5cdFx0XHRcdGBUcnlpbmcgdG8gY2xvc2UgJHtzaG93R3JvdXBLaW5kKGNsb3NlS2luZCl9LCBgICtcblx0XHRcdFx0YGJ1dCBsYXN0IG9wZW5lZCAke3Nob3dHcm91cEtpbmQoY3VyR3JvdXAua2luZCl9YClcblx0XHRcdF9jbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpXG5cdFx0fSxcblxuXHRcdF9jbG9zZUdyb3VwID0gKGNsb3NlUG9zLCBjbG9zZUtpbmQpID0+IHtcblx0XHRcdGxldCBqdXN0Q2xvc2VkID0gY3VyR3JvdXBcblx0XHRcdGRyb3BHcm91cCgpXG5cdFx0XHRqdXN0Q2xvc2VkLmxvYy5lbmQgPSBjbG9zZVBvc1xuXHRcdFx0c3dpdGNoIChjbG9zZUtpbmQpIHtcblx0XHRcdFx0Y2FzZSBHcm91cHMuU3BhY2U6IHtcblx0XHRcdFx0XHRjb25zdCBzaXplID0ganVzdENsb3NlZC5zdWJUb2tlbnMubGVuZ3RoXG5cdFx0XHRcdFx0aWYgKHNpemUgIT09IDApXG5cdFx0XHRcdFx0XHQvLyBTcGFjZWQgc2hvdWxkIGFsd2F5cyBoYXZlIGF0IGxlYXN0IHR3byBlbGVtZW50cy5cblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHNpemUgPT09IDEgPyBqdXN0Q2xvc2VkLnN1YlRva2Vuc1swXSA6IGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0d2FybihqdXN0Q2xvc2VkLmxvYywgJ1VubmVjZXNzYXJ5IHNwYWNlLicpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIEdyb3Vwcy5MaW5lOlxuXHRcdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdFx0Ly8gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZXJlIHdhcyBqdXN0IGEgY29tbWVudC5cblx0XHRcdFx0XHRpZiAoIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEdyb3Vwcy5CbG9jazpcblx0XHRcdFx0XHRjaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eSA9IHBvcyA9PiB7XG5cdFx0XHRhc3NlcnQoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdFx0aWYgKGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApXG5cdFx0XHRcdGRyb3BHcm91cCgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdF9jbG9zZUdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxuXHRcdH0sXG5cblx0XHRvcGVuUGFyZW50aGVzaXMgPSBsb2MgPT4ge1xuXHRcdFx0b3Blbkdyb3VwKGxvYy5zdGFydCwgR3JvdXBzLlBhcmVudGhlc2lzKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VQYXJlbnRoZXNpcyA9IGxvYyA9PiB7XG5cdFx0XHRfY2xvc2VHcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0XHRcdGNsb3NlR3JvdXAobG9jLmVuZCwgR3JvdXBzLlBhcmVudGhlc2lzKVxuXHRcdH0sXG5cblx0XHRjbG9zZUdyb3Vwc0ZvckRlZGVudCA9IHBvcyA9PiB7XG5cdFx0XHRjbG9zZUxpbmUocG9zKVxuXHRcdFx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5CbG9jaylcblx0XHRcdC8vIEl0J3MgT0sgdG8gYmUgbWlzc2luZyBhIGNsb3NpbmcgcGFyZW50aGVzaXMgaWYgdGhlcmUncyBhIGJsb2NrLiBFLmcuOlxuXHRcdFx0Ly8gYSAoYlxuXHRcdFx0Ly9cdGMgfCBubyBjbG9zaW5nIHBhcmVuIGhlcmVcblx0XHRcdHdoaWxlIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuUGFyZW50aGVzaXMgfHwgY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRfY2xvc2VHcm91cChwb3MsIGN1ckdyb3VwLmtpbmQpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gc3RhcnRpbmcgYSBuZXcgbGluZSwgYSBzcGFjZWQgZ3JvdXAgaXMgY3JlYXRlZCBpbXBsaWNpdGx5LlxuXHRcdG9wZW5MaW5lID0gcG9zID0+IHtcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdyb3Vwcy5MaW5lKVxuXHRcdFx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxuXHRcdH0sXG5cblx0XHRjbG9zZUxpbmUgPSBwb3MgPT4ge1xuXHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eSgpXG5cdFx0XHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG5cdFx0fSxcblxuXHRcdC8vIFdoZW4gZW5jb3VudGVyaW5nIGEgc3BhY2UsIGl0IGJvdGggY2xvc2VzIGFuZCBvcGVucyBhIHNwYWNlZCBncm91cC5cblx0XHRzcGFjZSA9IGxvYyA9PiB7XG5cdFx0XHRtYXliZUNsb3NlR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuU3BhY2UpXG5cdFx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHRcdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJVEVSQVRJTkcgVEhST1VHSCBTT1VSQ0VTVFJJTkdcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Lypcblx0VGhlc2UgYXJlIGtlcHQgdXAtdG8tZGF0ZSBhcyB3ZSBpdGVyYXRlIHRocm91Z2ggc291cmNlU3RyaW5nLlxuXHRFdmVyeSBhY2Nlc3MgdG8gaW5kZXggaGFzIGNvcnJlc3BvbmRpbmcgY2hhbmdlcyB0byBsaW5lIGFuZC9vciBjb2x1bW4uXG5cdFRoaXMgYWxzbyBleHBsYWlucyB3aHkgdGhlcmUgYXJlIGRpZmZlcmVudCBmdW5jdGlvbnMgZm9yIG5ld2xpbmVzIHZzIG90aGVyIGNoYXJhY3RlcnMuXG5cdCovXG5cdGxldCBpbmRleCA9IDAsIGxpbmUgPSBTdGFydExpbmUsIGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cblx0Lypcblx0Tk9URTogV2UgdXNlIGNoYXJhY3RlciAqY29kZXMqIGZvciBldmVyeXRoaW5nLlxuXHRDaGFyYWN0ZXJzIGFyZSBvZiB0eXBlIE51bWJlciBhbmQgbm90IGp1c3QgU3RyaW5ncyBvZiBsZW5ndGggb25lLlxuXHQqL1xuXHRjb25zdFxuXHRcdHBvcyA9ICgpID0+IG5ldyBQb3MobGluZSwgY29sdW1uKSxcblxuXHRcdHBlZWsgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCksXG5cdFx0cGVla05leHQgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpLFxuXHRcdHBlZWtQcmV2ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKSxcblx0XHRwZWVrMkJlZm9yZSA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4IC0gMiksXG5cblx0XHQvLyBNYXkgZWF0IGEgTmV3bGluZS5cblx0XHQvLyBDYWxsZXIgKm11c3QqIGNoZWNrIGZvciB0aGF0IGNhc2UgYW5kIGluY3JlbWVudCBsaW5lIVxuXHRcdGVhdCA9ICgpID0+IHtcblx0XHRcdGNvbnN0IGNoYXIgPSBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcblx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyAxXG5cdFx0XHRyZXR1cm4gY2hhclxuXHRcdH0sXG5cdFx0c2tpcCA9IGVhdCxcblxuXHRcdC8vIGNoYXJUb0VhdCBtdXN0IG5vdCBiZSBOZXdsaW5lLlxuXHRcdHRyeUVhdCA9IGNoYXJUb0VhdCA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IGNoYXJUb0VhdFxuXHRcdFx0aWYgKGNhbkVhdCkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRjb2x1bW4gPSBjb2x1bW4gKyAxXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdG11c3RFYXQgPSAoY2hhclRvRWF0LCBwcmVjZWRlZEJ5KSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSB0cnlFYXQoY2hhclRvRWF0KVxuXHRcdFx0Y2hlY2soY2FuRWF0LCBwb3MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUocHJlY2VkZWRCeSl9IG11c3QgYmUgZm9sbG93ZWQgYnkgJHtzaG93Q2hhcihjaGFyVG9FYXQpfWApXG5cdFx0fSxcblxuXHRcdHRyeUVhdE5ld2xpbmUgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjYW5FYXQgPSBwZWVrKCkgPT09IE5ld2xpbmVcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuRWF0XG5cdFx0fSxcblxuXHRcdC8vIENhbGxlciBtdXN0IGVuc3VyZSB0aGF0IGJhY2tpbmcgdXAgbkNoYXJzVG9CYWNrVXAgY2hhcmFjdGVycyBicmluZ3MgdXMgdG8gb2xkUG9zLlxuXHRcdHN0ZXBCYWNrTWFueSA9IChvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSA9PiB7XG5cdFx0XHRpbmRleCA9IGluZGV4IC0gbkNoYXJzVG9CYWNrVXBcblx0XHRcdGxpbmUgPSBvbGRQb3MubGluZVxuXHRcdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHRcdH0sXG5cblx0XHQvLyBGb3IgdGFrZVdoaWxlLCB0YWtlV2hpbGVXaXRoUHJldiwgYW5kIHNraXBXaGlsZUVxdWFscyxcblx0XHQvLyBjaGFyYWN0ZXJQcmVkaWNhdGUgbXVzdCAqbm90KiBhY2NlcHQgTmV3bGluZS5cblx0XHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdFx0dGFrZVdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpLFxuXHRcdHRha2VXaGlsZVdpdGhQcmV2ID0gY2hhcmFjdGVyUHJlZGljYXRlID0+XG5cdFx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHRfdGFrZVdoaWxlV2l0aFN0YXJ0ID0gKHN0YXJ0SW5kZXgsIGNoYXJhY3RlclByZWRpY2F0ZSkgPT4ge1xuXHRcdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRcdHJldHVybiBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0fSxcblxuXHRcdHNraXBXaGlsZUVxdWFscyA9IGNoYXIgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gPT09IGNoYXIpLFxuXG5cdFx0c2tpcFJlc3RPZkxpbmUgPSAoKSA9PlxuXHRcdFx0c2tpcFdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSksXG5cblx0XHRlYXRSZXN0T2ZMaW5lID0gKCkgPT5cblx0XHRcdHRha2VXaGlsZShfID0+IF8gIT09IE5ld2xpbmUpLFxuXG5cdFx0c2tpcFdoaWxlID0gY2hhcmFjdGVyUHJlZGljYXRlID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleFxuXHRcdFx0d2hpbGUgKGNoYXJhY3RlclByZWRpY2F0ZShwZWVrKCkpKVxuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0Y29uc3QgZGlmZiA9IGluZGV4IC0gc3RhcnRJbmRleFxuXHRcdFx0Y29sdW1uID0gY29sdW1uICsgZGlmZlxuXHRcdFx0cmV0dXJuIGRpZmZcblx0XHR9LFxuXG5cdFx0Ly8gQ2FsbGVkIGFmdGVyIHNlZWluZyB0aGUgZmlyc3QgbmV3bGluZS5cblx0XHQvLyBSZXR1cm5zICMgdG90YWwgbmV3bGluZXMsIGluY2x1ZGluZyB0aGUgZmlyc3QuXG5cdFx0c2tpcE5ld2xpbmVzID0gKCkgPT4ge1xuXHRcdFx0Y29uc3Qgc3RhcnRMaW5lID0gbGluZVxuXHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0XHR3aGlsZSAocGVlaygpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0fVxuXHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHRcdHJldHVybiBsaW5lIC0gc3RhcnRMaW5lXG5cdFx0fVxuXG5cdC8vIFNwcmlua2xlIGNoZWNrUG9zKCkgYXJvdW5kIHRvIGRlYnVnIGxpbmUgYW5kIGNvbHVtbiB0cmFja2luZyBlcnJvcnMuXG5cdC8qXG5cdGNvbnN0XG5cdFx0Y2hlY2tQb3MgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBwID0gX2dldENvcnJlY3RQb3MoKVxuXHRcdFx0aWYgKHAubGluZSAhPT0gbGluZSB8fCBwLmNvbHVtbiAhPT0gY29sdW1uKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGluZGV4OiAke2luZGV4fSwgd3Jvbmc6ICR7UG9zKGxpbmUsIGNvbHVtbil9LCByaWdodDogJHtwfWApXG5cdFx0fSxcblx0XHRfaW5kZXhUb1BvcyA9IG5ldyBNYXAoKSxcblx0XHRfZ2V0Q29ycmVjdFBvcyA9ICgpID0+IHtcblx0XHRcdGlmIChpbmRleCA9PT0gMClcblx0XHRcdFx0cmV0dXJuIFBvcyhTdGFydExpbmUsIFN0YXJ0Q29sdW1uKVxuXG5cdFx0XHRsZXQgb2xkUG9zLCBvbGRJbmRleFxuXHRcdFx0Zm9yIChvbGRJbmRleCA9IGluZGV4IC0gMTsgOyBvbGRJbmRleCA9IG9sZEluZGV4IC0gMSkge1xuXHRcdFx0XHRvbGRQb3MgPSBfaW5kZXhUb1Bvcy5nZXQob2xkSW5kZXgpXG5cdFx0XHRcdGlmIChvbGRQb3MgIT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRhc3NlcnQob2xkSW5kZXggPj0gMClcblx0XHRcdH1cblx0XHRcdGxldCBuZXdMaW5lID0gb2xkUG9zLmxpbmUsIG5ld0NvbHVtbiA9IG9sZFBvcy5jb2x1bW5cblx0XHRcdGZvciAoOyBvbGRJbmRleCA8IGluZGV4OyBvbGRJbmRleCA9IG9sZEluZGV4ICsgMSlcblx0XHRcdFx0aWYgKHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KG9sZEluZGV4KSA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRcdG5ld0xpbmUgPSBuZXdMaW5lICsgMVxuXHRcdFx0XHRcdG5ld0NvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdG5ld0NvbHVtbiA9IG5ld0NvbHVtbiArIDFcblxuXHRcdFx0Y29uc3QgcCA9IFBvcyhuZXdMaW5lLCBuZXdDb2x1bW4pXG5cdFx0XHRfaW5kZXhUb1Bvcy5zZXQoaW5kZXgsIHApXG5cdFx0XHRyZXR1cm4gcFxuXHRcdH1cblx0Ki9cblxuXHQvKlxuXHRJbiB0aGUgY2FzZSBvZiBxdW90ZSBpbnRlcnBvbGF0aW9uIChcImF7Yn1jXCIpIHdlJ2xsIHJlY3Vyc2UgYmFjayBpbnRvIGhlcmUuXG5cdFdoZW4gaXNJblF1b3RlIGlzIHRydWUsIHdlIHdpbGwgbm90IGFsbG93IG5ld2xpbmVzLlxuXHQqL1xuXHRjb25zdCBsZXhQbGFpbiA9IGlzSW5RdW90ZSA9PiB7XG5cdFx0Ly8gVGhpcyB0ZWxscyB1cyB3aGljaCBpbmRlbnRlZCBibG9jayB3ZSdyZSBpbi5cblx0XHQvLyBJbmNyZW1lbnRpbmcgaXQgbWVhbnMgaXNzdWluZyBhIEdQX09wZW5CbG9jayBhbmQgZGVjcmVtZW50aW5nIGl0IG1lYW5zIGEgR1BfQ2xvc2VCbG9jay5cblx0XHQvLyBEb2VzIG5vdGhpbmcgaWYgaXNJblF1b3RlLlxuXHRcdGxldCBpbmRlbnQgPSAwXG5cblx0XHQvLyBNYWtlIGNsb3N1cmVzIG5vdyByYXRoZXIgdGhhbiBpbnNpZGUgdGhlIGxvb3AuXG5cdFx0Ly8gVGhpcyBpcyBzaWduaWZpY2FudGx5IGZhc3RlciBhcyBvZiBub2RlIHYwLjExLjE0LlxuXG5cdFx0Ly8gVGhpcyBpcyB3aGVyZSB3ZSBzdGFydGVkIGxleGluZyB0aGUgY3VycmVudCB0b2tlbi5cblx0XHRsZXQgc3RhcnRDb2x1bW5cblx0XHRjb25zdFxuXHRcdFx0c3RhcnRQb3MgPSAoKSA9PiBuZXcgUG9zKGxpbmUsIHN0YXJ0Q29sdW1uKSxcblx0XHRcdGxvYyA9ICgpID0+IG5ldyBMb2Moc3RhcnRQb3MoKSwgcG9zKCkpLFxuXHRcdFx0a2V5d29yZCA9IGtpbmQgPT5cblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEtleXdvcmQobG9jKCksIGtpbmQpKSxcblx0XHRcdGZ1bktleXdvcmQgPSBraW5kID0+IHtcblx0XHRcdFx0a2V5d29yZChraW5kKVxuXHRcdFx0XHQvLyBGaXJzdCBhcmcgaW4gaXRzIG93biBzcGFjZWQgZ3JvdXBcblx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHR9LFxuXHRcdFx0ZWF0QW5kQWRkTnVtYmVyID0gKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXggLSAxXG5cblx0XHRcdFx0dHJ5RWF0KEh5cGhlbilcblx0XHRcdFx0aWYgKHBlZWtQcmV2KCkgPT09IE4wKSB7XG5cdFx0XHRcdFx0Y29uc3QgcCA9IHBlZWsoKVxuXHRcdFx0XHRcdHN3aXRjaCAocCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBMZXR0ZXJCOiBjYXNlIExldHRlck86IGNhc2UgTGV0dGVyWDpcblx0XHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGlzRGlnaXRTcGVjaWFsID1cblx0XHRcdFx0XHRcdFx0XHRwID09PSBMZXR0ZXJCID9cblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0QmluYXJ5IDpcblx0XHRcdFx0XHRcdFx0XHRwID09PSBMZXR0ZXJPID9cblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0T2N0YWwgOlxuXHRcdFx0XHRcdFx0XHRcdGlzRGlnaXRIZXhcblx0XHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXRTcGVjaWFsKVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0Y2FzZSBEb3Q6XG5cdFx0XHRcdFx0XHRcdGlmIChpc0RpZ2l0KHBlZWtOZXh0KCkpKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRcdFx0c2tpcFdoaWxlKGlzRGlnaXQpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdGlmICh0cnlFYXQoRG90KSlcblx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3Qgc3RyID0gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTnVtYmVyTGl0ZXJhbChsb2MoKSwgc3RyKSlcblx0XHRcdH0sXG5cdFx0XHRlYXRJbmRlbnQgPSAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9wdEluZGVudCA9IG9wdGlvbnMuaW5kZW50KClcblx0XHRcdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdFx0XHRjb25zdCBpbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGNoZWNrKHBlZWsoKSAhPT0gU3BhY2UsIHBvcywgJ0xpbmUgYmVnaW5zIGluIGEgc3BhY2UnKVxuXHRcdFx0XHRcdHJldHVybiBpbmRlbnRcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBzcGFjZXMgPSBza2lwV2hpbGVFcXVhbHMoU3BhY2UpXG5cdFx0XHRcdFx0Y2hlY2soc3BhY2VzICUgb3B0SW5kZW50ID09PSAwLCBwb3MsICgpID0+XG5cdFx0XHRcdFx0XHRgSW5kZW50YXRpb24gc3BhY2VzIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke29wdEluZGVudH1gKVxuXHRcdFx0XHRcdHJldHVybiBzcGFjZXMgLyBvcHRJbmRlbnRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0Y29uc3Rcblx0XHRcdGhhbmRsZU5hbWUgPSAoKSA9PiB7XG5cdFx0XHRcdGNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrUHJldigpKSwgbG9jKCksICgpID0+XG5cdFx0XHRcdFx0YFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKHBlZWtQcmV2KCkpfWApXG5cblx0XHRcdFx0Ly8gQWxsIG90aGVyIGNoYXJhY3RlcnMgc2hvdWxkIGJlIGhhbmRsZWQgaW4gYSBjYXNlIGFib3ZlLlxuXHRcdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0XHRpZiAobmFtZS5lbmRzV2l0aCgnXycpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUubGVuZ3RoID4gMSlcblx0XHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZvY3VzKVxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdFx0fSxcblx0XHRcdF9oYW5kbGVOYW1lID0gbmFtZSA9PiB7XG5cdFx0XHRcdGlmRWxzZShvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSksXG5cdFx0XHRcdFx0a2luZCA9PiB7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5SZWdpb246XG5cdFx0XHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuUmVnaW9uKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuVG9kbzpcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiB3YXJuXG5cdFx0XHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0a2V5d29yZChraW5kKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE5hbWUobG9jKCksIG5hbWUpKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHR9XG5cblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0c3RhcnRDb2x1bW4gPSBjb2x1bW5cblx0XHRcdGNvbnN0IGNoYXJhY3RlckVhdGVuID0gZWF0KClcblx0XHRcdC8vIEdlbmVyYWxseSwgdGhlIHR5cGUgb2YgYSB0b2tlbiBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXIuXG5cdFx0XHRzd2l0Y2ggKGNoYXJhY3RlckVhdGVuKSB7XG5cdFx0XHRcdGNhc2UgTnVsbENoYXI6XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdGNhc2UgQ2xvc2VCcmFjZTpcblx0XHRcdFx0XHRjaGVjayhpc0luUXVvdGUsIGxvYywgKCkgPT5cblx0XHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihDbG9zZUJyYWNlKX1gKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIFF1b3RlOlxuXHRcdFx0XHRcdGxleFF1b3RlKGluZGVudClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIEdST1VQU1xuXG5cdFx0XHRcdGNhc2UgT3BlblBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2xvc2VQYXJlbnRoZXNpcykpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE9wZW5CcmFja2V0OlxuXHRcdFx0XHRcdGlmICh0cnlFYXQoQ2xvc2VCcmFja2V0KSlcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBHcm91cChsb2MoKSwgW10sIEdyb3Vwcy5CcmFja2V0KSlcblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChzdGFydFBvcygpLCBHcm91cHMuQnJhY2tldClcblx0XHRcdFx0XHRcdG9wZW5Hcm91cChwb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlUGFyZW50aGVzaXM6XG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2tldDpcblx0XHRcdFx0XHRfY2xvc2VHcm91cChzdGFydFBvcygpLCBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0Y2xvc2VHcm91cChwb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBTcGFjZTpcblx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE5ld2xpbmU6IHtcblx0XHRcdFx0XHRjaGVjayghaXNJblF1b3RlLCBsb2MsICdRdW90ZSBpbnRlcnBvbGF0aW9uIGNhbm5vdCBjb250YWluIG5ld2xpbmUnKVxuXHRcdFx0XHRcdGlmIChwZWVrMkJlZm9yZSgpID09PSBTcGFjZSlcblx0XHRcdFx0XHRcdHdhcm4ocG9zLCAnTGluZSBlbmRzIGluIGEgc3BhY2UuJylcblxuXHRcdFx0XHRcdC8vIFNraXAgYW55IGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3Qgb2xkSW5kZW50ID0gaW5kZW50XG5cdFx0XHRcdFx0aW5kZW50ID0gZWF0SW5kZW50KClcblx0XHRcdFx0XHRpZiAoaW5kZW50ID4gb2xkSW5kZW50KSB7XG5cdFx0XHRcdFx0XHRjaGVjayhpbmRlbnQgPT09IG9sZEluZGVudCArIDEsIGxvYyxcblx0XHRcdFx0XHRcdFx0J0xpbmUgaXMgaW5kZW50ZWQgbW9yZSB0aGFuIG9uY2UnKVxuXHRcdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0XHQvLyBCbG9jayBhdCBlbmQgb2YgbGluZSBnb2VzIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gSG93ZXZlciwgYH5gIHByZWNlZGluZyBhIGJsb2NrIGdvZXMgaW4gYSBncm91cCB3aXRoIGl0LlxuXHRcdFx0XHRcdFx0aWYgKGlzRW1wdHkoY3VyR3JvdXAuc3ViVG9rZW5zKSB8fFxuXHRcdFx0XHRcdFx0XHQhaXNLZXl3b3JkKEtleXdvcmRzLkxhenksIGxhc3QoY3VyR3JvdXAuc3ViVG9rZW5zKSkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b3Blbkdyb3VwKGwuc3RhcnQsIEdyb3Vwcy5CbG9jaylcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBsID0gbG9jKClcblx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSBpbmRlbnQ7IGkgPCBvbGRJbmRlbnQ7IGkgPSBpICsgMSlcblx0XHRcdFx0XHRcdFx0Y2xvc2VHcm91cHNGb3JEZWRlbnQobC5zdGFydClcblx0XHRcdFx0XHRcdGNsb3NlTGluZShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0b3BlbkxpbmUobC5lbmQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBUYWI6XG5cdFx0XHRcdFx0Ly8gV2UgYWx3YXlzIGVhdCB0YWJzIGluIHRoZSBOZXdsaW5lIGhhbmRsZXIsXG5cdFx0XHRcdFx0Ly8gc28gdGhpcyB3aWxsIG9ubHkgaGFwcGVuIGluIHRoZSBtaWRkbGUgb2YgYSBsaW5lLlxuXHRcdFx0XHRcdGZhaWwobG9jKCksICdUYWIgbWF5IG9ubHkgYmUgdXNlZCB0byBpbmRlbnQnKVxuXG5cdFx0XHRcdC8vIEZVTlxuXG5cdFx0XHRcdGNhc2UgQmFuZzpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkRvKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgVGlsZGU6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICd+IScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbkRvKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHJ5RWF0KEJhcikpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkdlbilcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxhenkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBCYXI6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChTcGFjZSkgfHwgdHJ5RWF0KFRhYikpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHRleHQgPSBlYXRSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGlmICghKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5MaW5lICYmIGN1ckdyb3VwLnN1YlRva2Vucy5sZW5ndGggPT09IDApKVxuXHRcdFx0XHRcdFx0XHRmYWlsKGxvYyxcblx0XHRcdFx0XHRcdFx0XHRgRG9jIGNvbW1lbnQgbXVzdCBnbyBvbiBpdHMgb3duIGxpbmUuIERpZCB5b3UgbWVhbiAke2NvZGUoJ3x8Jyl9P2ApXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgRG9jQ29tbWVudChsb2MoKSwgdGV4dCkpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdC8vIG5vbi1kb2MgY29tbWVudFxuXHRcdFx0XHRcdFx0c2tpcFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuKVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Ly8gTlVNQkVSXG5cblx0XHRcdFx0Y2FzZSBIeXBoZW46XG5cdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVlaygpKSlcblx0XHRcdFx0XHRcdC8vIGVhdEFuZEFkZE51bWJlcigpIGxvb2tzIGF0IHByZXYgY2hhcmFjdGVyLCBzbyBoeXBoZW4gaW5jbHVkZWQuXG5cdFx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgTjA6IGNhc2UgTjE6IGNhc2UgTjI6IGNhc2UgTjM6IGNhc2UgTjQ6XG5cdFx0XHRcdGNhc2UgTjU6IGNhc2UgTjY6IGNhc2UgTjc6IGNhc2UgTjg6IGNhc2UgTjk6XG5cdFx0XHRcdFx0ZWF0QW5kQWRkTnVtYmVyKClcblx0XHRcdFx0XHRicmVha1xuXG5cblx0XHRcdFx0Ly8gT1RIRVJcblxuXHRcdFx0XHRjYXNlIERvdDoge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBwZWVrKClcblx0XHRcdFx0XHRpZiAobmV4dCA9PT0gU3BhY2UgfHwgbmV4dCA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRcdFx0Ly8gT2JqTGl0IGFzc2lnbiBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdC8vIFdlIGNhbid0IGp1c3QgY3JlYXRlIGEgbmV3IEdyb3VwIGhlcmUgYmVjYXVzZSB3ZSB3YW50IHRvXG5cdFx0XHRcdFx0XHQvLyBlbnN1cmUgaXQncyBub3QgcGFydCBvZiB0aGUgcHJlY2VkaW5nIG9yIGZvbGxvd2luZyBzcGFjZWQgZ3JvdXAuXG5cdFx0XHRcdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KHN0YXJ0UG9zKCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLk9iakFzc2lnbilcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhcikge1xuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXMpXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IEJhbmcgJiYgcGVla05leHQoKSA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5GdW5UaGlzRG8pXG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5leHQgPT09IFRpbGRlKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGlmICh0cnlFYXQoQmFuZykpIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcufiEnKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW5Ebylcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG11c3RFYXQoQmFyLCAnLn4nKVxuXHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNHZW4pXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzcGFjZShsb2MoKSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHBlZWsoKSA9PT0gRG90ICYmIHBlZWtOZXh0KCkgPT09IERvdCkge1xuXHRcdFx0XHRcdFx0ZWF0KClcblx0XHRcdFx0XHRcdGVhdCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkVsbGlwc2lzKVxuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Eb3QpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNhc2UgQ29sb246XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChDb2xvbikpIHtcblx0XHRcdFx0XHRcdG11c3RFYXQoRXF1YWwsICc6OicpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkFzc2lnbk11dGFibGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoRXF1YWwpKVxuXHRcdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Mb2NhbE11dGF0ZSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlR5cGUpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIEFtcGVyc2FuZDogY2FzZSBCYWNrc2xhc2g6IGNhc2UgQmFja3RpY2s6IGNhc2UgQ2FyZXQ6XG5cdFx0XHRcdGNhc2UgQ29tbWE6IGNhc2UgUGVyY2VudDogY2FzZSBTZW1pY29sb246XG5cdFx0XHRcdFx0ZmFpbChsb2MoKSwgYFJlc2VydmVkIGNoYXJhY3RlciAke3Nob3dDaGFyKGNoYXJhY3RlckVhdGVuKX1gKVxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGhhbmRsZU5hbWUoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGxleFF1b3RlID0gaW5kZW50ID0+IHtcblx0XHRjb25zdCBxdW90ZUluZGVudCA9IGluZGVudCArIDFcblxuXHRcdC8vIEluZGVudGVkIHF1b3RlIGlzIGNoYXJhY3Rlcml6ZWQgYnkgYmVpbmcgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgYSBuZXdsaW5lLlxuXHRcdC8vIFRoZSBuZXh0IGxpbmUgKm11c3QqIGhhdmUgc29tZSBjb250ZW50IGF0IHRoZSBuZXh0IGluZGVudGF0aW9uLlxuXHRcdGNvbnN0IGlzSW5kZW50ZWQgPSB0cnlFYXROZXdsaW5lKClcblx0XHRpZiAoaXNJbmRlbnRlZCkge1xuXHRcdFx0Y29uc3QgYWN0dWFsSW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdGNoZWNrKGFjdHVhbEluZGVudCA9PT0gcXVvdGVJbmRlbnQsIHBvcyxcblx0XHRcdFx0J0luZGVudGVkIHF1b3RlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBtb3JlIGluZGVudCB0aGFuIHByZXZpb3VzIGxpbmUuJylcblx0XHR9XG5cblx0XHQvLyBDdXJyZW50IHN0cmluZyBsaXRlcmFsIHBhcnQgb2YgcXVvdGUgd2UgYXJlIHJlYWRpbmcuXG5cdFx0Ly8gVGhpcyBpcyBhIHJhdyB2YWx1ZS5cblx0XHRsZXQgcmVhZCA9ICcnXG5cblx0XHRjb25zdCBtYXliZU91dHB1dFJlYWQgPSAoKSA9PiB7XG5cdFx0XHRpZiAocmVhZCAhPT0gJycpIHtcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAocmVhZClcblx0XHRcdFx0cmVhZCA9ICcnXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbG9jU2luZ2xlID0gKCkgPT4gc2luZ2xlQ2hhckxvYyhwb3MoKSlcblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR3JvdXBzLlF1b3RlKVxuXG5cdFx0ZWF0Q2hhcnM6IHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBjaGFyID0gZWF0KClcblx0XHRcdHN3aXRjaCAoY2hhcikge1xuXHRcdFx0XHRjYXNlIEJhY2tzbGFzaDoge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBlYXQoKVxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgYFxcXFwke1N0cmluZy5mcm9tQ2hhckNvZGUobmV4dCl9YFxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gU2luY2UgdGhlc2UgY29tcGlsZSB0byB0ZW1wbGF0ZSBsaXRlcmFscywgaGF2ZSB0byByZW1lbWJlciB0byBlc2NhcGUuXG5cdFx0XHRcdGNhc2UgQmFja3RpY2s6XG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyAnXFxcXGAnXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2U6IHtcblx0XHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRG9uJ3QgbmVlZCBgY2FzZSBOdWxsQ2hhcjpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdFx0b3JpZ2luYWxQb3MuY29sdW1uID0gb3JpZ2luYWxQb3MuY29sdW1uIC0gMVxuXG5cdFx0XHRcdFx0Y2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3VwKHBvcygpLCBHcm91cHMuUXVvdGUpXG5cdH1cblxuXHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKFN0YXJ0UG9zLCBudWxsKSwgW10sIEdyb3Vwcy5CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmNvbnN0IGNjID0gXyA9PiBfLmNoYXJDb2RlQXQoMClcbmNvbnN0XG5cdEFtcGVyc2FuZCA9IGNjKCcmJyksXG5cdEJhY2tzbGFzaCA9IGNjKCdcXFxcJyksXG5cdEJhY2t0aWNrID0gY2MoJ2AnKSxcblx0QmFuZyA9IGNjKCchJyksXG5cdEJhciA9IGNjKCd8JyksXG5cdENhcmV0ID0gY2MoJ14nKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIeXBoZW4gPSBjYygnLScpLFxuXHRMZXR0ZXJCID0gY2MoJ2InKSxcblx0TGV0dGVyTyA9IGNjKCdvJyksXG5cdExldHRlclggPSBjYygneCcpLFxuXHROMCA9IGNjKCcwJyksXG5cdE4xID0gY2MoJzEnKSxcblx0TjIgPSBjYygnMicpLFxuXHROMyA9IGNjKCczJyksXG5cdE40ID0gY2MoJzQnKSxcblx0TjUgPSBjYygnNScpLFxuXHRONiA9IGNjKCc2JyksXG5cdE43ID0gY2MoJzcnKSxcblx0TjggPSBjYygnOCcpLFxuXHROOSA9IGNjKCc5JyksXG5cdE5ld2xpbmUgPSBjYygnXFxuJyksXG5cdE51bGxDaGFyID0gY2MoJ1xcMCcpLFxuXHRPcGVuQnJhY2UgPSBjYygneycpLFxuXHRPcGVuQnJhY2tldCA9IGNjKCdbJyksXG5cdE9wZW5QYXJlbnRoZXNpcyA9IGNjKCcoJyksXG5cdFBlcmNlbnQgPSBjYygnJScpLFxuXHRRdW90ZSA9IGNjKCdcIicpLFxuXHRTZW1pY29sb24gPSBjYygnOycpLFxuXHRTcGFjZSA9IGNjKCcgJyksXG5cdFRhYiA9IGNjKCdcXHQnKSxcblx0VGlsZGUgPSBjYygnficpXG5cbmNvbnN0XG5cdHNob3dDaGFyID0gY2hhciA9PiBjb2RlKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcikpLFxuXHRfY2hhclByZWQgPSAoY2hhcnMsIG5lZ2F0ZSkgPT4ge1xuXHRcdGxldCBzcmMgPSAnc3dpdGNoKGNoKSB7XFxuJ1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0XHRzcmMgPSBgJHtzcmN9Y2FzZSAke2NoYXJzLmNoYXJDb2RlQXQoaSl9OiBgXG5cdFx0c3JjID0gYCR7c3JjfSByZXR1cm4gJHshbmVnYXRlfVxcbmRlZmF1bHQ6IHJldHVybiAke25lZ2F0ZX1cXG59YFxuXHRcdHJldHVybiBGdW5jdGlvbignY2gnLCBzcmMpXG5cdH0sXG5cdGlzRGlnaXQgPSBfY2hhclByZWQoJzAxMjM0NTY3ODknKSxcblx0aXNEaWdpdEJpbmFyeSA9IF9jaGFyUHJlZCgnMDEnKSxcblx0aXNEaWdpdE9jdGFsID0gX2NoYXJQcmVkKCcwMTIzNDU2NycpLFxuXHRpc0RpZ2l0SGV4ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5YWJjZGVmJyksXG5cblx0Ly8gQW55dGhpbmcgbm90IGV4cGxpY2l0bHkgcmVzZXJ2ZWQgaXMgYSB2YWxpZCBuYW1lIGNoYXJhY3Rlci5cblx0cmVzZXJ2ZWRDaGFyYWN0ZXJzID0gJ2AjJV4mXFxcXFxcJzssJyxcblx0aXNOYW1lQ2hhcmFjdGVyID0gX2NoYXJQcmVkKCcoKVtde30uOnwgXFxuXFx0XCInICsgcmVzZXJ2ZWRDaGFyYWN0ZXJzLCB0cnVlKVxuIl19