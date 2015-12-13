'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../MsAst', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../MsAst'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.MsAst, global.context);
		global.transpileSpecial = mod.exports;
	}
})(this, function (exports, _ast, _MsAst, _context) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.transpileSpecialDo = transpileSpecialDo;
	exports.transpileSpecialVal = transpileSpecialVal;

	function transpileSpecialDo() {
		switch (this.kind) {
			case _MsAst.SpecialDos.Debugger:
				return new _ast.DebuggerStatement();

			default:
				throw new Error(this.kind);
		}
	}

	function transpileSpecialVal() {
		switch (this.kind) {
			case _MsAst.SpecialVals.False:
				return new _ast.Literal(false);

			case _MsAst.SpecialVals.Name:
				return new _ast.Literal(_context.verifyResults.name(this));

			case _MsAst.SpecialVals.Null:
				return new _ast.Literal(null);

			case _MsAst.SpecialVals.True:
				return new _ast.Literal(true);

			case _MsAst.SpecialVals.Undefined:
				return new _ast.UnaryExpression('void', LitZero);

			default:
				throw new Error(this.kind);
		}
	}

	const LitZero = new _ast.Literal(0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVTcGVjaWFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQUlnQixrQkFBa0IsR0FBbEIsa0JBQWtCO1NBU2xCLG1CQUFtQixHQUFuQixtQkFBbUI7O1VBVG5CLGtCQUFrQjs7Ozs7Ozs7OztVQVNsQixtQkFBbUIiLCJmaWxlIjoidHJhbnNwaWxlU3BlY2lhbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGVidWdnZXJTdGF0ZW1lbnQsIExpdGVyYWwsIFVuYXJ5RXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge1NwZWNpYWxEb3MsIFNwZWNpYWxWYWxzfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7dmVyaWZ5UmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlU3BlY2lhbERvKCkge1xuXHRzd2l0Y2ggKHRoaXMua2luZCkge1xuXHRcdGNhc2UgU3BlY2lhbERvcy5EZWJ1Z2dlcjpcblx0XHRcdHJldHVybiBuZXcgRGVidWdnZXJTdGF0ZW1lbnQoKVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IodGhpcy5raW5kKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVTcGVjaWFsVmFsKCkge1xuXHQvLyBNYWtlIG5ldyBvYmplY3RzIGJlY2F1c2Ugd2Ugd2lsbCBhc3NpZ24gYGxvY2AgdG8gdGhlbS5cblx0c3dpdGNoICh0aGlzLmtpbmQpIHtcblx0XHRjYXNlIFNwZWNpYWxWYWxzLkZhbHNlOlxuXHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKGZhbHNlKVxuXHRcdGNhc2UgU3BlY2lhbFZhbHMuTmFtZTpcblx0XHRcdHJldHVybiBuZXcgTGl0ZXJhbCh2ZXJpZnlSZXN1bHRzLm5hbWUodGhpcykpXG5cdFx0Y2FzZSBTcGVjaWFsVmFscy5OdWxsOlxuXHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKG51bGwpXG5cdFx0Y2FzZSBTcGVjaWFsVmFscy5UcnVlOlxuXHRcdFx0cmV0dXJuIG5ldyBMaXRlcmFsKHRydWUpXG5cdFx0Y2FzZSBTcGVjaWFsVmFscy5VbmRlZmluZWQ6XG5cdFx0XHRyZXR1cm4gbmV3IFVuYXJ5RXhwcmVzc2lvbigndm9pZCcsIExpdFplcm8pXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBFcnJvcih0aGlzLmtpbmQpXG5cdH1cbn1cblxuY29uc3QgTGl0WmVybyA9IG5ldyBMaXRlcmFsKDApXG4iXX0=