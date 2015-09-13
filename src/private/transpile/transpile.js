import { ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, BreakStatement, CallExpression, CatchClause, ClassBody, ClassExpression,
	ConditionalExpression, DebuggerStatement, ExpressionStatement, ForOfStatement,
	FunctionExpression, Identifier, IfStatement, Literal, LogicalExpression, MemberExpression,
	MethodDefinition, NewExpression, ObjectExpression, Program, Property, ReturnStatement,
	SpreadElement, SwitchCase, SwitchStatement, TaggedTemplateExpression, TemplateElement,
	TemplateLiteral, ThisExpression, ThrowStatement, TryStatement, VariableDeclaration,
	UnaryExpression, VariableDeclarator, YieldExpression } from 'esast/dist/ast'
import { functionExpressionThunk, idCached, loc, member, propertyIdOrLiteralCached, toStatement
	} from 'esast/dist/util'
import manglePath from '../manglePath'
import * as MsAstTypes from '../MsAst'
import { AssignSingle, Call, Constructor, L_And, L_Or, LD_Lazy, LD_Mutable, Member, MS_Mutate,
	MS_New, MS_NewMutable, LocalDeclare, Pattern, Splat, SD_Debugger, SV_Contains, SV_False,
	SV_Name, SV_Null, SV_Sub, SV_True, SV_Undefined, SwitchDoPart, Quote, Use } from '../MsAst'
import { assert, cat, flatMap, flatOpMap, ifElse, isEmpty, implementMany, isPositive, last, opIf,
	opMap, tail } from '../util'
import { AmdefineHeader, ArraySliceCall, DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj,
	DeclareLexicalThis, ExportsDefault, ExportsGet, IdArguments, IdBuilt, IdConstructor, IdDefine,
	IdExports, IdExtract, IdFocus, IdLexicalThis, IdSuper, GlobalError, LitEmptyString, LitNull,
	LitStrExports, LitStrThrow, LitZero, ReturnBuilt, ReturnExports, ReturnRes, SwitchCaseNoMatch,
	ThrowAssertFail, ThrowNoCaseMatch, UseStrict } from './ast-constants'
import { IdMs, lazyWrap, msAdd, msAddMany, msAssert, msAssertMember, msAssertNot,
	msAssertNotMember, msAssoc, msCheckContains, msExtract, msGet, msGetDefaultExport, msGetModule,
	msLazy, msLazyGet, msLazyGetModule, msNewMutableProperty, msNewProperty, msSet, msSetName,
	msSetLazy, msSome, msSymbol, MsNone } from './ms-call'
import { accessLocalDeclare, declare, forStatementInfinite, idForDeclareCached,
	opTypeCheckForLocalDeclare } from './util'

let context, verifyResults, isInGenerator, isInConstructor
let nextDestructuredId

export default (_context, moduleExpression, _verifyResults) => {
	context = _context
	verifyResults = _verifyResults
	isInGenerator = false
	isInConstructor = false
	nextDestructuredId = 0
	const res = t0(moduleExpression)
	// Release for garbage collection.
	context = verifyResults = undefined
	return res
}

export const
	t0 = expr => loc(expr.transpile(), expr.loc)
