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

	exports.transpileTraitDo = transpileTraitDo;

	function transpileTraitDo() {
		return (0, _util2.msCall)('traitWithDefs', (0, _util2.t0)(this.implementor), (0, _util2.t0)(this.trait), methods(this.statics), methods(this.methods));
	}

	function methods(_) {
		return new _ast.ObjectExpression(_.map(_transpileMethod.transpileMethodToProperty));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVUcmFpdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQU9lLFlBQVc7QUFDekIsUUFBTSxJQUFJLEdBQUcsU0FSVyxPQUFPLENBUU4sU0FMbEIsYUFBYSxDQUttQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNsRCxRQUFNLE1BQU0sR0FBRyxTQVRSLGVBQWUsQ0FTYSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBSSxDQUFDLENBQUE7QUFDNUQsUUFBTSxLQUFLLEdBQUcsbUJBQU8sT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekYsU0FBTyxVQVZBLE1BQU0sRUFVQyxJQUFJLENBQUMsSUFBSSxFQUN0QixDQUFDLElBQUksV0FQQyxTQUFTLEVBT0EsV0FQd0IsRUFBRSxFQU92QixDQUFDLENBQUMsS0FBSyxFQUFFLFdBUEYsUUFBUSxnQkFIM0IsT0FBTyxFQVVnQyxLQUFLLENBQUMsRUFBRSxJQUFJLGdCQVYxQyxXQUFXLENBVTZDLENBQUMsRUFDeEUsTUFBTSxLQUFLLENBQUMsQ0FBQTtFQUNiOztTQUVlLGdCQUFnQixHQUFoQixnQkFBZ0I7O1VBQWhCLGdCQUFnQiIsImZpbGUiOiJ0cmFuc3BpbGVUcmFpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBMaXRlcmFsLCBPYmplY3RFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtJZEZvY3VzLCBSZXR1cm5Gb2N1c30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3RyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHl9IGZyb20gJy4vdHJhbnNwaWxlTWV0aG9kJ1xuaW1wb3J0IHtibG9ja1dyYXAsIG1zQ2FsbCwgcGxhaW5MZXQsIHQwLCB0M30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0Y29uc3Qgc3VwZXJzID0gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnN1cGVyVHJhaXRzLm1hcCh0MCkpXG5cdGNvbnN0IHRyYWl0ID0gbXNDYWxsKCd0cmFpdCcsIG5hbWUsIHN1cGVycywgbWV0aG9kcyh0aGlzLnN0YXRpY3MpLCBtZXRob2RzKHRoaXMubWV0aG9kcykpXG5cdHJldHVybiBpZkVsc2UodGhpcy5vcERvLFxuXHRcdF8gPT4gYmxvY2tXcmFwKHQzKF8uYmxvY2ssIHBsYWluTGV0KElkRm9jdXMsIHRyYWl0KSwgbnVsbCwgUmV0dXJuRm9jdXMpKSxcblx0XHQoKSA9PiB0cmFpdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcGlsZVRyYWl0RG8oKSB7XG5cdHJldHVybiBtc0NhbGwoJ3RyYWl0V2l0aERlZnMnLFxuXHRcdHQwKHRoaXMuaW1wbGVtZW50b3IpLCB0MCh0aGlzLnRyYWl0KSwgbWV0aG9kcyh0aGlzLnN0YXRpY3MpLCBtZXRob2RzKHRoaXMubWV0aG9kcykpXG59XG5cbmZ1bmN0aW9uIG1ldGhvZHMoXykge1xuXHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24oXy5tYXAodHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eSkpXG59XG4iXX0=