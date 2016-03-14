import {caseOp} from 'op/Op'
import {check, fail} from '../context'
import {KeywordFun, KeywordFunOptions} from '../token/Keyword'
import {Tokens} from './Slice'

/** Split on a function keyword. */
export default function parseMethodSplit(tokens: Tokens
	): {before: Tokens, options: KeywordFunOptions, after: Tokens} {
	return caseOp(
		tokens.opSplitOnce(_ => _ instanceof KeywordFun),
		({before, at: atToken, after}) => {
			const {loc, options} = <KeywordFun> atToken
			check(!options.isThisFun, loc, _ => _.implicitFunctionDot)
			options.isThisFun = true
			return {before, options: options, after}
		},
		(): {before: Tokens, options: KeywordFunOptions, after: Tokens} => {
			throw fail(tokens.loc, _ => _.expectedMethodSplit)
		})
}
