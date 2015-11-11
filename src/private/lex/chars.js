import {code} from '../../CompileError'

function cc(_) {
	return _.charCodeAt(0)
}

export const Chars = {
	Ampersand: cc('&'),
	Backslash: cc('\\'),
	Backtick: cc('`'),
	Bang: cc('!'),
	Bar: cc('|'),
	Caret: cc('^'),
	Cash: cc('$'),
	CloseBrace: cc('}'),
	CloseBracket: cc(']'),
	CloseParenthesis: cc(')'),
	Colon: cc(':'),
	Comma: cc(','),
	Dot: cc('.'),
	Equal: cc('='),
	Hyphen: cc('-'),
	LetterB: cc('b'),
	LetterO: cc('o'),
	LetterX: cc('x'),
	N0: cc('0'),
	N1: cc('1'),
	N2: cc('2'),
	N3: cc('3'),
	N4: cc('4'),
	N5: cc('5'),
	N6: cc('6'),
	N7: cc('7'),
	N8: cc('8'),
	N9: cc('9'),
	Newline: cc('\n'),
	Null: cc('\0'),
	OpenBrace: cc('{'),
	OpenBracket: cc('['),
	OpenParenthesis: cc('('),
	Percent: cc('%'),
	Quote: cc('"'),
	Semicolon: cc(';'),
	Space: cc(' '),
	Star: cc('*'),
	Tab: cc('\t'),
	Tick: cc('\''),
	Tilde: cc('~')
}

export function showChar(char) {
	return code(String.fromCharCode(char))
}

function charPred(chars, negate=false) {
	let src = 'switch(ch) {\n'
	for (let i = 0; i < chars.length; i = i + 1)
		src = `${src}case ${chars.charCodeAt(i)}: `
	src = `${src} return ${!negate}\ndefault: return ${negate}\n}`
	return Function('ch', src)
}

export const
	isDigit = charPred('0123456789'),
	isDigitBinary = charPred('01'),
	isDigitOctal = charPred('01234567'),
	isDigitHex = charPred('0123456789abcdef')

// Anything not explicitly reserved is a valid name character.
const reservedCharacters = '`#%^\\;,'
export const isNameCharacter = charPred('()[]{}\'&.:| \n\t"' + reservedCharacters, true)
