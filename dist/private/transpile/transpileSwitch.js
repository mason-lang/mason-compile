'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.context, global.util);
		global.transpileSwitch = mod.exports;
	}
})(this, function (exports, _ast, _util, _context, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const parts = (0, _util.flatMap)(this.parts, _util2.t0);
		parts.push((0, _util.ifElse)(this.opElse, _ => new _ast.SwitchCase(undefined, (0, _util2.t0)(_).body), () => SwitchCaseNoMatch));
		return (0, _util2.blockWrapIfVal)(this, new _ast.SwitchStatement((0, _util2.t0)(this.switched), parts));
	};

	exports.transpileSwitchPart = transpileSwitchPart;

	function transpileSwitchPart() {
		const follow = (0, _util.opIf)(_context.verifyResults.isStatement(this), () => new _ast.BreakStatement());
		const block = (0, _util2.t3)(this.result, null, null, follow);
		const cases = [];

		for (let i = 0; i < this.values.length - 1; i = i + 1) cases.push(new _ast.SwitchCase((0, _util2.t0)(this.values[i]), []));

		cases.push(new _ast.SwitchCase((0, _util2.t0)(this.values[this.values.length - 1]), [block]));
		return cases;
	}

	const SwitchCaseNoMatch = new _ast.SwitchCase(undefined, [(0, _util2.throwErrorFromString)('No branch of `switch` matches.')]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVTd2l0Y2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLZSxZQUFXO0FBQ3pCLFFBQU0sS0FBSyxHQUFHLFVBTFAsT0FBTyxFQUtRLElBQUksQ0FBQyxLQUFLLFlBQUssQ0FBQTtBQUNyQyxPQUFLLENBQUMsSUFBSSxDQUFDLFVBTkssTUFBTSxFQU1KLElBQUksQ0FBQyxNQUFNLEVBQzVCLENBQUMsSUFBSSxvQkFBZSxTQUFTLEVBQUUsZUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDMUMsTUFBTSxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7QUFDMUIsU0FBTyxXQVBBLGNBQWMsRUFPQyxJQUFJLEVBQUUsU0FWTyxlQUFlLENBVUYsZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtFQUMxRTs7U0FFZSxtQkFBbUIsR0FBbkIsbUJBQW1COztVQUFuQixtQkFBbUIiLCJmaWxlIjoidHJhbnNwaWxlU3dpdGNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCcmVha1N0YXRlbWVudCwgU3dpdGNoQ2FzZSwgU3dpdGNoU3RhdGVtZW50fSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7ZmxhdE1hcCwgaWZFbHNlLCBvcElmfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2Jsb2NrV3JhcElmVmFsLCB0MCwgdDMsIHRocm93RXJyb3JGcm9tU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXHRjb25zdCBwYXJ0cyA9IGZsYXRNYXAodGhpcy5wYXJ0cywgdDApXG5cdHBhcnRzLnB1c2goaWZFbHNlKHRoaXMub3BFbHNlLFxuXHRcdF8gPT4gbmV3IFN3aXRjaENhc2UodW5kZWZpbmVkLCB0MChfKS5ib2R5KSxcblx0XHQoKSA9PiBTd2l0Y2hDYXNlTm9NYXRjaCkpXG5cdHJldHVybiBibG9ja1dyYXBJZlZhbCh0aGlzLCBuZXcgU3dpdGNoU3RhdGVtZW50KHQwKHRoaXMuc3dpdGNoZWQpLCBwYXJ0cykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVTd2l0Y2hQYXJ0KCkge1xuXHRjb25zdCBmb2xsb3cgPSBvcElmKHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQodGhpcyksICgpID0+IG5ldyBCcmVha1N0YXRlbWVudClcblx0Lypcblx0V2UgY291bGQganVzdCBwYXNzIGJsb2NrLmJvZHkgZm9yIHRoZSBzd2l0Y2ggbGluZXMsIGJ1dCBpbnN0ZWFkXG5cdGVuY2xvc2UgdGhlIGJvZHkgb2YgdGhlIHN3aXRjaCBjYXNlIGluIGN1cmx5IGJyYWNlcyB0byBlbnN1cmUgYSBuZXcgc2NvcGUuXG5cdFRoYXQgd2F5IHRoaXMgY29kZSB3b3Jrczpcblx0XHRzd2l0Y2ggKDApIHtcblx0XHRcdGNhc2UgMDoge1xuXHRcdFx0XHRjb25zdCBhID0gMFxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fVxuXHRcdFx0ZGVmYXVsdDoge1xuXHRcdFx0XHQvLyBXaXRob3V0IGN1cmx5IGJyYWNlcyB0aGlzIHdvdWxkIGNvbmZsaWN0IHdpdGggdGhlIG90aGVyIGBhYC5cblx0XHRcdFx0Y29uc3QgYSA9IDFcblx0XHRcdFx0YVxuXHRcdFx0fVxuXHRcdH1cblx0Ki9cblx0Y29uc3QgYmxvY2sgPSB0Myh0aGlzLnJlc3VsdCwgbnVsbCwgbnVsbCwgZm9sbG93KVxuXHQvLyBJZiBzd2l0Y2ggaGFzIG11bHRpcGxlIHZhbHVlcywgYnVpbGQgdXAgYSBzdGF0ZW1lbnQgbGlrZTogYGNhc2UgMTogY2FzZSAyOiB7IGRvQmxvY2soKSB9YFxuXHRjb25zdCBjYXNlcyA9IFtdXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKVxuXHRcdC8vIFRoZXNlIGNhc2VzIGZhbGx0aHJvdWdoIHRvIHRoZSBvbmUgYXQgdGhlIGVuZC5cblx0XHRjYXNlcy5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW2ldKSwgW10pKVxuXHRjYXNlcy5wdXNoKG5ldyBTd2l0Y2hDYXNlKHQwKHRoaXMudmFsdWVzW3RoaXMudmFsdWVzLmxlbmd0aCAtIDFdKSwgW2Jsb2NrXSkpXG5cdHJldHVybiBjYXNlc1xufVxuXG5jb25zdCBTd2l0Y2hDYXNlTm9NYXRjaCA9IG5ldyBTd2l0Y2hDYXNlKHVuZGVmaW5lZCwgW1xuXHR0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBzd2l0Y2hgIG1hdGNoZXMuJyldKVxuIl19