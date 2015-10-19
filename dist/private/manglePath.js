if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module'], function (exports, module) {
	/** Some Mason modules have names that don't work as URl paths. */
	'use strict';

	module.exports = manglePath;

	function manglePath(path) {
		return path.replace(/!/g, 'bang').replace(/@/g, 'at').replace(/\?/g, 'q').replace(/\$/g, 'cash');
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hbmdsZVBhdGguanMiLCJwcml2YXRlL21hbmdsZVBhdGguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7a0JDQ3dCLFVBQVU7O0FBQW5CLFVBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUN4QyxTQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUNoQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUNuQixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUNuQixPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0VBQ3ZCIiwiZmlsZSI6InByaXZhdGUvbWFuZ2xlUGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbbnVsbCwiLyoqIFNvbWUgTWFzb24gbW9kdWxlcyBoYXZlIG5hbWVzIHRoYXQgZG9uJ3Qgd29yayBhcyBVUmwgcGF0aHMuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYW5nbGVQYXRoKHBhdGgpIHtcblx0cmV0dXJuIHBhdGgucmVwbGFjZSgvIS9nLCAnYmFuZycpXG5cdC5yZXBsYWNlKC9AL2csICdhdCcpXG5cdC5yZXBsYWNlKC9cXD8vZywgJ3EnKVxuXHQucmVwbGFjZSgvXFwkL2csICdjYXNoJylcbn1cbiJdLCJzb3VyY2VSb290IjoiL3NyYyJ9
