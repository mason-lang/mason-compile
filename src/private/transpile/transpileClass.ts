import {ClassBody, ClassExpression, MethodDefinition, MethodDefinitionConstructor
	} from 'esast/lib/Class'
import Expression, {ArrayExpression, AssignmentExpression, CallExpression, MemberExpressionPlain
	} from 'esast/lib/Expression'
import {FunctionExpression} from 'esast/lib/Function'
import Identifier from 'esast/lib/Identifier'
import {LiteralString} from 'esast/lib/Literal'
import Statement, {BlockStatement, ExpressionStatement} from 'esast/lib/Statement'
import {identifier, member} from 'esast-create-util/lib/util'
import Op, {caseOp, opIf, opMap} from 'op/Op'
import Class, {Constructor, Field, SuperCall, SuperMember} from '../ast/Class'
import {MethodImplLike} from '../ast/classTraitCommon'
import {cat, isEmpty} from '../util'
import {verifyResults} from './context'
import {idFocus, letLexicalThis, returnFocus, setLexicalThis, esThis} from './esast-constants'
import {msCall} from './ms'
import {blockWrap, transpileBlockDoWithLeadAndFollow} from './transpileBlock'
import {transpileArguments} from './transpileCall'
import {transpileMethodToDefinition} from './transpileClassTraitCommon'
import {transpileFunBlock} from './transpileFun'
import {idForDeclareCached, plainLet} from './transpileLocals'
import {transpileMember} from './transpileMemberName'
import transpileVal from './transpileVal'
import {loc, maybeWrapInCheckInstance} from './util'

export function transpileClassNoLoc(_: Class): Expression {
	const {opFields, opSuperClass, traits, opDo, statics, opConstructor, methods, isRecord} = _

	const opName = opMap(verifyResults.opName(_), identifier)

	const methodAsts = cat<MethodDefinition>(
		statics.map(_ => transpileMethodToDefinition(_, true)),
		caseOp<Constructor, Op<MethodDefinitionConstructor>>(
			opConstructor,
			transpileConstructor,
			() => opMap(opFields, _ => defaultConstructor(_, opSuperClass !== null))),
		methods.map(_ => transpileMethodToDefinition(_, false)))

	const classExpr = new ClassExpression(
		opName,
		opMap(opSuperClass, transpileVal),
		new ClassBody(methodAsts))

	if (opDo === null && !isRecord && isEmpty(traits))
		return classExpr
	else {
		const lead = cat<Statement>(
			plainLet(idFocus, classExpr),
			opMap(opFields, beRecord),
			traits.map(_ => new ExpressionStatement(msCall('traitDo', idFocus, transpileVal(_)))))
		const block = caseOp(
			opDo,
			_ => transpileBlockDoWithLeadAndFollow(_.block, lead, returnFocus),
			() => new BlockStatement(cat(lead, returnFocus)))
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
		transpileFunBlock(fun, {leadStatements: [letLexicalThis], dontDeclareThis: true}) :
		transpileFunBlock(fun, {leadStatements: constructorSetMembers(_)}))
	return loc(_, new MethodDefinitionConstructor(funAst))
}

function constructorSetMembers(constructor: Constructor): Array<Statement> {
	return constructor.memberArgs.map(_ =>
		loc(_, new ExpressionStatement(
			msCall('newProperty', esThis, new LiteralString(_.name), idForDeclareCached(_)))))
}

function beRecord(fields: Array<Field>): Statement {
	const fieldNames = new ArrayExpression(fields.map(_ => new LiteralString(_.name)))
	return new ExpressionStatement(msCall('beRecord', idFocus, fieldNames))
}

/*
e.g. for `class x:Num y:Num`:
constructor(x, y) {
	this.x = _ms.checkInstance(Num, x)
	this.y = _ms.checkInstance(Num, y)
	Object.freeze(this)
}
*/
function defaultConstructor(fields: Array<Field>, classHasSuper: boolean)
	: MethodDefinitionConstructor {
	const args = fields.map(_ => identifier(_.name))
	const opSuper = opIf(classHasSuper, () =>
		new ExpressionStatement(new CallExpression(idSuper, [])))
	const fieldSetters = fields.map((_, i) =>
		new ExpressionStatement(new AssignmentExpression(
			'=',
			member(esThis, _.name),
			maybeWrapInCheckInstance(args[i], _.opType, _.name))))
	const body = new BlockStatement(cat(opSuper, fieldSetters, freezeThis))
	return new MethodDefinitionConstructor(new FunctionExpression(null, args, body))
}
const freezeThis = new ExpressionStatement(
	new CallExpression(
		new MemberExpressionPlain(new Identifier('Object'), new Identifier('freeze')),
		[esThis]))

export function transpileSuperCallDoNoLoc(_: SuperCall): Statement | Array<Statement> {
	const {args} = _
	const method = verifyResults.superCallToMethod.get(_)
	if (method instanceof Constructor) {
		// super must appear as a statement, so OK to declare `this`
		const call = new ExpressionStatement(new CallExpression(idSuper, args.map(transpileVal)))
		const memberSets = constructorSetMembers(method)
		return cat(call, memberSets, setLexicalThis)
	} else
		return new ExpressionStatement(superCall(_, method))
}

export function transpileSuperCallValNoLoc(_: SuperCall): Expression {
		const method = verifyResults.superCallToMethod.get(_)
		if (method instanceof Constructor)
			// In constructor, SuperCall was verified to only appear as a statement.
			throw new Error()
		else
			return superCall(_, method)
}

function superCall({args}: SuperCall, method: MethodImplLike): CallExpression {
	return new CallExpression(transpileMember(idSuper, method.symbol), transpileArguments(args))
}

export function transpileSuperMemberNoLoc({name}: SuperMember): Expression {
	return transpileMember(idSuper, name)
}

const idSuper = new Identifier('super')
