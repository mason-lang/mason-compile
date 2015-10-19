if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './checks', '../Token'], function (exports, _checks, _Token) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.default = parseName;
	exports.tryParseName = tryParseName;

	/**
 Parse a {@link Name} or {@link Keyword} usable as one.
 @return {string}
 */

	function parseName(token) {
		const name = tryParseName(token);
		if (name === null) (0, _checks.unexpected)(token);
		return name;
	}

	/**
 Like {@link parseName} but returns `null` on failure.
 @return {?string}
 */

	function tryParseName(token) {
		return token instanceof _Token.Name ? token.name : (0, _Token.isNameKeyword)(token) ? (0, _Token.keywordName)(token.kind) : null;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTmFtZS5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7bUJDT3dCLFNBQVM7Ozs7Ozs7O0FBQWxCLFVBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtBQUN4QyxRQUFNLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEMsTUFBSSxJQUFJLEtBQUssSUFBSSxFQUNoQixZQVZNLFVBQVUsRUFVTCxLQUFLLENBQUMsQ0FBQTtBQUNsQixTQUFPLElBQUksQ0FBQTtFQUNYOzs7Ozs7O0FBTU0sVUFBUyxZQUFZLENBQUMsS0FBSyxFQUFFO0FBQ25DLFNBQU8sS0FBSyxtQkFsQnVCLElBQUksQUFrQlgsR0FDM0IsS0FBSyxDQUFDLElBQUksR0FDVixXQXBCTSxhQUFhLEVBb0JMLEtBQUssQ0FBQyxHQUNwQixXQXJCcUIsV0FBVyxFQXFCcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUN2QixJQUFJLENBQUE7RUFDTCIsImZpbGUiOiJwcml2YXRlL3BhcnNlL3BhcnNlTmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7aXNOYW1lS2V5d29yZCwga2V5d29yZE5hbWUsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuXG4vKipcblBhcnNlIGEge0BsaW5rIE5hbWV9IG9yIHtAbGluayBLZXl3b3JkfSB1c2FibGUgYXMgb25lLlxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTmFtZSh0b2tlbikge1xuXHRjb25zdCBuYW1lID0gdHJ5UGFyc2VOYW1lKHRva2VuKVxuXHRpZiAobmFtZSA9PT0gbnVsbClcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRyZXR1cm4gbmFtZVxufVxuXG4vKipcbkxpa2Uge0BsaW5rIHBhcnNlTmFtZX0gYnV0IHJldHVybnMgYG51bGxgIG9uIGZhaWx1cmUuXG5AcmV0dXJuIHs/c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZU5hbWUodG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgTmFtZSA/XG5cdFx0dG9rZW4ubmFtZSA6XG5cdFx0aXNOYW1lS2V5d29yZCh0b2tlbikgP1xuXHRcdGtleXdvcmROYW1lKHRva2VuLmtpbmQpIDpcblx0XHRudWxsXG59XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
