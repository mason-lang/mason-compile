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

	function type(instance, itsType) {
		if (!(Object(instance) instanceof itsType)) throw new Error(`${ instance } is not a ${ itsType.name }`);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBS2dCLE1BQU0sR0FBTixNQUFNO1NBVU4sR0FBRyxHQUFILEdBQUc7U0FjSCxPQUFPLEdBQVAsT0FBTztTQVFQLFNBQVMsR0FBVCxTQUFTO1NBV1QsSUFBSSxHQUFKLElBQUk7U0FNSixNQUFNLEdBQU4sTUFBTTtTQVlOLGFBQWEsR0FBYixhQUFhO1NBTWIsT0FBTyxHQUFQLE9BQU87U0FLUCxJQUFJLEdBQUosSUFBSTtTQU1KLE1BQU0sR0FBTixNQUFNO1NBVU4sSUFBSSxHQUFKLElBQUk7U0FLSixLQUFLLEdBQUwsS0FBSztTQUtMLElBQUksR0FBSixJQUFJO1NBS0gsV0FBVyxHQUFYLFdBQVc7U0FNWixLQUFLLEdBQUwsS0FBSztTQU1MLElBQUksR0FBSixJQUFJO1NBTUosSUFBSSxHQUFKLElBQUk7O1VBekhKLE1BQU07Ozs7VUFVTixHQUFHOzs7b0NBQUksS0FBSztBQUFMLFFBQUs7Ozs7Ozs7O1VBY1osT0FBTzs7Ozs7Ozs7VUFRUCxTQUFTOzs7Ozs7Ozs7Ozs7VUFXVCxJQUFJOzs7OztVQU1KLE1BQU07Ozs7VUFZTixhQUFhOzs7O1VBTWIsT0FBTzs7OztVQUtQLElBQUk7Ozs7O1VBTUosTUFBTTs7OztVQVVOLElBQUk7Ozs7VUFLSixLQUFLOzs7O1VBS0wsSUFBSTs7OztXQUtILFdBQVc7Ozs7VUFNWixLQUFLOzs7OztVQU1MLElBQUk7Ozs7O1VBTUosSUFBSSIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5Vc2VkIHRvIGVuc3VyZSB0aGF0IHRoZSBjb21waWxlciBpcyBwcm9ncmFtbWVkIGNvcnJlY3RseS5cbklmIGFuIGFzc2VydGlvbiBmYWlscywgaXQncyBhIGJ1ZyBpbiBtYXNvbi1jb21waWxlLlxuRm9yIGVycm9ycyBpbiBzb3VyY2UgY29kZSwgc2VlIHtAbGluayBjaGVja30uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kKSB7XG5cdGlmICghY29uZClcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Fzc2VydGlvbiBmYWlsZWQuJylcbn1cblxuLyoqXG5Db21iaW5lIG1hbnkgdmFsdWVzIGludG8gb25lIGFycmF5LlxuQXJyYXlzIGFyZSBmbGF0dGVuZWQgYW5kIG51bGxzIGFyZSBza2lwcGVkLlxuU28gYGNhdChbMSwgMl0sIG51bGwsIDMpYCBpcyBgWzEsIDIsIDNdYC5cbiovXG5leHBvcnQgZnVuY3Rpb24gY2F0KC4uLnBhcnRzKSB7XG5cdGNvbnN0IG91dCA9IFtdXG5cdGZvciAoY29uc3QgXyBvZiBwYXJ0cylcblx0XHRpZiAoXyBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0b3V0LnB1c2goLi4uXylcblx0XHRlbHNlIGlmIChfICE9PSBudWxsKVxuXHRcdFx0b3V0LnB1c2goXylcblx0cmV0dXJuIG91dFxufVxuXG4vKipcbkxpa2UgYEFycmF5LnByb3RvdHlwZS5tYXBgIGJ1dCBgbWFwcGVyYCBzaG91bGQgcmV0dXJuIEFycmF5cyxcbndoaWNoIGFyZSBmbGF0dGVuZWQgdG8gYSBzaW5nbGUgQXJyYXkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXRNYXAobWFwcGVkLCBtYXBwZXIpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtYXBwZWQubGVuZ3RoOyBpID0gaSArIDEpXG5cdFx0b3V0LnB1c2goLi4ubWFwcGVyKG1hcHBlZFtpXSwgaSkpXG5cdHJldHVybiBvdXRcbn1cblxuLyoqIExpa2UgYEFycmF5LnByb3RvdHlwZS5tYXBgLCBidXQgaWYgYG9wTWFwcGVyYCByZXR1cm5zIG51bGwsIHRoYXQgZW50cnkgaXMgc2tpcHBlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGF0T3BNYXAoYXJyYXksIG9wTWFwcGVyKSB7XG5cdGNvbnN0IG91dCA9IFtdXG5cdGZvciAoY29uc3QgZW0gb2YgYXJyYXkpIHtcblx0XHRjb25zdCBfID0gb3BNYXBwZXIoZW0pXG5cdFx0aWYgKF8gIT09IG51bGwpXG5cdFx0XHRvdXQucHVzaChfKVxuXHR9XG5cdHJldHVybiBvdXRcbn1cblxuLyoqIEZpcnN0IGVsZW1lbnQgb2YgYW4gQXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gaGVhZChhcnJheSkge1xuXHRhc3NlcnQoIWlzRW1wdHkoYXJyYXkpKVxuXHRyZXR1cm4gYXJyYXlbMF1cbn1cblxuLyoqIFRha2UgYSBkaWZmZXJlbnQgYWN0aW9uIGRlcGVuZGluZyBvbiB3aGV0aGVyIGBvcGAgaXMgbnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZkVsc2Uob3AsIGlmU29tZSwgaWZOb25lKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IGlmTm9uZSgpIDogaWZTb21lKG9wKVxufVxuXG4vKipcbkltcGxlbWVudCBhIG1ldGhvZCBgbWV0aG9kTmFtZWAgb24gbWFueSB0eXBlcyBhdCBvbmNlLlxuQHBhcmFtIHtvYmplY3R9IHR5cGVzIE9iamVjdCBjb250YWluaW5nIG1hbnkgdHlwZXMuXG5AcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZVxuQHBhcmFtIHtvYmplY3R9IGltcGxzXG5cdEtleXMgYXJlIG5hbWVzIG9mIHR5cGVzIGluIGB0eXBlc2AuXG5cdFZhbHVlcyBhcmUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSBtZXRob2QuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGltcGxlbWVudE1hbnkodHlwZXMsIG1ldGhvZE5hbWUsIGltcGxzKSB7XG5cdGZvciAoY29uc3QgbmFtZSBpbiBpbXBscylcblx0XHR0eXBlc1tuYW1lXS5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBpbXBsc1tuYW1lXVxufVxuXG4vKiogRmFsc2UgaWZmIHRoZXJlIGFyZSBhbnkgZWxlbWVudHMgaW4gdGhlIGFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW1wdHkoYXJyYXkpIHtcblx0cmV0dXJuIGFycmF5Lmxlbmd0aCA9PT0gMFxufVxuXG4vKiogRWxlbWVudCBhdCB0aGUgZW5kIG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhc3QoYXJyYXkpIHtcblx0YXNzZXJ0KCFpc0VtcHR5KGFycmF5KSlcblx0cmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdXG59XG5cbi8qKiBEbyBgYWN0aW9uYCBpZiBgb3BgIGlzIG5vdCBudWxsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wRWFjaChvcCwgYWN0aW9uKSB7XG5cdGlmIChvcCAhPT0gbnVsbClcblx0XHRhY3Rpb24ob3ApXG59XG5cbi8qKlxuQ3JlYXRlIGFuIG9wdGlvbmFsIHZhbHVlLCB3aGljaCBpcyBgbnVsbGAgdW5sZXNzIGBjb25kYC5cbkBwYXJhbSB7Ym9vbGVhbn0gY29uZFxuQHBhcmFtIHtGdW5jdGlvbn0gbWFrZU9wXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG9wSWYoY29uZCwgbWFrZU9wKSB7XG5cdHJldHVybiBjb25kID8gbWFrZU9wKCkgOiBudWxsXG59XG5cbi8qKiBDYWxsIGEgZnVuY3Rpb24gb24gYW4gb3B0aW9uYWwgdmFsdWUsIGJ1dCBvbmx5IGlmIGl0J3Mgbm90IG51bGwuICovXG5leHBvcnQgZnVuY3Rpb24gb3BNYXAob3AsIG1hcHBlcikge1xuXHRyZXR1cm4gb3AgPT09IG51bGwgPyBudWxsIDogbWFwcGVyKG9wKVxufVxuXG4vKiogSWYgYW4gb3B0aW9uYWwgdmFsdWUgaXMgYG51bGxgLCByZXBsYWNlIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wT3Iob3AsIG9yKSB7XG5cdHJldHVybiBvcCA9PT0gbnVsbCA/IG9yKCkgOiBvcFxufVxuXG4vKiogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IGluIHJldmVyc2UuICovXG5leHBvcnQgZnVuY3Rpb24qIHJldmVyc2VJdGVyKGFycmF5KSB7XG5cdGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSlcblx0XHR5aWVsZCBhcnJheVtpXVxufVxuXG4vKiogQWxsIGJ1dCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ0YWlsKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheS5zbGljZSgwLCBhcnJheS5sZW5ndGggLSAxKVxufVxuXG4vKiogQWxsIGJ1dCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWlsKGFycmF5KSB7XG5cdGFzc2VydCghaXNFbXB0eShhcnJheSkpXG5cdHJldHVybiBhcnJheS5zbGljZSgxKVxufVxuXG4vKiogQXNzZXJ0cyB0aGUgdHlwZSBvZiBhIHZhcmlhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGUoaW5zdGFuY2UsIGl0c1R5cGUpIHtcblx0aWYgKCEoT2JqZWN0KGluc3RhbmNlKSBpbnN0YW5jZW9mIGl0c1R5cGUpKVxuXHRcdHRocm93IG5ldyBFcnJvcihgJHtpbnN0YW5jZX0gaXMgbm90IGEgJHtpdHNUeXBlLm5hbWV9YClcbn1cbiJdfQ==