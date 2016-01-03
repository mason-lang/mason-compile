// TODO:ES6 This should be able to be merged with util.ts

import {LiteralString, NewExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {ThrowStatement} from 'esast/lib/Statement'

export function throwErrorFromString(message: string): ThrowStatement {
	// TODO:ES6 Should be able to use IdError in ast-constants without recursive module problems
	return new ThrowStatement(new NewExpression(IdError, [new LiteralString(message)]))
}

const IdError = new Identifier('Error')
