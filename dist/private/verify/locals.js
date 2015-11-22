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
	exports.registerAndPlusLocal = registerAndPlusLocal;
	exports.plusLocal = plusLocal;
	exports.plusLocals = plusLocals;
	exports.verifyAndPlusLocal = verifyAndPlusLocal;
	exports.verifyAndPlusLocals = verifyAndPlusLocals;
	exports.withBlockLocals = withBlockLocals;
	exports.failMissingLocal = failMissingLocal;
	exports.warnUnusedLocals = warnUnusedLocals;

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

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

	function registerAndPlusLocal(localDeclare, action) {
		registerLocal(localDeclare);
		plusLocal(localDeclare, action);
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
		const showLocals = (0, _CompileError.code)(Array.from(_context2.locals.keys()).join(' '));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9sb2NhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBS2dCLFdBQVcsR0FBWCxXQUFXO1NBSVgsUUFBUSxHQUFSLFFBQVE7U0FJUixXQUFXLEdBQVgsV0FBVztTQUtYLGtCQUFrQixHQUFsQixrQkFBa0I7U0FPbEIsa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixhQUFhLEdBQWIsYUFBYTtTQUliLG9CQUFvQixHQUFwQixvQkFBb0I7U0FLcEIsU0FBUyxHQUFULFNBQVM7U0FXVCxVQUFVLEdBQVYsVUFBVTtTQWVWLGtCQUFrQixHQUFsQixrQkFBa0I7U0FLbEIsbUJBQW1CLEdBQW5CLG1CQUFtQjtTQVVuQixlQUFlLEdBQWYsZUFBZTtTQWNmLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FLaEIsZ0JBQWdCLEdBQWhCLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQTlGaEIsV0FBVzs7OztVQUlYLFFBQVE7Ozs7VUFJUixXQUFXOzs7OztVQUtYLGtCQUFrQjs7OztVQU9sQixrQkFBa0I7Ozs7O1VBS2xCLGFBQWE7Ozs7VUFJYixvQkFBb0I7Ozs7O1VBS3BCLFNBQVM7Ozs7Ozs7OztVQVdULFVBQVU7Ozs7Ozs7Ozs7Ozs7OztVQWVWLGtCQUFrQjs7Ozs7VUFLbEIsbUJBQW1COzs7Ozs7Ozs7Ozs7VUFVbkIsZUFBZTs7Ozs7Ozs7Ozs7Ozs7VUFjZixnQkFBZ0I7Ozs7O1VBS2hCLGdCQUFnQiIsImZpbGUiOiJsb2NhbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWwsIHdhcm59IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzRW1wdHl9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2xvY2Fscywgb2tUb05vdFVzZSwgcmVzdWx0cywgcGVuZGluZ0Jsb2NrTG9jYWxzLCBzZXRQZW5kaW5nQmxvY2tMb2NhbHN9IGZyb20gJy4vY29udGV4dCdcblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUxvY2FsKGxvY2FsRGVjbGFyZSkge1xuXHRsb2NhbHMuZGVsZXRlKGxvY2FsRGVjbGFyZS5uYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9jYWwobG9jYWxEZWNsYXJlKSB7XG5cdGxvY2Fscy5zZXQobG9jYWxEZWNsYXJlLm5hbWUsIGxvY2FsRGVjbGFyZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFjY2Vzc0xvY2FsKGFjY2VzcywgbmFtZSkge1xuXHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzcy5sb2MpXG5cdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCBhY2Nlc3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgYWNjZXNzKSB7XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcy5nZXQoZGVjbGFyZSkucHVzaChhY2Nlc3MpXG59XG5cbi8vIEZvciBleHByZXNzaW9ucyBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdGhleSB3aWxsIGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGJlaW5nIHZlcmlmaWVkLlxuLy8gU28sIExvY2FsRGVjbGFyZS52ZXJpZnkganVzdCB0aGUgdHlwZS5cbi8vIEZvciBsb2NhbHMgbm90IGFmZmVjdGluZyBsaW5lTmV3TG9jYWxzLCB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgZGVjbGFyZS52ZXJpZnkoKVxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUxvY2FsRGVjbGFyZShsb2NhbERlY2xhcmUpIHtcblx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdGxvY2FsRGVjbGFyZS52ZXJpZnkoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpIHtcblx0cmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzLnNldChsb2NhbERlY2xhcmUsIFtdKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJBbmRQbHVzTG9jYWwobG9jYWxEZWNsYXJlLCBhY3Rpb24pIHtcblx0cmVnaXN0ZXJMb2NhbChsb2NhbERlY2xhcmUpXG5cdHBsdXNMb2NhbChsb2NhbERlY2xhcmUsIGFjdGlvbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0bG9jYWxzLnNldChhZGRlZExvY2FsLm5hbWUsIGFkZGVkTG9jYWwpXG5cdGFjdGlvbigpXG5cdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdGRlbGV0ZUxvY2FsKGFkZGVkTG9jYWwpXG5cdGVsc2Vcblx0XHRzZXRMb2NhbChzaGFkb3dlZClcbn1cblxuLy8gU2hvdWxkIGhhdmUgdmVyaWZpZWQgdGhhdCBhZGRlZExvY2FscyBhbGwgaGF2ZSBkaWZmZXJlbnQgbmFtZXMuXG5leHBvcnQgZnVuY3Rpb24gcGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKSB7XG5cdGNvbnN0IHNoYWRvd2VkTG9jYWxzID0gW11cblx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdHNoYWRvd2VkTG9jYWxzLnB1c2goc2hhZG93ZWQpXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXG5cdGFjdGlvbigpXG5cblx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUFuZFBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlBbmRQbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pIHtcblx0YWRkZWRMb2NhbHMuZm9yRWFjaCh2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdGNoZWNrKCFuYW1lcy5oYXMoXy5uYW1lKSwgXy5sb2MsICgpID0+IGBEdXBsaWNhdGUgbG9jYWwgJHtjb2RlKF8ubmFtZSl9YClcblx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHR9XG5cdHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCbG9ja0xvY2FscyhhY3Rpb24pIHtcblx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdHNldFBlbmRpbmdCbG9ja0xvY2FscyhbXSlcblx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0c2V0UGVuZGluZ0Jsb2NrTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2Fscylcbn1cblxuZnVuY3Rpb24gZ2V0TG9jYWxEZWNsYXJlKG5hbWUsIGFjY2Vzc0xvYykge1xuXHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldChuYW1lKVxuXHRpZiAoZGVjbGFyZSA9PT0gdW5kZWZpbmVkKVxuXHRcdGZhaWxNaXNzaW5nTG9jYWwoYWNjZXNzTG9jLCBuYW1lKVxuXHRyZXR1cm4gZGVjbGFyZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmFpbE1pc3NpbmdMb2NhbChsb2MsIG5hbWUpIHtcblx0Y29uc3Qgc2hvd0xvY2FscyA9IGNvZGUoQXJyYXkuZnJvbShsb2NhbHMua2V5cygpKS5qb2luKCcgJykpXG5cdGZhaWwobG9jLCBgTm8gc3VjaCBsb2NhbCAke2NvZGUobmFtZSl9LlxcbkxvY2FscyBhcmU6XFxuJHtzaG93TG9jYWxzfS5gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FyblVudXNlZExvY2FscygpIHtcblx0Zm9yIChjb25zdCBbbG9jYWwsIGFjY2Vzc2VzXSBvZiByZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMpXG5cdFx0aWYgKGlzRW1wdHkoYWNjZXNzZXMpICYmIGxvY2FsLm5hbWUgIT09ICdidWlsdCcgJiYgIW9rVG9Ob3RVc2UuaGFzKGxvY2FsKSlcblx0XHRcdHdhcm4obG9jYWwubG9jLCBgVW51c2VkIGxvY2FsIHZhcmlhYmxlICR7Y29kZShsb2NhbC5uYW1lKX0uYClcbn1cbiJdfQ==