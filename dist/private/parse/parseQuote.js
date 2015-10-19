if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../MsAst', './parse*'], function (exports, module, _MsAst, _parse) {
	'use strict';

	module.exports = parseQuote;

	/** Parse tokens in a {@link Groups.Quote}. */

	function parseQuote(tokens) {
		return new _MsAst.Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : (0, _parse.parseSingle)(_)));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlUXVvdGUuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztrQkNJd0IsVUFBVTs7OztBQUFuQixVQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDMUMsU0FBTyxXQUxBLEtBQUssQ0FLSyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsV0FKbEUsV0FBVyxFQUltRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDekYiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZVF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge1F1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7cGFyc2VTaW5nbGV9IGZyb20gJy4vcGFyc2UqJ1xuXG4vKiogUGFyc2UgdG9rZW5zIGluIGEge0BsaW5rIEdyb3Vwcy5RdW90ZX0uICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVF1b3RlKHRva2Vucykge1xuXHRyZXR1cm4gbmV3IFF1b3RlKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
