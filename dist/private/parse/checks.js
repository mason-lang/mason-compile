'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../Token'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../Token'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.Token);
		global.checks = mod.exports;
	}
})(this, function (exports, _context, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.checkEmpty = checkEmpty;
	exports.checkNonEmpty = checkNonEmpty;
	exports.checkKeyword = checkKeyword;
	exports.unexpected = unexpected;

	function checkEmpty(tokens, message) {
		(0, _context.check)(tokens.isEmpty(), tokens.loc, message);
	}

	function checkNonEmpty(tokens, message) {
		(0, _context.check)(!tokens.isEmpty(), tokens.loc, message);
	}

	function checkKeyword(keyword, token) {
		(0, _context.check)((0, _Token.isKeyword)(keyword, token), token.loc, () => `Expected ${ (0, _Token.showKeyword)(keyword) }`);
	}

	function unexpected(token) {
		const message = (0, _Token.isReservedKeyword)(token) ? `Reserved word ${ token }.` : `Unexpected ${ token }.`;
		(0, _context.fail)(token.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjaGVja3MuanMiLCJzb3VyY2VzQ29udGVudCI6W119