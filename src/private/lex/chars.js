import {code} from '../../CompileError'

export const Chars = {
	Ampersand: '&',
	Backslash: '\\',
	Backtick: '`',
	Bang: '!',
	Bar: '|',
	Caret: '^',
	Cash: '$',
	CloseBrace: '}',
	CloseBracket: ']',
	CloseParenthesis: ')',
	Colon: ':',
	Comma: ',',
	Dot: '.',
	Equal: '=',
	G: 'g',
	Hash: '#',
	Hyphen: '-',
	I: 'i',
	LetterB: 'b',
	LetterO: 'o',
	LetterX: 'x',
	M: 'm',
	N0: '0',
	N1: '1',
	N2: '2',
	N3: '3',
	N4: '4',
	N5: '5',
	N6: '6',
	N7: '7',
	N8: '8',
	N9: '9',
	Newline: '\n',
	Null: '\0',
	OpenBrace: '{',
	OpenBracket: '[',
	OpenParenthesis: '(',
	Percent: '%',
	Quote: '"',
	Semicolon: ';',
	Space: ' ',
	Star: '*',
	Tab: '\t',
	Tick: '\'',
	Tilde: '~',
	Y: 'y'
}
for (const key in Chars)
	Chars[key] = Chars[key].charCodeAt(0)

export function showChar(char) {
	return code(String.fromCharCode(char))
}

function charPred(chars, negate = false) {
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
const reservedCharacters = '#%^\\;,'
export const isNameCharacter = charPred(`\`&()[]{}|:'". \n\t${reservedCharacters}`, true)
