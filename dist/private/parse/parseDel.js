if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../../CompileError', '../context', '../MsAst', './checks', '../Token', './parse*', './Slice'], function (exports, module, _CompileError, _context, _MsAst, _checks, _Token, _parse, _Slice) {
	'use strict';

	module.exports = parseDel;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Slice2 = _interopRequireDefault(_Slice);

	function parseDel(tokens) {
		(0, _context.check)(tokens.size() === 1, tokens.loc, () => `${ (0, _CompileError.code)('del') } takes only one argument.`);
		const spaced = tokens.head();
		if (!(0, _Token.isGroup)(_Token.Groups.Space, spaced)) (0, _checks.unexpected)(spaced);

		const parts = _Slice2.default.group(spaced);
		const last = parts.last();
		if ((0, _Token.isGroup)(_Token.Groups.Bracket, last)) {
			const object = (0, _parse.parseSpaced)(parts.rtail());
			const args = (0, _parse.parseExprParts)(_Slice2.default.group(last));
			return _MsAst.Call.delSub(tokens.loc, object, args);
		} else (0, _checks.unexpected)(spaced);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlRGVsLmpzIiwicHJpdmF0ZS9wYXJzZS9wYXJzZURlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2tCQ1F3QixRQUFROzs7Ozs7QUFBakIsVUFBUyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3hDLGVBUk8sS0FBSyxFQVFOLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUN0QyxDQUFDLEdBQUUsa0JBVkcsSUFBSSxFQVVGLEtBQUssQ0FBQyxFQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQTtBQUMzQyxRQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDNUIsTUFBSSxDQUFDLFdBUlUsT0FBTyxFQVFULE9BUk4sTUFBTSxDQVFPLEtBQUssRUFBRSxNQUFNLENBQUMsRUFDakMsWUFWTSxVQUFVLEVBVUwsTUFBTSxDQUFDLENBQUE7O0FBRW5CLFFBQU0sS0FBSyxHQUFHLGdCQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQyxRQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsTUFBSSxXQWJXLE9BQU8sRUFhVixPQWJMLE1BQU0sQ0FhTSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDbEMsU0FBTSxNQUFNLEdBQUcsV0FiTyxXQUFXLEVBYU4sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDekMsU0FBTSxJQUFJLEdBQUcsV0FkUCxjQUFjLEVBY1EsZ0JBQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDOUMsVUFBTyxPQWxCRCxJQUFJLENBa0JFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUM1QyxNQUNBLFlBbkJNLFVBQVUsRUFtQkwsTUFBTSxDQUFDLENBQUE7RUFDbkIiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZURlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrfSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0IHtDYWxsfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7dW5leHBlY3RlZH0gZnJvbSAnLi9jaGVja3MnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3BhcnNlRXhwclBhcnRzLCBwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VEZWwodG9rZW5zKSB7XG5cdGNoZWNrKHRva2Vucy5zaXplKCkgPT09IDEsIHRva2Vucy5sb2MsICgpID0+XG5cdFx0YCR7Y29kZSgnZGVsJyl9IHRha2VzIG9ubHkgb25lIGFyZ3VtZW50LmApXG5cdGNvbnN0IHNwYWNlZCA9IHRva2Vucy5oZWFkKClcblx0aWYgKCFpc0dyb3VwKEdyb3Vwcy5TcGFjZSwgc3BhY2VkKSlcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcblxuXHRjb25zdCBwYXJ0cyA9IFNsaWNlLmdyb3VwKHNwYWNlZClcblx0Y29uc3QgbGFzdCA9IHBhcnRzLmxhc3QoKVxuXHRpZiAoaXNHcm91cChHcm91cHMuQnJhY2tldCwgbGFzdCkpIHtcblx0XHRjb25zdCBvYmplY3QgPSBwYXJzZVNwYWNlZChwYXJ0cy5ydGFpbCgpKVxuXHRcdGNvbnN0IGFyZ3MgPSBwYXJzZUV4cHJQYXJ0cyhTbGljZS5ncm91cChsYXN0KSlcblx0XHRyZXR1cm4gQ2FsbC5kZWxTdWIodG9rZW5zLmxvYywgb2JqZWN0LCBhcmdzKVxuXHR9IGVsc2Vcblx0XHR1bmV4cGVjdGVkKHNwYWNlZClcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
