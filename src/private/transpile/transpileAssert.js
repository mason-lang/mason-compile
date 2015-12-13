import {IfStatement, UnaryExpression} from 'esast/dist/ast'
import {Call, Member} from '../MsAst'
import {ifElse} from '../util'
import {doThrow, msCall, t0, throwErrorFromString, transpileName} from './util'

export default function() {
	const failCond = () => {
		const cond = t0(this.condition)
		return this.negate ? cond : new UnaryExpression('!', cond)
	}

	return ifElse(this.opThrown,
		_ => new IfStatement(failCond(), doThrow(_)),
		() => {
			if (this.condition instanceof Call) {
				const call = this.condition
				const called = call.called
				const args = call.args.map(t0)
				return called instanceof Member ?
					msCall(
						this.negate ? 'assertNotMember' : 'assertMember',
						t0(called.object), transpileName(called.name), ...args) :
					msCall(this.negate ? 'assertNot' : 'assert', t0(called), ...args)
			} else
				return new IfStatement(failCond(), ThrowAssertFail)
		})
}

const ThrowAssertFail = throwErrorFromString('Assertion failed.')
