'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.util);
		global.transpileExcept = mod.exports;
	}
})(this, function (exports, _ast, _util, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const block = this.opElse === null ? new _ast.TryStatement((0, _util2.t0)(this.try), transpileCatches(this.typedCatches, this.opCatchAll, false), (0, _util.opMap)(this.opFinally, _util2.t0)) : transpileWithElse(this);
		return (0, _util2.blockWrapIfVal)(this, block);
	};

	exports.transpileCatch = transpileCatch;

	function transpileCatch(needsErrorDeclare) {
		if (needsErrorDeclare) {
			const declareError = new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator((0, _util2.t0)(this.caught), IdError)]);
			return (0, _util2.t1)(this.block, declareError);
		} else return (0, _util2.t0)(this.block);
	}

	function transpileWithElse(_) {
		const _try = (0, _util2.t1)(_.opElse, (0, _util.cat)((0, _util2.tLines)(_.try.lines), SetExceptElse));

		const _catch = transpileCatches(_.typedCatches, _.opCatchAll, true);

		return [LetExceptElse, new _ast.TryStatement(_try, _catch, (0, _util.opMap)(_.opFinally, _util2.t0))];
	}

	function transpileCatches(typedCatches, opCatchAll, hasElse) {
		const allCatches = (0, _util.cat)(typedCatches, opCatchAll);
		const needsErrorDeclare = !(0, _util.allSame)(allCatches, _ => _.caught.name);
		const idError = needsErrorDeclare ? IdError : (0, _util2.accessLocalDeclare)(allCatches[0].caught);

		const throwIfOnElse = () => new _ast.IfStatement(IdExceptElse, new _ast.ThrowStatement(idError));

		const catchAll = (0, _util.ifElse)(opCatchAll, _ => (0, _util2.t1)(_, needsErrorDeclare), () => new _ast.ThrowStatement(idError));

		if ((0, _util.isEmpty)(typedCatches)) {
			if (hasElse) catchAll.body.unshift(throwIfOnElse());
			return new _ast.CatchClause(idError, catchAll);
		} else {
			let catches = catchAll;

			for (const typedCatch of (0, _util.reverseIter)(typedCatches)) {
				const cond = (0, _util2.msCall)('contains', (0, _util2.t0)(typedCatch.caught.opType), idError);
				const then = (0, _util2.t1)(typedCatch, needsErrorDeclare);
				catches = new _ast.IfStatement(cond, then, catches);
			}

			return new _ast.CatchClause(idError, new _ast.BlockStatement(hasElse ? [throwIfOnElse(), catches] : [catches]));
		}
	}

	const IdError = new _ast.Identifier('error_'),
	      IdExceptElse = new _ast.Identifier('exceptElse_'),
	      LetExceptElse = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(IdExceptElse, new _ast.Literal(false))]),
	      SetExceptElse = new _ast.AssignmentExpression('=', IdExceptElse, new _ast.Literal(true));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ0cmFuc3BpbGVFeGNlcHQuanMiLCJzb3VyY2VzQ29udGVudCI6W119