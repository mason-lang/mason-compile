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
	exports.maybeWrapInCheckContains = maybeWrapInCheckContains;
	exports.doThrow = doThrow;
	exports.transpileName = transpileName;
	exports.memberStringOrVal = memberStringOrVal;
	exports.lazyWrap = lazyWrap;
	exports.msCall = msCall;
	exports.msMember = msMember;
	exports.makeDestructureDeclarators = makeDestructureDeclarators;
	exports.blockWrap = blockWrap;
	exports.blockWrapIfBlock = blockWrapIfBlock;
	exports.blockWrapIfVal = blockWrapIfVal;

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
		return localDeclare.isLazy() ? msCall('unlazy', id) : new _ast.Identifier(id.name);
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
		return (0, _util2.opIf)(!localDeclare.isLazy(), () => (0, _util2.opMap)(localDeclare.opType, type => new _ast.ExpressionStatement(msCall('checkContains', t0(type), accessLocalDeclare(localDeclare), new _ast.Literal(localDeclare.name)))));
	}

	function throwErrorFromString(message) {
		return new _ast.ThrowStatement(new _ast.NewExpression(new _ast.Identifier('Error'), [new _ast.Literal(message)]));
	}

	function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
		const name = assignee.name;
		const opType = assignee.opType;
		const isLazy = assignee.isLazy();
		value = isLazy ? value : maybeWrapInCheckContains(value, opType, name);
		const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value;
		(0, _util2.assert)(isLazy || !valueIsAlreadyLazy);
		return new _ast.VariableDeclarator(idForDeclareCached(assignee), val);
	}

	function maybeWrapInCheckContains(ast, opType, name) {
		return _context.options.includeChecks() && opType !== null ? msCall('checkContains', t0(opType), ast, new _ast.Literal(name)) : ast;
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
		const thunk = _context2.isInGenerator ? new _ast.FunctionExpression(null, [], block, true) : new _ast.ArrowFunctionExpression([], block);
		const invoke = new _ast.CallExpression(thunk, []);
		return _context2.isInGenerator ? new _ast.YieldExpression(invoke, true) : invoke;
	}

	function blockWrapIfBlock(value) {
		const ast = t0(value);
		return value instanceof _MsAst.Block ? blockWrap(ast) : ast;
	}

	function blockWrapIfVal(ast, statement) {
		return _context2.verifyResults.isStatement(ast) ? statement : blockWrap(new _ast.BlockStatement([statement]));
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3RyYW5zcGlsZS91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQVlnQixFQUFFLEdBQUYsRUFBRTtTQUdGLEVBQUUsR0FBRixFQUFFO1NBR0YsRUFBRSxHQUFGLEVBQUU7U0FHRixFQUFFLEdBQUYsRUFBRTtTQUdGLE1BQU0sR0FBTixNQUFNO1NBY04sa0JBQWtCLEdBQWxCLGtCQUFrQjtTQUtsQixPQUFPLEdBQVAsT0FBTztTQU1QLGtCQUFrQixHQUFsQixrQkFBa0I7U0FTbEIsMEJBQTBCLEdBQTFCLDBCQUEwQjtTQVcxQixvQkFBb0IsR0FBcEIsb0JBQW9CO1NBTXBCLGNBQWMsR0FBZCxjQUFjO1NBV2Qsd0JBQXdCLEdBQXhCLHdCQUF3QjtTQU14QixPQUFPLEdBQVAsT0FBTztTQU1QLGFBQWEsR0FBYixhQUFhO1NBSWIsaUJBQWlCLEdBQWpCLGlCQUFpQjtTQU1qQixRQUFRLEdBQVIsUUFBUTtTQUtSLE1BQU0sR0FBTixNQUFNO1NBSU4sUUFBUSxHQUFSLFFBQVE7U0FJUiwwQkFBMEIsR0FBMUIsMEJBQTBCO1NBcUIxQixTQUFTLEdBQVQsU0FBUztTQVFULGdCQUFnQixHQUFoQixnQkFBZ0I7U0FNaEIsY0FBYyxHQUFkLGNBQWM7Ozs7OztVQWhKZCxFQUFFOzs7O1VBR0YsRUFBRTs7OztVQUdGLEVBQUU7Ozs7VUFHRixFQUFFOzs7O1VBR0YsTUFBTTs7Ozs7Ozs7Ozs7VUFjTixrQkFBa0I7Ozs7O1VBS2xCLE9BQU87Ozs7OztVQU1QLGtCQUFrQjs7Ozs7Ozs7Ozs7VUFTbEIsMEJBQTBCOzs7O1VBVzFCLG9CQUFvQjs7OztVQU1wQixjQUFjOzs7Ozs7Ozs7O1VBV2Qsd0JBQXdCOzs7O1VBTXhCLE9BQU87Ozs7VUFNUCxhQUFhOzs7O1VBSWIsaUJBQWlCOzs7O1VBTWpCLFFBQVE7Ozs7OztVQUtSLE1BQU07b0NBQVUsSUFBSTtBQUFKLE9BQUk7Ozs7OztVQUlwQixRQUFROzs7O1VBSVIsMEJBQTBCOzs7Ozs7Ozs7Ozs7Ozs7O1VBcUIxQixTQUFTOzs7Ozs7VUFRVCxnQkFBZ0I7Ozs7O1VBTWhCLGNBQWMiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJyb3dGdW5jdGlvbkV4cHJlc3Npb24sIEJsb2NrU3RhdGVtZW50LCBDYWxsRXhwcmVzc2lvbiwgRXhwcmVzc2lvblN0YXRlbWVudCxcblx0RnVuY3Rpb25FeHByZXNzaW9uLCBJZGVudGlmaWVyLCBMaXRlcmFsLCBNZW1iZXJFeHByZXNzaW9uLCBOZXdFeHByZXNzaW9uLCBUaHJvd1N0YXRlbWVudCxcblx0VmFyaWFibGVEZWNsYXJhdG9yLCBWYXJpYWJsZURlY2xhcmF0aW9uLCBZaWVsZEV4cHJlc3Npb259IGZyb20gJ2VzYXN0L2Rpc3QvYXN0J1xuaW1wb3J0IG1hbmdsZUlkZW50aWZpZXIgZnJvbSAnZXNhc3QvZGlzdC9tYW5nbGUtaWRlbnRpZmllcidcbmltcG9ydCB7bG9jLCB0b1N0YXRlbWVudH0gZnJvbSAnZXNhc3QvZGlzdC91dGlsJ1xuaW1wb3J0IHttZW1iZXJ9IGZyb20gJ2VzYXN0L2Rpc3QvdXRpbCdcbmltcG9ydCB7b3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7QmxvY2ssIFF1b3RlQWJzdHJhY3R9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHthc3NlcnQsIGNhdCwgb3BJZiwgb3BNYXB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge0dsb2JhbEVycm9yfSBmcm9tICcuL2FzdC1jb25zdGFudHMnXG5pbXBvcnQge2dldERlc3RydWN0dXJlZElkLCBpc0luR2VuZXJhdG9yLCB2ZXJpZnlSZXN1bHRzfSBmcm9tICcuL2NvbnRleHQnXG5cbmV4cG9ydCBmdW5jdGlvbiB0MChleHByKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDEoZXhwciwgYXJnKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnKSwgZXhwci5sb2MpXG59XG5leHBvcnQgZnVuY3Rpb24gdDIoZXhwciwgYXJnLCBhcmcyKSB7XG5cdHJldHVybiBsb2MoZXhwci50cmFuc3BpbGUoYXJnLCBhcmcyKSlcbn1cbmV4cG9ydCBmdW5jdGlvbiB0MyhleHByLCBhcmcsIGFyZzIsIGFyZzMpIHtcblx0cmV0dXJuIGxvYyhleHByLnRyYW5zcGlsZShhcmcsIGFyZzIsIGFyZzMpLCBleHByLmxvYylcbn1cbmV4cG9ydCBmdW5jdGlvbiB0TGluZXMoZXhwcnMpIHtcblx0Y29uc3Qgb3V0ID0gW11cblx0Zm9yIChjb25zdCBleHByIG9mIGV4cHJzKSB7XG5cdFx0Y29uc3QgYXN0ID0gZXhwci50cmFuc3BpbGUoKVxuXHRcdGlmIChhc3QgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdC8vIElnbm9yZSBwcm9kdWNlcyAwIHN0YXRlbWVudHMgYW5kIFJlZ2lvbiBwcm9kdWNlcyBtYW55LlxuXHRcdFx0Zm9yIChjb25zdCBfIG9mIGFzdClcblx0XHRcdFx0b3V0LnB1c2godG9TdGF0ZW1lbnQoXykpXG5cdFx0ZWxzZVxuXHRcdFx0b3V0LnB1c2gobG9jKHRvU3RhdGVtZW50KGFzdCksIGV4cHIubG9jKSlcblx0fVxuXHRyZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY2Nlc3NMb2NhbERlY2xhcmUobG9jYWxEZWNsYXJlKSB7XG5cdGNvbnN0IGlkID0gaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSlcblx0cmV0dXJuIGxvY2FsRGVjbGFyZS5pc0xhenkoKSA/IG1zQ2FsbCgndW5sYXp5JywgaWQpIDogbmV3IElkZW50aWZpZXIoaWQubmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY2xhcmUobG9jYWxEZWNsYXJlLCB2YWwpIHtcblx0cmV0dXJuIG5ldyBWYXJpYWJsZURlY2xhcmF0aW9uKCdjb25zdCcsXG5cdFx0W25ldyBWYXJpYWJsZURlY2xhcmF0b3IoaWRGb3JEZWNsYXJlQ2FjaGVkKGxvY2FsRGVjbGFyZSksIHZhbCldKVxufVxuXG5jb25zdCBkZWNsYXJlVG9JZCA9IG5ldyBXZWFrTWFwKClcbmV4cG9ydCBmdW5jdGlvbiBpZEZvckRlY2xhcmVDYWNoZWQobG9jYWxEZWNsYXJlKSB7XG5cdGxldCBfID0gZGVjbGFyZVRvSWQuZ2V0KGxvY2FsRGVjbGFyZSlcblx0aWYgKF8gPT09IHVuZGVmaW5lZCkge1xuXHRcdF8gPSBuZXcgSWRlbnRpZmllcihtYW5nbGVJZGVudGlmaWVyKGxvY2FsRGVjbGFyZS5uYW1lKSlcblx0XHRkZWNsYXJlVG9JZC5zZXQobG9jYWxEZWNsYXJlLCBfKVxuXHR9XG5cdHJldHVybiBfXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcFR5cGVDaGVja0ZvckxvY2FsRGVjbGFyZShsb2NhbERlY2xhcmUpIHtcblx0Ly8gVE9ETzogV2F5IHRvIHR5cGVjaGVjayBsYXppZXNcblx0cmV0dXJuIG9wSWYoIWxvY2FsRGVjbGFyZS5pc0xhenkoKSwgKCkgPT5cblx0XHRvcE1hcChsb2NhbERlY2xhcmUub3BUeXBlLCB0eXBlID0+XG5cdFx0XHRuZXcgRXhwcmVzc2lvblN0YXRlbWVudChtc0NhbGwoXG5cdFx0XHRcdCdjaGVja0NvbnRhaW5zJyxcblx0XHRcdFx0dDAodHlwZSksXG5cdFx0XHRcdGFjY2Vzc0xvY2FsRGVjbGFyZShsb2NhbERlY2xhcmUpLFxuXHRcdFx0XHRuZXcgTGl0ZXJhbChsb2NhbERlY2xhcmUubmFtZSkpKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yRnJvbVN0cmluZyhtZXNzYWdlKSB7XG5cdC8vIFRPRE86RVM2IFNob3VsZCBiZSBhYmxlIHRvIHVzZSBJZEVycm9yXG5cdHJldHVybiBuZXcgVGhyb3dTdGF0ZW1lbnQoXG5cdFx0bmV3IE5ld0V4cHJlc3Npb24obmV3IElkZW50aWZpZXIoJ0Vycm9yJyksIFtuZXcgTGl0ZXJhbChtZXNzYWdlKV0pKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlY2xhcmF0b3IoYXNzaWduZWUsIHZhbHVlLCB2YWx1ZUlzQWxyZWFkeUxhenkpIHtcblx0Y29uc3Qge25hbWUsIG9wVHlwZX0gPSBhc3NpZ25lZVxuXHRjb25zdCBpc0xhenkgPSBhc3NpZ25lZS5pc0xhenkoKVxuXHQvLyBUT0RPOiBhc3NlcnQoYXNzaWduZWUub3BUeXBlID09PSBudWxsKVxuXHQvLyBvciBUT0RPOiBBbGxvdyB0eXBlIGNoZWNrIG9uIGxhenkgdmFsdWU/XG5cdHZhbHVlID0gaXNMYXp5ID8gdmFsdWUgOiBtYXliZVdyYXBJbkNoZWNrQ29udGFpbnModmFsdWUsIG9wVHlwZSwgbmFtZSlcblx0Y29uc3QgdmFsID0gaXNMYXp5ICYmICF2YWx1ZUlzQWxyZWFkeUxhenkgPyBsYXp5V3JhcCh2YWx1ZSkgOiB2YWx1ZVxuXHRhc3NlcnQoaXNMYXp5IHx8ICF2YWx1ZUlzQWxyZWFkeUxhenkpXG5cdHJldHVybiBuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRm9yRGVjbGFyZUNhY2hlZChhc3NpZ25lZSksIHZhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlV3JhcEluQ2hlY2tDb250YWlucyhhc3QsIG9wVHlwZSwgbmFtZSkge1xuXHRyZXR1cm4gb3B0aW9ucy5pbmNsdWRlQ2hlY2tzKCkgJiYgb3BUeXBlICE9PSBudWxsID9cblx0XHRtc0NhbGwoJ2NoZWNrQ29udGFpbnMnLCB0MChvcFR5cGUpLCBhc3QsIG5ldyBMaXRlcmFsKG5hbWUpKSA6XG5cdFx0YXN0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb1Rocm93KHRocm93bikge1xuXHRyZXR1cm4gbmV3IFRocm93U3RhdGVtZW50KHRocm93biBpbnN0YW5jZW9mIFF1b3RlQWJzdHJhY3QgP1xuXHRcdG5ldyBOZXdFeHByZXNzaW9uKEdsb2JhbEVycm9yLCBbdDAodGhyb3duKV0pIDpcblx0XHR0MCh0aHJvd24pKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwaWxlTmFtZShuYW1lKSB7XG5cdHJldHVybiB0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgPyBuZXcgTGl0ZXJhbChuYW1lKSA6IHQwKG5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZW1iZXJTdHJpbmdPclZhbChvYmplY3QsIG1lbWJlck5hbWUpIHtcblx0cmV0dXJuIHR5cGVvZiBtZW1iZXJOYW1lID09PSAnc3RyaW5nJyA/XG5cdFx0bWVtYmVyKG9iamVjdCwgbWVtYmVyTmFtZSkgOlxuXHRcdG5ldyBNZW1iZXJFeHByZXNzaW9uKG9iamVjdCwgdDAobWVtYmVyTmFtZSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYXp5V3JhcCh2YWx1ZSkge1xuXHRyZXR1cm4gbXNDYWxsKCdsYXp5JywgbmV3IEFycm93RnVuY3Rpb25FeHByZXNzaW9uKFtdLCB2YWx1ZSkpXG59XG5cbmNvbnN0IElkTXMgPSBuZXcgSWRlbnRpZmllcignX21zJylcbmV4cG9ydCBmdW5jdGlvbiBtc0NhbGwobmFtZSwgLi4uYXJncykge1xuXHRyZXR1cm4gbmV3IENhbGxFeHByZXNzaW9uKG1lbWJlcihJZE1zLCBuYW1lKSwgYXJncylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zTWVtYmVyKG5hbWUpIHtcblx0cmV0dXJuIG1lbWJlcihJZE1zLCBuYW1lKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZURlc3RydWN0dXJlRGVjbGFyYXRvcnMoYXNzaWduZWVzLCBpc0xhenksIHZhbHVlLCBpc01vZHVsZSkge1xuXHRjb25zdCBpZCA9IGdldERlc3RydWN0dXJlZElkKClcblx0Y29uc3QgZGVzdHJ1Y3R1cmVkTmFtZSA9IGBfJCR7aWR9YFxuXHRjb25zdCBpZERlc3RydWN0dXJlZCA9IG5ldyBJZGVudGlmaWVyKGRlc3RydWN0dXJlZE5hbWUpXG5cdGNvbnN0IGRlY2xhcmF0b3JzID0gYXNzaWduZWVzLm1hcChhc3NpZ25lZSA9PiB7XG5cdFx0Y29uc3QgZ2V0ID0gZ2V0TWVtYmVyKGlkRGVzdHJ1Y3R1cmVkLCBhc3NpZ25lZS5uYW1lLCBpc0xhenksIGlzTW9kdWxlKVxuXHRcdHJldHVybiBtYWtlRGVjbGFyYXRvcihhc3NpZ25lZSwgZ2V0LCBpc0xhenkpXG5cdH0pXG5cdC8vIEdldHRpbmcgbGF6eSBtb2R1bGUgaXMgZG9uZSBieSBtcy5sYXp5R2V0TW9kdWxlLlxuXHRjb25zdCB2YWwgPSBpc0xhenkgJiYgIWlzTW9kdWxlID8gbGF6eVdyYXAodmFsdWUpIDogdmFsdWVcblx0cmV0dXJuIGNhdChuZXcgVmFyaWFibGVEZWNsYXJhdG9yKGlkRGVzdHJ1Y3R1cmVkLCB2YWwpLCBkZWNsYXJhdG9ycylcbn1cbmZ1bmN0aW9uIGdldE1lbWJlcihhc3RPYmplY3QsIGdvdE5hbWUsIGlzTGF6eSwgaXNNb2R1bGUpIHtcblx0cmV0dXJuIGlzTGF6eSA/XG5cdFx0bXNDYWxsKCdsYXp5UHJvcCcsIGFzdE9iamVjdCwgbmV3IExpdGVyYWwoZ290TmFtZSkpIDpcblx0XHRpc01vZHVsZSAmJiBvcHRpb25zLmluY2x1ZGVDaGVja3MoKSA/XG5cdFx0bXNDYWxsKCdnZXQnLCBhc3RPYmplY3QsIG5ldyBMaXRlcmFsKGdvdE5hbWUpKSA6XG5cdFx0bWVtYmVyKGFzdE9iamVjdCwgZ290TmFtZSlcbn1cblxuLyoqIFdyYXBzIGEgYmxvY2sgKHdpdGggYHJldHVybmAgc3RhdGVtZW50cyBpbiBpdCkgaW4gYW4gSUlGRS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja1dyYXAoYmxvY2spIHtcblx0Y29uc3QgdGh1bmsgPSBpc0luR2VuZXJhdG9yID9cblx0XHRuZXcgRnVuY3Rpb25FeHByZXNzaW9uKG51bGwsIFtdLCBibG9jaywgdHJ1ZSkgOlxuXHRcdG5ldyBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbihbXSwgYmxvY2spXG5cdGNvbnN0IGludm9rZSA9IG5ldyBDYWxsRXhwcmVzc2lvbih0aHVuaywgW10pXG5cdHJldHVybiBpc0luR2VuZXJhdG9yID8gbmV3IFlpZWxkRXhwcmVzc2lvbihpbnZva2UsIHRydWUpIDogaW52b2tlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBibG9ja1dyYXBJZkJsb2NrKHZhbHVlKSB7XG5cdGNvbnN0IGFzdCA9IHQwKHZhbHVlKVxuXHRyZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBCbG9jayA/IGJsb2NrV3JhcChhc3QpIDogYXN0XG59XG5cbi8qKiBXcmFwcyBhIHN0YXRlbWVudCBpbiBhbiBJSUZFIGlmIGl0cyBNc0FzdCBpcyBhIHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrV3JhcElmVmFsKGFzdCwgc3RhdGVtZW50KSB7XG5cdHJldHVybiB2ZXJpZnlSZXN1bHRzLmlzU3RhdGVtZW50KGFzdCkgPyBzdGF0ZW1lbnQgOiBibG9ja1dyYXAobmV3IEJsb2NrU3RhdGVtZW50KFtzdGF0ZW1lbnRdKSlcbn1cbiJdfQ==