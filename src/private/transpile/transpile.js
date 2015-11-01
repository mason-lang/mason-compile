import {ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, BreakStatement, CallExpression, CatchClause, ClassBody, ClassExpression,
	ConditionalExpression, DebuggerStatement, ForOfStatement, ForStatement, FunctionExpression,
	Identifier, IfStatement, Literal, LogicalExpression, MemberExpression, MethodDefinition,
	NewExpression, ObjectExpression, Property, ReturnStatement, SpreadElement, SwitchCase,
	SwitchStatement, TaggedTemplateExpression, TemplateElement, TemplateLiteral, ThisExpression,
	ThrowStatement, TryStatement, VariableDeclaration, UnaryExpression, VariableDeclarator,
	YieldExpression} from 'esast/dist/ast'
import {functionExpressionThunk, identifier, member, propertyIdOrLiteral} from 'esast/dist/util'
import {options} from '../context'
import * as MsAstTypes from '../MsAst'
import {AssignSingle, Call, Constructor, Funs, Logics, Member, LocalDeclares, Pattern, Setters,
	SpecialDos, SpecialVals, SwitchDoPart, QuoteAbstract} from '../MsAst'
import {assert, cat, flatMap, flatOpMap, ifElse, implementMany, opIf, opMap, tail} from '../util'
import {ArraySliceCall, DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj, DeclareLexicalThis,
	ExportsDefault, IdArguments, IdBuilt, IdExports, IdExtract, IdFocus, IdLexicalThis, IdSuper,
	GlobalError, GlobalInfinity, LitEmptyString, LitNull, LitStrThrow, LitZero, ReturnBuilt,
	SwitchCaseNoMatch, ThrowAssertFail, ThrowNoCaseMatch} from './ast-constants'
import transpileModule from './transpileModule'
import {accessLocalDeclare, declare, doThrow, getMember, idForDeclareCached, lazyWrap,
	makeDeclarator, maybeWrapInCheckContains, memberStringOrVal, msCall, msMember,
	opTypeCheckForLocalDeclare, t0, t1, t2, t3, tLines, transpileName} from './util'

export let verifyResults
// isInGenerator means we are in an async or generator function.
let isInGenerator, isInConstructor
let nextDestructuredId

/** Transform a {@link MsAst} into an esast. **/
export default function transpile(moduleExpression, _verifyResults) {
	verifyResults = _verifyResults
	isInGenerator = false
	isInConstructor = false
	nextDestructuredId = 0
	const res = t0(moduleExpression)
	// Release for garbage collection.
	verifyResults = null
	return res
}

