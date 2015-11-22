'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/util', '../MsAst', './ast-constants', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/util'), require('../MsAst'), require('./ast-constants'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.util, global.MsAst, global.astConstants, global.util);
		global.transpileMethod = mod.exports;
	}
})(this, function (exports, _ast, _util, _MsAst, _astConstants, _util2) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.transpileMethodToDefinition = transpileMethodToDefinition;
	exports.transpileMethodToProperty = transpileMethodToProperty;

	function transpileMethodToDefinition(_, isStatic) {
		var _methodParams = methodParams(_, 'method');

		const computed = _methodParams.computed;
		const key = _methodParams.key;
		const kind = _methodParams.kind;
		const value = _methodParams.value;
		return new _ast.MethodDefinition(key, value, kind, isStatic, computed);
	}

	function transpileMethodToProperty(_) {
		var _methodParams2 = methodParams(_, 'init');

		const computed = _methodParams2.computed;
		const isImpl = _methodParams2.isImpl;
		const key = _methodParams2.key;
		const kind = _methodParams2.kind;
		const value = _methodParams2.value;
		return new _ast.Property(kind, key, value, computed, isImpl);
	}

	function methodParams(_, defaultKind) {
		const computed = !(typeof _.symbol === 'string');
		const isImpl = _ instanceof _MsAst.MethodImpl;
		return {
			computed,
			isImpl,
			key: computed ? _.symbol instanceof _MsAst.QuoteAbstract ? (0, _util2.t0)(_.symbol) : (0, _util2.msCall)('symbol', (0, _util2.t0)(_.symbol)) : (0, _util.propertyIdOrLiteral)(_.symbol),
			kind: isImpl ? defaultKind : _ instanceof _MsAst.MethodGetter ? 'get' : 'set',
			value: isImpl ? (0, _util2.t0)(_.fun) : getSetFun(_)
		};
	}

	function getSetFun(_) {
		const args = _ instanceof _MsAst.MethodGetter ? [] : [_astConstants.IdFocus];
		return new _ast.FunctionExpression(null, args, (0, _util2.t1)(_.block, _astConstants.DeclareLexicalThis));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS90cmFuc3BpbGVNZXRob2QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBT2dCLDJCQUEyQixHQUEzQiwyQkFBMkI7U0FNM0IseUJBQXlCLEdBQXpCLHlCQUF5Qjs7VUFOekIsMkJBQTJCOzs7Ozs7Ozs7O1VBTTNCLHlCQUF5QiIsImZpbGUiOiJ0cmFuc3BpbGVNZXRob2QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Z1bmN0aW9uRXhwcmVzc2lvbiwgTWV0aG9kRGVmaW5pdGlvbiwgUHJvcGVydHl9IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IHtwcm9wZXJ0eUlkT3JMaXRlcmFsfSBmcm9tICdlc2FzdC9kaXN0L3V0aWwnXG5pbXBvcnQge01ldGhvZEdldHRlciwgTWV0aG9kSW1wbCwgUXVvdGVBYnN0cmFjdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0RlY2xhcmVMZXhpY2FsVGhpcywgSWRGb2N1c30gZnJvbSAnLi9hc3QtY29uc3RhbnRzJ1xuaW1wb3J0IHttc0NhbGwsIHQwLCB0MX0gZnJvbSAnLi91dGlsJ1xuXG4vKiogVHJhbnNwaWxlIG1ldGhvZCB0byBhIE1ldGhvZERlZmluaXRpb24gaW4gYSBjbGFzcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVNZXRob2RUb0RlZmluaXRpb24oXywgaXNTdGF0aWMpIHtcblx0Y29uc3Qge2NvbXB1dGVkLCBrZXksIGtpbmQsIHZhbHVlfSA9IG1ldGhvZFBhcmFtcyhfLCAnbWV0aG9kJylcblx0cmV0dXJuIG5ldyBNZXRob2REZWZpbml0aW9uKGtleSwgdmFsdWUsIGtpbmQsIGlzU3RhdGljLCBjb21wdXRlZClcbn1cblxuLyoqIFRyYW5zcGlsZSBtZXRob2QgdG8gYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlTWV0aG9kVG9Qcm9wZXJ0eShfKSB7XG5cdGNvbnN0IHtjb21wdXRlZCwgaXNJbXBsLCBrZXksIGtpbmQsIHZhbHVlfSA9IG1ldGhvZFBhcmFtcyhfLCAnaW5pdCcpXG5cdHJldHVybiBuZXcgUHJvcGVydHkoa2luZCwga2V5LCB2YWx1ZSwgY29tcHV0ZWQsIGlzSW1wbClcbn1cblxuZnVuY3Rpb24gbWV0aG9kUGFyYW1zKF8sIGRlZmF1bHRLaW5kKSB7XG5cdGNvbnN0IGNvbXB1dGVkID0gISh0eXBlb2YgXy5zeW1ib2wgPT09ICdzdHJpbmcnKVxuXHRjb25zdCBpc0ltcGwgPSBfIGluc3RhbmNlb2YgTWV0aG9kSW1wbFxuXHRyZXR1cm4ge1xuXHRcdGNvbXB1dGVkLFxuXHRcdGlzSW1wbCxcblx0XHRrZXk6IGNvbXB1dGVkID9cblx0XHRcdF8uc3ltYm9sIGluc3RhbmNlb2YgUXVvdGVBYnN0cmFjdCA/IHQwKF8uc3ltYm9sKSA6IG1zQ2FsbCgnc3ltYm9sJywgdDAoXy5zeW1ib2wpKSA6XG5cdFx0XHRwcm9wZXJ0eUlkT3JMaXRlcmFsKF8uc3ltYm9sKSxcblx0XHRraW5kOiBpc0ltcGwgPyBkZWZhdWx0S2luZCA6IF8gaW5zdGFuY2VvZiBNZXRob2RHZXR0ZXIgPyAnZ2V0JyA6ICdzZXQnLFxuXHRcdHZhbHVlOiBpc0ltcGwgPyB0MChfLmZ1bikgOiBnZXRTZXRGdW4oXylcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTZXRGdW4oXykge1xuXHRjb25zdCBhcmdzID0gXyBpbnN0YW5jZW9mIE1ldGhvZEdldHRlciA/IFtdIDogW0lkRm9jdXNdXG5cdHJldHVybiBuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIGFyZ3MsIHQxKF8uYmxvY2ssIERlY2xhcmVMZXhpY2FsVGhpcykpXG59XG4iXX0=