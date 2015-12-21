(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', 'op/Op', '../context', '../MsAst', '../util', './ast-constants', './context'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var MsAst_1 = require('../MsAst');
    var util_2 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_2 = require('./context');
    function t0(expr) {
        return util_1.loc(expr.transpile(), expr.loc);
    }
    exports.t0 = t0;
    function t1(expr, arg) {
        return util_1.loc(expr.transpile(arg), expr.loc);
    }
    exports.t1 = t1;
    function t2(expr, arg, arg2) {
        return util_1.loc(expr.transpile(arg, arg2), expr.loc);
    }
    exports.t2 = t2;
    function t3(expr, arg, arg2, arg3) {
        return util_1.loc(expr.transpile(arg, arg2, arg3), expr.loc);
    }
    exports.t3 = t3;
    function tLines(exprs) {
        const out = [];
        for (const expr of exprs) {
            const ast = expr.transpile();
            if (ast instanceof Array) for (const _ of ast) out.push(util_1.toLineContent(_));else out.push(util_1.loc(util_1.toLineContent(ast), expr.loc));
        }
        return out;
    }
    exports.tLines = tLines;
    function accessLocalDeclare(localDeclare) {
        const id = idForDeclareCached(localDeclare);
        return localDeclare.isLazy ? msCall('unlazy', id) : new ast_1.Identifier(id.name);
    }
    exports.accessLocalDeclare = accessLocalDeclare;
    function makeDeclare(localDeclare, val) {
        return new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(idForDeclareCached(localDeclare), val)]);
    }
    exports.makeDeclare = makeDeclare;
    const declareToId = new WeakMap();
    function idForDeclareCached(localDeclare) {
        let _ = declareToId.get(localDeclare);
        if (_ === undefined) {
            _ = util_1.identifier(localDeclare.name);
            declareToId.set(localDeclare, _);
        }
        return _;
    }
    exports.idForDeclareCached = idForDeclareCached;
    function opTypeCheckForLocalDeclare(localDeclare) {
        return Op_1.opIf(!localDeclare.isLazy, () => Op_1.opMap(localDeclare.opType, type => new ast_1.ExpressionStatement(msCall('checkInstance', t0(type), accessLocalDeclare(localDeclare), new ast_1.LiteralString(localDeclare.name)))));
    }
    exports.opTypeCheckForLocalDeclare = opTypeCheckForLocalDeclare;
    function throwErrorFromString(message) {
        return new ast_1.ThrowStatement(new ast_1.NewExpression(new ast_1.Identifier('Error'), [new ast_1.LiteralString(message)]));
    }
    exports.throwErrorFromString = throwErrorFromString;
    function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
        const name = assignee.name;
        const opType = assignee.opType;

        const isLazy = assignee.isLazy;
        value = isLazy ? value : maybeWrapInCheckInstance(value, opType, name);
        const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value;
        util_2.assert(isLazy || !valueIsAlreadyLazy);
        return new ast_1.VariableDeclarator(idForDeclareCached(assignee), val);
    }
    exports.makeDeclarator = makeDeclarator;
    function maybeWrapInCheckInstance(ast, opType, name) {
        return context_1.options.checks && Op_1.nonNull(opType) ? msCall('checkInstance', t0(opType), ast, new ast_1.LiteralString(name)) : ast;
    }
    exports.maybeWrapInCheckInstance = maybeWrapInCheckInstance;
    function doThrow(thrown) {
        return new ast_1.ThrowStatement(thrown instanceof MsAst_1.QuoteAbstract ? new ast_1.NewExpression(ast_constants_1.GlobalError, [t0(thrown)]) : t0(thrown));
    }
    exports.doThrow = doThrow;
    function transpileName(name) {
        return typeof name === 'string' ? new ast_1.LiteralString(name) : t0(name);
    }
    exports.transpileName = transpileName;
    function memberStringOrVal(object, memberName) {
        return typeof memberName === 'string' ? util_1.member(object, memberName) : new ast_1.MemberExpressionComputed(object, t0(memberName));
    }
    exports.memberStringOrVal = memberStringOrVal;
    function lazyWrap(value) {
        return msCall('lazy', new ast_1.ArrowFunctionExpression([], value));
    }
    exports.lazyWrap = lazyWrap;
    const IdMs = new ast_1.Identifier('_ms');
    function msCall(name) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return new ast_1.CallExpression(util_1.member(IdMs, name), args);
    }
    exports.msCall = msCall;
    function msMember(name) {
        return util_1.member(IdMs, name);
    }
    exports.msMember = msMember;
    function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
        const id = context_2.getDestructuredId();
        const destructuredName = `_$${ id }`;
        const idDestructured = new ast_1.Identifier(destructuredName);
        const declarators = assignees.map(assignee => {
            const get = getMember(idDestructured, assignee.name, isLazy, isModule);
            return makeDeclarator(assignee, get, isLazy);
        });
        const val = isLazy && !isModule ? lazyWrap(value) : value;
        return util_2.cat(new ast_1.VariableDeclarator(idDestructured, val), declarators);
    }
    exports.makeDestructureDeclarators = makeDestructureDeclarators;
    function getMember(astObject, gotName, isLazy, isModule) {
        return isLazy ? msCall('lazyProp', astObject, new ast_1.LiteralString(gotName)) : isModule && context_1.options.checks ? msCall('get', astObject, new ast_1.LiteralString(gotName)) : util_1.member(astObject, gotName);
    }
    function blockWrap(block) {
        const thunk = context_2.funKind === 0 ? new ast_1.ArrowFunctionExpression([], block) : new ast_1.FunctionExpression(null, [], block, { generator: true });
        return callPreservingFunKind(new ast_1.CallExpression(thunk, []));
    }
    exports.blockWrap = blockWrap;
    function callFocusFun(value, calledOn) {
        const fun = context_2.funKind === 0 ? new ast_1.ArrowFunctionExpression([ast_constants_1.IdFocus], value) : new ast_1.FunctionExpression(null, [ast_constants_1.IdFocus], new ast_1.BlockStatement([new ast_1.ReturnStatement(value)]), { generator: true });
        return callPreservingFunKind(new ast_1.CallExpression(fun, [calledOn]));
    }
    exports.callFocusFun = callFocusFun;
    function callPreservingFunKind(call) {
        return context_2.funKind === 0 ? call : new ast_1.YieldExpression(call, true);
    }
    function blockWrapIfBlock(value) {
        return value instanceof MsAst_1.Block ? blockWrap(t0(value)) : t0(value);
    }
    exports.blockWrapIfBlock = blockWrapIfBlock;
    function blockWrapIfVal(ast, statement) {
        return context_2.verifyResults.isStatement(ast) ? statement : blockWrap(new ast_1.BlockStatement(util_2.toArray(statement)));
    }
    exports.blockWrapIfVal = blockWrapIfVal;
    function focusFun(value) {
        return new ast_1.ArrowFunctionExpression([ast_constants_1.IdFocus], value);
    }
    exports.focusFun = focusFun;
    function plainLet(identifier, value) {
        return new ast_1.VariableDeclaration('let', [new ast_1.VariableDeclarator(identifier, value)]);
    }
    exports.plainLet = plainLet;
});
//# sourceMappingURL=util.js.map
