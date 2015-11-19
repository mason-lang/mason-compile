'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/Loc', '../CompileError', './CompileOptions'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/Loc'), require('../CompileError'), require('./CompileOptions'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.Loc, global.CompileError, global.CompileOptions);
		global.context = mod.exports;
	}
})(this, function (exports, _Loc, _CompileError, _CompileOptions) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.warnings = exports.options = undefined;
	exports.setContext = setContext;
	exports.unsetContext = unsetContext;
	exports.check = check;
	exports.fail = fail;
	exports.warn = warn;

	var _CompileError2 = _interopRequireDefault(_CompileError);

	var _CompileOptions2 = _interopRequireDefault(_CompileOptions);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	let options = exports.options = undefined;
	let warnings = exports.warnings = undefined;

	function setContext(opts) {
		exports.options = options = new _CompileOptions2.default(opts);
		exports.warnings = warnings = [];
	}

	function unsetContext() {
		exports.options = options = null;
		exports.warnings = warnings = null;
	}

	function check(cond, loc, message) {
		if (!cond) {
			if (loc instanceof Function) loc = loc();
			if (message instanceof Function) message = message();
			fail(loc, message);
		}
	}

	function fail(loc, message) {
		throw new _CompileError2.default(warning(loc, message));
	}

	function warn(loc, message) {
		warnings.push(warning(loc, message));
	}

	const warning = (loc, message) => {
		if (loc instanceof _Loc.Pos) loc = (0, _Loc.singleCharLoc)(loc);
		return new _CompileError.Warning(loc, message);
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJjb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==