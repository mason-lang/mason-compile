import Expression, {CallExpression, NewExpression, SpreadElement} from 'esast/lib/Expression'
import Call, {Arguments, New, Spread} from '../ast/Call'
import transpileVal from './transpileVal'

export function transpileCallNoLoc({called, args}: Call): Expression {
	return new CallExpression(transpileVal(called), transpileArguments(args))
}

export function transpileNewNoLoc(_: New): Expression {
	const {type, args} = _
	return new NewExpression(transpileVal(type), transpileArguments(args))
}

export function transpileArguments(args: Arguments): Array<Expression | SpreadElement> {
	return args.map(_ =>
		_ instanceof Spread ?
			new SpreadElement(transpileVal(_.spreaded)) :
			transpileVal(_))
}
