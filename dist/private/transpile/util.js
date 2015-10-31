'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/mangle-identifier', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './ms-call'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/mangle-identifier'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./ms-call'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.mangleIdentifier, global.util, global.context, global.MsAst, global.util, global.astConstants, global.msCall);
		global.util = mod.exports;
	}
})(this, function (exports, _ast, _mangleIdentifier, _util, _context, _MsAst, _util2, _astConstants, _msCall) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.t0 = t0;
	exports.t1 = t1;
	exports.t2 = t2;
	exports.t3 = t3;
	exports.tLines = tLines;
	exports.accessLocalDeclare = accessLocalDeclare;
	exports.declare = declare;
	exports.idForDeclareCached = idForDeclareCached;
	exports.opTypeCheckForLocalDeclare = opTypeCheckForLocalDeclare;
	exports.throwErrorFromString = throwErrorFromString;
	exports.makeDeclarator = makeDeclarator;
	exports.maybeWrapInCheckContains = maybeWrapInCheckContains;
	exports.getMember = getMember;
	exports.doThrow = doThrow;
	exports.memberStringOrVal = memberStringOrVal;

	var _mangleIdentifier2 = _interopRequireDefault(_mangleIdentifier);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function t0(expr) {
		return (0, _util.loc)(expr.transpile(), expr.loc);
	}

	function t1(expr, arg) {
		return (0, _util.loc)(expr.transpile(arg), expr.loc);
	}

	function t2(expr, arg, arg2) {
		return (0, _util.loc)(expr.transpile(arg, arg2));
	}

	function t3(expr, arg, arg2, arg3) {
		return (0, _util.loc)(expr.transpile(arg, arg2, arg3), expr.loc);
	}

	function tLines(exprs) {
		const out = [];

		for (const expr of exprs) {
			const ast = expr.transpile();
			if (ast instanceof Array) for (const _ of ast) out.push((0, _util.toStatement)(_));else out.push((0, _util.loc)((0, _util.toStatement)(ast), expr.loc));
		}

		return out;
	}

	function accessLocalDeclare(localDeclare) {
		const id = idForDeclareCached(localDeclare);
		return localDeclare.isLazy() ? (0, _msCall.msUnlazy)(id) : new _ast.Identifier(id.name);
	}

	function declare(localDeclare, val) {
		return new _ast.VariableDeclaration('const', [new _ast.VariableDeclarator(idForDeclareCached(localDeclare), val)]);
	}

	const declareToId = new WeakMap();

	function idForDeclareCached(localDeclare) {
		let _ = declareToId.get(localDeclare);

		if (_ === undefined) {
			_ = new _ast.Identifier((0, _mangleIdentifier2.default)(localDeclare.name));
			declareToId.set(localDeclare, _);
		}

		return _;
	}

	function opTypeCheckForLocalDeclare(localDeclare) {
		return (0, _util2.opIf)(!localDeclare.isLazy(), () => (0, _util2.opMap)(localDeclare.opType, type => new _ast.ExpressionStatement((0, _msCall.msCheckContains)(t0(type), accessLocalDeclare(localDeclare), new _ast.Literal(localDeclare.name)))));
	}

	function throwErrorFromString(message) {
		return new _ast.ThrowStatement(new _ast.NewExpression(new _ast.Identifier('Error'), [new _ast.Literal(message)]));
	}

	function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
		const name = assignee.name;
		const opType = assignee.opType;
		const isLazy = assignee.isLazy();
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name);
		const val = isLazy && !valueIsAlreadyLazy ? (0, _msCall.lazyWrap)(value) : value;
		(0, _util2.assert)(isLazy || !valueIsAlreadyLazy);
		return new _ast.VariableDeclarator(idForDeclareCached(assignee), val);
	}

	function maybeWrapInCheckContains(ast, opType, name) {
		return _context.options.includeChecks() && opType !== null ? (0, _msCall.msCheckContains)(t0(opType), ast, new _ast.Literal(name)) : ast;
	}

	function getMember(astObject, gotName, isLazy, isModule) {
		return isLazy ? (0, _msCall.msLazyGet)(astObject, new _ast.Literal(gotName)) : isModule && _context.options.includeChecks() ? (0, _msCall.msGet)(astObject, new _ast.Literal(gotName)) : (0, _util.member)(astObject, gotName);
	}

	function doThrow(thrown) {
		return new _ast.ThrowStatement(thrown instanceof _MsAst.QuoteAbstract ? new _ast.NewExpression(_astConstants.GlobalError, [t0(thrown)]) : t0(thrown));
	}

	function memberStringOrVal(object, memberName) {
		return typeof memberName === 'string' ? (0, _util.member)(object, memberName) : new _ast.MemberExpression(object, t0(memberName));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVdnQixFQUFFLEdBQUYsRUFBRTtTQUdGLEVBQUUsR0FBRixFQUFFO1NBR0YsRUFBRSxHQUFGLEVBQUU7U0FHRixFQUFFLEdBQUYsRUFBRTtTQUdGLE1BQU0sR0FBTixNQUFNO1NBY04sa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixPQUFPLEdBQVAsT0FBTztTQU1QLGtCQUFrQixHQUFsQixrQkFBa0I7U0FTbEIsMEJBQTBCLEdBQTFCLDBCQUEwQjtTQVUxQixvQkFBb0IsR0FBcEIsb0JBQW9CO1NBTXBCLGNBQWMsR0FBZCxjQUFjO1NBV2Qsd0JBQXdCLEdBQXhCLHdCQUF3QjtTQU14QixTQUFTLEdBQVQsU0FBUztTQVFULE9BQU8sR0FBUCxPQUFPO1NBTVAsaUJBQWlCLEdBQWpCLGlCQUFpQjs7Ozs7O1VBN0ZqQixFQUFFOzs7O1VBR0YsRUFBRTs7OztVQUdGLEVBQUU7Ozs7VUFHRixFQUFFOzs7O1VBR0YsTUFBTTs7Ozs7Ozs7Ozs7VUFjTixrQkFBa0I7Ozs7O1VBS2xCLE9BQU87Ozs7OztVQU1QLGtCQUFrQjs7Ozs7Ozs7Ozs7VUFTbEIsMEJBQTBCOzs7O1VBVTFCLG9CQUFvQjs7OztVQU1wQixjQUFjOzs7Ozs7Ozs7O1VBV2Qsd0JBQXdCOzs7O1VBTXhCLFNBQVM7Ozs7VUFRVCxPQUFPOzs7O1VBTVAsaUJBQWlCIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V4cHJlc3Npb25TdGF0ZW1lbnQsIElkZW50aWZpZXIsIExpdGVyYWwsIE1lbWJlckV4cHJlc3Npb24sIE5ld0V4cHJlc3Npb24sIFRocm93U3RhdGVtZW50LFxuXHRWYXJpYWJsZURlY2xhcmF0b3IsIFZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IG1hbmdsZUlkZW50aWZpZXIgZnJvbSAnZXNhc3QvZGlzdC9tYW5nbGUtaWRlbnRpZmllcidcbmltcG9ydCB7bG9jLCB0b1N0YXRlbWVudH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7UXVvdGVBYnN0cmFjdH0gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge2Fzc2VydCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0dsb2JhbEVycm9yfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge2xhenlXcmFwLCBtc0NoZWNrQ29udGFpbnMsIG1zR2V0LCBtc0xhenlHZXQsIG1zVW5sYXp5fSBmcm9tICcuL21zLWNhbGwnXG5cbmV4cG9ydCBmdW5jdGlvbiB0MChleHByKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDEoZXhwciwgYXJnKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDIoZXhwciwgYXJnLCBhcmcyKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0MyhleHByLCBhcmcsIGFyZzIsIGFyZzMpIHtcblx0cmV0dXJuIGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYylcbn1cbmV4cG9ydCBmdW5jdGlvbiB0TGluZXMoZXhwcnMpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdC8vIElnbm9yZSBwcm9kdWNlcyAwIHN0YXRlbWVudHMgYW5kIFJlZ2lvbiBwcm9kdWNlcyBtYW55LlxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0ZWxzZVxuXHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0fVxuXHRyZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY2Nlc3NMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdGNvbnN0IGlkID0gaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSlcblx0cmV0dXJuIGxvY2FsRGVjbGFyZS5pc0xhenkoKSA/IG1zVW5sYXp5KGlkKSA6IG5ldyBJZGVudGlmaWVyKGlkLm5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNsYXJlKGxvY2FsRGVjbGFyZSwgdmFsKSB7XG5cdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdGlvbignY29uc3QnLFxuXHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChsb2NhbERlY2xhcmUpLCB2YWwpXSlcbn1cblxuY29uc3QgZGVjbGFyZVRvSWQgPSBuZXcgV2Vha01hcCgpXG5leHBvcnQgZnVuY3Rpb24gaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSkge1xuXHRsZXQgXyA9IGRlY2xhcmVUb0lkLmdldChsb2NhbERlY2xhcmUpXG5cdGlmIChfID09PSB1bmRlZmluZWQpIHtcblx0XHRfID0gbmV3IElkZW50aWZpZXIobWFuZ2xlSWRlbnRpZmllcihsb2NhbERlY2xhcmUubmFtZSkpXG5cdFx0ZGVjbGFyZVRvSWQuc2V0KGxvY2FsRGVjbGFyZSwgXylcblx0fVxuXHRyZXR1cm4gX1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdC8vIFRPRE86IFdheSB0byB0eXBlY2hlY2sgbGF6aWVzXG5cdHJldHVybiBvcElmKCFsb2NhbERlY2xhcmUuaXNMYXp5KCksICgpID0+XG5cdFx0b3BNYXAobG9jYWxEZWNsYXJlLm9wVHlwZSwgdHlwZSA9PlxuXHRcdFx0bmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDaGVja0NvbnRhaW5zKFxuXHRcdFx0XHR0MCh0eXBlKSxcblx0XHRcdFx0YWNjZXNzTG9jYWxEZWNsYXJlKGxvY2FsRGVjbGFyZSksXG5cdFx0XHRcdG5ldyBMaXRlcmFsKGxvY2FsRGVjbGFyZS5uYW1lKSkpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3JGcm9tU3RyaW5nKG1lc3NhZ2UpIHtcblx0Ly8gVE9ETzpFUzYgU2hvdWxkIGJlIGFibGUgdG8gdXNlIElkRXJyb3Jcblx0cmV0dXJuIG5ldyBUaHJvd1N0YXRlbWVudChcblx0XHRuZXcgTmV3RXhwcmVzc2lvbihuZXcgSWRlbnRpZmllcignRXJyb3InKSwgW25ldyBMaXRlcmFsKG1lc3NhZ2UpXSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGVjbGFyYXRvcihhc3NpZ25lZSwgdmFsdWUsIHZhbHVlSXNBbHJlYWR5TGF6eSkge1xuXHRjb25zdCB7bmFtZSwgb3BUeXBlfSA9IGFzc2lnbmVlXG5cdGNvbnN0IGlzTGF6eSA9IGFzc2lnbmVlLmlzTGF6eSgpXG5cdC8vIFRPRE86IGFzc2VydChhc3NpZ25lZS5vcFR5cGUgPT09IG51bGwpXG5cdC8vIG9yIFRPRE86IEFsbG93IHR5cGUgY2hlY2sgb24gbGF6eSB2YWx1ZT9cblx0dmFsdWUgPSBpc0xhenkgPyB2YWx1ZSA6IG1heWJlV3JhcEluQ2hlY2tDb250YWlucyh2YWx1ZSwgb3BUeXBlLCBuYW1lKVxuXHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIXZhbHVlSXNBbHJlYWR5TGF6eSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdGFzc2VydChpc0xhenkgfHwgIXZhbHVlSXNBbHJlYWR5TGF6eSlcblx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGFzc2lnbmVlKSwgdmFsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVXcmFwSW5DaGVja0NvbnRhaW5zKGFzdCwgb3BUeXBlLCBuYW1lKSB7XG5cdHJldHVybiBvcHRpb25zLmluY2x1ZGVDaGVja3MoKSAmJiBvcFR5cGUgIT09IG51bGwgP1xuXHRcdG1zQ2hlY2tDb250YWlucyh0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0YXN0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lLCBpc0xhenksIGlzTW9kdWxlKSB7XG5cdHJldHVybiBpc0xhenkgP1xuXHRcdG1zTGF6eUdldChhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zR2V0KGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRtZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9UaHJvdyh0aHJvd24pIHtcblx0cmV0dXJuIG5ldyBUaHJvd1N0YXRlbWVudCh0aHJvd24gaW5zdGFuY2VvZiBRdW90ZUFic3RyYWN0ID9cblx0XHRuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW3QwKHRocm93bildKSA6XG5cdFx0dDAodGhyb3duKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lbWJlclN0cmluZ09yVmFsKG9iamVjdCwgbWVtYmVyTmFtZSkge1xuXHRyZXR1cm4gdHlwZW9mIG1lbWJlck5hbWUgPT09ICdzdHJpbmcnID9cblx0XHRtZW1iZXIob2JqZWN0LCBtZW1iZXJOYW1lKSA6XG5cdFx0bmV3IE1lbWJlckV4cHJlc3Npb24ob2JqZWN0LCB0MChtZW1iZXJOYW1lKSlcbn1cbiJdfQ==