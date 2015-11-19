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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==