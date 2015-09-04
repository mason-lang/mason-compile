import Loc from 'esast/dist/Loc'
import { isEmpty, opIf, push } from '../util'

/*
Represents a section of tokens that the parser is currently working on.
Since we don't modify the Token tree, this is just a view on it.
So, taking the tail is O(1).
*/
export default class Slice {
	static group(groupToken) {
		const { subTokens, loc } = groupToken
		return new Slice(subTokens, 0, subTokens.length, loc)
	}

	// Do not use `new`. Use Slice.group.
	constructor(tokens, start, end, loc) {
		this.tokens = tokens
		this.start = start
		// end is exclusive.
		this.end = end
		this.loc = loc
	}

	size() {
		return this.end - this.start
	}

	isEmpty() {
		return this.start === this.end
	}

	// For these methods, caller must ensure non-empty.
	head() {
		return this.tokens[this.start]
	}
	headSlice() {
		return Slice.group(this.head())
	}

	second() {
		return this.tokens[this.start + 1]
	}

	last() {
		return this.tokens[this.end - 1]
	}

	tail() {
		return this._chopStart(this.start + 1)
	}

	rtail() {
		return this._chopEnd(this.end - 1)
	}

	// Looks for the first token to satisfy `splitOn` and does not look further.
	opSplitOnceWhere(splitOn) {
		for (let i = this.start; i < this.end; i = i + 1)
			if (splitOn(this.tokens[i]))
				return {
					before: this._chopEnd(i),
					at: this.tokens[i],
					after: this._chopStart(i + 1)
				}
		return null
	}

	// Splits every time  `splitOn` is true.
	// Every output but last will be { before, at }; last will be just { before }.
	opSplitManyWhere(splitOn) {
		let iLast = this.start
		const out = [ ]
		for (let i = this.start; i < this.end; i = i + 1)
			if (splitOn(this.tokens[i])) {
				out.push({ before: this._chop(iLast, i), at: this.tokens[i] })
				iLast = i + 1
			}
		return opIf(!isEmpty(out), () => push(out, { before: this._chopStart(iLast) }))
	}

	* [Symbol.iterator]() {
		for (let i = this.start; i < this.end; i = i + 1)
			yield this.tokens[i]
	}

	* slices() {
		for (const _ of this)
			yield Slice.group(_)
	}

	map(f) {
		const out = []
		for (const _ of this)
			out.push(f(_))
		return out
	}

	mapSlices(f) {
		const out = []
		for (const _ of this.slices())
			out.push(f(_))
		return out
	}

	_chop(newStart, newEnd) {
		const loc = new Loc(this.tokens[newStart].loc.start, this.tokens[newEnd - 1].loc.end)
		return new Slice(this.tokens, newStart, newEnd, loc)
	}
	_chopStart(newStart) {
		const loc = newStart === this.end ?
			this.loc :
			new Loc(this.tokens[newStart].loc.start, this.loc.end)
		return new Slice(this.tokens, newStart, this.end, loc)
	}
	_chopEnd(newEnd) {
		const loc = newEnd === this.start ?
			this.loc :
			new Loc(this.loc.start, this.tokens[newEnd - 1].loc.end)
		return new Slice(this.tokens, this.start, newEnd, loc)
	}
}
