import {check, fail} from '../context'
import {isAnyKeyword, Keywords} from '../Token'

/** Split on a function keyword. */
export default function parseMethodSplit(tokens) {
	const baa = tokens.opSplitOnce(_ => isAnyKeyword(funKeywords, _))
	check(baa !== null, tokens.loc, 'expectedMethodSplit')
	const {before, at, after} = baa
	const kind = methodFunKind(at)
	return {before, kind, after}
}

function methodFunKind(funKindToken) {
	switch (funKindToken.kind) {
		case Keywords.Fun:
			return Keywords.FunThis
		case Keywords.FunDo:
			return Keywords.FunThisDo
		case Keywords.FunAsync:
			return Keywords.FunThisAsync
		case Keywords.FunAsyncDo:
			return Keywords.FunThisAsyncDo
		case Keywords.FunGen:
			return Keywords.FunThisGen
		case Keywords.FunGenDo:
			return Keywords.FunThisGenDo
		case Keywords.FunThis: case Keywords.FunThisDo:
		case Keywords.FunThisAsync: case Keywords.FunThisAsyncDo:
		case Keywords.FunThisGen: case Keywords.FunThisGenDo:
			fail(funKindToken.loc, 'implicitFunctionDot')
			break
		default:
			fail(funKindToken.loc, 'expectedFuncKind', funKindToken)
	}
}

const funKeywords = new Set([
	Keywords.Fun, Keywords.FunDo, Keywords.FunThis, Keywords.FunThisDo,
	Keywords.FunAsync, Keywords.FunAsyncDo, Keywords.FunThisAsync, Keywords.FunThisAsyncDo,
	Keywords.FunGen, Keywords.FunGenDo, Keywords.FunThisGen, Keywords.FunThisGenDo
])
