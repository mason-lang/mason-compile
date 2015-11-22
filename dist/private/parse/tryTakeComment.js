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
		const comments = [];
		let rest = lines;

		while (!rest.isEmpty()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3RyeVRha2VDb21tZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFPd0IsY0FBYzs7VUFBZCxjQUFjIiwiZmlsZSI6InRyeVRha2VDb21tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEb2NDb21tZW50fSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7YXNzZXJ0LCBpc0VtcHR5fSBmcm9tICcuLi91dGlsJ1xuXG4vKipcblRha2VzIERvY0NvbW1lbnQgbGluZXMgYW5kIHB1dHMgdGhlbSBpbnRvIGEgY29tbWVudC5cbkByZXR1cm4gez9zdHJpbmd9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJ5VGFrZUNvbW1lbnQobGluZXMpIHtcblx0Y29uc3QgY29tbWVudHMgPSBbXVxuXHRsZXQgcmVzdCA9IGxpbmVzXG5cblx0d2hpbGUgKCFyZXN0LmlzRW1wdHkoKSkge1xuXHRcdGNvbnN0IGhzID0gcmVzdC5oZWFkU2xpY2UoKVxuXHRcdGNvbnN0IGggPSBocy5oZWFkKClcblx0XHRpZiAoIShoIGluc3RhbmNlb2YgRG9jQ29tbWVudCkpXG5cdFx0XHRicmVha1xuXG5cdFx0YXNzZXJ0KGhzLnNpemUoKSA9PT0gMSlcblx0XHRjb21tZW50cy5wdXNoKGgpXG5cdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdH1cblxuXHRyZXR1cm4gW2lzRW1wdHkoY29tbWVudHMpID8gbnVsbCA6IGNvbW1lbnRzLm1hcChfID0+IF8udGV4dCkuam9pbignXFxuJyksIHJlc3RdXG59XG4iXX0=