import {ArrayExpression, AssignmentExpression, BlockStatement, CallExpression, ClassBody,
	ClassExpression, Expression, ExpressionStatement, FunctionExpression, Identifier, LiteralString, MemberExpressionPlain,
	MethodDefinitionConstructor, Statement} from 'esast/lib/ast'
import {identifier, member} from 'esast-create-util/lib/util'
import {caseOp, opIf, opMap} from 'op/Op'
import {Constructor, Val, Field, MethodImplLike} from '../MsAst'
import {cat, isEmpty} from '../util'
import {IdFocus, IdSuper, LetLexicalThis, ReturnFocus, This} from './ast-constants'
import {verifyResults} from './context'
import {transpileMethodToDefinition} from './transpileMethod'
import {blockWrap, idForDeclareCached, maybeWrapInCheckInstance, msCall, plainLet, t0, t1, t2, t3
	} from './util'

export default function transpileClass(): Expression {
	const opName = opMap(verifyResults.opName(this), identifier)

	const methods = cat(
		this.statics.map((_: MethodImplLike) => transpileMethodToDefinition(_, true)),
		caseOp(this.opConstructor, t0,
			() => opMap(this.opFields, (_: Array<Field>) =>
				defaultConstructor(_, this.opSuperClass !== null))),
		this.methods.map((_: MethodImplLike) => transpileMethodToDefinition(_, false)))

	const classExpr = new ClassExpression(opName,
		opMap(this.opSuperClass, t0), new ClassBody(methods))

	if (this.opDo === null && !this.isRecord && isEmpty(this.traits))
		return classExpr
	else {
		const lead = cat(
			plainLet(IdFocus, classExpr),
			opMap(this.opFields, beRecord),
			this.traits.map((_: Val) => msCall('traitDo', IdFocus, t0(_))))
		const block = caseOp(this.opDo,
			_ => t3(_.block, lead, null, ReturnFocus),
			() => new BlockStatement(cat(lead, ReturnFocus)))
		return blockWrap(block)
	}
}

export function transpileConstructor(): MethodDefinitionConstructor {
	// If there is a `super`, `this` will not be defined until then,
	// so must wait until then.
	// Otherwise, do it at the beginning.
	return new MethodDefinitionConstructor(verifyResults.constructorHasSuper(this) ?
		t2(this.fun, LetLexicalThis, true) :
		t1(this.fun, constructorSetMembers(this)))
}

export function constructorSetMembers(constructor: Constructor): Array<Statement> {
	return constructor.memberArgs.map(_ =>
		msCall('newProperty', This, new LiteralString(_.name), idForDeclareCached(_)))
}

function beRecord(fields: Array<Field>): Expression {
	const fieldNames = new ArrayExpression(fields.map(_ => new LiteralString(_.name)))
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
function defaultConstructor(fields: Array<Field>, classHasSuper: boolean): MethodDefinitionConstructor {
	const args = fields.map(_ => identifier(_.name))
	const opSuper = opIf(classHasSuper, () =>
		new ExpressionStatement(new CallExpression(IdSuper, [])))
	const fieldSetters = fields.map((_, i) =>
		new ExpressionStatement(new AssignmentExpression(
			'=',
			member(This, _.name),
			maybeWrapInCheckInstance(args[i], _.opType, _.name))))
	const body = new BlockStatement(cat(opSuper, fieldSetters, FreezeThis))
	return new MethodDefinitionConstructor(new FunctionExpression(null, args, body))
}
const FreezeThis = new ExpressionStatement(
	new CallExpression(
		new MemberExpressionPlain(new Identifier('Object'), new Identifier('freeze')),
		[This]))
