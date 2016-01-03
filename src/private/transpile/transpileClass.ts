import {ClassBody, ClassExpression, MethodDefinition, MethodDefinitionConstructor} from 'esast/lib/Class'
import Expression, {ArrayExpression, AssignmentExpression, CallExpression, LiteralString,
	MemberExpressionPlain} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import Statement, {BlockStatement, ExpressionStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {caseOp, opIf, opMap} from 'op/Op'
import Class, {Constructor, Field} from '../ast/Class'
import {MethodImplLike} from '../ast/classTraitCommon'
import {Val} from '../ast/LineContent'
import {assert, cat, isEmpty} from '../util'
import {verifyResults} from './context'
import {IdFocus, IdSuper, LetLexicalThis, ReturnFocus, This} from './esast-constants'
import {transpileBlockDoWithLeadAndFollow} from './transpileBlock'
import transpileFun from './transpileFun'
import {transpileMethodToDefinition} from './transpileMethod'
import transpileVal from './transpileVal'
import {blockWrap, idForDeclareCached, loc, maybeWrapInCheckInstance, msCall, plainLet} from './util'

export function transpileClassNoLoc(_: Class): Expression {
	const {opFields, opSuperClass, traits, opComment, opDo, statics, opConstructor, methods, isRecord} = _

	const opName = opMap(verifyResults.opName(_), identifier)

	const methodAsts = cat<MethodDefinition>(
		statics.map(_ => transpileMethodToDefinition(_, true)),
		caseOp<Constructor, Op<MethodDefinitionConstructor>>(opConstructor,
			transpileConstructor,
			() => opMap(opFields, _ => defaultConstructor(_, opSuperClass !== null))),
		methods.map(_ => transpileMethodToDefinition(_, false)))

	const classExpr = new ClassExpression(opName,
		opMap(opSuperClass, transpileVal), new ClassBody(methodAsts))

	if (opDo === null && !isRecord && isEmpty(traits))
		return classExpr
	else {
		const lead = cat<Statement>(
			plainLet(IdFocus, classExpr),
			opMap(opFields, beRecord),
			traits.map(_ => new ExpressionStatement(msCall('traitDo', IdFocus, transpileVal(_)))))
		const block = caseOp(opDo,
			_ => transpileBlockDoWithLeadAndFollow(_.block, lead, ReturnFocus),
			() => new BlockStatement(cat(lead, ReturnFocus)))
		return blockWrap(block)
	}
}

function transpileConstructor(_: Constructor): MethodDefinitionConstructor {
	const {fun} = _
	// If there is a `super`, `this` will not be defined until then,
	// so must wait until then.
	// Otherwise, do it at the beginning.

	// This is never an arrow function because the function uses `this`.
	const funAst = <FunctionExpression> (verifyResults.constructorHasSuper(_) ?
		transpileFun(fun, [LetLexicalThis], true) :
		transpileFun(fun, constructorSetMembers(_)))
	return loc(_, new MethodDefinitionConstructor(funAst))
}

export function constructorSetMembers(constructor: Constructor): Array<Statement> {
	return constructor.memberArgs.map(_ =>
		loc(_, new ExpressionStatement(
			msCall('newProperty', This, new LiteralString(_.name), idForDeclareCached(_)))))
}

function beRecord(fields: Array<Field>): Statement {
	const fieldNames = new ArrayExpression(fields.map(_ => new LiteralString(_.name)))
	return new ExpressionStatement(msCall('beRecord', IdFocus, fieldNames))
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
