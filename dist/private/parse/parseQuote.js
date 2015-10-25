(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module', '../MsAst', './parse*'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module, require('../MsAst'), require('./parse*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod, global.MsAst, global.parse);
		global.parseQuote = mod.exports;
	}
})(this, function (exports, module, _MsAst, _parse) {
	'use strict';

	module.exports = parseQuote;

	/** Parse tokens in a {@link Groups.Quote}. */

	function parseQuote(tokens) {
		return new _MsAst.QuotePlain(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : (0, _parse.parseSingle)(_)));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQUl3QixVQUFVOzs7O0FBQW5CLFVBQVMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUMxQyxTQUFPLFdBTEEsVUFBVSxDQUtLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxXQUp2RSxXQUFXLEVBSXdFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUM5RiIsImZpbGUiOiJwYXJzZVF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtRdW90ZVBsYWlufSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7cGFyc2VTaW5nbGV9IGZyb20gJy4vcGFyc2UqJ1xuXG4vKiogUGFyc2UgdG9rZW5zIGluIGEge0BsaW5rIEdyb3Vwcy5RdW90ZX0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVF1b3RlKHRva2Vucykge1xuXHRyZXR1cm4gbmV3IFF1b3RlUGxhaW4odG9rZW5zLmxvYywgdG9rZW5zLm1hcChfID0+IHR5cGVvZiBfID09PSAnc3RyaW5nJyA/IF8gOiBwYXJzZVNpbmdsZShfKSkpXG59XG4iXX0=