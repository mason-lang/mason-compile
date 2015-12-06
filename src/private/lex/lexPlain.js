import Loc, {Pos} from 'esast/dist/Loc'
import {check, fail, options, warn} from '../context'
import {NumberLiteral} from '../MsAst'
import {DocComment, Group, Groups, isKeyword, Keyword, Keywords} from '../Token'
import {assert, isEmpty, last} from '../util'
import {Chars, isDigit, isDigitBinary, isDigitHex, isDigitOctal} from './chars'
import {addToCurrentGroup, closeGroup, closeGroupsForDedent, closeInterpolationOrParenthesis,
	closeLine, closeSpaceOKIfEmpty, curGroup, openGroup, openLine, openParenthesis, space
	} from './groupContext'
import {lexQuote} from './lex*'
import lexName from './lexName'
import {column, eat, eatRestOfLine, index, line, peek, pos, sourceString, skip, skipNewlines,
	skipRestOfLine, skipWhile, skipWhileEquals, tryEat, tryEat2, tryEat3} from './sourceContext'

/*
In the case of quote interpolation ("a{b}c") we'll recurse back into here.
When isInQuote is true, we will not allow newlines.
*/
export default function lexPlain(isInQuote) {
	// This tells us which indented block we're in.
	// Incrementing it means issuing a GP_OpenBlock and decrementing it means a GP_CloseBlock.
	// Does nothing if isInQuote.
	let indent = 0

	// This is where we started lexing the current token.
	let startColumn
	function startPos() {
		return new Pos(line, startColumn)
	}
	function loc() {
		return new Loc(startPos(), pos())
	}
	function keyword(kind) {
		addToCurrentGroup(new Keyword(loc(), kind))
	}
	function funKeyword(kind) {
		keyword(kind)
		// First arg in its own spaced group
		space(loc())
	}
	function eatAndAddNumber() {
		const startIndex = index - 1

		tryEat(Chars.Hyphen)
		if (peek(-1) === Chars.N0) {
			const p = peek()
			switch (p) {
				case Chars.LetterB: case Chars.LetterO: case Chars.LetterX: {
					skip()
					const isDigitSpecial =
						p === Chars.LetterB ?
						isDigitBinary :
						p === Chars.LetterO ?
						isDigitOctal :
						isDigitHex
					skipWhile(isDigitSpecial)
					break
				}
				case Chars.Dot:
					if (isDigit(peek(1))) {
						skip()
						skipWhile(isDigit)
					}
					break
				default:
			}
		} else {
			skipWhile(isDigit)
			if (peek() === Chars.Dot && isDigit(peek(1))) {
				skip()
				skipWhile(isDigit)
			}
		}

		const str = sourceString.slice(startIndex, index)
		addToCurrentGroup(new NumberLiteral(loc(), str))
	}
	function eatIndent() {
		const optIndent = options.indent()
		if (optIndent === '\t') {
			const indent = skipWhileEquals(Chars.Tab)
			check(peek() !== Chars.Space, pos, 'leadingSpace')
			return indent
		} else {
			const spaces = skipWhileEquals(Chars.Space)
			check(spaces % optIndent === 0, pos, 'badSpacedIndent', optIndent)
			return spaces / optIndent
		}
	}
	function handleName() {
		lexName(startPos(), false)
	}

	loop: for (;;) {
		startColumn = column
		const characterEaten = eat()
		// Generally, the type of a token is determined by the first character.
		switch (characterEaten) {
			case Chars.Null:
				break loop
			case Chars.Backtick: case Chars.Quote:
				lexQuote(indent, characterEaten === Chars.Backtick)
				break

			// GROUPS

			case Chars.OpenParenthesis:
				// Handle `()` specially to avoid warnings about an empty spaced group inside.
				if (tryEat(Chars.CloseParenthesis))
					addToCurrentGroup(new Group(loc(), [], Groups.Parenthesis))
				else
					openParenthesis(loc())
				break
			case Chars.OpenBracket:
				if (tryEat(Chars.CloseBracket))
					addToCurrentGroup(new Group(loc(), [], Groups.Bracket))
				else {
					openGroup(startPos(), Groups.Bracket)
					openGroup(pos(), Groups.Space)
				}
				break
			case Chars.CloseParenthesis:
				if (closeInterpolationOrParenthesis(loc())) {
					assert(isInQuote)
					break loop
				}
				break
			case Chars.CloseBracket:
				closeGroup(startPos(), Groups.Space)
				closeGroup(pos(), Groups.Bracket)
				break
			case Chars.Space:
				space(loc())
				break
			case Chars.Newline: {
				check(!isInQuote, loc, 'noNewlineInInterpolation')
				if (peek(-2) === Chars.Space)
					warn(pos, 'trailingSpace')

				// Skip any blank lines.
				skipNewlines()
				const oldIndent = indent
				indent = eatIndent()
				if (indent > oldIndent) {
					check(indent === oldIndent + 1, loc, 'tooMuchIndent')
					const l = loc()
					// Block at end of line goes in its own spaced group.
					// However, `~` preceding a block goes in a group with it.
					if (isEmpty(curGroup.subTokens) ||
						!isKeyword(Keywords.Lazy, last(curGroup.subTokens))) {
						if (curGroup.kind === Groups.Space)
							closeSpaceOKIfEmpty(l.start)
						openGroup(l.end, Groups.Space)
					}
					openGroup(l.start, Groups.Block)
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
			case Chars.Tab:
				// We always eat tabs in the Newline handler,
				// so this will only happen in the middle of a line.
				fail(loc(), 'nonLeadingTab')
				break

			// FUN

			case Chars.Bang:
				if (tryEat(Chars.Bar))
					funKeyword(Keywords.FunDo)
				else
					handleName()
				break
			case Chars.Cash:
				if (tryEat2(Chars.Bang, Chars.Bar))
					funKeyword(Keywords.FunAsyncDo)
				else if (tryEat(Chars.Bar))
					funKeyword(Keywords.FunAsync)
				else
					handleName()
				break
			case Chars.Star:
				if (tryEat2(Chars.Bang, Chars.Bar))
					funKeyword(Keywords.FunGenDo)
				else if (tryEat(Chars.Bar))
					funKeyword(Keywords.FunGen)
				else
					handleName()
				break
			case Chars.Bar:
				if (tryEat(Chars.Space) || tryEat(Chars.Tab)) {
					const text = eatRestOfLine()
					closeSpaceOKIfEmpty(startPos())
					if (!(curGroup.kind === Groups.Line && curGroup.subTokens.length === 0))
						fail(loc, 'trailingDocComment')
					addToCurrentGroup(new DocComment(loc(), text))
				} else if (tryEat(Chars.Bar))
					// non-doc comment
					skipRestOfLine()
				else
					funKeyword(Keywords.Fun)
				break

			// NUMBER

			case Chars.Hyphen:
				if (isDigit(peek()))
					// eatAndAddNumber() looks at prev character, so hyphen included.
					eatAndAddNumber()
				else
					handleName()
				break
			case Chars.N0: case Chars.N1: case Chars.N2: case Chars.N3: case Chars.N4:
			case Chars.N5: case Chars.N6: case Chars.N7: case Chars.N8: case Chars.N9:
				eatAndAddNumber()
				break


			// OTHER

			case Chars.Dot: {
				if (peek() === Chars.Space || peek() === Chars.Newline) {
					// Keywords.ObjEntry in its own spaced group.
					// We can't just create a new Group here because we want to
					// ensure it's not part of the preceding or following spaced group.
					closeSpaceOKIfEmpty(startPos())
					keyword(Keywords.ObjEntry)
				} else if (tryEat(Chars.Bar))
					funKeyword(Keywords.FunThis)
				else if (tryEat2(Chars.Bang, Chars.Bar))
					funKeyword(Keywords.FunThisDo)
				else if (tryEat2(Chars.Star, Chars.Bar))
					funKeyword(Keywords.FunThisGen)
				else if (tryEat3(Chars.Star, Chars.Bang, Chars.Bar))
					funKeyword(Keywords.FunThisGenDo)
				else if (tryEat(Chars.Dot))
					if (tryEat(Chars.Dot))
						keyword(Keywords.Dot3)
					else
						keyword(Keywords.Dot2)
				else
					keyword(Keywords.Dot)
				break
			}

			case Chars.Colon:
				if (tryEat(Chars.Equal))
					keyword(Keywords.LocalMutate)
				else
					keyword(Keywords.Colon)
				break

			case Chars.Tick:
				keyword(Keywords.Tick)
				break

			case Chars.Tilde:
				keyword(Keywords.Lazy)
				break

			case Chars.Ampersand:
				keyword(Keywords.Ampersand)
				break

			case Chars.Backslash: case Chars.Caret: case Chars.CloseBrace: case Chars.Comma:
			case Chars.Hash: case Chars.OpenBrace: case Chars.Percent: case Chars.Semicolon:
				fail(loc(), 'reservedChar', characterEaten)
				break

			default:
				handleName()
		}
	}
}
