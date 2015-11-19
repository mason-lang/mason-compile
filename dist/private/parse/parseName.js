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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU5hbWUuanMiLCJzb3VyY2VzQ29udGVudCI6W119