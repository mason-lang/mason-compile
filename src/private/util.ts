import Op, {nonNull} from 'op/Op'

/** Whether every element in `array` is equal. */
export function allSame<A, B>(array: Array<A>, mapper: (a: A) => B): boolean {
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
For errors in source code, see [[check]].
*/
export function assert(cond: boolean): void {
	if (!cond)
		throw new Error('Assertion failed.')
}

/**
Combine many values into one array.
Arrays are flattened and nulls are skipped.
So `cat([1, 2], null, 3)` is `[1, 2, 3]`.
*/
export function cat<A>(...parts: Array<Array<A> | Op<A> | Op<Array<A>>>): Array<A> {
	const out: Array<A> = []
	for (const _ of parts)
		if (_ instanceof Array)
			out.push(..._)
		else if (nonNull<A>(_))
			out.push(_)
	return out
}

/**
Like `Array.prototype.map` but `mapper` should return Arrays,
which are flattened to a single Array.
*/
export function flatMap<A, B>(
	mapped: Array<A>,
	mapper: (a: A, index?: number) => Array<B>)
	: Array<B> {
	const out: Array<B> = []
	for (let i = 0; i < mapped.length; i = i + 1)
		out.push(...mapper(mapped[i], i))
	return out
}

/** First element of an Array. */
export function head<A>(array: Array<A>): A {
	assert(!isEmpty(array))
	return array[0]
}

/** False iff there are any elements in the array. */
export function isEmpty<A>(array: Array<A>): boolean {
	return array.length === 0
}

/** Element at the end of an Array. */
export function last<A>(array: Array<A>): A {
	assert(!isEmpty(array))
	return array[array.length - 1]
}

/** Iterate over an Array in reverse. */
export function* reverseIter<A>(array: Array<A>): Iterable<A> {
	for (let i = array.length - 1; i >= 0; i = i - 1)
		yield array[i]
}

/** All but the last element of an Array. */
export function rtail<A>(array: Array<A>): Array<A> {
	assert(!isEmpty(array))
	return array.slice(0, array.length - 1)
}

/** All but the first element of an Array. */
export function tail<A>(array: Array<A>): Array<A> {
	assert(!isEmpty(array))
	return array.slice(1)
}

/** Wrap value in an Array if it's not already one. */
export function toArray<A>(value: A | Array<A>): Array<A> {
	return value instanceof Array ? value : [value]
}

/**
Used for functions that take an options objects.
Fills in defaults for options not provided.
Throws errors for provided options that aren't recognized.
A default value of `undefined` is used to indicate that the option must be provided.
*/
export function applyDefaults<A>(provided: A, defaults: A): A {
	const out: any = {}

	for (const key in provided) {
		if (!(key in defaults))
			throw new Error(`No such option ${key}.`)
		out[key] = (<any> provided)[key]
	}

	for (const key in defaults)
		if (!(key in out))
			out[key] = (<any> defaults)[key]

	return out
}
