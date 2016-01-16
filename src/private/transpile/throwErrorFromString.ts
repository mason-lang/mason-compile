import {NewExpression} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {LiteralString} from 'esast/lib/Literal'
import {ThrowStatement} from 'esast/lib/Statement'

export default function throwErrorFromString(message: string): ThrowStatement {
	// TODO:ES6 Should be able to use idError from esast-constants without recursive module problems
	return new ThrowStatement(new NewExpression(idError, [new LiteralString(message)]))
}

const idError = new Identifier('Error')
