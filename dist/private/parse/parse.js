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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJwYXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=