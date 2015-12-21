import Loc from 'esast/lib/Loc'
import {check, warn} from '../context'
import {Group, GroupQuote, GroupRegExp, StringToken} from '../Token'
import {assert} from '../util'
import {Char, isDigit, isNameCharacter} from './chars'
import {addToCurrentGroup, closeGroup, curGroup, openGroup, openInterpolation} from './groupContext'
import lexName from './lexName'
import lexPlain from './lexPlain'
import {eat, peek, pos, skipNewlines, skipWhileEquals, stepBackMany, tryEat, tryEatNewline
	} from './sourceContext'

export default function lexQuote(indent: number, isRegExp: boolean): void {
	const quoteIndent = indent + 1

	// Indented quote is characterized by being immediately followed by a newline.
	// The next line *must* have some content at the next indentation.
	const isIndented = tryEatNewline()
	if (isIndented) {
		const actualIndent = skipWhileEquals(Char.Tab)
		check(actualIndent === quoteIndent, pos, _ => _.tooMuchIndentQuote)
	}

	// Current string literal part of quote we are reading.
	// This is a raw value. If source code has '\n' (2 characters), read has '\n' (2 characters).
	let read = ''
	function add(str: string): void {
		// I've tried pushing character codes to an array and stringifying them later,
		// but this turned out to be better.
		read = `${read}${str}`
	}
	function addChar(char: Char): void {
		add(String.fromCharCode(char))
	}

	function maybeOutputRead(): void {
		if (read !== '') {
			// loc isn't used, so just pass in null
			addToCurrentGroup(new StringToken(null, read))
			read = ''
		}
	}

	function locSingle(): Loc {
		return Loc.singleChar(pos())
	}

	const groupType = isRegExp ? GroupRegExp : GroupQuote

	openGroup(locSingle().start, groupType)

	eatChars: for (;;) {
		const char = eat()

		switch (char) {
			case Char.Backslash: {
				const next = eat()
				// \#, \`, and \" are special because they escape a mason special character,
				// while others are escape sequences.
				if (next === Char.Hash || next === (isRegExp ? Char.Backtick : Char.Quote))
					addChar(next)
				else
					add(`\\${String.fromCharCode(next)}`)
				break
			}
			case Char.Hash:
				maybeOutputRead()
				if (tryEat(Char.OpenParenthesis)) {
					const l = locSingle()
					openInterpolation(l)
					lexPlain(true)
					// Returning from lexPlain means that the interpolation was closed.
				} else {
					const startPos = pos()
					const firstChar = eat()
					check(isNameCharacter(firstChar), pos, _ => _.badInterpolation)
					lexName(startPos, true)
				}
				break
			// Don't need `case Char.Null:` because that's always preceded by a newline.
			case Char.Newline: {
				const originalPos = pos()
				// Go back to before we ate it.
				originalPos.column = originalPos.column - 1

				check(isIndented, pos, _ => _.unclosedQuote)
				// Allow extra blank lines.
				const numNewlines = skipNewlines()
				const newIndent = skipWhileEquals(Char.Tab)
				if (newIndent < quoteIndent) {
					// Indented quote section is over.
					// Undo reading the tabs and newline.
					stepBackMany(originalPos, numNewlines + newIndent)
					assert(peek() === Char.Newline)
					break eatChars
				} else
					add('\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent))
				break
			}
			case Char.Backtick:
				if (isRegExp)
					if (isIndented)
						addChar(char)
					else
						break eatChars
				else
					// Since these compile to template literals, have to remember to escape.
					add('\\\`')
				break
			case Char.Quote:
				if (!isRegExp && !isIndented)
					break eatChars
				else
					addChar(char)
				break
			default:
				addChar(char)
		}
	}

	maybeOutputRead()

	if (isRegExp)
		(<GroupRegExp> curGroup).flags = lexRegExpFlags()
	else
		warnForSimpleQuote(<GroupQuote> curGroup)

	closeGroup(pos(), groupType)
}

function warnForSimpleQuote(quoteGroup: GroupQuote): void {
	const tokens = quoteGroup.subTokens
	if (tokens.length === 1) {
		const name = tokens[0]
		if (name instanceof StringToken && isName(name.value))
			warn(pos(), _ => _.suggestSimpleQuote(name.value))
	}
}

function isName(str: string): boolean {
	const cc0 = str.charCodeAt(0)
	if (isDigit(cc0) || cc0 === Char.Tilde)
		return false
	for (let i = 0; i < str.length; i = i + 1)
		if (!isNameCharacter(str.charCodeAt(i)))
			return false
	return true
}

function lexRegExpFlags(): string {
	let flags = ''
	for (const ch of [Char.G, Char.I, Char.M, Char.Y])
		if (tryEat(ch))
			flags = flags + String.fromCharCode(ch)
	return flags
}
