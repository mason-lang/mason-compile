import {ArrayExpression, CallExpression, LiteralNumber} from 'esast/lib/Expression'
import {ArrowFunctionExpression, FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import Statement, {BlockStatement, ReturnStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {flatMapOps, opIf, opMap} from 'op/Op'
import {options} from '../context'
import Fun, {Funs} from '../ast/Fun'
import {cat} from '../util'
import {verifyResults, withFunKind} from './context'
import {DeclareLexicalThis} from './esast-constants'
import transpileBlock from './transpileBlock'
import {transpileLocalDeclare} from './transpileMisc'
import {loc, makeDeclare, msCall, opTypeCheckForLocalDeclare} from './util'

//who uses parameters?
export default function transpileFun(
		_: Fun,
		leadStatements: Op<Array<Statement>> = null,
		dontDeclareThis: boolean = false)
		: ArrowFunctionExpression | FunctionExpression {
	return loc(_, transpileFunNoLoc(_, leadStatements, dontDeclareThis))
}

//who uses parameters?
/*
leadStatements comes from constructor members
dontDeclareThis: applies if this is the fun for a Constructor,
which may declare `this` at a `super` call.
*/
export function transpileFunNoLoc(
		_: Fun,
		leadStatements: Op<Array<Statement>> = null,
		dontDeclareThis: boolean = false)
		: ArrowFunctionExpression | FunctionExpression {
	const {args, opRestArg, block, kind, opDeclareThis, isDo, opReturnType} = _

	return withFunKind(kind, () => {
		// TODO:ES6 use `...`f
		const nArgs = new LiteralNumber(args.length)
		const opDeclareRest = opMap(opRestArg, rest =>
			makeDeclare(rest, new CallExpression(ArraySliceCall, [IdArguments, nArgs])))
		const argChecks = opIf(options.checks, () =>
			flatMapOps(args, opTypeCheckForLocalDeclare))

		const opDeclareThisAst = opIf(opDeclareThis !== null && !dontDeclareThis, () =>
			DeclareLexicalThis)

		const lead = cat(opDeclareRest, opDeclareThisAst, argChecks, leadStatements)

		const body = () => transpileBlock(block, lead, opReturnType)
		const argAsts = args.map(transpileLocalDeclare)
		const id = opMap(verifyResults.opName(_), identifier)

		switch (kind) {
			case Funs.Plain:
				// TODO:ES6 Should be able to use rest args in arrow function
				return id === null && opDeclareThis === null && opDeclareRest === null ?
					new ArrowFunctionExpression(argAsts, body()) :
					new FunctionExpression(id, argAsts, body())
			case Funs.Async: {
				const plainBody = transpileBlock(block, null, opReturnType)
				const genFunc = new FunctionExpression(null, [], plainBody, {generator: true})
				const ret = new ReturnStatement(msCall('async', genFunc))
				return new FunctionExpression(id, argAsts, new BlockStatement(cat(lead, ret)))
			}
			case Funs.Generator:
				return new FunctionExpression(id, argAsts, body(), {generator: true})
			default:
				throw new Error(String(kind))
		}
	})
}

const ArraySliceCall = member(member(new ArrayExpression([]), 'slice'), 'call')
const IdArguments = new Identifier('arguments')
