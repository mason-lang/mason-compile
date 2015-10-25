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
					case Cash:
						if (tryEat(Bang)) {
							mustEat(Bar, '$!');
							funKeyword(_Token.Keywords.FunAsyncDo);
						} else if (tryEat(Bar)) funKeyword(_Token.Keywords.FunAsync);else handleName();
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
	      Cash = cc('$'),
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

	function showChar(char) {
		return (0, _CompileError.code)(String.fromCharCode(char));
	}

	function _charPred(chars, negate) {
		let src = 'switch(ch) {\n';
		for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;
		src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
		return Function('ch', src);
	}

	const isDigit = _charPred('0123456789'),
	      isDigitBinary = _charPred('01'),
	      isDigitOctal = _charPred('01234567'),
	      isDigitHex = _charPred('0123456789abcdef');

	// Anything not explicitly reserved is a valid name character.
	const reservedCharacters = '`#%^&\\\';,';
	const isNameCharacter = _charPred('()[]{}.:| \n\t"' + reservedCharacters, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2xleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBa0J3QixHQUFHOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFaLFVBQVMsR0FBRyxDQUFDLFlBQVksRUFBRTs7QUFFekMsZUFsQk8sS0FBSyxFQWtCTixZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFwQkwsUUFBUSxFQW9CUyxrQ0FBa0MsQ0FBQyxDQUFBOzs7Ozs7O0FBT2hGLGNBQVksR0FBRyxDQUFDLEdBQUUsWUFBWSxFQUFDLEVBQUUsQ0FBQyxDQUFBOzs7Ozs7OztBQVFsQyxRQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDckIsTUFBSSxRQUFRLENBQUE7QUFDWixRQUNDLGlCQUFpQixHQUFHLEtBQUssSUFBSTtBQUM1QixXQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUM5QjtRQUVELFNBQVMsR0FBRyxNQUFNO0FBQ2pCLFdBQVEsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUE7R0FDM0I7Ozs7O0FBSUQsV0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsS0FBSztBQUNuQyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBaERNLEtBQUssQ0FnREQsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUMzRDtRQUVELGVBQWUsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDMUMsT0FBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFDOUIsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUNqQztRQUVELFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLEtBQUs7QUFDckMsZ0JBM0RLLEtBQUssRUEyREosU0FBUyxLQUFLLFFBQVEsQ0FBQyxJ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LEdBQUUsQ0FBQyxNQUFNLEVBQUMsa0JBQWtCLEdBQUUsTUFBTSxFQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzlELFNBQU8sUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtFQUMxQjs7QUFFRCxPQUNDLE9BQU8sR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO09BQ2pDLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO09BQy9CLFlBQVksR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO09BQ3BDLFVBQVUsR0FBRyxTQUFTLENBQUMsa0JBQWtCLENBQUMsQ0FBQTs7O0FBRzNDLE9BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFBO0FBQ3hDLE9BQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQSIsImZpbGUiOiJsZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9jLCB7UG9zLCBTdGFydExpbmUsIFN0YXJ0TG9jLCBTdGFydFBvcywgU3RhcnRDb2x1bW4sIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IHtjb2RlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCBvcHRpb25zLCB3YXJufSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge051bWJlckxpdGVyYWx9IGZyb20gJy4vTXNBc3QnXG5pbXBvcnQge0RvY0NvbW1lbnQsIEdyb3VwLCBHcm91cHMsIGlzS2V5d29yZCwgS2V5d29yZCwgS2V5d29yZHMsIE5hbWUsIG9wS2V5d29yZEtpbmRGcm9tTmFtZSxcblx0c2hvd0dyb3VwS2luZH0gZnJvbSAnLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0LCBpZkVsc2UsIGlzRW1wdHksIGxhc3R9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5MZXhlcyB0aGUgc291cmNlIGNvZGUgaW50byB7QGxpbmsgVG9rZW59cy5cblRoZSBNYXNvbiBsZXhlciBhbHNvIGdyb3VwcyB0b2tlbnMgYXMgcGFydCBvZiBsZXhpbmcuXG5UaGlzIG1ha2VzIHdyaXRpbmcgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIgZWFzeS5cblNlZSB7QGxpbmsgR3JvdXB9LlxuXG5AcGFyYW0ge3N0cmluZ30gc291cmNlU3RyaW5nXG5AcmV0dXJuIHtHcm91cDxHcm91cHMuQmxvY2s+fVxuXHRCbG9jayB0b2tlbiByZXByZXNlbnRpbmcgdGhlIHdob2xlIG1vZHVsZS5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsZXgoc291cmNlU3RyaW5nKSB7XG5cdC8vIEFsZ29yaXRobSByZXF1aXJlcyB0cmFpbGluZyBuZXdsaW5lIHRvIGNsb3NlIGFueSBibG9ja3MuXG5cdGNoZWNrKHNvdXJjZVN0cmluZy5lbmRzV2l0aCgnXFxuJyksIFN0YXJ0TG9jLCAnU291cmNlIGNvZGUgbXVzdCBlbmQgaW4gbmV3bGluZS4nKVxuXG5cdC8qXG5cdFVzZSBhIDAtdGVybWluYXRlZCBzdHJpbmcgc28gdGhhdCB3ZSBjYW4gdXNlIGAwYCBhcyBhIHN3aXRjaCBjYXNlLlxuXHRUaGlzIGlzIGZhc3RlciB0aGFuIGNoZWNraW5nIHdoZXRoZXIgaW5kZXggPT09IGxlbmd0aC5cblx0KElmIHdlIGNoZWNrIHBhc3QgdGhlIGVuZCBvZiB0aGUgc3RyaW5nIHdlIGdldCBgTmFOYCwgd2hpY2ggY2FuJ3QgYmUgc3dpdGNoZWQgb24uKVxuXHQqL1xuXHRzb3VyY2VTdHJpbmcgPSBgJHtzb3VyY2VTdHJpbmd9XFwwYFxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIEdST1VQSU5HXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFdlIG9ubHkgZXZlciB3cml0ZSB0byB0aGUgaW5uZXJtb3N0IEdyb3VwO1xuXHQvLyB3aGVuIHdlIGNsb3NlIHRoYXQgR3JvdXAgd2UgYWRkIGl0IHRvIHRoZSBlbmNsb3NpbmcgR3JvdXAgYW5kIGNvbnRpbnVlIHdpdGggdGhhdCBvbmUuXG5cdC8vIE5vdGUgdGhhdCBgY3VyR3JvdXBgIGlzIGNvbmNlcHR1YWxseSB0aGUgdG9wIG9mIHRoZSBzdGFjaywgYnV0IGlzIG5vdCBzdG9yZWQgaW4gYHN0YWNrYC5cblx0Y29uc3QgZ3JvdXBTdGFjayA9IFtdXG5cdGxldCBjdXJHcm91cFxuXHRjb25zdFxuXHRcdGFkZFRvQ3VycmVudEdyb3VwID0gdG9rZW4gPT4ge1xuXHRcdFx0Y3VyR3JvdXAuc3ViVG9rZW5zLnB1c2godG9rZW4pXG5cdFx0fSxcblxuXHRcdGRyb3BHcm91cCA9ICgpID0+IHtcblx0XHRcdGN1ckdyb3VwID0gZ3JvdXBTdGFjay5wb3AoKVxuXHRcdH0sXG5cblx0XHQvLyBQYXVzZSB3cml0aW5nIHRvIGN1ckdyb3VwIGluIGZhdm9yIG9mIHdyaXRpbmcgdG8gYSBzdWItZ3JvdXAuXG5cdFx0Ly8gV2hlbiB0aGUgc3ViLWdyb3VwIGZpbmlzaGVzIHdlIHdpbGwgcG9wIHRoZSBzdGFjayBhbmQgcmVzdW1lIHdyaXRpbmcgdG8gaXRzIHBhcmVudC5cblx0XHRvcGVuR3JvdXAgPSAob3BlblBvcywgZ3JvdXBLaW5kKSA9PiB7XG5cdFx0XHRncm91cFN0YWNrLnB1c2goY3VyR3JvdXApXG5cdFx0XHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdFx0XHQvLyBjdXJHcm91cC5sb2MuZW5kIHdpbGwgYmUgd3JpdHRlbiB0byB3aGVuIGNsb3NpbmcgaXQuXG5cdFx0XHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKG9wZW5Qb3MsIG51bGwpLCBbXSwgZ3JvdXBLaW5kKVxuXHRcdH0sXG5cblx0XHRtYXliZUNsb3NlR3JvdXAgPSAoY2xvc2VQb3MsIGNsb3NlS2luZCkgPT4ge1xuXHRcdFx0aWYgKGN1ckdyb3VwLmtpbmQgPT09IGNsb3NlS2luZClcblx0XHRcdFx0X2Nsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZClcblx0XHR9LFxuXG5cdFx0Y2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRjaGVjayhjbG9zZUtpbmQgPT09IGN1ckdyb3VwLmtpbmQsIGNsb3NlUG9zLCAoKSA9PlxuXHRcdFx0XHRgVHJ5aW5nIHRvIGNsb3NlICR7c2hvd0dyb3VwS2luZChjbG9zZUtpbmQpfSwgYCArXG5cdFx0XHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHRcdH0sXG5cblx0XHRfY2xvc2VHcm91cCA9IChjbG9zZVBvcywgY2xvc2VLaW5kKSA9PiB7XG5cdFx0XHRsZXQganVzdENsb3NlZCA9IGN1ckdyb3VwXG5cdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0anVzdENsb3NlZC5sb2MuZW5kID0gY2xvc2VQb3Ncblx0XHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRcdGNhc2UgR3JvdXBzLlNwYWNlOiB7XG5cdFx0XHRcdFx0Y29uc3Qgc2l6ZSA9IGp1c3RDbG9zZWQuc3ViVG9rZW5zLmxlbmd0aFxuXHRcdFx0XHRcdGlmIChzaXplICE9PSAwKVxuXHRcdFx0XHRcdFx0Ly8gU3BhY2VkIHNob3VsZCBhbHdheXMgaGF2ZSBhdCBsZWFzdCB0d28gZWxlbWVudHMuXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChzaXplID09PSAxID8ganVzdENsb3NlZC5zdWJUb2tlbnNbMF0gOiBqdXN0Q2xvc2VkKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHdhcm4oanVzdENsb3NlZC5sb2MsICdVbm5lY2Vzc2FyeSBzcGFjZS4nKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBHcm91cHMuTGluZTpcblx0XHRcdFx0XHQvLyBMaW5lIG11c3QgaGF2ZSBjb250ZW50LlxuXHRcdFx0XHRcdC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGVyZSB3YXMganVzdCBhIGNvbW1lbnQuXG5cdFx0XHRcdFx0aWYgKCFpc0VtcHR5KGp1c3RDbG9zZWQuc3ViVG9rZW5zKSlcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBHcm91cHMuQmxvY2s6XG5cdFx0XHRcdFx0Y2hlY2soIWlzRW1wdHkoanVzdENsb3NlZC5zdWJUb2tlbnMpLCBjbG9zZVBvcywgJ0VtcHR5IGJsb2NrLicpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkgPSBwb3MgPT4ge1xuXHRcdFx0YXNzZXJ0KGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdGlmIChjdXJHcm91cC5zdWJUb2tlbnMubGVuZ3RoID09PSAwKVxuXHRcdFx0XHRkcm9wR3JvdXAoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRfY2xvc2VHcm91cChwb3MsIEdyb3Vwcy5TcGFjZSlcblx0XHR9LFxuXG5cdFx0b3BlblBhcmVudGhlc2lzID0gbG9jID0+IHtcblx0XHRcdG9wZW5Hcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5QYXJlbnRoZXNpcylcblx0XHRcdG9wZW5Hcm91cChsb2MuZW5kLCBHcm91cHMuU3BhY2UpXG5cdFx0fSxcblxuXHRcdGNsb3NlUGFyZW50aGVzaXMgPSBsb2MgPT4ge1xuXHRcdFx0X2Nsb3NlR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuU3BhY2UpXG5cdFx0XHRjbG9zZUdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5QYXJlbnRoZXNpcylcblx0XHR9LFxuXG5cdFx0Y2xvc2VHcm91cHNGb3JEZWRlbnQgPSBwb3MgPT4ge1xuXHRcdFx0Y2xvc2VMaW5lKHBvcylcblx0XHRcdGNsb3NlR3JvdXAocG9zLCBHcm91cHMuQmxvY2spXG5cdFx0XHQvLyBJdCdzIE9LIHRvIGJlIG1pc3NpbmcgYSBjbG9zaW5nIHBhcmVudGhlc2lzIGlmIHRoZXJlJ3MgYSBibG9jay4gRS5nLjpcblx0XHRcdC8vIGEgKGJcblx0XHRcdC8vXHRjIHwgbm8gY2xvc2luZyBwYXJlbiBoZXJlXG5cdFx0XHR3aGlsZSAoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlBhcmVudGhlc2lzIHx8IGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0X2Nsb3NlR3JvdXAocG9zLCBjdXJHcm91cC5raW5kKVxuXHRcdH0sXG5cblx0XHQvLyBXaGVuIHN0YXJ0aW5nIGEgbmV3IGxpbmUsIGEgc3BhY2VkIGdyb3VwIGlzIGNyZWF0ZWQgaW1wbGljaXRseS5cblx0XHRvcGVuTGluZSA9IHBvcyA9PiB7XG5cdFx0XHRvcGVuR3JvdXAocG9zLCBHcm91cHMuTGluZSlcblx0XHRcdG9wZW5Hcm91cChwb3MsIEdyb3Vwcy5TcGFjZSlcblx0XHR9LFxuXG5cdFx0Y2xvc2VMaW5lID0gcG9zID0+IHtcblx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoKVxuXHRcdFx0Y2xvc2VHcm91cChwb3MsIEdyb3Vwcy5MaW5lKVxuXHRcdH0sXG5cblx0XHQvLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5cdFx0c3BhY2UgPSBsb2MgPT4ge1xuXHRcdFx0bWF5YmVDbG9zZUdyb3VwKGxvYy5zdGFydCwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gSVRFUkFUSU5HIFRIUk9VR0ggU09VUkNFU1RSSU5HXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8qXG5cdFRoZXNlIGFyZSBrZXB0IHVwLXRvLWRhdGUgYXMgd2UgaXRlcmF0ZSB0aHJvdWdoIHNvdXJjZVN0cmluZy5cblx0RXZlcnkgYWNjZXNzIHRvIGluZGV4IGhhcyBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gbGluZSBhbmQvb3IgY29sdW1uLlxuXHRUaGlzIGFsc28gZXhwbGFpbnMgd2h5IHRoZXJlIGFyZSBkaWZmZXJlbnQgZnVuY3Rpb25zIGZvciBuZXdsaW5lcyB2cyBvdGhlciBjaGFyYWN0ZXJzLlxuXHQqL1xuXHRsZXQgaW5kZXggPSAwLCBsaW5lID0gU3RhcnRMaW5lLCBjb2x1bW4gPSBTdGFydENvbHVtblxuXG5cdC8qXG5cdE5PVEU6IFdlIHVzZSBjaGFyYWN0ZXIgKmNvZGVzKiBmb3IgZXZlcnl0aGluZy5cblx0Q2hhcmFjdGVycyBhcmUgb2YgdHlwZSBOdW1iZXIgYW5kIG5vdCBqdXN0IFN0cmluZ3Mgb2YgbGVuZ3RoIG9uZS5cblx0Ki9cblx0Y29uc3Rcblx0XHRwb3MgPSAoKSA9PiBuZXcgUG9zKGxpbmUsIGNvbHVtbiksXG5cblx0XHRwZWVrID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpLFxuXHRcdHBlZWtOZXh0ID0gKCkgPT4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggKyAxKSxcblx0XHRwZWVrUHJldiA9ICgpID0+IHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4IC0gMSksXG5cdFx0cGVlazJCZWZvcmUgPSAoKSA9PiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDIpLFxuXG5cdFx0Ly8gTWF5IGVhdCBhIE5ld2xpbmUuXG5cdFx0Ly8gQ2FsbGVyICptdXN0KiBjaGVjayBmb3IgdGhhdCBjYXNlIGFuZCBpbmNyZW1lbnQgbGluZSFcblx0XHRlYXQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBjaGFyID0gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpXG5cdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0cmV0dXJuIGNoYXJcblx0XHR9LFxuXHRcdHNraXAgPSBlYXQsXG5cblx0XHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0XHR0cnlFYXQgPSBjaGFyVG9FYXQgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBjaGFyVG9FYXRcblx0XHRcdGlmIChjYW5FYXQpIHtcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdFx0Y29sdW1uID0gY29sdW1uICsgMVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHRtdXN0RWF0ID0gKGNoYXJUb0VhdCwgcHJlY2VkZWRCeSkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gdHJ5RWF0KGNoYXJUb0VhdClcblx0XHRcdGNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRgJHtjb2RlKHByZWNlZGVkQnkpfSBtdXN0IGJlIGZvbGxvd2VkIGJ5ICR7c2hvd0NoYXIoY2hhclRvRWF0KX1gKVxuXHRcdH0sXG5cblx0XHR0cnlFYXROZXdsaW5lID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBOZXdsaW5lXG5cdFx0XHRpZiAoY2FuRWF0KSB7XG5cdFx0XHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdFx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0XHRjb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbkVhdFxuXHRcdH0sXG5cblx0XHQvLyBDYWxsZXIgbXVzdCBlbnN1cmUgdGhhdCBiYWNraW5nIHVwIG5DaGFyc1RvQmFja1VwIGNoYXJhY3RlcnMgYnJpbmdzIHVzIHRvIG9sZFBvcy5cblx0XHRzdGVwQmFja01hbnkgPSAob2xkUG9zLCBuQ2hhcnNUb0JhY2tVcCkgPT4ge1xuXHRcdFx0aW5kZXggPSBpbmRleCAtIG5DaGFyc1RvQmFja1VwXG5cdFx0XHRsaW5lID0gb2xkUG9zLmxpbmVcblx0XHRcdGNvbHVtbiA9IG9sZFBvcy5jb2x1bW5cblx0XHR9LFxuXG5cdFx0Ly8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG5cdFx0Ly8gY2hhcmFjdGVyUHJlZGljYXRlIG11c3QgKm5vdCogYWNjZXB0IE5ld2xpbmUuXG5cdFx0Ly8gT3RoZXJ3aXNlIHRoZXJlIG1heSBiZSBhbiBpbmZpbml0ZSBsb29wIVxuXHRcdHRha2VXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSxcblx0XHR0YWtlV2hpbGVXaXRoUHJldiA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PlxuXHRcdFx0X3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCAtIDEsIGNoYXJhY3RlclByZWRpY2F0ZSksXG5cdFx0X3Rha2VXaGlsZVdpdGhTdGFydCA9IChzdGFydEluZGV4LCBjaGFyYWN0ZXJQcmVkaWNhdGUpID0+IHtcblx0XHRcdHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpXG5cdFx0XHRyZXR1cm4gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHRcdH0sXG5cblx0XHRza2lwV2hpbGVFcXVhbHMgPSBjaGFyID0+XG5cdFx0XHRza2lwV2hpbGUoXyA9PiBfID09PSBjaGFyKSxcblxuXHRcdHNraXBSZXN0T2ZMaW5lID0gKCkgPT5cblx0XHRcdHNraXBXaGlsZShfID0+IF8gIT09IE5ld2xpbmUpLFxuXG5cdFx0ZWF0UmVzdE9mTGluZSA9ICgpID0+XG5cdFx0XHR0YWtlV2hpbGUoXyA9PiBfICE9PSBOZXdsaW5lKSxcblxuXHRcdHNraXBXaGlsZSA9IGNoYXJhY3RlclByZWRpY2F0ZSA9PiB7XG5cdFx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0XHRcdHdoaWxlIChjaGFyYWN0ZXJQcmVkaWNhdGUocGVlaygpKSlcblx0XHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIGRpZmZcblx0XHRcdHJldHVybiBkaWZmXG5cdFx0fSxcblxuXHRcdC8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG5cdFx0Ly8gUmV0dXJucyAjIHRvdGFsIG5ld2xpbmVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0LlxuXHRcdHNraXBOZXdsaW5lcyA9ICgpID0+IHtcblx0XHRcdGNvbnN0IHN0YXJ0TGluZSA9IGxpbmVcblx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0d2hpbGUgKHBlZWsoKSA9PT0gTmV3bGluZSkge1xuXHRcdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0XHRsaW5lID0gbGluZSArIDFcblx0XHRcdH1cblx0XHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0XHRyZXR1cm4gbGluZSAtIHN0YXJ0TGluZVxuXHRcdH1cblxuXHQvLyBTcHJpbmtsZSBjaGVja1BvcygpIGFyb3VuZCB0byBkZWJ1ZyBsaW5lIGFuZCBjb2x1bW4gdHJhY2tpbmcgZXJyb3JzLlxuXHQvKlxuXHRjb25zdFxuXHRcdGNoZWNrUG9zID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgcCA9IF9nZXRDb3JyZWN0UG9zKClcblx0XHRcdGlmIChwLmxpbmUgIT09IGxpbmUgfHwgcC5jb2x1bW4gIT09IGNvbHVtbilcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxuXHRcdH0sXG5cdFx0X2luZGV4VG9Qb3MgPSBuZXcgTWFwKCksXG5cdFx0X2dldENvcnJlY3RQb3MgPSAoKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXggPT09IDApXG5cdFx0XHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRcdFx0bGV0IG9sZFBvcywgb2xkSW5kZXhcblx0XHRcdGZvciAob2xkSW5kZXggPSBpbmRleCAtIDE7IDsgb2xkSW5kZXggPSBvbGRJbmRleCAtIDEpIHtcblx0XHRcdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdFx0XHRpZiAob2xkUG9zICE9PSB1bmRlZmluZWQpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdFx0XHR9XG5cdFx0XHRsZXQgbmV3TGluZSA9IG9sZFBvcy5saW5lLCBuZXdDb2x1bW4gPSBvbGRQb3MuY29sdW1uXG5cdFx0XHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0XHRcdGlmIChzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChvbGRJbmRleCkgPT09IE5ld2xpbmUpIHtcblx0XHRcdFx0XHRuZXdMaW5lID0gbmV3TGluZSArIDFcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRuZXdDb2x1bW4gPSBuZXdDb2x1bW4gKyAxXG5cblx0XHRcdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRcdFx0X2luZGV4VG9Qb3Muc2V0KGluZGV4LCBwKVxuXHRcdFx0cmV0dXJuIHBcblx0XHR9XG5cdCovXG5cblx0Lypcblx0SW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuXHRXaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cblx0Ki9cblx0Y29uc3QgbGV4UGxhaW4gPSBpc0luUXVvdGUgPT4ge1xuXHRcdC8vIFRoaXMgdGVsbHMgdXMgd2hpY2ggaW5kZW50ZWQgYmxvY2sgd2UncmUgaW4uXG5cdFx0Ly8gSW5jcmVtZW50aW5nIGl0IG1lYW5zIGlzc3VpbmcgYSBHUF9PcGVuQmxvY2sgYW5kIGRlY3JlbWVudGluZyBpdCBtZWFucyBhIEdQX0Nsb3NlQmxvY2suXG5cdFx0Ly8gRG9lcyBub3RoaW5nIGlmIGlzSW5RdW90ZS5cblx0XHRsZXQgaW5kZW50ID0gMFxuXG5cdFx0Ly8gTWFrZSBjbG9zdXJlcyBub3cgcmF0aGVyIHRoYW4gaW5zaWRlIHRoZSBsb29wLlxuXHRcdC8vIFRoaXMgaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXIgYXMgb2Ygbm9kZSB2MC4xMS4xNC5cblxuXHRcdC8vIFRoaXMgaXMgd2hlcmUgd2Ugc3RhcnRlZCBsZXhpbmcgdGhlIGN1cnJlbnQgdG9rZW4uXG5cdFx0bGV0IHN0YXJ0Q29sdW1uXG5cdFx0Y29uc3Rcblx0XHRcdHN0YXJ0UG9zID0gKCkgPT4gbmV3IFBvcyhsaW5lLCBzdGFydENvbHVtbiksXG5cdFx0XHRsb2MgPSAoKSA9PiBuZXcgTG9jKHN0YXJ0UG9zKCksIHBvcygpKSxcblx0XHRcdGtleXdvcmQgPSBraW5kID0+XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBLZXl3b3JkKGxvYygpLCBraW5kKSksXG5cdFx0XHRmdW5LZXl3b3JkID0ga2luZCA9PiB7XG5cdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0fSxcblx0XHRcdGVhdEFuZEFkZE51bWJlciA9ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHRcdHRyeUVhdChIeXBoZW4pXG5cdFx0XHRcdGlmIChwZWVrUHJldigpID09PSBOMCkge1xuXHRcdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRcdGNhc2UgTGV0dGVyQjogY2FzZSBMZXR0ZXJPOiBjYXNlIExldHRlclg6XG5cdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRjb25zdCBpc0RpZ2l0U3BlY2lhbCA9XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyQiA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdFx0cCA9PT0gTGV0dGVyTyA/XG5cdFx0XHRcdFx0XHRcdFx0aXNEaWdpdE9jdGFsIDpcblx0XHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0U3BlY2lhbClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrTmV4dCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0XHRpZiAodHJ5RWF0KERvdCkpXG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHN0ciA9IHNvdXJjZVN0cmluZy5zbGljZShzdGFydEluZGV4LCBpbmRleClcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IE51bWJlckxpdGVyYWwobG9jKCksIHN0cikpXG5cdFx0XHR9LFxuXHRcdFx0ZWF0SW5kZW50ID0gKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvcHRJbmRlbnQgPSBvcHRpb25zLmluZGVudCgpXG5cdFx0XHRcdGlmIChvcHRJbmRlbnQgPT09ICdcXHQnKSB7XG5cdFx0XHRcdFx0Y29uc3QgaW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRjaGVjayhwZWVrKCkgIT09IFNwYWNlLCBwb3MsICdMaW5lIGJlZ2lucyBpbiBhIHNwYWNlJylcblx0XHRcdFx0XHRyZXR1cm4gaW5kZW50XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgc3BhY2VzID0gc2tpcFdoaWxlRXF1YWxzKFNwYWNlKVxuXHRcdFx0XHRcdGNoZWNrKHNwYWNlcyAlIG9wdEluZGVudCA9PT0gMCwgcG9zLCAoKSA9PlxuXHRcdFx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdFx0XHRyZXR1cm4gc3BhY2VzIC8gb3B0SW5kZW50XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdGNvbnN0XG5cdFx0XHRoYW5kbGVOYW1lID0gKCkgPT4ge1xuXHRcdFx0XHRjaGVjayhpc05hbWVDaGFyYWN0ZXIocGVla1ByZXYoKSksIGxvYygpLCAoKSA9PlxuXHRcdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihwZWVrUHJldigpKX1gKVxuXG5cdFx0XHRcdC8vIEFsbCBvdGhlciBjaGFyYWN0ZXJzIHNob3VsZCBiZSBoYW5kbGVkIGluIGEgY2FzZSBhYm92ZS5cblx0XHRcdFx0Y29uc3QgbmFtZSA9IHRha2VXaGlsZVdpdGhQcmV2KGlzTmFtZUNoYXJhY3Rlcilcblx0XHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRcdGlmIChuYW1lLmxlbmd0aCA+IDEpXG5cdFx0XHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lLnNsaWNlKDAsIG5hbWUubGVuZ3RoIC0gMSkpXG5cdFx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Gb2N1cylcblx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0X2hhbmRsZU5hbWUobmFtZSlcblx0XHRcdH0sXG5cdFx0XHRfaGFuZGxlTmFtZSA9IG5hbWUgPT4ge1xuXHRcdFx0XHRpZkVsc2Uob3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpLFxuXHRcdFx0XHRcdGtpbmQgPT4ge1xuXHRcdFx0XHRcdFx0c3dpdGNoIChraW5kKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLlJlZ2lvbilcblx0XHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0XHRjYXNlIEtleXdvcmRzLlRvZG86XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVE9ETzogd2FyblxuXHRcdFx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBOYW1lKGxvYygpLCBuYW1lKSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0XHRjYXNlIE51bGxDaGFyOlxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2U6XG5cdFx0XHRcdFx0Y2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0XHRjYXNlIE9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENsb3NlUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLlBhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuQnJhY2tldCkpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0X2Nsb3NlR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgU3BhY2U6XG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOZXdsaW5lOiB7XG5cdFx0XHRcdFx0Y2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblx0XHRcdFx0XHRpZiAocGVlazJCZWZvcmUoKSA9PT0gU3BhY2UpXG5cdFx0XHRcdFx0XHR3YXJuKHBvcywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cblx0XHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRcdGluZGVudCA9IGVhdEluZGVudCgpXG5cdFx0XHRcdFx0aWYgKGluZGVudCA+IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdFx0Y2hlY2soaW5kZW50ID09PSBvbGRJbmRlbnQgKyAxLCBsb2MsXG5cdFx0XHRcdFx0XHRcdCdMaW5lIGlzIGluZGVudGVkIG1vcmUgdGhhbiBvbmNlJylcblx0XHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdFx0Ly8gQmxvY2sgYXQgZW5kIG9mIGxpbmUgZ29lcyBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRcdGlmIChpc0VtcHR5KGN1ckdyb3VwLnN1YlRva2VucykgfHxcblx0XHRcdFx0XHRcdFx0IWlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCBsYXN0KGN1ckdyb3VwLnN1YlRva2VucykpKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHcm91cHMuQmxvY2spXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gaW5kZW50OyBpIDwgb2xkSW5kZW50OyBpID0gaSArIDEpXG5cdFx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgVGFiOlxuXHRcdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0XHRmYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENhc2g6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICckIScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jRG8pXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmMpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBUaWxkZTpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhbmcpKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJ34hJylcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuRG8pXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTGF6eSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEJhcjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KFNwYWNlKSB8fCB0cnlFYXQoVGFiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdGV4dCA9IGVhdFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdFx0aWYgKCEoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLkxpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCkpXG5cdFx0XHRcdFx0XHRcdGZhaWwobG9jLFxuXHRcdFx0XHRcdFx0XHRcdGBEb2MgY29tbWVudCBtdXN0IGdvIG9uIGl0cyBvd24gbGluZS4gRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/YClcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBEb2NDb21tZW50KGxvYygpLCB0ZXh0KSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0Ly8gbm9uLWRvYyBjb21tZW50XG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW4pXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpcylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFuZyAmJiBwZWVrTmV4dCgpID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNEbylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gVGlsZGUpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcuficpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAocGVlaygpID09PSBEb3QgJiYgcGVla05leHQoKSA9PT0gRG90KSB7XG5cdFx0XHRcdFx0XHRlYXQoKVxuXHRcdFx0XHRcdFx0ZWF0KClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMpXG5cdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FzZSBDb2xvbjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENvbG9uKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChFcXVhbCwgJzo6Jylcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChFcXVhbCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxvY2FsTXV0YXRlKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuVHlwZSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgQW1wZXJzYW5kOiBjYXNlIEJhY2tzbGFzaDogY2FzZSBCYWNrdGljazogY2FzZSBDYXJldDpcblx0XHRcdFx0Y2FzZSBDb21tYTogY2FzZSBQZXJjZW50OiBjYXNlIFNlbWljb2xvbjpcblx0XHRcdFx0XHRmYWlsKGxvYygpLCBgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoY2hhcmFjdGVyRWF0ZW4pfWApXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbGV4UXVvdGUgPSBpbmRlbnQgPT4ge1xuXHRcdGNvbnN0IHF1b3RlSW5kZW50ID0gaW5kZW50ICsgMVxuXG5cdFx0Ly8gSW5kZW50ZWQgcXVvdGUgaXMgY2hhcmFjdGVyaXplZCBieSBiZWluZyBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBhIG5ld2xpbmUuXG5cdFx0Ly8gVGhlIG5leHQgbGluZSAqbXVzdCogaGF2ZSBzb21lIGNvbnRlbnQgYXQgdGhlIG5leHQgaW5kZW50YXRpb24uXG5cdFx0Y29uc3QgaXNJbmRlbnRlZCA9IHRyeUVhdE5ld2xpbmUoKVxuXHRcdGlmIChpc0luZGVudGVkKSB7XG5cdFx0XHRjb25zdCBhY3R1YWxJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0Y2hlY2soYWN0dWFsSW5kZW50ID09PSBxdW90ZUluZGVudCwgcG9zLFxuXHRcdFx0XHQnSW5kZW50ZWQgcXVvdGUgbXVzdCBoYXZlIGV4YWN0bHkgb25lIG1vcmUgaW5kZW50IHRoYW4gcHJldmlvdXMgbGluZS4nKVxuXHRcdH1cblxuXHRcdC8vIEN1cnJlbnQgc3RyaW5nIGxpdGVyYWwgcGFydCBvZiBxdW90ZSB3ZSBhcmUgcmVhZGluZy5cblx0XHQvLyBUaGlzIGlzIGEgcmF3IHZhbHVlLlxuXHRcdGxldCByZWFkID0gJydcblxuXHRcdGNvbnN0IG1heWJlT3V0cHV0UmVhZCA9ICgpID0+IHtcblx0XHRcdGlmIChyZWFkICE9PSAnJykge1xuXHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChyZWFkKVxuXHRcdFx0XHRyZWFkID0gJydcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBsb2NTaW5nbGUgPSAoKSA9PiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXG5cdFx0b3Blbkdyb3VwKGxvY1NpbmdsZSgpLnN0YXJ0LCBHcm91cHMuUXVvdGUpXG5cblx0XHRlYXRDaGFyczogd2hpbGUgKHRydWUpIHtcblx0XHRcdGNvbnN0IGNoYXIgPSBlYXQoKVxuXHRcdFx0c3dpdGNoIChjaGFyKSB7XG5cdFx0XHRcdGNhc2UgQmFja3NsYXNoOiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IGVhdCgpXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBgXFxcXCR7U3RyaW5nLmZyb21DaGFyQ29kZShuZXh0KX1gXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBTaW5jZSB0aGVzZSBjb21waWxlIHRvIHRlbXBsYXRlIGxpdGVyYWxzLCBoYXZlIHRvIHJlbWVtYmVyIHRvIGVzY2FwZS5cblx0XHRcdFx0Y2FzZSBCYWNrdGljazpcblx0XHRcdFx0XHRyZWFkID0gcmVhZCArICdcXFxcYCdcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIE9wZW5CcmFjZToge1xuXHRcdFx0XHRcdG1heWJlT3V0cHV0UmVhZCgpXG5cdFx0XHRcdFx0Y29uc3QgbCA9IGxvY1NpbmdsZSgpXG5cdFx0XHRcdFx0b3BlblBhcmVudGhlc2lzKGwpXG5cdFx0XHRcdFx0bGV4UGxhaW4odHJ1ZSlcblx0XHRcdFx0XHRjbG9zZVBhcmVudGhlc2lzKGwpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBEb24ndCBuZWVkIGBjYXNlIE51bGxDaGFyOmAgYmVjYXVzZSB0aGF0J3MgYWx3YXlzIHByZWNlZGVkIGJ5IGEgbmV3bGluZS5cblx0XHRcdFx0Y2FzZSBOZXdsaW5lOiB7XG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2luYWxQb3MgPSBwb3MoKVxuXHRcdFx0XHRcdC8vIEdvIGJhY2sgdG8gYmVmb3JlIHdlIGF0ZSBpdC5cblx0XHRcdFx0XHRvcmlnaW5hbFBvcy5jb2x1bW4gPSBvcmlnaW5hbFBvcy5jb2x1bW4gLSAxXG5cblx0XHRcdFx0XHRjaGVjayhpc0luZGVudGVkLCBsb2NTaW5nbGUsICdVbmNsb3NlZCBxdW90ZS4nKVxuXHRcdFx0XHRcdC8vIEFsbG93IGV4dHJhIGJsYW5rIGxpbmVzLlxuXHRcdFx0XHRcdGNvbnN0IG51bU5ld2xpbmVzID0gc2tpcE5ld2xpbmVzKClcblx0XHRcdFx0XHRjb25zdCBuZXdJbmRlbnQgPSBza2lwV2hpbGVFcXVhbHMoVGFiKVxuXHRcdFx0XHRcdGlmIChuZXdJbmRlbnQgPCBxdW90ZUluZGVudCkge1xuXHRcdFx0XHRcdFx0Ly8gSW5kZW50ZWQgcXVvdGUgc2VjdGlvbiBpcyBvdmVyLlxuXHRcdFx0XHRcdFx0Ly8gVW5kbyByZWFkaW5nIHRoZSB0YWJzIGFuZCBuZXdsaW5lLlxuXHRcdFx0XHRcdFx0c3RlcEJhY2tNYW55KG9yaWdpbmFsUG9zLCBudW1OZXdsaW5lcyArIG5ld0luZGVudClcblx0XHRcdFx0XHRcdGFzc2VydChwZWVrKCkgPT09IE5ld2xpbmUpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdH0gZWxzZVxuXHRcdFx0XHRcdFx0cmVhZCA9IHJlYWQgK1xuXHRcdFx0XHRcdFx0XHQnXFxuJy5yZXBlYXQobnVtTmV3bGluZXMpICsgJ1xcdCcucmVwZWF0KG5ld0luZGVudCAtIHF1b3RlSW5kZW50KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRpZiAoIWlzSW5kZW50ZWQpXG5cdFx0XHRcdFx0XHRicmVhayBlYXRDaGFyc1xuXHRcdFx0XHRcdC8vIEVsc2UgZmFsbHRocm91Z2hcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyBJJ3ZlIHRyaWVkIHB1c2hpbmcgY2hhcmFjdGVyIGNvZGVzIHRvIGFuIGFycmF5IGFuZCBzdHJpbmdpZnlpbmcgdGhlbSBsYXRlcixcblx0XHRcdFx0XHQvLyBidXQgdGhpcyB0dXJuZWQgb3V0IHRvIGJlIGJldHRlci5cblx0XHRcdFx0XHRyZWFkID0gcmVhZCArIFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcilcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5RdW90ZSlcblx0fVxuXG5cdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2MoU3RhcnRQb3MsIG51bGwpLCBbXSwgR3JvdXBzLkJsb2NrKVxuXHRvcGVuTGluZShTdGFydFBvcylcblxuXHRsZXhQbGFpbihmYWxzZSlcblxuXHRjb25zdCBlbmRQb3MgPSBwb3MoKVxuXHRjbG9zZUxpbmUoZW5kUG9zKVxuXHRhc3NlcnQoaXNFbXB0eShncm91cFN0YWNrKSlcblx0Y3VyR3JvdXAubG9jLmVuZCA9IGVuZFBvc1xuXHRyZXR1cm4gY3VyR3JvdXBcbn1cblxuY29uc3QgY2MgPSBfID0+IF8uY2hhckNvZGVBdCgwKVxuY29uc3Rcblx0QW1wZXJzYW5kID0gY2MoJyYnKSxcblx0QmFja3NsYXNoID0gY2MoJ1xcXFwnKSxcblx0QmFja3RpY2sgPSBjYygnYCcpLFxuXHRCYW5nID0gY2MoJyEnKSxcblx0QmFyID0gY2MoJ3wnKSxcblx0Q2FyZXQgPSBjYygnXicpLFxuXHRDYXNoID0gY2MoJyQnKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIeXBoZW4gPSBjYygnLScpLFxuXHRMZXR0ZXJCID0gY2MoJ2InKSxcblx0TGV0dGVyTyA9IGNjKCdvJyksXG5cdExldHRlclggPSBjYygneCcpLFxuXHROMCA9IGNjKCcwJyksXG5cdE4xID0gY2MoJzEnKSxcblx0TjIgPSBjYygnMicpLFxuXHROMyA9IGNjKCczJyksXG5cdE40ID0gY2MoJzQnKSxcblx0TjUgPSBjYygnNScpLFxuXHRONiA9IGNjKCc2JyksXG5cdE43ID0gY2MoJzcnKSxcblx0TjggPSBjYygnOCcpLFxuXHROOSA9IGNjKCc5JyksXG5cdE5ld2xpbmUgPSBjYygnXFxuJyksXG5cdE51bGxDaGFyID0gY2MoJ1xcMCcpLFxuXHRPcGVuQnJhY2UgPSBjYygneycpLFxuXHRPcGVuQnJhY2tldCA9IGNjKCdbJyksXG5cdE9wZW5QYXJlbnRoZXNpcyA9IGNjKCcoJyksXG5cdFBlcmNlbnQgPSBjYygnJScpLFxuXHRRdW90ZSA9IGNjKCdcIicpLFxuXHRTZW1pY29sb24gPSBjYygnOycpLFxuXHRTcGFjZSA9IGNjKCcgJyksXG5cdFRhYiA9IGNjKCdcXHQnKSxcblx0VGlsZGUgPSBjYygnficpXG5cbmZ1bmN0aW9uIHNob3dDaGFyKGNoYXIpIHtcblx0cmV0dXJuIGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSlcbn1cblxuZnVuY3Rpb24gX2NoYXJQcmVkKGNoYXJzLCBuZWdhdGUpIHtcblx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdHJldHVybiBGdW5jdGlvbignY2gnLCBzcmMpXG59XG5cbmNvbnN0XG5cdGlzRGlnaXQgPSBfY2hhclByZWQoJzAxMjM0NTY3ODknKSxcblx0aXNEaWdpdEJpbmFyeSA9IF9jaGFyUHJlZCgnMDEnKSxcblx0aXNEaWdpdE9jdGFsID0gX2NoYXJQcmVkKCcwMTIzNDU2NycpLFxuXHRpc0RpZ2l0SGV4ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5YWJjZGVmJylcblxuLy8gQW55dGhpbmcgbm90IGV4cGxpY2l0bHkgcmVzZXJ2ZWQgaXMgYSB2YWxpZCBuYW1lIGNoYXJhY3Rlci5cbmNvbnN0IHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgIyVeJlxcXFxcXCc7LCdcbmNvbnN0IGlzTmFtZUNoYXJhY3RlciA9IF9jaGFyUHJlZCgnKClbXXt9Ljp8IFxcblxcdFwiJyArIHJlc2VydmVkQ2hhcmFjdGVycywgdHJ1ZSlcbiJdfQ==