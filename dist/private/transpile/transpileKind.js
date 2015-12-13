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
		global.transpileKind = mod.exports;
	}
})(this, function (exports, _ast, _util, _astConstants, _context, _transpileMethod, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function () {
		const name = new _ast.Literal(_context.verifyResults.name(this));
		const supers = new _ast.ArrayExpression(this.superKinds.map(_util2.t0));
		const kind = (0, _util2.msCall)('kind', name, supers, methods(this.statics), methods(this.methods));
		return (0, _util.ifElse)(this.opDo, _ => (0, _util2.blockWrap)((0, _util2.t3)(_.block, (0, _util2.plainLet)(_astConstants.IdFocus, kind), null, _astConstants.ReturnFocus)), () => kind);
	};

	function methods(_) {
		return new _ast.ObjectExpression(_.map(_transpileMethod.transpileMethodToProperty));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVLaW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBT2UsWUFBVztBQUN6QixRQUFNLElBQUksR0FBRyxTQVJXLE9BQU8sQ0FRTixTQUxsQixhQUFhLENBS21CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQ2xELFFBQU0sTUFBTSxHQUFHLFNBVFIsZUFBZSxDQVNhLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUpsQixFQUFFLENBSW9CLENBQUMsQ0FBQTtBQUMzRCxRQUFNLElBQUksR0FBRyxXQUxLLE1BQU0sRUFLSixNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN2RixTQUFPLFVBVkEsTUFBTSxFQVVDLElBQUksQ0FBQyxJQUFJLEVBQ3RCLENBQUMsSUFBSSxXQVBDLFNBQVMsRUFPQSxXQVB3QixFQUFFLEVBT3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FQRixRQUFRLGdCQUgzQixPQUFPLEVBVWdDLElBQUksQ0FBQyxFQUFFLElBQUksZ0JBVnpDLFdBQVcsQ0FVNEMsQ0FBQyxFQUN2RSxNQUFNLElBQUksQ0FBQyxDQUFBO0VBQ1oiLCJmaWxlIjoidHJhbnNwaWxlS2luZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyYXlFeHByZXNzaW9uLCBMaXRlcmFsLCBPYmplY3RFeHByZXNzaW9ufSBmcm9tICdlc2FzdC9kaXN0L2FzdCdcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtJZEZvY3VzLCBSZXR1cm5Gb2N1c30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHt2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge3RyYW5zcGlsZU1ldGhvZFRvUHJvcGVydHl9IGZyb20gJy4vdHJhbnNwaWxlTWV0aG9kJ1xuaW1wb3J0IHtibG9ja1dyYXAsIG1zQ2FsbCwgcGxhaW5MZXQsIHQwLCB0M30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblx0Y29uc3QgbmFtZSA9IG5ldyBMaXRlcmFsKHZlcmlmeVJlc3VsdHMubmFtZSh0aGlzKSlcblx0Y29uc3Qgc3VwZXJzID0gbmV3IEFycmF5RXhwcmVzc2lvbih0aGlzLnN1cGVyS2luZHMubWFwKHQwKSlcblx0Y29uc3Qga2luZCA9IG1zQ2FsbCgna2luZCcsIG5hbWUsIHN1cGVycywgbWV0aG9kcyh0aGlzLnN0YXRpY3MpLCBtZXRob2RzKHRoaXMubWV0aG9kcykpXG5cdHJldHVybiBpZkVsc2UodGhpcy5vcERvLFxuXHRcdF8gPT4gYmxvY2tXcmFwKHQzKF8uYmxvY2ssIHBsYWluTGV0KElkRm9jdXMsIGtpbmQpLCBudWxsLCBSZXR1cm5Gb2N1cykpLFxuXHRcdCgpID0+IGtpbmQpXG59XG5cbmZ1bmN0aW9uIG1ldGhvZHMoXykge1xuXHRyZXR1cm4gbmV3IE9iamVjdEV4cHJlc3Npb24oXy5tYXAodHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eSkpXG59XG4iXX0=