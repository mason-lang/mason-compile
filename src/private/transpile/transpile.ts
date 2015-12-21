import Node, {ArrayExpression, AssignmentExpression, CallExpression, ConditionalExpression, Expression, ExpressionStatement,
	Identifier, IfStatement, LiteralBoolean, LiteralNumber, LiteralRegExp, LiteralString, LogicalExpression, NewExpression, ObjectExpression, Program, PropertyPlain,
	ReturnStatement, SpreadElement, Statement, TaggedTemplateExpression, ThrowStatement, UnaryExpression,
	VariableDeclaration, YieldExpression} from 'esast/lib/ast'
import {identifier, member, propertyIdOrLiteral} from 'esast-create-util/lib/util'
import Op, {caseOp, opMap} from 'op/Op'
import MsAst, {AssignSingle, Constructor, Val, Fun, Logics, LocalDeclare, LocalDeclares, Module, ObjPair, Setters} from '../MsAst'
import * as MsAstTypes from '../MsAst'
import {cat, implementMany, tail} from '../util'
import VerifyResults from '../VerifyResults'
import {IdBuilt, IdFocus, IdLexicalThis, IdSuper, GlobalError, LitUndefined, SetLexicalThis
	} from './ast-constants'
import {setup, tearDown, verifyResults} from './context'
import transpileAssert from './transpileAssert'
import transpileBlock from './transpileBlock'
import transpileCase, {transpileCasePart} from './transpileCase'
import transpileClass, {constructorSetMembers, transpileConstructor} from './transpileClass'
import transpileExcept, {transpileCatch} from './transpileExcept'
import {transpileBreak, transpileFor, transpileForAsync, transpileForBag} from './transpileFor'
import transpileFun from './transpileFun'
import transpileModule, {exportNamedOrDefault} from './transpileModule'
import transpileQuotePlain from './transpileQuotePlain'
import {transpileSpecialDo, transpileSpecialVal} from './transpileSpecial'
import transpileSwitch, {transpileSwitchPart} from './transpileSwitch'
import transpileTrait, {transpileTraitDo} from './transpileTrait'
import {accessLocalDeclare, blockWrap, blockWrapIfBlock, callFocusFun, doThrow, focusFun,
	idForDeclareCached, lazyWrap, makeDeclarator, makeDestructureDeclarators,
	maybeWrapInCheckInstance, memberStringOrVal, msCall, msMember, plainLet, t0, t1, t3,
	transpileName} from './util'

/** Transform a [[MsAst]] into an esast. **/
export default function transpile(moduleExpression: Module, verifyResults: VerifyResults): Program {
	setup(verifyResults)
	const res = <any> t0(moduleExpression)
	tearDown()
	return res
}

