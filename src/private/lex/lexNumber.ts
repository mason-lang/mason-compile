import Loc, {Pos} from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import {NumberToken} from '../token/Token'
import {isDigitBinary, isDigitDecimal, isDigitHex, isDigitOctal} from './chars'
import {addToCurrentGroup} from './groupContext'
import {index, peek, pos, skip, skipWhile, sourceString} from './sourceContext'
/**
This is called *after* having eaten the first character of the number.
*/
export default function lexNumber(startPos: Pos): void {
	// We will "skip" characters and just slice sourceString starting from here.
	const startIndex = index - 1

	if (peek(-1) === Char._0) {
		const p = peek()
		switch (p) {
			case Char.b: case Char.o: case Char.x: {
				skip()
				const isDigitSpecial =
					p === Char.b ?
					isDigitBinary :
					p === Char.o ?
					isDigitOctal :
					isDigitHex
				skipWhile(isDigitSpecial)
				break
			}
			case Char.Period:
				skipAfterDecimalPoint()
				break
			default:
				skipNormalNumber()
		}
	} else
		skipNormalNumber()

	const str = sourceString.slice(startIndex, index)
	const loc = new Loc(startPos, pos())
	addToCurrentGroup(new NumberToken(loc, str))
}

/**
This is called after having seen a decimal point.
If it's determined to be a real decimal point (and not like `0.toString()`), skip digits.
*/
function skipAfterDecimalPoint(): void {
	if (isDigitDecimal(peek(1))) {
		skip()
		skipWhile(isDigitDecimal)
	}
}

/** Skip a decimal number, with optional decimal point. */
function skipNormalNumber(): void {
	skipWhile(isDigitDecimal)
	if (peek() === Char.Period)
		skipAfterDecimalPoint()
}
