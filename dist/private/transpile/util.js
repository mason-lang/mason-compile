(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../context', '../ast/Block', '../ast/Val', '../util', './esast-constants', './context', './transpileBlock', './transpileDo', './transpileVal'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Function_1 = require('esast/lib/Function');
    var Identifier_1 = require('esast/lib/Identifier');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var Block_1 = require('../ast/Block');
    var Val_1 = require('../ast/Val');
    var util_2 = require('../util');
    var esast_constants_1 = require('./esast-constants');
    var context_2 = require('./context');
    var transpileBlock_1 = require('./transpileBlock');
    var transpileDo_1 = require('./transpileDo');
    var transpileVal_1 = require('./transpileVal');
    function loc(expr, node) {
        util_2.assert(node.loc === undefined);
        node.loc = expr.loc;
        return node;
    }
    exports.loc = loc;
    function tLines(exprs) {
        const out = [];
        for (const expr of exprs) {
            const ast = transpileDo_1.default(expr);
            if (ast instanceof Array) for (const _ of ast) out.push(_);else out.push(ast);
        }
        return out;
    }
    exports.tLines = tLines;
    function accessLocalDeclare(localDeclare) {
        const id = idForDeclareCached(localDeclare);
        return localDeclare.isLazy ? msCall('unlazy', id) : new Identifier_1.default(id.name);
    }
    exports.accessLocalDeclare = accessLocalDeclare;
    function makeDeclare(localDeclare, val) {
        return new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(idForDeclareCached(localDeclare), val)]);
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
        return Op_1.opIf(!localDeclare.isLazy, () => Op_1.opMap(localDeclare.opType, type => new Statement_1.ExpressionStatement(msCall('checkInstance', transpileVal_1.default(type), accessLocalDeclare(localDeclare), new Expression_1.LiteralString(localDeclare.name)))));
    }
    exports.opTypeCheckForLocalDeclare = opTypeCheckForLocalDeclare;
    function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
        const name = assignee.name;
        const opType = assignee.opType;

        const isLazy = assignee.isLazy;
        value = isLazy ? value : maybeWrapInCheckInstance(value, opType, name);
        const val = isLazy && !valueIsAlreadyLazy ? lazyWrap(value) : value;
        util_2.assert(isLazy || !valueIsAlreadyLazy);
        return new Declaration_1.VariableDeclarator(idForDeclareCached(assignee), val);
    }
    exports.makeDeclarator = makeDeclarator;
    function maybeWrapInCheckInstance(ast, opType, name) {
        return context_1.options.checks && Op_1.nonNull(opType) ? msCall('checkInstance', transpileVal_1.default(opType), ast, new Expression_1.LiteralString(name)) : ast;
    }
    exports.maybeWrapInCheckInstance = maybeWrapInCheckInstance;
    function doThrow(thrown) {
        return new Statement_1.ThrowStatement(thrown instanceof Val_1.QuoteAbstract ? new Expression_1.NewExpression(esast_constants_1.GlobalError, [transpileVal_1.default(thrown)]) : transpileVal_1.default(thrown));
    }
    exports.doThrow = doThrow;
    function memberStringOrVal(object, memberName) {
        return typeof memberName === 'string' ? util_1.member(object, memberName) : new Expression_1.MemberExpressionComputed(object, transpileVal_1.default(memberName));
    }
    exports.memberStringOrVal = memberStringOrVal;
    function lazyWrap(value) {
        return msCall('lazy', new Function_1.ArrowFunctionExpression([], value));
    }
    exports.lazyWrap = lazyWrap;
    const IdMs = new Identifier_1.default('_ms');
    function msCall(name) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return new Expression_1.CallExpression(util_1.member(IdMs, name), args);
    }
    exports.msCall = msCall;
    function msMember(name) {
        return util_1.member(IdMs, name);
    }
    exports.msMember = msMember;
    function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
        const id = context_2.getDestructuredId();
        const destructuredName = `_$${ id }`;
        const idDestructured = new Identifier_1.default(destructuredName);
        const declarators = assignees.map(assignee => {
            const get = getMember(idDestructured, assignee.name, isLazy, isModule);
            return makeDeclarator(assignee, get, isLazy);
        });
        const val = isLazy && !isModule ? lazyWrap(value) : value;
        return util_2.cat(new Declaration_1.VariableDeclarator(idDestructured, val), declarators);
    }
    exports.makeDestructureDeclarators = makeDestructureDeclarators;
    function getMember(astObject, gotName, isLazy, isModule) {
        return isLazy ? msCall('lazyProp', astObject, new Expression_1.LiteralString(gotName)) : isModule && context_1.options.checks ? msCall('get', astObject, new Expression_1.LiteralString(gotName)) : util_1.member(astObject, gotName);
    }
    function blockWrap(block) {
        const thunk = context_2.funKind === 0 ? new Function_1.ArrowFunctionExpression([], block) : new Function_1.FunctionExpression(null, [], block, { generator: true });
        return callPreservingFunKind(new Expression_1.CallExpression(thunk, []));
    }
    exports.blockWrap = blockWrap;
    function blockWrapStatement(statement) {
        return blockWrap(new Statement_1.BlockStatement([statement]));
    }
    exports.blockWrapStatement = blockWrapStatement;
    function callFocusFun(value, calledOn) {
        const fun = context_2.funKind === 0 ? new Function_1.ArrowFunctionExpression([esast_constants_1.IdFocus], value) : new Function_1.FunctionExpression(null, [esast_constants_1.IdFocus], new Statement_1.BlockStatement([new Statement_1.ReturnStatement(value)]), { generator: true });
        return callPreservingFunKind(new Expression_1.CallExpression(fun, [calledOn]));
    }
    exports.callFocusFun = callFocusFun;
    function callPreservingFunKind(call) {
        return context_2.funKind === 0 ? call : new Expression_1.YieldDelegateExpression(call);
    }
    function blockWrapIfBlock(value) {
        return value instanceof Block_1.default ? blockWrap(transpileBlock_1.default(value)) : transpileVal_1.default(value);
    }
    exports.blockWrapIfBlock = blockWrapIfBlock;
    function focusFun(value) {
        return new Function_1.ArrowFunctionExpression([esast_constants_1.IdFocus], value);
    }
    exports.focusFun = focusFun;
    function plainLet(identifier, value) {
        return new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(identifier, value)]);
    }
    exports.plainLet = plainLet;
});
//# sourceMappingURL=util.js.map
