if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports'], function (exports) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWwuanMiLCJwcml2YXRlL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNLTyxVQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDNUIsTUFBSSxDQUFDLElBQUksRUFDUixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUE7RUFDckM7Ozs7Ozs7O0FBT00sVUFBUyxHQUFHLEdBQUc7O0FBRXJCLFFBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNuRCxRQUFNLEdBQUcsR0FBRyxFQUFFLENBQUE7QUFDZCxPQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFDcEIsSUFBSSxDQUFDLFlBQVksS0FBSyxFQUNyQixHQUFHLENBQUMsSUFBSSxNQUFBLENBQVIsR0FBRyxxQkFBUyxDQUFDLEVBQUMsQ0FBQSxLQUNWLElBQUksQ0FBQyxLQUFLLElBQUksRUFDbEIsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNiLFNBQU8sR0FBRyxDQUFBO0VBQ1Y7Ozs7Ozs7QUFNTSxVQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3ZDLFFBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNkLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUMzQyxHQUFHLENBQUMsSUFBSSxNQUFBLENBQVIsR0FBRyxxQkFBUyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUE7QUFDbEMsU0FBTyxHQUFHLENBQUE7RUFDVjs7OztBQUdNLFVBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDMUMsUUFBTSxHQUFHLEdB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QUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksT0FBTyxDQUFBLEFBQUMsRUFDekMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUUsUUFBUSxFQUFDLFVBQVUsR0FBRSxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO0VBQ3hEIiwiZmlsZSI6InByaXZhdGUvdXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiLyoqXG5Vc2VkIHRvIGVuc3VyZSB0aGF0IHRoZSBjb21waWxlciBpcyBwcm9ncmFtbWVkIGNvcnJlY3RseS5cbklmIGFuIGFzc2VydGlvbiBmYWlscywgaXQncyBhIGJ1ZyBpbiBtYXNvbi1jb21waWxlLlxuRm9yIGVycm9ycyBpbiBzb3VyY2UgY29kZSwgc2VlIHtAbGluayBjaGVja30uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kKSB7XG5cdGlmICghY29uZClcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Fzc2VydGlvbiBmYWlsZWQuJylcbn1cblxuLyoqXG5Db21iaW5lIG1hbnkgdmFsdWVzIGludG8gb25lIGFycmF5LlxuQXJyYXlzIGFyZSBmbGF0dGVuZWQgYW5kIG51bGxzIGFyZSBza2lwcGVkLlxuU28gYGNhdChbMSwgMl0sIG51bGwsIDMpYCBpcyBgWzEsIDIsIDNdYC5cbiovXG5leHBvcnQgZnVuY3Rpb24gY2F0KCkge1xuXHQvLyBUT0RPOkVTNiBTcGxhdFxuXHRjb25zdCBwYXJ0cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBfIG9mIHBhcnRzKVxuXHRcdGlmIChfIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRvdXQucHVzaCguLi5fKVxuXHRcdGVsc2UgaWYgKF8gIT09IG51bGwpXG5cdFx0XHRvdXQucHVzaChfKVxuXHRyZXR1cm4gb3V0XG59XG5cbi8qKlxuTGlrZSBgQXJyYXkucHJvdG90eXBlLm1hcGAgYnV0IGBtYXBwZXJgIHNob3VsZCByZXR1cm4gQXJyYXlzLFxud2hpY2ggYXJlIGZsYXR0ZW5lZCB0byBhIHNpbmdsZSBBcnJheS5cbiovXG5leHBvcnQgZnVuY3Rpb24gZmxhdE1hcChtYXBwZWQsIG1hcHBlcikge1xuXHRjb25zdCBvdXQgPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IG1hcHBlZC5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRvdXQucHVzaCguLi5tYXBwZXIobWFwcGVkW2ldLCBpKSlcblx0cmV0dXJuIG91dFxufVxuXG4vKiogTGlrZSBgQXJyYXkucHJvdG90eXBlLm1hcGAsIGJ1dCBpZiBgb3BNYXBwZXJgIHJldHVybnMgbnVsbCwgdGhhdCBlbnRyeSBpcyBza2lwcGVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXRPcE1hcChhcnJheSwgb3BNYXBwZXIpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBlbSBvZiBhcnJheSkge1xuXHRcdGNvbnN0IF8gPSBvcE1hcHBlcihlbSlcblx0XHRpZiAoXyAhPT0gbnVsbClcblx0XHRcdG91dC5wdXNoKF8pXG5cdH1cblx0cmV0dXJuIG91dFxufVxuXG4vKiogRmlyc3QgZWxlbWVudCBvZiBhbiBBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZWFkKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheVswXVxufVxuXG4vKiogVGFrZSBhIGRpZmZlcmVudCBhY3Rpb24gZGVwZW5kaW5nIG9uIHdoZXRoZXIgYG9wYCBpcyBudWxsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlmRWxzZShvcCwgaWZTb21lLCBpZk5vbmUpIHtcblx0cmV0dXJuIG9wID09PSBudWxsID8gaWZOb25lKCkgOiBpZlNvbWUob3ApXG59XG5cbi8qKlxuSW1wbGVtZW50IGEgbWV0aG9kIGBtZXRob2ROYW1lYCBvbiBtYW55IHR5cGVzIGF0IG9uY2UuXG5AcGFyYW0ge29iamVjdH0gdHlwZXMgT2JqZWN0IGNvbnRhaW5pbmcgbWFueSB0eXBlcy5cbkBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lXG5AcGFyYW0ge29iamVjdH0gaW1wbHNcblx0S2V5cyBhcmUgbmFtZXMgb2YgdHlwZXMgaW4gYHR5cGVzYC5cblx0VmFsdWVzIGFyZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIG1ldGhvZC5cbiovXG5leHBvcnQgZnVuY3Rpb24gaW1wbGVtZW50TWFueSh0eXBlcywgbWV0aG9kTmFtZSwgaW1wbHMpIHtcblx0Zm9yIChjb25zdCBuYW1lIGluIGltcGxzKVxuXHRcdHR5cGVzW25hbWVdLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGltcGxzW25hbWVdXG59XG5cbi8qKiBGYWxzZSBpZmYgdGhlcmUgYXJlIGFueSBlbGVtZW50cyBpbiB0aGUgYXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eShhcnJheSkge1xuXHRyZXR1cm4gYXJyYXkubGVuZ3RoID09PSAwXG59XG5cbi8qKiBFbGVtZW50IGF0IHRoZSBlbmQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdChhcnJheSkge1xuXHRhc3NlcnQoIWlzRW1wdHkoYXJyYXkpKVxuXHRyZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV1cbn1cblxuLyoqIERvIGBhY3Rpb25gIGlmIGBvcGAgaXMgbm90IG51bGwuICovXG5leHBvcnQgZnVuY3Rpb24gb3BFYWNoKG9wLCBhY3Rpb24pIHtcblx0aWYgKG9wICE9PSBudWxsKVxuXHRcdGFjdGlvbihvcClcbn1cblxuLyoqXG5DcmVhdGUgYW4gb3B0aW9uYWwgdmFsdWUsIHdoaWNoIGlzIGBudWxsYCB1bmxlc3MgYGNvbmRgLlxuQHBhcmFtIHtib29sZWFufSBjb25kXG5AcGFyYW0ge0Z1bmN0aW9ufSBtYWtlT3BcbiovXG5leHBvcnQgZnVuY3Rpb24gb3BJZihjb25kLCBtYWtlT3ApIHtcblx0cmV0dXJuIGNvbmQgPyBtYWtlT3AoKSA6IG51bGxcbn1cblxuLyoqIENhbGwgYSBmdW5jdGlvbiBvbiBhbiBvcHRpb25hbCB2YWx1ZSwgYnV0IG9ubHkgaWYgaXQncyBub3QgbnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcE1hcChvcCwgbWFwcGVyKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IG51bGwgOiBtYXBwZXIob3ApXG59XG5cbi8qKiBJZiBhbiBvcHRpb25hbCB2YWx1ZSBpcyBgbnVsbGAsIHJlcGxhY2UgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gb3BPcihvcCwgb3IpIHtcblx0cmV0dXJuIG9wID09PSBudWxsID8gb3IoKSA6IG9wXG59XG5cbi8qKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgaW4gcmV2ZXJzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiogcmV2ZXJzZUl0ZXIoYXJyYXkpIHtcblx0Zm9yIChsZXQgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdHlpZWxkIGFycmF5W2ldXG59XG5cbi8qKiBBbGwgYnV0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gcnRhaWwoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5LnNsaWNlKDAsIGFycmF5Lmxlbmd0aCAtIDEpXG59XG5cbi8qKiBBbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRhaWwoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5LnNsaWNlKDEpXG59XG5cbi8qKiBBc3NlcnRzIHRoZSB0eXBlIG9mIGEgdmFyaWFibGUuICovXG5leHBvcnQgZnVuY3Rpb24gdHlwZShpbnN0YW5jZSwgaXRzVHlwZSkge1xuXHRpZiAoIShPYmplY3QoaW5zdGFuY2UpIGluc3RhbmNlb2YgaXRzVHlwZSkpXG5cdFx0dGhyb3cgbmV3IEVycm9yKGAke2luc3RhbmNlfSBpcyBub3QgYSAke2l0c1R5cGUubmFtZX1gKVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
