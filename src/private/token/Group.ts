import Loc from 'esast/lib/Loc'
import Keyword from './Keyword'
import Token, {NameToken, StringToken} from './Token'

abstract class Group<SubType extends Token> extends Token {
	constructor(loc: Loc, public subTokens: Array<SubType>) {
		super(loc)
	}

	get type(): GroupType {
		return <any> this.constructor
	}
}
export default Group

export type GroupType = {
	new(loc: Loc, subTokens: Array<{}>): Group<Token>
}

/**
Lines in an indented block.
Note that `Block`s do not always map to [[Block]] MsAsts.
*/
export class GroupBlock extends Group<GroupLine> {}

export type QuoteTokenPart = StringToken | NameToken | Keyword | GroupInterpolation

/**
Tokens within a quote.
`subTokens` may be plain strings, Names (for `#foo`), or Interpolation groups (for `#(0)`).
*/
export class GroupQuote extends Group<QuoteTokenPart> {}

/**
Tokens within a RegExp.
`subTokens` are same as for Quote.
*/
export class GroupRegExp extends Group<QuoteTokenPart> {
	flags: string
}

/**
Tokens surrounded by parentheses.
There may be no closing parenthesis. In:

	a (b
		c

The tokens are a Group<Line>(Name, Group<Parenthesis>(...))
*/
export class GroupParenthesis extends Group<Token> {}

/** Like [[GroupParenthesis]], but simpler because there must be a closing `]`. */
export class GroupBracket extends Group<Token> {}

/** Like [[GroupBracket]] but for `{}` instead of `[]`. */
export class GroupBrace extends Group<Token> {}

/**
Tokens on a line.
The indented block following the end of the line is considered to be a part of the line!
This means that in this code:
	a
		b
		c
	d
There are 2 lines, one starting with 'a' and one starting with 'd'.
The first line contains 'a' and a `Block` which in turn contains two other lines.
*/
export class GroupLine extends Group<Token> {
	showType(): string { return 'line' }
}

/**
Groups two or more tokens that are *not* separated by spaces.
`a[b].c` is an example.
A single token on its own will not be given a `Space` group.
*/
export class GroupSpace extends Group<Token> {
	showType(): string { return 'space' }
}

/** Interpolated tokens in a Quote or RegExp using `#()`. */
export class GroupInterpolation extends Group<Token> {
	showType(): string { return 'interpolation' }
}
