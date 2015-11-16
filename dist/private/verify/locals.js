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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9sb2NhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBS2dCLFdBQVcsR0FBWCxXQUFXO1NBSVgsUUFBUSxHQUFSLFFBQVE7U0FJUixXQUFXLEdBQVgsV0FBVztTQUtYLGtCQUFrQixHQUFsQixrQkFBa0I7U0FPbEIsa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixhQUFhLEdBQWIsYUFBYTtTQUliLFNBQVMsR0FBVCxTQUFTO1NBV1QsVUFBVSxHQUFWLFVBQVU7U0FlVixrQkFBa0IsR0FBbEIsa0JBQWtCO1NBS2xCLG1CQUFtQixHQUFuQixtQkFBbUI7U0FVbkIsZUFBZSxHQUFmLGVBQWU7U0FPZixlQUFlLEdBQWYsZUFBZTtTQU9mLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FLaEIsZ0JBQWdCLEdBQWhCLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQXpGaEIsV0FBVzs7OztVQUlYLFFBQVE7Ozs7VUFJUixXQUFXOzs7OztVQUtYLGtCQUFrQjs7OztVQU9sQixrQkFBa0I7Ozs7O1VBS2xCLGFBQWE7Ozs7VUFJYixTQUFTOzs7Ozs7Ozs7VUFXVCxVQUFVOzs7Ozs7Ozs7Ozs7Ozs7VUFlVixrQkFBa0I7Ozs7O1VBS2xCLG1CQUFtQjs7Ozs7Ozs7Ozs7O1VBVW5CLGVBQWU7Ozs7Ozs7VUFPZixlQUFlOzs7Ozs7O1VBT2YsZ0JBQWdCOzs7OztVQUtoQixnQkFBZ0IiLCJmaWxlIjoibG9jYWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtsb2NhbHMsIG9rVG9Ob3RVc2UsIHJlc3VsdHMsIHBlbmRpbmdCbG9ja0xvY2Fscywgc2V0UGVuZGluZ0Jsb2NrTG9jYWxzfSBmcm9tICcuL2NvbnRleHQnXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVMb2NhbChsb2NhbERlY2xhcmUpIHtcblx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExvY2FsKGxvY2FsRGVjbGFyZSkge1xuXHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY2Nlc3NMb2NhbChhY2Nlc3MsIG5hbWUpIHtcblx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3MubG9jKVxuXHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgYWNjZXNzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcykge1xuXHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMuZ2V0KGRlY2xhcmUpLnB1c2goYWNjZXNzKVxufVxuXG4vLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cbi8vIFNvLCBMb2NhbERlY2xhcmUudmVyaWZ5IGp1c3QgdGhlIHR5cGUuXG4vLyBGb3IgbG9jYWxzIG5vdCBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IGRlY2xhcmUudmVyaWZ5KClcbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKVxuXHRsb2NhbERlY2xhcmUudmVyaWZ5KClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKSB7XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcy5zZXQobG9jYWxEZWNsYXJlLCBbXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0bG9jYWxzLnNldChhZGRlZExvY2FsLm5hbWUsIGFkZGVkTG9jYWwpXG5cdGFjdGlvbigpXG5cdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdGRlbGV0ZUxvY2FsKGFkZGVkTG9jYWwpXG5cdGVsc2Vcblx0XHRzZXRMb2NhbChzaGFkb3dlZClcbn1cblxuLy8gU2hvdWxkIGhhdmUgdmVyaWZpZWQgdGhhdCBhZGRlZExvY2FscyBhbGwgaGF2ZSBkaWZmZXJlbnQgbmFtZXMuXG5leHBvcnQgZnVuY3Rpb24gcGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKSB7XG5cdGNvbnN0IHNoYWRvd2VkTG9jYWxzID0gW11cblx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdHNoYWRvd2VkTG9jYWxzLnB1c2goc2hhZG93ZWQpXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXG5cdGFjdGlvbigpXG5cblx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUFuZFBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlBbmRQbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pIHtcblx0YWRkZWRMb2NhbHMuZm9yRWFjaCh2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdGNoZWNrKCFuYW1lcy5oYXMoXy5uYW1lKSwgXy5sb2MsICgpID0+IGBEdXBsaWNhdGUgbG9jYWwgJHtjb2RlKF8ubmFtZSl9YClcblx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHR9XG5cdHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCbG9ja0xvY2FscyhhY3Rpb24pIHtcblx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdHNldFBlbmRpbmdCbG9ja0xvY2FscyhbXSlcblx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0c2V0UGVuZGluZ0Jsb2NrTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2Fscylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3NMb2MpIHtcblx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZClcblx0XHRmYWlsTWlzc2luZ0xvY2FsKGFjY2Vzc0xvYywgbmFtZSlcblx0cmV0dXJuIGRlY2xhcmVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWxNaXNzaW5nTG9jYWwobG9jLCBuYW1lKSB7XG5cdGNvbnN0IHNob3dMb2NhbHMgPSBjb2RlKEFycmF5LmZyb20obG9jYWxzLmtleXMoKSkuam9pbignICcpKVxuXHRmYWlsKGxvYywgYE5vIHN1Y2ggbG9jYWwgJHtjb2RlKG5hbWUpfS5cXG5Mb2NhbHMgYXJlOlxcbiR7c2hvd0xvY2Fsc30uYClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm5VbnVzZWRMb2NhbHMoKSB7XG5cdGZvciAoY29uc3QgW2xvY2FsLCBhY2Nlc3Nlc10gb2YgcmVzdWx0cy5sb2NhbERlY2xhcmVUb0FjY2Vzc2VzKVxuXHRcdGlmIChpc0VtcHR5KGFjY2Vzc2VzKSAmJiBsb2NhbC5uYW1lICE9PSAnYnVpbHQnICYmICFva1RvTm90VXNlLmhhcyhsb2NhbCkpXG5cdFx0XHR3YXJuKGxvY2FsLmxvYywgYFVudXNlZCBsb2NhbCB2YXJpYWJsZSAke2NvZGUobG9jYWwubmFtZSl9LmApXG59XG4iXX0=