import {ArrayExpression, ArrowFunctionExpression, AssignmentExpression, BinaryExpression,
	BlockStatement, BreakStatement, CallExpression, ClassBody, ClassExpression,
	ConditionalExpression, DebuggerStatement, ForOfStatement, ForStatement, FunctionExpression,
	Identifier, IfStatement, Literal, LogicalExpression, MemberExpression, MethodDefinition,
	NewExpression, ObjectExpression, Property, ReturnStatement, SpreadElement, SwitchCase,
	SwitchStatement, TaggedTemplateExpression, TemplateElement, TemplateLiteral, ThisExpression,
	ThrowStatement, VariableDeclaration, UnaryExpression, VariableDeclarator, YieldExpression
	} from 'esast/dist/ast'
import {identifier, member, propertyIdOrLiteral} from 'esast/dist/util'
import {options} from '../context'
import * as MsAstTypes from '../MsAst'
import {AssignSingle, Call, Constructor, Fun, Funs, Logics, Member, LocalDeclares, Pattern, Setters,
	SpecialDos, SpecialVals} from '../MsAst'
import {assert, cat, flatMap, flatOpMap, ifElse, implementMany, isEmpty, last, opIf, opMap, rtail,
	tail} from '../util'
import {Blocks} from '../VerifyResults'
import {ArraySliceCall, DeclareBuiltBag, DeclareBuiltMap, DeclareBuiltObj, DeclareLexicalThis,
	IdArguments, IdBuilt, IdExtract, IdFocus, IdLexicalThis, IdSuper, GlobalError, GlobalInfinity,
	LetLexicalThis, LitEmptyString, LitNull, LitStrThrow, LitZero, ReturnBuilt, ReturnFocus,
	SetLexicalThis, SwitchCaseNoMatch, ThrowAssertFail, ThrowNoCaseMatch} from './ast-constants'
import {setup, tearDown, verifyResults, withFunKind} from './context'
import transpileExcept, {transpileCatch} from './transpileExcept'
import {transpileMethodToDefinition, transpileMethodToProperty} from './transpileMethod'
import transpileModule, {exportNamedOrDefault} from './transpileModule'
import {accessLocalDeclare, blockWrap, blockWrapIfBlock, blockWrapIfVal, callFocusFun, declare,
	doThrow, focusFun, idForDeclareCached, lazyWrap, makeDeclarator, makeDestructureDeclarators,
	maybeWrapInCheckContains, memberStringOrVal, msCall, msMember, opTypeCheckForLocalDeclare, t0,
	t1, t2, t3, tLines, transpileName} from './util'

