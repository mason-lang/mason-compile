if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../context', '../Token'], function (exports, _CompileError, _context, _Token) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	const checkEmpty = (tokens, message) => {
		(0, _context.check)(tokens.isEmpty(), tokens.loc, message);
	},
	      checkNonEmpty = (tokens, message) => {
		(0, _context.check)(!tokens.isEmpty(), tokens.loc, message);
	},
	      unexpected = token => {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ (0, _CompileError.code)((0, _Token.keywordName)(token.kind)) }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	};
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.unexpected = unexpected;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNoZWNrcy5qcyIsInByaXZhdGUvcGFyc2UvY2hlY2tzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUNJTyxPQUNOLFVBQVUsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEtBQUs7QUFDakMsZUFMTSxLQUFLLEVBS0wsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDNUM7T0FFRCxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLO0FBQ3BDLGVBVE0sS0FBSyxFQVNMLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7RUFDN0M7T0FFRCxVQUFVLEdBQUcsS0FBSyxJQUFJO0FBQ3JCLFFBQU0sT0FBTyxHQUFHLFdBWlYsaUJBQWlCLEVBWVcsS0FBSyxDQUFDLEdBQ3ZDLENBQUMsY0FBYyxHQUFFLGtCQWZaLElBQUksRUFlYSxXQWJFLFdBQVcsRUFhRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FDakQsQ0FBQyxXQUFXLEdBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLGVBaEJhLElBQUksRUFnQlosS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtFQUN4QixDQUFBIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvY2hlY2tzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzUmVzZXJ2ZWRLZXl3b3JkLCBrZXl3b3JkTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5cbmV4cG9ydCBjb25zdFxuXHRjaGVja0VtcHR5ID0gKHRva2VucywgbWVzc2FnZSkgPT4ge1xuXHRcdGNoZWNrKHRva2Vucy5pc0VtcHR5KCksIHRva2Vucy5sb2MsIG1lc3NhZ2UpXG5cdH0sXG5cblx0Y2hlY2tOb25FbXB0eSA9ICh0b2tlbnMsIG1lc3NhZ2UpID0+IHtcblx0XHRjaGVjayghdG9rZW5zLmlzRW1wdHkoKSwgdG9rZW5zLmxvYywgbWVzc2FnZSlcblx0fSxcblxuXHR1bmV4cGVjdGVkID0gdG9rZW4gPT4ge1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSBpc1Jlc2VydmVkS2V5d29yZCh0b2tlbikgP1xuXHRcdFx0YFJlc2VydmVkIHdvcmQgJHtjb2RlKGtleXdvcmROYW1lKHRva2VuLmtpbmQpKX0uYCA6XG5cdFx0XHRgVW5leHBlY3RlZCAke3Rva2VufS5gXG5cdFx0ZmFpbCh0b2tlbi5sb2MsIG1lc3NhZ2UpXG5cdH1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
