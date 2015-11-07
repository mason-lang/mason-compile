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
		global.parseMethodHelpers = mod.exports;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTWV0aG9kSGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBSXdCLGdCQUFnQjs7VUFBaEIsZ0JBQWdCIiwiZmlsZSI6InBhcnNlTWV0aG9kSGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y2hlY2ssIGZhaWx9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge2lzQW55S2V5d29yZCwgS2V5d29yZHN9IGZyb20gJy4uL1Rva2VuJ1xuXG4vKiogU3BsaXQgb24gYSBmdW5jdGlvbiBrZXl3b3JkLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VNZXRob2RTcGxpdCh0b2tlbnMpIHtcblx0Y29uc3QgYmFhID0gdG9rZW5zLm9wU3BsaXRPbmNlKF8gPT4gaXNBbnlLZXl3b3JkKGZ1bktleXdvcmRzLCBfKSlcblx0Y2hlY2soYmFhICE9PSBudWxsLCB0b2tlbnMubG9jLCAnRXhwZWN0ZWQgYSBmdW5jdGlvbiBrZXl3b3JkIHNvbWV3aGVyZS4nKVxuXHRjb25zdCB7YmVmb3JlLCBhdCwgYWZ0ZXJ9ID0gYmFhXG5cdGNvbnN0IGtpbmQgPSBtZXRob2RGdW5LaW5kKGF0KVxuXHRyZXR1cm4ge2JlZm9yZSwga2luZCwgYWZ0ZXJ9XG59XG5cbmZ1bmN0aW9uIG1ldGhvZEZ1bktpbmQoZnVuS2luZFRva2VuKSB7XG5cdHN3aXRjaCAoZnVuS2luZFRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkZ1bjpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzXG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5Ebzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzRG9cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkFzeW5jOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNBc3luY1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuQXN5bmNEbzpcblx0XHRcdHJldHVybiBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuR2VuOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5cblx0XHRjYXNlIEtleXdvcmRzLkZ1bkdlbkRvOlxuXHRcdFx0cmV0dXJuIEtleXdvcmRzLkZ1blRoaXNHZW5Eb1xuXHRcdGNhc2UgS2V5d29yZHMuRnVuVGhpczogY2FzZSBLZXl3b3Jkcy5GdW5UaGlzRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzQXN5bmM6IGNhc2UgS2V5d29yZHMuRnVuVGhpc0FzeW5jRG86XG5cdFx0Y2FzZSBLZXl3b3Jkcy5GdW5UaGlzR2VuOiBjYXNlIEtleXdvcmRzLkZ1blRoaXNHZW5Ebzpcblx0XHRcdGZhaWwoZnVuS2luZFRva2VuLmxvYywgJ0Z1bmN0aW9uIGAuYCBpcyBpbXBsaWNpdCBmb3IgbWV0aG9kcy4nKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRmYWlsKGZ1bktpbmRUb2tlbi5sb2MsIGBFeHBlY3RlZCBmdW5jdGlvbiBraW5kLCBnb3QgJHtmdW5LaW5kVG9rZW59LmApXG5cdH1cbn1cblxuY29uc3QgZnVuS2V5d29yZHMgPSBuZXcgU2V0KFtcblx0S2V5d29yZHMuRnVuLCBLZXl3b3Jkcy5GdW5EbywgS2V5d29yZHMuRnVuVGhpcywgS2V5d29yZHMuRnVuVGhpc0RvLFxuXHRLZXl3b3Jkcy5GdW5Bc3luYywgS2V5d29yZHMuRnVuQXN5bmNEbywgS2V5d29yZHMuRnVuVGhpc0FzeW5jLCBLZXl3b3Jkcy5GdW5UaGlzQXN5bmNEbyxcblx0S2V5d29yZHMuRnVuR2VuLCBLZXl3b3Jkcy5GdW5HZW5EbywgS2V5d29yZHMuRnVuVGhpc0dlbiwgS2V5d29yZHMuRnVuVGhpc0dlbkRvXG5dKVxuIl19