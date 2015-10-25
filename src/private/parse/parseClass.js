import {check, fail} from '../context'
import {Class, ClassDo, Constructor, Fun, Funs, MethodImpl, MethodGetter, MethodSetter, Quote
	} from '../MsAst'
import {isAnyKeyword, isKeyword, Keywords} from '../Token'
import {opIf} from '../util'
import {parseExpr} from './parse*'
import {beforeAndBlock, justBlock, parseJustBlockDo, parseBlockDo, parseBlockVal
	} from './parseBlock'
import parseFun, {funArgsAndBlock} from './parseFun'
import tryTakeComment from './tryTakeComment'

/** Parse a {@link Class}. */
export default function parseClass(tokens) {
	const [before, block] = beforeAndBlock(tokens)
	const opExtended = opIf(!before.isEmpty(), () => parseExpr(before))

	let opDo = null, statics = [], opConstructor = null, methods = []

	let [opComment, rest] = tryTakeComment(block)

	const line1 = rest.headSlice()
	if (isKeyword(Keywords.Do, line1.head())) {
		const done = parseJustBlockDo(Keywords.Do, line1.tail())
		opDo = new ClassDo(line1.loc, done)
		rest = rest.tail()
	}
	if (!rest.isEmpty()) {
		const line2 = rest.headSlice()
		if (isKeyword(Keywords.Static, line2.head())) {
			statics = parseStatics(line2.tail())
			rest = rest.tail()
		}
		if (!rest.isEmpty()) {
			const line3 = rest.headSlice()
			if (isKeyword(Keywords.Construct, line3.head())) {
				opConstructor = parseConstructor(line3.tail())
				rest = rest.tail()
			}
			methods = parseMethods(rest)
		}
	}

	return new Class(tokens.loc, opExtended, opComment, opDo, statics, opConstructor, methods)
}

function parseConstructor(tokens) {
	const {args, memberArgs, opRestArg, block} = funArgsAndBlock(tokens, true, true)
	const fun = new Fun(tokens.loc, args, opRestArg, block, Funs.Plain, true)
	return new Constructor(tokens.loc, fun, memberArgs)
}

function parseStatics(tokens) {
	return parseMethods(justBlock(Keywords.Static, tokens))
}

function parseMethods(tokens) {
	return tokens.mapSlices(parseMethod)
}

function parseMethod(tokens) {
	const head = tokens.head()

	if (isKeyword(Keywords.Get, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodGetter(tokens.loc, parseExprOrStrLit(before), parseBlockVal(block))
	} else if (isKeyword(Keywords.Set, head)) {
		const [before, block] = beforeAndBlock(tokens.tail())
		return new MethodSetter(tokens.loc, parseExprOrStrLit(before), parseBlockDo(block))
	} else {
		const baa = tokens.opSplitOnce(_ => isAnyKeyword(funKeywords, _))
		check(baa !== null, tokens.loc, 'Expected a function keyword somewhere.')
		const {before, at, after} = baa
		const fun = parseFun(methodFunKind(at), after)
		return new MethodImpl(tokens.loc, parseExprOrStrLit(before), fun)
	}
}

const funKeywords = new Set([
	Keywords.Fun, Keywords.FunDo, Keywords.FunGen, Keywords.FunGenDo,
	Keywords.FunThis, Keywords.FunThisDo, Keywords.FunThisGen, Keywords.FunThisGenDo
])

// If symbol is just a literal string, store it as a string, which is handled specially.
function parseExprOrStrLit(tokens) {
	const expr = parseExpr(tokens)
	const isStrLit = expr instanceof Quote &&
		expr.parts.length === 1 &&
		typeof expr.parts[0] === 'string'
	return isStrLit ? expr.parts[0] : expr
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
