import {UnaryExpression} from 'esast/lib/Expression'
import Statement, {ExpressionStatement, IfStatement} from 'esast/lib/Statement'
import {caseOp} from 'op/Op'
import Call from '../ast/Call'
import {Assert} from '../ast/errors'
import {Member} from '../ast/Val'
import {transpileMemberName} from './transpileMisc'
import transpileVal from './transpileVal'
import {doThrow, msCall} from './util'
import {throwErrorFromString} from './util2'

export default function transpileAssertNoLoc({negate, condition, opThrown}: Assert): Statement {
	const failCond = () => {
		const cond = transpileVal(condition)
		return negate ? cond : new UnaryExpression('!', cond)
	}

	return caseOp(opThrown,
		_ => new IfStatement(failCond(), doThrow(_)),
		() => {
			if (condition instanceof Call) {
				const {called, args} = condition
				const argAsts = args.map(transpileVal)
				return new ExpressionStatement(called instanceof Member ?
					msCall(
						negate ? 'assertNotMember' : 'assertMember',
						transpileVal(called.object), transpileMemberName(called.name), ...argAsts) :
					msCall(negate ? 'assertNot' : 'assert', transpileVal(called), ...argAsts))
			} else
				return new IfStatement(failCond(), ThrowAssertFail)
		})
}

const ThrowAssertFail = throwErrorFromString('Assertion failed.')
