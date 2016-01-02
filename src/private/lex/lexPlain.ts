import Loc, {Pos} from 'esast/lib/Loc'
import {check, fail, options, warn} from '../context'
import {DocComment, Group, GroupBlock, GroupBracket, GroupLine, GroupParenthesis, GroupSpace, isKeyword, Keyword, Keywords, NumberToken} from '../Token'
import {assert, isEmpty, last} from '../util'
import {Char, isDigit, isDigitBinary, isDigitHex, isDigitOctal} from './chars'
import {addToCurrentGroup, closeGroup, closeGroupsForDedent, closeInterpolationOrParenthesis,
	closeLine, closeSpaceOKIfEmpty, curGroup, openGroup, openLine, openParenthesis, space
	} from './groupContext'
import lexName from './lexName'
import lexQuote from './lexQuote'
import {column, eat, eatRestOfLine, index, line, peek, pos, sourceString, skip, skipNewlines,
	skipRestOfLine, skipWhile, skipWhileEquals, tryEat, tryEat2, tryEat3} from './sourceContext'

/*
In the case of quote interpolation ("a{b}c") we'll recurse back into here.
When isInQuote is true, we will not allow newlines.
*/
export default function lexPlain(isInQuote: boolean): void {
	// This tells us which indented block we're in.
	// Incrementing it means issuing a GP_OpenBlock and decrementing it means a GP_CloseBlock.
	// Does nothing if isInQuote.
	let indent = 0

	// This is where we started lexing the current token.
	let startColumn: number
	function startPos(): Pos {
		return new Pos(line, startColumn)
	}
	function loc(): Loc {
		return new Loc(startPos(), pos())
	}
	function keyword(kind: Keywords): void {
		addToCurrentGroup(new Keyword(loc(), kind))
	}
	function funKeyword(kind: Keywords): void {
		keyword(kind)
		// First arg in its own spaced group
		space(loc())
	}
	function eatAndAddNumber(): void {
		const startIndex = index - 1

		tryEat(Char.Hyphen)
		if (peek(-1) === Char.N0) {
			const p = peek()
			switch (p) {
				case Char.LetterB: case Char.LetterO: case Char.LetterX: {
					skip()
					const isDigitSpecial =
						p === Char.LetterB ?
						isDigitBinary :
						p === Char.LetterO ?
						isDigitOctal :
						isDigitHex
					skipWhile(isDigitSpecial)
					break
				}
				case Char.Dot:
					if (isDigit(peek(1))) {
						skip()
						skipWhile(isDigit)
					}
					break
				default:
			}
		} else {
			skipWhile(isDigit)
			if (peek() === Char.Dot && isDigit(peek(1))) {
				skip()
				skipWhile(isDigit)
			}
		}

		const str = sourceString.slice(startIndex, index)
		addToCurrentGroup(new NumberToken(loc(), str))
	}
	function eatIndent(): number {
		const optIndent = options.indent
		if (typeof optIndent === 'number') {
			const spaces = skipWhileEquals(Char.Space)
			check(spaces % optIndent === 0, pos, _ => _.badSpacedIndent(optIndent))
			return spaces / optIndent
		} else {
			const indent = skipWhileEquals(Char.Tab)
			check(peek() !== Char.Space, pos, _ => _.noLeadingSpace)
			return indent
		}
	}
	function handleName(): void {
		lexName(startPos(), false)
	}

	loop: for (;;) {
		startColumn = column
		const characterEaten = eat()
		// Generally, the type of a token is determined by the first character.
		switch (characterEaten) {
			case Char.Null:
				break loop
			case Char.Backtick: case Char.Quote:
				lexQuote(indent, characterEaten === Char.Backtick)
				break

			// GROUPS

			case Char.OpenParenthesis:
				// Handle `()` specially to avoid warnings about an empty spaced group inside.
				if (tryEat(Char.CloseParenthesis))
					addToCurrentGroup(new GroupParenthesis(loc(), []))
				else
					openParenthesis(loc())
				break
			case Char.OpenBracket:
				if (tryEat(Char.CloseBracket))
					addToCurrentGroup(new GroupBracket(loc(), []))
				else {
					openGroup(startPos(), GroupBracket)
					openGroup(pos(), GroupSpace)
				}
				break
			case Char.CloseParenthesis:
				if (closeInterpolationOrParenthesis(loc())) {
					assert(isInQuote)
					break loop
				}
				break
			case Char.CloseBracket:
				closeGroup(startPos(), GroupSpace)
				closeGroup(pos(), GroupBracket)
				break
			case Char.Space:
				space(loc())
				break
			case Char.Newline: {
				check(!isInQuote, loc, _ => _.noNewlineInInterpolation)
				if (peek(-2) === Char.Space)
					warn(pos(), _ => _.trailingSpace)

				// Skip any blank lines.
				skipNewlines()
				const oldIndent = indent
				indent = eatIndent()
				if (indent > oldIndent) {
					check(indent === oldIndent + 1, loc, _ => _.tooMuchIndent)
					const l = loc()
					// Block at end of line goes in its own spaced group.
					// However, `~` preceding a block goes in a group with it.
					if (isEmpty(curGroup.subTokens) ||
						!isKeyword(Keywords.Lazy, last(curGroup.subTokens))) {
						if (curGroup instanceof GroupSpace)
							closeSpaceOKIfEmpty(l.start)
						openGroup(l.end, GroupSpace)
					}
					openGroup(l.start, GroupBlock)
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
			case Char.Tab:
				// We always eat tabs in the Newline handler,
				// so this will only happen in the middle of a line.
				throw fail(loc(), _ => _.nonLeadingTab)

			// FUN

			case Char.Bang:
				if (tryEat(Char.Bar))
					funKeyword(Keywords.FunDo)
				else
					handleName()
				break
			case Char.Cash:
				if (tryEat2(Char.Bang, Char.Bar))
					funKeyword(Keywords.FunAsynDo)
				else if (tryEat(Char.Bar))
					funKeyword(Keywords.FunAsync)
				else
					handleName()
				break
			case Char.Star:
				if (tryEat2(Char.Bang, Char.Bar))
					funKeyword(Keywords.FunGenDo)
				else if (tryEat(Char.Bar))
					funKeyword(Keywords.FunGen)
				else
					handleName()
				break
			case Char.Bar:
				if (tryEat(Char.Space) || tryEat(Char.Tab)) {
					const text = eatRestOfLine()
					closeSpaceOKIfEmpty(startPos())
					check(curGroup instanceof GroupLine && curGroup.subTokens.length === 0, loc, _ => _.trailingDocComment)
					addToCurrentGroup(new DocComment(loc(), text))
				} else if (tryEat(Char.Bar))
					// non-doc comment
					skipRestOfLine()
				else
					funKeyword(Keywords.Fun)
				break

			// NUMBER

			case Char.Hyphen:
				if (isDigit(peek()))
					// eatAndAddNumber() looks at prev character, so hyphen included.
					eatAndAddNumber()
				else
					handleName()
				break
			case Char.N0: case Char.N1: case Char.N2: case Char.N3: case Char.N4:
			case Char.N5: case Char.N6: case Char.N7: case Char.N8: case Char.N9:
				eatAndAddNumber()
				break


			// OTHER

			case Char.Dot: {
				if (peek() === Char.Space || peek() === Char.Newline) {
					// Keywords.ObjEntry in its own spaced group.
					// We can't just create a new Group here because we want to
					// ensure it's not part of the preceding or following spaced group.
					closeSpaceOKIfEmpty(startPos())
					keyword(Keywords.ObjEntry)
				} else if (tryEat(Char.Bar))
					funKeyword(Keywords.FunThis)
				else if (tryEat2(Char.Bang, Char.Bar))
					funKeyword(Keywords.FunThisDo)
				else if (tryEat2(Char.Star, Char.Bar))
					funKeyword(Keywords.FunThisGen)
				else if (tryEat3(Char.Star, Char.Bang, Char.Bar))
					funKeyword(Keywords.FunThisGenDo)
				else if (tryEat(Char.Dot))
					if (tryEat(Char.Dot))
						keyword(Keywords.Dot3)
					else
						keyword(Keywords.Dot2)
				else
					keyword(Keywords.Dot)
				break
			}

			case Char.Colon:
				if (tryEat(Char.Equal))
					keyword(Keywords.LocalMutate)
				else
					keyword(Keywords.Colon)
				break

			case Char.Tick:
				keyword(Keywords.Tick)
				break

			case Char.Tilde:
				keyword(Keywords.Lazy)
				break

			case Char.Ampersand:
				keyword(Keywords.Ampersand)
				break

			case Char.Backslash: case Char.Caret: case Char.CloseBrace: case Char.Comma:
			case Char.Hash: case Char.OpenBrace: case Char.Percent: case Char.Semicolon:
				throw fail(loc(), _ => _.reservedChar(characterEaten))

			default:
				handleName()
		}
	}
}
