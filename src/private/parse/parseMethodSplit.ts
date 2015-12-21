import {caseOp} from 'op/Op'
import {check, fail} from '../context'
import {isAnyKeyword, Keyword, Keywords} from '../Token'
import {Tokens} from './Slice'

/** Split on a function keyword. */
export default function parseMethodSplit(tokens: Tokens): {before: Tokens, kind: Keywords, after: Tokens} {
	return caseOp(tokens.opSplitOnce(_ => isAnyKeyword(funKeywords, _)),
		({before, at, after}) => ({before, kind: methodFunKind(<Keyword> at), after}),
		(): {before: Tokens, kind: Keywords, after: Tokens} => { throw fail(tokens.loc, _ => _.expectedMethodSplit) })
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
		case Keywords.FunThis: case Keywords.FunThisDo:
		case Keywords.FunThisAsync: case Keywords.FunThisAsynDo:
		case Keywords.FunThisGen: case Keywords.FunThisGenDo:
			throw fail(funKindToken.loc, _ => _.implicitFunctionDot)
		default:
			throw fail(funKindToken.loc, _ => _.expectedFuncKind(funKindToken))
	}
}

const funKeywords = new Set<Keywords>([
	Keywords.Fun, Keywords.FunDo, Keywords.FunThis, Keywords.FunThisDo,
	Keywords.FunAsync, Keywords.FunAsynDo, Keywords.FunThisAsync, Keywords.FunThisAsynDo,
	Keywords.FunGen, Keywords.FunGenDo, Keywords.FunThisGen, Keywords.FunThisGenDo
])
