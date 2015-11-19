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
		global.parseMethodSplit = mod.exports;
	}
})(this, function (exports, _context, _Token) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseMethodSplit;

	function parseMethodSplit(tokens) {
		const baa = tokens.opSplitOnce(_ => (0, _Token.isAnyKeyword)(funKeywords, _));
		(0, _context.check)(baa !== null, tokens.loc, 'Expected a function keyword somewhere.');
		const before = baa.before;
		const at = baa.at;
		const after = baa.after;
		const kind = methodFunKind(at);
		return {
			before,
			kind,
			after
		};
	}

	function methodFunKind(funKindToken) {
		switch (funKindToken.kind) {
			case _Token.Keywords.Fun:
				return _Token.Keywords.FunThis;

			case _Token.Keywords.FunDo:
				return _Token.Keywords.FunThisDo;

			case _Token.Keywords.FunAsync:
				return _Token.Keywords.FunThisAsync;

			case _Token.Keywords.FunAsyncDo:
				return _Token.Keywords.FunThisAsyncDo;

			case _Token.Keywords.FunGen:
				return _Token.Keywords.FunThisGen;

			case _Token.Keywords.FunGenDo:
				return _Token.Keywords.FunThisGenDo;

			case _Token.Keywords.FunThis:
			case _Token.Keywords.FunThisDo:
			case _Token.Keywords.FunThisAsync:
			case _Token.Keywords.FunThisAsyncDo:
			case _Token.Keywords.FunThisGen:
			case _Token.Keywords.FunThisGenDo:
				(0, _context.fail)(funKindToken.loc, 'Function `.` is implicit for methods.');

			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }.`);
		}
	}

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZU1ldGhvZFNwbGl0LmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==