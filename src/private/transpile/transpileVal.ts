import Expression, {ArrayExpression, ConditionalExpression, LiteralBoolean, LiteralNumber, LiteralRegExp, LiteralString,
	LogicalExpression, NewExpression, TaggedTemplateExpression, UnaryExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import ObjectExpression, {PropertyPlain} from 'esast/lib/ObjectExpression'
import {ReturnStatement} from 'esast/lib/Statement'
import {identifier, propertyIdOrLiteral} from 'esast-create-util/lib/util'
import {caseOp} from 'op/Op'
import Await from '../ast/Await'
import {BlockWrap} from '../ast/Block'
import Call, {New} from '../ast/Call'
import Case from '../ast/Case'
import Class, {Constructor, SuperCall, SuperMember} from '../ast/Class'
import {Cond, Conditional, Logic, Logics, Not} from '../ast/booleans'
import Del from '../ast/Del'
import {Except} from '../ast/errors'
import Fun, {Funs, GetterFun, MemberFun, SimpleFun} from '../ast/Fun'
import LineContent, {isVal, Val} from '../ast/LineContent'
import {LocalAccess, LocalDeclare} from '../ast/locals'
import {For, ForAsync, ForBag} from '../ast/Loop'
import Method from '../ast/Method'
import {BagSimple, InstanceOf, Lazy, Member, NumberLiteral, MsRegExp, ObjSimple, Pipe, QuotePlain, QuoteSimple, QuoteTaggedTemplate, Range, SpecialVal, Sub} from '../ast/Val'
import Switch from '../ast/Switch'
import Trait from '../ast/Trait'
import With from '../ast/With'
import {Yield, YieldTo} from '../ast/Yield'
import {tail} from '../util'
import {IdFocus, IdLexicalThis, IdSuper, LitUndefined} from './esast-constants'
import {verifyResults} from './context'
import transpileBlock from './transpileBlock'
import {transpileCaseValNoLoc} from './transpileCase'
import {transpileClassNoLoc} from './transpileClass'
import transpileDo from './transpileDo'
import {transpileForAsyncValNoLoc, transpileForBagNoLoc, transpileForValNoLoc} from './transpileFor'
import {transpileExceptValNoLoc} from './transpileExcept'
import transpileFun, {transpileFunNoLoc} from './transpileFun'
import {transpileArguments, transpileMemberName} from './transpileMisc'
import transpileVal from './transpileVal'
import transpileQuotePlain, {transpileQuotePlainNoLoc} from './transpileQuotePlain'
import {transpileSpecialValNoLoc} from './transpileSpecial'
import {transpileSwitchValNoLoc} from './transpileSwitch'
import {transpileTraitNoLoc} from './transpileTrait'
import {superCallCall, transpileAwaitNoLoc, transpileCallNoLoc, transpileCondNoLoc, transpileDelNoLoc, transpileYieldNoLoc,
	transpileYieldToNoLoc, withParts} from './transpileX'
import {accessLocalDeclare, blockWrap, blockWrapIfBlock, callFocusFun, focusFun, lazyWrap, loc, memberStringOrVal, msCall,
	msMember} from './util'

//todo: since we split transpileDo/transpileVal, we can probably remove some settings of verifyResults.statements Set.

export default function transpileVal(_: Val): Expression {
	return loc(_, transpileValNoLoc(_))
}

function transpileValNoLoc(_: Val): Expression {
	if (_ instanceof Await)
		return transpileAwaitNoLoc(_)

	else if (_ instanceof BagSimple)
		return new ArrayExpression(_.parts.map(transpileVal))

	else if (_ instanceof BlockWrap)
		return blockWrap(transpileBlock(_.block))

	else if (_ instanceof Call)
		return transpileCallNoLoc(_)

	else if (_ instanceof Case)
		return transpileCaseValNoLoc(_)

	else if (_ instanceof Class)
		return transpileClassNoLoc(_)

	else if (_ instanceof Cond)
		return transpileCondNoLoc(_)

	else if (_ instanceof Conditional) {
		const {test, result, isUnless} = _
		const resultAst = msCall('some', blockWrapIfBlock(result))
		//constant
		const none = msMember('None')
		const [then, _else] = isUnless ? [none, resultAst] : [resultAst, none]
		return new ConditionalExpression(transpileVal(test), then, _else)

	} else if (_ instanceof Del)
		return transpileDelNoLoc(_)

	else if (_ instanceof Except)
		return transpileExceptValNoLoc(_)

	else if (_ instanceof For)
		return transpileForValNoLoc(_)

	else if (_ instanceof ForAsync)
		return transpileForAsyncValNoLoc(_)

	else if (_ instanceof ForBag)
		return transpileForBagNoLoc(_)

	else if (_ instanceof Fun)
		return transpileFunNoLoc(_)

	else if (_ instanceof GetterFun)
		// _ => _.foo
		return focusFun(memberStringOrVal(IdFocus, _.name))

	else if (_ instanceof InstanceOf) {
		const {instance, type} = _
		// TODO:ES6 new BinaryExpression('instanceof', transpileVal(this.instance), transpileVal(this.type))
		return msCall('hasInstance', transpileVal(type), transpileVal(instance))

	} else if (_ instanceof Lazy)
		return lazyWrap(transpileVal(_.value))

	else if (_ instanceof LocalAccess) {
		const {name} = _
		if (name === 'this')
			return new Identifier('_this')
		else {
			const ld = verifyResults.localDeclareForAccess(_)
			// If ld missing, this is a builtin, and builtins are never lazy
			return ld === undefined ? identifier(name) : accessLocalDeclare(ld)
		}

	} else if (_ instanceof Logic) {
		const {kind, args} = _
		return tail(args).reduce(
			(expr, arg) =>
				new LogicalExpression(kind === Logics.And ? '&&' : '||', expr, transpileVal(arg)),
			transpileVal(args[0]))

	} else if (_ instanceof Member) {
		const {object, name} = _
		return memberStringOrVal(transpileVal(object), name)

	} else if (_ instanceof MemberFun) {
		const {opObject, name} = _
		const nameAst = transpileMemberName(name)
		return caseOp(opObject,
			_ => msCall('methodBound', transpileVal(_), nameAst),
			() => msCall('methodUnbound', nameAst))

	} else if (_ instanceof Method) {
		const {fun} = _
		const name = new LiteralString(verifyResults.name(_))
		const args = fun.opRestArg === null ?
			new ArrayExpression(fun.args.map((arg: LocalDeclare) => {
				const name = new LiteralString(arg.name)
				//shouldn't need explicit types...
				return caseOp<Val, Expression>(arg.opType,
					_ => new ArrayExpression([name, transpileVal(_)]),
					() => name)
			})) :
			LitUndefined
		const impl = fun instanceof Fun ? [transpileFun(fun)] : []
		return msCall('method', name, args, ...impl)

	} else if (_ instanceof MsRegExp) {
		const {parts, flags} = _
		if (parts.length === 0)
			return new LiteralRegExp(new RegExp('', flags))
		else {
			const firstPart = parts[0]
			if (parts.length === 1 && typeof firstPart === 'string')
				//todo: why just the one replace????
				return new LiteralRegExp(new RegExp(firstPart.replace('\n', '\\n'), flags))
			else
				return msCall('regexp',
					new ArrayExpression(parts.map(transpileMemberName)), new LiteralString(flags))
		}
	} else if (_ instanceof New) {
		const {type, args} = _
		return new NewExpression(transpileVal(type), transpileArguments(args))

	} else if (_ instanceof Not)
		return new UnaryExpression('!', transpileVal(_.arg))

	else if (_ instanceof NumberLiteral) {
		// Negative numbers are not part of ES spec.
		// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
		const value = Number(_.value)
		const lit = new LiteralNumber(Math.abs(value))
		const isPositive = value >= 0 && 1 / value !== -Infinity
		return isPositive ? lit : new UnaryExpression('-', lit)

	} else if (_ instanceof ObjSimple)
		return new ObjectExpression(_.pairs.map(({key, value}) =>
			new PropertyPlain(propertyIdOrLiteral(key), transpileVal(value))))

	else if (_ instanceof Pipe) {
		const {startValue, pipes} = _
		return pipes.reduce(
			(expr: Expression, pipe: Val) => callFocusFun(transpileVal(pipe), expr),
			transpileVal(startValue))

	} else if (_ instanceof QuotePlain)
		return transpileQuotePlainNoLoc(_)

	else if (_ instanceof QuoteSimple)
		return new LiteralString(_.value)

	else if (_ instanceof QuoteTaggedTemplate) {
		const {tag, quote} = _
		return new TaggedTemplateExpression(transpileVal(tag), transpileQuotePlain(quote))

	} else if (_ instanceof Range) {
		const {start, opEnd, isExclusive} = _
		const endAst = caseOp(opEnd, transpileVal, () => GlobalInfinity)
		return msCall('range', transpileVal(start), endAst, new LiteralBoolean(isExclusive))

	} else if (_ instanceof SimpleFun)
		return focusFun(transpileVal(_.value))

	else if (_ instanceof SpecialVal)
		return transpileSpecialValNoLoc(_)

	else if (_ instanceof Sub) {
		const {subbed, args} = _
		return msCall('sub', transpileVal(subbed), ...args.map(transpileVal))

	} else if (_ instanceof SuperCall) {
		const method = verifyResults.superCallToMethod.get(_)
		if (method instanceof Constructor)
			//in constructor, can only appear as a statement
			throw new Error()
		else
			return superCallCall(_, method)

	} else if (_ instanceof SuperMember)
		return memberStringOrVal(IdSuper, _.name)

	else if (_ instanceof Switch)
		return transpileSwitchValNoLoc(_)

	else if (_ instanceof Trait)
		return transpileTraitNoLoc(_)

	else if (_ instanceof With) {
		const {idDeclare, val, lead} = withParts(_)
		return blockWrap(transpileBlock(_.block, lead, null, new ReturnStatement(idDeclare)))

	} else if (_ instanceof Yield)
		return transpileYieldNoLoc(_)

	else if (_ instanceof YieldTo)
		return transpileYieldToNoLoc(_)

	else
		//should have handled every type
		throw new Error()
}

const GlobalInfinity = new Identifier('Infinity')
