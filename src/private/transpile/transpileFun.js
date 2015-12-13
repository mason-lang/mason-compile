import {ArrayExpression, ArrowFunctionExpression, BlockStatement, CallExpression,
	FunctionExpression, Identifier, Literal, ReturnStatement} from 'esast/dist/ast'
import {identifier, member} from 'esast/dist/util'
import {options} from '../context'
import {Funs} from '../MsAst'
import {cat, flatOpMap, opIf, opMap} from '../util'
import {DeclareLexicalThis} from './ast-constants'
import {verifyResults, withFunKind} from './context'
import {declare, msCall, opTypeCheckForLocalDeclare, t0, t2} from './util'

/*
leadStatements comes from constructor members
dontDeclareThis: applies if this is the fun for a Constructor,
which may declare `this` at a `super` call.
*/
export default function(leadStatements = null, dontDeclareThis = false) {
	return withFunKind(this.kind, () => {
		// TODO:ES6 use `...`f
		const nArgs = new Literal(this.args.length)
		const opDeclareRest = opMap(this.opRestArg, rest =>
			declare(rest, new CallExpression(ArraySliceCall, [IdArguments, nArgs])))
		const argChecks = opIf(options.includeChecks(), () =>
			flatOpMap(this.args, opTypeCheckForLocalDeclare))

		const opDeclareThis = opIf(this.opDeclareThis !== null && !dontDeclareThis, () =>
			DeclareLexicalThis)

		const lead = cat(opDeclareRest, opDeclareThis, argChecks, leadStatements)

		const body = () => t2(this.block, lead, this.opReturnType)
		const args = this.args.map(t0)
		const id = opMap(verifyResults.opName(this), identifier)

		switch (this.kind) {
			case Funs.Plain:
				// TODO:ES6 Should be able to use rest args in arrow function
				return id === null && this.opDeclareThis === null && opDeclareRest === null ?
					new ArrowFunctionExpression(args, body()) :
					new FunctionExpression(id, args, body())
			case Funs.Async: {
				const plainBody = t2(this.block, null, this.opReturnType)
				const genFunc = new FunctionExpression(null, [], plainBody, true)
				const ret = new ReturnStatement(msCall('async', genFunc))
				return new FunctionExpression(id, args, new BlockStatement(cat(lead, ret)))
			}
			case Funs.Generator:
				return new FunctionExpression(id, args, body(), true)
			default:
				throw new Error(this.kind)
		}
	})
}

const ArraySliceCall = member(member(new ArrayExpression([]), 'slice'), 'call')
const IdArguments = new Identifier('arguments')
