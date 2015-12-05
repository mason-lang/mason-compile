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
		(0, _context.check)(baa !== null, tokens.loc, 'expectedMethodSplit');
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
				(0, _context.fail)(funKindToken.loc, 'implicitFunctionDot');
				break;

			default:
				(0, _context.fail)(funKindToken.loc, 'expectedFuncKind', funKindToken);
		}
	}

	const funKeywords = new Set([_Token.Keywords.Fun, _Token.Keywords.FunDo, _Token.Keywords.FunThis, _Token.Keywords.FunThisDo, _Token.Keywords.FunAsync, _Token.Keywords.FunAsyncDo, _Token.Keywords.FunThisAsync, _Token.Keywords.FunThisAsyncDo, _Token.Keywords.FunGen, _Token.Keywords.FunGenDo, _Token.Keywords.FunThisGen, _Token.Keywords.FunThisGenDo]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kU3BsaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUl3QixnQkFBZ0I7O1VBQWhCLGdCQUFnQiIsImZpbGUiOiJwYXJzZU1ldGhvZFNwbGl0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgZmFpbH0gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7aXNBbnlLZXl3b3JkLCBLZXl3b3Jkc30gZnJvbSAnLi4vVG9rZW4nXG5cbi8qKiBTcGxpdCBvbiBhIGZ1bmN0aW9uIGtleXdvcmQuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1ldGhvZFNwbGl0KHRva2Vucykge1xuXHRjb25zdCBiYWEgPSB0b2tlbnMub3BTcGxpdE9uY2UoXyA9PiBpc0FueUtleXdvcmQoZnVuS2V5d29yZHMsIF8pKVxuXHRjaGVjayhiYWEgIT09IG51bGwsIHRva2Vucy5sb2MsICdleHBlY3RlZE1ldGhvZFNwbGl0Jylcblx0Y29uc3Qge2JlZm9yZSwgYXQsIGFmdGVyfSA9IGJhYVxuXHRjb25zdCBraW5kID0gbWV0aG9kRnVuS2luZChhdClcblx0cmV0dXJuIHtiZWZvcmUsIGtpbmQsIGFmdGVyfVxufVxuXG5mdW5jdGlvbiBtZXRob2RGdW5LaW5kKGZ1bktpbmRUb2tlbikge1xuXHRzd2l0Y2ggKGZ1bktpbmRUb2tlbi5raW5kKSB7XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW46XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0RvXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Bc3luYzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNcblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jRG86XG5cdFx0XHRyZXR1cm4gS2V5d29yZHMuRnVuVGhpc0FzeW5jRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5HZW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzR2VuRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1blRoaXM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNBc3luY0RvOlxuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpc0dlbjogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuRG86XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsICdpbXBsaWNpdEZ1bmN0aW9uRG90Jylcblx0XHRcdGJyZWFrXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgJ2V4cGVjdGVkRnVuY0tpbmQnLCBmdW5LaW5kVG9rZW4pXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLFxuXHRLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbywgS2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5EbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuIl19