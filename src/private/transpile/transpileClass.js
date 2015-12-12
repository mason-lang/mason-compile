import {ArrayExpression, AssignmentExpression, BlockStatement, CallExpression, ClassBody,
	ClassExpression, ExpressionStatement, FunctionExpression, Identifier, Literal, MemberExpression,
	MethodDefinition} from 'esast/dist/ast'
import {identifier, member} from 'esast/dist/util'
import {cat, ifElse, isEmpty, opIf, opMap} from '../util'
import {IdFocus, IdSuper, LetLexicalThis, ReturnFocus, This} from './ast-constants'
import {verifyResults} from './context'
import {transpileMethodToDefinition} from './transpileMethod'
import {blockWrap, idForDeclareCached, maybeWrapInCheckInstance, msCall, plainLet, t0, t1, t2, t3
	} from './util'

export default function transpileClass() {
	const opName = opMap(verifyResults.opName(this), identifier)

	const methods = cat(
		this.statics.map(_ => transpileMethodToDefinition(_, true)),
		ifElse(this.opConstructor, t0,
			() => opMap(this.opFields, _ =>
				defaultConstructor(_, this.opSuperClass !== null))),
		this.methods.map(_ => transpileMethodToDefinition(_, false)))

	const classExpr = new ClassExpression(opName,
		opMap(this.opSuperClass, t0), new ClassBody(methods))

	if (this.opDo === null && !this.isRecord && isEmpty(this.kinds))
		return classExpr
	else {
		const lead = cat(
			plainLet(IdFocus, classExpr),
			opMap(this.opFields, beRecord),
			this.kinds.map(_ => msCall('kindDo', IdFocus, t0(_))))
		const block = ifElse(this.opDo,
			_ => t3(_.block, lead, null, ReturnFocus),
			() => new BlockStatement(cat(lead, ReturnFocus)))
		return blockWrap(block)
	}
}

export function transpileConstructor() {
	// If there is a `super`, `this` will not be defined until then,
	// so must wait until then.
	// Otherwise, do it at the beginning.
	return MethodDefinition.constructor(verifyResults.constructorHasSuper(this) ?
		t2(this.fun, LetLexicalThis, true) :
		t1(this.fun, constructorSetMembers(this)))
}

export function constructorSetMembers(constructor) {
	return constructor.memberArgs.map(_ =>
		msCall('newProperty', This, new Literal(_.name), idForDeclareCached(_)))
}

function beRecord(fields) {
	const fieldNames = new ArrayExpression(fields.map(_ => new Literal(_.name)))
	return msCall('beRecord', IdFocus, fieldNames)
}

/*
e.g. for `class x:Num y:Num`:
constructor(x, y) {
	this.x = _ms.checkInstance(Num, x)
	this.y = _ms.checkInstance(Num, y)
	Object.freeze(this)
}
*/
function defaultConstructor(fields, classHasSuper) {
	const args = fields.map(_ => identifier(_.name))
	const opSuper = opIf(classHasSuper, () =>
		new CallExpression(IdSuper, []))
	const fieldSetters = fields.map((_, i) =>
		new AssignmentExpression(
			'=',
			member(This, _.name),
			maybeWrapInCheckInstance(args[i], _.opType, _.name)))
	const body = new BlockStatement(cat(opSuper, fieldSetters, FreezeThis))
	return MethodDefinition.constructor(new FunctionExpression(null, args, body))
}
const FreezeThis = new ExpressionStatement(
	new CallExpression(
		new MemberExpression(new Identifier('Object'), new Identifier('freeze')),
		[This]))
