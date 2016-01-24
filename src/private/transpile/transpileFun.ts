import Expression, {ArrayExpression, CallExpression} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {LiteralNumber} from 'esast/lib/Literal'
import Statement, {BlockStatement, ReturnStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {caseOp, flatMapOps, opIf, opMap} from 'op/Op'
import {compileOptions} from '../context'
import Fun, {FunBlock, FunGetter, FunMember, FunOperator, Funs, FunSimple, FunUnary
	} from '../ast/Fun'
import {cat} from '../util'
import {verifyResults, withFunKind} from './context'
import {declareLexicalThis, idFocus} from './esast-constants'
import {msCall} from './ms'
import transpileBlock from './transpileBlock'
import {makeDeclare, opTypeCheckForLocalDeclare, transpileLocalDeclare} from './transpileLocals'
import transpileMemberName, {transpileMember} from './transpileMemberName'
import {transpileFunOperatorNoLoc, transpileFunUnaryNoLoc} from './transpileOperator'
import transpileVal from './transpileVal'
import {loc} from './util'

export function transpileFunNoLoc(_: Fun): Expression {
	if (_ instanceof FunBlock)
		return transpileFunBlockNoLoc(_)

	else if (_ instanceof FunGetter)
		// _ => _.foo
		return focusFun(transpileMember(idFocus, _.name))

	else if (_ instanceof FunMember) {
		const {opObject, name} = _
		const nameAst = transpileMemberName(name)
		return caseOp(
			opObject,
			_ => msCall('methodBound', transpileVal(_), nameAst),
			() => msCall('methodUnbound', nameAst))

	} else if (_ instanceof FunOperator)
		return transpileFunOperatorNoLoc(_)

	else if (_ instanceof FunSimple)
		return focusFun(transpileVal(_.value))

	else if (_ instanceof FunUnary)
		return transpileFunUnaryNoLoc(_)

	else
		throw new Error(_.constructor.name)
}

export function transpileFunBlock(_: FunBlock, opts: TranspileFunBlockOptions = {})
	: ArrowFunctionExpression | FunctionExpression {
	return loc(_, transpileFunBlockNoLoc(_, opts))
}

/** Used by [[Constructor]]. */
export type TranspileFunBlockOptions = {
	/** Comes from constructor members. */
	leadStatements?: Op<Array<Statement>>,
	/** Applies if `this` is instead declared at a `super` call. */
	dontDeclareThis?: boolean
}

function transpileFunBlockNoLoc(_: FunBlock, opts: TranspileFunBlockOptions = {})
	: ArrowFunctionExpression | FunctionExpression {
	const {args, opRestArg, block, kind, opDeclareThis, opReturnType} = _
	const {leadStatements = null, dontDeclareThis = false} = opts
	return withFunKind(kind, () => {
		// TODO:ES6 use `...`f
		const nArgs = new LiteralNumber(args.length)
		const opDeclareRest = opMap(opRestArg, rest =>
			makeDeclare(rest, new CallExpression(arraySliceCall, [idArguments, nArgs])))
		const argChecks = opIf(compileOptions.checks, () =>
			flatMapOps(args, opTypeCheckForLocalDeclare))

		const opDeclareThisAst = opIf(opDeclareThis !== null && !dontDeclareThis, () =>
			declareLexicalThis)

		const lead = cat(opDeclareRest, opDeclareThisAst, argChecks, leadStatements)

		const body = () => transpileBlock(block, {lead, opReturnType})
		const argAsts = args.map(transpileLocalDeclare)
		const id = opMap(verifyResults.opName(_), identifier)

		switch (kind) {
			case Funs.Async: {
				const plainBody = transpileBlock(block, {opReturnType})
				const genFunc = new FunctionExpression(null, [], plainBody, {generator: true})
				const ret = new ReturnStatement(msCall('async', genFunc))
				return new FunctionExpression(id, argAsts, new BlockStatement(cat(lead, ret)))
			}
			case Funs.Generator:
				return new FunctionExpression(id, argAsts, body(), {generator: true})
			case Funs.Plain:
				// TODO:ES6 Should be able to use rest args in arrow function
				return id === null && opDeclareThis === null && opDeclareRest === null ?
					new ArrowFunctionExpression(argAsts, body()) :
					new FunctionExpression(id, argAsts, body())
			default:
				throw new Error(String(kind))
		}
	})
}

const arraySliceCall = member(member(new ArrayExpression([]), 'slice'), 'call')
const idArguments = new Identifier('arguments')

function focusFun(value: Expression): Expression {
	return new ArrowFunctionExpression([idFocus], value)
}
