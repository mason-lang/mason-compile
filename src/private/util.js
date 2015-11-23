/** Whether every element in `array` is equal. */
export function allSame(array, mapper) {
	if (isEmpty(array))
		return true
	const val = mapper(array[0])
	for (let i = 1; i < array.length; i = i + 1)
		if (mapper(array[i]) !== val)
			return false
	return true
}

/**
Used to ensure that the compiler is programmed correctly.
If an assertion fails, it's a bug in mason-compile.
For errors in source code, see {@link check}.
*/
export function assert(cond) {
	if (!cond)
		throw new Error('Assertion failed.')
}

/**
Combine many values into one array.
Arrays are flattened and nulls are skipped.
So `cat([1, 2], null, 3)` is `[1, 2, 3]`.
*/
export function cat(...parts) {
	const out = []
	for (const _ of parts)
		if (_ instanceof Array)
			out.push(..._)
		else if (_ !== null)
			out.push(_)
	return out
}

/**
Like `Array.prototype.map` but `mapper` should return Arrays,
which are flattened to a single Array.
*/
export function flatMap(mapped, mapper) {
	const out = []
	for (let i = 0; i < mapped.length; i = i + 1)
		out.push(...mapper(mapped[i], i))
	return out
}

/** Like `Array.prototype.map`, but if `opMapper` returns null, that entry is skipped. */
export function flatOpMap(array, opMapper) {
	const out = []
	for (const em of array) {
		const _ = opMapper(em)
		if (_ !== null)
			out.push(_)
	}
	return out
}

/** First element of an Array. */
export function head(array) {
	assert(!isEmpty(array))
	return array[0]
}

/** Take a different action depending on whether `op` is null. */
export function ifElse(op, ifSome, ifNone) {
	return op === null ? ifNone() : ifSome(op)
}

/**
Implement a method `methodName` on many types at once.
@param {object} types Object containing many types.
@param {string} methodName
@param {object} impls
	Keys are names of types in `types`.
	Values are implementations of the method.
*/
export function implementMany(types, methodName, impls) {
	for (const name in impls)
		types[name].prototype[methodName] = impls[name]
}

/** False iff there are any elements in the array. */
export function isEmpty(array) {
	return array.length === 0
}

/** Element at the end of an Array. */
export function last(array) {
	assert(!isEmpty(array))
	return array[array.length - 1]
}

/** Do `action` if `op` is not null. */
export function opEach(op, action) {
	if (op !== null)
		action(op)
}

/**
Create an optional value, which is `null` unless `cond`.
@param {boolean} cond
@param {Function} makeOp
*/
export function opIf(cond, makeOp) {
	return cond ? makeOp() : null
}

/** Call a function on an optional value, but only if it's not null. */
export function opMap(op, mapper) {
	return op === null ? null : mapper(op)
}

/** If an optional value is `null`, replace it. */
export function opOr(op, or) {
	return op === null ? or() : op
}

/** Iterate over an Array in reverse. */
export function* reverseIter(array) {
	for (let i = array.length - 1; i >= 0; i = i - 1)
		yield array[i]
}

/** All but the last element of an Array. */
export function rtail(array) {
	assert(!isEmpty(array))
	return array.slice(0, array.length - 1)
}

/** All but the first element of an Array. */
export function tail(array) {
	assert(!isEmpty(array))
	return array.slice(1)
}

/** Wrap value in an Array if it's not already one. */
export function toArray(value) {
	return value instanceof Array ? value : [value]
}
