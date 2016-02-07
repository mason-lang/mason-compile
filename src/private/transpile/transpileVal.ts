import Expression, {ArrayExpression, UnaryExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralBoolean, LiteralNull, LiteralNumber, LiteralString} from 'esast/lib/Literal'
import ObjectExpression, {PropertyPlain} from 'esast/lib/ObjectExpression'
import {caseOp} from 'op/Op'
import Await from '../ast/Await'
import {BlockWrap} from '../ast/Block'
import Call, {New} from '../ast/Call'
import Case from '../ast/Case'
import Class, {SuperCall, SuperMember} from '../ast/Class'
import {Cond, Conditional} from '../ast/booleans'
import Del from '../ast/Del'
import {Except} from '../ast/errors'
import Fun from '../ast/Fun'
import {Val} from '../ast/LineContent'
import {LocalAccess} from '../ast/locals'
import {For, ForAsync, ForBag} from '../ast/Loop'
import Poly from '../ast/Poly'
import Quote, {MsRegExp, QuoteTagged} from '../ast/Quote'
import Switch from '../ast/Switch'
import Trait from '../ast/Trait'
import {BagSimple, InstanceOf, Lazy, Member, NumberLiteral, ObjSimple, Operator, Pipe, Range,
	SpecialVal, SpecialVals, Sub, UnaryOperator} from '../ast/Val'
import With from '../ast/With'
import YieldLike from '../ast/YieldLike'
import {verifyResults} from './context'
import {msCall} from './ms'
import {transpileAwaitNoLoc} from './transpileAwait'
import {transpileBlockVal} from './transpileBlock'
import {transpileConditionalValNoLoc, transpileCondNoLoc} from './transpileBooleans'
import {transpileCallNoLoc, transpileNewNoLoc} from './transpileCall'
import {transpileCaseValNoLoc} from './transpileCase'
import {transpileClassNoLoc, transpileSuperCallValNoLoc, transpileSuperMemberNoLoc
	} from './transpileClass'
import {transpileDelNoLoc} from './transpileDel'
import {transpileExceptValNoLoc} from './transpileErrors'
import {transpileFunNoLoc} from './transpileFun'
import {transpileLocalAccessNoLoc} from './transpileLocals'
import {transpileForAsyncValNoLoc, transpileForBagNoLoc, transpileForValNoLoc
	} from './transpileLoop'
import {transpileMember, transpileMemberNameToPropertyName} from './transpileMemberName'
import {transpileOperatorNoLoc, transpileUnaryOperatorNoLoc} from './transpileOperator'
import {transpilePolyNoLoc} from './transpilePoly'
import {transpileQuoteNoLoc, transpileQuoteTaggedNoLoc, transpileRegExpNoLoc
	} from './transpileQuote'
import {transpileSwitchValNoLoc} from './transpileSwitch'
import {transpileTraitNoLoc} from './transpileTrait'
import {transpileWithValNoLoc} from './transpileWith'
import {transpileYieldLikeNoLoc} from './transpileYieldLike'
import {callFocusFun, lazyWrap, loc} from './util'

export default function transpileVal(_: Val): Expression {
	return loc(_, transpileValNoLoc(_))
}

function transpileValNoLoc(_: Val): Expression {
	if (_ instanceof Await)
		return transpileAwaitNoLoc(_)

	else if (_ instanceof BagSimple)
		return new ArrayExpression(_.parts.map(transpileVal))

	else if (_ instanceof BlockWrap)
		return transpileBlockVal(_.block)

	else if (_ instanceof Call)
		return transpileCallNoLoc(_)

	else if (_ instanceof Case)
		return transpileCaseValNoLoc(_)

	else if (_ instanceof Class)
		return transpileClassNoLoc(_)

	else if (_ instanceof Cond)
		return transpileCondNoLoc(_)

	else if (_ instanceof Conditional)
		return transpileConditionalValNoLoc(_)

	else if (_ instanceof Del)
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

	else if (_ instanceof InstanceOf) {
		const {instance, type} = _
		// TODO:ES6
		// new BinaryExpression('instanceof', transpileVal(this.instance), transpileVal(this.type))
		return msCall('hasInstance', transpileVal(type), transpileVal(instance))

	} else if (_ instanceof Lazy)
		return lazyWrap(transpileVal(_.value))

	else if (_ instanceof LocalAccess)
		return transpileLocalAccessNoLoc(_)

	else if (_ instanceof Member) {
		const {object, name} = _
		return transpileMember(transpileVal(object), name)

	} else if (_ instanceof MsRegExp)
		return transpileRegExpNoLoc(_)

	else if (_ instanceof New)
		return transpileNewNoLoc(_)

	else if (_ instanceof NumberLiteral) {
		// Negative numbers are not part of ES spec.
		// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
		const value = Number(_.value)
		const lit = new LiteralNumber(Math.abs(value))
		const isPositive = value >= 0 && 1 / value !== -Infinity
		return isPositive ? lit : new UnaryExpression('-', lit)

	} else if (_ instanceof ObjSimple)
		return new ObjectExpression(_.pairs.map(({key, value}) =>
			new PropertyPlain(transpileMemberNameToPropertyName(key), transpileVal(value))))

	else if (_ instanceof Operator)
		return transpileOperatorNoLoc(_)

	else if (_ instanceof Pipe) {
		const {startValue, pipes} = _
		return pipes.reduce(
			(expr: Expression, pipe: Val) => callFocusFun(transpileVal(pipe), expr),
			transpileVal(startValue))

	} else if (_ instanceof Poly)
		return transpilePolyNoLoc(_)

	else if (_ instanceof Quote)
		return transpileQuoteNoLoc(_)

	else if (_ instanceof QuoteTagged)
		return transpileQuoteTaggedNoLoc(_)

	else if (_ instanceof Range) {
		const {start, opEnd, isExclusive} = _
		const endAst = caseOp(opEnd, transpileVal, () => globalInfinity)
		return msCall('range', transpileVal(start), endAst, new LiteralBoolean(isExclusive))

	} else if (_ instanceof SpecialVal)
		// Make new objects because we will assign `loc` to them.
		switch (_.kind) {
			case SpecialVals.False:
				return new LiteralBoolean(false)
			case SpecialVals.Name:
				return new LiteralString(verifyResults.name(_))
			case SpecialVals.Null:
				return new LiteralNull()
			case SpecialVals.True:
				return new LiteralBoolean(true)
			case SpecialVals.Undefined:
				return new UnaryExpression('void', litZero)
			default:
				throw new Error(String(_.kind))
		}

	else if (_ instanceof Sub) {
		const {subbed, args} = _
		return msCall('sub', transpileVal(subbed), ...args.map(transpileVal))

	} else if (_ instanceof SuperCall)
		return transpileSuperCallValNoLoc(_)

	else if (_ instanceof SuperMember)
		return transpileSuperMemberNoLoc(_)

	else if (_ instanceof Switch)
		return transpileSwitchValNoLoc(_)

	else if (_ instanceof Trait)
		return transpileTraitNoLoc(_)

	else if (_ instanceof UnaryOperator)
		return transpileUnaryOperatorNoLoc(_)

	else if (_ instanceof With)
		return transpileWithValNoLoc(_)

	else if (_ instanceof YieldLike)
		return transpileYieldLikeNoLoc(_)

	else
		// Should have handled every type.
		throw new Error(_.constructor.name)
}

const globalInfinity = new Identifier('Infinity')
const litZero = new LiteralNumber(0)
