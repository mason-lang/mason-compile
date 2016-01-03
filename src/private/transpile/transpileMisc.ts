import {VariableDeclaration, VariableDeclarator} from 'esast/lib/Declaration'
import Expression, {LiteralString, NewExpression, SpreadElement} from 'esast/lib/Expression'
import Identifier from 'esast/lib/Identifier'
import {ThrowStatement} from 'esast/lib/Statement'
import {caseOp} from 'op/Op'
import {Arguments, Spread} from '../ast/Call'
import {Throw} from '../ast/errors'
import {AssignSingle, LocalDeclare} from '../ast/locals'
import MemberName from '../ast/MemberName'
import {GlobalError} from './esast-constants'
import transpileVal from './transpileVal'
import {doThrow, idForDeclareCached, loc, makeDeclarator} from './util'

//consider inlining some of these

//move somewhere!
//return : Pattern?
//remember to set loc!!!!!!!!!!
export function transpileLocalDeclare(_: LocalDeclare): Identifier {
	return new Identifier(idForDeclareCached(_).name)
}

export function transpileThrow(_: Throw): ThrowStatement {
	return loc(_, transpileThrowNoLoc(_))
}

//inline?
export function transpileThrowNoLoc(_: Throw): ThrowStatement {
	return caseOp(_.opThrown, doThrow,
		() => new ThrowStatement(new NewExpression(GlobalError, [LitStrThrow])))
}

//remember to set loc for spreads
//rename to transpileArguments
export function transpileArguments(args: Arguments): Array<Expression | SpreadElement> {
	return args.map(_ =>
		_ instanceof Spread ?
			new SpreadElement(transpileVal(_.spreaded)) :
			transpileVal(_))
}

//doc
export function transpileMemberName(_: MemberName): Expression {
	return typeof _ === 'string' ? new LiteralString(_) : transpileVal(_)
}

//use somewhere
const LitStrThrow = new LiteralString('An error occurred.')
