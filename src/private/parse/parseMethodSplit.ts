import {caseOp} from 'op/Op'
import {fail} from '../context'
import Keyword, {isFunKeyword, Keywords} from '../token/Keyword'
import {Tokens} from './Slice'

/** Split on a function keyword. */
export default function parseMethodSplit(tokens: Tokens)
	: {before: Tokens, kind: Keywords, after: Tokens} {
	return caseOp(
		tokens.opSplitOnce(isFunKeyword),
		({before, at, after}) => ({before, kind: methodFunKind(<Keyword> at), after}),
		(): {before: Tokens, kind: Keywords, after: Tokens} => {
			throw fail(tokens.loc, _ => _.expectedMethodSplit)
		})
}

function methodFunKind(funKindToken: Keyword): Keywords {
	switch (funKindToken.kind) {
		case Keywords.Fun:
			return Keywords.FunThis
		case Keywords.FunDo:
			return Keywords.FunThisDo
		case Keywords.FunAsync:
			return Keywords.FunThisAsync
		case Keywords.FunAsynDo:
			return Keywords.FunThisAsynDo
		case Keywords.FunGen:
			return Keywords.FunThisGen
		case Keywords.FunGenDo:
			return Keywords.FunThisGenDo
		default:
			throw fail(funKindToken.loc, _ => _.implicitFunctionDot)
	}
}
