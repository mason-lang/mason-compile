import {setContext} from './context'
import './loadParse*'
import parseModule from './parseModule'
import Slice from './Slice'

/*
This converts a Token tree to a MsAst.
This is a recursive-descent parser, made easier by two facts:
	* We have already grouped tokens.
	* Most of the time, an ast's type is determined by the first token.

There are exceptions such as assignment statements (indicated by a `=` somewhere in the middle).
For those we must iterate through tokens and split.
(See Slice.opSplitOnceWhere and Slice.opSplitManyWhere.)
*/
export default (_context, rootToken) => {
	setContext(_context)
	const msAst = parseModule(Slice.group(rootToken))
	// Release for garbage collection.
	setContext(null)
	return msAst
}
