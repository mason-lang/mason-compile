(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.util = mod.exports;
	}
})(this, function (exports) {
	/**
 Used to ensure that the compiler is programmed correctly.
 If an assertion fails, it's a bug in mason-compile.
 For errors in source code, see {@link check}.
 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.assert = assert;
	exports.cat = cat;
	exports.flatMap = flatMap;
	exports.flatOpMap = flatOpMap;
	exports.head = head;
	exports.ifElse = ifElse;
	exports.implementMany = implementMany;
	exports.isEmpty = isEmpty;
	exports.last = last;
	exports.opEach = opEach;
	exports.opIf = opIf;
	exports.opMap = opMap;
	exports.opOr = opOr;
	exports.reverseIter = reverseIter;
	exports.rtail = rtail;
	exports.tail = tail;
	exports.type = type;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	function assert(cond) {
		if (!cond) throw new Error('Assertion failed.');
	}

	/**
 Combine many values into one array.
 Arrays are flattened and nulls are skipped.
 So `cat([1, 2], null, 3)` is `[1, 2, 3]`.
 */

	function cat() {
		// TODO:ES6 Splat
		const parts = Array.prototype.slice.call(arguments);
		const out = [];
		for (const _ of parts) if (_ instanceof Array) out.push.apply(out, _toConsumableArray(_));else if (_ !== null) out.push(_);
		return out;
	}

	/**
 Like `Array.prototype.map` but `mapper` should return Arrays,
 which are flattened to a single Array.
 */

	function flatMap(mapped, mapper) {
		const out = [];
		for (let i = 0; i < mapped.length; i = i + 1) out.push.apply(out, _toConsumableArray(mapper(mapped[i], i)));
		return out;
	}

	/** Like `Array.prototype.map`, but if `opMapper` returns null, that entry is skipped. */

	function flatOpMap(array, opMapper) {
		const out = [];
		for (const em of array) {
			const _ = opMapper(em);
			if (_ !== null) out.push(_);
		}
		return out;
	}

	/** First element of an Array. */

	function head(array) {
		assert(!isEmpty(array));
		return array[0];
	}

	/** Take a different action depending on whether `op` is null. */

	function ifElse(op, ifSome, ifNone) {
		return op === null ? ifNone() : ifSome(op);
	}

	/**
 Implement a method `methodName` on many types at once.
 @param {object} types Object containing many types.
 @param {string} methodName
 @param {object} impls
 	Keys are names of types in `types`.
 	Values are implementations of the method.
 */

	function implementMany(types, methodName, impls) {
		for (const name in impls) types[name].prototype[methodName] = impls[name];
	}

	/** False iff there are any elements in the array. */

	function isEmpty(array) {
		return array.length === 0;
	}

	/** Element at the end of an Array. */

	function last(array) {
		assert(!isEmpty(array));
		return array[array.length - 1];
	}

	/** Do `action` if `op` is not null. */

	function opEach(op, action) {
		if (op !== null) action(op);
	}

	/**
 Create an optional value, which is `null` unless `cond`.
 @param {boolean} cond
 @param {Function} makeOp
 */

	function opIf(cond, makeOp) {
		return cond ? makeOp() : null;
	}

	/** Call a function on an optional value, but only if it's not null. */

	function opMap(op, mapper) {
		return op === null ? null : mapper(op);
	}

	/** If an optional value is `null`, replace it. */

	function opOr(op, or) {
		return op === null ? or() : op;
	}

	/** Iterate over an Array in reverse. */

	function* reverseIter(array) {
		for (let i = array.length - 1; i >= 0; i = i - 1) yield array[i];
	}

	/** All but the last element of an Array. */

	function rtail(array) {
		assert(!isEmpty(array));
		return array.slice(0, array.length - 1);
	}

	/** All but the first element of an Array. */

	function tail(array) {
		assert(!isEmpty(array));
		return array.slice(1);
	}

	/** Asserts the type of a variable. */

	function type(instance, itsType) {
		if (!(Object(instance) instanceof itsType)) throw new Error(`${ instance } is not a ${ itsType.name }`);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtPLFVBQVMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJLENBQUMsSUFBSSxFQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtFQUNyQzs7Ozs7Ozs7QUFPTSxVQUFTLEdBQUcsR0FBRzs7QUFFckIsUUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ25ELFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNkLE9BQUssTUFBTSxDQUFDLElBQUksS0FBSyxFQUNwQixJQUFJLENBQUMsWUFBWSxLQUFLLEVBQ3JCLEdBQUcsQ0FBQyxJQUFJLE1BQUEsQ0FBUixHQUFHLHFCQUFTLENBQUMsRUFBQyxDQUFBLEtBQ1YsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2IsU0FBTyxHQUFHLENBQUE7RUFDVjs7Ozs7OztBQU1NLFVBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdkMsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ2QsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQzNDLEdBQUcsQ0FBQyxJQUFJLE1BQUEsQ0FBUixHQUFHLHFCQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQTtBQUNsQyxTQUFPLEdBQUcsQ0FBQTtFQUNWOzs7O0FBR00sVUFBUyxTQUFTLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRTtBQUMxQyxRQUFN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QUFDdkMsTUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxPQUFPLENBQUEsQUFBQyxFQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsR0FBRSxRQUFRLEVBQUMsVUFBVSxHQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7RUFDeEQiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuVXNlZCB0byBlbnN1cmUgdGhhdCB0aGUgY29tcGlsZXIgaXMgcHJvZ3JhbW1lZCBjb3JyZWN0bHkuXG5JZiBhbiBhc3NlcnRpb24gZmFpbHMsIGl0J3MgYSBidWcgaW4gbWFzb24tY29tcGlsZS5cbkZvciBlcnJvcnMgaW4gc291cmNlIGNvZGUsIHNlZSB7QGxpbmsgY2hlY2t9LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnQoY29uZCkge1xuXHRpZiAoIWNvbmQpXG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBc3NlcnRpb24gZmFpbGVkLicpXG59XG5cbi8qKlxuQ29tYmluZSBtYW55IHZhbHVlcyBpbnRvIG9uZSBhcnJheS5cbkFycmF5cyBhcmUgZmxhdHRlbmVkIGFuZCBudWxscyBhcmUgc2tpcHBlZC5cblNvIGBjYXQoWzEsIDJdLCBudWxsLCAzKWAgaXMgYFsxLCAyLCAzXWAuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNhdCgpIHtcblx0Ly8gVE9ETzpFUzYgU3BsYXRcblx0Y29uc3QgcGFydHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXG5cdGNvbnN0IG91dCA9IFtdXG5cdGZvciAoY29uc3QgXyBvZiBwYXJ0cylcblx0XHRpZiAoXyBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0b3V0LnB1c2goLi4uXylcblx0XHRlbHNlIGlmIChfICE9PSBudWxsKVxuXHRcdFx0b3V0LnB1c2goXylcblx0cmV0dXJuIG91dFxufVxuXG4vKipcbkxpa2UgYEFycmF5LnByb3RvdHlwZS5tYXBgIGJ1dCBgbWFwcGVyYCBzaG91bGQgcmV0dXJuIEFycmF5cyxcbndoaWNoIGFyZSBmbGF0dGVuZWQgdG8gYSBzaW5nbGUgQXJyYXkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXRNYXAobWFwcGVkLCBtYXBwZXIpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtYXBwZWQubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0b3V0LnB1c2goLi4ubWFwcGVyKG1hcHBlZFtpXSwgaSkpXG5cdHJldHVybiBvdXRcbn1cblxuLyoqIExpa2UgYEFycmF5LnByb3RvdHlwZS5tYXBgLCBidXQgaWYgYG9wTWFwcGVyYCByZXR1cm5zIG51bGwsIHRoYXQgZW50cnkgaXMgc2tpcHBlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGF0T3BNYXAoYXJyYXksIG9wTWFwcGVyKSB7XG5cdGNvbnN0IG91dCA9IFtdXG5cdGZvciAoY29uc3QgZW0gb2YgYXJyYXkpIHtcblx0XHRjb25zdCBfID0gb3BNYXBwZXIoZW0pXG5cdFx0aWYgKF8gIT09IG51bGwpXG5cdFx0XHRvdXQucHVzaChfKVxuXHR9XG5cdHJldHVybiBvdXRcbn1cblxuLyoqIEZpcnN0IGVsZW1lbnQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gaGVhZChhcnJheSkge1xuXHRhc3NlcnQoIWlzRW1wdHkoYXJyYXkpKVxuXHRyZXR1cm4gYXJyYXlbMF1cbn1cblxuLyoqIFRha2UgYSBkaWZmZXJlbnQgYWN0aW9uIGRlcGVuZGluZyBvbiB3aGV0aGVyIGBvcGAgaXMgbnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZkVsc2Uob3AsIGlmU29tZSwgaWZOb25lKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IGlmTm9uZSgpIDogaWZTb21lKG9wKVxufVxuXG4vKipcbkltcGxlbWVudCBhIG1ldGhvZCBgbWV0aG9kTmFtZWAgb24gbWFueSB0eXBlcyBhdCBvbmNlLlxuQHBhcmFtIHtvYmplY3R9IHR5cGVzIE9iamVjdCBjb250YWluaW5nIG1hbnkgdHlwZXMuXG5AcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZVxuQHBhcmFtIHtvYmplY3R9IGltcGxzXG5cdEtleXMgYXJlIG5hbWVzIG9mIHR5cGVzIGluIGB0eXBlc2AuXG5cdFZhbHVlcyBhcmUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSBtZXRob2QuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGltcGxlbWVudE1hbnkodHlwZXMsIG1ldGhvZE5hbWUsIGltcGxzKSB7XG5cdGZvciAoY29uc3QgbmFtZSBpbiBpbXBscylcblx0XHR0eXBlc1tuYW1lXS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBpbXBsc1tuYW1lXVxufVxuXG4vKiogRmFsc2UgaWZmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgaW4gdGhlIGFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkoYXJyYXkpIHtcblx0cmV0dXJuIGFycmF5Lmxlbmd0aCA9PT0gMFxufVxuXG4vKiogRWxlbWVudCBhdCB0aGUgZW5kIG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3QoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdXG59XG5cbi8qKiBEbyBgYWN0aW9uYCBpZiBgb3BgIGlzIG5vdCBudWxsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wRWFjaChvcCwgYWN0aW9uKSB7XG5cdGlmIChvcCAhPT0gbnVsbClcblx0XHRhY3Rpb24ob3ApXG59XG5cbi8qKlxuQ3JlYXRlIGFuIG9wdGlvbmFsIHZhbHVlLCB3aGljaCBpcyBgbnVsbGAgdW5sZXNzIGBjb25kYC5cbkBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuQHBhcmFtIHtGdW5jdGlvbn0gbWFrZU9wXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG9wSWYoY29uZCwgbWFrZU9wKSB7XG5cdHJldHVybiBjb25kID8gbWFrZU9wKCkgOiBudWxsXG59XG5cbi8qKiBDYWxsIGEgZnVuY3Rpb24gb24gYW4gb3B0aW9uYWwgdmFsdWUsIGJ1dCBvbmx5IGlmIGl0J3Mgbm90IG51bGwuICovXG5leHBvcnQgZnVuY3Rpb24gb3BNYXAob3AsIG1hcHBlcikge1xuXHRyZXR1cm4gb3AgPT09IG51bGwgPyBudWxsIDogbWFwcGVyKG9wKVxufVxuXG4vKiogSWYgYW4gb3B0aW9uYWwgdmFsdWUgaXMgYG51bGxgLCByZXBsYWNlIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wT3Iob3AsIG9yKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IG9yKCkgOiBvcFxufVxuXG4vKiogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IGluIHJldmVyc2UuICovXG5leHBvcnQgZnVuY3Rpb24qIHJldmVyc2VJdGVyKGFycmF5KSB7XG5cdGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHR5aWVsZCBhcnJheVtpXVxufVxuXG4vKiogQWxsIGJ1dCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ0YWlsKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheS5zbGljZSgwLCBhcnJheS5sZW5ndGggLSAxKVxufVxuXG4vKiogQWxsIGJ1dCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWlsKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheS5zbGljZSgxKVxufVxuXG4vKiogQXNzZXJ0cyB0aGUgdHlwZSBvZiBhIHZhcmlhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGUoaW5zdGFuY2UsIGl0c1R5cGUpIHtcblx0aWYgKCEoT2JqZWN0KGluc3RhbmNlKSBpbnN0YW5jZW9mIGl0c1R5cGUpKVxuXHRcdHRocm93IG5ldyBFcnJvcihgJHtpbnN0YW5jZX0gaXMgbm90IGEgJHtpdHNUeXBlLm5hbWV9YClcbn1cbiJdfQ==