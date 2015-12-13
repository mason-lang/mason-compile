'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../MsAst', '../util', './ast-constants', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.MsAst, global.util, global.astConstants, global.context, global.util);
		global.transpileCase = mod.exports;
	}
})(this, function (exports, _ast, _MsAst, _util, _astConstants, _context, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const body = caseBody(this.parts, this.opElse);
		if (_context.verifyResults.isStatement(this)) return (0, _util.ifElse)(this.opCased, _ => new _ast.BlockStatement([(0, _util2.t0)(_), body]), () => body);else {
			const block = (0, _util.ifElse)(this.opCased, _ => [(0, _util2.t0)(_), body], () => [body]);
			return (0, _util2.blockWrap)(new _ast.BlockStatement(block));
		}
	};

	exports.transpileCasePart = transpileCasePart;

	function transpileCasePart(alternate) {
		if (this.test instanceof _MsAst.Pattern) {
			var _test = this.test;
			const type = _test.type;
			const patterned = _test.patterned;
			const locals = _test.locals;
			const decl = (0, _util2.plainLet)(IdExtract, (0, _util2.msCall)('extract', (0, _util2.t0)(type), (0, _util2.t0)(patterned), new _ast.Literal(locals.length)));
			const test = new _ast.BinaryExpression('!==', IdExtract, _astConstants.LitNull);
			const extract = new _ast.VariableDeclaration('let', locals.map((_, idx) => new _ast.VariableDeclarator((0, _util2.idForDeclareCached)(_), new _ast.MemberExpression(IdExtract, new _ast.Literal(idx)))));
			const res = (0, _util2.t1)(this.result, extract);
			return new _ast.BlockStatement([decl, new _ast.IfStatement(test, res, alternate)]);
		} else return new _ast.IfStatement((0, _util2.t0)(this.test), (0, _util2.t0)(this.result), alternate);
	}

	function caseBody(parts, opElse) {
		let acc = (0, _util.ifElse)(opElse, _util2.t0, () => ThrowNoCaseMatch);

		for (let i = parts.length - 1; i >= 0; i = i - 1) acc = (0, _util2.t1)(parts[i], acc);

		return acc;
	}

	const IdExtract = new _ast.Identifier('_$');
	const ThrowNoCaseMatch = (0, _util2.throwErrorFromString)('No branch of `case` matches.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVDYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBUWUsWUFBVztBQUN6QixRQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDOUMsTUFBSSxTQUxHLGFBQWEsQ0FLRixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ2xDLE9BQU8sa0JBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksd0JBQW1CLENBQUMsZUFBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUEsS0FDM0U7QUFDSixTQUFNLEtBQUssR0FBRyxrQkFBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDcEUsVUFBTyxXQVJELFNBQVMsRUFRRSx3QkFBbUIsS0FBSyxDQUFDLENBQUMsQ0FBQTtHQUMzQztFQUNEOztTQUVlLGlCQUFpQixHQUFqQixpQkFBaUI7O1VBQWpCLGlCQUFpQiIsImZpbGUiOiJ0cmFuc3BpbGVDYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCaW5hcnlFeHByZXNzaW9uLCBCbG9ja1N0YXRlbWVudCwgSWRlbnRpZmllciwgSWZTdGF0ZW1lbnQsIExpdGVyYWwsIE1lbWJlckV4cHJlc3Npb24sXG5cdFZhcmlhYmxlRGVjbGFyYXRpb24sIFZhcmlhYmxlRGVjbGFyYXRvcn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge1BhdHRlcm59IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtpZkVsc2V9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0xpdE51bGx9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7dmVyaWZ5UmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHtibG9ja1dyYXAsIGlkRm9yRGVjbGFyZUNhY2hlZCwgbXNDYWxsLCBwbGFpbkxldCwgdDAsIHQxLCB0aHJvd0Vycm9yRnJvbVN0cmluZ30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblx0Y29uc3QgYm9keSA9IGNhc2VCb2R5KHRoaXMucGFydHMsIHRoaXMub3BFbHNlKVxuXHRpZiAodmVyaWZ5UmVzdWx0cy5pc1N0YXRlbWVudCh0aGlzKSlcblx0XHRyZXR1cm4gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBuZXcgQmxvY2tTdGF0ZW1lbnQoW3QwKF8pLCBib2R5XSksICgpID0+IGJvZHkpXG5cdGVsc2Uge1xuXHRcdGNvbnN0IGJsb2NrID0gaWZFbHNlKHRoaXMub3BDYXNlZCwgXyA9PiBbdDAoXyksIGJvZHldLCAoKSA9PiBbYm9keV0pXG5cdFx0cmV0dXJuIGJsb2NrV3JhcChuZXcgQmxvY2tTdGF0ZW1lbnQoYmxvY2spKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVDYXNlUGFydChhbHRlcm5hdGUpIHtcblx0aWYgKHRoaXMudGVzdCBpbnN0YW5jZW9mIFBhdHRlcm4pIHtcblx0XHRjb25zdCB7dHlwZSwgcGF0dGVybmVkLCBsb2NhbHN9ID0gdGhpcy50ZXN0XG5cdFx0Y29uc3QgZGVjbCA9IHBsYWluTGV0KElkRXh0cmFjdCxcblx0XHRcdG1zQ2FsbCgnZXh0cmFjdCcsIHQwKHR5cGUpLCB0MChwYXR0ZXJuZWQpLCBuZXcgTGl0ZXJhbChsb2NhbHMubGVuZ3RoKSkpXG5cdFx0Y29uc3QgdGVzdCA9IG5ldyBCaW5hcnlFeHByZXNzaW9uKCchPT0nLCBJZEV4dHJhY3QsIExpdE51bGwpXG5cdFx0Y29uc3QgZXh0cmFjdCA9IG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLCBsb2NhbHMubWFwKChfLCBpZHgpID0+XG5cdFx0XHRuZXcgVmFyaWFibGVEZWNsYXJhdG9yKFxuXHRcdFx0XHRpZEZvckRlY2xhcmVDYWNoZWQoXyksXG5cdFx0XHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKElkRXh0cmFjdCwgbmV3IExpdGVyYWwoaWR4KSkpKSlcblx0XHRjb25zdCByZXMgPSB0MSh0aGlzLnJlc3VsdCwgZXh0cmFjdClcblx0XHRyZXR1cm4gbmV3IEJsb2NrU3RhdGVtZW50KFtkZWNsLCBuZXcgSWZTdGF0ZW1lbnQodGVzdCwgcmVzLCBhbHRlcm5hdGUpXSlcblx0fSBlbHNlXG5cdFx0Ly8gYWx0ZXJuYXRlIHdyaXR0ZW4gdG8gYnkgYGNhc2VCb2R5YC5cblx0XHRyZXR1cm4gbmV3IElmU3RhdGVtZW50KHQwKHRoaXMudGVzdCksIHQwKHRoaXMucmVzdWx0KSwgYWx0ZXJuYXRlKVxufVxuXG5mdW5jdGlvbiBjYXNlQm9keShwYXJ0cywgb3BFbHNlKSB7XG5cdGxldCBhY2MgPSBpZkVsc2Uob3BFbHNlLCB0MCwgKCkgPT4gVGhyb3dOb0Nhc2VNYXRjaClcblx0Zm9yIChsZXQgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKVxuXHRcdGFjYyA9IHQxKHBhcnRzW2ldLCBhY2MpXG5cdHJldHVybiBhY2Ncbn1cblxuY29uc3QgSWRFeHRyYWN0ID0gbmV3IElkZW50aWZpZXIoJ18kJylcbmNvbnN0IFRocm93Tm9DYXNlTWF0Y2ggPSB0aHJvd0Vycm9yRnJvbVN0cmluZygnTm8gYnJhbmNoIG9mIGBjYXNlYCBtYXRjaGVzLicpXG4iXX0=