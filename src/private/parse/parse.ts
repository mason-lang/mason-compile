import Module from '../ast/Module'
import {GroupBlock} from '../token/Group'
import parseModule from './parseModule'
import {Lines} from './Slice'

/**
This converts a Token tree to a MsAst.
This is a simple and very efficient recursive-descent parser, thanks to two facts:
	* We have already grouped tokens.
		The parser need not worry about looking for a `]`; the grouping has already been handled.
		The only state the parser needs to track (aside from the callstack)
		is the current [[Slice]] of tokens being handled.
	* Most of the time, an AST's type is determined by the first token. (Prefix notation)

There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
For those we must iterate through tokens and split.
(See [[Slice#opSplitOnce]] and [[Slice#opSplitMany]].)
*/
export default function parse(rootToken: GroupBlock): Module {
	return parseModule(Lines.of(rootToken))
}
