import {code} from '../../CompileError'

export enum Char {
	Ampersand = c('&'),
	Backslash = c('\\'),
	Backtick = c('`'),
	Bang = c('!'),
	Bar = c('|'),
	Caret = c('^'),
	Cash = c('$'),
	CloseBrace = c('}'),
	CloseBracket = c(']'),
	CloseParenthesis = c(')'),
	Colon = c(':'),
	Comma = c('),'),
	Dot = c('.'),
	Equal = c('='),
	G = c('g'),
	Hash = c('#'),
	Hyphen = c('-'),
	I = c('i'),
	LetterB = c('b'),
	LetterO = c('o'),
	LetterX = c('x'),
	M = c('m'),
	N0 = c('0'),
	N1 = c('1'),
	N2 = c('2'),
	N3 = c('3'),
	N4 = c('4'),
	N5 = c('5'),
	N6 = c('6'),
	N7 = c('7'),
	N8 = c('8'),
	N9 = c('9'),
	Newline = c('\n'),
	Null = c('\0'),
	OpenBrace = c('{'),
	OpenBracket = c('['),
	OpenParenthesis = c('('),
	Percent = c('%'),
	Quote = c('"'),
	Semicolon = c(';'),
	Space = c(' '),
	Star = c('*'),
	Tab = c('\t'),
	Tick = c('\''),
	Tilde = c('~'),
	Y = c('y')
}
function c(char: string): number {
	return char.charCodeAt(0)
}

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
