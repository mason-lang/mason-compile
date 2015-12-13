'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', '../util', './ast-constants', './context', './transpileMethod', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('../util'), require('./ast-constants'), require('./context'), require('./transpileMethod'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.astConstants, global.context, global.transpileMethod, global.util);
		global.transpileTrait = mod.exports;
	}
})(this, function (exports, _ast, _util, _astConstants, _context, _transpileMethod, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const name = new _ast.Literal(_context.verifyResults.name(this));
		const supers = new _ast.ArrayExpression(this.superTraits.map(_util2.t0));
		const trait = (0, _util2.msCall)('trait', name, supers, methods(this.statics), methods(this.methods));
		return (0, _util.ifElse)(this.opDo, _ => (0, _util2.blockWrap)((0, _util2.t3)(_.block, (0, _util2.plainLet)(_astConstants.IdFocus, trait), null, _astConstants.ReturnFocus)), () => trait);
	};

	function methods(_) {
		return new _ast.ObjectExpression(_.map(_transpileMethod.transpileMethodToProperty));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVUcmFpdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU9lLFlBQVc7QUFDekIsUUFBTSxJQUFJLEdBQUcsU0FSVyxPQUFPLENBUU4sU0FMbEIsYUFBYSxDQUttQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNsRCxRQUFNLE1BQU0sR0FBRyxTQVRSLGVBQWUsQ0FTYSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFKbkIsRUFBRSxDQUlxQixDQUFDLENBQUE7QUFDNUQsUUFBTSxLQUFLLEdBQUcsV0FMSSxNQUFNLEVBS0gsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekYsU0FBTyxVQVZBLE1BQU0sRUFVQyxJQUFJLENBQUMsSUFBSSxFQUN0QixDQUFDLElBQUksV0FQQyxTQUFTLEVBT0EsV0FQd0IsRUFBRSxFQU92QixDQUFDLENBQUMsS0FBSyxFQUFFLFdBUEYsUUFBUSxnQkFIM0IsT0FBTyxFQVVnQyxLQUFLLENBQUMsRUFBRSxJQUFJLGdCQVYxQyxXQUFXLENBVTZDLENBQUMsRUFDeEUsTUFBTSxLQUFLLENBQUMsQ0FBQTtFQUNiIiwiZmlsZSI6InRyYW5zcGlsZVRyYWl0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcnJheUV4cHJlc3Npb24sIExpdGVyYWwsIE9iamVjdEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtpZkVsc2V9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0lkRm9jdXMsIFJldHVybkZvY3VzfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge3ZlcmlmeVJlc3VsdHN9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7dHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eX0gZnJvbSAnLi90cmFuc3BpbGVNZXRob2QnXG5pbXBvcnQge2Jsb2NrV3JhcCwgbXNDYWxsLCBwbGFpbkxldCwgdDAsIHQzfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXHRjb25zdCBuYW1lID0gbmV3IExpdGVyYWwodmVyaWZ5UmVzdWx0cy5uYW1lKHRoaXMpKVxuXHRjb25zdCBzdXBlcnMgPSBuZXcgQXJyYXlFeHByZXNzaW9uKHRoaXMuc3VwZXJUcmFpdHMubWFwKHQwKSlcblx0Y29uc3QgdHJhaXQgPSBtc0NhbGwoJ3RyYWl0JywgbmFtZSwgc3VwZXJzLCBtZXRob2RzKHRoaXMuc3RhdGljcyksIG1ldGhvZHModGhpcy5tZXRob2RzKSlcblx0cmV0dXJuIGlmRWxzZSh0aGlzLm9wRG8sXG5cdFx0XyA9PiBibG9ja1dyYXAodDMoXy5ibG9jaywgcGxhaW5MZXQoSWRGb2N1cywgdHJhaXQpLCBudWxsLCBSZXR1cm5Gb2N1cykpLFxuXHRcdCgpID0+IHRyYWl0KVxufVxuXG5mdW5jdGlvbiBtZXRob2RzKF8pIHtcblx0cmV0dXJuIG5ldyBPYmplY3RFeHByZXNzaW9uKF8ubWFwKHRyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHkpKVxufVxuIl19