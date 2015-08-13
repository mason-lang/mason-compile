if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'chalk', '../CompileError', '../private/util'], function (exports, _chalk, _CompileError, _privateUtil) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	exports.default = (error, modulePath) => format(error.warning, modulePath, 'error');

	const formatWarningForConsole = (warning, modulePath) => {
		(0, _privateUtil.type)(warning, _CompileError.Warning, modulePath, String);
		// Extra space to match up with 'error'
		return format(warning, modulePath, 'warn ');
	};

	exports.formatWarningForConsole = formatWarningForConsole;
	const format = (warning, modulePath, kind) => {
		const message = (0, _privateUtil.iteratorToArray)((0, _CompileError.formatCode)(warning.message, _chalk.green)).join('');
		return `${ (0, _chalk.blue)(modulePath) }\n${ (0, _chalk.magenta)(kind) } ${ _chalk.bold.red(warning.loc) } ${ message }`;
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGUtb25seS9mb3JtYXRDb21waWxlRXJyb3JGb3JDb25zb2xlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7bUJBSWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxLQUFLLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUM7O0FBRXpFLE9BQU0sdUJBQXVCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxLQUFLO0FBQy9ELG1CQUx5QixJQUFJLEVBS3hCLE9BQU8sZ0JBTkosT0FBTyxFQU1RLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFMUMsU0FBTyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUMzQyxDQUFBOzs7QUFFRCxPQUFNLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxLQUFLO0FBQzdDLFFBQU0sT0FBTyxHQUFHLGlCQVhSLGVBQWUsRUFXUyxrQkFaZixVQUFVLEVBWWdCLE9BQU8sQ0FBQyxPQUFPLFNBYjVDLEtBQUssQ0FhK0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUM1RSxTQUFPLENBQUMsR0FBRSxXQWRGLElBQUksRUFjRyxVQUFVLENBQUMsRUFBQyxFQUFFLEdBQUUsV0FkVixPQUFPLEVBY1csSUFBSSxDQUFDLEVBQUMsQ0FBQyxHQUFFLE9BZGxCLElBQUksQ0FjbUIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQTtFQUNsRixDQUFBIiwiZmlsZSI6Im5vZGUtb25seS9mb3JtYXRDb21waWxlRXJyb3JGb3JDb25zb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmx1ZSwgZ3JlZW4sIG1hZ2VudGEsIGJvbGQgfSBmcm9tICdjaGFsaydcbmltcG9ydCB7IFdhcm5pbmcsIGZvcm1hdENvZGUgfSBmcm9tICcuLi9Db21waWxlRXJyb3InXG5pbXBvcnQgeyBpdGVyYXRvclRvQXJyYXksIHR5cGUgfSBmcm9tICcuLi9wcml2YXRlL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IChlcnJvciwgbW9kdWxlUGF0aCkgPT4gZm9ybWF0KGVycm9yLndhcm5pbmcsIG1vZHVsZVBhdGgsICdlcnJvcicpXG5cbmV4cG9ydCBjb25zdCBmb3JtYXRXYXJuaW5nRm9yQ29uc29sZSA9ICh3YXJuaW5nLCBtb2R1bGVQYXRoKSA9PiB7XG5cdHR5cGUod2FybmluZywgV2FybmluZywgbW9kdWxlUGF0aCwgU3RyaW5nKVxuXHQvLyBFeHRyYSBzcGFjZSB0byBtYXRjaCB1cCB3aXRoICdlcnJvcidcblx0cmV0dXJuIGZvcm1hdCh3YXJuaW5nLCBtb2R1bGVQYXRoLCAnd2FybiAnKVxufVxuXG5jb25zdCBmb3JtYXQgPSAod2FybmluZywgbW9kdWxlUGF0aCwga2luZCkgPT4ge1xuXHRjb25zdCBtZXNzYWdlID0gaXRlcmF0b3JUb0FycmF5KGZvcm1hdENvZGUod2FybmluZy5tZXNzYWdlLCBncmVlbikpLmpvaW4oJycpXG5cdHJldHVybiBgJHtibHVlKG1vZHVsZVBhdGgpfVxcbiR7bWFnZW50YShraW5kKX0gJHtib2xkLnJlZCh3YXJuaW5nLmxvYyl9ICR7bWVzc2FnZX1gXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==