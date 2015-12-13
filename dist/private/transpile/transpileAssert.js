'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../MsAst', '../util', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../MsAst'), require('../util'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.MsAst, global.util, global.util);
		global.transpileAssert = mod.exports;
	}
})(this, function (exports, _ast, _MsAst, _util, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const failCond = () => {
			const cond = (0, _util2.t0)(this.condition);
			return this.negate ? cond : new _ast.UnaryExpression('!', cond);
		};

		return (0, _util.ifElse)(this.opThrown, _ => new _ast.IfStatement(failCond(), (0, _util2.doThrow)(_)), () => {
			if (this.condition instanceof _MsAst.Call) {
				const call = this.condition;
				const called = call.called;
				const args = call.args.map(_util2.t0);
				return called instanceof _MsAst.Member ? (0, _util2.msCall)(this.negate ? 'assertNotMember' : 'assertMember', (0, _util2.t0)(called.object), (0, _util2.transpileName)(called.name), ...args) : (0, _util2.msCall)(this.negate ? 'assertNot' : 'assert', (0, _util2.t0)(called), ...args);
			} else return new _ast.IfStatement(failCond(), ThrowAssertFail);
		});
	};

	const ThrowAssertFail = (0, _util2.throwErrorFromString)('Assertion failed.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVBc3NlcnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFLZSxZQUFXO0FBQ3pCLFFBQU0sUUFBUSxHQUFHLE1BQU07QUFDdEIsU0FBTSxJQUFJLEdBQUcsV0FKVSxFQUFFLEVBSVQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQy9CLFVBQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsU0FSVCxlQUFlLENBUWMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQzFELENBQUE7O0FBRUQsU0FBTyxVQVRBLE1BQU0sRUFTQyxJQUFJLENBQUMsUUFBUSxFQUMxQixDQUFDLElBQUksU0FaQyxXQUFXLENBWUksUUFBUSxFQUFFLEVBQUUsV0FUM0IsT0FBTyxFQVM0QixDQUFDLENBQUMsQ0FBQyxFQUM1QyxNQUFNO0FBQ0wsT0FBSSxJQUFJLENBQUMsU0FBUyxtQkFiYixJQUFJLEFBYXlCLEVBQUU7QUFDbkMsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtBQUMzQixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO0FBQzFCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxRQWRMLEVBQUUsQ0FjTyxDQUFBO0FBQzlCLFdBQU8sTUFBTSxtQkFqQkgsTUFBTSxBQWlCZSxHQUM5QixXQWhCWSxNQUFNLEVBaUJqQixJQUFJLENBQUMsTUFBTSxHQUFHLGlCQUFpQixHQUFHLGNBQWMsRUFDaEQsV0FsQm1CLEVBQUUsRUFrQmxCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxXQWxCMEIsYUFBYSxFQWtCekIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQ3hELFdBbkJZLE1BQU0sRUFtQlgsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLEdBQUcsUUFBUSxFQUFFLFdBbkJ6QixFQUFFLEVBbUIwQixNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ2xFLE1BQ0EsT0FBTyxTQXhCSCxXQUFXLENBd0JRLFFBQVEsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0dBQ3BELENBQUMsQ0FBQTtFQUNIIiwiZmlsZSI6InRyYW5zcGlsZUFzc2VydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SWZTdGF0ZW1lbnQsIFVuYXJ5RXhwcmVzc2lvbn0gZnJvbSAnZXNhc3QvZGlzdC9hc3QnXG5pbXBvcnQge0NhbGwsIE1lbWJlcn0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2lmRWxzZX0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZG9UaHJvdywgbXNDYWxsLCB0MCwgdGhyb3dFcnJvckZyb21TdHJpbmcsIHRyYW5zcGlsZU5hbWV9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cdGNvbnN0IGZhaWxDb25kID0gKCkgPT4ge1xuXHRcdGNvbnN0IGNvbmQgPSB0MCh0aGlzLmNvbmRpdGlvbilcblx0XHRyZXR1cm4gdGhpcy5uZWdhdGUgPyBjb25kIDogbmV3IFVuYXJ5RXhwcmVzc2lvbignIScsIGNvbmQpXG5cdH1cblxuXHRyZXR1cm4gaWZFbHNlKHRoaXMub3BUaHJvd24sXG5cdFx0XyA9PiBuZXcgSWZTdGF0ZW1lbnQoZmFpbENvbmQoKSwgZG9UaHJvdyhfKSksXG5cdFx0KCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuY29uZGl0aW9uIGluc3RhbmNlb2YgQ2FsbCkge1xuXHRcdFx0XHRjb25zdCBjYWxsID0gdGhpcy5jb25kaXRpb25cblx0XHRcdFx0Y29uc3QgY2FsbGVkID0gY2FsbC5jYWxsZWRcblx0XHRcdFx0Y29uc3QgYXJncyA9IGNhbGwuYXJncy5tYXAodDApXG5cdFx0XHRcdHJldHVybiBjYWxsZWQgaW5zdGFuY2VvZiBNZW1iZXIgP1xuXHRcdFx0XHRcdG1zQ2FsbChcblx0XHRcdFx0XHRcdHRoaXMubmVnYXRlID8gJ2Fzc2VydE5vdE1lbWJlcicgOiAnYXNzZXJ0TWVtYmVyJyxcblx0XHRcdFx0XHRcdHQwKGNhbGxlZC5vYmplY3QpLCB0cmFuc3BpbGVOYW1lKGNhbGxlZC5uYW1lKSwgLi4uYXJncykgOlxuXHRcdFx0XHRcdG1zQ2FsbCh0aGlzLm5lZ2F0ZSA/ICdhc3NlcnROb3QnIDogJ2Fzc2VydCcsIHQwKGNhbGxlZCksIC4uLmFyZ3MpXG5cdFx0XHR9IGVsc2Vcblx0XHRcdFx0cmV0dXJuIG5ldyBJZlN0YXRlbWVudChmYWlsQ29uZCgpLCBUaHJvd0Fzc2VydEZhaWwpXG5cdFx0fSlcbn1cblxuY29uc3QgVGhyb3dBc3NlcnRGYWlsID0gdGhyb3dFcnJvckZyb21TdHJpbmcoJ0Fzc2VydGlvbiBmYWlsZWQuJylcbiJdfQ==