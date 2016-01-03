var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/Class', '../ast/Fun', '../context', '../token/Keyword', './parseBlock', './parseExpr', './parseFun', './parseMethodImpls', './parseLocalDeclares', './tryTakeComment'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Op_1 = require('op/Op');
    var Class_1 = require('../ast/Class');
    var Fun_1 = require('../ast/Fun');
    var context_1 = require('../context');
    var Keyword_1 = require('../token/Keyword');
    var parseBlock_1 = require('./parseBlock');
    var parseExpr_1 = require('./parseExpr');
    var parseFun_1 = require('./parseFun');
    var parseMethodImpls_1 = require('./parseMethodImpls');
    var parseLocalDeclares_1 = require('./parseLocalDeclares');
    var tryTakeComment_1 = require('./tryTakeComment');
    function parseClass(tokens) {
        var _parseBlock_1$beforeA = parseBlock_1.beforeAndOpBlock(tokens);

        var _parseBlock_1$beforeA2 = _slicedToArray(_parseBlock_1$beforeA, 2);

        const before = _parseBlock_1$beforeA2[0];
        const opBlock = _parseBlock_1$beforeA2[1];

        var _parseClassHeader = parseClassHeader(before);

        const opFields = _parseClassHeader.opFields;
        const opSuperClass = _parseClassHeader.opSuperClass;
        const traits = _parseClassHeader.traits;

        var _Op_1$caseOp = Op_1.caseOp(opBlock, _ => {
            var _tryTakeComment_1$def = tryTakeComment_1.default(_);

            var _tryTakeComment_1$def2 = _slicedToArray(_tryTakeComment_1$def, 2);

            const opComment = _tryTakeComment_1$def2[0];
            const rest = _tryTakeComment_1$def2[1];

            if (rest.isEmpty()) return [opComment, null, [], null, []];

            var _parseMethodImpls_1$o = parseMethodImpls_1.opTakeDo(rest);

            var _parseMethodImpls_1$o2 = _slicedToArray(_parseMethodImpls_1$o, 2);

            const opDo = _parseMethodImpls_1$o2[0];
            const rest2 = _parseMethodImpls_1$o2[1];

            if (rest2.isEmpty()) return [opComment, opDo, [], null, []];

            var _parseMethodImpls_1$t = parseMethodImpls_1.takeStatics(rest2);

            var _parseMethodImpls_1$t2 = _slicedToArray(_parseMethodImpls_1$t, 2);

            const statics = _parseMethodImpls_1$t2[0];
            const rest3 = _parseMethodImpls_1$t2[1];

            if (rest3.isEmpty()) return [opComment, opDo, statics, null, []];

            var _opTakeConstructor = opTakeConstructor(rest3);

            var _opTakeConstructor2 = _slicedToArray(_opTakeConstructor, 2);

            const opConstructor = _opTakeConstructor2[0];
            const rest4 = _opTakeConstructor2[1];

            return [opComment, opDo, statics, opConstructor, parseMethodImpls_1.default(rest4)];
        }, () => [null, null, [], null, []]);

        var _Op_1$caseOp2 = _slicedToArray(_Op_1$caseOp, 5);

        const opComment = _Op_1$caseOp2[0];
        const opDo = _Op_1$caseOp2[1];
        const statics = _Op_1$caseOp2[2];
        const opConstructor = _Op_1$caseOp2[3];
        const methods = _Op_1$caseOp2[4];

        return new Class_1.default(tokens.loc, opFields, opSuperClass, traits, opComment, opDo, statics, opConstructor, methods);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseClass;
    function parseClassHeader(tokens) {
        var _tokens$getKeywordSec = tokens.getKeywordSections([99, 148]);

        var _tokens$getKeywordSec2 = _slicedToArray(_tokens$getKeywordSec, 2);

        const fieldsTokens = _tokens$getKeywordSec2[0];

        var _tokens$getKeywordSec3 = _slicedToArray(_tokens$getKeywordSec2[1], 2);

        const extendsTokens = _tokens$getKeywordSec3[0];
        const traitTokens = _tokens$getKeywordSec3[1];

        return {
            opFields: Op_1.opIf(!fieldsTokens.isEmpty(), () => fieldsTokens.map(_ => {
                var _parseLocalDeclares_ = parseLocalDeclares_1.parseLocalParts(_);

                const name = _parseLocalDeclares_.name;
                const opType = _parseLocalDeclares_.opType;
                const kind = _parseLocalDeclares_.kind;

                context_1.check(kind === 0, _.loc, _ => _.todoLazyField);
                return new Class_1.Field(_.loc, name, opType);
            })),
            opSuperClass: Op_1.opMap(extendsTokens, parseExpr_1.default),
            traits: Op_1.caseOp(traitTokens, parseExpr_1.parseExprParts, () => [])
        };
    }
    function opTakeConstructor(tokens) {
        const line = tokens.headSlice();
        return Keyword_1.isKeyword(90, line.head()) ? [parseConstructor(line.tail()), tokens.tail()] : [null, tokens];
    }
    function parseConstructor(tokens) {
        var _parseFun_1$funArgsAn = parseFun_1.funArgsAndBlock(tokens, false, true);

        const args = _parseFun_1$funArgsAn.args;
        const memberArgs = _parseFun_1$funArgsAn.memberArgs;
        const opRestArg = _parseFun_1$funArgsAn.opRestArg;
        const block = _parseFun_1$funArgsAn.block;

        const fun = new Fun_1.default(tokens.loc, args, opRestArg, block, { isThisFun: true, isDo: true });
        return new Class_1.Constructor(tokens.loc, fun, memberArgs);
    }
});
//# sourceMappingURL=parseClass.js.map
