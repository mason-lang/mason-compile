import {Class, ClassKindDo, Constructor, Fun, Funs} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {ifElse} from '../util'
import {opParseExpr, parseExprParts} from './parse*'
import {beforeAndOpBlock, parseJustBlockDo} from './parseBlock'
import {funArgsAndBlock} from './parseFun'
import parseMethodImpls, {parseStatics} from './parseMethodImpls'
import tryTakeComment from './tryTakeComment'

/** Parse a {@link Class}. */
export default function parseClass(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const {opSuperClass, kinds} = parseClassHeader(before)

	let opComment = null, opDo = null, statics = [], opConstructor = null, methods = []
	const finish = () => new Class(tokens.loc,
			opSuperClass, kinds, opComment, opDo, statics, opConstructor, methods)

	if (opBlock === null)
		return finish()

	let [opCom, rest] = tryTakeComment(opBlock)
	opComment = opCom

	if (rest.isEmpty())
		return finish()

	const line1 = rest.headSlice()
	if (isKeyword(Keywords.Do, line1.head())) {
		const done = parseJustBlockDo(Keywords.Do, line1.tail())
		opDo = new ClassKindDo(line1.loc, done)
		rest = rest.tail()
	}

	if (rest.isEmpty())
		return finish()

	const line2 = rest.headSlice()
	if (isKeyword(Keywords.Static, line2.head())) {
		statics = parseStatics(line2.tail())
		rest = rest.tail()
	}

	if (rest.isEmpty())
		return finish()

	const line3 = rest.headSlice()
	if (isKeyword(Keywords.Construct, line3.head())) {
		opConstructor = parseConstructor(line3.tail())
		rest = rest.tail()
	}
	methods = parseMethodImpls(rest)

	return finish()
}

function parseClassHeader(tokens) {
	const [extendedTokens, kinds] =
		ifElse(tokens.opSplitOnce(_ => isKeyword(Keywords.Kind, _)),
			({before, after}) => [before, parseExprParts(after)],
			() => [tokens, []])
	const opSuperClass = opParseExpr(extendedTokens)
	return {opSuperClass, kinds}
}

function parseConstructor(tokens) {
	const {args, memberArgs, opRestArg, block} = funArgsAndBlock(tokens, false, true)
	const fun = new Fun(tokens.loc, args, opRestArg, block, Funs.Plain, true)
	return new Constructor(tokens.loc, fun, memberArgs)
}
