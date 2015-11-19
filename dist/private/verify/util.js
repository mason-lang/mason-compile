'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', './context', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('./context'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.context, global.SK);
		global.util = mod.exports;
	}
})(this, function (exports, _context, _context2, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.makeUseOptional = makeUseOptional;
	exports.makeUseOptionalIfFocus = makeUseOptionalIfFocus;
	exports.verifyEach = verifyEach;
	exports.verifyOp = verifyOp;
	exports.verifyName = verifyName;
	exports.setName = setName;
	exports.verifyNotLazy = verifyNotLazy;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function makeUseOptional(localDeclare) {
		_context2.okToNotUse.add(localDeclare);
	}

	function makeUseOptionalIfFocus(localDeclare) {
		if (localDeclare.name === '_') makeUseOptional(localDeclare);
	}

	function verifyEach(asts, sk) {
		for (const _ of asts) _.verify(sk);
	}

	function verifyOp(opAst, arg) {
		if (opAst !== null) opAst.verify(arg);
	}

	function verifyName(_) {
		if (typeof _ !== 'string') _.verify(_SK2.default.Val);
	}

	function setName(expr) {
		_context2.results.names.set(expr, _context2.name);
	}

	function verifyNotLazy(localDeclare, message) {
		(0, _context.check)(!localDeclare.isLazy(), localDeclare.loc, message);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==