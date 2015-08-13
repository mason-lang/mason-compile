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
			if (this.opts.warnAsError()) this.fail(loc, message);else this.warnings.push(warning(loc, message));
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
		return (0, _CompileError.Warning)(loc, message);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvQ29tcGlsZUNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdlLE9BQU0sY0FBYyxDQUFDO0FBQ25DLGFBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDakIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDaEIsT0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7R0FDbEI7O0FBRUQsT0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQ3pCLE9BQUksQ0FBQyxJQUFJLEVBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDeEI7O0FBRUQsTUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEIsU0FBTSw0QkFBYSxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDekM7O0FBRUQsTUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDbEIsT0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQSxLQUV2QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7R0FDMUM7O0FBRUQsUUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQzFCLE9BQUksSUFBSSxFQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3hCO0VBQ0Q7O2tCQTFCb0IsY0FBYzs7QUE0Qm5DLE9BQ0MsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUM7T0FFN0MsT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sS0FBSztBQUMzQixLQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2pCLFNBQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDekIsTUFBSSxHQUFHLDBCQXBDQSxHQUFHLEFBb0NZLEVBQ3JCLEdBQUcsR0FBRyxrQkFyQ0ssYUFBYSxFQXFDSixHQUFHLENBQUMsQ0FBQTtBQUN6QixTQUFPLGtCQXZDYyxPQUFPLEVBdUNiLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUM1QixDQUFBIiwiZmlsZSI6InByaXZhdGUvQ29tcGlsZUNvbnRleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tcGlsZUVycm9yLCB7IFdhcm5pbmcgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBQb3MsIHNpbmdsZUNoYXJMb2MgfSBmcm9tICdlc2FzdC9kaXN0L0xvYydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZUNvbnRleHQge1xuXHRjb25zdHJ1Y3RvcihvcHRzKSB7XG5cdFx0dGhpcy5vcHRzID0gb3B0c1xuXHRcdHRoaXMud2FybmluZ3MgPSBbXVxuXHR9XG5cblx0Y2hlY2soY29uZCwgbG9jLCBtZXNzYWdlKSB7XG5cdFx0aWYgKCFjb25kKVxuXHRcdFx0dGhpcy5mYWlsKGxvYywgbWVzc2FnZSlcblx0fVxuXG5cdGZhaWwobG9jLCBtZXNzYWdlKSB7XG5cdFx0dGhyb3cgQ29tcGlsZUVycm9yKHdhcm5pbmcobG9jLCBtZXNzYWdlKSlcblx0fVxuXG5cdHdhcm4obG9jLCBtZXNzYWdlKSB7XG5cdFx0aWYgKHRoaXMub3B0cy53YXJuQXNFcnJvcigpKVxuXHRcdFx0dGhpcy5mYWlsKGxvYywgbWVzc2FnZSlcblx0XHRlbHNlXG5cdFx0XHR0aGlzLndhcm5pbmdzLnB1c2god2FybmluZyhsb2MsIG1lc3NhZ2UpKVxuXHR9XG5cblx0d2FybklmKGNvbmQsIGxvYywgbWVzc2FnZSkge1xuXHRcdGlmIChjb25kKVxuXHRcdFx0dGhpcy53YXJuKGxvYywgbWVzc2FnZSlcblx0fVxufVxuXG5jb25zdFxuXHR1bmxhenkgPSBfID0+IF8gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IF8oKSA6IF8sXG5cblx0d2FybmluZyA9IChsb2MsIG1lc3NhZ2UpID0+IHtcblx0XHRsb2MgPSB1bmxhenkobG9jKVxuXHRcdG1lc3NhZ2UgPSB1bmxhenkobWVzc2FnZSlcblx0XHRpZiAobG9jIGluc3RhbmNlb2YgUG9zKVxuXHRcdFx0bG9jID0gc2luZ2xlQ2hhckxvYyhsb2MpXG5cdFx0cmV0dXJuIFdhcm5pbmcobG9jLCBtZXNzYWdlKVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==