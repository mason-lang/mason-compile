if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../Token', './context', './parseName', './parseQuote', './Slice'], function (exports, module, _Token, _context, _parseName, _parseQuote, _Slice) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	module.exports = token => {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.G_Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _context.unexpected)(token);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTWVtYmVyTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VNZW1iZXJOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7a0JDTWUsS0FBSyxJQUFJO0FBQ3ZCLFFBQU0sSUFBSSxHQUFHLGVBTE4sWUFBWSxFQUtPLEtBQUssQ0FBQyxDQUFBO0FBQ2hDLE1BQUksSUFBSSxLQUFLLElBQUksRUFDaEIsT0FBTyxJQUFJLENBQUEsS0FDUCxJQUFJLFdBVk8sT0FBTyxTQUFoQixPQUFPLEVBVVksS0FBSyxDQUFDLEVBQy9CLE9BQU8sMEJBQVcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsS0FFckMsYUFaTSxVQUFVLEVBWUwsS0FBSyxDQUFDLENBQUE7RUFDbEIiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZU1lbWJlck5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7R19RdW90ZSwgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBwYXJzZVF1b3RlIGZyb20gJy4vcGFyc2VRdW90ZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuXG5leHBvcnQgZGVmYXVsdCB0b2tlbiA9PiB7XG5cdGNvbnN0IG5hbWUgPSB0cnlQYXJzZU5hbWUodG9rZW4pXG5cdGlmIChuYW1lICE9PSBudWxsKVxuXHRcdHJldHVybiBuYW1lXG5cdGVsc2UgaWYgKGlzR3JvdXAoR19RdW90ZSwgdG9rZW4pKVxuXHRcdHJldHVybiBwYXJzZVF1b3RlKFNsaWNlLmdyb3VwKHRva2VuKSlcblx0ZWxzZVxuXHRcdHVuZXhwZWN0ZWQodG9rZW4pXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
