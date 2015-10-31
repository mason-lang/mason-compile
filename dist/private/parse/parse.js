'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './parseModule', './Slice', './loadParse*'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./parseModule'), require('./Slice'), require('./loadParse*'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.parseModule, global.Slice, global.loadParse);
		global.parse = mod.exports;
	}
})(this, function (exports, _parseModule, _Slice) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parse;

	var _parseModule2 = _interopRequireDefault(_parseModule);

	var _Slice2 = _interopRequireDefault(_Slice);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parse(rootToken) {
		return (0, _parseModule2.default)(_Slice2.default.group(rootToken));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLEtBQUs7Ozs7Ozs7O1VBQUwsS0FBSyIsImZpbGUiOiJwYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9sb2FkUGFyc2UqJ1xuaW1wb3J0IHBhcnNlTW9kdWxlIGZyb20gJy4vcGFyc2VNb2R1bGUnXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5UaGlzIGNvbnZlcnRzIGEgVG9rZW4gdHJlZSB0byBhIE1zQXN0LlxuVGhpcyBpcyBhIHJlY3Vyc2l2ZS1kZXNjZW50IHBhcnNlciwgbWFkZSBlYXNpZXIgYnkgdHdvIGZhY3RzOlxuXHQqIFdlIGhhdmUgYWxyZWFkeSBncm91cGVkIHRva2Vucy5cblx0KiBNb3N0IG9mIHRoZSB0aW1lLCBhbiBhc3QncyB0eXBlIGlzIGRldGVybWluZWQgYnkgdGhlIGZpcnN0IHRva2VuLlxuXG5UaGVyZSBhcmUgZXhjZXB0aW9ucyBzdWNoIGFzIGFzc2lnbm1lbnQgc3RhdGVtZW50cyAoaW5kaWNhdGVkIGJ5IGEgYD1gIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlKS5cbkZvciB0aG9zZSB3ZSBtdXN0IGl0ZXJhdGUgdGhyb3VnaCB0b2tlbnMgYW5kIHNwbGl0LlxuKFNlZSB7QGxpbmsgU2xpY2Ujb3BTcGxpdE9uY2V9IGFuZCB7QGxpbmsgU2xpY2Ujb3BTcGxpdE1hbnl9LilcblxuQHBhcmFtIHtHcm91cDxHcm91cHMuQmxvY2s+fSByb290VG9rZW5cbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZShyb290VG9rZW4pIHtcblx0cmV0dXJuIHBhcnNlTW9kdWxlKFNsaWNlLmdyb3VwKHJvb3RUb2tlbikpXG59XG4iXX0=