import {Pos} from 'esast/lib/Loc'
import {Char} from './chars'

/*
These are kept up-to-date as we iterate through sourceString.
Every access to index has corresponding changes to line and/or column.
This also explains why there are different functions for newlines vs other characters.
*/
export let index: number
export let line: number
export let column: number
export let sourceString: string

export function setupSourceContext(_sourceString: string): void {
	sourceString = _sourceString
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

// charToEat must not be Newline.
export function tryEat(charToEat: Char): boolean {
	const canEat = peek() === charToEat
	if (canEat)
		skip()
	return canEat
}

// chars must not be Newline
export function tryEat2(char1: Char, char2: Char): boolean {
	const canEat = peek() === char1 && peek(1) === char2
	if (canEat)
		skip(2)
	return canEat
}

export function tryEat3(char1: Char, char2: Char, char3: Char): boolean {
	const canEat = peek() === char1 && peek(1) === char2 && peek(2) === char3
	if (canEat)
		skip(3)
	return canEat
}

export function tryEatNewline(): boolean {
	const canEat = peek() === Char.Newline
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

// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
// characterPredicate must *not* accept Newline.
// Otherwise there may be an infinite loop!
export function takeWhile(characterPredicate: (_: Char) => boolean): string {
	return takeWhileWithStart(index, characterPredicate)
}
export function takeWhileWithPrev(characterPredicate: (_: Char) => boolean): string {
	return takeWhileWithStart(index - 1, characterPredicate)
}
function takeWhileWithStart(startIndex: number, characterPredicate: (_: Char) => boolean): string {
	skipWhile(characterPredicate)
	return sourceString.slice(startIndex, index)
}

export function skipWhileEquals(char: Char): number {
	return skipWhile(_ => _ === char)
}

export function skipRestOfLine(): number {
	return skipWhile(_ => _ !== Char.Newline)
}

export function eatRestOfLine(): string {
	return takeWhile(_ => _ !== Char.Newline)
}

export function skipWhile(characterPredicate: (_: Char) => boolean): number {
	const startIndex = index
	while (characterPredicate(peek()))
		index = index + 1
	const diff = index - startIndex
	column = column + diff
	return diff
}

// Called after seeing the first newline.
// Returns # total newlines, including the first.
export function skipNewlines(): number {
	const startLine = line
	line = line + 1
	while (peek() === Char.Newline) {
		index = index + 1
		line = line + 1
	}
	column = Pos.start.column
	return line - startLine
}

// Sprinkle checkPos() around to debug line and column tracking errors.
/*
function checkPos() {
	const p = _getCorrectPos()
	if (p.line !== line || p.column !== column)
		throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
}
const _indexToPos = new Map()
function _getCorrectPos() {
	if (index === 0)
		return Pos.start

	let oldPos, oldIndex
	for (oldIndex = index - 1; ; oldIndex = oldIndex - 1) {
		oldPos = _indexToPos.get(oldIndex)
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
	_indexToPos.set(index, p)
	return p
}
*/
