import Op, {caseOp, opIf, opMap} from 'op/Op'
import Class, {Constructor, Field} from '../ast/Class'
import {ClassTraitDo, MethodImplLike} from '../ast/classTraitCommon'
import {FunBlock} from '../ast/Fun'
import {Val} from '../ast/LineContent'
import {LocalDeclares} from '../ast/locals'
import {check} from '../context'
import {isKeyword, Kw} from '../token/Keyword'
import {beforeAndOpBlock} from './parseBlock'
import parseExpr, {parseExprParts} from './parseExpr'
import {funArgsAndBlock} from './parseFunBlock'
import parseMethodImpls, {opTakeDo, takeStatics} from './parseMethodImpls'
import {parseLocalParts} from './parseLocalDeclares'
import {Lines, Tokens} from './Slice'
import tryTakeComment from './tryTakeComment'

/** Parse a [[Class]]. */
export default function parseClass(tokens: Tokens): Class {
	const [before, opBlock] = beforeAndOpBlock(tokens)
	const {opFields, opSuperClass, traits} = parseClassHeader(before)
	type Tuple = [Op<string>, Op<ClassTraitDo>,
		Array<MethodImplLike>, Op<Constructor>, Array<MethodImplLike>]
	const [opComment, opDo, statics, opConstructor, methods] = caseOp<Lines, Tuple>(
		opBlock,
		_ => {
			const [opComment, rest] = tryTakeComment(_)
			if (rest.isEmpty())
				return [opComment, null, [], null, []]
			const [opDo, rest2] = opTakeDo(rest)
			if (rest2.isEmpty())
				return [opComment, opDo, [], null, []]
			const [statics, rest3] = takeStatics(rest2)
			if (rest3.isEmpty())
				return [opComment, opDo, statics, null, []]
			const [opConstructor, rest4] = opTakeConstructor(rest3)
			return [opComment, opDo, statics, opConstructor, parseMethodImpls(rest4)]
		},
		() => [null, null, [], null, []])
	return new Class(
		tokens.loc,
		opFields, opSuperClass, traits, opComment, opDo, statics, opConstructor, methods)
}

function parseClassHeader(tokens: Tokens
	): {opFields: Op<Array<Field>>, opSuperClass: Op<Val>, traits: Array<Val>} {
	const [fieldsTokens, [extendsTokens, traitTokens]] =
		tokens.getKeywordSections(Kw.Extends, Kw.Trait)
	return {
		opFields: opIf(!fieldsTokens.isEmpty(), () => fieldsTokens.map(_ => {
			const {name, opType, kind} = parseLocalParts(_)
			check(kind === LocalDeclares.Eager, _.loc, _ => _.todoLazyField)
			return new Field(_.loc, name, opType)
		})),
		opSuperClass: opMap(extendsTokens, parseExpr),
		traits: caseOp(traitTokens, parseExprParts, () => [])
	}
}

function opTakeConstructor(tokens: Lines): [Op<Constructor>, Lines] {
	const line = tokens.headSlice()
	return isKeyword(Kw.Construct, line.head()) ?
		[parseConstructor(line.tail()), tokens.tail()] :
		[null, tokens]
}

function parseConstructor(tokens: Tokens): Constructor {
	const {args, memberArgs, opRestArg, block} = funArgsAndBlock(tokens, false, true)
	const fun = new FunBlock(tokens.loc, args, opRestArg, block, {isThisFun: true, isDo: true})
	return new Constructor(tokens.loc, fun, memberArgs)
}
