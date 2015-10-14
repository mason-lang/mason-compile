if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../Token', './checks', './parseName', './parseQuote', './Slice'], function (exports, module, _Token, _checks, _parseName, _parseQuote, _Slice) {
	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _parseQuote2 = _interopRequireDefault(_parseQuote);

	var _Slice2 = _interopRequireDefault(_Slice);

	module.exports = token => {
		const name = (0, _parseName.tryParseName)(token);
		if (name !== null) return name;else if ((0, _Token.isGroup)(_Token.G_Quote, token)) return (0, _parseQuote2.default)(_Slice2.default.group(token));else (0, _checks.unexpected)(token);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTWVtYmVyTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VNZW1iZXJOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7a0JDTWUsS0FBSyxJQUFJO0FBQ3ZCLFFBQU0sSUFBSSxHQUFHLGVBTE4sWUFBWSxFQUtPLEtBQUssQ0FBQyxDQUFBO0FBQ2hDLE1BQUksSUFBSSxLQUFLLElBQUksRUFDaEIsT0FBTyxJQUFJLENBQUEsS0FDUCxJQUFJLFdBVk8sT0FBTyxTQUFoQixPQUFPLEVBVVksS0FBSyxDQUFDLEVBQy9CLE9BQU8sMEJBQVcsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUEsS0FFckMsWUFaTSxVQUFVLEVBWUwsS0FBSyxDQUFDLENBQUE7RUFDbEIiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZU1lbWJlck5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImltcG9ydCB7R19RdW90ZSwgaXNHcm91cH0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge3VuZXhwZWN0ZWR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHt0cnlQYXJzZU5hbWV9IGZyb20gJy4vcGFyc2VOYW1lJ1xuaW1wb3J0IHBhcnNlUXVvdGUgZnJvbSAnLi9wYXJzZVF1b3RlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbmV4cG9ydCBkZWZhdWx0IHRva2VuID0+IHtcblx0Y29uc3QgbmFtZSA9IHRyeVBhcnNlTmFtZSh0b2tlbilcblx0aWYgKG5hbWUgIT09IG51bGwpXG5cdFx0cmV0dXJuIG5hbWVcblx0ZWxzZSBpZiAoaXNHcm91cChHX1F1b3RlLCB0b2tlbikpXG5cdFx0cmV0dXJuIHBhcnNlUXVvdGUoU2xpY2UuZ3JvdXAodG9rZW4pKVxuXHRlbHNlXG5cdFx0dW5leHBlY3RlZCh0b2tlbilcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
