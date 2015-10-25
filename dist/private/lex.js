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
		function addToCurrentGroup(token) {
			curGroup.subTokens.push(token);
		}

		function dropGroup() {
			curGroup = groupStack.pop();
		}

		// Pause writing to curGroup in favor of writing to a sub-group.
		// When the sub-group finishes we will pop the stack and resume writing to its parent.
		function openGroup(openPos, groupKind) {
			groupStack.push(curGroup);
			// Contents will be added to by `addToCurrentGroup`.
			// curGroup.loc.end will be written to when closing it.
			curGroup = new _Token.Group(new _Loc.default(openPos, null), [], groupKind);
		}

		function maybeCloseGroup(closePos, closeKind) {
			if (curGroup.kind === closeKind) _closeGroup(closePos, closeKind);
		}

		function closeGroup(closePos, closeKind) {
			(0, _context.check)(closeKind === curGroup.kind, closePos, () => `Trying to close ${ (0, _Token.showGroupKind)(closeKind) }, ` + `but last opened ${ (0, _Token.showGroupKind)(curGroup.kind) }`);
			_closeGroup(closePos, closeKind);
		}

		function _closeGroup(closePos, closeKind) {
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
		}

		function closeSpaceOKIfEmpty(pos) {
			(0, _util.assert)(curGroup.kind === _Token.Groups.Space);
			if (curGroup.subTokens.length === 0) dropGroup();else _closeGroup(pos, _Token.Groups.Space);
		}

		function openParenthesis(loc) {
			openGroup(loc.start, _Token.Groups.Parenthesis);
			openGroup(loc.end, _Token.Groups.Space);
		}

		function closeParenthesis(loc) {
			_closeGroup(loc.start, _Token.Groups.Space);
			closeGroup(loc.end, _Token.Groups.Parenthesis);
		}

		function closeGroupsForDedent(pos) {
			closeLine(pos);
			closeGroup(pos, _Token.Groups.Block);
			// It's OK to be missing a closing parenthesis if there's a block. E.g.:
			// a (b
			//	c | no closing paren here
			while (curGroup.kind === _Token.Groups.Parenthesis || curGroup.kind === _Token.Groups.Space) _closeGroup(pos, curGroup.kind);
		}

		// When starting a new line, a spaced group is created implicitly.
		function openLine(pos) {
			openGroup(pos, _Token.Groups.Line);
			openGroup(pos, _Token.Groups.Space);
		}

		function closeLine(pos) {
			if (curGroup.kind === _Token.Groups.Space) closeSpaceOKIfEmpty();
			closeGroup(pos, _Token.Groups.Line);
		}

		// When encountering a space, it both closes and opens a spaced group.
		function space(loc) {
			maybeCloseGroup(loc.start, _Token.Groups.Space);
			openGroup(loc.end, _Token.Groups.Space);
		}

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

		function pos() {
			return new _esastDistLoc.Pos(line, column);
		}

		function peek() {
			return sourceString.charCodeAt(index);
		}
		function peekNext() {
			return sourceString.charCodeAt(index + 1);
		}
		function peekPrev() {
			return sourceString.charCodeAt(index - 1);
		}
		function peek2Before() {
			return sourceString.charCodeAt(index - 2);
		}

		// May eat a Newline.
		// Caller *must* check for that case and increment line!
		function eat() {
			const char = sourceString.charCodeAt(index);
			skip();
			return char;
		}
		function skip() {
			index = index + 1;
			column = column + 1;
		}

		// charToEat must not be Newline.
		function tryEat(charToEat) {
			const canEat = peek() === charToEat;
			if (canEat) {
				index = index + 1;
				column = column + 1;
			}
			return canEat;
		}

		function mustEat(charToEat, precededBy) {
			const canEat = tryEat(charToEat);
			(0, _context.check)(canEat, pos, () => `${ (0, _CompileError.code)(precededBy) } must be followed by ${ showChar(charToEat) }`);
		}

		function tryEatNewline() {
			const canEat = peek() === Newline;
			if (canEat) {
				index = index + 1;
				line = line + 1;
				column = _esastDistLoc.StartColumn;
			}
			return canEat;
		}

		// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.
		function stepBackMany(oldPos, nCharsToBackUp) {
			index = index - nCharsToBackUp;
			line = oldPos.line;
			column = oldPos.column;
		}

		// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
		// characterPredicate must *not* accept Newline.
		// Otherwise there may be an infinite loop!
		function takeWhile(characterPredicate) {
			return _takeWhileWithStart(index, characterPredicate);
		}
		function takeWhileWithPrev(characterPredicate) {
			return _takeWhileWithStart(index - 1, characterPredicate);
		}
		function _takeWhileWithStart(startIndex, characterPredicate) {
			skipWhile(characterPredicate);
			return sourceString.slice(startIndex, index);
		}

		function skipWhileEquals(char) {
			return skipWhile(_ => _ === char);
		}

		function skipRestOfLine() {
			return skipWhile(_ => _ !== Newline);
		}

		function eatRestOfLine() {
			return takeWhile(_ => _ !== Newline);
		}

		function skipWhile(characterPredicate) {
			const startIndex = index;
			while (characterPredicate(peek())) index = index + 1;
			const diff = index - startIndex;
			column = column + diff;
			return diff;
		}

		// Called after seeing the first newline.
		// Returns # total newlines, including the first.
		function skipNewlines() {
			const startLine = line;
			line = line + 1;
			while (peek() === Newline) {
				index = index + 1;
				line = line + 1;
			}
			column = _esastDistLoc.StartColumn;
			return line - startLine;
		}

		// Sprinkle checkPos() around to debug line and column tracking errors.
		/*
  function checkPos() {
  	const p = _getCorrectPos()
  	if (p.line !== line || p.column !== column)
  		throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
  }
  const _indexToPos = new Map()
  function _getCorrectPos() {
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
		function lexPlain(isInQuote) {
			// This tells us which indented block we're in.
			// Incrementing it means issuing a GP_OpenBlock and decrementing it means a GP_CloseBlock.
			// Does nothing if isInQuote.
			let indent = 0;

			// Make closures now rather than inside the loop.
			// This is significantly faster as of node v0.11.14.

			// This is where we started lexing the current token.
			let startColumn;
			function startPos() {
				return new _esastDistLoc.Pos(line, startColumn);
			}
			function loc() {
				return new _Loc.default(startPos(), pos());
			}
			function keyword(kind) {
				addToCurrentGroup(new _Token.Keyword(loc(), kind));
			}
			function funKeyword(kind) {
				keyword(kind);
				// First arg in its own spaced group
				space(loc());
			}
			function eatAndAddNumber() {
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
			}
			function eatIndent() {
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
			}

			function handleName() {
				(0, _context.check)(isNameCharacter(peekPrev()), loc(), () => `Reserved character ${ showChar(peekPrev()) }`);

				// All other characters should be handled in a case above.
				const name = takeWhileWithPrev(isNameCharacter);
				if (name.endsWith('_')) {
					if (name.length > 1) _handleName(name.slice(0, name.length - 1));
					keyword(_Token.Keywords.Focus);
				} else _handleName(name);
			}
			function _handleName(name) {
				//rename this function
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
			}

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
		}

		function lexQuote(indent) {
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

			function maybeOutputRead() {
				if (read !== '') {
					addToCurrentGroup(read);
					read = '';
				}
			}

			function locSingle() {
				return (0, _esastDistLoc.singleCharLoc)(pos());
			}

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
		}

		curGroup = new _Token.Group(new _Loc.default(_esastDistLoc.StartPos, null), [], _Token.Groups.Block);
		openLine(_esastDistLoc.StartPos);

		lexPlain(false);

		const endPos = pos();
		closeLine(endPos);
		(0, _util.assert)((0, _util.isEmpty)(groupStack));
		curGroup.loc.end = endPos;
		return curGroup;
	}

	function cc(_) {
		return _.charCodeAt(0);
	}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2xleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7a0JBa0J3QixHQUFHOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFaLFVBQVMsR0FBRyxDQUFDLFlBQVksRUFBRTs7QUFFekMsZUFsQk8sS0FBSyxFQWtCTixZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFwQkwsUUFBUSxFQW9CUyxrQ0FBa0MsQ0FBQyxDQUFBOzs7Ozs7O0FBT2hGLGNBQVksR0FBRyxDQUFDLEdBQUUsWUFBWSxFQUFDLEVBQUUsQ0FBQyxDQUFBOzs7Ozs7OztBQVFsQyxRQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDckIsTUFBSSxRQUFRLENBQUE7QUFDWixXQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRTtBQUNqQyxXQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUM5Qjs7QUFFRCxXQUFTLFNBQVMsR0FBRztBQUNwQixXQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0dBQzNCOzs7O0FBSUQsV0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRTtBQUN0QyxhQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7QUFHekIsV0FBUSxHQUFHLFdBL0NPLEtBQUssQ0ErQ0YsaUJBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtHQUMzRDs7QUFFRCxXQUFTLGVBQWUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFO0FBQzdDLE9BQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQzlCLFdBQVcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDakM7O0FBRUQsV0FBUyxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRTtBQUN4QyxnQkExRE0sS0FBSyxFQTBETCxTQUFTLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFDNUMsQ0FBQyxnQkFBZ0IsR0FBRSxXQXhEckIsYUFBYSxFQXdEc0IsU0FBUyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQy9DLENBQUMsZ0JBQWdCLEdBQUUsV0F6RHJCLGFBQWEsRUF5RHNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxjQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0dBQ2hDOztBQUVELFdBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUU7QUFDekMsT0FBSSxVQUFVLEdBQUcsUUFBUSxDQUFBO0FBQ3pCLFlBQVMsRUFBRSxDQUFBO0FBQ1gsYUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFBO0FBQzdCLFdBQVEsU0FBUztBQUNoQixTQUFLLE9BbkVtQixNQUFNLENBbUVsQixLQUFLO0FBQUU7QUFDbEIsWUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUE7QUFDeEMsVUFBSSxJQUFJLEtBQUssQ0FBQzs7QUFFYix3QkFBaUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUEsS0FFcEUsYUEzRXlCLElBQUksRUEyRXhCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtBQUMzQyxZQUFLO01BQ0w7QUFBQSxBQUNELFNBQUssT0E1RW1CLE1BQU0sQ0E0RWxCLElBQUk7OztBQUdmLFNBQUksQ0FBQyxVQTdFZSxPQUFPLEVBNkVkLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFDakMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDOUIsV0FBSztBQUFBLEFBQ04sU0FBSyxPQWxGbUIsTUFBTSxDQWtGbEIsS0FBSztBQUNoQixrQkFyRkksS0FBSyxFQXFGSCxDQUFDLFVBakZhLE9BQU8sRUFpRlosVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQTtBQUMvRCxzQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM3QixXQUFLO0FBQUEsQUFDTjtBQUNDLHNCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQUEsSUFDOUI7R0FDRDs7QUFFRCxXQUFTLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtBQUNqQyxhQTFGTSxNQUFNLEVBMEZMLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0E1RkEsTUFBTSxDQTRGQyxLQUFLLENBQUMsQ0FBQTtBQUN0QyxPQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDbEMsU0FBUyxFQUFFLENBQUEsS0FFWCxXQUFXLENBQUMsR0FBRyxFQUFFLE9BaEdPLE1BQU0sQ0FnR04sS0FBSyxDQUFDLENBQUE7R0FDL0I7O0FBRUQsV0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzdCLFlBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BcEdJLE1BQU0sQ0FvR0gsV0FBVyxDQUFDLENBQUE7QUFDeEMsWUFBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FyR00sTUFBTSxDQXFHTCxLQUFLLENBQUMsQ0FBQTtHQUNoQzs7QUFFRCxXQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtBQUM5QixjQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQXpHRSxNQUFNLENBeUdELEtBQUssQ0FBQyxDQUFBO0FBQ3BDLGFBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BMUdLLE1BQU0sQ0EwR0osV0FBVyxDQUFDLENBQUE7R0FDdkM7O0FBRUQsV0FBUyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUU7QUFDbEMsWUFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2QsYUFBVSxDQUFDLEdBQUcsRUFBRSxPQS9HUyxNQUFNLENBK0dSLEtBQUssQ0FBQyxDQUFBOzs7O0FBSTdCLFVBQU8sUUFBUSxDQUFDLElBQUksS0FBSyxPQW5IQSxNQUFNLENBbUhDLFdBQVcsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLE9Bbkh4QyxNQUFNLENBbUh5QyxLQUFLLEVBQzVFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ2hDOzs7QUFHRCxXQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7QUFDdEIsWUFBUyxDQUFDLEdBQUcsRUFBRSxPQXpIVSxNQUFNLENBeUhULElBQUksQ0FBQyxDQUFBO0FBQzNCLFlBQVMsQ0FBQyxHQUFHLEVBQUUsT0ExSFUsTUFBTSxDQTBIVCxLQUFLLENBQUMsQ0FBQTtHQUM1Qjs7QUFFRCxXQUFTLFNBQVMsQ0FBQyxHQUFHLEVBQUU7QUFDdkIsT0FBSSxRQUFRLENBQUMsSUFBSSxLQUFLLE9BOUhHLE1BQU0sQ0E4SEYsS0FBSyxFQUNqQyxtQkFBbUIsRUFBRSxDQUFBO0FBQ3RCLGFBQVUsQ0FBQyxHQUFHLEVBQUUsT0FoSVMsTUFBTSxDQWdJUixJQUFJLENBQUMsQ0FBQTtHQUM1Qjs7O0FBR0QsV0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ25CLGtCQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxPQXJJRixNQUFNLENBcUlHLEtBQUssQ0FBQyxDQUFBO0FBQ3hDLFlBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BdElNLE1BQU0sQ0FzSUwsS0FBSyxDQUFDLENBQUE7R0FDaEM7Ozs7Ozs7Ozs7QUFVRCxNQUFJLEtBQUssR0FBRyxDQUFDO01BQUUsSUFBSSxpQkFySkYsU0FBUyxBQXFKSztNQUFFLE1BQU0saUJBckpTLFdBQVcsQUFxSk4sQ0FBQTs7Ozs7OztBQU9yRCxXQUFTLEdBQUcsR0FBRztBQUNkLFVBQU8sa0JBN0pJLEdBQUcsQ0E2SkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0dBQzVCOztBQUVELFdBQVMsSUFBSSxHQUFHO0FBQ2YsVUFBTyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO0dBQ3JDO0FBQ0QsV0FBUyxRQUFRLEdBQUc7QUFDbkIsVUFBTyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQTtHQUN6QztBQUNELFdBQVMsUUFBUSxHQUFHO0FBQ25CLFVBQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7R0FDekM7QUFDRCxXQUFTLFdBQVcsR0FBRztBQUN0QixVQUFPLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFBO0dBQ3pDOzs7O0FBSUQsV0FBUyxHQUFHLEdBQUc7QUFDZCxTQUFNLElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzNDLE9BQUksRUFBRSxDQUFBO0FBQ04sVUFBTyxJQUFJLENBQUE7R0FDWDtBQUNELFdBQVMsSUFBSSxHQUFHO0FBQ2YsUUFBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDakIsU0FBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUE7R0FDbkI7OztBQUdELFdBQVMsTUFBTSxDQUFDLFNBQVMsRUFBRTtBQUMxQixTQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsS0FBSyxTQUFTLENBQUE7QUFDbkMsT0FBSSxNQUFNLEVBQUU7QUFDWCxTQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNqQixVQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNuQjtBQUNELFVBQU8sTUFBTSxDQUFBO0dBQ2I7O0FBRUQsV0FBUyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRTtBQUN2QyxTQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDaEMsZ0JBbk1NLEtBQUssRUFtTUwsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUNsQixDQUFDLEdBQUUsa0JBck1FLElBQUksRUFxTUQsVUFBVSxDQUFDLEVBQUMscUJBQXFCLEdBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ2xFOztBQUVELFdBQVMsYUFBYSxHQUFHO0FBQ3hCLFNBQU0sTUFBTSxHQUFHLElBQUksRUFBRSxLQUFLLE9BQU8sQ0FBQTtBQUNqQyxPQUFJLE1BQU0sRUFBRTtBQUNYLFNBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBQ2pCLFFBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO0FBQ2YsVUFBTSxpQkE5TXdDLFdBQVcsQUE4TXJDLENBQUE7SUFDcEI7QUFDRCxVQUFPLE1BQU0sQ0FBQTtHQUNiOzs7QUFHRCxXQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFO0FBQzdDLFFBQUssR0FBRyxLQUFLLEdBQUcsY0FBYyxDQUFBO0FBQzlCLE9BQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQ2xCLFNBQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO0dBQ3RCOzs7OztBQUtELFdBQVMsU0FBUyxDQUFDLGtCQUFrQixFQUFFO0FBQ3RDLFVBQU8sbUJBQW1CLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUE7R0FDckQ7QUFDRCxXQUFTLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFO0FBQzlDLFVBQU8sbUJBQW1CLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO0dBQ3pEO0FBQ0QsV0FBUyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUU7QUFDNUQsWUFBUyxDQUFDLGtCQUFrQixDQUFDLENBQUE7QUFDN0IsVUFBTyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQTtHQUM1Qzs7QUFFRCxXQUFTLGVBQWUsQ0FBQyxJQUFJLEVBQUU7QUFDOUIsVUFBTyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQTtHQUNqQzs7QUFFRCxXQUFTLGNBQWMsR0FBRztBQUN6QixVQUFPLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFBO0dBQ3BDOztBQUVELFdBQVMsYUFBYSxHQUFHO0FBQ3hCLFVBQU8sU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUE7R0FDcEM7O0FBRUQsV0FBUyxTQUFTLENBQUMsa0JBQWtCLEVBQUU7QUFDdEMsU0FBTSxVQUFVLEdBQUcsS0FBSyxDQUFBO0FBQ3hCLFVBQU8sa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFDaEMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDbEIsU0FBTSxJQUFJLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQTtBQUMvQixTQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUN0QixVQUFPLElBQUksQ0FBQTtHQUNYOzs7O0FBSUQsV0FBUyxZQUFZLEdBQUc7QUFDdkIsU0FBTSxTQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLE9BQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFBO0FBQ2YsVUFBTyxJQUFJLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFDMUIsU0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7QUFDakIsUUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7SUFDZjtBQUNELFNBQU0saUJBdFF5QyxXQUFXLEFBc1F0QyxDQUFBO0FBQ3BCLFVBQU8sSUFBSSxHQUFHLFNBQVMsQ0FBQTtHQUN2Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDRCxXQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Ozs7QUFJNUIsT0FBSSxNQUFNLEdBQUcsQ0FBQyxDQUFBOzs7Ozs7QUFNZCxPQUFJLFdBQVcsQ0FBQTtBQUNmLFlBQVMsUUFBUSxHQUFHO0FBQ25CLFdBQU8sa0JBM1RHLEdBQUcsQ0EyVEUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ2pDO0FBQ0QsWUFBUyxHQUFHLEdBQUc7QUFDZCxXQUFPLGlCQUFRLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDakM7QUFDRCxZQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDdEIscUJBQWlCLENBQUMsV0E3VHlCLE9BQU8sQ0E2VHBCLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDM0M7QUFDRCxZQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDekIsV0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUViLFNBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0lBQ1o7QUFDRCxZQUFTLGVBQWUsR0FBRztBQUMxQixVQUFNLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBOztBQUU1QixVQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDZCxRQUFJLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUN0QixXQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQTtBQUNoQixhQUFRLENBQUM7QUFDUixXQUFLLE9BQU8sQ0FBQyxBQUFDLEtBQUssT0FBTyxDQUFDLEFBQUMsS0FBSyxPQUFPO0FBQ3ZDLFdBQUksRUFBRSxDQUFBO0FBQ04sYUFBTSxjQUFjLEdBQ25CLENBQUMsS0FBSyxPQUFPLEdBQ2IsYUFBYSxHQUNiLENBQUMsS0FBSyxPQUFPLEdBQ2IsWUFBWSxHQUNaLFVBQVUsQ0FBQTtBQUNYLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDekIsYUFBSztBQUFBLEFBQ04sV0FBSyxHQUFHO0FBQ1AsV0FBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtBQUN4QixZQUFJLEVBQUUsQ0FBQTtBQUNOLGlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbEI7QUFDRCxhQUFLO0FBQUEsQUFDTixjQUFRO01BQ1I7S0FDRCxNQUFNO0FBQ04sY0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2xCLFNBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNkLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNuQjs7QUFFRCxVQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNqRCxxQkFBaUIsQ0FBQyxXQXJXYixhQUFhLENBcVdrQixHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2hEO0FBQ0QsWUFBUyxTQUFTLEdBQUc7QUFDcEIsVUFBTSxTQUFTLEdBQUcsU0F6V0EsT0FBTyxDQXlXQyxNQUFNLEVBQUUsQ0FBQTtBQUNsQyxRQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFDdkIsV0FBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ25DLGtCQTVXSSxLQUFLLEVBNFdILElBQUksRUFBRSxLQUFLLEtBQUssRUFBRSxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtBQUN0RCxZQUFPLE1BQU0sQ0FBQTtLQUNiLE1BQU07QUFDTixXQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckMsa0JBaFhJLEtBQUssRUFnWEgsTUFBTSxHQUFHLFNBQVMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQ3BDLENBQUMseUNBQXlDLEdBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU8sTUFBTSxHQUFHLFNBQVMsQ0FBQTtLQUN6QjtJQUNEOztBQUdELFlBQVMsVUFBVSxHQUFHO0FBQ3JCLGlCQXhYSyxLQUFLLEVBd1hKLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLE1BQ3pDLENBQUMsbUJBQW1CLEdBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7OztBQUc5QyxVQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUMvQyxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDdkIsU0FBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbEIsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM1QyxZQUFPLENBQUMsT0E5WDJDLFFBQVEsQ0E4WDFDLEtBQUssQ0FBQyxDQUFBO0tBQ3ZCLE1BQ0EsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2xCO0FBQ0QsWUFBUyxXQUFXLENBQUMsSUFBSSxFQUFFOztBQUUxQixjQWxZYSxNQUFNLEVBa1laLFdBcFk2RCxxQkFBcUIsRUFvWTVELElBQUksQ0FBQyxFQUNqQyxJQUFJLElBQUk7QUFDUCxhQUFRLElBQUk7QUFDWCxXQUFLLE9Bdlk0QyxRQUFRLENBdVkzQyxNQUFNO0FBQ25CLHFCQUFjLEVBQUUsQ0FBQTtBQUNoQixjQUFPLENBQUMsT0F6WXdDLFFBQVEsQ0F5WXZDLE1BQU0sQ0FBQyxDQUFBO0FBQ3hCLGFBQUs7QUFBQSxBQUNOLFdBQUssT0EzWTRDLFFBQVEsQ0EyWTNDLElBQUk7O0FBRWpCLHFCQUFjLEVBQUUsQ0FBQTtBQUNoQixhQUFLO0FBQUEsQUFDTjtBQUNDLGNBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUFBLE1BQ2Q7S0FDRCxFQUNELE1BQU07QUFDTCxzQkFBaUIsQ0FBQyxXQXBaMEMsSUFBSSxDQW9ackMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUN4QyxDQUFDLENBQUE7SUFDSDs7QUFFRCxVQUFPLElBQUksRUFBRTtBQUNaLGVBQVcsR0FBRyxNQUFNLENBQUE7QUFDcEIsVUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFLENBQUE7O0FBRTVCLFlBQVEsY0FBYztBQUNyQixVQUFLLFFBQVE7QUFDWixhQUFNO0FBQUEsQUFDUCxVQUFLLFVBQVU7QUFDZCxtQkFsYUcsS0FBSyxFQWthRixTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQ3JCLENBQUMsbUJBQW1CLEdBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlDLGFBQU07QUFBQSxBQUNQLFVBQUssS0FBSztBQUNULGNBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQixZQUFLOztBQUFBOztBQUlOLFVBQUssZUFBZTtBQUNuQixVQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUMzQixpQkFBaUIsQ0FBQyxXQTNhSixLQUFLLENBMmFTLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQTNhbEIsTUFBTSxDQTJhbUIsV0FBVyxDQUFDLENBQUMsQ0FBQSxLQUUzRCxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUN2QixZQUFLO0FBQUEsQUFDTixVQUFLLFdBQVc7QUFDZixVQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFDdkIsaUJBQWlCLENBQUMsV0FqYkosS0FBSyxDQWliUyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FqYmxCLE1BQU0sQ0FpYm1CLE9BQU8sQ0FBQyxDQUFDLENBQUEsS0FDbkQ7QUFDSixnQkFBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BbmJELE1BQU0sQ0FtYkUsT0FBTyxDQUFDLENBQUE7QUFDckMsZ0JBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQXBiSSxNQUFNLENBb2JILEtBQUssQ0FBQyxDQUFBO09BQzlCO0FBQ0QsWUFBSztBQUFBLEFBQ04sVUFBSyxnQkFBZ0I7QUFDcEIsc0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUN2QixZQUFLO0FBQUEsQUFDTixVQUFLLFlBQVk7QUFDaEIsaUJBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQTNiRixNQUFNLENBMmJHLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLGdCQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsT0E1YkksTUFBTSxDQTRiSCxPQUFPLENBQUMsQ0FBQTtBQUNqQyxZQUFLO0FBQUEsQUFDTixVQUFLLEtBQUs7QUFDVCxXQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUNaLFlBQUs7QUFBQSxBQUNOLFVBQUssT0FBTztBQUFFO0FBQ2Isb0JBcGNHLEtBQUssRUFvY0YsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLDRDQUE0QyxDQUFDLENBQUE7QUFDcEUsV0FBSSxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQzFCLGFBdGN3QixJQUFJLEVBc2N2QixHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQTs7O0FBR25DLG1CQUFZLEVBQUUsQ0FBQTtBQUNkLGFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQTtBQUN4QixhQUFNLEdBQUcsU0FBUyxFQUFFLENBQUE7QUFDcEIsV0FBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO0FBQ3ZCLHFCQTdjRSxLQUFLLEVBNmNELE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFDbEMsaUNBQWlDLENBQUMsQ0FBQTtBQUNuQyxjQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQTs7O0FBR2YsWUFBSSxVQTljYyxPQUFPLEVBOGNiLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFDOUIsQ0FBQyxXQWpkMkIsU0FBUyxFQWlkMUIsT0FqZHFDLFFBQVEsQ0FpZHBDLElBQUksRUFBRSxVQS9jQSxJQUFJLEVBK2NDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3JELGFBQUksUUFBUSxDQUFDLElBQUksS0FBSyxPQWxkRixNQUFNLENBa2RHLEtBQUssRUFDakMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzdCLGtCQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQXBkRyxNQUFNLENBb2RGLEtBQUssQ0FBQyxDQUFBO1NBQzlCO0FBQ0QsaUJBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE9BdGRFLE1BQU0sQ0FzZEQsS0FBSyxDQUFDLENBQUE7QUFDaEMsZ0JBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZixNQUFNO0FBQ04sY0FBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDZixhQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUM1QyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDOUIsaUJBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDbEIsZ0JBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZjtBQUNELGFBQUs7T0FDTDtBQUFBLEFBQ0QsVUFBSyxHQUFHOzs7QUFHUCxtQkF0ZVUsSUFBSSxFQXNlVCxHQUFHLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFBOztBQUFBOztBQUk5QyxVQUFLLElBQUk7QUFDUixVQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFDZCxVQUFVLENBQUMsT0ExZXNDLFFBQVEsQ0EwZXJDLEtBQUssQ0FBQyxDQUFBLEtBRTFCLFVBQVUsRUFBRSxDQUFBO0FBQ2IsWUFBSztBQUFBLEFBQ04sVUFBSyxJQUFJO0FBQ1IsVUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDakIsY0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNsQixpQkFBVSxDQUFDLE9BamZzQyxRQUFRLENBaWZyQyxVQUFVLENBQUMsQ0FBQTtPQUMvQixNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNyQixVQUFVLENBQUMsT0FuZnNDLFFBQVEsQ0FtZnJDLFFBQVEsQ0FBQyxDQUFBLEtBRTdCLFVBQVUsRUFBRSxDQUFBO0FBQ2IsWUFBSztBQUFBLEFBQ04sVUFBSyxLQUFLO0FBQ1QsVUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDakIsY0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUNsQixpQkFBVSxDQUFDLE9BMWZzQyxRQUFRLENBMGZyQyxRQUFRLENBQUMsQ0FBQTtPQUM3QixNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUNyQixVQUFVLENBQUMsT0E1ZnNDLFFBQVEsQ0E0ZnJDLE1BQU0sQ0FBQyxDQUFBLEtBRTNCLE9BQU8sQ0FBQyxPQTlmeUMsUUFBUSxDQThmeEMsSUFBSSxDQUFDLENBQUE7QUFDdkIsWUFBSztBQUFBLEFBQ04sVUFBSyxHQUFHO0FBQ1AsVUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pDLGFBQU0sSUFBSSxHQUFHLGFBQWEsRUFBRSxDQUFBO0FBQzVCLDBCQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDL0IsV0FBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FwZ0JILE1BQU0sQ0FvZ0JJLElBQUksSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUEsQUFBQyxFQUN0RSxhQXZnQlEsSUFBSSxFQXVnQlAsR0FBRyxFQUNQLENBQUMsa0RBQWtELEdBQUUsa0JBemdCckQsSUFBSSxFQXlnQnNELElBQUksQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDckUsd0JBQWlCLENBQUMsV0F2Z0JoQixVQUFVLENBdWdCcUIsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtPQUM5QyxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQzs7QUFFckIscUJBQWMsRUFBRSxDQUFBLEtBRWhCLFVBQVUsQ0FBQyxPQTVnQnNDLFFBQVEsQ0E0Z0JyQyxHQUFHLENBQUMsQ0FBQTtBQUN6QixZQUFLOztBQUFBOztBQUlOLFVBQUssTUFBTTtBQUNWLFVBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUVsQixzQkFBZSxFQUFFLENBQUEsS0FFakIsVUFBVSxFQUFFLENBQUE7QUFDYixZQUFLO0FBQUEsQUFDTixVQUFLLEVBQUUsQ0FBQyxBQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFLENBQUMsQUFBQyxLQUFLLEVBQUUsQ0FBQyxBQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVDLFVBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFLENBQUMsQUFBQyxLQUFLLEVBQUUsQ0FBQyxBQUFDLEtBQUssRUFBRSxDQUFDLEFBQUMsS0FBSyxFQUFFO0FBQzFDLHFCQUFlLEVBQUUsQ0FBQTtBQUNqQixZQUFLOztBQUFBOztBQUtOLFVBQUssR0FBRztBQUFFO0FBQ1QsYUFBTSxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUE7QUFDbkIsV0FBSSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUU7Ozs7QUFJdkMsMkJBQW1CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUMvQixlQUFPLENBQUMsT0F2aUJ5QyxRQUFRLENBdWlCeEMsU0FBUyxDQUFDLENBQUE7UUFDM0IsTUFBTSxJQUFJLElBQUksS0FBSyxHQUFHLEVBQUU7QUFDeEIsWUFBSSxFQUFFLENBQUE7QUFDTixlQUFPLENBQUMsT0ExaUJ5QyxRQUFRLENBMGlCeEMsT0FBTyxDQUFDLENBQUE7QUFDekIsYUFBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDWixNQUFNLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxRQUFRLEVBQUUsS0FBSyxHQUFHLEVBQUU7QUFDL0MsWUFBSSxFQUFFLENBQUE7QUFDTixZQUFJLEVBQUUsQ0FBQTtBQUNOLGVBQU8sQ0FBQyxPQS9pQnlDLFFBQVEsQ0EraUJ4QyxTQUFTLENBQUMsQ0FBQTtBQUMzQixhQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUNaLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQzFCLFlBQUksRUFBRSxDQUFBO0FBQ04sWUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDakIsZ0JBQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDbkIsZ0JBQU8sQ0FBQyxPQXJqQndDLFFBQVEsQ0FxakJ2QyxZQUFZLENBQUMsQ0FBQTtTQUM5QixNQUFNO0FBQ04sZ0JBQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDbEIsZ0JBQU8sQ0FBQyxPQXhqQndDLFFBQVEsQ0F3akJ2QyxVQUFVLENBQUMsQ0FBQTtTQUM1QjtBQUNELGFBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ1osTUFBTSxJQUFJLElBQUksRUFBRSxLQUFLLEdBQUcsSUFBSSxRQUFRLEVBQUUsS0FBSyxHQUFHLEVBQUU7QUFDaEQsV0FBRyxFQUFFLENBQUE7QUFDTCxXQUFHLEVBQUUsQ0FBQTtBQUNMLGVBQU8sQ0FBQyxPQTlqQnlDLFFBQVEsQ0E4akJ4QyxRQUFRLENBQUMsQ0FBQTtRQUMxQixNQUNBLE9BQU8sQ0FBQyxPQWhrQnlDLFFBQVEsQ0Fna0J4QyxHQUFHLENBQUMsQ0FBQTtBQUN0QixhQUFLO09BQ0w7O0FBQUEsQUFFRCxVQUFLLEtBQUs7QUFDVCxVQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNsQixjQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3BCLGNBQU8sQ0FBQyxPQXZrQnlDLFFBQVEsQ0F1a0J4QyxhQUFhLENBQUMsQ0FBQTtPQUMvQixNQUFNLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUN2QixPQUFPLENBQUMsT0F6a0J5QyxRQUFRLENBeWtCeEMsV0FBVyxDQUFDLENBQUEsS0FFN0IsT0FBTyxDQUFDLE9BM2tCeUMsUUFBUSxDQTJrQnhDLElBQUksQ0FBQyxDQUFBO0FBQ3ZCLFlBQUs7O0FBQUEsQUFFTixVQUFLLFNBQVMsQ0FBQyxBQUFDLEtBQUssU0FBUyxDQUFDLEFBQUMsS0FBSyxRQUFRLENBQUMsQUFBQyxLQUFLLEtBQUssQ0FBQztBQUMxRCxVQUFLLEtBQUssQ0FBQyxBQUFDLEtBQUssT0FBTyxDQUFDLEFBQUMsS0FBSyxTQUFTO0FBQ3ZDLG1CQWxsQlUsSUFBSSxFQWtsQlQsR0FBRyxFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRSxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUM5RDtBQUNDLGdCQUFVLEVBQUUsQ0FBQTtBQUFBLEtBQ2I7SUFDRDtHQUNEOztBQUVELFdBQVMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN6QixTQUFNLFdBQVcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFBOzs7O0FBSTlCLFNBQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFBO0FBQ2xDLE9BQUksVUFBVSxFQUFFO0FBQ2YsVUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3pDLGlCQWptQkssS0FBSyxFQWltQkosWUFBWSxLQUFLLFdBQVcsRUFBRSxHQUFHLEVBQ3RDLHNFQUFzRSxDQUFDLENBQUE7SUFDeEU7Ozs7QUFJRCxPQUFJLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRWIsWUFBUyxlQUFlLEdBQUc7QUFDMUIsUUFBSSxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQ2hCLHNCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZCLFNBQUksR0FBRyxFQUFFLENBQUE7S0FDVDtJQUNEOztBQUVELFlBQVMsU0FBUyxHQUFHO0FBQ3BCLFdBQU8sa0JBbm5Cb0QsYUFBYSxFQW1uQm5ELEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDM0I7O0FBRUQsWUFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQWxuQkosTUFBTSxDQWtuQkssS0FBSyxDQUFDLENBQUE7O0FBRTFDLFdBQVEsRUFBRSxPQUFPLElBQUksRUFBRTtBQUN0QixVQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNsQixZQUFRLElBQUk7QUFDWCxVQUFLLFNBQVM7QUFBRTtBQUNmLGFBQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFdBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUE7QUFDOUMsYUFBSztPQUNMO0FBQUE7QUFFRCxVQUFLLFFBQVE7QUFDWixVQUFJLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQTtBQUNuQixZQUFLO0FBQUEsQUFDTixVQUFLLFNBQVM7QUFBRTtBQUNmLHNCQUFlLEVBQUUsQ0FBQTtBQUNqQixhQUFNLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQTtBQUNyQixzQkFBZSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2xCLGVBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNkLHVCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25CLGFBQUs7T0FDTDtBQUFBO0FBRUQsVUFBSyxPQUFPO0FBQUU7QUFDYixhQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQTs7QUFFekIsa0JBQVcsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7O0FBRTNDLG9CQWhwQkcsS0FBSyxFQWdwQkYsVUFBVSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBOztBQUUvQyxhQUFNLFdBQVcsR0FBRyxZQUFZLEVBQUUsQ0FBQTtBQUNsQyxhQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEMsV0FBSSxTQUFTLEdBQUcsV0FBVyxFQUFFOzs7QUFHNUIsb0JBQVksQ0FBQyxXQUFXLEVBQUUsV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFBO0FBQ2xELGtCQXBwQkUsTUFBTSxFQW9wQkQsSUFBSSxFQUFFLEtBQUssT0FBTyxDQUFDLENBQUE7QUFDMUIsY0FBTSxRQUFRLENBQUE7UUFDZCxNQUNBLElBQUksR0FBRyxJQUFJLEdBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQTtBQUNqRSxhQUFLO09BQ0w7QUFBQSxBQUNELFVBQUssS0FBSztBQUNULFVBQUksQ0FBQyxVQUFVLEVBQ2QsTUFBTSxRQUFRLENBQUE7QUFBQTtBQUVoQjs7O0FBR0MsVUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQUEsS0FDeEM7SUFDRDs7QUFFRCxrQkFBZSxFQUFFLENBQUE7QUFDakIsYUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BenFCTyxNQUFNLENBeXFCTixLQUFLLENBQUMsQ0FBQTtHQUMvQjs7QUFFRCxVQUFRLEdBQUcsV0E1cUJRLEtBQUssQ0E0cUJILCtCQWhyQmlCLFFBQVEsRUFnckJQLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQTVxQnhCLE1BQU0sQ0E0cUJ5QixLQUFLLENBQUMsQ0FBQTtBQUMvRCxVQUFRLGVBanJCOEIsUUFBUSxDQWlyQjVCLENBQUE7O0FBRWxCLFVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFZixRQUFNLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNwQixXQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakIsWUFqckJPLE1BQU0sRUFpckJOLFVBanJCZ0IsT0FBTyxFQWlyQmYsVUFBVSxDQUFDLENBQUMsQ0FBQTtBQUMzQixVQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUE7QUFDekIsU0FBTyxRQUFRLENBQUE7RUFDZjs7QUFFRCxVQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDZCxTQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDdEI7QUFDRCxPQUNDLFNBQVMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ3BCLFFBQVEsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2xCLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2QsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDYixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2QsVUFBVSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDcEIsWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDdEIsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUMxQixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2YsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDYixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2hCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ2pCLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDWixFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNaLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDO09BQ1osT0FBTyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDbEIsUUFBUSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FDbkIsU0FBUyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDbkIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDckIsZUFBZSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDekIsT0FBTyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDakIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7T0FDZixTQUFTLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNuQixLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztPQUNmLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO09BQ2QsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFaEIsVUFBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLFNBQU8sa0JBeHVCQSxJQUFJLEVBd3VCQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7RUFDdEM7O0FBRUQsVUFBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNqQyxNQUFJLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQTtBQUMxQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDMUMsR0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsS0FBSyxHQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDNUMsS0FBRyxHQUFHLENBQUMsR0FBRSxHQUFHLEVBQUMsUUFBUSxHQUFFLENBQUMsTUFBTSxFQUFDLGtCQUFrQixHQUFFLE1BQU0sRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUM5RCxTQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7RUFDMUI7O0FBRUQsT0FDQyxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztPQUNqQyxhQUFhLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztPQUMvQixZQUFZLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQztPQUNwQyxVQUFVLEdBQUcsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUE7OztBQUczQyxPQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQTtBQUN4QyxPQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsaUJBQWlCLEdBQUcsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUEiLCJmaWxlIjoibGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvYywge1BvcywgU3RhcnRMaW5lLCBTdGFydExvYywgU3RhcnRQb3MsIFN0YXJ0Q29sdW1uLCBzaW5nbGVDaGFyTG9jfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcbmltcG9ydCB7Y29kZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbCwgb3B0aW9ucywgd2Fybn0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtOdW1iZXJMaXRlcmFsfSBmcm9tICcuL01zQXN0J1xuaW1wb3J0IHtEb2NDb21tZW50LCBHcm91cCwgR3JvdXBzLCBpc0tleXdvcmQsIEtleXdvcmQsIEtleXdvcmRzLCBOYW1lLCBvcEtleXdvcmRLaW5kRnJvbU5hbWUsXG5cdHNob3dHcm91cEtpbmR9IGZyb20gJy4vVG9rZW4nXG5pbXBvcnQge2Fzc2VydCwgaWZFbHNlLCBpc0VtcHR5LCBsYXN0fSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuTGV4ZXMgdGhlIHNvdXJjZSBjb2RlIGludG8ge0BsaW5rIFRva2VufXMuXG5UaGUgTWFzb24gbGV4ZXIgYWxzbyBncm91cHMgdG9rZW5zIGFzIHBhcnQgb2YgbGV4aW5nLlxuVGhpcyBtYWtlcyB3cml0aW5nIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyIGVhc3kuXG5TZWUge0BsaW5rIEdyb3VwfS5cblxuQHBhcmFtIHtzdHJpbmd9IHNvdXJjZVN0cmluZ1xuQHJldHVybiB7R3JvdXA8R3JvdXBzLkJsb2NrPn1cblx0QmxvY2sgdG9rZW4gcmVwcmVzZW50aW5nIHRoZSB3aG9sZSBtb2R1bGUuXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbGV4KHNvdXJjZVN0cmluZykge1xuXHQvLyBBbGdvcml0aG0gcmVxdWlyZXMgdHJhaWxpbmcgbmV3bGluZSB0byBjbG9zZSBhbnkgYmxvY2tzLlxuXHRjaGVjayhzb3VyY2VTdHJpbmcuZW5kc1dpdGgoJ1xcbicpLCBTdGFydExvYywgJ1NvdXJjZSBjb2RlIG11c3QgZW5kIGluIG5ld2xpbmUuJylcblxuXHQvKlxuXHRVc2UgYSAwLXRlcm1pbmF0ZWQgc3RyaW5nIHNvIHRoYXQgd2UgY2FuIHVzZSBgMGAgYXMgYSBzd2l0Y2ggY2FzZS5cblx0VGhpcyBpcyBmYXN0ZXIgdGhhbiBjaGVja2luZyB3aGV0aGVyIGluZGV4ID09PSBsZW5ndGguXG5cdChJZiB3ZSBjaGVjayBwYXN0IHRoZSBlbmQgb2YgdGhlIHN0cmluZyB3ZSBnZXQgYE5hTmAsIHdoaWNoIGNhbid0IGJlIHN3aXRjaGVkIG9uLilcblx0Ki9cblx0c291cmNlU3RyaW5nID0gYCR7c291cmNlU3RyaW5nfVxcMGBcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBHUk9VUElOR1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBXZSBvbmx5IGV2ZXIgd3JpdGUgdG8gdGhlIGlubmVybW9zdCBHcm91cDtcblx0Ly8gd2hlbiB3ZSBjbG9zZSB0aGF0IEdyb3VwIHdlIGFkZCBpdCB0byB0aGUgZW5jbG9zaW5nIEdyb3VwIGFuZCBjb250aW51ZSB3aXRoIHRoYXQgb25lLlxuXHQvLyBOb3RlIHRoYXQgYGN1ckdyb3VwYCBpcyBjb25jZXB0dWFsbHkgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGJ1dCBpcyBub3Qgc3RvcmVkIGluIGBzdGFja2AuXG5cdGNvbnN0IGdyb3VwU3RhY2sgPSBbXVxuXHRsZXQgY3VyR3JvdXBcblx0ZnVuY3Rpb24gYWRkVG9DdXJyZW50R3JvdXAodG9rZW4pIHtcblx0XHRjdXJHcm91cC5zdWJUb2tlbnMucHVzaCh0b2tlbilcblx0fVxuXG5cdGZ1bmN0aW9uIGRyb3BHcm91cCgpIHtcblx0XHRjdXJHcm91cCA9IGdyb3VwU3RhY2sucG9wKClcblx0fVxuXG5cdC8vIFBhdXNlIHdyaXRpbmcgdG8gY3VyR3JvdXAgaW4gZmF2b3Igb2Ygd3JpdGluZyB0byBhIHN1Yi1ncm91cC5cblx0Ly8gV2hlbiB0aGUgc3ViLWdyb3VwIGZpbmlzaGVzIHdlIHdpbGwgcG9wIHRoZSBzdGFjayBhbmQgcmVzdW1lIHdyaXRpbmcgdG8gaXRzIHBhcmVudC5cblx0ZnVuY3Rpb24gb3Blbkdyb3VwKG9wZW5Qb3MsIGdyb3VwS2luZCkge1xuXHRcdGdyb3VwU3RhY2sucHVzaChjdXJHcm91cClcblx0XHQvLyBDb250ZW50cyB3aWxsIGJlIGFkZGVkIHRvIGJ5IGBhZGRUb0N1cnJlbnRHcm91cGAuXG5cdFx0Ly8gY3VyR3JvdXAubG9jLmVuZCB3aWxsIGJlIHdyaXR0ZW4gdG8gd2hlbiBjbG9zaW5nIGl0LlxuXHRcdGN1ckdyb3VwID0gbmV3IEdyb3VwKG5ldyBMb2Mob3BlblBvcywgbnVsbCksIFtdLCBncm91cEtpbmQpXG5cdH1cblxuXHRmdW5jdGlvbiBtYXliZUNsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZCkge1xuXHRcdGlmIChjdXJHcm91cC5raW5kID09PSBjbG9zZUtpbmQpXG5cdFx0XHRfY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKVxuXHR9XG5cblx0ZnVuY3Rpb24gY2xvc2VHcm91cChjbG9zZVBvcywgY2xvc2VLaW5kKSB7XG5cdFx0Y2hlY2soY2xvc2VLaW5kID09PSBjdXJHcm91cC5raW5kLCBjbG9zZVBvcywgKCkgPT5cblx0XHRcdGBUcnlpbmcgdG8gY2xvc2UgJHtzaG93R3JvdXBLaW5kKGNsb3NlS2luZCl9LCBgICtcblx0XHRcdGBidXQgbGFzdCBvcGVuZWQgJHtzaG93R3JvdXBLaW5kKGN1ckdyb3VwLmtpbmQpfWApXG5cdFx0X2Nsb3NlR3JvdXAoY2xvc2VQb3MsIGNsb3NlS2luZClcblx0fVxuXG5cdGZ1bmN0aW9uIF9jbG9zZUdyb3VwKGNsb3NlUG9zLCBjbG9zZUtpbmQpIHtcblx0XHRsZXQganVzdENsb3NlZCA9IGN1ckdyb3VwXG5cdFx0ZHJvcEdyb3VwKClcblx0XHRqdXN0Q2xvc2VkLmxvYy5lbmQgPSBjbG9zZVBvc1xuXHRcdHN3aXRjaCAoY2xvc2VLaW5kKSB7XG5cdFx0XHRjYXNlIEdyb3Vwcy5TcGFjZToge1xuXHRcdFx0XHRjb25zdCBzaXplID0ganVzdENsb3NlZC5zdWJUb2tlbnMubGVuZ3RoXG5cdFx0XHRcdGlmIChzaXplICE9PSAwKVxuXHRcdFx0XHRcdC8vIFNwYWNlZCBzaG91bGQgYWx3YXlzIGhhdmUgYXQgbGVhc3QgdHdvIGVsZW1lbnRzLlxuXHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHNpemUgPT09IDEgPyBqdXN0Q2xvc2VkLnN1YlRva2Vuc1swXSA6IGp1c3RDbG9zZWQpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR3YXJuKGp1c3RDbG9zZWQubG9jLCAnVW5uZWNlc3Nhcnkgc3BhY2UuJylcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgR3JvdXBzLkxpbmU6XG5cdFx0XHRcdC8vIExpbmUgbXVzdCBoYXZlIGNvbnRlbnQuXG5cdFx0XHRcdC8vIFRoaXMgY2FuIGhhcHBlbiBpZiB0aGVyZSB3YXMganVzdCBhIGNvbW1lbnQuXG5cdFx0XHRcdGlmICghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucykpXG5cdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgR3JvdXBzLkJsb2NrOlxuXHRcdFx0XHRjaGVjayghaXNFbXB0eShqdXN0Q2xvc2VkLnN1YlRva2VucyksIGNsb3NlUG9zLCAnRW1wdHkgYmxvY2suJylcblx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAoanVzdENsb3NlZClcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKGp1c3RDbG9zZWQpXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gY2xvc2VTcGFjZU9LSWZFbXB0eShwb3MpIHtcblx0XHRhc3NlcnQoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLlNwYWNlKVxuXHRcdGlmIChjdXJHcm91cC5zdWJUb2tlbnMubGVuZ3RoID09PSAwKVxuXHRcdFx0ZHJvcEdyb3VwKClcblx0XHRlbHNlXG5cdFx0XHRfY2xvc2VHcm91cChwb3MsIEdyb3Vwcy5TcGFjZSlcblx0fVxuXG5cdGZ1bmN0aW9uIG9wZW5QYXJlbnRoZXNpcyhsb2MpIHtcblx0XHRvcGVuR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuUGFyZW50aGVzaXMpXG5cdFx0b3Blbkdyb3VwKGxvYy5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0fVxuXG5cdGZ1bmN0aW9uIGNsb3NlUGFyZW50aGVzaXMobG9jKSB7XG5cdFx0X2Nsb3NlR3JvdXAobG9jLnN0YXJ0LCBHcm91cHMuU3BhY2UpXG5cdFx0Y2xvc2VHcm91cChsb2MuZW5kLCBHcm91cHMuUGFyZW50aGVzaXMpXG5cdH1cblxuXHRmdW5jdGlvbiBjbG9zZUdyb3Vwc0ZvckRlZGVudChwb3MpIHtcblx0XHRjbG9zZUxpbmUocG9zKVxuXHRcdGNsb3NlR3JvdXAocG9zLCBHcm91cHMuQmxvY2spXG5cdFx0Ly8gSXQncyBPSyB0byBiZSBtaXNzaW5nIGEgY2xvc2luZyBwYXJlbnRoZXNpcyBpZiB0aGVyZSdzIGEgYmxvY2suIEUuZy46XG5cdFx0Ly8gYSAoYlxuXHRcdC8vXHRjIHwgbm8gY2xvc2luZyBwYXJlbiBoZXJlXG5cdFx0d2hpbGUgKGN1ckdyb3VwLmtpbmQgPT09IEdyb3Vwcy5QYXJlbnRoZXNpcyB8fCBjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRfY2xvc2VHcm91cChwb3MsIGN1ckdyb3VwLmtpbmQpXG5cdH1cblxuXHQvLyBXaGVuIHN0YXJ0aW5nIGEgbmV3IGxpbmUsIGEgc3BhY2VkIGdyb3VwIGlzIGNyZWF0ZWQgaW1wbGljaXRseS5cblx0ZnVuY3Rpb24gb3BlbkxpbmUocG9zKSB7XG5cdFx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG5cdFx0b3Blbkdyb3VwKHBvcywgR3JvdXBzLlNwYWNlKVxuXHR9XG5cblx0ZnVuY3Rpb24gY2xvc2VMaW5lKHBvcykge1xuXHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRjbG9zZVNwYWNlT0tJZkVtcHR5KClcblx0XHRjbG9zZUdyb3VwKHBvcywgR3JvdXBzLkxpbmUpXG5cdH1cblxuXHQvLyBXaGVuIGVuY291bnRlcmluZyBhIHNwYWNlLCBpdCBib3RoIGNsb3NlcyBhbmQgb3BlbnMgYSBzcGFjZWQgZ3JvdXAuXG5cdGZ1bmN0aW9uIHNwYWNlKGxvYykge1xuXHRcdG1heWJlQ2xvc2VHcm91cChsb2Muc3RhcnQsIEdyb3Vwcy5TcGFjZSlcblx0XHRvcGVuR3JvdXAobG9jLmVuZCwgR3JvdXBzLlNwYWNlKVxuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gSVRFUkFUSU5HIFRIUk9VR0ggU09VUkNFU1RSSU5HXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8qXG5cdFRoZXNlIGFyZSBrZXB0IHVwLXRvLWRhdGUgYXMgd2UgaXRlcmF0ZSB0aHJvdWdoIHNvdXJjZVN0cmluZy5cblx0RXZlcnkgYWNjZXNzIHRvIGluZGV4IGhhcyBjb3JyZXNwb25kaW5nIGNoYW5nZXMgdG8gbGluZSBhbmQvb3IgY29sdW1uLlxuXHRUaGlzIGFsc28gZXhwbGFpbnMgd2h5IHRoZXJlIGFyZSBkaWZmZXJlbnQgZnVuY3Rpb25zIGZvciBuZXdsaW5lcyB2cyBvdGhlciBjaGFyYWN0ZXJzLlxuXHQqL1xuXHRsZXQgaW5kZXggPSAwLCBsaW5lID0gU3RhcnRMaW5lLCBjb2x1bW4gPSBTdGFydENvbHVtblxuXG5cdC8qXG5cdE5PVEU6IFdlIHVzZSBjaGFyYWN0ZXIgKmNvZGVzKiBmb3IgZXZlcnl0aGluZy5cblx0Q2hhcmFjdGVycyBhcmUgb2YgdHlwZSBOdW1iZXIgYW5kIG5vdCBqdXN0IFN0cmluZ3Mgb2YgbGVuZ3RoIG9uZS5cblx0Ki9cblxuXHRmdW5jdGlvbiBwb3MoKSB7XG5cdFx0cmV0dXJuIG5ldyBQb3MobGluZSwgY29sdW1uKVxuXHR9XG5cblx0ZnVuY3Rpb24gcGVlaygpIHtcblx0XHRyZXR1cm4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpXG5cdH1cblx0ZnVuY3Rpb24gcGVla05leHQoKSB7XG5cdFx0cmV0dXJuIHNvdXJjZVN0cmluZy5jaGFyQ29kZUF0KGluZGV4ICsgMSlcblx0fVxuXHRmdW5jdGlvbiBwZWVrUHJldigpIHtcblx0XHRyZXR1cm4gc291cmNlU3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggLSAxKVxuXHR9XG5cdGZ1bmN0aW9uIHBlZWsyQmVmb3JlKCkge1xuXHRcdHJldHVybiBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleCAtIDIpXG5cdH1cblxuXHQvLyBNYXkgZWF0IGEgTmV3bGluZS5cblx0Ly8gQ2FsbGVyICptdXN0KiBjaGVjayBmb3IgdGhhdCBjYXNlIGFuZCBpbmNyZW1lbnQgbGluZSFcblx0ZnVuY3Rpb24gZWF0KCkge1xuXHRcdGNvbnN0IGNoYXIgPSBzb3VyY2VTdHJpbmcuY2hhckNvZGVBdChpbmRleClcblx0XHRza2lwKClcblx0XHRyZXR1cm4gY2hhclxuXHR9XG5cdGZ1bmN0aW9uIHNraXAoKSB7XG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRjb2x1bW4gPSBjb2x1bW4gKyAxXG5cdH1cblxuXHQvLyBjaGFyVG9FYXQgbXVzdCBub3QgYmUgTmV3bGluZS5cblx0ZnVuY3Rpb24gdHJ5RWF0KGNoYXJUb0VhdCkge1xuXHRcdGNvbnN0IGNhbkVhdCA9IHBlZWsoKSA9PT0gY2hhclRvRWF0XG5cdFx0aWYgKGNhbkVhdCkge1xuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGNvbHVtbiA9IGNvbHVtbiArIDFcblx0XHR9XG5cdFx0cmV0dXJuIGNhbkVhdFxuXHR9XG5cblx0ZnVuY3Rpb24gbXVzdEVhdChjaGFyVG9FYXQsIHByZWNlZGVkQnkpIHtcblx0XHRjb25zdCBjYW5FYXQgPSB0cnlFYXQoY2hhclRvRWF0KVxuXHRcdGNoZWNrKGNhbkVhdCwgcG9zLCAoKSA9PlxuXHRcdFx0YCR7Y29kZShwcmVjZWRlZEJ5KX0gbXVzdCBiZSBmb2xsb3dlZCBieSAke3Nob3dDaGFyKGNoYXJUb0VhdCl9YClcblx0fVxuXG5cdGZ1bmN0aW9uIHRyeUVhdE5ld2xpbmUoKSB7XG5cdFx0Y29uc3QgY2FuRWF0ID0gcGVlaygpID09PSBOZXdsaW5lXG5cdFx0aWYgKGNhbkVhdCkge1xuXHRcdFx0aW5kZXggPSBpbmRleCArIDFcblx0XHRcdGxpbmUgPSBsaW5lICsgMVxuXHRcdFx0Y29sdW1uID0gU3RhcnRDb2x1bW5cblx0XHR9XG5cdFx0cmV0dXJuIGNhbkVhdFxuXHR9XG5cblx0Ly8gQ2FsbGVyIG11c3QgZW5zdXJlIHRoYXQgYmFja2luZyB1cCBuQ2hhcnNUb0JhY2tVcCBjaGFyYWN0ZXJzIGJyaW5ncyB1cyB0byBvbGRQb3MuXG5cdGZ1bmN0aW9uIHN0ZXBCYWNrTWFueShvbGRQb3MsIG5DaGFyc1RvQmFja1VwKSB7XG5cdFx0aW5kZXggPSBpbmRleCAtIG5DaGFyc1RvQmFja1VwXG5cdFx0bGluZSA9IG9sZFBvcy5saW5lXG5cdFx0Y29sdW1uID0gb2xkUG9zLmNvbHVtblxuXHR9XG5cblx0Ly8gRm9yIHRha2VXaGlsZSwgdGFrZVdoaWxlV2l0aFByZXYsIGFuZCBza2lwV2hpbGVFcXVhbHMsXG5cdC8vIGNoYXJhY3RlclByZWRpY2F0ZSBtdXN0ICpub3QqIGFjY2VwdCBOZXdsaW5lLlxuXHQvLyBPdGhlcndpc2UgdGhlcmUgbWF5IGJlIGFuIGluZmluaXRlIGxvb3AhXG5cdGZ1bmN0aW9uIHRha2VXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0XHRyZXR1cm4gX3Rha2VXaGlsZVdpdGhTdGFydChpbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKVxuXHR9XG5cdGZ1bmN0aW9uIHRha2VXaGlsZVdpdGhQcmV2KGNoYXJhY3RlclByZWRpY2F0ZSkge1xuXHRcdHJldHVybiBfdGFrZVdoaWxlV2l0aFN0YXJ0KGluZGV4IC0gMSwgY2hhcmFjdGVyUHJlZGljYXRlKVxuXHR9XG5cdGZ1bmN0aW9uIF90YWtlV2hpbGVXaXRoU3RhcnQoc3RhcnRJbmRleCwgY2hhcmFjdGVyUHJlZGljYXRlKSB7XG5cdFx0c2tpcFdoaWxlKGNoYXJhY3RlclByZWRpY2F0ZSlcblx0XHRyZXR1cm4gc291cmNlU3RyaW5nLnNsaWNlKHN0YXJ0SW5kZXgsIGluZGV4KVxuXHR9XG5cblx0ZnVuY3Rpb24gc2tpcFdoaWxlRXF1YWxzKGNoYXIpIHtcblx0XHRyZXR1cm4gc2tpcFdoaWxlKF8gPT4gXyA9PT0gY2hhcilcblx0fVxuXG5cdGZ1bmN0aW9uIHNraXBSZXN0T2ZMaW5lKCkge1xuXHRcdHJldHVybiBza2lwV2hpbGUoXyA9PiBfICE9PSBOZXdsaW5lKVxuXHR9XG5cblx0ZnVuY3Rpb24gZWF0UmVzdE9mTGluZSgpIHtcblx0XHRyZXR1cm4gdGFrZVdoaWxlKF8gPT4gXyAhPT0gTmV3bGluZSlcblx0fVxuXG5cdGZ1bmN0aW9uIHNraXBXaGlsZShjaGFyYWN0ZXJQcmVkaWNhdGUpIHtcblx0XHRjb25zdCBzdGFydEluZGV4ID0gaW5kZXhcblx0XHR3aGlsZSAoY2hhcmFjdGVyUHJlZGljYXRlKHBlZWsoKSkpXG5cdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdGNvbnN0IGRpZmYgPSBpbmRleCAtIHN0YXJ0SW5kZXhcblx0XHRjb2x1bW4gPSBjb2x1bW4gKyBkaWZmXG5cdFx0cmV0dXJuIGRpZmZcblx0fVxuXG5cdC8vIENhbGxlZCBhZnRlciBzZWVpbmcgdGhlIGZpcnN0IG5ld2xpbmUuXG5cdC8vIFJldHVybnMgIyB0b3RhbCBuZXdsaW5lcywgaW5jbHVkaW5nIHRoZSBmaXJzdC5cblx0ZnVuY3Rpb24gc2tpcE5ld2xpbmVzKCkge1xuXHRcdGNvbnN0IHN0YXJ0TGluZSA9IGxpbmVcblx0XHRsaW5lID0gbGluZSArIDFcblx0XHR3aGlsZSAocGVlaygpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHRcdFx0bGluZSA9IGxpbmUgKyAxXG5cdFx0fVxuXHRcdGNvbHVtbiA9IFN0YXJ0Q29sdW1uXG5cdFx0cmV0dXJuIGxpbmUgLSBzdGFydExpbmVcblx0fVxuXG5cdC8vIFNwcmlua2xlIGNoZWNrUG9zKCkgYXJvdW5kIHRvIGRlYnVnIGxpbmUgYW5kIGNvbHVtbiB0cmFja2luZyBlcnJvcnMuXG5cdC8qXG5cdGZ1bmN0aW9uIGNoZWNrUG9zKCkge1xuXHRcdGNvbnN0IHAgPSBfZ2V0Q29ycmVjdFBvcygpXG5cdFx0aWYgKHAubGluZSAhPT0gbGluZSB8fCBwLmNvbHVtbiAhPT0gY29sdW1uKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbmRleDogJHtpbmRleH0sIHdyb25nOiAke1BvcyhsaW5lLCBjb2x1bW4pfSwgcmlnaHQ6ICR7cH1gKVxuXHR9XG5cdGNvbnN0IF9pbmRleFRvUG9zID0gbmV3IE1hcCgpXG5cdGZ1bmN0aW9uIF9nZXRDb3JyZWN0UG9zKCkge1xuXHRcdGlmIChpbmRleCA9PT0gMClcblx0XHRcdHJldHVybiBQb3MoU3RhcnRMaW5lLCBTdGFydENvbHVtbilcblxuXHRcdGxldCBvbGRQb3MsIG9sZEluZGV4XG5cdFx0Zm9yIChvbGRJbmRleCA9IGluZGV4IC0gMTsgOyBvbGRJbmRleCA9IG9sZEluZGV4IC0gMSkge1xuXHRcdFx0b2xkUG9zID0gX2luZGV4VG9Qb3MuZ2V0KG9sZEluZGV4KVxuXHRcdFx0aWYgKG9sZFBvcyAhPT0gdW5kZWZpbmVkKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0YXNzZXJ0KG9sZEluZGV4ID49IDApXG5cdFx0fVxuXHRcdGxldCBuZXdMaW5lID0gb2xkUG9zLmxpbmUsIG5ld0NvbHVtbiA9IG9sZFBvcy5jb2x1bW5cblx0XHRmb3IgKDsgb2xkSW5kZXggPCBpbmRleDsgb2xkSW5kZXggPSBvbGRJbmRleCArIDEpXG5cdFx0XHRpZiAoc291cmNlU3RyaW5nLmNoYXJDb2RlQXQob2xkSW5kZXgpID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdG5ld0xpbmUgPSBuZXdMaW5lICsgMVxuXHRcdFx0XHRuZXdDb2x1bW4gPSBTdGFydENvbHVtblxuXHRcdFx0fSBlbHNlXG5cdFx0XHRcdG5ld0NvbHVtbiA9IG5ld0NvbHVtbiArIDFcblxuXHRcdGNvbnN0IHAgPSBQb3MobmV3TGluZSwgbmV3Q29sdW1uKVxuXHRcdF9pbmRleFRvUG9zLnNldChpbmRleCwgcClcblx0XHRyZXR1cm4gcFxuXHR9XG5cdCovXG5cblx0Lypcblx0SW4gdGhlIGNhc2Ugb2YgcXVvdGUgaW50ZXJwb2xhdGlvbiAoXCJhe2J9Y1wiKSB3ZSdsbCByZWN1cnNlIGJhY2sgaW50byBoZXJlLlxuXHRXaGVuIGlzSW5RdW90ZSBpcyB0cnVlLCB3ZSB3aWxsIG5vdCBhbGxvdyBuZXdsaW5lcy5cblx0Ki9cblx0ZnVuY3Rpb24gbGV4UGxhaW4oaXNJblF1b3RlKSB7XG5cdFx0Ly8gVGhpcyB0ZWxscyB1cyB3aGljaCBpbmRlbnRlZCBibG9jayB3ZSdyZSBpbi5cblx0XHQvLyBJbmNyZW1lbnRpbmcgaXQgbWVhbnMgaXNzdWluZyBhIEdQX09wZW5CbG9jayBhbmQgZGVjcmVtZW50aW5nIGl0IG1lYW5zIGEgR1BfQ2xvc2VCbG9jay5cblx0XHQvLyBEb2VzIG5vdGhpbmcgaWYgaXNJblF1b3RlLlxuXHRcdGxldCBpbmRlbnQgPSAwXG5cblx0XHQvLyBNYWtlIGNsb3N1cmVzIG5vdyByYXRoZXIgdGhhbiBpbnNpZGUgdGhlIGxvb3AuXG5cdFx0Ly8gVGhpcyBpcyBzaWduaWZpY2FudGx5IGZhc3RlciBhcyBvZiBub2RlIHYwLjExLjE0LlxuXG5cdFx0Ly8gVGhpcyBpcyB3aGVyZSB3ZSBzdGFydGVkIGxleGluZyB0aGUgY3VycmVudCB0b2tlbi5cblx0XHRsZXQgc3RhcnRDb2x1bW5cblx0XHRmdW5jdGlvbiBzdGFydFBvcygpIHtcblx0XHRcdHJldHVybiBuZXcgUG9zKGxpbmUsIHN0YXJ0Q29sdW1uKVxuXHRcdH1cblx0XHRmdW5jdGlvbiBsb2MoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IExvYyhzdGFydFBvcygpLCBwb3MoKSlcblx0XHR9XG5cdFx0ZnVuY3Rpb24ga2V5d29yZChraW5kKSB7XG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgS2V5d29yZChsb2MoKSwga2luZCkpXG5cdFx0fVxuXHRcdGZ1bmN0aW9uIGZ1bktleXdvcmQoa2luZCkge1xuXHRcdFx0a2V5d29yZChraW5kKVxuXHRcdFx0Ly8gRmlyc3QgYXJnIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwXG5cdFx0XHRzcGFjZShsb2MoKSlcblx0XHR9XG5cdFx0ZnVuY3Rpb24gZWF0QW5kQWRkTnVtYmVyKCkge1xuXHRcdFx0Y29uc3Qgc3RhcnRJbmRleCA9IGluZGV4IC0gMVxuXG5cdFx0XHR0cnlFYXQoSHlwaGVuKVxuXHRcdFx0aWYgKHBlZWtQcmV2KCkgPT09IE4wKSB7XG5cdFx0XHRcdGNvbnN0IHAgPSBwZWVrKClcblx0XHRcdFx0c3dpdGNoIChwKSB7XG5cdFx0XHRcdFx0Y2FzZSBMZXR0ZXJCOiBjYXNlIExldHRlck86IGNhc2UgTGV0dGVyWDpcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0Y29uc3QgaXNEaWdpdFNwZWNpYWwgPVxuXHRcdFx0XHRcdFx0XHRwID09PSBMZXR0ZXJCID9cblx0XHRcdFx0XHRcdFx0aXNEaWdpdEJpbmFyeSA6XG5cdFx0XHRcdFx0XHRcdHAgPT09IExldHRlck8gP1xuXHRcdFx0XHRcdFx0XHRpc0RpZ2l0T2N0YWwgOlxuXHRcdFx0XHRcdFx0XHRpc0RpZ2l0SGV4XG5cdFx0XHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdFNwZWNpYWwpXG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdGNhc2UgRG90OlxuXHRcdFx0XHRcdFx0aWYgKGlzRGlnaXQocGVla05leHQoKSkpIHtcblx0XHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRza2lwV2hpbGUoaXNEaWdpdClcblx0XHRcdFx0aWYgKHRyeUVhdChEb3QpKVxuXHRcdFx0XHRcdHNraXBXaGlsZShpc0RpZ2l0KVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBzdHIgPSBzb3VyY2VTdHJpbmcuc2xpY2Uoc3RhcnRJbmRleCwgaW5kZXgpXG5cdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTnVtYmVyTGl0ZXJhbChsb2MoKSwgc3RyKSlcblx0XHR9XG5cdFx0ZnVuY3Rpb24gZWF0SW5kZW50KCkge1xuXHRcdFx0Y29uc3Qgb3B0SW5kZW50ID0gb3B0aW9ucy5pbmRlbnQoKVxuXHRcdFx0aWYgKG9wdEluZGVudCA9PT0gJ1xcdCcpIHtcblx0XHRcdFx0Y29uc3QgaW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0Y2hlY2socGVlaygpICE9PSBTcGFjZSwgcG9zLCAnTGluZSBiZWdpbnMgaW4gYSBzcGFjZScpXG5cdFx0XHRcdHJldHVybiBpbmRlbnRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNwYWNlcyA9IHNraXBXaGlsZUVxdWFscyhTcGFjZSlcblx0XHRcdFx0Y2hlY2soc3BhY2VzICUgb3B0SW5kZW50ID09PSAwLCBwb3MsICgpID0+XG5cdFx0XHRcdFx0YEluZGVudGF0aW9uIHNwYWNlcyBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtvcHRJbmRlbnR9YClcblx0XHRcdFx0cmV0dXJuIHNwYWNlcyAvIG9wdEluZGVudFxuXHRcdFx0fVxuXHRcdH1cblxuXG5cdFx0ZnVuY3Rpb24gaGFuZGxlTmFtZSgpIHtcblx0XHRcdGNoZWNrKGlzTmFtZUNoYXJhY3RlcihwZWVrUHJldigpKSwgbG9jKCksICgpID0+XG5cdFx0XHRcdGBSZXNlcnZlZCBjaGFyYWN0ZXIgJHtzaG93Q2hhcihwZWVrUHJldigpKX1gKVxuXG5cdFx0XHQvLyBBbGwgb3RoZXIgY2hhcmFjdGVycyBzaG91bGQgYmUgaGFuZGxlZCBpbiBhIGNhc2UgYWJvdmUuXG5cdFx0XHRjb25zdCBuYW1lID0gdGFrZVdoaWxlV2l0aFByZXYoaXNOYW1lQ2hhcmFjdGVyKVxuXHRcdFx0aWYgKG5hbWUuZW5kc1dpdGgoJ18nKSkge1xuXHRcdFx0XHRpZiAobmFtZS5sZW5ndGggPiAxKVxuXHRcdFx0XHRcdF9oYW5kbGVOYW1lKG5hbWUuc2xpY2UoMCwgbmFtZS5sZW5ndGggLSAxKSlcblx0XHRcdFx0a2V5d29yZChLZXl3b3Jkcy5Gb2N1cylcblx0XHRcdH0gZWxzZVxuXHRcdFx0XHRfaGFuZGxlTmFtZShuYW1lKVxuXHRcdH1cblx0XHRmdW5jdGlvbiBfaGFuZGxlTmFtZShuYW1lKSB7XG5cdFx0XHQvL3JlbmFtZSB0aGlzIGZ1bmN0aW9uXG5cdFx0XHRpZkVsc2Uob3BLZXl3b3JkS2luZEZyb21OYW1lKG5hbWUpLFxuXHRcdFx0XHRraW5kID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKGtpbmQpIHtcblx0XHRcdFx0XHRcdGNhc2UgS2V5d29yZHMuUmVnaW9uOlxuXHRcdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuUmVnaW9uKVxuXHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0Y2FzZSBLZXl3b3Jkcy5Ub2RvOlxuXHRcdFx0XHRcdFx0XHQvLyBUT0RPOiB3YXJuXG5cdFx0XHRcdFx0XHRcdHNraXBSZXN0T2ZMaW5lKClcblx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoa2luZClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgTmFtZShsb2MoKSwgbmFtZSkpXG5cdFx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHN0YXJ0Q29sdW1uID0gY29sdW1uXG5cdFx0XHRjb25zdCBjaGFyYWN0ZXJFYXRlbiA9IGVhdCgpXG5cdFx0XHQvLyBHZW5lcmFsbHksIHRoZSB0eXBlIG9mIGEgdG9rZW4gaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVyLlxuXHRcdFx0c3dpdGNoIChjaGFyYWN0ZXJFYXRlbikge1xuXHRcdFx0XHRjYXNlIE51bGxDaGFyOlxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRjYXNlIENsb3NlQnJhY2U6XG5cdFx0XHRcdFx0Y2hlY2soaXNJblF1b3RlLCBsb2MsICgpID0+XG5cdFx0XHRcdFx0XHRgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoQ2xvc2VCcmFjZSl9YClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0Y2FzZSBRdW90ZTpcblx0XHRcdFx0XHRsZXhRdW90ZShpbmRlbnQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBHUk9VUFNcblxuXHRcdFx0XHRjYXNlIE9wZW5QYXJlbnRoZXNpczpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENsb3NlUGFyZW50aGVzaXMpKVxuXHRcdFx0XHRcdFx0YWRkVG9DdXJyZW50R3JvdXAobmV3IEdyb3VwKGxvYygpLCBbXSwgR3JvdXBzLlBhcmVudGhlc2lzKSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRvcGVuUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2tldDpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENsb3NlQnJhY2tldCkpXG5cdFx0XHRcdFx0XHRhZGRUb0N1cnJlbnRHcm91cChuZXcgR3JvdXAobG9jKCksIFtdLCBHcm91cHMuQnJhY2tldCkpXG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLkJyYWNrZXQpXG5cdFx0XHRcdFx0XHRvcGVuR3JvdXAocG9zKCksIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZVBhcmVudGhlc2lzOlxuXHRcdFx0XHRcdGNsb3NlUGFyZW50aGVzaXMobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBDbG9zZUJyYWNrZXQ6XG5cdFx0XHRcdFx0X2Nsb3NlR3JvdXAoc3RhcnRQb3MoKSwgR3JvdXBzLlNwYWNlKVxuXHRcdFx0XHRcdGNsb3NlR3JvdXAocG9zKCksIEdyb3Vwcy5CcmFja2V0KVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdGNhc2UgU3BhY2U6XG5cdFx0XHRcdFx0c3BhY2UobG9jKCkpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOZXdsaW5lOiB7XG5cdFx0XHRcdFx0Y2hlY2soIWlzSW5RdW90ZSwgbG9jLCAnUXVvdGUgaW50ZXJwb2xhdGlvbiBjYW5ub3QgY29udGFpbiBuZXdsaW5lJylcblx0XHRcdFx0XHRpZiAocGVlazJCZWZvcmUoKSA9PT0gU3BhY2UpXG5cdFx0XHRcdFx0XHR3YXJuKHBvcywgJ0xpbmUgZW5kcyBpbiBhIHNwYWNlLicpXG5cblx0XHRcdFx0XHQvLyBTa2lwIGFueSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRza2lwTmV3bGluZXMoKVxuXHRcdFx0XHRcdGNvbnN0IG9sZEluZGVudCA9IGluZGVudFxuXHRcdFx0XHRcdGluZGVudCA9IGVhdEluZGVudCgpXG5cdFx0XHRcdFx0aWYgKGluZGVudCA+IG9sZEluZGVudCkge1xuXHRcdFx0XHRcdFx0Y2hlY2soaW5kZW50ID09PSBvbGRJbmRlbnQgKyAxLCBsb2MsXG5cdFx0XHRcdFx0XHRcdCdMaW5lIGlzIGluZGVudGVkIG1vcmUgdGhhbiBvbmNlJylcblx0XHRcdFx0XHRcdGNvbnN0IGwgPSBsb2MoKVxuXHRcdFx0XHRcdFx0Ly8gQmxvY2sgYXQgZW5kIG9mIGxpbmUgZ29lcyBpbiBpdHMgb3duIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdC8vIEhvd2V2ZXIsIGB+YCBwcmVjZWRpbmcgYSBibG9jayBnb2VzIGluIGEgZ3JvdXAgd2l0aCBpdC5cblx0XHRcdFx0XHRcdGlmIChpc0VtcHR5KGN1ckdyb3VwLnN1YlRva2VucykgfHxcblx0XHRcdFx0XHRcdFx0IWlzS2V5d29yZChLZXl3b3Jkcy5MYXp5LCBsYXN0KGN1ckdyb3VwLnN1YlRva2VucykpKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChjdXJHcm91cC5raW5kID09PSBHcm91cHMuU3BhY2UpXG5cdFx0XHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShsLnN0YXJ0KVxuXHRcdFx0XHRcdFx0XHRvcGVuR3JvdXAobC5lbmQsIEdyb3Vwcy5TcGFjZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9wZW5Hcm91cChsLnN0YXJ0LCBHcm91cHMuQmxvY2spXG5cdFx0XHRcdFx0XHRvcGVuTGluZShsLmVuZClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc3QgbCA9IGxvYygpXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gaW5kZW50OyBpIDwgb2xkSW5kZW50OyBpID0gaSArIDEpXG5cdFx0XHRcdFx0XHRcdGNsb3NlR3JvdXBzRm9yRGVkZW50KGwuc3RhcnQpXG5cdFx0XHRcdFx0XHRjbG9zZUxpbmUobC5zdGFydClcblx0XHRcdFx0XHRcdG9wZW5MaW5lKGwuZW5kKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgVGFiOlxuXHRcdFx0XHRcdC8vIFdlIGFsd2F5cyBlYXQgdGFicyBpbiB0aGUgTmV3bGluZSBoYW5kbGVyLFxuXHRcdFx0XHRcdC8vIHNvIHRoaXMgd2lsbCBvbmx5IGhhcHBlbiBpbiB0aGUgbWlkZGxlIG9mIGEgbGluZS5cblx0XHRcdFx0XHRmYWlsKGxvYygpLCAnVGFiIG1heSBvbmx5IGJlIHVzZWQgdG8gaW5kZW50JylcblxuXHRcdFx0XHQvLyBGVU5cblxuXHRcdFx0XHRjYXNlIEJhbmc6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW5Ebylcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRoYW5kbGVOYW1lKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIENhc2g6XG5cdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICckIScpXG5cdFx0XHRcdFx0XHRmdW5LZXl3b3JkKEtleXdvcmRzLkZ1bkFzeW5jRG8pXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuQXN5bmMpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBUaWxkZTpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KEJhbmcpKSB7XG5cdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJ34hJylcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuRG8pXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0cnlFYXQoQmFyKSlcblx0XHRcdFx0XHRcdGZ1bktleXdvcmQoS2V5d29yZHMuRnVuR2VuKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuTGF6eSlcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIEJhcjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KFNwYWNlKSB8fCB0cnlFYXQoVGFiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdGV4dCA9IGVhdFJlc3RPZkxpbmUoKVxuXHRcdFx0XHRcdFx0Y2xvc2VTcGFjZU9LSWZFbXB0eShzdGFydFBvcygpKVxuXHRcdFx0XHRcdFx0aWYgKCEoY3VyR3JvdXAua2luZCA9PT0gR3JvdXBzLkxpbmUgJiYgY3VyR3JvdXAuc3ViVG9rZW5zLmxlbmd0aCA9PT0gMCkpXG5cdFx0XHRcdFx0XHRcdGZhaWwobG9jLFxuXHRcdFx0XHRcdFx0XHRcdGBEb2MgY29tbWVudCBtdXN0IGdvIG9uIGl0cyBvd24gbGluZS4gRGlkIHlvdSBtZWFuICR7Y29kZSgnfHwnKX0/YClcblx0XHRcdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKG5ldyBEb2NDb21tZW50KGxvYygpLCB0ZXh0KSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChCYXIpKVxuXHRcdFx0XHRcdFx0Ly8gbm9uLWRvYyBjb21tZW50XG5cdFx0XHRcdFx0XHRza2lwUmVzdE9mTGluZSgpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0ZnVuS2V5d29yZChLZXl3b3Jkcy5GdW4pXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHQvLyBOVU1CRVJcblxuXHRcdFx0XHRjYXNlIEh5cGhlbjpcblx0XHRcdFx0XHRpZiAoaXNEaWdpdChwZWVrKCkpKVxuXHRcdFx0XHRcdFx0Ly8gZWF0QW5kQWRkTnVtYmVyKCkgbG9va3MgYXQgcHJldiBjaGFyYWN0ZXIsIHNvIGh5cGhlbiBpbmNsdWRlZC5cblx0XHRcdFx0XHRcdGVhdEFuZEFkZE51bWJlcigpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBOMDogY2FzZSBOMTogY2FzZSBOMjogY2FzZSBOMzogY2FzZSBONDpcblx0XHRcdFx0Y2FzZSBONTogY2FzZSBONjogY2FzZSBONzogY2FzZSBOODogY2FzZSBOOTpcblx0XHRcdFx0XHRlYXRBbmRBZGROdW1iZXIoKVxuXHRcdFx0XHRcdGJyZWFrXG5cblxuXHRcdFx0XHQvLyBPVEhFUlxuXG5cdFx0XHRcdGNhc2UgRG90OiB7XG5cdFx0XHRcdFx0Y29uc3QgbmV4dCA9IHBlZWsoKVxuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTcGFjZSB8fCBuZXh0ID09PSBOZXdsaW5lKSB7XG5cdFx0XHRcdFx0XHQvLyBPYmpMaXQgYXNzaWduIGluIGl0cyBvd24gc3BhY2VkIGdyb3VwLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuJ3QganVzdCBjcmVhdGUgYSBuZXcgR3JvdXAgaGVyZSBiZWNhdXNlIHdlIHdhbnQgdG9cblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBwcmVjZWRpbmcgb3IgZm9sbG93aW5nIHNwYWNlZCBncm91cC5cblx0XHRcdFx0XHRcdGNsb3NlU3BhY2VPS0lmRW1wdHkoc3RhcnRQb3MoKSlcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuT2JqQXNzaWduKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFyKSB7XG5cdFx0XHRcdFx0XHRza2lwKClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpcylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gQmFuZyAmJiBwZWVrTmV4dCgpID09PSBCYXIpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0c2tpcCgpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkZ1blRoaXNEbylcblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAobmV4dCA9PT0gVGlsZGUpIHtcblx0XHRcdFx0XHRcdHNraXAoKVxuXHRcdFx0XHRcdFx0aWYgKHRyeUVhdChCYW5nKSkge1xuXHRcdFx0XHRcdFx0XHRtdXN0RWF0KEJhciwgJy5+IScpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbkRvKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bXVzdEVhdChCYXIsICcuficpXG5cdFx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRnVuVGhpc0dlbilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNwYWNlKGxvYygpKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAocGVlaygpID09PSBEb3QgJiYgcGVla05leHQoKSA9PT0gRG90KSB7XG5cdFx0XHRcdFx0XHRlYXQoKVxuXHRcdFx0XHRcdFx0ZWF0KClcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuRWxsaXBzaXMpXG5cdFx0XHRcdFx0fSBlbHNlXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkRvdClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2FzZSBDb2xvbjpcblx0XHRcdFx0XHRpZiAodHJ5RWF0KENvbG9uKSkge1xuXHRcdFx0XHRcdFx0bXVzdEVhdChFcXVhbCwgJzo6Jylcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuQXNzaWduTXV0YWJsZSlcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRyeUVhdChFcXVhbCkpXG5cdFx0XHRcdFx0XHRrZXl3b3JkKEtleXdvcmRzLkxvY2FsTXV0YXRlKVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGtleXdvcmQoS2V5d29yZHMuVHlwZSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGNhc2UgQW1wZXJzYW5kOiBjYXNlIEJhY2tzbGFzaDogY2FzZSBCYWNrdGljazogY2FzZSBDYXJldDpcblx0XHRcdFx0Y2FzZSBDb21tYTogY2FzZSBQZXJjZW50OiBjYXNlIFNlbWljb2xvbjpcblx0XHRcdFx0XHRmYWlsKGxvYygpLCBgUmVzZXJ2ZWQgY2hhcmFjdGVyICR7c2hvd0NoYXIoY2hhcmFjdGVyRWF0ZW4pfWApXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0aGFuZGxlTmFtZSgpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gbGV4UXVvdGUoaW5kZW50KSB7XG5cdFx0Y29uc3QgcXVvdGVJbmRlbnQgPSBpbmRlbnQgKyAxXG5cblx0XHQvLyBJbmRlbnRlZCBxdW90ZSBpcyBjaGFyYWN0ZXJpemVkIGJ5IGJlaW5nIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IGEgbmV3bGluZS5cblx0XHQvLyBUaGUgbmV4dCBsaW5lICptdXN0KiBoYXZlIHNvbWUgY29udGVudCBhdCB0aGUgbmV4dCBpbmRlbnRhdGlvbi5cblx0XHRjb25zdCBpc0luZGVudGVkID0gdHJ5RWF0TmV3bGluZSgpXG5cdFx0aWYgKGlzSW5kZW50ZWQpIHtcblx0XHRcdGNvbnN0IGFjdHVhbEluZGVudCA9IHNraXBXaGlsZUVxdWFscyhUYWIpXG5cdFx0XHRjaGVjayhhY3R1YWxJbmRlbnQgPT09IHF1b3RlSW5kZW50LCBwb3MsXG5cdFx0XHRcdCdJbmRlbnRlZCBxdW90ZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgbW9yZSBpbmRlbnQgdGhhbiBwcmV2aW91cyBsaW5lLicpXG5cdFx0fVxuXG5cdFx0Ly8gQ3VycmVudCBzdHJpbmcgbGl0ZXJhbCBwYXJ0IG9mIHF1b3RlIHdlIGFyZSByZWFkaW5nLlxuXHRcdC8vIFRoaXMgaXMgYSByYXcgdmFsdWUuXG5cdFx0bGV0IHJlYWQgPSAnJ1xuXG5cdFx0ZnVuY3Rpb24gbWF5YmVPdXRwdXRSZWFkKCkge1xuXHRcdFx0aWYgKHJlYWQgIT09ICcnKSB7XG5cdFx0XHRcdGFkZFRvQ3VycmVudEdyb3VwKHJlYWQpXG5cdFx0XHRcdHJlYWQgPSAnJ1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGxvY1NpbmdsZSgpIHtcblx0XHRcdHJldHVybiBzaW5nbGVDaGFyTG9jKHBvcygpKVxuXHRcdH1cblxuXHRcdG9wZW5Hcm91cChsb2NTaW5nbGUoKS5zdGFydCwgR3JvdXBzLlF1b3RlKVxuXG5cdFx0ZWF0Q2hhcnM6IHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCBjaGFyID0gZWF0KClcblx0XHRcdHN3aXRjaCAoY2hhcikge1xuXHRcdFx0XHRjYXNlIEJhY2tzbGFzaDoge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBlYXQoKVxuXHRcdFx0XHRcdHJlYWQgPSByZWFkICsgYFxcXFwke1N0cmluZy5mcm9tQ2hhckNvZGUobmV4dCl9YFxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gU2luY2UgdGhlc2UgY29tcGlsZSB0byB0ZW1wbGF0ZSBsaXRlcmFscywgaGF2ZSB0byByZW1lbWJlciB0byBlc2NhcGUuXG5cdFx0XHRcdGNhc2UgQmFja3RpY2s6XG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyAnXFxcXGAnXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0Y2FzZSBPcGVuQnJhY2U6IHtcblx0XHRcdFx0XHRtYXliZU91dHB1dFJlYWQoKVxuXHRcdFx0XHRcdGNvbnN0IGwgPSBsb2NTaW5nbGUoKVxuXHRcdFx0XHRcdG9wZW5QYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGxleFBsYWluKHRydWUpXG5cdFx0XHRcdFx0Y2xvc2VQYXJlbnRoZXNpcyhsKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gRG9uJ3QgbmVlZCBgY2FzZSBOdWxsQ2hhcjpgIGJlY2F1c2UgdGhhdCdzIGFsd2F5cyBwcmVjZWRlZCBieSBhIG5ld2xpbmUuXG5cdFx0XHRcdGNhc2UgTmV3bGluZToge1xuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbmFsUG9zID0gcG9zKClcblx0XHRcdFx0XHQvLyBHbyBiYWNrIHRvIGJlZm9yZSB3ZSBhdGUgaXQuXG5cdFx0XHRcdFx0b3JpZ2luYWxQb3MuY29sdW1uID0gb3JpZ2luYWxQb3MuY29sdW1uIC0gMVxuXG5cdFx0XHRcdFx0Y2hlY2soaXNJbmRlbnRlZCwgbG9jU2luZ2xlLCAnVW5jbG9zZWQgcXVvdGUuJylcblx0XHRcdFx0XHQvLyBBbGxvdyBleHRyYSBibGFuayBsaW5lcy5cblx0XHRcdFx0XHRjb25zdCBudW1OZXdsaW5lcyA9IHNraXBOZXdsaW5lcygpXG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5kZW50ID0gc2tpcFdoaWxlRXF1YWxzKFRhYilcblx0XHRcdFx0XHRpZiAobmV3SW5kZW50IDwgcXVvdGVJbmRlbnQpIHtcblx0XHRcdFx0XHRcdC8vIEluZGVudGVkIHF1b3RlIHNlY3Rpb24gaXMgb3Zlci5cblx0XHRcdFx0XHRcdC8vIFVuZG8gcmVhZGluZyB0aGUgdGFicyBhbmQgbmV3bGluZS5cblx0XHRcdFx0XHRcdHN0ZXBCYWNrTWFueShvcmlnaW5hbFBvcywgbnVtTmV3bGluZXMgKyBuZXdJbmRlbnQpXG5cdFx0XHRcdFx0XHRhc3NlcnQocGVlaygpID09PSBOZXdsaW5lKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHR9IGVsc2Vcblx0XHRcdFx0XHRcdHJlYWQgPSByZWFkICtcblx0XHRcdFx0XHRcdFx0J1xcbicucmVwZWF0KG51bU5ld2xpbmVzKSArICdcXHQnLnJlcGVhdChuZXdJbmRlbnQgLSBxdW90ZUluZGVudClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhc2UgUXVvdGU6XG5cdFx0XHRcdFx0aWYgKCFpc0luZGVudGVkKVxuXHRcdFx0XHRcdFx0YnJlYWsgZWF0Q2hhcnNcblx0XHRcdFx0XHQvLyBFbHNlIGZhbGx0aHJvdWdoXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gSSd2ZSB0cmllZCBwdXNoaW5nIGNoYXJhY3RlciBjb2RlcyB0byBhbiBhcnJheSBhbmQgc3RyaW5naWZ5aW5nIHRoZW0gbGF0ZXIsXG5cdFx0XHRcdFx0Ly8gYnV0IHRoaXMgdHVybmVkIG91dCB0byBiZSBiZXR0ZXIuXG5cdFx0XHRcdFx0cmVhZCA9IHJlYWQgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXIpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF5YmVPdXRwdXRSZWFkKClcblx0XHRjbG9zZUdyb3VwKHBvcygpLCBHcm91cHMuUXVvdGUpXG5cdH1cblxuXHRjdXJHcm91cCA9IG5ldyBHcm91cChuZXcgTG9jKFN0YXJ0UG9zLCBudWxsKSwgW10sIEdyb3Vwcy5CbG9jaylcblx0b3BlbkxpbmUoU3RhcnRQb3MpXG5cblx0bGV4UGxhaW4oZmFsc2UpXG5cblx0Y29uc3QgZW5kUG9zID0gcG9zKClcblx0Y2xvc2VMaW5lKGVuZFBvcylcblx0YXNzZXJ0KGlzRW1wdHkoZ3JvdXBTdGFjaykpXG5cdGN1ckdyb3VwLmxvYy5lbmQgPSBlbmRQb3Ncblx0cmV0dXJuIGN1ckdyb3VwXG59XG5cbmZ1bmN0aW9uIGNjKF8pIHtcblx0cmV0dXJuIF8uY2hhckNvZGVBdCgwKVxufVxuY29uc3Rcblx0QW1wZXJzYW5kID0gY2MoJyYnKSxcblx0QmFja3NsYXNoID0gY2MoJ1xcXFwnKSxcblx0QmFja3RpY2sgPSBjYygnYCcpLFxuXHRCYW5nID0gY2MoJyEnKSxcblx0QmFyID0gY2MoJ3wnKSxcblx0Q2FyZXQgPSBjYygnXicpLFxuXHRDYXNoID0gY2MoJyQnKSxcblx0Q2xvc2VCcmFjZSA9IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldCA9IGNjKCddJyksXG5cdENsb3NlUGFyZW50aGVzaXMgPSBjYygnKScpLFxuXHRDb2xvbiA9IGNjKCc6JyksXG5cdENvbW1hID0gY2MoJywnKSxcblx0RG90ID0gY2MoJy4nKSxcblx0RXF1YWwgPSBjYygnPScpLFxuXHRIeXBoZW4gPSBjYygnLScpLFxuXHRMZXR0ZXJCID0gY2MoJ2InKSxcblx0TGV0dGVyTyA9IGNjKCdvJyksXG5cdExldHRlclggPSBjYygneCcpLFxuXHROMCA9IGNjKCcwJyksXG5cdE4xID0gY2MoJzEnKSxcblx0TjIgPSBjYygnMicpLFxuXHROMyA9IGNjKCczJyksXG5cdE40ID0gY2MoJzQnKSxcblx0TjUgPSBjYygnNScpLFxuXHRONiA9IGNjKCc2JyksXG5cdE43ID0gY2MoJzcnKSxcblx0TjggPSBjYygnOCcpLFxuXHROOSA9IGNjKCc5JyksXG5cdE5ld2xpbmUgPSBjYygnXFxuJyksXG5cdE51bGxDaGFyID0gY2MoJ1xcMCcpLFxuXHRPcGVuQnJhY2UgPSBjYygneycpLFxuXHRPcGVuQnJhY2tldCA9IGNjKCdbJyksXG5cdE9wZW5QYXJlbnRoZXNpcyA9IGNjKCcoJyksXG5cdFBlcmNlbnQgPSBjYygnJScpLFxuXHRRdW90ZSA9IGNjKCdcIicpLFxuXHRTZW1pY29sb24gPSBjYygnOycpLFxuXHRTcGFjZSA9IGNjKCcgJyksXG5cdFRhYiA9IGNjKCdcXHQnKSxcblx0VGlsZGUgPSBjYygnficpXG5cbmZ1bmN0aW9uIHNob3dDaGFyKGNoYXIpIHtcblx0cmV0dXJuIGNvZGUoU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyKSlcbn1cblxuZnVuY3Rpb24gX2NoYXJQcmVkKGNoYXJzLCBuZWdhdGUpIHtcblx0bGV0IHNyYyA9ICdzd2l0Y2goY2gpIHtcXG4nXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0c3JjID0gYCR7c3JjfWNhc2UgJHtjaGFycy5jaGFyQ29kZUF0KGkpfTogYFxuXHRzcmMgPSBgJHtzcmN9IHJldHVybiAkeyFuZWdhdGV9XFxuZGVmYXVsdDogcmV0dXJuICR7bmVnYXRlfVxcbn1gXG5cdHJldHVybiBGdW5jdGlvbignY2gnLCBzcmMpXG59XG5cbmNvbnN0XG5cdGlzRGlnaXQgPSBfY2hhclByZWQoJzAxMjM0NTY3ODknKSxcblx0aXNEaWdpdEJpbmFyeSA9IF9jaGFyUHJlZCgnMDEnKSxcblx0aXNEaWdpdE9jdGFsID0gX2NoYXJQcmVkKCcwMTIzNDU2NycpLFxuXHRpc0RpZ2l0SGV4ID0gX2NoYXJQcmVkKCcwMTIzNDU2Nzg5YWJjZGVmJylcblxuLy8gQW55dGhpbmcgbm90IGV4cGxpY2l0bHkgcmVzZXJ2ZWQgaXMgYSB2YWxpZCBuYW1lIGNoYXJhY3Rlci5cbmNvbnN0IHJlc2VydmVkQ2hhcmFjdGVycyA9ICdgIyVeJlxcXFxcXCc7LCdcbmNvbnN0IGlzTmFtZUNoYXJhY3RlciA9IF9jaGFyUHJlZCgnKClbXXt9Ljp8IFxcblxcdFwiJyArIHJlc2VydmVkQ2hhcmFjdGVycywgdHJ1ZSlcbiJdfQ==