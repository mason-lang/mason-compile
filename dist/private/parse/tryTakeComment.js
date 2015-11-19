'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../Token', '../util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../Token'), require('../util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Token, global.util);
		global.tryTakeComment = mod.exports;
	}
})(this, function (exports, _Token, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = tryTakeComment;

	function tryTakeComment(lines) {
		let comments = [];
		let rest = lines;

		while (true) {
			if (rest.isEmpty()) break;
			const hs = rest.headSlice();
			const h = hs.head();
			if (!(h instanceof _Token.DocComment)) break;
			(0, _util.assert)(hs.size() === 1);
			comments.push(h);
			rest = rest.tail();
		}

		return [(0, _util.isEmpty)(comments) ? null : comments.map(_ => _.text).join('\n'), rest];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ0cnlUYWtlQ29tbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=