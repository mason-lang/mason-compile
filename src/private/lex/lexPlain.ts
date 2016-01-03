import Loc, {Pos} from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import {check, fail, options, warn} from '../context'
import Group, {GroupBlock, GroupBracket, GroupLine, GroupParenthesis, GroupSpace} from '../token/Group'
import Keyword, {isKeyword, Keywords} from '../token/Keyword'
import {DocComment, NumberToken} from '../token/Token'
import {assert, isEmpty, last} from '../util'
import {isDigit, isDigitBinary, isDigitHex, isDigitOctal} from './chars'
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
		if (peek(-1) === Char._0) {
			const p = peek()
			switch (p) {
				case Char.B: case Char.O: case Char.X: {
					skip()
					const isDigitSpecial =
						p === Char.B ?
						isDigitBinary :
						p === Char.O ?
						isDigitOctal :
						isDigitHex
					skipWhile(isDigitSpecial)
					break
				}
				case Char.Period:
					if (isDigit(peek(1))) {
						skip()
						skipWhile(isDigit)
					}
					break
				default:
			}
		} else {
			skipWhile(isDigit)
			if (peek() === Char.Period && isDigit(peek(1))) {
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
			case Char.Backtick: case Char.DoubleQuote:
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
			case Char.LineFeed: {
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
				// We always eat tabs in the Char.LineFeed handler,
				// so this will only happen in the middle of a line.
				throw fail(loc(), _ => _.nonLeadingTab)

			// FUN

			case Char.ExclamationMark:
				if (tryEat(Char.Bar))
					funKeyword(Keywords.FunDo)
				else
					handleName()
				break
			case Char.$:
				if (tryEat2(Char.ExclamationMark, Char.Bar))
					funKeyword(Keywords.FunAsynDo)
				else if (tryEat(Char.Bar))
					funKeyword(Keywords.FunAsync)
				else
					handleName()
				break
			case Char.Asterisk:
				if (tryEat2(Char.ExclamationMark, Char.Bar))
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
			case Char._0: case Char._1: case Char._2: case Char._3: case Char._4:
			case Char._5: case Char._6: case Char._7: case Char._8: case Char._9:
				eatAndAddNumber()
				break


			// OTHER

			case Char.Period: {
				if (peek() === Char.Space || peek() === Char.LineFeed) {
					// Keywords.ObjEntry in its own spaced group.
					// We can't just create a new Group here because we want to
					// ensure it's not part of the preceding or following spaced group.
					closeSpaceOKIfEmpty(startPos())
					keyword(Keywords.ObjEntry)
				} else if (tryEat(Char.Bar))
					funKeyword(Keywords.FunThis)
				else if (tryEat2(Char.ExclamationMark, Char.Bar))
					funKeyword(Keywords.FunThisDo)
				else if (tryEat2(Char.Asterisk, Char.Bar))
					funKeyword(Keywords.FunThisGen)
				else if (tryEat3(Char.Asterisk, Char.ExclamationMark, Char.Bar))
					funKeyword(Keywords.FunThisGenDo)
				else if (tryEat(Char.Period))
					if (tryEat(Char.Period))
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

			case Char.SingleQuote:
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
