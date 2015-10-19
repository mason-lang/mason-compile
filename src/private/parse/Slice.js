import Loc from 'esast/dist/Loc'
import {isEmpty, opIf} from '../util'

/**
Represents a slice of the `subTokens` of some {@link Group}.
This is just a view of it, so taking e.g. {@link tail} is O(1).
Most parser functions act on a Slice and call other functions on sub-slices.
*/
export default class Slice {
	/**
	Slice representing all subTokens of a {@link Group}.
	@type {Group} group
	*/
	static group(group) {
		return new Slice(group.subTokens, 0, group.subTokens.length, group.loc)
	}

	/** @private */
	constructor(tokens, start, end, loc) {
		/**
		Array of tokens in use.
		The slice will only use the ones from `start` to `end`.
		(This is more efficient than calling {@link Array#slice} many times.)
		@type {Array<Token>}
		*/
		this._tokens = tokens
		/**
		Inclusive; index of first token in the slice.
		@type {number}
		*/
		this._start = start
		/**
		Exclusive; index of first token *not* in the slice.
		@type {number}
		*/
		this._end = end
		/**
		Slice keeps track of changes to `loc` as sub-slices are made,
		so most parser functions will call `tokens.loc` when constructing the {@link MsAst}.
		@type {Loc}
		*/
		this.loc = loc
	}

	/** Number of tokens. */
	size() {
		return this._end - this._start
	}

	/** True iff there are no tokens left. */
	isEmpty() {
		return this._start === this._end
	}

	// For these methods, caller must ensure non-empty.

	/** First token. */
	head() {
		return this._tokens[this._start]
	}

	/** Slice of first token. */
	headSlice() {
		return Slice.group(this.head())
	}

	/** Second token. */
	second() {
		return this._tokens[this._start + 1]
	}

	/** Last token. */
	last() {
		return this._tokens[this._end - 1]
	}

	/** Second-to-last token. */
	nextToLast() {
		return this._tokens[this._end - 2]
	}

	/** Slice of all but the first token. */
	tail() {
		return this._chopStart(this._start + 1)
	}

	/** Slice of all but the last token. */
	rtail() {
		return this._chopEnd(this._end - 1)
	}

	/**
	Splits on the first token satisfying `splitOn`.
	@splitOn {function(token:Token): boolean}
	@return {?{before: Slice, at: Token, after: Slice}}
	*/
	opSplitOnce(splitOn) {
		for (let i = this._start; i < this._end; i = i + 1) {
			const token = this._tokens[i]
			if (splitOn(token))
				return {
					before: this._chopEnd(i),
					at: token,
					after: this._chopStart(i + 1)
				}
		}
		return null
	}

	/**
	Splits on *every* token satisfying `splitOn`.
	@splitOn {function(token:Token): boolean}
	@return {?{Array<{before: Slice, at: Token>}}
		Last output will not have `at`.
	*/
	opSplitMany(splitOn) {
		let iLast = this._start
		const out = []
		for (let i = this._start; i < this._end; i = i + 1) {
			const token = this._tokens[i]
			if (splitOn(token)) {
				out.push({before: this._chop(iLast, i), at: token})
				iLast = i + 1
			}
		}

		return opIf(!isEmpty(out), () => {
			out.push({before: this._chopStart(iLast)})
			return out
		})
	}

	/** Iterate over every Token. */
	* [Symbol.iterator]() {
		for (let i = this._start; i < this._end; i = i + 1)
			yield this._tokens[i]
	}

	/**
	Iterator over a Slice for every Token.
	Assumes every sub-token is a Slice too; meaning this is a {@link Group.Block} slice.
	*/
	* slices() {
		for (const _ of this)
			yield Slice.group(_)
	}

	/**
	Maps over every Token.
	@param {function(token:Token)} mapper
	*/
	map(mapper) {
		const out = []
		for (const _ of this)
			out.push(mapper(_))
		return out
	}

	/** Maps over a Slice for every Token, as in {@link slices}.	*/
	mapSlices(f) {
		const out = []
		for (const _ of this.slices())
			out.push(f(_))
		return out
	}

	_chop(newStart, newEnd) {
		const loc = new Loc(this._tokens[newStart].loc.start, this._tokens[newEnd - 1].loc.end)
		return new Slice(this._tokens, newStart, newEnd, loc)
	}

	_chopStart(newStart) {
		const loc = newStart === this._end ?
			this.loc :
			new Loc(this._tokens[newStart].loc.start, this.loc.end)
		return new Slice(this._tokens, newStart, this._end, loc)
	}

	_chopEnd(newEnd) {
		const loc = newEnd === this._start ?
			this.loc :
			new Loc(this.loc.start, this._tokens[newEnd - 1].loc.end)
		return new Slice(this._tokens, this._start, newEnd, loc)
	}
}
