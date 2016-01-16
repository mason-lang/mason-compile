import Loc from 'esast/lib/Loc'
import {Val, ValOnly} from './LineContent'

/** [[QuoteSimple]] or [[QuoteTemplate]]. */
abstract class Quote extends ValOnly {
	// Make this a nominal type
	isQuote(): void {}
}
export default Quote

/**
Quoted text. Always compiles to a template string.
For tagged templates, use [[QuoteTagged]].
*/
export class QuoteTemplate extends Quote {
	// `parts` are Strings interleaved with Vals.
	// part Strings are raw values, meaning "\n" is two characters.
	constructor(loc: Loc, public parts: Array<TemplatePart>) {
		super(loc)
	}
}
export type TemplatePart = string | Val

/**
`'{value}`.
Quote consisting of a single name.
*/
export class QuoteSimple extends Quote {
	constructor(loc: Loc, public value: string) {
		super(loc)
	}
}

/** `{tag}"{quote}"` */
export class QuoteTagged extends ValOnly {
	constructor(loc: Loc, public tag: Val, public quote: QuoteTemplate) {
		super(loc)
	}
}

/**
RegExp expression, like `\`foo\``..
Like QuoteTemplate, may contain interpolation.
*/
export class MsRegExp extends ValOnly {
	constructor(
		loc: Loc,
		public parts: Array<TemplatePart>,
		/** Some selection of the letters in 'gimy' (in that order). */
		public flags: string = '') {
		super(loc)
	}
}