implementMany(MsAstTypes, 'transpile', {
	Assert() {
		const failCond = () => {
			const cond = t0(this.condition)
			return this.negate ? cond : new UnaryExpression('!', cond)
		}

		return ifElse(this.opThrown,
			_ => new IfStatement(failCond(), doThrow(_)),
			() => {
				if (this.condition instanceof Call) {
					const call = this.condition
					const called = call.called
					const args = call.args.map(t0)
					if (called instanceof Member) {
						const ass = this.negate ? 'assertNotMember' : 'assertMember'
						return msCall(ass, t0(called.object), transpileName(called.name), ...args)
					} else {
						const ass = this.negate ? 'assertNot' : 'assert'
						return msCall(ass, t0(called), ...args)
					}
				} else
					return new IfStatement(failCond(), ThrowAssertFail)
			})
	},

	AssignSingle(valWrap) {
		const val = valWrap === undefined ? t0(this.value) : valWrap(t0(this.value))
		const declare = makeDeclarator(this.assignee, val, false)
		return new VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [declare])
	},
	// TODO:ES6 Just use native destructuring assign
	AssignDestructure() {
		return new VariableDeclaration(
			this.kind() === LocalDeclares.Mutable ? 'let' : 'const',
			makeDestructureDeclarators(
				this.assignees,
				this.kind() === LocalDeclares.Lazy,
				t0(this.value),
				false))
	},

	BagEntry() { return msCall('add', IdBuilt, t0(this.value)) },

	BagEntryMany() { return msCall('addMany', IdBuilt, t0(this.value)) },

	BagSimple() { return new ArrayExpression(this.parts.map(t0)) },

	BlockDo(lead=null, opReturnType=null, follow=null) {
		assert(opReturnType === null)
		return new BlockStatement(cat(lead, tLines(this.lines), follow))
	},

	BlockValThrow(lead=null, _opReturnType) {
		return new BlockStatement(cat(lead, tLines(this.lines), t0(this.throw)))
	},

	BlockValReturn(lead=null, opReturnType=null) {
		return transpileBlock(t0(this.returned), tLines(this.lines), lead, opReturnType)
	},

	BlockBag(lead=null, opReturnType=null) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltBag, tLines(this.lines)),
			lead, opReturnType)
	},

	BlockObj(lead=null, opReturnType=null) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltObj, tLines(this.lines)),
			lead, opReturnType)
	},

	BlockMap(lead=null, opReturnType=null) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltMap, tLines(this.lines)),
			lead, opReturnType)
	},

	BlockWrap() {
		return blockWrap(t0(this.block))
	},

	Break() {
		return new BreakStatement()
	},

	BreakWithVal() {
		return new ReturnStatement(t0(this.value))
	},

	Call() {
		return new CallExpression(t0(this.called), this.args.map(t0))
	},

	CaseDo() {
		const body = caseBody(this.parts, this.opElse)
		return ifElse(this.opCased, _ => new BlockStatement([t0(_), body]), () => body)
	},
	CaseVal() {
		const body = caseBody(this.parts, this.opElse)
		const block = ifElse(this.opCased, _ => [t0(_), body], () => [body])
		return blockWrap(new BlockStatement(block))
	},
	CaseDoPart: casePart,
	CaseValPart: casePart,

	Class() {
		const methods = cat(
			this.statics.map(_ => t1(_, true)),
			opMap(this.opConstructor, t0),
			this.methods.map(_ => t1(_, false)))
		const opName = opMap(verifyResults.opName(this), identifier)
		const classExpr = new ClassExpression(
			opName,
			opMap(this.opSuperClass, t0), new ClassBody(methods))

		return ifElse(this.opDo, _ => t1(_, classExpr), () => classExpr)
	},

	ClassDo(classExpr) {
		const lead = new VariableDeclaration('const', [
			new VariableDeclarator(t0(this.declareFocus), classExpr)])
		const ret = new ReturnStatement(t0(this.declareFocus))
		const block = t3(this.block, lead, null, ret)
		return blockWrap(block)
	},

	Cond() {
		return new ConditionalExpression(t0(this.test), t0(this.ifTrue), t0(this.ifFalse))
	},

	ConditionalDo() {
		const test = t0(this.test)
		return new IfStatement(
			this.isUnless ? new UnaryExpression('!', test) : test,
			t0(this.result))
	},

	ConditionalVal() {
		const test = t0(this.test)
		const result = msCall('some', blockWrap(t0(this.result)))
		return this.isUnless ?
			new ConditionalExpression(test, msMember('None'), result) :
			new ConditionalExpression(test, result, msMember('None'))
	},

	Constructor() {
		isInConstructor = true

		// If there is a `super!`, `this` will not be defined until then, so must wait until then.
		// Otherwise, do it at the beginning.
		const body = verifyResults.constructorToSuper.has(this) ?
			t0(this.fun) :
			t1(this.fun, constructorSetMembers(this))

		const res = MethodDefinition.constructor(body)
		isInConstructor = false
		return res
	},

	Catch() {
		return new CatchClause(t0(this.caught), t0(this.block))
	},

	ExceptDo() { return transpileExcept(this) },
	ExceptVal() { return blockWrap(new BlockStatement([transpileExcept(this)])) },

	ForDo() { return forLoop(this.opIteratee, this.block) },

	ForBag() {
		return blockWrap(new BlockStatement([
			DeclareBuiltBag,
			forLoop(this.opIteratee, this.block),
			ReturnBuilt
		]))
	},

	ForVal() {
		return blockWrap(new BlockStatement([forLoop(this.opIteratee, this.block)]))
	},

	// leadStatements comes from constructor members
	Fun(leadStatements=null) {
		const isGeneratorFun = this.kind !== Funs.Plain
		const oldInGenerator = isInGenerator
		isInGenerator = isGeneratorFun

		// TODO:ES6 use `...`f
		const nArgs = new Literal(this.args.length)
		const opDeclareRest = opMap(this.opRestArg, rest =>
			declare(rest, new CallExpression(ArraySliceCall, [IdArguments, nArgs])))
		const argChecks = opIf(options.includeChecks(), () =>
			flatOpMap(this.args, opTypeCheckForLocalDeclare))

		const opDeclareThis =
			opIf(!isInConstructor && this.opDeclareThis != null, () => DeclareLexicalThis)

		const lead = cat(leadStatements, opDeclareThis, opDeclareRest, argChecks)

		const body =() => t2(this.block, lead, this.opReturnType)
		const args = this.args.map(t0)
		const id = opMap(verifyResults.opName(this), identifier)

		try {
			switch (this.kind) {
				case Funs.Plain:
					// TODO:ES6 Should be able to use rest args in arrow function
					if (id === null && this.opDeclareThis === null && opDeclareRest === null)
						return new ArrowFunctionExpression(args, body())
					else
						return new FunctionExpression(id, args, body())
				case Funs.Async: {
					const plainBody = t2(this.block, null, this.opReturnType)
					const genFunc = new FunctionExpression(id, [], plainBody, true)
					const ret = new ReturnStatement(msCall('async', genFunc))
					return new FunctionExpression(id, args, new BlockStatement(cat(lead, ret)))
				}
				case Funs.Generator:
					return new FunctionExpression(id, args, body(), true)
				default:
					throw new Error(this.kind)
			}
		} finally {
			isInGenerator = oldInGenerator
		}
	},

	Ignore() {
		return []
	},

	Lazy() {
		return lazyWrap(t0(this.value))
	},

	MethodImpl(isStatic) {
		const value = t0(this.fun)
		assert(value.id == null)
		// Since the Fun should have opDeclareThis, it will never be an ArrowFunctionExpression.
		assert(value instanceof FunctionExpression)

		const {key, computed} = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'method', isStatic, computed)
	},
	MethodGetter(isStatic) {
		const value = new FunctionExpression(null, [], t1(this.block, DeclareLexicalThis))
		const {key, computed} = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'get', isStatic, computed)
	},
	MethodSetter(isStatic) {
		const value = new FunctionExpression(null, [IdFocus], t1(this.block, DeclareLexicalThis))
		const {key, computed} = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'set', isStatic, computed)
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
			return isInConstructor ? new ThisExpression() : IdLexicalThis
		else {
			const ld = verifyResults.localDeclareForAccess(this)
			// If ld missing, this is a builtin, and builtins are never lazy
			return ld === undefined ? identifier(this.name) : accessLocalDeclare(ld)
		}
	},

	LocalDeclare() { return new Identifier(idForDeclareCached(this).name) },

	LocalMutate() {
		return new AssignmentExpression('=', identifier(this.name), t0(this.value))
	},

	Logic() {
		const op = this.kind === Logics.And ? '&&' : '||'
		return tail(this.args).reduce((a, b) =>
			new LogicalExpression(op, a, t0(b)), t0(this.args[0]))
	},

	MapEntry() { return msCall('setSub', IdBuilt, t0(this.key), t0(this.val)) },

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
		const val = maybeWrapInCheckContains(t0(this.value), this.opType, this.name)
		switch (this.kind) {
			case Setters.Init:
				return msCall('newProperty', obj, transpileName(this.name), val)
			case Setters.InitMutable:
				return msCall('newMutableProperty', obj, transpileName(this.name), val)
			case Setters.Mutate:
				return new AssignmentExpression('=', memberStringOrVal(obj, this.name), val)
			default: throw new Error()
		}
	},

	Module: transpileModule,

	ModuleExportNamed() {
		return t1(this.assign, val =>
			new AssignmentExpression('=', member(IdExports, this.assign.assignee.name), val))
	},

	ModuleExportDefault() {
		return t1(this.assign, val => new AssignmentExpression('=', ExportsDefault, val))
	},

	New() {
		return new NewExpression(t0(this.type), this.args.map(t0))
	},

	Not() { return new UnaryExpression('!', t0(this.arg)) },

	ObjEntryAssign() {
		return this.assign instanceof AssignSingle && !this.assign.assignee.isLazy() ?
			t1(this.assign, val =>
				new AssignmentExpression('=', member(IdBuilt, this.assign.assignee.name), val)) :
			cat(
				t0(this.assign),
				this.assign.allAssignees().map(_ =>
					msCall('setLazy', IdBuilt, new Literal(_.name), idForDeclareCached(_))))
	},

	ObjEntryPlain() {
		return new AssignmentExpression('=', memberStringOrVal(IdBuilt, this.name), t0(this.value))
	},

	ObjSimple() {
		return new ObjectExpression(this.pairs.map(pair =>
			new Property('init', propertyIdOrLiteral(pair.key), t0(pair.value))))
	},

	GetterFun() {
		// _ => _.foo
		return new ArrowFunctionExpression([IdFocus], memberStringOrVal(IdFocus, this.name))
	},

	QuotePlain() {
		if (this.parts.length === 0)
			return LitEmptyString
		else {
			const quasis = [], expressions = []

			// TemplateLiteral must start with a TemplateElement
			if (typeof this.parts[0] !== 'string')
				quasis.push(TemplateElement.empty)

			for (let part of this.parts)
				if (typeof part === 'string')
					quasis.push(TemplateElement.forRawString(part))
				else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length)
						quasis.push(TemplateElement.empty)
					expressions.push(t0(part))
				}

			// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
			if (quasis.length === expressions.length)
				quasis.push(TemplateElement.empty)

			return new TemplateLiteral(quasis, expressions)
		}
	},

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
				case Setters.InitMutable:
					return 'init-mutable'
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
			maybeWrapInCheckContains(t0(this.value), this.opType, 'value'),
			new Literal(kind))
	},

	SpecialDo() {
		switch (this.kind) {
			case SpecialDos.Debugger: return new DebuggerStatement()
			default: throw new Error(this.kind)
		}
	},

	SpecialVal() {
		// Make new objects because we will assign `loc` to them.
		switch (this.kind) {
			case SpecialVals.Contains:
				return msMember('contains')
			case SpecialVals.DelSub:
				return msMember('delSub')
			case SpecialVals.False:
				return new Literal(false)
			case SpecialVals.Name:
				return new Literal(verifyResults.name(this))
			case SpecialVals.Null:
				return new Literal(null)
			case SpecialVals.SetSub:
				return msMember('setSub')
			case SpecialVals.Sub:
				return msMember('sub')
			case SpecialVals.True:
				return new Literal(true)
			case SpecialVals.Undefined:
				return new UnaryExpression('void', LitZero)
			default:
				throw new Error(this.kind)
		}
	},

	Spread() {
		return new SpreadElement(t0(this.spreaded))
	},

	SuperCall: superCall,
	SuperCallDo: superCall,
	SuperMember() {
		return memberStringOrVal(IdSuper, this.name)
	},

	SwitchDo() { return transpileSwitch(this) },
	SwitchVal() { return blockWrap(new BlockStatement([transpileSwitch(this)])) },
	SwitchDoPart: switchPart,
	SwitchValPart: switchPart,

	Throw() {
		return ifElse(this.opThrown,
			_ => doThrow(_),
			() => new ThrowStatement(new NewExpression(GlobalError, [LitStrThrow])))
	},

	With() {
		const idDeclare = idForDeclareCached(this.declare)
		const block = t3(this.block, null, null, new ReturnStatement(idDeclare))
		const fun = isInGenerator ?
			new FunctionExpression(null, [idDeclare], block, true) :
			new ArrowFunctionExpression([idDeclare], block)
		const call = new CallExpression(fun, [t0(this.value)])
		return isInGenerator ? new YieldExpression(call, true) : call
	},

	Yield() { return new YieldExpression(opMap(this.opYielded, t0), false) },

	YieldTo() { return new YieldExpression(t0(this.yieldedTo), true) }
})

