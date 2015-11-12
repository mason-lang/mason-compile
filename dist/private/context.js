'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../CompileError', './CompileOptions'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../CompileError'), require('./CompileOptions'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.CompileOptions);
		global.context = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _CompileOptions) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.warnings = exports.options = undefined;
	exports.setContext = setContext;
	exports.unsetContext = unsetContext;
	exports.check = check;
	exports.fail = fail;
	exports.warn = warn;

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileOptions2 = _interopRequireDefault(_CompileOptions);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	let options = exports.options = undefined;
	let warnings = exports.warnings = undefined;

	function setContext(opts) {
		exports.options = options = new _CompileOptions2.default(opts);
		exports.warnings = warnings = [];
	}

	function unsetContext() {
		exports.options = options = null;
		exports.warnings = warnings = null;
	}

	function check(cond, loc, message) {
		if (!cond) {
			if (loc instanceof Function) loc = loc();
			if (message instanceof Function) message = message();
			fail(loc, message);
		}
	}

	function fail(loc, message) {
		throw new _CompileError2.default(warning(loc, message));
	}

	function warn(loc, message) {
		warnings.push(warning(loc, message));
	}

	const warning = (loc, message) => {
		if (loc instanceof _Loc.Pos) loc = (0, _Loc.singleCharLoc)(loc);
		return new _CompileError.Warning(loc, message);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL2NvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQW1CZ0IsVUFBVSxHQUFWLFVBQVU7U0FNVixZQUFZLEdBQVosWUFBWTtTQVNaLEtBQUssR0FBTCxLQUFLO1NBY0wsSUFBSSxHQUFKLElBQUk7U0FVSixJQUFJLEdBQUosSUFBSTs7Ozs7Ozs7Ozs7O0tBbERULE9BQU8sV0FBUCxPQUFPO0tBS1AsUUFBUSxXQUFSLFFBQVE7O1VBTUgsVUFBVTtVQVhmLE9BQU8sR0FZakIsT0FBTyxHQUFHLDZCQUFtQixJQUFJLENBQUM7VUFQeEIsUUFBUSxHQVFsQixRQUFRLEdBQUcsRUFBRTs7O1VBSUUsWUFBWTtVQWpCakIsT0FBTyxHQWtCakIsT0FBTyxHQUFHLElBQUk7VUFiSixRQUFRLEdBY2xCLFFBQVEsR0FBRyxJQUFJOzs7VUFPQSxLQUFLOzs7Ozs7OztVQWNMLElBQUk7Ozs7VUFVSixJQUFJIiwiZmlsZSI6ImNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Bvcywgc2luZ2xlQ2hhckxvY30gZnJvbSAnZXNhc3QvZGlzdC9Mb2MnXG5pbXBvcnQgQ29tcGlsZUVycm9yLCB7V2FybmluZ30gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IENvbXBpbGVPcHRpb25zIGZyb20gJy4vQ29tcGlsZU9wdGlvbnMnXG5cbi8qKlxuT3B0aW9ucyB0aGF0IHdlcmUgcGFzc2VkIGluIGF0IHRoZSBjYWxsIHRvIHtAbGluayBjb21waWxlfS5cbkB0eXBlIHtDb21waWxlT3B0aW9uc31cbiovXG5leHBvcnQgbGV0IG9wdGlvbnNcbi8qKlxuQXJyYXkgb2YgYWxsIHdhcm5pbmdzIHByb2R1Y2VkIGR1cmluZyBjb21waWxhdGlvbi5cbihQbGVhc2UgdXNlIHtAd2Fybn0gaW5zdGVhZCBvZiB3cml0aW5nIHRvIHRoaXMgZGlyZWN0bHkuKVxuKi9cbmV4cG9ydCBsZXQgd2FybmluZ3NcblxuLyoqXG5Xcml0ZSB0byB7QGxpbmsgb3B0aW9uc30gYW5kIHtAbGluayB3YXJuaW5nc30uXG5SZW1lbWJlciB0byBjYWxsIHtAbGluayB1bnNldENvbnRleHR9IVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb250ZXh0KG9wdHMpIHtcblx0b3B0aW9ucyA9IG5ldyBDb21waWxlT3B0aW9ucyhvcHRzKVxuXHR3YXJuaW5ncyA9IFtdXG59XG5cbi8qKiBSZWxlYXNlIHtAbGluayBvcHRpb25zfSBhbmQge0BsaW5rIHdhcm5pbmdzfSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuc2V0Q29udGV4dCgpIHtcblx0b3B0aW9ucyA9IG51bGxcblx0d2FybmluZ3MgPSBudWxsXG59XG5cbi8qKlxuSWYgYGNvbmRgIGlzIGZhbHNlLCB7QGxpbmsgZmFpbH0uXG5gbG9jYCBhbmQgYG1lc3NhZ2VgIG1heSBhbHNvIGJlIEZ1bmN0aW9ucyB0byB0byBnZXQgdGhlbSBsYXppbHkuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrKGNvbmQsIGxvYywgbWVzc2FnZSkge1xuXHRpZiAoIWNvbmQpIHtcblx0XHRpZiAobG9jIGluc3RhbmNlb2YgRnVuY3Rpb24pXG5cdFx0XHRsb2MgPSBsb2MoKVxuXHRcdGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRnVuY3Rpb24pXG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZSgpXG5cdFx0ZmFpbChsb2MsIG1lc3NhZ2UpXG5cdH1cbn1cblxuLyoqXG5UaHJvdyBhIHtAbGluayBDb21waWxlRXJyb3J9LlxuUGFyYW1ldGVycyBhcmUgdGhlIHNhbWUgYXMgZm9yIHtAbGluayB3YXJufS5cbiovXG5leHBvcnQgZnVuY3Rpb24gZmFpbChsb2MsIG1lc3NhZ2UpIHtcblx0dGhyb3cgbmV3IENvbXBpbGVFcnJvcih3YXJuaW5nKGxvYywgbWVzc2FnZSkpXG59XG5cbi8qKlxuQWRkIGEgbmV3IHdhcm5pbmcuXG5AcGFyYW0ge0xvY3xQb3N9IGxvY1xuQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2Vcblx0V2lsbCBvZnRlbiBjb250YWluIHNlcXVlbmNlcyBjcmVhdGVkIGJ5IHtAbGluayBjb2RlfS5cbiovXG5leHBvcnQgZnVuY3Rpb24gd2Fybihsb2MsIG1lc3NhZ2UpIHtcblx0d2FybmluZ3MucHVzaCh3YXJuaW5nKGxvYywgbWVzc2FnZSkpXG59XG5cbmNvbnN0IHdhcm5pbmcgPSAobG9jLCBtZXNzYWdlKSA9PiB7XG5cdGlmIChsb2MgaW5zdGFuY2VvZiBQb3MpXG5cdFx0bG9jID0gc2luZ2xlQ2hhckxvYyhsb2MpXG5cdHJldHVybiBuZXcgV2FybmluZyhsb2MsIG1lc3NhZ2UpXG59XG4iXX0=