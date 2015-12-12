import {Class, ClassKindDo, Constructor, Field, Fun, LocalDeclares} from '../MsAst'
import {check} from '../context'
import {isKeyword, Keywords} from '../Token'
import {ifElse, opIf, opMap} from '../util'
import {parseExpr, parseExprParts} from './parse*'
import {beforeAndOpBlock, parseJustBlock} from './parseBlock'
import {funArgsAndBlock} from './parseFun'
import parseMethodImpls, {parseStatics} from './parseMethodImpls'
import {parseLocalParts} from './parseLocalDeclares'
import tryTakeComment from './tryTakeComment'

/** Parse a {@link Class}. */
export default function parseClass(tokens) {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const {opFields, opSuperClass, kinds} = parseClassHeader(before)

	let opComment = null, opDo = null, statics = [], opConstructor = null, methods = []
	const finish = () => new Class(tokens.loc,
		opFields, opSuperClass, kinds, opComment, opDo, statics, opConstructor, methods)

	if (opBlock === null)
		return finish()

	const [_opComment, _rest] = tryTakeComment(opBlock)
	opComment = _opComment
	let rest = _rest

	if (rest.isEmpty())
		return finish()

	const line1 = rest.headSlice()
	if (isKeyword(Keywords.Do, line1.head())) {
		const done = parseJustBlock(Keywords.Do, line1.tail())
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
	const [fieldsTokens, extendsTokens, kindTokens] =
		tokens.getKeywordSections([Keywords.Extends, Keywords.Kind])
	return {
		opFields: opIf(!fieldsTokens.isEmpty(), () => fieldsTokens.map(_ => {
			const {name, opType, kind} = parseLocalParts(_)
			check(kind === LocalDeclares.Eager, _.loc, 'todoLazyField')
			return new Field(_.loc, name, opType)
		})),
		opSuperClass: opMap(extendsTokens, parseExpr),
		kinds: ifElse(kindTokens, parseExprParts, () => [])
	}
}

function parseConstructor(tokens) {
	const {args, memberArgs, opRestArg, block} = funArgsAndBlock(tokens, false, true)
	const fun = new Fun(tokens.loc, args, opRestArg, block, {isThisFun: true, isDo: true})
	return new Constructor(tokens.loc, fun, memberArgs)
}
