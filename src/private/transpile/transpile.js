import {ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, BreakStatement, CallExpression, CatchClause, ClassBody, ClassExpression,
	ConditionalExpression, DebuggerStatement, ExpressionStatement, ForOfStatement,
	FunctionExpression, Identifier, IfStatement, Literal, LogicalExpression, MemberExpression,
	MethodDefinition, NewExpression, ObjectExpression, Program, Property, ReturnStatement,
	SpreadElement, SwitchCase, SwitchStatement, TaggedTemplateExpression, TemplateElement,
	TemplateLiteral, ThisExpression, ThrowStatement, TryStatement, VariableDeclaration,
	UnaryExpression, VariableDeclarator, YieldExpression} from 'esast/dist/ast'
import {functionExpressionThunk, identifier, loc, member, propertyIdOrLiteral, toStatement
	} from 'esast/dist/util'
import manglePath from '../manglePath'
import {check, options, warn} from '../context'
import * as MsAstTypes from '../MsAst'
import {AssignSingle, Call, Constructor, Logics, Member, LocalDeclare, LocalDeclares, Pattern,
	Splat, Setters, SpecialDos, SpecialVals, SwitchDoPart, Quote, Import} from '../MsAst'
import {assert, cat, flatMap, flatOpMap, ifElse, isEmpty, implementMany, last, opIf, opMap, tail
	} from '../util'
import {AmdefineHeader, ArraySliceCall, DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj,
	DeclareLexicalThis, ExportsDefault, ExportsGet, IdArguments, IdBuilt, IdDefine, IdExports,
	IdExtract, IdFocus, IdLexicalThis, IdSuper, GlobalError, LitEmptyString, LitNull,
	LitStrExports, LitStrThrow, LitZero, ReturnBuilt, ReturnExports, ReturnRes, SwitchCaseNoMatch,
	ThrowAssertFail, ThrowNoCaseMatch, UseStrict} from './ast-constants'
import {IdMs, lazyWrap, msAdd, msAddMany, msAssert, msAssertMember, msAssertNot,
	msAssertNotMember, msCheckContains, msExtract, msGet, msGetDefaultExport, msGetModule, msLazy,
	msLazyGet, msLazyGetModule, msNewMutableProperty, msNewProperty, msSetLazy, msSetSub, msSome,
	msSymbol, MsNone} from './ms-call'
import {accessLocalDeclare, declare, forStatementInfinite, idForDeclareCached,
	opTypeCheckForLocalDeclare} from './util'

let verifyResults, isInGenerator, isInConstructor
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

export const
	t0 = expr => loc(expr.transpile(), expr.loc)
