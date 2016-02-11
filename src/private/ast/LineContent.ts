import MsAst from './MsAst'

/**
Any valid part of a [[Block]].

All general-purpose [[MsAst]]s are LineContents; others are only for use in particular locations
(such as [[ObjPair]], which only goes in [[ObjSimple]]).

Note that these are not necessarily used as lines.
(If not, they should be [[Val]] or there will be a [[CompileError]].)
*/
abstract class LineContent extends MsAst {
	// Make this a nominal type
	isLineContent(): void {}
}
export default LineContent

/** An [[MsAst]] that *may* be used as a value. */
export interface Val extends LineContent {
	// Make this a nominal type
	isVal(): void
}
export function isVal(_: LineContent): _ is Val {
	return 'isVal' in _
}

/** An [[MsAst]] that *may* be used as a statement. */
export interface Do extends LineContent {
	// Make this a nominal type
	isDo(): void
}
export function isDo(_: LineContent): _ is Do {
	return 'isDo' in _
}

/**
A line that could be used as either a value or statement.
For example, `if` may transpile to an if statement or to an optional value.
*/
export abstract class ValOrDo extends LineContent implements Val, Do {
	isVal(): void {}
	isDo(): void {}
}

/** An [[MsAst]] that can only be used as a statement. */
export abstract class DoOnly extends LineContent implements Do {
	isDo(): void {}
	// Make this a nominal type
	isDoOnly(): void {}
}

/** An [[MsAst]] that may only be used as a value. */
export abstract class ValOnly extends LineContent implements Val {
	isVal(): void {}
	// Make this a nominal type
	isValOnly(): void {}
}