implementMany(MsAstTypes, 'transpile', {
	Assert: transpileAssert,

	AssignSingle(valWrap: (_: Expression) => Expression): VariableDeclaration {
		const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value))
		return new VariableDeclaration('let', [makeDeclarator(this.assignee, val, false)])
	},

	// TODO:ES6 Just use native destructuring assign
	AssignDestructure(): VariableDeclaration {
		return new VariableDeclaration(
			'let',
			makeDestructureDeclarators(
				this.assignees,
				this.kind === LocalDeclares.Lazy,
				t0(this.value),
				false))
	},

	Await(): Expression {
		return new YieldExpression(t0(this.value), false)
	},

	BagEntry(): Expression {
		return msCall(this.isMany ? 'addMany' : 'add', IdBuilt, t0(this.value))
	},

	BagSimple(): Expression {
		return new ArrayExpression(this.parts.map(t0))
	},

	Block: transpileBlock,

	BlockWrap(): Expression {
		return blockWrap(t0(this.block))
	},

	Break: transpileBreak,

	Call(): Expression {
		return new CallExpression(t0(this.called), this.args.map(t0))
	},

	Case: transpileCase,
	CasePart: transpileCasePart,
	Catch: transpileCatch,
	Class: transpileClass,

	Cond(): Expression {
		return new ConditionalExpression(t0(this.test), t0(this.ifTrue), t0(this.ifFalse))
	},

	Conditional(): Expression | Statement {
		const test = t0(this.test)
		if (verifyResults.isStatement(this))
			return new IfStatement(
				this.isUnless ? new UnaryExpression('!', test) : test, t0(this.result))
		else {
			const result = msCall('some', blockWrapIfBlock(this.result))
			const none = msMember('None')
			const [then, _else] = this.isUnless ? [none, result] : [result, none]
			return new ConditionalExpression(test, then, _else)
		}
	},

	Constructor: transpileConstructor,

	Del(): Expression {
		return msCall('del', t0(this.subbed), ...this.args.map(t0))
	},

	Except: transpileExcept,
	For: transpileFor,
	ForAsync: transpileForAsync,
	ForBag: transpileForBag,
	Fun: transpileFun,

	GetterFun(): Expression {
		// _ => _.foo
		return focusFun(memberStringOrVal(IdFocus, this.name))
	},

	Ignore(): Array<Statement> {
		return []
	},

	InstanceOf(): Expression {
		// TODO:ES6 new BinaryExpression('instanceof', t0(this.instance), t0(this.type))
		return msCall('hasInstance', t0(this.type), t0(this.instance))
	},

	Lazy(): Expression {
		return lazyWrap(t0(this.value))
	},

	NumberLiteral(): Expression {
		// Negative numbers are not part of ES spec.
		// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
		const value = Number(this.value)
		const lit = new LiteralNumber(Math.abs(value))
		const isPositive = value >= 0 && 1 / value !== -Infinity
		return isPositive ? lit : new UnaryExpression('-', lit)
	},

	LocalAccess(): Expression {
		if (this.name === 'this')
			return IdLexicalThis
		else {
			const ld = verifyResults.localDeclareForAccess(this)
			// If ld missing, this is a builtin, and builtins are never lazy
			return ld === undefined ? identifier(this.name) : accessLocalDeclare(ld)
		}
	},

	LocalDeclare(): Expression {
		return new Identifier(idForDeclareCached(this).name)
	},

	LocalMutate(): Statement {
		return new ExpressionStatement(
			new AssignmentExpression('=', identifier(this.name), t0(this.value)))
	},

	Logic(): Expression {
		return tail(this.args).reduce<Expression>(
			(expr: Expression, arg: Val) =>
				new LogicalExpression(this.kind === Logics.And ? '&&' : '||', expr, t0(arg)),
			<Expression> t0(this.args[0]))
	},

	MapEntry(): Statement {
		return new ExpressionStatement(
			msCall('setSub', IdBuilt, t0(this.key), t0(this.val)))
	},

	Member(): Expression {
		return memberStringOrVal(t0(this.object), this.name)
	},

	MemberFun(): Expression {
		const name = transpileName(this.name)
		return caseOp(this.opObject,
			_ => msCall('methodBound', t0(_), name),
			() => msCall('methodUnbound', name))
	},

	MemberSet(): Statement {
		const obj = t0(this.object)
		const val = maybeWrapInCheckInstance(t0(this.value), this.opType, this.name)
		return new ExpressionStatement((() => {
			switch (this.kind) {
				case Setters.Init:
					return msCall('newProperty', obj, transpileName(this.name), val)
				case Setters.Mutate:
					return new AssignmentExpression('=', memberStringOrVal(obj, this.name), val)
				default:
					throw new Error()
			}
		})())
	},

	Method(): Expression {
		const name = new LiteralString(verifyResults.name(this))
		const args = this.fun.opRestArg === null ?
			new ArrayExpression(this.fun.args.map((arg: LocalDeclare) => {
				const name = new LiteralString(arg.name)
				return caseOp<Val, Expression>(arg.opType,
					_ => new ArrayExpression([name, t0(_)]),
					() => name)
			})) :
			LitUndefined
		const impl = this.fun instanceof Fun ? [t0(this.fun)] : []
		return msCall('method', name, args, ...impl)
	},

	Module: transpileModule,

	MsRegExp(): Expression {
		return this.parts.length === 0 ?
			new LiteralRegExp(new RegExp('', this.flags)) :
			this.parts.length === 1 && typeof this.parts[0] === 'string' ?
			new LiteralRegExp(new RegExp(this.parts[0].replace('\n', '\\n'), this.flags)) :
			msCall('regexp',
				new ArrayExpression(this.parts.map(transpileName)), new LiteralString(this.flags))
	},

	New(): Expression {
		return new NewExpression(t0(this.type), this.args.map(t0))
	},

	Not(): Expression {
		return new UnaryExpression('!', t0(this.arg))
	},

	ObjEntryAssign(): Statement | Array<Statement> {
		if (this.assign instanceof AssignSingle && !this.assign.assignee.isLazy) {
			const name = this.assign.assignee.name
			return t1(this.assign, (val: Expression): Statement =>
				verifyResults.isObjEntryExport(this) ?
					exportNamedOrDefault(val, name) :
					new ExpressionStatement(new AssignmentExpression('=', member(IdBuilt, name), val)))
		} else {
			const assigns = this.assign.allAssignees().map((_: LocalDeclare): Expression =>
				msCall('setLazy', IdBuilt, new LiteralString(_.name), idForDeclareCached(_)))
			return cat(<any> t0(this.assign), assigns)
		}
	},

	ObjEntryPlain(): Statement {
		const val = t0(this.value)
		return verifyResults.isObjEntryExport(this) ?
			// We've verified that for module export, this.name must be a string.
			exportNamedOrDefault(val, this.name) :
			new AssignmentExpression('=', memberStringOrVal(IdBuilt, this.name), val)
	},

	ObjSimple(): Expression {
		return new ObjectExpression(this.pairs.map((pair: ObjPair) =>
			new PropertyPlain(propertyIdOrLiteral(pair.key), t0(pair.value))))
	},

	Pass(): Statement {
		return new ExpressionStatement(t0(this.ignored))
	},

	Pipe(): Expression {
		return this.pipes.reduce(
			(expr: Expression, pipe: Val) => callFocusFun(t0(pipe), expr),
			t0(this.startValue))
	},

	QuotePlain: transpileQuotePlain,

	QuoteSimple(): Expression {
		return new LiteralString(this.value)
	},

	QuoteTaggedTemplate(): Expression {
		return new TaggedTemplateExpression(t0(this.tag), t0(this.quote))
	},

	Range(): Expression {
		const end = caseOp(this.end, t0, () => GlobalInfinity)
		return msCall('range', t0(this.start), end, new LiteralBoolean(this.isExclusive))
	},

	SetSub(): Statement {
		const getKind = () => {
			switch (this.kind) {
				case Setters.Init:
					return 'init'
				case Setters.Mutate:
					return 'mutate'
				default:
					throw new Error()
			}
		}
		const kind = getKind()
		return new ExpressionStatement(msCall(
			'setSub',
			t0(this.object),
			this.subbeds.length === 1 ? t0(this.subbeds[0]) : this.subbeds.map(t0),
			maybeWrapInCheckInstance(t0(this.value), this.opType, 'value'),
			new LiteralString(kind)))
	},

	SimpleFun(): Expression {
		return focusFun(t0(this.value))
	},

	SpecialDo: transpileSpecialDo,
	SpecialVal: transpileSpecialVal,

	Spread(): SpreadElement {
		return new SpreadElement(t0(this.spreaded))
	},

	Sub(): Expression {
		return msCall('sub', t0(this.subbed), ...this.args.map(t0))
	},

	SuperCall(): Expression | Array<Statement> {
		const args = this.args.map(t0)
		const method = verifyResults.superCallToMethod.get(this)

		if (method instanceof Constructor) {
			// super must appear as a statement, so OK to decalre `this`
			const call = new CallExpression(IdSuper, args)
			const memberSets = constructorSetMembers(method)
			return cat(call, memberSets, SetLexicalThis)
		} else
			return new CallExpression(memberStringOrVal(IdSuper, method.symbol), args)
	},

	SuperMember(): Expression {
		return memberStringOrVal(IdSuper, this.name)
	},

	Switch: transpileSwitch,
	SwitchPart: transpileSwitchPart,

	Throw(): Statement {
		return caseOp(this.opThrown,
			_ => doThrow(_),
			() => new ThrowStatement(new NewExpression(GlobalError, [LitStrThrow])))
	},

	Trait: transpileTrait,
	TraitDo: transpileTraitDo,

	With(): Expression {
		const idDeclare = idForDeclareCached(this.declare)
		const val = t0(this.value)
		const lead = plainLet(idDeclare, val)
		return verifyResults.isStatement(this) ?
			t1(this.block, lead) :
			blockWrap(t3(this.block, lead, null, new ReturnStatement(idDeclare)))
	},

	Yield(): Expression {
		return new YieldExpression(opMap(this.opValue, t0), false)
	},

	YieldTo(): Expression {
		return new YieldExpression(t0(this.value), true)
	}
})

const GlobalInfinity = new Identifier('Infinity')
const LitStrThrow = new LiteralString('An error occurred.')
