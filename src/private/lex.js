import Loc, { Pos, StartLine, StartPos, StartColumn, singleCharLoc } from 'esast/dist/Loc'
import { code } from '../CompileError'
import { NumberLiteral } from './MsAst'
import { DocComment, DotName, Group, G_Block, G_Bracket, G_Line, G_Parenthesis, G_Space, G_Quote,
	isKeyword, Keyword, KW_AssignMutable, KW_Ellipsis, KW_Focus, KW_Fun, KW_FunDo, KW_FunGen,
	KW_FunGenDo, KW_FunThis, KW_FunThisDo, KW_FunThisGen, KW_FunThisGenDo, KW_Lazy, KW_LocalMutate,
	KW_ObjAssign, KW_Region, KW_Todo, KW_Type, Name, opKeywordKindFromName, showGroupKind
	} from './Token'
import { assert, isEmpty, last } from './util'

/*
This produces the Token tree (see Token.js).
*/
export default (context, sourceString) => {
	/*
	Lexing algorithm requires trailing newline to close any blocks.
	Use a 0-terminated string because it's faster than checking whether index === length.
	(When string reaches end `charCodeAt` will return `NaN`, which can't be switched on.)
	*/
	sourceString = `${sourceString}\n\0`

	// --------------------------------------------------------------------------------------------
	// GROUPING
	// --------------------------------------------------------------------------------------------
	// We only ever write to the innermost Group;
	// when we close that Group we add it to the enclosing Group and continue with that one.
	// Note that `curGroup` is conceptually the top of the stack, but is not stored in `stack`.
	const groupStack = [ ]
	let curGroup
	const
		addToCurrentGroup = token => {
			curGroup.subTokens.push(token)
		},

		dropGroup = () => {
			curGroup = groupStack.pop()
		},

		// Pause writing to curGroup in favor of writing to a sub-group.
		// When the sub-group finishes we will pop the stack and resume writing to its parent.
		openGroup = (openPos, groupKind) => {
			groupStack.push(curGroup)
			// Contents will be added to by `addToCurrentGroup`.
			// curGroup.loc.end will be written to when closing it.
			curGroup = new Group(new Loc(openPos, null), [ ], groupKind)
		},

		maybeCloseGroup = (closePos, closeKind) => {
			if (curGroup.kind === closeKind)
				_closeGroup(closePos, closeKind)
		},

		closeGroup = (closePos, closeKind) => {
			context.check(closeKind === curGroup.kind, closePos, () =>
				`Trying to close ${showGroupKind(closeKind)}, ` +
				`but last opened ${showGroupKind(curGroup.kind)}`)
			_closeGroup(closePos, closeKind)
		},

		_closeGroup = (closePos, closeKind) => {
			let justClosed = curGroup
			dropGroup()
			justClosed.loc.end = closePos
			switch (closeKind) {
				case G_Space: {
					const size = justClosed.subTokens.length
					if (size !== 0)
						// Spaced should always have at least two elements.
						addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed)
					else
						context.warn(justClosed.loc, 'Unnecessary space.')
					break
				}
				case G_Line:
					// Line must have content.
					// This can happen if there was just a comment.
					if (!isEmpty(justClosed.subTokens))
						addToCurrentGroup(justClosed)
					break
				case G_Block:
					context.check(!isEmpty(justClosed.subTokens), closePos, 'Empty block.')
					addToCurrentGroup(justClosed)
					break
				default:
					addToCurrentGroup(justClosed)
			}
		},

		closeSpaceOKIfEmpty = pos => {
			assert(curGroup.kind === G_Space)
			if (curGroup.subTokens.length === 0)
				dropGroup()
			else
				_closeGroup(pos, G_Space)
		},

		openParenthesis = loc => {
			openGroup(loc.start, G_Parenthesis)
			openGroup(loc.end, G_Space)
		},

		closeParenthesis = loc => {
			_closeGroup(loc.start, G_Space)
			closeGroup(loc.end, G_Parenthesis)
		},

		closeGroupsForDedent = pos => {
			closeLine(pos)
			closeGroup(pos, G_Block)
			// It's OK to be missing a closing parenthesis if there's a block. E.g.:
			// a (b
			//	c | no closing paren here
			while (curGroup.kind === G_Parenthesis || curGroup.kind === G_Space)
				_closeGroup(pos, curGroup.kind)
		},

		// When starting a new line, a spaced group is created implicitly.
		openLine = pos => {
			openGroup(pos, G_Line)
			openGroup(pos, G_Space)
		},

		closeLine = pos => {
			if (curGroup.kind === G_Space)
				closeSpaceOKIfEmpty()
			closeGroup(pos, G_Line)
		},

		// When encountering a space, it both closes and opens a spaced group.
		space = loc => {
			maybeCloseGroup(loc.start, G_Space)
			openGroup(loc.end, G_Space)
		}

	// --------------------------------------------------------------------------------------------
	// ITERATING THROUGH SOURCESTRING
	// --------------------------------------------------------------------------------------------
	/*
	These are kept up-to-date as we iterate through sourceString.
	Every access to index has corresponding changes to line and/or column.
	This also explains why there are different functions for newlines vs other characters.
	*/
	let index = 0, line = StartLine, column = StartColumn

	/*
	NOTE: We use character *codes* for everything.
	Characters are of type Number and not just Strings of length one.
	*/
	const
		pos = () => new Pos(line, column),

		peek = () => sourceString.charCodeAt(index),
		peekNext = () => sourceString.charCodeAt(index + 1),
		peekPrev = () => sourceString.charCodeAt(index - 1),

		// May eat a Newline.
		// Caller *must* check for that case and increment line!
		eat = () => {
			const char = sourceString.charCodeAt(index)
			index = index + 1
			column = column + 1
			return char
		},
		skip = eat,

		// charToEat must not be Newline.
		tryEat = charToEat => {
			const canEat = peek() === charToEat
			if (canEat) {
				index = index + 1
				column = column + 1
			}
			return canEat
		},

		mustEat = (charToEat, precededBy) => {
			const canEat = tryEat(charToEat)
			context.check(canEat, pos, () =>
				`${code(precededBy)} must be followed by ${showChar(charToEat)}`)
		},

		tryEatNewline = () => {
			const canEat = peek() === Newline
			if (canEat) {
				index = index + 1
				line = line + 1
				column = StartColumn
			}
			return canEat
		},

		// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.
		stepBackMany = (oldPos, nCharsToBackUp) => {
			index = index - nCharsToBackUp
			line = oldPos.line
			column = oldPos.column
		},

		// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
		// characterPredicate must *not* accept Newline.
		// Otherwise there may be an infinite loop!
		takeWhile = characterPredicate =>
			_takeWhileWithStart(index, characterPredicate),
		takeWhileWithPrev = characterPredicate =>
			_takeWhileWithStart(index - 1, characterPredicate),
		_takeWhileWithStart = (startIndex, characterPredicate) => {
			skipWhile(characterPredicate)
			return sourceString.slice(startIndex, index)
		},

		skipWhileEquals = char =>
			skipWhile(_ => _ === char),

		skipRestOfLine = () =>
			skipWhile(_ => _ !== Newline),

		eatRestOfLine = () =>
			takeWhile(_ => _ !== Newline),

		skipWhile = characterPredicate => {
			const startIndex = index
			while (characterPredicate(peek()))
				index = index + 1
			const diff = index - startIndex
			column = column + diff
			return diff
		},

		// Called after seeing the first newline.
		// Returns # total newlines, including the first.
		skipNewlines = () => {
			const startLine = line
			line = line + 1
			while (peek() === Newline) {
				index = index + 1
				line = line + 1
			}
			column = StartColumn
			return line - startLine
		}

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
		let indent = 0

		// Make closures now rather than inside the loop.
		// This is significantly faster as of node v0.11.14.

		// This is where we started lexing the current token.
		let startColumn
		const
			startPos = () => new Pos(line, startColumn),
			loc = () => new Loc(startPos(), pos()),
			keyword = kind =>
				addToCurrentGroup(new Keyword(loc(), kind)),
			funKeyword = kind => {
				keyword(kind)
				// First arg in its own spaced group
				space(loc())
			},
			eatAndAddNumber = () => {
				const startIndex = index - 1

				tryEat(Hyphen)
				if (peekPrev() === N0) {
					const p = peek()
					switch (p) {
						case LetterB: case LetterO: case LetterX:
							skip()
							const isDigitSpecial =
								p === LetterB ?
								isDigitBinary :
								p === LetterO ?
								isDigitOctal :
								isDigitHex
							skipWhile(isDigitSpecial)
							break
						case Dot:
							if (isDigit(peekNext())) {
								skip()
								skipWhile(isDigit)
							}
							break
						default:
					}
				} else {
					skipWhile(isDigit)
					if (tryEat(Dot))
						skipWhile(isDigit)
				}

				const str = sourceString.slice(startIndex, index)
				addToCurrentGroup(new NumberLiteral(loc(), str))
			}

		const
			handleName = () => {
				context.check(isNameCharacter(peekPrev()), loc(), () =>
					`Reserved character ${showChar(peekPrev())}`)

				// All other characters should be handled in a case above.
				const name = takeWhileWithPrev(isNameCharacter)
				if (name.endsWith('_')) {
					if (name.length > 1)
						_handleName(name.slice(0, name.length - 1))
					keyword(KW_Focus)
				} else
					_handleName(name)
			},
			_handleName = name => {
				const keywordKind = opKeywordKindFromName(name)
				if (keywordKind !== undefined) {
					context.check(keywordKind !== -1, pos, () =>
						`Reserved name ${code(name)}`)
					if (keywordKind === KW_Region) {
						// TODO: Eat and put it in Region expression
						skipRestOfLine()
						keyword(KW_Region)
					} else if (keywordKind === KW_Todo)
						skipRestOfLine()
					else
						keyword(keywordKind)
				} else
					addToCurrentGroup(new Name(loc(), name))
			}

		while (true) {
			startColumn = column
			const characterEaten = eat()
			// Generally, the type of a token is determined by the first character.
			switch (characterEaten) {
				case NullChar:
					return
				case CloseBrace:
					context.check(isInQuote, loc, () =>
						`Reserved character ${showChar(CloseBrace)}`)
					return
				case Quote:
					lexQuote(indent)
					break

				// GROUPS

				case OpenParenthesis:
					if (tryEat(CloseParenthesis))
						addToCurrentGroup(new Group(loc(), [ ], G_Parenthesis))
					else
						openParenthesis(loc())
					break
				case OpenBracket:
					if (tryEat(CloseBracket))
						addToCurrentGroup(new Group(loc(), [ ], G_Bracket))
					else {
						openGroup(startPos(), G_Bracket)
						openGroup(pos(), G_Space)
					}
					break
				case CloseParenthesis:
					closeParenthesis(loc())
					break
				case CloseBracket:
					_closeGroup(startPos(), G_Space)
					closeGroup(pos(), G_Bracket)
					break
				case Space:
					space(loc())
					break
				case Newline: {
					context.check(!isInQuote, loc, 'Quote interpolation cannot contain newline')

					// Skip any blank lines.
					skipNewlines()
					const oldIndent = indent
					indent = skipWhileEquals(Tab)
					context.check(peek() !== Space, pos, 'Line begins in a space')
					context.warnIf(peekPrev() === Space, 'Line ends in a space.')
					if (indent > oldIndent) {
						context.check(indent === oldIndent + 1, loc,
							'Line is indented more than once')
						const l = loc()
						// Block at end of line goes in its own spaced group.
						// However, `~` preceding a block goes in a group with it.
						if (isEmpty(curGroup.subTokens) ||
							!isKeyword(KW_Lazy, last(curGroup.subTokens))) {
							if (curGroup.kind === G_Space)
								closeSpaceOKIfEmpty(l.start)
							openGroup(l.end, G_Space)
						}
						openGroup(l.start, G_Block)
						openLine(l.end)
					} else {
						const l = loc()
						for (let i = indent; i < oldIndent; i = i + 1)
							closeGroupsForDedent(l.start)
						closeLine(l.start)
						openLine(l.end)
					}
					break
				}
				case Tab:
					// We always eat tabs in the Newline handler,
					// so this will only happen in the middle of a line.
					context.fail(loc(), 'Tab may only be used to indent')

				// FUN

				case Bang:
					if (tryEat(Bar))
						funKeyword(KW_FunDo)
					else
						handleName()
					break
				case Tilde:
					if (tryEat(Bang)) {
						mustEat(Bar, '~!')
						funKeyword(KW_FunGenDo)
					} else if (tryEat(Bar))
						funKeyword(KW_FunGen)
					else
						keyword(KW_Lazy)
					break
				case Bar:
					if (tryEat(Space) || tryEat(Tab)) {
						const text = eatRestOfLine()
						closeSpaceOKIfEmpty(startPos())
						context.check(
							curGroup.kind === G_Line && curGroup.subTokens.length === 0, loc, () =>
							`Doc comment must go on its own line. (Did you mean ${code('||')}?)`)
						addToCurrentGroup(new DocComment(loc(), text))
					} else if (tryEat(Bar))
						// non-doc comment
						skipRestOfLine()
					else
						funKeyword(KW_Fun)
					break

				// NUMBER

				case Hyphen:
					if (isDigit(peek()))
						// eatAndAddNumber() looks at prev character, so hyphen included.
						eatAndAddNumber()
					else
						handleName()
					break
				case N0: case N1: case N2: case N3: case N4:
				case N5: case N6: case N7: case N8: case N9:
					eatAndAddNumber()
					break


				// OTHER

				case Dot: {
					const next = peek()
					if (next === Space || next === Newline) {
						// ObjLit assign in its own spaced group.
						// We can't just create a new Group here because we want to
						// ensure it's not part of the preceding or following spaced group.
						closeSpaceOKIfEmpty(startPos())
						keyword(KW_ObjAssign)
					} else if (next === Bar) {
						skip()
						keyword(KW_FunThis)
						space(loc())
					} else if (next === Bang && peekNext() === Bar) {
						skip()
						skip()
						keyword(KW_FunThisDo)
						space(loc())
					} else if (next === Tilde) {
						skip()
						if (tryEat(Bang)) {
							mustEat(Bar, '.~!')
							keyword(KW_FunThisGenDo)
						} else {
							mustEat(Bar, '.~')
							keyword(KW_FunThisGen)
						}
						space(loc())
					} else {
						// +1 for the dot we just ate.
						const nDots = skipWhileEquals(Dot) + 1
						const next = peek()
						if (nDots === 3 && next === Space || next === Newline)
							keyword(KW_Ellipsis)
						else {
							context.check(!isDigit(next), loc(), 'Can not have digit here.')
							let name = takeWhile(isNameCharacter)
							const add = () => addToCurrentGroup(new DotName(loc(), nDots, name))
							if (name.endsWith('_')) {
								name = name.slice(0, name.length - 1)
								add()
								keyword(KW_Focus)
							} else
								add()
						}
					}
					break
				}

				case Colon:
					if (tryEat(Colon)) {
						mustEat(Equal, '::')
						keyword(KW_AssignMutable)
					} else if (tryEat(Equal))
						keyword(KW_LocalMutate)
					else
						keyword(KW_Type)
					break

				case Ampersand: case Backslash: case Backtick: case Caret:
				case Comma: case Percent: case Semicolon:
					context.fail(loc, `Reserved character ${showChar(characterEaten)}`)
				default:
					handleName()
			}
		}
	}

	const lexQuote = indent => {
		const quoteIndent = indent + 1

		// Indented quote is characterized by being immediately followed by a newline.
		// The next line *must* have some content at the next indentation.
		const isIndented = tryEatNewline()
		if (isIndented) {
			const actualIndent = skipWhileEquals(Tab)
			context.check(actualIndent === quoteIndent, pos,
				'Indented quote must have exactly one more indent than previous line.')
		}

		// Current string literal part of quote we are reading.
		// This is a raw value.
		let read = ''

		const maybeOutputRead = () => {
			if (read !== '') {
				addToCurrentGroup(read)
				read = ''
			}
		}

		const locSingle = () => singleCharLoc(pos())

		openGroup(locSingle().start, G_Quote)

		eatChars: while (true) {
			const char = eat()
			switch (char) {
				case Backslash: {
					const next = eat()
					read = read + `\\${String.fromCharCode(next)}`
					break
				}
				// Since these compile to template literals, have to remember to escape.
				case Backtick:
					read = read + '\\`'
					break
				case OpenBrace: {
					maybeOutputRead()
					const l = locSingle()
					openParenthesis(l)
					lexPlain(true)
					closeParenthesis(l)
					break
				}
				// Don't need `case NullChar:` because that's always preceded by a newline.
				case Newline: {
					const originalPos = pos()
					// Go back to before we ate it.
					originalPos.column = originalPos.column - 1

					context.check(isIndented, locSingle, 'Unclosed quote.')
					// Allow extra blank lines.
					const numNewlines = skipNewlines()
					const newIndent = skipWhileEquals(Tab)
					if (newIndent < quoteIndent) {
						// Indented quote section is over.
						// Undo reading the tabs and newline.
						stepBackMany(originalPos, numNewlines + newIndent)
						assert(peek() === Newline)
						break eatChars
					} else
						read = read +
							'\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent)
					break
				}
				case Quote:
					if (!isIndented)
						break eatChars
					// Else fallthrough
				default:
					// I've tried pushing character codes to an array and stringifying them later,
					// but this turned out to be better.
					read = read + String.fromCharCode(char)
			}
		}

		maybeOutputRead()
		closeGroup(pos(), G_Quote)
	}

	curGroup = new Group(new Loc(StartPos, null), [ ], G_Block)
	openLine(StartPos)

	lexPlain(false)

	const endPos = pos()
	closeLine(endPos)
	assert(isEmpty(groupStack))
	curGroup.loc.end = endPos
	return curGroup
}

const cc = _ => _.charCodeAt(0)
const
	Ampersand = cc('&'),
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
	Tilde = cc('~')

const
	showChar = char => code(String.fromCharCode(char)),
	_charPred = (chars, negate) => {
		let src = 'switch(ch) {\n'
		for (let i = 0; i < chars.length; i = i + 1)
			src = `${src}case ${chars.charCodeAt(i)}: `
		src = `${src} return ${!negate}\ndefault: return ${negate}\n}`
		return Function('ch', src)
	},
	isDigit = _charPred('0123456789'),
	isDigitBinary = _charPred('01'),
	isDigitOctal = _charPred('01234567'),
	isDigitHex = _charPred('0123456789abcdef'),

	// Anything not explicitly reserved is a valid name character.
	reservedCharacters = '`#%^&\\\';,',
	isNameCharacter = _charPred('()[]{}.:| \n\t"' + reservedCharacters, true)

