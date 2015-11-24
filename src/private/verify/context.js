import {Funs} from '../MsAst'
import VerifyResults from '../VerifyResults'
import {withBlockLocals} from './locals'
import SK from './SK'

/** Map from names to LocalDeclares. */
export let locals
/** Locals that don't have to be accessed. */
export let okToNotUse
export let opLoop
/**
Locals for this block.
These are added to locals when entering a Function or lazy evaluation.
In:
	a = |
		b
	b = 1
`b` will be a pending local.
However:
	a = b
	b = 1
will fail to verify, because `b` comes after `a` and is not accessed inside a function.
It would work for `~a is b`, though.
*/
export let pendingBlockLocals
/**
Kind of function we are currently in.
(Funs.Plain if not in a function.)
*/
export let funKind
/** Current method we are in, or a Constructor, or null. */
export let method
/** @type {VerifyResults} */
export let results
/** Name of the closest AssignSingle. */
export let name
/**
Whether we're in a `switch` inside of a `for`.
If there's a `break` statement, the loop will need a label.
*/
export let isInSwitch

export function setup() {
	locals = new Map()
	pendingBlockLocals = []
	funKind = Funs.Plain
	okToNotUse = new Set()
	opLoop = null
	method = null
	results = new VerifyResults()
}

// Release for garbage collection.
export function tearDown() {
	locals = okToNotUse = opLoop = pendingBlockLocals = method = results = null
}

export function withInFunKind(newFunKind, action) {
	const oldFunKind = funKind
	funKind = newFunKind
	action()
	funKind = oldFunKind
}

export function withLoop(newLoop, action) {
	const oldLoop = opLoop
	opLoop = newLoop
	action()
	opLoop = oldLoop
}

export function withMethod(newMethod, action) {
	const oldMethod = method
	method = newMethod
	action()
	method = oldMethod
}

export function withName(newName, action) {
	const oldName = name
	name = newName
	action()
	name = oldName
}

/** Can't break out of loop inside of IIFE. */
export function withIife(action) {
	withLoop(null, () => {
		withInSwitch(false, action)
	})
}

export function withIifeIf(cond, action) {
	if (cond)
		withIife(action)
	else
		action()
}

/** The value form of some expressions need to be wrapped in an IIFE. */
export function withIifeIfVal(sk, action) {
	withIifeIf(sk === SK.Val, action)
}

// TODO:ES6 Shouldn't need this
export function setPendingBlockLocals(val) {
	pendingBlockLocals = val
}

export function withInSwitch(newInSwitch, action) {
	const oldInSwitch = isInSwitch
	isInSwitch = newInSwitch
	action()
	isInSwitch = oldInSwitch
}

export function withFun(funKind, action) {
	withBlockLocals(() => {
		withInFunKind(funKind, () => {
			withIife(action)
		})
	})
}
