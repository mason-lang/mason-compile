import Expression, {ArrayExpression} from 'esast/lib/Expression'
import {LiteralString} from 'esast/lib/Literal'
import {caseOp} from 'op/Op'
import {FunBlock} from '../ast/Fun'
import {Val} from '../ast/LineContent'
import {LocalDeclare} from '../ast/locals'
import Poly from '../ast/Poly'
import {litUndefined} from './esast-constants'
import {verifyResults} from './context'
import {msCall} from './ms'
import {transpileFunBlock} from './transpileFun'
import transpileVal from './transpileVal'

export function transpilePolyNoLoc(_: Poly): Expression {
	const {value} = _
	const name = new LiteralString(verifyResults.name(_))
	const args = value.opRestArg === null ?
		new ArrayExpression(value.args.map((arg: LocalDeclare) => {
			const name = new LiteralString(arg.name)
			return caseOp<Val, Expression>(
				arg.opType,
				_ => new ArrayExpression([name, transpileVal(_)]),
				() => name)
		})) :
		litUndefined
	const impl = value instanceof FunBlock ? [transpileFunBlock(value)] : []
	return msCall('method', name, args, ...impl)
}
