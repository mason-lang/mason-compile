import {code} from '../../CompileError'
import {isReservedKeyword, keywordName} from '../Token'

// Since there are so many parsing functions,
// it's faster (as of node v0.11.14) to have them all close over this mutable variable once
// than to close over the parameter (as in lex.js, where that's much faster).
export let context

export const
	checkEmpty = (tokens, message) => {
		context.check(tokens.isEmpty(), tokens.loc, message)
	},
	checkNonEmpty = (tokens, message) => {
		context.check(!tokens.isEmpty(), tokens.loc, message)
	},
	// TODO:ES6 Should be able to just do `context = _context`, because it's a `let` declaration.
	setContext = _context => {
		context = _context
	},
	unexpected = token => {
		const message = isReservedKeyword(token) ?
			`Reserved word ${code(keywordName(token.kind))}.` :
			`Unexpected ${token}.`
		context.fail(token.loc, message)
	}
