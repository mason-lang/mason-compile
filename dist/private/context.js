'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../CompileError', './PathOptions', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../CompileError'), require('./PathOptions'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.PathOptions, global.util);
		global.context = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _PathOptions, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.pathOptions = exports.warnings = exports.options = undefined;
	exports.setContext = setContext;
	exports.unsetContext = unsetContext;
	exports.check = check;
	exports.fail = fail;
	exports.warn = warn;

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _PathOptions2 = _interopRequireDefault(_PathOptions);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	let options = exports.options = undefined;
	let warnings = exports.warnings = undefined;
	let pathOptions = exports.pathOptions = undefined;

	function setContext(_options, filename) {
		exports.options = options = _options;
		exports.pathOptions = pathOptions = new _PathOptions2.default(filename);
		exports.warnings = warnings = [];
	}

	function unsetContext() {
		exports.options = options = null;
		exports.warnings = warnings = null;
	}

	function check(cond, loc, code) {
		if (!cond) {
			if (loc instanceof Function) loc = loc();

			for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
				args[_key - 3] = arguments[_key];
			}

			fail(loc, code, ...args);
		}
	}

	function fail(loc, code) {
		for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
			args[_key2 - 2] = arguments[_key2];
		}

		throw new _CompileError2.default(errorMessage(loc, code, args));
	}

	function warn(loc, code) {
		for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
			args[_key3 - 2] = arguments[_key3];
		}

		warnings.push(errorMessage(loc, code, args));
	}

	function errorMessage(loc, code, args) {
		if (loc instanceof _Loc.Pos) loc = (0, _Loc.singleCharLoc)(loc);
		const language = options.language();
		const message = (0, _util.isEmpty)(args) ? language[code] : language[code](...args);
		return new _CompileError.ErrorMessage(loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQW1CZ0IsVUFBVSxHQUFWLFVBQVU7U0FPVixZQUFZLEdBQVosWUFBWTtTQVNaLEtBQUssR0FBTCxLQUFLO1NBWUwsSUFBSSxHQUFKLElBQUk7U0FjSixJQUFJLEdBQUosSUFBSTs7Ozs7Ozs7Ozs7O0tBdkRULE9BQU8sV0FBUCxPQUFPO0tBS1AsUUFBUSxXQUFSLFFBQVE7S0FFUixXQUFXLFdBQVgsV0FBVzs7VUFNTixVQUFVO1VBYmYsT0FBTyxHQWNqQixPQUFPLEdBQUcsUUFBUTtVQVBSLFdBQVcsR0FRckIsV0FBVyxHQUFHLDBCQUFnQixRQUFRLENBQUM7VUFWN0IsUUFBUSxHQVdsQixRQUFRLEdBQUcsRUFBRTs7O1VBSUUsWUFBWTtVQXBCakIsT0FBTyxHQXFCakIsT0FBTyxHQUFHLElBQUk7VUFoQkosUUFBUSxHQWlCbEIsUUFBUSxHQUFHLElBQUk7OztVQU9BLEtBQUs7Ozs7cUNBQXFCLElBQUk7QUFBSixRQUFJOzs7Ozs7O1VBWTlCLElBQUk7cUNBQWUsSUFBSTtBQUFKLE9BQUk7Ozs7OztVQWN2QixJQUFJO3FDQUFlLElBQUk7QUFBSixPQUFJIiwiZmlsZSI6ImNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Bvcywgc2luZ2xlQ2hhckxvY30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgQ29tcGlsZUVycm9yLCB7RXJyb3JNZXNzYWdlfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgUGF0aE9wdGlvbnMgZnJvbSAnLi9QYXRoT3B0aW9ucydcbmltcG9ydCB7aXNFbXB0eX0gZnJvbSAnLi91dGlsJ1xuXG4vKiogQHR5cGUge0NvbXBpbGVPcHRpb25zfSAqL1xuZXhwb3J0IGxldCBvcHRpb25zXG4vKipcbkFycmF5IG9mIGFsbCB3YXJuaW5ncyBwcm9kdWNlZCBkdXJpbmcgY29tcGlsYXRpb24uXG4oUGxlYXNlIHVzZSB7QHdhcm59IGluc3RlYWQgb2Ygd3JpdGluZyB0byB0aGlzIGRpcmVjdGx5LilcbiovXG5leHBvcnQgbGV0IHdhcm5pbmdzXG4vKiogQHR5cGUge1BhdGhPcHRpb25zfSAqL1xuZXhwb3J0IGxldCBwYXRoT3B0aW9uc1xuXG4vKipcbldyaXRlIHRvIHtAbGluayBvcHRpb25zfSBhbmQge0BsaW5rIHdhcm5pbmdzfS5cblJlbWVtYmVyIHRvIGNhbGwge0BsaW5rIHVuc2V0Q29udGV4dH0hXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRleHQoX29wdGlvbnMsIGZpbGVuYW1lKSB7XG5cdG9wdGlvbnMgPSBfb3B0aW9uc1xuXHRwYXRoT3B0aW9ucyA9IG5ldyBQYXRoT3B0aW9ucyhmaWxlbmFtZSlcblx0d2FybmluZ3MgPSBbXVxufVxuXG4vKiogUmVsZWFzZSB7QGxpbmsgb3B0aW9uc30gYW5kIHtAbGluayB3YXJuaW5nc30gZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnNldENvbnRleHQoKSB7XG5cdG9wdGlvbnMgPSBudWxsXG5cdHdhcm5pbmdzID0gbnVsbFxufVxuXG4vKipcbklmIGBjb25kYCBpcyBmYWxzZSwge0BsaW5rIGZhaWx9LlxuYGxvY2AgYW5kIGBtZXNzYWdlYCBtYXkgYWxzbyBiZSBGdW5jdGlvbnMgdG8gdG8gZ2V0IHRoZW0gbGF6aWx5LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVjayhjb25kLCBsb2MsIGNvZGUsIC4uLmFyZ3MpIHtcblx0aWYgKCFjb25kKSB7XG5cdFx0aWYgKGxvYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuXHRcdFx0bG9jID0gbG9jKClcblx0XHRmYWlsKGxvYywgY29kZSwgLi4uYXJncylcblx0fVxufVxuXG4vKipcblRocm93IGEge0BsaW5rIENvbXBpbGVFcnJvcn0uXG5QYXJhbWV0ZXJzIGFyZSB0aGUgc2FtZSBhcyBmb3Ige0BsaW5rIHdhcm59LlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmYWlsKGxvYywgY29kZSwgLi4uYXJncykge1xuXHR0aHJvdyBuZXcgQ29tcGlsZUVycm9yKGVycm9yTWVzc2FnZShsb2MsIGNvZGUsIGFyZ3MpKVxufVxuXG4vKipcbkFkZCBhIG5ldyB3YXJuaW5nLlxuQHBhcmFtIHtMb2N8UG9zfSBsb2NcbkBwYXJhbSB7c3RyaW5nfSBjb2RlXG5cdE1lc3NhZ2UgY29kZS4gRm9yIGEgY29tcGxldGUgbGlzdCwgc2VlIGBsYW5ndWFnZXMvZW5nbGlzaGAuXG5AcGFyYW0gYXJnc1xuXHRBcmd1bWVudHMgZm9yIHJlbmRlcmluZyB0aGUgbWVzc2FnZS5cblx0V2hlbiB0aGVzZSBhcmUgc3VwcGxpZWQsIHRoZSBtZXNzYWdlIGhhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlxuXHRTZWUgYGxhbmd1YWdlcy9lbmdsaXNoYCBmb3Igd2hpY2ggbWVzc2FnZXMgYXJlIGZ1bmN0aW9ucy5cbiovXG5leHBvcnQgZnVuY3Rpb24gd2Fybihsb2MsIGNvZGUsIC4uLmFyZ3MpIHtcblx0d2FybmluZ3MucHVzaChlcnJvck1lc3NhZ2UobG9jLCBjb2RlLCBhcmdzKSlcbn1cblxuZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGxvYywgY29kZSwgYXJncykge1xuXHRpZiAobG9jIGluc3RhbmNlb2YgUG9zKVxuXHRcdGxvYyA9IHNpbmdsZUNoYXJMb2MobG9jKVxuXHRjb25zdCBsYW5ndWFnZSA9IG9wdGlvbnMubGFuZ3VhZ2UoKVxuXHRjb25zdCBtZXNzYWdlID0gaXNFbXB0eShhcmdzKSA/IGxhbmd1YWdlW2NvZGVdIDogbGFuZ3VhZ2VbY29kZV0oLi4uYXJncylcblx0cmV0dXJuIG5ldyBFcnJvck1lc3NhZ2UobG9jLCBtZXNzYWdlKVxufVxuIl19