import {ArrayExpression, AssignmentExpression, CallExpression, ConditionalExpression,
	Identifier, IfStatement, Literal, LogicalExpression, NewExpression, ObjectExpression, Property,
	ReturnStatement, SpreadElement, TaggedTemplateExpression, ThrowStatement, UnaryExpression,
	VariableDeclaration, YieldExpression} from 'esast/dist/ast'
import {identifier, member, propertyIdOrLiteral} from 'esast/dist/util'
import * as MsAstTypes from '../MsAst'
import {AssignSingle, Constructor, Fun, Logics, LocalDeclares, Setters} from '../MsAst'
import {cat, ifElse, implementMany, opMap, tail} from '../util'
import {IdBuilt, IdFocus, IdLexicalThis, IdSuper, GlobalError, SetLexicalThis
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
import transpileTrait from './transpileTrait'
import {accessLocalDeclare, blockWrap, blockWrapIfBlock, callFocusFun, doThrow, focusFun,
	idForDeclareCached, lazyWrap, makeDeclarator, makeDestructureDeclarators,
	maybeWrapInCheckInstance, memberStringOrVal, msCall, msMember, plainLet, t0, t1, t3,
	transpileName} from './util'

/** Transform a {@link MsAst} into an esast. **/
export default function transpile(moduleExpression, verifyResults) {
	setup(verifyResults)
	const res = t0(moduleExpression)
	tearDown()
	return res
}

implementMany(MsAstTypes, 'transpile', {
	Assert: transpileAssert,

	AssignSingle(valWrap) {
		const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value))
		return new VariableDeclaration('let', [makeDeclarator(this.assignee, val, false)])
	},

	// TODO:ES6 Just use native destructuring assign
	AssignDestructure() {
		return new VariableDeclaration(
			'let',
			makeDestructureDeclarators(
				this.assignees,
				this.kind() === LocalDeclares.Lazy,
				t0(this.value),
				false))
	},

	Await() {
		return new YieldExpression(t0(this.value), false)
	},

	BagEntry() {
		return msCall(this.isMany ? 'addMany' : 'add', IdBuilt, t0(this.value))
	},

	BagSimple() {
		return new ArrayExpression(this.parts.map(t0))
	},

	Block: transpileBlock,

	BlockWrap() {
		return blockWrap(t0(this.block))
	},

	Break: transpileBreak,

	Call() {
		return new CallExpression(t0(this.called), this.args.map(t0))
	},

	Case: transpileCase,
	CasePart: transpileCasePart,
	Catch: transpileCatch,
	Class: transpileClass,

	Cond() {
		return new ConditionalExpression(t0(this.test), t0(this.ifTrue), t0(this.ifFalse))
	},

	Conditional() {
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

	Del() {
		return msCall('del', t0(this.subbed), ...this.args.map(t0))
	},

	Except: transpileExcept,
	For: transpileFor,
	ForAsync: transpileForAsync,
	ForBag: transpileForBag,
	Fun: transpileFun,

	GetterFun() {
		// _ => _.foo
		return focusFun(memberStringOrVal(IdFocus, this.name))
	},

	Ignore() {
		return []
	},

	InstanceOf() {
		// TODO:ES6 new BinaryExpression('instanceof', t0(this.instance), t0(this.type))
		return msCall('hasInstance', t0(this.type), t0(this.instance))
	},

	Lazy() {
		return lazyWrap(t0(this.value))
	},

	NumberLiteral() {
		// Negative numbers are not part of ES spec.
		// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
		const value = Number(this.value)
		const lit = new Literal(Math.abs(value))
		const isPositive = value >= 0 && 1 / value !== -Infinity
		return isPositive ? lit : new UnaryExpression('-', lit)
	},

	LocalAccess() {
		if (this.name === 'this')
			return IdLexicalThis
		else {
			const ld = verifyResults.localDeclareForAccess(this)
			// If ld missing, this is a builtin, and builtins are never lazy
			return ld === undefined ? identifier(this.name) : accessLocalDeclare(ld)
		}
	},

	LocalDeclare() {
		return new Identifier(idForDeclareCached(this).name)
	},

	LocalMutate() {
		return new AssignmentExpression('=', identifier(this.name), t0(this.value))
	},

	Logic() {
		const op = this.kind === Logics.And ? '&&' : '||'
		return tail(this.args).reduce(
			(a, b) => new LogicalExpression(op, a, t0(b)),
			t0(this.args[0]))
	},

	MapEntry() {
		return msCall('setSub', IdBuilt, t0(this.key), t0(this.val))
	},

	Member() {
		return memberStringOrVal(t0(this.object), this.name)
	},

	MemberFun() {
		const name = transpileName(this.name)
		return ifElse(this.opObject,
			_ => msCall('methodBound', t0(_), name),
			() => msCall('methodUnbound', name))
	},

	MemberSet() {
		const obj = t0(this.object)
		const val = maybeWrapInCheckInstance(t0(this.value), this.opType, this.name)
		switch (this.kind) {
			case Setters.Init:
				return msCall('newProperty', obj, transpileName(this.name), val)
			case Setters.Mutate:
				return new AssignmentExpression('=', memberStringOrVal(obj, this.name), val)
			default:
				throw new Error()
		}
	},

	Method() {
		const name = new Literal(verifyResults.name(this))
		const args = this.fun.opRestArg === null ?
			new ArrayExpression(this.fun.args.map(arg => {
				const name = new Literal(arg.name)
				const opType = opMap(arg.opType, t0)
				return ifElse(opType,
					_ => new ArrayExpression([name, _]),
					() => name)
			})) :
			new UnaryExpression('void', new Literal(0))
		const impl = this.fun instanceof Fun ? [t0(this.fun)] : []
		return msCall('method', name, args, ...impl)
	},

	Module: transpileModule,

	MsRegExp() {
		return this.parts.length === 0 ?
			new Literal(new RegExp('', this.flags)) :
			this.parts.length === 1 && typeof this.parts[0] === 'string' ?
			new Literal(new RegExp(this.parts[0].replace('\n', '\\n'), this.flags)) :
			msCall('regexp',
				new ArrayExpression(this.parts.map(transpileName)), new Literal(this.flags))
	},

	New() {
		return new NewExpression(t0(this.type), this.args.map(t0))
	},

	Not() {
		return new UnaryExpression('!', t0(this.arg))
	},

	ObjEntryAssign() {
		if (this.assign instanceof AssignSingle && !this.assign.assignee.isLazy()) {
			const name = this.assign.assignee.name
			return t1(this.assign, val =>
				verifyResults.isObjEntryExport(this) ?
					exportNamedOrDefault(val, name) :
					new AssignmentExpression('=', member(IdBuilt, name), val))
		} else {
			const assigns = this.assign.allAssignees().map(_ =>
				msCall('setLazy', IdBuilt, new Literal(_.name), idForDeclareCached(_)))
			return cat(t0(this.assign), assigns)
		}
	},

	ObjEntryPlain() {
		const val = t0(this.value)
		return verifyResults.isObjEntryExport(this) ?
			// We've verified that for module export, this.name must be a string.
			exportNamedOrDefault(val, this.name) :
			new AssignmentExpression('=', memberStringOrVal(IdBuilt, this.name), val)
	},

	ObjSimple() {
		return new ObjectExpression(this.pairs.map(pair =>
			new Property('init', propertyIdOrLiteral(pair.key), t0(pair.value))))
	},

	Pass() {
		return t0(this.ignored)
	},

	Pipe() {
		return this.pipes.reduce((expr, pipe) => callFocusFun(t0(pipe), expr), t0(this.value))
	},

	QuotePlain: transpileQuotePlain,

	QuoteSimple() {
		return new Literal(this.name)
	},

	QuoteTaggedTemplate() {
		return new TaggedTemplateExpression(t0(this.tag), t0(this.quote))
	},

	Range() {
		const end = ifElse(this.end, t0, () => GlobalInfinity)
		return msCall('range', t0(this.start), end, new Literal(this.isExclusive))
	},

	SetSub() {
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
		return msCall(
			'setSub',
			t0(this.object),
			this.subbeds.length === 1 ? t0(this.subbeds[0]) : this.subbeds.map(t0),
			maybeWrapInCheckInstance(t0(this.value), this.opType, 'value'),
			new Literal(kind))
	},

	SimpleFun() {
		return focusFun(t0(this.value))
	},

	SpecialDo: transpileSpecialDo,
	SpecialVal: transpileSpecialVal,

	Spread() {
		return new SpreadElement(t0(this.spreaded))
	},

	Sub() {
		return msCall('sub', t0(this.subbed), ...this.args.map(t0))
	},

	SuperCall() {
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

	SuperMember() {
		return memberStringOrVal(IdSuper, this.name)
	},

	Switch: transpileSwitch,
	SwitchPart: transpileSwitchPart,

	Throw() {
		return ifElse(this.opThrown,
			_ => doThrow(_),
			() => new ThrowStatement(new NewExpression(GlobalError, [LitStrThrow])))
	},

	Trait: transpileTrait,

	With() {
		const idDeclare = idForDeclareCached(this.declare)
		const val = t0(this.value)
		const lead = plainLet(idDeclare, val)
		return verifyResults.isStatement(this) ?
			t1(this.block, lead) :
			blockWrap(t3(this.block, lead, null, new ReturnStatement(idDeclare)))
	},

	Yield() {
		return new YieldExpression(opMap(this.opValue, t0), false)
	},

	YieldTo() {
		return new YieldExpression(t0(this.value), true)
	}
})

const GlobalInfinity = new Identifier('Infinity')
const LitStrThrow = new Literal('An error occurred.')
