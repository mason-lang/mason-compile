if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../CompileError', 'esast/dist/Loc'], function (exports, module, _CompileError, _esastDistLoc) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _CompileError2 = _interopRequireDefault(_CompileError);

	class CompileContext {
		constructor(opts) {
			this.opts = opts;
			this.warnings = [];
		}

		check(cond, loc, message) {
			if (!cond) this.fail(loc, message);
		}

		fail(loc, message) {
			throw (0, _CompileError2.default)(warning(loc, message));
		}

		warn(loc, message) {
			this.warnings.push(warning(loc, message));
		}

		warnIf(cond, loc, message) {
			if (cond) this.warn(loc, message);
		}
	}

	module.exports = CompileContext;

	const unlazy = _ => _ instanceof Function ? _() : _,
	      warning = (loc, message) => {
		loc = unlazy(loc);
		message = unlazy(message);
		if (loc instanceof _esastDistLoc.Pos) loc = (0, _esastDistLoc.singleCharLoc)(loc);
		return new _CompileError.Warning(loc, message);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbXBpbGVDb250ZXh0LmpzIiwicHJpdmF0ZS9Db21waWxlQ29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0dlLE9BQU0sY0FBYyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDakIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7R0FDbEI7O0FBRUQsT0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3pCLE9BQUksQ0FBQyxJQUFJLEVBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDeEI7O0FBRUQsTUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEIsU0FBTSw0QkFBYSxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDekM7O0FBRUQsTUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEIsT0FBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO0dBQ3pDOztBQUVELFFBQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUMxQixPQUFJLElBQUksRUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUN4QjtFQUNEOztrQkF2Qm9CLGNBQWM7O0FBeUJuQyxPQUNDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLFFBQVEsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDO09BRTdDLE9BQU8sR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLEtBQUs7QUFDM0IsS0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNqQixTQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3pCLE1BQUksR0FBRywwQkFqQ0QsR0FBRyxBQWlDYSxFQUNyQixHQUFHLEdBQUcsa0JBbENJLGFBQWEsRUFrQ0gsR0FBRyxDQUFDLENBQUE7QUFDekIsU0FBTyxrQkFwQ2EsT0FBTyxDQW9DUixHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDaEMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL0NvbXBpbGVDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQgQ29tcGlsZUVycm9yLCB7V2FybmluZ30gZnJvbSAnLi4vQ29tcGlsZUVycm9yJ1xuaW1wb3J0IHtQb3MsIHNpbmdsZUNoYXJMb2N9IGZyb20gJ2VzYXN0L2Rpc3QvTG9jJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlQ29udGV4dCB7XG5cdGNvbnN0cnVjdG9yKG9wdHMpIHtcblx0XHR0aGlzLm9wdHMgPSBvcHRzXG5cdFx0dGhpcy53YXJuaW5ncyA9IFtdXG5cdH1cblxuXHRjaGVjayhjb25kLCBsb2MsIG1lc3NhZ2UpIHtcblx0XHRpZiAoIWNvbmQpXG5cdFx0XHR0aGlzLmZhaWwobG9jLCBtZXNzYWdlKVxuXHR9XG5cblx0ZmFpbChsb2MsIG1lc3NhZ2UpIHtcblx0XHR0aHJvdyBDb21waWxlRXJyb3Iod2FybmluZyhsb2MsIG1lc3NhZ2UpKVxuXHR9XG5cblx0d2Fybihsb2MsIG1lc3NhZ2UpIHtcblx0XHR0aGlzLndhcm5pbmdzLnB1c2god2FybmluZyhsb2MsIG1lc3NhZ2UpKVxuXHR9XG5cblx0d2FybklmKGNvbmQsIGxvYywgbWVzc2FnZSkge1xuXHRcdGlmIChjb25kKVxuXHRcdFx0dGhpcy53YXJuKGxvYywgbWVzc2FnZSlcblx0fVxufVxuXG5jb25zdFxuXHR1bmxhenkgPSBfID0+IF8gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IF8oKSA6IF8sXG5cblx0d2FybmluZyA9IChsb2MsIG1lc3NhZ2UpID0+IHtcblx0XHRsb2MgPSB1bmxhenkobG9jKVxuXHRcdG1lc3NhZ2UgPSB1bmxhenkobWVzc2FnZSlcblx0XHRpZiAobG9jIGluc3RhbmNlb2YgUG9zKVxuXHRcdFx0bG9jID0gc2luZ2xlQ2hhckxvYyhsb2MpXG5cdFx0cmV0dXJuIG5ldyBXYXJuaW5nKGxvYywgbWVzc2FnZSlcblx0fVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
