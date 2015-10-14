if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'esast/dist/Loc', '../CompileError', './CompileOptions'], function (exports, _esastDistLoc, _CompileError, _CompileOptions) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileOptions2 = _interopRequireDefault(_CompileOptions);

	let options;
	exports.options = options;
	let warnings;

	exports.warnings = warnings;
	const setContext = opts => {
		exports.options = options = new _CompileOptions2.default(opts);
		exports.warnings = warnings = [];
	};

	exports.setContext = setContext;
	// Release for garbage collection.
	const unsetContext = () => {
		exports.options = options = null;
		exports.warnings = warnings = null;
	};

	exports.unsetContext = unsetContext;
	const check = (cond, loc, message) => {
		if (!cond) fail(loc, message);
	};

	exports.check = check;
	const fail = (loc, message) => {
		throw new _CompileError2.default(warning(loc, message));
	};

	exports.fail = fail;
	const warnIf = (cond, loc, message) => {
		if (cond) warn(loc, message);
	};

	exports.warnIf = warnIf;
	const warn = (loc, message) => {
		warnings.push(warning(loc, message));
	};

	exports.warn = warn;
	const warning = (loc, message) => {
		loc = unlazy(loc);
		message = unlazy(message);
		if (loc instanceof _esastDistLoc.Pos) loc = (0, _esastDistLoc.singleCharLoc)(loc);
		return new _CompileError.Warning(loc, message);
	},
	      unlazy = _ => _ instanceof Function ? _() : _;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRleHQuanMiLCJwcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7QUNJTyxLQUFJLE9BQU8sQ0FBQTs7QUFDWCxLQUFJLFFBQVEsQ0FBQTs7O0FBRVosT0FBTSxVQUFVLEdBQUcsSUFBSSxJQUFJO0FBQ2pDLFVBSlUsT0FBTyxHQUlqQixPQUFPLEdBQUcsNkJBQW1CLElBQUksQ0FBQyxDQUFBO0FBQ2xDLFVBSlUsUUFBUSxHQUlsQixRQUFRLEdBQUcsRUFBRSxDQUFBO0VBQ2IsQ0FBQTs7OztBQUdNLE9BQU0sWUFBWSxHQUFHLE1BQU07QUFDakMsVUFWVSxPQUFPLEdBVWpCLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDZCxVQVZVLFFBQVEsR0FVbEIsUUFBUSxHQUFHLElBQUksQ0FBQTtFQUNmLENBQUE7OztBQUVNLE9BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEtBQUs7QUFDNUMsTUFBSSxDQUFDLElBQUksRUFDUixJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ25CLENBQUE7OztBQUVNLE9BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sS0FBSztBQUNyQyxRQUFNLDJCQUFpQixPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7RUFDN0MsQ0FBQTs7O0FBRU0sT0FBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sS0FBSztBQUM3QyxNQUFJLElBQUksRUFDUCxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0VBQ25CLENBQUE7OztBQUVNLE9BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sS0FBSztBQUNyQyxVQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtFQUNwQyxDQUFBOzs7QUFFRCxPQUNDLE9BQU8sR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEtBQUs7QUFDM0IsS0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNqQixTQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3pCLE1BQUksR0FBRywwQkF4Q0QsR0FBRyxBQXdDYSxFQUNyQixHQUFHLEdBQUcsa0JBekNJLGFBQWEsRUF5Q0gsR0FBRyxDQUFDLENBQUE7QUFDekIsU0FBTyxrQkF6Q2EsT0FBTyxDQXlDUixHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDaEM7T0FDRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxRQUFRLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBIiwiZmlsZSI6InByaXZhdGUvY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtQb3MsIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IENvbXBpbGVFcnJvciwge1dhcm5pbmd9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCBDb21waWxlT3B0aW9ucyBmcm9tICcuL0NvbXBpbGVPcHRpb25zJ1xuXG5leHBvcnQgbGV0IG9wdGlvbnNcbmV4cG9ydCBsZXQgd2FybmluZ3NcblxuZXhwb3J0IGNvbnN0IHNldENvbnRleHQgPSBvcHRzID0+IHtcblx0b3B0aW9ucyA9IG5ldyBDb21waWxlT3B0aW9ucyhvcHRzKVxuXHR3YXJuaW5ncyA9IFtdXG59XG5cbi8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbmV4cG9ydCBjb25zdCB1bnNldENvbnRleHQgPSAoKSA9PiB7XG5cdG9wdGlvbnMgPSBudWxsXG5cdHdhcm5pbmdzID0gbnVsbFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2sgPSAoY29uZCwgbG9jLCBtZXNzYWdlKSA9PiB7XG5cdGlmICghY29uZClcblx0XHRmYWlsKGxvYywgbWVzc2FnZSlcbn1cblxuZXhwb3J0IGNvbnN0IGZhaWwgPSAobG9jLCBtZXNzYWdlKSA9PiB7XG5cdHRocm93IG5ldyBDb21waWxlRXJyb3Iod2FybmluZyhsb2MsIG1lc3NhZ2UpKVxufVxuXG5leHBvcnQgY29uc3Qgd2FybklmID0gKGNvbmQsIGxvYywgbWVzc2FnZSkgPT4ge1xuXHRpZiAoY29uZClcblx0XHR3YXJuKGxvYywgbWVzc2FnZSlcbn1cblxuZXhwb3J0IGNvbnN0IHdhcm4gPSAobG9jLCBtZXNzYWdlKSA9PiB7XG5cdHdhcm5pbmdzLnB1c2god2FybmluZyhsb2MsIG1lc3NhZ2UpKVxufVxuXG5jb25zdFxuXHR3YXJuaW5nID0gKGxvYywgbWVzc2FnZSkgPT4ge1xuXHRcdGxvYyA9IHVubGF6eShsb2MpXG5cdFx0bWVzc2FnZSA9IHVubGF6eShtZXNzYWdlKVxuXHRcdGlmIChsb2MgaW5zdGFuY2VvZiBQb3MpXG5cdFx0XHRsb2MgPSBzaW5nbGVDaGFyTG9jKGxvYylcblx0XHRyZXR1cm4gbmV3IFdhcm5pbmcobG9jLCBtZXNzYWdlKVxuXHR9LFxuXHR1bmxhenkgPSBfID0+IF8gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IF8oKSA6IF9cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
