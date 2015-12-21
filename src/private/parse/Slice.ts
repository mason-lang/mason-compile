import Loc from 'esast/lib/Loc'
import Op, {opIf} from 'op/Op'
import Token, {Group, GroupLine, Keyword, Keywords, QuoteTokenPart} from '../Token'
import {head, isEmpty, tail} from '../util'

/**
Represents a slice of the `subTokens` of some [[Group]].
This is just a view of it, so taking e.g. [[Slice.tail]] is O(1).
Most parser functions act on a Slice and call other functions on sub-slices.
*/
export default class Slice<SubType extends Token> {
	/** Slice representing all subTokens of a [[Group]]. */
	static of<SubType extends Token>(group: Group<SubType>): Slice<SubType> {
		return new this(group.subTokens, 0, group.subTokens.length, group.loc)
	}

	// todo: `tokens`, `start`, `end` should be private, but are currently used by parseSpacedFold
	/**
	Array of tokens in use.
	The slice will only use the ones from `start` to `end`.
	(This is more efficient than calling [[Array#slice]] many times.)
	*/
	tokens: Array<SubType>
	/** Inclusive; index of first token in the slice. */
	start: number
	/** Exclusive; index of first token *not* in the slice. */
	end: number
	/**
	Slice keeps track of changes to `loc` as sub-slices are made,
	so most parser functions will call `tokens.loc` when constructing the [[MsAst]].
	*/
	loc: Loc

	/** @private */
	constructor(tokens: Array<SubType>, start: number, end: number, loc: Loc) {
		this.tokens = tokens
		this.start = start
		this.end = end
		this.loc = loc
	}

	/** Number of tokens. */
	size(): number {
		return this.end - this.start
	}

	/** True iff there are no tokens left. */
	isEmpty(): boolean {
		return this.start === this.end
	}

	// For these methods, caller must ensure non-empty.

	/** First token. */
	head(): SubType {
		return this.tokens[this.start]
	}

	/** Second token. */
	second(): SubType {
		return this.tokens[this.start + 1]
	}

	/** Last token. */
	last(): SubType {
		return this.tokens[this.end - 1]
	}

	/** Second-to-last token. */
	nextToLast(): SubType {
		return this.tokens[this.end - 2]
	}

	/** Slice of all but the first token. */
	tail(): this {
		return this.chopStart(this.start + 1)
	}

	/** Slice of all but the last token. */
	rtail(): this {
		return this.chopEnd(this.end - 1)
	}

	/** Splits on the first token satisfying `splitOn`. */
	opSplitOnce(splitOn: (_: Token) => boolean): Op<SplitOnceResult<this, SubType>> {
		for (let i = this.start; i < this.end; i = i + 1) {
			const token = this.tokens[i]
			if (splitOn(token))
				return {
					before: this.chopEnd(i),
					at: token,
					after: this.chopStart(i + 1)
				}
		}
		return null
	}

	/**
	Splits on *every* token satisfying `splitOn`.
	*/
	opSplitMany(splitOn: (_: Token) => boolean): Op<SplitManyResult<this, SubType>> {
		let iLast = this.start
		const out: SplitManyResult<this, SubType> = []
		for (let i = this.start; i < this.end; i = i + 1) {
			const token = this.tokens[i]
			if (splitOn(token)) {
				out.push({before: this.chop(iLast, i), at: token})
				iLast = i + 1
			}
		}
		return opIf(!isEmpty(out), () => {
			out.push({before: this.chopStart(iLast), at: null})
			return out
		})
	}

	* [Symbol.iterator](): Iterator<SubType> {
		for (let i = this.start; i < this.end; i = i + 1)
			yield this.tokens[i]
	}

	/** Maps over every Token. */
	map<A>(mapper: (_: SubType) => A): Array<A> {
		const out: Array<A> = []
		for (const _ of this)
			out.push(mapper(_))
		return out
	}

	private slice(newStart: number, newEnd: number, newLoc: Loc): this {
		return new (<any> this.constructor)(this.tokens, newStart, newEnd, newLoc)
	}

	protected chop(newStart: number, newEnd: number): this {
		return this.slice(newStart, newEnd, new Loc(this.tokens[newStart].loc.start, this.tokens[newEnd - 1].loc.end))
	}

	// todo: would like this to be private, but it's used by parseSpacedFold
	chopStart(newStart: number): this {
		return this.slice(newStart, this.end, newStart === this.end ? this.loc : new Loc(this.tokens[newStart].loc.start, this.loc.end))
	}

	private chopEnd(newEnd: number): this {
		return this.slice(this.start, newEnd, newEnd === this.start ? this.loc : new Loc(this.loc.start, this.tokens[newEnd - 1].loc.end))
	}
}

/** Slice of lines in a block. */
export class Lines extends Slice<GroupLine> {
	// todo: this should be unnecessary, just type Slice.of as `: this`
	// https://github.com/Microsoft/TypeScript/issues/5863
	static of(group: Group<GroupLine>): Lines {
		return <any> super.of(group)
	}

	/**
	Iterator over a Slice for every Token.
	Assumes every sub-token is a Slice too; meaning this is a [[Group.Block]] slice.
	*/
	* slices(): Iterable<Tokens> {
		for (const _ of this)
			yield Tokens.of(_)
	}

	/** Slice of first token. */
	headSlice(): Tokens {
		return Tokens.of(this.head())
	}

	/** Slice of last token. */
	lastSlice(): Tokens {
		return Tokens.of(this.last())
	}

	/** Maps over a Slice for every Token, as in [[slices]]. */
	mapSlices<A>(mapper: (_: Tokens) => A): Array<A> {
		const out: Array<A> = []
		for (const _ of this.slices())
			out.push(mapper(_))
		return out
	}
}

export class Tokens extends Slice<Token> {
	// todo: this should be unnecessary, just type Slice.of as `: this`
	// https://github.com/Microsoft/TypeScript/issues/5863
	static of(group: Group<Token>): Tokens {
		return <any> super.of(group)
	}

	/*
	Split on a given list of keywords.
	Keywords must come in order and appear 0 or 1 times.
	Examples:
		When keywords are `foo` and `bar`:
		`a foo b bar c`: [`a`, `b`, `c`]
		`a`: `[a, null, null]`
		`a bar b`: `[a, null, b]`
	@return
		For each keyword, an optional slice for whether that keyword is present.
		An additional slice is put at the front for all tokens appearing before the first keyword.
		Returned length is keywords.length + 1.
		It's recommended to destructure on this value.
	*/
	getKeywordSections(keywords: Array<Keywords>): [this, Array<Op<this>>] {
		const out = new Array(keywords.length + 1).fill(null)

		let iNextKeyword = 0
		let iTokenPrev = this.start

		for (let iToken = this.start; iToken < this.end; iToken = iToken + 1) {
			const token = this.tokens[iToken]
			if (token instanceof Keyword) {
				const kind = token.kind
				for (let iKeyword = iNextKeyword; iKeyword < keywords.length; iKeyword = iKeyword + 1)
					if (kind === keywords[iKeyword]) {
						// iNextKeyword happens to equal the previous matched keyword + 1,
						// so this is the index for that keyword.
						out[iNextKeyword] = this.chop(iTokenPrev, iToken)
						iNextKeyword = iKeyword + 1
						iTokenPrev = iToken + 1
					}
			}
		}

		out[iNextKeyword] = this.chopStart(iTokenPrev)
		return [head(out), tail(out)]
	}
}

export type QuoteTokens = Slice<QuoteTokenPart>

// Need to do this because they use this-types
export type SplitOnceResult<This, SubType> = {before: This, at: SubType, after: This}
export type SplitManyResult<This, SubType> = Array<{before: This, at: SubType}>
