import {Funs} from '../MsAst'

export let verifyResults
/** Whether we are in an async/generator function. */
export let funKind
export let nextDestructuredId

export function setup(_verifyResults) {
	verifyResults = _verifyResults
	funKind = Funs.Plain
	nextDestructuredId = 0
}

export function tearDown() {
	// Release for garbage collection.
	verifyResults = null
}

export function getDestructuredId() {
	const _ = nextDestructuredId
	nextDestructuredId = nextDestructuredId + 1
	return _
}

export function withFunKind(newFunKind, func) {
	const oldFunKind = funKind
	funKind = newFunKind
	const _ = func()
	funKind = oldFunKind
	return _
}
