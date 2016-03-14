import Char from 'typescript-char/Char'
import {check, compileOptions} from '../context'
import {peek, pos, skipSpaces, skipTabs} from './sourceContext'

export default function lexIndent(): number {
	const optIndent = compileOptions.indent
	if (typeof optIndent === 'number') {
		const spaces = skipSpaces()
		check(spaces % optIndent === 0, pos, _ => _.badSpacedIndent(optIndent))
		return spaces / optIndent
	} else {
		const indent = skipTabs()
		check(peek() !== Char.Space, pos, _ => _.noLeadingSpace)
		return indent
	}
}
