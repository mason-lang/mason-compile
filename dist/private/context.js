if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/Loc', '../CompileError', './CompileOptions'], function (exports, _esastDistLoc, _CompileError, _CompileOptions) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHQuanMiLCJwcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNRTyxLQUFJLE9BQU8sQ0FBQTs7Ozs7O0FBS1gsS0FBSSxRQUFRLENBQUE7Ozs7Ozs7O0FBTVosVUFBUyxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQ2hDLFVBWlUsT0FBTyxHQVlqQixPQUFPLEdBQUcsNkJBQW1CLElBQUksQ0FBQyxDQUFBO0FBQ2xDLFVBUlUsUUFBUSxHQVFsQixRQUFRLEdBQUcsRUFBRSxDQUFBO0VBQ2I7Ozs7QUFHTSxVQUFTLFlBQVksR0FBRztBQUM5QixVQWxCVSxPQUFPLEdBa0JqQixPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ2QsVUFkVSxRQUFRLEdBY2xCLFFBQVEsR0FBRyxJQUFJLENBQUE7RUFDZjs7Ozs7OztBQU1NLFVBQVMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3pDLE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVixPQUFJLEdBQUcsWUFBWSxRQUFRLEVBQzFCLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNaLE9BQUksT0FBTyxZQUFZLFFBQVEsRUFDOUIsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLE9BQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDbEI7RUFDRDs7Ozs7OztBQU1NLFVBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEMsUUFBTSwyQkFBaUIsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO0VBQzdDOzs7Ozs7Ozs7QUFRTSxVQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ2xDLFVBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO0VBQ3BDOztBQUVELE9BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sS0FBSztBQUNqQyxNQUFJLEdBQUcsMEJBL0RBLEdBQUcsQUErRFksRUFDckIsR0FBRyxHQUFHLGtCQWhFSyxhQUFhLEVBZ0VKLEdBQUcsQ0FBQyxDQUFBO0FBQ3pCLFNBQU8sa0JBaEVjLE9BQU8sQ0FnRVQsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ2hDLENBQUEiLCJmaWxlIjoicHJpdmF0ZS9jb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge1Bvcywgc2luZ2xlQ2hhckxvY30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgQ29tcGlsZUVycm9yLCB7V2FybmluZ30gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IENvbXBpbGVPcHRpb25zIGZyb20gJy4vQ29tcGlsZU9wdGlvbnMnXG5cbi8qKlxuT3B0aW9ucyB0aGF0IHdlcmUgcGFzc2VkIGluIGF0IHRoZSBjYWxsIHRvIHtAbGluayBjb21waWxlfS5cbkB0eXBlIHtDb21waWxlT3B0aW9uc31cbiovXG5leHBvcnQgbGV0IG9wdGlvbnNcbi8qKlxuQXJyYXkgb2YgYWxsIHdhcm5pbmdzIHByb2R1Y2VkIGR1cmluZyBjb21waWxhdGlvbi5cbihQbGVhc2UgdXNlIHtAd2Fybn0gaW5zdGVhZCBvZiB3cml0aW5nIHRvIHRoaXMgZGlyZWN0bHkuKVxuKi9cbmV4cG9ydCBsZXQgd2FybmluZ3NcblxuLyoqXG5Xcml0ZSB0byB7QGxpbmsgb3B0aW9uc30gYW5kIHtAbGluayB3YXJuaW5nc30uXG5SZW1lbWJlciB0byBjYWxsIHtAbGluayB1bnNldENvbnRleHR9IVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0KG9wdHMpIHtcblx0b3B0aW9ucyA9IG5ldyBDb21waWxlT3B0aW9ucyhvcHRzKVxuXHR3YXJuaW5ncyA9IFtdXG59XG5cbi8qKiBSZWxlYXNlIHtAbGluayBvcHRpb25zfSBhbmQge0BsaW5rIHdhcm5pbmdzfSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0Q29udGV4dCgpIHtcblx0b3B0aW9ucyA9IG51bGxcblx0d2FybmluZ3MgPSBudWxsXG59XG5cbi8qKlxuSWYgYGNvbmRgIGlzIGZhbHNlLCB7QGxpbmsgZmFpbH0uXG5gbG9jYCBhbmQgYG1lc3NhZ2VgIG1heSBhbHNvIGJlIEZ1bmN0aW9ucyB0byB0byBnZXQgdGhlbSBsYXppbHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrKGNvbmQsIGxvYywgbWVzc2FnZSkge1xuXHRpZiAoIWNvbmQpIHtcblx0XHRpZiAobG9jIGluc3RhbmNlb2YgRnVuY3Rpb24pXG5cdFx0XHRsb2MgPSBsb2MoKVxuXHRcdGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZSgpXG5cdFx0ZmFpbChsb2MsIG1lc3NhZ2UpXG5cdH1cbn1cblxuLyoqXG5UaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9LlxuUGFyYW1ldGVycyBhcmUgdGhlIHNhbWUgYXMgZm9yIHtAbGluayB3YXJufS5cbiovXG5leHBvcnQgZnVuY3Rpb24gZmFpbChsb2MsIG1lc3NhZ2UpIHtcblx0dGhyb3cgbmV3IENvbXBpbGVFcnJvcih3YXJuaW5nKGxvYywgbWVzc2FnZSkpXG59XG5cbi8qKlxuQWRkIGEgbmV3IHdhcm5pbmcuXG5AcGFyYW0ge0xvY3xQb3N9IGxvY1xuQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2Vcblx0V2lsbCBvZnRlbiBjb250YWluIHNlcXVlbmNlcyBjcmVhdGVkIGJ5IHtAbGluayBjb2RlfS5cbiovXG5leHBvcnQgZnVuY3Rpb24gd2Fybihsb2MsIG1lc3NhZ2UpIHtcblx0d2FybmluZ3MucHVzaCh3YXJuaW5nKGxvYywgbWVzc2FnZSkpXG59XG5cbmNvbnN0IHdhcm5pbmcgPSAobG9jLCBtZXNzYWdlKSA9PiB7XG5cdGlmIChsb2MgaW5zdGFuY2VvZiBQb3MpXG5cdFx0bG9jID0gc2luZ2xlQ2hhckxvYyhsb2MpXG5cdHJldHVybiBuZXcgV2FybmluZyhsb2MsIG1lc3NhZ2UpXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
