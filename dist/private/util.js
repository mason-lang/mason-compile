'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.util = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.allSame = allSame;
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
	exports.toArray = toArray;
	exports.type = type;

	function allSame(array, mapper) {
		if (isEmpty(array)) return true;
		const val = mapper(array[0]);

		for (let i = 1; i < array.length; i = i + 1) if (mapper(array[i]) !== val) return false;

		return true;
	}

	function assert(cond) {
		if (!cond) throw new Error('Assertion failed.');
	}

	function cat() {
		const out = [];

		for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
			parts[_key] = arguments[_key];
		}

		for (const _ of parts) if (_ instanceof Array) out.push(..._);else if (_ !== null) out.push(_);

		return out;
	}

	function flatMap(mapped, mapper) {
		const out = [];

		for (let i = 0; i < mapped.length; i = i + 1) out.push(...mapper(mapped[i], i));

		return out;
	}

	function flatOpMap(array, opMapper) {
		const out = [];

		for (const em of array) {
			const _ = opMapper(em);

			if (_ !== null) out.push(_);
		}

		return out;
	}

	function head(array) {
		assert(!isEmpty(array));
		return array[0];
	}

	function ifElse(op, ifSome, ifNone) {
		return op === null ? ifNone() : ifSome(op);
	}

	function implementMany(types, methodName, impls) {
		for (const name in impls) types[name].prototype[methodName] = impls[name];
	}

	function isEmpty(array) {
		return array.length === 0;
	}

	function last(array) {
		assert(!isEmpty(array));
		return array[array.length - 1];
	}

	function opEach(op, action) {
		if (op !== null) action(op);
	}

	function opIf(cond, makeOp) {
		return cond ? makeOp() : null;
	}

	function opMap(op, mapper) {
		return op === null ? null : mapper(op);
	}

	function opOr(op, or) {
		return op === null ? or() : op;
	}

	function* reverseIter(array) {
		for (let i = array.length - 1; i >= 0; i = i - 1) yield array[i];
	}

	function rtail(array) {
		assert(!isEmpty(array));
		return array.slice(0, array.length - 1);
	}

	function tail(array) {
		assert(!isEmpty(array));
		return array.slice(1);
	}

	function toArray(value) {
		return value instanceof Array ? value : [value];
	}

	function type(instance, itsType) {
		if (!(Object(instance) instanceof itsType)) throw new Error(`${ instance } is not a ${ itsType.name }`);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBQ2dCLE9BQU8sR0FBUCxPQUFPO1NBZVAsTUFBTSxHQUFOLE1BQU07U0FVTixHQUFHLEdBQUgsR0FBRztTQWNILE9BQU8sR0FBUCxPQUFPO1NBUVAsU0FBUyxHQUFULFNBQVM7U0FXVCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBWU4sYUFBYSxHQUFiLGFBQWE7U0FNYixPQUFPLEdBQVAsT0FBTztTQUtQLElBQUksR0FBSixJQUFJO1NBTUosTUFBTSxHQUFOLE1BQU07U0FVTixJQUFJLEdBQUosSUFBSTtTQUtKLEtBQUssR0FBTCxLQUFLO1NBS0wsSUFBSSxHQUFKLElBQUk7U0FLSCxXQUFXLEdBQVgsV0FBVztTQU1aLEtBQUssR0FBTCxLQUFLO1NBTUwsSUFBSSxHQUFKLElBQUk7U0FNSixPQUFPLEdBQVAsT0FBTztTQUtQLElBQUksR0FBSixJQUFJOztVQTdJSixPQUFPOzs7Ozs7Ozs7VUFlUCxNQUFNOzs7O1VBVU4sR0FBRzs7O29DQUFJLEtBQUs7QUFBTCxRQUFLOzs7Ozs7OztVQWNaLE9BQU87Ozs7Ozs7O1VBUVAsU0FBUzs7Ozs7Ozs7Ozs7O1VBV1QsSUFBSTs7Ozs7VUFNSixNQUFNOzs7O1VBWU4sYUFBYTs7OztVQU1iLE9BQU87Ozs7VUFLUCxJQUFJOzs7OztVQU1KLE1BQU07Ozs7VUFVTixJQUFJOzs7O1VBS0osS0FBSzs7OztVQUtMLElBQUk7Ozs7V0FLSCxXQUFXOzs7O1VBTVosS0FBSzs7Ozs7VUFNTCxJQUFJOzs7OztVQU1KLE9BQU87Ozs7VUFLUCxJQUFJIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogV2hldGhlciBldmVyeSBlbGVtZW50IGluIGBhcnJheWAgaXMgZXF1YWwuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsU2FtZShhcnJheSwgbWFwcGVyKSB7XG5cdGlmIChpc0VtcHR5KGFycmF5KSlcblx0XHRyZXR1cm4gdHJ1ZVxuXHRjb25zdCB2YWwgPSBtYXBwZXIoYXJyYXlbMF0pXG5cdGZvciAobGV0IGkgPSAxOyBpIDwgYXJyYXkubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0aWYgKG1hcHBlcihhcnJheVtpXSkgIT09IHZhbClcblx0XHRcdHJldHVybiBmYWxzZVxuXHRyZXR1cm4gdHJ1ZVxufVxuXG4vKipcblVzZWQgdG8gZW5zdXJlIHRoYXQgdGhlIGNvbXBpbGVyIGlzIHByb2dyYW1tZWQgY29ycmVjdGx5LlxuSWYgYW4gYXNzZXJ0aW9uIGZhaWxzLCBpdCdzIGEgYnVnIGluIG1hc29uLWNvbXBpbGUuXG5Gb3IgZXJyb3JzIGluIHNvdXJjZSBjb2RlLCBzZWUge0BsaW5rIGNoZWNrfS5cbiovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KGNvbmQpIHtcblx0aWYgKCFjb25kKVxuXHRcdHRocm93IG5ldyBFcnJvcignQXNzZXJ0aW9uIGZhaWxlZC4nKVxufVxuXG4vKipcbkNvbWJpbmUgbWFueSB2YWx1ZXMgaW50byBvbmUgYXJyYXkuXG5BcnJheXMgYXJlIGZsYXR0ZW5lZCBhbmQgbnVsbHMgYXJlIHNraXBwZWQuXG5TbyBgY2F0KFsxLCAyXSwgbnVsbCwgMylgIGlzIGBbMSwgMiwgM11gLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXQoLi4ucGFydHMpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBfIG9mIHBhcnRzKVxuXHRcdGlmIChfIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRvdXQucHVzaCguLi5fKVxuXHRcdGVsc2UgaWYgKF8gIT09IG51bGwpXG5cdFx0XHRvdXQucHVzaChfKVxuXHRyZXR1cm4gb3V0XG59XG5cbi8qKlxuTGlrZSBgQXJyYXkucHJvdG90eXBlLm1hcGAgYnV0IGBtYXBwZXJgIHNob3VsZCByZXR1cm4gQXJyYXlzLFxud2hpY2ggYXJlIGZsYXR0ZW5lZCB0byBhIHNpbmdsZSBBcnJheS5cbiovXG5leHBvcnQgZnVuY3Rpb24gZmxhdE1hcChtYXBwZWQsIG1hcHBlcikge1xuXHRjb25zdCBvdXQgPSBbXVxuXHRmb3IgKGxldCBpID0gMDsgaSA8IG1hcHBlZC5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRvdXQucHVzaCguLi5tYXBwZXIobWFwcGVkW2ldLCBpKSlcblx0cmV0dXJuIG91dFxufVxuXG4vKiogTGlrZSBgQXJyYXkucHJvdG90eXBlLm1hcGAsIGJ1dCBpZiBgb3BNYXBwZXJgIHJldHVybnMgbnVsbCwgdGhhdCBlbnRyeSBpcyBza2lwcGVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXRPcE1hcChhcnJheSwgb3BNYXBwZXIpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBlbSBvZiBhcnJheSkge1xuXHRcdGNvbnN0IF8gPSBvcE1hcHBlcihlbSlcblx0XHRpZiAoXyAhPT0gbnVsbClcblx0XHRcdG91dC5wdXNoKF8pXG5cdH1cblx0cmV0dXJuIG91dFxufVxuXG4vKiogRmlyc3QgZWxlbWVudCBvZiBhbiBBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZWFkKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheVswXVxufVxuXG4vKiogVGFrZSBhIGRpZmZlcmVudCBhY3Rpb24gZGVwZW5kaW5nIG9uIHdoZXRoZXIgYG9wYCBpcyBudWxsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlmRWxzZShvcCwgaWZTb21lLCBpZk5vbmUpIHtcblx0cmV0dXJuIG9wID09PSBudWxsID8gaWZOb25lKCkgOiBpZlNvbWUob3ApXG59XG5cbi8qKlxuSW1wbGVtZW50IGEgbWV0aG9kIGBtZXRob2ROYW1lYCBvbiBtYW55IHR5cGVzIGF0IG9uY2UuXG5AcGFyYW0ge29iamVjdH0gdHlwZXMgT2JqZWN0IGNvbnRhaW5pbmcgbWFueSB0eXBlcy5cbkBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lXG5AcGFyYW0ge29iamVjdH0gaW1wbHNcblx0S2V5cyBhcmUgbmFtZXMgb2YgdHlwZXMgaW4gYHR5cGVzYC5cblx0VmFsdWVzIGFyZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIG1ldGhvZC5cbiovXG5leHBvcnQgZnVuY3Rpb24gaW1wbGVtZW50TWFueSh0eXBlcywgbWV0aG9kTmFtZSwgaW1wbHMpIHtcblx0Zm9yIChjb25zdCBuYW1lIGluIGltcGxzKVxuXHRcdHR5cGVzW25hbWVdLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IGltcGxzW25hbWVdXG59XG5cbi8qKiBGYWxzZSBpZmYgdGhlcmUgYXJlIGFueSBlbGVtZW50cyBpbiB0aGUgYXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eShhcnJheSkge1xuXHRyZXR1cm4gYXJyYXkubGVuZ3RoID09PSAwXG59XG5cbi8qKiBFbGVtZW50IGF0IHRoZSBlbmQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdChhcnJheSkge1xuXHRhc3NlcnQoIWlzRW1wdHkoYXJyYXkpKVxuXHRyZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV1cbn1cblxuLyoqIERvIGBhY3Rpb25gIGlmIGBvcGAgaXMgbm90IG51bGwuICovXG5leHBvcnQgZnVuY3Rpb24gb3BFYWNoKG9wLCBhY3Rpb24pIHtcblx0aWYgKG9wICE9PSBudWxsKVxuXHRcdGFjdGlvbihvcClcbn1cblxuLyoqXG5DcmVhdGUgYW4gb3B0aW9uYWwgdmFsdWUsIHdoaWNoIGlzIGBudWxsYCB1bmxlc3MgYGNvbmRgLlxuQHBhcmFtIHtib29sZWFufSBjb25kXG5AcGFyYW0ge0Z1bmN0aW9ufSBtYWtlT3BcbiovXG5leHBvcnQgZnVuY3Rpb24gb3BJZihjb25kLCBtYWtlT3ApIHtcblx0cmV0dXJuIGNvbmQgPyBtYWtlT3AoKSA6IG51bGxcbn1cblxuLyoqIENhbGwgYSBmdW5jdGlvbiBvbiBhbiBvcHRpb25hbCB2YWx1ZSwgYnV0IG9ubHkgaWYgaXQncyBub3QgbnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcE1hcChvcCwgbWFwcGVyKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IG51bGwgOiBtYXBwZXIob3ApXG59XG5cbi8qKiBJZiBhbiBvcHRpb25hbCB2YWx1ZSBpcyBgbnVsbGAsIHJlcGxhY2UgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gb3BPcihvcCwgb3IpIHtcblx0cmV0dXJuIG9wID09PSBudWxsID8gb3IoKSA6IG9wXG59XG5cbi8qKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgaW4gcmV2ZXJzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiogcmV2ZXJzZUl0ZXIoYXJyYXkpIHtcblx0Zm9yIChsZXQgaSA9IGFycmF5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdHlpZWxkIGFycmF5W2ldXG59XG5cbi8qKiBBbGwgYnV0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gcnRhaWwoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5LnNsaWNlKDAsIGFycmF5Lmxlbmd0aCAtIDEpXG59XG5cbi8qKiBBbGwgYnV0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRhaWwoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5LnNsaWNlKDEpXG59XG5cbi8qKiBXcmFwIHZhbHVlIGluIGFuIEFycmF5IGlmIGl0J3Mgbm90IGFscmVhZHkgb25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXkodmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgPyB2YWx1ZSA6IFt2YWx1ZV1cbn1cblxuLyoqIEFzc2VydHMgdGhlIHR5cGUgb2YgYSB2YXJpYWJsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0eXBlKGluc3RhbmNlLCBpdHNUeXBlKSB7XG5cdGlmICghKE9iamVjdChpbnN0YW5jZSkgaW5zdGFuY2VvZiBpdHNUeXBlKSlcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCR7aW5zdGFuY2V9IGlzIG5vdCBhICR7aXRzVHlwZS5uYW1lfWApXG59XG4iXX0=