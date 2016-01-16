(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../ast/locals', '../context', '../util', './context', './ms', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Declaration_1 = require('esast/lib/Declaration');
    var Expression_1 = require('esast/lib/Expression');
    var Identifier_1 = require('esast/lib/Identifier');
    var Literal_1 = require('esast/lib/Literal');
    var Statement_1 = require('esast/lib/Statement');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var locals_1 = require('../ast/locals');
    var context_1 = require('../context');
    var util_2 = require('../util');
    var context_2 = require('./context');
    var ms_1 = require('./ms');
    var transpileVal_1 = require('./transpileVal');
    var util_3 = require('./util');
    function transpileLocalDeclare(_) {
        return util_3.loc(_, new Identifier_1.default(idForDeclareCached(_).name));
    }
    exports.transpileLocalDeclare = transpileLocalDeclare;
    function transpileLocalAccessNoLoc(_) {
        const name = _.name;

        if (name === 'this') return new Identifier_1.default('_this');else {
            const ld = context_2.verifyResults.localDeclareForAccess(_);
            return ld === undefined ? util_1.identifier(name) : accessLocalDeclare(ld);
        }
    }
    exports.transpileLocalAccessNoLoc = transpileLocalAccessNoLoc;
    function accessLocalDeclare(localDeclare) {
        const id = idForDeclareCached(localDeclare);
        return localDeclare.isLazy ? ms_1.msCall('unlazy', id) : new Identifier_1.default(id.name);
    }
    exports.accessLocalDeclare = accessLocalDeclare;
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
        return Op_1.opIf(!localDeclare.isLazy, () => Op_1.opMap(localDeclare.opType, type => new Statement_1.ExpressionStatement(ms_1.msCall('checkInstance', transpileVal_1.default(type), accessLocalDeclare(localDeclare), new Literal_1.LiteralString(localDeclare.name)))));
    }
    exports.opTypeCheckForLocalDeclare = opTypeCheckForLocalDeclare;
    function makeDeclare(localDeclare, val) {
        return new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(idForDeclareCached(localDeclare), val)]);
    }
    exports.makeDeclare = makeDeclare;
    function plainLet(identifier, value) {
        return new Declaration_1.VariableDeclarationLet([new Declaration_1.VariableDeclarator(identifier, value)]);
    }
    exports.plainLet = plainLet;
    function plainLetForDeclare(declare, value) {
        return plainLet(transpileLocalDeclare(declare), value);
    }
    exports.plainLetForDeclare = plainLetForDeclare;
    function makeDeclarator(assignee, value, valueIsAlreadyLazy) {
        const name = assignee.name;
        const opType = assignee.opType;

        const isLazy = assignee.isLazy;
        value = isLazy ? value : util_3.maybeWrapInCheckInstance(value, opType, name);
        const val = isLazy && !valueIsAlreadyLazy ? util_3.lazyWrap(value) : value;
        util_2.assert(isLazy || !valueIsAlreadyLazy);
        return new Declaration_1.VariableDeclarator(idForDeclareCached(assignee), val);
    }
    exports.makeDeclarator = makeDeclarator;
    function makeDestructureDeclarators(assignees, isLazy, value, isModule) {
        const id = context_2.getDestructuredId();
        const destructuredName = `_$${ id }`;
        const idDestructured = new Identifier_1.default(destructuredName);
        const declarators = assignees.map(assignee => {
            const get = getMember(idDestructured, assignee.name, isLazy, isModule);
            return makeDeclarator(assignee, get, isLazy);
        });
        const val = isLazy && !isModule ? util_3.lazyWrap(value) : value;
        return util_2.cat(new Declaration_1.VariableDeclarator(idDestructured, val), declarators);
    }
    exports.makeDestructureDeclarators = makeDestructureDeclarators;
    function getMember(object, gotName, isLazy, isModule) {
        return isLazy ? ms_1.msCall('lazyProp', object, new Literal_1.LiteralString(gotName)) : isModule && context_1.compileOptions.checks ? ms_1.msCall('get', object, new Literal_1.LiteralString(gotName)) : util_1.member(object, gotName);
    }
    function transpileAssignNoLoc(_) {
        if (_ instanceof locals_1.AssignSingle) return transpileAssignSingleNoLoc(_);else if (_ instanceof locals_1.AssignDestructure) return transpileAssignDestructureNoLoc(_);else throw new Error(_.constructor.name);
    }
    exports.transpileAssignNoLoc = transpileAssignNoLoc;
    function transpileAssignSingle(_) {
        return util_3.loc(_, transpileAssignSingleNoLoc(_));
    }
    exports.transpileAssignSingle = transpileAssignSingle;
    function transpileAssignSingleNoLoc(_ref, valWrap) {
        let assignee = _ref.assignee;
        let value = _ref.value;

        const val = valWrap === undefined ? transpileVal_1.default(value) : valWrap(transpileVal_1.default(value));
        return new Declaration_1.VariableDeclarationLet([makeDeclarator(assignee, val, false)]);
    }
    exports.transpileAssignSingleNoLoc = transpileAssignSingleNoLoc;
    function transpileAssignDestructureNoLoc(_ref2) {
        let assignees = _ref2.assignees;
        let kind = _ref2.kind;
        let value = _ref2.value;

        return new Declaration_1.VariableDeclarationLet(makeDestructureDeclarators(assignees, kind === 1, transpileVal_1.default(value), false));
    }
    function transpileLocalMutateNoLoc(_ref3) {
        let name = _ref3.name;
        let value = _ref3.value;

        return new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', util_1.identifier(name), transpileVal_1.default(value)));
    }
    exports.transpileLocalMutateNoLoc = transpileLocalMutateNoLoc;
});
//# sourceMappingURL=transpileLocals.js.map
