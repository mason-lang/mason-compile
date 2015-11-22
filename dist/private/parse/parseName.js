'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './checks', '../Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./checks'), require('../Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.checks, global.Token);
		global.parseName = mod.exports;
	}
})(this, function (exports, _checks, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseName;
	exports.tryParseName = tryParseName;

	function parseName(token) {
		const name = tryParseName(token);
		if (name === null) (0, _checks.unexpected)(token);
		return name;
	}

	function tryParseName(token) {
		return token instanceof _Token.Name ? token.name : (0, _Token.isNameKeyword)(token) ? (0, _Token.keywordName)(token.kind) : null;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTmFtZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBT3dCLFNBQVM7U0FXakIsWUFBWSxHQUFaLFlBQVk7O1VBWEosU0FBUzs7Ozs7O1VBV2pCLFlBQVkiLCJmaWxlIjoicGFyc2VOYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1bmV4cGVjdGVkfSBmcm9tICcuL2NoZWNrcydcbmltcG9ydCB7aXNOYW1lS2V5d29yZCwga2V5d29yZE5hbWUsIE5hbWV9IGZyb20gJy4uL1Rva2VuJ1xuXG4vKipcblBhcnNlIGEge0BsaW5rIE5hbWV9IG9yIHtAbGluayBLZXl3b3JkfSB1c2FibGUgYXMgb25lLlxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTmFtZSh0b2tlbikge1xuXHRjb25zdCBuYW1lID0gdHJ5UGFyc2VOYW1lKHRva2VuKVxuXHRpZiAobmFtZSA9PT0gbnVsbClcblx0XHR1bmV4cGVjdGVkKHRva2VuKVxuXHRyZXR1cm4gbmFtZVxufVxuXG4vKipcbkxpa2Uge0BsaW5rIHBhcnNlTmFtZX0gYnV0IHJldHVybnMgYG51bGxgIG9uIGZhaWx1cmUuXG5AcmV0dXJuIHs/c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlQYXJzZU5hbWUodG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgTmFtZSA/XG5cdFx0dG9rZW4ubmFtZSA6XG5cdFx0aXNOYW1lS2V5d29yZCh0b2tlbikgP1xuXHRcdGtleXdvcmROYW1lKHRva2VuLmtpbmQpIDpcblx0XHRudWxsXG59XG4iXX0=