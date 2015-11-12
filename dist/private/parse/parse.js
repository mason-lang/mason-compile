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

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function parse(rootToken) {
		return (0, _parseModule2.default)(_Slice2.default.group(rootToken));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLEtBQUs7Ozs7Ozs7Ozs7OztVQUFMLEtBQUsiLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vbG9hZFBhcnNlKidcbmltcG9ydCBwYXJzZU1vZHVsZSBmcm9tICcuL3BhcnNlTW9kdWxlJ1xuaW1wb3J0IFNsaWNlIGZyb20gJy4vU2xpY2UnXG5cbi8qKlxuVGhpcyBjb252ZXJ0cyBhIFRva2VuIHRyZWUgdG8gYSBNc0FzdC5cblRoaXMgaXMgYSByZWN1cnNpdmUtZGVzY2VudCBwYXJzZXIsIG1hZGUgZWFzaWVyIGJ5IHR3byBmYWN0czpcblx0KiBXZSBoYXZlIGFscmVhZHkgZ3JvdXBlZCB0b2tlbnMuXG5cdCogTW9zdCBvZiB0aGUgdGltZSwgYW4gYXN0J3MgdHlwZSBpcyBkZXRlcm1pbmVkIGJ5IHRoZSBmaXJzdCB0b2tlbi5cblxuVGhlcmUgYXJlIGV4Y2VwdGlvbnMgc3VjaCBhcyBhc3NpZ25tZW50IHN0YXRlbWVudHMgKGluZGljYXRlZCBieSBhIGA9YCBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZSkuXG5Gb3IgdGhvc2Ugd2UgbXVzdCBpdGVyYXRlIHRocm91Z2ggdG9rZW5zIGFuZCBzcGxpdC5cbihTZWUge0BsaW5rIFNsaWNlI29wU3BsaXRPbmNlfSBhbmQge0BsaW5rIFNsaWNlI29wU3BsaXRNYW55fS4pXG5cbkBwYXJhbSB7R3JvdXA8R3JvdXBzLkJsb2NrPn0gcm9vdFRva2VuXG5AcmV0dXJuIHtNb2R1bGV9XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2Uocm9vdFRva2VuKSB7XG5cdHJldHVybiBwYXJzZU1vZHVsZShTbGljZS5ncm91cChyb290VG9rZW4pKVxufVxuIl19