(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', '../../CompileError', '../context', '../util', './context'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('../../CompileError'), require('../context'), require('../util'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.util, global.context);
		global.locals = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _util, _context2) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

	// For expressions affecting lineNewLocals, they will be registered before being verified.
	// So, LocalDeclare.verify just the type.
	// For locals not affecting lineNewLocals, use this instead of just declare.verify()

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

	// Should have verified that addedLocals all have different names.

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
		// TODO:ES6 `Array.from(locals.keys())` should work
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS9sb2NhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS08sVUFBUyxXQUFXLENBQUMsWUFBWSxFQUFFO0FBQ3pDLFlBSE8sTUFBTSxDQUdOLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7RUFDaEM7O0FBRU0sVUFBUyxRQUFRLENBQUMsWUFBWSxFQUFFO0FBQ3RDLFlBUE8sTUFBTSxDQU9OLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFBO0VBQzNDOztBQUVNLFVBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDekMsUUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDakQsb0JBQWtCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ25DOztBQUVNLFVBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUNuRCxZQWhCMkIsT0FBTyxDQWdCMUIsc0JBQXNCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtFQUN4RDs7Ozs7O0FBS00sVUFBUyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUU7QUFDaEQsZUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzNCLGNBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtFQUNyQjs7QUFFTSxVQUFTLGFBQWEsQ0FBQyxZQUFZLEVBQUU7QUFDM0MsWUE1QjJCLE9BQU8sQ0E0QjFCLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUE7RUFDcEQ7O0FBRU0sVUFBUyxTQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRTtBQUM3QyxRQUFNLFFBQVEsR0FBRyxVQWhDVixNQUFNLENB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SSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ3ZDLGVBOUZjLElBQUksRUE4RmIsR0FBRyxFQUFFLENBQUMsY0FBYyxHQUFFLGtCQS9GcEIsSUFBSSxFQStGcUIsSUFBSSxDQUFDLEVBQUMsZ0JBQWdCLEdBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDdEU7O0FBRU0sVUFBUyxnQkFBZ0IsR0FBRztBQUNsQyxxQkFBZ0MsVUFoR0wsT0FBTyxDQWdHTSxzQkFBc0I7OztTQUFsRCxLQUFLO1NBQUUsUUFBUTs7QUFDMUIsT0FBSSxVQWxHRSxPQUFPLEVBa0dELFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsVUFqR3RDLFVBQVUsQ0FpR3VDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFDeEUsYUFwR2tCLElBQUksRUFvR2pCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsR0FBRSxrQkFyR3BDLElBQUksRUFxR3FDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUE7RUFDL0QiLCJmaWxlIjoibG9jYWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBmYWlsLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtsb2NhbHMsIG9rVG9Ob3RVc2UsIHJlc3VsdHMsIHBlbmRpbmdCbG9ja0xvY2Fscywgc2V0UGVuZGluZ0Jsb2NrTG9jYWxzfSBmcm9tICcuL2NvbnRleHQnXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVMb2NhbChsb2NhbERlY2xhcmUpIHtcblx0bG9jYWxzLmRlbGV0ZShsb2NhbERlY2xhcmUubmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExvY2FsKGxvY2FsRGVjbGFyZSkge1xuXHRsb2NhbHMuc2V0KGxvY2FsRGVjbGFyZS5uYW1lLCBsb2NhbERlY2xhcmUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY2Nlc3NMb2NhbChhY2Nlc3MsIG5hbWUpIHtcblx0Y29uc3QgZGVjbGFyZSA9IGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3MubG9jKVxuXHRzZXREZWNsYXJlQWNjZXNzZWQoZGVjbGFyZSwgYWNjZXNzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVjbGFyZUFjY2Vzc2VkKGRlY2xhcmUsIGFjY2Vzcykge1xuXHRyZXN1bHRzLmxvY2FsRGVjbGFyZVRvQWNjZXNzZXMuZ2V0KGRlY2xhcmUpLnB1c2goYWNjZXNzKVxufVxuXG4vLyBGb3IgZXhwcmVzc2lvbnMgYWZmZWN0aW5nIGxpbmVOZXdMb2NhbHMsIHRoZXkgd2lsbCBiZSByZWdpc3RlcmVkIGJlZm9yZSBiZWluZyB2ZXJpZmllZC5cbi8vIFNvLCBMb2NhbERlY2xhcmUudmVyaWZ5IGp1c3QgdGhlIHR5cGUuXG4vLyBGb3IgbG9jYWxzIG5vdCBhZmZlY3RpbmcgbGluZU5ld0xvY2FscywgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IGRlY2xhcmUudmVyaWZ5KClcbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKVxuXHRsb2NhbERlY2xhcmUudmVyaWZ5KClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTG9jYWwobG9jYWxEZWNsYXJlKSB7XG5cdHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcy5zZXQobG9jYWxEZWNsYXJlLCBbXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KGFkZGVkTG9jYWwubmFtZSlcblx0bG9jYWxzLnNldChhZGRlZExvY2FsLm5hbWUsIGFkZGVkTG9jYWwpXG5cdGFjdGlvbigpXG5cdGlmIChzaGFkb3dlZCA9PT0gdW5kZWZpbmVkKVxuXHRcdGRlbGV0ZUxvY2FsKGFkZGVkTG9jYWwpXG5cdGVsc2Vcblx0XHRzZXRMb2NhbChzaGFkb3dlZClcbn1cblxuLy8gU2hvdWxkIGhhdmUgdmVyaWZpZWQgdGhhdCBhZGRlZExvY2FscyBhbGwgaGF2ZSBkaWZmZXJlbnQgbmFtZXMuXG5leHBvcnQgZnVuY3Rpb24gcGx1c0xvY2FscyhhZGRlZExvY2FscywgYWN0aW9uKSB7XG5cdGNvbnN0IHNoYWRvd2VkTG9jYWxzID0gW11cblx0Zm9yIChjb25zdCBfIG9mIGFkZGVkTG9jYWxzKSB7XG5cdFx0Y29uc3Qgc2hhZG93ZWQgPSBsb2NhbHMuZ2V0KF8ubmFtZSlcblx0XHRpZiAoc2hhZG93ZWQgIT09IHVuZGVmaW5lZClcblx0XHRcdHNoYWRvd2VkTG9jYWxzLnB1c2goc2hhZG93ZWQpXG5cdFx0c2V0TG9jYWwoXylcblx0fVxuXG5cdGFjdGlvbigpXG5cblx0YWRkZWRMb2NhbHMuZm9yRWFjaChkZWxldGVMb2NhbClcblx0c2hhZG93ZWRMb2NhbHMuZm9yRWFjaChzZXRMb2NhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeUFuZFBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pIHtcblx0dmVyaWZ5TG9jYWxEZWNsYXJlKGFkZGVkTG9jYWwpXG5cdHBsdXNMb2NhbChhZGRlZExvY2FsLCBhY3Rpb24pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlBbmRQbHVzTG9jYWxzKGFkZGVkTG9jYWxzLCBhY3Rpb24pIHtcblx0YWRkZWRMb2NhbHMuZm9yRWFjaCh2ZXJpZnlMb2NhbERlY2xhcmUpXG5cdGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG5cdGZvciAoY29uc3QgXyBvZiBhZGRlZExvY2Fscykge1xuXHRcdGNoZWNrKCFuYW1lcy5oYXMoXy5uYW1lKSwgXy5sb2MsICgpID0+IGBEdXBsaWNhdGUgbG9jYWwgJHtjb2RlKF8ubmFtZSl9YClcblx0XHRuYW1lcy5hZGQoXy5uYW1lKVxuXHR9XG5cdHBsdXNMb2NhbHMoYWRkZWRMb2NhbHMsIGFjdGlvbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhCbG9ja0xvY2FscyhhY3Rpb24pIHtcblx0Y29uc3Qgb2xkUGVuZGluZ0Jsb2NrTG9jYWxzID0gcGVuZGluZ0Jsb2NrTG9jYWxzXG5cdHNldFBlbmRpbmdCbG9ja0xvY2FscyhbXSlcblx0cGx1c0xvY2FscyhvbGRQZW5kaW5nQmxvY2tMb2NhbHMsIGFjdGlvbilcblx0c2V0UGVuZGluZ0Jsb2NrTG9jYWxzKG9sZFBlbmRpbmdCbG9ja0xvY2Fscylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsRGVjbGFyZShuYW1lLCBhY2Nlc3NMb2MpIHtcblx0Y29uc3QgZGVjbGFyZSA9IGxvY2Fscy5nZXQobmFtZSlcblx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZClcblx0XHRmYWlsTWlzc2luZ0xvY2FsKGFjY2Vzc0xvYywgbmFtZSlcblx0cmV0dXJuIGRlY2xhcmVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWxNaXNzaW5nTG9jYWwobG9jLCBuYW1lKSB7XG5cdC8vIFRPRE86RVM2IGBBcnJheS5mcm9tKGxvY2Fscy5rZXlzKCkpYCBzaG91bGQgd29ya1xuXHRjb25zdCBrZXlzID0gW11cblx0Zm9yIChjb25zdCBrZXkgb2YgbG9jYWxzLmtleXMoKSlcblx0XHRrZXlzLnB1c2goa2V5KVxuXHRjb25zdCBzaG93TG9jYWxzID0gY29kZShrZXlzLmpvaW4oJyAnKSlcblx0ZmFpbChsb2MsIGBObyBzdWNoIGxvY2FsICR7Y29kZShuYW1lKX0uXFxuTG9jYWxzIGFyZTpcXG4ke3Nob3dMb2NhbHN9LmApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuVW51c2VkTG9jYWxzKCkge1xuXHRmb3IgKGNvbnN0IFtsb2NhbCwgYWNjZXNzZXNdIG9mIHJlc3VsdHMubG9jYWxEZWNsYXJlVG9BY2Nlc3Nlcylcblx0XHRpZiAoaXNFbXB0eShhY2Nlc3NlcykgJiYgbG9jYWwubmFtZSAhPT0gJ2J1aWx0JyAmJiAhb2tUb05vdFVzZS5oYXMobG9jYWwpKVxuXHRcdFx0d2Fybihsb2NhbC5sb2MsIGBVbnVzZWQgbG9jYWwgdmFyaWFibGUgJHtjb2RlKGxvY2FsLm5hbWUpfS5gKVxufVxuIl19