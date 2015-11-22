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
				break;

			default:
				(0, _context.fail)(funKindToken.loc, `Expected function kind, got ${ funKindToken }.`);
		}
	}

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kU3BsaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUl3QixnQkFBZ0I7O1VBQWhCLGdCQUFnQiIsImZpbGUiOiJwYXJzZU1ldGhvZFNwbGl0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5cbi8qKiBTcGxpdCBvbiBhIGZ1bmN0aW9uIGtleXdvcmQuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1ldGhvZFNwbGl0KHRva2Vucykge1xuXHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZnVuS2V5d29yZHMsIF8pKVxuXHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdFeHBlY3RlZCBhIGZ1bmN0aW9uIGtleXdvcmQgc29tZXdoZXJlLicpXG5cdGNvbnN0IHtiZWZvcmUsIGF0LCBhZnRlcn0gPSBiYWFcblx0Y29uc3Qga2luZCA9IG1ldGhvZEZ1bktpbmQoYXQpXG5cdHJldHVybiB7YmVmb3JlLCBraW5kLCBhZnRlcn1cbn1cblxuZnVuY3Rpb24gbWV0aG9kRnVuS2luZChmdW5LaW5kVG9rZW4pIHtcblx0c3dpdGNoIChmdW5LaW5kVG9rZW4ua2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNEb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmM6XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0FzeW5jXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luY0RvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlblxuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luYzogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbzpcblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW46IGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbkRvOlxuXHRcdFx0ZmFpbChmdW5LaW5kVG9rZW4ubG9jLCAnRnVuY3Rpb24gYC5gIGlzIGltcGxpY2l0IGZvciBtZXRob2RzLicpXG5cdFx0XHRicmVha1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59LmApXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLFxuXHRLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbywgS2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5EbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuIl19