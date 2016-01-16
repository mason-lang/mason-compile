import Loc from 'esast/lib/Loc'
import {code} from '../languages/util'

/**
Lexed element in a tree of Tokens.

Since [[lex]] does grouping, [[parse]] avoids doing much of the work parsers usually do;
it doesn't have to handle a "left parenthesis", only a [[GroupParenthesis]].
This also means that the many different [[MsAst]] types all parse in a similar manner,
keeping the language consistent.
*/
// TODO: Would like `export default abstract class Token
// https://github.com/Microsoft/TypeScript/issues/3792
abstract class Token {
	constructor(public loc: Loc) {}
}
export default Token

/**
An identifier. Usually the name of some local variable or property.
A Name is guaranteed to not be any keyword.
*/
export class NameToken extends Token {
	constructor(loc: Loc, public name: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return code(this.name)
	}
}

/**
Documentation comment (beginning with one `|` rather than two).
Non-doc comments are ignored by [[lex]].
These don't affect output, but are passed to various [[MsAst]]s for use by other tools.
*/
export class DocComment extends Token {
	constructor(loc: Loc, public text: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return 'doc comment'
	}
}

/** Number literal. */
export class NumberToken extends Token {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return this.value
	}
}

/**
String part of a GroupQuote or GroupRegExp.
(Mason does not have any other kind of string literal.)
*/
export class StringToken extends Token {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}

	/** @override */
	toString(): string {
		return this.value
	}
}
