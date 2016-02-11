import Expression, {CallExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {member} from 'esast-create-util/lib/util'

/**
Calls a helper function.
These are defined in the `msl` project, in `src/private/bootstrap.js` and by callers of `msDef`.
*/
export function msCall(name: string, ...args: Array<Expression>): Expression {
	return new CallExpression(member(idMs, name), args)
}

export function msMember(name: string): Expression {
	return member(idMs, name)
}

const idMs = new Identifier('_ms')
