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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVFeGNlcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLZSxZQUFXO0FBQ3pCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxHQUNqQyxzQkFDQyxlQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDWixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQzNELGlCQUFNLElBQUksQ0FBQyxTQUFTLFlBQUssQ0FBQyxHQUMzQixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixTQUFPLFdBVG9CLGNBQWMsRUFTbkIsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0VBQ2xDOztTQU9lLGNBQWMsR0FBZCxjQUFjOztVQUFkLGNBQWMiLCJmaWxlIjoidHJhbnNwaWxlRXhjZXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBc3NpZ25tZW50RXhwcmVzc2lvbiwgQmxvY2tTdGF0ZW1lbnQsIENhdGNoQ2xhdXNlLCBJZGVudGlmaWVyLCBJZlN0YXRlbWVudCwgTGl0ZXJhbCxcblx0VGhyb3dTdGF0ZW1lbnQsIFRyeVN0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdGlvbiwgVmFyaWFibGVEZWNsYXJhdG9yfSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7YWxsU2FtZSwgY2F0LCBpZkVsc2UsIGlzRW1wdHksIG9wTWFwLCByZXZlcnNlSXRlcn0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7YWNjZXNzTG9jYWxEZWNsYXJlLCBibG9ja1dyYXBJZlZhbCwgbXNDYWxsLCB0MCwgdDEsIHRMaW5lc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblx0Y29uc3QgYmxvY2sgPSB0aGlzLm9wRWxzZSA9PT0gbnVsbCA/XG5cdFx0bmV3IFRyeVN0YXRlbWVudChcblx0XHRcdHQwKHRoaXMudHJ5KSxcblx0XHRcdHRyYW5zcGlsZUNhdGNoZXModGhpcy50eXBlZENhdGNoZXMsIHRoaXMub3BDYXRjaEFsbCwgZmFsc2UpLFxuXHRcdFx0b3BNYXAodGhpcy5vcEZpbmFsbHksIHQwKSkgOlxuXHRcdHRyYW5zcGlsZVdpdGhFbHNlKHRoaXMpXG5cdHJldHVybiBibG9ja1dyYXBJZlZhbCh0aGlzLCBibG9jaylcbn1cblxuLyoqXG5AcGFyYW0ge2Jvb2xlYW59IG5lZWRzRXJyb3JEZWNsYXJlXG5cdElmIHRoZXJlIGFyZSBtdWx0aXBsZSBjYXRjaGVzIHdpdGggZGlmZmVyZW50IGVycm9yIG5hbWVzLCBlYWNoIG9uZSBtdXN0IGRlY2xhcmUgaXRzIG93bi5cblx0VGhlIGNvbW1vbiBlcnJvciAodXNlZCBieSB0aGUgY29tcGlsZWQgYGNhdGNoYCBibG9jaykgaXMgSWRFcnJvci5cbiovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlQ2F0Y2gobmVlZHNFcnJvckRlY2xhcmUpIHtcblx0aWYgKG5lZWRzRXJyb3JEZWNsYXJlKSB7XG5cdFx0Y29uc3QgZGVjbGFyZUVycm9yID0gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtcblx0XHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IodDAodGhpcy5jYXVnaHQpLCBJZEVycm9yKV0pXG5cdFx0cmV0dXJuIHQxKHRoaXMuYmxvY2ssIGRlY2xhcmVFcnJvcilcblx0fSBlbHNlXG5cdFx0cmV0dXJuIHQwKHRoaXMuYmxvY2spXG59XG5cbi8qKlxubGV0IGV4Y2VwdEVsc2VfID0gZmFsc2VcbnRyeSB7XG5cdHt7dHJ5fX1cblx0ZXhjZXB0RWxzZV8gPSB0cnVlXG5cdHt7b3BFbHNlfX1cbn0gY2F0Y2ggKF8pIHtcblx0aWYgKGV4Y2VwdEVsc2VfKVxuXHRcdHRocm93IF9cblx0e3thbGxDYXRjaGVzfX1cbn1cbiovXG5mdW5jdGlvbiB0cmFuc3BpbGVXaXRoRWxzZShfKSB7XG5cdGNvbnN0IF90cnkgPSB0MShfLm9wRWxzZSwgY2F0KHRMaW5lcyhfLnRyeS5saW5lcyksIFNldEV4Y2VwdEVsc2UpKVxuXHRjb25zdCBfY2F0Y2ggPSB0cmFuc3BpbGVDYXRjaGVzKF8udHlwZWRDYXRjaGVzLCBfLm9wQ2F0Y2hBbGwsIHRydWUpXG5cdHJldHVybiBbTGV0RXhjZXB0RWxzZSwgbmV3IFRyeVN0YXRlbWVudChfdHJ5LCBfY2F0Y2gsIG9wTWFwKF8ub3BGaW5hbGx5LCB0MCkpXVxufVxuXG5mdW5jdGlvbiB0cmFuc3BpbGVDYXRjaGVzKHR5cGVkQ2F0Y2hlcywgb3BDYXRjaEFsbCwgaGFzRWxzZSkge1xuXHRjb25zdCBhbGxDYXRjaGVzID0gY2F0KHR5cGVkQ2F0Y2hlcywgb3BDYXRjaEFsbClcblx0Ly8gSWYgdGhleSBhbGwgaGF2ZSB0aGUgc2FtZSBuYW1lLCB3ZSBkb24ndCBuZWVkIGluZGl2aWR1YWwgZGVjbGFyZSBmb3IgdGhlaXIgZXJyb3JzLlxuXHRjb25zdCBuZWVkc0Vycm9yRGVjbGFyZSA9ICFhbGxTYW1lKGFsbENhdGNoZXMsIF8gPT4gXy5jYXVnaHQubmFtZSlcblx0Y29uc3QgaWRFcnJvciA9IG5lZWRzRXJyb3JEZWNsYXJlID8gSWRFcnJvciA6IGFjY2Vzc0xvY2FsRGVjbGFyZShhbGxDYXRjaGVzWzBdLmNhdWdodClcblx0Y29uc3QgdGhyb3dJZk9uRWxzZSA9ICgpID0+XG5cdFx0bmV3IElmU3RhdGVtZW50KElkRXhjZXB0RWxzZSwgbmV3IFRocm93U3RhdGVtZW50KGlkRXJyb3IpKVxuXG5cdGNvbnN0IGNhdGNoQWxsID0gaWZFbHNlKG9wQ2F0Y2hBbGwsXG5cdFx0XyA9PiB0MShfLCBuZWVkc0Vycm9yRGVjbGFyZSksXG5cdFx0KCkgPT4gbmV3IFRocm93U3RhdGVtZW50KGlkRXJyb3IpKVxuXG5cdGlmIChpc0VtcHR5KHR5cGVkQ2F0Y2hlcykpIHtcblx0XHRpZiAoaGFzRWxzZSlcblx0XHRcdGNhdGNoQWxsLmJvZHkudW5zaGlmdCh0aHJvd0lmT25FbHNlKCkpXG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZShpZEVycm9yLCBjYXRjaEFsbClcblx0fSBlbHNlIHtcblx0XHRsZXQgY2F0Y2hlcyA9IGNhdGNoQWxsXG5cdFx0Zm9yIChjb25zdCB0eXBlZENhdGNoIG9mIHJldmVyc2VJdGVyKHR5cGVkQ2F0Y2hlcykpIHtcblx0XHRcdGNvbnN0IGNvbmQgPSBtc0NhbGwoJ2NvbnRhaW5zJywgdDAodHlwZWRDYXRjaC5jYXVnaHQub3BUeXBlKSwgaWRFcnJvcilcblx0XHRcdGNvbnN0IHRoZW4gPSB0MSh0eXBlZENhdGNoLCBuZWVkc0Vycm9yRGVjbGFyZSlcblx0XHRcdGNhdGNoZXMgPSBuZXcgSWZTdGF0ZW1lbnQoY29uZCwgdGhlbiwgY2F0Y2hlcylcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBDYXRjaENsYXVzZShpZEVycm9yLFxuXHRcdFx0bmV3IEJsb2NrU3RhdGVtZW50KGhhc0Vsc2UgPyBbdGhyb3dJZk9uRWxzZSgpLCBjYXRjaGVzXSA6IFtjYXRjaGVzXSkpXG5cdH1cbn1cblxuY29uc3Rcblx0SWRFcnJvciA9IG5ldyBJZGVudGlmaWVyKCdlcnJvcl8nKSxcblx0SWRFeGNlcHRFbHNlID0gbmV3IElkZW50aWZpZXIoJ2V4Y2VwdEVsc2VfJyksXG5cdExldEV4Y2VwdEVsc2UgPSBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignbGV0JywgW1xuXHRcdG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoSWRFeGNlcHRFbHNlLCBuZXcgTGl0ZXJhbChmYWxzZSkpXSksXG5cdFNldEV4Y2VwdEVsc2UgPSBuZXcgQXNzaWdubWVudEV4cHJlc3Npb24oJz0nLCBJZEV4Y2VwdEVsc2UsIG5ldyBMaXRlcmFsKHRydWUpKVxuIl19