import Op from 'op/Op'
import {Constructor} from '../ast/Class'
import {MethodImplLike} from '../ast/classTraitCommon'
import {Funs} from '../ast/Fun'
import {LocalDeclare} from '../ast/locals'
import Loop from '../ast/Loop'
import VerifyResults from '../VerifyResults'
import SK from './SK'
import {withBlockLocals} from './verifyLocals'

/** Map from names to LocalDeclares. */
export let locals: Map<string, LocalDeclare>
/** Locals that don't have to be accessed. */
export let okToNotUse: Set<LocalDeclare>
/** Current loop context. `sk` is the [[SK]] for the loop. */
export let opLoop: Op<{loop: Loop, sk: SK}>
/**
Locals for this block.
These are added to locals when entering a Function or lazy evaluation.
In:
	a = |
		b
	b = 1
`b` will be a pending local and it will verify.
However:
	a = b
	b = 1
will fail to verify, because `b` comes after `a` and is not accessed inside a function.
*/
export let pendingBlockLocals: Array<LocalDeclare>
/**
Kind of function we are currently in.
Tells us whether `yield` / `async` are allowed.
If not in any function, this is [[Funs.Plain]].
*/
export let funKind: Funs
/** Current method we are in, or a Constructor, or null. */
export let method: Op<Constructor | MethodImplLike>
export let results: VerifyResults
/** Name of the closest AssignSingle. */
export let name: string
/**
Whether we're in a `switch` inside of a `for`.
If there's a `break` statement, the loop will need a label.
*/
export let isInSwitch: boolean

/** Called once at the beginning of [[verify]]. */
export function setup(): void {
	locals = new Map()
	pendingBlockLocals = []
	funKind = Funs.Plain
	okToNotUse = new Set()
	opLoop = null
	method = null
	results = new VerifyResults()
}

// Release for garbage collection.
export function tearDown(): void {
	locals = okToNotUse = opLoop = pendingBlockLocals = method = results = null
}

export function withLoop(newLoop: Op<{loop: Loop, sk: SK}>, action: () => void): void {
	const oldLoop = opLoop
	opLoop = newLoop
	action()
	opLoop = oldLoop
}

export function withMethod(newMethod: Constructor | MethodImplLike, action: () => void): void {
	const oldMethod = method
	method = newMethod
	action()
	method = oldMethod
}

export function withName(newName: string, action: () => void): void {
	const oldName = name
	name = newName
	action()
	name = oldName
}

/** Can't break out of loop inside of IIFE. */
export function withIife(action: () => void): void {
	withLoop(null, () => {
		withInSwitch(false, action)
	})
}

export function withIifeIf(cond: boolean, action: () => void): void {
	if (cond)
		withIife(action)
	else
		action()
}

/** The value form of some expressions need to be wrapped in an IIFE. */
export function withIifeIfVal(sk: SK, action: () => void): void {
	withIifeIf(sk === SK.Val, action)
}

// TODO:ES6 Shouldn't need this. `export let` should just work.
export function setPendingBlockLocals(val: Array<LocalDeclare>): void {
	pendingBlockLocals = val
}

export function withInSwitch(newInSwitch: boolean, action: () => void): void {
	const oldInSwitch = isInSwitch
	isInSwitch = newInSwitch
	action()
	isInSwitch = oldInSwitch
}

export function withFun(funKind: Funs, action: () => void): void {
	withBlockLocals(() => {
		withInFunKind(funKind, () => {
			withIife(action)
		})
	})
}

export function withMethods(action: () => void): void {
	withFun(Funs.Plain, action)
}

function withInFunKind(newFunKind: Funs, action: () => void): void {
	const oldFunKind = funKind
	funKind = newFunKind
	action()
	funKind = oldFunKind
}
