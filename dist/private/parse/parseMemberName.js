'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../Token', './checks', './parseName', './parseQuote', './Slice'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../Token'), require('./checks'), require('./parseName'), require('./parseQuote'), require('./Slice'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Token, global.checks, global.parseName, global.parseQuote, global.Slice);
		global.parseMemberName = mod.exports;
	}
})(this, function (exports, _Token, _checks, _parseName, _parseQuote, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMemberName;

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parseMemberName(token) {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.Groups.Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _checks.unexpected)(token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWVtYmVyTmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBV3dCLGVBQWU7Ozs7Ozs7Ozs7OztVQUFmLGVBQWUiLCJmaWxlIjoicGFyc2VNZW1iZXJOYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtHcm91cHMsIGlzR3JvdXB9IGZyb20gJy4uL1Rva2VuJ1xuaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG4vKipcblBhcnNlIGEgcGxhaW4gbWVtYmVyIChgYS5iYCkgb3IgY29tcHV0ZWQgbWVtYmVyIChgYS5cImJcImApLlxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbkByZXR1cm4ge3N0cmluZ3xRdW90ZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1lbWJlck5hbWUodG9rZW4pIHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIG5hbWVcblx0ZWxzZSBpZiAoaXNHcm91cChHcm91cHMuUXVvdGUsIHRva2VuKSlcblx0XHRyZXR1cm4gcGFyc2VRdW90ZShTbGljZS5ncm91cCh0b2tlbikpXG5cdGVsc2Vcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxufVxuIl19