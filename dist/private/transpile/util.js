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
	exports.callFocusFun = callFocusFun;
	exports.blockWrapIfBlock = blockWrapIfBlock;
	exports.blockWrapIfVal = blockWrapIfVal;
	exports.focusFun = focusFun;

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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOltdfQ==