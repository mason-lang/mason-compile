import {Pos} from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import {assert} from '../util'

/*
These are kept up-to-date as we iterate through sourceString.
Every access to index has corresponding changes to line and/or column.
This also explains why there are different functions for newlines vs other characters.
*/
export let index: number
export let line: number
export let column: number
export let sourceString: string

export function setupSourceContext(source: string): void {
	sourceString = source
	index = 0
	line = Pos.start.line
	column = Pos.start.column
}

/*
NOTE: We use character *codes* for everything.
Characters are of type Number and not just Strings of length one.
*/

export function pos(): Pos {
	return new Pos(line, column)
}

export function peek(n: number = 0): Char {
	return sourceString.charCodeAt(index + n)
}

// May eat a Newline.
// Caller *must* check for that case and increment line!
export function eat(): Char {
	const char = sourceString.charCodeAt(index)
	skip()
	return char
}
export function skip(n: number = 1): void {
	index = index + n
	column = column + n
}

// charToEat must not be Char.LineFeed.
export function tryEat(charToEat: Char): boolean {
	return tryEatIf(_ => _ === charToEat)
}

export function tryEatIf(pred: (_: Char) => boolean): boolean {
	const canEat = pred(peek())
	if (canEat)
		skip()
	return canEat
}

/**
Does nothing unless it can eat both chars in order.
Chars must not be Char.LineFeed.
*/
export function tryEat2(char1: Char, char2: Char): boolean {
	const canEat = peek() === char1 && peek(1) === char2
	if (canEat)
		skip(2)
	return canEat
}

export function tryEatNewline(): boolean {
	const canEat = peek() === Char.LineFeed
	if (canEat) {
		index = index + 1
		line = line + 1
		column = Pos.start.column
	}
	return canEat
}

// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.
export function stepBackMany(oldPos: Pos, nCharsToBackUp: number): void {
	index = index - nCharsToBackUp
	line = oldPos.line
	column = oldPos.column
}

export function skipRestOfLine(): void {
	skipUntilRegExp(lineFeedRgx)
}
const lineFeedRgx = /\n/g

export function takeRestOfLine(): string {
	return takeUntilRegExp(lineFeedRgx)
}

// rgx must have 'g' flag set
// rgx must accept newline (or else loc becomes wrong)
function skipUntilRegExp(rgx: RegExp): number {
	const startIndex = index
	rgx.lastIndex = startIndex
	index = rgx.exec(sourceString).index
	assert(index !== null)
	const diff = index - startIndex
	column = column + diff
	return diff
}

function takeUntilRegExp(rgx: RegExp): string {
	const startIndex = index
	skipUntilRegExp(rgx)
	return sourceString.slice(startIndex, index)
}

// Assumes that the first character of the name has already been taken.
export function takeName(): string {
	const startIndex = index - 1
	skipUntilRegExp(nameRgx)
	return sourceString.slice(startIndex, index)
}
// Only create regex once to reduce allocations
const nameRgx = /[`&\(\)\[\]\{\}|:'". \n\t#^\\;,]/g

export function isNameCharacter(ch: Char): boolean {
	return isAllNameCharacters(String.fromCharCode(ch))
}

export function isAllNameCharacters(str: string): boolean {
	nameRgx.lastIndex = 0
	return !nameRgx.test(str)
}

export function skipSpaces(): number {
	return skipUntilRegExp(spacesRgx)
}
const spacesRgx = /[^ ]/g

export function skipTabs(): number {
	return skipUntilRegExp(tabsRgx)
}
const tabsRgx = /[^\t]/g

export function skipNumBinary(): void {
	skipUntilRegExp(binRgx)
}
const binRgx = /[^01]/g

export function skipNumOctal(): void {
	skipUntilRegExp(octRgx)
}
const octRgx = /[^0-8]/g

export function skipNumHex(): void {
	skipUntilRegExp(hexRgx)
}
const hexRgx = /[^\da-f]/g

export function skipNumDecimal(): void {
	skipUntilRegExp(decRgx)
}
const decRgx = /[^\d]/g

export function isDigitDecimal(_: Char): boolean {
	return Char._0 <= _ && _ <= Char._9
}

// Called after seeing the first newline.
// Returns # total newlines, including the first.
export function skipNewlines(): number {
	const startLine = line
	line = line + 1
	while (peek() === Char.LineFeed) {
		index = index + 1
		line = line + 1
	}
	column = Pos.start.column
	return line - startLine
}

// Sprinkle checkPos() around to debug line and column tracking errors.
/*
export function checkPos(): void {
	const p = _getCorrectPos()
	if (p.line !== line || p.column !== column)
		throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
}
const indexToPos = new Map()
function getCorrectPos(): Pos {
	if (index === 0)
		return Pos.start

	let oldPos, oldIndex
	for (oldIndex = index - 1; ; oldIndex = oldIndex - 1) {
		oldPos = indexToPos.get(oldIndex)
		if (oldPos !== undefined)
			break
		assert(oldIndex >= 0)
	}
	let newLine = oldPos.line, newColumn = oldPos.column
	for (; oldIndex < index; oldIndex = oldIndex + 1)
		if (sourceString.charCodeAt(oldIndex) === Newline) {
			newLine = newLine + 1
			newColumn = Pos.start.column
		} else
			newColumn = newColumn + 1

	const p = Pos(newLine, newColumn)
	indexToPos.set(index, p)
	return p
}
*/
