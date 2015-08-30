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
	const NonNameCharacters = '()[]{}.:| \n\t"' + ReservedCharacters;
	exports.NonNameCharacters = NonNameCharacters;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxhbmd1YWdlLmpzIiwicHJpdmF0ZS9sYW5ndWFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0NPLE9BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLENBQ2hDLE9BQU8sRUFDUCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxNQUFNLEVBQ04sT0FBTyxFQUNQLFdBQVcsRUFDWCxVQUFVLEVBQ1YsUUFBUSxFQUNSLE1BQU0sRUFDTixNQUFNLEVBQ04sUUFBUSxFQUNSLFFBQVEsRUFDUixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLGFBQWEsRUFDYixXQUFXLEVBQ1gsVUFBVTs7OztBQUlWLFdBQVUsRUFDVixRQUFROzs7QUFHUixTQUFRLEVBQ1IsU0FBUzs7Ozs7OztFQU9ULENBQUMsQ0FBQTs7Ozs7QUFJRixPQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQTtBQUMvQixPQUFNLGlCQUFpQixHQUFHLGlCQUFpQixHQUFHLGtCQUFrQixDQUFBIiwiZmlsZSI6InByaXZhdGUvbGFuZ3VhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsIi8vIFRPRE86IEFsbG93IE9wdHMgdG8gc3BlY2lmeSBhZGRpdGlvbmFsIGdsb2JhbHMuXG5leHBvcnQgY29uc3QgSnNHbG9iYWxzID0gbmV3IFNldChbXG5cdCdBcnJheScsXG5cdCdCb29sZWFuJyxcblx0J0J1ZmZlcicsXG5cdCdjb25zb2xlJyxcblx0J0RhdGUnLFxuXHQnRXJyb3InLFxuXHQnRXZhbEVycm9yJyxcblx0J0Z1bmN0aW9uJyxcblx0J2dsb2JhbCcsXG5cdCdKU09OJyxcblx0J01hdGgnLFxuXHQnTnVtYmVyJyxcblx0J09iamVjdCcsXG5cdCdSYW5nZUVycm9yJyxcblx0J1JlZmVyZW5jZUVycm9yJyxcblx0J1JlZ0V4cCcsXG5cdCdTdHJpbmcnLFxuXHQnU3ltYm9sJyxcblx0J1N5bnRheEVycm9yJyxcblx0J1R5cGVFcnJvcicsXG5cdCdVUklFcnJvcicsXG5cblx0Ly8gV2ViIG9uZXNcblx0Ly8gVE9ETzogd2ViIG9ubHlcblx0J2RvY3VtZW50Jyxcblx0J3dpbmRvdycsXG5cblx0Ly8gVE9ETzogbm9kZSBvbmx5XG5cdCdtb2R1bGUnLFxuXHQncmVxdWlyZSdcblxuXHQvLyAnU2V0JyBhbmQgJ01hcCcgY29uZmxpY3Qgd2l0aCBtYXNvbidzIHZlcnNpb25zLlxuXHQvLyAnUHJvbWlzZSc6IFVzZSAnJCcgaW5zdGVhZC5cblx0Ly8gRm9yIGZvbGxvd2luZywganVzdCB1c2UgYGdsb2JhbC54eHhgLlxuXHQvLyAnY2xlYXJJbnRlcnZhbCcsICdjbGVhclRpbWVvdXQnLCAnY29uc29sZScsICdkZWNvZGVVUkknLCAnZGVjb2RlVVJJQ29tcG9uZW50Jyxcblx0Ly8gJ2VuY29kZVVSSScsICdlbmNvZGVVUklDb21wb25lbnQnLCAnZXZhbCcsICdzZXRJbnRlcnZhbCcsICdzZXRUaW1lb3V0J1xuXSlcblxuLy8gQW55dGhpbmcgbm90IGV4cGxpY2l0bHkgcmVzZXJ2ZWQgaXMgYSB2YWxpZCBuYW1lIGNoYXJhY3Rlci5cbi8vIEEgYH5gIG1heSBhcHBlYXIgaW4gYSBuYW1lLCBidXQgbm90IGF0IHRoZSBiZWdpbm5pbmcuXG5jb25zdCBSZXNlcnZlZENoYXJhY3RlcnMgPSAnYCMlXiZcXFxcOywnXG5leHBvcnQgY29uc3QgTm9uTmFtZUNoYXJhY3RlcnMgPSAnKClbXXt9Ljp8IFxcblxcdFwiJyArIFJlc2VydmVkQ2hhcmFjdGVyc1xuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=