const
	t1 = (expr, arg) => loc(expr.transpile(arg), expr.loc),
	t2 = (expr, arg, arg2) => loc(expr.transpile(arg, arg2)),
	t3 = (expr, arg, arg2, arg3) => loc(expr.transpile(arg, arg2, arg3), expr.loc),
	tLines = exprs => {
		const out = []
		for (const expr of exprs) {
			const ast = expr.transpile()
			if (ast instanceof Array)
				// Ignore produces 0 statements and Region produces many.
				for (const _ of ast)
					out.push(toStatement(_))
			else
				out.push(loc(toStatement(ast), expr.loc))
		}
		return out
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
						const ass = this.negate ? msAssertNotMember : msAssertMember
						return ass(t0(called.object), new Literal(called.name), ...args)
					} else {
						const ass = this.negate ? msAssertNot : msAssert
						return ass(t0(called), ...args)
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

	BagEntry() { return msAdd(IdBuilt, t0(this.value)) },

	BagEntryMany() { return msAddMany(IdBuilt, t0(this.value)) },

	BagSimple() { return new ArrayExpression(this.parts.map(t0)) },

	BlockDo(lead, opDeclareRes, follow) {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (follow === undefined) follow = null
		assert(opDeclareRes === null)
		return new BlockStatement(cat(lead, tLines(this.lines), follow))
	},

	BlockValThrow(lead, opDeclareRes, follow) {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (follow === undefined) follow = null
		if (opDeclareRes !== null || follow !== null)
			warn(this.loc, 'Return type ignored because the block always throws.')
		return new BlockStatement(cat(lead, tLines(this.lines), t0(this.throw)))
	},

	BlockValReturn(lead, opDeclareRes, follow) {
		return transpileBlock(t0(this.returned), tLines(this.lines), lead, opDeclareRes, follow)
	},

	BlockBag(lead, opDeclareRes, follow) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltBag, tLines(this.lines)),
			lead, opDeclareRes, follow)
	},

	BlockObj(lead, opDeclareRes, follow) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltObj, tLines(this.lines)),
			lead, opDeclareRes, follow)
	},

	BlockMap(lead, opDeclareRes, follow) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltMap, tLines(this.lines)),
			lead, opDeclareRes, follow)
	},

	BlockWrap() { return blockWrap(t0(this.block)) },

	Break() { return new BreakStatement() },

	BreakWithVal() { return new ReturnStatement(t0(this.value)) },

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
		const result = msSome(blockWrap(t0(this.result)))
		return this.isUnless ?
			new ConditionalExpression(test, MsNone, result) :
			new ConditionalExpression(test, result, MsNone)
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

	Fun(leadStatements) {
		// TODO:ES6 Optional args
		if (leadStatements === undefined)
			leadStatements = null

		const oldInGenerator = isInGenerator
		isInGenerator = this.isGenerator

		// TODO:ES6 use `...`f
		const nArgs = new Literal(this.args.length)
		const opDeclareRest = opMap(this.opRestArg, rest =>
			declare(rest, new CallExpression(ArraySliceCall, [IdArguments, nArgs])))
		const argChecks = opIf(options.includeChecks(), () =>
			flatOpMap(this.args, opTypeCheckForLocalDeclare))

		const opDeclareThis =
			opIf(!isInConstructor && this.opDeclareThis != null, () => DeclareLexicalThis)

		const lead = cat(leadStatements, opDeclareThis, opDeclareRest, argChecks)

		const body = t2(this.block, lead, this.opDeclareRes)
		const args = this.args.map(t0)
		isInGenerator = oldInGenerator
		const id = opMap(verifyResults.opName(this), identifier)

		const canUseArrowFunction =
			id === null &&
			this.opDeclareThis === null &&
			opDeclareRest === null &&
			!this.isGenerator
		return canUseArrowFunction ?
			new ArrowFunctionExpression(args, body) :
			new FunctionExpression(id, args, body, this.isGenerator)
	},

	Ignore() { return [] },

	Lazy() { return lazyWrap(t0(this.value)) },

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

	MapEntry() { return msSetSub(IdBuilt, t0(this.key), t0(this.val)) },

	Member() {
		return memberStringOrVal(t0(this.object), this.name)
	},

	MemberSet() {
		const obj = t0(this.object)
		const name = () =>
			typeof this.name === 'string' ? new Literal(this.name) : t0(this.name)
		const val = maybeWrapInCheckContains(t0(this.value), this.opType, this.name)
		switch (this.kind) {
			case Setters.Init:
				return msNewProperty(obj, name(), val)
			case Setters.InitMutable:
				return msNewMutableProperty(obj, name(), val)
			case Setters.Mutate:
				return new AssignmentExpression('=', memberStringOrVal(obj, this.name), val)
			default: throw new Error()
		}
	},

	Module() {
		const body = tLines(this.lines)

		verifyResults.builtinPathToNames.forEach((imported, path) => {
			if (path !== 'global') {
				const importedDeclares = []
				let opImportDefault = null
				let defaultName = last(path.split('/'))
				for (const name of imported) {
					const declare = LocalDeclare.plain(this.loc, name)
					if (name === defaultName)
						opImportDefault = declare
					else
						importedDeclares.push(declare)
				}
				this.imports.push(new Import(this.loc, path, importedDeclares, opImportDefault))
			}
		})

		const amd = amdWrapModule(this.doImports, this.imports, body)

		return new Program(cat(
			opIf(options.includeUseStrict(), () => UseStrict),
			opIf(options.includeAmdefine(), () => AmdefineHeader),
			toStatement(amd)))
	},

	ModuleExportNamed() {
		return t1(this.assign, val =>
			new AssignmentExpression('=', member(IdExports, this.assign.assignee.name), val))
	},

	ModuleExportDefault() {
		return t1(this.assign, val => new AssignmentExpression('=', ExportsDefault, val))
	},

	New() {
		const anySplat = this.args.some(_ => _ instanceof Splat)
		check(!anySplat, this.loc, 'TODO: Splat params for new')
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
					msSetLazy(IdBuilt, new Literal(_.name), idForDeclareCached(_))))
	},

	ObjEntryPlain() {
		return new AssignmentExpression('=', memberStringOrVal(IdBuilt, this.name), t0(this.value))
	},

	ObjSimple() {
		return new ObjectExpression(this.pairs.map(pair =>
			new Property('init', propertyIdOrLiteral(pair.key), t0(pair.value))))
	},

	Quote() {
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

	QuoteTemplate() {
		return new TaggedTemplateExpression(t0(this.tag), t0(this.quote))
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
		return msSetSub(
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
				return member(IdMs, 'contains')
			case SpecialVals.DelSub:
				return member(IdMs, 'delSub')
			case SpecialVals.False:
				return new Literal(false)
			case SpecialVals.Name:
				return new Literal(verifyResults.name(this))
			case SpecialVals.Null:
				return new Literal(null)
			case SpecialVals.SetSub:
				return member(IdMs, 'setSub')
			case SpecialVals.Sub:
				return member(IdMs, 'sub')
			case SpecialVals.True:
				return new Literal(true)
			case SpecialVals.Undefined:
				return new UnaryExpression('void', LitZero)
			default:
				throw new Error(this.kind)
		}
	},

	Splat() {
		return new SpreadElement(t0(this.splatted))
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

function casePart(alternate) {
	if (this.test instanceof Pattern) {
		const {type, patterned, locals} = this.test
		const decl = new VariableDeclaration('const', [
			new VariableDeclarator(IdExtract, msExtract(t0(type), t0(patterned)))])
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

// Functions specific to certain expressions.
const
	// Wraps a block (with `return` statements in it) in an IIFE.
	blockWrap = block => {
		const invoke = new CallExpression(functionExpressionThunk(block, isInGenerator), [])
		return isInGenerator ? new YieldExpression(invoke, true) : invoke
	},

	caseBody = (parts, opElse) => {
		let acc = ifElse(opElse, t0, () => ThrowNoCaseMatch)
		for (let i = parts.length - 1; i >= 0; i = i - 1)
			acc = t1(parts[i], acc)
		return acc
	},

	constructorSetMembers = constructor =>
		constructor.memberArgs.map(_ =>
			msNewProperty(new ThisExpression(), new Literal(_.name), idForDeclareCached(_))),

	forLoop = (opIteratee, block) =>
		ifElse(opIteratee,
			({element, bag}) => {
				const declare = new VariableDeclaration('let',
					[new VariableDeclarator(t0(element))])
				return new ForOfStatement(declare, t0(bag), t0(block))
			},
			() => forStatementInfinite(t0(block))),

	doThrow = thrown =>
		new ThrowStatement(thrown instanceof Quote ?
			new NewExpression(GlobalError, [t0(thrown)]) :
			t0(thrown)),

	memberStringOrVal = (object, memberName) =>
		typeof memberName === 'string' ?
			member(object, memberName) :
			new MemberExpression(object, t0(memberName)),

	methodKeyComputed = symbol => {
		if (typeof symbol === 'string')
			return {key: propertyIdOrLiteral(symbol), computed: false}
		else {
			const key = symbol instanceof Quote ? t0(symbol) : msSymbol(t0(symbol))
			return {key, computed: true}
		}
	},

	transpileBlock = (returned, lines, lead, opDeclareRes, follow) => {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (follow === undefined) follow = null
		const fin = ifElse(opDeclareRes,
			rd => {
				const ret = maybeWrapInCheckContains(returned, rd.opType, rd.name)
				return ifElse(follow,
					_ => cat(declare(rd, ret), _, ReturnRes),
					() => new ReturnStatement(ret))
			},
			() => cat(follow, new ReturnStatement(returned)))
		return new BlockStatement(cat(lead, lines, fin))
	},

	transpileExcept = except =>
		new TryStatement(
			t0(except.try),
			opMap(except.catch, t0),
			opMap(except.finally, t0)),

	transpileSwitch = _ => {
		const parts = flatMap(_.parts, t0)
		parts.push(ifElse(_.opElse,
			_ => new SwitchCase(undefined, t0(_).body),
			() => SwitchCaseNoMatch))
		return new SwitchStatement(t0(_.switched), parts)
	}

const IdBoot = new Identifier('_boot')

// Module helpers
const
	amdWrapModule = (doImports, imports, body) => {
		const shouldImportBoot = options.importBoot()

		const allImports = doImports.concat(imports)
		const allImportPaths = allImports.map(_ => manglePath(_.path))

		const arrImportPaths = new ArrayExpression(cat(
			opIf(shouldImportBoot, () => new Literal(options.bootPath())),
			LitStrExports,
			allImportPaths.map(_ => new Literal(_))))

		const importToIdentifier = new Map()
		const importIdentifiers = []
		for (let i = 0; i < allImports.length; i = i + 1) {
			const _ = allImports[i]
			const id = identifier(`${pathBaseName(_.path)}_${i}`)
			importIdentifiers.push(id)
			importToIdentifier.set(_, id)
		}

		const importArgs = cat(opIf(shouldImportBoot, () => IdBoot), IdExports, importIdentifiers)

		const doBoot = opIf(shouldImportBoot, () => new ExpressionStatement(msGetModule(IdBoot)))

		const importDos = doImports.map(_ =>
			loc(new ExpressionStatement(msGetModule(importToIdentifier.get(_))), _.loc))

		// Extracts imported values from the modules.
		const opDeclareImportedLocals = opIf(!isEmpty(imports),
			() => new VariableDeclaration('const',
				flatMap(imports, _ => importDeclarators(_, importToIdentifier.get(_)))))

		const fullBody = new BlockStatement(cat(
			doBoot, importDos, opDeclareImportedLocals, body, ReturnExports))

		const lazyBody =
			options.lazyModule() ?
				new BlockStatement([new ExpressionStatement(
					new AssignmentExpression('=', ExportsGet,
						msLazy(functionExpressionThunk(fullBody))))]) :
				fullBody

		return new CallExpression(IdDefine,
			[arrImportPaths, new ArrowFunctionExpression(importArgs, lazyBody)])
	},

	pathBaseName = path =>
		path.substr(path.lastIndexOf('/') + 1),

	importDeclarators = ({imported, opImportDefault}, moduleIdentifier) => {
		// TODO: Could be neater about this
		const isLazy = (isEmpty(imported) ? opImportDefault : imported[0]).isLazy()
		const value = (isLazy ? msLazyGetModule : msGetModule)(moduleIdentifier)

		const importedDefault = opMap(opImportDefault, def => {
			const defexp = msGetDefaultExport(moduleIdentifier)
			const val = isLazy ? lazyWrap(defexp) : defexp
			return loc(new VariableDeclarator(idForDeclareCached(def), val), def.loc)
		})

		const importedDestruct = isEmpty(imported) ? null :
			makeDestructureDeclarators(imported, isLazy, value, true, false)

		return cat(importedDefault, importedDestruct)
	}

// General utils. Not in util.js because these close over context.
const
	makeDestructureDeclarators = (assignees, isLazy, value, isModule) => {
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
	},

	makeDeclarator = (assignee, value, valueIsAlreadyLazy) => {
		const {name, opType} = assignee
		const isLazy = assignee.isLazy()
		// TODO: assert(assignee.opType === null)
		// or TODO: Allow type check on lazy value?
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name)
		const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value
		assert(isLazy || !valueIsAlreadyLazy)
		return new VariableDeclarator(idForDeclareCached(assignee), val)
	},

	maybeWrapInCheckContains = (ast, opType, name) =>
		options.includeChecks() && opType !== null ?
			msCheckContains(t0(opType), ast, new Literal(name)) :
			ast,

	getMember = (astObject, gotName, isLazy, isModule) =>
		isLazy ?
		msLazyGet(astObject, new Literal(gotName)) :
		isModule && options.includeChecks() ?
		msGet(astObject, new Literal(gotName)) :
		member(astObject, gotName)
