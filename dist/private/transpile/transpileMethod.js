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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ0cmFuc3BpbGVNZXRob2QuanMiLCJzb3VyY2VzQ29udGVudCI6W119