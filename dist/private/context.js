(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'esast/dist/Loc', '../CompileError', './CompileOptions'], factory);
	} else if (typeof exports !== 'undefined') {
		factory(exports, require('esast/dist/Loc'), require('../CompileError'), require('./CompileOptions'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.CompileOptions);
		global.context = mod.exports;
	}
})(this, function (exports, _esastDistLoc, _CompileError, _CompileOptions) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.setContext = setContext;
	exports.unsetContext = unsetContext;
	exports.check = check;
	exports.fail = fail;
	exports.warn = warn;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileOptions2 = _interopRequireDefault(_CompileOptions);

	/**
 Options that were passed in at the call to {@link compile}.
 @type {CompileOptions}
 */
	let options;
	exports.options = options;
	/**
 Array of all warnings produced during compilation.
 (Please use {@warn} instead of writing to this directly.)
 */
	let warnings;

	exports.warnings = warnings;
	/**
 Write to {@link options} and {@link warnings}.
 Remember to call {@link unsetContext}!
 */

	function setContext(opts) {
		exports.options = options = new _CompileOptions2.default(opts);
		exports.warnings = warnings = [];
	}

	/** Release {@link options} and {@link warnings} for garbage collection. */

	function unsetContext() {
		exports.options = options = null;
		exports.warnings = warnings = null;
	}

	/**
 If `cond` is false, {@link fail}.
 `loc` and `message` may also be Functions to to get them lazily.
 */

	function check(cond, loc, message) {
		if (!cond) {
			if (loc instanceof Function) loc = loc();
			if (message instanceof Function) message = message();
			fail(loc, message);
		}
	}

	/**
 Throw a {@link CompileError}.
 Parameters are the same as for {@link warn}.
 */

	function fail(loc, message) {
		throw new _CompileError2.default(warning(loc, message));
	}

	/**
 Add a new warning.
 @param {Loc|Pos} loc
 @param {string} message
 	Will often contain sequences created by {@link code}.
 */

	function warn(loc, message) {
		warnings.push(warning(loc, message));
	}

	const warning = (loc, message) => {
		if (loc instanceof _esastDistLoc.Pos) loc = (0, _esastDistLoc.singleCharLoc)(loc);
		return new _CompileError.Warning(loc, message);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFPLEtBQUksT0FBTyxDQUFBOzs7Ozs7QUFLWCxLQUFJLFFBQVEsQ0FBQTs7Ozs7Ozs7QUFNWixVQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUU7QUFDaEMsVUFaVSxPQUFPLEdBWWpCLE9BQU8sR0FBRyw2QkFBbUIsSUFBSSxDQUFDLENBQUE7QUFDbEMsVUFSVSxRQUFRLEdBUWxCLFFBQVEsR0FBRyxFQUFFLENBQUE7RUFDYjs7OztBQUdNLFVBQVMsWUFBWSxHQUFHO0FBQzlCLFVBbEJVLE9BQU8sR0FrQmpCLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDZCxVQWRVLFFBQVEsR0FjbEIsUUFBUSxHQUFHLElBQUksQ0FBQTtFQUNmOzs7Ozs7O0FBTU0sVUFBUyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDekMsTUFBSSxDQUFDLElBQUksRUFBRTtBQUNWLE9BQUksR0FBRyxZQUFZLFFBQVEsRUFDMUIsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ1osT0FBSSxPQUFPLFlBQVksUUFBUSxFQUM5QixPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUE7QUFDcEIsT0FBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNsQjtFQUNEOzs7Ozs7O0FBTU0sVUFBUyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUNsQyxRQUFNLDJCQUFpQixPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7RUFDN0M7Ozs7Ozs7OztBQVFNLFVBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEMsVUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7RUFDcEM7O0FBRUQsT0FBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLO0FBQ2pDLE1BQUksR0FBRywwQkEvREEsR0FBRyxBQStEWSxFQUNyQixHQUFHLEdBQUcsa0JBaEVLLGFBQWEsRUFnRUosR0FBRyxDQUFDLENBQUE7QUFDekIsU0FBTyxrQkFoRWMsT0FBTyxDQWdFVCxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDaEMsQ0FBQSIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQb3MsIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IENvbXBpbGVFcnJvciwge1dhcm5pbmd9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCBDb21waWxlT3B0aW9ucyBmcm9tICcuL0NvbXBpbGVPcHRpb25zJ1xuXG4vKipcbk9wdGlvbnMgdGhhdCB3ZXJlIHBhc3NlZCBpbiBhdCB0aGUgY2FsbCB0byB7QGxpbmsgY29tcGlsZX0uXG5AdHlwZSB7Q29tcGlsZU9wdGlvbnN9XG4qL1xuZXhwb3J0IGxldCBvcHRpb25zXG4vKipcbkFycmF5IG9mIGFsbCB3YXJuaW5ncyBwcm9kdWNlZCBkdXJpbmcgY29tcGlsYXRpb24uXG4oUGxlYXNlIHVzZSB7QHdhcm59IGluc3RlYWQgb2Ygd3JpdGluZyB0byB0aGlzIGRpcmVjdGx5LilcbiovXG5leHBvcnQgbGV0IHdhcm5pbmdzXG5cbi8qKlxuV3JpdGUgdG8ge0BsaW5rIG9wdGlvbnN9IGFuZCB7QGxpbmsgd2FybmluZ3N9LlxuUmVtZW1iZXIgdG8gY2FsbCB7QGxpbmsgdW5zZXRDb250ZXh0fSFcbiovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29udGV4dChvcHRzKSB7XG5cdG9wdGlvbnMgPSBuZXcgQ29tcGlsZU9wdGlvbnMob3B0cylcblx0d2FybmluZ3MgPSBbXVxufVxuXG4vKiogUmVsZWFzZSB7QGxpbmsgb3B0aW9uc30gYW5kIHtAbGluayB3YXJuaW5nc30gZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnNldENvbnRleHQoKSB7XG5cdG9wdGlvbnMgPSBudWxsXG5cdHdhcm5pbmdzID0gbnVsbFxufVxuXG4vKipcbklmIGBjb25kYCBpcyBmYWxzZSwge0BsaW5rIGZhaWx9LlxuYGxvY2AgYW5kIGBtZXNzYWdlYCBtYXkgYWxzbyBiZSBGdW5jdGlvbnMgdG8gdG8gZ2V0IHRoZW0gbGF6aWx5LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVjayhjb25kLCBsb2MsIG1lc3NhZ2UpIHtcblx0aWYgKCFjb25kKSB7XG5cdFx0aWYgKGxvYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuXHRcdFx0bG9jID0gbG9jKClcblx0XHRpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuXHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UoKVxuXHRcdGZhaWwobG9jLCBtZXNzYWdlKVxuXHR9XG59XG5cbi8qKlxuVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfS5cblBhcmFtZXRlcnMgYXJlIHRoZSBzYW1lIGFzIGZvciB7QGxpbmsgd2Fybn0uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZhaWwobG9jLCBtZXNzYWdlKSB7XG5cdHRocm93IG5ldyBDb21waWxlRXJyb3Iod2FybmluZyhsb2MsIG1lc3NhZ2UpKVxufVxuXG4vKipcbkFkZCBhIG5ldyB3YXJuaW5nLlxuQHBhcmFtIHtMb2N8UG9zfSBsb2NcbkBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG5cdFdpbGwgb2Z0ZW4gY29udGFpbiBzZXF1ZW5jZXMgY3JlYXRlZCBieSB7QGxpbmsgY29kZX0uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHdhcm4obG9jLCBtZXNzYWdlKSB7XG5cdHdhcm5pbmdzLnB1c2god2FybmluZyhsb2MsIG1lc3NhZ2UpKVxufVxuXG5jb25zdCB3YXJuaW5nID0gKGxvYywgbWVzc2FnZSkgPT4ge1xuXHRpZiAobG9jIGluc3RhbmNlb2YgUG9zKVxuXHRcdGxvYyA9IHNpbmdsZUNoYXJMb2MobG9jKVxuXHRyZXR1cm4gbmV3IFdhcm5pbmcobG9jLCBtZXNzYWdlKVxufVxuIl19