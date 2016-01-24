import Expression, {ConditionalExpression, UnaryExpression} from 'esast/lib/Expression'
import Statement, {ExpressionStatement, IfStatement} from 'esast/lib/Statement'
import Block from '../ast/Block'
import {Cond, Conditional} from '../ast/booleans'
import {msCall, msMember} from './ms'
import {blockWrapIfBlock, transpileBlockDo} from './transpileBlock'
import transpileVal from './transpileVal'

export function transpileConditionalDoNoLoc(_: Conditional): Statement {
	const {test, result, isUnless} = _
	const testAst = transpileVal(test)
	return new IfStatement(
		isUnless ? new UnaryExpression('!', testAst) : testAst,
		result instanceof Block ?
			transpileBlockDo(result) :
			new ExpressionStatement(transpileVal(result)))
}

export function transpileConditionalValNoLoc(_: Conditional): Expression {
	const {test, result, isUnless} = _
	const resultAst = msCall('some', blockWrapIfBlock(result))
	const [ifTrue, ifFalse] = isUnless ? [none, resultAst] : [resultAst, none]
	return new ConditionalExpression(transpileVal(test), ifTrue, ifFalse)
}
const none = msMember('None')

export function transpileCondNoLoc({test, ifTrue, ifFalse}: Cond): Expression {
	return new ConditionalExpression(transpileVal(test), transpileVal(ifTrue), transpileVal(ifFalse))
}