/** Transform a {@link MsAst} into an esast. **/
export default function transpile(moduleExpression, verifyResults) {
	setup(verifyResults)
	const res = t0(moduleExpression)
	tearDown()
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

	BagEntry() {
		return msCall(this.isMany ? 'addMany' : 'add', IdBuilt, t0(this.value))
	},

	BagSimple() {
		return new ArrayExpression(this.parts.map(t0))
	},

	Block(lead=null, opReturnType=null, follow=null) {
		const kind = verifyResults.blockKind(this)
		switch (kind) {
			case Blocks.Do:
				assert(opReturnType === null)
				return new BlockStatement(cat(lead, tLines(this.lines), follow))
			case Blocks.Throw:
				return new BlockStatement(
					cat(lead, tLines(rtail(this.lines)), t0(last(this.lines))))
			case Blocks.Return:
				return transpileBlockReturn(
					t0(last(this.lines)), tLines(rtail(this.lines)), lead, opReturnType)
			case Blocks.Bag: case Blocks.Map: case Blocks.Obj: {
				const declare = kind === Blocks.Bag ?
					DeclareBuiltBag :
					kind === Blocks.Map ? DeclareBuiltMap : DeclareBuiltObj
				const body = cat(declare, tLines(this.lines))
				return transpileBlockReturn(IdBuilt, body, lead, opReturnType)
			}
			default:
				throw new Error(kind)
		}
	},

	BlockWrap() {
		return blockWrap(t0(this.block))
	},

	Break() {
		return ifElse(this.opValue,
			_ => new ReturnStatement(t0(_)),
			() => new BreakStatement())
	},

	Call() {
		return new CallExpression(t0(this.called), this.args.map(t0))
	},

	Case() {
		const body = caseBody(this.parts, this.opElse)
		if (verifyResults.isStatement(this))
			return ifElse(this.opCased, _ => new BlockStatement([t0(_), body]), () => body)
		else {
			const block = ifElse(this.opCased, _ => [t0(_), body], () => [body])
			return blockWrap(new BlockStatement(block))
		}
	},

	CasePart(alternate) {
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
	},

	Class() {
		const methods = cat(
			this.statics.map(_ => transpileMethodToDefinition(_, true)),
			opMap(this.opConstructor, t0),
			this.methods.map(_ => transpileMethodToDefinition(_, false)))
		const opName = opMap(verifyResults.opName(this), identifier)
		const classExpr = new ClassExpression(opName,
			opMap(this.opSuperClass, t0), new ClassBody(methods))

		if (this.opDo === null && isEmpty(this.kinds))
			return classExpr
		else {
			const lead = cat(
				new VariableDeclaration('const', [
					new VariableDeclarator(IdFocus, classExpr)]),
				this.kinds.map(_ => msCall('kindDo', IdFocus, t0(_))))
			const block = ifElse(this.opDo,
				_ => t3(_.block, lead, null, ReturnFocus),
				() => new BlockStatement(cat(lead, ReturnFocus)))
			return blockWrap(block)
		}
	},

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

	Constructor() {
		// If there is a `super`, `this` will not be defined until then,
		// so must wait until then.
		// Otherwise, do it at the beginning.
		return MethodDefinition.constructor(verifyResults.constructorHasSuper(this) ?
			t2(this.fun, LetLexicalThis, true) :
			t1(this.fun, constructorSetMembers(this)))
	},

	Catch: transpileCatch,

	Except: transpileExcept,

	For() {
		return blockWrapIfVal(this, forLoop(this.opIteratee, this.block))
	},

	ForAsync() {
		const {element, bag} = this.iteratee
		const func = new FunctionExpression(null, [t0(element)], t0(this.block), true)
		const call = msCall('$for', t0(bag), func)
		return verifyResults.isStatement(this) ? new YieldExpression(call) : call
	},

	ForBag() {
		return blockWrap(new BlockStatement([
			DeclareBuiltBag,
			forLoop(this.opIteratee, this.block),
			ReturnBuilt
		]))
	},

	// leadStatements comes from constructor members
	// dontDeclareThis: applies if this is the fun for a Constructor,
	// which may declare `this` at a `super` call.
	Fun(leadStatements=null, dontDeclareThis=false) {
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

			const body =() => t2(this.block, lead, this.opReturnType)
			const args = this.args.map(t0)
			const id = opMap(verifyResults.opName(this), identifier)

			switch (this.kind) {
				case Funs.Plain:
					// TODO:ES6 Should be able to use rest args in arrow function
					if (id === null && this.opDeclareThis === null && opDeclareRest === null)
						return new ArrowFunctionExpression(args, body())
					else
						return new FunctionExpression(id, args, body())
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
	},

	GetterFun() {
		// _ => _.foo
		return focusFun(memberStringOrVal(IdFocus, this.name))
	},

	Ignore() {
		return []
	},

	Kind() {
		const name = new Literal(verifyResults.name(this))
		const supers = new ArrayExpression(this.superKinds.map(t0))
		const methods = _ =>
			new ObjectExpression(_.map(transpileMethodToProperty))
		const kind = msCall('kind', name, supers, methods(this.statics), methods(this.methods))

		if (this.opDo === null)
			return kind
		else {
			const lead = new VariableDeclaration('const',
				[new VariableDeclarator(IdFocus, kind)])
			return blockWrap(t3(this.opDo.block, lead, null, ReturnFocus))
		}
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

	LocalDeclare() { return new Identifier(idForDeclareCached(this).name) },

	LocalMutate() {
		return new AssignmentExpression('=', identifier(this.name), t0(this.value))
	},

	Logic() {
		const op = this.kind === Logics.And ? '&&' : '||'
		return tail(this.args).reduce(
			(a, b) => new LogicalExpression(op, a, t0(b)),
			t0(this.args[0]))
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

	Method() {
		const name = new Literal(verifyResults.name(this))

		let args
		if (this.fun.opRestArg !== null)
			// TODO: do something better for rest arg
			args = new UnaryExpression('void', new Literal(0))
		else
			args = new ArrayExpression(this.fun.args.map(arg => {
				const name = new Literal(arg.name)
				const opType = opMap(arg.opType, t0)
				return ifElse(opType,
					_ => new ArrayExpression([name, _]),
					() => name)
			}))

		const impl = this.fun instanceof Fun ? [t0(this.fun)] : []
		return msCall('method', name, args, ...impl)
	},

	Module: transpileModule,

	New() {
		return new NewExpression(t0(this.type), this.args.map(t0))
	},

	Not() { return new UnaryExpression('!', t0(this.arg)) },

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

	Pipe() {
		return this.pipes.reduce((expr, pipe) => callFocusFun(t0(pipe), expr), t0(this.value))
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

	SimpleFun() {
		return focusFun(t0(this.value))
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

	Switch() {
		const parts = flatMap(this.parts, t0)
		parts.push(ifElse(this.opElse,
			_ => new SwitchCase(undefined, t0(_).body),
			() => SwitchCaseNoMatch))
		return blockWrapIfVal(this, new SwitchStatement(t0(this.switched), parts))
	},

	SwitchPart() {
		const follow = opIf(verifyResults.isStatement(this), () => new BreakStatement)
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
	},

	Throw() {
		return ifElse(this.opThrown,
			_ => doThrow(_),
			() => new ThrowStatement(new NewExpression(GlobalError, [LitStrThrow])))
	},

	With() {
		const idDeclare = idForDeclareCached(this.declare)
		const val = t0(this.value)
		const lead = new VariableDeclaration('const', [new VariableDeclarator(idDeclare, val)])
		return verifyResults.isStatement(this) ?
			t1(this.block, lead) :
			blockWrap(t3(this.block, lead, null, new ReturnStatement(idDeclare)))
	},

	Yield() {
		return new YieldExpression(opMap(this.opYielded, t0), false)
	},

	YieldTo() {
		return new YieldExpression(t0(this.yieldedTo), true)
	}
})

// Functions specific to certain expressions

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

function transpileBlockReturn(returned, lines, lead, opReturnType) {
	const ret = new ReturnStatement(
		maybeWrapInCheckContains(returned, opReturnType, 'returned value'))
	return new BlockStatement(cat(lead, lines, ret))
}
