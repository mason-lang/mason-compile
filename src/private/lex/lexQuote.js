import {singleCharLoc} from 'esast/dist/Loc'
import {code} from '../../CompileError'
import {check, warn} from '../context'
import {Groups} from '../Token'
import {assert} from '../util'
import {Chars, isDigit, isNameCharacter} from './chars'
import {addToCurrentGroup, closeGroup, closeParenthesis, curGroup, openGroup, openParenthesis
	} from './groupContext'
import lexPlain from './lexPlain'
import {eat, peek, pos, skipNewlines, skipWhileEquals, stepBackMany, tryEatNewline
	} from './sourceContext'

export default function lexQuote(indent) {
	const quoteIndent = indent + 1

	// Indented quote is characterized by being immediately followed by a newline.
	// The next line *must* have some content at the next indentation.
	const isIndented = tryEatNewline()
	if (isIndented) {
		const actualIndent = skipWhileEquals(Chars.Tab)
		check(actualIndent === quoteIndent, pos,
			'Indented quote must have exactly one more indent than previous line.')
	}

	// Current string literal part of quote we are reading.
	// This is a raw value.
	let read = ''

	function maybeOutputRead() {
		if (read !== '') {
			addToCurrentGroup(read)
			read = ''
		}
	}

	function locSingle() {
		return singleCharLoc(pos())
	}

	openGroup(locSingle().start, Groups.Quote)

	eatChars: while (true) {
		const char = eat()
		switch (char) {
			case Chars.Backslash: {
				const next = eat()
				read = read + `\\${String.fromCharCode(next)}`
				break
			}
			// Since these compile to template literals, have to remember to escape.
			case Chars.Backtick:
				read = read + '\\`'
				break
			case Chars.OpenBrace: {
				maybeOutputRead()
				const l = locSingle()
				openParenthesis(l)
				lexPlain(true)
				closeParenthesis(l)
				break
			}
			// Don't need `case Chars.Null:` because that's always preceded by a newline.
			case Chars.Newline: {
				const originalPos = pos()
				// Go back to before we ate it.
				originalPos.column = originalPos.column - 1

				check(isIndented, locSingle, 'Unclosed quote.')
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
					read = read +
						'\n'.repeat(numNewlines) + '\t'.repeat(newIndent - quoteIndent)
				break
			}
			case Chars.Quote:
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
	warnForSimpleQuote(curGroup)
	closeGroup(pos(), Groups.Quote)
}

function warnForSimpleQuote(quoteGroup) {
	const tokens = quoteGroup.subTokens
	if (tokens.length === 1) {
		const name = tokens[0]
		if (typeof name === 'string' && isName(name))
			warn(pos(), `Quoted text could be a simple quote ${code(`'${name}`)}.`)
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
