import Char from 'typescript-char/Char'
import {check, compileOptions} from '../context'
import {peek, pos, skipWhileEquals} from './sourceContext'

export default function lexIndent(): number {
	const optIndent = compileOptions.indent
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