// Shared implementations

function casePart(alternate) {
	if (this.test instanceof Pattern) {
		const {type, patterned, locals} = this.test
		const decl = new VariableDeclaration('const', [
			new VariableDeclarator(IdExtract, msCall('extract', t0(type), t0(patterned)))])
		const test = new BinaryExpression('!==', IdExtract, LitNull)
		const extract = new VariableDeclaration('const', locals.map((_, idx) =>
			new VariableDeclarator(
				idForDeclareCached(_),
				new MemberExpression(IdExtract, new Literal(idx)))))
		const res = t1(this.result, extract)
		return new BlockStatement([decl, new IfStatement(test, res, alternate)])
	} else
		// alternate written to by `caseBody`.
		return new IfStatement(t0(this.test), t0(this.result), alternate)
}

function superCall() {
	const args = this.args.map(t0)
	const method = verifyResults.superCallToMethod.get(this)

	if (method instanceof Constructor) {
		const call = new CallExpression(IdSuper, args)
		const memberSets = constructorSetMembers(method)
		return cat(call, memberSets)
	} else
		return new CallExpression(memberStringOrVal(IdSuper, method.symbol), args)
}

function switchPart() {
	const follow = opIf(this instanceof SwitchDoPart, () => new BreakStatement)
	/*
	We could just pass block.body for the switch lines, but instead
	enclose the body of the switch case in curly braces to ensure a new scope.
	That way this code works:
		switch (0) {
			case 0: {
				const a = 0
				return a
			}
			default: {
				// Without curly braces this would conflict with the other `a`.
				const a = 1
				a
			}
		}
	*/
	const block = t3(this.result, null, null, follow)
	// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
	const x = []
	for (let i = 0; i < this.values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		x.push(new SwitchCase(t0(this.values[i]), []))
	x.push(new SwitchCase(t0(this.values[this.values.length - 1]), [block]))
	return x
}

// Functions specific to certain expressions

// Wraps a block (with `return` statements in it) in an IIFE.
function blockWrap(block) {
	const invoke = new CallExpression(functionExpressionThunk(block, isInGenerator), [])
	return isInGenerator ? new YieldExpression(invoke, true) : invoke
}

function caseBody(parts, opElse) {
	let acc = ifElse(opElse, t0, () => ThrowNoCaseMatch)
	for (let i = parts.length - 1; i >= 0; i = i - 1)
		acc = t1(parts[i], acc)
	return acc
}

function constructorSetMembers(constructor) {
	return constructor.memberArgs.map(_ =>
		msCall('newProperty', new ThisExpression(), new Literal(_.name), idForDeclareCached(_)))
}

function forLoop(opIteratee, block) {
	return ifElse(opIteratee,
		({element, bag}) => {
			const declare = new VariableDeclaration('let',
				[new VariableDeclarator(t0(element))])
			return new ForOfStatement(declare, t0(bag), t0(block))
		},
		() => new ForStatement(null, null, null, t0(block)))
}

function methodKeyComputed(symbol) {
	if (typeof symbol === 'string')
		return {key: propertyIdOrLiteral(symbol), computed: false}
	else {
		const key = symbol instanceof QuoteAbstract ? t0(symbol) : msCall('symbol', t0(symbol))
		return {key, computed: true}
	}
}

function transpileBlock(returned, lines, lead, opReturnType) {
	const fin = new ReturnStatement(
		maybeWrapInCheckContains(returned, opReturnType, 'returned value'))
	return new BlockStatement(cat(lead, lines, fin))
}

function transpileExcept(except) {
	return new TryStatement(
		t0(except.try),
		opMap(except.catch, t0),
		opMap(except.finally, t0))
}

function transpileSwitch(_) {
	const parts = flatMap(_.parts, t0)
	parts.push(ifElse(_.opElse,
		_ => new SwitchCase(undefined, t0(_).body),
		() => SwitchCaseNoMatch))
	return new SwitchStatement(t0(_.switched), parts)
}

export function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
	const destructuredName = `_$${nextDestructuredId}`
	nextDestructuredId = nextDestructuredId + 1
	const idDestructured = new Identifier(destructuredName)
	const declarators = assignees.map(assignee => {
		// TODO: Don't compile it if it's never accessed
		const get = getMember(idDestructured, assignee.name, isLazy, isModule)
		return makeDeclarator(assignee, get, isLazy)
	})
	// Getting lazy module is done by ms.lazyGetModule.
	const val = isLazy && !isModule ? lazyWrap(value) : value
	return cat(new VariableDeclarator(idDestructured, val), declarators)
}
