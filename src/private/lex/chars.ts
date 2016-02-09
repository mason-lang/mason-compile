import Char from 'typescript-char/Char'

export function isDigitBinary(_: Char): boolean {
	return _ === Char._0 || _ === Char._1
}

export function isDigitOctal(_: Char): boolean {
	return inRange(_, Char._0, Char._7)
}

export function isDigitDecimal(_: Char): boolean {
	return inRange(_, Char._0, Char._9)
}

export function isDigitHex(_: Char): boolean {
	return isDigitDecimal(_) || inRange(_, Char.a, Char.f)
}

function inRange(_: Char, min: Char, max: Char): boolean {
	return min <= _ && _ <= max
}

export function isNameCharacter(_: Char): boolean {
	// Anything > 128 is a valid name character.
	return !(_ < nameCharacters.length && nameCharacters[_] === 0)
}

// This tests as slightly faster than using a switch statement.
// 0: is not a name character; 1: is a name character.
const nameCharacters = new Uint8Array(128)
for (let i = 0; i < 128; i++)
	nameCharacters[i] = 1
const notNameCharacters = [
	Char.Backtick,
	Char.Ampersand,
	Char.OpenParenthesis,
	Char.CloseParenthesis,
	Char.OpenBracket,
	Char.CloseBracket,
	Char.OpenBrace,
	Char.CloseBrace,
	Char.Bar,
	Char.Colon,
	Char.SingleQuote,
	Char.DoubleQuote,
	Char.Period,
	Char.Space,
	Char.LineFeed,
	Char.Tab,
	// Reserved characters:
	Char.Hash,
	Char.Caret,
	Char.Backslash,
	Char.Semicolon,
	Char.Comma
]
for (const _ of notNameCharacters)
	nameCharacters[_] = 0