const
	t1 = (expr, arg) => loc(expr.transpile(arg), expr.loc),
	t3 = (expr, arg, arg2, arg3) => loc(expr.transpile(arg, arg2, arg3), expr.loc),
	tLines = exprs => {
		const out = [ ]
		for (const expr of exprs) {
			const ast = expr.transpile()
			if (ast instanceof Array)
				// Debug may produce multiple statements.
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
		return new VariableDeclaration(this.assignee.isMutable() ? 'let' : 'const', [ declare ])
	},
	// TODO:ES6 Just use native destructuring assign
	AssignDestructure() {
		return new VariableDeclaration(
			this.kind() === LD_Mutable ? 'let' : 'const',
			makeDestructureDeclarators(
				this.assignees,
				this.kind() === LD_Lazy,
				t0(this.value),
				false))
	},

	BagEntry() { return msAdd(IdBuilt, t0(this.value)) },

	BagEntryMany() { return msAddMany(IdBuilt, t0(this.value)) },

	BagSimple() { return new ArrayExpression(this.parts.map(t0)) },

	BlockDo(lead, opDeclareRes, opOut) {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (opOut === undefined) opOut = null
		assert(opDeclareRes === null)
		return new BlockStatement(cat(lead, tLines(this.lines), opOut))
	},

	BlockValThrow(lead, opDeclareRes, opOut) {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (opOut === undefined) opOut = null
		context.warnIf(opDeclareRes !== null || opOut !== null, this.loc,
			'Out condition ignored because of oh-no!')
		return new BlockStatement(cat(lead, tLines(this.lines), t0(this.throw)))
	},

	BlockWithReturn(lead, opDeclareRes, opOut) {
		return transpileBlock(t0(this.returned), tLines(this.lines), lead, opDeclareRes, opOut)
	},

	BlockBag(lead, opDeclareRes, opOut) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltBag, tLines(this.lines)),
			lead, opDeclareRes, opOut)
	},

	BlockObj(lead, opDeclareRes, opOut) {
		const lines = cat(DeclareBuiltObj, tLines(this.lines))
		const res = ifElse(this.opObjed,
			objed => ifElse(this.opName,
				name => msSet(t0(objed), IdBuilt, new Literal(name)),
				() => msSet(t0(objed), IdBuilt)),
			() => ifElse(this.opName,
				_ => msSetName(IdBuilt, new Literal(_)),
				() => IdBuilt))
		return transpileBlock(res, lines, lead, opDeclareRes, opOut)
	},

	BlockMap(lead, opDeclareRes, opOut) {
		return transpileBlock(
			IdBuilt,
			cat(DeclareBuiltMap, tLines(this.lines)),
			lead, opDeclareRes, opOut)
	},

	BlockWrap() { return blockWrap(t0(this.block)) },

	Break() { return new BreakStatement() },

	BreakWithVal() { return new ReturnStatement(t0(this.value)) },

	Call() {
		return new CallExpression(t0(this.called), this.args.map(t0))
	},

	CaseDo() {
		const body = caseBody(this.parts, this.opElse)
		return ifElse(this.opCased, _ => new BlockStatement([ t0(_), body ]), () => body)
	},
	CaseVal() {
		const body = caseBody(this.parts, this.opElse)
		const block = ifElse(this.opCased, _ => [ t0(_), body ], () => [ body ])
		return blockWrap(new BlockStatement(block))
	},
	CaseDoPart: casePart,
	CaseValPart: casePart,

	Class() {
		const methods = cat(
			this.statics.map(_ => t1(_, true)),
			opMap(this.opConstructor, t0),
			this.methods.map(_ => t1(_, false)))
		const opName = opMap(verifyResults.opName(this), idCached)
		const classExpr = new ClassExpression(
			opName,
			opMap(this.opSuperClass, t0), new ClassBody(methods))

		return ifElse(this.opDo, _ => t1(_, classExpr), () => classExpr)
	},

	ClassDo(classExpr) {
		const lead = new VariableDeclaration('const', [
			new VariableDeclarator(t0(this.declareFocus), classExpr) ])
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

		const res = new MethodDefinition(IdConstructor, body, 'constructor', false, false)
		isInConstructor = false
		return res
	},

	Catch() {
		return new CatchClause(t0(this.caught), t0(this.block))
	},

	Debug() { return context.opts.includeChecks() ? tLines(this.lines) : [ ] },

	ExceptDo() { return transpileExcept(this) },
	ExceptVal() { return blockWrap(new BlockStatement([ transpileExcept(this) ])) },

	ForDo() { return forLoop(this.opIteratee, this.block) },

	ForBag() {
		return blockWrap(new BlockStatement([
			DeclareBuiltBag,
			forLoop(this.opIteratee, this.block),
			ReturnBuilt
		]))
	},

	ForVal() {
		return blockWrap(new BlockStatement([ forLoop(this.opIteratee, this.block) ]))
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
		const argChecks = opIf(context.opts.includeChecks(), () =>
			flatOpMap(this.args, opTypeCheckForLocalDeclare))

		const _in = opMap(this.opIn, t0)

		const opDeclareThis =
			opIf(!isInConstructor && this.opDeclareThis != null, () => DeclareLexicalThis)

		const lead = cat(leadStatements, opDeclareThis, opDeclareRest, argChecks, _in)

		const _out = opMap(this.opOut, t0)
		const body = t3(this.block, lead, this.opDeclareRes, _out)
		const args = this.args.map(t0)
		isInGenerator = oldInGenerator
		const id = opMap(verifyResults.opName(this), idCached)

		const canUseArrowFunction =
			id === null &&
			this.opDeclareThis === null &&
			opDeclareRest === null &&
			!this.isGenerator
		return canUseArrowFunction ?
			new ArrowFunctionExpression(args, body) :
			new FunctionExpression(id, args, body, this.isGenerator)
	},

	Ignore() { return [ ] },

	Lazy() { return lazyWrap(t0(this.value)) },

	MethodImpl(isStatic) {
		const value = t0(this.fun)
		assert(value.id == null)
		// Since the Fun should have opDeclareThis, it will never be an ArrowFunctionExpression.
		assert(value instanceof FunctionExpression)

		const { key, computed } = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'method', isStatic, computed)
	},
	MethodGetter(isStatic) {
		const value = new FunctionExpression(null, [ ], t1(this.block, DeclareLexicalThis))
		const { key, computed } = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'get', isStatic, computed)
	},
	MethodSetter(isStatic) {
		const value = new FunctionExpression(null, [ IdFocus ], t1(this.block, DeclareLexicalThis))
		const { key, computed } = methodKeyComputed(this.symbol)
		return new MethodDefinition(key, value, 'set', isStatic, computed)
	},

	NumberLiteral() {
		// Negative numbers are not part of ES spec.
		// http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.3
		const value = Number(this.value)
		const lit = new Literal(Math.abs(value))
		return isPositive(value) ? lit : new UnaryExpression('-', lit)
	},

	LocalAccess() {
		if (this.name === 'this')
			return isInConstructor ? new ThisExpression() : IdLexicalThis
		else {
			const ld = verifyResults.localDeclareForAccess(this)
			// If ld missing, this is a builtin, and builtins are never lazy
			return ld === undefined ? idCached(this.name) : accessLocalDeclare(ld)
		}
	},

	LocalDeclare() { return new Identifier(idForDeclareCached(this).name) },

	LocalMutate() {
		return new AssignmentExpression('=', idCached(this.name), t0(this.value))
	},

	Logic() {
		assert(this.kind === L_And || this.kind === L_Or)
		const op = this.kind === L_And ? '&&' : '||'
		return tail(this.args).reduce((a, b) =>
			new LogicalExpression(op, a, t0(b)), t0(this.args[0]))
	},

	MapEntry() { return msAssoc(IdBuilt, t0(this.key), t0(this.val)) },

	Member() { return member(t0(this.object), this.name) },

	MemberSet() {
		switch (this.kind) {
			case MS_Mutate:
				return new AssignmentExpression('=',
					member(t0(this.object), this.name),
					t0(this.value))
			case MS_New:
				return msNewProperty(t0(this.object), new Literal(this.name), t0(this.value))
			case MS_NewMutable:
				return msNewMutableProperty(t0(this.object), new Literal(this.name), t0(this.value))
			default: throw new Error()
		}
	},

	Module() {
		const body = tLines(this.lines)
		const otherUses = this.uses.concat(this.debugUses)

		verifyResults.builtinPathToNames.forEach((used, path) => {
			if (path !== 'global') {
				const usedDeclares = [ ]
				let opUseDefault = null
				let defaultName = last(path.split('/'))
				for (const name of used) {
					const declare = LocalDeclare.plain(this.loc, name)
					if (name === defaultName)
						opUseDefault = declare
					else
						usedDeclares.push(declare)
				}
				otherUses.push(new Use(this.loc, path, usedDeclares, opUseDefault))
			}
		})

		const amd = amdWrapModule(this.doUses, otherUses, body)

		return new Program(cat(
			opIf(context.opts.includeUseStrict(), () => UseStrict),
			opIf(context.opts.includeAmdefine(), () => AmdefineHeader),
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
		context.check(!anySplat, this.loc, 'TODO: Splat params for new')
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

	ObjEntryComputed() {
		return new AssignmentExpression('=',
			new MemberExpression(IdBuilt, t0(this.key)),
			t0(this.value))
	},

	ObjSimple() {
		return new ObjectExpression(this.pairs.map(pair =>
			new Property('init', propertyIdOrLiteralCached(pair.key), t0(pair.value))))
	},

	Quote() {
		if (this.parts.length === 0)
			return LitEmptyString
		else {
			const quasis = [ ], expressions = [ ]

			// TemplateLiteral must start with a TemplateElement
			if (typeof this.parts[0] !== 'string')
				quasis.push(TemplateElement.Empty)

			for (let part of this.parts)
				if (typeof part === 'string')
					quasis.push(TemplateElement.forRawString(part))
				else {
					// "{1}{1}" needs an empty quasi in the middle (and on the ends)
					if (quasis.length === expressions.length)
						quasis.push(TemplateElement.Empty)
					expressions.push(t0(part))
				}

			// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
			if (quasis.length === expressions.length)
				quasis.push(TemplateElement.Empty)

			return new TemplateLiteral(quasis, expressions)
		}
	},

	QuoteTemplate() {
		return new TaggedTemplateExpression(t0(this.tag), t0(this.quote))
	},

	SpecialDo() {
		switch (this.kind) {
			case SD_Debugger: return new DebuggerStatement()
			default: throw new Error(this.kind)
		}
	},

	SpecialVal() {
		// Make new objects because we will assign `loc` to them.
		switch (this.kind) {
			case SV_Contains: return member(IdMs, 'contains')
			case SV_False: return new Literal(false)
			case SV_Name: return new Literal(verifyResults.name(this))
			case SV_Null: return new Literal(null)
			case SV_Sub: return member(IdMs, 'sub')
			case SV_True: return new Literal(true)
			case SV_Undefined: return new UnaryExpression('void', LitZero)
			default: throw new Error(this.kind)
		}
	},

	Splat() {
		return new SpreadElement(t0(this.splatted))
	},

	SuperCall: superCall,
	SuperCallDo: superCall,
	SuperMember() {
		return member(IdSuper, this.name)
	},

	SwitchDo() { return transpileSwitch(this) },
	SwitchVal() { return blockWrap(new BlockStatement([ transpileSwitch(this) ])) },
	SwitchDoPart: switchPart,
	SwitchValPart: switchPart,

	Throw() {
		return ifElse(this.opThrown,
			_ => doThrow(_),
			() => new ThrowStatement(new NewExpression(GlobalError, [ LitStrThrow ])))
	},

	With() {
		const idDeclare = idForDeclareCached(this.declare)
		const block = t3(this.block, null, null, new ReturnStatement(idDeclare))
		const fun = isInGenerator ?
			new FunctionExpression(null, [ idDeclare ], block, true) :
			new ArrowFunctionExpression([ idDeclare ], block)
		const call = new CallExpression(fun, [ t0(this.value) ])
		return isInGenerator ? new YieldExpression(call, true) : call
	},

	Yield() { return new YieldExpression(opMap(this.opYielded, t0), false) },

	YieldTo() { return new YieldExpression(t0(this.yieldedTo), true) }
})

function casePart(alternate) {
	if (this.test instanceof Pattern) {
		const { type, patterned, locals } = this.test
		const decl = new VariableDeclaration('const', [
			new VariableDeclarator(IdExtract, msExtract(t0(type), t0(patterned))) ])
		const test = new BinaryExpression('!==', IdExtract, LitNull)
		const extract = new VariableDeclaration('const', locals.map((_, idx) =>
			new VariableDeclarator(
				idForDeclareCached(_),
				new MemberExpression(IdExtract, new Literal(idx)))))
		const res = t1(this.result, extract)
		return new BlockStatement([ decl, new IfStatement(test, res, alternate) ])
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
	} else {
		const m = typeof method.symbol === 'string' ?
			member(IdSuper, method.symbol) :
			new MemberExpression(IdSuper, t0(method.symbol))
		return new CallExpression(m, args)
	}
}

function switchPart() {
	const opOut = opIf(this instanceof SwitchDoPart, () => new BreakStatement)
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
	const block = t3(this.result, null, null, opOut)
	// If switch has multiple values, build up a statement like: `case 1: case 2: { doBlock() }`
	const x = [ ]
	for (let i = 0; i < this.values.length - 1; i = i + 1)
		// These cases fallthrough to the one at the end.
		x.push(new SwitchCase(t0(this.values[i]), [ ]))
	x.push(new SwitchCase(t0(this.values[this.values.length - 1]), [ block ]))
	return x
}

// Functions specific to certain expressions.
const
	// Wraps a block (with `return` statements in it) in an IIFE.
	blockWrap = block => {
		const invoke = new CallExpression(functionExpressionThunk(block, isInGenerator), [ ])
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
			({ element, bag }) => {
				const declare = new VariableDeclaration('let',
					[ new VariableDeclarator(t0(element)) ])
				return new ForOfStatement(declare, t0(bag), t0(block))
			},
			() => forStatementInfinite(t0(block))),

	doThrow = thrown =>
		new ThrowStatement(thrown instanceof Quote ?
			new NewExpression(GlobalError, [ t0(thrown) ]) :
			t0(thrown)),

	methodKeyComputed = symbol => {
		if (typeof symbol === 'string')
			return { key: propertyIdOrLiteralCached(symbol), computed: false }
		else {
			const key = symbol instanceof Quote ? t0(symbol) : msSymbol(t0(symbol))
			return { key, computed: true }
		}
	},

	transpileBlock = (returned, lines, lead, opDeclareRes, opOut) => {
		// TODO:ES6 Optional arguments
		if (lead === undefined) lead = null
		if (opDeclareRes === undefined) opDeclareRes = null
		if (opOut === undefined) opOut = null
		const fin = ifElse(opDeclareRes,
			rd => {
				const ret = maybeWrapInCheckContains(returned, rd.opType, rd.name)
				return ifElse(opOut,
					_ => cat(declare(rd, ret), _, ReturnRes),
					() => new ReturnStatement(ret))
			},
			() => cat(opOut, new ReturnStatement(returned)))
		return new BlockStatement(cat(lead, lines, fin))
	},

	transpileExcept = except =>
		new TryStatement(
			t0(except._try),
			opMap(except._catch, t0),
			opMap(except._finally, t0)),

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
	amdWrapModule = (doUses, otherUses, body) => {
		const useBoot = context.opts.useBoot()

		const allUses = doUses.concat(otherUses)
		const allUsePaths = allUses.map(_ => manglePath(_.path))

		const arrUsePaths = new ArrayExpression(cat(
			opIf(useBoot, () => new Literal(context.opts.bootPath())),
			LitStrExports,
			allUsePaths.map(_ => new Literal(_))))

		const useToIdentifier = new Map()
		const useIdentifiers = [ ]
		for (let i = 0; i < allUses.length; i = i + 1) {
			const _ = allUses[i]
			const id = idCached(`${pathBaseName(_.path)}_${i}`)
			useIdentifiers.push(id)
			useToIdentifier.set(_, id)
		}

		const useArgs = cat(opIf(useBoot, () => IdBoot), IdExports, useIdentifiers)

		const doBoot = opIf(useBoot, () => new ExpressionStatement(msGetModule(IdBoot)))

		const useDos = doUses.map(use =>
			loc(new ExpressionStatement(msGetModule(useToIdentifier.get(use))), use.loc))

		// Extracts used values from the modules.
		const opDeclareUsedLocals = opIf(!isEmpty(otherUses),
			() => new VariableDeclaration('const',
				flatMap(otherUses, use => useDeclarators(use, useToIdentifier.get(use)))))

		const fullBody = new BlockStatement(cat(
			doBoot, useDos, opDeclareUsedLocals, body, ReturnExports))

		const lazyBody =
			context.opts.lazyModule() ?
				new BlockStatement([ new ExpressionStatement(
					new AssignmentExpression('=', ExportsGet,
						msLazy(functionExpressionThunk(fullBody)))) ]) :
				fullBody

		return new CallExpression(IdDefine,
			[ arrUsePaths, new ArrowFunctionExpression(useArgs, lazyBody) ])
	},

	pathBaseName = path =>
		path.substr(path.lastIndexOf('/') + 1),

	useDeclarators = (use, moduleIdentifier) => {
		// TODO: Could be neater about this
		const isLazy = (isEmpty(use.used) ? use.opUseDefault : use.used[0]).isLazy()
		const value = (isLazy ? msLazyGetModule : msGetModule)(moduleIdentifier)

		const usedDefault = opMap(use.opUseDefault, def => {
			const defexp = msGetDefaultExport(moduleIdentifier)
			const val = isLazy ? lazyWrap(defexp) : defexp
			return loc(new VariableDeclarator(idForDeclareCached(def), val), def.loc)
		})

		const usedDestruct = isEmpty(use.used) ? null :
			makeDestructureDeclarators(use.used, isLazy, value, true, false)

		return cat(usedDefault, usedDestruct)
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
		const { name, opType } = assignee
		const isLazy = assignee.isLazy()
		// TODO: assert(assignee.opType === null)
		// or TODO: Allow type check on lazy value?
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name)
		const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value
		assert(isLazy || !valueIsAlreadyLazy)
		return new VariableDeclarator(idForDeclareCached(assignee), val)
	},

	maybeWrapInCheckContains = (ast, opType, name) =>
		context.opts.includeChecks() && opType !== null ?
			msCheckContains(t0(opType), ast, new Literal(name)) :
			ast,

	getMember = (astObject, gotName, isLazy, isModule) =>
		isLazy ?
		msLazyGet(astObject, new Literal(gotName)) :
		isModule && context.opts.includeChecks() ?
		msGet(astObject, new Literal(gotName)) :
		member(astObject, gotName)
