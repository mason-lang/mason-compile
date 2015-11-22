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
			const declareError = new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator((0, _util2.t0)(this.caught), IdError)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVFeGNlcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLZSxZQUFXO0FBQ3pCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxHQUNqQyxzQkFDQyxlQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDWixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQzNELGlCQUFNLElBQUksQ0FBQyxTQUFTLFlBQUssQ0FBQyxHQUMzQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixTQUFPLFdBVG9CLGNBQWMsRUFTbkIsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQ2xDOztTQU9lLGNBQWMsR0FBZCxjQUFjOztVQUFkLGNBQWMiLCJmaWxlIjoidHJhbnNwaWxlRXhjZXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmxvY2tTdGF0ZW1lbnQsIENhdGNoQ2xhdXNlLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCxcblx0VGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7YWxsU2FtZSwgY2F0LCBpZkVsc2UsIGlzRW1wdHksIG9wTWFwLCByZXZlcnNlSXRlcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBibG9ja1dyYXBJZlZhbCwgbXNDYWxsLCB0MCwgdDEsIHRMaW5lc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblx0Y29uc3QgYmxvY2sgPSB0aGlzLm9wRWxzZSA9PT0gbnVsbCA/XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKHRoaXMudHJ5KSxcblx0XHRcdHRyYW5zcGlsZUNhdGNoZXModGhpcy50eXBlZENhdGNoZXMsIHRoaXMub3BDYXRjaEFsbCwgZmFsc2UpLFxuXHRcdFx0b3BNYXAodGhpcy5vcEZpbmFsbHksIHQwKSkgOlxuXHRcdHRyYW5zcGlsZVdpdGhFbHNlKHRoaXMpXG5cdHJldHVybiBibG9ja1dyYXBJZlZhbCh0aGlzLCBibG9jaylcbn1cblxuLyoqXG5AcGFyYW0ge2Jvb2xlYW59IG5lZWRzRXJyb3JEZWNsYXJlOlxuXHRJZiB0aGVyZSBhcmUgbXVsdGlwbGUgY2F0Y2hlcyB3aXRoIGRpZmZlcmVudCBlcnJvciBuYW1lcywgZWFjaCBvbmUgbXVzdCBkZWNsYXJlIGl0cyBvd24uXG5cdFRoZSBjb21tb24gZXJyb3IgKHVzZWQgYnkgdGhlIGNvbXBpbGVkIGBjYXRjaGAgYmxvY2spIGlzIElkRXJyb3IuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcGlsZUNhdGNoKG5lZWRzRXJyb3JEZWNsYXJlKSB7XG5cdGlmIChuZWVkc0Vycm9yRGVjbGFyZSkge1xuXHRcdGNvbnN0IGRlY2xhcmVFcnJvciA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBbXG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKHQwKHRoaXMuY2F1Z2h0KSwgSWRFcnJvcildKVxuXHRcdHJldHVybiB0MSh0aGlzLmJsb2NrLCBkZWNsYXJlRXJyb3IpXG5cdH0gZWxzZVxuXHRcdHJldHVybiB0MCh0aGlzLmJsb2NrKVxufVxuXG4vKipcbmxldCBleGNlcHRFbHNlXyA9IGZhbHNlXG50cnkge1xuXHR7e3RyeX19XG5cdGV4Y2VwdEVsc2VfID0gdHJ1ZVxuXHR7e29wRWxzZX19XG59IGNhdGNoIChfKSB7XG5cdGlmIChleGNlcHRFbHNlXylcblx0XHR0aHJvdyBfXG5cdHt7YWxsQ2F0Y2hlc319XG59XG4qL1xuZnVuY3Rpb24gdHJhbnNwaWxlV2l0aEVsc2UoXykge1xuXHRjb25zdCBfdHJ5ID0gdDEoXy5vcEVsc2UsIGNhdCh0TGluZXMoXy50cnkubGluZXMpLCBTZXRFeGNlcHRFbHNlKSlcblx0Y29uc3QgX2NhdGNoID0gdHJhbnNwaWxlQ2F0Y2hlcyhfLnR5cGVkQ2F0Y2hlcywgXy5vcENhdGNoQWxsLCB0cnVlKVxuXHRyZXR1cm4gW0xldEV4Y2VwdEVsc2UsIG5ldyBUcnlTdGF0ZW1lbnQoX3RyeSwgX2NhdGNoLCBvcE1hcChfLm9wRmluYWxseSwgdDApKV1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQ2F0Y2hlcyh0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwsIGhhc0Vsc2UpIHtcblx0Y29uc3QgYWxsQ2F0Y2hlcyA9IGNhdCh0eXBlZENhdGNoZXMsIG9wQ2F0Y2hBbGwpXG5cdC8vIElmIHRoZXkgYWxsIGhhdmUgdGhlIHNhbWUgbmFtZSwgd2UgZG9uJ3QgbmVlZCBpbmRpdmlkdWFsIGRlY2xhcmUgZm9yIHRoZWlyIGVycm9ycy5cblx0Y29uc3QgbmVlZHNFcnJvckRlY2xhcmUgPSAhYWxsU2FtZShhbGxDYXRjaGVzLCBfID0+IF8uY2F1Z2h0Lm5hbWUpXG5cdGNvbnN0IGlkRXJyb3IgPSBuZWVkc0Vycm9yRGVjbGFyZSA/IElkRXJyb3IgOiBhY2Nlc3NMb2NhbERlY2xhcmUoYWxsQ2F0Y2hlc1swXS5jYXVnaHQpXG5cdGNvbnN0IHRocm93SWZPbkVsc2UgPSAoKSA9PlxuXHRcdG5ldyBJZlN0YXRlbWVudChJZEV4Y2VwdEVsc2UsIG5ldyBUaHJvd1N0YXRlbWVudChpZEVycm9yKSlcblxuXHRjb25zdCBjYXRjaEFsbCA9IGlmRWxzZShvcENhdGNoQWxsLFxuXHRcdF8gPT4gdDEoXywgbmVlZHNFcnJvckRlY2xhcmUpLFxuXHRcdCgpID0+IG5ldyBUaHJvd1N0YXRlbWVudChpZEVycm9yKSlcblxuXHRpZiAoaXNFbXB0eSh0eXBlZENhdGNoZXMpKSB7XG5cdFx0aWYgKGhhc0Vsc2UpXG5cdFx0XHRjYXRjaEFsbC5ib2R5LnVuc2hpZnQodGhyb3dJZk9uRWxzZSgpKVxuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UoaWRFcnJvciwgY2F0Y2hBbGwpXG5cdH0gZWxzZSB7XG5cdFx0bGV0IGNhdGNoZXMgPSBjYXRjaEFsbFxuXHRcdGZvciAoY29uc3QgdHlwZWRDYXRjaCBvZiByZXZlcnNlSXRlcih0eXBlZENhdGNoZXMpKSB7XG5cdFx0XHRjb25zdCBjb25kID0gbXNDYWxsKCdjb250YWlucycsIHQwKHR5cGVkQ2F0Y2guY2F1Z2h0Lm9wVHlwZSksIGlkRXJyb3IpXG5cdFx0XHRjb25zdCB0aGVuID0gdDEodHlwZWRDYXRjaCwgbmVlZHNFcnJvckRlY2xhcmUpXG5cdFx0XHRjYXRjaGVzID0gbmV3IElmU3RhdGVtZW50KGNvbmQsIHRoZW4sIGNhdGNoZXMpXG5cdFx0fVxuXHRcdHJldHVybiBuZXcgQ2F0Y2hDbGF1c2UoaWRFcnJvcixcblx0XHRcdG5ldyBCbG9ja1N0YXRlbWVudChoYXNFbHNlID8gW3Rocm93SWZPbkVsc2UoKSwgY2F0Y2hlc10gOiBbY2F0Y2hlc10pKVxuXHR9XG59XG5cbmNvbnN0XG5cdElkRXJyb3IgPSBuZXcgSWRlbnRpZmllcignZXJyb3JfJyksXG5cdElkRXhjZXB0RWxzZSA9IG5ldyBJZGVudGlmaWVyKCdleGNlcHRFbHNlXycpLFxuXHRMZXRFeGNlcHRFbHNlID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtcblx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKElkRXhjZXB0RWxzZSwgbmV3IExpdGVyYWwoZmFsc2UpKV0pLFxuXHRTZXRFeGNlcHRFbHNlID0gbmV3IEFzc2lnbm1lbnRFeHByZXNzaW9uKCc9JywgSWRFeGNlcHRFbHNlLCBuZXcgTGl0ZXJhbCh0cnVlKSlcbiJdfQ==