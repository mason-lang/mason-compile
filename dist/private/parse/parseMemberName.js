if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../Token', './checks', './parseName', './parseQuote', './Slice'], function (exports, module, _Token, _checks, _parseName, _parseQuote, _Slice) {
	'use strict';

	module.exports = parseMemberName;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse a plain member (`a.b`) or computed member (`a."b"`).
 @param {Token} token
 @return {string|Quote}
 */

	function parseMemberName(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _checks.unexpected)(token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTWVtYmVyTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VNZW1iZXJOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7a0JDV3dCLGVBQWU7Ozs7Ozs7Ozs7Ozs7O0FBQXhCLFVBQVMsZUFBZSxDQUFDLEtBQUssRUFBRTtBQUM5QyxRQUFNLElBQUksR0FBRyxlQVZOLFlBQVksRUFVTyxLQUFLLENBQUMsQ0FBQTtBQUNoQyxNQUFJLElBQUksS0FBSyxJQUFJLEVBQ2hCLE9BQU8sSUFBSSxDQUFBLEtBQ1AsSUFBSSxXQWZNLE9BQU8sRUFlTCxPQWZWLE1BQU0sQ0FlVyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ3BDLE9BQU8sMEJBQVcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsS0FFckMsWUFqQk0sVUFBVSxFQWlCTCxLQUFLLENBQUMsQ0FBQTtFQUNsQiIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTWVtYmVyTmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHtHcm91cHMsIGlzR3JvdXB9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGEgcGxhaW4gbWVtYmVyIChgYS5iYCkgb3IgY29tcHV0ZWQgbWVtYmVyIChgYS5cImJcImApLlxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbkByZXR1cm4ge3N0cmluZ3xRdW90ZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1lbWJlck5hbWUodG9rZW4pIHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIG5hbWVcblx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUXVvdGUsIHRva2VuKSlcblx0XHRyZXR1cm4gcGFyc2VRdW90ZShTbGljZS5ncm91cCh0b2tlbikpXG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
