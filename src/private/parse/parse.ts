import Module from '../ast/Module'
import {GroupBlock} from '../token/Group'
import parseModule from './parseModule'
import Slice, {Lines} from './Slice'

/**
This converts a Token tree to a MsAst.
This is a recursive-descent parser, made easier by two facts:
	* We have already grouped tokens.
	* Most of the time, an ast's type is determined by the first token.

There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
For those we must iterate through tokens and split.
(See [[Slice#opSplitOnce]] and [[Slice#opSplitMany]].)
*/
export default function parse(rootToken: GroupBlock): Module {
	return parseModule(Lines.of(rootToken))
}
