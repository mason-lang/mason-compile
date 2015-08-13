if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports'], function (exports) {
	// TODO: Allow Opts to specify additional globals.
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	const JsGlobals = new Set(['Array', 'Boolean', 'Buffer', 'console', 'Date', 'Error', 'EvalError', 'Function', 'global', 'JSON', 'Math', 'Number', 'Object', 'RangeError', 'ReferenceError', 'RegExp', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'URIError',

	// Web ones
	// TODO: web only
	'document', 'window',

	// TODO: node only
	'module', 'require'

	// 'Set' and 'Map' conflict with mason's versions.
	// 'Promise': Use '$' instead.
	// For following, just use `global.xxx`.
	// 'clearInterval', 'clearTimeout', 'console', 'decodeURI', 'decodeURIComponent',
	// 'encodeURI', 'encodeURIComponent', 'eval', 'setInterval', 'setTimeout'
	]);

	exports.JsGlobals = JsGlobals;
	// Anything not explicitly reserved is a valid name character.
	// A `~` may appear in a name, but not at the beginning.
	const ReservedCharacters = '`#%^&\\;,';
	const NonNameCharacters = '()[]{}.:|_ \n\t"' + ReservedCharacters;
	exports.NonNameCharacters = NonNameCharacters;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUvbGFuZ3VhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNPLE9BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLENBQ2hDLE9BQU8sRUFDUCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxNQUFNLEVBQ04sT0FBTyxFQUNQLFdBQVcsRUFDWCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFDTixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsRUFDUixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLGFBQWEsRUFDYixXQUFXLEVBQ1gsVUFBVTs7OztBQUlWLFdBQVUsRUFDVixRQUFROzs7QUFHUixTQUFRLEVBQ1IsU0FBUzs7Ozs7OztFQU9ULENBQUMsQ0FBQTs7Ozs7QUFJRixPQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQTtBQUMvQixPQUFNLGlCQUFpQixHQUFHLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBIiwiZmlsZSI6InByaXZhdGUvbGFuZ3VhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPOiBBbGxvdyBPcHRzIHRvIHNwZWNpZnkgYWRkaXRpb25hbCBnbG9iYWxzLlxuZXhwb3J0IGNvbnN0IEpzR2xvYmFscyA9IG5ldyBTZXQoW1xuXHQnQXJyYXknLFxuXHQnQm9vbGVhbicsXG5cdCdCdWZmZXInLFxuXHQnY29uc29sZScsXG5cdCdEYXRlJyxcblx0J0Vycm9yJyxcblx0J0V2YWxFcnJvcicsXG5cdCdGdW5jdGlvbicsXG5cdCdnbG9iYWwnLFxuXHQnSlNPTicsXG5cdCdNYXRoJyxcblx0J051bWJlcicsXG5cdCdPYmplY3QnLFxuXHQnUmFuZ2VFcnJvcicsXG5cdCdSZWZlcmVuY2VFcnJvcicsXG5cdCdSZWdFeHAnLFxuXHQnU3RyaW5nJyxcblx0J1N5bWJvbCcsXG5cdCdTeW50YXhFcnJvcicsXG5cdCdUeXBlRXJyb3InLFxuXHQnVVJJRXJyb3InLFxuXG5cdC8vIFdlYiBvbmVzXG5cdC8vIFRPRE86IHdlYiBvbmx5XG5cdCdkb2N1bWVudCcsXG5cdCd3aW5kb3cnLFxuXG5cdC8vIFRPRE86IG5vZGUgb25seVxuXHQnbW9kdWxlJyxcblx0J3JlcXVpcmUnXG5cblx0Ly8gJ1NldCcgYW5kICdNYXAnIGNvbmZsaWN0IHdpdGggbWFzb24ncyB2ZXJzaW9ucy5cblx0Ly8gJ1Byb21pc2UnOiBVc2UgJyQnIGluc3RlYWQuXG5cdC8vIEZvciBmb2xsb3dpbmcsIGp1c3QgdXNlIGBnbG9iYWwueHh4YC5cblx0Ly8gJ2NsZWFySW50ZXJ2YWwnLCAnY2xlYXJUaW1lb3V0JywgJ2NvbnNvbGUnLCAnZGVjb2RlVVJJJywgJ2RlY29kZVVSSUNvbXBvbmVudCcsXG5cdC8vICdlbmNvZGVVUkknLCAnZW5jb2RlVVJJQ29tcG9uZW50JywgJ2V2YWwnLCAnc2V0SW50ZXJ2YWwnLCAnc2V0VGltZW91dCdcbl0pXG5cbi8vIEFueXRoaW5nIG5vdCBleHBsaWNpdGx5IHJlc2VydmVkIGlzIGEgdmFsaWQgbmFtZSBjaGFyYWN0ZXIuXG4vLyBBIGB+YCBtYXkgYXBwZWFyIGluIGEgbmFtZSwgYnV0IG5vdCBhdCB0aGUgYmVnaW5uaW5nLlxuY29uc3QgUmVzZXJ2ZWRDaGFyYWN0ZXJzID0gJ2AjJV4mXFxcXDssJ1xuZXhwb3J0IGNvbnN0IE5vbk5hbWVDaGFyYWN0ZXJzID0gJygpW117fS46fF8gXFxuXFx0XCInICsgUmVzZXJ2ZWRDaGFyYWN0ZXJzXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==