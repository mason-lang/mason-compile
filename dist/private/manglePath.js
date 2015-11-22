'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.manglePath = mod.exports;
	}
})(this, function (exports) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = manglePath;

	function manglePath(path) {
		return path.replace(/!/g, 'bang').replace(/@/g, 'at').replace(/\?/g, 'q').replace(/\$/g, 'cash');
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL21hbmdsZVBhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUN3QixVQUFVOztVQUFWLFVBQVUiLCJmaWxlIjoibWFuZ2xlUGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBTb21lIE1hc29uIG1vZHVsZXMgaGF2ZSBuYW1lcyB0aGF0IGRvbid0IHdvcmsgYXMgVVJsIHBhdGhzLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFuZ2xlUGF0aChwYXRoKSB7XG5cdHJldHVybiBwYXRoLnJlcGxhY2UoLyEvZywgJ2JhbmcnKVxuXHQucmVwbGFjZSgvQC9nLCAnYXQnKVxuXHQucmVwbGFjZSgvXFw/L2csICdxJylcblx0LnJlcGxhY2UoL1xcJC9nLCAnY2FzaCcpXG59XG4iXX0=