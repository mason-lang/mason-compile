import {Funs} from '../MsAst'
import VerifyResults from '../VerifyResults'

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

// Can't break out of loop inside of IIFE.
export function withIIFE(action) {
	withLoop(false, action)
}

// TODO:ES6 Shouldn't need this
export function setPendingBlockLocals(val) {
	pendingBlockLocals = val
}
