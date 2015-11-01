import {check, fail} from '../context'
import {MethodImpl, MethodGetter, MethodSetter, QuoteSimple} from '../MsAst'
import {isAnyKeyword, isKeyword, Keywords} from '../Token'
import {parseExpr} from './parse*'
import {beforeAndBlock, justBlock, parseBlockDo, parseBlockVal} from './parseBlock'
import parseFun from './parseFun'

export default function parseMethods(tokens) {
	return tokens.mapSlices(parseMethod)
}

export function parseStatics(tokens) {
	return parseMethods(justBlock(Keywords.Static, tokens))
}

function parseMethod(tokens) {
	const head = tokens.head()

	if (isKeyword(Keywords.Get, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodGetter(tokens.loc, parseExprOrQuoteSimple(before), parseBlockVal(block))
	} else if (isKeyword(Keywords.Set, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodSetter(tokens.loc, parseExprOrQuoteSimple(before), parseBlockDo(block))
	} else {
		const baa = tokens.opSplitOnce(_ => isAnyKeyword(funKeywords, _))
		check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.')
		const {before, at, after} = baa
		const fun = parseFun(methodFunKind(at), after)
		return new MethodImpl(tokens.loc, parseExprOrQuoteSimple(before), fun)
	}
}

// If symbol is just a quoted name, store it as a string, which is handled specially.
function parseExprOrQuoteSimple(tokens) {
	const expr = parseExpr(tokens)
	return expr instanceof QuoteSimple ? expr.name : expr
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
			fail(funKindToken.loc, 'Function `.` is implicit for methods.')
		default:
			fail(funKindToken.loc, `Expected function kind, got ${funKindToken}.`)
	}
}

const funKeywords = new Set([
	Keywords.Fun, Keywords.FunDo, Keywords.FunThis, Keywords.FunThisDo,
	Keywords.FunAsync, Keywords.FunAsyncDo, Keywords.FunThisAsync, Keywords.FunThisAsyncDo,
	Keywords.FunGen, Keywords.FunGenDo, Keywords.FunThisGen, Keywords.FunThisGenDo
])
