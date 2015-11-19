'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context);
		global.VerifyResults = mod.exports;
	}
})(this, function (exports, _context) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Modules = exports.Blocks = undefined;

	class VerifyResults {
		constructor() {
			this.localAccessToDeclare = new Map();
			this.localDeclareToAccesses = new Map();
			this.names = new Map();
			this.builtinPathToNames = new Map();
			this.superCallToMethod = new Map();
			this.constructorToSuper = new Map();
			this.blockToKind = new Map();
			this.statements = new Set();
			this.objEntryExports = new Set();
			this.moduleKind = null;
		}

		localDeclareForAccess(localAccess) {
			return this.localAccessToDeclare.get(localAccess);
		}

		name(expr) {
			const name = this.names.get(expr);
			(0, _context.check)(name !== undefined, expr.loc, 'Expression must be placed in a position where name can be determined.');
			return name;
		}

		opName(expr) {
			const x = this.names.get(expr);
			return x === undefined ? null : x;
		}

		isStatement(expr) {
			return this.statements.has(expr);
		}

		blockKind(block) {
			return this.blockToKind.get(block);
		}

		isObjEntryExport(objEntry) {
			return this.objEntryExports.has(objEntry);
		}

		constructorHasSuper(ctr) {
			return this.constructorToSuper.has(ctr);
		}

	}

	exports.default = VerifyResults;
	const Blocks = exports.Blocks = {
		Do: 0,
		Throw: 1,
		Return: 2,
		Bag: 3,
		Map: 4,
		Obj: 5
	};
	const Modules = exports.Modules = {
		Do: 0,
		Val: 1,
		Exports: 2,
		Bag: 3,
		Map: 4
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJWZXJpZnlSZXN1bHRzLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==