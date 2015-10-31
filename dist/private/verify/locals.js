'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../util', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../util'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.util, global.context);
		global.locals = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _util, _context2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.deleteLocal = deleteLocal;
	exports.setLocal = setLocal;
	exports.accessLocal = accessLocal;
	exports.setDeclareAccessed = setDeclareAccessed;
	exports.verifyLocalDeclare = verifyLocalDeclare;
	exports.registerLocal = registerLocal;
	exports.plusLocal = plusLocal;
	exports.plusLocals = plusLocals;
	exports.verifyAndPlusLocal = verifyAndPlusLocal;
	exports.verifyAndPlusLocals = verifyAndPlusLocals;
	exports.withBlockLocals = withBlockLocals;
	exports.getLocalDeclare = getLocalDeclare;
	exports.failMissingLocal = failMissingLocal;
	exports.warnUnusedLocals = warnUnusedLocals;

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	function deleteLocal(localDeclare) {
		_context2.locals.delete(localDeclare.name);
	}

	function setLocal(localDeclare) {
		_context2.locals.set(localDeclare.name, localDeclare);
	}

	function accessLocal(access, name) {
		const declare = getLocalDeclare(name, access.loc);
		setDeclareAccessed(declare, access);
	}

	function setDeclareAccessed(declare, access) {
		_context2.results.localDeclareToAccesses.get(declare).push(access);
	}

	function verifyLocalDeclare(localDeclare) {
		registerLocal(localDeclare);
		localDeclare.verify();
	}

	function registerLocal(localDeclare) {
		_context2.results.localDeclareToAccesses.set(localDeclare, []);
	}

	function plusLocal(addedLocal, action) {
		const shadowed = _context2.locals.get(addedLocal.name);

		_context2.locals.set(addedLocal.name, addedLocal);

		action();
		if (shadowed === undefined) deleteLocal(addedLocal);else setLocal(shadowed);
	}

	function plusLocals(addedLocals, action) {
		const shadowedLocals = [];

		for (const _ of addedLocals) {
			const shadowed = _context2.locals.get(_.name);

			if (shadowed !== undefined) shadowedLocals.push(shadowed);
			setLocal(_);
		}

		action();
		addedLocals.forEach(deleteLocal);
		shadowedLocals.forEach(setLocal);
	}

	function verifyAndPlusLocal(addedLocal, action) {
		verifyLocalDeclare(addedLocal);
		plusLocal(addedLocal, action);
	}

	function verifyAndPlusLocals(addedLocals, action) {
		addedLocals.forEach(verifyLocalDeclare);
		const names = new Set();

		for (const _ of addedLocals) {
			(0, _context.check)(!names.has(_.name), _.loc, () => `Duplicate local ${ (0, _CompileError.code)(_.name) }`);
			names.add(_.name);
		}

		plusLocals(addedLocals, action);
	}

	function withBlockLocals(action) {
		const oldPendingBlockLocals = _context2.pendingBlockLocals;
		(0, _context2.setPendingBlockLocals)([]);
		plusLocals(oldPendingBlockLocals, action);
		(0, _context2.setPendingBlockLocals)(oldPendingBlockLocals);
	}

	function getLocalDeclare(name, accessLoc) {
		const declare = _context2.locals.get(name);

		if (declare === undefined) failMissingLocal(accessLoc, name);
		return declare;
	}

	function failMissingLocal(loc, name) {
		const keys = [];

		for (const key of _context2.locals.keys()) keys.push(key);

		const showLocals = (0, _CompileError.code)(keys.join(' '));
		(0, _context.fail)(loc, `No such local ${ (0, _CompileError.code)(name) }.\nLocals are:\n${ showLocals }.`);
	}

	function warnUnusedLocals() {
		for (const _ref of _context2.results.localDeclareToAccesses) {
			var _ref2 = _slicedToArray(_ref, 2);

			const local = _ref2[0];
			const accesses = _ref2[1];
			if ((0, _util.isEmpty)(accesses) && local.name !== 'built' && !_context2.okToNotUse.has(local)) (0, _context.warn)(local.loc, `Unused local variable ${ (0, _CompileError.code)(local.name) }.`);
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9sb2NhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBS2dCLFdBQVcsR0FBWCxXQUFXO1NBSVgsUUFBUSxHQUFSLFFBQVE7U0FJUixXQUFXLEdBQVgsV0FBVztTQUtYLGtCQUFrQixHQUFsQixrQkFBa0I7U0FPbEIsa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixhQUFhLEdBQWIsYUFBYTtTQUliLFNBQVMsR0FBVCxTQUFTO1NBV1QsVUFBVSxHQUFWLFVBQVU7U0FlVixrQkFBa0IsR0FBbEIsa0JBQWtCO1NBS2xCLG1CQUFtQixHQUFuQixtQkFBbUI7U0FVbkIsZUFBZSxHQUFmLGVBQWU7U0FPZixlQUFlLEdBQWYsZUFBZTtTQU9mLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FTaEIsZ0JBQWdCLEdBQWhCLGdCQUFnQjs7OztVQTdGaEIsV0FBVzs7OztVQUlYLFFBQVE7Ozs7VUFJUixXQUFXOzs7OztVQUtYLGtCQUFrQjs7OztVQU9sQixrQkFBa0I7Ozs7O1VBS2xCLGFBQWE7Ozs7VUFJYixTQUFTOzs7Ozs7Ozs7VUFXVCxVQUFVOzs7Ozs7Ozs7Ozs7Ozs7VUFlVixrQkFBa0I7Ozs7O1VBS2xCLG1CQUFtQjs7Ozs7Ozs7Ozs7O1VBVW5CLGVBQWU7Ozs7Ozs7VUFPZixlQUFlOzs7Ozs7O1VBT2YsZ0JBQWdCOzs7Ozs7Ozs7VUFTaEIsZ0JBQWdCIiwiZmlsZSI6ImxvY2Fscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtjaGVjaywgZmFpbCwgd2Fybn0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNFbXB0eX0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7bG9jYWxzLCBva1RvTm90VXNlLCByZXN1bHRzLCBwZW5kaW5nQmxvY2tMb2NhbHMsIHNldFBlbmRpbmdCbG9ja0xvY2Fsc30gZnJvbSAnLi9jb250ZXh0J1xuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTG9jYWwobG9jYWxEZWNsYXJlKSB7XG5cdGxvY2Fscy5kZWxldGUobG9jYWxEZWNsYXJlLm5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2NhbChsb2NhbERlY2xhcmUpIHtcblx0bG9jYWxzLnNldChsb2NhbERlY2xhcmUubmFtZSwgbG9jYWxEZWNsYXJlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWNjZXNzTG9jYWwoYWNjZXNzLCBuYW1lKSB7XG5cdGNvbnN0IGRlY2xhcmUgPSBnZXRMb2NhbERlY2xhcmUobmFtZSwgYWNjZXNzLmxvYylcblx0c2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCBhY2Nlc3MpIHtcblx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzLmdldChkZWNsYXJlKS5wdXNoKGFjY2Vzcylcbn1cblxuLy8gRm9yIGV4cHJlc3Npb25zIGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB0aGV5IHdpbGwgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgYmVpbmcgdmVyaWZpZWQuXG4vLyBTbywgTG9jYWxEZWNsYXJlLnZlcmlmeSBqdXN0IHRoZSB0eXBlLlxuLy8gRm9yIGxvY2FscyBub3QgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCBkZWNsYXJlLnZlcmlmeSgpXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TG9jYWxEZWNsYXJlKGxvY2FsRGVjbGFyZSkge1xuXHRyZWdpc3RlckxvY2FsKGxvY2FsRGVjbGFyZSlcblx0bG9jYWxEZWNsYXJlLnZlcmlmeSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckxvY2FsKGxvY2FsRGVjbGFyZSkge1xuXHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMuc2V0KGxvY2FsRGVjbGFyZSwgW10pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKSB7XG5cdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChhZGRlZExvY2FsLm5hbWUpXG5cdGxvY2Fscy5zZXQoYWRkZWRMb2NhbC5uYW1lLCBhZGRlZExvY2FsKVxuXHRhY3Rpb24oKVxuXHRpZiAoc2hhZG93ZWQgPT09IHVuZGVmaW5lZClcblx0XHRkZWxldGVMb2NhbChhZGRlZExvY2FsKVxuXHRlbHNlXG5cdFx0c2V0TG9jYWwoc2hhZG93ZWQpXG59XG5cbi8vIFNob3VsZCBoYXZlIHZlcmlmaWVkIHRoYXQgYWRkZWRMb2NhbHMgYWxsIGhhdmUgZGlmZmVyZW50IG5hbWVzLlxuZXhwb3J0IGZ1bmN0aW9uIHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbikge1xuXHRjb25zdCBzaGFkb3dlZExvY2FscyA9IFtdXG5cdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdGNvbnN0IHNoYWRvd2VkID0gbG9jYWxzLmdldChfLm5hbWUpXG5cdFx0aWYgKHNoYWRvd2VkICE9PSB1bmRlZmluZWQpXG5cdFx0XHRzaGFkb3dlZExvY2Fscy5wdXNoKHNoYWRvd2VkKVxuXHRcdHNldExvY2FsKF8pXG5cdH1cblxuXHRhY3Rpb24oKVxuXG5cdGFkZGVkTG9jYWxzLmZvckVhY2goZGVsZXRlTG9jYWwpXG5cdHNoYWRvd2VkTG9jYWxzLmZvckVhY2goc2V0TG9jYWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlBbmRQbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKSB7XG5cdHZlcmlmeUxvY2FsRGVjbGFyZShhZGRlZExvY2FsKVxuXHRwbHVzTG9jYWwoYWRkZWRMb2NhbCwgYWN0aW9uKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5QW5kUGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKSB7XG5cdGFkZGVkTG9jYWxzLmZvckVhY2godmVyaWZ5TG9jYWxEZWNsYXJlKVxuXHRjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxuXHRmb3IgKGNvbnN0IF8gb2YgYWRkZWRMb2NhbHMpIHtcblx0XHRjaGVjayghbmFtZXMuaGFzKF8ubmFtZSksIF8ubG9jLCAoKSA9PiBgRHVwbGljYXRlIGxvY2FsICR7Y29kZShfLm5hbWUpfWApXG5cdFx0bmFtZXMuYWRkKF8ubmFtZSlcblx0fVxuXHRwbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aXRoQmxvY2tMb2NhbHMoYWN0aW9uKSB7XG5cdGNvbnN0IG9sZFBlbmRpbmdCbG9ja0xvY2FscyA9IHBlbmRpbmdCbG9ja0xvY2Fsc1xuXHRzZXRQZW5kaW5nQmxvY2tMb2NhbHMoW10pXG5cdHBsdXNMb2NhbHMob2xkUGVuZGluZ0Jsb2NrTG9jYWxzLCBhY3Rpb24pXG5cdHNldFBlbmRpbmdCbG9ja0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbERlY2xhcmUobmFtZSwgYWNjZXNzTG9jKSB7XG5cdGNvbnN0IGRlY2xhcmUgPSBsb2NhbHMuZ2V0KG5hbWUpXG5cdGlmIChkZWNsYXJlID09PSB1bmRlZmluZWQpXG5cdFx0ZmFpbE1pc3NpbmdMb2NhbChhY2Nlc3NMb2MsIG5hbWUpXG5cdHJldHVybiBkZWNsYXJlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsTWlzc2luZ0xvY2FsKGxvYywgbmFtZSkge1xuXHQvLyBUT0RPOkVTNiBgQXJyYXkuZnJvbShsb2NhbHMua2V5cygpKWAgc2hvdWxkIHdvcmtcblx0Y29uc3Qga2V5cyA9IFtdXG5cdGZvciAoY29uc3Qga2V5IG9mIGxvY2Fscy5rZXlzKCkpXG5cdFx0a2V5cy5wdXNoKGtleSlcblx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoa2V5cy5qb2luKCcgJykpXG5cdGZhaWwobG9jLCBgTm8gc3VjaCBsb2NhbCAke2NvZGUobmFtZSl9LlxcbkxvY2FscyBhcmU6XFxuJHtzaG93TG9jYWxzfS5gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FyblVudXNlZExvY2FscygpIHtcblx0Zm9yIChjb25zdCBbbG9jYWwsIGFjY2Vzc2VzXSBvZiByZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMpXG5cdFx0aWYgKGlzRW1wdHkoYWNjZXNzZXMpICYmIGxvY2FsLm5hbWUgIT09ICdidWlsdCcgJiYgIW9rVG9Ob3RVc2UuaGFzKGxvY2FsKSlcblx0XHRcdHdhcm4obG9jYWwubG9jLCBgVW51c2VkIGxvY2FsIHZhcmlhYmxlICR7Y29kZShsb2NhbC5uYW1lKX0uYClcbn1cbiJdfQ==