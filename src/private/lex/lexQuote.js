import {singleCharLoc} from 'esast/dist/Loc'
import {check, warn} from '../context'
import {Groups} from '../Token'
import {assert} from '../util'
import {Chars, isDigit, isNameCharacter} from './chars'
import {addToCurrentGroup, closeGroup, curGroup, openGroup, openInterpolation} from './groupContext'
import lexName from './lexName'
import lexPlain from './lexPlain'
import {eat, peek, pos, skipNewlines, skipWhileEquals, stepBackMany, tryEat, tryEatNewline
	} from './sourceContext'

export default function lexQuote(indent, isRegExp) {
	const quoteIndent = indent + 1

	// Indented quote is characterized by being immediately followed by a newline.
	// The next line *must* have some content at the next indentation.
	const isIndented = tryEatNewline()
	if (isIndented) {
		const actualIndent = skipWhileEquals(Chars.Tab)
		check(actualIndent === quoteIndent, pos, 'tooMuchIndentQuote')
	}

	// Current string literal part of quote we are reading.
	// This is a raw value. If source code has '\n' (2 characters), read has '\n' (2 characters).
	let read = ''
	function add(str) {
		// I've tried pushing character codes to an array and stringifying them later,
		// but this turned out to be better.
		read = `${read}${str}`
	}
	function addChar(char) {
		add(String.fromCharCode(char))
	}

	function maybeOutputRead() {
		if (read !== '') {
			addToCurrentGroup(read)
			read = ''
		}
	}

	function locSingle() {
		return singleCharLoc(pos())
	}

	const groupKind = isRegExp ? Groups.RegExp : Groups.Quote

	openGroup(locSingle().start, groupKind)

	eatChars: for (;;) {
		const char = eat()

		switch (char) {
			case Chars.Backslash: {
				const next = eat()
				// \#, \`, and \" are special because they escape a mason special character,
				// while others are escape sequences.
				if (next === Chars.Hash || next === (isRegExp ? Chars.Backtick : Chars.Quote))
					addChar(next)
				else
					add(`\\${String.fromCharCode(next)}`)
				break
			}
			case Chars.Hash:
				maybeOutputRead()
				if (tryEat(Chars.OpenParenthesis)) {
					const l = locSingle()
					openInterpolation(l)
					lexPlain(true)
					// Returning from lexPlain means that the interpolation was closed.
				} else {
					const startPos = pos()
					const firstChar = eat()
					check(isNameCharacter(firstChar), pos, 'badInterpolation')
					lexName(startPos, true)
				}
				break
			// Don't need `case Chars.Null:` because that's always preceded by a newline.
			case Chars.Newline: {
				const originalPos = pos()
				// Go back to before we ate it.
				originalPos.column = originalPos.column - 1

				check(isIndented, pos, 'unclosedQuote')
				// Allow extra blank lines.
				const numNewlines = skipNewlines()
				const newIndent = skipWhileEquals(Chars.Tab)
				if (newIndent < quoteIndent) {
					// Indented quote section is over.
					// Undo reading the tabs and newline.
					stepBackMany(originalPos, numNewlines + newIndent)
					assert(peek() === Chars.Newline)
					break eatChars
				} else
					add('\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent))
				break
			}
			case Chars.Backtick:
				if (isRegExp)
					if (isIndented)
						addChar(char)
					else
						break eatChars
				else
					// Since these compile to template literals, have to remember to escape.
					add('\\\`')
				break
			case Chars.Quote:
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
		curGroup.flags = lexRegExpFlags()
	else
		warnForSimpleQuote(curGroup)

	closeGroup(pos(), groupKind)
}

function warnForSimpleQuote(quoteGroup) {
	const tokens = quoteGroup.subTokens
	if (tokens.length === 1) {
		const name = tokens[0]
		if (typeof name === 'string' && isName(name))
			warn(pos(), 'suggestSimpleQuote', name)
	}
}

function isName(str) {
	const cc0 = str.charCodeAt(0)
	if (isDigit(cc0) || cc0 === Chars.Tilde)
		return false
	for (let i = 0; i < str.length; i = i + 1)
		if (!isNameCharacter(str.charCodeAt(i)))
			return false
	return true
}

function lexRegExpFlags() {
	let flags = ''
	for (const ch of [Chars.G, Chars.I, Chars.M, Chars.Y])
		if (tryEat(ch))
			flags = flags + String.fromCharCode(ch)
	return flags
}
