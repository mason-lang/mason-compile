'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', '../VerifyResults', './ast-constants', './context', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('../VerifyResults'), require('./ast-constants'), require('./context'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.VerifyResults, global.astConstants, global.context, global.util);
		global.transpileBlock = mod.exports;
	}
})(this, function (exports, _ast, _util, _VerifyResults, _astConstants, _context, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		let lead = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		let opReturnType = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
		let follow = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

		const kind = _context.verifyResults.blockKind(this);
		switch (kind) {
			case _VerifyResults.Blocks.Do:
				(0, _util.assert)(opReturnType === null);
				return new _ast.BlockStatement((0, _util.cat)(lead, (0, _util2.tLines)(this.lines), follow));
			case _VerifyResults.Blocks.Throw:
				return new _ast.BlockStatement((0, _util.cat)(lead, (0, _util2.tLines)((0, _util.rtail)(this.lines)), (0, _util2.t0)((0, _util.last)(this.lines))));
			case _VerifyResults.Blocks.Return:
				return transpileBlockReturn((0, _util2.t0)((0, _util.last)(this.lines)), (0, _util2.tLines)((0, _util.rtail)(this.lines)), lead, opReturnType);
			case _VerifyResults.Blocks.Bag:case _VerifyResults.Blocks.Map:case _VerifyResults.Blocks.Obj:
				{
					const declare = kind === _VerifyResults.Blocks.Bag ? _astConstants.DeclareBuiltBag : kind === _VerifyResults.Blocks.Map ? _astConstants.DeclareBuiltMap : _astConstants.DeclareBuiltObj;
					const body = (0, _util.cat)(declare, (0, _util2.tLines)(this.lines));
					return transpileBlockReturn(_astConstants.IdBuilt, body, lead, opReturnType);
				}
			default:
				throw new Error(kind);
		}
	};

	function transpileBlockReturn(returned, lines, lead, opReturnType) {
		const ret = new _ast.ReturnStatement((0, _util2.maybeWrapInCheckInstance)(returned, opReturnType, 'returned value'));
		return new _ast.BlockStatement((0, _util.cat)(lead, lines, ret));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVCbG9jay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU9lLFlBQTBEO01BQWpELElBQUkseURBQUcsSUFBSTtNQUFFLFlBQVkseURBQUcsSUFBSTtNQUFFLE1BQU0seURBQUcsSUFBSTs7QUFDdEUsUUFBTSxJQUFJLEdBQUcsU0FKTixhQUFhLENBSU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzFDLFVBQVEsSUFBSTtBQUNYLFFBQUssZUFSQyxNQUFNLENBUUEsRUFBRTtBQUNiLGNBVkssTUFBTSxFQVVKLFlBQVksS0FBSyxJQUFJLENBQUMsQ0FBQTtBQUM3QixXQUFPLHdCQUFtQixlQUFJLElBQUksRUFBRSxXQVBELE1BQU0sRUFPRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUFBLEFBQ2pFLFFBQUssZUFYQyxNQUFNLENBV0EsS0FBSztBQUNoQixXQUFPLHdCQUNOLGVBQUksSUFBSSxFQUFFLFdBVndCLE1BQU0sRUFVdkIsVUFkTSxLQUFLLEVBY0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FWUCxFQUFFLEVBVVEsVUFkdkIsSUFBSSxFQWN3QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFBQSxBQUM3RCxRQUFLLGVBZEMsTUFBTSxDQWNBLE1BQU07QUFDakIsV0FBTyxvQkFBb0IsQ0FDMUIsV0FiOEIsRUFBRSxFQWE3QixVQWpCYyxJQUFJLEVBaUJiLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFdBYlksTUFBTSxFQWFYLFVBakJOLEtBQUssRUFpQk8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQUEsQUFDdEUsUUFBSyxlQWpCQyxNQUFNLENBaUJBLEdBQUcsQ0FBQyxBQUFDLEtBQUssZUFqQmhCLE1BQU0sQ0FpQmlCLEdBQUcsQ0FBQyxBQUFDLEtBQUssZUFqQmpDLE1BQU0sQ0FpQmtDLEdBQUc7QUFBRTtBQUNsRCxXQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssZUFsQnBCLE1BQU0sQ0FrQnFCLEdBQUcsaUJBakI5QixlQUFlLEdBbUJuQixJQUFJLEtBQUssZUFwQkwsTUFBTSxDQW9CTSxHQUFHLGlCQW5CRSxlQUFlLGlCQUFFLGVBQWUsQUFtQkUsQ0FBQTtBQUN4RCxXQUFNLElBQUksR0FBRyxlQUFJLE9BQU8sRUFBRSxXQWxCUyxNQUFNLEVBa0JSLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzdDLFlBQU8sb0JBQW9CLGVBckI2QixPQUFPLEVBcUIxQixJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFBO0tBQzlEO0FBQUEsQUFDRDtBQUNDLFVBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFBQSxHQUN0QjtFQUNEIiwiZmlsZSI6InRyYW5zcGlsZUJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCbG9ja1N0YXRlbWVudCwgUmV0dXJuU3RhdGVtZW50fSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7YXNzZXJ0LCBjYXQsIGxhc3QsIHJ0YWlsfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtCbG9ja3N9IGZyb20gJy4uL1ZlcmlmeVJlc3VsdHMnXG5pbXBvcnQge0RlY2xhcmVCdWlsdEJhZywgRGVjbGFyZUJ1aWx0TWFwLCBEZWNsYXJlQnVpbHRPYmosIElkQnVpbHR9IGZyb20gJy4vYXN0LWNvbnN0YW50cydcbmltcG9ydCB7dmVyaWZ5UmVzdWx0c30gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHttYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UsIHQwLCB0TGluZXN9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obGVhZCA9IG51bGwsIG9wUmV0dXJuVHlwZSA9IG51bGwsIGZvbGxvdyA9IG51bGwpIHtcblx0Y29uc3Qga2luZCA9IHZlcmlmeVJlc3VsdHMuYmxvY2tLaW5kKHRoaXMpXG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgQmxvY2tzLkRvOlxuXHRcdFx0YXNzZXJ0KG9wUmV0dXJuVHlwZSA9PT0gbnVsbClcblx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIHRMaW5lcyh0aGlzLmxpbmVzKSwgZm9sbG93KSlcblx0XHRjYXNlIEJsb2Nrcy5UaHJvdzpcblx0XHRcdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoXG5cdFx0XHRcdGNhdChsZWFkLCB0TGluZXMocnRhaWwodGhpcy5saW5lcykpLCB0MChsYXN0KHRoaXMubGluZXMpKSkpXG5cdFx0Y2FzZSBCbG9ja3MuUmV0dXJuOlxuXHRcdFx0cmV0dXJuIHRyYW5zcGlsZUJsb2NrUmV0dXJuKFxuXHRcdFx0XHR0MChsYXN0KHRoaXMubGluZXMpKSwgdExpbmVzKHJ0YWlsKHRoaXMubGluZXMpKSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHRcdGNhc2UgQmxvY2tzLkJhZzogY2FzZSBCbG9ja3MuTWFwOiBjYXNlIEJsb2Nrcy5PYmo6IHtcblx0XHRcdGNvbnN0IGRlY2xhcmUgPSBraW5kID09PSBCbG9ja3MuQmFnID9cblx0XHRcdFx0RGVjbGFyZUJ1aWx0QmFnIDpcblx0XHRcdFx0a2luZCA9PT0gQmxvY2tzLk1hcCA/IERlY2xhcmVCdWlsdE1hcCA6IERlY2xhcmVCdWlsdE9ialxuXHRcdFx0Y29uc3QgYm9keSA9IGNhdChkZWNsYXJlLCB0TGluZXModGhpcy5saW5lcykpXG5cdFx0XHRyZXR1cm4gdHJhbnNwaWxlQmxvY2tSZXR1cm4oSWRCdWlsdCwgYm9keSwgbGVhZCwgb3BSZXR1cm5UeXBlKVxuXHRcdH1cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGtpbmQpXG5cdH1cbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlQmxvY2tSZXR1cm4ocmV0dXJuZWQsIGxpbmVzLCBsZWFkLCBvcFJldHVyblR5cGUpIHtcblx0Y29uc3QgcmV0ID0gbmV3IFJldHVyblN0YXRlbWVudChcblx0XHRtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UocmV0dXJuZWQsIG9wUmV0dXJuVHlwZSwgJ3JldHVybmVkIHZhbHVlJykpXG5cdHJldHVybiBuZXcgQmxvY2tTdGF0ZW1lbnQoY2F0KGxlYWQsIGxpbmVzLCByZXQpKVxufVxuIl19