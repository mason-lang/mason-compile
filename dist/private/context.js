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
	exports.pathOptions = exports.options = undefined;
	exports.withContext = withContext;
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
	let warnings;
	let pathOptions = exports.pathOptions = undefined;

	function withContext(_options, filename, getResult) {
		exports.options = options = _options;
		exports.pathOptions = pathOptions = new _PathOptions2.default(filename);
		warnings = [];

		try {
			let result;

			try {
				result = getResult();
			} catch (error) {
				if (!(error instanceof _CompileError2.default)) throw error;
				result = error;
			}

			warnings.sort((a, b) => a.loc.compare(b.loc));
			return {
				warnings,
				result
			};
		} finally {
			exports.options = options = null;
			exports.pathOptions = pathOptions = null;
			warnings = null;
		}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQXVCZ0IsV0FBVyxHQUFYLFdBQVc7U0E4QlgsS0FBSyxHQUFMLEtBQUs7U0FZTCxJQUFJLEdBQUosSUFBSTtTQWNKLElBQUksR0FBSixJQUFJOzs7Ozs7Ozs7Ozs7S0F6RVQsT0FBTyxXQUFQLE9BQU87O0tBT1AsV0FBVyxXQUFYLFdBQVc7O1VBVU4sV0FBVztVQWpCaEIsT0FBTyxHQWtCakIsT0FBTyxHQUFHLFFBQVE7VUFYUixXQUFXLEdBWXJCLFdBQVcsR0FBRywwQkFBZ0IsUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbkI3QixPQUFPLEdBcUNoQixPQUFPLEdBQUcsSUFBSTtXQTlCTCxXQUFXLEdBK0JwQixXQUFXLEdBQUcsSUFBSTs7Ozs7VUFTSixLQUFLOzs7O3FDQUFxQixJQUFJO0FBQUosUUFBSTs7Ozs7OztVQVk5QixJQUFJO3FDQUFlLElBQUk7QUFBSixPQUFJOzs7Ozs7VUFjdkIsSUFBSTtxQ0FBZSxJQUFJO0FBQUosT0FBSSIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQb3MsIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuaW1wb3J0IENvbXBpbGVFcnJvciwge0Vycm9yTWVzc2FnZX0gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IFBhdGhPcHRpb25zIGZyb20gJy4vUGF0aE9wdGlvbnMnXG5pbXBvcnQge2lzRW1wdHl9IGZyb20gJy4vdXRpbCdcblxuLyoqIEB0eXBlIHtDb21waWxlT3B0aW9uc30gKi9cbmV4cG9ydCBsZXQgb3B0aW9uc1xuLyoqXG5BcnJheSBvZiBhbGwgd2FybmluZ3MgcHJvZHVjZWQgZHVyaW5nIGNvbXBpbGF0aW9uLlxuKFBsZWFzZSB1c2Uge0B3YXJufSBpbnN0ZWFkIG9mIHdyaXRpbmcgdG8gdGhpcyBkaXJlY3RseS4pXG4qL1xubGV0IHdhcm5pbmdzXG4vKiogQHR5cGUge1BhdGhPcHRpb25zfSAqL1xuZXhwb3J0IGxldCBwYXRoT3B0aW9uc1xuXG4vKipcbmBvcHRpb25zYCBhbmQgYHBhdGhPcHRpb25zYCB3aWxsIGJlIHNldCB3aGlsZSBydW5uaW5nIGBnZXRSZXN1bHRgLlxuV2hlbiBkb25lLCByZXR1cm5zIHdhcm5pbmdzIGFsb25nIHdpdGggdGhlIHJlc3VsdC5cbkBwYXJhbSB7Q29tcGlsZU9wdGlvbnN9IF9vcHRpb25zXG5AcGFyYW0ge3N0cmluZ30gZmlsZW5hbWVcbkBwYXJhbSB7ZnVuY3Rpb24oKTogYW55fSBnZXRSZXN1bHRcbkByZXR1cm4ge3t3YXJuaW5ncywgcmVzdWx0fX1cbiovXG5leHBvcnQgZnVuY3Rpb24gd2l0aENvbnRleHQoX29wdGlvbnMsIGZpbGVuYW1lLCBnZXRSZXN1bHQpIHtcblx0b3B0aW9ucyA9IF9vcHRpb25zXG5cdHBhdGhPcHRpb25zID0gbmV3IFBhdGhPcHRpb25zKGZpbGVuYW1lKVxuXHR3YXJuaW5ncyA9IFtdXG5cblx0dHJ5IHtcblx0XHRsZXQgcmVzdWx0XG5cdFx0dHJ5IHtcblx0XHRcdHJlc3VsdCA9IGdldFJlc3VsdCgpXG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGlmICghKGVycm9yIGluc3RhbmNlb2YgQ29tcGlsZUVycm9yKSlcblx0XHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRcdHJlc3VsdCA9IGVycm9yXG5cdFx0fVxuXG5cdFx0Ly8gU29ydCB3YXJuaW5ncyB0byBtYWtlIHRoZW0gZWFzaWVyIHRvIHJlYWQuXG5cdFx0d2FybmluZ3Muc29ydCgoYSwgYikgPT4gYS5sb2MuY29tcGFyZShiLmxvYykpXG5cdFx0cmV0dXJuIHt3YXJuaW5ncywgcmVzdWx0fVxuXHR9IGZpbmFsbHkge1xuXHRcdC8vIFJlbGVhc2UgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0XHRvcHRpb25zID0gbnVsbFxuXHRcdHBhdGhPcHRpb25zID0gbnVsbFxuXHRcdHdhcm5pbmdzID0gbnVsbFxuXHR9XG59XG5cbi8qKlxuSWYgYGNvbmRgIGlzIGZhbHNlLCB7QGxpbmsgZmFpbH0uXG5gbG9jYCBhbmQgYG1lc3NhZ2VgIG1heSBhbHNvIGJlIEZ1bmN0aW9ucyB0byB0byBnZXQgdGhlbSBsYXppbHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrKGNvbmQsIGxvYywgY29kZSwgLi4uYXJncykge1xuXHRpZiAoIWNvbmQpIHtcblx0XHRpZiAobG9jIGluc3RhbmNlb2YgRnVuY3Rpb24pXG5cdFx0XHRsb2MgPSBsb2MoKVxuXHRcdGZhaWwobG9jLCBjb2RlLCAuLi5hcmdzKVxuXHR9XG59XG5cbi8qKlxuVGhyb3cgYSB7QGxpbmsgQ29tcGlsZUVycm9yfS5cblBhcmFtZXRlcnMgYXJlIHRoZSBzYW1lIGFzIGZvciB7QGxpbmsgd2Fybn0uXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZhaWwobG9jLCBjb2RlLCAuLi5hcmdzKSB7XG5cdHRocm93IG5ldyBDb21waWxlRXJyb3IoZXJyb3JNZXNzYWdlKGxvYywgY29kZSwgYXJncykpXG59XG5cbi8qKlxuQWRkIGEgbmV3IHdhcm5pbmcuXG5AcGFyYW0ge0xvY3xQb3N9IGxvY1xuQHBhcmFtIHtzdHJpbmd9IGNvZGVcblx0TWVzc2FnZSBjb2RlLiBGb3IgYSBjb21wbGV0ZSBsaXN0LCBzZWUgYGxhbmd1YWdlcy9lbmdsaXNoYC5cbkBwYXJhbSBhcmdzXG5cdEFyZ3VtZW50cyBmb3IgcmVuZGVyaW5nIHRoZSBtZXNzYWdlLlxuXHRXaGVuIHRoZXNlIGFyZSBzdXBwbGllZCwgdGhlIG1lc3NhZ2UgaGFuZGxlciBtdXN0IGJlIGEgZnVuY3Rpb24uXG5cdFNlZSBgbGFuZ3VhZ2VzL2VuZ2xpc2hgIGZvciB3aGljaCBtZXNzYWdlcyBhcmUgZnVuY3Rpb25zLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKGxvYywgY29kZSwgLi4uYXJncykge1xuXHR3YXJuaW5ncy5wdXNoKGVycm9yTWVzc2FnZShsb2MsIGNvZGUsIGFyZ3MpKVxufVxuXG5mdW5jdGlvbiBlcnJvck1lc3NhZ2UobG9jLCBjb2RlLCBhcmdzKSB7XG5cdGlmIChsb2MgaW5zdGFuY2VvZiBQb3MpXG5cdFx0bG9jID0gc2luZ2xlQ2hhckxvYyhsb2MpXG5cdGNvbnN0IGxhbmd1YWdlID0gb3B0aW9ucy5sYW5ndWFnZSgpXG5cdGNvbnN0IG1lc3NhZ2UgPSBpc0VtcHR5KGFyZ3MpID8gbGFuZ3VhZ2VbY29kZV0gOiBsYW5ndWFnZVtjb2RlXSguLi5hcmdzKVxuXHRyZXR1cm4gbmV3IEVycm9yTWVzc2FnZShsb2MsIG1lc3NhZ2UpXG59XG4iXX0=