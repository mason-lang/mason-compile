(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.manglePath = mod.exports;
	}
})(this, function (exports, module) {
	/** Some Mason modules have names that don't work as URl paths. */
	'use strict';

	module.exports = manglePath;

	function manglePath(path) {
		return path.replace(/!/g, 'bang').replace(/@/g, 'at').replace(/\?/g, 'q').replace(/\$/g, 'cash');
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL21hbmdsZVBhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztrQkFDd0IsVUFBVTs7QUFBbkIsVUFBUyxVQUFVLENBQUMsSUFBSSxFQUFFO0FBQ3hDLFNBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQ2hDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQ25CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQ25CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7RUFDdkIiLCJmaWxlIjoibWFuZ2xlUGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBTb21lIE1hc29uIG1vZHVsZXMgaGF2ZSBuYW1lcyB0aGF0IGRvbid0IHdvcmsgYXMgVVJsIHBhdGhzLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFuZ2xlUGF0aChwYXRoKSB7XG5cdHJldHVybiBwYXRoLnJlcGxhY2UoLyEvZywgJ2JhbmcnKVxuXHQucmVwbGFjZSgvQC9nLCAnYXQnKVxuXHQucmVwbGFjZSgvXFw/L2csICdxJylcblx0LnJlcGxhY2UoL1xcJC9nLCAnY2FzaCcpXG59XG4iXX0=