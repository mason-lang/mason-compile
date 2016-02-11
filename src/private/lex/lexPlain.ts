import Loc, {Pos} from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import {Funs} from '../ast/Fun'
import {check, fail, warn} from '../context'
import {GroupBlock, GroupBrace, GroupBracket, GroupLine, GroupParenthesis, GroupSpace, GroupType
	} from '../token/Group'
import {isKeyword, Kw} from '../token/Keyword'
import {DocComment} from '../token/Token'
import {assert, isEmpty, last} from '../util'
import {isDigitDecimal} from './chars'
import {addToCurrentGroup, closeGroup, closeGroupsForDedent, closeInterpolationOrParenthesis,
	closeLine, closeSpaceOKIfEmpty, curGroup, openGroup, openLine, space} from './groupContext'
import lexAfterPeriod from './lexAfterPeriod'
import lexIndent from './lexIndent'
import lexName from './lexName'
import lexNumber from './lexNumber'
import lexQuote from './lexQuote'
import {column, eat, eatRestOfLine, line, peek, pos, skipNewlines, skipRestOfLine, tryEat, tryEat2
	} from './sourceContext'
import {addKeywordFun, addKeywordPlain} from './util'

/*
Regular (non-specialized) lex function. Prepared for any token.
Other "lex*" functions are specialized to a particular type of token, e.g. a number.
Unless isInQuote, `lexPlain` will keep lexing until the end of the file,
while specialized lexers end when their token is complete.

@param isInQuote
	In the case of quote interpolation with parentheses (`"#(foo)"`)
	we'll recurse back into here with `isInQuote`. In that case,
	newlines are not allowed and the function ends when the interpolation group is closed.
*/
export default function lexPlain(isInQuote: boolean): void {
	// Current indentation level.
	// Measured in indents: 1 indent = 1 tab or n spaces where n is set in [[CompileOptions]].
	let indent = 0

	// This is where we started lexing the current token.
	let startColumn: number
	function startPos(): Pos {
		return new Pos(line, startColumn)
	}
	function loc(): Loc {
		return new Loc(startPos(), pos())
	}
	function kw(kind: Kw): void {
		addKeywordPlain(startPos(), kind)
	}
	function funKw(opts: {isDo?: boolean, isThisFun?: boolean, kind?: Funs}): void {
		addKeywordFun(startPos(), opts)
	}
	function handleName(): void {
		lexName(startPos(), false)
	}

	while (true) {
		startColumn = column
		const characterEaten = eat()
		// Generally, the type of a token is determined by the first character.
		switch (characterEaten) {
			case Char.Null:
				return

			case Char.Backtick: case Char.DoubleQuote:
				lexQuote(indent, characterEaten === Char.Backtick)
				break

			// GROUPS

			case Char.OpenParenthesis: case Char.OpenBracket: case Char.OpenBrace:
				const [ctr, close] = ((): [GroupType, Char] => {
					switch (characterEaten) {
						case Char.OpenParenthesis:
							return [GroupParenthesis, Char.CloseParenthesis]
						case Char.OpenBracket:
							return [GroupBracket, Char.CloseBracket]
						case Char.OpenBrace:
							return [GroupBrace, Char.CloseBrace]
						default:
							throw new Error(String(characterEaten))
					}
				})()
				// Handle empty group (like `()`) specially to avoid warnings about an empty GroupSpace inside.
				if (tryEat(close))
					addToCurrentGroup(new ctr(loc(), []))
				else {
					openGroup(startPos(), ctr)
					openGroup(pos(), GroupSpace)
				}
				break

			case Char.CloseParenthesis:
				if (closeInterpolationOrParenthesis(loc())) {
					assert(isInQuote)
					return
				}
				break

			case Char.CloseBracket: case Char.CloseBrace: {
				const ctr = characterEaten === Char.CloseBracket ? GroupBracket : GroupBrace
				closeGroup(startPos(), GroupSpace)
				closeGroup(pos(), ctr)
				break
			}

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
				indent = lexIndent()
				if (indent > oldIndent) {
					check(indent === oldIndent + 1, loc, _ => _.tooMuchIndent)
					const l = loc()
					// Block at end of line goes in its own spaced group.
					// However, `~` preceding a block goes in a group with it.
					if (isEmpty(curGroup.subTokens) ||
						!isKeyword(Kw.Lazy, last(curGroup.subTokens))) {
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
				if (tryEat(Char.Backslash))
					funKw({isDo: true})
				else
					handleName()
				break

			case Char.$:
				if (tryEat2(Char.ExclamationMark, Char.Backslash))
					funKw({isDo: true, kind: Funs.Async})
				else if (tryEat(Char.Backslash))
					funKw({kind: Funs.Async})
				else
					handleName()
				break

			case Char.Asterisk:
				if (tryEat2(Char.ExclamationMark, Char.Backslash))
					funKw({isDo: true, kind: Funs.Generator})
				else if (tryEat(Char.Backslash))
					funKw({kind: Funs.Generator})
				else
					handleName()
				break

			case Char.Backslash:
				funKw({})
				break

			case Char.Bar:
				const isDocComment = !tryEat(Char.Bar)
				if (!(tryEat(Char.Space) || tryEat(Char.Tab) || peek() === Char.LineFeed))
					warn(pos(), _ => _.commentNeedsSpace)
				if (isDocComment) {
					const text = eatRestOfLine()
					closeSpaceOKIfEmpty(startPos())
					check(
						curGroup instanceof GroupLine && curGroup.subTokens.length === 0,
						loc,
						_ => _.trailingDocComment)
					addToCurrentGroup(new DocComment(loc(), text))
				} else
					skipRestOfLine()
				break

			// NUMBER

			case Char.Hyphen:
				if (isDigitDecimal(peek()))
					// lexNumber() looks at prev character, so hyphen included.
					lexNumber(startPos())
				else
					handleName()
				break

			case Char._0: case Char._1: case Char._2: case Char._3: case Char._4:
			case Char._5: case Char._6: case Char._7: case Char._8: case Char._9:
				lexNumber(startPos())
				break

			// OTHER

			case Char.Period:
				lexAfterPeriod(startPos())
				break

			case Char.Colon:
				if (tryEat(Char.Equal))
					kw(Kw.AssignMutate)
				else
					kw(Kw.Colon)
				break

			case Char.SingleQuote:
				kw(Kw.Tick)
				break

			case Char.Tilde:
				kw(Kw.Lazy)
				break

			case Char.Ampersand:
				kw(Kw.Ampersand)
				break

			case Char.Backslash: case Char.Caret: case Char.CloseBrace: case Char.Comma:
			case Char.Hash: case Char.OpenBrace: case Char.Semicolon:
				throw fail(loc(), _ => _.reservedChar(characterEaten))

			default:
				handleName()
		}
	}
}
