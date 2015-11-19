'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../MsAst'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../MsAst'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.MsAst);
		global.context = mod.exports;
	}
})(this, function (exports, _MsAst) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.nextDestructuredId = exports.funKind = exports.verifyResults = undefined;
	exports.setup = setup;
	exports.tearDown = tearDown;
	exports.getDestructuredId = getDestructuredId;
	exports.withFunKind = withFunKind;
	let verifyResults = exports.verifyResults = undefined;
	let funKind = exports.funKind = undefined;
	let nextDestructuredId = exports.nextDestructuredId = undefined;

	function setup(_verifyResults) {
		exports.verifyResults = verifyResults = _verifyResults;
		exports.funKind = funKind = _MsAst.Funs.Plain;
		exports.nextDestructuredId = nextDestructuredId = 0;
	}

	function tearDown() {
		exports.verifyResults = verifyResults = null;
	}

	function getDestructuredId() {
		const _ = nextDestructuredId;
		exports.nextDestructuredId = nextDestructuredId = nextDestructuredId + 1;
		return _;
	}

	function withFunKind(newFunKind, func) {
		const oldFunKind = funKind;
		exports.funKind = funKind = newFunKind;

		const _ = func();

		exports.funKind = funKind = oldFunKind;
		return _;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==