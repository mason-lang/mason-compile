import Char from 'typescript-char/Char'
import {code} from '../../CompileError'

export function showChar(char: Char) {
	return code(String.fromCharCode(char))
}

function charPred(chars: string, negate: boolean = false): (_: Char) => boolean {
	let src = 'switch(ch) {\n'
	for (let i = 0; i < chars.length; i = i + 1)
		src = `${src}case ${chars.charCodeAt(i)}: `
	src = `${src} return ${!negate}\ndefault: return ${negate}\n}`
	return <any> Function('ch', src)
}

export const
	isDigit = charPred('0123456789'),
	isDigitBinary = charPred('01'),
	isDigitOctal = charPred('01234567'),
	isDigitHex = charPred('0123456789abcdef')

// Anything not explicitly reserved is a valid name character.
const reservedCharacters = '#%^\\;,'
export const isNameCharacter = charPred(`\`&()[]{}|:'". \n\t${reservedCharacters}`, true)
