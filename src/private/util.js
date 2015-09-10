export const
	assert = cond => {
		if (!cond)
			throw new Error('Assertion failed.')
	},

	cat = function() {
		// TODO:ES6 Splat
		const parts = Array.prototype.slice.call(arguments)
		const out = [ ]
		for (const _ of parts)
			if (_ instanceof Array)
				out.push(..._)
			else if (_ !== null)
				out.push(_)
		return out
	},

	flatMap = (mapped, mapper) => {
		const out = []
		for (let i = 0; i < mapped.length; i = i + 1)
			out.push(...mapper(mapped[i], i))
		return out
	},

	// flatMap where opMapper returns optionals instead of arrays.
	flatOpMap = (arr, opMapper) => {
		const out = [ ]
		for (const em of arr) {
			const _ = opMapper(em)
			if (_ !== null)
				out.push(_)
		}
		return out
	},

	head = arr => {
		assert(!isEmpty(arr))
		return arr[0]
	},

	ifElse = (op, ifSome, ifNone) =>
		op === null ? ifNone() : ifSome(op),

	implementMany = (holder, methodName, nameToImpl) => {
		for (const name in nameToImpl)
			holder[name].prototype[methodName] = nameToImpl[name]
	},

	isEmpty = arr => arr.length === 0,

	// -0 is negative
	isPositive = n => n >= 0 && 1 / n !== -Infinity,

	last = arr => {
		assert(!isEmpty(arr))
		return arr[arr.length - 1]
	},

	opEach = (op, mapper) =>
		op === null ? null : mapper(op),

	opIf = (cond, makeOp) =>
		cond ? makeOp() : null,

	opMap = opEach,

	repeat = (em, n) => {
		assert(n >= 0)
		const out = []
		for (let i = n; i > 0; i = i - 1)
			out.push(em)
		return out
	},

	reverseIter = function*(array) {
		for (let i = array.length - 1; i >= 0; i = i - 1)
			yield array[i]
	},

	rtail = arr => {
		assert(!isEmpty(arr))
		return arr.slice(0, arr.length - 1)
	},

	tail = arr => {
		assert(!isEmpty(arr))
		return arr.slice(1)
	},

	type = (instance, itsType) => {
		if (!(Object(instance) instanceof itsType))
			throw new Error(`${instance} is not a ${itsType.name}`)
	}
