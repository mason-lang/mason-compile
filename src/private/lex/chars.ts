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
	switch (_) {
		// special characters
		case Char.Backtick: case Char.Ampersand: case Char.OpenParenthesis:
		case Char.CloseParenthesis: case Char.OpenBracket: case Char.CloseBracket:
		case Char.OpenBrace: case Char.CloseBrace: case Char.Bar: case Char.Colon:
		case Char.SingleQuote: case Char.DoubleQuote: case Char.Period: case Char.Space:
		case Char.LineFeed: case Char.Tab:
		// reserved characters
		case Char.Hash: case Char.Caret: case Char.Backslash: case Char.Semicolon: case Char.Comma:
			return false
		default:
			return true
	}
}
