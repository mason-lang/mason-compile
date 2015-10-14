import {code} from '../../CompileError'
import {check, fail} from '../context'
import {isReservedKeyword, keywordName} from '../Token'

export const
	checkEmpty = (tokens, message) => {
		check(tokens.isEmpty(), tokens.loc, message)
	},

	checkNonEmpty = (tokens, message) => {
		check(!tokens.isEmpty(), tokens.loc, message)
	},

	unexpected = token => {
		const message = isReservedKeyword(token) ?
			`Reserved word ${code(keywordName(token.kind))}.` :
			`Unexpected ${token}.`
		fail(token.loc, message)
	}
