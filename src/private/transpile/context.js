export let verifyResults
/** Whether we are in an async/generator function. */
export let isInGenerator
export let isInConstructor
export let nextDestructuredId

export function setup(_verifyResults) {
	verifyResults = _verifyResults
	isInGenerator = false
	isInConstructor = false
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

export function withInConstructor(func) {
	const oldInConstructor = isInConstructor
	isInConstructor = true
	const _ = func()
	isInConstructor = oldInConstructor
	return _
}

export function withInGenerator(newInGenerator, func) {
	const oldInGenerator = isInGenerator
	isInGenerator = newInGenerator
	const _ = func()
	isInGenerator = oldInGenerator
	return _
}
