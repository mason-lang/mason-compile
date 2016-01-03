import {Funs} from '../ast/Fun'
import VerifyResults from '../VerifyResults'

export let verifyResults: VerifyResults
export let funKind: Funs
export let nextDestructuredId: number

export function setup(_verifyResults: VerifyResults): void {
	verifyResults = _verifyResults
	funKind = Funs.Plain
	nextDestructuredId = 0
}

export function tearDown(): void {
	// Release for garbage collection.
	verifyResults = null
}

export function getDestructuredId(): number {
	const _ = nextDestructuredId
	nextDestructuredId = nextDestructuredId + 1
	return _
}

export function withFunKind<A>(newFunKind: Funs, func: () => A): A {
	const oldFunKind = funKind
	funKind = newFunKind
	const _ = func()
	funKind = oldFunKind
	return _
}
