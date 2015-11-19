'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals', './SK'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./SK'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals, global.SK);
		global.verifyLines = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _context2, _locals, _SK) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verifyLines;

	var _SK2 = _interopRequireDefault(_SK);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function verifyLines(lines) {
		const newLocals = [];

		for (const line of (0, _util.reverseIter)(lines)) for (const _ of (0, _util.reverseIter)(lineNewLocals(line))) {
			(0, _locals.registerLocal)(_);
			newLocals.push(_);
		}

		_context2.pendingBlockLocals.push(...newLocals);

		const thisBlockLocalNames = new Set();
		const shadowed = [];

		for (const line of lines) {
			for (const newLocal of lineNewLocals(line)) {
				const name = newLocal.name;

				const oldLocal = _context2.locals.get(name);

				if (oldLocal !== undefined) {
					(0, _context.check)(!thisBlockLocalNames.has(name), newLocal.loc, () => `A local ${ (0, _CompileError.code)(name) } is already in this block.`);
					shadowed.push(oldLocal);
				}

				thisBlockLocalNames.add(name);
				(0, _locals.setLocal)(newLocal);

				const popped = _context2.pendingBlockLocals.pop();

				(0, _util.assert)(popped === newLocal);
			}

			line.verify(_SK2.default.Do);
		}

		newLocals.forEach(_locals.deleteLocal);
		shadowed.forEach(_locals.setLocal);
		return newLocals;
	}

	function lineNewLocals(line) {
		return line instanceof _MsAst.AssignSingle ? [line.assignee] : line instanceof _MsAst.AssignDestructure ? line.assignees : line instanceof _MsAst.ObjEntry ? lineNewLocals(line.assign) : [];
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ2ZXJpZnlMaW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=