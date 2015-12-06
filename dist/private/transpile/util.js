'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', 'esast/dist/ast', 'esast/dist/mangle-identifier', 'esast/dist/util', '../context', '../MsAst', '../util', './ast-constants', './context'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('esast/dist/ast'), require('esast/dist/mangle-identifier'), require('esast/dist/util'), require('../context'), require('../MsAst'), require('../util'), require('./ast-constants'), require('./context'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.ast, global.mangleIdentifier, global.util, global.context, global.MsAst, global.util, global.astConstants, global.context);
		global.util = mod.exports;
	}
})(this, function (exports, _ast, _mangleIdentifier, _util, _context, _MsAst, _util2, _astConstants, _context2) {
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
	exports.maybeWrapInCheckInstance = maybeWrapInCheckInstance;
	exports.doThrow = doThrow;
	exports.transpileName = transpileName;
	exports.memberStringOrVal = memberStringOrVal;
	exports.lazyWrap = lazyWrap;
	exports.msCall = msCall;
	exports.msMember = msMember;
	exports.makeDestructureDeclarators = makeDestructureDeclarators;
	exports.blockWrap = blockWrap;
	exports.callFocusFun = callFocusFun;
	exports.blockWrapIfBlock = blockWrapIfBlock;
	exports.blockWrapIfVal = blockWrapIfVal;
	exports.focusFun = focusFun;
	exports.plainLet = plainLet;

	var _mangleIdentifier2 = _interopRequireDefault(_mangleIdentifier);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

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
		return localDeclare.isLazy() ? msCall('unlazy', id) : new _ast.Identifier(id.name);
	}

	function declare(localDeclare, val) {
		return new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(idForDeclareCached(localDeclare), val)]);
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
		return (0, _util2.opIf)(!localDeclare.isLazy(), () => (0, _util2.opMap)(localDeclare.opType, type => new _ast.ExpressionStatement(msCall('checkInstance', t0(type), accessLocalDeclare(localDeclare), new _ast.Literal(localDeclare.name)))));
	}

	function throwErrorFromString(message) {
		return new _ast.ThrowStatement(new _ast.NewExpression(new _ast.Identifier('Error'), [new _ast.Literal(message)]));
	}

	function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
		const name = assignee.name;
		const opType = assignee.opType;
		const isLazy = assignee.isLazy();
		value = isLazy ? value : maybeWrapInCheckInstance(value, opType, name);
		const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value;
		(0, _util2.assert)(isLazy || !valueIsAlreadyLazy);
		return new _ast.VariableDeclarator(idForDeclareCached(assignee), val);
	}

	function maybeWrapInCheckInstance(ast, opType, name) {
		return _context.options.includeChecks() && opType !== null ? msCall('checkInstance', t0(opType), ast, new _ast.Literal(name)) : ast;
	}

	function doThrow(thrown) {
		return new _ast.ThrowStatement(thrown instanceof _MsAst.QuoteAbstract ? new _ast.NewExpression(_astConstants.GlobalError, [t0(thrown)]) : t0(thrown));
	}

	function transpileName(name) {
		return typeof name === 'string' ? new _ast.Literal(name) : t0(name);
	}

	function memberStringOrVal(object, memberName) {
		return typeof memberName === 'string' ? (0, _util.member)(object, memberName) : new _ast.MemberExpression(object, t0(memberName));
	}

	function lazyWrap(value) {
		return msCall('lazy', new _ast.ArrowFunctionExpression([], value));
	}

	const IdMs = new _ast.Identifier('_ms');

	function msCall(name) {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		return new _ast.CallExpression((0, _util.member)(IdMs, name), args);
	}

	function msMember(name) {
		return (0, _util.member)(IdMs, name);
	}

	function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
		const id = (0, _context2.getDestructuredId)();
		const destructuredName = `_$${ id }`;
		const idDestructured = new _ast.Identifier(destructuredName);
		const declarators = assignees.map(assignee => {
			const get = getMember(idDestructured, assignee.name, isLazy, isModule);
			return makeDeclarator(assignee, get, isLazy);
		});
		const val = isLazy && !isModule ? lazyWrap(value) : value;
		return (0, _util2.cat)(new _ast.VariableDeclarator(idDestructured, val), declarators);
	}

	function getMember(astObject, gotName, isLazy, isModule) {
		return isLazy ? msCall('lazyProp', astObject, new _ast.Literal(gotName)) : isModule && _context.options.includeChecks() ? msCall('get', astObject, new _ast.Literal(gotName)) : (0, _util.member)(astObject, gotName);
	}

	function blockWrap(block) {
		const thunk = _context2.funKind === _MsAst.Funs.Plain ? new _ast.ArrowFunctionExpression([], block) : new _ast.FunctionExpression(null, [], block, true);
		return callPreservingFunKind(new _ast.CallExpression(thunk, []));
	}

	function callFocusFun(value, calledOn) {
		const fun = _context2.funKind === _MsAst.Funs.Plain ? new _ast.ArrowFunctionExpression([_astConstants.IdFocus], value) : new _ast.FunctionExpression(null, [_astConstants.IdFocus], new _ast.BlockStatement([new _ast.ReturnStatement(value)]), true);
		return callPreservingFunKind(new _ast.CallExpression(fun, [calledOn]));
	}

	function callPreservingFunKind(call) {
		return _context2.funKind === _MsAst.Funs.Plain ? call : new _ast.YieldExpression(call, true);
	}

	function blockWrapIfBlock(value) {
		const ast = t0(value);
		return value instanceof _MsAst.Block ? blockWrap(ast) : ast;
	}

	function blockWrapIfVal(ast, statement) {
		return _context2.verifyResults.isStatement(ast) ? statement : blockWrap(new _ast.BlockStatement((0, _util2.toArray)(statement)));
	}

	function focusFun(value) {
		return new _ast.ArrowFunctionExpression([_astConstants.IdFocus], value);
	}

	function plainLet(identifier, value) {
		return new _ast.VariableDeclaration('let', [new _ast.VariableDeclarator(identifier, value)]);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVlnQixFQUFFLEdBQUYsRUFBRTtTQUdGLEVBQUUsR0FBRixFQUFFO1NBR0YsRUFBRSxHQUFGLEVBQUU7U0FHRixFQUFFLEdBQUYsRUFBRTtTQUdGLE1BQU0sR0FBTixNQUFNO1NBY04sa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixPQUFPLEdBQVAsT0FBTztTQU1QLGtCQUFrQixHQUFsQixrQkFBa0I7U0FTbEIsMEJBQTBCLEdBQTFCLDBCQUEwQjtTQVcxQixvQkFBb0IsR0FBcEIsb0JBQW9CO1NBTXBCLGNBQWMsR0FBZCxjQUFjO1NBV2Qsd0JBQXdCLEdBQXhCLHdCQUF3QjtTQU14QixPQUFPLEdBQVAsT0FBTztTQU1QLGFBQWEsR0FBYixhQUFhO1NBSWIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQU1qQixRQUFRLEdBQVIsUUFBUTtTQUtSLE1BQU0sR0FBTixNQUFNO1NBSU4sUUFBUSxHQUFSLFFBQVE7U0FJUiwwQkFBMEIsR0FBMUIsMEJBQTBCO1NBcUIxQixTQUFTLEdBQVQsU0FBUztTQVFULFlBQVksR0FBWixZQUFZO1NBa0JaLGdCQUFnQixHQUFoQixnQkFBZ0I7U0FNaEIsY0FBYyxHQUFkLGNBQWM7U0FNZCxRQUFRLEdBQVIsUUFBUTtTQUlSLFFBQVEsR0FBUixRQUFROzs7Ozs7Ozs7O1VBNUtSLEVBQUU7Ozs7VUFHRixFQUFFOzs7O1VBR0YsRUFBRTs7OztVQUdGLEVBQUU7Ozs7VUFHRixNQUFNOzs7Ozs7Ozs7OztVQWNOLGtCQUFrQjs7Ozs7VUFLbEIsT0FBTzs7Ozs7O1VBTVAsa0JBQWtCOzs7Ozs7Ozs7OztVQVNsQiwwQkFBMEI7Ozs7VUFXMUIsb0JBQW9COzs7O1VBTXBCLGNBQWM7Ozs7Ozs7Ozs7VUFXZCx3QkFBd0I7Ozs7VUFNeEIsT0FBTzs7OztVQU1QLGFBQWE7Ozs7VUFJYixpQkFBaUI7Ozs7VUFNakIsUUFBUTs7Ozs7O1VBS1IsTUFBTTtvQ0FBVSxJQUFJO0FBQUosT0FBSTs7Ozs7O1VBSXBCLFFBQVE7Ozs7VUFJUiwwQkFBMEI7Ozs7Ozs7Ozs7Ozs7Ozs7VUFxQjFCLFNBQVM7Ozs7O1VBUVQsWUFBWTs7Ozs7Ozs7O1VBa0JaLGdCQUFnQjs7Ozs7VUFNaEIsY0FBYzs7OztVQU1kLFFBQVE7Ozs7VUFJUixRQUFRIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Fycm93RnVuY3Rpb25FeHByZXNzaW9uLCBCbG9ja1N0YXRlbWVudCwgQ2FsbEV4cHJlc3Npb24sIEV4cHJlc3Npb25TdGF0ZW1lbnQsXG5cdEZ1bmN0aW9uRXhwcmVzc2lvbiwgSWRlbnRpZmllciwgTGl0ZXJhbCwgTWVtYmVyRXhwcmVzc2lvbiwgTmV3RXhwcmVzc2lvbiwgUmV0dXJuU3RhdGVtZW50LFxuXHRUaHJvd1N0YXRlbWVudCwgVmFyaWFibGVEZWNsYXJhdG9yLCBWYXJpYWJsZURlY2xhcmF0aW9uLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IG1hbmdsZUlkZW50aWZpZXIgZnJvbSAnZXNhc3QvZGlzdC9tYW5nbGUtaWRlbnRpZmllcidcbmltcG9ydCB7bG9jLCB0b1N0YXRlbWVudH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QmxvY2ssIEZ1bnMsIFF1b3RlQWJzdHJhY3R9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgb3BJZiwgb3BNYXAsIHRvQXJyYXl9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0lkRm9jdXMsIEdsb2JhbEVycm9yfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge2Z1bktpbmQsIGdldERlc3RydWN0dXJlZElkLCB2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5cbmV4cG9ydCBmdW5jdGlvbiB0MChleHByKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDEoZXhwciwgYXJnKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDIoZXhwciwgYXJnLCBhcmcyKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0MyhleHByLCBhcmcsIGFyZzIsIGFyZzMpIHtcblx0cmV0dXJuIGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYylcbn1cbmV4cG9ydCBmdW5jdGlvbiB0TGluZXMoZXhwcnMpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdC8vIElnbm9yZSBwcm9kdWNlcyAwIHN0YXRlbWVudHMgYW5kIFJlZ2lvbiBwcm9kdWNlcyBtYW55LlxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0ZWxzZVxuXHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0fVxuXHRyZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY2Nlc3NMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdGNvbnN0IGlkID0gaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSlcblx0cmV0dXJuIGxvY2FsRGVjbGFyZS5pc0xhenkoKSA/IG1zQ2FsbCgndW5sYXp5JywgaWQpIDogbmV3IElkZW50aWZpZXIoaWQubmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY2xhcmUobG9jYWxEZWNsYXJlLCB2YWwpIHtcblx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdsZXQnLFxuXHRcdFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChsb2NhbERlY2xhcmUpLCB2YWwpXSlcbn1cblxuY29uc3QgZGVjbGFyZVRvSWQgPSBuZXcgV2Vha01hcCgpXG5leHBvcnQgZnVuY3Rpb24gaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSkge1xuXHRsZXQgXyA9IGRlY2xhcmVUb0lkLmdldChsb2NhbERlY2xhcmUpXG5cdGlmIChfID09PSB1bmRlZmluZWQpIHtcblx0XHRfID0gbmV3IElkZW50aWZpZXIobWFuZ2xlSWRlbnRpZmllcihsb2NhbERlY2xhcmUubmFtZSkpXG5cdFx0ZGVjbGFyZVRvSWQuc2V0KGxvY2FsRGVjbGFyZSwgXylcblx0fVxuXHRyZXR1cm4gX1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BUeXBlQ2hlY2tGb3JMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdC8vIFRPRE86IFdheSB0byB0eXBlY2hlY2sgbGF6aWVzXG5cdHJldHVybiBvcElmKCFsb2NhbERlY2xhcmUuaXNMYXp5KCksICgpID0+XG5cdFx0b3BNYXAobG9jYWxEZWNsYXJlLm9wVHlwZSwgdHlwZSA9PlxuXHRcdFx0bmV3IEV4cHJlc3Npb25TdGF0ZW1lbnQobXNDYWxsKFxuXHRcdFx0XHQnY2hlY2tJbnN0YW5jZScsXG5cdFx0XHRcdHQwKHR5cGUpLFxuXHRcdFx0XHRhY2Nlc3NMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSxcblx0XHRcdFx0bmV3IExpdGVyYWwobG9jYWxEZWNsYXJlLm5hbWUpKSkpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvckZyb21TdHJpbmcobWVzc2FnZSkge1xuXHQvLyBUT0RPOkVTNiBTaG91bGQgYmUgYWJsZSB0byB1c2UgSWRFcnJvclxuXHRyZXR1cm4gbmV3IFRocm93U3RhdGVtZW50KFxuXHRcdG5ldyBOZXdFeHByZXNzaW9uKG5ldyBJZGVudGlmaWVyKCdFcnJvcicpLCBbbmV3IExpdGVyYWwobWVzc2FnZSldKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VEZWNsYXJhdG9yKGFzc2lnbmVlLCB2YWx1ZSwgdmFsdWVJc0FscmVhZHlMYXp5KSB7XG5cdGNvbnN0IHtuYW1lLCBvcFR5cGV9ID0gYXNzaWduZWVcblx0Y29uc3QgaXNMYXp5ID0gYXNzaWduZWUuaXNMYXp5KClcblx0Ly8gVE9ETzogYXNzZXJ0KGFzc2lnbmVlLm9wVHlwZSA9PT0gbnVsbClcblx0Ly8gb3IgVE9ETzogQWxsb3cgdHlwZSBjaGVjayBvbiBsYXp5IHZhbHVlP1xuXHR2YWx1ZSA9IGlzTGF6eSA/IHZhbHVlIDogbWF5YmVXcmFwSW5DaGVja0luc3RhbmNlKHZhbHVlLCBvcFR5cGUsIG5hbWUpXG5cdGNvbnN0IHZhbCA9IGlzTGF6eSAmJiAhdmFsdWVJc0FscmVhZHlMYXp5ID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0YXNzZXJ0KGlzTGF6eSB8fCAhdmFsdWVJc0FscmVhZHlMYXp5KVxuXHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZEZvckRlY2xhcmVDYWNoZWQoYXNzaWduZWUpLCB2YWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZVdyYXBJbkNoZWNrSW5zdGFuY2UoYXN0LCBvcFR5cGUsIG5hbWUpIHtcblx0cmV0dXJuIG9wdGlvbnMuaW5jbHVkZUNoZWNrcygpICYmIG9wVHlwZSAhPT0gbnVsbCA/XG5cdFx0bXNDYWxsKCdjaGVja0luc3RhbmNlJywgdDAob3BUeXBlKSwgYXN0LCBuZXcgTGl0ZXJhbChuYW1lKSkgOlxuXHRcdGFzdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9UaHJvdyh0aHJvd24pIHtcblx0cmV0dXJuIG5ldyBUaHJvd1N0YXRlbWVudCh0aHJvd24gaW5zdGFuY2VvZiBRdW90ZUFic3RyYWN0ID9cblx0XHRuZXcgTmV3RXhwcmVzc2lvbihHbG9iYWxFcnJvciwgW3QwKHRocm93bildKSA6XG5cdFx0dDAodGhyb3duKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcGlsZU5hbWUobmFtZSkge1xuXHRyZXR1cm4gdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnID8gbmV3IExpdGVyYWwobmFtZSkgOiB0MChuYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVtYmVyU3RyaW5nT3JWYWwob2JqZWN0LCBtZW1iZXJOYW1lKSB7XG5cdHJldHVybiB0eXBlb2YgbWVtYmVyTmFtZSA9PT0gJ3N0cmluZycgP1xuXHRcdG1lbWJlcihvYmplY3QsIG1lbWJlck5hbWUpIDpcblx0XHRuZXcgTWVtYmVyRXhwcmVzc2lvbihvYmplY3QsIHQwKG1lbWJlck5hbWUpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGF6eVdyYXAodmFsdWUpIHtcblx0cmV0dXJuIG1zQ2FsbCgnbGF6eScsIG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbXSwgdmFsdWUpKVxufVxuXG5jb25zdCBJZE1zID0gbmV3IElkZW50aWZpZXIoJ19tcycpXG5leHBvcnQgZnVuY3Rpb24gbXNDYWxsKG5hbWUsIC4uLmFyZ3MpIHtcblx0cmV0dXJuIG5ldyBDYWxsRXhwcmVzc2lvbihtZW1iZXIoSWRNcywgbmFtZSksIGFyZ3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc01lbWJlcihuYW1lKSB7XG5cdHJldHVybiBtZW1iZXIoSWRNcywgbmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VEZXN0cnVjdHVyZURlY2xhcmF0b3JzKGFzc2lnbmVlcywgaXNMYXp5LCB2YWx1ZSwgaXNNb2R1bGUpIHtcblx0Y29uc3QgaWQgPSBnZXREZXN0cnVjdHVyZWRJZCgpXG5cdGNvbnN0IGRlc3RydWN0dXJlZE5hbWUgPSBgXyQke2lkfWBcblx0Y29uc3QgaWREZXN0cnVjdHVyZWQgPSBuZXcgSWRlbnRpZmllcihkZXN0cnVjdHVyZWROYW1lKVxuXHRjb25zdCBkZWNsYXJhdG9ycyA9IGFzc2lnbmVlcy5tYXAoYXNzaWduZWUgPT4ge1xuXHRcdGNvbnN0IGdldCA9IGdldE1lbWJlcihpZERlc3RydWN0dXJlZCwgYXNzaWduZWUubmFtZSwgaXNMYXp5LCBpc01vZHVsZSlcblx0XHRyZXR1cm4gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIGdldCwgaXNMYXp5KVxuXHR9KVxuXHQvLyBHZXR0aW5nIGxhenkgbW9kdWxlIGlzIGRvbmUgYnkgbXMubGF6eUdldE1vZHVsZS5cblx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICFpc01vZHVsZSA/IGxhenlXcmFwKHZhbHVlKSA6IHZhbHVlXG5cdHJldHVybiBjYXQobmV3IFZhcmlhYmxlRGVjbGFyYXRvcihpZERlc3RydWN0dXJlZCwgdmFsKSwgZGVjbGFyYXRvcnMpXG59XG5mdW5jdGlvbiBnZXRNZW1iZXIoYXN0T2JqZWN0LCBnb3ROYW1lLCBpc0xhenksIGlzTW9kdWxlKSB7XG5cdHJldHVybiBpc0xhenkgP1xuXHRcdG1zQ2FsbCgnbGF6eVByb3AnLCBhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0aXNNb2R1bGUgJiYgb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgP1xuXHRcdG1zQ2FsbCgnZ2V0JywgYXN0T2JqZWN0LCBuZXcgTGl0ZXJhbChnb3ROYW1lKSkgOlxuXHRcdG1lbWJlcihhc3RPYmplY3QsIGdvdE5hbWUpXG59XG5cbi8qKiBXcmFwcyBhIGJsb2NrICh3aXRoIGByZXR1cm5gIHN0YXRlbWVudHMgaW4gaXQpIGluIGFuIElJRkUuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tXcmFwKGJsb2NrKSB7XG5cdGNvbnN0IHRodW5rID0gZnVuS2luZCA9PT0gRnVucy5QbGFpbiA/XG5cdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtdLCBibG9jaykgOlxuXHRcdG5ldyBGdW5jdGlvbkV4cHJlc3Npb24obnVsbCwgW10sIGJsb2NrLCB0cnVlKVxuXHRyZXR1cm4gY2FsbFByZXNlcnZpbmdGdW5LaW5kKG5ldyBDYWxsRXhwcmVzc2lvbih0aHVuaywgW10pKVxufVxuXG4vKiogQ3JlYXRlIGEgZm9jdXMgZnVuIHJldHVybmluZyBgdmFsdWVgIGFuZCBjYWxsIGl0IG9uIGBjYWxsZWRPbmAsIHByZXNlcnZpbmcgZ2VuZXJhdG9yL2FzeW5jLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxGb2N1c0Z1bih2YWx1ZSwgY2FsbGVkT24pIHtcblx0Y29uc3QgZnVuID0gZnVuS2luZCA9PT0gRnVucy5QbGFpbiA/XG5cdFx0bmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgdmFsdWUpIDpcblx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKFxuXHRcdFx0bnVsbCwgW0lkRm9jdXNdLCBuZXcgQmxvY2tTdGF0ZW1lbnQoW25ldyBSZXR1cm5TdGF0ZW1lbnQodmFsdWUpXSksIHRydWUpXG5cdHJldHVybiBjYWxsUHJlc2VydmluZ0Z1bktpbmQobmV3IENhbGxFeHByZXNzaW9uKGZ1biwgW2NhbGxlZE9uXSkpXG59XG5cbi8qKlxuQ2FsbCBhIGZ1bmN0aW9uIGNyZWF0ZWQgYnkgYGJsb2NrV3JhcGAgb3IgYGNhbGxGb2N1c0Z1bmAuXG5UaGlzIGxvb2tzIGxpa2U6XG5cdEZ1bnMuUGxhaW46IGAoXyA9PiBmb28oXykpKDEpYC5cblx0RnVucy5HZW5lcmF0b3IsIEZ1bnMuQXN5bmM6IGB5aWVsZCogZnVuY3Rpb24qKF8pIHsgcmV0dXJuIGZvbyhfKSB9KDEpYFxuKi9cbmZ1bmN0aW9uIGNhbGxQcmVzZXJ2aW5nRnVuS2luZChjYWxsKSB7XG5cdHJldHVybiBmdW5LaW5kID09PSBGdW5zLlBsYWluID8gY2FsbCA6IG5ldyBZaWVsZEV4cHJlc3Npb24oY2FsbCwgdHJ1ZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrV3JhcElmQmxvY2sodmFsdWUpIHtcblx0Y29uc3QgYXN0ID0gdDAodmFsdWUpXG5cdHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEJsb2NrID8gYmxvY2tXcmFwKGFzdCkgOiBhc3Rcbn1cblxuLyoqIFdyYXBzIGEgc3RhdGVtZW50IGluIGFuIElJRkUgaWYgaXRzIE1zQXN0IGlzIGEgdmFsdWUuICovXG5leHBvcnQgZnVuY3Rpb24gYmxvY2tXcmFwSWZWYWwoYXN0LCBzdGF0ZW1lbnQpIHtcblx0cmV0dXJuIHZlcmlmeVJlc3VsdHMuaXNTdGF0ZW1lbnQoYXN0KSA/XG5cdFx0c3RhdGVtZW50IDpcblx0XHRibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KHRvQXJyYXkoc3RhdGVtZW50KSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0Z1bih2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtJZEZvY3VzXSwgdmFsdWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFpbkxldChpZGVudGlmaWVyLCB2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IFZhcmlhYmxlRGVjbGFyYXRpb24oJ2xldCcsIFtuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkZW50aWZpZXIsIHZhbHVlKV0pXG59XG4iXX0=